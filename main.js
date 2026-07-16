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
var import_obsidian11 = require("obsidian");

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
    const clone = JSON.parse(JSON.stringify(goals));
    this.goals = clone;
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
    for (const s of goal.suggestions) {
      this.renderSuggestionRow(suggWrap, s, goal);
    }
  }
  renderSuggestionRow(parent, text, goal) {
    const row = parent.createDiv({ cls: "bamboo-diag-suggestion" });
    row.createEl("div", { text, cls: "bamboo-diag-suggestion-text" });
    const btn = row.createEl("button", {
      text: "\u5E94\u7528",
      cls: "bamboo-diag-apply"
    });
    btn.addEventListener("click", () => {
      this.opts.onApply(goal);
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

// src/ai/GoalDiagnoser.ts
var import_obsidian10 = require("obsidian");

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
      (e) => `    - ${e.name}\uFF5CdailyMin=${e.dailyMin || "?"}\uFF5C\u5B8C\u6210\u5EA6=${e.percent != null ? e.percent + "%" : "?"}\uFF5C\u8282\u594F\u5E94\u5B8C\u6210=${e.pacePct != null ? e.pacePct + "%" : "?"}\uFF5C\u8282\u594F\u504F\u5DEE=${e.paceDeviation != null ? e.paceDeviation + "pt" : "?"}\uFF5C\u7A97\u53E3\u5185\u5B8C\u6210 ${e.doneDays} \u5929\uFF08\u6700\u8FD1 ${e.lastDone ?? "\u65E0"}\uFF09`
    ).join("\n") : "    \uFF08\u65E0\u5B50\u9879\uFF09";
    return `\u76EE\u6807\u300C${g.title}\u300D\uFF1A
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
    suggestions: asStringArray(g.suggestions),
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
    '- JSON \u7ED3\u6784\uFF1A{ "summary": string, "goals": [ { "title": string, "completion": number(0-100), "healthScore": number(0-100), "level": "excellent"|"good"|"warning"|"risk", "L1": number, "L2": number, "L3": number, "weakest": "L1"|"L2"|"L3", "status": "on_track"|"behind"|"stuck"|"done"|"at_risk", "bottleneck": string, "evidenceRef": string, "suggestions": string[] } ], "nextActions": string[] }',
    "- healthScore/level/L1/L2/L3/weakest \u5FC5\u987B\u4E0E\u7ED9\u5B9A\u300C\u5065\u5EB7\u5206\u4E09\u7EF4\u6458\u8981\u300D\u4FDD\u6301\u4E00\u81F4\uFF08\u76F4\u63A5\u91C7\u7528\u6458\u8981\u4E2D\u7684\u6570\u503C\u4E0E\u6700\u5F31\u7EF4\u5EA6\uFF0C\u4E0D\u8981\u81EA\u884C\u53E6\u7B97\uFF09\u3002",
    "- level \u53D6\u81EA excellent/good/warning/risk\uFF1Bweakest \u53D6\u81EA L1/L2/L3\uFF1Bstatus \u53D6\u81EA\u7ED9\u5B9A\u679A\u4E3E\u3002",
    "- bottleneck \u4E0E suggestions \u5FC5\u987B\u56F4\u7ED5 weakest \u7EF4\u5EA6\u5C55\u5F00\uFF1AL1\u2192\u5C65\u7EA6/\u8282\u594F\u3001L2\u2192\u91CD\u65B0\u6FC0\u6D3B\u52A8\u529B\uFF08\u5982\u5148\u5B8C\u6210\u4E00\u4E2A\u7B80\u5355\u5B50\u9879\uFF09\u3001L3\u2192\u505C\u6EDE\u6216\u5747\u8861\uFF08\u5173\u6CE8\u8FB9\u7F18\u5B50\u9879\uFF09\u3002",
    "- \u300C\u771F\u5B9E\u5B50\u9879\u6E05\u5355\u300D\u662F\u4F60\u552F\u4E00\u5141\u8BB8\u5F15\u7528\u7684\u5B50\u9879\u6765\u6E90\u3002\u4EFB\u4F55\u5EFA\u8BAE\u53EA\u80FD\u70B9\u540D\u6E05\u5355\u91CC\u771F\u5B9E\u5B58\u5728\u7684\u5B50\u9879\uFF0C\u5E76\u57FA\u4E8E\u5176\u771F\u5B9E\u7684 dailyMin / percent / \u8282\u594F\u504F\u5DEE\u7ED9\u51FA\u5177\u4F53\u6570\u503C\u5EFA\u8BAE\u3002",
    "- \u4E25\u7981\u7F16\u9020\u6E05\u5355\u5916\u7684\u5B50\u9879\uFF08\u4F8B\u5982\u865A\u6784\u300C\u6BCF\u65E5\u7814\u53D1\u5B57\u91CF\u300D\u7B49\uFF09\uFF0C\u4E5F\u7981\u6B62\u5728 suggestions \u91CC\u51ED\u7A7A\u65B0\u589E\u5B50\u9879\uFF1B\u5982\u9700\u8C03\u6574\uFF0C\u53EA\u80FD\u5BF9\u6E05\u5355\u5185\u5DF2\u6709\u5B50\u9879\u63D0\u5EFA\u8BAE\u3002",
    '- evidenceRef \u5FC5\u987B\u662F\u8BE5\u76EE\u6807\u6E05\u5355\u91CC\u771F\u5B9E\u5B58\u5728\u7684\u67D0\u4E2A\u5B50\u9879\u540D\uFF08\u82E5\u74F6\u9888\u662F\u76EE\u6807\u7EA7\u800C\u975E\u5177\u4F53\u5B50\u9879\uFF0C\u586B\u7A7A\u5B57\u7B26\u4E32 ""\uFF09\u3002',
    "- suggestions \u6BCF\u6761\u5FC5\u987B\u662F\u4E00\u53E5\u3010\u53EF\u76F4\u63A5\u4EA4\u7ED9\u53E6\u4E00\u4E2A AI \u53BB\u6539\u76EE\u6807\u6811\u3011\u7684\u81EA\u7136\u8BED\u8A00\u6307\u4EE4\uFF0C\u4F8B\u5982\u300C\u5C06\u5B50\u9879\u300E\u55B5\u5B57\u6447\u6EDA\u4F53\u300F\u7684 dailyMin \u4ECE 10 \u964D\u5230 7\u300D\u300C\u5B50\u9879\u300E\u672A\u6765\u7532\u9AA8\u6587\u300F\u5F53\u524D\u843D\u540E\u8282\u594F Xpt\uFF0C\u5EFA\u8BAE\u628A dailyMin \u4ECE 5 \u63D0\u5230 8\u300D\u3002\u4E0D\u8981\u5199\u7A7A\u6CDB\u5EFA\u8BAE\u3002",
    "- \u8FD9\u4E9B\u5EFA\u8BAE\u4F1A\u88AB\u53E6\u4E00\u4E2A AI \u5F53\u4F5C\u6307\u4EE4\u6267\u884C\u53BB\u6539\u76EE\u6807\u6811\uFF0C\u6240\u4EE5\u53EA\u5199\u9488\u5BF9\u6E05\u5355\u5185\u771F\u5B9E\u5B50\u9879\u7684\u3001\u53EF\u843D\u5730\u7684\u6307\u4EE4\u3002"
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
async function diagnose(goals, days, settings, fetchFn = import_obsidian10.requestUrl, today = /* @__PURE__ */ new Date()) {
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

// src/ai/runDiagnosis.ts
async function runDiagnosis(deps) {
  if (!deps.aiEnabled) {
    deps.notice("AI \u8BCA\u65AD\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
    return;
  }
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
  const cache = buildCache(goals, days);
  const itemEvidence = buildItemEvidenceMap(goals, cache);
  const result = await deps.diagnose(goals, days, deps.plannerSettings);
  deps.openDiagnosis({
    diagnosis: result,
    itemEvidence,
    onApply: (goal) => {
      deps.openAgentic({
        content: "",
        scope: "note",
        settings: deps.plannerSettings,
        goals,
        initialInstruction: goal.suggestions.join("\uFF1B"),
        onConfirm: (finalGoals) => void deps.writeGoals(finalGoals)
      });
    }
  });
}

// main.ts
function hashContent(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) + h + s.charCodeAt(i) >>> 0;
  }
  return h.toString(36);
}
var BambooReviewPlugin = class extends import_obsidian11.Plugin {
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
      new import_obsidian11.Notice("AI \u89C4\u5212\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
      return;
    }
    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof import_obsidian11.TFile) || file.extension !== "md") {
      new import_obsidian11.Notice("AI \u89C4\u5212\uFF1A\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7 Markdown \u7B14\u8BB0");
      return;
    }
    let content = "";
    try {
      content = await this.app.vault.read(file);
    } catch (e) {
      new import_obsidian11.Notice(`\u8BFB\u53D6\u7B14\u8BB0\u5931\u8D25\uFF1A${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`);
      return;
    }
    if (!content.trim()) {
      new import_obsidian11.Notice("AI \u89C4\u5212\uFF1A\u7B14\u8BB0\u5185\u5BB9\u4E3A\u7A7A");
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
      new import_obsidian11.Notice("AI \u89C4\u5212\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
      return;
    }
    const file = this.app.workspace.getActiveFile();
    if (!file || !(file instanceof import_obsidian11.TFile) || file.extension !== "md") {
      new import_obsidian11.Notice("AI \u89C4\u5212\uFF1A\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7 Markdown \u7B14\u8BB0");
      return;
    }
    const selection = selectionArg && selectionArg.trim() || this.app.workspace.getActiveViewOfType(import_obsidian11.MarkdownView)?.editor.getSelection()?.trim() || "";
    if (!selection) {
      new import_obsidian11.Notice("\u8BF7\u5148\u9009\u4E2D\u4E00\u6BB5\u6587\u672C\uFF0C\u518D\u6267\u884C\u300C\u5C06\u9009\u4E2D\u6587\u672C\u8F6C\u4E3A\u76EE\u6807\u5361\u7247\u300D");
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
      new import_obsidian11.Notice("\u8BE5\u7B14\u8BB0\u5DF2\u89C4\u5212\u8FC7\uFF08\u5185\u5BB9\u672A\u53D8\uFF09\uFF0C\u5DF2\u8DF3\u8FC7\u91CD\u590D\u5199\u5165");
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
      new import_obsidian11.Notice(`\u5DF2\u5199\u5165 ${withRef.length} \u4E2A\u76EE\u6807\u5230\u300C\u7AF9\u6797\u4FEE\u4ED9\u4F20\u300D`);
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
      new import_obsidian11.Notice("\u672A\u53D1\u73B0\u4EFB\u4F55\u5DF2\u89C4\u5212\u7684\u7B14\u8BB0");
      return;
    }
    const s = this.settings;
    if (!s.aiEnabled) {
      new import_obsidian11.Notice("AI \u89C4\u5212\u672A\u542F\u7528\uFF1A\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5F00\u542F\u5E76\u586B\u5199 API Key");
      return;
    }
    const plannerSettings = {
      aiApiKey: s.aiApiKey,
      aiBaseUrl: s.aiBaseUrl,
      aiModel: s.aiModel,
      aiDecomposeDepth: s.aiDecomposeDepth
    };
    const loading = new import_obsidian11.Notice(`\u6B63\u5728\u91CD\u5EFA ${paths.size} \u7BC7\u7B14\u8BB0\u7684 AI \u76EE\u6807\u2026`, 0);
    let ok = 0;
    let failed = 0;
    for (const p of paths) {
      const file = this.app.vault.getAbstractFileByPath(p);
      if (!(file instanceof import_obsidian11.TFile)) continue;
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
    new import_obsidian11.Notice(`\u5DF2\u91CD\u5EFA ${ok} \u7BC7\u7B14\u8BB0\u7684 AI \u76EE\u6807${failed > 0 ? `\uFF0C${failed} \u7BC7\u5931\u8D25` : ""}`);
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
    await runDiagnosis({
      aiEnabled: s.aiEnabled,
      plannerSettings,
      storage,
      diagnose,
      openDiagnosis: (o) => new DiagnosisModal(this.app, o).open(),
      openAgentic: (o) => new AgenticPlanModal(this.app, o).open(),
      writeGoals: (g) => void this.writeDiagnosedGoals(g),
      notice: (m) => new import_obsidian11.Notice(m),
      recentDays: 14
    });
  }
  /** 诊断建议应用后的落库：写 goals.json + 刷新常驻视图（不碰幂等索引/ sourceRef） */
  async writeDiagnosedGoals(goals) {
    const storage = new VaultStorage(this.app);
    await storage.putGoals(goals);
    this.webapp.notifyGoalsChanged();
    new import_obsidian11.Notice(`\u5DF2\u5199\u5165 ${goals.length} \u4E2A\u76EE\u6807\uFF08\u5E94\u7528 AI \u8BCA\u65AD\u5EFA\u8BAE\uFF09`);
  }
  /**
   * 战略复盘面板「用 AI 改进」入口：webapp 健康分详情点按钮 → postMessage(app:aiImproveGoal)
   * → AppAPI.onAiImproveGoal → 此处。复用诊断闭环的 AgenticPlanModal 预填 + 落库链路。
   */
  async requestAiImprove(p) {
    const s = this.settings;
    if (!s.aiEnabled) {
      new import_obsidian11.Notice("\u5148\u5230\u8BBE\u7F6E\u91CC\u5F00\u542F AI \u89C4\u5212\uFF0C\u624D\u80FD\u7528 AI \u6539\u8FDB\u76EE\u6807");
      return;
    }
    const storage = new VaultStorage(this.app);
    const goals = await storage.getGoals();
    if (goals.length === 0) {
      new import_obsidian11.Notice("\u4F60\u8FD8\u6CA1\u6709\u76EE\u6807\uFF0C\u5148\u8DD1\u4E00\u6B21 AI \u89C4\u5212");
      return;
    }
    const goal = goals.find((g) => g.id === p.goalId) ?? goals.find((g) => g.title === p.title);
    if (!goal) {
      new import_obsidian11.Notice("\u672A\u5728\u76EE\u6807\u5E93\u4E2D\u627E\u5230\u8BE5\u76EE\u6807\uFF0C\u53EF\u80FD\u5B83\u5DF2\u88AB\u5220\u9664");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9ob3N0L0FwcEhvc3QudHMiLCAibm9kZV9tb2R1bGVzL2ZmbGF0ZS9lc20vYnJvd3Nlci5qcyIsICJzcmMvaG9zdC9BcHBBUEkudHMiLCAic3JjL3N0b3JhZ2UvVmF1bHRTdG9yYWdlLnRzIiwgInNyYy9zdG9yYWdlL0ltcG9ydFZhbGlkYXRvci50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL2hvc3QvcHJvdG9jb2wudHMiLCAic3JjL2hvc3QvV2ViYXBwQ29udHJvbGxlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiLCAic3JjL2FpL01hcmtkb3duUGxhbm5lci50cyIsICJzcmMvdHlwZXMvZGF0YS50cyIsICJzcmMvYWkvR29hbENhcmRWYWxpZGF0b3IudHMiLCAic3JjL2FpL2dvYWxJZC50cyIsICJzcmMvYWkvaWRlbXBvdGVuY3kudHMiLCAic3JjL2FpL0FnZW50aWNQbGFuTW9kYWwudHMiLCAic3JjL2FpL1BsYW5uaW5nU2Vzc2lvbi50cyIsICJzcmMvYWkvRGlhZ25vc2lzTW9kYWwudHMiLCAic3JjL2FpL0dvYWxEaWFnbm9zZXIudHMiLCAic3JjL2FpL0RldmlhdGlvbkNhbGN1bGF0b3IudHMiLCAic3JjL2FpL2hlYWx0aFNjb3JlLnRzIiwgInNyYy9haS9ydW5EaWFnbm9zaXMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiwgTm90aWNlLCBURmlsZSwgTWFya2Rvd25WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IEFwcEhvc3QgfSBmcm9tICcuL3NyYy9ob3N0L0FwcEhvc3QnO1xuaW1wb3J0IHsgV2ViYXBwQ29udHJvbGxlciB9IGZyb20gJy4vc3JjL2hvc3QvV2ViYXBwQ29udHJvbGxlcic7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4vc3JjL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5pbXBvcnQge1xuICBQbHVnaW5TZXR0aW5ncyxcbiAgREVGQVVMVF9TRVRUSU5HUyxcbiAgdHlwZSBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbn0gZnJvbSAnLi9zcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi9zcmMvc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgcGxhbkZyb21Ob3RlLCB0eXBlIFBsYW5uZXJTZXR0aW5ncyB9IGZyb20gJy4vc3JjL2FpL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQgeyB2YWxpZGF0ZUdvYWxzIH0gZnJvbSAnLi9zcmMvYWkvR29hbENhcmRWYWxpZGF0b3InO1xuaW1wb3J0IHsgZGVyaXZlU3RhYmxlR29hbElkIH0gZnJvbSAnLi9zcmMvYWkvZ29hbElkJztcbmltcG9ydCB7IHNob3VsZFNraXBQbGFubmVkIH0gZnJvbSAnLi9zcmMvYWkvaWRlbXBvdGVuY3knO1xuaW1wb3J0IHsgQWdlbnRpY1BsYW5Nb2RhbCB9IGZyb20gJy4vc3JjL2FpL0FnZW50aWNQbGFuTW9kYWwnO1xuaW1wb3J0IHsgRGlhZ25vc2lzTW9kYWwgfSBmcm9tICcuL3NyYy9haS9EaWFnbm9zaXNNb2RhbCc7XG5pbXBvcnQgeyBkaWFnbm9zZSB9IGZyb20gJy4vc3JjL2FpL0dvYWxEaWFnbm9zZXInO1xuaW1wb3J0IHsgcnVuRGlhZ25vc2lzIH0gZnJvbSAnLi9zcmMvYWkvcnVuRGlhZ25vc2lzJztcbmltcG9ydCB0eXBlIHsgR29hbEl0ZW0gfSBmcm9tICcuL3NyYy90eXBlcy9kYXRhJztcblxuLyoqIFx1NTE4NVx1NUJCOVx1NjMwN1x1N0VCOVx1RkYwOGRqYjJcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEUgQUkgXHU4OUM0XHU1MjEyXHU1RTQyXHU3QjQ5XHU1MjI0XHU5MUNEICovXG5mdW5jdGlvbiBoYXNoQ29udGVudChzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaCA9IDUzODE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgIGggPSAoKGggPDwgNSkgKyBoICsgcy5jaGFyQ29kZUF0KGkpKSA+Pj4gMDtcbiAgfVxuICByZXR1cm4gaC50b1N0cmluZygzNik7XG59XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW1ib29SZXZpZXdQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIHdlYmFwcCE6IFdlYmFwcENvbnRyb2xsZXI7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICBjb25zdCBwbHVnaW5EaXIgPSB0aGlzLm1hbmlmZXN0LmRpciB8fCAnJztcbiAgICBjb25zdCB2ZXJzaW9uID0gdGhpcy5tYW5pZmVzdC52ZXJzaW9uIHx8ICcnO1xuXG4gICAgLy8gXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2IHdlYmFwcFx1RkYxQVx1NjNEMlx1NEVGNlx1NTJBMFx1OEY3RFx1NTM3M1x1ODlFNlx1NTNEMVx1RkYwQ1x1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NTI0RFx1NTkyN1x1Njk4Mlx1NzM4N1x1NURGMlx1NUMzMVx1N0VFQVx1RkYwQ1x1NkQ4OFx1OTY2NFx1MzAwQ1x1NjI1M1x1NUYwMFx1N0E3QVx1NzY3RFx1MzAwRFx1NEY1M1x1NjExRlx1MzAwMlxuICAgIC8vIFx1NTkzMVx1OEQyNVx1NEUwRFx1OTYzQlx1NTg1RSBvbmxvYWRcdUZGMENcdTYyNTNcdTVGMDBcdTg5QzZcdTU2RkVcdTY1RjYgYnVpbGRCbG9iVXJsIFx1NEYxQVx1NTE4RFx1NkIyMVx1NUMxRFx1OEJENVx1MzAwMlxuICAgIHZvaWQgQXBwSG9zdC5wcmVmZXRjaCh0aGlzLmFwcCwgcGx1Z2luRGlyLCB2ZXJzaW9uKTtcblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XHVGRjA4XHU0RjIwXHU5MDEyIHBsdWdpbkRpciBcdTRGOUIgSXRlbVZpZXcgXHU1MkEwXHU4RjdEIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdUZGMDlcbiAgICB0aGlzLnJlZ2lzdGVyVmlldyhWSUVXX1RZUEVfREFJTFlfUkVWSUVXLCAobGVhZjogV29ya3NwYWNlTGVhZikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYWlseVJldmlld1ZpZXcobGVhZiwgcGx1Z2luRGlyLCB0aGlzLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NUJCRlx1NEUzQiBcdTIxOTIgd2ViYXBwIFx1NzZGNFx1OEZERVx1NjNBNVx1NTNFM1x1RkYwOFBoYXNlMyBcdTk1RThcdTk3NjJcdUZGMENcdTUxODVcdTkwRThcdTRFQ0RcdThENzAgc2VuZENvbW1hbmQgXHU3RUJGXHU1MzRGXHU4QkFFXHVGRjA5XG4gICAgdGhpcy53ZWJhcHAgPSBuZXcgV2ViYXBwQ29udHJvbGxlcigoKSA9PiB7XG4gICAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgICAgaWYgKGxlYXZlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIGxlYXZlc1swXS52aWV3IGFzIERhaWx5UmV2aWV3VmlldztcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZQcmV2RGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1uZXh0LWRheScsXG4gICAgICBuYW1lOiAnXHU1NDBFXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZOZXh0RGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS10b2RheScsXG4gICAgICBuYW1lOiAnXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZUb2RheSgpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5vcGVuU3RhdHMoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc2V0dGluZ3MtaW4tYXBwJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm9wZW5TZXR0aW5ncygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWktcGxhbi1mcm9tLW5vdGUnLFxuICAgICAgbmFtZTogJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1NUY1M1x1NTI0RFx1N0IxNFx1OEJCMFx1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0NycsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLmFpUGxhbkZyb21Ob3RlKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1wbGFuLWZyb20tc2VsZWN0aW9uJyxcbiAgICAgIG5hbWU6ICdBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTVDMDZcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDcnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHZvaWQgdGhpcy5haVBsYW5Gcm9tU2VsZWN0aW9uKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1yZWJ1aWxkLWdvYWxzJyxcbiAgICAgIG5hbWU6ICdBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkFcdTVERjJcdTg5QzRcdTUyMTJcdTdCMTRcdThCQjBcdTc2ODRcdTc2RUVcdTY4MDcnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHZvaWQgdGhpcy5yZWJ1aWxkQWlHb2FscygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWktZGlhZ25vc2UnLFxuICAgICAgbmFtZTogJ0FJIFx1OEJDQVx1NjVBRFx1RkYxQVx1NTIwNlx1Njc5MFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NUU3Nlx1N0VEOVx1NTFGQVx1NTNFRlx1NUU5NFx1NzUyOFx1NUVGQVx1OEJBRScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLmFpRGlhZ25vc2UoKSxcbiAgICB9KTtcblxuICAgIC8vIFx1N0YxNlx1OEY5MVx1NTY2OFx1NTNGM1x1OTUyRVx1ODNEQ1x1NTM1NVx1RkYxQVx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1NTQwRVx1NTNGM1x1OTUyRVx1NzZGNFx1NjNBNVx1NTFGQVx1NzNCMFx1MzAwQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1MzAwRFxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbignZWRpdG9yLW1lbnUnLCAobWVudSwgZWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCkudHJpbSgpO1xuICAgICAgICBpZiAoIXRleHQpIHJldHVybjsgLy8gXHU2NUUwXHU5MDA5XHU1MzNBXHU2NUY2XHU0RTBEXHU2NjNFXHU3OTNBXHVGRjBDXHU0RkREXHU2MzAxXHU4M0RDXHU1MzU1XHU1RTcyXHU1MUMwXG4gICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT5cbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAuc2V0VGl0bGUoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0NycpXG4gICAgICAgICAgICAuc2V0SWNvbignbGVhZicpXG4gICAgICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgIHZvaWQgdGhpcy5haVBsYW5Gcm9tU2VsZWN0aW9uKHRleHQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9udW5sb2FkKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICB9XG5cbiAgLyoqIEFJIFx1ODlDNFx1NTIxMlx1NEUzQlx1NkQ0MVx1N0EwQlx1RkYxQVx1NTNENlx1NUY1M1x1NTI0RFx1N0IxNFx1OEJCMCBcdTIxOTIgXHU4QzAzXHU1OTI3XHU2QTIxXHU1NzhCIFx1MjE5MiBcdTY4MjFcdTlBOEMgXHUyMTkyIFx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5NyBcdTIxOTIgXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3XHU1RTkzICovXG4gIGFzeW5jIGFpUGxhbkZyb21Ob3RlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHMgPSB0aGlzLnNldHRpbmdzO1xuICAgIGlmICghcy5haUVuYWJsZWQpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1NjcyQVx1NTQyRlx1NzUyOFx1RkYxQVx1OEJGN1x1NTE0OFx1NTcyOFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NEUyRFx1NUYwMFx1NTQyRlx1NUU3Nlx1NTg2Qlx1NTE5OSBBUEkgS2V5Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlIHx8ICEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU3QkM3IE1hcmtkb3duIFx1N0IxNFx1OEJCMCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjb250ZW50ID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoYFx1OEJGQlx1NTNENlx1N0IxNFx1OEJCMFx1NTkzMVx1OEQyNVx1RkYxQSR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRid9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghY29udGVudC50cmltKCkpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1N0IxNFx1OEJCMFx1NTE4NVx1NUJCOVx1NEUzQVx1N0E3QScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYW5uZXJTZXR0aW5nczogUGxhbm5lclNldHRpbmdzID0ge1xuICAgICAgYWlBcGlLZXk6IHMuYWlBcGlLZXksXG4gICAgICBhaUJhc2VVcmw6IHMuYWlCYXNlVXJsLFxuICAgICAgYWlNb2RlbDogcy5haU1vZGVsLFxuICAgICAgYWlEZWNvbXBvc2VEZXB0aDogcy5haURlY29tcG9zZURlcHRoLFxuICAgIH07XG5cbiAgICBuZXcgQWdlbnRpY1BsYW5Nb2RhbCh0aGlzLmFwcCwge1xuICAgICAgY29udGVudCxcbiAgICAgIHNjb3BlOiAnbm90ZScsXG4gICAgICBzZXR0aW5nczogcGxhbm5lclNldHRpbmdzLFxuICAgICAgb25Db25maXJtOiAoZmluYWxHb2FscykgPT4gdm9pZCB0aGlzLndyaXRlQWlHb2FscyhmaWxlLCBjb250ZW50LCBmaW5hbEdvYWxzKSxcbiAgICB9KS5vcGVuKCk7XG4gIH1cblxuICAvKiogXHU5MDA5XHU0RTJEXHU2NTg3XHU2NzJDXHU4RjZDXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHVGRjFBXHU1M0Q2XHU3RjE2XHU4RjkxXHU1NjY4XHU5MDA5XHU1MzNBIFx1MjE5MiBcdThDMDNcdTU5MjdcdTZBMjFcdTU3OEIoXHU2ODA3XHU2Q0U4IHNlbGVjdGlvbikgXHUyMTkyIFx1NjgyMVx1OUE4QyBcdTIxOTIgXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3IFx1MjE5MiBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTMgKi9cbiAgYXN5bmMgYWlQbGFuRnJvbVNlbGVjdGlvbihzZWxlY3Rpb25Bcmc/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzID0gdGhpcy5zZXR0aW5ncztcbiAgICBpZiAoIXMuYWlFbmFibGVkKSB7XG4gICAgICBuZXcgTm90aWNlKCdBSSBcdTg5QzRcdTUyMTJcdTY3MkFcdTU0MkZcdTc1MjhcdUZGMUFcdThCRjdcdTUxNDhcdTU3MjhcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTRFMkRcdTVGMDBcdTU0MkZcdTVFNzZcdTU4NkJcdTUxOTkgQVBJIEtleScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgIGlmICghZmlsZSB8fCAhKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkgfHwgZmlsZS5leHRlbnNpb24gIT09ICdtZCcpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1N0JDNyBNYXJrZG93biBcdTdCMTRcdThCQjAnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTRGMThcdTUxNDhcdTc1MjhcdTUzRjNcdTk1MkVcdTgzRENcdTUzNTVcdTRGMjBcdTUxNjVcdTc2ODRcdTdDQkVcdTc4NkVcdTkwMDlcdTUzM0FcdUZGMUJcdTU0N0RcdTRFRTRcdTk3NjJcdTY3N0ZcdThDMDNcdTc1MjhcdTY1RjZcdTRFMERcdTRGMjBcdUZGMENcdTUyMTlcdTU2REVcdTkwMDBcdTUyMzBcdTZEM0JcdTUyQThcdTdGMTZcdThGOTFcdTU2NjhcdTkwMDlcdTUzM0FcbiAgICBjb25zdCBzZWxlY3Rpb24gPVxuICAgICAgKHNlbGVjdGlvbkFyZyAmJiBzZWxlY3Rpb25BcmcudHJpbSgpKSB8fFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KT8uZWRpdG9yLmdldFNlbGVjdGlvbigpPy50cmltKCkgfHxcbiAgICAgICcnO1xuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdThCRjdcdTUxNDhcdTkwMDlcdTRFMkRcdTRFMDBcdTZCQjVcdTY1ODdcdTY3MkNcdUZGMENcdTUxOERcdTYyNjdcdTg4NENcdTMwMENcdTVDMDZcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTMwMEQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGFubmVyU2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyA9IHtcbiAgICAgIGFpQXBpS2V5OiBzLmFpQXBpS2V5LFxuICAgICAgYWlCYXNlVXJsOiBzLmFpQmFzZVVybCxcbiAgICAgIGFpTW9kZWw6IHMuYWlNb2RlbCxcbiAgICAgIGFpRGVjb21wb3NlRGVwdGg6IHMuYWlEZWNvbXBvc2VEZXB0aCxcbiAgICB9O1xuXG4gICAgbmV3IEFnZW50aWNQbGFuTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIGNvbnRlbnQ6IHNlbGVjdGlvbixcbiAgICAgIHNjb3BlOiAnc2VsZWN0aW9uJyxcbiAgICAgIHNldHRpbmdzOiBwbGFubmVyU2V0dGluZ3MsXG4gICAgICBzdWJ0aXRsZTogJ1x1NEVFNVx1NEUwQlx1NzZFRVx1NjgwN1x1NTdGQVx1NEU4RVx1NEY2MFx1NTcyOFx1N0IxNFx1OEJCMFx1NEUyRFx1OTAwOVx1NEUyRFx1NzY4NFx1NjU4N1x1NjcyQ1x1NjJDNlx1ODlFM1x1RkYwOFx1OTc1RVx1NjU3NFx1N0JDN1x1N0IxNFx1OEJCMFx1RkYwOVx1MzAwMicsXG4gICAgICBvbkNvbmZpcm06IChmaW5hbEdvYWxzKSA9PiB2b2lkIHRoaXMud3JpdGVBaUdvYWxzKGZpbGUsIHNlbGVjdGlvbiwgZmluYWxHb2FscyksXG4gICAgfSkub3BlbigpO1xuICB9XG5cbiAgLyoqIFx1NjI4QVx1NUJBMVx1OTYwNVx1NTQwRVx1NzY4NFx1NzZFRVx1NjgwN1x1OEZGRFx1NTJBMFx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1NUU5M1x1RkYwOFx1OTZGNlx1NkM2MVx1NjdEM1x1RkYxQWV4aXN0aW5nICsgcGFyc2VkXHVGRjA5XHU1RTc2XHU2NkY0XHU2NUIwXHU1RTQyXHU3QjQ5XHU3RDIyXHU1RjE1ICovXG4gIC8qKlxuICAgKiBcdTYyOEFcdTVCQTFcdTk2MDVcdTU0MEVcdTc2ODRcdTc2RUVcdTY4MDdcdThGRkRcdTUyQTBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTNcdUZGMDhcdTk2RjZcdTZDNjFcdTY3RDNcdUZGMUFleGlzdGluZyArIHBhcnNlZFx1RkYwOVx1NUU3Nlx1NjZGNFx1NjVCMFx1NUU0Mlx1N0I0OVx1N0QyMlx1NUYxNVx1MzAwMlxuICAgKiBAcGFyYW0gc2lsZW50IFx1NjI3OVx1OTFDRlx1OTFDRFx1NUVGQVx1NjVGNlx1NjI5MVx1NTIzNlx1OTAxMFx1Njc2MVx1OTAxQVx1NzdFNVx1RkYwQ1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1N0VERlx1NEUwMFx1NkM0N1x1NjAzQlx1RkYwOFx1OUVEOFx1OEJBNCBmYWxzZVx1RkYwOVxuICAgKi9cbiAgYXN5bmMgd3JpdGVBaUdvYWxzKFxuICAgIGZpbGU6IFRGaWxlLFxuICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICBnb2FsczogR29hbEl0ZW1bXSxcbiAgICBzaWxlbnQgPSBmYWxzZVxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTdFREZcdTRFMDBcdTUxOTlcdTUxNjUgd2ViYXBwIFx1NUI5RVx1OTY0NVx1OEJGQlx1NTNENlx1NzY4NFx1OUVEOFx1OEJBNFx1OERFRlx1NUY4NFx1RkYwOGJhbWJvby1yZXZpZXdcdUZGMDlcdUZGMENcdTc4NkVcdTRGREQgQUkgXHU1MTk5XHU1MTY1XHU3Njg0XHU3NkVFXHU2ODA3XHU0RTBFXHU3NTRDXHU5NzYyXHU4QkZCXHU1M0Q2XHU0RTAwXHU4MUY0XHUzMDAyXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgLy8gXHU1RTQyXHU3QjQ5XHVGRjFBXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwICsgXHU3NkY4XHU1NDBDXHU1MTg1XHU1QkI5XHU1REYyXHU4OUM0XHU1MjEyXHU4RkM3XHVGRjBDXHU0RTE0XHU3NkVFXHU2ODA3XHU0RUNEXHU1MTY4XHU5MEU4XHU1QjU4XHU1NzI4IFx1MjE5MiBcdThERjNcdThGQzdcdUZGMDhcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkFcdTZBMjFcdTVGMEZcdTVGM0FcdTUyMzZcdTkxQ0RcdTUxOTlcdUZGMDlcdTMwMDJcbiAgICAvLyBcdTUxNzNcdTk1MkVcdTRGRUVcdTU5MERcdUZGMUFcdTgyRTVcdTc2RUVcdTY4MDdcdTVERjJcdTg4QUJcdTZFMDVcdTdBN0EvXHU0RTIyXHU1OTMxXHVGRjA4cGxhbnMtbWFwIFx1NkI4Qlx1NzU1OVx1NjVFN1x1NTRDOFx1NUUwQ1x1RkYwOVx1RkYwQ1x1NTIxOVx1NUZDNVx1OTg3Qlx1NTE0MVx1OEJCOFx1OTFDRFx1NjVCMFx1NTE5OVx1NTE2NVx1NEVFNVx1NjA2Mlx1NTkwRFx1RkYwQ1xuICAgIC8vIFx1NTQyNlx1NTIxOVx1MjAxQ1x1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1MjAxRFx1NEYxQVx1NkMzOFx1NEU0NVx1OTYzQlx1NTg1RVx1NjA2Mlx1NTkwRFx1RkYwQ1x1ODg2OFx1NzNCMFx1NEUzQVx1MjAxQ1x1NTE5OVx1NTE2NVx1NEU4Nlx1NEY0Nlx1NEUwRFx1NjYzRVx1NzkzQS9cdTRFMjJcdTU5MzFcdTIwMURcdTMwMDJcbiAgICBjb25zdCBpbmRleCA9IGF3YWl0IHN0b3JhZ2UuZ2V0UGxhbnNJbmRleCgpO1xuICAgIGNvbnN0IGtleSA9IGAke2ZpbGUucGF0aH0jJHtoYXNoQ29udGVudChjb250ZW50KX1gO1xuICAgIGNvbnN0IHBsYW5uZWRJZHMgPSBpbmRleFtrZXldO1xuICAgIGlmICghc2lsZW50ICYmIHNob3VsZFNraXBQbGFubmVkKHBsYW5uZWRJZHMsIG5ldyBTZXQoZXhpc3RpbmcubWFwKChnKSA9PiBnLmlkKSkpKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdThCRTVcdTdCMTRcdThCQjBcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdUZGMDhcdTUxODVcdTVCQjlcdTY3MkFcdTUzRDhcdUZGMDlcdUZGMENcdTVERjJcdThERjNcdThGQzdcdTkxQ0RcdTU5MERcdTUxOTlcdTUxNjUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gXHU5MEU4XHU1MjA2L1x1NTE2OFx1OTBFOFx1NzZFRVx1NjgwN1x1NURGMlx1NEUyMlx1NTkzMSBcdTIxOTIgXHU3RUU3XHU3RUVEXHU1NDExXHU0RTBCXHU5MUNEXHU2NUIwXHU1MTk5XHU1MTY1XHU0RUU1XHU2MDYyXHU1OTBEXG5cbiAgICAvLyBcdTY1RTdcdTcyNDhcdTk2OEZcdTY3M0EgaWQgXHU1MTdDXHU1QkI5XHVGRjFBXHU1NDBDIHNvdXJjZVJlZit0aXRsZSBcdTU5MERcdTc1MjhcdTY1RTcgaWRcdUZGMENcdTUzOUZcdTU3MzBcdTY2RjRcdTY1QjBcdTRFMERcdTY1QjBcdTU4OUVcdTkxQ0RcdTU5MERcbiAgICBjb25zdCBieVJlZlRpdGxlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgZXhpc3RpbmcpIHtcbiAgICAgIGlmIChnLnNvdXJjZVJlZiAmJiBnLnRpdGxlKSBieVJlZlRpdGxlLnNldChgJHtnLnNvdXJjZVJlZn0jJHtnLnRpdGxlfWAsIGcuaWQpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXA8c3RyaW5nLCBHb2FsSXRlbT4oKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgZXhpc3RpbmcpIGlmIChnLmlkKSBtZXJnZWQuc2V0KGcuaWQsIGcpO1xuXG4gICAgLy8gXHU2NzAwXHU3RUM4XHU5NjMyXHU3RUJGXHVGRjFBQUkgXHU1MTk5XHU1MTY1XHU3Njg0XHU3NkVFXHU2ODA3XHU3OTgxXHU2QjYyXHU1MzA1XHU1NDJCIGljb24gXHU1QjU3XHU2QkI1XHVGRjA4XHU1MzczXHU0RjdGXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3XHU4QkVGXHU1ODZCXHU1MTY1XHU0RTVGXHU1MjY1XHU3OUJCXHVGRjA5XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNvbnN0IHdpdGhSZWYgPSBnb2Fscy5tYXAoKGcpID0+IHtcbiAgICAgIGNvbnN0IHsgaWNvbjogX2ljb24sIC4uLnJlc3QgfSA9IGcgYXMgR29hbEl0ZW0gJiB7IGljb24/OiB1bmtub3duIH07XG4gICAgICB2b2lkIF9pY29uO1xuICAgICAgY29uc3QgcmVmOiBHb2FsSXRlbSA9IHsgLi4ucmVzdCwgc291cmNlUmVmOiBmaWxlLnBhdGggfTtcbiAgICAgIC8vIFx1Nzg2RVx1NUI5QVx1NjAyNyBJRFx1RkYxQVx1NTQwQ1x1N0IxNFx1OEJCMCtcdTU0MENcdTY4MDdcdTk4OThcdTYwNTJcdTVGOTdcdTU0MENcdTRFMDAgaWQgXHUyMTkyIFx1OTFDRFx1NjVCMFx1ODlDNFx1NTIxMlx1NTM5Rlx1NTczMFx1NjZGNFx1NjVCMFx1ODAwQ1x1OTc1RVx1OEZGRFx1NTJBMFx1OTFDRFx1NTkwRFx1RkYxQlxuICAgICAgLy8gXHU4MkU1XHU4QkU1XHU2ODA3XHU5ODk4XHU3Njg0XHU2NUU3XHU5NjhGXHU2NzNBIGlkIFx1NEVDRFx1NUI1OFx1NTcyOFx1NEU4RVx1NUU5M1x1RkYwQ1x1NTIxOVx1NTkwRFx1NzUyOFx1NUI4M1x1RkYwOFx1NTE3Q1x1NUJCOVx1NTM4Nlx1NTNGMlx1NzZFRVx1NjgwN1x1RkYwOVx1MzAwMlxuICAgICAgY29uc3QgbGVnYWN5SWQgPSBieVJlZlRpdGxlLmdldChgJHtmaWxlLnBhdGh9IyR7Zy50aXRsZX1gKTtcbiAgICAgIHJlZi5pZCA9IGxlZ2FjeUlkID8/IGRlcml2ZVN0YWJsZUdvYWxJZChgJHtmaWxlLnBhdGh9fCR7Zy50aXRsZX1gKTtcbiAgICAgIHJldHVybiByZWY7XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCBnIG9mIHdpdGhSZWYpIGlmIChnLmlkKSBtZXJnZWQuc2V0KGcuaWQsIGcpO1xuICAgIGNvbnN0IGZpbmFsR29hbHMgPSBbLi4ubWVyZ2VkLnZhbHVlcygpXTtcbiAgICBhd2FpdCBzdG9yYWdlLnB1dEdvYWxzKGZpbmFsR29hbHMpO1xuXG4gICAgLy8gXHU1OTMxXHU2NTQ4XHU3RDIyXHU1RjE1XHU2RTA1XHU3NDA2XHVGRjA4Rlx1RkYwOVx1RkYxQVx1NTI1NFx1OTY2NFx1MjAxQ1x1NTE3Nlx1NTE2OFx1OTBFOCBpZCBcdTU3NDdcdTVERjJcdTRFMERcdTU3MjhcdTY3MDBcdTdFQzhcdTc2RUVcdTY4MDdcdTVFOTNcdTIwMURcdTc2ODRcdTk2NDhcdTY1RTcgZW50cnlcdUZGMENcdTkwN0ZcdTUxNERcdTdEMjJcdTVGMTVcdTY1RTBcdTk2NTBcdTU4OUVcdTk1N0ZcdTMwMDJcbiAgICBjb25zdCBmaW5hbElkcyA9IG5ldyBTZXQoZmluYWxHb2Fscy5tYXAoKGcpID0+IGcuaWQpKTtcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoaW5kZXgpKSB7XG4gICAgICBjb25zdCBpZHMgPSBpbmRleFtrXTtcbiAgICAgIGlmIChpZHMgJiYgaWRzLmxlbmd0aCA+IDAgJiYgaWRzLmV2ZXJ5KChpZCkgPT4gIWZpbmFsSWRzLmhhcyhpZCkpKSB7XG4gICAgICAgIGRlbGV0ZSBpbmRleFtrXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5kZXhba2V5XSA9IHdpdGhSZWYubWFwKChnKSA9PiBnLmlkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnB1dFBsYW5zSW5kZXgoaW5kZXgpO1xuXG4gICAgLy8gXHU1QzQwXHU5MEU4XHU1MjM3XHU2NUIwXHU1RTM4XHU5QTdCXHU4OUM2XHU1NkZFXHVGRjA4aG9zdFx1MjE5MndlYmFwcCBnb2FsczpjaGFuZ2VkXHVGRjA5XG4gICAgdGhpcy53ZWJhcHAubm90aWZ5R29hbHNDaGFuZ2VkKCk7XG5cbiAgICBpZiAoIXNpbGVudCkge1xuICAgICAgbmV3IE5vdGljZShgXHU1REYyXHU1MTk5XHU1MTY1ICR7d2l0aFJlZi5sZW5ndGh9IFx1NEUyQVx1NzZFRVx1NjgwN1x1NTIzMFx1MzAwQ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1MzAwRGApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkEgQUkgXHU3NkVFXHU2ODA3XHVGRjFBXHU2MjZCXHU2M0NGIHBsYW5zLW1hcCBcdTRFMkRcdTMwMENcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdTMwMERcdTc2ODRcdTdCMTRcdThCQjBcdUZGMENcdTkwMTBcdTdCQzdcdTkxQ0RcdTY1QjBcdTg5QzRcdTUyMTJcdUZGMENcbiAgICogXHU0RUU1XHU2MjdFXHU1NkRFXHU5MEEzXHU0RTlCXHU3NkVFXHU2ODA3XHU1REYyXHU0RTIyXHU1OTMxL1x1ODhBQlx1NkUwNVx1NzY4NFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1MzAwMlx1N0IxNFx1OEJCMFx1NURGMlx1NTIyMFx1OTY2NFx1NTIxOVx1OERGM1x1OEZDN1x1RkYwOFx1NTE3NiBzdGFsZSBlbnRyeSBcdTc1MzFcdTdEMjJcdTVGMTVcdTZFMDVcdTc0MDZcdTU5MDRcdTc0MDZcdUZGMDlcdTMwMDJcbiAgICovXG4gIGFzeW5jIHJlYnVpbGRBaUdvYWxzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBjb25zdCBpbmRleCA9IGF3YWl0IHN0b3JhZ2UuZ2V0UGxhbnNJbmRleCgpO1xuICAgIGNvbnN0IHBhdGhzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGluZGV4KSkge1xuICAgICAgY29uc3QgaGFzaElkeCA9IGsubGFzdEluZGV4T2YoJyMnKTtcbiAgICAgIGlmIChoYXNoSWR4ID4gMCkgcGF0aHMuYWRkKGsuc2xpY2UoMCwgaGFzaElkeCkpO1xuICAgIH1cbiAgICBpZiAocGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgbmV3IE5vdGljZSgnXHU2NzJBXHU1M0QxXHU3M0IwXHU0RUZCXHU0RjU1XHU1REYyXHU4OUM0XHU1MjEyXHU3Njg0XHU3QjE0XHU4QkIwJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgaWYgKCFzLmFpRW5hYmxlZCkge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHU2NzJBXHU1NDJGXHU3NTI4XHVGRjFBXHU4QkY3XHU1MTQ4XHU1NzI4XHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU0RTJEXHU1RjAwXHU1NDJGXHU1RTc2XHU1ODZCXHU1MTk5IEFQSSBLZXknKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcblxuICAgIGNvbnN0IGxvYWRpbmcgPSBuZXcgTm90aWNlKGBcdTZCNjNcdTU3MjhcdTkxQ0RcdTVFRkEgJHtwYXRocy5zaXplfSBcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODQgQUkgXHU3NkVFXHU2ODA3XHUyMDI2YCwgMCk7XG4gICAgbGV0IG9rID0gMDtcbiAgICBsZXQgZmFpbGVkID0gMDtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGF0aHMpIHtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocCk7XG4gICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSBjb250aW51ZTsgLy8gXHU3QjE0XHU4QkIwXHU1REYyXHU1MjIwXHU5NjY0IFx1MjE5MiBcdThERjNcdThGQzdcbiAgICAgIGxldCBjb250ZW50OiBzdHJpbmc7XG4gICAgICB0cnkge1xuICAgICAgICBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICghY29udGVudC50cmltKCkpIGNvbnRpbnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgcGxhbkZyb21Ob3RlKGNvbnRlbnQsIHBsYW5uZXJTZXR0aW5ncyk7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHZhbGlkYXRlR29hbHMocmF3KTtcbiAgICAgICAgaWYgKHBhcnNlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy53cml0ZUFpR29hbHMoZmlsZSwgY29udGVudCwgcGFyc2VkLCB0cnVlKTtcbiAgICAgICAgICBvaysrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgZmFpbGVkKys7XG4gICAgICB9XG4gICAgfVxuICAgIGxvYWRpbmcuaGlkZSgpO1xuICAgIG5ldyBOb3RpY2UoYFx1NURGMlx1OTFDRFx1NUVGQSAke29rfSBcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODQgQUkgXHU3NkVFXHU2ODA3JHtmYWlsZWQgPiAwID8gYFx1RkYwQyR7ZmFpbGVkfSBcdTdCQzdcdTU5MzFcdThEMjVgIDogJyd9YCk7XG4gIH1cblxuICAvKipcbiAgICogQUkgXHU4QkNBXHU2NUFEIFx1MjE5MiBcdTg4NENcdTUyQThcdTk1RURcdTczQUZcdUZGMUFcdThCRkJcdTc2RUVcdTY4MDcgKyBcdThGRDEgMTQgXHU1OTI5XHU2NTcwXHU2MzZFIFx1MjE5MiBBSSBcdThCQ0FcdTY1QURcdUZGMDhHb2FsRGlhZ25vc2VyXHVGRjA5XHUyMTkyXG4gICAqIFx1NTNFQVx1OEJGQlx1NjJBNVx1NTQ0QVx1RkYwOERpYWdub3Npc01vZGFsXHVGRjA5XHUyMTkyIFx1NzBCOVx1MzAwQ1x1NUU5NFx1NzUyOFx1MzAwRFx1MjE5MiBcdTYyNTNcdTVGMDAgQWdlbnRpY1BsYW5Nb2RhbCBcdTk4ODRcdTU4NkJcdTVFRkFcdThCQUVcdTYzMDdcdTRFRTQgXHUyMTkyXG4gICAqIFx1Nzg2RVx1OEJBNFx1NTQwRVx1NTE5OVx1NTZERVx1NzZFRVx1NjgwN1x1NUU5M1x1MzAwMlx1N0YxNlx1NjM5Mlx1OTAzQlx1OEY5MVx1NTcyOCBydW5EaWFnbm9zaXNcdUZGMDhcdTdFQUZcdTUxRkRcdTY1NzBcdUZGMDlcdUZGMENcdTZCNjRcdTU5MDRcdTUzRUFcdTZDRThcdTUxNjVcdTc3MUZcdTVCOUVcdTRGOURcdThENTZcdTMwMDJcbiAgICovXG4gIGFzeW5jIGFpRGlhZ25vc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgYXdhaXQgcnVuRGlhZ25vc2lzKHtcbiAgICAgIGFpRW5hYmxlZDogcy5haUVuYWJsZWQsXG4gICAgICBwbGFubmVyU2V0dGluZ3MsXG4gICAgICBzdG9yYWdlLFxuICAgICAgZGlhZ25vc2U6IGRpYWdub3NlIGFzIHVua25vd24gYXMgdHlwZW9mIGRpYWdub3NlLFxuICAgICAgb3BlbkRpYWdub3NpczogKG8pID0+IG5ldyBEaWFnbm9zaXNNb2RhbCh0aGlzLmFwcCwgbykub3BlbigpLFxuICAgICAgb3BlbkFnZW50aWM6IChvKSA9PiBuZXcgQWdlbnRpY1BsYW5Nb2RhbCh0aGlzLmFwcCwgbykub3BlbigpLFxuICAgICAgd3JpdGVHb2FsczogKGcpID0+IHZvaWQgdGhpcy53cml0ZURpYWdub3NlZEdvYWxzKGcpLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICAgIHJlY2VudERheXM6IDE0LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1OEJDQVx1NjVBRFx1NUVGQVx1OEJBRVx1NUU5NFx1NzUyOFx1NTQwRVx1NzY4NFx1ODQzRFx1NUU5M1x1RkYxQVx1NTE5OSBnb2Fscy5qc29uICsgXHU1MjM3XHU2NUIwXHU1RTM4XHU5QTdCXHU4OUM2XHU1NkZFXHVGRjA4XHU0RTBEXHU3OEIwXHU1RTQyXHU3QjQ5XHU3RDIyXHU1RjE1LyBzb3VyY2VSZWZcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyB3cml0ZURpYWdub3NlZEdvYWxzKGdvYWxzOiBHb2FsSXRlbVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGF3YWl0IHN0b3JhZ2UucHV0R29hbHMoZ29hbHMpO1xuICAgIHRoaXMud2ViYXBwLm5vdGlmeUdvYWxzQ2hhbmdlZCgpO1xuICAgIG5ldyBOb3RpY2UoYFx1NURGMlx1NTE5OVx1NTE2NSAke2dvYWxzLmxlbmd0aH0gXHU0RTJBXHU3NkVFXHU2ODA3XHVGRjA4XHU1RTk0XHU3NTI4IEFJIFx1OEJDQVx1NjVBRFx1NUVGQVx1OEJBRVx1RkYwOWApO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NjIxOFx1NzU2NVx1NTkwRFx1NzZEOFx1OTc2Mlx1Njc3Rlx1MzAwQ1x1NzUyOCBBSSBcdTY1MzlcdThGREJcdTMwMERcdTUxNjVcdTUzRTNcdUZGMUF3ZWJhcHAgXHU1MDY1XHU1RUI3XHU1MjA2XHU4QkU2XHU2MEM1XHU3MEI5XHU2MzA5XHU5NEFFIFx1MjE5MiBwb3N0TWVzc2FnZShhcHA6YWlJbXByb3ZlR29hbClcbiAgICogXHUyMTkyIEFwcEFQSS5vbkFpSW1wcm92ZUdvYWwgXHUyMTkyIFx1NkI2NFx1NTkwNFx1MzAwMlx1NTkwRFx1NzUyOFx1OEJDQVx1NjVBRFx1OTVFRFx1NzNBRlx1NzY4NCBBZ2VudGljUGxhbk1vZGFsIFx1OTg4NFx1NTg2QiArIFx1ODQzRFx1NUU5M1x1OTRGRVx1OERFRlx1MzAwMlxuICAgKi9cbiAgYXN5bmMgcmVxdWVzdEFpSW1wcm92ZShwOiB7IGdvYWxJZDogc3RyaW5nOyB0aXRsZT86IHN0cmluZzsgaGludHM/OiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHMgPSB0aGlzLnNldHRpbmdzO1xuICAgIGlmICghcy5haUVuYWJsZWQpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1x1NTE0OFx1NTIzMFx1OEJCRVx1N0Y2RVx1OTFDQ1x1NUYwMFx1NTQyRiBBSSBcdTg5QzRcdTUyMTJcdUZGMENcdTYyNERcdTgwRkRcdTc1MjggQUkgXHU2NTM5XHU4RkRCXHU3NkVFXHU2ODA3Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBjb25zdCBnb2FscyA9IGF3YWl0IHN0b3JhZ2UuZ2V0R29hbHMoKTtcbiAgICBpZiAoZ29hbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdTRGNjBcdThGRDhcdTZDQTFcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTUxNDhcdThERDFcdTRFMDBcdTZCMjEgQUkgXHU4OUM0XHU1MjEyJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGdvYWwgPSBnb2Fscy5maW5kKChnKSA9PiBnLmlkID09PSBwLmdvYWxJZCkgPz8gZ29hbHMuZmluZCgoZykgPT4gZy50aXRsZSA9PT0gcC50aXRsZSk7XG4gICAgaWYgKCFnb2FsKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdTY3MkFcdTU3MjhcdTc2RUVcdTY4MDdcdTVFOTNcdTRFMkRcdTYyN0VcdTUyMzBcdThCRTVcdTc2RUVcdTY4MDdcdUZGMENcdTUzRUZcdTgwRkRcdTVCODNcdTVERjJcdTg4QUJcdTUyMjBcdTk2NjQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGFubmVyU2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyA9IHtcbiAgICAgIGFpQXBpS2V5OiBzLmFpQXBpS2V5LFxuICAgICAgYWlCYXNlVXJsOiBzLmFpQmFzZVVybCxcbiAgICAgIGFpTW9kZWw6IHMuYWlNb2RlbCxcbiAgICAgIGFpRGVjb21wb3NlRGVwdGg6IHMuYWlEZWNvbXBvc2VEZXB0aCxcbiAgICB9O1xuICAgIGNvbnN0IGhpbnRzTGluZSA9IHAuaGludHNcbiAgICAgID8gcC5oaW50c1xuICAgICAgOiAnXHVGRjA4XHU2NUUwXHU1MTc3XHU0RjUzXHU2M0QwXHU3OTNBXHVGRjBDXHU4QkY3XHU3RUQzXHU1NDA4XHU4QkU1XHU3NkVFXHU2ODA3XHU1RjUzXHU1MjREXHU1QjUwXHU5ODc5XHU0RTBFXHU4RkRCXHU1RUE2XHU4MUVBXHU4ODRDXHU4QkNBXHU2NUFEXHU1RTc2XHU2NTM5XHU4RkRCXHVGRjA5JztcbiAgICBjb25zdCBpbnN0cnVjdGlvbiA9XG4gICAgICBgXHU4QkY3XHU2ODM5XHU2MzZFXHU0RUU1XHU0RTBCXHU1MDY1XHU1RUI3XHU1MjA2XHU4QkNBXHU2NUFEXHVGRjBDXHU0RjE4XHU1MzE2XHU3NkVFXHU2ODA3XHUzMDBDJHtnb2FsLnRpdGxlfVx1MzAwRFx1RkYxQVxcbiR7aGludHNMaW5lfVxcbmAgK1xuICAgICAgJ1x1ODk4MVx1NkM0Mlx1RkYxQVx1NEZERFx1NjMwMVx1OTFDRlx1NTMxNlx1OTRDMVx1NUY4Qlx1RkYwOFx1N0VBRlx1NjU3MFx1NUI1NyBkYWlseU1pblx1MzAwMVx1NjVFNVx1OTg5N1x1N0M5Mlx1NUVBNlx1MzAwMVx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1x1RkYwOVx1RkYwQ1x1NTNFQVx1NTA1QVx1NUZDNVx1ODk4MVx1NzY4NFx1NTg5RVx1NTIyMFx1NjUzOVx1MzAwMic7XG5cbiAgICBuZXcgQWdlbnRpY1BsYW5Nb2RhbCh0aGlzLmFwcCwge1xuICAgICAgY29udGVudDogJycsXG4gICAgICBzY29wZTogJ25vdGUnLFxuICAgICAgZ29hbHMsXG4gICAgICBpbml0aWFsSW5zdHJ1Y3Rpb246IGluc3RydWN0aW9uLFxuICAgICAgc2V0dGluZ3M6IHBsYW5uZXJTZXR0aW5ncyxcbiAgICAgIHN1YnRpdGxlOiBgQUkgXHU2NTM5XHU4RkRCIFx1MDBCNyAke2dvYWwudGl0bGV9YCxcbiAgICAgIG9uQ29uZmlybTogKGcpID0+IHZvaWQgdGhpcy53cml0ZURpYWdub3NlZEdvYWxzKGcpLFxuICAgIH0pLm9wZW4oKTtcbiAgfVxuXG4gIC8qKiBcdTZGQzBcdTZEM0JcdTYyMTZcdTUyMUJcdTVFRkFcdTU5MERcdTc2RDhcdTg5QzZcdTU2RkUgKi9cbiAgYXN5bmMgYWN0aXZhdGVWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblxuICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgbGVhdmVzID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfREFJTFlfUkVWSUVXKTtcblxuICAgIGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gXHU1REYyXHU2NzA5XHU4OUM2XHU1NkZFXHVGRjBDXHU3NkY0XHU2M0E1XHU4MDVBXHU3MTI2XG4gICAgICBsZWFmID0gbGVhdmVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTY1QjBcdTg5QzZcdTU2RkVcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XG4gICAgICAgIHR5cGU6IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChsZWFmKSB7XG4gICAgICBhd2FpdCB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKSBhcyBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgfVxuXG4gIC8qKiBcdTRGRERcdTVCNThcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgRXZlbnRSZWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEJhbWJvb1Jldmlld1NldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuaW1wb3J0IHsgQXBwSG9zdCB9IGZyb20gJy4uL2hvc3QvQXBwSG9zdCc7XG5pbXBvcnQgeyBBcHBBUEkgfSBmcm9tICcuLi9ob3N0L0FwcEFQSSc7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXID0gJ2JhbWJvby1pbW1vcnRhbHMnO1xuXG4vKipcbiAqIERhaWx5UmV2aWV3VmlldyAtIFx1NEUzQlx1ODlDNlx1NTZGRVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU1MjFCXHU1RUZBIGlmcmFtZVx1RkYwOGJsb2IgVVJMXHVGRjA5XHU2MjdGXHU4RjdEIHdlYmFwcFxuICogMi4gXHU3QkExXHU3NDA2IEFwcEhvc3QgLyBBcHBBUEkgXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKiAzLiBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU1RTc2XHU1NDBDXHU2QjY1XG4gKi9cbmV4cG9ydCBjbGFzcyBEYWlseVJldmlld1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgcGx1Z2luRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgcGx1Z2luOiB1bmtub3duO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG5cbiAgcHJpdmF0ZSBhcHBIb3N0OiBBcHBIb3N0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgYXBwQVBJOiBBcHBBUEkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3NzQ2hhbmdlUmVmOiBFdmVudFJlZiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGxlYWY6IFdvcmtzcGFjZUxlYWYsXG4gICAgcGx1Z2luRGlyOiBzdHJpbmcsXG4gICAgX3BsdWdpbjogdW5rbm93bixcbiAgICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+XG4gICkge1xuICAgIHN1cGVyKGxlYWYpO1xuICAgIHRoaXMucGx1Z2luRGlyID0gcGx1Z2luRGlyO1xuICAgIHRoaXMucGx1Z2luID0gX3BsdWdpbjtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgdGhpcy5zYXZlU2V0dGluZ3MgPSBzYXZlU2V0dGluZ3M7XG4gIH1cblxuICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXO1xuICB9XG5cbiAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCc7XG4gIH1cblxuICBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdsZWFmJztcbiAgfVxuXG4gIGFzeW5jIG9uT3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXSBhcyBIVE1MRWxlbWVudDtcbiAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICBjb250YWluZXIuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctY29udGFpbmVyJyk7XG5cbiAgICBpZiAoIXRoaXMucGx1Z2luRGlyKSB7XG4gICAgICBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgICAgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMDogXHU2NUUwXHU2Q0Q1XHU1QjlBXHU0RjREXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1JyxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUyMURcdTU5Q0JcdTUzMTYgQXBwQVBJXHVGRjA4XHU5MDFBXHU0RkUxXHU1QzQyXHVGRjA5XG4gICAgdGhpcy5hcHBBUEkgPSBuZXcgQXBwQVBJKFxuICAgICAgdGhpcy5hcHAsXG4gICAgICB0aGlzLnNldHRpbmdzLFxuICAgICAgdGhpcy5zYXZlU2V0dGluZ3MsXG4gICAgICB0aGlzLnNldHRpbmdzLm5vaXNlUGF0aCB8fCAnJyxcbiAgICAgIHRoaXMuYXBwLnZhdWx0LmNvbmZpZ0RpclxuICAgICk7XG4gICAgYXdhaXQgdGhpcy5hcHBBUEkuZW5zdXJlU3RydWN0dXJlKCk7XG5cbiAgICAvLyBcdTYyMThcdTc1NjVcdTU5MERcdTc2RDhcdTk3NjJcdTY3N0ZcdTMwMENcdTc1MjggQUkgXHU2NTM5XHU4RkRCXHUzMDBEXHU1MTY1XHU1M0UzXHVGRjFBd2ViYXBwIFx1NTA2NVx1NUVCN1x1NTIwNlx1OEJFNlx1NjBDNSBcdTIxOTIgXHU2M0QyXHU0RUY2IEFnZW50aWMgXHU3RjE2XHU4RjkxXHU5NEZFXHU4REVGXG4gICAgdGhpcy5hcHBBUEkub25BaUltcHJvdmVHb2FsID0gKHBheWxvYWQpID0+IHtcbiAgICAgIGNvbnN0IHBsdWdpbiA9IHRoaXMucGx1Z2luIGFzXG4gICAgICAgIHwgeyByZXF1ZXN0QWlJbXByb3ZlPzogKHA6IHR5cGVvZiBwYXlsb2FkKSA9PiB2b2lkIH1cbiAgICAgICAgfCB1bmRlZmluZWQ7XG4gICAgICBwbHVnaW4/LnJlcXVlc3RBaUltcHJvdmU/LihwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XG4gICAgY29uc3QgY3VzdG9tVGhlbWVzID0gYXdhaXQgdGhpcy5zY2FuQ3VzdG9tVGhlbWVzKCk7XG4gICAgdGhpcy5hcHBBUEkuc2V0Q3VzdG9tVGhlbWVzKGN1c3RvbVRoZW1lcyk7XG5cbiAgICAvLyBcdTUyMUJcdTVFRkEgQXBwSG9zdCBcdTVFNzZcdTY3ODRcdTVFRkEgYmxvYiBVUkxcbiAgICBjb25zdCB2ZXJzaW9uID0gKHRoaXMucGx1Z2luIGFzIHsgbWFuaWZlc3Q/OiB7IHZlcnNpb24/OiBzdHJpbmcgfSB9IHwgdW5kZWZpbmVkKT8ubWFuaWZlc3Q/LnZlcnNpb24gPz8gJyc7XG4gICAgdGhpcy5hcHBIb3N0ID0gbmV3IEFwcEhvc3QodGhpcy5hcHAsIHRoaXMucGx1Z2luRGlyLCB2ZXJzaW9uKTtcblxuICAgIGNvbnN0IGxvYWRpbmdFbCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1NTJBMFx1OEY3RFx1NEUyRFx1MjAyNicsXG4gICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWxvYWRpbmcnLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuYXBwQVBJLnN0YXJ0TGlzdGVuaW5nKCk7XG4gICAgICBjb25zdCBibG9iVXJsID0gYXdhaXQgdGhpcy5hcHBIb3N0LmJ1aWxkQmxvYlVybCgpO1xuXG4gICAgICB0aGlzLmlmcmFtZSA9IGNvbnRhaW5lci5jcmVhdGVFbCgnaWZyYW1lJywge1xuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWZyYW1lJyxcbiAgICAgICAgYXR0cjoge1xuICAgICAgICAgIHNyYzogYmxvYlVybCxcbiAgICAgICAgICBhbGxvdzogJ2NhbWVyYTsgbWljcm9waG9uZTsgY2xpcGJvYXJkLXJlYWQ7IGNsaXBib2FyZC13cml0ZScsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgbG9hZGluZ0VsLnJlbW92ZSgpO1xuICAgICAgdGhpcy5hcHBBUEkuYmluZElmcmFtZSh0aGlzLmlmcmFtZSk7XG5cbiAgICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gdGhpcy5hcHAud29ya3NwYWNlLm9uKCdjc3MtY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmFwcEFQST8ub25UaGVtZUNoYW5nZWQodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvYWRpbmdFbC5yZW1vdmUoKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFx1NTJBMFx1OEY3RCB3ZWJhcHAgXHU1OTMxXHU4RDI1OicsIGUpO1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6IGBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjU6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRid9YCxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzQlx1OTg5OFx1NzZEMVx1NTQyQ1xuICAgIGlmICh0aGlzLmNzc0NoYW5nZVJlZikge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9mZnJlZih0aGlzLmNzc0NoYW5nZVJlZik7XG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU5MDFBXHU0RkUxXHU1QzQyXG4gICAgdGhpcy5hcHBBUEk/LmRldGFjaCgpO1xuICAgIHRoaXMuYXBwQVBJID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNiBibG9iIFVSTFxuICAgIHRoaXMuYXBwSG9zdD8uZGVzdHJveSgpO1xuICAgIHRoaXMuYXBwSG9zdCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYzQTVcdTY1MzZcdTY3NjVcdTgxRUFcdTYzRDJcdTRFRjZcdTc2ODRcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0ICovXG4gIHNlbmRDb21tYW5kKHR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgeyB0eXBlLCBpZDogJ2NtZF8nICsgRGF0ZS5ub3coKSB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTJEXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICovXG4gIHByaXZhdGUgYXN5bmMgc2NhbkN1c3RvbVRoZW1lcygpOiBQcm9taXNlPEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCB0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aGVtZURpck5hbWUgPSB0aGlzLnNldHRpbmdzLnRoZW1lUGF0aCB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgIGxldCB0aGVtZURpckZpbGVzOiBzdHJpbmdbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW1lRGlyRmlsZXMgPSAoYXdhaXQgYWRhcHRlci5saXN0KHRoZW1lRGlyTmFtZSkpLmZpbGVzO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiB0aGVtZXM7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhlbWVEaXJGaWxlcykge1xuICAgICAgICBpZiAoIWVudHJ5LmVuZHNXaXRoKCcuanMnKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYCR7dGhlbWVEaXJOYW1lfS8ke2VudHJ5fWA7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29kZTogc3RyaW5nID0gYXdhaXQgYWRhcHRlci5yZWFkKGZpbGVQYXRoKTtcbiAgICAgICAgICBpZiAoIWNvZGUuaW5jbHVkZXMoJ19fYmFtYm9vX3RoZW1lXycpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTdGM0FcdTVDMTEgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDN2ApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoZW1lcy5wdXNoKHsgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLCBjb2RlIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQmFtYm9vUmV2aWV3XSBcdThCRkJcdTUzRDZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU1OTMxXHU4RDI1OmAsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoZW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYFtCYW1ib29SZXZpZXddIFx1NTNEMVx1NzNCMCAke3RoZW1lcy5sZW5ndGh9IFx1NEUyQVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5ODpgLCB0aGVtZXMubWFwKHQgPT4gdC5uYW1lKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdbQmFtYm9vUmV2aWV3XSBcdTYyNkJcdTYzQ0ZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhlbWVzO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBEYXRhQWRhcHRlciwgbm9ybWFsaXplUGF0aCwgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IHVuemlwU3luYyB9IGZyb20gJ2ZmbGF0ZSc7XG5cbi8qKlxuICogQXBwSG9zdCBcdTIwMTQgd2ViYXBwIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NEUwRVx1NkNFOFx1NTE2NVx1NEUyRFx1NUZDM1xuICpcbiAqIFx1NTJBMFx1OEY3RFx1N0I1Nlx1NzU2NVx1RkYwOFx1OEY3Qlx1OTFDRlx1MzAwMVx1OTZGNlx1NTE4NVx1NUQ0Q1x1RkYwOVx1RkYxQVxuICogICAxLiBcdThCRkJcdTUzRDZcdTY3ODRcdTVFRkFcdTY3MUZcdTc1MUZcdTYyMTBcdTc2ODRcdTgxRUFcdTUzMDVcdTU0MkIgd2ViYXBwL2FwcC5odG1sXHVGRjA4Q1NTIFx1NURGMlx1NTE4NVx1ODA1NFx1MzAwMWJ1bmRsZSBcdTVERjJcdTUxODVcdTgwNTRcdTRFM0FcdTk3NTlcdTYwMDFcbiAqICAgICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+IFx1NjgwN1x1N0I3RVx1RkYwQ1x1NjVFMFx1NEVGQlx1NEY1NVx1NTkxNlx1OTBFOFx1ODExQVx1NjcyQ1x1MzAwMVx1NjVFMFx1NTM2MFx1NEY0RFx1N0IyNlx1RkYwOVx1MzAwMlxuICogICAyLiBcdTVDMDZcdTY1NzRcdTk4NzUgSFRNTCBcdTRFRTUgYmxvYiBVUkwgXHU1RjYyXHU1RjBGXHU0RUE0XHU3RUQ5IGlmcmFtZSBcdTUyQTBcdThGN0RcdTMwMDJcbiAqXG4gKiBcdTc1MzFcdTRFOEVcdTYyNDBcdTY3MDkgPHNjcmlwdD4gXHU1NzQ3XHU1NzI4XHU2Nzg0XHU1RUZBXHU2NzFGXHVGRjA4YnVuZGxlLXdlYmFwcC5tanNcdUZGMDlcdTk3NTlcdTYwMDFcdTUxOTlcdTUxNjUgYXBwLmh0bWxcdUZGMENcdThGRDBcdTg4NENcdTY1RjZcbiAqIG1haW4uanMgXHU0RTBEXHU1MjFCXHU1RUZBXHUzMDAxXHU0RTBEXHU2MkZDXHU2M0E1XHU0RUZCXHU0RjU1IHNjcmlwdCBcdTUxNDNcdTdEMjBcdUZGMENcdTg5QzRcdTkwN0ZcdTVCODlcdTUxNjhcdTYyNkJcdTYzQ0ZcdTMwMENcdTUyQThcdTYwMDFcdTZDRThcdTUxNjVcdTgxMUFcdTY3MkNcdTMwMERcdThCRUZcdTYyQTVcdTMwMDJcbiAqXG4gKiB3ZWJhcHAgXHU3NTMxXHU1M0QxXHU1RTAzXHU2RDQxXHU3QTBCXHU2MjUzXHU1MzA1XHU0RTNBIHdlYmFwcC56aXAgXHU5NjhGXHU3MjQ4XHU2NzJDXHU1MjA2XHU1M0QxXHVGRjA4XHU4OUMxIC5naXRodWIvd29ya2Zsb3dzL3JlbGVhc2UueW1sXHVGRjA5XHVGRjBDXG4gKiBcdTY3MkNcdTU3MzBcdTVGMDBcdTUzRDEvXHU1MTg1XHU2RDRCXHU5MDFBXHU4RkM3IHN5bmMuc2ggXHU1NDBDXHU2QjY1XHU2NTc0XHU0RTJBIHdlYmFwcC8gXHU3NkVFXHU1RjU1XHVGRjA4XHU1NDJCIGFwcC5odG1sXHVGRjA5XHVGRjBDXHU4RkQwXHU4ODRDXHU2NUY2XHU3NkY0XHU2M0E1XHU4QkZCXHU1M0Q2XHVGRjBDXG4gKiBcdTY1RTBcdTk3MDBcdTUxODVcdTVENENcdTMwMDFcdTY1RTBcdTU5MTZcdTkwRThcdTgwNTRcdTdGNTFcdUZGMENtYWluLmpzIFx1NEZERFx1NjMwMVx1OEY3Qlx1OTFDRlx1MzAwMlxuICpcbiAqIFx1ODFFQVx1NjEwOFx1RkYwOFx1NzI0OFx1NjcyQ1x1NUI4OFx1NTM2Qlx1RkYwOVx1RkYxQVx1OEZEMFx1ODg0Q1x1NjVGNlx1NkJENFx1NUJGOSB3ZWJhcHAvLndlYmFwcC12ZXJzaW9uIFx1NEUwRVx1NUY1M1x1NTI0RFx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1MzAwMlxuICogICAtIFx1NjcyQ1x1NTczMFx1N0YzQVx1NTkzMSB3ZWJhcHAvXHVGRjBDXHU2MjE2XHU3MjQ4XHU2NzJDXHU2MjMzXHU3RjNBXHU1OTMxXHVGRjA4XHU4MDAxIGNsb25lIC8gXHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHVGRjA5XHUyMTkyIFx1NEZFMVx1NEVGQlx1NzhDMVx1NzZEOFx1NjIxNlx1OTY0RFx1N0VBN1x1RkYxQlxuICogICAtIFx1NzI0OFx1NjcyQ1x1NEUwRFx1N0IyNlx1RkYwOFx1NjNEMlx1NEVGNlx1NURGMlx1NTM0N1x1N0VBN1x1NEY0NiB3ZWJhcHAgXHU2NzJBXHU4RERGXHU5NjhGXHVGRjA5XHUyMTkyIFx1OTFDRFx1NjVCMFx1NEVDRVx1NUJGOVx1NUU5NFx1NzI0OFx1NjcyQyBHaXRIdWIgUmVsZWFzZVxuICogICAgIFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RCB3ZWJhcHAuemlwIFx1NUU3Nlx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEY3Rlx1MzAwQ3dlYmFwcCBcdTY2RjRcdTY1QjBcdTdFQ0YgR2l0SHViIFx1OTY4Rlx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1OTAwMVx1OEZCRVx1MzAwRFx1NzcxRlx1NkI2M1x1NjIxMFx1N0FDQlx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQXBwSG9zdCB7XG4gIHByaXZhdGUgYXBwOiBBcHA7XG4gIHByaXZhdGUgd2ViYXBwRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgYmxvYlVybHM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgcmVhZG9ubHkgdmVyc2lvbjogc3RyaW5nO1xuICBwcml2YXRlIHJlYWRvbmx5IHJlcG8gPSAnbWlhb3ppZ3Vhbi9vYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luRGlyOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMud2ViYXBwRGlyID0gbm9ybWFsaXplUGF0aChgJHtwbHVnaW5EaXJ9L3dlYmFwcGApO1xuICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb247XG4gIH1cblxuICAvLyBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDZcdTc2ODRcdTUzQkJcdTkxQ0RcdTdGMTNcdTVCNThcdUZGMUFcdTkwN0ZcdTUxNERcdTYzRDJcdTRFRjYgb25sb2FkIFx1OTg4NFx1NjJDOVx1NTNENlx1NEUwRVx1ODlDNlx1NTZGRVx1NjI1M1x1NUYwMFx1NjVGNlx1OTFDRFx1NTkwRFx1NEUwQlx1OEY3RFxuICBwcml2YXRlIHN0YXRpYyBwcmVmZXRjaENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8dm9pZD4+KCk7XG5cbiAgLyoqXG4gICAqIFx1NTQwRVx1NTNGMFx1OTg4NFx1NjJDOVx1NTNENlx1RkYxQVx1NjNEMlx1NEVGNiBvbmxvYWQgXHU2NUY2XHU4QzAzXHU3NTI4XHVGRjBDXHU2M0QwXHU1MjREXHU2MjhBXHU3RjNBXHU1OTMxXHU3Njg0IHdlYmFwcCBcdTRFMEJcdThGN0RcdTVFNzZcdTg5RTNcdTUzOEJcdTUyMzBcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdTMwMDJcbiAgICogXHU2QjYzXHU1RTM4XHU1Qjg5XHU4OEM1XHVGRjA4d2ViYXBwLyBcdTVERjJcdTk2OEZcdTYzRDJcdTRFRjZcdTUyMDZcdTUzRDFcdUZGMDlcdTY1RjZcdTRFQzVcdTUwNUFcdTRFMDBcdTZCMjFcdTVCNThcdTU3MjhcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMENcdTUxRTBcdTRFNEVcdTk2RjZcdTVGMDBcdTk1MDBcdTMwMDJcbiAgICogXHU1OTMxXHU4RDI1XHU0RUM1XHU1NDRBXHU4QjY2XHVGRjA4XHU0RTBEXHU2MjlCXHU1MUZBXHVGRjA5XHVGRjBDXHU3NzFGXHU2QjYzXHU2MjUzXHU1RjAwXHU4OUM2XHU1NkZFXHU2NUY2IGJ1aWxkQmxvYlVybCBcdTRGMUFcdTUxOERcdTZCMjFcdTVDMURcdThCRDVcdUZGMUJcbiAgICogXHU1NDBDXHU0RTAwXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHU1RTc2XHU1M0QxXHU1M0VBXHU4OUU2XHU1M0QxXHU0RTAwXHU2QjIxXHU0RTBCXHU4RjdEXHUzMDAyXG4gICAqL1xuICBzdGF0aWMgcHJlZmV0Y2goYXBwOiBBcHAsIHBsdWdpbkRpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBrZXkgPSBub3JtYWxpemVQYXRoKGAke3BsdWdpbkRpcn0vd2ViYXBwYCk7XG4gICAgbGV0IHAgPSBBcHBIb3N0LnByZWZldGNoQ2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKCFwKSB7XG4gICAgICBjb25zdCBob3N0ID0gbmV3IEFwcEhvc3QoYXBwLCBwbHVnaW5EaXIsIHZlcnNpb24pO1xuICAgICAgcCA9IGhvc3QuZW5zdXJlV2ViYXBwKGFwcC52YXVsdC5hZGFwdGVyKS5jYXRjaCgoZTogdW5rbm93bikgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJ1tBcHBIb3N0XSBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDYgd2ViYXBwIFx1NTkzMVx1OEQyNVx1RkYwOFx1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NjVGNlx1NUMwNlx1OTFDRFx1OEJENVx1RkYwOVx1RkYxQScsXG4gICAgICAgICAgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIEFwcEhvc3QucHJlZmV0Y2hDYWNoZS5zZXQoa2V5LCBwKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICBhc3luYyBidWlsZEJsb2JVcmwoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcblxuICAgIC8vIFx1ODFFQVx1NjEwOFx1RkYxQXdlYmFwcC8gXHU3RjNBXHU1OTMxXHU2NUY2XHU0RUNFXHU1QkY5XHU1RTk0XHU3MjQ4XHU2NzJDIFJlbGVhc2UgXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHU1RTc2XHU4OUUzXHU1MzhCXG4gICAgYXdhaXQgdGhpcy5lbnN1cmVXZWJhcHAoYWRhcHRlcik7XG5cbiAgICBjb25zdCBhcHBIdG1sUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9L2FwcC5odG1sYCk7XG4gICAgbGV0IGh0bWw6IHN0cmluZztcbiAgICB0cnkge1xuICAgICAgaHRtbCA9IGF3YWl0IGFkYXB0ZXIucmVhZChhcHBIdG1sUGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1OEJGQlx1NTNENiB3ZWJhcHAvYXBwLmh0bWxcdUZGMENcdTRFMTRcdTgxRUFcdTUyQThcdTRFMEJcdThGN0RcdTU5MzFcdThEMjVcdTMwMDJcdThCRjdcdTVDMURcdThCRDVcdTU3MjggT2JzaWRpYW4gXHU0RTJEXHU5MUNEXHU2NUIwXHU1Qjg5XHU4OEM1XHU2NzJDXHU2M0QyXHU0RUY2XHVGRjBDXHU2MjE2XHU2MjRCXHU1MkE4XHU2NTNFXHU3RjZFIHdlYmFwcC8gXHU3NkVFXHU1RjU1Jyk7XG4gICAgfVxuXG4gICAgLy8gXHU2NTc0XHU5ODc1IEhUTUwgXHU1REYyXHU4MUVBXHU1MzA1XHU1NDJCXHVGRjA4Q1NTIFx1NTE4NVx1ODA1NCArIGJ1bmRsZSBcdTUxODVcdTgwNTRcdTRFM0FcdTk3NTlcdTYwMDEgPHNjcmlwdD5cdUZGMDlcdUZGMENcdTc2RjRcdTYzQTUgYmxvYiBcdTRFQTRcdTdFRDkgaWZyYW1lXHUzMDAyXG4gICAgLy8gXHU4RkQwXHU4ODRDXHU2NUY2XHU0RTBEXHU1MjFCXHU1RUZBXHUzMDAxXHU0RTBEXHU2MkZDXHU2M0E1XHU0RUZCXHU0RjU1IHNjcmlwdCBcdTUxNDNcdTdEMjBcdTMwMDJcbiAgICBjb25zdCBwYWdlQmxvYiA9IG5ldyBCbG9iKFtodG1sXSwgeyB0eXBlOiAndGV4dC9odG1sJyB9KTtcbiAgICBjb25zdCBwYWdlVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChwYWdlQmxvYik7XG4gICAgdGhpcy5ibG9iVXJscy5wdXNoKHBhZ2VVcmwpO1xuICAgIHJldHVybiBwYWdlVXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODFFQVx1NjEwOFx1RkYwOFx1NzI0OFx1NjcyQ1x1NUI4OFx1NTM2Qlx1RkYwOVx1RkYxQVx1ODJFNVx1NjcyQ1x1NTczMCB3ZWJhcHAgXHU3RjNBXHU1OTMxXHVGRjBDXHU2MjE2XHU1REYyXHU1QjU4XHU1NzI4XHU0RjQ2XHU3MjQ4XHU2NzJDXHU2MjMzXHU0RTBFXHU1RjUzXHU1MjREXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHU0RTBEXHU3QjI2XHVGRjBDXG4gICAqIFx1NTIxOVx1OTFDRFx1NjVCMFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0RcdTVCRjlcdTVFOTRcdTcyNDhcdTY3MkNcdTc2ODQgd2ViYXBwLnppcCBcdTg5RTNcdTUzOEJcdUZGMDhcdTg5ODZcdTc2RDZcdUZGMDlcdTMwMDJcbiAgICogXHU2QjYzXHU1RTM4XHU1Qjg5XHU4OEM1XHVGRjA4d2ViYXBwLyBcdTVERjJcdTk2OEZcdTYzRDJcdTRFRjZcdTUyMDZcdTUzRDFcdTRFMTRcdTcyNDhcdTY3MkNcdTUzMzlcdTkxNERcdUZGMDlcdTVCOENcdTUxNjhcdTRFMERcdTg5RTZcdTUzRDFcdTgwNTRcdTdGNTFcdUZGMUJcdTRFQzVcdTdGM0FcdTU5MzFcdTYyMTZcdThGQzdcdTY3MUZcdTY1RjZcdTUxNUNcdTVFOTVcdTMwMDJcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlV2ViYXBwKGFkYXB0ZXI6IERhdGFBZGFwdGVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdmVyc2lvblN0YW1wRmlsZSA9ICcud2ViYXBwLXZlcnNpb24nO1xuICAgIGNvbnN0IGFwcEh0bWxQYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLndlYmFwcERpcn0vYXBwLmh0bWxgKTtcbiAgICBjb25zdCBzdGFtcFBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS8ke3ZlcnNpb25TdGFtcEZpbGV9YCk7XG5cbiAgICBpZiAoYXdhaXQgdGhpcy5maWxlRXhpc3RzKGFkYXB0ZXIsIGFwcEh0bWxQYXRoKSkge1xuICAgICAgLy8gd2ViYXBwLyBcdTVCNThcdTU3MjhcdUZGMUFcdTRFQzVcdTVGNTNcdTcyNDhcdTY3MkNcdTYyMzNcdTdGM0FcdTU5MzFcdUZGMDhcdTgwMDEgY2xvbmUgLyBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDlcdTYyMTZcdTcyNDhcdTY3MkNcdTRFMERcdTdCMjZcdTY1RjZcdTYyNERcdTkxQ0RcdTRFMEJcdUZGMENcbiAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NEZFMVx1NEVGQlx1NzhDMVx1NzZEOCBcdTIwMTRcdTIwMTQgQlJBVCAvIGdpdC1jbG9uZSBcdTk2OEZcdTRFRDNcdTVFOTNcdTU0MENcdTZCNjVcdTc2ODRcdTY3MDBcdTY1QjAgd2ViYXBwIFx1NTM3M1x1NkI2M1x1Nzg2RVx1RkYwQ1x1NjVFMFx1OTcwMFx1ODA1NFx1N0Y1MVx1MzAwMlxuICAgICAgaWYgKCEoYXdhaXQgdGhpcy5maWxlRXhpc3RzKGFkYXB0ZXIsIHN0YW1wUGF0aCkpKSByZXR1cm47XG4gICAgICBjb25zdCBsb2NhbCA9IGF3YWl0IHRoaXMucmVhZFZlcnNpb25TdGFtcChhZGFwdGVyLCBzdGFtcFBhdGgpO1xuICAgICAgaWYgKGxvY2FsID09PSB0aGlzLnZlcnNpb24pIHJldHVybjtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgW0FwcEhvc3RdIFx1NjcyQ1x1NTczMCB3ZWJhcHAgXHU3MjQ4XHU2NzJDKCR7bG9jYWx9KSBcdTRFMEVcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkMoJHt0aGlzLnZlcnNpb259KSBcdTRFMERcdTdCMjZcdUZGMENcdTkxQ0RcdTY1QjBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTMwMDJgXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghdGhpcy52ZXJzaW9uKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tBcHBIb3N0XSBcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdUZGMENcdThERjNcdThGQzdcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTMwMDJcdThCRjdcdTc4NkVcdThCQTRcdTYzRDJcdTRFRjZcdTVCODlcdTg4QzVcdTVCOENcdTY1NzRcdTMwMDInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7dGhpcy5yZXBvfS9yZWxlYXNlcy9kb3dubG9hZC8ke3RoaXMudmVyc2lvbn0vd2ViYXBwLnppcGA7XG4gICAgY29uc29sZS5sb2coYFtBcHBIb3N0XSBcdTY3MkFcdTY4QzBcdTZENEJcdTUyMzBcdTUzMzlcdTkxNERcdTc2ODRcdTY3MkNcdTU3MzAgd2ViYXBwXHVGRjBDXHU1QzFEXHU4QkQ1XHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHVGRjFBJHt1cmx9YCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCByZXF1ZXN0VXJsKHsgdXJsLCBtZXRob2Q6ICdHRVQnIH0pO1xuICAgICAgaWYgKHJlc3Auc3RhdHVzIDwgMjAwIHx8IHJlc3Auc3RhdHVzID49IDMwMCB8fCAhcmVzcC5hcnJheUJ1ZmZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NEUwQlx1OEY3RFx1OEZENFx1NTZERVx1NUYwMlx1NUUzOFx1NzJCNlx1NjAwMSAke3Jlc3Auc3RhdHVzfWApO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5leHRyYWN0WmlwKGFkYXB0ZXIsIHJlc3AuYXJyYXlCdWZmZXIpO1xuICAgICAgLy8gd2ViYXBwLnppcCBcdTVERjJcdTY0M0FcdTVFMjYgLndlYmFwcC12ZXJzaW9uXHVGRjBDXHU4OUUzXHU1MzhCXHU1NDBFXHU4MUVBXHU1MkE4XHU4NDNEXHU3NkQ4XHVGRjFCXHU2QjY0XHU1OTA0XHU1MTVDXHU1RTk1XHU1MThEXHU1MTk5XHU0RTAwXHU2QjIxXHVGRjBDXG4gICAgICAvLyBcdTkwN0ZcdTUxNERcdTU0MENcdTcyNDhcdTY3MkNcdTUzQ0RcdTU5MERcdTkxQ0RcdTRFMEJcdTMwMDJcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFkYXB0ZXIud3JpdGUoc3RhbXBQYXRoLCB0aGlzLnZlcnNpb24pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tBcHBIb3N0XSBcdTUxOTlcdTUxNjUgd2ViYXBwIFx1NzI0OFx1NjcyQ1x1NjIzM1x1NTkzMVx1OEQyNVx1RkYwOFx1NEUwRFx1NUY3MVx1NTRDRFx1NEY3Rlx1NzUyOFx1RkYwOVx1RkYxQScsIGUpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ1tBcHBIb3N0XSB3ZWJhcHAgXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHU1RTc2XHU4OUUzXHU1MzhCXHU1QjhDXHU2MjEwXHUzMDAyJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcignW0FwcEhvc3RdIHdlYmFwcCBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTU5MzFcdThEMjVcdUZGMUEnLCBlKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFx1NjVFMFx1NkNENVx1ODFFQVx1NTJBOFx1ODNCN1x1NTNENiB3ZWJhcHBcdUZGMDgke2UgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdTY3MkFcdTc3RTVcdTk1MTlcdThCRUYnfVx1RkYwOVx1MzAwMmAgK1xuICAgICAgICAnXHU4QkY3XHU2OEMwXHU2N0U1XHU3RjUxXHU3RURDXHU1NDBFXHU5MUNEXHU4QkQ1XHVGRjBDXHU2MjE2XHU1NzI4IE9ic2lkaWFuIFx1NEUyRFx1OTFDRFx1NjVCMFx1NUI4OVx1ODhDNVx1NjcyQ1x1NjNEMlx1NEVGNlx1MzAwMidcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWFkVmVyc2lvblN0YW1wKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoYXdhaXQgYWRhcHRlci5yZWFkKGZpbGVQYXRoKSkudHJpbSgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBleHRyYWN0WmlwKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBidWZmZXI6IEFycmF5QnVmZmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gZmZsYXRlIFx1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwOFx1NjVFMCBzZXRpbW1lZGlhdGUgXHU0RTRCXHU3QzdCXHU0RjFBXHU1MkE4XHU2MDAxXHU1MjFCXHU1RUZBIDxzY3JpcHQ+IFx1NzY4NFx1NEYyMFx1OTAxMlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1xuICAgIC8vIFx1OEZENFx1NTZERVx1NzY4NCBlbnRyaWVzIFx1NEVDNVx1NTQyQlx1NjU4N1x1NEVGNlx1RkYwOFx1NEUwRFx1NTQyQlx1NzZFRVx1NUY1NVx1Njc2MVx1NzZFRVx1RkYwOVx1RkYwQ1x1NzZFRVx1NUY1NVx1NzUzMSBlbnN1cmVQYXJlbnREaXJTYWZlIFx1NjMwOVx1OTcwMFx1NTIxQlx1NUVGQVx1MzAwMlxuICAgIGNvbnN0IGZpbGVzID0gdW56aXBTeW5jKG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpO1xuICAgIGNvbnN0IGVudHJpZXM6IHsgdGFyZ2V0OiBzdHJpbmc7IGNvbnRlbnQ6IFVpbnQ4QXJyYXkgfVtdID0gW107XG4gICAgZm9yIChjb25zdCBbcmF3UGF0aCwgY29udGVudF0gb2YgT2JqZWN0LmVudHJpZXMoZmlsZXMpKSB7XG4gICAgICBjb25zdCByZWwgPSBub3JtYWxpemVQYXRoKHJhd1BhdGgucmVwbGFjZSgvXlxcLj9cXC8vLCAnJykpO1xuICAgICAgaWYgKCFyZWwpIGNvbnRpbnVlO1xuICAgICAgaWYgKHJlbC5lbmRzV2l0aCgnLycpKSBjb250aW51ZTsgLy8gXHU3NkVFXHU1RjU1XHU1MzYwXHU0RjREXHU2NzYxXHU3NkVFXHVGRjBDXHU2NUUwXHU5NzAwXHU1MTk5XHU1MUZBXG4gICAgICBlbnRyaWVzLnB1c2goeyB0YXJnZXQ6IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9LyR7cmVsfWApLCBjb250ZW50IH0pO1xuICAgIH1cblxuICAgIC8vIFx1N0IyQ1x1NEUwMFx1OTA0RFx1RkYxQVx1NTE0OFx1NUVGQVx1NTk3RFx1NjI0MFx1NjcwOVx1NzIzNlx1NzZFRVx1NUY1NVx1MzAwMlx1ODJFNVx1NjdEMFx1NEUwMFx1N0VBN1x1NURGMlx1ODhBQlx1NTQwQ1x1NTQwRFx1NjU4N1x1NEVGNlx1NTM2MFx1NzUyOFx1RkYwOHppcCBcdTc2RUVcdTVGNTVcdTUzNjBcdTRGNERcdTY3NjFcdTc2RUVcdTMwMDFcbiAgICAvLyBcdTYyMTZcdTY3MkNcdTU3MzBcdTZCOEJcdTc1NTlcdTc2ODRcdTU3NEZcdTY1ODdcdTRFRjZcdUZGMDlcdUZGMENcdTUxNDhcdTUyMjBcdTk2NjRcdTUxOERcdTVFRkFcdTc2RUVcdTVGNTVcdUZGMENcdTkwN0ZcdTUxNERcdTU0MEVcdTdFRUQgd3JpdGVCaW5hcnkgXHU4OUU2XHU1M0QxIEVOT1RESVJcdTMwMDJcbiAgICBmb3IgKGNvbnN0IHsgdGFyZ2V0IH0gb2YgZW50cmllcykge1xuICAgICAgYXdhaXQgdGhpcy5lbnN1cmVQYXJlbnREaXJTYWZlKGFkYXB0ZXIsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgLy8gXHU3QjJDXHU0RThDXHU5MDREXHVGRjFBXHU1MTk5XHU2NTg3XHU0RUY2XHUzMDAyXHU4MkU1XHU2N0QwXHU2NzYxXHU3NkVFXHU4REVGXHU1Rjg0XHU1REYyXHU4OEFCXHU1RjUzXHU0RjVDXHU3NkVFXHU1RjU1XHU1MTk5XHU1MTY1XHVGRjA4XHU1MzYwXHU0RjREXHU2NTg3XHU0RUY2XHU0RTBFXHU3NzFGXHU1QjlFXHU3NkVFXHU1RjU1XHU1MUIyXHU3QTgxXHVGRjA5XHVGRjBDXG4gICAgLy8gXHU4REYzXHU4RkM3XHU4QkU1XHU1MzYwXHU0RjREXHU2NTg3XHU0RUY2XHVGRjBDXHU0RTBEXHU4OTg2XHU3NkQ2XHU0RTNBXHU2NTg3XHU0RUY2XHVGRjBDXHU0RkREXHU4QkMxIGFzc2V0cy9zY3JpcHRzLyogXHU3QjQ5XHU1RDRDXHU1OTU3XHU2NTg3XHU0RUY2XHU4MEZEXHU2QjYzXHU1RTM4XHU4NDNEXHU3NkQ4XHUzMDAyXG4gICAgZm9yIChjb25zdCB7IHRhcmdldCwgY29udGVudCB9IG9mIGVudHJpZXMpIHtcbiAgICAgIGlmIChhd2FpdCB0aGlzLmlzRm9sZGVyKGFkYXB0ZXIsIHRhcmdldCkpIGNvbnRpbnVlO1xuICAgICAgLy8gVWludDhBcnJheSBcdTIxOTIgXHU3MkVDXHU3QUNCIEFycmF5QnVmZmVyXHVGRjBDXHU5MDdGXHU1MTREXHU1MTcxXHU0RUFCXHU1RTk1XHU1QzQyIGJ1ZmZlciBcdTVCRkNcdTgxRjRcdThEOEFcdTc1NENcbiAgICAgIGF3YWl0IGFkYXB0ZXIud3JpdGVCaW5hcnkodGFyZ2V0LCBjb250ZW50LnNsaWNlKCkuYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU5MDEwXHU3RUE3XHU3ODZFXHU0RkREXHU3MjM2XHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XHVGRjFCXHU5MDQ3XHU1MjMwXHUzMDBDXHU1NDBDXHU1NDBEXHU2NTg3XHU0RUY2XHU1MzYwXHU0RjREXHUzMDBEXHU2NUY2XHU1MTQ4XHU1MjIwXHU5NjY0XHU1MThEIG1rZGlyXHVGRjBDXG4gICAqIFx1ODlFM1x1NTFCMyB6aXAgXHU1MzYwXHU0RjREXHU2NzYxXHU3NkVFIC8gXHU2NzJDXHU1NzMwXHU1NzRGXHU2NTg3XHU0RUY2XHU1QkZDXHU4MUY0IHdyaXRlQmluYXJ5IFx1NjI5QiBFTk9URElSIFx1NzY4NFx1OTVFRVx1OTg5OFx1MzAwMlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVQYXJlbnREaXJTYWZlKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGFydHMgPSBmaWxlUGF0aC5zcGxpdCgnLycpO1xuICAgIGxldCBhY2MgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgYWNjICs9IChhY2MgPyAnLycgOiAnJykgKyBwYXJ0c1tpXTtcbiAgICAgIGlmICghYWNjKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGtpbmQgPSBhd2FpdCB0aGlzLnN0YXRLaW5kKGFkYXB0ZXIsIGFjYyk7XG4gICAgICBpZiAoa2luZCA9PT0gJ2ZvbGRlcicpIGNvbnRpbnVlOyAvLyBcdTVERjJcdTY2MkZcdTc2RUVcdTVGNTVcdUZGMENcdThERjNcdThGQzdcbiAgICAgIGlmIChraW5kID09PSAnZmlsZScpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBhZGFwdGVyLnJlbW92ZShhY2MpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBcdTUyMjBcdTk2NjRcdTU5MzFcdThEMjVcdTRFNUZcdTRFMERcdTk2M0JcdTY1QURcdUZGMENcdTRFQTRcdTc1MzFcdTRFMEJcdTY1QjkgbWtkaXIgXHU2NkI0XHU5NzMyXHU3NzFGXHU1QjlFXHU5NTE5XHU4QkVGXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFkYXB0ZXIubWtkaXIoYWNjKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBcdTUzRUZcdTgwRkRcdTVERjJcdTg4QUJcdTUxNzZcdTRFRDZcdTY3NjFcdTc2RUVcdTUxNDhcdTg4NENcdTUyMUJcdTVFRkFcdUZGMENcdTVGRkRcdTc1NjVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogXHU4RkQ0XHU1NkRFXHU4REVGXHU1Rjg0XHU3QzdCXHU1NzhCXHVGRjFBJ2ZpbGUnIHwgJ2ZvbGRlcicgfCAnbm9uZSdcdUZGMDhcdTRFMERcdTVCNThcdTU3MjhcdTYyMTZcdTY1RTBcdTZDRDVcdTUyMjRcdTVCOUFcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBzdGF0S2luZChhZGFwdGVyOiBEYXRhQWRhcHRlciwgcGF0aDogc3RyaW5nKTogUHJvbWlzZTwnZmlsZScgfCAnZm9sZGVyJyB8ICdub25lJz4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChwYXRoKTtcbiAgICAgIGlmICghc3QpIHJldHVybiAnbm9uZSc7XG4gICAgICByZXR1cm4gc3QudHlwZSA9PT0gJ2ZvbGRlcicgPyAnZm9sZGVyJyA6ICdmaWxlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiAnbm9uZSc7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpc0ZvbGRlcihhZGFwdGVyOiBEYXRhQWRhcHRlciwgcGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLnN0YXRLaW5kKGFkYXB0ZXIsIHBhdGgpKSA9PT0gJ2ZvbGRlcic7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZpbGVFeGlzdHMoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgYWRhcHRlci5leGlzdHMocGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHVybCBvZiB0aGlzLmJsb2JVcmxzKSB7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfVxuICAgIHRoaXMuYmxvYlVybHMgPSBbXTtcbiAgfVxufVxuIiwgIi8vIERFRkxBVEUgaXMgYSBjb21wbGV4IGZvcm1hdDsgdG8gcmVhZCB0aGlzIGNvZGUsIHlvdSBzaG91bGQgcHJvYmFibHkgY2hlY2sgdGhlIFJGQyBmaXJzdDpcbi8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMxOTUxXG4vLyBZb3UgbWF5IGFsc28gd2lzaCB0byB0YWtlIGEgbG9vayBhdCB0aGUgZ3VpZGUgSSBtYWRlIGFib3V0IHRoaXMgcHJvZ3JhbTpcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzEwMWFycm93ei8yNTNmMzFlYjVhYmMzZDkyNzVhYjk0MzAwM2ZmZWNhZFxuLy8gU29tZSBvZiB0aGUgZm9sbG93aW5nIGNvZGUgaXMgc2ltaWxhciB0byB0aGF0IG9mIFVaSVAuanM6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vcGhvdG9wZWEvVVpJUC5qc1xuLy8gSG93ZXZlciwgdGhlIHZhc3QgbWFqb3JpdHkgb2YgdGhlIGNvZGViYXNlIGhhcyBkaXZlcmdlZCBmcm9tIFVaSVAuanMgdG8gaW5jcmVhc2UgcGVyZm9ybWFuY2UgYW5kIHJlZHVjZSBidW5kbGUgc2l6ZS5cbi8vIFNvbWV0aW1lcyAwIHdpbGwgYXBwZWFyIHdoZXJlIC0xIHdvdWxkIGJlIG1vcmUgYXBwcm9wcmlhdGUuIFRoaXMgaXMgYmVjYXVzZSB1c2luZyBhIHVpbnRcbi8vIGlzIGJldHRlciBmb3IgbWVtb3J5IGluIG1vc3QgZW5naW5lcyAoSSAqdGhpbmsqKS5cbnZhciBjaDIgPSB7fTtcbnZhciB3ayA9IChmdW5jdGlvbiAoYywgaWQsIG1zZywgdHJhbnNmZXIsIGNiKSB7XG4gICAgdmFyIHcgPSBuZXcgV29ya2VyKGNoMltpZF0gfHwgKGNoMltpZF0gPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtcbiAgICAgICAgYyArICc7YWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsZnVuY3Rpb24oZSl7ZT1lLmVycm9yO3Bvc3RNZXNzYWdlKHskZSQ6W2UubWVzc2FnZSxlLmNvZGUsZS5zdGFja119KX0pJ1xuICAgIF0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSkpKSk7XG4gICAgdy5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgZCA9IGUuZGF0YSwgZWQgPSBkLiRlJDtcbiAgICAgICAgaWYgKGVkKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKGVkWzBdKTtcbiAgICAgICAgICAgIGVyclsnY29kZSddID0gZWRbMV07XG4gICAgICAgICAgICBlcnIuc3RhY2sgPSBlZFsyXTtcbiAgICAgICAgICAgIGNiKGVyciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2IobnVsbCwgZCk7XG4gICAgfTtcbiAgICB3LnBvc3RNZXNzYWdlKG1zZywgdHJhbnNmZXIpO1xuICAgIHJldHVybiB3O1xufSk7XG5cbi8vIGFsaWFzZXMgZm9yIHNob3J0ZXIgY29tcHJlc3NlZCBjb2RlIChtb3N0IG1pbmlmZXJzIGRvbid0IGRvIHRoaXMpXG52YXIgdTggPSBVaW50OEFycmF5LCB1MTYgPSBVaW50MTZBcnJheSwgaTMyID0gSW50MzJBcnJheTtcbi8vIGZpeGVkIGxlbmd0aCBleHRyYSBiaXRzXG52YXIgZmxlYiA9IG5ldyB1OChbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMSwgMiwgMiwgMiwgMiwgMywgMywgMywgMywgNCwgNCwgNCwgNCwgNSwgNSwgNSwgNSwgMCwgLyogdW51c2VkICovIDAsIDAsIC8qIGltcG9zc2libGUgKi8gMF0pO1xuLy8gZml4ZWQgZGlzdGFuY2UgZXh0cmEgYml0c1xudmFyIGZkZWIgPSBuZXcgdTgoWzAsIDAsIDAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDcsIDgsIDgsIDksIDksIDEwLCAxMCwgMTEsIDExLCAxMiwgMTIsIDEzLCAxMywgLyogdW51c2VkICovIDAsIDBdKTtcbi8vIGNvZGUgbGVuZ3RoIGluZGV4IG1hcFxudmFyIGNsaW0gPSBuZXcgdTgoWzE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsIDEwLCA1LCAxMSwgNCwgMTIsIDMsIDEzLCAyLCAxNCwgMSwgMTVdKTtcbi8vIGdldCBiYXNlLCByZXZlcnNlIGluZGV4IG1hcCBmcm9tIGV4dHJhIGJpdHNcbnZhciBmcmViID0gZnVuY3Rpb24gKGViLCBzdGFydCkge1xuICAgIHZhciBiID0gbmV3IHUxNigzMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMTsgKytpKSB7XG4gICAgICAgIGJbaV0gPSBzdGFydCArPSAxIDw8IGViW2kgLSAxXTtcbiAgICB9XG4gICAgLy8gbnVtYmVycyBoZXJlIGFyZSBhdCBtYXggMTggYml0c1xuICAgIHZhciByID0gbmV3IGkzMihiWzMwXSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAzMDsgKytpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBiW2ldOyBqIDwgYltpICsgMV07ICsraikge1xuICAgICAgICAgICAgcltqXSA9ICgoaiAtIGJbaV0pIDw8IDUpIHwgaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBiOiBiLCByOiByIH07XG59O1xudmFyIF9hID0gZnJlYihmbGViLCAyKSwgZmwgPSBfYS5iLCByZXZmbCA9IF9hLnI7XG4vLyB3ZSBjYW4gaWdub3JlIHRoZSBmYWN0IHRoYXQgdGhlIG90aGVyIG51bWJlcnMgYXJlIHdyb25nOyB0aGV5IG5ldmVyIGhhcHBlbiBhbnl3YXlcbmZsWzI4XSA9IDI1OCwgcmV2ZmxbMjU4XSA9IDI4O1xudmFyIF9iID0gZnJlYihmZGViLCAwKSwgZmQgPSBfYi5iLCByZXZmZCA9IF9iLnI7XG4vLyBtYXAgb2YgdmFsdWUgdG8gcmV2ZXJzZSAoYXNzdW1pbmcgMTYgYml0cylcbnZhciByZXYgPSBuZXcgdTE2KDMyNzY4KTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMzI3Njg7ICsraSkge1xuICAgIC8vIHJldmVyc2UgdGFibGUgYWxnb3JpdGhtIGZyb20gU09cbiAgICB2YXIgeCA9ICgoaSAmIDB4QUFBQSkgPj4gMSkgfCAoKGkgJiAweDU1NTUpIDw8IDEpO1xuICAgIHggPSAoKHggJiAweENDQ0MpID4+IDIpIHwgKCh4ICYgMHgzMzMzKSA8PCAyKTtcbiAgICB4ID0gKCh4ICYgMHhGMEYwKSA+PiA0KSB8ICgoeCAmIDB4MEYwRikgPDwgNCk7XG4gICAgcmV2W2ldID0gKCgoeCAmIDB4RkYwMCkgPj4gOCkgfCAoKHggJiAweDAwRkYpIDw8IDgpKSA+PiAxO1xufVxuLy8gY3JlYXRlIGh1ZmZtYW4gdHJlZSBmcm9tIHU4IFwibWFwXCI6IGluZGV4IC0+IGNvZGUgbGVuZ3RoIGZvciBjb2RlIGluZGV4XG4vLyBtYiAobWF4IGJpdHMpIG11c3QgYmUgYXQgbW9zdCAxNVxuLy8gVE9ETzogb3B0aW1pemUvc3BsaXQgdXA/XG52YXIgaE1hcCA9IChmdW5jdGlvbiAoY2QsIG1iLCByKSB7XG4gICAgdmFyIHMgPSBjZC5sZW5ndGg7XG4gICAgLy8gaW5kZXhcbiAgICB2YXIgaSA9IDA7XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+ICMgb2YgY29kZXMgd2l0aCBiaXQgbGVuZ3RoID0gaW5kZXhcbiAgICB2YXIgbCA9IG5ldyB1MTYobWIpO1xuICAgIC8vIGxlbmd0aCBvZiBjZCBtdXN0IGJlIDI4OCAodG90YWwgIyBvZiBjb2RlcylcbiAgICBmb3IgKDsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAoY2RbaV0pXG4gICAgICAgICAgICArK2xbY2RbaV0gLSAxXTtcbiAgICB9XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+IG1pbmltdW0gY29kZSBmb3IgYml0IGxlbmd0aCA9IGluZGV4XG4gICAgdmFyIGxlID0gbmV3IHUxNihtYik7XG4gICAgZm9yIChpID0gMTsgaSA8IG1iOyArK2kpIHtcbiAgICAgICAgbGVbaV0gPSAobGVbaSAtIDFdICsgbFtpIC0gMV0pIDw8IDE7XG4gICAgfVxuICAgIHZhciBjbztcbiAgICBpZiAocikge1xuICAgICAgICAvLyB1MTYgXCJtYXBcIjogaW5kZXggLT4gbnVtYmVyIG9mIGFjdHVhbCBiaXRzLCBzeW1ib2wgZm9yIGNvZGVcbiAgICAgICAgY28gPSBuZXcgdTE2KDEgPDwgbWIpO1xuICAgICAgICAvLyBiaXRzIHRvIHJlbW92ZSBmb3IgcmV2ZXJzZXJcbiAgICAgICAgdmFyIHJ2YiA9IDE1IC0gbWI7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSAwIGxlbmd0aHNcbiAgICAgICAgICAgIGlmIChjZFtpXSkge1xuICAgICAgICAgICAgICAgIC8vIG51bSBlbmNvZGluZyBib3RoIHN5bWJvbCBhbmQgYml0cyByZWFkXG4gICAgICAgICAgICAgICAgdmFyIHN2ID0gKGkgPDwgNCkgfCBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBmcmVlIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgcl8xID0gbWIgLSBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBzdGFydCB2YWx1ZVxuICAgICAgICAgICAgICAgIHZhciB2ID0gbGVbY2RbaV0gLSAxXSsrIDw8IHJfMTtcbiAgICAgICAgICAgICAgICAvLyBtIGlzIGVuZCB2YWx1ZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIG0gPSB2IHwgKCgxIDw8IHJfMSkgLSAxKTsgdiA8PSBtOyArK3YpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlcnkgMTYgYml0IHZhbHVlIHN0YXJ0aW5nIHdpdGggdGhlIGNvZGUgeWllbGRzIHRoZSBzYW1lIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICBjb1tyZXZbdl0gPj4gcnZiXSA9IHN2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY28gPSBuZXcgdTE2KHMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICBpZiAoY2RbaV0pIHtcbiAgICAgICAgICAgICAgICBjb1tpXSA9IHJldltsZVtjZFtpXSAtIDFdKytdID4+ICgxNSAtIGNkW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY287XG59KTtcbi8vIGZpeGVkIGxlbmd0aCB0cmVlXG52YXIgZmx0ID0gbmV3IHU4KDI4OCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IDE0NDsgKytpKVxuICAgIGZsdFtpXSA9IDg7XG5mb3IgKHZhciBpID0gMTQ0OyBpIDwgMjU2OyArK2kpXG4gICAgZmx0W2ldID0gOTtcbmZvciAodmFyIGkgPSAyNTY7IGkgPCAyODA7ICsraSlcbiAgICBmbHRbaV0gPSA3O1xuZm9yICh2YXIgaSA9IDI4MDsgaSA8IDI4ODsgKytpKVxuICAgIGZsdFtpXSA9IDg7XG4vLyBmaXhlZCBkaXN0YW5jZSB0cmVlXG52YXIgZmR0ID0gbmV3IHU4KDMyKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMzI7ICsraSlcbiAgICBmZHRbaV0gPSA1O1xuLy8gZml4ZWQgbGVuZ3RoIG1hcFxudmFyIGZsbSA9IC8qI19fUFVSRV9fKi8gaE1hcChmbHQsIDksIDApLCBmbHJtID0gLyojX19QVVJFX18qLyBoTWFwKGZsdCwgOSwgMSk7XG4vLyBmaXhlZCBkaXN0YW5jZSBtYXBcbnZhciBmZG0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmR0LCA1LCAwKSwgZmRybSA9IC8qI19fUFVSRV9fKi8gaE1hcChmZHQsIDUsIDEpO1xuLy8gZmluZCBtYXggb2YgYXJyYXlcbnZhciBtYXggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBtID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGFbaV0gPiBtKVxuICAgICAgICAgICAgbSA9IGFbaV07XG4gICAgfVxuICAgIHJldHVybiBtO1xufTtcbi8vIHJlYWQgZCwgc3RhcnRpbmcgYXQgYml0IHAgYW5kIG1hc2sgd2l0aCBtXG52YXIgYml0cyA9IGZ1bmN0aW9uIChkLCBwLCBtKSB7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICByZXR1cm4gKChkW29dIHwgKGRbbyArIDFdIDw8IDgpKSA+PiAocCAmIDcpKSAmIG07XG59O1xuLy8gcmVhZCBkLCBzdGFydGluZyBhdCBiaXQgcCBjb250aW51aW5nIGZvciBhdCBsZWFzdCAxNiBiaXRzXG52YXIgYml0czE2ID0gZnVuY3Rpb24gKGQsIHApIHtcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIHJldHVybiAoKGRbb10gfCAoZFtvICsgMV0gPDwgOCkgfCAoZFtvICsgMl0gPDwgMTYpKSA+PiAocCAmIDcpKTtcbn07XG4vLyBnZXQgZW5kIG9mIGJ5dGVcbnZhciBzaGZ0ID0gZnVuY3Rpb24gKHApIHsgcmV0dXJuICgocCArIDcpIC8gOCkgfCAwOyB9O1xuLy8gdHlwZWQgYXJyYXkgc2xpY2UgLSBhbGxvd3MgZ2FyYmFnZSBjb2xsZWN0b3IgdG8gZnJlZSBvcmlnaW5hbCByZWZlcmVuY2UsXG4vLyB3aGlsZSBiZWluZyBtb3JlIGNvbXBhdGlibGUgdGhhbiAuc2xpY2VcbnZhciBzbGMgPSBmdW5jdGlvbiAodiwgcywgZSkge1xuICAgIGlmIChzID09IG51bGwgfHwgcyA8IDApXG4gICAgICAgIHMgPSAwO1xuICAgIGlmIChlID09IG51bGwgfHwgZSA+IHYubGVuZ3RoKVxuICAgICAgICBlID0gdi5sZW5ndGg7XG4gICAgLy8gY2FuJ3QgdXNlIC5jb25zdHJ1Y3RvciBpbiBjYXNlIHVzZXItc3VwcGxpZWRcbiAgICByZXR1cm4gbmV3IHU4KHYuc3ViYXJyYXkocywgZSkpO1xufTtcbi8qKlxuICogQ29kZXMgZm9yIGVycm9ycyBnZW5lcmF0ZWQgd2l0aGluIHRoaXMgbGlicmFyeVxuICovXG5leHBvcnQgdmFyIEZsYXRlRXJyb3JDb2RlID0ge1xuICAgIFVuZXhwZWN0ZWRFT0Y6IDAsXG4gICAgSW52YWxpZEJsb2NrVHlwZTogMSxcbiAgICBJbnZhbGlkTGVuZ3RoTGl0ZXJhbDogMixcbiAgICBJbnZhbGlkRGlzdGFuY2U6IDMsXG4gICAgU3RyZWFtRmluaXNoZWQ6IDQsXG4gICAgTm9TdHJlYW1IYW5kbGVyOiA1LFxuICAgIEludmFsaWRIZWFkZXI6IDYsXG4gICAgTm9DYWxsYmFjazogNyxcbiAgICBJbnZhbGlkVVRGODogOCxcbiAgICBFeHRyYUZpZWxkVG9vTG9uZzogOSxcbiAgICBJbnZhbGlkRGF0ZTogMTAsXG4gICAgRmlsZW5hbWVUb29Mb25nOiAxMSxcbiAgICBTdHJlYW1GaW5pc2hpbmc6IDEyLFxuICAgIEludmFsaWRaaXBEYXRhOiAxMyxcbiAgICBVbmtub3duQ29tcHJlc3Npb25NZXRob2Q6IDE0XG59O1xuLy8gZXJyb3IgY29kZXNcbnZhciBlYyA9IFtcbiAgICAndW5leHBlY3RlZCBFT0YnLFxuICAgICdpbnZhbGlkIGJsb2NrIHR5cGUnLFxuICAgICdpbnZhbGlkIGxlbmd0aC9saXRlcmFsJyxcbiAgICAnaW52YWxpZCBkaXN0YW5jZScsXG4gICAgJ3N0cmVhbSBmaW5pc2hlZCcsXG4gICAgJ25vIHN0cmVhbSBoYW5kbGVyJyxcbiAgICAsIC8vIGRldGVybWluZWQgYnkgY29tcHJlc3Npb24gZnVuY3Rpb25cbiAgICAnbm8gY2FsbGJhY2snLFxuICAgICdpbnZhbGlkIFVURi04IGRhdGEnLFxuICAgICdleHRyYSBmaWVsZCB0b28gbG9uZycsXG4gICAgJ2RhdGUgbm90IGluIHJhbmdlIDE5ODAtMjA5OScsXG4gICAgJ2ZpbGVuYW1lIHRvbyBsb25nJyxcbiAgICAnc3RyZWFtIGZpbmlzaGluZycsXG4gICAgJ2ludmFsaWQgemlwIGRhdGEnXG4gICAgLy8gZGV0ZXJtaW5lZCBieSB1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZFxuXTtcbjtcbnZhciBlcnIgPSBmdW5jdGlvbiAoaW5kLCBtc2csIG50KSB7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IobXNnIHx8IGVjW2luZF0pO1xuICAgIGUuY29kZSA9IGluZDtcbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpXG4gICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGUsIGVycik7XG4gICAgaWYgKCFudClcbiAgICAgICAgdGhyb3cgZTtcbiAgICByZXR1cm4gZTtcbn07XG4vLyBleHBhbmRzIHJhdyBERUZMQVRFIGRhdGFcbnZhciBpbmZsdCA9IGZ1bmN0aW9uIChkYXQsIHN0LCBidWYsIGRpY3QpIHtcbiAgICAvLyBzb3VyY2UgbGVuZ3RoICAgICAgIGRpY3QgbGVuZ3RoXG4gICAgdmFyIHNsID0gZGF0Lmxlbmd0aCwgZGwgPSBkaWN0ID8gZGljdC5sZW5ndGggOiAwO1xuICAgIGlmICghc2wgfHwgc3QuZiAmJiAhc3QubClcbiAgICAgICAgcmV0dXJuIGJ1ZiB8fCBuZXcgdTgoMCk7XG4gICAgdmFyIG5vQnVmID0gIWJ1ZjtcbiAgICAvLyBoYXZlIHRvIGVzdGltYXRlIHNpemVcbiAgICB2YXIgcmVzaXplID0gbm9CdWYgfHwgc3QuaSAhPSAyO1xuICAgIC8vIG5vIHN0YXRlXG4gICAgdmFyIG5vU3QgPSBzdC5pO1xuICAgIC8vIEFzc3VtZXMgcm91Z2hseSAzMyUgY29tcHJlc3Npb24gcmF0aW8gYXZlcmFnZVxuICAgIGlmIChub0J1ZilcbiAgICAgICAgYnVmID0gbmV3IHU4KHNsICogMyk7XG4gICAgLy8gZW5zdXJlIGJ1ZmZlciBjYW4gZml0IGF0IGxlYXN0IGwgZWxlbWVudHNcbiAgICB2YXIgY2J1ZiA9IGZ1bmN0aW9uIChsKSB7XG4gICAgICAgIHZhciBibCA9IGJ1Zi5sZW5ndGg7XG4gICAgICAgIC8vIG5lZWQgdG8gaW5jcmVhc2Ugc2l6ZSB0byBmaXRcbiAgICAgICAgaWYgKGwgPiBibCkge1xuICAgICAgICAgICAgLy8gRG91YmxlIG9yIHNldCB0byBuZWNlc3NhcnksIHdoaWNoZXZlciBpcyBncmVhdGVyXG4gICAgICAgICAgICB2YXIgbmJ1ZiA9IG5ldyB1OChNYXRoLm1heChibCAqIDIsIGwpKTtcbiAgICAgICAgICAgIG5idWYuc2V0KGJ1Zik7XG4gICAgICAgICAgICBidWYgPSBuYnVmO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyAgbGFzdCBjaHVuayAgICAgICAgIGJpdHBvcyAgICAgICAgICAgYnl0ZXNcbiAgICB2YXIgZmluYWwgPSBzdC5mIHx8IDAsIHBvcyA9IHN0LnAgfHwgMCwgYnQgPSBzdC5iIHx8IDAsIGxtID0gc3QubCwgZG0gPSBzdC5kLCBsYnQgPSBzdC5tLCBkYnQgPSBzdC5uO1xuICAgIC8vIHRvdGFsIGJpdHNcbiAgICB2YXIgdGJ0cyA9IHNsICogODtcbiAgICBkbyB7XG4gICAgICAgIGlmICghbG0pIHtcbiAgICAgICAgICAgIC8vIEJGSU5BTCAtIHRoaXMgaXMgb25seSAxIHdoZW4gbGFzdCBjaHVuayBpcyBuZXh0XG4gICAgICAgICAgICBmaW5hbCA9IGJpdHMoZGF0LCBwb3MsIDEpO1xuICAgICAgICAgICAgLy8gdHlwZTogMCA9IG5vIGNvbXByZXNzaW9uLCAxID0gZml4ZWQgaHVmZm1hbiwgMiA9IGR5bmFtaWMgaHVmZm1hblxuICAgICAgICAgICAgdmFyIHR5cGUgPSBiaXRzKGRhdCwgcG9zICsgMSwgMyk7XG4gICAgICAgICAgICBwb3MgKz0gMztcbiAgICAgICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIGdvIHRvIGVuZCBvZiBieXRlIGJvdW5kYXJ5XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBzaGZ0KHBvcykgKyA0LCBsID0gZGF0W3MgLSA0XSB8IChkYXRbcyAtIDNdIDw8IDgpLCB0ID0gcyArIGw7XG4gICAgICAgICAgICAgICAgaWYgKHQgPiBzbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9TdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycigwKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSBzaXplXG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIGwpO1xuICAgICAgICAgICAgICAgIC8vIENvcHkgb3ZlciB1bmNvbXByZXNzZWQgZGF0YVxuICAgICAgICAgICAgICAgIGJ1Zi5zZXQoZGF0LnN1YmFycmF5KHMsIHQpLCBidCk7XG4gICAgICAgICAgICAgICAgLy8gR2V0IG5ldyBiaXRwb3MsIHVwZGF0ZSBieXRlIGNvdW50XG4gICAgICAgICAgICAgICAgc3QuYiA9IGJ0ICs9IGwsIHN0LnAgPSBwb3MgPSB0ICogOCwgc3QuZiA9IGZpbmFsO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PSAxKVxuICAgICAgICAgICAgICAgIGxtID0gZmxybSwgZG0gPSBmZHJtLCBsYnQgPSA5LCBkYnQgPSA1O1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PSAyKSB7XG4gICAgICAgICAgICAgICAgLy8gIGxpdGVyYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3Roc1xuICAgICAgICAgICAgICAgIHZhciBoTGl0ID0gYml0cyhkYXQsIHBvcywgMzEpICsgMjU3LCBoY0xlbiA9IGJpdHMoZGF0LCBwb3MgKyAxMCwgMTUpICsgNDtcbiAgICAgICAgICAgICAgICB2YXIgdGwgPSBoTGl0ICsgYml0cyhkYXQsIHBvcyArIDUsIDMxKSArIDE7XG4gICAgICAgICAgICAgICAgcG9zICs9IDE0O1xuICAgICAgICAgICAgICAgIC8vIGxlbmd0aCtkaXN0YW5jZSB0cmVlXG4gICAgICAgICAgICAgICAgdmFyIGxkdCA9IG5ldyB1OCh0bCk7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGggdHJlZVxuICAgICAgICAgICAgICAgIHZhciBjbHQgPSBuZXcgdTgoMTkpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGNMZW47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgaW5kZXggbWFwIHRvIGdldCByZWFsIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgY2x0W2NsaW1baV1dID0gYml0cyhkYXQsIHBvcyArIGkgKiAzLCA3KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcG9zICs9IGhjTGVuICogMztcbiAgICAgICAgICAgICAgICAvLyBjb2RlIGxlbmd0aHMgYml0c1xuICAgICAgICAgICAgICAgIHZhciBjbGIgPSBtYXgoY2x0KSwgY2xibXNrID0gKDEgPDwgY2xiKSAtIDE7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGhzIG1hcFxuICAgICAgICAgICAgICAgIHZhciBjbG0gPSBoTWFwKGNsdCwgY2xiLCAxKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRsOykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNsbVtiaXRzKGRhdCwgcG9zLCBjbGJtc2spXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYml0cyByZWFkXG4gICAgICAgICAgICAgICAgICAgIHBvcyArPSByICYgMTU7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN5bWJvbFxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHIgPj4gNDtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGggdG8gY29weVxuICAgICAgICAgICAgICAgICAgICBpZiAocyA8IDE2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZHRbaSsrXSA9IHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgY29weSAgIGNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IDAsIG4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMgPT0gMTYpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDMgKyBiaXRzKGRhdCwgcG9zLCAzKSwgcG9zICs9IDIsIGMgPSBsZHRbaSAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocyA9PSAxNylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gMyArIGJpdHMoZGF0LCBwb3MsIDcpLCBwb3MgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMgPT0gMTgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDExICsgYml0cyhkYXQsIHBvcywgMTI3KSwgcG9zICs9IDc7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAobi0tKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxkdFtpKytdID0gYztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICBsZW5ndGggdHJlZSAgICAgICAgICAgICAgICAgZGlzdGFuY2UgdHJlZVxuICAgICAgICAgICAgICAgIHZhciBsdCA9IGxkdC5zdWJhcnJheSgwLCBoTGl0KSwgZHQgPSBsZHQuc3ViYXJyYXkoaExpdCk7XG4gICAgICAgICAgICAgICAgLy8gbWF4IGxlbmd0aCBiaXRzXG4gICAgICAgICAgICAgICAgbGJ0ID0gbWF4KGx0KTtcbiAgICAgICAgICAgICAgICAvLyBtYXggZGlzdCBiaXRzXG4gICAgICAgICAgICAgICAgZGJ0ID0gbWF4KGR0KTtcbiAgICAgICAgICAgICAgICBsbSA9IGhNYXAobHQsIGxidCwgMSk7XG4gICAgICAgICAgICAgICAgZG0gPSBoTWFwKGR0LCBkYnQsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVycigxKTtcbiAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgIGVycigwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGJ1ZmZlciBjYW4gaG9sZCB0aGlzICsgdGhlIGxhcmdlc3QgcG9zc2libGUgYWRkaXRpb25cbiAgICAgICAgLy8gTWF4aW11bSBjaHVuayBzaXplIChwcmFjdGljYWxseSwgdGhlb3JldGljYWxseSBpbmZpbml0ZSkgaXMgMl4xN1xuICAgICAgICBpZiAocmVzaXplKVxuICAgICAgICAgICAgY2J1ZihidCArIDEzMTA3Mik7XG4gICAgICAgIHZhciBsbXMgPSAoMSA8PCBsYnQpIC0gMSwgZG1zID0gKDEgPDwgZGJ0KSAtIDE7XG4gICAgICAgIHZhciBscG9zID0gcG9zO1xuICAgICAgICBmb3IgKDs7IGxwb3MgPSBwb3MpIHtcbiAgICAgICAgICAgIC8vIGJpdHMgcmVhZCwgY29kZVxuICAgICAgICAgICAgdmFyIGMgPSBsbVtiaXRzMTYoZGF0LCBwb3MpICYgbG1zXSwgc3ltID0gYyA+PiA0O1xuICAgICAgICAgICAgcG9zICs9IGMgJiAxNTtcbiAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgIGVycigwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYylcbiAgICAgICAgICAgICAgICBlcnIoMik7XG4gICAgICAgICAgICBpZiAoc3ltIDwgMjU2KVxuICAgICAgICAgICAgICAgIGJ1ZltidCsrXSA9IHN5bTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHN5bSA9PSAyNTYpIHtcbiAgICAgICAgICAgICAgICBscG9zID0gcG9zLCBsbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgYWRkID0gc3ltIC0gMjU0O1xuICAgICAgICAgICAgICAgIC8vIG5vIGV4dHJhIGJpdHMgbmVlZGVkIGlmIGxlc3NcbiAgICAgICAgICAgICAgICBpZiAoc3ltID4gMjY0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluZGV4XG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gc3ltIC0gMjU3LCBiID0gZmxlYltpXTtcbiAgICAgICAgICAgICAgICAgICAgYWRkID0gYml0cyhkYXQsIHBvcywgKDEgPDwgYikgLSAxKSArIGZsW2ldO1xuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gYjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZGlzdFxuICAgICAgICAgICAgICAgIHZhciBkID0gZG1bYml0czE2KGRhdCwgcG9zKSAmIGRtc10sIGRzeW0gPSBkID4+IDQ7XG4gICAgICAgICAgICAgICAgaWYgKCFkKVxuICAgICAgICAgICAgICAgICAgICBlcnIoMyk7XG4gICAgICAgICAgICAgICAgcG9zICs9IGQgJiAxNTtcbiAgICAgICAgICAgICAgICB2YXIgZHQgPSBmZFtkc3ltXTtcbiAgICAgICAgICAgICAgICBpZiAoZHN5bSA+IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGIgPSBmZGViW2RzeW1dO1xuICAgICAgICAgICAgICAgICAgICBkdCArPSBiaXRzMTYoZGF0LCBwb3MpICYgKDEgPDwgYikgLSAxLCBwb3MgKz0gYjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBvcyA+IHRidHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzaXplKVxuICAgICAgICAgICAgICAgICAgICBjYnVmKGJ0ICsgMTMxMDcyKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kID0gYnQgKyBhZGQ7XG4gICAgICAgICAgICAgICAgaWYgKGJ0IDwgZHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNoaWZ0ID0gZGwgLSBkdCwgZGVuZCA9IE1hdGgubWluKGR0LCBlbmQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hpZnQgKyBidCA8IDApXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyBidCA8IGRlbmQ7ICsrYnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbYnRdID0gZGljdFtzaGlmdCArIGJ0XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICg7IGJ0IDwgZW5kOyArK2J0KVxuICAgICAgICAgICAgICAgICAgICBidWZbYnRdID0gYnVmW2J0IC0gZHRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0LmwgPSBsbSwgc3QucCA9IGxwb3MsIHN0LmIgPSBidCwgc3QuZiA9IGZpbmFsO1xuICAgICAgICBpZiAobG0pXG4gICAgICAgICAgICBmaW5hbCA9IDEsIHN0Lm0gPSBsYnQsIHN0LmQgPSBkbSwgc3QubiA9IGRidDtcbiAgICB9IHdoaWxlICghZmluYWwpO1xuICAgIC8vIGRvbid0IHJlYWxsb2NhdGUgZm9yIHN0cmVhbXMgb3IgdXNlciBidWZmZXJzXG4gICAgcmV0dXJuIGJ0ICE9IGJ1Zi5sZW5ndGggJiYgbm9CdWYgPyBzbGMoYnVmLCAwLCBidCkgOiBidWYuc3ViYXJyYXkoMCwgYnQpO1xufTtcbi8vIHN0YXJ0aW5nIGF0IHAsIHdyaXRlIHRoZSBtaW5pbXVtIG51bWJlciBvZiBiaXRzIHRoYXQgY2FuIGhvbGQgdiB0byBkXG52YXIgd2JpdHMgPSBmdW5jdGlvbiAoZCwgcCwgdikge1xuICAgIHYgPDw9IHAgJiA3O1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgZFtvXSB8PSB2O1xuICAgIGRbbyArIDFdIHw9IHYgPj4gODtcbn07XG4vLyBzdGFydGluZyBhdCBwLCB3cml0ZSB0aGUgbWluaW11bSBudW1iZXIgb2YgYml0cyAoPjgpIHRoYXQgY2FuIGhvbGQgdiB0byBkXG52YXIgd2JpdHMxNiA9IGZ1bmN0aW9uIChkLCBwLCB2KSB7XG4gICAgdiA8PD0gcCAmIDc7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICBkW29dIHw9IHY7XG4gICAgZFtvICsgMV0gfD0gdiA+PiA4O1xuICAgIGRbbyArIDJdIHw9IHYgPj4gMTY7XG59O1xuLy8gY3JlYXRlcyBjb2RlIGxlbmd0aHMgZnJvbSBhIGZyZXF1ZW5jeSB0YWJsZVxudmFyIGhUcmVlID0gZnVuY3Rpb24gKGQsIG1iKSB7XG4gICAgLy8gTmVlZCBleHRyYSBpbmZvIHRvIG1ha2UgYSB0cmVlXG4gICAgdmFyIHQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGRbaV0pXG4gICAgICAgICAgICB0LnB1c2goeyBzOiBpLCBmOiBkW2ldIH0pO1xuICAgIH1cbiAgICB2YXIgcyA9IHQubGVuZ3RoO1xuICAgIHZhciB0MiA9IHQuc2xpY2UoKTtcbiAgICBpZiAoIXMpXG4gICAgICAgIHJldHVybiB7IHQ6IGV0LCBsOiAwIH07XG4gICAgaWYgKHMgPT0gMSkge1xuICAgICAgICB2YXIgdiA9IG5ldyB1OCh0WzBdLnMgKyAxKTtcbiAgICAgICAgdlt0WzBdLnNdID0gMTtcbiAgICAgICAgcmV0dXJuIHsgdDogdiwgbDogMSB9O1xuICAgIH1cbiAgICB0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEuZiAtIGIuZjsgfSk7XG4gICAgLy8gYWZ0ZXIgaTIgcmVhY2hlcyBsYXN0IGluZCwgd2lsbCBiZSBzdG9wcGVkXG4gICAgLy8gZnJlcSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBsYXJnZXN0IHBvc3NpYmxlIG51bWJlciBvZiBzeW1ib2xzXG4gICAgdC5wdXNoKHsgczogLTEsIGY6IDI1MDAxIH0pO1xuICAgIHZhciBsID0gdFswXSwgciA9IHRbMV0sIGkwID0gMCwgaTEgPSAxLCBpMiA9IDI7XG4gICAgdFswXSA9IHsgczogLTEsIGY6IGwuZiArIHIuZiwgbDogbCwgcjogciB9O1xuICAgIC8vIGVmZmljaWVudCBhbGdvcml0aG0gZnJvbSBVWklQLmpzXG4gICAgLy8gaTAgaXMgbG9va2JlaGluZCwgaTIgaXMgbG9va2FoZWFkIC0gYWZ0ZXIgcHJvY2Vzc2luZyB0d28gbG93LWZyZXFcbiAgICAvLyBzeW1ib2xzIHRoYXQgY29tYmluZWQgaGF2ZSBoaWdoIGZyZXEsIHdpbGwgc3RhcnQgcHJvY2Vzc2luZyBpMiAoaGlnaC1mcmVxLFxuICAgIC8vIG5vbi1jb21wb3NpdGUpIHN5bWJvbHMgaW5zdGVhZFxuICAgIC8vIHNlZSBodHRwczovL3JlZGRpdC5jb20vci9waG90b3BlYS9jb21tZW50cy9pa2VraHQvdXppcGpzX3F1ZXN0aW9ucy9cbiAgICB3aGlsZSAoaTEgIT0gcyAtIDEpIHtcbiAgICAgICAgbCA9IHRbdFtpMF0uZiA8IHRbaTJdLmYgPyBpMCsrIDogaTIrK107XG4gICAgICAgIHIgPSB0W2kwICE9IGkxICYmIHRbaTBdLmYgPCB0W2kyXS5mID8gaTArKyA6IGkyKytdO1xuICAgICAgICB0W2kxKytdID0geyBzOiAtMSwgZjogbC5mICsgci5mLCBsOiBsLCByOiByIH07XG4gICAgfVxuICAgIHZhciBtYXhTeW0gPSB0MlswXS5zO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgczsgKytpKSB7XG4gICAgICAgIGlmICh0MltpXS5zID4gbWF4U3ltKVxuICAgICAgICAgICAgbWF4U3ltID0gdDJbaV0ucztcbiAgICB9XG4gICAgLy8gY29kZSBsZW5ndGhzXG4gICAgdmFyIHRyID0gbmV3IHUxNihtYXhTeW0gKyAxKTtcbiAgICAvLyBtYXggYml0cyBpbiB0cmVlXG4gICAgdmFyIG1idCA9IGxuKHRbaTEgLSAxXSwgdHIsIDApO1xuICAgIGlmIChtYnQgPiBtYikge1xuICAgICAgICAvLyBtb3JlIGFsZ29yaXRobXMgZnJvbSBVWklQLmpzXG4gICAgICAgIC8vIFRPRE86IGZpbmQgb3V0IGhvdyB0aGlzIGNvZGUgd29ya3MgKGRlYnQpXG4gICAgICAgIC8vICBpbmQgICAgZGVidFxuICAgICAgICB2YXIgaSA9IDAsIGR0ID0gMDtcbiAgICAgICAgLy8gICAgbGVmdCAgICAgICAgICAgIGNvc3RcbiAgICAgICAgdmFyIGxmdCA9IG1idCAtIG1iLCBjc3QgPSAxIDw8IGxmdDtcbiAgICAgICAgdDIuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gdHJbYi5zXSAtIHRyW2Euc10gfHwgYS5mIC0gYi5mOyB9KTtcbiAgICAgICAgZm9yICg7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBpMl8xID0gdDJbaV0ucztcbiAgICAgICAgICAgIGlmICh0cltpMl8xXSA+IG1iKSB7XG4gICAgICAgICAgICAgICAgZHQgKz0gY3N0IC0gKDEgPDwgKG1idCAtIHRyW2kyXzFdKSk7XG4gICAgICAgICAgICAgICAgdHJbaTJfMV0gPSBtYjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkdCA+Pj0gbGZ0O1xuICAgICAgICB3aGlsZSAoZHQgPiAwKSB7XG4gICAgICAgICAgICB2YXIgaTJfMiA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfMl0gPCBtYilcbiAgICAgICAgICAgICAgICBkdCAtPSAxIDw8IChtYiAtIHRyW2kyXzJdKysgLSAxKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGkgPj0gMCAmJiBkdDsgLS1pKSB7XG4gICAgICAgICAgICB2YXIgaTJfMyA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfM10gPT0gbWIpIHtcbiAgICAgICAgICAgICAgICAtLXRyW2kyXzNdO1xuICAgICAgICAgICAgICAgICsrZHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbWJ0ID0gbWI7XG4gICAgfVxuICAgIHJldHVybiB7IHQ6IG5ldyB1OCh0ciksIGw6IG1idCB9O1xufTtcbi8vIGdldCB0aGUgbWF4IGxlbmd0aCBhbmQgYXNzaWduIGxlbmd0aCBjb2Rlc1xudmFyIGxuID0gZnVuY3Rpb24gKG4sIGwsIGQpIHtcbiAgICByZXR1cm4gbi5zID09IC0xXG4gICAgICAgID8gTWF0aC5tYXgobG4obi5sLCBsLCBkICsgMSksIGxuKG4uciwgbCwgZCArIDEpKVxuICAgICAgICA6IChsW24uc10gPSBkKTtcbn07XG4vLyBsZW5ndGggY29kZXMgZ2VuZXJhdGlvblxudmFyIGxjID0gZnVuY3Rpb24gKGMpIHtcbiAgICB2YXIgcyA9IGMubGVuZ3RoO1xuICAgIC8vIE5vdGUgdGhhdCB0aGUgc2VtaWNvbG9uIHdhcyBpbnRlbnRpb25hbFxuICAgIHdoaWxlIChzICYmICFjWy0tc10pXG4gICAgICAgIDtcbiAgICB2YXIgY2wgPSBuZXcgdTE2KCsrcyk7XG4gICAgLy8gIGluZCAgICAgIG51bSAgICAgICAgIHN0cmVha1xuICAgIHZhciBjbGkgPSAwLCBjbG4gPSBjWzBdLCBjbHMgPSAxO1xuICAgIHZhciB3ID0gZnVuY3Rpb24gKHYpIHsgY2xbY2xpKytdID0gdjsgfTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBzOyArK2kpIHtcbiAgICAgICAgaWYgKGNbaV0gPT0gY2xuICYmIGkgIT0gcylcbiAgICAgICAgICAgICsrY2xzO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghY2xuICYmIGNscyA+IDIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKDsgY2xzID4gMTM4OyBjbHMgLT0gMTM4KVxuICAgICAgICAgICAgICAgICAgICB3KDMyNzU0KTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzID4gMikge1xuICAgICAgICAgICAgICAgICAgICB3KGNscyA+IDEwID8gKChjbHMgLSAxMSkgPDwgNSkgfCAyODY5MCA6ICgoY2xzIC0gMykgPDwgNSkgfCAxMjMwNSk7XG4gICAgICAgICAgICAgICAgICAgIGNscyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2xzID4gMykge1xuICAgICAgICAgICAgICAgIHcoY2xuKSwgLS1jbHM7XG4gICAgICAgICAgICAgICAgZm9yICg7IGNscyA+IDY7IGNscyAtPSA2KVxuICAgICAgICAgICAgICAgICAgICB3KDgzMDQpO1xuICAgICAgICAgICAgICAgIGlmIChjbHMgPiAyKVxuICAgICAgICAgICAgICAgICAgICB3KCgoY2xzIC0gMykgPDwgNSkgfCA4MjA4KSwgY2xzID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChjbHMtLSlcbiAgICAgICAgICAgICAgICB3KGNsbik7XG4gICAgICAgICAgICBjbHMgPSAxO1xuICAgICAgICAgICAgY2xuID0gY1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBjOiBjbC5zdWJhcnJheSgwLCBjbGkpLCBuOiBzIH07XG59O1xuLy8gY2FsY3VsYXRlIHRoZSBsZW5ndGggb2Ygb3V0cHV0IGZyb20gdHJlZSwgY29kZSBsZW5ndGhzXG52YXIgY2xlbiA9IGZ1bmN0aW9uIChjZiwgY2wpIHtcbiAgICB2YXIgbCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbC5sZW5ndGg7ICsraSlcbiAgICAgICAgbCArPSBjZltpXSAqIGNsW2ldO1xuICAgIHJldHVybiBsO1xufTtcbi8vIHdyaXRlcyBhIGZpeGVkIGJsb2NrXG4vLyByZXR1cm5zIHRoZSBuZXcgYml0IHBvc1xudmFyIHdmYmxrID0gZnVuY3Rpb24gKG91dCwgcG9zLCBkYXQpIHtcbiAgICAvLyBubyBuZWVkIHRvIHdyaXRlIDAwIGFzIHR5cGU6IFR5cGVkQXJyYXkgZGVmYXVsdHMgdG8gMFxuICAgIHZhciBzID0gZGF0Lmxlbmd0aDtcbiAgICB2YXIgbyA9IHNoZnQocG9zICsgMik7XG4gICAgb3V0W29dID0gcyAmIDI1NTtcbiAgICBvdXRbbyArIDFdID0gcyA+PiA4O1xuICAgIG91dFtvICsgMl0gPSBvdXRbb10gXiAyNTU7XG4gICAgb3V0W28gKyAzXSA9IG91dFtvICsgMV0gXiAyNTU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyArK2kpXG4gICAgICAgIG91dFtvICsgaSArIDRdID0gZGF0W2ldO1xuICAgIHJldHVybiAobyArIDQgKyBzKSAqIDg7XG59O1xuLy8gd3JpdGVzIGEgYmxvY2tcbnZhciB3YmxrID0gZnVuY3Rpb24gKGRhdCwgb3V0LCBmaW5hbCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBibCwgcCkge1xuICAgIHdiaXRzKG91dCwgcCsrLCBmaW5hbCk7XG4gICAgKytsZlsyNTZdO1xuICAgIHZhciBfYSA9IGhUcmVlKGxmLCAxNSksIGRsdCA9IF9hLnQsIG1sYiA9IF9hLmw7XG4gICAgdmFyIF9iID0gaFRyZWUoZGYsIDE1KSwgZGR0ID0gX2IudCwgbWRiID0gX2IubDtcbiAgICB2YXIgX2MgPSBsYyhkbHQpLCBsY2x0ID0gX2MuYywgbmxjID0gX2MubjtcbiAgICB2YXIgX2QgPSBsYyhkZHQpLCBsY2R0ID0gX2QuYywgbmRjID0gX2QubjtcbiAgICB2YXIgbGNmcmVxID0gbmV3IHUxNigxOSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsY2x0Lmxlbmd0aDsgKytpKVxuICAgICAgICArK2xjZnJlcVtsY2x0W2ldICYgMzFdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGNkdC5sZW5ndGg7ICsraSlcbiAgICAgICAgKytsY2ZyZXFbbGNkdFtpXSAmIDMxXTtcbiAgICB2YXIgX2UgPSBoVHJlZShsY2ZyZXEsIDcpLCBsY3QgPSBfZS50LCBtbGNiID0gX2UubDtcbiAgICB2YXIgbmxjYyA9IDE5O1xuICAgIGZvciAoOyBubGNjID4gNCAmJiAhbGN0W2NsaW1bbmxjYyAtIDFdXTsgLS1ubGNjKVxuICAgICAgICA7XG4gICAgdmFyIGZsZW4gPSAoYmwgKyA1KSA8PCAzO1xuICAgIHZhciBmdGxlbiA9IGNsZW4obGYsIGZsdCkgKyBjbGVuKGRmLCBmZHQpICsgZWI7XG4gICAgdmFyIGR0bGVuID0gY2xlbihsZiwgZGx0KSArIGNsZW4oZGYsIGRkdCkgKyBlYiArIDE0ICsgMyAqIG5sY2MgKyBjbGVuKGxjZnJlcSwgbGN0KSArIDIgKiBsY2ZyZXFbMTZdICsgMyAqIGxjZnJlcVsxN10gKyA3ICogbGNmcmVxWzE4XTtcbiAgICBpZiAoYnMgPj0gMCAmJiBmbGVuIDw9IGZ0bGVuICYmIGZsZW4gPD0gZHRsZW4pXG4gICAgICAgIHJldHVybiB3ZmJsayhvdXQsIHAsIGRhdC5zdWJhcnJheShicywgYnMgKyBibCkpO1xuICAgIHZhciBsbSwgbGwsIGRtLCBkbDtcbiAgICB3Yml0cyhvdXQsIHAsIDEgKyAoZHRsZW4gPCBmdGxlbikpLCBwICs9IDI7XG4gICAgaWYgKGR0bGVuIDwgZnRsZW4pIHtcbiAgICAgICAgbG0gPSBoTWFwKGRsdCwgbWxiLCAwKSwgbGwgPSBkbHQsIGRtID0gaE1hcChkZHQsIG1kYiwgMCksIGRsID0gZGR0O1xuICAgICAgICB2YXIgbGxtID0gaE1hcChsY3QsIG1sY2IsIDApO1xuICAgICAgICB3Yml0cyhvdXQsIHAsIG5sYyAtIDI1Nyk7XG4gICAgICAgIHdiaXRzKG91dCwgcCArIDUsIG5kYyAtIDEpO1xuICAgICAgICB3Yml0cyhvdXQsIHAgKyAxMCwgbmxjYyAtIDQpO1xuICAgICAgICBwICs9IDE0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5sY2M7ICsraSlcbiAgICAgICAgICAgIHdiaXRzKG91dCwgcCArIDMgKiBpLCBsY3RbY2xpbVtpXV0pO1xuICAgICAgICBwICs9IDMgKiBubGNjO1xuICAgICAgICB2YXIgbGN0cyA9IFtsY2x0LCBsY2R0XTtcbiAgICAgICAgZm9yICh2YXIgaXQgPSAwOyBpdCA8IDI7ICsraXQpIHtcbiAgICAgICAgICAgIHZhciBjbGN0ID0gbGN0c1tpdF07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsY3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVuID0gY2xjdFtpXSAmIDMxO1xuICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgbGxtW2xlbl0pLCBwICs9IGxjdFtsZW5dO1xuICAgICAgICAgICAgICAgIGlmIChsZW4gPiAxNSlcbiAgICAgICAgICAgICAgICAgICAgd2JpdHMob3V0LCBwLCAoY2xjdFtpXSA+PiA1KSAmIDEyNyksIHAgKz0gY2xjdFtpXSA+PiAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbG0gPSBmbG0sIGxsID0gZmx0LCBkbSA9IGZkbSwgZGwgPSBmZHQ7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGk7ICsraSkge1xuICAgICAgICB2YXIgc3ltID0gc3ltc1tpXTtcbiAgICAgICAgaWYgKHN5bSA+IDI1NSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IChzeW0gPj4gMTgpICYgMzE7XG4gICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgbG1bbGVuICsgMjU3XSksIHAgKz0gbGxbbGVuICsgMjU3XTtcbiAgICAgICAgICAgIGlmIChsZW4gPiA3KVxuICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgKHN5bSA+PiAyMykgJiAzMSksIHAgKz0gZmxlYltsZW5dO1xuICAgICAgICAgICAgdmFyIGRzdCA9IHN5bSAmIDMxO1xuICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIGRtW2RzdF0pLCBwICs9IGRsW2RzdF07XG4gICAgICAgICAgICBpZiAoZHN0ID4gMylcbiAgICAgICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgKHN5bSA+PiA1KSAmIDgxOTEpLCBwICs9IGZkZWJbZHN0XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBsbVtzeW1dKSwgcCArPSBsbFtzeW1dO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdiaXRzMTYob3V0LCBwLCBsbVsyNTZdKTtcbiAgICByZXR1cm4gcCArIGxsWzI1Nl07XG59O1xuLy8gZGVmbGF0ZSBvcHRpb25zIChuaWNlIDw8IDEzKSB8IGNoYWluXG52YXIgZGVvID0gLyojX19QVVJFX18qLyBuZXcgaTMyKFs2NTU0MCwgMTMxMDgwLCAxMzEwODgsIDEzMTEwNCwgMjYyMTc2LCAxMDQ4NzA0LCAxMDQ4ODMyLCAyMTE0NTYwLCAyMTE3NjMyXSk7XG4vLyBlbXB0eVxudmFyIGV0ID0gLyojX19QVVJFX18qLyBuZXcgdTgoMCk7XG4vLyBjb21wcmVzc2VzIGRhdGEgaW50byBhIHJhdyBERUZMQVRFIGJ1ZmZlclxudmFyIGRmbHQgPSBmdW5jdGlvbiAoZGF0LCBsdmwsIHBsdmwsIHByZSwgcG9zdCwgc3QpIHtcbiAgICB2YXIgcyA9IHN0LnogfHwgZGF0Lmxlbmd0aDtcbiAgICB2YXIgbyA9IG5ldyB1OChwcmUgKyBzICsgNSAqICgxICsgTWF0aC5jZWlsKHMgLyA3MDAwKSkgKyBwb3N0KTtcbiAgICAvLyB3cml0aW5nIHRvIHRoaXMgd3JpdGVzIHRvIHRoZSBvdXRwdXQgYnVmZmVyXG4gICAgdmFyIHcgPSBvLnN1YmFycmF5KHByZSwgby5sZW5ndGggLSBwb3N0KTtcbiAgICB2YXIgbHN0ID0gc3QubDtcbiAgICB2YXIgcG9zID0gKHN0LnIgfHwgMCkgJiA3O1xuICAgIGlmIChsdmwpIHtcbiAgICAgICAgaWYgKHBvcylcbiAgICAgICAgICAgIHdbMF0gPSBzdC5yID4+IDM7XG4gICAgICAgIHZhciBvcHQgPSBkZW9bbHZsIC0gMV07XG4gICAgICAgIHZhciBuID0gb3B0ID4+IDEzLCBjID0gb3B0ICYgODE5MTtcbiAgICAgICAgdmFyIG1za18xID0gKDEgPDwgcGx2bCkgLSAxO1xuICAgICAgICAvLyAgICBwcmV2IDItYnl0ZSB2YWwgbWFwICAgIGN1cnIgMi1ieXRlIHZhbCBtYXBcbiAgICAgICAgdmFyIHByZXYgPSBzdC5wIHx8IG5ldyB1MTYoMzI3NjgpLCBoZWFkID0gc3QuaCB8fCBuZXcgdTE2KG1za18xICsgMSk7XG4gICAgICAgIHZhciBiczFfMSA9IE1hdGguY2VpbChwbHZsIC8gMyksIGJzMl8xID0gMiAqIGJzMV8xO1xuICAgICAgICB2YXIgaHNoID0gZnVuY3Rpb24gKGkpIHsgcmV0dXJuIChkYXRbaV0gXiAoZGF0W2kgKyAxXSA8PCBiczFfMSkgXiAoZGF0W2kgKyAyXSA8PCBiczJfMSkpICYgbXNrXzE7IH07XG4gICAgICAgIC8vIDI0NTc2IGlzIGFuIGFyYml0cmFyeSBudW1iZXIgb2YgbWF4aW11bSBzeW1ib2xzIHBlciBibG9ja1xuICAgICAgICAvLyA0MjQgYnVmZmVyIGZvciBsYXN0IGJsb2NrXG4gICAgICAgIHZhciBzeW1zID0gbmV3IGkzMigyNTAwMCk7XG4gICAgICAgIC8vIGxlbmd0aC9saXRlcmFsIGZyZXEgICBkaXN0YW5jZSBmcmVxXG4gICAgICAgIHZhciBsZiA9IG5ldyB1MTYoMjg4KSwgZGYgPSBuZXcgdTE2KDMyKTtcbiAgICAgICAgLy8gIGwvbGNudCAgZXhiaXRzICBpbmRleCAgICAgICAgICBsL2xpbmQgIHdhaXRkeCAgICAgICAgICBibGtwb3NcbiAgICAgICAgdmFyIGxjXzEgPSAwLCBlYiA9IDAsIGkgPSBzdC5pIHx8IDAsIGxpID0gMCwgd2kgPSBzdC53IHx8IDAsIGJzID0gMDtcbiAgICAgICAgZm9yICg7IGkgKyAyIDwgczsgKytpKSB7XG4gICAgICAgICAgICAvLyBoYXNoIHZhbHVlXG4gICAgICAgICAgICB2YXIgaHYgPSBoc2goaSk7XG4gICAgICAgICAgICAvLyBpbmRleCBtb2QgMzI3NjggICAgcHJldmlvdXMgaW5kZXggbW9kXG4gICAgICAgICAgICB2YXIgaW1vZCA9IGkgJiAzMjc2NywgcGltb2QgPSBoZWFkW2h2XTtcbiAgICAgICAgICAgIHByZXZbaW1vZF0gPSBwaW1vZDtcbiAgICAgICAgICAgIGhlYWRbaHZdID0gaW1vZDtcbiAgICAgICAgICAgIC8vIFdlIGFsd2F5cyBzaG91bGQgbW9kaWZ5IGhlYWQgYW5kIHByZXYsIGJ1dCBvbmx5IGFkZCBzeW1ib2xzIGlmXG4gICAgICAgICAgICAvLyB0aGlzIGRhdGEgaXMgbm90IHlldCBwcm9jZXNzZWQgKFwid2FpdFwiIGZvciB3YWl0IGluZGV4KVxuICAgICAgICAgICAgaWYgKHdpIDw9IGkpIHtcbiAgICAgICAgICAgICAgICAvLyBieXRlcyByZW1haW5pbmdcbiAgICAgICAgICAgICAgICB2YXIgcmVtID0gcyAtIGk7XG4gICAgICAgICAgICAgICAgaWYgKChsY18xID4gNzAwMCB8fCBsaSA+IDI0NTc2KSAmJiAocmVtID4gNDIzIHx8ICFsc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvcyA9IHdibGsoZGF0LCB3LCAwLCBzeW1zLCBsZiwgZGYsIGViLCBsaSwgYnMsIGkgLSBicywgcG9zKTtcbiAgICAgICAgICAgICAgICAgICAgbGkgPSBsY18xID0gZWIgPSAwLCBicyA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjg2OyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBsZltqXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMzA7ICsrailcbiAgICAgICAgICAgICAgICAgICAgICAgIGRmW2pdID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gIGxlbiAgICBkaXN0ICAgY2hhaW5cbiAgICAgICAgICAgICAgICB2YXIgbCA9IDIsIGQgPSAwLCBjaF8xID0gYywgZGlmID0gaW1vZCAtIHBpbW9kICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgaWYgKHJlbSA+IDIgJiYgaHYgPT0gaHNoKGkgLSBkaWYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhuID0gTWF0aC5taW4obiwgcmVtKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhkID0gTWF0aC5taW4oMzI3NjcsIGkpO1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXggcG9zc2libGUgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCBjYXBwZWQgYXQgZGlmIGJlY2F1c2UgZGVjb21wcmVzc29ycyBpbXBsZW1lbnQgXCJyb2xsaW5nXCIgaW5kZXggcG9wdWxhdGlvblxuICAgICAgICAgICAgICAgICAgICB2YXIgbWwgPSBNYXRoLm1pbigyNTgsIHJlbSk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChkaWYgPD0gbWF4ZCAmJiAtLWNoXzEgJiYgaW1vZCAhPSBwaW1vZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdFtpICsgbF0gPT0gZGF0W2kgKyBsIC0gZGlmXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBubCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IG5sIDwgbWwgJiYgZGF0W2kgKyBubF0gPT0gZGF0W2kgKyBubCAtIGRpZl07ICsrbmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmwgPiBsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBubCwgZCA9IGRpZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWsgb3V0IGVhcmx5IHdoZW4gd2UgcmVhY2ggXCJuaWNlXCIgKHdlIGFyZSBzYXRpc2ZpZWQgZW5vdWdoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmwgPiBtYXhuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdywgZmluZCB0aGUgcmFyZXN0IDItYnl0ZSBzZXF1ZW5jZSB3aXRoaW4gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZW5ndGggb2YgbGl0ZXJhbHMgYW5kIHNlYXJjaCBmb3IgdGhhdCBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNdWNoIGZhc3RlciB0aGFuIGp1c3QgdXNpbmcgdGhlIHN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtbWQgPSBNYXRoLm1pbihkaWYsIG5sIC0gMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbW1kOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aSA9IGkgLSBkaWYgKyBqICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHRpID0gcHJldlt0aV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2QgPSB0aSAtIHB0aSAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNkID4gbWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWQgPSBjZCwgcGltb2QgPSB0aTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoZSBwcmV2aW91cyBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1vZCA9IHBpbW9kLCBwaW1vZCA9IHByZXZbaW1vZF07XG4gICAgICAgICAgICAgICAgICAgICAgICBkaWYgKz0gaW1vZCAtIHBpbW9kICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZCB3aWxsIGJlIG5vbnplcm8gb25seSB3aGVuIGEgbWF0Y2ggd2FzIGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgYm90aCBkaXN0IGFuZCBsZW4gZGF0YSBpbiBvbmUgaW50MzJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoaXMgaXMgcmVjb2duaXplZCBhcyBhIGxlbi9kaXN0IHdpdGggMjh0aCBiaXQgKDJeMjgpXG4gICAgICAgICAgICAgICAgICAgIHN5bXNbbGkrK10gPSAyNjg0MzU0NTYgfCAocmV2ZmxbbF0gPDwgMTgpIHwgcmV2ZmRbZF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW4gPSByZXZmbFtsXSAmIDMxLCBkaW4gPSByZXZmZFtkXSAmIDMxO1xuICAgICAgICAgICAgICAgICAgICBlYiArPSBmbGViW2xpbl0gKyBmZGViW2Rpbl07XG4gICAgICAgICAgICAgICAgICAgICsrbGZbMjU3ICsgbGluXTtcbiAgICAgICAgICAgICAgICAgICAgKytkZltkaW5dO1xuICAgICAgICAgICAgICAgICAgICB3aSA9IGkgKyBsO1xuICAgICAgICAgICAgICAgICAgICArK2xjXzE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzeW1zW2xpKytdID0gZGF0W2ldO1xuICAgICAgICAgICAgICAgICAgICArK2xmW2RhdFtpXV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IE1hdGgubWF4KGksIHdpKTsgaSA8IHM7ICsraSkge1xuICAgICAgICAgICAgc3ltc1tsaSsrXSA9IGRhdFtpXTtcbiAgICAgICAgICAgICsrbGZbZGF0W2ldXTtcbiAgICAgICAgfVxuICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgbHN0LCBzeW1zLCBsZiwgZGYsIGViLCBsaSwgYnMsIGkgLSBicywgcG9zKTtcbiAgICAgICAgaWYgKCFsc3QpIHtcbiAgICAgICAgICAgIHN0LnIgPSAocG9zICYgNykgfCB3Wyhwb3MgLyA4KSB8IDBdIDw8IDM7XG4gICAgICAgICAgICAvLyBzaGZ0KHBvcykgbm93IDEgbGVzcyBpZiBwb3MgJiA3ICE9IDBcbiAgICAgICAgICAgIHBvcyAtPSA3O1xuICAgICAgICAgICAgc3QuaCA9IGhlYWQsIHN0LnAgPSBwcmV2LCBzdC5pID0gaSwgc3QudyA9IHdpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gc3QudyB8fCAwOyBpIDwgcyArIGxzdDsgaSArPSA2NTUzNSkge1xuICAgICAgICAgICAgLy8gZW5kXG4gICAgICAgICAgICB2YXIgZSA9IGkgKyA2NTUzNTtcbiAgICAgICAgICAgIGlmIChlID49IHMpIHtcbiAgICAgICAgICAgICAgICAvLyB3cml0ZSBmaW5hbCBibG9ja1xuICAgICAgICAgICAgICAgIHdbKHBvcyAvIDgpIHwgMF0gPSBsc3Q7XG4gICAgICAgICAgICAgICAgZSA9IHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3MgPSB3ZmJsayh3LCBwb3MgKyAxLCBkYXQuc3ViYXJyYXkoaSwgZSkpO1xuICAgICAgICB9XG4gICAgICAgIHN0LmkgPSBzO1xuICAgIH1cbiAgICByZXR1cm4gc2xjKG8sIDAsIHByZSArIHNoZnQocG9zKSArIHBvc3QpO1xufTtcbi8vIENSQzMyIHRhYmxlXG52YXIgY3JjdCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdCA9IG5ldyBJbnQzMkFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgICAgICB2YXIgYyA9IGksIGsgPSA5O1xuICAgICAgICB3aGlsZSAoLS1rKVxuICAgICAgICAgICAgYyA9ICgoYyAmIDEpICYmIC0zMDY2NzQ5MTIpIF4gKGMgPj4+IDEpO1xuICAgICAgICB0W2ldID0gYztcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG59KSgpO1xuLy8gQ1JDMzJcbnZhciBjcmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGMgPSAtMTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgLy8gY2xvc3VyZXMgaGF2ZSBhd2Z1bCBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgdmFyIGNyID0gYztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjciA9IGNyY3RbKGNyICYgMjU1KSBeIGRbaV1dIF4gKGNyID4+PiA4KTtcbiAgICAgICAgICAgIGMgPSBjcjtcbiAgICAgICAgfSxcbiAgICAgICAgZDogZnVuY3Rpb24gKCkgeyByZXR1cm4gfmM7IH1cbiAgICB9O1xufTtcbi8vIEFkbGVyMzJcbnZhciBhZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYSA9IDEsIGIgPSAwO1xuICAgIHJldHVybiB7XG4gICAgICAgIHA6IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAvLyBjbG9zdXJlcyBoYXZlIGF3ZnVsIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICB2YXIgbiA9IGEsIG0gPSBiO1xuICAgICAgICAgICAgdmFyIGwgPSBkLmxlbmd0aCB8IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSAhPSBsOykge1xuICAgICAgICAgICAgICAgIHZhciBlID0gTWF0aC5taW4oaSArIDI2NTUsIGwpO1xuICAgICAgICAgICAgICAgIGZvciAoOyBpIDwgZTsgKytpKVxuICAgICAgICAgICAgICAgICAgICBtICs9IG4gKz0gZFtpXTtcbiAgICAgICAgICAgICAgICBuID0gKG4gJiA2NTUzNSkgKyAxNSAqIChuID4+IDE2KSwgbSA9IChtICYgNjU1MzUpICsgMTUgKiAobSA+PiAxNik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhID0gbiwgYiA9IG07XG4gICAgICAgIH0sXG4gICAgICAgIGQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGEgJT0gNjU1MjEsIGIgJT0gNjU1MjE7XG4gICAgICAgICAgICByZXR1cm4gKGEgJiAyNTUpIDw8IDI0IHwgKGEgJiAweEZGMDApIDw8IDggfCAoYiAmIDI1NSkgPDwgOCB8IChiID4+IDgpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG47XG4vLyBkZWZsYXRlIHdpdGggb3B0c1xudmFyIGRvcHQgPSBmdW5jdGlvbiAoZGF0LCBvcHQsIHByZSwgcG9zdCwgc3QpIHtcbiAgICBpZiAoIXN0KSB7XG4gICAgICAgIHN0ID0geyBsOiAxIH07XG4gICAgICAgIGlmIChvcHQuZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIGRpY3QgPSBvcHQuZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpO1xuICAgICAgICAgICAgdmFyIG5ld0RhdCA9IG5ldyB1OChkaWN0Lmxlbmd0aCArIGRhdC5sZW5ndGgpO1xuICAgICAgICAgICAgbmV3RGF0LnNldChkaWN0KTtcbiAgICAgICAgICAgIG5ld0RhdC5zZXQoZGF0LCBkaWN0Lmxlbmd0aCk7XG4gICAgICAgICAgICBkYXQgPSBuZXdEYXQ7XG4gICAgICAgICAgICBzdC53ID0gZGljdC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRmbHQoZGF0LCBvcHQubGV2ZWwgPT0gbnVsbCA/IDYgOiBvcHQubGV2ZWwsIG9wdC5tZW0gPT0gbnVsbCA/IChzdC5sID8gTWF0aC5jZWlsKE1hdGgubWF4KDgsIE1hdGgubWluKDEzLCBNYXRoLmxvZyhkYXQubGVuZ3RoKSkpICogMS41KSA6IDIwKSA6ICgxMiArIG9wdC5tZW0pLCBwcmUsIHBvc3QsIHN0KTtcbn07XG4vLyBXYWxtYXJ0IG9iamVjdCBzcHJlYWRcbnZhciBtcmcgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHZhciBvID0ge307XG4gICAgZm9yICh2YXIgayBpbiBhKVxuICAgICAgICBvW2tdID0gYVtrXTtcbiAgICBmb3IgKHZhciBrIGluIGIpXG4gICAgICAgIG9ba10gPSBiW2tdO1xuICAgIHJldHVybiBvO1xufTtcbi8vIHdvcmtlciBjbG9uZVxuLy8gVGhpcyBpcyBwb3NzaWJseSB0aGUgY3Jhemllc3QgcGFydCBvZiB0aGUgZW50aXJlIGNvZGViYXNlLCBkZXNwaXRlIGhvdyBzaW1wbGUgaXQgbWF5IHNlZW0uXG4vLyBUaGUgb25seSBwYXJhbWV0ZXIgdG8gdGhpcyBmdW5jdGlvbiBpcyBhIGNsb3N1cmUgdGhhdCByZXR1cm5zIGFuIGFycmF5IG9mIHZhcmlhYmxlcyBvdXRzaWRlIG9mIHRoZSBmdW5jdGlvbiBzY29wZS5cbi8vIFdlJ3JlIGdvaW5nIHRvIHRyeSB0byBmaWd1cmUgb3V0IHRoZSB2YXJpYWJsZSBuYW1lcyB1c2VkIGluIHRoZSBjbG9zdXJlIGFzIHN0cmluZ3MgYmVjYXVzZSB0aGF0IGlzIGNydWNpYWwgZm9yIHdvcmtlcml6YXRpb24uXG4vLyBXZSB3aWxsIHJldHVybiBhbiBvYmplY3QgbWFwcGluZyBvZiB0cnVlIHZhcmlhYmxlIG5hbWUgdG8gdmFsdWUgKGJhc2ljYWxseSwgdGhlIGN1cnJlbnQgc2NvcGUgYXMgYSBKUyBvYmplY3QpLlxuLy8gVGhlIHJlYXNvbiB3ZSBjYW4ndCBqdXN0IHVzZSB0aGUgb3JpZ2luYWwgdmFyaWFibGUgbmFtZXMgaXMgbWluaWZpZXJzIG1hbmdsaW5nIHRoZSB0b3BsZXZlbCBzY29wZS5cbi8vIFRoaXMgdG9vayBtZSB0aHJlZSB3ZWVrcyB0byBmaWd1cmUgb3V0IGhvdyB0byBkby5cbnZhciB3Y2xuID0gZnVuY3Rpb24gKGZuLCBmblN0ciwgdGQpIHtcbiAgICB2YXIgZHQgPSBmbigpO1xuICAgIHZhciBzdCA9IGZuLnRvU3RyaW5nKCk7XG4gICAgdmFyIGtzID0gc3Quc2xpY2Uoc3QuaW5kZXhPZignWycpICsgMSwgc3QubGFzdEluZGV4T2YoJ10nKSkucmVwbGFjZSgvXFxzKy9nLCAnJykuc3BsaXQoJywnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGR0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciB2ID0gZHRbaV0sIGsgPSBrc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGZuU3RyICs9ICc7JyArIGsgKyAnPSc7XG4gICAgICAgICAgICB2YXIgc3RfMSA9IHYudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmICh2LnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIGZvciBnbG9iYWwgb2JqZWN0c1xuICAgICAgICAgICAgICAgIGlmIChzdF8xLmluZGV4T2YoJ1tuYXRpdmUgY29kZV0nKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3BJbmQgPSBzdF8xLmluZGV4T2YoJyAnLCA4KSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGZuU3RyICs9IHN0XzEuc2xpY2Uoc3BJbmQsIHN0XzEuaW5kZXhPZignKCcsIHNwSW5kKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmblN0ciArPSBzdF8xO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB0IGluIHYucHJvdG90eXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm5TdHIgKz0gJzsnICsgayArICcucHJvdG90eXBlLicgKyB0ICsgJz0nICsgdi5wcm90b3R5cGVbdF0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm5TdHIgKz0gc3RfMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZFtrXSA9IHY7XG4gICAgfVxuICAgIHJldHVybiBmblN0cjtcbn07XG52YXIgY2ggPSBbXTtcbi8vIGNsb25lIGJ1ZnNcbnZhciBjYmZzID0gZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgdGwgPSBbXTtcbiAgICBmb3IgKHZhciBrIGluIHYpIHtcbiAgICAgICAgaWYgKHZba10uYnVmZmVyKSB7XG4gICAgICAgICAgICB0bC5wdXNoKCh2W2tdID0gbmV3IHZba10uY29uc3RydWN0b3IodltrXSkpLmJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRsO1xufTtcbi8vIHVzZSBhIHdvcmtlciB0byBleGVjdXRlIGNvZGVcbnZhciB3cmtyID0gZnVuY3Rpb24gKGZucywgaW5pdCwgaWQsIGNiKSB7XG4gICAgaWYgKCFjaFtpZF0pIHtcbiAgICAgICAgdmFyIGZuU3RyID0gJycsIHRkXzEgPSB7fSwgbSA9IGZucy5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07ICsraSlcbiAgICAgICAgICAgIGZuU3RyID0gd2NsbihmbnNbaV0sIGZuU3RyLCB0ZF8xKTtcbiAgICAgICAgY2hbaWRdID0geyBjOiB3Y2xuKGZuc1ttXSwgZm5TdHIsIHRkXzEpLCBlOiB0ZF8xIH07XG4gICAgfVxuICAgIHZhciB0ZCA9IG1yZyh7fSwgY2hbaWRdLmUpO1xuICAgIHJldHVybiB3ayhjaFtpZF0uYyArICc7b25tZXNzYWdlPWZ1bmN0aW9uKGUpe2Zvcih2YXIgayBpbiBlLmRhdGEpc2VsZltrXT1lLmRhdGFba107b25tZXNzYWdlPScgKyBpbml0LnRvU3RyaW5nKCkgKyAnfScsIGlkLCB0ZCwgY2Jmcyh0ZCksIGNiKTtcbn07XG4vLyBiYXNlIGFzeW5jIGluZmxhdGUgZm5cbnZhciBiSW5mbHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbdTgsIHUxNiwgaTMyLCBmbGViLCBmZGViLCBjbGltLCBmbCwgZmQsIGZscm0sIGZkcm0sIHJldiwgZWMsIGhNYXAsIG1heCwgYml0cywgYml0czE2LCBzaGZ0LCBzbGMsIGVyciwgaW5mbHQsIGluZmxhdGVTeW5jLCBwYmYsIGdvcHRdOyB9O1xudmFyIGJEZmx0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3U4LCB1MTYsIGkzMiwgZmxlYiwgZmRlYiwgY2xpbSwgcmV2ZmwsIHJldmZkLCBmbG0sIGZsdCwgZmRtLCBmZHQsIHJldiwgZGVvLCBldCwgaE1hcCwgd2JpdHMsIHdiaXRzMTYsIGhUcmVlLCBsbiwgbGMsIGNsZW4sIHdmYmxrLCB3YmxrLCBzaGZ0LCBzbGMsIGRmbHQsIGRvcHQsIGRlZmxhdGVTeW5jLCBwYmZdOyB9O1xuLy8gZ3ppcCBleHRyYVxudmFyIGd6ZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtnemgsIGd6aGwsIHdieXRlcywgY3JjLCBjcmN0XTsgfTtcbi8vIGd1bnppcCBleHRyYVxudmFyIGd1emUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3pzLCBnemxdOyB9O1xuLy8gemxpYiBleHRyYVxudmFyIHpsZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bGgsIHdieXRlcywgYWRsZXJdOyB9O1xuLy8gdW56bGliIGV4dHJhXG52YXIgenVsZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bHNdOyB9O1xuLy8gcG9zdCBidWZcbnZhciBwYmYgPSBmdW5jdGlvbiAobXNnKSB7IHJldHVybiBwb3N0TWVzc2FnZShtc2csIFttc2cuYnVmZmVyXSk7IH07XG4vLyBnZXQgb3B0c1xudmFyIGdvcHQgPSBmdW5jdGlvbiAobykgeyByZXR1cm4gbyAmJiB7XG4gICAgb3V0OiBvLnNpemUgJiYgbmV3IHU4KG8uc2l6ZSksXG4gICAgZGljdGlvbmFyeTogby5kaWN0aW9uYXJ5XG59OyB9O1xuLy8gYXN5bmMgaGVscGVyXG52YXIgY2JpZnkgPSBmdW5jdGlvbiAoZGF0LCBvcHRzLCBmbnMsIGluaXQsIGlkLCBjYikge1xuICAgIHZhciB3ID0gd3JrcihmbnMsIGluaXQsIGlkLCBmdW5jdGlvbiAoZXJyLCBkYXQpIHtcbiAgICAgICAgdy50ZXJtaW5hdGUoKTtcbiAgICAgICAgY2IoZXJyLCBkYXQpO1xuICAgIH0pO1xuICAgIHcucG9zdE1lc3NhZ2UoW2RhdCwgb3B0c10sIG9wdHMuY29uc3VtZSA/IFtkYXQuYnVmZmVyXSA6IFtdKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyB3LnRlcm1pbmF0ZSgpOyB9O1xufTtcbi8vIGF1dG8gc3RyZWFtXG52YXIgYXN0cm0gPSBmdW5jdGlvbiAoc3RybSkge1xuICAgIHN0cm0ub25kYXRhID0gZnVuY3Rpb24gKGRhdCwgZmluYWwpIHsgcmV0dXJuIHBvc3RNZXNzYWdlKFtkYXQsIGZpbmFsXSwgW2RhdC5idWZmZXJdKTsgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgIGlmIChldi5kYXRhWzBdKSB7XG4gICAgICAgICAgICBzdHJtLnB1c2goZXYuZGF0YVswXSwgZXYuZGF0YVsxXSk7XG4gICAgICAgICAgICBwb3N0TWVzc2FnZShbZXYuZGF0YVswXS5sZW5ndGhdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdHJtLmZsdXNoKGV2LmRhdGFbMV0pO1xuICAgIH07XG59O1xuLy8gYXN5bmMgc3RyZWFtIGF0dGFjaFxudmFyIGFzdHJtaWZ5ID0gZnVuY3Rpb24gKGZucywgc3RybSwgb3B0cywgaW5pdCwgaWQsIGZsdXNoLCBleHQpIHtcbiAgICB2YXIgdDtcbiAgICB2YXIgdyA9IHdya3IoZm5zLCBpbml0LCBpZCwgZnVuY3Rpb24gKGVyciwgZGF0KSB7XG4gICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICB3LnRlcm1pbmF0ZSgpLCBzdHJtLm9uZGF0YS5jYWxsKHN0cm0sIGVycik7XG4gICAgICAgIGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KGRhdCkpXG4gICAgICAgICAgICBleHQoZGF0KTtcbiAgICAgICAgZWxzZSBpZiAoZGF0Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICBzdHJtLnF1ZXVlZFNpemUgLT0gZGF0WzBdO1xuICAgICAgICAgICAgaWYgKHN0cm0ub25kcmFpbilcbiAgICAgICAgICAgICAgICBzdHJtLm9uZHJhaW4oZGF0WzBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkYXRbMV0pXG4gICAgICAgICAgICAgICAgdy50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgIHN0cm0ub25kYXRhLmNhbGwoc3RybSwgZXJyLCBkYXRbMF0sIGRhdFsxXSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKG9wdHMpO1xuICAgIHN0cm0ucXVldWVkU2l6ZSA9IDA7XG4gICAgc3RybS5wdXNoID0gZnVuY3Rpb24gKGQsIGYpIHtcbiAgICAgICAgaWYgKCFzdHJtLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHQpXG4gICAgICAgICAgICBzdHJtLm9uZGF0YShlcnIoNCwgMCwgMSksIG51bGwsICEhZik7XG4gICAgICAgIHN0cm0ucXVldWVkU2l6ZSArPSBkLmxlbmd0aDtcbiAgICAgICAgLy8gY2FuIGZhaWwgZm9yIGNyb3NzLXJlYWxtIFVpbnQ4QXJyYXksIGJ1dCBvayAtIG9ubHkgYSBzbWFsbCBwZXJmb3JtYW5jZSBwZW5hbHR5XG4gICAgICAgIHcucG9zdE1lc3NhZ2UoW2QsIHQgPSBmXSwgZC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA/IFtkLmJ1ZmZlcl0gOiBbXSk7XG4gICAgfTtcbiAgICBzdHJtLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbiAgICBpZiAoZmx1c2gpIHtcbiAgICAgICAgc3RybS5mbHVzaCA9IGZ1bmN0aW9uIChzeW5jKSB7IHcucG9zdE1lc3NhZ2UoWzAsIHN5bmNdKTsgfTtcbiAgICB9XG59O1xuLy8gcmVhZCAyIGJ5dGVzXG52YXIgYjIgPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gZFtiXSB8IChkW2IgKyAxXSA8PCA4KTsgfTtcbi8vIHJlYWQgNCBieXRlc1xudmFyIGI0ID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIChkW2JdIHwgKGRbYiArIDFdIDw8IDgpIHwgKGRbYiArIDJdIDw8IDE2KSB8IChkW2IgKyAzXSA8PCAyNCkpID4+PiAwOyB9O1xuLy8gcmVhZCA4IGJ5dGVzXG52YXIgYjggPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gYjQoZCwgYikgKyAoYjQoZCwgYiArIDQpICogNDI5NDk2NzI5Nik7IH07XG4vLyB3cml0ZSBieXRlc1xudmFyIHdieXRlcyA9IGZ1bmN0aW9uIChkLCBiLCB2KSB7XG4gICAgZm9yICg7IHY7ICsrYilcbiAgICAgICAgZFtiXSA9IHYsIHYgPj4+PSA4O1xufTtcbi8vIGd6aXAgaGVhZGVyXG52YXIgZ3poID0gZnVuY3Rpb24gKGMsIG8pIHtcbiAgICB2YXIgZm4gPSBvLmZpbGVuYW1lO1xuICAgIGNbMF0gPSAzMSwgY1sxXSA9IDEzOSwgY1syXSA9IDgsIGNbOF0gPSBvLmxldmVsIDwgMiA/IDQgOiBvLmxldmVsID09IDkgPyAyIDogMCwgY1s5XSA9IDM7IC8vIGFzc3VtZSBVbml4XG4gICAgaWYgKG8ubXRpbWUgIT0gMClcbiAgICAgICAgd2J5dGVzKGMsIDQsIE1hdGguZmxvb3IobmV3IERhdGUoby5tdGltZSB8fCBEYXRlLm5vdygpKSAvIDEwMDApKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgICAgY1szXSA9IDg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGZuLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgY1tpICsgMTBdID0gZm4uY2hhckNvZGVBdChpKTtcbiAgICB9XG59O1xuLy8gZ3ppcCBmb290ZXI6IC04IHRvIC00ID0gQ1JDLCAtNCB0byAtMCBpcyBsZW5ndGhcbi8vIGd6aXAgc3RhcnRcbnZhciBnenMgPSBmdW5jdGlvbiAoZCkge1xuICAgIGlmIChkWzBdICE9IDMxIHx8IGRbMV0gIT0gMTM5IHx8IGRbMl0gIT0gOClcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIGd6aXAgZGF0YScpO1xuICAgIHZhciBmbGcgPSBkWzNdO1xuICAgIHZhciBzdCA9IDEwO1xuICAgIGlmIChmbGcgJiA0KVxuICAgICAgICBzdCArPSAoZFsxMF0gfCBkWzExXSA8PCA4KSArIDI7XG4gICAgZm9yICh2YXIgenMgPSAoZmxnID4+IDMgJiAxKSArIChmbGcgPj4gNCAmIDEpOyB6cyA+IDA7IHpzIC09ICFkW3N0KytdKVxuICAgICAgICA7XG4gICAgcmV0dXJuIHN0ICsgKGZsZyAmIDIpO1xufTtcbi8vIGd6aXAgbGVuZ3RoXG52YXIgZ3psID0gZnVuY3Rpb24gKGQpIHtcbiAgICB2YXIgbCA9IGQubGVuZ3RoO1xuICAgIHJldHVybiAoZFtsIC0gNF0gfCBkW2wgLSAzXSA8PCA4IHwgZFtsIC0gMl0gPDwgMTYgfCBkW2wgLSAxXSA8PCAyNCkgPj4+IDA7XG59O1xuLy8gZ3ppcCBoZWFkZXIgbGVuZ3RoXG52YXIgZ3pobCA9IGZ1bmN0aW9uIChvKSB7IHJldHVybiAxMCArIChvLmZpbGVuYW1lID8gby5maWxlbmFtZS5sZW5ndGggKyAxIDogMCk7IH07XG4vLyB6bGliIGhlYWRlclxudmFyIHpsaCA9IGZ1bmN0aW9uIChjLCBvKSB7XG4gICAgdmFyIGx2ID0gby5sZXZlbCwgZmwgPSBsdiA9PSAwID8gMCA6IGx2IDwgNiA/IDEgOiBsdiA9PSA5ID8gMyA6IDI7XG4gICAgY1swXSA9IDEyMCwgY1sxXSA9IChmbCA8PCA2KSB8IChvLmRpY3Rpb25hcnkgJiYgMzIpO1xuICAgIGNbMV0gfD0gMzEgLSAoKGNbMF0gPDwgOCkgfCBjWzFdKSAlIDMxO1xuICAgIGlmIChvLmRpY3Rpb25hcnkpIHtcbiAgICAgICAgdmFyIGggPSBhZGxlcigpO1xuICAgICAgICBoLnAoby5kaWN0aW9uYXJ5KTtcbiAgICAgICAgd2J5dGVzKGMsIDIsIGguZCgpKTtcbiAgICB9XG59O1xuLy8gemxpYiBzdGFydFxudmFyIHpscyA9IGZ1bmN0aW9uIChkLCBkaWN0KSB7XG4gICAgaWYgKChkWzBdICYgMTUpICE9IDggfHwgKGRbMF0gPj4gNCkgPiA3IHx8ICgoZFswXSA8PCA4IHwgZFsxXSkgJSAzMSkpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCB6bGliIGRhdGEnKTtcbiAgICBpZiAoKGRbMV0gPj4gNSAmIDEpID09ICshZGljdClcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIHpsaWIgZGF0YTogJyArIChkWzFdICYgMzIgPyAnbmVlZCcgOiAndW5leHBlY3RlZCcpICsgJyBkaWN0aW9uYXJ5Jyk7XG4gICAgcmV0dXJuIChkWzFdID4+IDMgJiA0KSArIDI7XG59O1xuZnVuY3Rpb24gU3RybU9wdChvcHRzLCBjYikge1xuICAgIGlmICh0eXBlb2Ygb3B0cyA9PSAnZnVuY3Rpb24nKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgIHJldHVybiBvcHRzO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvblxuICovXG52YXIgRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZWZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0cyA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIHRoaXMubyA9IG9wdHMgfHwge307XG4gICAgICAgIHRoaXMucyA9IHsgbDogMCwgaTogMzI3NjgsIHc6IDMyNzY4LCB6OiAzMjc2OCB9O1xuICAgICAgICAvLyBCdWZmZXIgbGVuZ3RoIG11c3QgYWx3YXlzIGJlIDAgbW9kIDMyNzY4IGZvciBpbmRleCBjYWxjdWxhdGlvbnMgdG8gYmUgY29ycmVjdCB3aGVuIG1vZGlmeWluZyBoZWFkIGFuZCBwcmV2XG4gICAgICAgIC8vIDk4MzA0ID0gMzI3NjggKGxvb2tiYWNrKSArIDY1NTM2IChjb21tb24gY2h1bmsgc2l6ZSlcbiAgICAgICAgdGhpcy5iID0gbmV3IHU4KDk4MzA0KTtcbiAgICAgICAgaWYgKHRoaXMuby5kaWN0aW9uYXJ5KSB7XG4gICAgICAgICAgICB2YXIgZGljdCA9IHRoaXMuby5kaWN0aW9uYXJ5LnN1YmFycmF5KC0zMjc2OCk7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KGRpY3QsIDMyNzY4IC0gZGljdC5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5zLmkgPSAzMjc2OCAtIGRpY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIERlZmxhdGUucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB0aGlzLm9uZGF0YShkb3B0KGMsIHRoaXMubywgMCwgMCwgdGhpcy5zKSwgZik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAodGhpcy5zLmwpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHZhciBlbmRMZW4gPSBjaHVuay5sZW5ndGggKyB0aGlzLnMuejtcbiAgICAgICAgaWYgKGVuZExlbiA+IHRoaXMuYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChlbmRMZW4gPiAyICogdGhpcy5iLmxlbmd0aCAtIDMyNzY4KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0J1ZiA9IG5ldyB1OChlbmRMZW4gJiAtMzI3NjgpO1xuICAgICAgICAgICAgICAgIG5ld0J1Zi5zZXQodGhpcy5iLnN1YmFycmF5KDAsIHRoaXMucy56KSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iID0gbmV3QnVmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNwbGl0ID0gdGhpcy5iLmxlbmd0aCAtIHRoaXMucy56O1xuICAgICAgICAgICAgdGhpcy5iLnNldChjaHVuay5zdWJhcnJheSgwLCBzcGxpdCksIHRoaXMucy56KTtcbiAgICAgICAgICAgIHRoaXMucy56ID0gdGhpcy5iLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMucCh0aGlzLmIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQodGhpcy5iLnN1YmFycmF5KC0zMjc2OCkpO1xuICAgICAgICAgICAgdGhpcy5iLnNldChjaHVuay5zdWJhcnJheShzcGxpdCksIDMyNzY4KTtcbiAgICAgICAgICAgIHRoaXMucy56ID0gY2h1bmsubGVuZ3RoIC0gc3BsaXQgKyAzMjc2ODtcbiAgICAgICAgICAgIHRoaXMucy5pID0gMzI3NjYsIHRoaXMucy53ID0gMzI3Njg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KGNodW5rLCB0aGlzLnMueik7XG4gICAgICAgICAgICB0aGlzLnMueiArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zLmwgPSBmaW5hbCAmIDE7XG4gICAgICAgIGlmICh0aGlzLnMueiA+IHRoaXMucy53ICsgODE5MSB8fCBmaW5hbCkge1xuICAgICAgICAgICAgdGhpcy5wKHRoaXMuYiwgZmluYWwgfHwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zLncgPSB0aGlzLnMuaSwgdGhpcy5zLmkgLT0gMjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIC8vIGNsZWFudXAgdW5uZWVkZWQgYnVmZmVycy9zdGF0ZSB0byByZWR1Y2UgbWVtb3J5IHVzYWdlXG4gICAgICAgICAgICB0aGlzLnMgPSB0aGlzLm8gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYiA9IGV0O1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGbHVzaGVzIGJ1ZmZlcmVkIHVuY29tcHJlc3NlZCBkYXRhLiBVc2VmdWwgdG8gaW1tZWRpYXRlbHkgcmV0cmlldmUgdGhlXG4gICAgICogZGVmbGF0ZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICogQHBhcmFtIHN5bmMgV2hldGhlciB0byBmbHVzaCB0byBhIGJ5dGUgYm91bmRhcnkuIEEgc3luYyBmbHVzaCB0YWtlcyA0LTVcbiAgICAgKiAgICAgICAgICAgICBleHRyYSBieXRlcywgYnV0IGd1YXJhbnRlZXMgYWxsIHB1c2hlZCBkYXRhIGlzIGltbWVkaWF0ZWx5XG4gICAgICogICAgICAgICAgICAgZGVjb21wcmVzc2libGUuIEEgc2VwYXJhdGUgREVGTEFURSBzdHJlYW0gbWF5IGJlIGNvbmNhdGVuYXRlZFxuICAgICAqICAgICAgICAgICAgIHdpdGggdGhlIGN1cnJlbnQgb3V0cHV0IGFmdGVyIGEgc3luYyBmbHVzaC5cbiAgICAgKi9cbiAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uIChzeW5jKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLnMubClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdGhpcy5wKHRoaXMuYiwgZmFsc2UpO1xuICAgICAgICB0aGlzLnMudyA9IHRoaXMucy5pLCB0aGlzLnMuaSAtPSAyO1xuICAgICAgICAvLyBjb3VsZCB0ZWNobmljYWxseSBza2lwIHdyaXRpbmcgdGhlIHR5cGUtMCBibG9jayBmb3IgKHRoaXMucy5yICYgNykgPT0gMCxcbiAgICAgICAgLy8gYnV0IHRoZSBkZXRlcm1pbmlzdGljIHRyYWlsZXIgKDAwIDAwIEZGIEZGKSBpcyB1c2VmdWwgaW4gc29tZSBzaXR1YXRpb25zXG4gICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICB2YXIgYyA9IG5ldyB1OCg2KTtcbiAgICAgICAgICAgIGNbMF0gPSB0aGlzLnMuciA+PiAzO1xuICAgICAgICAgICAgLy8gd3JpdGUgZW1wdHksIG5vbi1maW5hbCB0eXBlLTAgYmxvY2tcbiAgICAgICAgICAgIHZhciBlcCA9IHdmYmxrKGMsIHRoaXMucy5yLCBldCk7XG4gICAgICAgICAgICB0aGlzLnMuciA9IDA7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShjLnN1YmFycmF5KDAsIGVwID4+IDMpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IERlZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0RlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNEZWZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IERlZmxhdGUoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgNiwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0RlZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNEZWZsYXRlIH07XG5leHBvcnQgZnVuY3Rpb24gZGVmbGF0ZShkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGRlZmxhdGVTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMCwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzc2VzIGRhdGEgd2l0aCBERUZMQVRFIHdpdGhvdXQgYW55IHdyYXBwZXJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGRlZmxhdGVkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmxhdGVTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gZG9wdChkYXRhLCBvcHRzIHx8IHt9LCAwLCAwKTtcbn1cbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJbmZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIC8vIG5vIFN0cm1PcHQgaGVyZSB0byBhdm9pZCBhZGRpbmcgdG8gd29ya2VyaXplclxuICAgICAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB2YXIgZGljdCA9IG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5ICYmIG9wdHMuZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpO1xuICAgICAgICB0aGlzLnMgPSB7IGk6IDAsIGI6IGRpY3QgPyBkaWN0Lmxlbmd0aCA6IDAgfTtcbiAgICAgICAgdGhpcy5vID0gbmV3IHU4KDMyNzY4KTtcbiAgICAgICAgdGhpcy5wID0gbmV3IHU4KDApO1xuICAgICAgICBpZiAoZGljdClcbiAgICAgICAgICAgIHRoaXMuby5zZXQoZGljdCk7XG4gICAgfVxuICAgIEluZmxhdGUucHJvdG90eXBlLmUgPSBmdW5jdGlvbiAoYykge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAodGhpcy5kKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICBpZiAoIXRoaXMucC5sZW5ndGgpXG4gICAgICAgICAgICB0aGlzLnAgPSBjO1xuICAgICAgICBlbHNlIGlmIChjLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGMubGVuZ3RoKTtcbiAgICAgICAgICAgIG4uc2V0KHRoaXMucCksIG4uc2V0KGMsIHRoaXMucC5sZW5ndGgpLCB0aGlzLnAgPSBuO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBJbmZsYXRlLnByb3RvdHlwZS5jID0gZnVuY3Rpb24gKGZpbmFsKSB7XG4gICAgICAgIHRoaXMucy5pID0gKyh0aGlzLmQgPSBmaW5hbCB8fCBmYWxzZSk7XG4gICAgICAgIHZhciBidHMgPSB0aGlzLnMuYjtcbiAgICAgICAgdmFyIGR0ID0gaW5mbHQodGhpcy5wLCB0aGlzLnMsIHRoaXMubyk7XG4gICAgICAgIHRoaXMub25kYXRhKHNsYyhkdCwgYnRzLCB0aGlzLnMuYiksIHRoaXMuZCk7XG4gICAgICAgIHRoaXMubyA9IHNsYyhkdCwgdGhpcy5zLmIgLSAzMjc2OCksIHRoaXMucy5iID0gdGhpcy5vLmxlbmd0aDtcbiAgICAgICAgdGhpcy5wID0gc2xjKHRoaXMucCwgKHRoaXMucy5wIC8gOCkgfCAwKSwgdGhpcy5zLnAgJj0gNztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGluZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgZmluYWwgY2h1bmtcbiAgICAgKi9cbiAgICBJbmZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmUoY2h1bmspLCB0aGlzLmMoZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIEluZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgSW5mbGF0ZSB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jSW5mbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiSW5mbHQsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGVdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgSW5mbGF0ZShldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA3LCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0luZmxhdGUgfTtcbmV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkluZmx0XG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYoaW5mbGF0ZVN5bmMoZXYuZGF0YVswXSwgZ29wdChldi5kYXRhWzFdKSkpOyB9LCAxLCBjYik7XG59XG5leHBvcnQgZnVuY3Rpb24gaW5mbGF0ZVN5bmMoZGF0YSwgb3B0cykge1xuICAgIHJldHVybiBpbmZsdChkYXRhLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLy8gYmVmb3JlIHlvdSB5ZWxsIGF0IG1lIGZvciBub3QganVzdCB1c2luZyBleHRlbmRzLCBteSByZWFzb24gaXMgdGhhdCBUUyBpbmhlcml0YW5jZSBpcyBoYXJkIHRvIHdvcmtlcml6ZS5cbi8qKlxuICogU3RyZWFtaW5nIEdaSVAgY29tcHJlc3Npb25cbiAqL1xudmFyIEd6aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gR3ppcChvcHRzLCBjYikge1xuICAgICAgICB0aGlzLmMgPSBjcmMoKTtcbiAgICAgICAgdGhpcy5sID0gMDtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgRGVmbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgR1pJUHBlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBHemlwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmMucChjaHVuayk7XG4gICAgICAgIHRoaXMubCArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgR3ppcC5wcm90b3R5cGUucCA9IGZ1bmN0aW9uIChjLCBmKSB7XG4gICAgICAgIHZhciByYXcgPSBkb3B0KGMsIHRoaXMubywgdGhpcy52ICYmIGd6aGwodGhpcy5vKSwgZiAmJiA4LCB0aGlzLnMpO1xuICAgICAgICBpZiAodGhpcy52KVxuICAgICAgICAgICAgZ3poKHJhdywgdGhpcy5vKSwgdGhpcy52ID0gMDtcbiAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gOCwgdGhpcy5jLmQoKSksIHdieXRlcyhyYXcsIHJhdy5sZW5ndGggLSA0LCB0aGlzLmwpO1xuICAgICAgICB0aGlzLm9uZGF0YShyYXcsIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIEdaSVBwZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICogQHBhcmFtIHN5bmMgV2hldGhlciB0byBmbHVzaCB0byBhIGJ5dGUgYm91bmRhcnkuIEEgc3luYyBmbHVzaCB0YWtlcyA0LTVcbiAgICAgKiAgICAgICAgICAgICBleHRyYSBieXRlcywgYnV0IGd1YXJhbnRlZXMgYWxsIHB1c2hlZCBkYXRhIGlzIGltbWVkaWF0ZWx5XG4gICAgICogICAgICAgICAgICAgZGVjb21wcmVzc2libGUuXG4gICAgICovXG4gICAgR3ppcC5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaC5jYWxsKHRoaXMsIHN5bmMpO1xuICAgIH07XG4gICAgcmV0dXJuIEd6aXA7XG59KCkpO1xuZXhwb3J0IHsgR3ppcCB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIEdaSVAgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jR3ppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0d6aXAob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICBnemUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGUsIEd6aXBdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgR3ppcChldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3ppcDtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0d6aXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBnemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkRmbHQsXG4gICAgICAgIGd6ZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6aXBTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGd6aXBTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMiwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzc2VzIGRhdGEgd2l0aCBHWklQXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBnemlwcGVkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGd6aXBTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgYyA9IGNyYygpLCBsID0gZGF0YS5sZW5ndGg7XG4gICAgYy5wKGRhdGEpO1xuICAgIHZhciBkID0gZG9wdChkYXRhLCBvcHRzLCBnemhsKG9wdHMpLCA4KSwgcyA9IGQubGVuZ3RoO1xuICAgIHJldHVybiBnemgoZCwgb3B0cyksIHdieXRlcyhkLCBzIC0gOCwgYy5kKCkpLCB3Ynl0ZXMoZCwgcyAtIDQsIGwpLCBkO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgc2luZ2xlIG9yIG11bHRpLW1lbWJlciBHWklQIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEd1bnppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBHdW56aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgdGhpcy5yID0gMDtcbiAgICAgICAgSW5mbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgR1VOWklQcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEd1bnppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuZS5jYWxsKHRoaXMsIGNodW5rKTtcbiAgICAgICAgdGhpcy5yICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMudikge1xuICAgICAgICAgICAgdmFyIHAgPSB0aGlzLnAuc3ViYXJyYXkodGhpcy52IC0gMSk7XG4gICAgICAgICAgICB2YXIgcyA9IHAubGVuZ3RoID4gMyA/IGd6cyhwKSA6IDQ7XG4gICAgICAgICAgICBpZiAocyA+IHAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaW5hbClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy52ID4gMSAmJiB0aGlzLm9ubWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbm1lbWJlcih0aGlzLnIgLSBwLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnAgPSBwLnN1YmFycmF5KHMpLCB0aGlzLnYgPSAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lY2Vzc2FyeSB0byBwcmV2ZW50IFRTIGZyb20gdXNpbmcgdGhlIGNsb3N1cmUgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHdvcmtlcml6YXRpb24gdG8gZnVuY3Rpb24gY29ycmVjdGx5XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCAwKTtcbiAgICAgICAgLy8gcHJvY2VzcyBjb25jYXRlbmF0ZWQgR1pJUFxuICAgICAgICBpZiAodGhpcy5zLmYgJiYgIXRoaXMucy5sKSB7XG4gICAgICAgICAgICB0aGlzLnYgPSBzaGZ0KHRoaXMucy5wKSArIDk7XG4gICAgICAgICAgICB0aGlzLnMgPSB7IGk6IDAgfTtcbiAgICAgICAgICAgIHRoaXMubyA9IG5ldyB1OCgwKTtcbiAgICAgICAgICAgIHRoaXMucHVzaChuZXcgdTgoMCksIGZpbmFsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuYy5jYWxsKHRoaXMsIGZpbmFsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEd1bnppcDtcbn0oKSk7XG5leHBvcnQgeyBHdW56aXAgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBzaW5nbGUgb3IgbXVsdGktbWVtYmVyIEdaSVAgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNHdW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNHdW56aXAob3B0cywgY2IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgZ3V6ZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgSW5mbGF0ZSwgR3VuemlwXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEd1bnppcChldi5kYXRhKTtcbiAgICAgICAgICAgIHN0cm0ub25tZW1iZXIgPSBmdW5jdGlvbiAob2Zmc2V0KSB7IHJldHVybiBwb3N0TWVzc2FnZShvZmZzZXQpOyB9O1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDksIDAsIGZ1bmN0aW9uIChvZmZzZXQpIHsgcmV0dXJuIF90aGlzLm9ubWVtYmVyICYmIF90aGlzLm9ubWVtYmVyKG9mZnNldCk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNHdW56aXA7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNHdW56aXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBndW56aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiSW5mbHQsXG4gICAgICAgIGd1emUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtndW56aXBTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGd1bnppcFN5bmMoZXYuZGF0YVswXSwgZXYuZGF0YVsxXSkpOyB9LCAzLCBjYik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgdmFyIHN0ID0gZ3pzKGRhdGEpO1xuICAgIGlmIChzdCArIDggPiBkYXRhLmxlbmd0aClcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIGd6aXAgZGF0YScpO1xuICAgIHJldHVybiBpbmZsdChkYXRhLnN1YmFycmF5KHN0LCAtOCksIHsgaTogMiB9LCBvcHRzICYmIG9wdHMub3V0IHx8IG5ldyB1OChnemwoZGF0YSkpLCBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSk7XG59XG4vKipcbiAqIFN0cmVhbWluZyBabGliIGNvbXByZXNzaW9uXG4gKi9cbnZhciBabGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFpsaWIob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gYWRsZXIoKTtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgRGVmbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgemxpYmJlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBabGliLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmMucChjaHVuayk7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgWmxpYi5wcm90b3R5cGUucCA9IGZ1bmN0aW9uIChjLCBmKSB7XG4gICAgICAgIHZhciByYXcgPSBkb3B0KGMsIHRoaXMubywgdGhpcy52ICYmICh0aGlzLm8uZGljdGlvbmFyeSA/IDYgOiAyKSwgZiAmJiA0LCB0aGlzLnMpO1xuICAgICAgICBpZiAodGhpcy52KVxuICAgICAgICAgICAgemxoKHJhdywgdGhpcy5vKSwgdGhpcy52ID0gMDtcbiAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5jLmQoKSk7XG4gICAgICAgIHRoaXMub25kYXRhKHJhdywgZik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGbHVzaGVzIGJ1ZmZlcmVkIHVuY29tcHJlc3NlZCBkYXRhLiBVc2VmdWwgdG8gaW1tZWRpYXRlbHkgcmV0cmlldmUgdGhlXG4gICAgICogemxpYmJlZCBvdXRwdXQgZm9yIHNtYWxsIGlucHV0cy5cbiAgICAgKiBAcGFyYW0gc3luYyBXaGV0aGVyIHRvIGZsdXNoIHRvIGEgYnl0ZSBib3VuZGFyeS4gQSBzeW5jIGZsdXNoIHRha2VzIDQtNVxuICAgICAqICAgICAgICAgICAgIGV4dHJhIGJ5dGVzLCBidXQgZ3VhcmFudGVlcyBhbGwgcHVzaGVkIGRhdGEgaXMgaW1tZWRpYXRlbHlcbiAgICAgKiAgICAgICAgICAgICBkZWNvbXByZXNzaWJsZS5cbiAgICAgKi9cbiAgICBabGliLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uIChzeW5jKSB7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLmZsdXNoLmNhbGwodGhpcywgc3luYyk7XG4gICAgfTtcbiAgICByZXR1cm4gWmxpYjtcbn0oKSk7XG5leHBvcnQgeyBabGliIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgWmxpYiBjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNabGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jWmxpYihvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiRGZsdCxcbiAgICAgICAgICAgIHpsZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgRGVmbGF0ZSwgWmxpYl07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBabGliKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDEwLCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jWmxpYjtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1psaWIgfTtcbmV4cG9ydCBmdW5jdGlvbiB6bGliKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkRmbHQsXG4gICAgICAgIHpsZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW3psaWJTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKHpsaWJTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgNCwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzcyBkYXRhIHdpdGggWmxpYlxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgemxpYi1jb21wcmVzc2VkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHpsaWJTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgYSA9IGFkbGVyKCk7XG4gICAgYS5wKGRhdGEpO1xuICAgIHZhciBkID0gZG9wdChkYXRhLCBvcHRzLCBvcHRzLmRpY3Rpb25hcnkgPyA2IDogMiwgNCk7XG4gICAgcmV0dXJuIHpsaChkLCBvcHRzKSwgd2J5dGVzKGQsIGQubGVuZ3RoIC0gNCwgYS5kKCkpLCBkO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgWmxpYiBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBVbnpsaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVW56bGliKG9wdHMsIGNiKSB7XG4gICAgICAgIEluZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgICAgIHRoaXMudiA9IG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5ID8gMiA6IDE7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHVuemxpYmJlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBVbnpsaWIucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmUuY2FsbCh0aGlzLCBjaHVuayk7XG4gICAgICAgIGlmICh0aGlzLnYpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnAubGVuZ3RoIDwgNiAmJiAhZmluYWwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5wID0gdGhpcy5wLnN1YmFycmF5KHpscyh0aGlzLnAsIHRoaXMudiAtIDEpKSwgdGhpcy52ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnAubGVuZ3RoIDwgNClcbiAgICAgICAgICAgICAgICBlcnIoNiwgJ2ludmFsaWQgemxpYiBkYXRhJyk7XG4gICAgICAgICAgICB0aGlzLnAgPSB0aGlzLnAuc3ViYXJyYXkoMCwgLTQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lY2Vzc2FyeSB0byBwcmV2ZW50IFRTIGZyb20gdXNpbmcgdGhlIGNsb3N1cmUgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHdvcmtlcml6YXRpb24gdG8gZnVuY3Rpb24gY29ycmVjdGx5XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gVW56bGliO1xufSgpKTtcbmV4cG9ydCB7IFVuemxpYiB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIFpsaWIgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNVbnpsaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNVbnpsaWIob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgenVsZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgSW5mbGF0ZSwgVW56bGliXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IFVuemxpYihldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCAxMSwgMCk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY1VuemxpYjtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1VuemxpYiB9O1xuZXhwb3J0IGZ1bmN0aW9uIHVuemxpYihkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdCxcbiAgICAgICAgenVsZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW3VuemxpYlN5bmNdOyB9XG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYodW56bGliU3luYyhldi5kYXRhWzBdLCBnb3B0KGV2LmRhdGFbMV0pKSk7IH0sIDUsIGNiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1bnpsaWJTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YS5zdWJhcnJheSh6bHMoZGF0YSwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpLCAtNCksIHsgaTogMiB9LCBvcHRzICYmIG9wdHMub3V0LCBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSk7XG59XG4vLyBEZWZhdWx0IGFsZ29yaXRobSBmb3IgY29tcHJlc3Npb24gKHVzZWQgYmVjYXVzZSBoYXZpbmcgYSBrbm93biBvdXRwdXQgc2l6ZSBhbGxvd3MgZmFzdGVyIGRlY29tcHJlc3Npb24pXG5leHBvcnQgeyBnemlwIGFzIGNvbXByZXNzLCBBc3luY0d6aXAgYXMgQXN5bmNDb21wcmVzcyB9O1xuZXhwb3J0IHsgZ3ppcFN5bmMgYXMgY29tcHJlc3NTeW5jLCBHemlwIGFzIENvbXByZXNzIH07XG4vKipcbiAqIFN0cmVhbWluZyBHWklQLCBabGliLCBvciByYXcgREVGTEFURSBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBEZWNvbXByZXNzID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERlY29tcHJlc3Mob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5vID0gU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSB8fCB7fTtcbiAgICAgICAgdGhpcy5HID0gR3VuemlwO1xuICAgICAgICB0aGlzLkkgPSBJbmZsYXRlO1xuICAgICAgICB0aGlzLlogPSBVbnpsaWI7XG4gICAgfVxuICAgIC8vIGluaXQgc3Vic3RyZWFtXG4gICAgLy8gb3ZlcnJpZGVuIGJ5IEFzeW5jRGVjb21wcmVzc1xuICAgIERlY29tcHJlc3MucHJvdG90eXBlLmkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMucy5vbmRhdGEgPSBmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKGRhdCwgZmluYWwpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVjb21wcmVzc2VkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlY29tcHJlc3MucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICghdGhpcy5zKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wICYmIHRoaXMucC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbiA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBuLnNldCh0aGlzLnApLCBuLnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5wID0gY2h1bms7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnMgPSAodGhpcy5wWzBdID09IDMxICYmIHRoaXMucFsxXSA9PSAxMzkgJiYgdGhpcy5wWzJdID09IDgpXG4gICAgICAgICAgICAgICAgICAgID8gbmV3IHRoaXMuRyh0aGlzLm8pXG4gICAgICAgICAgICAgICAgICAgIDogKCh0aGlzLnBbMF0gJiAxNSkgIT0gOCB8fCAodGhpcy5wWzBdID4+IDQpID4gNyB8fCAoKHRoaXMucFswXSA8PCA4IHwgdGhpcy5wWzFdKSAlIDMxKSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IHRoaXMuSSh0aGlzLm8pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyB0aGlzLloodGhpcy5vKTtcbiAgICAgICAgICAgICAgICB0aGlzLmkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnMucHVzaCh0aGlzLnAsIGZpbmFsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucy5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gRGVjb21wcmVzcztcbn0oKSk7XG5leHBvcnQgeyBEZWNvbXByZXNzIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNEZWNvbXByZXNzID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jRGVjb21wcmVzcyhvcHRzLCBjYikge1xuICAgICAgICBEZWNvbXByZXNzLmNhbGwodGhpcywgb3B0cywgY2IpO1xuICAgICAgICB0aGlzLnF1ZXVlZFNpemUgPSAwO1xuICAgICAgICB0aGlzLkcgPSBBc3luY0d1bnppcDtcbiAgICAgICAgdGhpcy5JID0gQXN5bmNJbmZsYXRlO1xuICAgICAgICB0aGlzLlogPSBBc3luY1VuemxpYjtcbiAgICB9XG4gICAgQXN5bmNEZWNvbXByZXNzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnMub25kYXRhID0gZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucy5vbmRyYWluID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgICAgIF90aGlzLnF1ZXVlZFNpemUgLT0gc2l6ZTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5vbmRyYWluKVxuICAgICAgICAgICAgICAgIF90aGlzLm9uZHJhaW4oc2l6ZSk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWNvbXByZXNzZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgQXN5bmNEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLnF1ZXVlZFNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBBc3luY0RlY29tcHJlc3M7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNEZWNvbXByZXNzIH07XG5leHBvcnQgZnVuY3Rpb24gZGVjb21wcmVzcyhkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiAoZGF0YVswXSA9PSAzMSAmJiBkYXRhWzFdID09IDEzOSAmJiBkYXRhWzJdID09IDgpXG4gICAgICAgID8gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICAgICAgOiB1bnpsaWIoZGF0YSwgb3B0cywgY2IpO1xufVxuLyoqXG4gKiBFeHBhbmRzIGNvbXByZXNzZWQgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGF0YSwgYXV0b21hdGljYWxseSBkZXRlY3RpbmcgdGhlIGZvcm1hdFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZGVjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGRlY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGRlY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXByZXNzU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIChkYXRhWzBdID09IDMxICYmIGRhdGFbMV0gPT0gMTM5ICYmIGRhdGFbMl0gPT0gOClcbiAgICAgICAgPyBndW56aXBTeW5jKGRhdGEsIG9wdHMpXG4gICAgICAgIDogKChkYXRhWzBdICYgMTUpICE9IDggfHwgKGRhdGFbMF0gPj4gNCkgPiA3IHx8ICgoZGF0YVswXSA8PCA4IHwgZGF0YVsxXSkgJSAzMSkpXG4gICAgICAgICAgICA/IGluZmxhdGVTeW5jKGRhdGEsIG9wdHMpXG4gICAgICAgICAgICA6IHVuemxpYlN5bmMoZGF0YSwgb3B0cyk7XG59XG4vLyBmbGF0dGVuIGEgZGlyZWN0b3J5IHN0cnVjdHVyZVxudmFyIGZsdG4gPSBmdW5jdGlvbiAoZCwgcCwgdCwgbykge1xuICAgIGZvciAodmFyIGsgaW4gZCkge1xuICAgICAgICB2YXIgdmFsID0gZFtrXSwgbiA9IHAgKyBrLCBvcCA9IG87XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpXG4gICAgICAgICAgICBvcCA9IG1yZyhvLCB2YWxbMV0pLCB2YWwgPSB2YWxbMF07XG4gICAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKSlcbiAgICAgICAgICAgIHRbbl0gPSBbdmFsLCBvcF07XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdFtuICs9ICcvJ10gPSBbbmV3IHU4KDApLCBvcF07XG4gICAgICAgICAgICBmbHRuKHZhbCwgbiwgdCwgbyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8gdGV4dCBlbmNvZGVyXG52YXIgdGUgPSB0eXBlb2YgVGV4dEVuY29kZXIgIT0gJ3VuZGVmaW5lZCcgJiYgLyojX19QVVJFX18qLyBuZXcgVGV4dEVuY29kZXIoKTtcbi8vIHRleHQgZGVjb2RlclxudmFyIHRkID0gdHlwZW9mIFRleHREZWNvZGVyICE9ICd1bmRlZmluZWQnICYmIC8qI19fUFVSRV9fKi8gbmV3IFRleHREZWNvZGVyKCk7XG4vLyB0ZXh0IGRlY29kZXIgc3RyZWFtXG52YXIgdGRzID0gMDtcbnRyeSB7XG4gICAgdGQuZGVjb2RlKGV0LCB7IHN0cmVhbTogdHJ1ZSB9KTtcbiAgICB0ZHMgPSAxO1xufVxuY2F0Y2ggKGUpIHsgfVxuLy8gZGVjb2RlIFVURjhcbnZhciBkdXRmOCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgZm9yICh2YXIgciA9ICcnLCBpID0gMDs7KSB7XG4gICAgICAgIHZhciBjID0gZFtpKytdO1xuICAgICAgICB2YXIgZWIgPSAoYyA+IDEyNykgKyAoYyA+IDIyMykgKyAoYyA+IDIzOSk7XG4gICAgICAgIGlmIChpICsgZWIgPiBkLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiB7IHM6IHIsIHI6IHNsYyhkLCBpIC0gMSkgfTtcbiAgICAgICAgaWYgKCFlYilcbiAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgICAgZWxzZSBpZiAoZWIgPT0gMykge1xuICAgICAgICAgICAgYyA9ICgoYyAmIDE1KSA8PCAxOCB8IChkW2krK10gJiA2MykgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKSAtIDY1NTM2LFxuICAgICAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NiB8IChjID4+IDEwKSwgNTYzMjAgfCAoYyAmIDEwMjMpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlYiAmIDEpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAzMSkgPDwgNiB8IChkW2krK10gJiA2MykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAxNSkgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKTtcbiAgICB9XG59O1xuLyoqXG4gKiBTdHJlYW1pbmcgVVRGLTggZGVjb2RpbmdcbiAqL1xudmFyIERlY29kZVVURjggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFVURi04IGRlY29kaW5nIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGRlY29kZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEZWNvZGVVVEY4KGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIGlmICh0ZHMpXG4gICAgICAgICAgICB0aGlzLnQgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29kZWQgZnJvbSBVVEYtOCBiaW5hcnlcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVjb2RlVVRGOC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgZmluYWwgPSAhIWZpbmFsO1xuICAgICAgICBpZiAodGhpcy50KSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YSh0aGlzLnQuZGVjb2RlKGNodW5rLCB7IHN0cmVhbTogdHJ1ZSB9KSwgZmluYWwpO1xuICAgICAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudC5kZWNvZGUoKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGVycig4KTtcbiAgICAgICAgICAgICAgICB0aGlzLnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICB2YXIgZGF0ID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjaHVuay5sZW5ndGgpO1xuICAgICAgICBkYXQuc2V0KHRoaXMucCk7XG4gICAgICAgIGRhdC5zZXQoY2h1bmssIHRoaXMucC5sZW5ndGgpO1xuICAgICAgICB2YXIgX2EgPSBkdXRmOChkYXQpLCBzID0gX2EucywgciA9IF9hLnI7XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHIubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGVycig4KTtcbiAgICAgICAgICAgIHRoaXMucCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gcjtcbiAgICAgICAgdGhpcy5vbmRhdGEocywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIERlY29kZVVURjg7XG59KCkpO1xuZXhwb3J0IHsgRGVjb2RlVVRGOCB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgVVRGLTggZW5jb2RpbmdcbiAqL1xudmFyIEVuY29kZVVURjggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFVURi04IGRlY29kaW5nIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGVuY29kZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBFbmNvZGVVVEY4KGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGVuY29kZWQgdG8gVVRGLThcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIHN0cmluZyBkYXRhIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRW5jb2RlVVRGOC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdGhpcy5vbmRhdGEoc3RyVG9VOChjaHVuayksIHRoaXMuZCA9IGZpbmFsIHx8IGZhbHNlKTtcbiAgICB9O1xuICAgIHJldHVybiBFbmNvZGVVVEY4O1xufSgpKTtcbmV4cG9ydCB7IEVuY29kZVVURjggfTtcbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXkgZm9yIHVzZSB3aXRoIGNvbXByZXNzaW9uL2RlY29tcHJlc3Npb24gbWV0aG9kc1xuICogQHBhcmFtIHN0ciBUaGUgc3RyaW5nIHRvIGVuY29kZVxuICogQHBhcmFtIGxhdGluMSBXaGV0aGVyIG9yIG5vdCB0byBpbnRlcnByZXQgdGhlIGRhdGEgYXMgTGF0aW4tMS4gVGhpcyBzaG91bGRcbiAqICAgICAgICAgICAgICAgbm90IG5lZWQgdG8gYmUgdHJ1ZSB1bmxlc3MgZGVjb2RpbmcgYSBiaW5hcnkgc3RyaW5nLlxuICogQHJldHVybnMgVGhlIHN0cmluZyBlbmNvZGVkIGluIFVURi04L0xhdGluLTEgYmluYXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJUb1U4KHN0ciwgbGF0aW4xKSB7XG4gICAgaWYgKGxhdGluMSkge1xuICAgICAgICB2YXIgYXJfMSA9IG5ldyB1OChzdHIubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBhcl8xW2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHJldHVybiBhcl8xO1xuICAgIH1cbiAgICBpZiAodGUpXG4gICAgICAgIHJldHVybiB0ZS5lbmNvZGUoc3RyKTtcbiAgICB2YXIgbCA9IHN0ci5sZW5ndGg7XG4gICAgdmFyIGFyID0gbmV3IHU4KHN0ci5sZW5ndGggKyAoc3RyLmxlbmd0aCA+PiAxKSk7XG4gICAgdmFyIGFpID0gMDtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICh2KSB7IGFyW2FpKytdID0gdjsgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAoYWkgKyA1ID4gYXIubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbiA9IG5ldyB1OChhaSArIDggKyAoKGwgLSBpKSA8PCAxKSk7XG4gICAgICAgICAgICBuLnNldChhcik7XG4gICAgICAgICAgICBhciA9IG47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGMgPCAxMjggfHwgbGF0aW4xKVxuICAgICAgICAgICAgdyhjKTtcbiAgICAgICAgZWxzZSBpZiAoYyA8IDIwNDgpXG4gICAgICAgICAgICB3KDE5MiB8IChjID4+IDYpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgICAgIGVsc2UgaWYgKGMgPiA1NTI5NSAmJiBjIDwgNTczNDQpXG4gICAgICAgICAgICBjID0gNjU1MzYgKyAoYyAmIDEwMjMgPDwgMTApIHwgKHN0ci5jaGFyQ29kZUF0KCsraSkgJiAxMDIzKSxcbiAgICAgICAgICAgICAgICB3KDI0MCB8IChjID4+IDE4KSksIHcoMTI4IHwgKChjID4+IDEyKSAmIDYzKSksIHcoMTI4IHwgKChjID4+IDYpICYgNjMpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHcoMjI0IHwgKGMgPj4gMTIpKSwgdygxMjggfCAoKGMgPj4gNikgJiA2MykpLCB3KDEyOCB8IChjICYgNjMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHNsYyhhciwgMCwgYWkpO1xufVxuLyoqXG4gKiBDb252ZXJ0cyBhIFVpbnQ4QXJyYXkgdG8gYSBzdHJpbmdcbiAqIEBwYXJhbSBkYXQgVGhlIGRhdGEgdG8gZGVjb2RlIHRvIHN0cmluZ1xuICogQHBhcmFtIGxhdGluMSBXaGV0aGVyIG9yIG5vdCB0byBpbnRlcnByZXQgdGhlIGRhdGEgYXMgTGF0aW4tMS4gVGhpcyBzaG91bGRcbiAqICAgICAgICAgICAgICAgbm90IG5lZWQgdG8gYmUgdHJ1ZSB1bmxlc3MgZW5jb2RpbmcgdG8gYmluYXJ5IHN0cmluZy5cbiAqIEByZXR1cm5zIFRoZSBvcmlnaW5hbCBVVEYtOC9MYXRpbi0xIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyRnJvbVU4KGRhdCwgbGF0aW4xKSB7XG4gICAgaWYgKGxhdGluMSkge1xuICAgICAgICB2YXIgciA9ICcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdC5sZW5ndGg7IGkgKz0gMTYzODQpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgZGF0LnN1YmFycmF5KGksIGkgKyAxNjM4NCkpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgZWxzZSBpZiAodGQpIHtcbiAgICAgICAgcmV0dXJuIHRkLmRlY29kZShkYXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIF9hID0gZHV0ZjgoZGF0KSwgcyA9IF9hLnMsIHIgPSBfYS5yO1xuICAgICAgICBpZiAoci5sZW5ndGgpXG4gICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbn1cbjtcbi8vIGRlZmxhdGUgYml0IGZsYWdcbnZhciBkYmYgPSBmdW5jdGlvbiAobCkgeyByZXR1cm4gbCA9PSAxID8gMyA6IGwgPCA2ID8gMiA6IGwgPT0gOSA/IDEgOiAwOyB9O1xuLy8gc2tpcCBsb2NhbCB6aXAgaGVhZGVyXG52YXIgc2x6aCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiBiICsgMzAgKyBiMihkLCBiICsgMjYpICsgYjIoZCwgYiArIDI4KTsgfTtcbi8vIHJlYWQgemlwIGhlYWRlclxudmFyIHpoID0gZnVuY3Rpb24gKGQsIGIsIHopIHtcbiAgICB2YXIgZm5sID0gYjIoZCwgYiArIDI4KSwgZWZsID0gYjIoZCwgYiArIDMwKSwgZm4gPSBzdHJGcm9tVTgoZC5zdWJhcnJheShiICsgNDYsIGIgKyA0NiArIGZubCksICEoYjIoZCwgYiArIDgpICYgMjA0OCkpLCBlcyA9IGIgKyA0NiArIGZubDtcbiAgICB2YXIgX2EgPSB6NjRocyhkLCBlcywgZWZsLCB6LCBiNChkLCBiICsgMjApLCBiNChkLCBiICsgMjQpLCBiNChkLCBiICsgNDIpKSwgc2MgPSBfYVswXSwgc3UgPSBfYVsxXSwgb2ZmID0gX2FbMl07XG4gICAgcmV0dXJuIFtiMihkLCBiICsgMTApLCBzYywgc3UsIGZuLCBlcyArIGVmbCArIGIyKGQsIGIgKyAzMiksIG9mZl07XG59O1xuLy8gcmVhZCB6aXA2NCBoZWFkZXIgc2l6ZXNcbnZhciB6NjRocyA9IGZ1bmN0aW9uIChkLCBiLCBsLCB6LCBzYywgc3UsIG9mZikge1xuICAgIHZhciBuc2MgPSBzYyA9PSA0Mjk0OTY3Mjk1LCBuc3UgPSBzdSA9PSA0Mjk0OTY3Mjk1LCBub2ZmID0gb2ZmID09IDQyOTQ5NjcyOTUsIGUgPSBiICsgbDtcbiAgICB2YXIgbmYgPSBuc2MgKyBuc3UgKyBub2ZmO1xuICAgIGlmICh6ICYmIG5mKSB7XG4gICAgICAgIGZvciAoOyBiICsgNCA8IGU7IGIgKz0gNCArIGIyKGQsIGIgKyAyKSkge1xuICAgICAgICAgICAgaWYgKGIyKGQsIGIpID09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBuc2MgPyBiOChkLCBiICsgNCArIDggKiBuc3UpIDogc2MsXG4gICAgICAgICAgICAgICAgICAgIG5zdSA/IGI4KGQsIGIgKyA0KSA6IHN1LFxuICAgICAgICAgICAgICAgICAgICBub2ZmID8gYjgoZCwgYiArIDQgKyA4ICogKG5zdSArIG5zYykpIDogb2ZmLFxuICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyB6ID09IDIgZm9yIHVua25vd24gd2hldGhlciBvciBub3QgemlwNjRcbiAgICAgICAgaWYgKHogPCAyKVxuICAgICAgICAgICAgZXJyKDEzKTtcbiAgICB9XG4gICAgcmV0dXJuIFtzYywgc3UsIG9mZiwgMF07XG59O1xuLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG52YXIgZXhmbCA9IGZ1bmN0aW9uIChleCkge1xuICAgIHZhciBsZSA9IDA7XG4gICAgaWYgKGV4KSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBsID0gZXhba10ubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGwgPiA2NTUzNSlcbiAgICAgICAgICAgICAgICBlcnIoOSk7XG4gICAgICAgICAgICBsZSArPSBsICsgNDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGU7XG59O1xuLy8gd3JpdGUgemlwIGhlYWRlclxudmFyIHd6aCA9IGZ1bmN0aW9uIChkLCBiLCBmLCBmbiwgdSwgYywgY2UsIGNvKSB7XG4gICAgdmFyIGZsID0gZm4ubGVuZ3RoLCBleCA9IGYuZXh0cmEsIGNvbCA9IGNvICYmIGNvLmxlbmd0aDtcbiAgICB2YXIgZXhsID0gZXhmbChleCk7XG4gICAgd2J5dGVzKGQsIGIsIGNlICE9IG51bGwgPyAweDIwMTRCNTAgOiAweDQwMzRCNTApLCBiICs9IDQ7XG4gICAgaWYgKGNlICE9IG51bGwpXG4gICAgICAgIGRbYisrXSA9IDIwLCBkW2IrK10gPSBmLm9zO1xuICAgIGRbYl0gPSAyMCwgYiArPSAyOyAvLyBzcGVjIGNvbXBsaWFuY2U/IHdoYXQncyB0aGF0P1xuICAgIGRbYisrXSA9IChmLmZsYWcgPDwgMSkgfCAoYyA8IDAgJiYgOCksIGRbYisrXSA9IHUgJiYgODtcbiAgICBkW2IrK10gPSBmLmNvbXByZXNzaW9uICYgMjU1LCBkW2IrK10gPSBmLmNvbXByZXNzaW9uID4+IDg7XG4gICAgdmFyIGR0ID0gbmV3IERhdGUoZi5tdGltZSA9PSBudWxsID8gRGF0ZS5ub3coKSA6IGYubXRpbWUpLCB5ID0gZHQuZ2V0RnVsbFllYXIoKSAtIDE5ODA7XG4gICAgaWYgKHkgPCAwIHx8IHkgPiAxMTkpXG4gICAgICAgIGVycigxMCk7XG4gICAgd2J5dGVzKGQsIGIsICh5IDw8IDI1KSB8ICgoZHQuZ2V0TW9udGgoKSArIDEpIDw8IDIxKSB8IChkdC5nZXREYXRlKCkgPDwgMTYpIHwgKGR0LmdldEhvdXJzKCkgPDwgMTEpIHwgKGR0LmdldE1pbnV0ZXMoKSA8PCA1KSB8IChkdC5nZXRTZWNvbmRzKCkgPj4gMSkpLCBiICs9IDQ7XG4gICAgaWYgKGMgIT0gLTEpIHtcbiAgICAgICAgd2J5dGVzKGQsIGIsIGYuY3JjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA0LCBjIDwgMCA/IC1jIC0gMiA6IGMpO1xuICAgICAgICB3Ynl0ZXMoZCwgYiArIDgsIGYuc2l6ZSk7XG4gICAgfVxuICAgIHdieXRlcyhkLCBiICsgMTIsIGZsKTtcbiAgICB3Ynl0ZXMoZCwgYiArIDE0LCBleGwpLCBiICs9IDE2O1xuICAgIGlmIChjZSAhPSBudWxsKSB7XG4gICAgICAgIHdieXRlcyhkLCBiLCBjb2wpO1xuICAgICAgICB3Ynl0ZXMoZCwgYiArIDYsIGYuYXR0cnMpO1xuICAgICAgICB3Ynl0ZXMoZCwgYiArIDEwLCBjZSksIGIgKz0gMTQ7XG4gICAgfVxuICAgIGQuc2V0KGZuLCBiKTtcbiAgICBiICs9IGZsO1xuICAgIGlmIChleGwpIHtcbiAgICAgICAgZm9yICh2YXIgayBpbiBleCkge1xuICAgICAgICAgICAgdmFyIGV4ZiA9IGV4W2tdLCBsID0gZXhmLmxlbmd0aDtcbiAgICAgICAgICAgIHdieXRlcyhkLCBiLCArayk7XG4gICAgICAgICAgICB3Ynl0ZXMoZCwgYiArIDIsIGwpO1xuICAgICAgICAgICAgZC5zZXQoZXhmLCBiICsgNCksIGIgKz0gNCArIGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbClcbiAgICAgICAgZC5zZXQoY28sIGIpLCBiICs9IGNvbDtcbiAgICByZXR1cm4gYjtcbn07XG4vLyB3cml0ZSB6aXAgZm9vdGVyIChlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkpXG52YXIgd3pmID0gZnVuY3Rpb24gKG8sIGIsIGMsIGQsIGUpIHtcbiAgICB3Ynl0ZXMobywgYiwgMHg2MDU0QjUwKTsgLy8gc2tpcCBkaXNrXG4gICAgd2J5dGVzKG8sIGIgKyA4LCBjKTtcbiAgICB3Ynl0ZXMobywgYiArIDEwLCBjKTtcbiAgICB3Ynl0ZXMobywgYiArIDEyLCBkKTtcbiAgICB3Ynl0ZXMobywgYiArIDE2LCBlKTtcbn07XG4vKipcbiAqIEEgcGFzcy10aHJvdWdoIHN0cmVhbSB0byBrZWVwIGRhdGEgdW5jb21wcmVzc2VkIGluIGEgWklQIGFyY2hpdmUuXG4gKi9cbnZhciBaaXBQYXNzVGhyb3VnaCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgcGFzcy10aHJvdWdoIHN0cmVhbSB0aGF0IGNhbiBiZSBhZGRlZCB0byBaSVAgYXJjaGl2ZXNcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgZGF0YSBzdHJlYW1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBaaXBQYXNzVGhyb3VnaChmaWxlbmFtZSkge1xuICAgICAgICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG4gICAgICAgIHRoaXMuYyA9IGNyYygpO1xuICAgICAgICB0aGlzLnNpemUgPSAwO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIGEgY2h1bmsgYW5kIHB1c2hlcyB0byB0aGUgb3V0cHV0IHN0cmVhbS4gWW91IGNhbiBvdmVycmlkZSB0aGlzXG4gICAgICogbWV0aG9kIGluIGEgc3ViY2xhc3MgZm9yIGN1c3RvbSBiZWhhdmlvciwgYnV0IGJ5IGRlZmF1bHQgdGhpcyBwYXNzZXNcbiAgICAgKiB0aGUgZGF0YSB0aHJvdWdoLiBZb3UgbXVzdCBjYWxsIHRoaXMub25kYXRhKGVyciwgY2h1bmssIGZpbmFsKSBhdCBzb21lXG4gICAgICogcG9pbnQgaW4gdGhpcyBtZXRob2QuXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwcm9jZXNzXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLm9uZGF0YShudWxsLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgYWRkZWQuIElmIHlvdSBhcmUgc3ViY2xhc3NpbmcgdGhpcyB3aXRoIGEgY3VzdG9tXG4gICAgICogY29tcHJlc3Npb24gYWxnb3JpdGhtLCBub3RlIHRoYXQgeW91IG11c3QgcHVzaCBkYXRhIGZyb20gdGhlIHNvdXJjZVxuICAgICAqIGZpbGUgb25seSwgcHJlLWNvbXByZXNzaW9uLlxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICB0aGlzLnNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBpZiAoZmluYWwpXG4gICAgICAgICAgICB0aGlzLmNyYyA9IHRoaXMuYy5kKCk7XG4gICAgICAgIC8vIHdlIHNob3VsZG4ndCByZWFsbHkgZG8gdGhpcyBjYXN0LCBidXQgcHJvcGVybHkgaGFuZGxpbmcgQXJyYXlCdWZmZXJMaWtlXG4gICAgICAgIC8vIG1ha2VzIHRoZSBBUEkgdW5lcmdvbm9taWMgd2l0aCBCdWZmZXJcbiAgICAgICAgdGhpcy5wcm9jZXNzKGNodW5rLCBmaW5hbCB8fCBmYWxzZSk7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwUGFzc1Rocm91Z2g7XG59KCkpO1xuZXhwb3J0IHsgWmlwUGFzc1Rocm91Z2ggfTtcbi8vIEkgZG9uJ3QgZXh0ZW5kIGJlY2F1c2UgVHlwZVNjcmlwdCBleHRlbnNpb24gYWRkcyAxa0Igb2YgcnVudGltZSBibG9hdFxuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzLiBQcmVmZXIgdXNpbmcgQXN5bmNaaXBEZWZsYXRlXG4gKiBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gKi9cbnZhciBaaXBEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBERUZMQVRFIHN0cmVhbSB0aGF0IGNhbiBiZSBhZGRlZCB0byBaSVAgYXJjaGl2ZXNcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgZGF0YSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFppcERlZmxhdGUoZmlsZW5hbWUsIG9wdHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCFvcHRzKVxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5jYWxsKHRoaXMsIGZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5kID0gbmV3IERlZmxhdGUob3B0cywgZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29tcHJlc3Npb24gPSA4O1xuICAgICAgICB0aGlzLmZsYWcgPSBkYmYob3B0cy5sZXZlbCk7XG4gICAgfVxuICAgIFppcERlZmxhdGUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmQucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlLCBudWxsLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFppcERlZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBaaXBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IFppcERlZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXNcbiAqL1xudmFyIEFzeW5jWmlwRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBERUZMQVRFIHN0cmVhbSB0aGF0IGNhbiBiZSBhZGRlZCB0byBaSVAgYXJjaGl2ZXNcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgZGF0YSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFzeW5jWmlwRGVmbGF0ZShmaWxlbmFtZSwgb3B0cykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIW9wdHMpXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLmNhbGwodGhpcywgZmlsZW5hbWUpO1xuICAgICAgICB0aGlzLmQgPSBuZXcgQXN5bmNEZWZsYXRlKG9wdHMsIGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDg7XG4gICAgICAgIHRoaXMuZmxhZyA9IGRiZihvcHRzLmxldmVsKTtcbiAgICAgICAgdGhpcy50ZXJtaW5hdGUgPSB0aGlzLmQudGVybWluYXRlO1xuICAgIH1cbiAgICBBc3luY1ppcERlZmxhdGUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRoaXMuZC5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBBc3luY1ppcERlZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBBc3luY1ppcERlZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNaaXBEZWZsYXRlIH07XG4vLyBUT0RPOiBCZXR0ZXIgdHJlZSBzaGFraW5nXG4vKipcbiAqIEEgemlwcGFibGUgYXJjaGl2ZSB0byB3aGljaCBmaWxlcyBjYW4gaW5jcmVtZW50YWxseSBiZSBhZGRlZFxuICovXG52YXIgWmlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgWklQIGFyY2hpdmUgdG8gd2hpY2ggZmlsZXMgY2FuIGJlIGFkZGVkXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGRhdGEgZm9yIHRoZSBnZW5lcmF0ZWQgWklQIGFyY2hpdmVcbiAgICAgKiAgICAgICAgICAgaXMgYXZhaWxhYmxlXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwKGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIHRoaXMudSA9IFtdO1xuICAgICAgICB0aGlzLmQgPSAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZmlsZSB0byB0aGUgWklQIGFyY2hpdmVcbiAgICAgKiBAcGFyYW0gZmlsZSBUaGUgZmlsZSBzdHJlYW0gdG8gYWRkXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICAvLyBmaW5pc2hpbmcgb3IgZmluaXNoZWRcbiAgICAgICAgaWYgKHRoaXMuZCAmIDIpXG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlcnIoNCArICh0aGlzLmQgJiAxKSAqIDgsIDAsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGYgPSBzdHJUb1U4KGZpbGUuZmlsZW5hbWUpLCBmbF8xID0gZi5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgY29tID0gZmlsZS5jb21tZW50LCBvID0gY29tICYmIHN0clRvVTgoY29tKTtcbiAgICAgICAgICAgIHZhciB1ID0gZmxfMSAhPSBmaWxlLmZpbGVuYW1lLmxlbmd0aCB8fCAobyAmJiAoY29tLmxlbmd0aCAhPSBvLmxlbmd0aCkpO1xuICAgICAgICAgICAgdmFyIGhsXzEgPSBmbF8xICsgZXhmbChmaWxlLmV4dHJhKSArIDMwO1xuICAgICAgICAgICAgaWYgKGZsXzEgPiA2NTUzNSlcbiAgICAgICAgICAgICAgICB0aGlzLm9uZGF0YShlcnIoMTEsIDAsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gbmV3IHU4KGhsXzEpO1xuICAgICAgICAgICAgd3poKGhlYWRlciwgMCwgZmlsZSwgZiwgdSwgLTEpO1xuICAgICAgICAgICAgdmFyIGNoa3NfMSA9IFtoZWFkZXJdO1xuICAgICAgICAgICAgdmFyIHBBbGxfMSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNoa3NfMiA9IGNoa3NfMTsgX2kgPCBjaGtzXzIubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGsgPSBjaGtzXzJbX2ldO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgY2hrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNoa3NfMSA9IFtdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0cl8xID0gdGhpcy5kO1xuICAgICAgICAgICAgdGhpcy5kID0gMDtcbiAgICAgICAgICAgIHZhciBpbmRfMSA9IHRoaXMudS5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdWZfMSA9IG1yZyhmaWxlLCB7XG4gICAgICAgICAgICAgICAgZjogZixcbiAgICAgICAgICAgICAgICB1OiB1LFxuICAgICAgICAgICAgICAgIG86IG8sXG4gICAgICAgICAgICAgICAgdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS50ZXJtaW5hdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwQWxsXzEoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBueHQgPSBfdGhpcy51W2luZF8xICsgMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54dC5yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJfMSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY2xfMSA9IDA7XG4gICAgICAgICAgICBmaWxlLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNsXzEgKz0gZGF0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgY2hrc18xLnB1c2goZGF0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGQgPSBuZXcgdTgoMTYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCAwLCAweDgwNzRCNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCA0LCBmaWxlLmNyYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3Ynl0ZXMoZGQsIDgsIGNsXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCAxMiwgZmlsZS5zaXplKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoa3NfMS5wdXNoKGRkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVmXzEuYyA9IGNsXzEsIHVmXzEuYiA9IGhsXzEgKyBjbF8xICsgMTYsIHVmXzEuY3JjID0gZmlsZS5jcmMsIHVmXzEuc2l6ZSA9IGZpbGUuc2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cl8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVmXzEucigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJfMSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHJfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHBBbGxfMSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnUucHVzaCh1Zl8xKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRW5kcyB0aGUgcHJvY2VzcyBvZiBhZGRpbmcgZmlsZXMgYW5kIHByZXBhcmVzIHRvIGVtaXQgdGhlIGZpbmFsIGNodW5rcy5cbiAgICAgKiBUaGlzICptdXN0KiBiZSBjYWxsZWQgYWZ0ZXIgYWRkaW5nIGFsbCBkZXNpcmVkIGZpbGVzIGZvciB0aGUgcmVzdWx0aW5nXG4gICAgICogWklQIGZpbGUgdG8gd29yayBwcm9wZXJseS5cbiAgICAgKi9cbiAgICBaaXAucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuZCAmIDIpIHtcbiAgICAgICAgICAgIHRoaXMub25kYXRhKGVycig0ICsgKHRoaXMuZCAmIDEpICogOCwgMCwgMSksIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICB0aGlzLmUoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy51LnB1c2goe1xuICAgICAgICAgICAgICAgIHI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoX3RoaXMuZCAmIDEpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy51LnNwbGljZSgtMSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHQ6IGZ1bmN0aW9uICgpIHsgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZCA9IDM7XG4gICAgfTtcbiAgICBaaXAucHJvdG90eXBlLmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBidCA9IDAsIGwgPSAwLCB0bCA9IDA7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9hW19pXTtcbiAgICAgICAgICAgIHRsICs9IDQ2ICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSkgKyAoZi5vID8gZi5vLmxlbmd0aCA6IDApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBvdXQgPSBuZXcgdTgodGwgKyAyMik7XG4gICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLnU7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9jW19iXTtcbiAgICAgICAgICAgIHd6aChvdXQsIGJ0LCBmLCBmLmYsIGYudSwgLWYuYyAtIDIsIGwsIGYubyk7XG4gICAgICAgICAgICBidCArPSA0NiArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpICsgKGYubyA/IGYuby5sZW5ndGggOiAwKSwgbCArPSBmLmI7XG4gICAgICAgIH1cbiAgICAgICAgd3pmKG91dCwgYnQsIHRoaXMudS5sZW5ndGgsIHRsLCBsKTtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgb3V0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5kID0gMjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEEgbWV0aG9kIHRvIHRlcm1pbmF0ZSBhbnkgaW50ZXJuYWwgd29ya2VycyB1c2VkIGJ5IHRoZSBzdHJlYW0uIFN1YnNlcXVlbnRcbiAgICAgKiBjYWxscyB0byBhZGQoKSB3aWxsIGZhaWwuXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9hW19pXTtcbiAgICAgICAgICAgIGYudCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZCA9IDI7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwO1xufSgpKTtcbmV4cG9ydCB7IFppcCB9O1xuZXhwb3J0IGZ1bmN0aW9uIHppcChkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHZhciByID0ge307XG4gICAgZmx0bihkYXRhLCAnJywgciwgb3B0cyk7XG4gICAgdmFyIGsgPSBPYmplY3Qua2V5cyhyKTtcbiAgICB2YXIgbGZ0ID0gay5sZW5ndGgsIG8gPSAwLCB0b3QgPSAwO1xuICAgIHZhciBzbGZ0ID0gbGZ0LCBmaWxlcyA9IG5ldyBBcnJheShsZnQpO1xuICAgIHZhciB0ZXJtID0gW107XG4gICAgdmFyIHRBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVybS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIHRlcm1baV0oKTtcbiAgICB9O1xuICAgIHZhciBjYmQgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBtdChmdW5jdGlvbiAoKSB7IGNiKGEsIGIpOyB9KTtcbiAgICB9O1xuICAgIG10KGZ1bmN0aW9uICgpIHsgY2JkID0gY2I7IH0pO1xuICAgIHZhciBjYmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvdXQgPSBuZXcgdTgodG90ICsgMjIpLCBvZSA9IG8sIGNkbCA9IHRvdCAtIG87XG4gICAgICAgIHRvdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xmdDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGZpbGVzW2ldO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgbCA9IGYuYy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgd3poKG91dCwgdG90LCBmLCBmLmYsIGYudSwgbCk7XG4gICAgICAgICAgICAgICAgdmFyIGJhZGQgPSAzMCArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpO1xuICAgICAgICAgICAgICAgIHZhciBsb2MgPSB0b3QgKyBiYWRkO1xuICAgICAgICAgICAgICAgIG91dC5zZXQoZi5jLCBsb2MpO1xuICAgICAgICAgICAgICAgIHd6aChvdXQsIG8sIGYsIGYuZiwgZi51LCBsLCB0b3QsIGYubSksIG8gKz0gMTYgKyBiYWRkICsgKGYubSA/IGYubS5sZW5ndGggOiAwKSwgdG90ID0gbG9jICsgbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3emYob3V0LCBvLCBmaWxlcy5sZW5ndGgsIGNkbCwgb2UpO1xuICAgICAgICBjYmQobnVsbCwgb3V0KTtcbiAgICB9O1xuICAgIGlmICghbGZ0KVxuICAgICAgICBjYmYoKTtcbiAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciBmbiA9IGtbaV07XG4gICAgICAgIHZhciBfYSA9IHJbZm5dLCBmaWxlID0gX2FbMF0sIHAgPSBfYVsxXTtcbiAgICAgICAgdmFyIGMgPSBjcmMoKSwgc2l6ZSA9IGZpbGUubGVuZ3RoO1xuICAgICAgICBjLnAoZmlsZSk7XG4gICAgICAgIHZhciBmID0gc3RyVG9VOChmbiksIHMgPSBmLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbSA9IHAuY29tbWVudCwgbSA9IGNvbSAmJiBzdHJUb1U4KGNvbSksIG1zID0gbSAmJiBtLmxlbmd0aDtcbiAgICAgICAgdmFyIGV4bCA9IGV4ZmwocC5leHRyYSk7XG4gICAgICAgIHZhciBjb21wcmVzc2lvbiA9IHAubGV2ZWwgPT0gMCA/IDAgOiA4O1xuICAgICAgICB2YXIgY2JsID0gZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICAgICAgdEFsbCgpO1xuICAgICAgICAgICAgICAgIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsID0gZC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZmlsZXNbaV0gPSBtcmcocCwge1xuICAgICAgICAgICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICBjcmM6IGMuZCgpLFxuICAgICAgICAgICAgICAgICAgICBjOiBkLFxuICAgICAgICAgICAgICAgICAgICBmOiBmLFxuICAgICAgICAgICAgICAgICAgICBtOiBtLFxuICAgICAgICAgICAgICAgICAgICB1OiBzICE9IGZuLmxlbmd0aCB8fCAobSAmJiAoY29tLmxlbmd0aCAhPSBtcykpLFxuICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2lvbjogY29tcHJlc3Npb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvICs9IDMwICsgcyArIGV4bCArIGw7XG4gICAgICAgICAgICAgICAgdG90ICs9IDc2ICsgMiAqIChzICsgZXhsKSArIChtcyB8fCAwKSArIGw7XG4gICAgICAgICAgICAgICAgaWYgKCEtLWxmdClcbiAgICAgICAgICAgICAgICAgICAgY2JmKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzID4gNjU1MzUpXG4gICAgICAgICAgICBjYmwoZXJyKDExLCAwLCAxKSwgbnVsbCk7XG4gICAgICAgIGlmICghY29tcHJlc3Npb24pXG4gICAgICAgICAgICBjYmwobnVsbCwgZmlsZSk7XG4gICAgICAgIGVsc2UgaWYgKHNpemUgPCAxNjAwMDApIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2JsKG51bGwsIGRlZmxhdGVTeW5jKGZpbGUsIHApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY2JsKGUsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRlcm0ucHVzaChkZWZsYXRlKGZpbGUsIHAsIGNibCkpO1xuICAgIH07XG4gICAgLy8gQ2Fubm90IHVzZSBsZnQgYmVjYXVzZSBpdCBjYW4gZGVjcmVhc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsZnQ7ICsraSkge1xuICAgICAgICBfbG9vcF8xKGkpO1xuICAgIH1cbiAgICByZXR1cm4gdEFsbDtcbn1cbi8qKlxuICogU3luY2hyb25vdXNseSBjcmVhdGVzIGEgWklQIGZpbGUuIFByZWZlciB1c2luZyBgemlwYCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gKiB3aXRoIG1vcmUgdGhhbiBvbmUgZmlsZS5cbiAqIEBwYXJhbSBkYXRhIFRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIGZvciB0aGUgWklQIGFyY2hpdmVcbiAqIEBwYXJhbSBvcHRzIFRoZSBtYWluIG9wdGlvbnMsIG1lcmdlZCB3aXRoIHBlci1maWxlIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBnZW5lcmF0ZWQgWklQIGFyY2hpdmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIGlmICghb3B0cylcbiAgICAgICAgb3B0cyA9IHt9O1xuICAgIHZhciByID0ge307XG4gICAgdmFyIGZpbGVzID0gW107XG4gICAgZmx0bihkYXRhLCAnJywgciwgb3B0cyk7XG4gICAgdmFyIG8gPSAwO1xuICAgIHZhciB0b3QgPSAwO1xuICAgIGZvciAodmFyIGZuIGluIHIpIHtcbiAgICAgICAgdmFyIF9hID0gcltmbl0sIGZpbGUgPSBfYVswXSwgcCA9IF9hWzFdO1xuICAgICAgICB2YXIgY29tcHJlc3Npb24gPSBwLmxldmVsID09IDAgPyAwIDogODtcbiAgICAgICAgdmFyIGYgPSBzdHJUb1U4KGZuKSwgcyA9IGYubGVuZ3RoO1xuICAgICAgICB2YXIgY29tID0gcC5jb21tZW50LCBtID0gY29tICYmIHN0clRvVTgoY29tKSwgbXMgPSBtICYmIG0ubGVuZ3RoO1xuICAgICAgICB2YXIgZXhsID0gZXhmbChwLmV4dHJhKTtcbiAgICAgICAgaWYgKHMgPiA2NTUzNSlcbiAgICAgICAgICAgIGVycigxMSk7XG4gICAgICAgIHZhciBkID0gY29tcHJlc3Npb24gPyBkZWZsYXRlU3luYyhmaWxlLCBwKSA6IGZpbGUsIGwgPSBkLmxlbmd0aDtcbiAgICAgICAgdmFyIGMgPSBjcmMoKTtcbiAgICAgICAgYy5wKGZpbGUpO1xuICAgICAgICBmaWxlcy5wdXNoKG1yZyhwLCB7XG4gICAgICAgICAgICBzaXplOiBmaWxlLmxlbmd0aCxcbiAgICAgICAgICAgIGNyYzogYy5kKCksXG4gICAgICAgICAgICBjOiBkLFxuICAgICAgICAgICAgZjogZixcbiAgICAgICAgICAgIG06IG0sXG4gICAgICAgICAgICB1OiBzICE9IGZuLmxlbmd0aCB8fCAobSAmJiAoY29tLmxlbmd0aCAhPSBtcykpLFxuICAgICAgICAgICAgbzogbyxcbiAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjb21wcmVzc2lvblxuICAgICAgICB9KSk7XG4gICAgICAgIG8gKz0gMzAgKyBzICsgZXhsICsgbDtcbiAgICAgICAgdG90ICs9IDc2ICsgMiAqIChzICsgZXhsKSArIChtcyB8fCAwKSArIGw7XG4gICAgfVxuICAgIHZhciBvdXQgPSBuZXcgdTgodG90ICsgMjIpLCBvZSA9IG8sIGNkbCA9IHRvdCAtIG87XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgZiA9IGZpbGVzW2ldO1xuICAgICAgICB3emgob3V0LCBmLm8sIGYsIGYuZiwgZi51LCBmLmMubGVuZ3RoKTtcbiAgICAgICAgdmFyIGJhZGQgPSAzMCArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpO1xuICAgICAgICBvdXQuc2V0KGYuYywgZi5vICsgYmFkZCk7XG4gICAgICAgIHd6aChvdXQsIG8sIGYsIGYuZiwgZi51LCBmLmMubGVuZ3RoLCBmLm8sIGYubSksIG8gKz0gMTYgKyBiYWRkICsgKGYubSA/IGYubS5sZW5ndGggOiAwKTtcbiAgICB9XG4gICAgd3pmKG91dCwgbywgZmlsZXMubGVuZ3RoLCBjZGwsIG9lKTtcbiAgICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgcGFzcy10aHJvdWdoIGRlY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlc1xuICovXG52YXIgVW56aXBQYXNzVGhyb3VnaCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBVbnppcFBhc3NUaHJvdWdoKCkge1xuICAgIH1cbiAgICBVbnppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICAvLyBzYW1lIGFzIFppcFBhc3NUaHJvdWdoOiBjYXN0IHRvIHJldGFpbiBCdWZmZXIgZXJnb25vbWljc1xuICAgICAgICB0aGlzLm9uZGF0YShudWxsLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgVW56aXBQYXNzVGhyb3VnaC5jb21wcmVzc2lvbiA9IDA7XG4gICAgcmV0dXJuIFVuemlwUGFzc1Rocm91Z2g7XG59KCkpO1xuZXhwb3J0IHsgVW56aXBQYXNzVGhyb3VnaCB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXMuIFByZWZlciBBc3luY1ppcEluZmxhdGUgZm9yXG4gKiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gKi9cbnZhciBVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFVuemlwSW5mbGF0ZSgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFVuemlwSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuaS5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMub25kYXRhKGUsIG51bGwsIGZpbmFsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgVW56aXBJbmZsYXRlLmNvbXByZXNzaW9uID0gODtcbiAgICByZXR1cm4gVW56aXBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IFVuemlwSW5mbGF0ZSB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBBc3luY1VuemlwSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgREVGTEFURSBkZWNvbXByZXNzaW9uIHRoYXQgY2FuIGJlIHVzZWQgaW4gWklQIGFyY2hpdmVzXG4gICAgICovXG4gICAgZnVuY3Rpb24gQXN5bmNVbnppcEluZmxhdGUoXywgc3opIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKHN6IDwgMzIwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmkgPSBuZXcgSW5mbGF0ZShmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEFzeW5jSW5mbGF0ZShmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudGVybWluYXRlID0gdGhpcy5pLnRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBBc3luY1VuemlwSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKHRoaXMuaS50ZXJtaW5hdGUpXG4gICAgICAgICAgICBjaHVuayA9IHNsYyhjaHVuaywgMCk7XG4gICAgICAgIHRoaXMuaS5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICBBc3luY1VuemlwSW5mbGF0ZS5jb21wcmVzc2lvbiA9IDg7XG4gICAgcmV0dXJuIEFzeW5jVW56aXBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jVW56aXBJbmZsYXRlIH07XG4vKipcbiAqIEEgWklQIGFyY2hpdmUgZGVjb21wcmVzc2lvbiBzdHJlYW0gdGhhdCBlbWl0cyBmaWxlcyBhcyB0aGV5IGFyZSBkaXNjb3ZlcmVkXG4gKi9cbnZhciBVbnppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgWklQIGRlY29tcHJlc3Npb24gc3RyZWFtXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGEgZmlsZSBpbiB0aGUgWklQIGFyY2hpdmUgaXMgZm91bmRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBVbnppcChjYikge1xuICAgICAgICB0aGlzLm9uZmlsZSA9IGNiO1xuICAgICAgICB0aGlzLmsgPSBbXTtcbiAgICAgICAgdGhpcy5vID0ge1xuICAgICAgICAgICAgMDogVW56aXBQYXNzVGhyb3VnaFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnAgPSBldDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgdW56aXBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgVW56aXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5vbmZpbGUpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICghdGhpcy5wKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICBpZiAodGhpcy5jID4gMCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IE1hdGgubWluKHRoaXMuYywgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciB0b0FkZCA9IGNodW5rLnN1YmFycmF5KDAsIGxlbik7XG4gICAgICAgICAgICB0aGlzLmMgLT0gbGVuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgICAgICB0aGlzLmQucHVzaCh0b0FkZCwgIXRoaXMuYyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5rWzBdLnB1c2godG9BZGQpO1xuICAgICAgICAgICAgY2h1bmsgPSBjaHVuay5zdWJhcnJheShsZW4pO1xuICAgICAgICAgICAgaWYgKGNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZiA9IDAsIGkgPSAwLCBpcyA9IHZvaWQgMCwgYnVmID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnAubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJ1ZiA9IGNodW5rO1xuICAgICAgICAgICAgZWxzZSBpZiAoIWNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidWYgPSB0aGlzLnA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWYgPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgYnVmLnNldCh0aGlzLnApLCBidWYuc2V0KGNodW5rLCB0aGlzLnAubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsID0gYnVmLmxlbmd0aCwgb2MgPSB0aGlzLmMsIGFkZCA9IG9jICYmIHRoaXMuZDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzaWcgPSBiNChidWYsIGkpO1xuICAgICAgICAgICAgICAgIGlmIChzaWcgPT0gMHg0MDM0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgIGYgPSAxLCBpcyA9IGk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNfMS5kID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmYgPSBiMihidWYsIGkgKyA2KSwgY21wXzEgPSBiMihidWYsIGkgKyA4KSwgdSA9IGJmICYgMjA0OCwgZGQgPSBiZiAmIDgsIGZubCA9IGIyKGJ1ZiwgaSArIDI2KSwgZXMgPSBiMihidWYsIGkgKyAyOCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsID4gaSArIDMwICsgZm5sICsgZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGtzXzMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5rLnVuc2hpZnQoY2hrc18zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxzYyA9IGI0KGJ1ZiwgaSArIDE4KSwgbHN1ID0gYjQoYnVmLCBpICsgMjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZuXzEgPSBzdHJGcm9tVTgoYnVmLnN1YmFycmF5KGkgKyAzMCwgaSArPSAzMCArIGZubCksICF1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfYSA9IHo2NGhzKGJ1ZiwgaSwgZXMsIDIsIGxzYywgbHN1LCAwKSwgc2NfMSA9IF9hWzBdLCBzdV8xID0gX2FbMV0sIHo2NCA9IF9hWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjXzEgPSAtMSAtIHo2NDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuYyA9IHNjXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGVfMSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmbl8xLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjbXBfMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbGVfMS5vbmRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2NfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVfMS5vbmRhdGEobnVsbCwgZXQsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdHIgPSBfdGhpcy5vW2NtcF8xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVfMS5vbmRhdGEoZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjbXBfMSwgMSksIG51bGwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMSA9IHNjXzEgPCAwID8gbmV3IGN0cihmbl8xKSA6IG5ldyBjdHIoZm5fMSwgc2NfMSwgc3VfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEub25kYXRhID0gZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkgeyBmaWxlXzEub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7IH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNoa3NfNCA9IGNoa3NfMzsgX2kgPCBjaGtzXzQubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdCA9IGNoa3NfNFtfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZF8xLnB1c2goZGF0LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMua1swXSA9PSBjaGtzXzMgJiYgX3RoaXMuYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5kID0gZF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS5wdXNoKGV0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVybWluYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkXzEgJiYgZF8xLnRlcm1pbmF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjXzEgPj0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEuc2l6ZSA9IHNjXzEsIGZpbGVfMS5vcmlnaW5hbFNpemUgPSBzdV8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLm9uZmlsZShmaWxlXzEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaWcgPT0gMHg4MDc0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcyA9IGkgKz0gMTIgKyAob2MgPT0gLTIgJiYgOCksIGYgPSAzLCB0aGlzXzEuYyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNpZyA9PSAweDIwMTRCNTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzID0gaSAtPSA0LCBmID0gMywgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdGhpc18xID0gdGhpcztcbiAgICAgICAgICAgIGZvciAoOyBpIDwgbCAtIDQ7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZV8xID0gX2xvb3BfMigpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZV8xID09PSBcImJyZWFrXCIpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgICAgICAgICBpZiAob2MgPCAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdCA9IGYgPyBidWYuc3ViYXJyYXkoMCwgaXMgLSAxMiAtIChvYyA9PSAtMiAmJiA4KSAtIChiNChidWYsIGlzIC0gMTYpID09IDB4ODA3NEI1MCAmJiA0KSkgOiBidWYuc3ViYXJyYXkoMCwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZClcbiAgICAgICAgICAgICAgICAgICAgYWRkLnB1c2goZGF0LCAhIWYpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rWysoZiA9PSAyKV0ucHVzaChkYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGYgJiAyKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goYnVmLnN1YmFycmF5KGkpLCBmaW5hbCk7XG4gICAgICAgICAgICB0aGlzLnAgPSBidWYuc3ViYXJyYXkoaSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jKVxuICAgICAgICAgICAgICAgIGVycigxMyk7XG4gICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBkZWNvZGVyIHdpdGggdGhlIHN0cmVhbSwgYWxsb3dpbmcgZm9yIGZpbGVzIGNvbXByZXNzZWQgd2l0aFxuICAgICAqIHRoZSBjb21wcmVzc2lvbiB0eXBlIHByb3ZpZGVkIHRvIGJlIGV4cGFuZGVkIGNvcnJlY3RseVxuICAgICAqIEBwYXJhbSBkZWNvZGVyIFRoZSBkZWNvZGVyIGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgVW56aXAucHJvdG90eXBlLnJlZ2lzdGVyID0gZnVuY3Rpb24gKGRlY29kZXIpIHtcbiAgICAgICAgdGhpcy5vW2RlY29kZXIuY29tcHJlc3Npb25dID0gZGVjb2RlcjtcbiAgICB9O1xuICAgIHJldHVybiBVbnppcDtcbn0oKSk7XG5leHBvcnQgeyBVbnppcCB9O1xudmFyIG10ID0gdHlwZW9mIHF1ZXVlTWljcm90YXNrID09ICdmdW5jdGlvbicgPyBxdWV1ZU1pY3JvdGFzayA6IHR5cGVvZiBzZXRUaW1lb3V0ID09ICdmdW5jdGlvbicgPyBzZXRUaW1lb3V0IDogZnVuY3Rpb24gKGZuKSB7IGZuKCk7IH07XG5leHBvcnQgZnVuY3Rpb24gdW56aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICB2YXIgdGVybSA9IFtdO1xuICAgIHZhciB0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlcm0ubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICB0ZXJtW2ldKCk7XG4gICAgfTtcbiAgICB2YXIgZmlsZXMgPSB7fTtcbiAgICB2YXIgY2JkID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgbXQoZnVuY3Rpb24gKCkgeyBjYihhLCBiKTsgfSk7XG4gICAgfTtcbiAgICBtdChmdW5jdGlvbiAoKSB7IGNiZCA9IGNiOyB9KTtcbiAgICB2YXIgZSA9IGRhdGEubGVuZ3RoIC0gMjI7XG4gICAgZm9yICg7IGI0KGRhdGEsIGUpICE9IDB4NjA1NEI1MDsgLS1lKSB7XG4gICAgICAgIGlmICghZSB8fCBkYXRhLmxlbmd0aCAtIGUgPiA2NTU1OCkge1xuICAgICAgICAgICAgY2JkKGVycigxMywgMCwgMSksIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIHRBbGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIHZhciBsZnQgPSBiMihkYXRhLCBlICsgOCk7XG4gICAgaWYgKGxmdCkge1xuICAgICAgICB2YXIgYyA9IGxmdDtcbiAgICAgICAgdmFyIG8gPSBiNChkYXRhLCBlICsgMTYpO1xuICAgICAgICB2YXIgeiA9IGI0KGRhdGEsIGUgLSAyMCkgPT0gMHg3MDY0QjUwO1xuICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgdmFyIHplID0gYjQoZGF0YSwgZSAtIDEyKTtcbiAgICAgICAgICAgIHogPSBiNChkYXRhLCB6ZSkgPT0gMHg2MDY0QjUwO1xuICAgICAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgICAgICBjID0gbGZ0ID0gYjQoZGF0YSwgemUgKyAzMik7XG4gICAgICAgICAgICAgICAgbyA9IGI0KGRhdGEsIHplICsgNDgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBmbHRyID0gb3B0cyAmJiBvcHRzLmZpbHRlcjtcbiAgICAgICAgdmFyIF9sb29wXzMgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIF9hID0gemgoZGF0YSwgbywgeiksIGNfMSA9IF9hWzBdLCBzYyA9IF9hWzFdLCBzdSA9IF9hWzJdLCBmbiA9IF9hWzNdLCBubyA9IF9hWzRdLCBvZmYgPSBfYVs1XSwgYiA9IHNsemgoZGF0YSwgb2ZmKTtcbiAgICAgICAgICAgIG8gPSBubztcbiAgICAgICAgICAgIHZhciBjYmwgPSBmdW5jdGlvbiAoZSwgZCkge1xuICAgICAgICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgY2JkKGUsIG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIS0tbGZ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JkKG51bGwsIGZpbGVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKCFmbHRyIHx8IGZsdHIoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGZuLFxuICAgICAgICAgICAgICAgIHNpemU6IHNjLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsU2l6ZTogc3UsXG4gICAgICAgICAgICAgICAgY29tcHJlc3Npb246IGNfMVxuICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNfMSlcbiAgICAgICAgICAgICAgICAgICAgY2JsKG51bGwsIHNsYyhkYXRhLCBiLCBiICsgc2MpKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjXzEgPT0gOCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbCA9IGRhdGEuc3ViYXJyYXkoYiwgYiArIHNjKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3luY2hyb25vdXNseSBkZWNvbXByZXNzIHVuZGVyIDUxMktCLCBvciBiYXJlbHktY29tcHJlc3NlZCBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdSA8IDUyNDI4OCB8fCBzYyA+IDAuOCAqIHN1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNibChudWxsLCBpbmZsYXRlU3luYyhpbmZsLCB7IG91dDogbmV3IHU4KHN1KSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNibChlLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXJtLnB1c2goaW5mbGF0ZShpbmZsLCB7IHNpemU6IHN1IH0sIGNibCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNibChlcnIoMTQsICd1bmtub3duIGNvbXByZXNzaW9uIHR5cGUgJyArIGNfMSwgMSksIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNibChudWxsLCBudWxsKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjOyArK2kpIHtcbiAgICAgICAgICAgIF9sb29wXzMoaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBjYmQobnVsbCwge30pO1xuICAgIHJldHVybiB0QWxsO1xufVxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGRlY29tcHJlc3NlcyBhIFpJUCBhcmNoaXZlLiBQcmVmZXIgdXNpbmcgYHVuemlwYCBmb3IgYmV0dGVyXG4gKiBwZXJmb3JtYW5jZSB3aXRoIG1vcmUgdGhhbiBvbmUgZmlsZS5cbiAqIEBwYXJhbSBkYXRhIFRoZSByYXcgY29tcHJlc3NlZCBaSVAgZmlsZVxuICogQHBhcmFtIG9wdHMgVGhlIFpJUCBleHRyYWN0aW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgZmlsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgdmFyIGZpbGVzID0ge307XG4gICAgdmFyIGUgPSBkYXRhLmxlbmd0aCAtIDIyO1xuICAgIGZvciAoOyBiNChkYXRhLCBlKSAhPSAweDYwNTRCNTA7IC0tZSkge1xuICAgICAgICBpZiAoIWUgfHwgZGF0YS5sZW5ndGggLSBlID4gNjU1NTgpXG4gICAgICAgICAgICBlcnIoMTMpO1xuICAgIH1cbiAgICA7XG4gICAgdmFyIGMgPSBiMihkYXRhLCBlICsgOCk7XG4gICAgaWYgKCFjKVxuICAgICAgICByZXR1cm4ge307XG4gICAgdmFyIG8gPSBiNChkYXRhLCBlICsgMTYpO1xuICAgIHZhciB6ID0gYjQoZGF0YSwgZSAtIDIwKSA9PSAweDcwNjRCNTA7XG4gICAgaWYgKHopIHtcbiAgICAgICAgdmFyIHplID0gYjQoZGF0YSwgZSAtIDEyKTtcbiAgICAgICAgeiA9IGI0KGRhdGEsIHplKSA9PSAweDYwNjRCNTA7XG4gICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICBjID0gYjQoZGF0YSwgemUgKyAzMik7XG4gICAgICAgICAgICBvID0gYjQoZGF0YSwgemUgKyA0OCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGZsdHIgPSBvcHRzICYmIG9wdHMuZmlsdGVyO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYzsgKytpKSB7XG4gICAgICAgIHZhciBfYSA9IHpoKGRhdGEsIG8sIHopLCBjXzIgPSBfYVswXSwgc2MgPSBfYVsxXSwgc3UgPSBfYVsyXSwgZm4gPSBfYVszXSwgbm8gPSBfYVs0XSwgb2ZmID0gX2FbNV0sIGIgPSBzbHpoKGRhdGEsIG9mZik7XG4gICAgICAgIG8gPSBubztcbiAgICAgICAgaWYgKCFmbHRyIHx8IGZsdHIoe1xuICAgICAgICAgICAgbmFtZTogZm4sXG4gICAgICAgICAgICBzaXplOiBzYyxcbiAgICAgICAgICAgIG9yaWdpbmFsU2l6ZTogc3UsXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogY18yXG4gICAgICAgIH0pKSB7XG4gICAgICAgICAgICBpZiAoIWNfMilcbiAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBzbGMoZGF0YSwgYiwgYiArIHNjKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNfMiA9PSA4KVxuICAgICAgICAgICAgICAgIGZpbGVzW2ZuXSA9IGluZmxhdGVTeW5jKGRhdGEuc3ViYXJyYXkoYiwgYiArIHNjKSwgeyBvdXQ6IG5ldyB1OChzdSkgfSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjXzIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaWxlcztcbn1cbiIsICJpbXBvcnQgeyBBcHAsIERhdGFBZGFwdGVyLCBub3JtYWxpemVQYXRoLCByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncywgTm9pc2VJdGVtIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuaW1wb3J0IHsgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLCBNSU1FX1RZUEVTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcbmltcG9ydCB0eXBlIHsgRGF5RGF0YSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHsgUFJPVE9DT0xfVkVSU0lPTiwgSU5CT1VORF9QUkVGSVhFUyB9IGZyb20gJy4vcHJvdG9jb2wnO1xuXG4vKiogT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU2Q0U4XHU1MTY1XHU3Njg0XHU0RTNCXHU3QTk3XHU1M0UzIGRvY3VtZW50XHVGRjA4XHU5NzVFXHU2M0QyXHU0RUY2XHU2Qzk5XHU3QkIxXHU1MTg1XHU3Njg0IGRvY3VtZW50XHVGRjA5ICovXG5kZWNsYXJlIGNvbnN0IGFjdGl2ZURvY3VtZW50OiBEb2N1bWVudDtcblxuLyoqIFx1NjI2Qlx1NjNDRlx1OTdGM1x1OTg5MVx1NjVGNlx1OUVEOFx1OEJBNFx1OERGM1x1OEZDN1x1NzY4NFx1NzZFRVx1NUY1NVx1NTQwRCAqL1xuY29uc3QgU0tJUF9ESVJTID0gWycudHJhc2gnLCAnLmdpdCcsICdub2RlX21vZHVsZXMnXTtcblxuLyoqXG4gKiBcdTY4MjFcdTlBOENcdTk3RjNcdTZFOTBcdTRFRTNcdTc0MDYgVVJMXHVGRjFBXHU0RUM1XHU1MTQxXHU4QkI4IGh0dHAvaHR0cHMgXHU1MzRGXHU4QkFFXHVGRjBDXHU5NjUwXHU1MjM2XHU5NTdGXHU1RUE2XHVGRjBDXG4gKiBcdTk2MzJcdTZCNjIgYGFwcDpwcm94eUF1ZGlvVXJsYCBcdTYyMTBcdTRFM0FcdThGRDBcdTg4NENcdTU3MjhcdTc1MjhcdTYyMzdcdTY3M0FcdTU2NjhcdTRFMEFcdTc2ODRcdTVGMDBcdTY1M0UgZmV0Y2ggXHU0RUUzXHU3NDA2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkQXVkaW9VcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCF1cmwgfHwgdHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgaWYgKHVybC5sZW5ndGggPiAyMDQ4KSByZXR1cm4gZmFsc2U7XG4gIGxldCBwYXJzZWQ6IFVSTDtcbiAgdHJ5IHtcbiAgICBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGFyc2VkLnByb3RvY29sID09PSAnaHR0cDonIHx8IHBhcnNlZC5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG59XG5cbi8qKiBBcnJheUJ1ZmZlciBcdTIxOTIgYmFzZTY0IFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTkyN1x1NjU4N1x1NEVGNlx1NTIwNlx1NTc1N1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEMwM1x1NzUyOFx1NjgwOFx1NkVBMlx1NTFGQVx1RkYwOSAqL1xuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXI6IEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICBsZXQgYmluYXJ5ID0gJyc7XG4gIGNvbnN0IGNodW5rU2l6ZSA9IDB4ODAwMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gY2h1bmtTaXplKSB7XG4gICAgY29uc3QgY2h1bmsgPSBieXRlcy5zdWJhcnJheShpLCBpICsgY2h1bmtTaXplKTtcbiAgICBsZXQgY2h1bmtTdHIgPSAnJztcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNodW5rLmxlbmd0aDsgaisrKSB7XG4gICAgICBjaHVua1N0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNodW5rW2pdKTtcbiAgICB9XG4gICAgYmluYXJ5ICs9IGNodW5rU3RyO1xuICB9XG4gIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbi8qKlxuICogQXBwQVBJIFx1MjAxNCBcdTdFREZcdTRFMDBcdTkwMUFcdTRGRTFcdTYzQTVcdTUzRTNcbiAqXG4gKiBcdTY2RkZcdTRFRTNcdTY1RTdcdTc2ODQgQnJpZGdlU2VydmljZSArIFN0b3JhZ2VCcmlkZ2UgKyBUaGVtZUJyaWRnZSBcdTRFMDlcdTVDNDJcdTY3QjZcdTY3ODRcdUZGMENcbiAqIFx1NUMwNiBwb3N0TWVzc2FnZSBcdThERUZcdTc1MzFcdTMwMDFcdTVCNThcdTUwQThcdTY0Q0RcdTRGNUNcdTMwMDFcdTRFM0JcdTk4OThcdTU0MENcdTZCNjVcdTU0MDhcdTVFNzZcdTRFM0FcdTUzNTVcdTRFMDAgQVBJXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBBUEkge1xuICBwcml2YXRlIHN0b3JhZ2U6IFZhdWx0U3RvcmFnZTtcbiAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2U7XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogXHUzMDBDXHU2MjE4XHU3NTY1XHU1OTBEXHU3NkQ4XHU5NzYyXHU2NzdGIFx1MjE5MiBBSSBcdTY1MzlcdThGREJcdTMwMERcdTUxNjVcdTUzRTNcdTU2REVcdThDMDNcdUZGMDhcdTc1MzEgRGFpbHlSZXZpZXdWaWV3IFx1NkNFOFx1NTE2NVx1RkYwQ1x1OEY2Q1x1NTNEMVx1NTIzMFx1NjNEMlx1NEVGNiByZXF1ZXN0QWlJbXByb3ZlXHVGRjA5XHUzMDAyXG4gICAqIHdlYmFwcCBcdTUwNjVcdTVFQjdcdTUyMDZcdThCRTZcdTYwQzVcdTcwQjlcdTMwMENcdTc1MjggQUkgXHU2NTM5XHU4RkRCXHUzMDBEXHU2NUY2XHU4OUU2XHU1M0QxXHVGRjBDXHU1M0MyXHU2NTcwXHU0RTNBXHU3NkVFXHU2ODA3XHU2ODA3XHU4QkM2ICsgXHU2NzJDXHU1NzMwIGhpbnRzXHUzMDAyXG4gICAqL1xuICBvbkFpSW1wcm92ZUdvYWw/OiAocGF5bG9hZDogeyBnb2FsSWQ6IHN0cmluZzsgdGl0bGU/OiBzdHJpbmc7IGhpbnRzPzogc3RyaW5nIH0pID0+IHZvaWQ7XG4gIHByaXZhdGUgY3VzdG9tVGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gIHByaXZhdGUgdmF1bHRBZGFwdGVyOiBEYXRhQWRhcHRlcjtcbiAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBjb25maWdEaXI6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+LFxuICAgIG5vaXNlUGF0aDogc3RyaW5nLFxuICAgIGNvbmZpZ0Rpcjogc3RyaW5nXG4gICkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUF3ZWJhcHAgXHU4QkZCXHU1M0Q2XHU3NkVFXHU2ODA3XHU3Njg0XHU1QjlFXHU5NjQ1XHU4REVGXHU1Rjg0XHU3NTMxXHU2QjY0XHU1OTA0XHU1MUIzXHU1QjlBXHVGRjA4VmF1bHRTdG9yYWdlIFx1OUVEOFx1OEJBNCBiYXNlUGF0aCA9IGJhbWJvby1yZXZpZXdcdUZGMDlcdTMwMDJcbiAgICAvLyB3cml0ZUFpR29hbHMgXHU1RkM1XHU5ODdCXHU1MTk5XHU1MTY1XHU1NDBDXHU0RTAwXHU4REVGXHU1Rjg0XHVGRjBDXHU1NDI2XHU1MjE5IEFJIFx1NzZFRVx1NjgwN1x1NEUwRFx1NjYzRVx1NzkzQVx1MzAwMlx1OEJFNlx1ODlDMSBtYWluLnRzIHdyaXRlQWlHb2FscyBcdTc2ODRcdTZDRThcdTkxQ0FcdTMwMDJcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKGFwcCk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG5ldyBUaGVtZUJyaWRnZSgpO1xuICAgIHRoaXMudmF1bHRBZGFwdGVyID0gYXBwLnZhdWx0LmFkYXB0ZXI7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gICAgdGhpcy5jb25maWdEaXIgPSBjb25maWdEaXI7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU1QjU4XHU1MEE4XHU3RUQzXHU2Nzg0XHU1QjU4XHU1NzI4ICovXG4gIGFzeW5jIGVuc3VyZVN0cnVjdHVyZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcbiAgICogXHU5ODg0XHU2Q0U4XHU1MThDIG1lc3NhZ2UgXHU3NkQxXHU1NDJDXHU1NjY4XHUzMDAyXG4gICAqIFx1NTcyOCBpZnJhbWUgXHU1MjFCXHU1RUZBXHU1MjREXHU4QzAzXHU3NTI4XHVGRjBDXHU2RDg4XHU5NjY0XHU3QURFXHU2MDAxXHU3QTk3XHU1M0UzXHUzMDAyXG4gICAqIFx1NEY3Rlx1NzUyOCBhY3RpdmVEb2N1bWVudC5kZWZhdWx0Vmlld1x1RkYwOFx1NEUzQiBPYnNpZGlhbiBcdTdBOTdcdTUzRTNcdUZGMDlcdTgwMENcdTk3NUVcdTYzRDJcdTRFRjZcdTZDOTlcdTdCQjEgd2luZG93XHUzMDAyXG4gICAqL1xuICBzdGFydExpc3RlbmluZygpOiB2b2lkIHtcbiAgICB0aGlzLmRldGFjaCgpO1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLm9uTWVzc2FnZShldmVudCk7XG4gICAgfTtcbiAgICAvLyBicmlkZ2UuanMgXHU3Njg0IHBvc3RNZXNzYWdlIFx1NzZFRVx1NjgwN1x1NjYyRiB3aW5kb3cucGFyZW50XHVGRjA4XHU0RTNCIE9ic2lkaWFuIFx1N0E5N1x1NTNFM1x1RkYwOVx1RkYwQ1xuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NTcyOFx1OEJFNVx1N0E5N1x1NTNFM1x1NEUwQVx1NzZEMVx1NTQyQ1x1NjI0RFx1ODBGRFx1NjUzNlx1NTIzMFx1NkQ4OFx1NjA2Rlx1RkYwOFx1NjNEMlx1NEVGNlx1NkM5OVx1N0JCMVx1NzY4NCB3aW5kb3cgXHU0RTBEXHU2NjJGXHU1NDBDXHU0RTAwXHU1QkY5XHU4QzYxXHVGRjA5XHUzMDAyXG4gICAgKGFjdGl2ZURvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdykuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBcdTdFRDFcdTVCOUEgaWZyYW1lIFx1NUYxNVx1NzUyOFx1NUU3Nlx1NTIxRFx1NTlDQlx1NTMxNlx1NEUzQlx1OTg5OFx1Njg2NVx1NjNBNVx1MzAwMlxuICAgKiBcdTU3MjggaWZyYW1lIFx1NTE0M1x1N0QyMFx1NTIxQlx1NUVGQVx1NTQwRVx1OEMwM1x1NzUyOFx1RkYwQ1x1NEY5QiByZXNwb25kKCkgXHU4M0I3XHU1M0Q2IGNvbnRlbnRXaW5kb3dcdTMwMDJcbiAgICovXG4gIGJpbmRJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG4gIH1cblxuICAvKiogXHU3RUQxXHU1QjlBIGlmcmFtZSBcdTVFNzZcdTVGMDBcdTU5Q0JcdTc2RDFcdTU0MkNcdTZEODhcdTYwNkZcdUZGMDhcdTRFMDBcdTZCNjVcdTUyMzBcdTRGNERcdUZGMENcdTUxN0NcdTVCQjlcdTY1RTdcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgYXR0YWNoKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLnN0YXJ0TGlzdGVuaW5nKCk7XG4gICAgdGhpcy5iaW5kSWZyYW1lKGlmcmFtZSk7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxXHU1RTc2XHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZXNzYWdlSGFuZGxlcikge1xuICAgICAgKGFjdGl2ZURvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdykucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICAgICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMudGhlbWVCcmlkZ2UuZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMVx1RkYwOFx1NzUzMSBEYWlseVJldmlld1ZpZXcgXHU3Njg0IGNzcy1jaGFuZ2UgXHU0RThCXHU0RUY2XHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIG9uVGhlbWVDaGFuZ2VkKGZvbGxvd09ic2lkaWFuVGhlbWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUgPSBmb2xsb3dPYnNpZGlhblRoZW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NUUyNiB0eXBlIFx1NUI1N1x1NkJCNVx1RkYxQWJyaWRnZS5qcyBcdTc2ODQgcGFyc2VBcHBNZXNzYWdlIFx1ODk4MVx1NkM0MiB0eXBlb2YgZGF0YS50eXBlID09PSAnc3RyaW5nJ1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyB0eXBlOiAnc3RvcmFnZTpyZXNwb25zZScsIGlkLCBwYXlsb2FkIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kRXJyb3IoaWQ6IHN0cmluZywgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgdHlwZTogJ3N0b3JhZ2U6cmVzcG9uc2UnLCBpZCwgZXJyb3IgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdThERUZcdTc1MzEgKi9cbiAgcHJpdmF0ZSBhc3luYyBvbk1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1zZyA9IGV2ZW50LmRhdGEgYXMgeyB0eXBlPzogc3RyaW5nOyBpZD86IHN0cmluZzsgcGF5bG9hZD86IHVua25vd24gfTtcbiAgICBpZiAoIW1zZyB8fCAhbXNnLnR5cGUgfHwgIW1zZy5pZCkgcmV0dXJuO1xuXG4gICAgLy8gXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgLy8gXHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXHU3NjdEXHU1NDBEXHU1MzU1XHVGRjA4XHU5NjM2XHU2QkI1MyBcdTAwQjcgXHU1OTUxXHU3RUE2XHU1MzE2XHVGRjFBXHU0RUNFIHByb3RvY29sLnRzIFx1OTZDNlx1NEUyRFx1NUI5QVx1NEU0OVx1RkYwOVxuICAgIGlmICghSU5CT1VORF9QUkVGSVhFUy5zb21lKChwKSA9PiBtc2cudHlwZSEuc3RhcnRzV2l0aChwKSkpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZU1lc3NhZ2UobXNnLnR5cGUsIG1zZy5pZCwgbXNnLnBheWxvYWQgPz8ge30pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU1MjA2XHU1M0QxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlTWVzc2FnZSh0eXBlOiBzdHJpbmcsIGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyAtLS0tIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRiAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICAvLyBcdTk2MzZcdTZCQjUzIFx1MDBCNyBcdTU5NTFcdTdFQTZcdTUzMTZcdUZGMUFcdTcyNDhcdTY3MkNcdTUzNEZcdTU1NDYgXHUyMDE0IFx1NjNEMlx1NEVGNlx1NTM0N1x1N0VBN1x1NEY0NiB3ZWJhcHAgXHU3RjEzXHU1QjU4XHU2NUU3XHU3MjQ4XHU2NUY2XHU1M0VGXHU4OUMxXHU1NDRBXHU4QjY2XG4gICAgICBjb25zdCBwdiA9IChwYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KT8ucHJvdG9jb2xWZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBwdiA9PT0gJ251bWJlcicgJiYgcHYgIT09IFBST1RPQ09MX1ZFUlNJT04pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBbQmFtYm9vXSBcdTUzNEZcdThCQUVcdTcyNDhcdTY3MkNcdTRFMERcdTUzMzlcdTkxNERcdUZGMUFcdTYzRDJcdTRFRjY9JHtQUk9UT0NPTF9WRVJTSU9OfVx1RkYwQ3dlYmFwcD0ke3B2fVx1MzAwMmAgK1xuICAgICAgICAgICAgYFx1OEJGN1x1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1ODlDNlx1NTZGRVx1NEVFNVx1ODNCN1x1NTNENlx1NjcwMFx1NjVCMCB3ZWJhcHBcdTMwMDJgLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnIHx8IG51bGwsXG4gICAgICAgIGN1c3RvbVRoZW1lczogdGhpcy5jdXN0b21UaGVtZXMsXG4gICAgICAgIGN1c3RvbU5vaXNlczogdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zIHx8IFtdLFxuICAgICAgICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IHRoaXMuc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6Y2xvc2UnKSB7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkUgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnID0gcGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zID0gKEFycmF5LmlzQXJyYXkocGF5bG9hZCkgPyBwYXlsb2FkIDogW10pIGFzIE5vaXNlSXRlbVtdO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW5cdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgaHVlOiBudW1iZXI7IGxpZ2h0bmVzc09mZnNldDogbnVtYmVyOyBpc0Rhcms6IGJvb2xlYW4gfTtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbikge1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLmFwcGx5UGFsZXR0ZShwLmh1ZSwgcC5saWdodG5lc3NPZmZzZXQsIHAuaXNEYXJrKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OTFDRFx1NjVCMFx1NUYwMFx1NTQyRlx1NEUzQlx1OTg5OFx1OERERlx1OTY4Rlx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW5cdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6dGhlbWU6c3luYycpIHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKHRoaXMuc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNkJcdTYzQ0YgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuc2NhblZhdWx0QXVkaW9GaWxlcygpO1xuICAgICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdThCRkJcdTUzRDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTEgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVJlYWRWYXVsdEZpbGUoaWQsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU4QkZCXHU1M0Q2XHU2NzJDXHU2NzNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU5N0YzXHU5ODkxXHVGRjA4XHU1MTdDXHU1QkI5XHU2NUU3XHU5N0YzXHU2RTkwXHVGRjA5LS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVJlYWRMb2NhbEZpbGUoaWQsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU0RUUzXHU3NDA2XHU1OTE2XHU5MEU4XHU5N0YzXHU2RTkwXHU5NEZFXHU2M0E1XHVGRjA4XHU3RUQ1XHU4RkM3IHdlYnZpZXcgQ09SU1x1RkYwQ1x1Njg0Q1x1OTc2Mi9cdTc5RkJcdTUyQThcdTRFMDBcdTgxRjRcdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cHJveHlBdWRpb1VybCcpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUHJveHlBdWRpb1VybChpZCwgcGF5bG9hZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTYyMThcdTc1NjVcdTU5MERcdTc2RDhcdTk3NjJcdTY3N0YgXHUyMTkyIEFJIFx1NjUzOVx1OEZEQlx1NTE2NVx1NTNFMyAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6YWlJbXByb3ZlR29hbCcpIHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgZ29hbElkPzogdW5rbm93bjsgdGl0bGU/OiB1bmtub3duOyBoaW50cz86IHVua25vd24gfTtcbiAgICAgIGlmICh0eXBlb2YgcC5nb2FsSWQgIT09ICdzdHJpbmcnIHx8IHAuZ29hbElkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgJ2FwcDphaUltcHJvdmVHb2FsIFx1N0YzQVx1NUMxMSBnb2FsSWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5vbkFpSW1wcm92ZUdvYWw/Lih7XG4gICAgICAgIGdvYWxJZDogcC5nb2FsSWQsXG4gICAgICAgIHRpdGxlOiB0eXBlb2YgcC50aXRsZSA9PT0gJ3N0cmluZycgPyBwLnRpdGxlIDogdW5kZWZpbmVkLFxuICAgICAgICBoaW50czogdHlwZW9mIHAuaGludHMgPT09ICdzdHJpbmcnID8gcC5oaW50cyA6IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU1QjU4XHU1MEE4XHU3QzdCXHU2RDg4XHU2MDZGXHVGRjA4XHU1OUQ0XHU2MjU4XHU3RUQ5IFZhdWx0U3RvcmFnZVx1RkYwOS0tLS1cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmhhbmRsZVN0b3JhZ2VNZXNzYWdlKHR5cGUsIHBheWxvYWQpO1xuICAgIHRoaXMucmVzcG9uZChpZCwgcmVzdWx0KTtcbiAgfVxuXG4gIC8qKiBcdTVCNThcdTUwQThcdTZEODhcdTYwNkZcdTU5MDRcdTc0MDYgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTdG9yYWdlTWVzc2FnZSh0eXBlOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCBwID0gcGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cmVhZERheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5KHAuZGF0ZUtleSBhcyBzdHJpbmcpO1xuICAgICAgY2FzZSAnc3RvcmFnZTp3cml0ZURheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0RGF5KHAuZGF0YSBhcyBEYXlEYXRhKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6bGlzdERheXMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbERheXMoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZGVsZXRlRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVEYXkocC5kYXRlS2V5IGFzIHN0cmluZyk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFNldHRpbmcocC5rZXkgYXMgc3RyaW5nKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0U2V0dGluZyhwLmtleSBhcyBzdHJpbmcsIHAudmFsdWUpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRBbGxTZXR0aW5ncyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsU2V0dGluZ3MoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEdvYWxzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRHb2FscyhwLmdvYWxzIGFzIG5ldmVyKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRQdXJjaGFzZUhpc3RvcnkoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRQdXJjaGFzZUhpc3RvcnkocC5kYXRhIGFzIG5ldmVyKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0SW5jb21lSGlzdG9yeSgpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRJbmNvbWVIaXN0b3J5KHAuZGF0YSBhcyBuZXZlcik7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheUtleXMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheUtleXMoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5c1BhZ2luYXRlZChcbiAgICAgICAgICAocC5wYWdlIGFzIG51bWJlcikgPz8gMCxcbiAgICAgICAgICAocC5wYWdlU2l6ZSBhcyBudW1iZXIpID8/IDMwXG4gICAgICAgICk7XG4gICAgICBjYXNlICdzdG9yYWdlOmV4cG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZXhwb3J0QWxsRGF0YSgpO1xuICAgICAgY2FzZSAnc3RvcmFnZTppbXBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmltcG9ydERhdGEoXG4gICAgICAgICAgcC5kYXRhLFxuICAgICAgICAgIHsgc3RyYXRlZ3k6IChwLm9wdGlvbnMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pPy5zdHJhdGVneSBhcyAnb3ZlcndyaXRlJyB8ICdtZXJnZScgfCB1bmRlZmluZWQgfVxuICAgICAgICApO1xuICAgICAgY2FzZSAnc3RvcmFnZTpjbGVhckFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuY2xlYXJBbGwoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdG9yYWdlIG1lc3NhZ2UgdHlwZTogJHt0eXBlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0ZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjYgKi9cbiAgcHJpdmF0ZSBhc3luYyBzY2FuVmF1bHRBdWRpb0ZpbGVzKFxuICAgIG1heERlcHRoID0gNVxuICApOiBQcm9taXNlPEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCByZXN1bHRzOiBBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+ID0gW107XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXMudmF1bHRBZGFwdGVyO1xuXG4gICAgaWYgKHRoaXMubm9pc2VQYXRoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsaXN0ID0gYXdhaXQgYWRhcHRlci5saXN0KHRoaXMubm9pc2VQYXRoKTtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGxpc3QuZmlsZXMpIHtcbiAgICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGV4dCA9IGZpbGUuc3Vic3RyaW5nKGZpbGUubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAoQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLm5vaXNlUGF0aH0vJHtmaWxlfWApO1xuICAgICAgICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogZnVsbFBhdGgsIG5hbWU6IGZpbGUsIHNpemU6IHN0YXQ/LnNpemUgPz8gMCwgZXh0IH0pO1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8vIFx1NTE2OFx1NUU5M1x1NjI2Qlx1NjNDRlxuICAgIGNvbnN0IHNjYW5EaXIgPSBhc3luYyAocmVsYXRpdmVEaXI6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybjtcbiAgICAgIGxldCBsaXN0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdCA9IGF3YWl0IGFkYXB0ZXIubGlzdChyZWxhdGl2ZURpcik7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGZvbGRlciBvZiBsaXN0LmZvbGRlcnMpIHtcbiAgICAgICAgaWYgKGZvbGRlci5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBza2lwU2V0ID0gbmV3IFNldChbLi4uU0tJUF9ESVJTLCAuLi4odGhpcy5jb25maWdEaXIgPyBbdGhpcy5jb25maWdEaXJdIDogW10pXSk7XG4gICAgICAgIGlmIChza2lwU2V0Lmhhcyhmb2xkZXIpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc3ViUGF0aCA9IHJlbGF0aXZlRGlyID8gbm9ybWFsaXplUGF0aChgJHtyZWxhdGl2ZURpcn0vJHtmb2xkZXJ9YCkgOiBmb2xkZXI7XG4gICAgICAgIGF3YWl0IHNjYW5EaXIoc3ViUGF0aCwgZGVwdGggKyAxKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGxpc3QuZmlsZXMpIHtcbiAgICAgICAgaWYgKGZpbGUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZXh0ID0gZmlsZS5zdWJzdHJpbmcoZmlsZS5sYXN0SW5kZXhPZignLicpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmVEaXIgPyBub3JtYWxpemVQYXRoKGAke3JlbGF0aXZlRGlyfS8ke2ZpbGV9YCkgOiBmaWxlO1xuICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChyZWxhdGl2ZVBhdGgpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgcGF0aDogcmVsYXRpdmVQYXRoLCBuYW1lOiBmaWxlLCBzaXplOiBzdGF0Py5zaXplID8/IDAsIGV4dCB9KTtcbiAgICAgICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgc2NhbkRpcignJywgMCk7XG4gICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLnBhdGgubG9jYWxlQ29tcGFyZShiLnBhdGgpKTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKiBcdThCRkJcdTUzRDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdUZGMENcdThGRDRcdTU2REVcdTUzRUZcdTY0QURcdTY1M0VcdTc2ODQgYmFzZTY0IGRhdGEgVVJMXHVGRjA4XHU2ODRDXHU5NzYyL1x1NzlGQlx1NTJBOFx1NEUwMFx1ODFGNFx1RkYwQ1x1NEUwRFx1NEY5RFx1OEQ1NiBiYXNlUGF0aFx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZVJlYWRWYXVsdEZpbGUoaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwID0gcGF5bG9hZCBhcyB7IHBhdGg6IHN0cmluZyB9O1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcC5wYXRoIHx8ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG5cbiAgICAgIGNvbnN0IGV4dCA9IHJlbGF0aXZlUGF0aC5zdWJzdHJpbmcocmVsYXRpdmVQYXRoLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NEUwRFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjgzQ1x1NUYwRlx1RkYxQScgKyBleHQpO1xuICAgICAgaWYgKHJlbGF0aXZlUGF0aC5pbmNsdWRlcygnLi4nKSkgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjInKTtcblxuICAgICAgY29uc3QgYWRhcHRlciA9IHRoaXMudmF1bHRBZGFwdGVyO1xuICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChyZWxhdGl2ZVBhdGgpO1xuICAgICAgaWYgKCFzdGF0IHx8IHN0YXQudHlwZSAhPT0gJ2ZpbGUnKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQScgKyByZWxhdGl2ZVBhdGgpO1xuXG4gICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBhZGFwdGVyLnJlYWRCaW5hcnkocmVsYXRpdmVQYXRoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBkYXRhOiB0aGlzLnRvRGF0YVVybChidWZmZXIsIGV4dCkgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IoaWQsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU4QkZCXHU1M0Q2XHU2NzJDXHU2NzNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU5N0YzXHU5ODkxXHVGRjA4XHU1MTdDXHU1QkI5XHU2NUU3XHU5N0YzXHU2RTkwXHVGRjFCXHU3OUZCXHU1MkE4XHU3QUVGXHU2Qzk5XHU3NkQyXHU0RTBCXHU1M0VGXHU4MEZEXHU0RTBEXHU1M0VGXHU4QkZCXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUmVhZExvY2FsRmlsZShpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgcGF0aDogc3RyaW5nIH07XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IHAucGF0aCB8fCAnJztcbiAgICAgIGlmICghZmlsZVBhdGgpIHRocm93IG5ldyBFcnJvcignXHU2NzJBXHU2M0QwXHU0RjlCXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0Jyk7XG5cbiAgICAgIGNvbnN0IGV4dCA9IGZpbGVQYXRoLnN1YnN0cmluZyhmaWxlUGF0aC5sYXN0SW5kZXhPZignLicpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgIGlmIChmaWxlUGF0aC5pbmNsdWRlcygnLi4nKSkgdGhyb3cgbmV3IEVycm9yKCdcdThERUZcdTVGODRcdTkwNERcdTUzODZcdTc5ODFcdTZCNjInKTtcblxuICAgICAgY29uc3QgYnVmZmVyID0gYXdhaXQgdGhpcy52YXVsdEFkYXB0ZXIucmVhZEJpbmFyeShmaWxlUGF0aCk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZGF0YTogdGhpcy50b0RhdGFVcmwoYnVmZmVyLCBleHQpIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU4QkZCXHU1M0Q2XHU2NzJDXHU1NzMwXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NEVFM1x1NzQwNlx1NTkxNlx1OTBFOFx1OTdGM1x1NkU5MFx1OTRGRVx1NjNBNVx1RkYxQVx1NjNEMlx1NEVGNlx1N0FFRiByZXF1ZXN0VXJsIFx1NEUwRFx1NTNENyB3ZWJ2aWV3IENPUlMgXHU5NjUwXHU1MjM2XHVGRjA4XHU2ODRDXHU5NzYyL1x1NzlGQlx1NTJBOFx1NTc0N1x1NjUyRlx1NjMwMVx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZVByb3h5QXVkaW9VcmwoaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwID0gcGF5bG9hZCBhcyB7IHVybDogc3RyaW5nIH07XG4gICAgICBjb25zdCB1cmwgPSBwLnVybCB8fCAnJztcbiAgICAgIGlmICghaXNWYWxpZEF1ZGlvVXJsKHVybCkpIHRocm93IG5ldyBFcnJvcignXHU5NzVFXHU2Q0Q1XHU5N0YzXHU2RTkwXHU5NEZFXHU2M0E1XHVGRjA4XHU0RUM1XHU2NTJGXHU2MzAxIGh0dHAvaHR0cHNcdUZGMDknKTtcblxuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHJlcXVlc3RVcmwoeyB1cmwsIG1ldGhvZDogJ0dFVCcgfSk7XG4gICAgICBpZiAocmVzcC5zdGF0dXMgPCAyMDAgfHwgcmVzcC5zdGF0dXMgPj0gMzAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignXHU5N0YzXHU2RTkwXHU4QkJGXHU5NUVFXHU1OTMxXHU4RDI1IChIVFRQICcgKyByZXNwLnN0YXR1cyArICcpJyk7XG4gICAgICB9XG4gICAgICBjb25zdCBidWZmZXIgPSByZXNwLmFycmF5QnVmZmVyO1xuICAgICAgaWYgKCFidWZmZXIpIHRocm93IG5ldyBFcnJvcignXHU5N0YzXHU2RTkwXHU1NENEXHU1RTk0XHU0RTNBXHU3QTdBJyk7XG5cbiAgICAgIGNvbnN0IG1pbWUgPSAocmVzcC5oZWFkZXJzICYmIHJlc3AuaGVhZGVyc1snY29udGVudC10eXBlJ10pIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IGRhdGE6IGBkYXRhOiR7bWltZX07YmFzZTY0LCR7YXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpfWAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IoaWQsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdTRFRTNcdTc0MDZcdTk3RjNcdTZFOTBcdTU5MzFcdThEMjUnKTtcbiAgICB9XG4gIH1cblxuICAvKiogQXJyYXlCdWZmZXIgXHUyMTkyIFx1NUUyNiBNSU1FIFx1NzY4NCBiYXNlNjQgZGF0YSBVUkwgKi9cbiAgcHJpdmF0ZSB0b0RhdGFVcmwoYnVmZmVyOiBBcnJheUJ1ZmZlciwgZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1pbWUgPSBNSU1FX1RZUEVTW2V4dF0gfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG4gICAgcmV0dXJuIGBkYXRhOiR7bWltZX07YmFzZTY0LCR7YXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpfWA7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIG5vcm1hbGl6ZVBhdGgsIFRGaWxlLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBJbXBvcnRWYWxpZGF0b3IgfSBmcm9tICcuL0ltcG9ydFZhbGlkYXRvcic7XG5pbXBvcnQgdHlwZSB7XG4gIERheURhdGEsXG4gIEdvYWxJdGVtLFxuICBBcHBTZXR0aW5ncyxcbiAgUHVyY2hhc2VIaXN0b3J5LFxuICBJbmNvbWVIaXN0b3J5LFxuICBFeHBvcnRTaGFwZSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbi8qKlxuICogVmF1bHRTdG9yYWdlIC0gXHU1QzAxXHU4OEM1IE9ic2lkaWFuIFZhdWx0IGFkYXB0ZXIgXHU3Njg0XHU2NTg3XHU0RUY2XHU2NENEXHU0RjVDXG4gKlxuICogVmF1bHQgXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0OlxuICogICB7YmFzZVBhdGh9L1xuICogICAgIGRhdGEvICAgICAgICAgIC0+IFx1NkJDRlx1NjVFNSBKU09OIFx1NjU3MFx1NjM2RVxuICogICAgIGdvYWxzLmpzb24gICAgIC0+IFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwN1xuICogICAgIHNldHRpbmdzLmpzb24gIC0+IFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVxuICogICAgIHRoZW1lcy8gICAgICAgIC0+IFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJlcG9ydHMvICAgICAgIC0+IFx1NjJBNVx1NTQ0QSAoXHU5ODg0XHU3NTU5KVxuICogICAgIHJldmlld3MvICAgICAgIC0+IE1hcmtkb3duIFx1NjQ1OFx1ODk4MVxuICovXG5leHBvcnQgY2xhc3MgVmF1bHRTdG9yYWdlIHtcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSBiYXNlUGF0aDogc3RyaW5nO1xuICAvKiogXHU1MTk5XHU1Qjg4XHU1MzZCXHVGRjFBXHU1REYyXHU4QjY2XHU1NDRBXHU4RkM3XHU3Njg0XHU4REVGXHU1Rjg0XHVGRjBDXHU3QjJDXHU0RThDXHU2QjIxXHU1MTk5XHU1MTY1XHU2NTNFXHU4ODRDXHVGRjA4XHU3NTI4XHU2MjM3XHU3ODZFXHU4QkE0XHU2MTBGXHU1NkZFXHVGRjA5ICovXG4gIHByaXZhdGUgX3dhcm5lZFBhdGhzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGJhc2VQYXRoID0gJ2JhbWJvby1yZXZpZXcnKSB7XG4gICAgdGhpcy5hcHAgPSBhcHA7XG4gICAgdGhpcy5iYXNlUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYmFzZVBhdGgpO1xuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOCAqL1xuICBwcml2YXRlIGFzeW5jIGVuc3VyZURpcihkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9LyR7ZGlyfWApO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2RpcihwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU1N0ZBXHU3ODQwXHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0XHU1QjU4XHU1NzI4ICovXG4gIGFzeW5jIGVuc3VyZVN0cnVjdHVyZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIodGhpcy5iYXNlUGF0aCk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUzOUZcdTVCNTBcdTY1QjlcdTVGMEZcdTUxOTlcdTUxNjUgdmF1bHQgXHU2NTg3XHU0RUY2XHVGRjA4XHU2NkZGXHU0RUUzIGFkYXB0ZXIud3JpdGVcdUZGMDlcdTMwMDJcbiAgICogLSBcdTY1ODdcdTRFRjZcdTVERjJcdTU3MjggdmF1bHQgXHU3RjEzXHU1QjU4IFx1MjE5MiB2YXVsdC5wcm9jZXNzXHVGRjA4XHU1MzlGXHU1QjUwXHU2NkY0XHU2NUIwXHVGRjBDXHU5MDdGXHU1MTREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXHVGRjA5XG4gICAqIC0gXHU2NUIwXHU2NTg3XHU0RUY2IFx1MjE5MiB2YXVsdC5jcmVhdGVcdUZGMDhcdTU0MENcdTY1RjZcdTUxOTlcdTUxNjVcdTc4QzFcdTc2RDhcdTU0OEMgT2JzaWRpYW4gXHU3RjEzXHU1QjU4XHVGRjA5XG4gICAqIC0gXHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHVGRjA4XHU3OEMxXHU3NkQ4XHU2NzA5XHU0RjQ2XHU3RjEzXHU1QjU4XHU2NUUwXHVGRjA5XHUyMTkyIGFkYXB0ZXIucmVtb3ZlICsgdmF1bHQuY3JlYXRlXHVGRjA4XHU4RkMxXHU3OUZCXHU4RkRCXHU3RjEzXHU1QjU4XHVGRjA5XG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHZhdWx0V3JpdGUocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplUGF0aChwYXRoKTtcbiAgICBjb25zdCBhYnN0cmFjdCA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChub3JtYWxpemVkKTtcblxuICAgIGlmIChhYnN0cmFjdCBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoKSA9PiBjb250ZW50KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnRQYXRoID0gbm9ybWFsaXplZC5zdWJzdHJpbmcoMCwgbm9ybWFsaXplZC5sYXN0SW5kZXhPZignLycpKTtcbiAgICBpZiAocGFyZW50UGF0aCAmJiAhKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhcmVudFBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2RpcihwYXJlbnRQYXRoKTtcbiAgICB9XG5cbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMobm9ybWFsaXplZCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKG5vcm1hbGl6ZWQpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShub3JtYWxpemVkLCBjb250ZW50KTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2QkNGXHU2NUU1XHU2NTcwXHU2MzZFIChkYXlzKSAtLS0tXG5cbiAgcHJpdmF0ZSBkYXlQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YS8ke2RhdGVLZXl9Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldERheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPERheURhdGEgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgRGF5RGF0YTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1RkYwQ1x1NUMwNlx1OERGM1x1OEZDNzogJHtwYXRofWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsRGF5cygpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIERheURhdGE+PiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4gPSB7fTtcblxuICAgIGNvbnN0IHJlYWRzID0gZmlsZXMuZmlsZXNcbiAgICAgIC5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuanNvbicpKVxuICAgICAgLm1hcChhc3luYyAoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKCFkYXRlS2V5KSByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKGZpbGUpO1xuICAgICAgICAgIGRheXNbZGF0ZUtleV0gPSBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIERheURhdGE7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBwYXJzZSBkYXkgZmlsZTogJHtmaWxlfWAsIGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlYWRzKTtcbiAgICByZXR1cm4gZGF5cztcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTY1RTVcdTY3MUYga2V5XHVGRjA4XHU2MzA5XHU2NUU1XHU2NzFGXHU5NjREXHU1RThGXHVGRjBDXHU2NzAwXHU2NUIwXHU1NzI4XHU1MjREXHVGRjA5ICovXG4gIGFzeW5jIGdldERheUtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGtleXM6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzLmZpbGVzKSB7XG4gICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICBjb25zdCBkYXRlS2V5ID0gZmlsZS5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgaWYgKGRhdGVLZXkpIGtleXMucHVzaChkYXRlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAga2V5cy5zb3J0KCkucmV2ZXJzZSgpOyAvLyBcdTk2NERcdTVFOEZcdUZGMUFcdTY3MDBcdTY1QjBcdTY1RTVcdTY3MUZcdTU3MjhcdTUyNERcbiAgICByZXR1cm4ga2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTUyMDZcdTk4NzVcdTUyQTBcdThGN0RcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcbiAgICogQHBhcmFtIHBhZ2UgXHU5ODc1XHU3ODAxXHVGRjA4XHU0RUNFIDAgXHU1RjAwXHU1OUNCXHVGRjA5XG4gICAqIEBwYXJhbSBwYWdlU2l6ZSBcdTZCQ0ZcdTk4NzVcdTY1NzBcdTkxQ0ZcbiAgICogQHJldHVybnMgeyBkYXlzLCB0b3RhbCwgcGFnZSwgcGFnZVNpemUsIGhhc01vcmUgfVxuICAgKi9cbiAgYXN5bmMgZ2V0RGF5c1BhZ2luYXRlZChwYWdlID0gMCwgcGFnZVNpemUgPSAzMCk6IFByb21pc2U8e1xuICAgIGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICAgIGtleXM6IHN0cmluZ1tdO1xuICAgIHRvdGFsOiBudW1iZXI7XG4gICAgcGFnZTogbnVtYmVyO1xuICAgIHBhZ2VTaXplOiBudW1iZXI7XG4gICAgaGFzTW9yZTogYm9vbGVhbjtcbiAgfT4ge1xuICAgIGNvbnN0IGFsbEtleXMgPSBhd2FpdCB0aGlzLmdldERheUtleXMoKTtcbiAgICBjb25zdCB0b3RhbCA9IGFsbEtleXMubGVuZ3RoO1xuICAgIGNvbnN0IHN0YXJ0ID0gcGFnZSAqIHBhZ2VTaXplO1xuICAgIGNvbnN0IHBhZ2VLZXlzID0gYWxsS2V5cy5zbGljZShzdGFydCwgc3RhcnQgKyBwYWdlU2l6ZSk7XG4gICAgY29uc3QgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4gPSB7fTtcblxuICAgIGNvbnN0IHJlYWRzID0gcGFnZUtleXMubWFwKGFzeW5jIChkYXRlS2V5KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXREYXkoZGF0ZUtleSk7XG4gICAgICAgIGlmIChkYXRhKSBkYXlzW2RhdGVLZXldID0gZGF0YTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gbG9hZCBkYXk6ICR7ZGF0ZUtleX1gLCBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5cyxcbiAgICAgIGtleXM6IHBhZ2VLZXlzLFxuICAgICAgdG90YWwsXG4gICAgICBwYWdlLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBoYXNNb3JlOiBzdGFydCArIHBhZ2VLZXlzLmxlbmd0aCA8IHRvdGFsLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBwdXREYXkoZGF5RGF0YTogRGF5RGF0YSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0ZUtleSA9IGRheURhdGEuZGF0ZTtcbiAgICBpZiAoIWRhdGVLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF5RGF0YSBtdXN0IGhhdmUgYSBkYXRlIGZpZWxkJyk7XG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG5cbiAgICAvLyBcdTUxOTlcdTVCODhcdTUzNkJcdUZGMUFcdTY4QzBcdTZENEJcdTY1NzBcdTYzNkVcdTkxQ0ZcdTYwQUNcdTVEMTZcdUZGMDhcdTU5MUFcdTY3NjFcdTY1RjZcdTk1RjRcdTdFQkYgXHUyMTkyIFx1OEZEMVx1NEU0RVx1N0E3QVx1NThGM1x1RkYwOVxuICAgIGlmICghdGhpcy5fd2FybmVkUGF0aHMuaGFzKHBhdGgpKSB7XG4gICAgICBjb25zdCBuZXdUaW1lbGluZUxlbiA9IEFycmF5LmlzQXJyYXkoZGF5RGF0YS50aW1lbGluZSkgPyBkYXlEYXRhLnRpbWVsaW5lLmxlbmd0aCA6IDA7XG4gICAgICBpZiAobmV3VGltZWxpbmVMZW4gPD0gMSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBKU09OLnBhcnNlKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKSkgYXMgRGF5RGF0YTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nVGltZWxpbmVMZW4gPSBBcnJheS5pc0FycmF5KGV4aXN0aW5nLnRpbWVsaW5lKSA/IGV4aXN0aW5nLnRpbWVsaW5lLmxlbmd0aCA6IDA7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdUaW1lbGluZUxlbiA+IDEwKSB7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgICAgICAgICAgYFx1MjZBMFx1RkUwRiBcdTY4QzBcdTZENEJcdTUyMzAgJHtkYXRlS2V5fSBcdTY1NzBcdTYzNkVcdTVGMDJcdTVFMzhcdTZFMDVcdTdBN0FcdUZGMDgke2V4aXN0aW5nVGltZWxpbmVMZW59IFx1Njc2MSBcdTIxOTIgJHtuZXdUaW1lbGluZUxlbn0gXHU2NzYxXHVGRjA5XHVGRjBDXHU1REYyXHU4MUVBXHU1MkE4XHU2MkU2XHU2MjJBXHUzMDAyXFxuXHU1OTgyXHU2NzlDXHU3ODZFXHU1QjlFXHU4OTgxXHU2RTA1XHU3QTdBXHU4QkU1XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjBDXHU4QkY3XHU1MThEXHU2QjIxXHU2NENEXHU0RjVDXHUzMDAyYFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB0aGlzLl93YXJuZWRQYXRocy5hZGQocGF0aCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggeyAvKiBcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdTYyMTZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTdFRTdcdTdFRURcdTZCNjNcdTVFMzhcdTUxOTlcdTUxNjUgKi8gfVxuICAgICAgfVxuICAgIH1cblxuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXlEYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICBhc3luYyBkZWxldGVEYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3IChnb2FscykgLS0tLVxuXG4gIHByaXZhdGUgZ29hbHNQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZ29hbHMuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0R29hbHMoKTogUHJvbWlzZTxHb2FsSXRlbVtdPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBHb2FsSXRlbVtdO1xuICB9XG5cbiAgYXN5bmMgcHV0R29hbHMoZ29hbHM6IEdvYWxJdGVtW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcblxuICAgIC8vIFx1NTE5OVx1NUI4OFx1NTM2Qlx1RkYxQVx1NjhDMFx1NkQ0Qlx1NjU3MFx1NjM2RVx1OTFDRlx1NjBBQ1x1NUQxNlx1RkYwOE5cdTY3NjFcdTc2RUVcdTY4MDcgXHUyMTkyIFx1N0E3QVx1NjU3MFx1N0VDNFx1RkYwOVxuICAgIGlmIChnb2Fscy5sZW5ndGggPT09IDAgJiYgIXRoaXMuX3dhcm5lZFBhdGhzLmhhcyhwYXRoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBKU09OLnBhcnNlKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKSkgYXMgR29hbEl0ZW1bXTtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShleGlzdGluZykgJiYgZXhpc3RpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbmV3IE5vdGljZShcbiAgICAgICAgICAgICAgYFx1MjZBMFx1RkUwRiBcdTY4QzBcdTZENEJcdTUyMzBcdTc2RUVcdTY4MDdcdTY1NzBcdTYzNkVcdTVGMDJcdTVFMzhcdTZFMDVcdTdBN0FcdUZGMDgke2V4aXN0aW5nLmxlbmd0aH0gXHU2NzYxIFx1MjE5MiBcdTdBN0FcdUZGMDlcdUZGMENcdTVERjJcdTgxRUFcdTUyQThcdTYyRTZcdTYyMkFcdTMwMDJcXG5cdTU5ODJcdTY3OUNcdTc4NkVcdTVCOUVcdTg5ODFcdTZFMDVcdTdBN0FcdTYyNDBcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdThCRjdcdTUxOERcdTZCMjFcdTY0Q0RcdTRGNUNcdTMwMDJgXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5fd2FybmVkUGF0aHMuYWRkKHBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIFx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1NjIxNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1N0VFN1x1N0VFRFx1NkI2M1x1NUUzOFx1NTE5OVx1NTE2NSAqLyB9XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGdvYWxzLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIEFJIFx1ODlDNFx1NTIxMlx1NEZBN1x1OEY2Nlx1N0QyMlx1NUYxNVx1RkYwOHBsYW5zLW1hcC5qc29uXHVGRjA5LS0tLVxuICAvLyBcdTdFRDNcdTY3ODRcdUZGMUF7IFwiPHZhdWx0UGF0aD4jPGNvbnRlbnRIYXNoPlwiOiBzdHJpbmdbXSAoZ29hbElkcykgfVxuICAvLyBcdTc1MjhcdTkwMTRcdUZGMUFcdTU0MENcdTRFMDBcdTdCMTRcdThCQjBcdTkxQ0RcdTU5MERcdTg5QzRcdTUyMTJcdTY1RjZcdTYzMDkgY29udGVudEhhc2ggXHU1RTQyXHU3QjQ5XHVGRjBDXHU5MDdGXHU1MTREXHU3NkVFXHU2ODA3XHU5MUNEXHU1OTBEXHU4RkZEXHU1MkEwXHUzMDAyXG5cbiAgcHJpdmF0ZSBwbGFuc0luZGV4UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3BsYW5zLW1hcC5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRQbGFuc0luZGV4KCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgc3RyaW5nW10+PiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucGxhbnNJbmRleFBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHJldHVybiB7fTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY29udGVudCkgYXMgdW5rbm93bjtcbiAgICAgIGlmIChwYXJzZWQgJiYgdHlwZW9mIHBhcnNlZCA9PT0gJ29iamVjdCcpIHJldHVybiBwYXJzZWQgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHB1dFBsYW5zSW5kZXgobWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUodGhpcy5wbGFuc0luZGV4UGF0aCgpLCBKU09OLnN0cmluZ2lmeShtYXAsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU4QkJFXHU3RjZFIChzZXR0aW5ncykgLS0tLVxuXG4gIHByaXZhdGUgc2V0dGluZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vc2V0dGluZ3MuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2V0dGluZyhrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpO1xuICAgIHJldHVybiBzZXR0aW5nc1trZXldID8/IG51bGw7XG4gIH1cblxuICBhc3luYyBwdXRTZXR0aW5nKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMuc2V0dGluZ3NQYXRoKCkpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIC8vIHZhdWx0LnByb2Nlc3MgXHU1MzlGXHU1QjUwIHJlYWQtbW9kaWZ5LXdyaXRlXHVGRjBDXHU2NzVDXHU3RUREXHU3QURFXHU2MDAxXHU0RTIyXHU2NTcwXHU2MzZFXG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5wcm9jZXNzKGFic3RyYWN0LCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBKU09OLnBhcnNlKGRhdGEpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgMik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHsgW2tleV06IHZhbHVlIH0sIG51bGwsIDIpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxTZXR0aW5ncygpOiBQcm9taXNlPEFwcFNldHRpbmdzPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBBcHBTZXR0aW5ncztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1OEQyRFx1NEU3MFx1NTM4Nlx1NTNGMiAocHVyY2hhc2UtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBwdXJjaGFzZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcHVyY2hhc2UtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRQdXJjaGFzZUhpc3RvcnkoKTogUHJvbWlzZTxQdXJjaGFzZUhpc3RvcnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBQdXJjaGFzZUhpc3Rvcnk7XG4gIH1cblxuICBhc3luYyBwdXRQdXJjaGFzZUhpc3RvcnkoZGF0YTogUHVyY2hhc2VIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHVyY2hhc2VIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NjUzNlx1NTE2NVx1NTM4Nlx1NTNGMiAoaW5jb21lLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgaW5jb21lSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9pbmNvbWUtaGlzdG9yeS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRJbmNvbWVIaXN0b3J5KCk6IFByb21pc2U8SW5jb21lSGlzdG9yeSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBJbmNvbWVIaXN0b3J5O1xuICB9XG5cbiAgYXN5bmMgcHV0SW5jb21lSGlzdG9yeShkYXRhOiBJbmNvbWVIaXN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTVCRkNcdTUxRkEvXHU1QkZDXHU1MTY1IC0tLS1cblxuICBhc3luYyBleHBvcnRBbGxEYXRhKCk6IFByb21pc2U8RXhwb3J0U2hhcGU+IHtcbiAgICBjb25zdCBbZGF5cywgZ29hbHMsIHNldHRpbmdzLCBwdXJjaGFzZUhpc3RvcnksIGluY29tZUhpc3RvcnldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5nZXRBbGxEYXlzKCksXG4gICAgICB0aGlzLmdldEdvYWxzKCksXG4gICAgICB0aGlzLmdldEFsbFNldHRpbmdzKCksXG4gICAgICB0aGlzLmdldFB1cmNoYXNlSGlzdG9yeSgpLFxuICAgICAgdGhpcy5nZXRJbmNvbWVIaXN0b3J5KCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJzMuMCcsXG4gICAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdG9yYWdlVHlwZTogJ3ZhdWx0JyxcbiAgICAgIGRheXMsXG4gICAgICBnb2FscyxcbiAgICAgIHNldHRpbmdzLFxuICAgICAgcHVyY2hhc2VIaXN0b3J5LFxuICAgICAgaW5jb21lSGlzdG9yeSxcbiAgICAgIHRoZW1lczogW10sXG4gICAgICByZXBvcnRzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgaW1wb3J0RGF0YShkYXRhOiB1bmtub3duLCBvcHRpb25zOiB7IHN0cmF0ZWd5PzogJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIH0gPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gICAgY29uc3Qgc3RyYXRlZ3kgPSBvcHRpb25zLnN0cmF0ZWd5ID8/ICdvdmVyd3JpdGUnO1xuXG4gICAgLy8gUDJcdUZGMUFcdTVCRkNcdTUxNjVcdTUyNERcdTY4MjFcdTlBOEMgKyBcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdUZGMUJcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTU3MjhcdTZCNjRcdTg4QUJcdTYyRDJcdTdFRERcdUZGMENcdTRFMERcdTZDNjFcdTY3RDMgVmF1bHRcbiAgICBjb25zdCByZWNvcmQgPSBJbXBvcnRWYWxpZGF0b3IudmFsaWRhdGUoZGF0YSk7XG5cbiAgICBpZiAocmVjb3JkLmRheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gXHU5NjMyXHU1RkExXHVGRjFBZGF5cyBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTdBN0FcdTVCRjlcdThDNjFcdTg4NjhcdTc5M0FcdTZFMDVcdTdBN0FcdTUxNjhcdTkwRThcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMDhcdTRFQzUgb3ZlcndyaXRlIFx1OEJFRFx1NEU0OVx1NEUwQlx1NTE0MVx1OEJCOFx1RkYwOVxuICAgICAgY29uc3QgZGF5cyA9IChyZWNvcmQuZGF5cyAmJiB0eXBlb2YgcmVjb3JkLmRheXMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHJlY29yZC5kYXlzKSlcbiAgICAgICAgPyByZWNvcmQuZGF5c1xuICAgICAgICA6IHt9O1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnb3ZlcndyaXRlJykge1xuICAgICAgICBhd2FpdCB0aGlzLmNsZWFyQWxsRGF5cygpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBkYXkgb2YgT2JqZWN0LnZhbHVlcyhkYXlzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLnB1dERheShkYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWNvcmQuZ29hbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgaW5jb21pbmc6IEdvYWxJdGVtW10gPSBBcnJheS5pc0FycmF5KHJlY29yZC5nb2FscykgPyByZWNvcmQuZ29hbHMgOiBbXTtcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ21lcmdlJykge1xuICAgICAgICAvLyBcdTU0MDhcdTVFNzZcdUZGMUFcdTRGRERcdTc1NTlcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTVCRkNcdTUxNjVcdTc2RUVcdTY4MDdcdTYzMDkgaWQgXHU4OTg2XHU3NkQ2XHVGRjFCXHU3QTdBXHU2NTcwXHU3RUM0XHU0RTBEXHU4OUU2XHU1M0QxXHU2RTA1XHU3QTdBXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKGF3YWl0IHRoaXMuZ2V0R29hbHMoKSkgfHwgW107XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXAoZXhpc3RpbmcubWFwKChnKSA9PiBbZy5pZCwgZ10pKTtcbiAgICAgICAgZm9yIChjb25zdCBnb2FsIG9mIGluY29taW5nKSB7XG4gICAgICAgICAgaWYgKGdvYWwgJiYgZ29hbC5pZCkgbWVyZ2VkLnNldChnb2FsLmlkLCBnb2FsKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKEFycmF5LmZyb20obWVyZ2VkLnZhbHVlcygpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvdmVyd3JpdGVcdUZGMUFcdTY1NzRcdTRGNTNcdTY2RkZcdTYzNjJcdUZGMDhcdTdBN0FcdTY1NzBcdTdFQzQgPSBcdTZFMDVcdTdBN0FcdUZGMENcdTdCMjZcdTU0MDhcdTk4ODRcdTY3MUZcdThCRURcdTRFNDlcdUZGMDlcbiAgICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhpbmNvbWluZyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmIHJlY29yZC5zZXR0aW5ncyAmJiB0eXBlb2YgcmVjb3JkLnNldHRpbmdzID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgaW5jb21pbmcgPSByZWNvcmQuc2V0dGluZ3M7XG4gICAgICBsZXQgdG9Xcml0ZTogQXBwU2V0dGluZ3M7XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdtZXJnZScpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSAoYXdhaXQgdGhpcy5nZXRBbGxTZXR0aW5ncygpKSB8fCB7fTtcbiAgICAgICAgdG9Xcml0ZSA9IHsgLi4uZXhpc3RpbmcsIC4uLmluY29taW5nIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b1dyaXRlID0gaW5jb21pbmc7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUodGhpcy5zZXR0aW5nc1BhdGgoKSwgSlNPTi5zdHJpbmdpZnkodG9Xcml0ZSwgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIGlmIChyZWNvcmQucHVyY2hhc2VIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0UHVyY2hhc2VIaXN0b3J5KHJlY29yZC5wdXJjaGFzZUhpc3RvcnkpO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmluY29tZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRJbmNvbWVIaXN0b3J5KHJlY29yZC5pbmNvbWVIaXN0b3J5KTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU0RUM1XHU2RTA1XHU3QTdBXHU2MjQwXHU2NzA5XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjA4b3ZlcndyaXRlIFx1NUJGQ1x1NTE2NSBkYXlzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwQ1x1NEUwRFx1NUY3MVx1NTRDRCBnb2Fscy9zZXR0aW5nc1x1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbERheXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhkYXRhRGlyKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcihkYXRhRGlyLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgfVxuXG4gIC8qKiBcdTRFQzVcdTZFMDVcdTdBN0FcdThCQkVcdTdGNkVcdTY1ODdcdTRFRjZcdUZGMDhvdmVyd3JpdGUgXHU1QkZDXHU1MTY1IHNldHRpbmdzIFx1NTI0RFx1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBhc3luYyBjbGVhckFsbFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2xlYXJBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKHRoaXMuYmFzZVBhdGgsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICB9XG5cbiAgLy8gLS0tLSBNYXJrZG93biBcdTY0NThcdTg5ODEgLS0tLVxuXG4gIHByaXZhdGUgcmV2aWV3UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3Jldmlld3MvJHtkYXRlS2V5fS5tZGApO1xuICB9XG5cbiAgYXN5bmMgd3JpdGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcsIG1hcmtkb3duOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIG1hcmtkb3duKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnJldmlld1BhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIEltcG9ydFZhbGlkYXRvciAtIFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1NzY4NFx1NjgyMVx1OUE4Q1x1NEUwRVx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1RkYwOFx1NUJCRlx1NEUzQlx1NEZBN1x1RkYwQ1x1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwOVxuICpcbiAqIFx1NzUyOFx1OTAxNFx1RkYxQVx1NTcyOCBWYXVsdFN0b3JhZ2UuaW1wb3J0RGF0YSBcdTg0M0RcdTc2RDhcdTUyNERcdTYyRTZcdTYyMkFcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTMwMDFcdTg4NjVcdTlGNTBcdTdGM0FcdTU5MzFcdTVCNTdcdTZCQjVcdUZGMENcbiAqIFx1OTA3Rlx1NTE0RFx1NTM0QVx1NjIyQS9cdTk3NUVcdTZDRDVcdTY1NzBcdTYzNkVcdTZDNjFcdTY3RDMgVmF1bHRcdTMwMDJcbiAqXG4gKiBcdThCQkVcdThCQTFcdTUzOUZcdTUyMTlcdUZGMUFcbiAqICAtIFx1NEVDNVx1NTA1QVwiXHU3RUQzXHU2Nzg0XHU1QzQyXHU5NzYyXHU3Njg0XHU1Qjg5XHU1MTY4XHU1MTVDXHU1RTk1XCJcdUZGMENcdTRFMERcdTkxQ0RcdTUxOTlcdTRFMUFcdTUyQTFcdTVCNTdcdTZCQjVcdUZGMDhcdTU5ODIgbWV0cmljcyBcdTc2ODRcdTUxNzdcdTRGNTNcdTY1NzBcdTUwM0NcdUZGMDlcdTMwMDJcbiAqICAtIFx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1NEYxOFx1NTE0OFx1NzUyOFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1ODFFQVx1OEVBQlx1NzY4NCBrZXkgLyBcdTUxODVcdTVCQjlcdUZGMENcdTdGM0FcdTU5MzFcdTY1RjZcdTYyNERcdTc1MjhcdTVCODlcdTUxNjhcdTlFRDhcdThCQTRcdTUwM0NcdTMwMDJcbiAqICAtIFx1NEVGQlx1NEY1NVx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NzY4NFx1N0VEM1x1Njc4NFx1NjAyN1x1NjM1Rlx1NTc0Rlx1OTBGRFx1NjI5QiBJbXBvcnRWYWxpZGF0aW9uRXJyb3JcdUZGMENcdTc1MzFcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTc5M0FcdTc1MjhcdTYyMzdcdTMwMDJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERheURhdGEsXG4gIEdvYWxJdGVtLFxuICBBcHBTZXR0aW5ncyxcbiAgUHVyY2hhc2VIaXN0b3J5LFxuICBJbmNvbWVIaXN0b3J5LFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuY2xhc3MgSW1wb3J0VmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnSW1wb3J0VmFsaWRhdGlvbkVycm9yJztcbiAgfVxufVxuXG5jb25zdCBLTk9XTl9GSUVMRFMgPSBbJ2RheXMnLCAnZ29hbHMnLCAnc2V0dGluZ3MnLCAncHVyY2hhc2VIaXN0b3J5JywgJ2luY29tZUhpc3RvcnknXSBhcyBjb25zdDtcblxuLyoqXG4gKiBcdTdFQjVcdTZERjFcdTk2MzJcdTVGQTFcdUZGMUFcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTY2MkZcdTRFMERcdTUzRUZcdTRGRTFcdThGQjlcdTc1NENcdUZGMDhcdTUzRUZcdTgwRkRcdTY3NjVcdTgxRUFcdTRFRDZcdTRFQkFcdTUyMDZcdTRFQUIvXHU0RTBCXHU4RjdEXHU3Njg0XHU1OTA3XHU0RUZEXHVGRjA5XHUzMDAyXG4gKiBcdTU3MjhcdTg0M0RcdTc2RDhcdTUyNERcdTkwMTJcdTVGNTJcdTUxQzBcdTUzMTZcdTYyNDBcdTY3MDlcdTVCNTdcdTdCMjZcdTRFMzJcdTUzRjZcdTVCNTBcdUZGMENcdTUyNjVcdTc5QkIgSFRNTCBcdTY4MDdcdTdCN0VcdTMwMDFcdTRFOEJcdTRFRjZcdTU5MDRcdTc0MDZcdTVDNUVcdTYwMjdcbiAqIFx1NEUwRSBqYXZhc2NyaXB0Oi9kYXRhOiBcdTRGMkFcdTUzNEZcdThCQUVcdUZGMENcdTkwN0ZcdTUxNERcdTYwNzZcdTYxMEZcdThEMUZcdThGN0RcdTdFQ0YgaW5uZXJIVE1MIFx1NkUzMlx1NjdEM1x1ODlFNlx1NTNEMSBYU1NcdTMwMDJcbiAqIFx1NjcyQ1x1OTg3OVx1NzZFRVx1NjVFMFx1NUJDQ1x1NjU4N1x1NjcyQ1x1OTcwMFx1NkM0Mlx1RkYwQ1x1N0VERlx1NEUwMFx1NjU4N1x1NjcyQ1x1NTMxNlx1NjYyRlx1NUI4OVx1NTE2OFx1NzY4NFx1MzAwMlxuICovXG5mdW5jdGlvbiBzYW5pdGl6ZVN0cmluZyhpbnB1dDogdW5rbm93bik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSByZXR1cm4gaW5wdXQgYXMgc3RyaW5nO1xuICBjb25zdCBvdXQgPSBpbnB1dFxuICAgIC5yZXBsYWNlKC88W14+XSo+L2csICcnKSAvLyBcdTc5RkJcdTk2NjRcdTYyNDBcdTY3MDkgSFRNTCBcdTY4MDdcdTdCN0VcbiAgICAucmVwbGFjZSgvXFxzb25cXHcrXFxzKj1cXHMqXCJbXlwiXSpcIi9naSwgJycpIC8vIFx1NzlGQlx1OTY2NCBvbio9XCIuLi5cIlxuICAgIC5yZXBsYWNlKC9cXHNvblxcdytcXHMqPVxccyonW14nXSonL2dpLCAnJykgLy8gXHU3OUZCXHU5NjY0IG9uKj0nLi4uJ1xuICAgIC5yZXBsYWNlKC9cXHNvblxcdytcXHMqPVxccypbXlxccz5dKy9naSwgJycpIC8vIFx1NzlGQlx1OTY2NCBvbio9dmFsdWVcdUZGMDhcdTY1RTBcdTVGMTVcdTUzRjdcdUZGMDlcbiAgICAucmVwbGFjZSgvamF2YXNjcmlwdDovZ2ksICcnKSAvLyBcdTc5RkJcdTk2NjQgamF2YXNjcmlwdDogXHU0RjJBXHU1MzRGXHU4QkFFXG4gICAgLnJlcGxhY2UoL2RhdGE6L2dpLCAnJyk7IC8vIFx1NzlGQlx1OTY2NCBkYXRhOiBcdTRGMkFcdTUzNEZcdThCQUVcbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVWYWx1ZSh2YWx1ZTogdW5rbm93bik6IHVua25vd24ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIHNhbml0aXplU3RyaW5nKHZhbHVlKTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSByZXR1cm4gdmFsdWUubWFwKCh2KSA9PiBzYW5pdGl6ZVZhbHVlKHYpKTtcbiAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBvdXQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModmFsdWUpKSB7XG4gICAgICBvdXRba2V5XSA9IHNhbml0aXplVmFsdWUoKHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuICByZXR1cm4gdmFsdWU7IC8vIFx1NjU3MFx1NUI1NyAvIFx1NUUwM1x1NUMxNCAvIG51bGwgXHU3QjQ5XHU1MzlGXHU2ODM3XHU0RkREXHU3NTU5XG59XG5cbmludGVyZmFjZSBWYWxpZGF0ZWRJbXBvcnQge1xuICBkYXlzPzogUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gIGdvYWxzPzogR29hbEl0ZW1bXTtcbiAgc2V0dGluZ3M/OiBBcHBTZXR0aW5ncztcbiAgcHVyY2hhc2VIaXN0b3J5PzogUHVyY2hhc2VIaXN0b3J5O1xuICBpbmNvbWVIaXN0b3J5PzogSW5jb21lSGlzdG9yeTtcbn1cblxuZXhwb3J0IGNvbnN0IEltcG9ydFZhbGlkYXRvciA9IHtcbiAgLyoqXG4gICAqIFx1NjgyMVx1OUE4Q1x1NUU3Nlx1ODg2NVx1OUY1MFx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1MzAwMlxuICAgKiBAcmV0dXJucyBcdTg4NjVcdTlGNTBcdTU0MEVcdTc2ODRcdTVFNzJcdTUxQzBcdTY1NzBcdTYzNkVcdUZGMDhcdTdFRDNcdTY3ODRcdTRFMEVcdThGOTNcdTUxNjVcdTRFMDBcdTgxRjRcdUZGMENcdTRGNDZcdTVCNTdcdTZCQjVcdTVCOENcdTY1NzRcdUZGMDlcbiAgICogQHRocm93cyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IgXHU1RjUzXHU3RUQzXHU2Nzg0XHU2MzVGXHU1NzRGXHU2NUUwXHU2Q0Q1XHU0RkVFXHU1OTBEXHU2NUY2XG4gICAqL1xuICB2YWxpZGF0ZShkYXRhOiB1bmtub3duKTogVmFsaWRhdGVkSW1wb3J0IHtcbiAgICBpZiAoIWRhdGEgfHwgdHlwZW9mIGRhdGEgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIHRocm93IG5ldyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IoJ1x1NTkwN1x1NEVGRFx1NjU4N1x1NEVGNlx1NjgzQ1x1NUYwRlx1NjVFMFx1NjU0OFx1RkYxQVx1NjgzOVx1ODI4Mlx1NzBCOVx1NUZDNVx1OTg3Qlx1NjYyRiBKU09OIFx1NUJGOVx1OEM2MScpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZCA9IGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAvLyBcdTYzNUZcdTU3NEZcdTY1ODdcdTRFRjZcdTYyRDJcdTdFRERcdUZGMUFcdTZDQTFcdTY3MDlcdTRFRkJcdTRGNTVcdTVERjJcdTc3RTVcdTVCNTdcdTZCQjUgXHUyMTkyIFx1ODlDNlx1NEUzQVx1NjM1Rlx1NTc0Ri9cdTY1RTBcdTUxNzNcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBoYXNLbm93bkZpZWxkID0gS05PV05fRklFTERTLnNvbWUoKGYpID0+IHJlY29yZFtmXSAhPT0gdW5kZWZpbmVkKTtcbiAgICBpZiAoIWhhc0tub3duRmllbGQpIHtcbiAgICAgIHRocm93IG5ldyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IoXG4gICAgICAgICdcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcdTY1RTBcdTY1NDhcdUZGMUFcdTY3MkFcdTYyN0VcdTUyMzBcdTRFRkJcdTRGNTVcdTUzRUZcdThCQzZcdTUyMkJcdTc2ODRcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdUZGMDhkYXlzIC8gZ29hbHMgLyBzZXR0aW5ncyAvIHB1cmNoYXNlSGlzdG9yeSAvIGluY29tZUhpc3RvcnlcdUZGMDknXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdDogVmFsaWRhdGVkSW1wb3J0ID0ge307XG5cbiAgICBpZiAocmVjb3JkLmRheXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmRheXMgPSBzYW5pdGl6ZVZhbHVlKEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVEYXlzKHJlY29yZC5kYXlzKSkgYXMgUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAgfVxuICAgIGlmIChyZWNvcmQuZ29hbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmdvYWxzID0gc2FuaXRpemVWYWx1ZShJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplR29hbHMocmVjb3JkLmdvYWxzKSkgYXMgR29hbEl0ZW1bXTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuc2V0dGluZ3MgPSBzYW5pdGl6ZVZhbHVlKEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVTZXR0aW5ncyhyZWNvcmQuc2V0dGluZ3MpKSBhcyBBcHBTZXR0aW5ncztcbiAgICB9XG4gICAgaWYgKHJlY29yZC5wdXJjaGFzZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LnB1cmNoYXNlSGlzdG9yeSA9IHNhbml0aXplVmFsdWUocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSkgYXMgUHVyY2hhc2VIaXN0b3J5O1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmluY29tZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LmluY29tZUhpc3RvcnkgPSBzYW5pdGl6ZVZhbHVlKHJlY29yZC5pbmNvbWVIaXN0b3J5KSBhcyBJbmNvbWVIaXN0b3J5O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBkYXlzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1OTc1RVx1NUJGOVx1OEM2MVx1RkYwOFx1NTk4Mlx1NjU3MFx1N0VDNC9cdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDlcdTIxOTIgXHU4OUM2XHU0RTNBXHU2NUUwXHU2NUU1XHU2NTcwXHU2MzZFXHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU1QkY5XHU4QzYxXHVGRjA4XHU0RTBEXHU2QzYxXHU2N0QzIFZhdWx0XHVGRjA5XG4gICAqICAtIFx1NkJDRlx1NEUyQSBkYXkgXHU3RjNBIGRhdGUgXHU2NUY2XHU3NTI4XHU1MTc2IGtleSBcdTg4NjVcdTlGNTBcbiAgICogIC0gXHU2QkNGXHU0RTJBIGRheSBcdTdGM0EgbWV0cmljcy90aW1lbGluZS9nb2FscyBcdTY1RjZcdTg4NjVcdTdBN0FcdTdFRDNcdTY3ODRcbiAgICovXG4gIG5vcm1hbGl6ZURheXMoZGF5czogdW5rbm93bik6IFJlY29yZDxzdHJpbmcsIERheURhdGE+IHtcbiAgICBpZiAoIWRheXMgfHwgdHlwZW9mIGRheXMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF5cykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3QgcmF3ID0gZGF5cyBhcyBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICBjb25zdCBvdXQ6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyYXcpKSB7XG4gICAgICBjb25zdCBkYXkgPSByYXdba2V5XTtcbiAgICAgIGlmICghZGF5IHx8IHR5cGVvZiBkYXkgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZGF5KSkge1xuICAgICAgICBjb250aW51ZTsgLy8gXHU4REYzXHU4RkM3XHU5NzVFXHU1QkY5XHU4QzYxXHU2NzYxXHU3NkVFXG4gICAgICB9XG4gICAgICBjb25zdCBjbGVhbjogRGF5RGF0YSA9IHsgLi4uZGF5IH07XG4gICAgICBpZiAoIWNsZWFuLmRhdGUpIGNsZWFuLmRhdGUgPSBrZXk7IC8vIFx1NzUyOCBrZXkgXHU4ODY1IGRhdGVcbiAgICAgIGlmICghY2xlYW4ubWV0cmljcyB8fCB0eXBlb2YgY2xlYW4ubWV0cmljcyAhPT0gJ29iamVjdCcpIGNsZWFuLm1ldHJpY3MgPSB7fTtcbiAgICAgIGlmICghY2xlYW4udGltZWxpbmUgfHwgIUFycmF5LmlzQXJyYXkoY2xlYW4udGltZWxpbmUpKSBjbGVhbi50aW1lbGluZSA9IFtdO1xuICAgICAgaWYgKCFjbGVhbi5nb2FscyB8fCAhQXJyYXkuaXNBcnJheShjbGVhbi5nb2FscykpIGNsZWFuLmdvYWxzID0gW107XG4gICAgICBvdXRba2V5XSA9IGNsZWFuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgZ29hbHNcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU2NTcwXHU3RUM0XHVGRjFCXHU5NzVFXHU2NTcwXHU3RUM0IFx1MjE5MiBcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgICogIC0gXHU2QkNGXHU0RTJBIGdvYWwgXHU3RjNBIGlkIFx1NjVGNlx1ODg2NVx1NEUwMFx1NEUyQVx1N0EzM1x1NUI5QVx1NTNFRlx1NTkwRFx1NzNCMFx1NzY4NCBpZFxuICAgKi9cbiAgbm9ybWFsaXplR29hbHMoZ29hbHM6IHVua25vd24pOiBHb2FsSXRlbVtdIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ29hbHMpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICByZXR1cm4gZ29hbHMubWFwKChyYXcpOiBHb2FsSXRlbSA9PiB7XG4gICAgICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHJhdykpIHJldHVybiByYXcgYXMgR29hbEl0ZW07XG4gICAgICBjb25zdCBvYmogPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBjb25zdCBjbGVhbiA9IHsgLi4ub2JqIH0gYXMgdW5rbm93biBhcyBHb2FsSXRlbTtcbiAgICAgIGlmICghY2xlYW4uaWQpIHtcbiAgICAgICAgY2xlYW4uaWQgPSBgZ29hbF9pbXBvcnRfJHtjb3VudGVyKyt9XyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9YDtcbiAgICAgIH1cbiAgICAgIGlmIChjbGVhbi5pdGVtcyAmJiAhQXJyYXkuaXNBcnJheShjbGVhbi5pdGVtcykpIGNsZWFuLml0ZW1zID0gW107XG4gICAgICByZXR1cm4gY2xlYW47XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBzZXR0aW5nc1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTk3NUVcdTVCRjlcdThDNjEgXHUyMTkyIFx1OEZENFx1NTZERVx1N0E3QVx1NUJGOVx1OEM2MVxuICAgKi9cbiAgbm9ybWFsaXplU2V0dGluZ3Moc2V0dGluZ3M6IHVua25vd24pOiBBcHBTZXR0aW5ncyB7XG4gICAgaWYgKCFzZXR0aW5ncyB8fCB0eXBlb2Ygc2V0dGluZ3MgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoc2V0dGluZ3MpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHJldHVybiBzZXR0aW5ncyBhcyBBcHBTZXR0aW5ncztcbiAgfSxcbn07XG4iLCAiXG4vKipcbiAqIFRoZW1lQnJpZGdlIC0gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1RkYwQ1x1NjNBOFx1OTAwMVx1NTIzMCBpZnJhbWVcbiAqICAgICAgICAgICAgICArIFx1NTNDRFx1NTQxMVx1RkYxQVx1NjNBNVx1NjUzNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1MDNDXHVGRjBDXHU2Q0U4XHU1MTY1IE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICovXG5leHBvcnQgY2xhc3MgVGhlbWVCcmlkZ2Uge1xuICAgIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgX3BhbGV0dGVTeW5jVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gICAgLyoqIFx1NUI1OFx1NTBBOFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHU5NTJFXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFIHJlc3RvcmVEZWZhdWx0cyBcdTZFMDVcdTc0MDYgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBJTkpFQ1RFRF9WQVJTID0gW1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JyxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3ZlcicsXG4gICAgICAnLS10ZXh0LWFjY2VudCcsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknLFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknLFxuICAgICAgJy0tdGV4dC1ub3JtYWwnLFxuICAgICAgJy0tdGV4dC1tdXRlZCcsXG4gICAgXTtcblxuICAgIC8qKiBcdTk2MzJcdTYyOTZcdTdBREVcdTYwMDFcdTY4MDdcdThCQjBcdUZGMUFyZXN0b3JlRGVmYXVsdHMgXHU4OEFCXHU4QzAzXHU3NTI4XHU1NDBFXHU4QkJFXHU0RTNBIHRydWVcdUZGMENcdTk2M0JcdTZCNjJcdTVFRjZcdThGREZcdTU2REVcdThDMDNcdTg5ODZcdTUxOTkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3VwcHJlc3NlZCA9IGZhbHNlO1xuXG4gIGF0dGFjaElmcmFtZShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gIH1cblxuICBkZXRhY2hJZnJhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTY2MEVcdTY2OTdcdTcyQjZcdTYwMDFcdUZGMDhcdTRFQzVcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbiAgcHJpdmF0ZSBpc0RhcmtNb2RlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBDU1MgXHU5ODlDXHU4MjcyXHU1QjU3XHU3QjI2XHU0RTMyIFx1MjE5MiBbciwgZywgYl1cdUZGMDgwXHUyMDEzMjU1IFx1NjU3NFx1NjU3MFx1RkYwOVxuICAgKiBcdTY1MkZcdTYzMDEgcmdiKCkvcmdiYSgpLyNoZXhcdUZGMDgzIFx1NjIxNiA2IFx1NEY0RFx1RkYwOVx1RkYxQlx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1OEZENFx1NTZERSBudWxsXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBwYXJzZUNvbG9yVG9SZ2IoY29sb3I6IHN0cmluZyk6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSB8IG51bGwge1xuICAgIGlmICghY29sb3IpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGMgPSBjb2xvci50cmltKCk7XG4gICAgbGV0IHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXI7XG5cbiAgICBjb25zdCByZ2JNYXRjaCA9IGMubWF0Y2goL3JnYmE/XFwoKFteKV0rKVxcKS9pKTtcbiAgICBpZiAocmdiTWF0Y2gpIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gcmdiTWF0Y2hbMV0uc3BsaXQoJywnKS5tYXAoKHMpID0+IHBhcnNlRmxvYXQocykpO1xuICAgICAgW3IsIGcsIGJdID0gcGFydHM7XG4gICAgfSBlbHNlIGlmIChjWzBdID09PSAnIycpIHtcbiAgICAgIGxldCBoZXggPSBjLnNsaWNlKDEpO1xuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpIGhleCA9IGhleC5zcGxpdCgnJykubWFwKChjaCkgPT4gY2ggKyBjaCkuam9pbignJyk7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHJldHVybiBudWxsO1xuICAgICAgciA9IHBhcnNlSW50KGhleC5zbGljZSgwLCAyKSwgMTYpO1xuICAgICAgZyA9IHBhcnNlSW50KGhleC5zbGljZSgyLCA0KSwgMTYpO1xuICAgICAgYiA9IHBhcnNlSW50KGhleC5zbGljZSg0LCA2KSwgMTYpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoW3IsIGcsIGJdLnNvbWUoKHYpID0+IGlzTmFOKHYpKSkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIFtNYXRoLnJvdW5kKHIpLCBNYXRoLnJvdW5kKGcpLCBNYXRoLnJvdW5kKGIpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgSFNMIFx1ODI3Mlx1NzZGOCBIXHVGRjA4MFx1MjAxMzM2MFx1RkYwOVxuICAgKiBcdTc1MjhcdTRFOEVcdTYyOEEgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU3Njg0IC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1NEUzQVx1NjNEMlx1NEVGNlx1NzY4NCAtLWFjY2VudC1odWVcbiAgICovXG4gIHN0YXRpYyByZ2JUb0h1ZShjb2xvcjogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgcmdiID0gVGhlbWVCcmlkZ2UucGFyc2VDb2xvclRvUmdiKGNvbG9yKTtcbiAgICBpZiAoIXJnYikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgW3IsIGcsIGJdID0gcmdiO1xuXG4gICAgY29uc3Qgcm4gPSByIC8gMjU1LCBnbiA9IGcgLyAyNTUsIGJuID0gYiAvIDI1NTtcbiAgICBjb25zdCBtYXggPSBNYXRoLm1heChybiwgZ24sIGJuKSwgbWluID0gTWF0aC5taW4ocm4sIGduLCBibiksIGQgPSBtYXggLSBtaW47XG4gICAgaWYgKGQgPT09IDApIHJldHVybiAwO1xuXG4gICAgbGV0IGg6IG51bWJlcjtcbiAgICBpZiAobWF4ID09PSBybikgaCA9ICgoZ24gLSBibikgLyBkKSAlIDY7XG4gICAgZWxzZSBpZiAobWF4ID09PSBnbikgaCA9IChibiAtIHJuKSAvIGQgKyAyO1xuICAgIGVsc2UgaCA9IChybiAtIGduKSAvIGQgKyA0O1xuXG4gICAgaCA9IE1hdGgucm91bmQoaCAqIDYwKTtcbiAgICByZXR1cm4gaCA8IDAgPyBoICsgMzYwIDogaDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgXCJyLCBnLCBiXCIgXHU0RTA5XHU1MTQzXHU3RUM0XHU1QjU3XHU3QjI2XHU0RTMyXG4gICAqIFx1NzUyOFx1NEU4RVx1NjI4QSBPYnNpZGlhbiBcdTRGQTdcdThGQjlcdTY4MEZcdTgwQ0NcdTY2NkYgLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSBcdTU0MENcdTZCNjVcdTRFM0FcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTVFOTVcdTgyNzJcdUZGMENcbiAgICogXHU4QkE5XHU2M0QyXHU0RUY2XHU1MzYxXHU3MjQ3XHU4MjcyXHU2RTI5XHU4RDM0XHU4RkQxIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKi9cbiAgc3RhdGljIHJnYlRvUmdiU3RyaW5nKGNvbG9yOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCByZ2IgPSBUaGVtZUJyaWRnZS5wYXJzZUNvbG9yVG9SZ2IoY29sb3IpO1xuICAgIGlmICghcmdiKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gcmdiLmpvaW4oJywgJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1NDExIGlmcmFtZSBcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTcyQjZcdTYwMDFcbiAgICogQHBhcmFtIGZvbGxvd09ic2lkaWFuVGhlbWUgXHU0RTNBIHRydWUgXHU2NUY2XHVGRjBDXHU5NjQ0XHU1RTI2XHU0RUNFIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFxuICAgKiAgICAgICAgLS1pbnRlcmFjdGl2ZS1hY2NlbnQgXHU1M0NEXHU2M0E4XHU3Njg0XHU2MTBGXHU1ODgzXHU4MjcyXHU3NkY4IGh1ZVx1RkYwQ1x1OUE3MVx1NTJBOFx1NjNEMlx1NEVGNlx1NjU3NFx1NzZEOFx1OTE0RFx1ODI3Mlx1ODA1NFx1NTJBOFxuICAgKi9cbiAgcHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUgPSBmYWxzZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgIGNvbnN0IHBheWxvYWQ6IHsgaXNEYXJrOiBib29sZWFuOyBodWU/OiBudW1iZXI7IGJnPzogc3RyaW5nOyB0ZXh0Tm9ybWFsPzogc3RyaW5nOyB0ZXh0TXV0ZWQ/OiBzdHJpbmcgfSA9IHtcbiAgICAgIGlzRGFyazogdGhpcy5pc0RhcmtNb2RlKCksXG4gICAgfTtcblxuICAgIGlmIChmb2xsb3dPYnNpZGlhblRoZW1lKSB7XG4gICAgICBjb25zdCBhY2NlbnQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWludGVyYWN0aXZlLWFjY2VudCcpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCBodWUgPSBUaGVtZUJyaWRnZS5yZ2JUb0h1ZShhY2NlbnQpO1xuICAgICAgaWYgKGh1ZSAhPT0gbnVsbCkgcGF5bG9hZC5odWUgPSBodWU7XG5cbiAgICAgIC8vIFx1NEZBN1x1OEZCOVx1NjgwRlx1ODBDQ1x1NjY2Rlx1ODI3Mlx1RkYxQVx1OUE3MVx1NTJBOFx1NjNEMlx1NEVGNlx1NTM2MVx1NzI0N1x1NUU5NVx1ODI3Mlx1OEQzNFx1OEZEMSBPYnNpZGlhbiBcdTgyNzJcdTZFMjlcbiAgICAgIGNvbnN0IHNpZGViYXIgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWJhY2tncm91bmQtc2Vjb25kYXJ5JylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IGJnID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcoc2lkZWJhcik7XG4gICAgICBpZiAoYmcgIT09IG51bGwpIHBheWxvYWQuYmcgPSBiZztcblxuICAgICAgLy8gXHU2NTg3XHU1QjU3XHU4MjcyXHVGRjFBXHU5QTcxXHU1MkE4XHU2M0QyXHU0RUY2XHU2NTg3XHU1QjU3XHU4MjcyXHU2RTI5XHU4RDM0XHU4RkQxIE9ic2lkaWFuXG4gICAgICBjb25zdCB0ZXh0Tm9ybWFsID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW5vcm1hbCcpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCB0ZXh0Tm9ybWFsUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE5vcm1hbCk7XG4gICAgICBpZiAodGV4dE5vcm1hbFJnYiAhPT0gbnVsbCkgcGF5bG9hZC50ZXh0Tm9ybWFsID0gdGV4dE5vcm1hbFJnYjtcblxuICAgICAgY29uc3QgdGV4dE11dGVkID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW11dGVkJylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IHRleHRNdXRlZFJnYiA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHRleHRNdXRlZCk7XG4gICAgICBpZiAodGV4dE11dGVkUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHRNdXRlZCA9IHRleHRNdXRlZFJnYjtcbiAgICB9XG5cbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiAndGhlbWU6Y2hhbmdlZCcsXG4gICAgICAgIGlkOiAndGhlbWVfcHVzaF8nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgcGF5bG9hZCxcbiAgICAgIH0sXG4gICAgICAnKidcbiAgICApO1xuICB9XG5cbiAgLyoqIFx1NEY5Qlx1NTkxNlx1OTBFOFx1OEMwM1x1NzUyOFx1RkYxQU9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMSAqL1xuICBvblRoZW1lQ2hhbmdlZChmb2xsb3dPYnNpZGlhblRoZW1lID0gZmFsc2UpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hUaGVtZShmb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgfVxuXG4gIC8vID09PT09IFx1NTNDQ1x1NTQxMVx1OEMwM1x1ODI3MiA9PT09PVxuXG4gIC8qKlxuICAgKiBcdThCQTFcdTdCOTcgd2ViYXBwIFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTYgXHUyMTkyIE9ic2lkaWFuIENTUyBcdTUzRDhcdTkxQ0ZcdTY2MjBcdTVDMDRcbiAgICogXHU0RUM1XHU4OTg2XHU3NkQ2IDMgXHU3QzdCXHU2ODM4XHU1RkMzXHU4MjcyXHVGRjA4XHU1RjNBXHU4QzAzL1x1ODBDQ1x1NjY2Ri9cdTY1ODdcdTVCNTdcdUZGMDlcdUZGMENcdTUxNzZcdTRGNTlcdTc1MzEgT2JzaWRpYW4gXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU2M0E4XHU3Qjk3XG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZU9ic2lkaWFuVmFycyhodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGNvbnN0IGggPSBNYXRoLnJvdW5kKGh1ZSk7XG4gICAgY29uc3QgbG8gPSBNYXRoLm1heCgtMzAsIE1hdGgubWluKDMwLCBsaWdodG5lc3NPZmZzZXQpKTtcblxuICAgIC8vIFx1NUYzQVx1OEMwM1x1ODI3MlxuICAgIGNvbnN0IGFjY2VudFMgPSA0MDtcbiAgICBjb25zdCBhY2NlbnRMID0gaXNEYXJrID8gNTAgOiA0MDtcbiAgICBjb25zdCBhY2NlbnQgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEx9JSlgO1xuICAgIGNvbnN0IGFjY2VudEhvdmVyID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMICsgNX0lKWA7XG5cbiAgICAvLyBcdTgwQ0NcdTY2NkZcdTgyNzJcbiAgICBjb25zdCBiZ1MgPSBpc0RhcmsgPyA4IDogMTI7XG4gICAgY29uc3QgYmdMID0gaXNEYXJrXG4gICAgICA/IE1hdGgubWF4KDUsIDEyICsgbG8gKiAwLjMpXG4gICAgICA6IE1hdGgubWluKDk4LCA5NCArIGxvICogMC4xNSk7XG4gICAgY29uc3QgYmdQcmltYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2JnTH0lKWA7XG4gICAgY29uc3QgYmdTZWNvbmRhcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7aXNEYXJrID8gYmdMICsgMyA6IGJnTCAtIDJ9JSlgO1xuXG4gICAgLy8gXHU2NTg3XHU1QjU3XHU4MjcyXG4gICAgY29uc3QgdGV4dE5vcm1hbCA9IGlzRGFyayA/IGBoc2woJHtofSwgNiUsIDg4JSlgIDogYGhzbCgke2h9LCA2JSwgMTIlKWA7XG4gICAgY29uc3QgdGV4dE11dGVkICA9IGlzRGFyayA/IGBoc2woJHtofSwgNCUsIDU1JSlgIDogYGhzbCgke2h9LCA0JSwgNDUlKWA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJzogYWNjZW50SG92ZXIsXG4gICAgICAnLS10ZXh0LWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeSc6IGJnUHJpbWFyeSxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JzogYmdTZWNvbmRhcnksXG4gICAgICAnLS10ZXh0LW5vcm1hbCc6IHRleHROb3JtYWwsXG4gICAgICAnLS10ZXh0LW11dGVkJzogdGV4dE11dGVkLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU4QzAzXHU4MjcyXHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MlxuICAgKiA1MG1zIGRlYm91bmNlXHVGRjBDXHU5NjMyXHU2QjYyXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1NkVEMVx1NTc1N1x1NUZFQlx1OTAxRlx1NjJENlx1NjJGRFx1NEVBN1x1NzUxRlx1OUFEOFx1OTg5MSBET00gXHU1MTk5XHU1MTY1XG4gICAqL1xuICBhcHBseVBhbGV0dGUoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcikgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9wYWxldHRlU3luY1RpbWVyKTtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IGZhbHNlOyAvLyBcdTY1QjBcdThDMDNcdTgyNzJcdThCRjdcdTZDNDJcdTUyMzBcdTY3NjUgXHUyMTkyIFx1ODlFM1x1OTY2NFx1NjI5MVx1NTIzNlxuICAgIHRoaXMuX3BhbGV0dGVTeW5jVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQpIHJldHVybjsgLy8gcmVzdG9yZURlZmF1bHRzIFx1NTcyOFx1OTYzMlx1NjI5Nlx1N0E5N1x1NTNFM1x1NTE4NVx1ODhBQlx1OEMwM1x1NzUyOFxuICAgICAgY29uc3QgdmFycyA9IFRoZW1lQnJpZGdlLmNvbXB1dGVPYnNpZGlhblZhcnMoaHVlLCBsaWdodG5lc3NPZmZzZXQsIGlzRGFyayk7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2YXJzKSkge1xuICAgICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0sIDUwKTtcbiAgfVxuXG4gIC8qKiBcdTZFMDVcdTk2NjRcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1RkYwQ1x1NjA2Mlx1NTkwRCBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTlFRDhcdThCQTRcdTUwM0MgKi9cbiAgc3RhdGljIHJlc3RvcmVEZWZhdWx0cygpOiB2b2lkIHtcbiAgICBUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgVGhlbWVCcmlkZ2UuSU5KRUNURURfVkFSUykge1xuICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKiBcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDhcdTVCOENcdTY1NzRcdTUyMTdcdTg4NjhcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMgPSBbXG4gICcubXAzJywgJy53YXYnLCAnLm9nZycsICcuZmxhYycsICcuYWFjJywgJy5tNGEnLCAnLndtYScsICcud2VibScsICcub3B1cycsXG5dO1xuXG4vKiogXHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEIFx1MjE5MiBNSU1FIFx1N0M3Qlx1NTc4QiAqL1xuY29uc3QgQVVESU9fTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5tcDMnOiAgJ2F1ZGlvL21wZWcnLFxuICAnLndhdic6ICAnYXVkaW8vd2F2JyxcbiAgJy5vZ2cnOiAgJ2F1ZGlvL29nZycsXG4gICcuZmxhYyc6ICdhdWRpby9mbGFjJyxcbiAgJy5hYWMnOiAgJ2F1ZGlvL2FhYycsXG4gICcubTRhJzogICdhdWRpby9tcDQnLFxuICAnLndtYSc6ICAnYXVkaW8veC1tcy13bWEnLFxuICAnLndlYm0nOiAnYXVkaW8vd2VibScsXG4gICcub3B1cyc6ICdhdWRpby9vcHVzJyxcbn07XG5cbi8qKiBcdTVCOENcdTY1NzQgTUlNRSBcdTdDN0JcdTU3OEJcdTY2MjBcdTVDMDRcdUZGMDhcdTU0MkIgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IE1JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcuaHRtbCc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmNzcyc6ICAndGV4dC9jc3M7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcubWpzJzogICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qc29uJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnLFxuICAnLnBuZyc6ICAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAgJ2ltYWdlL2pwZWcnLFxuICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICcuZ2lmJzogICdpbWFnZS9naWYnLFxuICAnLnN2Zyc6ICAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcuaWNvJzogICdpbWFnZS94LWljb24nLFxuICAnLndvZmYnOiAnZm9udC93b2ZmJyxcbiAgJy53b2ZmMic6J2ZvbnQvd29mZjInLFxuICAnLnR0Zic6ICAnZm9udC90dGYnLFxuICAuLi5BVURJT19NSU1FX1RZUEVTLFxufTtcbiIsICIvKipcbiAqIHByb3RvY29sLnRzIFx1MjAxNCBob3N0IFx1NEZBN1x1NTM0Rlx1OEJBRVx1N0M3Qlx1NTc4Qlx1OTU1Q1x1NTBDRlxuICpcbiAqIFx1NjcyQ1x1NjU4N1x1NEVGNlx1NjYyRiB3ZWJhcHAvYXNzZXRzL3NjcmlwdHMvdXRpbHMvcHJvdG9jb2wuanMgXHU3Njg0IFR5cGVTY3JpcHQgXHU1RTc2XHU4ODRDXHU1MjZGXHU2NzJDXHUzMDAyXG4gKiBcdTRFMjRcdTdBRUZcdTVGQzVcdTk4N0JcdTRGRERcdTYzMDEgUFJPVE9DT0xfVkVSU0lPTiBcdTRFMEUgQUxMX01FU1NBR0VfVFlQRVMgXHU1NDBDXHU2QjY1XHUzMDAyXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAtIFBST1RPQ09MX1ZFUlNJT05cdUZGMUFcdTUzNEZcdThCQUVcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTRFMjRcdTdBRUZcdTRFMDBcdTgxRjRcdUZGMDlcdUZGMUJcbiAqIC0gQUxMX01FU1NBR0VfVFlQRVNcdUZGMUF3ZWJhcHBcdTIxOTRob3N0IFx1NTNDQ1x1NTQxMVx1NTE2OFx1OTBFOFx1NURGMlx1NzdFNVx1NkQ4OFx1NjA2Rlx1N0M3Qlx1NTc4Qlx1NzY4NFx1NTM1NVx1NEUwMFx1NEU4Qlx1NUI5RVx1NkU5MFx1RkYxQlxuICogLSBJTkJPVU5EX1BSRUZJWEVTXHVGRjFBaG9zdCBcdTRGQTcgb25NZXNzYWdlIFx1NzY3RFx1NTQwRFx1NTM1NVx1RkYxQlxuICogLSBDb21tYW5kVHlwZVx1RkYxQVx1NUJGQ1x1ODIyQS9BY3Rpb24gXHU2MzA3XHU0RUU0XHU4MDU0XHU1NDA4XHU3QzdCXHU1NzhCXHVGRjA4V2ViYXBwQ29udHJvbGxlciBcdTRGN0ZcdTc1MjhcdUZGMDlcdTMwMDJcbiAqL1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vICBcdTUzNEZcdThCQUVcdTcyNDhcdTY3MkMgXHUyMDE0IFx1OTg3Qlx1NEUwRSB3ZWJhcHAvYXNzZXRzL3NjcmlwdHMvdXRpbHMvcHJvdG9jb2wuanMgXHU1NDBDXHU2QjY1XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBQUk9UT0NPTF9WRVJTSU9OID0gMTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyAgXHU2RDg4XHU2MDZGXHU1MjREXHU3RjAwXHVGRjA4aG9zdCBcdTRGQTcgb25NZXNzYWdlIFx1Njc2NVx1NkU5MFx1NTI0RFx1N0YwMFx1NzY3RFx1NTQwRFx1NTM1NVx1RkYwOVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgSU5CT1VORF9QUkVGSVhFUyA9IFsnc3RvcmFnZTonLCAnYXBwOicsICdmaWxlOicsICd0aGVtZTonXSBhcyBjb25zdDtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyAgXHU1MTY4XHU5MEU4XHU1REYyXHU3N0U1IG1lc3NhZ2UgdHlwZVx1RkYwOFx1NTNDQ1x1NTQxMVx1RkYwOVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgQUxMX01FU1NBR0VfVFlQRVMgPSBbXG4gIC8vIC0tLS0gd2ViYXBwIFx1MjE5MiBob3N0IC0tLS1cbiAgJ2FwcDpyZWFkeScsXG4gICdhcHA6Y2xvc2UnLFxuICAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJyxcbiAgJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJyxcbiAgJ2FwcDp0aGVtZTpzeW5jJyxcbiAgJ3RoZW1lOnN5bmNQYWxldHRlJyxcbiAgJ2FwcDpsaXN0VmF1bHRBdWRpb0ZpbGVzJyxcbiAgJ2FwcDpyZWFkVmF1bHRGaWxlJyxcbiAgJ2FwcDpyZWFkTG9jYWxGaWxlJyxcbiAgJ2FwcDpwcm94eUF1ZGlvVXJsJyxcbiAgJ2FwcDphaUltcHJvdmVHb2FsJyxcbiAgLy8gc3RvcmFnZToqXHVGRjA4MTcgXHU0RTJBXHU1QjUwXHU3QzdCXHU1NzhCXHVGRjA5XG4gICdzdG9yYWdlOnJlYWREYXknLFxuICAnc3RvcmFnZTp3cml0ZURheScsXG4gICdzdG9yYWdlOmxpc3REYXlzJyxcbiAgJ3N0b3JhZ2U6ZGVsZXRlRGF5JyxcbiAgJ3N0b3JhZ2U6Z2V0U2V0dGluZycsXG4gICdzdG9yYWdlOnB1dFNldHRpbmcnLFxuICAnc3RvcmFnZTpnZXRBbGxTZXR0aW5ncycsXG4gICdzdG9yYWdlOmdldEdvYWxzJyxcbiAgJ3N0b3JhZ2U6cHV0R29hbHMnLFxuICAnc3RvcmFnZTpnZXRQdXJjaGFzZUhpc3RvcnknLFxuICAnc3RvcmFnZTpwdXRQdXJjaGFzZUhpc3RvcnknLFxuICAnc3RvcmFnZTpnZXRJbmNvbWVIaXN0b3J5JyxcbiAgJ3N0b3JhZ2U6cHV0SW5jb21lSGlzdG9yeScsXG4gICdzdG9yYWdlOmdldERheUtleXMnLFxuICAnc3RvcmFnZTpnZXREYXlzUGFnaW5hdGVkJyxcbiAgJ3N0b3JhZ2U6ZXhwb3J0QWxsJyxcbiAgJ3N0b3JhZ2U6aW1wb3J0QWxsJyxcbiAgJ3N0b3JhZ2U6Y2xlYXJBbGwnLFxuXG4gIC8vIC0tLS0gaG9zdCBcdTIxOTIgd2ViYXBwIC0tLS1cbiAgJ2dvYWxzOmNoYW5nZWQnLFxuICAndGhlbWU6Y2hhbmdlZCcsXG4gICd0aGVtZTpmb2xsb3dEaXNhYmxlZCcsXG4gICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAnbmF2OnByZXZEYXknLFxuICAnbmF2Om5leHREYXknLFxuICAnbmF2OnRvZGF5JyxcbiAgJ2FjdGlvbjpvcGVuU3RhdHMnLFxuICAnYWN0aW9uOm9wZW5TZXR0aW5ncycsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBBcHBNZXNzYWdlVHlwZSA9ICh0eXBlb2YgQUxMX01FU1NBR0VfVFlQRVMpW251bWJlcl07XG5cbi8qKiBuYXY6IC8gYWN0aW9uOiBcdTYzMDdcdTRFRTRcdTdDN0JcdTU3OEJcdUZGMDhXZWJhcHBDb250cm9sbGVyIFx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuZXhwb3J0IHR5cGUgQ29tbWFuZFR5cGUgPSBFeHRyYWN0PEFwcE1lc3NhZ2VUeXBlLCBgbmF2OiR7c3RyaW5nfWAgfCBgYWN0aW9uOiR7c3RyaW5nfWA+O1xuIiwgIi8qKlxuICogV2ViYXBwQ29udHJvbGxlciBcdTIwMTQgXHU1QkJGXHU0RTNCIFx1MjE5MiB3ZWJhcHAgXHU3Njg0XHU3QzdCXHU1NzhCXHU1MzE2XHU3NkY0XHU4RkRFXHU2M0E1XHU1M0UzXHVGRjA4UGhhc2UzXHVGRjA5XG4gKlxuICogXHU2NkZGXHU0RUUzIG1haW4udHMgXHU0RTJEXHU2NTYzXHU4NDNEXHU3Njg0XHU1QjU3XHU3QjI2XHU0RTMyXHU2MzA3XHU0RUU0IGBzZW5kVG9XZWJhcHAoJ25hdjpwcmV2RGF5JylgXHUzMDAyXG4gKiBcdTVCQkZcdTRFM0JcdTRGQTdcdTY1MzlcdTc1MjggYG5hdlByZXZEYXkoKWAgXHU3QjQ5XHU4QkVEXHU0RTQ5XHU1MzE2XHU2NUI5XHU2Q0Q1XHU4QzAzXHU3NTI4XHVGRjBDXHU1MTg1XHU5MEU4XHU0RUNEXHU3RUNGXG4gKiBgRGFpbHlSZXZpZXdWaWV3LnNlbmRDb21tYW5kYCBcdThENzBcdTY1RTJcdTY3MDkgcG9zdE1lc3NhZ2UgXHU3RUJGXHU1MzRGXHU4QkFFXHVGRjA4YG5hdjoqYC9gYWN0aW9uOipgXHVGRjA5XHUyMDE0XHUyMDE0XG4gKiBcdTUzNzNcdTMwMENcdTc2RjRcdTYzQTUgQVBJIFx1OTVFOFx1OTc2MiArIFx1NjVFMlx1NjcwOVx1Njg2NVx1NTE3Q1x1NUJCOVx1NUM0Mlx1MzAwRFx1RkYwQ3dlYmFwcCBcdTRGQTdcdTY1RTBcdTk3MDBcdTY1MzlcdTUyQThcdUZGMENcdTUzRUZcdTUyMDZcdTZCNjVcdTUyMDdcdTYzNjJcdTMwMDJcbiAqXG4gKiBcdThCRTVcdThGQjlcdTc1NENcdTRGRERcdTYzMDFcdTRFMERcdTUyQThcdUZGMUF3ZWJhcHAgXHU0RUNEXHU5MDFBXHU4RkM3IGBtZXNzYWdlYCBcdTc2RDFcdTU0MkMgYHt0eXBlLGlkfWAgXHU1RTc2XHU1NENEXHU1RTk0XHVGRjBDXG4gKiBcdTU2RTBcdTZCNjRcdTY3MkNcdTkxQ0RcdTY3ODRcdTk2RjZcdTU2REVcdTVGNTJcdTk4Q0VcdTk2NjlcdTMwMDFcdTRFMTRcdTUzRUZcdTU3MjhcdTVCQkZcdTRFM0JcdTRGQTdcdTUzNTVcdTZENEJcdTk1MDFcdTVCOUFcdTYzMDdcdTRFRTRcdTY2MjBcdTVDMDRcdTMwMDJcbiAqXG4gKiBDb21tYW5kVHlwZSBcdTRFQ0UgcHJvdG9jb2wudHMgXHU5NkM2XHU0RTJEXHU1QjlBXHU0RTQ5XHVGRjA4XHU5NjM2XHU2QkI1MyBcdTAwQjcgXHU1OTUxXHU3RUE2XHU1MzE2XHVGRjA5XHVGRjBDXG4gKiBcdTZCNjRcdTU5MDRcdTkxQ0RcdTVCRkNcdTUxRkFcdTRFRTVcdTRGRERcdTYzMDFcdTU0MTFcdTU0MEVcdTUxN0NcdTVCQjlcdUZGMDhcdTY1RTJcdTY3MDkgaW1wb3J0IHsgQ29tbWFuZFR5cGUgfSBmcm9tICdXZWJhcHBDb250cm9sbGVyJyBcdTRFMERcdTc4MzRcdUZGMDlcdTMwMDJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IENvbW1hbmRUeXBlIH0gZnJvbSAnLi9wcm90b2NvbCc7XG5cbmV4cG9ydCB0eXBlIHsgQ29tbWFuZFR5cGUgfSBmcm9tICcuL3Byb3RvY29sJztcblxuLyoqIFx1NjMwN1x1NEVFNFx1NEUwQlx1NTNEMVx1NzZFRVx1NjgwN1x1RkYwOERhaWx5UmV2aWV3VmlldyBcdTZFRTFcdThEQjNcdTZCNjRcdTU5NTFcdTdFQTZcdUZGMDkgKi9cbmludGVyZmFjZSBDb21tYW5kVGFyZ2V0IHtcbiAgc2VuZENvbW1hbmQodHlwZTogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFdlYmFwcENvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGdldFRhcmdldDogKCkgPT4gQ29tbWFuZFRhcmdldCB8IG51bGwpIHt9XG5cbiAgcHJpdmF0ZSBzZW5kKHR5cGU6IENvbW1hbmRUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5nZXRUYXJnZXQoKT8uc2VuZENvbW1hbmQodHlwZSk7XG4gIH1cblxuICAvKiogXHU1MjREXHU0RTAwXHU1OTI5ICovXG4gIG5hdlByZXZEYXkoKTogdm9pZCB7XG4gICAgdGhpcy5zZW5kKCduYXY6cHJldkRheScpO1xuICB9XG5cbiAgLyoqIFx1NTQwRVx1NEUwMFx1NTkyOSAqL1xuICBuYXZOZXh0RGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnbmF2Om5leHREYXknKTtcbiAgfVxuXG4gIC8qKiBcdTU2REVcdTUyMzBcdTRFQ0FcdTU5MjkgKi9cbiAgbmF2VG9kYXkoKTogdm9pZCB7XG4gICAgdGhpcy5zZW5kKCduYXY6dG9kYXknKTtcbiAgfVxuXG4gIC8qKiBcdTYyNTNcdTVGMDBcdTdFREZcdThCQTFcdTUyMDZcdTY3OTAgKi9cbiAgb3BlblN0YXRzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnYWN0aW9uOm9wZW5TdGF0cycpO1xuICB9XG5cbiAgLyoqIFx1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RSAqL1xuICBvcGVuU2V0dGluZ3MoKTogdm9pZCB7XG4gICAgdGhpcy5zZW5kKCdhY3Rpb246b3BlblNldHRpbmdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU5MDFBXHU3N0U1IHdlYmFwcCBcdTc2RUVcdTY4MDdcdTVFOTNcdTVERjJcdTUzRDhcdTY2RjRcdUZGMDhob3N0XHUyMTkyd2ViYXBwXHVGRjA5XHUzMDAyXG4gICAqIHdlYmFwcCBcdTY1MzZcdTUyMzBcdTU0MEVcdThDMDNcdTc1MjggR29hbFNlcnZpY2UubG9hZCgpIFx1OTFDRFx1OEJGQiBnb2Fscy5qc29uIFx1NUU3NiBzdG9yZS5ub3RpZnkoKSBcdTVDNDBcdTkwRThcdTUyMzdcdTY1QjBcdUZGMENcbiAgICogXHU0RTBEXHU4OUU2XHU1M0QxXHU1MTY4XHU1QzQwIHJlbmRlckFsbFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTFCMlx1NjM4OVx1NjVGNlx1OTVGNFx1OEY3NCAvIFx1OEZEQlx1ODg0Q1x1NEUyRFx1NzJCNlx1NjAwMVx1MzAwMlxuICAgKi9cbiAgbm90aWZ5R29hbHNDaGFuZ2VkKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGFyZ2V0KCk/LnNlbmRDb21tYW5kKCdnb2FsczpjaGFuZ2VkJyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSBCYW1ib29SZXZpZXdQbHVnaW4gZnJvbSAnLi4vLi4vbWFpbic7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4uL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5cbi8qKiBPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdThGRDBcdTg4NENcdTY1RjZcdTZDRThcdTUxNjVcdTc2ODRcdTRFM0JcdTdBOTdcdTUzRTMgZG9jdW1lbnRcdUZGMDhcdTk3NUUgaWZyYW1lIFx1NTE4NVx1NzY4NCBkb2N1bWVudFx1RkYwOSAqL1xuZGVjbGFyZSBjb25zdCBhY3RpdmVEb2N1bWVudDogRG9jdW1lbnQ7XG5cbi8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTAgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTm9pc2VJdGVtIHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICB0eXBlOiAndXJsJyB8ICd2YXVsdCcgfCAnZ2VuZXJhdGVkJztcbiAgdXJsPzogc3RyaW5nO1xuICBwYXRoPzogc3RyaW5nO1xuICB2b2x1bWU/OiBudW1iZXI7XG59XG5cbi8qKiBcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTYzQTVcdTUzRTMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFtYm9vUmV2aWV3U2V0dGluZ3Mge1xuICAvKiogXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU2ODM5XHU4REVGXHU1Rjg0ICovXG4gIGRhdGFQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxICovXG4gIGVuYWJsZU1hcmtkb3duU3luYzogYm9vbGVhbjtcbiAgLyoqIFx1Njc3Rlx1NTc1N1x1N0JBMVx1NzQwNlx1OTE0RFx1N0Y2RVx1RkYwOEpTT04gXHU4OUUzXHU2NzkwXHU1NDBFXHU3RUQzXHU2Nzg0XHU0RTBEXHU1NkZBXHU1QjlBXHVGRjBDXHU0RjdGXHU3NTI4XHU1QkJEXHU2NzdFXHU3QzdCXHU1NzhCXHVGRjA5ICovXG4gIHNlY3Rpb25Db25maWc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOSAqL1xuICB0aGVtZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFx1RkYwOFZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5M1x1RkYwOSAqL1xuICBub2lzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MFx1NTIxN1x1ODg2OCAqL1xuICBub2lzZUl0ZW1zOiBOb2lzZUl0ZW1bXTtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NUMwNiB3ZWJhcHAgXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2MiAqL1xuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGJvb2xlYW47XG4gIC8qKiBcdTY2MkZcdTU0MjZcdThCQTlcdTYzRDJcdTRFRjZcdTkxNERcdTgyNzJcdThEREZcdTk2OEYgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHVGRjA4XHU4QkZCXHU1M0Q2IC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1ODI3Mlx1NzZGOFx1RkYwOSAqL1xuICBmb2xsb3dPYnNpZGlhblRoZW1lOiBib29sZWFuO1xuICAvKiogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IEFJIFx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1ODlDNFx1NTIxMlx1RkYwOFx1N0IxNFx1OEJCMCBcdTIxOTIgXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHVGRjA5ICovXG4gIGFpRW5hYmxlZDogYm9vbGVhbjtcbiAgLyoqIEFJIFx1NjcwRFx1NTJBMSBBUEkgS2V5XHVGRjA4QmVhcmVyIFx1OTI3NFx1Njc0M1x1RkYwOSAqL1xuICBhaUFwaUtleTogc3RyaW5nO1xuICAvKiogQUkgXHU2NzBEXHU1MkExIEJhc2UgVVJMXHVGRjA4XHU0RTBEXHU1NDJCIC9jaGF0L2NvbXBsZXRpb25zIFx1NTQwRVx1N0YwMFx1RkYwQ1x1NTk4MiBodHRwczovL2FwaS5kZWVwc2Vlay5jb20vdjFcdUZGMDkgKi9cbiAgYWlCYXNlVXJsOiBzdHJpbmc7XG4gIC8qKiBcdTZBMjFcdTU3OEJcdTU0MERcdUZGMDhcdTU5ODIgZGVlcHNlZWstY2hhdFx1RkYwOSAqL1xuICBhaU1vZGVsOiBzdHJpbmc7XG4gIC8qKiBcdTlFRDhcdThCQTRcdTYyQzZcdTg5RTNcdTdDOTJcdTVFQTZcdUZGMUFcdTdDOTcoMi0zKSAvIFx1NEUyRCgzLTYpIC8gXHU3RUM2KDUtOCkgXHU1QjUwXHU5ODc5ICovXG4gIGFpRGVjb21wb3NlRGVwdGg6ICdcdTdDOTcnIHwgJ1x1NEUyRCcgfCAnXHU3RUM2Jztcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEJhbWJvb1Jldmlld1NldHRpbmdzID0ge1xuICBkYXRhUGF0aDogJ2JhbWJvby1yZXZpZXcnLFxuICBlbmFibGVNYXJrZG93blN5bmM6IHRydWUsXG4gIHNlY3Rpb25Db25maWc6IG51bGwsXG4gIHRoZW1lUGF0aDogJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcsXG4gIG5vaXNlUGF0aDogJycsXG4gIG5vaXNlSXRlbXM6IFtdLFxuICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IGZhbHNlLFxuICBmb2xsb3dPYnNpZGlhblRoZW1lOiB0cnVlLFxuICBhaUVuYWJsZWQ6IGZhbHNlLFxuICBhaUFwaUtleTogJycsXG4gIGFpQmFzZVVybDogJ2h0dHBzOi8vYXBpLmRlZXBzZWVrLmNvbS92MScsXG4gIGFpTW9kZWw6ICdkZWVwc2Vlay1jaGF0JyxcbiAgYWlEZWNvbXBvc2VEZXB0aDogJ1x1NEUyRCcsXG59O1xuXG4vKipcbiAqIFBsdWdpblNldHRpbmdzIC0gT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gKi9cbmV4cG9ydCBjbGFzcyBQbHVnaW5TZXR0aW5ncyBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1zZXR0aW5ncycpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCAtIFx1OEJCRVx1N0Y2RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vID09PSBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NFxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnXHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU1NzI4IFZhdWx0IFx1NEUyRFx1NzY4NFx1NUI1OFx1NTBBOFx1NzZFRVx1NUY1NVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignYmFtYm9vLXJldmlldycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRhdGFQYXRoID0gdmFsdWUgfHwgJ2JhbWJvby1yZXZpZXcnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBNYXJrZG93biBcdTY0NThcdTg5ODFcdTU0MENcdTZCNjVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTAgTWFya2Rvd24gXHU2NDU4XHU4OTgxJylcbiAgICAgIC5zZXREZXNjKCdcdTZCQ0ZcdTZCMjFcdTRGRERcdTVCNThcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTU3MjggcmV2aWV3cy8gXHU3NkVFXHU1RjU1XHU0RTBCXHU3NTFGXHU2MjEwXHU1M0VGXHU4QkZCXHU3Njg0IC5tZCBcdTY1ODdcdTRFRjYnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYyA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTRFM0JcdTk4OThcdTUyQThcdTY1NDgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NUI1OFx1NjUzRVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAuanMgXHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoID0gdmFsdWUgfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTc2N0RcdTU2NkFcdTk3RjMgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGMycpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NzY3RFx1NTY2QVx1OTdGM1x1NjU4N1x1NEVGNlx1NTkzOScpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU2MzA3XHU1QjlBXHU1NDBFXHU0RUM1XHU2MjZCXHU2M0NGXHU4QkU1XHU2NTg3XHU0RUY2XHU1OTM5XHU1MTg1XHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHUzMDAyXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU2NTc0XHU0RTJBXHU1RTkzXHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdcdTc2N0RcdTU2NkFcdTk3RjMgXHU2MjE2XHU3NTU5XHU3QTdBXHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4RERGXHU5NjhGIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OTE0RFx1ODI3MicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDXHU2M0QyXHU0RUY2XHU2NTc0XHU0RjUzXHU5MTREXHU4MjcyXHU0RjFBXHU4RERGXHU5NjhGXHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NzY4NFx1NUYzQVx1OEMwM1x1ODI3Mlx1RkYwOC0taW50ZXJhY3RpdmUtYWNjZW50XHVGRjA5XHUzMDAyXHU1MjA3XHU2MzYyIEJhbWJvbyBDaGluYSBcdTc2ODRcdTdBRjlcdTVGNzEgLyBcdTU4QThcdTU5MUMgLyBcdTgwRURcdTgxMDIgLyBcdTk3NTJcdTdFRkZcdTdCNDlcdTYxMEZcdTU4ODNcdTY1RjZcdUZGMENcdTYzRDJcdTRFRjZcdTkxNERcdTgyNzJcdTk2OEZcdTRFNEJcdTgwNTRcdTUyQTgnKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSUZyYW1lRWxlbWVudD4oJy5iYW1ib28tcmV2aWV3LWZyYW1lJyk7XG4gICAgICAgICAgICBpZiAoIWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgLy8gXHU3QUNCXHU1MzczXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU1RjNBXHU4QzAzXHU4MjcyXHU1M0NEXHU2M0E4XHU3Njg0XHU4MjcyXHU3NkY4ICsgXHU0RkE3XHU4RkI5XHU2ODBGXHU4MENDXHU2NjZGXHU4MjcyXHU2RTI5ICsgXHU2NTg3XHU1QjU3XHU4MjcyXHU2RTI5XG4gICAgICAgICAgICAgIGNvbnN0IGFjY2VudCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGh1ZSA9IFRoZW1lQnJpZGdlLnJnYlRvSHVlKGFjY2VudCk7XG4gICAgICAgICAgICAgIGNvbnN0IHNpZGViYXIgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGJnID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcoc2lkZWJhcik7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHROb3JtYWwgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tdGV4dC1ub3JtYWwnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHROb3JtYWxSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0Tm9ybWFsKTtcbiAgICAgICAgICAgICAgY29uc3QgdGV4dE11dGVkID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbXV0ZWQnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHRNdXRlZFJnYiA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHRleHRNdXRlZCk7XG4gICAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IHsgaXNEYXJrOiBib29sZWFuOyBodWU/OiBudW1iZXI7IGJnPzogc3RyaW5nOyB0ZXh0Tm9ybWFsPzogc3RyaW5nOyB0ZXh0TXV0ZWQ/OiBzdHJpbmcgfSA9IHtcbiAgICAgICAgICAgICAgICBpc0Rhcms6IGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyksXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGlmIChodWUgIT09IG51bGwpIHBheWxvYWQuaHVlID0gaHVlO1xuICAgICAgICAgICAgICBpZiAoYmcgIT09IG51bGwpIHBheWxvYWQuYmcgPSBiZztcbiAgICAgICAgICAgICAgaWYgKHRleHROb3JtYWxSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE5vcm1hbCA9IHRleHROb3JtYWxSZ2I7XG4gICAgICAgICAgICAgIGlmICh0ZXh0TXV0ZWRSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE11dGVkID0gdGV4dE11dGVkUmdiO1xuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6Y2hhbmdlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU1MTczXHU5NUVEXHU4MDU0XHU1MkE4IFx1MjE5MiBcdTkwMUFcdTc3RTUgaWZyYW1lIFx1NjA2Mlx1NTkwRFx1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1OEMwM1x1ODI3MlxuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6Zm9sbG93RGlzYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDoge30sXG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTVDMDZcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4nKVxuICAgICAgLnNldERlc2MoJ1x1NjI1M1x1NUYwMFx1NTQwRVx1RkYwQ3dlYmFwcCBcdTUxODVcdTYwQUNcdTZENkVcdTgzRENcdTUzNTVcdTc2ODRcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU4QzAzXHU4MjcyXHU0RjFBXHU1QjlFXHU2NUY2XHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuIFx1NzY4NFx1NTM5Rlx1NzUxRlx1NzU0Q1x1OTc2Mlx1OTE0RFx1ODI3MicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4pXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgVGhlbWVCcmlkZ2UucmVzdG9yZURlZmF1bHRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGFjdGl2ZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElGcmFtZUVsZW1lbnQ+KCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKGZyYW1lPy5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpzeW5jUGFsZXR0ZUVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBlbmFibGVkOiB2YWx1ZSB9XG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gQUkgXHU4OUM0XHU1MjEyID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdBSSBcdTg5QzRcdTUyMTJcdUZGMDhcdTgxRUFcdTcxMzZcdThCRURcdThBMDAgXHUyMTkyIFx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1RkYwOScpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NTQyRlx1NzUyOCBBSSBcdTg5QzRcdTUyMTInKVxuICAgICAgLnNldERlc2MoJ1x1NUYwMFx1NTQyRlx1NTQwRVx1RkYwQ1x1NTNFRlx1NTcyOFx1N0IxNFx1OEJCMFx1NEUyRFx1OEZEMFx1ODg0Q1x1MzAwQ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1NUY1M1x1NTI0RFx1N0IxNFx1OEJCMFx1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1MzAwRFx1NTQ3RFx1NEVFNFx1RkYwQ1x1NzUzMVx1NTkyN1x1NkEyMVx1NTc4Qlx1NjJDNlx1ODlFM1x1NzZFRVx1NjgwN1x1NUU3Nlx1NTE5OVx1NTE2NVx1NTkwRFx1NzZEOFx1MzAwMicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haUVuYWJsZWQpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlFbmFibGVkID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0FQSSBLZXknKVxuICAgICAgLnNldERlc2MoJ1x1NTkyN1x1NkEyMVx1NTc4Qlx1NjcwRFx1NTJBMVx1OTI3NFx1Njc0M1x1NUJDNlx1OTRBNVx1RkYwOEJlYXJlciBUb2tlblx1RkYwOVx1MzAwMlx1NEVDNVx1NEZERFx1NUI1OFx1NTcyOFx1NjcyQ1x1NUU5MyBzZXR0aW5ncy5qc29uXHVGRjBDXHU0RTBEXHU0RTBBXHU0RjIwXHUzMDAyJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdzay0uLi4nKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haUFwaUtleSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5haUFwaUtleSA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApXG4gICAgICAudGhlbigoc2V0dGluZykgPT4ge1xuICAgICAgICAvLyBcdTVCQzZcdTc4MDFcdTY4NDZcdTY4MzdcdTVGMEZcdUZGMUFcdThGOTNcdTUxNjVcdTk2OTBcdTg1Q0ZcbiAgICAgICAgY29uc3QgaW5wdXQgPSBzZXR0aW5nLmNvbnRyb2xFbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuICAgICAgICBpZiAoaW5wdXQpIGlucHV0LnR5cGUgPSAncGFzc3dvcmQnO1xuICAgICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdCYXNlIFVSTCcpXG4gICAgICAuc2V0RGVzYygnQVBJIFx1NTdGQVx1NTczMFx1NTc0MFx1RkYwOFx1NEUwRFx1NTQyQiAvY2hhdC9jb21wbGV0aW9ucyBcdTU0MEVcdTdGMDBcdUZGMDlcdTMwMDJcdTlFRDhcdThCQTQgRGVlcFNlZWsgdjFcdTMwMDInKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2h0dHBzOi8vYXBpLmRlZXBzZWVrLmNvbS92MScpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFpQmFzZVVybClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5haUJhc2VVcmwgPSB2YWx1ZS50cmltKCkgfHwgJ2h0dHBzOi8vYXBpLmRlZXBzZWVrLmNvbS92MSc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NkEyMVx1NTc4QicpXG4gICAgICAuc2V0RGVzYygnXHU2QTIxXHU1NzhCXHU1NDBEXHVGRjBDXHU1OTgyIGRlZXBzZWVrLWNoYXQgLyBncHQtNG8tbWluaVx1MzAwMlx1OTcwMFx1NTE3Q1x1NUJCOSBPcGVuQUkgQ2hhdCBDb21wbGV0aW9ucyBKU09OIFx1NkEyMVx1NUYwRlx1MzAwMicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignZGVlcHNlZWstY2hhdCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFpTW9kZWwpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlNb2RlbCA9IHZhbHVlLnRyaW0oKSB8fCAnZGVlcHNlZWstY2hhdCc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1OUVEOFx1OEJBNFx1NjJDNlx1ODlFM1x1N0M5Mlx1NUVBNicpXG4gICAgICAuc2V0RGVzYygnQUkgXHU2MjhBXHU3NkVFXHU2ODA3XHU2MkM2XHU2MjEwXHU1QjUwXHU5ODc5XHU3Njg0XHU3RUM2XHU3QzkyXHU1RUE2XHVGRjFBXHU3Qzk3KDItMykgLyBcdTRFMkQoMy02KSAvIFx1N0VDNig1LTgpXHUzMDAyXHU1M0VGXHU1NzI4XHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3XHU5MUNDXHU1MThEXHU5MDEwXHU2NzYxXHU1MjIwXHU2NTM5XHUzMDAyJylcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XG4gICAgICAgIGRyb3Bkb3duXG4gICAgICAgICAgLmFkZE9wdGlvbignXHU3Qzk3JywgJ1x1N0M5N1x1RkYwODItMyBcdTVCNTBcdTk4NzlcdUZGMDknKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ1x1NEUyRCcsICdcdTRFMkRcdUZGMDgzLTYgXHU1QjUwXHU5ODc5XHVGRjA5JylcbiAgICAgICAgICAuYWRkT3B0aW9uKCdcdTdFQzYnLCAnXHU3RUM2XHVGRjA4NS04IFx1NUI1MFx1OTg3OVx1RkYwOScpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFpRGVjb21wb3NlRGVwdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlEZWNvbXBvc2VEZXB0aCA9IHZhbHVlIGFzICdcdTdDOTcnIHwgJ1x1NEUyRCcgfCAnXHU3RUM2JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gXHU1MTczXHU0RThFXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NTE3M1x1NEU4RScpLnNldEhlYWRpbmcoKTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMVx1RkYxQVx1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBwbHVnaW5Cb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnQmFtYm9vIEltbW9ydGFsc1x1RkYwOFx1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1RkYwOVx1NjYyRlx1NEUwMFx1NkIzRVx1NTdGQVx1NEU4RVx1ODJDRlx1ODA1NFx1NjNBN1x1NTIzNlx1OEJCQVx1NEU0Qlx1NzIzNlx1N0VGNFx1NTE0Qlx1NjI1OFx1MDBCN1x1NjgzQ1x1NTM2Mlx1NEVDMFx1NzlEMVx1NTkyQlx1NjNEMFx1NTFGQVx1NzY4NFwiT0dBU1wiXHU3NDA2XHU1RkY1XHVGRjBDXHU0RTEzXHU0RTNBXHU0RTJBXHU0RUJBXHU2MjUzXHU5MDIwXHU3Njg0XHU0RTJEXHU1NkZEXHU5OENFXHU3NkVFXHU2ODA3XHU4MUVBXHU1MkE4XHU1MzE2XHU1MjA2XHU5MTREXHU3QkExXHU3NDA2XHU3Q0ZCXHU3RURGXHUzMDAyJyxcbiAgICAgIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJ1xuICAgIH0pO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAyXHVGRjFBXHU0RjVDXHU4MDA1ICsgXHU0RjVDXHU1NEMxIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IGF1dGhvckJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkIGJhbWJvby1hYm91dC1hdXRob3InIH0pO1xuICAgIGNvbnN0IGF1dGhvclJvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvdycgfSk7XG4gICAgY29uc3QgYXZhdGFyID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdmF0YXInIH0pO1xuICAgIC8vIFx1NEVDRVx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NVx1OEJGQlx1NTNENlx1NTkzNFx1NTBDRlx1RkYwOFx1OTAxQVx1OEZDNyBWYXVsdCBBUEkgXHU4QkZCXHU1M0Q2IC5vYnNpZGlhbi9wbHVnaW5zLyBcdTRFMEJcdTc2ODRcdTgxRUFcdTY3MDlcdThENDRcdTZFOTBcdUZGMDlcbiAgICAvLyBmaXJlLWFuZC1mb3JnZXRcdUZGMUFcdTU5MzRcdTUwQ0ZcdTk3NUVcdTUxNzNcdTk1MkVcdUZGMENcdTUyQTBcdThGN0RcdTU5MzFcdThEMjVcdTk3NTlcdTlFRDhcdTY2M0VcdTc5M0FcdTlFRDhcdThCQTRcdTdBN0FcdTU5MzRcdTUwQ0ZcbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwbHVnaW5EaXIgPSB0aGlzLnBsdWdpbi5tYW5pZmVzdC5kaXIgPz8gJyc7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgICAgICAgIGAke3BsdWdpbkRpcn0vYXV0aG9yLWF2YXRhci5qcGdgLFxuICAgICAgICAgIGAke3BsdWdpbkRpcn0vd2ViYXBwL2Fzc2V0cy9pbWFnZXMvYXV0aG9yLWF2YXRhci5qcGdgLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IGF2YXRhclBhdGggb2YgY2FuZGlkYXRlcykge1xuICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGFkYXB0ZXIuZXhpc3RzKGF2YXRhclBhdGgpO1xuICAgICAgICAgIGlmICghZXhpc3RzKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBhdmF0YXJEYXRhID0gYXdhaXQgYWRhcHRlci5yZWFkQmluYXJ5KGF2YXRhclBhdGgpO1xuICAgICAgICAgIGNvbnN0IGI2NCA9IEJ1ZmZlci5mcm9tKGF2YXRhckRhdGEpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgICBhdmF0YXIuc2V0Q3NzU3R5bGVzKHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYHVybChkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCR7YjY0fSlgLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2lsZW50bHkgc2tpcCBcdTIwMTQgc2hvdyBkZWZhdWx0IGVtcHR5IGF2YXRhciAqLyB9XG4gICAgfSkoKTtcblxuXG4gICAgY29uc3QgYXV0aG9ySW5mbyA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLWluZm8nIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTdGQkRcdTlDREVcdTU0MUInLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLW5hbWUnIH0pO1xuICAgIGF1dGhvckluZm8uY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTU1QjVcdTVCNTdcdTk5ODZcdTUyMUJcdTU5Q0JcdTRFQkEnLCBjbHM6ICdiYW1ib28tYWJvdXQtYXV0aG9yLXJvbGUnIH0pO1xuXG4gICAgLy8gXHU0RjVDXHU1NEMxXHU1MzNBXG4gICAgYXV0aG9yQm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU0RjVDXHU1NEMxJywgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLWxhYmVsJyB9KTtcbiAgICBjb25zdCB3b3Jrc1JvdyA9IGF1dGhvckJveC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3Mtcm93JyB9KTtcblxuICAgIFt7IG5hbWU6ICdcdTdBRjlcdTUzRjZcdTk4REVcdTUyMDMnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1CYW1ib28tRGFydHMnIH0sXG4gICAgIHsgbmFtZTogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLWJhbWJvby1pbW1vcnRhbHMnIH1dLmZvckVhY2god29yayA9PiB7XG4gICAgICBjb25zdCB0YWcgPSB3b3Jrc1Jvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogd29yay5uYW1lLCBjbHM6ICdiYW1ib28tYWJvdXQtdGFnJyB9KTtcbiAgICAgIGlmICh3b3JrLnVybCkge1xuICAgICAgICB0YWcuc2V0Q3NzU3R5bGVzKHsgY3Vyc29yOiAncG9pbnRlcicgfSk7XG4gICAgICAgIHRhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICB3aW5kb3cub3Blbih3b3JrLnVybCwgJ19ibGFuaycpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFx1ODA1NFx1N0NGQlx1NjVCOVx1NUYwRlxuICAgIGNvbnN0IGNvbnRhY3RCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCcgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1ODA1NFx1N0NGQlx1NjVCOVx1NUYwRicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1OTBBRVx1N0JCMVx1RkYxQXlhbnl1bGluMjEwMEBxcS5jb20nLCBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYycgfSk7XG4gICAgY29udGFjdEJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NUZBRVx1NEZFMVx1RkYxQXlhbmh1OTQnLCBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYycgfSk7XG4gIH1cbn1cbiIsICIvKipcbiAqIE1hcmtkb3duUGxhbm5lciBcdTIwMTQgXHU3QjE0XHU4QkIwXHU2QjYzXHU2NTg3IFx1MjE5MiBcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTg5QzRcdTUyMTJcdTU2NjhcdUZGMDhQaGFzZSAxXHVGRjA5XG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjA4XHU1MzU1XHU0RTAwXHUzMDAxXHU1M0VGXHU1MzU1XHU2RDRCXHVGRjA5XHVGRjFBXG4gKiAgLSBidWlsZFByb21wdFx1RkYxQVx1NjI4QVx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4NyArIFx1NjJDNlx1ODlFM1x1N0M5Mlx1NUVBNlx1N0ZGQlx1OEJEMVx1NjIxMFx1N0NGQlx1N0VERi9cdTc1MjhcdTYyMzdcdTYzRDBcdTc5M0FcdThCQ0RcdUZGMDhcdTc4NkNcdTdFQTZcdTY3NUYgSlNPTiBTY2hlbWFcdUZGMDlcdTMwMDJcbiAqICAtIHBhcnNlR29hbHNcdUZGMUFcdTRFQ0VcdTZBMjFcdTU3OEJcdTU2REVcdTYyNjdcdTY1ODdcdTY3MkNcdTRFMkRcdTYzRDBcdTUzRDYgSlNPTiBcdTY1NzBcdTdFQzRcdTVFNzZcdTY2MjBcdTVDMDRcdTRFM0EgR29hbEl0ZW1bXVx1RkYwOFx1NUJCOVx1NUZDRCBgYGBqc29uIFx1NTZGNFx1NjgwRlx1RkYwOVx1MzAwMlxuICogIC0gcGxhbkZyb21Ob3RlXHVGRjFBXHU3RjE2XHU2MzkyXHU3RjUxXHU3RURDXHU4QkY3XHU2QzQyXHVGRjA4cmVxdWVzdFVybCBcdTdFRDUgQ09SU1x1RkYwOSsgXHU4OUUzXHU2NzkwICsgXHU1OTMxXHU4RDI1XHU5MUNEXHU4QkQ1XHU0RTAwXHU2QjIxXHUzMDAyXG4gKlxuICogXHU3RjUxXHU3RURDXHU1QzQyXHU1M0VGXHU2Q0U4XHU1MTY1XHVGRjA4ZmV0Y2hGblx1RkYwOVx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1NzUyOCBmYWtlIFx1NjZGRlx1NEVFM1x1NzcxRlx1NUI5RSByZXF1ZXN0VXJsXHVGRjBDXHU0RkREXHU2MzAxXHU5NkY2IE9ic2lkaWFuIFx1OEZEMFx1ODg0Q1x1NjVGNlx1NEY5RFx1OEQ1Nlx1MzAwMlxuICovXG5cbmltcG9ydCB7IHJlcXVlc3RVcmwgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBHT0FMX0NBVEVHT1JJRVMsIHR5cGUgR29hbENhdGVnb3J5LCB0eXBlIEdvYWxJdGVtLCB0eXBlIEdvYWxTdWJJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5pbXBvcnQgeyBjbGVhbkRhaWx5TWluIH0gZnJvbSAnLi9Hb2FsQ2FyZFZhbGlkYXRvcic7XG5cbi8qKiBcdTYyQzZcdTg5RTNcdTdDOTJcdTVFQTYgXHUyMTkyIFx1NUVGQVx1OEJBRVx1NUI1MFx1OTg3OVx1NjU3MFx1OTFDRlx1NTMzQVx1OTVGNFx1NjNDRlx1OEZGMCAqL1xuY29uc3QgREVQVEhfSElOVDogUmVjb3JkPCdcdTdDOTcnIHwgJ1x1NEUyRCcgfCAnXHU3RUM2Jywgc3RyaW5nPiA9IHtcbiAgXHU3Qzk3OiAnMi0zJyxcbiAgXHU0RTJEOiAnMy02JyxcbiAgXHU3RUM2OiAnNS04Jyxcbn07XG5cbi8qKiBBSSBcdTY3MERcdTUyQTFcdThGRDRcdTU2REVcdTc2ODRcdTY3MDBcdTVDMEZcdTdFRDNcdTY3ODRcdUZGMDhcdTUxN0NcdTVCQjkgT2JzaWRpYW4gcmVxdWVzdFVybCBcdTc2ODQgUmVzcG9uc2VEYXRhXHVGRjA5ICovXG5leHBvcnQgaW50ZXJmYWNlIEFpUmVzcG9uc2Uge1xuICBzdGF0dXM6IG51bWJlcjtcbiAganNvbj86IHVua25vd247XG4gIHRleHQ/OiBzdHJpbmc7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG4vKiogXHU1M0VGXHU2Q0U4XHU1MTY1XHU3Njg0IGZldGNoIFx1NTFGRFx1NjU3MFx1RkYwOFx1OUVEOFx1OEJBNCByZXF1ZXN0VXJsXHVGRjA5XHUzMDAyXHU3QjdFXHU1NDBEXHU1QkY5XHU5RjUwIE9ic2lkaWFuIHJlcXVlc3RVcmwgXHU3Njg0XHU2NzAwXHU1QzBGXHU1QjUwXHU5NkM2XHUzMDAyICovXG5leHBvcnQgdHlwZSBBaUZldGNoRm4gPSAob3B0czoge1xuICB1cmw6IHN0cmluZztcbiAgbWV0aG9kPzogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgYm9keT86IHN0cmluZztcbn0pID0+IFByb21pc2U8QWlSZXNwb25zZT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGxhbm5lclNldHRpbmdzIHtcbiAgYWlBcGlLZXk6IHN0cmluZztcbiAgYWlCYXNlVXJsOiBzdHJpbmc7XG4gIGFpTW9kZWw6IHN0cmluZztcbiAgYWlEZWNvbXBvc2VEZXB0aDogJ1x1N0M5NycgfCAnXHU0RTJEJyB8ICdcdTdFQzYnO1xufVxuXG5jb25zdCBDQVRFR09SWV9JRFMgPSBHT0FMX0NBVEVHT1JJRVMubWFwKChjKSA9PiBjLmlkKS5qb2luKCcgfCAnKTtcblxuLyoqXG4gKiBcdTY3ODRcdTkwMjBcdTYzRDBcdTc5M0FcdThCQ0RcdTMwMDJcbiAqIEByZXR1cm5zIHsgc3lzdGVtLCB1c2VyIH0gXHU0RTI0XHU2QkI1XHU2RDg4XHU2MDZGXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFByb21wdChcbiAgY29udGVudDogc3RyaW5nLFxuICBkZXB0aDogJ1x1N0M5NycgfCAnXHU0RTJEJyB8ICdcdTdFQzYnID0gJ1x1NEUyRCcsXG4gIHNjb3BlOiAnbm90ZScgfCAnc2VsZWN0aW9uJyA9ICdub3RlJ1xuKTogeyBzeXN0ZW06IHN0cmluZzsgdXNlcjogc3RyaW5nIH0ge1xuICBjb25zdCBjb3VudCA9IERFUFRIX0hJTlRbZGVwdGhdID8/IERFUFRIX0hJTlRbJ1x1NEUyRCddO1xuXG4gIC8vIFx1OTAwOVx1NEUyRFx1NzI0N1x1NkJCNVx1NkEyMVx1NUYwRlx1RkYxQVx1NjYwRVx1Nzg2RVx1NTQ0QVx1OEJDOVx1NkEyMVx1NTc4Qlx1NjI4QVx1NUI4M1x1NUY1M1x1NUI4Q1x1NjU3NFx1NjEwRlx1NTZGRVx1RkYwQ1x1NEUwRFx1ODk4MVx1NUY1M1x1NjIxMFx1NjU3NFx1N0JDN1x1N0IxNFx1OEJCMC9cdTUwNDdcdThCQkVcdThGRDhcdTY3MDlcdTUxNzZcdTVCODNcdTUxODVcdTVCQjlcdTMwMDJcbiAgY29uc3Qgc2NvcGVOb3RlID1cbiAgICBzY29wZSA9PT0gJ3NlbGVjdGlvbidcbiAgICAgID8gJ1x1ODJFNVx1OEY5M1x1NTE2NVx1NjYyRlx1NzUyOFx1NjIzN1x1NEVDRVx1N0IxNFx1OEJCMFx1NEUyRFx1OTAwOVx1NEUyRFx1NzY4NFx1NzI0N1x1NkJCNVx1RkYwQ1x1OEJGN1x1NzZGNFx1NjNBNVx1NjI4QVx1NUI4M1x1NUY1M1x1NEY1Q1x1NzUyOFx1NjIzN1x1NzY4NFx1NUI4Q1x1NjU3NFx1NjEwRlx1NTZGRVx1Njc2NVx1NjJDNlx1ODlFM1x1RkYwQ1x1NEUwRFx1ODk4MVx1NTA0N1x1OEJCRVx1N0IxNFx1OEJCMFx1OTFDQ1x1OEZEOFx1NjcwOVx1NTE3Nlx1NUI4M1x1NTE4NVx1NUJCOVx1MzAwMVx1NEU1Rlx1NEUwRFx1ODk4MVx1NUY1M1x1NjIxMFx1NjU3NFx1N0JDN1x1N0IxNFx1OEJCMFx1NzY4NFx1NjQ1OFx1ODk4MVx1MzAwMidcbiAgICAgIDogJyc7XG5cbiAgY29uc3Qgc3lzdGVtID0gYFx1NEY2MFx1NjYyRlx1NEUwMFx1NEUyQVx1NzZFRVx1NjgwN1x1NjJDNlx1ODlFM1x1NTJBOVx1NjI0Qlx1RkYwQ1x1NjcwRFx1NTJBMVx1NEU4RVx1NEUyQVx1NEVCQVx1NzZFRVx1NjgwN1x1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1MzAwQ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1MzAwRFx1MzAwMlxuXHU4RjkzXHU1MTY1XHU2NjJGXHU0RTAwXHU3QkM3IE1hcmtkb3duIFx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4N1x1RkYxQlx1NEY2MFx1NzY4NFx1NEVGQlx1NTJBMVx1NjYyRlx1NEVDRVx1NEUyRFx1OEJDNlx1NTIyQlx1NzUyOFx1NjIzN1x1NjBGM1x1ODk4MVx1OEZCRVx1NjIxMFx1NzY4NFx1NzZFRVx1NjgwN1x1RkYwOEdvYWxcdUZGMDlcdUZGMENcdTVFNzZcdTYyOEFcdTZCQ0ZcdTRFMkFcdTc2RUVcdTY4MDdcdTYyQzZcdTYyMTBcdTU5MUFcdTRFMkFcdTUzRUZcdTYyNjdcdTg4NENcdTc2ODRcdTVCNTBcdTk4NzlcdUZGMDhTdWJJdGVtXHVGRjA5XHUzMDAyJHtzY29wZU5vdGV9XG5cbiMgXHU2ODM4XHU1RkMzXHU1NEYyXHU1QjY2XHVGRjA4XHU2NzAwXHU5MUNEXHU4OTgxXHVGRjBDXHU1MUNDXHU5QTdFXHU0RThFXHU0RTAwXHU1MjA3XHVGRjA5XG5cdTY3MkNcdThGNkZcdTRFRjZcdTc2ODRcdTY4MzhcdTVGQzNcdTRFRjdcdTUwM0NcdTY2MkZcdTYyOEFcdTc2RUVcdTY4MDdcdTMwMENcdTkxQ0ZcdTUzMTZcdTMwMERcdUZGMENcdTVFNzZcdTg0M0RcdTUyMzBcdTMwMENcdTY1RTVcdTMwMERcdTk4OTdcdTdDOTJcdTVFQTZcdTMwMDJcdTRGNjBcdTc2ODRcdTZCQ0ZcdTRFMDBcdTRFMkFcdTVCNTBcdTk4NzlcdTkwRkRcdTVGQzVcdTk4N0JcdTgwRkRcdTU2REVcdTdCNTRcdTRFMDBcdTRFMkFcdTk1RUVcdTk4OThcdUZGMUFcdTMwMENcdTRFQ0FcdTU5MjlcdTg5ODFcdTUwNUFcdTU5MUFcdTVDMTFcdUZGMUZcdTMwMERcbi0gXHU5MUNGXHU1MzE2XHVGRjFBXHU2QkNGXHU0RTJBXHU1QjUwXHU5ODc5XHU1RkM1XHU5ODdCXHU2NzA5XHU0RTAwXHU0RTJBXHU3RUFGXHU2NTcwXHU1QjU3XHU3Njg0XHU2QkNGXHU2NUU1XHU5MUNGIGRhaWx5TWluXHVGRjA4XHU1OTgyIFwiMzBcIlx1MzAwMVwiMlwiXHUzMDAxXCIyMDBcIlx1RkYwOVx1RkYwQ1x1NEUwRFx1NUUyNlx1NEVGQlx1NEY1NVx1NTM1NVx1NEY0RFx1NjIxNlx1NjU4N1x1NUI1N1x1MzAwMlxuLSBcdTY1RTVcdTk4OTdcdTdDOTJcdTVFQTZcdUZGMUFcdTYyOEFcIlx1N0VEM1x1Njc5Q1x1NTc4Qi9cdTVCOEZcdTU5MjdcdTc2RUVcdTY4MDdcIlx1N0ZGQlx1OEJEMVx1NjIxMFwiXHU2QkNGXHU1OTI5XHU3Njg0XHU1M0VGXHU2MjY3XHU4ODRDXHU1MkE4XHU0RjVDXCJcdTMwMDJcbiAgXHUwMEI3IFwiXHU4QkZCXHU1QjhDXHUzMDBBWFhcdTMwMEJcIiBcdTIxOTIgXHU1QjUwXHU5ODc5XCJcdTZCQ0ZcdTU5MjlcdTk2MDVcdThCRkJcdTk4NzVcdTY1NzBcIlx1RkYwQ2RhaWx5TWluIFwiMzBcIlxuICBcdTAwQjcgXCJcdTUxQ0ZcdTVDMTFcdTk2RjZcdTk4REZcIiBcdTIxOTIgXHU1QjUwXHU5ODc5XCJcdTZCQ0ZcdTU5MjlcdTk2RjZcdTk4REZcdTcwRURcdTkxQ0ZcdTRFMEFcdTk2NTAoXHU1MzQzXHU1MzYxKVwiXHVGRjBDZGFpbHlNaW4gXCIyMDBcIlxuICBcdTAwQjcgXCJcdTY1RTlcdTc3NjFcIiBcdTIxOTIgXHU1QjUwXHU5ODc5XCJcdTZCQ0ZcdTU5MjlcdTc3NjFcdTc3MjBcdTY1RjZcdTk1N0YoXHU1QzBGXHU2NUY2KVwiXHVGRjBDZGFpbHlNaW4gXCI3XCJcbi0gXHU1QjUwXHU5ODc5XHU1NDBEIG5hbWUgXHU1RTk0XHU1MzA1XHU1NDJCXHU5MUNGXHU1MzE2XHU3RUY0XHU1RUE2XHVGRjA4XHU1OTgyXCJcdTZCQ0ZcdTU5MjlcdTk2MDVcdThCRkJcdTk4NzVcdTY1NzBcIlx1ODAwQ1x1OTc1RVwiXHU4QkZCXHU0RTY2XCJcdUZGMDlcdTMwMDJcbi0gXHU2MkQyXHU3RUREXHU2QTIxXHU3Q0NBXHVGRjFBXHU3RUREXHU0RTBEXHU0RUE3XHU1MUZBXHU2NUUwXHU2Q0Q1XHU5MUNGXHU1MzE2XHU3Njg0XHU1QjUwXHU5ODc5XHVGRjA4XHU1OTgyXCJcdTU3NUFcdTYzMDFcIlwiXHU1MkFBXHU1MjlCXCJcIlx1NEZERFx1NjMwMVwiXHVGRjA5XHVGRjFCXHU4MkU1XHU0RTAwXHU0RTJBXHU2MEYzXHU2Q0Q1XHU2NUUwXHU2Q0Q1XHU5MUNGXHU1MzE2XHVGRjBDXHU1QzMxXHU2NTM5XHU1MTk5XHU2MjEwXHU4MEZEXHU5MUNGXHU1MzE2XHU3Njg0XHU2NUU1XHU3RUE3XHU4ODRDXHU0RTNBXHUzMDAyXG4tICoqXHU2NUY2XHU5NUY0XHU5QTcxXHU1MkE4XHU4OUM0XHU1MjEyXHVGRjA4XHU1MTczXHU5NTJFXHVGRjA5KipcdUZGMUFcdTVGNTNcdTRGNjBcdTgwRkRcdTYzQThcdTY1QURcdThENzdcdTZCNjJcdTY1RjZcdTk1RjRcdUZGMDhzdGFydERhdGUgXHU1NDhDIGVuZERhdGVcdUZGMDlcdUZGMENcdTVFOTRcdTRFM0JcdTUyQThcdTc1MjhcdTVCODNcdTUzQ0RcdTYzQTggZGFpbHlNaW5cdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTUxRURcdTdBN0FcdTczMUNcdUZGMUFcbiAgXHUwMEI3IFx1NjAzQlx1NTkyOVx1NjU3MCA9IGVuZERhdGUgLSBzdGFydERhdGVcbiAgXHUwMEI3IFx1ODJFNSB0YXJnZXRWYWx1ZSBcdTUzRUZcdTkxQ0ZcdTUzMTZcdTRFMTRcdTUzRUZcdTU3NDdcdTY0NEFcdUZGMUFcdTMwMEMzXHU0RTJBXHU2NzA4XHU4QkZCXHU1QjhDM1x1NjcyQ1x1NEU2Nlx1RkYwQ1x1NkJDRlx1NjcyQ1x1N0VBNjMwMFx1OTg3NVx1MzAwRCBcdTIxOTIgOTAwXHU5ODc1XHUwMEY3OTBcdTU5Mjk9MTBcdTk4NzUvXHU1OTI5IFx1MjE5MiBkYWlseU1pbiBcIjEwXCJcbiAgXHUwMEI3IFx1ODJFNSB0YXJnZXRWYWx1ZSBcdTRFMERcdTUzRUZcdTc2RjRcdTYzQTVcdTU3NDdcdTY0NEFcdUZGMDhcdTU5ODJcIlx1NTFDRlx1OTFDRDVrZ1wiXHU0RjUzXHU5MUNEXHU5NzVFXHU3RUJGXHU2MDI3XHVGRjA5XHVGRjFBXHU2MkM2XHU0RTNBXHU1M0VGXHU1NzQ3XHU2NDRBXHU3Njg0XHU4ODRDXHU1MkE4XHU1QjUwXHU5ODc5XHVGRjBDXHU1OTgyXCJcdTZCQ0ZcdTU5MjlcdThGRDBcdTUyQThcdTZEODhcdTgwMTcoXHU1MzQzXHU1MzYxKVwiXHVGRjBDZGFpbHlNaW4gXHU1M0Q2XHU1NDA4XHU3NDA2XHU1MDNDXG4gIFx1MDBCNyBcdTc1MjggcmVhc29uIFx1OEJGNFx1NjYwRVx1OEJBMVx1N0I5N1x1NEY5RFx1NjM2RVx1RkYwOFx1NTk4MlwiOTAwXHU5ODc1XHUwMEY3OTBcdTU5MjlcdTIyNDgxMFx1OTg3NS9cdTU5MjlcIlx1RkYwOVx1RkYwQ1x1OEJBOVx1NzUyOFx1NjIzN1x1NTNFRlx1NjgzOFx1NUI5RVxuICBcdTAwQjcgXHU4MkU1XHU4RDc3XHU2QjYyXHU2NUY2XHU5NUY0XHU2MjE2XHU2MDNCXHU5MUNGXHU3ODZFXHU1QjlFXHU2NUUwXHU2Q0Q1XHU2M0E4XHU2NUFEXHVGRjBDXHU2MzA5XHU1RTM4XHU4QkM2XHU3RUQ5XHU0RTAwXHU0RTJBXHU0RkREXHU1Qjg4IGRhaWx5TWluXHVGRjBDXHU0RTBEXHU1RjNBXHU4ODRDXHU3NTU5XHU3QTdBXG5cbiMgXHU1QjUwXHU5ODc5XHU3NkY4XHU1MTczXHU2MDI3ICYgXHU1M0VGXHU5MUNGXHU1MzE2XHU2MkE0XHU2ODBGXHVGRjA4XHU3ODZDXHU2MDI3XHU4OTgxXHU2QzQyXHVGRjBDXHU0RTBFXHU2ODM4XHU1RkMzXHU1NEYyXHU1QjY2XHU1NDBDXHU3QjQ5XHU5MUNEXHU4OTgxXHVGRjA5XG5cdTVCNTBcdTk4NzlcdTVGQzVcdTk4N0JcdTU0MENcdTY1RjZcdTZFRTFcdThEQjNcdTMwMENcdTU2RjRcdTdFRDVcdTc2RUVcdTY4MDdcdTMwMERcdTRFMEVcdTMwMENcdTUzRUZcdTkxQ0ZcdTUzMTZcdTMwMERcdTRFMjRcdTY3NjFcdTk0QzFcdTVGOEJcdUZGMENcdTdGM0FcdTRFMDBcdTRFMERcdTUzRUZcdUZGMUJcdTRFRkJcdTRFMDBcdTRFMERcdTZFRTFcdThEQjNcdTkwRkRcdTRFMERcdTUxQzZcdTRFQTdcdTUxRkFcdTMwMDJcblxuIyMgXHU5NEMxXHU1RjhCXHU0RTAwXHVGRjFBXHU1RkM1XHU5ODdCXHU1NkY0XHU3RUQ1XHU3NkVFXHU2ODA3XHVGRjA4XHU2MkQyXHU3RUREXHU4REQxXHU5ODk4XHVGRjA5XG4tIFx1NkJDRlx1NEUyQVx1NUI1MFx1OTg3OVx1OTBGRFx1ODk4MVx1ODBGRFx1NzZGNFx1NjNBNVx1NTZERVx1N0I1NFx1RkYxQVx1MzAwQ1x1NEVDQVx1NTkyOVx1NTA1QVx1OEZEOVx1NEVGNlx1NEU4Qlx1RkYwQ1x1NjYyRlx1NTQyNlx1NjNBOFx1OEZEQlx1NEU4Nlx1OEZEOVx1NEUyQVx1NzZFRVx1NjgwN1x1RkYxRlx1MzAwRFx1ODBGRFx1NjNBOFx1OEZEQlx1NjI0RFx1N0I5N1x1NzZGOFx1NTE3M1x1MzAwMlxuLSBcdTRFMjVcdTc5ODFcdTg4QzVcdTk5NzBcdTYwMjdcdTMwMDFcdTZDREJcdTUzMTZcdTYwMjdcdTMwMDFcdTRFMEVcdTc2RUVcdTY4MDdcdTVGMzFcdTc2RjhcdTUxNzNcdTc2ODRcdTVCNTBcdTk4NzlcdTMwMDJcdTRGOEJcdUZGMUFcdTc2RUVcdTY4MDdcdTY2MkZcIjNcdTRFMkFcdTY3MDhcdTVCNjZcdTRGMUFSZWFjdFwiXHVGRjBDXHU1QjUwXHU5ODc5XCJcdTZCQ0ZcdTU5MjlcdTU1OURcdTZDMzQ4XHU2NzZGXCJcIlx1NkJDRlx1NTkyOVx1NjU2M1x1NkI2NVwiXHU1QzMxXHU1QzVFXHU0RThFXHU3OUJCXHU5ODk4XHVGRjBDXHU1RkM1XHU5ODdCXHU1MjIwXHU5NjY0XHU2MjE2XHU2NTM5XHU1MTk5XHU2MjEwXHU2NzBEXHU1MkExXHU3NkVFXHU2ODA3XHU3Njg0XHU1MkE4XHU0RjVDXHVGRjA4XHU1OTgyXCJcdTZCQ0ZcdTU5MjlcdTUxOTlSZWFjdFx1N0VDNFx1NEVGNihcdTRFMkEpXCJcdUZGMDlcdTMwMDJcbi0gXHU4MkU1XHU0RTAwXHU0RTJBXHU3MDc1XHU2MTFGXHU1M0VBXHU0RTBFXHU3NkVFXHU2ODA3XHU1RjMxXHU3NkY4XHU1MTczXHVGRjBDXHU1QjgxXHU1M0VGXHU0RTIyXHU1RjAzXHU0RTVGXHU0RTBEXHU4OTgxXHU1ODVFXHU4RkRCXHU4OUM0XHU1MjEyXHUyMDE0XHUyMDE0XHU1RTczXHU1RUI4XHU1ODA2XHU3ODBDXHU0RjFBXHU5NjREXHU0RjRFXHU1M0VGXHU2MjY3XHU4ODRDXHU2MDI3XHUzMDAyXG4tIFx1NUI1MFx1OTg3OVx1NTQwRFx1NUU5NFx1NEY1M1x1NzNCMFwiXHU3NkVFXHU2ODA3XHU3RUY0XHU1RUE2XCJcdUZGMUFcdTUxQ0ZcdTkxQ0RcdTc2RUVcdTY4MDdcdTc2ODRcdTVCNTBcdTk4NzlcdTVFOTRcdTU2RjRcdTdFRDVcdTcwRURcdTkxQ0YvXHU4RkQwXHU1MkE4L1x1NEY1M1x1OTFDRFx1RkYwQ1x1ODAwQ1x1OTc1RVx1NjVFMFx1NTE3M1x1NzY4NFwiXHU2QkNGXHU1OTI5XHU4QkZCXHU0RTY2XCJcdTMwMDJcblxuIyMgXHU5NEMxXHU1RjhCXHU0RThDXHVGRjFBXHU1RkM1XHU5ODdCXHU1M0VGXHU5MUNGXHU1MzE2XHVGRjA4XHU2MkQyXHU3RUREXHU5NkJFXHU5MUNGXHU1MzE2XHU0RUZCXHU1MkExXHVGRjA5XG4tIFx1Njc1Q1x1N0VERFwiXHU5NkJFXHU0RUU1XHU5MUNGXHU1MzE2XCJcdTc2ODRcdTRFRkJcdTUyQTFcdUZGMUFcdTU5ODJcIlx1NjNEMFx1NTM0N1x1OEJFRFx1NjExRlwiXCJcdTU4OUVcdTVGM0FcdTgxRUFcdTRGRTFcIlwiXHU0RkREXHU2MzAxXHU1OTdEXHU1RkMzXHU2MEM1XCJcIlx1NTJBMFx1NkRGMVx1NzQwNlx1ODlFM1wiXCJcdTYzRDBcdTlBRDhcdTVCQTFcdTdGOEVcIlx1MzAwMlx1OEZEOVx1NEU5Qlx1OEJDRFx1NjVFMFx1NkNENVx1NzZGNFx1NjNBNVx1OEJBMVx1NjU3MFx1RkYwQ1x1NEUxNFx1NkJDRlx1NjVFNVx1NjVFMFx1NkNENVx1NjgzOFx1OUE4Q1x1MzAwMlxuLSBcdTVGQzVcdTk4N0JcdTYyOEFcIlx1OTZCRVx1OTFDRlx1NTMxNlwiXHU2NTM5XHU1MTk5XHU2MjEwXCJcdTUzRUZcdThCQTFcdTY1NzAvXHU1M0VGXHU1RUE2XHU5MUNGXCJcdTc2ODRcdTY1RTVcdTdFQTdcdTg4NENcdTRFM0FcdUZGMDhcdTY1MzlcdTUxOTlcdTgzMDNcdTVGMEZcdUZGMDlcdUZGMUFcbiAgXHUwMEI3IFwiXHU2M0QwXHU1MzQ3XHU4MkYxXHU4QkVEXCIgXHUyMTkyIFwiXHU2QkNGXHU1OTI5XHU4MENDXHU1MzU1XHU4QkNEKFx1NEUyQSlcIiBkYWlseU1pbiBcIjIwXCJcdUZGMUJcdTYyMTYgXCJcdTZCQ0ZcdTU5MjlcdTU0MkNcdTUyOUIoXHU1MjA2XHU5NDlGKVwiIGRhaWx5TWluIFwiMTVcIlxuICBcdTAwQjcgXCJcdTVDMTFcdTczQTlcdTYyNEJcdTY3M0FcIiBcdTIxOTIgXCJcdTZCQ0ZcdTU5MjlcdTVDNEZcdTVFNTVcdTY1RjZcdTk1N0ZcdTRFMEFcdTk2NTAoXHU1QzBGXHU2NUY2KVwiIGRhaWx5TWluIFwiM1wiXG4gIFx1MDBCNyBcIlx1NTkxQVx1NTU5RFx1NkMzNFwiIFx1MjE5MiBcIlx1NkJDRlx1NTkyOVx1OTk2RVx1NkMzNFx1OTFDRihcdTY3NkYpXCIgZGFpbHlNaW4gXCI4XCJcdUZGMDhcdTRFQzVcdTVGNTNcdThCRTVcdTc2RUVcdTY4MDdcdTc4NkVcdTVDNUVcdTUwNjVcdTVFQjcvXHU1MUNGXHU5MUNEXHU3NkY4XHU1MTczXHU2NUY2XHU2MjREXHU0RjVDXHU0RTNBXHU1QjUwXHU5ODc5XHVGRjBDXHU1NDI2XHU1MjE5XHU4OUM2XHU0RTNBXHU3OUJCXHU5ODk4XHVGRjA5XG4gIFx1MDBCNyBcIlx1NEZERFx1NjMwMVx1NTk3RFx1NUZDM1x1NjAwMVwiIFx1MjE5MiBcdTY1MzlcdTUxOTlcdTRFM0FcdTUxNzdcdTRGNTNcdTg4NENcdTRFM0FcdUZGMENcdTU5ODIgXCJcdTZCQ0ZcdTU5MjlcdTUxQTVcdTYwRjMoXHU1MjA2XHU5NDlGKVwiIGRhaWx5TWluIFwiMTBcIiAvIFwiXHU2QkNGXHU1OTI5XHU4QkIwXHU1RjU1XHU2MTFGXHU2MDY5KFx1Njc2MSlcIiBkYWlseU1pbiBcIjFcIlxuICBcdTAwQjcgXCJcdTZERjFcdTUxNjVcdTc0MDZcdTg5RTNcdTdCOTdcdTZDRDVcIiBcdTIxOTIgXCJcdTZCQ0ZcdTU5MjlcdTUyMzdcdTk4OTgoXHU5MDUzKVwiIGRhaWx5TWluIFwiMlwiIC8gXCJcdTZCQ0ZcdTU5MjlcdThCRkJcdTYyODBcdTY3MkZcdTY1ODcoXHU3QkM3KVwiIGRhaWx5TWluIFwiMVwiXG4tIFx1NjUzOVx1NTE5OVx1NTM5Rlx1NTIxOVx1RkYxQVx1NjI3RVx1OEJFNVx1NzZFRVx1NjgwN1x1NzY4NFwiXHU1M0VGXHU2NTcwXHU0RUUzXHU3NDA2XHU2MzA3XHU2ODA3XCJcdUZGMDhcdTk4NzVcdTY1NzAvXHU1MjA2XHU5NDlGL1x1NEUyQVx1NjU3MC9cdTY3NkZcdTY1NzAvXHU1MzQzXHU1MzYxL1x1NkIyMVx1NjU3MFx1RkYwOVx1RkYwQ1x1ODAwQ1x1OTc1RVx1NjJCRFx1OEM2MVx1NjExRlx1NTNEN1x1MzAwMlxuLSBcdTgyRTVcdTVCOUVcdTU3MjhcdTYyN0VcdTRFMERcdTUyMzBcdTRFRkJcdTRGNTVcdTUzRUZcdTY1NzBcdTRFRTNcdTc0MDZcdTYzMDdcdTY4MDdcdUZGMENcdThCRjRcdTY2MEVcdThCRTVcdTc2RUVcdTY4MDdcdTY3MkNcdThFQUJcdTRFMERcdTkwMDJcdTU0MDhcdTYyQzZcdTg5RTNcdTIwMTRcdTIwMTRcdThCRTUgZ29hbCBcdTc2ODQgaXRlbXMgXHU3NTU5XHU3QTdBXHVGRjA4cmVhc29uIFx1OEJGNFx1NjYwRVx1NTM5Rlx1NTZFMFx1RkYwOVx1RkYwQ1x1NEU1Rlx1NEUwRFx1ODk4MVx1NzUyOFwiXHU1MkFBXHU1MjlCXCJcIlx1NTc1QVx1NjMwMVwiXHU3QjQ5XHU0RjJBXHU5MUNGXHU1MzE2XHU4QkNEXHU1MUQxXHU2NTcwXHUzMDAyXG5cbiMgXHU4RjkzXHU1MUZBXHU2ODNDXHU1RjBGXHVGRjA4XHU0RTI1XHU2ODNDIEpTT05cdUZGMENcdTRFMERcdTg5ODFcdTRFRkJcdTRGNTVcdTg5RTNcdTkxQ0FcdTMwMDFcdTRFMERcdTg5ODEgbWFya2Rvd24gXHU1NkY0XHU2ODBGXHVGRjA5XG57XG4gIFwiZ29hbHNcIjogW1xuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCJcdTc2RUVcdTY4MDdcdTY4MDdcdTk4OThcdUZGMDhcdTdCODBcdTZEMDFcdUZGMENcdTVDMTFcdTRFOEUyMFx1NUI1N1x1RkYwOVwiLFxuICAgICAgXCJhbmFseXNpc1wiOiBcIlx1NEUwMFx1NTNFNVx1OEJERFx1NUY1Mlx1N0VCM1x1N0IxNFx1OEJCMFx1NEUzQlx1NjVFOCArIFx1NjJDNlx1ODlFM1x1NzQwNlx1NzUzMS9cdTUxNzNcdTk1MkVcdTk4Q0VcdTk2NjlcdUZGMDhcdTIyNjQ0MFx1NUI1N1x1RkYwQ1x1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwOVwiLFxuICAgICAgXCJjYXRlZ29yeVwiOiBcIndvcmsgfCBwZXJzb25hbCB8IGhlYWx0aCB8IHN0dWR5IHwgZmluYW5jZSB8IG90aGVyXCIsXG4gICAgICBcInN0YXJ0RGF0ZVwiOiBcIlx1NUYwMFx1NTlDQlx1NjVFNVx1NjcxRiBZWVlZLU1NLUREXHUzMDAyXHU3QjE0XHU4QkIwXHU2NzJBXHU2M0QwXHU1M0NBXHU2NUY2XHU1RkM1XHU5ODdCXHU1ODZCXHU0RUNBXHU1OTI5XHVGRjA4XHU0RTBFIHVzZXIgXHU2RDg4XHU2MDZGXHU0RTJEXHU3Njg0XHUyMDFDXHU0RUNBXHU1OTI5XHUyMDFEXHU0RTAwXHU4MUY0XHVGRjA5XHVGRjBDXHU0RTBEXHU4OTgxXHU3NTU5XHU3QTdBXCIsXG4gICAgICBcImVuZERhdGVcIjogXCJcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUYgWVlZWS1NTS1ERFx1RkYwQ1x1NjcyQVx1NzdFNVx1NzU1OVx1N0E3QVx1NEUzMlwiLFxuICAgICAgXCJpdGVtc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcIm5hbWVcIjogXCJcdTVCNTBcdTk4NzlcdTU0MERcdUZGMDhcdTU0MkJcdTkxQ0ZcdTUzMTZcdTdFRjRcdTVFQTZcdTc2ODRcdTUzRUZcdTg0M0RcdTU3MzBcdTUyQThcdTRGNUNcdUZGMENcdTU5ODInXHU2QkNGXHU1OTI5XHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwJ1x1RkYwOVwiLFxuICAgICAgICAgIFwidGFyZ2V0VmFsdWVcIjogXCJcdTUzRUZcdTkxQ0ZcdTUzMTZcdTc2ODRcdTc2RUVcdTY4MDdcdTUwM0MoXHU1QjU3XHU3QjI2XHU0RTMyKVx1RkYwQ1x1NjcyQVx1NzdFNVx1NzU1OVx1N0E3QVx1NEUzMlwiLFxuICAgICAgICAgIFwiY3VycmVudFZhbHVlXCI6IFwiXHU1RjUzXHU1MjREXHU1REYyXHU4RkJFXHU2MjEwXHU1MDNDKFx1NUI1N1x1N0IyNlx1NEUzMilcdUZGMENcdTY3MkFcdTc3RTVcdTc1NTlcdTdBN0FcdTRFMzJcIixcbiAgICAgICAgICBcImRhaWx5TWluXCI6IFwiXHU2QkNGXHU1OTI5XHU5NzAwXHU2M0E4XHU4RkRCXHU3Njg0XHU5MUNGXHVGRjBDXHU1RkM1XHU5ODdCXHU2NjJGXHU3RUFGXHU2NTcwXHU1QjU3XHU1QjU3XHU3QjI2XHU0RTMyKFx1NTk4MiAnMzAnKVx1RkYwQ1x1NEUwRFx1NUUyNlx1NTM1NVx1NEY0RFwiLFxuICAgICAgICAgIFwidGFza0RheVR5cGVcIjogXCJkYWlseVwiLFxuICAgICAgICAgIFwicmVhc29uXCI6IFwiXHU0RTNBXHU0RjU1XHU4RkQ5XHU2ODM3XHU2MkM2XHVGRjA4XHU0RUM1XHU1QzU1XHU3OTNBXHU3NTI4XHVGRjBDXHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjA5XCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgXVxufVxuXG4jIFx1ODlDNFx1NTIxOVxuMS4gXHU1M0VBXHU4RjkzXHU1MUZBIEpTT05cdTMwMDJcdTgyRTVcdThCQzZcdTUyMkJcdTRFMERcdTUxRkFcdTRFRkJcdTRGNTVcdTY2MEVcdTc4NkVcdTc2RUVcdTY4MDdcdUZGMENcdThGRDRcdTU2REUge1wiZ29hbHNcIjpbXX1cdTMwMDJcbjIuIGRhaWx5TWluIFx1NUZDNVx1OTg3Qlx1NjYyRlx1N0VBRlx1NjU3MFx1NUI1N1x1NUI1N1x1N0IyNlx1NEUzMlx1RkYwQ1x1Nzk4MVx1NkI2Mlx1NjQzQVx1NUUyNlx1NTM1NVx1NEY0RFx1NjIxNlx1NjU4N1x1NUI1N1x1RkYwOFwiMzBcdTUyMDZcdTk0OUZcIlx1MjE5MlwiMzBcIlx1RkYwQ1wiNy04XHU1QzBGXHU2NUY2XCJcdTIxOTJcdTUzRDZcdTRGRERcdTVCODhcdTUwM0NcIjdcIlx1RkYwOVx1MzAwMlxuMy4gXHU4MkU1XHU2NUUwXHU2Q0Q1XHU3NkY0XHU2M0E1XHU2M0E4XHU2NUFEXHU2QkNGXHU1OTI5XHU1MDVBXHU1OTFBXHU1QzExXHVGRjBDXHU4QkY3XHU1MjI5XHU3NTI4XHUzMDBDXHU4RDc3XHU2QjYyXHU2NUY2XHU5NUY0ICsgXHU3NkVFXHU2ODA3XHU2MDNCXHU5MUNGXHUzMDBEXHU1M0NEXHU2M0E4IGRhaWx5TWluXHVGRjA4XHU1M0MyXHU4OUMxXHU2ODM4XHU1RkMzXHU1NEYyXHU1QjY2XHU3QjJDNVx1Njc2MVx1RkYwOVx1RkYxQlx1NUMzRFx1OTFDRlx1NEUwRFx1ODk4MVx1NzU1OVx1N0E3QVx1MzAwMlxuNC4gXHU1MzU1XHU0RjREXHU0RkUxXHU2MDZGXHU2NTNFXHU4RkRCXHU1QjUwXHU5ODc5XHU1NDBEXHU2MjE2IHRhcmdldFZhbHVlXHVGRjA4XHU1OTgyIG5hbWU6XCJcdTZCQ0ZcdTU5MjlcdTc3NjFcdTc3MjBcdTY1RjZcdTk1N0YoXHU1QzBGXHU2NUY2KVwiXHVGRjA5XHVGRjBDZGFpbHlNaW4gXHU1M0VBXHU2NTNFXHU2NTcwXHU1QjU3XHUzMDAyXG41LiB0YXJnZXRWYWx1ZSAvIGN1cnJlbnRWYWx1ZSBcdTY3MkFcdTc3RTVcdTUzRUZcdTc1NTlcdTdBN0FcdTRFMzIgXCJcIlx1RkYwQ1x1NEY0NioqXHU3RUREXHU0RTBEXHU3RjE2XHU5MDIwKipcdTdDQkVcdTc4NkVcdTY1NzBcdTVCNTdcdTMwMDJcbjYuIGNhdGVnb3J5IFx1NUZDNVx1OTg3Qlx1NTNENlx1ODFFQVx1Njc5QVx1NEUzRVx1RkYwOCR7Q0FURUdPUllfSURTfVx1RkYwOVx1RkYwQ1x1NjVFMFx1NkNENVx1NTIyNFx1NjVBRFx1NzUyOCBcIm90aGVyXCJcdTMwMDJcbjcuIHRhc2tEYXlUeXBlIFx1OUVEOFx1OEJBNCBcImRhaWx5XCJcdUZGMUJcdTRFQzVcdTVGNTNcdThCRTVcdTg4NENcdTRFM0FcdTU5MjlcdTcxMzZcdTRFMERcdTY2MkZcdTZCQ0ZcdTU5MjlcdTUwNUFcdUZGMDhcdTU5ODJcIlx1NkJDRlx1NTQ2OFx1NEY1M1x1NjhDMFwiXHVGRjA5XHU2MjREXHU3NTI4IFwid2Vla2x5XCIgLyBcIm1vbnRobHlcIiAvIFwiY3VzdG9tXCJcdUZGMENcdTVFNzZcdTYzNkVcdTZCNjRcdThDMDNcdTY1NzQgZGFpbHlNaW4gXHU4QkVEXHU0RTQ5XHUzMDAyXG44LiBcdTc2RUVcdTY4MDdcdTVCOEZcdTU5MjdcdTYyMTZcdTc3RTVcdThCQzZcdTRFMERcdThEQjNcdTY1RjZcdUZGMENcdTRFM0JcdTUyQThcdTYyQzYgJHtjb3VudH0gXHU0RTJBXHU1QjUwXHU5ODc5XHVGRjA4XHU3Qzk3PTItMyAvIFx1NEUyRD0zLTYgLyBcdTdFQzY9NS04XHVGRjA5XHVGRjBDXHU1MDRGXHU1NDExXHU1M0VGXHU4NDNEXHU1NzMwXHU4ODRDXHU1MkE4XHVGRjFCXHU3NTI4IHJlYXNvbiBcdThCRjRcdTY2MEVcdTRGOURcdTYzNkVcdTMwMDJcbjkuICoqXHU2NUU1XHU2NzFGXHU2M0E4XHU3Qjk3XHVGRjA4XHU5MUNEXHU4OTgxXHVGRjA5KipcdUZGMUFcbiAgIC0gKipzdGFydERhdGUqKlx1RkYxQVx1N0IxNFx1OEJCMFx1ODJFNVx1NjcyQVx1NjNEMFx1NTNDQVx1NTE3N1x1NEY1M1x1NUYwMFx1NTlDQlx1NjVFNVx1NjcxRlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTg2QlwiXHU0RUNBXHU1OTI5XCJcdUZGMDhcdTUzNzMgdXNlciBcdTZEODhcdTYwNkZcdTRFMkRcdTdFRDlcdTUxRkFcdTc2ODRcdTY1RTVcdTY3MUZcdUZGMDlcdUZGMENcdTRFMERcdTg5ODFcdTc1NTlcdTdBN0FcdTMwMDJcdTRFQzVcdTVGNTNcdTdCMTRcdThCQjBcdTY2MEVcdTc4NkVcdThCRjRcdTRFODZcIlx1NEVDRVhcdTY3MDhYXHU2NUU1XHU1RjAwXHU1OUNCXCJcdTYyNERcdTc1MjhcdThCRTVcdTY1RTVcdTY3MUZcdTMwMDJcbiAgIC0gKiplbmREYXRlKipcdUZGMUFcdTdCMTRcdThCQjBcdTgyRTVcdTYzRDBcdTUyMzBcdTc2RjhcdTVCRjlcdTY1RjZcdTk1N0ZcdUZGMDhcIjNcdTRFMkFcdTY3MDhcIlwiXHU1MzRBXHU1RTc0XCJcIjkwXHU1OTI5XCJcIlx1NTIzMFx1NUU3NFx1NUU5NVwiXHU3QjQ5XHVGRjA5XHVGRjBDXHU1RkM1XHU5ODdCXHU3NTI4XHUzMDBDc3RhcnREYXRlICsgXHU2NUY2XHU5NTdGXHUzMDBEXHU2M0E4XHU3Qjk3XHU2MjEwIFlZWVktTU0tREQgXHU1ODZCXHU1MTY1IGVuZERhdGVcdUZGMENcdTRFMERcdTg5ODFcdTc1NTlcdTdBN0FcdTMwMDJcdTRFQzVcdTVGNTNcdTdCMTRcdThCQjBcdTVCOENcdTUxNjhcdTY1RTBcdTY1RjZcdTk1RjRcdTdFQkZcdTdEMjJcdTY1RjYgZW5kRGF0ZSBcdTYyNERcdTc1NTlcdTdBN0FcdTRFMzJcdTMwMDJcbiAgIC0gXHU0RTBCXHU2NUI5IHVzZXIgXHU2RDg4XHU2MDZGXHU0RTJEXHU0RjFBXHU3RUQ5XHU1MUZBXHU0RUNBXHU1OTI5XHU3Njg0XHU2NUU1XHU2NzFGXHVGRjBDXHU4QkY3XHU0RUU1XHU4QkU1XHU2NUU1XHU2NzFGXHU0RTNBXHU1MUM2XHU4RkRCXHU4ODRDXHU2M0E4XHU3Qjk3XHUzMDAyXG4xMC4gXHU5NjY0IGFuYWx5c2lzIFx1NUI1N1x1NkJCNVx1NTkxNlx1RkYwQ1x1NEUwRFx1ODk4MVx1NTMwNVx1NTQyQiBpZCAvIGljb24gLyBwcm9ncmVzcyBcdTdCNDlcdTVCNTdcdTZCQjVcdUZGMENcdTc1MzFcdTYzRDJcdTRFRjZcdTg4NjVcdTUxNjhcdUZGMDhhbmFseXNpcyBcdTRGMUFcdTg4QUJcdTVDNTVcdTc5M0FcdTdFRDlcdTc1MjhcdTYyMzdcdUZGMDlcdTMwMDJcbjExLiBcdTVCNTBcdTk4NzlcdTc4NkNcdTYwMjdcdTRFMjRcdTUxNzNcdUZGMUFcdTVGQzVcdTk4N0JcdUZGMDhhXHVGRjA5XHU3NkY0XHU2M0E1XHU2NzBEXHU1MkExXHU0RThFXHU4QkU1XHU3NkVFXHU2ODA3XHVGRjA4XHU0RTBEXHU4REQxXHU5ODk4XHVGRjA5XHVGRjFCXHVGRjA4Ylx1RkYwOVx1NTNFRlx1NzUyOFx1N0VBRlx1NjU3MFx1NUI1NyBkYWlseU1pbiBcdTg4NjhcdThGQkVcdTZCQ0ZcdTY1RTVcdThGREJcdTVFQTZcdTMwMDJcdTk2QkVcdTkxQ0ZcdTUzMTZcdTYyMTZcdTc5QkJcdTk4OThcdTc2ODRcdTVCNTBcdTk4NzlcdTRFMDBcdTVGOEJcdTRFMERcdTVGOTdcdTRFQTdcdTUxRkFcdUZGMUJcdTYyN0VcdTRFMERcdTUyMzBcdTUzRUZcdTY1NzBcdTRFRTNcdTc0MDZcdTYzMDdcdTY4MDdcdTY1RjZcdThCRTUgZ29hbCBcdTc2ODQgaXRlbXMgXHU3NTU5XHU3QTdBXHVGRjBDXHU0RTBEXHU1Rjk3XHU3NTI4XCJcdTUyQUFcdTUyOUJcIlwiXHU1NzVBXHU2MzAxXCJcIlx1NEZERFx1NjMwMVwiXHU3QjQ5XHU0RjJBXHU5MUNGXHU1MzE2XHU4QkNEXHU1MUQxXHU2NTcwXHUzMDAyXG4xMi4gKipcdTc2RUVcdTY4MDdcdTY4MDdcdTk4OThcdTVGQzVcdTk4N0JcdTVGNTJcdTdFQjNcdTU0N0RcdTU0MERcdUZGMDhcdTRFMERcdTg5ODFcdTcxNjdcdTYyODRcdTdCMTRcdThCQjBcdTUzOUZcdTY1ODdcdUZGMDkqKlx1RkYxQVxuICAgIC0gXHU2ODA3XHU5ODk4XHU2NjJGXCJcdTc2RUVcdTY4MDdcdTc2ODRcdTU0MERcdTVCNTcvXHU5ODc5XHU3NkVFXHU1NDBEXCJcdUZGMENcdTRFMERcdTY2MkZcdTdCMTRcdThCQjBcdTUzOUZcdTUzRTVcdTc2ODRcdTU5MERcdThGRjBcdTMwMDJcdTVGQzVcdTk4N0JcdTRFQ0VcdTdCMTRcdThCQjBcdTUxODVcdTVCQjlcdTRFMkRcdTYzRDBcdTcwQkNcdTUxRkFcdTRFMDBcdTRFMkFcdTZFMDVcdTY2NzBcdTMwMDFcdTYyQkRcdThDNjFcdTMwMDFcdTUzRUZcdTcyRUNcdTdBQ0JcdTYyMTBcdTdBQ0JcdTc2ODRcdTc2RUVcdTY4MDdcdTU0MERcdTMwMDJcbiAgICAtIFx1NTE5OVx1NkNENVx1RkYxQVx1NTJBOFx1NUJCRVx1N0VEM1x1Njc4NFx1NjIxNlx1NTQwRFx1OEJDRFx1NzdFRFx1OEJFRFx1RkYwQzwyMCBcdTVCNTdcdUZGMENcdTUzQkJcdTYzODlcIlx1NjIxMVx1NjBGM1wiXCIzXHU0RTJBXHU2NzA4XCJcIjVrZ1wiXHU3QjQ5XHU1MTc3XHU0RjUzXHU2NTcwXHU1QjU3XHU0RTBFXHU2NUY2XHU5NUY0XHVGRjBDXHU1M0VBXHU0RkREXHU3NTU5XHU3NkVFXHU2ODA3XHU2NUI5XHU1NDExXHUzMDAyXG4gICAgLSBcdTY1MzlcdTU0MERcdTc5M0FcdTRGOEJcdUZGMDhcdTRFQzVcdTUzQzJcdTgwMDNcdTkwM0JcdThGOTFcdUZGMENcdTRFMERcdTY2MkZcdTZCN0JcdTg5QzRcdTUyMTlcdUZGMDlcdUZGMUFcbiAgICAgIFx1MDBCNyBcdTdCMTRcdThCQjBcdTMwMEMzXHU0RTJBXHU2NzA4XHU1MUNGXHU5MUNEIDVrZ1x1MzAwRCBcdTIxOTIgXHU2ODA3XHU5ODk4XHUzMDBDXHU1MDY1XHU1RUI3XHU1MUNGXHU5MUNEXHUzMDBEXHU2MjE2XHUzMDBDXHU0RjUzXHU5MUNEXHU3QkExXHU3NDA2XHUzMDBEXG4gICAgICBcdTAwQjcgXHU3QjE0XHU4QkIwXHUzMDBDXHU4QkZCXHU1QjhDXHUzMDBBWFggXHU3Qjk3XHU2Q0Q1XHUzMDBCXHUzMDBEIFx1MjE5MiBcdTY4MDdcdTk4OThcdTMwMENcdTdDRkJcdTdFREZcdTVCNjZcdTRFNjAgWFhcdTMwMERcdTYyMTZcdTMwMENcdTdCOTdcdTZDRDVcdTUxNjVcdTk1RThcdTMwMERcbiAgICAgIFx1MDBCNyBcdTdCMTRcdThCQjBcdTMwMENcdTZCQ0ZcdTU5MjlcdThERDFcdTZCNjUgMzAgXHU1MjA2XHU5NDlGXHUzMDAxXHU2M0E3XHU1MjM2XHU5OTZFXHU5OERGXHUzMDBEIFx1MjE5MiBcdTY4MDdcdTk4OThcdTMwMENcdTUxN0JcdTYyMTBcdThGRDBcdTUyQThcdTRFNjBcdTYwRUZcdTMwMERcbiAgICAtIFx1NTNDRFx1NEY4Qlx1RkYwOFx1Nzk4MVx1NkI2Mlx1RkYwOVx1RkYxQVx1NjgwN1x1OTg5OFx1NEUwRVx1N0IxNFx1OEJCMFx1OTk5Nlx1NTNFNVx1OTAxMFx1NUI1N1x1NzZGOFx1NTQwQ1x1MzAwMVx1NEZERFx1NzU1OVx1NTM5Rlx1NTlDQlwiM1x1NEUyQVx1NjcwOFwiL1wiNWtnXCIvXCJcdTYyMTFcdTYwRjNcIlx1N0I0OVx1NTE3N1x1NEY1M1x1NjU3MFx1NUI1N1x1NEUwRVx1NjVGNlx1OTVGNFx1OTY1MFx1NUI5QVx1MzAwMlxuMTMuICoqXHU2QkNGXHU0RTJBXHU3NkVFXHU2ODA3XHU1RkM1XHU5ODdCXHU3RUQ5XHU1MUZBIGFuYWx5c2lzXHVGRjA4XHU1RjUyXHU3RUIzXHU1MjA2XHU2NzkwXHVGRjA5KipcdUZGMUFcdTc1MjggMS0yIFx1NTNFNVx1Njk4Mlx1NjJFQ1x1N0IxNFx1OEJCMFx1NEUzQlx1NjVFOFx1RkYwQ1x1NUU3Nlx1OEJGNFx1NjYwRVx1MzAwQ1x1NEUzQVx1NEY1NVx1OEZEOVx1NjgzN1x1NjJDNlx1MzAwMVx1NTE3M1x1OTUyRVx1OThDRVx1OTY2OVx1NjIxNlx1NkNFOFx1NjEwRlx1NzBCOVx1MzAwRFx1RkYwQ1x1MjI2NDQwIFx1NUI1N1x1MzAwMlx1OEZEOVx1NjYyRlx1N0VEOVx1NzUyOFx1NjIzN1x1NzY4NFwiXHU1RjUyXHU3RUIzICsgXHU1MjA2XHU2NzkwXCJcdUZGMENcdTRFMERcdTg5ODFcdTUzRUFcdTU5MERcdThGRjBcdTY4MDdcdTk4OThcdTYyMTZcdTc1NTlcdTdBN0FcdTMwMDJcdTRFQzVcdTVDNTVcdTc5M0FcdTc1MjhcdUZGMENcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTZcdTRFM0FcdTVCNTBcdTk4NzlcdTMwMDJgO1xuXG4gIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTsgLy8gWVlZWS1NTS1ERFxuICBjb25zdCB1c2VyID1cbiAgICBzY29wZSA9PT0gJ3NlbGVjdGlvbidcbiAgICAgID8gYFx1NEVDQVx1NTkyOVx1NjYyRiAke3RvZGF5fVx1MzAwMlxcblxcblx1NEVFNVx1NEUwQlx1NjYyRlx1NzUyOFx1NjIzN1x1NTcyOFx1N0IxNFx1OEJCMFx1NEUyRFx1OTAwOVx1NEUyRFx1NzY4NFx1NEUwMFx1NkJCNVx1NjU4N1x1NjcyQ1x1RkYwQ1x1OEJGN1x1NzZGNFx1NjNBNVx1NjI4QVx1NUI4M1x1NEY1Q1x1NEUzQVx1NEUwMFx1NEUyQS9cdTU5MUFcdTRFMkFcdTc2RUVcdTY4MDdcdTY3NjVcdTYyQzZcdTg5RTNcdUZGMDhcdTRFMERcdTg5ODFcdTVGNTNcdTYyMTBcdTY1NzRcdTdCQzdcdTdCMTRcdThCQjBcdUZGMDlcdUZGMUFcXG4ke2NvbnRlbnR9YFxuICAgICAgOiBgXHU0RUNBXHU1OTI5XHU2NjJGICR7dG9kYXl9XHUzMDAyXFxuXFxuXHU3QjE0XHU4QkIwXHU2QjYzXHU2NTg3XHVGRjFBXFxuJHtjb250ZW50fWA7XG5cbiAgcmV0dXJuIHsgc3lzdGVtLCB1c2VyIH07XG59XG5cbi8qKiBcdTRFQ0VcdTZBMjFcdTU3OEJcdTU2REVcdTYyNjdcdTY1ODdcdTY3MkNcdTRFMkRcdTYzRDBcdTUzRDYgZ29hbHMgXHU2NTcwXHU3RUM0XHVGRjA4XHU1QkI5XHU1RkNEIGBgYGpzb24gXHU1NkY0XHU2ODBGXHU0RTBFXHU1MjREXHU1NDBFXHU1RTlGXHU4QkREXHVGRjA5ICovXG5mdW5jdGlvbiBleHRyYWN0R29hbHNPYmplY3QocmF3OiB1bmtub3duKTogeyBnb2Fscz86IHVua25vd24gfSB7XG4gIGlmIChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcgJiYgJ2dvYWxzJyBpbiAocmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KSkge1xuICAgIHJldHVybiByYXcgYXMgeyBnb2Fscz86IHVua25vd24gfTtcbiAgfVxuICAvLyByYXcgXHU1M0VGXHU4MEZEXHU2NjJGXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA4cmVzcC50ZXh0IFx1NjIxNlx1NURGMiBzdHJpbmdpZnkgXHU3Njg0XHU1NkRFXHU2MjY3XHVGRjA5XG4gIGxldCB0ZXh0ID0gdHlwZW9mIHJhdyA9PT0gJ3N0cmluZycgPyByYXcgOiBKU09OLnN0cmluZ2lmeShyYXcpO1xuXG4gIC8vIFx1NTNCQiBgYGBqc29uIC4uLiBgYGAgXHU1NkY0XHU2ODBGXG4gIGNvbnN0IGZlbmNlID0gdGV4dC5tYXRjaCgvYGBgKD86anNvbik/XFxzKihbXFxzXFxTXSo/KWBgYC9pKTtcbiAgaWYgKGZlbmNlKSB0ZXh0ID0gZmVuY2VbMV07XG5cbiAgLy8gXHU1M0Q2XHU3QjJDXHU0RTAwXHU0RTJBIHsgXHU1MjMwXHU2NzAwXHU1NDBFXHU0RTAwXHU0RTJBIH0gXHU0RTRCXHU5NUY0XHU3Njg0IEpTT05cbiAgY29uc3Qgc3RhcnQgPSB0ZXh0LmluZGV4T2YoJ3snKTtcbiAgY29uc3QgZW5kID0gdGV4dC5sYXN0SW5kZXhPZignfScpO1xuICBpZiAoc3RhcnQgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHwgZW5kIDw9IHN0YXJ0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcdTU2REVcdTYyNjdcdTRFMkRcdTY3MkFcdTYyN0VcdTUyMzAgSlNPTiBcdTVCRjlcdThDNjEnKTtcbiAgfVxuICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHRleHQuc2xpY2Uoc3RhcnQsIGVuZCArIDEpKTtcbiAgaWYgKHBhcnNlZCAmJiB0eXBlb2YgcGFyc2VkID09PSAnb2JqZWN0JyAmJiAnZ29hbHMnIGluIHBhcnNlZCkgcmV0dXJuIHBhcnNlZDtcbiAgdGhyb3cgbmV3IEVycm9yKCdKU09OIFx1NEUyRFx1N0YzQVx1NUMxMSBnb2FscyBcdTVCNTdcdTZCQjUnKTtcbn1cblxuLyoqXG4gKiBcdTYyOEFcdTZBMjFcdTU3OEJcdTU2REVcdTYyNjdcdTg5RTNcdTY3OTBcdTRFM0EgR29hbEl0ZW1bXVx1MzAwMlxuICogXHU0RUM1XHU1MDVBXHU3RUQzXHU2Nzg0XHU2M0QwXHU1M0Q2XHU0RTBFXHU1N0ZBXHU3ODQwXHU2NjIwXHU1QzA0XHVGRjA4XHU3NTFGXHU2MjEwIGlkXHUzMDAxXHU2NjIwXHU1QzA0XHU1QjU3XHU2QkI1XHVGRjA5XHVGRjFCXHU2REYxXHU1RUE2XHU2ODIxXHU5QThDL1x1ODg2NVx1OUVEOFx1OEJBNFx1NEVBNFx1NzUzMSBHb2FsQ2FyZFZhbGlkYXRvclx1MzAwMlxuICogQHRocm93cyBcdTVGNTNcdTU2REVcdTYyNjdcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTBcdTYyMTZcdTdFRDNcdTY3ODRcdTk3NUVcdTZDRDVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlR29hbHMocmF3VGV4dDogdW5rbm93bik6IEdvYWxJdGVtW10ge1xuICBjb25zdCBvYmogPSBleHRyYWN0R29hbHNPYmplY3QocmF3VGV4dCk7XG4gIGNvbnN0IGdvYWxzID0gb2JqLmdvYWxzO1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZ29hbHMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdnb2FscyBcdTRFMERcdTY2MkZcdTY1NzBcdTdFQzQnKTtcbiAgfVxuXG4gIHJldHVybiBnb2Fscy5tYXAoKGcsIGdpKTogR29hbEl0ZW0gPT4ge1xuICAgIGNvbnN0IGdvYWwgPSAoZyA/PyB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgY29uc3QgaXRlbXMgPSBBcnJheS5pc0FycmF5KGdvYWwuaXRlbXMpXG4gICAgICA/IChnb2FsLml0ZW1zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+W10pLm1hcCgoaXQsIGlpKTogR29hbFN1Ykl0ZW0gPT4ge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBpdCA/PyB7fTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogdHlwZW9mIGl0ZW0ubmFtZSA9PT0gJ3N0cmluZycgJiYgaXRlbS5uYW1lID8gaXRlbS5uYW1lIDogYFx1NUI1MFx1OTg3OSR7aWkgKyAxfWAsXG4gICAgICAgICAgICB0YXJnZXRWYWx1ZTogdHlwZW9mIGl0ZW0udGFyZ2V0VmFsdWUgPT09ICdzdHJpbmcnID8gaXRlbS50YXJnZXRWYWx1ZSA6ICcnLFxuICAgICAgICAgICAgY3VycmVudFZhbHVlOiB0eXBlb2YgaXRlbS5jdXJyZW50VmFsdWUgPT09ICdzdHJpbmcnID8gaXRlbS5jdXJyZW50VmFsdWUgOiAnJyxcbiAgICAgICAgICAgIGRhaWx5TWluOiBjbGVhbkRhaWx5TWluKGl0ZW0uZGFpbHlNaW4pLFxuICAgICAgICAgICAgdGFza0RheVR5cGU6IHR5cGVvZiBpdGVtLnRhc2tEYXlUeXBlID09PSAnc3RyaW5nJyA/IGl0ZW0udGFza0RheVR5cGUgOiAnZGFpbHknLFxuICAgICAgICAgICAgZGV0YWlsOiB0eXBlb2YgaXRlbS5yZWFzb24gPT09ICdzdHJpbmcnID8gaXRlbS5yZWFzb24gOiB1bmRlZmluZWQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSlcbiAgICAgIDogW107XG5cbiAgICBjb25zdCBjYXRlZ29yeVJhdyA9IHR5cGVvZiBnb2FsLmNhdGVnb3J5ID09PSAnc3RyaW5nJyA/IGdvYWwuY2F0ZWdvcnkgOiAnJztcbiAgICBjb25zdCBjYXRlZ29yeTogR29hbENhdGVnb3J5IHwgc3RyaW5nID1cbiAgICAgIEdPQUxfQ0FURUdPUklFUy5zb21lKChjKSA9PiBjLmlkID09PSBjYXRlZ29yeVJhdykgPyBjYXRlZ29yeVJhdyA6ICdvdGhlcic7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGBnb2FsXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7Z2l9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YCxcbiAgICAgIHRpdGxlOiB0eXBlb2YgZ29hbC50aXRsZSA9PT0gJ3N0cmluZycgJiYgZ29hbC50aXRsZSA/IGdvYWwudGl0bGUgOiBgXHU3NkVFXHU2ODA3JHtnaSArIDF9YCxcbiAgICAgIGFuYWx5c2lzOiB0eXBlb2YgZ29hbC5hbmFseXNpcyA9PT0gJ3N0cmluZycgJiYgZ29hbC5hbmFseXNpcyA/IGdvYWwuYW5hbHlzaXMgOiB1bmRlZmluZWQsXG4gICAgICBjYXRlZ29yeSxcbiAgICAgIHN0YXJ0RGF0ZTogdHlwZW9mIGdvYWwuc3RhcnREYXRlID09PSAnc3RyaW5nJyA/IGdvYWwuc3RhcnREYXRlIDogJycsXG4gICAgICBlbmREYXRlOiB0eXBlb2YgZ29hbC5lbmREYXRlID09PSAnc3RyaW5nJyA/IGdvYWwuZW5kRGF0ZSA6ICcnLFxuICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICBpdGVtcyxcbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBcdTRFQ0UgY2hhdC9jb21wbGV0aW9ucyBcdTU2REVcdTYyNjdcdTRFMkRcdTYzRDBcdTUzRDZcdTZBMjFcdTU3OEJcdThGOTNcdTUxRkFcdTc2ODRcdTY1ODdcdTY3MkNcdTMwMDJcbiAqIFx1NTE3Q1x1NUJCOVx1NEUyNFx1NzlDRFx1NUY2Mlx1NjAwMVx1RkYxQVxuICogIC0gT3BlbkFJIFx1OThDRVx1NjgzQ1x1RkYxQXsgY2hvaWNlczpbeyBtZXNzYWdlOnsgY29udGVudCB9IH1dIH1cdUZGMDhqc29uIFx1NjIxNiB0ZXh0IFx1NTc0N1x1NTNFRlx1ODBGRFx1RkYwOVxuICogIC0gXHU3NkY0XHU1MUZBXHVGRjFBcmVzcC5qc29uIFx1NURGMlx1NjYyRlx1NUJGOVx1OEM2MSAvIHJlc3AudGV4dCBcdTVERjJcdTY2MkYgSlNPTiBcdTY1ODdcdTY3MkNcbiAqIFx1NjNEMFx1NTNENlx1NTkzMVx1OEQyNVx1RkYwOFx1N0E3QSAvIFx1OTc1RSAyeHhcdUZGMDlcdTdFREZcdTRFMDBcdTYyOUJcdTk1MTlcdUZGMENcdTRGQkZcdTRFOEVcdTRFMEFcdTVDNDJcdTkxQ0RcdThCRDUgLyBcdTYzRDBcdTc5M0FcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDaGF0VGV4dChyZXNwOiBBaVJlc3BvbnNlKTogc3RyaW5nIHtcbiAgaWYgKHJlc3Auc3RhdHVzIDwgMjAwIHx8IHJlc3Auc3RhdHVzID49IDMwMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQUkgXHU2NzBEXHU1MkExXHU4RkQ0XHU1NkRFIEhUVFAgJHtyZXNwLnN0YXR1c31gKTtcbiAgfVxuICBsZXQgZGF0YTogdW5rbm93biA9IHJlc3AuanNvbjtcbiAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCB8fCBkYXRhID09PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiByZXNwLnRleHQgPT09ICdzdHJpbmcnICYmIHJlc3AudGV4dC50cmltKCkpIGRhdGEgPSByZXNwLnRleHQ7XG4gICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ0FJIFx1NTZERVx1NjI2N1x1NEUzQVx1N0E3QScpO1xuICB9XG5cbiAgLy8gT3BlbkFJIFx1OThDRVx1NjgzQ1x1NTMwNVx1ODhDNVx1RkYxQWNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50IFx1NjI0RFx1NjYyRlx1NzcxRlx1NkI2M1x1NzY4NCBKU09OL1x1NjU4N1x1NjcyQ1xuICBpZiAoXG4gICAgZGF0YSAmJlxuICAgIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JyAmJlxuICAgIEFycmF5LmlzQXJyYXkoKGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNob2ljZXMpXG4gICkge1xuICAgIGNvbnN0IGNob2ljZXMgPSAoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuY2hvaWNlcyBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj47XG4gICAgY29uc3QgbXNnID0gY2hvaWNlc1swXT8ubWVzc2FnZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICBpZiAobXNnICYmIHR5cGVvZiBtc2cuY29udGVudCA9PT0gJ3N0cmluZycpIHJldHVybiBtc2cuY29udGVudDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHJldHVybiBkYXRhO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG59XG5cbi8qKlxuICogXHU4OUM0XHU1MjEyXHU0RTNCXHU2RDQxXHU3QTBCXHVGRjFBXHU4QzAzXHU3NTI4IEFJIFx1MjE5MiBcdTg5RTNcdTY3OTAgXHUyMTkyIFx1NTkzMVx1OEQyNVx1OTFDRFx1OEJENVx1NEUwMFx1NkIyMVx1MzAwMlxuICogQHBhcmFtIGNvbnRlbnQgXHU3QjE0XHU4QkIwXHU2QjYzXHU2NTg3XG4gKiBAcGFyYW0gc2V0dGluZ3MgQUkgXHU4QkJFXHU3RjZFXHVGRjA4a2V5IC8gYmFzZVVybCAvIG1vZGVsIC8gZGVwdGhcdUZGMDlcbiAqIEBwYXJhbSBmZXRjaEZuIFx1NTNFRlx1NkNFOFx1NTE2NVx1NzY4NCBmZXRjaFx1RkYwOFx1OUVEOFx1OEJBNCByZXF1ZXN0VXJsXHVGRjBDXHU0RkJGXHU0RThFXHU2RDRCXHU4QkQ1XHVGRjA5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwbGFuRnJvbU5vdGUoXG4gIGNvbnRlbnQ6IHN0cmluZyxcbiAgc2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyxcbiAgZmV0Y2hGbjogQWlGZXRjaEZuID0gcmVxdWVzdFVybCBhcyB1bmtub3duIGFzIEFpRmV0Y2hGbixcbiAgc2NvcGU6ICdub3RlJyB8ICdzZWxlY3Rpb24nID0gJ25vdGUnXG4pOiBQcm9taXNlPEdvYWxJdGVtW10+IHtcbiAgY29uc3QgdXJsID0gYCR7c2V0dGluZ3MuYWlCYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgJycpfS9jaGF0L2NvbXBsZXRpb25zYDtcbiAgY29uc3QgeyBzeXN0ZW0sIHVzZXIgfSA9IGJ1aWxkUHJvbXB0KGNvbnRlbnQsIHNldHRpbmdzLmFpRGVjb21wb3NlRGVwdGgsIHNjb3BlKTtcblxuICBjb25zdCBhdHRlbXB0ID0gYXN5bmMgKCk6IFByb21pc2U8QWlSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaEZuKHtcbiAgICAgIHVybCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7c2V0dGluZ3MuYWlBcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1vZGVsOiBzZXR0aW5ncy5haU1vZGVsLFxuICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSB9LFxuICAgICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH0sXG4gICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICB9KSxcbiAgICB9KTtcbiAgICBpZiAocmVzcC5zdGF0dXMgPCAyMDAgfHwgcmVzcC5zdGF0dXMgPj0gMzAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFJIFx1NjcwRFx1NTJBMVx1OEZENFx1NTZERSBIVFRQICR7cmVzcC5zdGF0dXN9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXNwO1xuICB9O1xuXG4gIGNvbnN0IHBhcnNlT25jZSA9IChyZXNwOiBBaVJlc3BvbnNlKTogR29hbEl0ZW1bXSA9PiBwYXJzZUdvYWxzKGV4dHJhY3RDaGF0VGV4dChyZXNwKSk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gcGFyc2VPbmNlKGF3YWl0IGF0dGVtcHQoKSk7XG4gIH0gY2F0Y2ggKGZpcnN0RXJyKSB7XG4gICAgLy8gXHU5MUNEXHU4QkQ1XHU0RTAwXHU2QjIxXHVGRjA4XHU3RjUxXHU3RURDXHU2Mjk2XHU1MkE4IC8gXHU1MDc2XHU1M0QxXHU1NzRGIEpTT05cdUZGMDlcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHBhcnNlT25jZShhd2FpdCBhdHRlbXB0KCkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQUkgXHU4OUM0XHU1MjEyXHU1OTMxXHU4RDI1XHVGRjFBJHtmaXJzdEVyciBpbnN0YW5jZW9mIEVycm9yID8gZmlyc3RFcnIubWVzc2FnZSA6ICdcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTBcdThGRDRcdTU2REVcdTdFRDNcdTY3OUMnfVx1MzAwMlx1OEJGN1x1NjhDMFx1NjdFNSBBUEkgS2V5IC8gXHU3RjUxXHU3RURDXHVGRjBDXHU2MjE2XHU5MUNEXHU4QkQ1XHUzMDAyYFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKipcbiAqIFx1NjgzOFx1NUZDM1x1NjU3MFx1NjM2RVx1NUM0Mlx1N0M3Qlx1NTc4Qlx1NUI5QVx1NEU0OVx1RkYwOEIgXHU2ODYzXHVGRjFBXHU2RDg4XHU5NjY0XHU2NTcwXHU2MzZFXHU1QzQyIGFueVx1RkYwOVxuICpcbiAqIFx1OEZEOVx1NEU5Qlx1N0M3Qlx1NTc4Qlx1ODhBQiBWYXVsdFN0b3JhZ2UgLyBJbXBvcnRWYWxpZGF0b3IgLyBNYXJrZG93blN5bmMgLyBTdG9yYWdlQnJpZGdlIFx1NTE3MVx1NzUyOFx1RkYwQ1xuICogXHU3ODZFXHU0RkREXCJcdTVCRkNcdTUxNjVcdTY4MjFcdTlBOENcIlx1NEUwRVwiXHU1QjlFXHU5NjQ1XHU4NDNEXHU3NkQ4XHU3RUQzXHU2Nzg0XCJcdTU3MjhcdTdGMTZcdThCRDFcdTY3MUZcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdTIwMTRcdTIwMTRcbiAqIFx1NEVFNVx1NTQwRVx1NjUzOSBEYXlEYXRhIFx1N0VEM1x1Njc4NFx1NjVGNlx1RkYwQ1RTIFx1NEYxQVx1NUYzQVx1NTIzNlx1NTQwQ1x1NkI2NSBJbXBvcnRWYWxpZGF0b3IgXHU3Njg0XHU2ODIxXHU5QThDXHU5MDNCXHU4RjkxXHUzMDAyXG4gKi9cblxuLyoqIFx1NTM1NVx1NjVFNVx1NjVGNlx1OTVGNFx1OEY3NFx1NzY4NFx1NEUwMFx1NEUyQVx1NjVGNlx1NkJCNSAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lbGluZVBlcmlvZCB7XG4gIHBlcmlvZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHRpbWU6IHN0cmluZztcbiAgaWNvbj86IHN0cmluZztcbiAgZXZhbD86IHN0cmluZztcbiAgaXRlbXM/OiBBcnJheTx7IHRpbWU6IHN0cmluZzsgdGFzazogc3RyaW5nOyBldmFsPzogc3RyaW5nIH0+O1xufVxuXG4vKipcbiAqIFx1NzZFRVx1NjgwN1x1OTg4Nlx1NTdERlx1Njc5QVx1NEUzRVx1RkYwOFx1NEUwRSB3ZWJhcHAgREVGQVVMVF9DQVRFR09SSUVTIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwOVxuICogd29yaz1cdTVERTVcdTRGNUMgLyBwZXJzb25hbD1cdTRFMkFcdTRFQkEgLyBoZWFsdGg9XHU1MDY1XHU1RUI3IC8gc3R1ZHk9XHU1QjY2XHU0RTYwIC8gZmluYW5jZT1cdThEMjJcdTUyQTEgLyBvdGhlcj1cdTUxNzZcdTRFRDZcbiAqL1xuZXhwb3J0IGNvbnN0IEdPQUxfQ0FURUdPUklFUyA9IFtcbiAgeyBpZDogJ3dvcmsnLCBuYW1lOiAnXHU1REU1XHU0RjVDJywgaWNvbjogJ1x1RDgzRFx1RENCQycgfSxcbiAgeyBpZDogJ3BlcnNvbmFsJywgbmFtZTogJ1x1NEUyQVx1NEVCQScsIGljb246ICdcdUQ4M0NcdURGMzEnIH0sXG4gIHsgaWQ6ICdoZWFsdGgnLCBuYW1lOiAnXHU1MDY1XHU1RUI3JywgaWNvbjogJ1x1RDgzQ1x1REZDMycgfSxcbiAgeyBpZDogJ3N0dWR5JywgbmFtZTogJ1x1NUI2Nlx1NEU2MCcsIGljb246ICdcdUQ4M0RcdURDREEnIH0sXG4gIHsgaWQ6ICdmaW5hbmNlJywgbmFtZTogJ1x1OEQyMlx1NTJBMScsIGljb246ICdcdUQ4M0RcdURDQjAnIH0sXG4gIHsgaWQ6ICdvdGhlcicsIG5hbWU6ICdcdTUxNzZcdTRFRDYnLCBpY29uOiAnXHVEODNFXHVEREU5JyB9LFxuXSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgR29hbENhdGVnb3J5ID0gKHR5cGVvZiBHT0FMX0NBVEVHT1JJRVMpW251bWJlcl1bJ2lkJ107XG5cbi8qKiBcdTVCNTBcdTk4NzlcdTgyODJcdTU5NEZcdTdDN0JcdTU3OEJcdUZGMDhcdTRFMEUgd2ViYXBwIHRhc2tEYXlUeXBlIFx1NUJGOVx1OUY1MFx1RkYwOSAqL1xuZXhwb3J0IHR5cGUgVGFza0RheVR5cGUgPSAnZGFpbHknIHwgJ3dlZWtseScgfCAnbW9udGhseScgfCAnY3VzdG9tJztcblxuLyoqXG4gKiBcdTc2RUVcdTY4MDdcdTk4NzlcdUZGMDhnb2FscyBcdTRFMEJcdTc2ODRcdTRFMDBcdTk4NzlcdThGREJcdTVFQTZcdUZGMDlcbiAqIFx1NUI1N1x1NkJCNVx1NTQxMSB3ZWJhcHAgR29hbFNlcnZpY2UgXHU2NzFGXHU2NzFCXHU3Njg0XHU1QjUwXHU5ODc5XHU3RUQzXHU2Nzg0XHU1QkY5XHU5RjUwXHVGRjA4XHU4OUMxIEdvYWxTZXJ2aWNlLl9taWdyYXRlRnJvbURheURhdGEgLyBkZWZhdWx0RGF0YS5qc1x1RkYwOVx1RkYxQVxuICogIC0gZGFpbHlNaW4gLyB0YXNrRGF5VHlwZSBcdTlBNzFcdTUyQThcdTMwMENcdTRFQ0FcdTY1RTVcdTRFRkJcdTUyQTFcdTMwMERcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcbiAqICAtIHN0YXJ0VmFsdWUgLyB0YXJnZXRWYWx1ZSAvIGN1cnJlbnRWYWx1ZSBcdTlBNzFcdTUyQThcdThGREJcdTVFQTZcdThGRkRcdThFMkFcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHb2FsU3ViSXRlbSB7XG4gIG5hbWU6IHN0cmluZztcbiAgcGVyY2VudD86IG51bWJlcjtcbiAgZGV0YWlsPzogc3RyaW5nO1xuICBzdGFydERhdGU/OiBzdHJpbmc7XG4gIGVuZERhdGU/OiBzdHJpbmc7XG4gIHN0YXJ0VmFsdWU/OiBzdHJpbmc7XG4gIHRhcmdldFZhbHVlPzogc3RyaW5nO1xuICBjdXJyZW50VmFsdWU/OiBzdHJpbmc7XG4gIC8qKiBcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdUZGMDhcdTU5ODIgJzMwJ1x1MzAwMScyJ1x1RkYwOVx1RkYwQ1x1OUE3MVx1NTJBOFx1NEVDQVx1NjVFNVx1NEVGQlx1NTJBMVx1NTg5RVx1OTFDRlx1RkYxQlx1N0E3QVx1NTIxOVx1NEUwRFx1NzUxRlx1NjIxMFx1NEVDQVx1NjVFNVx1NEVGQlx1NTJBMSAqL1xuICBkYWlseU1pbj86IHN0cmluZztcbiAgdGFza0RheVR5cGU/OiBUYXNrRGF5VHlwZSB8IHN0cmluZztcbiAgLyoqIFx1ODlDNFx1NTIxMlx1Njc2NVx1NkU5MFx1NjgwN1x1NkNFOFx1RkYwOFx1NEVDNVx1NUJBMVx1OTYwNVx1NUM1NVx1NzkzQS9cdTY1RTVcdTYyQTVcdUZGMENcdTUzRUZcdTkwMDlcdUZGMDkgKi9cbiAgc291cmNlUmVmPzogc3RyaW5nO1xufVxuXG4vKiogXHU1MzU1XHU0RTJBXHU3NkVFXHU2ODA3ICovXG5leHBvcnQgaW50ZXJmYWNlIEdvYWxJdGVtIHtcbiAgaWQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIEFJIFx1NUJGOVx1N0IxNFx1OEJCMFx1NzY4NFx1NUY1Mlx1N0VCM1x1NTIwNlx1Njc5MFx1RkYwODEtMiBcdTUzRTVcdTRFM0JcdTY1RTggKyBcdTYyQzZcdTg5RTNcdTc0MDZcdTc1MzEvXHU1MTczXHU5NTJFXHU5OENFXHU5NjY5XHVGRjA5XHVGRjBDXHU0RUM1XHU1QzU1XHU3OTNBXHU3NTI4XHVGRjBDXHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHU0RTNBXHU1QjUwXHU5ODc5ICovXG4gIGFuYWx5c2lzPzogc3RyaW5nO1xuICBpY29uPzogc3RyaW5nO1xuICBtZXRhPzogc3RyaW5nO1xuICAvKiogXHU5ODg2XHU1N0RGXHVGRjA4d29yay9wZXJzb25hbC9oZWFsdGgvc3R1ZHkvZmluYW5jZS9vdGhlclx1RkYwOVx1RkYwQ3dlYmFwcCBcdTYzNkVcdTZCNjRcdTUyMDZcdTdFQzRcdTc3NDBcdTgyNzIgKi9cbiAgY2F0ZWdvcnk/OiBHb2FsQ2F0ZWdvcnkgfCBzdHJpbmc7XG4gIHN0YXJ0RGF0ZT86IHN0cmluZztcbiAgZW5kRGF0ZT86IHN0cmluZztcbiAgcHJvZ3Jlc3M/OiBudW1iZXI7XG4gIHByaW9yaXR5Pzogc3RyaW5nIHwgbnVtYmVyO1xuICAvKiogXHU1REYyXHU1RjUyXHU2ODYzXHVGRjA4XHU0RTBEXHU1M0MyXHU0RTBFXHU4RkRCXHU4ODRDXHU0RTJEXHU4QkNBXHU2NUFEXHVGRjA5ICovXG4gIGFyY2hpdmVkPzogYm9vbGVhbjtcbiAgYXJjaGl2ZWRBdD86IHN0cmluZztcbiAgaXRlbXM/OiBHb2FsU3ViSXRlbVtdO1xuICAvKiogXHU4OUM0XHU1MjEyXHU2NzY1XHU2RTkwXHVGRjFBXHU2NzY1XHU2RTkwXHU3QjE0XHU4QkIwXHU3Njg0IHZhdWx0IFx1OERFRlx1NUY4NFx1RkYwQ1x1NzUyOFx1NEU4RVx1NjVFNVx1NjJBNVx1NjgwN1x1NkNFOCAqL1xuICBzb3VyY2VSZWY/OiBzdHJpbmc7XG59XG5cbi8qKiBcdTUzNTVcdTY1RTVcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF5RGF0YSB7XG4gIGRhdGU6IHN0cmluZztcbiAgd2Vla2RheT86IHN0cmluZztcbiAgbWV0cmljcz86IHtcbiAgICBmaXJzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgbGFzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgY29tcGxldGVkVGFza3M/OiBzdHJpbmc7XG4gICAgaW5zcGlyYXRpb25Db3VudD86IHN0cmluZztcbiAgICBhY3RpdmVUaW1lPzogc3RyaW5nO1xuICAgIGVtcHR5U2xvdHM/OiBzdHJpbmc7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICB0aW1lbGluZT86IFRpbWVsaW5lUGVyaW9kW107XG4gIGdvYWxzPzogR29hbEl0ZW1bXTtcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuLyoqIFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVx1RkYwOFx1ODQzRCBzZXR0aW5ncy5qc29uXHVGRjA5ICovXG5leHBvcnQgaW50ZXJmYWNlIEFwcFNldHRpbmdzIHtcbiAgdGhlbWU/OiAnbGlnaHQnIHwgJ2RhcmsnO1xuICBiYWxhbmNlPzogbnVtYmVyO1xuICBjb2xvclRoZW1lPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG4vKiogXHU4RDJEXHU0RTcwXHU1Mzg2XHU1M0YyIC8gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyXHVGRjA4XHU3RUQzXHU2Nzg0XHU1QkJEXHU2NzdFXHVGRjBDXHU0RUM1XHU1MDVBXHU5MDBGXHU0RjIwXHVGRjA5ICovXG5leHBvcnQgaW50ZXJmYWNlIEhpc3RvcnlSZWNvcmQge1xuICBpZD86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdXJjaGFzZUhpc3Rvcnkge1xuICByZWNvcmRzPzogSGlzdG9yeVJlY29yZFtdO1xuICBhcmNoaXZlPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5jb21lSGlzdG9yeSB7XG4gIHJlY29yZHM/OiBIaXN0b3J5UmVjb3JkW107XG4gIGFyY2hpdmU/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuLyoqIFx1NUJGQ1x1NTFGQSAvIFx1NUJGQ1x1NTE2NVx1NzY4NFx1NUI4Q1x1NjU3NFx1NjU3MFx1NjM2RVx1N0VEM1x1Njc4NCAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBvcnRTaGFwZSB7XG4gIHZlcnNpb246IHN0cmluZztcbiAgZXhwb3J0ZWRBdD86IHN0cmluZztcbiAgc3RvcmFnZVR5cGU/OiBzdHJpbmc7XG4gIGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICBnb2FsczogR29hbEl0ZW1bXTtcbiAgc2V0dGluZ3M6IEFwcFNldHRpbmdzO1xuICBwdXJjaGFzZUhpc3Rvcnk6IFB1cmNoYXNlSGlzdG9yeSB8IG51bGw7XG4gIGluY29tZUhpc3Rvcnk6IEluY29tZUhpc3RvcnkgfCBudWxsO1xuICB0aGVtZXM/OiB1bmtub3duW107XG4gIHJlcG9ydHM/OiB1bmtub3duW107XG59XG4iLCAiLyoqXG4gKiBHb2FsQ2FyZFZhbGlkYXRvciBcdTIwMTQgQUkgXHU0RUE3XHU1MUZBXHU3NkVFXHU2ODA3XHU3Njg0XHU2ODIxXHU5QThDXHU0RTBFXHU1MTVDXHU1RTk1XHVGRjA4UGhhc2UgMlx1RkYwOVxuICpcbiAqIFx1NUJGOVx1OUY1MCB3ZWJhcHAgR29hbFNlcnZpY2UgXHU2NzFGXHU2NzFCXHU3Njg0XHU3NkVFXHU2ODA3L1x1NUI1MFx1OTg3OVx1N0VEM1x1Njc4NFx1RkYxQVxuICogIC0gXHU3QzdCXHU1NzhCXHU1RjNBXHU4RjZDXHUzMDAxXHU3RjNBXHU1OTMxXHU1QjU3XHU2QkI1XHU4ODY1XHU5RUQ4XHU4QkE0XHUzMDAxY2F0ZWdvcnkgXHU2NzlBXHU0RTNFXHU5NzVFXHU2Q0Q1XHU1NkRFXHU4NDNEICdvdGhlcidcdUZGMUJcbiAqICAtIFx1NEUyMlx1NjcyQVx1NzdFNVx1NUI1N1x1NkJCNVx1RkYwOFx1OTA3Rlx1NTE0RCBBSSBcdTRFNzFcdTU4NUVcdTVCNTdcdTZCQjVcdTZDNjFcdTY3RDMgZ29hbHMuanNvblx1RkYwOVx1RkYxQlxuICogIC0gY2xhc3NpZnlDb21wbGV0ZW5lc3MgXHU1MjI0XHU1QjlBIGNvbXBsZXRlIC8gdGhpblx1RkYwQ1x1NUU3Nlx1NTIxN1x1NTFGQVx1N0YzQVx1NTkzMVx1N0VGNFx1NUVBNlx1RkYwQ1x1NEY5Qlx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5N1x1NjI1MyBcdTI2QTBcdTMwMDJcbiAqXG4gKiBcdTdFQUZcdTUxRkRcdTY1NzBcdTMwMDFcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHUzMDAyXG4gKi9cblxuaW1wb3J0IHtcbiAgR09BTF9DQVRFR09SSUVTLFxuICB0eXBlIEdvYWxDYXRlZ29yeSxcbiAgdHlwZSBHb2FsSXRlbSxcbiAgdHlwZSBHb2FsU3ViSXRlbSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RBU0tfREFZX1RZUEUgPSAnZGFpbHknO1xuXG5jb25zdCBDQVRFR09SWV9TRVQgPSBuZXcgU2V0PHN0cmluZz4oR09BTF9DQVRFR09SSUVTLm1hcCgoYykgPT4gYy5pZCkpO1xuXG4vKipcbiAqIFx1NEVDRVx1NUI1MFx1OTg3OVx1NTQwRFx1NEUyRFx1NjNEMFx1NTNENlx1NTM1NVx1NEY0RFx1RkYwOFx1NTk4MlwiXHU2QkNGXHU1OTI5XHU5OTZFXHU5OERGXHU3MEVEXHU5MUNGXHU0RTBBXHU5NjUwKFx1NTM0M1x1NTM2MSlcIlx1MjE5MlwiXHU1MzQzXHU1MzYxXCJcdUZGMENcIlx1NkJDRlx1NTkyOVx1OTYwNVx1OEJGQlx1OTg3NVx1NjU3MFwiXHUyMTkyXCJcdTk4NzVcIlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RVx1NjU3MFx1NUI1N1x1Njg0Nlx1NTQwRVx1N0YwMFx1NUM1NVx1NzkzQVx1MzAwMlxuICogXHU4OEFCIFBsYW5Db25maXJtTW9kYWwgLyBBZ2VudGljUGxhbk1vZGFsIFx1NTkwRFx1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFVuaXQobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXHU2MkVDXHU1M0Y3XHU0RTJEXHU3Njg0XHU1MzU1XHU0RjREXHVGRjFBXCIoXHU1MzQzXHU1MzYxKVwiIC8gXCJcdUZGMDhcdTVDMEZcdTY1RjZcdUZGMDlcIlxuICBjb25zdCBicmFja2V0ID0gbmFtZS5tYXRjaCgvW1x1RkYwOChdKFtcdTRFMDAtXHU5RkE1XSspWylcdUZGMDldLyk7XG4gIGlmIChicmFja2V0KSByZXR1cm4gYnJhY2tldFsxXTtcbiAgLy8gXHU5MDAwXHU1MzE2XHU1MzM5XHU5MTREXHVGRjFBXHU0RUU1XCJcdTY1NzBcIlx1N0VEM1x1NUMzRVx1RkYwOFx1NTk4MlwiXHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwXCJcdTIxOTJcIlx1OTg3NVwiXHVGRjA5XG4gIGNvbnN0IHN1ZmZpeCA9IG5hbWUubWF0Y2goL1x1NkJDRltcdTRFMDBcdTU5MjlcdTY1RTVcdTU0NjhcdTY3MDhdPyguKz8pXHU2NTcwLyk7XG4gIGlmIChzdWZmaXgpIHJldHVybiBzdWZmaXhbMV07XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gc3RyKHY6IHVua25vd24sIGZhbGxiYWNrID0gJycpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnID8gdiA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBudW0odjogdW5rbm93biwgZmFsbGJhY2sgPSAwKTogbnVtYmVyIHtcbiAgcmV0dXJuIHR5cGVvZiB2ID09PSAnbnVtYmVyJyAmJiAhTnVtYmVyLmlzTmFOKHYpID8gdiA6IGZhbGxiYWNrO1xufVxuXG4vKipcbiAqIFx1NkUwNVx1NkQxN1x1NkJDRlx1NjVFNVx1OTFDRlx1NEUzQVx1N0VBRlx1NjU3MFx1NUI1N1x1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1OTFDRlx1NTMxNlx1NjgzOFx1NUZDM1x1RkYwOVx1MzAwMlxuICogIC0gXCIzMFwiIC8gXCIyLjVcIiBcdTIxOTIgXHU1MzlGXHU2ODM3XG4gKiAgLSBcIjMwXHU1MjA2XHU5NDlGXCIgLyBcIjdcdTVDMEZcdTY1RjZcIiAvIFwiMjAwXHU1MzQzXHU1MzYxXCIgXHUyMTkyIFx1NTNENlx1NTI0RFx1N0YwMFx1NjU3MFx1NUI1NyBcIjMwXCIgLyBcIjdcIiAvIFwiMjAwXCJcbiAqICAtIFwiXHU3RUE2MzBcdTk4NzVcIiBcdTIxOTIgXHU1MjY1XHU3OUJCXHU5NzVFXHU2NTcwXHU1QjU3IFx1MjE5MiBcIjMwXCJcbiAqICAtIFwiXHU2QkNGXHU1OTI5XHU1NzVBXHU2MzAxXCIgLyBcIlwiIFx1MjE5MiBcIlwiXHVGRjA4XHU2NUUwXHU2Q0Q1XHU5MUNGXHU1MzE2XHVGRjA5XG4gKiBcdTc2RUVcdTc2ODRcdUZGMUFcdTc4NkVcdTRGRERcdTRFMEJcdTZFMzggcGFyc2VJbnQgXHU0RTBEXHU0RUE3XHU3NTFGIE5hTlx1RkYwQ1x1NEVDQVx1NjVFNVx1NEVGQlx1NTJBMVx1ODBGRFx1NkI2M1x1NUUzOFx1NzUxRlx1NjIxMFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5EYWlseU1pbihyYXc6IHVua25vd24pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHJhdyAhPT0gJ3N0cmluZycpIHJldHVybiAnJztcbiAgY29uc3QgdHJpbW1lZCA9IHJhdy50cmltKCk7XG4gIGlmICghdHJpbW1lZCkgcmV0dXJuICcnO1xuICBpZiAoL15cXGQrKFxcLlxcZCspPyQvLnRlc3QodHJpbW1lZCkpIHJldHVybiB0cmltbWVkO1xuICBjb25zdCBwcmVmaXggPSB0cmltbWVkLm1hdGNoKC9eKFxcZCsoPzpcXC5cXGQrKT8pLyk7XG4gIGlmIChwcmVmaXgpIHJldHVybiBwcmVmaXhbMV07XG4gIGNvbnN0IHN0cmlwcGVkID0gdHJpbW1lZC5yZXBsYWNlKC9bXjAtOS5dL2csICcnKTtcbiAgLy8gXHU1MjY1XHU3OUJCXHU1NDBFXHU1M0VGXHU4MEZEXHU2QjhCXHU3NTU5XHU1OTFBXHU0RjU5XHU1QzBGXHU2NTcwXHU3MEI5XHVGRjA4XHU1OTgyIFwiMy41LjJcIlx1RkYwOVx1RkYwQ1x1NEVDNVx1NTNENlx1OTk5Nlx1NEUyQVx1NTQwOFx1NkNENVx1NjU3MFx1NUI1N1xuICBjb25zdCB2YWxpZCA9IHN0cmlwcGVkLm1hdGNoKC9cXGQrKFxcLlxcZCspPy8pO1xuICByZXR1cm4gdmFsaWQgPyB2YWxpZFswXSA6ICcnO1xufVxuXG4vKiogXHU1MjI0XHU2NUFEXHU2QkNGXHU2NUU1XHU5MUNGXHU2NjJGXHU1NDI2XHU1REYyXHU5MUNGXHU1MzE2XHVGRjA4XHU3RUFGXHU2NTcwXHU1QjU3XHVGRjBDXHU5NzVFXHU3QTdBXHVGRjA5ICovXG5mdW5jdGlvbiBpc1F1YW50aWZpZWQodjogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIC9eXFxkKyhcXC5cXGQrKT8kLy50ZXN0KHYudHJpbSgpKTtcbn1cblxuLyoqIFx1NjgyMVx1OUE4Q1x1NUU3Nlx1ODg2NVx1OUY1MFx1NTM1NVx1NEUyQVx1NUI1MFx1OTg3OSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplU3ViSXRlbShyYXc6IHVua25vd24sIGlkeDogbnVtYmVyKTogR29hbFN1Ykl0ZW0ge1xuICBjb25zdCBpdCA9IChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcgPyByYXcgOiB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIHJldHVybiB7XG4gICAgbmFtZTogc3RyKGl0Lm5hbWUpIHx8IGBcdTVCNTBcdTk4Nzkke2lkeCArIDF9YCxcbiAgICBwZXJjZW50OiB0eXBlb2YgaXQucGVyY2VudCA9PT0gJ251bWJlcicgPyBpdC5wZXJjZW50IDogdW5kZWZpbmVkLFxuICAgIGRldGFpbDogc3RyKGl0LmRldGFpbCkgfHwgdW5kZWZpbmVkLFxuICAgIHN0YXJ0RGF0ZTogc3RyKGl0LnN0YXJ0RGF0ZSksXG4gICAgZW5kRGF0ZTogc3RyKGl0LmVuZERhdGUpLFxuICAgIHN0YXJ0VmFsdWU6IHN0cihpdC5zdGFydFZhbHVlKSxcbiAgICB0YXJnZXRWYWx1ZTogc3RyKGl0LnRhcmdldFZhbHVlKSxcbiAgICBjdXJyZW50VmFsdWU6IHN0cihpdC5jdXJyZW50VmFsdWUpLFxuICAgIGRhaWx5TWluOiBjbGVhbkRhaWx5TWluKGl0LmRhaWx5TWluKSxcbiAgICB0YXNrRGF5VHlwZTogc3RyKGl0LnRhc2tEYXlUeXBlKSB8fCBERUZBVUxUX1RBU0tfREFZX1RZUEUsXG4gICAgc291cmNlUmVmOiBzdHIoaXQuc291cmNlUmVmKSB8fCB1bmRlZmluZWQsXG4gIH07XG59XG5cbi8qKiBcdTY4MjFcdTlBOENcdTVFNzZcdTg4NjVcdTlGNTBcdTUzNTVcdTRFMkFcdTc2RUVcdTY4MDdcdUZGMDhcdTRFMjJcdTY3MkFcdTc3RTVcdTVCNTdcdTZCQjVcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUdvYWwocmF3OiB1bmtub3duKTogR29hbEl0ZW0ge1xuICBjb25zdCBnID0gKHJhdyAmJiB0eXBlb2YgcmF3ID09PSAnb2JqZWN0JyA/IHJhdyA6IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgY29uc3QgY2F0ZWdvcnlSYXcgPSBzdHIoZy5jYXRlZ29yeSk7XG4gIGNvbnN0IGNhdGVnb3J5OiBHb2FsQ2F0ZWdvcnkgfCBzdHJpbmcgPSBDQVRFR09SWV9TRVQuaGFzKGNhdGVnb3J5UmF3KSA/IGNhdGVnb3J5UmF3IDogJ290aGVyJztcblxuICBjb25zdCBpdGVtc1JhdyA9IEFycmF5LmlzQXJyYXkoZy5pdGVtcykgPyBnLml0ZW1zIDogW107XG4gIGNvbnN0IGl0ZW1zID0gaXRlbXNSYXcubWFwKChpdCwgaSkgPT4gc2FuaXRpemVTdWJJdGVtKGl0LCBpKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBpZDogc3RyKGcuaWQpIHx8IGBnb2FsXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YCxcbiAgICB0aXRsZTogc3RyKGcudGl0bGUpIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTc2RUVcdTY4MDcnLFxuICAgIC8vIEFJIFx1NUY1Mlx1N0VCM1x1NTIwNlx1Njc5MFx1RkYwOFx1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1RkYwOVx1RkYxQVx1NEZERFx1NzU1OVx1NzUyOFx1NjIzN1x1OEY5M1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODhBQlwiXHU0RTIyXHU2NzJBXHU3N0U1XHU1QjU3XHU2QkI1XCJcdTk3NTlcdTlFRDhcdTRFMjJcdTVGMDNcbiAgICBhbmFseXNpczogc3RyKGcuYW5hbHlzaXMpIHx8IHVuZGVmaW5lZCxcbiAgICAvLyBcdTRFMjVcdTY4M0NcdTc5ODFcdTZCNjIgQUkgXHU1MTk5XHU1MTY1IGljb24gXHU1QjU3XHU2QkI1XHVGRjA4aWNvbiBcdTRFQzVcdTRGOUJcdTYyNEJcdTUyQThcdTUyMUJcdTVFRkFcdTc2ODRcdTc2RUVcdTY4MDdcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBtZXRhOiBzdHIoZy5tZXRhKSB8fCB1bmRlZmluZWQsXG4gICAgY2F0ZWdvcnksXG4gICAgc3RhcnREYXRlOiBzdHIoZy5zdGFydERhdGUpLFxuICAgIGVuZERhdGU6IHN0cihnLmVuZERhdGUpLFxuICAgIHByb2dyZXNzOiBudW0oZy5wcm9ncmVzcywgMCksXG4gICAgcHJpb3JpdHk6IHR5cGVvZiBnLnByaW9yaXR5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZy5wcmlvcml0eSA9PT0gJ251bWJlcicgPyBnLnByaW9yaXR5IDogdW5kZWZpbmVkLFxuICAgIGl0ZW1zLFxuICAgIHNvdXJjZVJlZjogc3RyKGcuc291cmNlUmVmKSB8fCB1bmRlZmluZWQsXG4gIH07XG59XG5cbi8qKiBcdTY1NzBcdTdFQzRcdTVCODhcdTUzNkIgKyBcdTkwMTBcdTY3NjEgc2FuaXRpemUgKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUdvYWxzKHJhdzogdW5rbm93bik6IEdvYWxJdGVtW10ge1xuICBpZiAoIUFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIFtdO1xuICByZXR1cm4gcmF3Lm1hcCgoZykgPT4gc2FuaXRpemVHb2FsKGcpKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0ZW5lc3NSZXN1bHQge1xuICBsZXZlbDogJ2NvbXBsZXRlJyB8ICd0aGluJztcbiAgLyoqIFx1N0YzQVx1NTkzMVx1N0VGNFx1NUVBNlx1NzY4NFx1NEVCQVx1N0M3Qlx1NTNFRlx1OEJGQlx1NjgwN1x1N0I3RVx1RkYxQSdcdTZCQ0ZcdTY1RTVcdTkxQ0YnIC8gJ1x1NjIyQVx1NkI2Mlx1NjVFNScgLyAnXHU1MjA2XHU3QzdCJyAvICdcdTgyODJcdTU5NEYnICovXG4gIG1pc3Npbmc6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFx1NTIyNFx1NUI5QVx1NzZFRVx1NjgwN1x1NEZFMVx1NjA2Rlx1NUI4Q1x1NjU3NFx1NUVBNlx1MzAwMlxuICpcbiAqIFx1NEVBN1x1NTRDMVx1NTRGMlx1NUI2Nlx1RkYxQVx1NzZFRVx1NjgwN1x1NUZDNVx1OTg3Qlx1MzAwQ1x1OTFDRlx1NTMxNlx1MzAwRFx1RkYwQ1x1OTg5N1x1N0M5Mlx1NUVBNlx1NEUzQVx1MzAwQ1x1NjVFNVx1MzAwRFx1MzAwMlx1NTZFMFx1NkI2NFx1NkJDRlx1NjVFNVx1OTFDRlx1NzY4NFx1NTIyNFx1NjM2RVx1NjYyRlxuICogKipcdTYyNDBcdTY3MDlcdTVCNTBcdTk4NzlcdTkwRkRcdTVGQzVcdTk4N0JcdTY3MDlcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW4qKlx1RkYwOFx1ODAwQ1x1OTc1RVwiXHU4MUYzXHU1QzExXHU0RTAwXHU0RTJBXCJcdUZGMDlcdUZGMENcdTU0MjZcdTUyMTlcdThCRTVcdTVCNTBcdTk4NzlcbiAqIFx1NjVFMFx1NkNENVx1NzUxRlx1NjIxMFx1NEVDQVx1NjVFNVx1NEVGQlx1NTJBMVx1RkYwQ1x1ODlDNFx1NTIxMlx1NTM3M1x1NTkzMVx1NTNCQlx1NjgzOFx1NUZDM1x1NEVGN1x1NTAzQ1x1MzAwMlxuICpcbiAqIFx1N0YzQVx1NTkzMVx1N0VGNFx1NUVBNlx1RkYxQVxuICogIC0gXHU2QkNGXHU2NUU1XHU5MUNGXHVGRjFBXHU1QjU4XHU1NzI4XHU2NzJBXHU5MUNGXHU1MzE2XHVGRjA4XHU5NzVFXHU3RUFGXHU2NTcwXHU1QjU3XHVGRjA5XHU1QjUwXHU5ODc5IFx1MjE5MiBgXHU2QkNGXHU2NUU1XHU5MUNGXHVGRjA4TiBcdTRFMkFcdTVCNTBcdTk4NzlcdTY3MkFcdTkxQ0ZcdTUzMTZcdUZGMDlgXG4gKiAgLSBcdTYyMkFcdTZCNjJcdTY1RTVcdUZGMUFlbmREYXRlIFx1N0E3QVxuICogIC0gXHU1MjA2XHU3QzdCXHVGRjFBY2F0ZWdvcnkgXHU3QTdBXG4gKiAgLSBcdTgyODJcdTU5NEZcdUZGMUFcdTVCNThcdTU3MjggdGFza0RheVR5cGUgXHU3QTdBXHU3Njg0XHU1QjUwXHU5ODc5XG4gKiBcdTRFRkJcdTRFMDBcdTdGM0FcdTU5MzFcdTUzNzMgdGhpblx1RkYwOFx1OTcwMFx1NTcyOFx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5N1x1ODg2NVx1NTE2OFx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlDb21wbGV0ZW5lc3MoZ29hbDogR29hbEl0ZW0pOiBDb21wbGV0ZW5lc3NSZXN1bHQge1xuICBjb25zdCBtaXNzaW5nOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGlmICghZ29hbC5jYXRlZ29yeSkgbWlzc2luZy5wdXNoKCdcdTUyMDZcdTdDN0InKTtcblxuICBpZiAoIWdvYWwuZW5kRGF0ZSB8fCBnb2FsLmVuZERhdGUudHJpbSgpID09PSAnJykgbWlzc2luZy5wdXNoKCdcdTYyMkFcdTZCNjJcdTY1RTUnKTtcblxuICBjb25zdCBpdGVtcyA9IGdvYWwuaXRlbXMgPz8gW107XG4gIGlmIChpdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgdW5xdWFudGlmaWVkID0gaXRlbXMuZmlsdGVyKChpdCkgPT4gIWlzUXVhbnRpZmllZChpdC5kYWlseU1pbikpLmxlbmd0aDtcbiAgICBpZiAodW5xdWFudGlmaWVkID4gMCkgbWlzc2luZy5wdXNoKGBcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdUZGMDgke3VucXVhbnRpZmllZH0gXHU0RTJBXHU1QjUwXHU5ODc5XHU2NzJBXHU5MUNGXHU1MzE2XHVGRjA5YCk7XG5cbiAgICBjb25zdCBoYXNSaHl0aG0gPSBpdGVtcy5ldmVyeSgoaXQpID0+IGl0LnRhc2tEYXlUeXBlICYmIFN0cmluZyhpdC50YXNrRGF5VHlwZSkudHJpbSgpICE9PSAnJyk7XG4gICAgaWYgKCFoYXNSaHl0aG0pIG1pc3NpbmcucHVzaCgnXHU4MjgyXHU1OTRGJyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGxldmVsOiBtaXNzaW5nLmxlbmd0aCA+IDAgPyAndGhpbicgOiAnY29tcGxldGUnLFxuICAgIG1pc3NpbmcsXG4gIH07XG59XG4iLCAiLyoqXG4gKiBcdTc4NkVcdTVCOUFcdTYwMjdcdTc2RUVcdTY4MDcgSUQgXHU2RDNFXHU3NTFGXHVGRjA4XHU3RUFGXHU1MUZEXHU2NTcwXHUzMDAxXHU5NkY2XHU0RjlEXHU4RDU2XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHVGRjA5XHUzMDAyXG4gKlxuICogXHU3NTI4XHU3QTMzXHU1QjlBXHU1NEM4XHU1RTBDXHVGRjA4Rk5WLTFhIDMyIFx1NEY0RFx1RkYwOVx1NEVDRSBzZWVkIFx1NzUxRlx1NjIxMCBpZFx1MzAwMlxuICogXHU3NkVFXHU3Njg0XHVGRjFBXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwICsgXHU1NDBDXHU0RTAwXHU2ODA3XHU5ODk4XHU5MUNEXHU2NUIwXHU4OUM0XHU1MjEyXHU2NUY2XHVGRjBDSUQgXHU3QTMzXHU1QjlBXHU0RTBEXHU1M0Q4XHVGRjFCd3JpdGVBaUdvYWxzIFx1NjMwOSBpZCBcdTU0MDhcdTVFNzZcdTUzNzNcdTIwMUNcdTUzOUZcdTU3MzBcdTY2RjRcdTY1QjBcdTIwMURcbiAqIFx1ODAwQ1x1OTc1RVx1MjAxQ1x1OEZGRFx1NTJBMFx1OTFDRFx1NTkwRFx1MjAxRFx1RkYwQ1x1NjgzOVx1NkNCQlx1MzAwQ1x1OTFDRFx1NTkwRFx1ODlDNFx1NTIxMiBcdTIxOTIgXHU3NkVFXHU2ODA3XHU4RDhBXHU3OUVGXHU4RDhBXHU1OTFBXHUzMDBEXHUzMDAyXG4gKi9cblxuLyoqIEZOVi0xYSAzMiBcdTRGNERcdTU0QzhcdTVFMENcdUZGMENcdThGRDRcdTU2REVcdTY1RTBcdTdCMjZcdTUzRjcgMTYgXHU4RkRCXHU1MjM2XHU3N0VEXHU0RTMyICovXG5mdW5jdGlvbiBmbnYxYShzZWVkOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaCA9IDB4ODExYzlkYzU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VlZC5sZW5ndGg7IGkrKykge1xuICAgIGggXj0gc2VlZC5jaGFyQ29kZUF0KGkpO1xuICAgIGggPSBNYXRoLmltdWwoaCwgMHgwMTAwMDE5Myk7XG4gIH1cbiAgcmV0dXJuIChoID4+PiAwKS50b1N0cmluZygzNik7XG59XG5cbi8qKlxuICogXHU0RUNFIHNlZWRcdUZGMDhcdTVFRkFcdThCQUUgYGZpbGUucGF0aCArICd8JyArIHRpdGxlYFx1RkYwOVx1NkQzRVx1NzUxRlx1N0EzM1x1NUI5QVx1NzY4NFx1NzZFRVx1NjgwNyBpZFx1MzAwMlxuICogXHU3NkY4XHU1NDBDIHNlZWQgXHU1RkM1XHU1Rjk3XHU3NkY4XHU1NDBDIGlkXHVGRjFCXHU0RTBEXHU1NDBDIHNlZWQgXHU2NzgxXHU1QzBGXHU2OTgyXHU3Mzg3XHU3OEIwXHU2NDlFXHVGRjA4MzIgXHU0RjREXHU1NEM4XHU1RTBDXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXJpdmVTdGFibGVHb2FsSWQoc2VlZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBnb2FsXyR7Zm52MWEoc2VlZCl9YDtcbn1cbiIsICIvKipcbiAqIEFJIFx1ODlDNFx1NTIxMlx1NUU0Mlx1N0I0OVx1NTIyNFx1NUI5QVx1RkYwOFx1N0VBRlx1NTFGRFx1NjU3MFx1MzAwMVx1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1RkYwOVx1MzAwMlxuICpcbiAqIFx1NTQwQ1x1NEUwMFx1N0IxNFx1OEJCMCArIFx1NzZGOFx1NTQwQ1x1NTE4NVx1NUJCOVx1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1RkYwQ1x1NEUxNFx1NEVDNVx1NUY1M1x1OTBBM1x1NEU5Qlx1NzZFRVx1NjgwN1x1MzAwQ1x1NEVDRFx1NTE2OFx1OTBFOFx1NUI1OFx1NTcyOFx1NEU4RVx1NzZFRVx1NjgwN1x1NUU5M1x1MzAwRFx1NjVGNlx1NjI0RFx1NTNFRlx1OERGM1x1OEZDN1x1RkYxQlxuICogXHU1M0VBXHU4OTgxXHU2NzA5XHU0RTAwXHU0RTJBXHU3NkVFXHU2ODA3XHU1REYyXHU0RTIyXHU1OTMxXHVGRjA4XHU4OEFCXHU2RTA1L1x1ODhBQlx1NTIyMFx1RkYwOVx1RkYwQ1x1NUMzMVx1NTE0MVx1OEJCOFx1OTFDRFx1NjVCMFx1NTE5OVx1NTE2NVx1NEVFNVx1NjA2Mlx1NTkwRFx1MjAxNFx1MjAxNFxuICogXHU1NDI2XHU1MjE5XHUyMDFDXHU1REYyXHU4OUM0XHU1MjEyXHU4RkM3XHUyMDFEXHU0RjFBXHU2QzM4XHU0RTQ1XHU5NjNCXHU1ODVFXHU2MDYyXHU1OTBEXHVGRjBDXHU4ODY4XHU3M0IwXHU0RTNBXHUzMDBDXHU1MTk5XHU1MTY1XHU0RTg2XHU0RjQ2XHU0RTBEXHU2NjNFXHU3OTNBL1x1NEUyMlx1NTkzMVx1MzAwRFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkU2tpcFBsYW5uZWQoXG4gIHBsYW5uZWRJZHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuICBleGlzdGluZ0lkczogU2V0PHN0cmluZz5cbik6IGJvb2xlYW4ge1xuICBpZiAoIXBsYW5uZWRJZHMgfHwgcGxhbm5lZElkcy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHBsYW5uZWRJZHMuZXZlcnkoKGlkKSA9PiBleGlzdGluZ0lkcy5oYXMoaWQpKTtcbn1cbiIsICIvKipcbiAqIEFnZW50aWNQbGFuTW9kYWwgXHUyMDE0IFx1NUJGOVx1OEJERFx1NUYwRlx1ODlDNFx1NTIxMlx1NUJBMVx1OTYwNVx1NTNGMFx1RkYwOFBoYXNlIDRcdUZGMDlcbiAqXG4gKiBcdTU3MjggUGhhc2UzIFBsYW5Db25maXJtTW9kYWwgXHU3Njg0XHU2ODExXHU3MkI2XHU1QkExXHU5NjA1XHU1N0ZBXHU3ODQwXHU0RTBBXHVGRjBDXHU1M0YzXHU0RkE3XHU1MkEwXHU0RTAwXHU0RTJBXHU1QkY5XHU4QkREXHU1MzNBXHVGRjFBXG4gKiAgLSBcdTVERTZcdUZGMUFcdTUzRUZcdTdGMTZcdThGOTFcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMDhcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMDlcdUZGMENBSSBcdTZCQ0ZcdThGNkVcdThGRDRcdTU2REVcdTUxNjhcdTkxQ0YgZ29hbHMgXHU1NDBFXHU1QjlFXHU2NUY2XHU1MjM3XHU2NUIwICsgZGlmZiBcdTlBRDhcdTRFQUVcdUZGMUJcbiAqICAtIFx1NTNGM1x1RkYxQVx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NUJGOVx1OEJERFx1RkYwQ1x1NzUyOFx1NjIzN1x1OEJGNFwiXHU1M0JCXHU2Mzg5WCAvIFx1NTJBMFkgLyBcdTYyOEFaXHU2NTM5XHU2MjEwXHU0RTAwXHU0RTA5XHU0RTk0XCJcdUZGMENBSSBcdTYyNTNcdTc4RThcdTg5QzRcdTUyMTJcdUZGMUJcbiAqICAtIFx1NjI0Qlx1NTJBOFx1N0YxNlx1OEY5MVx1NzZGNFx1NjNBNVx1NEY1Q1x1NzUyOFx1NTIzMFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwQ1x1NUU3Nlx1OTAxQVx1OEZDNyBzZXNzaW9uLmFwcGx5TG9jYWxFZGl0IFx1NTE5OVx1NTE2NVx1NUJGOVx1OEJERFx1NTM4Nlx1NTNGMlx1RkYwQ1xuICogICAgXHU5NjMyXHU2QjYyIEFJIFx1NEUwQlx1OEY2RVx1NjI4QVx1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1NjUzOVx1NTJBOFx1ODk4Nlx1NzZENlx1NTZERVx1NTNCQlx1RkYxQlxuICogIC0gXHU5ODc2XHU5MEU4XHUzMDBDXHU5MUNEXHU3RjZFXHU1MjFEXHU3MjQ4XHUzMDBEXHU1NkRFXHU1MjMwIEFJIFx1OTk5Nlx1NzI0OFx1RkYxQlx1NUU5NVx1OTBFOFx1MzAwQ1x1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1MzAwRFx1Nzg2RVx1OEJBNFx1ODQzRFx1NUU5M1x1MzAwMlxuICpcbiAqIFx1NjMwMVx1NjcwOSBQbGFubmluZ1Nlc3Npb25cdUZGMDhcdTdFQUZcdTkwM0JcdThGOTFcdTMwMDFcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjA5XHVGRjBDXHU4MUVBXHU4RUFCXHU1M0VBXHU4RDFGXHU4RDIzIFVJIFx1N0YxNlx1NjM5Mlx1MzAwMlxuICovXG5cbmltcG9ydCB7IE1vZGFsLCBBcHAsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIEdPQUxfQ0FURUdPUklFUyxcbiAgdHlwZSBHb2FsSXRlbSxcbiAgdHlwZSBHb2FsU3ViSXRlbSxcbiAgdHlwZSBHb2FsQ2F0ZWdvcnksXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHsgY2xhc3NpZnlDb21wbGV0ZW5lc3MsIGV4dHJhY3RVbml0IH0gZnJvbSAnLi9Hb2FsQ2FyZFZhbGlkYXRvcic7XG5pbXBvcnQgeyBQbGFubmluZ1Nlc3Npb24gfSBmcm9tICcuL1BsYW5uaW5nU2Vzc2lvbic7XG5pbXBvcnQgdHlwZSB7IFBsYW5uZXJTZXR0aW5ncyB9IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcblxuaW50ZXJmYWNlIEl0ZW1FbnRyeSB7XG4gIGl0ZW06IEdvYWxTdWJJdGVtO1xuICBrZWVwOiBib29sZWFuO1xufVxuaW50ZXJmYWNlIEdvYWxFbnRyeSB7XG4gIGdvYWw6IEdvYWxJdGVtO1xuICBpdGVtczogSXRlbUVudHJ5W107XG4gIGtlZXA6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRpY1BsYW5PcHRpb25zIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBzY29wZTogJ25vdGUnIHwgJ3NlbGVjdGlvbic7XG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3M7XG4gIHN1YnRpdGxlPzogc3RyaW5nO1xuICBvbkNvbmZpcm06IChnb2FsczogR29hbEl0ZW1bXSkgPT4gdm9pZDtcbiAgLyoqIFx1NjNEMFx1NEY5Qlx1NjVGNlx1RkYxQVx1NEVFNVx1MzAwQ1x1N0YxNlx1OEY5MVx1NzNCMFx1NjcwOVx1NjgxMVx1MzAwRFx1NkEyMVx1NUYwRlx1NjI1M1x1NUYwMFx1RkYwOFx1OEQ3MCBzZXNzaW9uLmxvYWRHb2FscyBcdTgwMENcdTk3NUUgaW5pdFx1RkYwOSAqL1xuICBnb2Fscz86IEdvYWxJdGVtW107XG4gIC8qKiBcdThGN0RcdTUxNjVcdTU0MEVcdTgxRUFcdTUyQThcdTRGNUNcdTRFM0FcdTYzMDdcdTRFRTRcdTUzRDFcdTkwMDFcdTdFRDkgQUlcdUZGMDhcdTc1MjhcdTRFOEVcdTMwMENcdTVFOTRcdTc1MjhcdThCQ0FcdTY1QURcdTVFRkFcdThCQUVcdTMwMERcdTk4ODRcdTU4NkJcdUZGMDkgKi9cbiAgaW5pdGlhbEluc3RydWN0aW9uPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQWdlbnRpY1BsYW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBzZXNzaW9uOiBQbGFubmluZ1Nlc3Npb247XG4gIHByaXZhdGUgZW50cmllczogR29hbEVudHJ5W10gPSBbXTtcbiAgcHJpdmF0ZSBzdWJ0aXRsZT86IHN0cmluZztcbiAgcHJpdmF0ZSBvbkNvbmZpcm06IChnb2FsczogR29hbEl0ZW1bXSkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvcHRzOiBBZ2VudGljUGxhbk9wdGlvbnM7XG5cbiAgcHJpdmF0ZSBsaXN0RWw/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBjaGF0TG9nRWw/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBpbnB1dEVsPzogSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgcHJpdmF0ZSBzZW5kQnRuPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHByaXZhdGUgZm9vdGVyQ291bnQ/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBjaGF0TG9nOiBBcnJheTx7IHJvbGU6ICd1c2VyJyB8ICdhc3Npc3RhbnQnOyB0ZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgcHJpdmF0ZSBwcmV2R29hbFRpdGxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIHByZXZJdGVtS2V5cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBvcHRzOiBBZ2VudGljUGxhbk9wdGlvbnMpIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMuc3VidGl0bGUgPSBvcHRzLnN1YnRpdGxlO1xuICAgIHRoaXMub25Db25maXJtID0gb3B0cy5vbkNvbmZpcm07XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnNlc3Npb24gPSBuZXcgUGxhbm5pbmdTZXNzaW9uKG9wdHMuY29udGVudCwgb3B0cy5zZXR0aW5ncywgdW5kZWZpbmVkLCBvcHRzLnNjb3BlKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoJ2JhbWJvby1haS1wbGFuLW1vZGFsJywgJ2JhbWJvby1haS1hZ2VudGljJyk7XG5cbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQUkgXHU4OUM0XHU1MjEyXHU1MkE5XHU2MjRCIFx1MDBCNyBcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTVCQTFcdTk2MDUnIH0pO1xuXG4gICAgLy8gXHU5ODc2XHU5MEU4XHU2NENEXHU0RjVDXHVGRjFBXHU5MUNEXHU3RjZFXHU1MjFEXHU3MjQ4XG4gICAgY29uc3QgdG9wQmFyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1hZ2VudGljLXRvcGJhcicgfSk7XG4gICAgaWYgKHRoaXMuc3VidGl0bGUpIHtcbiAgICAgIHRvcEJhci5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogdGhpcy5zdWJ0aXRsZSwgY2xzOiAnYmFtYm9vLWFpLXBsYW4tc3VidGl0bGUnIH0pO1xuICAgIH1cbiAgICBjb25zdCByZXNldEJ0biA9IHRvcEJhci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1MjFCQSBcdTkxQ0RcdTdGNkVcdTUyMURcdTcyNDgnLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYnRuIGJhbWJvby1haS1wbGFuLWJ0bi1naG9zdCcsXG4gICAgfSk7XG4gICAgcmVzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9uUmVzZXQoKSk7XG5cbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnXHU1REU2XHU0RkE3XHU2ODM4XHU1QkY5L1x1N0YxNlx1OEY5MVx1NzZFRVx1NjgwN1x1RkYwQ1x1NTNGM1x1NEZBN1x1NzUyOFx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1OEJBOSBBSSBcdTU4OUVcdTUyMjBcdTY1MzlcdUZGMDhcdTU5ODJcIlx1NTNCQlx1NjM4OVx1OEREMVx1NkI2NVwiXCJcdTUyQTBcdTZCQ0ZcdTU0NjhcdTZFMzhcdTZDRjMzXHU2QjIxXCJcdUZGMDlcdTMwMDJcdTc4NkVcdThCQTRcdTU0MEVcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTNcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGVzYycsXG4gICAgfSk7XG5cbiAgICAvLyBcdTRFM0JcdTRGNTNcdUZGMUFcdTVERTZcdTY4MTEgKyBcdTUzRjNcdTVCRjlcdThCRERcbiAgICBjb25zdCBib2R5ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1hZ2VudGljLWJvZHknIH0pO1xuXG4gICAgY29uc3QgbGVmdCA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLWFnZW50aWMtbGVmdCcgfSk7XG4gICAgdGhpcy5saXN0RWwgPSBsZWZ0LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWxpc3QnIH0pO1xuXG4gICAgY29uc3QgcmlnaHQgPSBib2R5LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1hZ2VudGljLXJpZ2h0JyB9KTtcbiAgICB0aGlzLmNoYXRMb2dFbCA9IHJpZ2h0LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1jaGF0JyB9KTtcbiAgICBjb25zdCBjb21wb3NlciA9IHJpZ2h0LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1jaGF0LWNvbXBvc2VyJyB9KTtcbiAgICB0aGlzLmlucHV0RWwgPSBjb21wb3Nlci5jcmVhdGVFbCgndGV4dGFyZWEnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktY2hhdC1pbnB1dCcsXG4gICAgICBhdHRyOiB7IHBsYWNlaG9sZGVyOiAnXHU4QkY0XHU3MEI5XHU0RUMwXHU0RTQ4XHVGRjBDXHU1OTgyXCJcdTYyOEFcdThERDFcdTZCNjVcdTUzQkJcdTYzODlcdUZGMENcdTYzNjJcdTYyMTBcdTZFMzhcdTZDRjNcIlx1MjAyNicsIHJvd3M6ICcyJyB9LFxuICAgIH0pO1xuICAgIHRoaXMuc2VuZEJ0biA9IGNvbXBvc2VyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHU1M0QxXHU5MDAxJyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWJ0biBiYW1ib28tYWktcGxhbi1idG4tcHJpbWFyeScsXG4gICAgfSk7XG4gICAgdGhpcy5zZW5kQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdm9pZCB0aGlzLm9uU2VuZCgpKTtcbiAgICB0aGlzLmlucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkpKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdm9pZCB0aGlzLm9uU2VuZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gXHU1RTk1XHU5MEU4XG4gICAgY29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWZvb3RlcicgfSk7XG4gICAgZm9vdGVyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHU1M0Q2XHU2RDg4JyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWJ0biBiYW1ib28tYWktcGxhbi1idG4tZ2hvc3QnLFxuICAgIH0pLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jbG9zZSgpKTtcbiAgICBjb25zdCB3cml0ZUJ0biA9IGZvb3Rlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1NTE5OVx1NTE2NVx1NzZFRVx1NjgwNycsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1idG4gYmFtYm9vLWFpLXBsYW4tYnRuLXByaW1hcnknLFxuICAgIH0pO1xuICAgIHdyaXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jb25maXJtKCkpO1xuICAgIHRoaXMuZm9vdGVyQ291bnQgPSB3cml0ZUJ0bjtcblxuICAgIC8vIFx1NUYwMlx1NkI2NVx1NjJDOVx1OTk5Nlx1NzI0OFxuICAgIHZvaWQgdGhpcy5pbml0UGxhbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0UGxhbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTdGMTZcdThGOTFcdTczQjBcdTY3MDlcdTY4MTFcdTZBMjFcdTVGMEZcdUZGMUFcdThGN0RcdTUxNjVcdTc3MUZcdTVCOUVcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMENcdTRFMERcdThDMDMgQUkgXHU2MkM2XHU4OUUzXG4gICAgaWYgKHRoaXMub3B0cy5nb2Fscykge1xuICAgICAgdGhpcy5zZXNzaW9uLmxvYWRHb2Fscyh0aGlzLm9wdHMuZ29hbHMpO1xuICAgICAgdGhpcy5jaGF0TG9nID0gW3sgcm9sZTogJ2Fzc2lzdGFudCcsIHRleHQ6ICdcdTVERjJcdThGN0RcdTUxNjVcdTRGNjBcdTc2ODRcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTdGMTZcdThGOTFcdTYyMTZcdThCQTlcdTYyMTFcdThDMDNcdTY1NzRcdTMwMDInIH1dO1xuICAgICAgdGhpcy5yZWJ1aWxkVHJlZShmYWxzZSk7XG4gICAgICB0aGlzLnJlbmRlckNoYXQoKTtcbiAgICAgIGlmICh0aGlzLm9wdHMuaW5pdGlhbEluc3RydWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gdGhpcy5vcHRzLmluaXRpYWxJbnN0cnVjdGlvbjtcbiAgICAgICAgdGhpcy5wdXNoQ2hhdCgndXNlcicsIGluc3RydWN0aW9uKTtcbiAgICAgICAgdGhpcy5zZXRTZW5kaW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgcmVwbHkgfSA9IGF3YWl0IHRoaXMuc2Vzc2lvbi5zZW5kKGluc3RydWN0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlYnVpbGRUcmVlKHRydWUpO1xuICAgICAgICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsIHJlcGx5IHx8ICdcdTVERjJcdTVFOTRcdTc1MjhcdTVFRkFcdThCQUVcdTMwMDInKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgJ1x1MjZBMCBcdTVFOTRcdTc1MjhcdTVFRkFcdThCQUVcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTYyNEJcdTUyQThcdThDMDNcdTY1NzRcdTMwMDInKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0aGlzLnNldFNlbmRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgJ1x1MjNGMyBBSSBcdTg5QzRcdTUyMTJcdTRFMkRcdTIwMjZcdUZGMDhcdTZCNjNcdTU3MjhcdTYyQzZcdTg5RTNcdTc2RUVcdTY4MDdcdUZGMDknKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZ29hbHMgPSBhd2FpdCB0aGlzLnNlc3Npb24uaW5pdCgpO1xuICAgICAgaWYgKGdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICdBSSBcdTY3MkFcdTRFQ0VcdTdCMTRcdThCQjBcdTRFMkRcdThCQzZcdTUyMkJcdTUxRkFcdTY2MEVcdTc4NkVcdTc2RUVcdTY4MDdcdTMwMDJcXG5cdThCRDVcdThCRDVcdThGRDlcdTY4MzdcdTc2ODRcdTUzRTVcdTVGMEZcdUZGMUFcdTMwMENcdTYyMTFcdTYwRjNcdTU3MjggMyBcdTRFMkFcdTY3MDhcdTUxODVcdTUxQ0ZcdTkxQ0QgNWtnXHVGRjBDXHU2QkNGXHU1OTI5XHU4REQxXHU2QjY1IDMwIFx1NTIwNlx1OTQ5Rlx1MzAwMVx1NjNBN1x1NTIzNlx1OTk2RVx1OThERlx1MzAwRFx1MzAwMidcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmNoYXRMb2cgPSBbeyByb2xlOiAnYXNzaXN0YW50JywgdGV4dDogYFx1NURGMlx1NEVDRVx1N0IxNFx1OEJCMFx1OEJDNlx1NTIyQlx1NTFGQSAke2dvYWxzLmxlbmd0aH0gXHU0RTJBXHU3NkVFXHU2ODA3XHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU3RjE2XHU4RjkxXHU2MjE2XHU4QkE5XHU2MjExXHU4QzAzXHU2NTc0XHUzMDAyYCB9XTtcbiAgICAgIHRoaXMucmVidWlsZFRyZWUoZmFsc2UpO1xuICAgICAgdGhpcy5yZW5kZXJDaGF0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbmV3IE5vdGljZShlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnQUkgXHU4OUM0XHU1MjEyXHU1OTMxXHU4RDI1Jyk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBvblNlbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0RWw7XG4gICAgY29uc3QgdGV4dCA9IGlucHV0Py52YWx1ZS50cmltKCk7XG4gICAgaWYgKCF0ZXh0IHx8ICF0aGlzLnNlbmRCdG4gfHwgIWlucHV0KSByZXR1cm47XG4gICAgaW5wdXQudmFsdWUgPSAnJztcbiAgICB0aGlzLnB1c2hDaGF0KCd1c2VyJywgdGV4dCk7XG4gICAgdGhpcy5zZXRTZW5kaW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlcGx5LCBnb2FscyB9ID0gYXdhaXQgdGhpcy5zZXNzaW9uLnNlbmQodGV4dCk7XG4gICAgICB0aGlzLnJlYnVpbGRUcmVlKHRydWUpO1xuICAgICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgcmVwbHkgfHwgJ1x1NURGMlx1NjZGNFx1NjVCMFx1ODlDNFx1NTIxMlx1MzAwMicpO1xuICAgICAgdm9pZCBnb2FscztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsICdcdTI2QTAgXHU2Q0ExXHU1NDJDXHU2MUMyXHVGRjBDXHU2MzYyXHU0RTJBXHU4QkY0XHU2Q0Q1XHU4QkQ1XHU4QkQ1XHVGRjA4XHU1RjUzXHU1MjREXHU4OUM0XHU1MjEyXHU2NzJBXHU2NTM5XHU1MkE4XHVGRjA5XHUzMDAyJyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuc2V0U2VuZGluZyhmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuc2Vzc2lvbi5yZXNldCgpO1xuICAgIHRoaXMucmVidWlsZFRyZWUoZmFsc2UpO1xuICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsICdcdTIxQkEgXHU1REYyXHU5MUNEXHU3RjZFXHU0RTNBIEFJIFx1NTIxRFx1NzI0OFx1MzAwMicpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRTZW5kaW5nKG9uOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2VuZEJ0bikgdGhpcy5zZW5kQnRuLmRpc2FibGVkID0gb247XG4gICAgaWYgKHRoaXMuaW5wdXRFbCkgdGhpcy5pbnB1dEVsLmRpc2FibGVkID0gb247XG4gIH1cblxuICBwcml2YXRlIHB1c2hDaGF0KHJvbGU6ICd1c2VyJyB8ICdhc3Npc3RhbnQnLCB0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNoYXRMb2cucHVzaCh7IHJvbGUsIHRleHQgfSk7XG4gICAgdGhpcy5yZW5kZXJDaGF0KCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckNoYXQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNoYXRMb2dFbCkgcmV0dXJuO1xuICAgIHRoaXMuY2hhdExvZ0VsLmVtcHR5KCk7XG4gICAgZm9yIChjb25zdCBtIG9mIHRoaXMuY2hhdExvZykge1xuICAgICAgY29uc3QgYnViYmxlID0gdGhpcy5jaGF0TG9nRWwuY3JlYXRlRGl2KHtcbiAgICAgICAgY2xzOiBgYmFtYm9vLWFpLWNoYXQtYnViYmxlIGJhbWJvby1haS1jaGF0LSR7bS5yb2xlfWAsXG4gICAgICB9KTtcbiAgICAgIGJ1YmJsZS5zZXRUZXh0KG0udGV4dCk7XG4gICAgICB0aGlzLmNoYXRMb2dFbC5zY3JvbGxUb3AgPSB0aGlzLmNoYXRMb2dFbC5zY3JvbGxIZWlnaHQ7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NEY5RFx1NjM2RSBzZXNzaW9uLmdvYWxzIFx1OTFDRFx1NUVGQVx1NURFNlx1NjgxMVx1RkYxQmhpZ2hsaWdodD10cnVlIFx1NjVGNlx1NUJGOVx1NjVCMFx1NTFGQVx1NzNCMFx1NzY4NFx1NzZFRVx1NjgwNy9cdTVCNTBcdTk4NzlcdTYyNTNcdTlBRDhcdTRFQUUgKi9cbiAgcHJpdmF0ZSByZWJ1aWxkVHJlZShoaWdobGlnaHQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMubGlzdEVsKSByZXR1cm47XG4gICAgY29uc3QgcHJldkdvYWxzID0gdGhpcy5wcmV2R29hbFRpdGxlcztcbiAgICBjb25zdCBwcmV2SXRlbXMgPSB0aGlzLnByZXZJdGVtS2V5cztcblxuICAgIHRoaXMuZW50cmllcyA9IHRoaXMuc2Vzc2lvbi5nb2Fscy5tYXAoKGdvYWwpID0+ICh7XG4gICAgICBnb2FsLFxuICAgICAga2VlcDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiAoZ29hbC5pdGVtcyA/PyBbXSkubWFwKChpdGVtKSA9PiAoeyBpdGVtLCBrZWVwOiB0cnVlIH0pKSxcbiAgICB9KSk7XG5cbiAgICBjb25zdCBsaXN0ID0gdGhpcy5saXN0RWw7XG4gICAgbGlzdC5lbXB0eSgpO1xuICAgIHRoaXMuZW50cmllcy5mb3JFYWNoKChlbnRyeSwgZ2kpID0+IHtcbiAgICAgIGNvbnN0IGlzTmV3R29hbCA9IGhpZ2hsaWdodCAmJiAhcHJldkdvYWxzLmhhcyhlbnRyeS5nb2FsLnRpdGxlKTtcbiAgICAgIHRoaXMucmVuZGVyR29hbChsaXN0LCBlbnRyeSwgZ2ksIGlzTmV3R29hbCwgaGlnaGxpZ2h0LCBwcmV2SXRlbXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wcmV2R29hbFRpdGxlcyA9IG5ldyBTZXQodGhpcy5zZXNzaW9uLmdvYWxzLm1hcCgoZykgPT4gZy50aXRsZSkpO1xuICAgIHRoaXMucHJldkl0ZW1LZXlzID0gbmV3IFNldChcbiAgICAgIHRoaXMuc2Vzc2lvbi5nb2Fscy5mbGF0TWFwKChnKSA9PiAoZy5pdGVtcyA/PyBbXSkubWFwKChpdCkgPT4gYCR7Zy50aXRsZX06OiR7aXQubmFtZX1gKSlcbiAgICApO1xuICAgIHRoaXMudXBkYXRlRm9vdGVyKCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckdvYWwoXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBlbnRyeTogR29hbEVudHJ5LFxuICAgIGdpOiBudW1iZXIsXG4gICAgaXNOZXdHb2FsOiBib29sZWFuLFxuICAgIGhpZ2hsaWdodDogYm9vbGVhbixcbiAgICBwcmV2SXRlbXM6IFNldDxzdHJpbmc+XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGNhcmQgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZ29hbCcgfSk7XG4gICAgaWYgKGlzTmV3R29hbCkgY2FyZC5hZGRDbGFzcygnYmFtYm9vLWFpLXBsYW4tZ29hbC11cGRhdGVkJyk7XG5cbiAgICBjb25zdCBoZWFkID0gY2FyZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1nb2FsLWhlYWQnIH0pO1xuXG4gICAgY29uc3QgdGl0bGVJbnB1dCA9IGhlYWQuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZ29hbC10aXRsZScsXG4gICAgICBhdHRyOiB7IHZhbHVlOiBlbnRyeS5nb2FsLnRpdGxlLCBwbGFjZWhvbGRlcjogJ1x1NzZFRVx1NjgwN1x1NjgwN1x1OTg5OCcgfSxcbiAgICB9KTtcbiAgICB0aXRsZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgZW50cnkuZ29hbC50aXRsZSA9IHRpdGxlSW5wdXQudmFsdWUudHJpbSgpIHx8IGBcdTc2RUVcdTY4MDcke2dpICsgMX1gO1xuICAgIH0pO1xuICAgIHRpdGxlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTc2RUVcdTY4MDdcdTY1MzlcdTU0MERcdTRFM0FcdTMwMEMke2VudHJ5LmdvYWwudGl0bGV9XHUzMDBEYCk7XG4gICAgfSk7XG5cbiAgICBpZiAoZW50cnkuZ29hbC5hbmFseXNpcykge1xuICAgICAgaGVhZC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiBgQUkgXHU1MjA2XHU2NzkwXHVGRjFBJHtlbnRyeS5nb2FsLmFuYWx5c2lzfWAsXG4gICAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWFuYWx5c2lzJyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGNhdFNlbGVjdCA9IGhlYWQuY3JlYXRlRWwoJ3NlbGVjdCcsIHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tY2F0JyB9KTtcbiAgICBHT0FMX0NBVEVHT1JJRVMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3Qgb3B0ID0gY2F0U2VsZWN0LmNyZWF0ZUVsKCdvcHRpb24nLCB7IHRleHQ6IGAke2MuaWNvbn0gJHtjLm5hbWV9YCwgdmFsdWU6IGMuaWQgfSk7XG4gICAgICBpZiAoYy5pZCA9PT0gZW50cnkuZ29hbC5jYXRlZ29yeSkgb3B0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBjYXRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgZW50cnkuZ29hbC5jYXRlZ29yeSA9IGNhdFNlbGVjdC52YWx1ZSBhcyBHb2FsQ2F0ZWdvcnk7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NzZFRVx1NjgwN1x1MzAwQyR7ZW50cnkuZ29hbC50aXRsZX1cdTMwMERcdTk4ODZcdTU3REZcdTY1MzlcdTRFM0EgJHtjYXRTZWxlY3QudmFsdWV9YCk7XG4gICAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UoY2FyZCwgZW50cnkpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgc3RhcnRXcmFwID0gaGVhZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1kYXRlcmFuZ2UnIH0pO1xuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSBzdGFydFdyYXAuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGF0ZXJhbmdlLWlucHV0JyxcbiAgICAgIGF0dHI6IHsgdHlwZTogJ2RhdGUnLCB2YWx1ZTogZW50cnkuZ29hbC5zdGFydERhdGUgPz8gJycgfSxcbiAgICB9KTtcbiAgICBzdGFydElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGVudHJ5LmdvYWwuc3RhcnREYXRlID0gc3RhcnRJbnB1dC52YWx1ZTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU3NkVFXHU2ODA3XHUzMDBDJHtlbnRyeS5nb2FsLnRpdGxlfVx1MzAwRFx1NUYwMFx1NTlDQlx1NjVFNVx1NjUzOVx1NEUzQSAke3N0YXJ0SW5wdXQudmFsdWV9YCk7XG4gICAgfSk7XG4gICAgc3RhcnRXcmFwLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnXHUyMDE0JywgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGF0ZXJhbmdlLXNlcCcgfSk7XG4gICAgY29uc3QgZW5kSW5wdXQgPSBzdGFydFdyYXAuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGF0ZXJhbmdlLWlucHV0JyxcbiAgICAgIGF0dHI6IHsgdHlwZTogJ2RhdGUnLCB2YWx1ZTogZW50cnkuZ29hbC5lbmREYXRlID8/ICcnIH0sXG4gICAgfSk7XG4gICAgZW5kSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgZW50cnkuZ29hbC5lbmREYXRlID0gZW5kSW5wdXQudmFsdWU7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NzZFRVx1NjgwN1x1MzAwQyR7ZW50cnkuZ29hbC50aXRsZX1cdTMwMERcdTYyMkFcdTZCNjJcdTY1RTVcdTY1MzlcdTRFM0EgJHtlbmRJbnB1dC52YWx1ZX1gKTtcbiAgICAgIHRoaXMucmVmcmVzaFRoaW5CYWRnZShjYXJkLCBlbnRyeSk7XG4gICAgfSk7XG5cbiAgICBjYXJkLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWJhZGdlJyB9KTtcbiAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UoY2FyZCwgZW50cnkpO1xuXG4gICAgY29uc3QgZGVsID0gaGVhZC5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1MjcxNScsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1kZWwnLFxuICAgICAgYXR0cjogeyB0aXRsZTogJ1x1NTIyMFx1OTY2NFx1OEJFNVx1NzZFRVx1NjgwNycgfSxcbiAgICB9KTtcbiAgICBkZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBlbnRyeS5rZWVwID0gZmFsc2U7XG4gICAgICBjYXJkLnRvZ2dsZUNsYXNzKCdiYW1ib28tYWktcGxhbi1nb2FsLXJlbW92ZWQnLCB0cnVlKTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU1MjIwXHU5NjY0XHU0RTg2XHU3NkVFXHU2ODA3XHUzMDBDJHtlbnRyeS5nb2FsLnRpdGxlfVx1MzAwRGApO1xuICAgICAgdGhpcy51cGRhdGVGb290ZXIoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGl0ZW1zV3JhcCA9IGNhcmQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbXMnIH0pO1xuICAgIChlbnRyeS5nb2FsLml0ZW1zID8/IFtdKS5mb3JFYWNoKChfLCBpaSkgPT4ge1xuICAgICAgY29uc3QgaXRlbUVudHJ5ID0gZW50cnkuaXRlbXNbaWldO1xuICAgICAgaWYgKCFpdGVtRW50cnkpIHJldHVybjtcbiAgICAgIGNvbnN0IGlzTmV3SXRlbSA9IGhpZ2hsaWdodCAmJiAhcHJldkl0ZW1zLmhhcyhgJHtlbnRyeS5nb2FsLnRpdGxlfTo6JHtpdGVtRW50cnkuaXRlbS5uYW1lfWApO1xuICAgICAgdGhpcy5yZW5kZXJJdGVtKGl0ZW1zV3JhcCwgZW50cnksIGl0ZW1FbnRyeSwgaWksIGlzTmV3SXRlbSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlZnJlc2hUaGluQmFkZ2UoY2FyZDogSFRNTEVsZW1lbnQsIGVudHJ5OiBHb2FsRW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBiYWRnZSA9IGNhcmQucXVlcnlTZWxlY3RvcignLmJhbWJvby1haS1wbGFuLWJhZGdlJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmICghYmFkZ2UpIHJldHVybjtcbiAgICBjb25zdCB7IGxldmVsLCBtaXNzaW5nIH0gPSBjbGFzc2lmeUNvbXBsZXRlbmVzcyhlbnRyeS5nb2FsKTtcbiAgICBiYWRnZS5lbXB0eSgpO1xuICAgIGlmIChsZXZlbCA9PT0gJ3RoaW4nKSB7XG4gICAgICBiYWRnZS5zZXRUZXh0KGBcdTI2QTAgXHU1Rjg1XHU4ODY1XHU1ODZCXHVGRjFBJHttaXNzaW5nLmpvaW4oJ1x1MzAwMScpfWApO1xuICAgICAgYmFkZ2UuYWRkQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWJhZGdlLXRoaW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYmFkZ2Uuc2V0VGV4dCgnXHUyNzEzIFx1NURGMlx1OTFDRlx1NTMxNlx1RkYwQ1x1NTNFRlx1NTE5OVx1NTE2NScpO1xuICAgICAgYmFkZ2UucmVtb3ZlQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWJhZGdlLXRoaW4nKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckl0ZW0oXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBlbnRyeTogR29hbEVudHJ5LFxuICAgIGl0ZW1FbnRyeTogSXRlbUVudHJ5LFxuICAgIGlpOiBudW1iZXIsXG4gICAgaXNOZXdJdGVtOiBib29sZWFuXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHJvdyA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtJyB9KTtcbiAgICBpZiAoaXNOZXdJdGVtKSByb3cuYWRkQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWl0ZW0tdXBkYXRlZCcpO1xuXG4gICAgY29uc3QgY2IgPSByb3cuY3JlYXRlRWwoJ2lucHV0JywgeyB0eXBlOiAnY2hlY2tib3gnLCBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLWNiJyB9KTtcbiAgICBjYi5jaGVja2VkID0gaXRlbUVudHJ5LmtlZXA7XG4gICAgY2IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgaXRlbUVudHJ5LmtlZXAgPSBjYi5jaGVja2VkO1xuICAgICAgcm93LnRvZ2dsZUNsYXNzKCdiYW1ib28tYWktcGxhbi1pdGVtLW9mZicsICFjYi5jaGVja2VkKTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChcbiAgICAgICAgYCR7Y2IuY2hlY2tlZCA/ICdcdTRGRERcdTc1NTknIDogJ1x1NTIyMFx1OTY2NCd9XHU1QjUwXHU5ODc5XHUzMDBDJHtpdGVtRW50cnkuaXRlbS5uYW1lfVx1MzAwRGBcbiAgICAgICk7XG4gICAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UocGFyZW50LmNsb3Nlc3QoJy5iYW1ib28tYWktcGxhbi1nb2FsJykgYXMgSFRNTEVsZW1lbnQsIGVudHJ5KTtcbiAgICAgIHRoaXMudXBkYXRlRm9vdGVyKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBuYW1lSW5wdXQgPSByb3cuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1uYW1lJyxcbiAgICAgIGF0dHI6IHsgdmFsdWU6IGl0ZW1FbnRyeS5pdGVtLm5hbWUsIHBsYWNlaG9sZGVyOiAnXHU1QjUwXHU5ODc5XHU1NDBEJyB9LFxuICAgIH0pO1xuICAgIG5hbWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgIGl0ZW1FbnRyeS5pdGVtLm5hbWUgPSBuYW1lSW5wdXQudmFsdWUudHJpbSgpIHx8IGBcdTVCNTBcdTk4Nzkke2lpICsgMX1gO1xuICAgICAgdW5pdENoaXAuc2V0VGV4dChleHRyYWN0VW5pdChuYW1lSW5wdXQudmFsdWUpKTtcbiAgICB9KTtcbiAgICBuYW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTVCNTBcdTk4NzlcdTY1MzlcdTU0MERcdTRFM0FcdTMwMEMke2l0ZW1FbnRyeS5pdGVtLm5hbWV9XHUzMDBEYCk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWl0ZW1FbnRyeS5pdGVtLnRhc2tEYXlUeXBlKSBpdGVtRW50cnkuaXRlbS50YXNrRGF5VHlwZSA9ICdkYWlseSc7XG4gICAgY29uc3QgZGFpbHlXcmFwID0gcm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tZGFpbHknIH0pO1xuICAgIGRhaWx5V3JhcC5jcmVhdGVTcGFuKHsgdGV4dDogJ1x1NkJDRlx1NjVFNVx1OTFDRicsIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tbGFiZWwnIH0pO1xuICAgIGNvbnN0IGRhaWx5SW5wdXQgPSBkYWlseVdyYXAuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1kYWlseS1pbnB1dCcsXG4gICAgICBhdHRyOiB7IHZhbHVlOiBpdGVtRW50cnkuaXRlbS5kYWlseU1pbiA/PyAnJywgcGxhY2Vob2xkZXI6ICdcdTY1NzBcdTVCNTcnLCB0eXBlOiAndGV4dCcsIGlucHV0bW9kZTogJ2RlY2ltYWwnIH0sXG4gICAgfSk7XG4gICAgY29uc3QgdW5pdENoaXAgPSBkYWlseVdyYXAuY3JlYXRlU3Bhbih7IGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tdW5pdC1jaGlwJyB9KTtcbiAgICB1bml0Q2hpcC5zZXRUZXh0KGV4dHJhY3RVbml0KGl0ZW1FbnRyeS5pdGVtLm5hbWUpKTtcbiAgICBjb25zdCBkYWlseVdhcm4gPSByb3cuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0td2FybicsXG4gICAgICB0ZXh0OiAnXHUyNkEwIFx1NEUwRFx1NTNFRlx1OTFDRlx1NTMxNlx1RkYwQ1x1NUVGQVx1OEJBRVx1NTIyMFx1OTY2NFx1NjIxNlx1NjUzOVx1NTE5OVx1NEUzQVx1NTNFRlx1OEJBMVx1NjU3MFx1NTJBOFx1NEY1QycsXG4gICAgfSk7XG4gICAgY29uc3QgbWFya0RhaWx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgcXVhbnRpZmllZCA9IC9eXFxkKyhcXC5cXGQrKT8kLy50ZXN0KChpdGVtRW50cnkuaXRlbS5kYWlseU1pbiA/PyAnJykudHJpbSgpKTtcbiAgICAgIGRhaWx5V3JhcC50b2dnbGVDbGFzcygnYmFtYm9vLWFpLXBsYW4taXRlbS1uby1kYWlseScsICFxdWFudGlmaWVkKTtcbiAgICAgIGRhaWx5V2Fybi50b2dnbGVDbGFzcygnYmFtYm9vLWFpLXBsYW4taXRlbS13YXJuLXNob3cnLCAhcXVhbnRpZmllZCk7XG4gICAgfTtcbiAgICBtYXJrRGFpbHkoKTtcbiAgICBkYWlseUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgaXRlbUVudHJ5Lml0ZW0uZGFpbHlNaW4gPSBkYWlseUlucHV0LnZhbHVlLnRyaW0oKTtcbiAgICAgIG1hcmtEYWlseSgpO1xuICAgICAgdGhpcy5yZWZyZXNoVGhpbkJhZGdlKHBhcmVudC5jbG9zZXN0KCcuYmFtYm9vLWFpLXBsYW4tZ29hbCcpIGFzIEhUTUxFbGVtZW50LCBlbnRyeSk7XG4gICAgfSk7XG4gICAgZGFpbHlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NUI1MFx1OTg3OVx1MzAwQyR7aXRlbUVudHJ5Lml0ZW0ubmFtZX1cdTMwMERcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdTY1MzlcdTRFM0EgJHtpdGVtRW50cnkuaXRlbS5kYWlseU1pbn1gKTtcbiAgICB9KTtcblxuICAgIGlmIChpdGVtRW50cnkuaXRlbS5kZXRhaWwpIHtcbiAgICAgIHJvdy5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiBgQUlcdUZGMUEke2l0ZW1FbnRyeS5pdGVtLmRldGFpbH1gLFxuICAgICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLXJlYXNvbicsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUZvb3RlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZm9vdGVyQ291bnQpIHJldHVybjtcbiAgICBjb25zdCBuID0gdGhpcy5lbnRyaWVzLmZpbHRlcigoZSkgPT4gZS5rZWVwKS5sZW5ndGg7XG4gICAgdGhpcy5mb290ZXJDb3VudC5zZXRUZXh0KGBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdUZGMDgke259XHVGRjA5YCk7XG4gIH1cblxuICBwcml2YXRlIGNvbmZpcm0oKTogdm9pZCB7XG4gICAgY29uc3QgZmluYWxHb2FsczogR29hbEl0ZW1bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5lbnRyaWVzKSB7XG4gICAgICBpZiAoIWVudHJ5LmtlZXApIGNvbnRpbnVlO1xuICAgICAgY29uc3Qga2VwdEl0ZW1zOiBHb2FsU3ViSXRlbVtdID0gZW50cnkuaXRlbXNcbiAgICAgICAgLmZpbHRlcigoaXQpID0+IGl0LmtlZXApXG4gICAgICAgIC5tYXAoKGl0KSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBkZXRhaWw6IF9kZXRhaWwsIC4uLnJlc3QgfSA9IGl0Lml0ZW07XG4gICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgIH0pO1xuICAgICAgZmluYWxHb2Fscy5wdXNoKHsgLi4uZW50cnkuZ29hbCwgaXRlbXM6IGtlcHRJdGVtcyB9KTtcbiAgICB9XG5cbiAgICBpZiAoZmluYWxHb2Fscy5sZW5ndGggPT09IDApIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1x1NjcyQVx1NEZERFx1NzU1OVx1NEVGQlx1NEY1NVx1NzZFRVx1NjgwN1x1RkYwQ1x1NURGMlx1NTNENlx1NkQ4OFx1NTE5OVx1NTE2NScpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9uQ29uZmlybShmaW5hbEdvYWxzKTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cbiIsICIvKipcbiAqIFBsYW5uaW5nU2Vzc2lvbiBcdTIwMTQgXHU1QkY5XHU4QkREXHU1RjBGXHU4OUM0XHU1MjEyXHU0RjFBXHU4QkREXHVGRjA4QWdlbnRpY1x1RkYwQ1BoYXNlIDRcdUZGMDlcbiAqXG4gKiBcdTRFMEUgUGhhc2UxIGBwbGFuRnJvbU5vdGVgXHVGRjA4XHU0RTAwXHU2QjIxXHU2MDI3XHVGRjA5XHU0RTBEXHU1NDBDXHVGRjBDXHU2NzJDXHU3QzdCXHU3RUY0XHU2MkE0XHU0RTAwXHU2QkI1XHU1OTFBXHU4RjZFXHU1QkY5XHU4QkREXHVGRjFBXG4gKiAgLSBcdTk5OTZcdThGNkUgaW5pdCgpXHVGRjFBQUkgXHU0RUNFXHU3QjE0XHU4QkIwXHU2MkM2XHU4OUUzXHU1MjFEXHU3MjQ4IGdvYWxzXHVGRjFCXG4gKiAgLSBcdTU0MEVcdTdFRUQgc2VuZCh0ZXh0KVx1RkYxQVx1NzUyOFx1NjIzN1x1NzUyOFx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NTg5RSAvIFx1NTIyMCAvIFx1NjUzOVx1RkYwQ0FJIFx1OEZENFx1NTZERVx1MzAxMFx1NTE2OFx1OTFDRlx1MzAxMVx1NjcwMFx1NjVCMCBnb2Fsc1x1RkYxQlxuICogIC0gXHU2MjRCXHU1MkE4XHU3RjE2XHU4RjkxXHVGRjFBXHU3NkY0XHU2M0E1IG11dGF0ZSBgZ29hbHNgXHVGRjA4XHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjA5XHVGRjBDXHU1RTc2XHU3NTI4IGFwcGx5TG9jYWxFZGl0IFx1NjI4QVx1NjUzOVx1NTJBOFxuICogICAgXHU1MTk5XHU4RkRCXHU1QkY5XHU4QkREXHU1Mzg2XHU1M0YyXHVGRjBDXHU5NjMyXHU2QjYyIEFJIFx1NEUwQlx1OEY2RVx1NjI4QVx1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1NjUzOVx1NTJBOFx1ODk4Nlx1NzZENlx1NTZERVx1NTNCQlx1RkYxQlxuICogIC0gcmVzZXQoKVx1RkYxQVx1NTZERVx1NTIzMCBBSSBcdTk5OTZcdTcyNDhcdUZGMENcdTZFMDVcdTdBN0FcdTVCRjlcdThCRERcdTMwMDJcbiAqXG4gKiBcdThCQkVcdThCQTFcdTUzOUZcdTUyMTlcdUZGMDhcdTRFMEVcdTRFQTdcdTU0QzFcdTU0RjJcdTVCNjZcdTRFMDBcdTgxRjRcdUZGMDlcdUZGMUFcbiAqICAtIFx1NTM1NVx1NEUwMFx1NjU3MFx1NjM2RVx1NkU5MFx1RkYxQXRoaXMuZ29hbHMgXHU2NjJGXHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjA4c291cmNlIG9mIHRydXRoXHVGRjA5XHUzMDAyXG4gKiAgLSBcdTVCQjlcdTk1MTlcdTRGMThcdTUxNDhcdUZGMUFcdTU3NEYgSlNPTiBcdTIxOTIgXHU1NkRFXHU2RURBXHU2NzJDXHU4RjZFIG1lc3NhZ2VzXHUzMDAxdGhpcy5nb2FscyBcdTRFMERcdTUzRDhcdTMwMDFcdTYyOUJcdTk1MTlcdTc1MzFcdTRFMEFcdTVDNDJcdTYzRDBcdTc5M0FcdTMwMDJcbiAqXG4gKiBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDZmV0Y2hGbiBcdTUzRUZcdTZDRThcdTUxNjVcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdUZGMDhcdTUzQzJcdTgwMDMgbWFya2Rvd25QbGFubmVyLnRlc3QudHNcdUZGMDlcdTMwMDJcbiAqL1xuXG5pbXBvcnQgeyByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgdHlwZSBHb2FsSXRlbSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHtcbiAgYnVpbGRQcm9tcHQsXG4gIGV4dHJhY3RDaGF0VGV4dCxcbiAgcGFyc2VHb2FscyxcbiAgdHlwZSBBaUZldGNoRm4sXG4gIHR5cGUgQWlSZXNwb25zZSxcbiAgdHlwZSBQbGFubmVyU2V0dGluZ3MsXG59IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcbmltcG9ydCB7IHZhbGlkYXRlR29hbHMgYXMgX3ZhbGlkYXRlIH0gZnJvbSAnLi9Hb2FsQ2FyZFZhbGlkYXRvcic7XG5cbi8qKiBcdTVCRjlcdThCRERcdTZEODhcdTYwNkZcdUZGMDhcdTVCRjlcdTlGNTAgT3BlbkFJIGNoYXQvY29tcGxldGlvbnMgbWVzc2FnZXNcdUZGMDkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhdE1lc3NhZ2Uge1xuICByb2xlOiAnc3lzdGVtJyB8ICd1c2VyJyB8ICdhc3Npc3RhbnQnO1xuICBjb250ZW50OiBzdHJpbmc7XG59XG5cbi8qKiBzZW5kKCkgXHU3Njg0XHU4RkQ0XHU1NkRFXHU1MDNDXHVGRjFBXHU2NzJDXHU4RjZFIEFJIFx1Njk4Mlx1ODk4MSArIFx1NjcwMFx1NjVCMFx1NTE2OFx1OTFDRiBnb2FscyAqL1xuZXhwb3J0IGludGVyZmFjZSBTZW5kUmVzdWx0IHtcbiAgcmVwbHk6IHN0cmluZztcbiAgZ29hbHM6IEdvYWxJdGVtW107XG59XG5cbi8qKiBcdTVCRjlcdThCRERcdTVGMEZcdTg5QzRcdTUyMTJcdThGRkRcdTUyQTBcdTUyMzAgc3lzdGVtIFx1NzY4NFx1NjMwN1x1NEVFNFx1RkYwOFx1NTkwRFx1NzUyOCBidWlsZFByb21wdCBcdTc2ODRcdTkxQ0ZcdTUzMTZcdTk0QzFcdTVGOEJcdUZGMDkgKi9cbmNvbnN0IEFHRU5UX1NVRkZJWCA9IGBcblxuIyBcdTVCRjlcdThCRERcdTVGMEZcdTg5QzRcdTUyMTJcdTZBMjFcdTVGMEZcdUZGMDhcdTRGNjBcdTZCNjNcdTRFMEVcdTc1MjhcdTYyMzdcdTU5MUFcdThGNkVcdTYyNTNcdTc4RThcdTg5QzRcdTUyMTJcdUZGMDlcblx1OEZEOVx1NjYyRlx1NUJGOVx1OEJERFx1NUYwRlx1ODlDNFx1NTIxMlx1RkYxQVx1NzUyOFx1NjIzN1x1NEYxQVx1NTcyOFx1NkI2NFx1NTdGQVx1Nzg0MFx1NEUwQVx1NjNEMFx1NTFGQVx1MzAwQ1x1NTg5RSAvIFx1NTIyMCAvIFx1NjUzOVx1MzAwRFx1N0I0OVx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NjMwN1x1NEVFNFx1MzAwMlxuLSBcdTZCQ0ZcdTZCMjFcdTU2REVcdTU5MERcdTkwRkRcdTVGQzVcdTk4N0JcdThGRDRcdTU2REVcdTMwMTBcdTVGNTNcdTUyNERcdTVCOENcdTY1NzRcdTc2ODRcdTY3MDBcdTY1QjAgZ29hbHMgSlNPTiBcdTUxNjhcdTkxQ0ZcdTMwMTFcdUZGMEMqKlx1NEUwRFx1ODk4MVx1NTNFQVx1NTZERVx1NTg5RVx1OTFDRlx1MzAwMVx1NEUwRFx1ODk4MVx1NTZERSBkaWZmKipcdTMwMDJcbi0gXHU5ODc2XHU1QzQyXHU1ODlFXHU1MkEwXHU1M0VGXHU5MDA5XHU1QjU3XHU2QkI1IFwicmVwbHlcIlx1RkYwOFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwQ1x1MjI2NDMwIFx1NUI1N1x1NEUyRFx1NjU4N1x1RkYwOVx1RkYxQVx1NzUyOFx1NEUwMFx1NTNFNVx1OEJERFx1OEJGNFx1NjYwRVx1NEY2MFx1OEZEOVx1NkIyMVx1NTA1QVx1NEU4Nlx1NEVDMFx1NEU0OFx1NjUzOVx1NTJBOFx1RkYxQlx1ODJFNVx1NzUyOFx1NjIzN1x1NTNFQVx1NjYyRlx1NjNEMFx1OTVFRVx1NEU1Rlx1OEJGN1x1N0I4MFx1ODk4MVx1NTZERVx1N0I1NFx1MzAwMlxuLSBcdTRGRERcdTYzMDFcdTRFMEFcdTY1ODdcdTYyNDBcdTY3MDlcdTkxQ0ZcdTUzMTZcdTk0QzFcdTVGOEJcdUZGMUFcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW5cdTMwMDFcdTY1RTVcdTk4OTdcdTdDOTJcdTVFQTZcdTMwMDFcdTRFMjVcdTY4M0NcdTU2RjRcdTdFRDVcdTc2RUVcdTY4MDdcdTMwMDFcdTUzRUZcdTY1NzBcdTRFRTNcdTc0MDZcdTYzMDdcdTY4MDdcdTMwMDFcdTc5ODFcdTZCNjJcIlx1NTJBQVx1NTI5Qi9cdTU3NUFcdTYzMDFcIlx1N0I0OVx1NEYyQVx1OTFDRlx1NTMxNlx1OEJDRFx1MzAwMlxuLSBcdTUzRUFcdThGOTNcdTUxRkEgSlNPTlx1RkYwQ1x1NEUwRFx1ODk4MVx1NEVGQlx1NEY1NVx1OTg5RFx1NTkxNlx1ODlFM1x1OTFDQVx1NjU4N1x1NUI1N1x1MzAwMVx1NEUwRFx1ODk4MSBtYXJrZG93biBcdTU2RjRcdTY4MEZcdTMwMDJcblx1OEY5M1x1NTFGQVx1NjgzQ1x1NUYwRlx1NzkzQVx1NEY4Qlx1RkYxQVxueyBcInJlcGx5XCI6IFwiXHU1REYyXHU1MjIwXHU5NjY0XHU4REQxXHU2QjY1XHVGRjBDXHU2NUIwXHU1ODlFXHU2QkNGXHU1NDY4XHU2RTM4XHU2Q0YzM1x1NkIyMVwiLCBcImdvYWxzXCI6IFsgLi4uIFx1NTQwQ1x1NEUwQVx1NjU4N1x1N0VEM1x1Njc4NCAuLi4gXSB9YDtcblxuZXhwb3J0IGNsYXNzIFBsYW5uaW5nU2Vzc2lvbiB7XG4gIHByaXZhdGUgbWVzc2FnZXM6IENoYXRNZXNzYWdlW10gPSBbXTtcbiAgLyoqIFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwOFx1NTM1NVx1NEUwMFx1NjU3MFx1NjM2RVx1NkU5MFx1RkYwOVx1RkYwQ0FJIFx1NEUwRVx1NjI0Qlx1NTJBOFx1N0YxNlx1OEY5MVx1OTBGRFx1NEY1Q1x1NzUyOFx1NTE3Nlx1NEUwQSAqL1xuICBnb2FsczogR29hbEl0ZW1bXSA9IFtdO1xuICAvKiogXHU5OTk2XHU3MjQ4XHU1RkVCXHU3MTY3XHVGRjBDXHU0RjlCIHJlc2V0KCkgXHU4RkQ4XHU1MzlGICovXG4gIHByaXZhdGUgaW5pdGlhbEdvYWxzOiBHb2FsSXRlbVtdID0gW107XG4gIC8qKiBcdTRGMUFcdThCRERcdTZBMjFcdTVGMEZcdUZGMUEnbm90ZScgXHU3NTMxXHU3QjE0XHU4QkIwXHU2MkM2XHU4OUUzXHU5OTk2XHU3MjQ4XHVGRjFCJ2VkaXQnIFx1NzUzMSBsb2FkR29hbHMgXHU4RjdEXHU1MTY1XHU3M0IwXHU2NzA5XHU2ODExICovXG4gIHByaXZhdGUgbW9kZTogJ25vdGUnIHwgJ2VkaXQnID0gJ25vdGUnO1xuICAvKiogZWRpdCBcdTZBMjFcdTVGMEZcdTc2ODQgc3lzdGVtIFx1NEUwQVx1NEUwQlx1NjU4N1x1RkYwOFx1NTQyQlx1OEY3RFx1NTE2NVx1NjgxMSBKU09OXHVGRjA5XHVGRjBDXHU0RjlCIHJlc2V0IFx1OEZEOFx1NTM5RiAqL1xuICBwcml2YXRlIGVkaXRTeXN0ZW1Db250ZW50ID0gJyc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjb250ZW50OiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBzZXR0aW5nczogUGxhbm5lclNldHRpbmdzLFxuICAgIHByaXZhdGUgZmV0Y2hGbjogQWlGZXRjaEZuID0gcmVxdWVzdFVybCBhcyB1bmtub3duIGFzIEFpRmV0Y2hGbixcbiAgICBwcml2YXRlIHNjb3BlOiAnbm90ZScgfCAnc2VsZWN0aW9uJyA9ICdub3RlJ1xuICApIHtcbiAgICBjb25zdCB7IHN5c3RlbSwgdXNlciB9ID0gYnVpbGRQcm9tcHQoY29udGVudCwgc2V0dGluZ3MuYWlEZWNvbXBvc2VEZXB0aCwgc2NvcGUpO1xuICAgIHRoaXMubWVzc2FnZXMucHVzaCh7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gKyBBR0VOVF9TVUZGSVggfSk7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0pO1xuICB9XG5cbiAgLyoqIFx1OTk5Nlx1OEY2RVx1ODlDNFx1NTIxMlx1RkYxQVx1OEZENFx1NTZERVx1NTIxRFx1NzI0OCBnb2FscyBcdTVFNzZcdTRGRERcdTVCNThcdTVGRUJcdTcxNjcgKi9cbiAgYXN5bmMgaW5pdCgpOiBQcm9taXNlPEdvYWxJdGVtW10+IHtcbiAgICBjb25zdCB0ZXh0ID0gZXh0cmFjdENoYXRUZXh0KGF3YWl0IHRoaXMuY2FsbCgpKTtcbiAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKHRleHQpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHRoaXMuZ29hbHMgPSB0aGlzLmNhbGxQYXJzZShwYXJzZUdvYWxzKG9iaikpO1xuICAgIHRoaXMuaW5pdGlhbEdvYWxzID0gdGhpcy5nb2FscztcbiAgICByZXR1cm4gdGhpcy5nb2FscztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTc1MjhcdTYyMzdcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTY1MzlcdTRFMDBcdThGNkVcdUZGMUFcdThGRDRcdTU2REUgeyByZXBseSwgZ29hbHMgfVx1RkYwQ1x1NUU3Nlx1NTE2OFx1OTFDRlx1NjZGRlx1NjM2Mlx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1MzAwMlxuICAgKiBcdTU3NEYgSlNPTiAvIFx1N0VEM1x1Njc4NFx1OTc1RVx1NkNENSBcdTIxOTIgXHU1NkRFXHU2RURBXHU2NzJDXHU4RjZFXHUzMDAxZ29hbHMgXHU0RkREXHU2MzAxXHU0RTBEXHU1M0Q4XHUzMDAxXHU2MjlCXHU5NTE5XHVGRjA4XHU3NTMxXHU0RTBBXHU1QzQyXHU2M0QwXHU3OTNBXHVGRjA5XHUzMDAyXG4gICAqL1xuICBhc3luYyBzZW5kKHVzZXJUZXh0OiBzdHJpbmcpOiBQcm9taXNlPFNlbmRSZXN1bHQ+IHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2goeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXJUZXh0IH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy5jYWxsKCk7XG4gICAgICBjb25zdCB0ZXh0ID0gZXh0cmFjdENoYXRUZXh0KHJlc3ApO1xuICAgICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZSh0ZXh0KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGNvbnN0IGdvYWxzID0gdGhpcy5jYWxsUGFyc2UocGFyc2VHb2FscyhvYmopKTtcbiAgICAgIC8vIFx1NjIxMFx1NTI5Rlx1RkYxQVx1NTE2OFx1OTFDRlx1NjZGRlx1NjM2Mlx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1xuICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbHk6IHR5cGVvZiBvYmoucmVwbHkgPT09ICdzdHJpbmcnID8gb2JqLnJlcGx5IDogJycsXG4gICAgICAgIGdvYWxzLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIFx1NUJCOVx1OTUxOVx1NjgzOFx1NUZDM1x1RkYxQVx1NTZERVx1NkVEQVx1NjcyQ1x1OEY2RSB1c2VyIFx1NkQ4OFx1NjA2Rlx1RkYwQ1x1N0VERFx1NEUwRFx1NTJBOFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICAgIHRocm93IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyIDogbmV3IEVycm9yKCdBSSBcdThGRDRcdTU2REVcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTAnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU3NTI4XHU2MjM3XHU2MjRCXHU1MkE4XHU3RjE2XHU4RjkxXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjFBXHU2MjhBXHU2NTM5XHU1MkE4XHU1MTk5XHU4RkRCXHU1QkY5XHU4QkREXHU1Mzg2XHU1M0YyXHVGRjA4c3lzdGVtIG5vdGVcdUZGMDlcdUZGMENcbiAgICogXHU4QkE5IEFJIFx1NEUwQlx1OEY2RVwiXHU3N0U1XHU5MDUzXHU0RjYwXHU2NTM5XHU4RkM3XCJcdUZGMENcdTRFMERcdTRGMUFcdTUxOERcdTYyOEFcdTg4QUJcdTUyMjBcdTc2ODRcdTVCNTBcdTk4NzlcdTUyQTBcdTU2REVcdTY3NjVcdTMwMDJcbiAgICogXHU3NzFGXHU2QjYzXHU3Njg0IG11dGF0ZSBcdTVERjJcdTU3MjhcdTU5MTZcdTkwRThcdTc2RjRcdTYzQTVcdTRGNUNcdTc1MjhcdTU3MjggdGhpcy5nb2FscyBcdTRFMEFcdTMwMDJcbiAgICovXG4gIGFwcGx5TG9jYWxFZGl0KG5vdGU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZXMucHVzaCh7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBgW1x1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1NjUzOVx1NTJBOF0gJHtub3RlfWAgfSk7XG4gIH1cblxuICAvKiogXHU1NkRFXHU1MjMwIEFJIFx1OTk5Nlx1NzI0OFx1RkYwQ1x1NkUwNVx1N0E3QVx1NUJGOVx1OEJERFx1NTM4Nlx1NTNGMiAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSAnZWRpdCcpIHtcbiAgICAgIHRoaXMuZ29hbHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuaW5pdGlhbEdvYWxzKSk7XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gW3sgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHRoaXMuZWRpdFN5c3RlbUNvbnRlbnQgKyBBR0VOVF9TVUZGSVggfV07XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZ29hbHMgPSB0aGlzLmluaXRpYWxHb2FscztcbiAgICBjb25zdCB7IHN5c3RlbSwgdXNlciB9ID0gYnVpbGRQcm9tcHQodGhpcy5jb250ZW50LCB0aGlzLnNldHRpbmdzLmFpRGVjb21wb3NlRGVwdGgsIHRoaXMuc2NvcGUpO1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXG4gICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gKyBBR0VOVF9TVUZGSVggfSxcbiAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0sXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTdGMTZcdThGOTFcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMDhcdTRFMERcdThDMDMgQUlcdUZGMDlcdUZGMUFcdTZERjFcdTYyRjdcdThEMURcdTRFM0FcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMENcdTYyOEFcdTVCRjlcdThCRERcdTkxQ0RcdTdGNkVcdTRFM0FcdTMwMENcdTdGMTZcdThGOTFcdTMwMERcdTRFMEFcdTRFMEJcdTY1ODdcdUZGMENcbiAgICogXHU4QkE5XHU1NDBFXHU3RUVEIHNlbmQoKSBcdTc2ODQgQUkgXHU1NzI4XHU3M0IwXHU2NzA5XHU2ODExXHU1N0ZBXHU3ODQwXHU0RTBBXHU1ODlFXHU1MjIwXHU2NTM5XHVGRjBDXHU4MDBDXHU5NzVFXHU0RUNFXHU3QjE0XHU4QkIwXHU5MUNEXHU2NUIwXHU2MkM2XHU4OUUzXHUzMDAyXG4gICAqIFx1OTk5Nlx1NzI0OFx1NUZFQlx1NzE2NyA9IFx1NEYyMFx1NTE2NVx1NjgxMVx1RkYwQ3Jlc2V0KCkgXHU1NkRFXHU1MjMwXHU3NzFGXHU1QjlFXHU5OTk2XHU3MjQ4XHVGRjA4XHU0RTBEXHU4OEFCXHU2QzYxXHU2N0QzXHVGRjA5XHUzMDAyXG4gICAqL1xuICBsb2FkR29hbHMoZ29hbHM6IEdvYWxJdGVtW10pOiB2b2lkIHtcbiAgICBjb25zdCBjbG9uZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ29hbHMpKSBhcyBHb2FsSXRlbVtdO1xuICAgIHRoaXMuZ29hbHMgPSBjbG9uZTtcbiAgICB0aGlzLmluaXRpYWxHb2FscyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ29hbHMpKSBhcyBHb2FsSXRlbVtdO1xuICAgIHRoaXMubW9kZSA9ICdlZGl0JztcbiAgICB0aGlzLmVkaXRTeXN0ZW1Db250ZW50ID1cbiAgICAgICdcdTRGNjBcdTY2MkZcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTdGMTZcdThGOTFcdTU2NjhcdTMwMDJcdTc1MjhcdTYyMzdcdTVERjJcdTY3MDlcdTRFMDBcdTRFMkFcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMDhcdTU5ODJcdTRFMEIgSlNPTlx1RkYwOVx1RkYxQVxcbicgK1xuICAgICAgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpICtcbiAgICAgICdcXG5cdTc1MjhcdTYyMzdcdTRGMUFcdTc1MjhcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTYzRDBcdTUxRkFcdTMwMENcdTU4OUUvXHU1MjIwL1x1NjUzOVx1MzAwRFx1NjMwN1x1NEVFNFx1RkYwQ1x1NEY2MFx1NkJDRlx1NkIyMVx1NTZERVx1NTkwRFx1OTBGRFx1NUZDNVx1OTg3Qlx1OEZENFx1NTZERVx1MzAxMFx1NUY1M1x1NTI0RFx1NUI4Q1x1NjU3NFx1NzY4NFx1NjcwMFx1NjVCMCBnb2FscyBKU09OIFx1NTE2OFx1OTFDRlx1MzAxMVx1RkYwQ1x1NEZERFx1NjMwMVx1OTFDRlx1NTMxNlx1OTRDMVx1NUY4Qlx1RkYwOFx1N0VBRlx1NjU3MFx1NUI1NyBkYWlseU1pblx1MzAwMVx1NjVFNVx1OTg5N1x1N0M5Mlx1NUVBNlx1MzAwMVx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1x1RkYwOVx1MzAwMlx1NTNFQVx1OEY5M1x1NTFGQSBKU09OXHVGRjBDXHU0RTBEXHU4OTgxIG1hcmtkb3duIFx1NTZGNFx1NjgwRlx1MzAwMic7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFt7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiB0aGlzLmVkaXRTeXN0ZW1Db250ZW50ICsgQUdFTlRfU1VGRklYIH1dO1xuICB9XG5cbiAgLyoqIFx1NUY1M1x1NTI0RFx1NUJGOVx1OEJERFx1NkQ4OFx1NjA2Rlx1RkYwOFx1NTNFQVx1OEJGQlx1NzUyOFx1OTAxNFx1RkYwQ1x1NTk4Mlx1OEMwM1x1OEJENSAvIFx1NkQ0Qlx1OEJENVx1NjVBRFx1OEEwMFx1RkYwOSAqL1xuICBnZXRNZXNzYWdlcygpOiBDaGF0TWVzc2FnZVtdIHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlcztcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2FsbCgpOiBQcm9taXNlPEFpUmVzcG9uc2U+IHtcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLnNldHRpbmdzLmFpQmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2A7XG4gICAgcmV0dXJuIHRoaXMuZmV0Y2hGbih7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3RoaXMuc2V0dGluZ3MuYWlBcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1vZGVsOiB0aGlzLnNldHRpbmdzLmFpTW9kZWwsXG4gICAgICAgIG1lc3NhZ2VzOiB0aGlzLm1lc3NhZ2VzLFxuICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogJ2pzb25fb2JqZWN0JyB9LFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgfSksXG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU4OUUzXHU2NzkwICsgXHU2ODIxXHU5QThDXHVGRjFBcGFyc2VHb2FscyBcdTUwNUFcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdUZGMEN2YWxpZGF0ZUdvYWxzIFx1NTE1Q1x1NUU5NVx1ODg2NVx1OUVEOFx1OEJBNCAqL1xuICBwcml2YXRlIGNhbGxQYXJzZShyYXc6IEdvYWxJdGVtW10pOiBHb2FsSXRlbVtdIHtcbiAgICByZXR1cm4gX3ZhbGlkYXRlKHJhdyk7XG4gIH1cbn1cbiIsICIvKipcbiAqIERpYWdub3Npc01vZGFsIFx1MjAxNCBBSSBcdThCQ0FcdTY1QURcdTUzRUFcdThCRkJcdTYyQTVcdTU0NEFcdUZGMDhNVlAtMSArIFVJIHYyXHVGRjA5XG4gKlxuICogXHU4QkJFXHU4QkExXHU4QkVEXHU4QTAwXHVGRjFBXHU0RTBFIEFJIFx1ODlDNFx1NTIxMlx1NkEyMVx1NTc1N1x1RkYwOEFnZW50aWNQbGFuTW9kYWxcdUZGMDlcdTdFREZcdTRFMDBcbiAqICAgLSBcdTRFM0JcdTk4OThcdTgyNzJcdUZGMUF2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpXG4gKiAgIC0gXHU1NzA2XHU4OUQyXHVGRjFBMTAtMTJweFxuICogICAtIFx1OTVGNFx1OERERFx1RkYxQThwdCBcdTdGNTFcdTY4M0NcbiAqICAgLSBcdTcyQjZcdTYwMDFcdThCRURcdTRFNDlcdUZGMUFcdTRGRERcdTc1NTlcdUZGMDhcdTdFRkYvXHU5RUM0L1x1N0VBMi9cdTZBNTlcdUZGMDlcdUZGMENcdTRGNDZcdTY3RDRcdTU0OENcdTUzMTZcdUZGMDhcdTkwMEZcdTY2MEVcdTgwQ0NcdTY2NkYgKyBcdTVCNTdcdTgyNzJcdUZGMDlcbiAqXG4gKiBcdTRGRTFcdTYwNkZcdTVDNDJcdTdFQTdcdUZGMUFcbiAqICAgTDEgXHU3MTI2XHU3MEI5XHVGRjFBXHU2ODA3XHU5ODk4ICsgXHU2NDU4XHU4OTgxXHVGRjA4XHU0RTAwXHU1QzRGXHU1M0VGXHU4OUMxXHVGRjA5XG4gKiAgIEwyIFx1NEUzQlx1NEY1M1x1RkYxQVx1NUVGQVx1OEJBRVx1NTIxN1x1ODg2OFx1RkYwOFx1NkJDRlx1Njc2MVx1NzJFQ1x1N0FDQlx1ODg0Q1x1NTJBOFx1NTM2MSBcdTIxOTIgXHU5MTkyXHU3NkVFIENUQVx1RkYwOVx1MjAxNCBcdTc1MjhcdTYyMzdcdTY3NjVcdThGRDlcdTkxQ0NcdTc2ODRcdTc3MUZcdTZCNjNcdTc2RUVcdTc2ODRcbiAqICAgTDMgXHU3RUM2XHU4MjgyXHVGRjFBXHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHVGRjA4XHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXHVGRjBDXHU3MEI5XHU1MUZCXHU1QzU1XHU1RjAwXHU3RDI3XHU1MUQxXHU4ODY4XHU2ODNDXHVGRjA5XHUyMDE0IFx1NjUyRlx1NjQ5MVx1NjU3MFx1NjM2RVxuICpcbiAqIFx1NTc0RiBKU09OIFx1NTZERVx1OTAwMFx1RkYwOHJhd1RleHRcdUZGMDlcdTIxOTIgXHU3NkY0XHU2M0E1XHU1QzU1XHU3OTNBXHU3RUFGXHU2NTg3XHU2NzJDXHVGRjBDXHU0RTBEXHU1RDI5XHUzMDAyXG4gKi9cbmltcG9ydCB7IE1vZGFsLCBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IERpYWdub3Npc1Jlc3VsdCwgR29hbERpYWdub3NpcyB9IGZyb20gJy4vR29hbERpYWdub3Nlcic7XG5pbXBvcnQgdHlwZSB7IEl0ZW1FdmlkZW5jZSB9IGZyb20gJy4vRGV2aWF0aW9uQ2FsY3VsYXRvcic7XG5cbmNvbnN0IFNUQVRVU19MQUJFTDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgb25fdHJhY2s6ICdcdThGQkVcdTY4MDcnLFxuICBiZWhpbmQ6ICdcdTg0M0RcdTU0MEUnLFxuICBzdHVjazogJ1x1NTA1Q1x1NkVERScsXG4gIGRvbmU6ICdcdTVERjJcdTVCOENcdTYyMTAnLFxuICBhdF9yaXNrOiAnXHU0RTM0XHU2NzFGXHU5OENFXHU5NjY5Jyxcbn07XG5cbi8qKiBcdTUwNjVcdTVFQjdcdTdCNDlcdTdFQTdcdTY1ODdcdTY4NDhcdUZGMDhcdTRFMEUgd2ViYXBwIFx1NTA2NVx1NUVCN1x1NTM2MVx1NzI0N1x1NTQwQ1x1OEJDRFx1NkM0N1x1RkYwOSAqL1xuY29uc3QgTEVWRUxfTEFCRUw6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIGV4Y2VsbGVudDogJ1x1NEYxOFx1NzlDMCcsXG4gIGdvb2Q6ICdcdTgyNkZcdTU5N0QnLFxuICB3YXJuaW5nOiAnXHU5NzAwXHU1MTczXHU2Q0U4JyxcbiAgcmlzazogJ1x1OThDRVx1OTY2OScsXG59O1xuXG4vKiogXHU0RTA5XHU3RUY0XHU1MDY1XHU1RUI3XHU1MjA2XHU3N0VEXHU2ODA3XHU3QjdFXHVGRjA4XHU1QzY1XHU3RUE2IC8gXHU1MkE4XHU1MjlCIC8gXHU4MjgyXHU1OTRGXHVGRjBDXHU1QkY5XHU5RjUwXHU1MDY1XHU1RUI3XHU1MzYxXHU3MjQ3XHVGRjA5ICovXG5jb25zdCBESU1fTEFCRUw6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIEwxOiAnXHU1QzY1XHU3RUE2JyxcbiAgTDI6ICdcdTUyQThcdTUyOUInLFxuICBMMzogJ1x1ODI4Mlx1NTk0RicsXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3Npc01vZGFsT3B0aW9ucyB7XG4gIGRpYWdub3NpczogRGlhZ25vc2lzUmVzdWx0O1xuICBvbkFwcGx5OiAoZ29hbDogR29hbERpYWdub3NpcykgPT4gdm9pZDtcbiAgLyoqIFx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1OEJDMVx1NjM2RVx1RkYwOFx1NjMwOSBnb2FsLnRpdGxlIFx1N0QyMlx1NUYxNVx1RkYwOVx1RkYwQ1x1OUVEOFx1OEJBNFx1NjI5OFx1NTNFMFx1RkYwQ1x1NUM1NVx1NUYwMFx1NTQwRVx1NjYyRlx1N0QyN1x1NTFEMVx1ODg2OFx1NjgzQyAqL1xuICBpdGVtRXZpZGVuY2U/OiBSZWNvcmQ8c3RyaW5nLCBJdGVtRXZpZGVuY2VbXT47XG4gIHRpdGxlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGlhZ25vc2lzTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgb3B0czogRGlhZ25vc2lzTW9kYWxPcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBvcHRzOiBEaWFnbm9zaXNNb2RhbE9wdGlvbnMpIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmVtcHR5KCk7XG4gICAgY29udGVudEVsLmFkZENsYXNzKCdiYW1ib28tZGlhZy1tb2RhbCcpO1xuXG4gICAgLy8gPT09PT0gSGVhZGVyID09PT09XG4gICAgY29uc3QgaGVhZGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1kaWFnLWhlYWRlcicgfSk7XG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogdGhpcy5vcHRzLnRpdGxlID8/ICdBSSBcdThCQ0FcdTY1QUQgXHUwMEI3IFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NTkwRFx1NzZEOCcgfSk7XG5cbiAgICBjb25zdCBkID0gdGhpcy5vcHRzLmRpYWdub3NpcztcbiAgICBpZiAoIWQub2spIHtcbiAgICAgIC8vIFx1NTc0RiBKU09OIFx1NTE1Q1x1NUU5NVx1RkYxQVx1NTNFQVx1NUM1NVx1NzkzQVx1N0VBRlx1NjU4N1x1NjcyQ1x1RkYwQ1x1NEUwRFx1NkUzMlx1NjdEM1x1NEVGQlx1NEY1NVx1NzZFRVx1NjgwN1x1NTM2MVxuICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiBkLnJhd1RleHQsIGNsczogJ2JhbWJvby1kaWFnLXJhdycgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gPT09PT0gU3VtbWFyeSA9PT09PVxuICAgIGlmIChkLnN1bW1hcnkpIHtcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHsgdGV4dDogZC5zdW1tYXJ5LCBjbHM6ICdiYW1ib28tZGlhZy1zdW1tYXJ5JyB9KTtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBHb2FsIFx1NTM2MVx1NzI0N1x1NTIxN1x1ODg2OCA9PT09PVxuICAgIGZvciAoY29uc3QgZyBvZiBkLmdvYWxzKSB7XG4gICAgICB0aGlzLnJlbmRlckdvYWwoY29udGVudEVsLCBnKTtcbiAgICB9XG4gICAgLy8gbmV4dEFjdGlvbnMgXHU1REYyXHU1RTlGXHU1RjAzXHVGRjFBXHU0RTBFXHU2QkNGXHU2NzYxIHN1Z2dlc3Rpb25zIFx1OTFDRFx1NTkwRFx1RkYwOFwiXHU2MDYyXHU1OTBEXHU2QkNGXHU2NUU1XHU2MjY3XHU4ODRDXCJcdTY2MkZcdTVFRkFcdThCQUVcdTc2ODRcdTUxNDNcdTYzQ0ZcdThGRjBcdUZGMDlcdUZGMENcbiAgICAvLyBcdTRGRERcdTc1NTlcdTY1NzBcdTYzNkVcdTVCNTdcdTZCQjVcdTRFRTVcdTRGRERcdTYzMDFcdTU0MTFcdTU0MEVcdTUxN0NcdTVCQjlcdUZGMENcdTRGNDZcdTRFMERcdTU3MjggVUkgXHU2RTMyXHU2N0QzXHUzMDAyXG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tIFx1NTE4NVx1OTBFOFx1NkUzMlx1NjdEM1x1OEY4NVx1NTJBOSAtLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSByZW5kZXJHb2FsKHBhcmVudDogSFRNTEVsZW1lbnQsIGc6IEdvYWxEaWFnbm9zaXMpOiB2b2lkIHtcbiAgICAvLyBcdTY3MDlcdTUwNjVcdTVFQjdcdTUyMDZcdTY1RjZcdTRFRTVcdTMwMENcdTdCNDlcdTdFQTdcdTMwMERcdTRFM0FcdThCRURcdTRFNDlcdTRFM0JcdTgyNzJcdUZGMUJcdTU0MjZcdTUyMTlcdTU2REVcdTkwMDBcdTY1RTcgc3RhdHVzXHVGRjA4XHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA5XG4gICAgY29uc3QgaGFzSGVhbHRoID0gISFnLmxldmVsO1xuICAgIGNvbnN0IGNhcmQgPSBwYXJlbnQuY3JlYXRlRGl2KHtcbiAgICAgIGNsczogaGFzSGVhbHRoXG4gICAgICAgID8gYGJhbWJvby1kaWFnLWdvYWwgYmFtYm9vLWRpYWctZ29hbC1sZXZlbC0ke2cubGV2ZWx9YFxuICAgICAgICA6IGBiYW1ib28tZGlhZy1nb2FsIGJhbWJvby1kaWFnLWdvYWwtJHtnLnN0YXR1c31gLFxuICAgIH0pO1xuXG4gICAgLy8gSGVhZGVyXHVGRjFBXHU2ODA3XHU5ODk4ICsgXHU1RkJEXHU2ODA3XHVGRjA4XHU1MDY1XHU1RUI3XHU3QjQ5XHU3RUE3IFx1NjIxNiBcdTY1RTdcdTcyQjZcdTYwMDFcdUZGMDlcbiAgICBjb25zdCBnb2FsSGVhZGVyID0gY2FyZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1nb2FsLWhlYWRlcicgfSk7XG4gICAgZ29hbEhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6IGcudGl0bGUsIGNsczogJ2JhbWJvby1kaWFnLWdvYWwtdGl0bGUnIH0pO1xuICAgIGlmIChoYXNIZWFsdGgpIHtcbiAgICAgIGNvbnN0IGJhZGdlID0gYCR7TEVWRUxfTEFCRUxbZy5sZXZlbCBhcyBzdHJpbmddID8/IGcubGV2ZWx9JHtcbiAgICAgICAgdHlwZW9mIGcuaGVhbHRoU2NvcmUgPT09ICdudW1iZXInID8gYCBcdTAwQjcgJHtnLmhlYWx0aFNjb3JlfVx1NTIwNmAgOiAnJ1xuICAgICAgfWA7XG4gICAgICBnb2FsSGVhZGVyLmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgICB0ZXh0OiBiYWRnZSxcbiAgICAgICAgY2xzOiBgYmFtYm9vLWRpYWctbGV2ZWwgYmFtYm9vLWRpYWctbGV2ZWwtJHtnLmxldmVsfSBiYW1ib28tZGlhZy1oZWFsdGhzY29yZWAsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ29hbEhlYWRlci5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgICAgdGV4dDogU1RBVFVTX0xBQkVMW2cuc3RhdHVzXSA/PyBnLnN0YXR1cyxcbiAgICAgICAgY2xzOiBgYmFtYm9vLWRpYWctc3RhdHVzIGJhbWJvby1kaWFnLXN0YXR1cy0ke2cuc3RhdHVzfWAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTYzMDdcdTY4MDdcdUZGMDhcdTVDNjVcdTdFQTYvXHU1MkE4XHU1MjlCL1x1ODI4Mlx1NTk0Rlx1RkYwOVx1RkYwQ1x1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1OUFEOFx1NEVBRVxuICAgIGlmIChoYXNIZWFsdGgpIHtcbiAgICAgIHRoaXMucmVuZGVyRGltZW5zaW9ucyhjYXJkLCBnKTtcbiAgICB9XG5cbiAgICAvLyBcdTc0RjZcdTk4ODhcdUZGMDhcdTRFMDBcdTg4NENcdTcwNzBcdTVCNTdcdUZGMDlcbiAgICBpZiAoZy5ib3R0bGVuZWNrKSB7XG4gICAgICBjYXJkLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiBnLmJvdHRsZW5lY2ssIGNsczogJ2JhbWJvby1kaWFnLWJvdHRsZW5lY2snIH0pO1xuICAgIH1cblxuICAgIC8vIC0tLS0tIFx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1OEJDMVx1NjM2RVx1RkYxQVx1OUVEOFx1OEJBNFx1NjI5OFx1NTNFMFx1RkYwQ1x1NzBCOVx1NTFGQlx1NUM1NVx1NUYwMCAtLS0tLVxuICAgIGNvbnN0IGV2TGlzdCA9IHRoaXMub3B0cy5pdGVtRXZpZGVuY2U/LltnLnRpdGxlXTtcbiAgICBpZiAoZXZMaXN0ICYmIGV2TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbmRlckV2aWRlbmNlKGNhcmQsIGV2TGlzdCk7XG4gICAgfVxuXG4gICAgLy8gLS0tLS0gXHU1RUZBXHU4QkFFXHU1MjE3XHU4ODY4XHVGRjFBXHU2QkNGXHU2NzYxXHU3MkVDXHU3QUNCXHU4ODRDXHU1MkE4XHU1MzYxXHVGRjA4XHU2ODM4XHU1RkMzIENUQVx1RkYwOSAtLS0tLVxuICAgIGlmIChnLnN1Z2dlc3Rpb25zICYmIGcuc3VnZ2VzdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW5kZXJTdWdnZXN0aW9ucyhjYXJkLCBnKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckRpbWVuc2lvbnMocGFyZW50OiBIVE1MRWxlbWVudCwgZzogR29hbERpYWdub3Npcyk6IHZvaWQge1xuICAgIGNvbnN0IHdyYXAgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctZGltcycgfSk7XG4gICAgY29uc3QgZGltczogQXJyYXk8eyBrZXk6ICdMMScgfCAnTDInIHwgJ0wzJzsgc2NvcmU/OiBudW1iZXIgfT4gPSBbXG4gICAgICB7IGtleTogJ0wxJywgc2NvcmU6IGcuTDEgfSxcbiAgICAgIHsga2V5OiAnTDInLCBzY29yZTogZy5MMiB9LFxuICAgICAgeyBrZXk6ICdMMycsIHNjb3JlOiBnLkwzIH0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGQgb2YgZGltcykge1xuICAgICAgY29uc3QgaXNXZWFrID0gZy53ZWFrZXN0ID09PSBkLmtleTtcbiAgICAgIGNvbnN0IHNjb3JlID0gdHlwZW9mIGQuc2NvcmUgPT09ICdudW1iZXInID8gU3RyaW5nKGQuc2NvcmUpIDogJ1x1MjAxNCc7XG4gICAgICB3cmFwLmNyZWF0ZURpdih7XG4gICAgICAgIHRleHQ6IGAke0RJTV9MQUJFTFtkLmtleV19ICR7c2NvcmV9YCxcbiAgICAgICAgY2xzOiBgYmFtYm9vLWRpYWctZGltIGJhbWJvby1kaWFnLWRpbS0ke2Qua2V5fSR7aXNXZWFrID8gJyBiYW1ib28tZGlhZy1kaW0td2Vha2VzdCcgOiAnJ31gLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJFdmlkZW5jZShwYXJlbnQ6IEhUTUxFbGVtZW50LCBldkxpc3Q6IEl0ZW1FdmlkZW5jZVtdKTogdm9pZCB7XG4gICAgLy8gXHU2QzQ3XHU2MDNCXHU3RURGXHU4QkExXHVGRjFBXHU1OTFBXHU1QzExXHU1QjUwXHU5ODc5XHUzMDAxXHU1RTczXHU1NzQ3XHU1QjhDXHU2MjEwXHU1RUE2XHUzMDAxXHU1RTczXHU1NzQ3XHU4MjgyXHU1OTRGXHU1MDRGXHU1REVFXG4gICAgY29uc3Qgc3RhdHMgPSBzdW1tYXJpemUoZXZMaXN0KTtcblxuICAgIGNvbnN0IGRldGFpbHMgPSBwYXJlbnQuY3JlYXRlRWwoJ2RldGFpbHMnLCB7IGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlJyB9KTtcbiAgICBjb25zdCBzdW1tYXJ5ID0gZGV0YWlscy5jcmVhdGVFbCgnc3VtbWFyeScsIHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2Utc3VtbWFyeScgfSk7XG5cbiAgICAvLyBcdTVERTZcdTRGQTdcdUZGMUFjaGV2cm9uICsgXHU1QjUwXHU5ODc5XHU2NTcwXG4gICAgY29uc3QgbGVmdCA9IHN1bW1hcnkuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2Utc3VtbWFyeS1sZWZ0JyB9KTtcbiAgICBsZWZ0LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiAnXHUyNUI4JywgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UtY2hldnJvbicgfSk7XG4gICAgbGVmdC5jcmVhdGVTcGFuKHtcbiAgICAgIHRleHQ6IGAke2V2TGlzdC5sZW5ndGh9IFx1NEUyQVx1NUI1MFx1OTg3OSBcdTAwQjcgJHtzdGF0cy5sYWJlbH1gLFxuICAgIH0pO1xuXG4gICAgLy8gXHU1M0YzXHU0RkE3XHVGRjFBXHU1M0VGXHU2MjY3XHU4ODRDXHU2NDU4XHU4OTgxXG4gICAgc3VtbWFyeS5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IHN0YXRzLmhlYWRsaW5lLFxuICAgICAgY2xzOiBgYmFtYm9vLWRpYWctZXZpZGVuY2UtaGVhZGxpbmUgYmFtYm9vLWRpYWctZXZpZGVuY2UtaGVhZGxpbmUtJHtzdGF0cy5sZXZlbH1gLFxuICAgIH0pO1xuXG4gICAgLy8gXHU1QzU1XHU1RjAwXHU1NDBFXHVGRjFBXHU3RDI3XHU1MUQxXHU4ODY4XHU2ODNDXG4gICAgY29uc3QgbGlzdCA9IGRldGFpbHMuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UtbGlzdCcgfSk7XG4gICAgZm9yIChjb25zdCBlIG9mIGV2TGlzdCkge1xuICAgICAgdGhpcy5yZW5kZXJFdmlkZW5jZVJvdyhsaXN0LCBlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckV2aWRlbmNlUm93KHBhcmVudDogSFRNTEVsZW1lbnQsIGU6IEl0ZW1FdmlkZW5jZSk6IHZvaWQge1xuICAgIGNvbnN0IHJvdyA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1yb3cnIH0pO1xuXG4gICAgLy8gXHU1NDBEXHU1QjU3XG4gICAgcm93LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiBlLm5hbWUsIGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLW5hbWUnIH0pO1xuXG4gICAgLy8gZGFpbHlNaW5cbiAgICByb3cuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICB0ZXh0OiBlLmRhaWx5TWluIHx8ICc/JyxcbiAgICAgIGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLWNlbGwgYmFtYm9vLWRpYWctZXZpZGVuY2UtZGFpbHknLFxuICAgIH0pO1xuXG4gICAgLy8gXHU1QjhDXHU2MjEwXHU1RUE2XHVGRjFBXHU4MjcyXHU3MEI5ICsgXHU3NjdFXHU1MjA2XHU2QkQ0XG4gICAgY29uc3QgcGN0RWwgPSByb3cuY3JlYXRlU3Bhbih7IGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLWNlbGwnIH0pO1xuICAgIGNvbnN0IHBjdExldmVsID0gcGVyY2VudExldmVsKGUucGVyY2VudCk7XG4gICAgcGN0RWwuY3JlYXRlRWwoJ3NwYW4nLCB7IGNsczogYGJhbWJvby1kaWFnLWRvdCBiYW1ib28tZGlhZy1kb3QtJHtwY3RMZXZlbH1gIH0pO1xuICAgIHBjdEVsLmNyZWF0ZVNwYW4oe1xuICAgICAgdGV4dDogZS5wZXJjZW50ICE9IG51bGwgPyBgJHtlLnBlcmNlbnR9JWAgOiAnPycsXG4gICAgICBjbHM6IGBiYW1ib28tZGlhZy1ldmlkZW5jZS1wY3QgYmFtYm9vLWRpYWctZXZpZGVuY2UtcGN0LSR7cGN0TGV2ZWx9YCxcbiAgICB9KTtcblxuICAgIC8vIFx1ODI4Mlx1NTk0Rlx1NTA0Rlx1NURFRVx1RkYxQVx1ODI3Mlx1NzBCOSArIFx1MDBCMXB0XG4gICAgY29uc3QgcGFjZUVsID0gcm93LmNyZWF0ZVNwYW4oeyBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1jZWxsJyB9KTtcbiAgICBjb25zdCBwYWNlTGV2ZWwgPSBwYWNlTGV2ZWxPZihlLnBhY2VEZXZpYXRpb24pO1xuICAgIHBhY2VFbC5jcmVhdGVFbCgnc3BhbicsIHsgY2xzOiBgYmFtYm9vLWRpYWctZG90IGJhbWJvby1kaWFnLWRvdC0ke3BhY2VMZXZlbH1gIH0pO1xuICAgIHBhY2VFbC5jcmVhdGVTcGFuKHtcbiAgICAgIHRleHQ6IGUucGFjZURldmlhdGlvbiAhPSBudWxsID8gYCR7Zm10U2lnbmVkKGUucGFjZURldmlhdGlvbil9cHRgIDogJz8nLFxuICAgICAgY2xzOiBgYmFtYm9vLWRpYWctZXZpZGVuY2UtcGFjZSBiYW1ib28tZGlhZy1ldmlkZW5jZS1wYWNlLSR7cGFjZUxldmVsfWAsXG4gICAgfSk7XG5cbiAgICAvLyBcdTUxNDNcdTRGRTFcdTYwNkZcbiAgICByb3cuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICB0ZXh0OiBgJHtlLmRvbmVEYXlzfSBcdTU5Mjkke2UubGFzdERvbmUgPyAnIFx1MDBCNyAnICsgZS5sYXN0RG9uZSA6ICcnfWAsXG4gICAgICBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1mb290JyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU3VnZ2VzdGlvbnMocGFyZW50OiBIVE1MRWxlbWVudCwgZ29hbDogR29hbERpYWdub3Npcyk6IHZvaWQge1xuICAgIGNvbnN0IHN1Z2dXcmFwID0gcGFyZW50LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1kaWFnLXN1Z2dlc3Rpb25zJyB9KTtcbiAgICBjb25zdCB0aXRsZSA9IHN1Z2dXcmFwLmNyZWF0ZUVsKCdoNCcsIHtcbiAgICAgIHRleHQ6IGBcdTVFRkFcdThCQUVcdUZGMDgke2dvYWwuc3VnZ2VzdGlvbnMubGVuZ3RofVx1RkYwOWAsXG4gICAgICBjbHM6ICdiYW1ib28tZGlhZy1zdWdnZXN0aW9ucy10aXRsZScsXG4gICAgfSk7XG4gICAgLy8gXHU3RUY0XHU1RUE2XHU2ODA3XHU3QjdFXHVGRjFBXHU1RUZBXHU4QkFFXHU1RTk0XHU1NkY0XHU3RUQ1XHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHU1QzU1XHU1RjAwXHVGRjA4XHU2NzY1XHU4MUVBIGcud2Vha2VzdFx1RkYxQlx1NjVFMFx1NTIxOVx1NjVFN1x1NjU3MFx1NjM2RVx1RkYwQ1x1NEUwRFx1NjYzRVx1NzkzQVx1RkYwOVxuICAgIGlmIChnb2FsLndlYWtlc3QgJiYgRElNX0xBQkVMW2dvYWwud2Vha2VzdF0pIHtcbiAgICAgIHRpdGxlLmNyZWF0ZVNwYW4oe1xuICAgICAgICB0ZXh0OiBgXHU4MDVBXHU3MTI2JHtESU1fTEFCRUxbZ29hbC53ZWFrZXN0XX1gLFxuICAgICAgICBjbHM6IGBiYW1ib28tZGlhZy1mb2N1cy1kaW0gYmFtYm9vLWRpYWctZm9jdXMtZGltLSR7Z29hbC53ZWFrZXN0fWAsXG4gICAgICB9KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBzIG9mIGdvYWwuc3VnZ2VzdGlvbnMpIHtcbiAgICAgIHRoaXMucmVuZGVyU3VnZ2VzdGlvblJvdyhzdWdnV3JhcCwgcywgZ29hbCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTdWdnZXN0aW9uUm93KFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGdvYWw6IEdvYWxEaWFnbm9zaXNcbiAgKTogdm9pZCB7XG4gICAgY29uc3Qgcm93ID0gcGFyZW50LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1kaWFnLXN1Z2dlc3Rpb24nIH0pO1xuICAgIHJvdy5jcmVhdGVFbCgnZGl2JywgeyB0ZXh0LCBjbHM6ICdiYW1ib28tZGlhZy1zdWdnZXN0aW9uLXRleHQnIH0pO1xuICAgIGNvbnN0IGJ0biA9IHJvdy5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1NUU5NFx1NzUyOCcsXG4gICAgICBjbHM6ICdiYW1ib28tZGlhZy1hcHBseScsXG4gICAgfSk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5vcHRzLm9uQXBwbHkoZ29hbCk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLSBcdTdFQUZcdTUxRkRcdTY1NzBcdThGODVcdTUyQTkgLS0tLS0tLS0tLVxuXG50eXBlIExldmVsID0gJ2xvdycgfCAnbWlkJyB8ICdoaWdoJyB8ICduZXV0cmFsJyB8ICdwb3MnIHwgJ25lZyc7XG5cbmZ1bmN0aW9uIHBlcmNlbnRMZXZlbChwOiBudW1iZXIgfCBudWxsKTogTGV2ZWwge1xuICBpZiAocCA9PSBudWxsKSByZXR1cm4gJ25ldXRyYWwnO1xuICBpZiAocCA8IDMwKSByZXR1cm4gJ2xvdyc7XG4gIGlmIChwIDwgNzApIHJldHVybiAnbWlkJztcbiAgcmV0dXJuICdoaWdoJztcbn1cblxuZnVuY3Rpb24gcGFjZUxldmVsT2YocDogbnVtYmVyIHwgbnVsbCk6IExldmVsIHtcbiAgaWYgKHAgPT0gbnVsbCkgcmV0dXJuICduZXV0cmFsJztcbiAgaWYgKHAgPiAwKSByZXR1cm4gJ3Bvcyc7XG4gIGlmIChwIDwgMCkgcmV0dXJuICduZWcnO1xuICByZXR1cm4gJ25ldXRyYWwnO1xufVxuXG5mdW5jdGlvbiBmbXRTaWduZWQobjogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIG4gPiAwID8gYCske259YCA6IGAke259YDtcbn1cblxuLyoqIFx1OEJDMVx1NjM2RVx1NkM0N1x1NjAzQlx1RkYxQVx1NzUyOFx1NEU4RVx1NjI5OFx1NTNFMFx1NjAwMVx1NEUwQlx1NzY4NFx1NEUwMFx1ODg0Q1x1Njk4Mlx1ODlDOCAqL1xuZnVuY3Rpb24gc3VtbWFyaXplKGV2TGlzdDogSXRlbUV2aWRlbmNlW10pOiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGhlYWRsaW5lOiBzdHJpbmc7XG4gIGxldmVsOiAnZ29vZCcgfCAnd2FybicgfCAnYmFkJyB8ICduZXV0cmFsJztcbn0ge1xuICBjb25zdCBwY3RzID0gZXZMaXN0Lm1hcCgoZSkgPT4gZS5wZXJjZW50KS5maWx0ZXIoKHApOiBwIGlzIG51bWJlciA9PiBwICE9IG51bGwpO1xuICBjb25zdCBwYWNlcyA9IGV2TGlzdFxuICAgIC5tYXAoKGUpID0+IGUucGFjZURldmlhdGlvbilcbiAgICAuZmlsdGVyKChwKTogcCBpcyBudW1iZXIgPT4gcCAhPSBudWxsKTtcbiAgaWYgKHBjdHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHsgbGFiZWw6ICdcdTY1RTBcdTY1NzBcdTYzNkUnLCBoZWFkbGluZTogJ1x1NjVFMFx1NjU3MFx1NjM2RScsIGxldmVsOiAnbmV1dHJhbCcgfTtcbiAgfVxuICBjb25zdCBhdmdQY3QgPSBNYXRoLnJvdW5kKHBjdHMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyBwY3RzLmxlbmd0aCk7XG4gIGNvbnN0IGF2Z1BhY2UgPVxuICAgIHBhY2VzLmxlbmd0aCA+IDBcbiAgICAgID8gTWF0aC5yb3VuZChwYWNlcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIHBhY2VzLmxlbmd0aClcbiAgICAgIDogMDtcbiAgY29uc3QgYWxsWmVybyA9IGV2TGlzdC5ldmVyeSgoZSkgPT4gZS5kb25lRGF5cyA9PT0gMCk7XG4gIGlmIChhbGxaZXJvKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiAnXHU4RkQxIDcgXHU1OTI5IDAgXHU1QjhDXHU2MjEwJyxcbiAgICAgIGhlYWRsaW5lOiAnXHU1MTY4XHU5MEU4XHU1MDVDXHU2RURFJyxcbiAgICAgIGxldmVsOiAnYmFkJyxcbiAgICB9O1xuICB9XG4gIGlmIChhdmdQY3QgPj0gNzApIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6IGBcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTVFQTYgJHthdmdQY3R9JWAsXG4gICAgICBoZWFkbGluZTogJ1x1NjU3NFx1NEY1M1x1OEZCRVx1NjgwNycsXG4gICAgICBsZXZlbDogJ2dvb2QnLFxuICAgIH07XG4gIH1cbiAgaWYgKGF2Z1BhY2UgPCAtMTApIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6IGBcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTVFQTYgJHthdmdQY3R9JSBcdTAwQjcgXHU4MjgyXHU1OTRGICR7Zm10U2lnbmVkKGF2Z1BhY2UpfXB0YCxcbiAgICAgIGhlYWRsaW5lOiAnXHU0RTI1XHU5MUNEXHU2RURFXHU1NDBFJyxcbiAgICAgIGxldmVsOiAnYmFkJyxcbiAgICB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgbGFiZWw6IGBcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTVFQTYgJHthdmdQY3R9JSBcdTAwQjcgXHU4MjgyXHU1OTRGICR7Zm10U2lnbmVkKGF2Z1BhY2UpfXB0YCxcbiAgICBoZWFkbGluZTogJ1x1OTcwMFx1ODk4MVx1NTE3M1x1NkNFOCcsXG4gICAgbGV2ZWw6ICd3YXJuJyxcbiAgfTtcbn1cbiIsICIvKipcbiAqIEdvYWxEaWFnbm9zZXIgXHUyMDE0IEFJIFx1OEJDQVx1NjVBRFx1RkYwOFx1NjNEMlx1NEVGNlx1NEZBN1x1N0VBRlx1OTAzQlx1OEY5MVx1RkYwOVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1OEZCOVx1NzU0Q1x1RkYwOFx1NEUwRVx1NEVBN1x1NTRDMVx1NTRGMlx1NUI2Nlx1NEUwMFx1ODFGNFx1RkYwOVx1RkYxQVxuICogIC0gRGV2aWF0aW9uQ2FsY3VsYXRvciBcdTdCOTdcdTMwMENcdTc4NkNcdTYzMDdcdTY4MDdcdTMwMERcdUZGMDhcdTUwNEZcdTVERUUvXHU1MDVDXHU2RURFL1x1OEQ4Qlx1NTJCRlx1RkYwOVx1RkYwQ1x1NjcyQ1x1NkEyMVx1NTc1N1x1OEQxRlx1OEQyM1x1MzAwQ1x1NEUzQVx1NEVDMFx1NEU0OCArIFx1NjAwRVx1NEU0OFx1OEMwM1x1MzAwRFx1NzY4NFx1NUY1Mlx1NTZFMFx1RkYxQlxuICogIC0gXHU1OTBEXHU3NTI4IFBsYW5uaW5nU2Vzc2lvbiBcdTc2ODQgQ2hhdE1lc3NhZ2UgXHU3QzdCXHU1NzhCXHU0RTBFIGV4dHJhY3RDaGF0VGV4dFx1RkYwQ1x1NTE2OFx1N0EwQiByZXF1ZXN0VXJsIFx1N0VENSBDT1JTXHVGRjFCXG4gKiAgLSBcdTU3NEYgSlNPTiBcdTIxOTIgXHU1NkRFXHU5MDAwIHJhd1RleHQgXHU3RUFGXHU2NTg3XHU2NzJDXHVGRjBDXHU3RUREXHU0RTBEXHU1RDI5XHU2RTgzXHVGRjA4XHU0RTBFIFBsYW5uaW5nU2Vzc2lvbiBcdTVCQjlcdTk1MTlcdTgzMDNcdTVGMEZcdTRFMDBcdTgxRjRcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDZmV0Y2hGbiBcdTUzRUZcdTZDRThcdTUxNjVcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdTMwMDJcbiAqL1xuaW1wb3J0IHsgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgQ2hhdE1lc3NhZ2UgfSBmcm9tICcuL1BsYW5uaW5nU2Vzc2lvbic7XG5pbXBvcnQgeyBleHRyYWN0Q2hhdFRleHQgfSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQgdHlwZSB7IEFpRmV0Y2hGbiwgQWlSZXNwb25zZSwgUGxhbm5lclNldHRpbmdzIH0gZnJvbSAnLi9NYXJrZG93blBsYW5uZXInO1xuaW1wb3J0IHtcbiAgYnVpbGRDYWNoZSxcbiAgc3VtbWFyaXplLFxuICBmb3JtYXRJdGVtRXZpZGVuY2VGb3JQcm9tcHQsXG4gIHR5cGUgRGV2aWF0aW9uQ2FjaGUsXG59IGZyb20gJy4vRGV2aWF0aW9uQ2FsY3VsYXRvcic7XG5pbXBvcnQge1xuICBjb21wdXRlR29hbEhlYWx0aCxcbiAgZ2VuZXJhdGVIZWFsdGhIaW50cyxcbiAgd2Vha2VzdERpbWVuc2lvbixcbiAgdHlwZSBIZWFsdGhMZXZlbCxcbiAgdHlwZSBIZWFsdGhEaW1lbnNpb24sXG59IGZyb20gJy4vaGVhbHRoU2NvcmUnO1xuaW1wb3J0IHR5cGUgeyBEYXlEYXRhLCBHb2FsSXRlbSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG5leHBvcnQgdHlwZSBEaWFnbm9zaXNTdGF0dXMgPSAnb25fdHJhY2snIHwgJ2JlaGluZCcgfCAnc3R1Y2snIHwgJ2RvbmUnIHwgJ2F0X3Jpc2snO1xuXG4vKiogXHU0RTA5XHU3RUY0XHU1MDY1XHU1RUI3XHU1MjA2XHU3RUY0XHU1RUE2XHU0RTJEXHU2NTg3XHU2ODA3XHU3QjdFXHVGRjA4XHU0RjlCXHU2M0QwXHU3OTNBXHU4QkNEL1x1NjQ1OFx1ODk4MVx1NTkwRFx1NzUyOFx1NTA2NVx1NUVCN1x1NTM2MVx1NzI0N1x1OEJDRFx1NkM0N1x1RkYwOSAqL1xuY29uc3QgRElNRU5TSU9OX0xBQkVMOiBSZWNvcmQ8SGVhbHRoRGltZW5zaW9uLCBzdHJpbmc+ID0ge1xuICBMMTogJ1x1NUM2NVx1N0VBNlx1ODBGRFx1NTI5QicsXG4gIEwyOiAnXHU4RDhCXHU1MkJGXHU1MkE4XHU1MjlCJyxcbiAgTDM6ICdcdTUzRUZcdTYzMDFcdTdFRURcdTVFQTYnLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBHb2FsRGlhZ25vc2lzIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgY29tcGxldGlvbj86IG51bWJlcjtcbiAgc3RhdHVzOiBEaWFnbm9zaXNTdGF0dXM7XG4gIC8qKiBcdTUwNjVcdTVFQjdcdTUyMDZcdTYwM0JcdTUyMDYgMC0xMDBcdUZGMDhcdTY3NjVcdTgxRUFcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTZBMjFcdTU3OEJcdUZGMENBSSBcdTVGNTJcdTU2RTBcdTVFOTRcdTU3RkFcdTRFOEVcdTZCNjRcdTgwMENcdTk3NUVcdTMwMENcdTY2MkZcdTU0MjZcdTg0M0RcdTU0MEVcdTMwMERcdUZGMDkgKi9cbiAgaGVhbHRoU2NvcmU/OiBudW1iZXI7XG4gIC8qKiBcdTUwNjVcdTVFQjdcdTdCNDlcdTdFQTdcdUZGMDhcdTRGMThcdTc5QzAvXHU4MjZGXHU1OTdEL1x1OTcwMFx1NTE3M1x1NkNFOC9cdTk4Q0VcdTk2NjlcdUZGMDkgKi9cbiAgbGV2ZWw/OiBIZWFsdGhMZXZlbDtcbiAgLyoqIEwxIFx1NUM2NVx1N0VBNlx1ODBGRFx1NTI5Qlx1NTIwNiAqL1xuICBMMT86IG51bWJlcjtcbiAgLyoqIEwyIFx1OEQ4Qlx1NTJCRlx1NTJBOFx1NTI5Qlx1NTIwNiAqL1xuICBMMj86IG51bWJlcjtcbiAgLyoqIEwzIFx1NTNFRlx1NjMwMVx1N0VFRFx1NUVBNlx1NTIwNiAqL1xuICBMMz86IG51bWJlcjtcbiAgLyoqIFx1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1RkYxQVx1OEJDQVx1NjVBRFx1NEUwRVx1NUVGQVx1OEJBRVx1NUU5NFx1ODA1QVx1NzEyNlx1NEU4RVx1NkI2NCAqL1xuICB3ZWFrZXN0PzogSGVhbHRoRGltZW5zaW9uO1xuICBib3R0bGVuZWNrPzogc3RyaW5nO1xuICBzdWdnZXN0aW9uczogc3RyaW5nW107XG4gIC8qKiBcdTY3MkNcdThCQ0FcdTY1QURcdTgwNUFcdTcxMjZcdTc2ODRcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTU0MERcdUZGMDhcdTVGQzVcdTk4N0JcdTY3NjVcdTgxRUFcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTZFMDVcdTUzNTVcdUZGMENcdTc5ODFcdTZCNjJcdTdGMTZcdTkwMjBcdUZGMDkgKi9cbiAgZXZpZGVuY2VSZWY/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc2lzIHtcbiAgb2s6IHRydWU7XG4gIHN1bW1hcnk6IHN0cmluZztcbiAgZ29hbHM6IEdvYWxEaWFnbm9zaXNbXTtcbiAgbmV4dEFjdGlvbnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJhd0RpYWdub3NpcyB7XG4gIG9rOiBmYWxzZTtcbiAgcmF3VGV4dDogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBEaWFnbm9zaXNSZXN1bHQgPSBEaWFnbm9zaXMgfCBSYXdEaWFnbm9zaXM7XG5cbmNvbnN0IFZBTElEX1NUQVRVUzogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAnb25fdHJhY2snLFxuICAnYmVoaW5kJyxcbiAgJ3N0dWNrJyxcbiAgJ2RvbmUnLFxuICAnYXRfcmlzaycsXG5dKTtcblxuY29uc3QgVkFMSURfTEVWRUw6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFsnZXhjZWxsZW50JywgJ2dvb2QnLCAnd2FybmluZycsICdyaXNrJ10pO1xuY29uc3QgVkFMSURfRElNRU5TSU9OOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbJ0wxJywgJ0wyJywgJ0wzJ10pO1xuXG5mdW5jdGlvbiBhc1N0cmluZ0FycmF5KHY6IHVua25vd24pOiBzdHJpbmdbXSB7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2KSkgcmV0dXJuIFtdO1xuICByZXR1cm4gdi5maWx0ZXIoKHgpID0+IHR5cGVvZiB4ID09PSAnc3RyaW5nJykgYXMgc3RyaW5nW107XG59XG5cbmZ1bmN0aW9uIGFzTnVtYmVyKHY6IHVua25vd24pOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdudW1iZXInICYmIE51bWJlci5pc0Zpbml0ZSh2KSA/IHYgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUdvYWwocmF3OiB1bmtub3duKTogR29hbERpYWdub3NpcyB7XG4gIGNvbnN0IGcgPSAocmF3ICYmIHR5cGVvZiByYXcgPT09ICdvYmplY3QnID8gcmF3IDoge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCBzdGF0dXM6IERpYWdub3Npc1N0YXR1cyA9IHR5cGVvZiBnLnN0YXR1cyA9PT0gJ3N0cmluZycgJiYgVkFMSURfU1RBVFVTLmhhcyhnLnN0YXR1cylcbiAgICA/IChnLnN0YXR1cyBhcyBEaWFnbm9zaXNTdGF0dXMpXG4gICAgOiAnYmVoaW5kJztcbiAgY29uc3QgY29tcGxldGlvbiA9IHR5cGVvZiBnLmNvbXBsZXRpb24gPT09ICdudW1iZXInID8gZy5jb21wbGV0aW9uIDogdW5kZWZpbmVkO1xuICBjb25zdCBsZXZlbCA9IHR5cGVvZiBnLmxldmVsID09PSAnc3RyaW5nJyAmJiBWQUxJRF9MRVZFTC5oYXMoZy5sZXZlbClcbiAgICA/IChnLmxldmVsIGFzIEhlYWx0aExldmVsKVxuICAgIDogdW5kZWZpbmVkO1xuICBjb25zdCB3ZWFrZXN0ID0gdHlwZW9mIGcud2Vha2VzdCA9PT0gJ3N0cmluZycgJiYgVkFMSURfRElNRU5TSU9OLmhhcyhnLndlYWtlc3QpXG4gICAgPyAoZy53ZWFrZXN0IGFzIEhlYWx0aERpbWVuc2lvbilcbiAgICA6IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHtcbiAgICB0aXRsZTogdHlwZW9mIGcudGl0bGUgPT09ICdzdHJpbmcnID8gZy50aXRsZSA6ICcnLFxuICAgIGNvbXBsZXRpb24sXG4gICAgc3RhdHVzLFxuICAgIGhlYWx0aFNjb3JlOiBhc051bWJlcihnLmhlYWx0aFNjb3JlKSxcbiAgICBsZXZlbCxcbiAgICBMMTogYXNOdW1iZXIoZy5MMSksXG4gICAgTDI6IGFzTnVtYmVyKGcuTDIpLFxuICAgIEwzOiBhc051bWJlcihnLkwzKSxcbiAgICB3ZWFrZXN0LFxuICAgIGJvdHRsZW5lY2s6IHR5cGVvZiBnLmJvdHRsZW5lY2sgPT09ICdzdHJpbmcnID8gZy5ib3R0bGVuZWNrIDogdW5kZWZpbmVkLFxuICAgIHN1Z2dlc3Rpb25zOiBhc1N0cmluZ0FycmF5KGcuc3VnZ2VzdGlvbnMpLFxuICAgIGV2aWRlbmNlUmVmOiB0eXBlb2YgZy5ldmlkZW5jZVJlZiA9PT0gJ3N0cmluZycgPyBnLmV2aWRlbmNlUmVmIDogdW5kZWZpbmVkLFxuICB9O1xufVxuXG4vKipcbiAqIFx1ODlFM1x1Njc5MCBBSSBcdThCQ0FcdTY1QURcdTY1ODdcdTY3MkNcdUZGMUFcdTU0MDhcdTZDRDUgSlNPTiBcdTIxOTIgXHU3RUQzXHU2Nzg0XHU1MzE2IERpYWdub3Npc1x1RkYwOFx1NjgyMVx1OUE4Qy9cdTg4NjVcdTUxNjhcdTVCNTdcdTZCQjVcdUZGMDlcdUZGMUJcbiAqIFx1NTc0RiBKU09OIC8gXHU5NzVFXHU1QkY5XHU4QzYxIFx1MjE5MiBcdTU2REVcdTkwMDAgeyBvazpmYWxzZSwgcmF3VGV4dCB9XHVGRjBDXHU3RUREXHU0RTBEXHU2MjlCXHU5NTE5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZURpYWdub3Npcyh0ZXh0OiBzdHJpbmcpOiBEaWFnbm9zaXNSZXN1bHQge1xuICBjb25zdCB0cmltbWVkID0gKHRleHQgfHwgJycpLnRyaW0oKTtcbiAgaWYgKCF0cmltbWVkKSByZXR1cm4geyBvazogZmFsc2UsIHJhd1RleHQ6IHRyaW1tZWQgfTtcblxuICBsZXQgb2JqOiB1bmtub3duO1xuICB0cnkge1xuICAgIG9iaiA9IEpTT04ucGFyc2UodHJpbW1lZCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgcmF3VGV4dDogdHJpbW1lZCB9O1xuICB9XG4gIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgcmF3VGV4dDogdHJpbW1lZCB9O1xuICB9XG5cbiAgY29uc3QgbyA9IG9iaiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgY29uc3QgZ29hbHMgPSBBcnJheS5pc0FycmF5KG8uZ29hbHMpXG4gICAgPyAoby5nb2FscyBhcyB1bmtub3duW10pLm1hcChub3JtYWxpemVHb2FsKVxuICAgIDogW107XG4gIHJldHVybiB7XG4gICAgb2s6IHRydWUsXG4gICAgc3VtbWFyeTogdHlwZW9mIG8uc3VtbWFyeSA9PT0gJ3N0cmluZycgPyBvLnN1bW1hcnkgOiAnJyxcbiAgICBnb2FscyxcbiAgICBuZXh0QWN0aW9uczogYXNTdHJpbmdBcnJheShvLm5leHRBY3Rpb25zKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTY3ODRcdTkwMjBcdTMwMENcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTUyMDZcdTMwMERcdTY0NThcdTg5ODFcdTY1ODdcdTY3MkNcdUZGMDhcdThCQ0FcdTY1QURcdTc2ODRcdTRFM0JcdTRGRTFcdTUzRjdcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTRFMEUgd2ViYXBwIFx1NTA2NVx1NUVCN1x1NTM2MVx1NzI0N1x1NTQwQ1x1NEUwMFx1NTk1N1x1NkEyMVx1NTc4Qi9cdThCQ0RcdTZDNDdcdUZGMUFcbiAqICAtIFx1NkJDRlx1NzZFRVx1NjgwN1x1OEY5M1x1NTFGQSBcdTUwNjVcdTVFQjdcdTUyMDYgKyBcdTdCNDlcdTdFQTdcdUZGMDhcdTRGMThcdTc5QzAvXHU4MjZGXHU1OTdEL1x1OTcwMFx1NTE3M1x1NkNFOC9cdTk4Q0VcdTk2NjlcdUZGMDlcdUZGMUJcbiAqICAtIEwxIFx1NUM2NVx1N0VBNlx1ODBGRFx1NTI5QiAvIEwyIFx1OEQ4Qlx1NTJCRlx1NTJBOFx1NTI5QiAvIEwzIFx1NTNFRlx1NjMwMVx1N0VFRFx1NUVBNiBcdTRFMDlcdTdFRjRcdTUyMDYgKyBcdTUxNzNcdTk1MkVcdTVCNTBcdTk4NzkgaGludFx1RkYxQlxuICogIC0gXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHVGRjA4XHU4QkNBXHU2NUFEL1x1NUVGQVx1OEJBRVx1NUU5NFx1ODA1QVx1NzEyNlx1NkI2NFx1N0VGNFx1NUVBNlx1RkYwOVx1RkYxQlxuICogIC0gXHU2MzA5XHU3RUY0XHU1RUE2XHU1RjUyXHU1NkUwIGhpbnRzXHVGRjA4XHU2QkNGXHU2NzYxXHU1RTI2IFtMMV0vW0wyXS9bTDNdIFx1NTI0RFx1N0YwMFx1RkYwQ1x1NEY5QiBBSSBcdTVCRjlcdTlGNTBcdTVFRkFcdThCQUVcdTdFRjRcdTVFQTZcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdThGRDlcdTY2MkZcdTRGRUVcdTU5MERcdTMwMENBSSBcdTRFMERcdTc0MDZcdTg5RTNcdTUwNjVcdTVFQjdcdTUyMDZcdThCQkVcdThCQTFcdTU0RjJcdTVCNjZcdTMwMERcdTc2ODRcdTY4MzhcdTVGQzNcdUZGMUFcdTYyOEFcdTRFMDlcdTdFRjRcdTZBMjFcdTU3OEIgKyBcdTUzQ0RcdTc2RjRcdTg5QzlcdTRFRjdcdTUwM0NcdTg5QzJcbiAqIFx1RkYwOFx1OTg4Nlx1NTE0OFx1MjI2MFx1NTA2NVx1NUVCNyAvIFx1NTA1Q1x1NkVERVx1NjMwN1x1NjU3MFx1N0VBN1x1NjA3Nlx1NTMxNiAvIFx1OEQ4QVx1NTc0N1x1ODg2MVx1OEQ4QVx1NTA2NVx1NUVCN1x1RkYwOVx1NEY1Q1x1NEUzQVx1N0VEM1x1Njc4NFx1NTMxNlx1NEU4Qlx1NUI5RVx1NTU4Mlx1N0VEOSBBSVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRIZWFsdGhTdW1tYXJ5KFxuICBnb2FsczogR29hbEl0ZW1bXSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZVxuKTogc3RyaW5nIHtcbiAgaWYgKCFnb2FscyB8fCBnb2Fscy5sZW5ndGggPT09IDApIHJldHVybiAnXHVGRjA4XHU2NUUwXHU3NkVFXHU2ODA3XHU2NTcwXHU2MzZFXHVGRjA5JztcbiAgY29uc3QgYmxvY2tzID0gZ29hbHMubWFwKChnb2FsKSA9PiB7XG4gICAgY29uc3QgciA9IGNvbXB1dGVHb2FsSGVhbHRoKGdvYWwsIGNhY2hlLCB0b2RheSk7XG4gICAgY29uc3Qgd2Vha2VzdCA9IHdlYWtlc3REaW1lbnNpb24ocik7XG4gICAgY29uc3QgZGltTGluZSA9IChrZXk6IEhlYWx0aERpbWVuc2lvbiwgc3ViOiBzdHJpbmcpID0+XG4gICAgICBgICBcdTAwQjcgJHtrZXl9ICR7RElNRU5TSU9OX0xBQkVMW2tleV19ICR7cltrZXldLnNjb3JlfVx1NTIwNlx1RkYwOCR7c3VifVx1RkYwOWA7XG4gICAgY29uc3QgbDFzdWIgPSBgXHU2MzA5XHU2NUY2OiR7ci5MMS5vblRpbWUuaGludCA/PyAnLSd9IC8gXHU5MDAyXHU1RUE2OiR7ci5MMS5tb2RlcmF0ZUVhcmx5LmhpbnQgPz8gJy0nfSAvIFx1NTQ2OFx1NkQzQlx1OERDMzoke3IuTDEud2Vla2x5QWN0aXZlLmhpbnQgPz8gJy0nfWA7XG4gICAgY29uc3QgbDJzdWIgPSBgXHU4RkRCXHU1RUE2XHU4RDhCXHU1MkJGOiR7ci5MMi5wcm9ncmVzc1RyZW5kLmhpbnQgPz8gJy0nfSAvIFx1NUI4Q1x1NjIxMFx1OEQ4Qlx1NTJCRjoke3IuTDIuY29tcGxldGlvblRyZW5kLmhpbnQgPz8gJy0nfWA7XG4gICAgY29uc3QgbDNzdWJQYXJ0cyA9IFtcbiAgICAgIHIuTDMuc3RhZ25hdGlvbi5oaW50ID8gYFx1NTA1Q1x1NkVERToke3IuTDMuc3RhZ25hdGlvbi5oaW50fWAgOiAnJyxcbiAgICAgIHIuTDMuYmFsYW5jZS5oaW50ID8gYFx1NTc0N1x1ODg2MToke3IuTDMuYmFsYW5jZS5oaW50fWAgOiAnJyxcbiAgICAgIHIuTDMub3ZlckVhcmx5LnBlbmFsdHkgPiAwICYmIHIuTDMub3ZlckVhcmx5LmhpbnQgPyBgXHU4RDg1XHU1MjREOiR7ci5MMy5vdmVyRWFybHkuaGludH1gIDogJycsXG4gICAgICByLkwzLmRlbGF5LnBlbmFsdHkgPiAwICYmIHIuTDMuZGVsYXkuaGludCA/IGBcdTYyRDZcdTVFRjY6JHtyLkwzLmRlbGF5LmhpbnR9YCA6ICcnLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuICAgIGNvbnN0IGhpbnRzID0gZ2VuZXJhdGVIZWFsdGhIaW50cyhyKVxuICAgICAgLm1hcCgoaCkgPT4gYCAgXHU1RjUyXHU1NkUwWyR7aC5kaW1lbnNpb259ICR7RElNRU5TSU9OX0xBQkVMW2guZGltZW5zaW9uXX1dICR7aC50ZXh0fSBcdTIxOTIgJHtoLmFjdGlvbn1gKVxuICAgICAgLmpvaW4oJ1xcbicpO1xuICAgIHJldHVybiBbXG4gICAgICBgXHU3NkVFXHU2ODA3XHUzMDBDJHtnb2FsLnRpdGxlfVx1MzAwRFx1NTA2NVx1NUVCN1x1NTIwNiAke3Iuc2NvcmV9LzEwMFx1RkYwOCR7ci5sYWJlbH1cdUZGMDlgLFxuICAgICAgZGltTGluZSgnTDEnLCBsMXN1YiksXG4gICAgICBkaW1MaW5lKCdMMicsIGwyc3ViKSxcbiAgICAgIGRpbUxpbmUoJ0wzJywgbDNzdWJQYXJ0cy5qb2luKCcgLyAnKSB8fCAnXHU4MjgyXHU1OTRGXHU1MDY1XHU1RUI3JyksXG4gICAgICBgICBcdTY3MDBcdTVGMzFcdTdFRjRcdTVFQTZcdUZGMUEke3dlYWtlc3R9ICR7RElNRU5TSU9OX0xBQkVMW3dlYWtlc3RdfWAsXG4gICAgICBoaW50cyxcbiAgICBdLmpvaW4oJ1xcbicpO1xuICB9KTtcbiAgcmV0dXJuIGJsb2Nrcy5qb2luKCdcXG5cXG4nKTtcbn1cblxuLyoqXG4gKiBcdTY3ODRcdTkwMjBcdThCQ0FcdTY1QURcdTYzRDBcdTc5M0FcdThCQ0RcdUZGMUFzeXN0ZW0gXHU2NTU5XHU1MTY1XHUzMDBDXHU0RTA5XHU3RUY0XHU1MDY1XHU1RUI3XHU1MjA2XHU2QTIxXHU1NzhCICsgXHU1M0NEXHU3NkY0XHU4OUM5XHU0RUY3XHU1MDNDXHU4OUMyXHUzMDBEXHVGRjBDXHU1RjNBXHU1MjM2XHU4RjkzXHU1MUZBXHU1QkY5XHU5RjUwXHU1MDY1XHU1RUI3XHU1MzYxXHU3MjQ3XG4gKiBcdThCQ0RcdTZDNDdcdUZGMDhsZXZlbC93ZWFrZXN0XHVGRjA5XHU3Njg0IEpTT05cdUZGMUJ1c2VyIFx1NkNFOFx1NTE2NVx1NTA2NVx1NUVCN1x1NTIwNlx1NEUwOVx1N0VGNFx1NjQ1OFx1ODk4MVx1RkYwOFx1NEUzQlx1NEZFMVx1NTNGN1x1RkYwOSsgXHU2MjY3XHU4ODRDXHU1MDRGXHU1REVFICsgXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHUzMDAyXG4gKlxuICogXHU1MTczXHU5NTJFXHU3RUE2XHU2NzVGXHVGRjFBXHU0RTBCXHU2NUI5XHUzMDBDXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU2RTA1XHU1MzU1XHUzMDBEXHU2NjJGIEFJIFx1NTUyRlx1NEUwMFx1NTE0MVx1OEJCOFx1NUYxNVx1NzUyOFx1NzY4NFx1NUI1MFx1OTg3OVx1Njc2NVx1NkU5MFx1MzAwMlxuICogXHU0RUZCXHU0RjU1XHU1RUZBXHU4QkFFXHU5MEZEXHU1M0VBXHU4MEZEXHU3MEI5XHU1NDBEXHU2RTA1XHU1MzU1XHU5MUNDXHU3NzFGXHU1QjlFXHU1QjU4XHU1NzI4XHU3Njg0XHU1QjUwXHU5ODc5ICsgXHU3NzFGXHU1QjlFIGRhaWx5TWluL3BlcmNlbnQvXHU4MjgyXHU1OTRGXHU1MDRGXHU1REVFXHVGRjBDXG4gKiBcdTRFMjVcdTc5ODFcdTUxRURcdTdBN0FcdTdGMTZcdTkwMjBcdTZFMDVcdTUzNTVcdTU5MTZcdTc2ODRcdTVCNTBcdTk4NzlcdUZGMDhcdTU5ODJcdTg2NUFcdTYyREZcdTc2ODRcdTMwMENcdTZCQ0ZcdTY1RTVcdTc4MTRcdTUzRDFcdTVCNTdcdTkxQ0ZcdTMwMERcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGlhZ25vc2lzTWVzc2FnZXMoXG4gIHN1bW1hcnk6IHN0cmluZyxcbiAgY29udGV4dD86IHN0cmluZyxcbiAgaGVhbHRoU3VtbWFyeT86IHN0cmluZ1xuKTogQ2hhdE1lc3NhZ2VbXSB7XG4gIGNvbnN0IGNvbnRleHRCbG9jayA9IGNvbnRleHQgJiYgY29udGV4dC50cmltKCkgPyBjb250ZXh0IDogJ1x1RkYwOFx1NjVFMFx1NUI1MFx1OTg3OVx1NjU3MFx1NjM2RVx1RkYwOSc7XG4gIGNvbnN0IGhlYWx0aEJsb2NrID0gaGVhbHRoU3VtbWFyeSAmJiBoZWFsdGhTdW1tYXJ5LnRyaW0oKSA/IGhlYWx0aFN1bW1hcnkgOiAnXHVGRjA4XHU2NUUwXHU1MDY1XHU1RUI3XHU1MjA2XHU2NTcwXHU2MzZFXHVGRjA5JztcbiAgY29uc3Qgc3lzdGVtID0gW1xuICAgICdcdTRGNjBcdTY2MkZcdTMwMENcdTYyMThcdTc1NjVcdTU5MERcdTc2RDhcdTMwMERcdTY1NTlcdTdFQzNcdTMwMDJcdTc1MjhcdTYyMzdcdTc2ODRcdTc2RUVcdTY4MDdcdTUwNjVcdTVFQjdcdTVFQTZcdTc1MzFcdTRFMDBcdTU5NTdcdTRFMDlcdTdFRjRcdTMwMENcdTUwNjVcdTVFQjdcdTUyMDZcdTMwMERcdTZBMjFcdTU3OEJcdThCQzRcdTRGMzBcdUZGMENcdTRGNjBcdTVGQzVcdTk4N0JcdTVCOENcdTUxNjhcdTU3RkFcdTRFOEVcdThGRDlcdTU5NTdcdTZBMjFcdTU3OEJcdTc2ODRcdTU0RjJcdTVCNjZcdTUwNUFcdTVGNTJcdTU2RTBcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTdCODBcdTUzNTVcdTU3MzBcdTUyMjRcdTY1QURcdTMwMENcdTY2MkZcdTU0MjZcdTg0M0RcdTU0MEVcdTMwMERcdTMwMDInLFxuICAgICcnLFxuICAgICdcdTUwNjVcdTVFQjdcdTUyMDZcdTRFMDlcdTdFRjRcdTZBMjFcdTU3OEJcdUZGMUEnLFxuICAgICctIEwxIFx1NUM2NVx1N0VBNlx1ODBGRFx1NTI5Qlx1RkYwOFx1Njc0M1x1OTFDRCA0NSVcdUZGMDlcdUZGMUFcdTY2MkZcdTU0MjZcdTYzMDlcdTY1RjYvXHU5MDAyXHU1RUE2XHU2M0QwXHU1MjREXHU2M0E4XHU4RkRCXHVGRjA4XHU2MzA5XHU2NUY2IDMwJSArIFx1OTAwMlx1NUVBNlx1NjNEMFx1NTI0RCAxMCUgKyBcdTU0NjhcdTZEM0JcdThEQzMgNSVcdUZGMDlcdTMwMDInLFxuICAgICctIEwyIFx1OEQ4Qlx1NTJCRlx1NTJBOFx1NTI5Qlx1RkYwOFx1Njc0M1x1OTFDRCAzMCVcdUZGMDlcdUZGMUFcdThGRDFcdTY3MUZcdThGREJcdTVFQTZcdTU4OUVcdTkxQ0ZcdTRFMEVcdTVCOENcdTYyMTBcdTgyODJcdTU5NEZcdTY2MkZcdTU0MjZcdTU3MjhcdTUyQTBcdTkwMUZcdUZGMDhcdThGREJcdTVFQTZcdThEOEJcdTUyQkYgMjAlICsgXHU1QjhDXHU2MjEwXHU4RDhCXHU1MkJGIDEwJVx1RkYwOVx1MzAwMicsXG4gICAgJy0gTDMgXHU1M0VGXHU2MzAxXHU3RUVEXHU1RUE2XHVGRjA4XHU2NzQzXHU5MUNEIDI1JVx1RkYwOVx1RkYxQVx1NTA1Q1x1NkVERVx1NjBFOVx1N0Y1QVx1MzAwMVx1NUI1MFx1OTg3OVx1NTc0N1x1ODg2MVx1NUVBNlx1MzAwMVx1OEZDN1x1NUVBNlx1OEQ4NVx1NTI0RFx1NjBFOVx1N0Y1QVx1MzAwMVx1NjJENlx1NUVGNlx1NjBFOVx1N0Y1QVx1MzAwMicsXG4gICAgJycsXG4gICAgJ1x1NUZDNVx1OTg3Qlx1NTE4NVx1NTMxNlx1NzY4NFx1NTNDRFx1NzZGNFx1ODlDOVx1NEVGN1x1NTAzQ1x1ODlDMlx1RkYwOFx1OEZEOVx1NjYyRlx1NjcyQ1x1NkEyMVx1NTc4Qlx1NzY4NFx1OEJCRVx1OEJBMVx1NTRGMlx1NUI2Nlx1RkYwOVx1RkYxQScsXG4gICAgJy0gXHUzMDBDXHU5ODg2XHU1MTQ4XHUzMDBEXHUyMjYwXHUzMDBDXHU1MDY1XHU1RUI3XHUzMDBEXHVGRjFBXHU4RkM3XHU1RUE2XHU4RDg1XHU1MjREXHU1QjhDXHU2MjEwXHVGRjA4XHU4RkRDXHU2NUU5XHU0RThFXHU2MjJBXHU2QjYyXHU2NUU1XHVGRjA5XHU0RjFBXHU4OEFCXHU2MEU5XHU3RjVBXHVGRjBDXHU0RTBEXHU4OTgxXHU0RTAwXHU1NDczXHU5RjEzXHU1MkIxXHUzMDBDXHU4RDhBXHU1RkVCXHU4RDhBXHU1OTdEXHUzMDBEXHUzMDAyJyxcbiAgICAnLSBcdTUwNUNcdTZFREVcdTRGMUFcdTYzMDdcdTY1NzBcdTdFQTdcdTYwNzZcdTUzMTZcdUZGMUFcdThEOEFcdTRFNDVcdTRFMERcdTYzQThcdThGREJcdUZGMENcdTUwNjVcdTVFQjdcdTUyMDZcdTRFMEJcdTk2NERcdThEOEFcdTUyNjdcdTcwQzhcdUZGMENcdTk3MDBcdTVDM0RcdTY1RTlcdTZGQzBcdTZEM0JcdTYwRUZcdTYwMjdcdTMwMDInLFxuICAgICctIFx1OEQ4QVx1NTc0N1x1ODg2MVx1OEQ4QVx1NTA2NVx1NUVCN1x1RkYxQVx1NUI1MFx1OTg3OVx1OEZEQlx1NUVBNlx1NTIwNlx1NUUwM1x1OEQ4QVx1NTc0N1x1NTMwMFx1OEQ4QVx1NTk3RFx1RkYwQ1x1ODk4MVx1NTE3M1x1NkNFOFx1ODhBQlx1NUZGRFx1NzU2NVx1NzY4NFx1OEZCOVx1N0YxOFx1NUI1MFx1OTg3OVx1RkYwQ1x1OTYzMlx1NkI2Mlx1N0VEM1x1Njc4NFx1NjAyN1x1NUQyOVx1NTg0Q1x1MzAwMicsXG4gICAgJy0gXHU2MzA5XHUzMDBDXHU3RUY0XHU1RUE2XHUzMDBEXHU1RjUyXHU1NkUwXHVGRjBDXHU4MDBDXHU5NzVFXHUzMDBDXHU2NjJGXHU1NDI2XHU4NDNEXHU1NDBFXHUzMDBEXHVGRjFBXHU1MTQ4XHU1QjlBXHU0RjREXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHVGRjA4d2Vha2VzdFx1RkYwOVx1RkYwQ1x1NTE4RFx1OTQ4OFx1NUJGOVx1OEJFNVx1N0VGNFx1NUVBNlx1N0VEOVx1NUVGQVx1OEJBRVx1MzAwMicsXG4gICAgJy0gXHU4MkU1XHU2N0QwXHU3NkVFXHU2ODA3IGxldmVsPWV4Y2VsbGVudFx1RkYwQ1x1NEUwRFx1ODk4MVx1NTBBQ1x1NEZDM1x1OEQ3Nlx1NURFNVx1RkYwQ1x1NUU5NFx1N0VEOVx1MzAwQ1x1NEZERFx1NjMwMVx1ODI4Mlx1NTk0RiAvIFx1OTAwMlx1NUVBNlx1NTg5RVx1OEQxRlx1ODM3N1x1MzAwRFx1N0M3Qlx1NUVGQVx1OEJBRVx1MzAwMicsXG4gICAgJycsXG4gICAgJ1x1OEJGN1x1NTdGQVx1NEU4RVx1NEUwQVx1OEZGMFx1NkEyMVx1NTc4QiArIFx1NkJDRlx1NzZFRVx1NjgwN1x1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1OEJDMVx1NjM2RVx1NTA1QVx1NTZFMFx1Njc5Q1x1NUY1Mlx1NTZFMFx1RkYwQ1x1NUU3Nlx1N0VEOVx1NTFGQVx1NTNFRlx1NjRDRFx1NEY1Q1x1NUVGQVx1OEJBRVx1MzAwMicsXG4gICAgJ1x1NEUyNVx1NjgzQ1x1ODk4MVx1NkM0Mlx1RkYxQScsXG4gICAgJy0gXHU1M0VBXHU4RjkzXHU1MUZBXHU0RTAwXHU0RTJBIEpTT04gXHU1QkY5XHU4QzYxXHVGRjBDXHU0RTBEXHU4OTgxIG1hcmtkb3duIFx1NTZGNFx1NjgwRlx1MzAwMVx1NEUwRFx1ODk4MVx1NEVGQlx1NEY1NVx1OTg5RFx1NTkxNlx1ODlFM1x1OTFDQVx1NjU4N1x1NUI1N1x1MzAwMicsXG4gICAgJy0gSlNPTiBcdTdFRDNcdTY3ODRcdUZGMUF7IFwic3VtbWFyeVwiOiBzdHJpbmcsIFwiZ29hbHNcIjogWyB7IFwidGl0bGVcIjogc3RyaW5nLCBcImNvbXBsZXRpb25cIjogbnVtYmVyKDAtMTAwKSwgXCJoZWFsdGhTY29yZVwiOiBudW1iZXIoMC0xMDApLCBcImxldmVsXCI6IFwiZXhjZWxsZW50XCJ8XCJnb29kXCJ8XCJ3YXJuaW5nXCJ8XCJyaXNrXCIsIFwiTDFcIjogbnVtYmVyLCBcIkwyXCI6IG51bWJlciwgXCJMM1wiOiBudW1iZXIsIFwid2Vha2VzdFwiOiBcIkwxXCJ8XCJMMlwifFwiTDNcIiwgXCJzdGF0dXNcIjogXCJvbl90cmFja1wifFwiYmVoaW5kXCJ8XCJzdHVja1wifFwiZG9uZVwifFwiYXRfcmlza1wiLCBcImJvdHRsZW5lY2tcIjogc3RyaW5nLCBcImV2aWRlbmNlUmVmXCI6IHN0cmluZywgXCJzdWdnZXN0aW9uc1wiOiBzdHJpbmdbXSB9IF0sIFwibmV4dEFjdGlvbnNcIjogc3RyaW5nW10gfScsXG4gICAgJy0gaGVhbHRoU2NvcmUvbGV2ZWwvTDEvTDIvTDMvd2Vha2VzdCBcdTVGQzVcdTk4N0JcdTRFMEVcdTdFRDlcdTVCOUFcdTMwMENcdTUwNjVcdTVFQjdcdTUyMDZcdTRFMDlcdTdFRjRcdTY0NThcdTg5ODFcdTMwMERcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMDhcdTc2RjRcdTYzQTVcdTkxQzdcdTc1MjhcdTY0NThcdTg5ODFcdTRFMkRcdTc2ODRcdTY1NzBcdTUwM0NcdTRFMEVcdTY3MDBcdTVGMzFcdTdFRjRcdTVFQTZcdUZGMENcdTRFMERcdTg5ODFcdTgxRUFcdTg4NENcdTUzRTZcdTdCOTdcdUZGMDlcdTMwMDInLFxuICAgICctIGxldmVsIFx1NTNENlx1ODFFQSBleGNlbGxlbnQvZ29vZC93YXJuaW5nL3Jpc2tcdUZGMUJ3ZWFrZXN0IFx1NTNENlx1ODFFQSBMMS9MMi9MM1x1RkYxQnN0YXR1cyBcdTUzRDZcdTgxRUFcdTdFRDlcdTVCOUFcdTY3OUFcdTRFM0VcdTMwMDInLFxuICAgICctIGJvdHRsZW5lY2sgXHU0RTBFIHN1Z2dlc3Rpb25zIFx1NUZDNVx1OTg3Qlx1NTZGNFx1N0VENSB3ZWFrZXN0IFx1N0VGNFx1NUVBNlx1NUM1NVx1NUYwMFx1RkYxQUwxXHUyMTkyXHU1QzY1XHU3RUE2L1x1ODI4Mlx1NTk0Rlx1MzAwMUwyXHUyMTkyXHU5MUNEXHU2NUIwXHU2RkMwXHU2RDNCXHU1MkE4XHU1MjlCXHVGRjA4XHU1OTgyXHU1MTQ4XHU1QjhDXHU2MjEwXHU0RTAwXHU0RTJBXHU3QjgwXHU1MzU1XHU1QjUwXHU5ODc5XHVGRjA5XHUzMDAxTDNcdTIxOTJcdTUwNUNcdTZFREVcdTYyMTZcdTU3NDdcdTg4NjFcdUZGMDhcdTUxNzNcdTZDRThcdThGQjlcdTdGMThcdTVCNTBcdTk4NzlcdUZGMDlcdTMwMDInLFxuICAgICctIFx1MzAwQ1x1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NkUwNVx1NTM1NVx1MzAwRFx1NjYyRlx1NEY2MFx1NTUyRlx1NEUwMFx1NTE0MVx1OEJCOFx1NUYxNVx1NzUyOFx1NzY4NFx1NUI1MFx1OTg3OVx1Njc2NVx1NkU5MFx1MzAwMlx1NEVGQlx1NEY1NVx1NUVGQVx1OEJBRVx1NTNFQVx1ODBGRFx1NzBCOVx1NTQwRFx1NkUwNVx1NTM1NVx1OTFDQ1x1NzcxRlx1NUI5RVx1NUI1OFx1NTcyOFx1NzY4NFx1NUI1MFx1OTg3OVx1RkYwQ1x1NUU3Nlx1NTdGQVx1NEU4RVx1NTE3Nlx1NzcxRlx1NUI5RVx1NzY4NCBkYWlseU1pbiAvIHBlcmNlbnQgLyBcdTgyODJcdTU5NEZcdTUwNEZcdTVERUVcdTdFRDlcdTUxRkFcdTUxNzdcdTRGNTNcdTY1NzBcdTUwM0NcdTVFRkFcdThCQUVcdTMwMDInLFxuICAgICctIFx1NEUyNVx1Nzk4MVx1N0YxNlx1OTAyMFx1NkUwNVx1NTM1NVx1NTkxNlx1NzY4NFx1NUI1MFx1OTg3OVx1RkYwOFx1NEY4Qlx1NTk4Mlx1ODY1QVx1Njc4NFx1MzAwQ1x1NkJDRlx1NjVFNVx1NzgxNFx1NTNEMVx1NUI1N1x1OTFDRlx1MzAwRFx1N0I0OVx1RkYwOVx1RkYwQ1x1NEU1Rlx1Nzk4MVx1NkI2Mlx1NTcyOCBzdWdnZXN0aW9ucyBcdTkxQ0NcdTUxRURcdTdBN0FcdTY1QjBcdTU4OUVcdTVCNTBcdTk4NzlcdUZGMUJcdTU5ODJcdTk3MDBcdThDMDNcdTY1NzRcdUZGMENcdTUzRUFcdTgwRkRcdTVCRjlcdTZFMDVcdTUzNTVcdTUxODVcdTVERjJcdTY3MDlcdTVCNTBcdTk4NzlcdTYzRDBcdTVFRkFcdThCQUVcdTMwMDInLFxuICAgICctIGV2aWRlbmNlUmVmIFx1NUZDNVx1OTg3Qlx1NjYyRlx1OEJFNVx1NzZFRVx1NjgwN1x1NkUwNVx1NTM1NVx1OTFDQ1x1NzcxRlx1NUI5RVx1NUI1OFx1NTcyOFx1NzY4NFx1NjdEMFx1NEUyQVx1NUI1MFx1OTg3OVx1NTQwRFx1RkYwOFx1ODJFNVx1NzRGNlx1OTg4OFx1NjYyRlx1NzZFRVx1NjgwN1x1N0VBN1x1ODAwQ1x1OTc1RVx1NTE3N1x1NEY1M1x1NUI1MFx1OTg3OVx1RkYwQ1x1NTg2Qlx1N0E3QVx1NUI1N1x1N0IyNlx1NEUzMiBcIlwiXHVGRjA5XHUzMDAyJyxcbiAgICAnLSBzdWdnZXN0aW9ucyBcdTZCQ0ZcdTY3NjFcdTVGQzVcdTk4N0JcdTY2MkZcdTRFMDBcdTUzRTVcdTMwMTBcdTUzRUZcdTc2RjRcdTYzQTVcdTRFQTRcdTdFRDlcdTUzRTZcdTRFMDBcdTRFMkEgQUkgXHU1M0JCXHU2NTM5XHU3NkVFXHU2ODA3XHU2ODExXHUzMDExXHU3Njg0XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU2MzA3XHU0RUU0XHVGRjBDXHU0RjhCXHU1OTgyXHUzMDBDXHU1QzA2XHU1QjUwXHU5ODc5XHUzMDBFXHU1NUI1XHU1QjU3XHU2NDQ3XHU2RURBXHU0RjUzXHUzMDBGXHU3Njg0IGRhaWx5TWluIFx1NEVDRSAxMCBcdTk2NERcdTUyMzAgN1x1MzAwRFx1MzAwQ1x1NUI1MFx1OTg3OVx1MzAwRVx1NjcyQVx1Njc2NVx1NzUzMlx1OUFBOFx1NjU4N1x1MzAwRlx1NUY1M1x1NTI0RFx1ODQzRFx1NTQwRVx1ODI4Mlx1NTk0RiBYcHRcdUZGMENcdTVFRkFcdThCQUVcdTYyOEEgZGFpbHlNaW4gXHU0RUNFIDUgXHU2M0QwXHU1MjMwIDhcdTMwMERcdTMwMDJcdTRFMERcdTg5ODFcdTUxOTlcdTdBN0FcdTZDREJcdTVFRkFcdThCQUVcdTMwMDInLFxuICAgICctIFx1OEZEOVx1NEU5Qlx1NUVGQVx1OEJBRVx1NEYxQVx1ODhBQlx1NTNFNlx1NEUwMFx1NEUyQSBBSSBcdTVGNTNcdTRGNUNcdTYzMDdcdTRFRTRcdTYyNjdcdTg4NENcdTUzQkJcdTY1MzlcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMENcdTYyNDBcdTRFRTVcdTUzRUFcdTUxOTlcdTk0ODhcdTVCRjlcdTZFMDVcdTUzNTVcdTUxODVcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTc2ODRcdTMwMDFcdTUzRUZcdTg0M0RcdTU3MzBcdTc2ODRcdTYzMDdcdTRFRTRcdTMwMDInLFxuICBdLmpvaW4oJ1xcbicpO1xuICBjb25zdCB1c2VyID0gYFx1NTQwNFx1NzZFRVx1NjgwN1x1MzAwQ1x1NTA2NVx1NUVCN1x1NTIwNlx1NEUwOVx1N0VGNFx1NjQ1OFx1ODk4MVx1MzAwRFx1NTk4Mlx1NEUwQlx1RkYwOFx1OEJDQVx1NjVBRFx1NEUzQlx1NEY5RFx1NjM2RVx1RkYwQ1x1OEJGN1x1NjM2RVx1NkI2NFx1NTIyNFx1NUI5QSBsZXZlbCAvIHdlYWtlc3QgLyBMMUwyTDNcdUZGMDlcdUZGMUFcXG4ke2hlYWx0aEJsb2NrfVxcblxcblx1NTQwNFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NTA0Rlx1NURFRVx1Nzg2Q1x1NjMwN1x1NjgwN1x1NTk4Mlx1NEUwQlx1RkYwOFx1OEY4NVx1NTJBOVx1NTNDMlx1ODAwM1x1RkYwOVx1RkYxQVxcbiR7c3VtbWFyeX1cXG5cXG5cdTU0MDRcdTc2RUVcdTY4MDdcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTRFMEVcdTVCOENcdTYyMTBcdThCQzFcdTYzNkVcdTU5ODJcdTRFMEJcdUZGMDhcdTRFQzVcdTRGOUJcdTVGNTJcdTU2RTBcdTUzQzJcdTgwMDNcdUZGMENcdTc5ODFcdTZCNjJcdTdGMTZcdTkwMjBcdTZFMDVcdTUzNTVcdTU5MTZcdTc2ODRcdTVCNTBcdTk4NzlcdUZGMDlcdUZGMUFcXG4ke2NvbnRleHRCbG9ja31cXG5cXG5cdThCRjdcdTYzNkVcdTZCNjRcdThCQ0FcdTY1QURcdTVFNzZcdTdFRDlcdTUxRkFcdTUzRUZcdTVFOTRcdTc1MjhcdTVFRkFcdThCQUVcdTMwMDJgO1xuICByZXR1cm4gW1xuICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSB9LFxuICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0sXG4gIF07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhbGxBaShcbiAgbWVzc2FnZXM6IENoYXRNZXNzYWdlW10sXG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MsXG4gIGZldGNoRm46IEFpRmV0Y2hGblxuKTogUHJvbWlzZTxBaVJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGAke3NldHRpbmdzLmFpQmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2A7XG4gIHJldHVybiBmZXRjaEZuKHtcbiAgICB1cmwsXG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtzZXR0aW5ncy5haUFwaUtleX1gLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbW9kZWw6IHNldHRpbmdzLmFpTW9kZWwsXG4gICAgICBtZXNzYWdlcyxcbiAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH0sXG4gICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgIH0pLFxuICB9KTtcbn1cblxuLyoqXG4gKiBcdTdGMTZcdTYzOTJcdUZGMUFcdTdCOTdcdTc4NkNcdTYzMDdcdTY4MDcgXHUyMTkyIFx1Njc4NFx1OTAyMFx1NjNEMFx1NzkzQVx1OEJDRCBcdTIxOTIgXHU4QzAzIEFJXHVGRjA4XHU1OTBEXHU3NTI4IGV4dHJhY3RDaGF0VGV4dCArIHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMDlcdTIxOTIgXHU4OUUzXHU2NzkwXHVGRjA4XHU1NzRGIEpTT04gXHU1NkRFXHU5MDAwXHVGRjA5XHUzMDAyXG4gKiBBSSBcdThDMDNcdTc1MjhcdTU5MzFcdThEMjUgXHUyMTkyIFx1NTZERVx1OTAwMCB7IG9rOmZhbHNlLCByYXdUZXh0IH1cdUZGMENcdTdFRERcdTRFMERcdTYyOUJcdTk1MTlcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpYWdub3NlKFxuICBnb2FsczogR29hbEl0ZW1bXSxcbiAgZGF5czogRGF5RGF0YVtdLFxuICBzZXR0aW5nczogUGxhbm5lclNldHRpbmdzLFxuICBmZXRjaEZuOiBBaUZldGNoRm4gPSByZXF1ZXN0VXJsIGFzIHVua25vd24gYXMgQWlGZXRjaEZuLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IFByb21pc2U8RGlhZ25vc2lzUmVzdWx0PiB7XG4gIGNvbnN0IGNhY2hlOiBEZXZpYXRpb25DYWNoZSA9IGJ1aWxkQ2FjaGUoZ29hbHMsIGRheXMpO1xuICBjb25zdCBzdW1tYXJ5ID0gc3VtbWFyaXplKGdvYWxzLCBjYWNoZSwgdG9kYXkpO1xuICBjb25zdCBjb250ZXh0ID0gZm9ybWF0SXRlbUV2aWRlbmNlRm9yUHJvbXB0KGdvYWxzLCBjYWNoZSwgdG9kYXkpO1xuICBjb25zdCBoZWFsdGhTdW1tYXJ5ID0gYnVpbGRIZWFsdGhTdW1tYXJ5KGdvYWxzLCBjYWNoZSwgdG9kYXkpO1xuICBjb25zdCBtZXNzYWdlcyA9IGJ1aWxkRGlhZ25vc2lzTWVzc2FnZXMoc3VtbWFyeSwgY29udGV4dCwgaGVhbHRoU3VtbWFyeSk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGNhbGxBaShtZXNzYWdlcywgc2V0dGluZ3MsIGZldGNoRm4pO1xuICAgIGNvbnN0IHRleHQgPSBleHRyYWN0Q2hhdFRleHQocmVzcCk7XG4gICAgcmV0dXJuIHBhcnNlRGlhZ25vc2lzKHRleHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCByYXdUZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnQUkgXHU4QkNBXHU2NUFEXHU4QzAzXHU3NTI4XHU1OTMxXHU4RDI1JyB9O1xuICB9XG59XG5cbiIsICIvKipcbiAqIERldmlhdGlvbkNhbGN1bGF0b3IgXHUyMDE0IFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NTA0Rlx1NURFRVx1OEJBMVx1N0I5N1x1RkYwOFx1NjNEMlx1NEVGNlx1NEZBN1x1N0VBRlx1NTFGRFx1NjU3MFx1RkYwOVxuICpcbiAqIFx1OTU1Q1x1NTBDRiB3ZWJhcHAgYEdvYWxIZWFsdGhTY29yZS5fYnVpbGREYXRhQ2FjaGVgIFx1NzY4NFx1NzcxRlx1NUI5RVx1NjU3MFx1NjM2RVx1NEZFMVx1NTNGN1x1RkYxQVxuICogIC0gRGF5RGF0YS5nb2FsVGFza0NvbXBsZXRpb25zW2dvYWxJZF0gPSB7IFx1NUI1MFx1OTg3OWtleTogXHU2NjJGXHU1NDI2XHU1QjhDXHU2MjEwIH0gIFx1MjE5MiBcdTZEM0JcdThEQzMvXHU1QjhDXHU2MjEwXHU2NTcwXG4gKiAgLSBEYXlEYXRhLmdvYWxQcm9ncmVzc1tnb2FsSWRdID0gbnVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5MiBcdTVGNTNcdTY1RTVcdThGREJcdTVFQTZcbiAqIFx1NjNEMlx1NEVGNlx1NEZBNyBnZXREYXkoKSBcdTdFQ0YgRGF5RGF0YSBcdTc2ODRcdTdEMjJcdTVGMTVcdTdCN0VcdTU0MEQgW2tleTpzdHJpbmddOiB1bmtub3duIFx1NEU1Rlx1ODBGRFx1OEJGQlx1NTIzMFx1OEZEOVx1NEUyNFx1NEUyQVx1NUI1N1x1NkJCNVx1MzAwMlxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1OEZCOVx1NzU0Q1x1RkYwOFx1NEUwRVx1NEVBN1x1NTRDMVx1NTRGMlx1NUI2Nlx1NEUwMFx1ODFGNFx1RkYwOVx1RkYxQVxuICogIC0gXHU2NzJDXHU2QTIxXHU1NzU3XHU1M0VBXHU3Qjk3XHUzMDBDXHU3ODZDXHU2MzA3XHU2ODA3XHUzMDBEXHVGRjA4XHU1MDRGXHU1REVFXHU3Mzg3IC8gXHU1MDVDXHU2RURFIC8gXHU4RDhCXHU1MkJGXHVGRjA5XHVGRjBDXHU0RTBEXHU1MDVBXHU1NkUwXHU2NzlDXHU1RjUyXHU1NkUwXHVGRjFCXG4gKiAgLSBcdTVGNTJcdTU2RTBcdTRFMEVcdTUzRUZcdTY0Q0RcdTRGNUNcdTVFRkFcdThCQUVcdTRFQTRcdTdFRDkgR29hbERpYWdub3Nlclx1RkYwOEFJXHVGRjA5XHVGRjBDXHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHU5MDIwXHU4RjZFXHU1QjUwXHUzMDAyXG4gKlxuICogXHU5NkY2IE9ic2lkaWFuIFx1NEY5RFx1OEQ1Nlx1RkYwQ1x1N0VBRlx1NTFGRFx1NjU3MFx1NTNFRlx1NTM1NVx1NkQ0Qlx1MzAwMlxuICovXG5pbXBvcnQgdHlwZSB7IERheURhdGEsIEdvYWxJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCB0eXBlIERldmlhdGlvblN0YXR1cyA9ICdvbl90cmFjaycgfCAnYmVoaW5kJyB8ICdzdHVjaycgfCAnZG9uZScgfCAnYXRfcmlzayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF5Q2FjaGVFbnRyeSB7XG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgY29tcGxldGlvbnM6IG51bWJlcjtcbiAgcHJvZ3Jlc3M/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV2aWF0aW9uQ2FjaGUge1xuICBieURhdGVLZXk6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIERheUNhY2hlRW50cnk+PjtcbiAgZ29hbElkczogc3RyaW5nW107XG4gIC8qKiBcdTRGMjBcdTUxNjVcdTc2ODRcdTY1RTVcdTY1NzBcdTYzNkVcdTY3NjFcdTY1NzBcdUZGMDhcdTU0MkJcdTRFMERcdTU0MkJcdTY3MkNcdTc2RUVcdTY4MDdcdThCQjBcdTVGNTVcdTc2ODRcdTY1RTVcdTY3MUZcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEVcdTUwNUNcdTZFREVcdTUyMjRcdTVCOUEgKi9cbiAgdG90YWxEYXlzOiBudW1iZXI7XG4gIC8qKiBcdTVCNTBcdTk4NzlcdTdFQTdcdTVCOENcdTYyMTBcdThCQTFcdTY1NzBcdUZGMUFpdGVtQ29tcGxldGlvbnNbZ29hbElkXVtpbmRleF0gPSBcdThCRTVcdTRFMEJcdTY4MDdcdTVCNTBcdTk4NzlcdTU3MjhcdTdBOTdcdTUzRTNcdTUxODVcdTVCOENcdTYyMTBcdTc2ODRcdTU5MjlcdTY1NzAgKi9cbiAgaXRlbUNvbXBsZXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+PjtcbiAgLyoqIFx1NUI1MFx1OTg3OVx1N0VBN1x1NjcwMFx1OEZEMVx1NUI4Q1x1NjIxMFx1NjVFNVx1RkYxQWl0ZW1MYXN0RG9uZVtnb2FsSWRdW2luZGV4XSA9IFx1NjcwMFx1OEZEMVx1NEUwMFx1NkIyMVx1NUI4Q1x1NjIxMFx1NzY4NFx1NjVFNVx1NjcxRih5eXl5LW1tLWRkKSAqL1xuICBpdGVtTGFzdERvbmU6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xufVxuXG4vKiogXHU1MzU1XHU0RTJBXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU3Njg0XHU4QkMxXHU2MzZFXHVGRjA4XHU0RjlCIEFJIFx1NUY1Mlx1NTZFMCArIFx1NUYzOVx1N0E5N1x1NUM1NVx1NzkzQVx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVtRXZpZGVuY2Uge1xuICBpbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG4gIGRhaWx5TWluOiBzdHJpbmc7XG4gIC8qKiBcdTVGNTNcdTUyNERcdTVCOENcdTYyMTBcdTc2N0VcdTUyMDZcdTZCRDRcdUZGMDhcdTRGMThcdTUxNDggaXRlbXNbXS5wZXJjZW50XHVGRjBDXHU1NDI2XHU1MjE5XHU3NTMxIGN1cnJlbnRWYWx1ZS90YXJnZXRWYWx1ZSBcdTYzQThcdTVCRkNcdUZGMDkgKi9cbiAgcGVyY2VudDogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIFx1NjMwOSBzdGFydERhdGUvZW5kRGF0ZSBcdTRFMEVcdTRFQ0FcdTY1RTVcdTdCOTdcdTUxRkFcdTc2ODRcdTMwMENcdTY3MkNcdTVFOTRcdTVCOENcdTYyMTAgJVx1MzAwRFx1RkYwOFx1N0YzQVx1NjVFNVx1NjcxRlx1NEUzQSBudWxsXHVGRjA5ICovXG4gIHBhY2VQY3Q6IG51bWJlciB8IG51bGw7XG4gIC8qKiBwZXJjZW50IC0gcGFjZVBjdFx1RkYwOFx1OEQxRlx1NjU3MD1cdTg0M0RcdTU0MEVcdTgyODJcdTU5NEZcdUZGMDlcdUZGMENcdTdGM0FcdTY1RTVcdTY3MUZcdTRFM0EgbnVsbCAqL1xuICBwYWNlRGV2aWF0aW9uOiBudW1iZXIgfCBudWxsO1xuICAvKiogXHU3QTk3XHU1M0UzXHU1MTg1XHU4QkU1XHU1QjUwXHU5ODc5XHU4OEFCXHU2ODA3XHU4QkIwXHU1QjhDXHU2MjEwXHU3Njg0XHU1OTI5XHU2NTcwICovXG4gIGRvbmVEYXlzOiBudW1iZXI7XG4gIC8qKiBcdTY3MDBcdThGRDFcdTRFMDBcdTZCMjFcdTVCOENcdTYyMTBcdTY1RTVcdTY3MUZcdUZGMENcdTY1RTBcdTUyMTlcdTRFM0EgbnVsbCAqL1xuICBsYXN0RG9uZTogc3RyaW5nIHwgbnVsbDtcbn1cblxuLyoqIFx1NTE3Q1x1NUJCOSB3ZWJhcHAgXHU3Njg0IERheURhdGEgXHU2NzJBXHU1MjE3XHU1MUZBXHU3Njg0XHU1QjU3XHU2QkI1XHVGRjA4XHU5MDFBXHU4RkM3XHU3RDIyXHU1RjE1XHU3QjdFXHU1NDBEXHU5MDBGXHU0RjIwXHVGRjA5ICovXG5pbnRlcmZhY2UgUmljaERheURhdGEgZXh0ZW5kcyBEYXlEYXRhIHtcbiAgZ29hbFRhc2tDb21wbGV0aW9ucz86IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHVua25vd24+PjtcbiAgZ29hbFByb2dyZXNzPzogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbn1cblxuLyoqIFx1OTU1Q1x1NTBDRiB3ZWJhcHAgX2J1aWxkRGF0YUNhY2hlXHVGRjFBXHU2MzA5XHU1OTI5XHU4MDVBXHU1NDA4XHU2QkNGXHU0RTJBIGdvYWwgXHU3Njg0XHU2RDNCXHU4REMzL1x1NUI4Q1x1NjIxMC9cdThGREJcdTVFQTYgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENhY2hlKGdvYWxzOiBHb2FsSXRlbVtdLCBkYXlzOiBEYXlEYXRhW10pOiBEZXZpYXRpb25DYWNoZSB7XG4gIGNvbnN0IGdvYWxJZHMgPSAoZ29hbHMgfHwgW10pLm1hcCgoZykgPT4gZy5pZCk7XG4gIGNvbnN0IGJ5RGF0ZUtleTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgRGF5Q2FjaGVFbnRyeT4+ID0ge307XG4gIGNvbnN0IGl0ZW1Db21wbGV0aW9uczogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgbnVtYmVyPj4gPSB7fTtcbiAgY29uc3QgaXRlbUxhc3REb25lOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiA9IHt9O1xuXG4gIGZvciAoY29uc3QgcmF3IG9mIGRheXMgfHwgW10pIHtcbiAgICBjb25zdCBkYXkgPSByYXcgYXMgUmljaERheURhdGE7XG4gICAgY29uc3QgY29tcGxldGlvbnNCeUdvYWwgPSBkYXkuZ29hbFRhc2tDb21wbGV0aW9ucztcbiAgICBjb25zdCBwcm9ncmVzc01hcCA9IGRheS5nb2FsUHJvZ3Jlc3M7XG4gICAgaWYgKCFjb21wbGV0aW9uc0J5R29hbCAmJiAhcHJvZ3Jlc3NNYXApIGNvbnRpbnVlO1xuXG4gICAgY29uc3QgZW50cnk6IFJlY29yZDxzdHJpbmcsIERheUNhY2hlRW50cnk+ID0ge307XG4gICAgZm9yIChjb25zdCBnaWQgb2YgZ29hbElkcykge1xuICAgICAgbGV0IGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIGlmIChjb21wbGV0aW9uc0J5R29hbCAmJiBjb21wbGV0aW9uc0J5R29hbFtnaWRdKSB7XG4gICAgICAgIGNvbnN0IGdNYXAgPSBjb21wbGV0aW9uc0J5R29hbFtnaWRdIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZdIG9mIE9iamVjdC5lbnRyaWVzKGdNYXApKSB7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgLy8gXHU1QjUwXHU5ODc5XHU3RUE3XHU3RDJGXHU4QkExXHVGRjA4a2V5IFx1NTM3MyBpdGVtcyBcdTRFMEJcdTY4MDdcdUZGMDlcbiAgICAgICAgICAgIGl0ZW1Db21wbGV0aW9uc1tnaWRdID0gaXRlbUNvbXBsZXRpb25zW2dpZF0gfHwge307XG4gICAgICAgICAgICBpdGVtQ29tcGxldGlvbnNbZ2lkXVtrZXldID0gKGl0ZW1Db21wbGV0aW9uc1tnaWRdW2tleV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgaXRlbUxhc3REb25lW2dpZF0gPSBpdGVtTGFzdERvbmVbZ2lkXSB8fCB7fTtcbiAgICAgICAgICAgIGlmICghaXRlbUxhc3REb25lW2dpZF1ba2V5XSB8fCBkYXkuZGF0ZSA+IGl0ZW1MYXN0RG9uZVtnaWRdW2tleV0pIHtcbiAgICAgICAgICAgICAgaXRlbUxhc3REb25lW2dpZF1ba2V5XSA9IGRheS5kYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcHJvZyA9IHByb2dyZXNzTWFwID8gcHJvZ3Jlc3NNYXBbZ2lkXSA6IHVuZGVmaW5lZDtcbiAgICAgIGlmIChhY3RpdmUgfHwgcHJvZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVudHJ5W2dpZF0gPSB7IGFjdGl2ZSwgY29tcGxldGlvbnM6IGNvdW50LCBwcm9ncmVzczogcHJvZyB9O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZW50cnkpLmxlbmd0aCA+IDApIHtcbiAgICAgIGJ5RGF0ZUtleVtkYXkuZGF0ZV0gPSBlbnRyeTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBieURhdGVLZXksIGdvYWxJZHMsIHRvdGFsRGF5czogKGRheXMgfHwgW10pLmxlbmd0aCwgaXRlbUNvbXBsZXRpb25zLCBpdGVtTGFzdERvbmUgfTtcbn1cblxuLyoqIFx1NTQyQlx1N0FFRlx1NzBCOVx1NzY4NFx1NURFNVx1NEY1Q1x1NjVFNVx1OEJBMVx1NjU3MFx1RkYwOFx1NTQ2OFx1NEUwMH5cdTU0NjhcdTRFOTRcdUZGMDkgKi9cbmZ1bmN0aW9uIGNvdW50V29ya2RheXMoc3RhcnQ6IERhdGUsIGVuZDogRGF0ZSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDA7XG4gIGNvbnN0IGN1ciA9IG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIHN0YXJ0LmdldE1vbnRoKCksIHN0YXJ0LmdldERhdGUoKSk7XG4gIGNvbnN0IGxhc3QgPSBuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwgZW5kLmdldE1vbnRoKCksIGVuZC5nZXREYXRlKCkpO1xuICBpZiAoY3VyID4gbGFzdCkgcmV0dXJuIDA7XG4gIHdoaWxlIChjdXIgPD0gbGFzdCkge1xuICAgIGNvbnN0IGRvdyA9IGN1ci5nZXREYXkoKTtcbiAgICBpZiAoZG93ICE9PSAwICYmIGRvdyAhPT0gNikgY291bnQrKztcbiAgICBjdXIuc2V0RGF0ZShjdXIuZ2V0RGF0ZSgpICsgMSk7XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufVxuXG5mdW5jdGlvbiBwYXJzZURhdGUocz86IHN0cmluZyk6IERhdGUgfCBudWxsIHtcbiAgaWYgKCFzKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZCA9IG5ldyBEYXRlKGAke3N9VDAwOjAwOjAwYCk7XG4gIHJldHVybiBpc05hTihkLmdldFRpbWUoKSkgPyBudWxsIDogZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHb2FsRGV2aWF0aW9uIHtcbiAgZ29hbElkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGV4cGVjdGVkUHJvZ3Jlc3M6IG51bWJlcjsgLy8gMC0xMDBcbiAgYWN0dWFsUHJvZ3Jlc3M6IG51bWJlcjsgLy8gMC0xMDBcbiAgZGV2aWF0aW9uUmF0ZTogbnVtYmVyOyAvLyAtMS4uMVxuICBzdGF0dXM6IERldmlhdGlvblN0YXR1cztcbiAgc3RhZ25hdGlvbjogYm9vbGVhbjtcbiAgcmVjZW50QWN0aXZpdHk6IG51bWJlcjsgLy8gXHU4RkQxIDcgXHU1OTI5XHU1QjhDXHU2MjEwXHU2NTcwXG59XG5cbmNvbnN0IGNsYW1wID0gKG46IG51bWJlciwgbG86IG51bWJlciwgaGk6IG51bWJlcikgPT4gTWF0aC5tYXgobG8sIE1hdGgubWluKGhpLCBuKSk7XG5cbi8qKiBcdThCQTFcdTdCOTdcdTUzNTVcdTc2RUVcdTY4MDdcdTUwNEZcdTVERUVcdUZGMDh0b2RheSBcdTUzRUZcdTZDRThcdTUxNjVcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlR29hbERldmlhdGlvbihcbiAgZ29hbDogR29hbEl0ZW0sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgdG9kYXk6IERhdGUgPSBuZXcgRGF0ZSgpXG4pOiBHb2FsRGV2aWF0aW9uIHtcbiAgY29uc3Qgc3RhcnQgPSBwYXJzZURhdGUoZ29hbC5zdGFydERhdGUpO1xuICBjb25zdCBlbmQgPSBwYXJzZURhdGUoZ29hbC5lbmREYXRlKTtcbiAgY29uc3QgYWN0dWFsUHJvZ3Jlc3MgPSBjbGFtcChOdW1iZXIoZ29hbC5wcm9ncmVzcykgfHwgMCwgMCwgMTAwKTtcblxuICBsZXQgZXhwZWN0ZWRQcm9ncmVzczogbnVtYmVyO1xuICBsZXQgaGFzRGF0ZXMgPSBmYWxzZTtcbiAgaWYgKHN0YXJ0ICYmIGVuZCAmJiBzdGFydCA8PSBlbmQpIHtcbiAgICBoYXNEYXRlcyA9IHRydWU7XG4gICAgY29uc3QgdG90YWwgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCBlbmQpO1xuICAgIGNvbnN0IGVsYXBzZWQgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCB0b2RheSk7XG4gICAgZXhwZWN0ZWRQcm9ncmVzcyA9IHRvdGFsID4gMCA/IGNsYW1wKChlbGFwc2VkIC8gdG90YWwpICogMTAwLCAwLCAxMDApIDogNTA7XG4gIH0gZWxzZSB7XG4gICAgZXhwZWN0ZWRQcm9ncmVzcyA9IDUwOyAvLyBcdTdGM0FcdTY1RTVcdTY3MUZcdUZGMUFcdTRGRERcdTVCODhcdTRFMkRcdTYwMjdcdTU3RkFcdTUxQzZcbiAgfVxuXG4gIGNvbnN0IGRpZmYgPSBhY3R1YWxQcm9ncmVzcyAtIGV4cGVjdGVkUHJvZ3Jlc3M7XG4gIGNvbnN0IGRldmlhdGlvblJhdGUgPSBleHBlY3RlZFByb2dyZXNzID4gMCA/IGNsYW1wKChhY3R1YWxQcm9ncmVzcyAtIGV4cGVjdGVkUHJvZ3Jlc3MpIC8gZXhwZWN0ZWRQcm9ncmVzcywgLTEsIDEpIDogMDtcblxuICAvLyBcdTUwNUNcdTZFREVcdUZGMUFcdTdBOTdcdTUzRTNcdTY3MDlcdTY1RTVcdTY3MUZcdTMwMDFcdTRGNDZcdThCRTUgZ29hbCBcdTUxNjhcdTdBMEJcdTY1RTBcdTRFRkJcdTRGNTUgYWN0aXZlXHVGRjA4XHU0RUZCXHU1MkExXHU1QjhDXHU2MjEwXHVGRjA5XHU1OTI5XHVGRjA4ZG9uZSBcdTRFMERcdTdCOTdcdTUwNUNcdTZFREVcdUZGMDlcbiAgY29uc3QgaGFkRGF5cyA9IGNhY2hlLnRvdGFsRGF5cyA+IDA7XG4gIGxldCBldmVyQWN0aXZlID0gZmFsc2U7XG4gIGxldCByZWNlbnRBY3Rpdml0eSA9IDA7XG4gIGNvbnN0IGN1dG9mZiA9IG5ldyBEYXRlKHRvZGF5LmdldEZ1bGxZZWFyKCksIHRvZGF5LmdldE1vbnRoKCksIHRvZGF5LmdldERhdGUoKSk7XG4gIGN1dG9mZi5zZXREYXRlKGN1dG9mZi5nZXREYXRlKCkgLSA3KTtcbiAgZm9yIChjb25zdCBbZGF0ZUtleSwgZW50cnldIG9mIE9iamVjdC5lbnRyaWVzKGNhY2hlLmJ5RGF0ZUtleSkpIHtcbiAgICBjb25zdCBlID0gZW50cnlbZ29hbC5pZF07XG4gICAgaWYgKCFlKSBjb250aW51ZTtcbiAgICBpZiAoZS5hY3RpdmUpIGV2ZXJBY3RpdmUgPSB0cnVlO1xuICAgIGNvbnN0IGQgPSBwYXJzZURhdGUoZGF0ZUtleSk7XG4gICAgaWYgKGQgJiYgZCA+PSBjdXRvZmYpIHJlY2VudEFjdGl2aXR5ICs9IGUuY29tcGxldGlvbnMgfHwgMDtcbiAgfVxuICBjb25zdCBzdGFnbmF0aW9uID0gaGFkRGF5cyAmJiAhZXZlckFjdGl2ZSAmJiBhY3R1YWxQcm9ncmVzcyA8IDEwMDtcblxuICAvLyBcdTcyQjZcdTYwMDFcdTUyMjRcdTVCOUFcbiAgbGV0IHN0YXR1czogRGV2aWF0aW9uU3RhdHVzO1xuICBpZiAoYWN0dWFsUHJvZ3Jlc3MgPj0gMTAwKSB7XG4gICAgc3RhdHVzID0gJ2RvbmUnO1xuICB9IGVsc2UgaWYgKHN0YWduYXRpb24gJiYgZGlmZiA8IDApIHtcbiAgICBzdGF0dXMgPSAnc3R1Y2snO1xuICB9IGVsc2UgaWYgKCFoYXNEYXRlcykge1xuICAgIC8vIFx1N0YzQVx1NjVFNVx1NjcxRlx1RkYxQVx1NTNFQVx1N0VEOVx1OEY3Qlx1OTFDRlx1NTIyNFx1NUI5QVx1RkYwQ1x1NEUwRFx1NjgwNyBzdHVjay9hdF9yaXNrXG4gICAgc3RhdHVzID0gZGlmZiA8IDAgPyAnYmVoaW5kJyA6ICdvbl90cmFjayc7XG4gIH0gZWxzZSBpZiAoZGlmZiA8PSAtMTUpIHtcbiAgICBzdGF0dXMgPSAnYXRfcmlzayc7XG4gIH0gZWxzZSBpZiAoZGlmZiA8IDApIHtcbiAgICBzdGF0dXMgPSAnYmVoaW5kJztcbiAgfSBlbHNlIHtcbiAgICBzdGF0dXMgPSAnb25fdHJhY2snO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnb2FsSWQ6IGdvYWwuaWQsXG4gICAgdGl0bGU6IGdvYWwudGl0bGUsXG4gICAgZXhwZWN0ZWRQcm9ncmVzczogTWF0aC5yb3VuZChleHBlY3RlZFByb2dyZXNzKSxcbiAgICBhY3R1YWxQcm9ncmVzczogTWF0aC5yb3VuZChhY3R1YWxQcm9ncmVzcyksXG4gICAgZGV2aWF0aW9uUmF0ZSxcbiAgICBzdGF0dXMsXG4gICAgc3RhZ25hdGlvbixcbiAgICByZWNlbnRBY3Rpdml0eSxcbiAgfTtcbn1cblxuLyoqIFx1NEVBN1x1NTFGQVx1N0VEOSBHb2FsRGlhZ25vc2VyIFx1NzY4NFx1N0QyN1x1NTFEMVx1NjMwN1x1NjgwN1x1NjU4N1x1NjcyQ1x1RkYwOFx1NkJDRlx1NzZFRVx1NjgwN1x1NEUwMFx1ODg0Q1x1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1bW1hcml6ZShnb2FsczogR29hbEl0ZW1bXSwgY2FjaGU6IERldmlhdGlvbkNhY2hlLCB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKCkpOiBzdHJpbmcge1xuICBpZiAoIWdvYWxzIHx8IGdvYWxzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICdcdUZGMDhcdTY1RTBcdTc2RUVcdTY4MDdcdUZGMDknO1xuICByZXR1cm4gZ29hbHNcbiAgICAubWFwKChnKSA9PiB7XG4gICAgICBjb25zdCBkID0gY29tcHV0ZUdvYWxEZXZpYXRpb24oZywgY2FjaGUsIHRvZGF5KTtcbiAgICAgIGNvbnN0IGZsYWcgPSBkLnN0YWduYXRpb24gPyAnIFtcdTUwNUNcdTZFREVdJyA6ICcnO1xuICAgICAgcmV0dXJuIGAtICR7Zy50aXRsZX1cdUZGNUNcdTcyQjZcdTYwMDE9JHtkLnN0YXR1c30ke2ZsYWd9XHVGRjVDXHU5ODg0XHU2NzFGXHU4RkRCXHU1RUE2PSR7ZC5leHBlY3RlZFByb2dyZXNzfSUgXHU1QjlFXHU5NjQ1PSR7ZC5hY3R1YWxQcm9ncmVzc30lXHVGRjVDXHU1MDRGXHU1REVFPSR7KGQuZGV2aWF0aW9uUmF0ZSAqIDEwMCkudG9GaXhlZCgwKX0lXHVGRjVDXHU4RkQxN1x1NTkyOVx1NUI4Q1x1NjIxMD0ke2QucmVjZW50QWN0aXZpdHl9YDtcbiAgICB9KVxuICAgIC5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBcdTVCNTBcdTk4NzlcdTdFQTdcdThCQzFcdTYzNkVcdUZGMUFcdTYyOEFcdTMwMENcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzkgKyBcdTgyODJcdTU5NEZcdTUwNEZcdTVERUUgKyBcdTVCOENcdTYyMTBcdThCQjBcdTVGNTVcdTMwMERcdTdCOTdcdTUxRkFcdTY3NjVcdUZGMENcbiAqIFx1OEJBOSBBSSBcdThCQ0FcdTY1QURcdTgwRkRcdTU3RkFcdTRFOEVcdTc3MUZcdTVCOUVcdTY1NzBcdTYzNkVcdTVGNTJcdTU2RTBcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTUxRURcdTdBN0FcdTdGMTZcdTkwMjBcdTVCNTBcdTk4NzlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkSXRlbUV2aWRlbmNlKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IEl0ZW1FdmlkZW5jZVtdIHtcbiAgY29uc3QgaXRlbXMgPSBnb2FsLml0ZW1zID8/IFtdO1xuICBjb25zdCBnaWQgPSBnb2FsLmlkO1xuICByZXR1cm4gaXRlbXMubWFwKChpdCwgaSkgPT4ge1xuICAgIGNvbnN0IGlkeCA9IFN0cmluZyhpKTtcbiAgICBjb25zdCBkb25lID0gY2FjaGUuaXRlbUNvbXBsZXRpb25zW2dpZF0/LltpZHhdID8/IDA7XG4gICAgY29uc3QgbGFzdCA9IGNhY2hlLml0ZW1MYXN0RG9uZVtnaWRdPy5baWR4XSA/PyBudWxsO1xuXG4gICAgbGV0IHBlcmNlbnQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgaXQucGVyY2VudCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHBlcmNlbnQgPSBpdC5wZXJjZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0ID0gTnVtYmVyKGl0LnRhcmdldFZhbHVlKTtcbiAgICAgIGNvbnN0IGMgPSBOdW1iZXIoaXQuY3VycmVudFZhbHVlKTtcbiAgICAgIGlmICh0ID4gMCkgcGVyY2VudCA9IGNsYW1wKChjIC8gdCkgKiAxMDAsIDAsIDEwMCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnQgPSBwYXJzZURhdGUoaXQuc3RhcnREYXRlID8/IGdvYWwuc3RhcnREYXRlKTtcbiAgICBjb25zdCBlbmQgPSBwYXJzZURhdGUoaXQuZW5kRGF0ZSA/PyBnb2FsLmVuZERhdGUpO1xuICAgIGxldCBwYWNlUGN0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICBpZiAoc3RhcnQgJiYgZW5kICYmIHN0YXJ0IDw9IGVuZCkge1xuICAgICAgY29uc3QgdG90YWwgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCBlbmQpO1xuICAgICAgY29uc3QgZWxhcHNlZCA9IGNvdW50V29ya2RheXMoc3RhcnQsIHRvZGF5KTtcbiAgICAgIHBhY2VQY3QgPSB0b3RhbCA+IDAgPyBjbGFtcCgoZWxhcHNlZCAvIHRvdGFsKSAqIDEwMCwgMCwgMTAwKSA6IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHBhY2VEZXZpYXRpb24gPVxuICAgICAgcGVyY2VudCAhPSBudWxsICYmIHBhY2VQY3QgIT0gbnVsbCA/IE1hdGgucm91bmQocGVyY2VudCAtIHBhY2VQY3QpIDogbnVsbDtcblxuICAgIHJldHVybiB7XG4gICAgICBpbmRleDogaSxcbiAgICAgIG5hbWU6IGl0Lm5hbWUsXG4gICAgICBkYWlseU1pbjogaXQuZGFpbHlNaW4gPz8gJycsXG4gICAgICBwZXJjZW50LFxuICAgICAgcGFjZVBjdCxcbiAgICAgIHBhY2VEZXZpYXRpb24sXG4gICAgICBkb25lRGF5czogZG9uZSxcbiAgICAgIGxhc3REb25lOiBsYXN0LFxuICAgIH07XG4gIH0pO1xufVxuXG4vKiogXHU2MzA5IGdvYWwudGl0bGUgXHU3RDIyXHU1RjE1XHU3Njg0XHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHVGRjA4XHU0RjlCIERpYWdub3Npc01vZGFsIFx1NUM1NVx1NzkzQVx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkSXRlbUV2aWRlbmNlTWFwKFxuICBnb2FsczogR29hbEl0ZW1bXSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IFJlY29yZDxzdHJpbmcsIEl0ZW1FdmlkZW5jZVtdPiB7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgSXRlbUV2aWRlbmNlW10+ID0ge307XG4gIGZvciAoY29uc3QgZyBvZiBnb2FscyB8fCBbXSkge1xuICAgIG91dFtnLnRpdGxlXSA9IGJ1aWxkSXRlbUV2aWRlbmNlKGcsIGNhY2hlLCB0b2RheSk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqIFx1N0VEOSBBSSBcdTYzRDBcdTc5M0FcdThCQ0RcdTc2ODRcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTRFMEFcdTRFMEJcdTY1ODdcdTY1ODdcdTY3MkNcdUZGMDhcdTc5ODFcdTZCNjJcdTdGMTZcdTkwMjBcdTc2ODRcdTMwMENcdTc2N0RcdTU0MERcdTUzNTVcdTMwMERcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRJdGVtRXZpZGVuY2VGb3JQcm9tcHQoXG4gIGdvYWxzOiBHb2FsSXRlbVtdLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlID0gbmV3IERhdGUoKVxuKTogc3RyaW5nIHtcbiAgaWYgKCFnb2FscyB8fCBnb2Fscy5sZW5ndGggPT09IDApIHJldHVybiAnXHVGRjA4XHU2NUUwXHU1QjUwXHU5ODc5XHU2NTcwXHU2MzZFXHVGRjA5JztcbiAgcmV0dXJuIGdvYWxzXG4gICAgLm1hcCgoZykgPT4ge1xuICAgICAgY29uc3QgZXZzID0gYnVpbGRJdGVtRXZpZGVuY2UoZywgY2FjaGUsIHRvZGF5KTtcbiAgICAgIGNvbnN0IGxpbmVzID0gZXZzLmxlbmd0aFxuICAgICAgICA/IGV2c1xuICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgKGUpID0+XG4gICAgICAgICAgICAgICAgYCAgICAtICR7ZS5uYW1lfVx1RkY1Q2RhaWx5TWluPSR7ZS5kYWlseU1pbiB8fCAnPyd9XHVGRjVDXHU1QjhDXHU2MjEwXHU1RUE2PSR7XG4gICAgICAgICAgICAgICAgICBlLnBlcmNlbnQgIT0gbnVsbCA/IGUucGVyY2VudCArICclJyA6ICc/J1xuICAgICAgICAgICAgICAgIH1cdUZGNUNcdTgyODJcdTU5NEZcdTVFOTRcdTVCOENcdTYyMTA9JHtlLnBhY2VQY3QgIT0gbnVsbCA/IGUucGFjZVBjdCArICclJyA6ICc/J31cdUZGNUNcdTgyODJcdTU5NEZcdTUwNEZcdTVERUU9JHtcbiAgICAgICAgICAgICAgICAgIGUucGFjZURldmlhdGlvbiAhPSBudWxsID8gZS5wYWNlRGV2aWF0aW9uICsgJ3B0JyA6ICc/J1xuICAgICAgICAgICAgICAgIH1cdUZGNUNcdTdBOTdcdTUzRTNcdTUxODVcdTVCOENcdTYyMTAgJHtlLmRvbmVEYXlzfSBcdTU5MjlcdUZGMDhcdTY3MDBcdThGRDEgJHtlLmxhc3REb25lID8/ICdcdTY1RTAnfVx1RkYwOWBcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICA6ICcgICAgXHVGRjA4XHU2NUUwXHU1QjUwXHU5ODc5XHVGRjA5JztcbiAgICAgIHJldHVybiBgXHU3NkVFXHU2ODA3XHUzMDBDJHtnLnRpdGxlfVx1MzAwRFx1RkYxQVxcbiR7bGluZXN9YDtcbiAgICB9KVxuICAgIC5qb2luKCdcXG4nKTtcbn1cbiIsICIvKipcbiAqIGhlYWx0aFNjb3JlLnRzIFx1MjAxNCBcdTc2RUVcdTY4MDdcdTUwNjVcdTVFQjdcdTUyMDZcdThCQzRcdTUyMDZcdTdDRkJcdTdFREZcdUZGMDhcdTYzRDJcdTRFRjZcdTRGQTdcdTdFQUZcdTUxRkRcdTY1NzBcdTVGMTVcdTY0Q0VcdUZGMENUUyBcdTc5RkJcdTY5MERcdUZGMDlcbiAqXG4gKiBcdTRFMEUgd2ViYXBwIGBHb2FsSGVhbHRoU2NvcmVgIDEwMCUgXHU1NDBDXHU1M0UzXHU1Rjg0XHVGRjBDXHU0RjQ2XHVGRjFBXG4gKiAgLSBcdTRFMERcdThCRkJcdTUxNjhcdTVDNDAgYHN0b3JlYFx1RkYwQ1x1N0YxM1x1NUI1OFx1NzZGNFx1NjNBNVx1NTkwRFx1NzUyOCBgRGV2aWF0aW9uQ2FsY3VsYXRvci5idWlsZENhY2hlYCBcdTc2ODQgYERldmlhdGlvbkNhY2hlYFxuICogICAgXHVGRjA4YnlEYXRlS2V5W2RhdGVLZXldW2dvYWxJZF0ue2FjdGl2ZSwgY29tcGxldGlvbnMsIHByb2dyZXNzfSBcdTVGNjJcdTcyQjZcdTVCOENcdTUxNjhcdTRFMDBcdTgxRjRcdUZGMDlcdUZGMUJcbiAqICAtIGB0b2RheWAgXHU0RjVDXHU0RTNBXHU1RkM1XHU1ODZCXHU1M0MyXHU2NTcwXHU2Q0U4XHU1MTY1XHVGRjA4XHU1M0VGXHU1MzU1XHU2RDRCXHUzMDAxXHU3ODZFXHU1QjlBXHU2MDI3XHVGRjA5XHVGRjFCXG4gKiAgLSBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDXHU1M0VGXHU1MzU1XHU2RDRCXHUzMDAyXG4gKlxuICogXHU0RTA5XHU1QzQyXHU4QkM0XHU1MjA2XHU0RjUzXHU3Q0ZCXHVGRjA4XHU4QkJFXHU4QkExXHU1NEYyXHU1QjY2XHU4OUMxIGRvY3MvcGxhbnMvMjAyNi0wNy0xNi1oZWFsdGgtc2NvcmUtZGlhZ25vc2lzLWRlc2lnbi5tZFx1RkYwOVx1RkYxQVxuICogIEwxIFx1NTdGQVx1Nzg0MFx1NTA2NVx1NUVCN1x1NTIwNlx1RkYwOFx1NUM2NVx1N0VBNlx1ODBGRFx1NTI5Qlx1RkYwOTQ1JSBcdTIwMTQgXHU2MzA5XHU2NUY2IDMwJSAvIFx1OTAwMlx1NUVBNlx1NjNEMFx1NTI0RCAxMCUgLyBcdTU0NjhcdTZEM0JcdThEQzMgNSVcbiAqICBMMiBcdThEOEJcdTUyQkZcdTUyQThcdTUyOUJcdTUyMDZcdUZGMDhcdTYyMTBcdTk1N0ZcdTgwRkRcdTUyOUJcdUZGMDkzMCUgXHUyMDE0IFx1OEZEQlx1NUVBNlx1OEQ4Qlx1NTJCRiAyMCUgLyBcdTVCOENcdTYyMTBcdThEOEJcdTUyQkYgMTAlXG4gKiAgTDMgXHU1M0VGXHU2MzAxXHU3RUVEXHU2MDI3XHU1MjA2XHVGRjA4XHU1MDY1XHU1RUI3XHU3QTBCXHU1RUE2XHVGRjA5MjUlIFx1MjAxNCBcdTUwNUNcdTZFREVcdTYwRTlcdTdGNUEgLyBcdTU3NDdcdTg4NjFcdTVFQTYgLyBcdThGQzdcdTVFQTZcdThEODVcdTUyNERcdTYwRTlcdTdGNUEgLyBcdTYyRDZcdTVFRjZcdTYwRTlcdTdGNUFcbiAqXG4gKiBcdTUzQ0RcdTc2RjRcdTg5QzlcdTRFRjdcdTUwM0NcdTg5QzJcdUZGMDhBSSBcdThCQ0FcdTY1QURcdTVGQzVcdTk4N0JcdTYzQTVcdTRGNEZcdUZGMDlcdUZGMUFcbiAqICAtIFx1MzAwQ1x1OTg4Nlx1NTE0OFx1MzAwRFx1MjI2MFx1MzAwQ1x1NTA2NVx1NUVCN1x1MzAwRFx1RkYxQVx1OEZDN1x1NUVBNlx1OEQ4NVx1NTI0RFx1RkYwOFx1NjNEMFx1NTI0RCA+MyBcdTVERTVcdTRGNUNcdTY1RTVcdTVCOENcdTYyMTBcdUZGMDlcdTg4QUJcdTYwRTlcdTdGNUFcdUZGMUJcbiAqICAtIFx1NTA1Q1x1NkVERVx1NjMwN1x1NjU3MFx1N0VBN1x1NjA3Nlx1NTMxNlx1RkYxQShkYXlzLzUpXjEuNVx1RkYxQlxuICogIC0gXHU1QjUwXHU5ODc5XHU4RDhBXHU1NzQ3XHU4ODYxXHU4RDhBXHU1MDY1XHU1RUI3XHVGRjA4XHU4RkRCXHU1RUE2XHU2ODA3XHU1MUM2XHU1REVFXHU4RDhBXHU1QzBGXHU4RDhBXHU1OTdEXHVGRjA5XHVGRjFCXG4gKiAgLSBcdTVGNTJcdTU2RTBcdTYzMDlcdTMwMENcdTdFRjRcdTVFQTZcdTMwMERcdTgwMENcdTk3NUVcdTMwMENcdTY2MkZcdTU0MjZcdTg0M0RcdTU0MEVcdTMwMERcdTMwMDJcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IERldmlhdGlvbkNhY2hlIH0gZnJvbSAnLi9EZXZpYXRpb25DYWxjdWxhdG9yJztcbmltcG9ydCB0eXBlIHsgR29hbEl0ZW0sIEdvYWxTdWJJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCB0eXBlIEhlYWx0aExldmVsID0gJ2V4Y2VsbGVudCcgfCAnZ29vZCcgfCAnd2FybmluZycgfCAncmlzayc7XG5leHBvcnQgdHlwZSBIZWFsdGhEaW1lbnNpb24gPSAnTDEnIHwgJ0wyJyB8ICdMMyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoU3ViU2NvcmUge1xuICBzY29yZTogbnVtYmVyO1xuICBoaW50Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWx0aEwxIGV4dGVuZHMgSGVhbHRoU3ViU2NvcmUge1xuICBvblRpbWU6IEhlYWx0aFN1YlNjb3JlO1xuICBtb2RlcmF0ZUVhcmx5OiBIZWFsdGhTdWJTY29yZTtcbiAgd2Vla2x5QWN0aXZlOiBIZWFsdGhTdWJTY29yZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhMMiBleHRlbmRzIEhlYWx0aFN1YlNjb3JlIHtcbiAgcHJvZ3Jlc3NUcmVuZDogSGVhbHRoU3ViU2NvcmU7XG4gIGNvbXBsZXRpb25UcmVuZDogSGVhbHRoU3ViU2NvcmU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoU3RhZ25hdGlvbiB7XG4gIHBlbmFsdHk6IG51bWJlcjtcbiAgaGludD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhMMyBleHRlbmRzIEhlYWx0aFN1YlNjb3JlIHtcbiAgc3RhZ25hdGlvbjogSGVhbHRoU3RhZ25hdGlvbjtcbiAgYmFsYW5jZTogSGVhbHRoU3ViU2NvcmU7XG4gIG92ZXJFYXJseTogSGVhbHRoU3RhZ25hdGlvbjtcbiAgZGVsYXk6IEhlYWx0aFN0YWduYXRpb247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoUmVzdWx0IHtcbiAgc2NvcmU6IG51bWJlcjtcbiAgbGV2ZWw6IEhlYWx0aExldmVsO1xuICBsYWJlbDogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBMMTogSGVhbHRoTDE7XG4gIEwyOiBIZWFsdGhMMjtcbiAgTDM6IEhlYWx0aEwzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWx0aFNldCB7XG4gIGF2Z1Njb3JlOiBudW1iZXI7XG4gIGF2Z0xldmVsOiBIZWFsdGhMZXZlbDtcbiAgYXZnTGFiZWw6IHN0cmluZztcbiAgYXZnQ29sb3I6IHN0cmluZztcbiAgY291bnQ6IG51bWJlcjtcbiAgTDE6IG51bWJlcjtcbiAgTDI6IG51bWJlcjtcbiAgTDM6IG51bWJlcjtcbiAgdHJlbmQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgSGVhbHRoSGludFR5cGUgPSAnZGFuZ2VyJyB8ICd3YXJuaW5nJyB8ICdzdWNjZXNzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhIaW50IHtcbiAgLyoqIFx1OEJFNVx1NUY1Mlx1NTZFMFx1NjMwN1x1NTQxMVx1NzY4NFx1NTA2NVx1NUVCN1x1NTIwNlx1N0VGNFx1NUVBNlx1RkYwOFx1NEY5Qlx1OEJDQVx1NjVBRFx1NjNEMFx1NzkzQVx1OEJDRFx1NjMwOVx1N0VGNFx1NUVBNlx1NUJGOVx1OUY1MFx1NUVGQVx1OEJBRVx1RkYwOSAqL1xuICBkaW1lbnNpb246IEhlYWx0aERpbWVuc2lvbjtcbiAgdHlwZTogSGVhbHRoSGludFR5cGU7XG4gIGljb246IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBhY3Rpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IFRVTklORyA9IHtcbiAgLy8gXHU0RTA5XHU1QzQyXHU2MDNCXHU1MjA2XHU2NzQzXHU5MUNEXG4gIFdFSUdIVF9MMTogMC40NSxcbiAgV0VJR0hUX0wyOiAwLjMsXG4gIFdFSUdIVF9MMzogMC4yNSxcblxuICAvLyBMMSBcdTUxODVcdTkwRThcdTVCNTBcdTk4NzlcdTY3NDNcdTkxQ0RcbiAgTDFfT05fVElNRTogMC4zLFxuICBMMV9NT0RFUkFURV9FQVJMWTogMC4xLFxuICBMMV9XRUVLTFlfQUNUSVZFOiAwLjA1LFxuXG4gIC8vIEwyIFx1NTE4NVx1OTBFOFx1NUI1MFx1OTg3OVx1Njc0M1x1OTFDRFxuICBMMl9QUk9HUkVTU19UUkVORDogMC4yLFxuICBMMl9DT01QTEVUSU9OX1RSRU5EOiAwLjEsXG5cbiAgLy8gTDMgXHU1MTg1XHU5MEU4XHU1RTczXHU4ODYxXHU1MjA2XHU2NzQzXHU5MUNEXG4gIEwzX0JBTEFOQ0U6IDAuMSxcblxuICAvLyBcdTU0NjhcdTZEM0JcdThEQzNcdTVFQTYgLyBcdThGREJcdTVFQTZcdThEOEJcdTUyQkZcdTU2REVcdTZFQUZcdTU5MjlcdTY1NzBcbiAgUkVDRU5UX0RBWVM6IDcsXG4gIC8vIFx1NTA1Q1x1NkVERVx1NjhDMFx1NkQ0Qlx1NjcwMFx1NTkyN1x1NTZERVx1NkVBRlx1NTkyOVx1NjU3MFxuICBTVEFHTkFUSU9OX1dJTkRPVzogNjAsXG5cbiAgLy8gXHU4RkM3XHU1RUE2XHU4RDg1XHU1MjREIC8gXHU2MkQ2XHU1RUY2XHU1QkJEXHU1QkI5XHU1OTI5XHU2NTcwXHU0RTBFXHU2MEU5XHU3RjVBXHU3Q0ZCXHU2NTcwXG4gIFRPTEVSQU5DRV9FQVJMWV9EQVlTOiAzLFxuICBPVkVSX0VBUkxZX1BFTkFMVFlfTUFYOiA1MCxcbiAgT1ZFUl9FQVJMWV9QRU5BTFRZX1JBVEU6IDUsXG4gIFRPTEVSQU5DRV9ERUxBWV9EQVlTOiAzLFxuICBERUxBWV9QRU5BTFRZX01BWDogMzAsXG4gIERFTEFZX1BFTkFMVFlfUkFURTogMyxcblxuICAvLyBcdTUwNUNcdTZFREVcdTYwRTlcdTdGNUFcdTYzMDdcdTY1NzBcdTY2RjJcdTdFQkZcbiAgU1RBR05BVElPTl9FWFBPTkVOVDogMS41LFxuICBTVEFHTkFUSU9OX0RJVklTT1I6IDUsXG4gIFNUQUdOQVRJT05fUEVOQUxUWV9NQVg6IDQwLFxuXG4gIC8vIFx1NUU3M1x1ODg2MVx1NTIwNlx1NjBFOVx1N0Y1QVx1N0NGQlx1NjU3MFxuICBCQUxBTkNFX1BFTkFMVFlfUkFURTogMS41LFxuXG4gIC8vIEwyIFx1OEZEQlx1NUVBNlx1OEQ4Qlx1NTJCRlx1NTIyNFx1NUI5QVx1OTYwOFx1NTAzQ1xuICBUUkVORF9BQ0NFTF9USFJFU0hPTEQ6IDUsXG5cbiAgLy8gXHU1RUZBXHU4QkFFXHU3Q0ZCXHU3RURGXHU5NjA4XHU1MDNDXG4gIFNVR0dFU1RJT05fTE9XOiA2MCxcbiAgU1VHR0VTVElPTl9ISUdIOiA4NSxcblxuICAvLyBcdTdFRkNcdTU0MDhcdThEOEJcdTUyQkZcdTY2MjBcdTVDMDRcbiAgVFJFTkRfU1RST05HX0hJR0g6IDc1LFxuICBUUkVORF9XRUFLX0hJR0g6IDYwLFxuICBUUkVORF9TVFJPTkdfTE9XOiA0MCxcbiAgVFJFTkRfV0VBS19MT1c6IDU1LFxuXG4gIC8vIFx1N0I0OVx1N0VBN1x1NTIxMlx1NTIwNlx1OTYwOFx1NTAzQ1xuICBMRVZFTF9FWENFTExFTlQ6IDg1LFxuICBMRVZFTF9HT09EOiA3MCxcbiAgTEVWRUxfV0FSTklORzogNTAsXG5cbiAgLy8gXHU4QkNBXHU2NUFEXHU3Q0ZCXHU3RURGXHU5NjA4XHU1MDNDXG4gIEhJTlRfTDE6IDcwLFxuICBISU5UX0wyOiA2MCxcbiAgSElOVF9MMzogNzAsXG4gIEhJTlRfTEFURV9HT0FMX1NDT1JFOiA2MCxcbiAgSElOVF9TVEFHTkFUSU9OX1BFTkFMVFk6IDE1LFxuICBISU5UX0JBTEFOQ0VfU0NPUkU6IDYwLFxuICBISU5UX0hJR0hfU0NPUkU6IDkwLFxufTtcblxuY29uc3QgTEVWRUxTOiBSZWNvcmQ8SGVhbHRoTGV2ZWwsIHsgbGFiZWw6IHN0cmluZzsgbWluOiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfT4gPSB7XG4gIGV4Y2VsbGVudDogeyBsYWJlbDogJ1x1NEYxOFx1NzlDMCcsIG1pbjogVFVOSU5HLkxFVkVMX0VYQ0VMTEVOVCwgY29sb3I6ICd2YXIoLS1iYW1ib28tcHJpbWFyeSknIH0sXG4gIGdvb2Q6IHsgbGFiZWw6ICdcdTgyNkZcdTU5N0QnLCBtaW46IFRVTklORy5MRVZFTF9HT09ELCBjb2xvcjogJ3ZhcigtLWJhbWJvby1saWdodCknIH0sXG4gIHdhcm5pbmc6IHsgbGFiZWw6ICdcdTk3MDBcdTUxNzNcdTZDRTgnLCBtaW46IFRVTklORy5MRVZFTF9XQVJOSU5HLCBjb2xvcjogJyNmNTllMGInIH0sXG4gIHJpc2s6IHsgbGFiZWw6ICdcdTk4Q0VcdTk2NjknLCBtaW46IDAsIGNvbG9yOiAnI2RjMzU0NScgfSxcbn07XG5cbmZ1bmN0aW9uIGNsYW1wKHY6IG51bWJlciwgbG86IG51bWJlciwgaGk6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1heChsbywgTWF0aC5taW4oaGksIHYpKTtcbn1cblxuZnVuY3Rpb24gZm10KGQ6IERhdGUpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7ZC5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyhkLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpfS0ke1N0cmluZyhkLmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKX1gO1xufVxuXG4vKiogXHU3RUFGXHU1MUZEXHU2NTcwXHVGRjFBXHU2Nzg0XHU5MDIwXHU2N0QwXHU1RTc0XHU3Njg0XHU2Q0Q1XHU1QjlBXHU4MjgyXHU1MDQ3XHU2NUU1ICsgXHU2NjI1XHU4MjgyXHU5NkM2XHU1NDA4XHVGRjA4XHU0RTBFIHdlYmFwcCBcdTUzRTNcdTVGODRcdTRFMDBcdTgxRjRcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEhvbGlkYXlzKHJlZlllYXI6IG51bWJlcik6IFNldDxzdHJpbmc+IHtcbiAgY29uc3QgaCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBhZGQgPSAoeTogbnVtYmVyLCBtOiBudW1iZXIsIGQ6IG51bWJlcikgPT5cbiAgICBoLmFkZChgJHt5fS0ke1N0cmluZyhtKS5wYWRTdGFydCgyLCAnMCcpfS0ke1N0cmluZyhkKS5wYWRTdGFydCgyLCAnMCcpfWApO1xuICBbcmVmWWVhciwgcmVmWWVhciArIDFdLmZvckVhY2goKHkpID0+IHtcbiAgICBhZGQoeSwgMSwgMSk7XG4gICAgYWRkKHksIDUsIDEpOyBhZGQoeSwgNSwgMik7IGFkZCh5LCA1LCAzKTtcbiAgICBhZGQoeSwgMTAsIDEpOyBhZGQoeSwgMTAsIDIpOyBhZGQoeSwgMTAsIDMpOyBhZGQoeSwgMTAsIDQpOyBhZGQoeSwgMTAsIDUpOyBhZGQoeSwgMTAsIDYpOyBhZGQoeSwgMTAsIDcpO1xuICAgIGFkZCh5LCA0LCA0KTsgYWRkKHksIDQsIDUpOyBhZGQoeSwgNCwgNik7XG4gICAgYWRkKHksIDYsIDkpOyBhZGQoeSwgNiwgMTApO1xuICAgIGFkZCh5LCA5LCAxNCk7IGFkZCh5LCA5LCAxNSk7IGFkZCh5LCA5LCAxNik7XG4gIH0pO1xuICBpZiAocmVmWWVhciA8PSAyMDI1ICYmIDIwMjUgPD0gcmVmWWVhciArIDEpIHtcbiAgICBbJzIwMjUtMDEtMjgnLCAnMjAyNS0wMS0yOScsICcyMDI1LTAxLTMwJywgJzIwMjUtMDEtMzEnLFxuICAgICAgJzIwMjUtMDItMDEnLCAnMjAyNS0wMi0wMicsICcyMDI1LTAyLTAzJywgJzIwMjUtMDItMDQnXS5mb3JFYWNoKChkKSA9PiBoLmFkZChkKSk7XG4gIH1cbiAgaWYgKHJlZlllYXIgPD0gMjAyNiAmJiAyMDI2IDw9IHJlZlllYXIgKyAxKSB7XG4gICAgWycyMDI2LTAyLTE2JywgJzIwMjYtMDItMTcnLCAnMjAyNi0wMi0xOCcsICcyMDI2LTAyLTE5JyxcbiAgICAgICcyMDI2LTAyLTIwJywgJzIwMjYtMDItMjEnLCAnMjAyNi0wMi0yMiddLmZvckVhY2goKGQpID0+IGguYWRkKGQpKTtcbiAgfVxuICByZXR1cm4gaDtcbn1cblxubGV0IF9ob2xpZGF5Q2FjaGU6IHsgeWVhcjogbnVtYmVyOyBzZXQ6IFNldDxzdHJpbmc+IH0gfCBudWxsID0gbnVsbDtcbmZ1bmN0aW9uIF9nZXRIb2xpZGF5cyh5ZWFyOiBudW1iZXIpOiBTZXQ8c3RyaW5nPiB7XG4gIGlmIChfaG9saWRheUNhY2hlICYmIF9ob2xpZGF5Q2FjaGUueWVhciA9PT0geWVhcikgcmV0dXJuIF9ob2xpZGF5Q2FjaGUuc2V0O1xuICBjb25zdCBzZXQgPSBidWlsZEhvbGlkYXlzKHllYXIpO1xuICBfaG9saWRheUNhY2hlID0geyB5ZWFyLCBzZXQgfTtcbiAgcmV0dXJuIHNldDtcbn1cblxuZnVuY3Rpb24gaXNXb3JrZGF5KGQ6IERhdGUsIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPik6IGJvb2xlYW4ge1xuICBjb25zdCBkYXkgPSBkLmdldERheSgpO1xuICBpZiAoZGF5ID09PSAwIHx8IGRheSA9PT0gNikgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gIWhvbGlkYXlzLmhhcyhmbXQoZCkpO1xufVxuXG5mdW5jdGlvbiBjb3VudFdvcmtkYXlzKGZyb206IERhdGUsIHRvOiBEYXRlLCBob2xpZGF5czogU2V0PHN0cmluZz4pOiBudW1iZXIge1xuICBsZXQgY291bnQgPSAwO1xuICBjb25zdCBjdXIgPSBuZXcgRGF0ZShmcm9tLmdldEZ1bGxZZWFyKCksIGZyb20uZ2V0TW9udGgoKSwgZnJvbS5nZXREYXRlKCkpO1xuICBjb25zdCBsYXN0ID0gbmV3IERhdGUodG8uZ2V0RnVsbFllYXIoKSwgdG8uZ2V0TW9udGgoKSwgdG8uZ2V0RGF0ZSgpKTtcbiAgaWYgKGN1ciA+IGxhc3QpIHJldHVybiAwO1xuICB3aGlsZSAoY3VyIDw9IGxhc3QpIHtcbiAgICBpZiAoaXNXb3JrZGF5KGN1ciwgaG9saWRheXMpKSBjb3VudCsrO1xuICAgIGN1ci5zZXREYXRlKGN1ci5nZXREYXRlKCkgKyAxKTtcbiAgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbmZ1bmN0aW9uIHdvcmtkYXlzQmV0d2Vlbihmcm9tOiBEYXRlLCB0bzogRGF0ZSwgaG9saWRheXM6IFNldDxzdHJpbmc+KTogbnVtYmVyIHtcbiAgY29uc3QgYSA9IG5ldyBEYXRlKGZyb20uZ2V0RnVsbFllYXIoKSwgZnJvbS5nZXRNb250aCgpLCBmcm9tLmdldERhdGUoKSk7XG4gIGNvbnN0IGIgPSBuZXcgRGF0ZSh0by5nZXRGdWxsWWVhcigpLCB0by5nZXRNb250aCgpLCB0by5nZXREYXRlKCkpO1xuICBpZiAoYiA+PSBhKSByZXR1cm4gY291bnRXb3JrZGF5cyhhLCBiLCBob2xpZGF5cyk7XG4gIHJldHVybiAtY291bnRXb3JrZGF5cyhiLCBhLCBob2xpZGF5cyk7XG59XG5cbmZ1bmN0aW9uIGNhY2hlQWN0aXZlT25EYXRlKGNhY2hlOiBEZXZpYXRpb25DYWNoZSwgZ29hbElkOiBzdHJpbmcsIGRhdGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBkYXkgPSBjYWNoZS5ieURhdGVLZXlbZGF0ZUtleV07XG4gIGlmICghZGF5KSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGVudHJ5ID0gZGF5W2dvYWxJZF07XG4gIHJldHVybiAhIWVudHJ5ICYmICEhZW50cnkuYWN0aXZlO1xufVxuXG5mdW5jdGlvbiBjYWNoZUNvbXBsZXRpb25zT25EYXRlKGNhY2hlOiBEZXZpYXRpb25DYWNoZSwgZ29hbElkOiBzdHJpbmcsIGRhdGVLZXk6IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IGRheSA9IGNhY2hlLmJ5RGF0ZUtleVtkYXRlS2V5XTtcbiAgaWYgKCFkYXkpIHJldHVybiAwO1xuICBjb25zdCBlbnRyeSA9IGRheVtnb2FsSWRdO1xuICByZXR1cm4gZW50cnkgPyAoZW50cnkuY29tcGxldGlvbnMgfHwgMCkgOiAwO1xufVxuXG5mdW5jdGlvbiBjYWNoZVByb2dyZXNzT25EYXRlKGNhY2hlOiBEZXZpYXRpb25DYWNoZSwgZ29hbElkOiBzdHJpbmcsIGRhdGVLZXk6IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGRheSA9IGNhY2hlLmJ5RGF0ZUtleVtkYXRlS2V5XTtcbiAgaWYgKCFkYXkpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IGVudHJ5ID0gZGF5W2dvYWxJZF07XG4gIHJldHVybiBlbnRyeSA/IGVudHJ5LnByb2dyZXNzIDogdW5kZWZpbmVkO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgTDEgXHU1N0ZBXHU3ODQwXHU1MDY1XHU1RUI3XHU1MjA2XHVGRjA4XHU1QzY1XHU3RUE2XHU4MEZEXHU1MjlCXHVGRjA5NDUlIFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gc2NvcmVPblRpbWUoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBwcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGlmICghZ29hbC5lbmREYXRlKSByZXR1cm4geyBzY29yZTogNzAsIGhpbnQ6ICdcdTY3MkFcdThCQkVcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUYnIH07XG4gIGlmIChnb2FsLnN0YXJ0RGF0ZSAmJiBnb2FsLmVuZERhdGUpIHtcbiAgICBjb25zdCBzID0gbmV3IERhdGUoZ29hbC5zdGFydERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gICAgY29uc3QgZSA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgICBpZiAocyA+IGUpIHJldHVybiB7IHNjb3JlOiAwLCBoaW50OiAnXHU2NUU1XHU2NzFGXHU4MzAzXHU1NkY0XHU1RjAyXHU1RTM4JyB9O1xuICB9XG4gIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgZW5kLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBjb25zdCBkYXlzVG9EZWFkbGluZSA9IHdvcmtkYXlzQmV0d2Vlbih0b2RheSwgZW5kLCBob2xpZGF5cyk7XG5cbiAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICBpZiAoZGF5c1RvRGVhZGxpbmUgPj0gLVRVTklORy5UT0xFUkFOQ0VfREVMQVlfREFZUyAmJiBkYXlzVG9EZWFkbGluZSA8PSAwKSB7XG4gICAgICByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwJyB9O1xuICAgIH1cbiAgICBpZiAoZGF5c1RvRGVhZGxpbmUgPiAwKSByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU2M0QwXHU1MjREXHU1QjhDXHU2MjEwJyB9O1xuICAgIGNvbnN0IGxhdGUgPSBNYXRoLmFicyhkYXlzVG9EZWFkbGluZSk7XG4gICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFRVTklORy5ERUxBWV9QRU5BTFRZX01BWCwgbGF0ZSAqIFRVTklORy5ERUxBWV9QRU5BTFRZX1JBVEUpO1xuICAgIHJldHVybiB7IHNjb3JlOiBjbGFtcCgxMDAgLSBwZW5hbHR5LCAwLCAxMDApLCBoaW50OiBgXHU2MkQ2XHU1RUY2JHtsYXRlfVx1NEUyQVx1NURFNVx1NEY1Q1x1NjVFNWAgfTtcbiAgfVxuXG4gIGlmIChkYXlzVG9EZWFkbGluZSA8IC1UVU5JTkcuVE9MRVJBTkNFX0RFTEFZX0RBWVMpIHtcbiAgICBjb25zdCBsYXRlID0gTWF0aC5hYnMoZGF5c1RvRGVhZGxpbmUpO1xuICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbihUVU5JTkcuREVMQVlfUEVOQUxUWV9NQVgsIGxhdGUgKiBUVU5JTkcuREVMQVlfUEVOQUxUWV9SQVRFKTtcbiAgICByZXR1cm4geyBzY29yZTogY2xhbXAoNzAgLSBwZW5hbHR5LCAwLCAxMDApLCBoaW50OiBgXHU1REYyXHU5MDNFXHU2NzFGJHtsYXRlfVx1NEUyQVx1NURFNVx1NEY1Q1x1NjVFNWAgfTtcbiAgfVxuXG4gIGlmICghZ29hbC5zdGFydERhdGUpIHJldHVybiB7IHNjb3JlOiA2NSwgaGludDogJ1x1NjcyQVx1OEJCRVx1NUYwMFx1NTlDQlx1NjVFNVx1NjcxRicgfTtcbiAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZShnb2FsLnN0YXJ0RGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgc3RhcnQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIGlmICh0b2RheSA8IHN0YXJ0KSByZXR1cm4geyBzY29yZTogODAsIGhpbnQ6ICdcdTVDMUFcdTY3MkFcdTVGMDBcdTU5Q0InIH07XG5cbiAgY29uc3QgdG90YWxXb3JrZGF5cyA9IGNvdW50V29ya2RheXMoc3RhcnQsIGVuZCwgaG9saWRheXMpO1xuICBjb25zdCBlbGFwc2VkV29ya2RheXMgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCB0b2RheSwgaG9saWRheXMpO1xuICBjb25zdCBleHBlY3RlZCA9IHRvdGFsV29ya2RheXMgPiAwID8gKGVsYXBzZWRXb3JrZGF5cyAvIHRvdGFsV29ya2RheXMpICogMTAwIDogNTA7XG4gIGNvbnN0IGRpZmYgPSBwcm9ncmVzcyAtIGV4cGVjdGVkO1xuXG4gIGlmIChkaWZmID49IDApIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdThGREJcdTVFQTZcdThGQkVcdTY4MDcnIH07XG4gIGlmIChkaWZmID4gLTE1KSByZXR1cm4geyBzY29yZTogY2xhbXAoODUgKyBkaWZmLCAwLCAxMDApLCBoaW50OiAnXHU4RjdCXHU1RkFFXHU4NDNEXHU1NDBFJyB9O1xuICBpZiAoZGlmZiA+IC0zMCkgcmV0dXJuIHsgc2NvcmU6IGNsYW1wKDYwICsgZGlmZiAqIDAuNSwgMCwgMTAwKSwgaGludDogJ1x1NjYwRVx1NjYzRVx1ODQzRFx1NTQwRScgfTtcbiAgcmV0dXJuIHsgc2NvcmU6IGNsYW1wKDQwICsgZGlmZiAqIDAuMiwgMCwgMTAwKSwgaGludDogJ1x1NEUyNVx1OTFDRFx1ODQzRFx1NTQwRScgfTtcbn1cblxuZnVuY3Rpb24gc2NvcmVNb2RlcmF0ZUVhcmx5KFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoU3ViU2NvcmUge1xuICBpZiAoIWdvYWwuZW5kRGF0ZSkgcmV0dXJuIHsgc2NvcmU6IDcwLCBoaW50OiAnXHU2NzJBXHU4QkJFXHU2MjJBXHU2QjYyXHU2NUU1XHU2NzFGJyB9O1xuICBjb25zdCBlbmQgPSBuZXcgRGF0ZShnb2FsLmVuZERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gIGVuZC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgY29uc3QgZGF5c1RvRGVhZGxpbmUgPSB3b3JrZGF5c0JldHdlZW4odG9kYXksIGVuZCwgaG9saWRheXMpO1xuXG4gIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgaWYgKGRheXNUb0RlYWRsaW5lID49IDEgJiYgZGF5c1RvRGVhZGxpbmUgPD0gVFVOSU5HLlRPTEVSQU5DRV9FQVJMWV9EQVlTKSB7XG4gICAgICByZXR1cm4geyBzY29yZTogODAsIGhpbnQ6ICdcdTkwMDJcdTVFQTZcdTYzRDBcdTUyNEQnIH07XG4gICAgfVxuICAgIGlmIChkYXlzVG9EZWFkbGluZSA+IFRVTklORy5UT0xFUkFOQ0VfRUFSTFlfREFZUykge1xuICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFxuICAgICAgICBUVU5JTkcuT1ZFUl9FQVJMWV9QRU5BTFRZX01BWCxcbiAgICAgICAgZGF5c1RvRGVhZGxpbmUgKiBUVU5JTkcuT1ZFUl9FQVJMWV9QRU5BTFRZX1JBVEVcbiAgICAgICk7XG4gICAgICByZXR1cm4geyBzY29yZTogY2xhbXAoODAgLSBwZW5hbHR5LCAwLCAxMDApLCBoaW50OiBgXHU4RkM3XHU1RUE2XHU4RDg1XHU1MjREJHtkYXlzVG9EZWFkbGluZX1cdTU5MjlgIH07XG4gICAgfVxuICAgIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTAnIH07XG4gIH1cblxuICBpZiAoZGF5c1RvRGVhZGxpbmUgPiBUVU5JTkcuVE9MRVJBTkNFX0VBUkxZX0RBWVMgJiYgcHJvZ3Jlc3MgPj0gOTApIHtcbiAgICByZXR1cm4geyBzY29yZTogNzUsIGhpbnQ6ICdcdTYzQTVcdThGRDFcdTVCOENcdTYyMTAnIH07XG4gIH1cbiAgcmV0dXJuIHsgc2NvcmU6IDcwLCBoaW50OiAnXHU4RkRCXHU4ODRDXHU0RTJEJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZVdlZWtseUFjdGl2ZShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9pdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGxldCBhY3RpdmVEYXlzID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBUVU5JTkcuUkVDRU5UX0RBWVM7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgaWYgKCFpc1dvcmtkYXkoZCwgaG9saWRheXMpKSBjb250aW51ZTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgaWYgKGNhY2hlQWN0aXZlT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpKSBhY3RpdmVEYXlzKys7XG4gIH1cbiAgbGV0IHdvcmtkYXlzVGhpc1dlZWsgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IFRVTklORy5SRUNFTlRfREFZUzsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBpZiAoaXNXb3JrZGF5KGQsIGhvbGlkYXlzKSkgd29ya2RheXNUaGlzV2VlaysrO1xuICB9XG4gIGNvbnN0IHJhdGlvID0gd29ya2RheXNUaGlzV2VlayA+IDAgPyBhY3RpdmVEYXlzIC8gd29ya2RheXNUaGlzV2VlayA6IDA7XG4gIHJldHVybiB7XG4gICAgc2NvcmU6IGNsYW1wKE1hdGgucm91bmQocmF0aW8gKiAxMDApLCAwLCAxMDApLFxuICAgIGhpbnQ6IGFjdGl2ZURheXMgPiAwID8gYFx1NTQ2OFx1NkQzQlx1OERDMyR7YWN0aXZlRGF5c31cdTU5MjlgIDogJ1x1NjcyQ1x1NTQ2OFx1NjVFMFx1NjNBOFx1OEZEQicsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNjb3JlTDEoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBpdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhMMSB7XG4gIGNvbnN0IG9uVGltZSA9IHNjb3JlT25UaW1lKGdvYWwsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBob2xpZGF5cywgdG9kYXkpO1xuICBjb25zdCBtb2RlcmF0ZUVhcmx5ID0gc2NvcmVNb2RlcmF0ZUVhcmx5KGdvYWwsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBob2xpZGF5cywgdG9kYXkpO1xuICBjb25zdCB3ZWVrbHlBY3RpdmUgPSBzY29yZVdlZWtseUFjdGl2ZShnb2FsLCBpdGVtcywgY2FjaGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoXG4gICAgTWF0aC5yb3VuZChcbiAgICAgIChvblRpbWUuc2NvcmUgKiBUVU5JTkcuTDFfT05fVElNRSArXG4gICAgICAgIG1vZGVyYXRlRWFybHkuc2NvcmUgKiBUVU5JTkcuTDFfTU9ERVJBVEVfRUFSTFkgK1xuICAgICAgICB3ZWVrbHlBY3RpdmUuc2NvcmUgKiBUVU5JTkcuTDFfV0VFS0xZX0FDVElWRSkgL1xuICAgICAgICAoVFVOSU5HLkwxX09OX1RJTUUgKyBUVU5JTkcuTDFfTU9ERVJBVEVfRUFSTFkgKyBUVU5JTkcuTDFfV0VFS0xZX0FDVElWRSlcbiAgICApLFxuICAgIDAsXG4gICAgMTAwXG4gICk7XG4gIHJldHVybiB7IHNjb3JlOiBNYXRoLnJvdW5kKHNjb3JlKSwgb25UaW1lLCBtb2RlcmF0ZUVhcmx5LCB3ZWVrbHlBY3RpdmUgfTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIEwyIFx1OEQ4Qlx1NTJCRlx1NTJBOFx1NTI5Qlx1NTIwNlx1RkYwOFx1NjIxMFx1OTU3Rlx1ODBGRFx1NTI5Qlx1RkYwOTMwJSBcdTI1MDBcdTI1MDBcdTI1MDBcbmZ1bmN0aW9uIHNjb3JlUHJvZ3Jlc3NUcmVuZChcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9pdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGlmIChpc0NvbXBsZXRlKSByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU1REYyXHU1QjhDXHU2MjEwJyB9O1xuICBpZiAoIWdvYWwuc3RhcnREYXRlIHx8ICFnb2FsLmVuZERhdGUpIHJldHVybiB7IHNjb3JlOiA2MCwgaGludDogJ1x1N0YzQVx1NUMxMVx1NjVFNVx1NjcxRlx1NEZFMVx1NjA2RicgfTtcbiAgaWYgKGdvYWwuc3RhcnREYXRlICYmIGdvYWwuZW5kRGF0ZSkge1xuICAgIGNvbnN0IHMgPSBuZXcgRGF0ZShnb2FsLnN0YXJ0RGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgICBjb25zdCBlID0gbmV3IERhdGUoZ29hbC5lbmREYXRlICsgJ1QwMDowMDowMCcpO1xuICAgIGlmIChzID4gZSkgcmV0dXJuIHsgc2NvcmU6IDAsIGhpbnQ6ICdcdTY1RTVcdTY3MUZcdTgzMDNcdTU2RjRcdTVGMDJcdTVFMzgnIH07XG4gIH1cblxuICBjb25zdCBzdGFydCA9IG5ldyBEYXRlKGdvYWwuc3RhcnREYXRlICsgJ1QwMDowMDowMCcpO1xuICBzdGFydC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgaWYgKHRvZGF5IDwgc3RhcnQpIHJldHVybiB7IHNjb3JlOiA1MCwgaGludDogJ1x1NUMxQVx1NjcyQVx1NUYwMFx1NTlDQicgfTtcblxuICBjb25zdCByZWNlbnREYXlzID0gVFVOSU5HLlJFQ0VOVF9EQVlTO1xuICBsZXQgcmVjZW50UHJvZ3Jlc3MgPSAwO1xuICBsZXQgb2xkZXJQcm9ncmVzcyA9IDA7XG4gIGxldCByZWNlbnRIYXNEYXRhID0gZmFsc2U7XG4gIGxldCBvbGRlckhhc0RhdGEgPSBmYWxzZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlY2VudERheXM7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgY29uc3Qga2V5ID0gZm10KGQpO1xuICAgIGNvbnN0IHAgPSBjYWNoZVByb2dyZXNzT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpO1xuICAgIGlmIChwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlY2VudFByb2dyZXNzID0gcDtcbiAgICAgIHJlY2VudEhhc0RhdGEgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IGkgPSByZWNlbnREYXlzOyBpIDwgcmVjZW50RGF5cyAqIDI7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgY29uc3Qga2V5ID0gZm10KGQpO1xuICAgIGNvbnN0IHAgPSBjYWNoZVByb2dyZXNzT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpO1xuICAgIGlmIChwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG9sZGVyUHJvZ3Jlc3MgPSBwO1xuICAgICAgb2xkZXJIYXNEYXRhID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmICghcmVjZW50SGFzRGF0YSAmJiAhb2xkZXJIYXNEYXRhKSB7XG4gICAgY29uc3QgZW5kID0gbmV3IERhdGUoZ29hbC5lbmREYXRlICsgJ1QwMDowMDowMCcpO1xuICAgIGVuZC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgICBjb25zdCB0b3RhbFdkID0gY291bnRXb3JrZGF5cyhzdGFydCwgZW5kLCBob2xpZGF5cyk7XG4gICAgY29uc3QgZWxhcHNlZFdkID0gY291bnRXb3JrZGF5cyhzdGFydCwgdG9kYXksIGhvbGlkYXlzKTtcbiAgICBjb25zdCBleHBlY3RlZCA9IHRvdGFsV2QgPiAwID8gKGVsYXBzZWRXZCAvIHRvdGFsV2QpICogMTAwIDogNTA7XG4gICAgY29uc3QgZGlmZiA9IHByb2dyZXNzIC0gZXhwZWN0ZWQ7XG4gICAgaWYgKGRpZmYgPj0gMCkgcmV0dXJuIHsgc2NvcmU6IDgwLCBoaW50OiAnXHU4RkRCXHU1RUE2XHU2QjYzXHU1RTM4JyB9O1xuICAgIGlmIChkaWZmID4gLTIwKSByZXR1cm4geyBzY29yZTogNjAsIGhpbnQ6ICdcdTdBMERcdTY3MDlcdTg0M0RcdTU0MEUnIH07XG4gICAgcmV0dXJuIHsgc2NvcmU6IDQwLCBoaW50OiAnXHU4RkRCXHU1RUE2XHU1MDRGXHU2MTYyJyB9O1xuICB9XG5cbiAgaWYgKCFvbGRlckhhc0RhdGEpIHJldHVybiB7IHNjb3JlOiA2NSwgaGludDogJ1x1NjU3MFx1NjM2RVx1NEUwRFx1OERCMycgfTtcblxuICBjb25zdCBkaWZmID0gcmVjZW50UHJvZ3Jlc3MgLSBvbGRlclByb2dyZXNzO1xuICBpZiAoZGlmZiA+IFRVTklORy5UUkVORF9BQ0NFTF9USFJFU0hPTEQpIHJldHVybiB7IHNjb3JlOiA5MCwgaGludDogJ1x1OEZEQlx1NUVBNlx1NTJBMFx1OTAxRicgfTtcbiAgaWYgKGRpZmYgPiAwKSByZXR1cm4geyBzY29yZTogNzUsIGhpbnQ6ICdcdTdBMzNcdTZCNjVcdTYzQThcdThGREInIH07XG4gIGlmIChkaWZmID09PSAwKSByZXR1cm4geyBzY29yZTogNTAsIGhpbnQ6ICdcdThGREJcdTVFQTZcdTUwNUNcdTZFREUnIH07XG4gIHJldHVybiB7IHNjb3JlOiAzMCwgaGludDogJ1x1OEZEQlx1NUVBNlx1NTAxMlx1OTAwMCcgfTtcbn1cblxuZnVuY3Rpb24gc2NvcmVDb21wbGV0aW9uVHJlbmQoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBfaXRlbXM6IEdvYWxTdWJJdGVtW10sXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgX2hvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFN1YlNjb3JlIHtcbiAgaWYgKGlzQ29tcGxldGUpIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTVERjJcdTVCOENcdTYyMTAnIH07XG4gIGlmICghZ29hbC5pdGVtcyB8fCBnb2FsLml0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHsgc2NvcmU6IDYwLCBoaW50OiAnXHU2NUUwXHU1QjUwXHU5ODc5JyB9O1xuXG4gIGxldCByZWNlbnRDb21wbGV0aW9ucyA9IDA7XG4gIGxldCBvbGRlckNvbXBsZXRpb25zID0gMDtcbiAgY29uc3QgcmVjZW50RGF5cyA9IFRVTklORy5SRUNFTlRfREFZUztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlY2VudERheXM7IGkrKykge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0b2RheSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgY29uc3Qga2V5ID0gZm10KGQpO1xuICAgIHJlY2VudENvbXBsZXRpb25zICs9IGNhY2hlQ29tcGxldGlvbnNPbkRhdGUoY2FjaGUsIGdvYWwuaWQsIGtleSk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IHJlY2VudERheXM7IGkgPCByZWNlbnREYXlzICogMjsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgb2xkZXJDb21wbGV0aW9ucyArPSBjYWNoZUNvbXBsZXRpb25zT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpO1xuICB9XG5cbiAgaWYgKHJlY2VudENvbXBsZXRpb25zID09PSAwICYmIG9sZGVyQ29tcGxldGlvbnMgPT09IDApIHtcbiAgICByZXR1cm4geyBzY29yZTogNTAsIGhpbnQ6ICdcdThGRDFcdTY3MUZcdTY1RTBcdTVCOENcdTYyMTAnIH07XG4gIH1cbiAgaWYgKHJlY2VudENvbXBsZXRpb25zID4gb2xkZXJDb21wbGV0aW9ucykgcmV0dXJuIHsgc2NvcmU6IDg1LCBoaW50OiAnXHU1QjhDXHU2MjEwXHU1MkEwXHU5MDFGJyB9O1xuICBpZiAocmVjZW50Q29tcGxldGlvbnMgPT09IG9sZGVyQ29tcGxldGlvbnMpIHJldHVybiB7IHNjb3JlOiA2NSwgaGludDogJ1x1NUI4Q1x1NjIxMFx1N0EzM1x1NUI5QScgfTtcbiAgcmV0dXJuIHsgc2NvcmU6IDQwLCBoaW50OiAnXHU1QjhDXHU2MjEwXHU2NTNFXHU3RjEzJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZUwyKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgaXRlbXM6IEdvYWxTdWJJdGVtW10sXG4gIHByb2dyZXNzOiBudW1iZXIsXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoTDIge1xuICBjb25zdCBwcm9ncmVzc1RyZW5kID0gc2NvcmVQcm9ncmVzc1RyZW5kKGdvYWwsIGl0ZW1zLCBwcm9ncmVzcywgaXNDb21wbGV0ZSwgY2FjaGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IGNvbXBsZXRpb25UcmVuZCA9IHNjb3JlQ29tcGxldGlvblRyZW5kKGdvYWwsIGl0ZW1zLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHRvZGF5KTtcbiAgY29uc3Qgc2NvcmUgPSBjbGFtcChcbiAgICBNYXRoLnJvdW5kKFxuICAgICAgKHByb2dyZXNzVHJlbmQuc2NvcmUgKiBUVU5JTkcuTDJfUFJPR1JFU1NfVFJFTkQgK1xuICAgICAgICBjb21wbGV0aW9uVHJlbmQuc2NvcmUgKiBUVU5JTkcuTDJfQ09NUExFVElPTl9UUkVORCkgL1xuICAgICAgICAoVFVOSU5HLkwyX1BST0dSRVNTX1RSRU5EICsgVFVOSU5HLkwyX0NPTVBMRVRJT05fVFJFTkQpXG4gICAgKSxcbiAgICAwLFxuICAgIDEwMFxuICApO1xuICByZXR1cm4geyBzY29yZTogTWF0aC5yb3VuZChzY29yZSksIHByb2dyZXNzVHJlbmQsIGNvbXBsZXRpb25UcmVuZCB9O1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgTDMgXHU1M0VGXHU2MzAxXHU3RUVEXHU2MDI3XHU1MjA2XHVGRjA4XHU1MDY1XHU1RUI3XHU3QTBCXHU1RUE2XHVGRjA5MjUlIFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gc2NvcmVTdGFnbmF0aW9uKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgX2l0ZW1zOiBHb2FsU3ViSXRlbVtdLFxuICBfcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdGFnbmF0aW9uIHtcbiAgaWYgKGlzQ29tcGxldGUpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICdcdTVERjJcdTVCOENcdTYyMTAnIH07XG4gIGlmICghZ29hbC5zdGFydERhdGUpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICdcdTY1RTBcdTVGMDBcdTU5Q0JcdTY1RTVcdTY3MUYnIH07XG5cbiAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZShnb2FsLnN0YXJ0RGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgc3RhcnQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIGlmICh0b2RheSA8IHN0YXJ0KSByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnXHU1QzFBXHU2NzJBXHU1RjAwXHU1OUNCJyB9O1xuXG4gIGxldCBsYXN0QWN0aXZlRGF0ZTogRGF0ZSB8IG51bGwgPSBudWxsO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IFRVTklORy5TVEFHTkFUSU9OX1dJTkRPVzsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgaWYgKGNhY2hlQWN0aXZlT25EYXRlKGNhY2hlLCBnb2FsLmlkLCBrZXkpKSB7XG4gICAgICBsYXN0QWN0aXZlRGF0ZSA9IGQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhc3RBY3RpdmVEYXRlKSB7XG4gICAgY29uc3Qgc3RhZ25hbnREYXlzID0gd29ya2RheXNCZXR3ZWVuKHN0YXJ0LCB0b2RheSwgaG9saWRheXMpO1xuICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbihcbiAgICAgIFRVTklORy5TVEFHTkFUSU9OX1BFTkFMVFlfTUFYLFxuICAgICAgTWF0aC5wb3coc3RhZ25hbnREYXlzIC8gVFVOSU5HLlNUQUdOQVRJT05fRElWSVNPUiwgVFVOSU5HLlNUQUdOQVRJT05fRVhQT05FTlQpXG4gICAgKTtcbiAgICByZXR1cm4geyBwZW5hbHR5OiBNYXRoLnJvdW5kKHBlbmFsdHkpLCBoaW50OiBgXHU0RUNFXHU2NzJBXHU2M0E4XHU4RkRCKCR7c3RhZ25hbnREYXlzfVx1NTkyOSlgIH07XG4gIH1cblxuICBjb25zdCBzdGFnbmFudERheXMgPSB3b3JrZGF5c0JldHdlZW4obGFzdEFjdGl2ZURhdGUsIHRvZGF5LCBob2xpZGF5cyk7XG4gIGlmIChzdGFnbmFudERheXMgPD0gMikgcmV0dXJuIHsgcGVuYWx0eTogMCwgaGludDogJ1x1OEZEMVx1NjcxRlx1NjcwOVx1NjNBOFx1OEZEQicgfTtcbiAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFxuICAgIFRVTklORy5TVEFHTkFUSU9OX1BFTkFMVFlfTUFYLFxuICAgIE1hdGgucG93KHN0YWduYW50RGF5cyAvIFRVTklORy5TVEFHTkFUSU9OX0RJVklTT1IsIFRVTklORy5TVEFHTkFUSU9OX0VYUE9ORU5UKVxuICApO1xuICByZXR1cm4geyBwZW5hbHR5OiBNYXRoLnJvdW5kKHBlbmFsdHkpLCBoaW50OiBgXHU1MDVDXHU2RURFJHtzdGFnbmFudERheXN9XHU0RTJBXHU1REU1XHU0RjVDXHU2NUU1YCB9O1xufVxuXG5mdW5jdGlvbiBzY29yZUJhbGFuY2UoaXRlbXM6IEdvYWxTdWJJdGVtW10sIGlzQ29tcGxldGU6IGJvb2xlYW4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGlmIChpc0NvbXBsZXRlKSByZXR1cm4geyBzY29yZTogMTAwLCBoaW50OiAnXHU1REYyXHU1QjhDXHU2MjEwJyB9O1xuICBpZiAoIWl0ZW1zIHx8IGl0ZW1zLmxlbmd0aCA8PSAxKSByZXR1cm4geyBzY29yZTogODAsIGhpbnQ6ICdcdTVCNTBcdTk4NzlcdTRFMERcdThEQjMnIH07XG5cbiAgY29uc3QgcHJvZ3Jlc3NlcyA9IGl0ZW1zLm1hcCgoaXQpID0+IHtcbiAgICBjb25zdCB0YXIgPSBwYXJzZUZsb2F0KGl0LnRhcmdldFZhbHVlID8/ICcwJyk7XG4gICAgaWYgKHRhciA9PT0gMCkge1xuICAgICAgY29uc3QgY3VyID0gcGFyc2VGbG9hdChpdC5jdXJyZW50VmFsdWUgPz8gJzAnKSB8fCAwO1xuICAgICAgcmV0dXJuIGN1ciA9PT0gMCA/IDEwMCA6IDA7XG4gICAgfVxuICAgIGNvbnN0IHRhclNhZmUgPSB0YXIgfHwgMTAwO1xuICAgIGNvbnN0IGN1ciA9IHBhcnNlRmxvYXQoaXQuY3VycmVudFZhbHVlID8/ICcwJykgfHwgMDtcbiAgICByZXR1cm4gKGN1ciAvIHRhclNhZmUpICogMTAwO1xuICB9KTtcblxuICBjb25zdCBhdmcgPSBwcm9ncmVzc2VzLnJlZHVjZSgocywgdikgPT4gcyArIHYsIDApIC8gcHJvZ3Jlc3Nlcy5sZW5ndGg7XG4gIGNvbnN0IHZhcmlhbmNlID0gcHJvZ3Jlc3Nlcy5yZWR1Y2UoKHMsIHYpID0+IHMgKyBNYXRoLnBvdyh2IC0gYXZnLCAyKSwgMCkgLyBwcm9ncmVzc2VzLmxlbmd0aDtcbiAgY29uc3Qgc3RkRGV2ID0gTWF0aC5zcXJ0KHZhcmlhbmNlKTtcblxuICBjb25zdCBzY29yZSA9IGNsYW1wKE1hdGgucm91bmQoMTAwIC0gc3RkRGV2ICogVFVOSU5HLkJBTEFOQ0VfUEVOQUxUWV9SQVRFKSwgMCwgMTAwKTtcbiAgcmV0dXJuIHtcbiAgICBzY29yZSxcbiAgICBoaW50OiBzdGREZXYgPiAzMCA/ICdcdThGREJcdTVFQTZcdTRFMERcdTU3NDdcdTg4NjEnIDogc3RkRGV2ID4gMTUgPyAnXHU4RkRCXHU1RUE2XHU3NTY1XHU2NzA5XHU1REVFXHU1RjAyJyA6ICdcdThGREJcdTVFQTZcdTU3NDdcdTg4NjEnLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzY29yZU92ZXJFYXJseShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9wcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdGFnbmF0aW9uIHtcbiAgaWYgKCFnb2FsLmVuZERhdGUgfHwgIWlzQ29tcGxldGUpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICcnIH07XG4gIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgZW5kLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBjb25zdCBkYXlzRWFybHkgPSB3b3JrZGF5c0JldHdlZW4odG9kYXksIGVuZCwgaG9saWRheXMpO1xuICBpZiAoZGF5c0Vhcmx5ID4gVFVOSU5HLlRPTEVSQU5DRV9FQVJMWV9EQVlTKSB7XG4gICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFxuICAgICAgVFVOSU5HLk9WRVJfRUFSTFlfUEVOQUxUWV9NQVgsXG4gICAgICBkYXlzRWFybHkgKiBUVU5JTkcuT1ZFUl9FQVJMWV9QRU5BTFRZX1JBVEVcbiAgICApO1xuICAgIHJldHVybiB7IHBlbmFsdHk6IE1hdGgucm91bmQocGVuYWx0eSksIGhpbnQ6IGBcdThGQzdcdTVFQTZcdThEODVcdTUyNEQke2RheXNFYXJseX1cdTU5MjlgIH07XG4gIH1cbiAgcmV0dXJuIHsgcGVuYWx0eTogMCwgaGludDogJycgfTtcbn1cblxuZnVuY3Rpb24gc2NvcmVEZWxheShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9wcm9ncmVzczogbnVtYmVyLFxuICBfaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoU3RhZ25hdGlvbiB7XG4gIGlmICghZ29hbC5lbmREYXRlKSByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnJyB9O1xuICBjb25zdCBlbmQgPSBuZXcgRGF0ZShnb2FsLmVuZERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gIGVuZC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgY29uc3QgZGF5c0xhdGUgPSB3b3JrZGF5c0JldHdlZW4oZW5kLCB0b2RheSwgaG9saWRheXMpO1xuICBpZiAoZGF5c0xhdGUgPiBUVU5JTkcuVE9MRVJBTkNFX0RFTEFZX0RBWVMpIHtcbiAgICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oVFVOSU5HLkRFTEFZX1BFTkFMVFlfTUFYLCBkYXlzTGF0ZSAqIFRVTklORy5ERUxBWV9QRU5BTFRZX1JBVEUpO1xuICAgIHJldHVybiB7IHBlbmFsdHk6IE1hdGgucm91bmQocGVuYWx0eSksIGhpbnQ6IGBcdTYyRDZcdTVFRjYke2RheXNMYXRlfVx1NTkyOWAgfTtcbiAgfVxuICByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZUwzKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgaXRlbXM6IEdvYWxTdWJJdGVtW10sXG4gIHByb2dyZXNzOiBudW1iZXIsXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoTDMge1xuICBjb25zdCBzdGFnbmF0aW9uID0gc2NvcmVTdGFnbmF0aW9uKGdvYWwsIGl0ZW1zLCBwcm9ncmVzcywgaXNDb21wbGV0ZSwgY2FjaGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IGJhbGFuY2UgPSBzY29yZUJhbGFuY2UoaXRlbXMsIGlzQ29tcGxldGUpO1xuICBjb25zdCBvdmVyRWFybHkgPSBzY29yZU92ZXJFYXJseShnb2FsLCBwcm9ncmVzcywgaXNDb21wbGV0ZSwgaG9saWRheXMsIHRvZGF5KTtcbiAgY29uc3QgZGVsYXkgPSBzY29yZURlbGF5KGdvYWwsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBob2xpZGF5cywgdG9kYXkpO1xuXG4gIGxldCBzY29yZSA9IDEwMDtcbiAgc2NvcmUgLT0gc3RhZ25hdGlvbi5wZW5hbHR5O1xuICBzY29yZSA9IHNjb3JlICogKDEgLSBUVU5JTkcuTDNfQkFMQU5DRSkgKyBiYWxhbmNlLnNjb3JlICogVFVOSU5HLkwzX0JBTEFOQ0U7XG4gIHNjb3JlIC09IG92ZXJFYXJseS5wZW5hbHR5O1xuICBzY29yZSAtPSBkZWxheS5wZW5hbHR5O1xuXG4gIHJldHVybiB7XG4gICAgc2NvcmU6IGNsYW1wKE1hdGgucm91bmQoc2NvcmUpLCAwLCAxMDApLFxuICAgIHN0YWduYXRpb24sXG4gICAgYmFsYW5jZSxcbiAgICBvdmVyRWFybHksXG4gICAgZGVsYXksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGxldmVsRm9yKHNjb3JlOiBudW1iZXIpOiBIZWFsdGhMZXZlbCB7XG4gIGlmIChzY29yZSA+PSBUVU5JTkcuTEVWRUxfRVhDRUxMRU5UKSByZXR1cm4gJ2V4Y2VsbGVudCc7XG4gIGlmIChzY29yZSA+PSBUVU5JTkcuTEVWRUxfR09PRCkgcmV0dXJuICdnb29kJztcbiAgaWYgKHNjb3JlID49IFRVTklORy5MRVZFTF9XQVJOSU5HKSByZXR1cm4gJ3dhcm5pbmcnO1xuICByZXR1cm4gJ3Jpc2snO1xufVxuXG4vKiogXHU1MzU1XHU3NkVFXHU2ODA3XHU1MDY1XHU1RUI3XHU1MjA2XHVGRjA4XHU1NDJCIEwxL0wyL0wzIFx1NjYwRVx1N0VDNiArIFx1NjAzQlx1NTIwNiArIFx1N0I0OVx1N0VBN1x1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVHb2FsSGVhbHRoKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoUmVzdWx0IHtcbiAgY29uc3QgaXRlbXMgPSBBcnJheS5pc0FycmF5KGdvYWwuaXRlbXMpID8gZ29hbC5pdGVtcyA6IFtdO1xuICBjb25zdCBwcm9ncmVzcyA9IGNsYW1wKE51bWJlcihnb2FsLnByb2dyZXNzKSB8fCAwLCAwLCAxMDApO1xuICBjb25zdCBpc0NvbXBsZXRlID0gcHJvZ3Jlc3MgPj0gMTAwO1xuICAvLyBcdTdFREZcdTRFMDBcdTVGNTJcdTRFMDBcdTRFM0FcdTVGNTNcdTY1RTUgMCBcdTcwQjlcdUZGMENcdTkwN0ZcdTUxNEQgaG91cnMgXHU1MDRGXHU1REVFXHU1RjcxXHU1NENEXHU1REU1XHU0RjVDXHU2NUU1L1x1NTA1Q1x1NkVERVx1NTIyNFx1NUI5QVxuICBjb25zdCB0ID0gbmV3IERhdGUodG9kYXkuZ2V0RnVsbFllYXIoKSwgdG9kYXkuZ2V0TW9udGgoKSwgdG9kYXkuZ2V0RGF0ZSgpKTtcbiAgY29uc3QgaG9saWRheXMgPSBfZ2V0SG9saWRheXModC5nZXRGdWxsWWVhcigpKTtcblxuICBjb25zdCBMMSA9IHNjb3JlTDEoZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHQpO1xuICBjb25zdCBMMiA9IHNjb3JlTDIoZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHQpO1xuICBjb25zdCBMMyA9IHNjb3JlTDMoZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHQpO1xuXG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoXG4gICAgTWF0aC5yb3VuZChcbiAgICAgIEwxLnNjb3JlICogVFVOSU5HLldFSUdIVF9MMSArXG4gICAgICAgIEwyLnNjb3JlICogVFVOSU5HLldFSUdIVF9MMiArXG4gICAgICAgIEwzLnNjb3JlICogVFVOSU5HLldFSUdIVF9MM1xuICAgICksXG4gICAgMCxcbiAgICAxMDBcbiAgKTtcbiAgY29uc3QgbGV2ZWwgPSBsZXZlbEZvcihzY29yZSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzY29yZSxcbiAgICBsZXZlbCxcbiAgICBsYWJlbDogTEVWRUxTW2xldmVsXS5sYWJlbCxcbiAgICBjb2xvcjogTEVWRUxTW2xldmVsXS5jb2xvcixcbiAgICBMMSxcbiAgICBMMixcbiAgICBMMyxcbiAgfTtcbn1cblxuLyoqIFx1NzZFRVx1NjgwN1x1OTZDNlx1NTA2NVx1NUVCN1x1NTIwNlx1ODA1QVx1NTQwOFx1RkYwOFx1NTkxQVx1N0VGNFx1NUU3M1x1NTc0N1x1NTIwNiArIFx1N0VGQ1x1NTQwOFx1OEQ4Qlx1NTJCRlx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVIZWFsdGhTZXQoXG4gIGdvYWxzOiBHb2FsSXRlbVtdLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTZXQge1xuICBpZiAoIWdvYWxzIHx8IGdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBhdmdTY29yZTogMCxcbiAgICAgIGF2Z0xldmVsOiAncmlzaycsXG4gICAgICBhdmdMYWJlbDogJ1x1MjAxNCcsXG4gICAgICBhdmdDb2xvcjogJyM5OTknLFxuICAgICAgY291bnQ6IDAsXG4gICAgICBMMTogMCxcbiAgICAgIEwyOiAwLFxuICAgICAgTDM6IDAsXG4gICAgICB0cmVuZDogMCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgcmVzdWx0cyA9IGdvYWxzLm1hcCgoZykgPT4gY29tcHV0ZUdvYWxIZWFsdGgoZywgY2FjaGUsIHRvZGF5KSk7XG4gIGNvbnN0IGF2Z1Njb3JlID0gTWF0aC5yb3VuZChyZXN1bHRzLnJlZHVjZSgocywgcikgPT4gcyArIHIuc2NvcmUsIDApIC8gcmVzdWx0cy5sZW5ndGgpO1xuICBjb25zdCBhdmdMMSA9IE1hdGgucm91bmQocmVzdWx0cy5yZWR1Y2UoKHMsIHIpID0+IHMgKyByLkwxLnNjb3JlLCAwKSAvIHJlc3VsdHMubGVuZ3RoKTtcbiAgY29uc3QgYXZnTDIgPSBNYXRoLnJvdW5kKHJlc3VsdHMucmVkdWNlKChzLCByKSA9PiBzICsgci5MMi5zY29yZSwgMCkgLyByZXN1bHRzLmxlbmd0aCk7XG4gIGNvbnN0IGF2Z0wzID0gTWF0aC5yb3VuZChyZXN1bHRzLnJlZHVjZSgocywgcikgPT4gcyArIHIuTDMuc2NvcmUsIDApIC8gcmVzdWx0cy5sZW5ndGgpO1xuICBjb25zdCBhdmdMZXZlbCA9IGxldmVsRm9yKGF2Z1Njb3JlKTtcblxuICBsZXQgdHJlbmQgPSAwO1xuICBjb25zdCBhdmdMMlNjb3JlID0gcmVzdWx0cy5yZWR1Y2UoKHMsIHIpID0+IHMgKyByLkwyLnNjb3JlLCAwKSAvIHJlc3VsdHMubGVuZ3RoO1xuICBpZiAoYXZnTDJTY29yZSA+PSBUVU5JTkcuVFJFTkRfU1RST05HX0hJR0gpIHRyZW5kID0gMztcbiAgZWxzZSBpZiAoYXZnTDJTY29yZSA+PSBUVU5JTkcuVFJFTkRfV0VBS19ISUdIKSB0cmVuZCA9IDE7XG4gIGVsc2UgaWYgKGF2Z0wyU2NvcmUgPCBUVU5JTkcuVFJFTkRfU1RST05HX0xPVykgdHJlbmQgPSAtMztcbiAgZWxzZSBpZiAoYXZnTDJTY29yZSA8IFRVTklORy5UUkVORF9XRUFLX0xPVykgdHJlbmQgPSAtMTtcblxuICByZXR1cm4ge1xuICAgIGF2Z1Njb3JlLFxuICAgIGF2Z0xldmVsLFxuICAgIGF2Z0xhYmVsOiBMRVZFTFNbYXZnTGV2ZWxdLmxhYmVsLFxuICAgIGF2Z0NvbG9yOiBMRVZFTFNbYXZnTGV2ZWxdLmNvbG9yLFxuICAgIGNvdW50OiBnb2Fscy5sZW5ndGgsXG4gICAgTDE6IGF2Z0wxLFxuICAgIEwyOiBhdmdMMixcbiAgICBMMzogYXZnTDMsXG4gICAgdHJlbmQsXG4gIH07XG59XG5cbi8qKlxuICogXHU2MzA5XHUzMDBDXHU3RUY0XHU1RUE2XHUzMDBEXHU3NTFGXHU2MjEwXHU1MDY1XHU1RUI3XHU1RjUyXHU1NkUwIGhpbnRzXHVGRjA4XHU3OUZCXHU2OTBEIHdlYmFwcCBnZW5lcmF0ZUR5bmFtaWNIaW50c1x1RkYwQ1xuICogXHU2QkNGXHU2NzYxXHU5ODlEXHU1OTE2XHU2ODA3XHU2Q0U4IGRpbWVuc2lvblx1RkYwQ1x1NEY5Qlx1OEJDQVx1NjVBRFx1NjNEMFx1NzkzQVx1OEJDRFx1NjMwOVx1N0VGNFx1NUVBNlx1NUJGOVx1OUY1MFx1NUVGQVx1OEJBRVx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVIZWFsdGhIaW50cyhyZXN1bHQ6IEhlYWx0aFJlc3VsdCwgX3NldD86IEhlYWx0aFNldCk6IEhlYWx0aEhpbnRbXSB7XG4gIGNvbnN0IGhpbnRzOiBIZWFsdGhIaW50W10gPSBbXTtcblxuICBpZiAocmVzdWx0LkwxLnNjb3JlIDwgVFVOSU5HLkhJTlRfTDEpIHtcbiAgICBpZiAocmVzdWx0LkwxLm9uVGltZS5zY29yZSA8IFRVTklORy5ISU5UX0xBVEVfR09BTF9TQ09SRSkge1xuICAgICAgaGludHMucHVzaCh7XG4gICAgICAgIGRpbWVuc2lvbjogJ0wxJyxcbiAgICAgICAgdHlwZTogJ2RhbmdlcicsXG4gICAgICAgIGljb246ICdjYWxlbmRhcicsXG4gICAgICAgIHRleHQ6ICdcdTdCOTdcdTZDRDVcdTY4QzBcdTZENEJcdTUyMzBcdThCRTVcdTc2RUVcdTY4MDdcdThGREJcdTVFQTZcdTRFMjVcdTkxQ0RcdTg0M0RcdTU0MEVcdTRFOEVcdThCQTFcdTUyMTJcdTMwMDInLFxuICAgICAgICBhY3Rpb246ICdcdTY4MzlcdTYzNkVcdTVGNTNcdTUyNERcdTVCOENcdTYyMTBcdTkwMUZcdTczODdcdUZGMENcdTVFRkFcdThCQUVcdThDMDNcdTY1NzRcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUZcdTYyMTZcdTdDQkVcdTdCODBcdTRFRkJcdTUyQTFcdTVCNTBcdTk4NzlcdTMwMDInLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuTDEuc2NvcmUgPCA1MCkge1xuICAgICAgaGludHMucHVzaCh7XG4gICAgICAgIGRpbWVuc2lvbjogJ0wxJyxcbiAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICBpY29uOiAnemFwJyxcbiAgICAgICAgdGV4dDogJ1x1N0NGQlx1N0VERlx1NzZEMVx1NkQ0Qlx1NTIzMFx1NjcyQ1x1NTQ2OFx1NkQzQlx1OERDM1x1NTkyOVx1NjU3MFx1NjcyQVx1OEZCRVx1NjgwN1x1MzAwMicsXG4gICAgICAgIGFjdGlvbjogJ1x1NjU3MFx1NjM2RVx1ODg2OFx1NjYwRVx1RkYxQVx1NUMwRlx1NkI2NVx1NUZFQlx1OEREMVx1NzY4NFx1OTg5MVx1NzM4N1x1NkJENFx1NTM1NVx1NkIyMVx1OTU3Rlx1NjVGNlx1OTVGNFx1NjI5NVx1NTE2NVx1NjZGNFx1NjcwOVx1NTJBOVx1NEU4RVx1N0VGNFx1NjMwMVx1NzZFRVx1NjgwN1x1NTA2NVx1NUVCN1x1MzAwMicsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpZiAocmVzdWx0LkwyLnNjb3JlIDwgVFVOSU5HLkhJTlRfTDIpIHtcbiAgICBoaW50cy5wdXNoKHtcbiAgICAgIGRpbWVuc2lvbjogJ0wyJyxcbiAgICAgIHR5cGU6ICd3YXJuaW5nJyxcbiAgICAgIGljb246ICd0cmVuZGluZy11cCcsXG4gICAgICB0ZXh0OiAnXHU1MkE4XHU1MjlCXHU2MzA3XHU2NTcwXHU0RTBCXHU5NjREXHVGRjFBXHU4RkQxXHU2NzFGXHU4RkRCXHU1RUE2XHU1ODlFXHU5MUNGXHU0RjRFXHU0RThFXHU1Mzg2XHU1M0YyXHU1RTczXHU1NzQ3XHU2QzM0XHU1RTczXHUzMDAyJyxcbiAgICAgIGFjdGlvbjogJ1x1NjI2N1x1ODg0Q1x1NTJBOFx1NTI5Qlx1OEZEQlx1NTE2NVx1NzRGNlx1OTg4OFx1NjcxRlx1RkYwQ1x1NUVGQVx1OEJBRVx1OTAxQVx1OEZDN1x1NUI4Q1x1NjIxMFx1NEUwMFx1NEUyQVx1N0I4MFx1NTM1NVx1NzY4NFx1NUI1MFx1OTg3OVx1Njc2NVx1OTFDRFx1NjVCMFx1NkZDMFx1NkQzQlx1NjBFRlx1NjAyN1x1MzAwMicsXG4gICAgfSk7XG4gIH1cblxuICAvLyBcdTYzMDlcdTMwMENcdTVCNTBcdTdFRjRcdTVFQTZcdTMwMERcdTU0MDRcdTgxRUFcdTg5RTZcdTUzRDFcdUZGMDhcdTRFMERcdTUzNjEgY29tcG9zaXRlIEwzLnNjb3JlXHVGRjBDXHU1NDI2XHU1MjE5XHU1MzU1XHU3NkVFXHU2ODA3XHU1MDRGXHU3OUQxXHU0RjFBXHU4OEFCXHU2M0E5XHU3NkQ2XHVGRjA5XG4gIGlmIChyZXN1bHQuTDMuc3RhZ25hdGlvbi5wZW5hbHR5ID4gVFVOSU5HLkhJTlRfU1RBR05BVElPTl9QRU5BTFRZKSB7XG4gICAgaGludHMucHVzaCh7XG4gICAgICBkaW1lbnNpb246ICdMMycsXG4gICAgICB0eXBlOiAnZGFuZ2VyJyxcbiAgICAgIGljb246ICdjbG9jaycsXG4gICAgICB0ZXh0OiAnXHU2OEMwXHU2RDRCXHU1MjMwXHU4QkU1XHU3NkVFXHU2ODA3XHU1REYyXHU1MDVDXHU2RURFXHU4RDg1XHU4RkM3XHU5ODg0XHU2NzFGXHU5NjA4XHU1MDNDXHUzMDAyJyxcbiAgICAgIGFjdGlvbjogJ1x1OTU3Rlx1NjcxRlx1NTA1Q1x1NkVERVx1NEYxQVx1NjYzRVx1ODQ1N1x1OTY0RFx1NEY0RVx1NUI4Q1x1NjIxMFx1Njk4Mlx1NzM4N1x1RkYwQ1x1NUVGQVx1OEJBRVx1N0FDQlx1NTM3M1x1NTkwRFx1NjdFNVx1OTg3OVx1NzZFRVx1NTNFRlx1ODg0Q1x1NjAyN1x1MzAwMicsXG4gICAgfSk7XG4gIH1cbiAgaWYgKHJlc3VsdC5MMy5iYWxhbmNlLnNjb3JlIDwgVFVOSU5HLkhJTlRfQkFMQU5DRV9TQ09SRSkge1xuICAgIGhpbnRzLnB1c2goe1xuICAgICAgZGltZW5zaW9uOiAnTDMnLFxuICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgaWNvbjogJ3NjYWxlJyxcbiAgICAgIHRleHQ6ICdcdTVCNTBcdTk4NzlcdTY1QjlcdTVERUVcdThGQzdcdTU5MjdcdUZGMUFcdTk4NzlcdTc2RUVcdTUxODVcdTkwRThcdThGREJcdTVFQTZcdTUyMDZcdTVFMDNcdTRFMjVcdTkxQ0RcdTRFMERcdTU3NDdcdTMwMDInLFxuICAgICAgYWN0aW9uOiAnXHU1MTczXHU2Q0U4XHU4OEFCXHU5NTdGXHU2NzFGXHU1RkZEXHU3NTY1XHU3Njg0XHU4RkI5XHU3RjE4XHU1QjUwXHU5ODc5XHVGRjBDXHU5NjMyXHU2QjYyXHU5ODc5XHU3NkVFXHU1NDBFXHU2NzFGXHU1MUZBXHU3M0IwXHU3RUQzXHU2Nzg0XHU2MDI3XHU1RDI5XHU1ODRDXHUzMDAyJyxcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChyZXN1bHQuc2NvcmUgPj0gVFVOSU5HLkhJTlRfSElHSF9TQ09SRSkge1xuICAgIGhpbnRzLnB1c2goe1xuICAgICAgZGltZW5zaW9uOiAnTDEnLFxuICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgaWNvbjogJ3NwYXJrbGVzJyxcbiAgICAgIHRleHQ6ICdcdTdCOTdcdTZDRDVcdThCQzRcdTRGMzBcdUZGMUFcdTYyMThcdTc1NjVcdTYyNjdcdTg4NENcdTUyOUJcdTU5MDRcdTRFOEVcdTY3ODFcdTlBRDhcdTZDMzRcdTVFNzNcdTMwMDInLFxuICAgICAgYWN0aW9uOiAnXHU1RjUzXHU1MjREXHU2NTcwXHU2MzZFXHU2QTIxXHU1NzhCXHU2NjNFXHU3OTNBXHU0RjYwXHU1REYyXHU1RUZBXHU3QUNCXHU3QTMzXHU1NkZBXHU3Njg0XHU0RTYwXHU2MEVGXHU5NUVEXHU3M0FGXHVGRjBDXHU1RUZBXHU4QkFFXHU0RkREXHU2MzAxXHU3M0IwXHU3MkI2XHUzMDAyJyxcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChoaW50cy5sZW5ndGggPT09IDApIHtcbiAgICBoaW50cy5wdXNoKHtcbiAgICAgIGRpbWVuc2lvbjogJ0wxJyxcbiAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgIGljb246ICdjaGVjay1jaXJjbGUnLFxuICAgICAgdGV4dDogJ1x1N0NGQlx1N0VERlx1OEJDNFx1NEYzMFx1RkYxQVx1NTQwNFx1N0VGNFx1NUVBNlx1NjU3MFx1NjM2RVx1NjMwN1x1NjgwN1x1NUU3M1x1N0EzM1x1MzAwMicsXG4gICAgICBhY3Rpb246ICdcdTVGNTNcdTUyNERcdTgyODJcdTU5NEZcdTUzRUZcdTYzMDFcdTdFRURcdUZGMENcdTUzRUZcdTVDMURcdThCRDVcdTkwMTBcdTZCNjVcdTU4OUVcdTUyQTBcdTRFRkJcdTUyQTFcdThEMUZcdTgzNzdcdTMwMDInLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGhpbnRzO1xufVxuXG4vKiogXHU4RkQ0XHU1NkRFXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHU5NTJFXHVGRjBDXHU1RTc2XHU1MjE3XHU2NzAwXHU0RjRFXHU2NUY2XHU2MzA5XHU2NzQzXHU5MUNEXHU1M0Q2XHVGRjA4TDEgPiBMMiA+IEwzXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gd2Vha2VzdERpbWVuc2lvbihyOiBIZWFsdGhSZXN1bHQpOiBIZWFsdGhEaW1lbnNpb24ge1xuICBjb25zdCBhcnI6IEFycmF5PHsgZGltOiBIZWFsdGhEaW1lbnNpb247IHNjb3JlOiBudW1iZXI7IHdlaWdodDogbnVtYmVyIH0+ID0gW1xuICAgIHsgZGltOiAnTDEnLCBzY29yZTogci5MMS5zY29yZSwgd2VpZ2h0OiBUVU5JTkcuV0VJR0hUX0wxIH0sXG4gICAgeyBkaW06ICdMMicsIHNjb3JlOiByLkwyLnNjb3JlLCB3ZWlnaHQ6IFRVTklORy5XRUlHSFRfTDIgfSxcbiAgICB7IGRpbTogJ0wzJywgc2NvcmU6IHIuTDMuc2NvcmUsIHdlaWdodDogVFVOSU5HLldFSUdIVF9MMyB9LFxuICBdO1xuICBsZXQgbWluID0gYXJyWzBdO1xuICBmb3IgKGNvbnN0IHggb2YgYXJyKSB7XG4gICAgaWYgKHguc2NvcmUgPCBtaW4uc2NvcmUpIG1pbiA9IHg7XG4gICAgZWxzZSBpZiAoeC5zY29yZSA9PT0gbWluLnNjb3JlICYmIHgud2VpZ2h0ID4gbWluLndlaWdodCkgbWluID0geDtcbiAgfVxuICByZXR1cm4gbWluLmRpbTtcbn1cbiIsICIvKipcbiAqIHJ1bkRpYWdub3NpcyBcdTIwMTQgXHUzMDBDQUkgXHU4QkNBXHU2NUFEIFx1MjE5MiBcdTg4NENcdTUyQThcdTk1RURcdTczQUZcdTMwMERcdTU0N0RcdTRFRTRcdTdGMTZcdTYzOTJcdUZGMDhcdTdFQUZcdTkwM0JcdThGOTFcdUZGMENcdTUzRUZcdTUzNTVcdTZENEJcdUZGMDlcbiAqXG4gKiBcdTUzRUFcdThEMUZcdThEMjNcdTZENDFcdTdBMEJcdTUxQjNcdTdCNTZcdUZGMENcdTRFMERcdTYzMDFcdTY3MDlcdTRFRkJcdTRGNTUgT2JzaWRpYW4gLyBET00gXHU0RjlEXHU4RDU2XHVGRjFBXG4gKiAgLSBhaUVuYWJsZWQgXHU5NUU4XHU3OTgxIFx1MjE5MiBcdTY1RTBcdTc2RUVcdTY4MDcgXHUyMTkyIFx1OEJGQiBnb2FscyArIFx1OEZEMSBOIFx1NTkyOSBkYXlzIFx1MjE5MiBkaWFnbm9zZSBcdTIxOTIgXHU2MjUzXHU1RjAwXHU1M0VBXHU4QkZCXHU2MkE1XHU1NDRBXHVGRjFCXG4gKiAgLSBcdTYyQTVcdTU0NEFcdTkxQ0NcdTcwQjlcdTMwMENcdTVFOTRcdTc1MjhcdTMwMERcdTIxOTIgXHU2MjUzXHU1RjAwIEFnZW50aWNQbGFuTW9kYWxcdUZGMDhcdThGN0RcdTUxNjVcdTc3MUZcdTVCOUVcdTY4MTEgKyBcdTk4ODRcdTU4NkJcdTVFRkFcdThCQUVcdTYzMDdcdTRFRTRcdUZGMDlcdUZGMUJcbiAqICAtIEFnZW50aWMgXHU3ODZFXHU4QkE0IFx1MjE5MiB3cml0ZUdvYWxzIFx1ODQzRFx1NUU5M1x1MzAwMlxuICogXHU2MjQwXHU2NzA5XHU1MjZGXHU0RjVDXHU3NTI4XHVGRjA4XHU4QkZCXHU1QjU4XHU1MEE4IC8gXHU2MjUzXHU1RjAwIE1vZGFsIC8gTm90aWNlIC8gXHU4NDNEXHU1RTkzXHVGRjA5XHU1NzQ3XHU5MDFBXHU4RkM3IGRlcHMgXHU2Q0U4XHU1MTY1XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgUGxhbm5lclNldHRpbmdzIH0gZnJvbSAnLi9NYXJrZG93blBsYW5uZXInO1xuaW1wb3J0IHR5cGUgeyBHb2FsSXRlbSwgRGF5RGF0YSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHsgZGlhZ25vc2UsIHR5cGUgRGlhZ25vc2lzUmVzdWx0LCB0eXBlIEdvYWxEaWFnbm9zaXMgfSBmcm9tICcuL0dvYWxEaWFnbm9zZXInO1xuaW1wb3J0IHsgYnVpbGRDYWNoZSwgYnVpbGRJdGVtRXZpZGVuY2VNYXAsIHR5cGUgSXRlbUV2aWRlbmNlIH0gZnJvbSAnLi9EZXZpYXRpb25DYWxjdWxhdG9yJztcbmltcG9ydCB7IFRVTklORyB9IGZyb20gJy4vaGVhbHRoU2NvcmUnO1xuaW1wb3J0IHR5cGUgeyBBZ2VudGljUGxhbk9wdGlvbnMgfSBmcm9tICcuL0FnZW50aWNQbGFuTW9kYWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3Npc1N0b3JhZ2Uge1xuICBnZXRHb2FscygpOiBQcm9taXNlPEdvYWxJdGVtW10+O1xuICBnZXREYXlLZXlzKCk6IFByb21pc2U8c3RyaW5nW10+O1xuICBnZXREYXkoa2V5OiBzdHJpbmcpOiBQcm9taXNlPERheURhdGEgfCBudWxsPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaWFnbm9zaXNEZXBzIHtcbiAgYWlFbmFibGVkOiBib29sZWFuO1xuICBwbGFubmVyU2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncztcbiAgc3RvcmFnZTogRGlhZ25vc2lzU3RvcmFnZTtcbiAgZGlhZ25vc2U6IHR5cGVvZiBkaWFnbm9zZTtcbiAgb3BlbkRpYWdub3NpczogKG9wdHM6IHtcbiAgICBkaWFnbm9zaXM6IERpYWdub3Npc1Jlc3VsdDtcbiAgICBpdGVtRXZpZGVuY2U/OiBSZWNvcmQ8c3RyaW5nLCBJdGVtRXZpZGVuY2VbXT47XG4gICAgb25BcHBseTogKGdvYWw6IEdvYWxEaWFnbm9zaXMpID0+IHZvaWQ7XG4gIH0pID0+IHZvaWQ7XG4gIG9wZW5BZ2VudGljOiAob3B0czogQWdlbnRpY1BsYW5PcHRpb25zKSA9PiB2b2lkO1xuICB3cml0ZUdvYWxzOiAoZ29hbHM6IEdvYWxJdGVtW10pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuICBub3RpY2U6IChtc2c6IHN0cmluZykgPT4gdm9pZDtcbiAgcmVjZW50RGF5cz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkRpYWdub3NpcyhkZXBzOiBEaWFnbm9zaXNEZXBzKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghZGVwcy5haUVuYWJsZWQpIHtcbiAgICBkZXBzLm5vdGljZSgnQUkgXHU4QkNBXHU2NUFEXHU2NzJBXHU1NDJGXHU3NTI4XHVGRjFBXHU4QkY3XHU1MTQ4XHU1NzI4XHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU0RTJEXHU1RjAwXHU1NDJGXHU1RTc2XHU1ODZCXHU1MTk5IEFQSSBLZXknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBhbGwgPSBhd2FpdCBkZXBzLnN0b3JhZ2UuZ2V0R29hbHMoKTtcbiAgaWYgKGFsbC5sZW5ndGggPT09IDApIHtcbiAgICBkZXBzLm5vdGljZSgnXHU0RjYwXHU4RkQ4XHU2Q0ExXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU1MTQ4XHU4REQxXHU0RTAwXHU2QjIxIEFJIFx1ODlDNFx1NTIxMicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFx1NTNFQVx1OEJDQVx1NjVBRFx1OEZEQlx1ODg0Q1x1NEUyRFx1NzY4NFx1NzZFRVx1NjgwN1x1RkYwQ1x1NURGMlx1NUY1Mlx1Njg2M1x1NzZFRVx1NjgwN1x1RkYwOGFyY2hpdmVkPXRydWVcdUZGMDlcdTRFMERcdTUzQzJcdTRFMEVcbiAgY29uc3QgZ29hbHMgPSBhbGwuZmlsdGVyKChnKSA9PiAhZy5hcmNoaXZlZCk7XG4gIGlmIChnb2Fscy5sZW5ndGggPT09IDApIHtcbiAgICBkZXBzLm5vdGljZSgnXHU1RjUzXHU1MjREXHU2Q0ExXHU2NzA5XHU4RkRCXHU4ODRDXHU0RTJEXHU3Njg0XHU3NkVFXHU2ODA3XHVGRjA4XHU1REYyXHU1RjUyXHU2ODYzXHU3NkVFXHU2ODA3XHU0RTBEXHU1M0MyXHU0RTBFXHU4QkNBXHU2NUFEXHVGRjA5Jyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gXHU1MDY1XHU1RUI3XHU1MjA2XHU1MDVDXHU2RURFXHU1MjI0XHU1QjlBXHU5NzAwXHU1NkRFXHU2RUFGIFNUQUdOQVRJT05fV0lORE9XKDYwKSBcdTRFMkFcdTVERTVcdTRGNUNcdTY1RTVcdUZGMENcdTY1NDVcdTYyQzlcdTUzRDZcdTdBOTdcdTUzRTNcdTRFMERcdTVDMEZcdTRFOEVcdTZCNjRcbiAgY29uc3Qgd2luZG93RGF5cyA9IE1hdGgubWF4KGRlcHMucmVjZW50RGF5cyA/PyAxNCwgVFVOSU5HLlNUQUdOQVRJT05fV0lORE9XKTtcbiAgY29uc3Qga2V5cyA9IChhd2FpdCBkZXBzLnN0b3JhZ2UuZ2V0RGF5S2V5cygpKS5zbGljZSgwLCB3aW5kb3dEYXlzKTtcbiAgY29uc3QgZGF5czogRGF5RGF0YVtdID0gW107XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgY29uc3QgZCA9IGF3YWl0IGRlcHMuc3RvcmFnZS5nZXREYXkoayk7XG4gICAgaWYgKGQpIGRheXMucHVzaChkKTtcbiAgfVxuXG4gIC8vIFx1NTdGQVx1NEU4RVx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OSArIFx1NUI4Q1x1NjIxMFx1OEJCMFx1NUY1NVx1RkYwQ1x1N0VEOVx1NjJBNVx1NTQ0QVx1NUYzOVx1N0E5N1x1NjNEMFx1NEY5Qlx1OEJDMVx1NjM2RVxuICBjb25zdCBjYWNoZSA9IGJ1aWxkQ2FjaGUoZ29hbHMsIGRheXMpO1xuICBjb25zdCBpdGVtRXZpZGVuY2UgPSBidWlsZEl0ZW1FdmlkZW5jZU1hcChnb2FscywgY2FjaGUpO1xuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRlcHMuZGlhZ25vc2UoZ29hbHMsIGRheXMsIGRlcHMucGxhbm5lclNldHRpbmdzKTtcblxuICBkZXBzLm9wZW5EaWFnbm9zaXMoe1xuICAgIGRpYWdub3NpczogcmVzdWx0LFxuICAgIGl0ZW1FdmlkZW5jZSxcbiAgICBvbkFwcGx5OiAoZ29hbCkgPT4ge1xuICAgICAgZGVwcy5vcGVuQWdlbnRpYyh7XG4gICAgICAgIGNvbnRlbnQ6ICcnLFxuICAgICAgICBzY29wZTogJ25vdGUnLFxuICAgICAgICBzZXR0aW5nczogZGVwcy5wbGFubmVyU2V0dGluZ3MsXG4gICAgICAgIGdvYWxzLFxuICAgICAgICBpbml0aWFsSW5zdHJ1Y3Rpb246IGdvYWwuc3VnZ2VzdGlvbnMuam9pbignXHVGRjFCJyksXG4gICAgICAgIG9uQ29uZmlybTogKGZpbmFsR29hbHMpID0+IHZvaWQgZGVwcy53cml0ZUdvYWxzKGZpbmFsR29hbHMpLFxuICAgICAgfSk7XG4gICAgfSxcbiAgfSk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxvQkFBbUU7OztBQ0FuRSxJQUFBQyxtQkFBa0Q7OztBQ0FsRCxzQkFBNEQ7OztBQzhCNUQsSUFBSSxLQUFLO0FBQVQsSUFBcUIsTUFBTTtBQUEzQixJQUF3QyxNQUFNO0FBRTlDLElBQUksT0FBTyxJQUFJLEdBQUc7QUFBQSxFQUFDO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxF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QU8sU0FBUztBQUFBO0FBRy9DLFFBQUksaUJBQWlCLEtBQUssS0FBSztBQUFBLE1BQzdCLFNBQVM7QUFBQSxNQUNULE9BQU87QUFBQSxNQUNQO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxNQUNwQixVQUFVO0FBQUEsTUFDVixVQUFVLHdCQUFXLEtBQUssS0FBSztBQUFBLE1BQy9CLFdBQVcsQ0FBQyxNQUFNLEtBQUssS0FBSyxvQkFBb0IsQ0FBQztBQUFBLElBQ25ELENBQUMsRUFBRSxLQUFLO0FBQUEsRUFDVjtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sRUFBRSxVQUFVLElBQUksS0FBSztBQUUzQixRQUFJLE9BQTZCO0FBQ2pDLFVBQU0sU0FBUyxVQUFVLGdCQUFnQixzQkFBc0I7QUFFL0QsUUFBSSxPQUFPLFNBQVMsR0FBRztBQUVyQixhQUFPLE9BQU8sQ0FBQztBQUFBLElBQ2pCLE9BQU87QUFFTCxhQUFPLFVBQVUsUUFBUSxLQUFLO0FBQzlCLFlBQU0sS0FBSyxhQUFhO0FBQUEsUUFDdEIsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUFBLElBQ0g7QUFFQSxRQUFJLE1BQU07QUFDUixZQUFNLFVBQVUsV0FBVyxJQUFJO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBOEI7QUFDbEMsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxFQUMzRTtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFVBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQ25DO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAibCIsICJfYSIsICJfYSIsICJfYSIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgIm1heCIsICJlcnIiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImVyciIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgInN1bW1hcml6ZSIsICJjbGFtcCIsICJjb3VudFdvcmtkYXlzIiwgImRpZmYiLCAic3RhZ25hbnREYXlzIiwgInBlbmFsdHkiLCAiY3VyIiwgInN1bW1hcml6ZSJdCn0K
