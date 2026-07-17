"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BambooReviewPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian13 = require("obsidian");

// src/views/DailyReviewView.ts
var import_obsidian4 = require("obsidian");

// src/host/AppHost.ts
var import_obsidian = require("obsidian");

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// src/host/AppHost.ts
var _AppHost = class _AppHost {
  constructor(app, pluginDir, version) {
    this.blobUrls = [];
    this.repo = "miaoziguan/obsidian-bamboo-immortals";
    this.app = app;
    this.webappDir = (0, import_obsidian.normalizePath)(`${pluginDir}/webapp`);
    this.version = version;
  }
  /**
   * 后台预拉取：插件 onload 时调用，提前把缺失的 webapp 下载并解压到插件目录。
   * 正常安装（webapp/ 已随插件分发）时仅做一次存在性检查，几乎零开销。
   * 失败仅告警（不抛出），真正打开视图时 buildBlobUrl 会再次尝试；
   * 同一插件目录并发只触发一次下载。
   */
  static prefetch(app, pluginDir, version) {
    const key = (0, import_obsidian.normalizePath)(`${pluginDir}/webapp`);
    let p = _AppHost.prefetchCache.get(key);
    if (!p) {
      const host = new _AppHost(app, pluginDir, version);
      p = host.ensureWebapp(app.vault.adapter).catch((e) => {
        console.warn(
          "[AppHost] \u540E\u53F0\u9884\u62C9\u53D6 webapp \u5931\u8D25\uFF08\u6253\u5F00\u89C6\u56FE\u65F6\u5C06\u91CD\u8BD5\uFF09\uFF1A",
          e instanceof Error ? e.message : String(e)
        );
      });
      _AppHost.prefetchCache.set(key, p);
    }
    return p;
  }
  async buildBlobUrl() {
    const adapter = this.app.vault.adapter;
    await this.ensureWebapp(adapter);
    const appHtmlPath = (0, import_obsidian.normalizePath)(`${this.webappDir}/app.html`);
    let html;
    try {
      html = await adapter.read(appHtmlPath);
    } catch {
      throw new Error("\u65E0\u6CD5\u8BFB\u53D6 webapp/app.html\uFF0C\u4E14\u81EA\u52A8\u4E0B\u8F7D\u5931\u8D25\u3002\u8BF7\u5C1D\u8BD5\u5728 Obsidian \u4E2D\u91CD\u65B0\u5B89\u88C5\u672C\u63D2\u4EF6\uFF0C\u6216\u624B\u52A8\u653E\u7F6E webapp/ \u76EE\u5F55");
    }
    const pageBlob = new Blob([html], { type: "text/html" });
    const pageUrl = URL.createObjectURL(pageBlob);
    this.blobUrls.push(pageUrl);
    return pageUrl;
  }
  /**
   * 自愈（版本守卫）：若本地 webapp 缺失，或已存在但版本戳与当前插件版本不符，
   * 则重新从 GitHub Release 下载对应版本的 webapp.zip 解压（覆盖）。
   * 正常安装（webapp/ 已随插件分发且版本匹配）完全不触发联网；仅缺失或过期时兜底。
   */
  async ensureWebapp(adapter) {
    const versionStampFile = ".webapp-version";
    const appHtmlPath = (0, import_obsidian.normalizePath)(`${this.webappDir}/app.html`);
    const stampPath = (0, import_obsidian.normalizePath)(`${this.webappDir}/${versionStampFile}`);
    if (await this.fileExists(adapter, appHtmlPath)) {
      if (!await this.fileExists(adapter, stampPath)) return;
      const local = await this.readVersionStamp(adapter, stampPath);
      if (local === this.version) return;
      console.log(
        `[AppHost] \u672C\u5730 webapp \u7248\u672C(${local}) \u4E0E\u63D2\u4EF6\u7248\u672C(${this.version}) \u4E0D\u7B26\uFF0C\u91CD\u65B0\u81EA\u4E3E\u4E0B\u8F7D\u3002`
      );
    }
    if (!this.version) {
      console.warn("[AppHost] \u65E0\u6CD5\u83B7\u53D6\u63D2\u4EF6\u7248\u672C\uFF0C\u8DF3\u8FC7\u81EA\u4E3E\u4E0B\u8F7D\u3002\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5B89\u88C5\u5B8C\u6574\u3002");
      return;
    }
    const url = `https://github.com/${this.repo}/releases/download/${this.version}/webapp.zip`;
    console.log(`[AppHost] \u672A\u68C0\u6D4B\u5230\u5339\u914D\u7684\u672C\u5730 webapp\uFF0C\u5C1D\u8BD5\u81EA\u4E3E\u4E0B\u8F7D\uFF1A${url}`);
    try {
      const resp = await (0, import_obsidian.requestUrl)({ url, method: "GET" });
      if (resp.status < 200 || resp.status >= 300 || !resp.arrayBuffer) {
        throw new Error(`\u4E0B\u8F7D\u8FD4\u56DE\u5F02\u5E38\u72B6\u6001 ${resp.status}`);
      }
      await this.extractZip(adapter, resp.arrayBuffer);
      try {
        await adapter.write(stampPath, this.version);
      } catch (e) {
        console.warn("[AppHost] \u5199\u5165 webapp \u7248\u672C\u6233\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u4F7F\u7528\uFF09\uFF1A", e);
      }
      console.log("[AppHost] webapp \u81EA\u4E3E\u4E0B\u8F7D\u5E76\u89E3\u538B\u5B8C\u6210\u3002");
    } catch (e) {
      console.error("[AppHost] webapp \u81EA\u4E3E\u4E0B\u8F7D\u5931\u8D25\uFF1A", e);
      throw new Error(
        `\u65E0\u6CD5\u81EA\u52A8\u83B7\u53D6 webapp\uFF08${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}\uFF09\u3002\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5\uFF0C\u6216\u5728 Obsidian \u4E2D\u91CD\u65B0\u5B89\u88C5\u672C\u63D2\u4EF6\u3002`
      );
    }
  }
  async readVersionStamp(adapter, filePath) {
    try {
      return (await adapter.read(filePath)).trim();
    } catch {
      return null;
    }
  }
  async extractZip(adapter, buffer) {
    const files = unzipSync(new Uint8Array(buffer));
    const entries = [];
    for (const [rawPath, content] of Object.entries(files)) {
      const rel = (0, import_obsidian.normalizePath)(rawPath.replace(/^\.?\//, ""));
      if (!rel) continue;
      if (rel.endsWith("/")) continue;
      entries.push({ target: (0, import_obsidian.normalizePath)(`${this.webappDir}/${rel}`), content });
    }
    for (const { target } of entries) {
      await this.ensureParentDirSafe(adapter, target);
    }
    for (const { target, content } of entries) {
      if (await this.isFolder(adapter, target)) continue;
      await adapter.writeBinary(target, content.slice().buffer);
    }
  }
  /**
   * 逐级确保父目录存在；遇到「同名文件占位」时先删除再 mkdir，
   * 解决 zip 占位条目 / 本地坏文件导致 writeBinary 抛 ENOTDIR 的问题。
   */
  async ensureParentDirSafe(adapter, filePath) {
    const parts = filePath.split("/");
    let acc = "";
    for (let i = 0; i < parts.length - 1; i++) {
      acc += (acc ? "/" : "") + parts[i];
      if (!acc) continue;
      const kind = await this.statKind(adapter, acc);
      if (kind === "folder") continue;
      if (kind === "file") {
        try {
          await adapter.remove(acc);
        } catch {
        }
      }
      try {
        await adapter.mkdir(acc);
      } catch {
      }
    }
  }
  /** 返回路径类型：'file' | 'folder' | 'none'（不存在或无法判定） */
  async statKind(adapter, path) {
    try {
      const st = await adapter.stat(path);
      if (!st) return "none";
      return st.type === "folder" ? "folder" : "file";
    } catch {
      return "none";
    }
  }
  async isFolder(adapter, path) {
    return await this.statKind(adapter, path) === "folder";
  }
  async fileExists(adapter, path) {
    try {
      return await adapter.exists(path);
    } catch {
      return false;
    }
  }
  destroy() {
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];
  }
};
// 后台预拉取的去重缓存：避免插件 onload 预拉取与视图打开时重复下载
_AppHost.prefetchCache = /* @__PURE__ */ new Map();
var AppHost = _AppHost;

// src/host/AppAPI.ts
var import_obsidian3 = require("obsidian");

// src/storage/VaultStorage.ts
var import_obsidian2 = require("obsidian");

// src/storage/ImportValidator.ts
var ImportValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ImportValidationError";
  }
};
var KNOWN_FIELDS = ["days", "goals", "settings", "purchaseHistory", "incomeHistory"];
function sanitizeString(input) {
  if (typeof input !== "string") return input;
  const out = input.replace(/<[^>]*>/g, "").replace(/\son\w+\s*=\s*"[^"]*"/gi, "").replace(/\son\w+\s*=\s*'[^']*'/gi, "").replace(/\son\w+\s*=\s*[^\s>]+/gi, "").replace(/javascript:/gi, "").replace(/data:/gi, "");
  return out;
}
function sanitizeValue(value) {
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) return value.map((v) => sanitizeValue(v));
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = sanitizeValue(value[key]);
    }
    return out;
  }
  return value;
}
var ImportValidator = {
  /**
   * 校验并补齐导入数据。
   * @returns 补齐后的干净数据（结构与输入一致，但字段完整）
   * @throws ImportValidationError 当结构损坏无法修复时
   */
  validate(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new ImportValidationError("\u5907\u4EFD\u6587\u4EF6\u683C\u5F0F\u65E0\u6548\uFF1A\u6839\u8282\u70B9\u5FC5\u987B\u662F JSON \u5BF9\u8C61");
    }
    const record = data;
    const hasKnownField = KNOWN_FIELDS.some((f) => record[f] !== void 0);
    if (!hasKnownField) {
      throw new ImportValidationError(
        "\u5907\u4EFD\u6587\u4EF6\u65E0\u6548\uFF1A\u672A\u627E\u5230\u4EFB\u4F55\u53EF\u8BC6\u522B\u7684\u6570\u636E\u5B57\u6BB5\uFF08days / goals / settings / purchaseHistory / incomeHistory\uFF09"
      );
    }
    const result = {};
    if (record.days !== void 0) {
      result.days = sanitizeValue(ImportValidator.normalizeDays(record.days));
    }
    if (record.goals !== void 0) {
      result.goals = sanitizeValue(ImportValidator.normalizeGoals(record.goals));
    }
    if (record.settings !== void 0) {
      result.settings = sanitizeValue(ImportValidator.normalizeSettings(record.settings));
    }
    if (record.purchaseHistory !== void 0) {
      result.purchaseHistory = sanitizeValue(record.purchaseHistory);
    }
    if (record.incomeHistory !== void 0) {
      result.incomeHistory = sanitizeValue(record.incomeHistory);
    }
    return result;
  },
  /**
   * 归一化 days。
   *  - 必须是对象；非对象（如数组/字符串）→ 视为无日数据，返回空对象（不污染 Vault）
   *  - 每个 day 缺 date 时用其 key 补齐
   *  - 每个 day 缺 metrics/timeline/goals 时补空结构
   */
  normalizeDays(days) {
    if (!days || typeof days !== "object" || Array.isArray(days)) {
      return {};
    }
    const raw = days;
    const out = {};
    for (const key of Object.keys(raw)) {
      const day = raw[key];
      if (!day || typeof day !== "object" || Array.isArray(day)) {
        continue;
      }
      const clean = { ...day };
      if (!clean.date) clean.date = key;
      if (!clean.metrics || typeof clean.metrics !== "object") clean.metrics = {};
      if (!clean.timeline || !Array.isArray(clean.timeline)) clean.timeline = [];
      if (!clean.goals || !Array.isArray(clean.goals)) clean.goals = [];
      out[key] = clean;
    }
    return out;
  },
  /**
   * 归一化 goals。
   *  - 必须是数组；非数组 → 返回空数组
   *  - 每个 goal 缺 id 时补一个稳定可复现的 id
   */
  normalizeGoals(goals) {
    if (!Array.isArray(goals)) {
      return [];
    }
    let counter = 0;
    return goals.map((raw) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
      const obj = raw;
      const clean = { ...obj };
      if (!clean.id) {
        clean.id = `goal_import_${counter++}_${Date.now().toString(36)}`;
      }
      if (clean.items && !Array.isArray(clean.items)) clean.items = [];
      return clean;
    });
  },
  /**
   * 归一化 settings。
   *  - 必须是对象；非对象 → 返回空对象
   */
  normalizeSettings(settings) {
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return {};
    }
    return settings;
  }
};

// src/storage/VaultStorage.ts
var VaultStorage = class {
  constructor(app, basePath = "bamboo-review") {
    /** 写守卫：已警告过的路径，第二次写入放行（用户确认意图） */
    this._warnedPaths = /* @__PURE__ */ new Set();
    this.app = app;
    this.basePath = (0, import_obsidian2.normalizePath)(basePath);
  }
  /** 确保目录存在 */
  async ensureDir(dir) {
    const path = (0, import_obsidian2.normalizePath)(`${this.basePath}/${dir}`);
    if (!await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.mkdir(path);
    }
  }
  /** 确保基础目录结构存在 */
  async ensureStructure() {
    if (!await this.app.vault.adapter.exists(this.basePath)) {
      await this.app.vault.adapter.mkdir(this.basePath);
    }
    await this.ensureDir("data");
    await this.ensureDir("reviews");
  }
  /**
   * 原子方式写入 vault 文件（替代 adapter.write）。
   * - 文件已在 vault 缓存 → vault.process（原子更新，避免竞态丢数据）
   * - 新文件 → vault.create（同时写入磁盘和 Obsidian 缓存）
   * - 历史遗留（磁盘有但缓存无）→ adapter.remove + vault.create（迁移进缓存）
   */
  async vaultWrite(path, content) {
    const normalized = (0, import_obsidian2.normalizePath)(path);
    const abstract = this.app.vault.getAbstractFileByPath(normalized);
    if (abstract instanceof import_obsidian2.TFile) {
      await this.app.vault.process(abstract, () => content);
      return;
    }
    const parentPath = normalized.substring(0, normalized.lastIndexOf("/"));
    if (parentPath && !await this.app.vault.adapter.exists(parentPath)) {
      await this.app.vault.adapter.mkdir(parentPath);
    }
    if (await this.app.vault.adapter.exists(normalized)) {
      await this.app.vault.adapter.remove(normalized);
    }
    await this.app.vault.create(normalized, content);
  }
  // ---- 每日数据 (days) ----
  dayPath(dateKey) {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/data/${dateKey}.json`);
  }
  async getDay(dateKey) {
    const path = this.dayPath(dateKey);
    if (!await this.app.vault.adapter.exists(path)) {
      return null;
    }
    try {
      const content = await this.app.vault.adapter.read(path);
      return JSON.parse(content);
    } catch (e) {
      console.warn(`[BambooReview] \u65E5\u671F\u6570\u636E\u6587\u4EF6\u635F\u574F\uFF0C\u5C06\u8DF3\u8FC7: ${path}`, e);
      return null;
    }
  }
  async getAllDays() {
    await this.ensureDir("data");
    const dataDir = (0, import_obsidian2.normalizePath)(`${this.basePath}/data`);
    const files = await this.app.vault.adapter.list(dataDir);
    const days = {};
    const reads = files.files.filter((f) => f.endsWith(".json")).map(async (file) => {
      const dateKey = file.split("/").pop()?.replace(".json", "");
      if (!dateKey) return;
      try {
        const content = await this.app.vault.adapter.read(file);
        days[dateKey] = JSON.parse(content);
      } catch (e) {
        console.warn(`Failed to parse day file: ${file}`, e);
      }
    });
    await Promise.all(reads);
    return days;
  }
  /** 获取所有日期 key（按日期降序，最新在前） */
  async getDayKeys() {
    await this.ensureDir("data");
    const dataDir = (0, import_obsidian2.normalizePath)(`${this.basePath}/data`);
    const files = await this.app.vault.adapter.list(dataDir);
    const keys = [];
    for (const file of files.files) {
      if (file.endsWith(".json")) {
        const dateKey = file.split("/").pop()?.replace(".json", "");
        if (dateKey) keys.push(dateKey);
      }
    }
    keys.sort().reverse();
    return keys;
  }
  /**
   * 分页加载日期数据
   * @param page 页码（从 0 开始）
   * @param pageSize 每页数量
   * @returns { days, total, page, pageSize, hasMore }
   */
  async getDaysPaginated(page = 0, pageSize = 30) {
    const allKeys = await this.getDayKeys();
    const total = allKeys.length;
    const start = page * pageSize;
    const pageKeys = allKeys.slice(start, start + pageSize);
    const days = {};
    const reads = pageKeys.map(async (dateKey) => {
      try {
        const data = await this.getDay(dateKey);
        if (data) days[dateKey] = data;
      } catch (e) {
        console.warn(`Failed to load day: ${dateKey}`, e);
      }
    });
    await Promise.all(reads);
    return {
      days,
      keys: pageKeys,
      total,
      page,
      pageSize,
      hasMore: start + pageKeys.length < total
    };
  }
  async putDay(dayData) {
    await this.ensureDir("data");
    const dateKey = dayData.date;
    if (!dateKey) {
      throw new Error("DayData must have a date field");
    }
    const path = this.dayPath(dateKey);
    if (!this._warnedPaths.has(path)) {
      const newTimelineLen = Array.isArray(dayData.timeline) ? dayData.timeline.length : 0;
      if (newTimelineLen <= 1) {
        try {
          if (await this.app.vault.adapter.exists(path)) {
            const existing = JSON.parse(await this.app.vault.adapter.read(path));
            const existingTimelineLen = Array.isArray(existing.timeline) ? existing.timeline.length : 0;
            if (existingTimelineLen > 10) {
              new import_obsidian2.Notice(
                `\u26A0\uFE0F \u68C0\u6D4B\u5230 ${dateKey} \u6570\u636E\u5F02\u5E38\u6E05\u7A7A\uFF08${existingTimelineLen} \u6761 \u2192 ${newTimelineLen} \u6761\uFF09\uFF0C\u5DF2\u81EA\u52A8\u62E6\u622A\u3002
\u5982\u679C\u786E\u5B9E\u8981\u6E05\u7A7A\u8BE5\u65E5\u6570\u636E\uFF0C\u8BF7\u518D\u6B21\u64CD\u4F5C\u3002`
              );
              this._warnedPaths.add(path);
              return;
            }
          }
        } catch {
        }
      }
    }
    await this.vaultWrite(path, JSON.stringify(dayData, null, 2));
  }
  async deleteDay(dateKey) {
    const path = this.dayPath(dateKey);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }
  // ---- 全局目标 (goals) ----
  goalsPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/goals.json`);
  }
  async getGoals() {
    const path = this.goalsPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return [];
    }
    const content = await this.app.vault.adapter.read(path);
    return JSON.parse(content);
  }
  async putGoals(goals) {
    const path = this.goalsPath();
    if (goals.length === 0 && !this._warnedPaths.has(path)) {
      try {
        if (await this.app.vault.adapter.exists(path)) {
          const existing = JSON.parse(await this.app.vault.adapter.read(path));
          if (Array.isArray(existing) && existing.length > 0) {
            new import_obsidian2.Notice(
              `\u26A0\uFE0F \u68C0\u6D4B\u5230\u76EE\u6807\u6570\u636E\u5F02\u5E38\u6E05\u7A7A\uFF08${existing.length} \u6761 \u2192 \u7A7A\uFF09\uFF0C\u5DF2\u81EA\u52A8\u62E6\u622A\u3002
\u5982\u679C\u786E\u5B9E\u8981\u6E05\u7A7A\u6240\u6709\u76EE\u6807\uFF0C\u8BF7\u518D\u6B21\u64CD\u4F5C\u3002`
            );
            this._warnedPaths.add(path);
            return;
          }
        }
      } catch {
      }
    }
    await this.vaultWrite(path, JSON.stringify(goals, null, 2));
  }
  // ---- AI 规划侧车索引（plans-map.json）----
  // 结构：{ "<vaultPath>#<contentHash>": string[] (goalIds) }
  // 用途：同一笔记重复规划时按 contentHash 幂等，避免目标重复追加。
  plansIndexPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/plans-map.json`);
  }
  async getPlansIndex() {
    const path = this.plansIndexPath();
    if (!await this.app.vault.adapter.exists(path)) return {};
    try {
      const content = await this.app.vault.adapter.read(path);
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") return parsed;
      return {};
    } catch {
      return {};
    }
  }
  async putPlansIndex(map) {
    await this.vaultWrite(this.plansIndexPath(), JSON.stringify(map, null, 2));
  }
  // ---- 设置 (settings) ----
  settingsPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/settings.json`);
  }
  async getSetting(key) {
    const settings = await this.getAllSettings();
    return settings[key] ?? null;
  }
  async putSetting(key, value) {
    const path = (0, import_obsidian2.normalizePath)(this.settingsPath());
    const abstract = this.app.vault.getAbstractFileByPath(path);
    if (abstract instanceof import_obsidian2.TFile) {
      await this.app.vault.process(abstract, (data) => {
        const settings = JSON.parse(data);
        settings[key] = value;
        return JSON.stringify(settings, null, 2);
      });
    } else {
      await this.vaultWrite(path, JSON.stringify({ [key]: value }, null, 2));
    }
  }
  async getAllSettings() {
    const path = this.settingsPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return {};
    }
    try {
      const content = await this.app.vault.adapter.read(path);
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  // ---- 购买历史 (purchase-history.json) ----
  purchaseHistoryPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/purchase-history.json`);
  }
  async getPurchaseHistory() {
    const path = this.purchaseHistoryPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path);
    return JSON.parse(content);
  }
  async putPurchaseHistory(data) {
    const path = this.purchaseHistoryPath();
    await this.vaultWrite(path, JSON.stringify(data, null, 2));
  }
  // ---- 收入历史 (income-history.json) ----
  incomeHistoryPath() {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/income-history.json`);
  }
  async getIncomeHistory() {
    const path = this.incomeHistoryPath();
    if (!await this.app.vault.adapter.exists(path)) {
      return null;
    }
    const content = await this.app.vault.adapter.read(path);
    return JSON.parse(content);
  }
  async putIncomeHistory(data) {
    const path = this.incomeHistoryPath();
    await this.vaultWrite(path, JSON.stringify(data, null, 2));
  }
  // ---- 导出/导入 ----
  async exportAllData() {
    const [days, goals, settings, purchaseHistory, incomeHistory] = await Promise.all([
      this.getAllDays(),
      this.getGoals(),
      this.getAllSettings(),
      this.getPurchaseHistory(),
      this.getIncomeHistory()
    ]);
    return {
      version: "3.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      storageType: "vault",
      days,
      goals,
      settings,
      purchaseHistory,
      incomeHistory,
      themes: [],
      reports: []
    };
  }
  async importData(data, options = {}) {
    await this.ensureStructure();
    const strategy = options.strategy ?? "overwrite";
    const record = ImportValidator.validate(data);
    if (record.days !== void 0) {
      const days = record.days && typeof record.days === "object" && !Array.isArray(record.days) ? record.days : {};
      if (strategy === "overwrite") {
        await this.clearAllDays();
      }
      for (const day of Object.values(days)) {
        await this.putDay(day);
      }
    }
    if (record.goals !== void 0) {
      const incoming = Array.isArray(record.goals) ? record.goals : [];
      if (strategy === "merge") {
        const existing = await this.getGoals() || [];
        const merged = new Map(existing.map((g) => [g.id, g]));
        for (const goal of incoming) {
          if (goal && goal.id) merged.set(goal.id, goal);
        }
        await this.putGoals(Array.from(merged.values()));
      } else {
        await this.putGoals(incoming);
      }
    }
    if (record.settings !== void 0 && record.settings && typeof record.settings === "object") {
      const incoming = record.settings;
      let toWrite;
      if (strategy === "merge") {
        const existing = await this.getAllSettings() || {};
        toWrite = { ...existing, ...incoming };
      } else {
        toWrite = incoming;
      }
      await this.vaultWrite(this.settingsPath(), JSON.stringify(toWrite, null, 2));
    }
    if (record.purchaseHistory !== void 0) {
      await this.putPurchaseHistory(record.purchaseHistory);
    }
    if (record.incomeHistory !== void 0) {
      await this.putIncomeHistory(record.incomeHistory);
    }
  }
  /** 仅清空所有日数据（overwrite 导入 days 前调用，不影响 goals/settings） */
  async clearAllDays() {
    const dataDir = (0, import_obsidian2.normalizePath)(`${this.basePath}/data`);
    if (await this.app.vault.adapter.exists(dataDir)) {
      await this.app.vault.adapter.rmdir(dataDir, true);
    }
    await this.ensureDir("data");
  }
  /** 仅清空设置文件（overwrite 导入 settings 前调用） */
  async clearAllSettings() {
    const path = this.settingsPath();
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }
  async clearAll() {
    if (await this.app.vault.adapter.exists(this.basePath)) {
      await this.app.vault.adapter.rmdir(this.basePath, true);
    }
    await this.ensureStructure();
  }
  // ---- Markdown 摘要 ----
  reviewPath(dateKey) {
    return (0, import_obsidian2.normalizePath)(`${this.basePath}/reviews/${dateKey}.md`);
  }
  async writeMarkdownReview(dateKey, markdown) {
    await this.ensureDir("reviews");
    const path = this.reviewPath(dateKey);
    await this.vaultWrite(path, markdown);
  }
  async deleteMarkdownReview(dateKey) {
    const path = this.reviewPath(dateKey);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }
};

// src/bridge/ThemeBridge.ts
var _ThemeBridge = class _ThemeBridge {
  constructor() {
    this.iframe = null;
    this._paletteSyncTimer = null;
  }
  attachIframe(iframe) {
    this.iframe = iframe;
  }
  detachIframe() {
    this.iframe = null;
  }
  /** 获取当前 Obsidian 明暗状态（仅内部使用） */
  isDarkMode() {
    return activeDocument.body.classList.contains("theme-dark");
  }
  /**
   * 解析 CSS 颜色字符串 → [r, g, b]（0–255 整数）
   * 支持 rgb()/rgba()/#hex（3 或 6 位）；无法解析返回 null
   */
  static parseColorToRgb(color) {
    if (!color) return null;
    const c = color.trim();
    let r, g, b;
    const rgbMatch = c.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(",").map((s) => parseFloat(s));
      [r, g, b] = parts;
    } else if (c[0] === "#") {
      let hex = c.slice(1);
      if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
      if (hex.length < 6) return null;
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return null;
    }
    if ([r, g, b].some((v) => isNaN(v))) return null;
    return [Math.round(r), Math.round(g), Math.round(b)];
  }
  /**
   * 解析 CSS 颜色字符串 → HSL 色相 H（0–360）
   * 用于把 Obsidian 主题的 --interactive-accent 反推为插件的 --accent-hue
   */
  static rgbToHue(color) {
    const rgb = _ThemeBridge.parseColorToRgb(color);
    if (!rgb) return null;
    const [r, g, b] = rgb;
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max2 = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max2 - min;
    if (d === 0) return 0;
    let h;
    if (max2 === rn) h = (gn - bn) / d % 6;
    else if (max2 === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60);
    return h < 0 ? h + 360 : h;
  }
  /**
   * 解析 CSS 颜色字符串 → "r, g, b" 三元组字符串
   * 用于把 Obsidian 侧边栏背景 --background-secondary 同步为插件卡片底色，
   * 让插件卡片色温贴近 Obsidian 原生界面
   */
  static rgbToRgbString(color) {
    const rgb = _ThemeBridge.parseColorToRgb(color);
    if (!rgb) return null;
    return rgb.join(", ");
  }
  /**
   * 向 iframe 推送当前主题状态
   * @param followObsidianTheme 为 true 时，附带从 Obsidian 主题
   *        --interactive-accent 反推的意境色相 hue，驱动插件整盘配色联动
   */
  pushTheme(followObsidianTheme = false) {
    if (!this.iframe?.contentWindow) return;
    const payload = {
      isDark: this.isDarkMode()
    };
    if (followObsidianTheme) {
      const accent = getComputedStyle(activeDocument.body).getPropertyValue("--interactive-accent").trim();
      const hue = _ThemeBridge.rgbToHue(accent);
      if (hue !== null) payload.hue = hue;
      const sidebar = getComputedStyle(activeDocument.body).getPropertyValue("--background-secondary").trim();
      const bg = _ThemeBridge.rgbToRgbString(sidebar);
      if (bg !== null) payload.bg = bg;
      const textNormal = getComputedStyle(activeDocument.body).getPropertyValue("--text-normal").trim();
      const textNormalRgb = _ThemeBridge.rgbToRgbString(textNormal);
      if (textNormalRgb !== null) payload.textNormal = textNormalRgb;
      const textMuted = getComputedStyle(activeDocument.body).getPropertyValue("--text-muted").trim();
      const textMutedRgb = _ThemeBridge.rgbToRgbString(textMuted);
      if (textMutedRgb !== null) payload.textMuted = textMutedRgb;
    }
    this.iframe.contentWindow.postMessage(
      {
        type: "theme:changed",
        id: "theme_push_" + Date.now(),
        payload
      },
      "*"
    );
  }
  /** 供外部调用：Obsidian 主题变化时触发 */
  onThemeChanged(followObsidianTheme = false) {
    this.pushTheme(followObsidianTheme);
  }
  // ===== 双向调色 =====
  /**
   * 计算 webapp 色相/明度 → Obsidian CSS 变量映射
   * 仅覆盖 3 类核心色（强调/背景/文字），其余由 Obsidian 当前主题推算
   */
  static computeObsidianVars(hue, lightnessOffset, isDark) {
    const h = Math.round(hue);
    const lo = Math.max(-30, Math.min(30, lightnessOffset));
    const accentS = 40;
    const accentL = isDark ? 50 : 40;
    const accent = `hsl(${h}, ${accentS}%, ${accentL}%)`;
    const accentHover = `hsl(${h}, ${accentS}%, ${accentL + 5}%)`;
    const bgS = isDark ? 8 : 12;
    const bgL = isDark ? Math.max(5, 12 + lo * 0.3) : Math.min(98, 94 + lo * 0.15);
    const bgPrimary = `hsl(${h}, ${bgS}%, ${bgL}%)`;
    const bgSecondary = `hsl(${h}, ${bgS}%, ${isDark ? bgL + 3 : bgL - 2}%)`;
    const textNormal = isDark ? `hsl(${h}, 6%, 88%)` : `hsl(${h}, 6%, 12%)`;
    const textMuted = isDark ? `hsl(${h}, 4%, 55%)` : `hsl(${h}, 4%, 45%)`;
    return {
      "--interactive-accent": accent,
      "--interactive-accent-hover": accentHover,
      "--text-accent": accent,
      "--background-primary": bgPrimary,
      "--background-secondary": bgSecondary,
      "--text-normal": textNormal,
      "--text-muted": textMuted
    };
  }
  /**
   * 应用调色到 Obsidian 原生界面
   * 50ms debounce，防止色相/明度滑块快速拖拽产生高频 DOM 写入
   */
  applyPalette(hue, lightnessOffset, isDark) {
    if (this._paletteSyncTimer) window.clearTimeout(this._paletteSyncTimer);
    _ThemeBridge._suppressed = false;
    this._paletteSyncTimer = window.setTimeout(() => {
      if (_ThemeBridge._suppressed) return;
      const vars = _ThemeBridge.computeObsidianVars(hue, lightnessOffset, isDark);
      for (const [key, value] of Object.entries(vars)) {
        activeDocument.body.style.setProperty(key, value);
      }
    }, 50);
  }
  /** 清除注入的 CSS 变量，恢复 Obsidian 主题默认值 */
  static restoreDefaults() {
    _ThemeBridge._suppressed = true;
    for (const key of _ThemeBridge.INJECTED_VARS) {
      activeDocument.body.style.removeProperty(key);
    }
  }
};
/** 存储注入的 CSS 变量键名，用于 restoreDefaults 清理 */
_ThemeBridge.INJECTED_VARS = [
  "--interactive-accent",
  "--interactive-accent-hover",
  "--text-accent",
  "--background-primary",
  "--background-secondary",
  "--text-normal",
  "--text-muted"
];
/** 防抖竞态标记：restoreDefaults 被调用后设为 true，阻止延迟回调覆写 */
_ThemeBridge._suppressed = false;
var ThemeBridge = _ThemeBridge;

// src/constants/audio.ts
var ALLOWED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".aac",
  ".m4a",
  ".wma",
  ".webm",
  ".opus"
];
var AUDIO_MIME_TYPES = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
  ".aac": "audio/aac",
  ".m4a": "audio/mp4",
  ".wma": "audio/x-ms-wma",
  ".webm": "audio/webm",
  ".opus": "audio/opus"
};
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ...AUDIO_MIME_TYPES
};

// src/host/protocol.ts
var PROTOCOL_VERSION = 1;
var INBOUND_PREFIXES = ["storage:", "app:", "file:", "theme:"];

// src/host/AppAPI.ts
var SKIP_DIRS = [".trash", ".git", "node_modules"];
function isValidAudioUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.length > 2048) return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:";
}
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 32768;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    let chunkStr = "";
    for (let j = 0; j < chunk.length; j++) {
      chunkStr += String.fromCharCode(chunk[j]);
    }
    binary += chunkStr;
  }
  return btoa(binary);
}
var AppAPI = class {
  constructor(app, settings, saveSettings, noisePath, configDir) {
    this.iframe = null;
    this.messageHandler = null;
    this.customThemes = [];
    this.settings = settings;
    this.saveSettings = saveSettings;
    this.storage = new VaultStorage(app);
    this.themeBridge = new ThemeBridge();
    this.vaultAdapter = app.vault.adapter;
    this.noisePath = noisePath;
    this.configDir = configDir;
  }
  /** 确保存储结构存在 */
  async ensureStructure() {
    await this.storage.ensureStructure();
  }
  /** 设置自定义主题列表 */
  setCustomThemes(themes) {
    this.customThemes = themes;
  }
  /** 
   * 预注册 message 监听器。
   * 在 iframe 创建前调用，消除竞态窗口。
   * 使用 activeDocument.defaultView（主 Obsidian 窗口）而非插件沙箱 window。
   */
  startListening() {
    this.detach();
    this.messageHandler = (event) => {
      void this.onMessage(event);
    };
    (activeDocument.defaultView || window).addEventListener("message", this.messageHandler);
  }
  /** 
   * 绑定 iframe 引用并初始化主题桥接。
   * 在 iframe 元素创建后调用，供 respond() 获取 contentWindow。
   */
  bindIframe(iframe) {
    this.iframe = iframe;
    this.themeBridge.attachIframe(iframe);
  }
  /** 绑定 iframe 并开始监听消息（一步到位，兼容旧调用） */
  attach(iframe) {
    this.startListening();
    this.bindIframe(iframe);
  }
  /** 解绑并停止监听 */
  detach() {
    if (this.messageHandler) {
      (activeDocument.defaultView || window).removeEventListener("message", this.messageHandler);
      this.messageHandler = null;
    }
    this.themeBridge.detachIframe();
    this.iframe = null;
  }
  /** Obsidian 主题变化时触发（由 DailyReviewView 的 css-change 事件调用） */
  onThemeChanged(followObsidianTheme) {
    this.settings.followObsidianTheme = followObsidianTheme;
    this.themeBridge.pushTheme(followObsidianTheme);
  }
  /** 向 iframe 发送成功响应 */
  respond(id, payload) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ type: "storage:response", id, payload }, "*");
  }
  /** 向 iframe 发送错误响应 */
  respondError(id, error) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ type: "storage:response", id, error }, "*");
  }
  /** 消息路由 */
  async onMessage(event) {
    const msg = event.data;
    if (!msg || !msg.type || !msg.id) return;
    if (this.iframe && event.source !== this.iframe.contentWindow) return;
    if (!INBOUND_PREFIXES.some((p) => msg.type.startsWith(p))) return;
    try {
      await this.handleMessage(msg.type, msg.id, msg.payload ?? {});
    } catch (e) {
      this.respondError(msg.id, e instanceof Error ? e.message : "Unknown error");
    }
  }
  /** 消息分发处理 */
  async handleMessage(type, id, payload) {
    if (type === "app:ready") {
      const pv = payload?.protocolVersion;
      if (typeof pv === "number" && pv !== PROTOCOL_VERSION) {
        console.warn(
          `[Bamboo] \u534F\u8BAE\u7248\u672C\u4E0D\u5339\u914D\uFF1A\u63D2\u4EF6=${PROTOCOL_VERSION}\uFF0Cwebapp=${pv}\u3002\u8BF7\u91CD\u65B0\u52A0\u8F7D\u89C6\u56FE\u4EE5\u83B7\u53D6\u6700\u65B0 webapp\u3002`
        );
      }
      this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      this.respond(id, {
        ok: true,
        sectionConfig: this.settings.sectionConfig || null,
        customThemes: this.customThemes,
        customNoises: this.settings.noiseItems || [],
        syncPaletteToObsidian: this.settings.syncPaletteToObsidian || false
      });
      return;
    }
    if (type === "app:close") {
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:saveSectionConfig") {
      this.settings.sectionConfig = payload;
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:saveCustomNoises") {
      this.settings.noiseItems = Array.isArray(payload) ? payload : [];
      await this.saveSettings();
      this.respond(id, { ok: true });
      return;
    }
    if (type === "theme:syncPalette") {
      const p = payload;
      if (this.settings.syncPaletteToObsidian) {
        this.themeBridge.applyPalette(p.hue, p.lightnessOffset, p.isDark);
      }
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:theme:sync") {
      this.themeBridge.pushTheme(this.settings.followObsidianTheme);
      this.respond(id, { ok: true });
      return;
    }
    if (type === "app:listVaultAudioFiles") {
      try {
        const files = await this.scanVaultAudioFiles();
        this.respond(id, { files });
      } catch (e) {
        this.respondError(id, e instanceof Error ? e.message : "\u626B\u63CF\u5E93\u6587\u4EF6\u5931\u8D25");
      }
      return;
    }
    if (type === "app:readVaultFile") {
      await this.handleReadVaultFile(id, payload);
      return;
    }
    if (type === "app:readLocalFile") {
      await this.handleReadLocalFile(id, payload);
      return;
    }
    if (type === "app:proxyAudioUrl") {
      await this.handleProxyAudioUrl(id, payload);
      return;
    }
    if (type === "app:aiImproveGoal") {
      const p = payload;
      if (typeof p.goalId !== "string" || p.goalId.length === 0) {
        this.respondError(id, "app:aiImproveGoal \u7F3A\u5C11 goalId");
        return;
      }
      this.onAiImproveGoal?.({
        goalId: p.goalId,
        title: typeof p.title === "string" ? p.title : void 0,
        hints: typeof p.hints === "string" ? p.hints : void 0
      });
      this.respond(id, { ok: true });
      return;
    }
    const result = await this.handleStorageMessage(type, payload);
    this.respond(id, result);
  }
  /** 存储消息处理 */
  async handleStorageMessage(type, payload) {
    const p = payload;
    switch (type) {
      case "storage:readDay":
        return await this.storage.getDay(p.dateKey);
      case "storage:writeDay":
        return await this.storage.putDay(p.data);
      case "storage:listDays":
        return await this.storage.getAllDays();
      case "storage:deleteDay":
        return await this.storage.deleteDay(p.dateKey);
      case "storage:getSetting":
        return await this.storage.getSetting(p.key);
      case "storage:putSetting":
        return await this.storage.putSetting(p.key, p.value);
      case "storage:getAllSettings":
        return await this.storage.getAllSettings();
      case "storage:getGoals":
        return await this.storage.getGoals();
      case "storage:putGoals":
        return await this.storage.putGoals(p.goals);
      case "storage:getPurchaseHistory":
        return await this.storage.getPurchaseHistory();
      case "storage:putPurchaseHistory":
        return await this.storage.putPurchaseHistory(p.data);
      case "storage:getIncomeHistory":
        return await this.storage.getIncomeHistory();
      case "storage:putIncomeHistory":
        return await this.storage.putIncomeHistory(p.data);
      case "storage:getDayKeys":
        return await this.storage.getDayKeys();
      case "storage:getDaysPaginated":
        return await this.storage.getDaysPaginated(
          p.page ?? 0,
          p.pageSize ?? 30
        );
      case "storage:exportAll":
        return await this.storage.exportAllData();
      case "storage:importAll":
        return await this.storage.importData(
          p.data,
          { strategy: p.options?.strategy }
        );
      case "storage:clearAll":
        return await this.storage.clearAll();
      default:
        throw new Error(`Unknown storage message type: ${type}`);
    }
  }
  /** 扫描库内音频文件 */
  async scanVaultAudioFiles(maxDepth = 5) {
    const results = [];
    const adapter = this.vaultAdapter;
    if (this.noisePath) {
      try {
        const list = await adapter.list(this.noisePath);
        for (const file of list.files) {
          if (file.startsWith(".")) continue;
          const ext = file.substring(file.lastIndexOf(".")).toLowerCase();
          if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
            try {
              const fullPath = (0, import_obsidian3.normalizePath)(`${this.noisePath}/${file}`);
              const stat = await adapter.stat(fullPath);
              results.push({ path: fullPath, name: file, size: stat?.size ?? 0, ext });
            } catch {
            }
          }
        }
      } catch {
      }
      results.sort((a, b) => a.path.localeCompare(b.path));
      return results;
    }
    const scanDir = async (relativeDir, depth) => {
      if (depth > maxDepth) return;
      let list;
      try {
        list = await adapter.list(relativeDir);
      } catch {
        return;
      }
      for (const folder of list.folders) {
        if (folder.startsWith(".")) continue;
        const skipSet = /* @__PURE__ */ new Set([...SKIP_DIRS, ...this.configDir ? [this.configDir] : []]);
        if (skipSet.has(folder)) continue;
        const subPath = relativeDir ? (0, import_obsidian3.normalizePath)(`${relativeDir}/${folder}`) : folder;
        await scanDir(subPath, depth + 1);
      }
      for (const file of list.files) {
        if (file.startsWith(".")) continue;
        const ext = file.substring(file.lastIndexOf(".")).toLowerCase();
        if (ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
          try {
            const relativePath = relativeDir ? (0, import_obsidian3.normalizePath)(`${relativeDir}/${file}`) : file;
            const stat = await adapter.stat(relativePath);
            results.push({ path: relativePath, name: file, size: stat?.size ?? 0, ext });
          } catch {
          }
        }
      }
    };
    await scanDir("", 0);
    results.sort((a, b) => a.path.localeCompare(b.path));
    return results;
  }
  /** 读取库内音频文件，返回可播放的 base64 data URL（桌面/移动一致，不依赖 basePath） */
  async handleReadVaultFile(id, payload) {
    try {
      const p = payload;
      const relativePath = p.path || "";
      if (!relativePath) throw new Error("\u672A\u63D0\u4F9B\u6587\u4EF6\u8DEF\u5F84");
      const ext = relativePath.substring(relativePath.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error("\u4E0D\u652F\u6301\u7684\u97F3\u9891\u683C\u5F0F\uFF1A" + ext);
      if (relativePath.includes("..")) throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62");
      const adapter = this.vaultAdapter;
      const stat = await adapter.stat(relativePath);
      if (!stat || stat.type !== "file") throw new Error("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A" + relativePath);
      const buffer = await adapter.readBinary(relativePath);
      this.respond(id, { data: this.toDataUrl(buffer, ext) });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : "\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25");
    }
  }
  /** 读取本机绝对路径音频（兼容旧音源；移动端沙盒下可能不可读） */
  async handleReadLocalFile(id, payload) {
    try {
      const p = payload;
      const filePath = p.path || "";
      if (!filePath) throw new Error("\u672A\u63D0\u4F9B\u6587\u4EF6\u8DEF\u5F84");
      const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) throw new Error("\u4E0D\u652F\u6301\u7684\u97F3\u9891\u683C\u5F0F\uFF1A" + ext);
      if (filePath.includes("..")) throw new Error("\u8DEF\u5F84\u904D\u5386\u7981\u6B62");
      const buffer = await this.vaultAdapter.readBinary(filePath);
      this.respond(id, { data: this.toDataUrl(buffer, ext) });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : "\u8BFB\u53D6\u672C\u5730\u6587\u4EF6\u5931\u8D25");
    }
  }
  /** 代理外部音源链接：插件端 requestUrl 不受 webview CORS 限制（桌面/移动均支持） */
  async handleProxyAudioUrl(id, payload) {
    try {
      const p = payload;
      const url = p.url || "";
      if (!isValidAudioUrl(url)) throw new Error("\u975E\u6CD5\u97F3\u6E90\u94FE\u63A5\uFF08\u4EC5\u652F\u6301 http/https\uFF09");
      const resp = await (0, import_obsidian3.requestUrl)({ url, method: "GET" });
      if (resp.status < 200 || resp.status >= 300) {
        throw new Error("\u97F3\u6E90\u8BBF\u95EE\u5931\u8D25 (HTTP " + resp.status + ")");
      }
      const buffer = resp.arrayBuffer;
      if (!buffer) throw new Error("\u97F3\u6E90\u54CD\u5E94\u4E3A\u7A7A");
      const mime = resp.headers && resp.headers["content-type"] || "application/octet-stream";
      this.respond(id, { data: `data:${mime};base64,${arrayBufferToBase64(buffer)}` });
    } catch (e) {
      this.respondError(id, e instanceof Error ? e.message : "\u4EE3\u7406\u97F3\u6E90\u5931\u8D25");
    }
  }
  /** ArrayBuffer → 带 MIME 的 base64 data URL */
  toDataUrl(buffer, ext) {
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    return `data:${mime};base64,${arrayBufferToBase64(buffer)}`;
  }
};

// src/views/DailyReviewView.ts
var VIEW_TYPE_DAILY_REVIEW = "bamboo-immortals";
var DailyReviewView = class extends import_obsidian4.ItemView {
  constructor(leaf, pluginDir, _plugin, settings, saveSettings) {
    super(leaf);
    this.appHost = null;
    this.appAPI = null;
    this.iframe = null;
    this.cssChangeRef = null;
    this.pluginDir = pluginDir;
    this.plugin = _plugin;
    this.settings = settings;
    this.saveSettings = saveSettings;
  }
  getViewType() {
    return VIEW_TYPE_DAILY_REVIEW;
  }
  getDisplayText() {
    return "\u7AF9\u6797\u4FEE\u4ED9\u4F20";
  }
  getIcon() {
    return "leaf";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("bamboo-review-container");
    if (!this.pluginDir) {
      container.createEl("div", {
        text: "\u7AF9\u6797\u4FEE\u4ED9\u4F20: \u65E0\u6CD5\u5B9A\u4F4D\u63D2\u4EF6\u76EE\u5F55",
        cls: "bamboo-review-error"
      });
      return;
    }
    this.appAPI = new AppAPI(
      this.app,
      this.settings,
      this.saveSettings,
      this.settings.noisePath || "",
      this.app.vault.configDir
    );
    await this.appAPI.ensureStructure();
    this.appAPI.onAiImproveGoal = (payload) => {
      const plugin = this.plugin;
      plugin?.requestAiImprove?.(payload);
    };
    const customThemes = await this.scanCustomThemes();
    this.appAPI.setCustomThemes(customThemes);
    const version = this.plugin?.manifest?.version ?? "";
    this.appHost = new AppHost(this.app, this.pluginDir, version);
    const loadingEl = container.createEl("div", {
      text: "\u7AF9\u6797\u4FEE\u4ED9\u4F20\u52A0\u8F7D\u4E2D\u2026",
      cls: "bamboo-review-loading"
    });
    try {
      this.appAPI.startListening();
      const blobUrl = await this.appHost.buildBlobUrl();
      this.iframe = container.createEl("iframe", {
        cls: "bamboo-review-frame",
        attr: {
          src: blobUrl,
          allow: "camera; microphone; clipboard-read; clipboard-write"
        }
      });
      loadingEl.remove();
      this.appAPI.bindIframe(this.iframe);
      this.cssChangeRef = this.app.workspace.on("css-change", () => {
        this.appAPI?.onThemeChanged(this.settings.followObsidianTheme);
      });
    } catch (e) {
      loadingEl.remove();
      console.error("[BambooReview] \u52A0\u8F7D webapp \u5931\u8D25:", e);
      container.createEl("div", {
        text: `\u7AF9\u6797\u4FEE\u4ED9\u4F20\u52A0\u8F7D\u5931\u8D25: ${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`,
        cls: "bamboo-review-error"
      });
    }
  }
  async onClose() {
    if (this.cssChangeRef) {
      this.app.workspace.offref(this.cssChangeRef);
      this.cssChangeRef = null;
    }
    this.appAPI?.detach();
    this.appAPI = null;
    this.appHost?.destroy();
    this.appHost = null;
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
  /** 接收来自插件的导航/操作指令 */
  sendCommand(type) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage(
      { type, id: "cmd_" + Date.now() },
      "*"
    );
  }
  /** 扫描 Vault 中的自定义主题 */
  async scanCustomThemes() {
    const themes = [];
    const adapter = this.app.vault.adapter;
    try {
      const themeDirName = this.settings.themePath || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
      let themeDirFiles;
      try {
        themeDirFiles = (await adapter.list(themeDirName)).files;
      } catch {
        return themes;
      }
      for (const entry of themeDirFiles) {
        if (!entry.endsWith(".js")) continue;
        const filePath = `${themeDirName}/${entry}`;
        try {
          const code = await adapter.read(filePath);
          if (!code.includes("__bamboo_theme_")) {
            console.warn(`[BambooReview] \u81EA\u5B9A\u4E49\u4E3B\u9898 ${entry} \u7F3A\u5C11 __bamboo_theme_ \u6807\u8BC6\u7B26\uFF0C\u5DF2\u8DF3\u8FC7`);
            continue;
          }
          themes.push({ name: entry.replace(/\.js$/, ""), code });
        } catch (err2) {
          console.error(`[BambooReview] \u8BFB\u53D6\u81EA\u5B9A\u4E49\u4E3B\u9898 ${entry} \u5931\u8D25:`, err2 instanceof Error ? err2.message : String(err2));
        }
      }
      if (themes.length > 0) {
        console.debug(`[BambooReview] \u53D1\u73B0 ${themes.length} \u4E2A\u81EA\u5B9A\u4E49\u4E3B\u9898:`, themes.map((t) => t.name));
      }
    } catch (err2) {
      console.debug("[BambooReview] \u626B\u63CF\u81EA\u5B9A\u4E49\u4E3B\u9898\u65F6\u51FA\u9519:", err2 instanceof Error ? err2.message : String(err2));
    }
    return themes;
  }
};

// src/host/WebappController.ts
var WebappController = class {
  constructor(getTarget) {
    this.getTarget = getTarget;
  }
  send(type) {
    this.getTarget()?.sendCommand(type);
  }
  /** 前一天 */
  navPrevDay() {
    this.send("nav:prevDay");
  }
  /** 后一天 */
  navNextDay() {
    this.send("nav:nextDay");
  }
  /** 回到今天 */
  navToday() {
    this.send("nav:today");
  }
  /** 打开统计分析 */
  openStats() {
    this.send("action:openStats");
  }
  /** 打开应用设置 */
  openSettings() {
    this.send("action:openSettings");
  }
  /**
   * 通知 webapp 目标库已变更（host→webapp）。
   * webapp 收到后调用 GoalService.load() 重读 goals.json 并 store.notify() 局部刷新，
   * 不触发全局 renderAll，避免冲掉时间轴 / 进行中状态。
   */
  notifyGoalsChanged() {
    this.getTarget()?.sendCommand("goals:changed");
  }
};

// src/settings/PluginSettings.ts
var import_obsidian5 = require("obsidian");
var DEFAULT_SETTINGS = {
  dataPath: "bamboo-review",
  enableMarkdownSync: true,
  sectionConfig: null,
  themePath: "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898",
  noisePath: "",
  noiseItems: [],
  syncPaletteToObsidian: false,
  followObsidianTheme: true,
  aiEnabled: false,
  aiApiKey: "",
  aiBaseUrl: "https://api.deepseek.com/v1",
  aiModel: "deepseek-chat",
  aiDecomposeDepth: "\u4E2D"
};
var PluginSettings = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("bamboo-review-settings");
    new import_obsidian5.Setting(containerEl).setName("\u7AF9\u6797\u4FEE\u4ED9\u4F20 - \u8BBE\u7F6E").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u6570\u636E\u5B58\u50A8").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u6570\u636E\u5B58\u50A8\u8DEF\u5F84").setDesc("\u590D\u76D8\u6570\u636E\u5728 Vault \u4E2D\u7684\u5B58\u50A8\u76EE\u5F55\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("bamboo-review").setValue(this.plugin.settings.dataPath).onChange(async (value) => {
        this.plugin.settings.dataPath = value || "bamboo-review";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u81EA\u52A8\u751F\u6210 Markdown \u6458\u8981").setDesc("\u6BCF\u6B21\u4FDD\u5B58\u590D\u76D8\u6570\u636E\u65F6\uFF0C\u81EA\u52A8\u5728 reviews/ \u76EE\u5F55\u4E0B\u751F\u6210\u53EF\u8BFB\u7684 .md \u6587\u4EF6").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enableMarkdownSync).onChange(async (value) => {
        this.plugin.settings.enableMarkdownSync = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u4E3B\u9898\u52A8\u6548").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u81EA\u5B9A\u4E49\u4E3B\u9898\u8DEF\u5F84").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u5B58\u653E\u81EA\u5B9A\u4E49\u4E3B\u9898 .js \u6587\u4EF6\u7684\u6587\u4EF6\u5939\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u7AF9\u6797\u590D\u76D8\u4E3B\u9898").setValue(this.plugin.settings.themePath).onChange(async (value) => {
        this.plugin.settings.themePath = value || "\u7AF9\u6797\u590D\u76D8\u4E3B\u9898";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u767D\u566A\u97F3").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u767D\u566A\u97F3\u6587\u4EF6\u5939").setDesc("Vault \u6839\u76EE\u5F55\u4E0B\u7684\u76F8\u5BF9\u8DEF\u5F84\uFF0C\u6307\u5B9A\u540E\u4EC5\u626B\u63CF\u8BE5\u6587\u4EF6\u5939\u5185\u7684\u97F3\u9891\u6587\u4EF6\u3002\u7559\u7A7A\u5219\u626B\u63CF\u6574\u4E2A\u5E93\uFF08\u4FEE\u6539\u540E\u9700\u91CD\u542F\u63D2\u4EF6\uFF09").addText(
      (text) => text.setPlaceholder("\u767D\u566A\u97F3 \u6216\u7559\u7A7A\u626B\u63CF\u5168\u5E93").setValue(this.plugin.settings.noisePath).onChange(async (value) => {
        this.plugin.settings.noisePath = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u8C03\u8272\u8054\u52A8").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u8DDF\u968F Obsidian \u4E3B\u9898\u914D\u8272").setDesc("\u6253\u5F00\u540E\uFF0C\u63D2\u4EF6\u6574\u4F53\u914D\u8272\u4F1A\u8DDF\u968F\u5F53\u524D Obsidian \u4E3B\u9898\u7684\u5F3A\u8C03\u8272\uFF08--interactive-accent\uFF09\u3002\u5207\u6362 Bamboo China \u7684\u7AF9\u5F71 / \u58A8\u591C / \u80ED\u8102 / \u9752\u7EFF\u7B49\u610F\u5883\u65F6\uFF0C\u63D2\u4EF6\u914D\u8272\u968F\u4E4B\u8054\u52A8").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.followObsidianTheme).onChange(async (value) => {
        this.plugin.settings.followObsidianTheme = value;
        await this.plugin.saveSettings();
        const frame = activeDocument.querySelector(".bamboo-review-frame");
        if (!frame?.contentWindow) return;
        if (value) {
          const accent = getComputedStyle(activeDocument.body).getPropertyValue("--interactive-accent").trim();
          const hue = ThemeBridge.rgbToHue(accent);
          const sidebar = getComputedStyle(activeDocument.body).getPropertyValue("--background-secondary").trim();
          const bg = ThemeBridge.rgbToRgbString(sidebar);
          const textNormal = getComputedStyle(activeDocument.body).getPropertyValue("--text-normal").trim();
          const textNormalRgb = ThemeBridge.rgbToRgbString(textNormal);
          const textMuted = getComputedStyle(activeDocument.body).getPropertyValue("--text-muted").trim();
          const textMutedRgb = ThemeBridge.rgbToRgbString(textMuted);
          const payload = {
            isDark: activeDocument.body.classList.contains("theme-dark")
          };
          if (hue !== null) payload.hue = hue;
          if (bg !== null) payload.bg = bg;
          if (textNormalRgb !== null) payload.textNormal = textNormalRgb;
          if (textMutedRgb !== null) payload.textMuted = textMutedRgb;
          frame.contentWindow.postMessage({
            type: "theme:changed",
            id: "settings_" + Date.now(),
            payload
          }, "*");
        } else {
          frame.contentWindow.postMessage({
            type: "theme:followDisabled",
            id: "settings_" + Date.now(),
            payload: {}
          }, "*");
        }
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u5C06\u8C03\u8272\u540C\u6B65\u5230 Obsidian").setDesc("\u6253\u5F00\u540E\uFF0Cwebapp \u5185\u60AC\u6D6E\u83DC\u5355\u7684\u8272\u76F8/\u660E\u5EA6\u8C03\u8272\u4F1A\u5B9E\u65F6\u540C\u6B65\u5230 Obsidian \u7684\u539F\u751F\u754C\u9762\u914D\u8272").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.syncPaletteToObsidian).onChange(async (value) => {
        this.plugin.settings.syncPaletteToObsidian = value;
        await this.plugin.saveSettings();
        if (!value) {
          ThemeBridge.restoreDefaults();
        }
        const frame = activeDocument.querySelector(".bamboo-review-frame");
        if (frame?.contentWindow) {
          frame.contentWindow.postMessage({
            type: "theme:syncPaletteEnabled",
            id: "settings_" + Date.now(),
            payload: { enabled: value }
          }, "*");
        }
      })
    );
    new import_obsidian5.Setting(containerEl).setName("AI \u89C4\u5212\uFF08\u81EA\u7136\u8BED\u8A00 \u2192 \u76EE\u6807\u5361\u7247\uFF09").setHeading();
    new import_obsidian5.Setting(containerEl).setName("\u542F\u7528 AI \u89C4\u5212").setDesc("\u5F00\u542F\u540E\uFF0C\u53EF\u5728\u7B14\u8BB0\u4E2D\u8FD0\u884C\u300CAI \u89C4\u5212\uFF1A\u5C06\u5F53\u524D\u7B14\u8BB0\u8F6C\u4E3A\u76EE\u6807\u5361\u7247\u300D\u547D\u4EE4\uFF0C\u7531\u5927\u6A21\u578B\u62C6\u89E3\u76EE\u6807\u5E76\u5199\u5165\u590D\u76D8\u3002").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.aiEnabled).onChange(async (value) => {
        this.plugin.settings.aiEnabled = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("API Key").setDesc("\u5927\u6A21\u578B\u670D\u52A1\u9274\u6743\u5BC6\u94A5\uFF08Bearer Token\uFF09\u3002\u4EC5\u4FDD\u5B58\u5728\u672C\u5E93 settings.json\uFF0C\u4E0D\u4E0A\u4F20\u3002").addText(
      (text) => text.setPlaceholder("sk-...").setValue(this.plugin.settings.aiApiKey).onChange(async (value) => {
        this.plugin.settings.aiApiKey = value.trim();
        await this.plugin.saveSettings();
      })
    ).then((setting) => {
      const input = setting.controlEl.querySelector("input");
      if (input) input.type = "password";
    });
    new import_obsidian5.Setting(containerEl).setName("Base URL").setDesc("API \u57FA\u5730\u5740\uFF08\u4E0D\u542B /chat/completions \u540E\u7F00\uFF09\u3002\u9ED8\u8BA4 DeepSeek v1\u3002").addText(
      (text) => text.setPlaceholder("https://api.deepseek.com/v1").setValue(this.plugin.settings.aiBaseUrl).onChange(async (value) => {
        this.plugin.settings.aiBaseUrl = value.trim() || "https://api.deepseek.com/v1";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u6A21\u578B").setDesc("\u6A21\u578B\u540D\uFF0C\u5982 deepseek-chat / gpt-4o-mini\u3002\u9700\u517C\u5BB9 OpenAI Chat Completions JSON \u6A21\u5F0F\u3002").addText(
      (text) => text.setPlaceholder("deepseek-chat").setValue(this.plugin.settings.aiModel).onChange(async (value) => {
        this.plugin.settings.aiModel = value.trim() || "deepseek-chat";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u9ED8\u8BA4\u62C6\u89E3\u7C92\u5EA6").setDesc("AI \u628A\u76EE\u6807\u62C6\u6210\u5B50\u9879\u7684\u7EC6\u7C92\u5EA6\uFF1A\u7C97(2-3) / \u4E2D(3-6) / \u7EC6(5-8)\u3002\u53EF\u5728\u5BA1\u9605\u5F39\u7A97\u91CC\u518D\u9010\u6761\u5220\u6539\u3002").addDropdown(
      (dropdown) => dropdown.addOption("\u7C97", "\u7C97\uFF082-3 \u5B50\u9879\uFF09").addOption("\u4E2D", "\u4E2D\uFF083-6 \u5B50\u9879\uFF09").addOption("\u7EC6", "\u7EC6\uFF085-8 \u5B50\u9879\uFF09").setValue(this.plugin.settings.aiDecomposeDepth).onChange(async (value) => {
        this.plugin.settings.aiDecomposeDepth = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("\u5173\u4E8E").setHeading();
    const pluginBox = containerEl.createDiv({ cls: "bamboo-about-card" });
    pluginBox.createEl("p", { text: "\u63D2\u4EF6\u7B80\u4ECB", cls: "bamboo-about-label" });
    pluginBox.createEl("p", {
      text: 'Bamboo Immortals\uFF08\u7AF9\u6797\u4FEE\u4ED9\u4F20\uFF09\u662F\u4E00\u6B3E\u57FA\u4E8E\u82CF\u8054\u63A7\u5236\u8BBA\u4E4B\u7236\u7EF4\u514B\u6258\xB7\u683C\u5362\u4EC0\u79D1\u592B\u63D0\u51FA\u7684"OGAS"\u7406\u5FF5\uFF0C\u4E13\u4E3A\u4E2A\u4EBA\u6253\u9020\u7684\u4E2D\u56FD\u98CE\u76EE\u6807\u81EA\u52A8\u5316\u5206\u914D\u7BA1\u7406\u7CFB\u7EDF\u3002',
      cls: "bamboo-about-desc"
    });
    const authorBox = containerEl.createDiv({ cls: "bamboo-about-card bamboo-about-author" });
    const authorRow = authorBox.createDiv({ cls: "bamboo-about-author-row" });
    const avatar = authorRow.createDiv({ cls: "bamboo-about-avatar" });
    void (async () => {
      try {
        const pluginDir = this.plugin.manifest.dir ?? "";
        const adapter = this.app.vault.adapter;
        const candidates = [
          `${pluginDir}/author-avatar.jpg`,
          `${pluginDir}/webapp/assets/images/author-avatar.jpg`
        ];
        for (const avatarPath of candidates) {
          const exists = await adapter.exists(avatarPath);
          if (!exists) continue;
          const avatarData = await adapter.readBinary(avatarPath);
          const b64 = Buffer.from(avatarData).toString("base64");
          avatar.setCssStyles({
            backgroundImage: `url(data:image/jpeg;base64,${b64})`
          });
          break;
        }
      } catch {
      }
    })();
    const authorInfo = authorRow.createDiv({ cls: "bamboo-about-author-info" });
    authorInfo.createEl("p", { text: "\u7FBD\u9CDE\u541B", cls: "bamboo-about-author-name" });
    authorInfo.createEl("p", { text: "\u55B5\u5B57\u9986\u521B\u59CB\u4EBA", cls: "bamboo-about-author-role" });
    authorBox.createEl("p", { text: "Obsidian \u63D2\u4EF6\u4F5C\u54C1", cls: "bamboo-about-works-label" });
    const worksRow = authorBox.createDiv({ cls: "bamboo-about-works-row" });
    [
      { name: "\u7AF9\u53F6\u98DE\u5203", url: "https://github.com/miaoziguan/obsidian-Bamboo-Darts" },
      { name: "\u7AF9\u6797\u4FEE\u4ED9\u4F20", url: "https://github.com/miaoziguan/obsidian-bamboo-immortals" }
    ].forEach((work) => {
      const tag = worksRow.createEl("span", { text: work.name, cls: "bamboo-about-tag" });
      if (work.url) {
        tag.setCssStyles({ cursor: "pointer" });
        tag.addEventListener("click", () => {
          window.open(work.url, "_blank");
        });
      }
    });
    const contactBox = containerEl.createDiv({ cls: "bamboo-about-card" });
    contactBox.createEl("p", { text: "\u8054\u7CFB\u65B9\u5F0F", cls: "bamboo-about-label" });
    contactBox.createEl("p", { text: "\u90AE\u7BB1\uFF1Ayanyulin2100@qq.com", cls: "bamboo-about-desc" });
    contactBox.createEl("p", { text: "\u5FAE\u4FE1\uFF1Ayanhu94", cls: "bamboo-about-desc" });
  }
};

// src/ai/MarkdownPlanner.ts
var import_obsidian6 = require("obsidian");

// src/types/data.ts
var GOAL_CATEGORIES = [
  { id: "work", name: "\u5DE5\u4F5C", icon: "\u{1F4BC}" },
  { id: "personal", name: "\u4E2A\u4EBA", icon: "\u{1F331}" },
  { id: "health", name: "\u5065\u5EB7", icon: "\u{1F3C3}" },
  { id: "study", name: "\u5B66\u4E60", icon: "\u{1F4DA}" },
  { id: "finance", name: "\u8D22\u52A1", icon: "\u{1F4B0}" },
  { id: "other", name: "\u5176\u4ED6", icon: "\u{1F9E9}" }
];

// src/ai/GoalCardValidator.ts
var DEFAULT_TASK_DAY_TYPE = "daily";
var CATEGORY_SET = new Set(GOAL_CATEGORIES.map((c) => c.id));
function extractUnit(name) {
  const bracket = name.match(/[（(]([一-龥]+)[)）]/);
  if (bracket) return bracket[1];
  const suffix = name.match(/每[一天日周月]?(.+?)数/);
  if (suffix) return suffix[1];
  return "";
}
function str(v, fallback = "") {
  return typeof v === "string" ? v : fallback;
}
function num(v, fallback = 0) {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}
function cleanDailyMin(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed;
  const prefix = trimmed.match(/^(\d+(?:\.\d+)?)/);
  if (prefix) return prefix[1];
  const stripped = trimmed.replace(/[^0-9.]/g, "");
  const valid = stripped.match(/\d+(\.\d+)?/);
  return valid ? valid[0] : "";
}
function isQuantified(v) {
  return typeof v === "string" && /^\d+(\.\d+)?$/.test(v.trim());
}
function sanitizeSubItem(raw, idx) {
  const it = raw && typeof raw === "object" ? raw : {};
  return {
    name: str(it.name) || `\u5B50\u9879${idx + 1}`,
    percent: typeof it.percent === "number" ? it.percent : void 0,
    detail: str(it.detail) || void 0,
    startDate: str(it.startDate),
    endDate: str(it.endDate),
    startValue: str(it.startValue),
    targetValue: str(it.targetValue),
    currentValue: str(it.currentValue),
    dailyMin: cleanDailyMin(it.dailyMin),
    taskDayType: str(it.taskDayType) || DEFAULT_TASK_DAY_TYPE,
    sourceRef: str(it.sourceRef) || void 0
  };
}
function sanitizeGoal(raw) {
  const g = raw && typeof raw === "object" ? raw : {};
  const categoryRaw = str(g.category);
  const category = CATEGORY_SET.has(categoryRaw) ? categoryRaw : "other";
  const itemsRaw = Array.isArray(g.items) ? g.items : [];
  const items = itemsRaw.map((it, i) => sanitizeSubItem(it, i));
  return {
    id: str(g.id) || `goal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title: str(g.title) || "\u672A\u547D\u540D\u76EE\u6807",
    // AI 归纳分析（仅展示用）：保留用户输入，避免被"丢未知字段"静默丢弃
    analysis: str(g.analysis) || void 0,
    // 严格禁止 AI 写入 icon 字段（icon 仅供手动创建的目标使用）
    meta: str(g.meta) || void 0,
    category,
    startDate: str(g.startDate),
    endDate: str(g.endDate),
    progress: num(g.progress, 0),
    priority: typeof g.priority === "string" || typeof g.priority === "number" ? g.priority : void 0,
    items,
    sourceRef: str(g.sourceRef) || void 0
  };
}
function validateGoals(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((g) => sanitizeGoal(g));
}
function classifyCompleteness(goal) {
  const missing = [];
  if (!goal.category) missing.push("\u5206\u7C7B");
  if (!goal.endDate || goal.endDate.trim() === "") missing.push("\u622A\u6B62\u65E5");
  const items = goal.items ?? [];
  if (items.length > 0) {
    const unquantified = items.filter((it) => !isQuantified(it.dailyMin)).length;
    if (unquantified > 0) missing.push(`\u6BCF\u65E5\u91CF\uFF08${unquantified} \u4E2A\u5B50\u9879\u672A\u91CF\u5316\uFF09`);
    const hasRhythm = items.every((it) => it.taskDayType && String(it.taskDayType).trim() !== "");
    if (!hasRhythm) missing.push("\u8282\u594F");
  }
  return {
    level: missing.length > 0 ? "thin" : "complete",
    missing
  };
}

// src/ai/MarkdownPlanner.ts
var DEPTH_HINT = {
  \u7C97: "2-3",
  \u4E2D: "3-6",
  \u7EC6: "5-8"
};
var CATEGORY_IDS = GOAL_CATEGORIES.map((c) => c.id).join(" | ");
function buildPrompt(content, depth = "\u4E2D", scope = "note") {
  const count = DEPTH_HINT[depth] ?? DEPTH_HINT["\u4E2D"];
  const scopeNote = scope === "selection" ? "\u82E5\u8F93\u5165\u662F\u7528\u6237\u4ECE\u7B14\u8BB0\u4E2D\u9009\u4E2D\u7684\u7247\u6BB5\uFF0C\u8BF7\u76F4\u63A5\u628A\u5B83\u5F53\u4F5C\u7528\u6237\u7684\u5B8C\u6574\u610F\u56FE\u6765\u62C6\u89E3\uFF0C\u4E0D\u8981\u5047\u8BBE\u7B14\u8BB0\u91CC\u8FD8\u6709\u5176\u5B83\u5185\u5BB9\u3001\u4E5F\u4E0D\u8981\u5F53\u6210\u6574\u7BC7\u7B14\u8BB0\u7684\u6458\u8981\u3002" : "";
  const system = `\u4F60\u662F\u4E00\u4E2A\u76EE\u6807\u62C6\u89E3\u52A9\u624B\uFF0C\u670D\u52A1\u4E8E\u4E2A\u4EBA\u76EE\u6807\u7BA1\u7406\u63D2\u4EF6\u300C\u7AF9\u6797\u4FEE\u4ED9\u4F20\u300D\u3002
\u8F93\u5165\u662F\u4E00\u7BC7 Markdown \u7B14\u8BB0\u6B63\u6587\uFF1B\u4F60\u7684\u4EFB\u52A1\u662F\u4ECE\u4E2D\u8BC6\u522B\u7528\u6237\u60F3\u8981\u8FBE\u6210\u7684\u76EE\u6807\uFF08Goal\uFF09\uFF0C\u5E76\u628A\u6BCF\u4E2A\u76EE\u6807\u62C6\u6210\u591A\u4E2A\u53EF\u6267\u884C\u7684\u5B50\u9879\uFF08SubItem\uFF09\u3002${scopeNote}

# \u6838\u5FC3\u54F2\u5B66\uFF08\u6700\u91CD\u8981\uFF0C\u51CC\u9A7E\u4E8E\u4E00\u5207\uFF09
\u672C\u8F6F\u4EF6\u7684\u6838\u5FC3\u4EF7\u503C\u662F\u628A\u76EE\u6807\u300C\u91CF\u5316\u300D\uFF0C\u5E76\u843D\u5230\u300C\u65E5\u300D\u9897\u7C92\u5EA6\u3002\u4F60\u7684\u6BCF\u4E00\u4E2A\u5B50\u9879\u90FD\u5FC5\u987B\u80FD\u56DE\u7B54\u4E00\u4E2A\u95EE\u9898\uFF1A\u300C\u4ECA\u5929\u8981\u505A\u591A\u5C11\uFF1F\u300D
- \u91CF\u5316\uFF1A\u6BCF\u4E2A\u5B50\u9879\u5FC5\u987B\u6709\u4E00\u4E2A\u7EAF\u6570\u5B57\u7684\u6BCF\u65E5\u91CF dailyMin\uFF08\u5982 "30"\u3001"2"\u3001"200"\uFF09\uFF0C\u4E0D\u5E26\u4EFB\u4F55\u5355\u4F4D\u6216\u6587\u5B57\u3002
- \u65E5\u9897\u7C92\u5EA6\uFF1A\u628A"\u7ED3\u679C\u578B/\u5B8F\u5927\u76EE\u6807"\u7FFB\u8BD1\u6210"\u6BCF\u5929\u7684\u53EF\u6267\u884C\u52A8\u4F5C"\u3002
  \xB7 "\u8BFB\u5B8C\u300AXX\u300B" \u2192 \u5B50\u9879"\u6BCF\u5929\u9605\u8BFB\u9875\u6570"\uFF0CdailyMin "30"
  \xB7 "\u51CF\u5C11\u96F6\u98DF" \u2192 \u5B50\u9879"\u6BCF\u5929\u96F6\u98DF\u70ED\u91CF\u4E0A\u9650(\u5343\u5361)"\uFF0CdailyMin "200"
  \xB7 "\u65E9\u7761" \u2192 \u5B50\u9879"\u6BCF\u5929\u7761\u7720\u65F6\u957F(\u5C0F\u65F6)"\uFF0CdailyMin "7"
- \u5B50\u9879\u540D name \u5E94\u5305\u542B\u91CF\u5316\u7EF4\u5EA6\uFF08\u5982"\u6BCF\u5929\u9605\u8BFB\u9875\u6570"\u800C\u975E"\u8BFB\u4E66"\uFF09\u3002
- \u62D2\u7EDD\u6A21\u7CCA\uFF1A\u7EDD\u4E0D\u4EA7\u51FA\u65E0\u6CD5\u91CF\u5316\u7684\u5B50\u9879\uFF08\u5982"\u575A\u6301""\u52AA\u529B""\u4FDD\u6301"\uFF09\uFF1B\u82E5\u4E00\u4E2A\u60F3\u6CD5\u65E0\u6CD5\u91CF\u5316\uFF0C\u5C31\u6539\u5199\u6210\u80FD\u91CF\u5316\u7684\u65E5\u7EA7\u884C\u4E3A\u3002
- **\u65F6\u95F4\u9A71\u52A8\u89C4\u5212\uFF08\u5173\u952E\uFF09**\uFF1A\u5F53\u4F60\u80FD\u63A8\u65AD\u8D77\u6B62\u65F6\u95F4\uFF08startDate \u548C endDate\uFF09\uFF0C\u5E94\u4E3B\u52A8\u7528\u5B83\u53CD\u63A8 dailyMin\uFF0C\u800C\u4E0D\u662F\u51ED\u7A7A\u731C\uFF1A
  \xB7 \u603B\u5929\u6570 = endDate - startDate
  \xB7 \u82E5 targetValue \u53EF\u91CF\u5316\u4E14\u53EF\u5747\u644A\uFF1A\u300C3\u4E2A\u6708\u8BFB\u5B8C3\u672C\u4E66\uFF0C\u6BCF\u672C\u7EA6300\u9875\u300D \u2192 900\u9875\xF790\u5929=10\u9875/\u5929 \u2192 dailyMin "10"
  \xB7 \u82E5 targetValue \u4E0D\u53EF\u76F4\u63A5\u5747\u644A\uFF08\u5982"\u51CF\u91CD5kg"\u4F53\u91CD\u975E\u7EBF\u6027\uFF09\uFF1A\u62C6\u4E3A\u53EF\u5747\u644A\u7684\u884C\u52A8\u5B50\u9879\uFF0C\u5982"\u6BCF\u5929\u8FD0\u52A8\u6D88\u8017(\u5343\u5361)"\uFF0CdailyMin \u53D6\u5408\u7406\u503C
  \xB7 \u7528 reason \u8BF4\u660E\u8BA1\u7B97\u4F9D\u636E\uFF08\u5982"900\u9875\xF790\u5929\u224810\u9875/\u5929"\uFF09\uFF0C\u8BA9\u7528\u6237\u53EF\u6838\u5B9E
  \xB7 \u82E5\u8D77\u6B62\u65F6\u95F4\u6216\u603B\u91CF\u786E\u5B9E\u65E0\u6CD5\u63A8\u65AD\uFF0C\u6309\u5E38\u8BC6\u7ED9\u4E00\u4E2A\u4FDD\u5B88 dailyMin\uFF0C\u4E0D\u5F3A\u884C\u7559\u7A7A

# \u5B50\u9879\u76F8\u5173\u6027 & \u53EF\u91CF\u5316\u62A4\u680F\uFF08\u786C\u6027\u8981\u6C42\uFF0C\u4E0E\u6838\u5FC3\u54F2\u5B66\u540C\u7B49\u91CD\u8981\uFF09
\u5B50\u9879\u5FC5\u987B\u540C\u65F6\u6EE1\u8DB3\u300C\u56F4\u7ED5\u76EE\u6807\u300D\u4E0E\u300C\u53EF\u91CF\u5316\u300D\u4E24\u6761\u94C1\u5F8B\uFF0C\u7F3A\u4E00\u4E0D\u53EF\uFF1B\u4EFB\u4E00\u4E0D\u6EE1\u8DB3\u90FD\u4E0D\u51C6\u4EA7\u51FA\u3002

## \u94C1\u5F8B\u4E00\uFF1A\u5FC5\u987B\u56F4\u7ED5\u76EE\u6807\uFF08\u62D2\u7EDD\u8DD1\u9898\uFF09
- \u6BCF\u4E2A\u5B50\u9879\u90FD\u8981\u80FD\u76F4\u63A5\u56DE\u7B54\uFF1A\u300C\u4ECA\u5929\u505A\u8FD9\u4EF6\u4E8B\uFF0C\u662F\u5426\u63A8\u8FDB\u4E86\u8FD9\u4E2A\u76EE\u6807\uFF1F\u300D\u80FD\u63A8\u8FDB\u624D\u7B97\u76F8\u5173\u3002
- \u4E25\u7981\u88C5\u9970\u6027\u3001\u6CDB\u5316\u6027\u3001\u4E0E\u76EE\u6807\u5F31\u76F8\u5173\u7684\u5B50\u9879\u3002\u4F8B\uFF1A\u76EE\u6807\u662F"3\u4E2A\u6708\u5B66\u4F1AReact"\uFF0C\u5B50\u9879"\u6BCF\u5929\u559D\u6C348\u676F""\u6BCF\u5929\u6563\u6B65"\u5C31\u5C5E\u4E8E\u79BB\u9898\uFF0C\u5FC5\u987B\u5220\u9664\u6216\u6539\u5199\u6210\u670D\u52A1\u76EE\u6807\u7684\u52A8\u4F5C\uFF08\u5982"\u6BCF\u5929\u5199React\u7EC4\u4EF6(\u4E2A)"\uFF09\u3002
- \u82E5\u4E00\u4E2A\u7075\u611F\u53EA\u4E0E\u76EE\u6807\u5F31\u76F8\u5173\uFF0C\u5B81\u53EF\u4E22\u5F03\u4E5F\u4E0D\u8981\u585E\u8FDB\u89C4\u5212\u2014\u2014\u5E73\u5EB8\u5806\u780C\u4F1A\u964D\u4F4E\u53EF\u6267\u884C\u6027\u3002
- \u5B50\u9879\u540D\u5E94\u4F53\u73B0"\u76EE\u6807\u7EF4\u5EA6"\uFF1A\u51CF\u91CD\u76EE\u6807\u7684\u5B50\u9879\u5E94\u56F4\u7ED5\u70ED\u91CF/\u8FD0\u52A8/\u4F53\u91CD\uFF0C\u800C\u975E\u65E0\u5173\u7684"\u6BCF\u5929\u8BFB\u4E66"\u3002

## \u94C1\u5F8B\u4E8C\uFF1A\u5FC5\u987B\u53EF\u91CF\u5316\uFF08\u62D2\u7EDD\u96BE\u91CF\u5316\u4EFB\u52A1\uFF09
- \u675C\u7EDD"\u96BE\u4EE5\u91CF\u5316"\u7684\u4EFB\u52A1\uFF1A\u5982"\u63D0\u5347\u8BED\u611F""\u589E\u5F3A\u81EA\u4FE1""\u4FDD\u6301\u597D\u5FC3\u60C5""\u52A0\u6DF1\u7406\u89E3""\u63D0\u9AD8\u5BA1\u7F8E"\u3002\u8FD9\u4E9B\u8BCD\u65E0\u6CD5\u76F4\u63A5\u8BA1\u6570\uFF0C\u4E14\u6BCF\u65E5\u65E0\u6CD5\u6838\u9A8C\u3002
- \u5FC5\u987B\u628A"\u96BE\u91CF\u5316"\u6539\u5199\u6210"\u53EF\u8BA1\u6570/\u53EF\u5EA6\u91CF"\u7684\u65E5\u7EA7\u884C\u4E3A\uFF08\u6539\u5199\u8303\u5F0F\uFF09\uFF1A
  \xB7 "\u63D0\u5347\u82F1\u8BED" \u2192 "\u6BCF\u5929\u80CC\u5355\u8BCD(\u4E2A)" dailyMin "20"\uFF1B\u6216 "\u6BCF\u5929\u542C\u529B(\u5206\u949F)" dailyMin "15"
  \xB7 "\u5C11\u73A9\u624B\u673A" \u2192 "\u6BCF\u5929\u5C4F\u5E55\u65F6\u957F\u4E0A\u9650(\u5C0F\u65F6)" dailyMin "3"
  \xB7 "\u591A\u559D\u6C34" \u2192 "\u6BCF\u5929\u996E\u6C34\u91CF(\u676F)" dailyMin "8"\uFF08\u4EC5\u5F53\u8BE5\u76EE\u6807\u786E\u5C5E\u5065\u5EB7/\u51CF\u91CD\u76F8\u5173\u65F6\u624D\u4F5C\u4E3A\u5B50\u9879\uFF0C\u5426\u5219\u89C6\u4E3A\u79BB\u9898\uFF09
  \xB7 "\u4FDD\u6301\u597D\u5FC3\u6001" \u2192 \u6539\u5199\u4E3A\u5177\u4F53\u884C\u4E3A\uFF0C\u5982 "\u6BCF\u5929\u51A5\u60F3(\u5206\u949F)" dailyMin "10" / "\u6BCF\u5929\u8BB0\u5F55\u611F\u6069(\u6761)" dailyMin "1"
  \xB7 "\u6DF1\u5165\u7406\u89E3\u7B97\u6CD5" \u2192 "\u6BCF\u5929\u5237\u9898(\u9053)" dailyMin "2" / "\u6BCF\u5929\u8BFB\u6280\u672F\u6587(\u7BC7)" dailyMin "1"
- \u6539\u5199\u539F\u5219\uFF1A\u627E\u8BE5\u76EE\u6807\u7684"\u53EF\u6570\u4EE3\u7406\u6307\u6807"\uFF08\u9875\u6570/\u5206\u949F/\u4E2A\u6570/\u676F\u6570/\u5343\u5361/\u6B21\u6570\uFF09\uFF0C\u800C\u975E\u62BD\u8C61\u611F\u53D7\u3002
- \u82E5\u5B9E\u5728\u627E\u4E0D\u5230\u4EFB\u4F55\u53EF\u6570\u4EE3\u7406\u6307\u6807\uFF0C\u8BF4\u660E\u8BE5\u76EE\u6807\u672C\u8EAB\u4E0D\u9002\u5408\u62C6\u89E3\u2014\u2014\u8BE5 goal \u7684 items \u7559\u7A7A\uFF08reason \u8BF4\u660E\u539F\u56E0\uFF09\uFF0C\u4E5F\u4E0D\u8981\u7528"\u52AA\u529B""\u575A\u6301"\u7B49\u4F2A\u91CF\u5316\u8BCD\u51D1\u6570\u3002

# \u8F93\u51FA\u683C\u5F0F\uFF08\u4E25\u683C JSON\uFF0C\u4E0D\u8981\u4EFB\u4F55\u89E3\u91CA\u3001\u4E0D\u8981 markdown \u56F4\u680F\uFF09
{
  "goals": [
    {
      "title": "\u76EE\u6807\u6807\u9898\uFF08\u7B80\u6D01\uFF0C\u5C11\u4E8E20\u5B57\uFF09",
      "analysis": "\u4E00\u53E5\u8BDD\u5F52\u7EB3\u7B14\u8BB0\u4E3B\u65E8 + \u62C6\u89E3\u7406\u7531/\u5173\u952E\u98CE\u9669\uFF08\u226440\u5B57\uFF0C\u4EC5\u5C55\u793A\u7528\u4E0D\u6301\u4E45\u5316\uFF09",
      "category": "work | personal | health | study | finance | other",
      "startDate": "\u5F00\u59CB\u65E5\u671F YYYY-MM-DD\u3002\u7B14\u8BB0\u672A\u63D0\u53CA\u65F6\u5FC5\u987B\u586B\u4ECA\u5929\uFF08\u4E0E user \u6D88\u606F\u4E2D\u7684\u201C\u4ECA\u5929\u201D\u4E00\u81F4\uFF09\uFF0C\u4E0D\u8981\u7559\u7A7A",
      "endDate": "\u622A\u6B62\u65E5\u671F YYYY-MM-DD\uFF0C\u672A\u77E5\u7559\u7A7A\u4E32",
      "items": [
        {
          "name": "\u5B50\u9879\u540D\uFF08\u542B\u91CF\u5316\u7EF4\u5EA6\u7684\u53EF\u843D\u5730\u52A8\u4F5C\uFF0C\u5982'\u6BCF\u5929\u9605\u8BFB\u9875\u6570'\uFF09",
          "targetValue": "\u53EF\u91CF\u5316\u7684\u76EE\u6807\u503C(\u5B57\u7B26\u4E32)\uFF0C\u672A\u77E5\u7559\u7A7A\u4E32",
          "currentValue": "\u5F53\u524D\u5DF2\u8FBE\u6210\u503C(\u5B57\u7B26\u4E32)\uFF0C\u672A\u77E5\u7559\u7A7A\u4E32",
          "dailyMin": "\u6BCF\u5929\u9700\u63A8\u8FDB\u7684\u91CF\uFF0C\u5FC5\u987B\u662F\u7EAF\u6570\u5B57\u5B57\u7B26\u4E32(\u5982 '30')\uFF0C\u4E0D\u5E26\u5355\u4F4D",
          "taskDayType": "daily",
          "reason": "\u4E3A\u4F55\u8FD9\u6837\u62C6\uFF08\u4EC5\u5C55\u793A\u7528\uFF0C\u4E0D\u6301\u4E45\u5316\uFF09"
        }
      ]
    }
  ]
}

# \u89C4\u5219
1. \u53EA\u8F93\u51FA JSON\u3002\u82E5\u8BC6\u522B\u4E0D\u51FA\u4EFB\u4F55\u660E\u786E\u76EE\u6807\uFF0C\u8FD4\u56DE {"goals":[]}\u3002
2. dailyMin \u5FC5\u987B\u662F\u7EAF\u6570\u5B57\u5B57\u7B26\u4E32\uFF0C\u7981\u6B62\u643A\u5E26\u5355\u4F4D\u6216\u6587\u5B57\uFF08"30\u5206\u949F"\u2192"30"\uFF0C"7-8\u5C0F\u65F6"\u2192\u53D6\u4FDD\u5B88\u503C"7"\uFF09\u3002
3. \u82E5\u65E0\u6CD5\u76F4\u63A5\u63A8\u65AD\u6BCF\u5929\u505A\u591A\u5C11\uFF0C\u8BF7\u5229\u7528\u300C\u8D77\u6B62\u65F6\u95F4 + \u76EE\u6807\u603B\u91CF\u300D\u53CD\u63A8 dailyMin\uFF08\u53C2\u89C1\u6838\u5FC3\u54F2\u5B66\u7B2C5\u6761\uFF09\uFF1B\u5C3D\u91CF\u4E0D\u8981\u7559\u7A7A\u3002
4. \u5355\u4F4D\u4FE1\u606F\u653E\u8FDB\u5B50\u9879\u540D\u6216 targetValue\uFF08\u5982 name:"\u6BCF\u5929\u7761\u7720\u65F6\u957F(\u5C0F\u65F6)"\uFF09\uFF0CdailyMin \u53EA\u653E\u6570\u5B57\u3002
5. targetValue / currentValue \u672A\u77E5\u53EF\u7559\u7A7A\u4E32 ""\uFF0C\u4F46**\u7EDD\u4E0D\u7F16\u9020**\u7CBE\u786E\u6570\u5B57\u3002
6. category \u5FC5\u987B\u53D6\u81EA\u679A\u4E3E\uFF08${CATEGORY_IDS}\uFF09\uFF0C\u65E0\u6CD5\u5224\u65AD\u7528 "other"\u3002
7. taskDayType \u9ED8\u8BA4 "daily"\uFF1B\u4EC5\u5F53\u8BE5\u884C\u4E3A\u5929\u7136\u4E0D\u662F\u6BCF\u5929\u505A\uFF08\u5982"\u6BCF\u5468\u4F53\u68C0"\uFF09\u624D\u7528 "weekly" / "monthly" / "custom"\uFF0C\u5E76\u636E\u6B64\u8C03\u6574 dailyMin \u8BED\u4E49\u3002
8. \u76EE\u6807\u5B8F\u5927\u6216\u77E5\u8BC6\u4E0D\u8DB3\u65F6\uFF0C\u4E3B\u52A8\u62C6 ${count} \u4E2A\u5B50\u9879\uFF08\u7C97=2-3 / \u4E2D=3-6 / \u7EC6=5-8\uFF09\uFF0C\u504F\u5411\u53EF\u843D\u5730\u884C\u52A8\uFF1B\u7528 reason \u8BF4\u660E\u4F9D\u636E\u3002
9. **\u65E5\u671F\u63A8\u7B97\uFF08\u91CD\u8981\uFF09**\uFF1A
   - **startDate**\uFF1A\u7B14\u8BB0\u82E5\u672A\u63D0\u53CA\u5177\u4F53\u5F00\u59CB\u65E5\u671F\uFF0C\u5FC5\u987B\u586B"\u4ECA\u5929"\uFF08\u5373 user \u6D88\u606F\u4E2D\u7ED9\u51FA\u7684\u65E5\u671F\uFF09\uFF0C\u4E0D\u8981\u7559\u7A7A\u3002\u4EC5\u5F53\u7B14\u8BB0\u660E\u786E\u8BF4\u4E86"\u4ECEX\u6708X\u65E5\u5F00\u59CB"\u624D\u7528\u8BE5\u65E5\u671F\u3002
   - **endDate**\uFF1A\u7B14\u8BB0\u82E5\u63D0\u5230\u76F8\u5BF9\u65F6\u957F\uFF08"3\u4E2A\u6708""\u534A\u5E74""90\u5929""\u5230\u5E74\u5E95"\u7B49\uFF09\uFF0C\u5FC5\u987B\u7528\u300CstartDate + \u65F6\u957F\u300D\u63A8\u7B97\u6210 YYYY-MM-DD \u586B\u5165 endDate\uFF0C\u4E0D\u8981\u7559\u7A7A\u3002\u4EC5\u5F53\u7B14\u8BB0\u5B8C\u5168\u65E0\u65F6\u95F4\u7EBF\u7D22\u65F6 endDate \u624D\u7559\u7A7A\u4E32\u3002
   - \u4E0B\u65B9 user \u6D88\u606F\u4E2D\u4F1A\u7ED9\u51FA\u4ECA\u5929\u7684\u65E5\u671F\uFF0C\u8BF7\u4EE5\u8BE5\u65E5\u671F\u4E3A\u51C6\u8FDB\u884C\u63A8\u7B97\u3002
10. \u9664 analysis \u5B57\u6BB5\u5916\uFF0C\u4E0D\u8981\u5305\u542B id / icon / progress \u7B49\u5B57\u6BB5\uFF0C\u7531\u63D2\u4EF6\u8865\u5168\uFF08analysis \u4F1A\u88AB\u5C55\u793A\u7ED9\u7528\u6237\uFF09\u3002
11. \u5B50\u9879\u786C\u6027\u4E24\u5173\uFF1A\u5FC5\u987B\uFF08a\uFF09\u76F4\u63A5\u670D\u52A1\u4E8E\u8BE5\u76EE\u6807\uFF08\u4E0D\u8DD1\u9898\uFF09\uFF1B\uFF08b\uFF09\u53EF\u7528\u7EAF\u6570\u5B57 dailyMin \u8868\u8FBE\u6BCF\u65E5\u8FDB\u5EA6\u3002\u96BE\u91CF\u5316\u6216\u79BB\u9898\u7684\u5B50\u9879\u4E00\u5F8B\u4E0D\u5F97\u4EA7\u51FA\uFF1B\u627E\u4E0D\u5230\u53EF\u6570\u4EE3\u7406\u6307\u6807\u65F6\u8BE5 goal \u7684 items \u7559\u7A7A\uFF0C\u4E0D\u5F97\u7528"\u52AA\u529B""\u575A\u6301""\u4FDD\u6301"\u7B49\u4F2A\u91CF\u5316\u8BCD\u51D1\u6570\u3002
12. **\u76EE\u6807\u6807\u9898\u5FC5\u987B\u5F52\u7EB3\u547D\u540D\uFF08\u4E0D\u8981\u7167\u6284\u7B14\u8BB0\u539F\u6587\uFF09**\uFF1A
    - \u6807\u9898\u662F"\u76EE\u6807\u7684\u540D\u5B57/\u9879\u76EE\u540D"\uFF0C\u4E0D\u662F\u7B14\u8BB0\u539F\u53E5\u7684\u590D\u8FF0\u3002\u5FC5\u987B\u4ECE\u7B14\u8BB0\u5185\u5BB9\u4E2D\u63D0\u70BC\u51FA\u4E00\u4E2A\u6E05\u6670\u3001\u62BD\u8C61\u3001\u53EF\u72EC\u7ACB\u6210\u7ACB\u7684\u76EE\u6807\u540D\u3002
    - \u5199\u6CD5\uFF1A\u52A8\u5BBE\u7ED3\u6784\u6216\u540D\u8BCD\u77ED\u8BED\uFF0C<20 \u5B57\uFF0C\u53BB\u6389"\u6211\u60F3""3\u4E2A\u6708""5kg"\u7B49\u5177\u4F53\u6570\u5B57\u4E0E\u65F6\u95F4\uFF0C\u53EA\u4FDD\u7559\u76EE\u6807\u65B9\u5411\u3002
    - \u6539\u540D\u793A\u4F8B\uFF08\u4EC5\u53C2\u8003\u903B\u8F91\uFF0C\u4E0D\u662F\u6B7B\u89C4\u5219\uFF09\uFF1A
      \xB7 \u7B14\u8BB0\u300C3\u4E2A\u6708\u51CF\u91CD 5kg\u300D \u2192 \u6807\u9898\u300C\u5065\u5EB7\u51CF\u91CD\u300D\u6216\u300C\u4F53\u91CD\u7BA1\u7406\u300D
      \xB7 \u7B14\u8BB0\u300C\u8BFB\u5B8C\u300AXX \u7B97\u6CD5\u300B\u300D \u2192 \u6807\u9898\u300C\u7CFB\u7EDF\u5B66\u4E60 XX\u300D\u6216\u300C\u7B97\u6CD5\u5165\u95E8\u300D
      \xB7 \u7B14\u8BB0\u300C\u6BCF\u5929\u8DD1\u6B65 30 \u5206\u949F\u3001\u63A7\u5236\u996E\u98DF\u300D \u2192 \u6807\u9898\u300C\u517B\u6210\u8FD0\u52A8\u4E60\u60EF\u300D
    - \u53CD\u4F8B\uFF08\u7981\u6B62\uFF09\uFF1A\u6807\u9898\u4E0E\u7B14\u8BB0\u9996\u53E5\u9010\u5B57\u76F8\u540C\u3001\u4FDD\u7559\u539F\u59CB"3\u4E2A\u6708"/"5kg"/"\u6211\u60F3"\u7B49\u5177\u4F53\u6570\u5B57\u4E0E\u65F6\u95F4\u9650\u5B9A\u3002
13. **\u6BCF\u4E2A\u76EE\u6807\u5FC5\u987B\u7ED9\u51FA analysis\uFF08\u5F52\u7EB3\u5206\u6790\uFF09**\uFF1A\u7528 1-2 \u53E5\u6982\u62EC\u7B14\u8BB0\u4E3B\u65E8\uFF0C\u5E76\u8BF4\u660E\u300C\u4E3A\u4F55\u8FD9\u6837\u62C6\u3001\u5173\u952E\u98CE\u9669\u6216\u6CE8\u610F\u70B9\u300D\uFF0C\u226440 \u5B57\u3002\u8FD9\u662F\u7ED9\u7528\u6237\u7684"\u5F52\u7EB3 + \u5206\u6790"\uFF0C\u4E0D\u8981\u53EA\u590D\u8FF0\u6807\u9898\u6216\u7559\u7A7A\u3002\u4EC5\u5C55\u793A\u7528\uFF0C\u4E0D\u6301\u4E45\u5316\u4E3A\u5B50\u9879\u3002`;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const user = scope === "selection" ? `\u4ECA\u5929\u662F ${today}\u3002

\u4EE5\u4E0B\u662F\u7528\u6237\u5728\u7B14\u8BB0\u4E2D\u9009\u4E2D\u7684\u4E00\u6BB5\u6587\u672C\uFF0C\u8BF7\u76F4\u63A5\u628A\u5B83\u4F5C\u4E3A\u4E00\u4E2A/\u591A\u4E2A\u76EE\u6807\u6765\u62C6\u89E3\uFF08\u4E0D\u8981\u5F53\u6210\u6574\u7BC7\u7B14\u8BB0\uFF09\uFF1A
${content}` : `\u4ECA\u5929\u662F ${today}\u3002

\u7B14\u8BB0\u6B63\u6587\uFF1A
${content}`;
  return { system, user };
}
function extractGoalsObject(raw) {
  if (raw && typeof raw === "object" && "goals" in raw) {
    return raw;
  }
  let text = typeof raw === "string" ? raw : JSON.stringify(raw);
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("\u56DE\u6267\u4E2D\u672A\u627E\u5230 JSON \u5BF9\u8C61");
  }
  const parsed = JSON.parse(text.slice(start, end + 1));
  if (parsed && typeof parsed === "object" && "goals" in parsed) return parsed;
  throw new Error("JSON \u4E2D\u7F3A\u5C11 goals \u5B57\u6BB5");
}
function parseGoals(rawText) {
  const obj = extractGoalsObject(rawText);
  const goals = obj.goals;
  if (!Array.isArray(goals)) {
    throw new Error("goals \u4E0D\u662F\u6570\u7EC4");
  }
  return goals.map((g, gi) => {
    const goal = g ?? {};
    const items = Array.isArray(goal.items) ? goal.items.map((it, ii) => {
      const item = it ?? {};
      return {
        name: typeof item.name === "string" && item.name ? item.name : `\u5B50\u9879${ii + 1}`,
        targetValue: typeof item.targetValue === "string" ? item.targetValue : "",
        currentValue: typeof item.currentValue === "string" ? item.currentValue : "",
        dailyMin: cleanDailyMin(item.dailyMin),
        taskDayType: typeof item.taskDayType === "string" ? item.taskDayType : "daily",
        detail: typeof item.reason === "string" ? item.reason : void 0
      };
    }) : [];
    const categoryRaw = typeof goal.category === "string" ? goal.category : "";
    const category = GOAL_CATEGORIES.some((c) => c.id === categoryRaw) ? categoryRaw : "other";
    return {
      id: `goal_${Date.now().toString(36)}_${gi}_${Math.random().toString(36).slice(2, 8)}`,
      title: typeof goal.title === "string" && goal.title ? goal.title : `\u76EE\u6807${gi + 1}`,
      analysis: typeof goal.analysis === "string" && goal.analysis ? goal.analysis : void 0,
      category,
      startDate: typeof goal.startDate === "string" ? goal.startDate : "",
      endDate: typeof goal.endDate === "string" ? goal.endDate : "",
      progress: 0,
      items
    };
  });
}
function extractChatText(resp) {
  if (resp.status < 200 || resp.status >= 300) {
    throw new Error(`AI \u670D\u52A1\u8FD4\u56DE HTTP ${resp.status}`);
  }
  let data = resp.json;
  if (data === void 0 || data === null) {
    if (typeof resp.text === "string" && resp.text.trim()) data = resp.text;
    else throw new Error("AI \u56DE\u6267\u4E3A\u7A7A");
  }
  if (data && typeof data === "object" && Array.isArray(data.choices)) {
    const choices = data.choices;
    const msg = choices[0]?.message;
    if (msg && typeof msg.content === "string") return msg.content;
  }
  if (typeof data === "string") return data;
  return JSON.stringify(data);
}
async function planFromNote(content, settings, fetchFn = import_obsidian6.requestUrl, scope = "note") {
  const url = `${settings.aiBaseUrl.replace(/\/+$/, "")}/chat/completions`;
  const { system, user } = buildPrompt(content, settings.aiDecomposeDepth, scope);
  const attempt = async () => {
    const resp = await fetchFn({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.aiApiKey}`
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });
    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(`AI \u670D\u52A1\u8FD4\u56DE HTTP ${resp.status}`);
    }
    return resp;
  };
  const parseOnce = (resp) => parseGoals(extractChatText(resp));
  try {
    return parseOnce(await attempt());
  } catch (firstErr) {
    try {
      return parseOnce(await attempt());
    } catch {
      throw new Error(
        `AI \u89C4\u5212\u5931\u8D25\uFF1A${firstErr instanceof Error ? firstErr.message : "\u65E0\u6CD5\u89E3\u6790\u8FD4\u56DE\u7ED3\u679C"}\u3002\u8BF7\u68C0\u67E5 API Key / \u7F51\u7EDC\uFF0C\u6216\u91CD\u8BD5\u3002`
      );
    }
  }
}

// src/ai/goalId.ts
function fnv1a(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
function deriveStableGoalId(seed) {
  return `goal_${fnv1a(seed)}`;
}

// src/ai/idempotency.ts
function shouldSkipPlanned(plannedIds, existingIds) {
  if (!plannedIds || plannedIds.length === 0) return false;
  return plannedIds.every((id) => existingIds.has(id));
}

// src/ai/AgenticPlanModal.ts
var import_obsidian8 = require("obsidian");

// src/ai/PlanningSession.ts
var import_obsidian7 = require("obsidian");
var AGENT_SUFFIX = `

# \u5BF9\u8BDD\u5F0F\u89C4\u5212\u6A21\u5F0F\uFF08\u4F60\u6B63\u4E0E\u7528\u6237\u591A\u8F6E\u6253\u78E8\u89C4\u5212\uFF09
\u8FD9\u662F\u5BF9\u8BDD\u5F0F\u89C4\u5212\uFF1A\u7528\u6237\u4F1A\u5728\u6B64\u57FA\u7840\u4E0A\u63D0\u51FA\u300C\u589E / \u5220 / \u6539\u300D\u7B49\u81EA\u7136\u8BED\u8A00\u6307\u4EE4\u3002
- \u6BCF\u6B21\u56DE\u590D\u90FD\u5FC5\u987B\u8FD4\u56DE\u3010\u5F53\u524D\u5B8C\u6574\u7684\u6700\u65B0 goals JSON \u5168\u91CF\u3011\uFF0C**\u4E0D\u8981\u53EA\u56DE\u589E\u91CF\u3001\u4E0D\u8981\u56DE diff**\u3002
- \u9876\u5C42\u589E\u52A0\u53EF\u9009\u5B57\u6BB5 "reply"\uFF08\u5B57\u7B26\u4E32\uFF0C\u226430 \u5B57\u4E2D\u6587\uFF09\uFF1A\u7528\u4E00\u53E5\u8BDD\u8BF4\u660E\u4F60\u8FD9\u6B21\u505A\u4E86\u4EC0\u4E48\u6539\u52A8\uFF1B\u82E5\u7528\u6237\u53EA\u662F\u63D0\u95EE\u4E5F\u8BF7\u7B80\u8981\u56DE\u7B54\u3002
- \u4FDD\u6301\u4E0A\u6587\u6240\u6709\u91CF\u5316\u94C1\u5F8B\uFF1A\u7EAF\u6570\u5B57 dailyMin\u3001\u65E5\u9897\u7C92\u5EA6\u3001\u4E25\u683C\u56F4\u7ED5\u76EE\u6807\u3001\u53EF\u6570\u4EE3\u7406\u6307\u6807\u3001\u7981\u6B62"\u52AA\u529B/\u575A\u6301"\u7B49\u4F2A\u91CF\u5316\u8BCD\u3002
- \u53EA\u8F93\u51FA JSON\uFF0C\u4E0D\u8981\u4EFB\u4F55\u989D\u5916\u89E3\u91CA\u6587\u5B57\u3001\u4E0D\u8981 markdown \u56F4\u680F\u3002
\u8F93\u51FA\u683C\u5F0F\u793A\u4F8B\uFF1A
{ "reply": "\u5DF2\u5220\u9664\u8DD1\u6B65\uFF0C\u65B0\u589E\u6BCF\u5468\u6E38\u6CF33\u6B21", "goals": [ ... \u540C\u4E0A\u6587\u7ED3\u6784 ... ] }`;
var PlanningSession = class {
  constructor(content, settings, fetchFn = import_obsidian7.requestUrl, scope = "note") {
    this.content = content;
    this.settings = settings;
    this.fetchFn = fetchFn;
    this.scope = scope;
    this.messages = [];
    /** 工作副本（单一数据源），AI 与手动编辑都作用其上 */
    this.goals = [];
    /** 首版快照，供 reset() 还原 */
    this.initialGoals = [];
    /** 会话模式：'note' 由笔记拆解首版；'edit' 由 loadGoals 载入现有树 */
    this.mode = "note";
    /** edit 模式的 system 上下文（含载入树 JSON），供 reset 还原 */
    this.editSystemContent = "";
    const { system, user } = buildPrompt(content, settings.aiDecomposeDepth, scope);
    this.messages.push({ role: "system", content: system + AGENT_SUFFIX });
    this.messages.push({ role: "user", content: user });
  }
  /** 首轮规划：返回初版 goals 并保存快照 */
  async init() {
    const text = extractChatText(await this.call());
    const obj = JSON.parse(text);
    this.goals = this.callParse(parseGoals(obj));
    this.initialGoals = this.goals;
    return this.goals;
  }
  /**
   * 用户自然语言改一轮：返回 { reply, goals }，并全量替换工作副本。
   * 坏 JSON / 结构非法 → 回滚本轮、goals 保持不变、抛错（由上层提示）。
   */
  async send(userText) {
    this.messages.push({ role: "user", content: userText });
    try {
      const resp = await this.call();
      const text = extractChatText(resp);
      const obj = JSON.parse(text);
      const goals = this.callParse(parseGoals(obj));
      this.goals = goals;
      return {
        reply: typeof obj.reply === "string" ? obj.reply : "",
        goals
      };
    } catch (err2) {
      this.messages.pop();
      throw err2 instanceof Error ? err2 : new Error("AI \u8FD4\u56DE\u65E0\u6CD5\u89E3\u6790");
    }
  }
  /**
   * 用户手动编辑后调用：把改动写进对话历史（system note），
   * 让 AI 下轮"知道你改过"，不会再把被删的子项加回来。
   * 真正的 mutate 已在外部直接作用在 this.goals 上。
   */
  applyLocalEdit(note) {
    this.messages.push({ role: "system", content: `[\u7528\u6237\u624B\u52A8\u6539\u52A8] ${note}` });
  }
  /** 回到 AI 首版，清空对话历史 */
  reset() {
    if (this.mode === "edit") {
      this.goals = JSON.parse(JSON.stringify(this.initialGoals));
      this.messages = [{ role: "system", content: this.editSystemContent + AGENT_SUFFIX }];
      return;
    }
    this.goals = this.initialGoals;
    const { system, user } = buildPrompt(this.content, this.settings.aiDecomposeDepth, this.scope);
    this.messages = [
      { role: "system", content: system + AGENT_SUFFIX },
      { role: "user", content: user }
    ];
  }
  /**
   * 编辑现有目标树（不调 AI）：深拷贝为工作副本，把对话重置为「编辑」上下文，
   * 让后续 send() 的 AI 在现有树基础上增删改，而非从笔记重新拆解。
   * 首版快照 = 传入树，reset() 回到真实首版（不被污染）。
   */
  loadGoals(goals) {
    const clone2 = JSON.parse(JSON.stringify(goals));
    this.goals = clone2;
    this.initialGoals = JSON.parse(JSON.stringify(goals));
    this.mode = "edit";
    this.editSystemContent = "\u4F60\u662F\u76EE\u6807\u5361\u7247\u7F16\u8F91\u5668\u3002\u7528\u6237\u5DF2\u6709\u4E00\u4E2A\u76EE\u6807\u6811\uFF08\u5982\u4E0B JSON\uFF09\uFF1A\n" + JSON.stringify(goals, null, 2) + "\n\u7528\u6237\u4F1A\u7528\u81EA\u7136\u8BED\u8A00\u63D0\u51FA\u300C\u589E/\u5220/\u6539\u300D\u6307\u4EE4\uFF0C\u4F60\u6BCF\u6B21\u56DE\u590D\u90FD\u5FC5\u987B\u8FD4\u56DE\u3010\u5F53\u524D\u5B8C\u6574\u7684\u6700\u65B0 goals JSON \u5168\u91CF\u3011\uFF0C\u4FDD\u6301\u91CF\u5316\u94C1\u5F8B\uFF08\u7EAF\u6570\u5B57 dailyMin\u3001\u65E5\u9897\u7C92\u5EA6\u3001\u53EF\u6570\u4EE3\u7406\u6307\u6807\uFF09\u3002\u53EA\u8F93\u51FA JSON\uFF0C\u4E0D\u8981 markdown \u56F4\u680F\u3002";
    this.messages = [{ role: "system", content: this.editSystemContent + AGENT_SUFFIX }];
  }
  /** 当前对话消息（只读用途，如调试 / 测试断言） */
  getMessages() {
    return this.messages;
  }
  async call() {
    const url = `${this.settings.aiBaseUrl.replace(/\/+$/, "")}/chat/completions`;
    return this.fetchFn({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.settings.aiApiKey}`
      },
      body: JSON.stringify({
        model: this.settings.aiModel,
        messages: this.messages,
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });
  }
  /** 解析 + 校验：parseGoals 做字段映射，validateGoals 兜底补默认 */
  callParse(raw) {
    return validateGoals(raw);
  }
};

// src/ai/AgenticPlanModal.ts
var AgenticPlanModal = class extends import_obsidian8.Modal {
  constructor(app, opts) {
    super(app);
    this.entries = [];
    this.chatLog = [];
    this.prevGoalTitles = /* @__PURE__ */ new Set();
    this.prevItemKeys = /* @__PURE__ */ new Set();
    this.subtitle = opts.subtitle;
    this.onConfirm = opts.onConfirm;
    this.opts = opts;
    this.session = new PlanningSession(opts.content, opts.settings, void 0, opts.scope);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("bamboo-ai-plan-modal", "bamboo-ai-agentic");
    contentEl.createEl("h2", { text: "AI \u89C4\u5212\u52A9\u624B \xB7 \u76EE\u6807\u5361\u7247\u5BA1\u9605" });
    const topBar = contentEl.createDiv({ cls: "bamboo-ai-agentic-topbar" });
    if (this.subtitle) {
      topBar.createEl("span", { text: this.subtitle, cls: "bamboo-ai-plan-subtitle" });
    }
    const resetBtn = topBar.createEl("button", {
      text: "\u21BA \u91CD\u7F6E\u521D\u7248",
      cls: "bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost"
    });
    resetBtn.addEventListener("click", () => this.onReset());
    contentEl.createEl("p", {
      text: '\u5DE6\u4FA7\u6838\u5BF9/\u7F16\u8F91\u76EE\u6807\uFF0C\u53F3\u4FA7\u7528\u81EA\u7136\u8BED\u8A00\u8BA9 AI \u589E\u5220\u6539\uFF08\u5982"\u53BB\u6389\u8DD1\u6B65""\u52A0\u6BCF\u5468\u6E38\u6CF33\u6B21"\uFF09\u3002\u786E\u8BA4\u540E\u5199\u5165\u76EE\u6807\u5E93\u3002',
      cls: "bamboo-ai-plan-desc"
    });
    const body = contentEl.createDiv({ cls: "bamboo-ai-agentic-body" });
    const left = body.createDiv({ cls: "bamboo-ai-agentic-left" });
    this.listEl = left.createDiv({ cls: "bamboo-ai-plan-list" });
    const right = body.createDiv({ cls: "bamboo-ai-agentic-right" });
    this.chatLogEl = right.createDiv({ cls: "bamboo-ai-chat" });
    const composer = right.createDiv({ cls: "bamboo-ai-chat-composer" });
    this.inputEl = composer.createEl("textarea", {
      cls: "bamboo-ai-chat-input",
      attr: { placeholder: '\u8BF4\u70B9\u4EC0\u4E48\uFF0C\u5982"\u628A\u8DD1\u6B65\u53BB\u6389\uFF0C\u6362\u6210\u6E38\u6CF3"\u2026', rows: "2" }
    });
    this.sendBtn = composer.createEl("button", {
      text: "\u53D1\u9001",
      cls: "bamboo-ai-plan-btn bamboo-ai-plan-btn-primary"
    });
    this.sendBtn.addEventListener("click", () => void this.onSend());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void this.onSend();
      }
    });
    const footer = contentEl.createDiv({ cls: "bamboo-ai-plan-footer" });
    footer.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost"
    }).addEventListener("click", () => this.close());
    const writeBtn = footer.createEl("button", {
      text: "\u5199\u5165\u76EE\u6807",
      cls: "bamboo-ai-plan-btn bamboo-ai-plan-btn-primary"
    });
    writeBtn.addEventListener("click", () => this.confirm());
    this.footerCount = writeBtn;
    void this.initPlan();
  }
  async initPlan() {
    if (this.opts.goals) {
      this.session.loadGoals(this.opts.goals);
      this.chatLog = [{ role: "assistant", text: "\u5DF2\u8F7D\u5165\u4F60\u7684\u73B0\u6709\u76EE\u6807\u6811\uFF0C\u53EF\u76F4\u63A5\u7F16\u8F91\u6216\u8BA9\u6211\u8C03\u6574\u3002" }];
      this.rebuildTree(false);
      this.renderChat();
      if (this.opts.initialInstruction) {
        const instruction = this.opts.initialInstruction;
        this.pushChat("user", instruction);
        this.setSending(true);
        try {
          const { reply } = await this.session.send(instruction);
          this.rebuildTree(true);
          this.pushChat("assistant", reply || "\u5DF2\u5E94\u7528\u5EFA\u8BAE\u3002");
        } catch {
          this.pushChat("assistant", "\u26A0 \u5E94\u7528\u5EFA\u8BAE\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u8C03\u6574\u3002");
        } finally {
          this.setSending(false);
        }
      }
      return;
    }
    this.pushChat("assistant", "\u23F3 AI \u89C4\u5212\u4E2D\u2026\uFF08\u6B63\u5728\u62C6\u89E3\u76EE\u6807\uFF09");
    try {
      const goals = await this.session.init();
      if (goals.length === 0) {
        new import_obsidian8.Notice(
          "AI \u672A\u4ECE\u7B14\u8BB0\u4E2D\u8BC6\u522B\u51FA\u660E\u786E\u76EE\u6807\u3002\n\u8BD5\u8BD5\u8FD9\u6837\u7684\u53E5\u5F0F\uFF1A\u300C\u6211\u60F3\u5728 3 \u4E2A\u6708\u5185\u51CF\u91CD 5kg\uFF0C\u6BCF\u5929\u8DD1\u6B65 30 \u5206\u949F\u3001\u63A7\u5236\u996E\u98DF\u300D\u3002"
        );
        this.close();
        return;
      }
      this.chatLog = [{ role: "assistant", text: `\u5DF2\u4ECE\u7B14\u8BB0\u8BC6\u522B\u51FA ${goals.length} \u4E2A\u76EE\u6807\uFF0C\u53EF\u76F4\u63A5\u7F16\u8F91\u6216\u8BA9\u6211\u8C03\u6574\u3002` }];
      this.rebuildTree(false);
      this.renderChat();
    } catch (e) {
      new import_obsidian8.Notice(e instanceof Error ? e.message : "AI \u89C4\u5212\u5931\u8D25");
      this.close();
    }
  }
  async onSend() {
    const input = this.inputEl;
    const text = input?.value.trim();
    if (!text || !this.sendBtn || !input) return;
    input.value = "";
    this.pushChat("user", text);
    this.setSending(true);
    try {
      const { reply, goals } = await this.session.send(text);
      this.rebuildTree(true);
      this.pushChat("assistant", reply || "\u5DF2\u66F4\u65B0\u89C4\u5212\u3002");
    } catch {
      this.pushChat("assistant", "\u26A0 \u6CA1\u542C\u61C2\uFF0C\u6362\u4E2A\u8BF4\u6CD5\u8BD5\u8BD5\uFF08\u5F53\u524D\u89C4\u5212\u672A\u6539\u52A8\uFF09\u3002");
    } finally {
      this.setSending(false);
    }
  }
  onReset() {
    this.session.reset();
    this.rebuildTree(false);
    this.pushChat("assistant", "\u21BA \u5DF2\u91CD\u7F6E\u4E3A AI \u521D\u7248\u3002");
  }
  setSending(on) {
    if (this.sendBtn) this.sendBtn.disabled = on;
    if (this.inputEl) this.inputEl.disabled = on;
  }
  pushChat(role, text) {
    this.chatLog.push({ role, text });
    this.renderChat();
  }
  renderChat() {
    if (!this.chatLogEl) return;
    this.chatLogEl.empty();
    for (const m of this.chatLog) {
      const bubble = this.chatLogEl.createDiv({
        cls: `bamboo-ai-chat-bubble bamboo-ai-chat-${m.role}`
      });
      bubble.setText(m.text);
      this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
    }
  }
  /** 依据 session.goals 重建左树；highlight=true 时对新出现的目标/子项打高亮 */
  rebuildTree(highlight) {
    if (!this.listEl) return;
    const prevGoals = this.prevGoalTitles;
    const prevItems = this.prevItemKeys;
    this.entries = this.session.goals.map((goal) => ({
      goal,
      keep: true,
      items: (goal.items ?? []).map((item) => ({ item, keep: true }))
    }));
    const list = this.listEl;
    list.empty();
    this.entries.forEach((entry, gi) => {
      const isNewGoal = highlight && !prevGoals.has(entry.goal.title);
      this.renderGoal(list, entry, gi, isNewGoal, highlight, prevItems);
    });
    this.prevGoalTitles = new Set(this.session.goals.map((g) => g.title));
    this.prevItemKeys = new Set(
      this.session.goals.flatMap((g) => (g.items ?? []).map((it) => `${g.title}::${it.name}`))
    );
    this.updateFooter();
  }
  renderGoal(parent, entry, gi, isNewGoal, highlight, prevItems) {
    const card = parent.createDiv({ cls: "bamboo-ai-plan-goal" });
    if (isNewGoal) card.addClass("bamboo-ai-plan-goal-updated");
    const head = card.createDiv({ cls: "bamboo-ai-plan-goal-head" });
    const titleInput = head.createEl("input", {
      cls: "bamboo-ai-plan-goal-title",
      attr: { value: entry.goal.title, placeholder: "\u76EE\u6807\u6807\u9898" }
    });
    titleInput.addEventListener("input", () => {
      entry.goal.title = titleInput.value.trim() || `\u76EE\u6807${gi + 1}`;
    });
    titleInput.addEventListener("change", () => {
      this.session.applyLocalEdit(`\u76EE\u6807\u6539\u540D\u4E3A\u300C${entry.goal.title}\u300D`);
    });
    if (entry.goal.analysis) {
      head.createEl("div", {
        text: `AI \u5206\u6790\uFF1A${entry.goal.analysis}`,
        cls: "bamboo-ai-plan-analysis"
      });
    }
    const catSelect = head.createEl("select", { cls: "bamboo-ai-plan-cat" });
    GOAL_CATEGORIES.forEach((c) => {
      const opt = catSelect.createEl("option", { text: `${c.icon} ${c.name}`, value: c.id });
      if (c.id === entry.goal.category) opt.selected = true;
    });
    catSelect.addEventListener("change", () => {
      entry.goal.category = catSelect.value;
      this.session.applyLocalEdit(`\u76EE\u6807\u300C${entry.goal.title}\u300D\u9886\u57DF\u6539\u4E3A ${catSelect.value}`);
      this.refreshThinBadge(card, entry);
    });
    const startWrap = head.createDiv({ cls: "bamboo-ai-plan-daterange" });
    const startInput = startWrap.createEl("input", {
      cls: "bamboo-ai-plan-daterange-input",
      attr: { type: "date", value: entry.goal.startDate ?? "" }
    });
    startInput.addEventListener("change", () => {
      entry.goal.startDate = startInput.value;
      this.session.applyLocalEdit(`\u76EE\u6807\u300C${entry.goal.title}\u300D\u5F00\u59CB\u65E5\u6539\u4E3A ${startInput.value}`);
    });
    startWrap.createSpan({ text: "\u2014", cls: "bamboo-ai-plan-daterange-sep" });
    const endInput = startWrap.createEl("input", {
      cls: "bamboo-ai-plan-daterange-input",
      attr: { type: "date", value: entry.goal.endDate ?? "" }
    });
    endInput.addEventListener("change", () => {
      entry.goal.endDate = endInput.value;
      this.session.applyLocalEdit(`\u76EE\u6807\u300C${entry.goal.title}\u300D\u622A\u6B62\u65E5\u6539\u4E3A ${endInput.value}`);
      this.refreshThinBadge(card, entry);
    });
    card.createDiv({ cls: "bamboo-ai-plan-badge" });
    this.refreshThinBadge(card, entry);
    const del = head.createEl("button", {
      text: "\u2715",
      cls: "bamboo-ai-plan-del",
      attr: { title: "\u5220\u9664\u8BE5\u76EE\u6807" }
    });
    del.addEventListener("click", () => {
      entry.keep = false;
      card.toggleClass("bamboo-ai-plan-goal-removed", true);
      this.session.applyLocalEdit(`\u5220\u9664\u4E86\u76EE\u6807\u300C${entry.goal.title}\u300D`);
      this.updateFooter();
    });
    const itemsWrap = card.createDiv({ cls: "bamboo-ai-plan-items" });
    (entry.goal.items ?? []).forEach((_, ii) => {
      const itemEntry = entry.items[ii];
      if (!itemEntry) return;
      const isNewItem = highlight && !prevItems.has(`${entry.goal.title}::${itemEntry.item.name}`);
      this.renderItem(itemsWrap, entry, itemEntry, ii, isNewItem);
    });
  }
  refreshThinBadge(card, entry) {
    const badge = card.querySelector(".bamboo-ai-plan-badge");
    if (!badge) return;
    const { level, missing } = classifyCompleteness(entry.goal);
    badge.empty();
    if (level === "thin") {
      badge.setText(`\u26A0 \u5F85\u8865\u586B\uFF1A${missing.join("\u3001")}`);
      badge.addClass("bamboo-ai-plan-badge-thin");
    } else {
      badge.setText("\u2713 \u5DF2\u91CF\u5316\uFF0C\u53EF\u5199\u5165");
      badge.removeClass("bamboo-ai-plan-badge-thin");
    }
  }
  renderItem(parent, entry, itemEntry, ii, isNewItem) {
    const row = parent.createDiv({ cls: "bamboo-ai-plan-item" });
    if (isNewItem) row.addClass("bamboo-ai-plan-item-updated");
    const cb = row.createEl("input", { type: "checkbox", cls: "bamboo-ai-plan-item-cb" });
    cb.checked = itemEntry.keep;
    cb.addEventListener("change", () => {
      itemEntry.keep = cb.checked;
      row.toggleClass("bamboo-ai-plan-item-off", !cb.checked);
      this.session.applyLocalEdit(
        `${cb.checked ? "\u4FDD\u7559" : "\u5220\u9664"}\u5B50\u9879\u300C${itemEntry.item.name}\u300D`
      );
      this.refreshThinBadge(parent.closest(".bamboo-ai-plan-goal"), entry);
      this.updateFooter();
    });
    const nameInput = row.createEl("input", {
      cls: "bamboo-ai-plan-item-name",
      attr: { value: itemEntry.item.name, placeholder: "\u5B50\u9879\u540D" }
    });
    nameInput.addEventListener("input", () => {
      itemEntry.item.name = nameInput.value.trim() || `\u5B50\u9879${ii + 1}`;
      unitChip.setText(extractUnit(nameInput.value));
    });
    nameInput.addEventListener("change", () => {
      this.session.applyLocalEdit(`\u5B50\u9879\u6539\u540D\u4E3A\u300C${itemEntry.item.name}\u300D`);
    });
    if (!itemEntry.item.taskDayType) itemEntry.item.taskDayType = "daily";
    const dailyWrap = row.createDiv({ cls: "bamboo-ai-plan-item-daily" });
    dailyWrap.createSpan({ text: "\u6BCF\u65E5\u91CF", cls: "bamboo-ai-plan-item-label" });
    const dailyInput = dailyWrap.createEl("input", {
      cls: "bamboo-ai-plan-item-daily-input",
      attr: { value: itemEntry.item.dailyMin ?? "", placeholder: "\u6570\u5B57", type: "text", inputmode: "decimal" }
    });
    const unitChip = dailyWrap.createSpan({ cls: "bamboo-ai-plan-item-unit-chip" });
    unitChip.setText(extractUnit(itemEntry.item.name));
    const dailyWarn = row.createEl("div", {
      cls: "bamboo-ai-plan-item-warn",
      text: "\u26A0 \u4E0D\u53EF\u91CF\u5316\uFF0C\u5EFA\u8BAE\u5220\u9664\u6216\u6539\u5199\u4E3A\u53EF\u8BA1\u6570\u52A8\u4F5C"
    });
    const markDaily = () => {
      const quantified = /^\d+(\.\d+)?$/.test((itemEntry.item.dailyMin ?? "").trim());
      dailyWrap.toggleClass("bamboo-ai-plan-item-no-daily", !quantified);
      dailyWarn.toggleClass("bamboo-ai-plan-item-warn-show", !quantified);
    };
    markDaily();
    dailyInput.addEventListener("input", () => {
      itemEntry.item.dailyMin = dailyInput.value.trim();
      markDaily();
      this.refreshThinBadge(parent.closest(".bamboo-ai-plan-goal"), entry);
    });
    dailyInput.addEventListener("change", () => {
      this.session.applyLocalEdit(`\u5B50\u9879\u300C${itemEntry.item.name}\u300D\u6BCF\u65E5\u91CF\u6539\u4E3A ${itemEntry.item.dailyMin}`);
    });
    if (itemEntry.item.detail) {
      row.createEl("div", {
        text: `AI\uFF1A${itemEntry.item.detail}`,
        cls: "bamboo-ai-plan-item-reason"
      });
    }
  }
  updateFooter() {
    if (!this.footerCount) return;
    const n = this.entries.filter((e) => e.keep).length;
    this.footerCount.setText(`\u5199\u5165\u76EE\u6807\uFF08${n}\uFF09`);
  }
  confirm() {
    const finalGoals = [];
    for (const entry of this.entries) {
      if (!entry.keep) continue;
      const keptItems = entry.items.filter((it) => it.keep).map((it) => {
        const { detail: _detail, ...rest } = it.item;
        return rest;
      });
      finalGoals.push({ ...entry.goal, items: keptItems });
    }
    if (finalGoals.length === 0) {
      new import_obsidian8.Notice("\u672A\u4FDD\u7559\u4EFB\u4F55\u76EE\u6807\uFF0C\u5DF2\u53D6\u6D88\u5199\u5165");
      this.close();
      return;
    }
    this.onConfirm(finalGoals);
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/ai/DiagnosisModal.ts
var import_obsidian9 = require("obsidian");
var STATUS_LABEL = {
  on_track: "\u8FBE\u6807",
  behind: "\u843D\u540E",
  stuck: "\u505C\u6EDE",
  done: "\u5DF2\u5B8C\u6210",
  at_risk: "\u4E34\u671F\u98CE\u9669"
};
var LEVEL_LABEL = {
  excellent: "\u4F18\u79C0",
  good: "\u826F\u597D",
  warning: "\u9700\u5173\u6CE8",
  risk: "\u98CE\u9669"
};
var DIM_LABEL = {
  L1: "\u5C65\u7EA6",
  L2: "\u52A8\u529B",
  L3: "\u8282\u594F"
};
var DiagnosisModal = class extends import_obsidian9.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("bamboo-diag-modal");
    const header = contentEl.createDiv({ cls: "bamboo-diag-header" });
    header.createEl("h2", { text: this.opts.title ?? "AI \u8BCA\u65AD \xB7 \u76EE\u6807\u6267\u884C\u590D\u76D8" });
    const d = this.opts.diagnosis;
    if (!d.ok) {
      contentEl.createEl("p", { text: d.rawText, cls: "bamboo-diag-raw" });
      return;
    }
    const totalSuggestions = d.goals.reduce((n, g) => n + (g.suggestions?.length ?? 0), 0);
    if (this.opts.onApplyAllDiagnosis && totalSuggestions > 0) {
      const bar = contentEl.createDiv({ cls: "bamboo-diag-batchbar" });
      const batchBtn = bar.createEl("button", {
        text: "\u4E00\u952E\u5E94\u7528\u5168\u90E8\u5EFA\u8BAE",
        cls: "bamboo-diag-batch-btn"
      });
      batchBtn.addEventListener("click", () => {
        this.opts.onApplyAllDiagnosis?.();
        this.close();
      });
      bar.createSpan({
        text: `\u5171 ${totalSuggestions} \u6761\u5EFA\u8BAE\uFF0C\u786E\u8BA4\u540E\u5C06\u4E00\u6B21\u6027\u6539\u5199\u5E76\u5199\u5165\u76EE\u6807`,
        cls: "bamboo-diag-batch-hint"
      });
    }
    if (d.summary) {
      contentEl.createEl("p", { text: d.summary, cls: "bamboo-diag-summary" });
    }
    for (const g of d.goals) {
      this.renderGoal(contentEl, g);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
  // ---------- 内部渲染辅助 ----------
  renderGoal(parent, g) {
    const hasHealth = !!g.level;
    const card = parent.createDiv({
      cls: hasHealth ? `bamboo-diag-goal bamboo-diag-goal-level-${g.level}` : `bamboo-diag-goal bamboo-diag-goal-${g.status}`
    });
    const goalHeader = card.createDiv({ cls: "bamboo-diag-goal-header" });
    goalHeader.createEl("h3", { text: g.title, cls: "bamboo-diag-goal-title" });
    if (hasHealth) {
      const badge = `${LEVEL_LABEL[g.level] ?? g.level}${typeof g.healthScore === "number" ? ` \xB7 ${g.healthScore}\u5206` : ""}`;
      goalHeader.createEl("span", {
        text: badge,
        cls: `bamboo-diag-level bamboo-diag-level-${g.level} bamboo-diag-healthscore`
      });
    } else {
      goalHeader.createEl("span", {
        text: STATUS_LABEL[g.status] ?? g.status,
        cls: `bamboo-diag-status bamboo-diag-status-${g.status}`
      });
    }
    if (hasHealth) {
      this.renderDimensions(card, g);
    }
    if (g.bottleneck) {
      card.createEl("p", { text: g.bottleneck, cls: "bamboo-diag-bottleneck" });
    }
    const evList = this.opts.itemEvidence?.[g.title];
    if (evList && evList.length > 0) {
      this.renderEvidence(card, evList);
    }
    if (g.suggestions && g.suggestions.length > 0) {
      this.renderSuggestions(card, g);
    }
  }
  renderDimensions(parent, g) {
    const wrap = parent.createDiv({ cls: "bamboo-diag-dims" });
    const dims = [
      { key: "L1", score: g.L1 },
      { key: "L2", score: g.L2 },
      { key: "L3", score: g.L3 }
    ];
    for (const d of dims) {
      const isWeak = g.weakest === d.key;
      const score = typeof d.score === "number" ? String(d.score) : "\u2014";
      wrap.createDiv({
        text: `${DIM_LABEL[d.key]} ${score}`,
        cls: `bamboo-diag-dim bamboo-diag-dim-${d.key}${isWeak ? " bamboo-diag-dim-weakest" : ""}`
      });
    }
  }
  renderEvidence(parent, evList) {
    const stats = summarize(evList);
    const details = parent.createEl("details", { cls: "bamboo-diag-evidence" });
    const summary = details.createEl("summary", { cls: "bamboo-diag-evidence-summary" });
    const left = summary.createDiv({ cls: "bamboo-diag-evidence-summary-left" });
    left.createEl("span", { text: "\u25B8", cls: "bamboo-diag-evidence-chevron" });
    left.createSpan({
      text: `${evList.length} \u4E2A\u5B50\u9879 \xB7 ${stats.label}`
    });
    summary.createEl("span", {
      text: stats.headline,
      cls: `bamboo-diag-evidence-headline bamboo-diag-evidence-headline-${stats.level}`
    });
    const list = details.createDiv({ cls: "bamboo-diag-evidence-list" });
    for (const e of evList) {
      this.renderEvidenceRow(list, e);
    }
  }
  renderEvidenceRow(parent, e) {
    const row = parent.createDiv({ cls: "bamboo-diag-evidence-row" });
    row.createEl("span", { text: e.name, cls: "bamboo-diag-evidence-name" });
    row.createEl("span", {
      text: e.dailyMin || "?",
      cls: "bamboo-diag-evidence-cell bamboo-diag-evidence-daily"
    });
    const pctEl = row.createSpan({ cls: "bamboo-diag-evidence-cell" });
    const pctLevel = percentLevel(e.percent);
    pctEl.createEl("span", { cls: `bamboo-diag-dot bamboo-diag-dot-${pctLevel}` });
    pctEl.createSpan({
      text: e.percent != null ? `${e.percent}%` : "?",
      cls: `bamboo-diag-evidence-pct bamboo-diag-evidence-pct-${pctLevel}`
    });
    const paceEl = row.createSpan({ cls: "bamboo-diag-evidence-cell" });
    const paceLevel = paceLevelOf(e.paceDeviation);
    paceEl.createEl("span", { cls: `bamboo-diag-dot bamboo-diag-dot-${paceLevel}` });
    paceEl.createSpan({
      text: e.paceDeviation != null ? `${fmtSigned(e.paceDeviation)}pt` : "?",
      cls: `bamboo-diag-evidence-pace bamboo-diag-evidence-pace-${paceLevel}`
    });
    row.createEl("span", {
      text: `${e.doneDays} \u5929${e.lastDone ? " \xB7 " + e.lastDone : ""}`,
      cls: "bamboo-diag-evidence-foot"
    });
  }
  renderSuggestions(parent, goal) {
    const suggWrap = parent.createDiv({ cls: "bamboo-diag-suggestions" });
    const title = suggWrap.createEl("h4", {
      text: `\u5EFA\u8BAE\uFF08${goal.suggestions.length}\uFF09`,
      cls: "bamboo-diag-suggestions-title"
    });
    if (goal.weakest && DIM_LABEL[goal.weakest]) {
      title.createSpan({
        text: `\u805A\u7126${DIM_LABEL[goal.weakest]}`,
        cls: `bamboo-diag-focus-dim bamboo-diag-focus-dim-${goal.weakest}`
      });
    }
    if (this.opts.onApplyAll && goal.suggestions.length > 0) {
      const allBtn = suggWrap.createEl("button", {
        text: "\u5E94\u7528\u5168\u90E8",
        cls: "bamboo-diag-apply-all"
      });
      allBtn.addEventListener("click", () => {
        this.opts.onApplyAll?.(goal);
        this.close();
      });
    }
    for (const s of goal.suggestions) {
      this.renderSuggestionRow(suggWrap, s, goal);
    }
  }
  renderSuggestionRow(parent, s, goal) {
    const row = parent.createDiv({ cls: "bamboo-diag-suggestion" });
    row.createEl("div", { text: s.text, cls: "bamboo-diag-suggestion-text" });
    if (s.dimension && DIM_LABEL[s.dimension]) {
      row.createSpan({
        text: DIM_LABEL[s.dimension],
        cls: `bamboo-diag-focus-dim bamboo-diag-focus-dim-${s.dimension}`
      });
    }
    const btn = row.createEl("button", {
      text: "\u5E94\u7528",
      cls: "bamboo-diag-apply"
    });
    btn.addEventListener("click", () => {
      this.opts.onApply(goal, s);
      this.close();
    });
  }
};
function percentLevel(p) {
  if (p == null) return "neutral";
  if (p < 30) return "low";
  if (p < 70) return "mid";
  return "high";
}
function paceLevelOf(p) {
  if (p == null) return "neutral";
  if (p > 0) return "pos";
  if (p < 0) return "neg";
  return "neutral";
}
function fmtSigned(n) {
  return n > 0 ? `+${n}` : `${n}`;
}
function summarize(evList) {
  const pcts = evList.map((e) => e.percent).filter((p) => p != null);
  const paces = evList.map((e) => e.paceDeviation).filter((p) => p != null);
  if (pcts.length === 0) {
    return { label: "\u65E0\u6570\u636E", headline: "\u65E0\u6570\u636E", level: "neutral" };
  }
  const avgPct = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  const avgPace = paces.length > 0 ? Math.round(paces.reduce((a, b) => a + b, 0) / paces.length) : 0;
  const allZero = evList.every((e) => e.doneDays === 0);
  if (allZero) {
    return {
      label: "\u8FD1 7 \u5929 0 \u5B8C\u6210",
      headline: "\u5168\u90E8\u505C\u6EDE",
      level: "bad"
    };
  }
  if (avgPct >= 70) {
    return {
      label: `\u5E73\u5747\u5B8C\u6210\u5EA6 ${avgPct}%`,
      headline: "\u6574\u4F53\u8FBE\u6807",
      level: "good"
    };
  }
  if (avgPace < -10) {
    return {
      label: `\u5E73\u5747\u5B8C\u6210\u5EA6 ${avgPct}% \xB7 \u8282\u594F ${fmtSigned(avgPace)}pt`,
      headline: "\u4E25\u91CD\u6EDE\u540E",
      level: "bad"
    };
  }
  return {
    label: `\u5E73\u5747\u5B8C\u6210\u5EA6 ${avgPct}% \xB7 \u8282\u594F ${fmtSigned(avgPace)}pt`,
    headline: "\u9700\u8981\u5173\u6CE8",
    level: "warn"
  };
}

// src/ai/SuggestionApplyModal.ts
var import_obsidian10 = require("obsidian");
var ACTION_LABEL = {
  adjust_dailyMin: "\u8C03\u6574\u6BCF\u65E5\u91CF",
  remove_subitem: "\u5220\u9664\u5B50\u9879",
  add_subitem: "\u65B0\u589E\u5B50\u9879",
  note: "\u5907\u6CE8"
};
function findItem(goals, s) {
  const goal = goals.find(
    (g) => s.goalRef.goalId != null && g.id === s.goalRef.goalId || g.title === s.goalRef.goalTitle
  );
  if (!goal) return null;
  const items = goal.items ?? [];
  let idx = -1;
  if (s.target?.subItemName != null) idx = items.findIndex((i) => i.name === s.target.subItemName);
  else if (s.target?.subItemIndex != null) idx = s.target.subItemIndex;
  if (idx < 0 || idx >= items.length) return null;
  return { name: items[idx].name, dailyMin: items[idx].dailyMin };
}
function describeHit(before, after, s) {
  const target = s.target?.subItemName ? s.target.subItemName : s.target?.subItemIndex != null ? `\u7B2C ${s.target.subItemIndex} \u4E2A\u5B50\u9879` : "\uFF08\u76EE\u6807\u7EA7\uFF09";
  const parts = [
    `\u76EE\u6807\u300C${s.goalRef.goalTitle ?? "(\u672A\u547D\u540D\u76EE\u6807)"}\u300D`,
    `\u5B50\u9879\u300C${target}\u300D`,
    ACTION_LABEL[s.action]
  ];
  if (s.action === "adjust_dailyMin") {
    const b = findItem(before, s);
    const a = findItem(after, s);
    const oldV = b?.dailyMin ?? "?";
    const newV = a?.dailyMin ?? "?";
    parts.push(`dailyMin ${oldV} \u2192 ${newV}`);
  } else if (s.action === "add_subitem" && s.params?.name) {
    parts.push(
      `\u65B0\u589E\u300C${s.params.name}\u300D${s.params.dailyMin != null ? ` dailyMin=${s.params.dailyMin}` : ""}`
    );
  } else if (s.action === "remove_subitem") {
    parts.push("\u5C06\u79FB\u9664\u8BE5\u5B50\u9879");
  }
  return parts.join(" \xB7 ");
}
var SuggestionApplyModal = class extends import_obsidian10.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("bamboo-sugg-apply-modal");
    contentEl.createEl("h2", { text: this.opts.title ?? "\u5E94\u7528\u8BCA\u65AD\u5EFA\u8BAE" });
    contentEl.createEl("p", {
      text: "\u4EE5\u4E0B\u4E3A\u786E\u5B9A\u6027\u6539\u5199\u9884\u89C8\uFF08\u5DF2\u7CBE\u51C6\u547D\u4E2D\u5177\u4F53\u5B50\u9879\uFF09\uFF0C\u786E\u8BA4\u540E\u5199\u5165\u76EE\u6807\u5E93\u3002",
      cls: "bamboo-sugg-apply-desc"
    });
    const list = contentEl.createDiv({ cls: "bamboo-sugg-apply-list" });
    for (const s of this.opts.suggestions) {
      const row = list.createDiv({ cls: "bamboo-sugg-apply-row" });
      row.createSpan({ text: s.text, cls: "bamboo-sugg-apply-text" });
      row.createSpan({
        text: describeHit(this.opts.before, this.opts.after, s),
        cls: "bamboo-sugg-apply-hit"
      });
    }
    const footer = contentEl.createDiv({ cls: "bamboo-sugg-apply-footer" });
    const confirm = footer.createEl("button", {
      text: "\u786E\u8BA4\u5199\u5165",
      cls: "bamboo-ai-plan-btn bamboo-ai-plan-btn-primary"
    });
    confirm.addEventListener("click", () => {
      this.opts.onConfirm(this.opts.after);
      this.close();
    });
    if (this.opts.onEscalateAI) {
      const ai = footer.createEl("button", {
        text: "\u7528 AI \u8C03\u6574",
        cls: "bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost"
      });
      ai.addEventListener("click", () => {
        this.opts.onEscalateAI?.(this.opts.after);
        this.close();
      });
    }
    const cancel = footer.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "bamboo-ai-plan-btn bamboo-ai-plan-btn-ghost"
    });
    cancel.addEventListener("click", () => this.close());
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/ai/GoalDiagnoser.ts
var import_obsidian11 = require("obsidian");

// src/ai/DeviationCalculator.ts
function buildCache(goals, days) {
  const goalIds = (goals || []).map((g) => g.id);
  const byDateKey = {};
  const itemCompletions = {};
  const itemLastDone = {};
  for (const raw of days || []) {
    const day = raw;
    const completionsByGoal = day.goalTaskCompletions;
    const progressMap = day.goalProgress;
    if (!completionsByGoal && !progressMap) continue;
    const entry = {};
    for (const gid of goalIds) {
      let active = false;
      let count = 0;
      if (completionsByGoal && completionsByGoal[gid]) {
        const gMap = completionsByGoal[gid];
        for (const [key, v] of Object.entries(gMap)) {
          if (v) {
            active = true;
            count++;
            itemCompletions[gid] = itemCompletions[gid] || {};
            itemCompletions[gid][key] = (itemCompletions[gid][key] || 0) + 1;
            itemLastDone[gid] = itemLastDone[gid] || {};
            if (!itemLastDone[gid][key] || day.date > itemLastDone[gid][key]) {
              itemLastDone[gid][key] = day.date;
            }
          }
        }
      }
      const prog = progressMap ? progressMap[gid] : void 0;
      if (active || prog !== void 0) {
        entry[gid] = { active, completions: count, progress: prog };
      }
    }
    if (Object.keys(entry).length > 0) {
      byDateKey[day.date] = entry;
    }
  }
  return { byDateKey, goalIds, totalDays: (days || []).length, itemCompletions, itemLastDone };
}
function countWorkdays(start, end) {
  let count = 0;
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (cur > last) return 0;
  while (cur <= last) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
function parseDate(s) {
  if (!s) return null;
  const d = /* @__PURE__ */ new Date(`${s}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}
var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function computeGoalDeviation(goal, cache, today = /* @__PURE__ */ new Date()) {
  const start = parseDate(goal.startDate);
  const end = parseDate(goal.endDate);
  const actualProgress = clamp(Number(goal.progress) || 0, 0, 100);
  let expectedProgress;
  let hasDates = false;
  if (start && end && start <= end) {
    hasDates = true;
    const total = countWorkdays(start, end);
    const elapsed = countWorkdays(start, today);
    expectedProgress = total > 0 ? clamp(elapsed / total * 100, 0, 100) : 50;
  } else {
    expectedProgress = 50;
  }
  const diff = actualProgress - expectedProgress;
  const deviationRate = expectedProgress > 0 ? clamp((actualProgress - expectedProgress) / expectedProgress, -1, 1) : 0;
  const hadDays = cache.totalDays > 0;
  let everActive = false;
  let recentActivity = 0;
  const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  cutoff.setDate(cutoff.getDate() - 7);
  for (const [dateKey, entry] of Object.entries(cache.byDateKey)) {
    const e = entry[goal.id];
    if (!e) continue;
    if (e.active) everActive = true;
    const d = parseDate(dateKey);
    if (d && d >= cutoff) recentActivity += e.completions || 0;
  }
  const stagnation = hadDays && !everActive && actualProgress < 100;
  let status;
  if (actualProgress >= 100) {
    status = "done";
  } else if (stagnation && diff < 0) {
    status = "stuck";
  } else if (!hasDates) {
    status = diff < 0 ? "behind" : "on_track";
  } else if (diff <= -15) {
    status = "at_risk";
  } else if (diff < 0) {
    status = "behind";
  } else {
    status = "on_track";
  }
  return {
    goalId: goal.id,
    title: goal.title,
    expectedProgress: Math.round(expectedProgress),
    actualProgress: Math.round(actualProgress),
    deviationRate,
    status,
    stagnation,
    recentActivity
  };
}
function summarize2(goals, cache, today = /* @__PURE__ */ new Date()) {
  if (!goals || goals.length === 0) return "\uFF08\u65E0\u76EE\u6807\uFF09";
  return goals.map((g) => {
    const d = computeGoalDeviation(g, cache, today);
    const flag = d.stagnation ? " [\u505C\u6EDE]" : "";
    return `- ${g.title}\uFF5C\u72B6\u6001=${d.status}${flag}\uFF5C\u9884\u671F\u8FDB\u5EA6=${d.expectedProgress}% \u5B9E\u9645=${d.actualProgress}%\uFF5C\u504F\u5DEE=${(d.deviationRate * 100).toFixed(0)}%\uFF5C\u8FD17\u5929\u5B8C\u6210=${d.recentActivity}`;
  }).join("\n");
}
function buildItemEvidence(goal, cache, today = /* @__PURE__ */ new Date()) {
  const items = goal.items ?? [];
  const gid = goal.id;
  return items.map((it, i) => {
    const idx = String(i);
    const done = cache.itemCompletions[gid]?.[idx] ?? 0;
    const last = cache.itemLastDone[gid]?.[idx] ?? null;
    let percent = null;
    if (typeof it.percent === "number") {
      percent = it.percent;
    } else {
      const t = Number(it.targetValue);
      const c = Number(it.currentValue);
      if (t > 0) percent = clamp(c / t * 100, 0, 100);
    }
    const start = parseDate(it.startDate ?? goal.startDate);
    const end = parseDate(it.endDate ?? goal.endDate);
    let pacePct = null;
    if (start && end && start <= end) {
      const total = countWorkdays(start, end);
      const elapsed = countWorkdays(start, today);
      pacePct = total > 0 ? clamp(elapsed / total * 100, 0, 100) : null;
    }
    const paceDeviation = percent != null && pacePct != null ? Math.round(percent - pacePct) : null;
    return {
      index: i,
      name: it.name,
      dailyMin: it.dailyMin ?? "",
      percent,
      pacePct,
      paceDeviation,
      doneDays: done,
      lastDone: last
    };
  });
}
function buildItemEvidenceMap(goals, cache, today = /* @__PURE__ */ new Date()) {
  const out = {};
  for (const g of goals || []) {
    out[g.title] = buildItemEvidence(g, cache, today);
  }
  return out;
}
function formatItemEvidenceForPrompt(goals, cache, today = /* @__PURE__ */ new Date()) {
  if (!goals || goals.length === 0) return "\uFF08\u65E0\u5B50\u9879\u6570\u636E\uFF09";
  return goals.map((g) => {
    const evs = buildItemEvidence(g, cache, today);
    const lines = evs.length ? evs.map(
      (e) => `    - [${e.index}] ${e.name}\uFF5CdailyMin=${e.dailyMin || "?"}\uFF5C\u5B8C\u6210\u5EA6=${e.percent != null ? e.percent + "%" : "?"}\uFF5C\u8282\u594F\u5E94\u5B8C\u6210=${e.pacePct != null ? e.pacePct + "%" : "?"}\uFF5C\u8282\u594F\u504F\u5DEE=${e.paceDeviation != null ? e.paceDeviation + "pt" : "?"}\uFF5C\u7A97\u53E3\u5185\u5B8C\u6210 ${e.doneDays} \u5929\uFF08\u6700\u8FD1 ${e.lastDone ?? "\u65E0"}\uFF09`
    ).join("\n") : "    \uFF08\u65E0\u5B50\u9879\uFF09";
    return `\u76EE\u6807\u300C${g.title}\u300D\uFF08goalId=${g.id}\uFF09\uFF1A
${lines}`;
  }).join("\n");
}

// src/ai/healthScore.ts
var TUNING = {
  // 三层总分权重
  WEIGHT_L1: 0.45,
  WEIGHT_L2: 0.3,
  WEIGHT_L3: 0.25,
  // L1 内部子项权重
  L1_ON_TIME: 0.3,
  L1_MODERATE_EARLY: 0.1,
  L1_WEEKLY_ACTIVE: 0.05,
  // L2 内部子项权重
  L2_PROGRESS_TREND: 0.2,
  L2_COMPLETION_TREND: 0.1,
  // L3 内部平衡分权重
  L3_BALANCE: 0.1,
  // 周活跃度 / 进度趋势回溯天数
  RECENT_DAYS: 7,
  // 停滞检测最大回溯天数
  STAGNATION_WINDOW: 60,
  // 过度超前 / 拖延宽容天数与惩罚系数
  TOLERANCE_EARLY_DAYS: 3,
  OVER_EARLY_PENALTY_MAX: 50,
  OVER_EARLY_PENALTY_RATE: 5,
  TOLERANCE_DELAY_DAYS: 3,
  DELAY_PENALTY_MAX: 30,
  DELAY_PENALTY_RATE: 3,
  // 停滞惩罚指数曲线
  STAGNATION_EXPONENT: 1.5,
  STAGNATION_DIVISOR: 5,
  STAGNATION_PENALTY_MAX: 40,
  // 平衡分惩罚系数
  BALANCE_PENALTY_RATE: 1.5,
  // L2 进度趋势判定阈值
  TREND_ACCEL_THRESHOLD: 5,
  // 建议系统阈值
  SUGGESTION_LOW: 60,
  SUGGESTION_HIGH: 85,
  // 综合趋势映射
  TREND_STRONG_HIGH: 75,
  TREND_WEAK_HIGH: 60,
  TREND_STRONG_LOW: 40,
  TREND_WEAK_LOW: 55,
  // 等级划分阈值
  LEVEL_EXCELLENT: 85,
  LEVEL_GOOD: 70,
  LEVEL_WARNING: 50,
  // 诊断系统阈值
  HINT_L1: 70,
  HINT_L2: 60,
  HINT_L3: 70,
  HINT_LATE_GOAL_SCORE: 60,
  HINT_STAGNATION_PENALTY: 15,
  HINT_BALANCE_SCORE: 60,
  HINT_HIGH_SCORE: 90
};
var LEVELS = {
  excellent: { label: "\u4F18\u79C0", min: TUNING.LEVEL_EXCELLENT, color: "var(--bamboo-primary)" },
  good: { label: "\u826F\u597D", min: TUNING.LEVEL_GOOD, color: "var(--bamboo-light)" },
  warning: { label: "\u9700\u5173\u6CE8", min: TUNING.LEVEL_WARNING, color: "#f59e0b" },
  risk: { label: "\u98CE\u9669", min: 0, color: "#dc3545" }
};
function clamp2(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function buildHolidays(refYear) {
  const h = /* @__PURE__ */ new Set();
  const add = (y, m, d) => h.add(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  [refYear, refYear + 1].forEach((y) => {
    add(y, 1, 1);
    add(y, 5, 1);
    add(y, 5, 2);
    add(y, 5, 3);
    add(y, 10, 1);
    add(y, 10, 2);
    add(y, 10, 3);
    add(y, 10, 4);
    add(y, 10, 5);
    add(y, 10, 6);
    add(y, 10, 7);
    add(y, 4, 4);
    add(y, 4, 5);
    add(y, 4, 6);
    add(y, 6, 9);
    add(y, 6, 10);
    add(y, 9, 14);
    add(y, 9, 15);
    add(y, 9, 16);
  });
  if (refYear <= 2025 && 2025 <= refYear + 1) {
    [
      "2025-01-28",
      "2025-01-29",
      "2025-01-30",
      "2025-01-31",
      "2025-02-01",
      "2025-02-02",
      "2025-02-03",
      "2025-02-04"
    ].forEach((d) => h.add(d));
  }
  if (refYear <= 2026 && 2026 <= refYear + 1) {
    [
      "2026-02-16",
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-21",
      "2026-02-22"
    ].forEach((d) => h.add(d));
  }
  return h;
}
var _holidayCache = null;
function _getHolidays(year) {
  if (_holidayCache && _holidayCache.year === year) return _holidayCache.set;
  const set = buildHolidays(year);
  _holidayCache = { year, set };
  return set;
}
function isWorkday(d, holidays) {
  const day = d.getDay();
  if (day === 0 || day === 6) return false;
  return !holidays.has(fmt(d));
}
function countWorkdays2(from, to, holidays) {
  let count = 0;
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (cur > last) return 0;
  while (cur <= last) {
    if (isWorkday(cur, holidays)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
function workdaysBetween(from, to, holidays) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (b >= a) return countWorkdays2(a, b, holidays);
  return -countWorkdays2(b, a, holidays);
}
function cacheActiveOnDate(cache, goalId, dateKey) {
  const day = cache.byDateKey[dateKey];
  if (!day) return false;
  const entry = day[goalId];
  return !!entry && !!entry.active;
}
function cacheCompletionsOnDate(cache, goalId, dateKey) {
  const day = cache.byDateKey[dateKey];
  if (!day) return 0;
  const entry = day[goalId];
  return entry ? entry.completions || 0 : 0;
}
function cacheProgressOnDate(cache, goalId, dateKey) {
  const day = cache.byDateKey[dateKey];
  if (!day) return void 0;
  const entry = day[goalId];
  return entry ? entry.progress : void 0;
}
function scoreOnTime(goal, progress, isComplete, holidays, today) {
  if (!goal.endDate) return { score: 70, hint: "\u672A\u8BBE\u622A\u6B62\u65E5\u671F" };
  if (goal.startDate && goal.endDate) {
    const s = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
    const e = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
    if (s > e) return { score: 0, hint: "\u65E5\u671F\u8303\u56F4\u5F02\u5E38" };
  }
  const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
  end.setHours(0, 0, 0, 0);
  const daysToDeadline = workdaysBetween(today, end, holidays);
  if (isComplete) {
    if (daysToDeadline >= -TUNING.TOLERANCE_DELAY_DAYS && daysToDeadline <= 0) {
      return { score: 100, hint: "\u6309\u65F6\u5B8C\u6210" };
    }
    if (daysToDeadline > 0) return { score: 100, hint: "\u63D0\u524D\u5B8C\u6210" };
    const late = Math.abs(daysToDeadline);
    const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
    return { score: clamp2(100 - penalty, 0, 100), hint: `\u62D6\u5EF6${late}\u4E2A\u5DE5\u4F5C\u65E5` };
  }
  if (daysToDeadline < -TUNING.TOLERANCE_DELAY_DAYS) {
    const late = Math.abs(daysToDeadline);
    const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, late * TUNING.DELAY_PENALTY_RATE);
    return { score: clamp2(70 - penalty, 0, 100), hint: `\u5DF2\u903E\u671F${late}\u4E2A\u5DE5\u4F5C\u65E5` };
  }
  if (!goal.startDate) return { score: 65, hint: "\u672A\u8BBE\u5F00\u59CB\u65E5\u671F" };
  const start = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
  start.setHours(0, 0, 0, 0);
  if (today < start) return { score: 80, hint: "\u5C1A\u672A\u5F00\u59CB" };
  const totalWorkdays = countWorkdays2(start, end, holidays);
  const elapsedWorkdays = countWorkdays2(start, today, holidays);
  const expected = totalWorkdays > 0 ? elapsedWorkdays / totalWorkdays * 100 : 50;
  const diff = progress - expected;
  if (diff >= 0) return { score: 100, hint: "\u8FDB\u5EA6\u8FBE\u6807" };
  if (diff > -15) return { score: clamp2(85 + diff, 0, 100), hint: "\u8F7B\u5FAE\u843D\u540E" };
  if (diff > -30) return { score: clamp2(60 + diff * 0.5, 0, 100), hint: "\u660E\u663E\u843D\u540E" };
  return { score: clamp2(40 + diff * 0.2, 0, 100), hint: "\u4E25\u91CD\u843D\u540E" };
}
function scoreModerateEarly(goal, progress, isComplete, holidays, today) {
  if (!goal.endDate) return { score: 70, hint: "\u672A\u8BBE\u622A\u6B62\u65E5\u671F" };
  const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
  end.setHours(0, 0, 0, 0);
  const daysToDeadline = workdaysBetween(today, end, holidays);
  if (isComplete) {
    if (daysToDeadline >= 1 && daysToDeadline <= TUNING.TOLERANCE_EARLY_DAYS) {
      return { score: 80, hint: "\u9002\u5EA6\u63D0\u524D" };
    }
    if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS) {
      const penalty = Math.min(
        TUNING.OVER_EARLY_PENALTY_MAX,
        daysToDeadline * TUNING.OVER_EARLY_PENALTY_RATE
      );
      return { score: clamp2(80 - penalty, 0, 100), hint: `\u8FC7\u5EA6\u8D85\u524D${daysToDeadline}\u5929` };
    }
    return { score: 100, hint: "\u6309\u65F6\u5B8C\u6210" };
  }
  if (daysToDeadline > TUNING.TOLERANCE_EARLY_DAYS && progress >= 90) {
    return { score: 75, hint: "\u63A5\u8FD1\u5B8C\u6210" };
  }
  return { score: 70, hint: "\u8FDB\u884C\u4E2D" };
}
function scoreWeeklyActive(goal, _items, cache, holidays, today) {
  let activeDays = 0;
  for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (!isWorkday(d, holidays)) continue;
    const key = fmt(d);
    if (cacheActiveOnDate(cache, goal.id, key)) activeDays++;
  }
  let workdaysThisWeek = 0;
  for (let i = 0; i < TUNING.RECENT_DAYS; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (isWorkday(d, holidays)) workdaysThisWeek++;
  }
  const ratio = workdaysThisWeek > 0 ? activeDays / workdaysThisWeek : 0;
  return {
    score: clamp2(Math.round(ratio * 100), 0, 100),
    hint: activeDays > 0 ? `\u5468\u6D3B\u8DC3${activeDays}\u5929` : "\u672C\u5468\u65E0\u63A8\u8FDB"
  };
}
function scoreL1(goal, items, progress, isComplete, cache, holidays, today) {
  const onTime = scoreOnTime(goal, progress, isComplete, holidays, today);
  const moderateEarly = scoreModerateEarly(goal, progress, isComplete, holidays, today);
  const weeklyActive = scoreWeeklyActive(goal, items, cache, holidays, today);
  const score = clamp2(
    Math.round(
      (onTime.score * TUNING.L1_ON_TIME + moderateEarly.score * TUNING.L1_MODERATE_EARLY + weeklyActive.score * TUNING.L1_WEEKLY_ACTIVE) / (TUNING.L1_ON_TIME + TUNING.L1_MODERATE_EARLY + TUNING.L1_WEEKLY_ACTIVE)
    ),
    0,
    100
  );
  return { score: Math.round(score), onTime, moderateEarly, weeklyActive };
}
function scoreProgressTrend(goal, _items, progress, isComplete, cache, holidays, today) {
  if (isComplete) return { score: 100, hint: "\u5DF2\u5B8C\u6210" };
  if (!goal.startDate || !goal.endDate) return { score: 60, hint: "\u7F3A\u5C11\u65E5\u671F\u4FE1\u606F" };
  if (goal.startDate && goal.endDate) {
    const s = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
    const e = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
    if (s > e) return { score: 0, hint: "\u65E5\u671F\u8303\u56F4\u5F02\u5E38" };
  }
  const start = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
  start.setHours(0, 0, 0, 0);
  if (today < start) return { score: 50, hint: "\u5C1A\u672A\u5F00\u59CB" };
  const recentDays = TUNING.RECENT_DAYS;
  let recentProgress = 0;
  let olderProgress = 0;
  let recentHasData = false;
  let olderHasData = false;
  for (let i = 0; i < recentDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    const p = cacheProgressOnDate(cache, goal.id, key);
    if (p !== void 0) {
      recentProgress = p;
      recentHasData = true;
      break;
    }
  }
  for (let i = recentDays; i < recentDays * 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    const p = cacheProgressOnDate(cache, goal.id, key);
    if (p !== void 0) {
      olderProgress = p;
      olderHasData = true;
      break;
    }
  }
  if (!recentHasData && !olderHasData) {
    const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
    end.setHours(0, 0, 0, 0);
    const totalWd = countWorkdays2(start, end, holidays);
    const elapsedWd = countWorkdays2(start, today, holidays);
    const expected = totalWd > 0 ? elapsedWd / totalWd * 100 : 50;
    const diff2 = progress - expected;
    if (diff2 >= 0) return { score: 80, hint: "\u8FDB\u5EA6\u6B63\u5E38" };
    if (diff2 > -20) return { score: 60, hint: "\u7A0D\u6709\u843D\u540E" };
    return { score: 40, hint: "\u8FDB\u5EA6\u504F\u6162" };
  }
  if (!olderHasData) return { score: 65, hint: "\u6570\u636E\u4E0D\u8DB3" };
  const diff = recentProgress - olderProgress;
  if (diff > TUNING.TREND_ACCEL_THRESHOLD) return { score: 90, hint: "\u8FDB\u5EA6\u52A0\u901F" };
  if (diff > 0) return { score: 75, hint: "\u7A33\u6B65\u63A8\u8FDB" };
  if (diff === 0) return { score: 50, hint: "\u8FDB\u5EA6\u505C\u6EDE" };
  return { score: 30, hint: "\u8FDB\u5EA6\u5012\u9000" };
}
function scoreCompletionTrend(goal, _items, isComplete, cache, _holidays, today) {
  if (isComplete) return { score: 100, hint: "\u5DF2\u5B8C\u6210" };
  if (!goal.items || goal.items.length === 0) return { score: 60, hint: "\u65E0\u5B50\u9879" };
  let recentCompletions = 0;
  let olderCompletions = 0;
  const recentDays = TUNING.RECENT_DAYS;
  for (let i = 0; i < recentDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    recentCompletions += cacheCompletionsOnDate(cache, goal.id, key);
  }
  for (let i = recentDays; i < recentDays * 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    olderCompletions += cacheCompletionsOnDate(cache, goal.id, key);
  }
  if (recentCompletions === 0 && olderCompletions === 0) {
    return { score: 50, hint: "\u8FD1\u671F\u65E0\u5B8C\u6210" };
  }
  if (recentCompletions > olderCompletions) return { score: 85, hint: "\u5B8C\u6210\u52A0\u901F" };
  if (recentCompletions === olderCompletions) return { score: 65, hint: "\u5B8C\u6210\u7A33\u5B9A" };
  return { score: 40, hint: "\u5B8C\u6210\u653E\u7F13" };
}
function scoreL2(goal, items, progress, isComplete, cache, holidays, today) {
  const progressTrend = scoreProgressTrend(goal, items, progress, isComplete, cache, holidays, today);
  const completionTrend = scoreCompletionTrend(goal, items, isComplete, cache, holidays, today);
  const score = clamp2(
    Math.round(
      (progressTrend.score * TUNING.L2_PROGRESS_TREND + completionTrend.score * TUNING.L2_COMPLETION_TREND) / (TUNING.L2_PROGRESS_TREND + TUNING.L2_COMPLETION_TREND)
    ),
    0,
    100
  );
  return { score: Math.round(score), progressTrend, completionTrend };
}
function scoreStagnation(goal, _items, _progress, isComplete, cache, holidays, today) {
  if (isComplete) return { penalty: 0, hint: "\u5DF2\u5B8C\u6210" };
  if (!goal.startDate) return { penalty: 0, hint: "\u65E0\u5F00\u59CB\u65E5\u671F" };
  const start = /* @__PURE__ */ new Date(goal.startDate + "T00:00:00");
  start.setHours(0, 0, 0, 0);
  if (today < start) return { penalty: 0, hint: "\u5C1A\u672A\u5F00\u59CB" };
  let lastActiveDate = null;
  for (let i = 0; i < TUNING.STAGNATION_WINDOW; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    if (cacheActiveOnDate(cache, goal.id, key)) {
      lastActiveDate = d;
      break;
    }
  }
  if (!lastActiveDate) {
    const stagnantDays2 = workdaysBetween(start, today, holidays);
    const penalty2 = Math.min(
      TUNING.STAGNATION_PENALTY_MAX,
      Math.pow(stagnantDays2 / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT)
    );
    return { penalty: Math.round(penalty2), hint: `\u4ECE\u672A\u63A8\u8FDB(${stagnantDays2}\u5929)` };
  }
  const stagnantDays = workdaysBetween(lastActiveDate, today, holidays);
  if (stagnantDays <= 2) return { penalty: 0, hint: "\u8FD1\u671F\u6709\u63A8\u8FDB" };
  const penalty = Math.min(
    TUNING.STAGNATION_PENALTY_MAX,
    Math.pow(stagnantDays / TUNING.STAGNATION_DIVISOR, TUNING.STAGNATION_EXPONENT)
  );
  return { penalty: Math.round(penalty), hint: `\u505C\u6EDE${stagnantDays}\u4E2A\u5DE5\u4F5C\u65E5` };
}
function scoreBalance(items, isComplete) {
  if (isComplete) return { score: 100, hint: "\u5DF2\u5B8C\u6210" };
  if (!items || items.length <= 1) return { score: 80, hint: "\u5B50\u9879\u4E0D\u8DB3" };
  const progresses = items.map((it) => {
    const tar = parseFloat(it.targetValue ?? "0");
    if (tar === 0) {
      const cur2 = parseFloat(it.currentValue ?? "0") || 0;
      return cur2 === 0 ? 100 : 0;
    }
    const tarSafe = tar || 100;
    const cur = parseFloat(it.currentValue ?? "0") || 0;
    return cur / tarSafe * 100;
  });
  const avg = progresses.reduce((s, v) => s + v, 0) / progresses.length;
  const variance = progresses.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / progresses.length;
  const stdDev = Math.sqrt(variance);
  const score = clamp2(Math.round(100 - stdDev * TUNING.BALANCE_PENALTY_RATE), 0, 100);
  return {
    score,
    hint: stdDev > 30 ? "\u8FDB\u5EA6\u4E0D\u5747\u8861" : stdDev > 15 ? "\u8FDB\u5EA6\u7565\u6709\u5DEE\u5F02" : "\u8FDB\u5EA6\u5747\u8861"
  };
}
function scoreOverEarly(goal, _progress, isComplete, holidays, today) {
  if (!goal.endDate || !isComplete) return { penalty: 0, hint: "" };
  const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
  end.setHours(0, 0, 0, 0);
  const daysEarly = workdaysBetween(today, end, holidays);
  if (daysEarly > TUNING.TOLERANCE_EARLY_DAYS) {
    const penalty = Math.min(
      TUNING.OVER_EARLY_PENALTY_MAX,
      daysEarly * TUNING.OVER_EARLY_PENALTY_RATE
    );
    return { penalty: Math.round(penalty), hint: `\u8FC7\u5EA6\u8D85\u524D${daysEarly}\u5929` };
  }
  return { penalty: 0, hint: "" };
}
function scoreDelay(goal, _progress, _isComplete, holidays, today) {
  if (!goal.endDate) return { penalty: 0, hint: "" };
  const end = /* @__PURE__ */ new Date(goal.endDate + "T00:00:00");
  end.setHours(0, 0, 0, 0);
  const daysLate = workdaysBetween(end, today, holidays);
  if (daysLate > TUNING.TOLERANCE_DELAY_DAYS) {
    const penalty = Math.min(TUNING.DELAY_PENALTY_MAX, daysLate * TUNING.DELAY_PENALTY_RATE);
    return { penalty: Math.round(penalty), hint: `\u62D6\u5EF6${daysLate}\u5929` };
  }
  return { penalty: 0, hint: "" };
}
function scoreL3(goal, items, progress, isComplete, cache, holidays, today) {
  const stagnation = scoreStagnation(goal, items, progress, isComplete, cache, holidays, today);
  const balance = scoreBalance(items, isComplete);
  const overEarly = scoreOverEarly(goal, progress, isComplete, holidays, today);
  const delay = scoreDelay(goal, progress, isComplete, holidays, today);
  let score = 100;
  score -= stagnation.penalty;
  score = score * (1 - TUNING.L3_BALANCE) + balance.score * TUNING.L3_BALANCE;
  score -= overEarly.penalty;
  score -= delay.penalty;
  return {
    score: clamp2(Math.round(score), 0, 100),
    stagnation,
    balance,
    overEarly,
    delay
  };
}
function levelFor(score) {
  if (score >= TUNING.LEVEL_EXCELLENT) return "excellent";
  if (score >= TUNING.LEVEL_GOOD) return "good";
  if (score >= TUNING.LEVEL_WARNING) return "warning";
  return "risk";
}
function computeGoalHealth(goal, cache, today) {
  const items = Array.isArray(goal.items) ? goal.items : [];
  const progress = clamp2(Number(goal.progress) || 0, 0, 100);
  const isComplete = progress >= 100;
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const holidays = _getHolidays(t.getFullYear());
  const L1 = scoreL1(goal, items, progress, isComplete, cache, holidays, t);
  const L2 = scoreL2(goal, items, progress, isComplete, cache, holidays, t);
  const L3 = scoreL3(goal, items, progress, isComplete, cache, holidays, t);
  const score = clamp2(
    Math.round(
      L1.score * TUNING.WEIGHT_L1 + L2.score * TUNING.WEIGHT_L2 + L3.score * TUNING.WEIGHT_L3
    ),
    0,
    100
  );
  const level = levelFor(score);
  return {
    score,
    level,
    label: LEVELS[level].label,
    color: LEVELS[level].color,
    L1,
    L2,
    L3
  };
}
function generateHealthHints(result, _set) {
  const hints = [];
  if (result.L1.score < TUNING.HINT_L1) {
    if (result.L1.onTime.score < TUNING.HINT_LATE_GOAL_SCORE) {
      hints.push({
        dimension: "L1",
        type: "danger",
        icon: "calendar",
        text: "\u7B97\u6CD5\u68C0\u6D4B\u5230\u8BE5\u76EE\u6807\u8FDB\u5EA6\u4E25\u91CD\u843D\u540E\u4E8E\u8BA1\u5212\u3002",
        action: "\u6839\u636E\u5F53\u524D\u5B8C\u6210\u901F\u7387\uFF0C\u5EFA\u8BAE\u8C03\u6574\u622A\u6B62\u65E5\u671F\u6216\u7CBE\u7B80\u4EFB\u52A1\u5B50\u9879\u3002"
      });
    } else if (result.L1.score < 50) {
      hints.push({
        dimension: "L1",
        type: "warning",
        icon: "zap",
        text: "\u7CFB\u7EDF\u76D1\u6D4B\u5230\u672C\u5468\u6D3B\u8DC3\u5929\u6570\u672A\u8FBE\u6807\u3002",
        action: "\u6570\u636E\u8868\u660E\uFF1A\u5C0F\u6B65\u5FEB\u8DD1\u7684\u9891\u7387\u6BD4\u5355\u6B21\u957F\u65F6\u95F4\u6295\u5165\u66F4\u6709\u52A9\u4E8E\u7EF4\u6301\u76EE\u6807\u5065\u5EB7\u3002"
      });
    }
  }
  if (result.L2.score < TUNING.HINT_L2) {
    hints.push({
      dimension: "L2",
      type: "warning",
      icon: "trending-up",
      text: "\u52A8\u529B\u6307\u6570\u4E0B\u964D\uFF1A\u8FD1\u671F\u8FDB\u5EA6\u589E\u91CF\u4F4E\u4E8E\u5386\u53F2\u5E73\u5747\u6C34\u5E73\u3002",
      action: "\u6267\u884C\u52A8\u529B\u8FDB\u5165\u74F6\u9888\u671F\uFF0C\u5EFA\u8BAE\u901A\u8FC7\u5B8C\u6210\u4E00\u4E2A\u7B80\u5355\u7684\u5B50\u9879\u6765\u91CD\u65B0\u6FC0\u6D3B\u60EF\u6027\u3002"
    });
  }
  if (result.L3.stagnation.penalty > TUNING.HINT_STAGNATION_PENALTY) {
    hints.push({
      dimension: "L3",
      type: "danger",
      icon: "clock",
      text: "\u68C0\u6D4B\u5230\u8BE5\u76EE\u6807\u5DF2\u505C\u6EDE\u8D85\u8FC7\u9884\u671F\u9608\u503C\u3002",
      action: "\u957F\u671F\u505C\u6EDE\u4F1A\u663E\u8457\u964D\u4F4E\u5B8C\u6210\u6982\u7387\uFF0C\u5EFA\u8BAE\u7ACB\u5373\u590D\u67E5\u9879\u76EE\u53EF\u884C\u6027\u3002"
    });
  }
  if (result.L3.balance.score < TUNING.HINT_BALANCE_SCORE) {
    hints.push({
      dimension: "L3",
      type: "warning",
      icon: "scale",
      text: "\u5B50\u9879\u65B9\u5DEE\u8FC7\u5927\uFF1A\u9879\u76EE\u5185\u90E8\u8FDB\u5EA6\u5206\u5E03\u4E25\u91CD\u4E0D\u5747\u3002",
      action: "\u5173\u6CE8\u88AB\u957F\u671F\u5FFD\u7565\u7684\u8FB9\u7F18\u5B50\u9879\uFF0C\u9632\u6B62\u9879\u76EE\u540E\u671F\u51FA\u73B0\u7ED3\u6784\u6027\u5D29\u584C\u3002"
    });
  }
  if (result.score >= TUNING.HINT_HIGH_SCORE) {
    hints.push({
      dimension: "L1",
      type: "success",
      icon: "sparkles",
      text: "\u7B97\u6CD5\u8BC4\u4F30\uFF1A\u6218\u7565\u6267\u884C\u529B\u5904\u4E8E\u6781\u9AD8\u6C34\u5E73\u3002",
      action: "\u5F53\u524D\u6570\u636E\u6A21\u578B\u663E\u793A\u4F60\u5DF2\u5EFA\u7ACB\u7A33\u56FA\u7684\u4E60\u60EF\u95ED\u73AF\uFF0C\u5EFA\u8BAE\u4FDD\u6301\u73B0\u72B6\u3002"
    });
  } else if (hints.length === 0) {
    hints.push({
      dimension: "L1",
      type: "success",
      icon: "check-circle",
      text: "\u7CFB\u7EDF\u8BC4\u4F30\uFF1A\u5404\u7EF4\u5EA6\u6570\u636E\u6307\u6807\u5E73\u7A33\u3002",
      action: "\u5F53\u524D\u8282\u594F\u53EF\u6301\u7EED\uFF0C\u53EF\u5C1D\u8BD5\u9010\u6B65\u589E\u52A0\u4EFB\u52A1\u8D1F\u8377\u3002"
    });
  }
  return hints;
}
function weakestDimension(r) {
  const arr = [
    { dim: "L1", score: r.L1.score, weight: TUNING.WEIGHT_L1 },
    { dim: "L2", score: r.L2.score, weight: TUNING.WEIGHT_L2 },
    { dim: "L3", score: r.L3.score, weight: TUNING.WEIGHT_L3 }
  ];
  let min = arr[0];
  for (const x of arr) {
    if (x.score < min.score) min = x;
    else if (x.score === min.score && x.weight > min.weight) min = x;
  }
  return min.dim;
}

// src/ai/GoalDiagnoser.ts
var DIMENSION_LABEL = {
  L1: "\u5C65\u7EA6\u80FD\u529B",
  L2: "\u8D8B\u52BF\u52A8\u529B",
  L3: "\u53EF\u6301\u7EED\u5EA6"
};
var VALID_STATUS = /* @__PURE__ */ new Set([
  "on_track",
  "behind",
  "stuck",
  "done",
  "at_risk"
]);
var VALID_LEVEL = /* @__PURE__ */ new Set(["excellent", "good", "warning", "risk"]);
var VALID_DIMENSION = /* @__PURE__ */ new Set(["L1", "L2", "L3"]);
function asStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string");
}
function asNumber(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : void 0;
}
var VALID_ACTION = /* @__PURE__ */ new Set([
  "adjust_dailyMin",
  "remove_subitem",
  "add_subitem",
  "note"
]);
function parseSuggestions(raw, fallbackTitle) {
  if (!Array.isArray(raw)) return [];
  return raw.map((e) => {
    if (typeof e === "string") {
      return { action: "note", goalRef: { goalTitle: fallbackTitle }, text: e };
    }
    if (!e || typeof e !== "object") {
      return { action: "note", goalRef: { goalTitle: fallbackTitle }, text: "" };
    }
    const o = e;
    const action = typeof o.action === "string" && VALID_ACTION.has(o.action) ? o.action : "note";
    const grRaw = o.goalRef && typeof o.goalRef === "object" ? o.goalRef : o;
    const gr = grRaw;
    const goalRef = {
      goalId: typeof gr.goalId === "string" ? gr.goalId : void 0,
      goalTitle: typeof gr.goalTitle === "string" ? gr.goalTitle : typeof o.goalTitle === "string" ? o.goalTitle : fallbackTitle
    };
    const t = o.target && typeof o.target === "object" ? o.target : {};
    const target = typeof t.subItemName === "string" || typeof t.subItemIndex === "number" ? {
      subItemName: typeof t.subItemName === "string" ? t.subItemName : void 0,
      subItemIndex: typeof t.subItemIndex === "number" ? t.subItemIndex : void 0
    } : void 0;
    const p = o.params && typeof o.params === "object" ? o.params : {};
    const params = {
      dailyMin: asNumber(p.dailyMin),
      name: typeof p.name === "string" ? p.name : void 0,
      taskDayType: typeof p.taskDayType === "string" ? p.taskDayType : void 0,
      detail: typeof p.detail === "string" ? p.detail : void 0
    };
    const dimension = o.dimension === "L1" || o.dimension === "L2" || o.dimension === "L3" ? o.dimension : void 0;
    return {
      id: typeof o.id === "string" ? o.id : void 0,
      action,
      goalRef,
      target,
      params: params.dailyMin != null || params.name != null || params.taskDayType != null || params.detail != null ? params : void 0,
      text: typeof o.text === "string" ? o.text : "",
      rationale: typeof o.rationale === "string" ? o.rationale : void 0,
      dimension
    };
  });
}
function normalizeGoal(raw) {
  const g = raw && typeof raw === "object" ? raw : {};
  const status = typeof g.status === "string" && VALID_STATUS.has(g.status) ? g.status : "behind";
  const completion = typeof g.completion === "number" ? g.completion : void 0;
  const level = typeof g.level === "string" && VALID_LEVEL.has(g.level) ? g.level : void 0;
  const weakest = typeof g.weakest === "string" && VALID_DIMENSION.has(g.weakest) ? g.weakest : void 0;
  return {
    title: typeof g.title === "string" ? g.title : "",
    completion,
    status,
    healthScore: asNumber(g.healthScore),
    level,
    L1: asNumber(g.L1),
    L2: asNumber(g.L2),
    L3: asNumber(g.L3),
    weakest,
    bottleneck: typeof g.bottleneck === "string" ? g.bottleneck : void 0,
    suggestions: parseSuggestions(g.suggestions, typeof g.title === "string" ? g.title : ""),
    evidenceRef: typeof g.evidenceRef === "string" ? g.evidenceRef : void 0
  };
}
function parseDiagnosis(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return { ok: false, rawText: trimmed };
  let obj;
  try {
    obj = JSON.parse(trimmed);
  } catch {
    return { ok: false, rawText: trimmed };
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { ok: false, rawText: trimmed };
  }
  const o = obj;
  const goals = Array.isArray(o.goals) ? o.goals.map(normalizeGoal) : [];
  return {
    ok: true,
    summary: typeof o.summary === "string" ? o.summary : "",
    goals,
    nextActions: asStringArray(o.nextActions)
  };
}
function buildHealthSummary(goals, cache, today) {
  if (!goals || goals.length === 0) return "\uFF08\u65E0\u76EE\u6807\u6570\u636E\uFF09";
  const blocks = goals.map((goal) => {
    const r = computeGoalHealth(goal, cache, today);
    const weakest = weakestDimension(r);
    const dimLine = (key, sub) => `  \xB7 ${key} ${DIMENSION_LABEL[key]} ${r[key].score}\u5206\uFF08${sub}\uFF09`;
    const l1sub = `\u6309\u65F6:${r.L1.onTime.hint ?? "-"} / \u9002\u5EA6:${r.L1.moderateEarly.hint ?? "-"} / \u5468\u6D3B\u8DC3:${r.L1.weeklyActive.hint ?? "-"}`;
    const l2sub = `\u8FDB\u5EA6\u8D8B\u52BF:${r.L2.progressTrend.hint ?? "-"} / \u5B8C\u6210\u8D8B\u52BF:${r.L2.completionTrend.hint ?? "-"}`;
    const l3subParts = [
      r.L3.stagnation.hint ? `\u505C\u6EDE:${r.L3.stagnation.hint}` : "",
      r.L3.balance.hint ? `\u5747\u8861:${r.L3.balance.hint}` : "",
      r.L3.overEarly.penalty > 0 && r.L3.overEarly.hint ? `\u8D85\u524D:${r.L3.overEarly.hint}` : "",
      r.L3.delay.penalty > 0 && r.L3.delay.hint ? `\u62D6\u5EF6:${r.L3.delay.hint}` : ""
    ].filter(Boolean);
    const hints = generateHealthHints(r).map((h) => `  \u5F52\u56E0[${h.dimension} ${DIMENSION_LABEL[h.dimension]}] ${h.text} \u2192 ${h.action}`).join("\n");
    return [
      `\u76EE\u6807\u300C${goal.title}\u300D\u5065\u5EB7\u5206 ${r.score}/100\uFF08${r.label}\uFF09`,
      dimLine("L1", l1sub),
      dimLine("L2", l2sub),
      dimLine("L3", l3subParts.join(" / ") || "\u8282\u594F\u5065\u5EB7"),
      `  \u6700\u5F31\u7EF4\u5EA6\uFF1A${weakest} ${DIMENSION_LABEL[weakest]}`,
      hints
    ].join("\n");
  });
  return blocks.join("\n\n");
}
function buildDiagnosisMessages(summary, context, healthSummary) {
  const contextBlock = context && context.trim() ? context : "\uFF08\u65E0\u5B50\u9879\u6570\u636E\uFF09";
  const healthBlock = healthSummary && healthSummary.trim() ? healthSummary : "\uFF08\u65E0\u5065\u5EB7\u5206\u6570\u636E\uFF09";
  const system = [
    "\u4F60\u662F\u300C\u6218\u7565\u590D\u76D8\u300D\u6559\u7EC3\u3002\u7528\u6237\u7684\u76EE\u6807\u5065\u5EB7\u5EA6\u7531\u4E00\u5957\u4E09\u7EF4\u300C\u5065\u5EB7\u5206\u300D\u6A21\u578B\u8BC4\u4F30\uFF0C\u4F60\u5FC5\u987B\u5B8C\u5168\u57FA\u4E8E\u8FD9\u5957\u6A21\u578B\u7684\u54F2\u5B66\u505A\u5F52\u56E0\uFF0C\u800C\u4E0D\u662F\u7B80\u5355\u5730\u5224\u65AD\u300C\u662F\u5426\u843D\u540E\u300D\u3002",
    "",
    "\u5065\u5EB7\u5206\u4E09\u7EF4\u6A21\u578B\uFF1A",
    "- L1 \u5C65\u7EA6\u80FD\u529B\uFF08\u6743\u91CD 45%\uFF09\uFF1A\u662F\u5426\u6309\u65F6/\u9002\u5EA6\u63D0\u524D\u63A8\u8FDB\uFF08\u6309\u65F6 30% + \u9002\u5EA6\u63D0\u524D 10% + \u5468\u6D3B\u8DC3 5%\uFF09\u3002",
    "- L2 \u8D8B\u52BF\u52A8\u529B\uFF08\u6743\u91CD 30%\uFF09\uFF1A\u8FD1\u671F\u8FDB\u5EA6\u589E\u91CF\u4E0E\u5B8C\u6210\u8282\u594F\u662F\u5426\u5728\u52A0\u901F\uFF08\u8FDB\u5EA6\u8D8B\u52BF 20% + \u5B8C\u6210\u8D8B\u52BF 10%\uFF09\u3002",
    "- L3 \u53EF\u6301\u7EED\u5EA6\uFF08\u6743\u91CD 25%\uFF09\uFF1A\u505C\u6EDE\u60E9\u7F5A\u3001\u5B50\u9879\u5747\u8861\u5EA6\u3001\u8FC7\u5EA6\u8D85\u524D\u60E9\u7F5A\u3001\u62D6\u5EF6\u60E9\u7F5A\u3002",
    "",
    "\u5FC5\u987B\u5185\u5316\u7684\u53CD\u76F4\u89C9\u4EF7\u503C\u89C2\uFF08\u8FD9\u662F\u672C\u6A21\u578B\u7684\u8BBE\u8BA1\u54F2\u5B66\uFF09\uFF1A",
    "- \u300C\u9886\u5148\u300D\u2260\u300C\u5065\u5EB7\u300D\uFF1A\u8FC7\u5EA6\u8D85\u524D\u5B8C\u6210\uFF08\u8FDC\u65E9\u4E8E\u622A\u6B62\u65E5\uFF09\u4F1A\u88AB\u60E9\u7F5A\uFF0C\u4E0D\u8981\u4E00\u5473\u9F13\u52B1\u300C\u8D8A\u5FEB\u8D8A\u597D\u300D\u3002",
    "- \u505C\u6EDE\u4F1A\u6307\u6570\u7EA7\u6076\u5316\uFF1A\u8D8A\u4E45\u4E0D\u63A8\u8FDB\uFF0C\u5065\u5EB7\u5206\u4E0B\u964D\u8D8A\u5267\u70C8\uFF0C\u9700\u5C3D\u65E9\u6FC0\u6D3B\u60EF\u6027\u3002",
    "- \u8D8A\u5747\u8861\u8D8A\u5065\u5EB7\uFF1A\u5B50\u9879\u8FDB\u5EA6\u5206\u5E03\u8D8A\u5747\u5300\u8D8A\u597D\uFF0C\u8981\u5173\u6CE8\u88AB\u5FFD\u7565\u7684\u8FB9\u7F18\u5B50\u9879\uFF0C\u9632\u6B62\u7ED3\u6784\u6027\u5D29\u584C\u3002",
    "- \u6309\u300C\u7EF4\u5EA6\u300D\u5F52\u56E0\uFF0C\u800C\u975E\u300C\u662F\u5426\u843D\u540E\u300D\uFF1A\u5148\u5B9A\u4F4D\u6700\u5F31\u7EF4\u5EA6\uFF08weakest\uFF09\uFF0C\u518D\u9488\u5BF9\u8BE5\u7EF4\u5EA6\u7ED9\u5EFA\u8BAE\u3002",
    "- \u82E5\u67D0\u76EE\u6807 level=excellent\uFF0C\u4E0D\u8981\u50AC\u4FC3\u8D76\u5DE5\uFF0C\u5E94\u7ED9\u300C\u4FDD\u6301\u8282\u594F / \u9002\u5EA6\u589E\u8D1F\u8377\u300D\u7C7B\u5EFA\u8BAE\u3002",
    "",
    "\u8BF7\u57FA\u4E8E\u4E0A\u8FF0\u6A21\u578B + \u6BCF\u76EE\u6807\u771F\u5B9E\u5B50\u9879\u8BC1\u636E\u505A\u56E0\u679C\u5F52\u56E0\uFF0C\u5E76\u7ED9\u51FA\u53EF\u64CD\u4F5C\u5EFA\u8BAE\u3002",
    "\u4E25\u683C\u8981\u6C42\uFF1A",
    "- \u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981 markdown \u56F4\u680F\u3001\u4E0D\u8981\u4EFB\u4F55\u989D\u5916\u89E3\u91CA\u6587\u5B57\u3002",
    '- JSON \u7ED3\u6784\uFF1A{ "summary": string, "goals": [ { "title": string, "completion": number(0-100), "healthScore": number(0-100), "level": "excellent"|"good"|"warning"|"risk", "L1": number, "L2": number, "L3": number, "weakest": "L1"|"L2"|"L3", "status": "on_track"|"behind"|"stuck"|"done"|"at_risk", "bottleneck": string, "evidenceRef": string, "suggestions": [ { "id": string, "action": "adjust_dailyMin"|"remove_subitem"|"add_subitem"|"note", "goalRef": {"goalId": string, "goalTitle": string}, "target": {"subItemName": string, "subItemIndex": number}, "params": {"dailyMin": number, "name": string, "taskDayType": string}, "text": string, "dimension": "L1"|"L2"|"L3" } ] } ], "nextActions": string[] }',
    "- healthScore/level/L1/L2/L3/weakest \u5FC5\u987B\u4E0E\u7ED9\u5B9A\u300C\u5065\u5EB7\u5206\u4E09\u7EF4\u6458\u8981\u300D\u4FDD\u6301\u4E00\u81F4\uFF08\u76F4\u63A5\u91C7\u7528\u6458\u8981\u4E2D\u7684\u6570\u503C\u4E0E\u6700\u5F31\u7EF4\u5EA6\uFF0C\u4E0D\u8981\u81EA\u884C\u53E6\u7B97\uFF09\u3002",
    "- level \u53D6\u81EA excellent/good/warning/risk\uFF1Bweakest \u53D6\u81EA L1/L2/L3\uFF1Bstatus \u53D6\u81EA\u7ED9\u5B9A\u679A\u4E3E\u3002",
    "- bottleneck \u4E0E suggestions \u5FC5\u987B\u56F4\u7ED5 weakest \u7EF4\u5EA6\u5C55\u5F00\uFF1AL1\u2192\u5C65\u7EA6/\u8282\u594F\u3001L2\u2192\u91CD\u65B0\u6FC0\u6D3B\u52A8\u529B\uFF08\u5982\u5148\u5B8C\u6210\u4E00\u4E2A\u7B80\u5355\u5B50\u9879\uFF09\u3001L3\u2192\u505C\u6EDE\u6216\u5747\u8861\uFF08\u5173\u6CE8\u8FB9\u7F18\u5B50\u9879\uFF09\u3002",
    "- \u300C\u771F\u5B9E\u5B50\u9879\u6E05\u5355\u300D\u662F\u4F60\u552F\u4E00\u5141\u8BB8\u5F15\u7528\u7684\u5B50\u9879\u6765\u6E90\u3002suggestions \u5FC5\u987B\u662F**\u7ED3\u6784\u5316\u5BF9\u8C61**\uFF0C\u80FD\u7CBE\u51C6\u547D\u4E2D\u5177\u4F53\u5B50\u9879\uFF0C\u800C\u4E0D\u662F\u81EA\u7136\u8BED\u8A00\u53E5\u5B50\uFF1A",
    "  \xB7 action \u53D6\u679A\u4E3E\uFF1Aadjust_dailyMin\uFF08\u8C03\u67D0\u5B50\u9879\u6BCF\u65E5\u91CF\uFF09/ remove_subitem\uFF08\u5220\u67D0\u5B50\u9879\uFF09/ add_subitem\uFF08\u65B0\u589E\u5B50\u9879\uFF09/ note\uFF08\u4EC5\u6587\u6848\u65E0\u6539\u52A8\uFF09\u3002",
    "  \xB7 goalRef.goalId \u5FC5\u987B\u586B\u6E05\u5355\u91CC\u8BE5\u76EE\u6807\u7684 goalId\uFF08\u6E05\u5355\u76EE\u6807\u884C\u5DF2\u6807\u6CE8\uFF09\uFF1BgoalRef.goalTitle \u586B\u76EE\u6807\u540D\u3002",
    "  \xB7 target.subItemName \u5FC5\u987B\u662F\u6E05\u5355\u91CC**\u771F\u5B9E\u5B58\u5728\u7684\u5B50\u9879\u540D\uFF08\u7CBE\u786E\u4E00\u81F4\uFF09**\uFF1B\u4E5F\u53EF\u586B target.subItemIndex\uFF08\u6E05\u5355\u5B50\u9879\u884C\u5DF2\u6807\u6CE8 [\u4E0B\u6807]\uFF09\u3002",
    "  \xB7 adjust_dailyMin \u65F6\uFF0Cparams.dailyMin \u5FC5\u987B\u7ED9**\u5177\u4F53\u6570\u5B57**\uFF08\u5982\u628A 30 \u964D\u5230 15 \u5C31\u5199 15\uFF09\uFF0C\u4E0D\u8981\u5199\u76F8\u5BF9\u63CF\u8FF0\u3002",
    "  \xB7 add_subitem \u4EC5\u5728\u786E\u9700\u65B0\u589E\u65F6\u7528\uFF0Cparams.name \u7ED9\u5B50\u9879\u540D\u3001params.dailyMin \u7ED9\u5177\u4F53\u6570\u5B57\u3001params.taskDayType \u7ED9 daily/weekly/monthly\u3002",
    "  \xB7 remove_subitem \u65F6 target \u6307\u5411\u8981\u5220\u7684\u5B50\u9879\u540D\u3002",
    "  \xB7 text \u7528\u4E00\u53E5\u4E2D\u6587\u8BF4\u660E\u8FD9\u6761\u5EFA\u8BAE\uFF08\u7ED9\u4EBA\u770B\uFF09\uFF0Cdimension \u6807\u5B83\u805A\u7126\u7684\u7EF4\u5EA6\uFF08L1/L2/L3\uFF09\u3002",
    "- \u4E25\u7981\u7F16\u9020\u6E05\u5355\u5916\u7684\u5B50\u9879\uFF08\u4F8B\u5982\u865A\u6784\u300C\u6BCF\u65E5\u7814\u53D1\u5B57\u91CF\u300D\u7B49\uFF09\uFF1Badd_subitem \u4E5F\u53EA\u5141\u8BB8\u4F60\u5224\u65AD\u786E\u6709\u5FC5\u8981\u3001\u4E14 name \u660E\u786E\u3002",
    '- evidenceRef \u5FC5\u987B\u662F\u8BE5\u76EE\u6807\u6E05\u5355\u91CC\u771F\u5B9E\u5B58\u5728\u7684\u67D0\u4E2A\u5B50\u9879\u540D\uFF08\u82E5\u74F6\u9888\u662F\u76EE\u6807\u7EA7\u800C\u975E\u5177\u4F53\u5B50\u9879\uFF0C\u586B\u7A7A\u5B57\u7B26\u4E32 ""\uFF09\u3002',
    "- \u8FD9\u4E9B\u5EFA\u8BAE\u4F1A\u88AB**\u786E\u5B9A\u6027\u7A0B\u5E8F**\u6309 goalRef/target/params \u76F4\u63A5\u6539\u76EE\u6807\u6811\uFF08\u4E0D\u518D\u7ECF AI \u91CD\u65B0\u7406\u89E3\uFF09\uFF0C\u6240\u4EE5\u52A1\u5FC5\u4FDD\u8BC1\u5B50\u9879\u540D/\u4E0B\u6807\u4E0E\u6E05\u5355\u5B8C\u5168\u4E00\u81F4\u3001dailyMin \u7ED9\u5177\u4F53\u6570\u5B57\u3002"
  ].join("\n");
  const user = `\u5404\u76EE\u6807\u300C\u5065\u5EB7\u5206\u4E09\u7EF4\u6458\u8981\u300D\u5982\u4E0B\uFF08\u8BCA\u65AD\u4E3B\u4F9D\u636E\uFF0C\u8BF7\u636E\u6B64\u5224\u5B9A level / weakest / L1L2L3\uFF09\uFF1A
${healthBlock}

\u5404\u76EE\u6807\u6267\u884C\u504F\u5DEE\u786C\u6307\u6807\u5982\u4E0B\uFF08\u8F85\u52A9\u53C2\u8003\uFF09\uFF1A
${summary}

\u5404\u76EE\u6807\u771F\u5B9E\u5B50\u9879\u4E0E\u5B8C\u6210\u8BC1\u636E\u5982\u4E0B\uFF08\u4EC5\u4F9B\u5F52\u56E0\u53C2\u8003\uFF0C\u7981\u6B62\u7F16\u9020\u6E05\u5355\u5916\u7684\u5B50\u9879\uFF09\uFF1A
${contextBlock}

\u8BF7\u636E\u6B64\u8BCA\u65AD\u5E76\u7ED9\u51FA\u53EF\u5E94\u7528\u5EFA\u8BAE\u3002`;
  return [
    { role: "system", content: system },
    { role: "user", content: user }
  ];
}
async function callAi(messages, settings, fetchFn) {
  const url = `${settings.aiBaseUrl.replace(/\/+$/, "")}/chat/completions`;
  return fetchFn({
    url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.aiApiKey}`
    },
    body: JSON.stringify({
      model: settings.aiModel,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.3
    })
  });
}
async function diagnose(goals, days, settings, fetchFn = import_obsidian11.requestUrl, today = /* @__PURE__ */ new Date()) {
  const cache = buildCache(goals, days);
  const summary = summarize2(goals, cache, today);
  const context = formatItemEvidenceForPrompt(goals, cache, today);
  const healthSummary = buildHealthSummary(goals, cache, today);
  const messages = buildDiagnosisMessages(summary, context, healthSummary);
  try {
    const resp = await callAi(messages, settings, fetchFn);
    const text = extractChatText(resp);
    return parseDiagnosis(text);
  } catch (e) {
    return { ok: false, rawText: e instanceof Error ? e.message : "AI \u8BCA\u65AD\u8C03\u7528\u5931\u8D25" };
  }
}

// src/ai/Suggestion.ts
function clone(goals) {
  return JSON.parse(JSON.stringify(goals));
}
function findGoal(goals, s) {
  return goals.find(
    (g) => s.goalRef.goalId != null && g.id === s.goalRef.goalId || g.title === s.goalRef.goalTitle
  );
}
function findItemIndex(items, t) {
  if (!t) return -1;
  if (t.subItemName != null) {
    const i = items.findIndex((it) => it.name === t.subItemName);
    if (i >= 0) return i;
  }
  if (t.subItemIndex != null && t.subItemIndex >= 0 && t.subItemIndex < items.length) {
    return t.subItemIndex;
  }
  return -1;
}
function applySuggestion(s, goals) {
  const goal = findGoal(goals, s);
  if (!goal) {
    return { goals, applied: false, message: "\u672A\u627E\u5230\u76EE\u6807" };
  }
  const working = clone(goals);
  const g = working.find(
    (x) => s.goalRef.goalId != null && x.id === s.goalRef.goalId || x.title === s.goalRef.goalTitle
  );
  switch (s.action) {
    case "adjust_dailyMin": {
      const items = g.items ?? [];
      const idx = findItemIndex(items, s.target);
      const v = s.params?.dailyMin;
      if (idx < 0 || typeof v !== "number" || !Number.isFinite(v) || v < 0) {
        return { goals, applied: false, message: "\u5B50\u9879\u672A\u547D\u4E2D\u6216 dailyMin \u975E\u6CD5" };
      }
      g.items = items.slice();
      g.items[idx] = { ...items[idx], dailyMin: String(Math.max(0, Math.round(v))) };
      return { goals: working, applied: true };
    }
    case "remove_subitem": {
      const items = g.items ?? [];
      const idx = findItemIndex(items, s.target);
      if (idx < 0) {
        return { goals, applied: false, message: "\u5B50\u9879\u672A\u547D\u4E2D" };
      }
      g.items = items.filter((_, i) => i !== idx);
      return { goals: working, applied: true };
    }
    case "add_subitem": {
      const name = s.params?.name;
      if (!name) {
        return { goals, applied: false, message: "\u65B0\u589E\u5B50\u9879\u7F3A name" };
      }
      const items = g.items ?? [];
      if (items.some((it) => it.name === name)) {
        return { goals, applied: false, message: "\u5B50\u9879\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7\u65B0\u589E" };
      }
      const add = { name };
      if (typeof s.params?.dailyMin === "number" && Number.isFinite(s.params.dailyMin)) {
        add.dailyMin = String(Math.max(0, Math.round(s.params.dailyMin)));
      }
      if (s.params?.taskDayType != null) add.taskDayType = s.params.taskDayType;
      if (s.params?.detail != null) add.detail = s.params.detail;
      g.items = [...items, add];
      return { goals: working, applied: true };
    }
    case "note":
    default:
      return { goals, applied: false };
  }
}
function applySuggestions(list, goals) {
  let current = goals;
  let appliedAny = false;
  for (const s of list) {
    const r = applySuggestion(s, current);
    if (r.applied) {
      appliedAny = true;
      current = r.goals;
    }
  }
  return { goals: current, applied: appliedAny };
}

// src/ai/runDiagnosis.ts
var DIAGNOSIS_PHASE_LABEL = {
  collect: "\u6536\u96C6\u76EE\u6807\u4E0E\u6267\u884C\u8BB0\u5F55",
  analyze: "\u8BA1\u7B97\u4E09\u7EF4\u5065\u5EB7\u5206\u4E0E\u504F\u5DEE",
  ai: "\u8C03\u7528 AI \u8BCA\u65AD\u4E2D\u2026",
  render: "\u89E3\u6790\u8BCA\u65AD\u7ED3\u679C",
  done: "\u5B8C\u6210"
};
async function runDiagnosis(deps) {
  const emit = (p) => deps.onPhase?.(p, DIAGNOSIS_PHASE_LABEL[p]);
  if (!deps.aiEnabled) {
    deps.notice("AI \u8BCA\u65AD\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
    return;
  }
  emit("collect");
  const all = await deps.storage.getGoals();
  if (all.length === 0) {
    deps.notice("\u4F60\u8FD8\u6CA1\u6709\u76EE\u6807\uFF0C\u5148\u8DD1\u4E00\u6B21 AI \u89C4\u5212");
    return;
  }
  const goals = all.filter((g) => !g.archived);
  if (goals.length === 0) {
    deps.notice("\u5F53\u524D\u6CA1\u6709\u8FDB\u884C\u4E2D\u7684\u76EE\u6807\uFF08\u5DF2\u5F52\u6863\u76EE\u6807\u4E0D\u53C2\u4E0E\u8BCA\u65AD\uFF09");
    return;
  }
  const windowDays = Math.max(deps.recentDays ?? 14, TUNING.STAGNATION_WINDOW);
  const keys = (await deps.storage.getDayKeys()).slice(0, windowDays);
  const days = [];
  for (const k of keys) {
    const d = await deps.storage.getDay(k);
    if (d) days.push(d);
  }
  emit("analyze");
  const cache = buildCache(goals, days);
  const itemEvidence = buildItemEvidenceMap(goals, cache);
  emit("ai");
  const result = await deps.diagnose(goals, days, deps.plannerSettings);
  emit("render");
  deps.openDiagnosis({
    diagnosis: result,
    itemEvidence,
    onApply: (goal, suggestion) => {
      const res = applySuggestion(suggestion, goals);
      if (!res.applied) {
        deps.notice("\u8BE5\u5EFA\u8BAE\u672A\u5339\u914D\u5230\u76EE\u6807/\u5B50\u9879\uFF0C\u672A\u6539\u52A8");
        return;
      }
      deps.openApplyPreview({
        suggestions: [suggestion],
        before: goals,
        after: res.goals,
        onConfirm: (final) => void deps.writeGoals(final),
        onEscalateAI: (final) => deps.openAgentic({
          content: "",
          scope: "note",
          settings: deps.plannerSettings,
          goals: final,
          onConfirm: (f) => void deps.writeGoals(f)
        }),
        title: `\u5E94\u7528\u5EFA\u8BAE \xB7 ${goal.title}`
      });
    },
    onApplyAll: (goal) => {
      const res = applySuggestions(goal.suggestions, goals);
      if (!res.applied) {
        deps.notice("\u8BE5\u76EE\u6807\u5EFA\u8BAE\u672A\u5339\u914D\u5230\u76EE\u6807/\u5B50\u9879\uFF0C\u672A\u6539\u52A8");
        return;
      }
      deps.openApplyPreview({
        suggestions: goal.suggestions,
        before: goals,
        after: res.goals,
        onConfirm: (final) => void deps.writeGoals(final),
        onEscalateAI: (final) => deps.openAgentic({
          content: "",
          scope: "note",
          settings: deps.plannerSettings,
          goals: final,
          onConfirm: (f) => void deps.writeGoals(f)
        }),
        title: `\u5E94\u7528\u5EFA\u8BAE \xB7 ${goal.title}`
      });
    },
    onApplyAllDiagnosis: () => {
      if (!result.ok) return;
      const all2 = result.goals.flatMap((g) => g.suggestions ?? []);
      if (all2.length === 0) return;
      const res = applySuggestions(all2, goals);
      if (!res.applied) {
        deps.notice("\u6240\u6709\u5EFA\u8BAE\u5747\u672A\u5339\u914D\u5230\u76EE\u6807/\u5B50\u9879\uFF0C\u672A\u6539\u52A8");
        return;
      }
      deps.openApplyPreview({
        suggestions: all2,
        before: goals,
        after: res.goals,
        onConfirm: (final) => void deps.writeGoals(final),
        onEscalateAI: (final) => deps.openAgentic({
          content: "",
          scope: "note",
          settings: deps.plannerSettings,
          goals: final,
          onConfirm: (f) => void deps.writeGoals(f)
        }),
        title: "\u4E00\u952E\u5E94\u7528\u5168\u90E8\u5EFA\u8BAE"
      });
    }
  });
}

// src/ai/DiagnosisProgressModal.ts
var import_obsidian12 = require("obsidian");
var PHASE_ORDER = ["collect", "analyze", "ai", "render"];
var DiagnosisProgressModal = class extends import_obsidian12.Modal {
  constructor(app) {
    super(app);
    this.current = null;
    this.labels = {};
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: "AI \u8BCA\u65AD\u8FDB\u884C\u4E2D",
      cls: "bamboo-progress-title"
    });
    contentEl.createEl("p", {
      text: "\u6B63\u5728\u590D\u76D8\u4F60\u7684\u76EE\u6807\u6267\u884C\u60C5\u51B5\uFF0C\u8BF7\u7A0D\u5019",
      cls: "bamboo-progress-sub"
    });
    this.stepsEl = contentEl.createDiv({ cls: "bamboo-progress-steps" });
    this.current = null;
    this.renderSteps();
  }
  /** 由 runDiagnosis 在各编排边界调用，驱动步骤状态机 */
  setPhase(phase, label) {
    if (label) this.labels[phase] = label;
    this.current = phase;
    this.renderSteps();
  }
  renderSteps() {
    const stepsEl = this.stepsEl;
    if (!stepsEl) return;
    stepsEl.empty();
    const idx = this.current ? PHASE_ORDER.indexOf(this.current) : -1;
    PHASE_ORDER.forEach((p, i) => {
      const state = this.current == null ? "is-pending" : i < idx ? "is-done" : i === idx ? "is-current" : "is-pending";
      const step = stepsEl.createDiv({ cls: `bamboo-progress-step ${state}` });
      step.dataset["phase"] = p;
      step.createDiv({ cls: "bamboo-progress-dot" });
      step.createDiv({
        cls: "bamboo-progress-label",
        text: this.labels[p] ?? DIAGNOSIS_PHASE_LABEL[p]
      });
    });
  }
};

// main.ts
function hashContent(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) + h + s.charCodeAt(i) >>> 0;
  }
  return h.toString(36);
}
var BambooReviewPlugin = class extends import_obsidian13.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    const pluginDir = this.manifest.dir || "";
    const version = this.manifest.version || "";
    void AppHost.prefetch(this.app, pluginDir, version);
    this.registerView(VIEW_TYPE_DAILY_REVIEW, (leaf) => {
      return new DailyReviewView(leaf, pluginDir, this, this.settings, () => this.saveSettings());
    });
    this.webapp = new WebappController(() => {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
      if (leaves.length === 0) return null;
      return leaves[0].view;
    });
    this.addCommand({
      id: "open-daily-review",
      name: "\u6253\u5F00\u4ECA\u65E5\u590D\u76D8",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "navigate-prev-day",
      name: "\u524D\u4E00\u5929",
      callback: () => this.webapp.navPrevDay()
    });
    this.addCommand({
      id: "navigate-next-day",
      name: "\u540E\u4E00\u5929",
      callback: () => this.webapp.navNextDay()
    });
    this.addCommand({
      id: "navigate-today",
      name: "\u56DE\u5230\u4ECA\u5929",
      callback: () => this.webapp.navToday()
    });
    this.addCommand({
      id: "open-stats",
      name: "\u6253\u5F00\u7EDF\u8BA1\u5206\u6790",
      callback: () => this.webapp.openStats()
    });
    this.addCommand({
      id: "open-settings-in-app",
      name: "\u6253\u5F00\u5E94\u7528\u8BBE\u7F6E",
      callback: () => this.webapp.openSettings()
    });
    this.addCommand({
      id: "ai-plan-from-note",
      name: "AI \u89C4\u5212\uFF1A\u5C06\u5F53\u524D\u7B14\u8BB0\u8F6C\u4E3A\u76EE\u6807\u5361\u7247",
      callback: () => void this.aiPlanFromNote()
    });
    this.addCommand({
      id: "ai-plan-from-selection",
      name: "AI \u89C4\u5212\uFF1A\u5C06\u9009\u4E2D\u6587\u672C\u8F6C\u4E3A\u76EE\u6807\u5361\u7247",
      callback: () => void this.aiPlanFromSelection()
    });
    this.addCommand({
      id: "ai-rebuild-goals",
      name: "AI \u89C4\u5212\uFF1A\u6279\u91CF\u91CD\u5EFA\u5DF2\u89C4\u5212\u7B14\u8BB0\u7684\u76EE\u6807",
      callback: () => void this.rebuildAiGoals()
    });
    this.addCommand({
      id: "ai-diagnose",
      name: "AI \u8BCA\u65AD\uFF1A\u5206\u6790\u76EE\u6807\u6267\u884C\u5E76\u7ED9\u51FA\u53EF\u5E94\u7528\u5EFA\u8BAE",
      callback: () => void this.aiDiagnose()
    });
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        const text = editor.getSelection().trim();
        if (!text) return;
        menu.addItem(
          (item) => item.setTitle("AI \u89C4\u5212\uFF1A\u5C06\u9009\u4E2D\u6587\u672C\u8F6C\u4E3A\u76EE\u6807\u5361\u7247").setIcon("leaf").onClick(() => {
            void this.aiPlanFromSelection(text);
          })
        );
      })
    );
    this.addSettingTab(new PluginSettings(this.app, this));
    this.addRibbonIcon("leaf", "\u7AF9\u6797\u4FEE\u4ED9\u4F20", () => {
      void this.activateView();
    });
  }
  onunload() {
    ThemeBridge.restoreDefaults();
  }
  /** AI 规划主流程：取当前笔记 → 调大模型 → 校验 → 审阅弹窗 → 写入目标库 */
  async aiPlanFromNote() {
    const s = this.settings;
    if (!s.aiEnabled) {
      new import_obsidian13.Notice("AI \u89C4\u5212\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
      return;
    }
    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof import_obsidian13.TFile) || file.extension !== "md") {
      new import_obsidian13.Notice("AI \u89C4\u5212\uFF1A\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7 Markdown \u7B14\u8BB0");
      return;
    }
    let content = "";
    try {
      content = await this.app.vault.read(file);
    } catch (e) {
      new import_obsidian13.Notice(`\u8BFB\u53D6\u7B14\u8BB0\u5931\u8D25\uFF1A${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`);
      return;
    }
    if (!content.trim()) {
      new import_obsidian13.Notice("AI \u89C4\u5212\uFF1A\u7B14\u8BB0\u5185\u5BB9\u4E3A\u7A7A");
      return;
    }
    const plannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth
    };
    new AgenticPlanModal(this.app, {
      content,
      scope: "note",
      settings: plannerSettings,
      onConfirm: (finalGoals) => void this.writeAiGoals(file, content, finalGoals)
    }).open();
  }
  /** 选中文本转目标卡片：取编辑器选区 → 调大模型(标注 selection) → 校验 → 审阅弹窗 → 写入目标库 */
  async aiPlanFromSelection(selectionArg) {
    const s = this.settings;
    if (!s.aiEnabled) {
      new import_obsidian13.Notice("AI \u89C4\u5212\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
      return;
    }
    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof import_obsidian13.TFile) || file.extension !== "md") {
      new import_obsidian13.Notice("AI \u89C4\u5212\uFF1A\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7 Markdown \u7B14\u8BB0");
      return;
    }
    const selection = selectionArg && selectionArg.trim() || this.app.workspace.getActiveViewOfType(import_obsidian13.MarkdownView)?.editor.getSelection()?.trim() || "";
    if (!selection) {
      new import_obsidian13.Notice("\u8BF7\u5148\u9009\u4E2D\u4E00\u6BB5\u6587\u672C\uFF0C\u518D\u6267\u884C\u300C\u5C06\u9009\u4E2D\u6587\u672C\u8F6C\u4E3A\u76EE\u6807\u5361\u7247\u300D");
      return;
    }
    const plannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth
    };
    new AgenticPlanModal(this.app, {
      content: selection,
      scope: "selection",
      settings: plannerSettings,
      subtitle: "\u4EE5\u4E0B\u76EE\u6807\u57FA\u4E8E\u4F60\u5728\u7B14\u8BB0\u4E2D\u9009\u4E2D\u7684\u6587\u672C\u62C6\u89E3\uFF08\u975E\u6574\u7BC7\u7B14\u8BB0\uFF09\u3002",
      onConfirm: (finalGoals) => void this.writeAiGoals(file, selection, finalGoals)
    }).open();
  }
  /** 把审阅后的目标追加写入目标库（零污染：existing + parsed）并更新幂等索引 */
  /**
   * 把审阅后的目标追加写入目标库（零污染：existing + parsed）并更新幂等索引。
   * @param silent 批量重建时抑制逐条通知，由调用方统一汇总（默认 false）
   */
  async writeAiGoals(file, content, goals, silent = false) {
    const storage = new VaultStorage(this.app);
    const existing = await storage.getGoals();
    const index = await storage.getPlansIndex();
    const key = `${file.path}#${hashContent(content)}`;
    const plannedIds = index[key];
    if (!silent && shouldSkipPlanned(plannedIds, new Set(existing.map((g) => g.id)))) {
      new import_obsidian13.Notice("\u8BE5\u7B14\u8BB0\u5DF2\u89C4\u5212\u8FC7\uFF08\u5185\u5BB9\u672A\u53D8\uFF09\uFF0C\u5DF2\u8DF3\u8FC7\u91CD\u590D\u5199\u5165");
      return;
    }
    const byRefTitle = /* @__PURE__ */ new Map();
    for (const g of existing) {
      if (g.sourceRef && g.title) byRefTitle.set(`${g.sourceRef}#${g.title}`, g.id);
    }
    const merged = /* @__PURE__ */ new Map();
    for (const g of existing) if (g.id) merged.set(g.id, g);
    const withRef = goals.map((g) => {
      const { icon: _icon, ...rest } = g;
      const ref = { ...rest, sourceRef: file.path };
      const legacyId = byRefTitle.get(`${file.path}#${g.title}`);
      ref.id = legacyId ?? deriveStableGoalId(`${file.path}|${g.title}`);
      return ref;
    });
    for (const g of withRef) if (g.id) merged.set(g.id, g);
    const finalGoals = [...merged.values()];
    await storage.putGoals(finalGoals);
    const finalIds = new Set(finalGoals.map((g) => g.id));
    for (const k of Object.keys(index)) {
      const ids = index[k];
      if (ids && ids.length > 0 && ids.every((id) => !finalIds.has(id))) {
        delete index[k];
      }
    }
    index[key] = withRef.map((g) => g.id);
    await storage.putPlansIndex(index);
    this.webapp.notifyGoalsChanged();
    if (!silent) {
      new import_obsidian13.Notice(`\u5DF2\u5199\u5165 ${withRef.length} \u4E2A\u76EE\u6807\u5230\u300C\u7AF9\u6797\u4FEE\u4ED9\u4F20\u300D`);
    }
  }
  /**
   * 批量重建 AI 目标：扫描 plans-map 中「已规划过」的笔记，逐篇重新规划，
   * 以找回那些目标已丢失/被清的历史遗留。笔记已删除则跳过（其 stale entry 由索引清理处理）。
   */
  async rebuildAiGoals() {
    const storage = new VaultStorage(this.app);
    const index = await storage.getPlansIndex();
    const paths = /* @__PURE__ */ new Set();
    for (const k of Object.keys(index)) {
      const hashIdx = k.lastIndexOf("#");
      if (hashIdx > 0) paths.add(k.slice(0, hashIdx));
    }
    if (paths.size === 0) {
      new import_obsidian13.Notice("\u672A\u53D1\u73B0\u4EFB\u4F55\u5DF2\u89C4\u5212\u7684\u7B14\u8BB0");
      return;
    }
    const s = this.settings;
    if (!s.aiEnabled) {
      new import_obsidian13.Notice("AI \u89C4\u5212\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
      return;
    }
    const plannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth
    };
    const loading = new import_obsidian13.Notice(`\u6B63\u5728\u91CD\u5EFA ${paths.size} \u7BC7\u7B14\u8BB0\u7684 AI \u76EE\u6807\u2026`, 0);
    let ok = 0;
    let failed = 0;
    for (const p of paths) {
      const file = this.app.vault.getAbstractFileByPath(p);
      if (!(file instanceof import_obsidian13.TFile)) continue;
      let content;
      try {
        content = await this.app.vault.read(file);
      } catch {
        continue;
      }
      if (!content.trim()) continue;
      try {
        const raw = await planFromNote(content, plannerSettings);
        const parsed = validateGoals(raw);
        if (parsed.length > 0) {
          await this.writeAiGoals(file, content, parsed, true);
          ok++;
        }
      } catch {
        failed++;
      }
    }
    loading.hide();
    new import_obsidian13.Notice(`\u5DF2\u91CD\u5EFA ${ok} \u7BC7\u7B14\u8BB0\u7684 AI \u76EE\u6807${failed > 0 ? `\uFF0C${failed} \u7BC7\u5931\u8D25` : ""}`);
  }
  /**
   * AI 诊断 → 行动闭环：读目标 + 近 14 天数据 → AI 诊断（GoalDiagnoser）→
   * 只读报告（DiagnosisModal）→ 点「应用」→ 打开 AgenticPlanModal 预填建议指令 →
   * 确认后写回目标库。编排逻辑在 runDiagnosis（纯函数），此处只注入真实依赖。
   */
  async aiDiagnose() {
    const s = this.settings;
    const plannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth
    };
    const storage = new VaultStorage(this.app);
    const progress = new DiagnosisProgressModal(this.app);
    progress.open();
    await runDiagnosis({
      aiEnabled: s.aiEnabled,
      plannerSettings,
      storage,
      diagnose,
      onPhase: (p, l) => progress.setPhase(p, l),
      openDiagnosis: (o) => {
        progress.close();
        new DiagnosisModal(this.app, o).open();
      },
      openApplyPreview: (o) => new SuggestionApplyModal(this.app, o).open(),
      openAgentic: (o) => new AgenticPlanModal(this.app, o).open(),
      writeGoals: (g) => void this.writeDiagnosedGoals(g),
      notice: (m) => new import_obsidian13.Notice(m),
      recentDays: 14
    });
    progress.close();
  }
  /** 诊断建议应用后的落库：写 goals.json + 刷新常驻视图（不碰幂等索引/ sourceRef） */
  async writeDiagnosedGoals(goals) {
    const storage = new VaultStorage(this.app);
    await storage.putGoals(goals);
    this.webapp.notifyGoalsChanged();
    new import_obsidian13.Notice(`\u5DF2\u5199\u5165 ${goals.length} \u4E2A\u76EE\u6807\uFF08\u5E94\u7528 AI \u8BCA\u65AD\u5EFA\u8BAE\uFF09`);
  }
  /**
   * 战略复盘面板「用 AI 改进」入口：webapp 健康分详情点按钮 → postMessage(app:aiImproveGoal)
   * → AppAPI.onAiImproveGoal → 此处。复用诊断闭环的 AgenticPlanModal 预填 + 落库链路。
   */
  async requestAiImprove(p) {
    const s = this.settings;
    if (!s.aiEnabled) {
      new import_obsidian13.Notice("\u5148\u5230\u8BBE\u7F6E\u91CC\u5F00\u542F AI \u89C4\u5212\uFF0C\u624D\u80FD\u7528 AI \u6539\u8FDB\u76EE\u6807");
      return;
    }
    const storage = new VaultStorage(this.app);
    const goals = await storage.getGoals();
    if (goals.length === 0) {
      new import_obsidian13.Notice("\u4F60\u8FD8\u6CA1\u6709\u76EE\u6807\uFF0C\u5148\u8DD1\u4E00\u6B21 AI \u89C4\u5212");
      return;
    }
    const goal = goals.find((g) => g.id === p.goalId) ?? goals.find((g) => g.title === p.title);
    if (!goal) {
      new import_obsidian13.Notice("\u672A\u5728\u76EE\u6807\u5E93\u4E2D\u627E\u5230\u8BE5\u76EE\u6807\uFF0C\u53EF\u80FD\u5B83\u5DF2\u88AB\u5220\u9664");
      return;
    }
    const plannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth
    };
    const hintsLine = p.hints ? p.hints : "\uFF08\u65E0\u5177\u4F53\u63D0\u793A\uFF0C\u8BF7\u7ED3\u5408\u8BE5\u76EE\u6807\u5F53\u524D\u5B50\u9879\u4E0E\u8FDB\u5EA6\u81EA\u884C\u8BCA\u65AD\u5E76\u6539\u8FDB\uFF09";
    const instruction = `\u8BF7\u6839\u636E\u4EE5\u4E0B\u5065\u5EB7\u5206\u8BCA\u65AD\uFF0C\u4F18\u5316\u76EE\u6807\u300C${goal.title}\u300D\uFF1A
${hintsLine}
\u8981\u6C42\uFF1A\u4FDD\u6301\u91CF\u5316\u94C1\u5F8B\uFF08\u7EAF\u6570\u5B57 dailyMin\u3001\u65E5\u9897\u7C92\u5EA6\u3001\u53EF\u6570\u4EE3\u7406\u6307\u6807\uFF09\uFF0C\u53EA\u505A\u5FC5\u8981\u7684\u589E\u5220\u6539\u3002`;
    new AgenticPlanModal(this.app, {
      content: "",
      scope: "note",
      goals,
      initialInstruction: instruction,
      settings: plannerSettings,
      subtitle: `AI \u6539\u8FDB \xB7 ${goal.title}`,
      onConfirm: (g) => void this.writeDiagnosedGoals(g)
    }).open();
  }
  /** 激活或创建复盘视图 */
  async activateView() {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_DAILY_REVIEW);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_DAILY_REVIEW,
        active: true
      });
    }
    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }
  /** 加载设置 */
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  /** 保存设置 */
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9ob3N0L0FwcEhvc3QudHMiLCAibm9kZV9tb2R1bGVzL2ZmbGF0ZS9lc20vYnJvd3Nlci5qcyIsICJzcmMvaG9zdC9BcHBBUEkudHMiLCAic3JjL3N0b3JhZ2UvVmF1bHRTdG9yYWdlLnRzIiwgInNyYy9zdG9yYWdlL0ltcG9ydFZhbGlkYXRvci50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL2hvc3QvcHJvdG9jb2wudHMiLCAic3JjL2hvc3QvV2ViYXBwQ29udHJvbGxlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiLCAic3JjL2FpL01hcmtkb3duUGxhbm5lci50cyIsICJzcmMvdHlwZXMvZGF0YS50cyIsICJzcmMvYWkvR29hbENhcmRWYWxpZGF0b3IudHMiLCAic3JjL2FpL2dvYWxJZC50cyIsICJzcmMvYWkvaWRlbXBvdGVuY3kudHMiLCAic3JjL2FpL0FnZW50aWNQbGFuTW9kYWwudHMiLCAic3JjL2FpL1BsYW5uaW5nU2Vzc2lvbi50cyIsICJzcmMvYWkvRGlhZ25vc2lzTW9kYWwudHMiLCAic3JjL2FpL1N1Z2dlc3Rpb25BcHBseU1vZGFsLnRzIiwgInNyYy9haS9Hb2FsRGlhZ25vc2VyLnRzIiwgInNyYy9haS9EZXZpYXRpb25DYWxjdWxhdG9yLnRzIiwgInNyYy9haS9oZWFsdGhTY29yZS50cyIsICJzcmMvYWkvU3VnZ2VzdGlvbi50cyIsICJzcmMvYWkvcnVuRGlhZ25vc2lzLnRzIiwgInNyYy9haS9EaWFnbm9zaXNQcm9ncmVzc01vZGFsLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBQbHVnaW4sIFdvcmtzcGFjZUxlYWYsIE5vdGljZSwgVEZpbGUsIE1hcmtkb3duVmlldyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IERhaWx5UmV2aWV3VmlldywgVklFV19UWVBFX0RBSUxZX1JFVklFVyB9IGZyb20gJy4vc3JjL3ZpZXdzL0RhaWx5UmV2aWV3Vmlldyc7XG5pbXBvcnQgeyBBcHBIb3N0IH0gZnJvbSAnLi9zcmMvaG9zdC9BcHBIb3N0JztcbmltcG9ydCB7IFdlYmFwcENvbnRyb2xsZXIgfSBmcm9tICcuL3NyYy9ob3N0L1dlYmFwcENvbnRyb2xsZXInO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuL3NyYy9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHtcbiAgUGx1Z2luU2V0dGluZ3MsXG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG59IGZyb20gJy4vc3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcbmltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4vc3JjL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IHBsYW5Gcm9tTm90ZSwgdHlwZSBQbGFubmVyU2V0dGluZ3MgfSBmcm9tICcuL3NyYy9haS9NYXJrZG93blBsYW5uZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVHb2FscyB9IGZyb20gJy4vc3JjL2FpL0dvYWxDYXJkVmFsaWRhdG9yJztcbmltcG9ydCB7IGRlcml2ZVN0YWJsZUdvYWxJZCB9IGZyb20gJy4vc3JjL2FpL2dvYWxJZCc7XG5pbXBvcnQgeyBzaG91bGRTa2lwUGxhbm5lZCB9IGZyb20gJy4vc3JjL2FpL2lkZW1wb3RlbmN5JztcbmltcG9ydCB7IEFnZW50aWNQbGFuTW9kYWwgfSBmcm9tICcuL3NyYy9haS9BZ2VudGljUGxhbk1vZGFsJztcbmltcG9ydCB7IERpYWdub3Npc01vZGFsIH0gZnJvbSAnLi9zcmMvYWkvRGlhZ25vc2lzTW9kYWwnO1xuaW1wb3J0IHsgU3VnZ2VzdGlvbkFwcGx5TW9kYWwgfSBmcm9tICcuL3NyYy9haS9TdWdnZXN0aW9uQXBwbHlNb2RhbCc7XG5pbXBvcnQgeyBkaWFnbm9zZSB9IGZyb20gJy4vc3JjL2FpL0dvYWxEaWFnbm9zZXInO1xuaW1wb3J0IHsgcnVuRGlhZ25vc2lzIH0gZnJvbSAnLi9zcmMvYWkvcnVuRGlhZ25vc2lzJztcbmltcG9ydCB7IERpYWdub3Npc1Byb2dyZXNzTW9kYWwgfSBmcm9tICcuL3NyYy9haS9EaWFnbm9zaXNQcm9ncmVzc01vZGFsJztcbmltcG9ydCB0eXBlIHsgR29hbEl0ZW0gfSBmcm9tICcuL3NyYy90eXBlcy9kYXRhJztcblxuLyoqIFx1NTE4NVx1NUJCOVx1NjMwN1x1N0VCOVx1RkYwOGRqYjJcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEUgQUkgXHU4OUM0XHU1MjEyXHU1RTQyXHU3QjQ5XHU1MjI0XHU5MUNEICovXG5mdW5jdGlvbiBoYXNoQ29udGVudChzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaCA9IDUzODE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgIGggPSAoKGggPDwgNSkgKyBoICsgcy5jaGFyQ29kZUF0KGkpKSA+Pj4gMDtcbiAgfVxuICByZXR1cm4gaC50b1N0cmluZygzNik7XG59XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW1ib29SZXZpZXdQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIHdlYmFwcCE6IFdlYmFwcENvbnRyb2xsZXI7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICBjb25zdCBwbHVnaW5EaXIgPSB0aGlzLm1hbmlmZXN0LmRpciB8fCAnJztcbiAgICBjb25zdCB2ZXJzaW9uID0gdGhpcy5tYW5pZmVzdC52ZXJzaW9uIHx8ICcnO1xuXG4gICAgLy8gXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2IHdlYmFwcFx1RkYxQVx1NjNEMlx1NEVGNlx1NTJBMFx1OEY3RFx1NTM3M1x1ODlFNlx1NTNEMVx1RkYwQ1x1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NTI0RFx1NTkyN1x1Njk4Mlx1NzM4N1x1NURGMlx1NUMzMVx1N0VFQVx1RkYwQ1x1NkQ4OFx1OTY2NFx1MzAwQ1x1NjI1M1x1NUYwMFx1N0E3QVx1NzY3RFx1MzAwRFx1NEY1M1x1NjExRlx1MzAwMlxuICAgIC8vIFx1NTkzMVx1OEQyNVx1NEUwRFx1OTYzQlx1NTg1RSBvbmxvYWRcdUZGMENcdTYyNTNcdTVGMDBcdTg5QzZcdTU2RkVcdTY1RjYgYnVpbGRCbG9iVXJsIFx1NEYxQVx1NTE4RFx1NkIyMVx1NUMxRFx1OEJENVx1MzAwMlxuICAgIHZvaWQgQXBwSG9zdC5wcmVmZXRjaCh0aGlzLmFwcCwgcGx1Z2luRGlyLCB2ZXJzaW9uKTtcblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XHVGRjA4XHU0RjIwXHU5MDEyIHBsdWdpbkRpciBcdTRGOUIgSXRlbVZpZXcgXHU1MkEwXHU4RjdEIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdUZGMDlcbiAgICB0aGlzLnJlZ2lzdGVyVmlldyhWSUVXX1RZUEVfREFJTFlfUkVWSUVXLCAobGVhZjogV29ya3NwYWNlTGVhZikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYWlseVJldmlld1ZpZXcobGVhZiwgcGx1Z2luRGlyLCB0aGlzLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NUJCRlx1NEUzQiBcdTIxOTIgd2ViYXBwIFx1NzZGNFx1OEZERVx1NjNBNVx1NTNFM1x1RkYwOFBoYXNlMyBcdTk1RThcdTk3NjJcdUZGMENcdTUxODVcdTkwRThcdTRFQ0RcdThENzAgc2VuZENvbW1hbmQgXHU3RUJGXHU1MzRGXHU4QkFFXHVGRjA5XG4gICAgdGhpcy53ZWJhcHAgPSBuZXcgV2ViYXBwQ29udHJvbGxlcigoKSA9PiB7XG4gICAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgICAgaWYgKGxlYXZlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIGxlYXZlc1swXS52aWV3IGFzIERhaWx5UmV2aWV3VmlldztcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZQcmV2RGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1uZXh0LWRheScsXG4gICAgICBuYW1lOiAnXHU1NDBFXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZOZXh0RGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS10b2RheScsXG4gICAgICBuYW1lOiAnXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZUb2RheSgpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5vcGVuU3RhdHMoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc2V0dGluZ3MtaW4tYXBwJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm9wZW5TZXR0aW5ncygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWktcGxhbi1mcm9tLW5vdGUnLFxuICAgICAgbmFtZTogJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1NUY1M1x1NTI0RFx1N0IxNFx1OEJCMFx1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0NycsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLmFpUGxhbkZyb21Ob3RlKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1wbGFuLWZyb20tc2VsZWN0aW9uJyxcbiAgICAgIG5hbWU6ICdBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTVDMDZcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDcnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHZvaWQgdGhpcy5haVBsYW5Gcm9tU2VsZWN0aW9uKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1yZWJ1aWxkLWdvYWxzJyxcbiAgICAgIG5hbWU6ICdBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkFcdTVERjJcdTg5QzRcdTUyMTJcdTdCMTRcdThCQjBcdTc2ODRcdTc2RUVcdTY4MDcnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHZvaWQgdGhpcy5yZWJ1aWxkQWlHb2FscygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWktZGlhZ25vc2UnLFxuICAgICAgbmFtZTogJ0FJIFx1OEJDQVx1NjVBRFx1RkYxQVx1NTIwNlx1Njc5MFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NUU3Nlx1N0VEOVx1NTFGQVx1NTNFRlx1NUU5NFx1NzUyOFx1NUVGQVx1OEJBRScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLmFpRGlhZ25vc2UoKSxcbiAgICB9KTtcblxuICAgIC8vIFx1N0YxNlx1OEY5MVx1NTY2OFx1NTNGM1x1OTUyRVx1ODNEQ1x1NTM1NVx1RkYxQVx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1NTQwRVx1NTNGM1x1OTUyRVx1NzZGNFx1NjNBNVx1NTFGQVx1NzNCMFx1MzAwQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1MzAwRFxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbignZWRpdG9yLW1lbnUnLCAobWVudSwgZWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCkudHJpbSgpO1xuICAgICAgICBpZiAoIXRleHQpIHJldHVybjsgLy8gXHU2NUUwXHU5MDA5XHU1MzNBXHU2NUY2XHU0RTBEXHU2NjNFXHU3OTNBXHVGRjBDXHU0RkREXHU2MzAxXHU4M0RDXHU1MzU1XHU1RTcyXHU1MUMwXG4gICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT5cbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAuc2V0VGl0bGUoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0NycpXG4gICAgICAgICAgICAuc2V0SWNvbignbGVhZicpXG4gICAgICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgIHZvaWQgdGhpcy5haVBsYW5Gcm9tU2VsZWN0aW9uKHRleHQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9udW5sb2FkKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICB9XG5cbiAgLyoqIEFJIFx1ODlDNFx1NTIxMlx1NEUzQlx1NkQ0MVx1N0EwQlx1RkYxQVx1NTNENlx1NUY1M1x1NTI0RFx1N0IxNFx1OEJCMCBcdTIxOTIgXHU4QzAzXHU1OTI3XHU2QTIxXHU1NzhCIFx1MjE5MiBcdTY4MjFcdTlBOEMgXHUyMTkyIFx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5NyBcdTIxOTIgXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3XHU1RTkzICovXG4gIGFzeW5jIGFpUGxhbkZyb21Ob3RlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHMgPSB0aGlzLnNldHRpbmdzO1xuICAgIGlmICghcy5haUVuYWJsZWQpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1NjcyQVx1NTQyRlx1NzUyOFx1RkYxQVx1OEJGN1x1NTE0OFx1NTcyOFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NEUyRFx1NUYwMFx1NTQyRlx1NUU3Nlx1NTg2Qlx1NTE5OSBBUEkgS2V5Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlIHx8ICEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU3QkM3IE1hcmtkb3duIFx1N0IxNFx1OEJCMCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjb250ZW50ID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoYFx1OEJGQlx1NTNENlx1N0IxNFx1OEJCMFx1NTkzMVx1OEQyNVx1RkYxQSR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRid9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghY29udGVudC50cmltKCkpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1N0IxNFx1OEJCMFx1NTE4NVx1NUJCOVx1NEUzQVx1N0E3QScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYW5uZXJTZXR0aW5nczogUGxhbm5lclNldHRpbmdzID0ge1xuICAgICAgYWlBcGlLZXk6IHMuYWlBcGlLZXksXG4gICAgICBhaUJhc2VVcmw6IHMuYWlCYXNlVXJsLFxuICAgICAgYWlNb2RlbDogcy5haU1vZGVsLFxuICAgICAgYWlEZWNvbXBvc2VEZXB0aDogcy5haURlY29tcG9zZURlcHRoLFxuICAgIH07XG5cbiAgICBuZXcgQWdlbnRpY1BsYW5Nb2RhbCh0aGlzLmFwcCwge1xuICAgICAgY29udGVudCxcbiAgICAgIHNjb3BlOiAnbm90ZScsXG4gICAgICBzZXR0aW5nczogcGxhbm5lclNldHRpbmdzLFxuICAgICAgb25Db25maXJtOiAoZmluYWxHb2FscykgPT4gdm9pZCB0aGlzLndyaXRlQWlHb2FscyhmaWxlLCBjb250ZW50LCBmaW5hbEdvYWxzKSxcbiAgICB9KS5vcGVuKCk7XG4gIH1cblxuICAvKiogXHU5MDA5XHU0RTJEXHU2NTg3XHU2NzJDXHU4RjZDXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHVGRjFBXHU1M0Q2XHU3RjE2XHU4RjkxXHU1NjY4XHU5MDA5XHU1MzNBIFx1MjE5MiBcdThDMDNcdTU5MjdcdTZBMjFcdTU3OEIoXHU2ODA3XHU2Q0U4IHNlbGVjdGlvbikgXHUyMTkyIFx1NjgyMVx1OUE4QyBcdTIxOTIgXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3IFx1MjE5MiBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTMgKi9cbiAgYXN5bmMgYWlQbGFuRnJvbVNlbGVjdGlvbihzZWxlY3Rpb25Bcmc/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzID0gdGhpcy5zZXR0aW5ncztcbiAgICBpZiAoIXMuYWlFbmFibGVkKSB7XG4gICAgICBuZXcgTm90aWNlKCdBSSBcdTg5QzRcdTUyMTJcdTY3MkFcdTU0MkZcdTc1MjhcdUZGMUFcdThCRjdcdTUxNDhcdTU3MjhcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTRFMkRcdTVGMDBcdTU0MkZcdTVFNzZcdTU4NkJcdTUxOTkgQVBJIEtleScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgIGlmICghZmlsZSB8fCAhKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkgfHwgZmlsZS5leHRlbnNpb24gIT09ICdtZCcpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1N0JDNyBNYXJrZG93biBcdTdCMTRcdThCQjAnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTRGMThcdTUxNDhcdTc1MjhcdTUzRjNcdTk1MkVcdTgzRENcdTUzNTVcdTRGMjBcdTUxNjVcdTc2ODRcdTdDQkVcdTc4NkVcdTkwMDlcdTUzM0FcdUZGMUJcdTU0N0RcdTRFRTRcdTk3NjJcdTY3N0ZcdThDMDNcdTc1MjhcdTY1RjZcdTRFMERcdTRGMjBcdUZGMENcdTUyMTlcdTU2REVcdTkwMDBcdTUyMzBcdTZEM0JcdTUyQThcdTdGMTZcdThGOTFcdTU2NjhcdTkwMDlcdTUzM0FcbiAgICBjb25zdCBzZWxlY3Rpb24gPVxuICAgICAgKHNlbGVjdGlvbkFyZyAmJiBzZWxlY3Rpb25BcmcudHJpbSgpKSB8fFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KT8uZWRpdG9yLmdldFNlbGVjdGlvbigpPy50cmltKCkgfHxcbiAgICAgICcnO1xuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdThCRjdcdTUxNDhcdTkwMDlcdTRFMkRcdTRFMDBcdTZCQjVcdTY1ODdcdTY3MkNcdUZGMENcdTUxOERcdTYyNjdcdTg4NENcdTMwMENcdTVDMDZcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTMwMEQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGFubmVyU2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyA9IHtcbiAgICAgIGFpQXBpS2V5OiBzLmFpQXBpS2V5LFxuICAgICAgYWlCYXNlVXJsOiBzLmFpQmFzZVVybCxcbiAgICAgIGFpTW9kZWw6IHMuYWlNb2RlbCxcbiAgICAgIGFpRGVjb21wb3NlRGVwdGg6IHMuYWlEZWNvbXBvc2VEZXB0aCxcbiAgICB9O1xuXG4gICAgbmV3IEFnZW50aWNQbGFuTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIGNvbnRlbnQ6IHNlbGVjdGlvbixcbiAgICAgIHNjb3BlOiAnc2VsZWN0aW9uJyxcbiAgICAgIHNldHRpbmdzOiBwbGFubmVyU2V0dGluZ3MsXG4gICAgICBzdWJ0aXRsZTogJ1x1NEVFNVx1NEUwQlx1NzZFRVx1NjgwN1x1NTdGQVx1NEU4RVx1NEY2MFx1NTcyOFx1N0IxNFx1OEJCMFx1NEUyRFx1OTAwOVx1NEUyRFx1NzY4NFx1NjU4N1x1NjcyQ1x1NjJDNlx1ODlFM1x1RkYwOFx1OTc1RVx1NjU3NFx1N0JDN1x1N0IxNFx1OEJCMFx1RkYwOVx1MzAwMicsXG4gICAgICBvbkNvbmZpcm06IChmaW5hbEdvYWxzKSA9PiB2b2lkIHRoaXMud3JpdGVBaUdvYWxzKGZpbGUsIHNlbGVjdGlvbiwgZmluYWxHb2FscyksXG4gICAgfSkub3BlbigpO1xuICB9XG5cbiAgLyoqIFx1NjI4QVx1NUJBMVx1OTYwNVx1NTQwRVx1NzY4NFx1NzZFRVx1NjgwN1x1OEZGRFx1NTJBMFx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1NUU5M1x1RkYwOFx1OTZGNlx1NkM2MVx1NjdEM1x1RkYxQWV4aXN0aW5nICsgcGFyc2VkXHVGRjA5XHU1RTc2XHU2NkY0XHU2NUIwXHU1RTQyXHU3QjQ5XHU3RDIyXHU1RjE1ICovXG4gIC8qKlxuICAgKiBcdTYyOEFcdTVCQTFcdTk2MDVcdTU0MEVcdTc2ODRcdTc2RUVcdTY4MDdcdThGRkRcdTUyQTBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTNcdUZGMDhcdTk2RjZcdTZDNjFcdTY3RDNcdUZGMUFleGlzdGluZyArIHBhcnNlZFx1RkYwOVx1NUU3Nlx1NjZGNFx1NjVCMFx1NUU0Mlx1N0I0OVx1N0QyMlx1NUYxNVx1MzAwMlxuICAgKiBAcGFyYW0gc2lsZW50IFx1NjI3OVx1OTFDRlx1OTFDRFx1NUVGQVx1NjVGNlx1NjI5MVx1NTIzNlx1OTAxMFx1Njc2MVx1OTAxQVx1NzdFNVx1RkYwQ1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1N0VERlx1NEUwMFx1NkM0N1x1NjAzQlx1RkYwOFx1OUVEOFx1OEJBNCBmYWxzZVx1RkYwOVxuICAgKi9cbiAgYXN5bmMgd3JpdGVBaUdvYWxzKFxuICAgIGZpbGU6IFRGaWxlLFxuICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICBnb2FsczogR29hbEl0ZW1bXSxcbiAgICBzaWxlbnQgPSBmYWxzZVxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTdFREZcdTRFMDBcdTUxOTlcdTUxNjUgd2ViYXBwIFx1NUI5RVx1OTY0NVx1OEJGQlx1NTNENlx1NzY4NFx1OUVEOFx1OEJBNFx1OERFRlx1NUY4NFx1RkYwOGJhbWJvby1yZXZpZXdcdUZGMDlcdUZGMENcdTc4NkVcdTRGREQgQUkgXHU1MTk5XHU1MTY1XHU3Njg0XHU3NkVFXHU2ODA3XHU0RTBFXHU3NTRDXHU5NzYyXHU4QkZCXHU1M0Q2XHU0RTAwXHU4MUY0XHUzMDAyXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgLy8gXHU1RTQyXHU3QjQ5XHVGRjFBXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwICsgXHU3NkY4XHU1NDBDXHU1MTg1XHU1QkI5XHU1REYyXHU4OUM0XHU1MjEyXHU4RkM3XHVGRjBDXHU0RTE0XHU3NkVFXHU2ODA3XHU0RUNEXHU1MTY4XHU5MEU4XHU1QjU4XHU1NzI4IFx1MjE5MiBcdThERjNcdThGQzdcdUZGMDhcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkFcdTZBMjFcdTVGMEZcdTVGM0FcdTUyMzZcdTkxQ0RcdTUxOTlcdUZGMDlcdTMwMDJcbiAgICAvLyBcdTUxNzNcdTk1MkVcdTRGRUVcdTU5MERcdUZGMUFcdTgyRTVcdTc2RUVcdTY4MDdcdTVERjJcdTg4QUJcdTZFMDVcdTdBN0EvXHU0RTIyXHU1OTMxXHVGRjA4cGxhbnMtbWFwIFx1NkI4Qlx1NzU1OVx1NjVFN1x1NTRDOFx1NUUwQ1x1RkYwOVx1RkYwQ1x1NTIxOVx1NUZDNVx1OTg3Qlx1NTE0MVx1OEJCOFx1OTFDRFx1NjVCMFx1NTE5OVx1NTE2NVx1NEVFNVx1NjA2Mlx1NTkwRFx1RkYwQ1xuICAgIC8vIFx1NTQyNlx1NTIxOVx1MjAxQ1x1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1MjAxRFx1NEYxQVx1NkMzOFx1NEU0NVx1OTYzQlx1NTg1RVx1NjA2Mlx1NTkwRFx1RkYwQ1x1ODg2OFx1NzNCMFx1NEUzQVx1MjAxQ1x1NTE5OVx1NTE2NVx1NEU4Nlx1NEY0Nlx1NEUwRFx1NjYzRVx1NzkzQS9cdTRFMjJcdTU5MzFcdTIwMURcdTMwMDJcbiAgICBjb25zdCBpbmRleCA9IGF3YWl0IHN0b3JhZ2UuZ2V0UGxhbnNJbmRleCgpO1xuICAgIGNvbnN0IGtleSA9IGAke2ZpbGUucGF0aH0jJHtoYXNoQ29udGVudChjb250ZW50KX1gO1xuICAgIGNvbnN0IHBsYW5uZWRJZHMgPSBpbmRleFtrZXldO1xuICAgIGlmICghc2lsZW50ICYmIHNob3VsZFNraXBQbGFubmVkKHBsYW5uZWRJZHMsIG5ldyBTZXQoZXhpc3RpbmcubWFwKChnKSA9PiBnLmlkKSkpKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdThCRTVcdTdCMTRcdThCQjBcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdUZGMDhcdTUxODVcdTVCQjlcdTY3MkFcdTUzRDhcdUZGMDlcdUZGMENcdTVERjJcdThERjNcdThGQzdcdTkxQ0RcdTU5MERcdTUxOTlcdTUxNjUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gXHU5MEU4XHU1MjA2L1x1NTE2OFx1OTBFOFx1NzZFRVx1NjgwN1x1NURGMlx1NEUyMlx1NTkzMSBcdTIxOTIgXHU3RUU3XHU3RUVEXHU1NDExXHU0RTBCXHU5MUNEXHU2NUIwXHU1MTk5XHU1MTY1XHU0RUU1XHU2MDYyXHU1OTBEXG5cbiAgICAvLyBcdTY1RTdcdTcyNDhcdTk2OEZcdTY3M0EgaWQgXHU1MTdDXHU1QkI5XHVGRjFBXHU1NDBDIHNvdXJjZVJlZit0aXRsZSBcdTU5MERcdTc1MjhcdTY1RTcgaWRcdUZGMENcdTUzOUZcdTU3MzBcdTY2RjRcdTY1QjBcdTRFMERcdTY1QjBcdTU4OUVcdTkxQ0RcdTU5MERcbiAgICBjb25zdCBieVJlZlRpdGxlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgZXhpc3RpbmcpIHtcbiAgICAgIGlmIChnLnNvdXJjZVJlZiAmJiBnLnRpdGxlKSBieVJlZlRpdGxlLnNldChgJHtnLnNvdXJjZVJlZn0jJHtnLnRpdGxlfWAsIGcuaWQpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXA8c3RyaW5nLCBHb2FsSXRlbT4oKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgZXhpc3RpbmcpIGlmIChnLmlkKSBtZXJnZWQuc2V0KGcuaWQsIGcpO1xuXG4gICAgLy8gXHU2NzAwXHU3RUM4XHU5NjMyXHU3RUJGXHVGRjFBQUkgXHU1MTk5XHU1MTY1XHU3Njg0XHU3NkVFXHU2ODA3XHU3OTgxXHU2QjYyXHU1MzA1XHU1NDJCIGljb24gXHU1QjU3XHU2QkI1XHVGRjA4XHU1MzczXHU0RjdGXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3XHU4QkVGXHU1ODZCXHU1MTY1XHU0RTVGXHU1MjY1XHU3OUJCXHVGRjA5XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNvbnN0IHdpdGhSZWYgPSBnb2Fscy5tYXAoKGcpID0+IHtcbiAgICAgIGNvbnN0IHsgaWNvbjogX2ljb24sIC4uLnJlc3QgfSA9IGcgYXMgR29hbEl0ZW0gJiB7IGljb24/OiB1bmtub3duIH07XG4gICAgICB2b2lkIF9pY29uO1xuICAgICAgY29uc3QgcmVmOiBHb2FsSXRlbSA9IHsgLi4ucmVzdCwgc291cmNlUmVmOiBmaWxlLnBhdGggfTtcbiAgICAgIC8vIFx1Nzg2RVx1NUI5QVx1NjAyNyBJRFx1RkYxQVx1NTQwQ1x1N0IxNFx1OEJCMCtcdTU0MENcdTY4MDdcdTk4OThcdTYwNTJcdTVGOTdcdTU0MENcdTRFMDAgaWQgXHUyMTkyIFx1OTFDRFx1NjVCMFx1ODlDNFx1NTIxMlx1NTM5Rlx1NTczMFx1NjZGNFx1NjVCMFx1ODAwQ1x1OTc1RVx1OEZGRFx1NTJBMFx1OTFDRFx1NTkwRFx1RkYxQlxuICAgICAgLy8gXHU4MkU1XHU4QkU1XHU2ODA3XHU5ODk4XHU3Njg0XHU2NUU3XHU5NjhGXHU2NzNBIGlkIFx1NEVDRFx1NUI1OFx1NTcyOFx1NEU4RVx1NUU5M1x1RkYwQ1x1NTIxOVx1NTkwRFx1NzUyOFx1NUI4M1x1RkYwOFx1NTE3Q1x1NUJCOVx1NTM4Nlx1NTNGMlx1NzZFRVx1NjgwN1x1RkYwOVx1MzAwMlxuICAgICAgY29uc3QgbGVnYWN5SWQgPSBieVJlZlRpdGxlLmdldChgJHtmaWxlLnBhdGh9IyR7Zy50aXRsZX1gKTtcbiAgICAgIHJlZi5pZCA9IGxlZ2FjeUlkID8/IGRlcml2ZVN0YWJsZUdvYWxJZChgJHtmaWxlLnBhdGh9fCR7Zy50aXRsZX1gKTtcbiAgICAgIHJldHVybiByZWY7XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCBnIG9mIHdpdGhSZWYpIGlmIChnLmlkKSBtZXJnZWQuc2V0KGcuaWQsIGcpO1xuICAgIGNvbnN0IGZpbmFsR29hbHMgPSBbLi4ubWVyZ2VkLnZhbHVlcygpXTtcbiAgICBhd2FpdCBzdG9yYWdlLnB1dEdvYWxzKGZpbmFsR29hbHMpO1xuXG4gICAgLy8gXHU1OTMxXHU2NTQ4XHU3RDIyXHU1RjE1XHU2RTA1XHU3NDA2XHVGRjA4Rlx1RkYwOVx1RkYxQVx1NTI1NFx1OTY2NFx1MjAxQ1x1NTE3Nlx1NTE2OFx1OTBFOCBpZCBcdTU3NDdcdTVERjJcdTRFMERcdTU3MjhcdTY3MDBcdTdFQzhcdTc2RUVcdTY4MDdcdTVFOTNcdTIwMURcdTc2ODRcdTk2NDhcdTY1RTcgZW50cnlcdUZGMENcdTkwN0ZcdTUxNERcdTdEMjJcdTVGMTVcdTY1RTBcdTk2NTBcdTU4OUVcdTk1N0ZcdTMwMDJcbiAgICBjb25zdCBmaW5hbElkcyA9IG5ldyBTZXQoZmluYWxHb2Fscy5tYXAoKGcpID0+IGcuaWQpKTtcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoaW5kZXgpKSB7XG4gICAgICBjb25zdCBpZHMgPSBpbmRleFtrXTtcbiAgICAgIGlmIChpZHMgJiYgaWRzLmxlbmd0aCA+IDAgJiYgaWRzLmV2ZXJ5KChpZCkgPT4gIWZpbmFsSWRzLmhhcyhpZCkpKSB7XG4gICAgICAgIGRlbGV0ZSBpbmRleFtrXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5kZXhba2V5XSA9IHdpdGhSZWYubWFwKChnKSA9PiBnLmlkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnB1dFBsYW5zSW5kZXgoaW5kZXgpO1xuXG4gICAgLy8gXHU1QzQwXHU5MEU4XHU1MjM3XHU2NUIwXHU1RTM4XHU5QTdCXHU4OUM2XHU1NkZFXHVGRjA4aG9zdFx1MjE5MndlYmFwcCBnb2FsczpjaGFuZ2VkXHVGRjA5XG4gICAgdGhpcy53ZWJhcHAubm90aWZ5R29hbHNDaGFuZ2VkKCk7XG5cbiAgICBpZiAoIXNpbGVudCkge1xuICAgICAgbmV3IE5vdGljZShgXHU1REYyXHU1MTk5XHU1MTY1ICR7d2l0aFJlZi5sZW5ndGh9IFx1NEUyQVx1NzZFRVx1NjgwN1x1NTIzMFx1MzAwQ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1MzAwRGApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkEgQUkgXHU3NkVFXHU2ODA3XHVGRjFBXHU2MjZCXHU2M0NGIHBsYW5zLW1hcCBcdTRFMkRcdTMwMENcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdTMwMERcdTc2ODRcdTdCMTRcdThCQjBcdUZGMENcdTkwMTBcdTdCQzdcdTkxQ0RcdTY1QjBcdTg5QzRcdTUyMTJcdUZGMENcbiAgICogXHU0RUU1XHU2MjdFXHU1NkRFXHU5MEEzXHU0RTlCXHU3NkVFXHU2ODA3XHU1REYyXHU0RTIyXHU1OTMxL1x1ODhBQlx1NkUwNVx1NzY4NFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1MzAwMlx1N0IxNFx1OEJCMFx1NURGMlx1NTIyMFx1OTY2NFx1NTIxOVx1OERGM1x1OEZDN1x1RkYwOFx1NTE3NiBzdGFsZSBlbnRyeSBcdTc1MzFcdTdEMjJcdTVGMTVcdTZFMDVcdTc0MDZcdTU5MDRcdTc0MDZcdUZGMDlcdTMwMDJcbiAgICovXG4gIGFzeW5jIHJlYnVpbGRBaUdvYWxzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBjb25zdCBpbmRleCA9IGF3YWl0IHN0b3JhZ2UuZ2V0UGxhbnNJbmRleCgpO1xuICAgIGNvbnN0IHBhdGhzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGluZGV4KSkge1xuICAgICAgY29uc3QgaGFzaElkeCA9IGsubGFzdEluZGV4T2YoJyMnKTtcbiAgICAgIGlmIChoYXNoSWR4ID4gMCkgcGF0aHMuYWRkKGsuc2xpY2UoMCwgaGFzaElkeCkpO1xuICAgIH1cbiAgICBpZiAocGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgbmV3IE5vdGljZSgnXHU2NzJBXHU1M0QxXHU3M0IwXHU0RUZCXHU0RjU1XHU1REYyXHU4OUM0XHU1MjEyXHU3Njg0XHU3QjE0XHU4QkIwJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgaWYgKCFzLmFpRW5hYmxlZCkge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHU2NzJBXHU1NDJGXHU3NTI4XHVGRjFBXHU4QkY3XHU1MTQ4XHU1NzI4XHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU0RTJEXHU1RjAwXHU1NDJGXHU1RTc2XHU1ODZCXHU1MTk5IEFQSSBLZXknKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcblxuICAgIGNvbnN0IGxvYWRpbmcgPSBuZXcgTm90aWNlKGBcdTZCNjNcdTU3MjhcdTkxQ0RcdTVFRkEgJHtwYXRocy5zaXplfSBcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODQgQUkgXHU3NkVFXHU2ODA3XHUyMDI2YCwgMCk7XG4gICAgbGV0IG9rID0gMDtcbiAgICBsZXQgZmFpbGVkID0gMDtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGF0aHMpIHtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocCk7XG4gICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSBjb250aW51ZTsgLy8gXHU3QjE0XHU4QkIwXHU1REYyXHU1MjIwXHU5NjY0IFx1MjE5MiBcdThERjNcdThGQzdcbiAgICAgIGxldCBjb250ZW50OiBzdHJpbmc7XG4gICAgICB0cnkge1xuICAgICAgICBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICghY29udGVudC50cmltKCkpIGNvbnRpbnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgcGxhbkZyb21Ob3RlKGNvbnRlbnQsIHBsYW5uZXJTZXR0aW5ncyk7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHZhbGlkYXRlR29hbHMocmF3KTtcbiAgICAgICAgaWYgKHBhcnNlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy53cml0ZUFpR29hbHMoZmlsZSwgY29udGVudCwgcGFyc2VkLCB0cnVlKTtcbiAgICAgICAgICBvaysrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgZmFpbGVkKys7XG4gICAgICB9XG4gICAgfVxuICAgIGxvYWRpbmcuaGlkZSgpO1xuICAgIG5ldyBOb3RpY2UoYFx1NURGMlx1OTFDRFx1NUVGQSAke29rfSBcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODQgQUkgXHU3NkVFXHU2ODA3JHtmYWlsZWQgPiAwID8gYFx1RkYwQyR7ZmFpbGVkfSBcdTdCQzdcdTU5MzFcdThEMjVgIDogJyd9YCk7XG4gIH1cblxuICAvKipcbiAgICogQUkgXHU4QkNBXHU2NUFEIFx1MjE5MiBcdTg4NENcdTUyQThcdTk1RURcdTczQUZcdUZGMUFcdThCRkJcdTc2RUVcdTY4MDcgKyBcdThGRDEgMTQgXHU1OTI5XHU2NTcwXHU2MzZFIFx1MjE5MiBBSSBcdThCQ0FcdTY1QURcdUZGMDhHb2FsRGlhZ25vc2VyXHVGRjA5XHUyMTkyXG4gICAqIFx1NTNFQVx1OEJGQlx1NjJBNVx1NTQ0QVx1RkYwOERpYWdub3Npc01vZGFsXHVGRjA5XHUyMTkyIFx1NzBCOVx1MzAwQ1x1NUU5NFx1NzUyOFx1MzAwRFx1MjE5MiBcdTYyNTNcdTVGMDAgQWdlbnRpY1BsYW5Nb2RhbCBcdTk4ODRcdTU4NkJcdTVFRkFcdThCQUVcdTYzMDdcdTRFRTQgXHUyMTkyXG4gICAqIFx1Nzg2RVx1OEJBNFx1NTQwRVx1NTE5OVx1NTZERVx1NzZFRVx1NjgwN1x1NUU5M1x1MzAwMlx1N0YxNlx1NjM5Mlx1OTAzQlx1OEY5MVx1NTcyOCBydW5EaWFnbm9zaXNcdUZGMDhcdTdFQUZcdTUxRkRcdTY1NzBcdUZGMDlcdUZGMENcdTZCNjRcdTU5MDRcdTUzRUFcdTZDRThcdTUxNjVcdTc3MUZcdTVCOUVcdTRGOURcdThENTZcdTMwMDJcbiAgICovXG4gIGFzeW5jIGFpRGlhZ25vc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBuZXcgRGlhZ25vc2lzUHJvZ3Jlc3NNb2RhbCh0aGlzLmFwcCk7XG4gICAgcHJvZ3Jlc3Mub3BlbigpO1xuICAgIGF3YWl0IHJ1bkRpYWdub3Npcyh7XG4gICAgICBhaUVuYWJsZWQ6IHMuYWlFbmFibGVkLFxuICAgICAgcGxhbm5lclNldHRpbmdzLFxuICAgICAgc3RvcmFnZSxcbiAgICAgIGRpYWdub3NlOiBkaWFnbm9zZSBhcyB1bmtub3duIGFzIHR5cGVvZiBkaWFnbm9zZSxcbiAgICAgIG9uUGhhc2U6IChwLCBsKSA9PiBwcm9ncmVzcy5zZXRQaGFzZShwLCBsKSxcbiAgICAgIG9wZW5EaWFnbm9zaXM6IChvKSA9PiB7XG4gICAgICAgIHByb2dyZXNzLmNsb3NlKCk7XG4gICAgICAgIG5ldyBEaWFnbm9zaXNNb2RhbCh0aGlzLmFwcCwgbykub3BlbigpO1xuICAgICAgfSxcbiAgICAgIG9wZW5BcHBseVByZXZpZXc6IChvKSA9PiBuZXcgU3VnZ2VzdGlvbkFwcGx5TW9kYWwodGhpcy5hcHAsIG8pLm9wZW4oKSxcbiAgICAgIG9wZW5BZ2VudGljOiAobykgPT4gbmV3IEFnZW50aWNQbGFuTW9kYWwodGhpcy5hcHAsIG8pLm9wZW4oKSxcbiAgICAgIHdyaXRlR29hbHM6IChnKSA9PiB2b2lkIHRoaXMud3JpdGVEaWFnbm9zZWRHb2FscyhnKSxcbiAgICAgIG5vdGljZTogKG0pID0+IG5ldyBOb3RpY2UobSksXG4gICAgICByZWNlbnREYXlzOiAxNCxcbiAgICB9KTtcbiAgICBwcm9ncmVzcy5jbG9zZSgpOyAvLyBcdTVCODlcdTUxNjhcdTUxNUNcdTVFOTVcdUZGMUFcdTYyQTVcdTU0NEFcdTVGMDJcdTVFMzhcdTY3MkFcdTYyNTNcdTVGMDBcdTY1RjZcdTRFNUZcdTUxNzNcdTk1RURcbiAgfVxuXG4gIC8qKiBcdThCQ0FcdTY1QURcdTVFRkFcdThCQUVcdTVFOTRcdTc1MjhcdTU0MEVcdTc2ODRcdTg0M0RcdTVFOTNcdUZGMUFcdTUxOTkgZ29hbHMuanNvbiArIFx1NTIzN1x1NjVCMFx1NUUzOFx1OUE3Qlx1ODlDNlx1NTZGRVx1RkYwOFx1NEUwRFx1NzhCMFx1NUU0Mlx1N0I0OVx1N0QyMlx1NUYxNS8gc291cmNlUmVmXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgd3JpdGVEaWFnbm9zZWRHb2Fscyhnb2FsczogR29hbEl0ZW1bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBhd2FpdCBzdG9yYWdlLnB1dEdvYWxzKGdvYWxzKTtcbiAgICB0aGlzLndlYmFwcC5ub3RpZnlHb2Fsc0NoYW5nZWQoKTtcbiAgICBuZXcgTm90aWNlKGBcdTVERjJcdTUxOTlcdTUxNjUgJHtnb2Fscy5sZW5ndGh9IFx1NEUyQVx1NzZFRVx1NjgwN1x1RkYwOFx1NUU5NFx1NzUyOCBBSSBcdThCQ0FcdTY1QURcdTVFRkFcdThCQUVcdUZGMDlgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTYyMThcdTc1NjVcdTU5MERcdTc2RDhcdTk3NjJcdTY3N0ZcdTMwMENcdTc1MjggQUkgXHU2NTM5XHU4RkRCXHUzMDBEXHU1MTY1XHU1M0UzXHVGRjFBd2ViYXBwIFx1NTA2NVx1NUVCN1x1NTIwNlx1OEJFNlx1NjBDNVx1NzBCOVx1NjMwOVx1OTRBRSBcdTIxOTIgcG9zdE1lc3NhZ2UoYXBwOmFpSW1wcm92ZUdvYWwpXG4gICAqIFx1MjE5MiBBcHBBUEkub25BaUltcHJvdmVHb2FsIFx1MjE5MiBcdTZCNjRcdTU5MDRcdTMwMDJcdTU5MERcdTc1MjhcdThCQ0FcdTY1QURcdTk1RURcdTczQUZcdTc2ODQgQWdlbnRpY1BsYW5Nb2RhbCBcdTk4ODRcdTU4NkIgKyBcdTg0M0RcdTVFOTNcdTk0RkVcdThERUZcdTMwMDJcbiAgICovXG4gIGFzeW5jIHJlcXVlc3RBaUltcHJvdmUocDogeyBnb2FsSWQ6IHN0cmluZzsgdGl0bGU/OiBzdHJpbmc7IGhpbnRzPzogc3RyaW5nIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzID0gdGhpcy5zZXR0aW5ncztcbiAgICBpZiAoIXMuYWlFbmFibGVkKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdTUxNDhcdTUyMzBcdThCQkVcdTdGNkVcdTkxQ0NcdTVGMDBcdTU0MkYgQUkgXHU4OUM0XHU1MjEyXHVGRjBDXHU2MjREXHU4MEZEXHU3NTI4IEFJIFx1NjUzOVx1OEZEQlx1NzZFRVx1NjgwNycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgY29uc3QgZ29hbHMgPSBhd2FpdCBzdG9yYWdlLmdldEdvYWxzKCk7XG4gICAgaWYgKGdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbmV3IE5vdGljZSgnXHU0RjYwXHU4RkQ4XHU2Q0ExXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU1MTQ4XHU4REQxXHU0RTAwXHU2QjIxIEFJIFx1ODlDNFx1NTIxMicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBnb2FsID0gZ29hbHMuZmluZCgoZykgPT4gZy5pZCA9PT0gcC5nb2FsSWQpID8/IGdvYWxzLmZpbmQoKGcpID0+IGcudGl0bGUgPT09IHAudGl0bGUpO1xuICAgIGlmICghZ29hbCkge1xuICAgICAgbmV3IE5vdGljZSgnXHU2NzJBXHU1NzI4XHU3NkVFXHU2ODA3XHU1RTkzXHU0RTJEXHU2MjdFXHU1MjMwXHU4QkU1XHU3NkVFXHU2ODA3XHVGRjBDXHU1M0VGXHU4MEZEXHU1QjgzXHU1REYyXHU4OEFCXHU1MjIwXHU5NjY0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcbiAgICBjb25zdCBoaW50c0xpbmUgPSBwLmhpbnRzXG4gICAgICA/IHAuaGludHNcbiAgICAgIDogJ1x1RkYwOFx1NjVFMFx1NTE3N1x1NEY1M1x1NjNEMFx1NzkzQVx1RkYwQ1x1OEJGN1x1N0VEM1x1NTQwOFx1OEJFNVx1NzZFRVx1NjgwN1x1NUY1M1x1NTI0RFx1NUI1MFx1OTg3OVx1NEUwRVx1OEZEQlx1NUVBNlx1ODFFQVx1ODg0Q1x1OEJDQVx1NjVBRFx1NUU3Nlx1NjUzOVx1OEZEQlx1RkYwOSc7XG4gICAgY29uc3QgaW5zdHJ1Y3Rpb24gPVxuICAgICAgYFx1OEJGN1x1NjgzOVx1NjM2RVx1NEVFNVx1NEUwQlx1NTA2NVx1NUVCN1x1NTIwNlx1OEJDQVx1NjVBRFx1RkYwQ1x1NEYxOFx1NTMxNlx1NzZFRVx1NjgwN1x1MzAwQyR7Z29hbC50aXRsZX1cdTMwMERcdUZGMUFcXG4ke2hpbnRzTGluZX1cXG5gICtcbiAgICAgICdcdTg5ODFcdTZDNDJcdUZGMUFcdTRGRERcdTYzMDFcdTkxQ0ZcdTUzMTZcdTk0QzFcdTVGOEJcdUZGMDhcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW5cdTMwMDFcdTY1RTVcdTk4OTdcdTdDOTJcdTVFQTZcdTMwMDFcdTUzRUZcdTY1NzBcdTRFRTNcdTc0MDZcdTYzMDdcdTY4MDdcdUZGMDlcdUZGMENcdTUzRUFcdTUwNUFcdTVGQzVcdTg5ODFcdTc2ODRcdTU4OUVcdTUyMjBcdTY1MzlcdTMwMDInO1xuXG4gICAgbmV3IEFnZW50aWNQbGFuTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIGNvbnRlbnQ6ICcnLFxuICAgICAgc2NvcGU6ICdub3RlJyxcbiAgICAgIGdvYWxzLFxuICAgICAgaW5pdGlhbEluc3RydWN0aW9uOiBpbnN0cnVjdGlvbixcbiAgICAgIHNldHRpbmdzOiBwbGFubmVyU2V0dGluZ3MsXG4gICAgICBzdWJ0aXRsZTogYEFJIFx1NjUzOVx1OEZEQiBcdTAwQjcgJHtnb2FsLnRpdGxlfWAsXG4gICAgICBvbkNvbmZpcm06IChnKSA9PiB2b2lkIHRoaXMud3JpdGVEaWFnbm9zZWRHb2FscyhnKSxcbiAgICB9KS5vcGVuKCk7XG4gIH1cblxuICAvKiogXHU2RkMwXHU2RDNCXHU2MjE2XHU1MjFCXHU1RUZBXHU1OTBEXHU3NkQ4XHU4OUM2XHU1NkZFICovXG4gIGFzeW5jIGFjdGl2YXRlVmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG5cbiAgICBsZXQgbGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG5cbiAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFx1NURGMlx1NjcwOVx1ODlDNlx1NTZGRVx1RkYwQ1x1NzZGNFx1NjNBNVx1ODA1QVx1NzEyNlxuICAgICAgbGVhZiA9IGxlYXZlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NUIwXHU4OUM2XHU1NkZFXG4gICAgICBsZWFmID0gd29ya3NwYWNlLmdldExlYWYoZmFsc2UpO1xuICAgICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoe1xuICAgICAgICB0eXBlOiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobGVhZikge1xuICAgICAgYXdhaXQgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSkgYXMgQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIH1cblxuICAvKiogXHU0RkREXHU1QjU4XHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgSXRlbVZpZXcsIFdvcmtzcGFjZUxlYWYsIEV2ZW50UmVmIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcbmltcG9ydCB7IEFwcEhvc3QgfSBmcm9tICcuLi9ob3N0L0FwcEhvc3QnO1xuaW1wb3J0IHsgQXBwQVBJIH0gZnJvbSAnLi4vaG9zdC9BcHBBUEknO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX0RBSUxZX1JFVklFVyA9ICdiYW1ib28taW1tb3J0YWxzJztcblxuLyoqXG4gKiBEYWlseVJldmlld1ZpZXcgLSBcdTRFM0JcdTg5QzZcdTU2RkVcbiAqXG4gKiBcdTgwNENcdThEMjNcdUZGMUFcbiAqIDEuIFx1NTIxQlx1NUVGQSBpZnJhbWVcdUZGMDhibG9iIFVSTFx1RkYwOVx1NjI3Rlx1OEY3RCB3ZWJhcHBcbiAqIDIuIFx1N0JBMVx1NzQwNiBBcHBIb3N0IC8gQXBwQVBJIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICogMy4gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NUU3Nlx1NTQwQ1x1NkI2NVxuICovXG5leHBvcnQgY2xhc3MgRGFpbHlSZXZpZXdWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuICBwcml2YXRlIHBsdWdpbkRpcjogc3RyaW5nO1xuICBwcml2YXRlIHBsdWdpbjogdW5rbm93bjtcbiAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIHByaXZhdGUgYXBwSG9zdDogQXBwSG9zdCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGFwcEFQSTogQXBwQVBJIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNzc0NoYW5nZVJlZjogRXZlbnRSZWYgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBsZWFmOiBXb3Jrc3BhY2VMZWFmLFxuICAgIHBsdWdpbkRpcjogc3RyaW5nLFxuICAgIF9wbHVnaW46IHVua25vd24sXG4gICAgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLFxuICAgIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPlxuICApIHtcbiAgICBzdXBlcihsZWFmKTtcbiAgICB0aGlzLnBsdWdpbkRpciA9IHBsdWdpbkRpcjtcbiAgICB0aGlzLnBsdWdpbiA9IF9wbHVnaW47XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0RBSUxZX1JFVklFVztcbiAgfVxuXG4gIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnO1xuICB9XG5cbiAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGVhZic7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LWNvbnRhaW5lcicpO1xuXG4gICAgaWYgKCF0aGlzLnBsdWdpbkRpcikge1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjVFMFx1NkNENVx1NUI5QVx1NEY0RFx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NScsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2IEFwcEFQSVx1RkYwOFx1OTAxQVx1NEZFMVx1NUM0Mlx1RkYwOVxuICAgIHRoaXMuYXBwQVBJID0gbmV3IEFwcEFQSShcbiAgICAgIHRoaXMuYXBwLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzLFxuICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZVBhdGggfHwgJycsXG4gICAgICB0aGlzLmFwcC52YXVsdC5jb25maWdEaXJcbiAgICApO1xuICAgIGF3YWl0IHRoaXMuYXBwQVBJLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgLy8gXHU2MjE4XHU3NTY1XHU1OTBEXHU3NkQ4XHU5NzYyXHU2NzdGXHUzMDBDXHU3NTI4IEFJIFx1NjUzOVx1OEZEQlx1MzAwRFx1NTE2NVx1NTNFM1x1RkYxQXdlYmFwcCBcdTUwNjVcdTVFQjdcdTUyMDZcdThCRTZcdTYwQzUgXHUyMTkyIFx1NjNEMlx1NEVGNiBBZ2VudGljIFx1N0YxNlx1OEY5MVx1OTRGRVx1OERFRlxuICAgIHRoaXMuYXBwQVBJLm9uQWlJbXByb3ZlR29hbCA9IChwYXlsb2FkKSA9PiB7XG4gICAgICBjb25zdCBwbHVnaW4gPSB0aGlzLnBsdWdpbiBhc1xuICAgICAgICB8IHsgcmVxdWVzdEFpSW1wcm92ZT86IChwOiB0eXBlb2YgcGF5bG9hZCkgPT4gdm9pZCB9XG4gICAgICAgIHwgdW5kZWZpbmVkO1xuICAgICAgcGx1Z2luPy5yZXF1ZXN0QWlJbXByb3ZlPy4ocGF5bG9hZCk7XG4gICAgfTtcblxuICAgIC8vIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFxuICAgIGNvbnN0IGN1c3RvbVRoZW1lcyA9IGF3YWl0IHRoaXMuc2NhbkN1c3RvbVRoZW1lcygpO1xuICAgIHRoaXMuYXBwQVBJLnNldEN1c3RvbVRoZW1lcyhjdXN0b21UaGVtZXMpO1xuXG4gICAgLy8gXHU1MjFCXHU1RUZBIEFwcEhvc3QgXHU1RTc2XHU2Nzg0XHU1RUZBIGJsb2IgVVJMXG4gICAgY29uc3QgdmVyc2lvbiA9ICh0aGlzLnBsdWdpbiBhcyB7IG1hbmlmZXN0PzogeyB2ZXJzaW9uPzogc3RyaW5nIH0gfSB8IHVuZGVmaW5lZCk/Lm1hbmlmZXN0Py52ZXJzaW9uID8/ICcnO1xuICAgIHRoaXMuYXBwSG9zdCA9IG5ldyBBcHBIb3N0KHRoaXMuYXBwLCB0aGlzLnBsdWdpbkRpciwgdmVyc2lvbik7XG5cbiAgICBjb25zdCBsb2FkaW5nRWwgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTUyQTBcdThGN0RcdTRFMkRcdTIwMjYnLFxuICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1sb2FkaW5nJyxcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLmFwcEFQSS5zdGFydExpc3RlbmluZygpO1xuICAgICAgY29uc3QgYmxvYlVybCA9IGF3YWl0IHRoaXMuYXBwSG9zdC5idWlsZEJsb2JVcmwoKTtcblxuICAgICAgdGhpcy5pZnJhbWUgPSBjb250YWluZXIuY3JlYXRlRWwoJ2lmcmFtZScsIHtcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1mcmFtZScsXG4gICAgICAgIGF0dHI6IHtcbiAgICAgICAgICBzcmM6IGJsb2JVcmwsXG4gICAgICAgICAgYWxsb3c6ICdjYW1lcmE7IG1pY3JvcGhvbmU7IGNsaXBib2FyZC1yZWFkOyBjbGlwYm9hcmQtd3JpdGUnLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGxvYWRpbmdFbC5yZW1vdmUoKTtcbiAgICAgIHRoaXMuYXBwQVBJLmJpbmRJZnJhbWUodGhpcy5pZnJhbWUpO1xuXG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5vbignY3NzLWNoYW5nZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5hcHBBUEk/Lm9uVGhlbWVDaGFuZ2VkKHRoaXMuc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2FkaW5nRWwucmVtb3ZlKCk7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBcdTUyQTBcdThGN0Qgd2ViYXBwIFx1NTkzMVx1OEQyNTonLCBlKTtcbiAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiBgXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1OiAke2UgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdTY3MkFcdTc3RTVcdTk1MTlcdThCRUYnfWAsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgb25DbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFM0JcdTk4OThcdTc2RDFcdTU0MkNcbiAgICBpZiAodGhpcy5jc3NDaGFuZ2VSZWYpIHtcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vZmZyZWYodGhpcy5jc3NDaGFuZ2VSZWYpO1xuICAgICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1OTAxQVx1NEZFMVx1NUM0MlxuICAgIHRoaXMuYXBwQVBJPy5kZXRhY2goKTtcbiAgICB0aGlzLmFwcEFQSSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgYmxvYiBVUkxcbiAgICB0aGlzLmFwcEhvc3Q/LmRlc3Ryb3koKTtcbiAgICB0aGlzLmFwcEhvc3QgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2M0E1XHU2NTM2XHU2NzY1XHU4MUVBXHU2M0QyXHU0RUY2XHU3Njg0XHU1QkZDXHU4MjJBL1x1NjRDRFx1NEY1Q1x1NjMwN1x1NEVFNCAqL1xuICBzZW5kQ29tbWFuZCh0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHsgdHlwZSwgaWQ6ICdjbWRfJyArIERhdGUubm93KCkgfSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUyRFx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAqL1xuICBwcml2YXRlIGFzeW5jIHNjYW5DdXN0b21UaGVtZXMoKTogUHJvbWlzZTxBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgdGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdGhlbWVEaXJOYW1lID0gdGhpcy5zZXR0aW5ncy50aGVtZVBhdGggfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICBsZXQgdGhlbWVEaXJGaWxlczogc3RyaW5nW107XG4gICAgICB0cnkge1xuICAgICAgICB0aGVtZURpckZpbGVzID0gKGF3YWl0IGFkYXB0ZXIubGlzdCh0aGVtZURpck5hbWUpKS5maWxlcztcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gdGhlbWVzO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoZW1lRGlyRmlsZXMpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5lbmRzV2l0aCgnLmpzJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGAke3RoZW1lRGlyTmFtZX0vJHtlbnRyeX1gO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvZGU6IHN0cmluZyA9IGF3YWl0IGFkYXB0ZXIucmVhZChmaWxlUGF0aCk7XG4gICAgICAgICAgaWYgKCFjb2RlLmluY2x1ZGVzKCdfX2JhbWJvb190aGVtZV8nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU3RjNBXHU1QzExIF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcdUZGMENcdTVERjJcdThERjNcdThGQzdgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGVtZXMucHVzaCh7IG5hbWU6IGVudHJ5LnJlcGxhY2UoL1xcLmpzJC8sICcnKSwgY29kZSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW0JhbWJvb1Jldmlld10gXHU4QkZCXHU1M0Q2XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1NTkzMVx1OEQyNTpgLCBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycikpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGVtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKGBbQmFtYm9vUmV2aWV3XSBcdTUzRDFcdTczQjAgJHt0aGVtZXMubGVuZ3RofSBcdTRFMkFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTg6YCwgdGhlbWVzLm1hcCh0ID0+IHQubmFtZSkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgY29uc29sZS5kZWJ1ZygnW0JhbWJvb1Jldmlld10gXHU2MjZCXHU2M0NGXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU2NUY2XHU1MUZBXHU5NTE5OicsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgRGF0YUFkYXB0ZXIsIG5vcm1hbGl6ZVBhdGgsIHJlcXVlc3RVcmwgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyB1bnppcFN5bmMgfSBmcm9tICdmZmxhdGUnO1xuXG4vKipcbiAqIEFwcEhvc3QgXHUyMDE0IHdlYmFwcCBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTRFMEVcdTZDRThcdTUxNjVcdTRFMkRcdTVGQzNcbiAqXG4gKiBcdTUyQTBcdThGN0RcdTdCNTZcdTc1NjVcdUZGMDhcdThGN0JcdTkxQ0ZcdTMwMDFcdTk2RjZcdTUxODVcdTVENENcdUZGMDlcdUZGMUFcbiAqICAgMS4gXHU4QkZCXHU1M0Q2XHU2Nzg0XHU1RUZBXHU2NzFGXHU3NTFGXHU2MjEwXHU3Njg0XHU4MUVBXHU1MzA1XHU1NDJCIHdlYmFwcC9hcHAuaHRtbFx1RkYwOENTUyBcdTVERjJcdTUxODVcdTgwNTRcdTMwMDFidW5kbGUgXHU1REYyXHU1MTg1XHU4MDU0XHU0RTNBXHU5NzU5XHU2MDAxXG4gKiAgICAgIDxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiPiBcdTY4MDdcdTdCN0VcdUZGMENcdTY1RTBcdTRFRkJcdTRGNTVcdTU5MTZcdTkwRThcdTgxMUFcdTY3MkNcdTMwMDFcdTY1RTBcdTUzNjBcdTRGNERcdTdCMjZcdUZGMDlcdTMwMDJcbiAqICAgMi4gXHU1QzA2XHU2NTc0XHU5ODc1IEhUTUwgXHU0RUU1IGJsb2IgVVJMIFx1NUY2Mlx1NUYwRlx1NEVBNFx1N0VEOSBpZnJhbWUgXHU1MkEwXHU4RjdEXHUzMDAyXG4gKlxuICogXHU3NTMxXHU0RThFXHU2MjQwXHU2NzA5IDxzY3JpcHQ+IFx1NTc0N1x1NTcyOFx1Njc4NFx1NUVGQVx1NjcxRlx1RkYwOGJ1bmRsZS13ZWJhcHAubWpzXHVGRjA5XHU5NzU5XHU2MDAxXHU1MTk5XHU1MTY1IGFwcC5odG1sXHVGRjBDXHU4RkQwXHU4ODRDXHU2NUY2XG4gKiBtYWluLmpzIFx1NEUwRFx1NTIxQlx1NUVGQVx1MzAwMVx1NEUwRFx1NjJGQ1x1NjNBNVx1NEVGQlx1NEY1NSBzY3JpcHQgXHU1MTQzXHU3RDIwXHVGRjBDXHU4OUM0XHU5MDdGXHU1Qjg5XHU1MTY4XHU2MjZCXHU2M0NGXHUzMDBDXHU1MkE4XHU2MDAxXHU2Q0U4XHU1MTY1XHU4MTFBXHU2NzJDXHUzMDBEXHU4QkVGXHU2MkE1XHUzMDAyXG4gKlxuICogd2ViYXBwIFx1NzUzMVx1NTNEMVx1NUUwM1x1NkQ0MVx1N0EwQlx1NjI1M1x1NTMwNVx1NEUzQSB3ZWJhcHAuemlwIFx1OTY4Rlx1NzI0OFx1NjcyQ1x1NTIwNlx1NTNEMVx1RkYwOFx1ODlDMSAuZ2l0aHViL3dvcmtmbG93cy9yZWxlYXNlLnltbFx1RkYwOVx1RkYwQ1xuICogXHU2NzJDXHU1NzMwXHU1RjAwXHU1M0QxL1x1NTE4NVx1NkQ0Qlx1OTAxQVx1OEZDNyBzeW5jLnNoIFx1NTQwQ1x1NkI2NVx1NjU3NFx1NEUyQSB3ZWJhcHAvIFx1NzZFRVx1NUY1NVx1RkYwOFx1NTQyQiBhcHAuaHRtbFx1RkYwOVx1RkYwQ1x1OEZEMFx1ODg0Q1x1NjVGNlx1NzZGNFx1NjNBNVx1OEJGQlx1NTNENlx1RkYwQ1xuICogXHU2NUUwXHU5NzAwXHU1MTg1XHU1RDRDXHUzMDAxXHU2NUUwXHU1OTE2XHU5MEU4XHU4MDU0XHU3RjUxXHVGRjBDbWFpbi5qcyBcdTRGRERcdTYzMDFcdThGN0JcdTkxQ0ZcdTMwMDJcbiAqXG4gKiBcdTgxRUFcdTYxMDhcdUZGMDhcdTcyNDhcdTY3MkNcdTVCODhcdTUzNkJcdUZGMDlcdUZGMUFcdThGRDBcdTg4NENcdTY1RjZcdTZCRDRcdTVCRjkgd2ViYXBwLy53ZWJhcHAtdmVyc2lvbiBcdTRFMEVcdTVGNTNcdTUyNERcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdTMwMDJcbiAqICAgLSBcdTY3MkNcdTU3MzBcdTdGM0FcdTU5MzEgd2ViYXBwL1x1RkYwQ1x1NjIxNlx1NzI0OFx1NjcyQ1x1NjIzM1x1N0YzQVx1NTkzMVx1RkYwOFx1ODAwMSBjbG9uZSAvIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOVx1MjE5MiBcdTRGRTFcdTRFRkJcdTc4QzFcdTc2RDhcdTYyMTZcdTk2NERcdTdFQTdcdUZGMUJcbiAqICAgLSBcdTcyNDhcdTY3MkNcdTRFMERcdTdCMjZcdUZGMDhcdTYzRDJcdTRFRjZcdTVERjJcdTUzNDdcdTdFQTdcdTRGNDYgd2ViYXBwIFx1NjcyQVx1OERERlx1OTY4Rlx1RkYwOVx1MjE5MiBcdTkxQ0RcdTY1QjBcdTRFQ0VcdTVCRjlcdTVFOTRcdTcyNDhcdTY3MkMgR2l0SHViIFJlbGVhc2VcbiAqICAgICBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEJcdUZGMENcdTRGN0ZcdTMwMEN3ZWJhcHAgXHU2NkY0XHU2NUIwXHU3RUNGIEdpdEh1YiBcdTk2OEZcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdTkwMDFcdThGQkVcdTMwMERcdTc3MUZcdTZCNjNcdTYyMTBcdTdBQ0JcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIEFwcEhvc3Qge1xuICBwcml2YXRlIGFwcDogQXBwO1xuICBwcml2YXRlIHdlYmFwcERpcjogc3RyaW5nO1xuICBwcml2YXRlIGJsb2JVcmxzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IHZlcnNpb246IHN0cmluZztcbiAgcHJpdmF0ZSByZWFkb25seSByZXBvID0gJ21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscyc7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbkRpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLndlYmFwcERpciA9IG5vcm1hbGl6ZVBhdGgoYCR7cGx1Z2luRGlyfS93ZWJhcHBgKTtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uO1xuICB9XG5cbiAgLy8gXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2XHU3Njg0XHU1M0JCXHU5MUNEXHU3RjEzXHU1QjU4XHVGRjFBXHU5MDdGXHU1MTREXHU2M0QyXHU0RUY2IG9ubG9hZCBcdTk4ODRcdTYyQzlcdTUzRDZcdTRFMEVcdTg5QzZcdTU2RkVcdTYyNTNcdTVGMDBcdTY1RjZcdTkxQ0RcdTU5MERcdTRFMEJcdThGN0RcbiAgcHJpdmF0ZSBzdGF0aWMgcHJlZmV0Y2hDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBQcm9taXNlPHZvaWQ+PigpO1xuXG4gIC8qKlxuICAgKiBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDZcdUZGMUFcdTYzRDJcdTRFRjYgb25sb2FkIFx1NjVGNlx1OEMwM1x1NzUyOFx1RkYwQ1x1NjNEMFx1NTI0RFx1NjI4QVx1N0YzQVx1NTkzMVx1NzY4NCB3ZWJhcHAgXHU0RTBCXHU4RjdEXHU1RTc2XHU4OUUzXHU1MzhCXHU1MjMwXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHUzMDAyXG4gICAqIFx1NkI2M1x1NUUzOFx1NUI4OVx1ODhDNVx1RkYwOHdlYmFwcC8gXHU1REYyXHU5NjhGXHU2M0QyXHU0RUY2XHU1MjA2XHU1M0QxXHVGRjA5XHU2NUY2XHU0RUM1XHU1MDVBXHU0RTAwXHU2QjIxXHU1QjU4XHU1NzI4XHU2MDI3XHU2OEMwXHU2N0U1XHVGRjBDXHU1MUUwXHU0RTRFXHU5NkY2XHU1RjAwXHU5NTAwXHUzMDAyXG4gICAqIFx1NTkzMVx1OEQyNVx1NEVDNVx1NTQ0QVx1OEI2Nlx1RkYwOFx1NEUwRFx1NjI5Qlx1NTFGQVx1RkYwOVx1RkYwQ1x1NzcxRlx1NkI2M1x1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NjVGNiBidWlsZEJsb2JVcmwgXHU0RjFBXHU1MThEXHU2QjIxXHU1QzFEXHU4QkQ1XHVGRjFCXG4gICAqIFx1NTQwQ1x1NEUwMFx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NVx1NUU3Nlx1NTNEMVx1NTNFQVx1ODlFNlx1NTNEMVx1NEUwMFx1NkIyMVx1NEUwQlx1OEY3RFx1MzAwMlxuICAgKi9cbiAgc3RhdGljIHByZWZldGNoKGFwcDogQXBwLCBwbHVnaW5EaXI6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qga2V5ID0gbm9ybWFsaXplUGF0aChgJHtwbHVnaW5EaXJ9L3dlYmFwcGApO1xuICAgIGxldCBwID0gQXBwSG9zdC5wcmVmZXRjaENhY2hlLmdldChrZXkpO1xuICAgIGlmICghcCkge1xuICAgICAgY29uc3QgaG9zdCA9IG5ldyBBcHBIb3N0KGFwcCwgcGx1Z2luRGlyLCB2ZXJzaW9uKTtcbiAgICAgIHAgPSBob3N0LmVuc3VyZVdlYmFwcChhcHAudmF1bHQuYWRhcHRlcikuY2F0Y2goKGU6IHVua25vd24pID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICdbQXBwSG9zdF0gXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2IHdlYmFwcCBcdTU5MzFcdThEMjVcdUZGMDhcdTYyNTNcdTVGMDBcdTg5QzZcdTU2RkVcdTY1RjZcdTVDMDZcdTkxQ0RcdThCRDVcdUZGMDlcdUZGMUEnLFxuICAgICAgICAgIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBBcHBIb3N0LnByZWZldGNoQ2FjaGUuc2V0KGtleSwgcCk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG5cbiAgYXN5bmMgYnVpbGRCbG9iVXJsKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG5cbiAgICAvLyBcdTgxRUFcdTYxMDhcdUZGMUF3ZWJhcHAvIFx1N0YzQVx1NTkzMVx1NjVGNlx1NEVDRVx1NUJGOVx1NUU5NFx1NzI0OFx1NjcyQyBSZWxlYXNlIFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1NUU3Nlx1ODlFM1x1NTM4QlxuICAgIGF3YWl0IHRoaXMuZW5zdXJlV2ViYXBwKGFkYXB0ZXIpO1xuXG4gICAgY29uc3QgYXBwSHRtbFBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS9hcHAuaHRtbGApO1xuICAgIGxldCBodG1sOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIGh0bWwgPSBhd2FpdCBhZGFwdGVyLnJlYWQoYXBwSHRtbFBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1RTBcdTZDRDVcdThCRkJcdTUzRDYgd2ViYXBwL2FwcC5odG1sXHVGRjBDXHU0RTE0XHU4MUVBXHU1MkE4XHU0RTBCXHU4RjdEXHU1OTMxXHU4RDI1XHUzMDAyXHU4QkY3XHU1QzFEXHU4QkQ1XHU1NzI4IE9ic2lkaWFuIFx1NEUyRFx1OTFDRFx1NjVCMFx1NUI4OVx1ODhDNVx1NjcyQ1x1NjNEMlx1NEVGNlx1RkYwQ1x1NjIxNlx1NjI0Qlx1NTJBOFx1NjUzRVx1N0Y2RSB3ZWJhcHAvIFx1NzZFRVx1NUY1NScpO1xuICAgIH1cblxuICAgIC8vIFx1NjU3NFx1OTg3NSBIVE1MIFx1NURGMlx1ODFFQVx1NTMwNVx1NTQyQlx1RkYwOENTUyBcdTUxODVcdTgwNTQgKyBidW5kbGUgXHU1MTg1XHU4MDU0XHU0RTNBXHU5NzU5XHU2MDAxIDxzY3JpcHQ+XHVGRjA5XHVGRjBDXHU3NkY0XHU2M0E1IGJsb2IgXHU0RUE0XHU3RUQ5IGlmcmFtZVx1MzAwMlxuICAgIC8vIFx1OEZEMFx1ODg0Q1x1NjVGNlx1NEUwRFx1NTIxQlx1NUVGQVx1MzAwMVx1NEUwRFx1NjJGQ1x1NjNBNVx1NEVGQlx1NEY1NSBzY3JpcHQgXHU1MTQzXHU3RDIwXHUzMDAyXG4gICAgY29uc3QgcGFnZUJsb2IgPSBuZXcgQmxvYihbaHRtbF0sIHsgdHlwZTogJ3RleHQvaHRtbCcgfSk7XG4gICAgY29uc3QgcGFnZVVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwocGFnZUJsb2IpO1xuICAgIHRoaXMuYmxvYlVybHMucHVzaChwYWdlVXJsKTtcbiAgICByZXR1cm4gcGFnZVVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTgxRUFcdTYxMDhcdUZGMDhcdTcyNDhcdTY3MkNcdTVCODhcdTUzNkJcdUZGMDlcdUZGMUFcdTgyRTVcdTY3MkNcdTU3MzAgd2ViYXBwIFx1N0YzQVx1NTkzMVx1RkYwQ1x1NjIxNlx1NURGMlx1NUI1OFx1NTcyOFx1NEY0Nlx1NzI0OFx1NjcyQ1x1NjIzM1x1NEUwRVx1NUY1M1x1NTI0RFx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1NEUwRFx1N0IyNlx1RkYwQ1xuICAgKiBcdTUyMTlcdTkxQ0RcdTY1QjBcdTRFQ0UgR2l0SHViIFJlbGVhc2UgXHU0RTBCXHU4RjdEXHU1QkY5XHU1RTk0XHU3MjQ4XHU2NzJDXHU3Njg0IHdlYmFwcC56aXAgXHU4OUUzXHU1MzhCXHVGRjA4XHU4OTg2XHU3NkQ2XHVGRjA5XHUzMDAyXG4gICAqIFx1NkI2M1x1NUUzOFx1NUI4OVx1ODhDNVx1RkYwOHdlYmFwcC8gXHU1REYyXHU5NjhGXHU2M0QyXHU0RUY2XHU1MjA2XHU1M0QxXHU0RTE0XHU3MjQ4XHU2NzJDXHU1MzM5XHU5MTREXHVGRjA5XHU1QjhDXHU1MTY4XHU0RTBEXHU4OUU2XHU1M0QxXHU4MDU0XHU3RjUxXHVGRjFCXHU0RUM1XHU3RjNBXHU1OTMxXHU2MjE2XHU4RkM3XHU2NzFGXHU2NUY2XHU1MTVDXHU1RTk1XHUzMDAyXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGVuc3VyZVdlYmFwcChhZGFwdGVyOiBEYXRhQWRhcHRlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHZlcnNpb25TdGFtcEZpbGUgPSAnLndlYmFwcC12ZXJzaW9uJztcbiAgICBjb25zdCBhcHBIdG1sUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9L2FwcC5odG1sYCk7XG4gICAgY29uc3Qgc3RhbXBQYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLndlYmFwcERpcn0vJHt2ZXJzaW9uU3RhbXBGaWxlfWApO1xuXG4gICAgaWYgKGF3YWl0IHRoaXMuZmlsZUV4aXN0cyhhZGFwdGVyLCBhcHBIdG1sUGF0aCkpIHtcbiAgICAgIC8vIHdlYmFwcC8gXHU1QjU4XHU1NzI4XHVGRjFBXHU0RUM1XHU1RjUzXHU3MjQ4XHU2NzJDXHU2MjMzXHU3RjNBXHU1OTMxXHVGRjA4XHU4MDAxIGNsb25lIC8gXHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHVGRjA5XHU2MjE2XHU3MjQ4XHU2NzJDXHU0RTBEXHU3QjI2XHU2NUY2XHU2MjREXHU5MUNEXHU0RTBCXHVGRjBDXG4gICAgICAvLyBcdTU0MjZcdTUyMTlcdTRGRTFcdTRFRkJcdTc4QzFcdTc2RDggXHUyMDE0XHUyMDE0IEJSQVQgLyBnaXQtY2xvbmUgXHU5NjhGXHU0RUQzXHU1RTkzXHU1NDBDXHU2QjY1XHU3Njg0XHU2NzAwXHU2NUIwIHdlYmFwcCBcdTUzNzNcdTZCNjNcdTc4NkVcdUZGMENcdTY1RTBcdTk3MDBcdTgwNTRcdTdGNTFcdTMwMDJcbiAgICAgIGlmICghKGF3YWl0IHRoaXMuZmlsZUV4aXN0cyhhZGFwdGVyLCBzdGFtcFBhdGgpKSkgcmV0dXJuO1xuICAgICAgY29uc3QgbG9jYWwgPSBhd2FpdCB0aGlzLnJlYWRWZXJzaW9uU3RhbXAoYWRhcHRlciwgc3RhbXBQYXRoKTtcbiAgICAgIGlmIChsb2NhbCA9PT0gdGhpcy52ZXJzaW9uKSByZXR1cm47XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYFtBcHBIb3N0XSBcdTY3MkNcdTU3MzAgd2ViYXBwIFx1NzI0OFx1NjcyQygke2xvY2FsfSkgXHU0RTBFXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDKCR7dGhpcy52ZXJzaW9ufSkgXHU0RTBEXHU3QjI2XHVGRjBDXHU5MUNEXHU2NUIwXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHUzMDAyYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudmVyc2lvbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQXBwSG9zdF0gXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHVGRjBDXHU4REYzXHU4RkM3XHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHUzMDAyXHU4QkY3XHU3ODZFXHU4QkE0XHU2M0QyXHU0RUY2XHU1Qjg5XHU4OEM1XHU1QjhDXHU2NTc0XHUzMDAyJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMucmVwb30vcmVsZWFzZXMvZG93bmxvYWQvJHt0aGlzLnZlcnNpb259L3dlYmFwcC56aXBgO1xuICAgIGNvbnNvbGUubG9nKGBbQXBwSG9zdF0gXHU2NzJBXHU2OEMwXHU2RDRCXHU1MjMwXHU1MzM5XHU5MTREXHU3Njg0XHU2NzJDXHU1NzMwIHdlYmFwcFx1RkYwQ1x1NUMxRFx1OEJENVx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1RkYxQSR7dXJsfWApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgcmVxdWVzdFVybCh7IHVybCwgbWV0aG9kOiAnR0VUJyB9KTtcbiAgICAgIGlmIChyZXNwLnN0YXR1cyA8IDIwMCB8fCByZXNwLnN0YXR1cyA+PSAzMDAgfHwgIXJlc3AuYXJyYXlCdWZmZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcdTRFMEJcdThGN0RcdThGRDRcdTU2REVcdTVGMDJcdTVFMzhcdTcyQjZcdTYwMDEgJHtyZXNwLnN0YXR1c31gKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuZXh0cmFjdFppcChhZGFwdGVyLCByZXNwLmFycmF5QnVmZmVyKTtcbiAgICAgIC8vIHdlYmFwcC56aXAgXHU1REYyXHU2NDNBXHU1RTI2IC53ZWJhcHAtdmVyc2lvblx1RkYwQ1x1ODlFM1x1NTM4Qlx1NTQwRVx1ODFFQVx1NTJBOFx1ODQzRFx1NzZEOFx1RkYxQlx1NkI2NFx1NTkwNFx1NTE1Q1x1NUU5NVx1NTE4RFx1NTE5OVx1NEUwMFx1NkIyMVx1RkYwQ1xuICAgICAgLy8gXHU5MDdGXHU1MTREXHU1NDBDXHU3MjQ4XHU2NzJDXHU1M0NEXHU1OTBEXHU5MUNEXHU0RTBCXHUzMDAyXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhZGFwdGVyLndyaXRlKHN0YW1wUGF0aCwgdGhpcy52ZXJzaW9uKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbQXBwSG9zdF0gXHU1MTk5XHU1MTY1IHdlYmFwcCBcdTcyNDhcdTY3MkNcdTYyMzNcdTU5MzFcdThEMjVcdUZGMDhcdTRFMERcdTVGNzFcdTU0Q0RcdTRGN0ZcdTc1MjhcdUZGMDlcdUZGMUEnLCBlKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCdbQXBwSG9zdF0gd2ViYXBwIFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1NUU3Nlx1ODlFM1x1NTM4Qlx1NUI4Q1x1NjIxMFx1MzAwMicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcHBIb3N0XSB3ZWJhcHAgXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHU1OTMxXHU4RDI1XHVGRjFBJywgZSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBcdTY1RTBcdTZDRDVcdTgxRUFcdTUyQThcdTgzQjdcdTUzRDYgd2ViYXBwXHVGRjA4JHtlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU2NzJBXHU3N0U1XHU5NTE5XHU4QkVGJ31cdUZGMDlcdTMwMDJgICtcbiAgICAgICAgJ1x1OEJGN1x1NjhDMFx1NjdFNVx1N0Y1MVx1N0VEQ1x1NTQwRVx1OTFDRFx1OEJENVx1RkYwQ1x1NjIxNlx1NTcyOCBPYnNpZGlhbiBcdTRFMkRcdTkxQ0RcdTY1QjBcdTVCODlcdTg4QzVcdTY3MkNcdTYzRDJcdTRFRjZcdTMwMDInXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVhZFZlcnNpb25TdGFtcChhZGFwdGVyOiBEYXRhQWRhcHRlciwgZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGF3YWl0IGFkYXB0ZXIucmVhZChmaWxlUGF0aCkpLnRyaW0oKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZXh0cmFjdFppcChhZGFwdGVyOiBEYXRhQWRhcHRlciwgYnVmZmVyOiBBcnJheUJ1ZmZlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIGZmbGF0ZSBcdTk2RjZcdTRGOURcdThENTZcdUZGMDhcdTY1RTAgc2V0aW1tZWRpYXRlIFx1NEU0Qlx1N0M3Qlx1NEYxQVx1NTJBOFx1NjAwMVx1NTIxQlx1NUVGQSA8c2NyaXB0PiBcdTc2ODRcdTRGMjBcdTkwMTJcdTRGOURcdThENTZcdUZGMDlcdUZGMENcbiAgICAvLyBcdThGRDRcdTU2REVcdTc2ODQgZW50cmllcyBcdTRFQzVcdTU0MkJcdTY1ODdcdTRFRjZcdUZGMDhcdTRFMERcdTU0MkJcdTc2RUVcdTVGNTVcdTY3NjFcdTc2RUVcdUZGMDlcdUZGMENcdTc2RUVcdTVGNTVcdTc1MzEgZW5zdXJlUGFyZW50RGlyU2FmZSBcdTYzMDlcdTk3MDBcdTUyMUJcdTVFRkFcdTMwMDJcbiAgICBjb25zdCBmaWxlcyA9IHVuemlwU3luYyhuZXcgVWludDhBcnJheShidWZmZXIpKTtcbiAgICBjb25zdCBlbnRyaWVzOiB7IHRhcmdldDogc3RyaW5nOyBjb250ZW50OiBVaW50OEFycmF5IH1bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgW3Jhd1BhdGgsIGNvbnRlbnRdIG9mIE9iamVjdC5lbnRyaWVzKGZpbGVzKSkge1xuICAgICAgY29uc3QgcmVsID0gbm9ybWFsaXplUGF0aChyYXdQYXRoLnJlcGxhY2UoL15cXC4/XFwvLywgJycpKTtcbiAgICAgIGlmICghcmVsKSBjb250aW51ZTtcbiAgICAgIGlmIChyZWwuZW5kc1dpdGgoJy8nKSkgY29udGludWU7IC8vIFx1NzZFRVx1NUY1NVx1NTM2MFx1NEY0RFx1Njc2MVx1NzZFRVx1RkYwQ1x1NjVFMFx1OTcwMFx1NTE5OVx1NTFGQVxuICAgICAgZW50cmllcy5wdXNoKHsgdGFyZ2V0OiBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS8ke3JlbH1gKSwgY29udGVudCB9KTtcbiAgICB9XG5cbiAgICAvLyBcdTdCMkNcdTRFMDBcdTkwNERcdUZGMUFcdTUxNDhcdTVFRkFcdTU5N0RcdTYyNDBcdTY3MDlcdTcyMzZcdTc2RUVcdTVGNTVcdTMwMDJcdTgyRTVcdTY3RDBcdTRFMDBcdTdFQTdcdTVERjJcdTg4QUJcdTU0MENcdTU0MERcdTY1ODdcdTRFRjZcdTUzNjBcdTc1MjhcdUZGMDh6aXAgXHU3NkVFXHU1RjU1XHU1MzYwXHU0RjREXHU2NzYxXHU3NkVFXHUzMDAxXG4gICAgLy8gXHU2MjE2XHU2NzJDXHU1NzMwXHU2QjhCXHU3NTU5XHU3Njg0XHU1NzRGXHU2NTg3XHU0RUY2XHVGRjA5XHVGRjBDXHU1MTQ4XHU1MjIwXHU5NjY0XHU1MThEXHU1RUZBXHU3NkVFXHU1RjU1XHVGRjBDXHU5MDdGXHU1MTREXHU1NDBFXHU3RUVEIHdyaXRlQmluYXJ5IFx1ODlFNlx1NTNEMSBFTk9URElSXHUzMDAyXG4gICAgZm9yIChjb25zdCB7IHRhcmdldCB9IG9mIGVudHJpZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMuZW5zdXJlUGFyZW50RGlyU2FmZShhZGFwdGVyLCB0YXJnZXQpO1xuICAgIH1cblxuICAgIC8vIFx1N0IyQ1x1NEU4Q1x1OTA0RFx1RkYxQVx1NTE5OVx1NjU4N1x1NEVGNlx1MzAwMlx1ODJFNVx1NjdEMFx1Njc2MVx1NzZFRVx1OERFRlx1NUY4NFx1NURGMlx1ODhBQlx1NUY1M1x1NEY1Q1x1NzZFRVx1NUY1NVx1NTE5OVx1NTE2NVx1RkYwOFx1NTM2MFx1NEY0RFx1NjU4N1x1NEVGNlx1NEUwRVx1NzcxRlx1NUI5RVx1NzZFRVx1NUY1NVx1NTFCMlx1N0E4MVx1RkYwOVx1RkYwQ1xuICAgIC8vIFx1OERGM1x1OEZDN1x1OEJFNVx1NTM2MFx1NEY0RFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEUwRFx1ODk4Nlx1NzZENlx1NEUzQVx1NjU4N1x1NEVGNlx1RkYwQ1x1NEZERFx1OEJDMSBhc3NldHMvc2NyaXB0cy8qIFx1N0I0OVx1NUQ0Q1x1NTk1N1x1NjU4N1x1NEVGNlx1ODBGRFx1NkI2M1x1NUUzOFx1ODQzRFx1NzZEOFx1MzAwMlxuICAgIGZvciAoY29uc3QgeyB0YXJnZXQsIGNvbnRlbnQgfSBvZiBlbnRyaWVzKSB7XG4gICAgICBpZiAoYXdhaXQgdGhpcy5pc0ZvbGRlcihhZGFwdGVyLCB0YXJnZXQpKSBjb250aW51ZTtcbiAgICAgIC8vIFVpbnQ4QXJyYXkgXHUyMTkyIFx1NzJFQ1x1N0FDQiBBcnJheUJ1ZmZlclx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTE3MVx1NEVBQlx1NUU5NVx1NUM0MiBidWZmZXIgXHU1QkZDXHU4MUY0XHU4RDhBXHU3NTRDXG4gICAgICBhd2FpdCBhZGFwdGVyLndyaXRlQmluYXJ5KHRhcmdldCwgY29udGVudC5zbGljZSgpLmJ1ZmZlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1OTAxMFx1N0VBN1x1Nzg2RVx1NEZERFx1NzIzNlx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFx1RkYxQlx1OTA0N1x1NTIzMFx1MzAwQ1x1NTQwQ1x1NTQwRFx1NjU4N1x1NEVGNlx1NTM2MFx1NEY0RFx1MzAwRFx1NjVGNlx1NTE0OFx1NTIyMFx1OTY2NFx1NTE4RCBta2Rpclx1RkYwQ1xuICAgKiBcdTg5RTNcdTUxQjMgemlwIFx1NTM2MFx1NEY0RFx1Njc2MVx1NzZFRSAvIFx1NjcyQ1x1NTczMFx1NTc0Rlx1NjU4N1x1NEVGNlx1NUJGQ1x1ODFGNCB3cml0ZUJpbmFyeSBcdTYyOUIgRU5PVERJUiBcdTc2ODRcdTk1RUVcdTk4OThcdTMwMDJcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlUGFyZW50RGlyU2FmZShhZGFwdGVyOiBEYXRhQWRhcHRlciwgZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhcnRzID0gZmlsZVBhdGguc3BsaXQoJy8nKTtcbiAgICBsZXQgYWNjID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGFjYyArPSAoYWNjID8gJy8nIDogJycpICsgcGFydHNbaV07XG4gICAgICBpZiAoIWFjYykgY29udGludWU7XG4gICAgICBjb25zdCBraW5kID0gYXdhaXQgdGhpcy5zdGF0S2luZChhZGFwdGVyLCBhY2MpO1xuICAgICAgaWYgKGtpbmQgPT09ICdmb2xkZXInKSBjb250aW51ZTsgLy8gXHU1REYyXHU2NjJGXHU3NkVFXHU1RjU1XHVGRjBDXHU4REYzXHU4RkM3XG4gICAgICBpZiAoa2luZCA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgYWRhcHRlci5yZW1vdmUoYWNjKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gXHU1MjIwXHU5NjY0XHU1OTMxXHU4RDI1XHU0RTVGXHU0RTBEXHU5NjNCXHU2NUFEXHVGRjBDXHU0RUE0XHU3NTMxXHU0RTBCXHU2NUI5IG1rZGlyIFx1NjZCNFx1OTczMlx1NzcxRlx1NUI5RVx1OTUxOVx1OEJFRlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhZGFwdGVyLm1rZGlyKGFjYyk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gXHU1M0VGXHU4MEZEXHU1REYyXHU4OEFCXHU1MTc2XHU0RUQ2XHU2NzYxXHU3NkVFXHU1MTQ4XHU4ODRDXHU1MjFCXHU1RUZBXHVGRjBDXHU1RkZEXHU3NTY1XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1OEZENFx1NTZERVx1OERFRlx1NUY4NFx1N0M3Qlx1NTc4Qlx1RkYxQSdmaWxlJyB8ICdmb2xkZXInIHwgJ25vbmUnXHVGRjA4XHU0RTBEXHU1QjU4XHU1NzI4XHU2MjE2XHU2NUUwXHU2Q0Q1XHU1MjI0XHU1QjlBXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgc3RhdEtpbmQoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8J2ZpbGUnIHwgJ2ZvbGRlcicgfCAnbm9uZSc+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3QgPSBhd2FpdCBhZGFwdGVyLnN0YXQocGF0aCk7XG4gICAgICBpZiAoIXN0KSByZXR1cm4gJ25vbmUnO1xuICAgICAgcmV0dXJuIHN0LnR5cGUgPT09ICdmb2xkZXInID8gJ2ZvbGRlcicgOiAnZmlsZSc7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ25vbmUnO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaXNGb2xkZXIoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5zdGF0S2luZChhZGFwdGVyLCBwYXRoKSkgPT09ICdmb2xkZXInO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmaWxlRXhpc3RzKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGFkYXB0ZXIuZXhpc3RzKHBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB1cmwgb2YgdGhpcy5ibG9iVXJscykge1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIH1cbiAgICB0aGlzLmJsb2JVcmxzID0gW107XG4gIH1cbn1cbiIsICIvLyBERUZMQVRFIGlzIGEgY29tcGxleCBmb3JtYXQ7IHRvIHJlYWQgdGhpcyBjb2RlLCB5b3Ugc2hvdWxkIHByb2JhYmx5IGNoZWNrIHRoZSBSRkMgZmlyc3Q6XG4vLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMTk1MVxuLy8gWW91IG1heSBhbHNvIHdpc2ggdG8gdGFrZSBhIGxvb2sgYXQgdGhlIGd1aWRlIEkgbWFkZSBhYm91dCB0aGlzIHByb2dyYW06XG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8xMDFhcnJvd3ovMjUzZjMxZWI1YWJjM2Q5Mjc1YWI5NDMwMDNmZmVjYWRcbi8vIFNvbWUgb2YgdGhlIGZvbGxvd2luZyBjb2RlIGlzIHNpbWlsYXIgdG8gdGhhdCBvZiBVWklQLmpzOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3Bob3RvcGVhL1VaSVAuanNcbi8vIEhvd2V2ZXIsIHRoZSB2YXN0IG1ham9yaXR5IG9mIHRoZSBjb2RlYmFzZSBoYXMgZGl2ZXJnZWQgZnJvbSBVWklQLmpzIHRvIGluY3JlYXNlIHBlcmZvcm1hbmNlIGFuZCByZWR1Y2UgYnVuZGxlIHNpemUuXG4vLyBTb21ldGltZXMgMCB3aWxsIGFwcGVhciB3aGVyZSAtMSB3b3VsZCBiZSBtb3JlIGFwcHJvcHJpYXRlLiBUaGlzIGlzIGJlY2F1c2UgdXNpbmcgYSB1aW50XG4vLyBpcyBiZXR0ZXIgZm9yIG1lbW9yeSBpbiBtb3N0IGVuZ2luZXMgKEkgKnRoaW5rKikuXG52YXIgY2gyID0ge307XG52YXIgd2sgPSAoZnVuY3Rpb24gKGMsIGlkLCBtc2csIHRyYW5zZmVyLCBjYikge1xuICAgIHZhciB3ID0gbmV3IFdvcmtlcihjaDJbaWRdIHx8IChjaDJbaWRdID0gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbXG4gICAgICAgIGMgKyAnO2FkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGZ1bmN0aW9uKGUpe2U9ZS5lcnJvcjtwb3N0TWVzc2FnZSh7JGUkOltlLm1lc3NhZ2UsZS5jb2RlLGUuc3RhY2tdfSl9KSdcbiAgICBdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pKSkpO1xuICAgIHcub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGQgPSBlLmRhdGEsIGVkID0gZC4kZSQ7XG4gICAgICAgIGlmIChlZCkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihlZFswXSk7XG4gICAgICAgICAgICBlcnJbJ2NvZGUnXSA9IGVkWzFdO1xuICAgICAgICAgICAgZXJyLnN0YWNrID0gZWRbMl07XG4gICAgICAgICAgICBjYihlcnIsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNiKG51bGwsIGQpO1xuICAgIH07XG4gICAgdy5wb3N0TWVzc2FnZShtc2csIHRyYW5zZmVyKTtcbiAgICByZXR1cm4gdztcbn0pO1xuXG4vLyBhbGlhc2VzIGZvciBzaG9ydGVyIGNvbXByZXNzZWQgY29kZSAobW9zdCBtaW5pZmVycyBkb24ndCBkbyB0aGlzKVxudmFyIHU4ID0gVWludDhBcnJheSwgdTE2ID0gVWludDE2QXJyYXksIGkzMiA9IEludDMyQXJyYXk7XG4vLyBmaXhlZCBsZW5ndGggZXh0cmEgYml0c1xudmFyIGZsZWIgPSBuZXcgdTgoWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDEsIDIsIDIsIDIsIDIsIDMsIDMsIDMsIDMsIDQsIDQsIDQsIDQsIDUsIDUsIDUsIDUsIDAsIC8qIHVudXNlZCAqLyAwLCAwLCAvKiBpbXBvc3NpYmxlICovIDBdKTtcbi8vIGZpeGVkIGRpc3RhbmNlIGV4dHJhIGJpdHNcbnZhciBmZGViID0gbmV3IHU4KFswLCAwLCAwLCAwLCAxLCAxLCAyLCAyLCAzLCAzLCA0LCA0LCA1LCA1LCA2LCA2LCA3LCA3LCA4LCA4LCA5LCA5LCAxMCwgMTAsIDExLCAxMSwgMTIsIDEyLCAxMywgMTMsIC8qIHVudXNlZCAqLyAwLCAwXSk7XG4vLyBjb2RlIGxlbmd0aCBpbmRleCBtYXBcbnZhciBjbGltID0gbmV3IHU4KFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XSk7XG4vLyBnZXQgYmFzZSwgcmV2ZXJzZSBpbmRleCBtYXAgZnJvbSBleHRyYSBiaXRzXG52YXIgZnJlYiA9IGZ1bmN0aW9uIChlYiwgc3RhcnQpIHtcbiAgICB2YXIgYiA9IG5ldyB1MTYoMzEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzE7ICsraSkge1xuICAgICAgICBiW2ldID0gc3RhcnQgKz0gMSA8PCBlYltpIC0gMV07XG4gICAgfVxuICAgIC8vIG51bWJlcnMgaGVyZSBhcmUgYXQgbWF4IDE4IGJpdHNcbiAgICB2YXIgciA9IG5ldyBpMzIoYlszMF0pO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMzA7ICsraSkge1xuICAgICAgICBmb3IgKHZhciBqID0gYltpXTsgaiA8IGJbaSArIDFdOyArK2opIHtcbiAgICAgICAgICAgIHJbal0gPSAoKGogLSBiW2ldKSA8PCA1KSB8IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYjogYiwgcjogciB9O1xufTtcbnZhciBfYSA9IGZyZWIoZmxlYiwgMiksIGZsID0gX2EuYiwgcmV2ZmwgPSBfYS5yO1xuLy8gd2UgY2FuIGlnbm9yZSB0aGUgZmFjdCB0aGF0IHRoZSBvdGhlciBudW1iZXJzIGFyZSB3cm9uZzsgdGhleSBuZXZlciBoYXBwZW4gYW55d2F5XG5mbFsyOF0gPSAyNTgsIHJldmZsWzI1OF0gPSAyODtcbnZhciBfYiA9IGZyZWIoZmRlYiwgMCksIGZkID0gX2IuYiwgcmV2ZmQgPSBfYi5yO1xuLy8gbWFwIG9mIHZhbHVlIHRvIHJldmVyc2UgKGFzc3VtaW5nIDE2IGJpdHMpXG52YXIgcmV2ID0gbmV3IHUxNigzMjc2OCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyNzY4OyArK2kpIHtcbiAgICAvLyByZXZlcnNlIHRhYmxlIGFsZ29yaXRobSBmcm9tIFNPXG4gICAgdmFyIHggPSAoKGkgJiAweEFBQUEpID4+IDEpIHwgKChpICYgMHg1NTU1KSA8PCAxKTtcbiAgICB4ID0gKCh4ICYgMHhDQ0NDKSA+PiAyKSB8ICgoeCAmIDB4MzMzMykgPDwgMik7XG4gICAgeCA9ICgoeCAmIDB4RjBGMCkgPj4gNCkgfCAoKHggJiAweDBGMEYpIDw8IDQpO1xuICAgIHJldltpXSA9ICgoKHggJiAweEZGMDApID4+IDgpIHwgKCh4ICYgMHgwMEZGKSA8PCA4KSkgPj4gMTtcbn1cbi8vIGNyZWF0ZSBodWZmbWFuIHRyZWUgZnJvbSB1OCBcIm1hcFwiOiBpbmRleCAtPiBjb2RlIGxlbmd0aCBmb3IgY29kZSBpbmRleFxuLy8gbWIgKG1heCBiaXRzKSBtdXN0IGJlIGF0IG1vc3QgMTVcbi8vIFRPRE86IG9wdGltaXplL3NwbGl0IHVwP1xudmFyIGhNYXAgPSAoZnVuY3Rpb24gKGNkLCBtYiwgcikge1xuICAgIHZhciBzID0gY2QubGVuZ3RoO1xuICAgIC8vIGluZGV4XG4gICAgdmFyIGkgPSAwO1xuICAgIC8vIHUxNiBcIm1hcFwiOiBpbmRleCAtPiAjIG9mIGNvZGVzIHdpdGggYml0IGxlbmd0aCA9IGluZGV4XG4gICAgdmFyIGwgPSBuZXcgdTE2KG1iKTtcbiAgICAvLyBsZW5ndGggb2YgY2QgbXVzdCBiZSAyODggKHRvdGFsICMgb2YgY29kZXMpXG4gICAgZm9yICg7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgaWYgKGNkW2ldKVxuICAgICAgICAgICAgKytsW2NkW2ldIC0gMV07XG4gICAgfVxuICAgIC8vIHUxNiBcIm1hcFwiOiBpbmRleCAtPiBtaW5pbXVtIGNvZGUgZm9yIGJpdCBsZW5ndGggPSBpbmRleFxuICAgIHZhciBsZSA9IG5ldyB1MTYobWIpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBtYjsgKytpKSB7XG4gICAgICAgIGxlW2ldID0gKGxlW2kgLSAxXSArIGxbaSAtIDFdKSA8PCAxO1xuICAgIH1cbiAgICB2YXIgY287XG4gICAgaWYgKHIpIHtcbiAgICAgICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+IG51bWJlciBvZiBhY3R1YWwgYml0cywgc3ltYm9sIGZvciBjb2RlXG4gICAgICAgIGNvID0gbmV3IHUxNigxIDw8IG1iKTtcbiAgICAgICAgLy8gYml0cyB0byByZW1vdmUgZm9yIHJldmVyc2VyXG4gICAgICAgIHZhciBydmIgPSAxNSAtIG1iO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICAvLyBpZ25vcmUgMCBsZW5ndGhzXG4gICAgICAgICAgICBpZiAoY2RbaV0pIHtcbiAgICAgICAgICAgICAgICAvLyBudW0gZW5jb2RpbmcgYm90aCBzeW1ib2wgYW5kIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgIHZhciBzdiA9IChpIDw8IDQpIHwgY2RbaV07XG4gICAgICAgICAgICAgICAgLy8gZnJlZSBiaXRzXG4gICAgICAgICAgICAgICAgdmFyIHJfMSA9IG1iIC0gY2RbaV07XG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgdmFsdWVcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGxlW2NkW2ldIC0gMV0rKyA8PCByXzE7XG4gICAgICAgICAgICAgICAgLy8gbSBpcyBlbmQgdmFsdWVcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBtID0gdiB8ICgoMSA8PCByXzEpIC0gMSk7IHYgPD0gbTsgKyt2KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGV2ZXJ5IDE2IGJpdCB2YWx1ZSBzdGFydGluZyB3aXRoIHRoZSBjb2RlIHlpZWxkcyB0aGUgc2FtZSByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgY29bcmV2W3ZdID4+IHJ2Yl0gPSBzdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvID0gbmV3IHUxNihzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHM7ICsraSkge1xuICAgICAgICAgICAgaWYgKGNkW2ldKSB7XG4gICAgICAgICAgICAgICAgY29baV0gPSByZXZbbGVbY2RbaV0gLSAxXSsrXSA+PiAoMTUgLSBjZFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvO1xufSk7XG4vLyBmaXhlZCBsZW5ndGggdHJlZVxudmFyIGZsdCA9IG5ldyB1OCgyODgpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAxNDQ7ICsraSlcbiAgICBmbHRbaV0gPSA4O1xuZm9yICh2YXIgaSA9IDE0NDsgaSA8IDI1NjsgKytpKVxuICAgIGZsdFtpXSA9IDk7XG5mb3IgKHZhciBpID0gMjU2OyBpIDwgMjgwOyArK2kpXG4gICAgZmx0W2ldID0gNztcbmZvciAodmFyIGkgPSAyODA7IGkgPCAyODg7ICsraSlcbiAgICBmbHRbaV0gPSA4O1xuLy8gZml4ZWQgZGlzdGFuY2UgdHJlZVxudmFyIGZkdCA9IG5ldyB1OCgzMik7XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpXG4gICAgZmR0W2ldID0gNTtcbi8vIGZpeGVkIGxlbmd0aCBtYXBcbnZhciBmbG0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmx0LCA5LCAwKSwgZmxybSA9IC8qI19fUFVSRV9fKi8gaE1hcChmbHQsIDksIDEpO1xuLy8gZml4ZWQgZGlzdGFuY2UgbWFwXG52YXIgZmRtID0gLyojX19QVVJFX18qLyBoTWFwKGZkdCwgNSwgMCksIGZkcm0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmR0LCA1LCAxKTtcbi8vIGZpbmQgbWF4IG9mIGFycmF5XG52YXIgbWF4ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgbSA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChhW2ldID4gbSlcbiAgICAgICAgICAgIG0gPSBhW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn07XG4vLyByZWFkIGQsIHN0YXJ0aW5nIGF0IGJpdCBwIGFuZCBtYXNrIHdpdGggbVxudmFyIGJpdHMgPSBmdW5jdGlvbiAoZCwgcCwgbSkge1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgcmV0dXJuICgoZFtvXSB8IChkW28gKyAxXSA8PCA4KSkgPj4gKHAgJiA3KSkgJiBtO1xufTtcbi8vIHJlYWQgZCwgc3RhcnRpbmcgYXQgYml0IHAgY29udGludWluZyBmb3IgYXQgbGVhc3QgMTYgYml0c1xudmFyIGJpdHMxNiA9IGZ1bmN0aW9uIChkLCBwKSB7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICByZXR1cm4gKChkW29dIHwgKGRbbyArIDFdIDw8IDgpIHwgKGRbbyArIDJdIDw8IDE2KSkgPj4gKHAgJiA3KSk7XG59O1xuLy8gZ2V0IGVuZCBvZiBieXRlXG52YXIgc2hmdCA9IGZ1bmN0aW9uIChwKSB7IHJldHVybiAoKHAgKyA3KSAvIDgpIHwgMDsgfTtcbi8vIHR5cGVkIGFycmF5IHNsaWNlIC0gYWxsb3dzIGdhcmJhZ2UgY29sbGVjdG9yIHRvIGZyZWUgb3JpZ2luYWwgcmVmZXJlbmNlLFxuLy8gd2hpbGUgYmVpbmcgbW9yZSBjb21wYXRpYmxlIHRoYW4gLnNsaWNlXG52YXIgc2xjID0gZnVuY3Rpb24gKHYsIHMsIGUpIHtcbiAgICBpZiAocyA9PSBudWxsIHx8IHMgPCAwKVxuICAgICAgICBzID0gMDtcbiAgICBpZiAoZSA9PSBudWxsIHx8IGUgPiB2Lmxlbmd0aClcbiAgICAgICAgZSA9IHYubGVuZ3RoO1xuICAgIC8vIGNhbid0IHVzZSAuY29uc3RydWN0b3IgaW4gY2FzZSB1c2VyLXN1cHBsaWVkXG4gICAgcmV0dXJuIG5ldyB1OCh2LnN1YmFycmF5KHMsIGUpKTtcbn07XG4vKipcbiAqIENvZGVzIGZvciBlcnJvcnMgZ2VuZXJhdGVkIHdpdGhpbiB0aGlzIGxpYnJhcnlcbiAqL1xuZXhwb3J0IHZhciBGbGF0ZUVycm9yQ29kZSA9IHtcbiAgICBVbmV4cGVjdGVkRU9GOiAwLFxuICAgIEludmFsaWRCbG9ja1R5cGU6IDEsXG4gICAgSW52YWxpZExlbmd0aExpdGVyYWw6IDIsXG4gICAgSW52YWxpZERpc3RhbmNlOiAzLFxuICAgIFN0cmVhbUZpbmlzaGVkOiA0LFxuICAgIE5vU3RyZWFtSGFuZGxlcjogNSxcbiAgICBJbnZhbGlkSGVhZGVyOiA2LFxuICAgIE5vQ2FsbGJhY2s6IDcsXG4gICAgSW52YWxpZFVURjg6IDgsXG4gICAgRXh0cmFGaWVsZFRvb0xvbmc6IDksXG4gICAgSW52YWxpZERhdGU6IDEwLFxuICAgIEZpbGVuYW1lVG9vTG9uZzogMTEsXG4gICAgU3RyZWFtRmluaXNoaW5nOiAxMixcbiAgICBJbnZhbGlkWmlwRGF0YTogMTMsXG4gICAgVW5rbm93bkNvbXByZXNzaW9uTWV0aG9kOiAxNFxufTtcbi8vIGVycm9yIGNvZGVzXG52YXIgZWMgPSBbXG4gICAgJ3VuZXhwZWN0ZWQgRU9GJyxcbiAgICAnaW52YWxpZCBibG9jayB0eXBlJyxcbiAgICAnaW52YWxpZCBsZW5ndGgvbGl0ZXJhbCcsXG4gICAgJ2ludmFsaWQgZGlzdGFuY2UnLFxuICAgICdzdHJlYW0gZmluaXNoZWQnLFxuICAgICdubyBzdHJlYW0gaGFuZGxlcicsXG4gICAgLCAvLyBkZXRlcm1pbmVkIGJ5IGNvbXByZXNzaW9uIGZ1bmN0aW9uXG4gICAgJ25vIGNhbGxiYWNrJyxcbiAgICAnaW52YWxpZCBVVEYtOCBkYXRhJyxcbiAgICAnZXh0cmEgZmllbGQgdG9vIGxvbmcnLFxuICAgICdkYXRlIG5vdCBpbiByYW5nZSAxOTgwLTIwOTknLFxuICAgICdmaWxlbmFtZSB0b28gbG9uZycsXG4gICAgJ3N0cmVhbSBmaW5pc2hpbmcnLFxuICAgICdpbnZhbGlkIHppcCBkYXRhJ1xuICAgIC8vIGRldGVybWluZWQgYnkgdW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Rcbl07XG47XG52YXIgZXJyID0gZnVuY3Rpb24gKGluZCwgbXNnLCBudCkge1xuICAgIHZhciBlID0gbmV3IEVycm9yKG1zZyB8fCBlY1tpbmRdKTtcbiAgICBlLmNvZGUgPSBpbmQ7XG4gICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKVxuICAgICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlLCBlcnIpO1xuICAgIGlmICghbnQpXG4gICAgICAgIHRocm93IGU7XG4gICAgcmV0dXJuIGU7XG59O1xuLy8gZXhwYW5kcyByYXcgREVGTEFURSBkYXRhXG52YXIgaW5mbHQgPSBmdW5jdGlvbiAoZGF0LCBzdCwgYnVmLCBkaWN0KSB7XG4gICAgLy8gc291cmNlIGxlbmd0aCAgICAgICBkaWN0IGxlbmd0aFxuICAgIHZhciBzbCA9IGRhdC5sZW5ndGgsIGRsID0gZGljdCA/IGRpY3QubGVuZ3RoIDogMDtcbiAgICBpZiAoIXNsIHx8IHN0LmYgJiYgIXN0LmwpXG4gICAgICAgIHJldHVybiBidWYgfHwgbmV3IHU4KDApO1xuICAgIHZhciBub0J1ZiA9ICFidWY7XG4gICAgLy8gaGF2ZSB0byBlc3RpbWF0ZSBzaXplXG4gICAgdmFyIHJlc2l6ZSA9IG5vQnVmIHx8IHN0LmkgIT0gMjtcbiAgICAvLyBubyBzdGF0ZVxuICAgIHZhciBub1N0ID0gc3QuaTtcbiAgICAvLyBBc3N1bWVzIHJvdWdobHkgMzMlIGNvbXByZXNzaW9uIHJhdGlvIGF2ZXJhZ2VcbiAgICBpZiAobm9CdWYpXG4gICAgICAgIGJ1ZiA9IG5ldyB1OChzbCAqIDMpO1xuICAgIC8vIGVuc3VyZSBidWZmZXIgY2FuIGZpdCBhdCBsZWFzdCBsIGVsZW1lbnRzXG4gICAgdmFyIGNidWYgPSBmdW5jdGlvbiAobCkge1xuICAgICAgICB2YXIgYmwgPSBidWYubGVuZ3RoO1xuICAgICAgICAvLyBuZWVkIHRvIGluY3JlYXNlIHNpemUgdG8gZml0XG4gICAgICAgIGlmIChsID4gYmwpIHtcbiAgICAgICAgICAgIC8vIERvdWJsZSBvciBzZXQgdG8gbmVjZXNzYXJ5LCB3aGljaGV2ZXIgaXMgZ3JlYXRlclxuICAgICAgICAgICAgdmFyIG5idWYgPSBuZXcgdTgoTWF0aC5tYXgoYmwgKiAyLCBsKSk7XG4gICAgICAgICAgICBuYnVmLnNldChidWYpO1xuICAgICAgICAgICAgYnVmID0gbmJ1ZjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gIGxhc3QgY2h1bmsgICAgICAgICBiaXRwb3MgICAgICAgICAgIGJ5dGVzXG4gICAgdmFyIGZpbmFsID0gc3QuZiB8fCAwLCBwb3MgPSBzdC5wIHx8IDAsIGJ0ID0gc3QuYiB8fCAwLCBsbSA9IHN0LmwsIGRtID0gc3QuZCwgbGJ0ID0gc3QubSwgZGJ0ID0gc3QubjtcbiAgICAvLyB0b3RhbCBiaXRzXG4gICAgdmFyIHRidHMgPSBzbCAqIDg7XG4gICAgZG8ge1xuICAgICAgICBpZiAoIWxtKSB7XG4gICAgICAgICAgICAvLyBCRklOQUwgLSB0aGlzIGlzIG9ubHkgMSB3aGVuIGxhc3QgY2h1bmsgaXMgbmV4dFxuICAgICAgICAgICAgZmluYWwgPSBiaXRzKGRhdCwgcG9zLCAxKTtcbiAgICAgICAgICAgIC8vIHR5cGU6IDAgPSBubyBjb21wcmVzc2lvbiwgMSA9IGZpeGVkIGh1ZmZtYW4sIDIgPSBkeW5hbWljIGh1ZmZtYW5cbiAgICAgICAgICAgIHZhciB0eXBlID0gYml0cyhkYXQsIHBvcyArIDEsIDMpO1xuICAgICAgICAgICAgcG9zICs9IDM7XG4gICAgICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBnbyB0byBlbmQgb2YgYnl0ZSBib3VuZGFyeVxuICAgICAgICAgICAgICAgIHZhciBzID0gc2hmdChwb3MpICsgNCwgbCA9IGRhdFtzIC0gNF0gfCAoZGF0W3MgLSAzXSA8PCA4KSwgdCA9IHMgKyBsO1xuICAgICAgICAgICAgICAgIGlmICh0ID4gc2wpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgc2l6ZVxuICAgICAgICAgICAgICAgIGlmIChyZXNpemUpXG4gICAgICAgICAgICAgICAgICAgIGNidWYoYnQgKyBsKTtcbiAgICAgICAgICAgICAgICAvLyBDb3B5IG92ZXIgdW5jb21wcmVzc2VkIGRhdGFcbiAgICAgICAgICAgICAgICBidWYuc2V0KGRhdC5zdWJhcnJheShzLCB0KSwgYnQpO1xuICAgICAgICAgICAgICAgIC8vIEdldCBuZXcgYml0cG9zLCB1cGRhdGUgYnl0ZSBjb3VudFxuICAgICAgICAgICAgICAgIHN0LmIgPSBidCArPSBsLCBzdC5wID0gcG9zID0gdCAqIDgsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMSlcbiAgICAgICAgICAgICAgICBsbSA9IGZscm0sIGRtID0gZmRybSwgbGJ0ID0gOSwgZGJ0ID0gNTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICBsaXRlcmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aHNcbiAgICAgICAgICAgICAgICB2YXIgaExpdCA9IGJpdHMoZGF0LCBwb3MsIDMxKSArIDI1NywgaGNMZW4gPSBiaXRzKGRhdCwgcG9zICsgMTAsIDE1KSArIDQ7XG4gICAgICAgICAgICAgICAgdmFyIHRsID0gaExpdCArIGJpdHMoZGF0LCBwb3MgKyA1LCAzMSkgKyAxO1xuICAgICAgICAgICAgICAgIHBvcyArPSAxNDtcbiAgICAgICAgICAgICAgICAvLyBsZW5ndGgrZGlzdGFuY2UgdHJlZVxuICAgICAgICAgICAgICAgIHZhciBsZHQgPSBuZXcgdTgodGwpO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgY2x0ID0gbmV3IHU4KDE5KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhjTGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIGluZGV4IG1hcCB0byBnZXQgcmVhbCBjb2RlXG4gICAgICAgICAgICAgICAgICAgIGNsdFtjbGltW2ldXSA9IGJpdHMoZGF0LCBwb3MgKyBpICogMywgNyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBvcyArPSBoY0xlbiAqIDM7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGhzIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgY2xiID0gbWF4KGNsdCksIGNsYm1zayA9ICgxIDw8IGNsYikgLSAxO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RocyBtYXBcbiAgICAgICAgICAgICAgICB2YXIgY2xtID0gaE1hcChjbHQsIGNsYiwgMSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0bDspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjbG1bYml0cyhkYXQsIHBvcywgY2xibXNrKV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gciAmIDE1O1xuICAgICAgICAgICAgICAgICAgICAvLyBzeW1ib2xcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByID4+IDQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRvIGNvcHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMgPCAxNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGR0W2krK10gPSBzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGNvcHkgICBjb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSAwLCBuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzID09IDE2KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAzICsgYml0cyhkYXQsIHBvcywgMyksIHBvcyArPSAyLCBjID0gbGR0W2kgLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMgPT0gMTcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDMgKyBiaXRzKGRhdCwgcG9zLCA3KSwgcG9zICs9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzID09IDE4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAxMSArIGJpdHMoZGF0LCBwb3MsIDEyNyksIHBvcyArPSA3O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG4tLSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZHRbaSsrXSA9IGM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICAgbGVuZ3RoIHRyZWUgICAgICAgICAgICAgICAgIGRpc3RhbmNlIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgbHQgPSBsZHQuc3ViYXJyYXkoMCwgaExpdCksIGR0ID0gbGR0LnN1YmFycmF5KGhMaXQpO1xuICAgICAgICAgICAgICAgIC8vIG1heCBsZW5ndGggYml0c1xuICAgICAgICAgICAgICAgIGxidCA9IG1heChsdCk7XG4gICAgICAgICAgICAgICAgLy8gbWF4IGRpc3QgYml0c1xuICAgICAgICAgICAgICAgIGRidCA9IG1heChkdCk7XG4gICAgICAgICAgICAgICAgbG0gPSBoTWFwKGx0LCBsYnQsIDEpO1xuICAgICAgICAgICAgICAgIGRtID0gaE1hcChkdCwgZGJ0LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlcnIoMSk7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBidWZmZXIgY2FuIGhvbGQgdGhpcyArIHRoZSBsYXJnZXN0IHBvc3NpYmxlIGFkZGl0aW9uXG4gICAgICAgIC8vIE1heGltdW0gY2h1bmsgc2l6ZSAocHJhY3RpY2FsbHksIHRoZW9yZXRpY2FsbHkgaW5maW5pdGUpIGlzIDJeMTdcbiAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgIGNidWYoYnQgKyAxMzEwNzIpO1xuICAgICAgICB2YXIgbG1zID0gKDEgPDwgbGJ0KSAtIDEsIGRtcyA9ICgxIDw8IGRidCkgLSAxO1xuICAgICAgICB2YXIgbHBvcyA9IHBvcztcbiAgICAgICAgZm9yICg7OyBscG9zID0gcG9zKSB7XG4gICAgICAgICAgICAvLyBiaXRzIHJlYWQsIGNvZGVcbiAgICAgICAgICAgIHZhciBjID0gbG1bYml0czE2KGRhdCwgcG9zKSAmIGxtc10sIHN5bSA9IGMgPj4gNDtcbiAgICAgICAgICAgIHBvcyArPSBjICYgMTU7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWMpXG4gICAgICAgICAgICAgICAgZXJyKDIpO1xuICAgICAgICAgICAgaWYgKHN5bSA8IDI1NilcbiAgICAgICAgICAgICAgICBidWZbYnQrK10gPSBzeW07XG4gICAgICAgICAgICBlbHNlIGlmIChzeW0gPT0gMjU2KSB7XG4gICAgICAgICAgICAgICAgbHBvcyA9IHBvcywgbG0gPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGFkZCA9IHN5bSAtIDI1NDtcbiAgICAgICAgICAgICAgICAvLyBubyBleHRyYSBiaXRzIG5lZWRlZCBpZiBsZXNzXG4gICAgICAgICAgICAgICAgaWYgKHN5bSA+IDI2NCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmRleFxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IHN5bSAtIDI1NywgYiA9IGZsZWJbaV07XG4gICAgICAgICAgICAgICAgICAgIGFkZCA9IGJpdHMoZGF0LCBwb3MsICgxIDw8IGIpIC0gMSkgKyBmbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRpc3RcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRtW2JpdHMxNihkYXQsIHBvcykgJiBkbXNdLCBkc3ltID0gZCA+PiA0O1xuICAgICAgICAgICAgICAgIGlmICghZClcbiAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgIHBvcyArPSBkICYgMTU7XG4gICAgICAgICAgICAgICAgdmFyIGR0ID0gZmRbZHN5bV07XG4gICAgICAgICAgICAgICAgaWYgKGRzeW0gPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiID0gZmRlYltkc3ltXTtcbiAgICAgICAgICAgICAgICAgICAgZHQgKz0gYml0czE2KGRhdCwgcG9zKSAmICgxIDw8IGIpIC0gMSwgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIDEzMTA3Mik7XG4gICAgICAgICAgICAgICAgdmFyIGVuZCA9IGJ0ICsgYWRkO1xuICAgICAgICAgICAgICAgIGlmIChidCA8IGR0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGlmdCA9IGRsIC0gZHQsIGRlbmQgPSBNYXRoLm1pbihkdCwgZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoaWZ0ICsgYnQgPCAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgYnQgPCBkZW5kOyArK2J0KVxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGRpY3Rbc2hpZnQgKyBidF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoOyBidCA8IGVuZDsgKytidClcbiAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGJ1ZltidCAtIGR0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdC5sID0gbG0sIHN0LnAgPSBscG9zLCBzdC5iID0gYnQsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgaWYgKGxtKVxuICAgICAgICAgICAgZmluYWwgPSAxLCBzdC5tID0gbGJ0LCBzdC5kID0gZG0sIHN0Lm4gPSBkYnQ7XG4gICAgfSB3aGlsZSAoIWZpbmFsKTtcbiAgICAvLyBkb24ndCByZWFsbG9jYXRlIGZvciBzdHJlYW1zIG9yIHVzZXIgYnVmZmVyc1xuICAgIHJldHVybiBidCAhPSBidWYubGVuZ3RoICYmIG5vQnVmID8gc2xjKGJ1ZiwgMCwgYnQpIDogYnVmLnN1YmFycmF5KDAsIGJ0KTtcbn07XG4vLyBzdGFydGluZyBhdCBwLCB3cml0ZSB0aGUgbWluaW11bSBudW1iZXIgb2YgYml0cyB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzID0gZnVuY3Rpb24gKGQsIHAsIHYpIHtcbiAgICB2IDw8PSBwICYgNztcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIGRbb10gfD0gdjtcbiAgICBkW28gKyAxXSB8PSB2ID4+IDg7XG59O1xuLy8gc3RhcnRpbmcgYXQgcCwgd3JpdGUgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGJpdHMgKD44KSB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzMTYgPSBmdW5jdGlvbiAoZCwgcCwgdikge1xuICAgIHYgPDw9IHAgJiA3O1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgZFtvXSB8PSB2O1xuICAgIGRbbyArIDFdIHw9IHYgPj4gODtcbiAgICBkW28gKyAyXSB8PSB2ID4+IDE2O1xufTtcbi8vIGNyZWF0ZXMgY29kZSBsZW5ndGhzIGZyb20gYSBmcmVxdWVuY3kgdGFibGVcbnZhciBoVHJlZSA9IGZ1bmN0aW9uIChkLCBtYikge1xuICAgIC8vIE5lZWQgZXh0cmEgaW5mbyB0byBtYWtlIGEgdHJlZVxuICAgIHZhciB0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChkW2ldKVxuICAgICAgICAgICAgdC5wdXNoKHsgczogaSwgZjogZFtpXSB9KTtcbiAgICB9XG4gICAgdmFyIHMgPSB0Lmxlbmd0aDtcbiAgICB2YXIgdDIgPSB0LnNsaWNlKCk7XG4gICAgaWYgKCFzKVxuICAgICAgICByZXR1cm4geyB0OiBldCwgbDogMCB9O1xuICAgIGlmIChzID09IDEpIHtcbiAgICAgICAgdmFyIHYgPSBuZXcgdTgodFswXS5zICsgMSk7XG4gICAgICAgIHZbdFswXS5zXSA9IDE7XG4gICAgICAgIHJldHVybiB7IHQ6IHYsIGw6IDEgfTtcbiAgICB9XG4gICAgdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmYgLSBiLmY7IH0pO1xuICAgIC8vIGFmdGVyIGkyIHJlYWNoZXMgbGFzdCBpbmQsIHdpbGwgYmUgc3RvcHBlZFxuICAgIC8vIGZyZXEgbXVzdCBiZSBncmVhdGVyIHRoYW4gbGFyZ2VzdCBwb3NzaWJsZSBudW1iZXIgb2Ygc3ltYm9sc1xuICAgIHQucHVzaCh7IHM6IC0xLCBmOiAyNTAwMSB9KTtcbiAgICB2YXIgbCA9IHRbMF0sIHIgPSB0WzFdLCBpMCA9IDAsIGkxID0gMSwgaTIgPSAyO1xuICAgIHRbMF0gPSB7IHM6IC0xLCBmOiBsLmYgKyByLmYsIGw6IGwsIHI6IHIgfTtcbiAgICAvLyBlZmZpY2llbnQgYWxnb3JpdGhtIGZyb20gVVpJUC5qc1xuICAgIC8vIGkwIGlzIGxvb2tiZWhpbmQsIGkyIGlzIGxvb2thaGVhZCAtIGFmdGVyIHByb2Nlc3NpbmcgdHdvIGxvdy1mcmVxXG4gICAgLy8gc3ltYm9scyB0aGF0IGNvbWJpbmVkIGhhdmUgaGlnaCBmcmVxLCB3aWxsIHN0YXJ0IHByb2Nlc3NpbmcgaTIgKGhpZ2gtZnJlcSxcbiAgICAvLyBub24tY29tcG9zaXRlKSBzeW1ib2xzIGluc3RlYWRcbiAgICAvLyBzZWUgaHR0cHM6Ly9yZWRkaXQuY29tL3IvcGhvdG9wZWEvY29tbWVudHMvaWtla2h0L3V6aXBqc19xdWVzdGlvbnMvXG4gICAgd2hpbGUgKGkxICE9IHMgLSAxKSB7XG4gICAgICAgIGwgPSB0W3RbaTBdLmYgPCB0W2kyXS5mID8gaTArKyA6IGkyKytdO1xuICAgICAgICByID0gdFtpMCAhPSBpMSAmJiB0W2kwXS5mIDwgdFtpMl0uZiA/IGkwKysgOiBpMisrXTtcbiAgICAgICAgdFtpMSsrXSA9IHsgczogLTEsIGY6IGwuZiArIHIuZiwgbDogbCwgcjogciB9O1xuICAgIH1cbiAgICB2YXIgbWF4U3ltID0gdDJbMF0ucztcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAodDJbaV0ucyA+IG1heFN5bSlcbiAgICAgICAgICAgIG1heFN5bSA9IHQyW2ldLnM7XG4gICAgfVxuICAgIC8vIGNvZGUgbGVuZ3Roc1xuICAgIHZhciB0ciA9IG5ldyB1MTYobWF4U3ltICsgMSk7XG4gICAgLy8gbWF4IGJpdHMgaW4gdHJlZVxuICAgIHZhciBtYnQgPSBsbih0W2kxIC0gMV0sIHRyLCAwKTtcbiAgICBpZiAobWJ0ID4gbWIpIHtcbiAgICAgICAgLy8gbW9yZSBhbGdvcml0aG1zIGZyb20gVVpJUC5qc1xuICAgICAgICAvLyBUT0RPOiBmaW5kIG91dCBob3cgdGhpcyBjb2RlIHdvcmtzIChkZWJ0KVxuICAgICAgICAvLyAgaW5kICAgIGRlYnRcbiAgICAgICAgdmFyIGkgPSAwLCBkdCA9IDA7XG4gICAgICAgIC8vICAgIGxlZnQgICAgICAgICAgICBjb3N0XG4gICAgICAgIHZhciBsZnQgPSBtYnQgLSBtYiwgY3N0ID0gMSA8PCBsZnQ7XG4gICAgICAgIHQyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIHRyW2Iuc10gLSB0clthLnNdIHx8IGEuZiAtIGIuZjsgfSk7XG4gICAgICAgIGZvciAoOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICB2YXIgaTJfMSA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfMV0gPiBtYikge1xuICAgICAgICAgICAgICAgIGR0ICs9IGNzdCAtICgxIDw8IChtYnQgLSB0cltpMl8xXSkpO1xuICAgICAgICAgICAgICAgIHRyW2kyXzFdID0gbWI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZHQgPj49IGxmdDtcbiAgICAgICAgd2hpbGUgKGR0ID4gMCkge1xuICAgICAgICAgICAgdmFyIGkyXzIgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzJdIDwgbWIpXG4gICAgICAgICAgICAgICAgZHQgLT0gMSA8PCAobWIgLSB0cltpMl8yXSsrIC0gMSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgKytpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoOyBpID49IDAgJiYgZHQ7IC0taSkge1xuICAgICAgICAgICAgdmFyIGkyXzMgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzNdID09IG1iKSB7XG4gICAgICAgICAgICAgICAgLS10cltpMl8zXTtcbiAgICAgICAgICAgICAgICArK2R0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1idCA9IG1iO1xuICAgIH1cbiAgICByZXR1cm4geyB0OiBuZXcgdTgodHIpLCBsOiBtYnQgfTtcbn07XG4vLyBnZXQgdGhlIG1heCBsZW5ndGggYW5kIGFzc2lnbiBsZW5ndGggY29kZXNcbnZhciBsbiA9IGZ1bmN0aW9uIChuLCBsLCBkKSB7XG4gICAgcmV0dXJuIG4ucyA9PSAtMVxuICAgICAgICA/IE1hdGgubWF4KGxuKG4ubCwgbCwgZCArIDEpLCBsbihuLnIsIGwsIGQgKyAxKSlcbiAgICAgICAgOiAobFtuLnNdID0gZCk7XG59O1xuLy8gbGVuZ3RoIGNvZGVzIGdlbmVyYXRpb25cbnZhciBsYyA9IGZ1bmN0aW9uIChjKSB7XG4gICAgdmFyIHMgPSBjLmxlbmd0aDtcbiAgICAvLyBOb3RlIHRoYXQgdGhlIHNlbWljb2xvbiB3YXMgaW50ZW50aW9uYWxcbiAgICB3aGlsZSAocyAmJiAhY1stLXNdKVxuICAgICAgICA7XG4gICAgdmFyIGNsID0gbmV3IHUxNigrK3MpO1xuICAgIC8vICBpbmQgICAgICBudW0gICAgICAgICBzdHJlYWtcbiAgICB2YXIgY2xpID0gMCwgY2xuID0gY1swXSwgY2xzID0gMTtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICh2KSB7IGNsW2NsaSsrXSA9IHY7IH07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gczsgKytpKSB7XG4gICAgICAgIGlmIChjW2ldID09IGNsbiAmJiBpICE9IHMpXG4gICAgICAgICAgICArK2NscztcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWNsbiAmJiBjbHMgPiAyKSB7XG4gICAgICAgICAgICAgICAgZm9yICg7IGNscyA+IDEzODsgY2xzIC09IDEzOClcbiAgICAgICAgICAgICAgICAgICAgdygzMjc1NCk7XG4gICAgICAgICAgICAgICAgaWYgKGNscyA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdyhjbHMgPiAxMCA/ICgoY2xzIC0gMTEpIDw8IDUpIHwgMjg2OTAgOiAoKGNscyAtIDMpIDw8IDUpIHwgMTIzMDUpO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNscyA+IDMpIHtcbiAgICAgICAgICAgICAgICB3KGNsbiksIC0tY2xzO1xuICAgICAgICAgICAgICAgIGZvciAoOyBjbHMgPiA2OyBjbHMgLT0gNilcbiAgICAgICAgICAgICAgICAgICAgdyg4MzA0KTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzID4gMilcbiAgICAgICAgICAgICAgICAgICAgdygoKGNscyAtIDMpIDw8IDUpIHwgODIwOCksIGNscyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY2xzLS0pXG4gICAgICAgICAgICAgICAgdyhjbG4pO1xuICAgICAgICAgICAgY2xzID0gMTtcbiAgICAgICAgICAgIGNsbiA9IGNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYzogY2wuc3ViYXJyYXkoMCwgY2xpKSwgbjogcyB9O1xufTtcbi8vIGNhbGN1bGF0ZSB0aGUgbGVuZ3RoIG9mIG91dHB1dCBmcm9tIHRyZWUsIGNvZGUgbGVuZ3Roc1xudmFyIGNsZW4gPSBmdW5jdGlvbiAoY2YsIGNsKSB7XG4gICAgdmFyIGwgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2wubGVuZ3RoOyArK2kpXG4gICAgICAgIGwgKz0gY2ZbaV0gKiBjbFtpXTtcbiAgICByZXR1cm4gbDtcbn07XG4vLyB3cml0ZXMgYSBmaXhlZCBibG9ja1xuLy8gcmV0dXJucyB0aGUgbmV3IGJpdCBwb3NcbnZhciB3ZmJsayA9IGZ1bmN0aW9uIChvdXQsIHBvcywgZGF0KSB7XG4gICAgLy8gbm8gbmVlZCB0byB3cml0ZSAwMCBhcyB0eXBlOiBUeXBlZEFycmF5IGRlZmF1bHRzIHRvIDBcbiAgICB2YXIgcyA9IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBzaGZ0KHBvcyArIDIpO1xuICAgIG91dFtvXSA9IHMgJiAyNTU7XG4gICAgb3V0W28gKyAxXSA9IHMgPj4gODtcbiAgICBvdXRbbyArIDJdID0gb3V0W29dIF4gMjU1O1xuICAgIG91dFtvICsgM10gPSBvdXRbbyArIDFdIF4gMjU1O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgKytpKVxuICAgICAgICBvdXRbbyArIGkgKyA0XSA9IGRhdFtpXTtcbiAgICByZXR1cm4gKG8gKyA0ICsgcykgKiA4O1xufTtcbi8vIHdyaXRlcyBhIGJsb2NrXG52YXIgd2JsayA9IGZ1bmN0aW9uIChkYXQsIG91dCwgZmluYWwsIHN5bXMsIGxmLCBkZiwgZWIsIGxpLCBicywgYmwsIHApIHtcbiAgICB3Yml0cyhvdXQsIHArKywgZmluYWwpO1xuICAgICsrbGZbMjU2XTtcbiAgICB2YXIgX2EgPSBoVHJlZShsZiwgMTUpLCBkbHQgPSBfYS50LCBtbGIgPSBfYS5sO1xuICAgIHZhciBfYiA9IGhUcmVlKGRmLCAxNSksIGRkdCA9IF9iLnQsIG1kYiA9IF9iLmw7XG4gICAgdmFyIF9jID0gbGMoZGx0KSwgbGNsdCA9IF9jLmMsIG5sYyA9IF9jLm47XG4gICAgdmFyIF9kID0gbGMoZGR0KSwgbGNkdCA9IF9kLmMsIG5kYyA9IF9kLm47XG4gICAgdmFyIGxjZnJlcSA9IG5ldyB1MTYoMTkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGNsdC5sZW5ndGg7ICsraSlcbiAgICAgICAgKytsY2ZyZXFbbGNsdFtpXSAmIDMxXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxjZHQubGVuZ3RoOyArK2kpXG4gICAgICAgICsrbGNmcmVxW2xjZHRbaV0gJiAzMV07XG4gICAgdmFyIF9lID0gaFRyZWUobGNmcmVxLCA3KSwgbGN0ID0gX2UudCwgbWxjYiA9IF9lLmw7XG4gICAgdmFyIG5sY2MgPSAxOTtcbiAgICBmb3IgKDsgbmxjYyA+IDQgJiYgIWxjdFtjbGltW25sY2MgLSAxXV07IC0tbmxjYylcbiAgICAgICAgO1xuICAgIHZhciBmbGVuID0gKGJsICsgNSkgPDwgMztcbiAgICB2YXIgZnRsZW4gPSBjbGVuKGxmLCBmbHQpICsgY2xlbihkZiwgZmR0KSArIGViO1xuICAgIHZhciBkdGxlbiA9IGNsZW4obGYsIGRsdCkgKyBjbGVuKGRmLCBkZHQpICsgZWIgKyAxNCArIDMgKiBubGNjICsgY2xlbihsY2ZyZXEsIGxjdCkgKyAyICogbGNmcmVxWzE2XSArIDMgKiBsY2ZyZXFbMTddICsgNyAqIGxjZnJlcVsxOF07XG4gICAgaWYgKGJzID49IDAgJiYgZmxlbiA8PSBmdGxlbiAmJiBmbGVuIDw9IGR0bGVuKVxuICAgICAgICByZXR1cm4gd2ZibGsob3V0LCBwLCBkYXQuc3ViYXJyYXkoYnMsIGJzICsgYmwpKTtcbiAgICB2YXIgbG0sIGxsLCBkbSwgZGw7XG4gICAgd2JpdHMob3V0LCBwLCAxICsgKGR0bGVuIDwgZnRsZW4pKSwgcCArPSAyO1xuICAgIGlmIChkdGxlbiA8IGZ0bGVuKSB7XG4gICAgICAgIGxtID0gaE1hcChkbHQsIG1sYiwgMCksIGxsID0gZGx0LCBkbSA9IGhNYXAoZGR0LCBtZGIsIDApLCBkbCA9IGRkdDtcbiAgICAgICAgdmFyIGxsbSA9IGhNYXAobGN0LCBtbGNiLCAwKTtcbiAgICAgICAgd2JpdHMob3V0LCBwLCBubGMgLSAyNTcpO1xuICAgICAgICB3Yml0cyhvdXQsIHAgKyA1LCBuZGMgLSAxKTtcbiAgICAgICAgd2JpdHMob3V0LCBwICsgMTAsIG5sY2MgLSA0KTtcbiAgICAgICAgcCArPSAxNDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBubGNjOyArK2kpXG4gICAgICAgICAgICB3Yml0cyhvdXQsIHAgKyAzICogaSwgbGN0W2NsaW1baV1dKTtcbiAgICAgICAgcCArPSAzICogbmxjYztcbiAgICAgICAgdmFyIGxjdHMgPSBbbGNsdCwgbGNkdF07XG4gICAgICAgIGZvciAodmFyIGl0ID0gMDsgaXQgPCAyOyArK2l0KSB7XG4gICAgICAgICAgICB2YXIgY2xjdCA9IGxjdHNbaXRdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IGNsY3RbaV0gJiAzMTtcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIGxsbVtsZW5dKSwgcCArPSBsY3RbbGVuXTtcbiAgICAgICAgICAgICAgICBpZiAobGVuID4gMTUpXG4gICAgICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgKGNsY3RbaV0gPj4gNSkgJiAxMjcpLCBwICs9IGNsY3RbaV0gPj4gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxtID0gZmxtLCBsbCA9IGZsdCwgZG0gPSBmZG0sIGRsID0gZmR0O1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpOyArK2kpIHtcbiAgICAgICAgdmFyIHN5bSA9IHN5bXNbaV07XG4gICAgICAgIGlmIChzeW0gPiAyNTUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSAoc3ltID4+IDE4KSAmIDMxO1xuICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIGxtW2xlbiArIDI1N10pLCBwICs9IGxsW2xlbiArIDI1N107XG4gICAgICAgICAgICBpZiAobGVuID4gNylcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIChzeW0gPj4gMjMpICYgMzEpLCBwICs9IGZsZWJbbGVuXTtcbiAgICAgICAgICAgIHZhciBkc3QgPSBzeW0gJiAzMTtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBkbVtkc3RdKSwgcCArPSBkbFtkc3RdO1xuICAgICAgICAgICAgaWYgKGRzdCA+IDMpXG4gICAgICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIChzeW0gPj4gNSkgJiA4MTkxKSwgcCArPSBmZGViW2RzdF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgbG1bc3ltXSksIHAgKz0gbGxbc3ltXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3Yml0czE2KG91dCwgcCwgbG1bMjU2XSk7XG4gICAgcmV0dXJuIHAgKyBsbFsyNTZdO1xufTtcbi8vIGRlZmxhdGUgb3B0aW9ucyAobmljZSA8PCAxMykgfCBjaGFpblxudmFyIGRlbyA9IC8qI19fUFVSRV9fKi8gbmV3IGkzMihbNjU1NDAsIDEzMTA4MCwgMTMxMDg4LCAxMzExMDQsIDI2MjE3NiwgMTA0ODcwNCwgMTA0ODgzMiwgMjExNDU2MCwgMjExNzYzMl0pO1xuLy8gZW1wdHlcbnZhciBldCA9IC8qI19fUFVSRV9fKi8gbmV3IHU4KDApO1xuLy8gY29tcHJlc3NlcyBkYXRhIGludG8gYSByYXcgREVGTEFURSBidWZmZXJcbnZhciBkZmx0ID0gZnVuY3Rpb24gKGRhdCwgbHZsLCBwbHZsLCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgdmFyIHMgPSBzdC56IHx8IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBuZXcgdTgocHJlICsgcyArIDUgKiAoMSArIE1hdGguY2VpbChzIC8gNzAwMCkpICsgcG9zdCk7XG4gICAgLy8gd3JpdGluZyB0byB0aGlzIHdyaXRlcyB0byB0aGUgb3V0cHV0IGJ1ZmZlclxuICAgIHZhciB3ID0gby5zdWJhcnJheShwcmUsIG8ubGVuZ3RoIC0gcG9zdCk7XG4gICAgdmFyIGxzdCA9IHN0Lmw7XG4gICAgdmFyIHBvcyA9IChzdC5yIHx8IDApICYgNztcbiAgICBpZiAobHZsKSB7XG4gICAgICAgIGlmIChwb3MpXG4gICAgICAgICAgICB3WzBdID0gc3QuciA+PiAzO1xuICAgICAgICB2YXIgb3B0ID0gZGVvW2x2bCAtIDFdO1xuICAgICAgICB2YXIgbiA9IG9wdCA+PiAxMywgYyA9IG9wdCAmIDgxOTE7XG4gICAgICAgIHZhciBtc2tfMSA9ICgxIDw8IHBsdmwpIC0gMTtcbiAgICAgICAgLy8gICAgcHJldiAyLWJ5dGUgdmFsIG1hcCAgICBjdXJyIDItYnl0ZSB2YWwgbWFwXG4gICAgICAgIHZhciBwcmV2ID0gc3QucCB8fCBuZXcgdTE2KDMyNzY4KSwgaGVhZCA9IHN0LmggfHwgbmV3IHUxNihtc2tfMSArIDEpO1xuICAgICAgICB2YXIgYnMxXzEgPSBNYXRoLmNlaWwocGx2bCAvIDMpLCBiczJfMSA9IDIgKiBiczFfMTtcbiAgICAgICAgdmFyIGhzaCA9IGZ1bmN0aW9uIChpKSB7IHJldHVybiAoZGF0W2ldIF4gKGRhdFtpICsgMV0gPDwgYnMxXzEpIF4gKGRhdFtpICsgMl0gPDwgYnMyXzEpKSAmIG1za18xOyB9O1xuICAgICAgICAvLyAyNDU3NiBpcyBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIG1heGltdW0gc3ltYm9scyBwZXIgYmxvY2tcbiAgICAgICAgLy8gNDI0IGJ1ZmZlciBmb3IgbGFzdCBibG9ja1xuICAgICAgICB2YXIgc3ltcyA9IG5ldyBpMzIoMjUwMDApO1xuICAgICAgICAvLyBsZW5ndGgvbGl0ZXJhbCBmcmVxICAgZGlzdGFuY2UgZnJlcVxuICAgICAgICB2YXIgbGYgPSBuZXcgdTE2KDI4OCksIGRmID0gbmV3IHUxNigzMik7XG4gICAgICAgIC8vICBsL2xjbnQgIGV4Yml0cyAgaW5kZXggICAgICAgICAgbC9saW5kICB3YWl0ZHggICAgICAgICAgYmxrcG9zXG4gICAgICAgIHZhciBsY18xID0gMCwgZWIgPSAwLCBpID0gc3QuaSB8fCAwLCBsaSA9IDAsIHdpID0gc3QudyB8fCAwLCBicyA9IDA7XG4gICAgICAgIGZvciAoOyBpICsgMiA8IHM7ICsraSkge1xuICAgICAgICAgICAgLy8gaGFzaCB2YWx1ZVxuICAgICAgICAgICAgdmFyIGh2ID0gaHNoKGkpO1xuICAgICAgICAgICAgLy8gaW5kZXggbW9kIDMyNzY4ICAgIHByZXZpb3VzIGluZGV4IG1vZFxuICAgICAgICAgICAgdmFyIGltb2QgPSBpICYgMzI3NjcsIHBpbW9kID0gaGVhZFtodl07XG4gICAgICAgICAgICBwcmV2W2ltb2RdID0gcGltb2Q7XG4gICAgICAgICAgICBoZWFkW2h2XSA9IGltb2Q7XG4gICAgICAgICAgICAvLyBXZSBhbHdheXMgc2hvdWxkIG1vZGlmeSBoZWFkIGFuZCBwcmV2LCBidXQgb25seSBhZGQgc3ltYm9scyBpZlxuICAgICAgICAgICAgLy8gdGhpcyBkYXRhIGlzIG5vdCB5ZXQgcHJvY2Vzc2VkIChcIndhaXRcIiBmb3Igd2FpdCBpbmRleClcbiAgICAgICAgICAgIGlmICh3aSA8PSBpKSB7XG4gICAgICAgICAgICAgICAgLy8gYnl0ZXMgcmVtYWluaW5nXG4gICAgICAgICAgICAgICAgdmFyIHJlbSA9IHMgLSBpO1xuICAgICAgICAgICAgICAgIGlmICgobGNfMSA+IDcwMDAgfHwgbGkgPiAyNDU3NikgJiYgKHJlbSA+IDQyMyB8fCAhbHN0KSkge1xuICAgICAgICAgICAgICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgMCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGxpID0gbGNfMSA9IGViID0gMCwgYnMgPSBpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI4NjsgKytqKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGZbal0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDMwOyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBkZltqXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICBsZW4gICAgZGlzdCAgIGNoYWluXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAyLCBkID0gMCwgY2hfMSA9IGMsIGRpZiA9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgIGlmIChyZW0gPiAyICYmIGh2ID09IGhzaChpIC0gZGlmKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4biA9IE1hdGgubWluKG4sIHJlbSkgLSAxO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4ZCA9IE1hdGgubWluKDMyNzY3LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF4IHBvc3NpYmxlIGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyBub3QgY2FwcGVkIGF0IGRpZiBiZWNhdXNlIGRlY29tcHJlc3NvcnMgaW1wbGVtZW50IFwicm9sbGluZ1wiIGluZGV4IHBvcHVsYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1sID0gTWF0aC5taW4oMjU4LCByZW0pO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZGlmIDw9IG1heGQgJiYgLS1jaF8xICYmIGltb2QgIT0gcGltb2QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRbaSArIGxdID09IGRhdFtpICsgbCAtIGRpZl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmwgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyBubCA8IG1sICYmIGRhdFtpICsgbmxdID09IGRhdFtpICsgbmwgLSBkaWZdOyArK25sKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsID0gbmwsIGQgPSBkaWY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrIG91dCBlYXJseSB3aGVuIHdlIHJlYWNoIFwibmljZVwiICh3ZSBhcmUgc2F0aXNmaWVkIGVub3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbWF4bilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3csIGZpbmQgdGhlIHJhcmVzdCAyLWJ5dGUgc2VxdWVuY2Ugd2l0aGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGVuZ3RoIG9mIGxpdGVyYWxzIGFuZCBzZWFyY2ggZm9yIHRoYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTXVjaCBmYXN0ZXIgdGhhbiBqdXN0IHVzaW5nIHRoZSBzdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW1kID0gTWF0aC5taW4oZGlmLCBubCAtIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1tZDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGkgPSBpIC0gZGlmICsgaiAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB0aSA9IHByZXZbdGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNkID0gdGkgLSBwdGkgJiAzMjc2NztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZCA+IG1kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1kID0gY2QsIHBpbW9kID0gdGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0aGUgcHJldmlvdXMgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGltb2QgPSBwaW1vZCwgcGltb2QgPSBwcmV2W2ltb2RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlmICs9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGQgd2lsbCBiZSBub256ZXJvIG9ubHkgd2hlbiBhIG1hdGNoIHdhcyBmb3VuZFxuICAgICAgICAgICAgICAgIGlmIChkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIGJvdGggZGlzdCBhbmQgbGVuIGRhdGEgaW4gb25lIGludDMyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIHJlY29nbml6ZWQgYXMgYSBsZW4vZGlzdCB3aXRoIDI4dGggYml0ICgyXjI4KVxuICAgICAgICAgICAgICAgICAgICBzeW1zW2xpKytdID0gMjY4NDM1NDU2IHwgKHJldmZsW2xdIDw8IDE4KSB8IHJldmZkW2RdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGluID0gcmV2ZmxbbF0gJiAzMSwgZGluID0gcmV2ZmRbZF0gJiAzMTtcbiAgICAgICAgICAgICAgICAgICAgZWIgKz0gZmxlYltsaW5dICsgZmRlYltkaW5dO1xuICAgICAgICAgICAgICAgICAgICArK2xmWzI1NyArIGxpbl07XG4gICAgICAgICAgICAgICAgICAgICsrZGZbZGluXTtcbiAgICAgICAgICAgICAgICAgICAgd2kgPSBpICsgbDtcbiAgICAgICAgICAgICAgICAgICAgKytsY18xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3ltc1tsaSsrXSA9IGRhdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgKytsZltkYXRbaV1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSBNYXRoLm1heChpLCB3aSk7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIHN5bXNbbGkrK10gPSBkYXRbaV07XG4gICAgICAgICAgICArK2xmW2RhdFtpXV07XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gd2JsayhkYXQsIHcsIGxzdCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgIGlmICghbHN0KSB7XG4gICAgICAgICAgICBzdC5yID0gKHBvcyAmIDcpIHwgd1socG9zIC8gOCkgfCAwXSA8PCAzO1xuICAgICAgICAgICAgLy8gc2hmdChwb3MpIG5vdyAxIGxlc3MgaWYgcG9zICYgNyAhPSAwXG4gICAgICAgICAgICBwb3MgLT0gNztcbiAgICAgICAgICAgIHN0LmggPSBoZWFkLCBzdC5wID0gcHJldiwgc3QuaSA9IGksIHN0LncgPSB3aTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0LncgfHwgMDsgaSA8IHMgKyBsc3Q7IGkgKz0gNjU1MzUpIHtcbiAgICAgICAgICAgIC8vIGVuZFxuICAgICAgICAgICAgdmFyIGUgPSBpICsgNjU1MzU7XG4gICAgICAgICAgICBpZiAoZSA+PSBzKSB7XG4gICAgICAgICAgICAgICAgLy8gd3JpdGUgZmluYWwgYmxvY2tcbiAgICAgICAgICAgICAgICB3Wyhwb3MgLyA4KSB8IDBdID0gbHN0O1xuICAgICAgICAgICAgICAgIGUgPSBzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zID0gd2ZibGsodywgcG9zICsgMSwgZGF0LnN1YmFycmF5KGksIGUpKTtcbiAgICAgICAgfVxuICAgICAgICBzdC5pID0gcztcbiAgICB9XG4gICAgcmV0dXJuIHNsYyhvLCAwLCBwcmUgKyBzaGZ0KHBvcykgKyBwb3N0KTtcbn07XG4vLyBDUkMzMiB0YWJsZVxudmFyIGNyY3QgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSBuZXcgSW50MzJBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICAgICAgdmFyIGMgPSBpLCBrID0gOTtcbiAgICAgICAgd2hpbGUgKC0taylcbiAgICAgICAgICAgIGMgPSAoKGMgJiAxKSAmJiAtMzA2Njc0OTEyKSBeIChjID4+PiAxKTtcbiAgICAgICAgdFtpXSA9IGM7XG4gICAgfVxuICAgIHJldHVybiB0O1xufSkoKTtcbi8vIENSQzMyXG52YXIgY3JjID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjID0gLTE7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIC8vIGNsb3N1cmVzIGhhdmUgYXdmdWwgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIHZhciBjciA9IGM7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGQubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY3IgPSBjcmN0WyhjciAmIDI1NSkgXiBkW2ldXSBeIChjciA+Pj4gOCk7XG4gICAgICAgICAgICBjID0gY3I7XG4gICAgICAgIH0sXG4gICAgICAgIGQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIH5jOyB9XG4gICAgfTtcbn07XG4vLyBBZGxlcjMyXG52YXIgYWRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGEgPSAxLCBiID0gMDtcbiAgICByZXR1cm4ge1xuICAgICAgICBwOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgLy8gY2xvc3VyZXMgaGF2ZSBhd2Z1bCBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgdmFyIG4gPSBhLCBtID0gYjtcbiAgICAgICAgICAgIHZhciBsID0gZC5sZW5ndGggfCAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgIT0gbDspIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IE1hdGgubWluKGkgKyAyNjU1LCBsKTtcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IGU7ICsraSlcbiAgICAgICAgICAgICAgICAgICAgbSArPSBuICs9IGRbaV07XG4gICAgICAgICAgICAgICAgbiA9IChuICYgNjU1MzUpICsgMTUgKiAobiA+PiAxNiksIG0gPSAobSAmIDY1NTM1KSArIDE1ICogKG0gPj4gMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IG4sIGIgPSBtO1xuICAgICAgICB9LFxuICAgICAgICBkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhICU9IDY1NTIxLCBiICU9IDY1NTIxO1xuICAgICAgICAgICAgcmV0dXJuIChhICYgMjU1KSA8PCAyNCB8IChhICYgMHhGRjAwKSA8PCA4IHwgKGIgJiAyNTUpIDw8IDggfCAoYiA+PiA4KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuO1xuLy8gZGVmbGF0ZSB3aXRoIG9wdHNcbnZhciBkb3B0ID0gZnVuY3Rpb24gKGRhdCwgb3B0LCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgaWYgKCFzdCkge1xuICAgICAgICBzdCA9IHsgbDogMSB9O1xuICAgICAgICBpZiAob3B0LmRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciBkaWN0ID0gb3B0LmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgICAgIHZhciBuZXdEYXQgPSBuZXcgdTgoZGljdC5sZW5ndGggKyBkYXQubGVuZ3RoKTtcbiAgICAgICAgICAgIG5ld0RhdC5zZXQoZGljdCk7XG4gICAgICAgICAgICBuZXdEYXQuc2V0KGRhdCwgZGljdC5sZW5ndGgpO1xuICAgICAgICAgICAgZGF0ID0gbmV3RGF0O1xuICAgICAgICAgICAgc3QudyA9IGRpY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZmx0KGRhdCwgb3B0LmxldmVsID09IG51bGwgPyA2IDogb3B0LmxldmVsLCBvcHQubWVtID09IG51bGwgPyAoc3QubCA/IE1hdGguY2VpbChNYXRoLm1heCg4LCBNYXRoLm1pbigxMywgTWF0aC5sb2coZGF0Lmxlbmd0aCkpKSAqIDEuNSkgOiAyMCkgOiAoMTIgKyBvcHQubWVtKSwgcHJlLCBwb3N0LCBzdCk7XG59O1xuLy8gV2FsbWFydCBvYmplY3Qgc3ByZWFkXG52YXIgbXJnID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIGZvciAodmFyIGsgaW4gYSlcbiAgICAgICAgb1trXSA9IGFba107XG4gICAgZm9yICh2YXIgayBpbiBiKVxuICAgICAgICBvW2tdID0gYltrXTtcbiAgICByZXR1cm4gbztcbn07XG4vLyB3b3JrZXIgY2xvbmVcbi8vIFRoaXMgaXMgcG9zc2libHkgdGhlIGNyYXppZXN0IHBhcnQgb2YgdGhlIGVudGlyZSBjb2RlYmFzZSwgZGVzcGl0ZSBob3cgc2ltcGxlIGl0IG1heSBzZWVtLlxuLy8gVGhlIG9ubHkgcGFyYW1ldGVyIHRvIHRoaXMgZnVuY3Rpb24gaXMgYSBjbG9zdXJlIHRoYXQgcmV0dXJucyBhbiBhcnJheSBvZiB2YXJpYWJsZXMgb3V0c2lkZSBvZiB0aGUgZnVuY3Rpb24gc2NvcGUuXG4vLyBXZSdyZSBnb2luZyB0byB0cnkgdG8gZmlndXJlIG91dCB0aGUgdmFyaWFibGUgbmFtZXMgdXNlZCBpbiB0aGUgY2xvc3VyZSBhcyBzdHJpbmdzIGJlY2F1c2UgdGhhdCBpcyBjcnVjaWFsIGZvciB3b3JrZXJpemF0aW9uLlxuLy8gV2Ugd2lsbCByZXR1cm4gYW4gb2JqZWN0IG1hcHBpbmcgb2YgdHJ1ZSB2YXJpYWJsZSBuYW1lIHRvIHZhbHVlIChiYXNpY2FsbHksIHRoZSBjdXJyZW50IHNjb3BlIGFzIGEgSlMgb2JqZWN0KS5cbi8vIFRoZSByZWFzb24gd2UgY2FuJ3QganVzdCB1c2UgdGhlIG9yaWdpbmFsIHZhcmlhYmxlIG5hbWVzIGlzIG1pbmlmaWVycyBtYW5nbGluZyB0aGUgdG9wbGV2ZWwgc2NvcGUuXG4vLyBUaGlzIHRvb2sgbWUgdGhyZWUgd2Vla3MgdG8gZmlndXJlIG91dCBob3cgdG8gZG8uXG52YXIgd2NsbiA9IGZ1bmN0aW9uIChmbiwgZm5TdHIsIHRkKSB7XG4gICAgdmFyIGR0ID0gZm4oKTtcbiAgICB2YXIgc3QgPSBmbi50b1N0cmluZygpO1xuICAgIHZhciBrcyA9IHN0LnNsaWNlKHN0LmluZGV4T2YoJ1snKSArIDEsIHN0Lmxhc3RJbmRleE9mKCddJykpLnJlcGxhY2UoL1xccysvZywgJycpLnNwbGl0KCcsJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgdiA9IGR0W2ldLCBrID0ga3NbaV07XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBmblN0ciArPSAnOycgKyBrICsgJz0nO1xuICAgICAgICAgICAgdmFyIHN0XzEgPSB2LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAodi5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgZ2xvYmFsIG9iamVjdHNcbiAgICAgICAgICAgICAgICBpZiAoc3RfMS5pbmRleE9mKCdbbmF0aXZlIGNvZGVdJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwSW5kID0gc3RfMS5pbmRleE9mKCcgJywgOCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICBmblN0ciArPSBzdF8xLnNsaWNlKHNwSW5kLCBzdF8xLmluZGV4T2YoJygnLCBzcEluZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm5TdHIgKz0gc3RfMTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgdCBpbiB2LnByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuU3RyICs9ICc7JyArIGsgKyAnLnByb3RvdHlwZS4nICsgdCArICc9JyArIHYucHJvdG90eXBlW3RdLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZuU3RyICs9IHN0XzE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGRba10gPSB2O1xuICAgIH1cbiAgICByZXR1cm4gZm5TdHI7XG59O1xudmFyIGNoID0gW107XG4vLyBjbG9uZSBidWZzXG52YXIgY2JmcyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIHRsID0gW107XG4gICAgZm9yICh2YXIgayBpbiB2KSB7XG4gICAgICAgIGlmICh2W2tdLmJ1ZmZlcikge1xuICAgICAgICAgICAgdGwucHVzaCgodltrXSA9IG5ldyB2W2tdLmNvbnN0cnVjdG9yKHZba10pKS5idWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bDtcbn07XG4vLyB1c2UgYSB3b3JrZXIgdG8gZXhlY3V0ZSBjb2RlXG52YXIgd3JrciA9IGZ1bmN0aW9uIChmbnMsIGluaXQsIGlkLCBjYikge1xuICAgIGlmICghY2hbaWRdKSB7XG4gICAgICAgIHZhciBmblN0ciA9ICcnLCB0ZF8xID0ge30sIG0gPSBmbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtOyArK2kpXG4gICAgICAgICAgICBmblN0ciA9IHdjbG4oZm5zW2ldLCBmblN0ciwgdGRfMSk7XG4gICAgICAgIGNoW2lkXSA9IHsgYzogd2NsbihmbnNbbV0sIGZuU3RyLCB0ZF8xKSwgZTogdGRfMSB9O1xuICAgIH1cbiAgICB2YXIgdGQgPSBtcmcoe30sIGNoW2lkXS5lKTtcbiAgICByZXR1cm4gd2soY2hbaWRdLmMgKyAnO29ubWVzc2FnZT1mdW5jdGlvbihlKXtmb3IodmFyIGsgaW4gZS5kYXRhKXNlbGZba109ZS5kYXRhW2tdO29ubWVzc2FnZT0nICsgaW5pdC50b1N0cmluZygpICsgJ30nLCBpZCwgdGQsIGNiZnModGQpLCBjYik7XG59O1xuLy8gYmFzZSBhc3luYyBpbmZsYXRlIGZuXG52YXIgYkluZmx0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3U4LCB1MTYsIGkzMiwgZmxlYiwgZmRlYiwgY2xpbSwgZmwsIGZkLCBmbHJtLCBmZHJtLCByZXYsIGVjLCBoTWFwLCBtYXgsIGJpdHMsIGJpdHMxNiwgc2hmdCwgc2xjLCBlcnIsIGluZmx0LCBpbmZsYXRlU3luYywgcGJmLCBnb3B0XTsgfTtcbnZhciBiRGZsdCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1OCwgdTE2LCBpMzIsIGZsZWIsIGZkZWIsIGNsaW0sIHJldmZsLCByZXZmZCwgZmxtLCBmbHQsIGZkbSwgZmR0LCByZXYsIGRlbywgZXQsIGhNYXAsIHdiaXRzLCB3Yml0czE2LCBoVHJlZSwgbG4sIGxjLCBjbGVuLCB3ZmJsaywgd2Jsaywgc2hmdCwgc2xjLCBkZmx0LCBkb3B0LCBkZWZsYXRlU3luYywgcGJmXTsgfTtcbi8vIGd6aXAgZXh0cmFcbnZhciBnemUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3poLCBnemhsLCB3Ynl0ZXMsIGNyYywgY3JjdF07IH07XG4vLyBndW56aXAgZXh0cmFcbnZhciBndXplID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6cywgZ3psXTsgfTtcbi8vIHpsaWIgZXh0cmFcbnZhciB6bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxoLCB3Ynl0ZXMsIGFkbGVyXTsgfTtcbi8vIHVuemxpYiBleHRyYVxudmFyIHp1bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxzXTsgfTtcbi8vIHBvc3QgYnVmXG52YXIgcGJmID0gZnVuY3Rpb24gKG1zZykgeyByZXR1cm4gcG9zdE1lc3NhZ2UobXNnLCBbbXNnLmJ1ZmZlcl0pOyB9O1xuLy8gZ2V0IG9wdHNcbnZhciBnb3B0ID0gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYge1xuICAgIG91dDogby5zaXplICYmIG5ldyB1OChvLnNpemUpLFxuICAgIGRpY3Rpb25hcnk6IG8uZGljdGlvbmFyeVxufTsgfTtcbi8vIGFzeW5jIGhlbHBlclxudmFyIGNiaWZ5ID0gZnVuY3Rpb24gKGRhdCwgb3B0cywgZm5zLCBpbml0LCBpZCwgY2IpIHtcbiAgICB2YXIgdyA9IHdya3IoZm5zLCBpbml0LCBpZCwgZnVuY3Rpb24gKGVyciwgZGF0KSB7XG4gICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgIGNiKGVyciwgZGF0KTtcbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKFtkYXQsIG9wdHNdLCBvcHRzLmNvbnN1bWUgPyBbZGF0LmJ1ZmZlcl0gOiBbXSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbn07XG4vLyBhdXRvIHN0cmVhbVxudmFyIGFzdHJtID0gZnVuY3Rpb24gKHN0cm0pIHtcbiAgICBzdHJtLm9uZGF0YSA9IGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7IHJldHVybiBwb3N0TWVzc2FnZShbZGF0LCBmaW5hbF0sIFtkYXQuYnVmZmVyXSk7IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldikge1xuICAgICAgICBpZiAoZXYuZGF0YVswXSkge1xuICAgICAgICAgICAgc3RybS5wdXNoKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pO1xuICAgICAgICAgICAgcG9zdE1lc3NhZ2UoW2V2LmRhdGFbMF0ubGVuZ3RoXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3RybS5mbHVzaChldi5kYXRhWzFdKTtcbiAgICB9O1xufTtcbi8vIGFzeW5jIHN0cmVhbSBhdHRhY2hcbnZhciBhc3RybWlmeSA9IGZ1bmN0aW9uIChmbnMsIHN0cm0sIG9wdHMsIGluaXQsIGlkLCBmbHVzaCwgZXh0KSB7XG4gICAgdmFyIHQ7XG4gICAgdmFyIHcgPSB3cmtyKGZucywgaW5pdCwgaWQsIGZ1bmN0aW9uIChlcnIsIGRhdCkge1xuICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgdy50ZXJtaW5hdGUoKSwgc3RybS5vbmRhdGEuY2FsbChzdHJtLCBlcnIpO1xuICAgICAgICBlbHNlIGlmICghQXJyYXkuaXNBcnJheShkYXQpKVxuICAgICAgICAgICAgZXh0KGRhdCk7XG4gICAgICAgIGVsc2UgaWYgKGRhdC5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgc3RybS5xdWV1ZWRTaXplIC09IGRhdFswXTtcbiAgICAgICAgICAgIGlmIChzdHJtLm9uZHJhaW4pXG4gICAgICAgICAgICAgICAgc3RybS5vbmRyYWluKGRhdFswXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGF0WzFdKVxuICAgICAgICAgICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgICAgICBzdHJtLm9uZGF0YS5jYWxsKHN0cm0sIGVyciwgZGF0WzBdLCBkYXRbMV0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdy5wb3N0TWVzc2FnZShvcHRzKTtcbiAgICBzdHJtLnF1ZXVlZFNpemUgPSAwO1xuICAgIHN0cm0ucHVzaCA9IGZ1bmN0aW9uIChkLCBmKSB7XG4gICAgICAgIGlmICghc3RybS5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0KVxuICAgICAgICAgICAgc3RybS5vbmRhdGEoZXJyKDQsIDAsIDEpLCBudWxsLCAhIWYpO1xuICAgICAgICBzdHJtLnF1ZXVlZFNpemUgKz0gZC5sZW5ndGg7XG4gICAgICAgIC8vIGNhbiBmYWlsIGZvciBjcm9zcy1yZWFsbSBVaW50OEFycmF5LCBidXQgb2sgLSBvbmx5IGEgc21hbGwgcGVyZm9ybWFuY2UgcGVuYWx0eVxuICAgICAgICB3LnBvc3RNZXNzYWdlKFtkLCB0ID0gZl0sIGQuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPyBbZC5idWZmZXJdIDogW10pO1xuICAgIH07XG4gICAgc3RybS50ZXJtaW5hdGUgPSBmdW5jdGlvbiAoKSB7IHcudGVybWluYXRlKCk7IH07XG4gICAgaWYgKGZsdXNoKSB7XG4gICAgICAgIHN0cm0uZmx1c2ggPSBmdW5jdGlvbiAoc3luYykgeyB3LnBvc3RNZXNzYWdlKFswLCBzeW5jXSk7IH07XG4gICAgfVxufTtcbi8vIHJlYWQgMiBieXRlc1xudmFyIGIyID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGRbYl0gfCAoZFtiICsgMV0gPDwgOCk7IH07XG4vLyByZWFkIDQgYnl0ZXNcbnZhciBiNCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiAoZFtiXSB8IChkW2IgKyAxXSA8PCA4KSB8IChkW2IgKyAyXSA8PCAxNikgfCAoZFtiICsgM10gPDwgMjQpKSA+Pj4gMDsgfTtcbi8vIHJlYWQgOCBieXRlc1xudmFyIGI4ID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGI0KGQsIGIpICsgKGI0KGQsIGIgKyA0KSAqIDQyOTQ5NjcyOTYpOyB9O1xuLy8gd3JpdGUgYnl0ZXNcbnZhciB3Ynl0ZXMgPSBmdW5jdGlvbiAoZCwgYiwgdikge1xuICAgIGZvciAoOyB2OyArK2IpXG4gICAgICAgIGRbYl0gPSB2LCB2ID4+Pj0gODtcbn07XG4vLyBnemlwIGhlYWRlclxudmFyIGd6aCA9IGZ1bmN0aW9uIChjLCBvKSB7XG4gICAgdmFyIGZuID0gby5maWxlbmFtZTtcbiAgICBjWzBdID0gMzEsIGNbMV0gPSAxMzksIGNbMl0gPSA4LCBjWzhdID0gby5sZXZlbCA8IDIgPyA0IDogby5sZXZlbCA9PSA5ID8gMiA6IDAsIGNbOV0gPSAzOyAvLyBhc3N1bWUgVW5peFxuICAgIGlmIChvLm10aW1lICE9IDApXG4gICAgICAgIHdieXRlcyhjLCA0LCBNYXRoLmZsb29yKG5ldyBEYXRlKG8ubXRpbWUgfHwgRGF0ZS5ub3coKSkgLyAxMDAwKSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICAgIGNbM10gPSA4O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmbi5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNbaSArIDEwXSA9IGZuLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxufTtcbi8vIGd6aXAgZm9vdGVyOiAtOCB0byAtNCA9IENSQywgLTQgdG8gLTAgaXMgbGVuZ3RoXG4vLyBnemlwIHN0YXJ0XG52YXIgZ3pzID0gZnVuY3Rpb24gKGQpIHtcbiAgICBpZiAoZFswXSAhPSAzMSB8fCBkWzFdICE9IDEzOSB8fCBkWzJdICE9IDgpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCBnemlwIGRhdGEnKTtcbiAgICB2YXIgZmxnID0gZFszXTtcbiAgICB2YXIgc3QgPSAxMDtcbiAgICBpZiAoZmxnICYgNClcbiAgICAgICAgc3QgKz0gKGRbMTBdIHwgZFsxMV0gPDwgOCkgKyAyO1xuICAgIGZvciAodmFyIHpzID0gKGZsZyA+PiAzICYgMSkgKyAoZmxnID4+IDQgJiAxKTsgenMgPiAwOyB6cyAtPSAhZFtzdCsrXSlcbiAgICAgICAgO1xuICAgIHJldHVybiBzdCArIChmbGcgJiAyKTtcbn07XG4vLyBnemlwIGxlbmd0aFxudmFyIGd6bCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgdmFyIGwgPSBkLmxlbmd0aDtcbiAgICByZXR1cm4gKGRbbCAtIDRdIHwgZFtsIC0gM10gPDwgOCB8IGRbbCAtIDJdIDw8IDE2IHwgZFtsIC0gMV0gPDwgMjQpID4+PiAwO1xufTtcbi8vIGd6aXAgaGVhZGVyIGxlbmd0aFxudmFyIGd6aGwgPSBmdW5jdGlvbiAobykgeyByZXR1cm4gMTAgKyAoby5maWxlbmFtZSA/IG8uZmlsZW5hbWUubGVuZ3RoICsgMSA6IDApOyB9O1xuLy8gemxpYiBoZWFkZXJcbnZhciB6bGggPSBmdW5jdGlvbiAoYywgbykge1xuICAgIHZhciBsdiA9IG8ubGV2ZWwsIGZsID0gbHYgPT0gMCA/IDAgOiBsdiA8IDYgPyAxIDogbHYgPT0gOSA/IDMgOiAyO1xuICAgIGNbMF0gPSAxMjAsIGNbMV0gPSAoZmwgPDwgNikgfCAoby5kaWN0aW9uYXJ5ICYmIDMyKTtcbiAgICBjWzFdIHw9IDMxIC0gKChjWzBdIDw8IDgpIHwgY1sxXSkgJSAzMTtcbiAgICBpZiAoby5kaWN0aW9uYXJ5KSB7XG4gICAgICAgIHZhciBoID0gYWRsZXIoKTtcbiAgICAgICAgaC5wKG8uZGljdGlvbmFyeSk7XG4gICAgICAgIHdieXRlcyhjLCAyLCBoLmQoKSk7XG4gICAgfVxufTtcbi8vIHpsaWIgc3RhcnRcbnZhciB6bHMgPSBmdW5jdGlvbiAoZCwgZGljdCkge1xuICAgIGlmICgoZFswXSAmIDE1KSAhPSA4IHx8IChkWzBdID4+IDQpID4gNyB8fCAoKGRbMF0gPDwgOCB8IGRbMV0pICUgMzEpKVxuICAgICAgICBlcnIoNiwgJ2ludmFsaWQgemxpYiBkYXRhJyk7XG4gICAgaWYgKChkWzFdID4+IDUgJiAxKSA9PSArIWRpY3QpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCB6bGliIGRhdGE6ICcgKyAoZFsxXSAmIDMyID8gJ25lZWQnIDogJ3VuZXhwZWN0ZWQnKSArICcgZGljdGlvbmFyeScpO1xuICAgIHJldHVybiAoZFsxXSA+PiAzICYgNCkgKyAyO1xufTtcbmZ1bmN0aW9uIFN0cm1PcHQob3B0cywgY2IpIHtcbiAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICByZXR1cm4gb3B0cztcbn1cbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb25cbiAqL1xudmFyIERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRGVmbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB0aGlzLm8gPSBvcHRzIHx8IHt9O1xuICAgICAgICB0aGlzLnMgPSB7IGw6IDAsIGk6IDMyNzY4LCB3OiAzMjc2OCwgejogMzI3NjggfTtcbiAgICAgICAgLy8gQnVmZmVyIGxlbmd0aCBtdXN0IGFsd2F5cyBiZSAwIG1vZCAzMjc2OCBmb3IgaW5kZXggY2FsY3VsYXRpb25zIHRvIGJlIGNvcnJlY3Qgd2hlbiBtb2RpZnlpbmcgaGVhZCBhbmQgcHJldlxuICAgICAgICAvLyA5ODMwNCA9IDMyNzY4IChsb29rYmFjaykgKyA2NTUzNiAoY29tbW9uIGNodW5rIHNpemUpXG4gICAgICAgIHRoaXMuYiA9IG5ldyB1OCg5ODMwNCk7XG4gICAgICAgIGlmICh0aGlzLm8uZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIGRpY3QgPSB0aGlzLm8uZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpO1xuICAgICAgICAgICAgdGhpcy5iLnNldChkaWN0LCAzMjc2OCAtIGRpY3QubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMucy5pID0gMzI3NjggLSBkaWN0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBEZWZsYXRlLnByb3RvdHlwZS5wID0gZnVuY3Rpb24gKGMsIGYpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEoZG9wdChjLCB0aGlzLm8sIDAsIDAsIHRoaXMucyksIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVmbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVmbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMucy5sKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICB2YXIgZW5kTGVuID0gY2h1bmsubGVuZ3RoICsgdGhpcy5zLno7XG4gICAgICAgIGlmIChlbmRMZW4gPiB0aGlzLmIubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoZW5kTGVuID4gMiAqIHRoaXMuYi5sZW5ndGggLSAzMjc2OCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdCdWYgPSBuZXcgdTgoZW5kTGVuICYgLTMyNzY4KTtcbiAgICAgICAgICAgICAgICBuZXdCdWYuc2V0KHRoaXMuYi5zdWJhcnJheSgwLCB0aGlzLnMueikpO1xuICAgICAgICAgICAgICAgIHRoaXMuYiA9IG5ld0J1ZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHRoaXMuYi5sZW5ndGggLSB0aGlzLnMuejtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoY2h1bmsuc3ViYXJyYXkoMCwgc3BsaXQpLCB0aGlzLnMueik7XG4gICAgICAgICAgICB0aGlzLnMueiA9IHRoaXMuYi5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnAodGhpcy5iLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KHRoaXMuYi5zdWJhcnJheSgtMzI3NjgpKTtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoY2h1bmsuc3ViYXJyYXkoc3BsaXQpLCAzMjc2OCk7XG4gICAgICAgICAgICB0aGlzLnMueiA9IGNodW5rLmxlbmd0aCAtIHNwbGl0ICsgMzI3Njg7XG4gICAgICAgICAgICB0aGlzLnMuaSA9IDMyNzY2LCB0aGlzLnMudyA9IDMyNzY4O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iLnNldChjaHVuaywgdGhpcy5zLnopO1xuICAgICAgICAgICAgdGhpcy5zLnogKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucy5sID0gZmluYWwgJiAxO1xuICAgICAgICBpZiAodGhpcy5zLnogPiB0aGlzLnMudyArIDgxOTEgfHwgZmluYWwpIHtcbiAgICAgICAgICAgIHRoaXMucCh0aGlzLmIsIGZpbmFsIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucy53ID0gdGhpcy5zLmksIHRoaXMucy5pIC09IDI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAvLyBjbGVhbnVwIHVubmVlZGVkIGJ1ZmZlcnMvc3RhdGUgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgdGhpcy5zID0gdGhpcy5vID0ge307XG4gICAgICAgICAgICB0aGlzLmIgPSBldDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIGRlZmxhdGVkIG91dHB1dCBmb3Igc21hbGwgaW5wdXRzLlxuICAgICAqIEBwYXJhbSBzeW5jIFdoZXRoZXIgdG8gZmx1c2ggdG8gYSBieXRlIGJvdW5kYXJ5LiBBIHN5bmMgZmx1c2ggdGFrZXMgNC01XG4gICAgICogICAgICAgICAgICAgZXh0cmEgYnl0ZXMsIGJ1dCBndWFyYW50ZWVzIGFsbCBwdXNoZWQgZGF0YSBpcyBpbW1lZGlhdGVseVxuICAgICAqICAgICAgICAgICAgIGRlY29tcHJlc3NpYmxlLiBBIHNlcGFyYXRlIERFRkxBVEUgc3RyZWFtIG1heSBiZSBjb25jYXRlbmF0ZWRcbiAgICAgKiAgICAgICAgICAgICB3aXRoIHRoZSBjdXJyZW50IG91dHB1dCBhZnRlciBhIHN5bmMgZmx1c2guXG4gICAgICovXG4gICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAodGhpcy5zLmwpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHRoaXMucCh0aGlzLmIsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5zLncgPSB0aGlzLnMuaSwgdGhpcy5zLmkgLT0gMjtcbiAgICAgICAgLy8gY291bGQgdGVjaG5pY2FsbHkgc2tpcCB3cml0aW5nIHRoZSB0eXBlLTAgYmxvY2sgZm9yICh0aGlzLnMuciAmIDcpID09IDAsXG4gICAgICAgIC8vIGJ1dCB0aGUgZGV0ZXJtaW5pc3RpYyB0cmFpbGVyICgwMCAwMCBGRiBGRikgaXMgdXNlZnVsIGluIHNvbWUgc2l0dWF0aW9uc1xuICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgdmFyIGMgPSBuZXcgdTgoNik7XG4gICAgICAgICAgICBjWzBdID0gdGhpcy5zLnIgPj4gMztcbiAgICAgICAgICAgIC8vIHdyaXRlIGVtcHR5LCBub24tZmluYWwgdHlwZS0wIGJsb2NrXG4gICAgICAgICAgICB2YXIgZXAgPSB3ZmJsayhjLCB0aGlzLnMuciwgZXQpO1xuICAgICAgICAgICAgdGhpcy5zLnIgPSAwO1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoYy5zdWJhcnJheSgwLCBlcCA+PiAzKSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBEZWZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jRGVmbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiRGZsdCxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgRGVmbGF0ZV07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBEZWZsYXRlKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDYsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jRGVmbGF0ZSB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmxhdGUoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiRGZsdCxcbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihkZWZsYXRlU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDAsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3NlcyBkYXRhIHdpdGggREVGTEFURSB3aXRob3V0IGFueSB3cmFwcGVyXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWZsYXRlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZsYXRlU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIGRvcHQoZGF0YSwgb3B0cyB8fCB7fSwgMCwgMCk7XG59XG4vKipcbiAqIFN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSW5mbGF0ZShvcHRzLCBjYikge1xuICAgICAgICAvLyBubyBTdHJtT3B0IGhlcmUgdG8gYXZvaWQgYWRkaW5nIHRvIHdvcmtlcml6ZXJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRzID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICAgICAgdmFyIGRpY3QgPSBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSAmJiBvcHRzLmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgdGhpcy5zID0geyBpOiAwLCBiOiBkaWN0ID8gZGljdC5sZW5ndGggOiAwIH07XG4gICAgICAgIHRoaXMubyA9IG5ldyB1OCgzMjc2OCk7XG4gICAgICAgIHRoaXMucCA9IG5ldyB1OCgwKTtcbiAgICAgICAgaWYgKGRpY3QpXG4gICAgICAgICAgICB0aGlzLm8uc2V0KGRpY3QpO1xuICAgIH1cbiAgICBJbmZsYXRlLnByb3RvdHlwZS5lID0gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgaWYgKCF0aGlzLnAubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5wID0gYztcbiAgICAgICAgZWxzZSBpZiAoYy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjLmxlbmd0aCk7XG4gICAgICAgICAgICBuLnNldCh0aGlzLnApLCBuLnNldChjLCB0aGlzLnAubGVuZ3RoKSwgdGhpcy5wID0gbjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSW5mbGF0ZS5wcm90b3R5cGUuYyA9IGZ1bmN0aW9uIChmaW5hbCkge1xuICAgICAgICB0aGlzLnMuaSA9ICsodGhpcy5kID0gZmluYWwgfHwgZmFsc2UpO1xuICAgICAgICB2YXIgYnRzID0gdGhpcy5zLmI7XG4gICAgICAgIHZhciBkdCA9IGluZmx0KHRoaXMucCwgdGhpcy5zLCB0aGlzLm8pO1xuICAgICAgICB0aGlzLm9uZGF0YShzbGMoZHQsIGJ0cywgdGhpcy5zLmIpLCB0aGlzLmQpO1xuICAgICAgICB0aGlzLm8gPSBzbGMoZHQsIHRoaXMucy5iIC0gMzI3NjgpLCB0aGlzLnMuYiA9IHRoaXMuby5sZW5ndGg7XG4gICAgICAgIHRoaXMucCA9IHNsYyh0aGlzLnAsICh0aGlzLnMucCAvIDgpIHwgMCksIHRoaXMucy5wICY9IDc7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBpbmZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGZpbmFsIGNodW5rXG4gICAgICovXG4gICAgSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5lKGNodW5rKSwgdGhpcy5jKGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEluZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0luZmxhdGUob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBJbmZsYXRlXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEluZmxhdGUoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgNywgMCk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0luZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNJbmZsYXRlIH07XG5leHBvcnQgZnVuY3Rpb24gaW5mbGF0ZShkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdFxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGluZmxhdGVTeW5jKGV2LmRhdGFbMF0sIGdvcHQoZXYuZGF0YVsxXSkpKTsgfSwgMSwgY2IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGVTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YSwgeyBpOiAyIH0sIG9wdHMgJiYgb3B0cy5vdXQsIG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5KTtcbn1cbi8vIGJlZm9yZSB5b3UgeWVsbCBhdCBtZSBmb3Igbm90IGp1c3QgdXNpbmcgZXh0ZW5kcywgbXkgcmVhc29uIGlzIHRoYXQgVFMgaW5oZXJpdGFuY2UgaXMgaGFyZCB0byB3b3JrZXJpemUuXG4vKipcbiAqIFN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBHemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEd6aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gY3JjKCk7XG4gICAgICAgIHRoaXMubCA9IDA7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdaSVBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgR3ppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICB0aGlzLmwgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIEd6aXAucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiBnemhsKHRoaXMubyksIGYgJiYgOCwgdGhpcy5zKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIGd6aChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDgsIHRoaXMuYy5kKCkpLCB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5sKTtcbiAgICAgICAgdGhpcy5vbmRhdGEocmF3LCBmKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEZsdXNoZXMgYnVmZmVyZWQgdW5jb21wcmVzc2VkIGRhdGEuIFVzZWZ1bCB0byBpbW1lZGlhdGVseSByZXRyaWV2ZSB0aGVcbiAgICAgKiBHWklQcGVkIG91dHB1dCBmb3Igc21hbGwgaW5wdXRzLlxuICAgICAqIEBwYXJhbSBzeW5jIFdoZXRoZXIgdG8gZmx1c2ggdG8gYSBieXRlIGJvdW5kYXJ5LiBBIHN5bmMgZmx1c2ggdGFrZXMgNC01XG4gICAgICogICAgICAgICAgICAgZXh0cmEgYnl0ZXMsIGJ1dCBndWFyYW50ZWVzIGFsbCBwdXNoZWQgZGF0YSBpcyBpbW1lZGlhdGVseVxuICAgICAqICAgICAgICAgICAgIGRlY29tcHJlc3NpYmxlLlxuICAgICAqL1xuICAgIEd6aXAucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKHN5bmMpIHtcbiAgICAgICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2guY2FsbCh0aGlzLCBzeW5jKTtcbiAgICB9O1xuICAgIHJldHVybiBHemlwO1xufSgpKTtcbmV4cG9ydCB7IEd6aXAgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0d6aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNHemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgZ3plLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlLCBHemlwXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEd6aXAoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgOCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0d6aXA7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNHemlwIH07XG5leHBvcnQgZnVuY3Rpb24gZ3ppcChkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICBnemUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtnemlwU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihnemlwU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDIsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3NlcyBkYXRhIHdpdGggR1pJUFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZ3ppcHBlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGMgPSBjcmMoKSwgbCA9IGRhdGEubGVuZ3RoO1xuICAgIGMucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgZ3pobChvcHRzKSwgOCksIHMgPSBkLmxlbmd0aDtcbiAgICByZXR1cm4gZ3poKGQsIG9wdHMpLCB3Ynl0ZXMoZCwgcyAtIDgsIGMuZCgpKSwgd2J5dGVzKGQsIHMgLSA0LCBsKSwgZDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIHNpbmdsZSBvciBtdWx0aS1tZW1iZXIgR1pJUCBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBHdW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gR3VuemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIHRoaXMuciA9IDA7XG4gICAgICAgIEluZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdVTlpJUHBlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBHdW56aXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmUuY2FsbCh0aGlzLCBjaHVuayk7XG4gICAgICAgIHRoaXMuciArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLnYpIHtcbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5wLnN1YmFycmF5KHRoaXMudiAtIDEpO1xuICAgICAgICAgICAgdmFyIHMgPSBwLmxlbmd0aCA+IDMgPyBnenMocCkgOiA0O1xuICAgICAgICAgICAgaWYgKHMgPiBwLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICghZmluYWwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudiA+IDEgJiYgdGhpcy5vbm1lbWJlcikge1xuICAgICAgICAgICAgICAgIHRoaXMub25tZW1iZXIodGhpcy5yIC0gcC5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wID0gcC5zdWJhcnJheShzKSwgdGhpcy52ID0gMDtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWNlc3NhcnkgdG8gcHJldmVudCBUUyBmcm9tIHVzaW5nIHRoZSBjbG9zdXJlIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB3b3JrZXJpemF0aW9uIHRvIGZ1bmN0aW9uIGNvcnJlY3RseVxuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5jLmNhbGwodGhpcywgMCk7XG4gICAgICAgIC8vIHByb2Nlc3MgY29uY2F0ZW5hdGVkIEdaSVBcbiAgICAgICAgaWYgKHRoaXMucy5mICYmICF0aGlzLnMubCkge1xuICAgICAgICAgICAgdGhpcy52ID0gc2hmdCh0aGlzLnMucCkgKyA5O1xuICAgICAgICAgICAgdGhpcy5zID0geyBpOiAwIH07XG4gICAgICAgICAgICB0aGlzLm8gPSBuZXcgdTgoMCk7XG4gICAgICAgICAgICB0aGlzLnB1c2gobmV3IHU4KDApLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBHdW56aXA7XG59KCkpO1xuZXhwb3J0IHsgR3VuemlwIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgc2luZ2xlIG9yIG11bHRpLW1lbWJlciBHWklQIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jR3VuemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jR3VuemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJJbmZsdCxcbiAgICAgICAgICAgIGd1emUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGUsIEd1bnppcF07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBHdW56aXAoZXYuZGF0YSk7XG4gICAgICAgICAgICBzdHJtLm9ubWVtYmVyID0gZnVuY3Rpb24gKG9mZnNldCkgeyByZXR1cm4gcG9zdE1lc3NhZ2Uob2Zmc2V0KTsgfTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA5LCAwLCBmdW5jdGlvbiAob2Zmc2V0KSB7IHJldHVybiBfdGhpcy5vbm1lbWJlciAmJiBfdGhpcy5vbm1lbWJlcihvZmZzZXQpOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3VuemlwO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jR3VuemlwIH07XG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkluZmx0LFxuICAgICAgICBndXplLFxuICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3VuemlwU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihndW56aXBTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMywgY2IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGd1bnppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIHZhciBzdCA9IGd6cyhkYXRhKTtcbiAgICBpZiAoc3QgKyA4ID4gZGF0YS5sZW5ndGgpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCBnemlwIGRhdGEnKTtcbiAgICByZXR1cm4gaW5mbHQoZGF0YS5zdWJhcnJheShzdCwgLTgpLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCB8fCBuZXcgdTgoZ3psKGRhdGEpKSwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgWmxpYiBjb21wcmVzc2lvblxuICovXG52YXIgWmxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBabGliKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMuYyA9IGFkbGVyKCk7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHpsaWJiZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmxpYi5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIFpsaWIucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiAodGhpcy5vLmRpY3Rpb25hcnkgPyA2IDogMiksIGYgJiYgNCwgdGhpcy5zKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIHpsaChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDQsIHRoaXMuYy5kKCkpO1xuICAgICAgICB0aGlzLm9uZGF0YShyYXcsIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIHpsaWJiZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICogQHBhcmFtIHN5bmMgV2hldGhlciB0byBmbHVzaCB0byBhIGJ5dGUgYm91bmRhcnkuIEEgc3luYyBmbHVzaCB0YWtlcyA0LTVcbiAgICAgKiAgICAgICAgICAgICBleHRyYSBieXRlcywgYnV0IGd1YXJhbnRlZXMgYWxsIHB1c2hlZCBkYXRhIGlzIGltbWVkaWF0ZWx5XG4gICAgICogICAgICAgICAgICAgZGVjb21wcmVzc2libGUuXG4gICAgICovXG4gICAgWmxpYi5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaC5jYWxsKHRoaXMsIHN5bmMpO1xuICAgIH07XG4gICAgcmV0dXJuIFpsaWI7XG59KCkpO1xuZXhwb3J0IHsgWmxpYiB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIFpsaWIgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jWmxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY1psaWIob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICB6bGUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGUsIFpsaWJdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgWmxpYihldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCAxMCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY1psaWI7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNabGliIH07XG5leHBvcnQgZnVuY3Rpb24gemxpYihkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICB6bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bGliU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZih6bGliU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDQsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3MgZGF0YSB3aXRoIFpsaWJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIHpsaWItY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6bGliU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGEgPSBhZGxlcigpO1xuICAgIGEucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgb3B0cy5kaWN0aW9uYXJ5ID8gNiA6IDIsIDQpO1xuICAgIHJldHVybiB6bGgoZCwgb3B0cyksIHdieXRlcyhkLCBkLmxlbmd0aCAtIDQsIGEuZCgpKSwgZDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIFpsaWIgZGVjb21wcmVzc2lvblxuICovXG52YXIgVW56bGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFVuemxpYihvcHRzLCBjYikge1xuICAgICAgICBJbmZsYXRlLmNhbGwodGhpcywgb3B0cywgY2IpO1xuICAgICAgICB0aGlzLnYgPSBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSA/IDIgOiAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSB1bnpsaWJiZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgVW56bGliLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5lLmNhbGwodGhpcywgY2h1bmspO1xuICAgICAgICBpZiAodGhpcy52KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA8IDYgJiYgIWZpbmFsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMucCA9IHRoaXMucC5zdWJhcnJheSh6bHModGhpcy5wLCB0aGlzLnYgLSAxKSksIHRoaXMudiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA8IDQpXG4gICAgICAgICAgICAgICAgZXJyKDYsICdpbnZhbGlkIHpsaWIgZGF0YScpO1xuICAgICAgICAgICAgdGhpcy5wID0gdGhpcy5wLnN1YmFycmF5KDAsIC00KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWNlc3NhcnkgdG8gcHJldmVudCBUUyBmcm9tIHVzaW5nIHRoZSBjbG9zdXJlIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB3b3JrZXJpemF0aW9uIHRvIGZ1bmN0aW9uIGNvcnJlY3RseVxuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5jLmNhbGwodGhpcywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIFVuemxpYjtcbn0oKSk7XG5leHBvcnQgeyBVbnpsaWIgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBabGliIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jVW56bGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jVW56bGliKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJJbmZsdCxcbiAgICAgICAgICAgIHp1bGUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGUsIFVuemxpYl07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBVbnpsaWIoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgMTEsIDApO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNVbnpsaWI7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNVbnpsaWIgfTtcbmV4cG9ydCBmdW5jdGlvbiB1bnpsaWIoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiSW5mbHQsXG4gICAgICAgIHp1bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1bnpsaWJTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKHVuemxpYlN5bmMoZXYuZGF0YVswXSwgZ29wdChldi5kYXRhWzFdKSkpOyB9LCA1LCBjYik7XG59XG5leHBvcnQgZnVuY3Rpb24gdW56bGliU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIGluZmx0KGRhdGEuc3ViYXJyYXkoemxzKGRhdGEsIG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5KSwgLTQpLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLy8gRGVmYXVsdCBhbGdvcml0aG0gZm9yIGNvbXByZXNzaW9uICh1c2VkIGJlY2F1c2UgaGF2aW5nIGEga25vd24gb3V0cHV0IHNpemUgYWxsb3dzIGZhc3RlciBkZWNvbXByZXNzaW9uKVxuZXhwb3J0IHsgZ3ppcCBhcyBjb21wcmVzcywgQXN5bmNHemlwIGFzIEFzeW5jQ29tcHJlc3MgfTtcbmV4cG9ydCB7IGd6aXBTeW5jIGFzIGNvbXByZXNzU3luYywgR3ppcCBhcyBDb21wcmVzcyB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgRGVjb21wcmVzcyA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZWNvbXByZXNzKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMubyA9IFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYikgfHwge307XG4gICAgICAgIHRoaXMuRyA9IEd1bnppcDtcbiAgICAgICAgdGhpcy5JID0gSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gVW56bGliO1xuICAgIH1cbiAgICAvLyBpbml0IHN1YnN0cmVhbVxuICAgIC8vIG92ZXJyaWRlbiBieSBBc3luY0RlY29tcHJlc3NcbiAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnMub25kYXRhID0gZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShkYXQsIGZpbmFsKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29tcHJlc3NlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAoIXRoaXMucykge1xuICAgICAgICAgICAgaWYgKHRoaXMucCAmJiB0aGlzLnAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbi5zZXQodGhpcy5wKSwgbi5zZXQoY2h1bmssIHRoaXMucC5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMucCA9IGNodW5rO1xuICAgICAgICAgICAgaWYgKHRoaXMucC5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zID0gKHRoaXMucFswXSA9PSAzMSAmJiB0aGlzLnBbMV0gPT0gMTM5ICYmIHRoaXMucFsyXSA9PSA4KVxuICAgICAgICAgICAgICAgICAgICA/IG5ldyB0aGlzLkcodGhpcy5vKVxuICAgICAgICAgICAgICAgICAgICA6ICgodGhpcy5wWzBdICYgMTUpICE9IDggfHwgKHRoaXMucFswXSA+PiA0KSA+IDcgfHwgKCh0aGlzLnBbMF0gPDwgOCB8IHRoaXMucFsxXSkgJSAzMSkpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyB0aGlzLkkodGhpcy5vKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgdGhpcy5aKHRoaXMubyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zLnB1c2godGhpcy5wLCBmaW5hbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnMucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIERlY29tcHJlc3M7XG59KCkpO1xuZXhwb3J0IHsgRGVjb21wcmVzcyB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIEdaSVAsIFpsaWIsIG9yIHJhdyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jRGVjb21wcmVzcyA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0RlY29tcHJlc3Mob3B0cywgY2IpIHtcbiAgICAgICAgRGVjb21wcmVzcy5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICAgICAgdGhpcy5xdWV1ZWRTaXplID0gMDtcbiAgICAgICAgdGhpcy5HID0gQXN5bmNHdW56aXA7XG4gICAgICAgIHRoaXMuSSA9IEFzeW5jSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gQXN5bmNVbnpsaWI7XG4gICAgfVxuICAgIEFzeW5jRGVjb21wcmVzcy5wcm90b3R5cGUuaSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5zLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnMub25kcmFpbiA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgICAgICBfdGhpcy5xdWV1ZWRTaXplIC09IHNpemU7XG4gICAgICAgICAgICBpZiAoX3RoaXMub25kcmFpbilcbiAgICAgICAgICAgICAgICBfdGhpcy5vbmRyYWluKHNpemUpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVjb21wcmVzc2VkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEFzeW5jRGVjb21wcmVzcy5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5xdWV1ZWRTaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgRGVjb21wcmVzcy5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNEZWNvbXByZXNzO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jRGVjb21wcmVzcyB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcHJlc3MoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gKGRhdGFbMF0gPT0gMzEgJiYgZGF0YVsxXSA9PSAxMzkgJiYgZGF0YVsyXSA9PSA4KVxuICAgICAgICA/IGd1bnppcChkYXRhLCBvcHRzLCBjYilcbiAgICAgICAgOiAoKGRhdGFbMF0gJiAxNSkgIT0gOCB8fCAoZGF0YVswXSA+PiA0KSA+IDcgfHwgKChkYXRhWzBdIDw8IDggfCBkYXRhWzFdKSAlIDMxKSlcbiAgICAgICAgICAgID8gaW5mbGF0ZShkYXRhLCBvcHRzLCBjYilcbiAgICAgICAgICAgIDogdW56bGliKGRhdGEsIG9wdHMsIGNiKTtcbn1cbi8qKlxuICogRXhwYW5kcyBjb21wcmVzc2VkIEdaSVAsIFpsaWIsIG9yIHJhdyBERUZMQVRFIGRhdGEsIGF1dG9tYXRpY2FsbHkgZGV0ZWN0aW5nIHRoZSBmb3JtYXRcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGRlY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBkZWNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21wcmVzc1N5bmMoZGF0YSwgb3B0cykge1xuICAgIHJldHVybiAoZGF0YVswXSA9PSAzMSAmJiBkYXRhWzFdID09IDEzOSAmJiBkYXRhWzJdID09IDgpXG4gICAgICAgID8gZ3VuemlwU3luYyhkYXRhLCBvcHRzKVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlU3luYyhkYXRhLCBvcHRzKVxuICAgICAgICAgICAgOiB1bnpsaWJTeW5jKGRhdGEsIG9wdHMpO1xufVxuLy8gZmxhdHRlbiBhIGRpcmVjdG9yeSBzdHJ1Y3R1cmVcbnZhciBmbHRuID0gZnVuY3Rpb24gKGQsIHAsIHQsIG8pIHtcbiAgICBmb3IgKHZhciBrIGluIGQpIHtcbiAgICAgICAgdmFyIHZhbCA9IGRba10sIG4gPSBwICsgaywgb3AgPSBvO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKVxuICAgICAgICAgICAgb3AgPSBtcmcobywgdmFsWzFdKSwgdmFsID0gdmFsWzBdO1xuICAgICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCkpXG4gICAgICAgICAgICB0W25dID0gW3ZhbCwgb3BdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRbbiArPSAnLyddID0gW25ldyB1OCgwKSwgb3BdO1xuICAgICAgICAgICAgZmx0bih2YWwsIG4sIHQsIG8pO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vIHRleHQgZW5jb2RlclxudmFyIHRlID0gdHlwZW9mIFRleHRFbmNvZGVyICE9ICd1bmRlZmluZWQnICYmIC8qI19fUFVSRV9fKi8gbmV3IFRleHRFbmNvZGVyKCk7XG4vLyB0ZXh0IGRlY29kZXJcbnZhciB0ZCA9IHR5cGVvZiBUZXh0RGVjb2RlciAhPSAndW5kZWZpbmVkJyAmJiAvKiNfX1BVUkVfXyovIG5ldyBUZXh0RGVjb2RlcigpO1xuLy8gdGV4dCBkZWNvZGVyIHN0cmVhbVxudmFyIHRkcyA9IDA7XG50cnkge1xuICAgIHRkLmRlY29kZShldCwgeyBzdHJlYW06IHRydWUgfSk7XG4gICAgdGRzID0gMTtcbn1cbmNhdGNoIChlKSB7IH1cbi8vIGRlY29kZSBVVEY4XG52YXIgZHV0ZjggPSBmdW5jdGlvbiAoZCkge1xuICAgIGZvciAodmFyIHIgPSAnJywgaSA9IDA7Oykge1xuICAgICAgICB2YXIgYyA9IGRbaSsrXTtcbiAgICAgICAgdmFyIGViID0gKGMgPiAxMjcpICsgKGMgPiAyMjMpICsgKGMgPiAyMzkpO1xuICAgICAgICBpZiAoaSArIGViID4gZC5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4geyBzOiByLCByOiBzbGMoZCwgaSAtIDEpIH07XG4gICAgICAgIGlmICghZWIpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgIGVsc2UgaWYgKGViID09IDMpIHtcbiAgICAgICAgICAgIGMgPSAoKGMgJiAxNSkgPDwgMTggfCAoZFtpKytdICYgNjMpIDw8IDEyIHwgKGRbaSsrXSAmIDYzKSA8PCA2IHwgKGRbaSsrXSAmIDYzKSkgLSA2NTUzNixcbiAgICAgICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTYgfCAoYyA+PiAxMCksIDU2MzIwIHwgKGMgJiAxMDIzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWIgJiAxKVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgMzEpIDw8IDYgfCAoZFtpKytdICYgNjMpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgMTUpIDw8IDEyIHwgKGRbaSsrXSAmIDYzKSA8PCA2IHwgKGRbaSsrXSAmIDYzKSk7XG4gICAgfVxufTtcbi8qKlxuICogU3RyZWFtaW5nIFVURi04IGRlY29kaW5nXG4gKi9cbnZhciBEZWNvZGVVVEY4ID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBVVEYtOCBkZWNvZGluZyBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBkZWNvZGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gRGVjb2RlVVRGOChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICBpZiAodGRzKVxuICAgICAgICAgICAgdGhpcy50ID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucCA9IGV0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWNvZGVkIGZyb20gVVRGLTggYmluYXJ5XG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlY29kZVVURjgucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGZpbmFsID0gISFmaW5hbDtcbiAgICAgICAgaWYgKHRoaXMudCkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEodGhpcy50LmRlY29kZShjaHVuaywgeyBzdHJlYW06IHRydWUgfSksIGZpbmFsKTtcbiAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnQuZGVjb2RlKCkubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgICAgICAgICAgdGhpcy50ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMucClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdmFyIGRhdCA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgZGF0LnNldCh0aGlzLnApO1xuICAgICAgICBkYXQuc2V0KGNodW5rLCB0aGlzLnAubGVuZ3RoKTtcbiAgICAgICAgdmFyIF9hID0gZHV0ZjgoZGF0KSwgcyA9IF9hLnMsIHIgPSBfYS5yO1xuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIGlmIChyLmxlbmd0aClcbiAgICAgICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucCA9IHI7XG4gICAgICAgIHRoaXMub25kYXRhKHMsIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBEZWNvZGVVVEY4O1xufSgpKTtcbmV4cG9ydCB7IERlY29kZVVURjggfTtcbi8qKlxuICogU3RyZWFtaW5nIFVURi04IGVuY29kaW5nXG4gKi9cbnZhciBFbmNvZGVVVEY4ID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBVVEYtOCBkZWNvZGluZyBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBlbmNvZGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gRW5jb2RlVVRGOChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBlbmNvZGVkIHRvIFVURi04XG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBzdHJpbmcgZGF0YSB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEVuY29kZVVURjgucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHRoaXMub25kYXRhKHN0clRvVTgoY2h1bmspLCB0aGlzLmQgPSBmaW5hbCB8fCBmYWxzZSk7XG4gICAgfTtcbiAgICByZXR1cm4gRW5jb2RlVVRGODtcbn0oKSk7XG5leHBvcnQgeyBFbmNvZGVVVEY4IH07XG4vKipcbiAqIENvbnZlcnRzIGEgc3RyaW5nIGludG8gYSBVaW50OEFycmF5IGZvciB1c2Ugd2l0aCBjb21wcmVzc2lvbi9kZWNvbXByZXNzaW9uIG1ldGhvZHNcbiAqIEBwYXJhbSBzdHIgVGhlIHN0cmluZyB0byBlbmNvZGVcbiAqIEBwYXJhbSBsYXRpbjEgV2hldGhlciBvciBub3QgdG8gaW50ZXJwcmV0IHRoZSBkYXRhIGFzIExhdGluLTEuIFRoaXMgc2hvdWxkXG4gKiAgICAgICAgICAgICAgIG5vdCBuZWVkIHRvIGJlIHRydWUgdW5sZXNzIGRlY29kaW5nIGEgYmluYXJ5IHN0cmluZy5cbiAqIEByZXR1cm5zIFRoZSBzdHJpbmcgZW5jb2RlZCBpbiBVVEYtOC9MYXRpbi0xIGJpbmFyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyVG9VOChzdHIsIGxhdGluMSkge1xuICAgIGlmIChsYXRpbjEpIHtcbiAgICAgICAgdmFyIGFyXzEgPSBuZXcgdTgoc3RyLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgYXJfMVtpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICByZXR1cm4gYXJfMTtcbiAgICB9XG4gICAgaWYgKHRlKVxuICAgICAgICByZXR1cm4gdGUuZW5jb2RlKHN0cik7XG4gICAgdmFyIGwgPSBzdHIubGVuZ3RoO1xuICAgIHZhciBhciA9IG5ldyB1OChzdHIubGVuZ3RoICsgKHN0ci5sZW5ndGggPj4gMSkpO1xuICAgIHZhciBhaSA9IDA7XG4gICAgdmFyIHcgPSBmdW5jdGlvbiAodikgeyBhclthaSsrXSA9IHY7IH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKGFpICsgNSA+IGFyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgoYWkgKyA4ICsgKChsIC0gaSkgPDwgMSkpO1xuICAgICAgICAgICAgbi5zZXQoYXIpO1xuICAgICAgICAgICAgYXIgPSBuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMTI4IHx8IGxhdGluMSlcbiAgICAgICAgICAgIHcoYyk7XG4gICAgICAgIGVsc2UgaWYgKGMgPCAyMDQ4KVxuICAgICAgICAgICAgdygxOTIgfCAoYyA+PiA2KSksIHcoMTI4IHwgKGMgJiA2MykpO1xuICAgICAgICBlbHNlIGlmIChjID4gNTUyOTUgJiYgYyA8IDU3MzQ0KVxuICAgICAgICAgICAgYyA9IDY1NTM2ICsgKGMgJiAxMDIzIDw8IDEwKSB8IChzdHIuY2hhckNvZGVBdCgrK2kpICYgMTAyMyksXG4gICAgICAgICAgICAgICAgdygyNDAgfCAoYyA+PiAxOCkpLCB3KDEyOCB8ICgoYyA+PiAxMikgJiA2MykpLCB3KDEyOCB8ICgoYyA+PiA2KSAmIDYzKSksIHcoMTI4IHwgKGMgJiA2MykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3KDIyNCB8IChjID4+IDEyKSksIHcoMTI4IHwgKChjID4+IDYpICYgNjMpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgfVxuICAgIHJldHVybiBzbGMoYXIsIDAsIGFpKTtcbn1cbi8qKlxuICogQ29udmVydHMgYSBVaW50OEFycmF5IHRvIGEgc3RyaW5nXG4gKiBAcGFyYW0gZGF0IFRoZSBkYXRhIHRvIGRlY29kZSB0byBzdHJpbmdcbiAqIEBwYXJhbSBsYXRpbjEgV2hldGhlciBvciBub3QgdG8gaW50ZXJwcmV0IHRoZSBkYXRhIGFzIExhdGluLTEuIFRoaXMgc2hvdWxkXG4gKiAgICAgICAgICAgICAgIG5vdCBuZWVkIHRvIGJlIHRydWUgdW5sZXNzIGVuY29kaW5nIHRvIGJpbmFyeSBzdHJpbmcuXG4gKiBAcmV0dXJucyBUaGUgb3JpZ2luYWwgVVRGLTgvTGF0aW4tMSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0ckZyb21VOChkYXQsIGxhdGluMSkge1xuICAgIGlmIChsYXRpbjEpIHtcbiAgICAgICAgdmFyIHIgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXQubGVuZ3RoOyBpICs9IDE2Mzg0KVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGRhdC5zdWJhcnJheShpLCBpICsgMTYzODQpKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRkKSB7XG4gICAgICAgIHJldHVybiB0ZC5kZWNvZGUoZGF0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBfYSA9IGR1dGY4KGRhdCksIHMgPSBfYS5zLCByID0gX2EucjtcbiAgICAgICAgaWYgKHIubGVuZ3RoKVxuICAgICAgICAgICAgZXJyKDgpO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG59XG47XG4vLyBkZWZsYXRlIGJpdCBmbGFnXG52YXIgZGJmID0gZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGwgPT0gMSA/IDMgOiBsIDwgNiA/IDIgOiBsID09IDkgPyAxIDogMDsgfTtcbi8vIHNraXAgbG9jYWwgemlwIGhlYWRlclxudmFyIHNsemggPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gYiArIDMwICsgYjIoZCwgYiArIDI2KSArIGIyKGQsIGIgKyAyOCk7IH07XG4vLyByZWFkIHppcCBoZWFkZXJcbnZhciB6aCA9IGZ1bmN0aW9uIChkLCBiLCB6KSB7XG4gICAgdmFyIGZubCA9IGIyKGQsIGIgKyAyOCksIGVmbCA9IGIyKGQsIGIgKyAzMCksIGZuID0gc3RyRnJvbVU4KGQuc3ViYXJyYXkoYiArIDQ2LCBiICsgNDYgKyBmbmwpLCAhKGIyKGQsIGIgKyA4KSAmIDIwNDgpKSwgZXMgPSBiICsgNDYgKyBmbmw7XG4gICAgdmFyIF9hID0gejY0aHMoZCwgZXMsIGVmbCwgeiwgYjQoZCwgYiArIDIwKSwgYjQoZCwgYiArIDI0KSwgYjQoZCwgYiArIDQyKSksIHNjID0gX2FbMF0sIHN1ID0gX2FbMV0sIG9mZiA9IF9hWzJdO1xuICAgIHJldHVybiBbYjIoZCwgYiArIDEwKSwgc2MsIHN1LCBmbiwgZXMgKyBlZmwgKyBiMihkLCBiICsgMzIpLCBvZmZdO1xufTtcbi8vIHJlYWQgemlwNjQgaGVhZGVyIHNpemVzXG52YXIgejY0aHMgPSBmdW5jdGlvbiAoZCwgYiwgbCwgeiwgc2MsIHN1LCBvZmYpIHtcbiAgICB2YXIgbnNjID0gc2MgPT0gNDI5NDk2NzI5NSwgbnN1ID0gc3UgPT0gNDI5NDk2NzI5NSwgbm9mZiA9IG9mZiA9PSA0Mjk0OTY3Mjk1LCBlID0gYiArIGw7XG4gICAgdmFyIG5mID0gbnNjICsgbnN1ICsgbm9mZjtcbiAgICBpZiAoeiAmJiBuZikge1xuICAgICAgICBmb3IgKDsgYiArIDQgPCBlOyBiICs9IDQgKyBiMihkLCBiICsgMikpIHtcbiAgICAgICAgICAgIGlmIChiMihkLCBiKSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgbnNjID8gYjgoZCwgYiArIDQgKyA4ICogbnN1KSA6IHNjLFxuICAgICAgICAgICAgICAgICAgICBuc3UgPyBiOChkLCBiICsgNCkgOiBzdSxcbiAgICAgICAgICAgICAgICAgICAgbm9mZiA/IGI4KGQsIGIgKyA0ICsgOCAqIChuc3UgKyBuc2MpKSA6IG9mZixcbiAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8geiA9PSAyIGZvciB1bmtub3duIHdoZXRoZXIgb3Igbm90IHppcDY0XG4gICAgICAgIGlmICh6IDwgMilcbiAgICAgICAgICAgIGVycigxMyk7XG4gICAgfVxuICAgIHJldHVybiBbc2MsIHN1LCBvZmYsIDBdO1xufTtcbi8vIGV4dHJhIGZpZWxkIGxlbmd0aFxudmFyIGV4ZmwgPSBmdW5jdGlvbiAoZXgpIHtcbiAgICB2YXIgbGUgPSAwO1xuICAgIGlmIChleCkge1xuICAgICAgICBmb3IgKHZhciBrIGluIGV4KSB7XG4gICAgICAgICAgICB2YXIgbCA9IGV4W2tdLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChsID4gNjU1MzUpXG4gICAgICAgICAgICAgICAgZXJyKDkpO1xuICAgICAgICAgICAgbGUgKz0gbCArIDQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxlO1xufTtcbi8vIHdyaXRlIHppcCBoZWFkZXJcbnZhciB3emggPSBmdW5jdGlvbiAoZCwgYiwgZiwgZm4sIHUsIGMsIGNlLCBjbykge1xuICAgIHZhciBmbCA9IGZuLmxlbmd0aCwgZXggPSBmLmV4dHJhLCBjb2wgPSBjbyAmJiBjby5sZW5ndGg7XG4gICAgdmFyIGV4bCA9IGV4ZmwoZXgpO1xuICAgIHdieXRlcyhkLCBiLCBjZSAhPSBudWxsID8gMHgyMDE0QjUwIDogMHg0MDM0QjUwKSwgYiArPSA0O1xuICAgIGlmIChjZSAhPSBudWxsKVxuICAgICAgICBkW2IrK10gPSAyMCwgZFtiKytdID0gZi5vcztcbiAgICBkW2JdID0gMjAsIGIgKz0gMjsgLy8gc3BlYyBjb21wbGlhbmNlPyB3aGF0J3MgdGhhdD9cbiAgICBkW2IrK10gPSAoZi5mbGFnIDw8IDEpIHwgKGMgPCAwICYmIDgpLCBkW2IrK10gPSB1ICYmIDg7XG4gICAgZFtiKytdID0gZi5jb21wcmVzc2lvbiAmIDI1NSwgZFtiKytdID0gZi5jb21wcmVzc2lvbiA+PiA4O1xuICAgIHZhciBkdCA9IG5ldyBEYXRlKGYubXRpbWUgPT0gbnVsbCA/IERhdGUubm93KCkgOiBmLm10aW1lKSwgeSA9IGR0LmdldEZ1bGxZZWFyKCkgLSAxOTgwO1xuICAgIGlmICh5IDwgMCB8fCB5ID4gMTE5KVxuICAgICAgICBlcnIoMTApO1xuICAgIHdieXRlcyhkLCBiLCAoeSA8PCAyNSkgfCAoKGR0LmdldE1vbnRoKCkgKyAxKSA8PCAyMSkgfCAoZHQuZ2V0RGF0ZSgpIDw8IDE2KSB8IChkdC5nZXRIb3VycygpIDw8IDExKSB8IChkdC5nZXRNaW51dGVzKCkgPDwgNSkgfCAoZHQuZ2V0U2Vjb25kcygpID4+IDEpKSwgYiArPSA0O1xuICAgIGlmIChjICE9IC0xKSB7XG4gICAgICAgIHdieXRlcyhkLCBiLCBmLmNyYyk7XG4gICAgICAgIHdieXRlcyhkLCBiICsgNCwgYyA8IDAgPyAtYyAtIDIgOiBjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA4LCBmLnNpemUpO1xuICAgIH1cbiAgICB3Ynl0ZXMoZCwgYiArIDEyLCBmbCk7XG4gICAgd2J5dGVzKGQsIGIgKyAxNCwgZXhsKSwgYiArPSAxNjtcbiAgICBpZiAoY2UgIT0gbnVsbCkge1xuICAgICAgICB3Ynl0ZXMoZCwgYiwgY29sKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA2LCBmLmF0dHJzKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyAxMCwgY2UpLCBiICs9IDE0O1xuICAgIH1cbiAgICBkLnNldChmbiwgYik7XG4gICAgYiArPSBmbDtcbiAgICBpZiAoZXhsKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBleGYgPSBleFtrXSwgbCA9IGV4Zi5sZW5ndGg7XG4gICAgICAgICAgICB3Ynl0ZXMoZCwgYiwgK2spO1xuICAgICAgICAgICAgd2J5dGVzKGQsIGIgKyAyLCBsKTtcbiAgICAgICAgICAgIGQuc2V0KGV4ZiwgYiArIDQpLCBiICs9IDQgKyBsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb2wpXG4gICAgICAgIGQuc2V0KGNvLCBiKSwgYiArPSBjb2w7XG4gICAgcmV0dXJuIGI7XG59O1xuLy8gd3JpdGUgemlwIGZvb3RlciAoZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5KVxudmFyIHd6ZiA9IGZ1bmN0aW9uIChvLCBiLCBjLCBkLCBlKSB7XG4gICAgd2J5dGVzKG8sIGIsIDB4NjA1NEI1MCk7IC8vIHNraXAgZGlza1xuICAgIHdieXRlcyhvLCBiICsgOCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMiwgZCk7XG4gICAgd2J5dGVzKG8sIGIgKyAxNiwgZSk7XG59O1xuLyoqXG4gKiBBIHBhc3MtdGhyb3VnaCBzdHJlYW0gdG8ga2VlcCBkYXRhIHVuY29tcHJlc3NlZCBpbiBhIFpJUCBhcmNoaXZlLlxuICovXG52YXIgWmlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHBhc3MtdGhyb3VnaCBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwUGFzc1Rocm91Z2goZmlsZW5hbWUpIHtcbiAgICAgICAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xuICAgICAgICB0aGlzLmMgPSBjcmMoKTtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBhIGNodW5rIGFuZCBwdXNoZXMgdG8gdGhlIG91dHB1dCBzdHJlYW0uIFlvdSBjYW4gb3ZlcnJpZGUgdGhpc1xuICAgICAqIG1ldGhvZCBpbiBhIHN1YmNsYXNzIGZvciBjdXN0b20gYmVoYXZpb3IsIGJ1dCBieSBkZWZhdWx0IHRoaXMgcGFzc2VzXG4gICAgICogdGhlIGRhdGEgdGhyb3VnaC4gWW91IG11c3QgY2FsbCB0aGlzLm9uZGF0YShlcnIsIGNodW5rLCBmaW5hbCkgYXQgc29tZVxuICAgICAqIHBvaW50IGluIHRoaXMgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHJvY2Vzc1xuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGFkZGVkLiBJZiB5b3UgYXJlIHN1YmNsYXNzaW5nIHRoaXMgd2l0aCBhIGN1c3RvbVxuICAgICAqIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgbm90ZSB0aGF0IHlvdSBtdXN0IHB1c2ggZGF0YSBmcm9tIHRoZSBzb3VyY2VcbiAgICAgKiBmaWxlIG9ubHksIHByZS1jb21wcmVzc2lvbi5cbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIHRoaXMuYy5wKGNodW5rKTtcbiAgICAgICAgdGhpcy5zaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgaWYgKGZpbmFsKVxuICAgICAgICAgICAgdGhpcy5jcmMgPSB0aGlzLmMuZCgpO1xuICAgICAgICAvLyB3ZSBzaG91bGRuJ3QgcmVhbGx5IGRvIHRoaXMgY2FzdCwgYnV0IHByb3Blcmx5IGhhbmRsaW5nIEFycmF5QnVmZmVyTGlrZVxuICAgICAgICAvLyBtYWtlcyB0aGUgQVBJIHVuZXJnb25vbWljIHdpdGggQnVmZmVyXG4gICAgICAgIHRoaXMucHJvY2VzcyhjaHVuaywgZmluYWwgfHwgZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIFppcFBhc3NUaHJvdWdoO1xufSgpKTtcbmV4cG9ydCB7IFppcFBhc3NUaHJvdWdoIH07XG4vLyBJIGRvbid0IGV4dGVuZCBiZWNhdXNlIFR5cGVTY3JpcHQgZXh0ZW5zaW9uIGFkZHMgMWtCIG9mIHJ1bnRpbWUgYmxvYXRcbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlcy4gUHJlZmVyIHVzaW5nIEFzeW5jWmlwRGVmbGF0ZVxuICogZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICovXG52YXIgWmlwRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgREVGTEFURSBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBaaXBEZWZsYXRlKGZpbGVuYW1lLCBvcHRzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghb3B0cylcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgWmlwUGFzc1Rocm91Z2guY2FsbCh0aGlzLCBmaWxlbmFtZSk7XG4gICAgICAgIHRoaXMuZCA9IG5ldyBEZWZsYXRlKG9wdHMsIGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uID0gODtcbiAgICAgICAgdGhpcy5mbGFnID0gZGJmKG9wdHMubGV2ZWwpO1xuICAgIH1cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5kLnB1c2goY2h1bmssIGZpbmFsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZSwgbnVsbCwgZmluYWwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBaaXBEZWZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBBc3luY1ppcERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgREVGTEFURSBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBBc3luY1ppcERlZmxhdGUoZmlsZW5hbWUsIG9wdHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCFvcHRzKVxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5jYWxsKHRoaXMsIGZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5kID0gbmV3IEFzeW5jRGVmbGF0ZShvcHRzLCBmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEoZXJyLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29tcHJlc3Npb24gPSA4O1xuICAgICAgICB0aGlzLmZsYWcgPSBkYmYob3B0cy5sZXZlbCk7XG4gICAgICAgIHRoaXMudGVybWluYXRlID0gdGhpcy5kLnRlcm1pbmF0ZTtcbiAgICB9XG4gICAgQXN5bmNaaXBEZWZsYXRlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmQucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVmbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgQXN5bmNaaXBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNaaXBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jWmlwRGVmbGF0ZSB9O1xuLy8gVE9ETzogQmV0dGVyIHRyZWUgc2hha2luZ1xuLyoqXG4gKiBBIHppcHBhYmxlIGFyY2hpdmUgdG8gd2hpY2ggZmlsZXMgY2FuIGluY3JlbWVudGFsbHkgYmUgYWRkZWRcbiAqL1xudmFyIFppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IFpJUCBhcmNoaXZlIHRvIHdoaWNoIGZpbGVzIGNhbiBiZSBhZGRlZFxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGZvciB0aGUgZ2VuZXJhdGVkIFpJUCBhcmNoaXZlXG4gICAgICogICAgICAgICAgIGlzIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFppcChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB0aGlzLnUgPSBbXTtcbiAgICAgICAgdGhpcy5kID0gMTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZpbGUgdG8gdGhlIFpJUCBhcmNoaXZlXG4gICAgICogQHBhcmFtIGZpbGUgVGhlIGZpbGUgc3RyZWFtIHRvIGFkZFxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgLy8gZmluaXNoaW5nIG9yIGZpbmlzaGVkXG4gICAgICAgIGlmICh0aGlzLmQgJiAyKVxuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZXJyKDQgKyAodGhpcy5kICYgMSkgKiA4LCAwLCAxKSwgbnVsbCwgZmFsc2UpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBmID0gc3RyVG9VOChmaWxlLmZpbGVuYW1lKSwgZmxfMSA9IGYubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGNvbSA9IGZpbGUuY29tbWVudCwgbyA9IGNvbSAmJiBzdHJUb1U4KGNvbSk7XG4gICAgICAgICAgICB2YXIgdSA9IGZsXzEgIT0gZmlsZS5maWxlbmFtZS5sZW5ndGggfHwgKG8gJiYgKGNvbS5sZW5ndGggIT0gby5sZW5ndGgpKTtcbiAgICAgICAgICAgIHZhciBobF8xID0gZmxfMSArIGV4ZmwoZmlsZS5leHRyYSkgKyAzMDtcbiAgICAgICAgICAgIGlmIChmbF8xID4gNjU1MzUpXG4gICAgICAgICAgICAgICAgdGhpcy5vbmRhdGEoZXJyKDExLCAwLCAxKSwgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IG5ldyB1OChobF8xKTtcbiAgICAgICAgICAgIHd6aChoZWFkZXIsIDAsIGZpbGUsIGYsIHUsIC0xKTtcbiAgICAgICAgICAgIHZhciBjaGtzXzEgPSBbaGVhZGVyXTtcbiAgICAgICAgICAgIHZhciBwQWxsXzEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjaGtzXzIgPSBjaGtzXzE7IF9pIDwgY2hrc18yLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hrID0gY2hrc18yW19pXTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMub25kYXRhKG51bGwsIGNoaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjaGtzXzEgPSBbXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdHJfMSA9IHRoaXMuZDtcbiAgICAgICAgICAgIHRoaXMuZCA9IDA7XG4gICAgICAgICAgICB2YXIgaW5kXzEgPSB0aGlzLnUubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHVmXzEgPSBtcmcoZmlsZSwge1xuICAgICAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICAgICAgdTogdSxcbiAgICAgICAgICAgICAgICBvOiBvLFxuICAgICAgICAgICAgICAgIHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUudGVybWluYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcEFsbF8xKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cl8xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnh0ID0gX3RoaXMudVtpbmRfMSArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG54dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQucigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmQgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyXzEgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGNsXzEgPSAwO1xuICAgICAgICAgICAgZmlsZS5vbmRhdGEgPSBmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEoZXJyLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbF8xICs9IGRhdC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNoa3NfMS5wdXNoKGRhdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRkID0gbmV3IHU4KDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgMCwgMHg4MDc0QjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgNCwgZmlsZS5jcmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCA4LCBjbF8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgMTIsIGZpbGUuc2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGtzXzEucHVzaChkZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1Zl8xLmMgPSBjbF8xLCB1Zl8xLmIgPSBobF8xICsgY2xfMSArIDE2LCB1Zl8xLmNyYyA9IGZpbGUuY3JjLCB1Zl8xLnNpemUgPSBmaWxlLnNpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1Zl8xLnIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyXzEgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRyXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICBwQWxsXzEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy51LnB1c2godWZfMSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIHByb2Nlc3Mgb2YgYWRkaW5nIGZpbGVzIGFuZCBwcmVwYXJlcyB0byBlbWl0IHRoZSBmaW5hbCBjaHVua3MuXG4gICAgICogVGhpcyAqbXVzdCogYmUgY2FsbGVkIGFmdGVyIGFkZGluZyBhbGwgZGVzaXJlZCBmaWxlcyBmb3IgdGhlIHJlc3VsdGluZ1xuICAgICAqIFpJUCBmaWxlIHRvIHdvcmsgcHJvcGVybHkuXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLmQgJiAyKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlcnIoNCArICh0aGlzLmQgJiAxKSAqIDgsIDAsIDEpLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kKVxuICAgICAgICAgICAgdGhpcy5lKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMudS5wdXNoKHtcbiAgICAgICAgICAgICAgICByOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghKF90aGlzLmQgJiAxKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudS5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5lKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0OiBmdW5jdGlvbiAoKSB7IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmQgPSAzO1xuICAgIH07XG4gICAgWmlwLnByb3RvdHlwZS5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYnQgPSAwLCBsID0gMCwgdGwgPSAwO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy51OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfYVtfaV07XG4gICAgICAgICAgICB0bCArPSA0NiArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpICsgKGYubyA/IGYuby5sZW5ndGggOiAwKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3V0ID0gbmV3IHU4KHRsICsgMjIpO1xuICAgICAgICBmb3IgKHZhciBfYiA9IDAsIF9jID0gdGhpcy51OyBfYiA8IF9jLmxlbmd0aDsgX2IrKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfY1tfYl07XG4gICAgICAgICAgICB3emgob3V0LCBidCwgZiwgZi5mLCBmLnUsIC1mLmMgLSAyLCBsLCBmLm8pO1xuICAgICAgICAgICAgYnQgKz0gNDYgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKSArIChmLm8gPyBmLm8ubGVuZ3RoIDogMCksIGwgKz0gZi5iO1xuICAgICAgICB9XG4gICAgICAgIHd6ZihvdXQsIGJ0LCB0aGlzLnUubGVuZ3RoLCB0bCwgbCk7XG4gICAgICAgIHRoaXMub25kYXRhKG51bGwsIG91dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZCA9IDI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBIG1ldGhvZCB0byB0ZXJtaW5hdGUgYW55IGludGVybmFsIHdvcmtlcnMgdXNlZCBieSB0aGUgc3RyZWFtLiBTdWJzZXF1ZW50XG4gICAgICogY2FsbHMgdG8gYWRkKCkgd2lsbCBmYWlsLlxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy51OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfYVtfaV07XG4gICAgICAgICAgICBmLnQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmQgPSAyO1xuICAgIH07XG4gICAgcmV0dXJuIFppcDtcbn0oKSk7XG5leHBvcnQgeyBaaXAgfTtcbmV4cG9ydCBmdW5jdGlvbiB6aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICB2YXIgciA9IHt9O1xuICAgIGZsdG4oZGF0YSwgJycsIHIsIG9wdHMpO1xuICAgIHZhciBrID0gT2JqZWN0LmtleXMocik7XG4gICAgdmFyIGxmdCA9IGsubGVuZ3RoLCBvID0gMCwgdG90ID0gMDtcbiAgICB2YXIgc2xmdCA9IGxmdCwgZmlsZXMgPSBuZXcgQXJyYXkobGZ0KTtcbiAgICB2YXIgdGVybSA9IFtdO1xuICAgIHZhciB0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlcm0ubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICB0ZXJtW2ldKCk7XG4gICAgfTtcbiAgICB2YXIgY2JkID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgbXQoZnVuY3Rpb24gKCkgeyBjYihhLCBiKTsgfSk7XG4gICAgfTtcbiAgICBtdChmdW5jdGlvbiAoKSB7IGNiZCA9IGNiOyB9KTtcbiAgICB2YXIgY2JmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3V0ID0gbmV3IHU4KHRvdCArIDIyKSwgb2UgPSBvLCBjZGwgPSB0b3QgLSBvO1xuICAgICAgICB0b3QgPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsZnQ7ICsraSkge1xuICAgICAgICAgICAgdmFyIGYgPSBmaWxlc1tpXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIGwgPSBmLmMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHd6aChvdXQsIHRvdCwgZiwgZi5mLCBmLnUsIGwpO1xuICAgICAgICAgICAgICAgIHZhciBiYWRkID0gMzAgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKTtcbiAgICAgICAgICAgICAgICB2YXIgbG9jID0gdG90ICsgYmFkZDtcbiAgICAgICAgICAgICAgICBvdXQuc2V0KGYuYywgbG9jKTtcbiAgICAgICAgICAgICAgICB3emgob3V0LCBvLCBmLCBmLmYsIGYudSwgbCwgdG90LCBmLm0pLCBvICs9IDE2ICsgYmFkZCArIChmLm0gPyBmLm0ubGVuZ3RoIDogMCksIHRvdCA9IGxvYyArIGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYmQoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd3pmKG91dCwgbywgZmlsZXMubGVuZ3RoLCBjZGwsIG9lKTtcbiAgICAgICAgY2JkKG51bGwsIG91dCk7XG4gICAgfTtcbiAgICBpZiAoIWxmdClcbiAgICAgICAgY2JmKCk7XG4gICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgZm4gPSBrW2ldO1xuICAgICAgICB2YXIgX2EgPSByW2ZuXSwgZmlsZSA9IF9hWzBdLCBwID0gX2FbMV07XG4gICAgICAgIHZhciBjID0gY3JjKCksIHNpemUgPSBmaWxlLmxlbmd0aDtcbiAgICAgICAgYy5wKGZpbGUpO1xuICAgICAgICB2YXIgZiA9IHN0clRvVTgoZm4pLCBzID0gZi5sZW5ndGg7XG4gICAgICAgIHZhciBjb20gPSBwLmNvbW1lbnQsIG0gPSBjb20gJiYgc3RyVG9VOChjb20pLCBtcyA9IG0gJiYgbS5sZW5ndGg7XG4gICAgICAgIHZhciBleGwgPSBleGZsKHAuZXh0cmEpO1xuICAgICAgICB2YXIgY29tcHJlc3Npb24gPSBwLmxldmVsID09IDAgPyAwIDogODtcbiAgICAgICAgdmFyIGNibCA9IGZ1bmN0aW9uIChlLCBkKSB7XG4gICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgIHRBbGwoKTtcbiAgICAgICAgICAgICAgICBjYmQoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbCA9IGQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZpbGVzW2ldID0gbXJnKHAsIHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgY3JjOiBjLmQoKSxcbiAgICAgICAgICAgICAgICAgICAgYzogZCxcbiAgICAgICAgICAgICAgICAgICAgZjogZixcbiAgICAgICAgICAgICAgICAgICAgbTogbSxcbiAgICAgICAgICAgICAgICAgICAgdTogcyAhPSBmbi5sZW5ndGggfHwgKG0gJiYgKGNvbS5sZW5ndGggIT0gbXMpKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcHJlc3Npb246IGNvbXByZXNzaW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbyArPSAzMCArIHMgKyBleGwgKyBsO1xuICAgICAgICAgICAgICAgIHRvdCArPSA3NiArIDIgKiAocyArIGV4bCkgKyAobXMgfHwgMCkgKyBsO1xuICAgICAgICAgICAgICAgIGlmICghLS1sZnQpXG4gICAgICAgICAgICAgICAgICAgIGNiZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAocyA+IDY1NTM1KVxuICAgICAgICAgICAgY2JsKGVycigxMSwgMCwgMSksIG51bGwpO1xuICAgICAgICBpZiAoIWNvbXByZXNzaW9uKVxuICAgICAgICAgICAgY2JsKG51bGwsIGZpbGUpO1xuICAgICAgICBlbHNlIGlmIChzaXplIDwgMTYwMDAwKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNibChudWxsLCBkZWZsYXRlU3luYyhmaWxlLCBwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNibChlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZXJtLnB1c2goZGVmbGF0ZShmaWxlLCBwLCBjYmwpKTtcbiAgICB9O1xuICAgIC8vIENhbm5vdCB1c2UgbGZ0IGJlY2F1c2UgaXQgY2FuIGRlY3JlYXNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGZ0OyArK2kpIHtcbiAgICAgICAgX2xvb3BfMShpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRBbGw7XG59XG4vKipcbiAqIFN5bmNocm9ub3VzbHkgY3JlYXRlcyBhIFpJUCBmaWxlLiBQcmVmZXIgdXNpbmcgYHppcGAgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICogd2l0aCBtb3JlIHRoYW4gb25lIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGlyZWN0b3J5IHN0cnVjdHVyZSBmb3IgdGhlIFpJUCBhcmNoaXZlXG4gKiBAcGFyYW0gb3B0cyBUaGUgbWFpbiBvcHRpb25zLCBtZXJnZWQgd2l0aCBwZXItZmlsZSBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZ2VuZXJhdGVkIFpJUCBhcmNoaXZlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6aXBTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgciA9IHt9O1xuICAgIHZhciBmaWxlcyA9IFtdO1xuICAgIGZsdG4oZGF0YSwgJycsIHIsIG9wdHMpO1xuICAgIHZhciBvID0gMDtcbiAgICB2YXIgdG90ID0gMDtcbiAgICBmb3IgKHZhciBmbiBpbiByKSB7XG4gICAgICAgIHZhciBfYSA9IHJbZm5dLCBmaWxlID0gX2FbMF0sIHAgPSBfYVsxXTtcbiAgICAgICAgdmFyIGNvbXByZXNzaW9uID0gcC5sZXZlbCA9PSAwID8gMCA6IDg7XG4gICAgICAgIHZhciBmID0gc3RyVG9VOChmbiksIHMgPSBmLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbSA9IHAuY29tbWVudCwgbSA9IGNvbSAmJiBzdHJUb1U4KGNvbSksIG1zID0gbSAmJiBtLmxlbmd0aDtcbiAgICAgICAgdmFyIGV4bCA9IGV4ZmwocC5leHRyYSk7XG4gICAgICAgIGlmIChzID4gNjU1MzUpXG4gICAgICAgICAgICBlcnIoMTEpO1xuICAgICAgICB2YXIgZCA9IGNvbXByZXNzaW9uID8gZGVmbGF0ZVN5bmMoZmlsZSwgcCkgOiBmaWxlLCBsID0gZC5sZW5ndGg7XG4gICAgICAgIHZhciBjID0gY3JjKCk7XG4gICAgICAgIGMucChmaWxlKTtcbiAgICAgICAgZmlsZXMucHVzaChtcmcocCwge1xuICAgICAgICAgICAgc2l6ZTogZmlsZS5sZW5ndGgsXG4gICAgICAgICAgICBjcmM6IGMuZCgpLFxuICAgICAgICAgICAgYzogZCxcbiAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICBtOiBtLFxuICAgICAgICAgICAgdTogcyAhPSBmbi5sZW5ndGggfHwgKG0gJiYgKGNvbS5sZW5ndGggIT0gbXMpKSxcbiAgICAgICAgICAgIG86IG8sXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogY29tcHJlc3Npb25cbiAgICAgICAgfSkpO1xuICAgICAgICBvICs9IDMwICsgcyArIGV4bCArIGw7XG4gICAgICAgIHRvdCArPSA3NiArIDIgKiAocyArIGV4bCkgKyAobXMgfHwgMCkgKyBsO1xuICAgIH1cbiAgICB2YXIgb3V0ID0gbmV3IHU4KHRvdCArIDIyKSwgb2UgPSBvLCBjZGwgPSB0b3QgLSBvO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGYgPSBmaWxlc1tpXTtcbiAgICAgICAgd3poKG91dCwgZi5vLCBmLCBmLmYsIGYudSwgZi5jLmxlbmd0aCk7XG4gICAgICAgIHZhciBiYWRkID0gMzAgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKTtcbiAgICAgICAgb3V0LnNldChmLmMsIGYubyArIGJhZGQpO1xuICAgICAgICB3emgob3V0LCBvLCBmLCBmLmYsIGYudSwgZi5jLmxlbmd0aCwgZi5vLCBmLm0pLCBvICs9IDE2ICsgYmFkZCArIChmLm0gPyBmLm0ubGVuZ3RoIDogMCk7XG4gICAgfVxuICAgIHd6ZihvdXQsIG8sIGZpbGVzLmxlbmd0aCwgY2RsLCBvZSk7XG4gICAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIHBhc3MtdGhyb3VnaCBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXNcbiAqL1xudmFyIFVuemlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVW56aXBQYXNzVGhyb3VnaCgpIHtcbiAgICB9XG4gICAgVW56aXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgLy8gc2FtZSBhcyBaaXBQYXNzVGhyb3VnaDogY2FzdCB0byByZXRhaW4gQnVmZmVyIGVyZ29ub21pY3NcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIFVuemlwUGFzc1Rocm91Z2guY29tcHJlc3Npb24gPSAwO1xuICAgIHJldHVybiBVbnppcFBhc3NUaHJvdWdoO1xufSgpKTtcbmV4cG9ydCB7IFVuemlwUGFzc1Rocm91Z2ggfTtcbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzLiBQcmVmZXIgQXN5bmNaaXBJbmZsYXRlIGZvclxuICogYmV0dGVyIHBlcmZvcm1hbmNlLlxuICovXG52YXIgVW56aXBJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBERUZMQVRFIGRlY29tcHJlc3Npb24gdGhhdCBjYW4gYmUgdXNlZCBpbiBaSVAgYXJjaGl2ZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBVbnppcEluZmxhdGUoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuaSA9IG5ldyBJbmZsYXRlKGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmkucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlLCBudWxsLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFVuemlwSW5mbGF0ZS5jb21wcmVzc2lvbiA9IDg7XG4gICAgcmV0dXJuIFVuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBVbnppcEluZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlc1xuICovXG52YXIgQXN5bmNVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFzeW5jVW56aXBJbmZsYXRlKF8sIHN6KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmIChzeiA8IDMyMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaSA9IG5ldyBBc3luY0luZmxhdGUoZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnRlcm1pbmF0ZSA9IHRoaXMuaS50ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXN5bmNVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmkudGVybWluYXRlKVxuICAgICAgICAgICAgY2h1bmsgPSBzbGMoY2h1bmssIDApO1xuICAgICAgICB0aGlzLmkucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgQXN5bmNVbnppcEluZmxhdGUuY29tcHJlc3Npb24gPSA4O1xuICAgIHJldHVybiBBc3luY1VuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1VuemlwSW5mbGF0ZSB9O1xuLyoqXG4gKiBBIFpJUCBhcmNoaXZlIGRlY29tcHJlc3Npb24gc3RyZWFtIHRoYXQgZW1pdHMgZmlsZXMgYXMgdGhleSBhcmUgZGlzY292ZXJlZFxuICovXG52YXIgVW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFpJUCBkZWNvbXByZXNzaW9uIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBhIGZpbGUgaW4gdGhlIFpJUCBhcmNoaXZlIGlzIGZvdW5kXG4gICAgICovXG4gICAgZnVuY3Rpb24gVW56aXAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmZpbGUgPSBjYjtcbiAgICAgICAgdGhpcy5rID0gW107XG4gICAgICAgIHRoaXMubyA9IHtcbiAgICAgICAgICAgIDA6IFVuemlwUGFzc1Rocm91Z2hcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHVuemlwcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMub25maWxlKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAoIXRoaXMucClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgaWYgKHRoaXMuYyA+IDApIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBNYXRoLm1pbih0aGlzLmMsIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgdG9BZGQgPSBjaHVuay5zdWJhcnJheSgwLCBsZW4pO1xuICAgICAgICAgICAgdGhpcy5jIC09IGxlbjtcbiAgICAgICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICAgICAgdGhpcy5kLnB1c2godG9BZGQsICF0aGlzLmMpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMua1swXS5wdXNoKHRvQWRkKTtcbiAgICAgICAgICAgIGNodW5rID0gY2h1bmsuc3ViYXJyYXkobGVuKTtcbiAgICAgICAgICAgIGlmIChjaHVuay5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGYgPSAwLCBpID0gMCwgaXMgPSB2b2lkIDAsIGJ1ZiA9IHZvaWQgMDtcbiAgICAgICAgICAgIGlmICghdGhpcy5wLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidWYgPSBjaHVuaztcbiAgICAgICAgICAgIGVsc2UgaWYgKCFjaHVuay5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYnVmID0gdGhpcy5wO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYnVmID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjaHVuay5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGJ1Zi5zZXQodGhpcy5wKSwgYnVmLnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbCA9IGJ1Zi5sZW5ndGgsIG9jID0gdGhpcy5jLCBhZGQgPSBvYyAmJiB0aGlzLmQ7XG4gICAgICAgICAgICB2YXIgX2xvb3BfMiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2lnID0gYjQoYnVmLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4NDAzNEI1MCkge1xuICAgICAgICAgICAgICAgICAgICBmID0gMSwgaXMgPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzXzEuZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJmID0gYjIoYnVmLCBpICsgNiksIGNtcF8xID0gYjIoYnVmLCBpICsgOCksIHUgPSBiZiAmIDIwNDgsIGRkID0gYmYgJiA4LCBmbmwgPSBiMihidWYsIGkgKyAyNiksIGVzID0gYjIoYnVmLCBpICsgMjgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobCA+IGkgKyAzMCArIGZubCArIGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hrc18zID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuay51bnNoaWZ0KGNoa3NfMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsc2MgPSBiNChidWYsIGkgKyAxOCksIGxzdSA9IGI0KGJ1ZiwgaSArIDIyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbl8xID0gc3RyRnJvbVU4KGJ1Zi5zdWJhcnJheShpICsgMzAsIGkgKz0gMzAgKyBmbmwpLCAhdSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2EgPSB6NjRocyhidWYsIGksIGVzLCAyLCBsc2MsIGxzdSwgMCksIHNjXzEgPSBfYVswXSwgc3VfMSA9IF9hWzFdLCB6NjQgPSBfYVszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY18xID0gLTEgLSB6NjQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmMgPSBzY18xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZm5fMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2lvbjogY21wXzEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlXzEub25kYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNjXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKG51bGwsIGV0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3RyID0gX3RoaXMub1tjbXBfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY21wXzEsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEgPSBzY18xIDwgMCA/IG5ldyBjdHIoZm5fMSkgOiBuZXcgY3RyKGZuXzEsIHNjXzEsIHN1XzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZF8xLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHsgZmlsZV8xLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpOyB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjaGtzXzQgPSBjaGtzXzM7IF9pIDwgY2hrc180Lmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXQgPSBjaGtzXzRbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS5wdXNoKGRhdCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmtbMF0gPT0gY2hrc18zICYmIF90aGlzLmMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZCA9IGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEucHVzaChldCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZF8xICYmIGRfMS50ZXJtaW5hdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY18xID49IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZV8xLnNpemUgPSBzY18xLCBmaWxlXzEub3JpZ2luYWxTaXplID0gc3VfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5vbmZpbGUoZmlsZV8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4ODA3NEI1MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXMgPSBpICs9IDEyICsgKG9jID09IC0yICYmIDgpLCBmID0gMywgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzaWcgPT0gMHgyMDE0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcyA9IGkgLT0gNCwgZiA9IDMsIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRoaXNfMSA9IHRoaXM7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IGwgLSA0OyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGVfMSA9IF9sb29wXzIoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVfMSA9PT0gXCJicmVha1wiKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucCA9IGV0O1xuICAgICAgICAgICAgaWYgKG9jIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXQgPSBmID8gYnVmLnN1YmFycmF5KDAsIGlzIC0gMTIgLSAob2MgPT0gLTIgJiYgOCkgLSAoYjQoYnVmLCBpcyAtIDE2KSA9PSAweDgwNzRCNTAgJiYgNCkpIDogYnVmLnN1YmFycmF5KDAsIGkpO1xuICAgICAgICAgICAgICAgIGlmIChhZGQpXG4gICAgICAgICAgICAgICAgICAgIGFkZC5wdXNoKGRhdCwgISFmKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua1srKGYgPT0gMildLnB1c2goZGF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmICYgMilcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGJ1Zi5zdWJhcnJheShpKSwgZmluYWwpO1xuICAgICAgICAgICAgdGhpcy5wID0gYnVmLnN1YmFycmF5KGkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYylcbiAgICAgICAgICAgICAgICBlcnIoMTMpO1xuICAgICAgICAgICAgdGhpcy5wID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgZGVjb2RlciB3aXRoIHRoZSBzdHJlYW0sIGFsbG93aW5nIGZvciBmaWxlcyBjb21wcmVzc2VkIHdpdGhcbiAgICAgKiB0aGUgY29tcHJlc3Npb24gdHlwZSBwcm92aWRlZCB0byBiZSBleHBhbmRlZCBjb3JyZWN0bHlcbiAgICAgKiBAcGFyYW0gZGVjb2RlciBUaGUgZGVjb2RlciBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChkZWNvZGVyKSB7XG4gICAgICAgIHRoaXMub1tkZWNvZGVyLmNvbXByZXNzaW9uXSA9IGRlY29kZXI7XG4gICAgfTtcbiAgICByZXR1cm4gVW56aXA7XG59KCkpO1xuZXhwb3J0IHsgVW56aXAgfTtcbnZhciBtdCA9IHR5cGVvZiBxdWV1ZU1pY3JvdGFzayA9PSAnZnVuY3Rpb24nID8gcXVldWVNaWNyb3Rhc2sgOiB0eXBlb2Ygc2V0VGltZW91dCA9PSAnZnVuY3Rpb24nID8gc2V0VGltZW91dCA6IGZ1bmN0aW9uIChmbikgeyBmbigpOyB9O1xuZXhwb3J0IGZ1bmN0aW9uIHVuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgdmFyIHRlcm0gPSBbXTtcbiAgICB2YXIgdEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgdGVybVtpXSgpO1xuICAgIH07XG4gICAgdmFyIGZpbGVzID0ge307XG4gICAgdmFyIGNiZCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIG10KGZ1bmN0aW9uICgpIHsgY2IoYSwgYik7IH0pO1xuICAgIH07XG4gICAgbXQoZnVuY3Rpb24gKCkgeyBjYmQgPSBjYjsgfSk7XG4gICAgdmFyIGUgPSBkYXRhLmxlbmd0aCAtIDIyO1xuICAgIGZvciAoOyBiNChkYXRhLCBlKSAhPSAweDYwNTRCNTA7IC0tZSkge1xuICAgICAgICBpZiAoIWUgfHwgZGF0YS5sZW5ndGggLSBlID4gNjU1NTgpIHtcbiAgICAgICAgICAgIGNiZChlcnIoMTMsIDAsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybiB0QWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICB2YXIgbGZ0ID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmIChsZnQpIHtcbiAgICAgICAgdmFyIGMgPSBsZnQ7XG4gICAgICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICAgICAgdmFyIHogPSBiNChkYXRhLCBlIC0gMjApID09IDB4NzA2NEI1MDtcbiAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgICAgICB6ID0gYjQoZGF0YSwgemUpID09IDB4NjA2NEI1MDtcbiAgICAgICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICAgICAgYyA9IGxmdCA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgICAgIG8gPSBiNChkYXRhLCB6ZSArIDQ4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmx0ciA9IG9wdHMgJiYgb3B0cy5maWx0ZXI7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IHpoKGRhdGEsIG8sIHopLCBjXzEgPSBfYVswXSwgc2MgPSBfYVsxXSwgc3UgPSBfYVsyXSwgZm4gPSBfYVszXSwgbm8gPSBfYVs0XSwgb2ZmID0gX2FbNV0sIGIgPSBzbHpoKGRhdGEsIG9mZik7XG4gICAgICAgICAgICBvID0gbm87XG4gICAgICAgICAgICB2YXIgY2JsID0gZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWxmdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiZChudWxsLCBmaWxlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBmbixcbiAgICAgICAgICAgICAgICBzaXplOiBzYyxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjXzFcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjXzEpXG4gICAgICAgICAgICAgICAgICAgIGNibChudWxsLCBzbGMoZGF0YSwgYiwgYiArIHNjKSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY18xID09IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZmwgPSBkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN5bmNocm9ub3VzbHkgZGVjb21wcmVzcyB1bmRlciA1MTJLQiwgb3IgYmFyZWx5LWNvbXByZXNzZWQgZGF0YVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3UgPCA1MjQyODggfHwgc2MgPiAwLjggKiBzdSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwobnVsbCwgaW5mbGF0ZVN5bmMoaW5mbCwgeyBvdXQ6IG5ldyB1OChzdSkgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwoZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGVybS5wdXNoKGluZmxhdGUoaW5mbCwgeyBzaXplOiBzdSB9LCBjYmwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjYmwoZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjXzEsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYmwobnVsbCwgbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYzsgKytpKSB7XG4gICAgICAgICAgICBfbG9vcF8zKGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgY2JkKG51bGwsIHt9KTtcbiAgICByZXR1cm4gdEFsbDtcbn1cbi8qKlxuICogU3luY2hyb25vdXNseSBkZWNvbXByZXNzZXMgYSBaSVAgYXJjaGl2ZS4gUHJlZmVyIHVzaW5nIGB1bnppcGAgZm9yIGJldHRlclxuICogcGVyZm9ybWFuY2Ugd2l0aCBtb3JlIHRoYW4gb25lIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSBUaGUgcmF3IGNvbXByZXNzZWQgWklQIGZpbGVcbiAqIEBwYXJhbSBvcHRzIFRoZSBaSVAgZXh0cmFjdGlvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZGVjb21wcmVzc2VkIGZpbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIHZhciBmaWxlcyA9IHt9O1xuICAgIHZhciBlID0gZGF0YS5sZW5ndGggLSAyMjtcbiAgICBmb3IgKDsgYjQoZGF0YSwgZSkgIT0gMHg2MDU0QjUwOyAtLWUpIHtcbiAgICAgICAgaWYgKCFlIHx8IGRhdGEubGVuZ3RoIC0gZSA+IDY1NTU4KVxuICAgICAgICAgICAgZXJyKDEzKTtcbiAgICB9XG4gICAgO1xuICAgIHZhciBjID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmICghYylcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICB2YXIgeiA9IGI0KGRhdGEsIGUgLSAyMCkgPT0gMHg3MDY0QjUwO1xuICAgIGlmICh6KSB7XG4gICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgIHogPSBiNChkYXRhLCB6ZSkgPT0gMHg2MDY0QjUwO1xuICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgYyA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgbyA9IGI0KGRhdGEsIHplICsgNDgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBmbHRyID0gb3B0cyAmJiBvcHRzLmZpbHRlcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGM7ICsraSkge1xuICAgICAgICB2YXIgX2EgPSB6aChkYXRhLCBvLCB6KSwgY18yID0gX2FbMF0sIHNjID0gX2FbMV0sIHN1ID0gX2FbMl0sIGZuID0gX2FbM10sIG5vID0gX2FbNF0sIG9mZiA9IF9hWzVdLCBiID0gc2x6aChkYXRhLCBvZmYpO1xuICAgICAgICBvID0gbm87XG4gICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgIG5hbWU6IGZuLFxuICAgICAgICAgICAgc2l6ZTogc2MsXG4gICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgY29tcHJlc3Npb246IGNfMlxuICAgICAgICB9KSkge1xuICAgICAgICAgICAgaWYgKCFjXzIpXG4gICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gc2xjKGRhdGEsIGIsIGIgKyBzYyk7XG4gICAgICAgICAgICBlbHNlIGlmIChjXzIgPT0gOClcbiAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBpbmZsYXRlU3luYyhkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyksIHsgb3V0OiBuZXcgdTgoc3UpIH0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY18yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmlsZXM7XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBEYXRhQWRhcHRlciwgbm9ybWFsaXplUGF0aCwgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MsIE5vaXNlSXRlbSB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcbmltcG9ydCB7IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUywgTUlNRV9UWVBFUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5pbXBvcnQgdHlwZSB7IERheURhdGEgfSBmcm9tICcuLi90eXBlcy9kYXRhJztcbmltcG9ydCB7IFBST1RPQ09MX1ZFUlNJT04sIElOQk9VTkRfUFJFRklYRVMgfSBmcm9tICcuL3Byb3RvY29sJztcblxuLyoqIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1OEZEMFx1ODg0Q1x1NjVGNlx1NkNFOFx1NTE2NVx1NzY4NFx1NEUzQlx1N0E5N1x1NTNFMyBkb2N1bWVudFx1RkYwOFx1OTc1RVx1NjNEMlx1NEVGNlx1NkM5OVx1N0JCMVx1NTE4NVx1NzY4NCBkb2N1bWVudFx1RkYwOSAqL1xuZGVjbGFyZSBjb25zdCBhY3RpdmVEb2N1bWVudDogRG9jdW1lbnQ7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MEQgKi9cbmNvbnN0IFNLSVBfRElSUyA9IFsnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ107XG5cbi8qKlxuICogXHU2ODIxXHU5QThDXHU5N0YzXHU2RTkwXHU0RUUzXHU3NDA2IFVSTFx1RkYxQVx1NEVDNVx1NTE0MVx1OEJCOCBodHRwL2h0dHBzIFx1NTM0Rlx1OEJBRVx1RkYwQ1x1OTY1MFx1NTIzNlx1OTU3Rlx1NUVBNlx1RkYwQ1xuICogXHU5NjMyXHU2QjYyIGBhcHA6cHJveHlBdWRpb1VybGAgXHU2MjEwXHU0RTNBXHU4RkQwXHU4ODRDXHU1NzI4XHU3NTI4XHU2MjM3XHU2NzNBXHU1NjY4XHU0RTBBXHU3Njg0XHU1RjAwXHU2NTNFIGZldGNoIFx1NEVFM1x1NzQwNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEF1ZGlvVXJsKHVybDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghdXJsIHx8IHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gIGlmICh1cmwubGVuZ3RoID4gMjA0OCkgcmV0dXJuIGZhbHNlO1xuICBsZXQgcGFyc2VkOiBVUkw7XG4gIHRyeSB7XG4gICAgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZC5wcm90b2NvbCA9PT0gJ2h0dHA6JyB8fCBwYXJzZWQucHJvdG9jb2wgPT09ICdodHRwczonO1xufVxuXG4vKiogQXJyYXlCdWZmZXIgXHUyMTkyIGJhc2U2NCBcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDhcdTU5MjdcdTY1ODdcdTRFRjZcdTUyMDZcdTU3NTdcdUZGMENcdTkwN0ZcdTUxNERcdThDMDNcdTc1MjhcdTY4MDhcdTZFQTJcdTUxRkFcdUZGMDkgKi9cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgbGV0IGJpbmFyeSA9ICcnO1xuICBjb25zdCBjaHVua1NpemUgPSAweDgwMDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IGNodW5rU2l6ZSkge1xuICAgIGNvbnN0IGNodW5rID0gYnl0ZXMuc3ViYXJyYXkoaSwgaSArIGNodW5rU2l6ZSk7XG4gICAgbGV0IGNodW5rU3RyID0gJyc7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaHVuay5sZW5ndGg7IGorKykge1xuICAgICAgY2h1bmtTdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaHVua1tqXSk7XG4gICAgfVxuICAgIGJpbmFyeSArPSBjaHVua1N0cjtcbiAgfVxuICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG4vKipcbiAqIEFwcEFQSSBcdTIwMTQgXHU3RURGXHU0RTAwXHU5MDFBXHU0RkUxXHU2M0E1XHU1M0UzXG4gKlxuICogXHU2NkZGXHU0RUUzXHU2NUU3XHU3Njg0IEJyaWRnZVNlcnZpY2UgKyBTdG9yYWdlQnJpZGdlICsgVGhlbWVCcmlkZ2UgXHU0RTA5XHU1QzQyXHU2N0I2XHU2Nzg0XHVGRjBDXG4gKiBcdTVDMDYgcG9zdE1lc3NhZ2UgXHU4REVGXHU3NTMxXHUzMDAxXHU1QjU4XHU1MEE4XHU2NENEXHU0RjVDXHUzMDAxXHU0RTNCXHU5ODk4XHU1NDBDXHU2QjY1XHU1NDA4XHU1RTc2XHU0RTNBXHU1MzU1XHU0RTAwIEFQSVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQXBwQVBJIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFx1MzAwQ1x1NjIxOFx1NzU2NVx1NTkwRFx1NzZEOFx1OTc2Mlx1Njc3RiBcdTIxOTIgQUkgXHU2NTM5XHU4RkRCXHUzMDBEXHU1MTY1XHU1M0UzXHU1NkRFXHU4QzAzXHVGRjA4XHU3NTMxIERhaWx5UmV2aWV3VmlldyBcdTZDRThcdTUxNjVcdUZGMENcdThGNkNcdTUzRDFcdTUyMzBcdTYzRDJcdTRFRjYgcmVxdWVzdEFpSW1wcm92ZVx1RkYwOVx1MzAwMlxuICAgKiB3ZWJhcHAgXHU1MDY1XHU1RUI3XHU1MjA2XHU4QkU2XHU2MEM1XHU3MEI5XHUzMDBDXHU3NTI4IEFJIFx1NjUzOVx1OEZEQlx1MzAwRFx1NjVGNlx1ODlFNlx1NTNEMVx1RkYwQ1x1NTNDMlx1NjU3MFx1NEUzQVx1NzZFRVx1NjgwN1x1NjgwN1x1OEJDNiArIFx1NjcyQ1x1NTczMCBoaW50c1x1MzAwMlxuICAgKi9cbiAgb25BaUltcHJvdmVHb2FsPzogKHBheWxvYWQ6IHsgZ29hbElkOiBzdHJpbmc7IHRpdGxlPzogc3RyaW5nOyBoaW50cz86IHN0cmluZyB9KSA9PiB2b2lkO1xuICBwcml2YXRlIGN1c3RvbVRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICBwcml2YXRlIHZhdWx0QWRhcHRlcjogRGF0YUFkYXB0ZXI7XG4gIHByaXZhdGUgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgY29uZmlnRGlyOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBBcHAsXG4gICAgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLFxuICAgIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPixcbiAgICBub2lzZVBhdGg6IHN0cmluZyxcbiAgICBjb25maWdEaXI6IHN0cmluZ1xuICApIHtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3M7XG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBd2ViYXBwIFx1OEJGQlx1NTNENlx1NzZFRVx1NjgwN1x1NzY4NFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1NzUzMVx1NkI2NFx1NTkwNFx1NTFCM1x1NUI5QVx1RkYwOFZhdWx0U3RvcmFnZSBcdTlFRDhcdThCQTQgYmFzZVBhdGggPSBiYW1ib28tcmV2aWV3XHVGRjA5XHUzMDAyXG4gICAgLy8gd3JpdGVBaUdvYWxzIFx1NUZDNVx1OTg3Qlx1NTE5OVx1NTE2NVx1NTQwQ1x1NEUwMFx1OERFRlx1NUY4NFx1RkYwQ1x1NTQyNlx1NTIxOSBBSSBcdTc2RUVcdTY4MDdcdTRFMERcdTY2M0VcdTc5M0FcdTMwMDJcdThCRTZcdTg5QzEgbWFpbi50cyB3cml0ZUFpR29hbHMgXHU3Njg0XHU2Q0U4XHU5MUNBXHUzMDAyXG4gICAgdGhpcy5zdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZShhcHApO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UgPSBuZXcgVGhlbWVCcmlkZ2UoKTtcbiAgICB0aGlzLnZhdWx0QWRhcHRlciA9IGFwcC52YXVsdC5hZGFwdGVyO1xuICAgIHRoaXMubm9pc2VQYXRoID0gbm9pc2VQYXRoO1xuICAgIHRoaXMuY29uZmlnRGlyID0gY29uZmlnRGlyO1xuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NUI1OFx1NTBBOFx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLmVuc3VyZVN0cnVjdHVyZSgpO1xuICB9XG5cbiAgLyoqIFx1OEJCRVx1N0Y2RVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTIxN1x1ODg2OCAqL1xuICBzZXRDdXN0b21UaGVtZXModGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+KTogdm9pZCB7XG4gICAgdGhpcy5jdXN0b21UaGVtZXMgPSB0aGVtZXM7XG4gIH1cblxuICAvKiogXG4gICAqIFx1OTg4NFx1NkNFOFx1NTE4QyBtZXNzYWdlIFx1NzZEMVx1NTQyQ1x1NTY2OFx1MzAwMlxuICAgKiBcdTU3MjggaWZyYW1lIFx1NTIxQlx1NUVGQVx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwQ1x1NkQ4OFx1OTY2NFx1N0FERVx1NjAwMVx1N0E5N1x1NTNFM1x1MzAwMlxuICAgKiBcdTRGN0ZcdTc1MjggYWN0aXZlRG9jdW1lbnQuZGVmYXVsdFZpZXdcdUZGMDhcdTRFM0IgT2JzaWRpYW4gXHU3QTk3XHU1M0UzXHVGRjA5XHU4MDBDXHU5NzVFXHU2M0QyXHU0RUY2XHU2Qzk5XHU3QkIxIHdpbmRvd1x1MzAwMlxuICAgKi9cbiAgc3RhcnRMaXN0ZW5pbmcoKTogdm9pZCB7XG4gICAgdGhpcy5kZXRhY2goKTtcbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5vbk1lc3NhZ2UoZXZlbnQpO1xuICAgIH07XG4gICAgLy8gYnJpZGdlLmpzIFx1NzY4NCBwb3N0TWVzc2FnZSBcdTc2RUVcdTY4MDdcdTY2MkYgd2luZG93LnBhcmVudFx1RkYwOFx1NEUzQiBPYnNpZGlhbiBcdTdBOTdcdTUzRTNcdUZGMDlcdUZGMENcbiAgICAvLyBcdTVGQzVcdTk4N0JcdTU3MjhcdThCRTVcdTdBOTdcdTUzRTNcdTRFMEFcdTc2RDFcdTU0MkNcdTYyNERcdTgwRkRcdTY1MzZcdTUyMzBcdTZEODhcdTYwNkZcdUZGMDhcdTYzRDJcdTRFRjZcdTZDOTlcdTdCQjFcdTc2ODQgd2luZG93IFx1NEUwRFx1NjYyRlx1NTQwQ1x1NEUwMFx1NUJGOVx1OEM2MVx1RkYwOVx1MzAwMlxuICAgIChhY3RpdmVEb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3cpLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgfVxuXG4gIC8qKiBcbiAgICogXHU3RUQxXHU1QjlBIGlmcmFtZSBcdTVGMTVcdTc1MjhcdTVFNzZcdTUyMURcdTU5Q0JcdTUzMTZcdTRFM0JcdTk4OThcdTY4NjVcdTYzQTVcdTMwMDJcbiAgICogXHU1NzI4IGlmcmFtZSBcdTUxNDNcdTdEMjBcdTUyMUJcdTVFRkFcdTU0MEVcdThDMDNcdTc1MjhcdUZGMENcdTRGOUIgcmVzcG9uZCgpIFx1ODNCN1x1NTNENiBjb250ZW50V2luZG93XHUzMDAyXG4gICAqL1xuICBiaW5kSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLmF0dGFjaElmcmFtZShpZnJhbWUpO1xuICB9XG5cbiAgLyoqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RTc2XHU1RjAwXHU1OUNCXHU3NkQxXHU1NDJDXHU2RDg4XHU2MDZGXHVGRjA4XHU0RTAwXHU2QjY1XHU1MjMwXHU0RjREXHVGRjBDXHU1MTdDXHU1QkI5XHU2NUU3XHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIGF0dGFjaChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5zdGFydExpc3RlbmluZygpO1xuICAgIHRoaXMuYmluZElmcmFtZShpZnJhbWUpO1xuICB9XG5cbiAgLyoqIFx1ODlFM1x1N0VEMVx1NUU3Nlx1NTA1Q1x1NkI2Mlx1NzZEMVx1NTQyQyAqL1xuICBkZXRhY2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVzc2FnZUhhbmRsZXIpIHtcbiAgICAgIChhY3RpdmVEb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3cpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm1lc3NhZ2VIYW5kbGVyKTtcbiAgICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnRoZW1lQnJpZGdlLmRldGFjaElmcmFtZSgpO1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDFcdUZGMDhcdTc1MzEgRGFpbHlSZXZpZXdWaWV3IFx1NzY4NCBjc3MtY2hhbmdlIFx1NEU4Qlx1NEVGNlx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBvblRoZW1lQ2hhbmdlZChmb2xsb3dPYnNpZGlhblRoZW1lOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lID0gZm9sbG93T2JzaWRpYW5UaGVtZTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZShmb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1NjIxMFx1NTI5Rlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmQoaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICAvLyBcdTVGQzVcdTk4N0JcdTVFMjYgdHlwZSBcdTVCNTdcdTZCQjVcdUZGMUFicmlkZ2UuanMgXHU3Njg0IHBhcnNlQXBwTWVzc2FnZSBcdTg5ODFcdTZDNDIgdHlwZW9mIGRhdGEudHlwZSA9PT0gJ3N0cmluZydcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgdHlwZTogJ3N0b3JhZ2U6cmVzcG9uc2UnLCBpZCwgcGF5bG9hZCB9LCAnKicpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU5NTE5XHU4QkVGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZEVycm9yKGlkOiBzdHJpbmcsIGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IHR5cGU6ICdzdG9yYWdlOnJlc3BvbnNlJywgaWQsIGVycm9yIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU4REVGXHU3NTMxICovXG4gIHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKGV2ZW50OiBNZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtc2cgPSBldmVudC5kYXRhIGFzIHsgdHlwZT86IHN0cmluZzsgaWQ/OiBzdHJpbmc7IHBheWxvYWQ/OiB1bmtub3duIH07XG4gICAgaWYgKCFtc2cgfHwgIW1zZy50eXBlIHx8ICFtc2cuaWQpIHJldHVybjtcblxuICAgIC8vIFx1Njc2NVx1NkU5MFx1NjgyMVx1OUE4Q1xuICAgIGlmICh0aGlzLmlmcmFtZSAmJiBldmVudC5zb3VyY2UgIT09IHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIC8vIFx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4Qlx1NzY3RFx1NTQwRFx1NTM1NVx1RkYwOFx1OTYzNlx1NkJCNTMgXHUwMEI3IFx1NTk1MVx1N0VBNlx1NTMxNlx1RkYxQVx1NEVDRSBwcm90b2NvbC50cyBcdTk2QzZcdTRFMkRcdTVCOUFcdTRFNDlcdUZGMDlcbiAgICBpZiAoIUlOQk9VTkRfUFJFRklYRVMuc29tZSgocCkgPT4gbXNnLnR5cGUhLnN0YXJ0c1dpdGgocCkpKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVNZXNzYWdlKG1zZy50eXBlLCBtc2cuaWQsIG1zZy5wYXlsb2FkID8/IHt9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihtc2cuaWQsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NkQ4OFx1NjA2Rlx1NTIwNlx1NTNEMVx1NTkwNFx1NzQwNiAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZU1lc3NhZ2UodHlwZTogc3RyaW5nLCBpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gLS0tLSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUYgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWR5Jykge1xuICAgICAgLy8gXHU5NjM2XHU2QkI1MyBcdTAwQjcgXHU1OTUxXHU3RUE2XHU1MzE2XHVGRjFBXHU3MjQ4XHU2NzJDXHU1MzRGXHU1NTQ2IFx1MjAxNCBcdTYzRDJcdTRFRjZcdTUzNDdcdTdFQTdcdTRGNDYgd2ViYXBwIFx1N0YxM1x1NUI1OFx1NjVFN1x1NzI0OFx1NjVGNlx1NTNFRlx1ODlDMVx1NTQ0QVx1OEI2NlxuICAgICAgY29uc3QgcHYgPSAocGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik/LnByb3RvY29sVmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgcHYgPT09ICdudW1iZXInICYmIHB2ICE9PSBQUk9UT0NPTF9WRVJTSU9OKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgW0JhbWJvb10gXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDXHU0RTBEXHU1MzM5XHU5MTREXHVGRjFBXHU2M0QyXHU0RUY2PSR7UFJPVE9DT0xfVkVSU0lPTn1cdUZGMEN3ZWJhcHA9JHtwdn1cdTMwMDJgICtcbiAgICAgICAgICAgIGBcdThCRjdcdTkxQ0RcdTY1QjBcdTUyQTBcdThGN0RcdTg5QzZcdTU2RkVcdTRFRTVcdTgzQjdcdTUzRDZcdTY3MDBcdTY1QjAgd2ViYXBwXHUzMDAyYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKHRoaXMuc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHtcbiAgICAgICAgb2s6IHRydWUsXG4gICAgICAgIHNlY3Rpb25Db25maWc6IHRoaXMuc2V0dGluZ3Muc2VjdGlvbkNvbmZpZyB8fCBudWxsLFxuICAgICAgICBjdXN0b21UaGVtZXM6IHRoaXMuY3VzdG9tVGhlbWVzLFxuICAgICAgICBjdXN0b21Ob2lzZXM6IHRoaXMuc2V0dGluZ3Mubm9pc2VJdGVtcyB8fCBbXSxcbiAgICAgICAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiB0aGlzLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiB8fCBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0eXBlID09PSAnYXBwOmNsb3NlJykge1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU2NzdGXHU1NzU3XHU5MTREXHU3RjZFIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpzYXZlU2VjdGlvbkNvbmZpZycpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3Muc2VjdGlvbkNvbmZpZyA9IHBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MCAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6c2F2ZUN1c3RvbU5vaXNlcycpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3Mubm9pc2VJdGVtcyA9IChBcnJheS5pc0FycmF5KHBheWxvYWQpID8gcGF5bG9hZCA6IFtdKSBhcyBOb2lzZUl0ZW1bXTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdUZGMDh3ZWJhcHAgXHUyMTkyIE9ic2lkaWFuXHVGRjA5LS0tLVxuICAgIGlmICh0eXBlID09PSAndGhlbWU6c3luY1BhbGV0dGUnKSB7XG4gICAgICBjb25zdCBwID0gcGF5bG9hZCBhcyB7IGh1ZTogbnVtYmVyOyBsaWdodG5lc3NPZmZzZXQ6IG51bWJlcjsgaXNEYXJrOiBib29sZWFuIH07XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pIHtcbiAgICAgICAgdGhpcy50aGVtZUJyaWRnZS5hcHBseVBhbGV0dGUocC5odWUsIHAubGlnaHRuZXNzT2Zmc2V0LCBwLmlzRGFyayk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTkxQ0RcdTY1QjBcdTVGMDBcdTU0MkZcdTRFM0JcdTk4OThcdThEREZcdTk2OEZcdUZGMDh3ZWJhcHAgXHUyMTkyIE9ic2lkaWFuXHVGRjA5LS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnRoZW1lOnN5bmMnKSB7XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSh0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjZCXHU2M0NGIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpsaXN0VmF1bHRBdWRpb0ZpbGVzJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLnNjYW5WYXVsdEF1ZGlvRmlsZXMoKTtcbiAgICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IGZpbGVzIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjI2Qlx1NjNDRlx1NUU5M1x1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpyZWFkVmF1bHRGaWxlJykge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSZWFkVmF1bHRGaWxlKGlkLCBwYXlsb2FkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OEJGQlx1NTNENlx1NjcyQ1x1NjczQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1OTdGM1x1OTg5MVx1RkYwOFx1NTE3Q1x1NUJCOVx1NjVFN1x1OTdGM1x1NkU5MFx1RkYwOS0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpyZWFkTG9jYWxGaWxlJykge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSZWFkTG9jYWxGaWxlKGlkLCBwYXlsb2FkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1NEVFM1x1NzQwNlx1NTkxNlx1OTBFOFx1OTdGM1x1NkU5MFx1OTRGRVx1NjNBNVx1RkYwOFx1N0VENVx1OEZDNyB3ZWJ2aWV3IENPUlNcdUZGMENcdTY4NENcdTk3NjIvXHU3OUZCXHU1MkE4XHU0RTAwXHU4MUY0XHVGRjA5LS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnByb3h5QXVkaW9VcmwnKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVByb3h5QXVkaW9VcmwoaWQsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU2MjE4XHU3NTY1XHU1OTBEXHU3NkQ4XHU5NzYyXHU2NzdGIFx1MjE5MiBBSSBcdTY1MzlcdThGREJcdTUxNjVcdTUzRTMgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOmFpSW1wcm92ZUdvYWwnKSB7XG4gICAgICBjb25zdCBwID0gcGF5bG9hZCBhcyB7IGdvYWxJZD86IHVua25vd247IHRpdGxlPzogdW5rbm93bjsgaGludHM/OiB1bmtub3duIH07XG4gICAgICBpZiAodHlwZW9mIHAuZ29hbElkICE9PSAnc3RyaW5nJyB8fCBwLmdvYWxJZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IoaWQsICdhcHA6YWlJbXByb3ZlR29hbCBcdTdGM0FcdTVDMTEgZ29hbElkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMub25BaUltcHJvdmVHb2FsPy4oe1xuICAgICAgICBnb2FsSWQ6IHAuZ29hbElkLFxuICAgICAgICB0aXRsZTogdHlwZW9mIHAudGl0bGUgPT09ICdzdHJpbmcnID8gcC50aXRsZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgaGludHM6IHR5cGVvZiBwLmhpbnRzID09PSAnc3RyaW5nJyA/IHAuaGludHMgOiB1bmRlZmluZWQsXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2Rlx1RkYwOFx1NTlENFx1NjI1OFx1N0VEOSBWYXVsdFN0b3JhZ2VcdUZGMDktLS0tXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5oYW5kbGVTdG9yYWdlTWVzc2FnZSh0eXBlLCBwYXlsb2FkKTtcbiAgICB0aGlzLnJlc3BvbmQoaWQsIHJlc3VsdCk7XG4gIH1cblxuICAvKiogXHU1QjU4XHU1MEE4XHU2RDg4XHU2MDZGXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlU3RvcmFnZU1lc3NhZ2UodHlwZTogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcCA9IHBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShwLmRhdGVLZXkgYXMgc3RyaW5nKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dERheShwLmRhdGEgYXMgRGF5RGF0YSk7XG4gICAgICBjYXNlICdzdG9yYWdlOmxpc3REYXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxEYXlzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlRGF5KHAuZGF0ZUtleSBhcyBzdHJpbmcpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRTZXR0aW5nKHAua2V5IGFzIHN0cmluZyk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFNldHRpbmcocC5rZXkgYXMgc3RyaW5nLCBwLnZhbHVlKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbFNldHRpbmdzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0R29hbHMocC5nb2FscyBhcyBuZXZlcik7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0UHVyY2hhc2VIaXN0b3J5KHAuZGF0YSBhcyBuZXZlcik7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0SW5jb21lSGlzdG9yeShwLmRhdGEgYXMgbmV2ZXIpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheXNQYWdpbmF0ZWQnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheXNQYWdpbmF0ZWQoXG4gICAgICAgICAgKHAucGFnZSBhcyBudW1iZXIpID8/IDAsXG4gICAgICAgICAgKHAucGFnZVNpemUgYXMgbnVtYmVyKSA/PyAzMFxuICAgICAgICApO1xuICAgICAgY2FzZSAnc3RvcmFnZTpleHBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmV4cG9ydEFsbERhdGEoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKFxuICAgICAgICAgIHAuZGF0YSxcbiAgICAgICAgICB7IHN0cmF0ZWd5OiAocC5vcHRpb25zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KT8uc3RyYXRlZ3kgYXMgJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIHwgdW5kZWZpbmVkIH1cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Y2xlYXJBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyQWxsKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RvcmFnZSBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgYXN5bmMgc2NhblZhdWx0QXVkaW9GaWxlcyhcbiAgICBtYXhEZXB0aCA9IDVcbiAgKTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLnZhdWx0QWRhcHRlcjtcblxuICAgIGlmICh0aGlzLm5vaXNlUGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IGFkYXB0ZXIubGlzdCh0aGlzLm5vaXNlUGF0aCk7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0LmZpbGVzKSB7XG4gICAgICAgICAgaWYgKGZpbGUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBleHQgPSBmaWxlLnN1YnN0cmluZyhmaWxlLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKEFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5ub2lzZVBhdGh9LyR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IGZ1bGxQYXRoLCBuYW1lOiBmaWxlLCBzaXplOiBzdGF0Py5zaXplID8/IDAsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTUxNjhcdTVFOTNcdTYyNkJcdTYzQ0ZcbiAgICBjb25zdCBzY2FuRGlyID0gYXN5bmMgKHJlbGF0aXZlRGlyOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICBsZXQgbGlzdDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxpc3QgPSBhd2FpdCBhZGFwdGVyLmxpc3QocmVsYXRpdmVEaXIpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XG4gICAgICAgIGlmIChmb2xkZXIuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc2tpcFNldCA9IG5ldyBTZXQoWy4uLlNLSVBfRElSUywgLi4uKHRoaXMuY29uZmlnRGlyID8gW3RoaXMuY29uZmlnRGlyXSA6IFtdKV0pO1xuICAgICAgICBpZiAoc2tpcFNldC5oYXMoZm9sZGVyKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHN1YlBhdGggPSByZWxhdGl2ZURpciA/IG5vcm1hbGl6ZVBhdGgoYCR7cmVsYXRpdmVEaXJ9LyR7Zm9sZGVyfWApIDogZm9sZGVyO1xuICAgICAgICBhd2FpdCBzY2FuRGlyKHN1YlBhdGgsIGRlcHRoICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0LmZpbGVzKSB7XG4gICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGV4dCA9IGZpbGUuc3Vic3RyaW5nKGZpbGUubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKEFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlRGlyID8gbm9ybWFsaXplUGF0aChgJHtyZWxhdGl2ZURpcn0vJHtmaWxlfWApIDogZmlsZTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQocmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHJlbGF0aXZlUGF0aCwgbmFtZTogZmlsZSwgc2l6ZTogc3RhdD8uc2l6ZSA/PyAwLCBleHQgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGF3YWl0IHNjYW5EaXIoJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjBDXHU4RkQ0XHU1NkRFXHU1M0VGXHU2NEFEXHU2NTNFXHU3Njg0IGJhc2U2NCBkYXRhIFVSTFx1RkYwOFx1Njg0Q1x1OTc2Mi9cdTc5RkJcdTUyQThcdTRFMDBcdTgxRjRcdUZGMENcdTRFMERcdTRGOURcdThENTYgYmFzZVBhdGhcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVSZWFkVmF1bHRGaWxlKGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyBwYXRoOiBzdHJpbmcgfTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHAucGF0aCB8fCAnJztcbiAgICAgIGlmICghcmVsYXRpdmVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuXG4gICAgICBjb25zdCBleHQgPSByZWxhdGl2ZVBhdGguc3Vic3RyaW5nKHJlbGF0aXZlUGF0aC5sYXN0SW5kZXhPZignLicpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgIGlmIChyZWxhdGl2ZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG5cbiAgICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLnZhdWx0QWRhcHRlcjtcbiAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQocmVsYXRpdmVQYXRoKTtcbiAgICAgIGlmICghc3RhdCB8fCBzdGF0LnR5cGUgIT09ICdmaWxlJykgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcblxuICAgICAgY29uc3QgYnVmZmVyID0gYXdhaXQgYWRhcHRlci5yZWFkQmluYXJ5KHJlbGF0aXZlUGF0aCk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZGF0YTogdGhpcy50b0RhdGFVcmwoYnVmZmVyLCBleHQpIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1OEJGQlx1NTNENlx1NjcyQ1x1NjczQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1OTdGM1x1OTg5MVx1RkYwOFx1NTE3Q1x1NUJCOVx1NjVFN1x1OTdGM1x1NkU5MFx1RkYxQlx1NzlGQlx1NTJBOFx1N0FFRlx1NkM5OVx1NzZEMlx1NEUwQlx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1OEJGQlx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZVJlYWRMb2NhbEZpbGUoaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwID0gcGF5bG9hZCBhcyB7IHBhdGg6IHN0cmluZyB9O1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBwLnBhdGggfHwgJyc7XG4gICAgICBpZiAoIWZpbGVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuXG4gICAgICBjb25zdCBleHQgPSBmaWxlUGF0aC5zdWJzdHJpbmcoZmlsZVBhdGgubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICBpZiAoZmlsZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG5cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHRoaXMudmF1bHRBZGFwdGVyLnJlYWRCaW5hcnkoZmlsZVBhdGgpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IGRhdGE6IHRoaXMudG9EYXRhVXJsKGJ1ZmZlciwgZXh0KSB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NjcyQ1x1NTczMFx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTRFRTNcdTc0MDZcdTU5MTZcdTkwRThcdTk3RjNcdTZFOTBcdTk0RkVcdTYzQTVcdUZGMUFcdTYzRDJcdTRFRjZcdTdBRUYgcmVxdWVzdFVybCBcdTRFMERcdTUzRDcgd2VidmlldyBDT1JTIFx1OTY1MFx1NTIzNlx1RkYwOFx1Njg0Q1x1OTc2Mi9cdTc5RkJcdTUyQThcdTU3NDdcdTY1MkZcdTYzMDFcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVQcm94eUF1ZGlvVXJsKGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyB1cmw6IHN0cmluZyB9O1xuICAgICAgY29uc3QgdXJsID0gcC51cmwgfHwgJyc7XG4gICAgICBpZiAoIWlzVmFsaWRBdWRpb1VybCh1cmwpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OTc1RVx1NkNENVx1OTdGM1x1NkU5MFx1OTRGRVx1NjNBNVx1RkYwOFx1NEVDNVx1NjUyRlx1NjMwMSBodHRwL2h0dHBzXHVGRjA5Jyk7XG5cbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCByZXF1ZXN0VXJsKHsgdXJsLCBtZXRob2Q6ICdHRVQnIH0pO1xuICAgICAgaWYgKHJlc3Auc3RhdHVzIDwgMjAwIHx8IHJlc3Auc3RhdHVzID49IDMwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1OTdGM1x1NkU5MFx1OEJCRlx1OTVFRVx1NTkzMVx1OEQyNSAoSFRUUCAnICsgcmVzcC5zdGF0dXMgKyAnKScpO1xuICAgICAgfVxuICAgICAgY29uc3QgYnVmZmVyID0gcmVzcC5hcnJheUJ1ZmZlcjtcbiAgICAgIGlmICghYnVmZmVyKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OTdGM1x1NkU5MFx1NTRDRFx1NUU5NFx1NEUzQVx1N0E3QScpO1xuXG4gICAgICBjb25zdCBtaW1lID0gKHJlc3AuaGVhZGVycyAmJiByZXNwLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddKSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBkYXRhOiBgZGF0YToke21pbWV9O2Jhc2U2NCwke2FycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKX1gIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU0RUUzXHU3NDA2XHU5N0YzXHU2RTkwXHU1OTMxXHU4RDI1Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFycmF5QnVmZmVyIFx1MjE5MiBcdTVFMjYgTUlNRSBcdTc2ODQgYmFzZTY0IGRhdGEgVVJMICovXG4gIHByaXZhdGUgdG9EYXRhVXJsKGJ1ZmZlcjogQXJyYXlCdWZmZXIsIGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtaW1lID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgIHJldHVybiBgZGF0YToke21pbWV9O2Jhc2U2NCwke2FycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKX1gO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBub3JtYWxpemVQYXRoLCBURmlsZSwgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgSW1wb3J0VmFsaWRhdG9yIH0gZnJvbSAnLi9JbXBvcnRWYWxpZGF0b3InO1xuaW1wb3J0IHR5cGUge1xuICBEYXlEYXRhLFxuICBHb2FsSXRlbSxcbiAgQXBwU2V0dGluZ3MsXG4gIFB1cmNoYXNlSGlzdG9yeSxcbiAgSW5jb21lSGlzdG9yeSxcbiAgRXhwb3J0U2hhcGUsXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG4vKipcbiAqIFZhdWx0U3RvcmFnZSAtIFx1NUMwMVx1ODhDNSBPYnNpZGlhbiBWYXVsdCBhZGFwdGVyIFx1NzY4NFx1NjU4N1x1NEVGNlx1NjRDRFx1NEY1Q1xuICpcbiAqIFZhdWx0IFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NDpcbiAqICAge2Jhc2VQYXRofS9cbiAqICAgICBkYXRhLyAgICAgICAgICAtPiBcdTZCQ0ZcdTY1RTUgSlNPTiBcdTY1NzBcdTYzNkVcbiAqICAgICBnb2Fscy5qc29uICAgICAtPiBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDdcbiAqICAgICBzZXR0aW5ncy5qc29uICAtPiBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkVcbiAqICAgICB0aGVtZXMvICAgICAgICAtPiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXBvcnRzLyAgICAgICAtPiBcdTYyQTVcdTU0NEEgKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXZpZXdzLyAgICAgICAtPiBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuZXhwb3J0IGNsYXNzIFZhdWx0U3RvcmFnZSB7XG4gIHByaXZhdGUgYXBwOiBBcHA7XG4gIHByaXZhdGUgYmFzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NTE5OVx1NUI4OFx1NTM2Qlx1RkYxQVx1NURGMlx1OEI2Nlx1NTQ0QVx1OEZDN1x1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1N0IyQ1x1NEU4Q1x1NkIyMVx1NTE5OVx1NTE2NVx1NjUzRVx1ODg0Q1x1RkYwOFx1NzUyOFx1NjIzN1x1Nzg2RVx1OEJBNFx1NjEwRlx1NTZGRVx1RkYwOSAqL1xuICBwcml2YXRlIF93YXJuZWRQYXRocyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxEYXlEYXRhIHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIERheURhdGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdUZGMENcdTVDMDZcdThERjNcdThGQzc6ICR7cGF0aH1gLCBlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbERheXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPj4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IGZpbGVzLmZpbGVzXG4gICAgICAuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzb24nKSlcbiAgICAgIC5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmICghZGF0ZUtleSkgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChmaWxlKTtcbiAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyBEYXlEYXRhO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcGFyc2UgZGF5IGZpbGU6ICR7ZmlsZX1gLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG4gICAgcmV0dXJuIGRheXM7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU2NUU1XHU2NzFGIGtleVx1RkYwOFx1NjMwOVx1NjVFNVx1NjcxRlx1OTY0RFx1NUU4Rlx1RkYwQ1x1NjcwMFx1NjVCMFx1NTcyOFx1NTI0RFx1RkYwOSAqL1xuICBhc3luYyBnZXREYXlLZXlzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5maWxlcykge1xuICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmIChkYXRlS2V5KSBrZXlzLnB1c2goZGF0ZUtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIGtleXMuc29ydCgpLnJldmVyc2UoKTsgLy8gXHU5NjREXHU1RThGXHVGRjFBXHU2NzAwXHU2NUIwXHU2NUU1XHU2NzFGXHU1NzI4XHU1MjREXG4gICAgcmV0dXJuIGtleXM7XG4gIH1cblxuICAvKipcbiAgICogXHU1MjA2XHU5ODc1XHU1MkEwXHU4RjdEXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXG4gICAqIEBwYXJhbSBwYWdlIFx1OTg3NVx1NzgwMVx1RkYwOFx1NEVDRSAwIFx1NUYwMFx1NTlDQlx1RkYwOVxuICAgKiBAcGFyYW0gcGFnZVNpemUgXHU2QkNGXHU5ODc1XHU2NTcwXHU5MUNGXG4gICAqIEByZXR1cm5zIHsgZGF5cywgdG90YWwsIHBhZ2UsIHBhZ2VTaXplLCBoYXNNb3JlIH1cbiAgICovXG4gIGFzeW5jIGdldERheXNQYWdpbmF0ZWQocGFnZSA9IDAsIHBhZ2VTaXplID0gMzApOiBQcm9taXNlPHtcbiAgICBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICBrZXlzOiBzdHJpbmdbXTtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIGhhc01vcmU6IGJvb2xlYW47XG4gIH0+IHtcbiAgICBjb25zdCBhbGxLZXlzID0gYXdhaXQgdGhpcy5nZXREYXlLZXlzKCk7XG4gICAgY29uc3QgdG90YWwgPSBhbGxLZXlzLmxlbmd0aDtcbiAgICBjb25zdCBzdGFydCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBwYWdlS2V5cyA9IGFsbEtleXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IHBhZ2VLZXlzLm1hcChhc3luYyAoZGF0ZUtleSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0RGF5KGRhdGVLZXkpO1xuICAgICAgICBpZiAoZGF0YSkgZGF5c1tkYXRlS2V5XSA9IGRhdGE7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGxvYWQgZGF5OiAke2RhdGVLZXl9YCwgZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheXMsXG4gICAgICBrZXlzOiBwYWdlS2V5cyxcbiAgICAgIHRvdGFsLFxuICAgICAgcGFnZSxcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgaGFzTW9yZTogc3RhcnQgKyBwYWdlS2V5cy5sZW5ndGggPCB0b3RhbCxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcHV0RGF5KGRheURhdGE6IERheURhdGEpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuXG4gICAgLy8gXHU1MTk5XHU1Qjg4XHU1MzZCXHVGRjFBXHU2OEMwXHU2RDRCXHU2NTcwXHU2MzZFXHU5MUNGXHU2MEFDXHU1RDE2XHVGRjA4XHU1OTFBXHU2NzYxXHU2NUY2XHU5NUY0XHU3RUJGIFx1MjE5MiBcdThGRDFcdTRFNEVcdTdBN0FcdTU4RjNcdUZGMDlcbiAgICBpZiAoIXRoaXMuX3dhcm5lZFBhdGhzLmhhcyhwYXRoKSkge1xuICAgICAgY29uc3QgbmV3VGltZWxpbmVMZW4gPSBBcnJheS5pc0FycmF5KGRheURhdGEudGltZWxpbmUpID8gZGF5RGF0YS50aW1lbGluZS5sZW5ndGggOiAwO1xuICAgICAgaWYgKG5ld1RpbWVsaW5lTGVuIDw9IDEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gSlNPTi5wYXJzZShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCkpIGFzIERheURhdGE7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1RpbWVsaW5lTGVuID0gQXJyYXkuaXNBcnJheShleGlzdGluZy50aW1lbGluZSkgPyBleGlzdGluZy50aW1lbGluZS5sZW5ndGggOiAwO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nVGltZWxpbmVMZW4gPiAxMCkge1xuICAgICAgICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICAgICAgIGBcdTI2QTBcdUZFMEYgXHU2OEMwXHU2RDRCXHU1MjMwICR7ZGF0ZUtleX0gXHU2NTcwXHU2MzZFXHU1RjAyXHU1RTM4XHU2RTA1XHU3QTdBXHVGRjA4JHtleGlzdGluZ1RpbWVsaW5lTGVufSBcdTY3NjEgXHUyMTkyICR7bmV3VGltZWxpbmVMZW59IFx1Njc2MVx1RkYwOVx1RkYwQ1x1NURGMlx1ODFFQVx1NTJBOFx1NjJFNlx1NjIyQVx1MzAwMlxcblx1NTk4Mlx1Njc5Q1x1Nzg2RVx1NUI5RVx1ODk4MVx1NkUwNVx1N0E3QVx1OEJFNVx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwQ1x1OEJGN1x1NTE4RFx1NkIyMVx1NjRDRFx1NEY1Q1x1MzAwMmBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdGhpcy5fd2FybmVkUGF0aHMuYWRkKHBhdGgpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHsgLyogXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHU2MjE2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU3RUU3XHU3RUVEXHU2QjYzXHU1RTM4XHU1MTk5XHU1MTY1ICovIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF5RGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlRGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwNyAoZ29hbHMpIC0tLS1cblxuICBwcml2YXRlIGdvYWxzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2dvYWxzLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEdvYWxzKCk6IFByb21pc2U8R29hbEl0ZW1bXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgR29hbEl0ZW1bXTtcbiAgfVxuXG4gIGFzeW5jIHB1dEdvYWxzKGdvYWxzOiBHb2FsSXRlbVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG5cbiAgICAvLyBcdTUxOTlcdTVCODhcdTUzNkJcdUZGMUFcdTY4QzBcdTZENEJcdTY1NzBcdTYzNkVcdTkxQ0ZcdTYwQUNcdTVEMTZcdUZGMDhOXHU2NzYxXHU3NkVFXHU2ODA3IFx1MjE5MiBcdTdBN0FcdTY1NzBcdTdFQzRcdUZGMDlcbiAgICBpZiAoZ29hbHMubGVuZ3RoID09PSAwICYmICF0aGlzLl93YXJuZWRQYXRocy5oYXMocGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gSlNPTi5wYXJzZShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCkpIGFzIEdvYWxJdGVtW107XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZXhpc3RpbmcpICYmIGV4aXN0aW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgICAgICAgIGBcdTI2QTBcdUZFMEYgXHU2OEMwXHU2RDRCXHU1MjMwXHU3NkVFXHU2ODA3XHU2NTcwXHU2MzZFXHU1RjAyXHU1RTM4XHU2RTA1XHU3QTdBXHVGRjA4JHtleGlzdGluZy5sZW5ndGh9IFx1Njc2MSBcdTIxOTIgXHU3QTdBXHVGRjA5XHVGRjBDXHU1REYyXHU4MUVBXHU1MkE4XHU2MkU2XHU2MjJBXHUzMDAyXFxuXHU1OTgyXHU2NzlDXHU3ODZFXHU1QjlFXHU4OTgxXHU2RTA1XHU3QTdBXHU2MjQwXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU4QkY3XHU1MThEXHU2QjIxXHU2NENEXHU0RjVDXHUzMDAyYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuX3dhcm5lZFBhdGhzLmFkZChwYXRoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdTYyMTZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTdFRTdcdTdFRURcdTZCNjNcdTVFMzhcdTUxOTlcdTUxNjUgKi8gfVxuICAgIH1cblxuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShnb2FscywgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBBSSBcdTg5QzRcdTUyMTJcdTRGQTdcdThGNjZcdTdEMjJcdTVGMTVcdUZGMDhwbGFucy1tYXAuanNvblx1RkYwOS0tLS1cbiAgLy8gXHU3RUQzXHU2Nzg0XHVGRjFBeyBcIjx2YXVsdFBhdGg+Izxjb250ZW50SGFzaD5cIjogc3RyaW5nW10gKGdvYWxJZHMpIH1cbiAgLy8gXHU3NTI4XHU5MDE0XHVGRjFBXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwXHU5MUNEXHU1OTBEXHU4OUM0XHU1MjEyXHU2NUY2XHU2MzA5IGNvbnRlbnRIYXNoIFx1NUU0Mlx1N0I0OVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NzZFRVx1NjgwN1x1OTFDRFx1NTkwRFx1OEZGRFx1NTJBMFx1MzAwMlxuXG4gIHByaXZhdGUgcGxhbnNJbmRleFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9wbGFucy1tYXAuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UGxhbnNJbmRleCgpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnBsYW5zSW5kZXhQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSByZXR1cm4ge307XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gICAgICBpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnKSByZXR1cm4gcGFyc2VkIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwdXRQbGFuc0luZGV4KG1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHRoaXMucGxhbnNJbmRleFBhdGgoKSwgSlNPTi5zdHJpbmdpZnkobWFwLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1OEJCRVx1N0Y2RSAoc2V0dGluZ3MpIC0tLS1cblxuICBwcml2YXRlIHNldHRpbmdzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3NldHRpbmdzLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFNldHRpbmcoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IHRoaXMuZ2V0QWxsU2V0dGluZ3MoKTtcbiAgICByZXR1cm4gc2V0dGluZ3Nba2V5XSA/PyBudWxsO1xuICB9XG5cbiAgYXN5bmMgcHV0U2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aCh0aGlzLnNldHRpbmdzUGF0aCgpKTtcbiAgICBjb25zdCBhYnN0cmFjdCA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKTtcblxuICAgIGlmIChhYnN0cmFjdCBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAvLyB2YXVsdC5wcm9jZXNzIFx1NTM5Rlx1NUI1MCByZWFkLW1vZGlmeS13cml0ZVx1RkYwQ1x1Njc1Q1x1N0VERFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVxuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0gSlNPTi5wYXJzZShkYXRhKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgc2V0dGluZ3Nba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeSh7IFtrZXldOiB2YWx1ZSB9LCBudWxsLCAyKSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsU2V0dGluZ3MoKTogUHJvbWlzZTxBcHBTZXR0aW5ncz4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgQXBwU2V0dGluZ3M7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8UHVyY2hhc2VIaXN0b3J5IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgUHVyY2hhc2VIaXN0b3J5O1xuICB9XG5cbiAgYXN5bmMgcHV0UHVyY2hhc2VIaXN0b3J5KGRhdGE6IFB1cmNoYXNlSGlzdG9yeSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTY1MzZcdTUxNjVcdTUzODZcdTUzRjIgKGluY29tZS1oaXN0b3J5Lmpzb24pIC0tLS1cblxuICBwcml2YXRlIGluY29tZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vaW5jb21lLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0SW5jb21lSGlzdG9yeSgpOiBQcm9taXNlPEluY29tZUhpc3RvcnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgSW5jb21lSGlzdG9yeTtcbiAgfVxuXG4gIGFzeW5jIHB1dEluY29tZUhpc3RvcnkoZGF0YTogSW5jb21lSGlzdG9yeSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU1QkZDXHU1MUZBL1x1NUJGQ1x1NTE2NSAtLS0tXG5cbiAgYXN5bmMgZXhwb3J0QWxsRGF0YSgpOiBQcm9taXNlPEV4cG9ydFNoYXBlPiB7XG4gICAgY29uc3QgW2RheXMsIGdvYWxzLCBzZXR0aW5ncywgcHVyY2hhc2VIaXN0b3J5LCBpbmNvbWVIaXN0b3J5XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuZ2V0QWxsRGF5cygpLFxuICAgICAgdGhpcy5nZXRHb2FscygpLFxuICAgICAgdGhpcy5nZXRBbGxTZXR0aW5ncygpLFxuICAgICAgdGhpcy5nZXRQdXJjaGFzZUhpc3RvcnkoKSxcbiAgICAgIHRoaXMuZ2V0SW5jb21lSGlzdG9yeSgpLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICczLjAnLFxuICAgICAgZXhwb3J0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgc3RvcmFnZVR5cGU6ICd2YXVsdCcsXG4gICAgICBkYXlzLFxuICAgICAgZ29hbHMsXG4gICAgICBzZXR0aW5ncyxcbiAgICAgIHB1cmNoYXNlSGlzdG9yeSxcbiAgICAgIGluY29tZUhpc3RvcnksXG4gICAgICB0aGVtZXM6IFtdLFxuICAgICAgcmVwb3J0czogW10sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGltcG9ydERhdGEoZGF0YTogdW5rbm93biwgb3B0aW9uczogeyBzdHJhdGVneT86ICdvdmVyd3JpdGUnIHwgJ21lcmdlJyB9ID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICAgIGNvbnN0IHN0cmF0ZWd5ID0gb3B0aW9ucy5zdHJhdGVneSA/PyAnb3ZlcndyaXRlJztcblxuICAgIC8vIFAyXHVGRjFBXHU1QkZDXHU1MTY1XHU1MjREXHU2ODIxXHU5QThDICsgXHU1QjU3XHU2QkI1XHU4ODY1XHU5RjUwXHVGRjFCXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHU1NzI4XHU2QjY0XHU4OEFCXHU2MkQyXHU3RUREXHVGRjBDXHU0RTBEXHU2QzYxXHU2N0QzIFZhdWx0XG4gICAgY29uc3QgcmVjb3JkID0gSW1wb3J0VmFsaWRhdG9yLnZhbGlkYXRlKGRhdGEpO1xuXG4gICAgaWYgKHJlY29yZC5kYXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFx1OTYzMlx1NUZBMVx1RkYxQWRheXMgXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU3QTdBXHU1QkY5XHU4QzYxXHU4ODY4XHU3OTNBXHU2RTA1XHU3QTdBXHU1MTY4XHU5MEU4XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjA4XHU0RUM1IG92ZXJ3cml0ZSBcdThCRURcdTRFNDlcdTRFMEJcdTUxNDFcdThCQjhcdUZGMDlcbiAgICAgIGNvbnN0IGRheXMgPSAocmVjb3JkLmRheXMgJiYgdHlwZW9mIHJlY29yZC5kYXlzID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShyZWNvcmQuZGF5cykpXG4gICAgICAgID8gcmVjb3JkLmRheXNcbiAgICAgICAgOiB7fTtcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ292ZXJ3cml0ZScpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jbGVhckFsbERheXMoKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgZGF5IG9mIE9iamVjdC52YWx1ZXMoZGF5cykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXREYXkoZGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLmdvYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGluY29taW5nOiBHb2FsSXRlbVtdID0gQXJyYXkuaXNBcnJheShyZWNvcmQuZ29hbHMpID8gcmVjb3JkLmdvYWxzIDogW107XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdtZXJnZScpIHtcbiAgICAgICAgLy8gXHU1NDA4XHU1RTc2XHVGRjFBXHU0RkREXHU3NTU5XHU3M0IwXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU1QkZDXHU1MTY1XHU3NkVFXHU2ODA3XHU2MzA5IGlkIFx1ODk4Nlx1NzZENlx1RkYxQlx1N0E3QVx1NjU3MFx1N0VDNFx1NEUwRFx1ODlFNlx1NTNEMVx1NkUwNVx1N0E3QVxuICAgICAgICBjb25zdCBleGlzdGluZyA9IChhd2FpdCB0aGlzLmdldEdvYWxzKCkpIHx8IFtdO1xuICAgICAgICBjb25zdCBtZXJnZWQgPSBuZXcgTWFwKGV4aXN0aW5nLm1hcCgoZykgPT4gW2cuaWQsIGddKSk7XG4gICAgICAgIGZvciAoY29uc3QgZ29hbCBvZiBpbmNvbWluZykge1xuICAgICAgICAgIGlmIChnb2FsICYmIGdvYWwuaWQpIG1lcmdlZC5zZXQoZ29hbC5pZCwgZ29hbCk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhBcnJheS5mcm9tKG1lcmdlZC52YWx1ZXMoKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gb3ZlcndyaXRlXHVGRjFBXHU2NTc0XHU0RjUzXHU2NkZGXHU2MzYyXHVGRjA4XHU3QTdBXHU2NTcwXHU3RUM0ID0gXHU2RTA1XHU3QTdBXHVGRjBDXHU3QjI2XHU1NDA4XHU5ODg0XHU2NzFGXHU4QkVEXHU0RTQ5XHVGRjA5XG4gICAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoaW5jb21pbmcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWNvcmQuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJiByZWNvcmQuc2V0dGluZ3MgJiYgdHlwZW9mIHJlY29yZC5zZXR0aW5ncyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IGluY29taW5nID0gcmVjb3JkLnNldHRpbmdzO1xuICAgICAgbGV0IHRvV3JpdGU6IEFwcFNldHRpbmdzO1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnbWVyZ2UnKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKGF3YWl0IHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSkgfHwge307XG4gICAgICAgIHRvV3JpdGUgPSB7IC4uLmV4aXN0aW5nLCAuLi5pbmNvbWluZyB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9Xcml0ZSA9IGluY29taW5nO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHRoaXMuc2V0dGluZ3NQYXRoKCksIEpTT04uc3RyaW5naWZ5KHRvV3JpdGUsIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dFB1cmNoYXNlSGlzdG9yeShyZWNvcmQucHVyY2hhc2VIaXN0b3J5KTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5pbmNvbWVIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0SW5jb21lSGlzdG9yeShyZWNvcmQuaW5jb21lSGlzdG9yeSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NEVDNVx1NkUwNVx1N0E3QVx1NjI0MFx1NjcwOVx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwOG92ZXJ3cml0ZSBcdTVCRkNcdTUxNjUgZGF5cyBcdTUyNERcdThDMDNcdTc1MjhcdUZGMENcdTRFMERcdTVGNzFcdTU0Q0QgZ29hbHMvc2V0dGluZ3NcdUZGMDkgKi9cbiAgYXN5bmMgY2xlYXJBbGxEYXlzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMoZGF0YURpcikpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIoZGF0YURpciwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gIH1cblxuICAvKiogXHU0RUM1XHU2RTA1XHU3QTdBXHU4QkJFXHU3RjZFXHU2NTg3XHU0RUY2XHVGRjA4b3ZlcndyaXRlIFx1NUJGQ1x1NTE2NSBzZXR0aW5ncyBcdTUyNERcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgYXN5bmMgY2xlYXJBbGxTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcih0aGlzLmJhc2VQYXRoLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgfVxuXG4gIC8vIC0tLS0gTWFya2Rvd24gXHU2NDU4XHU4OTgxIC0tLS1cblxuICBwcml2YXRlIHJldmlld1BhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9yZXZpZXdzLyR7ZGF0ZUtleX0ubWRgKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nLCBtYXJrZG93bjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBtYXJrZG93bik7XG4gIH1cblxuICBhc3luYyBkZWxldGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBJbXBvcnRWYWxpZGF0b3IgLSBcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTc2ODRcdTY4MjFcdTlBOENcdTRFMEVcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdUZGMDhcdTVCQkZcdTRFM0JcdTRGQTdcdUZGMENcdTk2RjZcdTRGOURcdThENTZcdUZGMDlcbiAqXG4gKiBcdTc1MjhcdTkwMTRcdUZGMUFcdTU3MjggVmF1bHRTdG9yYWdlLmltcG9ydERhdGEgXHU4NDNEXHU3NkQ4XHU1MjREXHU2MkU2XHU2MjJBXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHUzMDAxXHU4ODY1XHU5RjUwXHU3RjNBXHU1OTMxXHU1QjU3XHU2QkI1XHVGRjBDXG4gKiBcdTkwN0ZcdTUxNERcdTUzNEFcdTYyMkEvXHU5NzVFXHU2Q0Q1XHU2NTcwXHU2MzZFXHU2QzYxXHU2N0QzIFZhdWx0XHUzMDAyXG4gKlxuICogXHU4QkJFXHU4QkExXHU1MzlGXHU1MjE5XHVGRjFBXG4gKiAgLSBcdTRFQzVcdTUwNUFcIlx1N0VEM1x1Njc4NFx1NUM0Mlx1OTc2Mlx1NzY4NFx1NUI4OVx1NTE2OFx1NTE1Q1x1NUU5NVwiXHVGRjBDXHU0RTBEXHU5MUNEXHU1MTk5XHU0RTFBXHU1MkExXHU1QjU3XHU2QkI1XHVGRjA4XHU1OTgyIG1ldHJpY3MgXHU3Njg0XHU1MTc3XHU0RjUzXHU2NTcwXHU1MDNDXHVGRjA5XHUzMDAyXG4gKiAgLSBcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdTRGMThcdTUxNDhcdTc1MjhcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTgxRUFcdThFQUJcdTc2ODQga2V5IC8gXHU1MTg1XHU1QkI5XHVGRjBDXHU3RjNBXHU1OTMxXHU2NUY2XHU2MjREXHU3NTI4XHU1Qjg5XHU1MTY4XHU5RUQ4XHU4QkE0XHU1MDNDXHUzMDAyXG4gKiAgLSBcdTRFRkJcdTRGNTVcdTY1RTBcdTZDRDVcdTRGRUVcdTU5MERcdTc2ODRcdTdFRDNcdTY3ODRcdTYwMjdcdTYzNUZcdTU3NEZcdTkwRkRcdTYyOUIgSW1wb3J0VmFsaWRhdGlvbkVycm9yXHVGRjBDXHU3NTMxXHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU3OTNBXHU3NTI4XHU2MjM3XHUzMDAyXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEYXlEYXRhLFxuICBHb2FsSXRlbSxcbiAgQXBwU2V0dGluZ3MsXG4gIFB1cmNoYXNlSGlzdG9yeSxcbiAgSW5jb21lSGlzdG9yeSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmNsYXNzIEltcG9ydFZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0ltcG9ydFZhbGlkYXRpb25FcnJvcic7XG4gIH1cbn1cblxuY29uc3QgS05PV05fRklFTERTID0gWydkYXlzJywgJ2dvYWxzJywgJ3NldHRpbmdzJywgJ3B1cmNoYXNlSGlzdG9yeScsICdpbmNvbWVIaXN0b3J5J10gYXMgY29uc3Q7XG5cbi8qKlxuICogXHU3RUI1XHU2REYxXHU5NjMyXHU1RkExXHVGRjFBXHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHU2NjJGXHU0RTBEXHU1M0VGXHU0RkUxXHU4RkI5XHU3NTRDXHVGRjA4XHU1M0VGXHU4MEZEXHU2NzY1XHU4MUVBXHU0RUQ2XHU0RUJBXHU1MjA2XHU0RUFCL1x1NEUwQlx1OEY3RFx1NzY4NFx1NTkwN1x1NEVGRFx1RkYwOVx1MzAwMlxuICogXHU1NzI4XHU4NDNEXHU3NkQ4XHU1MjREXHU5MDEyXHU1RjUyXHU1MUMwXHU1MzE2XHU2MjQwXHU2NzA5XHU1QjU3XHU3QjI2XHU0RTMyXHU1M0Y2XHU1QjUwXHVGRjBDXHU1MjY1XHU3OUJCIEhUTUwgXHU2ODA3XHU3QjdFXHUzMDAxXHU0RThCXHU0RUY2XHU1OTA0XHU3NDA2XHU1QzVFXHU2MDI3XG4gKiBcdTRFMEUgamF2YXNjcmlwdDovZGF0YTogXHU0RjJBXHU1MzRGXHU4QkFFXHVGRjBDXHU5MDdGXHU1MTREXHU2MDc2XHU2MTBGXHU4RDFGXHU4RjdEXHU3RUNGIGlubmVySFRNTCBcdTZFMzJcdTY3RDNcdTg5RTZcdTUzRDEgWFNTXHUzMDAyXG4gKiBcdTY3MkNcdTk4NzlcdTc2RUVcdTY1RTBcdTVCQ0NcdTY1ODdcdTY3MkNcdTk3MDBcdTZDNDJcdUZGMENcdTdFREZcdTRFMDBcdTY1ODdcdTY3MkNcdTUzMTZcdTY2MkZcdTVCODlcdTUxNjhcdTc2ODRcdTMwMDJcbiAqL1xuZnVuY3Rpb24gc2FuaXRpemVTdHJpbmcoaW5wdXQ6IHVua25vd24pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykgcmV0dXJuIGlucHV0IGFzIHN0cmluZztcbiAgY29uc3Qgb3V0ID0gaW5wdXRcbiAgICAucmVwbGFjZSgvPFtePl0qPi9nLCAnJykgLy8gXHU3OUZCXHU5NjY0XHU2MjQwXHU2NzA5IEhUTUwgXHU2ODA3XHU3QjdFXG4gICAgLnJlcGxhY2UoL1xcc29uXFx3K1xccyo9XFxzKlwiW15cIl0qXCIvZ2ksICcnKSAvLyBcdTc5RkJcdTk2NjQgb24qPVwiLi4uXCJcbiAgICAucmVwbGFjZSgvXFxzb25cXHcrXFxzKj1cXHMqJ1teJ10qJy9naSwgJycpIC8vIFx1NzlGQlx1OTY2NCBvbio9Jy4uLidcbiAgICAucmVwbGFjZSgvXFxzb25cXHcrXFxzKj1cXHMqW15cXHM+XSsvZ2ksICcnKSAvLyBcdTc5RkJcdTk2NjQgb24qPXZhbHVlXHVGRjA4XHU2NUUwXHU1RjE1XHU1M0Y3XHVGRjA5XG4gICAgLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJykgLy8gXHU3OUZCXHU5NjY0IGphdmFzY3JpcHQ6IFx1NEYyQVx1NTM0Rlx1OEJBRVxuICAgIC5yZXBsYWNlKC9kYXRhOi9naSwgJycpOyAvLyBcdTc5RkJcdTk2NjQgZGF0YTogXHU0RjJBXHU1MzRGXHU4QkFFXG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplVmFsdWUodmFsdWU6IHVua25vd24pOiB1bmtub3duIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHJldHVybiBzYW5pdGl6ZVN0cmluZyh2YWx1ZSk7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlLm1hcCgodikgPT4gc2FuaXRpemVWYWx1ZSh2KSk7XG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xuICAgICAgb3V0W2tleV0gPSBzYW5pdGl6ZVZhbHVlKCh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbiAgcmV0dXJuIHZhbHVlOyAvLyBcdTY1NzBcdTVCNTcgLyBcdTVFMDNcdTVDMTQgLyBudWxsIFx1N0I0OVx1NTM5Rlx1NjgzN1x1NEZERFx1NzU1OVxufVxuXG5pbnRlcmZhY2UgVmFsaWRhdGVkSW1wb3J0IHtcbiAgZGF5cz86IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICBnb2Fscz86IEdvYWxJdGVtW107XG4gIHNldHRpbmdzPzogQXBwU2V0dGluZ3M7XG4gIHB1cmNoYXNlSGlzdG9yeT86IFB1cmNoYXNlSGlzdG9yeTtcbiAgaW5jb21lSGlzdG9yeT86IEluY29tZUhpc3Rvcnk7XG59XG5cbmV4cG9ydCBjb25zdCBJbXBvcnRWYWxpZGF0b3IgPSB7XG4gIC8qKlxuICAgKiBcdTY4MjFcdTlBOENcdTVFNzZcdTg4NjVcdTlGNTBcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTMwMDJcbiAgICogQHJldHVybnMgXHU4ODY1XHU5RjUwXHU1NDBFXHU3Njg0XHU1RTcyXHU1MUMwXHU2NTcwXHU2MzZFXHVGRjA4XHU3RUQzXHU2Nzg0XHU0RTBFXHU4RjkzXHU1MTY1XHU0RTAwXHU4MUY0XHVGRjBDXHU0RjQ2XHU1QjU3XHU2QkI1XHU1QjhDXHU2NTc0XHVGRjA5XG4gICAqIEB0aHJvd3MgSW1wb3J0VmFsaWRhdGlvbkVycm9yIFx1NUY1M1x1N0VEM1x1Njc4NFx1NjM1Rlx1NTc0Rlx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NjVGNlxuICAgKi9cbiAgdmFsaWRhdGUoZGF0YTogdW5rbm93bik6IFZhbGlkYXRlZEltcG9ydCB7XG4gICAgaWYgKCFkYXRhIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKCdcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcdTY4M0NcdTVGMEZcdTY1RTBcdTY1NDhcdUZGMUFcdTY4MzlcdTgyODJcdTcwQjlcdTVGQzVcdTk4N0JcdTY2MkYgSlNPTiBcdTVCRjlcdThDNjEnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSBkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgLy8gXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHU2MkQyXHU3RUREXHVGRjFBXHU2Q0ExXHU2NzA5XHU0RUZCXHU0RjU1XHU1REYyXHU3N0U1XHU1QjU3XHU2QkI1IFx1MjE5MiBcdTg5QzZcdTRFM0FcdTYzNUZcdTU3NEYvXHU2NUUwXHU1MTczXHU2NTg3XHU0RUY2XG4gICAgY29uc3QgaGFzS25vd25GaWVsZCA9IEtOT1dOX0ZJRUxEUy5zb21lKChmKSA9PiByZWNvcmRbZl0gIT09IHVuZGVmaW5lZCk7XG4gICAgaWYgKCFoYXNLbm93bkZpZWxkKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKFxuICAgICAgICAnXHU1OTA3XHU0RUZEXHU2NTg3XHU0RUY2XHU2NUUwXHU2NTQ4XHVGRjFBXHU2NzJBXHU2MjdFXHU1MjMwXHU0RUZCXHU0RjU1XHU1M0VGXHU4QkM2XHU1MjJCXHU3Njg0XHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHVGRjA4ZGF5cyAvIGdvYWxzIC8gc2V0dGluZ3MgLyBwdXJjaGFzZUhpc3RvcnkgLyBpbmNvbWVIaXN0b3J5XHVGRjA5J1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFZhbGlkYXRlZEltcG9ydCA9IHt9O1xuXG4gICAgaWYgKHJlY29yZC5kYXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5kYXlzID0gc2FuaXRpemVWYWx1ZShJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplRGF5cyhyZWNvcmQuZGF5cykpIGFzIFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmdvYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5nb2FscyA9IHNhbml0aXplVmFsdWUoSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZUdvYWxzKHJlY29yZC5nb2FscykpIGFzIEdvYWxJdGVtW107XG4gICAgfVxuICAgIGlmIChyZWNvcmQuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LnNldHRpbmdzID0gc2FuaXRpemVWYWx1ZShJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplU2V0dGluZ3MocmVjb3JkLnNldHRpbmdzKSkgYXMgQXBwU2V0dGluZ3M7XG4gICAgfVxuICAgIGlmIChyZWNvcmQucHVyY2hhc2VIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5wdXJjaGFzZUhpc3RvcnkgPSBzYW5pdGl6ZVZhbHVlKHJlY29yZC5wdXJjaGFzZUhpc3RvcnkpIGFzIFB1cmNoYXNlSGlzdG9yeTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5pbmNvbWVIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5pbmNvbWVIaXN0b3J5ID0gc2FuaXRpemVWYWx1ZShyZWNvcmQuaW5jb21lSGlzdG9yeSkgYXMgSW5jb21lSGlzdG9yeTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgZGF5c1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTk3NUVcdTVCRjlcdThDNjFcdUZGMDhcdTU5ODJcdTY1NzBcdTdFQzQvXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA5XHUyMTkyIFx1ODlDNlx1NEUzQVx1NjVFMFx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NUJGOVx1OEM2MVx1RkYwOFx1NEUwRFx1NkM2MVx1NjdEMyBWYXVsdFx1RkYwOVxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZGF5IFx1N0YzQSBkYXRlIFx1NjVGNlx1NzUyOFx1NTE3NiBrZXkgXHU4ODY1XHU5RjUwXG4gICAqICAtIFx1NkJDRlx1NEUyQSBkYXkgXHU3RjNBIG1ldHJpY3MvdGltZWxpbmUvZ29hbHMgXHU2NUY2XHU4ODY1XHU3QTdBXHU3RUQzXHU2Nzg0XG4gICAqL1xuICBub3JtYWxpemVEYXlzKGRheXM6IHVua25vd24pOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiB7XG4gICAgaWYgKCFkYXlzIHx8IHR5cGVvZiBkYXlzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRheXMpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHJhdyA9IGRheXMgYXMgUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocmF3KSkge1xuICAgICAgY29uc3QgZGF5ID0gcmF3W2tleV07XG4gICAgICBpZiAoIWRheSB8fCB0eXBlb2YgZGF5ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRheSkpIHtcbiAgICAgICAgY29udGludWU7IC8vIFx1OERGM1x1OEZDN1x1OTc1RVx1NUJGOVx1OEM2MVx1Njc2MVx1NzZFRVxuICAgICAgfVxuICAgICAgY29uc3QgY2xlYW46IERheURhdGEgPSB7IC4uLmRheSB9O1xuICAgICAgaWYgKCFjbGVhbi5kYXRlKSBjbGVhbi5kYXRlID0ga2V5OyAvLyBcdTc1Mjgga2V5IFx1ODg2NSBkYXRlXG4gICAgICBpZiAoIWNsZWFuLm1ldHJpY3MgfHwgdHlwZW9mIGNsZWFuLm1ldHJpY3MgIT09ICdvYmplY3QnKSBjbGVhbi5tZXRyaWNzID0ge307XG4gICAgICBpZiAoIWNsZWFuLnRpbWVsaW5lIHx8ICFBcnJheS5pc0FycmF5KGNsZWFuLnRpbWVsaW5lKSkgY2xlYW4udGltZWxpbmUgPSBbXTtcbiAgICAgIGlmICghY2xlYW4uZ29hbHMgfHwgIUFycmF5LmlzQXJyYXkoY2xlYW4uZ29hbHMpKSBjbGVhbi5nb2FscyA9IFtdO1xuICAgICAgb3V0W2tleV0gPSBjbGVhbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IGdvYWxzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NjU3MFx1N0VDNFx1RkYxQlx1OTc1RVx1NjU3MFx1N0VDNCBcdTIxOTIgXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gICAqICAtIFx1NkJDRlx1NEUyQSBnb2FsIFx1N0YzQSBpZCBcdTY1RjZcdTg4NjVcdTRFMDBcdTRFMkFcdTdBMzNcdTVCOUFcdTUzRUZcdTU5MERcdTczQjBcdTc2ODQgaWRcbiAgICovXG4gIG5vcm1hbGl6ZUdvYWxzKGdvYWxzOiB1bmtub3duKTogR29hbEl0ZW1bXSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGdvYWxzKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgcmV0dXJuIGdvYWxzLm1hcCgocmF3KTogR29hbEl0ZW0gPT4ge1xuICAgICAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gcmF3IGFzIEdvYWxJdGVtO1xuICAgICAgY29uc3Qgb2JqID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgY29uc3QgY2xlYW4gPSB7IC4uLm9iaiB9IGFzIHVua25vd24gYXMgR29hbEl0ZW07XG4gICAgICBpZiAoIWNsZWFuLmlkKSB7XG4gICAgICAgIGNsZWFuLmlkID0gYGdvYWxfaW1wb3J0XyR7Y291bnRlcisrfV8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfWA7XG4gICAgICB9XG4gICAgICBpZiAoY2xlYW4uaXRlbXMgJiYgIUFycmF5LmlzQXJyYXkoY2xlYW4uaXRlbXMpKSBjbGVhbi5pdGVtcyA9IFtdO1xuICAgICAgcmV0dXJuIGNsZWFuO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgc2V0dGluZ3NcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU5NzVFXHU1QkY5XHU4QzYxIFx1MjE5MiBcdThGRDRcdTU2REVcdTdBN0FcdTVCRjlcdThDNjFcbiAgICovXG4gIG5vcm1hbGl6ZVNldHRpbmdzKHNldHRpbmdzOiB1bmtub3duKTogQXBwU2V0dGluZ3Mge1xuICAgIGlmICghc2V0dGluZ3MgfHwgdHlwZW9mIHNldHRpbmdzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNldHRpbmdzKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4gc2V0dGluZ3MgYXMgQXBwU2V0dGluZ3M7XG4gIH0sXG59O1xuIiwgIlxuLyoqXG4gKiBUaGVtZUJyaWRnZSAtIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdUZGMENcdTYzQThcdTkwMDFcdTUyMzAgaWZyYW1lXG4gKiAgICAgICAgICAgICAgKyBcdTUzQ0RcdTU0MTFcdUZGMUFcdTYzQTVcdTY1MzYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTAzQ1x1RkYwQ1x1NkNFOFx1NTE2NSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAqL1xuZXhwb3J0IGNsYXNzIFRoZW1lQnJpZGdlIHtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF9wYWxldHRlU3luY1RpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIC8qKiBcdTVCNThcdTUwQThcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1OTUyRVx1NTQwRFx1RkYwQ1x1NzUyOFx1NEU4RSByZXN0b3JlRGVmYXVsdHMgXHU2RTA1XHU3NDA2ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgSU5KRUNURURfVkFSUyA9IFtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCcsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnLFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JyxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JyxcbiAgICAgICctLXRleHQtbm9ybWFsJyxcbiAgICAgICctLXRleHQtbXV0ZWQnLFxuICAgIF07XG5cbiAgICAvKiogXHU5NjMyXHU2Mjk2XHU3QURFXHU2MDAxXHU2ODA3XHU4QkIwXHVGRjFBcmVzdG9yZURlZmF1bHRzIFx1ODhBQlx1OEMwM1x1NzUyOFx1NTQwRVx1OEJCRVx1NEUzQSB0cnVlXHVGRjBDXHU5NjNCXHU2QjYyXHU1RUY2XHU4RkRGXHU1NkRFXHU4QzAzXHU4OTg2XHU1MTk5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N1cHByZXNzZWQgPSBmYWxzZTtcblxuICBhdHRhY2hJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICB9XG5cbiAgZGV0YWNoSWZyYW1lKCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNEQgT2JzaWRpYW4gXHU2NjBFXHU2Njk3XHU3MkI2XHU2MDAxXHVGRjA4XHU0RUM1XHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHByaXZhdGUgaXNEYXJrTW9kZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgW3IsIGcsIGJdXHVGRjA4MFx1MjAxMzI1NSBcdTY1NzRcdTY1NzBcdUZGMDlcbiAgICogXHU2NTJGXHU2MzAxIHJnYigpL3JnYmEoKS8jaGV4XHVGRjA4MyBcdTYyMTYgNiBcdTRGNERcdUZGMDlcdUZGMUJcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTBcdThGRDRcdTU2REUgbnVsbFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VDb2xvclRvUmdiKGNvbG9yOiBzdHJpbmcpOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfCBudWxsIHtcbiAgICBpZiAoIWNvbG9yKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBjID0gY29sb3IudHJpbSgpO1xuICAgIGxldCByOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyO1xuXG4gICAgY29uc3QgcmdiTWF0Y2ggPSBjLm1hdGNoKC9yZ2JhP1xcKChbXildKylcXCkvaSk7XG4gICAgaWYgKHJnYk1hdGNoKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IHJnYk1hdGNoWzFdLnNwbGl0KCcsJykubWFwKChzKSA9PiBwYXJzZUZsb2F0KHMpKTtcbiAgICAgIFtyLCBnLCBiXSA9IHBhcnRzO1xuICAgIH0gZWxzZSBpZiAoY1swXSA9PT0gJyMnKSB7XG4gICAgICBsZXQgaGV4ID0gYy5zbGljZSgxKTtcbiAgICAgIGlmIChoZXgubGVuZ3RoID09PSAzKSBoZXggPSBoZXguc3BsaXQoJycpLm1hcCgoY2gpID0+IGNoICsgY2gpLmpvaW4oJycpO1xuICAgICAgaWYgKGhleC5sZW5ndGggPCA2KSByZXR1cm4gbnVsbDtcbiAgICAgIHIgPSBwYXJzZUludChoZXguc2xpY2UoMCwgMiksIDE2KTtcbiAgICAgIGcgPSBwYXJzZUludChoZXguc2xpY2UoMiwgNCksIDE2KTtcbiAgICAgIGIgPSBwYXJzZUludChoZXguc2xpY2UoNCwgNiksIDE2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFtyLCBnLCBiXS5zb21lKCh2KSA9PiBpc05hTih2KSkpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBbTWF0aC5yb3VuZChyKSwgTWF0aC5yb3VuZChnKSwgTWF0aC5yb3VuZChiKV07XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIENTUyBcdTk4OUNcdTgyNzJcdTVCNTdcdTdCMjZcdTRFMzIgXHUyMTkyIEhTTCBcdTgyNzJcdTc2RjggSFx1RkYwODBcdTIwMTMzNjBcdUZGMDlcbiAgICogXHU3NTI4XHU0RThFXHU2MjhBIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NzY4NCAtLWludGVyYWN0aXZlLWFjY2VudCBcdTUzQ0RcdTYzQThcdTRFM0FcdTYzRDJcdTRFRjZcdTc2ODQgLS1hY2NlbnQtaHVlXG4gICAqL1xuICBzdGF0aWMgcmdiVG9IdWUoY29sb3I6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IHJnYiA9IFRoZW1lQnJpZGdlLnBhcnNlQ29sb3JUb1JnYihjb2xvcik7XG4gICAgaWYgKCFyZ2IpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IFtyLCBnLCBiXSA9IHJnYjtcblxuICAgIGNvbnN0IHJuID0gciAvIDI1NSwgZ24gPSBnIC8gMjU1LCBibiA9IGIgLyAyNTU7XG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXgocm4sIGduLCBibiksIG1pbiA9IE1hdGgubWluKHJuLCBnbiwgYm4pLCBkID0gbWF4IC0gbWluO1xuICAgIGlmIChkID09PSAwKSByZXR1cm4gMDtcblxuICAgIGxldCBoOiBudW1iZXI7XG4gICAgaWYgKG1heCA9PT0gcm4pIGggPSAoKGduIC0gYm4pIC8gZCkgJSA2O1xuICAgIGVsc2UgaWYgKG1heCA9PT0gZ24pIGggPSAoYm4gLSBybikgLyBkICsgMjtcbiAgICBlbHNlIGggPSAocm4gLSBnbikgLyBkICsgNDtcblxuICAgIGggPSBNYXRoLnJvdW5kKGggKiA2MCk7XG4gICAgcmV0dXJuIGggPCAwID8gaCArIDM2MCA6IGg7XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIENTUyBcdTk4OUNcdTgyNzJcdTVCNTdcdTdCMjZcdTRFMzIgXHUyMTkyIFwiciwgZywgYlwiIFx1NEUwOVx1NTE0M1x1N0VDNFx1NUI1N1x1N0IyNlx1NEUzMlxuICAgKiBcdTc1MjhcdTRFOEVcdTYyOEEgT2JzaWRpYW4gXHU0RkE3XHU4RkI5XHU2ODBGXHU4MENDXHU2NjZGIC0tYmFja2dyb3VuZC1zZWNvbmRhcnkgXHU1NDBDXHU2QjY1XHU0RTNBXHU2M0QyXHU0RUY2XHU1MzYxXHU3MjQ3XHU1RTk1XHU4MjcyXHVGRjBDXG4gICAqIFx1OEJBOVx1NjNEMlx1NEVGNlx1NTM2MVx1NzI0N1x1ODI3Mlx1NkUyOVx1OEQzNFx1OEZEMSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICovXG4gIHN0YXRpYyByZ2JUb1JnYlN0cmluZyhjb2xvcjogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgcmdiID0gVGhlbWVCcmlkZ2UucGFyc2VDb2xvclRvUmdiKGNvbG9yKTtcbiAgICBpZiAoIXJnYikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHJnYi5qb2luKCcsICcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTQxMSBpZnJhbWUgXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU3MkI2XHU2MDAxXG4gICAqIEBwYXJhbSBmb2xsb3dPYnNpZGlhblRoZW1lIFx1NEUzQSB0cnVlIFx1NjVGNlx1RkYwQ1x1OTY0NFx1NUUyNlx1NEVDRSBPYnNpZGlhbiBcdTRFM0JcdTk4OThcbiAgICogICAgICAgIC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1NzY4NFx1NjEwRlx1NTg4M1x1ODI3Mlx1NzZGOCBodWVcdUZGMENcdTlBNzFcdTUyQThcdTYzRDJcdTRFRjZcdTY1NzRcdTc2RDhcdTkxNERcdTgyNzJcdTgwNTRcdTUyQThcbiAgICovXG4gIHB1c2hUaGVtZShmb2xsb3dPYnNpZGlhblRoZW1lID0gZmFsc2UpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXlsb2FkOiB7IGlzRGFyazogYm9vbGVhbjsgaHVlPzogbnVtYmVyOyBiZz86IHN0cmluZzsgdGV4dE5vcm1hbD86IHN0cmluZzsgdGV4dE11dGVkPzogc3RyaW5nIH0gPSB7XG4gICAgICBpc0Rhcms6IHRoaXMuaXNEYXJrTW9kZSgpLFxuICAgIH07XG5cbiAgICBpZiAoZm9sbG93T2JzaWRpYW5UaGVtZSkge1xuICAgICAgY29uc3QgYWNjZW50ID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgaHVlID0gVGhlbWVCcmlkZ2UucmdiVG9IdWUoYWNjZW50KTtcbiAgICAgIGlmIChodWUgIT09IG51bGwpIHBheWxvYWQuaHVlID0gaHVlO1xuXG4gICAgICAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTgwQ0NcdTY2NkZcdTgyNzJcdUZGMUFcdTlBNzFcdTUyQThcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTVFOTVcdTgyNzJcdThEMzRcdThGRDEgT2JzaWRpYW4gXHU4MjcyXHU2RTI5XG4gICAgICBjb25zdCBzaWRlYmFyID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCBiZyA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHNpZGViYXIpO1xuICAgICAgaWYgKGJnICE9PSBudWxsKSBwYXlsb2FkLmJnID0gYmc7XG5cbiAgICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3Mlx1RkYxQVx1OUE3MVx1NTJBOFx1NjNEMlx1NEVGNlx1NjU4N1x1NUI1N1x1ODI3Mlx1NkUyOVx1OEQzNFx1OEZEMSBPYnNpZGlhblxuICAgICAgY29uc3QgdGV4dE5vcm1hbCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tdGV4dC1ub3JtYWwnKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgdGV4dE5vcm1hbFJnYiA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHRleHROb3JtYWwpO1xuICAgICAgaWYgKHRleHROb3JtYWxSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE5vcm1hbCA9IHRleHROb3JtYWxSZ2I7XG5cbiAgICAgIGNvbnN0IHRleHRNdXRlZCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tdGV4dC1tdXRlZCcpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCB0ZXh0TXV0ZWRSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0TXV0ZWQpO1xuICAgICAgaWYgKHRleHRNdXRlZFJnYiAhPT0gbnVsbCkgcGF5bG9hZC50ZXh0TXV0ZWQgPSB0ZXh0TXV0ZWRSZ2I7XG4gICAgfVxuXG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICBpZDogJ3RoZW1lX3B1c2hfJyArIERhdGUubm93KCksXG4gICAgICAgIHBheWxvYWQsXG4gICAgICB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTRGOUJcdTU5MTZcdTkwRThcdThDMDNcdTc1MjhcdUZGMUFPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDEgKi9cbiAgb25UaGVtZUNoYW5nZWQoZm9sbG93T2JzaWRpYW5UaGVtZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoVGhlbWUoZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gIH1cblxuICAvLyA9PT09PSBcdTUzQ0NcdTU0MTFcdThDMDNcdTgyNzIgPT09PT1cblxuICAvKipcbiAgICogXHU4QkExXHU3Qjk3IHdlYmFwcCBcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2IFx1MjE5MiBPYnNpZGlhbiBDU1MgXHU1M0Q4XHU5MUNGXHU2NjIwXHU1QzA0XG4gICAqIFx1NEVDNVx1ODk4Nlx1NzZENiAzIFx1N0M3Qlx1NjgzOFx1NUZDM1x1ODI3Mlx1RkYwOFx1NUYzQVx1OEMwMy9cdTgwQ0NcdTY2NkYvXHU2NTg3XHU1QjU3XHVGRjA5XHVGRjBDXHU1MTc2XHU0RjU5XHU3NTMxIE9ic2lkaWFuIFx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NjNBOFx1N0I5N1xuICAgKi9cbiAgc3RhdGljIGNvbXB1dGVPYnNpZGlhblZhcnMoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBoID0gTWF0aC5yb3VuZChodWUpO1xuICAgIGNvbnN0IGxvID0gTWF0aC5tYXgoLTMwLCBNYXRoLm1pbigzMCwgbGlnaHRuZXNzT2Zmc2V0KSk7XG5cbiAgICAvLyBcdTVGM0FcdThDMDNcdTgyNzJcbiAgICBjb25zdCBhY2NlbnRTID0gNDA7XG4gICAgY29uc3QgYWNjZW50TCA9IGlzRGFyayA/IDUwIDogNDA7XG4gICAgY29uc3QgYWNjZW50ID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMfSUpYDtcbiAgICBjb25zdCBhY2NlbnRIb3ZlciA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TCArIDV9JSlgO1xuXG4gICAgLy8gXHU4MENDXHU2NjZGXHU4MjcyXG4gICAgY29uc3QgYmdTID0gaXNEYXJrID8gOCA6IDEyO1xuICAgIGNvbnN0IGJnTCA9IGlzRGFya1xuICAgICAgPyBNYXRoLm1heCg1LCAxMiArIGxvICogMC4zKVxuICAgICAgOiBNYXRoLm1pbig5OCwgOTQgKyBsbyAqIDAuMTUpO1xuICAgIGNvbnN0IGJnUHJpbWFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtiZ0x9JSlgO1xuICAgIGNvbnN0IGJnU2Vjb25kYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2lzRGFyayA/IGJnTCArIDMgOiBiZ0wgLSAyfSUpYDtcblxuICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3MlxuICAgIGNvbnN0IHRleHROb3JtYWwgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDYlLCA4OCUpYCA6IGBoc2woJHtofSwgNiUsIDEyJSlgO1xuICAgIGNvbnN0IHRleHRNdXRlZCAgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDQlLCA1NSUpYCA6IGBoc2woJHtofSwgNCUsIDQ1JSlgO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3Zlcic6IGFjY2VudEhvdmVyLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknOiBiZ1ByaW1hcnksXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSc6IGJnU2Vjb25kYXJ5LFxuICAgICAgJy0tdGV4dC1ub3JtYWwnOiB0ZXh0Tm9ybWFsLFxuICAgICAgJy0tdGV4dC1tdXRlZCc6IHRleHRNdXRlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1OEMwM1x1ODI3Mlx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICogNTBtcyBkZWJvdW5jZVx1RkYwQ1x1OTYzMlx1NkI2Mlx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdTZFRDFcdTU3NTdcdTVGRUJcdTkwMUZcdTYyRDZcdTYyRkRcdTRFQTdcdTc1MUZcdTlBRDhcdTk4OTEgRE9NIFx1NTE5OVx1NTE2NVxuICAgKi9cbiAgYXBwbHlQYWxldHRlKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcik7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSBmYWxzZTsgLy8gXHU2NUIwXHU4QzAzXHU4MjcyXHU4QkY3XHU2QzQyXHU1MjMwXHU2NzY1IFx1MjE5MiBcdTg5RTNcdTk2NjRcdTYyOTFcdTUyMzZcbiAgICB0aGlzLl9wYWxldHRlU3luY1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkKSByZXR1cm47IC8vIHJlc3RvcmVEZWZhdWx0cyBcdTU3MjhcdTk2MzJcdTYyOTZcdTdBOTdcdTUzRTNcdTUxODVcdTg4QUJcdThDMDNcdTc1MjhcbiAgICAgIGNvbnN0IHZhcnMgPSBUaGVtZUJyaWRnZS5jb21wdXRlT2JzaWRpYW5WYXJzKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFycykpIHtcbiAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvKiogXHU2RTA1XHU5NjY0XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTYwNjJcdTU5MEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5RUQ4XHU4QkE0XHU1MDNDICovXG4gIHN0YXRpYyByZXN0b3JlRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFRoZW1lQnJpZGdlLklOSkVDVEVEX1ZBUlMpIHtcbiAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKiogXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA4XHU1QjhDXHU2NTc0XHU1MjE3XHU4ODY4XHVGRjA5ICovXG5leHBvcnQgY29uc3QgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TID0gW1xuICAnLm1wMycsICcud2F2JywgJy5vZ2cnLCAnLmZsYWMnLCAnLmFhYycsICcubTRhJywgJy53bWEnLCAnLndlYm0nLCAnLm9wdXMnLFxuXTtcblxuLyoqIFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRCBcdTIxOTIgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbmNvbnN0IEFVRElPX01JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcubXAzJzogICdhdWRpby9tcGVnJyxcbiAgJy53YXYnOiAgJ2F1ZGlvL3dhdicsXG4gICcub2dnJzogICdhdWRpby9vZ2cnLFxuICAnLmZsYWMnOiAnYXVkaW8vZmxhYycsXG4gICcuYWFjJzogICdhdWRpby9hYWMnLFxuICAnLm00YSc6ICAnYXVkaW8vbXA0JyxcbiAgJy53bWEnOiAgJ2F1ZGlvL3gtbXMtd21hJyxcbiAgJy53ZWJtJzogJ2F1ZGlvL3dlYm0nLFxuICAnLm9wdXMnOiAnYXVkaW8vb3B1cycsXG59O1xuXG4vKiogXHU1QjhDXHU2NTc0IE1JTUUgXHU3QzdCXHU1NzhCXHU2NjIwXHU1QzA0XHVGRjA4XHU1NDJCIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBNSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLmh0bWwnOiAndGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5jc3MnOiAgJ3RleHQvY3NzOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qcyc6ICAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLm1qcyc6ICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcuanNvbic6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5wbmcnOiAgJ2ltYWdlL3BuZycsXG4gICcuanBnJzogICdpbWFnZS9qcGVnJyxcbiAgJy5qcGVnJzogJ2ltYWdlL2pwZWcnLFxuICAnLmdpZic6ICAnaW1hZ2UvZ2lmJyxcbiAgJy5zdmcnOiAgJ2ltYWdlL3N2Zyt4bWwnLFxuICAnLmljbyc6ICAnaW1hZ2UveC1pY29uJyxcbiAgJy53b2ZmJzogJ2ZvbnQvd29mZicsXG4gICcud29mZjInOidmb250L3dvZmYyJyxcbiAgJy50dGYnOiAgJ2ZvbnQvdHRmJyxcbiAgLi4uQVVESU9fTUlNRV9UWVBFUyxcbn07XG4iLCAiLyoqXG4gKiBwcm90b2NvbC50cyBcdTIwMTQgaG9zdCBcdTRGQTdcdTUzNEZcdThCQUVcdTdDN0JcdTU3OEJcdTk1NUNcdTUwQ0ZcbiAqXG4gKiBcdTY3MkNcdTY1ODdcdTRFRjZcdTY2MkYgd2ViYXBwL2Fzc2V0cy9zY3JpcHRzL3V0aWxzL3Byb3RvY29sLmpzIFx1NzY4NCBUeXBlU2NyaXB0IFx1NUU3Nlx1ODg0Q1x1NTI2Rlx1NjcyQ1x1MzAwMlxuICogXHU0RTI0XHU3QUVGXHU1RkM1XHU5ODdCXHU0RkREXHU2MzAxIFBST1RPQ09MX1ZFUlNJT04gXHU0RTBFIEFMTF9NRVNTQUdFX1RZUEVTIFx1NTQwQ1x1NkI2NVx1MzAwMlxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogLSBQUk9UT0NPTF9WRVJTSU9OXHVGRjFBXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU0RTI0XHU3QUVGXHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFCXG4gKiAtIEFMTF9NRVNTQUdFX1RZUEVTXHVGRjFBd2ViYXBwXHUyMTk0aG9zdCBcdTUzQ0NcdTU0MTFcdTUxNjhcdTkwRThcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTc2ODRcdTUzNTVcdTRFMDBcdTRFOEJcdTVCOUVcdTZFOTBcdUZGMUJcbiAqIC0gSU5CT1VORF9QUkVGSVhFU1x1RkYxQWhvc3QgXHU0RkE3IG9uTWVzc2FnZSBcdTc2N0RcdTU0MERcdTUzNTVcdUZGMUJcbiAqIC0gQ29tbWFuZFR5cGVcdUZGMUFcdTVCRkNcdTgyMkEvQWN0aW9uIFx1NjMwN1x1NEVFNFx1ODA1NFx1NTQwOFx1N0M3Qlx1NTc4Qlx1RkYwOFdlYmFwcENvbnRyb2xsZXIgXHU0RjdGXHU3NTI4XHVGRjA5XHUzMDAyXG4gKi9cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyAgXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDIFx1MjAxNCBcdTk4N0JcdTRFMEUgd2ViYXBwL2Fzc2V0cy9zY3JpcHRzL3V0aWxzL3Byb3RvY29sLmpzIFx1NTQwQ1x1NkI2NVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgUFJPVE9DT0xfVkVSU0lPTiA9IDE7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gIFx1NkQ4OFx1NjA2Rlx1NTI0RFx1N0YwMFx1RkYwOGhvc3QgXHU0RkE3IG9uTWVzc2FnZSBcdTY3NjVcdTZFOTBcdTUyNERcdTdGMDBcdTc2N0RcdTU0MERcdTUzNTVcdUZGMDlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IElOQk9VTkRfUFJFRklYRVMgPSBbJ3N0b3JhZ2U6JywgJ2FwcDonLCAnZmlsZTonLCAndGhlbWU6J10gYXMgY29uc3Q7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gIFx1NTE2OFx1OTBFOFx1NURGMlx1NzdFNSBtZXNzYWdlIHR5cGVcdUZGMDhcdTUzQ0NcdTU0MTFcdUZGMDlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IEFMTF9NRVNTQUdFX1RZUEVTID0gW1xuICAvLyAtLS0tIHdlYmFwcCBcdTIxOTIgaG9zdCAtLS0tXG4gICdhcHA6cmVhZHknLFxuICAnYXBwOmNsb3NlJyxcbiAgJ2FwcDpzYXZlU2VjdGlvbkNvbmZpZycsXG4gICdhcHA6c2F2ZUN1c3RvbU5vaXNlcycsXG4gICdhcHA6dGhlbWU6c3luYycsXG4gICd0aGVtZTpzeW5jUGFsZXR0ZScsXG4gICdhcHA6bGlzdFZhdWx0QXVkaW9GaWxlcycsXG4gICdhcHA6cmVhZFZhdWx0RmlsZScsXG4gICdhcHA6cmVhZExvY2FsRmlsZScsXG4gICdhcHA6cHJveHlBdWRpb1VybCcsXG4gICdhcHA6YWlJbXByb3ZlR29hbCcsXG4gIC8vIHN0b3JhZ2U6Klx1RkYwODE3IFx1NEUyQVx1NUI1MFx1N0M3Qlx1NTc4Qlx1RkYwOVxuICAnc3RvcmFnZTpyZWFkRGF5JyxcbiAgJ3N0b3JhZ2U6d3JpdGVEYXknLFxuICAnc3RvcmFnZTpsaXN0RGF5cycsXG4gICdzdG9yYWdlOmRlbGV0ZURheScsXG4gICdzdG9yYWdlOmdldFNldHRpbmcnLFxuICAnc3RvcmFnZTpwdXRTZXR0aW5nJyxcbiAgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnLFxuICAnc3RvcmFnZTpnZXRHb2FscycsXG4gICdzdG9yYWdlOnB1dEdvYWxzJyxcbiAgJ3N0b3JhZ2U6Z2V0UHVyY2hhc2VIaXN0b3J5JyxcbiAgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JyxcbiAgJ3N0b3JhZ2U6Z2V0SW5jb21lSGlzdG9yeScsXG4gICdzdG9yYWdlOnB1dEluY29tZUhpc3RvcnknLFxuICAnc3RvcmFnZTpnZXREYXlLZXlzJyxcbiAgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCcsXG4gICdzdG9yYWdlOmV4cG9ydEFsbCcsXG4gICdzdG9yYWdlOmltcG9ydEFsbCcsXG4gICdzdG9yYWdlOmNsZWFyQWxsJyxcblxuICAvLyAtLS0tIGhvc3QgXHUyMTkyIHdlYmFwcCAtLS0tXG4gICdnb2FsczpjaGFuZ2VkJyxcbiAgJ3RoZW1lOmNoYW5nZWQnLFxuICAndGhlbWU6Zm9sbG93RGlzYWJsZWQnLFxuICAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgJ25hdjpwcmV2RGF5JyxcbiAgJ25hdjpuZXh0RGF5JyxcbiAgJ25hdjp0b2RheScsXG4gICdhY3Rpb246b3BlblN0YXRzJyxcbiAgJ2FjdGlvbjpvcGVuU2V0dGluZ3MnLFxuXSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgQXBwTWVzc2FnZVR5cGUgPSAodHlwZW9mIEFMTF9NRVNTQUdFX1RZUEVTKVtudW1iZXJdO1xuXG4vKiogbmF2OiAvIGFjdGlvbjogXHU2MzA3XHU0RUU0XHU3QzdCXHU1NzhCXHVGRjA4V2ViYXBwQ29udHJvbGxlciBcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbmV4cG9ydCB0eXBlIENvbW1hbmRUeXBlID0gRXh0cmFjdDxBcHBNZXNzYWdlVHlwZSwgYG5hdjoke3N0cmluZ31gIHwgYGFjdGlvbjoke3N0cmluZ31gPjtcbiIsICIvKipcbiAqIFdlYmFwcENvbnRyb2xsZXIgXHUyMDE0IFx1NUJCRlx1NEUzQiBcdTIxOTIgd2ViYXBwIFx1NzY4NFx1N0M3Qlx1NTc4Qlx1NTMxNlx1NzZGNFx1OEZERVx1NjNBNVx1NTNFM1x1RkYwOFBoYXNlM1x1RkYwOVxuICpcbiAqIFx1NjZGRlx1NEVFMyBtYWluLnRzIFx1NEUyRFx1NjU2M1x1ODQzRFx1NzY4NFx1NUI1N1x1N0IyNlx1NEUzMlx1NjMwN1x1NEVFNCBgc2VuZFRvV2ViYXBwKCduYXY6cHJldkRheScpYFx1MzAwMlxuICogXHU1QkJGXHU0RTNCXHU0RkE3XHU2NTM5XHU3NTI4IGBuYXZQcmV2RGF5KClgIFx1N0I0OVx1OEJFRFx1NEU0OVx1NTMxNlx1NjVCOVx1NkNENVx1OEMwM1x1NzUyOFx1RkYwQ1x1NTE4NVx1OTBFOFx1NEVDRFx1N0VDRlxuICogYERhaWx5UmV2aWV3Vmlldy5zZW5kQ29tbWFuZGAgXHU4RDcwXHU2NUUyXHU2NzA5IHBvc3RNZXNzYWdlIFx1N0VCRlx1NTM0Rlx1OEJBRVx1RkYwOGBuYXY6KmAvYGFjdGlvbjoqYFx1RkYwOVx1MjAxNFx1MjAxNFxuICogXHU1MzczXHUzMDBDXHU3NkY0XHU2M0E1IEFQSSBcdTk1RThcdTk3NjIgKyBcdTY1RTJcdTY3MDlcdTY4NjVcdTUxN0NcdTVCQjlcdTVDNDJcdTMwMERcdUZGMEN3ZWJhcHAgXHU0RkE3XHU2NUUwXHU5NzAwXHU2NTM5XHU1MkE4XHVGRjBDXHU1M0VGXHU1MjA2XHU2QjY1XHU1MjA3XHU2MzYyXHUzMDAyXG4gKlxuICogXHU4QkU1XHU4RkI5XHU3NTRDXHU0RkREXHU2MzAxXHU0RTBEXHU1MkE4XHVGRjFBd2ViYXBwIFx1NEVDRFx1OTAxQVx1OEZDNyBgbWVzc2FnZWAgXHU3NkQxXHU1NDJDIGB7dHlwZSxpZH1gIFx1NUU3Nlx1NTRDRFx1NUU5NFx1RkYwQ1xuICogXHU1NkUwXHU2QjY0XHU2NzJDXHU5MUNEXHU2Nzg0XHU5NkY2XHU1NkRFXHU1RjUyXHU5OENFXHU5NjY5XHUzMDAxXHU0RTE0XHU1M0VGXHU1NzI4XHU1QkJGXHU0RTNCXHU0RkE3XHU1MzU1XHU2RDRCXHU5NTAxXHU1QjlBXHU2MzA3XHU0RUU0XHU2NjIwXHU1QzA0XHUzMDAyXG4gKlxuICogQ29tbWFuZFR5cGUgXHU0RUNFIHByb3RvY29sLnRzIFx1OTZDNlx1NEUyRFx1NUI5QVx1NEU0OVx1RkYwOFx1OTYzNlx1NkJCNTMgXHUwMEI3IFx1NTk1MVx1N0VBNlx1NTMxNlx1RkYwOVx1RkYwQ1xuICogXHU2QjY0XHU1OTA0XHU5MUNEXHU1QkZDXHU1MUZBXHU0RUU1XHU0RkREXHU2MzAxXHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA4XHU2NUUyXHU2NzA5IGltcG9ydCB7IENvbW1hbmRUeXBlIH0gZnJvbSAnV2ViYXBwQ29udHJvbGxlcicgXHU0RTBEXHU3ODM0XHVGRjA5XHUzMDAyXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBDb21tYW5kVHlwZSB9IGZyb20gJy4vcHJvdG9jb2wnO1xuXG5leHBvcnQgdHlwZSB7IENvbW1hbmRUeXBlIH0gZnJvbSAnLi9wcm90b2NvbCc7XG5cbi8qKiBcdTYzMDdcdTRFRTRcdTRFMEJcdTUzRDFcdTc2RUVcdTY4MDdcdUZGMDhEYWlseVJldmlld1ZpZXcgXHU2RUUxXHU4REIzXHU2QjY0XHU1OTUxXHU3RUE2XHVGRjA5ICovXG5pbnRlcmZhY2UgQ29tbWFuZFRhcmdldCB7XG4gIHNlbmRDb21tYW5kKHR5cGU6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJhcHBDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBnZXRUYXJnZXQ6ICgpID0+IENvbW1hbmRUYXJnZXQgfCBudWxsKSB7fVxuXG4gIHByaXZhdGUgc2VuZCh0eXBlOiBDb21tYW5kVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGFyZ2V0KCk/LnNlbmRDb21tYW5kKHR5cGUpO1xuICB9XG5cbiAgLyoqIFx1NTI0RFx1NEUwMFx1NTkyOSAqL1xuICBuYXZQcmV2RGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnbmF2OnByZXZEYXknKTtcbiAgfVxuXG4gIC8qKiBcdTU0MEVcdTRFMDBcdTU5MjkgKi9cbiAgbmF2TmV4dERheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ25hdjpuZXh0RGF5Jyk7XG4gIH1cblxuICAvKiogXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5ICovXG4gIG5hdlRvZGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnbmF2OnRvZGF5Jyk7XG4gIH1cblxuICAvKiogXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwICovXG4gIG9wZW5TdGF0cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ2FjdGlvbjpvcGVuU3RhdHMnKTtcbiAgfVxuXG4gIC8qKiBcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUgKi9cbiAgb3BlblNldHRpbmdzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnYWN0aW9uOm9wZW5TZXR0aW5ncycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1OTAxQVx1NzdFNSB3ZWJhcHAgXHU3NkVFXHU2ODA3XHU1RTkzXHU1REYyXHU1M0Q4XHU2NkY0XHVGRjA4aG9zdFx1MjE5MndlYmFwcFx1RkYwOVx1MzAwMlxuICAgKiB3ZWJhcHAgXHU2NTM2XHU1MjMwXHU1NDBFXHU4QzAzXHU3NTI4IEdvYWxTZXJ2aWNlLmxvYWQoKSBcdTkxQ0RcdThCRkIgZ29hbHMuanNvbiBcdTVFNzYgc3RvcmUubm90aWZ5KCkgXHU1QzQwXHU5MEU4XHU1MjM3XHU2NUIwXHVGRjBDXG4gICAqIFx1NEUwRFx1ODlFNlx1NTNEMVx1NTE2OFx1NUM0MCByZW5kZXJBbGxcdUZGMENcdTkwN0ZcdTUxNERcdTUxQjJcdTYzODlcdTY1RjZcdTk1RjRcdThGNzQgLyBcdThGREJcdTg4NENcdTRFMkRcdTcyQjZcdTYwMDFcdTMwMDJcbiAgICovXG4gIG5vdGlmeUdvYWxzQ2hhbmdlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmdldFRhcmdldCgpPy5zZW5kQ29tbWFuZCgnZ29hbHM6Y2hhbmdlZCcpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuXG4vKiogT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU2Q0U4XHU1MTY1XHU3Njg0XHU0RTNCXHU3QTk3XHU1M0UzIGRvY3VtZW50XHVGRjA4XHU5NzVFIGlmcmFtZSBcdTUxODVcdTc2ODQgZG9jdW1lbnRcdUZGMDkgKi9cbmRlY2xhcmUgY29uc3QgYWN0aXZlRG9jdW1lbnQ6IERvY3VtZW50O1xuXG4vKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwICovXG5leHBvcnQgaW50ZXJmYWNlIE5vaXNlSXRlbSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgdHlwZTogJ3VybCcgfCAndmF1bHQnIHwgJ2dlbmVyYXRlZCc7XG4gIHVybD86IHN0cmluZztcbiAgcGF0aD86IHN0cmluZztcbiAgdm9sdW1lPzogbnVtYmVyO1xufVxuXG4vKiogXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhbWJvb1Jldmlld1NldHRpbmdzIHtcbiAgLyoqIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1NjgzOVx1OERFRlx1NUY4NCAqL1xuICBkYXRhUGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAqL1xuICBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG4gIC8qKiBcdTY3N0ZcdTU3NTdcdTdCQTFcdTc0MDZcdTkxNERcdTdGNkVcdUZGMDhKU09OIFx1ODlFM1x1Njc5MFx1NTQwRVx1N0VEM1x1Njc4NFx1NEUwRFx1NTZGQVx1NUI5QVx1RkYwQ1x1NEY3Rlx1NzUyOFx1NUJCRFx1Njc3RVx1N0M3Qlx1NTc4Qlx1RkYwOSAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDkgKi9cbiAgdGhlbWVQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTNcdUZGMDkgKi9cbiAgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTUyMTdcdTg4NjggKi9cbiAgbm9pc2VJdGVtczogTm9pc2VJdGVtW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVDMDYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjIgKi9cbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBib29sZWFuO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4QkE5XHU2M0QyXHU0RUY2XHU5MTREXHU4MjcyXHU4RERGXHU5NjhGIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1RkYwOFx1OEJGQlx1NTNENiAtLWludGVyYWN0aXZlLWFjY2VudCBcdTUzQ0RcdTYzQThcdTgyNzJcdTc2RjhcdUZGMDkgKi9cbiAgZm9sbG93T2JzaWRpYW5UaGVtZTogYm9vbGVhbjtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBBSSBcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTg5QzRcdTUyMTJcdUZGMDhcdTdCMTRcdThCQjAgXHUyMTkyIFx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1RkYwOSAqL1xuICBhaUVuYWJsZWQ6IGJvb2xlYW47XG4gIC8qKiBBSSBcdTY3MERcdTUyQTEgQVBJIEtleVx1RkYwOEJlYXJlciBcdTkyNzRcdTY3NDNcdUZGMDkgKi9cbiAgYWlBcGlLZXk6IHN0cmluZztcbiAgLyoqIEFJIFx1NjcwRFx1NTJBMSBCYXNlIFVSTFx1RkYwOFx1NEUwRFx1NTQyQiAvY2hhdC9jb21wbGV0aW9ucyBcdTU0MEVcdTdGMDBcdUZGMENcdTU5ODIgaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tL3YxXHVGRjA5ICovXG4gIGFpQmFzZVVybDogc3RyaW5nO1xuICAvKiogXHU2QTIxXHU1NzhCXHU1NDBEXHVGRjA4XHU1OTgyIGRlZXBzZWVrLWNoYXRcdUZGMDkgKi9cbiAgYWlNb2RlbDogc3RyaW5nO1xuICAvKiogXHU5RUQ4XHU4QkE0XHU2MkM2XHU4OUUzXHU3QzkyXHU1RUE2XHVGRjFBXHU3Qzk3KDItMykgLyBcdTRFMkQoMy02KSAvIFx1N0VDNig1LTgpIFx1NUI1MFx1OTg3OSAqL1xuICBhaURlY29tcG9zZURlcHRoOiAnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNic7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IHtcbiAgZGF0YVBhdGg6ICdiYW1ib28tcmV2aWV3JyxcbiAgZW5hYmxlTWFya2Rvd25TeW5jOiB0cnVlLFxuICBzZWN0aW9uQ29uZmlnOiBudWxsLFxuICB0aGVtZVBhdGg6ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnLFxuICBub2lzZVBhdGg6ICcnLFxuICBub2lzZUl0ZW1zOiBbXSxcbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBmYWxzZSxcbiAgZm9sbG93T2JzaWRpYW5UaGVtZTogdHJ1ZSxcbiAgYWlFbmFibGVkOiBmYWxzZSxcbiAgYWlBcGlLZXk6ICcnLFxuICBhaUJhc2VVcmw6ICdodHRwczovL2FwaS5kZWVwc2Vlay5jb20vdjEnLFxuICBhaU1vZGVsOiAnZGVlcHNlZWstY2hhdCcsXG4gIGFpRGVjb21wb3NlRGVwdGg6ICdcdTRFMkQnLFxufTtcblxuLyoqXG4gKiBQbHVnaW5TZXR0aW5ncyAtIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2V0dGluZ3MgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctc2V0dGluZ3MnKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgLSBcdThCQkVcdTdGNkUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyA9PT0gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODRcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NTcyOCBWYXVsdCBcdTRFMkRcdTc2ODRcdTVCNThcdTUwQThcdTc2RUVcdTVGNTVcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2JhbWJvby1yZXZpZXcnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aCA9IHZhbHVlIHx8ICdiYW1ib28tcmV2aWV3JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gTWFya2Rvd24gXHU2NDU4XHU4OTgxXHU1NDBDXHU2QjY1XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MScpXG4gICAgICAuc2V0RGVzYygnXHU2QkNGXHU2QjIxXHU0RkREXHU1QjU4XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1NzI4IHJldmlld3MvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzUxRlx1NjIxMFx1NTNFRlx1OEJGQlx1NzY4NCAubWQgXHU2NTg3XHU0RUY2JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTVCNThcdTY1M0VcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggLmpzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aCA9IHZhbHVlIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU3NjdEXHU1NjZBXHU5N0YzID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjMnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzknKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NjMwN1x1NUI5QVx1NTQwRVx1NEVDNVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1NTE4NVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1MzAwMlx1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NjU3NFx1NEUyQVx1NUU5M1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3NjdEXHU1NjZBXHU5N0YzIFx1NjIxNlx1NzU1OVx1N0E3QVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5MycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGggPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1OERERlx1OTY4RiBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTkxNERcdTgyNzInKVxuICAgICAgLnNldERlc2MoJ1x1NjI1M1x1NUYwMFx1NTQwRVx1RkYwQ1x1NjNEMlx1NEVGNlx1NjU3NFx1NEY1M1x1OTE0RFx1ODI3Mlx1NEYxQVx1OERERlx1OTY4Rlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTc2ODRcdTVGM0FcdThDMDNcdTgyNzJcdUZGMDgtLWludGVyYWN0aXZlLWFjY2VudFx1RkYwOVx1MzAwMlx1NTIwN1x1NjM2MiBCYW1ib28gQ2hpbmEgXHU3Njg0XHU3QUY5XHU1RjcxIC8gXHU1OEE4XHU1OTFDIC8gXHU4MEVEXHU4MTAyIC8gXHU5NzUyXHU3RUZGXHU3QjQ5XHU2MTBGXHU1ODgzXHU2NUY2XHVGRjBDXHU2M0QyXHU0RUY2XHU5MTREXHU4MjcyXHU5NjhGXHU0RTRCXHU4MDU0XHU1MkE4JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGFjdGl2ZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElGcmFtZUVsZW1lbnQ+KCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKCFmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgIC8vIFx1N0FDQlx1NTM3M1x1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NUYzQVx1OEMwM1x1ODI3Mlx1NTNDRFx1NjNBOFx1NzY4NFx1ODI3Mlx1NzZGOCArIFx1NEZBN1x1OEZCOVx1NjgwRlx1ODBDQ1x1NjY2Rlx1ODI3Mlx1NkUyOSArIFx1NjU4N1x1NUI1N1x1ODI3Mlx1NkUyOVxuICAgICAgICAgICAgICBjb25zdCBhY2NlbnQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0taW50ZXJhY3RpdmUtYWNjZW50JylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCBodWUgPSBUaGVtZUJyaWRnZS5yZ2JUb0h1ZShhY2NlbnQpO1xuICAgICAgICAgICAgICBjb25zdCBzaWRlYmFyID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWJhY2tncm91bmQtc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCBiZyA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHNpZGViYXIpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9ybWFsID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbm9ybWFsJylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9ybWFsUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE5vcm1hbCk7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHRNdXRlZCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW11dGVkJylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0TXV0ZWRSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0TXV0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBwYXlsb2FkOiB7IGlzRGFyazogYm9vbGVhbjsgaHVlPzogbnVtYmVyOyBiZz86IHN0cmluZzsgdGV4dE5vcm1hbD86IHN0cmluZzsgdGV4dE11dGVkPzogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAgICAgaXNEYXJrOiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpZiAoaHVlICE9PSBudWxsKSBwYXlsb2FkLmh1ZSA9IGh1ZTtcbiAgICAgICAgICAgICAgaWYgKGJnICE9PSBudWxsKSBwYXlsb2FkLmJnID0gYmc7XG4gICAgICAgICAgICAgIGlmICh0ZXh0Tm9ybWFsUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHROb3JtYWwgPSB0ZXh0Tm9ybWFsUmdiO1xuICAgICAgICAgICAgICBpZiAodGV4dE11dGVkUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHRNdXRlZCA9IHRleHRNdXRlZFJnYjtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1NTE3M1x1OTVFRFx1ODA1NFx1NTJBOCBcdTIxOTIgXHU5MDFBXHU3N0U1IGlmcmFtZSBcdTYwNjJcdTU5MERcdTc1MjhcdTYyMzdcdTYyNEJcdTUyQThcdThDMDNcdTgyNzJcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOmZvbGxvd0Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHt9LFxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1QzA2XHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMEN3ZWJhcHAgXHU1MTg1XHU2MEFDXHU2RDZFXHU4M0RDXHU1MzU1XHU3Njg0XHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1OEMwM1x1ODI3Mlx1NEYxQVx1NUI5RVx1NjVGNlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTc2ODRcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdTkxNERcdTgyNzInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJRnJhbWVFbGVtZW50PignLmJhbWJvby1yZXZpZXctZnJhbWUnKTtcbiAgICAgICAgICAgIGlmIChmcmFtZT8uY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgZW5hYmxlZDogdmFsdWUgfVxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IEFJIFx1ODlDNFx1NTIxMiA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjA4XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwIFx1MjE5MiBcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdUZGMDknKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTU0MkZcdTc1MjggQUkgXHU4OUM0XHU1MjEyJylcbiAgICAgIC5zZXREZXNjKCdcdTVGMDBcdTU0MkZcdTU0MEVcdUZGMENcdTUzRUZcdTU3MjhcdTdCMTRcdThCQjBcdTRFMkRcdThGRDBcdTg4NENcdTMwMENBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTVDMDZcdTVGNTNcdTUyNERcdTdCMTRcdThCQjBcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTMwMERcdTU0N0RcdTRFRTRcdUZGMENcdTc1MzFcdTU5MjdcdTZBMjFcdTU3OEJcdTYyQzZcdTg5RTNcdTc2RUVcdTY4MDdcdTVFNzZcdTUxOTlcdTUxNjVcdTU5MERcdTc2RDhcdTMwMDInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlFbmFibGVkKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpRW5hYmxlZCA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBUEkgS2V5JylcbiAgICAgIC5zZXREZXNjKCdcdTU5MjdcdTZBMjFcdTU3OEJcdTY3MERcdTUyQTFcdTkyNzRcdTY3NDNcdTVCQzZcdTk0QTVcdUZGMDhCZWFyZXIgVG9rZW5cdUZGMDlcdTMwMDJcdTRFQzVcdTRGRERcdTVCNThcdTU3MjhcdTY3MkNcdTVFOTMgc2V0dGluZ3MuanNvblx1RkYwQ1x1NEUwRFx1NEUwQVx1NEYyMFx1MzAwMicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignc2stLi4uJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlBcGlLZXkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlBcGlLZXkgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLnRoZW4oKHNldHRpbmcpID0+IHtcbiAgICAgICAgLy8gXHU1QkM2XHU3ODAxXHU2ODQ2XHU2ODM3XHU1RjBGXHVGRjFBXHU4RjkzXHU1MTY1XHU5NjkwXHU4NUNGXG4gICAgICAgIGNvbnN0IGlucHV0ID0gc2V0dGluZy5jb250cm9sRWwucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgICAgICAgaWYgKGlucHV0KSBpbnB1dC50eXBlID0gJ3Bhc3N3b3JkJztcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQmFzZSBVUkwnKVxuICAgICAgLnNldERlc2MoJ0FQSSBcdTU3RkFcdTU3MzBcdTU3NDBcdUZGMDhcdTRFMERcdTU0MkIgL2NoYXQvY29tcGxldGlvbnMgXHU1NDBFXHU3RjAwXHVGRjA5XHUzMDAyXHU5RUQ4XHU4QkE0IERlZXBTZWVrIHYxXHUzMDAyJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdodHRwczovL2FwaS5kZWVwc2Vlay5jb20vdjEnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haUJhc2VVcmwpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlCYXNlVXJsID0gdmFsdWUudHJpbSgpIHx8ICdodHRwczovL2FwaS5kZWVwc2Vlay5jb20vdjEnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTZBMjFcdTU3OEInKVxuICAgICAgLnNldERlc2MoJ1x1NkEyMVx1NTc4Qlx1NTQwRFx1RkYwQ1x1NTk4MiBkZWVwc2Vlay1jaGF0IC8gZ3B0LTRvLW1pbmlcdTMwMDJcdTk3MDBcdTUxN0NcdTVCQjkgT3BlbkFJIENoYXQgQ29tcGxldGlvbnMgSlNPTiBcdTZBMjFcdTVGMEZcdTMwMDInKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2RlZXBzZWVrLWNoYXQnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haU1vZGVsKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpTW9kZWwgPSB2YWx1ZS50cmltKCkgfHwgJ2RlZXBzZWVrLWNoYXQnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTlFRDhcdThCQTRcdTYyQzZcdTg5RTNcdTdDOTJcdTVFQTYnKVxuICAgICAgLnNldERlc2MoJ0FJIFx1NjI4QVx1NzZFRVx1NjgwN1x1NjJDNlx1NjIxMFx1NUI1MFx1OTg3OVx1NzY4NFx1N0VDNlx1N0M5Mlx1NUVBNlx1RkYxQVx1N0M5NygyLTMpIC8gXHU0RTJEKDMtNikgLyBcdTdFQzYoNS04KVx1MzAwMlx1NTNFRlx1NTcyOFx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5N1x1OTFDQ1x1NTE4RFx1OTAxMFx1Njc2MVx1NTIyMFx1NjUzOVx1MzAwMicpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oJ1x1N0M5NycsICdcdTdDOTdcdUZGMDgyLTMgXHU1QjUwXHU5ODc5XHVGRjA5JylcbiAgICAgICAgICAuYWRkT3B0aW9uKCdcdTRFMkQnLCAnXHU0RTJEXHVGRjA4My02IFx1NUI1MFx1OTg3OVx1RkYwOScpXG4gICAgICAgICAgLmFkZE9wdGlvbignXHU3RUM2JywgJ1x1N0VDNlx1RkYwODUtOCBcdTVCNTBcdTk4NzlcdUZGMDknKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haURlY29tcG9zZURlcHRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpRGVjb21wb3NlRGVwdGggPSB2YWx1ZSBhcyAnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNic7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIFx1NTE3M1x1NEU4RVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTUxNzNcdTRFOEUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDFcdUZGMUFcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0IgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgcGx1Z2luQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ0JhbWJvbyBJbW1vcnRhbHNcdUZGMDhcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdUZGMDlcdTY2MkZcdTRFMDBcdTZCM0VcdTU3RkFcdTRFOEVcdTgyQ0ZcdTgwNTRcdTYzQTdcdTUyMzZcdThCQkFcdTRFNEJcdTcyMzZcdTdFRjRcdTUxNEJcdTYyNThcdTAwQjdcdTY4M0NcdTUzNjJcdTRFQzBcdTc5RDFcdTU5MkJcdTYzRDBcdTUxRkFcdTc2ODRcIk9HQVNcIlx1NzQwNlx1NUZGNVx1RkYwQ1x1NEUxM1x1NEUzQVx1NEUyQVx1NEVCQVx1NjI1M1x1OTAyMFx1NzY4NFx1NEUyRFx1NTZGRFx1OThDRVx1NzZFRVx1NjgwN1x1ODFFQVx1NTJBOFx1NTMxNlx1NTIwNlx1OTE0RFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlx1MzAwMicsXG4gICAgICBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYydcbiAgICB9KTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMlx1RkYxQVx1NEY1Q1x1ODAwNSArIFx1NEY1Q1x1NTRDMSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBhdXRob3JCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCBiYW1ib28tYWJvdXQtYXV0aG9yJyB9KTtcbiAgICBjb25zdCBhdXRob3JSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb3cnIH0pO1xuICAgIGNvbnN0IGF2YXRhciA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXZhdGFyJyB9KTtcbiAgICAvLyBcdTRFQ0VcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdThCRkJcdTUzRDZcdTU5MzRcdTUwQ0ZcdUZGMDhcdTkwMUFcdThGQzcgVmF1bHQgQVBJIFx1OEJGQlx1NTNENiAub2JzaWRpYW4vcGx1Z2lucy8gXHU0RTBCXHU3Njg0XHU4MUVBXHU2NzA5XHU4RDQ0XHU2RTkwXHVGRjA5XG4gICAgLy8gZmlyZS1hbmQtZm9yZ2V0XHVGRjFBXHU1OTM0XHU1MENGXHU5NzVFXHU1MTczXHU5NTJFXHVGRjBDXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU5NzU5XHU5RUQ4XHU2NjNFXHU3OTNBXHU5RUQ4XHU4QkE0XHU3QTdBXHU1OTM0XHU1MENGXG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGx1Z2luRGlyID0gdGhpcy5wbHVnaW4ubWFuaWZlc3QuZGlyID8/ICcnO1xuICAgICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgICBgJHtwbHVnaW5EaXJ9L2F1dGhvci1hdmF0YXIuanBnYCxcbiAgICAgICAgICBgJHtwbHVnaW5EaXJ9L3dlYmFwcC9hc3NldHMvaW1hZ2VzL2F1dGhvci1hdmF0YXIuanBnYCxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBhdmF0YXJQYXRoIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICBjb25zdCBleGlzdHMgPSBhd2FpdCBhZGFwdGVyLmV4aXN0cyhhdmF0YXJQYXRoKTtcbiAgICAgICAgICBpZiAoIWV4aXN0cykgY29udGludWU7XG4gICAgICAgICAgY29uc3QgYXZhdGFyRGF0YSA9IGF3YWl0IGFkYXB0ZXIucmVhZEJpbmFyeShhdmF0YXJQYXRoKTtcbiAgICAgICAgICBjb25zdCBiNjQgPSBCdWZmZXIuZnJvbShhdmF0YXJEYXRhKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2I2NH0pYCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNpbGVudGx5IHNraXAgXHUyMDE0IHNob3cgZGVmYXVsdCBlbXB0eSBhdmF0YXIgKi8gfVxuICAgIH0pKCk7XG5cblxuICAgIGNvbnN0IGF1dGhvckluZm8gPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1pbmZvJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU3RkJEXHU5Q0RFXHU1NDFCJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1uYW1lJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1NUI1XHU1QjU3XHU5OTg2XHU1MjFCXHU1OUNCXHU0RUJBJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb2xlJyB9KTtcblxuICAgIC8vIFx1NEY1Q1x1NTRDMVx1NTMzQVxuICAgIGF1dGhvckJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ09ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NEY1Q1x1NTRDMScsIGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1sYWJlbCcgfSk7XG4gICAgY29uc3Qgd29ya3NSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLXJvdycgfSk7XG5cbiAgICBbeyBuYW1lOiAnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tQmFtYm9vLURhcnRzJyB9LFxuICAgICB7IG5hbWU6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9XS5mb3JFYWNoKHdvcmsgPT4ge1xuICAgICAgY29uc3QgdGFnID0gd29ya3NSb3cuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IHdvcmsubmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgICBpZiAod29yay51cmwpIHtcbiAgICAgICAgdGFnLnNldENzc1N0eWxlcyh7IGN1cnNvcjogJ3BvaW50ZXInIH0pO1xuICAgICAgICB0YWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgd2luZG93Lm9wZW4od29yay51cmwsICdfYmxhbmsnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEZcbiAgICBjb25zdCBjb250YWN0Qm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEYnLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTkwQUVcdTdCQjFcdUZGMUF5YW55dWxpbjIxMDBAcXEuY29tJywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTVGQUVcdTRGRTFcdUZGMUF5YW5odTk0JywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICB9XG59XG4iLCAiLyoqXG4gKiBNYXJrZG93blBsYW5uZXIgXHUyMDE0IFx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4NyBcdTIxOTIgXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHU4OUM0XHU1MjEyXHU1NjY4XHVGRjA4UGhhc2UgMVx1RkYwOVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYwOFx1NTM1NVx1NEUwMFx1MzAwMVx1NTNFRlx1NTM1NVx1NkQ0Qlx1RkYwOVx1RkYxQVxuICogIC0gYnVpbGRQcm9tcHRcdUZGMUFcdTYyOEFcdTdCMTRcdThCQjBcdTZCNjNcdTY1ODcgKyBcdTYyQzZcdTg5RTNcdTdDOTJcdTVFQTZcdTdGRkJcdThCRDFcdTYyMTBcdTdDRkJcdTdFREYvXHU3NTI4XHU2MjM3XHU2M0QwXHU3OTNBXHU4QkNEXHVGRjA4XHU3ODZDXHU3RUE2XHU2NzVGIEpTT04gU2NoZW1hXHVGRjA5XHUzMDAyXG4gKiAgLSBwYXJzZUdvYWxzXHVGRjFBXHU0RUNFXHU2QTIxXHU1NzhCXHU1NkRFXHU2MjY3XHU2NTg3XHU2NzJDXHU0RTJEXHU2M0QwXHU1M0Q2IEpTT04gXHU2NTcwXHU3RUM0XHU1RTc2XHU2NjIwXHU1QzA0XHU0RTNBIEdvYWxJdGVtW11cdUZGMDhcdTVCQjlcdTVGQ0QgYGBganNvbiBcdTU2RjRcdTY4MEZcdUZGMDlcdTMwMDJcbiAqICAtIHBsYW5Gcm9tTm90ZVx1RkYxQVx1N0YxNlx1NjM5Mlx1N0Y1MVx1N0VEQ1x1OEJGN1x1NkM0Mlx1RkYwOHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMDkrIFx1ODlFM1x1Njc5MCArIFx1NTkzMVx1OEQyNVx1OTFDRFx1OEJENVx1NEUwMFx1NkIyMVx1MzAwMlxuICpcbiAqIFx1N0Y1MVx1N0VEQ1x1NUM0Mlx1NTNFRlx1NkNFOFx1NTE2NVx1RkYwOGZldGNoRm5cdUZGMDlcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdTc1MjggZmFrZSBcdTY2RkZcdTRFRTNcdTc3MUZcdTVCOUUgcmVxdWVzdFVybFx1RkYwQ1x1NEZERFx1NjMwMVx1OTZGNiBPYnNpZGlhbiBcdThGRDBcdTg4NENcdTY1RjZcdTRGOURcdThENTZcdTMwMDJcbiAqL1xuXG5pbXBvcnQgeyByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgR09BTF9DQVRFR09SSUVTLCB0eXBlIEdvYWxDYXRlZ29yeSwgdHlwZSBHb2FsSXRlbSwgdHlwZSBHb2FsU3ViSXRlbSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHsgY2xlYW5EYWlseU1pbiB9IGZyb20gJy4vR29hbENhcmRWYWxpZGF0b3InO1xuXG4vKiogXHU2MkM2XHU4OUUzXHU3QzkyXHU1RUE2IFx1MjE5MiBcdTVFRkFcdThCQUVcdTVCNTBcdTk4NzlcdTY1NzBcdTkxQ0ZcdTUzM0FcdTk1RjRcdTYzQ0ZcdThGRjAgKi9cbmNvbnN0IERFUFRIX0hJTlQ6IFJlY29yZDwnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNicsIHN0cmluZz4gPSB7XG4gIFx1N0M5NzogJzItMycsXG4gIFx1NEUyRDogJzMtNicsXG4gIFx1N0VDNjogJzUtOCcsXG59O1xuXG4vKiogQUkgXHU2NzBEXHU1MkExXHU4RkQ0XHU1NkRFXHU3Njg0XHU2NzAwXHU1QzBGXHU3RUQzXHU2Nzg0XHVGRjA4XHU1MTdDXHU1QkI5IE9ic2lkaWFuIHJlcXVlc3RVcmwgXHU3Njg0IFJlc3BvbnNlRGF0YVx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBBaVJlc3BvbnNlIHtcbiAgc3RhdHVzOiBudW1iZXI7XG4gIGpzb24/OiB1bmtub3duO1xuICB0ZXh0Pzogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLyoqIFx1NTNFRlx1NkNFOFx1NTE2NVx1NzY4NCBmZXRjaCBcdTUxRkRcdTY1NzBcdUZGMDhcdTlFRDhcdThCQTQgcmVxdWVzdFVybFx1RkYwOVx1MzAwMlx1N0I3RVx1NTQwRFx1NUJGOVx1OUY1MCBPYnNpZGlhbiByZXF1ZXN0VXJsIFx1NzY4NFx1NjcwMFx1NUMwRlx1NUI1MFx1OTZDNlx1MzAwMiAqL1xuZXhwb3J0IHR5cGUgQWlGZXRjaEZuID0gKG9wdHM6IHtcbiAgdXJsOiBzdHJpbmc7XG4gIG1ldGhvZD86IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGJvZHk/OiBzdHJpbmc7XG59KSA9PiBQcm9taXNlPEFpUmVzcG9uc2U+O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5uZXJTZXR0aW5ncyB7XG4gIGFpQXBpS2V5OiBzdHJpbmc7XG4gIGFpQmFzZVVybDogc3RyaW5nO1xuICBhaU1vZGVsOiBzdHJpbmc7XG4gIGFpRGVjb21wb3NlRGVwdGg6ICdcdTdDOTcnIHwgJ1x1NEUyRCcgfCAnXHU3RUM2Jztcbn1cblxuY29uc3QgQ0FURUdPUllfSURTID0gR09BTF9DQVRFR09SSUVTLm1hcCgoYykgPT4gYy5pZCkuam9pbignIHwgJyk7XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwXHU2M0QwXHU3OTNBXHU4QkNEXHUzMDAyXG4gKiBAcmV0dXJucyB7IHN5c3RlbSwgdXNlciB9IFx1NEUyNFx1NkJCNVx1NkQ4OFx1NjA2RlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQcm9tcHQoXG4gIGNvbnRlbnQ6IHN0cmluZyxcbiAgZGVwdGg6ICdcdTdDOTcnIHwgJ1x1NEUyRCcgfCAnXHU3RUM2JyA9ICdcdTRFMkQnLFxuICBzY29wZTogJ25vdGUnIHwgJ3NlbGVjdGlvbicgPSAnbm90ZSdcbik6IHsgc3lzdGVtOiBzdHJpbmc7IHVzZXI6IHN0cmluZyB9IHtcbiAgY29uc3QgY291bnQgPSBERVBUSF9ISU5UW2RlcHRoXSA/PyBERVBUSF9ISU5UWydcdTRFMkQnXTtcblxuICAvLyBcdTkwMDlcdTRFMkRcdTcyNDdcdTZCQjVcdTZBMjFcdTVGMEZcdUZGMUFcdTY2MEVcdTc4NkVcdTU0NEFcdThCQzlcdTZBMjFcdTU3OEJcdTYyOEFcdTVCODNcdTVGNTNcdTVCOENcdTY1NzRcdTYxMEZcdTU2RkVcdUZGMENcdTRFMERcdTg5ODFcdTVGNTNcdTYyMTBcdTY1NzRcdTdCQzdcdTdCMTRcdThCQjAvXHU1MDQ3XHU4QkJFXHU4RkQ4XHU2NzA5XHU1MTc2XHU1QjgzXHU1MTg1XHU1QkI5XHUzMDAyXG4gIGNvbnN0IHNjb3BlTm90ZSA9XG4gICAgc2NvcGUgPT09ICdzZWxlY3Rpb24nXG4gICAgICA/ICdcdTgyRTVcdThGOTNcdTUxNjVcdTY2MkZcdTc1MjhcdTYyMzdcdTRFQ0VcdTdCMTRcdThCQjBcdTRFMkRcdTkwMDlcdTRFMkRcdTc2ODRcdTcyNDdcdTZCQjVcdUZGMENcdThCRjdcdTc2RjRcdTYzQTVcdTYyOEFcdTVCODNcdTVGNTNcdTRGNUNcdTc1MjhcdTYyMzdcdTc2ODRcdTVCOENcdTY1NzRcdTYxMEZcdTU2RkVcdTY3NjVcdTYyQzZcdTg5RTNcdUZGMENcdTRFMERcdTg5ODFcdTUwNDdcdThCQkVcdTdCMTRcdThCQjBcdTkxQ0NcdThGRDhcdTY3MDlcdTUxNzZcdTVCODNcdTUxODVcdTVCQjlcdTMwMDFcdTRFNUZcdTRFMERcdTg5ODFcdTVGNTNcdTYyMTBcdTY1NzRcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODRcdTY0NThcdTg5ODFcdTMwMDInXG4gICAgICA6ICcnO1xuXG4gIGNvbnN0IHN5c3RlbSA9IGBcdTRGNjBcdTY2MkZcdTRFMDBcdTRFMkFcdTc2RUVcdTY4MDdcdTYyQzZcdTg5RTNcdTUyQTlcdTYyNEJcdUZGMENcdTY3MERcdTUyQTFcdTRFOEVcdTRFMkFcdTRFQkFcdTc2RUVcdTY4MDdcdTdCQTFcdTc0MDZcdTYzRDJcdTRFRjZcdTMwMENcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTMwMERcdTMwMDJcblx1OEY5M1x1NTE2NVx1NjYyRlx1NEUwMFx1N0JDNyBNYXJrZG93biBcdTdCMTRcdThCQjBcdTZCNjNcdTY1ODdcdUZGMUJcdTRGNjBcdTc2ODRcdTRFRkJcdTUyQTFcdTY2MkZcdTRFQ0VcdTRFMkRcdThCQzZcdTUyMkJcdTc1MjhcdTYyMzdcdTYwRjNcdTg5ODFcdThGQkVcdTYyMTBcdTc2ODRcdTc2RUVcdTY4MDdcdUZGMDhHb2FsXHVGRjA5XHVGRjBDXHU1RTc2XHU2MjhBXHU2QkNGXHU0RTJBXHU3NkVFXHU2ODA3XHU2MkM2XHU2MjEwXHU1OTFBXHU0RTJBXHU1M0VGXHU2MjY3XHU4ODRDXHU3Njg0XHU1QjUwXHU5ODc5XHVGRjA4U3ViSXRlbVx1RkYwOVx1MzAwMiR7c2NvcGVOb3RlfVxuXG4jIFx1NjgzOFx1NUZDM1x1NTRGMlx1NUI2Nlx1RkYwOFx1NjcwMFx1OTFDRFx1ODk4MVx1RkYwQ1x1NTFDQ1x1OUE3RVx1NEU4RVx1NEUwMFx1NTIwN1x1RkYwOVxuXHU2NzJDXHU4RjZGXHU0RUY2XHU3Njg0XHU2ODM4XHU1RkMzXHU0RUY3XHU1MDNDXHU2NjJGXHU2MjhBXHU3NkVFXHU2ODA3XHUzMDBDXHU5MUNGXHU1MzE2XHUzMDBEXHVGRjBDXHU1RTc2XHU4NDNEXHU1MjMwXHUzMDBDXHU2NUU1XHUzMDBEXHU5ODk3XHU3QzkyXHU1RUE2XHUzMDAyXHU0RjYwXHU3Njg0XHU2QkNGXHU0RTAwXHU0RTJBXHU1QjUwXHU5ODc5XHU5MEZEXHU1RkM1XHU5ODdCXHU4MEZEXHU1NkRFXHU3QjU0XHU0RTAwXHU0RTJBXHU5NUVFXHU5ODk4XHVGRjFBXHUzMDBDXHU0RUNBXHU1OTI5XHU4OTgxXHU1MDVBXHU1OTFBXHU1QzExXHVGRjFGXHUzMDBEXG4tIFx1OTFDRlx1NTMxNlx1RkYxQVx1NkJDRlx1NEUyQVx1NUI1MFx1OTg3OVx1NUZDNVx1OTg3Qlx1NjcwOVx1NEUwMFx1NEUyQVx1N0VBRlx1NjU3MFx1NUI1N1x1NzY4NFx1NkJDRlx1NjVFNVx1OTFDRiBkYWlseU1pblx1RkYwOFx1NTk4MiBcIjMwXCJcdTMwMDFcIjJcIlx1MzAwMVwiMjAwXCJcdUZGMDlcdUZGMENcdTRFMERcdTVFMjZcdTRFRkJcdTRGNTVcdTUzNTVcdTRGNERcdTYyMTZcdTY1ODdcdTVCNTdcdTMwMDJcbi0gXHU2NUU1XHU5ODk3XHU3QzkyXHU1RUE2XHVGRjFBXHU2MjhBXCJcdTdFRDNcdTY3OUNcdTU3OEIvXHU1QjhGXHU1OTI3XHU3NkVFXHU2ODA3XCJcdTdGRkJcdThCRDFcdTYyMTBcIlx1NkJDRlx1NTkyOVx1NzY4NFx1NTNFRlx1NjI2N1x1ODg0Q1x1NTJBOFx1NEY1Q1wiXHUzMDAyXG4gIFx1MDBCNyBcIlx1OEJGQlx1NUI4Q1x1MzAwQVhYXHUzMDBCXCIgXHUyMTkyIFx1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwXCJcdUZGMENkYWlseU1pbiBcIjMwXCJcbiAgXHUwMEI3IFwiXHU1MUNGXHU1QzExXHU5NkY2XHU5OERGXCIgXHUyMTkyIFx1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU5NkY2XHU5OERGXHU3MEVEXHU5MUNGXHU0RTBBXHU5NjUwKFx1NTM0M1x1NTM2MSlcIlx1RkYwQ2RhaWx5TWluIFwiMjAwXCJcbiAgXHUwMEI3IFwiXHU2NUU5XHU3NzYxXCIgXHUyMTkyIFx1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU3NzYxXHU3NzIwXHU2NUY2XHU5NTdGKFx1NUMwRlx1NjVGNilcIlx1RkYwQ2RhaWx5TWluIFwiN1wiXG4tIFx1NUI1MFx1OTg3OVx1NTQwRCBuYW1lIFx1NUU5NFx1NTMwNVx1NTQyQlx1OTFDRlx1NTMxNlx1N0VGNFx1NUVBNlx1RkYwOFx1NTk4MlwiXHU2QkNGXHU1OTI5XHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwXCJcdTgwMENcdTk3NUVcIlx1OEJGQlx1NEU2NlwiXHVGRjA5XHUzMDAyXG4tIFx1NjJEMlx1N0VERFx1NkEyMVx1N0NDQVx1RkYxQVx1N0VERFx1NEUwRFx1NEVBN1x1NTFGQVx1NjVFMFx1NkNENVx1OTFDRlx1NTMxNlx1NzY4NFx1NUI1MFx1OTg3OVx1RkYwOFx1NTk4MlwiXHU1NzVBXHU2MzAxXCJcIlx1NTJBQVx1NTI5QlwiXCJcdTRGRERcdTYzMDFcIlx1RkYwOVx1RkYxQlx1ODJFNVx1NEUwMFx1NEUyQVx1NjBGM1x1NkNENVx1NjVFMFx1NkNENVx1OTFDRlx1NTMxNlx1RkYwQ1x1NUMzMVx1NjUzOVx1NTE5OVx1NjIxMFx1ODBGRFx1OTFDRlx1NTMxNlx1NzY4NFx1NjVFNVx1N0VBN1x1ODg0Q1x1NEUzQVx1MzAwMlxuLSAqKlx1NjVGNlx1OTVGNFx1OUE3MVx1NTJBOFx1ODlDNFx1NTIxMlx1RkYwOFx1NTE3M1x1OTUyRVx1RkYwOSoqXHVGRjFBXHU1RjUzXHU0RjYwXHU4MEZEXHU2M0E4XHU2NUFEXHU4RDc3XHU2QjYyXHU2NUY2XHU5NUY0XHVGRjA4c3RhcnREYXRlIFx1NTQ4QyBlbmREYXRlXHVGRjA5XHVGRjBDXHU1RTk0XHU0RTNCXHU1MkE4XHU3NTI4XHU1QjgzXHU1M0NEXHU2M0E4IGRhaWx5TWluXHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU1MUVEXHU3QTdBXHU3MzFDXHVGRjFBXG4gIFx1MDBCNyBcdTYwM0JcdTU5MjlcdTY1NzAgPSBlbmREYXRlIC0gc3RhcnREYXRlXG4gIFx1MDBCNyBcdTgyRTUgdGFyZ2V0VmFsdWUgXHU1M0VGXHU5MUNGXHU1MzE2XHU0RTE0XHU1M0VGXHU1NzQ3XHU2NDRBXHVGRjFBXHUzMDBDM1x1NEUyQVx1NjcwOFx1OEJGQlx1NUI4QzNcdTY3MkNcdTRFNjZcdUZGMENcdTZCQ0ZcdTY3MkNcdTdFQTYzMDBcdTk4NzVcdTMwMEQgXHUyMTkyIDkwMFx1OTg3NVx1MDBGNzkwXHU1OTI5PTEwXHU5ODc1L1x1NTkyOSBcdTIxOTIgZGFpbHlNaW4gXCIxMFwiXG4gIFx1MDBCNyBcdTgyRTUgdGFyZ2V0VmFsdWUgXHU0RTBEXHU1M0VGXHU3NkY0XHU2M0E1XHU1NzQ3XHU2NDRBXHVGRjA4XHU1OTgyXCJcdTUxQ0ZcdTkxQ0Q1a2dcIlx1NEY1M1x1OTFDRFx1OTc1RVx1N0VCRlx1NjAyN1x1RkYwOVx1RkYxQVx1NjJDNlx1NEUzQVx1NTNFRlx1NTc0N1x1NjQ0QVx1NzY4NFx1ODg0Q1x1NTJBOFx1NUI1MFx1OTg3OVx1RkYwQ1x1NTk4MlwiXHU2QkNGXHU1OTI5XHU4RkQwXHU1MkE4XHU2RDg4XHU4MDE3KFx1NTM0M1x1NTM2MSlcIlx1RkYwQ2RhaWx5TWluIFx1NTNENlx1NTQwOFx1NzQwNlx1NTAzQ1xuICBcdTAwQjcgXHU3NTI4IHJlYXNvbiBcdThCRjRcdTY2MEVcdThCQTFcdTdCOTdcdTRGOURcdTYzNkVcdUZGMDhcdTU5ODJcIjkwMFx1OTg3NVx1MDBGNzkwXHU1OTI5XHUyMjQ4MTBcdTk4NzUvXHU1OTI5XCJcdUZGMDlcdUZGMENcdThCQTlcdTc1MjhcdTYyMzdcdTUzRUZcdTY4MzhcdTVCOUVcbiAgXHUwMEI3IFx1ODJFNVx1OEQ3N1x1NkI2Mlx1NjVGNlx1OTVGNFx1NjIxNlx1NjAzQlx1OTFDRlx1Nzg2RVx1NUI5RVx1NjVFMFx1NkNENVx1NjNBOFx1NjVBRFx1RkYwQ1x1NjMwOVx1NUUzOFx1OEJDNlx1N0VEOVx1NEUwMFx1NEUyQVx1NEZERFx1NUI4OCBkYWlseU1pblx1RkYwQ1x1NEUwRFx1NUYzQVx1ODg0Q1x1NzU1OVx1N0E3QVxuXG4jIFx1NUI1MFx1OTg3OVx1NzZGOFx1NTE3M1x1NjAyNyAmIFx1NTNFRlx1OTFDRlx1NTMxNlx1NjJBNFx1NjgwRlx1RkYwOFx1Nzg2Q1x1NjAyN1x1ODk4MVx1NkM0Mlx1RkYwQ1x1NEUwRVx1NjgzOFx1NUZDM1x1NTRGMlx1NUI2Nlx1NTQwQ1x1N0I0OVx1OTFDRFx1ODk4MVx1RkYwOVxuXHU1QjUwXHU5ODc5XHU1RkM1XHU5ODdCXHU1NDBDXHU2NUY2XHU2RUUxXHU4REIzXHUzMDBDXHU1NkY0XHU3RUQ1XHU3NkVFXHU2ODA3XHUzMDBEXHU0RTBFXHUzMDBDXHU1M0VGXHU5MUNGXHU1MzE2XHUzMDBEXHU0RTI0XHU2NzYxXHU5NEMxXHU1RjhCXHVGRjBDXHU3RjNBXHU0RTAwXHU0RTBEXHU1M0VGXHVGRjFCXHU0RUZCXHU0RTAwXHU0RTBEXHU2RUUxXHU4REIzXHU5MEZEXHU0RTBEXHU1MUM2XHU0RUE3XHU1MUZBXHUzMDAyXG5cbiMjIFx1OTRDMVx1NUY4Qlx1NEUwMFx1RkYxQVx1NUZDNVx1OTg3Qlx1NTZGNFx1N0VENVx1NzZFRVx1NjgwN1x1RkYwOFx1NjJEMlx1N0VERFx1OEREMVx1OTg5OFx1RkYwOVxuLSBcdTZCQ0ZcdTRFMkFcdTVCNTBcdTk4NzlcdTkwRkRcdTg5ODFcdTgwRkRcdTc2RjRcdTYzQTVcdTU2REVcdTdCNTRcdUZGMUFcdTMwMENcdTRFQ0FcdTU5MjlcdTUwNUFcdThGRDlcdTRFRjZcdTRFOEJcdUZGMENcdTY2MkZcdTU0MjZcdTYzQThcdThGREJcdTRFODZcdThGRDlcdTRFMkFcdTc2RUVcdTY4MDdcdUZGMUZcdTMwMERcdTgwRkRcdTYzQThcdThGREJcdTYyNERcdTdCOTdcdTc2RjhcdTUxNzNcdTMwMDJcbi0gXHU0RTI1XHU3OTgxXHU4OEM1XHU5OTcwXHU2MDI3XHUzMDAxXHU2Q0RCXHU1MzE2XHU2MDI3XHUzMDAxXHU0RTBFXHU3NkVFXHU2ODA3XHU1RjMxXHU3NkY4XHU1MTczXHU3Njg0XHU1QjUwXHU5ODc5XHUzMDAyXHU0RjhCXHVGRjFBXHU3NkVFXHU2ODA3XHU2NjJGXCIzXHU0RTJBXHU2NzA4XHU1QjY2XHU0RjFBUmVhY3RcIlx1RkYwQ1x1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU1NTlEXHU2QzM0OFx1Njc2RlwiXCJcdTZCQ0ZcdTU5MjlcdTY1NjNcdTZCNjVcIlx1NUMzMVx1NUM1RVx1NEU4RVx1NzlCQlx1OTg5OFx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTIyMFx1OTY2NFx1NjIxNlx1NjUzOVx1NTE5OVx1NjIxMFx1NjcwRFx1NTJBMVx1NzZFRVx1NjgwN1x1NzY4NFx1NTJBOFx1NEY1Q1x1RkYwOFx1NTk4MlwiXHU2QkNGXHU1OTI5XHU1MTk5UmVhY3RcdTdFQzRcdTRFRjYoXHU0RTJBKVwiXHVGRjA5XHUzMDAyXG4tIFx1ODJFNVx1NEUwMFx1NEUyQVx1NzA3NVx1NjExRlx1NTNFQVx1NEUwRVx1NzZFRVx1NjgwN1x1NUYzMVx1NzZGOFx1NTE3M1x1RkYwQ1x1NUI4MVx1NTNFRlx1NEUyMlx1NUYwM1x1NEU1Rlx1NEUwRFx1ODk4MVx1NTg1RVx1OEZEQlx1ODlDNFx1NTIxMlx1MjAxNFx1MjAxNFx1NUU3M1x1NUVCOFx1NTgwNlx1NzgwQ1x1NEYxQVx1OTY0RFx1NEY0RVx1NTNFRlx1NjI2N1x1ODg0Q1x1NjAyN1x1MzAwMlxuLSBcdTVCNTBcdTk4NzlcdTU0MERcdTVFOTRcdTRGNTNcdTczQjBcIlx1NzZFRVx1NjgwN1x1N0VGNFx1NUVBNlwiXHVGRjFBXHU1MUNGXHU5MUNEXHU3NkVFXHU2ODA3XHU3Njg0XHU1QjUwXHU5ODc5XHU1RTk0XHU1NkY0XHU3RUQ1XHU3MEVEXHU5MUNGL1x1OEZEMFx1NTJBOC9cdTRGNTNcdTkxQ0RcdUZGMENcdTgwMENcdTk3NUVcdTY1RTBcdTUxNzNcdTc2ODRcIlx1NkJDRlx1NTkyOVx1OEJGQlx1NEU2NlwiXHUzMDAyXG5cbiMjIFx1OTRDMVx1NUY4Qlx1NEU4Q1x1RkYxQVx1NUZDNVx1OTg3Qlx1NTNFRlx1OTFDRlx1NTMxNlx1RkYwOFx1NjJEMlx1N0VERFx1OTZCRVx1OTFDRlx1NTMxNlx1NEVGQlx1NTJBMVx1RkYwOVxuLSBcdTY3NUNcdTdFRERcIlx1OTZCRVx1NEVFNVx1OTFDRlx1NTMxNlwiXHU3Njg0XHU0RUZCXHU1MkExXHVGRjFBXHU1OTgyXCJcdTYzRDBcdTUzNDdcdThCRURcdTYxMUZcIlwiXHU1ODlFXHU1RjNBXHU4MUVBXHU0RkUxXCJcIlx1NEZERFx1NjMwMVx1NTk3RFx1NUZDM1x1NjBDNVwiXCJcdTUyQTBcdTZERjFcdTc0MDZcdTg5RTNcIlwiXHU2M0QwXHU5QUQ4XHU1QkExXHU3RjhFXCJcdTMwMDJcdThGRDlcdTRFOUJcdThCQ0RcdTY1RTBcdTZDRDVcdTc2RjRcdTYzQTVcdThCQTFcdTY1NzBcdUZGMENcdTRFMTRcdTZCQ0ZcdTY1RTVcdTY1RTBcdTZDRDVcdTY4MzhcdTlBOENcdTMwMDJcbi0gXHU1RkM1XHU5ODdCXHU2MjhBXCJcdTk2QkVcdTkxQ0ZcdTUzMTZcIlx1NjUzOVx1NTE5OVx1NjIxMFwiXHU1M0VGXHU4QkExXHU2NTcwL1x1NTNFRlx1NUVBNlx1OTFDRlwiXHU3Njg0XHU2NUU1XHU3RUE3XHU4ODRDXHU0RTNBXHVGRjA4XHU2NTM5XHU1MTk5XHU4MzAzXHU1RjBGXHVGRjA5XHVGRjFBXG4gIFx1MDBCNyBcIlx1NjNEMFx1NTM0N1x1ODJGMVx1OEJFRFwiIFx1MjE5MiBcIlx1NkJDRlx1NTkyOVx1ODBDQ1x1NTM1NVx1OEJDRChcdTRFMkEpXCIgZGFpbHlNaW4gXCIyMFwiXHVGRjFCXHU2MjE2IFwiXHU2QkNGXHU1OTI5XHU1NDJDXHU1MjlCKFx1NTIwNlx1OTQ5RilcIiBkYWlseU1pbiBcIjE1XCJcbiAgXHUwMEI3IFwiXHU1QzExXHU3M0E5XHU2MjRCXHU2NzNBXCIgXHUyMTkyIFwiXHU2QkNGXHU1OTI5XHU1QzRGXHU1RTU1XHU2NUY2XHU5NTdGXHU0RTBBXHU5NjUwKFx1NUMwRlx1NjVGNilcIiBkYWlseU1pbiBcIjNcIlxuICBcdTAwQjcgXCJcdTU5MUFcdTU1OURcdTZDMzRcIiBcdTIxOTIgXCJcdTZCQ0ZcdTU5MjlcdTk5NkVcdTZDMzRcdTkxQ0YoXHU2NzZGKVwiIGRhaWx5TWluIFwiOFwiXHVGRjA4XHU0RUM1XHU1RjUzXHU4QkU1XHU3NkVFXHU2ODA3XHU3ODZFXHU1QzVFXHU1MDY1XHU1RUI3L1x1NTFDRlx1OTFDRFx1NzZGOFx1NTE3M1x1NjVGNlx1NjI0RFx1NEY1Q1x1NEUzQVx1NUI1MFx1OTg3OVx1RkYwQ1x1NTQyNlx1NTIxOVx1ODlDNlx1NEUzQVx1NzlCQlx1OTg5OFx1RkYwOVxuICBcdTAwQjcgXCJcdTRGRERcdTYzMDFcdTU5N0RcdTVGQzNcdTYwMDFcIiBcdTIxOTIgXHU2NTM5XHU1MTk5XHU0RTNBXHU1MTc3XHU0RjUzXHU4ODRDXHU0RTNBXHVGRjBDXHU1OTgyIFwiXHU2QkNGXHU1OTI5XHU1MUE1XHU2MEYzKFx1NTIwNlx1OTQ5RilcIiBkYWlseU1pbiBcIjEwXCIgLyBcIlx1NkJDRlx1NTkyOVx1OEJCMFx1NUY1NVx1NjExRlx1NjA2OShcdTY3NjEpXCIgZGFpbHlNaW4gXCIxXCJcbiAgXHUwMEI3IFwiXHU2REYxXHU1MTY1XHU3NDA2XHU4OUUzXHU3Qjk3XHU2Q0Q1XCIgXHUyMTkyIFwiXHU2QkNGXHU1OTI5XHU1MjM3XHU5ODk4KFx1OTA1MylcIiBkYWlseU1pbiBcIjJcIiAvIFwiXHU2QkNGXHU1OTI5XHU4QkZCXHU2MjgwXHU2NzJGXHU2NTg3KFx1N0JDNylcIiBkYWlseU1pbiBcIjFcIlxuLSBcdTY1MzlcdTUxOTlcdTUzOUZcdTUyMTlcdUZGMUFcdTYyN0VcdThCRTVcdTc2RUVcdTY4MDdcdTc2ODRcIlx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1wiXHVGRjA4XHU5ODc1XHU2NTcwL1x1NTIwNlx1OTQ5Ri9cdTRFMkFcdTY1NzAvXHU2NzZGXHU2NTcwL1x1NTM0M1x1NTM2MS9cdTZCMjFcdTY1NzBcdUZGMDlcdUZGMENcdTgwMENcdTk3NUVcdTYyQkRcdThDNjFcdTYxMUZcdTUzRDdcdTMwMDJcbi0gXHU4MkU1XHU1QjlFXHU1NzI4XHU2MjdFXHU0RTBEXHU1MjMwXHU0RUZCXHU0RjU1XHU1M0VGXHU2NTcwXHU0RUUzXHU3NDA2XHU2MzA3XHU2ODA3XHVGRjBDXHU4QkY0XHU2NjBFXHU4QkU1XHU3NkVFXHU2ODA3XHU2NzJDXHU4RUFCXHU0RTBEXHU5MDAyXHU1NDA4XHU2MkM2XHU4OUUzXHUyMDE0XHUyMDE0XHU4QkU1IGdvYWwgXHU3Njg0IGl0ZW1zIFx1NzU1OVx1N0E3QVx1RkYwOHJlYXNvbiBcdThCRjRcdTY2MEVcdTUzOUZcdTU2RTBcdUZGMDlcdUZGMENcdTRFNUZcdTRFMERcdTg5ODFcdTc1MjhcIlx1NTJBQVx1NTI5QlwiXCJcdTU3NUFcdTYzMDFcIlx1N0I0OVx1NEYyQVx1OTFDRlx1NTMxNlx1OEJDRFx1NTFEMVx1NjU3MFx1MzAwMlxuXG4jIFx1OEY5M1x1NTFGQVx1NjgzQ1x1NUYwRlx1RkYwOFx1NEUyNVx1NjgzQyBKU09OXHVGRjBDXHU0RTBEXHU4OTgxXHU0RUZCXHU0RjU1XHU4OUUzXHU5MUNBXHUzMDAxXHU0RTBEXHU4OTgxIG1hcmtkb3duIFx1NTZGNFx1NjgwRlx1RkYwOVxue1xuICBcImdvYWxzXCI6IFtcbiAgICB7XG4gICAgICBcInRpdGxlXCI6IFwiXHU3NkVFXHU2ODA3XHU2ODA3XHU5ODk4XHVGRjA4XHU3QjgwXHU2RDAxXHVGRjBDXHU1QzExXHU0RThFMjBcdTVCNTdcdUZGMDlcIixcbiAgICAgIFwiYW5hbHlzaXNcIjogXCJcdTRFMDBcdTUzRTVcdThCRERcdTVGNTJcdTdFQjNcdTdCMTRcdThCQjBcdTRFM0JcdTY1RTggKyBcdTYyQzZcdTg5RTNcdTc0MDZcdTc1MzEvXHU1MTczXHU5NTJFXHU5OENFXHU5NjY5XHVGRjA4XHUyMjY0NDBcdTVCNTdcdUZGMENcdTRFQzVcdTVDNTVcdTc5M0FcdTc1MjhcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMDlcIixcbiAgICAgIFwiY2F0ZWdvcnlcIjogXCJ3b3JrIHwgcGVyc29uYWwgfCBoZWFsdGggfCBzdHVkeSB8IGZpbmFuY2UgfCBvdGhlclwiLFxuICAgICAgXCJzdGFydERhdGVcIjogXCJcdTVGMDBcdTU5Q0JcdTY1RTVcdTY3MUYgWVlZWS1NTS1ERFx1MzAwMlx1N0IxNFx1OEJCMFx1NjcyQVx1NjNEMFx1NTNDQVx1NjVGNlx1NUZDNVx1OTg3Qlx1NTg2Qlx1NEVDQVx1NTkyOVx1RkYwOFx1NEUwRSB1c2VyIFx1NkQ4OFx1NjA2Rlx1NEUyRFx1NzY4NFx1MjAxQ1x1NEVDQVx1NTkyOVx1MjAxRFx1NEUwMFx1ODFGNFx1RkYwOVx1RkYwQ1x1NEUwRFx1ODk4MVx1NzU1OVx1N0E3QVwiLFxuICAgICAgXCJlbmREYXRlXCI6IFwiXHU2MjJBXHU2QjYyXHU2NUU1XHU2NzFGIFlZWVktTU0tRERcdUZGMENcdTY3MkFcdTc3RTVcdTc1NTlcdTdBN0FcdTRFMzJcIixcbiAgICAgIFwiaXRlbXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJuYW1lXCI6IFwiXHU1QjUwXHU5ODc5XHU1NDBEXHVGRjA4XHU1NDJCXHU5MUNGXHU1MzE2XHU3RUY0XHU1RUE2XHU3Njg0XHU1M0VGXHU4NDNEXHU1NzMwXHU1MkE4XHU0RjVDXHVGRjBDXHU1OTgyJ1x1NkJDRlx1NTkyOVx1OTYwNVx1OEJGQlx1OTg3NVx1NjU3MCdcdUZGMDlcIixcbiAgICAgICAgICBcInRhcmdldFZhbHVlXCI6IFwiXHU1M0VGXHU5MUNGXHU1MzE2XHU3Njg0XHU3NkVFXHU2ODA3XHU1MDNDKFx1NUI1N1x1N0IyNlx1NEUzMilcdUZGMENcdTY3MkFcdTc3RTVcdTc1NTlcdTdBN0FcdTRFMzJcIixcbiAgICAgICAgICBcImN1cnJlbnRWYWx1ZVwiOiBcIlx1NUY1M1x1NTI0RFx1NURGMlx1OEZCRVx1NjIxMFx1NTAzQyhcdTVCNTdcdTdCMjZcdTRFMzIpXHVGRjBDXHU2NzJBXHU3N0U1XHU3NTU5XHU3QTdBXHU0RTMyXCIsXG4gICAgICAgICAgXCJkYWlseU1pblwiOiBcIlx1NkJDRlx1NTkyOVx1OTcwMFx1NjNBOFx1OEZEQlx1NzY4NFx1OTFDRlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NjYyRlx1N0VBRlx1NjU3MFx1NUI1N1x1NUI1N1x1N0IyNlx1NEUzMihcdTU5ODIgJzMwJylcdUZGMENcdTRFMERcdTVFMjZcdTUzNTVcdTRGNERcIixcbiAgICAgICAgICBcInRhc2tEYXlUeXBlXCI6IFwiZGFpbHlcIixcbiAgICAgICAgICBcInJlYXNvblwiOiBcIlx1NEUzQVx1NEY1NVx1OEZEOVx1NjgzN1x1NjJDNlx1RkYwOFx1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1RkYwQ1x1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwOVwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn1cblxuIyBcdTg5QzRcdTUyMTlcbjEuIFx1NTNFQVx1OEY5M1x1NTFGQSBKU09OXHUzMDAyXHU4MkU1XHU4QkM2XHU1MjJCXHU0RTBEXHU1MUZBXHU0RUZCXHU0RjU1XHU2NjBFXHU3ODZFXHU3NkVFXHU2ODA3XHVGRjBDXHU4RkQ0XHU1NkRFIHtcImdvYWxzXCI6W119XHUzMDAyXG4yLiBkYWlseU1pbiBcdTVGQzVcdTk4N0JcdTY2MkZcdTdFQUZcdTY1NzBcdTVCNTdcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMENcdTc5ODFcdTZCNjJcdTY0M0FcdTVFMjZcdTUzNTVcdTRGNERcdTYyMTZcdTY1ODdcdTVCNTdcdUZGMDhcIjMwXHU1MjA2XHU5NDlGXCJcdTIxOTJcIjMwXCJcdUZGMENcIjctOFx1NUMwRlx1NjVGNlwiXHUyMTkyXHU1M0Q2XHU0RkREXHU1Qjg4XHU1MDNDXCI3XCJcdUZGMDlcdTMwMDJcbjMuIFx1ODJFNVx1NjVFMFx1NkNENVx1NzZGNFx1NjNBNVx1NjNBOFx1NjVBRFx1NkJDRlx1NTkyOVx1NTA1QVx1NTkxQVx1NUMxMVx1RkYwQ1x1OEJGN1x1NTIyOVx1NzUyOFx1MzAwQ1x1OEQ3N1x1NkI2Mlx1NjVGNlx1OTVGNCArIFx1NzZFRVx1NjgwN1x1NjAzQlx1OTFDRlx1MzAwRFx1NTNDRFx1NjNBOCBkYWlseU1pblx1RkYwOFx1NTNDMlx1ODlDMVx1NjgzOFx1NUZDM1x1NTRGMlx1NUI2Nlx1N0IyQzVcdTY3NjFcdUZGMDlcdUZGMUJcdTVDM0RcdTkxQ0ZcdTRFMERcdTg5ODFcdTc1NTlcdTdBN0FcdTMwMDJcbjQuIFx1NTM1NVx1NEY0RFx1NEZFMVx1NjA2Rlx1NjUzRVx1OEZEQlx1NUI1MFx1OTg3OVx1NTQwRFx1NjIxNiB0YXJnZXRWYWx1ZVx1RkYwOFx1NTk4MiBuYW1lOlwiXHU2QkNGXHU1OTI5XHU3NzYxXHU3NzIwXHU2NUY2XHU5NTdGKFx1NUMwRlx1NjVGNilcIlx1RkYwOVx1RkYwQ2RhaWx5TWluIFx1NTNFQVx1NjUzRVx1NjU3MFx1NUI1N1x1MzAwMlxuNS4gdGFyZ2V0VmFsdWUgLyBjdXJyZW50VmFsdWUgXHU2NzJBXHU3N0U1XHU1M0VGXHU3NTU5XHU3QTdBXHU0RTMyIFwiXCJcdUZGMENcdTRGNDYqKlx1N0VERFx1NEUwRFx1N0YxNlx1OTAyMCoqXHU3Q0JFXHU3ODZFXHU2NTcwXHU1QjU3XHUzMDAyXG42LiBjYXRlZ29yeSBcdTVGQzVcdTk4N0JcdTUzRDZcdTgxRUFcdTY3OUFcdTRFM0VcdUZGMDgke0NBVEVHT1JZX0lEU31cdUZGMDlcdUZGMENcdTY1RTBcdTZDRDVcdTUyMjRcdTY1QURcdTc1MjggXCJvdGhlclwiXHUzMDAyXG43LiB0YXNrRGF5VHlwZSBcdTlFRDhcdThCQTQgXCJkYWlseVwiXHVGRjFCXHU0RUM1XHU1RjUzXHU4QkU1XHU4ODRDXHU0RTNBXHU1OTI5XHU3MTM2XHU0RTBEXHU2NjJGXHU2QkNGXHU1OTI5XHU1MDVBXHVGRjA4XHU1OTgyXCJcdTZCQ0ZcdTU0NjhcdTRGNTNcdTY4QzBcIlx1RkYwOVx1NjI0RFx1NzUyOCBcIndlZWtseVwiIC8gXCJtb250aGx5XCIgLyBcImN1c3RvbVwiXHVGRjBDXHU1RTc2XHU2MzZFXHU2QjY0XHU4QzAzXHU2NTc0IGRhaWx5TWluIFx1OEJFRFx1NEU0OVx1MzAwMlxuOC4gXHU3NkVFXHU2ODA3XHU1QjhGXHU1OTI3XHU2MjE2XHU3N0U1XHU4QkM2XHU0RTBEXHU4REIzXHU2NUY2XHVGRjBDXHU0RTNCXHU1MkE4XHU2MkM2ICR7Y291bnR9IFx1NEUyQVx1NUI1MFx1OTg3OVx1RkYwOFx1N0M5Nz0yLTMgLyBcdTRFMkQ9My02IC8gXHU3RUM2PTUtOFx1RkYwOVx1RkYwQ1x1NTA0Rlx1NTQxMVx1NTNFRlx1ODQzRFx1NTczMFx1ODg0Q1x1NTJBOFx1RkYxQlx1NzUyOCByZWFzb24gXHU4QkY0XHU2NjBFXHU0RjlEXHU2MzZFXHUzMDAyXG45LiAqKlx1NjVFNVx1NjcxRlx1NjNBOFx1N0I5N1x1RkYwOFx1OTFDRFx1ODk4MVx1RkYwOSoqXHVGRjFBXG4gICAtICoqc3RhcnREYXRlKipcdUZGMUFcdTdCMTRcdThCQjBcdTgyRTVcdTY3MkFcdTYzRDBcdTUzQ0FcdTUxNzdcdTRGNTNcdTVGMDBcdTU5Q0JcdTY1RTVcdTY3MUZcdUZGMENcdTVGQzVcdTk4N0JcdTU4NkJcIlx1NEVDQVx1NTkyOVwiXHVGRjA4XHU1MzczIHVzZXIgXHU2RDg4XHU2MDZGXHU0RTJEXHU3RUQ5XHU1MUZBXHU3Njg0XHU2NUU1XHU2NzFGXHVGRjA5XHVGRjBDXHU0RTBEXHU4OTgxXHU3NTU5XHU3QTdBXHUzMDAyXHU0RUM1XHU1RjUzXHU3QjE0XHU4QkIwXHU2NjBFXHU3ODZFXHU4QkY0XHU0RTg2XCJcdTRFQ0VYXHU2NzA4WFx1NjVFNVx1NUYwMFx1NTlDQlwiXHU2MjREXHU3NTI4XHU4QkU1XHU2NUU1XHU2NzFGXHUzMDAyXG4gICAtICoqZW5kRGF0ZSoqXHVGRjFBXHU3QjE0XHU4QkIwXHU4MkU1XHU2M0QwXHU1MjMwXHU3NkY4XHU1QkY5XHU2NUY2XHU5NTdGXHVGRjA4XCIzXHU0RTJBXHU2NzA4XCJcIlx1NTM0QVx1NUU3NFwiXCI5MFx1NTkyOVwiXCJcdTUyMzBcdTVFNzRcdTVFOTVcIlx1N0I0OVx1RkYwOVx1RkYwQ1x1NUZDNVx1OTg3Qlx1NzUyOFx1MzAwQ3N0YXJ0RGF0ZSArIFx1NjVGNlx1OTU3Rlx1MzAwRFx1NjNBOFx1N0I5N1x1NjIxMCBZWVlZLU1NLUREIFx1NTg2Qlx1NTE2NSBlbmREYXRlXHVGRjBDXHU0RTBEXHU4OTgxXHU3NTU5XHU3QTdBXHUzMDAyXHU0RUM1XHU1RjUzXHU3QjE0XHU4QkIwXHU1QjhDXHU1MTY4XHU2NUUwXHU2NUY2XHU5NUY0XHU3RUJGXHU3RDIyXHU2NUY2IGVuZERhdGUgXHU2MjREXHU3NTU5XHU3QTdBXHU0RTMyXHUzMDAyXG4gICAtIFx1NEUwQlx1NjVCOSB1c2VyIFx1NkQ4OFx1NjA2Rlx1NEUyRFx1NEYxQVx1N0VEOVx1NTFGQVx1NEVDQVx1NTkyOVx1NzY4NFx1NjVFNVx1NjcxRlx1RkYwQ1x1OEJGN1x1NEVFNVx1OEJFNVx1NjVFNVx1NjcxRlx1NEUzQVx1NTFDNlx1OEZEQlx1ODg0Q1x1NjNBOFx1N0I5N1x1MzAwMlxuMTAuIFx1OTY2NCBhbmFseXNpcyBcdTVCNTdcdTZCQjVcdTU5MTZcdUZGMENcdTRFMERcdTg5ODFcdTUzMDVcdTU0MkIgaWQgLyBpY29uIC8gcHJvZ3Jlc3MgXHU3QjQ5XHU1QjU3XHU2QkI1XHVGRjBDXHU3NTMxXHU2M0QyXHU0RUY2XHU4ODY1XHU1MTY4XHVGRjA4YW5hbHlzaXMgXHU0RjFBXHU4OEFCXHU1QzU1XHU3OTNBXHU3RUQ5XHU3NTI4XHU2MjM3XHVGRjA5XHUzMDAyXG4xMS4gXHU1QjUwXHU5ODc5XHU3ODZDXHU2MDI3XHU0RTI0XHU1MTczXHVGRjFBXHU1RkM1XHU5ODdCXHVGRjA4YVx1RkYwOVx1NzZGNFx1NjNBNVx1NjcwRFx1NTJBMVx1NEU4RVx1OEJFNVx1NzZFRVx1NjgwN1x1RkYwOFx1NEUwRFx1OEREMVx1OTg5OFx1RkYwOVx1RkYxQlx1RkYwOGJcdUZGMDlcdTUzRUZcdTc1MjhcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW4gXHU4ODY4XHU4RkJFXHU2QkNGXHU2NUU1XHU4RkRCXHU1RUE2XHUzMDAyXHU5NkJFXHU5MUNGXHU1MzE2XHU2MjE2XHU3OUJCXHU5ODk4XHU3Njg0XHU1QjUwXHU5ODc5XHU0RTAwXHU1RjhCXHU0RTBEXHU1Rjk3XHU0RUE3XHU1MUZBXHVGRjFCXHU2MjdFXHU0RTBEXHU1MjMwXHU1M0VGXHU2NTcwXHU0RUUzXHU3NDA2XHU2MzA3XHU2ODA3XHU2NUY2XHU4QkU1IGdvYWwgXHU3Njg0IGl0ZW1zIFx1NzU1OVx1N0E3QVx1RkYwQ1x1NEUwRFx1NUY5N1x1NzUyOFwiXHU1MkFBXHU1MjlCXCJcIlx1NTc1QVx1NjMwMVwiXCJcdTRGRERcdTYzMDFcIlx1N0I0OVx1NEYyQVx1OTFDRlx1NTMxNlx1OEJDRFx1NTFEMVx1NjU3MFx1MzAwMlxuMTIuICoqXHU3NkVFXHU2ODA3XHU2ODA3XHU5ODk4XHU1RkM1XHU5ODdCXHU1RjUyXHU3RUIzXHU1NDdEXHU1NDBEXHVGRjA4XHU0RTBEXHU4OTgxXHU3MTY3XHU2Mjg0XHU3QjE0XHU4QkIwXHU1MzlGXHU2NTg3XHVGRjA5KipcdUZGMUFcbiAgICAtIFx1NjgwN1x1OTg5OFx1NjYyRlwiXHU3NkVFXHU2ODA3XHU3Njg0XHU1NDBEXHU1QjU3L1x1OTg3OVx1NzZFRVx1NTQwRFwiXHVGRjBDXHU0RTBEXHU2NjJGXHU3QjE0XHU4QkIwXHU1MzlGXHU1M0U1XHU3Njg0XHU1OTBEXHU4RkYwXHUzMDAyXHU1RkM1XHU5ODdCXHU0RUNFXHU3QjE0XHU4QkIwXHU1MTg1XHU1QkI5XHU0RTJEXHU2M0QwXHU3MEJDXHU1MUZBXHU0RTAwXHU0RTJBXHU2RTA1XHU2NjcwXHUzMDAxXHU2MkJEXHU4QzYxXHUzMDAxXHU1M0VGXHU3MkVDXHU3QUNCXHU2MjEwXHU3QUNCXHU3Njg0XHU3NkVFXHU2ODA3XHU1NDBEXHUzMDAyXG4gICAgLSBcdTUxOTlcdTZDRDVcdUZGMUFcdTUyQThcdTVCQkVcdTdFRDNcdTY3ODRcdTYyMTZcdTU0MERcdThCQ0RcdTc3RURcdThCRURcdUZGMEM8MjAgXHU1QjU3XHVGRjBDXHU1M0JCXHU2Mzg5XCJcdTYyMTFcdTYwRjNcIlwiM1x1NEUyQVx1NjcwOFwiXCI1a2dcIlx1N0I0OVx1NTE3N1x1NEY1M1x1NjU3MFx1NUI1N1x1NEUwRVx1NjVGNlx1OTVGNFx1RkYwQ1x1NTNFQVx1NEZERFx1NzU1OVx1NzZFRVx1NjgwN1x1NjVCOVx1NTQxMVx1MzAwMlxuICAgIC0gXHU2NTM5XHU1NDBEXHU3OTNBXHU0RjhCXHVGRjA4XHU0RUM1XHU1M0MyXHU4MDAzXHU5MDNCXHU4RjkxXHVGRjBDXHU0RTBEXHU2NjJGXHU2QjdCXHU4OUM0XHU1MjE5XHVGRjA5XHVGRjFBXG4gICAgICBcdTAwQjcgXHU3QjE0XHU4QkIwXHUzMDBDM1x1NEUyQVx1NjcwOFx1NTFDRlx1OTFDRCA1a2dcdTMwMEQgXHUyMTkyIFx1NjgwN1x1OTg5OFx1MzAwQ1x1NTA2NVx1NUVCN1x1NTFDRlx1OTFDRFx1MzAwRFx1NjIxNlx1MzAwQ1x1NEY1M1x1OTFDRFx1N0JBMVx1NzQwNlx1MzAwRFxuICAgICAgXHUwMEI3IFx1N0IxNFx1OEJCMFx1MzAwQ1x1OEJGQlx1NUI4Q1x1MzAwQVhYIFx1N0I5N1x1NkNENVx1MzAwQlx1MzAwRCBcdTIxOTIgXHU2ODA3XHU5ODk4XHUzMDBDXHU3Q0ZCXHU3RURGXHU1QjY2XHU0RTYwIFhYXHUzMDBEXHU2MjE2XHUzMDBDXHU3Qjk3XHU2Q0Q1XHU1MTY1XHU5NUU4XHUzMDBEXG4gICAgICBcdTAwQjcgXHU3QjE0XHU4QkIwXHUzMDBDXHU2QkNGXHU1OTI5XHU4REQxXHU2QjY1IDMwIFx1NTIwNlx1OTQ5Rlx1MzAwMVx1NjNBN1x1NTIzNlx1OTk2RVx1OThERlx1MzAwRCBcdTIxOTIgXHU2ODA3XHU5ODk4XHUzMDBDXHU1MTdCXHU2MjEwXHU4RkQwXHU1MkE4XHU0RTYwXHU2MEVGXHUzMDBEXG4gICAgLSBcdTUzQ0RcdTRGOEJcdUZGMDhcdTc5ODFcdTZCNjJcdUZGMDlcdUZGMUFcdTY4MDdcdTk4OThcdTRFMEVcdTdCMTRcdThCQjBcdTk5OTZcdTUzRTVcdTkwMTBcdTVCNTdcdTc2RjhcdTU0MENcdTMwMDFcdTRGRERcdTc1NTlcdTUzOUZcdTU5Q0JcIjNcdTRFMkFcdTY3MDhcIi9cIjVrZ1wiL1wiXHU2MjExXHU2MEYzXCJcdTdCNDlcdTUxNzdcdTRGNTNcdTY1NzBcdTVCNTdcdTRFMEVcdTY1RjZcdTk1RjRcdTk2NTBcdTVCOUFcdTMwMDJcbjEzLiAqKlx1NkJDRlx1NEUyQVx1NzZFRVx1NjgwN1x1NUZDNVx1OTg3Qlx1N0VEOVx1NTFGQSBhbmFseXNpc1x1RkYwOFx1NUY1Mlx1N0VCM1x1NTIwNlx1Njc5MFx1RkYwOSoqXHVGRjFBXHU3NTI4IDEtMiBcdTUzRTVcdTY5ODJcdTYyRUNcdTdCMTRcdThCQjBcdTRFM0JcdTY1RThcdUZGMENcdTVFNzZcdThCRjRcdTY2MEVcdTMwMENcdTRFM0FcdTRGNTVcdThGRDlcdTY4MzdcdTYyQzZcdTMwMDFcdTUxNzNcdTk1MkVcdTk4Q0VcdTk2NjlcdTYyMTZcdTZDRThcdTYxMEZcdTcwQjlcdTMwMERcdUZGMENcdTIyNjQ0MCBcdTVCNTdcdTMwMDJcdThGRDlcdTY2MkZcdTdFRDlcdTc1MjhcdTYyMzdcdTc2ODRcIlx1NUY1Mlx1N0VCMyArIFx1NTIwNlx1Njc5MFwiXHVGRjBDXHU0RTBEXHU4OTgxXHU1M0VBXHU1OTBEXHU4RkYwXHU2ODA3XHU5ODk4XHU2MjE2XHU3NTU5XHU3QTdBXHUzMDAyXHU0RUM1XHU1QzU1XHU3OTNBXHU3NTI4XHVGRjBDXHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHU0RTNBXHU1QjUwXHU5ODc5XHUzMDAyYDtcblxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7IC8vIFlZWVktTU0tRERcbiAgY29uc3QgdXNlciA9XG4gICAgc2NvcGUgPT09ICdzZWxlY3Rpb24nXG4gICAgICA/IGBcdTRFQ0FcdTU5MjlcdTY2MkYgJHt0b2RheX1cdTMwMDJcXG5cXG5cdTRFRTVcdTRFMEJcdTY2MkZcdTc1MjhcdTYyMzdcdTU3MjhcdTdCMTRcdThCQjBcdTRFMkRcdTkwMDlcdTRFMkRcdTc2ODRcdTRFMDBcdTZCQjVcdTY1ODdcdTY3MkNcdUZGMENcdThCRjdcdTc2RjRcdTYzQTVcdTYyOEFcdTVCODNcdTRGNUNcdTRFM0FcdTRFMDBcdTRFMkEvXHU1OTFBXHU0RTJBXHU3NkVFXHU2ODA3XHU2NzY1XHU2MkM2XHU4OUUzXHVGRjA4XHU0RTBEXHU4OTgxXHU1RjUzXHU2MjEwXHU2NTc0XHU3QkM3XHU3QjE0XHU4QkIwXHVGRjA5XHVGRjFBXFxuJHtjb250ZW50fWBcbiAgICAgIDogYFx1NEVDQVx1NTkyOVx1NjYyRiAke3RvZGF5fVx1MzAwMlxcblxcblx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4N1x1RkYxQVxcbiR7Y29udGVudH1gO1xuXG4gIHJldHVybiB7IHN5c3RlbSwgdXNlciB9O1xufVxuXG4vKiogXHU0RUNFXHU2QTIxXHU1NzhCXHU1NkRFXHU2MjY3XHU2NTg3XHU2NzJDXHU0RTJEXHU2M0QwXHU1M0Q2IGdvYWxzIFx1NjU3MFx1N0VDNFx1RkYwOFx1NUJCOVx1NUZDRCBgYGBqc29uIFx1NTZGNFx1NjgwRlx1NEUwRVx1NTI0RFx1NTQwRVx1NUU5Rlx1OEJERFx1RkYwOSAqL1xuZnVuY3Rpb24gZXh0cmFjdEdvYWxzT2JqZWN0KHJhdzogdW5rbm93bik6IHsgZ29hbHM/OiB1bmtub3duIH0ge1xuICBpZiAocmF3ICYmIHR5cGVvZiByYXcgPT09ICdvYmplY3QnICYmICdnb2FscycgaW4gKHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikpIHtcbiAgICByZXR1cm4gcmF3IGFzIHsgZ29hbHM/OiB1bmtub3duIH07XG4gIH1cbiAgLy8gcmF3IFx1NTNFRlx1ODBGRFx1NjYyRlx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOHJlc3AudGV4dCBcdTYyMTZcdTVERjIgc3RyaW5naWZ5IFx1NzY4NFx1NTZERVx1NjI2N1x1RkYwOVxuICBsZXQgdGV4dCA9IHR5cGVvZiByYXcgPT09ICdzdHJpbmcnID8gcmF3IDogSlNPTi5zdHJpbmdpZnkocmF3KTtcblxuICAvLyBcdTUzQkIgYGBganNvbiAuLi4gYGBgIFx1NTZGNFx1NjgwRlxuICBjb25zdCBmZW5jZSA9IHRleHQubWF0Y2goL2BgYCg/Ompzb24pP1xccyooW1xcc1xcU10qPylgYGAvaSk7XG4gIGlmIChmZW5jZSkgdGV4dCA9IGZlbmNlWzFdO1xuXG4gIC8vIFx1NTNENlx1N0IyQ1x1NEUwMFx1NEUyQSB7IFx1NTIzMFx1NjcwMFx1NTQwRVx1NEUwMFx1NEUyQSB9IFx1NEU0Qlx1OTVGNFx1NzY4NCBKU09OXG4gIGNvbnN0IHN0YXJ0ID0gdGV4dC5pbmRleE9mKCd7Jyk7XG4gIGNvbnN0IGVuZCA9IHRleHQubGFzdEluZGV4T2YoJ30nKTtcbiAgaWYgKHN0YXJ0ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8IGVuZCA8PSBzdGFydCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU1NkRFXHU2MjY3XHU0RTJEXHU2NzJBXHU2MjdFXHU1MjMwIEpTT04gXHU1QkY5XHU4QzYxJyk7XG4gIH1cbiAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQgKyAxKSk7XG4gIGlmIChwYXJzZWQgJiYgdHlwZW9mIHBhcnNlZCA9PT0gJ29iamVjdCcgJiYgJ2dvYWxzJyBpbiBwYXJzZWQpIHJldHVybiBwYXJzZWQ7XG4gIHRocm93IG5ldyBFcnJvcignSlNPTiBcdTRFMkRcdTdGM0FcdTVDMTEgZ29hbHMgXHU1QjU3XHU2QkI1Jyk7XG59XG5cbi8qKlxuICogXHU2MjhBXHU2QTIxXHU1NzhCXHU1NkRFXHU2MjY3XHU4OUUzXHU2NzkwXHU0RTNBIEdvYWxJdGVtW11cdTMwMDJcbiAqIFx1NEVDNVx1NTA1QVx1N0VEM1x1Njc4NFx1NjNEMFx1NTNENlx1NEUwRVx1NTdGQVx1Nzg0MFx1NjYyMFx1NUMwNFx1RkYwOFx1NzUxRlx1NjIxMCBpZFx1MzAwMVx1NjYyMFx1NUMwNFx1NUI1N1x1NkJCNVx1RkYwOVx1RkYxQlx1NkRGMVx1NUVBNlx1NjgyMVx1OUE4Qy9cdTg4NjVcdTlFRDhcdThCQTRcdTRFQTRcdTc1MzEgR29hbENhcmRWYWxpZGF0b3JcdTMwMDJcbiAqIEB0aHJvd3MgXHU1RjUzXHU1NkRFXHU2MjY3XHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU2MjE2XHU3RUQzXHU2Nzg0XHU5NzVFXHU2Q0Q1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUdvYWxzKHJhd1RleHQ6IHVua25vd24pOiBHb2FsSXRlbVtdIHtcbiAgY29uc3Qgb2JqID0gZXh0cmFjdEdvYWxzT2JqZWN0KHJhd1RleHQpO1xuICBjb25zdCBnb2FscyA9IG9iai5nb2FscztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGdvYWxzKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignZ29hbHMgXHU0RTBEXHU2NjJGXHU2NTcwXHU3RUM0Jyk7XG4gIH1cblxuICByZXR1cm4gZ29hbHMubWFwKChnLCBnaSk6IEdvYWxJdGVtID0+IHtcbiAgICBjb25zdCBnb2FsID0gKGcgPz8ge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuaXNBcnJheShnb2FsLml0ZW1zKVxuICAgICAgPyAoZ29hbC5pdGVtcyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPltdKS5tYXAoKGl0LCBpaSk6IEdvYWxTdWJJdGVtID0+IHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gaXQgPz8ge307XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHR5cGVvZiBpdGVtLm5hbWUgPT09ICdzdHJpbmcnICYmIGl0ZW0ubmFtZSA/IGl0ZW0ubmFtZSA6IGBcdTVCNTBcdTk4Nzkke2lpICsgMX1gLFxuICAgICAgICAgICAgdGFyZ2V0VmFsdWU6IHR5cGVvZiBpdGVtLnRhcmdldFZhbHVlID09PSAnc3RyaW5nJyA/IGl0ZW0udGFyZ2V0VmFsdWUgOiAnJyxcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZTogdHlwZW9mIGl0ZW0uY3VycmVudFZhbHVlID09PSAnc3RyaW5nJyA/IGl0ZW0uY3VycmVudFZhbHVlIDogJycsXG4gICAgICAgICAgICBkYWlseU1pbjogY2xlYW5EYWlseU1pbihpdGVtLmRhaWx5TWluKSxcbiAgICAgICAgICAgIHRhc2tEYXlUeXBlOiB0eXBlb2YgaXRlbS50YXNrRGF5VHlwZSA9PT0gJ3N0cmluZycgPyBpdGVtLnRhc2tEYXlUeXBlIDogJ2RhaWx5JyxcbiAgICAgICAgICAgIGRldGFpbDogdHlwZW9mIGl0ZW0ucmVhc29uID09PSAnc3RyaW5nJyA/IGl0ZW0ucmVhc29uIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgICA6IFtdO1xuXG4gICAgY29uc3QgY2F0ZWdvcnlSYXcgPSB0eXBlb2YgZ29hbC5jYXRlZ29yeSA9PT0gJ3N0cmluZycgPyBnb2FsLmNhdGVnb3J5IDogJyc7XG4gICAgY29uc3QgY2F0ZWdvcnk6IEdvYWxDYXRlZ29yeSB8IHN0cmluZyA9XG4gICAgICBHT0FMX0NBVEVHT1JJRVMuc29tZSgoYykgPT4gYy5pZCA9PT0gY2F0ZWdvcnlSYXcpID8gY2F0ZWdvcnlSYXcgOiAnb3RoZXInO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBgZ29hbF8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke2dpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWAsXG4gICAgICB0aXRsZTogdHlwZW9mIGdvYWwudGl0bGUgPT09ICdzdHJpbmcnICYmIGdvYWwudGl0bGUgPyBnb2FsLnRpdGxlIDogYFx1NzZFRVx1NjgwNyR7Z2kgKyAxfWAsXG4gICAgICBhbmFseXNpczogdHlwZW9mIGdvYWwuYW5hbHlzaXMgPT09ICdzdHJpbmcnICYmIGdvYWwuYW5hbHlzaXMgPyBnb2FsLmFuYWx5c2lzIDogdW5kZWZpbmVkLFxuICAgICAgY2F0ZWdvcnksXG4gICAgICBzdGFydERhdGU6IHR5cGVvZiBnb2FsLnN0YXJ0RGF0ZSA9PT0gJ3N0cmluZycgPyBnb2FsLnN0YXJ0RGF0ZSA6ICcnLFxuICAgICAgZW5kRGF0ZTogdHlwZW9mIGdvYWwuZW5kRGF0ZSA9PT0gJ3N0cmluZycgPyBnb2FsLmVuZERhdGUgOiAnJyxcbiAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgaXRlbXMsXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogXHU0RUNFIGNoYXQvY29tcGxldGlvbnMgXHU1NkRFXHU2MjY3XHU0RTJEXHU2M0QwXHU1M0Q2XHU2QTIxXHU1NzhCXHU4RjkzXHU1MUZBXHU3Njg0XHU2NTg3XHU2NzJDXHUzMDAyXG4gKiBcdTUxN0NcdTVCQjlcdTRFMjRcdTc5Q0RcdTVGNjJcdTYwMDFcdUZGMUFcbiAqICAtIE9wZW5BSSBcdTk4Q0VcdTY4M0NcdUZGMUF7IGNob2ljZXM6W3sgbWVzc2FnZTp7IGNvbnRlbnQgfSB9XSB9XHVGRjA4anNvbiBcdTYyMTYgdGV4dCBcdTU3NDdcdTUzRUZcdTgwRkRcdUZGMDlcbiAqICAtIFx1NzZGNFx1NTFGQVx1RkYxQXJlc3AuanNvbiBcdTVERjJcdTY2MkZcdTVCRjlcdThDNjEgLyByZXNwLnRleHQgXHU1REYyXHU2NjJGIEpTT04gXHU2NTg3XHU2NzJDXG4gKiBcdTYzRDBcdTUzRDZcdTU5MzFcdThEMjVcdUZGMDhcdTdBN0EgLyBcdTk3NUUgMnh4XHVGRjA5XHU3RURGXHU0RTAwXHU2MjlCXHU5NTE5XHVGRjBDXHU0RkJGXHU0RThFXHU0RTBBXHU1QzQyXHU5MUNEXHU4QkQ1IC8gXHU2M0QwXHU3OTNBXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2hhdFRleHQocmVzcDogQWlSZXNwb25zZSk6IHN0cmluZyB7XG4gIGlmIChyZXNwLnN0YXR1cyA8IDIwMCB8fCByZXNwLnN0YXR1cyA+PSAzMDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEFJIFx1NjcwRFx1NTJBMVx1OEZENFx1NTZERSBIVFRQICR7cmVzcC5zdGF0dXN9YCk7XG4gIH1cbiAgbGV0IGRhdGE6IHVua25vd24gPSByZXNwLmpzb247XG4gIGlmIChkYXRhID09PSB1bmRlZmluZWQgfHwgZGF0YSA9PT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgcmVzcC50ZXh0ID09PSAnc3RyaW5nJyAmJiByZXNwLnRleHQudHJpbSgpKSBkYXRhID0gcmVzcC50ZXh0O1xuICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKCdBSSBcdTU2REVcdTYyNjdcdTRFM0FcdTdBN0EnKTtcbiAgfVxuXG4gIC8vIE9wZW5BSSBcdTk4Q0VcdTY4M0NcdTUzMDVcdTg4QzVcdUZGMUFjaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCBcdTYyNERcdTY2MkZcdTc3MUZcdTZCNjNcdTc2ODQgSlNPTi9cdTY1ODdcdTY3MkNcbiAgaWYgKFxuICAgIGRhdGEgJiZcbiAgICB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiZcbiAgICBBcnJheS5pc0FycmF5KChkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5jaG9pY2VzKVxuICApIHtcbiAgICBjb25zdCBjaG9pY2VzID0gKGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNob2ljZXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xuICAgIGNvbnN0IG1zZyA9IGNob2ljZXNbMF0/Lm1lc3NhZ2UgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgaWYgKG1zZyAmJiB0eXBlb2YgbXNnLmNvbnRlbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gbXNnLmNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSByZXR1cm4gZGF0YTtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xufVxuXG4vKipcbiAqIFx1ODlDNFx1NTIxMlx1NEUzQlx1NkQ0MVx1N0EwQlx1RkYxQVx1OEMwM1x1NzUyOCBBSSBcdTIxOTIgXHU4OUUzXHU2NzkwIFx1MjE5MiBcdTU5MzFcdThEMjVcdTkxQ0RcdThCRDVcdTRFMDBcdTZCMjFcdTMwMDJcbiAqIEBwYXJhbSBjb250ZW50IFx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4N1xuICogQHBhcmFtIHNldHRpbmdzIEFJIFx1OEJCRVx1N0Y2RVx1RkYwOGtleSAvIGJhc2VVcmwgLyBtb2RlbCAvIGRlcHRoXHVGRjA5XG4gKiBAcGFyYW0gZmV0Y2hGbiBcdTUzRUZcdTZDRThcdTUxNjVcdTc2ODQgZmV0Y2hcdUZGMDhcdTlFRDhcdThCQTQgcmVxdWVzdFVybFx1RkYwQ1x1NEZCRlx1NEU4RVx1NkQ0Qlx1OEJENVx1RkYwOVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGxhbkZyb21Ob3RlKFxuICBjb250ZW50OiBzdHJpbmcsXG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MsXG4gIGZldGNoRm46IEFpRmV0Y2hGbiA9IHJlcXVlc3RVcmwgYXMgdW5rbm93biBhcyBBaUZldGNoRm4sXG4gIHNjb3BlOiAnbm90ZScgfCAnc2VsZWN0aW9uJyA9ICdub3RlJ1xuKTogUHJvbWlzZTxHb2FsSXRlbVtdPiB7XG4gIGNvbnN0IHVybCA9IGAke3NldHRpbmdzLmFpQmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2A7XG4gIGNvbnN0IHsgc3lzdGVtLCB1c2VyIH0gPSBidWlsZFByb21wdChjb250ZW50LCBzZXR0aW5ncy5haURlY29tcG9zZURlcHRoLCBzY29wZSk7XG5cbiAgY29uc3QgYXR0ZW1wdCA9IGFzeW5jICgpOiBQcm9taXNlPEFpUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2hGbih7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3NldHRpbmdzLmFpQXBpS2V5fWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtb2RlbDogc2V0dGluZ3MuYWlNb2RlbCxcbiAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gfSxcbiAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogdXNlciB9LFxuICAgICAgICBdLFxuICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogJ2pzb25fb2JqZWN0JyB9LFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgfSksXG4gICAgfSk7XG4gICAgaWYgKHJlc3Auc3RhdHVzIDwgMjAwIHx8IHJlc3Auc3RhdHVzID49IDMwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBSSBcdTY3MERcdTUyQTFcdThGRDRcdTU2REUgSFRUUCAke3Jlc3Auc3RhdHVzfWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcDtcbiAgfTtcblxuICBjb25zdCBwYXJzZU9uY2UgPSAocmVzcDogQWlSZXNwb25zZSk6IEdvYWxJdGVtW10gPT4gcGFyc2VHb2FscyhleHRyYWN0Q2hhdFRleHQocmVzcCkpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHBhcnNlT25jZShhd2FpdCBhdHRlbXB0KCkpO1xuICB9IGNhdGNoIChmaXJzdEVycikge1xuICAgIC8vIFx1OTFDRFx1OEJENVx1NEUwMFx1NkIyMVx1RkYwOFx1N0Y1MVx1N0VEQ1x1NjI5Nlx1NTJBOCAvIFx1NTA3Nlx1NTNEMVx1NTc0RiBKU09OXHVGRjA5XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBwYXJzZU9uY2UoYXdhaXQgYXR0ZW1wdCgpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEFJIFx1ODlDNFx1NTIxMlx1NTkzMVx1OEQyNVx1RkYxQSR7Zmlyc3RFcnIgaW5zdGFuY2VvZiBFcnJvciA/IGZpcnN0RXJyLm1lc3NhZ2UgOiAnXHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU4RkQ0XHU1NkRFXHU3RUQzXHU2NzlDJ31cdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgQVBJIEtleSAvIFx1N0Y1MVx1N0VEQ1x1RkYwQ1x1NjIxNlx1OTFDRFx1OEJENVx1MzAwMmBcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBcdTY4MzhcdTVGQzNcdTY1NzBcdTYzNkVcdTVDNDJcdTdDN0JcdTU3OEJcdTVCOUFcdTRFNDlcdUZGMDhCIFx1Njg2M1x1RkYxQVx1NkQ4OFx1OTY2NFx1NjU3MFx1NjM2RVx1NUM0MiBhbnlcdUZGMDlcbiAqXG4gKiBcdThGRDlcdTRFOUJcdTdDN0JcdTU3OEJcdTg4QUIgVmF1bHRTdG9yYWdlIC8gSW1wb3J0VmFsaWRhdG9yIC8gTWFya2Rvd25TeW5jIC8gU3RvcmFnZUJyaWRnZSBcdTUxNzFcdTc1MjhcdUZGMENcbiAqIFx1Nzg2RVx1NEZERFwiXHU1QkZDXHU1MTY1XHU2ODIxXHU5QThDXCJcdTRFMEVcIlx1NUI5RVx1OTY0NVx1ODQzRFx1NzZEOFx1N0VEM1x1Njc4NFwiXHU1NzI4XHU3RjE2XHU4QkQxXHU2NzFGXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHUyMDE0XHUyMDE0XG4gKiBcdTRFRTVcdTU0MEVcdTY1MzkgRGF5RGF0YSBcdTdFRDNcdTY3ODRcdTY1RjZcdUZGMENUUyBcdTRGMUFcdTVGM0FcdTUyMzZcdTU0MENcdTZCNjUgSW1wb3J0VmFsaWRhdG9yIFx1NzY4NFx1NjgyMVx1OUE4Q1x1OTAzQlx1OEY5MVx1MzAwMlxuICovXG5cbi8qKiBcdTUzNTVcdTY1RTVcdTY1RjZcdTk1RjRcdThGNzRcdTc2ODRcdTRFMDBcdTRFMkFcdTY1RjZcdTZCQjUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGltZWxpbmVQZXJpb2Qge1xuICBwZXJpb2Q6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICB0aW1lOiBzdHJpbmc7XG4gIGljb24/OiBzdHJpbmc7XG4gIGV2YWw/OiBzdHJpbmc7XG4gIGl0ZW1zPzogQXJyYXk8eyB0aW1lOiBzdHJpbmc7IHRhc2s6IHN0cmluZzsgZXZhbD86IHN0cmluZyB9Pjtcbn1cblxuLyoqXG4gKiBcdTc2RUVcdTY4MDdcdTk4ODZcdTU3REZcdTY3OUFcdTRFM0VcdUZGMDhcdTRFMEUgd2ViYXBwIERFRkFVTFRfQ0FURUdPUklFUyBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMDlcbiAqIHdvcms9XHU1REU1XHU0RjVDIC8gcGVyc29uYWw9XHU0RTJBXHU0RUJBIC8gaGVhbHRoPVx1NTA2NVx1NUVCNyAvIHN0dWR5PVx1NUI2Nlx1NEU2MCAvIGZpbmFuY2U9XHU4RDIyXHU1MkExIC8gb3RoZXI9XHU1MTc2XHU0RUQ2XG4gKi9cbmV4cG9ydCBjb25zdCBHT0FMX0NBVEVHT1JJRVMgPSBbXG4gIHsgaWQ6ICd3b3JrJywgbmFtZTogJ1x1NURFNVx1NEY1QycsIGljb246ICdcdUQ4M0RcdURDQkMnIH0sXG4gIHsgaWQ6ICdwZXJzb25hbCcsIG5hbWU6ICdcdTRFMkFcdTRFQkEnLCBpY29uOiAnXHVEODNDXHVERjMxJyB9LFxuICB7IGlkOiAnaGVhbHRoJywgbmFtZTogJ1x1NTA2NVx1NUVCNycsIGljb246ICdcdUQ4M0NcdURGQzMnIH0sXG4gIHsgaWQ6ICdzdHVkeScsIG5hbWU6ICdcdTVCNjZcdTRFNjAnLCBpY29uOiAnXHVEODNEXHVEQ0RBJyB9LFxuICB7IGlkOiAnZmluYW5jZScsIG5hbWU6ICdcdThEMjJcdTUyQTEnLCBpY29uOiAnXHVEODNEXHVEQ0IwJyB9LFxuICB7IGlkOiAnb3RoZXInLCBuYW1lOiAnXHU1MTc2XHU0RUQ2JywgaWNvbjogJ1x1RDgzRVx1RERFOScgfSxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIEdvYWxDYXRlZ29yeSA9ICh0eXBlb2YgR09BTF9DQVRFR09SSUVTKVtudW1iZXJdWydpZCddO1xuXG4vKiogXHU1QjUwXHU5ODc5XHU4MjgyXHU1OTRGXHU3QzdCXHU1NzhCXHVGRjA4XHU0RTBFIHdlYmFwcCB0YXNrRGF5VHlwZSBcdTVCRjlcdTlGNTBcdUZGMDkgKi9cbmV4cG9ydCB0eXBlIFRhc2tEYXlUeXBlID0gJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ2N1c3RvbSc7XG5cbi8qKlxuICogXHU3NkVFXHU2ODA3XHU5ODc5XHVGRjA4Z29hbHMgXHU0RTBCXHU3Njg0XHU0RTAwXHU5ODc5XHU4RkRCXHU1RUE2XHVGRjA5XG4gKiBcdTVCNTdcdTZCQjVcdTU0MTEgd2ViYXBwIEdvYWxTZXJ2aWNlIFx1NjcxRlx1NjcxQlx1NzY4NFx1NUI1MFx1OTg3OVx1N0VEM1x1Njc4NFx1NUJGOVx1OUY1MFx1RkYwOFx1ODlDMSBHb2FsU2VydmljZS5fbWlncmF0ZUZyb21EYXlEYXRhIC8gZGVmYXVsdERhdGEuanNcdUZGMDlcdUZGMUFcbiAqICAtIGRhaWx5TWluIC8gdGFza0RheVR5cGUgXHU5QTcxXHU1MkE4XHUzMDBDXHU0RUNBXHU2NUU1XHU0RUZCXHU1MkExXHUzMDBEXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXG4gKiAgLSBzdGFydFZhbHVlIC8gdGFyZ2V0VmFsdWUgLyBjdXJyZW50VmFsdWUgXHU5QTcxXHU1MkE4XHU4RkRCXHU1RUE2XHU4RkZEXHU4RTJBXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR29hbFN1Ykl0ZW0ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHBlcmNlbnQ/OiBudW1iZXI7XG4gIGRldGFpbD86IHN0cmluZztcbiAgc3RhcnREYXRlPzogc3RyaW5nO1xuICBlbmREYXRlPzogc3RyaW5nO1xuICBzdGFydFZhbHVlPzogc3RyaW5nO1xuICB0YXJnZXRWYWx1ZT86IHN0cmluZztcbiAgY3VycmVudFZhbHVlPzogc3RyaW5nO1xuICAvKiogXHU2QkNGXHU2NUU1XHU5MUNGXHVGRjA4XHU1OTgyICczMCdcdTMwMDEnMidcdUZGMDlcdUZGMENcdTlBNzFcdTUyQThcdTRFQ0FcdTY1RTVcdTRFRkJcdTUyQTFcdTU4OUVcdTkxQ0ZcdUZGMUJcdTdBN0FcdTUyMTlcdTRFMERcdTc1MUZcdTYyMTBcdTRFQ0FcdTY1RTVcdTRFRkJcdTUyQTEgKi9cbiAgZGFpbHlNaW4/OiBzdHJpbmc7XG4gIHRhc2tEYXlUeXBlPzogVGFza0RheVR5cGUgfCBzdHJpbmc7XG4gIC8qKiBcdTg5QzRcdTUyMTJcdTY3NjVcdTZFOTBcdTY4MDdcdTZDRThcdUZGMDhcdTRFQzVcdTVCQTFcdTk2MDVcdTVDNTVcdTc5M0EvXHU2NUU1XHU2MkE1XHVGRjBDXHU1M0VGXHU5MDA5XHVGRjA5ICovXG4gIHNvdXJjZVJlZj86IHN0cmluZztcbn1cblxuLyoqIFx1NTM1NVx1NEUyQVx1NzZFRVx1NjgwNyAqL1xuZXhwb3J0IGludGVyZmFjZSBHb2FsSXRlbSB7XG4gIGlkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIC8qKiBBSSBcdTVCRjlcdTdCMTRcdThCQjBcdTc2ODRcdTVGNTJcdTdFQjNcdTUyMDZcdTY3OTBcdUZGMDgxLTIgXHU1M0U1XHU0RTNCXHU2NUU4ICsgXHU2MkM2XHU4OUUzXHU3NDA2XHU3NTMxL1x1NTE3M1x1OTUyRVx1OThDRVx1OTY2OVx1RkYwOVx1RkYwQ1x1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1RkYwQ1x1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1NEUzQVx1NUI1MFx1OTg3OSAqL1xuICBhbmFseXNpcz86IHN0cmluZztcbiAgaWNvbj86IHN0cmluZztcbiAgbWV0YT86IHN0cmluZztcbiAgLyoqIFx1OTg4Nlx1NTdERlx1RkYwOHdvcmsvcGVyc29uYWwvaGVhbHRoL3N0dWR5L2ZpbmFuY2Uvb3RoZXJcdUZGMDlcdUZGMEN3ZWJhcHAgXHU2MzZFXHU2QjY0XHU1MjA2XHU3RUM0XHU3NzQwXHU4MjcyICovXG4gIGNhdGVnb3J5PzogR29hbENhdGVnb3J5IHwgc3RyaW5nO1xuICBzdGFydERhdGU/OiBzdHJpbmc7XG4gIGVuZERhdGU/OiBzdHJpbmc7XG4gIHByb2dyZXNzPzogbnVtYmVyO1xuICBwcmlvcml0eT86IHN0cmluZyB8IG51bWJlcjtcbiAgLyoqIFx1NURGMlx1NUY1Mlx1Njg2M1x1RkYwOFx1NEUwRFx1NTNDMlx1NEUwRVx1OEZEQlx1ODg0Q1x1NEUyRFx1OEJDQVx1NjVBRFx1RkYwOSAqL1xuICBhcmNoaXZlZD86IGJvb2xlYW47XG4gIGFyY2hpdmVkQXQ/OiBzdHJpbmc7XG4gIGl0ZW1zPzogR29hbFN1Ykl0ZW1bXTtcbiAgLyoqIFx1ODlDNFx1NTIxMlx1Njc2NVx1NkU5MFx1RkYxQVx1Njc2NVx1NkU5MFx1N0IxNFx1OEJCMFx1NzY4NCB2YXVsdCBcdThERUZcdTVGODRcdUZGMENcdTc1MjhcdTRFOEVcdTY1RTVcdTYyQTVcdTY4MDdcdTZDRTggKi9cbiAgc291cmNlUmVmPzogc3RyaW5nO1xufVxuXG4vKiogXHU1MzU1XHU2NUU1XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFICovXG5leHBvcnQgaW50ZXJmYWNlIERheURhdGEge1xuICBkYXRlOiBzdHJpbmc7XG4gIHdlZWtkYXk/OiBzdHJpbmc7XG4gIG1ldHJpY3M/OiB7XG4gICAgZmlyc3RDaGVja0luPzogc3RyaW5nO1xuICAgIGxhc3RDaGVja0luPzogc3RyaW5nO1xuICAgIGNvbXBsZXRlZFRhc2tzPzogc3RyaW5nO1xuICAgIGluc3BpcmF0aW9uQ291bnQ/OiBzdHJpbmc7XG4gICAgYWN0aXZlVGltZT86IHN0cmluZztcbiAgICBlbXB0eVNsb3RzPzogc3RyaW5nO1xuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfTtcbiAgdGltZWxpbmU/OiBUaW1lbGluZVBlcmlvZFtdO1xuICBnb2Fscz86IEdvYWxJdGVtW107XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbi8qKiBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkVcdUZGMDhcdTg0M0Qgc2V0dGluZ3MuanNvblx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBBcHBTZXR0aW5ncyB7XG4gIHRoZW1lPzogJ2xpZ2h0JyB8ICdkYXJrJztcbiAgYmFsYW5jZT86IG51bWJlcjtcbiAgY29sb3JUaGVtZT86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuLyoqIFx1OEQyRFx1NEU3MFx1NTM4Nlx1NTNGMiAvIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMlx1RkYwOFx1N0VEM1x1Njc4NFx1NUJCRFx1Njc3RVx1RkYwQ1x1NEVDNVx1NTA1QVx1OTAwRlx1NEYyMFx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBIaXN0b3J5UmVjb3JkIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVyY2hhc2VIaXN0b3J5IHtcbiAgcmVjb3Jkcz86IEhpc3RvcnlSZWNvcmRbXTtcbiAgYXJjaGl2ZT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluY29tZUhpc3Rvcnkge1xuICByZWNvcmRzPzogSGlzdG9yeVJlY29yZFtdO1xuICBhcmNoaXZlPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbi8qKiBcdTVCRkNcdTUxRkEgLyBcdTVCRkNcdTUxNjVcdTc2ODRcdTVCOENcdTY1NzRcdTY1NzBcdTYzNkVcdTdFRDNcdTY3ODQgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwb3J0U2hhcGUge1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIGV4cG9ydGVkQXQ/OiBzdHJpbmc7XG4gIHN0b3JhZ2VUeXBlPzogc3RyaW5nO1xuICBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgZ29hbHM6IEdvYWxJdGVtW107XG4gIHNldHRpbmdzOiBBcHBTZXR0aW5ncztcbiAgcHVyY2hhc2VIaXN0b3J5OiBQdXJjaGFzZUhpc3RvcnkgfCBudWxsO1xuICBpbmNvbWVIaXN0b3J5OiBJbmNvbWVIaXN0b3J5IHwgbnVsbDtcbiAgdGhlbWVzPzogdW5rbm93bltdO1xuICByZXBvcnRzPzogdW5rbm93bltdO1xufVxuIiwgIi8qKlxuICogR29hbENhcmRWYWxpZGF0b3IgXHUyMDE0IEFJIFx1NEVBN1x1NTFGQVx1NzZFRVx1NjgwN1x1NzY4NFx1NjgyMVx1OUE4Q1x1NEUwRVx1NTE1Q1x1NUU5NVx1RkYwOFBoYXNlIDJcdUZGMDlcbiAqXG4gKiBcdTVCRjlcdTlGNTAgd2ViYXBwIEdvYWxTZXJ2aWNlIFx1NjcxRlx1NjcxQlx1NzY4NFx1NzZFRVx1NjgwNy9cdTVCNTBcdTk4NzlcdTdFRDNcdTY3ODRcdUZGMUFcbiAqICAtIFx1N0M3Qlx1NTc4Qlx1NUYzQVx1OEY2Q1x1MzAwMVx1N0YzQVx1NTkzMVx1NUI1N1x1NkJCNVx1ODg2NVx1OUVEOFx1OEJBNFx1MzAwMWNhdGVnb3J5IFx1Njc5QVx1NEUzRVx1OTc1RVx1NkNENVx1NTZERVx1ODQzRCAnb3RoZXInXHVGRjFCXG4gKiAgLSBcdTRFMjJcdTY3MkFcdTc3RTVcdTVCNTdcdTZCQjVcdUZGMDhcdTkwN0ZcdTUxNEQgQUkgXHU0RTcxXHU1ODVFXHU1QjU3XHU2QkI1XHU2QzYxXHU2N0QzIGdvYWxzLmpzb25cdUZGMDlcdUZGMUJcbiAqICAtIGNsYXNzaWZ5Q29tcGxldGVuZXNzIFx1NTIyNFx1NUI5QSBjb21wbGV0ZSAvIHRoaW5cdUZGMENcdTVFNzZcdTUyMTdcdTUxRkFcdTdGM0FcdTU5MzFcdTdFRjRcdTVFQTZcdUZGMENcdTRGOUJcdTVCQTFcdTk2MDVcdTVGMzlcdTdBOTdcdTYyNTMgXHUyNkEwXHUzMDAyXG4gKlxuICogXHU3RUFGXHU1MUZEXHU2NTcwXHUzMDAxXHU5NkY2IE9ic2lkaWFuIFx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1MzAwMlxuICovXG5cbmltcG9ydCB7XG4gIEdPQUxfQ0FURUdPUklFUyxcbiAgdHlwZSBHb2FsQ2F0ZWdvcnksXG4gIHR5cGUgR29hbEl0ZW0sXG4gIHR5cGUgR29hbFN1Ykl0ZW0sXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9UQVNLX0RBWV9UWVBFID0gJ2RhaWx5JztcblxuY29uc3QgQ0FURUdPUllfU0VUID0gbmV3IFNldDxzdHJpbmc+KEdPQUxfQ0FURUdPUklFUy5tYXAoKGMpID0+IGMuaWQpKTtcblxuLyoqXG4gKiBcdTRFQ0VcdTVCNTBcdTk4NzlcdTU0MERcdTRFMkRcdTYzRDBcdTUzRDZcdTUzNTVcdTRGNERcdUZGMDhcdTU5ODJcIlx1NkJDRlx1NTkyOVx1OTk2RVx1OThERlx1NzBFRFx1OTFDRlx1NEUwQVx1OTY1MChcdTUzNDNcdTUzNjEpXCJcdTIxOTJcIlx1NTM0M1x1NTM2MVwiXHVGRjBDXCJcdTZCQ0ZcdTU5MjlcdTk2MDVcdThCRkJcdTk4NzVcdTY1NzBcIlx1MjE5MlwiXHU5ODc1XCJcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEVcdTY1NzBcdTVCNTdcdTY4NDZcdTU0MEVcdTdGMDBcdTVDNTVcdTc5M0FcdTMwMDJcbiAqIFx1ODhBQiBQbGFuQ29uZmlybU1vZGFsIC8gQWdlbnRpY1BsYW5Nb2RhbCBcdTU5MERcdTc1MjhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RVbml0KG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFx1NjJFQ1x1NTNGN1x1NEUyRFx1NzY4NFx1NTM1NVx1NEY0RFx1RkYxQVwiKFx1NTM0M1x1NTM2MSlcIiAvIFwiXHVGRjA4XHU1QzBGXHU2NUY2XHVGRjA5XCJcbiAgY29uc3QgYnJhY2tldCA9IG5hbWUubWF0Y2goL1tcdUZGMDgoXShbXHU0RTAwLVx1OUZBNV0rKVspXHVGRjA5XS8pO1xuICBpZiAoYnJhY2tldCkgcmV0dXJuIGJyYWNrZXRbMV07XG4gIC8vIFx1OTAwMFx1NTMxNlx1NTMzOVx1OTE0RFx1RkYxQVx1NEVFNVwiXHU2NTcwXCJcdTdFRDNcdTVDM0VcdUZGMDhcdTU5ODJcIlx1OTYwNVx1OEJGQlx1OTg3NVx1NjU3MFwiXHUyMTkyXCJcdTk4NzVcIlx1RkYwOVxuICBjb25zdCBzdWZmaXggPSBuYW1lLm1hdGNoKC9cdTZCQ0ZbXHU0RTAwXHU1OTI5XHU2NUU1XHU1NDY4XHU2NzA4XT8oLis/KVx1NjU3MC8pO1xuICBpZiAoc3VmZml4KSByZXR1cm4gc3VmZml4WzFdO1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIHN0cih2OiB1bmtub3duLCBmYWxsYmFjayA9ICcnKTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYgOiBmYWxsYmFjaztcbn1cblxuZnVuY3Rpb24gbnVtKHY6IHVua25vd24sIGZhbGxiYWNrID0gMCk6IG51bWJlciB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ251bWJlcicgJiYgIU51bWJlci5pc05hTih2KSA/IHYgOiBmYWxsYmFjaztcbn1cblxuLyoqXG4gKiBcdTZFMDVcdTZEMTdcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdTRFM0FcdTdFQUZcdTY1NzBcdTVCNTdcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDhcdTkxQ0ZcdTUzMTZcdTY4MzhcdTVGQzNcdUZGMDlcdTMwMDJcbiAqICAtIFwiMzBcIiAvIFwiMi41XCIgXHUyMTkyIFx1NTM5Rlx1NjgzN1xuICogIC0gXCIzMFx1NTIwNlx1OTQ5RlwiIC8gXCI3XHU1QzBGXHU2NUY2XCIgLyBcIjIwMFx1NTM0M1x1NTM2MVwiIFx1MjE5MiBcdTUzRDZcdTUyNERcdTdGMDBcdTY1NzBcdTVCNTcgXCIzMFwiIC8gXCI3XCIgLyBcIjIwMFwiXG4gKiAgLSBcIlx1N0VBNjMwXHU5ODc1XCIgXHUyMTkyIFx1NTI2NVx1NzlCQlx1OTc1RVx1NjU3MFx1NUI1NyBcdTIxOTIgXCIzMFwiXG4gKiAgLSBcIlx1NkJDRlx1NTkyOVx1NTc1QVx1NjMwMVwiIC8gXCJcIiBcdTIxOTIgXCJcIlx1RkYwOFx1NjVFMFx1NkNENVx1OTFDRlx1NTMxNlx1RkYwOVxuICogXHU3NkVFXHU3Njg0XHVGRjFBXHU3ODZFXHU0RkREXHU0RTBCXHU2RTM4IHBhcnNlSW50IFx1NEUwRFx1NEVBN1x1NzUxRiBOYU5cdUZGMENcdTRFQ0FcdTY1RTVcdTRFRkJcdTUyQTFcdTgwRkRcdTZCNjNcdTVFMzhcdTc1MUZcdTYyMTBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuRGFpbHlNaW4ocmF3OiB1bmtub3duKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiByYXcgIT09ICdzdHJpbmcnKSByZXR1cm4gJyc7XG4gIGNvbnN0IHRyaW1tZWQgPSByYXcudHJpbSgpO1xuICBpZiAoIXRyaW1tZWQpIHJldHVybiAnJztcbiAgaWYgKC9eXFxkKyhcXC5cXGQrKT8kLy50ZXN0KHRyaW1tZWQpKSByZXR1cm4gdHJpbW1lZDtcbiAgY29uc3QgcHJlZml4ID0gdHJpbW1lZC5tYXRjaCgvXihcXGQrKD86XFwuXFxkKyk/KS8pO1xuICBpZiAocHJlZml4KSByZXR1cm4gcHJlZml4WzFdO1xuICBjb25zdCBzdHJpcHBlZCA9IHRyaW1tZWQucmVwbGFjZSgvW14wLTkuXS9nLCAnJyk7XG4gIC8vIFx1NTI2NVx1NzlCQlx1NTQwRVx1NTNFRlx1ODBGRFx1NkI4Qlx1NzU1OVx1NTkxQVx1NEY1OVx1NUMwRlx1NjU3MFx1NzBCOVx1RkYwOFx1NTk4MiBcIjMuNS4yXCJcdUZGMDlcdUZGMENcdTRFQzVcdTUzRDZcdTk5OTZcdTRFMkFcdTU0MDhcdTZDRDVcdTY1NzBcdTVCNTdcbiAgY29uc3QgdmFsaWQgPSBzdHJpcHBlZC5tYXRjaCgvXFxkKyhcXC5cXGQrKT8vKTtcbiAgcmV0dXJuIHZhbGlkID8gdmFsaWRbMF0gOiAnJztcbn1cblxuLyoqIFx1NTIyNFx1NjVBRFx1NkJDRlx1NjVFNVx1OTFDRlx1NjYyRlx1NTQyNlx1NURGMlx1OTFDRlx1NTMxNlx1RkYwOFx1N0VBRlx1NjU3MFx1NUI1N1x1RkYwQ1x1OTc1RVx1N0E3QVx1RkYwOSAqL1xuZnVuY3Rpb24gaXNRdWFudGlmaWVkKHY6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiB2ID09PSAnc3RyaW5nJyAmJiAvXlxcZCsoXFwuXFxkKyk/JC8udGVzdCh2LnRyaW0oKSk7XG59XG5cbi8qKiBcdTY4MjFcdTlBOENcdTVFNzZcdTg4NjVcdTlGNTBcdTUzNTVcdTRFMkFcdTVCNTBcdTk4NzkgKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVN1Ykl0ZW0ocmF3OiB1bmtub3duLCBpZHg6IG51bWJlcik6IEdvYWxTdWJJdGVtIHtcbiAgY29uc3QgaXQgPSAocmF3ICYmIHR5cGVvZiByYXcgPT09ICdvYmplY3QnID8gcmF3IDoge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICByZXR1cm4ge1xuICAgIG5hbWU6IHN0cihpdC5uYW1lKSB8fCBgXHU1QjUwXHU5ODc5JHtpZHggKyAxfWAsXG4gICAgcGVyY2VudDogdHlwZW9mIGl0LnBlcmNlbnQgPT09ICdudW1iZXInID8gaXQucGVyY2VudCA6IHVuZGVmaW5lZCxcbiAgICBkZXRhaWw6IHN0cihpdC5kZXRhaWwpIHx8IHVuZGVmaW5lZCxcbiAgICBzdGFydERhdGU6IHN0cihpdC5zdGFydERhdGUpLFxuICAgIGVuZERhdGU6IHN0cihpdC5lbmREYXRlKSxcbiAgICBzdGFydFZhbHVlOiBzdHIoaXQuc3RhcnRWYWx1ZSksXG4gICAgdGFyZ2V0VmFsdWU6IHN0cihpdC50YXJnZXRWYWx1ZSksXG4gICAgY3VycmVudFZhbHVlOiBzdHIoaXQuY3VycmVudFZhbHVlKSxcbiAgICBkYWlseU1pbjogY2xlYW5EYWlseU1pbihpdC5kYWlseU1pbiksXG4gICAgdGFza0RheVR5cGU6IHN0cihpdC50YXNrRGF5VHlwZSkgfHwgREVGQVVMVF9UQVNLX0RBWV9UWVBFLFxuICAgIHNvdXJjZVJlZjogc3RyKGl0LnNvdXJjZVJlZikgfHwgdW5kZWZpbmVkLFxuICB9O1xufVxuXG4vKiogXHU2ODIxXHU5QThDXHU1RTc2XHU4ODY1XHU5RjUwXHU1MzU1XHU0RTJBXHU3NkVFXHU2ODA3XHVGRjA4XHU0RTIyXHU2NzJBXHU3N0U1XHU1QjU3XHU2QkI1XHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVHb2FsKHJhdzogdW5rbm93bik6IEdvYWxJdGVtIHtcbiAgY29uc3QgZyA9IChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcgPyByYXcgOiB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IGNhdGVnb3J5UmF3ID0gc3RyKGcuY2F0ZWdvcnkpO1xuICBjb25zdCBjYXRlZ29yeTogR29hbENhdGVnb3J5IHwgc3RyaW5nID0gQ0FURUdPUllfU0VULmhhcyhjYXRlZ29yeVJhdykgPyBjYXRlZ29yeVJhdyA6ICdvdGhlcic7XG5cbiAgY29uc3QgaXRlbXNSYXcgPSBBcnJheS5pc0FycmF5KGcuaXRlbXMpID8gZy5pdGVtcyA6IFtdO1xuICBjb25zdCBpdGVtcyA9IGl0ZW1zUmF3Lm1hcCgoaXQsIGkpID0+IHNhbml0aXplU3ViSXRlbShpdCwgaSkpO1xuXG4gIHJldHVybiB7XG4gICAgaWQ6IHN0cihnLmlkKSB8fCBgZ29hbF8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWAsXG4gICAgdGl0bGU6IHN0cihnLnRpdGxlKSB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU3NkVFXHU2ODA3JyxcbiAgICAvLyBBSSBcdTVGNTJcdTdFQjNcdTUyMDZcdTY3OTBcdUZGMDhcdTRFQzVcdTVDNTVcdTc5M0FcdTc1MjhcdUZGMDlcdUZGMUFcdTRGRERcdTc1NTlcdTc1MjhcdTYyMzdcdThGOTNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNERcdTg4QUJcIlx1NEUyMlx1NjcyQVx1NzdFNVx1NUI1N1x1NkJCNVwiXHU5NzU5XHU5RUQ4XHU0RTIyXHU1RjAzXG4gICAgYW5hbHlzaXM6IHN0cihnLmFuYWx5c2lzKSB8fCB1bmRlZmluZWQsXG4gICAgLy8gXHU0RTI1XHU2ODNDXHU3OTgxXHU2QjYyIEFJIFx1NTE5OVx1NTE2NSBpY29uIFx1NUI1N1x1NkJCNVx1RkYwOGljb24gXHU0RUM1XHU0RjlCXHU2MjRCXHU1MkE4XHU1MjFCXHU1RUZBXHU3Njg0XHU3NkVFXHU2ODA3XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgbWV0YTogc3RyKGcubWV0YSkgfHwgdW5kZWZpbmVkLFxuICAgIGNhdGVnb3J5LFxuICAgIHN0YXJ0RGF0ZTogc3RyKGcuc3RhcnREYXRlKSxcbiAgICBlbmREYXRlOiBzdHIoZy5lbmREYXRlKSxcbiAgICBwcm9ncmVzczogbnVtKGcucHJvZ3Jlc3MsIDApLFxuICAgIHByaW9yaXR5OiB0eXBlb2YgZy5wcmlvcml0eSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGcucHJpb3JpdHkgPT09ICdudW1iZXInID8gZy5wcmlvcml0eSA6IHVuZGVmaW5lZCxcbiAgICBpdGVtcyxcbiAgICBzb3VyY2VSZWY6IHN0cihnLnNvdXJjZVJlZikgfHwgdW5kZWZpbmVkLFxuICB9O1xufVxuXG4vKiogXHU2NTcwXHU3RUM0XHU1Qjg4XHU1MzZCICsgXHU5MDEwXHU2NzYxIHNhbml0aXplICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVHb2FscyhyYXc6IHVua25vd24pOiBHb2FsSXRlbVtdIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiBbXTtcbiAgcmV0dXJuIHJhdy5tYXAoKGcpID0+IHNhbml0aXplR29hbChnKSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGxldGVuZXNzUmVzdWx0IHtcbiAgbGV2ZWw6ICdjb21wbGV0ZScgfCAndGhpbic7XG4gIC8qKiBcdTdGM0FcdTU5MzFcdTdFRjRcdTVFQTZcdTc2ODRcdTRFQkFcdTdDN0JcdTUzRUZcdThCRkJcdTY4MDdcdTdCN0VcdUZGMUEnXHU2QkNGXHU2NUU1XHU5MUNGJyAvICdcdTYyMkFcdTZCNjJcdTY1RTUnIC8gJ1x1NTIwNlx1N0M3QicgLyAnXHU4MjgyXHU1OTRGJyAqL1xuICBtaXNzaW5nOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTVCOUFcdTc2RUVcdTY4MDdcdTRGRTFcdTYwNkZcdTVCOENcdTY1NzRcdTVFQTZcdTMwMDJcbiAqXG4gKiBcdTRFQTdcdTU0QzFcdTU0RjJcdTVCNjZcdUZGMUFcdTc2RUVcdTY4MDdcdTVGQzVcdTk4N0JcdTMwMENcdTkxQ0ZcdTUzMTZcdTMwMERcdUZGMENcdTk4OTdcdTdDOTJcdTVFQTZcdTRFM0FcdTMwMENcdTY1RTVcdTMwMERcdTMwMDJcdTU2RTBcdTZCNjRcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdTc2ODRcdTUyMjRcdTYzNkVcdTY2MkZcbiAqICoqXHU2MjQwXHU2NzA5XHU1QjUwXHU5ODc5XHU5MEZEXHU1RkM1XHU5ODdCXHU2NzA5XHU3RUFGXHU2NTcwXHU1QjU3IGRhaWx5TWluKipcdUZGMDhcdTgwMENcdTk3NUVcIlx1ODFGM1x1NUMxMVx1NEUwMFx1NEUyQVwiXHVGRjA5XHVGRjBDXHU1NDI2XHU1MjE5XHU4QkU1XHU1QjUwXHU5ODc5XG4gKiBcdTY1RTBcdTZDRDVcdTc1MUZcdTYyMTBcdTRFQ0FcdTY1RTVcdTRFRkJcdTUyQTFcdUZGMENcdTg5QzRcdTUyMTJcdTUzNzNcdTU5MzFcdTUzQkJcdTY4MzhcdTVGQzNcdTRFRjdcdTUwM0NcdTMwMDJcbiAqXG4gKiBcdTdGM0FcdTU5MzFcdTdFRjRcdTVFQTZcdUZGMUFcbiAqICAtIFx1NkJDRlx1NjVFNVx1OTFDRlx1RkYxQVx1NUI1OFx1NTcyOFx1NjcyQVx1OTFDRlx1NTMxNlx1RkYwOFx1OTc1RVx1N0VBRlx1NjU3MFx1NUI1N1x1RkYwOVx1NUI1MFx1OTg3OSBcdTIxOTIgYFx1NkJDRlx1NjVFNVx1OTFDRlx1RkYwOE4gXHU0RTJBXHU1QjUwXHU5ODc5XHU2NzJBXHU5MUNGXHU1MzE2XHVGRjA5YFxuICogIC0gXHU2MjJBXHU2QjYyXHU2NUU1XHVGRjFBZW5kRGF0ZSBcdTdBN0FcbiAqICAtIFx1NTIwNlx1N0M3Qlx1RkYxQWNhdGVnb3J5IFx1N0E3QVxuICogIC0gXHU4MjgyXHU1OTRGXHVGRjFBXHU1QjU4XHU1NzI4IHRhc2tEYXlUeXBlIFx1N0E3QVx1NzY4NFx1NUI1MFx1OTg3OVxuICogXHU0RUZCXHU0RTAwXHU3RjNBXHU1OTMxXHU1MzczIHRoaW5cdUZGMDhcdTk3MDBcdTU3MjhcdTVCQTFcdTk2MDVcdTVGMzlcdTdBOTdcdTg4NjVcdTUxNjhcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5Q29tcGxldGVuZXNzKGdvYWw6IEdvYWxJdGVtKTogQ29tcGxldGVuZXNzUmVzdWx0IHtcbiAgY29uc3QgbWlzc2luZzogc3RyaW5nW10gPSBbXTtcblxuICBpZiAoIWdvYWwuY2F0ZWdvcnkpIG1pc3NpbmcucHVzaCgnXHU1MjA2XHU3QzdCJyk7XG5cbiAgaWYgKCFnb2FsLmVuZERhdGUgfHwgZ29hbC5lbmREYXRlLnRyaW0oKSA9PT0gJycpIG1pc3NpbmcucHVzaCgnXHU2MjJBXHU2QjYyXHU2NUU1Jyk7XG5cbiAgY29uc3QgaXRlbXMgPSBnb2FsLml0ZW1zID8/IFtdO1xuICBpZiAoaXRlbXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHVucXVhbnRpZmllZCA9IGl0ZW1zLmZpbHRlcigoaXQpID0+ICFpc1F1YW50aWZpZWQoaXQuZGFpbHlNaW4pKS5sZW5ndGg7XG4gICAgaWYgKHVucXVhbnRpZmllZCA+IDApIG1pc3NpbmcucHVzaChgXHU2QkNGXHU2NUU1XHU5MUNGXHVGRjA4JHt1bnF1YW50aWZpZWR9IFx1NEUyQVx1NUI1MFx1OTg3OVx1NjcyQVx1OTFDRlx1NTMxNlx1RkYwOWApO1xuXG4gICAgY29uc3QgaGFzUmh5dGhtID0gaXRlbXMuZXZlcnkoKGl0KSA9PiBpdC50YXNrRGF5VHlwZSAmJiBTdHJpbmcoaXQudGFza0RheVR5cGUpLnRyaW0oKSAhPT0gJycpO1xuICAgIGlmICghaGFzUmh5dGhtKSBtaXNzaW5nLnB1c2goJ1x1ODI4Mlx1NTk0RicpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsZXZlbDogbWlzc2luZy5sZW5ndGggPiAwID8gJ3RoaW4nIDogJ2NvbXBsZXRlJyxcbiAgICBtaXNzaW5nLFxuICB9O1xufVxuIiwgIi8qKlxuICogXHU3ODZFXHU1QjlBXHU2MDI3XHU3NkVFXHU2ODA3IElEIFx1NkQzRVx1NzUxRlx1RkYwOFx1N0VBRlx1NTFGRFx1NjU3MFx1MzAwMVx1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1RkYwOVx1MzAwMlxuICpcbiAqIFx1NzUyOFx1N0EzM1x1NUI5QVx1NTRDOFx1NUUwQ1x1RkYwOEZOVi0xYSAzMiBcdTRGNERcdUZGMDlcdTRFQ0Ugc2VlZCBcdTc1MUZcdTYyMTAgaWRcdTMwMDJcbiAqIFx1NzZFRVx1NzY4NFx1RkYxQVx1NTQwQ1x1NEUwMFx1N0IxNFx1OEJCMCArIFx1NTQwQ1x1NEUwMFx1NjgwN1x1OTg5OFx1OTFDRFx1NjVCMFx1ODlDNFx1NTIxMlx1NjVGNlx1RkYwQ0lEIFx1N0EzM1x1NUI5QVx1NEUwRFx1NTNEOFx1RkYxQndyaXRlQWlHb2FscyBcdTYzMDkgaWQgXHU1NDA4XHU1RTc2XHU1MzczXHUyMDFDXHU1MzlGXHU1NzMwXHU2NkY0XHU2NUIwXHUyMDFEXG4gKiBcdTgwMENcdTk3NUVcdTIwMUNcdThGRkRcdTUyQTBcdTkxQ0RcdTU5MERcdTIwMURcdUZGMENcdTY4MzlcdTZDQkJcdTMwMENcdTkxQ0RcdTU5MERcdTg5QzRcdTUyMTIgXHUyMTkyIFx1NzZFRVx1NjgwN1x1OEQ4QVx1NzlFRlx1OEQ4QVx1NTkxQVx1MzAwRFx1MzAwMlxuICovXG5cbi8qKiBGTlYtMWEgMzIgXHU0RjREXHU1NEM4XHU1RTBDXHVGRjBDXHU4RkQ0XHU1NkRFXHU2NUUwXHU3QjI2XHU1M0Y3IDE2IFx1OEZEQlx1NTIzNlx1NzdFRFx1NEUzMiAqL1xuZnVuY3Rpb24gZm52MWEoc2VlZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlZWQubGVuZ3RoOyBpKyspIHtcbiAgICBoIF49IHNlZWQuY2hhckNvZGVBdChpKTtcbiAgICBoID0gTWF0aC5pbXVsKGgsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiAoaCA+Pj4gMCkudG9TdHJpbmcoMzYpO1xufVxuXG4vKipcbiAqIFx1NEVDRSBzZWVkXHVGRjA4XHU1RUZBXHU4QkFFIGBmaWxlLnBhdGggKyAnfCcgKyB0aXRsZWBcdUZGMDlcdTZEM0VcdTc1MUZcdTdBMzNcdTVCOUFcdTc2ODRcdTc2RUVcdTY4MDcgaWRcdTMwMDJcbiAqIFx1NzZGOFx1NTQwQyBzZWVkIFx1NUZDNVx1NUY5N1x1NzZGOFx1NTQwQyBpZFx1RkYxQlx1NEUwRFx1NTQwQyBzZWVkIFx1Njc4MVx1NUMwRlx1Njk4Mlx1NzM4N1x1NzhCMFx1NjQ5RVx1RkYwODMyIFx1NEY0RFx1NTRDOFx1NUUwQ1x1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlU3RhYmxlR29hbElkKHNlZWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgZ29hbF8ke2ZudjFhKHNlZWQpfWA7XG59XG4iLCAiLyoqXG4gKiBBSSBcdTg5QzRcdTUyMTJcdTVFNDJcdTdCNDlcdTUyMjRcdTVCOUFcdUZGMDhcdTdFQUZcdTUxRkRcdTY1NzBcdTMwMDFcdTk2RjZcdTRGOURcdThENTZcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTU0MENcdTRFMDBcdTdCMTRcdThCQjAgKyBcdTc2RjhcdTU0MENcdTUxODVcdTVCQjlcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdUZGMENcdTRFMTRcdTRFQzVcdTVGNTNcdTkwQTNcdTRFOUJcdTc2RUVcdTY4MDdcdTMwMENcdTRFQ0RcdTUxNjhcdTkwRThcdTVCNThcdTU3MjhcdTRFOEVcdTc2RUVcdTY4MDdcdTVFOTNcdTMwMERcdTY1RjZcdTYyNERcdTUzRUZcdThERjNcdThGQzdcdUZGMUJcbiAqIFx1NTNFQVx1ODk4MVx1NjcwOVx1NEUwMFx1NEUyQVx1NzZFRVx1NjgwN1x1NURGMlx1NEUyMlx1NTkzMVx1RkYwOFx1ODhBQlx1NkUwNS9cdTg4QUJcdTUyMjBcdUZGMDlcdUZGMENcdTVDMzFcdTUxNDFcdThCQjhcdTkxQ0RcdTY1QjBcdTUxOTlcdTUxNjVcdTRFRTVcdTYwNjJcdTU5MERcdTIwMTRcdTIwMTRcbiAqIFx1NTQyNlx1NTIxOVx1MjAxQ1x1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1MjAxRFx1NEYxQVx1NkMzOFx1NEU0NVx1OTYzQlx1NTg1RVx1NjA2Mlx1NTkwRFx1RkYwQ1x1ODg2OFx1NzNCMFx1NEUzQVx1MzAwQ1x1NTE5OVx1NTE2NVx1NEU4Nlx1NEY0Nlx1NEUwRFx1NjYzRVx1NzkzQS9cdTRFMjJcdTU5MzFcdTMwMERcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFNraXBQbGFubmVkKFxuICBwbGFubmVkSWRzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcbiAgZXhpc3RpbmdJZHM6IFNldDxzdHJpbmc+XG4pOiBib29sZWFuIHtcbiAgaWYgKCFwbGFubmVkSWRzIHx8IHBsYW5uZWRJZHMubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBwbGFubmVkSWRzLmV2ZXJ5KChpZCkgPT4gZXhpc3RpbmdJZHMuaGFzKGlkKSk7XG59XG4iLCAiLyoqXG4gKiBBZ2VudGljUGxhbk1vZGFsIFx1MjAxNCBcdTVCRjlcdThCRERcdTVGMEZcdTg5QzRcdTUyMTJcdTVCQTFcdTk2MDVcdTUzRjBcdUZGMDhQaGFzZSA0XHVGRjA5XG4gKlxuICogXHU1NzI4IFBoYXNlMyBQbGFuQ29uZmlybU1vZGFsIFx1NzY4NFx1NjgxMVx1NzJCNlx1NUJBMVx1OTYwNVx1NTdGQVx1Nzg0MFx1NEUwQVx1RkYwQ1x1NTNGM1x1NEZBN1x1NTJBMFx1NEUwMFx1NEUyQVx1NUJGOVx1OEJERFx1NTMzQVx1RkYxQVxuICogIC0gXHU1REU2XHVGRjFBXHU1M0VGXHU3RjE2XHU4RjkxXHU3NkVFXHU2ODA3XHU2ODExXHVGRjA4XHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjA5XHVGRjBDQUkgXHU2QkNGXHU4RjZFXHU4RkQ0XHU1NkRFXHU1MTY4XHU5MUNGIGdvYWxzIFx1NTQwRVx1NUI5RVx1NjVGNlx1NTIzN1x1NjVCMCArIGRpZmYgXHU5QUQ4XHU0RUFFXHVGRjFCXG4gKiAgLSBcdTUzRjNcdUZGMUFcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTVCRjlcdThCRERcdUZGMENcdTc1MjhcdTYyMzdcdThCRjRcIlx1NTNCQlx1NjM4OVggLyBcdTUyQTBZIC8gXHU2MjhBWlx1NjUzOVx1NjIxMFx1NEUwMFx1NEUwOVx1NEU5NFwiXHVGRjBDQUkgXHU2MjUzXHU3OEU4XHU4OUM0XHU1MjEyXHVGRjFCXG4gKiAgLSBcdTYyNEJcdTUyQThcdTdGMTZcdThGOTFcdTc2RjRcdTYzQTVcdTRGNUNcdTc1MjhcdTUyMzBcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMENcdTVFNzZcdTkwMUFcdThGQzcgc2Vzc2lvbi5hcHBseUxvY2FsRWRpdCBcdTUxOTlcdTUxNjVcdTVCRjlcdThCRERcdTUzODZcdTUzRjJcdUZGMENcbiAqICAgIFx1OTYzMlx1NkI2MiBBSSBcdTRFMEJcdThGNkVcdTYyOEFcdTc1MjhcdTYyMzdcdTYyNEJcdTUyQThcdTY1MzlcdTUyQThcdTg5ODZcdTc2RDZcdTU2REVcdTUzQkJcdUZGMUJcbiAqICAtIFx1OTg3Nlx1OTBFOFx1MzAwQ1x1OTFDRFx1N0Y2RVx1NTIxRFx1NzI0OFx1MzAwRFx1NTZERVx1NTIzMCBBSSBcdTk5OTZcdTcyNDhcdUZGMUJcdTVFOTVcdTkwRThcdTMwMENcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTMwMERcdTc4NkVcdThCQTRcdTg0M0RcdTVFOTNcdTMwMDJcbiAqXG4gKiBcdTYzMDFcdTY3MDkgUGxhbm5pbmdTZXNzaW9uXHVGRjA4XHU3RUFGXHU5MDNCXHU4RjkxXHUzMDAxXHU5NkY2IE9ic2lkaWFuIFx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1ODFFQVx1OEVBQlx1NTNFQVx1OEQxRlx1OEQyMyBVSSBcdTdGMTZcdTYzOTJcdTMwMDJcbiAqL1xuXG5pbXBvcnQgeyBNb2RhbCwgQXBwLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICBHT0FMX0NBVEVHT1JJRVMsXG4gIHR5cGUgR29hbEl0ZW0sXG4gIHR5cGUgR29hbFN1Ykl0ZW0sXG4gIHR5cGUgR29hbENhdGVnb3J5LFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcbmltcG9ydCB7IGNsYXNzaWZ5Q29tcGxldGVuZXNzLCBleHRyYWN0VW5pdCB9IGZyb20gJy4vR29hbENhcmRWYWxpZGF0b3InO1xuaW1wb3J0IHsgUGxhbm5pbmdTZXNzaW9uIH0gZnJvbSAnLi9QbGFubmluZ1Nlc3Npb24nO1xuaW1wb3J0IHR5cGUgeyBQbGFubmVyU2V0dGluZ3MgfSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5cbmludGVyZmFjZSBJdGVtRW50cnkge1xuICBpdGVtOiBHb2FsU3ViSXRlbTtcbiAga2VlcDogYm9vbGVhbjtcbn1cbmludGVyZmFjZSBHb2FsRW50cnkge1xuICBnb2FsOiBHb2FsSXRlbTtcbiAgaXRlbXM6IEl0ZW1FbnRyeVtdO1xuICBrZWVwOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50aWNQbGFuT3B0aW9ucyB7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgc2NvcGU6ICdub3RlJyB8ICdzZWxlY3Rpb24nO1xuICBzZXR0aW5nczogUGxhbm5lclNldHRpbmdzO1xuICBzdWJ0aXRsZT86IHN0cmluZztcbiAgb25Db25maXJtOiAoZ29hbHM6IEdvYWxJdGVtW10pID0+IHZvaWQ7XG4gIC8qKiBcdTYzRDBcdTRGOUJcdTY1RjZcdUZGMUFcdTRFRTVcdTMwMENcdTdGMTZcdThGOTFcdTczQjBcdTY3MDlcdTY4MTFcdTMwMERcdTZBMjFcdTVGMEZcdTYyNTNcdTVGMDBcdUZGMDhcdThENzAgc2Vzc2lvbi5sb2FkR29hbHMgXHU4MDBDXHU5NzVFIGluaXRcdUZGMDkgKi9cbiAgZ29hbHM/OiBHb2FsSXRlbVtdO1xuICAvKiogXHU4RjdEXHU1MTY1XHU1NDBFXHU4MUVBXHU1MkE4XHU0RjVDXHU0RTNBXHU2MzA3XHU0RUU0XHU1M0QxXHU5MDAxXHU3RUQ5IEFJXHVGRjA4XHU3NTI4XHU0RThFXHUzMDBDXHU1RTk0XHU3NTI4XHU4QkNBXHU2NUFEXHU1RUZBXHU4QkFFXHUzMDBEXHU5ODg0XHU1ODZCXHVGRjA5ICovXG4gIGluaXRpYWxJbnN0cnVjdGlvbj86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEFnZW50aWNQbGFuTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgc2Vzc2lvbjogUGxhbm5pbmdTZXNzaW9uO1xuICBwcml2YXRlIGVudHJpZXM6IEdvYWxFbnRyeVtdID0gW107XG4gIHByaXZhdGUgc3VidGl0bGU/OiBzdHJpbmc7XG4gIHByaXZhdGUgb25Db25maXJtOiAoZ29hbHM6IEdvYWxJdGVtW10pID0+IHZvaWQ7XG4gIHByaXZhdGUgb3B0czogQWdlbnRpY1BsYW5PcHRpb25zO1xuXG4gIHByaXZhdGUgbGlzdEVsPzogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgY2hhdExvZ0VsPzogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgaW5wdXRFbD86IEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG4gIHByaXZhdGUgc2VuZEJ0bj86IEhUTUxCdXR0b25FbGVtZW50O1xuICBwcml2YXRlIGZvb3RlckNvdW50PzogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgY2hhdExvZzogQXJyYXk8eyByb2xlOiAndXNlcicgfCAnYXNzaXN0YW50JzsgdGV4dDogc3RyaW5nIH0+ID0gW107XG4gIHByaXZhdGUgcHJldkdvYWxUaXRsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSBwcmV2SXRlbUtleXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgb3B0czogQWdlbnRpY1BsYW5PcHRpb25zKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLnN1YnRpdGxlID0gb3B0cy5zdWJ0aXRsZTtcbiAgICB0aGlzLm9uQ29uZmlybSA9IG9wdHMub25Db25maXJtO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy5zZXNzaW9uID0gbmV3IFBsYW5uaW5nU2Vzc2lvbihvcHRzLmNvbnRlbnQsIG9wdHMuc2V0dGluZ3MsIHVuZGVmaW5lZCwgb3B0cy5zY29wZSk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmVtcHR5KCk7XG4gICAgY29udGVudEVsLmFkZENsYXNzKCdiYW1ib28tYWktcGxhbi1tb2RhbCcsICdiYW1ib28tYWktYWdlbnRpYycpO1xuXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0FJIFx1ODlDNFx1NTIxMlx1NTJBOVx1NjI0QiBcdTAwQjcgXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHU1QkExXHU5NjA1JyB9KTtcblxuICAgIC8vIFx1OTg3Nlx1OTBFOFx1NjRDRFx1NEY1Q1x1RkYxQVx1OTFDRFx1N0Y2RVx1NTIxRFx1NzI0OFxuICAgIGNvbnN0IHRvcEJhciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktYWdlbnRpYy10b3BiYXInIH0pO1xuICAgIGlmICh0aGlzLnN1YnRpdGxlKSB7XG4gICAgICB0b3BCYXIuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IHRoaXMuc3VidGl0bGUsIGNsczogJ2JhbWJvby1haS1wbGFuLXN1YnRpdGxlJyB9KTtcbiAgICB9XG4gICAgY29uc3QgcmVzZXRCdG4gPSB0b3BCYXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICdcdTIxQkEgXHU5MUNEXHU3RjZFXHU1MjFEXHU3MjQ4JyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWJ0biBiYW1ib28tYWktcGxhbi1idG4tZ2hvc3QnLFxuICAgIH0pO1xuICAgIHJlc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vblJlc2V0KCkpO1xuXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1x1NURFNlx1NEZBN1x1NjgzOFx1NUJGOS9cdTdGMTZcdThGOTFcdTc2RUVcdTY4MDdcdUZGMENcdTUzRjNcdTRGQTdcdTc1MjhcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdThCQTkgQUkgXHU1ODlFXHU1MjIwXHU2NTM5XHVGRjA4XHU1OTgyXCJcdTUzQkJcdTYzODlcdThERDFcdTZCNjVcIlwiXHU1MkEwXHU2QkNGXHU1NDY4XHU2RTM4XHU2Q0YzM1x1NkIyMVwiXHVGRjA5XHUzMDAyXHU3ODZFXHU4QkE0XHU1NDBFXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3XHU1RTkzXHUzMDAyJyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWRlc2MnLFxuICAgIH0pO1xuXG4gICAgLy8gXHU0RTNCXHU0RjUzXHVGRjFBXHU1REU2XHU2ODExICsgXHU1M0YzXHU1QkY5XHU4QkREXG4gICAgY29uc3QgYm9keSA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktYWdlbnRpYy1ib2R5JyB9KTtcblxuICAgIGNvbnN0IGxlZnQgPSBib2R5LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1hZ2VudGljLWxlZnQnIH0pO1xuICAgIHRoaXMubGlzdEVsID0gbGVmdC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1saXN0JyB9KTtcblxuICAgIGNvbnN0IHJpZ2h0ID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktYWdlbnRpYy1yaWdodCcgfSk7XG4gICAgdGhpcy5jaGF0TG9nRWwgPSByaWdodC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktY2hhdCcgfSk7XG4gICAgY29uc3QgY29tcG9zZXIgPSByaWdodC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktY2hhdC1jb21wb3NlcicgfSk7XG4gICAgdGhpcy5pbnB1dEVsID0gY29tcG9zZXIuY3JlYXRlRWwoJ3RleHRhcmVhJywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLWNoYXQtaW5wdXQnLFxuICAgICAgYXR0cjogeyBwbGFjZWhvbGRlcjogJ1x1OEJGNFx1NzBCOVx1NEVDMFx1NEU0OFx1RkYwQ1x1NTk4MlwiXHU2MjhBXHU4REQxXHU2QjY1XHU1M0JCXHU2Mzg5XHVGRjBDXHU2MzYyXHU2MjEwXHU2RTM4XHU2Q0YzXCJcdTIwMjYnLCByb3dzOiAnMicgfSxcbiAgICB9KTtcbiAgICB0aGlzLnNlbmRCdG4gPSBjb21wb3Nlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1NTNEMVx1OTAwMScsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1idG4gYmFtYm9vLWFpLXBsYW4tYnRuLXByaW1hcnknLFxuICAgIH0pO1xuICAgIHRoaXMuc2VuZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHZvaWQgdGhpcy5vblNlbmQoKSk7XG4gICAgdGhpcy5pbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInICYmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5KSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZvaWQgdGhpcy5vblNlbmQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFx1NUU5NVx1OTBFOFxuICAgIGNvbnN0IGZvb3RlciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1mb290ZXInIH0pO1xuICAgIGZvb3Rlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1NTNENlx1NkQ4OCcsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1idG4gYmFtYm9vLWFpLXBsYW4tYnRuLWdob3N0JyxcbiAgICB9KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuY2xvc2UoKSk7XG4gICAgY29uc3Qgd3JpdGVCdG4gPSBmb290ZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICdcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDcnLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYnRuIGJhbWJvby1haS1wbGFuLWJ0bi1wcmltYXJ5JyxcbiAgICB9KTtcbiAgICB3cml0ZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuY29uZmlybSgpKTtcbiAgICB0aGlzLmZvb3RlckNvdW50ID0gd3JpdGVCdG47XG5cbiAgICAvLyBcdTVGMDJcdTZCNjVcdTYyQzlcdTk5OTZcdTcyNDhcbiAgICB2b2lkIHRoaXMuaW5pdFBsYW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdFBsYW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU3RjE2XHU4RjkxXHU3M0IwXHU2NzA5XHU2ODExXHU2QTIxXHU1RjBGXHVGRjFBXHU4RjdEXHU1MTY1XHU3NzFGXHU1QjlFXHU3NkVFXHU2ODA3XHU2ODExXHVGRjBDXHU0RTBEXHU4QzAzIEFJIFx1NjJDNlx1ODlFM1xuICAgIGlmICh0aGlzLm9wdHMuZ29hbHMpIHtcbiAgICAgIHRoaXMuc2Vzc2lvbi5sb2FkR29hbHModGhpcy5vcHRzLmdvYWxzKTtcbiAgICAgIHRoaXMuY2hhdExvZyA9IFt7IHJvbGU6ICdhc3Npc3RhbnQnLCB0ZXh0OiAnXHU1REYyXHU4RjdEXHU1MTY1XHU0RjYwXHU3Njg0XHU3M0IwXHU2NzA5XHU3NkVFXHU2ODA3XHU2ODExXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU3RjE2XHU4RjkxXHU2MjE2XHU4QkE5XHU2MjExXHU4QzAzXHU2NTc0XHUzMDAyJyB9XTtcbiAgICAgIHRoaXMucmVidWlsZFRyZWUoZmFsc2UpO1xuICAgICAgdGhpcy5yZW5kZXJDaGF0KCk7XG4gICAgICBpZiAodGhpcy5vcHRzLmluaXRpYWxJbnN0cnVjdGlvbikge1xuICAgICAgICBjb25zdCBpbnN0cnVjdGlvbiA9IHRoaXMub3B0cy5pbml0aWFsSW5zdHJ1Y3Rpb247XG4gICAgICAgIHRoaXMucHVzaENoYXQoJ3VzZXInLCBpbnN0cnVjdGlvbik7XG4gICAgICAgIHRoaXMuc2V0U2VuZGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IHJlcGx5IH0gPSBhd2FpdCB0aGlzLnNlc3Npb24uc2VuZChpbnN0cnVjdGlvbik7XG4gICAgICAgICAgdGhpcy5yZWJ1aWxkVHJlZSh0cnVlKTtcbiAgICAgICAgICB0aGlzLnB1c2hDaGF0KCdhc3Npc3RhbnQnLCByZXBseSB8fCAnXHU1REYyXHU1RTk0XHU3NTI4XHU1RUZBXHU4QkFFXHUzMDAyJyk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsICdcdTI2QTAgXHU1RTk0XHU3NTI4XHU1RUZBXHU4QkFFXHU1OTMxXHU4RDI1XHVGRjBDXHU4QkY3XHU2MjRCXHU1MkE4XHU4QzAzXHU2NTc0XHUzMDAyJyk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdGhpcy5zZXRTZW5kaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsICdcdTIzRjMgQUkgXHU4OUM0XHU1MjEyXHU0RTJEXHUyMDI2XHVGRjA4XHU2QjYzXHU1NzI4XHU2MkM2XHU4OUUzXHU3NkVFXHU2ODA3XHVGRjA5Jyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGdvYWxzID0gYXdhaXQgdGhpcy5zZXNzaW9uLmluaXQoKTtcbiAgICAgIGlmIChnb2Fscy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbmV3IE5vdGljZShcbiAgICAgICAgICAnQUkgXHU2NzJBXHU0RUNFXHU3QjE0XHU4QkIwXHU0RTJEXHU4QkM2XHU1MjJCXHU1MUZBXHU2NjBFXHU3ODZFXHU3NkVFXHU2ODA3XHUzMDAyXFxuXHU4QkQ1XHU4QkQ1XHU4RkQ5XHU2ODM3XHU3Njg0XHU1M0U1XHU1RjBGXHVGRjFBXHUzMDBDXHU2MjExXHU2MEYzXHU1NzI4IDMgXHU0RTJBXHU2NzA4XHU1MTg1XHU1MUNGXHU5MUNEIDVrZ1x1RkYwQ1x1NkJDRlx1NTkyOVx1OEREMVx1NkI2NSAzMCBcdTUyMDZcdTk0OUZcdTMwMDFcdTYzQTdcdTUyMzZcdTk5NkVcdTk4REZcdTMwMERcdTMwMDInXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5jaGF0TG9nID0gW3sgcm9sZTogJ2Fzc2lzdGFudCcsIHRleHQ6IGBcdTVERjJcdTRFQ0VcdTdCMTRcdThCQjBcdThCQzZcdTUyMkJcdTUxRkEgJHtnb2Fscy5sZW5ndGh9IFx1NEUyQVx1NzZFRVx1NjgwN1x1RkYwQ1x1NTNFRlx1NzZGNFx1NjNBNVx1N0YxNlx1OEY5MVx1NjIxNlx1OEJBOVx1NjIxMVx1OEMwM1x1NjU3NFx1MzAwMmAgfV07XG4gICAgICB0aGlzLnJlYnVpbGRUcmVlKGZhbHNlKTtcbiAgICAgIHRoaXMucmVuZGVyQ2hhdCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ0FJIFx1ODlDNFx1NTIxMlx1NTkzMVx1OEQyNScpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb25TZW5kKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5pbnB1dEVsO1xuICAgIGNvbnN0IHRleHQgPSBpbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGlmICghdGV4dCB8fCAhdGhpcy5zZW5kQnRuIHx8ICFpbnB1dCkgcmV0dXJuO1xuICAgIGlucHV0LnZhbHVlID0gJyc7XG4gICAgdGhpcy5wdXNoQ2hhdCgndXNlcicsIHRleHQpO1xuICAgIHRoaXMuc2V0U2VuZGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyByZXBseSwgZ29hbHMgfSA9IGF3YWl0IHRoaXMuc2Vzc2lvbi5zZW5kKHRleHQpO1xuICAgICAgdGhpcy5yZWJ1aWxkVHJlZSh0cnVlKTtcbiAgICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsIHJlcGx5IHx8ICdcdTVERjJcdTY2RjRcdTY1QjBcdTg5QzRcdTUyMTJcdTMwMDInKTtcbiAgICAgIHZvaWQgZ29hbHM7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLnB1c2hDaGF0KCdhc3Npc3RhbnQnLCAnXHUyNkEwIFx1NkNBMVx1NTQyQ1x1NjFDMlx1RkYwQ1x1NjM2Mlx1NEUyQVx1OEJGNFx1NkNENVx1OEJENVx1OEJENVx1RkYwOFx1NUY1M1x1NTI0RFx1ODlDNFx1NTIxMlx1NjcyQVx1NjUzOVx1NTJBOFx1RkYwOVx1MzAwMicpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLnNldFNlbmRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLnNlc3Npb24ucmVzZXQoKTtcbiAgICB0aGlzLnJlYnVpbGRUcmVlKGZhbHNlKTtcbiAgICB0aGlzLnB1c2hDaGF0KCdhc3Npc3RhbnQnLCAnXHUyMUJBIFx1NURGMlx1OTFDRFx1N0Y2RVx1NEUzQSBBSSBcdTUyMURcdTcyNDhcdTMwMDInKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0U2VuZGluZyhvbjogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLnNlbmRCdG4pIHRoaXMuc2VuZEJ0bi5kaXNhYmxlZCA9IG9uO1xuICAgIGlmICh0aGlzLmlucHV0RWwpIHRoaXMuaW5wdXRFbC5kaXNhYmxlZCA9IG9uO1xuICB9XG5cbiAgcHJpdmF0ZSBwdXNoQ2hhdChyb2xlOiAndXNlcicgfCAnYXNzaXN0YW50JywgdGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jaGF0TG9nLnB1c2goeyByb2xlLCB0ZXh0IH0pO1xuICAgIHRoaXMucmVuZGVyQ2hhdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJDaGF0KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5jaGF0TG9nRWwpIHJldHVybjtcbiAgICB0aGlzLmNoYXRMb2dFbC5lbXB0eSgpO1xuICAgIGZvciAoY29uc3QgbSBvZiB0aGlzLmNoYXRMb2cpIHtcbiAgICAgIGNvbnN0IGJ1YmJsZSA9IHRoaXMuY2hhdExvZ0VsLmNyZWF0ZURpdih7XG4gICAgICAgIGNsczogYGJhbWJvby1haS1jaGF0LWJ1YmJsZSBiYW1ib28tYWktY2hhdC0ke20ucm9sZX1gLFxuICAgICAgfSk7XG4gICAgICBidWJibGUuc2V0VGV4dChtLnRleHQpO1xuICAgICAgdGhpcy5jaGF0TG9nRWwuc2Nyb2xsVG9wID0gdGhpcy5jaGF0TG9nRWwuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTRGOURcdTYzNkUgc2Vzc2lvbi5nb2FscyBcdTkxQ0RcdTVFRkFcdTVERTZcdTY4MTFcdUZGMUJoaWdobGlnaHQ9dHJ1ZSBcdTY1RjZcdTVCRjlcdTY1QjBcdTUxRkFcdTczQjBcdTc2ODRcdTc2RUVcdTY4MDcvXHU1QjUwXHU5ODc5XHU2MjUzXHU5QUQ4XHU0RUFFICovXG4gIHByaXZhdGUgcmVidWlsZFRyZWUoaGlnaGxpZ2h0OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmxpc3RFbCkgcmV0dXJuO1xuICAgIGNvbnN0IHByZXZHb2FscyA9IHRoaXMucHJldkdvYWxUaXRsZXM7XG4gICAgY29uc3QgcHJldkl0ZW1zID0gdGhpcy5wcmV2SXRlbUtleXM7XG5cbiAgICB0aGlzLmVudHJpZXMgPSB0aGlzLnNlc3Npb24uZ29hbHMubWFwKChnb2FsKSA9PiAoe1xuICAgICAgZ29hbCxcbiAgICAgIGtlZXA6IHRydWUsXG4gICAgICBpdGVtczogKGdvYWwuaXRlbXMgPz8gW10pLm1hcCgoaXRlbSkgPT4gKHsgaXRlbSwga2VlcDogdHJ1ZSB9KSksXG4gICAgfSkpO1xuXG4gICAgY29uc3QgbGlzdCA9IHRoaXMubGlzdEVsO1xuICAgIGxpc3QuZW1wdHkoKTtcbiAgICB0aGlzLmVudHJpZXMuZm9yRWFjaCgoZW50cnksIGdpKSA9PiB7XG4gICAgICBjb25zdCBpc05ld0dvYWwgPSBoaWdobGlnaHQgJiYgIXByZXZHb2Fscy5oYXMoZW50cnkuZ29hbC50aXRsZSk7XG4gICAgICB0aGlzLnJlbmRlckdvYWwobGlzdCwgZW50cnksIGdpLCBpc05ld0dvYWwsIGhpZ2hsaWdodCwgcHJldkl0ZW1zKTtcbiAgICB9KTtcblxuICAgIHRoaXMucHJldkdvYWxUaXRsZXMgPSBuZXcgU2V0KHRoaXMuc2Vzc2lvbi5nb2Fscy5tYXAoKGcpID0+IGcudGl0bGUpKTtcbiAgICB0aGlzLnByZXZJdGVtS2V5cyA9IG5ldyBTZXQoXG4gICAgICB0aGlzLnNlc3Npb24uZ29hbHMuZmxhdE1hcCgoZykgPT4gKGcuaXRlbXMgPz8gW10pLm1hcCgoaXQpID0+IGAke2cudGl0bGV9Ojoke2l0Lm5hbWV9YCkpXG4gICAgKTtcbiAgICB0aGlzLnVwZGF0ZUZvb3RlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJHb2FsKFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgZW50cnk6IEdvYWxFbnRyeSxcbiAgICBnaTogbnVtYmVyLFxuICAgIGlzTmV3R29hbDogYm9vbGVhbixcbiAgICBoaWdobGlnaHQ6IGJvb2xlYW4sXG4gICAgcHJldkl0ZW1zOiBTZXQ8c3RyaW5nPlxuICApOiB2b2lkIHtcbiAgICBjb25zdCBjYXJkID0gcGFyZW50LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWdvYWwnIH0pO1xuICAgIGlmIChpc05ld0dvYWwpIGNhcmQuYWRkQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWdvYWwtdXBkYXRlZCcpO1xuXG4gICAgY29uc3QgaGVhZCA9IGNhcmQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZ29hbC1oZWFkJyB9KTtcblxuICAgIGNvbnN0IHRpdGxlSW5wdXQgPSBoZWFkLmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWdvYWwtdGl0bGUnLFxuICAgICAgYXR0cjogeyB2YWx1ZTogZW50cnkuZ29hbC50aXRsZSwgcGxhY2Vob2xkZXI6ICdcdTc2RUVcdTY4MDdcdTY4MDdcdTk4OTgnIH0sXG4gICAgfSk7XG4gICAgdGl0bGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgIGVudHJ5LmdvYWwudGl0bGUgPSB0aXRsZUlucHV0LnZhbHVlLnRyaW0oKSB8fCBgXHU3NkVFXHU2ODA3JHtnaSArIDF9YDtcbiAgICB9KTtcbiAgICB0aXRsZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU3NkVFXHU2ODA3XHU2NTM5XHU1NDBEXHU0RTNBXHUzMDBDJHtlbnRyeS5nb2FsLnRpdGxlfVx1MzAwRGApO1xuICAgIH0pO1xuXG4gICAgaWYgKGVudHJ5LmdvYWwuYW5hbHlzaXMpIHtcbiAgICAgIGhlYWQuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogYEFJIFx1NTIwNlx1Njc5MFx1RkYxQSR7ZW50cnkuZ29hbC5hbmFseXNpc31gLFxuICAgICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1hbmFseXNpcycsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBjYXRTZWxlY3QgPSBoZWFkLmNyZWF0ZUVsKCdzZWxlY3QnLCB7IGNsczogJ2JhbWJvby1haS1wbGFuLWNhdCcgfSk7XG4gICAgR09BTF9DQVRFR09SSUVTLmZvckVhY2goKGMpID0+IHtcbiAgICAgIGNvbnN0IG9wdCA9IGNhdFNlbGVjdC5jcmVhdGVFbCgnb3B0aW9uJywgeyB0ZXh0OiBgJHtjLmljb259ICR7Yy5uYW1lfWAsIHZhbHVlOiBjLmlkIH0pO1xuICAgICAgaWYgKGMuaWQgPT09IGVudHJ5LmdvYWwuY2F0ZWdvcnkpIG9wdC5zZWxlY3RlZCA9IHRydWU7XG4gICAgfSk7XG4gICAgY2F0U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGVudHJ5LmdvYWwuY2F0ZWdvcnkgPSBjYXRTZWxlY3QudmFsdWUgYXMgR29hbENhdGVnb3J5O1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTc2RUVcdTY4MDdcdTMwMEMke2VudHJ5LmdvYWwudGl0bGV9XHUzMDBEXHU5ODg2XHU1N0RGXHU2NTM5XHU0RTNBICR7Y2F0U2VsZWN0LnZhbHVlfWApO1xuICAgICAgdGhpcy5yZWZyZXNoVGhpbkJhZGdlKGNhcmQsIGVudHJ5KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0YXJ0V3JhcCA9IGhlYWQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGF0ZXJhbmdlJyB9KTtcbiAgICBjb25zdCBzdGFydElucHV0ID0gc3RhcnRXcmFwLmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWRhdGVyYW5nZS1pbnB1dCcsXG4gICAgICBhdHRyOiB7IHR5cGU6ICdkYXRlJywgdmFsdWU6IGVudHJ5LmdvYWwuc3RhcnREYXRlID8/ICcnIH0sXG4gICAgfSk7XG4gICAgc3RhcnRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBlbnRyeS5nb2FsLnN0YXJ0RGF0ZSA9IHN0YXJ0SW5wdXQudmFsdWU7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NzZFRVx1NjgwN1x1MzAwQyR7ZW50cnkuZ29hbC50aXRsZX1cdTMwMERcdTVGMDBcdTU5Q0JcdTY1RTVcdTY1MzlcdTRFM0EgJHtzdGFydElucHV0LnZhbHVlfWApO1xuICAgIH0pO1xuICAgIHN0YXJ0V3JhcC5jcmVhdGVTcGFuKHsgdGV4dDogJ1x1MjAxNCcsIGNsczogJ2JhbWJvby1haS1wbGFuLWRhdGVyYW5nZS1zZXAnIH0pO1xuICAgIGNvbnN0IGVuZElucHV0ID0gc3RhcnRXcmFwLmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWRhdGVyYW5nZS1pbnB1dCcsXG4gICAgICBhdHRyOiB7IHR5cGU6ICdkYXRlJywgdmFsdWU6IGVudHJ5LmdvYWwuZW5kRGF0ZSA/PyAnJyB9LFxuICAgIH0pO1xuICAgIGVuZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGVudHJ5LmdvYWwuZW5kRGF0ZSA9IGVuZElucHV0LnZhbHVlO1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTc2RUVcdTY4MDdcdTMwMEMke2VudHJ5LmdvYWwudGl0bGV9XHUzMDBEXHU2MjJBXHU2QjYyXHU2NUU1XHU2NTM5XHU0RTNBICR7ZW5kSW5wdXQudmFsdWV9YCk7XG4gICAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UoY2FyZCwgZW50cnkpO1xuICAgIH0pO1xuXG4gICAgY2FyZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1iYWRnZScgfSk7XG4gICAgdGhpcy5yZWZyZXNoVGhpbkJhZGdlKGNhcmQsIGVudHJ5KTtcblxuICAgIGNvbnN0IGRlbCA9IGhlYWQuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICdcdTI3MTUnLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGVsJyxcbiAgICAgIGF0dHI6IHsgdGl0bGU6ICdcdTUyMjBcdTk2NjRcdThCRTVcdTc2RUVcdTY4MDcnIH0sXG4gICAgfSk7XG4gICAgZGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgZW50cnkua2VlcCA9IGZhbHNlO1xuICAgICAgY2FyZC50b2dnbGVDbGFzcygnYmFtYm9vLWFpLXBsYW4tZ29hbC1yZW1vdmVkJywgdHJ1ZSk7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NTIyMFx1OTY2NFx1NEU4Nlx1NzZFRVx1NjgwN1x1MzAwQyR7ZW50cnkuZ29hbC50aXRsZX1cdTMwMERgKTtcbiAgICAgIHRoaXMudXBkYXRlRm9vdGVyKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBpdGVtc1dyYXAgPSBjYXJkLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW1zJyB9KTtcbiAgICAoZW50cnkuZ29hbC5pdGVtcyA/PyBbXSkuZm9yRWFjaCgoXywgaWkpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW1FbnRyeSA9IGVudHJ5Lml0ZW1zW2lpXTtcbiAgICAgIGlmICghaXRlbUVudHJ5KSByZXR1cm47XG4gICAgICBjb25zdCBpc05ld0l0ZW0gPSBoaWdobGlnaHQgJiYgIXByZXZJdGVtcy5oYXMoYCR7ZW50cnkuZ29hbC50aXRsZX06OiR7aXRlbUVudHJ5Lml0ZW0ubmFtZX1gKTtcbiAgICAgIHRoaXMucmVuZGVySXRlbShpdGVtc1dyYXAsIGVudHJ5LCBpdGVtRW50cnksIGlpLCBpc05ld0l0ZW0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWZyZXNoVGhpbkJhZGdlKGNhcmQ6IEhUTUxFbGVtZW50LCBlbnRyeTogR29hbEVudHJ5KTogdm9pZCB7XG4gICAgY29uc3QgYmFkZ2UgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5iYW1ib28tYWktcGxhbi1iYWRnZScpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBpZiAoIWJhZGdlKSByZXR1cm47XG4gICAgY29uc3QgeyBsZXZlbCwgbWlzc2luZyB9ID0gY2xhc3NpZnlDb21wbGV0ZW5lc3MoZW50cnkuZ29hbCk7XG4gICAgYmFkZ2UuZW1wdHkoKTtcbiAgICBpZiAobGV2ZWwgPT09ICd0aGluJykge1xuICAgICAgYmFkZ2Uuc2V0VGV4dChgXHUyNkEwIFx1NUY4NVx1ODg2NVx1NTg2Qlx1RkYxQSR7bWlzc2luZy5qb2luKCdcdTMwMDEnKX1gKTtcbiAgICAgIGJhZGdlLmFkZENsYXNzKCdiYW1ib28tYWktcGxhbi1iYWRnZS10aGluJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhZGdlLnNldFRleHQoJ1x1MjcxMyBcdTVERjJcdTkxQ0ZcdTUzMTZcdUZGMENcdTUzRUZcdTUxOTlcdTUxNjUnKTtcbiAgICAgIGJhZGdlLnJlbW92ZUNsYXNzKCdiYW1ib28tYWktcGxhbi1iYWRnZS10aGluJyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJJdGVtKFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgZW50cnk6IEdvYWxFbnRyeSxcbiAgICBpdGVtRW50cnk6IEl0ZW1FbnRyeSxcbiAgICBpaTogbnVtYmVyLFxuICAgIGlzTmV3SXRlbTogYm9vbGVhblxuICApOiB2b2lkIHtcbiAgICBjb25zdCByb3cgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbScgfSk7XG4gICAgaWYgKGlzTmV3SXRlbSkgcm93LmFkZENsYXNzKCdiYW1ib28tYWktcGxhbi1pdGVtLXVwZGF0ZWQnKTtcblxuICAgIGNvbnN0IGNiID0gcm93LmNyZWF0ZUVsKCdpbnB1dCcsIHsgdHlwZTogJ2NoZWNrYm94JywgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1jYicgfSk7XG4gICAgY2IuY2hlY2tlZCA9IGl0ZW1FbnRyeS5rZWVwO1xuICAgIGNiLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGl0ZW1FbnRyeS5rZWVwID0gY2IuY2hlY2tlZDtcbiAgICAgIHJvdy50b2dnbGVDbGFzcygnYmFtYm9vLWFpLXBsYW4taXRlbS1vZmYnLCAhY2IuY2hlY2tlZCk7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoXG4gICAgICAgIGAke2NiLmNoZWNrZWQgPyAnXHU0RkREXHU3NTU5JyA6ICdcdTUyMjBcdTk2NjQnfVx1NUI1MFx1OTg3OVx1MzAwQyR7aXRlbUVudHJ5Lml0ZW0ubmFtZX1cdTMwMERgXG4gICAgICApO1xuICAgICAgdGhpcy5yZWZyZXNoVGhpbkJhZGdlKHBhcmVudC5jbG9zZXN0KCcuYmFtYm9vLWFpLXBsYW4tZ29hbCcpIGFzIEhUTUxFbGVtZW50LCBlbnRyeSk7XG4gICAgICB0aGlzLnVwZGF0ZUZvb3RlcigpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgbmFtZUlucHV0ID0gcm93LmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tbmFtZScsXG4gICAgICBhdHRyOiB7IHZhbHVlOiBpdGVtRW50cnkuaXRlbS5uYW1lLCBwbGFjZWhvbGRlcjogJ1x1NUI1MFx1OTg3OVx1NTQwRCcgfSxcbiAgICB9KTtcbiAgICBuYW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICBpdGVtRW50cnkuaXRlbS5uYW1lID0gbmFtZUlucHV0LnZhbHVlLnRyaW0oKSB8fCBgXHU1QjUwXHU5ODc5JHtpaSArIDF9YDtcbiAgICAgIHVuaXRDaGlwLnNldFRleHQoZXh0cmFjdFVuaXQobmFtZUlucHV0LnZhbHVlKSk7XG4gICAgfSk7XG4gICAgbmFtZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU1QjUwXHU5ODc5XHU2NTM5XHU1NDBEXHU0RTNBXHUzMDBDJHtpdGVtRW50cnkuaXRlbS5uYW1lfVx1MzAwRGApO1xuICAgIH0pO1xuXG4gICAgaWYgKCFpdGVtRW50cnkuaXRlbS50YXNrRGF5VHlwZSkgaXRlbUVudHJ5Lml0ZW0udGFza0RheVR5cGUgPSAnZGFpbHknO1xuICAgIGNvbnN0IGRhaWx5V3JhcCA9IHJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLWRhaWx5JyB9KTtcbiAgICBkYWlseVdyYXAuY3JlYXRlU3Bhbih7IHRleHQ6ICdcdTZCQ0ZcdTY1RTVcdTkxQ0YnLCBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLWxhYmVsJyB9KTtcbiAgICBjb25zdCBkYWlseUlucHV0ID0gZGFpbHlXcmFwLmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tZGFpbHktaW5wdXQnLFxuICAgICAgYXR0cjogeyB2YWx1ZTogaXRlbUVudHJ5Lml0ZW0uZGFpbHlNaW4gPz8gJycsIHBsYWNlaG9sZGVyOiAnXHU2NTcwXHU1QjU3JywgdHlwZTogJ3RleHQnLCBpbnB1dG1vZGU6ICdkZWNpbWFsJyB9LFxuICAgIH0pO1xuICAgIGNvbnN0IHVuaXRDaGlwID0gZGFpbHlXcmFwLmNyZWF0ZVNwYW4oeyBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLXVuaXQtY2hpcCcgfSk7XG4gICAgdW5pdENoaXAuc2V0VGV4dChleHRyYWN0VW5pdChpdGVtRW50cnkuaXRlbS5uYW1lKSk7XG4gICAgY29uc3QgZGFpbHlXYXJuID0gcm93LmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLXdhcm4nLFxuICAgICAgdGV4dDogJ1x1MjZBMCBcdTRFMERcdTUzRUZcdTkxQ0ZcdTUzMTZcdUZGMENcdTVFRkFcdThCQUVcdTUyMjBcdTk2NjRcdTYyMTZcdTY1MzlcdTUxOTlcdTRFM0FcdTUzRUZcdThCQTFcdTY1NzBcdTUyQThcdTRGNUMnLFxuICAgIH0pO1xuICAgIGNvbnN0IG1hcmtEYWlseSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHF1YW50aWZpZWQgPSAvXlxcZCsoXFwuXFxkKyk/JC8udGVzdCgoaXRlbUVudHJ5Lml0ZW0uZGFpbHlNaW4gPz8gJycpLnRyaW0oKSk7XG4gICAgICBkYWlseVdyYXAudG9nZ2xlQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWl0ZW0tbm8tZGFpbHknLCAhcXVhbnRpZmllZCk7XG4gICAgICBkYWlseVdhcm4udG9nZ2xlQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWl0ZW0td2Fybi1zaG93JywgIXF1YW50aWZpZWQpO1xuICAgIH07XG4gICAgbWFya0RhaWx5KCk7XG4gICAgZGFpbHlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgIGl0ZW1FbnRyeS5pdGVtLmRhaWx5TWluID0gZGFpbHlJbnB1dC52YWx1ZS50cmltKCk7XG4gICAgICBtYXJrRGFpbHkoKTtcbiAgICAgIHRoaXMucmVmcmVzaFRoaW5CYWRnZShwYXJlbnQuY2xvc2VzdCgnLmJhbWJvby1haS1wbGFuLWdvYWwnKSBhcyBIVE1MRWxlbWVudCwgZW50cnkpO1xuICAgIH0pO1xuICAgIGRhaWx5SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTVCNTBcdTk4NzlcdTMwMEMke2l0ZW1FbnRyeS5pdGVtLm5hbWV9XHUzMDBEXHU2QkNGXHU2NUU1XHU5MUNGXHU2NTM5XHU0RTNBICR7aXRlbUVudHJ5Lml0ZW0uZGFpbHlNaW59YCk7XG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbUVudHJ5Lml0ZW0uZGV0YWlsKSB7XG4gICAgICByb3cuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogYEFJXHVGRjFBJHtpdGVtRW50cnkuaXRlbS5kZXRhaWx9YCxcbiAgICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1yZWFzb24nLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVGb290ZXIoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmZvb3RlckNvdW50KSByZXR1cm47XG4gICAgY29uc3QgbiA9IHRoaXMuZW50cmllcy5maWx0ZXIoKGUpID0+IGUua2VlcCkubGVuZ3RoO1xuICAgIHRoaXMuZm9vdGVyQ291bnQuc2V0VGV4dChgXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3XHVGRjA4JHtufVx1RkYwOWApO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25maXJtKCk6IHZvaWQge1xuICAgIGNvbnN0IGZpbmFsR29hbHM6IEdvYWxJdGVtW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMuZW50cmllcykge1xuICAgICAgaWYgKCFlbnRyeS5rZWVwKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGtlcHRJdGVtczogR29hbFN1Ykl0ZW1bXSA9IGVudHJ5Lml0ZW1zXG4gICAgICAgIC5maWx0ZXIoKGl0KSA9PiBpdC5rZWVwKVxuICAgICAgICAubWFwKChpdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgZGV0YWlsOiBfZGV0YWlsLCAuLi5yZXN0IH0gPSBpdC5pdGVtO1xuICAgICAgICAgIHJldHVybiByZXN0O1xuICAgICAgICB9KTtcbiAgICAgIGZpbmFsR29hbHMucHVzaCh7IC4uLmVudHJ5LmdvYWwsIGl0ZW1zOiBrZXB0SXRlbXMgfSk7XG4gICAgfVxuXG4gICAgaWYgKGZpbmFsR29hbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdTY3MkFcdTRGRERcdTc1NTlcdTRFRkJcdTRGNTVcdTc2RUVcdTY4MDdcdUZGMENcdTVERjJcdTUzRDZcdTZEODhcdTUxOTlcdTUxNjUnKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5vbkNvbmZpcm0oZmluYWxHb2Fscyk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG4iLCAiLyoqXG4gKiBQbGFubmluZ1Nlc3Npb24gXHUyMDE0IFx1NUJGOVx1OEJERFx1NUYwRlx1ODlDNFx1NTIxMlx1NEYxQVx1OEJERFx1RkYwOEFnZW50aWNcdUZGMENQaGFzZSA0XHVGRjA5XG4gKlxuICogXHU0RTBFIFBoYXNlMSBgcGxhbkZyb21Ob3RlYFx1RkYwOFx1NEUwMFx1NkIyMVx1NjAyN1x1RkYwOVx1NEUwRFx1NTQwQ1x1RkYwQ1x1NjcyQ1x1N0M3Qlx1N0VGNFx1NjJBNFx1NEUwMFx1NkJCNVx1NTkxQVx1OEY2RVx1NUJGOVx1OEJERFx1RkYxQVxuICogIC0gXHU5OTk2XHU4RjZFIGluaXQoKVx1RkYxQUFJIFx1NEVDRVx1N0IxNFx1OEJCMFx1NjJDNlx1ODlFM1x1NTIxRFx1NzI0OCBnb2Fsc1x1RkYxQlxuICogIC0gXHU1NDBFXHU3RUVEIHNlbmQodGV4dClcdUZGMUFcdTc1MjhcdTYyMzdcdTc1MjhcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTU4OUUgLyBcdTUyMjAgLyBcdTY1MzlcdUZGMENBSSBcdThGRDRcdTU2REVcdTMwMTBcdTUxNjhcdTkxQ0ZcdTMwMTFcdTY3MDBcdTY1QjAgZ29hbHNcdUZGMUJcbiAqICAtIFx1NjI0Qlx1NTJBOFx1N0YxNlx1OEY5MVx1RkYxQVx1NzZGNFx1NjNBNSBtdXRhdGUgYGdvYWxzYFx1RkYwOFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwOVx1RkYwQ1x1NUU3Nlx1NzUyOCBhcHBseUxvY2FsRWRpdCBcdTYyOEFcdTY1MzlcdTUyQThcbiAqICAgIFx1NTE5OVx1OEZEQlx1NUJGOVx1OEJERFx1NTM4Nlx1NTNGMlx1RkYwQ1x1OTYzMlx1NkI2MiBBSSBcdTRFMEJcdThGNkVcdTYyOEFcdTc1MjhcdTYyMzdcdTYyNEJcdTUyQThcdTY1MzlcdTUyQThcdTg5ODZcdTc2RDZcdTU2REVcdTUzQkJcdUZGMUJcbiAqICAtIHJlc2V0KClcdUZGMUFcdTU2REVcdTUyMzAgQUkgXHU5OTk2XHU3MjQ4XHVGRjBDXHU2RTA1XHU3QTdBXHU1QkY5XHU4QkREXHUzMDAyXG4gKlxuICogXHU4QkJFXHU4QkExXHU1MzlGXHU1MjE5XHVGRjA4XHU0RTBFXHU0RUE3XHU1NEMxXHU1NEYyXHU1QjY2XHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFBXG4gKiAgLSBcdTUzNTVcdTRFMDBcdTY1NzBcdTYzNkVcdTZFOTBcdUZGMUF0aGlzLmdvYWxzIFx1NjYyRlx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwOHNvdXJjZSBvZiB0cnV0aFx1RkYwOVx1MzAwMlxuICogIC0gXHU1QkI5XHU5NTE5XHU0RjE4XHU1MTQ4XHVGRjFBXHU1NzRGIEpTT04gXHUyMTkyIFx1NTZERVx1NkVEQVx1NjcyQ1x1OEY2RSBtZXNzYWdlc1x1MzAwMXRoaXMuZ29hbHMgXHU0RTBEXHU1M0Q4XHUzMDAxXHU2MjlCXHU5NTE5XHU3NTMxXHU0RTBBXHU1QzQyXHU2M0QwXHU3OTNBXHUzMDAyXG4gKlxuICogXHU5NkY2IE9ic2lkaWFuIFx1NEY5RFx1OEQ1Nlx1RkYwQ2ZldGNoRm4gXHU1M0VGXHU2Q0U4XHU1MTY1XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHVGRjA4XHU1M0MyXHU4MDAzIG1hcmtkb3duUGxhbm5lci50ZXN0LnRzXHVGRjA5XHUzMDAyXG4gKi9cblxuaW1wb3J0IHsgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IHR5cGUgR29hbEl0ZW0gfSBmcm9tICcuLi90eXBlcy9kYXRhJztcbmltcG9ydCB7XG4gIGJ1aWxkUHJvbXB0LFxuICBleHRyYWN0Q2hhdFRleHQsXG4gIHBhcnNlR29hbHMsXG4gIHR5cGUgQWlGZXRjaEZuLFxuICB0eXBlIEFpUmVzcG9uc2UsXG4gIHR5cGUgUGxhbm5lclNldHRpbmdzLFxufSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQgeyB2YWxpZGF0ZUdvYWxzIGFzIF92YWxpZGF0ZSB9IGZyb20gJy4vR29hbENhcmRWYWxpZGF0b3InO1xuXG4vKiogXHU1QkY5XHU4QkREXHU2RDg4XHU2MDZGXHVGRjA4XHU1QkY5XHU5RjUwIE9wZW5BSSBjaGF0L2NvbXBsZXRpb25zIG1lc3NhZ2VzXHVGRjA5ICovXG5leHBvcnQgaW50ZXJmYWNlIENoYXRNZXNzYWdlIHtcbiAgcm9sZTogJ3N5c3RlbScgfCAndXNlcicgfCAnYXNzaXN0YW50JztcbiAgY29udGVudDogc3RyaW5nO1xufVxuXG4vKiogc2VuZCgpIFx1NzY4NFx1OEZENFx1NTZERVx1NTAzQ1x1RkYxQVx1NjcyQ1x1OEY2RSBBSSBcdTY5ODJcdTg5ODEgKyBcdTY3MDBcdTY1QjBcdTUxNjhcdTkxQ0YgZ29hbHMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VuZFJlc3VsdCB7XG4gIHJlcGx5OiBzdHJpbmc7XG4gIGdvYWxzOiBHb2FsSXRlbVtdO1xufVxuXG4vKiogXHU1QkY5XHU4QkREXHU1RjBGXHU4OUM0XHU1MjEyXHU4RkZEXHU1MkEwXHU1MjMwIHN5c3RlbSBcdTc2ODRcdTYzMDdcdTRFRTRcdUZGMDhcdTU5MERcdTc1MjggYnVpbGRQcm9tcHQgXHU3Njg0XHU5MUNGXHU1MzE2XHU5NEMxXHU1RjhCXHVGRjA5ICovXG5jb25zdCBBR0VOVF9TVUZGSVggPSBgXG5cbiMgXHU1QkY5XHU4QkREXHU1RjBGXHU4OUM0XHU1MjEyXHU2QTIxXHU1RjBGXHVGRjA4XHU0RjYwXHU2QjYzXHU0RTBFXHU3NTI4XHU2MjM3XHU1OTFBXHU4RjZFXHU2MjUzXHU3OEU4XHU4OUM0XHU1MjEyXHVGRjA5XG5cdThGRDlcdTY2MkZcdTVCRjlcdThCRERcdTVGMEZcdTg5QzRcdTUyMTJcdUZGMUFcdTc1MjhcdTYyMzdcdTRGMUFcdTU3MjhcdTZCNjRcdTU3RkFcdTc4NDBcdTRFMEFcdTYzRDBcdTUxRkFcdTMwMENcdTU4OUUgLyBcdTUyMjAgLyBcdTY1MzlcdTMwMERcdTdCNDlcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTYzMDdcdTRFRTRcdTMwMDJcbi0gXHU2QkNGXHU2QjIxXHU1NkRFXHU1OTBEXHU5MEZEXHU1RkM1XHU5ODdCXHU4RkQ0XHU1NkRFXHUzMDEwXHU1RjUzXHU1MjREXHU1QjhDXHU2NTc0XHU3Njg0XHU2NzAwXHU2NUIwIGdvYWxzIEpTT04gXHU1MTY4XHU5MUNGXHUzMDExXHVGRjBDKipcdTRFMERcdTg5ODFcdTUzRUFcdTU2REVcdTU4OUVcdTkxQ0ZcdTMwMDFcdTRFMERcdTg5ODFcdTU2REUgZGlmZioqXHUzMDAyXG4tIFx1OTg3Nlx1NUM0Mlx1NTg5RVx1NTJBMFx1NTNFRlx1OTAwOVx1NUI1N1x1NkJCNSBcInJlcGx5XCJcdUZGMDhcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMENcdTIyNjQzMCBcdTVCNTdcdTRFMkRcdTY1ODdcdUZGMDlcdUZGMUFcdTc1MjhcdTRFMDBcdTUzRTVcdThCRERcdThCRjRcdTY2MEVcdTRGNjBcdThGRDlcdTZCMjFcdTUwNUFcdTRFODZcdTRFQzBcdTRFNDhcdTY1MzlcdTUyQThcdUZGMUJcdTgyRTVcdTc1MjhcdTYyMzdcdTUzRUFcdTY2MkZcdTYzRDBcdTk1RUVcdTRFNUZcdThCRjdcdTdCODBcdTg5ODFcdTU2REVcdTdCNTRcdTMwMDJcbi0gXHU0RkREXHU2MzAxXHU0RTBBXHU2NTg3XHU2MjQwXHU2NzA5XHU5MUNGXHU1MzE2XHU5NEMxXHU1RjhCXHVGRjFBXHU3RUFGXHU2NTcwXHU1QjU3IGRhaWx5TWluXHUzMDAxXHU2NUU1XHU5ODk3XHU3QzkyXHU1RUE2XHUzMDAxXHU0RTI1XHU2ODNDXHU1NkY0XHU3RUQ1XHU3NkVFXHU2ODA3XHUzMDAxXHU1M0VGXHU2NTcwXHU0RUUzXHU3NDA2XHU2MzA3XHU2ODA3XHUzMDAxXHU3OTgxXHU2QjYyXCJcdTUyQUFcdTUyOUIvXHU1NzVBXHU2MzAxXCJcdTdCNDlcdTRGMkFcdTkxQ0ZcdTUzMTZcdThCQ0RcdTMwMDJcbi0gXHU1M0VBXHU4RjkzXHU1MUZBIEpTT05cdUZGMENcdTRFMERcdTg5ODFcdTRFRkJcdTRGNTVcdTk4OURcdTU5MTZcdTg5RTNcdTkxQ0FcdTY1ODdcdTVCNTdcdTMwMDFcdTRFMERcdTg5ODEgbWFya2Rvd24gXHU1NkY0XHU2ODBGXHUzMDAyXG5cdThGOTNcdTUxRkFcdTY4M0NcdTVGMEZcdTc5M0FcdTRGOEJcdUZGMUFcbnsgXCJyZXBseVwiOiBcIlx1NURGMlx1NTIyMFx1OTY2NFx1OEREMVx1NkI2NVx1RkYwQ1x1NjVCMFx1NTg5RVx1NkJDRlx1NTQ2OFx1NkUzOFx1NkNGMzNcdTZCMjFcIiwgXCJnb2Fsc1wiOiBbIC4uLiBcdTU0MENcdTRFMEFcdTY1ODdcdTdFRDNcdTY3ODQgLi4uIF0gfWA7XG5cbmV4cG9ydCBjbGFzcyBQbGFubmluZ1Nlc3Npb24ge1xuICBwcml2YXRlIG1lc3NhZ2VzOiBDaGF0TWVzc2FnZVtdID0gW107XG4gIC8qKiBcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMDhcdTUzNTVcdTRFMDBcdTY1NzBcdTYzNkVcdTZFOTBcdUZGMDlcdUZGMENBSSBcdTRFMEVcdTYyNEJcdTUyQThcdTdGMTZcdThGOTFcdTkwRkRcdTRGNUNcdTc1MjhcdTUxNzZcdTRFMEEgKi9cbiAgZ29hbHM6IEdvYWxJdGVtW10gPSBbXTtcbiAgLyoqIFx1OTk5Nlx1NzI0OFx1NUZFQlx1NzE2N1x1RkYwQ1x1NEY5QiByZXNldCgpIFx1OEZEOFx1NTM5RiAqL1xuICBwcml2YXRlIGluaXRpYWxHb2FsczogR29hbEl0ZW1bXSA9IFtdO1xuICAvKiogXHU0RjFBXHU4QkREXHU2QTIxXHU1RjBGXHVGRjFBJ25vdGUnIFx1NzUzMVx1N0IxNFx1OEJCMFx1NjJDNlx1ODlFM1x1OTk5Nlx1NzI0OFx1RkYxQidlZGl0JyBcdTc1MzEgbG9hZEdvYWxzIFx1OEY3RFx1NTE2NVx1NzNCMFx1NjcwOVx1NjgxMSAqL1xuICBwcml2YXRlIG1vZGU6ICdub3RlJyB8ICdlZGl0JyA9ICdub3RlJztcbiAgLyoqIGVkaXQgXHU2QTIxXHU1RjBGXHU3Njg0IHN5c3RlbSBcdTRFMEFcdTRFMEJcdTY1ODdcdUZGMDhcdTU0MkJcdThGN0RcdTUxNjVcdTY4MTEgSlNPTlx1RkYwOVx1RkYwQ1x1NEY5QiByZXNldCBcdThGRDhcdTUzOUYgKi9cbiAgcHJpdmF0ZSBlZGl0U3lzdGVtQ29udGVudCA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY29udGVudDogc3RyaW5nLFxuICAgIHByaXZhdGUgc2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyxcbiAgICBwcml2YXRlIGZldGNoRm46IEFpRmV0Y2hGbiA9IHJlcXVlc3RVcmwgYXMgdW5rbm93biBhcyBBaUZldGNoRm4sXG4gICAgcHJpdmF0ZSBzY29wZTogJ25vdGUnIHwgJ3NlbGVjdGlvbicgPSAnbm90ZSdcbiAgKSB7XG4gICAgY29uc3QgeyBzeXN0ZW0sIHVzZXIgfSA9IGJ1aWxkUHJvbXB0KGNvbnRlbnQsIHNldHRpbmdzLmFpRGVjb21wb3NlRGVwdGgsIHNjb3BlKTtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2goeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtICsgQUdFTlRfU1VGRklYIH0pO1xuICAgIHRoaXMubWVzc2FnZXMucHVzaCh7IHJvbGU6ICd1c2VyJywgY29udGVudDogdXNlciB9KTtcbiAgfVxuXG4gIC8qKiBcdTk5OTZcdThGNkVcdTg5QzRcdTUyMTJcdUZGMUFcdThGRDRcdTU2REVcdTUyMURcdTcyNDggZ29hbHMgXHU1RTc2XHU0RkREXHU1QjU4XHU1RkVCXHU3MTY3ICovXG4gIGFzeW5jIGluaXQoKTogUHJvbWlzZTxHb2FsSXRlbVtdPiB7XG4gICAgY29uc3QgdGV4dCA9IGV4dHJhY3RDaGF0VGV4dChhd2FpdCB0aGlzLmNhbGwoKSk7XG4gICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZSh0ZXh0KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICB0aGlzLmdvYWxzID0gdGhpcy5jYWxsUGFyc2UocGFyc2VHb2FscyhvYmopKTtcbiAgICB0aGlzLmluaXRpYWxHb2FscyA9IHRoaXMuZ29hbHM7XG4gICAgcmV0dXJuIHRoaXMuZ29hbHM7XG4gIH1cblxuICAvKipcbiAgICogXHU3NTI4XHU2MjM3XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU2NTM5XHU0RTAwXHU4RjZFXHVGRjFBXHU4RkQ0XHU1NkRFIHsgcmVwbHksIGdvYWxzIH1cdUZGMENcdTVFNzZcdTUxNjhcdTkxQ0ZcdTY2RkZcdTYzNjJcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdTMwMDJcbiAgICogXHU1NzRGIEpTT04gLyBcdTdFRDNcdTY3ODRcdTk3NUVcdTZDRDUgXHUyMTkyIFx1NTZERVx1NkVEQVx1NjcyQ1x1OEY2RVx1MzAwMWdvYWxzIFx1NEZERFx1NjMwMVx1NEUwRFx1NTNEOFx1MzAwMVx1NjI5Qlx1OTUxOVx1RkYwOFx1NzUzMVx1NEUwQVx1NUM0Mlx1NjNEMFx1NzkzQVx1RkYwOVx1MzAwMlxuICAgKi9cbiAgYXN5bmMgc2VuZCh1c2VyVGV4dDogc3RyaW5nKTogUHJvbWlzZTxTZW5kUmVzdWx0PiB7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyVGV4dCB9KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuY2FsbCgpO1xuICAgICAgY29uc3QgdGV4dCA9IGV4dHJhY3RDaGF0VGV4dChyZXNwKTtcbiAgICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UodGV4dCkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBjb25zdCBnb2FscyA9IHRoaXMuY2FsbFBhcnNlKHBhcnNlR29hbHMob2JqKSk7XG4gICAgICAvLyBcdTYyMTBcdTUyOUZcdUZGMUFcdTUxNjhcdTkxQ0ZcdTY2RkZcdTYzNjJcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcbiAgICAgIHRoaXMuZ29hbHMgPSBnb2FscztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlcGx5OiB0eXBlb2Ygb2JqLnJlcGx5ID09PSAnc3RyaW5nJyA/IG9iai5yZXBseSA6ICcnLFxuICAgICAgICBnb2FscyxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBcdTVCQjlcdTk1MTlcdTY4MzhcdTVGQzNcdUZGMUFcdTU2REVcdTZFREFcdTY3MkNcdThGNkUgdXNlciBcdTZEODhcdTYwNkZcdUZGMENcdTdFRERcdTRFMERcdTUyQThcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcbiAgICAgIHRoaXMubWVzc2FnZXMucG9wKCk7XG4gICAgICB0aHJvdyBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyciA6IG5ldyBFcnJvcignQUkgXHU4RkQ0XHU1NkRFXHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1N0YxNlx1OEY5MVx1NTQwRVx1OEMwM1x1NzUyOFx1RkYxQVx1NjI4QVx1NjUzOVx1NTJBOFx1NTE5OVx1OEZEQlx1NUJGOVx1OEJERFx1NTM4Nlx1NTNGMlx1RkYwOHN5c3RlbSBub3RlXHVGRjA5XHVGRjBDXG4gICAqIFx1OEJBOSBBSSBcdTRFMEJcdThGNkVcIlx1NzdFNVx1OTA1M1x1NEY2MFx1NjUzOVx1OEZDN1wiXHVGRjBDXHU0RTBEXHU0RjFBXHU1MThEXHU2MjhBXHU4OEFCXHU1MjIwXHU3Njg0XHU1QjUwXHU5ODc5XHU1MkEwXHU1NkRFXHU2NzY1XHUzMDAyXG4gICAqIFx1NzcxRlx1NkI2M1x1NzY4NCBtdXRhdGUgXHU1REYyXHU1NzI4XHU1OTE2XHU5MEU4XHU3NkY0XHU2M0E1XHU0RjVDXHU3NTI4XHU1NzI4IHRoaXMuZ29hbHMgXHU0RTBBXHUzMDAyXG4gICAqL1xuICBhcHBseUxvY2FsRWRpdChub3RlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2goeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogYFtcdTc1MjhcdTYyMzdcdTYyNEJcdTUyQThcdTY1MzlcdTUyQThdICR7bm90ZX1gIH0pO1xuICB9XG5cbiAgLyoqIFx1NTZERVx1NTIzMCBBSSBcdTk5OTZcdTcyNDhcdUZGMENcdTZFMDVcdTdBN0FcdTVCRjlcdThCRERcdTUzODZcdTUzRjIgKi9cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gJ2VkaXQnKSB7XG4gICAgICB0aGlzLmdvYWxzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmluaXRpYWxHb2FscykpO1xuICAgICAgdGhpcy5tZXNzYWdlcyA9IFt7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiB0aGlzLmVkaXRTeXN0ZW1Db250ZW50ICsgQUdFTlRfU1VGRklYIH1dO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdvYWxzID0gdGhpcy5pbml0aWFsR29hbHM7XG4gICAgY29uc3QgeyBzeXN0ZW0sIHVzZXIgfSA9IGJ1aWxkUHJvbXB0KHRoaXMuY29udGVudCwgdGhpcy5zZXR0aW5ncy5haURlY29tcG9zZURlcHRoLCB0aGlzLnNjb3BlKTtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW1xuICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtICsgQUdFTlRfU1VGRklYIH0sXG4gICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogdXNlciB9LFxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogXHU3RjE2XHU4RjkxXHU3M0IwXHU2NzA5XHU3NkVFXHU2ODA3XHU2ODExXHVGRjA4XHU0RTBEXHU4QzAzIEFJXHVGRjA5XHVGRjFBXHU2REYxXHU2MkY3XHU4RDFEXHU0RTNBXHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjBDXHU2MjhBXHU1QkY5XHU4QkREXHU5MUNEXHU3RjZFXHU0RTNBXHUzMDBDXHU3RjE2XHU4RjkxXHUzMDBEXHU0RTBBXHU0RTBCXHU2NTg3XHVGRjBDXG4gICAqIFx1OEJBOVx1NTQwRVx1N0VFRCBzZW5kKCkgXHU3Njg0IEFJIFx1NTcyOFx1NzNCMFx1NjcwOVx1NjgxMVx1NTdGQVx1Nzg0MFx1NEUwQVx1NTg5RVx1NTIyMFx1NjUzOVx1RkYwQ1x1ODAwQ1x1OTc1RVx1NEVDRVx1N0IxNFx1OEJCMFx1OTFDRFx1NjVCMFx1NjJDNlx1ODlFM1x1MzAwMlxuICAgKiBcdTk5OTZcdTcyNDhcdTVGRUJcdTcxNjcgPSBcdTRGMjBcdTUxNjVcdTY4MTFcdUZGMENyZXNldCgpIFx1NTZERVx1NTIzMFx1NzcxRlx1NUI5RVx1OTk5Nlx1NzI0OFx1RkYwOFx1NEUwRFx1ODhBQlx1NkM2MVx1NjdEM1x1RkYwOVx1MzAwMlxuICAgKi9cbiAgbG9hZEdvYWxzKGdvYWxzOiBHb2FsSXRlbVtdKTogdm9pZCB7XG4gICAgY29uc3QgY2xvbmUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGdvYWxzKSkgYXMgR29hbEl0ZW1bXTtcbiAgICB0aGlzLmdvYWxzID0gY2xvbmU7XG4gICAgdGhpcy5pbml0aWFsR29hbHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGdvYWxzKSkgYXMgR29hbEl0ZW1bXTtcbiAgICB0aGlzLm1vZGUgPSAnZWRpdCc7XG4gICAgdGhpcy5lZGl0U3lzdGVtQ29udGVudCA9XG4gICAgICAnXHU0RjYwXHU2NjJGXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHU3RjE2XHU4RjkxXHU1NjY4XHUzMDAyXHU3NTI4XHU2MjM3XHU1REYyXHU2NzA5XHU0RTAwXHU0RTJBXHU3NkVFXHU2ODA3XHU2ODExXHVGRjA4XHU1OTgyXHU0RTBCIEpTT05cdUZGMDlcdUZGMUFcXG4nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KGdvYWxzLCBudWxsLCAyKSArXG4gICAgICAnXFxuXHU3NTI4XHU2MjM3XHU0RjFBXHU3NTI4XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU2M0QwXHU1MUZBXHUzMDBDXHU1ODlFL1x1NTIyMC9cdTY1MzlcdTMwMERcdTYzMDdcdTRFRTRcdUZGMENcdTRGNjBcdTZCQ0ZcdTZCMjFcdTU2REVcdTU5MERcdTkwRkRcdTVGQzVcdTk4N0JcdThGRDRcdTU2REVcdTMwMTBcdTVGNTNcdTUyNERcdTVCOENcdTY1NzRcdTc2ODRcdTY3MDBcdTY1QjAgZ29hbHMgSlNPTiBcdTUxNjhcdTkxQ0ZcdTMwMTFcdUZGMENcdTRGRERcdTYzMDFcdTkxQ0ZcdTUzMTZcdTk0QzFcdTVGOEJcdUZGMDhcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW5cdTMwMDFcdTY1RTVcdTk4OTdcdTdDOTJcdTVFQTZcdTMwMDFcdTUzRUZcdTY1NzBcdTRFRTNcdTc0MDZcdTYzMDdcdTY4MDdcdUZGMDlcdTMwMDJcdTUzRUFcdThGOTNcdTUxRkEgSlNPTlx1RkYwQ1x1NEUwRFx1ODk4MSBtYXJrZG93biBcdTU2RjRcdTY4MEZcdTMwMDInO1xuICAgIHRoaXMubWVzc2FnZXMgPSBbeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogdGhpcy5lZGl0U3lzdGVtQ29udGVudCArIEFHRU5UX1NVRkZJWCB9XTtcbiAgfVxuXG4gIC8qKiBcdTVGNTNcdTUyNERcdTVCRjlcdThCRERcdTZEODhcdTYwNkZcdUZGMDhcdTUzRUFcdThCRkJcdTc1MjhcdTkwMTRcdUZGMENcdTU5ODJcdThDMDNcdThCRDUgLyBcdTZENEJcdThCRDVcdTY1QURcdThBMDBcdUZGMDkgKi9cbiAgZ2V0TWVzc2FnZXMoKTogQ2hhdE1lc3NhZ2VbXSB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZXM7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNhbGwoKTogUHJvbWlzZTxBaVJlc3BvbnNlPiB7XG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5zZXR0aW5ncy5haUJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJyl9L2NoYXQvY29tcGxldGlvbnNgO1xuICAgIHJldHVybiB0aGlzLmZldGNoRm4oe1xuICAgICAgdXJsLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0aGlzLnNldHRpbmdzLmFpQXBpS2V5fWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtb2RlbDogdGhpcy5zZXR0aW5ncy5haU1vZGVsLFxuICAgICAgICBtZXNzYWdlczogdGhpcy5tZXNzYWdlcyxcbiAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7IHR5cGU6ICdqc29uX29iamVjdCcgfSxcbiAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgIH0pLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1ODlFM1x1Njc5MCArIFx1NjgyMVx1OUE4Q1x1RkYxQXBhcnNlR29hbHMgXHU1MDVBXHU1QjU3XHU2QkI1XHU2NjIwXHU1QzA0XHVGRjBDdmFsaWRhdGVHb2FscyBcdTUxNUNcdTVFOTVcdTg4NjVcdTlFRDhcdThCQTQgKi9cbiAgcHJpdmF0ZSBjYWxsUGFyc2UocmF3OiBHb2FsSXRlbVtdKTogR29hbEl0ZW1bXSB7XG4gICAgcmV0dXJuIF92YWxpZGF0ZShyYXcpO1xuICB9XG59XG4iLCAiLyoqXG4gKiBEaWFnbm9zaXNNb2RhbCBcdTIwMTQgQUkgXHU4QkNBXHU2NUFEXHU1M0VBXHU4QkZCXHU2MkE1XHU1NDRBXHVGRjA4TVZQLTEgKyBVSSB2Mlx1RkYwOVxuICpcbiAqIFx1OEJCRVx1OEJBMVx1OEJFRFx1OEEwMFx1RkYxQVx1NEUwRSBBSSBcdTg5QzRcdTUyMTJcdTZBMjFcdTU3NTdcdUZGMDhBZ2VudGljUGxhbk1vZGFsXHVGRjA5XHU3RURGXHU0RTAwXG4gKiAgIC0gXHU0RTNCXHU5ODk4XHU4MjcyXHVGRjFBdmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KVxuICogICAtIFx1NTcwNlx1ODlEMlx1RkYxQTEwLTEycHhcbiAqICAgLSBcdTk1RjRcdThERERcdUZGMUE4cHQgXHU3RjUxXHU2ODNDXG4gKiAgIC0gXHU3MkI2XHU2MDAxXHU4QkVEXHU0RTQ5XHVGRjFBXHU0RkREXHU3NTU5XHVGRjA4XHU3RUZGL1x1OUVDNC9cdTdFQTIvXHU2QTU5XHVGRjA5XHVGRjBDXHU0RjQ2XHU2N0Q0XHU1NDhDXHU1MzE2XHVGRjA4XHU5MDBGXHU2NjBFXHU4MENDXHU2NjZGICsgXHU1QjU3XHU4MjcyXHVGRjA5XG4gKlxuICogXHU0RkUxXHU2MDZGXHU1QzQyXHU3RUE3XHVGRjFBXG4gKiAgIEwxIFx1NzEyNlx1NzBCOVx1RkYxQVx1NjgwN1x1OTg5OCArIFx1NjQ1OFx1ODk4MVx1RkYwOFx1NEUwMFx1NUM0Rlx1NTNFRlx1ODlDMVx1RkYwOVxuICogICBMMiBcdTRFM0JcdTRGNTNcdUZGMUFcdTVFRkFcdThCQUVcdTUyMTdcdTg4NjhcdUZGMDhcdTZCQ0ZcdTY3NjFcdTcyRUNcdTdBQ0JcdTg4NENcdTUyQThcdTUzNjEgXHUyMTkyIFx1OTE5Mlx1NzZFRSBDVEFcdUZGMDlcdTIwMTQgXHU3NTI4XHU2MjM3XHU2NzY1XHU4RkQ5XHU5MUNDXHU3Njg0XHU3NzFGXHU2QjYzXHU3NkVFXHU3Njg0XG4gKiAgIEwzIFx1N0VDNlx1ODI4Mlx1RkYxQVx1NUI1MFx1OTg3OVx1OEJDMVx1NjM2RVx1RkYwOFx1OUVEOFx1OEJBNFx1NjI5OFx1NTNFMFx1RkYwQ1x1NzBCOVx1NTFGQlx1NUM1NVx1NUYwMFx1N0QyN1x1NTFEMVx1ODg2OFx1NjgzQ1x1RkYwOVx1MjAxNCBcdTY1MkZcdTY0OTFcdTY1NzBcdTYzNkVcbiAqXG4gKiBcdTU3NEYgSlNPTiBcdTU2REVcdTkwMDBcdUZGMDhyYXdUZXh0XHVGRjA5XHUyMTkyIFx1NzZGNFx1NjNBNVx1NUM1NVx1NzkzQVx1N0VBRlx1NjU4N1x1NjcyQ1x1RkYwQ1x1NEUwRFx1NUQyOVx1MzAwMlxuICovXG5pbXBvcnQgeyBNb2RhbCwgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBEaWFnbm9zaXNSZXN1bHQsIEdvYWxEaWFnbm9zaXMgfSBmcm9tICcuL0dvYWxEaWFnbm9zZXInO1xuaW1wb3J0IHR5cGUgeyBTdWdnZXN0aW9uIH0gZnJvbSAnLi9TdWdnZXN0aW9uJztcbmltcG9ydCB0eXBlIHsgSXRlbUV2aWRlbmNlIH0gZnJvbSAnLi9EZXZpYXRpb25DYWxjdWxhdG9yJztcblxuY29uc3QgU1RBVFVTX0xBQkVMOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBvbl90cmFjazogJ1x1OEZCRVx1NjgwNycsXG4gIGJlaGluZDogJ1x1ODQzRFx1NTQwRScsXG4gIHN0dWNrOiAnXHU1MDVDXHU2RURFJyxcbiAgZG9uZTogJ1x1NURGMlx1NUI4Q1x1NjIxMCcsXG4gIGF0X3Jpc2s6ICdcdTRFMzRcdTY3MUZcdTk4Q0VcdTk2NjknLFxufTtcblxuLyoqIFx1NTA2NVx1NUVCN1x1N0I0OVx1N0VBN1x1NjU4N1x1Njg0OFx1RkYwOFx1NEUwRSB3ZWJhcHAgXHU1MDY1XHU1RUI3XHU1MzYxXHU3MjQ3XHU1NDBDXHU4QkNEXHU2QzQ3XHVGRjA5ICovXG5jb25zdCBMRVZFTF9MQUJFTDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgZXhjZWxsZW50OiAnXHU0RjE4XHU3OUMwJyxcbiAgZ29vZDogJ1x1ODI2Rlx1NTk3RCcsXG4gIHdhcm5pbmc6ICdcdTk3MDBcdTUxNzNcdTZDRTgnLFxuICByaXNrOiAnXHU5OENFXHU5NjY5Jyxcbn07XG5cbi8qKiBcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTUyMDZcdTc3RURcdTY4MDdcdTdCN0VcdUZGMDhcdTVDNjVcdTdFQTYgLyBcdTUyQThcdTUyOUIgLyBcdTgyODJcdTU5NEZcdUZGMENcdTVCRjlcdTlGNTBcdTUwNjVcdTVFQjdcdTUzNjFcdTcyNDdcdUZGMDkgKi9cbmNvbnN0IERJTV9MQUJFTDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgTDE6ICdcdTVDNjVcdTdFQTYnLFxuICBMMjogJ1x1NTJBOFx1NTI5QicsXG4gIEwzOiAnXHU4MjgyXHU1OTRGJyxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc2lzTW9kYWxPcHRpb25zIHtcbiAgZGlhZ25vc2lzOiBEaWFnbm9zaXNSZXN1bHQ7XG4gIC8qKiBcdTkwMTBcdTY3NjFcdTVFOTRcdTc1MjhcdUZGMUFcdTcwQjlcdTY3RDBcdTY3NjFcdTVFRkFcdThCQUVcdTY1RjZcdTRGMjBcdTUxNjVcdThCRTUgZ29hbCArIFx1NTE3N1x1NEY1MyBzdWdnZXN0aW9uXHVGRjA4IzcgXHU3RUQzXHU2Nzg0XHU1MzE2XHVGRjA5ICovXG4gIG9uQXBwbHk6IChnb2FsOiBHb2FsRGlhZ25vc2lzLCBzdWdnZXN0aW9uOiBTdWdnZXN0aW9uKSA9PiB2b2lkO1xuICAvKiogXHU1M0VGXHU5MDA5XHVGRjFBXHU2M0QwXHU0RjlCXHU2NUY2XHVGRjBDXHU1RUZBXHU4QkFFXHU1MzNBXHU5ODc2XHU5MEU4XHU2NjNFXHU3OTNBXHUzMDBDXHU1RTk0XHU3NTI4XHU1MTY4XHU5MEU4XHUzMDBEXHU2MzA5XHU5NEFFXHVGRjA4XHU1RTk0XHU3NTI4XHU4QkU1IGdvYWwgXHU1MTY4XHU5MEU4XHU1RUZBXHU4QkFFXHVGRjA5ICovXG4gIG9uQXBwbHlBbGw/OiAoZ29hbDogR29hbERpYWdub3NpcykgPT4gdm9pZDtcbiAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQVx1NjJBNVx1NTQ0QVx1N0VBN1x1MzAwQ1x1NEUwMFx1OTUyRVx1NUU5NFx1NzUyOFx1NTE2OFx1OTBFOFx1NUVGQVx1OEJBRVx1MzAwRFx1RkYwOE1WUC0yXHVGRjA5XHVGRjBDXHU4REU4XHU2MjQwXHU2NzA5XHU3NkVFXHU2ODA3XHU2Mjc5XHU5MUNGXHU3ODZFXHU1QjlBXHU2MDI3XHU1RTk0XHU3NTI4ICovXG4gIG9uQXBwbHlBbGxEaWFnbm9zaXM/OiAoKSA9PiB2b2lkO1xuICAvKiogXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHVGRjA4XHU2MzA5IGdvYWwudGl0bGUgXHU3RDIyXHU1RjE1XHVGRjA5XHVGRjBDXHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXHVGRjBDXHU1QzU1XHU1RjAwXHU1NDBFXHU2NjJGXHU3RDI3XHU1MUQxXHU4ODY4XHU2ODNDICovXG4gIGl0ZW1FdmlkZW5jZT86IFJlY29yZDxzdHJpbmcsIEl0ZW1FdmlkZW5jZVtdPjtcbiAgdGl0bGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBEaWFnbm9zaXNNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBvcHRzOiBEaWFnbm9zaXNNb2RhbE9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIG9wdHM6IERpYWdub3Npc01vZGFsT3B0aW9ucykge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoJ2JhbWJvby1kaWFnLW1vZGFsJyk7XG5cbiAgICAvLyA9PT09PSBIZWFkZXIgPT09PT1cbiAgICBjb25zdCBoZWFkZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctaGVhZGVyJyB9KTtcbiAgICBoZWFkZXIuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiB0aGlzLm9wdHMudGl0bGUgPz8gJ0FJIFx1OEJDQVx1NjVBRCBcdTAwQjcgXHU3NkVFXHU2ODA3XHU2MjY3XHU4ODRDXHU1OTBEXHU3NkQ4JyB9KTtcblxuICAgIGNvbnN0IGQgPSB0aGlzLm9wdHMuZGlhZ25vc2lzO1xuICAgIGlmICghZC5vaykge1xuICAgICAgLy8gXHU1NzRGIEpTT04gXHU1MTVDXHU1RTk1XHVGRjFBXHU1M0VBXHU1QzU1XHU3OTNBXHU3RUFGXHU2NTg3XHU2NzJDXHVGRjBDXHU0RTBEXHU2RTMyXHU2N0QzXHU0RUZCXHU0RjU1XHU3NkVFXHU2ODA3XHU1MzYxXG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6IGQucmF3VGV4dCwgY2xzOiAnYmFtYm9vLWRpYWctcmF3JyB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBNVlAtMlx1RkYxQVx1NjJBNVx1NTQ0QVx1N0VBN1x1MzAwQ1x1NEUwMFx1OTUyRVx1NUU5NFx1NzUyOFx1NTE2OFx1OTBFOFx1NUVGQVx1OEJBRVx1MzAwRFx1RkYwOFx1OERFOFx1NjI0MFx1NjcwOVx1NzZFRVx1NjgwN1x1NjI3OVx1OTFDRlx1RkYwOSA9PT09PVxuICAgIGNvbnN0IHRvdGFsU3VnZ2VzdGlvbnMgPSBkLmdvYWxzLnJlZHVjZSgobiwgZykgPT4gbiArIChnLnN1Z2dlc3Rpb25zPy5sZW5ndGggPz8gMCksIDApO1xuICAgIGlmICh0aGlzLm9wdHMub25BcHBseUFsbERpYWdub3NpcyAmJiB0b3RhbFN1Z2dlc3Rpb25zID4gMCkge1xuICAgICAgY29uc3QgYmFyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1kaWFnLWJhdGNoYmFyJyB9KTtcbiAgICAgIGNvbnN0IGJhdGNoQnRuID0gYmFyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICAgIHRleHQ6ICdcdTRFMDBcdTk1MkVcdTVFOTRcdTc1MjhcdTUxNjhcdTkwRThcdTVFRkFcdThCQUUnLFxuICAgICAgICBjbHM6ICdiYW1ib28tZGlhZy1iYXRjaC1idG4nLFxuICAgICAgfSk7XG4gICAgICBiYXRjaEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdGhpcy5vcHRzLm9uQXBwbHlBbGxEaWFnbm9zaXM/LigpO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICAgIGJhci5jcmVhdGVTcGFuKHtcbiAgICAgICAgdGV4dDogYFx1NTE3MSAke3RvdGFsU3VnZ2VzdGlvbnN9IFx1Njc2MVx1NUVGQVx1OEJBRVx1RkYwQ1x1Nzg2RVx1OEJBNFx1NTQwRVx1NUMwNlx1NEUwMFx1NkIyMVx1NjAyN1x1NjUzOVx1NTE5OVx1NUU3Nlx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN2AsXG4gICAgICAgIGNsczogJ2JhbWJvby1kaWFnLWJhdGNoLWhpbnQnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gPT09PT0gU3VtbWFyeSA9PT09PVxuICAgIGlmIChkLnN1bW1hcnkpIHtcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHsgdGV4dDogZC5zdW1tYXJ5LCBjbHM6ICdiYW1ib28tZGlhZy1zdW1tYXJ5JyB9KTtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBHb2FsIFx1NTM2MVx1NzI0N1x1NTIxN1x1ODg2OCA9PT09PVxuICAgIGZvciAoY29uc3QgZyBvZiBkLmdvYWxzKSB7XG4gICAgICB0aGlzLnJlbmRlckdvYWwoY29udGVudEVsLCBnKTtcbiAgICB9XG4gICAgLy8gbmV4dEFjdGlvbnMgXHU1REYyXHU1RTlGXHU1RjAzXHVGRjFBXHU0RTBFXHU2QkNGXHU2NzYxIHN1Z2dlc3Rpb25zIFx1OTFDRFx1NTkwRFx1RkYwOFwiXHU2MDYyXHU1OTBEXHU2QkNGXHU2NUU1XHU2MjY3XHU4ODRDXCJcdTY2MkZcdTVFRkFcdThCQUVcdTc2ODRcdTUxNDNcdTYzQ0ZcdThGRjBcdUZGMDlcdUZGMENcbiAgICAvLyBcdTRGRERcdTc1NTlcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTRFRTVcdTRGRERcdTYzMDFcdTU0MTFcdTU0MEVcdTUxN0NcdTVCQjlcdUZGMENcdTRGNDZcdTRFMERcdTU3MjggVUkgXHU2RTMyXHU2N0QzXHUzMDAyXG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tIFx1NTE4NVx1OTBFOFx1NkUzMlx1NjdEM1x1OEY4NVx1NTJBOSAtLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSByZW5kZXJHb2FsKHBhcmVudDogSFRNTEVsZW1lbnQsIGc6IEdvYWxEaWFnbm9zaXMpOiB2b2lkIHtcbiAgICAvLyBcdTY3MDlcdTUwNjVcdTVFQjdcdTUyMDZcdTY1RjZcdTRFRTVcdTMwMENcdTdCNDlcdTdFQTdcdTMwMERcdTRFM0FcdThCRURcdTRFNDlcdTRFM0JcdTgyNzJcdUZGMUJcdTU0MjZcdTUyMTlcdTU2REVcdTkwMDBcdTY1RTcgc3RhdHVzXHVGRjA4XHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA5XG4gICAgY29uc3QgaGFzSGVhbHRoID0gISFnLmxldmVsO1xuICAgIGNvbnN0IGNhcmQgPSBwYXJlbnQuY3JlYXRlRGl2KHtcbiAgICAgIGNsczogaGFzSGVhbHRoXG4gICAgICAgID8gYGJhbWJvby1kaWFnLWdvYWwgYmFtYm9vLWRpYWctZ29hbC1sZXZlbC0ke2cubGV2ZWx9YFxuICAgICAgICA6IGBiYW1ib28tZGlhZy1nb2FsIGJhbWJvby1kaWFnLWdvYWwtJHtnLnN0YXR1c31gLFxuICAgIH0pO1xuXG4gICAgLy8gSGVhZGVyXHVGRjFBXHU2ODA3XHU5ODk4ICsgXHU1RkJEXHU2ODA3XHVGRjA4XHU1MDY1XHU1RUI3XHU3QjQ5XHU3RUE3IFx1NjIxNiBcdTY1RTdcdTcyQjZcdTYwMDFcdUZGMDlcbiAgICBjb25zdCBnb2FsSGVhZGVyID0gY2FyZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1nb2FsLWhlYWRlcicgfSk7XG4gICAgZ29hbEhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6IGcudGl0bGUsIGNsczogJ2JhbWJvby1kaWFnLWdvYWwtdGl0bGUnIH0pO1xuICAgIGlmIChoYXNIZWFsdGgpIHtcbiAgICAgIGNvbnN0IGJhZGdlID0gYCR7TEVWRUxfTEFCRUxbZy5sZXZlbCBhcyBzdHJpbmddID8/IGcubGV2ZWx9JHtcbiAgICAgICAgdHlwZW9mIGcuaGVhbHRoU2NvcmUgPT09ICdudW1iZXInID8gYCBcdTAwQjcgJHtnLmhlYWx0aFNjb3JlfVx1NTIwNmAgOiAnJ1xuICAgICAgfWA7XG4gICAgICBnb2FsSGVhZGVyLmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgICB0ZXh0OiBiYWRnZSxcbiAgICAgICAgY2xzOiBgYmFtYm9vLWRpYWctbGV2ZWwgYmFtYm9vLWRpYWctbGV2ZWwtJHtnLmxldmVsfSBiYW1ib28tZGlhZy1oZWFsdGhzY29yZWAsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ29hbEhlYWRlci5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgICAgdGV4dDogU1RBVFVTX0xBQkVMW2cuc3RhdHVzXSA/PyBnLnN0YXR1cyxcbiAgICAgICAgY2xzOiBgYmFtYm9vLWRpYWctc3RhdHVzIGJhbWJvby1kaWFnLXN0YXR1cy0ke2cuc3RhdHVzfWAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTYzMDdcdTY4MDdcdUZGMDhcdTVDNjVcdTdFQTYvXHU1MkE4XHU1MjlCL1x1ODI4Mlx1NTk0Rlx1RkYwOVx1RkYwQ1x1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1OUFEOFx1NEVBRVxuICAgIGlmIChoYXNIZWFsdGgpIHtcbiAgICAgIHRoaXMucmVuZGVyRGltZW5zaW9ucyhjYXJkLCBnKTtcbiAgICB9XG5cbiAgICAvLyBcdTc0RjZcdTk4ODhcdUZGMDhcdTRFMDBcdTg4NENcdTcwNzBcdTVCNTdcdUZGMDlcbiAgICBpZiAoZy5ib3R0bGVuZWNrKSB7XG4gICAgICBjYXJkLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiBnLmJvdHRsZW5lY2ssIGNsczogJ2JhbWJvby1kaWFnLWJvdHRsZW5lY2snIH0pO1xuICAgIH1cblxuICAgIC8vIC0tLS0tIFx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1OEJDMVx1NjM2RVx1RkYxQVx1OUVEOFx1OEJBNFx1NjI5OFx1NTNFMFx1RkYwQ1x1NzBCOVx1NTFGQlx1NUM1NVx1NUYwMCAtLS0tLVxuICAgIGNvbnN0IGV2TGlzdCA9IHRoaXMub3B0cy5pdGVtRXZpZGVuY2U/LltnLnRpdGxlXTtcbiAgICBpZiAoZXZMaXN0ICYmIGV2TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbmRlckV2aWRlbmNlKGNhcmQsIGV2TGlzdCk7XG4gICAgfVxuXG4gICAgLy8gLS0tLS0gXHU1RUZBXHU4QkFFXHU1MjE3XHU4ODY4XHVGRjFBXHU2QkNGXHU2NzYxXHU3MkVDXHU3QUNCXHU4ODRDXHU1MkE4XHU1MzYxXHVGRjA4XHU2ODM4XHU1RkMzIENUQVx1RkYwOSAtLS0tLVxuICAgIGlmIChnLnN1Z2dlc3Rpb25zICYmIGcuc3VnZ2VzdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW5kZXJTdWdnZXN0aW9ucyhjYXJkLCBnKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckRpbWVuc2lvbnMocGFyZW50OiBIVE1MRWxlbWVudCwgZzogR29hbERpYWdub3Npcyk6IHZvaWQge1xuICAgIGNvbnN0IHdyYXAgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctZGltcycgfSk7XG4gICAgY29uc3QgZGltczogQXJyYXk8eyBrZXk6ICdMMScgfCAnTDInIHwgJ0wzJzsgc2NvcmU/OiBudW1iZXIgfT4gPSBbXG4gICAgICB7IGtleTogJ0wxJywgc2NvcmU6IGcuTDEgfSxcbiAgICAgIHsga2V5OiAnTDInLCBzY29yZTogZy5MMiB9LFxuICAgICAgeyBrZXk6ICdMMycsIHNjb3JlOiBnLkwzIH0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGQgb2YgZGltcykge1xuICAgICAgY29uc3QgaXNXZWFrID0gZy53ZWFrZXN0ID09PSBkLmtleTtcbiAgICAgIGNvbnN0IHNjb3JlID0gdHlwZW9mIGQuc2NvcmUgPT09ICdudW1iZXInID8gU3RyaW5nKGQuc2NvcmUpIDogJ1x1MjAxNCc7XG4gICAgICB3cmFwLmNyZWF0ZURpdih7XG4gICAgICAgIHRleHQ6IGAke0RJTV9MQUJFTFtkLmtleV19ICR7c2NvcmV9YCxcbiAgICAgICAgY2xzOiBgYmFtYm9vLWRpYWctZGltIGJhbWJvby1kaWFnLWRpbS0ke2Qua2V5fSR7aXNXZWFrID8gJyBiYW1ib28tZGlhZy1kaW0td2Vha2VzdCcgOiAnJ31gLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJFdmlkZW5jZShwYXJlbnQ6IEhUTUxFbGVtZW50LCBldkxpc3Q6IEl0ZW1FdmlkZW5jZVtdKTogdm9pZCB7XG4gICAgLy8gXHU2QzQ3XHU2MDNCXHU3RURGXHU4QkExXHVGRjFBXHU1OTFBXHU1QzExXHU1QjUwXHU5ODc5XHUzMDAxXHU1RTczXHU1NzQ3XHU1QjhDXHU2MjEwXHU1RUE2XHUzMDAxXHU1RTczXHU1NzQ3XHU4MjgyXHU1OTRGXHU1MDRGXHU1REVFXG4gICAgY29uc3Qgc3RhdHMgPSBzdW1tYXJpemUoZXZMaXN0KTtcblxuICAgIGNvbnN0IGRldGFpbHMgPSBwYXJlbnQuY3JlYXRlRWwoJ2RldGFpbHMnLCB7IGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlJyB9KTtcbiAgICBjb25zdCBzdW1tYXJ5ID0gZGV0YWlscy5jcmVhdGVFbCgnc3VtbWFyeScsIHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2Utc3VtbWFyeScgfSk7XG5cbiAgICAvLyBcdTVERTZcdTRGQTdcdUZGMUFjaGV2cm9uICsgXHU1QjUwXHU5ODc5XHU2NTcwXG4gICAgY29uc3QgbGVmdCA9IHN1bW1hcnkuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2Utc3VtbWFyeS1sZWZ0JyB9KTtcbiAgICBsZWZ0LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiAnXHUyNUI4JywgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UtY2hldnJvbicgfSk7XG4gICAgbGVmdC5jcmVhdGVTcGFuKHtcbiAgICAgIHRleHQ6IGAke2V2TGlzdC5sZW5ndGh9IFx1NEUyQVx1NUI1MFx1OTg3OSBcdTAwQjcgJHtzdGF0cy5sYWJlbH1gLFxuICAgIH0pO1xuXG4gICAgLy8gXHU1M0YzXHU0RkE3XHVGRjFBXHU1M0VGXHU2MjY3XHU4ODRDXHU2NDU4XHU4OTgxXG4gICAgc3VtbWFyeS5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IHN0YXRzLmhlYWRsaW5lLFxuICAgICAgY2xzOiBgYmFtYm9vLWRpYWctZXZpZGVuY2UtaGVhZGxpbmUgYmFtYm9vLWRpYWctZXZpZGVuY2UtaGVhZGxpbmUtJHtzdGF0cy5sZXZlbH1gLFxuICAgIH0pO1xuXG4gICAgLy8gXHU1QzU1XHU1RjAwXHU1NDBFXHVGRjFBXHU3RDI3XHU1MUQxXHU4ODY4XHU2ODNDXG4gICAgY29uc3QgbGlzdCA9IGRldGFpbHMuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UtbGlzdCcgfSk7XG4gICAgZm9yIChjb25zdCBlIG9mIGV2TGlzdCkge1xuICAgICAgdGhpcy5yZW5kZXJFdmlkZW5jZVJvdyhsaXN0LCBlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckV2aWRlbmNlUm93KHBhcmVudDogSFRNTEVsZW1lbnQsIGU6IEl0ZW1FdmlkZW5jZSk6IHZvaWQge1xuICAgIGNvbnN0IHJvdyA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1yb3cnIH0pO1xuXG4gICAgLy8gXHU1NDBEXHU1QjU3XG4gICAgcm93LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiBlLm5hbWUsIGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLW5hbWUnIH0pO1xuXG4gICAgLy8gZGFpbHlNaW5cbiAgICByb3cuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICB0ZXh0OiBlLmRhaWx5TWluIHx8ICc/JyxcbiAgICAgIGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLWNlbGwgYmFtYm9vLWRpYWctZXZpZGVuY2UtZGFpbHknLFxuICAgIH0pO1xuXG4gICAgLy8gXHU1QjhDXHU2MjEwXHU1RUE2XHVGRjFBXHU4MjcyXHU3MEI5ICsgXHU3NjdFXHU1MjA2XHU2QkQ0XG4gICAgY29uc3QgcGN0RWwgPSByb3cuY3JlYXRlU3Bhbih7IGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLWNlbGwnIH0pO1xuICAgIGNvbnN0IHBjdExldmVsID0gcGVyY2VudExldmVsKGUucGVyY2VudCk7XG4gICAgcGN0RWwuY3JlYXRlRWwoJ3NwYW4nLCB7IGNsczogYGJhbWJvby1kaWFnLWRvdCBiYW1ib28tZGlhZy1kb3QtJHtwY3RMZXZlbH1gIH0pO1xuICAgIHBjdEVsLmNyZWF0ZVNwYW4oe1xuICAgICAgdGV4dDogZS5wZXJjZW50ICE9IG51bGwgPyBgJHtlLnBlcmNlbnR9JWAgOiAnPycsXG4gICAgICBjbHM6IGBiYW1ib28tZGlhZy1ldmlkZW5jZS1wY3QgYmFtYm9vLWRpYWctZXZpZGVuY2UtcGN0LSR7cGN0TGV2ZWx9YCxcbiAgICB9KTtcblxuICAgIC8vIFx1ODI4Mlx1NTk0Rlx1NTA0Rlx1NURFRVx1RkYxQVx1ODI3Mlx1NzBCOSArIFx1MDBCMXB0XG4gICAgY29uc3QgcGFjZUVsID0gcm93LmNyZWF0ZVNwYW4oeyBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1jZWxsJyB9KTtcbiAgICBjb25zdCBwYWNlTGV2ZWwgPSBwYWNlTGV2ZWxPZihlLnBhY2VEZXZpYXRpb24pO1xuICAgIHBhY2VFbC5jcmVhdGVFbCgnc3BhbicsIHsgY2xzOiBgYmFtYm9vLWRpYWctZG90IGJhbWJvby1kaWFnLWRvdC0ke3BhY2VMZXZlbH1gIH0pO1xuICAgIHBhY2VFbC5jcmVhdGVTcGFuKHtcbiAgICAgIHRleHQ6IGUucGFjZURldmlhdGlvbiAhPSBudWxsID8gYCR7Zm10U2lnbmVkKGUucGFjZURldmlhdGlvbil9cHRgIDogJz8nLFxuICAgICAgY2xzOiBgYmFtYm9vLWRpYWctZXZpZGVuY2UtcGFjZSBiYW1ib28tZGlhZy1ldmlkZW5jZS1wYWNlLSR7cGFjZUxldmVsfWAsXG4gICAgfSk7XG5cbiAgICAvLyBcdTUxNDNcdTRGRTFcdTYwNkZcbiAgICByb3cuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICB0ZXh0OiBgJHtlLmRvbmVEYXlzfSBcdTU5Mjkke2UubGFzdERvbmUgPyAnIFx1MDBCNyAnICsgZS5sYXN0RG9uZSA6ICcnfWAsXG4gICAgICBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1mb290JyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU3VnZ2VzdGlvbnMocGFyZW50OiBIVE1MRWxlbWVudCwgZ29hbDogR29hbERpYWdub3Npcyk6IHZvaWQge1xuICAgIGNvbnN0IHN1Z2dXcmFwID0gcGFyZW50LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1kaWFnLXN1Z2dlc3Rpb25zJyB9KTtcbiAgICBjb25zdCB0aXRsZSA9IHN1Z2dXcmFwLmNyZWF0ZUVsKCdoNCcsIHtcbiAgICAgIHRleHQ6IGBcdTVFRkFcdThCQUVcdUZGMDgke2dvYWwuc3VnZ2VzdGlvbnMubGVuZ3RofVx1RkYwOWAsXG4gICAgICBjbHM6ICdiYW1ib28tZGlhZy1zdWdnZXN0aW9ucy10aXRsZScsXG4gICAgfSk7XG4gICAgLy8gXHU3RUY0XHU1RUE2XHU2ODA3XHU3QjdFXHVGRjFBXHU1RUZBXHU4QkFFXHU1RTk0XHU1NkY0XHU3RUQ1XHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHU1QzU1XHU1RjAwXHVGRjA4XHU2NzY1XHU4MUVBIGcud2Vha2VzdFx1RkYxQlx1NjVFMFx1NTIxOVx1NjVFN1x1NjU3MFx1NjM2RVx1RkYwQ1x1NEUwRFx1NjYzRVx1NzkzQVx1RkYwOVxuICAgIGlmIChnb2FsLndlYWtlc3QgJiYgRElNX0xBQkVMW2dvYWwud2Vha2VzdF0pIHtcbiAgICAgIHRpdGxlLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBgXHU4MDVBXHU3MTI2JHtESU1fTEFCRUxbZ29hbC53ZWFrZXN0XX1gLFxuICAgICAgICBjbHM6IGBiYW1ib28tZGlhZy1mb2N1cy1kaW0gYmFtYm9vLWRpYWctZm9jdXMtZGltLSR7Z29hbC53ZWFrZXN0fWAsXG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gXHUzMDBDXHU1RTk0XHU3NTI4XHU1MTY4XHU5MEU4XHUzMDBEXHVGRjFBXHU0RTAwXHU2QjIxXHU2MDI3XHU1RTk0XHU3NTI4XHU4QkU1IGdvYWwgXHU3Njg0XHU1MTY4XHU5MEU4XHU1RUZBXHU4QkFFXHVGRjA4IzdcdUZGMENcdTc4NkVcdTVCOUFcdTYwMjdcdTkwMTBcdTY3NjFcdTVFOTRcdTc1MjhcdUZGMDlcbiAgICBpZiAodGhpcy5vcHRzLm9uQXBwbHlBbGwgJiYgZ29hbC5zdWdnZXN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBhbGxCdG4gPSBzdWdnV3JhcC5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgICB0ZXh0OiAnXHU1RTk0XHU3NTI4XHU1MTY4XHU5MEU4JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLWRpYWctYXBwbHktYWxsJyxcbiAgICAgIH0pO1xuICAgICAgYWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLm9wdHMub25BcHBseUFsbD8uKGdvYWwpO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBzIG9mIGdvYWwuc3VnZ2VzdGlvbnMpIHtcbiAgICAgIHRoaXMucmVuZGVyU3VnZ2VzdGlvblJvdyhzdWdnV3JhcCwgcywgZ29hbCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTdWdnZXN0aW9uUm93KFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgczogU3VnZ2VzdGlvbixcbiAgICBnb2FsOiBHb2FsRGlhZ25vc2lzXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHJvdyA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1zdWdnZXN0aW9uJyB9KTtcbiAgICByb3cuY3JlYXRlRWwoJ2RpdicsIHsgdGV4dDogcy50ZXh0LCBjbHM6ICdiYW1ib28tZGlhZy1zdWdnZXN0aW9uLXRleHQnIH0pO1xuICAgIC8vIFx1N0VGNFx1NUVBNlx1NjgwN1x1N0I3RVx1RkYwOFx1NUVGQVx1OEJBRVx1ODA1QVx1NzEyNlx1N0VGNFx1NUVBNlx1RkYwOVxuICAgIGlmIChzLmRpbWVuc2lvbiAmJiBESU1fTEFCRUxbcy5kaW1lbnNpb25dKSB7XG4gICAgICByb3cuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IERJTV9MQUJFTFtzLmRpbWVuc2lvbl0sXG4gICAgICAgIGNsczogYGJhbWJvby1kaWFnLWZvY3VzLWRpbSBiYW1ib28tZGlhZy1mb2N1cy1kaW0tJHtzLmRpbWVuc2lvbn1gLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGJ0biA9IHJvdy5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1NUU5NFx1NzUyOCcsXG4gICAgICBjbHM6ICdiYW1ib28tZGlhZy1hcHBseScsXG4gICAgfSk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5vcHRzLm9uQXBwbHkoZ29hbCwgcyk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLSBcdTdFQUZcdTUxRkRcdTY1NzBcdThGODVcdTUyQTkgLS0tLS0tLS0tLVxuXG50eXBlIExldmVsID0gJ2xvdycgfCAnbWlkJyB8ICdoaWdoJyB8ICduZXV0cmFsJyB8ICdwb3MnIHwgJ25lZyc7XG5cbmZ1bmN0aW9uIHBlcmNlbnRMZXZlbChwOiBudW1iZXIgfCBudWxsKTogTGV2ZWwge1xuICBpZiAocCA9PSBudWxsKSByZXR1cm4gJ25ldXRyYWwnO1xuICBpZiAocCA8IDMwKSByZXR1cm4gJ2xvdyc7XG4gIGlmIChwIDwgNzApIHJldHVybiAnbWlkJztcbiAgcmV0dXJuICdoaWdoJztcbn1cblxuZnVuY3Rpb24gcGFjZUxldmVsT2YocDogbnVtYmVyIHwgbnVsbCk6IExldmVsIHtcbiAgaWYgKHAgPT0gbnVsbCkgcmV0dXJuICduZXV0cmFsJztcbiAgaWYgKHAgPiAwKSByZXR1cm4gJ3Bvcyc7XG4gIGlmIChwIDwgMCkgcmV0dXJuICduZWcnO1xuICByZXR1cm4gJ25ldXRyYWwnO1xufVxuXG5mdW5jdGlvbiBmbXRTaWduZWQobjogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIG4gPiAwID8gYCske259YCA6IGAke259YDtcbn1cblxuLyoqIFx1OEJDMVx1NjM2RVx1NkM0N1x1NjAzQlx1RkYxQVx1NzUyOFx1NEU4RVx1NjI5OFx1NTNFMFx1NjAwMVx1NEUwQlx1NzY4NFx1NEUwMFx1ODg0Q1x1Njk4Mlx1ODlDOCAqL1xuZnVuY3Rpb24gc3VtbWFyaXplKGV2TGlzdDogSXRlbUV2aWRlbmNlW10pOiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGhlYWRsaW5lOiBzdHJpbmc7XG4gIGxldmVsOiAnZ29vZCcgfCAnd2FybicgfCAnYmFkJyB8ICduZXV0cmFsJztcbn0ge1xuICBjb25zdCBwY3RzID0gZXZMaXN0Lm1hcCgoZSkgPT4gZS5wZXJjZW50KS5maWx0ZXIoKHApOiBwIGlzIG51bWJlciA9PiBwICE9IG51bGwpO1xuICBjb25zdCBwYWNlcyA9IGV2TGlzdFxuICAgIC5tYXAoKGUpID0+IGUucGFjZURldmlhdGlvbilcbiAgICAuZmlsdGVyKChwKTogcCBpcyBudW1iZXIgPT4gcCAhPSBudWxsKTtcbiAgaWYgKHBjdHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHsgbGFiZWw6ICdcdTY1RTBcdTY1NzBcdTYzNkUnLCBoZWFkbGluZTogJ1x1NjVFMFx1NjU3MFx1NjM2RScsIGxldmVsOiAnbmV1dHJhbCcgfTtcbiAgfVxuICBjb25zdCBhdmdQY3QgPSBNYXRoLnJvdW5kKHBjdHMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyBwY3RzLmxlbmd0aCk7XG4gIGNvbnN0IGF2Z1BhY2UgPVxuICAgIHBhY2VzLmxlbmd0aCA+IDBcbiAgICAgID8gTWF0aC5yb3VuZChwYWNlcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIHBhY2VzLmxlbmd0aClcbiAgICAgIDogMDtcbiAgY29uc3QgYWxsWmVybyA9IGV2TGlzdC5ldmVyeSgoZSkgPT4gZS5kb25lRGF5cyA9PT0gMCk7XG4gIGlmIChhbGxaZXJvKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiAnXHU4RkQxIDcgXHU1OTI5IDAgXHU1QjhDXHU2MjEwJyxcbiAgICAgIGhlYWRsaW5lOiAnXHU1MTY4XHU5MEU4XHU1MDVDXHU2RURFJyxcbiAgICAgIGxldmVsOiAnYmFkJyxcbiAgICB9O1xuICB9XG4gIGlmIChhdmdQY3QgPj0gNzApIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6IGBcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTVFQTYgJHthdmdQY3R9JWAsXG4gICAgICBoZWFkbGluZTogJ1x1NjU3NFx1NEY1M1x1OEZCRVx1NjgwNycsXG4gICAgICBsZXZlbDogJ2dvb2QnLFxuICAgIH07XG4gIH1cbiAgaWYgKGF2Z1BhY2UgPCAtMTApIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6IGBcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTVFQTYgJHthdmdQY3R9JSBcdTAwQjcgXHU4MjgyXHU1OTRGICR7Zm10U2lnbmVkKGF2Z1BhY2UpfXB0YCxcbiAgICAgIGhlYWRsaW5lOiAnXHU0RTI1XHU5MUNEXHU2RURFXHU1NDBFJyxcbiAgICAgIGxldmVsOiAnYmFkJyxcbiAgICB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgbGFiZWw6IGBcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTVFQTYgJHthdmdQY3R9JSBcdTAwQjcgXHU4MjgyXHU1OTRGICR7Zm10U2lnbmVkKGF2Z1BhY2UpfXB0YCxcbiAgICBoZWFkbGluZTogJ1x1OTcwMFx1ODk4MVx1NTE3M1x1NkNFOCcsXG4gICAgbGV2ZWw6ICd3YXJuJyxcbiAgfTtcbn1cbiIsICIvKipcbiAqIFN1Z2dlc3Rpb25BcHBseU1vZGFsIFx1MjAxNCBcdTdFRDNcdTY3ODRcdTUzMTZcdTVFRkFcdThCQUVcdTc2ODRcdTMwMENcdTY1MzlcdTUyQThcdTk4ODRcdTg5QzggLyBcdTRFQkFcdTVERTVcdTk1RjhcdTk1RThcdTMwMERcdUZGMDgjN1x1RkYwOVxuICpcbiAqIFx1NTMzQVx1NTIyQlx1NEU4RSBBZ2VudGljUGxhbk1vZGFsXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTBEXHU1MDVBIEFJIFx1NTE4RFx1ODlFM1x1OTFDQVx1RkYwQ1x1NTNFQVx1NjYyRlx1NjI4QSBhcHBseVN1Z2dlc3Rpb24gXHU3Njg0XG4gKiBcdTc4NkVcdTVCOUFcdTYwMjdcdTdFRDNcdTY3OUMqKlx1NTM5Rlx1NjgzN1x1NTQ0OFx1NzNCMCoqXHU3RUQ5XHU3NTI4XHU2MjM3XHU3NzBCXHUzMDBDXHU1MjMwXHU1RTk1XHU1NDdEXHU0RTJEXHU0RTg2XHU1NEVBXHU0RTJBXHU3NkVFXHU2ODA3L1x1NUI1MFx1OTg3OVx1MzAwMVx1NjUzOVx1NEU4Nlx1NEVDMFx1NEU0OFx1MzAwRFx1RkYwQ1xuICogXHU3NTMxXHU3NTI4XHU2MjM3XHU3ODZFXHU4QkE0XHU1NDBFXHU4NDNEXHU1RTkzXHUzMDAyXHU0RkREXHU3NTU5IGRpYWdub3Npcy1hY3Rpb24tbG9vcC1kZXNpZ24gXHUwMEE3NyBcdTc2ODRcdTMwMENcdTRFQkFcdTVERTVcdTc4NkVcdThCQTRcdTY2MkZcdTY3MDBcdTU0MEVcdTk1RjhcdTk1RThcdTMwMERcdTMwMDJcbiAqXG4gKiBcdTUzRUZcdTkwMDlcdTMwMENcdTc1MjggQUkgXHU4QzAzXHU2NTc0XHUzMDBEXHVGRjFBXHU2MjhBXHU1REYyXHU3ODZFXHU1QjlBXHU2MDI3XHU2NTM5XHU1MTk5XHU3Njg0XHU2ODExXHU0RUE0XHU3RUQ5IEFnZW50aWNQbGFuTW9kYWwgXHU3RUU3XHU3RUVEXHU3Q0JFXHU0RkVFXG4gKiBcdUZGMDhcdTRFQzVcdTVGNTNcdTc1MjhcdTYyMzdcdTYwRjNcdTg5ODFcdTY1RjZcdUZGMENcdTlFRDhcdThCQTRcdThENzBcdTc4NkVcdTVCOUFcdTYwMjdcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTVGMTVcdTUxNjUgQUkgXHU3MzFDXHU2RDRCXHVGRjA5XHUzMDAyXG4gKi9cbmltcG9ydCB7IE1vZGFsLCBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEdvYWxJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5pbXBvcnQgdHlwZSB7IFN1Z2dlc3Rpb24sIFN1Z2dlc3Rpb25BY3Rpb24gfSBmcm9tICcuL1N1Z2dlc3Rpb24nO1xuXG5jb25zdCBBQ1RJT05fTEFCRUw6IFJlY29yZDxTdWdnZXN0aW9uQWN0aW9uLCBzdHJpbmc+ID0ge1xuICBhZGp1c3RfZGFpbHlNaW46ICdcdThDMDNcdTY1NzRcdTZCQ0ZcdTY1RTVcdTkxQ0YnLFxuICByZW1vdmVfc3ViaXRlbTogJ1x1NTIyMFx1OTY2NFx1NUI1MFx1OTg3OScsXG4gIGFkZF9zdWJpdGVtOiAnXHU2NUIwXHU1ODlFXHU1QjUwXHU5ODc5JyxcbiAgbm90ZTogJ1x1NTkwN1x1NkNFOCcsXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFN1Z2dlc3Rpb25BcHBseU9wdGlvbnMge1xuICBzdWdnZXN0aW9uczogU3VnZ2VzdGlvbltdO1xuICAvKiogXHU2NTM5XHU1MTk5XHU1MjREXHVGRjA4XHU3NTI4XHU0RThFXHU2NjNFXHU3OTNBIGJlZm9yZVx1MjE5MmFmdGVyIFx1NURFRVx1NTAzQ1x1RkYwOSAqL1xuICBiZWZvcmU6IEdvYWxJdGVtW107XG4gIC8qKiBcdTc4NkVcdTVCOUFcdTYwMjdcdTY1MzlcdTUxOTlcdTU0MEVcdUZGMDhcdTc4NkVcdThCQTRcdTUzNzNcdTg0M0RcdTVFOTNcdUZGMDkgKi9cbiAgYWZ0ZXI6IEdvYWxJdGVtW107XG4gIG9uQ29uZmlybTogKGdvYWxzOiBHb2FsSXRlbVtdKSA9PiB2b2lkO1xuICAvKiogXHU1M0VGXHU5MDA5XHVGRjFBXHU3NTI4IEFJIFx1NTcyOFx1NURGMlx1NjUzOVx1NTE5OVx1NjgxMVx1NEUwQVx1N0VFN1x1N0VFRFx1N0NCRVx1NEZFRSAqL1xuICBvbkVzY2FsYXRlQUk/OiAoZ29hbHM6IEdvYWxJdGVtW10pID0+IHZvaWQ7XG4gIHRpdGxlPzogc3RyaW5nO1xufVxuXG4vKiogXHU1M0Q2XHU2N0QwIGdvYWwgXHU0RTBCXHUzMDAxXHU2MzA5IHN1Z2dlc3Rpb24udGFyZ2V0IFx1NTQ3RFx1NEUyRFx1NzY4NFx1NUI1MFx1OTg3OSAqL1xuZnVuY3Rpb24gZmluZEl0ZW0oZ29hbHM6IEdvYWxJdGVtW10sIHM6IFN1Z2dlc3Rpb24pOiB7IG5hbWU6IHN0cmluZzsgZGFpbHlNaW4/OiBzdHJpbmcgfSB8IG51bGwge1xuICBjb25zdCBnb2FsID0gZ29hbHMuZmluZChcbiAgICAoZykgPT4gKHMuZ29hbFJlZi5nb2FsSWQgIT0gbnVsbCAmJiBnLmlkID09PSBzLmdvYWxSZWYuZ29hbElkKSB8fCBnLnRpdGxlID09PSBzLmdvYWxSZWYuZ29hbFRpdGxlXG4gICk7XG4gIGlmICghZ29hbCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGl0ZW1zID0gZ29hbC5pdGVtcyA/PyBbXTtcbiAgbGV0IGlkeCA9IC0xO1xuICBpZiAocy50YXJnZXQ/LnN1Ykl0ZW1OYW1lICE9IG51bGwpIGlkeCA9IGl0ZW1zLmZpbmRJbmRleCgoaSkgPT4gaS5uYW1lID09PSBzLnRhcmdldCEuc3ViSXRlbU5hbWUpO1xuICBlbHNlIGlmIChzLnRhcmdldD8uc3ViSXRlbUluZGV4ICE9IG51bGwpIGlkeCA9IHMudGFyZ2V0LnN1Ykl0ZW1JbmRleDtcbiAgaWYgKGlkeCA8IDAgfHwgaWR4ID49IGl0ZW1zLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB7IG5hbWU6IGl0ZW1zW2lkeF0ubmFtZSwgZGFpbHlNaW46IGl0ZW1zW2lkeF0uZGFpbHlNaW4gfTtcbn1cblxuZnVuY3Rpb24gZGVzY3JpYmVIaXQoYmVmb3JlOiBHb2FsSXRlbVtdLCBhZnRlcjogR29hbEl0ZW1bXSwgczogU3VnZ2VzdGlvbik6IHN0cmluZyB7XG4gIGNvbnN0IHRhcmdldCA9IHMudGFyZ2V0Py5zdWJJdGVtTmFtZVxuICAgID8gcy50YXJnZXQuc3ViSXRlbU5hbWVcbiAgICA6IHMudGFyZ2V0Py5zdWJJdGVtSW5kZXggIT0gbnVsbFxuICAgICAgPyBgXHU3QjJDICR7cy50YXJnZXQuc3ViSXRlbUluZGV4fSBcdTRFMkFcdTVCNTBcdTk4NzlgXG4gICAgICA6ICdcdUZGMDhcdTc2RUVcdTY4MDdcdTdFQTdcdUZGMDknO1xuICBjb25zdCBwYXJ0cyA9IFtcbiAgICBgXHU3NkVFXHU2ODA3XHUzMDBDJHtzLmdvYWxSZWYuZ29hbFRpdGxlID8/ICcoXHU2NzJBXHU1NDdEXHU1NDBEXHU3NkVFXHU2ODA3KSd9XHUzMDBEYCxcbiAgICBgXHU1QjUwXHU5ODc5XHUzMDBDJHt0YXJnZXR9XHUzMDBEYCxcbiAgICBBQ1RJT05fTEFCRUxbcy5hY3Rpb25dLFxuICBdO1xuICBpZiAocy5hY3Rpb24gPT09ICdhZGp1c3RfZGFpbHlNaW4nKSB7XG4gICAgY29uc3QgYiA9IGZpbmRJdGVtKGJlZm9yZSwgcyk7XG4gICAgY29uc3QgYSA9IGZpbmRJdGVtKGFmdGVyLCBzKTtcbiAgICBjb25zdCBvbGRWID0gYj8uZGFpbHlNaW4gPz8gJz8nO1xuICAgIGNvbnN0IG5ld1YgPSBhPy5kYWlseU1pbiA/PyAnPyc7XG4gICAgcGFydHMucHVzaChgZGFpbHlNaW4gJHtvbGRWfSBcdTIxOTIgJHtuZXdWfWApO1xuICB9IGVsc2UgaWYgKHMuYWN0aW9uID09PSAnYWRkX3N1Yml0ZW0nICYmIHMucGFyYW1zPy5uYW1lKSB7XG4gICAgcGFydHMucHVzaChcbiAgICAgIGBcdTY1QjBcdTU4OUVcdTMwMEMke3MucGFyYW1zLm5hbWV9XHUzMDBEJHtzLnBhcmFtcy5kYWlseU1pbiAhPSBudWxsID8gYCBkYWlseU1pbj0ke3MucGFyYW1zLmRhaWx5TWlufWAgOiAnJ31gXG4gICAgKTtcbiAgfSBlbHNlIGlmIChzLmFjdGlvbiA9PT0gJ3JlbW92ZV9zdWJpdGVtJykge1xuICAgIHBhcnRzLnB1c2goJ1x1NUMwNlx1NzlGQlx1OTY2NFx1OEJFNVx1NUI1MFx1OTg3OScpO1xuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCcgXHUwMEI3ICcpO1xufVxuXG5leHBvcnQgY2xhc3MgU3VnZ2VzdGlvbkFwcGx5TW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgb3B0czogU3VnZ2VzdGlvbkFwcGx5T3B0aW9ucztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgb3B0czogU3VnZ2VzdGlvbkFwcGx5T3B0aW9ucykge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoJ2JhbWJvby1zdWdnLWFwcGx5LW1vZGFsJyk7XG5cbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiB0aGlzLm9wdHMudGl0bGUgPz8gJ1x1NUU5NFx1NzUyOFx1OEJDQVx1NjVBRFx1NUVGQVx1OEJBRScgfSk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1x1NEVFNVx1NEUwQlx1NEUzQVx1Nzg2RVx1NUI5QVx1NjAyN1x1NjUzOVx1NTE5OVx1OTg4NFx1ODlDOFx1RkYwOFx1NURGMlx1N0NCRVx1NTFDNlx1NTQ3RFx1NEUyRFx1NTE3N1x1NEY1M1x1NUI1MFx1OTg3OVx1RkYwOVx1RkYwQ1x1Nzg2RVx1OEJBNFx1NTQwRVx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1NUU5M1x1MzAwMicsXG4gICAgICBjbHM6ICdiYW1ib28tc3VnZy1hcHBseS1kZXNjJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGxpc3QgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLXN1Z2ctYXBwbHktbGlzdCcgfSk7XG4gICAgZm9yIChjb25zdCBzIG9mIHRoaXMub3B0cy5zdWdnZXN0aW9ucykge1xuICAgICAgY29uc3Qgcm93ID0gbGlzdC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tc3VnZy1hcHBseS1yb3cnIH0pO1xuICAgICAgcm93LmNyZWF0ZVNwYW4oeyB0ZXh0OiBzLnRleHQsIGNsczogJ2JhbWJvby1zdWdnLWFwcGx5LXRleHQnIH0pO1xuICAgICAgcm93LmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBkZXNjcmliZUhpdCh0aGlzLm9wdHMuYmVmb3JlLCB0aGlzLm9wdHMuYWZ0ZXIsIHMpLFxuICAgICAgICBjbHM6ICdiYW1ib28tc3VnZy1hcHBseS1oaXQnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1zdWdnLWFwcGx5LWZvb3RlcicgfSk7XG4gICAgY29uc3QgY29uZmlybSA9IGZvb3Rlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1Nzg2RVx1OEJBNFx1NTE5OVx1NTE2NScsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1idG4gYmFtYm9vLWFpLXBsYW4tYnRuLXByaW1hcnknLFxuICAgIH0pO1xuICAgIGNvbmZpcm0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICB0aGlzLm9wdHMub25Db25maXJtKHRoaXMub3B0cy5hZnRlcik7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRzLm9uRXNjYWxhdGVBSSkge1xuICAgICAgY29uc3QgYWkgPSBmb290ZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgICAgdGV4dDogJ1x1NzUyOCBBSSBcdThDMDNcdTY1NzQnLFxuICAgICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1idG4gYmFtYm9vLWFpLXBsYW4tYnRuLWdob3N0JyxcbiAgICAgIH0pO1xuICAgICAgYWkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub3B0cy5vbkVzY2FsYXRlQUk/Lih0aGlzLm9wdHMuYWZ0ZXIpO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBjYW5jZWwgPSBmb290ZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICdcdTUzRDZcdTZEODgnLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYnRuIGJhbWJvby1haS1wbGFuLWJ0bi1naG9zdCcsXG4gICAgfSk7XG4gICAgY2FuY2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jbG9zZSgpKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgIi8qKlxuICogR29hbERpYWdub3NlciBcdTIwMTQgQUkgXHU4QkNBXHU2NUFEXHVGRjA4XHU2M0QyXHU0RUY2XHU0RkE3XHU3RUFGXHU5MDNCXHU4RjkxXHVGRjA5XG4gKlxuICogXHU4MDRDXHU4RDIzXHU4RkI5XHU3NTRDXHVGRjA4XHU0RTBFXHU0RUE3XHU1NEMxXHU1NEYyXHU1QjY2XHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFBXG4gKiAgLSBEZXZpYXRpb25DYWxjdWxhdG9yIFx1N0I5N1x1MzAwQ1x1Nzg2Q1x1NjMwN1x1NjgwN1x1MzAwRFx1RkYwOFx1NTA0Rlx1NURFRS9cdTUwNUNcdTZFREUvXHU4RDhCXHU1MkJGXHVGRjA5XHVGRjBDXHU2NzJDXHU2QTIxXHU1NzU3XHU4RDFGXHU4RDIzXHUzMDBDXHU0RTNBXHU0RUMwXHU0RTQ4ICsgXHU2MDBFXHU0RTQ4XHU4QzAzXHUzMDBEXHU3Njg0XHU1RjUyXHU1NkUwXHVGRjFCXG4gKiAgLSBcdTU5MERcdTc1MjggUGxhbm5pbmdTZXNzaW9uIFx1NzY4NCBDaGF0TWVzc2FnZSBcdTdDN0JcdTU3OEJcdTRFMEUgZXh0cmFjdENoYXRUZXh0XHVGRjBDXHU1MTY4XHU3QTBCIHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMUJcbiAqICAtIFx1NTc0RiBKU09OIFx1MjE5MiBcdTU2REVcdTkwMDAgcmF3VGV4dCBcdTdFQUZcdTY1ODdcdTY3MkNcdUZGMENcdTdFRERcdTRFMERcdTVEMjlcdTZFODNcdUZGMDhcdTRFMEUgUGxhbm5pbmdTZXNzaW9uIFx1NUJCOVx1OTUxOVx1ODMwM1x1NUYwRlx1NEUwMFx1ODFGNFx1RkYwOVx1MzAwMlxuICpcbiAqIFx1OTZGNiBPYnNpZGlhbiBcdTRGOURcdThENTZcdUZGMENmZXRjaEZuIFx1NTNFRlx1NkNFOFx1NTE2NVx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1MzAwMlxuICovXG5pbXBvcnQgeyByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBDaGF0TWVzc2FnZSB9IGZyb20gJy4vUGxhbm5pbmdTZXNzaW9uJztcbmltcG9ydCB7IGV4dHJhY3RDaGF0VGV4dCB9IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcbmltcG9ydCB0eXBlIHsgQWlGZXRjaEZuLCBBaVJlc3BvbnNlLCBQbGFubmVyU2V0dGluZ3MgfSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQge1xuICBidWlsZENhY2hlLFxuICBzdW1tYXJpemUsXG4gIGZvcm1hdEl0ZW1FdmlkZW5jZUZvclByb21wdCxcbiAgdHlwZSBEZXZpYXRpb25DYWNoZSxcbn0gZnJvbSAnLi9EZXZpYXRpb25DYWxjdWxhdG9yJztcbmltcG9ydCB7XG4gIGNvbXB1dGVHb2FsSGVhbHRoLFxuICBnZW5lcmF0ZUhlYWx0aEhpbnRzLFxuICB3ZWFrZXN0RGltZW5zaW9uLFxuICB0eXBlIEhlYWx0aExldmVsLFxuICB0eXBlIEhlYWx0aERpbWVuc2lvbixcbn0gZnJvbSAnLi9oZWFsdGhTY29yZSc7XG5pbXBvcnQgdHlwZSB7IERheURhdGEsIEdvYWxJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5pbXBvcnQgdHlwZSB7IFN1Z2dlc3Rpb24gfSBmcm9tICcuL1N1Z2dlc3Rpb24nO1xuXG5leHBvcnQgdHlwZSBEaWFnbm9zaXNTdGF0dXMgPSAnb25fdHJhY2snIHwgJ2JlaGluZCcgfCAnc3R1Y2snIHwgJ2RvbmUnIHwgJ2F0X3Jpc2snO1xuXG4vKiogXHU0RTA5XHU3RUY0XHU1MDY1XHU1RUI3XHU1MjA2XHU3RUY0XHU1RUE2XHU0RTJEXHU2NTg3XHU2ODA3XHU3QjdFXHVGRjA4XHU0RjlCXHU2M0QwXHU3OTNBXHU4QkNEL1x1NjQ1OFx1ODk4MVx1NTkwRFx1NzUyOFx1NTA2NVx1NUVCN1x1NTM2MVx1NzI0N1x1OEJDRFx1NkM0N1x1RkYwOSAqL1xuY29uc3QgRElNRU5TSU9OX0xBQkVMOiBSZWNvcmQ8SGVhbHRoRGltZW5zaW9uLCBzdHJpbmc+ID0ge1xuICBMMTogJ1x1NUM2NVx1N0VBNlx1ODBGRFx1NTI5QicsXG4gIEwyOiAnXHU4RDhCXHU1MkJGXHU1MkE4XHU1MjlCJyxcbiAgTDM6ICdcdTUzRUZcdTYzMDFcdTdFRURcdTVFQTYnLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBHb2FsRGlhZ25vc2lzIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgY29tcGxldGlvbj86IG51bWJlcjtcbiAgc3RhdHVzOiBEaWFnbm9zaXNTdGF0dXM7XG4gIC8qKiBcdTUwNjVcdTVFQjdcdTUyMDZcdTYwM0JcdTUyMDYgMC0xMDBcdUZGMDhcdTY3NjVcdTgxRUFcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTZBMjFcdTU3OEJcdUZGMENBSSBcdTVGNTJcdTU2RTBcdTVFOTRcdTU3RkFcdTRFOEVcdTZCNjRcdTgwMENcdTk3NUVcdTMwMENcdTY2MkZcdTU0MjZcdTg0M0RcdTU0MEVcdTMwMERcdUZGMDkgKi9cbiAgaGVhbHRoU2NvcmU/OiBudW1iZXI7XG4gIC8qKiBcdTUwNjVcdTVFQjdcdTdCNDlcdTdFQTdcdUZGMDhcdTRGMThcdTc5QzAvXHU4MjZGXHU1OTdEL1x1OTcwMFx1NTE3M1x1NkNFOC9cdTk4Q0VcdTk2NjlcdUZGMDkgKi9cbiAgbGV2ZWw/OiBIZWFsdGhMZXZlbDtcbiAgLyoqIEwxIFx1NUM2NVx1N0VBNlx1ODBGRFx1NTI5Qlx1NTIwNiAqL1xuICBMMT86IG51bWJlcjtcbiAgLyoqIEwyIFx1OEQ4Qlx1NTJCRlx1NTJBOFx1NTI5Qlx1NTIwNiAqL1xuICBMMj86IG51bWJlcjtcbiAgLyoqIEwzIFx1NTNFRlx1NjMwMVx1N0VFRFx1NUVBNlx1NTIwNiAqL1xuICBMMz86IG51bWJlcjtcbiAgLyoqIFx1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1RkYxQVx1OEJDQVx1NjVBRFx1NEUwRVx1NUVGQVx1OEJBRVx1NUU5NFx1ODA1QVx1NzEyNlx1NEU4RVx1NkI2NCAqL1xuICB3ZWFrZXN0PzogSGVhbHRoRGltZW5zaW9uO1xuICBib3R0bGVuZWNrPzogc3RyaW5nO1xuICAvKiogXHU3RUQzXHU2Nzg0XHU1MzE2XHU1RUZBXHU4QkFFXHVGRjFBXHU2QkNGXHU2NzYxXHU3Q0JFXHU1MUM2XHU1NDdEXHU0RTJEXHU1MTc3XHU0RjUzXHU1QjUwXHU5ODc5XHVGRjA4IzdcdUZGMDlcdUZGMENcdTVGMDNcdTc1MjhcdTY1RTdcdTc2ODRcdTgxRUFcdTcxMzZcdThCRURcdThBMDAgc3RyaW5nW10gKi9cbiAgc3VnZ2VzdGlvbnM6IFN1Z2dlc3Rpb25bXTtcbiAgLyoqIFx1NjcyQ1x1OEJDQVx1NjVBRFx1ODA1QVx1NzEyNlx1NzY4NFx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NTQwRFx1RkYwOFx1NUZDNVx1OTg3Qlx1Njc2NVx1ODFFQVx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NkUwNVx1NTM1NVx1RkYwQ1x1Nzk4MVx1NkI2Mlx1N0YxNlx1OTAyMFx1RkYwOSAqL1xuICBldmlkZW5jZVJlZj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaWFnbm9zaXMge1xuICBvazogdHJ1ZTtcbiAgc3VtbWFyeTogc3RyaW5nO1xuICBnb2FsczogR29hbERpYWdub3Npc1tdO1xuICBuZXh0QWN0aW9uczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmF3RGlhZ25vc2lzIHtcbiAgb2s6IGZhbHNlO1xuICByYXdUZXh0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIERpYWdub3Npc1Jlc3VsdCA9IERpYWdub3NpcyB8IFJhd0RpYWdub3NpcztcblxuY29uc3QgVkFMSURfU1RBVFVTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICdvbl90cmFjaycsXG4gICdiZWhpbmQnLFxuICAnc3R1Y2snLFxuICAnZG9uZScsXG4gICdhdF9yaXNrJyxcbl0pO1xuXG5jb25zdCBWQUxJRF9MRVZFTDogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoWydleGNlbGxlbnQnLCAnZ29vZCcsICd3YXJuaW5nJywgJ3Jpc2snXSk7XG5jb25zdCBWQUxJRF9ESU1FTlNJT046IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFsnTDEnLCAnTDInLCAnTDMnXSk7XG5cbmZ1bmN0aW9uIGFzU3RyaW5nQXJyYXkodjogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHYpKSByZXR1cm4gW107XG4gIHJldHVybiB2LmZpbHRlcigoeCkgPT4gdHlwZW9mIHggPT09ICdzdHJpbmcnKSBhcyBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gYXNOdW1iZXIodjogdW5rbm93bik6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKHYpID8gdiA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTAgc3VnZ2VzdGlvbnNcdUZGMUFcdTUxN0NcdTVCQjlcdTY1RTdcdTc2ODRcdTgxRUFcdTcxMzZcdThCRURcdThBMDAgc3RyaW5nW10gXHU0RTBFXHU2NUIwXHU3Njg0XHU3RUQzXHU2Nzg0XHU1MzE2XHU1QkY5XHU4QzYxW11cdTMwMDJcbiAqIC0gXHU2NUU3IHN0cmluZyBcdTIxOTIgXHU1MzA1XHU2MjEwIHsgYWN0aW9uOidub3RlJywgdGV4dCB9XHVGRjA4XHU0RUM1XHU1QzU1XHU3OTNBXHVGRjBDXHU0RTBEXHU4OUU2XHU1M0QxXHU3RUQzXHU2Nzg0XHU2NTM5XHU1MkE4XHVGRjA5XHVGRjFCXG4gKiAtIFx1NjVCMFx1NUJGOVx1OEM2MSBcdTIxOTIgXHU2MkJEXHU1M0Q2IGFjdGlvbi9nb2FsUmVmL3RhcmdldC9wYXJhbXNcdUZGMENcdTk3NUVcdTZDRDUgYWN0aW9uIFx1OUVEOFx1OEJBNCAnbm90ZSdcdUZGMENcbiAqICAgXHU2NzJBXHU3RUQ5IGdvYWxSZWYuZ29hbFRpdGxlIFx1NjVGNlx1NTZERVx1OTAwMFx1NTIzMFx1NjI0MFx1NUM1RSBnb2FsIFx1NzY4NCB0aXRsZVx1MzAwMlxuICovXG5jb25zdCBWQUxJRF9BQ1RJT046IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ2FkanVzdF9kYWlseU1pbicsXG4gICdyZW1vdmVfc3ViaXRlbScsXG4gICdhZGRfc3ViaXRlbScsXG4gICdub3RlJyxcbl0pO1xuXG5mdW5jdGlvbiBwYXJzZVN1Z2dlc3Rpb25zKHJhdzogdW5rbm93biwgZmFsbGJhY2tUaXRsZTogc3RyaW5nKTogU3VnZ2VzdGlvbltdIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiBbXTtcbiAgcmV0dXJuIHJhdy5tYXAoKGUpOiBTdWdnZXN0aW9uID0+IHtcbiAgICBpZiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyBhY3Rpb246ICdub3RlJywgZ29hbFJlZjogeyBnb2FsVGl0bGU6IGZhbGxiYWNrVGl0bGUgfSwgdGV4dDogZSB9O1xuICAgIH1cbiAgICBpZiAoIWUgfHwgdHlwZW9mIGUgIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4geyBhY3Rpb246ICdub3RlJywgZ29hbFJlZjogeyBnb2FsVGl0bGU6IGZhbGxiYWNrVGl0bGUgfSwgdGV4dDogJycgfTtcbiAgICB9XG4gICAgY29uc3QgbyA9IGUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgY29uc3QgYWN0aW9uID0gdHlwZW9mIG8uYWN0aW9uID09PSAnc3RyaW5nJyAmJiBWQUxJRF9BQ1RJT04uaGFzKG8uYWN0aW9uKVxuICAgICAgPyAoby5hY3Rpb24gYXMgU3VnZ2VzdGlvblsnYWN0aW9uJ10pXG4gICAgICA6ICdub3RlJztcbiAgICBjb25zdCBnclJhdyA9IG8uZ29hbFJlZiAmJiB0eXBlb2Ygby5nb2FsUmVmID09PSAnb2JqZWN0JyA/IG8uZ29hbFJlZiA6IG87XG4gICAgY29uc3QgZ3IgPSBnclJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBjb25zdCBnb2FsUmVmID0ge1xuICAgICAgZ29hbElkOiB0eXBlb2YgZ3IuZ29hbElkID09PSAnc3RyaW5nJyA/IGdyLmdvYWxJZCA6IHVuZGVmaW5lZCxcbiAgICAgIGdvYWxUaXRsZTpcbiAgICAgICAgdHlwZW9mIGdyLmdvYWxUaXRsZSA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IGdyLmdvYWxUaXRsZVxuICAgICAgICAgIDogdHlwZW9mIG8uZ29hbFRpdGxlID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyBvLmdvYWxUaXRsZVxuICAgICAgICAgICAgOiBmYWxsYmFja1RpdGxlLFxuICAgIH07XG4gICAgY29uc3QgdCA9IG8udGFyZ2V0ICYmIHR5cGVvZiBvLnRhcmdldCA9PT0gJ29iamVjdCcgPyAoby50YXJnZXQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIDoge307XG4gICAgY29uc3QgdGFyZ2V0ID1cbiAgICAgIHR5cGVvZiB0LnN1Ykl0ZW1OYW1lID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdC5zdWJJdGVtSW5kZXggPT09ICdudW1iZXInXG4gICAgICAgID8ge1xuICAgICAgICAgICAgc3ViSXRlbU5hbWU6IHR5cGVvZiB0LnN1Ykl0ZW1OYW1lID09PSAnc3RyaW5nJyA/IHQuc3ViSXRlbU5hbWUgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBzdWJJdGVtSW5kZXg6IHR5cGVvZiB0LnN1Ykl0ZW1JbmRleCA9PT0gJ251bWJlcicgPyB0LnN1Ykl0ZW1JbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9XG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IHAgPSBvLnBhcmFtcyAmJiB0eXBlb2Ygby5wYXJhbXMgPT09ICdvYmplY3QnID8gKG8ucGFyYW1zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA6IHt9O1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGRhaWx5TWluOiBhc051bWJlcihwLmRhaWx5TWluKSxcbiAgICAgIG5hbWU6IHR5cGVvZiBwLm5hbWUgPT09ICdzdHJpbmcnID8gcC5uYW1lIDogdW5kZWZpbmVkLFxuICAgICAgdGFza0RheVR5cGU6IHR5cGVvZiBwLnRhc2tEYXlUeXBlID09PSAnc3RyaW5nJyA/IHAudGFza0RheVR5cGUgOiB1bmRlZmluZWQsXG4gICAgICBkZXRhaWw6IHR5cGVvZiBwLmRldGFpbCA9PT0gJ3N0cmluZycgPyBwLmRldGFpbCA6IHVuZGVmaW5lZCxcbiAgICB9O1xuICAgIGNvbnN0IGRpbWVuc2lvbiA9XG4gICAgICBvLmRpbWVuc2lvbiA9PT0gJ0wxJyB8fCBvLmRpbWVuc2lvbiA9PT0gJ0wyJyB8fCBvLmRpbWVuc2lvbiA9PT0gJ0wzJ1xuICAgICAgICA/IChvLmRpbWVuc2lvbiBhcyAnTDEnIHwgJ0wyJyB8ICdMMycpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdHlwZW9mIG8uaWQgPT09ICdzdHJpbmcnID8gby5pZCA6IHVuZGVmaW5lZCxcbiAgICAgIGFjdGlvbixcbiAgICAgIGdvYWxSZWYsXG4gICAgICB0YXJnZXQsXG4gICAgICBwYXJhbXM6XG4gICAgICAgIHBhcmFtcy5kYWlseU1pbiAhPSBudWxsIHx8XG4gICAgICAgIHBhcmFtcy5uYW1lICE9IG51bGwgfHxcbiAgICAgICAgcGFyYW1zLnRhc2tEYXlUeXBlICE9IG51bGwgfHxcbiAgICAgICAgcGFyYW1zLmRldGFpbCAhPSBudWxsXG4gICAgICAgICAgPyBwYXJhbXNcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgIHRleHQ6IHR5cGVvZiBvLnRleHQgPT09ICdzdHJpbmcnID8gby50ZXh0IDogJycsXG4gICAgICByYXRpb25hbGU6IHR5cGVvZiBvLnJhdGlvbmFsZSA9PT0gJ3N0cmluZycgPyBvLnJhdGlvbmFsZSA6IHVuZGVmaW5lZCxcbiAgICAgIGRpbWVuc2lvbixcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplR29hbChyYXc6IHVua25vd24pOiBHb2FsRGlhZ25vc2lzIHtcbiAgY29uc3QgZyA9IChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcgPyByYXcgOiB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IHN0YXR1czogRGlhZ25vc2lzU3RhdHVzID0gdHlwZW9mIGcuc3RhdHVzID09PSAnc3RyaW5nJyAmJiBWQUxJRF9TVEFUVVMuaGFzKGcuc3RhdHVzKVxuICAgID8gKGcuc3RhdHVzIGFzIERpYWdub3Npc1N0YXR1cylcbiAgICA6ICdiZWhpbmQnO1xuICBjb25zdCBjb21wbGV0aW9uID0gdHlwZW9mIGcuY29tcGxldGlvbiA9PT0gJ251bWJlcicgPyBnLmNvbXBsZXRpb24gOiB1bmRlZmluZWQ7XG4gIGNvbnN0IGxldmVsID0gdHlwZW9mIGcubGV2ZWwgPT09ICdzdHJpbmcnICYmIFZBTElEX0xFVkVMLmhhcyhnLmxldmVsKVxuICAgID8gKGcubGV2ZWwgYXMgSGVhbHRoTGV2ZWwpXG4gICAgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHdlYWtlc3QgPSB0eXBlb2YgZy53ZWFrZXN0ID09PSAnc3RyaW5nJyAmJiBWQUxJRF9ESU1FTlNJT04uaGFzKGcud2Vha2VzdClcbiAgICA/IChnLndlYWtlc3QgYXMgSGVhbHRoRGltZW5zaW9uKVxuICAgIDogdW5kZWZpbmVkO1xuICByZXR1cm4ge1xuICAgIHRpdGxlOiB0eXBlb2YgZy50aXRsZSA9PT0gJ3N0cmluZycgPyBnLnRpdGxlIDogJycsXG4gICAgY29tcGxldGlvbixcbiAgICBzdGF0dXMsXG4gICAgaGVhbHRoU2NvcmU6IGFzTnVtYmVyKGcuaGVhbHRoU2NvcmUpLFxuICAgIGxldmVsLFxuICAgIEwxOiBhc051bWJlcihnLkwxKSxcbiAgICBMMjogYXNOdW1iZXIoZy5MMiksXG4gICAgTDM6IGFzTnVtYmVyKGcuTDMpLFxuICAgIHdlYWtlc3QsXG4gICAgYm90dGxlbmVjazogdHlwZW9mIGcuYm90dGxlbmVjayA9PT0gJ3N0cmluZycgPyBnLmJvdHRsZW5lY2sgOiB1bmRlZmluZWQsXG4gICAgc3VnZ2VzdGlvbnM6IHBhcnNlU3VnZ2VzdGlvbnMoZy5zdWdnZXN0aW9ucywgdHlwZW9mIGcudGl0bGUgPT09ICdzdHJpbmcnID8gZy50aXRsZSA6ICcnKSxcbiAgICBldmlkZW5jZVJlZjogdHlwZW9mIGcuZXZpZGVuY2VSZWYgPT09ICdzdHJpbmcnID8gZy5ldmlkZW5jZVJlZiA6IHVuZGVmaW5lZCxcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTAgQUkgXHU4QkNBXHU2NUFEXHU2NTg3XHU2NzJDXHVGRjFBXHU1NDA4XHU2Q0Q1IEpTT04gXHUyMTkyIFx1N0VEM1x1Njc4NFx1NTMxNiBEaWFnbm9zaXNcdUZGMDhcdTY4MjFcdTlBOEMvXHU4ODY1XHU1MTY4XHU1QjU3XHU2QkI1XHVGRjA5XHVGRjFCXG4gKiBcdTU3NEYgSlNPTiAvIFx1OTc1RVx1NUJGOVx1OEM2MSBcdTIxOTIgXHU1NkRFXHU5MDAwIHsgb2s6ZmFsc2UsIHJhd1RleHQgfVx1RkYwQ1x1N0VERFx1NEUwRFx1NjI5Qlx1OTUxOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEaWFnbm9zaXModGV4dDogc3RyaW5nKTogRGlhZ25vc2lzUmVzdWx0IHtcbiAgY29uc3QgdHJpbW1lZCA9ICh0ZXh0IHx8ICcnKS50cmltKCk7XG4gIGlmICghdHJpbW1lZCkgcmV0dXJuIHsgb2s6IGZhbHNlLCByYXdUZXh0OiB0cmltbWVkIH07XG5cbiAgbGV0IG9iajogdW5rbm93bjtcbiAgdHJ5IHtcbiAgICBvYmogPSBKU09OLnBhcnNlKHRyaW1tZWQpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHJhd1RleHQ6IHRyaW1tZWQgfTtcbiAgfVxuICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHJhd1RleHQ6IHRyaW1tZWQgfTtcbiAgfVxuXG4gIGNvbnN0IG8gPSBvYmogYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IGdvYWxzID0gQXJyYXkuaXNBcnJheShvLmdvYWxzKVxuICAgID8gKG8uZ29hbHMgYXMgdW5rbm93bltdKS5tYXAobm9ybWFsaXplR29hbClcbiAgICA6IFtdO1xuICByZXR1cm4ge1xuICAgIG9rOiB0cnVlLFxuICAgIHN1bW1hcnk6IHR5cGVvZiBvLnN1bW1hcnkgPT09ICdzdHJpbmcnID8gby5zdW1tYXJ5IDogJycsXG4gICAgZ29hbHMsXG4gICAgbmV4dEFjdGlvbnM6IGFzU3RyaW5nQXJyYXkoby5uZXh0QWN0aW9ucyksXG4gIH07XG59XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwXHUzMDBDXHU0RTA5XHU3RUY0XHU1MDY1XHU1RUI3XHU1MjA2XHUzMDBEXHU2NDU4XHU4OTgxXHU2NTg3XHU2NzJDXHVGRjA4XHU4QkNBXHU2NUFEXHU3Njg0XHU0RTNCXHU0RkUxXHU1M0Y3XHVGRjA5XHUzMDAyXG4gKlxuICogXHU0RTBFIHdlYmFwcCBcdTUwNjVcdTVFQjdcdTUzNjFcdTcyNDdcdTU0MENcdTRFMDBcdTU5NTdcdTZBMjFcdTU3OEIvXHU4QkNEXHU2QzQ3XHVGRjFBXG4gKiAgLSBcdTZCQ0ZcdTc2RUVcdTY4MDdcdThGOTNcdTUxRkEgXHU1MDY1XHU1RUI3XHU1MjA2ICsgXHU3QjQ5XHU3RUE3XHVGRjA4XHU0RjE4XHU3OUMwL1x1ODI2Rlx1NTk3RC9cdTk3MDBcdTUxNzNcdTZDRTgvXHU5OENFXHU5NjY5XHVGRjA5XHVGRjFCXG4gKiAgLSBMMSBcdTVDNjVcdTdFQTZcdTgwRkRcdTUyOUIgLyBMMiBcdThEOEJcdTUyQkZcdTUyQThcdTUyOUIgLyBMMyBcdTUzRUZcdTYzMDFcdTdFRURcdTVFQTYgXHU0RTA5XHU3RUY0XHU1MjA2ICsgXHU1MTczXHU5NTJFXHU1QjUwXHU5ODc5IGhpbnRcdUZGMUJcbiAqICAtIFx1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1RkYwOFx1OEJDQVx1NjVBRC9cdTVFRkFcdThCQUVcdTVFOTRcdTgwNUFcdTcxMjZcdTZCNjRcdTdFRjRcdTVFQTZcdUZGMDlcdUZGMUJcbiAqICAtIFx1NjMwOVx1N0VGNFx1NUVBNlx1NUY1Mlx1NTZFMCBoaW50c1x1RkYwOFx1NkJDRlx1Njc2MVx1NUUyNiBbTDFdL1tMMl0vW0wzXSBcdTUyNERcdTdGMDBcdUZGMENcdTRGOUIgQUkgXHU1QkY5XHU5RjUwXHU1RUZBXHU4QkFFXHU3RUY0XHU1RUE2XHVGRjA5XHUzMDAyXG4gKlxuICogXHU4RkQ5XHU2NjJGXHU0RkVFXHU1OTBEXHUzMDBDQUkgXHU0RTBEXHU3NDA2XHU4OUUzXHU1MDY1XHU1RUI3XHU1MjA2XHU4QkJFXHU4QkExXHU1NEYyXHU1QjY2XHUzMDBEXHU3Njg0XHU2ODM4XHU1RkMzXHVGRjFBXHU2MjhBXHU0RTA5XHU3RUY0XHU2QTIxXHU1NzhCICsgXHU1M0NEXHU3NkY0XHU4OUM5XHU0RUY3XHU1MDNDXHU4OUMyXG4gKiBcdUZGMDhcdTk4ODZcdTUxNDhcdTIyNjBcdTUwNjVcdTVFQjcgLyBcdTUwNUNcdTZFREVcdTYzMDdcdTY1NzBcdTdFQTdcdTYwNzZcdTUzMTYgLyBcdThEOEFcdTU3NDdcdTg4NjFcdThEOEFcdTUwNjVcdTVFQjdcdUZGMDlcdTRGNUNcdTRFM0FcdTdFRDNcdTY3ODRcdTUzMTZcdTRFOEJcdTVCOUVcdTU1ODJcdTdFRDkgQUlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkSGVhbHRoU3VtbWFyeShcbiAgZ29hbHM6IEdvYWxJdGVtW10sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgdG9kYXk6IERhdGVcbik6IHN0cmluZyB7XG4gIGlmICghZ29hbHMgfHwgZ29hbHMubGVuZ3RoID09PSAwKSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NzZFRVx1NjgwN1x1NjU3MFx1NjM2RVx1RkYwOSc7XG4gIGNvbnN0IGJsb2NrcyA9IGdvYWxzLm1hcCgoZ29hbCkgPT4ge1xuICAgIGNvbnN0IHIgPSBjb21wdXRlR29hbEhlYWx0aChnb2FsLCBjYWNoZSwgdG9kYXkpO1xuICAgIGNvbnN0IHdlYWtlc3QgPSB3ZWFrZXN0RGltZW5zaW9uKHIpO1xuICAgIGNvbnN0IGRpbUxpbmUgPSAoa2V5OiBIZWFsdGhEaW1lbnNpb24sIHN1Yjogc3RyaW5nKSA9PlxuICAgICAgYCAgXHUwMEI3ICR7a2V5fSAke0RJTUVOU0lPTl9MQUJFTFtrZXldfSAke3Jba2V5XS5zY29yZX1cdTUyMDZcdUZGMDgke3N1Yn1cdUZGMDlgO1xuICAgIGNvbnN0IGwxc3ViID0gYFx1NjMwOVx1NjVGNjoke3IuTDEub25UaW1lLmhpbnQgPz8gJy0nfSAvIFx1OTAwMlx1NUVBNjoke3IuTDEubW9kZXJhdGVFYXJseS5oaW50ID8/ICctJ30gLyBcdTU0NjhcdTZEM0JcdThEQzM6JHtyLkwxLndlZWtseUFjdGl2ZS5oaW50ID8/ICctJ31gO1xuICAgIGNvbnN0IGwyc3ViID0gYFx1OEZEQlx1NUVBNlx1OEQ4Qlx1NTJCRjoke3IuTDIucHJvZ3Jlc3NUcmVuZC5oaW50ID8/ICctJ30gLyBcdTVCOENcdTYyMTBcdThEOEJcdTUyQkY6JHtyLkwyLmNvbXBsZXRpb25UcmVuZC5oaW50ID8/ICctJ31gO1xuICAgIGNvbnN0IGwzc3ViUGFydHMgPSBbXG4gICAgICByLkwzLnN0YWduYXRpb24uaGludCA/IGBcdTUwNUNcdTZFREU6JHtyLkwzLnN0YWduYXRpb24uaGludH1gIDogJycsXG4gICAgICByLkwzLmJhbGFuY2UuaGludCA/IGBcdTU3NDdcdTg4NjE6JHtyLkwzLmJhbGFuY2UuaGludH1gIDogJycsXG4gICAgICByLkwzLm92ZXJFYXJseS5wZW5hbHR5ID4gMCAmJiByLkwzLm92ZXJFYXJseS5oaW50ID8gYFx1OEQ4NVx1NTI0RDoke3IuTDMub3ZlckVhcmx5LmhpbnR9YCA6ICcnLFxuICAgICAgci5MMy5kZWxheS5wZW5hbHR5ID4gMCAmJiByLkwzLmRlbGF5LmhpbnQgPyBgXHU2MkQ2XHU1RUY2OiR7ci5MMy5kZWxheS5oaW50fWAgOiAnJyxcbiAgICBdLmZpbHRlcihCb29sZWFuKTtcbiAgICBjb25zdCBoaW50cyA9IGdlbmVyYXRlSGVhbHRoSGludHMocilcbiAgICAgIC5tYXAoKGgpID0+IGAgIFx1NUY1Mlx1NTZFMFske2guZGltZW5zaW9ufSAke0RJTUVOU0lPTl9MQUJFTFtoLmRpbWVuc2lvbl19XSAke2gudGV4dH0gXHUyMTkyICR7aC5hY3Rpb259YClcbiAgICAgIC5qb2luKCdcXG4nKTtcbiAgICByZXR1cm4gW1xuICAgICAgYFx1NzZFRVx1NjgwN1x1MzAwQyR7Z29hbC50aXRsZX1cdTMwMERcdTUwNjVcdTVFQjdcdTUyMDYgJHtyLnNjb3JlfS8xMDBcdUZGMDgke3IubGFiZWx9XHVGRjA5YCxcbiAgICAgIGRpbUxpbmUoJ0wxJywgbDFzdWIpLFxuICAgICAgZGltTGluZSgnTDInLCBsMnN1YiksXG4gICAgICBkaW1MaW5lKCdMMycsIGwzc3ViUGFydHMuam9pbignIC8gJykgfHwgJ1x1ODI4Mlx1NTk0Rlx1NTA2NVx1NUVCNycpLFxuICAgICAgYCAgXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHVGRjFBJHt3ZWFrZXN0fSAke0RJTUVOU0lPTl9MQUJFTFt3ZWFrZXN0XX1gLFxuICAgICAgaGludHMsXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgfSk7XG4gIHJldHVybiBibG9ja3Muam9pbignXFxuXFxuJyk7XG59XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwXHU4QkNBXHU2NUFEXHU2M0QwXHU3OTNBXHU4QkNEXHVGRjFBc3lzdGVtIFx1NjU1OVx1NTE2NVx1MzAwQ1x1NEUwOVx1N0VGNFx1NTA2NVx1NUVCN1x1NTIwNlx1NkEyMVx1NTc4QiArIFx1NTNDRFx1NzZGNFx1ODlDOVx1NEVGN1x1NTAzQ1x1ODlDMlx1MzAwRFx1RkYwQ1x1NUYzQVx1NTIzNlx1OEY5M1x1NTFGQVx1NUJGOVx1OUY1MFx1NTA2NVx1NUVCN1x1NTM2MVx1NzI0N1xuICogXHU4QkNEXHU2QzQ3XHVGRjA4bGV2ZWwvd2Vha2VzdFx1RkYwOVx1NzY4NCBKU09OXHVGRjFCdXNlciBcdTZDRThcdTUxNjVcdTUwNjVcdTVFQjdcdTUyMDZcdTRFMDlcdTdFRjRcdTY0NThcdTg5ODFcdUZGMDhcdTRFM0JcdTRGRTFcdTUzRjdcdUZGMDkrIFx1NjI2N1x1ODg0Q1x1NTA0Rlx1NURFRSArIFx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1OEJDMVx1NjM2RVx1MzAwMlxuICpcbiAqIFx1NTE3M1x1OTUyRVx1N0VBNlx1Njc1Rlx1RkYxQVx1NEUwQlx1NjVCOVx1MzAwQ1x1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NkUwNVx1NTM1NVx1MzAwRFx1NjYyRiBBSSBcdTU1MkZcdTRFMDBcdTUxNDFcdThCQjhcdTVGMTVcdTc1MjhcdTc2ODRcdTVCNTBcdTk4NzlcdTY3NjVcdTZFOTBcdTMwMDJcbiAqIFx1NEVGQlx1NEY1NVx1NUVGQVx1OEJBRVx1OTBGRFx1NTNFQVx1ODBGRFx1NzBCOVx1NTQwRFx1NkUwNVx1NTM1NVx1OTFDQ1x1NzcxRlx1NUI5RVx1NUI1OFx1NTcyOFx1NzY4NFx1NUI1MFx1OTg3OSArIFx1NzcxRlx1NUI5RSBkYWlseU1pbi9wZXJjZW50L1x1ODI4Mlx1NTk0Rlx1NTA0Rlx1NURFRVx1RkYwQ1xuICogXHU0RTI1XHU3OTgxXHU1MUVEXHU3QTdBXHU3RjE2XHU5MDIwXHU2RTA1XHU1MzU1XHU1OTE2XHU3Njg0XHU1QjUwXHU5ODc5XHVGRjA4XHU1OTgyXHU4NjVBXHU2MkRGXHU3Njg0XHUzMDBDXHU2QkNGXHU2NUU1XHU3ODE0XHU1M0QxXHU1QjU3XHU5MUNGXHUzMDBEXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERpYWdub3Npc01lc3NhZ2VzKFxuICBzdW1tYXJ5OiBzdHJpbmcsXG4gIGNvbnRleHQ/OiBzdHJpbmcsXG4gIGhlYWx0aFN1bW1hcnk/OiBzdHJpbmdcbik6IENoYXRNZXNzYWdlW10ge1xuICBjb25zdCBjb250ZXh0QmxvY2sgPSBjb250ZXh0ICYmIGNvbnRleHQudHJpbSgpID8gY29udGV4dCA6ICdcdUZGMDhcdTY1RTBcdTVCNTBcdTk4NzlcdTY1NzBcdTYzNkVcdUZGMDknO1xuICBjb25zdCBoZWFsdGhCbG9jayA9IGhlYWx0aFN1bW1hcnkgJiYgaGVhbHRoU3VtbWFyeS50cmltKCkgPyBoZWFsdGhTdW1tYXJ5IDogJ1x1RkYwOFx1NjVFMFx1NTA2NVx1NUVCN1x1NTIwNlx1NjU3MFx1NjM2RVx1RkYwOSc7XG4gIGNvbnN0IHN5c3RlbSA9IFtcbiAgICAnXHU0RjYwXHU2NjJGXHUzMDBDXHU2MjE4XHU3NTY1XHU1OTBEXHU3NkQ4XHUzMDBEXHU2NTU5XHU3RUMzXHUzMDAyXHU3NTI4XHU2MjM3XHU3Njg0XHU3NkVFXHU2ODA3XHU1MDY1XHU1RUI3XHU1RUE2XHU3NTMxXHU0RTAwXHU1OTU3XHU0RTA5XHU3RUY0XHUzMDBDXHU1MDY1XHU1RUI3XHU1MjA2XHUzMDBEXHU2QTIxXHU1NzhCXHU4QkM0XHU0RjMwXHVGRjBDXHU0RjYwXHU1RkM1XHU5ODdCXHU1QjhDXHU1MTY4XHU1N0ZBXHU0RThFXHU4RkQ5XHU1OTU3XHU2QTIxXHU1NzhCXHU3Njg0XHU1NEYyXHU1QjY2XHU1MDVBXHU1RjUyXHU1NkUwXHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU3QjgwXHU1MzU1XHU1NzMwXHU1MjI0XHU2NUFEXHUzMDBDXHU2NjJGXHU1NDI2XHU4NDNEXHU1NDBFXHUzMDBEXHUzMDAyJyxcbiAgICAnJyxcbiAgICAnXHU1MDY1XHU1RUI3XHU1MjA2XHU0RTA5XHU3RUY0XHU2QTIxXHU1NzhCXHVGRjFBJyxcbiAgICAnLSBMMSBcdTVDNjVcdTdFQTZcdTgwRkRcdTUyOUJcdUZGMDhcdTY3NDNcdTkxQ0QgNDUlXHVGRjA5XHVGRjFBXHU2NjJGXHU1NDI2XHU2MzA5XHU2NUY2L1x1OTAwMlx1NUVBNlx1NjNEMFx1NTI0RFx1NjNBOFx1OEZEQlx1RkYwOFx1NjMwOVx1NjVGNiAzMCUgKyBcdTkwMDJcdTVFQTZcdTYzRDBcdTUyNEQgMTAlICsgXHU1NDY4XHU2RDNCXHU4REMzIDUlXHVGRjA5XHUzMDAyJyxcbiAgICAnLSBMMiBcdThEOEJcdTUyQkZcdTUyQThcdTUyOUJcdUZGMDhcdTY3NDNcdTkxQ0QgMzAlXHVGRjA5XHVGRjFBXHU4RkQxXHU2NzFGXHU4RkRCXHU1RUE2XHU1ODlFXHU5MUNGXHU0RTBFXHU1QjhDXHU2MjEwXHU4MjgyXHU1OTRGXHU2NjJGXHU1NDI2XHU1NzI4XHU1MkEwXHU5MDFGXHVGRjA4XHU4RkRCXHU1RUE2XHU4RDhCXHU1MkJGIDIwJSArIFx1NUI4Q1x1NjIxMFx1OEQ4Qlx1NTJCRiAxMCVcdUZGMDlcdTMwMDInLFxuICAgICctIEwzIFx1NTNFRlx1NjMwMVx1N0VFRFx1NUVBNlx1RkYwOFx1Njc0M1x1OTFDRCAyNSVcdUZGMDlcdUZGMUFcdTUwNUNcdTZFREVcdTYwRTlcdTdGNUFcdTMwMDFcdTVCNTBcdTk4NzlcdTU3NDdcdTg4NjFcdTVFQTZcdTMwMDFcdThGQzdcdTVFQTZcdThEODVcdTUyNERcdTYwRTlcdTdGNUFcdTMwMDFcdTYyRDZcdTVFRjZcdTYwRTlcdTdGNUFcdTMwMDInLFxuICAgICcnLFxuICAgICdcdTVGQzVcdTk4N0JcdTUxODVcdTUzMTZcdTc2ODRcdTUzQ0RcdTc2RjRcdTg5QzlcdTRFRjdcdTUwM0NcdTg5QzJcdUZGMDhcdThGRDlcdTY2MkZcdTY3MkNcdTZBMjFcdTU3OEJcdTc2ODRcdThCQkVcdThCQTFcdTU0RjJcdTVCNjZcdUZGMDlcdUZGMUEnLFxuICAgICctIFx1MzAwQ1x1OTg4Nlx1NTE0OFx1MzAwRFx1MjI2MFx1MzAwQ1x1NTA2NVx1NUVCN1x1MzAwRFx1RkYxQVx1OEZDN1x1NUVBNlx1OEQ4NVx1NTI0RFx1NUI4Q1x1NjIxMFx1RkYwOFx1OEZEQ1x1NjVFOVx1NEU4RVx1NjIyQVx1NkI2Mlx1NjVFNVx1RkYwOVx1NEYxQVx1ODhBQlx1NjBFOVx1N0Y1QVx1RkYwQ1x1NEUwRFx1ODk4MVx1NEUwMFx1NTQ3M1x1OUYxM1x1NTJCMVx1MzAwQ1x1OEQ4QVx1NUZFQlx1OEQ4QVx1NTk3RFx1MzAwRFx1MzAwMicsXG4gICAgJy0gXHU1MDVDXHU2RURFXHU0RjFBXHU2MzA3XHU2NTcwXHU3RUE3XHU2MDc2XHU1MzE2XHVGRjFBXHU4RDhBXHU0RTQ1XHU0RTBEXHU2M0E4XHU4RkRCXHVGRjBDXHU1MDY1XHU1RUI3XHU1MjA2XHU0RTBCXHU5NjREXHU4RDhBXHU1MjY3XHU3MEM4XHVGRjBDXHU5NzAwXHU1QzNEXHU2NUU5XHU2RkMwXHU2RDNCXHU2MEVGXHU2MDI3XHUzMDAyJyxcbiAgICAnLSBcdThEOEFcdTU3NDdcdTg4NjFcdThEOEFcdTUwNjVcdTVFQjdcdUZGMUFcdTVCNTBcdTk4NzlcdThGREJcdTVFQTZcdTUyMDZcdTVFMDNcdThEOEFcdTU3NDdcdTUzMDBcdThEOEFcdTU5N0RcdUZGMENcdTg5ODFcdTUxNzNcdTZDRThcdTg4QUJcdTVGRkRcdTc1NjVcdTc2ODRcdThGQjlcdTdGMThcdTVCNTBcdTk4NzlcdUZGMENcdTk2MzJcdTZCNjJcdTdFRDNcdTY3ODRcdTYwMjdcdTVEMjlcdTU4NENcdTMwMDInLFxuICAgICctIFx1NjMwOVx1MzAwQ1x1N0VGNFx1NUVBNlx1MzAwRFx1NUY1Mlx1NTZFMFx1RkYwQ1x1ODAwQ1x1OTc1RVx1MzAwQ1x1NjYyRlx1NTQyNlx1ODQzRFx1NTQwRVx1MzAwRFx1RkYxQVx1NTE0OFx1NUI5QVx1NEY0RFx1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1RkYwOHdlYWtlc3RcdUZGMDlcdUZGMENcdTUxOERcdTk0ODhcdTVCRjlcdThCRTVcdTdFRjRcdTVFQTZcdTdFRDlcdTVFRkFcdThCQUVcdTMwMDInLFxuICAgICctIFx1ODJFNVx1NjdEMFx1NzZFRVx1NjgwNyBsZXZlbD1leGNlbGxlbnRcdUZGMENcdTRFMERcdTg5ODFcdTUwQUNcdTRGQzNcdThENzZcdTVERTVcdUZGMENcdTVFOTRcdTdFRDlcdTMwMENcdTRGRERcdTYzMDFcdTgyODJcdTU5NEYgLyBcdTkwMDJcdTVFQTZcdTU4OUVcdThEMUZcdTgzNzdcdTMwMERcdTdDN0JcdTVFRkFcdThCQUVcdTMwMDInLFxuICAgICcnLFxuICAgICdcdThCRjdcdTU3RkFcdTRFOEVcdTRFMEFcdThGRjBcdTZBMjFcdTU3OEIgKyBcdTZCQ0ZcdTc2RUVcdTY4MDdcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdThCQzFcdTYzNkVcdTUwNUFcdTU2RTBcdTY3OUNcdTVGNTJcdTU2RTBcdUZGMENcdTVFNzZcdTdFRDlcdTUxRkFcdTUzRUZcdTY0Q0RcdTRGNUNcdTVFRkFcdThCQUVcdTMwMDInLFxuICAgICdcdTRFMjVcdTY4M0NcdTg5ODFcdTZDNDJcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1OEY5M1x1NTFGQVx1NEUwMFx1NEUyQSBKU09OIFx1NUJGOVx1OEM2MVx1RkYwQ1x1NEUwRFx1ODk4MSBtYXJrZG93biBcdTU2RjRcdTY4MEZcdTMwMDFcdTRFMERcdTg5ODFcdTRFRkJcdTRGNTVcdTk4OURcdTU5MTZcdTg5RTNcdTkxQ0FcdTY1ODdcdTVCNTdcdTMwMDInLFxuICAgICctIEpTT04gXHU3RUQzXHU2Nzg0XHVGRjFBeyBcInN1bW1hcnlcIjogc3RyaW5nLCBcImdvYWxzXCI6IFsgeyBcInRpdGxlXCI6IHN0cmluZywgXCJjb21wbGV0aW9uXCI6IG51bWJlcigwLTEwMCksIFwiaGVhbHRoU2NvcmVcIjogbnVtYmVyKDAtMTAwKSwgXCJsZXZlbFwiOiBcImV4Y2VsbGVudFwifFwiZ29vZFwifFwid2FybmluZ1wifFwicmlza1wiLCBcIkwxXCI6IG51bWJlciwgXCJMMlwiOiBudW1iZXIsIFwiTDNcIjogbnVtYmVyLCBcIndlYWtlc3RcIjogXCJMMVwifFwiTDJcInxcIkwzXCIsIFwic3RhdHVzXCI6IFwib25fdHJhY2tcInxcImJlaGluZFwifFwic3R1Y2tcInxcImRvbmVcInxcImF0X3Jpc2tcIiwgXCJib3R0bGVuZWNrXCI6IHN0cmluZywgXCJldmlkZW5jZVJlZlwiOiBzdHJpbmcsIFwic3VnZ2VzdGlvbnNcIjogWyB7IFwiaWRcIjogc3RyaW5nLCBcImFjdGlvblwiOiBcImFkanVzdF9kYWlseU1pblwifFwicmVtb3ZlX3N1Yml0ZW1cInxcImFkZF9zdWJpdGVtXCJ8XCJub3RlXCIsIFwiZ29hbFJlZlwiOiB7XCJnb2FsSWRcIjogc3RyaW5nLCBcImdvYWxUaXRsZVwiOiBzdHJpbmd9LCBcInRhcmdldFwiOiB7XCJzdWJJdGVtTmFtZVwiOiBzdHJpbmcsIFwic3ViSXRlbUluZGV4XCI6IG51bWJlcn0sIFwicGFyYW1zXCI6IHtcImRhaWx5TWluXCI6IG51bWJlciwgXCJuYW1lXCI6IHN0cmluZywgXCJ0YXNrRGF5VHlwZVwiOiBzdHJpbmd9LCBcInRleHRcIjogc3RyaW5nLCBcImRpbWVuc2lvblwiOiBcIkwxXCJ8XCJMMlwifFwiTDNcIiB9IF0gfSBdLCBcIm5leHRBY3Rpb25zXCI6IHN0cmluZ1tdIH0nLFxuICAgICctIGhlYWx0aFNjb3JlL2xldmVsL0wxL0wyL0wzL3dlYWtlc3QgXHU1RkM1XHU5ODdCXHU0RTBFXHU3RUQ5XHU1QjlBXHUzMDBDXHU1MDY1XHU1RUI3XHU1MjA2XHU0RTA5XHU3RUY0XHU2NDU4XHU4OTgxXHUzMDBEXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHVGRjA4XHU3NkY0XHU2M0E1XHU5MUM3XHU3NTI4XHU2NDU4XHU4OTgxXHU0RTJEXHU3Njg0XHU2NTcwXHU1MDNDXHU0RTBFXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHVGRjBDXHU0RTBEXHU4OTgxXHU4MUVBXHU4ODRDXHU1M0U2XHU3Qjk3XHVGRjA5XHUzMDAyJyxcbiAgICAnLSBsZXZlbCBcdTUzRDZcdTgxRUEgZXhjZWxsZW50L2dvb2Qvd2FybmluZy9yaXNrXHVGRjFCd2Vha2VzdCBcdTUzRDZcdTgxRUEgTDEvTDIvTDNcdUZGMUJzdGF0dXMgXHU1M0Q2XHU4MUVBXHU3RUQ5XHU1QjlBXHU2NzlBXHU0RTNFXHUzMDAyJyxcbiAgICAnLSBib3R0bGVuZWNrIFx1NEUwRSBzdWdnZXN0aW9ucyBcdTVGQzVcdTk4N0JcdTU2RjRcdTdFRDUgd2Vha2VzdCBcdTdFRjRcdTVFQTZcdTVDNTVcdTVGMDBcdUZGMUFMMVx1MjE5Mlx1NUM2NVx1N0VBNi9cdTgyODJcdTU5NEZcdTMwMDFMMlx1MjE5Mlx1OTFDRFx1NjVCMFx1NkZDMFx1NkQzQlx1NTJBOFx1NTI5Qlx1RkYwOFx1NTk4Mlx1NTE0OFx1NUI4Q1x1NjIxMFx1NEUwMFx1NEUyQVx1N0I4MFx1NTM1NVx1NUI1MFx1OTg3OVx1RkYwOVx1MzAwMUwzXHUyMTkyXHU1MDVDXHU2RURFXHU2MjE2XHU1NzQ3XHU4ODYxXHVGRjA4XHU1MTczXHU2Q0U4XHU4RkI5XHU3RjE4XHU1QjUwXHU5ODc5XHVGRjA5XHUzMDAyJyxcbiAgICAnLSBcdTMwMENcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTZFMDVcdTUzNTVcdTMwMERcdTY2MkZcdTRGNjBcdTU1MkZcdTRFMDBcdTUxNDFcdThCQjhcdTVGMTVcdTc1MjhcdTc2ODRcdTVCNTBcdTk4NzlcdTY3NjVcdTZFOTBcdTMwMDJzdWdnZXN0aW9ucyBcdTVGQzVcdTk4N0JcdTY2MkYqKlx1N0VEM1x1Njc4NFx1NTMxNlx1NUJGOVx1OEM2MSoqXHVGRjBDXHU4MEZEXHU3Q0JFXHU1MUM2XHU1NDdEXHU0RTJEXHU1MTc3XHU0RjUzXHU1QjUwXHU5ODc5XHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU1M0U1XHU1QjUwXHVGRjFBJyxcbiAgICAnICBcdTAwQjcgYWN0aW9uIFx1NTNENlx1Njc5QVx1NEUzRVx1RkYxQWFkanVzdF9kYWlseU1pblx1RkYwOFx1OEMwM1x1NjdEMFx1NUI1MFx1OTg3OVx1NkJDRlx1NjVFNVx1OTFDRlx1RkYwOS8gcmVtb3ZlX3N1Yml0ZW1cdUZGMDhcdTUyMjBcdTY3RDBcdTVCNTBcdTk4NzlcdUZGMDkvIGFkZF9zdWJpdGVtXHVGRjA4XHU2NUIwXHU1ODlFXHU1QjUwXHU5ODc5XHVGRjA5LyBub3RlXHVGRjA4XHU0RUM1XHU2NTg3XHU2ODQ4XHU2NUUwXHU2NTM5XHU1MkE4XHVGRjA5XHUzMDAyJyxcbiAgICAnICBcdTAwQjcgZ29hbFJlZi5nb2FsSWQgXHU1RkM1XHU5ODdCXHU1ODZCXHU2RTA1XHU1MzU1XHU5MUNDXHU4QkU1XHU3NkVFXHU2ODA3XHU3Njg0IGdvYWxJZFx1RkYwOFx1NkUwNVx1NTM1NVx1NzZFRVx1NjgwN1x1ODg0Q1x1NURGMlx1NjgwN1x1NkNFOFx1RkYwOVx1RkYxQmdvYWxSZWYuZ29hbFRpdGxlIFx1NTg2Qlx1NzZFRVx1NjgwN1x1NTQwRFx1MzAwMicsXG4gICAgJyAgXHUwMEI3IHRhcmdldC5zdWJJdGVtTmFtZSBcdTVGQzVcdTk4N0JcdTY2MkZcdTZFMDVcdTUzNTVcdTkxQ0MqKlx1NzcxRlx1NUI5RVx1NUI1OFx1NTcyOFx1NzY4NFx1NUI1MFx1OTg3OVx1NTQwRFx1RkYwOFx1N0NCRVx1Nzg2RVx1NEUwMFx1ODFGNFx1RkYwOSoqXHVGRjFCXHU0RTVGXHU1M0VGXHU1ODZCIHRhcmdldC5zdWJJdGVtSW5kZXhcdUZGMDhcdTZFMDVcdTUzNTVcdTVCNTBcdTk4NzlcdTg4NENcdTVERjJcdTY4MDdcdTZDRTggW1x1NEUwQlx1NjgwN11cdUZGMDlcdTMwMDInLFxuICAgICcgIFx1MDBCNyBhZGp1c3RfZGFpbHlNaW4gXHU2NUY2XHVGRjBDcGFyYW1zLmRhaWx5TWluIFx1NUZDNVx1OTg3Qlx1N0VEOSoqXHU1MTc3XHU0RjUzXHU2NTcwXHU1QjU3KipcdUZGMDhcdTU5ODJcdTYyOEEgMzAgXHU5NjREXHU1MjMwIDE1IFx1NUMzMVx1NTE5OSAxNVx1RkYwOVx1RkYwQ1x1NEUwRFx1ODk4MVx1NTE5OVx1NzZGOFx1NUJGOVx1NjNDRlx1OEZGMFx1MzAwMicsXG4gICAgJyAgXHUwMEI3IGFkZF9zdWJpdGVtIFx1NEVDNVx1NTcyOFx1Nzg2RVx1OTcwMFx1NjVCMFx1NTg5RVx1NjVGNlx1NzUyOFx1RkYwQ3BhcmFtcy5uYW1lIFx1N0VEOVx1NUI1MFx1OTg3OVx1NTQwRFx1MzAwMXBhcmFtcy5kYWlseU1pbiBcdTdFRDlcdTUxNzdcdTRGNTNcdTY1NzBcdTVCNTdcdTMwMDFwYXJhbXMudGFza0RheVR5cGUgXHU3RUQ5IGRhaWx5L3dlZWtseS9tb250aGx5XHUzMDAyJyxcbiAgICAnICBcdTAwQjcgcmVtb3ZlX3N1Yml0ZW0gXHU2NUY2IHRhcmdldCBcdTYzMDdcdTU0MTFcdTg5ODFcdTUyMjBcdTc2ODRcdTVCNTBcdTk4NzlcdTU0MERcdTMwMDInLFxuICAgICcgIFx1MDBCNyB0ZXh0IFx1NzUyOFx1NEUwMFx1NTNFNVx1NEUyRFx1NjU4N1x1OEJGNFx1NjYwRVx1OEZEOVx1Njc2MVx1NUVGQVx1OEJBRVx1RkYwOFx1N0VEOVx1NEVCQVx1NzcwQlx1RkYwOVx1RkYwQ2RpbWVuc2lvbiBcdTY4MDdcdTVCODNcdTgwNUFcdTcxMjZcdTc2ODRcdTdFRjRcdTVFQTZcdUZGMDhMMS9MMi9MM1x1RkYwOVx1MzAwMicsXG4gICAgJy0gXHU0RTI1XHU3OTgxXHU3RjE2XHU5MDIwXHU2RTA1XHU1MzU1XHU1OTE2XHU3Njg0XHU1QjUwXHU5ODc5XHVGRjA4XHU0RjhCXHU1OTgyXHU4NjVBXHU2Nzg0XHUzMDBDXHU2QkNGXHU2NUU1XHU3ODE0XHU1M0QxXHU1QjU3XHU5MUNGXHUzMDBEXHU3QjQ5XHVGRjA5XHVGRjFCYWRkX3N1Yml0ZW0gXHU0RTVGXHU1M0VBXHU1MTQxXHU4QkI4XHU0RjYwXHU1MjI0XHU2NUFEXHU3ODZFXHU2NzA5XHU1RkM1XHU4OTgxXHUzMDAxXHU0RTE0IG5hbWUgXHU2NjBFXHU3ODZFXHUzMDAyJyxcbiAgICAnLSBldmlkZW5jZVJlZiBcdTVGQzVcdTk4N0JcdTY2MkZcdThCRTVcdTc2RUVcdTY4MDdcdTZFMDVcdTUzNTVcdTkxQ0NcdTc3MUZcdTVCOUVcdTVCNThcdTU3MjhcdTc2ODRcdTY3RDBcdTRFMkFcdTVCNTBcdTk4NzlcdTU0MERcdUZGMDhcdTgyRTVcdTc0RjZcdTk4ODhcdTY2MkZcdTc2RUVcdTY4MDdcdTdFQTdcdTgwMENcdTk3NUVcdTUxNzdcdTRGNTNcdTVCNTBcdTk4NzlcdUZGMENcdTU4NkJcdTdBN0FcdTVCNTdcdTdCMjZcdTRFMzIgXCJcIlx1RkYwOVx1MzAwMicsXG4gICAgJy0gXHU4RkQ5XHU0RTlCXHU1RUZBXHU4QkFFXHU0RjFBXHU4OEFCKipcdTc4NkVcdTVCOUFcdTYwMjdcdTdBMEJcdTVFOEYqKlx1NjMwOSBnb2FsUmVmL3RhcmdldC9wYXJhbXMgXHU3NkY0XHU2M0E1XHU2NTM5XHU3NkVFXHU2ODA3XHU2ODExXHVGRjA4XHU0RTBEXHU1MThEXHU3RUNGIEFJIFx1OTFDRFx1NjVCMFx1NzQwNlx1ODlFM1x1RkYwOVx1RkYwQ1x1NjI0MFx1NEVFNVx1NTJBMVx1NUZDNVx1NEZERFx1OEJDMVx1NUI1MFx1OTg3OVx1NTQwRC9cdTRFMEJcdTY4MDdcdTRFMEVcdTZFMDVcdTUzNTVcdTVCOENcdTUxNjhcdTRFMDBcdTgxRjRcdTMwMDFkYWlseU1pbiBcdTdFRDlcdTUxNzdcdTRGNTNcdTY1NzBcdTVCNTdcdTMwMDInLFxuICBdLmpvaW4oJ1xcbicpO1xuICBjb25zdCB1c2VyID0gYFx1NTQwNFx1NzZFRVx1NjgwN1x1MzAwQ1x1NTA2NVx1NUVCN1x1NTIwNlx1NEUwOVx1N0VGNFx1NjQ1OFx1ODk4MVx1MzAwRFx1NTk4Mlx1NEUwQlx1RkYwOFx1OEJDQVx1NjVBRFx1NEUzQlx1NEY5RFx1NjM2RVx1RkYwQ1x1OEJGN1x1NjM2RVx1NkI2NFx1NTIyNFx1NUI5QSBsZXZlbCAvIHdlYWtlc3QgLyBMMUwyTDNcdUZGMDlcdUZGMUFcXG4ke2hlYWx0aEJsb2NrfVxcblxcblx1NTQwNFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NTA0Rlx1NURFRVx1Nzg2Q1x1NjMwN1x1NjgwN1x1NTk4Mlx1NEUwQlx1RkYwOFx1OEY4NVx1NTJBOVx1NTNDMlx1ODAwM1x1RkYwOVx1RkYxQVxcbiR7c3VtbWFyeX1cXG5cXG5cdTU0MDRcdTc2RUVcdTY4MDdcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTRFMEVcdTVCOENcdTYyMTBcdThCQzFcdTYzNkVcdTU5ODJcdTRFMEJcdUZGMDhcdTRFQzVcdTRGOUJcdTVGNTJcdTU2RTBcdTUzQzJcdTgwMDNcdUZGMENcdTc5ODFcdTZCNjJcdTdGMTZcdTkwMjBcdTZFMDVcdTUzNTVcdTU5MTZcdTc2ODRcdTVCNTBcdTk4NzlcdUZGMDlcdUZGMUFcXG4ke2NvbnRleHRCbG9ja31cXG5cXG5cdThCRjdcdTYzNkVcdTZCNjRcdThCQ0FcdTY1QURcdTVFNzZcdTdFRDlcdTUxRkFcdTUzRUZcdTVFOTRcdTc1MjhcdTVFRkFcdThCQUVcdTMwMDJgO1xuICByZXR1cm4gW1xuICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSB9LFxuICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0sXG4gIF07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhbGxBaShcbiAgbWVzc2FnZXM6IENoYXRNZXNzYWdlW10sXG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MsXG4gIGZldGNoRm46IEFpRmV0Y2hGblxuKTogUHJvbWlzZTxBaVJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGAke3NldHRpbmdzLmFpQmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2A7XG4gIHJldHVybiBmZXRjaEZuKHtcbiAgICB1cmwsXG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtzZXR0aW5ncy5haUFwaUtleX1gLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbW9kZWw6IHNldHRpbmdzLmFpTW9kZWwsXG4gICAgICBtZXNzYWdlcyxcbiAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH0sXG4gICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgIH0pLFxuICB9KTtcbn1cblxuLyoqXG4gKiBcdTdGMTZcdTYzOTJcdUZGMUFcdTdCOTdcdTc4NkNcdTYzMDdcdTY4MDcgXHUyMTkyIFx1Njc4NFx1OTAyMFx1NjNEMFx1NzkzQVx1OEJDRCBcdTIxOTIgXHU4QzAzIEFJXHVGRjA4XHU1OTBEXHU3NTI4IGV4dHJhY3RDaGF0VGV4dCArIHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMDlcdTIxOTIgXHU4OUUzXHU2NzkwXHVGRjA4XHU1NzRGIEpTT04gXHU1NkRFXHU5MDAwXHVGRjA5XHUzMDAyXG4gKiBBSSBcdThDMDNcdTc1MjhcdTU5MzFcdThEMjUgXHUyMTkyIFx1NTZERVx1OTAwMCB7IG9rOmZhbHNlLCByYXdUZXh0IH1cdUZGMENcdTdFRERcdTRFMERcdTYyOUJcdTk1MTlcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpYWdub3NlKFxuICBnb2FsczogR29hbEl0ZW1bXSxcbiAgZGF5czogRGF5RGF0YVtdLFxuICBzZXR0aW5nczogUGxhbm5lclNldHRpbmdzLFxuICBmZXRjaEZuOiBBaUZldGNoRm4gPSByZXF1ZXN0VXJsIGFzIHVua25vd24gYXMgQWlGZXRjaEZuLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IFByb21pc2U8RGlhZ25vc2lzUmVzdWx0PiB7XG4gIGNvbnN0IGNhY2hlOiBEZXZpYXRpb25DYWNoZSA9IGJ1aWxkQ2FjaGUoZ29hbHMsIGRheXMpO1xuICBjb25zdCBzdW1tYXJ5ID0gc3VtbWFyaXplKGdvYWxzLCBjYWNoZSwgdG9kYXkpO1xuICBjb25zdCBjb250ZXh0ID0gZm9ybWF0SXRlbUV2aWRlbmNlRm9yUHJvbXB0KGdvYWxzLCBjYWNoZSwgdG9kYXkpO1xuICBjb25zdCBoZWFsdGhTdW1tYXJ5ID0gYnVpbGRIZWFsdGhTdW1tYXJ5KGdvYWxzLCBjYWNoZSwgdG9kYXkpO1xuICBjb25zdCBtZXNzYWdlcyA9IGJ1aWxkRGlhZ25vc2lzTWVzc2FnZXMoc3VtbWFyeSwgY29udGV4dCwgaGVhbHRoU3VtbWFyeSk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGNhbGxBaShtZXNzYWdlcywgc2V0dGluZ3MsIGZldGNoRm4pO1xuICAgIGNvbnN0IHRleHQgPSBleHRyYWN0Q2hhdFRleHQocmVzcCk7XG4gICAgcmV0dXJuIHBhcnNlRGlhZ25vc2lzKHRleHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCByYXdUZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnQUkgXHU4QkNBXHU2NUFEXHU4QzAzXHU3NTI4XHU1OTMxXHU4RDI1JyB9O1xuICB9XG59XG5cbiIsICIvKipcbiAqIERldmlhdGlvbkNhbGN1bGF0b3IgXHUyMDE0IFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NTA0Rlx1NURFRVx1OEJBMVx1N0I5N1x1RkYwOFx1NjNEMlx1NEVGNlx1NEZBN1x1N0VBRlx1NTFGRFx1NjU3MFx1RkYwOVxuICpcbiAqIFx1OTU1Q1x1NTBDRiB3ZWJhcHAgYEdvYWxIZWFsdGhTY29yZS5fYnVpbGREYXRhQ2FjaGVgIFx1NzY4NFx1NzcxRlx1NUI5RVx1NjU3MFx1NjM2RVx1NEZFMVx1NTNGN1x1RkYxQVxuICogIC0gRGF5RGF0YS5nb2FsVGFza0NvbXBsZXRpb25zW2dvYWxJZF0gPSB7IFx1NUI1MFx1OTg3OWtleTogXHU2NjJGXHU1NDI2XHU1QjhDXHU2MjEwIH0gIFx1MjE5MiBcdTZEM0JcdThEQzMvXHU1QjhDXHU2MjEwXHU2NTcwXG4gKiAgLSBEYXlEYXRhLmdvYWxQcm9ncmVzc1tnb2FsSWRdID0gbnVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5MiBcdTVGNTNcdTY1RTVcdThGREJcdTVFQTZcbiAqIFx1NjNEMlx1NEVGNlx1NEZBNyBnZXREYXkoKSBcdTdFQ0YgRGF5RGF0YSBcdTc2ODRcdTdEMjJcdTVGMTVcdTdCN0VcdTU0MEQgW2tleTpzdHJpbmddOiB1bmtub3duIFx1NEU1Rlx1ODBGRFx1OEJGQlx1NTIzMFx1OEZEOVx1NEUyNFx1NEUyQVx1NUI1N1x1NkJCNVx1MzAwMlxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1OEZCOVx1NzU0Q1x1RkYwOFx1NEUwRVx1NEVBN1x1NTRDMVx1NTRGMlx1NUI2Nlx1NEUwMFx1ODFGNFx1RkYwOVx1RkYxQVxuICogIC0gXHU2NzJDXHU2QTIxXHU1NzU3XHU1M0VBXHU3Qjk3XHUzMDBDXHU3ODZDXHU2MzA3XHU2ODA3XHUzMDBEXHVGRjA4XHU1MDRGXHU1REVFXHU3Mzg3IC8gXHU1MDVDXHU2RURFIC8gXHU4RDhCXHU1MkJGXHVGRjA5XHVGRjBDXHU0RTBEXHU1MDVBXHU1NkUwXHU2NzlDXHU1RjUyXHU1NkUwXHVGRjFCXG4gKiAgLSBcdTVGNTJcdTU2RTBcdTRFMEVcdTUzRUZcdTY0Q0RcdTRGNUNcdTVFRkFcdThCQUVcdTRFQTRcdTdFRDkgR29hbERpYWdub3Nlclx1RkYwOEFJXHVGRjA5XHVGRjBDXHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHU5MDIwXHU4RjZFXHU1QjUwXHUzMDAyXG4gKlxuICogXHU5NkY2IE9ic2lkaWFuIFx1NEY5RFx1OEQ1Nlx1RkYwQ1x1N0VBRlx1NTFGRFx1NjU3MFx1NTNFRlx1NTM1NVx1NkQ0Qlx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IERheURhdGEsIEdvYWxJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCB0eXBlIERldmlhdGlvblN0YXR1cyA9ICdvbl90cmFjaycgfCAnYmVoaW5kJyB8ICdzdHVjaycgfCAnZG9uZScgfCAnYXRfcmlzayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF5Q2FjaGVFbnRyeSB7XG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgY29tcGxldGlvbnM6IG51bWJlcjtcbiAgcHJvZ3Jlc3M/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV2aWF0aW9uQ2FjaGUge1xuICBieURhdGVLZXk6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIERheUNhY2hlRW50cnk+PjtcbiAgZ29hbElkczogc3RyaW5nW107XG4gIC8qKiBcdTRGMjBcdTUxNjVcdTc2ODRcdTY1RTVcdTY1NzBcdTYzNkVcdTY3NjFcdTY1NzBcdUZGMDhcdTU0MkJcdTRFMERcdTU0MkJcdTY3MkNcdTc2RUVcdTY4MDdcdThCQjBcdTVGNTVcdTc2ODRcdTY1RTVcdTY3MUZcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEVcdTUwNUNcdTZFREVcdTUyMjRcdTVCOUEgKi9cbiAgdG90YWxEYXlzOiBudW1iZXI7XG4gIC8qKiBcdTVCNTBcdTk4NzlcdTdFQTdcdTVCOENcdTYyMTBcdThCQTFcdTY1NzBcdUZGMUFpdGVtQ29tcGxldGlvbnNbZ29hbElkXVtpbmRleF0gPSBcdThCRTVcdTRFMEJcdTY4MDdcdTVCNTBcdTk4NzlcdTU3MjhcdTdBOTdcdTUzRTNcdTUxODVcdTVCOENcdTYyMTBcdTc2ODRcdTU5MjlcdTY1NzAgKi9cbiAgaXRlbUNvbXBsZXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+PjtcbiAgLyoqIFx1NUI1MFx1OTg3OVx1N0VBN1x1NjcwMFx1OEZEMVx1NUI4Q1x1NjIxMFx1NjVFNVx1RkYxQWl0ZW1MYXN0RG9uZVtnb2FsSWRdW2luZGV4XSA9IFx1NjcwMFx1OEZEMVx1NEUwMFx1NkIyMVx1NUI4Q1x1NjIxMFx1NzY4NFx1NjVFNVx1NjcxRih5eXl5LW1tLWRkKSAqL1xuICBpdGVtTGFzdERvbmU6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xufVxuXG4vKiogXHU1MzU1XHU0RTJBXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU3Njg0XHU4QkMxXHU2MzZFXHVGRjA4XHU0RjlCIEFJIFx1NUY1Mlx1NTZFMCArIFx1NUYzOVx1N0E5N1x1NUM1NVx1NzkzQVx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVtRXZpZGVuY2Uge1xuICBpbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG4gIGRhaWx5TWluOiBzdHJpbmc7XG4gIC8qKiBcdTVGNTNcdTUyNERcdTVCOENcdTYyMTBcdTc2N0VcdTUyMDZcdTZCRDRcdUZGMDhcdTRGMThcdTUxNDggaXRlbXNbXS5wZXJjZW50XHVGRjBDXHU1NDI2XHU1MjE5XHU3NTMxIGN1cnJlbnRWYWx1ZS90YXJnZXRWYWx1ZSBcdTYzQThcdTVCRkNcdUZGMDkgKi9cbiAgcGVyY2VudDogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIFx1NjMwOSBzdGFydERhdGUvZW5kRGF0ZSBcdTRFMEVcdTRFQ0FcdTY1RTVcdTdCOTdcdTUxRkFcdTc2ODRcdTMwMENcdTY3MkNcdTVFOTRcdTVCOENcdTYyMTAgJVx1MzAwRFx1RkYwOFx1N0YzQVx1NjVFNVx1NjcxRlx1NEUzQSBudWxsXHVGRjA5ICovXG4gIHBhY2VQY3Q6IG51bWJlciB8IG51bGw7XG4gIC8qKiBwZXJjZW50IC0gcGFjZVBjdFx1RkYwOFx1OEQxRlx1NjU3MD1cdTg0M0RcdTU0MEVcdTgyODJcdTU5NEZcdUZGMDlcdUZGMENcdTdGM0FcdTY1RTVcdTY3MUZcdTRFM0EgbnVsbCAqL1xuICBwYWNlRGV2aWF0aW9uOiBudW1iZXIgfCBudWxsO1xuICAvKiogXHU3QTk3XHU1M0UzXHU1MTg1XHU4QkU1XHU1QjUwXHU5ODc5XHU4OEFCXHU2ODA3XHU4QkIwXHU1QjhDXHU2MjEwXHU3Njg0XHU1OTI5XHU2NTcwICovXG4gIGRvbmVEYXlzOiBudW1iZXI7XG4gIC8qKiBcdTY3MDBcdThGRDFcdTRFMDBcdTZCMjFcdTVCOENcdTYyMTBcdTY1RTVcdTY3MUZcdUZGMENcdTY1RTBcdTUyMTlcdTRFM0EgbnVsbCAqL1xuICBsYXN0RG9uZTogc3RyaW5nIHwgbnVsbDtcbn1cblxuLyoqIFx1NTE3Q1x1NUJCOSB3ZWJhcHAgXHU3Njg0IERheURhdGEgXHU2NzJBXHU1MjE3XHU1MUZBXHU3Njg0XHU1QjU3XHU2QkI1XHVGRjA4XHU5MDFBXHU4RkM3XHU3RDIyXHU1RjE1XHU3QjdFXHU1NDBEXHU5MDBGXHU0RjIwXHVGRjA5ICovXG5pbnRlcmZhY2UgUmljaERheURhdGEgZXh0ZW5kcyBEYXlEYXRhIHtcbiAgZ29hbFRhc2tDb21wbGV0aW9ucz86IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHVua25vd24+PjtcbiAgZ29hbFByb2dyZXNzPzogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbn1cblxuLyoqIFx1OTU1Q1x1NTBDRiB3ZWJhcHAgX2J1aWxkRGF0YUNhY2hlXHVGRjFBXHU2MzA5XHU1OTI5XHU4MDVBXHU1NDA4XHU2QkNGXHU0RTJBIGdvYWwgXHU3Njg0XHU2RDNCXHU4REMzL1x1NUI4Q1x1NjIxMC9cdThGREJcdTVFQTYgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENhY2hlKGdvYWxzOiBHb2FsSXRlbVtdLCBkYXlzOiBEYXlEYXRhW10pOiBEZXZpYXRpb25DYWNoZSB7XG4gIGNvbnN0IGdvYWxJZHMgPSAoZ29hbHMgfHwgW10pLm1hcCgoZykgPT4gZy5pZCk7XG4gIGNvbnN0IGJ5RGF0ZUtleTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgRGF5Q2FjaGVFbnRyeT4+ID0ge307XG4gIGNvbnN0IGl0ZW1Db21wbGV0aW9uczogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgbnVtYmVyPj4gPSB7fTtcbiAgY29uc3QgaXRlbUxhc3REb25lOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiA9IHt9O1xuXG4gIGZvciAoY29uc3QgcmF3IG9mIGRheXMgfHwgW10pIHtcbiAgICBjb25zdCBkYXkgPSByYXcgYXMgUmljaERheURhdGE7XG4gICAgY29uc3QgY29tcGxldGlvbnNCeUdvYWwgPSBkYXkuZ29hbFRhc2tDb21wbGV0aW9ucztcbiAgICBjb25zdCBwcm9ncmVzc01hcCA9IGRheS5nb2FsUHJvZ3Jlc3M7XG4gICAgaWYgKCFjb21wbGV0aW9uc0J5R29hbCAmJiAhcHJvZ3Jlc3NNYXApIGNvbnRpbnVlO1xuXG4gICAgY29uc3QgZW50cnk6IFJlY29yZDxzdHJpbmcsIERheUNhY2hlRW50cnk+ID0ge307XG4gICAgZm9yIChjb25zdCBnaWQgb2YgZ29hbElkcykge1xuICAgICAgbGV0IGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIGlmIChjb21wbGV0aW9uc0J5R29hbCAmJiBjb21wbGV0aW9uc0J5R29hbFtnaWRdKSB7XG4gICAgICAgIGNvbnN0IGdNYXAgPSBjb21wbGV0aW9uc0J5R29hbFtnaWRdIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZdIG9mIE9iamVjdC5lbnRyaWVzKGdNYXApKSB7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgLy8gXHU1QjUwXHU5ODc5XHU3RUE3XHU3RDJGXHU4QkExXHVGRjA4a2V5IFx1NTM3MyBpdGVtcyBcdTRFMEJcdTY4MDdcdUZGMDlcbiAgICAgICAgICAgIGl0ZW1Db21wbGV0aW9uc1tnaWRdID0gaXRlbUNvbXBsZXRpb25zW2dpZF0gfHwge307XG4gICAgICAgICAgICBpdGVtQ29tcGxldGlvbnNbZ2lkXVtrZXldID0gKGl0ZW1Db21wbGV0aW9uc1tnaWRdW2tleV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgaXRlbUxhc3REb25lW2dpZF0gPSBpdGVtTGFzdERvbmVbZ2lkXSB8fCB7fTtcbiAgICAgICAgICAgIGlmICghaXRlbUxhc3REb25lW2dpZF1ba2V5XSB8fCBkYXkuZGF0ZSA+IGl0ZW1MYXN0RG9uZVtnaWRdW2tleV0pIHtcbiAgICAgICAgICAgICAgaXRlbUxhc3REb25lW2dpZF1ba2V5XSA9IGRheS5kYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcHJvZyA9IHByb2dyZXNzTWFwID8gcHJvZ3Jlc3NNYXBbZ2lkXSA6IHVuZGVmaW5lZDtcbiAgICAgIGlmIChhY3RpdmUgfHwgcHJvZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVudHJ5W2dpZF0gPSB7IGFjdGl2ZSwgY29tcGxldGlvbnM6IGNvdW50LCBwcm9ncmVzczogcHJvZyB9O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZW50cnkpLmxlbmd0aCA+IDApIHtcbiAgICAgIGJ5RGF0ZUtleVtkYXkuZGF0ZV0gPSBlbnRyeTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBieURhdGVLZXksIGdvYWxJZHMsIHRvdGFsRGF5czogKGRheXMgfHwgW10pLmxlbmd0aCwgaXRlbUNvbXBsZXRpb25zLCBpdGVtTGFzdERvbmUgfTtcbn1cblxuLyoqIFx1NTQyQlx1N0FFRlx1NzBCOVx1NzY4NFx1NURFNVx1NEY1Q1x1NjVFNVx1OEJBMVx1NjU3MFx1RkYwOFx1NTQ2OFx1NEUwMH5cdTU0NjhcdTRFOTRcdUZGMDkgKi9cbmZ1bmN0aW9uIGNvdW50V29ya2RheXMoc3RhcnQ6IERhdGUsIGVuZDogRGF0ZSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDA7XG4gIGNvbnN0IGN1ciA9IG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIHN0YXJ0LmdldE1vbnRoKCksIHN0YXJ0LmdldERhdGUoKSk7XG4gIGNvbnN0IGxhc3QgPSBuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwgZW5kLmdldE1vbnRoKCksIGVuZC5nZXREYXRlKCkpO1xuICBpZiAoY3VyID4gbGFzdCkgcmV0dXJuIDA7XG4gIHdoaWxlIChjdXIgPD0gbGFzdCkge1xuICAgIGNvbnN0IGRvdyA9IGN1ci5nZXREYXkoKTtcbiAgICBpZiAoZG93ICE9PSAwICYmIGRvdyAhPT0gNikgY291bnQrKztcbiAgICBjdXIuc2V0RGF0ZShjdXIuZ2V0RGF0ZSgpICsgMSk7XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufVxuXG5mdW5jdGlvbiBwYXJzZURhdGUocz86IHN0cmluZyk6IERhdGUgfCBudWxsIHtcbiAgaWYgKCFzKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZCA9IG5ldyBEYXRlKGAke3N9VDAwOjAwOjAwYCk7XG4gIHJldHVybiBpc05hTihkLmdldFRpbWUoKSkgPyBudWxsIDogZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHb2FsRGV2aWF0aW9uIHtcbiAgZ29hbElkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGV4cGVjdGVkUHJvZ3Jlc3M6IG51bWJlcjsgLy8gMC0xMDBcbiAgYWN0dWFsUHJvZ3Jlc3M6IG51bWJlcjsgLy8gMC0xMDBcbiAgZGV2aWF0aW9uUmF0ZTogbnVtYmVyOyAvLyAtMS4uMVxuICBzdGF0dXM6IERldmlhdGlvblN0YXR1cztcbiAgc3RhZ25hdGlvbjogYm9vbGVhbjtcbiAgcmVjZW50QWN0aXZpdHk6IG51bWJlcjsgLy8gXHU4RkQxIDcgXHU1OTI5XHU1QjhDXHU2MjEwXHU2NTcwXG59XG5cbmNvbnN0IGNsYW1wID0gKG46IG51bWJlciwgbG86IG51bWJlciwgaGk6IG51bWJlcikgPT4gTWF0aC5tYXgobG8sIE1hdGgubWluKGhpLCBuKSk7XG5cbi8qKiBcdThCQTFcdTdCOTdcdTUzNTVcdTc2RUVcdTY4MDdcdTUwNEZcdTVERUVcdUZGMDh0b2RheSBcdTUzRUZcdTZDRThcdTUxNjVcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlR29hbERldmlhdGlvbihcbiAgZ29hbDogR29hbEl0ZW0sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgdG9kYXk6IERhdGUgPSBuZXcgRGF0ZSgpXG4pOiBHb2FsRGV2aWF0aW9uIHtcbiAgY29uc3Qgc3RhcnQgPSBwYXJzZURhdGUoZ29hbC5zdGFydERhdGUpO1xuICBjb25zdCBlbmQgPSBwYXJzZURhdGUoZ29hbC5lbmREYXRlKTtcbiAgY29uc3QgYWN0dWFsUHJvZ3Jlc3MgPSBjbGFtcChOdW1iZXIoZ29hbC5wcm9ncmVzcykgfHwgMCwgMCwgMTAwKTtcblxuICBsZXQgZXhwZWN0ZWRQcm9ncmVzczogbnVtYmVyO1xuICBsZXQgaGFzRGF0ZXMgPSBmYWxzZTtcbiAgaWYgKHN0YXJ0ICYmIGVuZCAmJiBzdGFydCA8PSBlbmQpIHtcbiAgICBoYXNEYXRlcyA9IHRydWU7XG4gICAgY29uc3QgdG90YWwgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCBlbmQpO1xuICAgIGNvbnN0IGVsYXBzZWQgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCB0b2RheSk7XG4gICAgZXhwZWN0ZWRQcm9ncmVzcyA9IHRvdGFsID4gMCA/IGNsYW1wKChlbGFwc2VkIC8gdG90YWwpICogMTAwLCAwLCAxMDApIDogNTA7XG4gIH0gZWxzZSB7XG4gICAgZXhwZWN0ZWRQcm9ncmVzcyA9IDUwOyAvLyBcdTdGM0FcdTY1RTVcdTY3MUZcdUZGMUFcdTRGRERcdTVCODhcdTRFMkRcdTYwMjdcdTU3RkFcdTUxQzZcbiAgfVxuXG4gIGNvbnN0IGRpZmYgPSBhY3R1YWxQcm9ncmVzcyAtIGV4cGVjdGVkUHJvZ3Jlc3M7XG4gIGNvbnN0IGRldmlhdGlvblJhdGUgPSBleHBlY3RlZFByb2dyZXNzID4gMCA/IGNsYW1wKChhY3R1YWxQcm9ncmVzcyAtIGV4cGVjdGVkUHJvZ3Jlc3MpIC8gZXhwZWN0ZWRQcm9ncmVzcywgLTEsIDEpIDogMDtcblxuICAvLyBcdTUwNUNcdTZFREVcdUZGMUFcdTdBOTdcdTUzRTNcdTY3MDlcdTY1RTVcdTY3MUZcdTMwMDFcdTRGNDZcdThCRTUgZ29hbCBcdTUxNjhcdTdBMEJcdTY1RTBcdTRFRkJcdTRGNTUgYWN0aXZlXHVGRjA4XHU0RUZCXHU1MkExXHU1QjhDXHU2MjEwXHVGRjA5XHU1OTI5XHVGRjA4ZG9uZSBcdTRFMERcdTdCOTdcdTUwNUNcdTZFREVcdUZGMDlcbiAgY29uc3QgaGFkRGF5cyA9IGNhY2hlLnRvdGFsRGF5cyA+IDA7XG4gIGxldCBldmVyQWN0aXZlID0gZmFsc2U7XG4gIGxldCByZWNlbnRBY3Rpdml0eSA9IDA7XG4gIGNvbnN0IGN1dG9mZiA9IG5ldyBEYXRlKHRvZGF5LmdldEZ1bGxZZWFyKCksIHRvZGF5LmdldE1vbnRoKCksIHRvZGF5LmdldERhdGUoKSk7XG4gIGN1dG9mZi5zZXREYXRlKGN1dG9mZi5nZXREYXRlKCkgLSA3KTtcbiAgZm9yIChjb25zdCBbZGF0ZUtleSwgZW50cnldIG9mIE9iamVjdC5lbnRyaWVzKGNhY2hlLmJ5RGF0ZUtleSkpIHtcbiAgICBjb25zdCBlID0gZW50cnlbZ29hbC5pZF07XG4gICAgaWYgKCFlKSBjb250aW51ZTtcbiAgICBpZiAoZS5hY3RpdmUpIGV2ZXJBY3RpdmUgPSB0cnVlO1xuICAgIGNvbnN0IGQgPSBwYXJzZURhdGUoZGF0ZUtleSk7XG4gICAgaWYgKGQgJiYgZCA+PSBjdXRvZmYpIHJlY2VudEFjdGl2aXR5ICs9IGUuY29tcGxldGlvbnMgfHwgMDtcbiAgfVxuICBjb25zdCBzdGFnbmF0aW9uID0gaGFkRGF5cyAmJiAhZXZlckFjdGl2ZSAmJiBhY3R1YWxQcm9ncmVzcyA8IDEwMDtcblxuICAvLyBcdTcyQjZcdTYwMDFcdTUyMjRcdTVCOUFcbiAgbGV0IHN0YXR1czogRGV2aWF0aW9uU3RhdHVzO1xuICBpZiAoYWN0dWFsUHJvZ3Jlc3MgPj0gMTAwKSB7XG4gICAgc3RhdHVzID0gJ2RvbmUnO1xuICB9IGVsc2UgaWYgKHN0YWduYXRpb24gJiYgZGlmZiA8IDApIHtcbiAgICBzdGF0dXMgPSAnc3R1Y2snO1xuICB9IGVsc2UgaWYgKCFoYXNEYXRlcykge1xuICAgIC8vIFx1N0YzQVx1NjVFNVx1NjcxRlx1RkYxQVx1NTNFQVx1N0VEOVx1OEY3Qlx1OTFDRlx1NTIyNFx1NUI5QVx1RkYwQ1x1NEUwRFx1NjgwNyBzdHVjay9hdF9yaXNrXG4gICAgc3RhdHVzID0gZGlmZiA8IDAgPyAnYmVoaW5kJyA6ICdvbl90cmFjayc7XG4gIH0gZWxzZSBpZiAoZGlmZiA8PSAtMTUpIHtcbiAgICBzdGF0dXMgPSAnYXRfcmlzayc7XG4gIH0gZWxzZSBpZiAoZGlmZiA8IDApIHtcbiAgICBzdGF0dXMgPSAnYmVoaW5kJztcbiAgfSBlbHNlIHtcbiAgICBzdGF0dXMgPSAnb25fdHJhY2snO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnb2FsSWQ6IGdvYWwuaWQsXG4gICAgdGl0bGU6IGdvYWwudGl0bGUsXG4gICAgZXhwZWN0ZWRQcm9ncmVzczogTWF0aC5yb3VuZChleHBlY3RlZFByb2dyZXNzKSxcbiAgICBhY3R1YWxQcm9ncmVzczogTWF0aC5yb3VuZChhY3R1YWxQcm9ncmVzcyksXG4gICAgZGV2aWF0aW9uUmF0ZSxcbiAgICBzdGF0dXMsXG4gICAgc3RhZ25hdGlvbixcbiAgICByZWNlbnRBY3Rpdml0eSxcbiAgfTtcbn1cblxuLyoqIFx1NEVBN1x1NTFGQVx1N0VEOSBHb2FsRGlhZ25vc2VyIFx1NzY4NFx1N0QyN1x1NTFEMVx1NjMwN1x1NjgwN1x1NjU4N1x1NjcyQ1x1RkYwOFx1NkJDRlx1NzZFRVx1NjgwN1x1NEUwMFx1ODg0Q1x1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1bW1hcml6ZShnb2FsczogR29hbEl0ZW1bXSwgY2FjaGU6IERldmlhdGlvbkNhY2hlLCB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKCkpOiBzdHJpbmcge1xuICBpZiAoIWdvYWxzIHx8IGdvYWxzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICdcdUZGMDhcdTY1RTBcdTc2RUVcdTY4MDdcdUZGMDknO1xuICByZXR1cm4gZ29hbHNcbiAgICAubWFwKChnKSA9PiB7XG4gICAgICBjb25zdCBkID0gY29tcHV0ZUdvYWxEZXZpYXRpb24oZywgY2FjaGUsIHRvZGF5KTtcbiAgICAgIGNvbnN0IGZsYWcgPSBkLnN0YWduYXRpb24gPyAnIFtcdTUwNUNcdTZFREVdJyA6ICcnO1xuICAgICAgcmV0dXJuIGAtICR7Zy50aXRsZX1cdUZGNUNcdTcyQjZcdTYwMDE9JHtkLnN0YXR1c30ke2ZsYWd9XHVGRjVDXHU5ODg0XHU2NzFGXHU4RkRCXHU1RUE2PSR7ZC5leHBlY3RlZFByb2dyZXNzfSUgXHU1QjlFXHU5NjQ1PSR7ZC5hY3R1YWxQcm9ncmVzc30lXHVGRjVDXHU1MDRGXHU1REVFPSR7KGQuZGV2aWF0aW9uUmF0ZSAqIDEwMCkudG9GaXhlZCgwKX0lXHVGRjVDXHU4RkQxN1x1NTkyOVx1NUI4Q1x1NjIxMD0ke2QucmVjZW50QWN0aXZpdHl9YDtcbiAgICB9KVxuICAgIC5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBcdTVCNTBcdTk4NzlcdTdFQTdcdThCQzFcdTYzNkVcdUZGMUFcdTYyOEFcdTMwMENcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzkgKyBcdTgyODJcdTU5NEZcdTUwNEZcdTVERUUgKyBcdTVCOENcdTYyMTBcdThCQjBcdTVGNTVcdTMwMERcdTdCOTdcdTUxRkFcdTY3NjVcdUZGMENcbiAqIFx1OEJBOSBBSSBcdThCQ0FcdTY1QURcdTgwRkRcdTU3RkFcdTRFOEVcdTc3MUZcdTVCOUVcdTY1NzBcdTYzNkVcdTVGNTJcdTU2RTBcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTUxRURcdTdBN0FcdTdGMTZcdTkwMjBcdTVCNTBcdTk4NzlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkSXRlbUV2aWRlbmNlKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IEl0ZW1FdmlkZW5jZVtdIHtcbiAgY29uc3QgaXRlbXMgPSBnb2FsLml0ZW1zID8/IFtdO1xuICBjb25zdCBnaWQgPSBnb2FsLmlkO1xuICByZXR1cm4gaXRlbXMubWFwKChpdCwgaSkgPT4ge1xuICAgIGNvbnN0IGlkeCA9IFN0cmluZyhpKTtcbiAgICBjb25zdCBkb25lID0gY2FjaGUuaXRlbUNvbXBsZXRpb25zW2dpZF0/LltpZHhdID8/IDA7XG4gICAgY29uc3QgbGFzdCA9IGNhY2hlLml0ZW1MYXN0RG9uZVtnaWRdPy5baWR4XSA/PyBudWxsO1xuXG4gICAgbGV0IHBlcmNlbnQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgaXQucGVyY2VudCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHBlcmNlbnQgPSBpdC5wZXJjZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0ID0gTnVtYmVyKGl0LnRhcmdldFZhbHVlKTtcbiAgICAgIGNvbnN0IGMgPSBOdW1iZXIoaXQuY3VycmVudFZhbHVlKTtcbiAgICAgIGlmICh0ID4gMCkgcGVyY2VudCA9IGNsYW1wKChjIC8gdCkgKiAxMDAsIDAsIDEwMCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnQgPSBwYXJzZURhdGUoaXQuc3RhcnREYXRlID8/IGdvYWwuc3RhcnREYXRlKTtcbiAgICBjb25zdCBlbmQgPSBwYXJzZURhdGUoaXQuZW5kRGF0ZSA/PyBnb2FsLmVuZERhdGUpO1xuICAgIGxldCBwYWNlUGN0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICBpZiAoc3RhcnQgJiYgZW5kICYmIHN0YXJ0IDw9IGVuZCkge1xuICAgICAgY29uc3QgdG90YWwgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCBlbmQpO1xuICAgICAgY29uc3QgZWxhcHNlZCA9IGNvdW50V29ya2RheXMoc3RhcnQsIHRvZGF5KTtcbiAgICAgIHBhY2VQY3QgPSB0b3RhbCA+IDAgPyBjbGFtcCgoZWxhcHNlZCAvIHRvdGFsKSAqIDEwMCwgMCwgMTAwKSA6IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHBhY2VEZXZpYXRpb24gPVxuICAgICAgcGVyY2VudCAhPSBudWxsICYmIHBhY2VQY3QgIT0gbnVsbCA/IE1hdGgucm91bmQocGVyY2VudCAtIHBhY2VQY3QpIDogbnVsbDtcblxuICAgIHJldHVybiB7XG4gICAgICBpbmRleDogaSxcbiAgICAgIG5hbWU6IGl0Lm5hbWUsXG4gICAgICBkYWlseU1pbjogaXQuZGFpbHlNaW4gPz8gJycsXG4gICAgICBwZXJjZW50LFxuICAgICAgcGFjZVBjdCxcbiAgICAgIHBhY2VEZXZpYXRpb24sXG4gICAgICBkb25lRGF5czogZG9uZSxcbiAgICAgIGxhc3REb25lOiBsYXN0LFxuICAgIH07XG4gIH0pO1xufVxuXG4vKiogXHU2MzA5IGdvYWwudGl0bGUgXHU3RDIyXHU1RjE1XHU3Njg0XHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHVGRjA4XHU0RjlCIERpYWdub3Npc01vZGFsIFx1NUM1NVx1NzkzQVx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkSXRlbUV2aWRlbmNlTWFwKFxuICBnb2FsczogR29hbEl0ZW1bXSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IFJlY29yZDxzdHJpbmcsIEl0ZW1FdmlkZW5jZVtdPiB7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgSXRlbUV2aWRlbmNlW10+ID0ge307XG4gIGZvciAoY29uc3QgZyBvZiBnb2FscyB8fCBbXSkge1xuICAgIG91dFtnLnRpdGxlXSA9IGJ1aWxkSXRlbUV2aWRlbmNlKGcsIGNhY2hlLCB0b2RheSk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqIFx1N0VEOSBBSSBcdTYzRDBcdTc5M0FcdThCQ0RcdTc2ODRcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTRFMEFcdTRFMEJcdTY1ODdcdTY1ODdcdTY3MkNcdUZGMDhcdTc5ODFcdTZCNjJcdTdGMTZcdTkwMjBcdTc2ODRcdTMwMENcdTc2N0RcdTU0MERcdTUzNTVcdTMwMERcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRJdGVtRXZpZGVuY2VGb3JQcm9tcHQoXG4gIGdvYWxzOiBHb2FsSXRlbVtdLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlID0gbmV3IERhdGUoKVxuKTogc3RyaW5nIHtcbiAgaWYgKCFnb2FscyB8fCBnb2Fscy5sZW5ndGggPT09IDApIHJldHVybiAnXHVGRjA4XHU2NUUwXHU1QjUwXHU5ODc5XHU2NTcwXHU2MzZFXHVGRjA5JztcbiAgcmV0dXJuIGdvYWxzXG4gICAgLm1hcCgoZykgPT4ge1xuICAgICAgY29uc3QgZXZzID0gYnVpbGRJdGVtRXZpZGVuY2UoZywgY2FjaGUsIHRvZGF5KTtcbiAgICAgIGNvbnN0IGxpbmVzID0gZXZzLmxlbmd0aFxuICAgICAgICA/IGV2c1xuICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgKGUpID0+XG4gICAgICAgICAgICAgICAgYCAgICAtIFske2UuaW5kZXh9XSAke2UubmFtZX1cdUZGNUNkYWlseU1pbj0ke2UuZGFpbHlNaW4gfHwgJz8nfVx1RkY1Q1x1NUI4Q1x1NjIxMFx1NUVBNj0ke1xuICAgICAgICAgICAgICAgICAgZS5wZXJjZW50ICE9IG51bGwgPyBlLnBlcmNlbnQgKyAnJScgOiAnPydcbiAgICAgICAgICAgICAgICB9XHVGRjVDXHU4MjgyXHU1OTRGXHU1RTk0XHU1QjhDXHU2MjEwPSR7ZS5wYWNlUGN0ICE9IG51bGwgPyBlLnBhY2VQY3QgKyAnJScgOiAnPyd9XHVGRjVDXHU4MjgyXHU1OTRGXHU1MDRGXHU1REVFPSR7XG4gICAgICAgICAgICAgICAgICBlLnBhY2VEZXZpYXRpb24gIT0gbnVsbCA/IGUucGFjZURldmlhdGlvbiArICdwdCcgOiAnPydcbiAgICAgICAgICAgICAgICB9XHVGRjVDXHU3QTk3XHU1M0UzXHU1MTg1XHU1QjhDXHU2MjEwICR7ZS5kb25lRGF5c30gXHU1OTI5XHVGRjA4XHU2NzAwXHU4RkQxICR7ZS5sYXN0RG9uZSA/PyAnXHU2NUUwJ31cdUZGMDlgXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuam9pbignXFxuJylcbiAgICAgICAgOiAnICAgIFx1RkYwOFx1NjVFMFx1NUI1MFx1OTg3OVx1RkYwOSc7XG4gICAgICByZXR1cm4gYFx1NzZFRVx1NjgwN1x1MzAwQyR7Zy50aXRsZX1cdTMwMERcdUZGMDhnb2FsSWQ9JHtnLmlkfVx1RkYwOVx1RkYxQVxcbiR7bGluZXN9YDtcbiAgICB9KVxuICAgIC5qb2luKCdcXG4nKTtcbn1cbiIsICIvKipcbiAqIGhlYWx0aFNjb3JlLnRzIFx1MjAxNCBcdTc2RUVcdTY4MDdcdTUwNjVcdTVFQjdcdTUyMDZcdThCQzRcdTUyMDZcdTdDRkJcdTdFREZcdUZGMDhcdTYzRDJcdTRFRjZcdTRGQTdcdTdFQUZcdTUxRkRcdTY1NzBcdTVGMTVcdTY0Q0VcdUZGMENUUyBcdTc5RkJcdTY5MERcdUZGMDlcbiAqXG4gKiBcdTRFMEUgd2ViYXBwIGBHb2FsSGVhbHRoU2NvcmVgIDEwMCUgXHU1NDBDXHU1M0UzXHU1Rjg0XHVGRjBDXHU0RjQ2XHVGRjFBXG4gKiAgLSBcdTRFMERcdThCRkJcdTUxNjhcdTVDNDAgYHN0b3JlYFx1RkYwQ1x1N0YxM1x1NUI1OFx1NzZGNFx1NjNBNVx1NTkwRFx1NzUyOCBgRGV2aWF0aW9uQ2FsY3VsYXRvci5idWlsZENhY2hlYCBcdTc2ODQgYERldmlhdGlvbkNhY2hlYFxuICogICAgXHVGRjA4YnlEYXRlS2V5W2RhdGVLZXldW2dvYWxJZF0ue2FjdGl2ZSwgY29tcGxldGlvbnMsIHByb2dyZXNzfSBcdTVGNjJcdTcyQjZcdTVCOENcdTUxNjhcdTRFMDBcdTgxRjRcdUZGMDlcdUZGMUJcbiAqICAtIGB0b2RheWAgXHU0RjVDXHU0RTNBXHU1RkM1XHU1ODZCXHU1M0MyXHU2NTcwXHU2Q0U4XHU1MTY1XHVGRjA4XHU1M0VGXHU1MzU1XHU2RDRCXHUzMDAxXHU3ODZFXHU1QjlBXHU2MDI3XHVGRjA5XHVGRjFCXG4gKiAgLSBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDXHU1M0VGXHU1MzU1XHU2RDRCXHUzMDAyXG4gKlxuICogXHU0RTA5XHU1QzQyXHU4QkM0XHU1MjA2XHU0RjUzXHU3Q0ZCXHVGRjA4XHU4QkJFXHU4QkExXHU1NEYyXHU1QjY2XHU4OUMxIGRvY3MvcGxhbnMvMjAyNi0wNy0xNi1oZWFsdGgtc2NvcmUtZGlhZ25vc2lzLWRlc2lnbi5tZFx1RkYwOVx1RkYxQVxuICogIEwxIFx1NTdGQVx1Nzg0MFx1NTA2NVx1NUVCN1x1NTIwNlx1RkYwOFx1NUM2NVx1N0VBNlx1ODBGRFx1NTI5Qlx1RkYwOTQ1JSBcdTIwMTQgXHU2MzA5XHU2NUY2IDMwJSAvIFx1OTAwMlx1NUVBNlx1NjNEMFx1NTI0RCAxMCUgLyBcdTU0NjhcdTZEM0JcdThEQzMgNSVcbiAqICBMMiBcdThEOEJcdTUyQkZcdTUyQThcdTUyOUJcdTUyMDZcdUZGMDhcdTYyMTBcdTk1N0ZcdTgwRkRcdTUyOUJcdUZGMDkzMCUgXHUyMDE0IFx1OEZEQlx1NUVBNlx1OEQ4Qlx1NTJCRiAyMCUgLyBcdTVCOENcdTYyMTBcdThEOEJcdTUyQkYgMTAlXG4gKiAgTDMgXHU1M0VGXHU2MzAxXHU3RUVEXHU2MDI3XHU1MjA2XHVGRjA4XHU1MDY1XHU1RUI3XHU3QTBCXHU1RUE2XHVGRjA5MjUlIFx1MjAxNCBcdTUwNUNcdTZFREVcdTYwRTlcdTdGNUEgLyBcdTU3NDdcdTg4NjFcdTVFQTYgLyBcdThGQzdcdTVFQTZcdThEODVcdTUyNERcdTYwRTlcdTdGNUEgLyBcdTYyRDZcdTVFRjZcdTYwRTlcdTdGNUFcbiAqXG4gKiBcdTUzQ0RcdTc2RjRcdTg5QzlcdTRFRjdcdTUwM0NcdTg5QzJcdUZGMDhBSSBcdThCQ0FcdTY1QURcdTVGQzVcdTk4N0JcdTYzQTVcdTRGNEZcdUZGMDlcdUZGMUFcbiAqICAtIFx1MzAwQ1x1OTg4Nlx1NTE0OFx1MzAwRFx1MjI2MFx1MzAwQ1x1NTA2NVx1NUVCN1x1MzAwRFx1RkYxQVx1OEZDN1x1NUVBNlx1OEQ4NVx1NTI0RFx1RkYwOFx1NjNEMFx1NTI0RCA+MyBcdTVERTVcdTRGNUNcdTY1RTVcdTVCOENcdTYyMTBcdUZGMDlcdTg4QUJcdTYwRTlcdTdGNUFcdUZGMUJcbiAqICAtIFx1NTA1Q1x1NkVERVx1NjMwN1x1NjU3MFx1N0VBN1x1NjA3Nlx1NTMxNlx1RkYxQShkYXlzLzUpXjEuNVx1RkYxQlxuICogIC0gXHU1QjUwXHU5ODc5XHU4RDhBXHU1NzQ3XHU4ODYxXHU4RDhBXHU1MDY1XHU1RUI3XHVGRjA4XHU4RkRCXHU1RUE2XHU2ODA3XHU1MUM2XHU1REVFXHU4RDhBXHU1QzBGXHU4RDhBXHU1OTdEXHVGRjA5XHVGRjFCXG4gKiAgLSBcdTVGNTJcdTU2RTBcdTYzMDlcdTMwMENcdTdFRjRcdTVFQTZcdTMwMERcdTgwMENcdTk3NUVcdTMwMENcdTY2MkZcdTU0MjZcdTg0M0RcdTU0MEVcdTMwMERcdTMwMDJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IERldmlhdGlvbkNhY2hlIH0gZnJvbSAnLi9EZXZpYXRpb25DYWxjdWxhdG9yJztcbmltcG9ydCB0eXBlIHsgR29hbEl0ZW0sIEdvYWxTdWJJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCB0eXBlIEhlYWx0aExldmVsID0gJ2V4Y2VsbGVudCcgfCAnZ29vZCcgfCAnd2FybmluZycgfCAncmlzayc7XG5leHBvcnQgdHlwZSBIZWFsdGhEaW1lbnNpb24gPSAnTDEnIHwgJ0wyJyB8ICdMMyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoU3ViU2NvcmUge1xuICBzY29yZTogbnVtYmVyO1xuICBoaW50Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWx0aEwxIGV4dGVuZHMgSGVhbHRoU3ViU2NvcmUge1xuICBvblRpbWU6IEhlYWx0aFN1YlNjb3JlO1xuICBtb2RlcmF0ZUVhcmx5OiBIZWFsdGhTdWJTY29yZTtcbiAgd2Vla2x5QWN0aXZlOiBIZWFsdGhTdWJTY29yZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhMMiBleHRlbmRzIEhlYWx0aFN1YlNjb3JlIHtcbiAgcHJvZ3Jlc3NUcmVuZDogSGVhbHRoU3ViU2NvcmU7XG4gIGNvbXBsZXRpb25UcmVuZDogSGVhbHRoU3ViU2NvcmU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoU3RhZ25hdGlvbiB7XG4gIHBlbmFsdHk6IG51bWJlcjtcbiAgaGludD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhMMyBleHRlbmRzIEhlYWx0aFN1YlNjb3JlIHtcbiAgc3RhZ25hdGlvbjogSGVhbHRoU3RhZ25hdGlvbjtcbiAgYmFsYW5jZTogSGVhbHRoU3ViU2NvcmU7XG4gIG92ZXJFYXJseTogSGVhbHRoU3RhZ25hdGlvbjtcbiAgZGVsYXk6IEhlYWx0aFN0YWduYXRpb247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoUmVzdWx0IHtcbiAgc2NvcmU6IG51bWJlcjtcbiAgbGV2ZWw6IEhlYWx0aExldmVsO1xuICBsYWJlbDogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBMMTogSGVhbHRoTDE7XG4gIEwyOiBIZWFsdGhMMjtcbiAgTDM6IEhlYWx0aEwzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWx0aFNldCB7XG4gIGF2Z1Njb3JlOiBudW1iZXI7XG4gIGF2Z0xldmVsOiBIZWFsdGhMZXZlbDtcbiAgYXZnTGFiZWw6IHN0cmluZztcbiAgYXZnQ29sb3I6IHN0cmluZztcbiAgY291bnQ6IG51bWJlcjtcbiAgTDE6IG51bWJlcjtcbiAgTDI6IG51bWJlcjtcbiAgTDM6IG51bWJlcjtcbiAgdHJlbmQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgSGVhbHRoSGludFR5cGUgPSAnZGFuZ2VyJyB8ICd3YXJuaW5nJyB8ICdzdWNjZXNzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhIaW50IHtcbiAgLyoqIFx1OEJFNVx1NUY1Mlx1NTZFMFx1NjMwN1x1NTQxMVx1NzY4NFx1NTA2NVx1NUVCN1x1NTIwNlx1N0VGNFx1NUVBNlx1RkYwOFx1NEY5Qlx1OEJDQVx1NjVBRFx1NjNEMFx1NzkzQVx1OEJDRFx1NjMwOVx1N0VGNFx1NUVBNlx1NUJGOVx1OUY1MFx1NUVGQVx1OEJBRVx1RkYwOSAqL1xuICBkaW1lbnNpb246IEhlYWx0aERpbWVuc2lvbjtcbiAgdHlwZTogSGVhbHRoSGludFR5cGU7XG4gIGljb246IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBhY3Rpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IFRVTklORyA9IHtcbiAgLy8gXHU0RTA5XHU1QzQyXHU2MDNCXHU1MjA2XHU2NzQzXHU5MUNEXG4gIFdFSUdIVF9MMTogMC40NSxcbiAgV0VJR0hUX0wyOiAwLjMsXG4gIFdFSUdIVF9MMzogMC4yNSxcblxuICAvLyBMMSBcdTUxODVcdTkwRThcdTVCNTBcdTk4NzlcdTY3NDNcdTkxQ0RcbiAgTDFfT05fVElNRTogMC4zLFxuICBMMV9NT0RFUkFURV9FQVJMWTogMC4xLFxuICBMMV9XRUVLTFlfQUNUSVZFOiAwLjA1LFxuXG4gIC8vIEwyIFx1NTE4NVx1OTBFOFx1NUI1MFx1OTg3OVx1Njc0M1x1OTFDRFxuICBMMl9QUk9HUkVTU19UUkVORDogMC4yLFxuICBMMl9DT01QTEVUSU9OX1RSRU5EOiAwLjEsXG5cbiAgLy8gTDMgXHU1MTg1XHU5MEU4XHU1RTczXHU4ODYxXHU1MjA2XHU2NzQzXHU5MUNEXG4gIEwzX0JBTEFOQ0U6IDAuMSxcblxuICAvLyBcdTU0NjhcdTZEM0JcdThEQzNcdTVFQTYgLyBcdThGREJcdTVFQTZcdThEOEJcdTUyQkZcdTU2REVcdTZFQUZcdTU5MjlcdTY1NzBcbiAgUkVDRU5UX0RBWVM6IDcsXG4gIC8vIFx1NTA1Q1x1NkVERVx1NjhDMFx1NkQ0Qlx1NjcwMFx1NTkyN1x1NTZERVx1NkVBRlx1NTkyOVx1NjU3MFxuICBTVEFHTkFUSU9OX1dJTkRPVzogNjAsXG5cbiAgLy8gXHU4RkM3XHU1RUE2XHU4RDg1XHU1MjREIC8gXHU2MkQ2XHU1RUY2XHU1QkJEXHU1QkI5XHU1OTI5XHU2NTcwXHU0RTBFXHU2MEU5XHU3RjVBXHU3Q0ZCXHU2NTcwXG4gIFRPTEVSQU5DRV9FQVJMWV9EQVlTOiAzLFxuICBPVkVSX0VBUkxZX1BFTkFMVFlfTUFYOiA1MCxcbiAgT1ZFUl9FQVJMWV9QRU5BTFRZX1JBVEU6IDUsXG4gIFRPTEVSQU5DRV9ERUxBWV9EQVlTOiAzLFxuICBERUxBWV9QRU5BTFRZX01BWDogMzAsXG4gIERFTEFZX1BFTkFMVFlfUkFURTogMyxcblxuICAvLyBcdTUwNUNcdTZFREVcdTYwRTlcdTdGNUFcdTYzMDdcdTY1NzBcdTY2RjJcdTdFQkZcbiAgU1RBR05BVElPTl9FWFBPTkVOVDogMS41LFxuICBTVEFHTkFUSU9OX0RJVklTT1I6IDUsXG4gIFNUQUdOQVRJT05fUEVOQUxUWV9NQVg6IDQwLFxuXG4gIC8vIFx1NUU3M1x1ODg2MVx1NTIwNlx1NjBFOVx1N0Y1QVx1N0NGQlx1NjU3MFxuICBCQUxBTkNFX1BFTkFMVFlfUkFURTogMS41LFxuXG4gIC8vIEwyIFx1OEZEQlx1NUVBNlx1OEQ4Qlx1NTJCRlx1NTIyNFx1NUI5QVx1OTYwOFx1NTAzQ1xuICBUUkVORF9BQ0NFTF9USFJFU0hPTEQ6IDUsXG5cbiAgLy8gXHU1RUZBXHU4QkFFXHU3Q0ZCXHU3RURGXHU5NjA4XHU1MDNDXG4gIFNVR0dFU1RJT05fTE9XOiA2MCxcbiAgU1VHR0VTVElPTl9ISUdIOiA4NSxcblxuICAvLyBcdTdFRkNcdTU0MDhcdThEOEJcdTUyQkZcdTY2MjBcdTVDMDRcbiAgVFJFTkRfU1RST05HX0hJR0g6IDc1LFxuICBUUkVORF9XRUFLX0hJR0g6IDYwLFxuICBUUkVORF9TVFJPTkdfTE9XOiA0MCxcbiAgVFJFTkRfV0VBS19MT1c6IDU1LFxuXG4gIC8vIFx1N0I0OVx1N0VBN1x1NTIxMlx1NTIwNlx1OTYwOFx1NTAzQ1xuICBMRVZFTF9FWENFTExFTlQ6IDg1LFxuICBMRVZFTF9HT09EOiA3MCxcbiAgTEVWRUxfV0FSTklORzogNTAsXG5cbiAgLy8gXHU4QkNBXHU2NUFEXHU3Q0ZCXHU3RURGXHU5NjA4XHU1MDNDXG4gIEhJTlRfTDE6IDcwLFxuICBISU5UX0wyOiA2MCxcbiAgSElOVF9MMzogNzAsXG4gIEhJTlRfTEFURV9HT0FMX1NDT1JFOiA2MCxcbiAgSElOVF9TVEFHTkFUSU9OX1BFTkFMVFk6IDE1LFxuICBISU5UX0JBTEFOQ0VfU0NPUkU6IDYwLFxuICBISU5UX0hJR0hfU0NPUkU6IDkwLFxufTtcblxuY29uc3QgTEVWRUxTOiBSZWNvcmQ8SGVhbHRoTGV2ZWwsIHsgbGFiZWw6IHN0cmluZzsgbWluOiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfT4gPSB7XG4gIGV4Y2VsbGVudDogeyBsYWJlbDogJ1x1NEYxOFx1NzlDMCcsIG1pbjogVFVOSU5HLkxFVkVMX0VYQ0VMTEVOVCwgY29sb3I6ICd2YXIoLS1iYW1ib28tcHJpbWFyeSknIH0sXG4gIGdvb2Q6IHsgbGFiZWw6ICdcdTgyNkZcdTU5N0QnLCBtaW46IFRVTklORy5MRVZFTF9HT09ELCBjb2xvcjogJ3ZhcigtLWJhbWJvby1saWdodCknIH0sXG4gIHdhcm5pbmc6IHsgbGFiZWw6ICdcdTk3MDBcdTUxNzNcdTZDRTgnLCBtaW46IFRVTklORy5MRVZFTF9XQVJOSU5HLCBjb2xvcjogJyNmNTllMGInIH0sXG4gIHJpc2s6IHsgbGFiZWw6ICdcdTk4Q0VcdTk2NjknLCBtaW46IDAsIGNvbG9yOiAnI2RjMzU0NScgfSxcbn07XG5cbmZ1bmN0aW9uIGNsYW1wKHY6IG51bWJlciwgbG86IG51bWJlciwgaGk6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1heChsbywgTWF0aC5taW4oaGksIHYpKTtcbn1cblxuZnVuY3Rpb24gZm10KGQ6IERhdGUpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7ZC5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyhkLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpfS0ke1N0cmluZyhkLmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xufVxuXG4vKiogXHU3RUFGXHU1MUZEXHU2NTcwXHVGRjFBXHU2Nzg0XHU5MDIwXHU2N0QwXHU1RTc0XHU3Njg0XHU2Q0Q1XHU1QjlBXHU4MjgyXHU1MDQ3XHU2NUU1ICsgXHU2NjI1XHU4MjgyXHU5NkM2XHU1NDA4XHVGRjA4XHU0RTBFIHdlYmFwcCBcdTUzRTNcdTVGODRcdTRFMDBcdTgxRjRcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEhvbGlkYXlzKHJlZlllYXI6IG51bWJlcik6IFNldDxzdHJpbmc+IHtcbiAgY29uc3QgaCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBhZGQgPSAoeTogbnVtYmVyLCBtOiBudW1iZXIsIGQ6IG51bWJlcikgPT5cbiAgICBoLmFkZChgJHt5fS0ke1N0cmluZyhtKS5wYWRTdGFydCgyLCAnMCcpfS0ke1N0cmluZyhkKS5wYWRTdGFydCgyLCAnMCcpfWApO1xuICBbcmVmWWVhciwgcmVmWWVhciArIDFdLmZvckVhY2goKHkpID0+IHtcbiAgICBhZGQoeSwgMSwgMSk7XG4gICAgYWRkKHksIDUsIDEpOyBhZGQoeSwgNSwgMik7IGFkZCh5LCA1LCAzKTtcbiAgICBhZGQoeSwgMTAsIDEpOyBhZGQoeSwgMTAsIDIpOyBhZGQoeSwgMTAsIDMpOyBhZGQoeSwgMTAsIDQpOyBhZGQoeSwgMTAsIDUpOyBhZGQoeSwgMTAsIDYpOyBhZGQoeSwgMTAsIDcpO1xuICAgIGFkZCh5LCA0LCA0KTsgYWRkKHksIDQsIDUpOyBhZGQoeSwgNCwgNik7XG4gICAgYWRkKHksIDYsIDkpOyBhZGQoeSwgNiwgMTApO1xuICAgIGFkZCh5LCA5LCAxNCk7IGFkZCh5LCA5LCAxNSk7IGFkZCh5LCA5LCAxNik7XG4gIH0pO1xuICBpZiAocmVmWWVhciA8PSAyMDI1ICYmIDIwMjUgPD0gcmVmWWVhciArIDEpIHtcbiAgICBbJzIwMjUtMDEtMjgnLCAnMjAyNS0wMS0yOScsICcyMDI1LTAxLTMwJywgJzIwMjUtMDEtMzEnLFxuICAgICAgJzIwMjUtMDItMDEnLCAnMjAyNS0wMi0wMicsICcyMDI1LTAyLTAzJywgJzIwMjUtMDItMDQnXS5mb3JFYWNoKChkKSA9PiBoLmFkZChkKSk7XG4gIH1cbiAgaWYgKHJlZlllYXIgPD0gMjAyNiAmJiAyMDI2IDw9IHJlZlllYXIgKyAxKSB7XG4gICAgWycyMDI2LTAyLTE2JywgJzIwMjYtMDItMTcnLCAnMjAyNi0wMi0xOCcsICcyMDI2LTAyLTE5JyxcbiAgICAgICcyMDI2LTAyLTIwJywgJzIwMjYtMDItMjEnLCAnMjAyNi0wMi0yMiddLmZvckVhY2goKGQpID0+IGguYWRkKGQpKTtcbiAgfVxuICByZXR1cm4gaDtcbn1cblxubGV0IF9ob2xpZGF5Q2FjaGU6IHsgeWVhcjogbnVtYmVyOyBzZXQ6IFNldDxzdHJpbmc+IH0gfCBudWxsID0gbnVsbDtcbmZ1bmN0aW9uIF9nZXRIb2xpZGF5cyh5ZWFyOiBudW1iZXIpOiBTZXQ8c3RyaW5nPiB7XG4gIGlmIChfaG9saWRheUNhY2hlICYmIF9ob2xpZGF5Q2FjaGUueWVhciA9PT0geWVhcikgcmV0dXJuIF9ob2xpZGF5Q2FjaGUuc2V0O1xuICBjb25zdCBzZXQgPSBidWlsZEhvbGlkYXlzKHllYXIpO1xuICBfaG9saWRheUNhY2hlID0geyB5ZWFyLCBzZXQgfTtcbiAgcmV0dXJuIHNldDtcbn1cblxuZnVuY3Rpb24gaXNXb3JrZGF5KGQ6IERhdGUsIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPik6IGJvb2xlYW4ge1xuICBjb25zdCBkYXkgPSBkLmdldERheSgpO1xuICBpZiAoZGF5ID09PSAwIHx8IGRheSA9PT0gNikgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gIWhvbGlkYXlzLmhhcyhmbXQoZCkpO1xufVxuXG5mdW5jdGlvbiBjb3VudFdvcmtkYXlzKGZyb206IERhdGUsIHRvOiBEYXRlLCBob2xpZGF5czogU2V0PHN0cmluZz4pOiBudW1iZXIge1xuICBsZXQgY291bnQgPSAwO1xuICBjb25zdCBjdXIgPSBuZXcgRGF0ZShmcm9tLmdldEZ1bGxZZWFyKCksIGZyb20uZ2V0TW9udGgoKSwgZnJvbS5nZXREYXRlKCkpO1xuICBjb25zdCBsYXN0ID0gbmV3IERhdGUodG8uZ2V0RnVsbFllYXIoKSwgdG8uZ2V0TW9udGgoKSwgdG8uZ2V0RGF0ZSgpKTtcbiAgaWYgKGN1ciA+IGxhc3QpIHJldHVybiAwO1xuICB3aGlsZSAoY3VyIDw9IGxhc3QpIHtcbiAgICBpZiAoaXNXb3JrZGF5KGN1ciwgaG9saWRheXMpKSBjb3VudCsrO1xuICAgIGN1ci5zZXREYXRlKGN1ci5nZXREYXRlKCkgKyAxKTtcbiAgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbmZ1bmN0aW9uIHdvcmtkYXlzQmV0d2Vlbihmcm9tOiBEYXRlLCB0bzogRGF0ZSwgaG9saWRheXM6IFNldDxzdHJpbmc+KTogbnVtYmVyIHtcbiAgY29uc3QgYSA9IG5ldyBEYXRlKGZyb20uZ2V0RnVsbFllYXIoKSwgZnJvbS5nZXRNb250aCgpLCBmcm9tLmdldERhdGUoKSk7XG4gIGNvbnN0IGIgPSBuZXcgRGF0ZSh0by5nZXRGdWxsWWVhcigpLCB0by5nZXRNb250aCgpLCB0by5nZXREYXRlKCkpO1xuICBpZiAoYiA+PSBhKSByZXR1cm4gY291bnRXb3JrZGF5cyhhLCBiLCBob2xpZGF5cyk7XG4gIHJldHVybiAtY291bnRXb3JrZGF5cyhiLCBhLCBob2xpZGF5cyk7XG59XG5cbmZ1bmN0aW9uIGNhY2hlQWN0aXZlT25EYXRlKGNhY2hlOiBEZXZpYXRpb25DYWNoZSwgZ29hbElkOiBzdHJpbmcsIGRhdGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBkYXkgPSBjYWNoZS5ieURhdGVLZXlbZGF0ZUtleV07XG4gIGlmICghZGF5KSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGVudHJ5ID0gZGF5W2dvYWxJZF07XG4gIHJldHVybiAhIWVudHJ5ICYmICEhZW50cnkuYWN0aXZlO1xufVxuXG5mdW5jdGlvbiBjYWNoZUNvbXBsZXRpb25zT25EYXRlKGNhY2hlOiBEZXZpYXRpb25DYWNoZSwgZ29hbElkOiBzdHJpbmcsIGRhdGVLZXk6IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IGRheSA9IGNhY2hlLmJ5RGF0ZUtleVtkYXRlS2V5XTtcbiAgaWYgKCFkYXkpIHJldHVybiAwO1xuICBjb25zdCBlbnRyeSA9IGRheVtnb2FsSWRdO1xuICByZXR1cm4gZW50cnkgPyAoZW50cnkuY29tcGxldGlvbnMgfHwgMCkgOiAwO1xufVxuXG5mdW5jdGlvbiBjYWNoZVByb2dyZXNzT25EYXRlKGNhY2hlOiBEZXZpYXRpb25DYWNoZSwgZ29hbElkOiBzdHJpbmcsIGRhdGVLZXk6IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGRheSA9IGNhY2hlLmJ5RGF0ZUtleVtkYXRlS2V5XTtcbiAgaWYgKCFkYXkpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IGVudHJ5ID0gZGF5W2dvYWxJZF07XG4gIHJldHVybiBlbnRyeSA/IGVudHJ5LnByb2dyZXNzIDogdW5kZWZpbmVkO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgTDEgXHU1N0ZBXHU3ODQwXHU1MDY1XHU1RUI3XHU1MjA2XHVGRjA4XHU1QzY1XHU3RUE2XHU4MEZEXHU1MjlCXHVGRjA5NDUlIFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gc2NvcmVPblRpbWUoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBwcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGlmICghZ29hbC5lbmREYXRlKSByZXR1cm4geyBzY29yZTogNzAsIGhpbnQ6ICdcdTY3MkFcdThCQkVcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUYnIH07XG4gIGlmIChnb2FsLnN0YXJ0RGF0ZSAmJiBnb2FsLmVuZERhdGUpIHtcbiAgICBjb25zdCBzID0gbmV3IERhdGUoZ29hbC5zdGFydERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gICAgY29uc3QgZSA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgICBpZiAocyA+IGUpIHJldHVybiB7IHNjb3JlOiAwLCBoaW50OiAnXHU2NUU1XHU2NzFGXHU4MzAzXHU1NkY0XHU1RjAyXHU1RTM4JyB9O1xuICB9XG4gIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgZW5kLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBjb25zdCBkYXlzVG9EZWFkbGluZSA9IHdvcmtkYXlzQmV0d2Vlbih0b2RheSwgZW5kLCBob2xpZGF5cyk7XG5cbiAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICBpZiAoZGF5c1RvRGVhZGxpbmUgPj0gLVRVTklORy5UT0xFUkFOQ0VfREVMQVlfREFZUyAmJiBkYXlzVG9EZWFkbGluZSA8PSAwKSB7XG4gICAgICByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwJyB9O1xuICAgIH1cbiAgICBpZiAoZGF5c1RvRGVhZGxpbmUgPiAwKSByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU2M0QwXHU1MjREXHU1QjhDXHU2MjEwJyB9O1xuICAgIGNvbnN0IGxhdGUgPSBNYXRoLmFicyhkYXlzVG9EZWFkbGluZSk7XG4gICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFRVTklORy5ERUxBWV9QRU5BTFRZX01BWCwgbGF0ZSAqIFRVTklORy5ERUxBWV9QRU5BTFRZX1JBVEUpO1xuICAgIHJldHVybiB7IHNjb3JlOiBjbGFtcCgxMDAgLSBwZW5hbHR5LCAwLCAxMDApLCBoaW50OiBgXHU2MkQ2XHU1RUY2JHtsYXRlfVx1NEUyQVx1NURFNVx1NEY1Q1x1NjVFNWAgfTtcbiAgfVxuXG4gIGlmIChkYXlzVG9EZWFkbGluZSA8IC1UVU5JTkcuVE9MRVJBTkNFX0RFTEFZX0RBWVMpIHtcbiAgICBjb25zdCBsYXRlID0gTWF0aC5hYnMoZGF5c1RvRGVhZGxpbmUpO1xuICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbihUVU5JTkcuREVMQVlfUEVOQUxUWV9NQVgsIGxhdGUgKiBUVU5JTkcuREVMQVlfUEVOQUxUWV9SQVRFKTtcbiAgICByZXR1cm4geyBzY29yZTogY2xhbXAoNzAgLSBwZW5hbHR5LCAwLCAxMDApLCBoaW50OiBgXHU1REYyXHU5MDNFXHU2NzFGJHtsYXRlfVx1NEUyQVx1NURFNVx1NEY1Q1x1NjVFNWAgfTtcbiAgfVxuXG4gIGlmICghZ29hbC5zdGFydERhdGUpIHJldHVybiB7IHNjb3JlOiA2NSwgaGludDogJ1x1NjcyQVx1OEJCRVx1NUYwMFx1NTlDQlx1NjVFNVx1NjcxRicgfTtcbiAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZShnb2FsLnN0YXJ0RGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgc3RhcnQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIGlmICh0b2RheSA8IHN0YXJ0KSByZXR1cm4geyBzY29yZTogODAsIGhpbnQ6ICdcdTVDMUFcdTY3MkFcdTVGMDBcdTU5Q0InIH07XG5cbiAgY29uc3QgdG90YWxXb3JrZGF5cyA9IGNvdW50V29ya2RheXMoc3RhcnQsIGVuZCwgaG9saWRheXMpO1xuICBjb25zdCBlbGFwc2VkV29ya2RheXMgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCB0b2RheSwgaG9saWRheXMpO1xuICBjb25zdCBleHBlY3RlZCA9IHRvdGFsV29ya2RheXMgPiAwID8gKGVsYXBzZWRXb3JrZGF5cyAvIHRvdGFsV29ya2RheXMpICogMTAwIDogNTA7XG4gIGNvbnN0IGRpZmYgPSBwcm9ncmVzcyAtIGV4cGVjdGVkO1xuXG4gIGlmIChkaWZmID49IDApIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdThGREJcdTVFQTZcdThGQkVcdTY4MDcnIH07XG4gIGlmIChkaWZmID4gLTE1KSByZXR1cm4geyBzY29yZTogY2xhbXAoODUgKyBkaWZmLCAwLCAxMDApLCBoaW50OiAnXHU4RjdCXHU1RkFFXHU4NDNEXHU1NDBFJyB9O1xuICBpZiAoZGlmZiA+IC0zMCkgcmV0dXJuIHsgc2NvcmU6IGNsYW1wKDYwICsgZGlmZiAqIDAuNSwgMCwgMTAwKSwgaGludDogJ1x1NjYwRVx1NjYzRVx1ODQzRFx1NTQwRScgfTtcbiAgcmV0dXJuIHsgc2NvcmU6IGNsYW1wKDQwICsgZGlmZiAqIDAuMiwgMCwgMTAwKSwgaGludDogJ1x1NEUyNVx1OTFDRFx1ODQzRFx1NTQwRScgfTtcbn1cblxuZnVuY3Rpb24gc2NvcmVNb2RlcmF0ZUVhcmx5KFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoU3ViU2NvcmUge1xuICBpZiAoIWdvYWwuZW5kRGF0ZSkgcmV0dXJuIHsgc2NvcmU6IDcwLCBoaW50OiAnXHU2NzJBXHU4QkJFXHU2MjJBXHU2QjYyXHU2NUU1XHU2NzFGJyB9O1xuICBjb25zdCBlbmQgPSBuZXcgRGF0ZShnb2FsLmVuZERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gIGVuZC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgY29uc3QgZGF5c1RvRGVhZGxpbmUgPSB3b3JrZGF5c0JldHdlZW4odG9kYXksIGVuZCwgaG9saWRheXMpO1xuXG4gIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgaWYgKGRheXNUb0RlYWRsaW5lID49IDEgJiYgZGF5c1RvRGVhZGxpbmUgPD0gVFVOSU5HLlRPTEVSQU5DRV9FQVJMWV9EQVlTKSB7XG4gICAgICByZXR1cm4geyBzY29yZTogODAsIGhpbnQ6ICdcdTkwMDJcdTVFQTZcdTYzRDBcdTUyNEQnIH07XG4gICAgfVxuICAgIGlmIChkYXlzVG9EZWFkbGluZSA+IFRVTklORy5UT0xFUkFOQ0VfRUFSTFlfREFZUykge1xuICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFxuICAgICAgICBUVU5JTkcuT1ZFUl9FQVJMWV9QRU5BTFRZX01BWCxcbiAgICAgICAgZGF5c1RvRGVhZGxpbmUgKiBUVU5JTkcuT1ZFUl9FQVJMWV9QRU5BTFRZX1JBVEVcbiAgICAgICk7XG4gICAgICByZXR1cm4geyBzY29yZTogY2xhbXAoODAgLSBwZW5hbHR5LCAwLCAxMDApLCBoaW50OiBgXHU4RkM3XHU1RUE2XHU4RDg1XHU1MjREJHtkYXlzVG9EZWFkbGluZX1cdTU5MjlgIH07XG4gICAgfVxuICAgIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTAnIH07XG4gIH1cblxuICBpZiAoZGF5c1RvRGVhZGxpbmUgPiBUVU5JTkcuVE9MRVJBTkNFX0VBUkxZX0RBWVMgJiYgcHJvZ3Jlc3MgPj0gOTApIHtcbiAgICByZXR1cm4geyBzY29yZTogNzUsIGhpbnQ6ICdcdTYzQTVcdThGRDFcdTVCOENcdTYyMTAnIH07XG4gIH1cbiAgcmV0dXJuIHsgc2NvcmU6IDcwLCBoaW50OiAnXHU4RkRCXHU4ODRDXHU0RTJEJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZVdlZWtseUFjdGl2ZShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9pdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGxldCBhY3RpdmVEYXlzID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBUVU5JTkcuUkVDRU5UX0RBWVM7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgaWYgKCFpc1dvcmtkYXkoZCwgaG9saWRheXMpKSBjb250aW51ZTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgaWYgKGNhY2hlQWN0aXZlT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpKSBhY3RpdmVEYXlzKys7XG4gIH1cbiAgbGV0IHdvcmtkYXlzVGhpc1dlZWsgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IFRVTklORy5SRUNFTlRfREFZUzsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBpZiAoaXNXb3JrZGF5KGQsIGhvbGlkYXlzKSkgd29ya2RheXNUaGlzV2VlaysrO1xuICB9XG4gIGNvbnN0IHJhdGlvID0gd29ya2RheXNUaGlzV2VlayA+IDAgPyBhY3RpdmVEYXlzIC8gd29ya2RheXNUaGlzV2VlayA6IDA7XG4gIHJldHVybiB7XG4gICAgc2NvcmU6IGNsYW1wKE1hdGgucm91bmQocmF0aW8gKiAxMDApLCAwLCAxMDApLFxuICAgIGhpbnQ6IGFjdGl2ZURheXMgPiAwID8gYFx1NTQ2OFx1NkQzQlx1OERDMyR7YWN0aXZlRGF5c31cdTU5MjlgIDogJ1x1NjcyQ1x1NTQ2OFx1NjVFMFx1NjNBOFx1OEZEQicsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNjb3JlTDEoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBpdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhMMSB7XG4gIGNvbnN0IG9uVGltZSA9IHNjb3JlT25UaW1lKGdvYWwsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBob2xpZGF5cywgdG9kYXkpO1xuICBjb25zdCBtb2RlcmF0ZUVhcmx5ID0gc2NvcmVNb2RlcmF0ZUVhcmx5KGdvYWwsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBob2xpZGF5cywgdG9kYXkpO1xuICBjb25zdCB3ZWVrbHlBY3RpdmUgPSBzY29yZVdlZWtseUFjdGl2ZShnb2FsLCBpdGVtcywgY2FjaGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoXG4gICAgTWF0aC5yb3VuZChcbiAgICAgIChvblRpbWUuc2NvcmUgKiBUVU5JTkcuTDFfT05fVElNRSArXG4gICAgICAgIG1vZGVyYXRlRWFybHkuc2NvcmUgKiBUVU5JTkcuTDFfTU9ERVJBVEVfRUFSTFkgK1xuICAgICAgICB3ZWVrbHlBY3RpdmUuc2NvcmUgKiBUVU5JTkcuTDFfV0VFS0xZX0FDVElWRSkgL1xuICAgICAgICAoVFVOSU5HLkwxX09OX1RJTUUgKyBUVU5JTkcuTDFfTU9ERVJBVEVfRUFSTFkgKyBUVU5JTkcuTDFfV0VFS0xZX0FDVElWRSlcbiAgICApLFxuICAgIDAsXG4gICAgMTAwXG4gICk7XG4gIHJldHVybiB7IHNjb3JlOiBNYXRoLnJvdW5kKHNjb3JlKSwgb25UaW1lLCBtb2RlcmF0ZUVhcmx5LCB3ZWVrbHlBY3RpdmUgfTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIEwyIFx1OEQ4Qlx1NTJCRlx1NTJBOFx1NTI5Qlx1NTIwNlx1RkYwOFx1NjIxMFx1OTU3Rlx1ODBGRFx1NTI5Qlx1RkYwOTMwJSBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIHNjb3JlUHJvZ3Jlc3NUcmVuZChcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9pdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGlmIChpc0NvbXBsZXRlKSByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU1REYyXHU1QjhDXHU2MjEwJyB9O1xuICBpZiAoIWdvYWwuc3RhcnREYXRlIHx8ICFnb2FsLmVuZERhdGUpIHJldHVybiB7IHNjb3JlOiA2MCwgaGludDogJ1x1N0YzQVx1NUMxMVx1NjVFNVx1NjcxRlx1NEZFMVx1NjA2RicgfTtcbiAgaWYgKGdvYWwuc3RhcnREYXRlICYmIGdvYWwuZW5kRGF0ZSkge1xuICAgIGNvbnN0IHMgPSBuZXcgRGF0ZShnb2FsLnN0YXJ0RGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgICBjb25zdCBlID0gbmV3IERhdGUoZ29hbC5lbmREYXRlICsgJ1QwMDowMDowMCcpO1xuICAgIGlmIChzID4gZSkgcmV0dXJuIHsgc2NvcmU6IDAsIGhpbnQ6ICdcdTY1RTVcdTY3MUZcdTgzMDNcdTU2RjRcdTVGMDJcdTVFMzgnIH07XG4gIH1cblxuICBjb25zdCBzdGFydCA9IG5ldyBEYXRlKGdvYWwuc3RhcnREYXRlICsgJ1QwMDowMDowMCcpO1xuICBzdGFydC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgaWYgKHRvZGF5IDwgc3RhcnQpIHJldHVybiB7IHNjb3JlOiA1MCwgaGludDogJ1x1NUMxQVx1NjcyQVx1NUYwMFx1NTlDQicgfTtcblxuICBjb25zdCByZWNlbnREYXlzID0gVFVOSU5HLlJFQ0VOVF9EQVlTO1xuICBsZXQgcmVjZW50UHJvZ3Jlc3MgPSAwO1xuICBsZXQgb2xkZXJQcm9ncmVzcyA9IDA7XG4gIGxldCByZWNlbnRIYXNEYXRhID0gZmFsc2U7XG4gIGxldCBvbGRlckhhc0RhdGEgPSBmYWxzZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlY2VudERheXM7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgY29uc3Qga2V5ID0gZm10KGQpO1xuICAgIGNvbnN0IHAgPSBjYWNoZVByb2dyZXNzT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpO1xuICAgIGlmIChwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlY2VudFByb2dyZXNzID0gcDtcbiAgICAgIHJlY2VudEhhc0RhdGEgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IGkgPSByZWNlbnREYXlzOyBpIDwgcmVjZW50RGF5cyAqIDI7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgY29uc3Qga2V5ID0gZm10KGQpO1xuICAgIGNvbnN0IHAgPSBjYWNoZVByb2dyZXNzT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpO1xuICAgIGlmIChwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG9sZGVyUHJvZ3Jlc3MgPSBwO1xuICAgICAgb2xkZXJIYXNEYXRhID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmICghcmVjZW50SGFzRGF0YSAmJiAhb2xkZXJIYXNEYXRhKSB7XG4gICAgY29uc3QgZW5kID0gbmV3IERhdGUoZ29hbC5lbmREYXRlICsgJ1QwMDowMDowMCcpO1xuICAgIGVuZC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgICBjb25zdCB0b3RhbFdkID0gY291bnRXb3JrZGF5cyhzdGFydCwgZW5kLCBob2xpZGF5cyk7XG4gICAgY29uc3QgZWxhcHNlZFdkID0gY291bnRXb3JrZGF5cyhzdGFydCwgdG9kYXksIGhvbGlkYXlzKTtcbiAgICBjb25zdCBleHBlY3RlZCA9IHRvdGFsV2QgPiAwID8gKGVsYXBzZWRXZCAvIHRvdGFsV2QpICogMTAwIDogNTA7XG4gICAgY29uc3QgZGlmZiA9IHByb2dyZXNzIC0gZXhwZWN0ZWQ7XG4gICAgaWYgKGRpZmYgPj0gMCkgcmV0dXJuIHsgc2NvcmU6IDgwLCBoaW50OiAnXHU4RkRCXHU1RUE2XHU2QjYzXHU1RTM4JyB9O1xuICAgIGlmIChkaWZmID4gLTIwKSByZXR1cm4geyBzY29yZTogNjAsIGhpbnQ6ICdcdTdBMERcdTY3MDlcdTg0M0RcdTU0MEUnIH07XG4gICAgcmV0dXJuIHsgc2NvcmU6IDQwLCBoaW50OiAnXHU4RkRCXHU1RUE2XHU1MDRGXHU2MTYyJyB9O1xuICB9XG5cbiAgaWYgKCFvbGRlckhhc0RhdGEpIHJldHVybiB7IHNjb3JlOiA2NSwgaGludDogJ1x1NjU3MFx1NjM2RVx1NEUwRFx1OERCMycgfTtcblxuICBjb25zdCBkaWZmID0gcmVjZW50UHJvZ3Jlc3MgLSBvbGRlclByb2dyZXNzO1xuICBpZiAoZGlmZiA+IFRVTklORy5UUkVORF9BQ0NFTF9USFJFU0hPTEQpIHJldHVybiB7IHNjb3JlOiA5MCwgaGludDogJ1x1OEZEQlx1NUVBNlx1NTJBMFx1OTAxRicgfTtcbiAgaWYgKGRpZmYgPiAwKSByZXR1cm4geyBzY29yZTogNzUsIGhpbnQ6ICdcdTdBMzNcdTZCNjVcdTYzQThcdThGREInIH07XG4gIGlmIChkaWZmID09PSAwKSByZXR1cm4geyBzY29yZTogNTAsIGhpbnQ6ICdcdThGREJcdTVFQTZcdTUwNUNcdTZFREUnIH07XG4gIHJldHVybiB7IHNjb3JlOiAzMCwgaGludDogJ1x1OEZEQlx1NUVBNlx1NTAxMlx1OTAwMCcgfTtcbn1cblxuZnVuY3Rpb24gc2NvcmVDb21wbGV0aW9uVHJlbmQoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBfaXRlbXM6IEdvYWxTdWJJdGVtW10sXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgX2hvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFN1YlNjb3JlIHtcbiAgaWYgKGlzQ29tcGxldGUpIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTVERjJcdTVCOENcdTYyMTAnIH07XG4gIGlmICghZ29hbC5pdGVtcyB8fCBnb2FsLml0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHsgc2NvcmU6IDYwLCBoaW50OiAnXHU2NUUwXHU1QjUwXHU5ODc5JyB9O1xuXG4gIGxldCByZWNlbnRDb21wbGV0aW9ucyA9IDA7XG4gIGxldCBvbGRlckNvbXBsZXRpb25zID0gMDtcbiAgY29uc3QgcmVjZW50RGF5cyA9IFRVTklORy5SRUNFTlRfREFZUztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlY2VudERheXM7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgY29uc3Qga2V5ID0gZm10KGQpO1xuICAgIHJlY2VudENvbXBsZXRpb25zICs9IGNhY2hlQ29tcGxldGlvbnNPbkRhdGUoY2FjaGUsIGdvYWwuaWQsIGtleSk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IHJlY2VudERheXM7IGkgPCByZWNlbnREYXlzICogMjsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgb2xkZXJDb21wbGV0aW9ucyArPSBjYWNoZUNvbXBsZXRpb25zT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpO1xuICB9XG5cbiAgaWYgKHJlY2VudENvbXBsZXRpb25zID09PSAwICYmIG9sZGVyQ29tcGxldGlvbnMgPT09IDApIHtcbiAgICByZXR1cm4geyBzY29yZTogNTAsIGhpbnQ6ICdcdThGRDFcdTY3MUZcdTY1RTBcdTVCOENcdTYyMTAnIH07XG4gIH1cbiAgaWYgKHJlY2VudENvbXBsZXRpb25zID4gb2xkZXJDb21wbGV0aW9ucykgcmV0dXJuIHsgc2NvcmU6IDg1LCBoaW50OiAnXHU1QjhDXHU2MjEwXHU1MkEwXHU5MDFGJyB9O1xuICBpZiAocmVjZW50Q29tcGxldGlvbnMgPT09IG9sZGVyQ29tcGxldGlvbnMpIHJldHVybiB7IHNjb3JlOiA2NSwgaGludDogJ1x1NUI4Q1x1NjIxMFx1N0EzM1x1NUI5QScgfTtcbiAgcmV0dXJuIHsgc2NvcmU6IDQwLCBoaW50OiAnXHU1QjhDXHU2MjEwXHU2NTNFXHU3RjEzJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZUwyKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgaXRlbXM6IEdvYWxTdWJJdGVtW10sXG4gIHByb2dyZXNzOiBudW1iZXIsXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoTDIge1xuICBjb25zdCBwcm9ncmVzc1RyZW5kID0gc2NvcmVQcm9ncmVzc1RyZW5kKGdvYWwsIGl0ZW1zLCBwcm9ncmVzcywgaXNDb21wbGV0ZSwgY2FjaGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IGNvbXBsZXRpb25UcmVuZCA9IHNjb3JlQ29tcGxldGlvblRyZW5kKGdvYWwsIGl0ZW1zLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHRvZGF5KTtcbiAgY29uc3Qgc2NvcmUgPSBjbGFtcChcbiAgICBNYXRoLnJvdW5kKFxuICAgICAgKHByb2dyZXNzVHJlbmQuc2NvcmUgKiBUVU5JTkcuTDJfUFJPR1JFU1NfVFJFTkQgK1xuICAgICAgICBjb21wbGV0aW9uVHJlbmQuc2NvcmUgKiBUVU5JTkcuTDJfQ09NUExFVElPTl9UUkVORCkgL1xuICAgICAgICAoVFVOSU5HLkwyX1BST0dSRVNTX1RSRU5EICsgVFVOSU5HLkwyX0NPTVBMRVRJT05fVFJFTkQpXG4gICAgKSxcbiAgICAwLFxuICAgIDEwMFxuICApO1xuICByZXR1cm4geyBzY29yZTogTWF0aC5yb3VuZChzY29yZSksIHByb2dyZXNzVHJlbmQsIGNvbXBsZXRpb25UcmVuZCB9O1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgTDMgXHU1M0VGXHU2MzAxXHU3RUVEXHU2MDI3XHU1MjA2XHVGRjA4XHU1MDY1XHU1RUI3XHU3QTBCXHU1RUE2XHVGRjA5MjUlIFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gc2NvcmVTdGFnbmF0aW9uKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgX2l0ZW1zOiBHb2FsU3ViSXRlbVtdLFxuICBfcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdGFnbmF0aW9uIHtcbiAgaWYgKGlzQ29tcGxldGUpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICdcdTVERjJcdTVCOENcdTYyMTAnIH07XG4gIGlmICghZ29hbC5zdGFydERhdGUpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICdcdTY1RTBcdTVGMDBcdTU5Q0JcdTY1RTVcdTY3MUYnIH07XG5cbiAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZShnb2FsLnN0YXJ0RGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgc3RhcnQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIGlmICh0b2RheSA8IHN0YXJ0KSByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnXHU1QzFBXHU2NzJBXHU1RjAwXHU1OUNCJyB9O1xuXG4gIGxldCBsYXN0QWN0aXZlRGF0ZTogRGF0ZSB8IG51bGwgPSBudWxsO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IFRVTklORy5TVEFHTkFUSU9OX1dJTkRPVzsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgaWYgKGNhY2hlQWN0aXZlT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpKSB7XG4gICAgICBsYXN0QWN0aXZlRGF0ZSA9IGQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhc3RBY3RpdmVEYXRlKSB7XG4gICAgY29uc3Qgc3RhZ25hbnREYXlzID0gd29ya2RheXNCZXR3ZWVuKHN0YXJ0LCB0b2RheSwgaG9saWRheXMpO1xuICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbihcbiAgICAgIFRVTklORy5TVEFHTkFUSU9OX1BFTkFMVFlfTUFYLFxuICAgICAgTWF0aC5wb3coc3RhZ25hbnREYXlzIC8gVFVOSU5HLlNUQUdOQVRJT05fRElWSVNPUiwgVFVOSU5HLlNUQUdOQVRJT05fRVhQT05FTlQpXG4gICAgKTtcbiAgICByZXR1cm4geyBwZW5hbHR5OiBNYXRoLnJvdW5kKHBlbmFsdHkpLCBoaW50OiBgXHU0RUNFXHU2NzJBXHU2M0E4XHU4RkRCKCR7c3RhZ25hbnREYXlzfVx1NTkyOSlgIH07XG4gIH1cblxuICBjb25zdCBzdGFnbmFudERheXMgPSB3b3JrZGF5c0JldHdlZW4obGFzdEFjdGl2ZURhdGUsIHRvZGF5LCBob2xpZGF5cyk7XG4gIGlmIChzdGFnbmFudERheXMgPD0gMikgcmV0dXJuIHsgcGVuYWx0eTogMCwgaGludDogJ1x1OEZEMVx1NjcxRlx1NjcwOVx1NjNBOFx1OEZEQicgfTtcbiAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFxuICAgIFRVTklORy5TVEFHTkFUSU9OX1BFTkFMVFlfTUFYLFxuICAgIE1hdGgucG93KHN0YWduYW50RGF5cyAvIFRVTklORy5TVEFHTkFUSU9OX0RJVklTT1IsIFRVTklORy5TVEFHTkFUSU9OX0VYUE9ORU5UKVxuICApO1xuICByZXR1cm4geyBwZW5hbHR5OiBNYXRoLnJvdW5kKHBlbmFsdHkpLCBoaW50OiBgXHU1MDVDXHU2RURFJHtzdGFnbmFudERheXN9XHU0RTJBXHU1REU1XHU0RjVDXHU2NUU1YCB9O1xufVxuXG5mdW5jdGlvbiBzY29yZUJhbGFuY2UoaXRlbXM6IEdvYWxTdWJJdGVtW10sIGlzQ29tcGxldGU6IGJvb2xlYW4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGlmIChpc0NvbXBsZXRlKSByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU1REYyXHU1QjhDXHU2MjEwJyB9O1xuICBpZiAoIWl0ZW1zIHx8IGl0ZW1zLmxlbmd0aCA8PSAxKSByZXR1cm4geyBzY29yZTogODAsIGhpbnQ6ICdcdTVCNTBcdTk4NzlcdTRFMERcdThEQjMnIH07XG5cbiAgY29uc3QgcHJvZ3Jlc3NlcyA9IGl0ZW1zLm1hcCgoaXQpID0+IHtcbiAgICBjb25zdCB0YXIgPSBwYXJzZUZsb2F0KGl0LnRhcmdldFZhbHVlID8/ICcwJyk7XG4gICAgaWYgKHRhciA9PT0gMCkge1xuICAgICAgY29uc3QgY3VyID0gcGFyc2VGbG9hdChpdC5jdXJyZW50VmFsdWUgPz8gJzAnKSB8fCAwO1xuICAgICAgcmV0dXJuIGN1ciA9PT0gMCA/IDEwMCA6IDA7XG4gICAgfVxuICAgIGNvbnN0IHRhclNhZmUgPSB0YXIgfHwgMTAwO1xuICAgIGNvbnN0IGN1ciA9IHBhcnNlRmxvYXQoaXQuY3VycmVudFZhbHVlID8/ICcwJykgfHwgMDtcbiAgICByZXR1cm4gKGN1ciAvIHRhclNhZmUpICogMTAwO1xuICB9KTtcblxuICBjb25zdCBhdmcgPSBwcm9ncmVzc2VzLnJlZHVjZSgocywgdikgPT4gcyArIHYsIDApIC8gcHJvZ3Jlc3Nlcy5sZW5ndGg7XG4gIGNvbnN0IHZhcmlhbmNlID0gcHJvZ3Jlc3Nlcy5yZWR1Y2UoKHMsIHYpID0+IHMgKyBNYXRoLnBvdyh2IC0gYXZnLCAyKSwgMCkgLyBwcm9ncmVzc2VzLmxlbmd0aDtcbiAgY29uc3Qgc3RkRGV2ID0gTWF0aC5zcXJ0KHZhcmlhbmNlKTtcblxuICBjb25zdCBzY29yZSA9IGNsYW1wKE1hdGgucm91bmQoMTAwIC0gc3RkRGV2ICogVFVOSU5HLkJBTEFOQ0VfUEVOQUxUWV9SQVRFKSwgMCwgMTAwKTtcbiAgcmV0dXJuIHtcbiAgICBzY29yZSxcbiAgICBoaW50OiBzdGREZXYgPiAzMCA/ICdcdThGREJcdTVFQTZcdTRFMERcdTU3NDdcdTg4NjEnIDogc3RkRGV2ID4gMTUgPyAnXHU4RkRCXHU1RUE2XHU3NTY1XHU2NzA5XHU1REVFXHU1RjAyJyA6ICdcdThGREJcdTVFQTZcdTU3NDdcdTg4NjEnLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzY29yZU92ZXJFYXJseShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9wcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdGFnbmF0aW9uIHtcbiAgaWYgKCFnb2FsLmVuZERhdGUgfHwgIWlzQ29tcGxldGUpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICcnIH07XG4gIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgZW5kLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBjb25zdCBkYXlzRWFybHkgPSB3b3JrZGF5c0JldHdlZW4odG9kYXksIGVuZCwgaG9saWRheXMpO1xuICBpZiAoZGF5c0Vhcmx5ID4gVFVOSU5HLlRPTEVSQU5DRV9FQVJMWV9EQVlTKSB7XG4gICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFxuICAgICAgVFVOSU5HLk9WRVJfRUFSTFlfUEVOQUxUWV9NQVgsXG4gICAgICBkYXlzRWFybHkgKiBUVU5JTkcuT1ZFUl9FQVJMWV9QRU5BTFRZX1JBVEVcbiAgICApO1xuICAgIHJldHVybiB7IHBlbmFsdHk6IE1hdGgucm91bmQocGVuYWx0eSksIGhpbnQ6IGBcdThGQzdcdTVFQTZcdThEODVcdTUyNEQke2RheXNFYXJseX1cdTU5MjlgIH07XG4gIH1cbiAgcmV0dXJuIHsgcGVuYWx0eTogMCwgaGludDogJycgfTtcbn1cblxuZnVuY3Rpb24gc2NvcmVEZWxheShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9wcm9ncmVzczogbnVtYmVyLFxuICBfaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoU3RhZ25hdGlvbiB7XG4gIGlmICghZ29hbC5lbmREYXRlKSByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnJyB9O1xuICBjb25zdCBlbmQgPSBuZXcgRGF0ZShnb2FsLmVuZERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gIGVuZC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgY29uc3QgZGF5c0xhdGUgPSB3b3JrZGF5c0JldHdlZW4oZW5kLCB0b2RheSwgaG9saWRheXMpO1xuICBpZiAoZGF5c0xhdGUgPiBUVU5JTkcuVE9MRVJBTkNFX0RFTEFZX0RBWVMpIHtcbiAgICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oVFVOSU5HLkRFTEFZX1BFTkFMVFlfTUFYLCBkYXlzTGF0ZSAqIFRVTklORy5ERUxBWV9QRU5BTFRZX1JBVEUpO1xuICAgIHJldHVybiB7IHBlbmFsdHk6IE1hdGgucm91bmQocGVuYWx0eSksIGhpbnQ6IGBcdTYyRDZcdTVFRjYke2RheXNMYXRlfVx1NTkyOWAgfTtcbiAgfVxuICByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZUwzKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgaXRlbXM6IEdvYWxTdWJJdGVtW10sXG4gIHByb2dyZXNzOiBudW1iZXIsXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoTDMge1xuICBjb25zdCBzdGFnbmF0aW9uID0gc2NvcmVTdGFnbmF0aW9uKGdvYWwsIGl0ZW1zLCBwcm9ncmVzcywgaXNDb21wbGV0ZSwgY2FjaGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IGJhbGFuY2UgPSBzY29yZUJhbGFuY2UoaXRlbXMsIGlzQ29tcGxldGUpO1xuICBjb25zdCBvdmVyRWFybHkgPSBzY29yZU92ZXJFYXJseShnb2FsLCBwcm9ncmVzcywgaXNDb21wbGV0ZSwgaG9saWRheXMsIHRvZGF5KTtcbiAgY29uc3QgZGVsYXkgPSBzY29yZURlbGF5KGdvYWwsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBob2xpZGF5cywgdG9kYXkpO1xuXG4gIGxldCBzY29yZSA9IDEwMDtcbiAgc2NvcmUgLT0gc3RhZ25hdGlvbi5wZW5hbHR5O1xuICBzY29yZSA9IHNjb3JlICogKDEgLSBUVU5JTkcuTDNfQkFMQU5DRSkgKyBiYWxhbmNlLnNjb3JlICogVFVOSU5HLkwzX0JBTEFOQ0U7XG4gIHNjb3JlIC09IG92ZXJFYXJseS5wZW5hbHR5O1xuICBzY29yZSAtPSBkZWxheS5wZW5hbHR5O1xuXG4gIHJldHVybiB7XG4gICAgc2NvcmU6IGNsYW1wKE1hdGgucm91bmQoc2NvcmUpLCAwLCAxMDApLFxuICAgIHN0YWduYXRpb24sXG4gICAgYmFsYW5jZSxcbiAgICBvdmVyRWFybHksXG4gICAgZGVsYXksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGxldmVsRm9yKHNjb3JlOiBudW1iZXIpOiBIZWFsdGhMZXZlbCB7XG4gIGlmIChzY29yZSA+PSBUVU5JTkcuTEVWRUxfRVhDRUxMRU5UKSByZXR1cm4gJ2V4Y2VsbGVudCc7XG4gIGlmIChzY29yZSA+PSBUVU5JTkcuTEVWRUxfR09PRCkgcmV0dXJuICdnb29kJztcbiAgaWYgKHNjb3JlID49IFRVTklORy5MRVZFTF9XQVJOSU5HKSByZXR1cm4gJ3dhcm5pbmcnO1xuICByZXR1cm4gJ3Jpc2snO1xufVxuXG4vKiogXHU1MzU1XHU3NkVFXHU2ODA3XHU1MDY1XHU1RUI3XHU1MjA2XHVGRjA4XHU1NDJCIEwxL0wyL0wzIFx1NjYwRVx1N0VDNiArIFx1NjAzQlx1NTIwNiArIFx1N0I0OVx1N0VBN1x1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVHb2FsSGVhbHRoKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoUmVzdWx0IHtcbiAgY29uc3QgaXRlbXMgPSBBcnJheS5pc0FycmF5KGdvYWwuaXRlbXMpID8gZ29hbC5pdGVtcyA6IFtdO1xuICBjb25zdCBwcm9ncmVzcyA9IGNsYW1wKE51bWJlcihnb2FsLnByb2dyZXNzKSB8fCAwLCAwLCAxMDApO1xuICBjb25zdCBpc0NvbXBsZXRlID0gcHJvZ3Jlc3MgPj0gMTAwO1xuICAvLyBcdTdFREZcdTRFMDBcdTVGNTJcdTRFMDBcdTRFM0FcdTVGNTNcdTY1RTUgMCBcdTcwQjlcdUZGMENcdTkwN0ZcdTUxNEQgaG91cnMgXHU1MDRGXHU1REVFXHU1RjcxXHU1NENEXHU1REU1XHU0RjVDXHU2NUU1L1x1NTA1Q1x1NkVERVx1NTIyNFx1NUI5QVxuICBjb25zdCB0ID0gbmV3IERhdGUodG9kYXkuZ2V0RnVsbFllYXIoKSwgdG9kYXkuZ2V0TW9udGgoKSwgdG9kYXkuZ2V0RGF0ZSgpKTtcbiAgY29uc3QgaG9saWRheXMgPSBfZ2V0SG9saWRheXModC5nZXRGdWxsWWVhcigpKTtcblxuICBjb25zdCBMMSA9IHNjb3JlTDEoZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHQpO1xuICBjb25zdCBMMiA9IHNjb3JlTDIoZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHQpO1xuICBjb25zdCBMMyA9IHNjb3JlTDMoZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHQpO1xuXG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoXG4gICAgTWF0aC5yb3VuZChcbiAgICAgIEwxLnNjb3JlICogVFVOSU5HLldFSUdIVF9MMSArXG4gICAgICAgIEwyLnNjb3JlICogVFVOSU5HLldFSUdIVF9MMiArXG4gICAgICAgIEwzLnNjb3JlICogVFVOSU5HLldFSUdIVF9MM1xuICAgICksXG4gICAgMCxcbiAgICAxMDBcbiAgKTtcbiAgY29uc3QgbGV2ZWwgPSBsZXZlbEZvcihzY29yZSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzY29yZSxcbiAgICBsZXZlbCxcbiAgICBsYWJlbDogTEVWRUxTW2xldmVsXS5sYWJlbCxcbiAgICBjb2xvcjogTEVWRUxTW2xldmVsXS5jb2xvcixcbiAgICBMMSxcbiAgICBMMixcbiAgICBMMyxcbiAgfTtcbn1cblxuLyoqIFx1NzZFRVx1NjgwN1x1OTZDNlx1NTA2NVx1NUVCN1x1NTIwNlx1ODA1QVx1NTQwOFx1RkYwOFx1NTkxQVx1N0VGNFx1NUU3M1x1NTc0N1x1NTIwNiArIFx1N0VGQ1x1NTQwOFx1OEQ4Qlx1NTJCRlx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVIZWFsdGhTZXQoXG4gIGdvYWxzOiBHb2FsSXRlbVtdLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTZXQge1xuICBpZiAoIWdvYWxzIHx8IGdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBhdmdTY29yZTogMCxcbiAgICAgIGF2Z0xldmVsOiAncmlzaycsXG4gICAgICBhdmdMYWJlbDogJ1x1MjAxNCcsXG4gICAgICBhdmdDb2xvcjogJyM5OTknLFxuICAgICAgY291bnQ6IDAsXG4gICAgICBMMTogMCxcbiAgICAgIEwyOiAwLFxuICAgICAgTDM6IDAsXG4gICAgICB0cmVuZDogMCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgcmVzdWx0cyA9IGdvYWxzLm1hcCgoZykgPT4gY29tcHV0ZUdvYWxIZWFsdGgoZywgY2FjaGUsIHRvZGF5KSk7XG4gIGNvbnN0IGF2Z1Njb3JlID0gTWF0aC5yb3VuZChyZXN1bHRzLnJlZHVjZSgocywgcikgPT4gcyArIHIuc2NvcmUsIDApIC8gcmVzdWx0cy5sZW5ndGgpO1xuICBjb25zdCBhdmdMMSA9IE1hdGgucm91bmQocmVzdWx0cy5yZWR1Y2UoKHMsIHIpID0+IHMgKyByLkwxLnNjb3JlLCAwKSAvIHJlc3VsdHMubGVuZ3RoKTtcbiAgY29uc3QgYXZnTDIgPSBNYXRoLnJvdW5kKHJlc3VsdHMucmVkdWNlKChzLCByKSA9PiBzICsgci5MMi5zY29yZSwgMCkgLyByZXN1bHRzLmxlbmd0aCk7XG4gIGNvbnN0IGF2Z0wzID0gTWF0aC5yb3VuZChyZXN1bHRzLnJlZHVjZSgocywgcikgPT4gcyArIHIuTDMuc2NvcmUsIDApIC8gcmVzdWx0cy5sZW5ndGgpO1xuICBjb25zdCBhdmdMZXZlbCA9IGxldmVsRm9yKGF2Z1Njb3JlKTtcblxuICBsZXQgdHJlbmQgPSAwO1xuICBjb25zdCBhdmdMMlNjb3JlID0gcmVzdWx0cy5yZWR1Y2UoKHMsIHIpID0+IHMgKyByLkwyLnNjb3JlLCAwKSAvIHJlc3VsdHMubGVuZ3RoO1xuICBpZiAoYXZnTDJTY29yZSA+PSBUVU5JTkcuVFJFTkRfU1RST05HX0hJR0gpIHRyZW5kID0gMztcbiAgZWxzZSBpZiAoYXZnTDJTY29yZSA+PSBUVU5JTkcuVFJFTkRfV0VBS19ISUdIKSB0cmVuZCA9IDE7XG4gIGVsc2UgaWYgKGF2Z0wyU2NvcmUgPCBUVU5JTkcuVFJFTkRfU1RST05HX0xPVykgdHJlbmQgPSAtMztcbiAgZWxzZSBpZiAoYXZnTDJTY29yZSA8IFRVTklORy5UUkVORF9XRUFLX0xPVykgdHJlbmQgPSAtMTtcblxuICByZXR1cm4ge1xuICAgIGF2Z1Njb3JlLFxuICAgIGF2Z0xldmVsLFxuICAgIGF2Z0xhYmVsOiBMRVZFTFNbYXZnTGV2ZWxdLmxhYmVsLFxuICAgIGF2Z0NvbG9yOiBMRVZFTFNbYXZnTGV2ZWxdLmNvbG9yLFxuICAgIGNvdW50OiBnb2Fscy5sZW5ndGgsXG4gICAgTDE6IGF2Z0wxLFxuICAgIEwyOiBhdmdMMixcbiAgICBMMzogYXZnTDMsXG4gICAgdHJlbmQsXG4gIH07XG59XG5cbi8qKlxuICogXHU2MzA5XHUzMDBDXHU3RUY0XHU1RUE2XHUzMDBEXHU3NTFGXHU2MjEwXHU1MDY1XHU1RUI3XHU1RjUyXHU1NkUwIGhpbnRzXHVGRjA4XHU3OUZCXHU2OTBEIHdlYmFwcCBnZW5lcmF0ZUR5bmFtaWNIaW50c1x1RkYwQ1xuICogXHU2QkNGXHU2NzYxXHU5ODlEXHU1OTE2XHU2ODA3XHU2Q0U4IGRpbWVuc2lvblx1RkYwQ1x1NEY5Qlx1OEJDQVx1NjVBRFx1NjNEMFx1NzkzQVx1OEJDRFx1NjMwOVx1N0VGNFx1NUVBNlx1NUJGOVx1OUY1MFx1NUVGQVx1OEJBRVx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVIZWFsdGhIaW50cyhyZXN1bHQ6IEhlYWx0aFJlc3VsdCwgX3NldD86IEhlYWx0aFNldCk6IEhlYWx0aEhpbnRbXSB7XG4gIGNvbnN0IGhpbnRzOiBIZWFsdGhIaW50W10gPSBbXTtcblxuICBpZiAocmVzdWx0LkwxLnNjb3JlIDwgVFVOSU5HLkhJTlRfTDEpIHtcbiAgICBpZiAocmVzdWx0LkwxLm9uVGltZS5zY29yZSA8IFRVTklORy5ISU5UX0xBVEVfR09BTF9TQ09SRSkge1xuICAgICAgaGludHMucHVzaCh7XG4gICAgICAgIGRpbWVuc2lvbjogJ0wxJyxcbiAgICAgICAgdHlwZTogJ2RhbmdlcicsXG4gICAgICAgIGljb246ICdjYWxlbmRhcicsXG4gICAgICAgIHRleHQ6ICdcdTdCOTdcdTZDRDVcdTY4QzBcdTZENEJcdTUyMzBcdThCRTVcdTc2RUVcdTY4MDdcdThGREJcdTVFQTZcdTRFMjVcdTkxQ0RcdTg0M0RcdTU0MEVcdTRFOEVcdThCQTFcdTUyMTJcdTMwMDInLFxuICAgICAgICBhY3Rpb246ICdcdTY4MzlcdTYzNkVcdTVGNTNcdTUyNERcdTVCOENcdTYyMTBcdTkwMUZcdTczODdcdUZGMENcdTVFRkFcdThCQUVcdThDMDNcdTY1NzRcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUZcdTYyMTZcdTdDQkVcdTdCODBcdTRFRkJcdTUyQTFcdTVCNTBcdTk4NzlcdTMwMDInLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuTDEuc2NvcmUgPCA1MCkge1xuICAgICAgaGludHMucHVzaCh7XG4gICAgICAgIGRpbWVuc2lvbjogJ0wxJyxcbiAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICBpY29uOiAnemFwJyxcbiAgICAgICAgdGV4dDogJ1x1N0NGQlx1N0VERlx1NzZEMVx1NkQ0Qlx1NTIzMFx1NjcyQ1x1NTQ2OFx1NkQzQlx1OERDM1x1NTkyOVx1NjU3MFx1NjcyQVx1OEZCRVx1NjgwN1x1MzAwMicsXG4gICAgICAgIGFjdGlvbjogJ1x1NjU3MFx1NjM2RVx1ODg2OFx1NjYwRVx1RkYxQVx1NUMwRlx1NkI2NVx1NUZFQlx1OEREMVx1NzY4NFx1OTg5MVx1NzM4N1x1NkJENFx1NTM1NVx1NkIyMVx1OTU3Rlx1NjVGNlx1OTVGNFx1NjI5NVx1NTE2NVx1NjZGNFx1NjcwOVx1NTJBOVx1NEU4RVx1N0VGNFx1NjMwMVx1NzZFRVx1NjgwN1x1NTA2NVx1NUVCN1x1MzAwMicsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpZiAocmVzdWx0LkwyLnNjb3JlIDwgVFVOSU5HLkhJTlRfTDIpIHtcbiAgICBoaW50cy5wdXNoKHtcbiAgICAgIGRpbWVuc2lvbjogJ0wyJyxcbiAgICAgIHR5cGU6ICd3YXJuaW5nJyxcbiAgICAgIGljb246ICd0cmVuZGluZy11cCcsXG4gICAgICB0ZXh0OiAnXHU1MkE4XHU1MjlCXHU2MzA3XHU2NTcwXHU0RTBCXHU5NjREXHVGRjFBXHU4RkQxXHU2NzFGXHU4RkRCXHU1RUE2XHU1ODlFXHU5MUNGXHU0RjRFXHU0RThFXHU1Mzg2XHU1M0YyXHU1RTczXHU1NzQ3XHU2QzM0XHU1RTczXHUzMDAyJyxcbiAgICAgIGFjdGlvbjogJ1x1NjI2N1x1ODg0Q1x1NTJBOFx1NTI5Qlx1OEZEQlx1NTE2NVx1NzRGNlx1OTg4OFx1NjcxRlx1RkYwQ1x1NUVGQVx1OEJBRVx1OTAxQVx1OEZDN1x1NUI4Q1x1NjIxMFx1NEUwMFx1NEUyQVx1N0I4MFx1NTM1NVx1NzY4NFx1NUI1MFx1OTg3OVx1Njc2NVx1OTFDRFx1NjVCMFx1NkZDMFx1NkQzQlx1NjBFRlx1NjAyN1x1MzAwMicsXG4gICAgfSk7XG4gIH1cblxuICAvLyBcdTYzMDlcdTMwMENcdTVCNTBcdTdFRjRcdTVFQTZcdTMwMERcdTU0MDRcdTgxRUFcdTg5RTZcdTUzRDFcdUZGMDhcdTRFMERcdTUzNjEgY29tcG9zaXRlIEwzLnNjb3JlXHVGRjBDXHU1NDI2XHU1MjE5XHU1MzU1XHU3NkVFXHU2ODA3XHU1MDRGXHU3OUQxXHU0RjFBXHU4OEFCXHU2M0E5XHU3NkQ2XHVGRjA5XG4gIGlmIChyZXN1bHQuTDMuc3RhZ25hdGlvbi5wZW5hbHR5ID4gVFVOSU5HLkhJTlRfU1RBR05BVElPTl9QRU5BTFRZKSB7XG4gICAgaGludHMucHVzaCh7XG4gICAgICBkaW1lbnNpb246ICdMMycsXG4gICAgICB0eXBlOiAnZGFuZ2VyJyxcbiAgICAgIGljb246ICdjbG9jaycsXG4gICAgICB0ZXh0OiAnXHU2OEMwXHU2RDRCXHU1MjMwXHU4QkU1XHU3NkVFXHU2ODA3XHU1REYyXHU1MDVDXHU2RURFXHU4RDg1XHU4RkM3XHU5ODg0XHU2NzFGXHU5NjA4XHU1MDNDXHUzMDAyJyxcbiAgICAgIGFjdGlvbjogJ1x1OTU3Rlx1NjcxRlx1NTA1Q1x1NkVERVx1NEYxQVx1NjYzRVx1ODQ1N1x1OTY0RFx1NEY0RVx1NUI4Q1x1NjIxMFx1Njk4Mlx1NzM4N1x1RkYwQ1x1NUVGQVx1OEJBRVx1N0FDQlx1NTM3M1x1NTkwRFx1NjdFNVx1OTg3OVx1NzZFRVx1NTNFRlx1ODg0Q1x1NjAyN1x1MzAwMicsXG4gICAgfSk7XG4gIH1cbiAgaWYgKHJlc3VsdC5MMy5iYWxhbmNlLnNjb3JlIDwgVFVOSU5HLkhJTlRfQkFMQU5DRV9TQ09SRSkge1xuICAgIGhpbnRzLnB1c2goe1xuICAgICAgZGltZW5zaW9uOiAnTDMnLFxuICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgaWNvbjogJ3NjYWxlJyxcbiAgICAgIHRleHQ6ICdcdTVCNTBcdTk4NzlcdTY1QjlcdTVERUVcdThGQzdcdTU5MjdcdUZGMUFcdTk4NzlcdTc2RUVcdTUxODVcdTkwRThcdThGREJcdTVFQTZcdTUyMDZcdTVFMDNcdTRFMjVcdTkxQ0RcdTRFMERcdTU3NDdcdTMwMDInLFxuICAgICAgYWN0aW9uOiAnXHU1MTczXHU2Q0U4XHU4OEFCXHU5NTdGXHU2NzFGXHU1RkZEXHU3NTY1XHU3Njg0XHU4RkI5XHU3RjE4XHU1QjUwXHU5ODc5XHVGRjBDXHU5NjMyXHU2QjYyXHU5ODc5XHU3NkVFXHU1NDBFXHU2NzFGXHU1MUZBXHU3M0IwXHU3RUQzXHU2Nzg0XHU2MDI3XHU1RDI5XHU1ODRDXHUzMDAyJyxcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChyZXN1bHQuc2NvcmUgPj0gVFVOSU5HLkhJTlRfSElHSF9TQ09SRSkge1xuICAgIGhpbnRzLnB1c2goe1xuICAgICAgZGltZW5zaW9uOiAnTDEnLFxuICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgaWNvbjogJ3NwYXJrbGVzJyxcbiAgICAgIHRleHQ6ICdcdTdCOTdcdTZDRDVcdThCQzRcdTRGMzBcdUZGMUFcdTYyMThcdTc1NjVcdTYyNjdcdTg4NENcdTUyOUJcdTU5MDRcdTRFOEVcdTY3ODFcdTlBRDhcdTZDMzRcdTVFNzNcdTMwMDInLFxuICAgICAgYWN0aW9uOiAnXHU1RjUzXHU1MjREXHU2NTcwXHU2MzZFXHU2QTIxXHU1NzhCXHU2NjNFXHU3OTNBXHU0RjYwXHU1REYyXHU1RUZBXHU3QUNCXHU3QTMzXHU1NkZBXHU3Njg0XHU0RTYwXHU2MEVGXHU5NUVEXHU3M0FGXHVGRjBDXHU1RUZBXHU4QkFFXHU0RkREXHU2MzAxXHU3M0IwXHU3MkI2XHUzMDAyJyxcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChoaW50cy5sZW5ndGggPT09IDApIHtcbiAgICBoaW50cy5wdXNoKHtcbiAgICAgIGRpbWVuc2lvbjogJ0wxJyxcbiAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgIGljb246ICdjaGVjay1jaXJjbGUnLFxuICAgICAgdGV4dDogJ1x1N0NGQlx1N0VERlx1OEJDNFx1NEYzMFx1RkYxQVx1NTQwNFx1N0VGNFx1NUVBNlx1NjU3MFx1NjM2RVx1NjMwN1x1NjgwN1x1NUU3M1x1N0EzM1x1MzAwMicsXG4gICAgICBhY3Rpb246ICdcdTVGNTNcdTUyNERcdTgyODJcdTU5NEZcdTUzRUZcdTYzMDFcdTdFRURcdUZGMENcdTUzRUZcdTVDMURcdThCRDVcdTkwMTBcdTZCNjVcdTU4OUVcdTUyQTBcdTRFRkJcdTUyQTFcdThEMUZcdTgzNzdcdTMwMDInLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGhpbnRzO1xufVxuXG4vKiogXHU4RkQ0XHU1NkRFXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHU5NTJFXHVGRjBDXHU1RTc2XHU1MjE3XHU2NzAwXHU0RjRFXHU2NUY2XHU2MzA5XHU2NzQzXHU5MUNEXHU1M0Q2XHVGRjA4TDEgPiBMMiA+IEwzXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gd2Vha2VzdERpbWVuc2lvbihyOiBIZWFsdGhSZXN1bHQpOiBIZWFsdGhEaW1lbnNpb24ge1xuICBjb25zdCBhcnI6IEFycmF5PHsgZGltOiBIZWFsdGhEaW1lbnNpb247IHNjb3JlOiBudW1iZXI7IHdlaWdodDogbnVtYmVyIH0+ID0gW1xuICAgIHsgZGltOiAnTDEnLCBzY29yZTogci5MMS5zY29yZSwgd2VpZ2h0OiBUVU5JTkcuV0VJR0hUX0wxIH0sXG4gICAgeyBkaW06ICdMMicsIHNjb3JlOiByLkwyLnNjb3JlLCB3ZWlnaHQ6IFRVTklORy5XRUlHSFRfTDIgfSxcbiAgICB7IGRpbTogJ0wzJywgc2NvcmU6IHIuTDMuc2NvcmUsIHdlaWdodDogVFVOSU5HLldFSUdIVF9MMyB9LFxuICBdO1xuICBsZXQgbWluID0gYXJyWzBdO1xuICBmb3IgKGNvbnN0IHggb2YgYXJyKSB7XG4gICAgaWYgKHguc2NvcmUgPCBtaW4uc2NvcmUpIG1pbiA9IHg7XG4gICAgZWxzZSBpZiAoeC5zY29yZSA9PT0gbWluLnNjb3JlICYmIHgud2VpZ2h0ID4gbWluLndlaWdodCkgbWluID0geDtcbiAgfVxuICByZXR1cm4gbWluLmRpbTtcbn1cbiIsICIvKipcbiAqIFN1Z2dlc3Rpb24gXHUyMDE0IFx1OEJDQVx1NjVBRFx1NUVGQVx1OEJBRVx1NzY4NFx1N0VEM1x1Njc4NFx1NTMxNlx1ODg2OFx1NzkzQSArIFx1Nzg2RVx1NUI5QVx1NjAyN1x1NjUzOVx1NTE5OVx1RkYwOCM3XHVGRjA5XG4gKlxuICogXHU4QkJFXHU4QkExXHU2MTBGXHU1NkZFXHVGRjFBXHU2MjhBXHUzMDBDXHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU1RUZBXHU4QkFFXHUzMDBEXHU1MzQ3XHU3RUE3XHU0RTNBXHUzMDBDXHU3RUQzXHU2Nzg0XHU1MzE2XHU1RUZBXHU4QkFFXHUzMDBEXHVGRjBDXHU0RjdGXHU1MTc2XHU4MEZEKipcdTdDQkVcdTUxQzZcdTU0N0RcdTRFMkRcdTUxNzdcdTRGNTNcdTVCNTBcdTk4NzkqKlx1RkYwQ1xuICogXHU4MDBDXHU0RTBEXHU0RjlEXHU4RDU2IEFnZW50aWNQbGFuTW9kYWwgXHU5MUNDIEFJIFx1NUJGOVx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NzY4NFx1NEU4Q1x1NkIyMVx1NzMxQ1x1NkQ0Qlx1RkYwOGRpYWdub3Npcy1hY3Rpb24tbG9vcC1kZXNpZ24gXHUwMEE3NyBcdTk4Q0VcdTk2NjlcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTUxNzNcdTk1MkVcdTdFQTZcdTY3NUZcdUZGMUFcbiAqICAtIFx1NUI1MFx1OTg3OVx1NjVFMCBpZFx1RkYwQ1x1NTNFQVx1ODBGRFx1NjMwOVx1MzAwQ1x1NUI1MFx1OTg3OVx1NTQwRFx1RkYwOFx1NEUzQlx1RkYwOS8gXHU0RTBCXHU2ODA3XHVGRjA4XHU1OTA3XHVGRjA5XHUzMDBEXHU3ODZFXHU1QjlBXHU2MDI3XHU1MzM5XHU5MTREXHVGRjFCXG4gKiAgLSBhcHBseVN1Z2dlc3Rpb24gXHU1QjhDXHU1MTY4XHU3RUFGXHU1MUZEXHU2NTcwXHUzMDAxXHU0RTBEXHU1M0VGXHU1M0Q4XHVGRjFBXHU4RkQ0XHU1NkRFXHU2NUIwXHU2NTcwXHU3RUM0XHVGRjBDXHU3RUREXHU0RTBEIG11dGF0ZSBcdTUxNjVcdTUzQzJcdUZGMUJcbiAqICAtIFx1NzZFRVx1NjgwNy9cdTVCNTBcdTk4NzlcdTY3MkFcdTU0N0RcdTRFMkQgXHUyMTkyIGFwcGxpZWQ9ZmFsc2VcdTMwMDFcdTUzOUZcdTY4MTFcdTRFMERcdTUyQThcdUZGMDhcdTVCQjlcdTk1MTlcdUZGMENcdTdFRERcdTRFMERcdTYyOUJcdTk1MTlcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgR29hbEl0ZW0sIEdvYWxTdWJJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCB0eXBlIFN1Z2dlc3Rpb25BY3Rpb24gPVxuICB8ICdhZGp1c3RfZGFpbHlNaW4nIC8vIFx1NjUzOVx1NUI1MFx1OTg3OVx1NkJDRlx1NjVFNVx1OTFDRlxuICB8ICdyZW1vdmVfc3ViaXRlbScgLy8gXHU1MjIwXHU5NjY0XHU1QjUwXHU5ODc5XG4gIHwgJ2FkZF9zdWJpdGVtJyAvLyBcdTY1QjBcdTU4OUVcdTVCNTBcdTk4NzlcbiAgfCAnbm90ZSc7IC8vIFx1NEVDNVx1NjU4N1x1Njg0OFx1RkYwQ1x1NjVFMFx1N0VEM1x1Njc4NFx1NjUzOVx1NTJBOFxuXG5leHBvcnQgaW50ZXJmYWNlIFN1Z2dlc3Rpb25UYXJnZXQge1xuICAvKiogXHU3Q0JFXHU3ODZFXHU1QjUwXHU5ODc5XHU1NDBEXHVGRjA4XHU0RTNCXHU1MzM5XHU5MTREXHU5NTJFXHVGRjBDcHJvbXB0IFx1ODk4MVx1NkM0Mlx1NEUwRVx1NzcxRlx1NUI5RVx1NkUwNVx1NTM1NVx1NEUwMFx1ODFGNFx1RkYwOSAqL1xuICBzdWJJdGVtTmFtZT86IHN0cmluZztcbiAgLyoqIFx1NUI1MFx1OTg3OVx1NEUwQlx1NjgwN1x1RkYwOFx1NTkwN1x1OTAwOVx1NTMzOVx1OTE0RFx1OTUyRVx1RkYwOSAqL1xuICBzdWJJdGVtSW5kZXg/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3VnZ2VzdGlvblBhcmFtcyB7XG4gIC8qKiBhZGp1c3RfZGFpbHlNaW4gXHU3Njg0XHU2NUIwXHU1MDNDXHVGRjA4XHU3RUFGXHU2NTcwXHU1QjU3XHVGRjBDXHU4NDNEXHU1MjMwIEdvYWxTdWJJdGVtLmRhaWx5TWluIFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOSAqL1xuICBkYWlseU1pbj86IG51bWJlcjtcbiAgLyoqIGFkZF9zdWJpdGVtIFx1NzY4NFx1NTQwRFx1NzlGMCAqL1xuICBuYW1lPzogc3RyaW5nO1xuICAvKiogYWRkX3N1Yml0ZW0gXHU3Njg0XHU4MjgyXHU1OTRGXHU3QzdCXHU1NzhCICovXG4gIHRhc2tEYXlUeXBlPzogc3RyaW5nO1xuICBkZXRhaWw/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3VnZ2VzdGlvbiB7XG4gIGlkPzogc3RyaW5nO1xuICBhY3Rpb246IFN1Z2dlc3Rpb25BY3Rpb247XG4gIC8qKiBcdTc2RUVcdTY4MDdcdTVGMTVcdTc1MjhcdUZGMUFcdTRGMThcdTUxNDggZ29hbElkXHVGRjBDXHU1NkRFXHU5MDAwIHRpdGxlXHVGRjA4XHU1M0VGXHU5MDA5XHVGRjBDXHU4RkQwXHU4ODRDXHU2NUY2XHU2MzA5IGdvYWxJZCBcdTYyMTYgdGl0bGUgXHU1NDdEXHU0RTJEXHVGRjA5ICovXG4gIGdvYWxSZWY6IHsgZ29hbElkPzogc3RyaW5nOyBnb2FsVGl0bGU/OiBzdHJpbmcgfTtcbiAgLyoqIFx1NTQ3RFx1NEUyRFx1NzY4NFx1NTE3N1x1NEY1M1x1NUI1MFx1OTg3OSAqL1xuICB0YXJnZXQ/OiBTdWdnZXN0aW9uVGFyZ2V0O1xuICBwYXJhbXM/OiBTdWdnZXN0aW9uUGFyYW1zO1xuICAvKiogXHU0RUJBXHU3QzdCXHU1M0VGXHU4QkZCXHU2NTg3XHU2ODQ4XHVGRjA4RGlhZ25vc2lzTW9kYWwgXHU1QzU1XHU3OTNBXHU3NTI4XHVGRjBDXHU0RkREXHU3NTU5XHVGRjA5ICovXG4gIHRleHQ6IHN0cmluZztcbiAgcmF0aW9uYWxlPzogc3RyaW5nO1xuICAvKiogXHU4MDVBXHU3MTI2XHU3RUY0XHU1RUE2XHVGRjA4TDEvTDIvTDNcdUZGMDlcdUZGMENcdTRFQzVcdTRGOUJcdTdFRjRcdTVFQTZcdTY4MDdcdTdCN0VcdTVDNTVcdTc5M0EgKi9cbiAgZGltZW5zaW9uPzogJ0wxJyB8ICdMMicgfCAnTDMnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGx5UmVzdWx0IHtcbiAgZ29hbHM6IEdvYWxJdGVtW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVCOUVcdTk2NDVcdTUzRDFcdTc1MUZcdTRFODZcdTdFRDNcdTY3ODRcdTY1MzlcdTUyQTggKi9cbiAgYXBwbGllZDogYm9vbGVhbjtcbiAgbWVzc2FnZT86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gY2xvbmUoZ29hbHM6IEdvYWxJdGVtW10pOiBHb2FsSXRlbVtdIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ29hbHMpKSBhcyBHb2FsSXRlbVtdO1xufVxuXG5mdW5jdGlvbiBmaW5kR29hbChnb2FsczogR29hbEl0ZW1bXSwgczogU3VnZ2VzdGlvbik6IEdvYWxJdGVtIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGdvYWxzLmZpbmQoXG4gICAgKGcpID0+XG4gICAgICAocy5nb2FsUmVmLmdvYWxJZCAhPSBudWxsICYmIGcuaWQgPT09IHMuZ29hbFJlZi5nb2FsSWQpIHx8XG4gICAgICBnLnRpdGxlID09PSBzLmdvYWxSZWYuZ29hbFRpdGxlXG4gICk7XG59XG5cbmZ1bmN0aW9uIGZpbmRJdGVtSW5kZXgoaXRlbXM6IEdvYWxTdWJJdGVtW10sIHQ/OiBTdWdnZXN0aW9uVGFyZ2V0KTogbnVtYmVyIHtcbiAgaWYgKCF0KSByZXR1cm4gLTE7XG4gIGlmICh0LnN1Ykl0ZW1OYW1lICE9IG51bGwpIHtcbiAgICBjb25zdCBpID0gaXRlbXMuZmluZEluZGV4KChpdCkgPT4gaXQubmFtZSA9PT0gdC5zdWJJdGVtTmFtZSk7XG4gICAgaWYgKGkgPj0gMCkgcmV0dXJuIGk7XG4gIH1cbiAgaWYgKHQuc3ViSXRlbUluZGV4ICE9IG51bGwgJiYgdC5zdWJJdGVtSW5kZXggPj0gMCAmJiB0LnN1Ykl0ZW1JbmRleCA8IGl0ZW1zLmxlbmd0aCkge1xuICAgIHJldHVybiB0LnN1Ykl0ZW1JbmRleDtcbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogXHU3ODZFXHU1QjlBXHU2MDI3XHU2NTM5XHU1MTk5XHU1MzU1XHU2NzYxXHU1RUZBXHU4QkFFXHVGRjFBXHU4RkQ0XHU1NkRFKipcdTY1QjAqKiBnb2Fsc1x1RkYwOFx1NEUwRCBtdXRhdGUgXHU1MTY1XHU1M0MyXHVGRjA5XHUzMDAyXG4gKiBcdTY3MkFcdTU0N0RcdTRFMkRcdTc2RUVcdTY4MDcvXHU1QjUwXHU5ODc5IFx1NjIxNiBcdTUzQzJcdTY1NzBcdTk3NUVcdTZDRDUgXHUyMTkyIGFwcGxpZWQ9ZmFsc2VcdTMwMDFcdTUzOUZcdTY4MTFcdTRFMERcdTUyQThcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U3VnZ2VzdGlvbihzOiBTdWdnZXN0aW9uLCBnb2FsczogR29hbEl0ZW1bXSk6IEFwcGx5UmVzdWx0IHtcbiAgY29uc3QgZ29hbCA9IGZpbmRHb2FsKGdvYWxzLCBzKTtcbiAgaWYgKCFnb2FsKSB7XG4gICAgcmV0dXJuIHsgZ29hbHMsIGFwcGxpZWQ6IGZhbHNlLCBtZXNzYWdlOiAnXHU2NzJBXHU2MjdFXHU1MjMwXHU3NkVFXHU2ODA3JyB9O1xuICB9XG5cbiAgY29uc3Qgd29ya2luZyA9IGNsb25lKGdvYWxzKTtcbiAgY29uc3QgZyA9IHdvcmtpbmcuZmluZChcbiAgICAoeCkgPT5cbiAgICAgIChzLmdvYWxSZWYuZ29hbElkICE9IG51bGwgJiYgeC5pZCA9PT0gcy5nb2FsUmVmLmdvYWxJZCkgfHxcbiAgICAgIHgudGl0bGUgPT09IHMuZ29hbFJlZi5nb2FsVGl0bGVcbiAgKSE7XG5cbiAgc3dpdGNoIChzLmFjdGlvbikge1xuICAgIGNhc2UgJ2FkanVzdF9kYWlseU1pbic6IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gZy5pdGVtcyA/PyBbXTtcbiAgICAgIGNvbnN0IGlkeCA9IGZpbmRJdGVtSW5kZXgoaXRlbXMsIHMudGFyZ2V0KTtcbiAgICAgIGNvbnN0IHYgPSBzLnBhcmFtcz8uZGFpbHlNaW47XG4gICAgICBpZiAoaWR4IDwgMCB8fCB0eXBlb2YgdiAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZSh2KSB8fCB2IDwgMCkge1xuICAgICAgICByZXR1cm4geyBnb2FscywgYXBwbGllZDogZmFsc2UsIG1lc3NhZ2U6ICdcdTVCNTBcdTk4NzlcdTY3MkFcdTU0N0RcdTRFMkRcdTYyMTYgZGFpbHlNaW4gXHU5NzVFXHU2Q0Q1JyB9O1xuICAgICAgfVxuICAgICAgZy5pdGVtcyA9IGl0ZW1zLnNsaWNlKCk7XG4gICAgICBnLml0ZW1zW2lkeF0gPSB7IC4uLml0ZW1zW2lkeF0sIGRhaWx5TWluOiBTdHJpbmcoTWF0aC5tYXgoMCwgTWF0aC5yb3VuZCh2KSkpIH07XG4gICAgICByZXR1cm4geyBnb2Fsczogd29ya2luZywgYXBwbGllZDogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXNlICdyZW1vdmVfc3ViaXRlbSc6IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gZy5pdGVtcyA/PyBbXTtcbiAgICAgIGNvbnN0IGlkeCA9IGZpbmRJdGVtSW5kZXgoaXRlbXMsIHMudGFyZ2V0KTtcbiAgICAgIGlmIChpZHggPCAwKSB7XG4gICAgICAgIHJldHVybiB7IGdvYWxzLCBhcHBsaWVkOiBmYWxzZSwgbWVzc2FnZTogJ1x1NUI1MFx1OTg3OVx1NjcyQVx1NTQ3RFx1NEUyRCcgfTtcbiAgICAgIH1cbiAgICAgIGcuaXRlbXMgPSBpdGVtcy5maWx0ZXIoKF8sIGkpID0+IGkgIT09IGlkeCk7XG4gICAgICByZXR1cm4geyBnb2Fsczogd29ya2luZywgYXBwbGllZDogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXNlICdhZGRfc3ViaXRlbSc6IHtcbiAgICAgIGNvbnN0IG5hbWUgPSBzLnBhcmFtcz8ubmFtZTtcbiAgICAgIGlmICghbmFtZSkge1xuICAgICAgICByZXR1cm4geyBnb2FscywgYXBwbGllZDogZmFsc2UsIG1lc3NhZ2U6ICdcdTY1QjBcdTU4OUVcdTVCNTBcdTk4NzlcdTdGM0EgbmFtZScgfTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGl0ZW1zID0gZy5pdGVtcyA/PyBbXTtcbiAgICAgIGlmIChpdGVtcy5zb21lKChpdCkgPT4gaXQubmFtZSA9PT0gbmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHsgZ29hbHMsIGFwcGxpZWQ6IGZhbHNlLCBtZXNzYWdlOiAnXHU1QjUwXHU5ODc5XHU1REYyXHU1QjU4XHU1NzI4XHVGRjBDXHU4REYzXHU4RkM3XHU2NUIwXHU1ODlFJyB9O1xuICAgICAgfVxuICAgICAgY29uc3QgYWRkOiBHb2FsU3ViSXRlbSA9IHsgbmFtZSB9O1xuICAgICAgaWYgKHR5cGVvZiBzLnBhcmFtcz8uZGFpbHlNaW4gPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZShzLnBhcmFtcy5kYWlseU1pbikpIHtcbiAgICAgICAgYWRkLmRhaWx5TWluID0gU3RyaW5nKE1hdGgubWF4KDAsIE1hdGgucm91bmQocy5wYXJhbXMuZGFpbHlNaW4pKSk7XG4gICAgICB9XG4gICAgICBpZiAocy5wYXJhbXM/LnRhc2tEYXlUeXBlICE9IG51bGwpIGFkZC50YXNrRGF5VHlwZSA9IHMucGFyYW1zLnRhc2tEYXlUeXBlO1xuICAgICAgaWYgKHMucGFyYW1zPy5kZXRhaWwgIT0gbnVsbCkgYWRkLmRldGFpbCA9IHMucGFyYW1zLmRldGFpbDtcbiAgICAgIGcuaXRlbXMgPSBbLi4uaXRlbXMsIGFkZF07XG4gICAgICByZXR1cm4geyBnb2Fsczogd29ya2luZywgYXBwbGllZDogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXNlICdub3RlJzpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHsgZ29hbHMsIGFwcGxpZWQ6IGZhbHNlIH07XG4gIH1cbn1cblxuLyoqIFx1NjI5OFx1NTNFMFx1NUU5NFx1NzUyOFx1NTkxQVx1Njc2MVx1NUVGQVx1OEJBRVx1RkYwOFx1NEVDRVx1NURFNlx1NTIzMFx1NTNGM1x1RkYwOVx1RkYxQlx1NTM1NVx1Njc2MVx1NjcyQVx1NTQ3RFx1NEUyRFx1NEUwRFx1NUY3MVx1NTRDRFx1NTE3Nlx1NEY1OVx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U3VnZ2VzdGlvbnMobGlzdDogU3VnZ2VzdGlvbltdLCBnb2FsczogR29hbEl0ZW1bXSk6IEFwcGx5UmVzdWx0IHtcbiAgbGV0IGN1cnJlbnQgPSBnb2FscztcbiAgbGV0IGFwcGxpZWRBbnkgPSBmYWxzZTtcbiAgZm9yIChjb25zdCBzIG9mIGxpc3QpIHtcbiAgICBjb25zdCByID0gYXBwbHlTdWdnZXN0aW9uKHMsIGN1cnJlbnQpO1xuICAgIGlmIChyLmFwcGxpZWQpIHtcbiAgICAgIGFwcGxpZWRBbnkgPSB0cnVlO1xuICAgICAgY3VycmVudCA9IHIuZ29hbHM7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IGdvYWxzOiBjdXJyZW50LCBhcHBsaWVkOiBhcHBsaWVkQW55IH07XG59XG4iLCAiLyoqXG4gKiBydW5EaWFnbm9zaXMgXHUyMDE0IFx1MzAwQ0FJIFx1OEJDQVx1NjVBRCBcdTIxOTIgXHU4ODRDXHU1MkE4XHU5NUVEXHU3M0FGXHUzMDBEXHU1NDdEXHU0RUU0XHU3RjE2XHU2MzkyXHVGRjA4XHU3RUFGXHU5MDNCXHU4RjkxXHVGRjBDXHU1M0VGXHU1MzU1XHU2RDRCXHVGRjA5XG4gKlxuICogXHU1M0VBXHU4RDFGXHU4RDIzXHU2RDQxXHU3QTBCXHU1MUIzXHU3QjU2XHVGRjBDXHU0RTBEXHU2MzAxXHU2NzA5XHU0RUZCXHU0RjU1IE9ic2lkaWFuIC8gRE9NIFx1NEY5RFx1OEQ1Nlx1RkYxQVxuICogIC0gYWlFbmFibGVkIFx1OTVFOFx1Nzk4MSBcdTIxOTIgXHU2NUUwXHU3NkVFXHU2ODA3IFx1MjE5MiBcdThCRkIgZ29hbHMgKyBcdThGRDEgTiBcdTU5MjkgZGF5cyBcdTIxOTIgZGlhZ25vc2UgXHUyMTkyIFx1NjI1M1x1NUYwMFx1NTNFQVx1OEJGQlx1NjJBNVx1NTQ0QVx1RkYxQlxuICogIC0gXHU2MkE1XHU1NDRBXHU5MUNDXHU3MEI5XHUzMDBDXHU1RTk0XHU3NTI4XHUzMDBEXHUyMTkyIFx1NjI1M1x1NUYwMCBBZ2VudGljUGxhbk1vZGFsXHVGRjA4XHU4RjdEXHU1MTY1XHU3NzFGXHU1QjlFXHU2ODExICsgXHU5ODg0XHU1ODZCXHU1RUZBXHU4QkFFXHU2MzA3XHU0RUU0XHVGRjA5XHVGRjFCXG4gKiAgLSBBZ2VudGljIFx1Nzg2RVx1OEJBNCBcdTIxOTIgd3JpdGVHb2FscyBcdTg0M0RcdTVFOTNcdTMwMDJcbiAqIFx1NjI0MFx1NjcwOVx1NTI2Rlx1NEY1Q1x1NzUyOFx1RkYwOFx1OEJGQlx1NUI1OFx1NTBBOCAvIFx1NjI1M1x1NUYwMCBNb2RhbCAvIE5vdGljZSAvIFx1ODQzRFx1NUU5M1x1RkYwOVx1NTc0N1x1OTAxQVx1OEZDNyBkZXBzIFx1NkNFOFx1NTE2NVx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IFBsYW5uZXJTZXR0aW5ncyB9IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcbmltcG9ydCB0eXBlIHsgR29hbEl0ZW0sIERheURhdGEgfSBmcm9tICcuLi90eXBlcy9kYXRhJztcbmltcG9ydCB7IGRpYWdub3NlLCB0eXBlIERpYWdub3Npc1Jlc3VsdCwgdHlwZSBHb2FsRGlhZ25vc2lzIH0gZnJvbSAnLi9Hb2FsRGlhZ25vc2VyJztcbmltcG9ydCB7IGFwcGx5U3VnZ2VzdGlvbiwgYXBwbHlTdWdnZXN0aW9ucywgdHlwZSBTdWdnZXN0aW9uIH0gZnJvbSAnLi9TdWdnZXN0aW9uJztcbmltcG9ydCB7IGJ1aWxkQ2FjaGUsIGJ1aWxkSXRlbUV2aWRlbmNlTWFwLCB0eXBlIEl0ZW1FdmlkZW5jZSB9IGZyb20gJy4vRGV2aWF0aW9uQ2FsY3VsYXRvcic7XG5pbXBvcnQgeyBUVU5JTkcgfSBmcm9tICcuL2hlYWx0aFNjb3JlJztcbmltcG9ydCB0eXBlIHsgQWdlbnRpY1BsYW5PcHRpb25zIH0gZnJvbSAnLi9BZ2VudGljUGxhbk1vZGFsJztcblxuZXhwb3J0IGludGVyZmFjZSBEaWFnbm9zaXNTdG9yYWdlIHtcbiAgZ2V0R29hbHMoKTogUHJvbWlzZTxHb2FsSXRlbVtdPjtcbiAgZ2V0RGF5S2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPjtcbiAgZ2V0RGF5KGtleTogc3RyaW5nKTogUHJvbWlzZTxEYXlEYXRhIHwgbnVsbD47XG59XG5cbi8qKiBcdThCQ0FcdTY1QURcdTdGMTZcdTYzOTJcdTk2MzZcdTZCQjVcdUZGMDhcdTc1MjhcdTRFOEVcdTUyMDZcdTk2MzZcdTZCQjVcdThGREJcdTVFQTZcdTYzMDdcdTc5M0FcdUZGMENcdTY2RkZcdTRFRTMgXHUyNDY0IFx1NkQ0MVx1NUYwRiBTU0UgXHU5MDEwXHU1QjU3XHVGRjA5ICovXG5leHBvcnQgdHlwZSBEaWFnbm9zaXNQaGFzZSA9ICdjb2xsZWN0JyB8ICdhbmFseXplJyB8ICdhaScgfCAncmVuZGVyJyB8ICdkb25lJztcblxuLyoqIFx1OTYzNlx1NkJCNVx1NEUyRFx1NjU4N1x1NjgwN1x1N0I3RVx1RkYwOFx1NEUwRSBEaWFnbm9zaXNQcm9ncmVzc01vZGFsIFx1NTE3MVx1NzUyOFx1RkYwQ1x1NEZERFx1NjMwMVx1NTM1NVx1NEUwMFx1Njc2NVx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IERJQUdOT1NJU19QSEFTRV9MQUJFTDogUmVjb3JkPERpYWdub3Npc1BoYXNlLCBzdHJpbmc+ID0ge1xuICBjb2xsZWN0OiAnXHU2NTM2XHU5NkM2XHU3NkVFXHU2ODA3XHU0RTBFXHU2MjY3XHU4ODRDXHU4QkIwXHU1RjU1JyxcbiAgYW5hbHl6ZTogJ1x1OEJBMVx1N0I5N1x1NEUwOVx1N0VGNFx1NTA2NVx1NUVCN1x1NTIwNlx1NEUwRVx1NTA0Rlx1NURFRScsXG4gIGFpOiAnXHU4QzAzXHU3NTI4IEFJIFx1OEJDQVx1NjVBRFx1NEUyRFx1MjAyNicsXG4gIHJlbmRlcjogJ1x1ODlFM1x1Njc5MFx1OEJDQVx1NjVBRFx1N0VEM1x1Njc5QycsXG4gIGRvbmU6ICdcdTVCOENcdTYyMTAnLFxufTtcblxuLyoqIFN1Z2dlc3Rpb25BcHBseU1vZGFsIFx1NzY4NFx1NTE2NVx1NTNDMlx1RkYwOFx1ODA1QVx1NzEyNlx1OTg4NFx1ODlDOCArIFx1NEVCQVx1NURFNVx1OTVGOFx1OTVFOFx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBBcHBseVByZXZpZXdPcHRzIHtcbiAgc3VnZ2VzdGlvbnM6IFN1Z2dlc3Rpb25bXTtcbiAgYmVmb3JlOiBHb2FsSXRlbVtdO1xuICBhZnRlcjogR29hbEl0ZW1bXTtcbiAgb25Db25maXJtOiAoZ29hbHM6IEdvYWxJdGVtW10pID0+IHZvaWQ7XG4gIG9uRXNjYWxhdGVBST86IChnb2FsczogR29hbEl0ZW1bXSkgPT4gdm9pZDtcbiAgdGl0bGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc2lzRGVwcyB7XG4gIGFpRW5hYmxlZDogYm9vbGVhbjtcbiAgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3M7XG4gIHN0b3JhZ2U6IERpYWdub3Npc1N0b3JhZ2U7XG4gIGRpYWdub3NlOiB0eXBlb2YgZGlhZ25vc2U7XG4gIG9wZW5EaWFnbm9zaXM6IChvcHRzOiB7XG4gICAgZGlhZ25vc2lzOiBEaWFnbm9zaXNSZXN1bHQ7XG4gICAgaXRlbUV2aWRlbmNlPzogUmVjb3JkPHN0cmluZywgSXRlbUV2aWRlbmNlW10+O1xuICAgIC8qKiBcdTkwMTBcdTY3NjFcdTVFOTRcdTc1MjhcdUZGMUFcdTcwQjlcdTY3RDBcdTY3NjFcdTVFRkFcdThCQUVcdTRGMjBcdTUxNjUgKGdvYWwsIHN1Z2dlc3Rpb24pXHVGRjA4IzcgXHU3RUQzXHU2Nzg0XHU1MzE2XHVGRjA5ICovXG4gICAgb25BcHBseTogKGdvYWw6IEdvYWxEaWFnbm9zaXMsIHN1Z2dlc3Rpb246IFN1Z2dlc3Rpb24pID0+IHZvaWQ7XG4gICAgLyoqIFx1NTNFRlx1OTAwOVx1RkYxQVx1NUU5NFx1NzUyOFx1OEJFNSBnb2FsIFx1NTE2OFx1OTBFOFx1NUVGQVx1OEJBRSAqL1xuICAgIG9uQXBwbHlBbGw/OiAoZ29hbDogR29hbERpYWdub3NpcykgPT4gdm9pZDtcbiAgICAvKiogXHU1M0VGXHU5MDA5XHVGRjFBXHU2MkE1XHU1NDRBXHU3RUE3XHUzMDBDXHU0RTAwXHU5NTJFXHU1RTk0XHU3NTI4XHU1MTY4XHU5MEU4XHU1RUZBXHU4QkFFXHUzMDBEXHVGRjA4TVZQLTJcdUZGMDlcdUZGMENcdThERThcdTYyNDBcdTY3MDlcdTc2RUVcdTY4MDdcdTYyNzlcdTkxQ0YgKi9cbiAgICBvbkFwcGx5QWxsRGlhZ25vc2lzPzogKCkgPT4gdm9pZDtcbiAgfSkgPT4gdm9pZDtcbiAgLyoqIFx1Nzg2RVx1NUI5QVx1NjAyN1x1NjUzOVx1NTE5OVx1NTQwRVx1NzY4NFx1ODA1QVx1NzEyNlx1OTg4NFx1ODlDOFx1RkYwOCM3XHVGRjA5ICovXG4gIG9wZW5BcHBseVByZXZpZXc6IChvcHRzOiBBcHBseVByZXZpZXdPcHRzKSA9PiB2b2lkO1xuICBvcGVuQWdlbnRpYzogKG9wdHM6IEFnZW50aWNQbGFuT3B0aW9ucykgPT4gdm9pZDtcbiAgd3JpdGVHb2FsczogKGdvYWxzOiBHb2FsSXRlbVtdKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbiAgbm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQ7XG4gIHJlY2VudERheXM/OiBudW1iZXI7XG4gIC8qKiBcdTUzRUZcdTkwMDlcdUZGMUFcdTUyMDZcdTk2MzZcdTZCQjVcdThGREJcdTVFQTZcdTYzMDdcdTc5M0FcdUZGMDhcdTY2RkZcdTRFRTMgXHUyNDY0IFx1NkQ0MVx1NUYwRiBTU0UgXHU5MDEwXHU1QjU3XHVGRjA5XHVGRjBDXHU3RjE2XHU2MzkyXHU1NDA0XHU4RkI5XHU3NTRDXHU1M0QxXHU0RThCXHU0RUY2ICovXG4gIG9uUGhhc2U/OiAocGhhc2U6IERpYWdub3Npc1BoYXNlLCBsYWJlbDogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRGlhZ25vc2lzKGRlcHM6IERpYWdub3Npc0RlcHMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgZW1pdCA9IChwOiBEaWFnbm9zaXNQaGFzZSkgPT4gZGVwcy5vblBoYXNlPy4ocCwgRElBR05PU0lTX1BIQVNFX0xBQkVMW3BdKTtcblxuICBpZiAoIWRlcHMuYWlFbmFibGVkKSB7XG4gICAgZGVwcy5ub3RpY2UoJ0FJIFx1OEJDQVx1NjVBRFx1NjcyQVx1NTQyRlx1NzUyOFx1RkYxQVx1OEJGN1x1NTE0OFx1NTcyOFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NEUyRFx1NUYwMFx1NTQyRlx1NUU3Nlx1NTg2Qlx1NTE5OSBBUEkgS2V5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZW1pdCgnY29sbGVjdCcpOyAvLyBcdTI0NjAgXHU2NTM2XHU5NkM2XHU3NkVFXHU2ODA3XHU0RTBFXHU2MjY3XHU4ODRDXHU4QkIwXHU1RjU1XG4gIGNvbnN0IGFsbCA9IGF3YWl0IGRlcHMuc3RvcmFnZS5nZXRHb2FscygpO1xuICBpZiAoYWxsLmxlbmd0aCA9PT0gMCkge1xuICAgIGRlcHMubm90aWNlKCdcdTRGNjBcdThGRDhcdTZDQTFcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTUxNDhcdThERDFcdTRFMDBcdTZCMjEgQUkgXHU4OUM0XHU1MjEyJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gXHU1M0VBXHU4QkNBXHU2NUFEXHU4RkRCXHU4ODRDXHU0RTJEXHU3Njg0XHU3NkVFXHU2ODA3XHVGRjBDXHU1REYyXHU1RjUyXHU2ODYzXHU3NkVFXHU2ODA3XHVGRjA4YXJjaGl2ZWQ9dHJ1ZVx1RkYwOVx1NEUwRFx1NTNDMlx1NEUwRVxuICBjb25zdCBnb2FscyA9IGFsbC5maWx0ZXIoKGcpID0+ICFnLmFyY2hpdmVkKTtcbiAgaWYgKGdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIGRlcHMubm90aWNlKCdcdTVGNTNcdTUyNERcdTZDQTFcdTY3MDlcdThGREJcdTg4NENcdTRFMkRcdTc2ODRcdTc2RUVcdTY4MDdcdUZGMDhcdTVERjJcdTVGNTJcdTY4NjNcdTc2RUVcdTY4MDdcdTRFMERcdTUzQzJcdTRFMEVcdThCQ0FcdTY1QURcdUZGMDknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBcdTUwNjVcdTVFQjdcdTUyMDZcdTUwNUNcdTZFREVcdTUyMjRcdTVCOUFcdTk3MDBcdTU2REVcdTZFQUYgU1RBR05BVElPTl9XSU5ET1coNjApIFx1NEUyQVx1NURFNVx1NEY1Q1x1NjVFNVx1RkYwQ1x1NjU0NVx1NjJDOVx1NTNENlx1N0E5N1x1NTNFM1x1NEUwRFx1NUMwRlx1NEU4RVx1NkI2NFxuICBjb25zdCB3aW5kb3dEYXlzID0gTWF0aC5tYXgoZGVwcy5yZWNlbnREYXlzID8/IDE0LCBUVU5JTkcuU1RBR05BVElPTl9XSU5ET1cpO1xuICBjb25zdCBrZXlzID0gKGF3YWl0IGRlcHMuc3RvcmFnZS5nZXREYXlLZXlzKCkpLnNsaWNlKDAsIHdpbmRvd0RheXMpO1xuICBjb25zdCBkYXlzOiBEYXlEYXRhW10gPSBbXTtcbiAgZm9yIChjb25zdCBrIG9mIGtleXMpIHtcbiAgICBjb25zdCBkID0gYXdhaXQgZGVwcy5zdG9yYWdlLmdldERheShrKTtcbiAgICBpZiAoZCkgZGF5cy5wdXNoKGQpO1xuICB9XG5cbiAgLy8gXHU1N0ZBXHU0RThFXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5ICsgXHU1QjhDXHU2MjEwXHU4QkIwXHU1RjU1XHVGRjBDXHU3RUQ5XHU2MkE1XHU1NDRBXHU1RjM5XHU3QTk3XHU2M0QwXHU0RjlCXHU4QkMxXHU2MzZFXG4gIGVtaXQoJ2FuYWx5emUnKTsgLy8gXHUyNDYxIFx1OEJBMVx1N0I5N1x1NEUwOVx1N0VGNFx1NTA2NVx1NUVCN1x1NTIwNlx1NEUwRVx1NTA0Rlx1NURFRVxuICBjb25zdCBjYWNoZSA9IGJ1aWxkQ2FjaGUoZ29hbHMsIGRheXMpO1xuICBjb25zdCBpdGVtRXZpZGVuY2UgPSBidWlsZEl0ZW1FdmlkZW5jZU1hcChnb2FscywgY2FjaGUpO1xuXG4gIGVtaXQoJ2FpJyk7IC8vIFx1MjQ2MiBcdThDMDNcdTc1MjggQUkgXHU4QkNBXHU2NUFEXHVGRjA4XHU0RTNCXHU4OTgxXHU4MDE3XHU2NUY2XHVGRjA5XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRlcHMuZGlhZ25vc2UoZ29hbHMsIGRheXMsIGRlcHMucGxhbm5lclNldHRpbmdzKTtcblxuICBlbWl0KCdyZW5kZXInKTsgLy8gXHUyNDYzIFx1ODlFM1x1Njc5MFx1OEJDQVx1NjVBRFx1N0VEM1x1Njc5Q1xuICBkZXBzLm9wZW5EaWFnbm9zaXMoe1xuICAgIGRpYWdub3NpczogcmVzdWx0LFxuICAgIGl0ZW1FdmlkZW5jZSxcbiAgICBvbkFwcGx5OiAoZ29hbCwgc3VnZ2VzdGlvbikgPT4ge1xuICAgICAgLy8gIzdcdUZGMUFcdTc4NkVcdTVCOUFcdTYwMjdcdTY1MzlcdTUxOTlcdUZGMENcdTYzMDlcdTVCNTBcdTk4NzlcdTU0MERcdTdDQkVcdTUxQzZcdTU0N0RcdTRFMkRcdUZGMENcdTRFMERcdTUxOERcdTRFQTRcdTdFRDkgQUkgXHU0RThDXHU2QjIxXHU3MzFDXHU2RDRCXG4gICAgICBjb25zdCByZXMgPSBhcHBseVN1Z2dlc3Rpb24oc3VnZ2VzdGlvbiwgZ29hbHMpO1xuICAgICAgaWYgKCFyZXMuYXBwbGllZCkge1xuICAgICAgICBkZXBzLm5vdGljZSgnXHU4QkU1XHU1RUZBXHU4QkFFXHU2NzJBXHU1MzM5XHU5MTREXHU1MjMwXHU3NkVFXHU2ODA3L1x1NUI1MFx1OTg3OVx1RkYwQ1x1NjcyQVx1NjUzOVx1NTJBOCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkZXBzLm9wZW5BcHBseVByZXZpZXcoe1xuICAgICAgICBzdWdnZXN0aW9uczogW3N1Z2dlc3Rpb25dLFxuICAgICAgICBiZWZvcmU6IGdvYWxzLFxuICAgICAgICBhZnRlcjogcmVzLmdvYWxzLFxuICAgICAgICBvbkNvbmZpcm06IChmaW5hbCkgPT4gdm9pZCBkZXBzLndyaXRlR29hbHMoZmluYWwpLFxuICAgICAgICBvbkVzY2FsYXRlQUk6IChmaW5hbCkgPT5cbiAgICAgICAgICBkZXBzLm9wZW5BZ2VudGljKHtcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnLFxuICAgICAgICAgICAgc2NvcGU6ICdub3RlJyxcbiAgICAgICAgICAgIHNldHRpbmdzOiBkZXBzLnBsYW5uZXJTZXR0aW5ncyxcbiAgICAgICAgICAgIGdvYWxzOiBmaW5hbCxcbiAgICAgICAgICAgIG9uQ29uZmlybTogKGYpID0+IHZvaWQgZGVwcy53cml0ZUdvYWxzKGYpLFxuICAgICAgICAgIH0pLFxuICAgICAgICB0aXRsZTogYFx1NUU5NFx1NzUyOFx1NUVGQVx1OEJBRSBcdTAwQjcgJHtnb2FsLnRpdGxlfWAsXG4gICAgICB9KTtcbiAgICB9LFxuICAgIG9uQXBwbHlBbGw6IChnb2FsKSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBhcHBseVN1Z2dlc3Rpb25zKGdvYWwuc3VnZ2VzdGlvbnMsIGdvYWxzKTtcbiAgICAgIGlmICghcmVzLmFwcGxpZWQpIHtcbiAgICAgICAgZGVwcy5ub3RpY2UoJ1x1OEJFNVx1NzZFRVx1NjgwN1x1NUVGQVx1OEJBRVx1NjcyQVx1NTMzOVx1OTE0RFx1NTIzMFx1NzZFRVx1NjgwNy9cdTVCNTBcdTk4NzlcdUZGMENcdTY3MkFcdTY1MzlcdTUyQTgnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZGVwcy5vcGVuQXBwbHlQcmV2aWV3KHtcbiAgICAgICAgc3VnZ2VzdGlvbnM6IGdvYWwuc3VnZ2VzdGlvbnMsXG4gICAgICAgIGJlZm9yZTogZ29hbHMsXG4gICAgICAgIGFmdGVyOiByZXMuZ29hbHMsXG4gICAgICAgIG9uQ29uZmlybTogKGZpbmFsKSA9PiB2b2lkIGRlcHMud3JpdGVHb2FscyhmaW5hbCksXG4gICAgICAgIG9uRXNjYWxhdGVBSTogKGZpbmFsKSA9PlxuICAgICAgICAgIGRlcHMub3BlbkFnZW50aWMoe1xuICAgICAgICAgICAgY29udGVudDogJycsXG4gICAgICAgICAgICBzY29wZTogJ25vdGUnLFxuICAgICAgICAgICAgc2V0dGluZ3M6IGRlcHMucGxhbm5lclNldHRpbmdzLFxuICAgICAgICAgICAgZ29hbHM6IGZpbmFsLFxuICAgICAgICAgICAgb25Db25maXJtOiAoZikgPT4gdm9pZCBkZXBzLndyaXRlR29hbHMoZiksXG4gICAgICAgICAgfSksXG4gICAgICAgIHRpdGxlOiBgXHU1RTk0XHU3NTI4XHU1RUZBXHU4QkFFIFx1MDBCNyAke2dvYWwudGl0bGV9YCxcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgb25BcHBseUFsbERpYWdub3NpczogKCkgPT4ge1xuICAgICAgLy8gXHU1NzRGIEpTT04gXHU1NkRFXHU5MDAwXHU1RjYyXHU2MDAxXHU2NUUwIGdvYWxzXHVGRjBDXHU3NkY0XHU2M0E1XHU5MDAwXHU1MUZBXG4gICAgICBpZiAoIXJlc3VsdC5vaykgcmV0dXJuO1xuICAgICAgLy8gTVZQLTJcdUZGMUFcdThERThcdTYyNDBcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTYyOEFcdTUxNjhcdTkwRThcdTVFRkFcdThCQUVcdTRFMDBcdTZCMjFcdTYwMjdcdTc4NkVcdTVCOUFcdTYwMjdcdTYyNzlcdTkxQ0ZcdTY1MzlcdTUxOTlcbiAgICAgIGNvbnN0IGFsbCA9IHJlc3VsdC5nb2Fscy5mbGF0TWFwKChnKSA9PiBnLnN1Z2dlc3Rpb25zID8/IFtdKTtcbiAgICAgIGlmIChhbGwubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICBjb25zdCByZXMgPSBhcHBseVN1Z2dlc3Rpb25zKGFsbCwgZ29hbHMpO1xuICAgICAgaWYgKCFyZXMuYXBwbGllZCkge1xuICAgICAgICBkZXBzLm5vdGljZSgnXHU2MjQwXHU2NzA5XHU1RUZBXHU4QkFFXHU1NzQ3XHU2NzJBXHU1MzM5XHU5MTREXHU1MjMwXHU3NkVFXHU2ODA3L1x1NUI1MFx1OTg3OVx1RkYwQ1x1NjcyQVx1NjUzOVx1NTJBOCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkZXBzLm9wZW5BcHBseVByZXZpZXcoe1xuICAgICAgICBzdWdnZXN0aW9uczogYWxsLFxuICAgICAgICBiZWZvcmU6IGdvYWxzLFxuICAgICAgICBhZnRlcjogcmVzLmdvYWxzLFxuICAgICAgICBvbkNvbmZpcm06IChmaW5hbCkgPT4gdm9pZCBkZXBzLndyaXRlR29hbHMoZmluYWwpLFxuICAgICAgICBvbkVzY2FsYXRlQUk6IChmaW5hbCkgPT5cbiAgICAgICAgICBkZXBzLm9wZW5BZ2VudGljKHtcbiAgICAgICAgICAgIGNvbnRlbnQ6ICcnLFxuICAgICAgICAgICAgc2NvcGU6ICdub3RlJyxcbiAgICAgICAgICAgIHNldHRpbmdzOiBkZXBzLnBsYW5uZXJTZXR0aW5ncyxcbiAgICAgICAgICAgIGdvYWxzOiBmaW5hbCxcbiAgICAgICAgICAgIG9uQ29uZmlybTogKGYpID0+IHZvaWQgZGVwcy53cml0ZUdvYWxzKGYpLFxuICAgICAgICAgIH0pLFxuICAgICAgICB0aXRsZTogJ1x1NEUwMFx1OTUyRVx1NUU5NFx1NzUyOFx1NTE2OFx1OTBFOFx1NUVGQVx1OEJBRScsXG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcbn1cbiIsICIvKipcbiAqIERpYWdub3Npc1Byb2dyZXNzTW9kYWwgXHUyMDE0IEFJIFx1OEJDQVx1NjVBRFx1NTIwNlx1OTYzNlx1NkJCNVx1OEZEQlx1NUVBNlx1NjMwN1x1NzkzQVx1RkYwOFx1NjZGRlx1NEVFMyBcdTI0NjQgXHU2RDQxXHU1RjBGIFNTRSBcdTkwMTBcdTVCNTdcdUZGMDlcbiAqXG4gKiBcdThCQkVcdThCQTFcdThCRURcdThBMDBcdTRFMEUgRGlhZ25vc2lzTW9kYWwgLyBBZ2VudGljUGxhbk1vZGFsIFx1N0VERlx1NEUwMFx1RkYwOFx1NEUzQlx1OTg5OFx1ODI3MiAvIFx1NTcwNlx1ODlEMiAvIDhwdCBcdTdGNTFcdTY4M0NcdUZGMDlcdTMwMDJcbiAqIFx1NTNFQVx1NTA1QVx1MzAwQ1x1NzdFNVx1OTA1M1x1NTM2MVx1NTcyOFx1NTRFQVx1NEUwMFx1NkI2NVx1MzAwRFx1NzY4NFx1OEY3Qlx1OTFDRlx1OEZEQlx1NUVBNlx1RkYwQ1x1NEUwRFx1NTA1QVx1OTAxMFx1NUI1N1x1NkQ0MVx1NUYwRlx1MzAwMVx1NEUwRFx1ODlFM1x1Njc5MFx1NTM0QVx1NjIxMFx1NTRDMSBKU09OXHUzMDAyXG4gKlxuICogXHU3NTI4XHU2Q0Q1XHVGRjFBXG4gKiAgIGNvbnN0IHByb2dyZXNzID0gbmV3IERpYWdub3Npc1Byb2dyZXNzTW9kYWwoYXBwKTsgcHJvZ3Jlc3Mub3BlbigpO1xuICogICBydW5EaWFnbm9zaXMoeyBvblBoYXNlOiAocCwgbCkgPT4gcHJvZ3Jlc3Muc2V0UGhhc2UocCwgbCksIC4uLiB9KTtcbiAqICAgLy8gXHU2MkE1XHU1NDRBXHU1RjM5XHU3QTk3XHU2MjUzXHU1RjAwXHU2NUY2IHByb2dyZXNzLmNsb3NlKClcbiAqL1xuaW1wb3J0IHsgTW9kYWwsIHR5cGUgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgRElBR05PU0lTX1BIQVNFX0xBQkVMLCB0eXBlIERpYWdub3Npc1BoYXNlIH0gZnJvbSAnLi9ydW5EaWFnbm9zaXMnO1xuXG4vKiogXHU4RkRCXHU1RUE2XHU2QjY1XHU5QUE0XHU3Njg0XHU1QzU1XHU3OTNBXHU5ODdBXHU1RThGXHVGRjA4XHU0RTBEXHU1NDJCIGRvbmVcdUZGMDkgKi9cbmNvbnN0IFBIQVNFX09SREVSOiBEaWFnbm9zaXNQaGFzZVtdID0gWydjb2xsZWN0JywgJ2FuYWx5emUnLCAnYWknLCAncmVuZGVyJ107XG5cbmV4cG9ydCBjbGFzcyBEaWFnbm9zaXNQcm9ncmVzc01vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHN0ZXBzRWw/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBjdXJyZW50OiBEaWFnbm9zaXNQaGFzZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhYmVsczogUGFydGlhbDxSZWNvcmQ8RGlhZ25vc2lzUGhhc2UsIHN0cmluZz4+ID0ge307XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHApIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7XG4gICAgICB0ZXh0OiAnQUkgXHU4QkNBXHU2NUFEXHU4RkRCXHU4ODRDXHU0RTJEJyxcbiAgICAgIGNsczogJ2JhbWJvby1wcm9ncmVzcy10aXRsZScsXG4gICAgfSk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1x1NkI2M1x1NTcyOFx1NTkwRFx1NzZEOFx1NEY2MFx1NzY4NFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NjBDNVx1NTFCNVx1RkYwQ1x1OEJGN1x1N0EwRFx1NTAxOScsXG4gICAgICBjbHM6ICdiYW1ib28tcHJvZ3Jlc3Mtc3ViJyxcbiAgICB9KTtcbiAgICB0aGlzLnN0ZXBzRWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLXByb2dyZXNzLXN0ZXBzJyB9KTtcbiAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgIHRoaXMucmVuZGVyU3RlcHMoKTtcbiAgfVxuXG4gIC8qKiBcdTc1MzEgcnVuRGlhZ25vc2lzIFx1NTcyOFx1NTQwNFx1N0YxNlx1NjM5Mlx1OEZCOVx1NzU0Q1x1OEMwM1x1NzUyOFx1RkYwQ1x1OUE3MVx1NTJBOFx1NkI2NVx1OUFBNFx1NzJCNlx1NjAwMVx1NjczQSAqL1xuICBzZXRQaGFzZShwaGFzZTogRGlhZ25vc2lzUGhhc2UsIGxhYmVsPzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGxhYmVsKSB0aGlzLmxhYmVsc1twaGFzZV0gPSBsYWJlbDtcbiAgICB0aGlzLmN1cnJlbnQgPSBwaGFzZTtcbiAgICB0aGlzLnJlbmRlclN0ZXBzKCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclN0ZXBzKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0ZXBzRWwgPSB0aGlzLnN0ZXBzRWw7XG4gICAgaWYgKCFzdGVwc0VsKSByZXR1cm47XG4gICAgc3RlcHNFbC5lbXB0eSgpO1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuY3VycmVudCA/IFBIQVNFX09SREVSLmluZGV4T2YodGhpcy5jdXJyZW50KSA6IC0xO1xuICAgIFBIQVNFX09SREVSLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICAgIGNvbnN0IHN0YXRlID1cbiAgICAgICAgdGhpcy5jdXJyZW50ID09IG51bGxcbiAgICAgICAgICA/ICdpcy1wZW5kaW5nJ1xuICAgICAgICAgIDogaSA8IGlkeFxuICAgICAgICAgICAgPyAnaXMtZG9uZSdcbiAgICAgICAgICAgIDogaSA9PT0gaWR4XG4gICAgICAgICAgICAgID8gJ2lzLWN1cnJlbnQnXG4gICAgICAgICAgICAgIDogJ2lzLXBlbmRpbmcnO1xuICAgICAgY29uc3Qgc3RlcCA9IHN0ZXBzRWwuY3JlYXRlRGl2KHsgY2xzOiBgYmFtYm9vLXByb2dyZXNzLXN0ZXAgJHtzdGF0ZX1gIH0pO1xuICAgICAgc3RlcC5kYXRhc2V0WydwaGFzZSddID0gcDtcbiAgICAgIHN0ZXAuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLXByb2dyZXNzLWRvdCcgfSk7XG4gICAgICBzdGVwLmNyZWF0ZURpdih7XG4gICAgICAgIGNsczogJ2JhbWJvby1wcm9ncmVzcy1sYWJlbCcsXG4gICAgICAgIHRleHQ6IHRoaXMubGFiZWxzW3BdID8/IERJQUdOT1NJU19QSEFTRV9MQUJFTFtwXSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxvQkFBbUU7OztBQ0FuRSxJQUFBQyxtQkFBa0Q7OztBQ0FsRCxzQkFBNEQ7OztBQzhCNUQsSUFBSSxLQUFLO0FBQVQsSUFBcUIsTUFBTTtBQUEzQixJQUF3QyxNQUFNO0FBRTlDLElBQUksT0FBTyxJQUFJLEdBQUc7QUFBQSxFQUFDO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBO0FBQUEsRUFBZ0I7QUFBQSxFQUFHO0FBQUE7QUFBQSxFQUFvQjtBQUFDLENBQUM7QUFFaEosSUFBSSxPQUFPLElBQUksR0FBRztBQUFBLEVBQUM7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFB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QUFLO0FBRTNCLFFBQUksT0FBNkI7QUFDakMsVUFBTSxTQUFTLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUUvRCxRQUFJLE9BQU8sU0FBUyxHQUFHO0FBRXJCLGFBQU8sT0FBTyxDQUFDO0FBQUEsSUFDakIsT0FBTztBQUVMLGFBQU8sVUFBVSxRQUFRLEtBQUs7QUFDOUIsWUFBTSxLQUFLLGFBQWE7QUFBQSxRQUN0QixNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVixDQUFDO0FBQUEsSUFDSDtBQUVBLFFBQUksTUFBTTtBQUNSLFlBQU0sVUFBVSxXQUFXLElBQUk7QUFBQSxJQUNqQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQzNFO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsRUFDbkM7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJsIiwgIl9hIiwgIl9hIiwgIl9hIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAibWF4IiwgImVyciIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiZXJyIiwgImNsb25lIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInN1bW1hcml6ZSIsICJjbGFtcCIsICJjb3VudFdvcmtkYXlzIiwgImRpZmYiLCAic3RhZ25hbnREYXlzIiwgInBlbmFsdHkiLCAiY3VyIiwgInN1bW1hcml6ZSIsICJhbGwiLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
