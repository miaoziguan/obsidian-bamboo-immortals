/**
 * NoiseGenerator - 白噪音音效生成算法（优化版）
 * 使用更自然的算法生成4种内置音效
 */
export const NoiseGenerator = {
    _cache: new Map(),

    // 生成（或从缓存获取）音效音频缓冲区
    generate(typeId, ctx) {
        if (this._cache.has(typeId)) return this._cache.get(typeId);

        const bufferSize = 5 * ctx.sampleRate;  // 5秒循环
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

                for (let start = Math.floor(Math.random() * sr); start + pulseLen < len; start += pulseInterval * (0.8 + Math.random() * 0.4)) {
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
