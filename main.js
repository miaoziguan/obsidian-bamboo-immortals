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
var import_obsidian6 = require("obsidian");

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
    for (const [rawPath, content] of Object.entries(files)) {
      const rel = (0, import_obsidian.normalizePath)(rawPath.replace(/^\.?\//, ""));
      if (!rel) continue;
      const target = (0, import_obsidian.normalizePath)(`${this.webappDir}/${rel}`);
      await this.ensureParentDir(adapter, target);
      await adapter.writeBinary(target, content.slice().buffer);
    }
  }
  async ensureParentDir(adapter, filePath) {
    const parts = filePath.split("/");
    let acc = "";
    for (let i = 0; i < parts.length - 1; i++) {
      acc += (acc ? "/" : "") + parts[i];
      if (acc && !await this.fileExists(adapter, acc)) {
        try {
          await adapter.mkdir(acc);
        } catch {
        }
      }
    }
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
  followObsidianTheme: true
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

// main.ts
var BambooReviewPlugin = class extends import_obsidian6.Plugin {
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
    this.addSettingTab(new PluginSettings(this.app, this));
    this.addRibbonIcon("leaf", "\u7AF9\u6797\u4FEE\u4ED9\u4F20", () => {
      void this.activateView();
    });
  }
  onunload() {
    ThemeBridge.restoreDefaults();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9ob3N0L0FwcEhvc3QudHMiLCAibm9kZV9tb2R1bGVzL2ZmbGF0ZS9lc20vYnJvd3Nlci5qcyIsICJzcmMvaG9zdC9BcHBBUEkudHMiLCAic3JjL3N0b3JhZ2UvVmF1bHRTdG9yYWdlLnRzIiwgInNyYy9zdG9yYWdlL0ltcG9ydFZhbGlkYXRvci50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL2hvc3QvcHJvdG9jb2wudHMiLCAic3JjL2hvc3QvV2ViYXBwQ29udHJvbGxlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IERhaWx5UmV2aWV3VmlldywgVklFV19UWVBFX0RBSUxZX1JFVklFVyB9IGZyb20gJy4vc3JjL3ZpZXdzL0RhaWx5UmV2aWV3Vmlldyc7XG5pbXBvcnQgeyBBcHBIb3N0IH0gZnJvbSAnLi9zcmMvaG9zdC9BcHBIb3N0JztcbmltcG9ydCB7IFdlYmFwcENvbnRyb2xsZXIgfSBmcm9tICcuL3NyYy9ob3N0L1dlYmFwcENvbnRyb2xsZXInO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuL3NyYy9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHtcbiAgUGx1Z2luU2V0dGluZ3MsXG4gIERFRkFVTFRfU0VUVElOR1MsXG4gIHR5cGUgQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG59IGZyb20gJy4vc3JjL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcblxuLyoqXG4gKiBCYW1ib29SZXZpZXdQbHVnaW4gLSBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTZDRThcdTUxOEMgVmlldyBcdTdDN0JcdTU3OEJcbiAqIDIuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1RkYwOFx1NjI1M1x1NUYwMFx1NTkwRFx1NzZEOFx1MzAwMVx1NTI0RC9cdTU0MEVcdTRFMDBcdTU5MjlcdTMwMDFcdTdFREZcdThCQTFcdTk3NjJcdTY3N0ZcdUZGMDlcbiAqIDMuIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICogNC4gXHU3QkExXHU3NDA2XHU2M0QyXHU0RUY2XHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgd2ViYXBwITogV2ViYXBwQ29udHJvbGxlcjtcblxuICBhc3luYyBvbmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIGNvbnN0IHBsdWdpbkRpciA9IHRoaXMubWFuaWZlc3QuZGlyIHx8ICcnO1xuICAgIGNvbnN0IHZlcnNpb24gPSB0aGlzLm1hbmlmZXN0LnZlcnNpb24gfHwgJyc7XG5cbiAgICAvLyBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDYgd2ViYXBwXHVGRjFBXHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1MzczXHU4OUU2XHU1M0QxXHVGRjBDXHU2MjUzXHU1RjAwXHU4OUM2XHU1NkZFXHU1MjREXHU1OTI3XHU2OTgyXHU3Mzg3XHU1REYyXHU1QzMxXHU3RUVBXHVGRjBDXHU2RDg4XHU5NjY0XHUzMDBDXHU2MjUzXHU1RjAwXHU3QTdBXHU3NjdEXHUzMDBEXHU0RjUzXHU2MTFGXHUzMDAyXG4gICAgLy8gXHU1OTMxXHU4RDI1XHU0RTBEXHU5NjNCXHU1ODVFIG9ubG9hZFx1RkYwQ1x1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NjVGNiBidWlsZEJsb2JVcmwgXHU0RjFBXHU1MThEXHU2QjIxXHU1QzFEXHU4QkQ1XHUzMDAyXG4gICAgdm9pZCBBcHBIb3N0LnByZWZldGNoKHRoaXMuYXBwLCBwbHVnaW5EaXIsIHZlcnNpb24pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDIFZpZXdcdUZGMDhcdTRGMjBcdTkwMTIgcGx1Z2luRGlyIFx1NEY5QiBJdGVtVmlldyBcdTUyQTBcdThGN0Qgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOVxuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsIChsZWFmOiBXb3Jrc3BhY2VMZWFmKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IERhaWx5UmV2aWV3VmlldyhsZWFmLCBwbHVnaW5EaXIsIHRoaXMsIHRoaXMuc2V0dGluZ3MsICgpID0+IHRoaXMuc2F2ZVNldHRpbmdzKCkpO1xuICAgIH0pO1xuXG4gICAgLy8gXHU1QkJGXHU0RTNCIFx1MjE5MiB3ZWJhcHAgXHU3NkY0XHU4RkRFXHU2M0E1XHU1M0UzXHVGRjA4UGhhc2UzIFx1OTVFOFx1OTc2Mlx1RkYwQ1x1NTE4NVx1OTBFOFx1NEVDRFx1OEQ3MCBzZW5kQ29tbWFuZCBcdTdFQkZcdTUzNEZcdThCQUVcdUZGMDlcbiAgICB0aGlzLndlYmFwcCA9IG5ldyBXZWJhcHBDb250cm9sbGVyKCgpID0+IHtcbiAgICAgIGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG4gICAgICBpZiAobGVhdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gbGVhdmVzWzBdLnZpZXcgYXMgRGFpbHlSZXZpZXdWaWV3O1xuICAgIH0pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU1NDdEXHU0RUU0XG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1kYWlseS1yZXZpZXcnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NEVDQVx1NjVFNVx1NTkwRFx1NzZEOCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXByZXYtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTUyNERcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm5hdlByZXZEYXkoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm5hdk5leHREYXkoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXRvZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU2REVcdTUyMzBcdTRFQ0FcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm5hdlRvZGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLXN0YXRzJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTdFREZcdThCQTFcdTUyMDZcdTY3OTAnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm9wZW5TdGF0cygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy53ZWJhcHAub3BlblNldHRpbmdzKCksXG4gICAgfSk7XG5cbiAgICAvLyBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBsdWdpblNldHRpbmdzKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBcdTZERkJcdTUyQTBcdTVERTZcdTRGQTcgUmliYm9uIFx1NTZGRVx1NjgwN1xuICAgIHRoaXMuYWRkUmliYm9uSWNvbignbGVhZicsICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCAoKSA9PiB7XG4gICAgICB2b2lkIHRoaXMuYWN0aXZhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgfVxuXG4gIC8qKiBcdTZGQzBcdTZEM0JcdTYyMTZcdTUyMUJcdTVFRkFcdTU5MERcdTc2RDhcdTg5QzZcdTU2RkUgKi9cbiAgYXN5bmMgYWN0aXZhdGVWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblxuICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgbGVhdmVzID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcblxuICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gXHU1REYyXHU2NzA5XHU4OUM2XHU1NkZFXHVGRjBDXHU3NkY0XHU2M0E1XHU4MDVBXHU3MTI2XG4gICAgICBsZWFmID0gbGVhdmVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTY1QjBcdTg5QzZcdTU2RkVcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XG4gICAgICAgIHR5cGU6IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChsZWFmKSB7XG4gICAgICBhd2FpdCB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKSBhcyBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgRXZlbnRSZWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuaW1wb3J0IHsgQXBwSG9zdCB9IGZyb20gJy4uL2hvc3QvQXBwSG9zdCc7XG5pbXBvcnQgeyBBcHBBUEkgfSBmcm9tICcuLi9ob3N0L0FwcEFQSSc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZVx1RkYwOGJsb2IgVVJMXHVGRjA5XHU2MjdGXHU4RjdEIHdlYmFwcFxuICogMi4gXHU3QkExXHU3NDA2IEFwcEhvc3QgLyBBcHBBUEkgXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKiAzLiBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU1RTc2XHU1NDBDXHU2QjY1XG4gKi9cbmV4cG9ydCBjbGFzcyBEYWlseVJldmlld1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgcGx1Z2luRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgcGx1Z2luOiB1bmtub3duO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgcHJpdmF0ZSBhcHBIb3N0OiBBcHBIb3N0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgYXBwQVBJOiBBcHBBUEkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3NzQ2hhbmdlUmVmOiBFdmVudFJlZiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGxlYWY6IFdvcmtzcGFjZUxlYWYsXG4gICAgcGx1Z2luRGlyOiBzdHJpbmcsXG4gICAgX3BsdWdpbjogdW5rbm93bixcbiAgICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+XG4gICkge1xuICAgIHN1cGVyKGxlYWYpO1xuICAgIHRoaXMucGx1Z2luRGlyID0gcGx1Z2luRGlyO1xuICAgIHRoaXMucGx1Z2luID0gX3BsdWdpbjtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3M7XG4gIH1cblxuICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXO1xuICB9XG5cbiAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCc7XG4gIH1cblxuICBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdsZWFmJztcbiAgfVxuXG4gIGFzeW5jIG9uT3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXSBhcyBIVE1MRWxlbWVudDtcbiAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctY29udGFpbmVyJyk7XG5cbiAgICBpZiAoIXRoaXMucGx1Z2luRGlyKSB7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2NUUwXHU2Q0Q1XHU1QjlBXHU0RjREXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUyMURcdTU5Q0JcdTUzMTYgQXBwQVBJXHVGRjA4XHU5MDFBXHU0RkUxXHU1QzQyXHVGRjA5XG4gICAgdGhpcy5hcHBBUEkgPSBuZXcgQXBwQVBJKFxuICAgICAgdGhpcy5hcHAsXG4gICAgICB0aGlzLnNldHRpbmdzLFxuICAgICAgdGhpcy5zYXZlU2V0dGluZ3MsXG4gICAgICB0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCB8fCAnJyxcbiAgICAgIHRoaXMuYXBwLnZhdWx0LmNvbmZpZ0RpclxuICAgICk7XG4gICAgYXdhaXQgdGhpcy5hcHBBUEkuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICAvLyBcdTYyNkJcdTYzQ0ZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcbiAgICBjb25zdCBjdXN0b21UaGVtZXMgPSBhd2FpdCB0aGlzLnNjYW5DdXN0b21UaGVtZXMoKTtcbiAgICB0aGlzLmFwcEFQSS5zZXRDdXN0b21UaGVtZXMoY3VzdG9tVGhlbWVzKTtcblxuICAgIC8vIFx1NTIxQlx1NUVGQSBBcHBIb3N0IFx1NUU3Nlx1Njc4NFx1NUVGQSBibG9iIFVSTFxuICAgIGNvbnN0IHZlcnNpb24gPSAodGhpcy5wbHVnaW4gYXMgeyBtYW5pZmVzdD86IHsgdmVyc2lvbj86IHN0cmluZyB9IH0gfCB1bmRlZmluZWQpPy5tYW5pZmVzdD8udmVyc2lvbiA/PyAnJztcbiAgICB0aGlzLmFwcEhvc3QgPSBuZXcgQXBwSG9zdCh0aGlzLmFwcCwgdGhpcy5wbHVnaW5EaXIsIHZlcnNpb24pO1xuXG4gICAgY29uc3QgbG9hZGluZ0VsID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICB0ZXh0OiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHU1MkEwXHU4RjdEXHU0RTJEXHUyMDI2JyxcbiAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctbG9hZGluZycsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5hcHBBUEkuc3RhcnRMaXN0ZW5pbmcoKTtcbiAgICAgIGNvbnN0IGJsb2JVcmwgPSBhd2FpdCB0aGlzLmFwcEhvc3QuYnVpbGRCbG9iVXJsKCk7XG5cbiAgICAgIHRoaXMuaWZyYW1lID0gY29udGFpbmVyLmNyZWF0ZUVsKCdpZnJhbWUnLCB7XG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZnJhbWUnLFxuICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgc3JjOiBibG9iVXJsLFxuICAgICAgICAgIGFsbG93OiAnY2FtZXJhOyBtaWNyb3Bob25lOyBjbGlwYm9hcmQtcmVhZDsgY2xpcGJvYXJkLXdyaXRlJyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBsb2FkaW5nRWwucmVtb3ZlKCk7XG4gICAgICB0aGlzLmFwcEFQSS5iaW5kSWZyYW1lKHRoaXMuaWZyYW1lKTtcblxuICAgICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSB0aGlzLmFwcC53b3Jrc3BhY2Uub24oJ2Nzcy1jaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuYXBwQVBJPy5vblRoZW1lQ2hhbmdlZCh0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9hZGluZ0VsLnJlbW92ZSgpO1xuICAgICAgY29uc29sZS5lcnJvcignW0JhbWJvb1Jldmlld10gXHU1MkEwXHU4RjdEIHdlYmFwcCBcdTU5MzFcdThEMjU6JywgZSk7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogYFx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNTogJHtlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU2NzJBXHU3N0U1XHU5NTE5XHU4QkVGJ31gLFxuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWVycm9yJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG9uQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU2RTA1XHU3NDA2XHU0RTNCXHU5ODk4XHU3NkQxXHU1NDJDXG4gICAgaWYgKHRoaXMuY3NzQ2hhbmdlUmVmKSB7XG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub2ZmcmVmKHRoaXMuY3NzQ2hhbmdlUmVmKTtcbiAgICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdTZFMDVcdTc0MDZcdTkwMUFcdTRGRTFcdTVDNDJcbiAgICB0aGlzLmFwcEFQST8uZGV0YWNoKCk7XG4gICAgdGhpcy5hcHBBUEkgPSBudWxsO1xuXG4gICAgLy8gXHU2RTA1XHU3NDA2IGJsb2IgVVJMXG4gICAgdGhpcy5hcHBIb3N0Py5kZXN0cm95KCk7XG4gICAgdGhpcy5hcHBIb3N0ID0gbnVsbDtcblxuICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgdGhpcy5pZnJhbWUucmVtb3ZlKCk7XG4gICAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjNBNVx1NjUzNlx1Njc2NVx1ODFFQVx1NjNEMlx1NEVGNlx1NzY4NFx1NUJGQ1x1ODIyQS9cdTY0Q0RcdTRGNUNcdTYzMDdcdTRFRTQgKi9cbiAgc2VuZENvbW1hbmQodHlwZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7IHR5cGUsIGlkOiAnY21kXycgKyBEYXRlLm5vdygpIH0sXG4gICAgICAnKidcbiAgICApO1xuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRiBWYXVsdCBcdTRFMkRcdTc2ODRcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggKi9cbiAgcHJpdmF0ZSBhc3luYyBzY2FuQ3VzdG9tVGhlbWVzKCk6IFByb21pc2U8QXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRoZW1lRGlyTmFtZSA9IHRoaXMuc2V0dGluZ3MudGhlbWVQYXRoIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgbGV0IHRoZW1lRGlyRmlsZXM6IHN0cmluZ1tdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbWVEaXJGaWxlcyA9IChhd2FpdCBhZGFwdGVyLmxpc3QodGhlbWVEaXJOYW1lKSkuZmlsZXM7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIHRoZW1lcztcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGVtZURpckZpbGVzKSB7XG4gICAgICAgIGlmICghZW50cnkuZW5kc1dpdGgoJy5qcycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBgJHt0aGVtZURpck5hbWV9LyR7ZW50cnl9YDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb2RlOiBzdHJpbmcgPSBhd2FpdCBhZGFwdGVyLnJlYWQoZmlsZVBhdGgpO1xuICAgICAgICAgIGlmICghY29kZS5pbmNsdWRlcygnX19iYW1ib29fdGhlbWVfJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1N0YzQVx1NUMxMSBfX2JhbWJvb190aGVtZV8gXHU2ODA3XHU4QkM2XHU3QjI2XHVGRjBDXHU1REYyXHU4REYzXHU4RkM3YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhlbWVzLnB1c2goeyBuYW1lOiBlbnRyeS5yZXBsYWNlKC9cXC5qcyQvLCAnJyksIGNvZGUgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtCYW1ib29SZXZpZXddIFx1OEJGQlx1NTNENlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTU5MzFcdThEMjU6YCwgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhlbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgW0JhbWJvb1Jldmlld10gXHU1M0QxXHU3M0IwICR7dGhlbWVzLmxlbmd0aH0gXHU0RTJBXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4OmAsIHRoZW1lcy5tYXAodCA9PiB0Lm5hbWUpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1tCYW1ib29SZXZpZXddIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NjVGNlx1NTFGQVx1OTUxOTonLCBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGVtZXM7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIERhdGFBZGFwdGVyLCBub3JtYWxpemVQYXRoLCByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgdW56aXBTeW5jIH0gZnJvbSAnZmZsYXRlJztcblxuLyoqXG4gKiBBcHBIb3N0IFx1MjAxNCB3ZWJhcHAgXHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU0RTBFXHU2Q0U4XHU1MTY1XHU0RTJEXHU1RkMzXG4gKlxuICogXHU1MkEwXHU4RjdEXHU3QjU2XHU3NTY1XHVGRjA4XHU4RjdCXHU5MUNGXHUzMDAxXHU5NkY2XHU1MTg1XHU1RDRDXHVGRjA5XHVGRjFBXG4gKiAgIDEuIFx1OEJGQlx1NTNENlx1Njc4NFx1NUVGQVx1NjcxRlx1NzUxRlx1NjIxMFx1NzY4NFx1ODFFQVx1NTMwNVx1NTQyQiB3ZWJhcHAvYXBwLmh0bWxcdUZGMDhDU1MgXHU1REYyXHU1MTg1XHU4MDU0XHUzMDAxYnVuZGxlIFx1NURGMlx1NTE4NVx1ODA1NFx1NEUzQVx1OTc1OVx1NjAwMVxuICogICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj4gXHU2ODA3XHU3QjdFXHVGRjBDXHU2NUUwXHU0RUZCXHU0RjU1XHU1OTE2XHU5MEU4XHU4MTFBXHU2NzJDXHUzMDAxXHU2NUUwXHU1MzYwXHU0RjREXHU3QjI2XHVGRjA5XHUzMDAyXG4gKiAgIDIuIFx1NUMwNlx1NjU3NFx1OTg3NSBIVE1MIFx1NEVFNSBibG9iIFVSTCBcdTVGNjJcdTVGMEZcdTRFQTRcdTdFRDkgaWZyYW1lIFx1NTJBMFx1OEY3RFx1MzAwMlxuICpcbiAqIFx1NzUzMVx1NEU4RVx1NjI0MFx1NjcwOSA8c2NyaXB0PiBcdTU3NDdcdTU3MjhcdTY3ODRcdTVFRkFcdTY3MUZcdUZGMDhidW5kbGUtd2ViYXBwLm1qc1x1RkYwOVx1OTc1OVx1NjAwMVx1NTE5OVx1NTE2NSBhcHAuaHRtbFx1RkYwQ1x1OEZEMFx1ODg0Q1x1NjVGNlxuICogbWFpbi5qcyBcdTRFMERcdTUyMUJcdTVFRkFcdTMwMDFcdTRFMERcdTYyRkNcdTYzQTVcdTRFRkJcdTRGNTUgc2NyaXB0IFx1NTE0M1x1N0QyMFx1RkYwQ1x1ODlDNFx1OTA3Rlx1NUI4OVx1NTE2OFx1NjI2Qlx1NjNDRlx1MzAwQ1x1NTJBOFx1NjAwMVx1NkNFOFx1NTE2NVx1ODExQVx1NjcyQ1x1MzAwRFx1OEJFRlx1NjJBNVx1MzAwMlxuICpcbiAqIHdlYmFwcCBcdTc1MzFcdTUzRDFcdTVFMDNcdTZENDFcdTdBMEJcdTYyNTNcdTUzMDVcdTRFM0Egd2ViYXBwLnppcCBcdTk2OEZcdTcyNDhcdTY3MkNcdTUyMDZcdTUzRDFcdUZGMDhcdTg5QzEgLmdpdGh1Yi93b3JrZmxvd3MvcmVsZWFzZS55bWxcdUZGMDlcdUZGMENcbiAqIFx1NjcyQ1x1NTczMFx1NUYwMFx1NTNEMS9cdTUxODVcdTZENEJcdTkwMUFcdThGQzcgc3luYy5zaCBcdTU0MENcdTZCNjVcdTY1NzRcdTRFMkEgd2ViYXBwLyBcdTc2RUVcdTVGNTVcdUZGMDhcdTU0MkIgYXBwLmh0bWxcdUZGMDlcdUZGMENcdThGRDBcdTg4NENcdTY1RjZcdTc2RjRcdTYzQTVcdThCRkJcdTUzRDZcdUZGMENcbiAqIFx1NjVFMFx1OTcwMFx1NTE4NVx1NUQ0Q1x1MzAwMVx1NjVFMFx1NTkxNlx1OTBFOFx1ODA1NFx1N0Y1MVx1RkYwQ21haW4uanMgXHU0RkREXHU2MzAxXHU4RjdCXHU5MUNGXHUzMDAyXG4gKlxuICogXHU4MUVBXHU2MTA4XHVGRjA4XHU3MjQ4XHU2NzJDXHU1Qjg4XHU1MzZCXHVGRjA5XHVGRjFBXHU4RkQwXHU4ODRDXHU2NUY2XHU2QkQ0XHU1QkY5IHdlYmFwcC8ud2ViYXBwLXZlcnNpb24gXHU0RTBFXHU1RjUzXHU1MjREXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHUzMDAyXG4gKiAgIC0gXHU2NzJDXHU1NzMwXHU3RjNBXHU1OTMxIHdlYmFwcC9cdUZGMENcdTYyMTZcdTcyNDhcdTY3MkNcdTYyMzNcdTdGM0FcdTU5MzFcdUZGMDhcdTgwMDEgY2xvbmUgLyBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDlcdTIxOTIgXHU0RkUxXHU0RUZCXHU3OEMxXHU3NkQ4XHU2MjE2XHU5NjREXHU3RUE3XHVGRjFCXG4gKiAgIC0gXHU3MjQ4XHU2NzJDXHU0RTBEXHU3QjI2XHVGRjA4XHU2M0QyXHU0RUY2XHU1REYyXHU1MzQ3XHU3RUE3XHU0RjQ2IHdlYmFwcCBcdTY3MkFcdThEREZcdTk2OEZcdUZGMDlcdTIxOTIgXHU5MUNEXHU2NUIwXHU0RUNFXHU1QkY5XHU1RTk0XHU3MjQ4XHU2NzJDIEdpdEh1YiBSZWxlYXNlXG4gKiAgICAgXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEIHdlYmFwcC56aXAgXHU1RTc2XHU4OUUzXHU1MzhCXHVGRjBDXHU0RjdGXHUzMDBDd2ViYXBwIFx1NjZGNFx1NjVCMFx1N0VDRiBHaXRIdWIgXHU5NjhGXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHU5MDAxXHU4RkJFXHUzMDBEXHU3NzFGXHU2QjYzXHU2MjEwXHU3QUNCXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBIb3N0IHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSB3ZWJhcHBEaXI6IHN0cmluZztcbiAgcHJpdmF0ZSBibG9iVXJsczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSByZWFkb25seSB2ZXJzaW9uOiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVwbyA9ICdtaWFvemlndWFuL29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW5EaXI6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKSB7XG4gICAgdGhpcy5hcHAgPSBhcHA7XG4gICAgdGhpcy53ZWJhcHBEaXIgPSBub3JtYWxpemVQYXRoKGAke3BsdWdpbkRpcn0vd2ViYXBwYCk7XG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbjtcbiAgfVxuXG4gIC8vIFx1NTQwRVx1NTNGMFx1OTg4NFx1NjJDOVx1NTNENlx1NzY4NFx1NTNCQlx1OTFDRFx1N0YxM1x1NUI1OFx1RkYxQVx1OTA3Rlx1NTE0RFx1NjNEMlx1NEVGNiBvbmxvYWQgXHU5ODg0XHU2MkM5XHU1M0Q2XHU0RTBFXHU4OUM2XHU1NkZFXHU2MjUzXHU1RjAwXHU2NUY2XHU5MUNEXHU1OTBEXHU0RTBCXHU4RjdEXG4gIHByaXZhdGUgc3RhdGljIHByZWZldGNoQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTx2b2lkPj4oKTtcblxuICAvKipcbiAgICogXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2XHVGRjFBXHU2M0QyXHU0RUY2IG9ubG9hZCBcdTY1RjZcdThDMDNcdTc1MjhcdUZGMENcdTYzRDBcdTUyNERcdTYyOEFcdTdGM0FcdTU5MzFcdTc2ODQgd2ViYXBwIFx1NEUwQlx1OEY3RFx1NUU3Nlx1ODlFM1x1NTM4Qlx1NTIzMFx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NVx1MzAwMlxuICAgKiBcdTZCNjNcdTVFMzhcdTVCODlcdTg4QzVcdUZGMDh3ZWJhcHAvIFx1NURGMlx1OTY4Rlx1NjNEMlx1NEVGNlx1NTIwNlx1NTNEMVx1RkYwOVx1NjVGNlx1NEVDNVx1NTA1QVx1NEUwMFx1NkIyMVx1NUI1OFx1NTcyOFx1NjAyN1x1NjhDMFx1NjdFNVx1RkYwQ1x1NTFFMFx1NEU0RVx1OTZGNlx1NUYwMFx1OTUwMFx1MzAwMlxuICAgKiBcdTU5MzFcdThEMjVcdTRFQzVcdTU0NEFcdThCNjZcdUZGMDhcdTRFMERcdTYyOUJcdTUxRkFcdUZGMDlcdUZGMENcdTc3MUZcdTZCNjNcdTYyNTNcdTVGMDBcdTg5QzZcdTU2RkVcdTY1RjYgYnVpbGRCbG9iVXJsIFx1NEYxQVx1NTE4RFx1NkIyMVx1NUMxRFx1OEJENVx1RkYxQlxuICAgKiBcdTU0MENcdTRFMDBcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdTVFNzZcdTUzRDFcdTUzRUFcdTg5RTZcdTUzRDFcdTRFMDBcdTZCMjFcdTRFMEJcdThGN0RcdTMwMDJcbiAgICovXG4gIHN0YXRpYyBwcmVmZXRjaChhcHA6IEFwcCwgcGx1Z2luRGlyOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGtleSA9IG5vcm1hbGl6ZVBhdGgoYCR7cGx1Z2luRGlyfS93ZWJhcHBgKTtcbiAgICBsZXQgcCA9IEFwcEhvc3QucHJlZmV0Y2hDYWNoZS5nZXQoa2V5KTtcbiAgICBpZiAoIXApIHtcbiAgICAgIGNvbnN0IGhvc3QgPSBuZXcgQXBwSG9zdChhcHAsIHBsdWdpbkRpciwgdmVyc2lvbik7XG4gICAgICBwID0gaG9zdC5lbnN1cmVXZWJhcHAoYXBwLnZhdWx0LmFkYXB0ZXIpLmNhdGNoKChlOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnW0FwcEhvc3RdIFx1NTQwRVx1NTNGMFx1OTg4NFx1NjJDOVx1NTNENiB3ZWJhcHAgXHU1OTMxXHU4RDI1XHVGRjA4XHU2MjUzXHU1RjAwXHU4OUM2XHU1NkZFXHU2NUY2XHU1QzA2XHU5MUNEXHU4QkQ1XHVGRjA5XHVGRjFBJyxcbiAgICAgICAgICBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgQXBwSG9zdC5wcmVmZXRjaENhY2hlLnNldChrZXksIHApO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGFzeW5jIGJ1aWxkQmxvYlVybCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuXG4gICAgLy8gXHU4MUVBXHU2MTA4XHVGRjFBd2ViYXBwLyBcdTdGM0FcdTU5MzFcdTY1RjZcdTRFQ0VcdTVCRjlcdTVFOTRcdTcyNDhcdTY3MkMgUmVsZWFzZSBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTVFNzZcdTg5RTNcdTUzOEJcbiAgICBhd2FpdCB0aGlzLmVuc3VyZVdlYmFwcChhZGFwdGVyKTtcblxuICAgIGNvbnN0IGFwcEh0bWxQYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLndlYmFwcERpcn0vYXBwLmh0bWxgKTtcbiAgICBsZXQgaHRtbDogc3RyaW5nO1xuICAgIHRyeSB7XG4gICAgICBodG1sID0gYXdhaXQgYWRhcHRlci5yZWFkKGFwcEh0bWxQYXRoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignXHU2NUUwXHU2Q0Q1XHU4QkZCXHU1M0Q2IHdlYmFwcC9hcHAuaHRtbFx1RkYwQ1x1NEUxNFx1ODFFQVx1NTJBOFx1NEUwQlx1OEY3RFx1NTkzMVx1OEQyNVx1MzAwMlx1OEJGN1x1NUMxRFx1OEJENVx1NTcyOCBPYnNpZGlhbiBcdTRFMkRcdTkxQ0RcdTY1QjBcdTVCODlcdTg4QzVcdTY3MkNcdTYzRDJcdTRFRjZcdUZGMENcdTYyMTZcdTYyNEJcdTUyQThcdTY1M0VcdTdGNkUgd2ViYXBwLyBcdTc2RUVcdTVGNTUnKTtcbiAgICB9XG5cbiAgICAvLyBcdTY1NzRcdTk4NzUgSFRNTCBcdTVERjJcdTgxRUFcdTUzMDVcdTU0MkJcdUZGMDhDU1MgXHU1MTg1XHU4MDU0ICsgYnVuZGxlIFx1NTE4NVx1ODA1NFx1NEUzQVx1OTc1OVx1NjAwMSA8c2NyaXB0Plx1RkYwOVx1RkYwQ1x1NzZGNFx1NjNBNSBibG9iIFx1NEVBNFx1N0VEOSBpZnJhbWVcdTMwMDJcbiAgICAvLyBcdThGRDBcdTg4NENcdTY1RjZcdTRFMERcdTUyMUJcdTVFRkFcdTMwMDFcdTRFMERcdTYyRkNcdTYzQTVcdTRFRkJcdTRGNTUgc2NyaXB0IFx1NTE0M1x1N0QyMFx1MzAwMlxuICAgIGNvbnN0IHBhZ2VCbG9iID0gbmV3IEJsb2IoW2h0bWxdLCB7IHR5cGU6ICd0ZXh0L2h0bWwnIH0pO1xuICAgIGNvbnN0IHBhZ2VVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHBhZ2VCbG9iKTtcbiAgICB0aGlzLmJsb2JVcmxzLnB1c2gocGFnZVVybCk7XG4gICAgcmV0dXJuIHBhZ2VVcmw7XG4gIH1cblxuICAvKipcbiAgICogXHU4MUVBXHU2MTA4XHVGRjA4XHU3MjQ4XHU2NzJDXHU1Qjg4XHU1MzZCXHVGRjA5XHVGRjFBXHU4MkU1XHU2NzJDXHU1NzMwIHdlYmFwcCBcdTdGM0FcdTU5MzFcdUZGMENcdTYyMTZcdTVERjJcdTVCNThcdTU3MjhcdTRGNDZcdTcyNDhcdTY3MkNcdTYyMzNcdTRFMEVcdTVGNTNcdTUyNERcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdTRFMERcdTdCMjZcdUZGMENcbiAgICogXHU1MjE5XHU5MUNEXHU2NUIwXHU0RUNFIEdpdEh1YiBSZWxlYXNlIFx1NEUwQlx1OEY3RFx1NUJGOVx1NUU5NFx1NzI0OFx1NjcyQ1x1NzY4NCB3ZWJhcHAuemlwIFx1ODlFM1x1NTM4Qlx1RkYwOFx1ODk4Nlx1NzZENlx1RkYwOVx1MzAwMlxuICAgKiBcdTZCNjNcdTVFMzhcdTVCODlcdTg4QzVcdUZGMDh3ZWJhcHAvIFx1NURGMlx1OTY4Rlx1NjNEMlx1NEVGNlx1NTIwNlx1NTNEMVx1NEUxNFx1NzI0OFx1NjcyQ1x1NTMzOVx1OTE0RFx1RkYwOVx1NUI4Q1x1NTE2OFx1NEUwRFx1ODlFNlx1NTNEMVx1ODA1NFx1N0Y1MVx1RkYxQlx1NEVDNVx1N0YzQVx1NTkzMVx1NjIxNlx1OEZDN1x1NjcxRlx1NjVGNlx1NTE1Q1x1NUU5NVx1MzAwMlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVXZWJhcHAoYWRhcHRlcjogRGF0YUFkYXB0ZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB2ZXJzaW9uU3RhbXBGaWxlID0gJy53ZWJhcHAtdmVyc2lvbic7XG4gICAgY29uc3QgYXBwSHRtbFBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS9hcHAuaHRtbGApO1xuICAgIGNvbnN0IHN0YW1wUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9LyR7dmVyc2lvblN0YW1wRmlsZX1gKTtcblxuICAgIGlmIChhd2FpdCB0aGlzLmZpbGVFeGlzdHMoYWRhcHRlciwgYXBwSHRtbFBhdGgpKSB7XG4gICAgICAvLyB3ZWJhcHAvIFx1NUI1OFx1NTcyOFx1RkYxQVx1NEVDNVx1NUY1M1x1NzI0OFx1NjcyQ1x1NjIzM1x1N0YzQVx1NTkzMVx1RkYwOFx1ODAwMSBjbG9uZSAvIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOVx1NjIxNlx1NzI0OFx1NjcyQ1x1NEUwRFx1N0IyNlx1NjVGNlx1NjI0RFx1OTFDRFx1NEUwQlx1RkYwQ1xuICAgICAgLy8gXHU1NDI2XHU1MjE5XHU0RkUxXHU0RUZCXHU3OEMxXHU3NkQ4IFx1MjAxNFx1MjAxNCBCUkFUIC8gZ2l0LWNsb25lIFx1OTY4Rlx1NEVEM1x1NUU5M1x1NTQwQ1x1NkI2NVx1NzY4NFx1NjcwMFx1NjVCMCB3ZWJhcHAgXHU1MzczXHU2QjYzXHU3ODZFXHVGRjBDXHU2NUUwXHU5NzAwXHU4MDU0XHU3RjUxXHUzMDAyXG4gICAgICBpZiAoIShhd2FpdCB0aGlzLmZpbGVFeGlzdHMoYWRhcHRlciwgc3RhbXBQYXRoKSkpIHJldHVybjtcbiAgICAgIGNvbnN0IGxvY2FsID0gYXdhaXQgdGhpcy5yZWFkVmVyc2lvblN0YW1wKGFkYXB0ZXIsIHN0YW1wUGF0aCk7XG4gICAgICBpZiAobG9jYWwgPT09IHRoaXMudmVyc2lvbikgcmV0dXJuO1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBbQXBwSG9zdF0gXHU2NzJDXHU1NzMwIHdlYmFwcCBcdTcyNDhcdTY3MkMoJHtsb2NhbH0pIFx1NEUwRVx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQygke3RoaXMudmVyc2lvbn0pIFx1NEUwRFx1N0IyNlx1RkYwQ1x1OTFDRFx1NjVCMFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1MzAwMmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnZlcnNpb24pIHtcbiAgICAgIGNvbnNvbGUud2FybignW0FwcEhvc3RdIFx1NjVFMFx1NkNENVx1ODNCN1x1NTNENlx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1RkYwQ1x1OERGM1x1OEZDN1x1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1MzAwMlx1OEJGN1x1Nzg2RVx1OEJBNFx1NjNEMlx1NEVGNlx1NUI4OVx1ODhDNVx1NUI4Q1x1NjU3NFx1MzAwMicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLnJlcG99L3JlbGVhc2VzL2Rvd25sb2FkLyR7dGhpcy52ZXJzaW9ufS93ZWJhcHAuemlwYDtcbiAgICBjb25zb2xlLmxvZyhgW0FwcEhvc3RdIFx1NjcyQVx1NjhDMFx1NkQ0Qlx1NTIzMFx1NTMzOVx1OTE0RFx1NzY4NFx1NjcyQ1x1NTczMCB3ZWJhcHBcdUZGMENcdTVDMURcdThCRDVcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdUZGMUEke3VybH1gKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHJlcXVlc3RVcmwoeyB1cmwsIG1ldGhvZDogJ0dFVCcgfSk7XG4gICAgICBpZiAocmVzcC5zdGF0dXMgPCAyMDAgfHwgcmVzcC5zdGF0dXMgPj0gMzAwIHx8ICFyZXNwLmFycmF5QnVmZmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgXHU0RTBCXHU4RjdEXHU4RkQ0XHU1NkRFXHU1RjAyXHU1RTM4XHU3MkI2XHU2MDAxICR7cmVzcC5zdGF0dXN9YCk7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmV4dHJhY3RaaXAoYWRhcHRlciwgcmVzcC5hcnJheUJ1ZmZlcik7XG4gICAgICAvLyB3ZWJhcHAuemlwIFx1NURGMlx1NjQzQVx1NUUyNiAud2ViYXBwLXZlcnNpb25cdUZGMENcdTg5RTNcdTUzOEJcdTU0MEVcdTgxRUFcdTUyQThcdTg0M0RcdTc2RDhcdUZGMUJcdTZCNjRcdTU5MDRcdTUxNUNcdTVFOTVcdTUxOERcdTUxOTlcdTRFMDBcdTZCMjFcdUZGMENcbiAgICAgIC8vIFx1OTA3Rlx1NTE0RFx1NTQwQ1x1NzI0OFx1NjcyQ1x1NTNDRFx1NTkwRFx1OTFDRFx1NEUwQlx1MzAwMlxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYWRhcHRlci53cml0ZShzdGFtcFBhdGgsIHRoaXMudmVyc2lvbik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW0FwcEhvc3RdIFx1NTE5OVx1NTE2NSB3ZWJhcHAgXHU3MjQ4XHU2NzJDXHU2MjMzXHU1OTMxXHU4RDI1XHVGRjA4XHU0RTBEXHU1RjcxXHU1NENEXHU0RjdGXHU3NTI4XHVGRjA5XHVGRjFBJywgZSk7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygnW0FwcEhvc3RdIHdlYmFwcCBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTVFNzZcdTg5RTNcdTUzOEJcdTVCOENcdTYyMTBcdTMwMDInKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQXBwSG9zdF0gd2ViYXBwIFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1NTkzMVx1OEQyNVx1RkYxQScsIGUpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgXHU2NUUwXHU2Q0Q1XHU4MUVBXHU1MkE4XHU4M0I3XHU1M0Q2IHdlYmFwcFx1RkYwOCR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRid9XHVGRjA5XHUzMDAyYCArXG4gICAgICAgICdcdThCRjdcdTY4QzBcdTY3RTVcdTdGNTFcdTdFRENcdTU0MEVcdTkxQ0RcdThCRDVcdUZGMENcdTYyMTZcdTU3MjggT2JzaWRpYW4gXHU0RTJEXHU5MUNEXHU2NUIwXHU1Qjg5XHU4OEM1XHU2NzJDXHU2M0QyXHU0RUY2XHUzMDAyJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlYWRWZXJzaW9uU3RhbXAoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChhd2FpdCBhZGFwdGVyLnJlYWQoZmlsZVBhdGgpKS50cmltKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4dHJhY3RaaXAoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBmZmxhdGUgXHU5NkY2XHU0RjlEXHU4RDU2XHVGRjA4XHU2NUUwIHNldGltbWVkaWF0ZSBcdTRFNEJcdTdDN0JcdTRGMUFcdTUyQThcdTYwMDFcdTUyMUJcdTVFRkEgPHNjcmlwdD4gXHU3Njg0XHU0RjIwXHU5MDEyXHU0RjlEXHU4RDU2XHVGRjA5XHVGRjBDXG4gICAgLy8gXHU4RkQ0XHU1NkRFXHU3Njg0IGVudHJpZXMgXHU0RUM1XHU1NDJCXHU2NTg3XHU0RUY2XHVGRjA4XHU0RTBEXHU1NDJCXHU3NkVFXHU1RjU1XHU2NzYxXHU3NkVFXHVGRjA5XHVGRjBDXHU3NkVFXHU1RjU1XHU3NTMxIGVuc3VyZVBhcmVudERpciBcdTYzMDlcdTk3MDBcdTUyMUJcdTVFRkFcdTMwMDJcbiAgICBjb25zdCBmaWxlcyA9IHVuemlwU3luYyhuZXcgVWludDhBcnJheShidWZmZXIpKTtcbiAgICBmb3IgKGNvbnN0IFtyYXdQYXRoLCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhmaWxlcykpIHtcbiAgICAgIGNvbnN0IHJlbCA9IG5vcm1hbGl6ZVBhdGgocmF3UGF0aC5yZXBsYWNlKC9eXFwuP1xcLy8sICcnKSk7XG4gICAgICBpZiAoIXJlbCkgY29udGludWU7XG4gICAgICBjb25zdCB0YXJnZXQgPSBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS8ke3JlbH1gKTtcbiAgICAgIGF3YWl0IHRoaXMuZW5zdXJlUGFyZW50RGlyKGFkYXB0ZXIsIHRhcmdldCk7XG4gICAgICAvLyBVaW50OEFycmF5IFx1MjE5MiBcdTcyRUNcdTdBQ0IgQXJyYXlCdWZmZXJcdUZGMENcdTkwN0ZcdTUxNERcdTUxNzFcdTRFQUJcdTVFOTVcdTVDNDIgYnVmZmVyIFx1NUJGQ1x1ODFGNFx1OEQ4QVx1NzU0Q1xuICAgICAgYXdhaXQgYWRhcHRlci53cml0ZUJpbmFyeSh0YXJnZXQsIGNvbnRlbnQuc2xpY2UoKS5idWZmZXIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlUGFyZW50RGlyKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGFydHMgPSBmaWxlUGF0aC5zcGxpdCgnLycpO1xuICAgIGxldCBhY2MgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgYWNjICs9IChhY2MgPyAnLycgOiAnJykgKyBwYXJ0c1tpXTtcbiAgICAgIGlmIChhY2MgJiYgIShhd2FpdCB0aGlzLmZpbGVFeGlzdHMoYWRhcHRlciwgYWNjKSkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBhZGFwdGVyLm1rZGlyKGFjYyk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8vIFx1NTNFRlx1ODBGRFx1NURGMlx1ODhBQlx1NTE3Nlx1NEVENlx1Njc2MVx1NzZFRVx1NTE0OFx1ODg0Q1x1NTIxQlx1NUVGQVx1RkYwQ1x1NUZGRFx1NzU2NVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmaWxlRXhpc3RzKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGFkYXB0ZXIuZXhpc3RzKHBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB1cmwgb2YgdGhpcy5ibG9iVXJscykge1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIH1cbiAgICB0aGlzLmJsb2JVcmxzID0gW107XG4gIH1cbn1cbiIsICIvLyBERUZMQVRFIGlzIGEgY29tcGxleCBmb3JtYXQ7IHRvIHJlYWQgdGhpcyBjb2RlLCB5b3Ugc2hvdWxkIHByb2JhYmx5IGNoZWNrIHRoZSBSRkMgZmlyc3Q6XG4vLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMTk1MVxuLy8gWW91IG1heSBhbHNvIHdpc2ggdG8gdGFrZSBhIGxvb2sgYXQgdGhlIGd1aWRlIEkgbWFkZSBhYm91dCB0aGlzIHByb2dyYW06XG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8xMDFhcnJvd3ovMjUzZjMxZWI1YWJjM2Q5Mjc1YWI5NDMwMDNmZmVjYWRcbi8vIFNvbWUgb2YgdGhlIGZvbGxvd2luZyBjb2RlIGlzIHNpbWlsYXIgdG8gdGhhdCBvZiBVWklQLmpzOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3Bob3RvcGVhL1VaSVAuanNcbi8vIEhvd2V2ZXIsIHRoZSB2YXN0IG1ham9yaXR5IG9mIHRoZSBjb2RlYmFzZSBoYXMgZGl2ZXJnZWQgZnJvbSBVWklQLmpzIHRvIGluY3JlYXNlIHBlcmZvcm1hbmNlIGFuZCByZWR1Y2UgYnVuZGxlIHNpemUuXG4vLyBTb21ldGltZXMgMCB3aWxsIGFwcGVhciB3aGVyZSAtMSB3b3VsZCBiZSBtb3JlIGFwcHJvcHJpYXRlLiBUaGlzIGlzIGJlY2F1c2UgdXNpbmcgYSB1aW50XG4vLyBpcyBiZXR0ZXIgZm9yIG1lbW9yeSBpbiBtb3N0IGVuZ2luZXMgKEkgKnRoaW5rKikuXG52YXIgY2gyID0ge307XG52YXIgd2sgPSAoZnVuY3Rpb24gKGMsIGlkLCBtc2csIHRyYW5zZmVyLCBjYikge1xuICAgIHZhciB3ID0gbmV3IFdvcmtlcihjaDJbaWRdIHx8IChjaDJbaWRdID0gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbXG4gICAgICAgIGMgKyAnO2FkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGZ1bmN0aW9uKGUpe2U9ZS5lcnJvcjtwb3N0TWVzc2FnZSh7JGUkOltlLm1lc3NhZ2UsZS5jb2RlLGUuc3RhY2tdfSl9KSdcbiAgICBdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pKSkpO1xuICAgIHcub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGQgPSBlLmRhdGEsIGVkID0gZC4kZSQ7XG4gICAgICAgIGlmIChlZCkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihlZFswXSk7XG4gICAgICAgICAgICBlcnJbJ2NvZGUnXSA9IGVkWzFdO1xuICAgICAgICAgICAgZXJyLnN0YWNrID0gZWRbMl07XG4gICAgICAgICAgICBjYihlcnIsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNiKG51bGwsIGQpO1xuICAgIH07XG4gICAgdy5wb3N0TWVzc2FnZShtc2csIHRyYW5zZmVyKTtcbiAgICByZXR1cm4gdztcbn0pO1xuXG4vLyBhbGlhc2VzIGZvciBzaG9ydGVyIGNvbXByZXNzZWQgY29kZSAobW9zdCBtaW5pZmVycyBkb24ndCBkbyB0aGlzKVxudmFyIHU4ID0gVWludDhBcnJheSwgdTE2ID0gVWludDE2QXJyYXksIGkzMiA9IEludDMyQXJyYXk7XG4vLyBmaXhlZCBsZW5ndGggZXh0cmEgYml0c1xudmFyIGZsZWIgPSBuZXcgdTgoWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDEsIDIsIDIsIDIsIDIsIDMsIDMsIDMsIDMsIDQsIDQsIDQsIDQsIDUsIDUsIDUsIDUsIDAsIC8qIHVudXNlZCAqLyAwLCAwLCAvKiBpbXBvc3NpYmxlICovIDBdKTtcbi8vIGZpeGVkIGRpc3RhbmNlIGV4dHJhIGJpdHNcbnZhciBmZGViID0gbmV3IHU4KFswLCAwLCAwLCAwLCAxLCAxLCAyLCAyLCAzLCAzLCA0LCA0LCA1LCA1LCA2LCA2LCA3LCA3LCA4LCA4LCA5LCA5LCAxMCwgMTAsIDExLCAxMSwgMTIsIDEyLCAxMywgMTMsIC8qIHVudXNlZCAqLyAwLCAwXSk7XG4vLyBjb2RlIGxlbmd0aCBpbmRleCBtYXBcbnZhciBjbGltID0gbmV3IHU4KFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XSk7XG4vLyBnZXQgYmFzZSwgcmV2ZXJzZSBpbmRleCBtYXAgZnJvbSBleHRyYSBiaXRzXG52YXIgZnJlYiA9IGZ1bmN0aW9uIChlYiwgc3RhcnQpIHtcbiAgICB2YXIgYiA9IG5ldyB1MTYoMzEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzE7ICsraSkge1xuICAgICAgICBiW2ldID0gc3RhcnQgKz0gMSA8PCBlYltpIC0gMV07XG4gICAgfVxuICAgIC8vIG51bWJlcnMgaGVyZSBhcmUgYXQgbWF4IDE4IGJpdHNcbiAgICB2YXIgciA9IG5ldyBpMzIoYlszMF0pO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMzA7ICsraSkge1xuICAgICAgICBmb3IgKHZhciBqID0gYltpXTsgaiA8IGJbaSArIDFdOyArK2opIHtcbiAgICAgICAgICAgIHJbal0gPSAoKGogLSBiW2ldKSA8PCA1KSB8IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYjogYiwgcjogciB9O1xufTtcbnZhciBfYSA9IGZyZWIoZmxlYiwgMiksIGZsID0gX2EuYiwgcmV2ZmwgPSBfYS5yO1xuLy8gd2UgY2FuIGlnbm9yZSB0aGUgZmFjdCB0aGF0IHRoZSBvdGhlciBudW1iZXJzIGFyZSB3cm9uZzsgdGhleSBuZXZlciBoYXBwZW4gYW55d2F5XG5mbFsyOF0gPSAyNTgsIHJldmZsWzI1OF0gPSAyODtcbnZhciBfYiA9IGZyZWIoZmRlYiwgMCksIGZkID0gX2IuYiwgcmV2ZmQgPSBfYi5yO1xuLy8gbWFwIG9mIHZhbHVlIHRvIHJldmVyc2UgKGFzc3VtaW5nIDE2IGJpdHMpXG52YXIgcmV2ID0gbmV3IHUxNigzMjc2OCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyNzY4OyArK2kpIHtcbiAgICAvLyByZXZlcnNlIHRhYmxlIGFsZ29yaXRobSBmcm9tIFNPXG4gICAgdmFyIHggPSAoKGkgJiAweEFBQUEpID4+IDEpIHwgKChpICYgMHg1NTU1KSA8PCAxKTtcbiAgICB4ID0gKCh4ICYgMHhDQ0NDKSA+PiAyKSB8ICgoeCAmIDB4MzMzMykgPDwgMik7XG4gICAgeCA9ICgoeCAmIDB4RjBGMCkgPj4gNCkgfCAoKHggJiAweDBGMEYpIDw8IDQpO1xuICAgIHJldltpXSA9ICgoKHggJiAweEZGMDApID4+IDgpIHwgKCh4ICYgMHgwMEZGKSA8PCA4KSkgPj4gMTtcbn1cbi8vIGNyZWF0ZSBodWZmbWFuIHRyZWUgZnJvbSB1OCBcIm1hcFwiOiBpbmRleCAtPiBjb2RlIGxlbmd0aCBmb3IgY29kZSBpbmRleFxuLy8gbWIgKG1heCBiaXRzKSBtdXN0IGJlIGF0IG1vc3QgMTVcbi8vIFRPRE86IG9wdGltaXplL3NwbGl0IHVwP1xudmFyIGhNYXAgPSAoZnVuY3Rpb24gKGNkLCBtYiwgcikge1xuICAgIHZhciBzID0gY2QubGVuZ3RoO1xuICAgIC8vIGluZGV4XG4gICAgdmFyIGkgPSAwO1xuICAgIC8vIHUxNiBcIm1hcFwiOiBpbmRleCAtPiAjIG9mIGNvZGVzIHdpdGggYml0IGxlbmd0aCA9IGluZGV4XG4gICAgdmFyIGwgPSBuZXcgdTE2KG1iKTtcbiAgICAvLyBsZW5ndGggb2YgY2QgbXVzdCBiZSAyODggKHRvdGFsICMgb2YgY29kZXMpXG4gICAgZm9yICg7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgaWYgKGNkW2ldKVxuICAgICAgICAgICAgKytsW2NkW2ldIC0gMV07XG4gICAgfVxuICAgIC8vIHUxNiBcIm1hcFwiOiBpbmRleCAtPiBtaW5pbXVtIGNvZGUgZm9yIGJpdCBsZW5ndGggPSBpbmRleFxuICAgIHZhciBsZSA9IG5ldyB1MTYobWIpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBtYjsgKytpKSB7XG4gICAgICAgIGxlW2ldID0gKGxlW2kgLSAxXSArIGxbaSAtIDFdKSA8PCAxO1xuICAgIH1cbiAgICB2YXIgY287XG4gICAgaWYgKHIpIHtcbiAgICAgICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+IG51bWJlciBvZiBhY3R1YWwgYml0cywgc3ltYm9sIGZvciBjb2RlXG4gICAgICAgIGNvID0gbmV3IHUxNigxIDw8IG1iKTtcbiAgICAgICAgLy8gYml0cyB0byByZW1vdmUgZm9yIHJldmVyc2VyXG4gICAgICAgIHZhciBydmIgPSAxNSAtIG1iO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICAvLyBpZ25vcmUgMCBsZW5ndGhzXG4gICAgICAgICAgICBpZiAoY2RbaV0pIHtcbiAgICAgICAgICAgICAgICAvLyBudW0gZW5jb2RpbmcgYm90aCBzeW1ib2wgYW5kIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgIHZhciBzdiA9IChpIDw8IDQpIHwgY2RbaV07XG4gICAgICAgICAgICAgICAgLy8gZnJlZSBiaXRzXG4gICAgICAgICAgICAgICAgdmFyIHJfMSA9IG1iIC0gY2RbaV07XG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgdmFsdWVcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGxlW2NkW2ldIC0gMV0rKyA8PCByXzE7XG4gICAgICAgICAgICAgICAgLy8gbSBpcyBlbmQgdmFsdWVcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBtID0gdiB8ICgoMSA8PCByXzEpIC0gMSk7IHYgPD0gbTsgKyt2KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGV2ZXJ5IDE2IGJpdCB2YWx1ZSBzdGFydGluZyB3aXRoIHRoZSBjb2RlIHlpZWxkcyB0aGUgc2FtZSByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgY29bcmV2W3ZdID4+IHJ2Yl0gPSBzdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvID0gbmV3IHUxNihzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHM7ICsraSkge1xuICAgICAgICAgICAgaWYgKGNkW2ldKSB7XG4gICAgICAgICAgICAgICAgY29baV0gPSByZXZbbGVbY2RbaV0gLSAxXSsrXSA+PiAoMTUgLSBjZFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvO1xufSk7XG4vLyBmaXhlZCBsZW5ndGggdHJlZVxudmFyIGZsdCA9IG5ldyB1OCgyODgpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAxNDQ7ICsraSlcbiAgICBmbHRbaV0gPSA4O1xuZm9yICh2YXIgaSA9IDE0NDsgaSA8IDI1NjsgKytpKVxuICAgIGZsdFtpXSA9IDk7XG5mb3IgKHZhciBpID0gMjU2OyBpIDwgMjgwOyArK2kpXG4gICAgZmx0W2ldID0gNztcbmZvciAodmFyIGkgPSAyODA7IGkgPCAyODg7ICsraSlcbiAgICBmbHRbaV0gPSA4O1xuLy8gZml4ZWQgZGlzdGFuY2UgdHJlZVxudmFyIGZkdCA9IG5ldyB1OCgzMik7XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpXG4gICAgZmR0W2ldID0gNTtcbi8vIGZpeGVkIGxlbmd0aCBtYXBcbnZhciBmbG0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmx0LCA5LCAwKSwgZmxybSA9IC8qI19fUFVSRV9fKi8gaE1hcChmbHQsIDksIDEpO1xuLy8gZml4ZWQgZGlzdGFuY2UgbWFwXG52YXIgZmRtID0gLyojX19QVVJFX18qLyBoTWFwKGZkdCwgNSwgMCksIGZkcm0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmR0LCA1LCAxKTtcbi8vIGZpbmQgbWF4IG9mIGFycmF5XG52YXIgbWF4ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgbSA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChhW2ldID4gbSlcbiAgICAgICAgICAgIG0gPSBhW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn07XG4vLyByZWFkIGQsIHN0YXJ0aW5nIGF0IGJpdCBwIGFuZCBtYXNrIHdpdGggbVxudmFyIGJpdHMgPSBmdW5jdGlvbiAoZCwgcCwgbSkge1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgcmV0dXJuICgoZFtvXSB8IChkW28gKyAxXSA8PCA4KSkgPj4gKHAgJiA3KSkgJiBtO1xufTtcbi8vIHJlYWQgZCwgc3RhcnRpbmcgYXQgYml0IHAgY29udGludWluZyBmb3IgYXQgbGVhc3QgMTYgYml0c1xudmFyIGJpdHMxNiA9IGZ1bmN0aW9uIChkLCBwKSB7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICByZXR1cm4gKChkW29dIHwgKGRbbyArIDFdIDw8IDgpIHwgKGRbbyArIDJdIDw8IDE2KSkgPj4gKHAgJiA3KSk7XG59O1xuLy8gZ2V0IGVuZCBvZiBieXRlXG52YXIgc2hmdCA9IGZ1bmN0aW9uIChwKSB7IHJldHVybiAoKHAgKyA3KSAvIDgpIHwgMDsgfTtcbi8vIHR5cGVkIGFycmF5IHNsaWNlIC0gYWxsb3dzIGdhcmJhZ2UgY29sbGVjdG9yIHRvIGZyZWUgb3JpZ2luYWwgcmVmZXJlbmNlLFxuLy8gd2hpbGUgYmVpbmcgbW9yZSBjb21wYXRpYmxlIHRoYW4gLnNsaWNlXG52YXIgc2xjID0gZnVuY3Rpb24gKHYsIHMsIGUpIHtcbiAgICBpZiAocyA9PSBudWxsIHx8IHMgPCAwKVxuICAgICAgICBzID0gMDtcbiAgICBpZiAoZSA9PSBudWxsIHx8IGUgPiB2Lmxlbmd0aClcbiAgICAgICAgZSA9IHYubGVuZ3RoO1xuICAgIC8vIGNhbid0IHVzZSAuY29uc3RydWN0b3IgaW4gY2FzZSB1c2VyLXN1cHBsaWVkXG4gICAgcmV0dXJuIG5ldyB1OCh2LnN1YmFycmF5KHMsIGUpKTtcbn07XG4vKipcbiAqIENvZGVzIGZvciBlcnJvcnMgZ2VuZXJhdGVkIHdpdGhpbiB0aGlzIGxpYnJhcnlcbiAqL1xuZXhwb3J0IHZhciBGbGF0ZUVycm9yQ29kZSA9IHtcbiAgICBVbmV4cGVjdGVkRU9GOiAwLFxuICAgIEludmFsaWRCbG9ja1R5cGU6IDEsXG4gICAgSW52YWxpZExlbmd0aExpdGVyYWw6IDIsXG4gICAgSW52YWxpZERpc3RhbmNlOiAzLFxuICAgIFN0cmVhbUZpbmlzaGVkOiA0LFxuICAgIE5vU3RyZWFtSGFuZGxlcjogNSxcbiAgICBJbnZhbGlkSGVhZGVyOiA2LFxuICAgIE5vQ2FsbGJhY2s6IDcsXG4gICAgSW52YWxpZFVURjg6IDgsXG4gICAgRXh0cmFGaWVsZFRvb0xvbmc6IDksXG4gICAgSW52YWxpZERhdGU6IDEwLFxuICAgIEZpbGVuYW1lVG9vTG9uZzogMTEsXG4gICAgU3RyZWFtRmluaXNoaW5nOiAxMixcbiAgICBJbnZhbGlkWmlwRGF0YTogMTMsXG4gICAgVW5rbm93bkNvbXByZXNzaW9uTWV0aG9kOiAxNFxufTtcbi8vIGVycm9yIGNvZGVzXG52YXIgZWMgPSBbXG4gICAgJ3VuZXhwZWN0ZWQgRU9GJyxcbiAgICAnaW52YWxpZCBibG9jayB0eXBlJyxcbiAgICAnaW52YWxpZCBsZW5ndGgvbGl0ZXJhbCcsXG4gICAgJ2ludmFsaWQgZGlzdGFuY2UnLFxuICAgICdzdHJlYW0gZmluaXNoZWQnLFxuICAgICdubyBzdHJlYW0gaGFuZGxlcicsXG4gICAgLCAvLyBkZXRlcm1pbmVkIGJ5IGNvbXByZXNzaW9uIGZ1bmN0aW9uXG4gICAgJ25vIGNhbGxiYWNrJyxcbiAgICAnaW52YWxpZCBVVEYtOCBkYXRhJyxcbiAgICAnZXh0cmEgZmllbGQgdG9vIGxvbmcnLFxuICAgICdkYXRlIG5vdCBpbiByYW5nZSAxOTgwLTIwOTknLFxuICAgICdmaWxlbmFtZSB0b28gbG9uZycsXG4gICAgJ3N0cmVhbSBmaW5pc2hpbmcnLFxuICAgICdpbnZhbGlkIHppcCBkYXRhJ1xuICAgIC8vIGRldGVybWluZWQgYnkgdW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Rcbl07XG47XG52YXIgZXJyID0gZnVuY3Rpb24gKGluZCwgbXNnLCBudCkge1xuICAgIHZhciBlID0gbmV3IEVycm9yKG1zZyB8fCBlY1tpbmRdKTtcbiAgICBlLmNvZGUgPSBpbmQ7XG4gICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKVxuICAgICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlLCBlcnIpO1xuICAgIGlmICghbnQpXG4gICAgICAgIHRocm93IGU7XG4gICAgcmV0dXJuIGU7XG59O1xuLy8gZXhwYW5kcyByYXcgREVGTEFURSBkYXRhXG52YXIgaW5mbHQgPSBmdW5jdGlvbiAoZGF0LCBzdCwgYnVmLCBkaWN0KSB7XG4gICAgLy8gc291cmNlIGxlbmd0aCAgICAgICBkaWN0IGxlbmd0aFxuICAgIHZhciBzbCA9IGRhdC5sZW5ndGgsIGRsID0gZGljdCA/IGRpY3QubGVuZ3RoIDogMDtcbiAgICBpZiAoIXNsIHx8IHN0LmYgJiYgIXN0LmwpXG4gICAgICAgIHJldHVybiBidWYgfHwgbmV3IHU4KDApO1xuICAgIHZhciBub0J1ZiA9ICFidWY7XG4gICAgLy8gaGF2ZSB0byBlc3RpbWF0ZSBzaXplXG4gICAgdmFyIHJlc2l6ZSA9IG5vQnVmIHx8IHN0LmkgIT0gMjtcbiAgICAvLyBubyBzdGF0ZVxuICAgIHZhciBub1N0ID0gc3QuaTtcbiAgICAvLyBBc3N1bWVzIHJvdWdobHkgMzMlIGNvbXByZXNzaW9uIHJhdGlvIGF2ZXJhZ2VcbiAgICBpZiAobm9CdWYpXG4gICAgICAgIGJ1ZiA9IG5ldyB1OChzbCAqIDMpO1xuICAgIC8vIGVuc3VyZSBidWZmZXIgY2FuIGZpdCBhdCBsZWFzdCBsIGVsZW1lbnRzXG4gICAgdmFyIGNidWYgPSBmdW5jdGlvbiAobCkge1xuICAgICAgICB2YXIgYmwgPSBidWYubGVuZ3RoO1xuICAgICAgICAvLyBuZWVkIHRvIGluY3JlYXNlIHNpemUgdG8gZml0XG4gICAgICAgIGlmIChsID4gYmwpIHtcbiAgICAgICAgICAgIC8vIERvdWJsZSBvciBzZXQgdG8gbmVjZXNzYXJ5LCB3aGljaGV2ZXIgaXMgZ3JlYXRlclxuICAgICAgICAgICAgdmFyIG5idWYgPSBuZXcgdTgoTWF0aC5tYXgoYmwgKiAyLCBsKSk7XG4gICAgICAgICAgICBuYnVmLnNldChidWYpO1xuICAgICAgICAgICAgYnVmID0gbmJ1ZjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gIGxhc3QgY2h1bmsgICAgICAgICBiaXRwb3MgICAgICAgICAgIGJ5dGVzXG4gICAgdmFyIGZpbmFsID0gc3QuZiB8fCAwLCBwb3MgPSBzdC5wIHx8IDAsIGJ0ID0gc3QuYiB8fCAwLCBsbSA9IHN0LmwsIGRtID0gc3QuZCwgbGJ0ID0gc3QubSwgZGJ0ID0gc3QubjtcbiAgICAvLyB0b3RhbCBiaXRzXG4gICAgdmFyIHRidHMgPSBzbCAqIDg7XG4gICAgZG8ge1xuICAgICAgICBpZiAoIWxtKSB7XG4gICAgICAgICAgICAvLyBCRklOQUwgLSB0aGlzIGlzIG9ubHkgMSB3aGVuIGxhc3QgY2h1bmsgaXMgbmV4dFxuICAgICAgICAgICAgZmluYWwgPSBiaXRzKGRhdCwgcG9zLCAxKTtcbiAgICAgICAgICAgIC8vIHR5cGU6IDAgPSBubyBjb21wcmVzc2lvbiwgMSA9IGZpeGVkIGh1ZmZtYW4sIDIgPSBkeW5hbWljIGh1ZmZtYW5cbiAgICAgICAgICAgIHZhciB0eXBlID0gYml0cyhkYXQsIHBvcyArIDEsIDMpO1xuICAgICAgICAgICAgcG9zICs9IDM7XG4gICAgICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBnbyB0byBlbmQgb2YgYnl0ZSBib3VuZGFyeVxuICAgICAgICAgICAgICAgIHZhciBzID0gc2hmdChwb3MpICsgNCwgbCA9IGRhdFtzIC0gNF0gfCAoZGF0W3MgLSAzXSA8PCA4KSwgdCA9IHMgKyBsO1xuICAgICAgICAgICAgICAgIGlmICh0ID4gc2wpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgc2l6ZVxuICAgICAgICAgICAgICAgIGlmIChyZXNpemUpXG4gICAgICAgICAgICAgICAgICAgIGNidWYoYnQgKyBsKTtcbiAgICAgICAgICAgICAgICAvLyBDb3B5IG92ZXIgdW5jb21wcmVzc2VkIGRhdGFcbiAgICAgICAgICAgICAgICBidWYuc2V0KGRhdC5zdWJhcnJheShzLCB0KSwgYnQpO1xuICAgICAgICAgICAgICAgIC8vIEdldCBuZXcgYml0cG9zLCB1cGRhdGUgYnl0ZSBjb3VudFxuICAgICAgICAgICAgICAgIHN0LmIgPSBidCArPSBsLCBzdC5wID0gcG9zID0gdCAqIDgsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMSlcbiAgICAgICAgICAgICAgICBsbSA9IGZscm0sIGRtID0gZmRybSwgbGJ0ID0gOSwgZGJ0ID0gNTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICBsaXRlcmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aHNcbiAgICAgICAgICAgICAgICB2YXIgaExpdCA9IGJpdHMoZGF0LCBwb3MsIDMxKSArIDI1NywgaGNMZW4gPSBiaXRzKGRhdCwgcG9zICsgMTAsIDE1KSArIDQ7XG4gICAgICAgICAgICAgICAgdmFyIHRsID0gaExpdCArIGJpdHMoZGF0LCBwb3MgKyA1LCAzMSkgKyAxO1xuICAgICAgICAgICAgICAgIHBvcyArPSAxNDtcbiAgICAgICAgICAgICAgICAvLyBsZW5ndGgrZGlzdGFuY2UgdHJlZVxuICAgICAgICAgICAgICAgIHZhciBsZHQgPSBuZXcgdTgodGwpO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgY2x0ID0gbmV3IHU4KDE5KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhjTGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIGluZGV4IG1hcCB0byBnZXQgcmVhbCBjb2RlXG4gICAgICAgICAgICAgICAgICAgIGNsdFtjbGltW2ldXSA9IGJpdHMoZGF0LCBwb3MgKyBpICogMywgNyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBvcyArPSBoY0xlbiAqIDM7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGhzIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgY2xiID0gbWF4KGNsdCksIGNsYm1zayA9ICgxIDw8IGNsYikgLSAxO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RocyBtYXBcbiAgICAgICAgICAgICAgICB2YXIgY2xtID0gaE1hcChjbHQsIGNsYiwgMSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0bDspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjbG1bYml0cyhkYXQsIHBvcywgY2xibXNrKV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gciAmIDE1O1xuICAgICAgICAgICAgICAgICAgICAvLyBzeW1ib2xcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByID4+IDQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRvIGNvcHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMgPCAxNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGR0W2krK10gPSBzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGNvcHkgICBjb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSAwLCBuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzID09IDE2KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAzICsgYml0cyhkYXQsIHBvcywgMyksIHBvcyArPSAyLCBjID0gbGR0W2kgLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMgPT0gMTcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDMgKyBiaXRzKGRhdCwgcG9zLCA3KSwgcG9zICs9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzID09IDE4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAxMSArIGJpdHMoZGF0LCBwb3MsIDEyNyksIHBvcyArPSA3O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG4tLSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZHRbaSsrXSA9IGM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICAgbGVuZ3RoIHRyZWUgICAgICAgICAgICAgICAgIGRpc3RhbmNlIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgbHQgPSBsZHQuc3ViYXJyYXkoMCwgaExpdCksIGR0ID0gbGR0LnN1YmFycmF5KGhMaXQpO1xuICAgICAgICAgICAgICAgIC8vIG1heCBsZW5ndGggYml0c1xuICAgICAgICAgICAgICAgIGxidCA9IG1heChsdCk7XG4gICAgICAgICAgICAgICAgLy8gbWF4IGRpc3QgYml0c1xuICAgICAgICAgICAgICAgIGRidCA9IG1heChkdCk7XG4gICAgICAgICAgICAgICAgbG0gPSBoTWFwKGx0LCBsYnQsIDEpO1xuICAgICAgICAgICAgICAgIGRtID0gaE1hcChkdCwgZGJ0LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlcnIoMSk7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBidWZmZXIgY2FuIGhvbGQgdGhpcyArIHRoZSBsYXJnZXN0IHBvc3NpYmxlIGFkZGl0aW9uXG4gICAgICAgIC8vIE1heGltdW0gY2h1bmsgc2l6ZSAocHJhY3RpY2FsbHksIHRoZW9yZXRpY2FsbHkgaW5maW5pdGUpIGlzIDJeMTdcbiAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgIGNidWYoYnQgKyAxMzEwNzIpO1xuICAgICAgICB2YXIgbG1zID0gKDEgPDwgbGJ0KSAtIDEsIGRtcyA9ICgxIDw8IGRidCkgLSAxO1xuICAgICAgICB2YXIgbHBvcyA9IHBvcztcbiAgICAgICAgZm9yICg7OyBscG9zID0gcG9zKSB7XG4gICAgICAgICAgICAvLyBiaXRzIHJlYWQsIGNvZGVcbiAgICAgICAgICAgIHZhciBjID0gbG1bYml0czE2KGRhdCwgcG9zKSAmIGxtc10sIHN5bSA9IGMgPj4gNDtcbiAgICAgICAgICAgIHBvcyArPSBjICYgMTU7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWMpXG4gICAgICAgICAgICAgICAgZXJyKDIpO1xuICAgICAgICAgICAgaWYgKHN5bSA8IDI1NilcbiAgICAgICAgICAgICAgICBidWZbYnQrK10gPSBzeW07XG4gICAgICAgICAgICBlbHNlIGlmIChzeW0gPT0gMjU2KSB7XG4gICAgICAgICAgICAgICAgbHBvcyA9IHBvcywgbG0gPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGFkZCA9IHN5bSAtIDI1NDtcbiAgICAgICAgICAgICAgICAvLyBubyBleHRyYSBiaXRzIG5lZWRlZCBpZiBsZXNzXG4gICAgICAgICAgICAgICAgaWYgKHN5bSA+IDI2NCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmRleFxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IHN5bSAtIDI1NywgYiA9IGZsZWJbaV07XG4gICAgICAgICAgICAgICAgICAgIGFkZCA9IGJpdHMoZGF0LCBwb3MsICgxIDw8IGIpIC0gMSkgKyBmbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRpc3RcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRtW2JpdHMxNihkYXQsIHBvcykgJiBkbXNdLCBkc3ltID0gZCA+PiA0O1xuICAgICAgICAgICAgICAgIGlmICghZClcbiAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgIHBvcyArPSBkICYgMTU7XG4gICAgICAgICAgICAgICAgdmFyIGR0ID0gZmRbZHN5bV07XG4gICAgICAgICAgICAgICAgaWYgKGRzeW0gPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiID0gZmRlYltkc3ltXTtcbiAgICAgICAgICAgICAgICAgICAgZHQgKz0gYml0czE2KGRhdCwgcG9zKSAmICgxIDw8IGIpIC0gMSwgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIDEzMTA3Mik7XG4gICAgICAgICAgICAgICAgdmFyIGVuZCA9IGJ0ICsgYWRkO1xuICAgICAgICAgICAgICAgIGlmIChidCA8IGR0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGlmdCA9IGRsIC0gZHQsIGRlbmQgPSBNYXRoLm1pbihkdCwgZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoaWZ0ICsgYnQgPCAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgYnQgPCBkZW5kOyArK2J0KVxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGRpY3Rbc2hpZnQgKyBidF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoOyBidCA8IGVuZDsgKytidClcbiAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGJ1ZltidCAtIGR0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdC5sID0gbG0sIHN0LnAgPSBscG9zLCBzdC5iID0gYnQsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgaWYgKGxtKVxuICAgICAgICAgICAgZmluYWwgPSAxLCBzdC5tID0gbGJ0LCBzdC5kID0gZG0sIHN0Lm4gPSBkYnQ7XG4gICAgfSB3aGlsZSAoIWZpbmFsKTtcbiAgICAvLyBkb24ndCByZWFsbG9jYXRlIGZvciBzdHJlYW1zIG9yIHVzZXIgYnVmZmVyc1xuICAgIHJldHVybiBidCAhPSBidWYubGVuZ3RoICYmIG5vQnVmID8gc2xjKGJ1ZiwgMCwgYnQpIDogYnVmLnN1YmFycmF5KDAsIGJ0KTtcbn07XG4vLyBzdGFydGluZyBhdCBwLCB3cml0ZSB0aGUgbWluaW11bSBudW1iZXIgb2YgYml0cyB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzID0gZnVuY3Rpb24gKGQsIHAsIHYpIHtcbiAgICB2IDw8PSBwICYgNztcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIGRbb10gfD0gdjtcbiAgICBkW28gKyAxXSB8PSB2ID4+IDg7XG59O1xuLy8gc3RhcnRpbmcgYXQgcCwgd3JpdGUgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGJpdHMgKD44KSB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzMTYgPSBmdW5jdGlvbiAoZCwgcCwgdikge1xuICAgIHYgPDw9IHAgJiA3O1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgZFtvXSB8PSB2O1xuICAgIGRbbyArIDFdIHw9IHYgPj4gODtcbiAgICBkW28gKyAyXSB8PSB2ID4+IDE2O1xufTtcbi8vIGNyZWF0ZXMgY29kZSBsZW5ndGhzIGZyb20gYSBmcmVxdWVuY3kgdGFibGVcbnZhciBoVHJlZSA9IGZ1bmN0aW9uIChkLCBtYikge1xuICAgIC8vIE5lZWQgZXh0cmEgaW5mbyB0byBtYWtlIGEgdHJlZVxuICAgIHZhciB0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChkW2ldKVxuICAgICAgICAgICAgdC5wdXNoKHsgczogaSwgZjogZFtpXSB9KTtcbiAgICB9XG4gICAgdmFyIHMgPSB0Lmxlbmd0aDtcbiAgICB2YXIgdDIgPSB0LnNsaWNlKCk7XG4gICAgaWYgKCFzKVxuICAgICAgICByZXR1cm4geyB0OiBldCwgbDogMCB9O1xuICAgIGlmIChzID09IDEpIHtcbiAgICAgICAgdmFyIHYgPSBuZXcgdTgodFswXS5zICsgMSk7XG4gICAgICAgIHZbdFswXS5zXSA9IDE7XG4gICAgICAgIHJldHVybiB7IHQ6IHYsIGw6IDEgfTtcbiAgICB9XG4gICAgdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmYgLSBiLmY7IH0pO1xuICAgIC8vIGFmdGVyIGkyIHJlYWNoZXMgbGFzdCBpbmQsIHdpbGwgYmUgc3RvcHBlZFxuICAgIC8vIGZyZXEgbXVzdCBiZSBncmVhdGVyIHRoYW4gbGFyZ2VzdCBwb3NzaWJsZSBudW1iZXIgb2Ygc3ltYm9sc1xuICAgIHQucHVzaCh7IHM6IC0xLCBmOiAyNTAwMSB9KTtcbiAgICB2YXIgbCA9IHRbMF0sIHIgPSB0WzFdLCBpMCA9IDAsIGkxID0gMSwgaTIgPSAyO1xuICAgIHRbMF0gPSB7IHM6IC0xLCBmOiBsLmYgKyByLmYsIGw6IGwsIHI6IHIgfTtcbiAgICAvLyBlZmZpY2llbnQgYWxnb3JpdGhtIGZyb20gVVpJUC5qc1xuICAgIC8vIGkwIGlzIGxvb2tiZWhpbmQsIGkyIGlzIGxvb2thaGVhZCAtIGFmdGVyIHByb2Nlc3NpbmcgdHdvIGxvdy1mcmVxXG4gICAgLy8gc3ltYm9scyB0aGF0IGNvbWJpbmVkIGhhdmUgaGlnaCBmcmVxLCB3aWxsIHN0YXJ0IHByb2Nlc3NpbmcgaTIgKGhpZ2gtZnJlcSxcbiAgICAvLyBub24tY29tcG9zaXRlKSBzeW1ib2xzIGluc3RlYWRcbiAgICAvLyBzZWUgaHR0cHM6Ly9yZWRkaXQuY29tL3IvcGhvdG9wZWEvY29tbWVudHMvaWtla2h0L3V6aXBqc19xdWVzdGlvbnMvXG4gICAgd2hpbGUgKGkxICE9IHMgLSAxKSB7XG4gICAgICAgIGwgPSB0W3RbaTBdLmYgPCB0W2kyXS5mID8gaTArKyA6IGkyKytdO1xuICAgICAgICByID0gdFtpMCAhPSBpMSAmJiB0W2kwXS5mIDwgdFtpMl0uZiA/IGkwKysgOiBpMisrXTtcbiAgICAgICAgdFtpMSsrXSA9IHsgczogLTEsIGY6IGwuZiArIHIuZiwgbDogbCwgcjogciB9O1xuICAgIH1cbiAgICB2YXIgbWF4U3ltID0gdDJbMF0ucztcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAodDJbaV0ucyA+IG1heFN5bSlcbiAgICAgICAgICAgIG1heFN5bSA9IHQyW2ldLnM7XG4gICAgfVxuICAgIC8vIGNvZGUgbGVuZ3Roc1xuICAgIHZhciB0ciA9IG5ldyB1MTYobWF4U3ltICsgMSk7XG4gICAgLy8gbWF4IGJpdHMgaW4gdHJlZVxuICAgIHZhciBtYnQgPSBsbih0W2kxIC0gMV0sIHRyLCAwKTtcbiAgICBpZiAobWJ0ID4gbWIpIHtcbiAgICAgICAgLy8gbW9yZSBhbGdvcml0aG1zIGZyb20gVVpJUC5qc1xuICAgICAgICAvLyBUT0RPOiBmaW5kIG91dCBob3cgdGhpcyBjb2RlIHdvcmtzIChkZWJ0KVxuICAgICAgICAvLyAgaW5kICAgIGRlYnRcbiAgICAgICAgdmFyIGkgPSAwLCBkdCA9IDA7XG4gICAgICAgIC8vICAgIGxlZnQgICAgICAgICAgICBjb3N0XG4gICAgICAgIHZhciBsZnQgPSBtYnQgLSBtYiwgY3N0ID0gMSA8PCBsZnQ7XG4gICAgICAgIHQyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIHRyW2Iuc10gLSB0clthLnNdIHx8IGEuZiAtIGIuZjsgfSk7XG4gICAgICAgIGZvciAoOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICB2YXIgaTJfMSA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfMV0gPiBtYikge1xuICAgICAgICAgICAgICAgIGR0ICs9IGNzdCAtICgxIDw8IChtYnQgLSB0cltpMl8xXSkpO1xuICAgICAgICAgICAgICAgIHRyW2kyXzFdID0gbWI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZHQgPj49IGxmdDtcbiAgICAgICAgd2hpbGUgKGR0ID4gMCkge1xuICAgICAgICAgICAgdmFyIGkyXzIgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzJdIDwgbWIpXG4gICAgICAgICAgICAgICAgZHQgLT0gMSA8PCAobWIgLSB0cltpMl8yXSsrIC0gMSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgKytpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoOyBpID49IDAgJiYgZHQ7IC0taSkge1xuICAgICAgICAgICAgdmFyIGkyXzMgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzNdID09IG1iKSB7XG4gICAgICAgICAgICAgICAgLS10cltpMl8zXTtcbiAgICAgICAgICAgICAgICArK2R0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1idCA9IG1iO1xuICAgIH1cbiAgICByZXR1cm4geyB0OiBuZXcgdTgodHIpLCBsOiBtYnQgfTtcbn07XG4vLyBnZXQgdGhlIG1heCBsZW5ndGggYW5kIGFzc2lnbiBsZW5ndGggY29kZXNcbnZhciBsbiA9IGZ1bmN0aW9uIChuLCBsLCBkKSB7XG4gICAgcmV0dXJuIG4ucyA9PSAtMVxuICAgICAgICA/IE1hdGgubWF4KGxuKG4ubCwgbCwgZCArIDEpLCBsbihuLnIsIGwsIGQgKyAxKSlcbiAgICAgICAgOiAobFtuLnNdID0gZCk7XG59O1xuLy8gbGVuZ3RoIGNvZGVzIGdlbmVyYXRpb25cbnZhciBsYyA9IGZ1bmN0aW9uIChjKSB7XG4gICAgdmFyIHMgPSBjLmxlbmd0aDtcbiAgICAvLyBOb3RlIHRoYXQgdGhlIHNlbWljb2xvbiB3YXMgaW50ZW50aW9uYWxcbiAgICB3aGlsZSAocyAmJiAhY1stLXNdKVxuICAgICAgICA7XG4gICAgdmFyIGNsID0gbmV3IHUxNigrK3MpO1xuICAgIC8vICBpbmQgICAgICBudW0gICAgICAgICBzdHJlYWtcbiAgICB2YXIgY2xpID0gMCwgY2xuID0gY1swXSwgY2xzID0gMTtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICh2KSB7IGNsW2NsaSsrXSA9IHY7IH07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gczsgKytpKSB7XG4gICAgICAgIGlmIChjW2ldID09IGNsbiAmJiBpICE9IHMpXG4gICAgICAgICAgICArK2NscztcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWNsbiAmJiBjbHMgPiAyKSB7XG4gICAgICAgICAgICAgICAgZm9yICg7IGNscyA+IDEzODsgY2xzIC09IDEzOClcbiAgICAgICAgICAgICAgICAgICAgdygzMjc1NCk7XG4gICAgICAgICAgICAgICAgaWYgKGNscyA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdyhjbHMgPiAxMCA/ICgoY2xzIC0gMTEpIDw8IDUpIHwgMjg2OTAgOiAoKGNscyAtIDMpIDw8IDUpIHwgMTIzMDUpO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNscyA+IDMpIHtcbiAgICAgICAgICAgICAgICB3KGNsbiksIC0tY2xzO1xuICAgICAgICAgICAgICAgIGZvciAoOyBjbHMgPiA2OyBjbHMgLT0gNilcbiAgICAgICAgICAgICAgICAgICAgdyg4MzA0KTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzID4gMilcbiAgICAgICAgICAgICAgICAgICAgdygoKGNscyAtIDMpIDw8IDUpIHwgODIwOCksIGNscyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY2xzLS0pXG4gICAgICAgICAgICAgICAgdyhjbG4pO1xuICAgICAgICAgICAgY2xzID0gMTtcbiAgICAgICAgICAgIGNsbiA9IGNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYzogY2wuc3ViYXJyYXkoMCwgY2xpKSwgbjogcyB9O1xufTtcbi8vIGNhbGN1bGF0ZSB0aGUgbGVuZ3RoIG9mIG91dHB1dCBmcm9tIHRyZWUsIGNvZGUgbGVuZ3Roc1xudmFyIGNsZW4gPSBmdW5jdGlvbiAoY2YsIGNsKSB7XG4gICAgdmFyIGwgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2wubGVuZ3RoOyArK2kpXG4gICAgICAgIGwgKz0gY2ZbaV0gKiBjbFtpXTtcbiAgICByZXR1cm4gbDtcbn07XG4vLyB3cml0ZXMgYSBmaXhlZCBibG9ja1xuLy8gcmV0dXJucyB0aGUgbmV3IGJpdCBwb3NcbnZhciB3ZmJsayA9IGZ1bmN0aW9uIChvdXQsIHBvcywgZGF0KSB7XG4gICAgLy8gbm8gbmVlZCB0byB3cml0ZSAwMCBhcyB0eXBlOiBUeXBlZEFycmF5IGRlZmF1bHRzIHRvIDBcbiAgICB2YXIgcyA9IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBzaGZ0KHBvcyArIDIpO1xuICAgIG91dFtvXSA9IHMgJiAyNTU7XG4gICAgb3V0W28gKyAxXSA9IHMgPj4gODtcbiAgICBvdXRbbyArIDJdID0gb3V0W29dIF4gMjU1O1xuICAgIG91dFtvICsgM10gPSBvdXRbbyArIDFdIF4gMjU1O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgKytpKVxuICAgICAgICBvdXRbbyArIGkgKyA0XSA9IGRhdFtpXTtcbiAgICByZXR1cm4gKG8gKyA0ICsgcykgKiA4O1xufTtcbi8vIHdyaXRlcyBhIGJsb2NrXG52YXIgd2JsayA9IGZ1bmN0aW9uIChkYXQsIG91dCwgZmluYWwsIHN5bXMsIGxmLCBkZiwgZWIsIGxpLCBicywgYmwsIHApIHtcbiAgICB3Yml0cyhvdXQsIHArKywgZmluYWwpO1xuICAgICsrbGZbMjU2XTtcbiAgICB2YXIgX2EgPSBoVHJlZShsZiwgMTUpLCBkbHQgPSBfYS50LCBtbGIgPSBfYS5sO1xuICAgIHZhciBfYiA9IGhUcmVlKGRmLCAxNSksIGRkdCA9IF9iLnQsIG1kYiA9IF9iLmw7XG4gICAgdmFyIF9jID0gbGMoZGx0KSwgbGNsdCA9IF9jLmMsIG5sYyA9IF9jLm47XG4gICAgdmFyIF9kID0gbGMoZGR0KSwgbGNkdCA9IF9kLmMsIG5kYyA9IF9kLm47XG4gICAgdmFyIGxjZnJlcSA9IG5ldyB1MTYoMTkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGNsdC5sZW5ndGg7ICsraSlcbiAgICAgICAgKytsY2ZyZXFbbGNsdFtpXSAmIDMxXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxjZHQubGVuZ3RoOyArK2kpXG4gICAgICAgICsrbGNmcmVxW2xjZHRbaV0gJiAzMV07XG4gICAgdmFyIF9lID0gaFRyZWUobGNmcmVxLCA3KSwgbGN0ID0gX2UudCwgbWxjYiA9IF9lLmw7XG4gICAgdmFyIG5sY2MgPSAxOTtcbiAgICBmb3IgKDsgbmxjYyA+IDQgJiYgIWxjdFtjbGltW25sY2MgLSAxXV07IC0tbmxjYylcbiAgICAgICAgO1xuICAgIHZhciBmbGVuID0gKGJsICsgNSkgPDwgMztcbiAgICB2YXIgZnRsZW4gPSBjbGVuKGxmLCBmbHQpICsgY2xlbihkZiwgZmR0KSArIGViO1xuICAgIHZhciBkdGxlbiA9IGNsZW4obGYsIGRsdCkgKyBjbGVuKGRmLCBkZHQpICsgZWIgKyAxNCArIDMgKiBubGNjICsgY2xlbihsY2ZyZXEsIGxjdCkgKyAyICogbGNmcmVxWzE2XSArIDMgKiBsY2ZyZXFbMTddICsgNyAqIGxjZnJlcVsxOF07XG4gICAgaWYgKGJzID49IDAgJiYgZmxlbiA8PSBmdGxlbiAmJiBmbGVuIDw9IGR0bGVuKVxuICAgICAgICByZXR1cm4gd2ZibGsob3V0LCBwLCBkYXQuc3ViYXJyYXkoYnMsIGJzICsgYmwpKTtcbiAgICB2YXIgbG0sIGxsLCBkbSwgZGw7XG4gICAgd2JpdHMob3V0LCBwLCAxICsgKGR0bGVuIDwgZnRsZW4pKSwgcCArPSAyO1xuICAgIGlmIChkdGxlbiA8IGZ0bGVuKSB7XG4gICAgICAgIGxtID0gaE1hcChkbHQsIG1sYiwgMCksIGxsID0gZGx0LCBkbSA9IGhNYXAoZGR0LCBtZGIsIDApLCBkbCA9IGRkdDtcbiAgICAgICAgdmFyIGxsbSA9IGhNYXAobGN0LCBtbGNiLCAwKTtcbiAgICAgICAgd2JpdHMob3V0LCBwLCBubGMgLSAyNTcpO1xuICAgICAgICB3Yml0cyhvdXQsIHAgKyA1LCBuZGMgLSAxKTtcbiAgICAgICAgd2JpdHMob3V0LCBwICsgMTAsIG5sY2MgLSA0KTtcbiAgICAgICAgcCArPSAxNDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBubGNjOyArK2kpXG4gICAgICAgICAgICB3Yml0cyhvdXQsIHAgKyAzICogaSwgbGN0W2NsaW1baV1dKTtcbiAgICAgICAgcCArPSAzICogbmxjYztcbiAgICAgICAgdmFyIGxjdHMgPSBbbGNsdCwgbGNkdF07XG4gICAgICAgIGZvciAodmFyIGl0ID0gMDsgaXQgPCAyOyArK2l0KSB7XG4gICAgICAgICAgICB2YXIgY2xjdCA9IGxjdHNbaXRdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IGNsY3RbaV0gJiAzMTtcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIGxsbVtsZW5dKSwgcCArPSBsY3RbbGVuXTtcbiAgICAgICAgICAgICAgICBpZiAobGVuID4gMTUpXG4gICAgICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgKGNsY3RbaV0gPj4gNSkgJiAxMjcpLCBwICs9IGNsY3RbaV0gPj4gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxtID0gZmxtLCBsbCA9IGZsdCwgZG0gPSBmZG0sIGRsID0gZmR0O1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpOyArK2kpIHtcbiAgICAgICAgdmFyIHN5bSA9IHN5bXNbaV07XG4gICAgICAgIGlmIChzeW0gPiAyNTUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSAoc3ltID4+IDE4KSAmIDMxO1xuICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIGxtW2xlbiArIDI1N10pLCBwICs9IGxsW2xlbiArIDI1N107XG4gICAgICAgICAgICBpZiAobGVuID4gNylcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIChzeW0gPj4gMjMpICYgMzEpLCBwICs9IGZsZWJbbGVuXTtcbiAgICAgICAgICAgIHZhciBkc3QgPSBzeW0gJiAzMTtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBkbVtkc3RdKSwgcCArPSBkbFtkc3RdO1xuICAgICAgICAgICAgaWYgKGRzdCA+IDMpXG4gICAgICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIChzeW0gPj4gNSkgJiA4MTkxKSwgcCArPSBmZGViW2RzdF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgbG1bc3ltXSksIHAgKz0gbGxbc3ltXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3Yml0czE2KG91dCwgcCwgbG1bMjU2XSk7XG4gICAgcmV0dXJuIHAgKyBsbFsyNTZdO1xufTtcbi8vIGRlZmxhdGUgb3B0aW9ucyAobmljZSA8PCAxMykgfCBjaGFpblxudmFyIGRlbyA9IC8qI19fUFVSRV9fKi8gbmV3IGkzMihbNjU1NDAsIDEzMTA4MCwgMTMxMDg4LCAxMzExMDQsIDI2MjE3NiwgMTA0ODcwNCwgMTA0ODgzMiwgMjExNDU2MCwgMjExNzYzMl0pO1xuLy8gZW1wdHlcbnZhciBldCA9IC8qI19fUFVSRV9fKi8gbmV3IHU4KDApO1xuLy8gY29tcHJlc3NlcyBkYXRhIGludG8gYSByYXcgREVGTEFURSBidWZmZXJcbnZhciBkZmx0ID0gZnVuY3Rpb24gKGRhdCwgbHZsLCBwbHZsLCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgdmFyIHMgPSBzdC56IHx8IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBuZXcgdTgocHJlICsgcyArIDUgKiAoMSArIE1hdGguY2VpbChzIC8gNzAwMCkpICsgcG9zdCk7XG4gICAgLy8gd3JpdGluZyB0byB0aGlzIHdyaXRlcyB0byB0aGUgb3V0cHV0IGJ1ZmZlclxuICAgIHZhciB3ID0gby5zdWJhcnJheShwcmUsIG8ubGVuZ3RoIC0gcG9zdCk7XG4gICAgdmFyIGxzdCA9IHN0Lmw7XG4gICAgdmFyIHBvcyA9IChzdC5yIHx8IDApICYgNztcbiAgICBpZiAobHZsKSB7XG4gICAgICAgIGlmIChwb3MpXG4gICAgICAgICAgICB3WzBdID0gc3QuciA+PiAzO1xuICAgICAgICB2YXIgb3B0ID0gZGVvW2x2bCAtIDFdO1xuICAgICAgICB2YXIgbiA9IG9wdCA+PiAxMywgYyA9IG9wdCAmIDgxOTE7XG4gICAgICAgIHZhciBtc2tfMSA9ICgxIDw8IHBsdmwpIC0gMTtcbiAgICAgICAgLy8gICAgcHJldiAyLWJ5dGUgdmFsIG1hcCAgICBjdXJyIDItYnl0ZSB2YWwgbWFwXG4gICAgICAgIHZhciBwcmV2ID0gc3QucCB8fCBuZXcgdTE2KDMyNzY4KSwgaGVhZCA9IHN0LmggfHwgbmV3IHUxNihtc2tfMSArIDEpO1xuICAgICAgICB2YXIgYnMxXzEgPSBNYXRoLmNlaWwocGx2bCAvIDMpLCBiczJfMSA9IDIgKiBiczFfMTtcbiAgICAgICAgdmFyIGhzaCA9IGZ1bmN0aW9uIChpKSB7IHJldHVybiAoZGF0W2ldIF4gKGRhdFtpICsgMV0gPDwgYnMxXzEpIF4gKGRhdFtpICsgMl0gPDwgYnMyXzEpKSAmIG1za18xOyB9O1xuICAgICAgICAvLyAyNDU3NiBpcyBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIG1heGltdW0gc3ltYm9scyBwZXIgYmxvY2tcbiAgICAgICAgLy8gNDI0IGJ1ZmZlciBmb3IgbGFzdCBibG9ja1xuICAgICAgICB2YXIgc3ltcyA9IG5ldyBpMzIoMjUwMDApO1xuICAgICAgICAvLyBsZW5ndGgvbGl0ZXJhbCBmcmVxICAgZGlzdGFuY2UgZnJlcVxuICAgICAgICB2YXIgbGYgPSBuZXcgdTE2KDI4OCksIGRmID0gbmV3IHUxNigzMik7XG4gICAgICAgIC8vICBsL2xjbnQgIGV4Yml0cyAgaW5kZXggICAgICAgICAgbC9saW5kICB3YWl0ZHggICAgICAgICAgYmxrcG9zXG4gICAgICAgIHZhciBsY18xID0gMCwgZWIgPSAwLCBpID0gc3QuaSB8fCAwLCBsaSA9IDAsIHdpID0gc3QudyB8fCAwLCBicyA9IDA7XG4gICAgICAgIGZvciAoOyBpICsgMiA8IHM7ICsraSkge1xuICAgICAgICAgICAgLy8gaGFzaCB2YWx1ZVxuICAgICAgICAgICAgdmFyIGh2ID0gaHNoKGkpO1xuICAgICAgICAgICAgLy8gaW5kZXggbW9kIDMyNzY4ICAgIHByZXZpb3VzIGluZGV4IG1vZFxuICAgICAgICAgICAgdmFyIGltb2QgPSBpICYgMzI3NjcsIHBpbW9kID0gaGVhZFtodl07XG4gICAgICAgICAgICBwcmV2W2ltb2RdID0gcGltb2Q7XG4gICAgICAgICAgICBoZWFkW2h2XSA9IGltb2Q7XG4gICAgICAgICAgICAvLyBXZSBhbHdheXMgc2hvdWxkIG1vZGlmeSBoZWFkIGFuZCBwcmV2LCBidXQgb25seSBhZGQgc3ltYm9scyBpZlxuICAgICAgICAgICAgLy8gdGhpcyBkYXRhIGlzIG5vdCB5ZXQgcHJvY2Vzc2VkIChcIndhaXRcIiBmb3Igd2FpdCBpbmRleClcbiAgICAgICAgICAgIGlmICh3aSA8PSBpKSB7XG4gICAgICAgICAgICAgICAgLy8gYnl0ZXMgcmVtYWluaW5nXG4gICAgICAgICAgICAgICAgdmFyIHJlbSA9IHMgLSBpO1xuICAgICAgICAgICAgICAgIGlmICgobGNfMSA+IDcwMDAgfHwgbGkgPiAyNDU3NikgJiYgKHJlbSA+IDQyMyB8fCAhbHN0KSkge1xuICAgICAgICAgICAgICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgMCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGxpID0gbGNfMSA9IGViID0gMCwgYnMgPSBpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI4NjsgKytqKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGZbal0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDMwOyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBkZltqXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICBsZW4gICAgZGlzdCAgIGNoYWluXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAyLCBkID0gMCwgY2hfMSA9IGMsIGRpZiA9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgIGlmIChyZW0gPiAyICYmIGh2ID09IGhzaChpIC0gZGlmKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4biA9IE1hdGgubWluKG4sIHJlbSkgLSAxO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4ZCA9IE1hdGgubWluKDMyNzY3LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF4IHBvc3NpYmxlIGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyBub3QgY2FwcGVkIGF0IGRpZiBiZWNhdXNlIGRlY29tcHJlc3NvcnMgaW1wbGVtZW50IFwicm9sbGluZ1wiIGluZGV4IHBvcHVsYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1sID0gTWF0aC5taW4oMjU4LCByZW0pO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZGlmIDw9IG1heGQgJiYgLS1jaF8xICYmIGltb2QgIT0gcGltb2QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRbaSArIGxdID09IGRhdFtpICsgbCAtIGRpZl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmwgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyBubCA8IG1sICYmIGRhdFtpICsgbmxdID09IGRhdFtpICsgbmwgLSBkaWZdOyArK25sKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsID0gbmwsIGQgPSBkaWY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrIG91dCBlYXJseSB3aGVuIHdlIHJlYWNoIFwibmljZVwiICh3ZSBhcmUgc2F0aXNmaWVkIGVub3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbWF4bilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3csIGZpbmQgdGhlIHJhcmVzdCAyLWJ5dGUgc2VxdWVuY2Ugd2l0aGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGVuZ3RoIG9mIGxpdGVyYWxzIGFuZCBzZWFyY2ggZm9yIHRoYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTXVjaCBmYXN0ZXIgdGhhbiBqdXN0IHVzaW5nIHRoZSBzdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW1kID0gTWF0aC5taW4oZGlmLCBubCAtIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1tZDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGkgPSBpIC0gZGlmICsgaiAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB0aSA9IHByZXZbdGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNkID0gdGkgLSBwdGkgJiAzMjc2NztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZCA+IG1kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1kID0gY2QsIHBpbW9kID0gdGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0aGUgcHJldmlvdXMgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGltb2QgPSBwaW1vZCwgcGltb2QgPSBwcmV2W2ltb2RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlmICs9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGQgd2lsbCBiZSBub256ZXJvIG9ubHkgd2hlbiBhIG1hdGNoIHdhcyBmb3VuZFxuICAgICAgICAgICAgICAgIGlmIChkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIGJvdGggZGlzdCBhbmQgbGVuIGRhdGEgaW4gb25lIGludDMyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIHJlY29nbml6ZWQgYXMgYSBsZW4vZGlzdCB3aXRoIDI4dGggYml0ICgyXjI4KVxuICAgICAgICAgICAgICAgICAgICBzeW1zW2xpKytdID0gMjY4NDM1NDU2IHwgKHJldmZsW2xdIDw8IDE4KSB8IHJldmZkW2RdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGluID0gcmV2ZmxbbF0gJiAzMSwgZGluID0gcmV2ZmRbZF0gJiAzMTtcbiAgICAgICAgICAgICAgICAgICAgZWIgKz0gZmxlYltsaW5dICsgZmRlYltkaW5dO1xuICAgICAgICAgICAgICAgICAgICArK2xmWzI1NyArIGxpbl07XG4gICAgICAgICAgICAgICAgICAgICsrZGZbZGluXTtcbiAgICAgICAgICAgICAgICAgICAgd2kgPSBpICsgbDtcbiAgICAgICAgICAgICAgICAgICAgKytsY18xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3ltc1tsaSsrXSA9IGRhdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgKytsZltkYXRbaV1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSBNYXRoLm1heChpLCB3aSk7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIHN5bXNbbGkrK10gPSBkYXRbaV07XG4gICAgICAgICAgICArK2xmW2RhdFtpXV07XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gd2JsayhkYXQsIHcsIGxzdCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgIGlmICghbHN0KSB7XG4gICAgICAgICAgICBzdC5yID0gKHBvcyAmIDcpIHwgd1socG9zIC8gOCkgfCAwXSA8PCAzO1xuICAgICAgICAgICAgLy8gc2hmdChwb3MpIG5vdyAxIGxlc3MgaWYgcG9zICYgNyAhPSAwXG4gICAgICAgICAgICBwb3MgLT0gNztcbiAgICAgICAgICAgIHN0LmggPSBoZWFkLCBzdC5wID0gcHJldiwgc3QuaSA9IGksIHN0LncgPSB3aTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0LncgfHwgMDsgaSA8IHMgKyBsc3Q7IGkgKz0gNjU1MzUpIHtcbiAgICAgICAgICAgIC8vIGVuZFxuICAgICAgICAgICAgdmFyIGUgPSBpICsgNjU1MzU7XG4gICAgICAgICAgICBpZiAoZSA+PSBzKSB7XG4gICAgICAgICAgICAgICAgLy8gd3JpdGUgZmluYWwgYmxvY2tcbiAgICAgICAgICAgICAgICB3Wyhwb3MgLyA4KSB8IDBdID0gbHN0O1xuICAgICAgICAgICAgICAgIGUgPSBzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zID0gd2ZibGsodywgcG9zICsgMSwgZGF0LnN1YmFycmF5KGksIGUpKTtcbiAgICAgICAgfVxuICAgICAgICBzdC5pID0gcztcbiAgICB9XG4gICAgcmV0dXJuIHNsYyhvLCAwLCBwcmUgKyBzaGZ0KHBvcykgKyBwb3N0KTtcbn07XG4vLyBDUkMzMiB0YWJsZVxudmFyIGNyY3QgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSBuZXcgSW50MzJBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICAgICAgdmFyIGMgPSBpLCBrID0gOTtcbiAgICAgICAgd2hpbGUgKC0taylcbiAgICAgICAgICAgIGMgPSAoKGMgJiAxKSAmJiAtMzA2Njc0OTEyKSBeIChjID4+PiAxKTtcbiAgICAgICAgdFtpXSA9IGM7XG4gICAgfVxuICAgIHJldHVybiB0O1xufSkoKTtcbi8vIENSQzMyXG52YXIgY3JjID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjID0gLTE7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIC8vIGNsb3N1cmVzIGhhdmUgYXdmdWwgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIHZhciBjciA9IGM7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGQubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY3IgPSBjcmN0WyhjciAmIDI1NSkgXiBkW2ldXSBeIChjciA+Pj4gOCk7XG4gICAgICAgICAgICBjID0gY3I7XG4gICAgICAgIH0sXG4gICAgICAgIGQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIH5jOyB9XG4gICAgfTtcbn07XG4vLyBBZGxlcjMyXG52YXIgYWRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGEgPSAxLCBiID0gMDtcbiAgICByZXR1cm4ge1xuICAgICAgICBwOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgLy8gY2xvc3VyZXMgaGF2ZSBhd2Z1bCBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgdmFyIG4gPSBhLCBtID0gYjtcbiAgICAgICAgICAgIHZhciBsID0gZC5sZW5ndGggfCAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgIT0gbDspIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IE1hdGgubWluKGkgKyAyNjU1LCBsKTtcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IGU7ICsraSlcbiAgICAgICAgICAgICAgICAgICAgbSArPSBuICs9IGRbaV07XG4gICAgICAgICAgICAgICAgbiA9IChuICYgNjU1MzUpICsgMTUgKiAobiA+PiAxNiksIG0gPSAobSAmIDY1NTM1KSArIDE1ICogKG0gPj4gMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IG4sIGIgPSBtO1xuICAgICAgICB9LFxuICAgICAgICBkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhICU9IDY1NTIxLCBiICU9IDY1NTIxO1xuICAgICAgICAgICAgcmV0dXJuIChhICYgMjU1KSA8PCAyNCB8IChhICYgMHhGRjAwKSA8PCA4IHwgKGIgJiAyNTUpIDw8IDggfCAoYiA+PiA4KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuO1xuLy8gZGVmbGF0ZSB3aXRoIG9wdHNcbnZhciBkb3B0ID0gZnVuY3Rpb24gKGRhdCwgb3B0LCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgaWYgKCFzdCkge1xuICAgICAgICBzdCA9IHsgbDogMSB9O1xuICAgICAgICBpZiAob3B0LmRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciBkaWN0ID0gb3B0LmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgICAgIHZhciBuZXdEYXQgPSBuZXcgdTgoZGljdC5sZW5ndGggKyBkYXQubGVuZ3RoKTtcbiAgICAgICAgICAgIG5ld0RhdC5zZXQoZGljdCk7XG4gICAgICAgICAgICBuZXdEYXQuc2V0KGRhdCwgZGljdC5sZW5ndGgpO1xuICAgICAgICAgICAgZGF0ID0gbmV3RGF0O1xuICAgICAgICAgICAgc3QudyA9IGRpY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZmx0KGRhdCwgb3B0LmxldmVsID09IG51bGwgPyA2IDogb3B0LmxldmVsLCBvcHQubWVtID09IG51bGwgPyAoc3QubCA/IE1hdGguY2VpbChNYXRoLm1heCg4LCBNYXRoLm1pbigxMywgTWF0aC5sb2coZGF0Lmxlbmd0aCkpKSAqIDEuNSkgOiAyMCkgOiAoMTIgKyBvcHQubWVtKSwgcHJlLCBwb3N0LCBzdCk7XG59O1xuLy8gV2FsbWFydCBvYmplY3Qgc3ByZWFkXG52YXIgbXJnID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIGZvciAodmFyIGsgaW4gYSlcbiAgICAgICAgb1trXSA9IGFba107XG4gICAgZm9yICh2YXIgayBpbiBiKVxuICAgICAgICBvW2tdID0gYltrXTtcbiAgICByZXR1cm4gbztcbn07XG4vLyB3b3JrZXIgY2xvbmVcbi8vIFRoaXMgaXMgcG9zc2libHkgdGhlIGNyYXppZXN0IHBhcnQgb2YgdGhlIGVudGlyZSBjb2RlYmFzZSwgZGVzcGl0ZSBob3cgc2ltcGxlIGl0IG1heSBzZWVtLlxuLy8gVGhlIG9ubHkgcGFyYW1ldGVyIHRvIHRoaXMgZnVuY3Rpb24gaXMgYSBjbG9zdXJlIHRoYXQgcmV0dXJucyBhbiBhcnJheSBvZiB2YXJpYWJsZXMgb3V0c2lkZSBvZiB0aGUgZnVuY3Rpb24gc2NvcGUuXG4vLyBXZSdyZSBnb2luZyB0byB0cnkgdG8gZmlndXJlIG91dCB0aGUgdmFyaWFibGUgbmFtZXMgdXNlZCBpbiB0aGUgY2xvc3VyZSBhcyBzdHJpbmdzIGJlY2F1c2UgdGhhdCBpcyBjcnVjaWFsIGZvciB3b3JrZXJpemF0aW9uLlxuLy8gV2Ugd2lsbCByZXR1cm4gYW4gb2JqZWN0IG1hcHBpbmcgb2YgdHJ1ZSB2YXJpYWJsZSBuYW1lIHRvIHZhbHVlIChiYXNpY2FsbHksIHRoZSBjdXJyZW50IHNjb3BlIGFzIGEgSlMgb2JqZWN0KS5cbi8vIFRoZSByZWFzb24gd2UgY2FuJ3QganVzdCB1c2UgdGhlIG9yaWdpbmFsIHZhcmlhYmxlIG5hbWVzIGlzIG1pbmlmaWVycyBtYW5nbGluZyB0aGUgdG9wbGV2ZWwgc2NvcGUuXG4vLyBUaGlzIHRvb2sgbWUgdGhyZWUgd2Vla3MgdG8gZmlndXJlIG91dCBob3cgdG8gZG8uXG52YXIgd2NsbiA9IGZ1bmN0aW9uIChmbiwgZm5TdHIsIHRkKSB7XG4gICAgdmFyIGR0ID0gZm4oKTtcbiAgICB2YXIgc3QgPSBmbi50b1N0cmluZygpO1xuICAgIHZhciBrcyA9IHN0LnNsaWNlKHN0LmluZGV4T2YoJ1snKSArIDEsIHN0Lmxhc3RJbmRleE9mKCddJykpLnJlcGxhY2UoL1xccysvZywgJycpLnNwbGl0KCcsJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgdiA9IGR0W2ldLCBrID0ga3NbaV07XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBmblN0ciArPSAnOycgKyBrICsgJz0nO1xuICAgICAgICAgICAgdmFyIHN0XzEgPSB2LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAodi5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgZ2xvYmFsIG9iamVjdHNcbiAgICAgICAgICAgICAgICBpZiAoc3RfMS5pbmRleE9mKCdbbmF0aXZlIGNvZGVdJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwSW5kID0gc3RfMS5pbmRleE9mKCcgJywgOCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICBmblN0ciArPSBzdF8xLnNsaWNlKHNwSW5kLCBzdF8xLmluZGV4T2YoJygnLCBzcEluZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm5TdHIgKz0gc3RfMTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgdCBpbiB2LnByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuU3RyICs9ICc7JyArIGsgKyAnLnByb3RvdHlwZS4nICsgdCArICc9JyArIHYucHJvdG90eXBlW3RdLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZuU3RyICs9IHN0XzE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGRba10gPSB2O1xuICAgIH1cbiAgICByZXR1cm4gZm5TdHI7XG59O1xudmFyIGNoID0gW107XG4vLyBjbG9uZSBidWZzXG52YXIgY2JmcyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIHRsID0gW107XG4gICAgZm9yICh2YXIgayBpbiB2KSB7XG4gICAgICAgIGlmICh2W2tdLmJ1ZmZlcikge1xuICAgICAgICAgICAgdGwucHVzaCgodltrXSA9IG5ldyB2W2tdLmNvbnN0cnVjdG9yKHZba10pKS5idWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bDtcbn07XG4vLyB1c2UgYSB3b3JrZXIgdG8gZXhlY3V0ZSBjb2RlXG52YXIgd3JrciA9IGZ1bmN0aW9uIChmbnMsIGluaXQsIGlkLCBjYikge1xuICAgIGlmICghY2hbaWRdKSB7XG4gICAgICAgIHZhciBmblN0ciA9ICcnLCB0ZF8xID0ge30sIG0gPSBmbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtOyArK2kpXG4gICAgICAgICAgICBmblN0ciA9IHdjbG4oZm5zW2ldLCBmblN0ciwgdGRfMSk7XG4gICAgICAgIGNoW2lkXSA9IHsgYzogd2NsbihmbnNbbV0sIGZuU3RyLCB0ZF8xKSwgZTogdGRfMSB9O1xuICAgIH1cbiAgICB2YXIgdGQgPSBtcmcoe30sIGNoW2lkXS5lKTtcbiAgICByZXR1cm4gd2soY2hbaWRdLmMgKyAnO29ubWVzc2FnZT1mdW5jdGlvbihlKXtmb3IodmFyIGsgaW4gZS5kYXRhKXNlbGZba109ZS5kYXRhW2tdO29ubWVzc2FnZT0nICsgaW5pdC50b1N0cmluZygpICsgJ30nLCBpZCwgdGQsIGNiZnModGQpLCBjYik7XG59O1xuLy8gYmFzZSBhc3luYyBpbmZsYXRlIGZuXG52YXIgYkluZmx0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3U4LCB1MTYsIGkzMiwgZmxlYiwgZmRlYiwgY2xpbSwgZmwsIGZkLCBmbHJtLCBmZHJtLCByZXYsIGVjLCBoTWFwLCBtYXgsIGJpdHMsIGJpdHMxNiwgc2hmdCwgc2xjLCBlcnIsIGluZmx0LCBpbmZsYXRlU3luYywgcGJmLCBnb3B0XTsgfTtcbnZhciBiRGZsdCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1OCwgdTE2LCBpMzIsIGZsZWIsIGZkZWIsIGNsaW0sIHJldmZsLCByZXZmZCwgZmxtLCBmbHQsIGZkbSwgZmR0LCByZXYsIGRlbywgZXQsIGhNYXAsIHdiaXRzLCB3Yml0czE2LCBoVHJlZSwgbG4sIGxjLCBjbGVuLCB3ZmJsaywgd2Jsaywgc2hmdCwgc2xjLCBkZmx0LCBkb3B0LCBkZWZsYXRlU3luYywgcGJmXTsgfTtcbi8vIGd6aXAgZXh0cmFcbnZhciBnemUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3poLCBnemhsLCB3Ynl0ZXMsIGNyYywgY3JjdF07IH07XG4vLyBndW56aXAgZXh0cmFcbnZhciBndXplID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6cywgZ3psXTsgfTtcbi8vIHpsaWIgZXh0cmFcbnZhciB6bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxoLCB3Ynl0ZXMsIGFkbGVyXTsgfTtcbi8vIHVuemxpYiBleHRyYVxudmFyIHp1bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxzXTsgfTtcbi8vIHBvc3QgYnVmXG52YXIgcGJmID0gZnVuY3Rpb24gKG1zZykgeyByZXR1cm4gcG9zdE1lc3NhZ2UobXNnLCBbbXNnLmJ1ZmZlcl0pOyB9O1xuLy8gZ2V0IG9wdHNcbnZhciBnb3B0ID0gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYge1xuICAgIG91dDogby5zaXplICYmIG5ldyB1OChvLnNpemUpLFxuICAgIGRpY3Rpb25hcnk6IG8uZGljdGlvbmFyeVxufTsgfTtcbi8vIGFzeW5jIGhlbHBlclxudmFyIGNiaWZ5ID0gZnVuY3Rpb24gKGRhdCwgb3B0cywgZm5zLCBpbml0LCBpZCwgY2IpIHtcbiAgICB2YXIgdyA9IHdya3IoZm5zLCBpbml0LCBpZCwgZnVuY3Rpb24gKGVyciwgZGF0KSB7XG4gICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgIGNiKGVyciwgZGF0KTtcbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKFtkYXQsIG9wdHNdLCBvcHRzLmNvbnN1bWUgPyBbZGF0LmJ1ZmZlcl0gOiBbXSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbn07XG4vLyBhdXRvIHN0cmVhbVxudmFyIGFzdHJtID0gZnVuY3Rpb24gKHN0cm0pIHtcbiAgICBzdHJtLm9uZGF0YSA9IGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7IHJldHVybiBwb3N0TWVzc2FnZShbZGF0LCBmaW5hbF0sIFtkYXQuYnVmZmVyXSk7IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldikge1xuICAgICAgICBpZiAoZXYuZGF0YVswXSkge1xuICAgICAgICAgICAgc3RybS5wdXNoKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pO1xuICAgICAgICAgICAgcG9zdE1lc3NhZ2UoW2V2LmRhdGFbMF0ubGVuZ3RoXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3RybS5mbHVzaChldi5kYXRhWzFdKTtcbiAgICB9O1xufTtcbi8vIGFzeW5jIHN0cmVhbSBhdHRhY2hcbnZhciBhc3RybWlmeSA9IGZ1bmN0aW9uIChmbnMsIHN0cm0sIG9wdHMsIGluaXQsIGlkLCBmbHVzaCwgZXh0KSB7XG4gICAgdmFyIHQ7XG4gICAgdmFyIHcgPSB3cmtyKGZucywgaW5pdCwgaWQsIGZ1bmN0aW9uIChlcnIsIGRhdCkge1xuICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgdy50ZXJtaW5hdGUoKSwgc3RybS5vbmRhdGEuY2FsbChzdHJtLCBlcnIpO1xuICAgICAgICBlbHNlIGlmICghQXJyYXkuaXNBcnJheShkYXQpKVxuICAgICAgICAgICAgZXh0KGRhdCk7XG4gICAgICAgIGVsc2UgaWYgKGRhdC5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgc3RybS5xdWV1ZWRTaXplIC09IGRhdFswXTtcbiAgICAgICAgICAgIGlmIChzdHJtLm9uZHJhaW4pXG4gICAgICAgICAgICAgICAgc3RybS5vbmRyYWluKGRhdFswXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGF0WzFdKVxuICAgICAgICAgICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgICAgICBzdHJtLm9uZGF0YS5jYWxsKHN0cm0sIGVyciwgZGF0WzBdLCBkYXRbMV0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdy5wb3N0TWVzc2FnZShvcHRzKTtcbiAgICBzdHJtLnF1ZXVlZFNpemUgPSAwO1xuICAgIHN0cm0ucHVzaCA9IGZ1bmN0aW9uIChkLCBmKSB7XG4gICAgICAgIGlmICghc3RybS5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0KVxuICAgICAgICAgICAgc3RybS5vbmRhdGEoZXJyKDQsIDAsIDEpLCBudWxsLCAhIWYpO1xuICAgICAgICBzdHJtLnF1ZXVlZFNpemUgKz0gZC5sZW5ndGg7XG4gICAgICAgIC8vIGNhbiBmYWlsIGZvciBjcm9zcy1yZWFsbSBVaW50OEFycmF5LCBidXQgb2sgLSBvbmx5IGEgc21hbGwgcGVyZm9ybWFuY2UgcGVuYWx0eVxuICAgICAgICB3LnBvc3RNZXNzYWdlKFtkLCB0ID0gZl0sIGQuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPyBbZC5idWZmZXJdIDogW10pO1xuICAgIH07XG4gICAgc3RybS50ZXJtaW5hdGUgPSBmdW5jdGlvbiAoKSB7IHcudGVybWluYXRlKCk7IH07XG4gICAgaWYgKGZsdXNoKSB7XG4gICAgICAgIHN0cm0uZmx1c2ggPSBmdW5jdGlvbiAoc3luYykgeyB3LnBvc3RNZXNzYWdlKFswLCBzeW5jXSk7IH07XG4gICAgfVxufTtcbi8vIHJlYWQgMiBieXRlc1xudmFyIGIyID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGRbYl0gfCAoZFtiICsgMV0gPDwgOCk7IH07XG4vLyByZWFkIDQgYnl0ZXNcbnZhciBiNCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiAoZFtiXSB8IChkW2IgKyAxXSA8PCA4KSB8IChkW2IgKyAyXSA8PCAxNikgfCAoZFtiICsgM10gPDwgMjQpKSA+Pj4gMDsgfTtcbi8vIHJlYWQgOCBieXRlc1xudmFyIGI4ID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGI0KGQsIGIpICsgKGI0KGQsIGIgKyA0KSAqIDQyOTQ5NjcyOTYpOyB9O1xuLy8gd3JpdGUgYnl0ZXNcbnZhciB3Ynl0ZXMgPSBmdW5jdGlvbiAoZCwgYiwgdikge1xuICAgIGZvciAoOyB2OyArK2IpXG4gICAgICAgIGRbYl0gPSB2LCB2ID4+Pj0gODtcbn07XG4vLyBnemlwIGhlYWRlclxudmFyIGd6aCA9IGZ1bmN0aW9uIChjLCBvKSB7XG4gICAgdmFyIGZuID0gby5maWxlbmFtZTtcbiAgICBjWzBdID0gMzEsIGNbMV0gPSAxMzksIGNbMl0gPSA4LCBjWzhdID0gby5sZXZlbCA8IDIgPyA0IDogby5sZXZlbCA9PSA5ID8gMiA6IDAsIGNbOV0gPSAzOyAvLyBhc3N1bWUgVW5peFxuICAgIGlmIChvLm10aW1lICE9IDApXG4gICAgICAgIHdieXRlcyhjLCA0LCBNYXRoLmZsb29yKG5ldyBEYXRlKG8ubXRpbWUgfHwgRGF0ZS5ub3coKSkgLyAxMDAwKSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICAgIGNbM10gPSA4O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmbi5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNbaSArIDEwXSA9IGZuLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxufTtcbi8vIGd6aXAgZm9vdGVyOiAtOCB0byAtNCA9IENSQywgLTQgdG8gLTAgaXMgbGVuZ3RoXG4vLyBnemlwIHN0YXJ0XG52YXIgZ3pzID0gZnVuY3Rpb24gKGQpIHtcbiAgICBpZiAoZFswXSAhPSAzMSB8fCBkWzFdICE9IDEzOSB8fCBkWzJdICE9IDgpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCBnemlwIGRhdGEnKTtcbiAgICB2YXIgZmxnID0gZFszXTtcbiAgICB2YXIgc3QgPSAxMDtcbiAgICBpZiAoZmxnICYgNClcbiAgICAgICAgc3QgKz0gKGRbMTBdIHwgZFsxMV0gPDwgOCkgKyAyO1xuICAgIGZvciAodmFyIHpzID0gKGZsZyA+PiAzICYgMSkgKyAoZmxnID4+IDQgJiAxKTsgenMgPiAwOyB6cyAtPSAhZFtzdCsrXSlcbiAgICAgICAgO1xuICAgIHJldHVybiBzdCArIChmbGcgJiAyKTtcbn07XG4vLyBnemlwIGxlbmd0aFxudmFyIGd6bCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgdmFyIGwgPSBkLmxlbmd0aDtcbiAgICByZXR1cm4gKGRbbCAtIDRdIHwgZFtsIC0gM10gPDwgOCB8IGRbbCAtIDJdIDw8IDE2IHwgZFtsIC0gMV0gPDwgMjQpID4+PiAwO1xufTtcbi8vIGd6aXAgaGVhZGVyIGxlbmd0aFxudmFyIGd6aGwgPSBmdW5jdGlvbiAobykgeyByZXR1cm4gMTAgKyAoby5maWxlbmFtZSA/IG8uZmlsZW5hbWUubGVuZ3RoICsgMSA6IDApOyB9O1xuLy8gemxpYiBoZWFkZXJcbnZhciB6bGggPSBmdW5jdGlvbiAoYywgbykge1xuICAgIHZhciBsdiA9IG8ubGV2ZWwsIGZsID0gbHYgPT0gMCA/IDAgOiBsdiA8IDYgPyAxIDogbHYgPT0gOSA/IDMgOiAyO1xuICAgIGNbMF0gPSAxMjAsIGNbMV0gPSAoZmwgPDwgNikgfCAoby5kaWN0aW9uYXJ5ICYmIDMyKTtcbiAgICBjWzFdIHw9IDMxIC0gKChjWzBdIDw8IDgpIHwgY1sxXSkgJSAzMTtcbiAgICBpZiAoby5kaWN0aW9uYXJ5KSB7XG4gICAgICAgIHZhciBoID0gYWRsZXIoKTtcbiAgICAgICAgaC5wKG8uZGljdGlvbmFyeSk7XG4gICAgICAgIHdieXRlcyhjLCAyLCBoLmQoKSk7XG4gICAgfVxufTtcbi8vIHpsaWIgc3RhcnRcbnZhciB6bHMgPSBmdW5jdGlvbiAoZCwgZGljdCkge1xuICAgIGlmICgoZFswXSAmIDE1KSAhPSA4IHx8IChkWzBdID4+IDQpID4gNyB8fCAoKGRbMF0gPDwgOCB8IGRbMV0pICUgMzEpKVxuICAgICAgICBlcnIoNiwgJ2ludmFsaWQgemxpYiBkYXRhJyk7XG4gICAgaWYgKChkWzFdID4+IDUgJiAxKSA9PSArIWRpY3QpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCB6bGliIGRhdGE6ICcgKyAoZFsxXSAmIDMyID8gJ25lZWQnIDogJ3VuZXhwZWN0ZWQnKSArICcgZGljdGlvbmFyeScpO1xuICAgIHJldHVybiAoZFsxXSA+PiAzICYgNCkgKyAyO1xufTtcbmZ1bmN0aW9uIFN0cm1PcHQob3B0cywgY2IpIHtcbiAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICByZXR1cm4gb3B0cztcbn1cbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb25cbiAqL1xudmFyIERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRGVmbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB0aGlzLm8gPSBvcHRzIHx8IHt9O1xuICAgICAgICB0aGlzLnMgPSB7IGw6IDAsIGk6IDMyNzY4LCB3OiAzMjc2OCwgejogMzI3NjggfTtcbiAgICAgICAgLy8gQnVmZmVyIGxlbmd0aCBtdXN0IGFsd2F5cyBiZSAwIG1vZCAzMjc2OCBmb3IgaW5kZXggY2FsY3VsYXRpb25zIHRvIGJlIGNvcnJlY3Qgd2hlbiBtb2RpZnlpbmcgaGVhZCBhbmQgcHJldlxuICAgICAgICAvLyA5ODMwNCA9IDMyNzY4IChsb29rYmFjaykgKyA2NTUzNiAoY29tbW9uIGNodW5rIHNpemUpXG4gICAgICAgIHRoaXMuYiA9IG5ldyB1OCg5ODMwNCk7XG4gICAgICAgIGlmICh0aGlzLm8uZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIGRpY3QgPSB0aGlzLm8uZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpO1xuICAgICAgICAgICAgdGhpcy5iLnNldChkaWN0LCAzMjc2OCAtIGRpY3QubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMucy5pID0gMzI3NjggLSBkaWN0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBEZWZsYXRlLnByb3RvdHlwZS5wID0gZnVuY3Rpb24gKGMsIGYpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEoZG9wdChjLCB0aGlzLm8sIDAsIDAsIHRoaXMucyksIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVmbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVmbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMucy5sKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICB2YXIgZW5kTGVuID0gY2h1bmsubGVuZ3RoICsgdGhpcy5zLno7XG4gICAgICAgIGlmIChlbmRMZW4gPiB0aGlzLmIubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoZW5kTGVuID4gMiAqIHRoaXMuYi5sZW5ndGggLSAzMjc2OCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdCdWYgPSBuZXcgdTgoZW5kTGVuICYgLTMyNzY4KTtcbiAgICAgICAgICAgICAgICBuZXdCdWYuc2V0KHRoaXMuYi5zdWJhcnJheSgwLCB0aGlzLnMueikpO1xuICAgICAgICAgICAgICAgIHRoaXMuYiA9IG5ld0J1ZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHRoaXMuYi5sZW5ndGggLSB0aGlzLnMuejtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoY2h1bmsuc3ViYXJyYXkoMCwgc3BsaXQpLCB0aGlzLnMueik7XG4gICAgICAgICAgICB0aGlzLnMueiA9IHRoaXMuYi5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnAodGhpcy5iLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KHRoaXMuYi5zdWJhcnJheSgtMzI3NjgpKTtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoY2h1bmsuc3ViYXJyYXkoc3BsaXQpLCAzMjc2OCk7XG4gICAgICAgICAgICB0aGlzLnMueiA9IGNodW5rLmxlbmd0aCAtIHNwbGl0ICsgMzI3Njg7XG4gICAgICAgICAgICB0aGlzLnMuaSA9IDMyNzY2LCB0aGlzLnMudyA9IDMyNzY4O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iLnNldChjaHVuaywgdGhpcy5zLnopO1xuICAgICAgICAgICAgdGhpcy5zLnogKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucy5sID0gZmluYWwgJiAxO1xuICAgICAgICBpZiAodGhpcy5zLnogPiB0aGlzLnMudyArIDgxOTEgfHwgZmluYWwpIHtcbiAgICAgICAgICAgIHRoaXMucCh0aGlzLmIsIGZpbmFsIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucy53ID0gdGhpcy5zLmksIHRoaXMucy5pIC09IDI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAvLyBjbGVhbnVwIHVubmVlZGVkIGJ1ZmZlcnMvc3RhdGUgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgdGhpcy5zID0gdGhpcy5vID0ge307XG4gICAgICAgICAgICB0aGlzLmIgPSBldDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIGRlZmxhdGVkIG91dHB1dCBmb3Igc21hbGwgaW5wdXRzLlxuICAgICAqIEBwYXJhbSBzeW5jIFdoZXRoZXIgdG8gZmx1c2ggdG8gYSBieXRlIGJvdW5kYXJ5LiBBIHN5bmMgZmx1c2ggdGFrZXMgNC01XG4gICAgICogICAgICAgICAgICAgZXh0cmEgYnl0ZXMsIGJ1dCBndWFyYW50ZWVzIGFsbCBwdXNoZWQgZGF0YSBpcyBpbW1lZGlhdGVseVxuICAgICAqICAgICAgICAgICAgIGRlY29tcHJlc3NpYmxlLiBBIHNlcGFyYXRlIERFRkxBVEUgc3RyZWFtIG1heSBiZSBjb25jYXRlbmF0ZWRcbiAgICAgKiAgICAgICAgICAgICB3aXRoIHRoZSBjdXJyZW50IG91dHB1dCBhZnRlciBhIHN5bmMgZmx1c2guXG4gICAgICovXG4gICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAodGhpcy5zLmwpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHRoaXMucCh0aGlzLmIsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5zLncgPSB0aGlzLnMuaSwgdGhpcy5zLmkgLT0gMjtcbiAgICAgICAgLy8gY291bGQgdGVjaG5pY2FsbHkgc2tpcCB3cml0aW5nIHRoZSB0eXBlLTAgYmxvY2sgZm9yICh0aGlzLnMuciAmIDcpID09IDAsXG4gICAgICAgIC8vIGJ1dCB0aGUgZGV0ZXJtaW5pc3RpYyB0cmFpbGVyICgwMCAwMCBGRiBGRikgaXMgdXNlZnVsIGluIHNvbWUgc2l0dWF0aW9uc1xuICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgdmFyIGMgPSBuZXcgdTgoNik7XG4gICAgICAgICAgICBjWzBdID0gdGhpcy5zLnIgPj4gMztcbiAgICAgICAgICAgIC8vIHdyaXRlIGVtcHR5LCBub24tZmluYWwgdHlwZS0wIGJsb2NrXG4gICAgICAgICAgICB2YXIgZXAgPSB3ZmJsayhjLCB0aGlzLnMuciwgZXQpO1xuICAgICAgICAgICAgdGhpcy5zLnIgPSAwO1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoYy5zdWJhcnJheSgwLCBlcCA+PiAzKSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBEZWZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jRGVmbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiRGZsdCxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgRGVmbGF0ZV07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBEZWZsYXRlKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDYsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jRGVmbGF0ZSB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmxhdGUoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiRGZsdCxcbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihkZWZsYXRlU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDAsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3NlcyBkYXRhIHdpdGggREVGTEFURSB3aXRob3V0IGFueSB3cmFwcGVyXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWZsYXRlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZsYXRlU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIGRvcHQoZGF0YSwgb3B0cyB8fCB7fSwgMCwgMCk7XG59XG4vKipcbiAqIFN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSW5mbGF0ZShvcHRzLCBjYikge1xuICAgICAgICAvLyBubyBTdHJtT3B0IGhlcmUgdG8gYXZvaWQgYWRkaW5nIHRvIHdvcmtlcml6ZXJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRzID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICAgICAgdmFyIGRpY3QgPSBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSAmJiBvcHRzLmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgdGhpcy5zID0geyBpOiAwLCBiOiBkaWN0ID8gZGljdC5sZW5ndGggOiAwIH07XG4gICAgICAgIHRoaXMubyA9IG5ldyB1OCgzMjc2OCk7XG4gICAgICAgIHRoaXMucCA9IG5ldyB1OCgwKTtcbiAgICAgICAgaWYgKGRpY3QpXG4gICAgICAgICAgICB0aGlzLm8uc2V0KGRpY3QpO1xuICAgIH1cbiAgICBJbmZsYXRlLnByb3RvdHlwZS5lID0gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgaWYgKCF0aGlzLnAubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5wID0gYztcbiAgICAgICAgZWxzZSBpZiAoYy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjLmxlbmd0aCk7XG4gICAgICAgICAgICBuLnNldCh0aGlzLnApLCBuLnNldChjLCB0aGlzLnAubGVuZ3RoKSwgdGhpcy5wID0gbjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSW5mbGF0ZS5wcm90b3R5cGUuYyA9IGZ1bmN0aW9uIChmaW5hbCkge1xuICAgICAgICB0aGlzLnMuaSA9ICsodGhpcy5kID0gZmluYWwgfHwgZmFsc2UpO1xuICAgICAgICB2YXIgYnRzID0gdGhpcy5zLmI7XG4gICAgICAgIHZhciBkdCA9IGluZmx0KHRoaXMucCwgdGhpcy5zLCB0aGlzLm8pO1xuICAgICAgICB0aGlzLm9uZGF0YShzbGMoZHQsIGJ0cywgdGhpcy5zLmIpLCB0aGlzLmQpO1xuICAgICAgICB0aGlzLm8gPSBzbGMoZHQsIHRoaXMucy5iIC0gMzI3NjgpLCB0aGlzLnMuYiA9IHRoaXMuby5sZW5ndGg7XG4gICAgICAgIHRoaXMucCA9IHNsYyh0aGlzLnAsICh0aGlzLnMucCAvIDgpIHwgMCksIHRoaXMucy5wICY9IDc7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBpbmZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGZpbmFsIGNodW5rXG4gICAgICovXG4gICAgSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5lKGNodW5rKSwgdGhpcy5jKGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEluZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0luZmxhdGUob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBJbmZsYXRlXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEluZmxhdGUoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgNywgMCk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0luZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNJbmZsYXRlIH07XG5leHBvcnQgZnVuY3Rpb24gaW5mbGF0ZShkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdFxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGluZmxhdGVTeW5jKGV2LmRhdGFbMF0sIGdvcHQoZXYuZGF0YVsxXSkpKTsgfSwgMSwgY2IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGVTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YSwgeyBpOiAyIH0sIG9wdHMgJiYgb3B0cy5vdXQsIG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5KTtcbn1cbi8vIGJlZm9yZSB5b3UgeWVsbCBhdCBtZSBmb3Igbm90IGp1c3QgdXNpbmcgZXh0ZW5kcywgbXkgcmVhc29uIGlzIHRoYXQgVFMgaW5oZXJpdGFuY2UgaXMgaGFyZCB0byB3b3JrZXJpemUuXG4vKipcbiAqIFN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBHemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEd6aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gY3JjKCk7XG4gICAgICAgIHRoaXMubCA9IDA7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdaSVBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgR3ppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICB0aGlzLmwgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIEd6aXAucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiBnemhsKHRoaXMubyksIGYgJiYgOCwgdGhpcy5zKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIGd6aChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDgsIHRoaXMuYy5kKCkpLCB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5sKTtcbiAgICAgICAgdGhpcy5vbmRhdGEocmF3LCBmKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEZsdXNoZXMgYnVmZmVyZWQgdW5jb21wcmVzc2VkIGRhdGEuIFVzZWZ1bCB0byBpbW1lZGlhdGVseSByZXRyaWV2ZSB0aGVcbiAgICAgKiBHWklQcGVkIG91dHB1dCBmb3Igc21hbGwgaW5wdXRzLlxuICAgICAqIEBwYXJhbSBzeW5jIFdoZXRoZXIgdG8gZmx1c2ggdG8gYSBieXRlIGJvdW5kYXJ5LiBBIHN5bmMgZmx1c2ggdGFrZXMgNC01XG4gICAgICogICAgICAgICAgICAgZXh0cmEgYnl0ZXMsIGJ1dCBndWFyYW50ZWVzIGFsbCBwdXNoZWQgZGF0YSBpcyBpbW1lZGlhdGVseVxuICAgICAqICAgICAgICAgICAgIGRlY29tcHJlc3NpYmxlLlxuICAgICAqL1xuICAgIEd6aXAucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKHN5bmMpIHtcbiAgICAgICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2guY2FsbCh0aGlzLCBzeW5jKTtcbiAgICB9O1xuICAgIHJldHVybiBHemlwO1xufSgpKTtcbmV4cG9ydCB7IEd6aXAgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0d6aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNHemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgZ3plLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlLCBHemlwXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEd6aXAoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgOCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0d6aXA7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNHemlwIH07XG5leHBvcnQgZnVuY3Rpb24gZ3ppcChkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICBnemUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtnemlwU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihnemlwU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDIsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3NlcyBkYXRhIHdpdGggR1pJUFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZ3ppcHBlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGMgPSBjcmMoKSwgbCA9IGRhdGEubGVuZ3RoO1xuICAgIGMucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgZ3pobChvcHRzKSwgOCksIHMgPSBkLmxlbmd0aDtcbiAgICByZXR1cm4gZ3poKGQsIG9wdHMpLCB3Ynl0ZXMoZCwgcyAtIDgsIGMuZCgpKSwgd2J5dGVzKGQsIHMgLSA0LCBsKSwgZDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIHNpbmdsZSBvciBtdWx0aS1tZW1iZXIgR1pJUCBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBHdW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gR3VuemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIHRoaXMuciA9IDA7XG4gICAgICAgIEluZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdVTlpJUHBlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBHdW56aXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmUuY2FsbCh0aGlzLCBjaHVuayk7XG4gICAgICAgIHRoaXMuciArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLnYpIHtcbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5wLnN1YmFycmF5KHRoaXMudiAtIDEpO1xuICAgICAgICAgICAgdmFyIHMgPSBwLmxlbmd0aCA+IDMgPyBnenMocCkgOiA0O1xuICAgICAgICAgICAgaWYgKHMgPiBwLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICghZmluYWwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudiA+IDEgJiYgdGhpcy5vbm1lbWJlcikge1xuICAgICAgICAgICAgICAgIHRoaXMub25tZW1iZXIodGhpcy5yIC0gcC5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wID0gcC5zdWJhcnJheShzKSwgdGhpcy52ID0gMDtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWNlc3NhcnkgdG8gcHJldmVudCBUUyBmcm9tIHVzaW5nIHRoZSBjbG9zdXJlIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB3b3JrZXJpemF0aW9uIHRvIGZ1bmN0aW9uIGNvcnJlY3RseVxuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5jLmNhbGwodGhpcywgMCk7XG4gICAgICAgIC8vIHByb2Nlc3MgY29uY2F0ZW5hdGVkIEdaSVBcbiAgICAgICAgaWYgKHRoaXMucy5mICYmICF0aGlzLnMubCkge1xuICAgICAgICAgICAgdGhpcy52ID0gc2hmdCh0aGlzLnMucCkgKyA5O1xuICAgICAgICAgICAgdGhpcy5zID0geyBpOiAwIH07XG4gICAgICAgICAgICB0aGlzLm8gPSBuZXcgdTgoMCk7XG4gICAgICAgICAgICB0aGlzLnB1c2gobmV3IHU4KDApLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBHdW56aXA7XG59KCkpO1xuZXhwb3J0IHsgR3VuemlwIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgc2luZ2xlIG9yIG11bHRpLW1lbWJlciBHWklQIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jR3VuemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jR3VuemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJJbmZsdCxcbiAgICAgICAgICAgIGd1emUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGUsIEd1bnppcF07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBHdW56aXAoZXYuZGF0YSk7XG4gICAgICAgICAgICBzdHJtLm9ubWVtYmVyID0gZnVuY3Rpb24gKG9mZnNldCkgeyByZXR1cm4gcG9zdE1lc3NhZ2Uob2Zmc2V0KTsgfTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA5LCAwLCBmdW5jdGlvbiAob2Zmc2V0KSB7IHJldHVybiBfdGhpcy5vbm1lbWJlciAmJiBfdGhpcy5vbm1lbWJlcihvZmZzZXQpOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3VuemlwO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jR3VuemlwIH07XG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkluZmx0LFxuICAgICAgICBndXplLFxuICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3VuemlwU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihndW56aXBTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMywgY2IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGd1bnppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIHZhciBzdCA9IGd6cyhkYXRhKTtcbiAgICBpZiAoc3QgKyA4ID4gZGF0YS5sZW5ndGgpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCBnemlwIGRhdGEnKTtcbiAgICByZXR1cm4gaW5mbHQoZGF0YS5zdWJhcnJheShzdCwgLTgpLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCB8fCBuZXcgdTgoZ3psKGRhdGEpKSwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgWmxpYiBjb21wcmVzc2lvblxuICovXG52YXIgWmxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBabGliKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMuYyA9IGFkbGVyKCk7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHpsaWJiZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmxpYi5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIFpsaWIucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiAodGhpcy5vLmRpY3Rpb25hcnkgPyA2IDogMiksIGYgJiYgNCwgdGhpcy5zKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIHpsaChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDQsIHRoaXMuYy5kKCkpO1xuICAgICAgICB0aGlzLm9uZGF0YShyYXcsIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIHpsaWJiZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICogQHBhcmFtIHN5bmMgV2hldGhlciB0byBmbHVzaCB0byBhIGJ5dGUgYm91bmRhcnkuIEEgc3luYyBmbHVzaCB0YWtlcyA0LTVcbiAgICAgKiAgICAgICAgICAgICBleHRyYSBieXRlcywgYnV0IGd1YXJhbnRlZXMgYWxsIHB1c2hlZCBkYXRhIGlzIGltbWVkaWF0ZWx5XG4gICAgICogICAgICAgICAgICAgZGVjb21wcmVzc2libGUuXG4gICAgICovXG4gICAgWmxpYi5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaC5jYWxsKHRoaXMsIHN5bmMpO1xuICAgIH07XG4gICAgcmV0dXJuIFpsaWI7XG59KCkpO1xuZXhwb3J0IHsgWmxpYiB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIFpsaWIgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jWmxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY1psaWIob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICB6bGUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGUsIFpsaWJdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgWmxpYihldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCAxMCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY1psaWI7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNabGliIH07XG5leHBvcnQgZnVuY3Rpb24gemxpYihkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICB6bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bGliU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZih6bGliU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDQsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3MgZGF0YSB3aXRoIFpsaWJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIHpsaWItY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6bGliU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGEgPSBhZGxlcigpO1xuICAgIGEucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgb3B0cy5kaWN0aW9uYXJ5ID8gNiA6IDIsIDQpO1xuICAgIHJldHVybiB6bGgoZCwgb3B0cyksIHdieXRlcyhkLCBkLmxlbmd0aCAtIDQsIGEuZCgpKSwgZDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIFpsaWIgZGVjb21wcmVzc2lvblxuICovXG52YXIgVW56bGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFVuemxpYihvcHRzLCBjYikge1xuICAgICAgICBJbmZsYXRlLmNhbGwodGhpcywgb3B0cywgY2IpO1xuICAgICAgICB0aGlzLnYgPSBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSA/IDIgOiAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSB1bnpsaWJiZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgVW56bGliLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5lLmNhbGwodGhpcywgY2h1bmspO1xuICAgICAgICBpZiAodGhpcy52KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA8IDYgJiYgIWZpbmFsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMucCA9IHRoaXMucC5zdWJhcnJheSh6bHModGhpcy5wLCB0aGlzLnYgLSAxKSksIHRoaXMudiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA8IDQpXG4gICAgICAgICAgICAgICAgZXJyKDYsICdpbnZhbGlkIHpsaWIgZGF0YScpO1xuICAgICAgICAgICAgdGhpcy5wID0gdGhpcy5wLnN1YmFycmF5KDAsIC00KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWNlc3NhcnkgdG8gcHJldmVudCBUUyBmcm9tIHVzaW5nIHRoZSBjbG9zdXJlIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB3b3JrZXJpemF0aW9uIHRvIGZ1bmN0aW9uIGNvcnJlY3RseVxuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5jLmNhbGwodGhpcywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIFVuemxpYjtcbn0oKSk7XG5leHBvcnQgeyBVbnpsaWIgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBabGliIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jVW56bGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jVW56bGliKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJJbmZsdCxcbiAgICAgICAgICAgIHp1bGUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGUsIFVuemxpYl07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBVbnpsaWIoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgMTEsIDApO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNVbnpsaWI7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNVbnpsaWIgfTtcbmV4cG9ydCBmdW5jdGlvbiB1bnpsaWIoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiSW5mbHQsXG4gICAgICAgIHp1bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1bnpsaWJTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKHVuemxpYlN5bmMoZXYuZGF0YVswXSwgZ29wdChldi5kYXRhWzFdKSkpOyB9LCA1LCBjYik7XG59XG5leHBvcnQgZnVuY3Rpb24gdW56bGliU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIGluZmx0KGRhdGEuc3ViYXJyYXkoemxzKGRhdGEsIG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5KSwgLTQpLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLy8gRGVmYXVsdCBhbGdvcml0aG0gZm9yIGNvbXByZXNzaW9uICh1c2VkIGJlY2F1c2UgaGF2aW5nIGEga25vd24gb3V0cHV0IHNpemUgYWxsb3dzIGZhc3RlciBkZWNvbXByZXNzaW9uKVxuZXhwb3J0IHsgZ3ppcCBhcyBjb21wcmVzcywgQXN5bmNHemlwIGFzIEFzeW5jQ29tcHJlc3MgfTtcbmV4cG9ydCB7IGd6aXBTeW5jIGFzIGNvbXByZXNzU3luYywgR3ppcCBhcyBDb21wcmVzcyB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgRGVjb21wcmVzcyA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZWNvbXByZXNzKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMubyA9IFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYikgfHwge307XG4gICAgICAgIHRoaXMuRyA9IEd1bnppcDtcbiAgICAgICAgdGhpcy5JID0gSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gVW56bGliO1xuICAgIH1cbiAgICAvLyBpbml0IHN1YnN0cmVhbVxuICAgIC8vIG92ZXJyaWRlbiBieSBBc3luY0RlY29tcHJlc3NcbiAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnMub25kYXRhID0gZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShkYXQsIGZpbmFsKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29tcHJlc3NlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAoIXRoaXMucykge1xuICAgICAgICAgICAgaWYgKHRoaXMucCAmJiB0aGlzLnAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbi5zZXQodGhpcy5wKSwgbi5zZXQoY2h1bmssIHRoaXMucC5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMucCA9IGNodW5rO1xuICAgICAgICAgICAgaWYgKHRoaXMucC5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zID0gKHRoaXMucFswXSA9PSAzMSAmJiB0aGlzLnBbMV0gPT0gMTM5ICYmIHRoaXMucFsyXSA9PSA4KVxuICAgICAgICAgICAgICAgICAgICA/IG5ldyB0aGlzLkcodGhpcy5vKVxuICAgICAgICAgICAgICAgICAgICA6ICgodGhpcy5wWzBdICYgMTUpICE9IDggfHwgKHRoaXMucFswXSA+PiA0KSA+IDcgfHwgKCh0aGlzLnBbMF0gPDwgOCB8IHRoaXMucFsxXSkgJSAzMSkpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyB0aGlzLkkodGhpcy5vKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgdGhpcy5aKHRoaXMubyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zLnB1c2godGhpcy5wLCBmaW5hbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnMucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIERlY29tcHJlc3M7XG59KCkpO1xuZXhwb3J0IHsgRGVjb21wcmVzcyB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIEdaSVAsIFpsaWIsIG9yIHJhdyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jRGVjb21wcmVzcyA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0RlY29tcHJlc3Mob3B0cywgY2IpIHtcbiAgICAgICAgRGVjb21wcmVzcy5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICAgICAgdGhpcy5xdWV1ZWRTaXplID0gMDtcbiAgICAgICAgdGhpcy5HID0gQXN5bmNHdW56aXA7XG4gICAgICAgIHRoaXMuSSA9IEFzeW5jSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gQXN5bmNVbnpsaWI7XG4gICAgfVxuICAgIEFzeW5jRGVjb21wcmVzcy5wcm90b3R5cGUuaSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5zLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnMub25kcmFpbiA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgICAgICBfdGhpcy5xdWV1ZWRTaXplIC09IHNpemU7XG4gICAgICAgICAgICBpZiAoX3RoaXMub25kcmFpbilcbiAgICAgICAgICAgICAgICBfdGhpcy5vbmRyYWluKHNpemUpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVjb21wcmVzc2VkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEFzeW5jRGVjb21wcmVzcy5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5xdWV1ZWRTaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgRGVjb21wcmVzcy5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNEZWNvbXByZXNzO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jRGVjb21wcmVzcyB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcHJlc3MoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gKGRhdGFbMF0gPT0gMzEgJiYgZGF0YVsxXSA9PSAxMzkgJiYgZGF0YVsyXSA9PSA4KVxuICAgICAgICA/IGd1bnppcChkYXRhLCBvcHRzLCBjYilcbiAgICAgICAgOiAoKGRhdGFbMF0gJiAxNSkgIT0gOCB8fCAoZGF0YVswXSA+PiA0KSA+IDcgfHwgKChkYXRhWzBdIDw8IDggfCBkYXRhWzFdKSAlIDMxKSlcbiAgICAgICAgICAgID8gaW5mbGF0ZShkYXRhLCBvcHRzLCBjYilcbiAgICAgICAgICAgIDogdW56bGliKGRhdGEsIG9wdHMsIGNiKTtcbn1cbi8qKlxuICogRXhwYW5kcyBjb21wcmVzc2VkIEdaSVAsIFpsaWIsIG9yIHJhdyBERUZMQVRFIGRhdGEsIGF1dG9tYXRpY2FsbHkgZGV0ZWN0aW5nIHRoZSBmb3JtYXRcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGRlY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBkZWNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21wcmVzc1N5bmMoZGF0YSwgb3B0cykge1xuICAgIHJldHVybiAoZGF0YVswXSA9PSAzMSAmJiBkYXRhWzFdID09IDEzOSAmJiBkYXRhWzJdID09IDgpXG4gICAgICAgID8gZ3VuemlwU3luYyhkYXRhLCBvcHRzKVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlU3luYyhkYXRhLCBvcHRzKVxuICAgICAgICAgICAgOiB1bnpsaWJTeW5jKGRhdGEsIG9wdHMpO1xufVxuLy8gZmxhdHRlbiBhIGRpcmVjdG9yeSBzdHJ1Y3R1cmVcbnZhciBmbHRuID0gZnVuY3Rpb24gKGQsIHAsIHQsIG8pIHtcbiAgICBmb3IgKHZhciBrIGluIGQpIHtcbiAgICAgICAgdmFyIHZhbCA9IGRba10sIG4gPSBwICsgaywgb3AgPSBvO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKVxuICAgICAgICAgICAgb3AgPSBtcmcobywgdmFsWzFdKSwgdmFsID0gdmFsWzBdO1xuICAgICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCkpXG4gICAgICAgICAgICB0W25dID0gW3ZhbCwgb3BdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRbbiArPSAnLyddID0gW25ldyB1OCgwKSwgb3BdO1xuICAgICAgICAgICAgZmx0bih2YWwsIG4sIHQsIG8pO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vIHRleHQgZW5jb2RlclxudmFyIHRlID0gdHlwZW9mIFRleHRFbmNvZGVyICE9ICd1bmRlZmluZWQnICYmIC8qI19fUFVSRV9fKi8gbmV3IFRleHRFbmNvZGVyKCk7XG4vLyB0ZXh0IGRlY29kZXJcbnZhciB0ZCA9IHR5cGVvZiBUZXh0RGVjb2RlciAhPSAndW5kZWZpbmVkJyAmJiAvKiNfX1BVUkVfXyovIG5ldyBUZXh0RGVjb2RlcigpO1xuLy8gdGV4dCBkZWNvZGVyIHN0cmVhbVxudmFyIHRkcyA9IDA7XG50cnkge1xuICAgIHRkLmRlY29kZShldCwgeyBzdHJlYW06IHRydWUgfSk7XG4gICAgdGRzID0gMTtcbn1cbmNhdGNoIChlKSB7IH1cbi8vIGRlY29kZSBVVEY4XG52YXIgZHV0ZjggPSBmdW5jdGlvbiAoZCkge1xuICAgIGZvciAodmFyIHIgPSAnJywgaSA9IDA7Oykge1xuICAgICAgICB2YXIgYyA9IGRbaSsrXTtcbiAgICAgICAgdmFyIGViID0gKGMgPiAxMjcpICsgKGMgPiAyMjMpICsgKGMgPiAyMzkpO1xuICAgICAgICBpZiAoaSArIGViID4gZC5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4geyBzOiByLCByOiBzbGMoZCwgaSAtIDEpIH07XG4gICAgICAgIGlmICghZWIpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgIGVsc2UgaWYgKGViID09IDMpIHtcbiAgICAgICAgICAgIGMgPSAoKGMgJiAxNSkgPDwgMTggfCAoZFtpKytdICYgNjMpIDw8IDEyIHwgKGRbaSsrXSAmIDYzKSA8PCA2IHwgKGRbaSsrXSAmIDYzKSkgLSA2NTUzNixcbiAgICAgICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTYgfCAoYyA+PiAxMCksIDU2MzIwIHwgKGMgJiAxMDIzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWIgJiAxKVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgMzEpIDw8IDYgfCAoZFtpKytdICYgNjMpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgMTUpIDw8IDEyIHwgKGRbaSsrXSAmIDYzKSA8PCA2IHwgKGRbaSsrXSAmIDYzKSk7XG4gICAgfVxufTtcbi8qKlxuICogU3RyZWFtaW5nIFVURi04IGRlY29kaW5nXG4gKi9cbnZhciBEZWNvZGVVVEY4ID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBVVEYtOCBkZWNvZGluZyBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBkZWNvZGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gRGVjb2RlVVRGOChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICBpZiAodGRzKVxuICAgICAgICAgICAgdGhpcy50ID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucCA9IGV0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWNvZGVkIGZyb20gVVRGLTggYmluYXJ5XG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlY29kZVVURjgucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGZpbmFsID0gISFmaW5hbDtcbiAgICAgICAgaWYgKHRoaXMudCkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEodGhpcy50LmRlY29kZShjaHVuaywgeyBzdHJlYW06IHRydWUgfSksIGZpbmFsKTtcbiAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnQuZGVjb2RlKCkubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgICAgICAgICAgdGhpcy50ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMucClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdmFyIGRhdCA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgZGF0LnNldCh0aGlzLnApO1xuICAgICAgICBkYXQuc2V0KGNodW5rLCB0aGlzLnAubGVuZ3RoKTtcbiAgICAgICAgdmFyIF9hID0gZHV0ZjgoZGF0KSwgcyA9IF9hLnMsIHIgPSBfYS5yO1xuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIGlmIChyLmxlbmd0aClcbiAgICAgICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucCA9IHI7XG4gICAgICAgIHRoaXMub25kYXRhKHMsIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBEZWNvZGVVVEY4O1xufSgpKTtcbmV4cG9ydCB7IERlY29kZVVURjggfTtcbi8qKlxuICogU3RyZWFtaW5nIFVURi04IGVuY29kaW5nXG4gKi9cbnZhciBFbmNvZGVVVEY4ID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBVVEYtOCBkZWNvZGluZyBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBlbmNvZGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gRW5jb2RlVVRGOChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBlbmNvZGVkIHRvIFVURi04XG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBzdHJpbmcgZGF0YSB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEVuY29kZVVURjgucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHRoaXMub25kYXRhKHN0clRvVTgoY2h1bmspLCB0aGlzLmQgPSBmaW5hbCB8fCBmYWxzZSk7XG4gICAgfTtcbiAgICByZXR1cm4gRW5jb2RlVVRGODtcbn0oKSk7XG5leHBvcnQgeyBFbmNvZGVVVEY4IH07XG4vKipcbiAqIENvbnZlcnRzIGEgc3RyaW5nIGludG8gYSBVaW50OEFycmF5IGZvciB1c2Ugd2l0aCBjb21wcmVzc2lvbi9kZWNvbXByZXNzaW9uIG1ldGhvZHNcbiAqIEBwYXJhbSBzdHIgVGhlIHN0cmluZyB0byBlbmNvZGVcbiAqIEBwYXJhbSBsYXRpbjEgV2hldGhlciBvciBub3QgdG8gaW50ZXJwcmV0IHRoZSBkYXRhIGFzIExhdGluLTEuIFRoaXMgc2hvdWxkXG4gKiAgICAgICAgICAgICAgIG5vdCBuZWVkIHRvIGJlIHRydWUgdW5sZXNzIGRlY29kaW5nIGEgYmluYXJ5IHN0cmluZy5cbiAqIEByZXR1cm5zIFRoZSBzdHJpbmcgZW5jb2RlZCBpbiBVVEYtOC9MYXRpbi0xIGJpbmFyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyVG9VOChzdHIsIGxhdGluMSkge1xuICAgIGlmIChsYXRpbjEpIHtcbiAgICAgICAgdmFyIGFyXzEgPSBuZXcgdTgoc3RyLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgYXJfMVtpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICByZXR1cm4gYXJfMTtcbiAgICB9XG4gICAgaWYgKHRlKVxuICAgICAgICByZXR1cm4gdGUuZW5jb2RlKHN0cik7XG4gICAgdmFyIGwgPSBzdHIubGVuZ3RoO1xuICAgIHZhciBhciA9IG5ldyB1OChzdHIubGVuZ3RoICsgKHN0ci5sZW5ndGggPj4gMSkpO1xuICAgIHZhciBhaSA9IDA7XG4gICAgdmFyIHcgPSBmdW5jdGlvbiAodikgeyBhclthaSsrXSA9IHY7IH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKGFpICsgNSA+IGFyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgoYWkgKyA4ICsgKChsIC0gaSkgPDwgMSkpO1xuICAgICAgICAgICAgbi5zZXQoYXIpO1xuICAgICAgICAgICAgYXIgPSBuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMTI4IHx8IGxhdGluMSlcbiAgICAgICAgICAgIHcoYyk7XG4gICAgICAgIGVsc2UgaWYgKGMgPCAyMDQ4KVxuICAgICAgICAgICAgdygxOTIgfCAoYyA+PiA2KSksIHcoMTI4IHwgKGMgJiA2MykpO1xuICAgICAgICBlbHNlIGlmIChjID4gNTUyOTUgJiYgYyA8IDU3MzQ0KVxuICAgICAgICAgICAgYyA9IDY1NTM2ICsgKGMgJiAxMDIzIDw8IDEwKSB8IChzdHIuY2hhckNvZGVBdCgrK2kpICYgMTAyMyksXG4gICAgICAgICAgICAgICAgdygyNDAgfCAoYyA+PiAxOCkpLCB3KDEyOCB8ICgoYyA+PiAxMikgJiA2MykpLCB3KDEyOCB8ICgoYyA+PiA2KSAmIDYzKSksIHcoMTI4IHwgKGMgJiA2MykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3KDIyNCB8IChjID4+IDEyKSksIHcoMTI4IHwgKChjID4+IDYpICYgNjMpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgfVxuICAgIHJldHVybiBzbGMoYXIsIDAsIGFpKTtcbn1cbi8qKlxuICogQ29udmVydHMgYSBVaW50OEFycmF5IHRvIGEgc3RyaW5nXG4gKiBAcGFyYW0gZGF0IFRoZSBkYXRhIHRvIGRlY29kZSB0byBzdHJpbmdcbiAqIEBwYXJhbSBsYXRpbjEgV2hldGhlciBvciBub3QgdG8gaW50ZXJwcmV0IHRoZSBkYXRhIGFzIExhdGluLTEuIFRoaXMgc2hvdWxkXG4gKiAgICAgICAgICAgICAgIG5vdCBuZWVkIHRvIGJlIHRydWUgdW5sZXNzIGVuY29kaW5nIHRvIGJpbmFyeSBzdHJpbmcuXG4gKiBAcmV0dXJucyBUaGUgb3JpZ2luYWwgVVRGLTgvTGF0aW4tMSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0ckZyb21VOChkYXQsIGxhdGluMSkge1xuICAgIGlmIChsYXRpbjEpIHtcbiAgICAgICAgdmFyIHIgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXQubGVuZ3RoOyBpICs9IDE2Mzg0KVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGRhdC5zdWJhcnJheShpLCBpICsgMTYzODQpKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRkKSB7XG4gICAgICAgIHJldHVybiB0ZC5kZWNvZGUoZGF0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBfYSA9IGR1dGY4KGRhdCksIHMgPSBfYS5zLCByID0gX2EucjtcbiAgICAgICAgaWYgKHIubGVuZ3RoKVxuICAgICAgICAgICAgZXJyKDgpO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG59XG47XG4vLyBkZWZsYXRlIGJpdCBmbGFnXG52YXIgZGJmID0gZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGwgPT0gMSA/IDMgOiBsIDwgNiA/IDIgOiBsID09IDkgPyAxIDogMDsgfTtcbi8vIHNraXAgbG9jYWwgemlwIGhlYWRlclxudmFyIHNsemggPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gYiArIDMwICsgYjIoZCwgYiArIDI2KSArIGIyKGQsIGIgKyAyOCk7IH07XG4vLyByZWFkIHppcCBoZWFkZXJcbnZhciB6aCA9IGZ1bmN0aW9uIChkLCBiLCB6KSB7XG4gICAgdmFyIGZubCA9IGIyKGQsIGIgKyAyOCksIGVmbCA9IGIyKGQsIGIgKyAzMCksIGZuID0gc3RyRnJvbVU4KGQuc3ViYXJyYXkoYiArIDQ2LCBiICsgNDYgKyBmbmwpLCAhKGIyKGQsIGIgKyA4KSAmIDIwNDgpKSwgZXMgPSBiICsgNDYgKyBmbmw7XG4gICAgdmFyIF9hID0gejY0aHMoZCwgZXMsIGVmbCwgeiwgYjQoZCwgYiArIDIwKSwgYjQoZCwgYiArIDI0KSwgYjQoZCwgYiArIDQyKSksIHNjID0gX2FbMF0sIHN1ID0gX2FbMV0sIG9mZiA9IF9hWzJdO1xuICAgIHJldHVybiBbYjIoZCwgYiArIDEwKSwgc2MsIHN1LCBmbiwgZXMgKyBlZmwgKyBiMihkLCBiICsgMzIpLCBvZmZdO1xufTtcbi8vIHJlYWQgemlwNjQgaGVhZGVyIHNpemVzXG52YXIgejY0aHMgPSBmdW5jdGlvbiAoZCwgYiwgbCwgeiwgc2MsIHN1LCBvZmYpIHtcbiAgICB2YXIgbnNjID0gc2MgPT0gNDI5NDk2NzI5NSwgbnN1ID0gc3UgPT0gNDI5NDk2NzI5NSwgbm9mZiA9IG9mZiA9PSA0Mjk0OTY3Mjk1LCBlID0gYiArIGw7XG4gICAgdmFyIG5mID0gbnNjICsgbnN1ICsgbm9mZjtcbiAgICBpZiAoeiAmJiBuZikge1xuICAgICAgICBmb3IgKDsgYiArIDQgPCBlOyBiICs9IDQgKyBiMihkLCBiICsgMikpIHtcbiAgICAgICAgICAgIGlmIChiMihkLCBiKSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgbnNjID8gYjgoZCwgYiArIDQgKyA4ICogbnN1KSA6IHNjLFxuICAgICAgICAgICAgICAgICAgICBuc3UgPyBiOChkLCBiICsgNCkgOiBzdSxcbiAgICAgICAgICAgICAgICAgICAgbm9mZiA/IGI4KGQsIGIgKyA0ICsgOCAqIChuc3UgKyBuc2MpKSA6IG9mZixcbiAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8geiA9PSAyIGZvciB1bmtub3duIHdoZXRoZXIgb3Igbm90IHppcDY0XG4gICAgICAgIGlmICh6IDwgMilcbiAgICAgICAgICAgIGVycigxMyk7XG4gICAgfVxuICAgIHJldHVybiBbc2MsIHN1LCBvZmYsIDBdO1xufTtcbi8vIGV4dHJhIGZpZWxkIGxlbmd0aFxudmFyIGV4ZmwgPSBmdW5jdGlvbiAoZXgpIHtcbiAgICB2YXIgbGUgPSAwO1xuICAgIGlmIChleCkge1xuICAgICAgICBmb3IgKHZhciBrIGluIGV4KSB7XG4gICAgICAgICAgICB2YXIgbCA9IGV4W2tdLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChsID4gNjU1MzUpXG4gICAgICAgICAgICAgICAgZXJyKDkpO1xuICAgICAgICAgICAgbGUgKz0gbCArIDQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxlO1xufTtcbi8vIHdyaXRlIHppcCBoZWFkZXJcbnZhciB3emggPSBmdW5jdGlvbiAoZCwgYiwgZiwgZm4sIHUsIGMsIGNlLCBjbykge1xuICAgIHZhciBmbCA9IGZuLmxlbmd0aCwgZXggPSBmLmV4dHJhLCBjb2wgPSBjbyAmJiBjby5sZW5ndGg7XG4gICAgdmFyIGV4bCA9IGV4ZmwoZXgpO1xuICAgIHdieXRlcyhkLCBiLCBjZSAhPSBudWxsID8gMHgyMDE0QjUwIDogMHg0MDM0QjUwKSwgYiArPSA0O1xuICAgIGlmIChjZSAhPSBudWxsKVxuICAgICAgICBkW2IrK10gPSAyMCwgZFtiKytdID0gZi5vcztcbiAgICBkW2JdID0gMjAsIGIgKz0gMjsgLy8gc3BlYyBjb21wbGlhbmNlPyB3aGF0J3MgdGhhdD9cbiAgICBkW2IrK10gPSAoZi5mbGFnIDw8IDEpIHwgKGMgPCAwICYmIDgpLCBkW2IrK10gPSB1ICYmIDg7XG4gICAgZFtiKytdID0gZi5jb21wcmVzc2lvbiAmIDI1NSwgZFtiKytdID0gZi5jb21wcmVzc2lvbiA+PiA4O1xuICAgIHZhciBkdCA9IG5ldyBEYXRlKGYubXRpbWUgPT0gbnVsbCA/IERhdGUubm93KCkgOiBmLm10aW1lKSwgeSA9IGR0LmdldEZ1bGxZZWFyKCkgLSAxOTgwO1xuICAgIGlmICh5IDwgMCB8fCB5ID4gMTE5KVxuICAgICAgICBlcnIoMTApO1xuICAgIHdieXRlcyhkLCBiLCAoeSA8PCAyNSkgfCAoKGR0LmdldE1vbnRoKCkgKyAxKSA8PCAyMSkgfCAoZHQuZ2V0RGF0ZSgpIDw8IDE2KSB8IChkdC5nZXRIb3VycygpIDw8IDExKSB8IChkdC5nZXRNaW51dGVzKCkgPDwgNSkgfCAoZHQuZ2V0U2Vjb25kcygpID4+IDEpKSwgYiArPSA0O1xuICAgIGlmIChjICE9IC0xKSB7XG4gICAgICAgIHdieXRlcyhkLCBiLCBmLmNyYyk7XG4gICAgICAgIHdieXRlcyhkLCBiICsgNCwgYyA8IDAgPyAtYyAtIDIgOiBjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA4LCBmLnNpemUpO1xuICAgIH1cbiAgICB3Ynl0ZXMoZCwgYiArIDEyLCBmbCk7XG4gICAgd2J5dGVzKGQsIGIgKyAxNCwgZXhsKSwgYiArPSAxNjtcbiAgICBpZiAoY2UgIT0gbnVsbCkge1xuICAgICAgICB3Ynl0ZXMoZCwgYiwgY29sKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA2LCBmLmF0dHJzKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyAxMCwgY2UpLCBiICs9IDE0O1xuICAgIH1cbiAgICBkLnNldChmbiwgYik7XG4gICAgYiArPSBmbDtcbiAgICBpZiAoZXhsKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBleGYgPSBleFtrXSwgbCA9IGV4Zi5sZW5ndGg7XG4gICAgICAgICAgICB3Ynl0ZXMoZCwgYiwgK2spO1xuICAgICAgICAgICAgd2J5dGVzKGQsIGIgKyAyLCBsKTtcbiAgICAgICAgICAgIGQuc2V0KGV4ZiwgYiArIDQpLCBiICs9IDQgKyBsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb2wpXG4gICAgICAgIGQuc2V0KGNvLCBiKSwgYiArPSBjb2w7XG4gICAgcmV0dXJuIGI7XG59O1xuLy8gd3JpdGUgemlwIGZvb3RlciAoZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5KVxudmFyIHd6ZiA9IGZ1bmN0aW9uIChvLCBiLCBjLCBkLCBlKSB7XG4gICAgd2J5dGVzKG8sIGIsIDB4NjA1NEI1MCk7IC8vIHNraXAgZGlza1xuICAgIHdieXRlcyhvLCBiICsgOCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMiwgZCk7XG4gICAgd2J5dGVzKG8sIGIgKyAxNiwgZSk7XG59O1xuLyoqXG4gKiBBIHBhc3MtdGhyb3VnaCBzdHJlYW0gdG8ga2VlcCBkYXRhIHVuY29tcHJlc3NlZCBpbiBhIFpJUCBhcmNoaXZlLlxuICovXG52YXIgWmlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHBhc3MtdGhyb3VnaCBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwUGFzc1Rocm91Z2goZmlsZW5hbWUpIHtcbiAgICAgICAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xuICAgICAgICB0aGlzLmMgPSBjcmMoKTtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBhIGNodW5rIGFuZCBwdXNoZXMgdG8gdGhlIG91dHB1dCBzdHJlYW0uIFlvdSBjYW4gb3ZlcnJpZGUgdGhpc1xuICAgICAqIG1ldGhvZCBpbiBhIHN1YmNsYXNzIGZvciBjdXN0b20gYmVoYXZpb3IsIGJ1dCBieSBkZWZhdWx0IHRoaXMgcGFzc2VzXG4gICAgICogdGhlIGRhdGEgdGhyb3VnaC4gWW91IG11c3QgY2FsbCB0aGlzLm9uZGF0YShlcnIsIGNodW5rLCBmaW5hbCkgYXQgc29tZVxuICAgICAqIHBvaW50IGluIHRoaXMgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHJvY2Vzc1xuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGFkZGVkLiBJZiB5b3UgYXJlIHN1YmNsYXNzaW5nIHRoaXMgd2l0aCBhIGN1c3RvbVxuICAgICAqIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgbm90ZSB0aGF0IHlvdSBtdXN0IHB1c2ggZGF0YSBmcm9tIHRoZSBzb3VyY2VcbiAgICAgKiBmaWxlIG9ubHksIHByZS1jb21wcmVzc2lvbi5cbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIHRoaXMuYy5wKGNodW5rKTtcbiAgICAgICAgdGhpcy5zaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgaWYgKGZpbmFsKVxuICAgICAgICAgICAgdGhpcy5jcmMgPSB0aGlzLmMuZCgpO1xuICAgICAgICAvLyB3ZSBzaG91bGRuJ3QgcmVhbGx5IGRvIHRoaXMgY2FzdCwgYnV0IHByb3Blcmx5IGhhbmRsaW5nIEFycmF5QnVmZmVyTGlrZVxuICAgICAgICAvLyBtYWtlcyB0aGUgQVBJIHVuZXJnb25vbWljIHdpdGggQnVmZmVyXG4gICAgICAgIHRoaXMucHJvY2VzcyhjaHVuaywgZmluYWwgfHwgZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIFppcFBhc3NUaHJvdWdoO1xufSgpKTtcbmV4cG9ydCB7IFppcFBhc3NUaHJvdWdoIH07XG4vLyBJIGRvbid0IGV4dGVuZCBiZWNhdXNlIFR5cGVTY3JpcHQgZXh0ZW5zaW9uIGFkZHMgMWtCIG9mIHJ1bnRpbWUgYmxvYXRcbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlcy4gUHJlZmVyIHVzaW5nIEFzeW5jWmlwRGVmbGF0ZVxuICogZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICovXG52YXIgWmlwRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgREVGTEFURSBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBaaXBEZWZsYXRlKGZpbGVuYW1lLCBvcHRzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghb3B0cylcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgWmlwUGFzc1Rocm91Z2guY2FsbCh0aGlzLCBmaWxlbmFtZSk7XG4gICAgICAgIHRoaXMuZCA9IG5ldyBEZWZsYXRlKG9wdHMsIGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uID0gODtcbiAgICAgICAgdGhpcy5mbGFnID0gZGJmKG9wdHMubGV2ZWwpO1xuICAgIH1cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5kLnB1c2goY2h1bmssIGZpbmFsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZSwgbnVsbCwgZmluYWwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBaaXBEZWZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBBc3luY1ppcERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgREVGTEFURSBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBBc3luY1ppcERlZmxhdGUoZmlsZW5hbWUsIG9wdHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCFvcHRzKVxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5jYWxsKHRoaXMsIGZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5kID0gbmV3IEFzeW5jRGVmbGF0ZShvcHRzLCBmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEoZXJyLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29tcHJlc3Npb24gPSA4O1xuICAgICAgICB0aGlzLmZsYWcgPSBkYmYob3B0cy5sZXZlbCk7XG4gICAgICAgIHRoaXMudGVybWluYXRlID0gdGhpcy5kLnRlcm1pbmF0ZTtcbiAgICB9XG4gICAgQXN5bmNaaXBEZWZsYXRlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmQucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVmbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgQXN5bmNaaXBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNaaXBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jWmlwRGVmbGF0ZSB9O1xuLy8gVE9ETzogQmV0dGVyIHRyZWUgc2hha2luZ1xuLyoqXG4gKiBBIHppcHBhYmxlIGFyY2hpdmUgdG8gd2hpY2ggZmlsZXMgY2FuIGluY3JlbWVudGFsbHkgYmUgYWRkZWRcbiAqL1xudmFyIFppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IFpJUCBhcmNoaXZlIHRvIHdoaWNoIGZpbGVzIGNhbiBiZSBhZGRlZFxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGZvciB0aGUgZ2VuZXJhdGVkIFpJUCBhcmNoaXZlXG4gICAgICogICAgICAgICAgIGlzIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFppcChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB0aGlzLnUgPSBbXTtcbiAgICAgICAgdGhpcy5kID0gMTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZpbGUgdG8gdGhlIFpJUCBhcmNoaXZlXG4gICAgICogQHBhcmFtIGZpbGUgVGhlIGZpbGUgc3RyZWFtIHRvIGFkZFxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgLy8gZmluaXNoaW5nIG9yIGZpbmlzaGVkXG4gICAgICAgIGlmICh0aGlzLmQgJiAyKVxuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZXJyKDQgKyAodGhpcy5kICYgMSkgKiA4LCAwLCAxKSwgbnVsbCwgZmFsc2UpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBmID0gc3RyVG9VOChmaWxlLmZpbGVuYW1lKSwgZmxfMSA9IGYubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGNvbSA9IGZpbGUuY29tbWVudCwgbyA9IGNvbSAmJiBzdHJUb1U4KGNvbSk7XG4gICAgICAgICAgICB2YXIgdSA9IGZsXzEgIT0gZmlsZS5maWxlbmFtZS5sZW5ndGggfHwgKG8gJiYgKGNvbS5sZW5ndGggIT0gby5sZW5ndGgpKTtcbiAgICAgICAgICAgIHZhciBobF8xID0gZmxfMSArIGV4ZmwoZmlsZS5leHRyYSkgKyAzMDtcbiAgICAgICAgICAgIGlmIChmbF8xID4gNjU1MzUpXG4gICAgICAgICAgICAgICAgdGhpcy5vbmRhdGEoZXJyKDExLCAwLCAxKSwgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IG5ldyB1OChobF8xKTtcbiAgICAgICAgICAgIHd6aChoZWFkZXIsIDAsIGZpbGUsIGYsIHUsIC0xKTtcbiAgICAgICAgICAgIHZhciBjaGtzXzEgPSBbaGVhZGVyXTtcbiAgICAgICAgICAgIHZhciBwQWxsXzEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjaGtzXzIgPSBjaGtzXzE7IF9pIDwgY2hrc18yLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hrID0gY2hrc18yW19pXTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMub25kYXRhKG51bGwsIGNoaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjaGtzXzEgPSBbXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdHJfMSA9IHRoaXMuZDtcbiAgICAgICAgICAgIHRoaXMuZCA9IDA7XG4gICAgICAgICAgICB2YXIgaW5kXzEgPSB0aGlzLnUubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHVmXzEgPSBtcmcoZmlsZSwge1xuICAgICAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICAgICAgdTogdSxcbiAgICAgICAgICAgICAgICBvOiBvLFxuICAgICAgICAgICAgICAgIHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUudGVybWluYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcEFsbF8xKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cl8xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnh0ID0gX3RoaXMudVtpbmRfMSArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG54dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQucigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmQgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyXzEgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGNsXzEgPSAwO1xuICAgICAgICAgICAgZmlsZS5vbmRhdGEgPSBmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEoZXJyLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbF8xICs9IGRhdC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNoa3NfMS5wdXNoKGRhdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRkID0gbmV3IHU4KDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgMCwgMHg4MDc0QjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgNCwgZmlsZS5jcmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCA4LCBjbF8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgMTIsIGZpbGUuc2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGtzXzEucHVzaChkZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1Zl8xLmMgPSBjbF8xLCB1Zl8xLmIgPSBobF8xICsgY2xfMSArIDE2LCB1Zl8xLmNyYyA9IGZpbGUuY3JjLCB1Zl8xLnNpemUgPSBmaWxlLnNpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1Zl8xLnIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyXzEgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRyXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICBwQWxsXzEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy51LnB1c2godWZfMSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIHByb2Nlc3Mgb2YgYWRkaW5nIGZpbGVzIGFuZCBwcmVwYXJlcyB0byBlbWl0IHRoZSBmaW5hbCBjaHVua3MuXG4gICAgICogVGhpcyAqbXVzdCogYmUgY2FsbGVkIGFmdGVyIGFkZGluZyBhbGwgZGVzaXJlZCBmaWxlcyBmb3IgdGhlIHJlc3VsdGluZ1xuICAgICAqIFpJUCBmaWxlIHRvIHdvcmsgcHJvcGVybHkuXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLmQgJiAyKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlcnIoNCArICh0aGlzLmQgJiAxKSAqIDgsIDAsIDEpLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kKVxuICAgICAgICAgICAgdGhpcy5lKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMudS5wdXNoKHtcbiAgICAgICAgICAgICAgICByOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghKF90aGlzLmQgJiAxKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudS5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5lKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0OiBmdW5jdGlvbiAoKSB7IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmQgPSAzO1xuICAgIH07XG4gICAgWmlwLnByb3RvdHlwZS5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYnQgPSAwLCBsID0gMCwgdGwgPSAwO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy51OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfYVtfaV07XG4gICAgICAgICAgICB0bCArPSA0NiArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpICsgKGYubyA/IGYuby5sZW5ndGggOiAwKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3V0ID0gbmV3IHU4KHRsICsgMjIpO1xuICAgICAgICBmb3IgKHZhciBfYiA9IDAsIF9jID0gdGhpcy51OyBfYiA8IF9jLmxlbmd0aDsgX2IrKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfY1tfYl07XG4gICAgICAgICAgICB3emgob3V0LCBidCwgZiwgZi5mLCBmLnUsIC1mLmMgLSAyLCBsLCBmLm8pO1xuICAgICAgICAgICAgYnQgKz0gNDYgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKSArIChmLm8gPyBmLm8ubGVuZ3RoIDogMCksIGwgKz0gZi5iO1xuICAgICAgICB9XG4gICAgICAgIHd6ZihvdXQsIGJ0LCB0aGlzLnUubGVuZ3RoLCB0bCwgbCk7XG4gICAgICAgIHRoaXMub25kYXRhKG51bGwsIG91dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZCA9IDI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBIG1ldGhvZCB0byB0ZXJtaW5hdGUgYW55IGludGVybmFsIHdvcmtlcnMgdXNlZCBieSB0aGUgc3RyZWFtLiBTdWJzZXF1ZW50XG4gICAgICogY2FsbHMgdG8gYWRkKCkgd2lsbCBmYWlsLlxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy51OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfYVtfaV07XG4gICAgICAgICAgICBmLnQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmQgPSAyO1xuICAgIH07XG4gICAgcmV0dXJuIFppcDtcbn0oKSk7XG5leHBvcnQgeyBaaXAgfTtcbmV4cG9ydCBmdW5jdGlvbiB6aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICB2YXIgciA9IHt9O1xuICAgIGZsdG4oZGF0YSwgJycsIHIsIG9wdHMpO1xuICAgIHZhciBrID0gT2JqZWN0LmtleXMocik7XG4gICAgdmFyIGxmdCA9IGsubGVuZ3RoLCBvID0gMCwgdG90ID0gMDtcbiAgICB2YXIgc2xmdCA9IGxmdCwgZmlsZXMgPSBuZXcgQXJyYXkobGZ0KTtcbiAgICB2YXIgdGVybSA9IFtdO1xuICAgIHZhciB0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlcm0ubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICB0ZXJtW2ldKCk7XG4gICAgfTtcbiAgICB2YXIgY2JkID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgbXQoZnVuY3Rpb24gKCkgeyBjYihhLCBiKTsgfSk7XG4gICAgfTtcbiAgICBtdChmdW5jdGlvbiAoKSB7IGNiZCA9IGNiOyB9KTtcbiAgICB2YXIgY2JmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3V0ID0gbmV3IHU4KHRvdCArIDIyKSwgb2UgPSBvLCBjZGwgPSB0b3QgLSBvO1xuICAgICAgICB0b3QgPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsZnQ7ICsraSkge1xuICAgICAgICAgICAgdmFyIGYgPSBmaWxlc1tpXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIGwgPSBmLmMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHd6aChvdXQsIHRvdCwgZiwgZi5mLCBmLnUsIGwpO1xuICAgICAgICAgICAgICAgIHZhciBiYWRkID0gMzAgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKTtcbiAgICAgICAgICAgICAgICB2YXIgbG9jID0gdG90ICsgYmFkZDtcbiAgICAgICAgICAgICAgICBvdXQuc2V0KGYuYywgbG9jKTtcbiAgICAgICAgICAgICAgICB3emgob3V0LCBvLCBmLCBmLmYsIGYudSwgbCwgdG90LCBmLm0pLCBvICs9IDE2ICsgYmFkZCArIChmLm0gPyBmLm0ubGVuZ3RoIDogMCksIHRvdCA9IGxvYyArIGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYmQoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd3pmKG91dCwgbywgZmlsZXMubGVuZ3RoLCBjZGwsIG9lKTtcbiAgICAgICAgY2JkKG51bGwsIG91dCk7XG4gICAgfTtcbiAgICBpZiAoIWxmdClcbiAgICAgICAgY2JmKCk7XG4gICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgZm4gPSBrW2ldO1xuICAgICAgICB2YXIgX2EgPSByW2ZuXSwgZmlsZSA9IF9hWzBdLCBwID0gX2FbMV07XG4gICAgICAgIHZhciBjID0gY3JjKCksIHNpemUgPSBmaWxlLmxlbmd0aDtcbiAgICAgICAgYy5wKGZpbGUpO1xuICAgICAgICB2YXIgZiA9IHN0clRvVTgoZm4pLCBzID0gZi5sZW5ndGg7XG4gICAgICAgIHZhciBjb20gPSBwLmNvbW1lbnQsIG0gPSBjb20gJiYgc3RyVG9VOChjb20pLCBtcyA9IG0gJiYgbS5sZW5ndGg7XG4gICAgICAgIHZhciBleGwgPSBleGZsKHAuZXh0cmEpO1xuICAgICAgICB2YXIgY29tcHJlc3Npb24gPSBwLmxldmVsID09IDAgPyAwIDogODtcbiAgICAgICAgdmFyIGNibCA9IGZ1bmN0aW9uIChlLCBkKSB7XG4gICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgIHRBbGwoKTtcbiAgICAgICAgICAgICAgICBjYmQoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbCA9IGQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZpbGVzW2ldID0gbXJnKHAsIHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgY3JjOiBjLmQoKSxcbiAgICAgICAgICAgICAgICAgICAgYzogZCxcbiAgICAgICAgICAgICAgICAgICAgZjogZixcbiAgICAgICAgICAgICAgICAgICAgbTogbSxcbiAgICAgICAgICAgICAgICAgICAgdTogcyAhPSBmbi5sZW5ndGggfHwgKG0gJiYgKGNvbS5sZW5ndGggIT0gbXMpKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcHJlc3Npb246IGNvbXByZXNzaW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbyArPSAzMCArIHMgKyBleGwgKyBsO1xuICAgICAgICAgICAgICAgIHRvdCArPSA3NiArIDIgKiAocyArIGV4bCkgKyAobXMgfHwgMCkgKyBsO1xuICAgICAgICAgICAgICAgIGlmICghLS1sZnQpXG4gICAgICAgICAgICAgICAgICAgIGNiZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAocyA+IDY1NTM1KVxuICAgICAgICAgICAgY2JsKGVycigxMSwgMCwgMSksIG51bGwpO1xuICAgICAgICBpZiAoIWNvbXByZXNzaW9uKVxuICAgICAgICAgICAgY2JsKG51bGwsIGZpbGUpO1xuICAgICAgICBlbHNlIGlmIChzaXplIDwgMTYwMDAwKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNibChudWxsLCBkZWZsYXRlU3luYyhmaWxlLCBwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNibChlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZXJtLnB1c2goZGVmbGF0ZShmaWxlLCBwLCBjYmwpKTtcbiAgICB9O1xuICAgIC8vIENhbm5vdCB1c2UgbGZ0IGJlY2F1c2UgaXQgY2FuIGRlY3JlYXNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGZ0OyArK2kpIHtcbiAgICAgICAgX2xvb3BfMShpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRBbGw7XG59XG4vKipcbiAqIFN5bmNocm9ub3VzbHkgY3JlYXRlcyBhIFpJUCBmaWxlLiBQcmVmZXIgdXNpbmcgYHppcGAgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICogd2l0aCBtb3JlIHRoYW4gb25lIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGlyZWN0b3J5IHN0cnVjdHVyZSBmb3IgdGhlIFpJUCBhcmNoaXZlXG4gKiBAcGFyYW0gb3B0cyBUaGUgbWFpbiBvcHRpb25zLCBtZXJnZWQgd2l0aCBwZXItZmlsZSBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZ2VuZXJhdGVkIFpJUCBhcmNoaXZlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6aXBTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgciA9IHt9O1xuICAgIHZhciBmaWxlcyA9IFtdO1xuICAgIGZsdG4oZGF0YSwgJycsIHIsIG9wdHMpO1xuICAgIHZhciBvID0gMDtcbiAgICB2YXIgdG90ID0gMDtcbiAgICBmb3IgKHZhciBmbiBpbiByKSB7XG4gICAgICAgIHZhciBfYSA9IHJbZm5dLCBmaWxlID0gX2FbMF0sIHAgPSBfYVsxXTtcbiAgICAgICAgdmFyIGNvbXByZXNzaW9uID0gcC5sZXZlbCA9PSAwID8gMCA6IDg7XG4gICAgICAgIHZhciBmID0gc3RyVG9VOChmbiksIHMgPSBmLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbSA9IHAuY29tbWVudCwgbSA9IGNvbSAmJiBzdHJUb1U4KGNvbSksIG1zID0gbSAmJiBtLmxlbmd0aDtcbiAgICAgICAgdmFyIGV4bCA9IGV4ZmwocC5leHRyYSk7XG4gICAgICAgIGlmIChzID4gNjU1MzUpXG4gICAgICAgICAgICBlcnIoMTEpO1xuICAgICAgICB2YXIgZCA9IGNvbXByZXNzaW9uID8gZGVmbGF0ZVN5bmMoZmlsZSwgcCkgOiBmaWxlLCBsID0gZC5sZW5ndGg7XG4gICAgICAgIHZhciBjID0gY3JjKCk7XG4gICAgICAgIGMucChmaWxlKTtcbiAgICAgICAgZmlsZXMucHVzaChtcmcocCwge1xuICAgICAgICAgICAgc2l6ZTogZmlsZS5sZW5ndGgsXG4gICAgICAgICAgICBjcmM6IGMuZCgpLFxuICAgICAgICAgICAgYzogZCxcbiAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICBtOiBtLFxuICAgICAgICAgICAgdTogcyAhPSBmbi5sZW5ndGggfHwgKG0gJiYgKGNvbS5sZW5ndGggIT0gbXMpKSxcbiAgICAgICAgICAgIG86IG8sXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogY29tcHJlc3Npb25cbiAgICAgICAgfSkpO1xuICAgICAgICBvICs9IDMwICsgcyArIGV4bCArIGw7XG4gICAgICAgIHRvdCArPSA3NiArIDIgKiAocyArIGV4bCkgKyAobXMgfHwgMCkgKyBsO1xuICAgIH1cbiAgICB2YXIgb3V0ID0gbmV3IHU4KHRvdCArIDIyKSwgb2UgPSBvLCBjZGwgPSB0b3QgLSBvO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGYgPSBmaWxlc1tpXTtcbiAgICAgICAgd3poKG91dCwgZi5vLCBmLCBmLmYsIGYudSwgZi5jLmxlbmd0aCk7XG4gICAgICAgIHZhciBiYWRkID0gMzAgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKTtcbiAgICAgICAgb3V0LnNldChmLmMsIGYubyArIGJhZGQpO1xuICAgICAgICB3emgob3V0LCBvLCBmLCBmLmYsIGYudSwgZi5jLmxlbmd0aCwgZi5vLCBmLm0pLCBvICs9IDE2ICsgYmFkZCArIChmLm0gPyBmLm0ubGVuZ3RoIDogMCk7XG4gICAgfVxuICAgIHd6ZihvdXQsIG8sIGZpbGVzLmxlbmd0aCwgY2RsLCBvZSk7XG4gICAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIHBhc3MtdGhyb3VnaCBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXNcbiAqL1xudmFyIFVuemlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVW56aXBQYXNzVGhyb3VnaCgpIHtcbiAgICB9XG4gICAgVW56aXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgLy8gc2FtZSBhcyBaaXBQYXNzVGhyb3VnaDogY2FzdCB0byByZXRhaW4gQnVmZmVyIGVyZ29ub21pY3NcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIFVuemlwUGFzc1Rocm91Z2guY29tcHJlc3Npb24gPSAwO1xuICAgIHJldHVybiBVbnppcFBhc3NUaHJvdWdoO1xufSgpKTtcbmV4cG9ydCB7IFVuemlwUGFzc1Rocm91Z2ggfTtcbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzLiBQcmVmZXIgQXN5bmNaaXBJbmZsYXRlIGZvclxuICogYmV0dGVyIHBlcmZvcm1hbmNlLlxuICovXG52YXIgVW56aXBJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBERUZMQVRFIGRlY29tcHJlc3Npb24gdGhhdCBjYW4gYmUgdXNlZCBpbiBaSVAgYXJjaGl2ZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBVbnppcEluZmxhdGUoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuaSA9IG5ldyBJbmZsYXRlKGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmkucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlLCBudWxsLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFVuemlwSW5mbGF0ZS5jb21wcmVzc2lvbiA9IDg7XG4gICAgcmV0dXJuIFVuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBVbnppcEluZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlc1xuICovXG52YXIgQXN5bmNVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFzeW5jVW56aXBJbmZsYXRlKF8sIHN6KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmIChzeiA8IDMyMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaSA9IG5ldyBBc3luY0luZmxhdGUoZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnRlcm1pbmF0ZSA9IHRoaXMuaS50ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXN5bmNVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmkudGVybWluYXRlKVxuICAgICAgICAgICAgY2h1bmsgPSBzbGMoY2h1bmssIDApO1xuICAgICAgICB0aGlzLmkucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgQXN5bmNVbnppcEluZmxhdGUuY29tcHJlc3Npb24gPSA4O1xuICAgIHJldHVybiBBc3luY1VuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1VuemlwSW5mbGF0ZSB9O1xuLyoqXG4gKiBBIFpJUCBhcmNoaXZlIGRlY29tcHJlc3Npb24gc3RyZWFtIHRoYXQgZW1pdHMgZmlsZXMgYXMgdGhleSBhcmUgZGlzY292ZXJlZFxuICovXG52YXIgVW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFpJUCBkZWNvbXByZXNzaW9uIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBhIGZpbGUgaW4gdGhlIFpJUCBhcmNoaXZlIGlzIGZvdW5kXG4gICAgICovXG4gICAgZnVuY3Rpb24gVW56aXAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmZpbGUgPSBjYjtcbiAgICAgICAgdGhpcy5rID0gW107XG4gICAgICAgIHRoaXMubyA9IHtcbiAgICAgICAgICAgIDA6IFVuemlwUGFzc1Rocm91Z2hcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHVuemlwcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMub25maWxlKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAoIXRoaXMucClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgaWYgKHRoaXMuYyA+IDApIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBNYXRoLm1pbih0aGlzLmMsIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgdG9BZGQgPSBjaHVuay5zdWJhcnJheSgwLCBsZW4pO1xuICAgICAgICAgICAgdGhpcy5jIC09IGxlbjtcbiAgICAgICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICAgICAgdGhpcy5kLnB1c2godG9BZGQsICF0aGlzLmMpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMua1swXS5wdXNoKHRvQWRkKTtcbiAgICAgICAgICAgIGNodW5rID0gY2h1bmsuc3ViYXJyYXkobGVuKTtcbiAgICAgICAgICAgIGlmIChjaHVuay5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGYgPSAwLCBpID0gMCwgaXMgPSB2b2lkIDAsIGJ1ZiA9IHZvaWQgMDtcbiAgICAgICAgICAgIGlmICghdGhpcy5wLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidWYgPSBjaHVuaztcbiAgICAgICAgICAgIGVsc2UgaWYgKCFjaHVuay5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYnVmID0gdGhpcy5wO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYnVmID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjaHVuay5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGJ1Zi5zZXQodGhpcy5wKSwgYnVmLnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbCA9IGJ1Zi5sZW5ndGgsIG9jID0gdGhpcy5jLCBhZGQgPSBvYyAmJiB0aGlzLmQ7XG4gICAgICAgICAgICB2YXIgX2xvb3BfMiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2lnID0gYjQoYnVmLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4NDAzNEI1MCkge1xuICAgICAgICAgICAgICAgICAgICBmID0gMSwgaXMgPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzXzEuZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJmID0gYjIoYnVmLCBpICsgNiksIGNtcF8xID0gYjIoYnVmLCBpICsgOCksIHUgPSBiZiAmIDIwNDgsIGRkID0gYmYgJiA4LCBmbmwgPSBiMihidWYsIGkgKyAyNiksIGVzID0gYjIoYnVmLCBpICsgMjgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobCA+IGkgKyAzMCArIGZubCArIGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hrc18zID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuay51bnNoaWZ0KGNoa3NfMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsc2MgPSBiNChidWYsIGkgKyAxOCksIGxzdSA9IGI0KGJ1ZiwgaSArIDIyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbl8xID0gc3RyRnJvbVU4KGJ1Zi5zdWJhcnJheShpICsgMzAsIGkgKz0gMzAgKyBmbmwpLCAhdSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2EgPSB6NjRocyhidWYsIGksIGVzLCAyLCBsc2MsIGxzdSwgMCksIHNjXzEgPSBfYVswXSwgc3VfMSA9IF9hWzFdLCB6NjQgPSBfYVszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY18xID0gLTEgLSB6NjQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmMgPSBzY18xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZm5fMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2lvbjogY21wXzEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlXzEub25kYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNjXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKG51bGwsIGV0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3RyID0gX3RoaXMub1tjbXBfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY21wXzEsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEgPSBzY18xIDwgMCA/IG5ldyBjdHIoZm5fMSkgOiBuZXcgY3RyKGZuXzEsIHNjXzEsIHN1XzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZF8xLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHsgZmlsZV8xLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpOyB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjaGtzXzQgPSBjaGtzXzM7IF9pIDwgY2hrc180Lmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXQgPSBjaGtzXzRbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS5wdXNoKGRhdCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmtbMF0gPT0gY2hrc18zICYmIF90aGlzLmMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZCA9IGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEucHVzaChldCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZF8xICYmIGRfMS50ZXJtaW5hdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY18xID49IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZV8xLnNpemUgPSBzY18xLCBmaWxlXzEub3JpZ2luYWxTaXplID0gc3VfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5vbmZpbGUoZmlsZV8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4ODA3NEI1MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXMgPSBpICs9IDEyICsgKG9jID09IC0yICYmIDgpLCBmID0gMywgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzaWcgPT0gMHgyMDE0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcyA9IGkgLT0gNCwgZiA9IDMsIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRoaXNfMSA9IHRoaXM7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IGwgLSA0OyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGVfMSA9IF9sb29wXzIoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVfMSA9PT0gXCJicmVha1wiKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucCA9IGV0O1xuICAgICAgICAgICAgaWYgKG9jIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXQgPSBmID8gYnVmLnN1YmFycmF5KDAsIGlzIC0gMTIgLSAob2MgPT0gLTIgJiYgOCkgLSAoYjQoYnVmLCBpcyAtIDE2KSA9PSAweDgwNzRCNTAgJiYgNCkpIDogYnVmLnN1YmFycmF5KDAsIGkpO1xuICAgICAgICAgICAgICAgIGlmIChhZGQpXG4gICAgICAgICAgICAgICAgICAgIGFkZC5wdXNoKGRhdCwgISFmKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua1srKGYgPT0gMildLnB1c2goZGF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmICYgMilcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGJ1Zi5zdWJhcnJheShpKSwgZmluYWwpO1xuICAgICAgICAgICAgdGhpcy5wID0gYnVmLnN1YmFycmF5KGkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYylcbiAgICAgICAgICAgICAgICBlcnIoMTMpO1xuICAgICAgICAgICAgdGhpcy5wID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgZGVjb2RlciB3aXRoIHRoZSBzdHJlYW0sIGFsbG93aW5nIGZvciBmaWxlcyBjb21wcmVzc2VkIHdpdGhcbiAgICAgKiB0aGUgY29tcHJlc3Npb24gdHlwZSBwcm92aWRlZCB0byBiZSBleHBhbmRlZCBjb3JyZWN0bHlcbiAgICAgKiBAcGFyYW0gZGVjb2RlciBUaGUgZGVjb2RlciBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChkZWNvZGVyKSB7XG4gICAgICAgIHRoaXMub1tkZWNvZGVyLmNvbXByZXNzaW9uXSA9IGRlY29kZXI7XG4gICAgfTtcbiAgICByZXR1cm4gVW56aXA7XG59KCkpO1xuZXhwb3J0IHsgVW56aXAgfTtcbnZhciBtdCA9IHR5cGVvZiBxdWV1ZU1pY3JvdGFzayA9PSAnZnVuY3Rpb24nID8gcXVldWVNaWNyb3Rhc2sgOiB0eXBlb2Ygc2V0VGltZW91dCA9PSAnZnVuY3Rpb24nID8gc2V0VGltZW91dCA6IGZ1bmN0aW9uIChmbikgeyBmbigpOyB9O1xuZXhwb3J0IGZ1bmN0aW9uIHVuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgdmFyIHRlcm0gPSBbXTtcbiAgICB2YXIgdEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgdGVybVtpXSgpO1xuICAgIH07XG4gICAgdmFyIGZpbGVzID0ge307XG4gICAgdmFyIGNiZCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIG10KGZ1bmN0aW9uICgpIHsgY2IoYSwgYik7IH0pO1xuICAgIH07XG4gICAgbXQoZnVuY3Rpb24gKCkgeyBjYmQgPSBjYjsgfSk7XG4gICAgdmFyIGUgPSBkYXRhLmxlbmd0aCAtIDIyO1xuICAgIGZvciAoOyBiNChkYXRhLCBlKSAhPSAweDYwNTRCNTA7IC0tZSkge1xuICAgICAgICBpZiAoIWUgfHwgZGF0YS5sZW5ndGggLSBlID4gNjU1NTgpIHtcbiAgICAgICAgICAgIGNiZChlcnIoMTMsIDAsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybiB0QWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICB2YXIgbGZ0ID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmIChsZnQpIHtcbiAgICAgICAgdmFyIGMgPSBsZnQ7XG4gICAgICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICAgICAgdmFyIHogPSBiNChkYXRhLCBlIC0gMjApID09IDB4NzA2NEI1MDtcbiAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgICAgICB6ID0gYjQoZGF0YSwgemUpID09IDB4NjA2NEI1MDtcbiAgICAgICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICAgICAgYyA9IGxmdCA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgICAgIG8gPSBiNChkYXRhLCB6ZSArIDQ4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmx0ciA9IG9wdHMgJiYgb3B0cy5maWx0ZXI7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IHpoKGRhdGEsIG8sIHopLCBjXzEgPSBfYVswXSwgc2MgPSBfYVsxXSwgc3UgPSBfYVsyXSwgZm4gPSBfYVszXSwgbm8gPSBfYVs0XSwgb2ZmID0gX2FbNV0sIGIgPSBzbHpoKGRhdGEsIG9mZik7XG4gICAgICAgICAgICBvID0gbm87XG4gICAgICAgICAgICB2YXIgY2JsID0gZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWxmdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiZChudWxsLCBmaWxlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBmbixcbiAgICAgICAgICAgICAgICBzaXplOiBzYyxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjXzFcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjXzEpXG4gICAgICAgICAgICAgICAgICAgIGNibChudWxsLCBzbGMoZGF0YSwgYiwgYiArIHNjKSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY18xID09IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZmwgPSBkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN5bmNocm9ub3VzbHkgZGVjb21wcmVzcyB1bmRlciA1MTJLQiwgb3IgYmFyZWx5LWNvbXByZXNzZWQgZGF0YVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3UgPCA1MjQyODggfHwgc2MgPiAwLjggKiBzdSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwobnVsbCwgaW5mbGF0ZVN5bmMoaW5mbCwgeyBvdXQ6IG5ldyB1OChzdSkgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwoZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGVybS5wdXNoKGluZmxhdGUoaW5mbCwgeyBzaXplOiBzdSB9LCBjYmwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjYmwoZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjXzEsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYmwobnVsbCwgbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYzsgKytpKSB7XG4gICAgICAgICAgICBfbG9vcF8zKGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgY2JkKG51bGwsIHt9KTtcbiAgICByZXR1cm4gdEFsbDtcbn1cbi8qKlxuICogU3luY2hyb25vdXNseSBkZWNvbXByZXNzZXMgYSBaSVAgYXJjaGl2ZS4gUHJlZmVyIHVzaW5nIGB1bnppcGAgZm9yIGJldHRlclxuICogcGVyZm9ybWFuY2Ugd2l0aCBtb3JlIHRoYW4gb25lIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSBUaGUgcmF3IGNvbXByZXNzZWQgWklQIGZpbGVcbiAqIEBwYXJhbSBvcHRzIFRoZSBaSVAgZXh0cmFjdGlvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZGVjb21wcmVzc2VkIGZpbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIHZhciBmaWxlcyA9IHt9O1xuICAgIHZhciBlID0gZGF0YS5sZW5ndGggLSAyMjtcbiAgICBmb3IgKDsgYjQoZGF0YSwgZSkgIT0gMHg2MDU0QjUwOyAtLWUpIHtcbiAgICAgICAgaWYgKCFlIHx8IGRhdGEubGVuZ3RoIC0gZSA+IDY1NTU4KVxuICAgICAgICAgICAgZXJyKDEzKTtcbiAgICB9XG4gICAgO1xuICAgIHZhciBjID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmICghYylcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICB2YXIgeiA9IGI0KGRhdGEsIGUgLSAyMCkgPT0gMHg3MDY0QjUwO1xuICAgIGlmICh6KSB7XG4gICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgIHogPSBiNChkYXRhLCB6ZSkgPT0gMHg2MDY0QjUwO1xuICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgYyA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgbyA9IGI0KGRhdGEsIHplICsgNDgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBmbHRyID0gb3B0cyAmJiBvcHRzLmZpbHRlcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGM7ICsraSkge1xuICAgICAgICB2YXIgX2EgPSB6aChkYXRhLCBvLCB6KSwgY18yID0gX2FbMF0sIHNjID0gX2FbMV0sIHN1ID0gX2FbMl0sIGZuID0gX2FbM10sIG5vID0gX2FbNF0sIG9mZiA9IF9hWzVdLCBiID0gc2x6aChkYXRhLCBvZmYpO1xuICAgICAgICBvID0gbm87XG4gICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgIG5hbWU6IGZuLFxuICAgICAgICAgICAgc2l6ZTogc2MsXG4gICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgY29tcHJlc3Npb246IGNfMlxuICAgICAgICB9KSkge1xuICAgICAgICAgICAgaWYgKCFjXzIpXG4gICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gc2xjKGRhdGEsIGIsIGIgKyBzYyk7XG4gICAgICAgICAgICBlbHNlIGlmIChjXzIgPT0gOClcbiAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBpbmZsYXRlU3luYyhkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyksIHsgb3V0OiBuZXcgdTgoc3UpIH0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY18yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmlsZXM7XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBEYXRhQWRhcHRlciwgbm9ybWFsaXplUGF0aCwgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MsIE5vaXNlSXRlbSB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcbmltcG9ydCB7IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUywgTUlNRV9UWVBFUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5pbXBvcnQgdHlwZSB7IERheURhdGEgfSBmcm9tICcuLi90eXBlcy9kYXRhJztcbmltcG9ydCB7IFBST1RPQ09MX1ZFUlNJT04sIElOQk9VTkRfUFJFRklYRVMgfSBmcm9tICcuL3Byb3RvY29sJztcblxuLyoqIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1OEZEMFx1ODg0Q1x1NjVGNlx1NkNFOFx1NTE2NVx1NzY4NFx1NEUzQlx1N0E5N1x1NTNFMyBkb2N1bWVudFx1RkYwOFx1OTc1RVx1NjNEMlx1NEVGNlx1NkM5OVx1N0JCMVx1NTE4NVx1NzY4NCBkb2N1bWVudFx1RkYwOSAqL1xuZGVjbGFyZSBjb25zdCBhY3RpdmVEb2N1bWVudDogRG9jdW1lbnQ7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MEQgKi9cbmNvbnN0IFNLSVBfRElSUyA9IFsnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ107XG5cbi8qKlxuICogXHU2ODIxXHU5QThDXHU5N0YzXHU2RTkwXHU0RUUzXHU3NDA2IFVSTFx1RkYxQVx1NEVDNVx1NTE0MVx1OEJCOCBodHRwL2h0dHBzIFx1NTM0Rlx1OEJBRVx1RkYwQ1x1OTY1MFx1NTIzNlx1OTU3Rlx1NUVBNlx1RkYwQ1xuICogXHU5NjMyXHU2QjYyIGBhcHA6cHJveHlBdWRpb1VybGAgXHU2MjEwXHU0RTNBXHU4RkQwXHU4ODRDXHU1NzI4XHU3NTI4XHU2MjM3XHU2NzNBXHU1NjY4XHU0RTBBXHU3Njg0XHU1RjAwXHU2NTNFIGZldGNoIFx1NEVFM1x1NzQwNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEF1ZGlvVXJsKHVybDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghdXJsIHx8IHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gIGlmICh1cmwubGVuZ3RoID4gMjA0OCkgcmV0dXJuIGZhbHNlO1xuICBsZXQgcGFyc2VkOiBVUkw7XG4gIHRyeSB7XG4gICAgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZC5wcm90b2NvbCA9PT0gJ2h0dHA6JyB8fCBwYXJzZWQucHJvdG9jb2wgPT09ICdodHRwczonO1xufVxuXG4vKiogQXJyYXlCdWZmZXIgXHUyMTkyIGJhc2U2NCBcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDhcdTU5MjdcdTY1ODdcdTRFRjZcdTUyMDZcdTU3NTdcdUZGMENcdTkwN0ZcdTUxNERcdThDMDNcdTc1MjhcdTY4MDhcdTZFQTJcdTUxRkFcdUZGMDkgKi9cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgbGV0IGJpbmFyeSA9ICcnO1xuICBjb25zdCBjaHVua1NpemUgPSAweDgwMDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IGNodW5rU2l6ZSkge1xuICAgIGNvbnN0IGNodW5rID0gYnl0ZXMuc3ViYXJyYXkoaSwgaSArIGNodW5rU2l6ZSk7XG4gICAgbGV0IGNodW5rU3RyID0gJyc7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaHVuay5sZW5ndGg7IGorKykge1xuICAgICAgY2h1bmtTdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaHVua1tqXSk7XG4gICAgfVxuICAgIGJpbmFyeSArPSBjaHVua1N0cjtcbiAgfVxuICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG4vKipcbiAqIEFwcEFQSSBcdTIwMTQgXHU3RURGXHU0RTAwXHU5MDFBXHU0RkUxXHU2M0E1XHU1M0UzXG4gKlxuICogXHU2NkZGXHU0RUUzXHU2NUU3XHU3Njg0IEJyaWRnZVNlcnZpY2UgKyBTdG9yYWdlQnJpZGdlICsgVGhlbWVCcmlkZ2UgXHU0RTA5XHU1QzQyXHU2N0I2XHU2Nzg0XHVGRjBDXG4gKiBcdTVDMDYgcG9zdE1lc3NhZ2UgXHU4REVGXHU3NTMxXHUzMDAxXHU1QjU4XHU1MEE4XHU2NENEXHU0RjVDXHUzMDAxXHU0RTNCXHU5ODk4XHU1NDBDXHU2QjY1XHU1NDA4XHU1RTc2XHU0RTNBXHU1MzU1XHU0RTAwIEFQSVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQXBwQVBJIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3VzdG9tVGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gIHByaXZhdGUgdmF1bHRBZGFwdGVyOiBEYXRhQWRhcHRlcjtcbiAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBjb25maWdEaXI6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+LFxuICAgIG5vaXNlUGF0aDogc3RyaW5nLFxuICAgIGNvbmZpZ0Rpcjogc3RyaW5nXG4gICkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKGFwcCk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG5ldyBUaGVtZUJyaWRnZSgpO1xuICAgIHRoaXMudmF1bHRBZGFwdGVyID0gYXBwLnZhdWx0LmFkYXB0ZXI7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gICAgdGhpcy5jb25maWdEaXIgPSBjb25maWdEaXI7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU1QjU4XHU1MEE4XHU3RUQzXHU2Nzg0XHU1QjU4XHU1NzI4ICovXG4gIGFzeW5jIGVuc3VyZVN0cnVjdHVyZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcbiAgICogXHU5ODg0XHU2Q0U4XHU1MThDIG1lc3NhZ2UgXHU3NkQxXHU1NDJDXHU1NjY4XHUzMDAyXG4gICAqIFx1NTcyOCBpZnJhbWUgXHU1MjFCXHU1RUZBXHU1MjREXHU4QzAzXHU3NTI4XHVGRjBDXHU2RDg4XHU5NjY0XHU3QURFXHU2MDAxXHU3QTk3XHU1M0UzXHUzMDAyXG4gICAqIFx1NEY3Rlx1NzUyOCBhY3RpdmVEb2N1bWVudC5kZWZhdWx0Vmlld1x1RkYwOFx1NEUzQiBPYnNpZGlhbiBcdTdBOTdcdTUzRTNcdUZGMDlcdTgwMENcdTk3NUVcdTYzRDJcdTRFRjZcdTZDOTlcdTdCQjEgd2luZG93XHUzMDAyXG4gICAqL1xuICBzdGFydExpc3RlbmluZygpOiB2b2lkIHtcbiAgICB0aGlzLmRldGFjaCgpO1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLm9uTWVzc2FnZShldmVudCk7XG4gICAgfTtcbiAgICAvLyBicmlkZ2UuanMgXHU3Njg0IHBvc3RNZXNzYWdlIFx1NzZFRVx1NjgwN1x1NjYyRiB3aW5kb3cucGFyZW50XHVGRjA4XHU0RTNCIE9ic2lkaWFuIFx1N0E5N1x1NTNFM1x1RkYwOVx1RkYwQ1xuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NTcyOFx1OEJFNVx1N0E5N1x1NTNFM1x1NEUwQVx1NzZEMVx1NTQyQ1x1NjI0RFx1ODBGRFx1NjUzNlx1NTIzMFx1NkQ4OFx1NjA2Rlx1RkYwOFx1NjNEMlx1NEVGNlx1NkM5OVx1N0JCMVx1NzY4NCB3aW5kb3cgXHU0RTBEXHU2NjJGXHU1NDBDXHU0RTAwXHU1QkY5XHU4QzYxXHVGRjA5XHUzMDAyXG4gICAgKGFjdGl2ZURvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdykuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBcdTdFRDFcdTVCOUEgaWZyYW1lIFx1NUYxNVx1NzUyOFx1NUU3Nlx1NTIxRFx1NTlDQlx1NTMxNlx1NEUzQlx1OTg5OFx1Njg2NVx1NjNBNVx1MzAwMlxuICAgKiBcdTU3MjggaWZyYW1lIFx1NTE0M1x1N0QyMFx1NTIxQlx1NUVGQVx1NTQwRVx1OEMwM1x1NzUyOFx1RkYwQ1x1NEY5QiByZXNwb25kKCkgXHU4M0I3XHU1M0Q2IGNvbnRlbnRXaW5kb3dcdTMwMDJcbiAgICovXG4gIGJpbmRJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG4gIH1cblxuICAvKiogXHU3RUQxXHU1QjlBIGlmcmFtZSBcdTVFNzZcdTVGMDBcdTU5Q0JcdTc2RDFcdTU0MkNcdTZEODhcdTYwNkZcdUZGMDhcdTRFMDBcdTZCNjVcdTUyMzBcdTRGNERcdUZGMENcdTUxN0NcdTVCQjlcdTY1RTdcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgYXR0YWNoKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLnN0YXJ0TGlzdGVuaW5nKCk7XG4gICAgdGhpcy5iaW5kSWZyYW1lKGlmcmFtZSk7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxXHU1RTc2XHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZXNzYWdlSGFuZGxlcikge1xuICAgICAgKGFjdGl2ZURvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdykucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICAgICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMudGhlbWVCcmlkZ2UuZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMVx1RkYwOFx1NzUzMSBEYWlseVJldmlld1ZpZXcgXHU3Njg0IGNzcy1jaGFuZ2UgXHU0RThCXHU0RUY2XHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIG9uVGhlbWVDaGFuZ2VkKGZvbGxvd09ic2lkaWFuVGhlbWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUgPSBmb2xsb3dPYnNpZGlhblRoZW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NUUyNiB0eXBlIFx1NUI1N1x1NkJCNVx1RkYxQWJyaWRnZS5qcyBcdTc2ODQgcGFyc2VBcHBNZXNzYWdlIFx1ODk4MVx1NkM0MiB0eXBlb2YgZGF0YS50eXBlID09PSAnc3RyaW5nJ1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyB0eXBlOiAnc3RvcmFnZTpyZXNwb25zZScsIGlkLCBwYXlsb2FkIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kRXJyb3IoaWQ6IHN0cmluZywgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgdHlwZTogJ3N0b3JhZ2U6cmVzcG9uc2UnLCBpZCwgZXJyb3IgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdThERUZcdTc1MzEgKi9cbiAgcHJpdmF0ZSBhc3luYyBvbk1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1zZyA9IGV2ZW50LmRhdGEgYXMgeyB0eXBlPzogc3RyaW5nOyBpZD86IHN0cmluZzsgcGF5bG9hZD86IHVua25vd24gfTtcbiAgICBpZiAoIW1zZyB8fCAhbXNnLnR5cGUgfHwgIW1zZy5pZCkgcmV0dXJuO1xuXG4gICAgLy8gXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgLy8gXHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXHU3NjdEXHU1NDBEXHU1MzU1XHVGRjA4XHU5NjM2XHU2QkI1MyBcdTAwQjcgXHU1OTUxXHU3RUE2XHU1MzE2XHVGRjFBXHU0RUNFIHByb3RvY29sLnRzIFx1OTZDNlx1NEUyRFx1NUI5QVx1NEU0OVx1RkYwOVxuICAgIGlmICghSU5CT1VORF9QUkVGSVhFUy5zb21lKChwKSA9PiBtc2cudHlwZSEuc3RhcnRzV2l0aChwKSkpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZU1lc3NhZ2UobXNnLnR5cGUsIG1zZy5pZCwgbXNnLnBheWxvYWQgPz8ge30pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU1MjA2XHU1M0QxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlTWVzc2FnZSh0eXBlOiBzdHJpbmcsIGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyAtLS0tIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRiAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICAvLyBcdTk2MzZcdTZCQjUzIFx1MDBCNyBcdTU5NTFcdTdFQTZcdTUzMTZcdUZGMUFcdTcyNDhcdTY3MkNcdTUzNEZcdTU1NDYgXHUyMDE0IFx1NjNEMlx1NEVGNlx1NTM0N1x1N0VBN1x1NEY0NiB3ZWJhcHAgXHU3RjEzXHU1QjU4XHU2NUU3XHU3MjQ4XHU2NUY2XHU1M0VGXHU4OUMxXHU1NDRBXHU4QjY2XG4gICAgICBjb25zdCBwdiA9IChwYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KT8ucHJvdG9jb2xWZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBwdiA9PT0gJ251bWJlcicgJiYgcHYgIT09IFBST1RPQ09MX1ZFUlNJT04pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBbQmFtYm9vXSBcdTUzNEZcdThCQUVcdTcyNDhcdTY3MkNcdTRFMERcdTUzMzlcdTkxNERcdUZGMUFcdTYzRDJcdTRFRjY9JHtQUk9UT0NPTF9WRVJTSU9OfVx1RkYwQ3dlYmFwcD0ke3B2fVx1MzAwMmAgK1xuICAgICAgICAgICAgYFx1OEJGN1x1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1ODlDNlx1NTZGRVx1NEVFNVx1ODNCN1x1NTNENlx1NjcwMFx1NjVCMCB3ZWJhcHBcdTMwMDJgLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnIHx8IG51bGwsXG4gICAgICAgIGN1c3RvbVRoZW1lczogdGhpcy5jdXN0b21UaGVtZXMsXG4gICAgICAgIGN1c3RvbU5vaXNlczogdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zIHx8IFtdLFxuICAgICAgICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IHRoaXMuc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6Y2xvc2UnKSB7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkUgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnID0gcGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zID0gKEFycmF5LmlzQXJyYXkocGF5bG9hZCkgPyBwYXlsb2FkIDogW10pIGFzIE5vaXNlSXRlbVtdO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW5cdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgaHVlOiBudW1iZXI7IGxpZ2h0bmVzc09mZnNldDogbnVtYmVyOyBpc0Rhcms6IGJvb2xlYW4gfTtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbikge1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLmFwcGx5UGFsZXR0ZShwLmh1ZSwgcC5saWdodG5lc3NPZmZzZXQsIHAuaXNEYXJrKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OTFDRFx1NjVCMFx1NUYwMFx1NTQyRlx1NEUzQlx1OTg5OFx1OERERlx1OTY4Rlx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW5cdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6dGhlbWU6c3luYycpIHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKHRoaXMuc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNkJcdTYzQ0YgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuc2NhblZhdWx0QXVkaW9GaWxlcygpO1xuICAgICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdThCRkJcdTUzRDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTEgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVJlYWRWYXVsdEZpbGUoaWQsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU4QkZCXHU1M0Q2XHU2NzJDXHU2NzNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU5N0YzXHU5ODkxXHVGRjA4XHU1MTdDXHU1QkI5XHU2NUU3XHU5N0YzXHU2RTkwXHVGRjA5LS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVJlYWRMb2NhbEZpbGUoaWQsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU0RUUzXHU3NDA2XHU1OTE2XHU5MEU4XHU5N0YzXHU2RTkwXHU5NEZFXHU2M0E1XHVGRjA4XHU3RUQ1XHU4RkM3IHdlYnZpZXcgQ09SU1x1RkYwQ1x1Njg0Q1x1OTc2Mi9cdTc5RkJcdTUyQThcdTRFMDBcdTgxRjRcdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cHJveHlBdWRpb1VybCcpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUHJveHlBdWRpb1VybChpZCwgcGF5bG9hZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTVCNThcdTUwQThcdTdDN0JcdTZEODhcdTYwNkZcdUZGMDhcdTU5RDRcdTYyNThcdTdFRDkgVmF1bHRTdG9yYWdlXHVGRjA5LS0tLVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuaGFuZGxlU3RvcmFnZU1lc3NhZ2UodHlwZSwgcGF5bG9hZCk7XG4gICAgdGhpcy5yZXNwb25kKGlkLCByZXN1bHQpO1xuICB9XG5cbiAgLyoqIFx1NUI1OFx1NTBBOFx1NkQ4OFx1NjA2Rlx1NTkwNFx1NzQwNiAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZVN0b3JhZ2VNZXNzYWdlKHR5cGU6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnc3RvcmFnZTpyZWFkRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXkocC5kYXRlS2V5IGFzIHN0cmluZyk7XG4gICAgICBjYXNlICdzdG9yYWdlOndyaXRlRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXREYXkocC5kYXRhIGFzIERheURhdGEpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpkZWxldGVEYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZURheShwLmRhdGVLZXkgYXMgc3RyaW5nKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0U2V0dGluZyhwLmtleSBhcyBzdHJpbmcpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRTZXR0aW5nKHAua2V5IGFzIHN0cmluZywgcC52YWx1ZSk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0R29hbHMoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEdvYWxzKHAuZ29hbHMgYXMgbmV2ZXIpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFB1cmNoYXNlSGlzdG9yeSgpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFB1cmNoYXNlSGlzdG9yeShwLmRhdGEgYXMgbmV2ZXIpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRJbmNvbWVIaXN0b3J5KCk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEluY29tZUhpc3RvcnkocC5kYXRhIGFzIG5ldmVyKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5S2V5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5S2V5cygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlzUGFnaW5hdGVkJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlzUGFnaW5hdGVkKFxuICAgICAgICAgIChwLnBhZ2UgYXMgbnVtYmVyKSA/PyAwLFxuICAgICAgICAgIChwLnBhZ2VTaXplIGFzIG51bWJlcikgPz8gMzBcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmltcG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuaW1wb3J0RGF0YShcbiAgICAgICAgICBwLmRhdGEsXG4gICAgICAgICAgeyBzdHJhdGVneTogKHAub3B0aW9ucyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik/LnN0cmF0ZWd5IGFzICdvdmVyd3JpdGUnIHwgJ21lcmdlJyB8IHVuZGVmaW5lZCB9XG4gICAgICAgICk7XG4gICAgICBjYXNlICdzdG9yYWdlOmNsZWFyQWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhckFsbCgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0b3JhZ2UgbWVzc2FnZSB0eXBlOiAke3R5cGV9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiAqL1xuICBwcml2YXRlIGFzeW5jIHNjYW5WYXVsdEF1ZGlvRmlsZXMoXG4gICAgbWF4RGVwdGggPSA1XG4gICk6IFByb21pc2U8QXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy52YXVsdEFkYXB0ZXI7XG5cbiAgICBpZiAodGhpcy5ub2lzZVBhdGgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBhd2FpdCBhZGFwdGVyLmxpc3QodGhpcy5ub2lzZVBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbGlzdC5maWxlcykge1xuICAgICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gZmlsZS5zdWJzdHJpbmcoZmlsZS5sYXN0SW5kZXhPZignLicpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMubm9pc2VQYXRofS8ke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiBmdWxsUGF0aCwgbmFtZTogZmlsZSwgc2l6ZTogc3RhdD8uc2l6ZSA/PyAwLCBleHQgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gXHU1MTY4XHU1RTkzXHU2MjZCXHU2M0NGXG4gICAgY29uc3Qgc2NhbkRpciA9IGFzeW5jIChyZWxhdGl2ZURpcjogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgbGV0IGxpc3Q7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ID0gYXdhaXQgYWRhcHRlci5saXN0KHJlbGF0aXZlRGlyKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZm9sZGVyIG9mIGxpc3QuZm9sZGVycykge1xuICAgICAgICBpZiAoZm9sZGVyLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHNraXBTZXQgPSBuZXcgU2V0KFsuLi5TS0lQX0RJUlMsIC4uLih0aGlzLmNvbmZpZ0RpciA/IFt0aGlzLmNvbmZpZ0Rpcl0gOiBbXSldKTtcbiAgICAgICAgaWYgKHNraXBTZXQuaGFzKGZvbGRlcikpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBzdWJQYXRoID0gcmVsYXRpdmVEaXIgPyBub3JtYWxpemVQYXRoKGAke3JlbGF0aXZlRGlyfS8ke2ZvbGRlcn1gKSA6IGZvbGRlcjtcbiAgICAgICAgYXdhaXQgc2NhbkRpcihzdWJQYXRoLCBkZXB0aCArIDEpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbGlzdC5maWxlcykge1xuICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBleHQgPSBmaWxlLnN1YnN0cmluZyhmaWxlLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZURpciA/IG5vcm1hbGl6ZVBhdGgoYCR7cmVsYXRpdmVEaXJ9LyR7ZmlsZX1gKSA6IGZpbGU7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KHJlbGF0aXZlUGF0aCk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiByZWxhdGl2ZVBhdGgsIG5hbWU6IGZpbGUsIHNpemU6IHN0YXQ/LnNpemUgPz8gMCwgZXh0IH0pO1xuICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBhd2FpdCBzY2FuRGlyKCcnLCAwKTtcbiAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqIFx1OEJGQlx1NTNENlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwQ1x1OEZENFx1NTZERVx1NTNFRlx1NjRBRFx1NjUzRVx1NzY4NCBiYXNlNjQgZGF0YSBVUkxcdUZGMDhcdTY4NENcdTk3NjIvXHU3OUZCXHU1MkE4XHU0RTAwXHU4MUY0XHVGRjBDXHU0RTBEXHU0RjlEXHU4RDU2IGJhc2VQYXRoXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUmVhZFZhdWx0RmlsZShpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgcGF0aDogc3RyaW5nIH07XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwLnBhdGggfHwgJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcblxuICAgICAgY29uc3QgZXh0ID0gcmVsYXRpdmVQYXRoLnN1YnN0cmluZyhyZWxhdGl2ZVBhdGgubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICBpZiAocmVsYXRpdmVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuXG4gICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy52YXVsdEFkYXB0ZXI7XG4gICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KHJlbGF0aXZlUGF0aCk7XG4gICAgICBpZiAoIXN0YXQgfHwgc3RhdC50eXBlICE9PSAnZmlsZScpIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG5cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGFkYXB0ZXIucmVhZEJpbmFyeShyZWxhdGl2ZVBhdGgpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IGRhdGE6IHRoaXMudG9EYXRhVXJsKGJ1ZmZlciwgZXh0KSB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdThCRkJcdTUzRDZcdTY3MkNcdTY3M0FcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdTk3RjNcdTk4OTFcdUZGMDhcdTUxN0NcdTVCQjlcdTY1RTdcdTk3RjNcdTZFOTBcdUZGMUJcdTc5RkJcdTUyQThcdTdBRUZcdTZDOTlcdTc2RDJcdTRFMEJcdTUzRUZcdTgwRkRcdTRFMERcdTUzRUZcdThCRkJcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVSZWFkTG9jYWxGaWxlKGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyBwYXRoOiBzdHJpbmcgfTtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gcC5wYXRoIHx8ICcnO1xuICAgICAgaWYgKCFmaWxlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcblxuICAgICAgY29uc3QgZXh0ID0gZmlsZVBhdGguc3Vic3RyaW5nKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NEUwRFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjgzQ1x1NUYwRlx1RkYxQScgKyBleHQpO1xuICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuXG4gICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCB0aGlzLnZhdWx0QWRhcHRlci5yZWFkQmluYXJ5KGZpbGVQYXRoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBkYXRhOiB0aGlzLnRvRGF0YVVybChidWZmZXIsIGV4dCkgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IoaWQsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdThCRkJcdTUzRDZcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU0RUUzXHU3NDA2XHU1OTE2XHU5MEU4XHU5N0YzXHU2RTkwXHU5NEZFXHU2M0E1XHVGRjFBXHU2M0QyXHU0RUY2XHU3QUVGIHJlcXVlc3RVcmwgXHU0RTBEXHU1M0Q3IHdlYnZpZXcgQ09SUyBcdTk2NTBcdTUyMzZcdUZGMDhcdTY4NENcdTk3NjIvXHU3OUZCXHU1MkE4XHU1NzQ3XHU2NTJGXHU2MzAxXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUHJveHlBdWRpb1VybChpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgdXJsOiBzdHJpbmcgfTtcbiAgICAgIGNvbnN0IHVybCA9IHAudXJsIHx8ICcnO1xuICAgICAgaWYgKCFpc1ZhbGlkQXVkaW9VcmwodXJsKSkgdGhyb3cgbmV3IEVycm9yKCdcdTk3NUVcdTZDRDVcdTk3RjNcdTZFOTBcdTk0RkVcdTYzQTVcdUZGMDhcdTRFQzVcdTY1MkZcdTYzMDEgaHR0cC9odHRwc1x1RkYwOScpO1xuXG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgcmVxdWVzdFVybCh7IHVybCwgbWV0aG9kOiAnR0VUJyB9KTtcbiAgICAgIGlmIChyZXNwLnN0YXR1cyA8IDIwMCB8fCByZXNwLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTk3RjNcdTZFOTBcdThCQkZcdTk1RUVcdTU5MzFcdThEMjUgKEhUVFAgJyArIHJlc3Auc3RhdHVzICsgJyknKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHJlc3AuYXJyYXlCdWZmZXI7XG4gICAgICBpZiAoIWJ1ZmZlcikgdGhyb3cgbmV3IEVycm9yKCdcdTk3RjNcdTZFOTBcdTU0Q0RcdTVFOTRcdTRFM0FcdTdBN0EnKTtcblxuICAgICAgY29uc3QgbWltZSA9IChyZXNwLmhlYWRlcnMgJiYgcmVzcC5oZWFkZXJzWydjb250ZW50LXR5cGUnXSkgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZGF0YTogYGRhdGE6JHttaW1lfTtiYXNlNjQsJHthcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcil9YCB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NEVFM1x1NzQwNlx1OTdGM1x1NkU5MFx1NTkzMVx1OEQyNScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBBcnJheUJ1ZmZlciBcdTIxOTIgXHU1RTI2IE1JTUUgXHU3Njg0IGJhc2U2NCBkYXRhIFVSTCAqL1xuICBwcml2YXRlIHRvRGF0YVVybChidWZmZXI6IEFycmF5QnVmZmVyLCBleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWltZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICByZXR1cm4gYGRhdGE6JHttaW1lfTtiYXNlNjQsJHthcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcil9YDtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEltcG9ydFZhbGlkYXRvciB9IGZyb20gJy4vSW1wb3J0VmFsaWRhdG9yJztcbmltcG9ydCB0eXBlIHtcbiAgRGF5RGF0YSxcbiAgR29hbEl0ZW0sXG4gIEFwcFNldHRpbmdzLFxuICBQdXJjaGFzZUhpc3RvcnksXG4gIEluY29tZUhpc3RvcnksXG4gIEV4cG9ydFNoYXBlLFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuLyoqXG4gKiBWYXVsdFN0b3JhZ2UgLSBcdTVDMDFcdTg4QzUgT2JzaWRpYW4gVmF1bHQgYWRhcHRlciBcdTc2ODRcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcbiAqXG4gKiBWYXVsdCBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODQ6XG4gKiAgIHtiYXNlUGF0aH0vXG4gKiAgICAgZGF0YS8gICAgICAgICAgLT4gXHU2QkNGXHU2NUU1IEpTT04gXHU2NTcwXHU2MzZFXG4gKiAgICAgZ29hbHMuanNvbiAgICAgLT4gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3XG4gKiAgICAgc2V0dGluZ3MuanNvbiAgLT4gXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFXG4gKiAgICAgdGhlbWVzLyAgICAgICAgLT4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmVwb3J0cy8gICAgICAgLT4gXHU2MkE1XHU1NDRBIChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmV2aWV3cy8gICAgICAgLT4gTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cbmV4cG9ydCBjbGFzcyBWYXVsdFN0b3JhZ2Uge1xuICBwcml2YXRlIGFwcDogQXBwO1xuICBwcml2YXRlIGJhc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTUxOTlcdTVCODhcdTUzNkJcdUZGMUFcdTVERjJcdThCNjZcdTU0NEFcdThGQzdcdTc2ODRcdThERUZcdTVGODRcdUZGMENcdTdCMkNcdTRFOENcdTZCMjFcdTUxOTlcdTUxNjVcdTY1M0VcdTg4NENcdUZGMDhcdTc1MjhcdTYyMzdcdTc4NkVcdThCQTRcdTYxMEZcdTU2RkVcdUZGMDkgKi9cbiAgcHJpdmF0ZSBfd2FybmVkUGF0aHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgYmFzZVBhdGggPSAnYmFtYm9vLXJldmlldycpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLmJhc2VQYXRoID0gbm9ybWFsaXplUGF0aChiYXNlUGF0aCk7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4ICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlRGlyKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vJHtkaXJ9YCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTU3RkFcdTc4NDBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODRcdTVCNThcdTU3MjggKi9cbiAgYXN5bmMgZW5zdXJlU3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2Rpcih0aGlzLmJhc2VQYXRoKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTM5Rlx1NUI1MFx1NjVCOVx1NUYwRlx1NTE5OVx1NTE2NSB2YXVsdCBcdTY1ODdcdTRFRjZcdUZGMDhcdTY2RkZcdTRFRTMgYWRhcHRlci53cml0ZVx1RkYwOVx1MzAwMlxuICAgKiAtIFx1NjU4N1x1NEVGNlx1NURGMlx1NTcyOCB2YXVsdCBcdTdGMTNcdTVCNTggXHUyMTkyIHZhdWx0LnByb2Nlc3NcdUZGMDhcdTUzOUZcdTVCNTBcdTY2RjRcdTY1QjBcdUZGMENcdTkwN0ZcdTUxNERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcdUZGMDlcbiAgICogLSBcdTY1QjBcdTY1ODdcdTRFRjYgXHUyMTkyIHZhdWx0LmNyZWF0ZVx1RkYwOFx1NTQwQ1x1NjVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFx1NTQ4QyBPYnNpZGlhbiBcdTdGMTNcdTVCNThcdUZGMDlcbiAgICogLSBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDhcdTc4QzFcdTc2RDhcdTY3MDlcdTRGNDZcdTdGMTNcdTVCNThcdTY1RTBcdUZGMDlcdTIxOTIgYWRhcHRlci5yZW1vdmUgKyB2YXVsdC5jcmVhdGVcdUZGMDhcdThGQzFcdTc5RkJcdThGREJcdTdGMTNcdTVCNThcdUZGMDlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdmF1bHRXcml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vcm1hbGl6ZWQpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsICgpID0+IGNvbnRlbnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudFBhdGggPSBub3JtYWxpemVkLnN1YnN0cmluZygwLCBub3JtYWxpemVkLmxhc3RJbmRleE9mKCcvJykpO1xuICAgIGlmIChwYXJlbnRQYXRoICYmICEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGFyZW50UGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhcmVudFBhdGgpO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhub3JtYWxpemVkKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUobm9ybWFsaXplZCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKG5vcm1hbGl6ZWQsIGNvbnRlbnQpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTZCQ0ZcdTY1RTVcdTY1NzBcdTYzNkUgKGRheXMpIC0tLS1cblxuICBwcml2YXRlIGRheVBhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhLyR7ZGF0ZUtleX0uanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8RGF5RGF0YSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBEYXlEYXRhO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHVGRjBDXHU1QzA2XHU4REYzXHU4RkM3OiAke3BhdGh9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxEYXlzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgRGF5RGF0YT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgY29uc3QgcmVhZHMgPSBmaWxlcy5maWxlc1xuICAgICAgLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoJy5qc29uJykpXG4gICAgICAubWFwKGFzeW5jIChmaWxlKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoIWRhdGVLZXkpIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XG4gICAgICAgICAgZGF5c1tkYXRlS2V5XSA9IEpTT04ucGFyc2UoY29udGVudCkgYXMgRGF5RGF0YTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHBhcnNlIGRheSBmaWxlOiAke2ZpbGV9YCwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuICAgIHJldHVybiBkYXlzO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NjVFNVx1NjcxRiBrZXlcdUZGMDhcdTYzMDlcdTY1RTVcdTY3MUZcdTk2NERcdTVFOEZcdUZGMENcdTY3MDBcdTY1QjBcdTU3MjhcdTUyNERcdUZGMDkgKi9cbiAgYXN5bmMgZ2V0RGF5S2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkga2V5cy5wdXNoKGRhdGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBrZXlzLnNvcnQoKS5yZXZlcnNlKCk7IC8vIFx1OTY0RFx1NUU4Rlx1RkYxQVx1NjcwMFx1NjVCMFx1NjVFNVx1NjcxRlx1NTcyOFx1NTI0RFxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIwNlx1OTg3NVx1NTJBMFx1OEY3RFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVxuICAgKiBAcGFyYW0gcGFnZSBcdTk4NzVcdTc4MDFcdUZGMDhcdTRFQ0UgMCBcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICogQHBhcmFtIHBhZ2VTaXplIFx1NkJDRlx1OTg3NVx1NjU3MFx1OTFDRlxuICAgKiBAcmV0dXJucyB7IGRheXMsIHRvdGFsLCBwYWdlLCBwYWdlU2l6ZSwgaGFzTW9yZSB9XG4gICAqL1xuICBhc3luYyBnZXREYXlzUGFnaW5hdGVkKHBhZ2UgPSAwLCBwYWdlU2l6ZSA9IDMwKTogUHJvbWlzZTx7XG4gICAgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAga2V5czogc3RyaW5nW107XG4gICAgdG90YWw6IG51bWJlcjtcbiAgICBwYWdlOiBudW1iZXI7XG4gICAgcGFnZVNpemU6IG51bWJlcjtcbiAgICBoYXNNb3JlOiBib29sZWFuO1xuICB9PiB7XG4gICAgY29uc3QgYWxsS2V5cyA9IGF3YWl0IHRoaXMuZ2V0RGF5S2V5cygpO1xuICAgIGNvbnN0IHRvdGFsID0gYWxsS2V5cy5sZW5ndGg7XG4gICAgY29uc3Qgc3RhcnQgPSBwYWdlICogcGFnZVNpemU7XG4gICAgY29uc3QgcGFnZUtleXMgPSBhbGxLZXlzLnNsaWNlKHN0YXJ0LCBzdGFydCArIHBhZ2VTaXplKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgY29uc3QgcmVhZHMgPSBwYWdlS2V5cy5tYXAoYXN5bmMgKGRhdGVLZXkpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldERheShkYXRlS2V5KTtcbiAgICAgICAgaWYgKGRhdGEpIGRheXNbZGF0ZUtleV0gPSBkYXRhO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBsb2FkIGRheTogJHtkYXRlS2V5fWAsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlYWRzKTtcblxuICAgIHJldHVybiB7XG4gICAgICBkYXlzLFxuICAgICAga2V5czogcGFnZUtleXMsXG4gICAgICB0b3RhbCxcbiAgICAgIHBhZ2UsXG4gICAgICBwYWdlU2l6ZSxcbiAgICAgIGhhc01vcmU6IHN0YXJ0ICsgcGFnZUtleXMubGVuZ3RoIDwgdG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHB1dERheShkYXlEYXRhOiBEYXlEYXRhKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRlS2V5ID0gZGF5RGF0YS5kYXRlO1xuICAgIGlmICghZGF0ZUtleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXlEYXRhIG11c3QgaGF2ZSBhIGRhdGUgZmllbGQnKTtcbiAgICB9XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcblxuICAgIC8vIFx1NTE5OVx1NUI4OFx1NTM2Qlx1RkYxQVx1NjhDMFx1NkQ0Qlx1NjU3MFx1NjM2RVx1OTFDRlx1NjBBQ1x1NUQxNlx1RkYwOFx1NTkxQVx1Njc2MVx1NjVGNlx1OTVGNFx1N0VCRiBcdTIxOTIgXHU4RkQxXHU0RTRFXHU3QTdBXHU1OEYzXHVGRjA5XG4gICAgaWYgKCF0aGlzLl93YXJuZWRQYXRocy5oYXMocGF0aCkpIHtcbiAgICAgIGNvbnN0IG5ld1RpbWVsaW5lTGVuID0gQXJyYXkuaXNBcnJheShkYXlEYXRhLnRpbWVsaW5lKSA/IGRheURhdGEudGltZWxpbmUubGVuZ3RoIDogMDtcbiAgICAgIGlmIChuZXdUaW1lbGluZUxlbiA8PSAxKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IEpTT04ucGFyc2UoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpKSBhcyBEYXlEYXRhO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdUaW1lbGluZUxlbiA9IEFycmF5LmlzQXJyYXkoZXhpc3RpbmcudGltZWxpbmUpID8gZXhpc3RpbmcudGltZWxpbmUubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ1RpbWVsaW5lTGVuID4gMTApIHtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShcbiAgICAgICAgICAgICAgICBgXHUyNkEwXHVGRTBGIFx1NjhDMFx1NkQ0Qlx1NTIzMCAke2RhdGVLZXl9IFx1NjU3MFx1NjM2RVx1NUYwMlx1NUUzOFx1NkUwNVx1N0E3QVx1RkYwOCR7ZXhpc3RpbmdUaW1lbGluZUxlbn0gXHU2NzYxIFx1MjE5MiAke25ld1RpbWVsaW5lTGVufSBcdTY3NjFcdUZGMDlcdUZGMENcdTVERjJcdTgxRUFcdTUyQThcdTYyRTZcdTYyMkFcdTMwMDJcXG5cdTU5ODJcdTY3OUNcdTc4NkVcdTVCOUVcdTg5ODFcdTZFMDVcdTdBN0FcdThCRTVcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMENcdThCRjdcdTUxOERcdTZCMjFcdTY0Q0RcdTRGNUNcdTMwMDJgXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHRoaXMuX3dhcm5lZFBhdGhzLmFkZChwYXRoKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7IC8qIFx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1NjIxNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1N0VFN1x1N0VFRFx1NkI2M1x1NUUzOFx1NTE5OVx1NTE2NSAqLyB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRheURhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZURheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDcgKGdvYWxzKSAtLS0tXG5cbiAgcHJpdmF0ZSBnb2Fsc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9nb2Fscy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRHb2FscygpOiBQcm9taXNlPEdvYWxJdGVtW10+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEdvYWxJdGVtW107XG4gIH1cblxuICBhc3luYyBwdXRHb2Fscyhnb2FsczogR29hbEl0ZW1bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuXG4gICAgLy8gXHU1MTk5XHU1Qjg4XHU1MzZCXHVGRjFBXHU2OEMwXHU2RDRCXHU2NTcwXHU2MzZFXHU5MUNGXHU2MEFDXHU1RDE2XHVGRjA4Tlx1Njc2MVx1NzZFRVx1NjgwNyBcdTIxOTIgXHU3QTdBXHU2NTcwXHU3RUM0XHVGRjA5XG4gICAgaWYgKGdvYWxzLmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5fd2FybmVkUGF0aHMuaGFzKHBhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBleGlzdGluZyA9IEpTT04ucGFyc2UoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpKSBhcyBHb2FsSXRlbVtdO1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGV4aXN0aW5nKSAmJiBleGlzdGluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICAgICBgXHUyNkEwXHVGRTBGIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NzZFRVx1NjgwN1x1NjU3MFx1NjM2RVx1NUYwMlx1NUUzOFx1NkUwNVx1N0E3QVx1RkYwOCR7ZXhpc3RpbmcubGVuZ3RofSBcdTY3NjEgXHUyMTkyIFx1N0E3QVx1RkYwOVx1RkYwQ1x1NURGMlx1ODFFQVx1NTJBOFx1NjJFNlx1NjIyQVx1MzAwMlxcblx1NTk4Mlx1Njc5Q1x1Nzg2RVx1NUI5RVx1ODk4MVx1NkUwNVx1N0E3QVx1NjI0MFx1NjcwOVx1NzZFRVx1NjgwN1x1RkYwQ1x1OEJGN1x1NTE4RFx1NkIyMVx1NjRDRFx1NEY1Q1x1MzAwMmBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLl93YXJuZWRQYXRocy5hZGQocGF0aCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHU2MjE2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU3RUU3XHU3RUVEXHU2QjYzXHU1RTM4XHU1MTk5XHU1MTY1ICovIH1cbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBKU09OLnBhcnNlKGRhdGEpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgMik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHsgW2tleV06IHZhbHVlIH0sIG51bGwsIDIpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxTZXR0aW5ncygpOiBQcm9taXNlPEFwcFNldHRpbmdzPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBBcHBTZXR0aW5ncztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1OEQyRFx1NEU3MFx1NTM4Nlx1NTNGMiAocHVyY2hhc2UtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBwdXJjaGFzZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcHVyY2hhc2UtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRQdXJjaGFzZUhpc3RvcnkoKTogUHJvbWlzZTxQdXJjaGFzZUhpc3RvcnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBQdXJjaGFzZUhpc3Rvcnk7XG4gIH1cblxuICBhc3luYyBwdXRQdXJjaGFzZUhpc3RvcnkoZGF0YTogUHVyY2hhc2VIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMiAoaW5jb21lLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgaW5jb21lSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9pbmNvbWUtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRJbmNvbWVIaXN0b3J5KCk6IFByb21pc2U8SW5jb21lSGlzdG9yeSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBJbmNvbWVIaXN0b3J5O1xuICB9XG5cbiAgYXN5bmMgcHV0SW5jb21lSGlzdG9yeShkYXRhOiBJbmNvbWVIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTVCRkNcdTUxRkEvXHU1QkZDXHU1MTY1IC0tLS1cblxuICBhc3luYyBleHBvcnRBbGxEYXRhKCk6IFByb21pc2U8RXhwb3J0U2hhcGU+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiB1bmtub3duLCBvcHRpb25zOiB7IHN0cmF0ZWd5PzogJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIH0gPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gICAgY29uc3Qgc3RyYXRlZ3kgPSBvcHRpb25zLnN0cmF0ZWd5ID8/ICdvdmVyd3JpdGUnO1xuXG4gICAgLy8gUDJcdUZGMUFcdTVCRkNcdTUxNjVcdTUyNERcdTY4MjFcdTlBOEMgKyBcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdUZGMUJcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTU3MjhcdTZCNjRcdTg4QUJcdTYyRDJcdTdFRERcdUZGMENcdTRFMERcdTZDNjFcdTY3RDMgVmF1bHRcbiAgICBjb25zdCByZWNvcmQgPSBJbXBvcnRWYWxpZGF0b3IudmFsaWRhdGUoZGF0YSk7XG5cbiAgICBpZiAocmVjb3JkLmRheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gXHU5NjMyXHU1RkExXHVGRjFBZGF5cyBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTdBN0FcdTVCRjlcdThDNjFcdTg4NjhcdTc5M0FcdTZFMDVcdTdBN0FcdTUxNjhcdTkwRThcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMDhcdTRFQzUgb3ZlcndyaXRlIFx1OEJFRFx1NEU0OVx1NEUwQlx1NTE0MVx1OEJCOFx1RkYwOVxuICAgICAgY29uc3QgZGF5cyA9IChyZWNvcmQuZGF5cyAmJiB0eXBlb2YgcmVjb3JkLmRheXMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHJlY29yZC5kYXlzKSlcbiAgICAgICAgPyByZWNvcmQuZGF5c1xuICAgICAgICA6IHt9O1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnb3ZlcndyaXRlJykge1xuICAgICAgICBhd2FpdCB0aGlzLmNsZWFyQWxsRGF5cygpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBkYXkgb2YgT2JqZWN0LnZhbHVlcyhkYXlzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dERheShkYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWNvcmQuZ29hbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgaW5jb21pbmc6IEdvYWxJdGVtW10gPSBBcnJheS5pc0FycmF5KHJlY29yZC5nb2FscykgPyByZWNvcmQuZ29hbHMgOiBbXTtcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ21lcmdlJykge1xuICAgICAgICAvLyBcdTU0MDhcdTVFNzZcdUZGMUFcdTRGRERcdTc1NTlcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTVCRkNcdTUxNjVcdTc2RUVcdTY4MDdcdTYzMDkgaWQgXHU4OTg2XHU3NkQ2XHVGRjFCXHU3QTdBXHU2NTcwXHU3RUM0XHU0RTBEXHU4OUU2XHU1M0QxXHU2RTA1XHU3QTdBXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKGF3YWl0IHRoaXMuZ2V0R29hbHMoKSkgfHwgW107XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXAoZXhpc3RpbmcubWFwKChnKSA9PiBbZy5pZCwgZ10pKTtcbiAgICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGluY29taW5nKSB7XG4gICAgICAgICAgaWYgKGdvYWwgJiYgZ29hbC5pZCkgbWVyZ2VkLnNldChnb2FsLmlkLCBnb2FsKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKEFycmF5LmZyb20obWVyZ2VkLnZhbHVlcygpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvdmVyd3JpdGVcdUZGMUFcdTY1NzRcdTRGNTNcdTY2RkZcdTYzNjJcdUZGMDhcdTdBN0FcdTY1NzBcdTdFQzQgPSBcdTZFMDVcdTdBN0FcdUZGMENcdTdCMjZcdTU0MDhcdTk4ODRcdTY3MUZcdThCRURcdTRFNDlcdUZGMDlcbiAgICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhpbmNvbWluZyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmIHJlY29yZC5zZXR0aW5ncyAmJiB0eXBlb2YgcmVjb3JkLnNldHRpbmdzID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgaW5jb21pbmcgPSByZWNvcmQuc2V0dGluZ3M7XG4gICAgICBsZXQgdG9Xcml0ZTogQXBwU2V0dGluZ3M7XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdtZXJnZScpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSAoYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpKSB8fCB7fTtcbiAgICAgICAgdG9Xcml0ZSA9IHsgLi4uZXhpc3RpbmcsIC4uLmluY29taW5nIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b1dyaXRlID0gaW5jb21pbmc7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUodGhpcy5zZXR0aW5nc1BhdGgoKSwgSlNPTi5zdHJpbmdpZnkodG9Xcml0ZSwgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIGlmIChyZWNvcmQucHVyY2hhc2VIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0UHVyY2hhc2VIaXN0b3J5KHJlY29yZC5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmluY29tZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRJbmNvbWVIaXN0b3J5KHJlY29yZC5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU0RUM1XHU2RTA1XHU3QTdBXHU2MjQwXHU2NzA5XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjA4b3ZlcndyaXRlIFx1NUJGQ1x1NTE2NSBkYXlzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwQ1x1NEUwRFx1NUY3MVx1NTRDRCBnb2Fscy9zZXR0aW5nc1x1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbERheXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhkYXRhRGlyKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcihkYXRhRGlyLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgfVxuXG4gIC8qKiBcdTRFQzVcdTZFMDVcdTdBN0FcdThCQkVcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMDhvdmVyd3JpdGUgXHU1QkZDXHU1MTY1IHNldHRpbmdzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2xlYXJBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKHRoaXMuYmFzZVBhdGgsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICB9XG5cbiAgLy8gLS0tLSBNYXJrZG93biBcdTY0NThcdTg5ODEgLS0tLVxuXG4gIHByaXZhdGUgcmV2aWV3UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3Jldmlld3MvJHtkYXRlS2V5fS5tZGApO1xuICB9XG5cbiAgYXN5bmMgd3JpdGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcsIG1hcmtkb3duOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIG1hcmtkb3duKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIEltcG9ydFZhbGlkYXRvciAtIFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1NzY4NFx1NjgyMVx1OUE4Q1x1NEUwRVx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1RkYwOFx1NUJCRlx1NEUzQlx1NEZBN1x1RkYwQ1x1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwOVxuICpcbiAqIFx1NzUyOFx1OTAxNFx1RkYxQVx1NTcyOCBWYXVsdFN0b3JhZ2UuaW1wb3J0RGF0YSBcdTg0M0RcdTc2RDhcdTUyNERcdTYyRTZcdTYyMkFcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTMwMDFcdTg4NjVcdTlGNTBcdTdGM0FcdTU5MzFcdTVCNTdcdTZCQjVcdUZGMENcbiAqIFx1OTA3Rlx1NTE0RFx1NTM0QVx1NjIyQS9cdTk3NUVcdTZDRDVcdTY1NzBcdTYzNkVcdTZDNjFcdTY3RDMgVmF1bHRcdTMwMDJcbiAqXG4gKiBcdThCQkVcdThCQTFcdTUzOUZcdTUyMTlcdUZGMUFcbiAqICAtIFx1NEVDNVx1NTA1QVwiXHU3RUQzXHU2Nzg0XHU1QzQyXHU5NzYyXHU3Njg0XHU1Qjg5XHU1MTY4XHU1MTVDXHU1RTk1XCJcdUZGMENcdTRFMERcdTkxQ0RcdTUxOTlcdTRFMUFcdTUyQTFcdTVCNTdcdTZCQjVcdUZGMDhcdTU5ODIgbWV0cmljcyBcdTc2ODRcdTUxNzdcdTRGNTNcdTY1NzBcdTUwM0NcdUZGMDlcdTMwMDJcbiAqICAtIFx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1NEYxOFx1NTE0OFx1NzUyOFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1ODFFQVx1OEVBQlx1NzY4NCBrZXkgLyBcdTUxODVcdTVCQjlcdUZGMENcdTdGM0FcdTU5MzFcdTY1RjZcdTYyNERcdTc1MjhcdTVCODlcdTUxNjhcdTlFRDhcdThCQTRcdTUwM0NcdTMwMDJcbiAqICAtIFx1NEVGQlx1NEY1NVx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NzY4NFx1N0VEM1x1Njc4NFx1NjAyN1x1NjM1Rlx1NTc0Rlx1OTBGRFx1NjI5QiBJbXBvcnRWYWxpZGF0aW9uRXJyb3JcdUZGMENcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTc5M0FcdTc1MjhcdTYyMzdcdTMwMDJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERheURhdGEsXG4gIEdvYWxJdGVtLFxuICBBcHBTZXR0aW5ncyxcbiAgUHVyY2hhc2VIaXN0b3J5LFxuICBJbmNvbWVIaXN0b3J5LFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuY2xhc3MgSW1wb3J0VmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnSW1wb3J0VmFsaWRhdGlvbkVycm9yJztcbiAgfVxufVxuXG5jb25zdCBLTk9XTl9GSUVMRFMgPSBbJ2RheXMnLCAnZ29hbHMnLCAnc2V0dGluZ3MnLCAncHVyY2hhc2VIaXN0b3J5JywgJ2luY29tZUhpc3RvcnknXSBhcyBjb25zdDtcblxuLyoqXG4gKiBcdTdFQjVcdTZERjFcdTk2MzJcdTVGQTFcdUZGMUFcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTY2MkZcdTRFMERcdTUzRUZcdTRGRTFcdThGQjlcdTc1NENcdUZGMDhcdTUzRUZcdTgwRkRcdTY3NjVcdTgxRUFcdTRFRDZcdTRFQkFcdTUyMDZcdTRFQUIvXHU0RTBCXHU4RjdEXHU3Njg0XHU1OTA3XHU0RUZEXHVGRjA5XHUzMDAyXG4gKiBcdTU3MjhcdTg0M0RcdTc2RDhcdTUyNERcdTkwMTJcdTVGNTJcdTUxQzBcdTUzMTZcdTYyNDBcdTY3MDlcdTVCNTdcdTdCMjZcdTRFMzJcdTUzRjZcdTVCNTBcdUZGMENcdTUyNjVcdTc5QkIgSFRNTCBcdTY4MDdcdTdCN0VcdTMwMDFcdTRFOEJcdTRFRjZcdTU5MDRcdTc0MDZcdTVDNUVcdTYwMjdcbiAqIFx1NEUwRSBqYXZhc2NyaXB0Oi9kYXRhOiBcdTRGMkFcdTUzNEZcdThCQUVcdUZGMENcdTkwN0ZcdTUxNERcdTYwNzZcdTYxMEZcdThEMUZcdThGN0RcdTdFQ0YgaW5uZXJIVE1MIFx1NkUzMlx1NjdEM1x1ODlFNlx1NTNEMSBYU1NcdTMwMDJcbiAqIFx1NjcyQ1x1OTg3OVx1NzZFRVx1NjVFMFx1NUJDQ1x1NjU4N1x1NjcyQ1x1OTcwMFx1NkM0Mlx1RkYwQ1x1N0VERlx1NEUwMFx1NjU4N1x1NjcyQ1x1NTMxNlx1NjYyRlx1NUI4OVx1NTE2OFx1NzY4NFx1MzAwMlxuICovXG5mdW5jdGlvbiBzYW5pdGl6ZVN0cmluZyhpbnB1dDogdW5rbm93bik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSByZXR1cm4gaW5wdXQgYXMgc3RyaW5nO1xuICBjb25zdCBvdXQgPSBpbnB1dFxuICAgIC5yZXBsYWNlKC88W14+XSo+L2csICcnKSAvLyBcdTc5RkJcdTk2NjRcdTYyNDBcdTY3MDkgSFRNTCBcdTY4MDdcdTdCN0VcbiAgICAucmVwbGFjZSgvXFxzb25cXHcrXFxzKj1cXHMqXCJbXlwiXSpcIi9naSwgJycpIC8vIFx1NzlGQlx1OTY2NCBvbio9XCIuLi5cIlxuICAgIC5yZXBsYWNlKC9cXHNvblxcdytcXHMqPVxccyonW14nXSonL2dpLCAnJykgLy8gXHU3OUZCXHU5NjY0IG9uKj0nLi4uJ1xuICAgIC5yZXBsYWNlKC9cXHNvblxcdytcXHMqPVxccypbXlxccz5dKy9naSwgJycpIC8vIFx1NzlGQlx1OTY2NCBvbio9dmFsdWVcdUZGMDhcdTY1RTBcdTVGMTVcdTUzRjdcdUZGMDlcbiAgICAucmVwbGFjZSgvamF2YXNjcmlwdDovZ2ksICcnKSAvLyBcdTc5RkJcdTk2NjQgamF2YXNjcmlwdDogXHU0RjJBXHU1MzRGXHU4QkFFXG4gICAgLnJlcGxhY2UoL2RhdGE6L2dpLCAnJyk7IC8vIFx1NzlGQlx1OTY2NCBkYXRhOiBcdTRGMkFcdTUzNEZcdThCQUVcbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVWYWx1ZSh2YWx1ZTogdW5rbm93bik6IHVua25vd24ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIHNhbml0aXplU3RyaW5nKHZhbHVlKTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gdmFsdWUubWFwKCh2KSA9PiBzYW5pdGl6ZVZhbHVlKHYpKTtcbiAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBvdXQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModmFsdWUpKSB7XG4gICAgICBvdXRba2V5XSA9IHNhbml0aXplVmFsdWUoKHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuICByZXR1cm4gdmFsdWU7IC8vIFx1NjU3MFx1NUI1NyAvIFx1NUUwM1x1NUMxNCAvIG51bGwgXHU3QjQ5XHU1MzlGXHU2ODM3XHU0RkREXHU3NTU5XG59XG5cbmludGVyZmFjZSBWYWxpZGF0ZWRJbXBvcnQge1xuICBkYXlzPzogUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gIGdvYWxzPzogR29hbEl0ZW1bXTtcbiAgc2V0dGluZ3M/OiBBcHBTZXR0aW5ncztcbiAgcHVyY2hhc2VIaXN0b3J5PzogUHVyY2hhc2VIaXN0b3J5O1xuICBpbmNvbWVIaXN0b3J5PzogSW5jb21lSGlzdG9yeTtcbn1cblxuZXhwb3J0IGNvbnN0IEltcG9ydFZhbGlkYXRvciA9IHtcbiAgLyoqXG4gICAqIFx1NjgyMVx1OUE4Q1x1NUU3Nlx1ODg2NVx1OUY1MFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1MzAwMlxuICAgKiBAcmV0dXJucyBcdTg4NjVcdTlGNTBcdTU0MEVcdTc2ODRcdTVFNzJcdTUxQzBcdTY1NzBcdTYzNkVcdUZGMDhcdTdFRDNcdTY3ODRcdTRFMEVcdThGOTNcdTUxNjVcdTRFMDBcdTgxRjRcdUZGMENcdTRGNDZcdTVCNTdcdTZCQjVcdTVCOENcdTY1NzRcdUZGMDlcbiAgICogQHRocm93cyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IgXHU1RjUzXHU3RUQzXHU2Nzg0XHU2MzVGXHU1NzRGXHU2NUUwXHU2Q0Q1XHU0RkVFXHU1OTBEXHU2NUY2XG4gICAqL1xuICB2YWxpZGF0ZShkYXRhOiB1bmtub3duKTogVmFsaWRhdGVkSW1wb3J0IHtcbiAgICBpZiAoIWRhdGEgfHwgdHlwZW9mIGRhdGEgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIHRocm93IG5ldyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IoJ1x1NTkwN1x1NEVGRFx1NjU4N1x1NEVGNlx1NjgzQ1x1NUYwRlx1NjVFMFx1NjU0OFx1RkYxQVx1NjgzOVx1ODI4Mlx1NzBCOVx1NUZDNVx1OTg3Qlx1NjYyRiBKU09OIFx1NUJGOVx1OEM2MScpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZCA9IGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAvLyBcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTYyRDJcdTdFRERcdUZGMUFcdTZDQTFcdTY3MDlcdTRFRkJcdTRGNTVcdTVERjJcdTc3RTVcdTVCNTdcdTZCQjUgXHUyMTkyIFx1ODlDNlx1NEUzQVx1NjM1Rlx1NTc0Ri9cdTY1RTBcdTUxNzNcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBoYXNLbm93bkZpZWxkID0gS05PV05fRklFTERTLnNvbWUoKGYpID0+IHJlY29yZFtmXSAhPT0gdW5kZWZpbmVkKTtcbiAgICBpZiAoIWhhc0tub3duRmllbGQpIHtcbiAgICAgIHRocm93IG5ldyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IoXG4gICAgICAgICdcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcdTY1RTBcdTY1NDhcdUZGMUFcdTY3MkFcdTYyN0VcdTUyMzBcdTRFRkJcdTRGNTVcdTUzRUZcdThCQzZcdTUyMkJcdTc2ODRcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdUZGMDhkYXlzIC8gZ29hbHMgLyBzZXR0aW5ncyAvIHB1cmNoYXNlSGlzdG9yeSAvIGluY29tZUhpc3RvcnlcdUZGMDknXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdDogVmFsaWRhdGVkSW1wb3J0ID0ge307XG5cbiAgICBpZiAocmVjb3JkLmRheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmRheXMgPSBzYW5pdGl6ZVZhbHVlKEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVEYXlzKHJlY29yZC5kYXlzKSkgYXMgUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAgfVxuICAgIGlmIChyZWNvcmQuZ29hbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmdvYWxzID0gc2FuaXRpemVWYWx1ZShJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplR29hbHMocmVjb3JkLmdvYWxzKSkgYXMgR29hbEl0ZW1bXTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuc2V0dGluZ3MgPSBzYW5pdGl6ZVZhbHVlKEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVTZXR0aW5ncyhyZWNvcmQuc2V0dGluZ3MpKSBhcyBBcHBTZXR0aW5ncztcbiAgICB9XG4gICAgaWYgKHJlY29yZC5wdXJjaGFzZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LnB1cmNoYXNlSGlzdG9yeSA9IHNhbml0aXplVmFsdWUocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSkgYXMgUHVyY2hhc2VIaXN0b3J5O1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmluY29tZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmluY29tZUhpc3RvcnkgPSBzYW5pdGl6ZVZhbHVlKHJlY29yZC5pbmNvbWVIaXN0b3J5KSBhcyBJbmNvbWVIaXN0b3J5O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBkYXlzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1OTc1RVx1NUJGOVx1OEM2MVx1RkYwOFx1NTk4Mlx1NjU3MFx1N0VDNC9cdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDlcdTIxOTIgXHU4OUM2XHU0RTNBXHU2NUUwXHU2NUU1XHU2NTcwXHU2MzZFXHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU1QkY5XHU4QzYxXHVGRjA4XHU0RTBEXHU2QzYxXHU2N0QzIFZhdWx0XHVGRjA5XG4gICAqICAtIFx1NkJDRlx1NEUyQSBkYXkgXHU3RjNBIGRhdGUgXHU2NUY2XHU3NTI4XHU1MTc2IGtleSBcdTg4NjVcdTlGNTBcbiAgICogIC0gXHU2QkNGXHU0RTJBIGRheSBcdTdGM0EgbWV0cmljcy90aW1lbGluZS9nb2FscyBcdTY1RjZcdTg4NjVcdTdBN0FcdTdFRDNcdTY3ODRcbiAgICovXG4gIG5vcm1hbGl6ZURheXMoZGF5czogdW5rbm93bik6IFJlY29yZDxzdHJpbmcsIERheURhdGE+IHtcbiAgICBpZiAoIWRheXMgfHwgdHlwZW9mIGRheXMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF5cykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3QgcmF3ID0gZGF5cyBhcyBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICBjb25zdCBvdXQ6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyYXcpKSB7XG4gICAgICBjb25zdCBkYXkgPSByYXdba2V5XTtcbiAgICAgIGlmICghZGF5IHx8IHR5cGVvZiBkYXkgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF5KSkge1xuICAgICAgICBjb250aW51ZTsgLy8gXHU4REYzXHU4RkM3XHU5NzVFXHU1QkY5XHU4QzYxXHU2NzYxXHU3NkVFXG4gICAgICB9XG4gICAgICBjb25zdCBjbGVhbjogRGF5RGF0YSA9IHsgLi4uZGF5IH07XG4gICAgICBpZiAoIWNsZWFuLmRhdGUpIGNsZWFuLmRhdGUgPSBrZXk7IC8vIFx1NzUyOCBrZXkgXHU4ODY1IGRhdGVcbiAgICAgIGlmICghY2xlYW4ubWV0cmljcyB8fCB0eXBlb2YgY2xlYW4ubWV0cmljcyAhPT0gJ29iamVjdCcpIGNsZWFuLm1ldHJpY3MgPSB7fTtcbiAgICAgIGlmICghY2xlYW4udGltZWxpbmUgfHwgIUFycmF5LmlzQXJyYXkoY2xlYW4udGltZWxpbmUpKSBjbGVhbi50aW1lbGluZSA9IFtdO1xuICAgICAgaWYgKCFjbGVhbi5nb2FscyB8fCAhQXJyYXkuaXNBcnJheShjbGVhbi5nb2FscykpIGNsZWFuLmdvYWxzID0gW107XG4gICAgICBvdXRba2V5XSA9IGNsZWFuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgZ29hbHNcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU2NTcwXHU3RUM0XHVGRjFCXHU5NzVFXHU2NTcwXHU3RUM0IFx1MjE5MiBcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgICogIC0gXHU2QkNGXHU0RTJBIGdvYWwgXHU3RjNBIGlkIFx1NjVGNlx1ODg2NVx1NEUwMFx1NEUyQVx1N0EzM1x1NUI5QVx1NTNFRlx1NTkwRFx1NzNCMFx1NzY4NCBpZFxuICAgKi9cbiAgbm9ybWFsaXplR29hbHMoZ29hbHM6IHVua25vd24pOiBHb2FsSXRlbVtdIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ29hbHMpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICByZXR1cm4gZ29hbHMubWFwKChyYXcpOiBHb2FsSXRlbSA9PiB7XG4gICAgICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcgYXMgR29hbEl0ZW07XG4gICAgICBjb25zdCBvYmogPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBjb25zdCBjbGVhbiA9IHsgLi4ub2JqIH0gYXMgdW5rbm93biBhcyBHb2FsSXRlbTtcbiAgICAgIGlmICghY2xlYW4uaWQpIHtcbiAgICAgICAgY2xlYW4uaWQgPSBgZ29hbF9pbXBvcnRfJHtjb3VudGVyKyt9XyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9YDtcbiAgICAgIH1cbiAgICAgIGlmIChjbGVhbi5pdGVtcyAmJiAhQXJyYXkuaXNBcnJheShjbGVhbi5pdGVtcykpIGNsZWFuLml0ZW1zID0gW107XG4gICAgICByZXR1cm4gY2xlYW47XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBzZXR0aW5nc1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTk3NUVcdTVCRjlcdThDNjEgXHUyMTkyIFx1OEZENFx1NTZERVx1N0E3QVx1NUJGOVx1OEM2MVxuICAgKi9cbiAgbm9ybWFsaXplU2V0dGluZ3Moc2V0dGluZ3M6IHVua25vd24pOiBBcHBTZXR0aW5ncyB7XG4gICAgaWYgKCFzZXR0aW5ncyB8fCB0eXBlb2Ygc2V0dGluZ3MgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc2V0dGluZ3MpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHJldHVybiBzZXR0aW5ncyBhcyBBcHBTZXR0aW5ncztcbiAgfSxcbn07XG4iLCAiXG4vKipcbiAqIFRoZW1lQnJpZGdlIC0gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1RkYwQ1x1NjNBOFx1OTAwMVx1NTIzMCBpZnJhbWVcbiAqICAgICAgICAgICAgICArIFx1NTNDRFx1NTQxMVx1RkYxQVx1NjNBNVx1NjUzNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1MDNDXHVGRjBDXHU2Q0U4XHU1MTY1IE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICovXG5leHBvcnQgY2xhc3MgVGhlbWVCcmlkZ2Uge1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgX3BhbGV0dGVTeW5jVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gICAgLyoqIFx1NUI1OFx1NTBBOFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHU5NTJFXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFIHJlc3RvcmVEZWZhdWx0cyBcdTZFMDVcdTc0MDYgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTkpFQ1RFRF9WQVJTID0gW1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JyxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlcicsXG4gICAgICAnLS10ZXh0LWFjY2VudCcsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknLFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknLFxuICAgICAgJy0tdGV4dC1ub3JtYWwnLFxuICAgICAgJy0tdGV4dC1tdXRlZCcsXG4gICAgXTtcblxuICAgIC8qKiBcdTk2MzJcdTYyOTZcdTdBREVcdTYwMDFcdTY4MDdcdThCQjBcdUZGMUFyZXN0b3JlRGVmYXVsdHMgXHU4OEFCXHU4QzAzXHU3NTI4XHU1NDBFXHU4QkJFXHU0RTNBIHRydWVcdUZGMENcdTk2M0JcdTZCNjJcdTVFRjZcdThGREZcdTU2REVcdThDMDNcdTg5ODZcdTUxOTkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3VwcHJlc3NlZCA9IGZhbHNlO1xuXG4gIGF0dGFjaElmcmFtZShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gIH1cblxuICBkZXRhY2hJZnJhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTY2MEVcdTY2OTdcdTcyQjZcdTYwMDFcdUZGMDhcdTRFQzVcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgcHJpdmF0ZSBpc0RhcmtNb2RlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBDU1MgXHU5ODlDXHU4MjcyXHU1QjU3XHU3QjI2XHU0RTMyIFx1MjE5MiBbciwgZywgYl1cdUZGMDgwXHUyMDEzMjU1IFx1NjU3NFx1NjU3MFx1RkYwOVxuICAgKiBcdTY1MkZcdTYzMDEgcmdiKCkvcmdiYSgpLyNoZXhcdUZGMDgzIFx1NjIxNiA2IFx1NEY0RFx1RkYwOVx1RkYxQlx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1OEZENFx1NTZERSBudWxsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBwYXJzZUNvbG9yVG9SZ2IoY29sb3I6IHN0cmluZyk6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSB8IG51bGwge1xuICAgIGlmICghY29sb3IpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGMgPSBjb2xvci50cmltKCk7XG4gICAgbGV0IHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXI7XG5cbiAgICBjb25zdCByZ2JNYXRjaCA9IGMubWF0Y2goL3JnYmE/XFwoKFteKV0rKVxcKS9pKTtcbiAgICBpZiAocmdiTWF0Y2gpIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gcmdiTWF0Y2hbMV0uc3BsaXQoJywnKS5tYXAoKHMpID0+IHBhcnNlRmxvYXQocykpO1xuICAgICAgW3IsIGcsIGJdID0gcGFydHM7XG4gICAgfSBlbHNlIGlmIChjWzBdID09PSAnIycpIHtcbiAgICAgIGxldCBoZXggPSBjLnNsaWNlKDEpO1xuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpIGhleCA9IGhleC5zcGxpdCgnJykubWFwKChjaCkgPT4gY2ggKyBjaCkuam9pbignJyk7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHJldHVybiBudWxsO1xuICAgICAgciA9IHBhcnNlSW50KGhleC5zbGljZSgwLCAyKSwgMTYpO1xuICAgICAgZyA9IHBhcnNlSW50KGhleC5zbGljZSgyLCA0KSwgMTYpO1xuICAgICAgYiA9IHBhcnNlSW50KGhleC5zbGljZSg0LCA2KSwgMTYpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoW3IsIGcsIGJdLnNvbWUoKHYpID0+IGlzTmFOKHYpKSkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIFtNYXRoLnJvdW5kKHIpLCBNYXRoLnJvdW5kKGcpLCBNYXRoLnJvdW5kKGIpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgSFNMIFx1ODI3Mlx1NzZGOCBIXHVGRjA4MFx1MjAxMzM2MFx1RkYwOVxuICAgKiBcdTc1MjhcdTRFOEVcdTYyOEEgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU3Njg0IC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1NEUzQVx1NjNEMlx1NEVGNlx1NzY4NCAtLWFjY2VudC1odWVcbiAgICovXG4gIHN0YXRpYyByZ2JUb0h1ZShjb2xvcjogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgcmdiID0gVGhlbWVCcmlkZ2UucGFyc2VDb2xvclRvUmdiKGNvbG9yKTtcbiAgICBpZiAoIXJnYikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgW3IsIGcsIGJdID0gcmdiO1xuXG4gICAgY29uc3Qgcm4gPSByIC8gMjU1LCBnbiA9IGcgLyAyNTUsIGJuID0gYiAvIDI1NTtcbiAgICBjb25zdCBtYXggPSBNYXRoLm1heChybiwgZ24sIGJuKSwgbWluID0gTWF0aC5taW4ocm4sIGduLCBibiksIGQgPSBtYXggLSBtaW47XG4gICAgaWYgKGQgPT09IDApIHJldHVybiAwO1xuXG4gICAgbGV0IGg6IG51bWJlcjtcbiAgICBpZiAobWF4ID09PSBybikgaCA9ICgoZ24gLSBibikgLyBkKSAlIDY7XG4gICAgZWxzZSBpZiAobWF4ID09PSBnbikgaCA9IChibiAtIHJuKSAvIGQgKyAyO1xuICAgIGVsc2UgaCA9IChybiAtIGduKSAvIGQgKyA0O1xuXG4gICAgaCA9IE1hdGgucm91bmQoaCAqIDYwKTtcbiAgICByZXR1cm4gaCA8IDAgPyBoICsgMzYwIDogaDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgXCJyLCBnLCBiXCIgXHU0RTA5XHU1MTQzXHU3RUM0XHU1QjU3XHU3QjI2XHU0RTMyXG4gICAqIFx1NzUyOFx1NEU4RVx1NjI4QSBPYnNpZGlhbiBcdTRGQTdcdThGQjlcdTY4MEZcdTgwQ0NcdTY2NkYgLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSBcdTU0MENcdTZCNjVcdTRFM0FcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTVFOTVcdTgyNzJcdUZGMENcbiAgICogXHU4QkE5XHU2M0QyXHU0RUY2XHU1MzYxXHU3MjQ3XHU4MjcyXHU2RTI5XHU4RDM0XHU4RkQxIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKi9cbiAgc3RhdGljIHJnYlRvUmdiU3RyaW5nKGNvbG9yOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCByZ2IgPSBUaGVtZUJyaWRnZS5wYXJzZUNvbG9yVG9SZ2IoY29sb3IpO1xuICAgIGlmICghcmdiKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gcmdiLmpvaW4oJywgJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1NDExIGlmcmFtZSBcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTcyQjZcdTYwMDFcbiAgICogQHBhcmFtIGZvbGxvd09ic2lkaWFuVGhlbWUgXHU0RTNBIHRydWUgXHU2NUY2XHVGRjBDXHU5NjQ0XHU1RTI2XHU0RUNFIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFxuICAgKiAgICAgICAgLS1pbnRlcmFjdGl2ZS1hY2NlbnQgXHU1M0NEXHU2M0E4XHU3Njg0XHU2MTBGXHU1ODgzXHU4MjcyXHU3NkY4IGh1ZVx1RkYwQ1x1OUE3MVx1NTJBOFx1NjNEMlx1NEVGNlx1NjU3NFx1NzZEOFx1OTE0RFx1ODI3Mlx1ODA1NFx1NTJBOFxuICAgKi9cbiAgcHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUgPSBmYWxzZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIGNvbnN0IHBheWxvYWQ6IHsgaXNEYXJrOiBib29sZWFuOyBodWU/OiBudW1iZXI7IGJnPzogc3RyaW5nOyB0ZXh0Tm9ybWFsPzogc3RyaW5nOyB0ZXh0TXV0ZWQ/OiBzdHJpbmcgfSA9IHtcbiAgICAgIGlzRGFyazogdGhpcy5pc0RhcmtNb2RlKCksXG4gICAgfTtcblxuICAgIGlmIChmb2xsb3dPYnNpZGlhblRoZW1lKSB7XG4gICAgICBjb25zdCBhY2NlbnQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWludGVyYWN0aXZlLWFjY2VudCcpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCBodWUgPSBUaGVtZUJyaWRnZS5yZ2JUb0h1ZShhY2NlbnQpO1xuICAgICAgaWYgKGh1ZSAhPT0gbnVsbCkgcGF5bG9hZC5odWUgPSBodWU7XG5cbiAgICAgIC8vIFx1NEZBN1x1OEZCOVx1NjgwRlx1ODBDQ1x1NjY2Rlx1ODI3Mlx1RkYxQVx1OUE3MVx1NTJBOFx1NjNEMlx1NEVGNlx1NTM2MVx1NzI0N1x1NUU5NVx1ODI3Mlx1OEQzNFx1OEZEMSBPYnNpZGlhbiBcdTgyNzJcdTZFMjlcbiAgICAgIGNvbnN0IHNpZGViYXIgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWJhY2tncm91bmQtc2Vjb25kYXJ5JylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IGJnID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcoc2lkZWJhcik7XG4gICAgICBpZiAoYmcgIT09IG51bGwpIHBheWxvYWQuYmcgPSBiZztcblxuICAgICAgLy8gXHU2NTg3XHU1QjU3XHU4MjcyXHVGRjFBXHU5QTcxXHU1MkE4XHU2M0QyXHU0RUY2XHU2NTg3XHU1QjU3XHU4MjcyXHU2RTI5XHU4RDM0XHU4RkQxIE9ic2lkaWFuXG4gICAgICBjb25zdCB0ZXh0Tm9ybWFsID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW5vcm1hbCcpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCB0ZXh0Tm9ybWFsUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE5vcm1hbCk7XG4gICAgICBpZiAodGV4dE5vcm1hbFJnYiAhPT0gbnVsbCkgcGF5bG9hZC50ZXh0Tm9ybWFsID0gdGV4dE5vcm1hbFJnYjtcblxuICAgICAgY29uc3QgdGV4dE11dGVkID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW11dGVkJylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IHRleHRNdXRlZFJnYiA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHRleHRNdXRlZCk7XG4gICAgICBpZiAodGV4dE11dGVkUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHRNdXRlZCA9IHRleHRNdXRlZFJnYjtcbiAgICB9XG5cbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiAndGhlbWU6Y2hhbmdlZCcsXG4gICAgICAgIGlkOiAndGhlbWVfcHVzaF8nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgcGF5bG9hZCxcbiAgICAgIH0sXG4gICAgICAnKidcbiAgICApO1xuICB9XG5cbiAgLyoqIFx1NEY5Qlx1NTkxNlx1OTBFOFx1OEMwM1x1NzUyOFx1RkYxQU9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMSAqL1xuICBvblRoZW1lQ2hhbmdlZChmb2xsb3dPYnNpZGlhblRoZW1lID0gZmFsc2UpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hUaGVtZShmb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgfVxuXG4gIC8vID09PT09IFx1NTNDQ1x1NTQxMVx1OEMwM1x1ODI3MiA9PT09PVxuXG4gIC8qKlxuICAgKiBcdThCQTFcdTdCOTcgd2ViYXBwIFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTYgXHUyMTkyIE9ic2lkaWFuIENTUyBcdTUzRDhcdTkxQ0ZcdTY2MjBcdTVDMDRcbiAgICogXHU0RUM1XHU4OTg2XHU3NkQ2IDMgXHU3QzdCXHU2ODM4XHU1RkMzXHU4MjcyXHVGRjA4XHU1RjNBXHU4QzAzL1x1ODBDQ1x1NjY2Ri9cdTY1ODdcdTVCNTdcdUZGMDlcdUZGMENcdTUxNzZcdTRGNTlcdTc1MzEgT2JzaWRpYW4gXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU2M0E4XHU3Qjk3XG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZU9ic2lkaWFuVmFycyhodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGNvbnN0IGggPSBNYXRoLnJvdW5kKGh1ZSk7XG4gICAgY29uc3QgbG8gPSBNYXRoLm1heCgtMzAsIE1hdGgubWluKDMwLCBsaWdodG5lc3NPZmZzZXQpKTtcblxuICAgIC8vIFx1NUYzQVx1OEMwM1x1ODI3MlxuICAgIGNvbnN0IGFjY2VudFMgPSA0MDtcbiAgICBjb25zdCBhY2NlbnRMID0gaXNEYXJrID8gNTAgOiA0MDtcbiAgICBjb25zdCBhY2NlbnQgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEx9JSlgO1xuICAgIGNvbnN0IGFjY2VudEhvdmVyID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMICsgNX0lKWA7XG5cbiAgICAvLyBcdTgwQ0NcdTY2NkZcdTgyNzJcbiAgICBjb25zdCBiZ1MgPSBpc0RhcmsgPyA4IDogMTI7XG4gICAgY29uc3QgYmdMID0gaXNEYXJrXG4gICAgICA/IE1hdGgubWF4KDUsIDEyICsgbG8gKiAwLjMpXG4gICAgICA6IE1hdGgubWluKDk4LCA5NCArIGxvICogMC4xNSk7XG4gICAgY29uc3QgYmdQcmltYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2JnTH0lKWA7XG4gICAgY29uc3QgYmdTZWNvbmRhcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7aXNEYXJrID8gYmdMICsgMyA6IGJnTCAtIDJ9JSlgO1xuXG4gICAgLy8gXHU2NTg3XHU1QjU3XHU4MjcyXG4gICAgY29uc3QgdGV4dE5vcm1hbCA9IGlzRGFyayA/IGBoc2woJHtofSwgNiUsIDg4JSlgIDogYGhzbCgke2h9LCA2JSwgMTIlKWA7XG4gICAgY29uc3QgdGV4dE11dGVkICA9IGlzRGFyayA/IGBoc2woJHtofSwgNCUsIDU1JSlgIDogYGhzbCgke2h9LCA0JSwgNDUlKWA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJzogYWNjZW50SG92ZXIsXG4gICAgICAnLS10ZXh0LWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeSc6IGJnUHJpbWFyeSxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JzogYmdTZWNvbmRhcnksXG4gICAgICAnLS10ZXh0LW5vcm1hbCc6IHRleHROb3JtYWwsXG4gICAgICAnLS10ZXh0LW11dGVkJzogdGV4dE11dGVkLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU4QzAzXHU4MjcyXHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKiA1MG1zIGRlYm91bmNlXHVGRjBDXHU5NjMyXHU2QjYyXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1NkVEMVx1NTc1N1x1NUZFQlx1OTAxRlx1NjJENlx1NjJGRFx1NEVBN1x1NzUxRlx1OUFEOFx1OTg5MSBET00gXHU1MTk5XHU1MTY1XG4gICAqL1xuICBhcHBseVBhbGV0dGUoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcikgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9wYWxldHRlU3luY1RpbWVyKTtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IGZhbHNlOyAvLyBcdTY1QjBcdThDMDNcdTgyNzJcdThCRjdcdTZDNDJcdTUyMzBcdTY3NjUgXHUyMTkyIFx1ODlFM1x1OTY2NFx1NjI5MVx1NTIzNlxuICAgIHRoaXMuX3BhbGV0dGVTeW5jVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQpIHJldHVybjsgLy8gcmVzdG9yZURlZmF1bHRzIFx1NTcyOFx1OTYzMlx1NjI5Nlx1N0E5N1x1NTNFM1x1NTE4NVx1ODhBQlx1OEMwM1x1NzUyOFxuICAgICAgY29uc3QgdmFycyA9IFRoZW1lQnJpZGdlLmNvbXB1dGVPYnNpZGlhblZhcnMoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2YXJzKSkge1xuICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0sIDUwKTtcbiAgfVxuXG4gIC8qKiBcdTZFMDVcdTk2NjRcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1RkYwQ1x1NjA2Mlx1NTkwRCBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTlFRDhcdThCQTRcdTUwM0MgKi9cbiAgc3RhdGljIHJlc3RvcmVEZWZhdWx0cygpOiB2b2lkIHtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgVGhlbWVCcmlkZ2UuSU5KRUNURURfVkFSUykge1xuICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKiBcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDhcdTVCOENcdTY1NzRcdTUyMTdcdTg4NjhcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgPSBbXG4gICcubXAzJywgJy53YXYnLCAnLm9nZycsICcuZmxhYycsICcuYWFjJywgJy5tNGEnLCAnLndtYScsICcud2VibScsICcub3B1cycsXG5dO1xuXG4vKiogXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEIFx1MjE5MiBNSU1FIFx1N0M3Qlx1NTc4QiAqL1xuY29uc3QgQVVESU9fTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5tcDMnOiAgJ2F1ZGlvL21wZWcnLFxuICAnLndhdic6ICAnYXVkaW8vd2F2JyxcbiAgJy5vZ2cnOiAgJ2F1ZGlvL29nZycsXG4gICcuZmxhYyc6ICdhdWRpby9mbGFjJyxcbiAgJy5hYWMnOiAgJ2F1ZGlvL2FhYycsXG4gICcubTRhJzogICdhdWRpby9tcDQnLFxuICAnLndtYSc6ICAnYXVkaW8veC1tcy13bWEnLFxuICAnLndlYm0nOiAnYXVkaW8vd2VibScsXG4gICcub3B1cyc6ICdhdWRpby9vcHVzJyxcbn07XG5cbi8qKiBcdTVCOENcdTY1NzQgTUlNRSBcdTdDN0JcdTU3OEJcdTY2MjBcdTVDMDRcdUZGMDhcdTU0MkIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IE1JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcuaHRtbCc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmNzcyc6ICAndGV4dC9jc3M7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcubWpzJzogICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qc29uJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAnLnBuZyc6ICAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAgJ2ltYWdlL2pwZWcnLFxuICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICcuZ2lmJzogICdpbWFnZS9naWYnLFxuICAnLnN2Zyc6ICAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcuaWNvJzogICdpbWFnZS94LWljb24nLFxuICAnLndvZmYnOiAnZm9udC93b2ZmJyxcbiAgJy53b2ZmMic6J2ZvbnQvd29mZjInLFxuICAnLnR0Zic6ICAnZm9udC90dGYnLFxuICAuLi5BVURJT19NSU1FX1RZUEVTLFxufTtcbiIsICIvKipcbiAqIHByb3RvY29sLnRzIFx1MjAxNCBob3N0IFx1NEZBN1x1NTM0Rlx1OEJBRVx1N0M3Qlx1NTc4Qlx1OTU1Q1x1NTBDRlxuICpcbiAqIFx1NjcyQ1x1NjU4N1x1NEVGNlx1NjYyRiB3ZWJhcHAvYXNzZXRzL3NjcmlwdHMvdXRpbHMvcHJvdG9jb2wuanMgXHU3Njg0IFR5cGVTY3JpcHQgXHU1RTc2XHU4ODRDXHU1MjZGXHU2NzJDXHUzMDAyXG4gKiBcdTRFMjRcdTdBRUZcdTVGQzVcdTk4N0JcdTRGRERcdTYzMDEgUFJPVE9DT0xfVkVSU0lPTiBcdTRFMEUgQUxMX01FU1NBR0VfVFlQRVMgXHU1NDBDXHU2QjY1XHUzMDAyXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAtIFBST1RPQ09MX1ZFUlNJT05cdUZGMUFcdTUzNEZcdThCQUVcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTRFMjRcdTdBRUZcdTRFMDBcdTgxRjRcdUZGMDlcdUZGMUJcbiAqIC0gQUxMX01FU1NBR0VfVFlQRVNcdUZGMUF3ZWJhcHBcdTIxOTRob3N0IFx1NTNDQ1x1NTQxMVx1NTE2OFx1OTBFOFx1NURGMlx1NzdFNVx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4Qlx1NzY4NFx1NTM1NVx1NEUwMFx1NEU4Qlx1NUI5RVx1NkU5MFx1RkYxQlxuICogLSBJTkJPVU5EX1BSRUZJWEVTXHVGRjFBaG9zdCBcdTRGQTcgb25NZXNzYWdlIFx1NzY3RFx1NTQwRFx1NTM1NVx1RkYxQlxuICogLSBDb21tYW5kVHlwZVx1RkYxQVx1NUJGQ1x1ODIyQS9BY3Rpb24gXHU2MzA3XHU0RUU0XHU4MDU0XHU1NDA4XHU3QzdCXHU1NzhCXHVGRjA4V2ViYXBwQ29udHJvbGxlciBcdTRGN0ZcdTc1MjhcdUZGMDlcdTMwMDJcbiAqL1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vICBcdTUzNEZcdThCQUVcdTcyNDhcdTY3MkMgXHUyMDE0IFx1OTg3Qlx1NEUwRSB3ZWJhcHAvYXNzZXRzL3NjcmlwdHMvdXRpbHMvcHJvdG9jb2wuanMgXHU1NDBDXHU2QjY1XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBQUk9UT0NPTF9WRVJTSU9OID0gMTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyAgXHU2RDg4XHU2MDZGXHU1MjREXHU3RjAwXHVGRjA4aG9zdCBcdTRGQTcgb25NZXNzYWdlIFx1Njc2NVx1NkU5MFx1NTI0RFx1N0YwMFx1NzY3RFx1NTQwRFx1NTM1NVx1RkYwOVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgSU5CT1VORF9QUkVGSVhFUyA9IFsnc3RvcmFnZTonLCAnYXBwOicsICdmaWxlOicsICd0aGVtZTonXSBhcyBjb25zdDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyAgXHU1MTY4XHU5MEU4XHU1REYyXHU3N0U1IG1lc3NhZ2UgdHlwZVx1RkYwOFx1NTNDQ1x1NTQxMVx1RkYwOVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgQUxMX01FU1NBR0VfVFlQRVMgPSBbXG4gIC8vIC0tLS0gd2ViYXBwIFx1MjE5MiBob3N0IC0tLS1cbiAgJ2FwcDpyZWFkeScsXG4gICdhcHA6Y2xvc2UnLFxuICAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJyxcbiAgJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJyxcbiAgJ2FwcDp0aGVtZTpzeW5jJyxcbiAgJ3RoZW1lOnN5bmNQYWxldHRlJyxcbiAgJ2FwcDpsaXN0VmF1bHRBdWRpb0ZpbGVzJyxcbiAgJ2FwcDpyZWFkVmF1bHRGaWxlJyxcbiAgJ2FwcDpyZWFkTG9jYWxGaWxlJyxcbiAgJ2FwcDpwcm94eUF1ZGlvVXJsJyxcbiAgLy8gc3RvcmFnZToqXHVGRjA4MTcgXHU0RTJBXHU1QjUwXHU3QzdCXHU1NzhCXHVGRjA5XG4gICdzdG9yYWdlOnJlYWREYXknLFxuICAnc3RvcmFnZTp3cml0ZURheScsXG4gICdzdG9yYWdlOmxpc3REYXlzJyxcbiAgJ3N0b3JhZ2U6ZGVsZXRlRGF5JyxcbiAgJ3N0b3JhZ2U6Z2V0U2V0dGluZycsXG4gICdzdG9yYWdlOnB1dFNldHRpbmcnLFxuICAnc3RvcmFnZTpnZXRBbGxTZXR0aW5ncycsXG4gICdzdG9yYWdlOmdldEdvYWxzJyxcbiAgJ3N0b3JhZ2U6cHV0R29hbHMnLFxuICAnc3RvcmFnZTpnZXRQdXJjaGFzZUhpc3RvcnknLFxuICAnc3RvcmFnZTpwdXRQdXJjaGFzZUhpc3RvcnknLFxuICAnc3RvcmFnZTpnZXRJbmNvbWVIaXN0b3J5JyxcbiAgJ3N0b3JhZ2U6cHV0SW5jb21lSGlzdG9yeScsXG4gICdzdG9yYWdlOmdldERheUtleXMnLFxuICAnc3RvcmFnZTpnZXREYXlzUGFnaW5hdGVkJyxcbiAgJ3N0b3JhZ2U6ZXhwb3J0QWxsJyxcbiAgJ3N0b3JhZ2U6aW1wb3J0QWxsJyxcbiAgJ3N0b3JhZ2U6Y2xlYXJBbGwnLFxuXG4gIC8vIC0tLS0gaG9zdCBcdTIxOTIgd2ViYXBwIC0tLS1cbiAgJ3RoZW1lOmNoYW5nZWQnLFxuICAndGhlbWU6Zm9sbG93RGlzYWJsZWQnLFxuICAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgJ25hdjpwcmV2RGF5JyxcbiAgJ25hdjpuZXh0RGF5JyxcbiAgJ25hdjp0b2RheScsXG4gICdhY3Rpb246b3BlblN0YXRzJyxcbiAgJ2FjdGlvbjpvcGVuU2V0dGluZ3MnLFxuXSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgQXBwTWVzc2FnZVR5cGUgPSAodHlwZW9mIEFMTF9NRVNTQUdFX1RZUEVTKVtudW1iZXJdO1xuXG4vKiogbmF2OiAvIGFjdGlvbjogXHU2MzA3XHU0RUU0XHU3QzdCXHU1NzhCXHVGRjA4V2ViYXBwQ29udHJvbGxlciBcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbmV4cG9ydCB0eXBlIENvbW1hbmRUeXBlID0gRXh0cmFjdDxBcHBNZXNzYWdlVHlwZSwgYG5hdjoke3N0cmluZ31gIHwgYGFjdGlvbjoke3N0cmluZ31gPjtcbiIsICIvKipcbiAqIFdlYmFwcENvbnRyb2xsZXIgXHUyMDE0IFx1NUJCRlx1NEUzQiBcdTIxOTIgd2ViYXBwIFx1NzY4NFx1N0M3Qlx1NTc4Qlx1NTMxNlx1NzZGNFx1OEZERVx1NjNBNVx1NTNFM1x1RkYwOFBoYXNlM1x1RkYwOVxuICpcbiAqIFx1NjZGRlx1NEVFMyBtYWluLnRzIFx1NEUyRFx1NjU2M1x1ODQzRFx1NzY4NFx1NUI1N1x1N0IyNlx1NEUzMlx1NjMwN1x1NEVFNCBgc2VuZFRvV2ViYXBwKCduYXY6cHJldkRheScpYFx1MzAwMlxuICogXHU1QkJGXHU0RTNCXHU0RkE3XHU2NTM5XHU3NTI4IGBuYXZQcmV2RGF5KClgIFx1N0I0OVx1OEJFRFx1NEU0OVx1NTMxNlx1NjVCOVx1NkNENVx1OEMwM1x1NzUyOFx1RkYwQ1x1NTE4NVx1OTBFOFx1NEVDRFx1N0VDRlxuICogYERhaWx5UmV2aWV3Vmlldy5zZW5kQ29tbWFuZGAgXHU4RDcwXHU2NUUyXHU2NzA5IHBvc3RNZXNzYWdlIFx1N0VCRlx1NTM0Rlx1OEJBRVx1RkYwOGBuYXY6KmAvYGFjdGlvbjoqYFx1RkYwOVx1MjAxNFx1MjAxNFxuICogXHU1MzczXHUzMDBDXHU3NkY0XHU2M0E1IEFQSSBcdTk1RThcdTk3NjIgKyBcdTY1RTJcdTY3MDlcdTY4NjVcdTUxN0NcdTVCQjlcdTVDNDJcdTMwMERcdUZGMEN3ZWJhcHAgXHU0RkE3XHU2NUUwXHU5NzAwXHU2NTM5XHU1MkE4XHVGRjBDXHU1M0VGXHU1MjA2XHU2QjY1XHU1MjA3XHU2MzYyXHUzMDAyXG4gKlxuICogXHU4QkU1XHU4RkI5XHU3NTRDXHU0RkREXHU2MzAxXHU0RTBEXHU1MkE4XHVGRjFBd2ViYXBwIFx1NEVDRFx1OTAxQVx1OEZDNyBgbWVzc2FnZWAgXHU3NkQxXHU1NDJDIGB7dHlwZSxpZH1gIFx1NUU3Nlx1NTRDRFx1NUU5NFx1RkYwQ1xuICogXHU1NkUwXHU2QjY0XHU2NzJDXHU5MUNEXHU2Nzg0XHU5NkY2XHU1NkRFXHU1RjUyXHU5OENFXHU5NjY5XHUzMDAxXHU0RTE0XHU1M0VGXHU1NzI4XHU1QkJGXHU0RTNCXHU0RkE3XHU1MzU1XHU2RDRCXHU5NTAxXHU1QjlBXHU2MzA3XHU0RUU0XHU2NjIwXHU1QzA0XHUzMDAyXG4gKlxuICogQ29tbWFuZFR5cGUgXHU0RUNFIHByb3RvY29sLnRzIFx1OTZDNlx1NEUyRFx1NUI5QVx1NEU0OVx1RkYwOFx1OTYzNlx1NkJCNTMgXHUwMEI3IFx1NTk1MVx1N0VBNlx1NTMxNlx1RkYwOVx1RkYwQ1xuICogXHU2QjY0XHU1OTA0XHU5MUNEXHU1QkZDXHU1MUZBXHU0RUU1XHU0RkREXHU2MzAxXHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA4XHU2NUUyXHU2NzA5IGltcG9ydCB7IENvbW1hbmRUeXBlIH0gZnJvbSAnV2ViYXBwQ29udHJvbGxlcicgXHU0RTBEXHU3ODM0XHVGRjA5XHUzMDAyXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBDb21tYW5kVHlwZSB9IGZyb20gJy4vcHJvdG9jb2wnO1xuXG5leHBvcnQgdHlwZSB7IENvbW1hbmRUeXBlIH0gZnJvbSAnLi9wcm90b2NvbCc7XG5cbi8qKiBcdTYzMDdcdTRFRTRcdTRFMEJcdTUzRDFcdTc2RUVcdTY4MDdcdUZGMDhEYWlseVJldmlld1ZpZXcgXHU2RUUxXHU4REIzXHU2QjY0XHU1OTUxXHU3RUE2XHVGRjA5ICovXG5pbnRlcmZhY2UgQ29tbWFuZFRhcmdldCB7XG4gIHNlbmRDb21tYW5kKHR5cGU6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJhcHBDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBnZXRUYXJnZXQ6ICgpID0+IENvbW1hbmRUYXJnZXQgfCBudWxsKSB7fVxuXG4gIHByaXZhdGUgc2VuZCh0eXBlOiBDb21tYW5kVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGFyZ2V0KCk/LnNlbmRDb21tYW5kKHR5cGUpO1xuICB9XG5cbiAgLyoqIFx1NTI0RFx1NEUwMFx1NTkyOSAqL1xuICBuYXZQcmV2RGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnbmF2OnByZXZEYXknKTtcbiAgfVxuXG4gIC8qKiBcdTU0MEVcdTRFMDBcdTU5MjkgKi9cbiAgbmF2TmV4dERheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ25hdjpuZXh0RGF5Jyk7XG4gIH1cblxuICAvKiogXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5ICovXG4gIG5hdlRvZGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnbmF2OnRvZGF5Jyk7XG4gIH1cblxuICAvKiogXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwICovXG4gIG9wZW5TdGF0cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ2FjdGlvbjpvcGVuU3RhdHMnKTtcbiAgfVxuXG4gIC8qKiBcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUgKi9cbiAgb3BlblNldHRpbmdzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnYWN0aW9uOm9wZW5TZXR0aW5ncycpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuXG4vKiogT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU2Q0U4XHU1MTY1XHU3Njg0XHU0RTNCXHU3QTk3XHU1M0UzIGRvY3VtZW50XHVGRjA4XHU5NzVFIGlmcmFtZSBcdTUxODVcdTc2ODQgZG9jdW1lbnRcdUZGMDkgKi9cbmRlY2xhcmUgY29uc3QgYWN0aXZlRG9jdW1lbnQ6IERvY3VtZW50O1xuXG4vKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwICovXG5leHBvcnQgaW50ZXJmYWNlIE5vaXNlSXRlbSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgdHlwZTogJ3VybCcgfCAndmF1bHQnIHwgJ2dlbmVyYXRlZCc7XG4gIHVybD86IHN0cmluZztcbiAgcGF0aD86IHN0cmluZztcbiAgdm9sdW1lPzogbnVtYmVyO1xufVxuXG4vKiogXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhbWJvb1Jldmlld1NldHRpbmdzIHtcbiAgLyoqIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1NjgzOVx1OERFRlx1NUY4NCAqL1xuICBkYXRhUGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAqL1xuICBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG4gIC8qKiBcdTY3N0ZcdTU3NTdcdTdCQTFcdTc0MDZcdTkxNERcdTdGNkVcdUZGMDhKU09OIFx1ODlFM1x1Njc5MFx1NTQwRVx1N0VEM1x1Njc4NFx1NEUwRFx1NTZGQVx1NUI5QVx1RkYwQ1x1NEY3Rlx1NzUyOFx1NUJCRFx1Njc3RVx1N0M3Qlx1NTc4Qlx1RkYwOSAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDkgKi9cbiAgdGhlbWVQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTNcdUZGMDkgKi9cbiAgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTUyMTdcdTg4NjggKi9cbiAgbm9pc2VJdGVtczogTm9pc2VJdGVtW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVDMDYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjIgKi9cbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBib29sZWFuO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4QkE5XHU2M0QyXHU0RUY2XHU5MTREXHU4MjcyXHU4RERGXHU5NjhGIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1RkYwOFx1OEJGQlx1NTNENiAtLWludGVyYWN0aXZlLWFjY2VudCBcdTUzQ0RcdTYzQThcdTgyNzJcdTc2RjhcdUZGMDkgKi9cbiAgZm9sbG93T2JzaWRpYW5UaGVtZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEJhbWJvb1Jldmlld1NldHRpbmdzID0ge1xuICBkYXRhUGF0aDogJ2JhbWJvby1yZXZpZXcnLFxuICBlbmFibGVNYXJrZG93blN5bmM6IHRydWUsXG4gIHNlY3Rpb25Db25maWc6IG51bGwsXG4gIHRoZW1lUGF0aDogJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcsXG4gIG5vaXNlUGF0aDogJycsXG4gIG5vaXNlSXRlbXM6IFtdLFxuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGZhbHNlLFxuICBmb2xsb3dPYnNpZGlhblRoZW1lOiB0cnVlLFxufTtcblxuLyoqXG4gKiBQbHVnaW5TZXR0aW5ncyAtIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2V0dGluZ3MgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctc2V0dGluZ3MnKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgLSBcdThCQkVcdTdGNkUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyA9PT0gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODRcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NTcyOCBWYXVsdCBcdTRFMkRcdTc2ODRcdTVCNThcdTUwQThcdTc2RUVcdTVGNTVcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2JhbWJvby1yZXZpZXcnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aCA9IHZhbHVlIHx8ICdiYW1ib28tcmV2aWV3JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gTWFya2Rvd24gXHU2NDU4XHU4OTgxXHU1NDBDXHU2QjY1XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MScpXG4gICAgICAuc2V0RGVzYygnXHU2QkNGXHU2QjIxXHU0RkREXHU1QjU4XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1NzI4IHJldmlld3MvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzUxRlx1NjIxMFx1NTNFRlx1OEJGQlx1NzY4NCAubWQgXHU2NTg3XHU0RUY2JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTVCNThcdTY1M0VcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggLmpzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aCA9IHZhbHVlIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU3NjdEXHU1NjZBXHU5N0YzID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjMnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzknKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NjMwN1x1NUI5QVx1NTQwRVx1NEVDNVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1NTE4NVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1MzAwMlx1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NjU3NFx1NEUyQVx1NUU5M1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3NjdEXHU1NjZBXHU5N0YzIFx1NjIxNlx1NzU1OVx1N0E3QVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5MycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGggPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1OERERlx1OTY4RiBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTkxNERcdTgyNzInKVxuICAgICAgLnNldERlc2MoJ1x1NjI1M1x1NUYwMFx1NTQwRVx1RkYwQ1x1NjNEMlx1NEVGNlx1NjU3NFx1NEY1M1x1OTE0RFx1ODI3Mlx1NEYxQVx1OERERlx1OTY4Rlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTc2ODRcdTVGM0FcdThDMDNcdTgyNzJcdUZGMDgtLWludGVyYWN0aXZlLWFjY2VudFx1RkYwOVx1MzAwMlx1NTIwN1x1NjM2MiBCYW1ib28gQ2hpbmEgXHU3Njg0XHU3QUY5XHU1RjcxIC8gXHU1OEE4XHU1OTFDIC8gXHU4MEVEXHU4MTAyIC8gXHU5NzUyXHU3RUZGXHU3QjQ5XHU2MTBGXHU1ODgzXHU2NUY2XHVGRjBDXHU2M0QyXHU0RUY2XHU5MTREXHU4MjcyXHU5NjhGXHU0RTRCXHU4MDU0XHU1MkE4JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGFjdGl2ZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElGcmFtZUVsZW1lbnQ+KCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKCFmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgIC8vIFx1N0FDQlx1NTM3M1x1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NUYzQVx1OEMwM1x1ODI3Mlx1NTNDRFx1NjNBOFx1NzY4NFx1ODI3Mlx1NzZGOCArIFx1NEZBN1x1OEZCOVx1NjgwRlx1ODBDQ1x1NjY2Rlx1ODI3Mlx1NkUyOSArIFx1NjU4N1x1NUI1N1x1ODI3Mlx1NkUyOVxuICAgICAgICAgICAgICBjb25zdCBhY2NlbnQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0taW50ZXJhY3RpdmUtYWNjZW50JylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCBodWUgPSBUaGVtZUJyaWRnZS5yZ2JUb0h1ZShhY2NlbnQpO1xuICAgICAgICAgICAgICBjb25zdCBzaWRlYmFyID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWJhY2tncm91bmQtc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCBiZyA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHNpZGViYXIpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9ybWFsID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbm9ybWFsJylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9ybWFsUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE5vcm1hbCk7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHRNdXRlZCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW11dGVkJylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0TXV0ZWRSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0TXV0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBwYXlsb2FkOiB7IGlzRGFyazogYm9vbGVhbjsgaHVlPzogbnVtYmVyOyBiZz86IHN0cmluZzsgdGV4dE5vcm1hbD86IHN0cmluZzsgdGV4dE11dGVkPzogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAgICAgaXNEYXJrOiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpZiAoaHVlICE9PSBudWxsKSBwYXlsb2FkLmh1ZSA9IGh1ZTtcbiAgICAgICAgICAgICAgaWYgKGJnICE9PSBudWxsKSBwYXlsb2FkLmJnID0gYmc7XG4gICAgICAgICAgICAgIGlmICh0ZXh0Tm9ybWFsUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHROb3JtYWwgPSB0ZXh0Tm9ybWFsUmdiO1xuICAgICAgICAgICAgICBpZiAodGV4dE11dGVkUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHRNdXRlZCA9IHRleHRNdXRlZFJnYjtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1NTE3M1x1OTVFRFx1ODA1NFx1NTJBOCBcdTIxOTIgXHU5MDFBXHU3N0U1IGlmcmFtZSBcdTYwNjJcdTU5MERcdTc1MjhcdTYyMzdcdTYyNEJcdTUyQThcdThDMDNcdTgyNzJcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOmZvbGxvd0Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHt9LFxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1QzA2XHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMEN3ZWJhcHAgXHU1MTg1XHU2MEFDXHU2RDZFXHU4M0RDXHU1MzU1XHU3Njg0XHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1OEMwM1x1ODI3Mlx1NEYxQVx1NUI5RVx1NjVGNlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTc2ODRcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdTkxNERcdTgyNzInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJRnJhbWVFbGVtZW50PignLmJhbWJvby1yZXZpZXctZnJhbWUnKTtcbiAgICAgICAgICAgIGlmIChmcmFtZT8uY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgZW5hYmxlZDogdmFsdWUgfVxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gXHU1MTczXHU0RThFXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NTE3M1x1NEU4RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMVx1RkYxQVx1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBwbHVnaW5Cb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnQmFtYm9vIEltbW9ydGFsc1x1RkYwOFx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1RkYwOVx1NjYyRlx1NEUwMFx1NkIzRVx1NTdGQVx1NEU4RVx1ODJDRlx1ODA1NFx1NjNBN1x1NTIzNlx1OEJCQVx1NEU0Qlx1NzIzNlx1N0VGNFx1NTE0Qlx1NjI1OFx1MDBCN1x1NjgzQ1x1NTM2Mlx1NEVDMFx1NzlEMVx1NTkyQlx1NjNEMFx1NTFGQVx1NzY4NFwiT0dBU1wiXHU3NDA2XHU1RkY1XHVGRjBDXHU0RTEzXHU0RTNBXHU0RTJBXHU0RUJBXHU2MjUzXHU5MDIwXHU3Njg0XHU0RTJEXHU1NkZEXHU5OENFXHU3NkVFXHU2ODA3XHU4MUVBXHU1MkE4XHU1MzE2XHU1MjA2XHU5MTREXHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGXHUzMDAyJyxcbiAgICAgIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJ1xuICAgIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAyXHVGRjFBXHU0RjVDXHU4MDA1ICsgXHU0RjVDXHU1NEMxIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IGF1dGhvckJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkIGJhbWJvby1hYm91dC1hdXRob3InIH0pO1xuICAgIGNvbnN0IGF1dGhvclJvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvdycgfSk7XG4gICAgY29uc3QgYXZhdGFyID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdmF0YXInIH0pO1xuICAgIC8vIFx1NEVDRVx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NVx1OEJGQlx1NTNENlx1NTkzNFx1NTBDRlx1RkYwOFx1OTAxQVx1OEZDNyBWYXVsdCBBUEkgXHU4QkZCXHU1M0Q2IC5vYnNpZGlhbi9wbHVnaW5zLyBcdTRFMEJcdTc2ODRcdTgxRUFcdTY3MDlcdThENDRcdTZFOTBcdUZGMDlcbiAgICAvLyBmaXJlLWFuZC1mb3JnZXRcdUZGMUFcdTU5MzRcdTUwQ0ZcdTk3NUVcdTUxNzNcdTk1MkVcdUZGMENcdTUyQTBcdThGN0RcdTU5MzFcdThEMjVcdTk3NTlcdTlFRDhcdTY2M0VcdTc5M0FcdTlFRDhcdThCQTRcdTdBN0FcdTU5MzRcdTUwQ0ZcbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwbHVnaW5EaXIgPSB0aGlzLnBsdWdpbi5tYW5pZmVzdC5kaXIgPz8gJyc7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgICAgICAgIGAke3BsdWdpbkRpcn0vYXV0aG9yLWF2YXRhci5qcGdgLFxuICAgICAgICAgIGAke3BsdWdpbkRpcn0vd2ViYXBwL2Fzc2V0cy9pbWFnZXMvYXV0aG9yLWF2YXRhci5qcGdgLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IGF2YXRhclBhdGggb2YgY2FuZGlkYXRlcykge1xuICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGFkYXB0ZXIuZXhpc3RzKGF2YXRhclBhdGgpO1xuICAgICAgICAgIGlmICghZXhpc3RzKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBhdmF0YXJEYXRhID0gYXdhaXQgYWRhcHRlci5yZWFkQmluYXJ5KGF2YXRhclBhdGgpO1xuICAgICAgICAgIGNvbnN0IGI2NCA9IEJ1ZmZlci5mcm9tKGF2YXRhckRhdGEpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgICBhdmF0YXIuc2V0Q3NzU3R5bGVzKHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYHVybChkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCR7YjY0fSlgLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2lsZW50bHkgc2tpcCBcdTIwMTQgc2hvdyBkZWZhdWx0IGVtcHR5IGF2YXRhciAqLyB9XG4gICAgfSkoKTtcblxuXG4gICAgY29uc3QgYXV0aG9ySW5mbyA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLWluZm8nIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTdGQkRcdTlDREVcdTU0MUInLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLW5hbWUnIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTU1QjVcdTVCNTdcdTk5ODZcdTUyMUJcdTU5Q0JcdTRFQkEnLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvbGUnIH0pO1xuXG4gICAgLy8gXHU0RjVDXHU1NEMxXHU1MzNBXG4gICAgYXV0aG9yQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU0RjVDXHU1NEMxJywgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLWxhYmVsJyB9KTtcbiAgICBjb25zdCB3b3Jrc1JvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3Mtcm93JyB9KTtcblxuICAgIFt7IG5hbWU6ICdcdTdBRjlcdTUzRjZcdTk4REVcdTUyMDMnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1CYW1ib28tRGFydHMnIH0sXG4gICAgIHsgbmFtZTogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnIH1dLmZvckVhY2god29yayA9PiB7XG4gICAgICBjb25zdCB0YWcgPSB3b3Jrc1Jvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogd29yay5uYW1lLCBjbHM6ICdiYW1ib28tYWJvdXQtdGFnJyB9KTtcbiAgICAgIGlmICh3b3JrLnVybCkge1xuICAgICAgICB0YWcuc2V0Q3NzU3R5bGVzKHsgY3Vyc29yOiAncG9pbnRlcicgfSk7XG4gICAgICAgIHRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICB3aW5kb3cub3Blbih3b3JrLnVybCwgJ19ibGFuaycpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFx1ODA1NFx1N0NGQlx1NjVCOVx1NUYwRlxuICAgIGNvbnN0IGNvbnRhY3RCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCcgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1ODA1NFx1N0NGQlx1NjVCOVx1NUYwRicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1OTBBRVx1N0JCMVx1RkYxQXlhbnl1bGluMjEwMEBxcS5jb20nLCBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYycgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NUZBRVx1NEZFMVx1RkYxQXlhbmh1OTQnLCBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYycgfSk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFzQzs7O0FDQXRDLElBQUFDLG1CQUFrRDs7O0FDQWxELHNCQUE0RDs7O0FDOEI1RCxJQUFJLEtBQUs7QUFBVCxJQUFxQixNQUFNO0FBQTNCLElBQXdDLE1BQU07QUFFOUMsSUFBSSxPQUFPLElBQUksR0FBRztBQUFBLEVBQUM7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUE7QUFBQSxFQUFnQjtBQUFBLEVBQUc7QUFBQTtBQUFBLEVBQW9CO0FBQUMsQ0FBQztBQUVoSixJQUFJLE9BQU8sSUFBSSxHQUFHO0FBQUEsRUFBQztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FBQUE7QUFBQSxFQUFpQjtBQUFBLEVBQUc7QUFBQyxDQUFDO0FBRXZJLElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFcEYsSUFBSSxPQUFPLFNBQVUsSUFBSSxPQUFPO0FBQzVCLE1BQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQUNsQixXQUFTLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHO0FBQ3pCLE1BQUUsQ0FBQyxJQUFJLFNBQVMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUFBLEVBQ2pDO0FBRUEsTUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUNyQixXQUFTLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHO0FBQ3pCLGFBQVMsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQ2xDLFFBQUUsQ0FBQyxJQUFNLElBQUksRUFBRSxDQUFDLEtBQU0sSUFBSztBQUFBLElBQy9CO0FBQUEsRUFDSjtBQUNBLFNBQU8sRUFBRSxHQUFNLEVBQUs7QUFDeEI7QUFDQSxJQUFJLEtBQUssS0FBSyxNQUFNLENBQUM7QUFBckIsSUFBd0IsS0FBSyxHQUFHO0FBQWhDLElBQW1DLFFBQVEsR0FBRztBQUU5QyxHQUFHLEVBQUUsSUFBSSxLQUFLLE1BQU0sR0FBRyxJQUFJO0FBQzNCLElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQztBQUFyQixJQUF3QixLQUFLLEdBQUc7QUFBaEMsSUFBbUMsUUFBUSxHQUFHO0FBRTlDLElBQUksTUFBTSxJQUFJLElBQUksS0FBSztBQUN2QixLQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRSxHQUFHO0FBRXhCLE9BQU0sSUFBSSxVQUFXLEtBQU8sSUFBSSxVQUFXO0FBQy9DLE9BQU0sSUFBSSxVQUFXLEtBQU8sSUFBSSxVQUFXO0FBQzNDLE9BQU0sSUFBSSxVQUFXLEtBQU8sSUFBSSxTQUFXO0FBQzNDLE1BQUksQ0FBQyxNQUFPLElBQUksVUFBVyxLQUFPLElBQUksUUFBVyxNQUFPO0FBQzVEO0FBSlE7QUFGQztBQVVULElBQUksT0FBUSxTQUFVLElBQUksSUFBSSxHQUFHO0FBQzdCLE1BQUksSUFBSSxHQUFHO0FBRVgsTUFBSSxJQUFJO0FBRVIsTUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBRWxCLFNBQU8sSUFBSSxHQUFHLEVBQUUsR0FBRztBQUNmLFFBQUksR0FBRyxDQUFDO0FBQ0osUUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFBQSxFQUNyQjtBQUVBLE1BQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNuQixPQUFLLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHO0FBQ3JCLE9BQUcsQ0FBQyxJQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBTTtBQUFBLEVBQ3RDO0FBQ0EsTUFBSTtBQUNKLE1BQUksR0FBRztBQUVILFNBQUssSUFBSSxJQUFJLEtBQUssRUFBRTtBQUVwQixRQUFJLE1BQU0sS0FBSztBQUNmLFNBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUc7QUFFcEIsVUFBSSxHQUFHLENBQUMsR0FBRztBQUVQLFlBQUksS0FBTSxLQUFLLElBQUssR0FBRyxDQUFDO0FBRXhCLFlBQUksTUFBTSxLQUFLLEdBQUcsQ0FBQztBQUVuQixZQUFJLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU87QUFFM0IsaUJBQVMsSUFBSSxLQUFNLEtBQUssT0FBTyxHQUFJLEtBQUssR0FBRyxFQUFFLEdBQUc7QUFFNUMsYUFBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUk7QUFBQSxRQUN4QjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSixPQUNLO0FBQ0QsU0FBSyxJQUFJLElBQUksQ0FBQztBQUNkLFNBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUc7QUFDcEIsVUFBSSxHQUFHLENBQUMsR0FBRztBQUNQLFdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBTSxLQUFLLEdBQUcsQ0FBQztBQUFBLE1BQzlDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFDQSxTQUFPO0FBQ1g7QUFFQSxJQUFJLE1BQU0sSUFBSSxHQUFHLEdBQUc7QUFDcEIsS0FBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUU7QUFDdkIsTUFBSSxDQUFDLElBQUk7QUFESjtBQUVULEtBQVMsSUFBSSxLQUFLLElBQUksS0FBSyxFQUFFO0FBQ3pCLE1BQUksQ0FBQyxJQUFJO0FBREo7QUFFVCxLQUFTLElBQUksS0FBSyxJQUFJLEtBQUssRUFBRTtBQUN6QixNQUFJLENBQUMsSUFBSTtBQURKO0FBRVQsS0FBUyxJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUU7QUFDekIsTUFBSSxDQUFDLElBQUk7QUFESjtBQUdULElBQUksTUFBTSxJQUFJLEdBQUcsRUFBRTtBQUNuQixLQUFTLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixNQUFJLENBQUMsSUFBSTtBQURKO0FBR1QsSUFBeUMsT0FBcUIscUJBQUssS0FBSyxHQUFHLENBQUM7QUFFNUUsSUFBeUMsT0FBcUIscUJBQUssS0FBSyxHQUFHLENBQUM7QUFFNUUsSUFBSSxNQUFNLFNBQVUsR0FBRztBQUNuQixNQUFJLElBQUksRUFBRSxDQUFDO0FBQ1gsV0FBUyxJQUFJLEdBQUcsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHO0FBQy9CLFFBQUksRUFBRSxDQUFDLElBQUk7QUFDUCxVQUFJLEVBQUUsQ0FBQztBQUFBLEVBQ2Y7QUFDQSxTQUFPO0FBQ1g7QUFFQSxJQUFJLE9BQU8sU0FBVSxHQUFHLEdBQUcsR0FBRztBQUMxQixNQUFJLElBQUssSUFBSSxJQUFLO0FBQ2xCLFVBQVMsRUFBRSxDQUFDLElBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxPQUFRLElBQUksS0FBTTtBQUNuRDtBQUVBLElBQUksU0FBUyxTQUFVLEdBQUcsR0FBRztBQUN6QixNQUFJLElBQUssSUFBSSxJQUFLO0FBQ2xCLFVBQVMsRUFBRSxDQUFDLElBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssUUFBUyxJQUFJO0FBQ2hFO0FBRUEsSUFBSSxPQUFPLFNBQVUsR0FBRztBQUFFLFVBQVMsSUFBSSxLQUFLLElBQUs7QUFBRztBQUdwRCxJQUFJLE1BQU0sU0FBVSxHQUFHLEdBQUcsR0FBRztBQUN6QixNQUFJLEtBQUssUUFBUSxJQUFJO0FBQ2pCLFFBQUk7QUFDUixNQUFJLEtBQUssUUFBUSxJQUFJLEVBQUU7QUFDbkIsUUFBSSxFQUFFO0FBRVYsU0FBTyxJQUFJLEdBQUcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDO0FBc0JBLElBQUksS0FBSztBQUFBLEVBQ0w7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQTtBQUVKO0FBRUEsSUFBSSxNQUFNLFNBQVUsS0FBSyxLQUFLLElBQUk7QUFDOUIsTUFBSSxJQUFJLElBQUksTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2hDLElBQUUsT0FBTztBQUNULE1BQUksTUFBTTtBQUNOLFVBQU0sa0JBQWtCLEdBQUcsR0FBRztBQUNsQyxNQUFJLENBQUM7QUFDRCxVQUFNO0FBQ1YsU0FBTztBQUNYO0FBRUEsSUFBSSxRQUFRLFNBQVUsS0FBSyxJQUFJLEtBQUssTUFBTTtBQUV0QyxNQUFJLEtBQUssSUFBSSxRQUFRLEtBQUssT0FBTyxLQUFLLFNBQVM7QUFDL0MsTUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRztBQUNuQixXQUFPLE9BQU8sSUFBSSxHQUFHLENBQUM7QUFDMUIsTUFBSSxRQUFRLENBQUM7QUFFYixNQUFJLFNBQVMsU0FBUyxHQUFHLEtBQUs7QUFFOUIsTUFBSSxPQUFPLEdBQUc7QUFFZCxNQUFJO0FBQ0EsVUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBRXZCLE1BQUksT0FBTyxTQUFVQyxJQUFHO0FBQ3BCLFFBQUksS0FBSyxJQUFJO0FBRWIsUUFBSUEsS0FBSSxJQUFJO0FBRVIsVUFBSSxPQUFPLElBQUksR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHQSxFQUFDLENBQUM7QUFDckMsV0FBSyxJQUFJLEdBQUc7QUFDWixZQUFNO0FBQUEsSUFDVjtBQUFBLEVBQ0o7QUFFQSxNQUFJLFFBQVEsR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLE1BQU0sR0FBRztBQUVuRyxNQUFJLE9BQU8sS0FBSztBQUNoQixLQUFHO0FBQ0MsUUFBSSxDQUFDLElBQUk7QUFFTCxjQUFRLEtBQUssS0FBSyxLQUFLLENBQUM7QUFFeEIsVUFBSSxPQUFPLEtBQUssS0FBSyxNQUFNLEdBQUcsQ0FBQztBQUMvQixhQUFPO0FBQ1AsVUFBSSxDQUFDLE1BQU07QUFFUCxZQUFJLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFJLElBQUksSUFBSTtBQUNuRSxZQUFJLElBQUksSUFBSTtBQUNSLGNBQUk7QUFDQSxnQkFBSSxDQUFDO0FBQ1Q7QUFBQSxRQUNKO0FBRUEsWUFBSTtBQUNBLGVBQUssS0FBSyxDQUFDO0FBRWYsWUFBSSxJQUFJLElBQUksU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFO0FBRTlCLFdBQUcsSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSTtBQUMzQztBQUFBLE1BQ0osV0FDUyxRQUFRO0FBQ2IsYUFBSyxNQUFNLEtBQUssTUFBTSxNQUFNLEdBQUcsTUFBTTtBQUFBLGVBQ2hDLFFBQVEsR0FBRztBQUVoQixZQUFJLE9BQU8sS0FBSyxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssUUFBUSxLQUFLLEtBQUssTUFBTSxJQUFJLEVBQUUsSUFBSTtBQUN2RSxZQUFJLEtBQUssT0FBTyxLQUFLLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSTtBQUN6QyxlQUFPO0FBRVAsWUFBSSxNQUFNLElBQUksR0FBRyxFQUFFO0FBRW5CLFlBQUksTUFBTSxJQUFJLEdBQUcsRUFBRTtBQUNuQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUUsR0FBRztBQUU1QixjQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUM7QUFBQSxRQUMzQztBQUNBLGVBQU8sUUFBUTtBQUVmLFlBQUksTUFBTSxJQUFJLEdBQUcsR0FBRyxVQUFVLEtBQUssT0FBTztBQUUxQyxZQUFJLE1BQU0sS0FBSyxLQUFLLEtBQUssQ0FBQztBQUMxQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxNQUFLO0FBQ3JCLGNBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLE1BQU0sQ0FBQztBQUVsQyxpQkFBTyxJQUFJO0FBRVgsY0FBSSxJQUFJLEtBQUs7QUFFYixjQUFJLElBQUksSUFBSTtBQUNSLGdCQUFJLEdBQUcsSUFBSTtBQUFBLFVBQ2YsT0FDSztBQUVELGdCQUFJLElBQUksR0FBRyxJQUFJO0FBQ2YsZ0JBQUksS0FBSztBQUNMLGtCQUFJLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQyxHQUFHLE9BQU8sR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDO0FBQUEscUJBQzdDLEtBQUs7QUFDVixrQkFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsR0FBRyxPQUFPO0FBQUEscUJBQzdCLEtBQUs7QUFDVixrQkFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEdBQUcsR0FBRyxPQUFPO0FBQ3pDLG1CQUFPO0FBQ0gsa0JBQUksR0FBRyxJQUFJO0FBQUEsVUFDbkI7QUFBQSxRQUNKO0FBRUEsWUFBSSxLQUFLLElBQUksU0FBUyxHQUFHLElBQUksR0FBRyxLQUFLLElBQUksU0FBUyxJQUFJO0FBRXRELGNBQU0sSUFBSSxFQUFFO0FBRVosY0FBTSxJQUFJLEVBQUU7QUFDWixhQUFLLEtBQUssSUFBSSxLQUFLLENBQUM7QUFDcEIsYUFBSyxLQUFLLElBQUksS0FBSyxDQUFDO0FBQUEsTUFDeEI7QUFFSSxZQUFJLENBQUM7QUFDVCxVQUFJLE1BQU0sTUFBTTtBQUNaLFlBQUk7QUFDQSxjQUFJLENBQUM7QUFDVDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBR0EsUUFBSTtBQUNBLFdBQUssS0FBSyxNQUFNO0FBQ3BCLFFBQUksT0FBTyxLQUFLLE9BQU8sR0FBRyxPQUFPLEtBQUssT0FBTztBQUM3QyxRQUFJLE9BQU87QUFDWCxhQUFRLE9BQU8sS0FBSztBQUVoQixVQUFJLElBQUksR0FBRyxPQUFPLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRyxNQUFNLEtBQUs7QUFDL0MsYUFBTyxJQUFJO0FBQ1gsVUFBSSxNQUFNLE1BQU07QUFDWixZQUFJO0FBQ0EsY0FBSSxDQUFDO0FBQ1Q7QUFBQSxNQUNKO0FBQ0EsVUFBSSxDQUFDO0FBQ0QsWUFBSSxDQUFDO0FBQ1QsVUFBSSxNQUFNO0FBQ04sWUFBSSxJQUFJLElBQUk7QUFBQSxlQUNQLE9BQU8sS0FBSztBQUNqQixlQUFPLEtBQUssS0FBSztBQUNqQjtBQUFBLE1BQ0osT0FDSztBQUNELFlBQUksTUFBTSxNQUFNO0FBRWhCLFlBQUksTUFBTSxLQUFLO0FBRVgsY0FBSSxJQUFJLE1BQU0sS0FBSyxJQUFJLEtBQUssQ0FBQztBQUM3QixnQkFBTSxLQUFLLEtBQUssTUFBTSxLQUFLLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUN6QyxpQkFBTztBQUFBLFFBQ1g7QUFFQSxZQUFJLElBQUksR0FBRyxPQUFPLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRyxPQUFPLEtBQUs7QUFDaEQsWUFBSSxDQUFDO0FBQ0QsY0FBSSxDQUFDO0FBQ1QsZUFBTyxJQUFJO0FBQ1gsWUFBSSxLQUFLLEdBQUcsSUFBSTtBQUNoQixZQUFJLE9BQU8sR0FBRztBQUNWLGNBQUksSUFBSSxLQUFLLElBQUk7QUFDakIsZ0JBQU0sT0FBTyxLQUFLLEdBQUcsS0FBSyxLQUFLLEtBQUssR0FBRyxPQUFPO0FBQUEsUUFDbEQ7QUFDQSxZQUFJLE1BQU0sTUFBTTtBQUNaLGNBQUk7QUFDQSxnQkFBSSxDQUFDO0FBQ1Q7QUFBQSxRQUNKO0FBQ0EsWUFBSTtBQUNBLGVBQUssS0FBSyxNQUFNO0FBQ3BCLFlBQUksTUFBTSxLQUFLO0FBQ2YsWUFBSSxLQUFLLElBQUk7QUFDVCxjQUFJLFFBQVEsS0FBSyxJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksR0FBRztBQUM1QyxjQUFJLFFBQVEsS0FBSztBQUNiLGdCQUFJLENBQUM7QUFDVCxpQkFBTyxLQUFLLE1BQU0sRUFBRTtBQUNoQixnQkFBSSxFQUFFLElBQUksS0FBSyxRQUFRLEVBQUU7QUFBQSxRQUNqQztBQUNBLGVBQU8sS0FBSyxLQUFLLEVBQUU7QUFDZixjQUFJLEVBQUUsSUFBSSxJQUFJLEtBQUssRUFBRTtBQUFBLE1BQzdCO0FBQUEsSUFDSjtBQUNBLE9BQUcsSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLEdBQUcsSUFBSSxJQUFJLEdBQUcsSUFBSTtBQUMxQyxRQUFJO0FBQ0EsY0FBUSxHQUFHLEdBQUcsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEdBQUcsSUFBSTtBQUFBLEVBQ2pELFNBQVMsQ0FBQztBQUVWLFNBQU8sTUFBTSxJQUFJLFVBQVUsUUFBUSxJQUFJLEtBQUssR0FBRyxFQUFFLElBQUksSUFBSSxTQUFTLEdBQUcsRUFBRTtBQUMzRTtBQW9PQSxJQUFJLEtBQW1CLG9CQUFJLEdBQUcsQ0FBQztBQTZVL0IsSUFBSSxLQUFLLFNBQVUsR0FBRyxHQUFHO0FBQUUsU0FBTyxFQUFFLENBQUMsSUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0FBQUk7QUFFMUQsSUFBSSxLQUFLLFNBQVUsR0FBRyxHQUFHO0FBQUUsVUFBUSxFQUFFLENBQUMsSUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxLQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssUUFBUztBQUFHO0FBRXhHLElBQUksS0FBSyxTQUFVLEdBQUcsR0FBRztBQUFFLFNBQU8sR0FBRyxHQUFHLENBQUMsSUFBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUk7QUFBYTtBQXFRbkUsU0FBUyxZQUFZLE1BQU0sTUFBTTtBQUNwQyxTQUFPLE1BQU0sTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLFFBQVEsS0FBSyxLQUFLLFFBQVEsS0FBSyxVQUFVO0FBQzFFO0FBdWJBLElBQUksS0FBSyxPQUFPLGVBQWUsZUFBNkIsb0JBQUksWUFBWTtBQUU1RSxJQUFJLE1BQU07QUFDVixJQUFJO0FBQ0EsS0FBRyxPQUFPLElBQUksRUFBRSxRQUFRLEtBQUssQ0FBQztBQUM5QixRQUFNO0FBQ1YsU0FDTyxHQUFHO0FBQUU7QUFFWixJQUFJLFFBQVEsU0FBVSxHQUFHO0FBQ3JCLFdBQVMsSUFBSSxJQUFJLElBQUksT0FBSztBQUN0QixRQUFJLElBQUksRUFBRSxHQUFHO0FBQ2IsUUFBSSxNQUFNLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSTtBQUN0QyxRQUFJLElBQUksS0FBSyxFQUFFO0FBQ1gsYUFBTyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtBQUNwQyxRQUFJLENBQUM7QUFDRCxXQUFLLE9BQU8sYUFBYSxDQUFDO0FBQUEsYUFDckIsTUFBTSxHQUFHO0FBQ2QsWUFBTSxJQUFJLE9BQU8sTUFBTSxFQUFFLEdBQUcsSUFBSSxPQUFPLE1BQU0sRUFBRSxHQUFHLElBQUksT0FBTyxJQUFLLEVBQUUsR0FBRyxJQUFJLE1BQU8sT0FDOUUsS0FBSyxPQUFPLGFBQWEsUUFBUyxLQUFLLElBQUssUUFBUyxJQUFJLElBQUs7QUFBQSxJQUN0RSxXQUNTLEtBQUs7QUFDVixXQUFLLE9BQU8sY0FBYyxJQUFJLE9BQU8sSUFBSyxFQUFFLEdBQUcsSUFBSSxFQUFHO0FBQUE7QUFFdEQsV0FBSyxPQUFPLGNBQWMsSUFBSSxPQUFPLE1BQU0sRUFBRSxHQUFHLElBQUksT0FBTyxJQUFLLEVBQUUsR0FBRyxJQUFJLEVBQUc7QUFBQSxFQUNwRjtBQUNKO0FBNEhPLFNBQVMsVUFBVSxLQUFLLFFBQVE7QUFDbkMsTUFBSSxRQUFRO0FBQ1IsUUFBSSxJQUFJO0FBQ1IsYUFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLFFBQVEsS0FBSztBQUNqQyxXQUFLLE9BQU8sYUFBYSxNQUFNLE1BQU0sSUFBSSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUM7QUFDbkUsV0FBTztBQUFBLEVBQ1gsV0FDUyxJQUFJO0FBQ1QsV0FBTyxHQUFHLE9BQU8sR0FBRztBQUFBLEVBQ3hCLE9BQ0s7QUFDRCxRQUFJQyxNQUFLLE1BQU0sR0FBRyxHQUFHLElBQUlBLElBQUcsR0FBRyxJQUFJQSxJQUFHO0FBQ3RDLFFBQUksRUFBRTtBQUNGLFVBQUksQ0FBQztBQUNULFdBQU87QUFBQSxFQUNYO0FBQ0o7QUFLQSxJQUFJLE9BQU8sU0FBVSxHQUFHLEdBQUc7QUFBRSxTQUFPLElBQUksS0FBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtBQUFHO0FBRTVFLElBQUksS0FBSyxTQUFVLEdBQUcsR0FBRyxHQUFHO0FBQ3hCLE1BQUksTUFBTSxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsTUFBTSxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsS0FBSyxVQUFVLEVBQUUsU0FBUyxJQUFJLElBQUksSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUs7QUFDdEksTUFBSUMsTUFBSyxNQUFNLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLQSxJQUFHLENBQUMsR0FBRyxLQUFLQSxJQUFHLENBQUMsR0FBRyxNQUFNQSxJQUFHLENBQUM7QUFDOUcsU0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxLQUFLLE1BQU0sR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLEdBQUc7QUFDcEU7QUFFQSxJQUFJLFFBQVEsU0FBVSxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxLQUFLO0FBQzNDLE1BQUksTUFBTSxNQUFNLFlBQVksTUFBTSxNQUFNLFlBQVksT0FBTyxPQUFPLFlBQVksSUFBSSxJQUFJO0FBQ3RGLE1BQUksS0FBSyxNQUFNLE1BQU07QUFDckIsTUFBSSxLQUFLLElBQUk7QUFDVCxXQUFPLElBQUksSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUc7QUFDckMsVUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUc7QUFDZixlQUFPO0FBQUEsVUFDSCxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLElBQUk7QUFBQSxVQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSTtBQUFBLFVBQ3JCLE9BQU8sR0FBRyxHQUFHLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJO0FBQUEsVUFDeEM7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFFQSxRQUFJLElBQUk7QUFDSixVQUFJLEVBQUU7QUFBQSxFQUNkO0FBQ0EsU0FBTyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7QUFDMUI7QUF3eEJPLFNBQVMsVUFBVSxNQUFNLE1BQU07QUFDbEMsTUFBSSxRQUFRLENBQUM7QUFDYixNQUFJLElBQUksS0FBSyxTQUFTO0FBQ3RCLFNBQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxXQUFXLEVBQUUsR0FBRztBQUNsQyxRQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSTtBQUN4QixVQUFJLEVBQUU7QUFBQSxFQUNkO0FBQ0E7QUFDQSxNQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQztBQUN0QixNQUFJLENBQUM7QUFDRCxXQUFPLENBQUM7QUFDWixNQUFJLElBQUksR0FBRyxNQUFNLElBQUksRUFBRTtBQUN2QixNQUFJLElBQUksR0FBRyxNQUFNLElBQUksRUFBRSxLQUFLO0FBQzVCLE1BQUksR0FBRztBQUNILFFBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxFQUFFO0FBQ3hCLFFBQUksR0FBRyxNQUFNLEVBQUUsS0FBSztBQUNwQixRQUFJLEdBQUc7QUFDSCxVQUFJLEdBQUcsTUFBTSxLQUFLLEVBQUU7QUFDcEIsVUFBSSxHQUFHLE1BQU0sS0FBSyxFQUFFO0FBQUEsSUFDeEI7QUFBQSxFQUNKO0FBQ0EsTUFBSSxPQUFPLFFBQVEsS0FBSztBQUN4QixXQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHO0FBQ3hCLFFBQUlDLE1BQUssR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU1BLElBQUcsQ0FBQyxHQUFHLEtBQUtBLElBQUcsQ0FBQyxHQUFHLEtBQUtBLElBQUcsQ0FBQyxHQUFHLEtBQUtBLElBQUcsQ0FBQyxHQUFHLEtBQUtBLElBQUcsQ0FBQyxHQUFHLE1BQU1BLElBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxNQUFNLEdBQUc7QUFDckgsUUFBSTtBQUNKLFFBQUksQ0FBQyxRQUFRLEtBQUs7QUFBQSxNQUNkLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLGFBQWE7QUFBQSxJQUNqQixDQUFDLEdBQUc7QUFDQSxVQUFJLENBQUM7QUFDRCxjQUFNLEVBQUUsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUU7QUFBQSxlQUMxQixPQUFPO0FBQ1osY0FBTSxFQUFFLElBQUksWUFBWSxLQUFLLFNBQVMsR0FBRyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssSUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQUE7QUFFckUsWUFBSSxJQUFJLDhCQUE4QixHQUFHO0FBQUEsSUFDakQ7QUFBQSxFQUNKO0FBQ0EsU0FBTztBQUNYOzs7QUQ1bUZPLElBQU0sV0FBTixNQUFNLFNBQVE7QUFBQSxFQU9uQixZQUFZLEtBQVUsV0FBbUIsU0FBaUI7QUFKMUQsU0FBUSxXQUFxQixDQUFDO0FBRTlCLFNBQWlCLE9BQU87QUFHdEIsU0FBSyxNQUFNO0FBQ1gsU0FBSyxnQkFBWSwrQkFBYyxHQUFHLFNBQVMsU0FBUztBQUNwRCxTQUFLLFVBQVU7QUFBQSxFQUNqQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBV0EsT0FBTyxTQUFTLEtBQVUsV0FBbUIsU0FBZ0M7QUFDM0UsVUFBTSxVQUFNLCtCQUFjLEdBQUcsU0FBUyxTQUFTO0FBQy9DLFFBQUksSUFBSSxTQUFRLGNBQWMsSUFBSSxHQUFHO0FBQ3JDLFFBQUksQ0FBQyxHQUFHO0FBQ04sWUFBTSxPQUFPLElBQUksU0FBUSxLQUFLLFdBQVcsT0FBTztBQUNoRCxVQUFJLEtBQUssYUFBYSxJQUFJLE1BQU0sT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFlO0FBQzdELGdCQUFRO0FBQUEsVUFDTjtBQUFBLFVBQ0EsYUFBYSxRQUFRLEVBQUUsVUFBVSxPQUFPLENBQUM7QUFBQSxRQUMzQztBQUFBLE1BQ0YsQ0FBQztBQUNELGVBQVEsY0FBYyxJQUFJLEtBQUssQ0FBQztBQUFBLElBQ2xDO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLE1BQU0sZUFBZ0M7QUFDcEMsVUFBTSxVQUFVLEtBQUssSUFBSSxNQUFNO0FBRy9CLFVBQU0sS0FBSyxhQUFhLE9BQU87QUFFL0IsVUFBTSxrQkFBYywrQkFBYyxHQUFHLEtBQUssU0FBUyxXQUFXO0FBQzlELFFBQUk7QUFDSixRQUFJO0FBQ0YsYUFBTyxNQUFNLFFBQVEsS0FBSyxXQUFXO0FBQUEsSUFDdkMsUUFBUTtBQUNOLFlBQU0sSUFBSSxNQUFNLDJPQUFzRTtBQUFBLElBQ3hGO0FBSUEsVUFBTSxXQUFXLElBQUksS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3ZELFVBQU0sVUFBVSxJQUFJLGdCQUFnQixRQUFRO0FBQzVDLFNBQUssU0FBUyxLQUFLLE9BQU87QUFDMUIsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxNQUFjLGFBQWEsU0FBcUM7QUFDOUQsVUFBTSxtQkFBbUI7QUFDekIsVUFBTSxrQkFBYywrQkFBYyxHQUFHLEtBQUssU0FBUyxXQUFXO0FBQzlELFVBQU0sZ0JBQVksK0JBQWMsR0FBRyxLQUFLLFNBQVMsSUFBSSxnQkFBZ0IsRUFBRTtBQUV2RSxRQUFJLE1BQU0sS0FBSyxXQUFXLFNBQVMsV0FBVyxHQUFHO0FBRy9DLFVBQUksQ0FBRSxNQUFNLEtBQUssV0FBVyxTQUFTLFNBQVMsRUFBSTtBQUNsRCxZQUFNLFFBQVEsTUFBTSxLQUFLLGlCQUFpQixTQUFTLFNBQVM7QUFDNUQsVUFBSSxVQUFVLEtBQUssUUFBUztBQUM1QixjQUFRO0FBQUEsUUFDTiw4Q0FBMEIsS0FBSyxvQ0FBVyxLQUFLLE9BQU87QUFBQSxNQUN4RDtBQUFBLElBQ0Y7QUFFQSxRQUFJLENBQUMsS0FBSyxTQUFTO0FBQ2pCLGNBQVEsS0FBSyx3S0FBc0M7QUFDbkQ7QUFBQSxJQUNGO0FBRUEsVUFBTSxNQUFNLHNCQUFzQixLQUFLLElBQUksc0JBQXNCLEtBQUssT0FBTztBQUM3RSxZQUFRLElBQUksMEhBQXFDLEdBQUcsRUFBRTtBQUN0RCxRQUFJO0FBQ0YsWUFBTSxPQUFPLFVBQU0sNEJBQVcsRUFBRSxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQ3BELFVBQUksS0FBSyxTQUFTLE9BQU8sS0FBSyxVQUFVLE9BQU8sQ0FBQyxLQUFLLGFBQWE7QUFDaEUsY0FBTSxJQUFJLE1BQU0sb0RBQVksS0FBSyxNQUFNLEVBQUU7QUFBQSxNQUMzQztBQUNBLFlBQU0sS0FBSyxXQUFXLFNBQVMsS0FBSyxXQUFXO0FBRy9DLFVBQUk7QUFDRixjQUFNLFFBQVEsTUFBTSxXQUFXLEtBQUssT0FBTztBQUFBLE1BQzdDLFNBQVMsR0FBRztBQUNWLGdCQUFRLEtBQUssZ0hBQXFDLENBQUM7QUFBQSxNQUNyRDtBQUNBLGNBQVEsSUFBSSwrRUFBNkI7QUFBQSxJQUMzQyxTQUFTLEdBQUc7QUFDVixjQUFRLE1BQU0sK0RBQTRCLENBQUM7QUFDM0MsWUFBTSxJQUFJO0FBQUEsUUFDUixvREFBaUIsYUFBYSxRQUFRLEVBQUUsVUFBVSwwQkFBTTtBQUFBLE1BRTFEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsaUJBQWlCLFNBQXNCLFVBQTBDO0FBQzdGLFFBQUk7QUFDRixjQUFRLE1BQU0sUUFBUSxLQUFLLFFBQVEsR0FBRyxLQUFLO0FBQUEsSUFDN0MsUUFBUTtBQUNOLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxXQUFXLFNBQXNCLFFBQW9DO0FBR2pGLFVBQU0sUUFBUSxVQUFVLElBQUksV0FBVyxNQUFNLENBQUM7QUFDOUMsZUFBVyxDQUFDLFNBQVMsT0FBTyxLQUFLLE9BQU8sUUFBUSxLQUFLLEdBQUc7QUFDdEQsWUFBTSxVQUFNLCtCQUFjLFFBQVEsUUFBUSxVQUFVLEVBQUUsQ0FBQztBQUN2RCxVQUFJLENBQUMsSUFBSztBQUNWLFlBQU0sYUFBUywrQkFBYyxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsRUFBRTtBQUN2RCxZQUFNLEtBQUssZ0JBQWdCLFNBQVMsTUFBTTtBQUUxQyxZQUFNLFFBQVEsWUFBWSxRQUFRLFFBQVEsTUFBTSxFQUFFLE1BQU07QUFBQSxJQUMxRDtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsZ0JBQWdCLFNBQXNCLFVBQWlDO0FBQ25GLFVBQU0sUUFBUSxTQUFTLE1BQU0sR0FBRztBQUNoQyxRQUFJLE1BQU07QUFDVixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sU0FBUyxHQUFHLEtBQUs7QUFDekMsY0FBUSxNQUFNLE1BQU0sTUFBTSxNQUFNLENBQUM7QUFDakMsVUFBSSxPQUFPLENBQUUsTUFBTSxLQUFLLFdBQVcsU0FBUyxHQUFHLEdBQUk7QUFDakQsWUFBSTtBQUNGLGdCQUFNLFFBQVEsTUFBTSxHQUFHO0FBQUEsUUFDekIsUUFBUTtBQUFBLFFBRVI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsV0FBVyxTQUFzQixNQUFnQztBQUM3RSxRQUFJO0FBQ0YsYUFBTyxNQUFNLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDbEMsUUFBUTtBQUNOLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxlQUFXLE9BQU8sS0FBSyxVQUFVO0FBQy9CLFVBQUksZ0JBQWdCLEdBQUc7QUFBQSxJQUN6QjtBQUNBLFNBQUssV0FBVyxDQUFDO0FBQUEsRUFDbkI7QUFDRjtBQUFBO0FBbEthLFNBY0ksZ0JBQWdCLG9CQUFJLElBQTJCO0FBZHpELElBQU0sVUFBTjs7O0FFdkJQLElBQUFDLG1CQUE0RDs7O0FDQTVELElBQUFDLG1CQUFrRDs7O0FDb0JsRCxJQUFNLHdCQUFOLGNBQW9DLE1BQU07QUFBQSxFQUN4QyxZQUFZLFNBQWlCO0FBQzNCLFVBQU0sT0FBTztBQUNiLFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFDRjtBQUVBLElBQU0sZUFBZSxDQUFDLFFBQVEsU0FBUyxZQUFZLG1CQUFtQixlQUFlO0FBUXJGLFNBQVMsZUFBZSxPQUF3QjtBQUM5QyxNQUFJLE9BQU8sVUFBVSxTQUFVLFFBQU87QUFDdEMsUUFBTSxNQUFNLE1BQ1QsUUFBUSxZQUFZLEVBQUUsRUFDdEIsUUFBUSwyQkFBMkIsRUFBRSxFQUNyQyxRQUFRLDJCQUEyQixFQUFFLEVBQ3JDLFFBQVEsMkJBQTJCLEVBQUUsRUFDckMsUUFBUSxpQkFBaUIsRUFBRSxFQUMzQixRQUFRLFdBQVcsRUFBRTtBQUN4QixTQUFPO0FBQ1Q7QUFFQSxTQUFTLGNBQWMsT0FBeUI7QUFDOUMsTUFBSSxPQUFPLFVBQVUsU0FBVSxRQUFPLGVBQWUsS0FBSztBQUMxRCxNQUFJLE1BQU0sUUFBUSxLQUFLLEVBQUcsUUFBTyxNQUFNLElBQUksQ0FBQyxNQUFNLGNBQWMsQ0FBQyxDQUFDO0FBQ2xFLE1BQUksU0FBUyxPQUFPLFVBQVUsVUFBVTtBQUN0QyxVQUFNLE1BQStCLENBQUM7QUFDdEMsZUFBVyxPQUFPLE9BQU8sS0FBSyxLQUFLLEdBQUc7QUFDcEMsVUFBSSxHQUFHLElBQUksY0FBZSxNQUFrQyxHQUFHLENBQUM7QUFBQSxJQUNsRTtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsU0FBTztBQUNUO0FBVU8sSUFBTSxrQkFBa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNN0IsU0FBUyxNQUFnQztBQUN2QyxRQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxNQUFNLFFBQVEsSUFBSSxHQUFHO0FBQzVELFlBQU0sSUFBSSxzQkFBc0IsOEdBQXlCO0FBQUEsSUFDM0Q7QUFFQSxVQUFNLFNBQVM7QUFHZixVQUFNLGdCQUFnQixhQUFhLEtBQUssQ0FBQyxNQUFNLE9BQU8sQ0FBQyxNQUFNLE1BQVM7QUFDdEUsUUFBSSxDQUFDLGVBQWU7QUFDbEIsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxTQUEwQixDQUFDO0FBRWpDLFFBQUksT0FBTyxTQUFTLFFBQVc7QUFDN0IsYUFBTyxPQUFPLGNBQWMsZ0JBQWdCLGNBQWMsT0FBTyxJQUFJLENBQUM7QUFBQSxJQUN4RTtBQUNBLFFBQUksT0FBTyxVQUFVLFFBQVc7QUFDOUIsYUFBTyxRQUFRLGNBQWMsZ0JBQWdCLGVBQWUsT0FBTyxLQUFLLENBQUM7QUFBQSxJQUMzRTtBQUNBLFFBQUksT0FBTyxhQUFhLFFBQVc7QUFDakMsYUFBTyxXQUFXLGNBQWMsZ0JBQWdCLGtCQUFrQixPQUFPLFFBQVEsQ0FBQztBQUFBLElBQ3BGO0FBQ0EsUUFBSSxPQUFPLG9CQUFvQixRQUFXO0FBQ3hDLGFBQU8sa0JBQWtCLGNBQWMsT0FBTyxlQUFlO0FBQUEsSUFDL0Q7QUFDQSxRQUFJLE9BQU8sa0JBQWtCLFFBQVc7QUFDdEMsYUFBTyxnQkFBZ0IsY0FBYyxPQUFPLGFBQWE7QUFBQSxJQUMzRDtBQUVBLFdBQU87QUFBQSxFQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRQSxjQUFjLE1BQXdDO0FBQ3BELFFBQUksQ0FBQyxRQUFRLE9BQU8sU0FBUyxZQUFZLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDNUQsYUFBTyxDQUFDO0FBQUEsSUFDVjtBQUNBLFVBQU0sTUFBTTtBQUNaLFVBQU0sTUFBK0IsQ0FBQztBQUV0QyxlQUFXLE9BQU8sT0FBTyxLQUFLLEdBQUcsR0FBRztBQUNsQyxZQUFNLE1BQU0sSUFBSSxHQUFHO0FBQ25CLFVBQUksQ0FBQyxPQUFPLE9BQU8sUUFBUSxZQUFZLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFDekQ7QUFBQSxNQUNGO0FBQ0EsWUFBTSxRQUFpQixFQUFFLEdBQUcsSUFBSTtBQUNoQyxVQUFJLENBQUMsTUFBTSxLQUFNLE9BQU0sT0FBTztBQUM5QixVQUFJLENBQUMsTUFBTSxXQUFXLE9BQU8sTUFBTSxZQUFZLFNBQVUsT0FBTSxVQUFVLENBQUM7QUFDMUUsVUFBSSxDQUFDLE1BQU0sWUFBWSxDQUFDLE1BQU0sUUFBUSxNQUFNLFFBQVEsRUFBRyxPQUFNLFdBQVcsQ0FBQztBQUN6RSxVQUFJLENBQUMsTUFBTSxTQUFTLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxFQUFHLE9BQU0sUUFBUSxDQUFDO0FBQ2hFLFVBQUksR0FBRyxJQUFJO0FBQUEsSUFDYjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBT0EsZUFBZSxPQUE0QjtBQUN6QyxRQUFJLENBQUMsTUFBTSxRQUFRLEtBQUssR0FBRztBQUN6QixhQUFPLENBQUM7QUFBQSxJQUNWO0FBQ0EsUUFBSSxVQUFVO0FBQ2QsV0FBTyxNQUFNLElBQUksQ0FBQyxRQUFrQjtBQUNsQyxVQUFJLENBQUMsT0FBTyxPQUFPLFFBQVEsWUFBWSxNQUFNLFFBQVEsR0FBRyxFQUFHLFFBQU87QUFDbEUsWUFBTSxNQUFNO0FBQ1osWUFBTSxRQUFRLEVBQUUsR0FBRyxJQUFJO0FBQ3ZCLFVBQUksQ0FBQyxNQUFNLElBQUk7QUFDYixjQUFNLEtBQUssZUFBZSxTQUFTLElBQUksS0FBSyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFBQSxNQUNoRTtBQUNBLFVBQUksTUFBTSxTQUFTLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxFQUFHLE9BQU0sUUFBUSxDQUFDO0FBQy9ELGFBQU87QUFBQSxJQUNULENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLGtCQUFrQixVQUFnQztBQUNoRCxRQUFJLENBQUMsWUFBWSxPQUFPLGFBQWEsWUFBWSxNQUFNLFFBQVEsUUFBUSxHQUFHO0FBQ3hFLGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNGOzs7QURuSk8sSUFBTSxlQUFOLE1BQW1CO0FBQUEsRUFNeEIsWUFBWSxLQUFVLFdBQVcsaUJBQWlCO0FBRmxEO0FBQUEsU0FBUSxlQUFlLG9CQUFJLElBQVk7QUFHckMsU0FBSyxNQUFNO0FBQ1gsU0FBSyxlQUFXLGdDQUFjLFFBQVE7QUFBQSxFQUN4QztBQUFBO0FBQUEsRUFHQSxNQUFjLFVBQVUsS0FBNEI7QUFDbEQsVUFBTSxXQUFPLGdDQUFjLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxFQUFFO0FBQ3BELFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJLEdBQUk7QUFDaEQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sSUFBSTtBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFNLGtCQUFpQztBQUNyQyxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sS0FBSyxRQUFRLEdBQUk7QUFDekQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sS0FBSyxRQUFRO0FBQUEsSUFDbEQ7QUFDQSxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQzNCLFVBQU0sS0FBSyxVQUFVLFNBQVM7QUFBQSxFQUNoQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsTUFBYyxXQUFXLE1BQWMsU0FBZ0M7QUFDckUsVUFBTSxpQkFBYSxnQ0FBYyxJQUFJO0FBQ3JDLFVBQU0sV0FBVyxLQUFLLElBQUksTUFBTSxzQkFBc0IsVUFBVTtBQUVoRSxRQUFJLG9CQUFvQix3QkFBTztBQUM3QixZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsVUFBVSxNQUFNLE9BQU87QUFDcEQ7QUFBQSxJQUNGO0FBRUEsVUFBTSxhQUFhLFdBQVcsVUFBVSxHQUFHLFdBQVcsWUFBWSxHQUFHLENBQUM7QUFDdEUsUUFBSSxjQUFjLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sVUFBVSxHQUFJO0FBQ3BFLFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxNQUFNLFVBQVU7QUFBQSxJQUMvQztBQUVBLFFBQUksTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sVUFBVSxHQUFHO0FBQ25ELFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLFVBQVU7QUFBQSxJQUNoRDtBQUVBLFVBQU0sS0FBSyxJQUFJLE1BQU0sT0FBTyxZQUFZLE9BQU87QUFBQSxFQUNqRDtBQUFBO0FBQUEsRUFJUSxRQUFRLFNBQXlCO0FBQ3ZDLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsU0FBUyxPQUFPLE9BQU87QUFBQSxFQUM5RDtBQUFBLEVBRUEsTUFBTSxPQUFPLFNBQTBDO0FBQ3JELFVBQU0sT0FBTyxLQUFLLFFBQVEsT0FBTztBQUNqQyxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFJO0FBQ2hELGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSTtBQUNGLFlBQU0sVUFBa0IsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUssSUFBSTtBQUM5RCxhQUFPLEtBQUssTUFBTSxPQUFPO0FBQUEsSUFDM0IsU0FBUyxHQUFHO0FBQ1YsY0FBUSxLQUFLLDRGQUFnQyxJQUFJLElBQUksQ0FBQztBQUN0RCxhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sYUFBK0M7QUFDbkQsVUFBTSxLQUFLLFVBQVUsTUFBTTtBQUMzQixVQUFNLGNBQVUsZ0NBQWMsR0FBRyxLQUFLLFFBQVEsT0FBTztBQUNyRCxVQUFNLFFBQVEsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUssT0FBTztBQUN2RCxVQUFNLE9BQWdDLENBQUM7QUFFdkMsVUFBTSxRQUFRLE1BQU0sTUFDakIsT0FBTyxPQUFLLEVBQUUsU0FBUyxPQUFPLENBQUMsRUFDL0IsSUFBSSxPQUFPLFNBQVM7QUFDbkIsWUFBTSxVQUFVLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSSxHQUFHLFFBQVEsU0FBUyxFQUFFO0FBQzFELFVBQUksQ0FBQyxRQUFTO0FBQ2QsVUFBSTtBQUNGLGNBQU0sVUFBa0IsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUssSUFBSTtBQUM5RCxhQUFLLE9BQU8sSUFBSSxLQUFLLE1BQU0sT0FBTztBQUFBLE1BQ3BDLFNBQVMsR0FBRztBQUNWLGdCQUFRLEtBQUssNkJBQTZCLElBQUksSUFBSSxDQUFDO0FBQUEsTUFDckQ7QUFBQSxJQUNGLENBQUM7QUFFSCxVQUFNLFFBQVEsSUFBSSxLQUFLO0FBQ3ZCLFdBQU87QUFBQSxFQUNUO0FBQUE7QUFBQSxFQUdBLE1BQU0sYUFBZ0M7QUFDcEMsVUFBTSxLQUFLLFVBQVUsTUFBTTtBQUMzQixVQUFNLGNBQVUsZ0NBQWMsR0FBRyxLQUFLLFFBQVEsT0FBTztBQUNyRCxVQUFNLFFBQVEsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLEtBQUssT0FBTztBQUN2RCxVQUFNLE9BQWlCLENBQUM7QUFDeEIsZUFBVyxRQUFRLE1BQU0sT0FBTztBQUM5QixVQUFJLEtBQUssU0FBUyxPQUFPLEdBQUc7QUFDMUIsY0FBTSxVQUFVLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSSxHQUFHLFFBQVEsU0FBUyxFQUFFO0FBQzFELFlBQUksUUFBUyxNQUFLLEtBQUssT0FBTztBQUFBLE1BQ2hDO0FBQUEsSUFDRjtBQUNBLFNBQUssS0FBSyxFQUFFLFFBQVE7QUFDcEIsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVFBLE1BQU0saUJBQWlCLE9BQU8sR0FBRyxXQUFXLElBT3pDO0FBQ0QsVUFBTSxVQUFVLE1BQU0sS0FBSyxXQUFXO0FBQ3RDLFVBQU0sUUFBUSxRQUFRO0FBQ3RCLFVBQU0sUUFBUSxPQUFPO0FBQ3JCLFVBQU0sV0FBVyxRQUFRLE1BQU0sT0FBTyxRQUFRLFFBQVE7QUFDdEQsVUFBTSxPQUFnQyxDQUFDO0FBRXZDLFVBQU0sUUFBUSxTQUFTLElBQUksT0FBTyxZQUFZO0FBQzVDLFVBQUk7QUFDRixjQUFNLE9BQU8sTUFBTSxLQUFLLE9BQU8sT0FBTztBQUN0QyxZQUFJLEtBQU0sTUFBSyxPQUFPLElBQUk7QUFBQSxNQUM1QixTQUFTLEdBQUc7QUFDVixnQkFBUSxLQUFLLHVCQUF1QixPQUFPLElBQUksQ0FBQztBQUFBLE1BQ2xEO0FBQUEsSUFDRixDQUFDO0FBQ0QsVUFBTSxRQUFRLElBQUksS0FBSztBQUV2QixXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0EsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUyxRQUFRLFNBQVMsU0FBUztBQUFBLElBQ3JDO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxPQUFPLFNBQWlDO0FBQzVDLFVBQU0sS0FBSyxVQUFVLE1BQU07QUFDM0IsVUFBTSxVQUFVLFFBQVE7QUFDeEIsUUFBSSxDQUFDLFNBQVM7QUFDWixZQUFNLElBQUksTUFBTSxnQ0FBZ0M7QUFBQSxJQUNsRDtBQUNBLFVBQU0sT0FBTyxLQUFLLFFBQVEsT0FBTztBQUdqQyxRQUFJLENBQUMsS0FBSyxhQUFhLElBQUksSUFBSSxHQUFHO0FBQ2hDLFlBQU0saUJBQWlCLE1BQU0sUUFBUSxRQUFRLFFBQVEsSUFBSSxRQUFRLFNBQVMsU0FBUztBQUNuRixVQUFJLGtCQUFrQixHQUFHO0FBQ3ZCLFlBQUk7QUFDRixjQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBRztBQUM3QyxrQkFBTSxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJLENBQUM7QUFDbkUsa0JBQU0sc0JBQXNCLE1BQU0sUUFBUSxTQUFTLFFBQVEsSUFBSSxTQUFTLFNBQVMsU0FBUztBQUMxRixnQkFBSSxzQkFBc0IsSUFBSTtBQUM1QixrQkFBSTtBQUFBLGdCQUNGLG1DQUFVLE9BQU8sOENBQVcsbUJBQW1CLGtCQUFRLGNBQWM7QUFBQTtBQUFBLGNBQ3ZFO0FBQ0EsbUJBQUssYUFBYSxJQUFJLElBQUk7QUFDMUI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0YsUUFBUTtBQUFBLFFBQXdCO0FBQUEsTUFDbEM7QUFBQSxJQUNGO0FBRUEsVUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLFVBQVUsU0FBUyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQzlEO0FBQUEsRUFFQSxNQUFNLFVBQVUsU0FBZ0M7QUFDOUMsVUFBTSxPQUFPLEtBQUssUUFBUSxPQUFPO0FBQ2pDLFFBQUksTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFHO0FBQzdDLFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUk7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBSVEsWUFBb0I7QUFDMUIsZUFBTyxnQ0FBYyxHQUFHLEtBQUssUUFBUSxhQUFhO0FBQUEsRUFDcEQ7QUFBQSxFQUVBLE1BQU0sV0FBZ0M7QUFDcEMsVUFBTSxPQUFPLEtBQUssVUFBVTtBQUM1QixRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFJO0FBQ2hELGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFDQSxVQUFNLFVBQWtCLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxLQUFLLElBQUk7QUFDOUQsV0FBTyxLQUFLLE1BQU0sT0FBTztBQUFBLEVBQzNCO0FBQUEsRUFFQSxNQUFNLFNBQVMsT0FBa0M7QUFDL0MsVUFBTSxPQUFPLEtBQUssVUFBVTtBQUc1QixRQUFJLE1BQU0sV0FBVyxLQUFLLENBQUMsS0FBSyxhQUFhLElBQUksSUFBSSxHQUFHO0FBQ3RELFVBQUk7QUFDRixZQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBRztBQUM3QyxnQkFBTSxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJLENBQUM7QUFDbkUsY0FBSSxNQUFNLFFBQVEsUUFBUSxLQUFLLFNBQVMsU0FBUyxHQUFHO0FBQ2xELGdCQUFJO0FBQUEsY0FDRix3RkFBa0IsU0FBUyxNQUFNO0FBQUE7QUFBQSxZQUNuQztBQUNBLGlCQUFLLGFBQWEsSUFBSSxJQUFJO0FBQzFCO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLFFBQVE7QUFBQSxNQUF3QjtBQUFBLElBQ2xDO0FBRUEsVUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLFVBQVUsT0FBTyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQzVEO0FBQUE7QUFBQSxFQUlRLGVBQXVCO0FBQzdCLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsZ0JBQWdCO0FBQUEsRUFDdkQ7QUFBQSxFQUVBLE1BQU0sV0FBVyxLQUErQjtBQUM5QyxVQUFNLFdBQVcsTUFBTSxLQUFLLGVBQWU7QUFDM0MsV0FBTyxTQUFTLEdBQUcsS0FBSztBQUFBLEVBQzFCO0FBQUEsRUFFQSxNQUFNLFdBQVcsS0FBYSxPQUErQjtBQUMzRCxVQUFNLFdBQU8sZ0NBQWMsS0FBSyxhQUFhLENBQUM7QUFDOUMsVUFBTSxXQUFXLEtBQUssSUFBSSxNQUFNLHNCQUFzQixJQUFJO0FBRTFELFFBQUksb0JBQW9CLHdCQUFPO0FBRTdCLFlBQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxVQUFVLENBQUMsU0FBUztBQUMvQyxjQUFNLFdBQW9DLEtBQUssTUFBTSxJQUFJO0FBQ3pELGlCQUFTLEdBQUcsSUFBSTtBQUNoQixlQUFPLEtBQUssVUFBVSxVQUFVLE1BQU0sQ0FBQztBQUFBLE1BQ3pDLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxZQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUFBLElBQ3ZFO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxpQkFBdUM7QUFDM0MsVUFBTSxPQUFPLEtBQUssYUFBYTtBQUMvQixRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFJO0FBQ2hELGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFDQSxRQUFJO0FBQ0YsWUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELGFBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxJQUMzQixRQUFRO0FBQ04sYUFBTyxDQUFDO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBSVEsc0JBQThCO0FBQ3BDLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsd0JBQXdCO0FBQUEsRUFDL0Q7QUFBQSxFQUVBLE1BQU0scUJBQXNEO0FBQzFELFVBQU0sT0FBTyxLQUFLLG9CQUFvQjtBQUN0QyxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFJO0FBQ2hELGFBQU87QUFBQSxJQUNUO0FBQ0EsVUFBTSxVQUFrQixNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQzlELFdBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxFQUMzQjtBQUFBLEVBRUEsTUFBTSxtQkFBbUIsTUFBc0M7QUFDN0QsVUFBTSxPQUFPLEtBQUssb0JBQW9CO0FBQ3RDLFVBQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFBQSxFQUMzRDtBQUFBO0FBQUEsRUFJUSxvQkFBNEI7QUFDbEMsZUFBTyxnQ0FBYyxHQUFHLEtBQUssUUFBUSxzQkFBc0I7QUFBQSxFQUM3RDtBQUFBLEVBRUEsTUFBTSxtQkFBa0Q7QUFDdEQsVUFBTSxPQUFPLEtBQUssa0JBQWtCO0FBQ3BDLFFBQUksQ0FBRSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJLEdBQUk7QUFDaEQsYUFBTztBQUFBLElBQ1Q7QUFDQSxVQUFNLFVBQWtCLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxLQUFLLElBQUk7QUFDOUQsV0FBTyxLQUFLLE1BQU0sT0FBTztBQUFBLEVBQzNCO0FBQUEsRUFFQSxNQUFNLGlCQUFpQixNQUFvQztBQUN6RCxVQUFNLE9BQU8sS0FBSyxrQkFBa0I7QUFDcEMsVUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQzNEO0FBQUE7QUFBQSxFQUlBLE1BQU0sZ0JBQXNDO0FBQzFDLFVBQU0sQ0FBQyxNQUFNLE9BQU8sVUFBVSxpQkFBaUIsYUFBYSxJQUFJLE1BQU0sUUFBUSxJQUFJO0FBQUEsTUFDaEYsS0FBSyxXQUFXO0FBQUEsTUFDaEIsS0FBSyxTQUFTO0FBQUEsTUFDZCxLQUFLLGVBQWU7QUFBQSxNQUNwQixLQUFLLG1CQUFtQjtBQUFBLE1BQ3hCLEtBQUssaUJBQWlCO0FBQUEsSUFDeEIsQ0FBQztBQUVELFdBQU87QUFBQSxNQUNMLFNBQVM7QUFBQSxNQUNULGFBQVksb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxNQUNuQyxhQUFhO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLFFBQVEsQ0FBQztBQUFBLE1BQ1QsU0FBUyxDQUFDO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sV0FBVyxNQUFlLFVBQWdELENBQUMsR0FBa0I7QUFDakcsVUFBTSxLQUFLLGdCQUFnQjtBQUMzQixVQUFNLFdBQVcsUUFBUSxZQUFZO0FBR3JDLFVBQU0sU0FBUyxnQkFBZ0IsU0FBUyxJQUFJO0FBRTVDLFFBQUksT0FBTyxTQUFTLFFBQVc7QUFFN0IsWUFBTSxPQUFRLE9BQU8sUUFBUSxPQUFPLE9BQU8sU0FBUyxZQUFZLENBQUMsTUFBTSxRQUFRLE9BQU8sSUFBSSxJQUN0RixPQUFPLE9BQ1AsQ0FBQztBQUNMLFVBQUksYUFBYSxhQUFhO0FBQzVCLGNBQU0sS0FBSyxhQUFhO0FBQUEsTUFDMUI7QUFDQSxpQkFBVyxPQUFPLE9BQU8sT0FBTyxJQUFJLEdBQUc7QUFDckMsY0FBTSxLQUFLLE9BQU8sR0FBRztBQUFBLE1BQ3ZCO0FBQUEsSUFDRjtBQUVBLFFBQUksT0FBTyxVQUFVLFFBQVc7QUFDOUIsWUFBTSxXQUF1QixNQUFNLFFBQVEsT0FBTyxLQUFLLElBQUksT0FBTyxRQUFRLENBQUM7QUFDM0UsVUFBSSxhQUFhLFNBQVM7QUFFeEIsY0FBTSxXQUFZLE1BQU0sS0FBSyxTQUFTLEtBQU0sQ0FBQztBQUM3QyxjQUFNLFNBQVMsSUFBSSxJQUFJLFNBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckQsbUJBQVcsUUFBUSxVQUFVO0FBQzNCLGNBQUksUUFBUSxLQUFLLEdBQUksUUFBTyxJQUFJLEtBQUssSUFBSSxJQUFJO0FBQUEsUUFDL0M7QUFDQSxjQUFNLEtBQUssU0FBUyxNQUFNLEtBQUssT0FBTyxPQUFPLENBQUMsQ0FBQztBQUFBLE1BQ2pELE9BQU87QUFFTCxjQUFNLEtBQUssU0FBUyxRQUFRO0FBQUEsTUFDOUI7QUFBQSxJQUNGO0FBRUEsUUFBSSxPQUFPLGFBQWEsVUFBYSxPQUFPLFlBQVksT0FBTyxPQUFPLGFBQWEsVUFBVTtBQUMzRixZQUFNLFdBQVcsT0FBTztBQUN4QixVQUFJO0FBQ0osVUFBSSxhQUFhLFNBQVM7QUFDeEIsY0FBTSxXQUFZLE1BQU0sS0FBSyxlQUFlLEtBQU0sQ0FBQztBQUNuRCxrQkFBVSxFQUFFLEdBQUcsVUFBVSxHQUFHLFNBQVM7QUFBQSxNQUN2QyxPQUFPO0FBQ0wsa0JBQVU7QUFBQSxNQUNaO0FBQ0EsWUFBTSxLQUFLLFdBQVcsS0FBSyxhQUFhLEdBQUcsS0FBSyxVQUFVLFNBQVMsTUFBTSxDQUFDLENBQUM7QUFBQSxJQUM3RTtBQUVBLFFBQUksT0FBTyxvQkFBb0IsUUFBVztBQUN4QyxZQUFNLEtBQUssbUJBQW1CLE9BQU8sZUFBZTtBQUFBLElBQ3REO0FBQ0EsUUFBSSxPQUFPLGtCQUFrQixRQUFXO0FBQ3RDLFlBQU0sS0FBSyxpQkFBaUIsT0FBTyxhQUFhO0FBQUEsSUFDbEQ7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxjQUFVLGdDQUFjLEdBQUcsS0FBSyxRQUFRLE9BQU87QUFDckQsUUFBSSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxPQUFPLEdBQUc7QUFDaEQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sU0FBUyxJQUFJO0FBQUEsSUFDbEQ7QUFDQSxVQUFNLEtBQUssVUFBVSxNQUFNO0FBQUEsRUFDN0I7QUFBQTtBQUFBLEVBR0EsTUFBTSxtQkFBa0M7QUFDdEMsVUFBTSxPQUFPLEtBQUssYUFBYTtBQUMvQixRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBRztBQUM3QyxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLFdBQTBCO0FBQzlCLFFBQUksTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sS0FBSyxRQUFRLEdBQUc7QUFDdEQsWUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE1BQU0sS0FBSyxVQUFVLElBQUk7QUFBQSxJQUN4RDtBQUNBLFVBQU0sS0FBSyxnQkFBZ0I7QUFBQSxFQUM3QjtBQUFBO0FBQUEsRUFJUSxXQUFXLFNBQXlCO0FBQzFDLGVBQU8sZ0NBQWMsR0FBRyxLQUFLLFFBQVEsWUFBWSxPQUFPLEtBQUs7QUFBQSxFQUMvRDtBQUFBLEVBRUEsTUFBTSxvQkFBb0IsU0FBaUIsVUFBaUM7QUFDMUUsVUFBTSxLQUFLLFVBQVUsU0FBUztBQUM5QixVQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU87QUFDcEMsVUFBTSxLQUFLLFdBQVcsTUFBTSxRQUFRO0FBQUEsRUFDdEM7QUFBQSxFQUVBLE1BQU0scUJBQXFCLFNBQWdDO0FBQ3pELFVBQU0sT0FBTyxLQUFLLFdBQVcsT0FBTztBQUNwQyxRQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLElBQUksR0FBRztBQUM3QyxZQUFNLEtBQUssSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQ0Y7OztBRWxjTyxJQUFNLGVBQU4sTUFBTSxhQUFZO0FBQUEsRUFBbEI7QUFDSCxTQUFRLFNBQW1DO0FBQzNDLFNBQVEsb0JBQW1DO0FBQUE7QUFBQSxFQWdCN0MsYUFBYSxRQUFpQztBQUM1QyxTQUFLLFNBQVM7QUFBQSxFQUNoQjtBQUFBLEVBRUEsZUFBcUI7QUFDbkIsU0FBSyxTQUFTO0FBQUEsRUFDaEI7QUFBQTtBQUFBLEVBR1EsYUFBc0I7QUFDNUIsV0FBTyxlQUFlLEtBQUssVUFBVSxTQUFTLFlBQVk7QUFBQSxFQUM1RDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNQSxPQUFlLGdCQUFnQixPQUFnRDtBQUM3RSxRQUFJLENBQUMsTUFBTyxRQUFPO0FBQ25CLFVBQU0sSUFBSSxNQUFNLEtBQUs7QUFDckIsUUFBSSxHQUFXLEdBQVc7QUFFMUIsVUFBTSxXQUFXLEVBQUUsTUFBTSxtQkFBbUI7QUFDNUMsUUFBSSxVQUFVO0FBQ1osWUFBTSxRQUFRLFNBQVMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLFdBQVcsQ0FBQyxDQUFDO0FBQzdELE9BQUMsR0FBRyxHQUFHLENBQUMsSUFBSTtBQUFBLElBQ2QsV0FBVyxFQUFFLENBQUMsTUFBTSxLQUFLO0FBQ3ZCLFVBQUksTUFBTSxFQUFFLE1BQU0sQ0FBQztBQUNuQixVQUFJLElBQUksV0FBVyxFQUFHLE9BQU0sSUFBSSxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDdEUsVUFBSSxJQUFJLFNBQVMsRUFBRyxRQUFPO0FBQzNCLFVBQUksU0FBUyxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRTtBQUNoQyxVQUFJLFNBQVMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDaEMsVUFBSSxTQUFTLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFO0FBQUEsSUFDbEMsT0FBTztBQUNMLGFBQU87QUFBQSxJQUNUO0FBRUEsUUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUMsRUFBRyxRQUFPO0FBQzVDLFdBQU8sQ0FBQyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEtBQUssTUFBTSxDQUFDLEdBQUcsS0FBSyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQ3JEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLE9BQU8sU0FBUyxPQUE4QjtBQUM1QyxVQUFNLE1BQU0sYUFBWSxnQkFBZ0IsS0FBSztBQUM3QyxRQUFJLENBQUMsSUFBSyxRQUFPO0FBQ2pCLFVBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJO0FBRWxCLFVBQU0sS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJO0FBQzNDLFVBQU1DLE9BQU0sS0FBSyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxLQUFLLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJQSxPQUFNO0FBQ3hFLFFBQUksTUFBTSxFQUFHLFFBQU87QUFFcEIsUUFBSTtBQUNKLFFBQUlBLFNBQVEsR0FBSSxNQUFNLEtBQUssTUFBTSxJQUFLO0FBQUEsYUFDN0JBLFNBQVEsR0FBSSxNQUFLLEtBQUssTUFBTSxJQUFJO0FBQUEsUUFDcEMsTUFBSyxLQUFLLE1BQU0sSUFBSTtBQUV6QixRQUFJLEtBQUssTUFBTSxJQUFJLEVBQUU7QUFDckIsV0FBTyxJQUFJLElBQUksSUFBSSxNQUFNO0FBQUEsRUFDM0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxPQUFPLGVBQWUsT0FBOEI7QUFDbEQsVUFBTSxNQUFNLGFBQVksZ0JBQWdCLEtBQUs7QUFDN0MsUUFBSSxDQUFDLElBQUssUUFBTztBQUNqQixXQUFPLElBQUksS0FBSyxJQUFJO0FBQUEsRUFDdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxVQUFVLHNCQUFzQixPQUFhO0FBQzNDLFFBQUksQ0FBQyxLQUFLLFFBQVEsY0FBZTtBQUVqQyxVQUFNLFVBQW1HO0FBQUEsTUFDdkcsUUFBUSxLQUFLLFdBQVc7QUFBQSxJQUMxQjtBQUVBLFFBQUkscUJBQXFCO0FBQ3ZCLFlBQU0sU0FBUyxpQkFBaUIsZUFBZSxJQUFJLEVBQ2hELGlCQUFpQixzQkFBc0IsRUFDdkMsS0FBSztBQUNSLFlBQU0sTUFBTSxhQUFZLFNBQVMsTUFBTTtBQUN2QyxVQUFJLFFBQVEsS0FBTSxTQUFRLE1BQU07QUFHaEMsWUFBTSxVQUFVLGlCQUFpQixlQUFlLElBQUksRUFDakQsaUJBQWlCLHdCQUF3QixFQUN6QyxLQUFLO0FBQ1IsWUFBTSxLQUFLLGFBQVksZUFBZSxPQUFPO0FBQzdDLFVBQUksT0FBTyxLQUFNLFNBQVEsS0FBSztBQUc5QixZQUFNLGFBQWEsaUJBQWlCLGVBQWUsSUFBSSxFQUNwRCxpQkFBaUIsZUFBZSxFQUNoQyxLQUFLO0FBQ1IsWUFBTSxnQkFBZ0IsYUFBWSxlQUFlLFVBQVU7QUFDM0QsVUFBSSxrQkFBa0IsS0FBTSxTQUFRLGFBQWE7QUFFakQsWUFBTSxZQUFZLGlCQUFpQixlQUFlLElBQUksRUFDbkQsaUJBQWlCLGNBQWMsRUFDL0IsS0FBSztBQUNSLFlBQU0sZUFBZSxhQUFZLGVBQWUsU0FBUztBQUN6RCxVQUFJLGlCQUFpQixLQUFNLFNBQVEsWUFBWTtBQUFBLElBQ2pEO0FBRUEsU0FBSyxPQUFPLGNBQWM7QUFBQSxNQUN4QjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sSUFBSSxnQkFBZ0IsS0FBSyxJQUFJO0FBQUEsUUFDN0I7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLGVBQWUsc0JBQXNCLE9BQWE7QUFDaEQsU0FBSyxVQUFVLG1CQUFtQjtBQUFBLEVBQ3BDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsT0FBTyxvQkFBb0IsS0FBYSxpQkFBeUIsUUFBeUM7QUFDeEcsVUFBTSxJQUFJLEtBQUssTUFBTSxHQUFHO0FBQ3hCLFVBQU0sS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxlQUFlLENBQUM7QUFHdEQsVUFBTSxVQUFVO0FBQ2hCLFVBQU0sVUFBVSxTQUFTLEtBQUs7QUFDOUIsVUFBTSxTQUFTLE9BQU8sQ0FBQyxLQUFLLE9BQU8sTUFBTSxPQUFPO0FBQ2hELFVBQU0sY0FBYyxPQUFPLENBQUMsS0FBSyxPQUFPLE1BQU0sVUFBVSxDQUFDO0FBR3pELFVBQU0sTUFBTSxTQUFTLElBQUk7QUFDekIsVUFBTSxNQUFNLFNBQ1IsS0FBSyxJQUFJLEdBQUcsS0FBSyxLQUFLLEdBQUcsSUFDekIsS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLElBQUk7QUFDL0IsVUFBTSxZQUFZLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxHQUFHO0FBQzNDLFVBQU0sY0FBYyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sU0FBUyxNQUFNLElBQUksTUFBTSxDQUFDO0FBR3BFLFVBQU0sYUFBYSxTQUFTLE9BQU8sQ0FBQyxlQUFlLE9BQU8sQ0FBQztBQUMzRCxVQUFNLFlBQWEsU0FBUyxPQUFPLENBQUMsZUFBZSxPQUFPLENBQUM7QUFFM0QsV0FBTztBQUFBLE1BQ0wsd0JBQXdCO0FBQUEsTUFDeEIsOEJBQThCO0FBQUEsTUFDOUIsaUJBQWlCO0FBQUEsTUFDakIsd0JBQXdCO0FBQUEsTUFDeEIsMEJBQTBCO0FBQUEsTUFDMUIsaUJBQWlCO0FBQUEsTUFDakIsZ0JBQWdCO0FBQUEsSUFDbEI7QUFBQSxFQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLGFBQWEsS0FBYSxpQkFBeUIsUUFBdUI7QUFDeEUsUUFBSSxLQUFLLGtCQUFtQixRQUFPLGFBQWEsS0FBSyxpQkFBaUI7QUFDdEUsaUJBQVksY0FBYztBQUMxQixTQUFLLG9CQUFvQixPQUFPLFdBQVcsTUFBTTtBQUMvQyxVQUFJLGFBQVksWUFBYTtBQUM3QixZQUFNLE9BQU8sYUFBWSxvQkFBb0IsS0FBSyxpQkFBaUIsTUFBTTtBQUN6RSxpQkFBVyxDQUFDLEtBQUssS0FBSyxLQUFLLE9BQU8sUUFBUSxJQUFJLEdBQUc7QUFDL0MsdUJBQWUsS0FBSyxNQUFNLFlBQVksS0FBSyxLQUFLO0FBQUEsTUFDbEQ7QUFBQSxJQUNGLEdBQUcsRUFBRTtBQUFBLEVBQ1A7QUFBQTtBQUFBLEVBR0EsT0FBTyxrQkFBd0I7QUFDN0IsaUJBQVksY0FBYztBQUMxQixlQUFXLE9BQU8sYUFBWSxlQUFlO0FBQzNDLHFCQUFlLEtBQUssTUFBTSxlQUFlLEdBQUc7QUFBQSxJQUM5QztBQUFBLEVBQ0Y7QUFDRjtBQUFBO0FBak5hLGFBS2UsZ0JBQWdCO0FBQUEsRUFDdEM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUFBO0FBYlMsYUFnQk0sY0FBYztBQWhCMUIsSUFBTSxjQUFOOzs7QUNKQSxJQUFNLDJCQUEyQjtBQUFBLEVBQ3RDO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBUztBQUFBLEVBQVE7QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQVM7QUFDcEU7QUFHQSxJQUFNLG1CQUEyQztBQUFBLEVBQy9DLFFBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFFBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFNBQVM7QUFDWDtBQUdPLElBQU0sYUFBcUM7QUFBQSxFQUNoRCxTQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxPQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxTQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxTQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxTQUFTO0FBQUEsRUFDVCxVQUFTO0FBQUEsRUFDVCxRQUFTO0FBQUEsRUFDVCxHQUFHO0FBQ0w7OztBQ25CTyxJQUFNLG1CQUFtQjtBQUt6QixJQUFNLG1CQUFtQixDQUFDLFlBQVksUUFBUSxTQUFTLFFBQVE7OztBTFR0RSxJQUFNLFlBQVksQ0FBQyxVQUFVLFFBQVEsY0FBYztBQU01QyxTQUFTLGdCQUFnQixLQUFzQjtBQUNwRCxNQUFJLENBQUMsT0FBTyxPQUFPLFFBQVEsU0FBVSxRQUFPO0FBQzVDLE1BQUksSUFBSSxTQUFTLEtBQU0sUUFBTztBQUM5QixNQUFJO0FBQ0osTUFBSTtBQUNGLGFBQVMsSUFBSSxJQUFJLEdBQUc7QUFBQSxFQUN0QixRQUFRO0FBQ04sV0FBTztBQUFBLEVBQ1Q7QUFDQSxTQUFPLE9BQU8sYUFBYSxXQUFXLE9BQU8sYUFBYTtBQUM1RDtBQUdBLFNBQVMsb0JBQW9CLFFBQTZCO0FBQ3hELFFBQU0sUUFBUSxJQUFJLFdBQVcsTUFBTTtBQUNuQyxNQUFJLFNBQVM7QUFDYixRQUFNLFlBQVk7QUFDbEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSyxXQUFXO0FBQ2hELFVBQU0sUUFBUSxNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVM7QUFDN0MsUUFBSSxXQUFXO0FBQ2YsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNyQyxrQkFBWSxPQUFPLGFBQWEsTUFBTSxDQUFDLENBQUM7QUFBQSxJQUMxQztBQUNBLGNBQVU7QUFBQSxFQUNaO0FBQ0EsU0FBTyxLQUFLLE1BQU07QUFDcEI7QUFRTyxJQUFNLFNBQU4sTUFBYTtBQUFBLEVBWWxCLFlBQ0UsS0FDQSxVQUNBLGNBQ0EsV0FDQSxXQUNBO0FBYkYsU0FBUSxTQUFtQztBQUMzQyxTQUFRLGlCQUF5RDtBQUNqRSxTQUFRLGVBQXNELENBQUM7QUFZN0QsU0FBSyxXQUFXO0FBQ2hCLFNBQUssZUFBZTtBQUNwQixTQUFLLFVBQVUsSUFBSSxhQUFhLEdBQUc7QUFDbkMsU0FBSyxjQUFjLElBQUksWUFBWTtBQUNuQyxTQUFLLGVBQWUsSUFBSSxNQUFNO0FBQzlCLFNBQUssWUFBWTtBQUNqQixTQUFLLFlBQVk7QUFBQSxFQUNuQjtBQUFBO0FBQUEsRUFHQSxNQUFNLGtCQUFpQztBQUNyQyxVQUFNLEtBQUssUUFBUSxnQkFBZ0I7QUFBQSxFQUNyQztBQUFBO0FBQUEsRUFHQSxnQkFBZ0IsUUFBcUQ7QUFDbkUsU0FBSyxlQUFlO0FBQUEsRUFDdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxpQkFBdUI7QUFDckIsU0FBSyxPQUFPO0FBQ1osU0FBSyxpQkFBaUIsQ0FBQyxVQUF3QjtBQUM3QyxXQUFLLEtBQUssVUFBVSxLQUFLO0FBQUEsSUFDM0I7QUFHQSxLQUFDLGVBQWUsZUFBZSxRQUFRLGlCQUFpQixXQUFXLEtBQUssY0FBYztBQUFBLEVBQ3hGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLFdBQVcsUUFBaUM7QUFDMUMsU0FBSyxTQUFTO0FBQ2QsU0FBSyxZQUFZLGFBQWEsTUFBTTtBQUFBLEVBQ3RDO0FBQUE7QUFBQSxFQUdBLE9BQU8sUUFBaUM7QUFDdEMsU0FBSyxlQUFlO0FBQ3BCLFNBQUssV0FBVyxNQUFNO0FBQUEsRUFDeEI7QUFBQTtBQUFBLEVBR0EsU0FBZTtBQUNiLFFBQUksS0FBSyxnQkFBZ0I7QUFDdkIsT0FBQyxlQUFlLGVBQWUsUUFBUSxvQkFBb0IsV0FBVyxLQUFLLGNBQWM7QUFDekYsV0FBSyxpQkFBaUI7QUFBQSxJQUN4QjtBQUNBLFNBQUssWUFBWSxhQUFhO0FBQzlCLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUE7QUFBQSxFQUdBLGVBQWUscUJBQW9DO0FBQ2pELFNBQUssU0FBUyxzQkFBc0I7QUFDcEMsU0FBSyxZQUFZLFVBQVUsbUJBQW1CO0FBQUEsRUFDaEQ7QUFBQTtBQUFBLEVBR1EsUUFBUSxJQUFZLFNBQXdCO0FBQ2xELFFBQUksQ0FBQyxLQUFLLFFBQVEsY0FBZTtBQUVqQyxTQUFLLE9BQU8sY0FBYyxZQUFZLEVBQUUsTUFBTSxvQkFBb0IsSUFBSSxRQUFRLEdBQUcsR0FBRztBQUFBLEVBQ3RGO0FBQUE7QUFBQSxFQUdRLGFBQWEsSUFBWSxPQUFxQjtBQUNwRCxRQUFJLENBQUMsS0FBSyxRQUFRLGNBQWU7QUFDakMsU0FBSyxPQUFPLGNBQWMsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLElBQUksTUFBTSxHQUFHLEdBQUc7QUFBQSxFQUNwRjtBQUFBO0FBQUEsRUFHQSxNQUFjLFVBQVUsT0FBb0M7QUFDMUQsVUFBTSxNQUFNLE1BQU07QUFDbEIsUUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEdBQUk7QUFHbEMsUUFBSSxLQUFLLFVBQVUsTUFBTSxXQUFXLEtBQUssT0FBTyxjQUFlO0FBRy9ELFFBQUksQ0FBQyxpQkFBaUIsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFNLFdBQVcsQ0FBQyxDQUFDLEVBQUc7QUFFNUQsUUFBSTtBQUNGLFlBQU0sS0FBSyxjQUFjLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQztBQUFBLElBQzlELFNBQVMsR0FBRztBQUNWLFdBQUssYUFBYSxJQUFJLElBQUksYUFBYSxRQUFRLEVBQUUsVUFBVSxlQUFlO0FBQUEsSUFDNUU7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsY0FBYyxNQUFjLElBQVksU0FBaUM7QUFFckYsUUFBSSxTQUFTLGFBQWE7QUFFeEIsWUFBTSxLQUFNLFNBQXFDO0FBQ2pELFVBQUksT0FBTyxPQUFPLFlBQVksT0FBTyxrQkFBa0I7QUFDckQsZ0JBQVE7QUFBQSxVQUNOLHlFQUF1QixnQkFBZ0IsZ0JBQVcsRUFBRTtBQUFBLFFBRXREO0FBQUEsTUFDRjtBQUNBLFdBQUssWUFBWSxVQUFVLEtBQUssU0FBUyxtQkFBbUI7QUFDNUQsV0FBSyxRQUFRLElBQUk7QUFBQSxRQUNmLElBQUk7QUFBQSxRQUNKLGVBQWUsS0FBSyxTQUFTLGlCQUFpQjtBQUFBLFFBQzlDLGNBQWMsS0FBSztBQUFBLFFBQ25CLGNBQWMsS0FBSyxTQUFTLGNBQWMsQ0FBQztBQUFBLFFBQzNDLHVCQUF1QixLQUFLLFNBQVMseUJBQXlCO0FBQUEsTUFDaEUsQ0FBQztBQUNEO0FBQUEsSUFDRjtBQUVBLFFBQUksU0FBUyxhQUFhO0FBQ3hCLFdBQUssUUFBUSxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0I7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLHlCQUF5QjtBQUNwQyxXQUFLLFNBQVMsZ0JBQWdCO0FBQzlCLFlBQU0sS0FBSyxhQUFhO0FBQ3hCLFdBQUssUUFBUSxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0I7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLHdCQUF3QjtBQUNuQyxXQUFLLFNBQVMsYUFBYyxNQUFNLFFBQVEsT0FBTyxJQUFJLFVBQVUsQ0FBQztBQUNoRSxZQUFNLEtBQUssYUFBYTtBQUN4QixXQUFLLFFBQVEsSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDO0FBQzdCO0FBQUEsSUFDRjtBQUdBLFFBQUksU0FBUyxxQkFBcUI7QUFDaEMsWUFBTSxJQUFJO0FBQ1YsVUFBSSxLQUFLLFNBQVMsdUJBQXVCO0FBQ3ZDLGFBQUssWUFBWSxhQUFhLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLE1BQU07QUFBQSxNQUNsRTtBQUNBLFdBQUssUUFBUSxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0I7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLGtCQUFrQjtBQUM3QixXQUFLLFlBQVksVUFBVSxLQUFLLFNBQVMsbUJBQW1CO0FBQzVELFdBQUssUUFBUSxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFDN0I7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLDJCQUEyQjtBQUN0QyxVQUFJO0FBQ0YsY0FBTSxRQUFRLE1BQU0sS0FBSyxvQkFBb0I7QUFDN0MsYUFBSyxRQUFRLElBQUksRUFBRSxNQUFNLENBQUM7QUFBQSxNQUM1QixTQUFTLEdBQUc7QUFDVixhQUFLLGFBQWEsSUFBSSxhQUFhLFFBQVEsRUFBRSxVQUFVLDRDQUFTO0FBQUEsTUFDbEU7QUFDQTtBQUFBLElBQ0Y7QUFHQSxRQUFJLFNBQVMscUJBQXFCO0FBQ2hDLFlBQU0sS0FBSyxvQkFBb0IsSUFBSSxPQUFPO0FBQzFDO0FBQUEsSUFDRjtBQUdBLFFBQUksU0FBUyxxQkFBcUI7QUFDaEMsWUFBTSxLQUFLLG9CQUFvQixJQUFJLE9BQU87QUFDMUM7QUFBQSxJQUNGO0FBR0EsUUFBSSxTQUFTLHFCQUFxQjtBQUNoQyxZQUFNLEtBQUssb0JBQW9CLElBQUksT0FBTztBQUMxQztBQUFBLElBQ0Y7QUFHQSxVQUFNLFNBQVMsTUFBTSxLQUFLLHFCQUFxQixNQUFNLE9BQU87QUFDNUQsU0FBSyxRQUFRLElBQUksTUFBTTtBQUFBLEVBQ3pCO0FBQUE7QUFBQSxFQUdBLE1BQWMscUJBQXFCLE1BQWMsU0FBb0M7QUFDbkYsVUFBTSxJQUFJO0FBQ1YsWUFBUSxNQUFNO0FBQUEsTUFDWixLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxPQUFPLEVBQUUsT0FBaUI7QUFBQSxNQUN0RCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxPQUFPLEVBQUUsSUFBZTtBQUFBLE1BQ3BELEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFdBQVc7QUFBQSxNQUN2QyxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxVQUFVLEVBQUUsT0FBaUI7QUFBQSxNQUN6RCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxXQUFXLEVBQUUsR0FBYTtBQUFBLE1BQ3RELEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFdBQVcsRUFBRSxLQUFlLEVBQUUsS0FBSztBQUFBLE1BQy9ELEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLGVBQWU7QUFBQSxNQUMzQyxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxTQUFTO0FBQUEsTUFDckMsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsU0FBUyxFQUFFLEtBQWM7QUFBQSxNQUNyRCxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxtQkFBbUI7QUFBQSxNQUMvQyxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUSxtQkFBbUIsRUFBRSxJQUFhO0FBQUEsTUFDOUQsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsaUJBQWlCO0FBQUEsTUFDN0MsS0FBSztBQUNILGVBQU8sTUFBTSxLQUFLLFFBQVEsaUJBQWlCLEVBQUUsSUFBYTtBQUFBLE1BQzVELEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFdBQVc7QUFBQSxNQUN2QyxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUTtBQUFBLFVBQ3ZCLEVBQUUsUUFBbUI7QUFBQSxVQUNyQixFQUFFLFlBQXVCO0FBQUEsUUFDNUI7QUFBQSxNQUNGLEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLGNBQWM7QUFBQSxNQUMxQyxLQUFLO0FBQ0gsZUFBTyxNQUFNLEtBQUssUUFBUTtBQUFBLFVBQ3hCLEVBQUU7QUFBQSxVQUNGLEVBQUUsVUFBVyxFQUFFLFNBQXFDLFNBQThDO0FBQUEsUUFDcEc7QUFBQSxNQUNGLEtBQUs7QUFDSCxlQUFPLE1BQU0sS0FBSyxRQUFRLFNBQVM7QUFBQSxNQUNyQztBQUNFLGNBQU0sSUFBSSxNQUFNLGlDQUFpQyxJQUFJLEVBQUU7QUFBQSxJQUMzRDtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBYyxvQkFDWixXQUFXLEdBQ2dFO0FBQzNFLFVBQU0sVUFBNEUsQ0FBQztBQUNuRixVQUFNLFVBQVUsS0FBSztBQUVyQixRQUFJLEtBQUssV0FBVztBQUNsQixVQUFJO0FBQ0YsY0FBTSxPQUFPLE1BQU0sUUFBUSxLQUFLLEtBQUssU0FBUztBQUM5QyxtQkFBVyxRQUFRLEtBQUssT0FBTztBQUM3QixjQUFJLEtBQUssV0FBVyxHQUFHLEVBQUc7QUFDMUIsZ0JBQU0sTUFBTSxLQUFLLFVBQVUsS0FBSyxZQUFZLEdBQUcsQ0FBQyxFQUFFLFlBQVk7QUFDOUQsY0FBSSx5QkFBeUIsU0FBUyxHQUFHLEdBQUc7QUFDMUMsZ0JBQUk7QUFDRixvQkFBTSxlQUFXLGdDQUFjLEdBQUcsS0FBSyxTQUFTLElBQUksSUFBSSxFQUFFO0FBQzFELG9CQUFNLE9BQU8sTUFBTSxRQUFRLEtBQUssUUFBUTtBQUN4QyxzQkFBUSxLQUFLLEVBQUUsTUFBTSxVQUFVLE1BQU0sTUFBTSxNQUFNLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUFBLFlBQ3pFLFFBQVE7QUFBQSxZQUFhO0FBQUEsVUFDdkI7QUFBQSxRQUNGO0FBQUEsTUFDRixRQUFRO0FBQUEsTUFBYTtBQUNyQixjQUFRLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLGNBQWMsRUFBRSxJQUFJLENBQUM7QUFDbkQsYUFBTztBQUFBLElBQ1Q7QUFHQSxVQUFNLFVBQVUsT0FBTyxhQUFxQixVQUFpQztBQUMzRSxVQUFJLFFBQVEsU0FBVTtBQUN0QixVQUFJO0FBQ0osVUFBSTtBQUNGLGVBQU8sTUFBTSxRQUFRLEtBQUssV0FBVztBQUFBLE1BQ3ZDLFFBQVE7QUFDTjtBQUFBLE1BQ0Y7QUFFQSxpQkFBVyxVQUFVLEtBQUssU0FBUztBQUNqQyxZQUFJLE9BQU8sV0FBVyxHQUFHLEVBQUc7QUFDNUIsY0FBTSxVQUFVLG9CQUFJLElBQUksQ0FBQyxHQUFHLFdBQVcsR0FBSSxLQUFLLFlBQVksQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUUsQ0FBQztBQUNuRixZQUFJLFFBQVEsSUFBSSxNQUFNLEVBQUc7QUFDekIsY0FBTSxVQUFVLGtCQUFjLGdDQUFjLEdBQUcsV0FBVyxJQUFJLE1BQU0sRUFBRSxJQUFJO0FBQzFFLGNBQU0sUUFBUSxTQUFTLFFBQVEsQ0FBQztBQUFBLE1BQ2xDO0FBRUEsaUJBQVcsUUFBUSxLQUFLLE9BQU87QUFDN0IsWUFBSSxLQUFLLFdBQVcsR0FBRyxFQUFHO0FBQzFCLGNBQU0sTUFBTSxLQUFLLFVBQVUsS0FBSyxZQUFZLEdBQUcsQ0FBQyxFQUFFLFlBQVk7QUFDOUQsWUFBSSx5QkFBeUIsU0FBUyxHQUFHLEdBQUc7QUFDMUMsY0FBSTtBQUNGLGtCQUFNLGVBQWUsa0JBQWMsZ0NBQWMsR0FBRyxXQUFXLElBQUksSUFBSSxFQUFFLElBQUk7QUFDN0Usa0JBQU0sT0FBTyxNQUFNLFFBQVEsS0FBSyxZQUFZO0FBQzVDLG9CQUFRLEtBQUssRUFBRSxNQUFNLGNBQWMsTUFBTSxNQUFNLE1BQU0sTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQUEsVUFDN0UsUUFBUTtBQUFBLFVBQWE7QUFBQSxRQUN2QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxRQUFRLElBQUksQ0FBQztBQUNuQixZQUFRLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLGNBQWMsRUFBRSxJQUFJLENBQUM7QUFDbkQsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBLEVBR0EsTUFBYyxvQkFBb0IsSUFBWSxTQUFpQztBQUM3RSxRQUFJO0FBQ0YsWUFBTSxJQUFJO0FBQ1YsWUFBTSxlQUFlLEVBQUUsUUFBUTtBQUMvQixVQUFJLENBQUMsYUFBYyxPQUFNLElBQUksTUFBTSw0Q0FBUztBQUU1QyxZQUFNLE1BQU0sYUFBYSxVQUFVLGFBQWEsWUFBWSxHQUFHLENBQUMsRUFBRSxZQUFZO0FBQzlFLFVBQUksQ0FBQyx5QkFBeUIsU0FBUyxHQUFHLEVBQUcsT0FBTSxJQUFJLE1BQU0sMkRBQWMsR0FBRztBQUM5RSxVQUFJLGFBQWEsU0FBUyxJQUFJLEVBQUcsT0FBTSxJQUFJLE1BQU0sc0NBQVE7QUFFekQsWUFBTSxVQUFVLEtBQUs7QUFDckIsWUFBTSxPQUFPLE1BQU0sUUFBUSxLQUFLLFlBQVk7QUFDNUMsVUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLE9BQVEsT0FBTSxJQUFJLE1BQU0seUNBQVcsWUFBWTtBQUUxRSxZQUFNLFNBQVMsTUFBTSxRQUFRLFdBQVcsWUFBWTtBQUNwRCxXQUFLLFFBQVEsSUFBSSxFQUFFLE1BQU0sS0FBSyxVQUFVLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFBQSxJQUN4RCxTQUFTLEdBQUc7QUFDVixXQUFLLGFBQWEsSUFBSSxhQUFhLFFBQVEsRUFBRSxVQUFVLHNDQUFRO0FBQUEsSUFDakU7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsb0JBQW9CLElBQVksU0FBaUM7QUFDN0UsUUFBSTtBQUNGLFlBQU0sSUFBSTtBQUNWLFlBQU0sV0FBVyxFQUFFLFFBQVE7QUFDM0IsVUFBSSxDQUFDLFNBQVUsT0FBTSxJQUFJLE1BQU0sNENBQVM7QUFFeEMsWUFBTSxNQUFNLFNBQVMsVUFBVSxTQUFTLFlBQVksR0FBRyxDQUFDLEVBQUUsWUFBWTtBQUN0RSxVQUFJLENBQUMseUJBQXlCLFNBQVMsR0FBRyxFQUFHLE9BQU0sSUFBSSxNQUFNLDJEQUFjLEdBQUc7QUFDOUUsVUFBSSxTQUFTLFNBQVMsSUFBSSxFQUFHLE9BQU0sSUFBSSxNQUFNLHNDQUFRO0FBRXJELFlBQU0sU0FBUyxNQUFNLEtBQUssYUFBYSxXQUFXLFFBQVE7QUFDMUQsV0FBSyxRQUFRLElBQUksRUFBRSxNQUFNLEtBQUssVUFBVSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQUEsSUFDeEQsU0FBUyxHQUFHO0FBQ1YsV0FBSyxhQUFhLElBQUksYUFBYSxRQUFRLEVBQUUsVUFBVSxrREFBVTtBQUFBLElBQ25FO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFjLG9CQUFvQixJQUFZLFNBQWlDO0FBQzdFLFFBQUk7QUFDRixZQUFNLElBQUk7QUFDVixZQUFNLE1BQU0sRUFBRSxPQUFPO0FBQ3JCLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFHLE9BQU0sSUFBSSxNQUFNLCtFQUF3QjtBQUVuRSxZQUFNLE9BQU8sVUFBTSw2QkFBVyxFQUFFLEtBQUssUUFBUSxNQUFNLENBQUM7QUFDcEQsVUFBSSxLQUFLLFNBQVMsT0FBTyxLQUFLLFVBQVUsS0FBSztBQUMzQyxjQUFNLElBQUksTUFBTSxnREFBa0IsS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUNyRDtBQUNBLFlBQU0sU0FBUyxLQUFLO0FBQ3BCLFVBQUksQ0FBQyxPQUFRLE9BQU0sSUFBSSxNQUFNLHNDQUFRO0FBRXJDLFlBQU0sT0FBUSxLQUFLLFdBQVcsS0FBSyxRQUFRLGNBQWMsS0FBTTtBQUMvRCxXQUFLLFFBQVEsSUFBSSxFQUFFLE1BQU0sUUFBUSxJQUFJLFdBQVcsb0JBQW9CLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFBQSxJQUNqRixTQUFTLEdBQUc7QUFDVixXQUFLLGFBQWEsSUFBSSxhQUFhLFFBQVEsRUFBRSxVQUFVLHNDQUFRO0FBQUEsSUFDakU7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdRLFVBQVUsUUFBcUIsS0FBcUI7QUFDMUQsVUFBTSxPQUFPLFdBQVcsR0FBRyxLQUFLO0FBQ2hDLFdBQU8sUUFBUSxJQUFJLFdBQVcsb0JBQW9CLE1BQU0sQ0FBQztBQUFBLEVBQzNEO0FBQ0Y7OztBSHBiTyxJQUFNLHlCQUF5QjtBQVUvQixJQUFNLGtCQUFOLGNBQThCLDBCQUFTO0FBQUEsRUFXNUMsWUFDRSxNQUNBLFdBQ0EsU0FDQSxVQUNBLGNBQ0E7QUFDQSxVQUFNLElBQUk7QUFaWixTQUFRLFVBQTBCO0FBQ2xDLFNBQVEsU0FBd0I7QUFDaEMsU0FBUSxTQUFtQztBQUMzQyxTQUFRLGVBQWdDO0FBVXRDLFNBQUssWUFBWTtBQUNqQixTQUFLLFNBQVM7QUFDZCxTQUFLLFdBQVc7QUFDaEIsU0FBSyxlQUFlO0FBQUEsRUFDdEI7QUFBQSxFQUVBLGNBQXNCO0FBQ3BCLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxpQkFBeUI7QUFDdkIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLFVBQWtCO0FBQ2hCLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLFNBQXdCO0FBQzVCLFVBQU0sWUFBeUIsS0FBSyxZQUFZLFNBQVMsQ0FBQztBQUMxRCxjQUFVLE1BQU07QUFDaEIsY0FBVSxTQUFTLHlCQUF5QjtBQUU1QyxRQUFJLENBQUMsS0FBSyxXQUFXO0FBQ25CLGdCQUFVLFNBQVMsT0FBTztBQUFBLFFBQ3hCLE1BQU07QUFBQSxRQUNOLEtBQUs7QUFBQSxNQUNQLENBQUM7QUFDRDtBQUFBLElBQ0Y7QUFHQSxTQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ2hCLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUssU0FBUyxhQUFhO0FBQUEsTUFDM0IsS0FBSyxJQUFJLE1BQU07QUFBQSxJQUNqQjtBQUNBLFVBQU0sS0FBSyxPQUFPLGdCQUFnQjtBQUdsQyxVQUFNLGVBQWUsTUFBTSxLQUFLLGlCQUFpQjtBQUNqRCxTQUFLLE9BQU8sZ0JBQWdCLFlBQVk7QUFHeEMsVUFBTSxVQUFXLEtBQUssUUFBNEQsVUFBVSxXQUFXO0FBQ3ZHLFNBQUssVUFBVSxJQUFJLFFBQVEsS0FBSyxLQUFLLEtBQUssV0FBVyxPQUFPO0FBRTVELFVBQU0sWUFBWSxVQUFVLFNBQVMsT0FBTztBQUFBLE1BQzFDLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFFRCxRQUFJO0FBQ0YsV0FBSyxPQUFPLGVBQWU7QUFDM0IsWUFBTSxVQUFVLE1BQU0sS0FBSyxRQUFRLGFBQWE7QUFFaEQsV0FBSyxTQUFTLFVBQVUsU0FBUyxVQUFVO0FBQUEsUUFDekMsS0FBSztBQUFBLFFBQ0wsTUFBTTtBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsT0FBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGLENBQUM7QUFFRCxnQkFBVSxPQUFPO0FBQ2pCLFdBQUssT0FBTyxXQUFXLEtBQUssTUFBTTtBQUVsQyxXQUFLLGVBQWUsS0FBSyxJQUFJLFVBQVUsR0FBRyxjQUFjLE1BQU07QUFDNUQsYUFBSyxRQUFRLGVBQWUsS0FBSyxTQUFTLG1CQUFtQjtBQUFBLE1BQy9ELENBQUM7QUFBQSxJQUNILFNBQVMsR0FBRztBQUNWLGdCQUFVLE9BQU87QUFDakIsY0FBUSxNQUFNLG9EQUFnQyxDQUFDO0FBQy9DLGdCQUFVLFNBQVMsT0FBTztBQUFBLFFBQ3hCLE1BQU0sMkRBQWMsYUFBYSxRQUFRLEVBQUUsVUFBVSwwQkFBTTtBQUFBLFFBQzNELEtBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxVQUF5QjtBQUU3QixRQUFJLEtBQUssY0FBYztBQUNyQixXQUFLLElBQUksVUFBVSxPQUFPLEtBQUssWUFBWTtBQUMzQyxXQUFLLGVBQWU7QUFBQSxJQUN0QjtBQUdBLFNBQUssUUFBUSxPQUFPO0FBQ3BCLFNBQUssU0FBUztBQUdkLFNBQUssU0FBUyxRQUFRO0FBQ3RCLFNBQUssVUFBVTtBQUVmLFFBQUksS0FBSyxRQUFRO0FBQ2YsV0FBSyxPQUFPLE9BQU87QUFDbkIsV0FBSyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLFlBQVksTUFBb0I7QUFDOUIsUUFBSSxDQUFDLEtBQUssUUFBUSxjQUFlO0FBQ2pDLFNBQUssT0FBTyxjQUFjO0FBQUEsTUFDeEIsRUFBRSxNQUFNLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtBQUFBLE1BQ2hDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBYyxtQkFBbUU7QUFDL0UsVUFBTSxTQUFnRCxDQUFDO0FBQ3ZELFVBQU0sVUFBVSxLQUFLLElBQUksTUFBTTtBQUUvQixRQUFJO0FBQ0YsWUFBTSxlQUFlLEtBQUssU0FBUyxhQUFhO0FBQ2hELFVBQUk7QUFDSixVQUFJO0FBQ0YseUJBQWlCLE1BQU0sUUFBUSxLQUFLLFlBQVksR0FBRztBQUFBLE1BQ3JELFFBQVE7QUFDTixlQUFPO0FBQUEsTUFDVDtBQUVBLGlCQUFXLFNBQVMsZUFBZTtBQUNqQyxZQUFJLENBQUMsTUFBTSxTQUFTLEtBQUssRUFBRztBQUM1QixjQUFNLFdBQVcsR0FBRyxZQUFZLElBQUksS0FBSztBQUN6QyxZQUFJO0FBQ0YsZ0JBQU0sT0FBZSxNQUFNLFFBQVEsS0FBSyxRQUFRO0FBQ2hELGNBQUksQ0FBQyxLQUFLLFNBQVMsaUJBQWlCLEdBQUc7QUFDckMsb0JBQVEsS0FBSyxpREFBd0IsS0FBSywwRUFBNkI7QUFDdkU7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sS0FBSyxFQUFFLE1BQU0sTUFBTSxRQUFRLFNBQVMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUFBLFFBQ3hELFNBQVNDLE1BQWM7QUFDckIsa0JBQVEsTUFBTSw2REFBMEIsS0FBSyxrQkFBUUEsZ0JBQWUsUUFBUUEsS0FBSSxVQUFVLE9BQU9BLElBQUcsQ0FBQztBQUFBLFFBQ3ZHO0FBQUEsTUFDRjtBQUVBLFVBQUksT0FBTyxTQUFTLEdBQUc7QUFDckIsZ0JBQVEsTUFBTSwrQkFBcUIsT0FBTyxNQUFNLDBDQUFZLE9BQU8sSUFBSSxPQUFLLEVBQUUsSUFBSSxDQUFDO0FBQUEsTUFDckY7QUFBQSxJQUNGLFNBQVNBLE1BQWM7QUFDckIsY0FBUSxNQUFNLGdGQUE4QkEsZ0JBQWUsUUFBUUEsS0FBSSxVQUFVLE9BQU9BLElBQUcsQ0FBQztBQUFBLElBQzlGO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFDRjs7O0FTaEtPLElBQU0sbUJBQU4sTUFBdUI7QUFBQSxFQUM1QixZQUE2QixXQUF1QztBQUF2QztBQUFBLEVBQXdDO0FBQUEsRUFFN0QsS0FBSyxNQUF5QjtBQUNwQyxTQUFLLFVBQVUsR0FBRyxZQUFZLElBQUk7QUFBQSxFQUNwQztBQUFBO0FBQUEsRUFHQSxhQUFtQjtBQUNqQixTQUFLLEtBQUssYUFBYTtBQUFBLEVBQ3pCO0FBQUE7QUFBQSxFQUdBLGFBQW1CO0FBQ2pCLFNBQUssS0FBSyxhQUFhO0FBQUEsRUFDekI7QUFBQTtBQUFBLEVBR0EsV0FBaUI7QUFDZixTQUFLLEtBQUssV0FBVztBQUFBLEVBQ3ZCO0FBQUE7QUFBQSxFQUdBLFlBQWtCO0FBQ2hCLFNBQUssS0FBSyxrQkFBa0I7QUFBQSxFQUM5QjtBQUFBO0FBQUEsRUFHQSxlQUFxQjtBQUNuQixTQUFLLEtBQUsscUJBQXFCO0FBQUEsRUFDakM7QUFDRjs7O0FDdkRBLElBQUFDLG1CQUErQztBQXFDeEMsSUFBTSxtQkFBeUM7QUFBQSxFQUNwRCxVQUFVO0FBQUEsRUFDVixvQkFBb0I7QUFBQSxFQUNwQixlQUFlO0FBQUEsRUFDZixXQUFXO0FBQUEsRUFDWCxXQUFXO0FBQUEsRUFDWCxZQUFZLENBQUM7QUFBQSxFQUNiLHVCQUF1QjtBQUFBLEVBQ3ZCLHFCQUFxQjtBQUN2QjtBQUtPLElBQU0saUJBQU4sY0FBNkIsa0NBQWlCO0FBQUEsRUFHbkQsWUFBWSxLQUFVLFFBQTRCO0FBQ2hELFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFDeEIsZ0JBQVksTUFBTTtBQUNsQixnQkFBWSxTQUFTLHdCQUF3QjtBQUU3QyxRQUFJLHlCQUFRLFdBQVcsRUFBRSxRQUFRLCtDQUFZLEVBQUUsV0FBVztBQUcxRCxRQUFJLHlCQUFRLFdBQVcsRUFBRSxRQUFRLDBCQUFNLEVBQUUsV0FBVztBQUdwRCxRQUFJLHlCQUFRLFdBQVcsRUFDcEIsUUFBUSxzQ0FBUSxFQUNoQixRQUFRLHVJQUE4QixFQUN0QztBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxlQUFlLEVBQzlCLFNBQVMsS0FBSyxPQUFPLFNBQVMsUUFBUSxFQUN0QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxXQUFXLFNBQVM7QUFDekMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsZ0RBQWtCLEVBQzFCLFFBQVEsMkpBQXdDLEVBQ2hEO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FDRyxTQUFTLEtBQUssT0FBTyxTQUFTLGtCQUFrQixFQUNoRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxxQkFBcUI7QUFDMUMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSwwQkFBTSxFQUFFLFdBQVc7QUFFcEQsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsNENBQVMsRUFDakIsUUFBUSwrS0FBd0MsRUFDaEQ7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsc0NBQVEsRUFDdkIsU0FBUyxLQUFLLE9BQU8sU0FBUyxTQUFTLEVBQ3ZDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLFlBQVksU0FBUztBQUMxQyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0w7QUFHRixRQUFJLHlCQUFRLFdBQVcsRUFBRSxRQUFRLG9CQUFLLEVBQUUsV0FBVztBQUVuRCxRQUFJLHlCQUFRLFdBQVcsRUFDcEIsUUFBUSxzQ0FBUSxFQUNoQixRQUFRLHNSQUFxRCxFQUM3RDtBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSwrREFBYSxFQUM1QixTQUFTLEtBQUssT0FBTyxTQUFTLFNBQVMsRUFDdkMsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsWUFBWSxNQUFNLEtBQUs7QUFDNUMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBR0YsUUFBSSx5QkFBUSxXQUFXLEVBQUUsUUFBUSwwQkFBTSxFQUFFLFdBQVc7QUFFcEQsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsZ0RBQWtCLEVBQzFCLFFBQVEsdVZBQXVHLEVBQy9HO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FDRyxTQUFTLEtBQUssT0FBTyxTQUFTLG1CQUFtQixFQUNqRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxzQkFBc0I7QUFDM0MsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixjQUFNLFFBQVEsZUFBZSxjQUFpQyxzQkFBc0I7QUFDcEYsWUFBSSxDQUFDLE9BQU8sY0FBZTtBQUMzQixZQUFJLE9BQU87QUFFVCxnQkFBTSxTQUFTLGlCQUFpQixlQUFlLElBQUksRUFDaEQsaUJBQWlCLHNCQUFzQixFQUN2QyxLQUFLO0FBQ1IsZ0JBQU0sTUFBTSxZQUFZLFNBQVMsTUFBTTtBQUN2QyxnQkFBTSxVQUFVLGlCQUFpQixlQUFlLElBQUksRUFDakQsaUJBQWlCLHdCQUF3QixFQUN6QyxLQUFLO0FBQ1IsZ0JBQU0sS0FBSyxZQUFZLGVBQWUsT0FBTztBQUM3QyxnQkFBTSxhQUFhLGlCQUFpQixlQUFlLElBQUksRUFDcEQsaUJBQWlCLGVBQWUsRUFDaEMsS0FBSztBQUNSLGdCQUFNLGdCQUFnQixZQUFZLGVBQWUsVUFBVTtBQUMzRCxnQkFBTSxZQUFZLGlCQUFpQixlQUFlLElBQUksRUFDbkQsaUJBQWlCLGNBQWMsRUFDL0IsS0FBSztBQUNSLGdCQUFNLGVBQWUsWUFBWSxlQUFlLFNBQVM7QUFDekQsZ0JBQU0sVUFBbUc7QUFBQSxZQUN2RyxRQUFRLGVBQWUsS0FBSyxVQUFVLFNBQVMsWUFBWTtBQUFBLFVBQzdEO0FBQ0EsY0FBSSxRQUFRLEtBQU0sU0FBUSxNQUFNO0FBQ2hDLGNBQUksT0FBTyxLQUFNLFNBQVEsS0FBSztBQUM5QixjQUFJLGtCQUFrQixLQUFNLFNBQVEsYUFBYTtBQUNqRCxjQUFJLGlCQUFpQixLQUFNLFNBQVEsWUFBWTtBQUMvQyxnQkFBTSxjQUFjLFlBQVk7QUFBQSxZQUM5QixNQUFNO0FBQUEsWUFDTixJQUFJLGNBQWMsS0FBSyxJQUFJO0FBQUEsWUFDM0I7QUFBQSxVQUNGLEdBQUcsR0FBRztBQUFBLFFBQ1IsT0FBTztBQUVMLGdCQUFNLGNBQWMsWUFBWTtBQUFBLFlBQzlCLE1BQU07QUFBQSxZQUNOLElBQUksY0FBYyxLQUFLLElBQUk7QUFBQSxZQUMzQixTQUFTLENBQUM7QUFBQSxVQUNaLEdBQUcsR0FBRztBQUFBLFFBQ1I7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNMO0FBRUYsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsK0NBQWlCLEVBQ3pCLFFBQVEsa01BQWlELEVBQ3pEO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FDRyxTQUFTLEtBQUssT0FBTyxTQUFTLHFCQUFxQixFQUNuRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyx3QkFBd0I7QUFDN0MsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixZQUFJLENBQUMsT0FBTztBQUNWLHNCQUFZLGdCQUFnQjtBQUFBLFFBQzlCO0FBQ0EsY0FBTSxRQUFRLGVBQWUsY0FBaUMsc0JBQXNCO0FBQ3BGLFlBQUksT0FBTyxlQUFlO0FBQ3hCLGdCQUFNLGNBQWMsWUFBWTtBQUFBLFlBQzlCLE1BQU07QUFBQSxZQUNOLElBQUksY0FBYyxLQUFLLElBQUk7QUFBQSxZQUMzQixTQUFTLEVBQUUsU0FBUyxNQUFNO0FBQUEsVUFDNUIsR0FBRyxHQUFHO0FBQUEsUUFDUjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0w7QUFHRixRQUFJLHlCQUFRLFdBQVcsRUFBRSxRQUFRLGNBQUksRUFBRSxXQUFXO0FBR2xELFVBQU0sWUFBWSxZQUFZLFVBQVUsRUFBRSxLQUFLLG9CQUFvQixDQUFDO0FBQ3BFLGNBQVUsU0FBUyxLQUFLLEVBQUUsTUFBTSw0QkFBUSxLQUFLLHFCQUFxQixDQUFDO0FBQ25FLGNBQVUsU0FBUyxLQUFLO0FBQUEsTUFDdEIsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1AsQ0FBQztBQUdELFVBQU0sWUFBWSxZQUFZLFVBQVUsRUFBRSxLQUFLLHdDQUF3QyxDQUFDO0FBQ3hGLFVBQU0sWUFBWSxVQUFVLFVBQVUsRUFBRSxLQUFLLDBCQUEwQixDQUFDO0FBQ3hFLFVBQU0sU0FBUyxVQUFVLFVBQVUsRUFBRSxLQUFLLHNCQUFzQixDQUFDO0FBR2pFLFVBQU0sWUFBWTtBQUNoQixVQUFJO0FBQ0YsY0FBTSxZQUFZLEtBQUssT0FBTyxTQUFTLE9BQU87QUFDOUMsY0FBTSxVQUFVLEtBQUssSUFBSSxNQUFNO0FBQy9CLGNBQU0sYUFBYTtBQUFBLFVBQ2pCLEdBQUcsU0FBUztBQUFBLFVBQ1osR0FBRyxTQUFTO0FBQUEsUUFDZDtBQUNBLG1CQUFXLGNBQWMsWUFBWTtBQUNuQyxnQkFBTSxTQUFTLE1BQU0sUUFBUSxPQUFPLFVBQVU7QUFDOUMsY0FBSSxDQUFDLE9BQVE7QUFDYixnQkFBTSxhQUFhLE1BQU0sUUFBUSxXQUFXLFVBQVU7QUFDdEQsZ0JBQU0sTUFBTSxPQUFPLEtBQUssVUFBVSxFQUFFLFNBQVMsUUFBUTtBQUNyRCxpQkFBTyxhQUFhO0FBQUEsWUFDbEIsaUJBQWlCLDhCQUE4QixHQUFHO0FBQUEsVUFDcEQsQ0FBQztBQUNEO0FBQUEsUUFDRjtBQUFBLE1BQ0YsUUFBUTtBQUFBLE1BQWtEO0FBQUEsSUFDNUQsR0FBRztBQUdILFVBQU0sYUFBYSxVQUFVLFVBQVUsRUFBRSxLQUFLLDJCQUEyQixDQUFDO0FBQzFFLGVBQVcsU0FBUyxLQUFLLEVBQUUsTUFBTSxzQkFBTyxLQUFLLDJCQUEyQixDQUFDO0FBQ3pFLGVBQVcsU0FBUyxLQUFLLEVBQUUsTUFBTSx3Q0FBVSxLQUFLLDJCQUEyQixDQUFDO0FBRzVFLGNBQVUsU0FBUyxLQUFLLEVBQUUsTUFBTSxxQ0FBaUIsS0FBSywyQkFBMkIsQ0FBQztBQUNsRixVQUFNLFdBQVcsVUFBVSxVQUFVLEVBQUUsS0FBSyx5QkFBeUIsQ0FBQztBQUV0RTtBQUFBLE1BQUMsRUFBRSxNQUFNLDRCQUFRLEtBQUssc0RBQXNEO0FBQUEsTUFDM0UsRUFBRSxNQUFNLGtDQUFTLEtBQUssMERBQTBEO0FBQUEsSUFBQyxFQUFFLFFBQVEsVUFBUTtBQUNsRyxZQUFNLE1BQU0sU0FBUyxTQUFTLFFBQVEsRUFBRSxNQUFNLEtBQUssTUFBTSxLQUFLLG1CQUFtQixDQUFDO0FBQ2xGLFVBQUksS0FBSyxLQUFLO0FBQ1osWUFBSSxhQUFhLEVBQUUsUUFBUSxVQUFVLENBQUM7QUFDdEMsWUFBSSxpQkFBaUIsU0FBUyxNQUFNO0FBQ2xDLGlCQUFPLEtBQUssS0FBSyxLQUFLLFFBQVE7QUFBQSxRQUNoQyxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUdELFVBQU0sYUFBYSxZQUFZLFVBQVUsRUFBRSxLQUFLLG9CQUFvQixDQUFDO0FBQ3JFLGVBQVcsU0FBUyxLQUFLLEVBQUUsTUFBTSw0QkFBUSxLQUFLLHFCQUFxQixDQUFDO0FBQ3BFLGVBQVcsU0FBUyxLQUFLLEVBQUUsTUFBTSx5Q0FBMEIsS0FBSyxvQkFBb0IsQ0FBQztBQUNyRixlQUFXLFNBQVMsS0FBSyxFQUFFLE1BQU0sNkJBQWMsS0FBSyxvQkFBb0IsQ0FBQztBQUFBLEVBQzNFO0FBQ0Y7OztBWDFQQSxJQUFxQixxQkFBckIsY0FBZ0Qsd0JBQU87QUFBQSxFQUF2RDtBQUFBO0FBQ0Usb0JBQWlDO0FBQUE7QUFBQSxFQUdqQyxNQUFNLFNBQXdCO0FBRTVCLFVBQU0sS0FBSyxhQUFhO0FBRXhCLFVBQU0sWUFBWSxLQUFLLFNBQVMsT0FBTztBQUN2QyxVQUFNLFVBQVUsS0FBSyxTQUFTLFdBQVc7QUFJekMsU0FBSyxRQUFRLFNBQVMsS0FBSyxLQUFLLFdBQVcsT0FBTztBQUdsRCxTQUFLLGFBQWEsd0JBQXdCLENBQUMsU0FBd0I7QUFDakUsYUFBTyxJQUFJLGdCQUFnQixNQUFNLFdBQVcsTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLGFBQWEsQ0FBQztBQUFBLElBQzVGLENBQUM7QUFHRCxTQUFLLFNBQVMsSUFBSSxpQkFBaUIsTUFBTTtBQUN2QyxZQUFNLFNBQVMsS0FBSyxJQUFJLFVBQVUsZ0JBQWdCLHNCQUFzQjtBQUN4RSxVQUFJLE9BQU8sV0FBVyxFQUFHLFFBQU87QUFDaEMsYUFBTyxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ25CLENBQUM7QUFHRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxLQUFLLGFBQWE7QUFBQSxJQUNwQyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxPQUFPLFdBQVc7QUFBQSxJQUN6QyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxPQUFPLFdBQVc7QUFBQSxJQUN6QyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxPQUFPLFNBQVM7QUFBQSxJQUN2QyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxPQUFPLFVBQVU7QUFBQSxJQUN4QyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxJQUMzQyxDQUFDO0FBR0QsU0FBSyxjQUFjLElBQUksZUFBZSxLQUFLLEtBQUssSUFBSSxDQUFDO0FBR3JELFNBQUssY0FBYyxRQUFRLGtDQUFTLE1BQU07QUFDeEMsV0FBSyxLQUFLLGFBQWE7QUFBQSxJQUN6QixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsV0FBaUI7QUFDZixnQkFBWSxnQkFBZ0I7QUFBQSxFQUM5QjtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sRUFBRSxVQUFVLElBQUksS0FBSztBQUUzQixRQUFJLE9BQTZCO0FBQ2pDLFVBQU0sU0FBUyxVQUFVLGdCQUFnQixzQkFBc0I7QUFFL0QsUUFBSSxPQUFPLFNBQVMsR0FBRztBQUVyQixhQUFPLE9BQU8sQ0FBQztBQUFBLElBQ2pCLE9BQU87QUFFTCxhQUFPLFVBQVUsUUFBUSxLQUFLO0FBQzlCLFlBQU0sS0FBSyxhQUFhO0FBQUEsUUFDdEIsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUFBLElBQ0g7QUFFQSxRQUFJLE1BQU07QUFDUixZQUFNLFVBQVUsV0FBVyxJQUFJO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxFQUMzRTtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAibCIsICJfYSIsICJfYSIsICJfYSIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgIm1heCIsICJlcnIiLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
