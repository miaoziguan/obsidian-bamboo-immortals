/**
 * NoiseGenerator - 白噪音音效生成算法（优化版）
 * 使用更自然的算法生成4种内置音效
 */
export const NoiseGenerator = {
    _cache: new Map(),
    _cacheCtx: null,

    _worker: null,         // 复用的 Worker（生成很快，常驻避免反复创建）
    _workerBroken: false,  // Worker 不可用（CSP 禁 blob: 等）→ 永久走同步降级
    _pending: new Map(),   // key -> Promise，合并同一音效的并发生成请求
    _tokenSeq: 0,

    BUFFER_SEC: 5,         // 循环长度（秒）

    /**
     * 生成音效（Worker 异步，主线程零阻塞）。
     *
     * 背景：每个音效要算 5 秒 × 采样率（44.1kHz 下约 22 万采样），
     * crickets / campfire 这类还要跑好几趟全量遍历，合计近百万次循环。
     * 同步跑会一次性占住主线程几十毫秒，首次播放某个音效时肉眼可见地卡一下。
     * 放进 Worker 后这段计算完全不在主线程上，切歌、动效都不受影响。
     *
     * Worker 创建失败时（某些环境禁止 blob: Worker）自动降级为同步生成。
     * @returns {Promise<AudioBuffer>}
     */
    generateAsync(typeId, ctx) {
        this._syncCacheCtx(ctx);
        const hit = this._cache.get(typeId);
        if (hit) return Promise.resolve(hit);

        // 合并并发生成：快速连点切歌时，同一音效只算一次
        const key = typeId + '@' + ctx.sampleRate;
        const pending = this._pending.get(key);
        if (pending) return pending;

        const task = this._renderInWorker(typeId, ctx)
            .then((buffer) => {
                // 生成期间 context 若已更换，这个 buffer 属于旧 context，不能入缓存
                if (this._cacheCtx === ctx) this._cache.set(typeId, buffer);
                return buffer;
            })
            .catch((err) => {
                console.warn('[NoiseGenerator] 异步生成失败，回退同步生成:', err && err.message);
                return this.generate(typeId, ctx);
            })
            .then((buffer) => {
                this._pending.delete(key);
                return buffer;
            });

        this._pending.set(key, task);
        return task;
    },

    // 生成（同步，缓存命中直接返回；同时作为 Worker 不可用时的降级路径）
    generate(typeId, ctx) {
        this._syncCacheCtx(ctx);
        const hit = this._cache.get(typeId);
        if (hit) return hit;

        const bufferSize = this.BUFFER_SEC * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        const sr = ctx.sampleRate;

        // 调用对应的生成算法
        const generator = this._GENERATORS[typeId];
        if (generator) {
            generator(data, bufferSize, sr);
        } else {
            // 默认：纯白噪声
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.4;
            }
        }

        this._cache.set(typeId, buffer);
        return buffer;
    },

    // AudioBuffer 与创建它的 AudioContext 绑定，不能跨 context 复用。
    // context 一旦重建（卸载前 close 过、或 webview 复用），旧缓存必须整体丢弃，
    // 否则把旧 context 的 buffer 塞给新 context 会播放失败。
    _syncCacheCtx(ctx) {
        if (this._cacheCtx !== ctx) {
            this._cache.clear();
            this._cacheCtx = ctx;
        }
    },

    // 在 Worker 里算出采样数据，回到主线程包装成 AudioBuffer
    _renderInWorker(typeId, ctx) {
        const worker = this._getWorker();
        if (!worker) return Promise.reject(new Error('worker unavailable'));

        const sampleRate = ctx.sampleRate;
        const bufferSize = this.BUFFER_SEC * sampleRate;
        const token = String(++this._tokenSeq);

        const data = new Promise((resolve, reject) => {
            let timer = null;
            const cleanup = () => {
                if (timer) { clearTimeout(timer); timer = null; }
                worker.removeEventListener('message', onMsg);
                worker.removeEventListener('error', onErr);
            };
            const onMsg = (e) => {
                const m = e.data;
                if (!m || m.token !== token) return;
                cleanup();
                if (m.ok) resolve(m.data);
                else reject(new Error(m.error || '生成失败'));
            };
            const onErr = (e) => {
                cleanup();
                reject(new Error((e && e.message) || 'worker error'));
            };
            worker.addEventListener('message', onMsg);
            worker.addEventListener('error', onErr);
            // 兜底超时：Worker 异常不应让播放流程永远悬着，超时后走同步降级
            timer = setTimeout(() => {
                cleanup();
                reject(new Error('生成超时'));
            }, 10000);
            worker.postMessage({ typeId, sampleRate, bufferSize, token });
        });

        return data.then((samples) => {
            const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
            buffer.copyToChannel(samples, 0);
            return buffer;
        });
    },

    _getWorker() {
        if (this._workerBroken) return null;
        if (this._worker) return this._worker;
        if (typeof Worker === 'undefined' || typeof Blob === 'undefined' ||
            typeof URL === 'undefined' || !URL.createObjectURL) {
            this._workerBroken = true;
            return null;
        }
        try {
            const url = URL.createObjectURL(
                new Blob([this._buildWorkerCode()], { type: 'application/javascript' })
            );
            this._worker = new Worker(url);
            // Worker 已取走脚本，URL 可以立即释放
            URL.revokeObjectURL(url);
            return this._worker;
        } catch (e) {
            console.warn('[NoiseGenerator] Worker 不可用，白噪音改为同步生成:', e && e.message);
            this._workerBroken = true;
            return null;
        }
    },

    /**
     * 组装 Worker 脚本。
     * 关键：四个 DSP 算法用 Function.prototype.toString() 序列化后内联进 Worker，
     * 所以算法仍然只有下面 _GENERATORS 这一份，不需要在 Worker 里重复维护一份
     * （改算法时两边不会漏同步）。这些算法都是纯函数，只依赖入参和 Math。
     */
    _buildWorkerCode() {
        const entries = Object.keys(this._GENERATORS).map((k) => {
            const src = this._GENERATORS[k].toString().trim();
            // 方法简写（bamboo(a, b) { ... }）序列化出来不是表达式，
            // 直接放在 `"bamboo": ` 后面是语法错误，必须补成函数表达式。
            // （若本来就是 function 形式则原样使用）
            const expr = /^function\b/.test(src) ? src : 'function ' + src;
            return JSON.stringify(k) + ': ' + expr + ',';
        }).join('\n');
        return [
            'var GENERATORS = {',
            entries,
            '};',
            'self.onmessage = function (e) {',
            '  var d = e.data || {};',
            '  try {',
            '    var gen = GENERATORS[d.typeId];',
            '    if (!gen) throw new Error("unknown noise type: " + d.typeId);',
            '    var data = new Float32Array(d.bufferSize);',
            '    gen(data, d.bufferSize, d.sampleRate);',
            // transfer ArrayBuffer：零拷贝回传，避免再复制 20 多万个浮点数
            '    self.postMessage({ token: d.token, ok: true, data: data }, [data.buffer]);',
            '  } catch (err) {',
            '    self.postMessage({ token: d.token, ok: false, error: (err && err.message) || String(err) });',
            '  }',
            '};'
        ].join('\n');
    },

    // 优化后的音效生成算法
    _GENERATORS: {
        // 竹林：风声 + 竹叶摩擦 + 偶尔的鸟鸣
        bamboo(data, len, sr) {
            // 基础风声（低频噪声）
            let windPhase = 0;
            for (let i = 0; i < len; i++) {
                const t = i / sr;
                // 风声强度变化（慢速LFO）
                const windLfo = 0.5 + 0.5 * Math.sin(t * 0.5) * Math.sin(t * 0.3);
                data[i] = (Math.random() * 2 - 1) * 0.25 * windLfo;
                windPhase++;
            }

            // 竹叶摩擦声（高频瞬态）
            for (let pos = 0; pos < len; pos += Math.floor(sr * (0.1 + Math.random() * 0.3))) {
                const rustleLen = Math.floor(sr * (0.03 + Math.random() * 0.05));
                const intensity = 0.3 + Math.random() * 0.4;
                for (let j = 0; j < rustleLen && pos + j < len; j++) {
                    const env = Math.sin(Math.PI * j / rustleLen) * intensity;
                    data[pos + j] += (Math.random() * 2 - 1) * env;
                }
            }

            // 偶尔的鸟鸣（高频短脉冲）
            for (let i = 0; i < 3; i++) {
                const birdPos = Math.floor(Math.random() * (len - sr * 0.5));
                const birdFreq = 2000 + Math.random() * 2000;
                const birdLen = Math.floor(sr * 0.05);
                for (let j = 0; j < birdLen && birdPos + j < len; j++) {
                    const env = Math.sin(Math.PI * j / birdLen) * 0.08;
                    data[birdPos + j] += Math.sin(2 * Math.PI * birdFreq * j / sr) * env;
                }
            }

            // 低频滤波（模拟竹林的吸音效果）
            let last = 0;
            for (let i = 0; i < len; i++) {
                data[i] = data[i] * 0.7 + last * 0.3;
                last = data[i];
            }
        },

        // 溪流：流水声 + 随机水滴 + 立体声效果
        stream(data, len, sr) {
            // 基础流水声（滤波后的噪声）
            for (let i = 0; i < len; i++) {
                const t = i / sr;
                // 水流强度变化
                const flowLfo = 0.6 + 0.4 * Math.sin(t * 0.8) * Math.sin(t * 0.5);
                data[i] = (Math.random() * 2 - 1) * 0.4 * flowLfo;
            }

            // 应用低通滤波（模拟水流的柔和感）
            let filtered = 0;
            for (let i = 0; i < len; i++) {
                filtered = filtered * 0.95 + data[i] * 0.05;
                data[i] = filtered;
            }

            // 水滴声（高频瞬态）
            for (let pos = 0; pos < len; pos += Math.floor(sr * (0.2 + Math.random() * 0.8))) {
                if (Math.random() < 0.4) {  // 40% 概率生成水滴
                    const dropLen = Math.floor(sr * 0.02);
                    const dropFreq = 3000 + Math.random() * 4000;
                    for (let j = 0; j < dropLen && pos + j < len; j++) {
                        const env = Math.exp(-j / (dropLen * 0.3)) * 0.2;
                        data[pos + j] += Math.sin(2 * Math.PI * dropFreq * j / sr) * env;
                    }
                }
            }

            // 水流的"咕噜"声（中低频）
            for (let i = 0; i < 5; i++) {
                const gurglePos = Math.floor(Math.random() * (len - sr * 0.3));
                const gurgleLen = Math.floor(sr * 0.15);
                const gurgleFreq = 100 + Math.random() * 150;
                for (let j = 0; j < gurgleLen && gurglePos + j < len; j++) {
                    const env = Math.sin(Math.PI * j / gurgleLen) * 0.15;
                    data[gurglePos + j] += Math.sin(2 * Math.PI * gurgleFreq * j / sr) * env;
                }
            }
        },

        // 夜虫：多种虫鸣模式 + 随机间隔 + 立体声效果
        crickets(data, len, sr) {
            // 基础背景噪声（非常安静）
            for (let i = 0; i < len; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.05;
            }

            // 虫鸣声（多种频率 + 随机间隔）
            const cricketPatterns = [
                { freq: 3800, interval: 0.15, count: 3 },  // 蟋蟀A
                { freq: 4200, interval: 0.18, count: 4 },  // 蟋蟀B
                { freq: 3500, interval: 0.22, count: 2 },  // 蛐蛐
                { freq: 4500, interval: 0.12, count: 5 },  // 蝈蝈
            ];

            cricketPatterns.forEach(pattern => {
                const pulseInterval = Math.floor(sr * pattern.interval);
                const pulseLen = Math.floor(sr * 0.035);
                const freq = pattern.freq + (Math.random() - 0.5) * 200;  // 频率微调

                // start 必须保持整数！pulseInterval * (0.8~1.2) 会产生小数，
                // 一旦 start 变成浮点，下面的 data[offset + j] 就是浮点索引，
                // V8 对 TypedArray 浮点索引走慢路径 —— 实测整个算法会因此从
                // ~30ms 劣化到 ~370ms，首次播放「夜虫」时主线程明显卡住。
                for (let start = Math.floor(Math.random() * sr); start + pulseLen < len; start += Math.floor(pulseInterval * (0.8 + Math.random() * 0.4))) {
                    const count = pattern.count + Math.floor(Math.random() * 2);
                    for (let n = 0; n < count; n++) {
                        const offset = start + n * Math.floor(sr * 0.01);
                        if (offset + pulseLen >= len) break;
                        for (let j = 0; j < pulseLen; j++) {
                            const env = Math.sin(Math.PI * j / pulseLen) * 0.2;
                            data[offset + j] += Math.sin(2 * Math.PI * freq * j / sr) * env;
                        }
                    }
                    start += Math.floor((Math.random() - 0.5) * sr * 0.3);
                }
            });

            // 偶尔的"唧唧"声（更长的高频音）
            for (let i = 0; i < 2; i++) {
                const chirpPos = Math.floor(Math.random() * (len - sr * 0.5));
                const chirpLen = Math.floor(sr * 0.4);
                const chirpFreq = 5000 + Math.random() * 1000;
                for (let j = 0; j < chirpLen && chirpPos + j < len; j++) {
                    const freqMod = chirpFreq + Math.sin(2 * Math.PI * j / sr * 10) * 500;
                    const env = Math.sin(Math.PI * j / chirpLen) * 0.1;
                    data[chirpPos + j] += Math.sin(2 * Math.PI * freqMod * j / sr) * env;
                }
            }

            // 四组虫鸣叠加后峰值会明显超过 1.0（实测 1.34），直接播放会削波破音。
            // 这里只做整体缩放、不改波形，把峰值压回 0.95 以内。
            let peak = 0;
            for (let i = 0; i < len; i++) {
                const a = Math.abs(data[i]);
                if (a > peak) peak = a;
            }
            if (peak > 0.95) {
                const g = 0.95 / peak;
                for (let i = 0; i < len; i++) data[i] *= g;
            }
        },

        // 篝火：噼啪声 + 低频嗡嗡声 + 火焰摇曳
        campfire(data, len, sr) {
            // 基础火焰声（低频噪声 + 滤波）
            let rolling = 0;
            const smooth = 0.98;
            for (let i = 0; i < len; i++) {
                const raw = (Math.random() * 2 - 1) * 0.5;
                rolling = rolling * smooth + raw * (1 - smooth);
                data[i] = rolling * 0.6;
            }

            // 火焰摇曳效果（LFO调制）
            for (let i = 0; i < len; i++) {
                const t = i / sr;
                const flicker = 1 + 0.3 * Math.sin(t * 3.5) * Math.sin(t * 2.1);
                data[i] *= flicker;
            }

            // 木材噼啪声（随机高频瞬态）
            const crackleCount = 15 + Math.floor(Math.random() * 10);  // 15-25次噼啪
            for (let n = 0; n < crackleCount; n++) {
                const pos = Math.floor(Math.random() * (len - sr * 0.05));
                const crackLen = Math.floor(sr * (0.003 + Math.random() * 0.015));  // 3-18ms
                const crackAmp = 0.3 + Math.random() * 0.5;
                for (let j = 0; j < crackLen && pos + j < len; j++) {
                    const env = Math.exp(-j / (crackLen * 0.2)) * crackAmp;
                    data[pos + j] += (Math.random() * 2 - 1) * env;
                }
            }

            // 低频嗡嗡声（模拟燃烧的低频共振）
            for (let i = 0; i < len; i++) {
                const t = i / sr;
                const humFreq = 60 + Math.sin(t * 0.5) * 10;  // 60Hz ± 10Hz
                data[i] += Math.sin(2 * Math.PI * humFreq * i / sr) * 0.08;
            }

            // 最后的柔化处理（让声音更温暖）
            let last = 0;
            for (let i = 0; i < len; i++) {
                data[i] = data[i] * 0.8 + last * 0.2;
                last = data[i];
            }
        }
    }
};

window.NoiseGenerator = NoiseGenerator;
