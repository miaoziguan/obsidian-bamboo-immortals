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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9ob3N0L0FwcEhvc3QudHMiLCAibm9kZV9tb2R1bGVzL2ZmbGF0ZS9lc20vYnJvd3Nlci5qcyIsICJzcmMvaG9zdC9BcHBBUEkudHMiLCAic3JjL3N0b3JhZ2UvVmF1bHRTdG9yYWdlLnRzIiwgInNyYy9zdG9yYWdlL0ltcG9ydFZhbGlkYXRvci50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL2hvc3QvcHJvdG9jb2wudHMiLCAic3JjL2hvc3QvV2ViYXBwQ29udHJvbGxlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiLCAic3JjL2FpL01hcmtkb3duUGxhbm5lci50cyIsICJzcmMvdHlwZXMvZGF0YS50cyIsICJzcmMvYWkvR29hbENhcmRWYWxpZGF0b3IudHMiLCAic3JjL2FpL2dvYWxJZC50cyIsICJzcmMvYWkvaWRlbXBvdGVuY3kudHMiLCAic3JjL2FpL0FnZW50aWNQbGFuTW9kYWwudHMiLCAic3JjL2FpL1BsYW5uaW5nU2Vzc2lvbi50cyIsICJzcmMvYWkvRGlhZ25vc2lzTW9kYWwudHMiLCAic3JjL2FpL0dvYWxEaWFnbm9zZXIudHMiLCAic3JjL2FpL0RldmlhdGlvbkNhbGN1bGF0b3IudHMiLCAic3JjL2FpL2hlYWx0aFNjb3JlLnRzIiwgInNyYy9haS9ydW5EaWFnbm9zaXMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiwgV29ya3NwYWNlTGVhZiwgTm90aWNlLCBURmlsZSwgTWFya2Rvd25WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgRGFpbHlSZXZpZXdWaWV3LCBWSUVXX1RZUEVfREFJTFlfUkVWSUVXIH0gZnJvbSAnLi9zcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3JztcbmltcG9ydCB7IEFwcEhvc3QgfSBmcm9tICcuL3NyYy9ob3N0L0FwcEhvc3QnO1xuaW1wb3J0IHsgV2ViYXBwQ29udHJvbGxlciB9IGZyb20gJy4vc3JjL2hvc3QvV2ViYXBwQ29udHJvbGxlcic7XG5pbXBvcnQgeyBUaGVtZUJyaWRnZSB9IGZyb20gJy4vc3JjL2JyaWRnZS9UaGVtZUJyaWRnZSc7XG5pbXBvcnQge1xuICBQbHVnaW5TZXR0aW5ncyxcbiAgREVGQVVMVF9TRVRUSU5HUyxcbiAgdHlwZSBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbn0gZnJvbSAnLi9zcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi9zcmMvc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgcGxhbkZyb21Ob3RlLCB0eXBlIFBsYW5uZXJTZXR0aW5ncyB9IGZyb20gJy4vc3JjL2FpL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQgeyB2YWxpZGF0ZUdvYWxzIH0gZnJvbSAnLi9zcmMvYWkvR29hbENhcmRWYWxpZGF0b3InO1xuaW1wb3J0IHsgZGVyaXZlU3RhYmxlR29hbElkIH0gZnJvbSAnLi9zcmMvYWkvZ29hbElkJztcbmltcG9ydCB7IHNob3VsZFNraXBQbGFubmVkIH0gZnJvbSAnLi9zcmMvYWkvaWRlbXBvdGVuY3knO1xuaW1wb3J0IHsgQWdlbnRpY1BsYW5Nb2RhbCB9IGZyb20gJy4vc3JjL2FpL0FnZW50aWNQbGFuTW9kYWwnO1xuaW1wb3J0IHsgRGlhZ25vc2lzTW9kYWwgfSBmcm9tICcuL3NyYy9haS9EaWFnbm9zaXNNb2RhbCc7XG5pbXBvcnQgeyBkaWFnbm9zZSB9IGZyb20gJy4vc3JjL2FpL0dvYWxEaWFnbm9zZXInO1xuaW1wb3J0IHsgcnVuRGlhZ25vc2lzIH0gZnJvbSAnLi9zcmMvYWkvcnVuRGlhZ25vc2lzJztcbmltcG9ydCB0eXBlIHsgR29hbEl0ZW0gfSBmcm9tICcuL3NyYy90eXBlcy9kYXRhJztcblxuLyoqIFx1NTE4NVx1NUJCOVx1NjMwN1x1N0VCOVx1RkYwOGRqYjJcdUZGMDlcdUZGMENcdTc1MjhcdTRFOEUgQUkgXHU4OUM0XHU1MjEyXHU1RTQyXHU3QjQ5XHU1MjI0XHU5MUNEICovXG5mdW5jdGlvbiBoYXNoQ29udGVudChzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaCA9IDUzODE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgIGggPSAoKGggPDwgNSkgKyBoICsgcy5jaGFyQ29kZUF0KGkpKSA+Pj4gMDtcbiAgfVxuICByZXR1cm4gaC50b1N0cmluZygzNik7XG59XG5cbi8qKlxuICogQmFtYm9vUmV2aWV3UGx1Z2luIC0gXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NTE2NVx1NTNFM1xuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogMS4gXHU2Q0U4XHU1MThDIFZpZXcgXHU3QzdCXHU1NzhCXG4gKiAyLiBcdTZDRThcdTUxOENcdTU0N0RcdTRFRTRcdUZGMDhcdTYyNTNcdTVGMDBcdTU5MERcdTc2RDhcdTMwMDFcdTUyNEQvXHU1NDBFXHU0RTAwXHU1OTI5XHUzMDAxXHU3RURGXHU4QkExXHU5NzYyXHU2NzdGXHVGRjA5XG4gKiAzLiBcdTZDRThcdTUxOENcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqIDQuIFx1N0JBMVx1NzQwNlx1NjNEMlx1NEVGNlx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW1ib29SZXZpZXdQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIHdlYmFwcCE6IFdlYmFwcENvbnRyb2xsZXI7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RVxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICBjb25zdCBwbHVnaW5EaXIgPSB0aGlzLm1hbmlmZXN0LmRpciB8fCAnJztcbiAgICBjb25zdCB2ZXJzaW9uID0gdGhpcy5tYW5pZmVzdC52ZXJzaW9uIHx8ICcnO1xuXG4gICAgLy8gXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2IHdlYmFwcFx1RkYxQVx1NjNEMlx1NEVGNlx1NTJBMFx1OEY3RFx1NTM3M1x1ODlFNlx1NTNEMVx1RkYwQ1x1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NTI0RFx1NTkyN1x1Njk4Mlx1NzM4N1x1NURGMlx1NUMzMVx1N0VFQVx1RkYwQ1x1NkQ4OFx1OTY2NFx1MzAwQ1x1NjI1M1x1NUYwMFx1N0E3QVx1NzY3RFx1MzAwRFx1NEY1M1x1NjExRlx1MzAwMlxuICAgIC8vIFx1NTkzMVx1OEQyNVx1NEUwRFx1OTYzQlx1NTg1RSBvbmxvYWRcdUZGMENcdTYyNTNcdTVGMDBcdTg5QzZcdTU2RkVcdTY1RjYgYnVpbGRCbG9iVXJsIFx1NEYxQVx1NTE4RFx1NkIyMVx1NUMxRFx1OEJENVx1MzAwMlxuICAgIHZvaWQgQXBwSG9zdC5wcmVmZXRjaCh0aGlzLmFwcCwgcGx1Z2luRGlyLCB2ZXJzaW9uKTtcblxuICAgIC8vIFx1NkNFOFx1NTE4QyBWaWV3XHVGRjA4XHU0RjIwXHU5MDEyIHBsdWdpbkRpciBcdTRGOUIgSXRlbVZpZXcgXHU1MkEwXHU4RjdEIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdUZGMDlcbiAgICB0aGlzLnJlZ2lzdGVyVmlldyhWSUVXX1RZUEVfREFJTFlfUkVWSUVXLCAobGVhZjogV29ya3NwYWNlTGVhZikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYWlseVJldmlld1ZpZXcobGVhZiwgcGx1Z2luRGlyLCB0aGlzLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB0aGlzLnNhdmVTZXR0aW5ncygpKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NUJCRlx1NEUzQiBcdTIxOTIgd2ViYXBwIFx1NzZGNFx1OEZERVx1NjNBNVx1NTNFM1x1RkYwOFBoYXNlMyBcdTk1RThcdTk3NjJcdUZGMENcdTUxODVcdTkwRThcdTRFQ0RcdThENzAgc2VuZENvbW1hbmQgXHU3RUJGXHU1MzRGXHU4QkFFXHVGRjA5XG4gICAgdGhpcy53ZWJhcHAgPSBuZXcgV2ViYXBwQ29udHJvbGxlcigoKSA9PiB7XG4gICAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuICAgICAgaWYgKGxlYXZlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIGxlYXZlc1swXS52aWV3IGFzIERhaWx5UmV2aWV3VmlldztcbiAgICB9KTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tZGFpbHktcmV2aWV3JyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTRFQ0FcdTY1RTVcdTU5MERcdTc2RDgnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1wcmV2LWRheScsXG4gICAgICBuYW1lOiAnXHU1MjREXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZQcmV2RGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS1uZXh0LWRheScsXG4gICAgICBuYW1lOiAnXHU1NDBFXHU0RTAwXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZOZXh0RGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICduYXZpZ2F0ZS10b2RheScsXG4gICAgICBuYW1lOiAnXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5uYXZUb2RheSgpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zdGF0cycsXG4gICAgICBuYW1lOiAnXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLndlYmFwcC5vcGVuU3RhdHMoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ29wZW4tc2V0dGluZ3MtaW4tYXBwJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm9wZW5TZXR0aW5ncygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWktcGxhbi1mcm9tLW5vdGUnLFxuICAgICAgbmFtZTogJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1NUY1M1x1NTI0RFx1N0IxNFx1OEJCMFx1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0NycsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLmFpUGxhbkZyb21Ob3RlKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1wbGFuLWZyb20tc2VsZWN0aW9uJyxcbiAgICAgIG5hbWU6ICdBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTVDMDZcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDcnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHZvaWQgdGhpcy5haVBsYW5Gcm9tU2VsZWN0aW9uKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1yZWJ1aWxkLWdvYWxzJyxcbiAgICAgIG5hbWU6ICdBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkFcdTVERjJcdTg5QzRcdTUyMTJcdTdCMTRcdThCQjBcdTc2ODRcdTc2RUVcdTY4MDcnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHZvaWQgdGhpcy5yZWJ1aWxkQWlHb2FscygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWktZGlhZ25vc2UnLFxuICAgICAgbmFtZTogJ0FJIFx1OEJDQVx1NjVBRFx1RkYxQVx1NTIwNlx1Njc5MFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NUU3Nlx1N0VEOVx1NTFGQVx1NTNFRlx1NUU5NFx1NzUyOFx1NUVGQVx1OEJBRScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLmFpRGlhZ25vc2UoKSxcbiAgICB9KTtcblxuICAgIC8vIFx1N0YxNlx1OEY5MVx1NTY2OFx1NTNGM1x1OTUyRVx1ODNEQ1x1NTM1NVx1RkYxQVx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1NTQwRVx1NTNGM1x1OTUyRVx1NzZGNFx1NjNBNVx1NTFGQVx1NzNCMFx1MzAwQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1MzAwRFxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbignZWRpdG9yLW1lbnUnLCAobWVudSwgZWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0aW9uKCkudHJpbSgpO1xuICAgICAgICBpZiAoIXRleHQpIHJldHVybjsgLy8gXHU2NUUwXHU5MDA5XHU1MzNBXHU2NUY2XHU0RTBEXHU2NjNFXHU3OTNBXHVGRjBDXHU0RkREXHU2MzAxXHU4M0RDXHU1MzU1XHU1RTcyXHU1MUMwXG4gICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT5cbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAuc2V0VGl0bGUoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0NycpXG4gICAgICAgICAgICAuc2V0SWNvbignbGVhZicpXG4gICAgICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgIHZvaWQgdGhpcy5haVBsYW5Gcm9tU2VsZWN0aW9uKHRleHQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUGx1Z2luU2V0dGluZ3ModGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NURFNlx1NEZBNyBSaWJib24gXHU1NkZFXHU2ODA3XG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdsZWFmJywgJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMCcsICgpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9udW5sb2FkKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICB9XG5cbiAgLyoqIEFJIFx1ODlDNFx1NTIxMlx1NEUzQlx1NkQ0MVx1N0EwQlx1RkYxQVx1NTNENlx1NUY1M1x1NTI0RFx1N0IxNFx1OEJCMCBcdTIxOTIgXHU4QzAzXHU1OTI3XHU2QTIxXHU1NzhCIFx1MjE5MiBcdTY4MjFcdTlBOEMgXHUyMTkyIFx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5NyBcdTIxOTIgXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3XHU1RTkzICovXG4gIGFzeW5jIGFpUGxhbkZyb21Ob3RlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHMgPSB0aGlzLnNldHRpbmdzO1xuICAgIGlmICghcy5haUVuYWJsZWQpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1NjcyQVx1NTQyRlx1NzUyOFx1RkYxQVx1OEJGN1x1NTE0OFx1NTcyOFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NEUyRFx1NUYwMFx1NTQyRlx1NUU3Nlx1NTg2Qlx1NTE5OSBBUEkgS2V5Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlIHx8ICEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU3QkM3IE1hcmtkb3duIFx1N0IxNFx1OEJCMCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjb250ZW50ID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoYFx1OEJGQlx1NTNENlx1N0IxNFx1OEJCMFx1NTkzMVx1OEQyNVx1RkYxQSR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRid9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghY29udGVudC50cmltKCkpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1N0IxNFx1OEJCMFx1NTE4NVx1NUJCOVx1NEUzQVx1N0E3QScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYW5uZXJTZXR0aW5nczogUGxhbm5lclNldHRpbmdzID0ge1xuICAgICAgYWlBcGlLZXk6IHMuYWlBcGlLZXksXG4gICAgICBhaUJhc2VVcmw6IHMuYWlCYXNlVXJsLFxuICAgICAgYWlNb2RlbDogcy5haU1vZGVsLFxuICAgICAgYWlEZWNvbXBvc2VEZXB0aDogcy5haURlY29tcG9zZURlcHRoLFxuICAgIH07XG5cbiAgICBuZXcgQWdlbnRpY1BsYW5Nb2RhbCh0aGlzLmFwcCwge1xuICAgICAgY29udGVudCxcbiAgICAgIHNjb3BlOiAnbm90ZScsXG4gICAgICBzZXR0aW5nczogcGxhbm5lclNldHRpbmdzLFxuICAgICAgb25Db25maXJtOiAoZmluYWxHb2FscykgPT4gdm9pZCB0aGlzLndyaXRlQWlHb2FscyhmaWxlLCBjb250ZW50LCBmaW5hbEdvYWxzKSxcbiAgICB9KS5vcGVuKCk7XG4gIH1cblxuICAvKiogXHU5MDA5XHU0RTJEXHU2NTg3XHU2NzJDXHU4RjZDXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHVGRjFBXHU1M0Q2XHU3RjE2XHU4RjkxXHU1NjY4XHU5MDA5XHU1MzNBIFx1MjE5MiBcdThDMDNcdTU5MjdcdTZBMjFcdTU3OEIoXHU2ODA3XHU2Q0U4IHNlbGVjdGlvbikgXHUyMTkyIFx1NjgyMVx1OUE4QyBcdTIxOTIgXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3IFx1MjE5MiBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTMgKi9cbiAgYXN5bmMgYWlQbGFuRnJvbVNlbGVjdGlvbihzZWxlY3Rpb25Bcmc/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzID0gdGhpcy5zZXR0aW5ncztcbiAgICBpZiAoIXMuYWlFbmFibGVkKSB7XG4gICAgICBuZXcgTm90aWNlKCdBSSBcdTg5QzRcdTUyMTJcdTY3MkFcdTU0MkZcdTc1MjhcdUZGMUFcdThCRjdcdTUxNDhcdTU3MjhcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTRFMkRcdTVGMDBcdTU0MkZcdTVFNzZcdTU4NkJcdTUxOTkgQVBJIEtleScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgIGlmICghZmlsZSB8fCAhKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkgfHwgZmlsZS5leHRlbnNpb24gIT09ICdtZCcpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1N0JDNyBNYXJrZG93biBcdTdCMTRcdThCQjAnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTRGMThcdTUxNDhcdTc1MjhcdTUzRjNcdTk1MkVcdTgzRENcdTUzNTVcdTRGMjBcdTUxNjVcdTc2ODRcdTdDQkVcdTc4NkVcdTkwMDlcdTUzM0FcdUZGMUJcdTU0N0RcdTRFRTRcdTk3NjJcdTY3N0ZcdThDMDNcdTc1MjhcdTY1RjZcdTRFMERcdTRGMjBcdUZGMENcdTUyMTlcdTU2REVcdTkwMDBcdTUyMzBcdTZEM0JcdTUyQThcdTdGMTZcdThGOTFcdTU2NjhcdTkwMDlcdTUzM0FcbiAgICBjb25zdCBzZWxlY3Rpb24gPVxuICAgICAgKHNlbGVjdGlvbkFyZyAmJiBzZWxlY3Rpb25BcmcudHJpbSgpKSB8fFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KT8uZWRpdG9yLmdldFNlbGVjdGlvbigpPy50cmltKCkgfHxcbiAgICAgICcnO1xuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdThCRjdcdTUxNDhcdTkwMDlcdTRFMkRcdTRFMDBcdTZCQjVcdTY1ODdcdTY3MkNcdUZGMENcdTUxOERcdTYyNjdcdTg4NENcdTMwMENcdTVDMDZcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTMwMEQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwbGFubmVyU2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyA9IHtcbiAgICAgIGFpQXBpS2V5OiBzLmFpQXBpS2V5LFxuICAgICAgYWlCYXNlVXJsOiBzLmFpQmFzZVVybCxcbiAgICAgIGFpTW9kZWw6IHMuYWlNb2RlbCxcbiAgICAgIGFpRGVjb21wb3NlRGVwdGg6IHMuYWlEZWNvbXBvc2VEZXB0aCxcbiAgICB9O1xuXG4gICAgbmV3IEFnZW50aWNQbGFuTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIGNvbnRlbnQ6IHNlbGVjdGlvbixcbiAgICAgIHNjb3BlOiAnc2VsZWN0aW9uJyxcbiAgICAgIHNldHRpbmdzOiBwbGFubmVyU2V0dGluZ3MsXG4gICAgICBzdWJ0aXRsZTogJ1x1NEVFNVx1NEUwQlx1NzZFRVx1NjgwN1x1NTdGQVx1NEU4RVx1NEY2MFx1NTcyOFx1N0IxNFx1OEJCMFx1NEUyRFx1OTAwOVx1NEUyRFx1NzY4NFx1NjU4N1x1NjcyQ1x1NjJDNlx1ODlFM1x1RkYwOFx1OTc1RVx1NjU3NFx1N0JDN1x1N0IxNFx1OEJCMFx1RkYwOVx1MzAwMicsXG4gICAgICBvbkNvbmZpcm06IChmaW5hbEdvYWxzKSA9PiB2b2lkIHRoaXMud3JpdGVBaUdvYWxzKGZpbGUsIHNlbGVjdGlvbiwgZmluYWxHb2FscyksXG4gICAgfSkub3BlbigpO1xuICB9XG5cbiAgLyoqIFx1NjI4QVx1NUJBMVx1OTYwNVx1NTQwRVx1NzY4NFx1NzZFRVx1NjgwN1x1OEZGRFx1NTJBMFx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1NUU5M1x1RkYwOFx1OTZGNlx1NkM2MVx1NjdEM1x1RkYxQWV4aXN0aW5nICsgcGFyc2VkXHVGRjA5XHU1RTc2XHU2NkY0XHU2NUIwXHU1RTQyXHU3QjQ5XHU3RDIyXHU1RjE1ICovXG4gIC8qKlxuICAgKiBcdTYyOEFcdTVCQTFcdTk2MDVcdTU0MEVcdTc2ODRcdTc2RUVcdTY4MDdcdThGRkRcdTUyQTBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTNcdUZGMDhcdTk2RjZcdTZDNjFcdTY3RDNcdUZGMUFleGlzdGluZyArIHBhcnNlZFx1RkYwOVx1NUU3Nlx1NjZGNFx1NjVCMFx1NUU0Mlx1N0I0OVx1N0QyMlx1NUYxNVx1MzAwMlxuICAgKiBAcGFyYW0gc2lsZW50IFx1NjI3OVx1OTFDRlx1OTFDRFx1NUVGQVx1NjVGNlx1NjI5MVx1NTIzNlx1OTAxMFx1Njc2MVx1OTAxQVx1NzdFNVx1RkYwQ1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1N0VERlx1NEUwMFx1NkM0N1x1NjAzQlx1RkYwOFx1OUVEOFx1OEJBNCBmYWxzZVx1RkYwOVxuICAgKi9cbiAgYXN5bmMgd3JpdGVBaUdvYWxzKFxuICAgIGZpbGU6IFRGaWxlLFxuICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICBnb2FsczogR29hbEl0ZW1bXSxcbiAgICBzaWxlbnQgPSBmYWxzZVxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTdFREZcdTRFMDBcdTUxOTlcdTUxNjUgd2ViYXBwIFx1NUI5RVx1OTY0NVx1OEJGQlx1NTNENlx1NzY4NFx1OUVEOFx1OEJBNFx1OERFRlx1NUY4NFx1RkYwOGJhbWJvby1yZXZpZXdcdUZGMDlcdUZGMENcdTc4NkVcdTRGREQgQUkgXHU1MTk5XHU1MTY1XHU3Njg0XHU3NkVFXHU2ODA3XHU0RTBFXHU3NTRDXHU5NzYyXHU4QkZCXHU1M0Q2XHU0RTAwXHU4MUY0XHUzMDAyXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgc3RvcmFnZS5nZXRHb2FscygpO1xuXG4gICAgLy8gXHU1RTQyXHU3QjQ5XHVGRjFBXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwICsgXHU3NkY4XHU1NDBDXHU1MTg1XHU1QkI5XHU1REYyXHU4OUM0XHU1MjEyXHU4RkM3XHVGRjBDXHU0RTE0XHU3NkVFXHU2ODA3XHU0RUNEXHU1MTY4XHU5MEU4XHU1QjU4XHU1NzI4IFx1MjE5MiBcdThERjNcdThGQzdcdUZGMDhcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkFcdTZBMjFcdTVGMEZcdTVGM0FcdTUyMzZcdTkxQ0RcdTUxOTlcdUZGMDlcdTMwMDJcbiAgICAvLyBcdTUxNzNcdTk1MkVcdTRGRUVcdTU5MERcdUZGMUFcdTgyRTVcdTc2RUVcdTY4MDdcdTVERjJcdTg4QUJcdTZFMDVcdTdBN0EvXHU0RTIyXHU1OTMxXHVGRjA4cGxhbnMtbWFwIFx1NkI4Qlx1NzU1OVx1NjVFN1x1NTRDOFx1NUUwQ1x1RkYwOVx1RkYwQ1x1NTIxOVx1NUZDNVx1OTg3Qlx1NTE0MVx1OEJCOFx1OTFDRFx1NjVCMFx1NTE5OVx1NTE2NVx1NEVFNVx1NjA2Mlx1NTkwRFx1RkYwQ1xuICAgIC8vIFx1NTQyNlx1NTIxOVx1MjAxQ1x1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1MjAxRFx1NEYxQVx1NkMzOFx1NEU0NVx1OTYzQlx1NTg1RVx1NjA2Mlx1NTkwRFx1RkYwQ1x1ODg2OFx1NzNCMFx1NEUzQVx1MjAxQ1x1NTE5OVx1NTE2NVx1NEU4Nlx1NEY0Nlx1NEUwRFx1NjYzRVx1NzkzQS9cdTRFMjJcdTU5MzFcdTIwMURcdTMwMDJcbiAgICBjb25zdCBpbmRleCA9IGF3YWl0IHN0b3JhZ2UuZ2V0UGxhbnNJbmRleCgpO1xuICAgIGNvbnN0IGtleSA9IGAke2ZpbGUucGF0aH0jJHtoYXNoQ29udGVudChjb250ZW50KX1gO1xuICAgIGNvbnN0IHBsYW5uZWRJZHMgPSBpbmRleFtrZXldO1xuICAgIGlmICghc2lsZW50ICYmIHNob3VsZFNraXBQbGFubmVkKHBsYW5uZWRJZHMsIG5ldyBTZXQoZXhpc3RpbmcubWFwKChnKSA9PiBnLmlkKSkpKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdThCRTVcdTdCMTRcdThCQjBcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdUZGMDhcdTUxODVcdTVCQjlcdTY3MkFcdTUzRDhcdUZGMDlcdUZGMENcdTVERjJcdThERjNcdThGQzdcdTkxQ0RcdTU5MERcdTUxOTlcdTUxNjUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gXHU5MEU4XHU1MjA2L1x1NTE2OFx1OTBFOFx1NzZFRVx1NjgwN1x1NURGMlx1NEUyMlx1NTkzMSBcdTIxOTIgXHU3RUU3XHU3RUVEXHU1NDExXHU0RTBCXHU5MUNEXHU2NUIwXHU1MTk5XHU1MTY1XHU0RUU1XHU2MDYyXHU1OTBEXG5cbiAgICAvLyBcdTY1RTdcdTcyNDhcdTk2OEZcdTY3M0EgaWQgXHU1MTdDXHU1QkI5XHVGRjFBXHU1NDBDIHNvdXJjZVJlZit0aXRsZSBcdTU5MERcdTc1MjhcdTY1RTcgaWRcdUZGMENcdTUzOUZcdTU3MzBcdTY2RjRcdTY1QjBcdTRFMERcdTY1QjBcdTU4OUVcdTkxQ0RcdTU5MERcbiAgICBjb25zdCBieVJlZlRpdGxlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgZXhpc3RpbmcpIHtcbiAgICAgIGlmIChnLnNvdXJjZVJlZiAmJiBnLnRpdGxlKSBieVJlZlRpdGxlLnNldChgJHtnLnNvdXJjZVJlZn0jJHtnLnRpdGxlfWAsIGcuaWQpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXA8c3RyaW5nLCBHb2FsSXRlbT4oKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgZXhpc3RpbmcpIGlmIChnLmlkKSBtZXJnZWQuc2V0KGcuaWQsIGcpO1xuXG4gICAgLy8gXHU2NzAwXHU3RUM4XHU5NjMyXHU3RUJGXHVGRjFBQUkgXHU1MTk5XHU1MTY1XHU3Njg0XHU3NkVFXHU2ODA3XHU3OTgxXHU2QjYyXHU1MzA1XHU1NDJCIGljb24gXHU1QjU3XHU2QkI1XHVGRjA4XHU1MzczXHU0RjdGXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3XHU4QkVGXHU1ODZCXHU1MTY1XHU0RTVGXHU1MjY1XHU3OUJCXHVGRjA5XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNvbnN0IHdpdGhSZWYgPSBnb2Fscy5tYXAoKGcpID0+IHtcbiAgICAgIGNvbnN0IHsgaWNvbjogX2ljb24sIC4uLnJlc3QgfSA9IGcgYXMgR29hbEl0ZW0gJiB7IGljb24/OiB1bmtub3duIH07XG4gICAgICB2b2lkIF9pY29uO1xuICAgICAgY29uc3QgcmVmOiBHb2FsSXRlbSA9IHsgLi4ucmVzdCwgc291cmNlUmVmOiBmaWxlLnBhdGggfTtcbiAgICAgIC8vIFx1Nzg2RVx1NUI5QVx1NjAyNyBJRFx1RkYxQVx1NTQwQ1x1N0IxNFx1OEJCMCtcdTU0MENcdTY4MDdcdTk4OThcdTYwNTJcdTVGOTdcdTU0MENcdTRFMDAgaWQgXHUyMTkyIFx1OTFDRFx1NjVCMFx1ODlDNFx1NTIxMlx1NTM5Rlx1NTczMFx1NjZGNFx1NjVCMFx1ODAwQ1x1OTc1RVx1OEZGRFx1NTJBMFx1OTFDRFx1NTkwRFx1RkYxQlxuICAgICAgLy8gXHU4MkU1XHU4QkU1XHU2ODA3XHU5ODk4XHU3Njg0XHU2NUU3XHU5NjhGXHU2NzNBIGlkIFx1NEVDRFx1NUI1OFx1NTcyOFx1NEU4RVx1NUU5M1x1RkYwQ1x1NTIxOVx1NTkwRFx1NzUyOFx1NUI4M1x1RkYwOFx1NTE3Q1x1NUJCOVx1NTM4Nlx1NTNGMlx1NzZFRVx1NjgwN1x1RkYwOVx1MzAwMlxuICAgICAgY29uc3QgbGVnYWN5SWQgPSBieVJlZlRpdGxlLmdldChgJHtmaWxlLnBhdGh9IyR7Zy50aXRsZX1gKTtcbiAgICAgIHJlZi5pZCA9IGxlZ2FjeUlkID8/IGRlcml2ZVN0YWJsZUdvYWxJZChgJHtmaWxlLnBhdGh9fCR7Zy50aXRsZX1gKTtcbiAgICAgIHJldHVybiByZWY7XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCBnIG9mIHdpdGhSZWYpIGlmIChnLmlkKSBtZXJnZWQuc2V0KGcuaWQsIGcpO1xuICAgIGNvbnN0IGZpbmFsR29hbHMgPSBbLi4ubWVyZ2VkLnZhbHVlcygpXTtcbiAgICBhd2FpdCBzdG9yYWdlLnB1dEdvYWxzKGZpbmFsR29hbHMpO1xuXG4gICAgLy8gXHU1OTMxXHU2NTQ4XHU3RDIyXHU1RjE1XHU2RTA1XHU3NDA2XHVGRjA4Rlx1RkYwOVx1RkYxQVx1NTI1NFx1OTY2NFx1MjAxQ1x1NTE3Nlx1NTE2OFx1OTBFOCBpZCBcdTU3NDdcdTVERjJcdTRFMERcdTU3MjhcdTY3MDBcdTdFQzhcdTc2RUVcdTY4MDdcdTVFOTNcdTIwMURcdTc2ODRcdTk2NDhcdTY1RTcgZW50cnlcdUZGMENcdTkwN0ZcdTUxNERcdTdEMjJcdTVGMTVcdTY1RTBcdTk2NTBcdTU4OUVcdTk1N0ZcdTMwMDJcbiAgICBjb25zdCBmaW5hbElkcyA9IG5ldyBTZXQoZmluYWxHb2Fscy5tYXAoKGcpID0+IGcuaWQpKTtcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoaW5kZXgpKSB7XG4gICAgICBjb25zdCBpZHMgPSBpbmRleFtrXTtcbiAgICAgIGlmIChpZHMgJiYgaWRzLmxlbmd0aCA+IDAgJiYgaWRzLmV2ZXJ5KChpZCkgPT4gIWZpbmFsSWRzLmhhcyhpZCkpKSB7XG4gICAgICAgIGRlbGV0ZSBpbmRleFtrXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5kZXhba2V5XSA9IHdpdGhSZWYubWFwKChnKSA9PiBnLmlkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnB1dFBsYW5zSW5kZXgoaW5kZXgpO1xuXG4gICAgLy8gXHU1QzQwXHU5MEU4XHU1MjM3XHU2NUIwXHU1RTM4XHU5QTdCXHU4OUM2XHU1NkZFXHVGRjA4aG9zdFx1MjE5MndlYmFwcCBnb2FsczpjaGFuZ2VkXHVGRjA5XG4gICAgdGhpcy53ZWJhcHAubm90aWZ5R29hbHNDaGFuZ2VkKCk7XG5cbiAgICBpZiAoIXNpbGVudCkge1xuICAgICAgbmV3IE5vdGljZShgXHU1REYyXHU1MTk5XHU1MTY1ICR7d2l0aFJlZi5sZW5ndGh9IFx1NEUyQVx1NzZFRVx1NjgwN1x1NTIzMFx1MzAwQ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1MzAwRGApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTYyNzlcdTkxQ0ZcdTkxQ0RcdTVFRkEgQUkgXHU3NkVFXHU2ODA3XHVGRjFBXHU2MjZCXHU2M0NGIHBsYW5zLW1hcCBcdTRFMkRcdTMwMENcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdTMwMERcdTc2ODRcdTdCMTRcdThCQjBcdUZGMENcdTkwMTBcdTdCQzdcdTkxQ0RcdTY1QjBcdTg5QzRcdTUyMTJcdUZGMENcbiAgICogXHU0RUU1XHU2MjdFXHU1NkRFXHU5MEEzXHU0RTlCXHU3NkVFXHU2ODA3XHU1REYyXHU0RTIyXHU1OTMxL1x1ODhBQlx1NkUwNVx1NzY4NFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1MzAwMlx1N0IxNFx1OEJCMFx1NURGMlx1NTIyMFx1OTY2NFx1NTIxOVx1OERGM1x1OEZDN1x1RkYwOFx1NTE3NiBzdGFsZSBlbnRyeSBcdTc1MzFcdTdEMjJcdTVGMTVcdTZFMDVcdTc0MDZcdTU5MDRcdTc0MDZcdUZGMDlcdTMwMDJcbiAgICovXG4gIGFzeW5jIHJlYnVpbGRBaUdvYWxzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBjb25zdCBpbmRleCA9IGF3YWl0IHN0b3JhZ2UuZ2V0UGxhbnNJbmRleCgpO1xuICAgIGNvbnN0IHBhdGhzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGluZGV4KSkge1xuICAgICAgY29uc3QgaGFzaElkeCA9IGsubGFzdEluZGV4T2YoJyMnKTtcbiAgICAgIGlmIChoYXNoSWR4ID4gMCkgcGF0aHMuYWRkKGsuc2xpY2UoMCwgaGFzaElkeCkpO1xuICAgIH1cbiAgICBpZiAocGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgbmV3IE5vdGljZSgnXHU2NzJBXHU1M0QxXHU3M0IwXHU0RUZCXHU0RjU1XHU1REYyXHU4OUM0XHU1MjEyXHU3Njg0XHU3QjE0XHU4QkIwJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgaWYgKCFzLmFpRW5hYmxlZCkge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHU2NzJBXHU1NDJGXHU3NTI4XHVGRjFBXHU4QkY3XHU1MTQ4XHU1NzI4XHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU0RTJEXHU1RjAwXHU1NDJGXHU1RTc2XHU1ODZCXHU1MTk5IEFQSSBLZXknKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcblxuICAgIGNvbnN0IGxvYWRpbmcgPSBuZXcgTm90aWNlKGBcdTZCNjNcdTU3MjhcdTkxQ0RcdTVFRkEgJHtwYXRocy5zaXplfSBcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODQgQUkgXHU3NkVFXHU2ODA3XHUyMDI2YCwgMCk7XG4gICAgbGV0IG9rID0gMDtcbiAgICBsZXQgZmFpbGVkID0gMDtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGF0aHMpIHtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocCk7XG4gICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSBjb250aW51ZTsgLy8gXHU3QjE0XHU4QkIwXHU1REYyXHU1MjIwXHU5NjY0IFx1MjE5MiBcdThERjNcdThGQzdcbiAgICAgIGxldCBjb250ZW50OiBzdHJpbmc7XG4gICAgICB0cnkge1xuICAgICAgICBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICghY29udGVudC50cmltKCkpIGNvbnRpbnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgcGxhbkZyb21Ob3RlKGNvbnRlbnQsIHBsYW5uZXJTZXR0aW5ncyk7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHZhbGlkYXRlR29hbHMocmF3KTtcbiAgICAgICAgaWYgKHBhcnNlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy53cml0ZUFpR29hbHMoZmlsZSwgY29udGVudCwgcGFyc2VkLCB0cnVlKTtcbiAgICAgICAgICBvaysrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgZmFpbGVkKys7XG4gICAgICB9XG4gICAgfVxuICAgIGxvYWRpbmcuaGlkZSgpO1xuICAgIG5ldyBOb3RpY2UoYFx1NURGMlx1OTFDRFx1NUVGQSAke29rfSBcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODQgQUkgXHU3NkVFXHU2ODA3JHtmYWlsZWQgPiAwID8gYFx1RkYwQyR7ZmFpbGVkfSBcdTdCQzdcdTU5MzFcdThEMjVgIDogJyd9YCk7XG4gIH1cblxuICAvKipcbiAgICogQUkgXHU4QkNBXHU2NUFEIFx1MjE5MiBcdTg4NENcdTUyQThcdTk1RURcdTczQUZcdUZGMUFcdThCRkJcdTc2RUVcdTY4MDcgKyBcdThGRDEgMTQgXHU1OTI5XHU2NTcwXHU2MzZFIFx1MjE5MiBBSSBcdThCQ0FcdTY1QURcdUZGMDhHb2FsRGlhZ25vc2VyXHVGRjA5XHUyMTkyXG4gICAqIFx1NTNFQVx1OEJGQlx1NjJBNVx1NTQ0QVx1RkYwOERpYWdub3Npc01vZGFsXHVGRjA5XHUyMTkyIFx1NzBCOVx1MzAwQ1x1NUU5NFx1NzUyOFx1MzAwRFx1MjE5MiBcdTYyNTNcdTVGMDAgQWdlbnRpY1BsYW5Nb2RhbCBcdTk4ODRcdTU4NkJcdTVFRkFcdThCQUVcdTYzMDdcdTRFRTQgXHUyMTkyXG4gICAqIFx1Nzg2RVx1OEJBNFx1NTQwRVx1NTE5OVx1NTZERVx1NzZFRVx1NjgwN1x1NUU5M1x1MzAwMlx1N0YxNlx1NjM5Mlx1OTAzQlx1OEY5MVx1NTcyOCBydW5EaWFnbm9zaXNcdUZGMDhcdTdFQUZcdTUxRkRcdTY1NzBcdUZGMDlcdUZGMENcdTZCNjRcdTU5MDRcdTUzRUFcdTZDRThcdTUxNjVcdTc3MUZcdTVCOUVcdTRGOURcdThENTZcdTMwMDJcbiAgICovXG4gIGFzeW5jIGFpRGlhZ25vc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgYXdhaXQgcnVuRGlhZ25vc2lzKHtcbiAgICAgIGFpRW5hYmxlZDogcy5haUVuYWJsZWQsXG4gICAgICBwbGFubmVyU2V0dGluZ3MsXG4gICAgICBzdG9yYWdlLFxuICAgICAgZGlhZ25vc2U6IGRpYWdub3NlIGFzIHVua25vd24gYXMgdHlwZW9mIGRpYWdub3NlLFxuICAgICAgb3BlbkRpYWdub3NpczogKG8pID0+IG5ldyBEaWFnbm9zaXNNb2RhbCh0aGlzLmFwcCwgbykub3BlbigpLFxuICAgICAgb3BlbkFnZW50aWM6IChvKSA9PiBuZXcgQWdlbnRpY1BsYW5Nb2RhbCh0aGlzLmFwcCwgbykub3BlbigpLFxuICAgICAgd3JpdGVHb2FsczogKGcpID0+IHZvaWQgdGhpcy53cml0ZURpYWdub3NlZEdvYWxzKGcpLFxuICAgICAgbm90aWNlOiAobSkgPT4gbmV3IE5vdGljZShtKSxcbiAgICAgIHJlY2VudERheXM6IDE0LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFx1OEJDQVx1NjVBRFx1NUVGQVx1OEJBRVx1NUU5NFx1NzUyOFx1NTQwRVx1NzY4NFx1ODQzRFx1NUU5M1x1RkYxQVx1NTE5OSBnb2Fscy5qc29uICsgXHU1MjM3XHU2NUIwXHU1RTM4XHU5QTdCXHU4OUM2XHU1NkZFXHVGRjA4XHU0RTBEXHU3OEIwXHU1RTQyXHU3QjQ5XHU3RDIyXHU1RjE1LyBzb3VyY2VSZWZcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyB3cml0ZURpYWdub3NlZEdvYWxzKGdvYWxzOiBHb2FsSXRlbVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGF3YWl0IHN0b3JhZ2UucHV0R29hbHMoZ29hbHMpO1xuICAgIHRoaXMud2ViYXBwLm5vdGlmeUdvYWxzQ2hhbmdlZCgpO1xuICAgIG5ldyBOb3RpY2UoYFx1NURGMlx1NTE5OVx1NTE2NSAke2dvYWxzLmxlbmd0aH0gXHU0RTJBXHU3NkVFXHU2ODA3XHVGRjA4XHU1RTk0XHU3NTI4IEFJIFx1OEJDQVx1NjVBRFx1NUVGQVx1OEJBRVx1RkYwOWApO1xuICB9XG5cbiAgLyoqIFx1NkZDMFx1NkQzQlx1NjIxNlx1NTIxQlx1NUVGQVx1NTkwRFx1NzZEOFx1ODlDNlx1NTZGRSAqL1xuICBhc3luYyBhY3RpdmF0ZVZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwO1xuXG4gICAgbGV0IGxlYWY6IFdvcmtzcGFjZUxlYWYgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBsZWF2ZXMgPSB3b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcpO1xuXG4gICAgaWYgKGxlYXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBcdTVERjJcdTY3MDlcdTg5QzZcdTU2RkVcdUZGMENcdTc2RjRcdTYzQTVcdTgwNUFcdTcxMjZcbiAgICAgIGxlYWYgPSBsZWF2ZXNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NTIxQlx1NUVGQVx1NjVCMFx1ODlDNlx1NTZGRVxuICAgICAgbGVhZiA9IHdvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKTtcbiAgICAgIGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHtcbiAgICAgICAgdHlwZTogVklFV19UWVBFX0RBSUxZX1JFVklFVyxcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGxlYWYpIHtcbiAgICAgIGF3YWl0IHdvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYWYpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTUyQTBcdThGN0RcdThCQkVcdTdGNkUgKi9cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpIGFzIEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICB9XG5cbiAgLyoqIFx1NEZERFx1NUI1OFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBzYXZlU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEl0ZW1WaWV3LCBXb3Jrc3BhY2VMZWFmLCBFdmVudFJlZiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MgfSBmcm9tICcuLi9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5pbXBvcnQgeyBBcHBIb3N0IH0gZnJvbSAnLi4vaG9zdC9BcHBIb3N0JztcbmltcG9ydCB7IEFwcEFQSSB9IGZyb20gJy4uL2hvc3QvQXBwQVBJJztcblxuZXhwb3J0IGNvbnN0IFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgPSAnYmFtYm9vLWltbW9ydGFscyc7XG5cbi8qKlxuICogRGFpbHlSZXZpZXdWaWV3IC0gXHU0RTNCXHU4OUM2XHU1NkZFXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTUyMUJcdTVFRkEgaWZyYW1lXHVGRjA4YmxvYiBVUkxcdUZGMDlcdTYyN0ZcdThGN0Qgd2ViYXBwXG4gKiAyLiBcdTdCQTFcdTc0MDYgQXBwSG9zdCAvIEFwcEFQSSBcdTc1MUZcdTU0N0RcdTU0NjhcdTY3MUZcbiAqIDMuIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTVFNzZcdTU0MENcdTZCNjVcbiAqL1xuZXhwb3J0IGNsYXNzIERhaWx5UmV2aWV3VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcHJpdmF0ZSBwbHVnaW5EaXI6IHN0cmluZztcbiAgcHJpdmF0ZSBwbHVnaW46IHVua25vd247XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBwcml2YXRlIGFwcEhvc3Q6IEFwcEhvc3QgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBhcHBBUEk6IEFwcEFQSSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjc3NDaGFuZ2VSZWY6IEV2ZW50UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbGVhZjogV29ya3NwYWNlTGVhZixcbiAgICBwbHVnaW5EaXI6IHN0cmluZyxcbiAgICBfcGx1Z2luOiB1bmtub3duLFxuICAgIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbiAgICBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD5cbiAgKSB7XG4gICAgc3VwZXIobGVhZik7XG4gICAgdGhpcy5wbHVnaW5EaXIgPSBwbHVnaW5EaXI7XG4gICAgdGhpcy5wbHVnaW4gPSBfcGx1Z2luO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgfVxuXG4gIGdldFZpZXdUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVc7XG4gIH1cblxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJztcbiAgfVxuXG4gIGdldEljb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2xlYWYnO1xuICB9XG5cbiAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgPSB0aGlzLmNvbnRhaW5lckVsLmNoaWxkcmVuWzFdIGFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgIGNvbnRhaW5lci5hZGRDbGFzcygnYmFtYm9vLXJldmlldy1jb250YWluZXInKTtcblxuICAgIGlmICghdGhpcy5wbHVnaW5EaXIpIHtcbiAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwOiBcdTY1RTBcdTZDRDVcdTVCOUFcdTRGNERcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTUnLFxuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWVycm9yJyxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NTIxRFx1NTlDQlx1NTMxNiBBcHBBUElcdUZGMDhcdTkwMUFcdTRGRTFcdTVDNDJcdUZGMDlcbiAgICB0aGlzLmFwcEFQSSA9IG5ldyBBcHBBUEkoXG4gICAgICB0aGlzLmFwcCxcbiAgICAgIHRoaXMuc2V0dGluZ3MsXG4gICAgICB0aGlzLnNhdmVTZXR0aW5ncyxcbiAgICAgIHRoaXMuc2V0dGluZ3Mubm9pc2VQYXRoIHx8ICcnLFxuICAgICAgdGhpcy5hcHAudmF1bHQuY29uZmlnRGlyXG4gICAgKTtcbiAgICBhd2FpdCB0aGlzLmFwcEFQSS5lbnN1cmVTdHJ1Y3R1cmUoKTtcblxuICAgIC8vIFx1NjI2Qlx1NjNDRlx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFxuICAgIGNvbnN0IGN1c3RvbVRoZW1lcyA9IGF3YWl0IHRoaXMuc2NhbkN1c3RvbVRoZW1lcygpO1xuICAgIHRoaXMuYXBwQVBJLnNldEN1c3RvbVRoZW1lcyhjdXN0b21UaGVtZXMpO1xuXG4gICAgLy8gXHU1MjFCXHU1RUZBIEFwcEhvc3QgXHU1RTc2XHU2Nzg0XHU1RUZBIGJsb2IgVVJMXG4gICAgY29uc3QgdmVyc2lvbiA9ICh0aGlzLnBsdWdpbiBhcyB7IG1hbmlmZXN0PzogeyB2ZXJzaW9uPzogc3RyaW5nIH0gfSB8IHVuZGVmaW5lZCk/Lm1hbmlmZXN0Py52ZXJzaW9uID8/ICcnO1xuICAgIHRoaXMuYXBwSG9zdCA9IG5ldyBBcHBIb3N0KHRoaXMuYXBwLCB0aGlzLnBsdWdpbkRpciwgdmVyc2lvbik7XG5cbiAgICBjb25zdCBsb2FkaW5nRWwgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTUyQTBcdThGN0RcdTRFMkRcdTIwMjYnLFxuICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1sb2FkaW5nJyxcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLmFwcEFQSS5zdGFydExpc3RlbmluZygpO1xuICAgICAgY29uc3QgYmxvYlVybCA9IGF3YWl0IHRoaXMuYXBwSG9zdC5idWlsZEJsb2JVcmwoKTtcblxuICAgICAgdGhpcy5pZnJhbWUgPSBjb250YWluZXIuY3JlYXRlRWwoJ2lmcmFtZScsIHtcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1mcmFtZScsXG4gICAgICAgIGF0dHI6IHtcbiAgICAgICAgICBzcmM6IGJsb2JVcmwsXG4gICAgICAgICAgYWxsb3c6ICdjYW1lcmE7IG1pY3JvcGhvbmU7IGNsaXBib2FyZC1yZWFkOyBjbGlwYm9hcmQtd3JpdGUnLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGxvYWRpbmdFbC5yZW1vdmUoKTtcbiAgICAgIHRoaXMuYXBwQVBJLmJpbmRJZnJhbWUodGhpcy5pZnJhbWUpO1xuXG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5vbignY3NzLWNoYW5nZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5hcHBBUEk/Lm9uVGhlbWVDaGFuZ2VkKHRoaXMuc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2FkaW5nRWwucmVtb3ZlKCk7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQmFtYm9vUmV2aWV3XSBcdTUyQTBcdThGN0Qgd2ViYXBwIFx1NTkzMVx1OEQyNTonLCBlKTtcbiAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiBgXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1OiAke2UgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdTY3MkFcdTc3RTVcdTk1MTlcdThCRUYnfWAsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgb25DbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTZFMDVcdTc0MDZcdTRFM0JcdTk4OThcdTc2RDFcdTU0MkNcbiAgICBpZiAodGhpcy5jc3NDaGFuZ2VSZWYpIHtcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vZmZyZWYodGhpcy5jc3NDaGFuZ2VSZWYpO1xuICAgICAgdGhpcy5jc3NDaGFuZ2VSZWYgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1NkUwNVx1NzQwNlx1OTAxQVx1NEZFMVx1NUM0MlxuICAgIHRoaXMuYXBwQVBJPy5kZXRhY2goKTtcbiAgICB0aGlzLmFwcEFQSSA9IG51bGw7XG5cbiAgICAvLyBcdTZFMDVcdTc0MDYgYmxvYiBVUkxcbiAgICB0aGlzLmFwcEhvc3Q/LmRlc3Ryb3koKTtcbiAgICB0aGlzLmFwcEhvc3QgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICB0aGlzLmlmcmFtZS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2M0E1XHU2NTM2XHU2NzY1XHU4MUVBXHU2M0QyXHU0RUY2XHU3Njg0XHU1QkZDXHU4MjJBL1x1NjRDRFx1NEY1Q1x1NjMwN1x1NEVFNCAqL1xuICBzZW5kQ29tbWFuZCh0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHsgdHlwZSwgaWQ6ICdjbWRfJyArIERhdGUubm93KCkgfSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGIFZhdWx0IFx1NEUyRFx1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAqL1xuICBwcml2YXRlIGFzeW5jIHNjYW5DdXN0b21UaGVtZXMoKTogUHJvbWlzZTxBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgdGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdGhlbWVEaXJOYW1lID0gdGhpcy5zZXR0aW5ncy50aGVtZVBhdGggfHwgJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCc7XG4gICAgICBsZXQgdGhlbWVEaXJGaWxlczogc3RyaW5nW107XG4gICAgICB0cnkge1xuICAgICAgICB0aGVtZURpckZpbGVzID0gKGF3YWl0IGFkYXB0ZXIubGlzdCh0aGVtZURpck5hbWUpKS5maWxlcztcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gdGhlbWVzO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoZW1lRGlyRmlsZXMpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5lbmRzV2l0aCgnLmpzJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGAke3RoZW1lRGlyTmFtZX0vJHtlbnRyeX1gO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvZGU6IHN0cmluZyA9IGF3YWl0IGFkYXB0ZXIucmVhZChmaWxlUGF0aCk7XG4gICAgICAgICAgaWYgKCFjb2RlLmluY2x1ZGVzKCdfX2JhbWJvb190aGVtZV8nKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU3RjNBXHU1QzExIF9fYmFtYm9vX3RoZW1lXyBcdTY4MDdcdThCQzZcdTdCMjZcdUZGMENcdTVERjJcdThERjNcdThGQzdgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGVtZXMucHVzaCh7IG5hbWU6IGVudHJ5LnJlcGxhY2UoL1xcLmpzJC8sICcnKSwgY29kZSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW0JhbWJvb1Jldmlld10gXHU4QkZCXHU1M0Q2XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICR7ZW50cnl9IFx1NTkzMVx1OEQyNTpgLCBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycikpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGVtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKGBbQmFtYm9vUmV2aWV3XSBcdTUzRDFcdTczQjAgJHt0aGVtZXMubGVuZ3RofSBcdTRFMkFcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTg6YCwgdGhlbWVzLm1hcCh0ID0+IHQubmFtZSkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgY29uc29sZS5kZWJ1ZygnW0JhbWJvb1Jldmlld10gXHU2MjZCXHU2M0NGXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU2NUY2XHU1MUZBXHU5NTE5OicsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lcztcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgRGF0YUFkYXB0ZXIsIG5vcm1hbGl6ZVBhdGgsIHJlcXVlc3RVcmwgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyB1bnppcFN5bmMgfSBmcm9tICdmZmxhdGUnO1xuXG4vKipcbiAqIEFwcEhvc3QgXHUyMDE0IHdlYmFwcCBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTRFMEVcdTZDRThcdTUxNjVcdTRFMkRcdTVGQzNcbiAqXG4gKiBcdTUyQTBcdThGN0RcdTdCNTZcdTc1NjVcdUZGMDhcdThGN0JcdTkxQ0ZcdTMwMDFcdTk2RjZcdTUxODVcdTVENENcdUZGMDlcdUZGMUFcbiAqICAgMS4gXHU4QkZCXHU1M0Q2XHU2Nzg0XHU1RUZBXHU2NzFGXHU3NTFGXHU2MjEwXHU3Njg0XHU4MUVBXHU1MzA1XHU1NDJCIHdlYmFwcC9hcHAuaHRtbFx1RkYwOENTUyBcdTVERjJcdTUxODVcdTgwNTRcdTMwMDFidW5kbGUgXHU1REYyXHU1MTg1XHU4MDU0XHU0RTNBXHU5NzU5XHU2MDAxXG4gKiAgICAgIDxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiPiBcdTY4MDdcdTdCN0VcdUZGMENcdTY1RTBcdTRFRkJcdTRGNTVcdTU5MTZcdTkwRThcdTgxMUFcdTY3MkNcdTMwMDFcdTY1RTBcdTUzNjBcdTRGNERcdTdCMjZcdUZGMDlcdTMwMDJcbiAqICAgMi4gXHU1QzA2XHU2NTc0XHU5ODc1IEhUTUwgXHU0RUU1IGJsb2IgVVJMIFx1NUY2Mlx1NUYwRlx1NEVBNFx1N0VEOSBpZnJhbWUgXHU1MkEwXHU4RjdEXHUzMDAyXG4gKlxuICogXHU3NTMxXHU0RThFXHU2MjQwXHU2NzA5IDxzY3JpcHQ+IFx1NTc0N1x1NTcyOFx1Njc4NFx1NUVGQVx1NjcxRlx1RkYwOGJ1bmRsZS13ZWJhcHAubWpzXHVGRjA5XHU5NzU5XHU2MDAxXHU1MTk5XHU1MTY1IGFwcC5odG1sXHVGRjBDXHU4RkQwXHU4ODRDXHU2NUY2XG4gKiBtYWluLmpzIFx1NEUwRFx1NTIxQlx1NUVGQVx1MzAwMVx1NEUwRFx1NjJGQ1x1NjNBNVx1NEVGQlx1NEY1NSBzY3JpcHQgXHU1MTQzXHU3RDIwXHVGRjBDXHU4OUM0XHU5MDdGXHU1Qjg5XHU1MTY4XHU2MjZCXHU2M0NGXHUzMDBDXHU1MkE4XHU2MDAxXHU2Q0U4XHU1MTY1XHU4MTFBXHU2NzJDXHUzMDBEXHU4QkVGXHU2MkE1XHUzMDAyXG4gKlxuICogd2ViYXBwIFx1NzUzMVx1NTNEMVx1NUUwM1x1NkQ0MVx1N0EwQlx1NjI1M1x1NTMwNVx1NEUzQSB3ZWJhcHAuemlwIFx1OTY4Rlx1NzI0OFx1NjcyQ1x1NTIwNlx1NTNEMVx1RkYwOFx1ODlDMSAuZ2l0aHViL3dvcmtmbG93cy9yZWxlYXNlLnltbFx1RkYwOVx1RkYwQ1xuICogXHU2NzJDXHU1NzMwXHU1RjAwXHU1M0QxL1x1NTE4NVx1NkQ0Qlx1OTAxQVx1OEZDNyBzeW5jLnNoIFx1NTQwQ1x1NkI2NVx1NjU3NFx1NEUyQSB3ZWJhcHAvIFx1NzZFRVx1NUY1NVx1RkYwOFx1NTQyQiBhcHAuaHRtbFx1RkYwOVx1RkYwQ1x1OEZEMFx1ODg0Q1x1NjVGNlx1NzZGNFx1NjNBNVx1OEJGQlx1NTNENlx1RkYwQ1xuICogXHU2NUUwXHU5NzAwXHU1MTg1XHU1RDRDXHUzMDAxXHU2NUUwXHU1OTE2XHU5MEU4XHU4MDU0XHU3RjUxXHVGRjBDbWFpbi5qcyBcdTRGRERcdTYzMDFcdThGN0JcdTkxQ0ZcdTMwMDJcbiAqXG4gKiBcdTgxRUFcdTYxMDhcdUZGMDhcdTcyNDhcdTY3MkNcdTVCODhcdTUzNkJcdUZGMDlcdUZGMUFcdThGRDBcdTg4NENcdTY1RjZcdTZCRDRcdTVCRjkgd2ViYXBwLy53ZWJhcHAtdmVyc2lvbiBcdTRFMEVcdTVGNTNcdTUyNERcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdTMwMDJcbiAqICAgLSBcdTY3MkNcdTU3MzBcdTdGM0FcdTU5MzEgd2ViYXBwL1x1RkYwQ1x1NjIxNlx1NzI0OFx1NjcyQ1x1NjIzM1x1N0YzQVx1NTkzMVx1RkYwOFx1ODAwMSBjbG9uZSAvIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOVx1MjE5MiBcdTRGRTFcdTRFRkJcdTc4QzFcdTc2RDhcdTYyMTZcdTk2NERcdTdFQTdcdUZGMUJcbiAqICAgLSBcdTcyNDhcdTY3MkNcdTRFMERcdTdCMjZcdUZGMDhcdTYzRDJcdTRFRjZcdTVERjJcdTUzNDdcdTdFQTdcdTRGNDYgd2ViYXBwIFx1NjcyQVx1OERERlx1OTY4Rlx1RkYwOVx1MjE5MiBcdTkxQ0RcdTY1QjBcdTRFQ0VcdTVCRjlcdTVFOTRcdTcyNDhcdTY3MkMgR2l0SHViIFJlbGVhc2VcbiAqICAgICBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0Qgd2ViYXBwLnppcCBcdTVFNzZcdTg5RTNcdTUzOEJcdUZGMENcdTRGN0ZcdTMwMEN3ZWJhcHAgXHU2NkY0XHU2NUIwXHU3RUNGIEdpdEh1YiBcdTk2OEZcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdTkwMDFcdThGQkVcdTMwMERcdTc3MUZcdTZCNjNcdTYyMTBcdTdBQ0JcdTMwMDJcbiAqL1xuZXhwb3J0IGNsYXNzIEFwcEhvc3Qge1xuICBwcml2YXRlIGFwcDogQXBwO1xuICBwcml2YXRlIHdlYmFwcERpcjogc3RyaW5nO1xuICBwcml2YXRlIGJsb2JVcmxzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IHZlcnNpb246IHN0cmluZztcbiAgcHJpdmF0ZSByZWFkb25seSByZXBvID0gJ21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscyc7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbkRpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLndlYmFwcERpciA9IG5vcm1hbGl6ZVBhdGgoYCR7cGx1Z2luRGlyfS93ZWJhcHBgKTtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uO1xuICB9XG5cbiAgLy8gXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2XHU3Njg0XHU1M0JCXHU5MUNEXHU3RjEzXHU1QjU4XHVGRjFBXHU5MDdGXHU1MTREXHU2M0QyXHU0RUY2IG9ubG9hZCBcdTk4ODRcdTYyQzlcdTUzRDZcdTRFMEVcdTg5QzZcdTU2RkVcdTYyNTNcdTVGMDBcdTY1RjZcdTkxQ0RcdTU5MERcdTRFMEJcdThGN0RcbiAgcHJpdmF0ZSBzdGF0aWMgcHJlZmV0Y2hDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBQcm9taXNlPHZvaWQ+PigpO1xuXG4gIC8qKlxuICAgKiBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDZcdUZGMUFcdTYzRDJcdTRFRjYgb25sb2FkIFx1NjVGNlx1OEMwM1x1NzUyOFx1RkYwQ1x1NjNEMFx1NTI0RFx1NjI4QVx1N0YzQVx1NTkzMVx1NzY4NCB3ZWJhcHAgXHU0RTBCXHU4RjdEXHU1RTc2XHU4OUUzXHU1MzhCXHU1MjMwXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHUzMDAyXG4gICAqIFx1NkI2M1x1NUUzOFx1NUI4OVx1ODhDNVx1RkYwOHdlYmFwcC8gXHU1REYyXHU5NjhGXHU2M0QyXHU0RUY2XHU1MjA2XHU1M0QxXHVGRjA5XHU2NUY2XHU0RUM1XHU1MDVBXHU0RTAwXHU2QjIxXHU1QjU4XHU1NzI4XHU2MDI3XHU2OEMwXHU2N0U1XHVGRjBDXHU1MUUwXHU0RTRFXHU5NkY2XHU1RjAwXHU5NTAwXHUzMDAyXG4gICAqIFx1NTkzMVx1OEQyNVx1NEVDNVx1NTQ0QVx1OEI2Nlx1RkYwOFx1NEUwRFx1NjI5Qlx1NTFGQVx1RkYwOVx1RkYwQ1x1NzcxRlx1NkI2M1x1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NjVGNiBidWlsZEJsb2JVcmwgXHU0RjFBXHU1MThEXHU2QjIxXHU1QzFEXHU4QkQ1XHVGRjFCXG4gICAqIFx1NTQwQ1x1NEUwMFx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NVx1NUU3Nlx1NTNEMVx1NTNFQVx1ODlFNlx1NTNEMVx1NEUwMFx1NkIyMVx1NEUwQlx1OEY3RFx1MzAwMlxuICAgKi9cbiAgc3RhdGljIHByZWZldGNoKGFwcDogQXBwLCBwbHVnaW5EaXI6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qga2V5ID0gbm9ybWFsaXplUGF0aChgJHtwbHVnaW5EaXJ9L3dlYmFwcGApO1xuICAgIGxldCBwID0gQXBwSG9zdC5wcmVmZXRjaENhY2hlLmdldChrZXkpO1xuICAgIGlmICghcCkge1xuICAgICAgY29uc3QgaG9zdCA9IG5ldyBBcHBIb3N0KGFwcCwgcGx1Z2luRGlyLCB2ZXJzaW9uKTtcbiAgICAgIHAgPSBob3N0LmVuc3VyZVdlYmFwcChhcHAudmF1bHQuYWRhcHRlcikuY2F0Y2goKGU6IHVua25vd24pID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICdbQXBwSG9zdF0gXHU1NDBFXHU1M0YwXHU5ODg0XHU2MkM5XHU1M0Q2IHdlYmFwcCBcdTU5MzFcdThEMjVcdUZGMDhcdTYyNTNcdTVGMDBcdTg5QzZcdTU2RkVcdTY1RjZcdTVDMDZcdTkxQ0RcdThCRDVcdUZGMDlcdUZGMUEnLFxuICAgICAgICAgIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBBcHBIb3N0LnByZWZldGNoQ2FjaGUuc2V0KGtleSwgcCk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG5cbiAgYXN5bmMgYnVpbGRCbG9iVXJsKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG5cbiAgICAvLyBcdTgxRUFcdTYxMDhcdUZGMUF3ZWJhcHAvIFx1N0YzQVx1NTkzMVx1NjVGNlx1NEVDRVx1NUJGOVx1NUU5NFx1NzI0OFx1NjcyQyBSZWxlYXNlIFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1NUU3Nlx1ODlFM1x1NTM4QlxuICAgIGF3YWl0IHRoaXMuZW5zdXJlV2ViYXBwKGFkYXB0ZXIpO1xuXG4gICAgY29uc3QgYXBwSHRtbFBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS9hcHAuaHRtbGApO1xuICAgIGxldCBodG1sOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIGh0bWwgPSBhd2FpdCBhZGFwdGVyLnJlYWQoYXBwSHRtbFBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTY1RTBcdTZDRDVcdThCRkJcdTUzRDYgd2ViYXBwL2FwcC5odG1sXHVGRjBDXHU0RTE0XHU4MUVBXHU1MkE4XHU0RTBCXHU4RjdEXHU1OTMxXHU4RDI1XHUzMDAyXHU4QkY3XHU1QzFEXHU4QkQ1XHU1NzI4IE9ic2lkaWFuIFx1NEUyRFx1OTFDRFx1NjVCMFx1NUI4OVx1ODhDNVx1NjcyQ1x1NjNEMlx1NEVGNlx1RkYwQ1x1NjIxNlx1NjI0Qlx1NTJBOFx1NjUzRVx1N0Y2RSB3ZWJhcHAvIFx1NzZFRVx1NUY1NScpO1xuICAgIH1cblxuICAgIC8vIFx1NjU3NFx1OTg3NSBIVE1MIFx1NURGMlx1ODFFQVx1NTMwNVx1NTQyQlx1RkYwOENTUyBcdTUxODVcdTgwNTQgKyBidW5kbGUgXHU1MTg1XHU4MDU0XHU0RTNBXHU5NzU5XHU2MDAxIDxzY3JpcHQ+XHVGRjA5XHVGRjBDXHU3NkY0XHU2M0E1IGJsb2IgXHU0RUE0XHU3RUQ5IGlmcmFtZVx1MzAwMlxuICAgIC8vIFx1OEZEMFx1ODg0Q1x1NjVGNlx1NEUwRFx1NTIxQlx1NUVGQVx1MzAwMVx1NEUwRFx1NjJGQ1x1NjNBNVx1NEVGQlx1NEY1NSBzY3JpcHQgXHU1MTQzXHU3RDIwXHUzMDAyXG4gICAgY29uc3QgcGFnZUJsb2IgPSBuZXcgQmxvYihbaHRtbF0sIHsgdHlwZTogJ3RleHQvaHRtbCcgfSk7XG4gICAgY29uc3QgcGFnZVVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwocGFnZUJsb2IpO1xuICAgIHRoaXMuYmxvYlVybHMucHVzaChwYWdlVXJsKTtcbiAgICByZXR1cm4gcGFnZVVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTgxRUFcdTYxMDhcdUZGMDhcdTcyNDhcdTY3MkNcdTVCODhcdTUzNkJcdUZGMDlcdUZGMUFcdTgyRTVcdTY3MkNcdTU3MzAgd2ViYXBwIFx1N0YzQVx1NTkzMVx1RkYwQ1x1NjIxNlx1NURGMlx1NUI1OFx1NTcyOFx1NEY0Nlx1NzI0OFx1NjcyQ1x1NjIzM1x1NEUwRVx1NUY1M1x1NTI0RFx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1NEUwRFx1N0IyNlx1RkYwQ1xuICAgKiBcdTUyMTlcdTkxQ0RcdTY1QjBcdTRFQ0UgR2l0SHViIFJlbGVhc2UgXHU0RTBCXHU4RjdEXHU1QkY5XHU1RTk0XHU3MjQ4XHU2NzJDXHU3Njg0IHdlYmFwcC56aXAgXHU4OUUzXHU1MzhCXHVGRjA4XHU4OTg2XHU3NkQ2XHVGRjA5XHUzMDAyXG4gICAqIFx1NkI2M1x1NUUzOFx1NUI4OVx1ODhDNVx1RkYwOHdlYmFwcC8gXHU1REYyXHU5NjhGXHU2M0QyXHU0RUY2XHU1MjA2XHU1M0QxXHU0RTE0XHU3MjQ4XHU2NzJDXHU1MzM5XHU5MTREXHVGRjA5XHU1QjhDXHU1MTY4XHU0RTBEXHU4OUU2XHU1M0QxXHU4MDU0XHU3RjUxXHVGRjFCXHU0RUM1XHU3RjNBXHU1OTMxXHU2MjE2XHU4RkM3XHU2NzFGXHU2NUY2XHU1MTVDXHU1RTk1XHUzMDAyXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGVuc3VyZVdlYmFwcChhZGFwdGVyOiBEYXRhQWRhcHRlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHZlcnNpb25TdGFtcEZpbGUgPSAnLndlYmFwcC12ZXJzaW9uJztcbiAgICBjb25zdCBhcHBIdG1sUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9L2FwcC5odG1sYCk7XG4gICAgY29uc3Qgc3RhbXBQYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLndlYmFwcERpcn0vJHt2ZXJzaW9uU3RhbXBGaWxlfWApO1xuXG4gICAgaWYgKGF3YWl0IHRoaXMuZmlsZUV4aXN0cyhhZGFwdGVyLCBhcHBIdG1sUGF0aCkpIHtcbiAgICAgIC8vIHdlYmFwcC8gXHU1QjU4XHU1NzI4XHVGRjFBXHU0RUM1XHU1RjUzXHU3MjQ4XHU2NzJDXHU2MjMzXHU3RjNBXHU1OTMxXHVGRjA4XHU4MDAxIGNsb25lIC8gXHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHVGRjA5XHU2MjE2XHU3MjQ4XHU2NzJDXHU0RTBEXHU3QjI2XHU2NUY2XHU2MjREXHU5MUNEXHU0RTBCXHVGRjBDXG4gICAgICAvLyBcdTU0MjZcdTUyMTlcdTRGRTFcdTRFRkJcdTc4QzFcdTc2RDggXHUyMDE0XHUyMDE0IEJSQVQgLyBnaXQtY2xvbmUgXHU5NjhGXHU0RUQzXHU1RTkzXHU1NDBDXHU2QjY1XHU3Njg0XHU2NzAwXHU2NUIwIHdlYmFwcCBcdTUzNzNcdTZCNjNcdTc4NkVcdUZGMENcdTY1RTBcdTk3MDBcdTgwNTRcdTdGNTFcdTMwMDJcbiAgICAgIGlmICghKGF3YWl0IHRoaXMuZmlsZUV4aXN0cyhhZGFwdGVyLCBzdGFtcFBhdGgpKSkgcmV0dXJuO1xuICAgICAgY29uc3QgbG9jYWwgPSBhd2FpdCB0aGlzLnJlYWRWZXJzaW9uU3RhbXAoYWRhcHRlciwgc3RhbXBQYXRoKTtcbiAgICAgIGlmIChsb2NhbCA9PT0gdGhpcy52ZXJzaW9uKSByZXR1cm47XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYFtBcHBIb3N0XSBcdTY3MkNcdTU3MzAgd2ViYXBwIFx1NzI0OFx1NjcyQygke2xvY2FsfSkgXHU0RTBFXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDKCR7dGhpcy52ZXJzaW9ufSkgXHU0RTBEXHU3QjI2XHVGRjBDXHU5MUNEXHU2NUIwXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHUzMDAyYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudmVyc2lvbikge1xuICAgICAgY29uc29sZS53YXJuKCdbQXBwSG9zdF0gXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHVGRjBDXHU4REYzXHU4RkM3XHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHUzMDAyXHU4QkY3XHU3ODZFXHU4QkE0XHU2M0QyXHU0RUY2XHU1Qjg5XHU4OEM1XHU1QjhDXHU2NTc0XHUzMDAyJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMucmVwb30vcmVsZWFzZXMvZG93bmxvYWQvJHt0aGlzLnZlcnNpb259L3dlYmFwcC56aXBgO1xuICAgIGNvbnNvbGUubG9nKGBbQXBwSG9zdF0gXHU2NzJBXHU2OEMwXHU2RDRCXHU1MjMwXHU1MzM5XHU5MTREXHU3Njg0XHU2NzJDXHU1NzMwIHdlYmFwcFx1RkYwQ1x1NUMxRFx1OEJENVx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1RkYxQSR7dXJsfWApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgcmVxdWVzdFVybCh7IHVybCwgbWV0aG9kOiAnR0VUJyB9KTtcbiAgICAgIGlmIChyZXNwLnN0YXR1cyA8IDIwMCB8fCByZXNwLnN0YXR1cyA+PSAzMDAgfHwgIXJlc3AuYXJyYXlCdWZmZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcdTRFMEJcdThGN0RcdThGRDRcdTU2REVcdTVGMDJcdTVFMzhcdTcyQjZcdTYwMDEgJHtyZXNwLnN0YXR1c31gKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuZXh0cmFjdFppcChhZGFwdGVyLCByZXNwLmFycmF5QnVmZmVyKTtcbiAgICAgIC8vIHdlYmFwcC56aXAgXHU1REYyXHU2NDNBXHU1RTI2IC53ZWJhcHAtdmVyc2lvblx1RkYwQ1x1ODlFM1x1NTM4Qlx1NTQwRVx1ODFFQVx1NTJBOFx1ODQzRFx1NzZEOFx1RkYxQlx1NkI2NFx1NTkwNFx1NTE1Q1x1NUU5NVx1NTE4RFx1NTE5OVx1NEUwMFx1NkIyMVx1RkYwQ1xuICAgICAgLy8gXHU5MDdGXHU1MTREXHU1NDBDXHU3MjQ4XHU2NzJDXHU1M0NEXHU1OTBEXHU5MUNEXHU0RTBCXHUzMDAyXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhZGFwdGVyLndyaXRlKHN0YW1wUGF0aCwgdGhpcy52ZXJzaW9uKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbQXBwSG9zdF0gXHU1MTk5XHU1MTY1IHdlYmFwcCBcdTcyNDhcdTY3MkNcdTYyMzNcdTU5MzFcdThEMjVcdUZGMDhcdTRFMERcdTVGNzFcdTU0Q0RcdTRGN0ZcdTc1MjhcdUZGMDlcdUZGMUEnLCBlKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCdbQXBwSG9zdF0gd2ViYXBwIFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RFx1NUU3Nlx1ODlFM1x1NTM4Qlx1NUI4Q1x1NjIxMFx1MzAwMicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcHBIb3N0XSB3ZWJhcHAgXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHU1OTMxXHU4RDI1XHVGRjFBJywgZSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBcdTY1RTBcdTZDRDVcdTgxRUFcdTUyQThcdTgzQjdcdTUzRDYgd2ViYXBwXHVGRjA4JHtlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU2NzJBXHU3N0U1XHU5NTE5XHU4QkVGJ31cdUZGMDlcdTMwMDJgICtcbiAgICAgICAgJ1x1OEJGN1x1NjhDMFx1NjdFNVx1N0Y1MVx1N0VEQ1x1NTQwRVx1OTFDRFx1OEJENVx1RkYwQ1x1NjIxNlx1NTcyOCBPYnNpZGlhbiBcdTRFMkRcdTkxQ0RcdTY1QjBcdTVCODlcdTg4QzVcdTY3MkNcdTYzRDJcdTRFRjZcdTMwMDInXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVhZFZlcnNpb25TdGFtcChhZGFwdGVyOiBEYXRhQWRhcHRlciwgZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGF3YWl0IGFkYXB0ZXIucmVhZChmaWxlUGF0aCkpLnRyaW0oKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZXh0cmFjdFppcChhZGFwdGVyOiBEYXRhQWRhcHRlciwgYnVmZmVyOiBBcnJheUJ1ZmZlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIGZmbGF0ZSBcdTk2RjZcdTRGOURcdThENTZcdUZGMDhcdTY1RTAgc2V0aW1tZWRpYXRlIFx1NEU0Qlx1N0M3Qlx1NEYxQVx1NTJBOFx1NjAwMVx1NTIxQlx1NUVGQSA8c2NyaXB0PiBcdTc2ODRcdTRGMjBcdTkwMTJcdTRGOURcdThENTZcdUZGMDlcdUZGMENcbiAgICAvLyBcdThGRDRcdTU2REVcdTc2ODQgZW50cmllcyBcdTRFQzVcdTU0MkJcdTY1ODdcdTRFRjZcdUZGMDhcdTRFMERcdTU0MkJcdTc2RUVcdTVGNTVcdTY3NjFcdTc2RUVcdUZGMDlcdUZGMENcdTc2RUVcdTVGNTVcdTc1MzEgZW5zdXJlUGFyZW50RGlyU2FmZSBcdTYzMDlcdTk3MDBcdTUyMUJcdTVFRkFcdTMwMDJcbiAgICBjb25zdCBmaWxlcyA9IHVuemlwU3luYyhuZXcgVWludDhBcnJheShidWZmZXIpKTtcbiAgICBjb25zdCBlbnRyaWVzOiB7IHRhcmdldDogc3RyaW5nOyBjb250ZW50OiBVaW50OEFycmF5IH1bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgW3Jhd1BhdGgsIGNvbnRlbnRdIG9mIE9iamVjdC5lbnRyaWVzKGZpbGVzKSkge1xuICAgICAgY29uc3QgcmVsID0gbm9ybWFsaXplUGF0aChyYXdQYXRoLnJlcGxhY2UoL15cXC4/XFwvLywgJycpKTtcbiAgICAgIGlmICghcmVsKSBjb250aW51ZTtcbiAgICAgIGlmIChyZWwuZW5kc1dpdGgoJy8nKSkgY29udGludWU7IC8vIFx1NzZFRVx1NUY1NVx1NTM2MFx1NEY0RFx1Njc2MVx1NzZFRVx1RkYwQ1x1NjVFMFx1OTcwMFx1NTE5OVx1NTFGQVxuICAgICAgZW50cmllcy5wdXNoKHsgdGFyZ2V0OiBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS8ke3JlbH1gKSwgY29udGVudCB9KTtcbiAgICB9XG5cbiAgICAvLyBcdTdCMkNcdTRFMDBcdTkwNERcdUZGMUFcdTUxNDhcdTVFRkFcdTU5N0RcdTYyNDBcdTY3MDlcdTcyMzZcdTc2RUVcdTVGNTVcdTMwMDJcdTgyRTVcdTY3RDBcdTRFMDBcdTdFQTdcdTVERjJcdTg4QUJcdTU0MENcdTU0MERcdTY1ODdcdTRFRjZcdTUzNjBcdTc1MjhcdUZGMDh6aXAgXHU3NkVFXHU1RjU1XHU1MzYwXHU0RjREXHU2NzYxXHU3NkVFXHUzMDAxXG4gICAgLy8gXHU2MjE2XHU2NzJDXHU1NzMwXHU2QjhCXHU3NTU5XHU3Njg0XHU1NzRGXHU2NTg3XHU0RUY2XHVGRjA5XHVGRjBDXHU1MTQ4XHU1MjIwXHU5NjY0XHU1MThEXHU1RUZBXHU3NkVFXHU1RjU1XHVGRjBDXHU5MDdGXHU1MTREXHU1NDBFXHU3RUVEIHdyaXRlQmluYXJ5IFx1ODlFNlx1NTNEMSBFTk9URElSXHUzMDAyXG4gICAgZm9yIChjb25zdCB7IHRhcmdldCB9IG9mIGVudHJpZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMuZW5zdXJlUGFyZW50RGlyU2FmZShhZGFwdGVyLCB0YXJnZXQpO1xuICAgIH1cblxuICAgIC8vIFx1N0IyQ1x1NEU4Q1x1OTA0RFx1RkYxQVx1NTE5OVx1NjU4N1x1NEVGNlx1MzAwMlx1ODJFNVx1NjdEMFx1Njc2MVx1NzZFRVx1OERFRlx1NUY4NFx1NURGMlx1ODhBQlx1NUY1M1x1NEY1Q1x1NzZFRVx1NUY1NVx1NTE5OVx1NTE2NVx1RkYwOFx1NTM2MFx1NEY0RFx1NjU4N1x1NEVGNlx1NEUwRVx1NzcxRlx1NUI5RVx1NzZFRVx1NUY1NVx1NTFCMlx1N0E4MVx1RkYwOVx1RkYwQ1xuICAgIC8vIFx1OERGM1x1OEZDN1x1OEJFNVx1NTM2MFx1NEY0RFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEUwRFx1ODk4Nlx1NzZENlx1NEUzQVx1NjU4N1x1NEVGNlx1RkYwQ1x1NEZERFx1OEJDMSBhc3NldHMvc2NyaXB0cy8qIFx1N0I0OVx1NUQ0Q1x1NTk1N1x1NjU4N1x1NEVGNlx1ODBGRFx1NkI2M1x1NUUzOFx1ODQzRFx1NzZEOFx1MzAwMlxuICAgIGZvciAoY29uc3QgeyB0YXJnZXQsIGNvbnRlbnQgfSBvZiBlbnRyaWVzKSB7XG4gICAgICBpZiAoYXdhaXQgdGhpcy5pc0ZvbGRlcihhZGFwdGVyLCB0YXJnZXQpKSBjb250aW51ZTtcbiAgICAgIC8vIFVpbnQ4QXJyYXkgXHUyMTkyIFx1NzJFQ1x1N0FDQiBBcnJheUJ1ZmZlclx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTE3MVx1NEVBQlx1NUU5NVx1NUM0MiBidWZmZXIgXHU1QkZDXHU4MUY0XHU4RDhBXHU3NTRDXG4gICAgICBhd2FpdCBhZGFwdGVyLndyaXRlQmluYXJ5KHRhcmdldCwgY29udGVudC5zbGljZSgpLmJ1ZmZlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1OTAxMFx1N0VBN1x1Nzg2RVx1NEZERFx1NzIzNlx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFx1RkYxQlx1OTA0N1x1NTIzMFx1MzAwQ1x1NTQwQ1x1NTQwRFx1NjU4N1x1NEVGNlx1NTM2MFx1NEY0RFx1MzAwRFx1NjVGNlx1NTE0OFx1NTIyMFx1OTY2NFx1NTE4RCBta2Rpclx1RkYwQ1xuICAgKiBcdTg5RTNcdTUxQjMgemlwIFx1NTM2MFx1NEY0RFx1Njc2MVx1NzZFRSAvIFx1NjcyQ1x1NTczMFx1NTc0Rlx1NjU4N1x1NEVGNlx1NUJGQ1x1ODFGNCB3cml0ZUJpbmFyeSBcdTYyOUIgRU5PVERJUiBcdTc2ODRcdTk1RUVcdTk4OThcdTMwMDJcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlUGFyZW50RGlyU2FmZShhZGFwdGVyOiBEYXRhQWRhcHRlciwgZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhcnRzID0gZmlsZVBhdGguc3BsaXQoJy8nKTtcbiAgICBsZXQgYWNjID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGFjYyArPSAoYWNjID8gJy8nIDogJycpICsgcGFydHNbaV07XG4gICAgICBpZiAoIWFjYykgY29udGludWU7XG4gICAgICBjb25zdCBraW5kID0gYXdhaXQgdGhpcy5zdGF0S2luZChhZGFwdGVyLCBhY2MpO1xuICAgICAgaWYgKGtpbmQgPT09ICdmb2xkZXInKSBjb250aW51ZTsgLy8gXHU1REYyXHU2NjJGXHU3NkVFXHU1RjU1XHVGRjBDXHU4REYzXHU4RkM3XG4gICAgICBpZiAoa2luZCA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgYWRhcHRlci5yZW1vdmUoYWNjKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gXHU1MjIwXHU5NjY0XHU1OTMxXHU4RDI1XHU0RTVGXHU0RTBEXHU5NjNCXHU2NUFEXHVGRjBDXHU0RUE0XHU3NTMxXHU0RTBCXHU2NUI5IG1rZGlyIFx1NjZCNFx1OTczMlx1NzcxRlx1NUI5RVx1OTUxOVx1OEJFRlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhZGFwdGVyLm1rZGlyKGFjYyk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gXHU1M0VGXHU4MEZEXHU1REYyXHU4OEFCXHU1MTc2XHU0RUQ2XHU2NzYxXHU3NkVFXHU1MTQ4XHU4ODRDXHU1MjFCXHU1RUZBXHVGRjBDXHU1RkZEXHU3NTY1XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1OEZENFx1NTZERVx1OERFRlx1NUY4NFx1N0M3Qlx1NTc4Qlx1RkYxQSdmaWxlJyB8ICdmb2xkZXInIHwgJ25vbmUnXHVGRjA4XHU0RTBEXHU1QjU4XHU1NzI4XHU2MjE2XHU2NUUwXHU2Q0Q1XHU1MjI0XHU1QjlBXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgc3RhdEtpbmQoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8J2ZpbGUnIHwgJ2ZvbGRlcicgfCAnbm9uZSc+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3QgPSBhd2FpdCBhZGFwdGVyLnN0YXQocGF0aCk7XG4gICAgICBpZiAoIXN0KSByZXR1cm4gJ25vbmUnO1xuICAgICAgcmV0dXJuIHN0LnR5cGUgPT09ICdmb2xkZXInID8gJ2ZvbGRlcicgOiAnZmlsZSc7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ25vbmUnO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaXNGb2xkZXIoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5zdGF0S2luZChhZGFwdGVyLCBwYXRoKSkgPT09ICdmb2xkZXInO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmaWxlRXhpc3RzKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGFkYXB0ZXIuZXhpc3RzKHBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB1cmwgb2YgdGhpcy5ibG9iVXJscykge1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIH1cbiAgICB0aGlzLmJsb2JVcmxzID0gW107XG4gIH1cbn1cbiIsICIvLyBERUZMQVRFIGlzIGEgY29tcGxleCBmb3JtYXQ7IHRvIHJlYWQgdGhpcyBjb2RlLCB5b3Ugc2hvdWxkIHByb2JhYmx5IGNoZWNrIHRoZSBSRkMgZmlyc3Q6XG4vLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMTk1MVxuLy8gWW91IG1heSBhbHNvIHdpc2ggdG8gdGFrZSBhIGxvb2sgYXQgdGhlIGd1aWRlIEkgbWFkZSBhYm91dCB0aGlzIHByb2dyYW06XG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8xMDFhcnJvd3ovMjUzZjMxZWI1YWJjM2Q5Mjc1YWI5NDMwMDNmZmVjYWRcbi8vIFNvbWUgb2YgdGhlIGZvbGxvd2luZyBjb2RlIGlzIHNpbWlsYXIgdG8gdGhhdCBvZiBVWklQLmpzOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3Bob3RvcGVhL1VaSVAuanNcbi8vIEhvd2V2ZXIsIHRoZSB2YXN0IG1ham9yaXR5IG9mIHRoZSBjb2RlYmFzZSBoYXMgZGl2ZXJnZWQgZnJvbSBVWklQLmpzIHRvIGluY3JlYXNlIHBlcmZvcm1hbmNlIGFuZCByZWR1Y2UgYnVuZGxlIHNpemUuXG4vLyBTb21ldGltZXMgMCB3aWxsIGFwcGVhciB3aGVyZSAtMSB3b3VsZCBiZSBtb3JlIGFwcHJvcHJpYXRlLiBUaGlzIGlzIGJlY2F1c2UgdXNpbmcgYSB1aW50XG4vLyBpcyBiZXR0ZXIgZm9yIG1lbW9yeSBpbiBtb3N0IGVuZ2luZXMgKEkgKnRoaW5rKikuXG52YXIgY2gyID0ge307XG52YXIgd2sgPSAoZnVuY3Rpb24gKGMsIGlkLCBtc2csIHRyYW5zZmVyLCBjYikge1xuICAgIHZhciB3ID0gbmV3IFdvcmtlcihjaDJbaWRdIHx8IChjaDJbaWRdID0gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbXG4gICAgICAgIGMgKyAnO2FkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGZ1bmN0aW9uKGUpe2U9ZS5lcnJvcjtwb3N0TWVzc2FnZSh7JGUkOltlLm1lc3NhZ2UsZS5jb2RlLGUuc3RhY2tdfSl9KSdcbiAgICBdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pKSkpO1xuICAgIHcub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGQgPSBlLmRhdGEsIGVkID0gZC4kZSQ7XG4gICAgICAgIGlmIChlZCkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihlZFswXSk7XG4gICAgICAgICAgICBlcnJbJ2NvZGUnXSA9IGVkWzFdO1xuICAgICAgICAgICAgZXJyLnN0YWNrID0gZWRbMl07XG4gICAgICAgICAgICBjYihlcnIsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNiKG51bGwsIGQpO1xuICAgIH07XG4gICAgdy5wb3N0TWVzc2FnZShtc2csIHRyYW5zZmVyKTtcbiAgICByZXR1cm4gdztcbn0pO1xuXG4vLyBhbGlhc2VzIGZvciBzaG9ydGVyIGNvbXByZXNzZWQgY29kZSAobW9zdCBtaW5pZmVycyBkb24ndCBkbyB0aGlzKVxudmFyIHU4ID0gVWludDhBcnJheSwgdTE2ID0gVWludDE2QXJyYXksIGkzMiA9IEludDMyQXJyYXk7XG4vLyBmaXhlZCBsZW5ndGggZXh0cmEgYml0c1xudmFyIGZsZWIgPSBuZXcgdTgoWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDEsIDIsIDIsIDIsIDIsIDMsIDMsIDMsIDMsIDQsIDQsIDQsIDQsIDUsIDUsIDUsIDUsIDAsIC8qIHVudXNlZCAqLyAwLCAwLCAvKiBpbXBvc3NpYmxlICovIDBdKTtcbi8vIGZpeGVkIGRpc3RhbmNlIGV4dHJhIGJpdHNcbnZhciBmZGViID0gbmV3IHU4KFswLCAwLCAwLCAwLCAxLCAxLCAyLCAyLCAzLCAzLCA0LCA0LCA1LCA1LCA2LCA2LCA3LCA3LCA4LCA4LCA5LCA5LCAxMCwgMTAsIDExLCAxMSwgMTIsIDEyLCAxMywgMTMsIC8qIHVudXNlZCAqLyAwLCAwXSk7XG4vLyBjb2RlIGxlbmd0aCBpbmRleCBtYXBcbnZhciBjbGltID0gbmV3IHU4KFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XSk7XG4vLyBnZXQgYmFzZSwgcmV2ZXJzZSBpbmRleCBtYXAgZnJvbSBleHRyYSBiaXRzXG52YXIgZnJlYiA9IGZ1bmN0aW9uIChlYiwgc3RhcnQpIHtcbiAgICB2YXIgYiA9IG5ldyB1MTYoMzEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzE7ICsraSkge1xuICAgICAgICBiW2ldID0gc3RhcnQgKz0gMSA8PCBlYltpIC0gMV07XG4gICAgfVxuICAgIC8vIG51bWJlcnMgaGVyZSBhcmUgYXQgbWF4IDE4IGJpdHNcbiAgICB2YXIgciA9IG5ldyBpMzIoYlszMF0pO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMzA7ICsraSkge1xuICAgICAgICBmb3IgKHZhciBqID0gYltpXTsgaiA8IGJbaSArIDFdOyArK2opIHtcbiAgICAgICAgICAgIHJbal0gPSAoKGogLSBiW2ldKSA8PCA1KSB8IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYjogYiwgcjogciB9O1xufTtcbnZhciBfYSA9IGZyZWIoZmxlYiwgMiksIGZsID0gX2EuYiwgcmV2ZmwgPSBfYS5yO1xuLy8gd2UgY2FuIGlnbm9yZSB0aGUgZmFjdCB0aGF0IHRoZSBvdGhlciBudW1iZXJzIGFyZSB3cm9uZzsgdGhleSBuZXZlciBoYXBwZW4gYW55d2F5XG5mbFsyOF0gPSAyNTgsIHJldmZsWzI1OF0gPSAyODtcbnZhciBfYiA9IGZyZWIoZmRlYiwgMCksIGZkID0gX2IuYiwgcmV2ZmQgPSBfYi5yO1xuLy8gbWFwIG9mIHZhbHVlIHRvIHJldmVyc2UgKGFzc3VtaW5nIDE2IGJpdHMpXG52YXIgcmV2ID0gbmV3IHUxNigzMjc2OCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyNzY4OyArK2kpIHtcbiAgICAvLyByZXZlcnNlIHRhYmxlIGFsZ29yaXRobSBmcm9tIFNPXG4gICAgdmFyIHggPSAoKGkgJiAweEFBQUEpID4+IDEpIHwgKChpICYgMHg1NTU1KSA8PCAxKTtcbiAgICB4ID0gKCh4ICYgMHhDQ0NDKSA+PiAyKSB8ICgoeCAmIDB4MzMzMykgPDwgMik7XG4gICAgeCA9ICgoeCAmIDB4RjBGMCkgPj4gNCkgfCAoKHggJiAweDBGMEYpIDw8IDQpO1xuICAgIHJldltpXSA9ICgoKHggJiAweEZGMDApID4+IDgpIHwgKCh4ICYgMHgwMEZGKSA8PCA4KSkgPj4gMTtcbn1cbi8vIGNyZWF0ZSBodWZmbWFuIHRyZWUgZnJvbSB1OCBcIm1hcFwiOiBpbmRleCAtPiBjb2RlIGxlbmd0aCBmb3IgY29kZSBpbmRleFxuLy8gbWIgKG1heCBiaXRzKSBtdXN0IGJlIGF0IG1vc3QgMTVcbi8vIFRPRE86IG9wdGltaXplL3NwbGl0IHVwP1xudmFyIGhNYXAgPSAoZnVuY3Rpb24gKGNkLCBtYiwgcikge1xuICAgIHZhciBzID0gY2QubGVuZ3RoO1xuICAgIC8vIGluZGV4XG4gICAgdmFyIGkgPSAwO1xuICAgIC8vIHUxNiBcIm1hcFwiOiBpbmRleCAtPiAjIG9mIGNvZGVzIHdpdGggYml0IGxlbmd0aCA9IGluZGV4XG4gICAgdmFyIGwgPSBuZXcgdTE2KG1iKTtcbiAgICAvLyBsZW5ndGggb2YgY2QgbXVzdCBiZSAyODggKHRvdGFsICMgb2YgY29kZXMpXG4gICAgZm9yICg7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgaWYgKGNkW2ldKVxuICAgICAgICAgICAgKytsW2NkW2ldIC0gMV07XG4gICAgfVxuICAgIC8vIHUxNiBcIm1hcFwiOiBpbmRleCAtPiBtaW5pbXVtIGNvZGUgZm9yIGJpdCBsZW5ndGggPSBpbmRleFxuICAgIHZhciBsZSA9IG5ldyB1MTYobWIpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBtYjsgKytpKSB7XG4gICAgICAgIGxlW2ldID0gKGxlW2kgLSAxXSArIGxbaSAtIDFdKSA8PCAxO1xuICAgIH1cbiAgICB2YXIgY287XG4gICAgaWYgKHIpIHtcbiAgICAgICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+IG51bWJlciBvZiBhY3R1YWwgYml0cywgc3ltYm9sIGZvciBjb2RlXG4gICAgICAgIGNvID0gbmV3IHUxNigxIDw8IG1iKTtcbiAgICAgICAgLy8gYml0cyB0byByZW1vdmUgZm9yIHJldmVyc2VyXG4gICAgICAgIHZhciBydmIgPSAxNSAtIG1iO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICAvLyBpZ25vcmUgMCBsZW5ndGhzXG4gICAgICAgICAgICBpZiAoY2RbaV0pIHtcbiAgICAgICAgICAgICAgICAvLyBudW0gZW5jb2RpbmcgYm90aCBzeW1ib2wgYW5kIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgIHZhciBzdiA9IChpIDw8IDQpIHwgY2RbaV07XG4gICAgICAgICAgICAgICAgLy8gZnJlZSBiaXRzXG4gICAgICAgICAgICAgICAgdmFyIHJfMSA9IG1iIC0gY2RbaV07XG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgdmFsdWVcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGxlW2NkW2ldIC0gMV0rKyA8PCByXzE7XG4gICAgICAgICAgICAgICAgLy8gbSBpcyBlbmQgdmFsdWVcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBtID0gdiB8ICgoMSA8PCByXzEpIC0gMSk7IHYgPD0gbTsgKyt2KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGV2ZXJ5IDE2IGJpdCB2YWx1ZSBzdGFydGluZyB3aXRoIHRoZSBjb2RlIHlpZWxkcyB0aGUgc2FtZSByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgY29bcmV2W3ZdID4+IHJ2Yl0gPSBzdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvID0gbmV3IHUxNihzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHM7ICsraSkge1xuICAgICAgICAgICAgaWYgKGNkW2ldKSB7XG4gICAgICAgICAgICAgICAgY29baV0gPSByZXZbbGVbY2RbaV0gLSAxXSsrXSA+PiAoMTUgLSBjZFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvO1xufSk7XG4vLyBmaXhlZCBsZW5ndGggdHJlZVxudmFyIGZsdCA9IG5ldyB1OCgyODgpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAxNDQ7ICsraSlcbiAgICBmbHRbaV0gPSA4O1xuZm9yICh2YXIgaSA9IDE0NDsgaSA8IDI1NjsgKytpKVxuICAgIGZsdFtpXSA9IDk7XG5mb3IgKHZhciBpID0gMjU2OyBpIDwgMjgwOyArK2kpXG4gICAgZmx0W2ldID0gNztcbmZvciAodmFyIGkgPSAyODA7IGkgPCAyODg7ICsraSlcbiAgICBmbHRbaV0gPSA4O1xuLy8gZml4ZWQgZGlzdGFuY2UgdHJlZVxudmFyIGZkdCA9IG5ldyB1OCgzMik7XG5mb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpXG4gICAgZmR0W2ldID0gNTtcbi8vIGZpeGVkIGxlbmd0aCBtYXBcbnZhciBmbG0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmx0LCA5LCAwKSwgZmxybSA9IC8qI19fUFVSRV9fKi8gaE1hcChmbHQsIDksIDEpO1xuLy8gZml4ZWQgZGlzdGFuY2UgbWFwXG52YXIgZmRtID0gLyojX19QVVJFX18qLyBoTWFwKGZkdCwgNSwgMCksIGZkcm0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmR0LCA1LCAxKTtcbi8vIGZpbmQgbWF4IG9mIGFycmF5XG52YXIgbWF4ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgbSA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChhW2ldID4gbSlcbiAgICAgICAgICAgIG0gPSBhW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn07XG4vLyByZWFkIGQsIHN0YXJ0aW5nIGF0IGJpdCBwIGFuZCBtYXNrIHdpdGggbVxudmFyIGJpdHMgPSBmdW5jdGlvbiAoZCwgcCwgbSkge1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgcmV0dXJuICgoZFtvXSB8IChkW28gKyAxXSA8PCA4KSkgPj4gKHAgJiA3KSkgJiBtO1xufTtcbi8vIHJlYWQgZCwgc3RhcnRpbmcgYXQgYml0IHAgY29udGludWluZyBmb3IgYXQgbGVhc3QgMTYgYml0c1xudmFyIGJpdHMxNiA9IGZ1bmN0aW9uIChkLCBwKSB7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICByZXR1cm4gKChkW29dIHwgKGRbbyArIDFdIDw8IDgpIHwgKGRbbyArIDJdIDw8IDE2KSkgPj4gKHAgJiA3KSk7XG59O1xuLy8gZ2V0IGVuZCBvZiBieXRlXG52YXIgc2hmdCA9IGZ1bmN0aW9uIChwKSB7IHJldHVybiAoKHAgKyA3KSAvIDgpIHwgMDsgfTtcbi8vIHR5cGVkIGFycmF5IHNsaWNlIC0gYWxsb3dzIGdhcmJhZ2UgY29sbGVjdG9yIHRvIGZyZWUgb3JpZ2luYWwgcmVmZXJlbmNlLFxuLy8gd2hpbGUgYmVpbmcgbW9yZSBjb21wYXRpYmxlIHRoYW4gLnNsaWNlXG52YXIgc2xjID0gZnVuY3Rpb24gKHYsIHMsIGUpIHtcbiAgICBpZiAocyA9PSBudWxsIHx8IHMgPCAwKVxuICAgICAgICBzID0gMDtcbiAgICBpZiAoZSA9PSBudWxsIHx8IGUgPiB2Lmxlbmd0aClcbiAgICAgICAgZSA9IHYubGVuZ3RoO1xuICAgIC8vIGNhbid0IHVzZSAuY29uc3RydWN0b3IgaW4gY2FzZSB1c2VyLXN1cHBsaWVkXG4gICAgcmV0dXJuIG5ldyB1OCh2LnN1YmFycmF5KHMsIGUpKTtcbn07XG4vKipcbiAqIENvZGVzIGZvciBlcnJvcnMgZ2VuZXJhdGVkIHdpdGhpbiB0aGlzIGxpYnJhcnlcbiAqL1xuZXhwb3J0IHZhciBGbGF0ZUVycm9yQ29kZSA9IHtcbiAgICBVbmV4cGVjdGVkRU9GOiAwLFxuICAgIEludmFsaWRCbG9ja1R5cGU6IDEsXG4gICAgSW52YWxpZExlbmd0aExpdGVyYWw6IDIsXG4gICAgSW52YWxpZERpc3RhbmNlOiAzLFxuICAgIFN0cmVhbUZpbmlzaGVkOiA0LFxuICAgIE5vU3RyZWFtSGFuZGxlcjogNSxcbiAgICBJbnZhbGlkSGVhZGVyOiA2LFxuICAgIE5vQ2FsbGJhY2s6IDcsXG4gICAgSW52YWxpZFVURjg6IDgsXG4gICAgRXh0cmFGaWVsZFRvb0xvbmc6IDksXG4gICAgSW52YWxpZERhdGU6IDEwLFxuICAgIEZpbGVuYW1lVG9vTG9uZzogMTEsXG4gICAgU3RyZWFtRmluaXNoaW5nOiAxMixcbiAgICBJbnZhbGlkWmlwRGF0YTogMTMsXG4gICAgVW5rbm93bkNvbXByZXNzaW9uTWV0aG9kOiAxNFxufTtcbi8vIGVycm9yIGNvZGVzXG52YXIgZWMgPSBbXG4gICAgJ3VuZXhwZWN0ZWQgRU9GJyxcbiAgICAnaW52YWxpZCBibG9jayB0eXBlJyxcbiAgICAnaW52YWxpZCBsZW5ndGgvbGl0ZXJhbCcsXG4gICAgJ2ludmFsaWQgZGlzdGFuY2UnLFxuICAgICdzdHJlYW0gZmluaXNoZWQnLFxuICAgICdubyBzdHJlYW0gaGFuZGxlcicsXG4gICAgLCAvLyBkZXRlcm1pbmVkIGJ5IGNvbXByZXNzaW9uIGZ1bmN0aW9uXG4gICAgJ25vIGNhbGxiYWNrJyxcbiAgICAnaW52YWxpZCBVVEYtOCBkYXRhJyxcbiAgICAnZXh0cmEgZmllbGQgdG9vIGxvbmcnLFxuICAgICdkYXRlIG5vdCBpbiByYW5nZSAxOTgwLTIwOTknLFxuICAgICdmaWxlbmFtZSB0b28gbG9uZycsXG4gICAgJ3N0cmVhbSBmaW5pc2hpbmcnLFxuICAgICdpbnZhbGlkIHppcCBkYXRhJ1xuICAgIC8vIGRldGVybWluZWQgYnkgdW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Rcbl07XG47XG52YXIgZXJyID0gZnVuY3Rpb24gKGluZCwgbXNnLCBudCkge1xuICAgIHZhciBlID0gbmV3IEVycm9yKG1zZyB8fCBlY1tpbmRdKTtcbiAgICBlLmNvZGUgPSBpbmQ7XG4gICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKVxuICAgICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlLCBlcnIpO1xuICAgIGlmICghbnQpXG4gICAgICAgIHRocm93IGU7XG4gICAgcmV0dXJuIGU7XG59O1xuLy8gZXhwYW5kcyByYXcgREVGTEFURSBkYXRhXG52YXIgaW5mbHQgPSBmdW5jdGlvbiAoZGF0LCBzdCwgYnVmLCBkaWN0KSB7XG4gICAgLy8gc291cmNlIGxlbmd0aCAgICAgICBkaWN0IGxlbmd0aFxuICAgIHZhciBzbCA9IGRhdC5sZW5ndGgsIGRsID0gZGljdCA/IGRpY3QubGVuZ3RoIDogMDtcbiAgICBpZiAoIXNsIHx8IHN0LmYgJiYgIXN0LmwpXG4gICAgICAgIHJldHVybiBidWYgfHwgbmV3IHU4KDApO1xuICAgIHZhciBub0J1ZiA9ICFidWY7XG4gICAgLy8gaGF2ZSB0byBlc3RpbWF0ZSBzaXplXG4gICAgdmFyIHJlc2l6ZSA9IG5vQnVmIHx8IHN0LmkgIT0gMjtcbiAgICAvLyBubyBzdGF0ZVxuICAgIHZhciBub1N0ID0gc3QuaTtcbiAgICAvLyBBc3N1bWVzIHJvdWdobHkgMzMlIGNvbXByZXNzaW9uIHJhdGlvIGF2ZXJhZ2VcbiAgICBpZiAobm9CdWYpXG4gICAgICAgIGJ1ZiA9IG5ldyB1OChzbCAqIDMpO1xuICAgIC8vIGVuc3VyZSBidWZmZXIgY2FuIGZpdCBhdCBsZWFzdCBsIGVsZW1lbnRzXG4gICAgdmFyIGNidWYgPSBmdW5jdGlvbiAobCkge1xuICAgICAgICB2YXIgYmwgPSBidWYubGVuZ3RoO1xuICAgICAgICAvLyBuZWVkIHRvIGluY3JlYXNlIHNpemUgdG8gZml0XG4gICAgICAgIGlmIChsID4gYmwpIHtcbiAgICAgICAgICAgIC8vIERvdWJsZSBvciBzZXQgdG8gbmVjZXNzYXJ5LCB3aGljaGV2ZXIgaXMgZ3JlYXRlclxuICAgICAgICAgICAgdmFyIG5idWYgPSBuZXcgdTgoTWF0aC5tYXgoYmwgKiAyLCBsKSk7XG4gICAgICAgICAgICBuYnVmLnNldChidWYpO1xuICAgICAgICAgICAgYnVmID0gbmJ1ZjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gIGxhc3QgY2h1bmsgICAgICAgICBiaXRwb3MgICAgICAgICAgIGJ5dGVzXG4gICAgdmFyIGZpbmFsID0gc3QuZiB8fCAwLCBwb3MgPSBzdC5wIHx8IDAsIGJ0ID0gc3QuYiB8fCAwLCBsbSA9IHN0LmwsIGRtID0gc3QuZCwgbGJ0ID0gc3QubSwgZGJ0ID0gc3QubjtcbiAgICAvLyB0b3RhbCBiaXRzXG4gICAgdmFyIHRidHMgPSBzbCAqIDg7XG4gICAgZG8ge1xuICAgICAgICBpZiAoIWxtKSB7XG4gICAgICAgICAgICAvLyBCRklOQUwgLSB0aGlzIGlzIG9ubHkgMSB3aGVuIGxhc3QgY2h1bmsgaXMgbmV4dFxuICAgICAgICAgICAgZmluYWwgPSBiaXRzKGRhdCwgcG9zLCAxKTtcbiAgICAgICAgICAgIC8vIHR5cGU6IDAgPSBubyBjb21wcmVzc2lvbiwgMSA9IGZpeGVkIGh1ZmZtYW4sIDIgPSBkeW5hbWljIGh1ZmZtYW5cbiAgICAgICAgICAgIHZhciB0eXBlID0gYml0cyhkYXQsIHBvcyArIDEsIDMpO1xuICAgICAgICAgICAgcG9zICs9IDM7XG4gICAgICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBnbyB0byBlbmQgb2YgYnl0ZSBib3VuZGFyeVxuICAgICAgICAgICAgICAgIHZhciBzID0gc2hmdChwb3MpICsgNCwgbCA9IGRhdFtzIC0gNF0gfCAoZGF0W3MgLSAzXSA8PCA4KSwgdCA9IHMgKyBsO1xuICAgICAgICAgICAgICAgIGlmICh0ID4gc2wpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgc2l6ZVxuICAgICAgICAgICAgICAgIGlmIChyZXNpemUpXG4gICAgICAgICAgICAgICAgICAgIGNidWYoYnQgKyBsKTtcbiAgICAgICAgICAgICAgICAvLyBDb3B5IG92ZXIgdW5jb21wcmVzc2VkIGRhdGFcbiAgICAgICAgICAgICAgICBidWYuc2V0KGRhdC5zdWJhcnJheShzLCB0KSwgYnQpO1xuICAgICAgICAgICAgICAgIC8vIEdldCBuZXcgYml0cG9zLCB1cGRhdGUgYnl0ZSBjb3VudFxuICAgICAgICAgICAgICAgIHN0LmIgPSBidCArPSBsLCBzdC5wID0gcG9zID0gdCAqIDgsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMSlcbiAgICAgICAgICAgICAgICBsbSA9IGZscm0sIGRtID0gZmRybSwgbGJ0ID0gOSwgZGJ0ID0gNTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICBsaXRlcmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aHNcbiAgICAgICAgICAgICAgICB2YXIgaExpdCA9IGJpdHMoZGF0LCBwb3MsIDMxKSArIDI1NywgaGNMZW4gPSBiaXRzKGRhdCwgcG9zICsgMTAsIDE1KSArIDQ7XG4gICAgICAgICAgICAgICAgdmFyIHRsID0gaExpdCArIGJpdHMoZGF0LCBwb3MgKyA1LCAzMSkgKyAxO1xuICAgICAgICAgICAgICAgIHBvcyArPSAxNDtcbiAgICAgICAgICAgICAgICAvLyBsZW5ndGgrZGlzdGFuY2UgdHJlZVxuICAgICAgICAgICAgICAgIHZhciBsZHQgPSBuZXcgdTgodGwpO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgY2x0ID0gbmV3IHU4KDE5KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhjTGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIGluZGV4IG1hcCB0byBnZXQgcmVhbCBjb2RlXG4gICAgICAgICAgICAgICAgICAgIGNsdFtjbGltW2ldXSA9IGJpdHMoZGF0LCBwb3MgKyBpICogMywgNyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBvcyArPSBoY0xlbiAqIDM7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGhzIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgY2xiID0gbWF4KGNsdCksIGNsYm1zayA9ICgxIDw8IGNsYikgLSAxO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RocyBtYXBcbiAgICAgICAgICAgICAgICB2YXIgY2xtID0gaE1hcChjbHQsIGNsYiwgMSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0bDspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjbG1bYml0cyhkYXQsIHBvcywgY2xibXNrKV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gciAmIDE1O1xuICAgICAgICAgICAgICAgICAgICAvLyBzeW1ib2xcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByID4+IDQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRvIGNvcHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMgPCAxNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGR0W2krK10gPSBzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGNvcHkgICBjb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSAwLCBuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzID09IDE2KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAzICsgYml0cyhkYXQsIHBvcywgMyksIHBvcyArPSAyLCBjID0gbGR0W2kgLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMgPT0gMTcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDMgKyBiaXRzKGRhdCwgcG9zLCA3KSwgcG9zICs9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzID09IDE4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAxMSArIGJpdHMoZGF0LCBwb3MsIDEyNyksIHBvcyArPSA3O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG4tLSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZHRbaSsrXSA9IGM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICAgbGVuZ3RoIHRyZWUgICAgICAgICAgICAgICAgIGRpc3RhbmNlIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgbHQgPSBsZHQuc3ViYXJyYXkoMCwgaExpdCksIGR0ID0gbGR0LnN1YmFycmF5KGhMaXQpO1xuICAgICAgICAgICAgICAgIC8vIG1heCBsZW5ndGggYml0c1xuICAgICAgICAgICAgICAgIGxidCA9IG1heChsdCk7XG4gICAgICAgICAgICAgICAgLy8gbWF4IGRpc3QgYml0c1xuICAgICAgICAgICAgICAgIGRidCA9IG1heChkdCk7XG4gICAgICAgICAgICAgICAgbG0gPSBoTWFwKGx0LCBsYnQsIDEpO1xuICAgICAgICAgICAgICAgIGRtID0gaE1hcChkdCwgZGJ0LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlcnIoMSk7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBidWZmZXIgY2FuIGhvbGQgdGhpcyArIHRoZSBsYXJnZXN0IHBvc3NpYmxlIGFkZGl0aW9uXG4gICAgICAgIC8vIE1heGltdW0gY2h1bmsgc2l6ZSAocHJhY3RpY2FsbHksIHRoZW9yZXRpY2FsbHkgaW5maW5pdGUpIGlzIDJeMTdcbiAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgIGNidWYoYnQgKyAxMzEwNzIpO1xuICAgICAgICB2YXIgbG1zID0gKDEgPDwgbGJ0KSAtIDEsIGRtcyA9ICgxIDw8IGRidCkgLSAxO1xuICAgICAgICB2YXIgbHBvcyA9IHBvcztcbiAgICAgICAgZm9yICg7OyBscG9zID0gcG9zKSB7XG4gICAgICAgICAgICAvLyBiaXRzIHJlYWQsIGNvZGVcbiAgICAgICAgICAgIHZhciBjID0gbG1bYml0czE2KGRhdCwgcG9zKSAmIGxtc10sIHN5bSA9IGMgPj4gNDtcbiAgICAgICAgICAgIHBvcyArPSBjICYgMTU7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWMpXG4gICAgICAgICAgICAgICAgZXJyKDIpO1xuICAgICAgICAgICAgaWYgKHN5bSA8IDI1NilcbiAgICAgICAgICAgICAgICBidWZbYnQrK10gPSBzeW07XG4gICAgICAgICAgICBlbHNlIGlmIChzeW0gPT0gMjU2KSB7XG4gICAgICAgICAgICAgICAgbHBvcyA9IHBvcywgbG0gPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGFkZCA9IHN5bSAtIDI1NDtcbiAgICAgICAgICAgICAgICAvLyBubyBleHRyYSBiaXRzIG5lZWRlZCBpZiBsZXNzXG4gICAgICAgICAgICAgICAgaWYgKHN5bSA+IDI2NCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmRleFxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IHN5bSAtIDI1NywgYiA9IGZsZWJbaV07XG4gICAgICAgICAgICAgICAgICAgIGFkZCA9IGJpdHMoZGF0LCBwb3MsICgxIDw8IGIpIC0gMSkgKyBmbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRpc3RcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRtW2JpdHMxNihkYXQsIHBvcykgJiBkbXNdLCBkc3ltID0gZCA+PiA0O1xuICAgICAgICAgICAgICAgIGlmICghZClcbiAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgIHBvcyArPSBkICYgMTU7XG4gICAgICAgICAgICAgICAgdmFyIGR0ID0gZmRbZHN5bV07XG4gICAgICAgICAgICAgICAgaWYgKGRzeW0gPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiID0gZmRlYltkc3ltXTtcbiAgICAgICAgICAgICAgICAgICAgZHQgKz0gYml0czE2KGRhdCwgcG9zKSAmICgxIDw8IGIpIC0gMSwgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIDEzMTA3Mik7XG4gICAgICAgICAgICAgICAgdmFyIGVuZCA9IGJ0ICsgYWRkO1xuICAgICAgICAgICAgICAgIGlmIChidCA8IGR0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGlmdCA9IGRsIC0gZHQsIGRlbmQgPSBNYXRoLm1pbihkdCwgZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoaWZ0ICsgYnQgPCAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgYnQgPCBkZW5kOyArK2J0KVxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGRpY3Rbc2hpZnQgKyBidF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoOyBidCA8IGVuZDsgKytidClcbiAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGJ1ZltidCAtIGR0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdC5sID0gbG0sIHN0LnAgPSBscG9zLCBzdC5iID0gYnQsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgaWYgKGxtKVxuICAgICAgICAgICAgZmluYWwgPSAxLCBzdC5tID0gbGJ0LCBzdC5kID0gZG0sIHN0Lm4gPSBkYnQ7XG4gICAgfSB3aGlsZSAoIWZpbmFsKTtcbiAgICAvLyBkb24ndCByZWFsbG9jYXRlIGZvciBzdHJlYW1zIG9yIHVzZXIgYnVmZmVyc1xuICAgIHJldHVybiBidCAhPSBidWYubGVuZ3RoICYmIG5vQnVmID8gc2xjKGJ1ZiwgMCwgYnQpIDogYnVmLnN1YmFycmF5KDAsIGJ0KTtcbn07XG4vLyBzdGFydGluZyBhdCBwLCB3cml0ZSB0aGUgbWluaW11bSBudW1iZXIgb2YgYml0cyB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzID0gZnVuY3Rpb24gKGQsIHAsIHYpIHtcbiAgICB2IDw8PSBwICYgNztcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIGRbb10gfD0gdjtcbiAgICBkW28gKyAxXSB8PSB2ID4+IDg7XG59O1xuLy8gc3RhcnRpbmcgYXQgcCwgd3JpdGUgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGJpdHMgKD44KSB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzMTYgPSBmdW5jdGlvbiAoZCwgcCwgdikge1xuICAgIHYgPDw9IHAgJiA3O1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgZFtvXSB8PSB2O1xuICAgIGRbbyArIDFdIHw9IHYgPj4gODtcbiAgICBkW28gKyAyXSB8PSB2ID4+IDE2O1xufTtcbi8vIGNyZWF0ZXMgY29kZSBsZW5ndGhzIGZyb20gYSBmcmVxdWVuY3kgdGFibGVcbnZhciBoVHJlZSA9IGZ1bmN0aW9uIChkLCBtYikge1xuICAgIC8vIE5lZWQgZXh0cmEgaW5mbyB0byBtYWtlIGEgdHJlZVxuICAgIHZhciB0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChkW2ldKVxuICAgICAgICAgICAgdC5wdXNoKHsgczogaSwgZjogZFtpXSB9KTtcbiAgICB9XG4gICAgdmFyIHMgPSB0Lmxlbmd0aDtcbiAgICB2YXIgdDIgPSB0LnNsaWNlKCk7XG4gICAgaWYgKCFzKVxuICAgICAgICByZXR1cm4geyB0OiBldCwgbDogMCB9O1xuICAgIGlmIChzID09IDEpIHtcbiAgICAgICAgdmFyIHYgPSBuZXcgdTgodFswXS5zICsgMSk7XG4gICAgICAgIHZbdFswXS5zXSA9IDE7XG4gICAgICAgIHJldHVybiB7IHQ6IHYsIGw6IDEgfTtcbiAgICB9XG4gICAgdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmYgLSBiLmY7IH0pO1xuICAgIC8vIGFmdGVyIGkyIHJlYWNoZXMgbGFzdCBpbmQsIHdpbGwgYmUgc3RvcHBlZFxuICAgIC8vIGZyZXEgbXVzdCBiZSBncmVhdGVyIHRoYW4gbGFyZ2VzdCBwb3NzaWJsZSBudW1iZXIgb2Ygc3ltYm9sc1xuICAgIHQucHVzaCh7IHM6IC0xLCBmOiAyNTAwMSB9KTtcbiAgICB2YXIgbCA9IHRbMF0sIHIgPSB0WzFdLCBpMCA9IDAsIGkxID0gMSwgaTIgPSAyO1xuICAgIHRbMF0gPSB7IHM6IC0xLCBmOiBsLmYgKyByLmYsIGw6IGwsIHI6IHIgfTtcbiAgICAvLyBlZmZpY2llbnQgYWxnb3JpdGhtIGZyb20gVVpJUC5qc1xuICAgIC8vIGkwIGlzIGxvb2tiZWhpbmQsIGkyIGlzIGxvb2thaGVhZCAtIGFmdGVyIHByb2Nlc3NpbmcgdHdvIGxvdy1mcmVxXG4gICAgLy8gc3ltYm9scyB0aGF0IGNvbWJpbmVkIGhhdmUgaGlnaCBmcmVxLCB3aWxsIHN0YXJ0IHByb2Nlc3NpbmcgaTIgKGhpZ2gtZnJlcSxcbiAgICAvLyBub24tY29tcG9zaXRlKSBzeW1ib2xzIGluc3RlYWRcbiAgICAvLyBzZWUgaHR0cHM6Ly9yZWRkaXQuY29tL3IvcGhvdG9wZWEvY29tbWVudHMvaWtla2h0L3V6aXBqc19xdWVzdGlvbnMvXG4gICAgd2hpbGUgKGkxICE9IHMgLSAxKSB7XG4gICAgICAgIGwgPSB0W3RbaTBdLmYgPCB0W2kyXS5mID8gaTArKyA6IGkyKytdO1xuICAgICAgICByID0gdFtpMCAhPSBpMSAmJiB0W2kwXS5mIDwgdFtpMl0uZiA/IGkwKysgOiBpMisrXTtcbiAgICAgICAgdFtpMSsrXSA9IHsgczogLTEsIGY6IGwuZiArIHIuZiwgbDogbCwgcjogciB9O1xuICAgIH1cbiAgICB2YXIgbWF4U3ltID0gdDJbMF0ucztcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAodDJbaV0ucyA+IG1heFN5bSlcbiAgICAgICAgICAgIG1heFN5bSA9IHQyW2ldLnM7XG4gICAgfVxuICAgIC8vIGNvZGUgbGVuZ3Roc1xuICAgIHZhciB0ciA9IG5ldyB1MTYobWF4U3ltICsgMSk7XG4gICAgLy8gbWF4IGJpdHMgaW4gdHJlZVxuICAgIHZhciBtYnQgPSBsbih0W2kxIC0gMV0sIHRyLCAwKTtcbiAgICBpZiAobWJ0ID4gbWIpIHtcbiAgICAgICAgLy8gbW9yZSBhbGdvcml0aG1zIGZyb20gVVpJUC5qc1xuICAgICAgICAvLyBUT0RPOiBmaW5kIG91dCBob3cgdGhpcyBjb2RlIHdvcmtzIChkZWJ0KVxuICAgICAgICAvLyAgaW5kICAgIGRlYnRcbiAgICAgICAgdmFyIGkgPSAwLCBkdCA9IDA7XG4gICAgICAgIC8vICAgIGxlZnQgICAgICAgICAgICBjb3N0XG4gICAgICAgIHZhciBsZnQgPSBtYnQgLSBtYiwgY3N0ID0gMSA8PCBsZnQ7XG4gICAgICAgIHQyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIHRyW2Iuc10gLSB0clthLnNdIHx8IGEuZiAtIGIuZjsgfSk7XG4gICAgICAgIGZvciAoOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICB2YXIgaTJfMSA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfMV0gPiBtYikge1xuICAgICAgICAgICAgICAgIGR0ICs9IGNzdCAtICgxIDw8IChtYnQgLSB0cltpMl8xXSkpO1xuICAgICAgICAgICAgICAgIHRyW2kyXzFdID0gbWI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZHQgPj49IGxmdDtcbiAgICAgICAgd2hpbGUgKGR0ID4gMCkge1xuICAgICAgICAgICAgdmFyIGkyXzIgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzJdIDwgbWIpXG4gICAgICAgICAgICAgICAgZHQgLT0gMSA8PCAobWIgLSB0cltpMl8yXSsrIC0gMSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgKytpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoOyBpID49IDAgJiYgZHQ7IC0taSkge1xuICAgICAgICAgICAgdmFyIGkyXzMgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzNdID09IG1iKSB7XG4gICAgICAgICAgICAgICAgLS10cltpMl8zXTtcbiAgICAgICAgICAgICAgICArK2R0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1idCA9IG1iO1xuICAgIH1cbiAgICByZXR1cm4geyB0OiBuZXcgdTgodHIpLCBsOiBtYnQgfTtcbn07XG4vLyBnZXQgdGhlIG1heCBsZW5ndGggYW5kIGFzc2lnbiBsZW5ndGggY29kZXNcbnZhciBsbiA9IGZ1bmN0aW9uIChuLCBsLCBkKSB7XG4gICAgcmV0dXJuIG4ucyA9PSAtMVxuICAgICAgICA/IE1hdGgubWF4KGxuKG4ubCwgbCwgZCArIDEpLCBsbihuLnIsIGwsIGQgKyAxKSlcbiAgICAgICAgOiAobFtuLnNdID0gZCk7XG59O1xuLy8gbGVuZ3RoIGNvZGVzIGdlbmVyYXRpb25cbnZhciBsYyA9IGZ1bmN0aW9uIChjKSB7XG4gICAgdmFyIHMgPSBjLmxlbmd0aDtcbiAgICAvLyBOb3RlIHRoYXQgdGhlIHNlbWljb2xvbiB3YXMgaW50ZW50aW9uYWxcbiAgICB3aGlsZSAocyAmJiAhY1stLXNdKVxuICAgICAgICA7XG4gICAgdmFyIGNsID0gbmV3IHUxNigrK3MpO1xuICAgIC8vICBpbmQgICAgICBudW0gICAgICAgICBzdHJlYWtcbiAgICB2YXIgY2xpID0gMCwgY2xuID0gY1swXSwgY2xzID0gMTtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICh2KSB7IGNsW2NsaSsrXSA9IHY7IH07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gczsgKytpKSB7XG4gICAgICAgIGlmIChjW2ldID09IGNsbiAmJiBpICE9IHMpXG4gICAgICAgICAgICArK2NscztcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWNsbiAmJiBjbHMgPiAyKSB7XG4gICAgICAgICAgICAgICAgZm9yICg7IGNscyA+IDEzODsgY2xzIC09IDEzOClcbiAgICAgICAgICAgICAgICAgICAgdygzMjc1NCk7XG4gICAgICAgICAgICAgICAgaWYgKGNscyA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdyhjbHMgPiAxMCA/ICgoY2xzIC0gMTEpIDw8IDUpIHwgMjg2OTAgOiAoKGNscyAtIDMpIDw8IDUpIHwgMTIzMDUpO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNscyA+IDMpIHtcbiAgICAgICAgICAgICAgICB3KGNsbiksIC0tY2xzO1xuICAgICAgICAgICAgICAgIGZvciAoOyBjbHMgPiA2OyBjbHMgLT0gNilcbiAgICAgICAgICAgICAgICAgICAgdyg4MzA0KTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzID4gMilcbiAgICAgICAgICAgICAgICAgICAgdygoKGNscyAtIDMpIDw8IDUpIHwgODIwOCksIGNscyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY2xzLS0pXG4gICAgICAgICAgICAgICAgdyhjbG4pO1xuICAgICAgICAgICAgY2xzID0gMTtcbiAgICAgICAgICAgIGNsbiA9IGNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYzogY2wuc3ViYXJyYXkoMCwgY2xpKSwgbjogcyB9O1xufTtcbi8vIGNhbGN1bGF0ZSB0aGUgbGVuZ3RoIG9mIG91dHB1dCBmcm9tIHRyZWUsIGNvZGUgbGVuZ3Roc1xudmFyIGNsZW4gPSBmdW5jdGlvbiAoY2YsIGNsKSB7XG4gICAgdmFyIGwgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2wubGVuZ3RoOyArK2kpXG4gICAgICAgIGwgKz0gY2ZbaV0gKiBjbFtpXTtcbiAgICByZXR1cm4gbDtcbn07XG4vLyB3cml0ZXMgYSBmaXhlZCBibG9ja1xuLy8gcmV0dXJucyB0aGUgbmV3IGJpdCBwb3NcbnZhciB3ZmJsayA9IGZ1bmN0aW9uIChvdXQsIHBvcywgZGF0KSB7XG4gICAgLy8gbm8gbmVlZCB0byB3cml0ZSAwMCBhcyB0eXBlOiBUeXBlZEFycmF5IGRlZmF1bHRzIHRvIDBcbiAgICB2YXIgcyA9IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBzaGZ0KHBvcyArIDIpO1xuICAgIG91dFtvXSA9IHMgJiAyNTU7XG4gICAgb3V0W28gKyAxXSA9IHMgPj4gODtcbiAgICBvdXRbbyArIDJdID0gb3V0W29dIF4gMjU1O1xuICAgIG91dFtvICsgM10gPSBvdXRbbyArIDFdIF4gMjU1O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgKytpKVxuICAgICAgICBvdXRbbyArIGkgKyA0XSA9IGRhdFtpXTtcbiAgICByZXR1cm4gKG8gKyA0ICsgcykgKiA4O1xufTtcbi8vIHdyaXRlcyBhIGJsb2NrXG52YXIgd2JsayA9IGZ1bmN0aW9uIChkYXQsIG91dCwgZmluYWwsIHN5bXMsIGxmLCBkZiwgZWIsIGxpLCBicywgYmwsIHApIHtcbiAgICB3Yml0cyhvdXQsIHArKywgZmluYWwpO1xuICAgICsrbGZbMjU2XTtcbiAgICB2YXIgX2EgPSBoVHJlZShsZiwgMTUpLCBkbHQgPSBfYS50LCBtbGIgPSBfYS5sO1xuICAgIHZhciBfYiA9IGhUcmVlKGRmLCAxNSksIGRkdCA9IF9iLnQsIG1kYiA9IF9iLmw7XG4gICAgdmFyIF9jID0gbGMoZGx0KSwgbGNsdCA9IF9jLmMsIG5sYyA9IF9jLm47XG4gICAgdmFyIF9kID0gbGMoZGR0KSwgbGNkdCA9IF9kLmMsIG5kYyA9IF9kLm47XG4gICAgdmFyIGxjZnJlcSA9IG5ldyB1MTYoMTkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGNsdC5sZW5ndGg7ICsraSlcbiAgICAgICAgKytsY2ZyZXFbbGNsdFtpXSAmIDMxXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxjZHQubGVuZ3RoOyArK2kpXG4gICAgICAgICsrbGNmcmVxW2xjZHRbaV0gJiAzMV07XG4gICAgdmFyIF9lID0gaFRyZWUobGNmcmVxLCA3KSwgbGN0ID0gX2UudCwgbWxjYiA9IF9lLmw7XG4gICAgdmFyIG5sY2MgPSAxOTtcbiAgICBmb3IgKDsgbmxjYyA+IDQgJiYgIWxjdFtjbGltW25sY2MgLSAxXV07IC0tbmxjYylcbiAgICAgICAgO1xuICAgIHZhciBmbGVuID0gKGJsICsgNSkgPDwgMztcbiAgICB2YXIgZnRsZW4gPSBjbGVuKGxmLCBmbHQpICsgY2xlbihkZiwgZmR0KSArIGViO1xuICAgIHZhciBkdGxlbiA9IGNsZW4obGYsIGRsdCkgKyBjbGVuKGRmLCBkZHQpICsgZWIgKyAxNCArIDMgKiBubGNjICsgY2xlbihsY2ZyZXEsIGxjdCkgKyAyICogbGNmcmVxWzE2XSArIDMgKiBsY2ZyZXFbMTddICsgNyAqIGxjZnJlcVsxOF07XG4gICAgaWYgKGJzID49IDAgJiYgZmxlbiA8PSBmdGxlbiAmJiBmbGVuIDw9IGR0bGVuKVxuICAgICAgICByZXR1cm4gd2ZibGsob3V0LCBwLCBkYXQuc3ViYXJyYXkoYnMsIGJzICsgYmwpKTtcbiAgICB2YXIgbG0sIGxsLCBkbSwgZGw7XG4gICAgd2JpdHMob3V0LCBwLCAxICsgKGR0bGVuIDwgZnRsZW4pKSwgcCArPSAyO1xuICAgIGlmIChkdGxlbiA8IGZ0bGVuKSB7XG4gICAgICAgIGxtID0gaE1hcChkbHQsIG1sYiwgMCksIGxsID0gZGx0LCBkbSA9IGhNYXAoZGR0LCBtZGIsIDApLCBkbCA9IGRkdDtcbiAgICAgICAgdmFyIGxsbSA9IGhNYXAobGN0LCBtbGNiLCAwKTtcbiAgICAgICAgd2JpdHMob3V0LCBwLCBubGMgLSAyNTcpO1xuICAgICAgICB3Yml0cyhvdXQsIHAgKyA1LCBuZGMgLSAxKTtcbiAgICAgICAgd2JpdHMob3V0LCBwICsgMTAsIG5sY2MgLSA0KTtcbiAgICAgICAgcCArPSAxNDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBubGNjOyArK2kpXG4gICAgICAgICAgICB3Yml0cyhvdXQsIHAgKyAzICogaSwgbGN0W2NsaW1baV1dKTtcbiAgICAgICAgcCArPSAzICogbmxjYztcbiAgICAgICAgdmFyIGxjdHMgPSBbbGNsdCwgbGNkdF07XG4gICAgICAgIGZvciAodmFyIGl0ID0gMDsgaXQgPCAyOyArK2l0KSB7XG4gICAgICAgICAgICB2YXIgY2xjdCA9IGxjdHNbaXRdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IGNsY3RbaV0gJiAzMTtcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIGxsbVtsZW5dKSwgcCArPSBsY3RbbGVuXTtcbiAgICAgICAgICAgICAgICBpZiAobGVuID4gMTUpXG4gICAgICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgKGNsY3RbaV0gPj4gNSkgJiAxMjcpLCBwICs9IGNsY3RbaV0gPj4gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxtID0gZmxtLCBsbCA9IGZsdCwgZG0gPSBmZG0sIGRsID0gZmR0O1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpOyArK2kpIHtcbiAgICAgICAgdmFyIHN5bSA9IHN5bXNbaV07XG4gICAgICAgIGlmIChzeW0gPiAyNTUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSAoc3ltID4+IDE4KSAmIDMxO1xuICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIGxtW2xlbiArIDI1N10pLCBwICs9IGxsW2xlbiArIDI1N107XG4gICAgICAgICAgICBpZiAobGVuID4gNylcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIChzeW0gPj4gMjMpICYgMzEpLCBwICs9IGZsZWJbbGVuXTtcbiAgICAgICAgICAgIHZhciBkc3QgPSBzeW0gJiAzMTtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBkbVtkc3RdKSwgcCArPSBkbFtkc3RdO1xuICAgICAgICAgICAgaWYgKGRzdCA+IDMpXG4gICAgICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIChzeW0gPj4gNSkgJiA4MTkxKSwgcCArPSBmZGViW2RzdF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgbG1bc3ltXSksIHAgKz0gbGxbc3ltXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3Yml0czE2KG91dCwgcCwgbG1bMjU2XSk7XG4gICAgcmV0dXJuIHAgKyBsbFsyNTZdO1xufTtcbi8vIGRlZmxhdGUgb3B0aW9ucyAobmljZSA8PCAxMykgfCBjaGFpblxudmFyIGRlbyA9IC8qI19fUFVSRV9fKi8gbmV3IGkzMihbNjU1NDAsIDEzMTA4MCwgMTMxMDg4LCAxMzExMDQsIDI2MjE3NiwgMTA0ODcwNCwgMTA0ODgzMiwgMjExNDU2MCwgMjExNzYzMl0pO1xuLy8gZW1wdHlcbnZhciBldCA9IC8qI19fUFVSRV9fKi8gbmV3IHU4KDApO1xuLy8gY29tcHJlc3NlcyBkYXRhIGludG8gYSByYXcgREVGTEFURSBidWZmZXJcbnZhciBkZmx0ID0gZnVuY3Rpb24gKGRhdCwgbHZsLCBwbHZsLCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgdmFyIHMgPSBzdC56IHx8IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBuZXcgdTgocHJlICsgcyArIDUgKiAoMSArIE1hdGguY2VpbChzIC8gNzAwMCkpICsgcG9zdCk7XG4gICAgLy8gd3JpdGluZyB0byB0aGlzIHdyaXRlcyB0byB0aGUgb3V0cHV0IGJ1ZmZlclxuICAgIHZhciB3ID0gby5zdWJhcnJheShwcmUsIG8ubGVuZ3RoIC0gcG9zdCk7XG4gICAgdmFyIGxzdCA9IHN0Lmw7XG4gICAgdmFyIHBvcyA9IChzdC5yIHx8IDApICYgNztcbiAgICBpZiAobHZsKSB7XG4gICAgICAgIGlmIChwb3MpXG4gICAgICAgICAgICB3WzBdID0gc3QuciA+PiAzO1xuICAgICAgICB2YXIgb3B0ID0gZGVvW2x2bCAtIDFdO1xuICAgICAgICB2YXIgbiA9IG9wdCA+PiAxMywgYyA9IG9wdCAmIDgxOTE7XG4gICAgICAgIHZhciBtc2tfMSA9ICgxIDw8IHBsdmwpIC0gMTtcbiAgICAgICAgLy8gICAgcHJldiAyLWJ5dGUgdmFsIG1hcCAgICBjdXJyIDItYnl0ZSB2YWwgbWFwXG4gICAgICAgIHZhciBwcmV2ID0gc3QucCB8fCBuZXcgdTE2KDMyNzY4KSwgaGVhZCA9IHN0LmggfHwgbmV3IHUxNihtc2tfMSArIDEpO1xuICAgICAgICB2YXIgYnMxXzEgPSBNYXRoLmNlaWwocGx2bCAvIDMpLCBiczJfMSA9IDIgKiBiczFfMTtcbiAgICAgICAgdmFyIGhzaCA9IGZ1bmN0aW9uIChpKSB7IHJldHVybiAoZGF0W2ldIF4gKGRhdFtpICsgMV0gPDwgYnMxXzEpIF4gKGRhdFtpICsgMl0gPDwgYnMyXzEpKSAmIG1za18xOyB9O1xuICAgICAgICAvLyAyNDU3NiBpcyBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIG1heGltdW0gc3ltYm9scyBwZXIgYmxvY2tcbiAgICAgICAgLy8gNDI0IGJ1ZmZlciBmb3IgbGFzdCBibG9ja1xuICAgICAgICB2YXIgc3ltcyA9IG5ldyBpMzIoMjUwMDApO1xuICAgICAgICAvLyBsZW5ndGgvbGl0ZXJhbCBmcmVxICAgZGlzdGFuY2UgZnJlcVxuICAgICAgICB2YXIgbGYgPSBuZXcgdTE2KDI4OCksIGRmID0gbmV3IHUxNigzMik7XG4gICAgICAgIC8vICBsL2xjbnQgIGV4Yml0cyAgaW5kZXggICAgICAgICAgbC9saW5kICB3YWl0ZHggICAgICAgICAgYmxrcG9zXG4gICAgICAgIHZhciBsY18xID0gMCwgZWIgPSAwLCBpID0gc3QuaSB8fCAwLCBsaSA9IDAsIHdpID0gc3QudyB8fCAwLCBicyA9IDA7XG4gICAgICAgIGZvciAoOyBpICsgMiA8IHM7ICsraSkge1xuICAgICAgICAgICAgLy8gaGFzaCB2YWx1ZVxuICAgICAgICAgICAgdmFyIGh2ID0gaHNoKGkpO1xuICAgICAgICAgICAgLy8gaW5kZXggbW9kIDMyNzY4ICAgIHByZXZpb3VzIGluZGV4IG1vZFxuICAgICAgICAgICAgdmFyIGltb2QgPSBpICYgMzI3NjcsIHBpbW9kID0gaGVhZFtodl07XG4gICAgICAgICAgICBwcmV2W2ltb2RdID0gcGltb2Q7XG4gICAgICAgICAgICBoZWFkW2h2XSA9IGltb2Q7XG4gICAgICAgICAgICAvLyBXZSBhbHdheXMgc2hvdWxkIG1vZGlmeSBoZWFkIGFuZCBwcmV2LCBidXQgb25seSBhZGQgc3ltYm9scyBpZlxuICAgICAgICAgICAgLy8gdGhpcyBkYXRhIGlzIG5vdCB5ZXQgcHJvY2Vzc2VkIChcIndhaXRcIiBmb3Igd2FpdCBpbmRleClcbiAgICAgICAgICAgIGlmICh3aSA8PSBpKSB7XG4gICAgICAgICAgICAgICAgLy8gYnl0ZXMgcmVtYWluaW5nXG4gICAgICAgICAgICAgICAgdmFyIHJlbSA9IHMgLSBpO1xuICAgICAgICAgICAgICAgIGlmICgobGNfMSA+IDcwMDAgfHwgbGkgPiAyNDU3NikgJiYgKHJlbSA+IDQyMyB8fCAhbHN0KSkge1xuICAgICAgICAgICAgICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgMCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGxpID0gbGNfMSA9IGViID0gMCwgYnMgPSBpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI4NjsgKytqKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGZbal0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDMwOyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBkZltqXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICBsZW4gICAgZGlzdCAgIGNoYWluXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAyLCBkID0gMCwgY2hfMSA9IGMsIGRpZiA9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgIGlmIChyZW0gPiAyICYmIGh2ID09IGhzaChpIC0gZGlmKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4biA9IE1hdGgubWluKG4sIHJlbSkgLSAxO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4ZCA9IE1hdGgubWluKDMyNzY3LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF4IHBvc3NpYmxlIGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyBub3QgY2FwcGVkIGF0IGRpZiBiZWNhdXNlIGRlY29tcHJlc3NvcnMgaW1wbGVtZW50IFwicm9sbGluZ1wiIGluZGV4IHBvcHVsYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1sID0gTWF0aC5taW4oMjU4LCByZW0pO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZGlmIDw9IG1heGQgJiYgLS1jaF8xICYmIGltb2QgIT0gcGltb2QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRbaSArIGxdID09IGRhdFtpICsgbCAtIGRpZl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmwgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyBubCA8IG1sICYmIGRhdFtpICsgbmxdID09IGRhdFtpICsgbmwgLSBkaWZdOyArK25sKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsID0gbmwsIGQgPSBkaWY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrIG91dCBlYXJseSB3aGVuIHdlIHJlYWNoIFwibmljZVwiICh3ZSBhcmUgc2F0aXNmaWVkIGVub3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbWF4bilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3csIGZpbmQgdGhlIHJhcmVzdCAyLWJ5dGUgc2VxdWVuY2Ugd2l0aGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGVuZ3RoIG9mIGxpdGVyYWxzIGFuZCBzZWFyY2ggZm9yIHRoYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTXVjaCBmYXN0ZXIgdGhhbiBqdXN0IHVzaW5nIHRoZSBzdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW1kID0gTWF0aC5taW4oZGlmLCBubCAtIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1tZDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGkgPSBpIC0gZGlmICsgaiAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB0aSA9IHByZXZbdGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNkID0gdGkgLSBwdGkgJiAzMjc2NztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZCA+IG1kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1kID0gY2QsIHBpbW9kID0gdGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0aGUgcHJldmlvdXMgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGltb2QgPSBwaW1vZCwgcGltb2QgPSBwcmV2W2ltb2RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlmICs9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGQgd2lsbCBiZSBub256ZXJvIG9ubHkgd2hlbiBhIG1hdGNoIHdhcyBmb3VuZFxuICAgICAgICAgICAgICAgIGlmIChkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIGJvdGggZGlzdCBhbmQgbGVuIGRhdGEgaW4gb25lIGludDMyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIHJlY29nbml6ZWQgYXMgYSBsZW4vZGlzdCB3aXRoIDI4dGggYml0ICgyXjI4KVxuICAgICAgICAgICAgICAgICAgICBzeW1zW2xpKytdID0gMjY4NDM1NDU2IHwgKHJldmZsW2xdIDw8IDE4KSB8IHJldmZkW2RdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGluID0gcmV2ZmxbbF0gJiAzMSwgZGluID0gcmV2ZmRbZF0gJiAzMTtcbiAgICAgICAgICAgICAgICAgICAgZWIgKz0gZmxlYltsaW5dICsgZmRlYltkaW5dO1xuICAgICAgICAgICAgICAgICAgICArK2xmWzI1NyArIGxpbl07XG4gICAgICAgICAgICAgICAgICAgICsrZGZbZGluXTtcbiAgICAgICAgICAgICAgICAgICAgd2kgPSBpICsgbDtcbiAgICAgICAgICAgICAgICAgICAgKytsY18xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3ltc1tsaSsrXSA9IGRhdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgKytsZltkYXRbaV1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSBNYXRoLm1heChpLCB3aSk7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIHN5bXNbbGkrK10gPSBkYXRbaV07XG4gICAgICAgICAgICArK2xmW2RhdFtpXV07XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gd2JsayhkYXQsIHcsIGxzdCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgIGlmICghbHN0KSB7XG4gICAgICAgICAgICBzdC5yID0gKHBvcyAmIDcpIHwgd1socG9zIC8gOCkgfCAwXSA8PCAzO1xuICAgICAgICAgICAgLy8gc2hmdChwb3MpIG5vdyAxIGxlc3MgaWYgcG9zICYgNyAhPSAwXG4gICAgICAgICAgICBwb3MgLT0gNztcbiAgICAgICAgICAgIHN0LmggPSBoZWFkLCBzdC5wID0gcHJldiwgc3QuaSA9IGksIHN0LncgPSB3aTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0LncgfHwgMDsgaSA8IHMgKyBsc3Q7IGkgKz0gNjU1MzUpIHtcbiAgICAgICAgICAgIC8vIGVuZFxuICAgICAgICAgICAgdmFyIGUgPSBpICsgNjU1MzU7XG4gICAgICAgICAgICBpZiAoZSA+PSBzKSB7XG4gICAgICAgICAgICAgICAgLy8gd3JpdGUgZmluYWwgYmxvY2tcbiAgICAgICAgICAgICAgICB3Wyhwb3MgLyA4KSB8IDBdID0gbHN0O1xuICAgICAgICAgICAgICAgIGUgPSBzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zID0gd2ZibGsodywgcG9zICsgMSwgZGF0LnN1YmFycmF5KGksIGUpKTtcbiAgICAgICAgfVxuICAgICAgICBzdC5pID0gcztcbiAgICB9XG4gICAgcmV0dXJuIHNsYyhvLCAwLCBwcmUgKyBzaGZ0KHBvcykgKyBwb3N0KTtcbn07XG4vLyBDUkMzMiB0YWJsZVxudmFyIGNyY3QgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSBuZXcgSW50MzJBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICAgICAgdmFyIGMgPSBpLCBrID0gOTtcbiAgICAgICAgd2hpbGUgKC0taylcbiAgICAgICAgICAgIGMgPSAoKGMgJiAxKSAmJiAtMzA2Njc0OTEyKSBeIChjID4+PiAxKTtcbiAgICAgICAgdFtpXSA9IGM7XG4gICAgfVxuICAgIHJldHVybiB0O1xufSkoKTtcbi8vIENSQzMyXG52YXIgY3JjID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjID0gLTE7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIC8vIGNsb3N1cmVzIGhhdmUgYXdmdWwgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIHZhciBjciA9IGM7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGQubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY3IgPSBjcmN0WyhjciAmIDI1NSkgXiBkW2ldXSBeIChjciA+Pj4gOCk7XG4gICAgICAgICAgICBjID0gY3I7XG4gICAgICAgIH0sXG4gICAgICAgIGQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIH5jOyB9XG4gICAgfTtcbn07XG4vLyBBZGxlcjMyXG52YXIgYWRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGEgPSAxLCBiID0gMDtcbiAgICByZXR1cm4ge1xuICAgICAgICBwOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgLy8gY2xvc3VyZXMgaGF2ZSBhd2Z1bCBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgdmFyIG4gPSBhLCBtID0gYjtcbiAgICAgICAgICAgIHZhciBsID0gZC5sZW5ndGggfCAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgIT0gbDspIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IE1hdGgubWluKGkgKyAyNjU1LCBsKTtcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IGU7ICsraSlcbiAgICAgICAgICAgICAgICAgICAgbSArPSBuICs9IGRbaV07XG4gICAgICAgICAgICAgICAgbiA9IChuICYgNjU1MzUpICsgMTUgKiAobiA+PiAxNiksIG0gPSAobSAmIDY1NTM1KSArIDE1ICogKG0gPj4gMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IG4sIGIgPSBtO1xuICAgICAgICB9LFxuICAgICAgICBkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhICU9IDY1NTIxLCBiICU9IDY1NTIxO1xuICAgICAgICAgICAgcmV0dXJuIChhICYgMjU1KSA8PCAyNCB8IChhICYgMHhGRjAwKSA8PCA4IHwgKGIgJiAyNTUpIDw8IDggfCAoYiA+PiA4KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuO1xuLy8gZGVmbGF0ZSB3aXRoIG9wdHNcbnZhciBkb3B0ID0gZnVuY3Rpb24gKGRhdCwgb3B0LCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgaWYgKCFzdCkge1xuICAgICAgICBzdCA9IHsgbDogMSB9O1xuICAgICAgICBpZiAob3B0LmRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciBkaWN0ID0gb3B0LmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgICAgIHZhciBuZXdEYXQgPSBuZXcgdTgoZGljdC5sZW5ndGggKyBkYXQubGVuZ3RoKTtcbiAgICAgICAgICAgIG5ld0RhdC5zZXQoZGljdCk7XG4gICAgICAgICAgICBuZXdEYXQuc2V0KGRhdCwgZGljdC5sZW5ndGgpO1xuICAgICAgICAgICAgZGF0ID0gbmV3RGF0O1xuICAgICAgICAgICAgc3QudyA9IGRpY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZmx0KGRhdCwgb3B0LmxldmVsID09IG51bGwgPyA2IDogb3B0LmxldmVsLCBvcHQubWVtID09IG51bGwgPyAoc3QubCA/IE1hdGguY2VpbChNYXRoLm1heCg4LCBNYXRoLm1pbigxMywgTWF0aC5sb2coZGF0Lmxlbmd0aCkpKSAqIDEuNSkgOiAyMCkgOiAoMTIgKyBvcHQubWVtKSwgcHJlLCBwb3N0LCBzdCk7XG59O1xuLy8gV2FsbWFydCBvYmplY3Qgc3ByZWFkXG52YXIgbXJnID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIGZvciAodmFyIGsgaW4gYSlcbiAgICAgICAgb1trXSA9IGFba107XG4gICAgZm9yICh2YXIgayBpbiBiKVxuICAgICAgICBvW2tdID0gYltrXTtcbiAgICByZXR1cm4gbztcbn07XG4vLyB3b3JrZXIgY2xvbmVcbi8vIFRoaXMgaXMgcG9zc2libHkgdGhlIGNyYXppZXN0IHBhcnQgb2YgdGhlIGVudGlyZSBjb2RlYmFzZSwgZGVzcGl0ZSBob3cgc2ltcGxlIGl0IG1heSBzZWVtLlxuLy8gVGhlIG9ubHkgcGFyYW1ldGVyIHRvIHRoaXMgZnVuY3Rpb24gaXMgYSBjbG9zdXJlIHRoYXQgcmV0dXJucyBhbiBhcnJheSBvZiB2YXJpYWJsZXMgb3V0c2lkZSBvZiB0aGUgZnVuY3Rpb24gc2NvcGUuXG4vLyBXZSdyZSBnb2luZyB0byB0cnkgdG8gZmlndXJlIG91dCB0aGUgdmFyaWFibGUgbmFtZXMgdXNlZCBpbiB0aGUgY2xvc3VyZSBhcyBzdHJpbmdzIGJlY2F1c2UgdGhhdCBpcyBjcnVjaWFsIGZvciB3b3JrZXJpemF0aW9uLlxuLy8gV2Ugd2lsbCByZXR1cm4gYW4gb2JqZWN0IG1hcHBpbmcgb2YgdHJ1ZSB2YXJpYWJsZSBuYW1lIHRvIHZhbHVlIChiYXNpY2FsbHksIHRoZSBjdXJyZW50IHNjb3BlIGFzIGEgSlMgb2JqZWN0KS5cbi8vIFRoZSByZWFzb24gd2UgY2FuJ3QganVzdCB1c2UgdGhlIG9yaWdpbmFsIHZhcmlhYmxlIG5hbWVzIGlzIG1pbmlmaWVycyBtYW5nbGluZyB0aGUgdG9wbGV2ZWwgc2NvcGUuXG4vLyBUaGlzIHRvb2sgbWUgdGhyZWUgd2Vla3MgdG8gZmlndXJlIG91dCBob3cgdG8gZG8uXG52YXIgd2NsbiA9IGZ1bmN0aW9uIChmbiwgZm5TdHIsIHRkKSB7XG4gICAgdmFyIGR0ID0gZm4oKTtcbiAgICB2YXIgc3QgPSBmbi50b1N0cmluZygpO1xuICAgIHZhciBrcyA9IHN0LnNsaWNlKHN0LmluZGV4T2YoJ1snKSArIDEsIHN0Lmxhc3RJbmRleE9mKCddJykpLnJlcGxhY2UoL1xccysvZywgJycpLnNwbGl0KCcsJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgdiA9IGR0W2ldLCBrID0ga3NbaV07XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBmblN0ciArPSAnOycgKyBrICsgJz0nO1xuICAgICAgICAgICAgdmFyIHN0XzEgPSB2LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAodi5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgZ2xvYmFsIG9iamVjdHNcbiAgICAgICAgICAgICAgICBpZiAoc3RfMS5pbmRleE9mKCdbbmF0aXZlIGNvZGVdJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwSW5kID0gc3RfMS5pbmRleE9mKCcgJywgOCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICBmblN0ciArPSBzdF8xLnNsaWNlKHNwSW5kLCBzdF8xLmluZGV4T2YoJygnLCBzcEluZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm5TdHIgKz0gc3RfMTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgdCBpbiB2LnByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuU3RyICs9ICc7JyArIGsgKyAnLnByb3RvdHlwZS4nICsgdCArICc9JyArIHYucHJvdG90eXBlW3RdLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZuU3RyICs9IHN0XzE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGRba10gPSB2O1xuICAgIH1cbiAgICByZXR1cm4gZm5TdHI7XG59O1xudmFyIGNoID0gW107XG4vLyBjbG9uZSBidWZzXG52YXIgY2JmcyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIHRsID0gW107XG4gICAgZm9yICh2YXIgayBpbiB2KSB7XG4gICAgICAgIGlmICh2W2tdLmJ1ZmZlcikge1xuICAgICAgICAgICAgdGwucHVzaCgodltrXSA9IG5ldyB2W2tdLmNvbnN0cnVjdG9yKHZba10pKS5idWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bDtcbn07XG4vLyB1c2UgYSB3b3JrZXIgdG8gZXhlY3V0ZSBjb2RlXG52YXIgd3JrciA9IGZ1bmN0aW9uIChmbnMsIGluaXQsIGlkLCBjYikge1xuICAgIGlmICghY2hbaWRdKSB7XG4gICAgICAgIHZhciBmblN0ciA9ICcnLCB0ZF8xID0ge30sIG0gPSBmbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtOyArK2kpXG4gICAgICAgICAgICBmblN0ciA9IHdjbG4oZm5zW2ldLCBmblN0ciwgdGRfMSk7XG4gICAgICAgIGNoW2lkXSA9IHsgYzogd2NsbihmbnNbbV0sIGZuU3RyLCB0ZF8xKSwgZTogdGRfMSB9O1xuICAgIH1cbiAgICB2YXIgdGQgPSBtcmcoe30sIGNoW2lkXS5lKTtcbiAgICByZXR1cm4gd2soY2hbaWRdLmMgKyAnO29ubWVzc2FnZT1mdW5jdGlvbihlKXtmb3IodmFyIGsgaW4gZS5kYXRhKXNlbGZba109ZS5kYXRhW2tdO29ubWVzc2FnZT0nICsgaW5pdC50b1N0cmluZygpICsgJ30nLCBpZCwgdGQsIGNiZnModGQpLCBjYik7XG59O1xuLy8gYmFzZSBhc3luYyBpbmZsYXRlIGZuXG52YXIgYkluZmx0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3U4LCB1MTYsIGkzMiwgZmxlYiwgZmRlYiwgY2xpbSwgZmwsIGZkLCBmbHJtLCBmZHJtLCByZXYsIGVjLCBoTWFwLCBtYXgsIGJpdHMsIGJpdHMxNiwgc2hmdCwgc2xjLCBlcnIsIGluZmx0LCBpbmZsYXRlU3luYywgcGJmLCBnb3B0XTsgfTtcbnZhciBiRGZsdCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1OCwgdTE2LCBpMzIsIGZsZWIsIGZkZWIsIGNsaW0sIHJldmZsLCByZXZmZCwgZmxtLCBmbHQsIGZkbSwgZmR0LCByZXYsIGRlbywgZXQsIGhNYXAsIHdiaXRzLCB3Yml0czE2LCBoVHJlZSwgbG4sIGxjLCBjbGVuLCB3ZmJsaywgd2Jsaywgc2hmdCwgc2xjLCBkZmx0LCBkb3B0LCBkZWZsYXRlU3luYywgcGJmXTsgfTtcbi8vIGd6aXAgZXh0cmFcbnZhciBnemUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3poLCBnemhsLCB3Ynl0ZXMsIGNyYywgY3JjdF07IH07XG4vLyBndW56aXAgZXh0cmFcbnZhciBndXplID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6cywgZ3psXTsgfTtcbi8vIHpsaWIgZXh0cmFcbnZhciB6bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxoLCB3Ynl0ZXMsIGFkbGVyXTsgfTtcbi8vIHVuemxpYiBleHRyYVxudmFyIHp1bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxzXTsgfTtcbi8vIHBvc3QgYnVmXG52YXIgcGJmID0gZnVuY3Rpb24gKG1zZykgeyByZXR1cm4gcG9zdE1lc3NhZ2UobXNnLCBbbXNnLmJ1ZmZlcl0pOyB9O1xuLy8gZ2V0IG9wdHNcbnZhciBnb3B0ID0gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYge1xuICAgIG91dDogby5zaXplICYmIG5ldyB1OChvLnNpemUpLFxuICAgIGRpY3Rpb25hcnk6IG8uZGljdGlvbmFyeVxufTsgfTtcbi8vIGFzeW5jIGhlbHBlclxudmFyIGNiaWZ5ID0gZnVuY3Rpb24gKGRhdCwgb3B0cywgZm5zLCBpbml0LCBpZCwgY2IpIHtcbiAgICB2YXIgdyA9IHdya3IoZm5zLCBpbml0LCBpZCwgZnVuY3Rpb24gKGVyciwgZGF0KSB7XG4gICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgIGNiKGVyciwgZGF0KTtcbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKFtkYXQsIG9wdHNdLCBvcHRzLmNvbnN1bWUgPyBbZGF0LmJ1ZmZlcl0gOiBbXSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbn07XG4vLyBhdXRvIHN0cmVhbVxudmFyIGFzdHJtID0gZnVuY3Rpb24gKHN0cm0pIHtcbiAgICBzdHJtLm9uZGF0YSA9IGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7IHJldHVybiBwb3N0TWVzc2FnZShbZGF0LCBmaW5hbF0sIFtkYXQuYnVmZmVyXSk7IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldikge1xuICAgICAgICBpZiAoZXYuZGF0YVswXSkge1xuICAgICAgICAgICAgc3RybS5wdXNoKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pO1xuICAgICAgICAgICAgcG9zdE1lc3NhZ2UoW2V2LmRhdGFbMF0ubGVuZ3RoXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3RybS5mbHVzaChldi5kYXRhWzFdKTtcbiAgICB9O1xufTtcbi8vIGFzeW5jIHN0cmVhbSBhdHRhY2hcbnZhciBhc3RybWlmeSA9IGZ1bmN0aW9uIChmbnMsIHN0cm0sIG9wdHMsIGluaXQsIGlkLCBmbHVzaCwgZXh0KSB7XG4gICAgdmFyIHQ7XG4gICAgdmFyIHcgPSB3cmtyKGZucywgaW5pdCwgaWQsIGZ1bmN0aW9uIChlcnIsIGRhdCkge1xuICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgdy50ZXJtaW5hdGUoKSwgc3RybS5vbmRhdGEuY2FsbChzdHJtLCBlcnIpO1xuICAgICAgICBlbHNlIGlmICghQXJyYXkuaXNBcnJheShkYXQpKVxuICAgICAgICAgICAgZXh0KGRhdCk7XG4gICAgICAgIGVsc2UgaWYgKGRhdC5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgc3RybS5xdWV1ZWRTaXplIC09IGRhdFswXTtcbiAgICAgICAgICAgIGlmIChzdHJtLm9uZHJhaW4pXG4gICAgICAgICAgICAgICAgc3RybS5vbmRyYWluKGRhdFswXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGF0WzFdKVxuICAgICAgICAgICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgICAgICBzdHJtLm9uZGF0YS5jYWxsKHN0cm0sIGVyciwgZGF0WzBdLCBkYXRbMV0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdy5wb3N0TWVzc2FnZShvcHRzKTtcbiAgICBzdHJtLnF1ZXVlZFNpemUgPSAwO1xuICAgIHN0cm0ucHVzaCA9IGZ1bmN0aW9uIChkLCBmKSB7XG4gICAgICAgIGlmICghc3RybS5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0KVxuICAgICAgICAgICAgc3RybS5vbmRhdGEoZXJyKDQsIDAsIDEpLCBudWxsLCAhIWYpO1xuICAgICAgICBzdHJtLnF1ZXVlZFNpemUgKz0gZC5sZW5ndGg7XG4gICAgICAgIC8vIGNhbiBmYWlsIGZvciBjcm9zcy1yZWFsbSBVaW50OEFycmF5LCBidXQgb2sgLSBvbmx5IGEgc21hbGwgcGVyZm9ybWFuY2UgcGVuYWx0eVxuICAgICAgICB3LnBvc3RNZXNzYWdlKFtkLCB0ID0gZl0sIGQuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPyBbZC5idWZmZXJdIDogW10pO1xuICAgIH07XG4gICAgc3RybS50ZXJtaW5hdGUgPSBmdW5jdGlvbiAoKSB7IHcudGVybWluYXRlKCk7IH07XG4gICAgaWYgKGZsdXNoKSB7XG4gICAgICAgIHN0cm0uZmx1c2ggPSBmdW5jdGlvbiAoc3luYykgeyB3LnBvc3RNZXNzYWdlKFswLCBzeW5jXSk7IH07XG4gICAgfVxufTtcbi8vIHJlYWQgMiBieXRlc1xudmFyIGIyID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGRbYl0gfCAoZFtiICsgMV0gPDwgOCk7IH07XG4vLyByZWFkIDQgYnl0ZXNcbnZhciBiNCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiAoZFtiXSB8IChkW2IgKyAxXSA8PCA4KSB8IChkW2IgKyAyXSA8PCAxNikgfCAoZFtiICsgM10gPDwgMjQpKSA+Pj4gMDsgfTtcbi8vIHJlYWQgOCBieXRlc1xudmFyIGI4ID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGI0KGQsIGIpICsgKGI0KGQsIGIgKyA0KSAqIDQyOTQ5NjcyOTYpOyB9O1xuLy8gd3JpdGUgYnl0ZXNcbnZhciB3Ynl0ZXMgPSBmdW5jdGlvbiAoZCwgYiwgdikge1xuICAgIGZvciAoOyB2OyArK2IpXG4gICAgICAgIGRbYl0gPSB2LCB2ID4+Pj0gODtcbn07XG4vLyBnemlwIGhlYWRlclxudmFyIGd6aCA9IGZ1bmN0aW9uIChjLCBvKSB7XG4gICAgdmFyIGZuID0gby5maWxlbmFtZTtcbiAgICBjWzBdID0gMzEsIGNbMV0gPSAxMzksIGNbMl0gPSA4LCBjWzhdID0gby5sZXZlbCA8IDIgPyA0IDogby5sZXZlbCA9PSA5ID8gMiA6IDAsIGNbOV0gPSAzOyAvLyBhc3N1bWUgVW5peFxuICAgIGlmIChvLm10aW1lICE9IDApXG4gICAgICAgIHdieXRlcyhjLCA0LCBNYXRoLmZsb29yKG5ldyBEYXRlKG8ubXRpbWUgfHwgRGF0ZS5ub3coKSkgLyAxMDAwKSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICAgIGNbM10gPSA4O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmbi5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNbaSArIDEwXSA9IGZuLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxufTtcbi8vIGd6aXAgZm9vdGVyOiAtOCB0byAtNCA9IENSQywgLTQgdG8gLTAgaXMgbGVuZ3RoXG4vLyBnemlwIHN0YXJ0XG52YXIgZ3pzID0gZnVuY3Rpb24gKGQpIHtcbiAgICBpZiAoZFswXSAhPSAzMSB8fCBkWzFdICE9IDEzOSB8fCBkWzJdICE9IDgpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCBnemlwIGRhdGEnKTtcbiAgICB2YXIgZmxnID0gZFszXTtcbiAgICB2YXIgc3QgPSAxMDtcbiAgICBpZiAoZmxnICYgNClcbiAgICAgICAgc3QgKz0gKGRbMTBdIHwgZFsxMV0gPDwgOCkgKyAyO1xuICAgIGZvciAodmFyIHpzID0gKGZsZyA+PiAzICYgMSkgKyAoZmxnID4+IDQgJiAxKTsgenMgPiAwOyB6cyAtPSAhZFtzdCsrXSlcbiAgICAgICAgO1xuICAgIHJldHVybiBzdCArIChmbGcgJiAyKTtcbn07XG4vLyBnemlwIGxlbmd0aFxudmFyIGd6bCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgdmFyIGwgPSBkLmxlbmd0aDtcbiAgICByZXR1cm4gKGRbbCAtIDRdIHwgZFtsIC0gM10gPDwgOCB8IGRbbCAtIDJdIDw8IDE2IHwgZFtsIC0gMV0gPDwgMjQpID4+PiAwO1xufTtcbi8vIGd6aXAgaGVhZGVyIGxlbmd0aFxudmFyIGd6aGwgPSBmdW5jdGlvbiAobykgeyByZXR1cm4gMTAgKyAoby5maWxlbmFtZSA/IG8uZmlsZW5hbWUubGVuZ3RoICsgMSA6IDApOyB9O1xuLy8gemxpYiBoZWFkZXJcbnZhciB6bGggPSBmdW5jdGlvbiAoYywgbykge1xuICAgIHZhciBsdiA9IG8ubGV2ZWwsIGZsID0gbHYgPT0gMCA/IDAgOiBsdiA8IDYgPyAxIDogbHYgPT0gOSA/IDMgOiAyO1xuICAgIGNbMF0gPSAxMjAsIGNbMV0gPSAoZmwgPDwgNikgfCAoby5kaWN0aW9uYXJ5ICYmIDMyKTtcbiAgICBjWzFdIHw9IDMxIC0gKChjWzBdIDw8IDgpIHwgY1sxXSkgJSAzMTtcbiAgICBpZiAoby5kaWN0aW9uYXJ5KSB7XG4gICAgICAgIHZhciBoID0gYWRsZXIoKTtcbiAgICAgICAgaC5wKG8uZGljdGlvbmFyeSk7XG4gICAgICAgIHdieXRlcyhjLCAyLCBoLmQoKSk7XG4gICAgfVxufTtcbi8vIHpsaWIgc3RhcnRcbnZhciB6bHMgPSBmdW5jdGlvbiAoZCwgZGljdCkge1xuICAgIGlmICgoZFswXSAmIDE1KSAhPSA4IHx8IChkWzBdID4+IDQpID4gNyB8fCAoKGRbMF0gPDwgOCB8IGRbMV0pICUgMzEpKVxuICAgICAgICBlcnIoNiwgJ2ludmFsaWQgemxpYiBkYXRhJyk7XG4gICAgaWYgKChkWzFdID4+IDUgJiAxKSA9PSArIWRpY3QpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCB6bGliIGRhdGE6ICcgKyAoZFsxXSAmIDMyID8gJ25lZWQnIDogJ3VuZXhwZWN0ZWQnKSArICcgZGljdGlvbmFyeScpO1xuICAgIHJldHVybiAoZFsxXSA+PiAzICYgNCkgKyAyO1xufTtcbmZ1bmN0aW9uIFN0cm1PcHQob3B0cywgY2IpIHtcbiAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICByZXR1cm4gb3B0cztcbn1cbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb25cbiAqL1xudmFyIERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRGVmbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB0aGlzLm8gPSBvcHRzIHx8IHt9O1xuICAgICAgICB0aGlzLnMgPSB7IGw6IDAsIGk6IDMyNzY4LCB3OiAzMjc2OCwgejogMzI3NjggfTtcbiAgICAgICAgLy8gQnVmZmVyIGxlbmd0aCBtdXN0IGFsd2F5cyBiZSAwIG1vZCAzMjc2OCBmb3IgaW5kZXggY2FsY3VsYXRpb25zIHRvIGJlIGNvcnJlY3Qgd2hlbiBtb2RpZnlpbmcgaGVhZCBhbmQgcHJldlxuICAgICAgICAvLyA5ODMwNCA9IDMyNzY4IChsb29rYmFjaykgKyA2NTUzNiAoY29tbW9uIGNodW5rIHNpemUpXG4gICAgICAgIHRoaXMuYiA9IG5ldyB1OCg5ODMwNCk7XG4gICAgICAgIGlmICh0aGlzLm8uZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIGRpY3QgPSB0aGlzLm8uZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpO1xuICAgICAgICAgICAgdGhpcy5iLnNldChkaWN0LCAzMjc2OCAtIGRpY3QubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMucy5pID0gMzI3NjggLSBkaWN0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBEZWZsYXRlLnByb3RvdHlwZS5wID0gZnVuY3Rpb24gKGMsIGYpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEoZG9wdChjLCB0aGlzLm8sIDAsIDAsIHRoaXMucyksIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVmbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVmbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMucy5sKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICB2YXIgZW5kTGVuID0gY2h1bmsubGVuZ3RoICsgdGhpcy5zLno7XG4gICAgICAgIGlmIChlbmRMZW4gPiB0aGlzLmIubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoZW5kTGVuID4gMiAqIHRoaXMuYi5sZW5ndGggLSAzMjc2OCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdCdWYgPSBuZXcgdTgoZW5kTGVuICYgLTMyNzY4KTtcbiAgICAgICAgICAgICAgICBuZXdCdWYuc2V0KHRoaXMuYi5zdWJhcnJheSgwLCB0aGlzLnMueikpO1xuICAgICAgICAgICAgICAgIHRoaXMuYiA9IG5ld0J1ZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHRoaXMuYi5sZW5ndGggLSB0aGlzLnMuejtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoY2h1bmsuc3ViYXJyYXkoMCwgc3BsaXQpLCB0aGlzLnMueik7XG4gICAgICAgICAgICB0aGlzLnMueiA9IHRoaXMuYi5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnAodGhpcy5iLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KHRoaXMuYi5zdWJhcnJheSgtMzI3NjgpKTtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoY2h1bmsuc3ViYXJyYXkoc3BsaXQpLCAzMjc2OCk7XG4gICAgICAgICAgICB0aGlzLnMueiA9IGNodW5rLmxlbmd0aCAtIHNwbGl0ICsgMzI3Njg7XG4gICAgICAgICAgICB0aGlzLnMuaSA9IDMyNzY2LCB0aGlzLnMudyA9IDMyNzY4O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iLnNldChjaHVuaywgdGhpcy5zLnopO1xuICAgICAgICAgICAgdGhpcy5zLnogKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucy5sID0gZmluYWwgJiAxO1xuICAgICAgICBpZiAodGhpcy5zLnogPiB0aGlzLnMudyArIDgxOTEgfHwgZmluYWwpIHtcbiAgICAgICAgICAgIHRoaXMucCh0aGlzLmIsIGZpbmFsIHx8IGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMucy53ID0gdGhpcy5zLmksIHRoaXMucy5pIC09IDI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAvLyBjbGVhbnVwIHVubmVlZGVkIGJ1ZmZlcnMvc3RhdGUgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgdGhpcy5zID0gdGhpcy5vID0ge307XG4gICAgICAgICAgICB0aGlzLmIgPSBldDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIGRlZmxhdGVkIG91dHB1dCBmb3Igc21hbGwgaW5wdXRzLlxuICAgICAqIEBwYXJhbSBzeW5jIFdoZXRoZXIgdG8gZmx1c2ggdG8gYSBieXRlIGJvdW5kYXJ5LiBBIHN5bmMgZmx1c2ggdGFrZXMgNC01XG4gICAgICogICAgICAgICAgICAgZXh0cmEgYnl0ZXMsIGJ1dCBndWFyYW50ZWVzIGFsbCBwdXNoZWQgZGF0YSBpcyBpbW1lZGlhdGVseVxuICAgICAqICAgICAgICAgICAgIGRlY29tcHJlc3NpYmxlLiBBIHNlcGFyYXRlIERFRkxBVEUgc3RyZWFtIG1heSBiZSBjb25jYXRlbmF0ZWRcbiAgICAgKiAgICAgICAgICAgICB3aXRoIHRoZSBjdXJyZW50IG91dHB1dCBhZnRlciBhIHN5bmMgZmx1c2guXG4gICAgICovXG4gICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAodGhpcy5zLmwpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHRoaXMucCh0aGlzLmIsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5zLncgPSB0aGlzLnMuaSwgdGhpcy5zLmkgLT0gMjtcbiAgICAgICAgLy8gY291bGQgdGVjaG5pY2FsbHkgc2tpcCB3cml0aW5nIHRoZSB0eXBlLTAgYmxvY2sgZm9yICh0aGlzLnMuciAmIDcpID09IDAsXG4gICAgICAgIC8vIGJ1dCB0aGUgZGV0ZXJtaW5pc3RpYyB0cmFpbGVyICgwMCAwMCBGRiBGRikgaXMgdXNlZnVsIGluIHNvbWUgc2l0dWF0aW9uc1xuICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgdmFyIGMgPSBuZXcgdTgoNik7XG4gICAgICAgICAgICBjWzBdID0gdGhpcy5zLnIgPj4gMztcbiAgICAgICAgICAgIC8vIHdyaXRlIGVtcHR5LCBub24tZmluYWwgdHlwZS0wIGJsb2NrXG4gICAgICAgICAgICB2YXIgZXAgPSB3ZmJsayhjLCB0aGlzLnMuciwgZXQpO1xuICAgICAgICAgICAgdGhpcy5zLnIgPSAwO1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoYy5zdWJhcnJheSgwLCBlcCA+PiAzKSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBEZWZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jRGVmbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiRGZsdCxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgRGVmbGF0ZV07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBEZWZsYXRlKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDYsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jRGVmbGF0ZSB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmxhdGUoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiRGZsdCxcbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihkZWZsYXRlU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDAsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3NlcyBkYXRhIHdpdGggREVGTEFURSB3aXRob3V0IGFueSB3cmFwcGVyXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWZsYXRlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZsYXRlU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIGRvcHQoZGF0YSwgb3B0cyB8fCB7fSwgMCwgMCk7XG59XG4vKipcbiAqIFN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSW5mbGF0ZShvcHRzLCBjYikge1xuICAgICAgICAvLyBubyBTdHJtT3B0IGhlcmUgdG8gYXZvaWQgYWRkaW5nIHRvIHdvcmtlcml6ZXJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRzID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICAgICAgdmFyIGRpY3QgPSBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSAmJiBvcHRzLmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgdGhpcy5zID0geyBpOiAwLCBiOiBkaWN0ID8gZGljdC5sZW5ndGggOiAwIH07XG4gICAgICAgIHRoaXMubyA9IG5ldyB1OCgzMjc2OCk7XG4gICAgICAgIHRoaXMucCA9IG5ldyB1OCgwKTtcbiAgICAgICAgaWYgKGRpY3QpXG4gICAgICAgICAgICB0aGlzLm8uc2V0KGRpY3QpO1xuICAgIH1cbiAgICBJbmZsYXRlLnByb3RvdHlwZS5lID0gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgaWYgKCF0aGlzLnAubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5wID0gYztcbiAgICAgICAgZWxzZSBpZiAoYy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjLmxlbmd0aCk7XG4gICAgICAgICAgICBuLnNldCh0aGlzLnApLCBuLnNldChjLCB0aGlzLnAubGVuZ3RoKSwgdGhpcy5wID0gbjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSW5mbGF0ZS5wcm90b3R5cGUuYyA9IGZ1bmN0aW9uIChmaW5hbCkge1xuICAgICAgICB0aGlzLnMuaSA9ICsodGhpcy5kID0gZmluYWwgfHwgZmFsc2UpO1xuICAgICAgICB2YXIgYnRzID0gdGhpcy5zLmI7XG4gICAgICAgIHZhciBkdCA9IGluZmx0KHRoaXMucCwgdGhpcy5zLCB0aGlzLm8pO1xuICAgICAgICB0aGlzLm9uZGF0YShzbGMoZHQsIGJ0cywgdGhpcy5zLmIpLCB0aGlzLmQpO1xuICAgICAgICB0aGlzLm8gPSBzbGMoZHQsIHRoaXMucy5iIC0gMzI3NjgpLCB0aGlzLnMuYiA9IHRoaXMuby5sZW5ndGg7XG4gICAgICAgIHRoaXMucCA9IHNsYyh0aGlzLnAsICh0aGlzLnMucCAvIDgpIHwgMCksIHRoaXMucy5wICY9IDc7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBpbmZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGZpbmFsIGNodW5rXG4gICAgICovXG4gICAgSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5lKGNodW5rKSwgdGhpcy5jKGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEluZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0luZmxhdGUob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBJbmZsYXRlXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEluZmxhdGUoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgNywgMCk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0luZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNJbmZsYXRlIH07XG5leHBvcnQgZnVuY3Rpb24gaW5mbGF0ZShkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdFxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGluZmxhdGVTeW5jKGV2LmRhdGFbMF0sIGdvcHQoZXYuZGF0YVsxXSkpKTsgfSwgMSwgY2IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGVTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YSwgeyBpOiAyIH0sIG9wdHMgJiYgb3B0cy5vdXQsIG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5KTtcbn1cbi8vIGJlZm9yZSB5b3UgeWVsbCBhdCBtZSBmb3Igbm90IGp1c3QgdXNpbmcgZXh0ZW5kcywgbXkgcmVhc29uIGlzIHRoYXQgVFMgaW5oZXJpdGFuY2UgaXMgaGFyZCB0byB3b3JrZXJpemUuXG4vKipcbiAqIFN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBHemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEd6aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gY3JjKCk7XG4gICAgICAgIHRoaXMubCA9IDA7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdaSVBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgR3ppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICB0aGlzLmwgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIEd6aXAucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiBnemhsKHRoaXMubyksIGYgJiYgOCwgdGhpcy5zKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIGd6aChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDgsIHRoaXMuYy5kKCkpLCB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5sKTtcbiAgICAgICAgdGhpcy5vbmRhdGEocmF3LCBmKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEZsdXNoZXMgYnVmZmVyZWQgdW5jb21wcmVzc2VkIGRhdGEuIFVzZWZ1bCB0byBpbW1lZGlhdGVseSByZXRyaWV2ZSB0aGVcbiAgICAgKiBHWklQcGVkIG91dHB1dCBmb3Igc21hbGwgaW5wdXRzLlxuICAgICAqIEBwYXJhbSBzeW5jIFdoZXRoZXIgdG8gZmx1c2ggdG8gYSBieXRlIGJvdW5kYXJ5LiBBIHN5bmMgZmx1c2ggdGFrZXMgNC01XG4gICAgICogICAgICAgICAgICAgZXh0cmEgYnl0ZXMsIGJ1dCBndWFyYW50ZWVzIGFsbCBwdXNoZWQgZGF0YSBpcyBpbW1lZGlhdGVseVxuICAgICAqICAgICAgICAgICAgIGRlY29tcHJlc3NpYmxlLlxuICAgICAqL1xuICAgIEd6aXAucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKHN5bmMpIHtcbiAgICAgICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2guY2FsbCh0aGlzLCBzeW5jKTtcbiAgICB9O1xuICAgIHJldHVybiBHemlwO1xufSgpKTtcbmV4cG9ydCB7IEd6aXAgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0d6aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNHemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgZ3plLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlLCBHemlwXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEd6aXAoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgOCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0d6aXA7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNHemlwIH07XG5leHBvcnQgZnVuY3Rpb24gZ3ppcChkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICBnemUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtnemlwU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihnemlwU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDIsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3NlcyBkYXRhIHdpdGggR1pJUFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZ3ppcHBlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGMgPSBjcmMoKSwgbCA9IGRhdGEubGVuZ3RoO1xuICAgIGMucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgZ3pobChvcHRzKSwgOCksIHMgPSBkLmxlbmd0aDtcbiAgICByZXR1cm4gZ3poKGQsIG9wdHMpLCB3Ynl0ZXMoZCwgcyAtIDgsIGMuZCgpKSwgd2J5dGVzKGQsIHMgLSA0LCBsKSwgZDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIHNpbmdsZSBvciBtdWx0aS1tZW1iZXIgR1pJUCBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBHdW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gR3VuemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIHRoaXMuciA9IDA7XG4gICAgICAgIEluZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdVTlpJUHBlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBHdW56aXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmUuY2FsbCh0aGlzLCBjaHVuayk7XG4gICAgICAgIHRoaXMuciArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLnYpIHtcbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5wLnN1YmFycmF5KHRoaXMudiAtIDEpO1xuICAgICAgICAgICAgdmFyIHMgPSBwLmxlbmd0aCA+IDMgPyBnenMocCkgOiA0O1xuICAgICAgICAgICAgaWYgKHMgPiBwLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICghZmluYWwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudiA+IDEgJiYgdGhpcy5vbm1lbWJlcikge1xuICAgICAgICAgICAgICAgIHRoaXMub25tZW1iZXIodGhpcy5yIC0gcC5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wID0gcC5zdWJhcnJheShzKSwgdGhpcy52ID0gMDtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWNlc3NhcnkgdG8gcHJldmVudCBUUyBmcm9tIHVzaW5nIHRoZSBjbG9zdXJlIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB3b3JrZXJpemF0aW9uIHRvIGZ1bmN0aW9uIGNvcnJlY3RseVxuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5jLmNhbGwodGhpcywgMCk7XG4gICAgICAgIC8vIHByb2Nlc3MgY29uY2F0ZW5hdGVkIEdaSVBcbiAgICAgICAgaWYgKHRoaXMucy5mICYmICF0aGlzLnMubCkge1xuICAgICAgICAgICAgdGhpcy52ID0gc2hmdCh0aGlzLnMucCkgKyA5O1xuICAgICAgICAgICAgdGhpcy5zID0geyBpOiAwIH07XG4gICAgICAgICAgICB0aGlzLm8gPSBuZXcgdTgoMCk7XG4gICAgICAgICAgICB0aGlzLnB1c2gobmV3IHU4KDApLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBHdW56aXA7XG59KCkpO1xuZXhwb3J0IHsgR3VuemlwIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgc2luZ2xlIG9yIG11bHRpLW1lbWJlciBHWklQIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jR3VuemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jR3VuemlwKG9wdHMsIGNiKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJJbmZsdCxcbiAgICAgICAgICAgIGd1emUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGUsIEd1bnppcF07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBHdW56aXAoZXYuZGF0YSk7XG4gICAgICAgICAgICBzdHJtLm9ubWVtYmVyID0gZnVuY3Rpb24gKG9mZnNldCkgeyByZXR1cm4gcG9zdE1lc3NhZ2Uob2Zmc2V0KTsgfTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA5LCAwLCBmdW5jdGlvbiAob2Zmc2V0KSB7IHJldHVybiBfdGhpcy5vbm1lbWJlciAmJiBfdGhpcy5vbm1lbWJlcihvZmZzZXQpOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3VuemlwO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jR3VuemlwIH07XG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkluZmx0LFxuICAgICAgICBndXplLFxuICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3VuemlwU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihndW56aXBTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMywgY2IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGd1bnppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIHZhciBzdCA9IGd6cyhkYXRhKTtcbiAgICBpZiAoc3QgKyA4ID4gZGF0YS5sZW5ndGgpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCBnemlwIGRhdGEnKTtcbiAgICByZXR1cm4gaW5mbHQoZGF0YS5zdWJhcnJheShzdCwgLTgpLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCB8fCBuZXcgdTgoZ3psKGRhdGEpKSwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgWmxpYiBjb21wcmVzc2lvblxuICovXG52YXIgWmxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBabGliKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMuYyA9IGFkbGVyKCk7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHpsaWJiZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmxpYi5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIFpsaWIucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiAodGhpcy5vLmRpY3Rpb25hcnkgPyA2IDogMiksIGYgJiYgNCwgdGhpcy5zKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIHpsaChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDQsIHRoaXMuYy5kKCkpO1xuICAgICAgICB0aGlzLm9uZGF0YShyYXcsIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIHpsaWJiZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICogQHBhcmFtIHN5bmMgV2hldGhlciB0byBmbHVzaCB0byBhIGJ5dGUgYm91bmRhcnkuIEEgc3luYyBmbHVzaCB0YWtlcyA0LTVcbiAgICAgKiAgICAgICAgICAgICBleHRyYSBieXRlcywgYnV0IGd1YXJhbnRlZXMgYWxsIHB1c2hlZCBkYXRhIGlzIGltbWVkaWF0ZWx5XG4gICAgICogICAgICAgICAgICAgZGVjb21wcmVzc2libGUuXG4gICAgICovXG4gICAgWmxpYi5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaC5jYWxsKHRoaXMsIHN5bmMpO1xuICAgIH07XG4gICAgcmV0dXJuIFpsaWI7XG59KCkpO1xuZXhwb3J0IHsgWmxpYiB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIFpsaWIgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jWmxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY1psaWIob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICB6bGUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGUsIFpsaWJdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgWmxpYihldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCAxMCwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY1psaWI7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNabGliIH07XG5leHBvcnQgZnVuY3Rpb24gemxpYihkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgICAgICB6bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bGliU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZih6bGliU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDQsIGNiKTtcbn1cbi8qKlxuICogQ29tcHJlc3MgZGF0YSB3aXRoIFpsaWJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIHpsaWItY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6bGliU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIGEgPSBhZGxlcigpO1xuICAgIGEucChkYXRhKTtcbiAgICB2YXIgZCA9IGRvcHQoZGF0YSwgb3B0cywgb3B0cy5kaWN0aW9uYXJ5ID8gNiA6IDIsIDQpO1xuICAgIHJldHVybiB6bGgoZCwgb3B0cyksIHdieXRlcyhkLCBkLmxlbmd0aCAtIDQsIGEuZCgpKSwgZDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIFpsaWIgZGVjb21wcmVzc2lvblxuICovXG52YXIgVW56bGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFVuemxpYihvcHRzLCBjYikge1xuICAgICAgICBJbmZsYXRlLmNhbGwodGhpcywgb3B0cywgY2IpO1xuICAgICAgICB0aGlzLnYgPSBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSA/IDIgOiAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSB1bnpsaWJiZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgVW56bGliLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5lLmNhbGwodGhpcywgY2h1bmspO1xuICAgICAgICBpZiAodGhpcy52KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA8IDYgJiYgIWZpbmFsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMucCA9IHRoaXMucC5zdWJhcnJheSh6bHModGhpcy5wLCB0aGlzLnYgLSAxKSksIHRoaXMudiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA8IDQpXG4gICAgICAgICAgICAgICAgZXJyKDYsICdpbnZhbGlkIHpsaWIgZGF0YScpO1xuICAgICAgICAgICAgdGhpcy5wID0gdGhpcy5wLnN1YmFycmF5KDAsIC00KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWNlc3NhcnkgdG8gcHJldmVudCBUUyBmcm9tIHVzaW5nIHRoZSBjbG9zdXJlIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB3b3JrZXJpemF0aW9uIHRvIGZ1bmN0aW9uIGNvcnJlY3RseVxuICAgICAgICBJbmZsYXRlLnByb3RvdHlwZS5jLmNhbGwodGhpcywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIFVuemxpYjtcbn0oKSk7XG5leHBvcnQgeyBVbnpsaWIgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBabGliIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jVW56bGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jVW56bGliKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJJbmZsdCxcbiAgICAgICAgICAgIHp1bGUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGUsIFVuemxpYl07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBVbnpsaWIoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgMTEsIDApO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNVbnpsaWI7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNVbnpsaWIgfTtcbmV4cG9ydCBmdW5jdGlvbiB1bnpsaWIoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiSW5mbHQsXG4gICAgICAgIHp1bGUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1bnpsaWJTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKHVuemxpYlN5bmMoZXYuZGF0YVswXSwgZ29wdChldi5kYXRhWzFdKSkpOyB9LCA1LCBjYik7XG59XG5leHBvcnQgZnVuY3Rpb24gdW56bGliU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIGluZmx0KGRhdGEuc3ViYXJyYXkoemxzKGRhdGEsIG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5KSwgLTQpLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLy8gRGVmYXVsdCBhbGdvcml0aG0gZm9yIGNvbXByZXNzaW9uICh1c2VkIGJlY2F1c2UgaGF2aW5nIGEga25vd24gb3V0cHV0IHNpemUgYWxsb3dzIGZhc3RlciBkZWNvbXByZXNzaW9uKVxuZXhwb3J0IHsgZ3ppcCBhcyBjb21wcmVzcywgQXN5bmNHemlwIGFzIEFzeW5jQ29tcHJlc3MgfTtcbmV4cG9ydCB7IGd6aXBTeW5jIGFzIGNvbXByZXNzU3luYywgR3ppcCBhcyBDb21wcmVzcyB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgRGVjb21wcmVzcyA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZWNvbXByZXNzKG9wdHMsIGNiKSB7XG4gICAgICAgIHRoaXMubyA9IFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYikgfHwge307XG4gICAgICAgIHRoaXMuRyA9IEd1bnppcDtcbiAgICAgICAgdGhpcy5JID0gSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gVW56bGliO1xuICAgIH1cbiAgICAvLyBpbml0IHN1YnN0cmVhbVxuICAgIC8vIG92ZXJyaWRlbiBieSBBc3luY0RlY29tcHJlc3NcbiAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnMub25kYXRhID0gZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShkYXQsIGZpbmFsKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29tcHJlc3NlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAoIXRoaXMucykge1xuICAgICAgICAgICAgaWYgKHRoaXMucCAmJiB0aGlzLnAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbi5zZXQodGhpcy5wKSwgbi5zZXQoY2h1bmssIHRoaXMucC5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMucCA9IGNodW5rO1xuICAgICAgICAgICAgaWYgKHRoaXMucC5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zID0gKHRoaXMucFswXSA9PSAzMSAmJiB0aGlzLnBbMV0gPT0gMTM5ICYmIHRoaXMucFsyXSA9PSA4KVxuICAgICAgICAgICAgICAgICAgICA/IG5ldyB0aGlzLkcodGhpcy5vKVxuICAgICAgICAgICAgICAgICAgICA6ICgodGhpcy5wWzBdICYgMTUpICE9IDggfHwgKHRoaXMucFswXSA+PiA0KSA+IDcgfHwgKCh0aGlzLnBbMF0gPDwgOCB8IHRoaXMucFsxXSkgJSAzMSkpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyB0aGlzLkkodGhpcy5vKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgdGhpcy5aKHRoaXMubyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zLnB1c2godGhpcy5wLCBmaW5hbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnMucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIERlY29tcHJlc3M7XG59KCkpO1xuZXhwb3J0IHsgRGVjb21wcmVzcyB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIEdaSVAsIFpsaWIsIG9yIHJhdyBERUZMQVRFIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jRGVjb21wcmVzcyA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0RlY29tcHJlc3Mob3B0cywgY2IpIHtcbiAgICAgICAgRGVjb21wcmVzcy5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICAgICAgdGhpcy5xdWV1ZWRTaXplID0gMDtcbiAgICAgICAgdGhpcy5HID0gQXN5bmNHdW56aXA7XG4gICAgICAgIHRoaXMuSSA9IEFzeW5jSW5mbGF0ZTtcbiAgICAgICAgdGhpcy5aID0gQXN5bmNVbnpsaWI7XG4gICAgfVxuICAgIEFzeW5jRGVjb21wcmVzcy5wcm90b3R5cGUuaSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5zLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnMub25kcmFpbiA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgICAgICBfdGhpcy5xdWV1ZWRTaXplIC09IHNpemU7XG4gICAgICAgICAgICBpZiAoX3RoaXMub25kcmFpbilcbiAgICAgICAgICAgICAgICBfdGhpcy5vbmRyYWluKHNpemUpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVjb21wcmVzc2VkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEFzeW5jRGVjb21wcmVzcy5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5xdWV1ZWRTaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgRGVjb21wcmVzcy5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNEZWNvbXByZXNzO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jRGVjb21wcmVzcyB9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcHJlc3MoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gKGRhdGFbMF0gPT0gMzEgJiYgZGF0YVsxXSA9PSAxMzkgJiYgZGF0YVsyXSA9PSA4KVxuICAgICAgICA/IGd1bnppcChkYXRhLCBvcHRzLCBjYilcbiAgICAgICAgOiAoKGRhdGFbMF0gJiAxNSkgIT0gOCB8fCAoZGF0YVswXSA+PiA0KSA+IDcgfHwgKChkYXRhWzBdIDw8IDggfCBkYXRhWzFdKSAlIDMxKSlcbiAgICAgICAgICAgID8gaW5mbGF0ZShkYXRhLCBvcHRzLCBjYilcbiAgICAgICAgICAgIDogdW56bGliKGRhdGEsIG9wdHMsIGNiKTtcbn1cbi8qKlxuICogRXhwYW5kcyBjb21wcmVzc2VkIEdaSVAsIFpsaWIsIG9yIHJhdyBERUZMQVRFIGRhdGEsIGF1dG9tYXRpY2FsbHkgZGV0ZWN0aW5nIHRoZSBmb3JtYXRcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGRlY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBkZWNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21wcmVzc1N5bmMoZGF0YSwgb3B0cykge1xuICAgIHJldHVybiAoZGF0YVswXSA9PSAzMSAmJiBkYXRhWzFdID09IDEzOSAmJiBkYXRhWzJdID09IDgpXG4gICAgICAgID8gZ3VuemlwU3luYyhkYXRhLCBvcHRzKVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlU3luYyhkYXRhLCBvcHRzKVxuICAgICAgICAgICAgOiB1bnpsaWJTeW5jKGRhdGEsIG9wdHMpO1xufVxuLy8gZmxhdHRlbiBhIGRpcmVjdG9yeSBzdHJ1Y3R1cmVcbnZhciBmbHRuID0gZnVuY3Rpb24gKGQsIHAsIHQsIG8pIHtcbiAgICBmb3IgKHZhciBrIGluIGQpIHtcbiAgICAgICAgdmFyIHZhbCA9IGRba10sIG4gPSBwICsgaywgb3AgPSBvO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKVxuICAgICAgICAgICAgb3AgPSBtcmcobywgdmFsWzFdKSwgdmFsID0gdmFsWzBdO1xuICAgICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCkpXG4gICAgICAgICAgICB0W25dID0gW3ZhbCwgb3BdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRbbiArPSAnLyddID0gW25ldyB1OCgwKSwgb3BdO1xuICAgICAgICAgICAgZmx0bih2YWwsIG4sIHQsIG8pO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vIHRleHQgZW5jb2RlclxudmFyIHRlID0gdHlwZW9mIFRleHRFbmNvZGVyICE9ICd1bmRlZmluZWQnICYmIC8qI19fUFVSRV9fKi8gbmV3IFRleHRFbmNvZGVyKCk7XG4vLyB0ZXh0IGRlY29kZXJcbnZhciB0ZCA9IHR5cGVvZiBUZXh0RGVjb2RlciAhPSAndW5kZWZpbmVkJyAmJiAvKiNfX1BVUkVfXyovIG5ldyBUZXh0RGVjb2RlcigpO1xuLy8gdGV4dCBkZWNvZGVyIHN0cmVhbVxudmFyIHRkcyA9IDA7XG50cnkge1xuICAgIHRkLmRlY29kZShldCwgeyBzdHJlYW06IHRydWUgfSk7XG4gICAgdGRzID0gMTtcbn1cbmNhdGNoIChlKSB7IH1cbi8vIGRlY29kZSBVVEY4XG52YXIgZHV0ZjggPSBmdW5jdGlvbiAoZCkge1xuICAgIGZvciAodmFyIHIgPSAnJywgaSA9IDA7Oykge1xuICAgICAgICB2YXIgYyA9IGRbaSsrXTtcbiAgICAgICAgdmFyIGViID0gKGMgPiAxMjcpICsgKGMgPiAyMjMpICsgKGMgPiAyMzkpO1xuICAgICAgICBpZiAoaSArIGViID4gZC5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4geyBzOiByLCByOiBzbGMoZCwgaSAtIDEpIH07XG4gICAgICAgIGlmICghZWIpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgIGVsc2UgaWYgKGViID09IDMpIHtcbiAgICAgICAgICAgIGMgPSAoKGMgJiAxNSkgPDwgMTggfCAoZFtpKytdICYgNjMpIDw8IDEyIHwgKGRbaSsrXSAmIDYzKSA8PCA2IHwgKGRbaSsrXSAmIDYzKSkgLSA2NTUzNixcbiAgICAgICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTYgfCAoYyA+PiAxMCksIDU2MzIwIHwgKGMgJiAxMDIzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWIgJiAxKVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgMzEpIDw8IDYgfCAoZFtpKytdICYgNjMpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjICYgMTUpIDw8IDEyIHwgKGRbaSsrXSAmIDYzKSA8PCA2IHwgKGRbaSsrXSAmIDYzKSk7XG4gICAgfVxufTtcbi8qKlxuICogU3RyZWFtaW5nIFVURi04IGRlY29kaW5nXG4gKi9cbnZhciBEZWNvZGVVVEY4ID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBVVEYtOCBkZWNvZGluZyBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBkZWNvZGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gRGVjb2RlVVRGOChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICBpZiAodGRzKVxuICAgICAgICAgICAgdGhpcy50ID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucCA9IGV0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWNvZGVkIGZyb20gVVRGLTggYmluYXJ5XG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlY29kZVVURjgucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGZpbmFsID0gISFmaW5hbDtcbiAgICAgICAgaWYgKHRoaXMudCkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEodGhpcy50LmRlY29kZShjaHVuaywgeyBzdHJlYW06IHRydWUgfSksIGZpbmFsKTtcbiAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnQuZGVjb2RlKCkubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgICAgICAgICAgdGhpcy50ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMucClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdmFyIGRhdCA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgZGF0LnNldCh0aGlzLnApO1xuICAgICAgICBkYXQuc2V0KGNodW5rLCB0aGlzLnAubGVuZ3RoKTtcbiAgICAgICAgdmFyIF9hID0gZHV0ZjgoZGF0KSwgcyA9IF9hLnMsIHIgPSBfYS5yO1xuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIGlmIChyLmxlbmd0aClcbiAgICAgICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucCA9IHI7XG4gICAgICAgIHRoaXMub25kYXRhKHMsIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBEZWNvZGVVVEY4O1xufSgpKTtcbmV4cG9ydCB7IERlY29kZVVURjggfTtcbi8qKlxuICogU3RyZWFtaW5nIFVURi04IGVuY29kaW5nXG4gKi9cbnZhciBFbmNvZGVVVEY4ID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBVVEYtOCBkZWNvZGluZyBzdHJlYW1cbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBpcyBlbmNvZGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gRW5jb2RlVVRGOChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBlbmNvZGVkIHRvIFVURi04XG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBzdHJpbmcgZGF0YSB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEVuY29kZVVURjgucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHRoaXMub25kYXRhKHN0clRvVTgoY2h1bmspLCB0aGlzLmQgPSBmaW5hbCB8fCBmYWxzZSk7XG4gICAgfTtcbiAgICByZXR1cm4gRW5jb2RlVVRGODtcbn0oKSk7XG5leHBvcnQgeyBFbmNvZGVVVEY4IH07XG4vKipcbiAqIENvbnZlcnRzIGEgc3RyaW5nIGludG8gYSBVaW50OEFycmF5IGZvciB1c2Ugd2l0aCBjb21wcmVzc2lvbi9kZWNvbXByZXNzaW9uIG1ldGhvZHNcbiAqIEBwYXJhbSBzdHIgVGhlIHN0cmluZyB0byBlbmNvZGVcbiAqIEBwYXJhbSBsYXRpbjEgV2hldGhlciBvciBub3QgdG8gaW50ZXJwcmV0IHRoZSBkYXRhIGFzIExhdGluLTEuIFRoaXMgc2hvdWxkXG4gKiAgICAgICAgICAgICAgIG5vdCBuZWVkIHRvIGJlIHRydWUgdW5sZXNzIGRlY29kaW5nIGEgYmluYXJ5IHN0cmluZy5cbiAqIEByZXR1cm5zIFRoZSBzdHJpbmcgZW5jb2RlZCBpbiBVVEYtOC9MYXRpbi0xIGJpbmFyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyVG9VOChzdHIsIGxhdGluMSkge1xuICAgIGlmIChsYXRpbjEpIHtcbiAgICAgICAgdmFyIGFyXzEgPSBuZXcgdTgoc3RyLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgYXJfMVtpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICByZXR1cm4gYXJfMTtcbiAgICB9XG4gICAgaWYgKHRlKVxuICAgICAgICByZXR1cm4gdGUuZW5jb2RlKHN0cik7XG4gICAgdmFyIGwgPSBzdHIubGVuZ3RoO1xuICAgIHZhciBhciA9IG5ldyB1OChzdHIubGVuZ3RoICsgKHN0ci5sZW5ndGggPj4gMSkpO1xuICAgIHZhciBhaSA9IDA7XG4gICAgdmFyIHcgPSBmdW5jdGlvbiAodikgeyBhclthaSsrXSA9IHY7IH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKGFpICsgNSA+IGFyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgoYWkgKyA4ICsgKChsIC0gaSkgPDwgMSkpO1xuICAgICAgICAgICAgbi5zZXQoYXIpO1xuICAgICAgICAgICAgYXIgPSBuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMTI4IHx8IGxhdGluMSlcbiAgICAgICAgICAgIHcoYyk7XG4gICAgICAgIGVsc2UgaWYgKGMgPCAyMDQ4KVxuICAgICAgICAgICAgdygxOTIgfCAoYyA+PiA2KSksIHcoMTI4IHwgKGMgJiA2MykpO1xuICAgICAgICBlbHNlIGlmIChjID4gNTUyOTUgJiYgYyA8IDU3MzQ0KVxuICAgICAgICAgICAgYyA9IDY1NTM2ICsgKGMgJiAxMDIzIDw8IDEwKSB8IChzdHIuY2hhckNvZGVBdCgrK2kpICYgMTAyMyksXG4gICAgICAgICAgICAgICAgdygyNDAgfCAoYyA+PiAxOCkpLCB3KDEyOCB8ICgoYyA+PiAxMikgJiA2MykpLCB3KDEyOCB8ICgoYyA+PiA2KSAmIDYzKSksIHcoMTI4IHwgKGMgJiA2MykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3KDIyNCB8IChjID4+IDEyKSksIHcoMTI4IHwgKChjID4+IDYpICYgNjMpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgfVxuICAgIHJldHVybiBzbGMoYXIsIDAsIGFpKTtcbn1cbi8qKlxuICogQ29udmVydHMgYSBVaW50OEFycmF5IHRvIGEgc3RyaW5nXG4gKiBAcGFyYW0gZGF0IFRoZSBkYXRhIHRvIGRlY29kZSB0byBzdHJpbmdcbiAqIEBwYXJhbSBsYXRpbjEgV2hldGhlciBvciBub3QgdG8gaW50ZXJwcmV0IHRoZSBkYXRhIGFzIExhdGluLTEuIFRoaXMgc2hvdWxkXG4gKiAgICAgICAgICAgICAgIG5vdCBuZWVkIHRvIGJlIHRydWUgdW5sZXNzIGVuY29kaW5nIHRvIGJpbmFyeSBzdHJpbmcuXG4gKiBAcmV0dXJucyBUaGUgb3JpZ2luYWwgVVRGLTgvTGF0aW4tMSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0ckZyb21VOChkYXQsIGxhdGluMSkge1xuICAgIGlmIChsYXRpbjEpIHtcbiAgICAgICAgdmFyIHIgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXQubGVuZ3RoOyBpICs9IDE2Mzg0KVxuICAgICAgICAgICAgciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGRhdC5zdWJhcnJheShpLCBpICsgMTYzODQpKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRkKSB7XG4gICAgICAgIHJldHVybiB0ZC5kZWNvZGUoZGF0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBfYSA9IGR1dGY4KGRhdCksIHMgPSBfYS5zLCByID0gX2EucjtcbiAgICAgICAgaWYgKHIubGVuZ3RoKVxuICAgICAgICAgICAgZXJyKDgpO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG59XG47XG4vLyBkZWZsYXRlIGJpdCBmbGFnXG52YXIgZGJmID0gZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGwgPT0gMSA/IDMgOiBsIDwgNiA/IDIgOiBsID09IDkgPyAxIDogMDsgfTtcbi8vIHNraXAgbG9jYWwgemlwIGhlYWRlclxudmFyIHNsemggPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gYiArIDMwICsgYjIoZCwgYiArIDI2KSArIGIyKGQsIGIgKyAyOCk7IH07XG4vLyByZWFkIHppcCBoZWFkZXJcbnZhciB6aCA9IGZ1bmN0aW9uIChkLCBiLCB6KSB7XG4gICAgdmFyIGZubCA9IGIyKGQsIGIgKyAyOCksIGVmbCA9IGIyKGQsIGIgKyAzMCksIGZuID0gc3RyRnJvbVU4KGQuc3ViYXJyYXkoYiArIDQ2LCBiICsgNDYgKyBmbmwpLCAhKGIyKGQsIGIgKyA4KSAmIDIwNDgpKSwgZXMgPSBiICsgNDYgKyBmbmw7XG4gICAgdmFyIF9hID0gejY0aHMoZCwgZXMsIGVmbCwgeiwgYjQoZCwgYiArIDIwKSwgYjQoZCwgYiArIDI0KSwgYjQoZCwgYiArIDQyKSksIHNjID0gX2FbMF0sIHN1ID0gX2FbMV0sIG9mZiA9IF9hWzJdO1xuICAgIHJldHVybiBbYjIoZCwgYiArIDEwKSwgc2MsIHN1LCBmbiwgZXMgKyBlZmwgKyBiMihkLCBiICsgMzIpLCBvZmZdO1xufTtcbi8vIHJlYWQgemlwNjQgaGVhZGVyIHNpemVzXG52YXIgejY0aHMgPSBmdW5jdGlvbiAoZCwgYiwgbCwgeiwgc2MsIHN1LCBvZmYpIHtcbiAgICB2YXIgbnNjID0gc2MgPT0gNDI5NDk2NzI5NSwgbnN1ID0gc3UgPT0gNDI5NDk2NzI5NSwgbm9mZiA9IG9mZiA9PSA0Mjk0OTY3Mjk1LCBlID0gYiArIGw7XG4gICAgdmFyIG5mID0gbnNjICsgbnN1ICsgbm9mZjtcbiAgICBpZiAoeiAmJiBuZikge1xuICAgICAgICBmb3IgKDsgYiArIDQgPCBlOyBiICs9IDQgKyBiMihkLCBiICsgMikpIHtcbiAgICAgICAgICAgIGlmIChiMihkLCBiKSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgbnNjID8gYjgoZCwgYiArIDQgKyA4ICogbnN1KSA6IHNjLFxuICAgICAgICAgICAgICAgICAgICBuc3UgPyBiOChkLCBiICsgNCkgOiBzdSxcbiAgICAgICAgICAgICAgICAgICAgbm9mZiA/IGI4KGQsIGIgKyA0ICsgOCAqIChuc3UgKyBuc2MpKSA6IG9mZixcbiAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8geiA9PSAyIGZvciB1bmtub3duIHdoZXRoZXIgb3Igbm90IHppcDY0XG4gICAgICAgIGlmICh6IDwgMilcbiAgICAgICAgICAgIGVycigxMyk7XG4gICAgfVxuICAgIHJldHVybiBbc2MsIHN1LCBvZmYsIDBdO1xufTtcbi8vIGV4dHJhIGZpZWxkIGxlbmd0aFxudmFyIGV4ZmwgPSBmdW5jdGlvbiAoZXgpIHtcbiAgICB2YXIgbGUgPSAwO1xuICAgIGlmIChleCkge1xuICAgICAgICBmb3IgKHZhciBrIGluIGV4KSB7XG4gICAgICAgICAgICB2YXIgbCA9IGV4W2tdLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChsID4gNjU1MzUpXG4gICAgICAgICAgICAgICAgZXJyKDkpO1xuICAgICAgICAgICAgbGUgKz0gbCArIDQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxlO1xufTtcbi8vIHdyaXRlIHppcCBoZWFkZXJcbnZhciB3emggPSBmdW5jdGlvbiAoZCwgYiwgZiwgZm4sIHUsIGMsIGNlLCBjbykge1xuICAgIHZhciBmbCA9IGZuLmxlbmd0aCwgZXggPSBmLmV4dHJhLCBjb2wgPSBjbyAmJiBjby5sZW5ndGg7XG4gICAgdmFyIGV4bCA9IGV4ZmwoZXgpO1xuICAgIHdieXRlcyhkLCBiLCBjZSAhPSBudWxsID8gMHgyMDE0QjUwIDogMHg0MDM0QjUwKSwgYiArPSA0O1xuICAgIGlmIChjZSAhPSBudWxsKVxuICAgICAgICBkW2IrK10gPSAyMCwgZFtiKytdID0gZi5vcztcbiAgICBkW2JdID0gMjAsIGIgKz0gMjsgLy8gc3BlYyBjb21wbGlhbmNlPyB3aGF0J3MgdGhhdD9cbiAgICBkW2IrK10gPSAoZi5mbGFnIDw8IDEpIHwgKGMgPCAwICYmIDgpLCBkW2IrK10gPSB1ICYmIDg7XG4gICAgZFtiKytdID0gZi5jb21wcmVzc2lvbiAmIDI1NSwgZFtiKytdID0gZi5jb21wcmVzc2lvbiA+PiA4O1xuICAgIHZhciBkdCA9IG5ldyBEYXRlKGYubXRpbWUgPT0gbnVsbCA/IERhdGUubm93KCkgOiBmLm10aW1lKSwgeSA9IGR0LmdldEZ1bGxZZWFyKCkgLSAxOTgwO1xuICAgIGlmICh5IDwgMCB8fCB5ID4gMTE5KVxuICAgICAgICBlcnIoMTApO1xuICAgIHdieXRlcyhkLCBiLCAoeSA8PCAyNSkgfCAoKGR0LmdldE1vbnRoKCkgKyAxKSA8PCAyMSkgfCAoZHQuZ2V0RGF0ZSgpIDw8IDE2KSB8IChkdC5nZXRIb3VycygpIDw8IDExKSB8IChkdC5nZXRNaW51dGVzKCkgPDwgNSkgfCAoZHQuZ2V0U2Vjb25kcygpID4+IDEpKSwgYiArPSA0O1xuICAgIGlmIChjICE9IC0xKSB7XG4gICAgICAgIHdieXRlcyhkLCBiLCBmLmNyYyk7XG4gICAgICAgIHdieXRlcyhkLCBiICsgNCwgYyA8IDAgPyAtYyAtIDIgOiBjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA4LCBmLnNpemUpO1xuICAgIH1cbiAgICB3Ynl0ZXMoZCwgYiArIDEyLCBmbCk7XG4gICAgd2J5dGVzKGQsIGIgKyAxNCwgZXhsKSwgYiArPSAxNjtcbiAgICBpZiAoY2UgIT0gbnVsbCkge1xuICAgICAgICB3Ynl0ZXMoZCwgYiwgY29sKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA2LCBmLmF0dHJzKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyAxMCwgY2UpLCBiICs9IDE0O1xuICAgIH1cbiAgICBkLnNldChmbiwgYik7XG4gICAgYiArPSBmbDtcbiAgICBpZiAoZXhsKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBleGYgPSBleFtrXSwgbCA9IGV4Zi5sZW5ndGg7XG4gICAgICAgICAgICB3Ynl0ZXMoZCwgYiwgK2spO1xuICAgICAgICAgICAgd2J5dGVzKGQsIGIgKyAyLCBsKTtcbiAgICAgICAgICAgIGQuc2V0KGV4ZiwgYiArIDQpLCBiICs9IDQgKyBsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb2wpXG4gICAgICAgIGQuc2V0KGNvLCBiKSwgYiArPSBjb2w7XG4gICAgcmV0dXJuIGI7XG59O1xuLy8gd3JpdGUgemlwIGZvb3RlciAoZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5KVxudmFyIHd6ZiA9IGZ1bmN0aW9uIChvLCBiLCBjLCBkLCBlKSB7XG4gICAgd2J5dGVzKG8sIGIsIDB4NjA1NEI1MCk7IC8vIHNraXAgZGlza1xuICAgIHdieXRlcyhvLCBiICsgOCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMiwgZCk7XG4gICAgd2J5dGVzKG8sIGIgKyAxNiwgZSk7XG59O1xuLyoqXG4gKiBBIHBhc3MtdGhyb3VnaCBzdHJlYW0gdG8ga2VlcCBkYXRhIHVuY29tcHJlc3NlZCBpbiBhIFpJUCBhcmNoaXZlLlxuICovXG52YXIgWmlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHBhc3MtdGhyb3VnaCBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwUGFzc1Rocm91Z2goZmlsZW5hbWUpIHtcbiAgICAgICAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xuICAgICAgICB0aGlzLmMgPSBjcmMoKTtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBhIGNodW5rIGFuZCBwdXNoZXMgdG8gdGhlIG91dHB1dCBzdHJlYW0uIFlvdSBjYW4gb3ZlcnJpZGUgdGhpc1xuICAgICAqIG1ldGhvZCBpbiBhIHN1YmNsYXNzIGZvciBjdXN0b20gYmVoYXZpb3IsIGJ1dCBieSBkZWZhdWx0IHRoaXMgcGFzc2VzXG4gICAgICogdGhlIGRhdGEgdGhyb3VnaC4gWW91IG11c3QgY2FsbCB0aGlzLm9uZGF0YShlcnIsIGNodW5rLCBmaW5hbCkgYXQgc29tZVxuICAgICAqIHBvaW50IGluIHRoaXMgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHJvY2Vzc1xuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGFkZGVkLiBJZiB5b3UgYXJlIHN1YmNsYXNzaW5nIHRoaXMgd2l0aCBhIGN1c3RvbVxuICAgICAqIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgbm90ZSB0aGF0IHlvdSBtdXN0IHB1c2ggZGF0YSBmcm9tIHRoZSBzb3VyY2VcbiAgICAgKiBmaWxlIG9ubHksIHByZS1jb21wcmVzc2lvbi5cbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIHRoaXMuYy5wKGNodW5rKTtcbiAgICAgICAgdGhpcy5zaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgaWYgKGZpbmFsKVxuICAgICAgICAgICAgdGhpcy5jcmMgPSB0aGlzLmMuZCgpO1xuICAgICAgICAvLyB3ZSBzaG91bGRuJ3QgcmVhbGx5IGRvIHRoaXMgY2FzdCwgYnV0IHByb3Blcmx5IGhhbmRsaW5nIEFycmF5QnVmZmVyTGlrZVxuICAgICAgICAvLyBtYWtlcyB0aGUgQVBJIHVuZXJnb25vbWljIHdpdGggQnVmZmVyXG4gICAgICAgIHRoaXMucHJvY2VzcyhjaHVuaywgZmluYWwgfHwgZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIFppcFBhc3NUaHJvdWdoO1xufSgpKTtcbmV4cG9ydCB7IFppcFBhc3NUaHJvdWdoIH07XG4vLyBJIGRvbid0IGV4dGVuZCBiZWNhdXNlIFR5cGVTY3JpcHQgZXh0ZW5zaW9uIGFkZHMgMWtCIG9mIHJ1bnRpbWUgYmxvYXRcbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlcy4gUHJlZmVyIHVzaW5nIEFzeW5jWmlwRGVmbGF0ZVxuICogZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICovXG52YXIgWmlwRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgREVGTEFURSBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBaaXBEZWZsYXRlKGZpbGVuYW1lLCBvcHRzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghb3B0cylcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgWmlwUGFzc1Rocm91Z2guY2FsbCh0aGlzLCBmaWxlbmFtZSk7XG4gICAgICAgIHRoaXMuZCA9IG5ldyBEZWZsYXRlKG9wdHMsIGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uID0gODtcbiAgICAgICAgdGhpcy5mbGFnID0gZGJmKG9wdHMubGV2ZWwpO1xuICAgIH1cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5kLnB1c2goY2h1bmssIGZpbmFsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZSwgbnVsbCwgZmluYWwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBaaXBEZWZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBBc3luY1ppcERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgREVGTEFURSBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBBc3luY1ppcERlZmxhdGUoZmlsZW5hbWUsIG9wdHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCFvcHRzKVxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5jYWxsKHRoaXMsIGZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5kID0gbmV3IEFzeW5jRGVmbGF0ZShvcHRzLCBmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEoZXJyLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29tcHJlc3Npb24gPSA4O1xuICAgICAgICB0aGlzLmZsYWcgPSBkYmYob3B0cy5sZXZlbCk7XG4gICAgICAgIHRoaXMudGVybWluYXRlID0gdGhpcy5kLnRlcm1pbmF0ZTtcbiAgICB9XG4gICAgQXN5bmNaaXBEZWZsYXRlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmQucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVmbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgQXN5bmNaaXBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNaaXBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jWmlwRGVmbGF0ZSB9O1xuLy8gVE9ETzogQmV0dGVyIHRyZWUgc2hha2luZ1xuLyoqXG4gKiBBIHppcHBhYmxlIGFyY2hpdmUgdG8gd2hpY2ggZmlsZXMgY2FuIGluY3JlbWVudGFsbHkgYmUgYWRkZWRcbiAqL1xudmFyIFppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IFpJUCBhcmNoaXZlIHRvIHdoaWNoIGZpbGVzIGNhbiBiZSBhZGRlZFxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGZvciB0aGUgZ2VuZXJhdGVkIFpJUCBhcmNoaXZlXG4gICAgICogICAgICAgICAgIGlzIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFppcChjYikge1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB0aGlzLnUgPSBbXTtcbiAgICAgICAgdGhpcy5kID0gMTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZpbGUgdG8gdGhlIFpJUCBhcmNoaXZlXG4gICAgICogQHBhcmFtIGZpbGUgVGhlIGZpbGUgc3RyZWFtIHRvIGFkZFxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgLy8gZmluaXNoaW5nIG9yIGZpbmlzaGVkXG4gICAgICAgIGlmICh0aGlzLmQgJiAyKVxuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZXJyKDQgKyAodGhpcy5kICYgMSkgKiA4LCAwLCAxKSwgbnVsbCwgZmFsc2UpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBmID0gc3RyVG9VOChmaWxlLmZpbGVuYW1lKSwgZmxfMSA9IGYubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGNvbSA9IGZpbGUuY29tbWVudCwgbyA9IGNvbSAmJiBzdHJUb1U4KGNvbSk7XG4gICAgICAgICAgICB2YXIgdSA9IGZsXzEgIT0gZmlsZS5maWxlbmFtZS5sZW5ndGggfHwgKG8gJiYgKGNvbS5sZW5ndGggIT0gby5sZW5ndGgpKTtcbiAgICAgICAgICAgIHZhciBobF8xID0gZmxfMSArIGV4ZmwoZmlsZS5leHRyYSkgKyAzMDtcbiAgICAgICAgICAgIGlmIChmbF8xID4gNjU1MzUpXG4gICAgICAgICAgICAgICAgdGhpcy5vbmRhdGEoZXJyKDExLCAwLCAxKSwgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IG5ldyB1OChobF8xKTtcbiAgICAgICAgICAgIHd6aChoZWFkZXIsIDAsIGZpbGUsIGYsIHUsIC0xKTtcbiAgICAgICAgICAgIHZhciBjaGtzXzEgPSBbaGVhZGVyXTtcbiAgICAgICAgICAgIHZhciBwQWxsXzEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjaGtzXzIgPSBjaGtzXzE7IF9pIDwgY2hrc18yLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hrID0gY2hrc18yW19pXTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMub25kYXRhKG51bGwsIGNoaywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjaGtzXzEgPSBbXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdHJfMSA9IHRoaXMuZDtcbiAgICAgICAgICAgIHRoaXMuZCA9IDA7XG4gICAgICAgICAgICB2YXIgaW5kXzEgPSB0aGlzLnUubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHVmXzEgPSBtcmcoZmlsZSwge1xuICAgICAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICAgICAgdTogdSxcbiAgICAgICAgICAgICAgICBvOiBvLFxuICAgICAgICAgICAgICAgIHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUudGVybWluYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcEFsbF8xKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cl8xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnh0ID0gX3RoaXMudVtpbmRfMSArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG54dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueHQucigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmQgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyXzEgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGNsXzEgPSAwO1xuICAgICAgICAgICAgZmlsZS5vbmRhdGEgPSBmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEoZXJyLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbF8xICs9IGRhdC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNoa3NfMS5wdXNoKGRhdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRkID0gbmV3IHU4KDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgMCwgMHg4MDc0QjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgNCwgZmlsZS5jcmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCA4LCBjbF8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgMTIsIGZpbGUuc2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGtzXzEucHVzaChkZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1Zl8xLmMgPSBjbF8xLCB1Zl8xLmIgPSBobF8xICsgY2xfMSArIDE2LCB1Zl8xLmNyYyA9IGZpbGUuY3JjLCB1Zl8xLnNpemUgPSBmaWxlLnNpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1Zl8xLnIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyXzEgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRyXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICBwQWxsXzEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy51LnB1c2godWZfMSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIHByb2Nlc3Mgb2YgYWRkaW5nIGZpbGVzIGFuZCBwcmVwYXJlcyB0byBlbWl0IHRoZSBmaW5hbCBjaHVua3MuXG4gICAgICogVGhpcyAqbXVzdCogYmUgY2FsbGVkIGFmdGVyIGFkZGluZyBhbGwgZGVzaXJlZCBmaWxlcyBmb3IgdGhlIHJlc3VsdGluZ1xuICAgICAqIFpJUCBmaWxlIHRvIHdvcmsgcHJvcGVybHkuXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLmQgJiAyKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlcnIoNCArICh0aGlzLmQgJiAxKSAqIDgsIDAsIDEpLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kKVxuICAgICAgICAgICAgdGhpcy5lKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMudS5wdXNoKHtcbiAgICAgICAgICAgICAgICByOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghKF90aGlzLmQgJiAxKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudS5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5lKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0OiBmdW5jdGlvbiAoKSB7IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmQgPSAzO1xuICAgIH07XG4gICAgWmlwLnByb3RvdHlwZS5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYnQgPSAwLCBsID0gMCwgdGwgPSAwO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy51OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfYVtfaV07XG4gICAgICAgICAgICB0bCArPSA0NiArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpICsgKGYubyA/IGYuby5sZW5ndGggOiAwKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3V0ID0gbmV3IHU4KHRsICsgMjIpO1xuICAgICAgICBmb3IgKHZhciBfYiA9IDAsIF9jID0gdGhpcy51OyBfYiA8IF9jLmxlbmd0aDsgX2IrKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfY1tfYl07XG4gICAgICAgICAgICB3emgob3V0LCBidCwgZiwgZi5mLCBmLnUsIC1mLmMgLSAyLCBsLCBmLm8pO1xuICAgICAgICAgICAgYnQgKz0gNDYgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKSArIChmLm8gPyBmLm8ubGVuZ3RoIDogMCksIGwgKz0gZi5iO1xuICAgICAgICB9XG4gICAgICAgIHd6ZihvdXQsIGJ0LCB0aGlzLnUubGVuZ3RoLCB0bCwgbCk7XG4gICAgICAgIHRoaXMub25kYXRhKG51bGwsIG91dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZCA9IDI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBIG1ldGhvZCB0byB0ZXJtaW5hdGUgYW55IGludGVybmFsIHdvcmtlcnMgdXNlZCBieSB0aGUgc3RyZWFtLiBTdWJzZXF1ZW50XG4gICAgICogY2FsbHMgdG8gYWRkKCkgd2lsbCBmYWlsLlxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUudGVybWluYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy51OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGYgPSBfYVtfaV07XG4gICAgICAgICAgICBmLnQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmQgPSAyO1xuICAgIH07XG4gICAgcmV0dXJuIFppcDtcbn0oKSk7XG5leHBvcnQgeyBaaXAgfTtcbmV4cG9ydCBmdW5jdGlvbiB6aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICB2YXIgciA9IHt9O1xuICAgIGZsdG4oZGF0YSwgJycsIHIsIG9wdHMpO1xuICAgIHZhciBrID0gT2JqZWN0LmtleXMocik7XG4gICAgdmFyIGxmdCA9IGsubGVuZ3RoLCBvID0gMCwgdG90ID0gMDtcbiAgICB2YXIgc2xmdCA9IGxmdCwgZmlsZXMgPSBuZXcgQXJyYXkobGZ0KTtcbiAgICB2YXIgdGVybSA9IFtdO1xuICAgIHZhciB0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlcm0ubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICB0ZXJtW2ldKCk7XG4gICAgfTtcbiAgICB2YXIgY2JkID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgbXQoZnVuY3Rpb24gKCkgeyBjYihhLCBiKTsgfSk7XG4gICAgfTtcbiAgICBtdChmdW5jdGlvbiAoKSB7IGNiZCA9IGNiOyB9KTtcbiAgICB2YXIgY2JmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3V0ID0gbmV3IHU4KHRvdCArIDIyKSwgb2UgPSBvLCBjZGwgPSB0b3QgLSBvO1xuICAgICAgICB0b3QgPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsZnQ7ICsraSkge1xuICAgICAgICAgICAgdmFyIGYgPSBmaWxlc1tpXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIGwgPSBmLmMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHd6aChvdXQsIHRvdCwgZiwgZi5mLCBmLnUsIGwpO1xuICAgICAgICAgICAgICAgIHZhciBiYWRkID0gMzAgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKTtcbiAgICAgICAgICAgICAgICB2YXIgbG9jID0gdG90ICsgYmFkZDtcbiAgICAgICAgICAgICAgICBvdXQuc2V0KGYuYywgbG9jKTtcbiAgICAgICAgICAgICAgICB3emgob3V0LCBvLCBmLCBmLmYsIGYudSwgbCwgdG90LCBmLm0pLCBvICs9IDE2ICsgYmFkZCArIChmLm0gPyBmLm0ubGVuZ3RoIDogMCksIHRvdCA9IGxvYyArIGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYmQoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd3pmKG91dCwgbywgZmlsZXMubGVuZ3RoLCBjZGwsIG9lKTtcbiAgICAgICAgY2JkKG51bGwsIG91dCk7XG4gICAgfTtcbiAgICBpZiAoIWxmdClcbiAgICAgICAgY2JmKCk7XG4gICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgZm4gPSBrW2ldO1xuICAgICAgICB2YXIgX2EgPSByW2ZuXSwgZmlsZSA9IF9hWzBdLCBwID0gX2FbMV07XG4gICAgICAgIHZhciBjID0gY3JjKCksIHNpemUgPSBmaWxlLmxlbmd0aDtcbiAgICAgICAgYy5wKGZpbGUpO1xuICAgICAgICB2YXIgZiA9IHN0clRvVTgoZm4pLCBzID0gZi5sZW5ndGg7XG4gICAgICAgIHZhciBjb20gPSBwLmNvbW1lbnQsIG0gPSBjb20gJiYgc3RyVG9VOChjb20pLCBtcyA9IG0gJiYgbS5sZW5ndGg7XG4gICAgICAgIHZhciBleGwgPSBleGZsKHAuZXh0cmEpO1xuICAgICAgICB2YXIgY29tcHJlc3Npb24gPSBwLmxldmVsID09IDAgPyAwIDogODtcbiAgICAgICAgdmFyIGNibCA9IGZ1bmN0aW9uIChlLCBkKSB7XG4gICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgIHRBbGwoKTtcbiAgICAgICAgICAgICAgICBjYmQoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbCA9IGQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZpbGVzW2ldID0gbXJnKHAsIHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgY3JjOiBjLmQoKSxcbiAgICAgICAgICAgICAgICAgICAgYzogZCxcbiAgICAgICAgICAgICAgICAgICAgZjogZixcbiAgICAgICAgICAgICAgICAgICAgbTogbSxcbiAgICAgICAgICAgICAgICAgICAgdTogcyAhPSBmbi5sZW5ndGggfHwgKG0gJiYgKGNvbS5sZW5ndGggIT0gbXMpKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcHJlc3Npb246IGNvbXByZXNzaW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbyArPSAzMCArIHMgKyBleGwgKyBsO1xuICAgICAgICAgICAgICAgIHRvdCArPSA3NiArIDIgKiAocyArIGV4bCkgKyAobXMgfHwgMCkgKyBsO1xuICAgICAgICAgICAgICAgIGlmICghLS1sZnQpXG4gICAgICAgICAgICAgICAgICAgIGNiZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAocyA+IDY1NTM1KVxuICAgICAgICAgICAgY2JsKGVycigxMSwgMCwgMSksIG51bGwpO1xuICAgICAgICBpZiAoIWNvbXByZXNzaW9uKVxuICAgICAgICAgICAgY2JsKG51bGwsIGZpbGUpO1xuICAgICAgICBlbHNlIGlmIChzaXplIDwgMTYwMDAwKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNibChudWxsLCBkZWZsYXRlU3luYyhmaWxlLCBwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNibChlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZXJtLnB1c2goZGVmbGF0ZShmaWxlLCBwLCBjYmwpKTtcbiAgICB9O1xuICAgIC8vIENhbm5vdCB1c2UgbGZ0IGJlY2F1c2UgaXQgY2FuIGRlY3JlYXNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGZ0OyArK2kpIHtcbiAgICAgICAgX2xvb3BfMShpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRBbGw7XG59XG4vKipcbiAqIFN5bmNocm9ub3VzbHkgY3JlYXRlcyBhIFpJUCBmaWxlLiBQcmVmZXIgdXNpbmcgYHppcGAgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICogd2l0aCBtb3JlIHRoYW4gb25lIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGlyZWN0b3J5IHN0cnVjdHVyZSBmb3IgdGhlIFpJUCBhcmNoaXZlXG4gKiBAcGFyYW0gb3B0cyBUaGUgbWFpbiBvcHRpb25zLCBtZXJnZWQgd2l0aCBwZXItZmlsZSBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZ2VuZXJhdGVkIFpJUCBhcmNoaXZlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6aXBTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgciA9IHt9O1xuICAgIHZhciBmaWxlcyA9IFtdO1xuICAgIGZsdG4oZGF0YSwgJycsIHIsIG9wdHMpO1xuICAgIHZhciBvID0gMDtcbiAgICB2YXIgdG90ID0gMDtcbiAgICBmb3IgKHZhciBmbiBpbiByKSB7XG4gICAgICAgIHZhciBfYSA9IHJbZm5dLCBmaWxlID0gX2FbMF0sIHAgPSBfYVsxXTtcbiAgICAgICAgdmFyIGNvbXByZXNzaW9uID0gcC5sZXZlbCA9PSAwID8gMCA6IDg7XG4gICAgICAgIHZhciBmID0gc3RyVG9VOChmbiksIHMgPSBmLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbSA9IHAuY29tbWVudCwgbSA9IGNvbSAmJiBzdHJUb1U4KGNvbSksIG1zID0gbSAmJiBtLmxlbmd0aDtcbiAgICAgICAgdmFyIGV4bCA9IGV4ZmwocC5leHRyYSk7XG4gICAgICAgIGlmIChzID4gNjU1MzUpXG4gICAgICAgICAgICBlcnIoMTEpO1xuICAgICAgICB2YXIgZCA9IGNvbXByZXNzaW9uID8gZGVmbGF0ZVN5bmMoZmlsZSwgcCkgOiBmaWxlLCBsID0gZC5sZW5ndGg7XG4gICAgICAgIHZhciBjID0gY3JjKCk7XG4gICAgICAgIGMucChmaWxlKTtcbiAgICAgICAgZmlsZXMucHVzaChtcmcocCwge1xuICAgICAgICAgICAgc2l6ZTogZmlsZS5sZW5ndGgsXG4gICAgICAgICAgICBjcmM6IGMuZCgpLFxuICAgICAgICAgICAgYzogZCxcbiAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICBtOiBtLFxuICAgICAgICAgICAgdTogcyAhPSBmbi5sZW5ndGggfHwgKG0gJiYgKGNvbS5sZW5ndGggIT0gbXMpKSxcbiAgICAgICAgICAgIG86IG8sXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogY29tcHJlc3Npb25cbiAgICAgICAgfSkpO1xuICAgICAgICBvICs9IDMwICsgcyArIGV4bCArIGw7XG4gICAgICAgIHRvdCArPSA3NiArIDIgKiAocyArIGV4bCkgKyAobXMgfHwgMCkgKyBsO1xuICAgIH1cbiAgICB2YXIgb3V0ID0gbmV3IHU4KHRvdCArIDIyKSwgb2UgPSBvLCBjZGwgPSB0b3QgLSBvO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGYgPSBmaWxlc1tpXTtcbiAgICAgICAgd3poKG91dCwgZi5vLCBmLCBmLmYsIGYudSwgZi5jLmxlbmd0aCk7XG4gICAgICAgIHZhciBiYWRkID0gMzAgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKTtcbiAgICAgICAgb3V0LnNldChmLmMsIGYubyArIGJhZGQpO1xuICAgICAgICB3emgob3V0LCBvLCBmLCBmLmYsIGYudSwgZi5jLmxlbmd0aCwgZi5vLCBmLm0pLCBvICs9IDE2ICsgYmFkZCArIChmLm0gPyBmLm0ubGVuZ3RoIDogMCk7XG4gICAgfVxuICAgIHd6ZihvdXQsIG8sIGZpbGVzLmxlbmd0aCwgY2RsLCBvZSk7XG4gICAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU3RyZWFtaW5nIHBhc3MtdGhyb3VnaCBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXNcbiAqL1xudmFyIFVuemlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVW56aXBQYXNzVGhyb3VnaCgpIHtcbiAgICB9XG4gICAgVW56aXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgLy8gc2FtZSBhcyBaaXBQYXNzVGhyb3VnaDogY2FzdCB0byByZXRhaW4gQnVmZmVyIGVyZ29ub21pY3NcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIFVuemlwUGFzc1Rocm91Z2guY29tcHJlc3Npb24gPSAwO1xuICAgIHJldHVybiBVbnppcFBhc3NUaHJvdWdoO1xufSgpKTtcbmV4cG9ydCB7IFVuemlwUGFzc1Rocm91Z2ggfTtcbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzLiBQcmVmZXIgQXN5bmNaaXBJbmZsYXRlIGZvclxuICogYmV0dGVyIHBlcmZvcm1hbmNlLlxuICovXG52YXIgVW56aXBJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBERUZMQVRFIGRlY29tcHJlc3Npb24gdGhhdCBjYW4gYmUgdXNlZCBpbiBaSVAgYXJjaGl2ZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBVbnppcEluZmxhdGUoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuaSA9IG5ldyBJbmZsYXRlKGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmkucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlLCBudWxsLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFVuemlwSW5mbGF0ZS5jb21wcmVzc2lvbiA9IDg7XG4gICAgcmV0dXJuIFVuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBVbnppcEluZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlc1xuICovXG52YXIgQXN5bmNVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFzeW5jVW56aXBJbmZsYXRlKF8sIHN6KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmIChzeiA8IDMyMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaSA9IG5ldyBBc3luY0luZmxhdGUoZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnRlcm1pbmF0ZSA9IHRoaXMuaS50ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXN5bmNVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmkudGVybWluYXRlKVxuICAgICAgICAgICAgY2h1bmsgPSBzbGMoY2h1bmssIDApO1xuICAgICAgICB0aGlzLmkucHVzaChjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgQXN5bmNVbnppcEluZmxhdGUuY29tcHJlc3Npb24gPSA4O1xuICAgIHJldHVybiBBc3luY1VuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1VuemlwSW5mbGF0ZSB9O1xuLyoqXG4gKiBBIFpJUCBhcmNoaXZlIGRlY29tcHJlc3Npb24gc3RyZWFtIHRoYXQgZW1pdHMgZmlsZXMgYXMgdGhleSBhcmUgZGlzY292ZXJlZFxuICovXG52YXIgVW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFpJUCBkZWNvbXByZXNzaW9uIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBhIGZpbGUgaW4gdGhlIFpJUCBhcmNoaXZlIGlzIGZvdW5kXG4gICAgICovXG4gICAgZnVuY3Rpb24gVW56aXAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmZpbGUgPSBjYjtcbiAgICAgICAgdGhpcy5rID0gW107XG4gICAgICAgIHRoaXMubyA9IHtcbiAgICAgICAgICAgIDA6IFVuemlwUGFzc1Rocm91Z2hcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHVuemlwcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMub25maWxlKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAoIXRoaXMucClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgaWYgKHRoaXMuYyA+IDApIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBNYXRoLm1pbih0aGlzLmMsIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgdG9BZGQgPSBjaHVuay5zdWJhcnJheSgwLCBsZW4pO1xuICAgICAgICAgICAgdGhpcy5jIC09IGxlbjtcbiAgICAgICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICAgICAgdGhpcy5kLnB1c2godG9BZGQsICF0aGlzLmMpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMua1swXS5wdXNoKHRvQWRkKTtcbiAgICAgICAgICAgIGNodW5rID0gY2h1bmsuc3ViYXJyYXkobGVuKTtcbiAgICAgICAgICAgIGlmIChjaHVuay5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGYgPSAwLCBpID0gMCwgaXMgPSB2b2lkIDAsIGJ1ZiA9IHZvaWQgMDtcbiAgICAgICAgICAgIGlmICghdGhpcy5wLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidWYgPSBjaHVuaztcbiAgICAgICAgICAgIGVsc2UgaWYgKCFjaHVuay5sZW5ndGgpXG4gICAgICAgICAgICAgICAgYnVmID0gdGhpcy5wO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYnVmID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjaHVuay5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGJ1Zi5zZXQodGhpcy5wKSwgYnVmLnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbCA9IGJ1Zi5sZW5ndGgsIG9jID0gdGhpcy5jLCBhZGQgPSBvYyAmJiB0aGlzLmQ7XG4gICAgICAgICAgICB2YXIgX2xvb3BfMiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2lnID0gYjQoYnVmLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4NDAzNEI1MCkge1xuICAgICAgICAgICAgICAgICAgICBmID0gMSwgaXMgPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzXzEuZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJmID0gYjIoYnVmLCBpICsgNiksIGNtcF8xID0gYjIoYnVmLCBpICsgOCksIHUgPSBiZiAmIDIwNDgsIGRkID0gYmYgJiA4LCBmbmwgPSBiMihidWYsIGkgKyAyNiksIGVzID0gYjIoYnVmLCBpICsgMjgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobCA+IGkgKyAzMCArIGZubCArIGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hrc18zID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuay51bnNoaWZ0KGNoa3NfMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsc2MgPSBiNChidWYsIGkgKyAxOCksIGxzdSA9IGI0KGJ1ZiwgaSArIDIyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbl8xID0gc3RyRnJvbVU4KGJ1Zi5zdWJhcnJheShpICsgMzAsIGkgKz0gMzAgKyBmbmwpLCAhdSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2EgPSB6NjRocyhidWYsIGksIGVzLCAyLCBsc2MsIGxzdSwgMCksIHNjXzEgPSBfYVswXSwgc3VfMSA9IF9hWzFdLCB6NjQgPSBfYVszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY18xID0gLTEgLSB6NjQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmMgPSBzY18xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZm5fMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2lvbjogY21wXzEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlXzEub25kYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNjXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKG51bGwsIGV0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3RyID0gX3RoaXMub1tjbXBfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY21wXzEsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEgPSBzY18xIDwgMCA/IG5ldyBjdHIoZm5fMSkgOiBuZXcgY3RyKGZuXzEsIHNjXzEsIHN1XzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZF8xLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHsgZmlsZV8xLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpOyB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjaGtzXzQgPSBjaGtzXzM7IF9pIDwgY2hrc180Lmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXQgPSBjaGtzXzRbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS5wdXNoKGRhdCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmtbMF0gPT0gY2hrc18zICYmIF90aGlzLmMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZCA9IGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEucHVzaChldCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZF8xICYmIGRfMS50ZXJtaW5hdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY18xID49IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZV8xLnNpemUgPSBzY18xLCBmaWxlXzEub3JpZ2luYWxTaXplID0gc3VfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5vbmZpbGUoZmlsZV8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4ODA3NEI1MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXMgPSBpICs9IDEyICsgKG9jID09IC0yICYmIDgpLCBmID0gMywgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzaWcgPT0gMHgyMDE0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcyA9IGkgLT0gNCwgZiA9IDMsIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRoaXNfMSA9IHRoaXM7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IGwgLSA0OyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGVfMSA9IF9sb29wXzIoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVfMSA9PT0gXCJicmVha1wiKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucCA9IGV0O1xuICAgICAgICAgICAgaWYgKG9jIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXQgPSBmID8gYnVmLnN1YmFycmF5KDAsIGlzIC0gMTIgLSAob2MgPT0gLTIgJiYgOCkgLSAoYjQoYnVmLCBpcyAtIDE2KSA9PSAweDgwNzRCNTAgJiYgNCkpIDogYnVmLnN1YmFycmF5KDAsIGkpO1xuICAgICAgICAgICAgICAgIGlmIChhZGQpXG4gICAgICAgICAgICAgICAgICAgIGFkZC5wdXNoKGRhdCwgISFmKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua1srKGYgPT0gMildLnB1c2goZGF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmICYgMilcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGJ1Zi5zdWJhcnJheShpKSwgZmluYWwpO1xuICAgICAgICAgICAgdGhpcy5wID0gYnVmLnN1YmFycmF5KGkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYylcbiAgICAgICAgICAgICAgICBlcnIoMTMpO1xuICAgICAgICAgICAgdGhpcy5wID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgZGVjb2RlciB3aXRoIHRoZSBzdHJlYW0sIGFsbG93aW5nIGZvciBmaWxlcyBjb21wcmVzc2VkIHdpdGhcbiAgICAgKiB0aGUgY29tcHJlc3Npb24gdHlwZSBwcm92aWRlZCB0byBiZSBleHBhbmRlZCBjb3JyZWN0bHlcbiAgICAgKiBAcGFyYW0gZGVjb2RlciBUaGUgZGVjb2RlciBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChkZWNvZGVyKSB7XG4gICAgICAgIHRoaXMub1tkZWNvZGVyLmNvbXByZXNzaW9uXSA9IGRlY29kZXI7XG4gICAgfTtcbiAgICByZXR1cm4gVW56aXA7XG59KCkpO1xuZXhwb3J0IHsgVW56aXAgfTtcbnZhciBtdCA9IHR5cGVvZiBxdWV1ZU1pY3JvdGFzayA9PSAnZnVuY3Rpb24nID8gcXVldWVNaWNyb3Rhc2sgOiB0eXBlb2Ygc2V0VGltZW91dCA9PSAnZnVuY3Rpb24nID8gc2V0VGltZW91dCA6IGZ1bmN0aW9uIChmbikgeyBmbigpOyB9O1xuZXhwb3J0IGZ1bmN0aW9uIHVuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgdmFyIHRlcm0gPSBbXTtcbiAgICB2YXIgdEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgdGVybVtpXSgpO1xuICAgIH07XG4gICAgdmFyIGZpbGVzID0ge307XG4gICAgdmFyIGNiZCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIG10KGZ1bmN0aW9uICgpIHsgY2IoYSwgYik7IH0pO1xuICAgIH07XG4gICAgbXQoZnVuY3Rpb24gKCkgeyBjYmQgPSBjYjsgfSk7XG4gICAgdmFyIGUgPSBkYXRhLmxlbmd0aCAtIDIyO1xuICAgIGZvciAoOyBiNChkYXRhLCBlKSAhPSAweDYwNTRCNTA7IC0tZSkge1xuICAgICAgICBpZiAoIWUgfHwgZGF0YS5sZW5ndGggLSBlID4gNjU1NTgpIHtcbiAgICAgICAgICAgIGNiZChlcnIoMTMsIDAsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybiB0QWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICB2YXIgbGZ0ID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmIChsZnQpIHtcbiAgICAgICAgdmFyIGMgPSBsZnQ7XG4gICAgICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICAgICAgdmFyIHogPSBiNChkYXRhLCBlIC0gMjApID09IDB4NzA2NEI1MDtcbiAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgICAgICB6ID0gYjQoZGF0YSwgemUpID09IDB4NjA2NEI1MDtcbiAgICAgICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICAgICAgYyA9IGxmdCA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgICAgIG8gPSBiNChkYXRhLCB6ZSArIDQ4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmx0ciA9IG9wdHMgJiYgb3B0cy5maWx0ZXI7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IHpoKGRhdGEsIG8sIHopLCBjXzEgPSBfYVswXSwgc2MgPSBfYVsxXSwgc3UgPSBfYVsyXSwgZm4gPSBfYVszXSwgbm8gPSBfYVs0XSwgb2ZmID0gX2FbNV0sIGIgPSBzbHpoKGRhdGEsIG9mZik7XG4gICAgICAgICAgICBvID0gbm87XG4gICAgICAgICAgICB2YXIgY2JsID0gZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWxmdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiZChudWxsLCBmaWxlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBmbixcbiAgICAgICAgICAgICAgICBzaXplOiBzYyxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjXzFcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjXzEpXG4gICAgICAgICAgICAgICAgICAgIGNibChudWxsLCBzbGMoZGF0YSwgYiwgYiArIHNjKSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY18xID09IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZmwgPSBkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN5bmNocm9ub3VzbHkgZGVjb21wcmVzcyB1bmRlciA1MTJLQiwgb3IgYmFyZWx5LWNvbXByZXNzZWQgZGF0YVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3UgPCA1MjQyODggfHwgc2MgPiAwLjggKiBzdSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwobnVsbCwgaW5mbGF0ZVN5bmMoaW5mbCwgeyBvdXQ6IG5ldyB1OChzdSkgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwoZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGVybS5wdXNoKGluZmxhdGUoaW5mbCwgeyBzaXplOiBzdSB9LCBjYmwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjYmwoZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjXzEsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYmwobnVsbCwgbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYzsgKytpKSB7XG4gICAgICAgICAgICBfbG9vcF8zKGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgY2JkKG51bGwsIHt9KTtcbiAgICByZXR1cm4gdEFsbDtcbn1cbi8qKlxuICogU3luY2hyb25vdXNseSBkZWNvbXByZXNzZXMgYSBaSVAgYXJjaGl2ZS4gUHJlZmVyIHVzaW5nIGB1bnppcGAgZm9yIGJldHRlclxuICogcGVyZm9ybWFuY2Ugd2l0aCBtb3JlIHRoYW4gb25lIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSBUaGUgcmF3IGNvbXByZXNzZWQgWklQIGZpbGVcbiAqIEBwYXJhbSBvcHRzIFRoZSBaSVAgZXh0cmFjdGlvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZGVjb21wcmVzc2VkIGZpbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIHZhciBmaWxlcyA9IHt9O1xuICAgIHZhciBlID0gZGF0YS5sZW5ndGggLSAyMjtcbiAgICBmb3IgKDsgYjQoZGF0YSwgZSkgIT0gMHg2MDU0QjUwOyAtLWUpIHtcbiAgICAgICAgaWYgKCFlIHx8IGRhdGEubGVuZ3RoIC0gZSA+IDY1NTU4KVxuICAgICAgICAgICAgZXJyKDEzKTtcbiAgICB9XG4gICAgO1xuICAgIHZhciBjID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmICghYylcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICB2YXIgeiA9IGI0KGRhdGEsIGUgLSAyMCkgPT0gMHg3MDY0QjUwO1xuICAgIGlmICh6KSB7XG4gICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgIHogPSBiNChkYXRhLCB6ZSkgPT0gMHg2MDY0QjUwO1xuICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgYyA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgbyA9IGI0KGRhdGEsIHplICsgNDgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBmbHRyID0gb3B0cyAmJiBvcHRzLmZpbHRlcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGM7ICsraSkge1xuICAgICAgICB2YXIgX2EgPSB6aChkYXRhLCBvLCB6KSwgY18yID0gX2FbMF0sIHNjID0gX2FbMV0sIHN1ID0gX2FbMl0sIGZuID0gX2FbM10sIG5vID0gX2FbNF0sIG9mZiA9IF9hWzVdLCBiID0gc2x6aChkYXRhLCBvZmYpO1xuICAgICAgICBvID0gbm87XG4gICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgIG5hbWU6IGZuLFxuICAgICAgICAgICAgc2l6ZTogc2MsXG4gICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgY29tcHJlc3Npb246IGNfMlxuICAgICAgICB9KSkge1xuICAgICAgICAgICAgaWYgKCFjXzIpXG4gICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gc2xjKGRhdGEsIGIsIGIgKyBzYyk7XG4gICAgICAgICAgICBlbHNlIGlmIChjXzIgPT0gOClcbiAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBpbmZsYXRlU3luYyhkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyksIHsgb3V0OiBuZXcgdTgoc3UpIH0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY18yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmlsZXM7XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBEYXRhQWRhcHRlciwgbm9ybWFsaXplUGF0aCwgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IFZhdWx0U3RvcmFnZSB9IGZyb20gJy4uL3N0b3JhZ2UvVmF1bHRTdG9yYWdlJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB0eXBlIHsgQmFtYm9vUmV2aWV3U2V0dGluZ3MsIE5vaXNlSXRlbSB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcbmltcG9ydCB7IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUywgTUlNRV9UWVBFUyB9IGZyb20gJy4uL2NvbnN0YW50cy9hdWRpbyc7XG5pbXBvcnQgdHlwZSB7IERheURhdGEgfSBmcm9tICcuLi90eXBlcy9kYXRhJztcbmltcG9ydCB7IFBST1RPQ09MX1ZFUlNJT04sIElOQk9VTkRfUFJFRklYRVMgfSBmcm9tICcuL3Byb3RvY29sJztcblxuLyoqIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1OEZEMFx1ODg0Q1x1NjVGNlx1NkNFOFx1NTE2NVx1NzY4NFx1NEUzQlx1N0E5N1x1NTNFMyBkb2N1bWVudFx1RkYwOFx1OTc1RVx1NjNEMlx1NEVGNlx1NkM5OVx1N0JCMVx1NTE4NVx1NzY4NCBkb2N1bWVudFx1RkYwOSAqL1xuZGVjbGFyZSBjb25zdCBhY3RpdmVEb2N1bWVudDogRG9jdW1lbnQ7XG5cbi8qKiBcdTYyNkJcdTYzQ0ZcdTk3RjNcdTk4OTFcdTY1RjZcdTlFRDhcdThCQTRcdThERjNcdThGQzdcdTc2ODRcdTc2RUVcdTVGNTVcdTU0MEQgKi9cbmNvbnN0IFNLSVBfRElSUyA9IFsnLnRyYXNoJywgJy5naXQnLCAnbm9kZV9tb2R1bGVzJ107XG5cbi8qKlxuICogXHU2ODIxXHU5QThDXHU5N0YzXHU2RTkwXHU0RUUzXHU3NDA2IFVSTFx1RkYxQVx1NEVDNVx1NTE0MVx1OEJCOCBodHRwL2h0dHBzIFx1NTM0Rlx1OEJBRVx1RkYwQ1x1OTY1MFx1NTIzNlx1OTU3Rlx1NUVBNlx1RkYwQ1xuICogXHU5NjMyXHU2QjYyIGBhcHA6cHJveHlBdWRpb1VybGAgXHU2MjEwXHU0RTNBXHU4RkQwXHU4ODRDXHU1NzI4XHU3NTI4XHU2MjM3XHU2NzNBXHU1NjY4XHU0RTBBXHU3Njg0XHU1RjAwXHU2NTNFIGZldGNoIFx1NEVFM1x1NzQwNlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEF1ZGlvVXJsKHVybDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghdXJsIHx8IHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gIGlmICh1cmwubGVuZ3RoID4gMjA0OCkgcmV0dXJuIGZhbHNlO1xuICBsZXQgcGFyc2VkOiBVUkw7XG4gIHRyeSB7XG4gICAgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZC5wcm90b2NvbCA9PT0gJ2h0dHA6JyB8fCBwYXJzZWQucHJvdG9jb2wgPT09ICdodHRwczonO1xufVxuXG4vKiogQXJyYXlCdWZmZXIgXHUyMTkyIGJhc2U2NCBcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDhcdTU5MjdcdTY1ODdcdTRFRjZcdTUyMDZcdTU3NTdcdUZGMENcdTkwN0ZcdTUxNERcdThDMDNcdTc1MjhcdTY4MDhcdTZFQTJcdTUxRkFcdUZGMDkgKi9cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgbGV0IGJpbmFyeSA9ICcnO1xuICBjb25zdCBjaHVua1NpemUgPSAweDgwMDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IGNodW5rU2l6ZSkge1xuICAgIGNvbnN0IGNodW5rID0gYnl0ZXMuc3ViYXJyYXkoaSwgaSArIGNodW5rU2l6ZSk7XG4gICAgbGV0IGNodW5rU3RyID0gJyc7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaHVuay5sZW5ndGg7IGorKykge1xuICAgICAgY2h1bmtTdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaHVua1tqXSk7XG4gICAgfVxuICAgIGJpbmFyeSArPSBjaHVua1N0cjtcbiAgfVxuICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG4vKipcbiAqIEFwcEFQSSBcdTIwMTQgXHU3RURGXHU0RTAwXHU5MDFBXHU0RkUxXHU2M0E1XHU1M0UzXG4gKlxuICogXHU2NkZGXHU0RUUzXHU2NUU3XHU3Njg0IEJyaWRnZVNlcnZpY2UgKyBTdG9yYWdlQnJpZGdlICsgVGhlbWVCcmlkZ2UgXHU0RTA5XHU1QzQyXHU2N0I2XHU2Nzg0XHVGRjBDXG4gKiBcdTVDMDYgcG9zdE1lc3NhZ2UgXHU4REVGXHU3NTMxXHUzMDAxXHU1QjU4XHU1MEE4XHU2NENEXHU0RjVDXHUzMDAxXHU0RTNCXHU5ODk4XHU1NDBDXHU2QjY1XHU1NDA4XHU1RTc2XHU0RTNBXHU1MzU1XHU0RTAwIEFQSVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQXBwQVBJIHtcbiAgcHJpdmF0ZSBzdG9yYWdlOiBWYXVsdFN0b3JhZ2U7XG4gIHByaXZhdGUgdGhlbWVCcmlkZ2U6IFRoZW1lQnJpZGdlO1xuICBwcml2YXRlIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncztcbiAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgY3VzdG9tVGhlbWVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgY29kZTogc3RyaW5nIH0+ID0gW107XG4gIHByaXZhdGUgdmF1bHRBZGFwdGVyOiBEYXRhQWRhcHRlcjtcbiAgcHJpdmF0ZSBub2lzZVBhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBjb25maWdEaXI6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3MsXG4gICAgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+LFxuICAgIG5vaXNlUGF0aDogc3RyaW5nLFxuICAgIGNvbmZpZ0Rpcjogc3RyaW5nXG4gICkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLnNhdmVTZXR0aW5ncyA9IHNhdmVTZXR0aW5ncztcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUF3ZWJhcHAgXHU4QkZCXHU1M0Q2XHU3NkVFXHU2ODA3XHU3Njg0XHU1QjlFXHU5NjQ1XHU4REVGXHU1Rjg0XHU3NTMxXHU2QjY0XHU1OTA0XHU1MUIzXHU1QjlBXHVGRjA4VmF1bHRTdG9yYWdlIFx1OUVEOFx1OEJBNCBiYXNlUGF0aCA9IGJhbWJvby1yZXZpZXdcdUZGMDlcdTMwMDJcbiAgICAvLyB3cml0ZUFpR29hbHMgXHU1RkM1XHU5ODdCXHU1MTk5XHU1MTY1XHU1NDBDXHU0RTAwXHU4REVGXHU1Rjg0XHVGRjBDXHU1NDI2XHU1MjE5IEFJIFx1NzZFRVx1NjgwN1x1NEUwRFx1NjYzRVx1NzkzQVx1MzAwMlx1OEJFNlx1ODlDMSBtYWluLnRzIHdyaXRlQWlHb2FscyBcdTc2ODRcdTZDRThcdTkxQ0FcdTMwMDJcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKGFwcCk7XG4gICAgdGhpcy50aGVtZUJyaWRnZSA9IG5ldyBUaGVtZUJyaWRnZSgpO1xuICAgIHRoaXMudmF1bHRBZGFwdGVyID0gYXBwLnZhdWx0LmFkYXB0ZXI7XG4gICAgdGhpcy5ub2lzZVBhdGggPSBub2lzZVBhdGg7XG4gICAgdGhpcy5jb25maWdEaXIgPSBjb25maWdEaXI7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU1QjU4XHU1MEE4XHU3RUQzXHU2Nzg0XHU1QjU4XHU1NzI4ICovXG4gIGFzeW5jIGVuc3VyZVN0cnVjdHVyZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvKiogXHU4QkJFXHU3RjZFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MjE3XHU4ODY4ICovXG4gIHNldEN1c3RvbVRoZW1lcyh0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4pOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVRoZW1lcyA9IHRoZW1lcztcbiAgfVxuXG4gIC8qKiBcbiAgICogXHU5ODg0XHU2Q0U4XHU1MThDIG1lc3NhZ2UgXHU3NkQxXHU1NDJDXHU1NjY4XHUzMDAyXG4gICAqIFx1NTcyOCBpZnJhbWUgXHU1MjFCXHU1RUZBXHU1MjREXHU4QzAzXHU3NTI4XHVGRjBDXHU2RDg4XHU5NjY0XHU3QURFXHU2MDAxXHU3QTk3XHU1M0UzXHUzMDAyXG4gICAqIFx1NEY3Rlx1NzUyOCBhY3RpdmVEb2N1bWVudC5kZWZhdWx0Vmlld1x1RkYwOFx1NEUzQiBPYnNpZGlhbiBcdTdBOTdcdTUzRTNcdUZGMDlcdTgwMENcdTk3NUVcdTYzRDJcdTRFRjZcdTZDOTlcdTdCQjEgd2luZG93XHUzMDAyXG4gICAqL1xuICBzdGFydExpc3RlbmluZygpOiB2b2lkIHtcbiAgICB0aGlzLmRldGFjaCgpO1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXIgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLm9uTWVzc2FnZShldmVudCk7XG4gICAgfTtcbiAgICAvLyBicmlkZ2UuanMgXHU3Njg0IHBvc3RNZXNzYWdlIFx1NzZFRVx1NjgwN1x1NjYyRiB3aW5kb3cucGFyZW50XHVGRjA4XHU0RTNCIE9ic2lkaWFuIFx1N0E5N1x1NTNFM1x1RkYwOVx1RkYwQ1xuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NTcyOFx1OEJFNVx1N0E5N1x1NTNFM1x1NEUwQVx1NzZEMVx1NTQyQ1x1NjI0RFx1ODBGRFx1NjUzNlx1NTIzMFx1NkQ4OFx1NjA2Rlx1RkYwOFx1NjNEMlx1NEVGNlx1NkM5OVx1N0JCMVx1NzY4NCB3aW5kb3cgXHU0RTBEXHU2NjJGXHU1NDBDXHU0RTAwXHU1QkY5XHU4QzYxXHVGRjA5XHUzMDAyXG4gICAgKGFjdGl2ZURvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdykuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBcdTdFRDFcdTVCOUEgaWZyYW1lIFx1NUYxNVx1NzUyOFx1NUU3Nlx1NTIxRFx1NTlDQlx1NTMxNlx1NEUzQlx1OTg5OFx1Njg2NVx1NjNBNVx1MzAwMlxuICAgKiBcdTU3MjggaWZyYW1lIFx1NTE0M1x1N0QyMFx1NTIxQlx1NUVGQVx1NTQwRVx1OEMwM1x1NzUyOFx1RkYwQ1x1NEY5QiByZXNwb25kKCkgXHU4M0I3XHU1M0Q2IGNvbnRlbnRXaW5kb3dcdTMwMDJcbiAgICovXG4gIGJpbmRJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UuYXR0YWNoSWZyYW1lKGlmcmFtZSk7XG4gIH1cblxuICAvKiogXHU3RUQxXHU1QjlBIGlmcmFtZSBcdTVFNzZcdTVGMDBcdTU5Q0JcdTc2RDFcdTU0MkNcdTZEODhcdTYwNkZcdUZGMDhcdTRFMDBcdTZCNjVcdTUyMzBcdTRGNERcdUZGMENcdTUxN0NcdTVCQjlcdTY1RTdcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgYXR0YWNoKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLnN0YXJ0TGlzdGVuaW5nKCk7XG4gICAgdGhpcy5iaW5kSWZyYW1lKGlmcmFtZSk7XG4gIH1cblxuICAvKiogXHU4OUUzXHU3RUQxXHU1RTc2XHU1MDVDXHU2QjYyXHU3NkQxXHU1NDJDICovXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZXNzYWdlSGFuZGxlcikge1xuICAgICAgKGFjdGl2ZURvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdykucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUhhbmRsZXIpO1xuICAgICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMudGhlbWVCcmlkZ2UuZGV0YWNoSWZyYW1lKCk7XG4gICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICB9XG5cbiAgLyoqIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NjVGNlx1ODlFNlx1NTNEMVx1RkYwOFx1NzUzMSBEYWlseVJldmlld1ZpZXcgXHU3Njg0IGNzcy1jaGFuZ2UgXHU0RThCXHU0RUY2XHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIG9uVGhlbWVDaGFuZ2VkKGZvbGxvd09ic2lkaWFuVGhlbWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUgPSBmb2xsb3dPYnNpZGlhblRoZW1lO1xuICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICB9XG5cbiAgLyoqIFx1NTQxMSBpZnJhbWUgXHU1M0QxXHU5MDAxXHU2MjEwXHU1MjlGXHU1NENEXHU1RTk0ICovXG4gIHByaXZhdGUgcmVzcG9uZChpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NUUyNiB0eXBlIFx1NUI1N1x1NkJCNVx1RkYxQWJyaWRnZS5qcyBcdTc2ODQgcGFyc2VBcHBNZXNzYWdlIFx1ODk4MVx1NkM0MiB0eXBlb2YgZGF0YS50eXBlID09PSAnc3RyaW5nJ1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyB0eXBlOiAnc3RvcmFnZTpyZXNwb25zZScsIGlkLCBwYXlsb2FkIH0sICcqJyk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTk1MTlcdThCRUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kRXJyb3IoaWQ6IHN0cmluZywgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgdHlwZTogJ3N0b3JhZ2U6cmVzcG9uc2UnLCBpZCwgZXJyb3IgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdThERUZcdTc1MzEgKi9cbiAgcHJpdmF0ZSBhc3luYyBvbk1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1zZyA9IGV2ZW50LmRhdGEgYXMgeyB0eXBlPzogc3RyaW5nOyBpZD86IHN0cmluZzsgcGF5bG9hZD86IHVua25vd24gfTtcbiAgICBpZiAoIW1zZyB8fCAhbXNnLnR5cGUgfHwgIW1zZy5pZCkgcmV0dXJuO1xuXG4gICAgLy8gXHU2NzY1XHU2RTkwXHU2ODIxXHU5QThDXG4gICAgaWYgKHRoaXMuaWZyYW1lICYmIGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgLy8gXHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXHU3NjdEXHU1NDBEXHU1MzU1XHVGRjA4XHU5NjM2XHU2QkI1MyBcdTAwQjcgXHU1OTUxXHU3RUE2XHU1MzE2XHVGRjFBXHU0RUNFIHByb3RvY29sLnRzIFx1OTZDNlx1NEUyRFx1NUI5QVx1NEU0OVx1RkYwOVxuICAgIGlmICghSU5CT1VORF9QUkVGSVhFUy5zb21lKChwKSA9PiBtc2cudHlwZSEuc3RhcnRzV2l0aChwKSkpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZU1lc3NhZ2UobXNnLnR5cGUsIG1zZy5pZCwgbXNnLnBheWxvYWQgPz8ge30pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKG1zZy5pZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2RDg4XHU2MDZGXHU1MjA2XHU1M0QxXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlTWVzc2FnZSh0eXBlOiBzdHJpbmcsIGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyAtLS0tIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRiAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cmVhZHknKSB7XG4gICAgICAvLyBcdTk2MzZcdTZCQjUzIFx1MDBCNyBcdTU5NTFcdTdFQTZcdTUzMTZcdUZGMUFcdTcyNDhcdTY3MkNcdTUzNEZcdTU1NDYgXHUyMDE0IFx1NjNEMlx1NEVGNlx1NTM0N1x1N0VBN1x1NEY0NiB3ZWJhcHAgXHU3RjEzXHU1QjU4XHU2NUU3XHU3MjQ4XHU2NUY2XHU1M0VGXHU4OUMxXHU1NDRBXHU4QjY2XG4gICAgICBjb25zdCBwdiA9IChwYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KT8ucHJvdG9jb2xWZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBwdiA9PT0gJ251bWJlcicgJiYgcHYgIT09IFBST1RPQ09MX1ZFUlNJT04pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBbQmFtYm9vXSBcdTUzNEZcdThCQUVcdTcyNDhcdTY3MkNcdTRFMERcdTUzMzlcdTkxNERcdUZGMUFcdTYzRDJcdTRFRjY9JHtQUk9UT0NPTF9WRVJTSU9OfVx1RkYwQ3dlYmFwcD0ke3B2fVx1MzAwMmAgK1xuICAgICAgICAgICAgYFx1OEJGN1x1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1ODlDNlx1NTZGRVx1NEVFNVx1ODNCN1x1NTNENlx1NjcwMFx1NjVCMCB3ZWJhcHBcdTMwMDJgLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwge1xuICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgc2VjdGlvbkNvbmZpZzogdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnIHx8IG51bGwsXG4gICAgICAgIGN1c3RvbVRoZW1lczogdGhpcy5jdXN0b21UaGVtZXMsXG4gICAgICAgIGN1c3RvbU5vaXNlczogdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zIHx8IFtdLFxuICAgICAgICBzeW5jUGFsZXR0ZVRvT2JzaWRpYW46IHRoaXMuc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuIHx8IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6Y2xvc2UnKSB7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTY3N0ZcdTU3NTdcdTkxNERcdTdGNkUgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnNhdmVTZWN0aW9uQ29uZmlnJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zZWN0aW9uQ29uZmlnID0gcGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpzYXZlQ3VzdG9tTm9pc2VzJykge1xuICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZUl0ZW1zID0gKEFycmF5LmlzQXJyYXkocGF5bG9hZCkgPyBwYXlsb2FkIDogW10pIGFzIE5vaXNlSXRlbVtdO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW5cdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICd0aGVtZTpzeW5jUGFsZXR0ZScpIHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgaHVlOiBudW1iZXI7IGxpZ2h0bmVzc09mZnNldDogbnVtYmVyOyBpc0Rhcms6IGJvb2xlYW4gfTtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbikge1xuICAgICAgICB0aGlzLnRoZW1lQnJpZGdlLmFwcGx5UGFsZXR0ZShwLmh1ZSwgcC5saWdodG5lc3NPZmZzZXQsIHAuaXNEYXJrKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OTFDRFx1NjVCMFx1NUYwMFx1NTQyRlx1NEUzQlx1OTg5OFx1OERERlx1OTY4Rlx1RkYwOHdlYmFwcCBcdTIxOTIgT2JzaWRpYW5cdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6dGhlbWU6c3luYycpIHtcbiAgICAgIHRoaXMudGhlbWVCcmlkZ2UucHVzaFRoZW1lKHRoaXMuc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNkJcdTYzQ0YgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuc2NhblZhdWx0QXVkaW9GaWxlcygpO1xuICAgICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZmlsZXMgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU2MjZCXHU2M0NGXHU1RTkzXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdThCRkJcdTUzRDZcdTVFOTNcdTUxODVcdTk3RjNcdTk4OTEgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWRWYXVsdEZpbGUnKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVJlYWRWYXVsdEZpbGUoaWQsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU4QkZCXHU1M0Q2XHU2NzJDXHU2NzNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHU5N0YzXHU5ODkxXHVGRjA4XHU1MTdDXHU1QkI5XHU2NUU3XHU5N0YzXHU2RTkwXHVGRjA5LS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnJlYWRMb2NhbEZpbGUnKSB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVJlYWRMb2NhbEZpbGUoaWQsIHBheWxvYWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU0RUUzXHU3NDA2XHU1OTE2XHU5MEU4XHU5N0YzXHU2RTkwXHU5NEZFXHU2M0E1XHVGRjA4XHU3RUQ1XHU4RkM3IHdlYnZpZXcgQ09SU1x1RkYwQ1x1Njg0Q1x1OTc2Mi9cdTc5RkJcdTUyQThcdTRFMDBcdTgxRjRcdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cHJveHlBdWRpb1VybCcpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUHJveHlBdWRpb1VybChpZCwgcGF5bG9hZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTVCNThcdTUwQThcdTdDN0JcdTZEODhcdTYwNkZcdUZGMDhcdTU5RDRcdTYyNThcdTdFRDkgVmF1bHRTdG9yYWdlXHVGRjA5LS0tLVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuaGFuZGxlU3RvcmFnZU1lc3NhZ2UodHlwZSwgcGF5bG9hZCk7XG4gICAgdGhpcy5yZXNwb25kKGlkLCByZXN1bHQpO1xuICB9XG5cbiAgLyoqIFx1NUI1OFx1NTBBOFx1NkQ4OFx1NjA2Rlx1NTkwNFx1NzQwNiAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZVN0b3JhZ2VNZXNzYWdlKHR5cGU6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnc3RvcmFnZTpyZWFkRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXkocC5kYXRlS2V5IGFzIHN0cmluZyk7XG4gICAgICBjYXNlICdzdG9yYWdlOndyaXRlRGF5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXREYXkocC5kYXRhIGFzIERheURhdGEpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpsaXN0RGF5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0QWxsRGF5cygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpkZWxldGVEYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZURheShwLmRhdGVLZXkgYXMgc3RyaW5nKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0U2V0dGluZyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0U2V0dGluZyhwLmtleSBhcyBzdHJpbmcpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRTZXR0aW5nKHAua2V5IGFzIHN0cmluZywgcC52YWx1ZSk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxTZXR0aW5ncygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0R29hbHMoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0R29hbHMnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEdvYWxzKHAuZ29hbHMgYXMgbmV2ZXIpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldFB1cmNoYXNlSGlzdG9yeSgpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRQdXJjaGFzZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFB1cmNoYXNlSGlzdG9yeShwLmRhdGEgYXMgbmV2ZXIpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRJbmNvbWVIaXN0b3J5JzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRJbmNvbWVIaXN0b3J5KCk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dEluY29tZUhpc3RvcnkocC5kYXRhIGFzIG5ldmVyKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0RGF5S2V5cyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RGF5S2V5cygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlzUGFnaW5hdGVkJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlzUGFnaW5hdGVkKFxuICAgICAgICAgIChwLnBhZ2UgYXMgbnVtYmVyKSA/PyAwLFxuICAgICAgICAgIChwLnBhZ2VTaXplIGFzIG51bWJlcikgPz8gMzBcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6ZXhwb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5leHBvcnRBbGxEYXRhKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmltcG9ydEFsbCc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuaW1wb3J0RGF0YShcbiAgICAgICAgICBwLmRhdGEsXG4gICAgICAgICAgeyBzdHJhdGVneTogKHAub3B0aW9ucyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik/LnN0cmF0ZWd5IGFzICdvdmVyd3JpdGUnIHwgJ21lcmdlJyB8IHVuZGVmaW5lZCB9XG4gICAgICAgICk7XG4gICAgICBjYXNlICdzdG9yYWdlOmNsZWFyQWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5jbGVhckFsbCgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0b3JhZ2UgbWVzc2FnZSB0eXBlOiAke3R5cGV9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NjI2Qlx1NjNDRlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNiAqL1xuICBwcml2YXRlIGFzeW5jIHNjYW5WYXVsdEF1ZGlvRmlsZXMoXG4gICAgbWF4RGVwdGggPSA1XG4gICk6IFByb21pc2U8QXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHNpemU6IG51bWJlcjsgZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy52YXVsdEFkYXB0ZXI7XG5cbiAgICBpZiAodGhpcy5ub2lzZVBhdGgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBhd2FpdCBhZGFwdGVyLmxpc3QodGhpcy5ub2lzZVBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbGlzdC5maWxlcykge1xuICAgICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXh0ID0gZmlsZS5zdWJzdHJpbmcoZmlsZS5sYXN0SW5kZXhPZignLicpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmIChBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMubm9pc2VQYXRofS8ke2ZpbGV9YCk7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiBmdWxsUGF0aCwgbmFtZTogZmlsZSwgc2l6ZTogc3RhdD8uc2l6ZSA/PyAwLCBleHQgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLy8gXHU1MTY4XHU1RTkzXHU2MjZCXHU2M0NGXG4gICAgY29uc3Qgc2NhbkRpciA9IGFzeW5jIChyZWxhdGl2ZURpcjogc3RyaW5nLCBkZXB0aDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBpZiAoZGVwdGggPiBtYXhEZXB0aCkgcmV0dXJuO1xuICAgICAgbGV0IGxpc3Q7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ID0gYXdhaXQgYWRhcHRlci5saXN0KHJlbGF0aXZlRGlyKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZm9sZGVyIG9mIGxpc3QuZm9sZGVycykge1xuICAgICAgICBpZiAoZm9sZGVyLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHNraXBTZXQgPSBuZXcgU2V0KFsuLi5TS0lQX0RJUlMsIC4uLih0aGlzLmNvbmZpZ0RpciA/IFt0aGlzLmNvbmZpZ0Rpcl0gOiBbXSldKTtcbiAgICAgICAgaWYgKHNraXBTZXQuaGFzKGZvbGRlcikpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBzdWJQYXRoID0gcmVsYXRpdmVEaXIgPyBub3JtYWxpemVQYXRoKGAke3JlbGF0aXZlRGlyfS8ke2ZvbGRlcn1gKSA6IGZvbGRlcjtcbiAgICAgICAgYXdhaXQgc2NhbkRpcihzdWJQYXRoLCBkZXB0aCArIDEpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbGlzdC5maWxlcykge1xuICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCcuJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBleHQgPSBmaWxlLnN1YnN0cmluZyhmaWxlLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZURpciA/IG5vcm1hbGl6ZVBhdGgoYCR7cmVsYXRpdmVEaXJ9LyR7ZmlsZX1gKSA6IGZpbGU7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KHJlbGF0aXZlUGF0aCk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goeyBwYXRoOiByZWxhdGl2ZVBhdGgsIG5hbWU6IGZpbGUsIHNpemU6IHN0YXQ/LnNpemUgPz8gMCwgZXh0IH0pO1xuICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBhd2FpdCBzY2FuRGlyKCcnLCAwKTtcbiAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGEucGF0aC5sb2NhbGVDb21wYXJlKGIucGF0aCkpO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqIFx1OEJGQlx1NTNENlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1RkYwQ1x1OEZENFx1NTZERVx1NTNFRlx1NjRBRFx1NjUzRVx1NzY4NCBiYXNlNjQgZGF0YSBVUkxcdUZGMDhcdTY4NENcdTk3NjIvXHU3OUZCXHU1MkE4XHU0RTAwXHU4MUY0XHVGRjBDXHU0RTBEXHU0RjlEXHU4RDU2IGJhc2VQYXRoXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUmVhZFZhdWx0RmlsZShpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgcGF0aDogc3RyaW5nIH07XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwLnBhdGggfHwgJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcblxuICAgICAgY29uc3QgZXh0ID0gcmVsYXRpdmVQYXRoLnN1YnN0cmluZyhyZWxhdGl2ZVBhdGgubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICBpZiAocmVsYXRpdmVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuXG4gICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy52YXVsdEFkYXB0ZXI7XG4gICAgICBjb25zdCBzdGF0ID0gYXdhaXQgYWRhcHRlci5zdGF0KHJlbGF0aXZlUGF0aCk7XG4gICAgICBpZiAoIXN0YXQgfHwgc3RhdC50eXBlICE9PSAnZmlsZScpIHRocm93IG5ldyBFcnJvcignXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJyArIHJlbGF0aXZlUGF0aCk7XG5cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGFkYXB0ZXIucmVhZEJpbmFyeShyZWxhdGl2ZVBhdGgpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IGRhdGE6IHRoaXMudG9EYXRhVXJsKGJ1ZmZlciwgZXh0KSB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdThCRkJcdTUzRDZcdTY3MkNcdTY3M0FcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdTk3RjNcdTk4OTFcdUZGMDhcdTUxN0NcdTVCQjlcdTY1RTdcdTk3RjNcdTZFOTBcdUZGMUJcdTc5RkJcdTUyQThcdTdBRUZcdTZDOTlcdTc2RDJcdTRFMEJcdTUzRUZcdTgwRkRcdTRFMERcdTUzRUZcdThCRkJcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVSZWFkTG9jYWxGaWxlKGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyBwYXRoOiBzdHJpbmcgfTtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gcC5wYXRoIHx8ICcnO1xuICAgICAgaWYgKCFmaWxlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdcdTY3MkFcdTYzRDBcdTRGOUJcdTY1ODdcdTRFRjZcdThERUZcdTVGODQnKTtcblxuICAgICAgY29uc3QgZXh0ID0gZmlsZVBhdGguc3Vic3RyaW5nKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIUFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NEUwRFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjgzQ1x1NUYwRlx1RkYxQScgKyBleHQpO1xuICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OERFRlx1NUY4NFx1OTA0RFx1NTM4Nlx1Nzk4MVx1NkI2MicpO1xuXG4gICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCB0aGlzLnZhdWx0QWRhcHRlci5yZWFkQmluYXJ5KGZpbGVQYXRoKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBkYXRhOiB0aGlzLnRvRGF0YVVybChidWZmZXIsIGV4dCkgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IoaWQsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdThCRkJcdTUzRDZcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU0RUUzXHU3NDA2XHU1OTE2XHU5MEU4XHU5N0YzXHU2RTkwXHU5NEZFXHU2M0E1XHVGRjFBXHU2M0QyXHU0RUY2XHU3QUVGIHJlcXVlc3RVcmwgXHU0RTBEXHU1M0Q3IHdlYnZpZXcgQ09SUyBcdTk2NTBcdTUyMzZcdUZGMDhcdTY4NENcdTk3NjIvXHU3OUZCXHU1MkE4XHU1NzQ3XHU2NTJGXHU2MzAxXHVGRjA5ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUHJveHlBdWRpb1VybChpZDogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHAgPSBwYXlsb2FkIGFzIHsgdXJsOiBzdHJpbmcgfTtcbiAgICAgIGNvbnN0IHVybCA9IHAudXJsIHx8ICcnO1xuICAgICAgaWYgKCFpc1ZhbGlkQXVkaW9VcmwodXJsKSkgdGhyb3cgbmV3IEVycm9yKCdcdTk3NUVcdTZDRDVcdTk3RjNcdTZFOTBcdTk0RkVcdTYzQTVcdUZGMDhcdTRFQzVcdTY1MkZcdTYzMDEgaHR0cC9odHRwc1x1RkYwOScpO1xuXG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgcmVxdWVzdFVybCh7IHVybCwgbWV0aG9kOiAnR0VUJyB9KTtcbiAgICAgIGlmIChyZXNwLnN0YXR1cyA8IDIwMCB8fCByZXNwLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcdTk3RjNcdTZFOTBcdThCQkZcdTk1RUVcdTU5MzFcdThEMjUgKEhUVFAgJyArIHJlc3Auc3RhdHVzICsgJyknKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHJlc3AuYXJyYXlCdWZmZXI7XG4gICAgICBpZiAoIWJ1ZmZlcikgdGhyb3cgbmV3IEVycm9yKCdcdTk3RjNcdTZFOTBcdTU0Q0RcdTVFOTRcdTRFM0FcdTdBN0EnKTtcblxuICAgICAgY29uc3QgbWltZSA9IChyZXNwLmhlYWRlcnMgJiYgcmVzcC5oZWFkZXJzWydjb250ZW50LXR5cGUnXSkgfHwgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZGF0YTogYGRhdGE6JHttaW1lfTtiYXNlNjQsJHthcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcil9YCB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NEVFM1x1NzQwNlx1OTdGM1x1NkU5MFx1NTkzMVx1OEQyNScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBBcnJheUJ1ZmZlciBcdTIxOTIgXHU1RTI2IE1JTUUgXHU3Njg0IGJhc2U2NCBkYXRhIFVSTCAqL1xuICBwcml2YXRlIHRvRGF0YVVybChidWZmZXI6IEFycmF5QnVmZmVyLCBleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbWltZSA9IE1JTUVfVFlQRVNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICByZXR1cm4gYGRhdGE6JHttaW1lfTtiYXNlNjQsJHthcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcil9YDtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEltcG9ydFZhbGlkYXRvciB9IGZyb20gJy4vSW1wb3J0VmFsaWRhdG9yJztcbmltcG9ydCB0eXBlIHtcbiAgRGF5RGF0YSxcbiAgR29hbEl0ZW0sXG4gIEFwcFNldHRpbmdzLFxuICBQdXJjaGFzZUhpc3RvcnksXG4gIEluY29tZUhpc3RvcnksXG4gIEV4cG9ydFNoYXBlLFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuLyoqXG4gKiBWYXVsdFN0b3JhZ2UgLSBcdTVDMDFcdTg4QzUgT2JzaWRpYW4gVmF1bHQgYWRhcHRlciBcdTc2ODRcdTY1ODdcdTRFRjZcdTY0Q0RcdTRGNUNcbiAqXG4gKiBWYXVsdCBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODQ6XG4gKiAgIHtiYXNlUGF0aH0vXG4gKiAgICAgZGF0YS8gICAgICAgICAgLT4gXHU2QkNGXHU2NUU1IEpTT04gXHU2NTcwXHU2MzZFXG4gKiAgICAgZ29hbHMuanNvbiAgICAgLT4gXHU1MTY4XHU1QzQwXHU3NkVFXHU2ODA3XG4gKiAgICAgc2V0dGluZ3MuanNvbiAgLT4gXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFXG4gKiAgICAgdGhlbWVzLyAgICAgICAgLT4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmVwb3J0cy8gICAgICAgLT4gXHU2MkE1XHU1NDRBIChcdTk4ODRcdTc1NTkpXG4gKiAgICAgcmV2aWV3cy8gICAgICAgLT4gTWFya2Rvd24gXHU2NDU4XHU4OTgxXG4gKi9cbmV4cG9ydCBjbGFzcyBWYXVsdFN0b3JhZ2Uge1xuICBwcml2YXRlIGFwcDogQXBwO1xuICBwcml2YXRlIGJhc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTUxOTlcdTVCODhcdTUzNkJcdUZGMUFcdTVERjJcdThCNjZcdTU0NEFcdThGQzdcdTc2ODRcdThERUZcdTVGODRcdUZGMENcdTdCMkNcdTRFOENcdTZCMjFcdTUxOTlcdTUxNjVcdTY1M0VcdTg4NENcdUZGMDhcdTc1MjhcdTYyMzdcdTc4NkVcdThCQTRcdTYxMEZcdTU2RkVcdUZGMDkgKi9cbiAgcHJpdmF0ZSBfd2FybmVkUGF0aHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgYmFzZVBhdGggPSAnYmFtYm9vLXJldmlldycpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLmJhc2VQYXRoID0gbm9ybWFsaXplUGF0aChiYXNlUGF0aCk7XG4gIH1cblxuICAvKiogXHU3ODZFXHU0RkREXHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4ICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlRGlyKGRpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vJHtkaXJ9YCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTU3RkFcdTc4NDBcdTc2RUVcdTVGNTVcdTdFRDNcdTY3ODRcdTVCNThcdTU3MjggKi9cbiAgYXN5bmMgZW5zdXJlU3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHRoaXMuYmFzZVBhdGgpKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2Rpcih0aGlzLmJhc2VQYXRoKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcigncmV2aWV3cycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTM5Rlx1NUI1MFx1NjVCOVx1NUYwRlx1NTE5OVx1NTE2NSB2YXVsdCBcdTY1ODdcdTRFRjZcdUZGMDhcdTY2RkZcdTRFRTMgYWRhcHRlci53cml0ZVx1RkYwOVx1MzAwMlxuICAgKiAtIFx1NjU4N1x1NEVGNlx1NURGMlx1NTcyOCB2YXVsdCBcdTdGMTNcdTVCNTggXHUyMTkyIHZhdWx0LnByb2Nlc3NcdUZGMDhcdTUzOUZcdTVCNTBcdTY2RjRcdTY1QjBcdUZGMENcdTkwN0ZcdTUxNERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcdUZGMDlcbiAgICogLSBcdTY1QjBcdTY1ODdcdTRFRjYgXHUyMTkyIHZhdWx0LmNyZWF0ZVx1RkYwOFx1NTQwQ1x1NjVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFx1NTQ4QyBPYnNpZGlhbiBcdTdGMTNcdTVCNThcdUZGMDlcbiAgICogLSBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDhcdTc4QzFcdTc2RDhcdTY3MDlcdTRGNDZcdTdGMTNcdTVCNThcdTY1RTBcdUZGMDlcdTIxOTIgYWRhcHRlci5yZW1vdmUgKyB2YXVsdC5jcmVhdGVcdUZGMDhcdThGQzFcdTc5RkJcdThGREJcdTdGMTNcdTVCNThcdUZGMDlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdmF1bHRXcml0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuICAgIGNvbnN0IGFic3RyYWN0ID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vcm1hbGl6ZWQpO1xuXG4gICAgaWYgKGFic3RyYWN0IGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsICgpID0+IGNvbnRlbnQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudFBhdGggPSBub3JtYWxpemVkLnN1YnN0cmluZygwLCBub3JtYWxpemVkLmxhc3RJbmRleE9mKCcvJykpO1xuICAgIGlmIChwYXJlbnRQYXRoICYmICEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGFyZW50UGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHBhcmVudFBhdGgpO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhub3JtYWxpemVkKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUobm9ybWFsaXplZCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKG5vcm1hbGl6ZWQsIGNvbnRlbnQpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTZCQ0ZcdTY1RTVcdTY1NzBcdTYzNkUgKGRheXMpIC0tLS1cblxuICBwcml2YXRlIGRheVBhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhLyR7ZGF0ZUtleX0uanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8RGF5RGF0YSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBEYXlEYXRhO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW0JhbWJvb1Jldmlld10gXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHVGRjBDXHU1QzA2XHU4REYzXHU4RkM3OiAke3BhdGh9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBbGxEYXlzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgRGF5RGF0YT4+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgY29uc3QgcmVhZHMgPSBmaWxlcy5maWxlc1xuICAgICAgLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoJy5qc29uJykpXG4gICAgICAubWFwKGFzeW5jIChmaWxlKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoIWRhdGVLZXkpIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQoZmlsZSk7XG4gICAgICAgICAgZGF5c1tkYXRlS2V5XSA9IEpTT04ucGFyc2UoY29udGVudCkgYXMgRGF5RGF0YTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHBhcnNlIGRheSBmaWxlOiAke2ZpbGV9YCwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuICAgIHJldHVybiBkYXlzO1xuICB9XG5cbiAgLyoqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NjVFNVx1NjcxRiBrZXlcdUZGMDhcdTYzMDlcdTY1RTVcdTY3MUZcdTk2NERcdTVFOEZcdUZGMENcdTY3MDBcdTY1QjBcdTU3MjhcdTUyNERcdUZGMDkgKi9cbiAgYXN5bmMgZ2V0RGF5S2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmxpc3QoZGF0YURpcik7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMuZmlsZXMpIHtcbiAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgIGNvbnN0IGRhdGVLZXkgPSBmaWxlLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICBpZiAoZGF0ZUtleSkga2V5cy5wdXNoKGRhdGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBrZXlzLnNvcnQoKS5yZXZlcnNlKCk7IC8vIFx1OTY0RFx1NUU4Rlx1RkYxQVx1NjcwMFx1NjVCMFx1NjVFNVx1NjcxRlx1NTcyOFx1NTI0RFxuICAgIHJldHVybiBrZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTIwNlx1OTg3NVx1NTJBMFx1OEY3RFx1NjVFNVx1NjcxRlx1NjU3MFx1NjM2RVxuICAgKiBAcGFyYW0gcGFnZSBcdTk4NzVcdTc4MDFcdUZGMDhcdTRFQ0UgMCBcdTVGMDBcdTU5Q0JcdUZGMDlcbiAgICogQHBhcmFtIHBhZ2VTaXplIFx1NkJDRlx1OTg3NVx1NjU3MFx1OTFDRlxuICAgKiBAcmV0dXJucyB7IGRheXMsIHRvdGFsLCBwYWdlLCBwYWdlU2l6ZSwgaGFzTW9yZSB9XG4gICAqL1xuICBhc3luYyBnZXREYXlzUGFnaW5hdGVkKHBhZ2UgPSAwLCBwYWdlU2l6ZSA9IDMwKTogUHJvbWlzZTx7XG4gICAgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAga2V5czogc3RyaW5nW107XG4gICAgdG90YWw6IG51bWJlcjtcbiAgICBwYWdlOiBudW1iZXI7XG4gICAgcGFnZVNpemU6IG51bWJlcjtcbiAgICBoYXNNb3JlOiBib29sZWFuO1xuICB9PiB7XG4gICAgY29uc3QgYWxsS2V5cyA9IGF3YWl0IHRoaXMuZ2V0RGF5S2V5cygpO1xuICAgIGNvbnN0IHRvdGFsID0gYWxsS2V5cy5sZW5ndGg7XG4gICAgY29uc3Qgc3RhcnQgPSBwYWdlICogcGFnZVNpemU7XG4gICAgY29uc3QgcGFnZUtleXMgPSBhbGxLZXlzLnNsaWNlKHN0YXJ0LCBzdGFydCArIHBhZ2VTaXplKTtcbiAgICBjb25zdCBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgY29uc3QgcmVhZHMgPSBwYWdlS2V5cy5tYXAoYXN5bmMgKGRhdGVLZXkpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldERheShkYXRlS2V5KTtcbiAgICAgICAgaWYgKGRhdGEpIGRheXNbZGF0ZUtleV0gPSBkYXRhO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBsb2FkIGRheTogJHtkYXRlS2V5fWAsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlYWRzKTtcblxuICAgIHJldHVybiB7XG4gICAgICBkYXlzLFxuICAgICAga2V5czogcGFnZUtleXMsXG4gICAgICB0b3RhbCxcbiAgICAgIHBhZ2UsXG4gICAgICBwYWdlU2l6ZSxcbiAgICAgIGhhc01vcmU6IHN0YXJ0ICsgcGFnZUtleXMubGVuZ3RoIDwgdG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHB1dERheShkYXlEYXRhOiBEYXlEYXRhKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ2RhdGEnKTtcbiAgICBjb25zdCBkYXRlS2V5ID0gZGF5RGF0YS5kYXRlO1xuICAgIGlmICghZGF0ZUtleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXlEYXRhIG11c3QgaGF2ZSBhIGRhdGUgZmllbGQnKTtcbiAgICB9XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZGF5UGF0aChkYXRlS2V5KTtcblxuICAgIC8vIFx1NTE5OVx1NUI4OFx1NTM2Qlx1RkYxQVx1NjhDMFx1NkQ0Qlx1NjU3MFx1NjM2RVx1OTFDRlx1NjBBQ1x1NUQxNlx1RkYwOFx1NTkxQVx1Njc2MVx1NjVGNlx1OTVGNFx1N0VCRiBcdTIxOTIgXHU4RkQxXHU0RTRFXHU3QTdBXHU1OEYzXHVGRjA5XG4gICAgaWYgKCF0aGlzLl93YXJuZWRQYXRocy5oYXMocGF0aCkpIHtcbiAgICAgIGNvbnN0IG5ld1RpbWVsaW5lTGVuID0gQXJyYXkuaXNBcnJheShkYXlEYXRhLnRpbWVsaW5lKSA/IGRheURhdGEudGltZWxpbmUubGVuZ3RoIDogMDtcbiAgICAgIGlmIChuZXdUaW1lbGluZUxlbiA8PSAxKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IEpTT04ucGFyc2UoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpKSBhcyBEYXlEYXRhO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdUaW1lbGluZUxlbiA9IEFycmF5LmlzQXJyYXkoZXhpc3RpbmcudGltZWxpbmUpID8gZXhpc3RpbmcudGltZWxpbmUubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ1RpbWVsaW5lTGVuID4gMTApIHtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShcbiAgICAgICAgICAgICAgICBgXHUyNkEwXHVGRTBGIFx1NjhDMFx1NkQ0Qlx1NTIzMCAke2RhdGVLZXl9IFx1NjU3MFx1NjM2RVx1NUYwMlx1NUUzOFx1NkUwNVx1N0E3QVx1RkYwOCR7ZXhpc3RpbmdUaW1lbGluZUxlbn0gXHU2NzYxIFx1MjE5MiAke25ld1RpbWVsaW5lTGVufSBcdTY3NjFcdUZGMDlcdUZGMENcdTVERjJcdTgxRUFcdTUyQThcdTYyRTZcdTYyMkFcdTMwMDJcXG5cdTU5ODJcdTY3OUNcdTc4NkVcdTVCOUVcdTg5ODFcdTZFMDVcdTdBN0FcdThCRTVcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMENcdThCRjdcdTUxOERcdTZCMjFcdTY0Q0RcdTRGNUNcdTMwMDJgXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHRoaXMuX3dhcm5lZFBhdGhzLmFkZChwYXRoKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7IC8qIFx1NjU4N1x1NEVGNlx1NjM1Rlx1NTc0Rlx1NjIxNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1N0VFN1x1N0VFRFx1NkI2M1x1NUUzOFx1NTE5OVx1NTE2NSAqLyB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRheURhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZURheShkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDcgKGdvYWxzKSAtLS0tXG5cbiAgcHJpdmF0ZSBnb2Fsc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9nb2Fscy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRHb2FscygpOiBQcm9taXNlPEdvYWxJdGVtW10+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nb2Fsc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEdvYWxJdGVtW107XG4gIH1cblxuICBhc3luYyBwdXRHb2Fscyhnb2FsczogR29hbEl0ZW1bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuXG4gICAgLy8gXHU1MTk5XHU1Qjg4XHU1MzZCXHVGRjFBXHU2OEMwXHU2RDRCXHU2NTcwXHU2MzZFXHU5MUNGXHU2MEFDXHU1RDE2XHVGRjA4Tlx1Njc2MVx1NzZFRVx1NjgwNyBcdTIxOTIgXHU3QTdBXHU2NTcwXHU3RUM0XHVGRjA5XG4gICAgaWYgKGdvYWxzLmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5fd2FybmVkUGF0aHMuaGFzKHBhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBleGlzdGluZyA9IEpTT04ucGFyc2UoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpKSBhcyBHb2FsSXRlbVtdO1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGV4aXN0aW5nKSAmJiBleGlzdGluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICAgICBgXHUyNkEwXHVGRTBGIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NzZFRVx1NjgwN1x1NjU3MFx1NjM2RVx1NUYwMlx1NUUzOFx1NkUwNVx1N0E3QVx1RkYwOCR7ZXhpc3RpbmcubGVuZ3RofSBcdTY3NjEgXHUyMTkyIFx1N0E3QVx1RkYwOVx1RkYwQ1x1NURGMlx1ODFFQVx1NTJBOFx1NjJFNlx1NjIyQVx1MzAwMlxcblx1NTk4Mlx1Njc5Q1x1Nzg2RVx1NUI5RVx1ODk4MVx1NkUwNVx1N0E3QVx1NjI0MFx1NjcwOVx1NzZFRVx1NjgwN1x1RkYwQ1x1OEJGN1x1NTE4RFx1NkIyMVx1NjRDRFx1NEY1Q1x1MzAwMmBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLl93YXJuZWRQYXRocy5hZGQocGF0aCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHsgLyogXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHU2MjE2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU3RUU3XHU3RUVEXHU2QjYzXHU1RTM4XHU1MTk5XHU1MTY1ICovIH1cbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gQUkgXHU4OUM0XHU1MjEyXHU0RkE3XHU4RjY2XHU3RDIyXHU1RjE1XHVGRjA4cGxhbnMtbWFwLmpzb25cdUZGMDktLS0tXG4gIC8vIFx1N0VEM1x1Njc4NFx1RkYxQXsgXCI8dmF1bHRQYXRoPiM8Y29udGVudEhhc2g+XCI6IHN0cmluZ1tdIChnb2FsSWRzKSB9XG4gIC8vIFx1NzUyOFx1OTAxNFx1RkYxQVx1NTQwQ1x1NEUwMFx1N0IxNFx1OEJCMFx1OTFDRFx1NTkwRFx1ODlDNFx1NTIxMlx1NjVGNlx1NjMwOSBjb250ZW50SGFzaCBcdTVFNDJcdTdCNDlcdUZGMENcdTkwN0ZcdTUxNERcdTc2RUVcdTY4MDdcdTkxQ0RcdTU5MERcdThGRkRcdTUyQTBcdTMwMDJcblxuICBwcml2YXRlIHBsYW5zSW5kZXhQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcGxhbnMtbWFwLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFBsYW5zSW5kZXgoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wbGFuc0luZGV4UGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkgcmV0dXJuIHt9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyB1bmtub3duO1xuICAgICAgaWYgKHBhcnNlZCAmJiB0eXBlb2YgcGFyc2VkID09PSAnb2JqZWN0JykgcmV0dXJuIHBhcnNlZCBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT47XG4gICAgICByZXR1cm4ge307XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcHV0UGxhbnNJbmRleChtYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZSh0aGlzLnBsYW5zSW5kZXhQYXRoKCksIEpTT04uc3RyaW5naWZ5KG1hcCwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdThCQkVcdTdGNkUgKHNldHRpbmdzKSAtLS0tXG5cbiAgcHJpdmF0ZSBzZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9zZXR0aW5ncy5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXRTZXR0aW5nKGtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCB0aGlzLmdldEFsbFNldHRpbmdzKCk7XG4gICAgcmV0dXJuIHNldHRpbmdzW2tleV0gPz8gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHB1dFNldHRpbmcoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IG5vcm1hbGl6ZVBhdGgodGhpcy5zZXR0aW5nc1BhdGgoKSk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgLy8gdmF1bHQucHJvY2VzcyBcdTUzOUZcdTVCNTAgcmVhZC1tb2RpZnktd3JpdGVcdUZGMENcdTY3NUNcdTdFRERcdTdBREVcdTYwMDFcdTRFMjJcdTY1NzBcdTYzNkVcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnByb2Nlc3MoYWJzdHJhY3QsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IEpTT04ucGFyc2UoZGF0YSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIHNldHRpbmdzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoeyBba2V5XTogdmFsdWUgfSwgbnVsbCwgMikpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbFNldHRpbmdzKCk6IFByb21pc2U8QXBwU2V0dGluZ3M+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEFwcFNldHRpbmdzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gXHU4RDJEXHU0RTcwXHU1Mzg2XHU1M0YyIChwdXJjaGFzZS1oaXN0b3J5Lmpzb24pIC0tLS1cblxuICBwcml2YXRlIHB1cmNoYXNlSGlzdG9yeVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9wdXJjaGFzZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFB1cmNoYXNlSGlzdG9yeSgpOiBQcm9taXNlPFB1cmNoYXNlSGlzdG9yeSB8IG51bGw+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIFB1cmNoYXNlSGlzdG9yeTtcbiAgfVxuXG4gIGFzeW5jIHB1dFB1cmNoYXNlSGlzdG9yeShkYXRhOiBQdXJjaGFzZUhpc3RvcnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wdXJjaGFzZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyIChpbmNvbWUtaGlzdG9yeS5qc29uKSAtLS0tXG5cbiAgcHJpdmF0ZSBpbmNvbWVIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2luY29tZS1oaXN0b3J5Lmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEluY29tZUhpc3RvcnkoKTogUHJvbWlzZTxJbmNvbWVIaXN0b3J5IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEluY29tZUhpc3Rvcnk7XG4gIH1cblxuICBhc3luYyBwdXRJbmNvbWVIaXN0b3J5KGRhdGE6IEluY29tZUhpc3RvcnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5pbmNvbWVIaXN0b3J5UGF0aCgpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1NUJGQ1x1NTFGQS9cdTVCRkNcdTUxNjUgLS0tLVxuXG4gIGFzeW5jIGV4cG9ydEFsbERhdGEoKTogUHJvbWlzZTxFeHBvcnRTaGFwZT4ge1xuICAgIGNvbnN0IFtkYXlzLCBnb2Fscywgc2V0dGluZ3MsIHB1cmNoYXNlSGlzdG9yeSwgaW5jb21lSGlzdG9yeV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmdldEFsbERheXMoKSxcbiAgICAgIHRoaXMuZ2V0R29hbHMoKSxcbiAgICAgIHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSxcbiAgICAgIHRoaXMuZ2V0UHVyY2hhc2VIaXN0b3J5KCksXG4gICAgICB0aGlzLmdldEluY29tZUhpc3RvcnkoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAnMy4wJyxcbiAgICAgIGV4cG9ydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHN0b3JhZ2VUeXBlOiAndmF1bHQnLFxuICAgICAgZGF5cyxcbiAgICAgIGdvYWxzLFxuICAgICAgc2V0dGluZ3MsXG4gICAgICBwdXJjaGFzZUhpc3RvcnksXG4gICAgICBpbmNvbWVIaXN0b3J5LFxuICAgICAgdGhlbWVzOiBbXSxcbiAgICAgIHJlcG9ydHM6IFtdLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBpbXBvcnREYXRhKGRhdGE6IHVua25vd24sIG9wdGlvbnM6IHsgc3RyYXRlZ3k/OiAnb3ZlcndyaXRlJyB8ICdtZXJnZScgfSA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgICBjb25zdCBzdHJhdGVneSA9IG9wdGlvbnMuc3RyYXRlZ3kgPz8gJ292ZXJ3cml0ZSc7XG5cbiAgICAvLyBQMlx1RkYxQVx1NUJGQ1x1NTE2NVx1NTI0RFx1NjgyMVx1OUE4QyArIFx1NUI1N1x1NkJCNVx1ODg2NVx1OUY1MFx1RkYxQlx1NjM1Rlx1NTc0Rlx1NjU4N1x1NEVGNlx1NTcyOFx1NkI2NFx1ODhBQlx1NjJEMlx1N0VERFx1RkYwQ1x1NEUwRFx1NkM2MVx1NjdEMyBWYXVsdFxuICAgIGNvbnN0IHJlY29yZCA9IEltcG9ydFZhbGlkYXRvci52YWxpZGF0ZShkYXRhKTtcblxuICAgIGlmIChyZWNvcmQuZGF5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBcdTk2MzJcdTVGQTFcdUZGMUFkYXlzIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1N0E3QVx1NUJGOVx1OEM2MVx1ODg2OFx1NzkzQVx1NkUwNVx1N0E3QVx1NTE2OFx1OTBFOFx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwOFx1NEVDNSBvdmVyd3JpdGUgXHU4QkVEXHU0RTQ5XHU0RTBCXHU1MTQxXHU4QkI4XHVGRjA5XG4gICAgICBjb25zdCBkYXlzID0gKHJlY29yZC5kYXlzICYmIHR5cGVvZiByZWNvcmQuZGF5cyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkocmVjb3JkLmRheXMpKVxuICAgICAgICA/IHJlY29yZC5kYXlzXG4gICAgICAgIDoge307XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdvdmVyd3JpdGUnKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuY2xlYXJBbGxEYXlzKCk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGRheSBvZiBPYmplY3QudmFsdWVzKGRheXMpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucHV0RGF5KGRheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5nb2FscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBpbmNvbWluZzogR29hbEl0ZW1bXSA9IEFycmF5LmlzQXJyYXkocmVjb3JkLmdvYWxzKSA/IHJlY29yZC5nb2FscyA6IFtdO1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnbWVyZ2UnKSB7XG4gICAgICAgIC8vIFx1NTQwOFx1NUU3Nlx1RkYxQVx1NEZERFx1NzU1OVx1NzNCMFx1NjcwOVx1NzZFRVx1NjgwN1x1RkYwQ1x1NUJGQ1x1NTE2NVx1NzZFRVx1NjgwN1x1NjMwOSBpZCBcdTg5ODZcdTc2RDZcdUZGMUJcdTdBN0FcdTY1NzBcdTdFQzRcdTRFMERcdTg5RTZcdTUzRDFcdTZFMDVcdTdBN0FcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSAoYXdhaXQgdGhpcy5nZXRHb2FscygpKSB8fCBbXTtcbiAgICAgICAgY29uc3QgbWVyZ2VkID0gbmV3IE1hcChleGlzdGluZy5tYXAoKGcpID0+IFtnLmlkLCBnXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGdvYWwgb2YgaW5jb21pbmcpIHtcbiAgICAgICAgICBpZiAoZ29hbCAmJiBnb2FsLmlkKSBtZXJnZWQuc2V0KGdvYWwuaWQsIGdvYWwpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoQXJyYXkuZnJvbShtZXJnZWQudmFsdWVzKCkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG92ZXJ3cml0ZVx1RkYxQVx1NjU3NFx1NEY1M1x1NjZGRlx1NjM2Mlx1RkYwOFx1N0E3QVx1NjU3MFx1N0VDNCA9IFx1NkUwNVx1N0E3QVx1RkYwQ1x1N0IyNlx1NTQwOFx1OTg4NFx1NjcxRlx1OEJFRFx1NEU0OVx1RkYwOVxuICAgICAgICBhd2FpdCB0aGlzLnB1dEdvYWxzKGluY29taW5nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLnNldHRpbmdzICE9PSB1bmRlZmluZWQgJiYgcmVjb3JkLnNldHRpbmdzICYmIHR5cGVvZiByZWNvcmQuc2V0dGluZ3MgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCBpbmNvbWluZyA9IHJlY29yZC5zZXR0aW5ncztcbiAgICAgIGxldCB0b1dyaXRlOiBBcHBTZXR0aW5ncztcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ21lcmdlJykge1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IChhd2FpdCB0aGlzLmdldEFsbFNldHRpbmdzKCkpIHx8IHt9O1xuICAgICAgICB0b1dyaXRlID0geyAuLi5leGlzdGluZywgLi4uaW5jb21pbmcgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvV3JpdGUgPSBpbmNvbWluZztcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZSh0aGlzLnNldHRpbmdzUGF0aCgpLCBKU09OLnN0cmluZ2lmeSh0b1dyaXRlLCBudWxsLCAyKSk7XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5wdXJjaGFzZUhpc3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5wdXRQdXJjaGFzZUhpc3RvcnkocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQuaW5jb21lSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dEluY29tZUhpc3RvcnkocmVjb3JkLmluY29tZUhpc3RvcnkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTRFQzVcdTZFMDVcdTdBN0FcdTYyNDBcdTY3MDlcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMDhvdmVyd3JpdGUgXHU1QkZDXHU1MTY1IGRheXMgXHU1MjREXHU4QzAzXHU3NTI4XHVGRjBDXHU0RTBEXHU1RjcxXHU1NENEIGdvYWxzL3NldHRpbmdzXHVGRjA5ICovXG4gIGFzeW5jIGNsZWFyQWxsRGF5cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkYXRhRGlyID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9kYXRhYCk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGRhdGFEaXIpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJtZGlyKGRhdGFEaXIsIHRydWUpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICB9XG5cbiAgLyoqIFx1NEVDNVx1NkUwNVx1N0E3QVx1OEJCRVx1N0Y2RVx1NjU4N1x1NEVGNlx1RkYwOG92ZXJ3cml0ZSBcdTVCRkNcdTUxNjUgc2V0dGluZ3MgXHU1MjREXHU4QzAzXHU3NTI4XHVGRjA5ICovXG4gIGFzeW5jIGNsZWFyQWxsU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuc2V0dGluZ3NQYXRoKCk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjbGVhckFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIodGhpcy5iYXNlUGF0aCwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlU3RydWN0dXJlKCk7XG4gIH1cblxuICAvLyAtLS0tIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAtLS0tXG5cbiAgcHJpdmF0ZSByZXZpZXdQYXRoKGRhdGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vcmV2aWV3cy8ke2RhdGVLZXl9Lm1kYCk7XG4gIH1cblxuICBhc3luYyB3cml0ZU1hcmtkb3duUmV2aWV3KGRhdGVLZXk6IHN0cmluZywgbWFya2Rvd246IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgbWFya2Rvd24pO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucmV2aWV3UGF0aChkYXRlS2V5KTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogSW1wb3J0VmFsaWRhdG9yIC0gXHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHU3Njg0XHU2ODIxXHU5QThDXHU0RTBFXHU1QjU3XHU2QkI1XHU4ODY1XHU5RjUwXHVGRjA4XHU1QkJGXHU0RTNCXHU0RkE3XHVGRjBDXHU5NkY2XHU0RjlEXHU4RDU2XHVGRjA5XG4gKlxuICogXHU3NTI4XHU5MDE0XHVGRjFBXHU1NzI4IFZhdWx0U3RvcmFnZS5pbXBvcnREYXRhIFx1ODQzRFx1NzZEOFx1NTI0RFx1NjJFNlx1NjIyQVx1NjM1Rlx1NTc0Rlx1NjU4N1x1NEVGNlx1MzAwMVx1ODg2NVx1OUY1MFx1N0YzQVx1NTkzMVx1NUI1N1x1NkJCNVx1RkYwQ1xuICogXHU5MDdGXHU1MTREXHU1MzRBXHU2MjJBL1x1OTc1RVx1NkNENVx1NjU3MFx1NjM2RVx1NkM2MVx1NjdEMyBWYXVsdFx1MzAwMlxuICpcbiAqIFx1OEJCRVx1OEJBMVx1NTM5Rlx1NTIxOVx1RkYxQVxuICogIC0gXHU0RUM1XHU1MDVBXCJcdTdFRDNcdTY3ODRcdTVDNDJcdTk3NjJcdTc2ODRcdTVCODlcdTUxNjhcdTUxNUNcdTVFOTVcIlx1RkYwQ1x1NEUwRFx1OTFDRFx1NTE5OVx1NEUxQVx1NTJBMVx1NUI1N1x1NkJCNVx1RkYwOFx1NTk4MiBtZXRyaWNzIFx1NzY4NFx1NTE3N1x1NEY1M1x1NjU3MFx1NTAzQ1x1RkYwOVx1MzAwMlxuICogIC0gXHU1QjU3XHU2QkI1XHU4ODY1XHU5RjUwXHU0RjE4XHU1MTQ4XHU3NTI4XHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHU4MUVBXHU4RUFCXHU3Njg0IGtleSAvIFx1NTE4NVx1NUJCOVx1RkYwQ1x1N0YzQVx1NTkzMVx1NjVGNlx1NjI0RFx1NzUyOFx1NUI4OVx1NTE2OFx1OUVEOFx1OEJBNFx1NTAzQ1x1MzAwMlxuICogIC0gXHU0RUZCXHU0RjU1XHU2NUUwXHU2Q0Q1XHU0RkVFXHU1OTBEXHU3Njg0XHU3RUQzXHU2Nzg0XHU2MDI3XHU2MzVGXHU1NzRGXHU5MEZEXHU2MjlCIEltcG9ydFZhbGlkYXRpb25FcnJvclx1RkYwQ1x1NzUzMVx1OEMwM1x1NzUyOFx1NjVCOVx1NjNEMFx1NzkzQVx1NzUyOFx1NjIzN1x1MzAwMlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGF5RGF0YSxcbiAgR29hbEl0ZW0sXG4gIEFwcFNldHRpbmdzLFxuICBQdXJjaGFzZUhpc3RvcnksXG4gIEluY29tZUhpc3RvcnksXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG5jbGFzcyBJbXBvcnRWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdJbXBvcnRWYWxpZGF0aW9uRXJyb3InO1xuICB9XG59XG5cbmNvbnN0IEtOT1dOX0ZJRUxEUyA9IFsnZGF5cycsICdnb2FscycsICdzZXR0aW5ncycsICdwdXJjaGFzZUhpc3RvcnknLCAnaW5jb21lSGlzdG9yeSddIGFzIGNvbnN0O1xuXG4vKipcbiAqIFx1N0VCNVx1NkRGMVx1OTYzMlx1NUZBMVx1RkYxQVx1NUJGQ1x1NTE2NVx1NjU3MFx1NjM2RVx1NjYyRlx1NEUwRFx1NTNFRlx1NEZFMVx1OEZCOVx1NzU0Q1x1RkYwOFx1NTNFRlx1ODBGRFx1Njc2NVx1ODFFQVx1NEVENlx1NEVCQVx1NTIwNlx1NEVBQi9cdTRFMEJcdThGN0RcdTc2ODRcdTU5MDdcdTRFRkRcdUZGMDlcdTMwMDJcbiAqIFx1NTcyOFx1ODQzRFx1NzZEOFx1NTI0RFx1OTAxMlx1NUY1Mlx1NTFDMFx1NTMxNlx1NjI0MFx1NjcwOVx1NUI1N1x1N0IyNlx1NEUzMlx1NTNGNlx1NUI1MFx1RkYwQ1x1NTI2NVx1NzlCQiBIVE1MIFx1NjgwN1x1N0I3RVx1MzAwMVx1NEU4Qlx1NEVGNlx1NTkwNFx1NzQwNlx1NUM1RVx1NjAyN1xuICogXHU0RTBFIGphdmFzY3JpcHQ6L2RhdGE6IFx1NEYyQVx1NTM0Rlx1OEJBRVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NjA3Nlx1NjEwRlx1OEQxRlx1OEY3RFx1N0VDRiBpbm5lckhUTUwgXHU2RTMyXHU2N0QzXHU4OUU2XHU1M0QxIFhTU1x1MzAwMlxuICogXHU2NzJDXHU5ODc5XHU3NkVFXHU2NUUwXHU1QkNDXHU2NTg3XHU2NzJDXHU5NzAwXHU2QzQyXHVGRjBDXHU3RURGXHU0RTAwXHU2NTg3XHU2NzJDXHU1MzE2XHU2NjJGXHU1Qjg5XHU1MTY4XHU3Njg0XHUzMDAyXG4gKi9cbmZ1bmN0aW9uIHNhbml0aXplU3RyaW5nKGlucHV0OiB1bmtub3duKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHJldHVybiBpbnB1dCBhcyBzdHJpbmc7XG4gIGNvbnN0IG91dCA9IGlucHV0XG4gICAgLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpIC8vIFx1NzlGQlx1OTY2NFx1NjI0MFx1NjcwOSBIVE1MIFx1NjgwN1x1N0I3RVxuICAgIC5yZXBsYWNlKC9cXHNvblxcdytcXHMqPVxccypcIlteXCJdKlwiL2dpLCAnJykgLy8gXHU3OUZCXHU5NjY0IG9uKj1cIi4uLlwiXG4gICAgLnJlcGxhY2UoL1xcc29uXFx3K1xccyo9XFxzKidbXiddKicvZ2ksICcnKSAvLyBcdTc5RkJcdTk2NjQgb24qPScuLi4nXG4gICAgLnJlcGxhY2UoL1xcc29uXFx3K1xccyo9XFxzKlteXFxzPl0rL2dpLCAnJykgLy8gXHU3OUZCXHU5NjY0IG9uKj12YWx1ZVx1RkYwOFx1NjVFMFx1NUYxNVx1NTNGN1x1RkYwOVxuICAgIC5yZXBsYWNlKC9qYXZhc2NyaXB0Oi9naSwgJycpIC8vIFx1NzlGQlx1OTY2NCBqYXZhc2NyaXB0OiBcdTRGMkFcdTUzNEZcdThCQUVcbiAgICAucmVwbGFjZSgvZGF0YTovZ2ksICcnKTsgLy8gXHU3OUZCXHU5NjY0IGRhdGE6IFx1NEYyQVx1NTM0Rlx1OEJBRVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZVZhbHVlKHZhbHVlOiB1bmtub3duKTogdW5rbm93biB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gc2FuaXRpemVTdHJpbmcodmFsdWUpO1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiB2YWx1ZS5tYXAoKHYpID0+IHNhbml0aXplVmFsdWUodikpO1xuICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh2YWx1ZSkpIHtcbiAgICAgIG91dFtrZXldID0gc2FuaXRpemVWYWx1ZSgodmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9XG4gIHJldHVybiB2YWx1ZTsgLy8gXHU2NTcwXHU1QjU3IC8gXHU1RTAzXHU1QzE0IC8gbnVsbCBcdTdCNDlcdTUzOUZcdTY4MzdcdTRGRERcdTc1NTlcbn1cblxuaW50ZXJmYWNlIFZhbGlkYXRlZEltcG9ydCB7XG4gIGRheXM/OiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgZ29hbHM/OiBHb2FsSXRlbVtdO1xuICBzZXR0aW5ncz86IEFwcFNldHRpbmdzO1xuICBwdXJjaGFzZUhpc3Rvcnk/OiBQdXJjaGFzZUhpc3Rvcnk7XG4gIGluY29tZUhpc3Rvcnk/OiBJbmNvbWVIaXN0b3J5O1xufVxuXG5leHBvcnQgY29uc3QgSW1wb3J0VmFsaWRhdG9yID0ge1xuICAvKipcbiAgICogXHU2ODIxXHU5QThDXHU1RTc2XHU4ODY1XHU5RjUwXHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHUzMDAyXG4gICAqIEByZXR1cm5zIFx1ODg2NVx1OUY1MFx1NTQwRVx1NzY4NFx1NUU3Mlx1NTFDMFx1NjU3MFx1NjM2RVx1RkYwOFx1N0VEM1x1Njc4NFx1NEUwRVx1OEY5M1x1NTE2NVx1NEUwMFx1ODFGNFx1RkYwQ1x1NEY0Nlx1NUI1N1x1NkJCNVx1NUI4Q1x1NjU3NFx1RkYwOVxuICAgKiBAdGhyb3dzIEltcG9ydFZhbGlkYXRpb25FcnJvciBcdTVGNTNcdTdFRDNcdTY3ODRcdTYzNUZcdTU3NEZcdTY1RTBcdTZDRDVcdTRGRUVcdTU5MERcdTY1RjZcbiAgICovXG4gIHZhbGlkYXRlKGRhdGE6IHVua25vd24pOiBWYWxpZGF0ZWRJbXBvcnQge1xuICAgIGlmICghZGF0YSB8fCB0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgdGhyb3cgbmV3IEltcG9ydFZhbGlkYXRpb25FcnJvcignXHU1OTA3XHU0RUZEXHU2NTg3XHU0RUY2XHU2ODNDXHU1RjBGXHU2NUUwXHU2NTQ4XHVGRjFBXHU2ODM5XHU4MjgyXHU3MEI5XHU1RkM1XHU5ODdCXHU2NjJGIEpTT04gXHU1QkY5XHU4QzYxJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb3JkID0gZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgIC8vIFx1NjM1Rlx1NTc0Rlx1NjU4N1x1NEVGNlx1NjJEMlx1N0VERFx1RkYxQVx1NkNBMVx1NjcwOVx1NEVGQlx1NEY1NVx1NURGMlx1NzdFNVx1NUI1N1x1NkJCNSBcdTIxOTIgXHU4OUM2XHU0RTNBXHU2MzVGXHU1NzRGL1x1NjVFMFx1NTE3M1x1NjU4N1x1NEVGNlxuICAgIGNvbnN0IGhhc0tub3duRmllbGQgPSBLTk9XTl9GSUVMRFMuc29tZSgoZikgPT4gcmVjb3JkW2ZdICE9PSB1bmRlZmluZWQpO1xuICAgIGlmICghaGFzS25vd25GaWVsZCkge1xuICAgICAgdGhyb3cgbmV3IEltcG9ydFZhbGlkYXRpb25FcnJvcihcbiAgICAgICAgJ1x1NTkwN1x1NEVGRFx1NjU4N1x1NEVGNlx1NjVFMFx1NjU0OFx1RkYxQVx1NjcyQVx1NjI3RVx1NTIzMFx1NEVGQlx1NEY1NVx1NTNFRlx1OEJDNlx1NTIyQlx1NzY4NFx1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNVx1RkYwOGRheXMgLyBnb2FscyAvIHNldHRpbmdzIC8gcHVyY2hhc2VIaXN0b3J5IC8gaW5jb21lSGlzdG9yeVx1RkYwOSdcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0OiBWYWxpZGF0ZWRJbXBvcnQgPSB7fTtcblxuICAgIGlmIChyZWNvcmQuZGF5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuZGF5cyA9IHNhbml0aXplVmFsdWUoSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZURheXMocmVjb3JkLmRheXMpKSBhcyBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5nb2FscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuZ29hbHMgPSBzYW5pdGl6ZVZhbHVlKEltcG9ydFZhbGlkYXRvci5ub3JtYWxpemVHb2FscyhyZWNvcmQuZ29hbHMpKSBhcyBHb2FsSXRlbVtdO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnNldHRpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5zZXR0aW5ncyA9IHNhbml0aXplVmFsdWUoSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZVNldHRpbmdzKHJlY29yZC5zZXR0aW5ncykpIGFzIEFwcFNldHRpbmdzO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQucHVyY2hhc2VIaXN0b3J5ID0gc2FuaXRpemVWYWx1ZShyZWNvcmQucHVyY2hhc2VIaXN0b3J5KSBhcyBQdXJjaGFzZUhpc3Rvcnk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQuaW5jb21lSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuaW5jb21lSGlzdG9yeSA9IHNhbml0aXplVmFsdWUocmVjb3JkLmluY29tZUhpc3RvcnkpIGFzIEluY29tZUhpc3Rvcnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IGRheXNcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU5NzVFXHU1QkY5XHU4QzYxXHVGRjA4XHU1OTgyXHU2NTcwXHU3RUM0L1x1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOVx1MjE5MiBcdTg5QzZcdTRFM0FcdTY1RTBcdTY1RTVcdTY1NzBcdTYzNkVcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTVCRjlcdThDNjFcdUZGMDhcdTRFMERcdTZDNjFcdTY3RDMgVmF1bHRcdUZGMDlcbiAgICogIC0gXHU2QkNGXHU0RTJBIGRheSBcdTdGM0EgZGF0ZSBcdTY1RjZcdTc1MjhcdTUxNzYga2V5IFx1ODg2NVx1OUY1MFxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZGF5IFx1N0YzQSBtZXRyaWNzL3RpbWVsaW5lL2dvYWxzIFx1NjVGNlx1ODg2NVx1N0E3QVx1N0VEM1x1Njc4NFxuICAgKi9cbiAgbm9ybWFsaXplRGF5cyhkYXlzOiB1bmtub3duKTogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4ge1xuICAgIGlmICghZGF5cyB8fCB0eXBlb2YgZGF5cyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXlzKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBjb25zdCByYXcgPSBkYXlzIGFzIFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICAgIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgRGF5RGF0YT4gPSB7fTtcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJhdykpIHtcbiAgICAgIGNvbnN0IGRheSA9IHJhd1trZXldO1xuICAgICAgaWYgKCFkYXkgfHwgdHlwZW9mIGRheSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShkYXkpKSB7XG4gICAgICAgIGNvbnRpbnVlOyAvLyBcdThERjNcdThGQzdcdTk3NUVcdTVCRjlcdThDNjFcdTY3NjFcdTc2RUVcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsZWFuOiBEYXlEYXRhID0geyAuLi5kYXkgfTtcbiAgICAgIGlmICghY2xlYW4uZGF0ZSkgY2xlYW4uZGF0ZSA9IGtleTsgLy8gXHU3NTI4IGtleSBcdTg4NjUgZGF0ZVxuICAgICAgaWYgKCFjbGVhbi5tZXRyaWNzIHx8IHR5cGVvZiBjbGVhbi5tZXRyaWNzICE9PSAnb2JqZWN0JykgY2xlYW4ubWV0cmljcyA9IHt9O1xuICAgICAgaWYgKCFjbGVhbi50aW1lbGluZSB8fCAhQXJyYXkuaXNBcnJheShjbGVhbi50aW1lbGluZSkpIGNsZWFuLnRpbWVsaW5lID0gW107XG4gICAgICBpZiAoIWNsZWFuLmdvYWxzIHx8ICFBcnJheS5pc0FycmF5KGNsZWFuLmdvYWxzKSkgY2xlYW4uZ29hbHMgPSBbXTtcbiAgICAgIG91dFtrZXldID0gY2xlYW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFx1NUY1Mlx1NEUwMFx1NTMxNiBnb2Fsc1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTY1NzBcdTdFQzRcdUZGMUJcdTk3NUVcdTY1NzBcdTdFQzQgXHUyMTkyIFx1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZ29hbCBcdTdGM0EgaWQgXHU2NUY2XHU4ODY1XHU0RTAwXHU0RTJBXHU3QTMzXHU1QjlBXHU1M0VGXHU1OTBEXHU3M0IwXHU3Njg0IGlkXG4gICAqL1xuICBub3JtYWxpemVHb2Fscyhnb2FsczogdW5rbm93bik6IEdvYWxJdGVtW10ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShnb2FscykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIHJldHVybiBnb2Fscy5tYXAoKHJhdyk6IEdvYWxJdGVtID0+IHtcbiAgICAgIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIHJhdyBhcyBHb2FsSXRlbTtcbiAgICAgIGNvbnN0IG9iaiA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGNvbnN0IGNsZWFuID0geyAuLi5vYmogfSBhcyB1bmtub3duIGFzIEdvYWxJdGVtO1xuICAgICAgaWYgKCFjbGVhbi5pZCkge1xuICAgICAgICBjbGVhbi5pZCA9IGBnb2FsX2ltcG9ydF8ke2NvdW50ZXIrK31fJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1gO1xuICAgICAgfVxuICAgICAgaWYgKGNsZWFuLml0ZW1zICYmICFBcnJheS5pc0FycmF5KGNsZWFuLml0ZW1zKSkgY2xlYW4uaXRlbXMgPSBbXTtcbiAgICAgIHJldHVybiBjbGVhbjtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IHNldHRpbmdzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NUJGOVx1OEM2MVx1RkYxQlx1OTc1RVx1NUJGOVx1OEM2MSBcdTIxOTIgXHU4RkQ0XHU1NkRFXHU3QTdBXHU1QkY5XHU4QzYxXG4gICAqL1xuICBub3JtYWxpemVTZXR0aW5ncyhzZXR0aW5nczogdW5rbm93bik6IEFwcFNldHRpbmdzIHtcbiAgICBpZiAoIXNldHRpbmdzIHx8IHR5cGVvZiBzZXR0aW5ncyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShzZXR0aW5ncykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHNldHRpbmdzIGFzIEFwcFNldHRpbmdzO1xuICB9LFxufTtcbiIsICJcbi8qKlxuICogVGhlbWVCcmlkZ2UgLSBcdTc2RDFcdTU0MkMgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHVGRjBDXHU2M0E4XHU5MDAxXHU1MjMwIGlmcmFtZVxuICogICAgICAgICAgICAgICsgXHU1M0NEXHU1NDExXHVGRjFBXHU2M0E1XHU2NTM2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTUwM0NcdUZGMENcdTZDRThcdTUxNjUgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gKi9cbmV4cG9ydCBjbGFzcyBUaGVtZUJyaWRnZSB7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBfcGFsZXR0ZVN5bmNUaW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogXHU1QjU4XHU1MEE4XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTk1MkVcdTU0MERcdUZGMENcdTc1MjhcdTRFOEUgcmVzdG9yZURlZmF1bHRzIFx1NkUwNVx1NzQwNiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IElOSkVDVEVEX1ZBUlMgPSBbXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnLFxuICAgICAgJy0taW50ZXJhY3RpdmUtYWNjZW50LWhvdmVyJyxcbiAgICAgICctLXRleHQtYWNjZW50JyxcbiAgICAgICctLWJhY2tncm91bmQtcHJpbWFyeScsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScsXG4gICAgICAnLS10ZXh0LW5vcm1hbCcsXG4gICAgICAnLS10ZXh0LW11dGVkJyxcbiAgICBdO1xuXG4gICAgLyoqIFx1OTYzMlx1NjI5Nlx1N0FERVx1NjAwMVx1NjgwN1x1OEJCMFx1RkYxQXJlc3RvcmVEZWZhdWx0cyBcdTg4QUJcdThDMDNcdTc1MjhcdTU0MEVcdThCQkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTYzQlx1NkI2Mlx1NUVGNlx1OEZERlx1NTZERVx1OEMwM1x1ODk4Nlx1NTE5OSAqL1xuICAgIHByaXZhdGUgc3RhdGljIF9zdXBwcmVzc2VkID0gZmFsc2U7XG5cbiAgYXR0YWNoSWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcbiAgfVxuXG4gIGRldGFjaElmcmFtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREIE9ic2lkaWFuIFx1NjYwRVx1NjY5N1x1NzJCNlx1NjAwMVx1RkYwOFx1NEVDNVx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1RkYwOSAqL1xuICBwcml2YXRlIGlzRGFya01vZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjdGl2ZURvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aGVtZS1kYXJrJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIENTUyBcdTk4OUNcdTgyNzJcdTVCNTdcdTdCMjZcdTRFMzIgXHUyMTkyIFtyLCBnLCBiXVx1RkYwODBcdTIwMTMyNTUgXHU2NTc0XHU2NTcwXHVGRjA5XG4gICAqIFx1NjUyRlx1NjMwMSByZ2IoKS9yZ2JhKCkvI2hleFx1RkYwODMgXHU2MjE2IDYgXHU0RjREXHVGRjA5XHVGRjFCXHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU4RkQ0XHU1NkRFIG51bGxcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHBhcnNlQ29sb3JUb1JnYihjb2xvcjogc3RyaW5nKTogW251bWJlciwgbnVtYmVyLCBudW1iZXJdIHwgbnVsbCB7XG4gICAgaWYgKCFjb2xvcikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgYyA9IGNvbG9yLnRyaW0oKTtcbiAgICBsZXQgcjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlcjtcblxuICAgIGNvbnN0IHJnYk1hdGNoID0gYy5tYXRjaCgvcmdiYT9cXCgoW14pXSspXFwpL2kpO1xuICAgIGlmIChyZ2JNYXRjaCkge1xuICAgICAgY29uc3QgcGFydHMgPSByZ2JNYXRjaFsxXS5zcGxpdCgnLCcpLm1hcCgocykgPT4gcGFyc2VGbG9hdChzKSk7XG4gICAgICBbciwgZywgYl0gPSBwYXJ0cztcbiAgICB9IGVsc2UgaWYgKGNbMF0gPT09ICcjJykge1xuICAgICAgbGV0IGhleCA9IGMuc2xpY2UoMSk7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCA9PT0gMykgaGV4ID0gaGV4LnNwbGl0KCcnKS5tYXAoKGNoKSA9PiBjaCArIGNoKS5qb2luKCcnKTtcbiAgICAgIGlmIChoZXgubGVuZ3RoIDwgNikgcmV0dXJuIG51bGw7XG4gICAgICByID0gcGFyc2VJbnQoaGV4LnNsaWNlKDAsIDIpLCAxNik7XG4gICAgICBnID0gcGFyc2VJbnQoaGV4LnNsaWNlKDIsIDQpLCAxNik7XG4gICAgICBiID0gcGFyc2VJbnQoaGV4LnNsaWNlKDQsIDYpLCAxNik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChbciwgZywgYl0uc29tZSgodikgPT4gaXNOYU4odikpKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gW01hdGgucm91bmQociksIE1hdGgucm91bmQoZyksIE1hdGgucm91bmQoYildO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBDU1MgXHU5ODlDXHU4MjcyXHU1QjU3XHU3QjI2XHU0RTMyIFx1MjE5MiBIU0wgXHU4MjcyXHU3NkY4IEhcdUZGMDgwXHUyMDEzMzYwXHVGRjA5XG4gICAqIFx1NzUyOFx1NEU4RVx1NjI4QSBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTc2ODQgLS1pbnRlcmFjdGl2ZS1hY2NlbnQgXHU1M0NEXHU2M0E4XHU0RTNBXHU2M0QyXHU0RUY2XHU3Njg0IC0tYWNjZW50LWh1ZVxuICAgKi9cbiAgc3RhdGljIHJnYlRvSHVlKGNvbG9yOiBzdHJpbmcpOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCByZ2IgPSBUaGVtZUJyaWRnZS5wYXJzZUNvbG9yVG9SZ2IoY29sb3IpO1xuICAgIGlmICghcmdiKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBbciwgZywgYl0gPSByZ2I7XG5cbiAgICBjb25zdCBybiA9IHIgLyAyNTUsIGduID0gZyAvIDI1NSwgYm4gPSBiIC8gMjU1O1xuICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KHJuLCBnbiwgYm4pLCBtaW4gPSBNYXRoLm1pbihybiwgZ24sIGJuKSwgZCA9IG1heCAtIG1pbjtcbiAgICBpZiAoZCA9PT0gMCkgcmV0dXJuIDA7XG5cbiAgICBsZXQgaDogbnVtYmVyO1xuICAgIGlmIChtYXggPT09IHJuKSBoID0gKChnbiAtIGJuKSAvIGQpICUgNjtcbiAgICBlbHNlIGlmIChtYXggPT09IGduKSBoID0gKGJuIC0gcm4pIC8gZCArIDI7XG4gICAgZWxzZSBoID0gKHJuIC0gZ24pIC8gZCArIDQ7XG5cbiAgICBoID0gTWF0aC5yb3VuZChoICogNjApO1xuICAgIHJldHVybiBoIDwgMCA/IGggKyAzNjAgOiBoO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBDU1MgXHU5ODlDXHU4MjcyXHU1QjU3XHU3QjI2XHU0RTMyIFx1MjE5MiBcInIsIGcsIGJcIiBcdTRFMDlcdTUxNDNcdTdFQzRcdTVCNTdcdTdCMjZcdTRFMzJcbiAgICogXHU3NTI4XHU0RThFXHU2MjhBIE9ic2lkaWFuIFx1NEZBN1x1OEZCOVx1NjgwRlx1ODBDQ1x1NjY2RiAtLWJhY2tncm91bmQtc2Vjb25kYXJ5IFx1NTQwQ1x1NkI2NVx1NEUzQVx1NjNEMlx1NEVGNlx1NTM2MVx1NzI0N1x1NUU5NVx1ODI3Mlx1RkYwQ1xuICAgKiBcdThCQTlcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTgyNzJcdTZFMjlcdThEMzRcdThGRDEgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqL1xuICBzdGF0aWMgcmdiVG9SZ2JTdHJpbmcoY29sb3I6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHJnYiA9IFRoZW1lQnJpZGdlLnBhcnNlQ29sb3JUb1JnYihjb2xvcik7XG4gICAgaWYgKCFyZ2IpIHJldHVybiBudWxsO1xuICAgIHJldHVybiByZ2Iuam9pbignLCAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTU0MTEgaWZyYW1lIFx1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NzJCNlx1NjAwMVxuICAgKiBAcGFyYW0gZm9sbG93T2JzaWRpYW5UaGVtZSBcdTRFM0EgdHJ1ZSBcdTY1RjZcdUZGMENcdTk2NDRcdTVFMjZcdTRFQ0UgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XG4gICAqICAgICAgICAtLWludGVyYWN0aXZlLWFjY2VudCBcdTUzQ0RcdTYzQThcdTc2ODRcdTYxMEZcdTU4ODNcdTgyNzJcdTc2RjggaHVlXHVGRjBDXHU5QTcxXHU1MkE4XHU2M0QyXHU0RUY2XHU2NTc0XHU3NkQ4XHU5MTREXHU4MjcyXHU4MDU0XHU1MkE4XG4gICAqL1xuICBwdXNoVGhlbWUoZm9sbG93T2JzaWRpYW5UaGVtZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgY29uc3QgcGF5bG9hZDogeyBpc0Rhcms6IGJvb2xlYW47IGh1ZT86IG51bWJlcjsgYmc/OiBzdHJpbmc7IHRleHROb3JtYWw/OiBzdHJpbmc7IHRleHRNdXRlZD86IHN0cmluZyB9ID0ge1xuICAgICAgaXNEYXJrOiB0aGlzLmlzRGFya01vZGUoKSxcbiAgICB9O1xuXG4gICAgaWYgKGZvbGxvd09ic2lkaWFuVGhlbWUpIHtcbiAgICAgIGNvbnN0IGFjY2VudCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0taW50ZXJhY3RpdmUtYWNjZW50JylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IGh1ZSA9IFRoZW1lQnJpZGdlLnJnYlRvSHVlKGFjY2VudCk7XG4gICAgICBpZiAoaHVlICE9PSBudWxsKSBwYXlsb2FkLmh1ZSA9IGh1ZTtcblxuICAgICAgLy8gXHU0RkE3XHU4RkI5XHU2ODBGXHU4MENDXHU2NjZGXHU4MjcyXHVGRjFBXHU5QTcxXHU1MkE4XHU2M0QyXHU0RUY2XHU1MzYxXHU3MjQ3XHU1RTk1XHU4MjcyXHU4RDM0XHU4RkQxIE9ic2lkaWFuIFx1ODI3Mlx1NkUyOVxuICAgICAgY29uc3Qgc2lkZWJhciA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgYmcgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyhzaWRlYmFyKTtcbiAgICAgIGlmIChiZyAhPT0gbnVsbCkgcGF5bG9hZC5iZyA9IGJnO1xuXG4gICAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcdUZGMUFcdTlBNzFcdTUyQThcdTYzRDJcdTRFRjZcdTY1ODdcdTVCNTdcdTgyNzJcdTZFMjlcdThEMzRcdThGRDEgT2JzaWRpYW5cbiAgICAgIGNvbnN0IHRleHROb3JtYWwgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbm9ybWFsJylcbiAgICAgICAgLnRyaW0oKTtcbiAgICAgIGNvbnN0IHRleHROb3JtYWxSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0Tm9ybWFsKTtcbiAgICAgIGlmICh0ZXh0Tm9ybWFsUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHROb3JtYWwgPSB0ZXh0Tm9ybWFsUmdiO1xuXG4gICAgICBjb25zdCB0ZXh0TXV0ZWQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbXV0ZWQnKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgdGV4dE11dGVkUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE11dGVkKTtcbiAgICAgIGlmICh0ZXh0TXV0ZWRSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE11dGVkID0gdGV4dE11dGVkUmdiO1xuICAgIH1cblxuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgaWQ6ICd0aGVtZV9wdXNoXycgKyBEYXRlLm5vdygpLFxuICAgICAgICBwYXlsb2FkLFxuICAgICAgfSxcbiAgICAgICcqJ1xuICAgICk7XG4gIH1cblxuICAvKiogXHU0RjlCXHU1OTE2XHU5MEU4XHU4QzAzXHU3NTI4XHVGRjFBT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU2NUY2XHU4OUU2XHU1M0QxICovXG4gIG9uVGhlbWVDaGFuZ2VkKGZvbGxvd09ic2lkaWFuVGhlbWUgPSBmYWxzZSk6IHZvaWQge1xuICAgIHRoaXMucHVzaFRoZW1lKGZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICB9XG5cbiAgLy8gPT09PT0gXHU1M0NDXHU1NDExXHU4QzAzXHU4MjcyID09PT09XG5cbiAgLyoqXG4gICAqIFx1OEJBMVx1N0I5NyB3ZWJhcHAgXHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNiBcdTIxOTIgT2JzaWRpYW4gQ1NTIFx1NTNEOFx1OTFDRlx1NjYyMFx1NUMwNFxuICAgKiBcdTRFQzVcdTg5ODZcdTc2RDYgMyBcdTdDN0JcdTY4MzhcdTVGQzNcdTgyNzJcdUZGMDhcdTVGM0FcdThDMDMvXHU4MENDXHU2NjZGL1x1NjU4N1x1NUI1N1x1RkYwOVx1RkYwQ1x1NTE3Nlx1NEY1OVx1NzUzMSBPYnNpZGlhbiBcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTYzQThcdTdCOTdcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlT2JzaWRpYW5WYXJzKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgaCA9IE1hdGgucm91bmQoaHVlKTtcbiAgICBjb25zdCBsbyA9IE1hdGgubWF4KC0zMCwgTWF0aC5taW4oMzAsIGxpZ2h0bmVzc09mZnNldCkpO1xuXG4gICAgLy8gXHU1RjNBXHU4QzAzXHU4MjcyXG4gICAgY29uc3QgYWNjZW50UyA9IDQwO1xuICAgIGNvbnN0IGFjY2VudEwgPSBpc0RhcmsgPyA1MCA6IDQwO1xuICAgIGNvbnN0IGFjY2VudCA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TH0lKWA7XG4gICAgY29uc3QgYWNjZW50SG92ZXIgPSBgaHNsKCR7aH0sICR7YWNjZW50U30lLCAke2FjY2VudEwgKyA1fSUpYDtcblxuICAgIC8vIFx1ODBDQ1x1NjY2Rlx1ODI3MlxuICAgIGNvbnN0IGJnUyA9IGlzRGFyayA/IDggOiAxMjtcbiAgICBjb25zdCBiZ0wgPSBpc0RhcmtcbiAgICAgID8gTWF0aC5tYXgoNSwgMTIgKyBsbyAqIDAuMylcbiAgICAgIDogTWF0aC5taW4oOTgsIDk0ICsgbG8gKiAwLjE1KTtcbiAgICBjb25zdCBiZ1ByaW1hcnkgPSBgaHNsKCR7aH0sICR7YmdTfSUsICR7YmdMfSUpYDtcbiAgICBjb25zdCBiZ1NlY29uZGFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtpc0RhcmsgPyBiZ0wgKyAzIDogYmdMIC0gMn0lKWA7XG5cbiAgICAvLyBcdTY1ODdcdTVCNTdcdTgyNzJcbiAgICBjb25zdCB0ZXh0Tm9ybWFsID0gaXNEYXJrID8gYGhzbCgke2h9LCA2JSwgODglKWAgOiBgaHNsKCR7aH0sIDYlLCAxMiUpYDtcbiAgICBjb25zdCB0ZXh0TXV0ZWQgID0gaXNEYXJrID8gYGhzbCgke2h9LCA0JSwgNTUlKWAgOiBgaHNsKCR7aH0sIDQlLCA0NSUpYDtcblxuICAgIHJldHVybiB7XG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInOiBhY2NlbnRIb3ZlcixcbiAgICAgICctLXRleHQtYWNjZW50JzogYWNjZW50LFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JzogYmdQcmltYXJ5LFxuICAgICAgJy0tYmFja2dyb3VuZC1zZWNvbmRhcnknOiBiZ1NlY29uZGFyeSxcbiAgICAgICctLXRleHQtbm9ybWFsJzogdGV4dE5vcm1hbCxcbiAgICAgICctLXRleHQtbXV0ZWQnOiB0ZXh0TXV0ZWQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdThDMDNcdTgyNzJcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXG4gICAqIDUwbXMgZGVib3VuY2VcdUZGMENcdTk2MzJcdTZCNjJcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2XHU2RUQxXHU1NzU3XHU1RkVCXHU5MDFGXHU2MkQ2XHU2MkZEXHU0RUE3XHU3NTFGXHU5QUQ4XHU5ODkxIERPTSBcdTUxOTlcdTUxNjVcbiAgICovXG4gIGFwcGx5UGFsZXR0ZShodWU6IG51bWJlciwgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXIsIGlzRGFyazogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYWxldHRlU3luY1RpbWVyKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpO1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gZmFsc2U7IC8vIFx1NjVCMFx1OEMwM1x1ODI3Mlx1OEJGN1x1NkM0Mlx1NTIzMFx1Njc2NSBcdTIxOTIgXHU4OUUzXHU5NjY0XHU2MjkxXHU1MjM2XG4gICAgdGhpcy5fcGFsZXR0ZVN5bmNUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChUaGVtZUJyaWRnZS5fc3VwcHJlc3NlZCkgcmV0dXJuOyAvLyByZXN0b3JlRGVmYXVsdHMgXHU1NzI4XHU5NjMyXHU2Mjk2XHU3QTk3XHU1M0UzXHU1MTg1XHU4OEFCXHU4QzAzXHU3NTI4XG4gICAgICBjb25zdCB2YXJzID0gVGhlbWVCcmlkZ2UuY29tcHV0ZU9ic2lkaWFuVmFycyhodWUsIGxpZ2h0bmVzc09mZnNldCwgaXNEYXJrKTtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZhcnMpKSB7XG4gICAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLyoqIFx1NkUwNVx1OTY2NFx1NkNFOFx1NTE2NVx1NzY4NCBDU1MgXHU1M0Q4XHU5MUNGXHVGRjBDXHU2MDYyXHU1OTBEIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1OUVEOFx1OEJBNFx1NTAzQyAqL1xuICBzdGF0aWMgcmVzdG9yZURlZmF1bHRzKCk6IHZvaWQge1xuICAgIFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBUaGVtZUJyaWRnZS5JTkpFQ1RFRF9WQVJTKSB7XG4gICAgICBhY3RpdmVEb2N1bWVudC5ib2R5LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqIFx1NjUyRlx1NjMwMVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwOFx1NUI4Q1x1NjU3NFx1NTIxN1x1ODg2OFx1RkYwOSAqL1xuZXhwb3J0IGNvbnN0IEFMTE9XRURfQVVESU9fRVhURU5TSU9OUyA9IFtcbiAgJy5tcDMnLCAnLndhdicsICcub2dnJywgJy5mbGFjJywgJy5hYWMnLCAnLm00YScsICcud21hJywgJy53ZWJtJywgJy5vcHVzJyxcbl07XG5cbi8qKiBcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MEQgXHUyMTkyIE1JTUUgXHU3QzdCXHU1NzhCICovXG5jb25zdCBBVURJT19NSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLm1wMyc6ICAnYXVkaW8vbXBlZycsXG4gICcud2F2JzogICdhdWRpby93YXYnLFxuICAnLm9nZyc6ICAnYXVkaW8vb2dnJyxcbiAgJy5mbGFjJzogJ2F1ZGlvL2ZsYWMnLFxuICAnLmFhYyc6ICAnYXVkaW8vYWFjJyxcbiAgJy5tNGEnOiAgJ2F1ZGlvL21wNCcsXG4gICcud21hJzogICdhdWRpby94LW1zLXdtYScsXG4gICcud2VibSc6ICdhdWRpby93ZWJtJyxcbiAgJy5vcHVzJzogJ2F1ZGlvL29wdXMnLFxufTtcblxuLyoqIFx1NUI4Q1x1NjU3NCBNSU1FIFx1N0M3Qlx1NTc4Qlx1NjYyMFx1NUMwNFx1RkYwOFx1NTQyQiB3ZWJhcHAgXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHVGRjA5ICovXG5leHBvcnQgY29uc3QgTUlNRV9UWVBFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5odG1sJzogJ3RleHQvaHRtbDsgY2hhcnNldD11dGYtOCcsXG4gICcuY3NzJzogICd0ZXh0L2NzczsgY2hhcnNldD11dGYtOCcsXG4gICcuanMnOiAgICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0OyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5tanMnOiAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLmpzb24nOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICcucG5nJzogICdpbWFnZS9wbmcnLFxuICAnLmpwZyc6ICAnaW1hZ2UvanBlZycsXG4gICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJy5naWYnOiAgJ2ltYWdlL2dpZicsXG4gICcuc3ZnJzogICdpbWFnZS9zdmcreG1sJyxcbiAgJy5pY28nOiAgJ2ltYWdlL3gtaWNvbicsXG4gICcud29mZic6ICdmb250L3dvZmYnLFxuICAnLndvZmYyJzonZm9udC93b2ZmMicsXG4gICcudHRmJzogICdmb250L3R0ZicsXG4gIC4uLkFVRElPX01JTUVfVFlQRVMsXG59O1xuIiwgIi8qKlxuICogcHJvdG9jb2wudHMgXHUyMDE0IGhvc3QgXHU0RkE3XHU1MzRGXHU4QkFFXHU3QzdCXHU1NzhCXHU5NTVDXHU1MENGXG4gKlxuICogXHU2NzJDXHU2NTg3XHU0RUY2XHU2NjJGIHdlYmFwcC9hc3NldHMvc2NyaXB0cy91dGlscy9wcm90b2NvbC5qcyBcdTc2ODQgVHlwZVNjcmlwdCBcdTVFNzZcdTg4NENcdTUyNkZcdTY3MkNcdTMwMDJcbiAqIFx1NEUyNFx1N0FFRlx1NUZDNVx1OTg3Qlx1NEZERFx1NjMwMSBQUk9UT0NPTF9WRVJTSU9OIFx1NEUwRSBBTExfTUVTU0FHRV9UWVBFUyBcdTU0MENcdTZCNjVcdTMwMDJcbiAqXG4gKiBcdTgwNENcdThEMjNcdUZGMUFcbiAqIC0gUFJPVE9DT0xfVkVSU0lPTlx1RkYxQVx1NTM0Rlx1OEJBRVx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOFx1NEUyNFx1N0FFRlx1NEUwMFx1ODFGNFx1RkYwOVx1RkYxQlxuICogLSBBTExfTUVTU0FHRV9UWVBFU1x1RkYxQXdlYmFwcFx1MjE5NGhvc3QgXHU1M0NDXHU1NDExXHU1MTY4XHU5MEU4XHU1REYyXHU3N0U1XHU2RDg4XHU2MDZGXHU3QzdCXHU1NzhCXHU3Njg0XHU1MzU1XHU0RTAwXHU0RThCXHU1QjlFXHU2RTkwXHVGRjFCXG4gKiAtIElOQk9VTkRfUFJFRklYRVNcdUZGMUFob3N0IFx1NEZBNyBvbk1lc3NhZ2UgXHU3NjdEXHU1NDBEXHU1MzU1XHVGRjFCXG4gKiAtIENvbW1hbmRUeXBlXHVGRjFBXHU1QkZDXHU4MjJBL0FjdGlvbiBcdTYzMDdcdTRFRTRcdTgwNTRcdTU0MDhcdTdDN0JcdTU3OEJcdUZGMDhXZWJhcHBDb250cm9sbGVyIFx1NEY3Rlx1NzUyOFx1RkYwOVx1MzAwMlxuICovXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gIFx1NTM0Rlx1OEJBRVx1NzI0OFx1NjcyQyBcdTIwMTQgXHU5ODdCXHU0RTBFIHdlYmFwcC9hc3NldHMvc2NyaXB0cy91dGlscy9wcm90b2NvbC5qcyBcdTU0MENcdTZCNjVcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IFBST1RPQ09MX1ZFUlNJT04gPSAxO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vICBcdTZEODhcdTYwNkZcdTUyNERcdTdGMDBcdUZGMDhob3N0IFx1NEZBNyBvbk1lc3NhZ2UgXHU2NzY1XHU2RTkwXHU1MjREXHU3RjAwXHU3NjdEXHU1NDBEXHU1MzU1XHVGRjA5XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBJTkJPVU5EX1BSRUZJWEVTID0gWydzdG9yYWdlOicsICdhcHA6JywgJ2ZpbGU6JywgJ3RoZW1lOiddIGFzIGNvbnN0O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vICBcdTUxNjhcdTkwRThcdTVERjJcdTc3RTUgbWVzc2FnZSB0eXBlXHVGRjA4XHU1M0NDXHU1NDExXHVGRjA5XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBBTExfTUVTU0FHRV9UWVBFUyA9IFtcbiAgLy8gLS0tLSB3ZWJhcHAgXHUyMTkyIGhvc3QgLS0tLVxuICAnYXBwOnJlYWR5JyxcbiAgJ2FwcDpjbG9zZScsXG4gICdhcHA6c2F2ZVNlY3Rpb25Db25maWcnLFxuICAnYXBwOnNhdmVDdXN0b21Ob2lzZXMnLFxuICAnYXBwOnRoZW1lOnN5bmMnLFxuICAndGhlbWU6c3luY1BhbGV0dGUnLFxuICAnYXBwOmxpc3RWYXVsdEF1ZGlvRmlsZXMnLFxuICAnYXBwOnJlYWRWYXVsdEZpbGUnLFxuICAnYXBwOnJlYWRMb2NhbEZpbGUnLFxuICAnYXBwOnByb3h5QXVkaW9VcmwnLFxuICAvLyBzdG9yYWdlOipcdUZGMDgxNyBcdTRFMkFcdTVCNTBcdTdDN0JcdTU3OEJcdUZGMDlcbiAgJ3N0b3JhZ2U6cmVhZERheScsXG4gICdzdG9yYWdlOndyaXRlRGF5JyxcbiAgJ3N0b3JhZ2U6bGlzdERheXMnLFxuICAnc3RvcmFnZTpkZWxldGVEYXknLFxuICAnc3RvcmFnZTpnZXRTZXR0aW5nJyxcbiAgJ3N0b3JhZ2U6cHV0U2V0dGluZycsXG4gICdzdG9yYWdlOmdldEFsbFNldHRpbmdzJyxcbiAgJ3N0b3JhZ2U6Z2V0R29hbHMnLFxuICAnc3RvcmFnZTpwdXRHb2FscycsXG4gICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeScsXG4gICdzdG9yYWdlOnB1dFB1cmNoYXNlSGlzdG9yeScsXG4gICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknLFxuICAnc3RvcmFnZTpwdXRJbmNvbWVIaXN0b3J5JyxcbiAgJ3N0b3JhZ2U6Z2V0RGF5S2V5cycsXG4gICdzdG9yYWdlOmdldERheXNQYWdpbmF0ZWQnLFxuICAnc3RvcmFnZTpleHBvcnRBbGwnLFxuICAnc3RvcmFnZTppbXBvcnRBbGwnLFxuICAnc3RvcmFnZTpjbGVhckFsbCcsXG5cbiAgLy8gLS0tLSBob3N0IFx1MjE5MiB3ZWJhcHAgLS0tLVxuICAnZ29hbHM6Y2hhbmdlZCcsXG4gICd0aGVtZTpjaGFuZ2VkJyxcbiAgJ3RoZW1lOmZvbGxvd0Rpc2FibGVkJyxcbiAgJ3RoZW1lOnN5bmNQYWxldHRlRW5hYmxlZCcsXG4gICduYXY6cHJldkRheScsXG4gICduYXY6bmV4dERheScsXG4gICduYXY6dG9kYXknLFxuICAnYWN0aW9uOm9wZW5TdGF0cycsXG4gICdhY3Rpb246b3BlblNldHRpbmdzJyxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIEFwcE1lc3NhZ2VUeXBlID0gKHR5cGVvZiBBTExfTUVTU0FHRV9UWVBFUylbbnVtYmVyXTtcblxuLyoqIG5hdjogLyBhY3Rpb246IFx1NjMwN1x1NEVFNFx1N0M3Qlx1NTc4Qlx1RkYwOFdlYmFwcENvbnRyb2xsZXIgXHU0RjdGXHU3NTI4XHVGRjA5ICovXG5leHBvcnQgdHlwZSBDb21tYW5kVHlwZSA9IEV4dHJhY3Q8QXBwTWVzc2FnZVR5cGUsIGBuYXY6JHtzdHJpbmd9YCB8IGBhY3Rpb246JHtzdHJpbmd9YD47XG4iLCAiLyoqXG4gKiBXZWJhcHBDb250cm9sbGVyIFx1MjAxNCBcdTVCQkZcdTRFM0IgXHUyMTkyIHdlYmFwcCBcdTc2ODRcdTdDN0JcdTU3OEJcdTUzMTZcdTc2RjRcdThGREVcdTYzQTVcdTUzRTNcdUZGMDhQaGFzZTNcdUZGMDlcbiAqXG4gKiBcdTY2RkZcdTRFRTMgbWFpbi50cyBcdTRFMkRcdTY1NjNcdTg0M0RcdTc2ODRcdTVCNTdcdTdCMjZcdTRFMzJcdTYzMDdcdTRFRTQgYHNlbmRUb1dlYmFwcCgnbmF2OnByZXZEYXknKWBcdTMwMDJcbiAqIFx1NUJCRlx1NEUzQlx1NEZBN1x1NjUzOVx1NzUyOCBgbmF2UHJldkRheSgpYCBcdTdCNDlcdThCRURcdTRFNDlcdTUzMTZcdTY1QjlcdTZDRDVcdThDMDNcdTc1MjhcdUZGMENcdTUxODVcdTkwRThcdTRFQ0RcdTdFQ0ZcbiAqIGBEYWlseVJldmlld1ZpZXcuc2VuZENvbW1hbmRgIFx1OEQ3MFx1NjVFMlx1NjcwOSBwb3N0TWVzc2FnZSBcdTdFQkZcdTUzNEZcdThCQUVcdUZGMDhgbmF2OipgL2BhY3Rpb246KmBcdUZGMDlcdTIwMTRcdTIwMTRcbiAqIFx1NTM3M1x1MzAwQ1x1NzZGNFx1NjNBNSBBUEkgXHU5NUU4XHU5NzYyICsgXHU2NUUyXHU2NzA5XHU2ODY1XHU1MTdDXHU1QkI5XHU1QzQyXHUzMDBEXHVGRjBDd2ViYXBwIFx1NEZBN1x1NjVFMFx1OTcwMFx1NjUzOVx1NTJBOFx1RkYwQ1x1NTNFRlx1NTIwNlx1NkI2NVx1NTIwN1x1NjM2Mlx1MzAwMlxuICpcbiAqIFx1OEJFNVx1OEZCOVx1NzU0Q1x1NEZERFx1NjMwMVx1NEUwRFx1NTJBOFx1RkYxQXdlYmFwcCBcdTRFQ0RcdTkwMUFcdThGQzcgYG1lc3NhZ2VgIFx1NzZEMVx1NTQyQyBge3R5cGUsaWR9YCBcdTVFNzZcdTU0Q0RcdTVFOTRcdUZGMENcbiAqIFx1NTZFMFx1NkI2NFx1NjcyQ1x1OTFDRFx1Njc4NFx1OTZGNlx1NTZERVx1NUY1Mlx1OThDRVx1OTY2OVx1MzAwMVx1NEUxNFx1NTNFRlx1NTcyOFx1NUJCRlx1NEUzQlx1NEZBN1x1NTM1NVx1NkQ0Qlx1OTUwMVx1NUI5QVx1NjMwN1x1NEVFNFx1NjYyMFx1NUMwNFx1MzAwMlxuICpcbiAqIENvbW1hbmRUeXBlIFx1NEVDRSBwcm90b2NvbC50cyBcdTk2QzZcdTRFMkRcdTVCOUFcdTRFNDlcdUZGMDhcdTk2MzZcdTZCQjUzIFx1MDBCNyBcdTU5NTFcdTdFQTZcdTUzMTZcdUZGMDlcdUZGMENcbiAqIFx1NkI2NFx1NTkwNFx1OTFDRFx1NUJGQ1x1NTFGQVx1NEVFNVx1NEZERFx1NjMwMVx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYwOFx1NjVFMlx1NjcwOSBpbXBvcnQgeyBDb21tYW5kVHlwZSB9IGZyb20gJ1dlYmFwcENvbnRyb2xsZXInIFx1NEUwRFx1NzgzNFx1RkYwOVx1MzAwMlxuICovXG5cbmltcG9ydCB0eXBlIHsgQ29tbWFuZFR5cGUgfSBmcm9tICcuL3Byb3RvY29sJztcblxuZXhwb3J0IHR5cGUgeyBDb21tYW5kVHlwZSB9IGZyb20gJy4vcHJvdG9jb2wnO1xuXG4vKiogXHU2MzA3XHU0RUU0XHU0RTBCXHU1M0QxXHU3NkVFXHU2ODA3XHVGRjA4RGFpbHlSZXZpZXdWaWV3IFx1NkVFMVx1OERCM1x1NkI2NFx1NTk1MVx1N0VBNlx1RkYwOSAqL1xuaW50ZXJmYWNlIENvbW1hbmRUYXJnZXQge1xuICBzZW5kQ29tbWFuZCh0eXBlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgV2ViYXBwQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZ2V0VGFyZ2V0OiAoKSA9PiBDb21tYW5kVGFyZ2V0IHwgbnVsbCkge31cblxuICBwcml2YXRlIHNlbmQodHlwZTogQ29tbWFuZFR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLmdldFRhcmdldCgpPy5zZW5kQ29tbWFuZCh0eXBlKTtcbiAgfVxuXG4gIC8qKiBcdTUyNERcdTRFMDBcdTU5MjkgKi9cbiAgbmF2UHJldkRheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ25hdjpwcmV2RGF5Jyk7XG4gIH1cblxuICAvKiogXHU1NDBFXHU0RTAwXHU1OTI5ICovXG4gIG5hdk5leHREYXkoKTogdm9pZCB7XG4gICAgdGhpcy5zZW5kKCduYXY6bmV4dERheScpO1xuICB9XG5cbiAgLyoqIFx1NTZERVx1NTIzMFx1NEVDQVx1NTkyOSAqL1xuICBuYXZUb2RheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ25hdjp0b2RheScpO1xuICB9XG5cbiAgLyoqIFx1NjI1M1x1NUYwMFx1N0VERlx1OEJBMVx1NTIwNlx1Njc5MCAqL1xuICBvcGVuU3RhdHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZW5kKCdhY3Rpb246b3BlblN0YXRzJyk7XG4gIH1cblxuICAvKiogXHU2MjUzXHU1RjAwXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFICovXG4gIG9wZW5TZXR0aW5ncygpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ2FjdGlvbjpvcGVuU2V0dGluZ3MnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTkwMUFcdTc3RTUgd2ViYXBwIFx1NzZFRVx1NjgwN1x1NUU5M1x1NURGMlx1NTNEOFx1NjZGNFx1RkYwOGhvc3RcdTIxOTJ3ZWJhcHBcdUZGMDlcdTMwMDJcbiAgICogd2ViYXBwIFx1NjUzNlx1NTIzMFx1NTQwRVx1OEMwM1x1NzUyOCBHb2FsU2VydmljZS5sb2FkKCkgXHU5MUNEXHU4QkZCIGdvYWxzLmpzb24gXHU1RTc2IHN0b3JlLm5vdGlmeSgpIFx1NUM0MFx1OTBFOFx1NTIzN1x1NjVCMFx1RkYwQ1xuICAgKiBcdTRFMERcdTg5RTZcdTUzRDFcdTUxNjhcdTVDNDAgcmVuZGVyQWxsXHVGRjBDXHU5MDdGXHU1MTREXHU1MUIyXHU2Mzg5XHU2NUY2XHU5NUY0XHU4Rjc0IC8gXHU4RkRCXHU4ODRDXHU0RTJEXHU3MkI2XHU2MDAxXHUzMDAyXG4gICAqL1xuICBub3RpZnlHb2Fsc0NoYW5nZWQoKTogdm9pZCB7XG4gICAgdGhpcy5nZXRUYXJnZXQoKT8uc2VuZENvbW1hbmQoJ2dvYWxzOmNoYW5nZWQnKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEJhbWJvb1Jldmlld1BsdWdpbiBmcm9tICcuLi8uLi9tYWluJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi4vYnJpZGdlL1RoZW1lQnJpZGdlJztcblxuLyoqIE9ic2lkaWFuIFx1NjNEMlx1NEVGNlx1OEZEMFx1ODg0Q1x1NjVGNlx1NkNFOFx1NTE2NVx1NzY4NFx1NEUzQlx1N0E5N1x1NTNFMyBkb2N1bWVudFx1RkYwOFx1OTc1RSBpZnJhbWUgXHU1MTg1XHU3Njg0IGRvY3VtZW50XHVGRjA5ICovXG5kZWNsYXJlIGNvbnN0IGFjdGl2ZURvY3VtZW50OiBEb2N1bWVudDtcblxuLyoqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NzY3RFx1NTY2QVx1OTdGM1x1OTdGM1x1NkU5MCAqL1xuZXhwb3J0IGludGVyZmFjZSBOb2lzZUl0ZW0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHR5cGU6ICd1cmwnIHwgJ3ZhdWx0JyB8ICdnZW5lcmF0ZWQnO1xuICB1cmw/OiBzdHJpbmc7XG4gIHBhdGg/OiBzdHJpbmc7XG4gIHZvbHVtZT86IG51bWJlcjtcbn1cblxuLyoqIFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NjNBNVx1NTNFMyAqL1xuZXhwb3J0IGludGVyZmFjZSBCYW1ib29SZXZpZXdTZXR0aW5ncyB7XG4gIC8qKiBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdTY4MzlcdThERUZcdTVGODQgKi9cbiAgZGF0YVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEgKi9cbiAgZW5hYmxlTWFya2Rvd25TeW5jOiBib29sZWFuO1xuICAvKiogXHU2NzdGXHU1NzU3XHU3QkExXHU3NDA2XHU5MTREXHU3RjZFXHVGRjA4SlNPTiBcdTg5RTNcdTY3OTBcdTU0MEVcdTdFRDNcdTY3ODRcdTRFMERcdTU2RkFcdTVCOUFcdUZGMENcdTRGN0ZcdTc1MjhcdTVCQkRcdTY3N0VcdTdDN0JcdTU3OEJcdUZGMDkgKi9cbiAgc2VjdGlvbkNvbmZpZzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA5ICovXG4gIHRoZW1lUGF0aDogc3RyaW5nO1xuICAvKiogXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHVGRjA4VmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU3NTU5XHU3QTdBXHU1MjE5XHU2MjZCXHU2M0NGXHU1MTY4XHU1RTkzXHVGRjA5ICovXG4gIG5vaXNlUGF0aDogc3RyaW5nO1xuICAvKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwXHU1MjE3XHU4ODY4ICovXG4gIG5vaXNlSXRlbXM6IE5vaXNlSXRlbVtdO1xuICAvKiogXHU2NjJGXHU1NDI2XHU1QzA2IHdlYmFwcCBcdThDMDNcdTgyNzJcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyICovXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogYm9vbGVhbjtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1OEJBOVx1NjNEMlx1NEVGNlx1OTE0RFx1ODI3Mlx1OERERlx1OTY4RiBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdUZGMDhcdThCRkJcdTUzRDYgLS1pbnRlcmFjdGl2ZS1hY2NlbnQgXHU1M0NEXHU2M0E4XHU4MjcyXHU3NkY4XHVGRjA5ICovXG4gIGZvbGxvd09ic2lkaWFuVGhlbWU6IGJvb2xlYW47XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQUkgXHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU4OUM0XHU1MjEyXHVGRjA4XHU3QjE0XHU4QkIwIFx1MjE5MiBcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdUZGMDkgKi9cbiAgYWlFbmFibGVkOiBib29sZWFuO1xuICAvKiogQUkgXHU2NzBEXHU1MkExIEFQSSBLZXlcdUZGMDhCZWFyZXIgXHU5Mjc0XHU2NzQzXHVGRjA5ICovXG4gIGFpQXBpS2V5OiBzdHJpbmc7XG4gIC8qKiBBSSBcdTY3MERcdTUyQTEgQmFzZSBVUkxcdUZGMDhcdTRFMERcdTU0MkIgL2NoYXQvY29tcGxldGlvbnMgXHU1NDBFXHU3RjAwXHVGRjBDXHU1OTgyIGh0dHBzOi8vYXBpLmRlZXBzZWVrLmNvbS92MVx1RkYwOSAqL1xuICBhaUJhc2VVcmw6IHN0cmluZztcbiAgLyoqIFx1NkEyMVx1NTc4Qlx1NTQwRFx1RkYwOFx1NTk4MiBkZWVwc2Vlay1jaGF0XHVGRjA5ICovXG4gIGFpTW9kZWw6IHN0cmluZztcbiAgLyoqIFx1OUVEOFx1OEJBNFx1NjJDNlx1ODlFM1x1N0M5Mlx1NUVBNlx1RkYxQVx1N0M5NygyLTMpIC8gXHU0RTJEKDMtNikgLyBcdTdFQzYoNS04KSBcdTVCNTBcdTk4NzkgKi9cbiAgYWlEZWNvbXBvc2VEZXB0aDogJ1x1N0M5NycgfCAnXHU0RTJEJyB8ICdcdTdFQzYnO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQmFtYm9vUmV2aWV3U2V0dGluZ3MgPSB7XG4gIGRhdGFQYXRoOiAnYmFtYm9vLXJldmlldycsXG4gIGVuYWJsZU1hcmtkb3duU3luYzogdHJ1ZSxcbiAgc2VjdGlvbkNvbmZpZzogbnVsbCxcbiAgdGhlbWVQYXRoOiAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JyxcbiAgbm9pc2VQYXRoOiAnJyxcbiAgbm9pc2VJdGVtczogW10sXG4gIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogZmFsc2UsXG4gIGZvbGxvd09ic2lkaWFuVGhlbWU6IHRydWUsXG4gIGFpRW5hYmxlZDogZmFsc2UsXG4gIGFpQXBpS2V5OiAnJyxcbiAgYWlCYXNlVXJsOiAnaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tL3YxJyxcbiAgYWlNb2RlbDogJ2RlZXBzZWVrLWNoYXQnLFxuICBhaURlY29tcG9zZURlcHRoOiAnXHU0RTJEJyxcbn07XG5cbi8qKlxuICogUGx1Z2luU2V0dGluZ3MgLSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdThCQkVcdTdGNkVcdTk3NjJcdTY3N0ZcbiAqL1xuZXhwb3J0IGNsYXNzIFBsdWdpblNldHRpbmdzIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IEJhbWJvb1Jldmlld1BsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgfVxuXG4gIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuICAgIGNvbnRhaW5lckVsLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LXNldHRpbmdzJyk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwIC0gXHU4QkJFXHU3RjZFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gPT09IFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU4REVGXHU1Rjg0XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkVcdTU3MjggVmF1bHQgXHU0RTJEXHU3Njg0XHU1QjU4XHU1MEE4XHU3NkVFXHU1RjU1XHVGRjA4XHU0RkVFXHU2NTM5XHU1NDBFXHU5NzAwXHU5MUNEXHU1NDJGXHU2M0QyXHU0RUY2XHVGRjA5JylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdiYW1ib28tcmV2aWV3JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGF0YVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGF0YVBhdGggPSB2YWx1ZSB8fCAnYmFtYm9vLXJldmlldyc7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIE1hcmtkb3duIFx1NjQ1OFx1ODk4MVx1NTQwQ1x1NkI2NVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMCBNYXJrZG93biBcdTY0NThcdTg5ODEnKVxuICAgICAgLnNldERlc2MoJ1x1NkJDRlx1NkIyMVx1NEZERFx1NUI1OFx1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NjVGNlx1RkYwQ1x1ODFFQVx1NTJBOFx1NTcyOCByZXZpZXdzLyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc1MUZcdTYyMTBcdTUzRUZcdThCRkJcdTc2ODQgLm1kIFx1NjU4N1x1NEVGNicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlTWFya2Rvd25TeW5jID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdTRFM0JcdTk4OThcdTUyQThcdTY1NDggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OFx1OERFRlx1NUY4NCcpXG4gICAgICAuc2V0RGVzYygnVmF1bHQgXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU1QjU4XHU2NTNFXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4IC5qcyBcdTY1ODdcdTRFRjZcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1N0FGOVx1Njc5N1x1NTkwRFx1NzZEOFx1NEUzQlx1OTg5OCcpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy50aGVtZVBhdGggPSB2YWx1ZSB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NzY3RFx1NTY2QVx1OTdGMyA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU3NjdEXHU1NjZBXHU5N0YzJykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU3NjdEXHU1NjZBXHU5N0YzXHU2NTg3XHU0RUY2XHU1OTM5JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTYzMDdcdTVCOUFcdTU0MEVcdTRFQzVcdTYyNkJcdTYzQ0ZcdThCRTVcdTY1ODdcdTRFRjZcdTU5MzlcdTUxODVcdTc2ODRcdTk3RjNcdTk4OTFcdTY1ODdcdTRFRjZcdTMwMDJcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTY1NzRcdTRFMkFcdTVFOTNcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1x1NzY3RFx1NTY2QVx1OTdGMyBcdTYyMTZcdTc1NTlcdTdBN0FcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTMnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mubm9pc2VQYXRoID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU4QzAzXHU4MjcyXHU4MDU0XHU1MkE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdThEREZcdTk2OEYgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5MTREXHU4MjcyJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMENcdTYzRDJcdTRFRjZcdTY1NzRcdTRGNTNcdTkxNERcdTgyNzJcdTRGMUFcdThEREZcdTk2OEZcdTVGNTNcdTUyNEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU3Njg0XHU1RjNBXHU4QzAzXHU4MjcyXHVGRjA4LS1pbnRlcmFjdGl2ZS1hY2NlbnRcdUZGMDlcdTMwMDJcdTUyMDdcdTYzNjIgQmFtYm9vIENoaW5hIFx1NzY4NFx1N0FGOVx1NUY3MSAvIFx1NThBOFx1NTkxQyAvIFx1ODBFRFx1ODEwMiAvIFx1OTc1Mlx1N0VGRlx1N0I0OVx1NjEwRlx1NTg4M1x1NjVGNlx1RkYwQ1x1NjNEMlx1NEVGNlx1OTE0RFx1ODI3Mlx1OTY4Rlx1NEU0Qlx1ODA1NFx1NTJBOCcpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJRnJhbWVFbGVtZW50PignLmJhbWJvby1yZXZpZXctZnJhbWUnKTtcbiAgICAgICAgICAgIGlmICghZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAvLyBcdTdBQ0JcdTUzNzNcdTYzQThcdTkwMDFcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTVGM0FcdThDMDNcdTgyNzJcdTUzQ0RcdTYzQThcdTc2ODRcdTgyNzJcdTc2RjggKyBcdTRGQTdcdThGQjlcdTY4MEZcdTgwQ0NcdTY2NkZcdTgyNzJcdTZFMjkgKyBcdTY1ODdcdTVCNTdcdTgyNzJcdTZFMjlcbiAgICAgICAgICAgICAgY29uc3QgYWNjZW50ID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWludGVyYWN0aXZlLWFjY2VudCcpXG4gICAgICAgICAgICAgICAgLnRyaW0oKTtcbiAgICAgICAgICAgICAgY29uc3QgaHVlID0gVGhlbWVCcmlkZ2UucmdiVG9IdWUoYWNjZW50KTtcbiAgICAgICAgICAgICAgY29uc3Qgc2lkZWJhciA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScpXG4gICAgICAgICAgICAgICAgLnRyaW0oKTtcbiAgICAgICAgICAgICAgY29uc3QgYmcgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyhzaWRlYmFyKTtcbiAgICAgICAgICAgICAgY29uc3QgdGV4dE5vcm1hbCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW5vcm1hbCcpXG4gICAgICAgICAgICAgICAgLnRyaW0oKTtcbiAgICAgICAgICAgICAgY29uc3QgdGV4dE5vcm1hbFJnYiA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHRleHROb3JtYWwpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0TXV0ZWQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tdGV4dC1tdXRlZCcpXG4gICAgICAgICAgICAgICAgLnRyaW0oKTtcbiAgICAgICAgICAgICAgY29uc3QgdGV4dE11dGVkUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE11dGVkKTtcbiAgICAgICAgICAgICAgY29uc3QgcGF5bG9hZDogeyBpc0Rhcms6IGJvb2xlYW47IGh1ZT86IG51bWJlcjsgYmc/OiBzdHJpbmc7IHRleHROb3JtYWw/OiBzdHJpbmc7IHRleHRNdXRlZD86IHN0cmluZyB9ID0ge1xuICAgICAgICAgICAgICAgIGlzRGFyazogYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgaWYgKGh1ZSAhPT0gbnVsbCkgcGF5bG9hZC5odWUgPSBodWU7XG4gICAgICAgICAgICAgIGlmIChiZyAhPT0gbnVsbCkgcGF5bG9hZC5iZyA9IGJnO1xuICAgICAgICAgICAgICBpZiAodGV4dE5vcm1hbFJnYiAhPT0gbnVsbCkgcGF5bG9hZC50ZXh0Tm9ybWFsID0gdGV4dE5vcm1hbFJnYjtcbiAgICAgICAgICAgICAgaWYgKHRleHRNdXRlZFJnYiAhPT0gbnVsbCkgcGF5bG9hZC50ZXh0TXV0ZWQgPSB0ZXh0TXV0ZWRSZ2I7XG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpjaGFuZ2VkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBcdTUxNzNcdTk1RURcdTgwNTRcdTUyQTggXHUyMTkyIFx1OTAxQVx1NzdFNSBpZnJhbWUgXHU2MDYyXHU1OTBEXHU3NTI4XHU2MjM3XHU2MjRCXHU1MkE4XHU4QzAzXHU4MjcyXG4gICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aGVtZTpmb2xsb3dEaXNhYmxlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7fSxcbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1NUMwNlx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbicpXG4gICAgICAuc2V0RGVzYygnXHU2MjUzXHU1RjAwXHU1NDBFXHVGRjBDd2ViYXBwIFx1NTE4NVx1NjBBQ1x1NkQ2RVx1ODNEQ1x1NTM1NVx1NzY4NFx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdThDMDNcdTgyNzJcdTRGMUFcdTVCOUVcdTY1RjZcdTU0MENcdTZCNjVcdTUyMzAgT2JzaWRpYW4gXHU3Njg0XHU1MzlGXHU3NTFGXHU3NTRDXHU5NzYyXHU5MTREXHU4MjcyJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICBUaGVtZUJyaWRnZS5yZXN0b3JlRGVmYXVsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gYWN0aXZlRG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSUZyYW1lRWxlbWVudD4oJy5iYW1ib28tcmV2aWV3LWZyYW1lJyk7XG4gICAgICAgICAgICBpZiAoZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOnN5bmNQYWxldHRlRW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgaWQ6ICdzZXR0aW5nc18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGVuYWJsZWQ6IHZhbHVlIH1cbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBBSSBcdTg5QzRcdTUyMTIgPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ0FJIFx1ODlDNFx1NTIxMlx1RkYwOFx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMCBcdTIxOTIgXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHVGRjA5Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1NDJGXHU3NTI4IEFJIFx1ODlDNFx1NTIxMicpXG4gICAgICAuc2V0RGVzYygnXHU1RjAwXHU1NDJGXHU1NDBFXHVGRjBDXHU1M0VGXHU1NzI4XHU3QjE0XHU4QkIwXHU0RTJEXHU4RkQwXHU4ODRDXHUzMDBDQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU1QzA2XHU1RjUzXHU1MjREXHU3QjE0XHU4QkIwXHU4RjZDXHU0RTNBXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHUzMDBEXHU1NDdEXHU0RUU0XHVGRjBDXHU3NTMxXHU1OTI3XHU2QTIxXHU1NzhCXHU2MkM2XHU4OUUzXHU3NkVFXHU2ODA3XHU1RTc2XHU1MTk5XHU1MTY1XHU1OTBEXHU3NkQ4XHUzMDAyJylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFpRW5hYmxlZClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5haUVuYWJsZWQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQVBJIEtleScpXG4gICAgICAuc2V0RGVzYygnXHU1OTI3XHU2QTIxXHU1NzhCXHU2NzBEXHU1MkExXHU5Mjc0XHU2NzQzXHU1QkM2XHU5NEE1XHVGRjA4QmVhcmVyIFRva2VuXHVGRjA5XHUzMDAyXHU0RUM1XHU0RkREXHU1QjU4XHU1NzI4XHU2NzJDXHU1RTkzIHNldHRpbmdzLmpzb25cdUZGMENcdTRFMERcdTRFMEFcdTRGMjBcdTMwMDInKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ3NrLS4uLicpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFpQXBpS2V5KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpQXBpS2V5ID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC50aGVuKChzZXR0aW5nKSA9PiB7XG4gICAgICAgIC8vIFx1NUJDNlx1NzgwMVx1Njg0Nlx1NjgzN1x1NUYwRlx1RkYxQVx1OEY5M1x1NTE2NVx1OTY5MFx1ODVDRlxuICAgICAgICBjb25zdCBpbnB1dCA9IHNldHRpbmcuY29udHJvbEVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jyk7XG4gICAgICAgIGlmIChpbnB1dCkgaW5wdXQudHlwZSA9ICdwYXNzd29yZCc7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0Jhc2UgVVJMJylcbiAgICAgIC5zZXREZXNjKCdBUEkgXHU1N0ZBXHU1NzMwXHU1NzQwXHVGRjA4XHU0RTBEXHU1NDJCIC9jaGF0L2NvbXBsZXRpb25zIFx1NTQwRVx1N0YwMFx1RkYwOVx1MzAwMlx1OUVEOFx1OEJBNCBEZWVwU2VlayB2MVx1MzAwMicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tL3YxJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlCYXNlVXJsKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpQmFzZVVybCA9IHZhbHVlLnRyaW0oKSB8fCAnaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tL3YxJztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU2QTIxXHU1NzhCJylcbiAgICAgIC5zZXREZXNjKCdcdTZBMjFcdTU3OEJcdTU0MERcdUZGMENcdTU5ODIgZGVlcHNlZWstY2hhdCAvIGdwdC00by1taW5pXHUzMDAyXHU5NzAwXHU1MTdDXHU1QkI5IE9wZW5BSSBDaGF0IENvbXBsZXRpb25zIEpTT04gXHU2QTIxXHU1RjBGXHUzMDAyJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdkZWVwc2Vlay1jaGF0JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlNb2RlbClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5haU1vZGVsID0gdmFsdWUudHJpbSgpIHx8ICdkZWVwc2Vlay1jaGF0JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU5RUQ4XHU4QkE0XHU2MkM2XHU4OUUzXHU3QzkyXHU1RUE2JylcbiAgICAgIC5zZXREZXNjKCdBSSBcdTYyOEFcdTc2RUVcdTY4MDdcdTYyQzZcdTYyMTBcdTVCNTBcdTk4NzlcdTc2ODRcdTdFQzZcdTdDOTJcdTVFQTZcdUZGMUFcdTdDOTcoMi0zKSAvIFx1NEUyRCgzLTYpIC8gXHU3RUM2KDUtOClcdTMwMDJcdTUzRUZcdTU3MjhcdTVCQTFcdTk2MDVcdTVGMzlcdTdBOTdcdTkxQ0NcdTUxOERcdTkwMTBcdTY3NjFcdTUyMjBcdTY1MzlcdTMwMDInKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cbiAgICAgICAgZHJvcGRvd25cbiAgICAgICAgICAuYWRkT3B0aW9uKCdcdTdDOTcnLCAnXHU3Qzk3XHVGRjA4Mi0zIFx1NUI1MFx1OTg3OVx1RkYwOScpXG4gICAgICAgICAgLmFkZE9wdGlvbignXHU0RTJEJywgJ1x1NEUyRFx1RkYwODMtNiBcdTVCNTBcdTk4NzlcdUZGMDknKVxuICAgICAgICAgIC5hZGRPcHRpb24oJ1x1N0VDNicsICdcdTdFQzZcdUZGMDg1LTggXHU1QjUwXHU5ODc5XHVGRjA5JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlEZWNvbXBvc2VEZXB0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5haURlY29tcG9zZURlcHRoID0gdmFsdWUgYXMgJ1x1N0M5NycgfCAnXHU0RTJEJyB8ICdcdTdFQzYnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyBcdTUxNzNcdTRFOEVcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU1MTczXHU0RThFJykuc2V0SGVhZGluZygpO1xuXG4gICAgLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwIFx1NTM2MVx1NzI0NyAxXHVGRjFBXHU2M0QyXHU0RUY2XHU3QjgwXHU0RUNCIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuICAgIGNvbnN0IHBsdWdpbkJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBwbHVnaW5Cb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0InLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdCYW1ib28gSW1tb3J0YWxzXHVGRjA4XHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHVGRjA5XHU2NjJGXHU0RTAwXHU2QjNFXHU1N0ZBXHU0RThFXHU4MkNGXHU4MDU0XHU2M0E3XHU1MjM2XHU4QkJBXHU0RTRCXHU3MjM2XHU3RUY0XHU1MTRCXHU2MjU4XHUwMEI3XHU2ODNDXHU1MzYyXHU0RUMwXHU3OUQxXHU1OTJCXHU2M0QwXHU1MUZBXHU3Njg0XCJPR0FTXCJcdTc0MDZcdTVGRjVcdUZGMENcdTRFMTNcdTRFM0FcdTRFMkFcdTRFQkFcdTYyNTNcdTkwMjBcdTc2ODRcdTRFMkRcdTU2RkRcdTk4Q0VcdTc2RUVcdTY4MDdcdTgxRUFcdTUyQThcdTUzMTZcdTUyMDZcdTkxNERcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnXG4gICAgfSk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDJcdUZGMUFcdTRGNUNcdTgwMDUgKyBcdTRGNUNcdTU0QzEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgYXV0aG9yQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQgYmFtYm9vLWFib3V0LWF1dGhvcicgfSk7XG4gICAgY29uc3QgYXV0aG9yUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm93JyB9KTtcbiAgICBjb25zdCBhdmF0YXIgPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF2YXRhcicgfSk7XG4gICAgLy8gXHU0RUNFXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHU4QkZCXHU1M0Q2XHU1OTM0XHU1MENGXHVGRjA4XHU5MDFBXHU4RkM3IFZhdWx0IEFQSSBcdThCRkJcdTUzRDYgLm9ic2lkaWFuL3BsdWdpbnMvIFx1NEUwQlx1NzY4NFx1ODFFQVx1NjcwOVx1OEQ0NFx1NkU5MFx1RkYwOVxuICAgIC8vIGZpcmUtYW5kLWZvcmdldFx1RkYxQVx1NTkzNFx1NTBDRlx1OTc1RVx1NTE3M1x1OTUyRVx1RkYwQ1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNVx1OTc1OVx1OUVEOFx1NjYzRVx1NzkzQVx1OUVEOFx1OEJBNFx1N0E3QVx1NTkzNFx1NTBDRlxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbkRpciA9IHRoaXMucGx1Z2luLm1hbmlmZXN0LmRpciA/PyAnJztcbiAgICAgICAgY29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBbXG4gICAgICAgICAgYCR7cGx1Z2luRGlyfS9hdXRob3ItYXZhdGFyLmpwZ2AsXG4gICAgICAgICAgYCR7cGx1Z2luRGlyfS93ZWJhcHAvYXNzZXRzL2ltYWdlcy9hdXRob3ItYXZhdGFyLmpwZ2AsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3QgYXZhdGFyUGF0aCBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgYWRhcHRlci5leGlzdHMoYXZhdGFyUGF0aCk7XG4gICAgICAgICAgaWYgKCFleGlzdHMpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGF2YXRhckRhdGEgPSBhd2FpdCBhZGFwdGVyLnJlYWRCaW5hcnkoYXZhdGFyUGF0aCk7XG4gICAgICAgICAgY29uc3QgYjY0ID0gQnVmZmVyLmZyb20oYXZhdGFyRGF0YSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICAgIGF2YXRhci5zZXRDc3NTdHlsZXMoe1xuICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBgdXJsKGRhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiNjR9KWAsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBzaWxlbnRseSBza2lwIFx1MjAxNCBzaG93IGRlZmF1bHQgZW1wdHkgYXZhdGFyICovIH1cbiAgICB9KSgpO1xuXG5cbiAgICBjb25zdCBhdXRob3JJbmZvID0gYXV0aG9yUm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItaW5mbycgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1N0ZCRFx1OUNERVx1NTQxQicsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3ItbmFtZScgfSk7XG4gICAgYXV0aG9ySW5mby5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NTVCNVx1NUI1N1x1OTk4Nlx1NTIxQlx1NTlDQlx1NEVCQScsIGNsczogJ2JhbWJvby1hYm91dC1hdXRob3Itcm9sZScgfSk7XG5cbiAgICAvLyBcdTRGNUNcdTU0QzFcdTUzM0FcbiAgICBhdXRob3JCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdPYnNpZGlhbiBcdTYzRDJcdTRFRjZcdTRGNUNcdTU0QzEnLCBjbHM6ICdiYW1ib28tYWJvdXQtd29ya3MtbGFiZWwnIH0pO1xuICAgIGNvbnN0IHdvcmtzUm93ID0gYXV0aG9yQm94LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1yb3cnIH0pO1xuXG4gICAgW3sgbmFtZTogJ1x1N0FGOVx1NTNGNlx1OThERVx1NTIwMycsIHVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9taWFvemlndWFuL29ic2lkaWFuLUJhbWJvby1EYXJ0cycgfSxcbiAgICAgeyBuYW1lOiAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tYmFtYm9vLWltbW9ydGFscycgfV0uZm9yRWFjaCh3b3JrID0+IHtcbiAgICAgIGNvbnN0IHRhZyA9IHdvcmtzUm93LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiB3b3JrLm5hbWUsIGNsczogJ2JhbWJvby1hYm91dC10YWcnIH0pO1xuICAgICAgaWYgKHdvcmsudXJsKSB7XG4gICAgICAgIHRhZy5zZXRDc3NTdHlsZXMoeyBjdXJzb3I6ICdwb2ludGVyJyB9KTtcbiAgICAgICAgdGFnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5vcGVuKHdvcmsudXJsLCAnX2JsYW5rJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGXG4gICAgY29uc3QgY29udGFjdEJveCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1hYm91dC1jYXJkJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGJywgY2xzOiAnYmFtYm9vLWFib3V0LWxhYmVsJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU5MEFFXHU3QkIxXHVGRjFBeWFueXVsaW4yMTAwQHFxLmNvbScsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgICBjb250YWN0Qm94LmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1RkFFXHU0RkUxXHVGRjFBeWFuaHU5NCcsIGNsczogJ2JhbWJvby1hYm91dC1kZXNjJyB9KTtcbiAgfVxufVxuIiwgIi8qKlxuICogTWFya2Rvd25QbGFubmVyIFx1MjAxNCBcdTdCMTRcdThCQjBcdTZCNjNcdTY1ODcgXHUyMTkyIFx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1ODlDNFx1NTIxMlx1NTY2OFx1RkYwOFBoYXNlIDFcdUZGMDlcbiAqXG4gKiBcdTgwNENcdThEMjNcdUZGMDhcdTUzNTVcdTRFMDBcdTMwMDFcdTUzRUZcdTUzNTVcdTZENEJcdUZGMDlcdUZGMUFcbiAqICAtIGJ1aWxkUHJvbXB0XHVGRjFBXHU2MjhBXHU3QjE0XHU4QkIwXHU2QjYzXHU2NTg3ICsgXHU2MkM2XHU4OUUzXHU3QzkyXHU1RUE2XHU3RkZCXHU4QkQxXHU2MjEwXHU3Q0ZCXHU3RURGL1x1NzUyOFx1NjIzN1x1NjNEMFx1NzkzQVx1OEJDRFx1RkYwOFx1Nzg2Q1x1N0VBNlx1Njc1RiBKU09OIFNjaGVtYVx1RkYwOVx1MzAwMlxuICogIC0gcGFyc2VHb2Fsc1x1RkYxQVx1NEVDRVx1NkEyMVx1NTc4Qlx1NTZERVx1NjI2N1x1NjU4N1x1NjcyQ1x1NEUyRFx1NjNEMFx1NTNENiBKU09OIFx1NjU3MFx1N0VDNFx1NUU3Nlx1NjYyMFx1NUMwNFx1NEUzQSBHb2FsSXRlbVtdXHVGRjA4XHU1QkI5XHU1RkNEIGBgYGpzb24gXHU1NkY0XHU2ODBGXHVGRjA5XHUzMDAyXG4gKiAgLSBwbGFuRnJvbU5vdGVcdUZGMUFcdTdGMTZcdTYzOTJcdTdGNTFcdTdFRENcdThCRjdcdTZDNDJcdUZGMDhyZXF1ZXN0VXJsIFx1N0VENSBDT1JTXHVGRjA5KyBcdTg5RTNcdTY3OTAgKyBcdTU5MzFcdThEMjVcdTkxQ0RcdThCRDVcdTRFMDBcdTZCMjFcdTMwMDJcbiAqXG4gKiBcdTdGNTFcdTdFRENcdTVDNDJcdTUzRUZcdTZDRThcdTUxNjVcdUZGMDhmZXRjaEZuXHVGRjA5XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHU3NTI4IGZha2UgXHU2NkZGXHU0RUUzXHU3NzFGXHU1QjlFIHJlcXVlc3RVcmxcdUZGMENcdTRGRERcdTYzMDFcdTk2RjYgT2JzaWRpYW4gXHU4RkQwXHU4ODRDXHU2NUY2XHU0RjlEXHU4RDU2XHUzMDAyXG4gKi9cblxuaW1wb3J0IHsgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEdPQUxfQ0FURUdPUklFUywgdHlwZSBHb2FsQ2F0ZWdvcnksIHR5cGUgR29hbEl0ZW0sIHR5cGUgR29hbFN1Ykl0ZW0gfSBmcm9tICcuLi90eXBlcy9kYXRhJztcbmltcG9ydCB7IGNsZWFuRGFpbHlNaW4gfSBmcm9tICcuL0dvYWxDYXJkVmFsaWRhdG9yJztcblxuLyoqIFx1NjJDNlx1ODlFM1x1N0M5Mlx1NUVBNiBcdTIxOTIgXHU1RUZBXHU4QkFFXHU1QjUwXHU5ODc5XHU2NTcwXHU5MUNGXHU1MzNBXHU5NUY0XHU2M0NGXHU4RkYwICovXG5jb25zdCBERVBUSF9ISU5UOiBSZWNvcmQ8J1x1N0M5NycgfCAnXHU0RTJEJyB8ICdcdTdFQzYnLCBzdHJpbmc+ID0ge1xuICBcdTdDOTc6ICcyLTMnLFxuICBcdTRFMkQ6ICczLTYnLFxuICBcdTdFQzY6ICc1LTgnLFxufTtcblxuLyoqIEFJIFx1NjcwRFx1NTJBMVx1OEZENFx1NTZERVx1NzY4NFx1NjcwMFx1NUMwRlx1N0VEM1x1Njc4NFx1RkYwOFx1NTE3Q1x1NUJCOSBPYnNpZGlhbiByZXF1ZXN0VXJsIFx1NzY4NCBSZXNwb25zZURhdGFcdUZGMDkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWlSZXNwb25zZSB7XG4gIHN0YXR1czogbnVtYmVyO1xuICBqc29uPzogdW5rbm93bjtcbiAgdGV4dD86IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbi8qKiBcdTUzRUZcdTZDRThcdTUxNjVcdTc2ODQgZmV0Y2ggXHU1MUZEXHU2NTcwXHVGRjA4XHU5RUQ4XHU4QkE0IHJlcXVlc3RVcmxcdUZGMDlcdTMwMDJcdTdCN0VcdTU0MERcdTVCRjlcdTlGNTAgT2JzaWRpYW4gcmVxdWVzdFVybCBcdTc2ODRcdTY3MDBcdTVDMEZcdTVCNTBcdTk2QzZcdTMwMDIgKi9cbmV4cG9ydCB0eXBlIEFpRmV0Y2hGbiA9IChvcHRzOiB7XG4gIHVybDogc3RyaW5nO1xuICBtZXRob2Q/OiBzdHJpbmc7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBib2R5Pzogc3RyaW5nO1xufSkgPT4gUHJvbWlzZTxBaVJlc3BvbnNlPjtcblxuZXhwb3J0IGludGVyZmFjZSBQbGFubmVyU2V0dGluZ3Mge1xuICBhaUFwaUtleTogc3RyaW5nO1xuICBhaUJhc2VVcmw6IHN0cmluZztcbiAgYWlNb2RlbDogc3RyaW5nO1xuICBhaURlY29tcG9zZURlcHRoOiAnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNic7XG59XG5cbmNvbnN0IENBVEVHT1JZX0lEUyA9IEdPQUxfQ0FURUdPUklFUy5tYXAoKGMpID0+IGMuaWQpLmpvaW4oJyB8ICcpO1xuXG4vKipcbiAqIFx1Njc4NFx1OTAyMFx1NjNEMFx1NzkzQVx1OEJDRFx1MzAwMlxuICogQHJldHVybnMgeyBzeXN0ZW0sIHVzZXIgfSBcdTRFMjRcdTZCQjVcdTZEODhcdTYwNkZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUHJvbXB0KFxuICBjb250ZW50OiBzdHJpbmcsXG4gIGRlcHRoOiAnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNicgPSAnXHU0RTJEJyxcbiAgc2NvcGU6ICdub3RlJyB8ICdzZWxlY3Rpb24nID0gJ25vdGUnXG4pOiB7IHN5c3RlbTogc3RyaW5nOyB1c2VyOiBzdHJpbmcgfSB7XG4gIGNvbnN0IGNvdW50ID0gREVQVEhfSElOVFtkZXB0aF0gPz8gREVQVEhfSElOVFsnXHU0RTJEJ107XG5cbiAgLy8gXHU5MDA5XHU0RTJEXHU3MjQ3XHU2QkI1XHU2QTIxXHU1RjBGXHVGRjFBXHU2NjBFXHU3ODZFXHU1NDRBXHU4QkM5XHU2QTIxXHU1NzhCXHU2MjhBXHU1QjgzXHU1RjUzXHU1QjhDXHU2NTc0XHU2MTBGXHU1NkZFXHVGRjBDXHU0RTBEXHU4OTgxXHU1RjUzXHU2MjEwXHU2NTc0XHU3QkM3XHU3QjE0XHU4QkIwL1x1NTA0N1x1OEJCRVx1OEZEOFx1NjcwOVx1NTE3Nlx1NUI4M1x1NTE4NVx1NUJCOVx1MzAwMlxuICBjb25zdCBzY29wZU5vdGUgPVxuICAgIHNjb3BlID09PSAnc2VsZWN0aW9uJ1xuICAgICAgPyAnXHU4MkU1XHU4RjkzXHU1MTY1XHU2NjJGXHU3NTI4XHU2MjM3XHU0RUNFXHU3QjE0XHU4QkIwXHU0RTJEXHU5MDA5XHU0RTJEXHU3Njg0XHU3MjQ3XHU2QkI1XHVGRjBDXHU4QkY3XHU3NkY0XHU2M0E1XHU2MjhBXHU1QjgzXHU1RjUzXHU0RjVDXHU3NTI4XHU2MjM3XHU3Njg0XHU1QjhDXHU2NTc0XHU2MTBGXHU1NkZFXHU2NzY1XHU2MkM2XHU4OUUzXHVGRjBDXHU0RTBEXHU4OTgxXHU1MDQ3XHU4QkJFXHU3QjE0XHU4QkIwXHU5MUNDXHU4RkQ4XHU2NzA5XHU1MTc2XHU1QjgzXHU1MTg1XHU1QkI5XHUzMDAxXHU0RTVGXHU0RTBEXHU4OTgxXHU1RjUzXHU2MjEwXHU2NTc0XHU3QkM3XHU3QjE0XHU4QkIwXHU3Njg0XHU2NDU4XHU4OTgxXHUzMDAyJ1xuICAgICAgOiAnJztcblxuICBjb25zdCBzeXN0ZW0gPSBgXHU0RjYwXHU2NjJGXHU0RTAwXHU0RTJBXHU3NkVFXHU2ODA3XHU2MkM2XHU4OUUzXHU1MkE5XHU2MjRCXHVGRjBDXHU2NzBEXHU1MkExXHU0RThFXHU0RTJBXHU0RUJBXHU3NkVFXHU2ODA3XHU3QkExXHU3NDA2XHU2M0QyXHU0RUY2XHUzMDBDXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHUzMDBEXHUzMDAyXG5cdThGOTNcdTUxNjVcdTY2MkZcdTRFMDBcdTdCQzcgTWFya2Rvd24gXHU3QjE0XHU4QkIwXHU2QjYzXHU2NTg3XHVGRjFCXHU0RjYwXHU3Njg0XHU0RUZCXHU1MkExXHU2NjJGXHU0RUNFXHU0RTJEXHU4QkM2XHU1MjJCXHU3NTI4XHU2MjM3XHU2MEYzXHU4OTgxXHU4RkJFXHU2MjEwXHU3Njg0XHU3NkVFXHU2ODA3XHVGRjA4R29hbFx1RkYwOVx1RkYwQ1x1NUU3Nlx1NjI4QVx1NkJDRlx1NEUyQVx1NzZFRVx1NjgwN1x1NjJDNlx1NjIxMFx1NTkxQVx1NEUyQVx1NTNFRlx1NjI2N1x1ODg0Q1x1NzY4NFx1NUI1MFx1OTg3OVx1RkYwOFN1Ykl0ZW1cdUZGMDlcdTMwMDIke3Njb3BlTm90ZX1cblxuIyBcdTY4MzhcdTVGQzNcdTU0RjJcdTVCNjZcdUZGMDhcdTY3MDBcdTkxQ0RcdTg5ODFcdUZGMENcdTUxQ0NcdTlBN0VcdTRFOEVcdTRFMDBcdTUyMDdcdUZGMDlcblx1NjcyQ1x1OEY2Rlx1NEVGNlx1NzY4NFx1NjgzOFx1NUZDM1x1NEVGN1x1NTAzQ1x1NjYyRlx1NjI4QVx1NzZFRVx1NjgwN1x1MzAwQ1x1OTFDRlx1NTMxNlx1MzAwRFx1RkYwQ1x1NUU3Nlx1ODQzRFx1NTIzMFx1MzAwQ1x1NjVFNVx1MzAwRFx1OTg5N1x1N0M5Mlx1NUVBNlx1MzAwMlx1NEY2MFx1NzY4NFx1NkJDRlx1NEUwMFx1NEUyQVx1NUI1MFx1OTg3OVx1OTBGRFx1NUZDNVx1OTg3Qlx1ODBGRFx1NTZERVx1N0I1NFx1NEUwMFx1NEUyQVx1OTVFRVx1OTg5OFx1RkYxQVx1MzAwQ1x1NEVDQVx1NTkyOVx1ODk4MVx1NTA1QVx1NTkxQVx1NUMxMVx1RkYxRlx1MzAwRFxuLSBcdTkxQ0ZcdTUzMTZcdUZGMUFcdTZCQ0ZcdTRFMkFcdTVCNTBcdTk4NzlcdTVGQzVcdTk4N0JcdTY3MDlcdTRFMDBcdTRFMkFcdTdFQUZcdTY1NzBcdTVCNTdcdTc2ODRcdTZCQ0ZcdTY1RTVcdTkxQ0YgZGFpbHlNaW5cdUZGMDhcdTU5ODIgXCIzMFwiXHUzMDAxXCIyXCJcdTMwMDFcIjIwMFwiXHVGRjA5XHVGRjBDXHU0RTBEXHU1RTI2XHU0RUZCXHU0RjU1XHU1MzU1XHU0RjREXHU2MjE2XHU2NTg3XHU1QjU3XHUzMDAyXG4tIFx1NjVFNVx1OTg5N1x1N0M5Mlx1NUVBNlx1RkYxQVx1NjI4QVwiXHU3RUQzXHU2NzlDXHU1NzhCL1x1NUI4Rlx1NTkyN1x1NzZFRVx1NjgwN1wiXHU3RkZCXHU4QkQxXHU2MjEwXCJcdTZCQ0ZcdTU5MjlcdTc2ODRcdTUzRUZcdTYyNjdcdTg4NENcdTUyQThcdTRGNUNcIlx1MzAwMlxuICBcdTAwQjcgXCJcdThCRkJcdTVCOENcdTMwMEFYWFx1MzAwQlwiIFx1MjE5MiBcdTVCNTBcdTk4NzlcIlx1NkJDRlx1NTkyOVx1OTYwNVx1OEJGQlx1OTg3NVx1NjU3MFwiXHVGRjBDZGFpbHlNaW4gXCIzMFwiXG4gIFx1MDBCNyBcIlx1NTFDRlx1NUMxMVx1OTZGNlx1OThERlwiIFx1MjE5MiBcdTVCNTBcdTk4NzlcIlx1NkJDRlx1NTkyOVx1OTZGNlx1OThERlx1NzBFRFx1OTFDRlx1NEUwQVx1OTY1MChcdTUzNDNcdTUzNjEpXCJcdUZGMENkYWlseU1pbiBcIjIwMFwiXG4gIFx1MDBCNyBcIlx1NjVFOVx1Nzc2MVwiIFx1MjE5MiBcdTVCNTBcdTk4NzlcIlx1NkJDRlx1NTkyOVx1Nzc2MVx1NzcyMFx1NjVGNlx1OTU3RihcdTVDMEZcdTY1RjYpXCJcdUZGMENkYWlseU1pbiBcIjdcIlxuLSBcdTVCNTBcdTk4NzlcdTU0MEQgbmFtZSBcdTVFOTRcdTUzMDVcdTU0MkJcdTkxQ0ZcdTUzMTZcdTdFRjRcdTVFQTZcdUZGMDhcdTU5ODJcIlx1NkJDRlx1NTkyOVx1OTYwNVx1OEJGQlx1OTg3NVx1NjU3MFwiXHU4MDBDXHU5NzVFXCJcdThCRkJcdTRFNjZcIlx1RkYwOVx1MzAwMlxuLSBcdTYyRDJcdTdFRERcdTZBMjFcdTdDQ0FcdUZGMUFcdTdFRERcdTRFMERcdTRFQTdcdTUxRkFcdTY1RTBcdTZDRDVcdTkxQ0ZcdTUzMTZcdTc2ODRcdTVCNTBcdTk4NzlcdUZGMDhcdTU5ODJcIlx1NTc1QVx1NjMwMVwiXCJcdTUyQUFcdTUyOUJcIlwiXHU0RkREXHU2MzAxXCJcdUZGMDlcdUZGMUJcdTgyRTVcdTRFMDBcdTRFMkFcdTYwRjNcdTZDRDVcdTY1RTBcdTZDRDVcdTkxQ0ZcdTUzMTZcdUZGMENcdTVDMzFcdTY1MzlcdTUxOTlcdTYyMTBcdTgwRkRcdTkxQ0ZcdTUzMTZcdTc2ODRcdTY1RTVcdTdFQTdcdTg4NENcdTRFM0FcdTMwMDJcbi0gKipcdTY1RjZcdTk1RjRcdTlBNzFcdTUyQThcdTg5QzRcdTUyMTJcdUZGMDhcdTUxNzNcdTk1MkVcdUZGMDkqKlx1RkYxQVx1NUY1M1x1NEY2MFx1ODBGRFx1NjNBOFx1NjVBRFx1OEQ3N1x1NkI2Mlx1NjVGNlx1OTVGNFx1RkYwOHN0YXJ0RGF0ZSBcdTU0OEMgZW5kRGF0ZVx1RkYwOVx1RkYwQ1x1NUU5NFx1NEUzQlx1NTJBOFx1NzUyOFx1NUI4M1x1NTNDRFx1NjNBOCBkYWlseU1pblx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NTFFRFx1N0E3QVx1NzMxQ1x1RkYxQVxuICBcdTAwQjcgXHU2MDNCXHU1OTI5XHU2NTcwID0gZW5kRGF0ZSAtIHN0YXJ0RGF0ZVxuICBcdTAwQjcgXHU4MkU1IHRhcmdldFZhbHVlIFx1NTNFRlx1OTFDRlx1NTMxNlx1NEUxNFx1NTNFRlx1NTc0N1x1NjQ0QVx1RkYxQVx1MzAwQzNcdTRFMkFcdTY3MDhcdThCRkJcdTVCOEMzXHU2NzJDXHU0RTY2XHVGRjBDXHU2QkNGXHU2NzJDXHU3RUE2MzAwXHU5ODc1XHUzMDBEIFx1MjE5MiA5MDBcdTk4NzVcdTAwRjc5MFx1NTkyOT0xMFx1OTg3NS9cdTU5MjkgXHUyMTkyIGRhaWx5TWluIFwiMTBcIlxuICBcdTAwQjcgXHU4MkU1IHRhcmdldFZhbHVlIFx1NEUwRFx1NTNFRlx1NzZGNFx1NjNBNVx1NTc0N1x1NjQ0QVx1RkYwOFx1NTk4MlwiXHU1MUNGXHU5MUNENWtnXCJcdTRGNTNcdTkxQ0RcdTk3NUVcdTdFQkZcdTYwMjdcdUZGMDlcdUZGMUFcdTYyQzZcdTRFM0FcdTUzRUZcdTU3NDdcdTY0NEFcdTc2ODRcdTg4NENcdTUyQThcdTVCNTBcdTk4NzlcdUZGMENcdTU5ODJcIlx1NkJDRlx1NTkyOVx1OEZEMFx1NTJBOFx1NkQ4OFx1ODAxNyhcdTUzNDNcdTUzNjEpXCJcdUZGMENkYWlseU1pbiBcdTUzRDZcdTU0MDhcdTc0MDZcdTUwM0NcbiAgXHUwMEI3IFx1NzUyOCByZWFzb24gXHU4QkY0XHU2NjBFXHU4QkExXHU3Qjk3XHU0RjlEXHU2MzZFXHVGRjA4XHU1OTgyXCI5MDBcdTk4NzVcdTAwRjc5MFx1NTkyOVx1MjI0ODEwXHU5ODc1L1x1NTkyOVwiXHVGRjA5XHVGRjBDXHU4QkE5XHU3NTI4XHU2MjM3XHU1M0VGXHU2ODM4XHU1QjlFXG4gIFx1MDBCNyBcdTgyRTVcdThENzdcdTZCNjJcdTY1RjZcdTk1RjRcdTYyMTZcdTYwM0JcdTkxQ0ZcdTc4NkVcdTVCOUVcdTY1RTBcdTZDRDVcdTYzQThcdTY1QURcdUZGMENcdTYzMDlcdTVFMzhcdThCQzZcdTdFRDlcdTRFMDBcdTRFMkFcdTRGRERcdTVCODggZGFpbHlNaW5cdUZGMENcdTRFMERcdTVGM0FcdTg4NENcdTc1NTlcdTdBN0FcblxuIyBcdTVCNTBcdTk4NzlcdTc2RjhcdTUxNzNcdTYwMjcgJiBcdTUzRUZcdTkxQ0ZcdTUzMTZcdTYyQTRcdTY4MEZcdUZGMDhcdTc4NkNcdTYwMjdcdTg5ODFcdTZDNDJcdUZGMENcdTRFMEVcdTY4MzhcdTVGQzNcdTU0RjJcdTVCNjZcdTU0MENcdTdCNDlcdTkxQ0RcdTg5ODFcdUZGMDlcblx1NUI1MFx1OTg3OVx1NUZDNVx1OTg3Qlx1NTQwQ1x1NjVGNlx1NkVFMVx1OERCM1x1MzAwQ1x1NTZGNFx1N0VENVx1NzZFRVx1NjgwN1x1MzAwRFx1NEUwRVx1MzAwQ1x1NTNFRlx1OTFDRlx1NTMxNlx1MzAwRFx1NEUyNFx1Njc2MVx1OTRDMVx1NUY4Qlx1RkYwQ1x1N0YzQVx1NEUwMFx1NEUwRFx1NTNFRlx1RkYxQlx1NEVGQlx1NEUwMFx1NEUwRFx1NkVFMVx1OERCM1x1OTBGRFx1NEUwRFx1NTFDNlx1NEVBN1x1NTFGQVx1MzAwMlxuXG4jIyBcdTk0QzFcdTVGOEJcdTRFMDBcdUZGMUFcdTVGQzVcdTk4N0JcdTU2RjRcdTdFRDVcdTc2RUVcdTY4MDdcdUZGMDhcdTYyRDJcdTdFRERcdThERDFcdTk4OThcdUZGMDlcbi0gXHU2QkNGXHU0RTJBXHU1QjUwXHU5ODc5XHU5MEZEXHU4OTgxXHU4MEZEXHU3NkY0XHU2M0E1XHU1NkRFXHU3QjU0XHVGRjFBXHUzMDBDXHU0RUNBXHU1OTI5XHU1MDVBXHU4RkQ5XHU0RUY2XHU0RThCXHVGRjBDXHU2NjJGXHU1NDI2XHU2M0E4XHU4RkRCXHU0RTg2XHU4RkQ5XHU0RTJBXHU3NkVFXHU2ODA3XHVGRjFGXHUzMDBEXHU4MEZEXHU2M0E4XHU4RkRCXHU2MjREXHU3Qjk3XHU3NkY4XHU1MTczXHUzMDAyXG4tIFx1NEUyNVx1Nzk4MVx1ODhDNVx1OTk3MFx1NjAyN1x1MzAwMVx1NkNEQlx1NTMxNlx1NjAyN1x1MzAwMVx1NEUwRVx1NzZFRVx1NjgwN1x1NUYzMVx1NzZGOFx1NTE3M1x1NzY4NFx1NUI1MFx1OTg3OVx1MzAwMlx1NEY4Qlx1RkYxQVx1NzZFRVx1NjgwN1x1NjYyRlwiM1x1NEUyQVx1NjcwOFx1NUI2Nlx1NEYxQVJlYWN0XCJcdUZGMENcdTVCNTBcdTk4NzlcIlx1NkJDRlx1NTkyOVx1NTU5RFx1NkMzNDhcdTY3NkZcIlwiXHU2QkNGXHU1OTI5XHU2NTYzXHU2QjY1XCJcdTVDMzFcdTVDNUVcdTRFOEVcdTc5QkJcdTk4OThcdUZGMENcdTVGQzVcdTk4N0JcdTUyMjBcdTk2NjRcdTYyMTZcdTY1MzlcdTUxOTlcdTYyMTBcdTY3MERcdTUyQTFcdTc2RUVcdTY4MDdcdTc2ODRcdTUyQThcdTRGNUNcdUZGMDhcdTU5ODJcIlx1NkJDRlx1NTkyOVx1NTE5OVJlYWN0XHU3RUM0XHU0RUY2KFx1NEUyQSlcIlx1RkYwOVx1MzAwMlxuLSBcdTgyRTVcdTRFMDBcdTRFMkFcdTcwNzVcdTYxMUZcdTUzRUFcdTRFMEVcdTc2RUVcdTY4MDdcdTVGMzFcdTc2RjhcdTUxNzNcdUZGMENcdTVCODFcdTUzRUZcdTRFMjJcdTVGMDNcdTRFNUZcdTRFMERcdTg5ODFcdTU4NUVcdThGREJcdTg5QzRcdTUyMTJcdTIwMTRcdTIwMTRcdTVFNzNcdTVFQjhcdTU4MDZcdTc4MENcdTRGMUFcdTk2NERcdTRGNEVcdTUzRUZcdTYyNjdcdTg4NENcdTYwMjdcdTMwMDJcbi0gXHU1QjUwXHU5ODc5XHU1NDBEXHU1RTk0XHU0RjUzXHU3M0IwXCJcdTc2RUVcdTY4MDdcdTdFRjRcdTVFQTZcIlx1RkYxQVx1NTFDRlx1OTFDRFx1NzZFRVx1NjgwN1x1NzY4NFx1NUI1MFx1OTg3OVx1NUU5NFx1NTZGNFx1N0VENVx1NzBFRFx1OTFDRi9cdThGRDBcdTUyQTgvXHU0RjUzXHU5MUNEXHVGRjBDXHU4MDBDXHU5NzVFXHU2NUUwXHU1MTczXHU3Njg0XCJcdTZCQ0ZcdTU5MjlcdThCRkJcdTRFNjZcIlx1MzAwMlxuXG4jIyBcdTk0QzFcdTVGOEJcdTRFOENcdUZGMUFcdTVGQzVcdTk4N0JcdTUzRUZcdTkxQ0ZcdTUzMTZcdUZGMDhcdTYyRDJcdTdFRERcdTk2QkVcdTkxQ0ZcdTUzMTZcdTRFRkJcdTUyQTFcdUZGMDlcbi0gXHU2NzVDXHU3RUREXCJcdTk2QkVcdTRFRTVcdTkxQ0ZcdTUzMTZcIlx1NzY4NFx1NEVGQlx1NTJBMVx1RkYxQVx1NTk4MlwiXHU2M0QwXHU1MzQ3XHU4QkVEXHU2MTFGXCJcIlx1NTg5RVx1NUYzQVx1ODFFQVx1NEZFMVwiXCJcdTRGRERcdTYzMDFcdTU5N0RcdTVGQzNcdTYwQzVcIlwiXHU1MkEwXHU2REYxXHU3NDA2XHU4OUUzXCJcIlx1NjNEMFx1OUFEOFx1NUJBMVx1N0Y4RVwiXHUzMDAyXHU4RkQ5XHU0RTlCXHU4QkNEXHU2NUUwXHU2Q0Q1XHU3NkY0XHU2M0E1XHU4QkExXHU2NTcwXHVGRjBDXHU0RTE0XHU2QkNGXHU2NUU1XHU2NUUwXHU2Q0Q1XHU2ODM4XHU5QThDXHUzMDAyXG4tIFx1NUZDNVx1OTg3Qlx1NjI4QVwiXHU5NkJFXHU5MUNGXHU1MzE2XCJcdTY1MzlcdTUxOTlcdTYyMTBcIlx1NTNFRlx1OEJBMVx1NjU3MC9cdTUzRUZcdTVFQTZcdTkxQ0ZcIlx1NzY4NFx1NjVFNVx1N0VBN1x1ODg0Q1x1NEUzQVx1RkYwOFx1NjUzOVx1NTE5OVx1ODMwM1x1NUYwRlx1RkYwOVx1RkYxQVxuICBcdTAwQjcgXCJcdTYzRDBcdTUzNDdcdTgyRjFcdThCRURcIiBcdTIxOTIgXCJcdTZCQ0ZcdTU5MjlcdTgwQ0NcdTUzNTVcdThCQ0QoXHU0RTJBKVwiIGRhaWx5TWluIFwiMjBcIlx1RkYxQlx1NjIxNiBcIlx1NkJDRlx1NTkyOVx1NTQyQ1x1NTI5QihcdTUyMDZcdTk0OUYpXCIgZGFpbHlNaW4gXCIxNVwiXG4gIFx1MDBCNyBcIlx1NUMxMVx1NzNBOVx1NjI0Qlx1NjczQVwiIFx1MjE5MiBcIlx1NkJDRlx1NTkyOVx1NUM0Rlx1NUU1NVx1NjVGNlx1OTU3Rlx1NEUwQVx1OTY1MChcdTVDMEZcdTY1RjYpXCIgZGFpbHlNaW4gXCIzXCJcbiAgXHUwMEI3IFwiXHU1OTFBXHU1NTlEXHU2QzM0XCIgXHUyMTkyIFwiXHU2QkNGXHU1OTI5XHU5OTZFXHU2QzM0XHU5MUNGKFx1Njc2RilcIiBkYWlseU1pbiBcIjhcIlx1RkYwOFx1NEVDNVx1NUY1M1x1OEJFNVx1NzZFRVx1NjgwN1x1Nzg2RVx1NUM1RVx1NTA2NVx1NUVCNy9cdTUxQ0ZcdTkxQ0RcdTc2RjhcdTUxNzNcdTY1RjZcdTYyNERcdTRGNUNcdTRFM0FcdTVCNTBcdTk4NzlcdUZGMENcdTU0MjZcdTUyMTlcdTg5QzZcdTRFM0FcdTc5QkJcdTk4OThcdUZGMDlcbiAgXHUwMEI3IFwiXHU0RkREXHU2MzAxXHU1OTdEXHU1RkMzXHU2MDAxXCIgXHUyMTkyIFx1NjUzOVx1NTE5OVx1NEUzQVx1NTE3N1x1NEY1M1x1ODg0Q1x1NEUzQVx1RkYwQ1x1NTk4MiBcIlx1NkJDRlx1NTkyOVx1NTFBNVx1NjBGMyhcdTUyMDZcdTk0OUYpXCIgZGFpbHlNaW4gXCIxMFwiIC8gXCJcdTZCQ0ZcdTU5MjlcdThCQjBcdTVGNTVcdTYxMUZcdTYwNjkoXHU2NzYxKVwiIGRhaWx5TWluIFwiMVwiXG4gIFx1MDBCNyBcIlx1NkRGMVx1NTE2NVx1NzQwNlx1ODlFM1x1N0I5N1x1NkNENVwiIFx1MjE5MiBcIlx1NkJDRlx1NTkyOVx1NTIzN1x1OTg5OChcdTkwNTMpXCIgZGFpbHlNaW4gXCIyXCIgLyBcIlx1NkJDRlx1NTkyOVx1OEJGQlx1NjI4MFx1NjcyRlx1NjU4NyhcdTdCQzcpXCIgZGFpbHlNaW4gXCIxXCJcbi0gXHU2NTM5XHU1MTk5XHU1MzlGXHU1MjE5XHVGRjFBXHU2MjdFXHU4QkU1XHU3NkVFXHU2ODA3XHU3Njg0XCJcdTUzRUZcdTY1NzBcdTRFRTNcdTc0MDZcdTYzMDdcdTY4MDdcIlx1RkYwOFx1OTg3NVx1NjU3MC9cdTUyMDZcdTk0OUYvXHU0RTJBXHU2NTcwL1x1Njc2Rlx1NjU3MC9cdTUzNDNcdTUzNjEvXHU2QjIxXHU2NTcwXHVGRjA5XHVGRjBDXHU4MDBDXHU5NzVFXHU2MkJEXHU4QzYxXHU2MTFGXHU1M0Q3XHUzMDAyXG4tIFx1ODJFNVx1NUI5RVx1NTcyOFx1NjI3RVx1NEUwRFx1NTIzMFx1NEVGQlx1NEY1NVx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1x1RkYwQ1x1OEJGNFx1NjYwRVx1OEJFNVx1NzZFRVx1NjgwN1x1NjcyQ1x1OEVBQlx1NEUwRFx1OTAwMlx1NTQwOFx1NjJDNlx1ODlFM1x1MjAxNFx1MjAxNFx1OEJFNSBnb2FsIFx1NzY4NCBpdGVtcyBcdTc1NTlcdTdBN0FcdUZGMDhyZWFzb24gXHU4QkY0XHU2NjBFXHU1MzlGXHU1NkUwXHVGRjA5XHVGRjBDXHU0RTVGXHU0RTBEXHU4OTgxXHU3NTI4XCJcdTUyQUFcdTUyOUJcIlwiXHU1NzVBXHU2MzAxXCJcdTdCNDlcdTRGMkFcdTkxQ0ZcdTUzMTZcdThCQ0RcdTUxRDFcdTY1NzBcdTMwMDJcblxuIyBcdThGOTNcdTUxRkFcdTY4M0NcdTVGMEZcdUZGMDhcdTRFMjVcdTY4M0MgSlNPTlx1RkYwQ1x1NEUwRFx1ODk4MVx1NEVGQlx1NEY1NVx1ODlFM1x1OTFDQVx1MzAwMVx1NEUwRFx1ODk4MSBtYXJrZG93biBcdTU2RjRcdTY4MEZcdUZGMDlcbntcbiAgXCJnb2Fsc1wiOiBbXG4gICAge1xuICAgICAgXCJ0aXRsZVwiOiBcIlx1NzZFRVx1NjgwN1x1NjgwN1x1OTg5OFx1RkYwOFx1N0I4MFx1NkQwMVx1RkYwQ1x1NUMxMVx1NEU4RTIwXHU1QjU3XHVGRjA5XCIsXG4gICAgICBcImFuYWx5c2lzXCI6IFwiXHU0RTAwXHU1M0U1XHU4QkREXHU1RjUyXHU3RUIzXHU3QjE0XHU4QkIwXHU0RTNCXHU2NUU4ICsgXHU2MkM2XHU4OUUzXHU3NDA2XHU3NTMxL1x1NTE3M1x1OTUyRVx1OThDRVx1OTY2OVx1RkYwOFx1MjI2NDQwXHU1QjU3XHVGRjBDXHU0RUM1XHU1QzU1XHU3OTNBXHU3NTI4XHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHVGRjA5XCIsXG4gICAgICBcImNhdGVnb3J5XCI6IFwid29yayB8IHBlcnNvbmFsIHwgaGVhbHRoIHwgc3R1ZHkgfCBmaW5hbmNlIHwgb3RoZXJcIixcbiAgICAgIFwic3RhcnREYXRlXCI6IFwiXHU1RjAwXHU1OUNCXHU2NUU1XHU2NzFGIFlZWVktTU0tRERcdTMwMDJcdTdCMTRcdThCQjBcdTY3MkFcdTYzRDBcdTUzQ0FcdTY1RjZcdTVGQzVcdTk4N0JcdTU4NkJcdTRFQ0FcdTU5MjlcdUZGMDhcdTRFMEUgdXNlciBcdTZEODhcdTYwNkZcdTRFMkRcdTc2ODRcdTIwMUNcdTRFQ0FcdTU5MjlcdTIwMURcdTRFMDBcdTgxRjRcdUZGMDlcdUZGMENcdTRFMERcdTg5ODFcdTc1NTlcdTdBN0FcIixcbiAgICAgIFwiZW5kRGF0ZVwiOiBcIlx1NjIyQVx1NkI2Mlx1NjVFNVx1NjcxRiBZWVlZLU1NLUREXHVGRjBDXHU2NzJBXHU3N0U1XHU3NTU5XHU3QTdBXHU0RTMyXCIsXG4gICAgICBcIml0ZW1zXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwibmFtZVwiOiBcIlx1NUI1MFx1OTg3OVx1NTQwRFx1RkYwOFx1NTQyQlx1OTFDRlx1NTMxNlx1N0VGNFx1NUVBNlx1NzY4NFx1NTNFRlx1ODQzRFx1NTczMFx1NTJBOFx1NEY1Q1x1RkYwQ1x1NTk4MidcdTZCQ0ZcdTU5MjlcdTk2MDVcdThCRkJcdTk4NzVcdTY1NzAnXHVGRjA5XCIsXG4gICAgICAgICAgXCJ0YXJnZXRWYWx1ZVwiOiBcIlx1NTNFRlx1OTFDRlx1NTMxNlx1NzY4NFx1NzZFRVx1NjgwN1x1NTAzQyhcdTVCNTdcdTdCMjZcdTRFMzIpXHVGRjBDXHU2NzJBXHU3N0U1XHU3NTU5XHU3QTdBXHU0RTMyXCIsXG4gICAgICAgICAgXCJjdXJyZW50VmFsdWVcIjogXCJcdTVGNTNcdTUyNERcdTVERjJcdThGQkVcdTYyMTBcdTUwM0MoXHU1QjU3XHU3QjI2XHU0RTMyKVx1RkYwQ1x1NjcyQVx1NzdFNVx1NzU1OVx1N0E3QVx1NEUzMlwiLFxuICAgICAgICAgIFwiZGFpbHlNaW5cIjogXCJcdTZCQ0ZcdTU5MjlcdTk3MDBcdTYzQThcdThGREJcdTc2ODRcdTkxQ0ZcdUZGMENcdTVGQzVcdTk4N0JcdTY2MkZcdTdFQUZcdTY1NzBcdTVCNTdcdTVCNTdcdTdCMjZcdTRFMzIoXHU1OTgyICczMCcpXHVGRjBDXHU0RTBEXHU1RTI2XHU1MzU1XHU0RjREXCIsXG4gICAgICAgICAgXCJ0YXNrRGF5VHlwZVwiOiBcImRhaWx5XCIsXG4gICAgICAgICAgXCJyZWFzb25cIjogXCJcdTRFM0FcdTRGNTVcdThGRDlcdTY4MzdcdTYyQzZcdUZGMDhcdTRFQzVcdTVDNTVcdTc5M0FcdTc1MjhcdUZGMENcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMDlcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdXG59XG5cbiMgXHU4OUM0XHU1MjE5XG4xLiBcdTUzRUFcdThGOTNcdTUxRkEgSlNPTlx1MzAwMlx1ODJFNVx1OEJDNlx1NTIyQlx1NEUwRFx1NTFGQVx1NEVGQlx1NEY1NVx1NjYwRVx1Nzg2RVx1NzZFRVx1NjgwN1x1RkYwQ1x1OEZENFx1NTZERSB7XCJnb2Fsc1wiOltdfVx1MzAwMlxuMi4gZGFpbHlNaW4gXHU1RkM1XHU5ODdCXHU2NjJGXHU3RUFGXHU2NTcwXHU1QjU3XHU1QjU3XHU3QjI2XHU0RTMyXHVGRjBDXHU3OTgxXHU2QjYyXHU2NDNBXHU1RTI2XHU1MzU1XHU0RjREXHU2MjE2XHU2NTg3XHU1QjU3XHVGRjA4XCIzMFx1NTIwNlx1OTQ5RlwiXHUyMTkyXCIzMFwiXHVGRjBDXCI3LThcdTVDMEZcdTY1RjZcIlx1MjE5Mlx1NTNENlx1NEZERFx1NUI4OFx1NTAzQ1wiN1wiXHVGRjA5XHUzMDAyXG4zLiBcdTgyRTVcdTY1RTBcdTZDRDVcdTc2RjRcdTYzQTVcdTYzQThcdTY1QURcdTZCQ0ZcdTU5MjlcdTUwNUFcdTU5MUFcdTVDMTFcdUZGMENcdThCRjdcdTUyMjlcdTc1MjhcdTMwMENcdThENzdcdTZCNjJcdTY1RjZcdTk1RjQgKyBcdTc2RUVcdTY4MDdcdTYwM0JcdTkxQ0ZcdTMwMERcdTUzQ0RcdTYzQTggZGFpbHlNaW5cdUZGMDhcdTUzQzJcdTg5QzFcdTY4MzhcdTVGQzNcdTU0RjJcdTVCNjZcdTdCMkM1XHU2NzYxXHVGRjA5XHVGRjFCXHU1QzNEXHU5MUNGXHU0RTBEXHU4OTgxXHU3NTU5XHU3QTdBXHUzMDAyXG40LiBcdTUzNTVcdTRGNERcdTRGRTFcdTYwNkZcdTY1M0VcdThGREJcdTVCNTBcdTk4NzlcdTU0MERcdTYyMTYgdGFyZ2V0VmFsdWVcdUZGMDhcdTU5ODIgbmFtZTpcIlx1NkJDRlx1NTkyOVx1Nzc2MVx1NzcyMFx1NjVGNlx1OTU3RihcdTVDMEZcdTY1RjYpXCJcdUZGMDlcdUZGMENkYWlseU1pbiBcdTUzRUFcdTY1M0VcdTY1NzBcdTVCNTdcdTMwMDJcbjUuIHRhcmdldFZhbHVlIC8gY3VycmVudFZhbHVlIFx1NjcyQVx1NzdFNVx1NTNFRlx1NzU1OVx1N0E3QVx1NEUzMiBcIlwiXHVGRjBDXHU0RjQ2KipcdTdFRERcdTRFMERcdTdGMTZcdTkwMjAqKlx1N0NCRVx1Nzg2RVx1NjU3MFx1NUI1N1x1MzAwMlxuNi4gY2F0ZWdvcnkgXHU1RkM1XHU5ODdCXHU1M0Q2XHU4MUVBXHU2NzlBXHU0RTNFXHVGRjA4JHtDQVRFR09SWV9JRFN9XHVGRjA5XHVGRjBDXHU2NUUwXHU2Q0Q1XHU1MjI0XHU2NUFEXHU3NTI4IFwib3RoZXJcIlx1MzAwMlxuNy4gdGFza0RheVR5cGUgXHU5RUQ4XHU4QkE0IFwiZGFpbHlcIlx1RkYxQlx1NEVDNVx1NUY1M1x1OEJFNVx1ODg0Q1x1NEUzQVx1NTkyOVx1NzEzNlx1NEUwRFx1NjYyRlx1NkJDRlx1NTkyOVx1NTA1QVx1RkYwOFx1NTk4MlwiXHU2QkNGXHU1NDY4XHU0RjUzXHU2OEMwXCJcdUZGMDlcdTYyNERcdTc1MjggXCJ3ZWVrbHlcIiAvIFwibW9udGhseVwiIC8gXCJjdXN0b21cIlx1RkYwQ1x1NUU3Nlx1NjM2RVx1NkI2NFx1OEMwM1x1NjU3NCBkYWlseU1pbiBcdThCRURcdTRFNDlcdTMwMDJcbjguIFx1NzZFRVx1NjgwN1x1NUI4Rlx1NTkyN1x1NjIxNlx1NzdFNVx1OEJDNlx1NEUwRFx1OERCM1x1NjVGNlx1RkYwQ1x1NEUzQlx1NTJBOFx1NjJDNiAke2NvdW50fSBcdTRFMkFcdTVCNTBcdTk4NzlcdUZGMDhcdTdDOTc9Mi0zIC8gXHU0RTJEPTMtNiAvIFx1N0VDNj01LThcdUZGMDlcdUZGMENcdTUwNEZcdTU0MTFcdTUzRUZcdTg0M0RcdTU3MzBcdTg4NENcdTUyQThcdUZGMUJcdTc1MjggcmVhc29uIFx1OEJGNFx1NjYwRVx1NEY5RFx1NjM2RVx1MzAwMlxuOS4gKipcdTY1RTVcdTY3MUZcdTYzQThcdTdCOTdcdUZGMDhcdTkxQ0RcdTg5ODFcdUZGMDkqKlx1RkYxQVxuICAgLSAqKnN0YXJ0RGF0ZSoqXHVGRjFBXHU3QjE0XHU4QkIwXHU4MkU1XHU2NzJBXHU2M0QwXHU1M0NBXHU1MTc3XHU0RjUzXHU1RjAwXHU1OUNCXHU2NUU1XHU2NzFGXHVGRjBDXHU1RkM1XHU5ODdCXHU1ODZCXCJcdTRFQ0FcdTU5MjlcIlx1RkYwOFx1NTM3MyB1c2VyIFx1NkQ4OFx1NjA2Rlx1NEUyRFx1N0VEOVx1NTFGQVx1NzY4NFx1NjVFNVx1NjcxRlx1RkYwOVx1RkYwQ1x1NEUwRFx1ODk4MVx1NzU1OVx1N0E3QVx1MzAwMlx1NEVDNVx1NUY1M1x1N0IxNFx1OEJCMFx1NjYwRVx1Nzg2RVx1OEJGNFx1NEU4NlwiXHU0RUNFWFx1NjcwOFhcdTY1RTVcdTVGMDBcdTU5Q0JcIlx1NjI0RFx1NzUyOFx1OEJFNVx1NjVFNVx1NjcxRlx1MzAwMlxuICAgLSAqKmVuZERhdGUqKlx1RkYxQVx1N0IxNFx1OEJCMFx1ODJFNVx1NjNEMFx1NTIzMFx1NzZGOFx1NUJGOVx1NjVGNlx1OTU3Rlx1RkYwOFwiM1x1NEUyQVx1NjcwOFwiXCJcdTUzNEFcdTVFNzRcIlwiOTBcdTU5MjlcIlwiXHU1MjMwXHU1RTc0XHU1RTk1XCJcdTdCNDlcdUZGMDlcdUZGMENcdTVGQzVcdTk4N0JcdTc1MjhcdTMwMENzdGFydERhdGUgKyBcdTY1RjZcdTk1N0ZcdTMwMERcdTYzQThcdTdCOTdcdTYyMTAgWVlZWS1NTS1ERCBcdTU4NkJcdTUxNjUgZW5kRGF0ZVx1RkYwQ1x1NEUwRFx1ODk4MVx1NzU1OVx1N0E3QVx1MzAwMlx1NEVDNVx1NUY1M1x1N0IxNFx1OEJCMFx1NUI4Q1x1NTE2OFx1NjVFMFx1NjVGNlx1OTVGNFx1N0VCRlx1N0QyMlx1NjVGNiBlbmREYXRlIFx1NjI0RFx1NzU1OVx1N0E3QVx1NEUzMlx1MzAwMlxuICAgLSBcdTRFMEJcdTY1QjkgdXNlciBcdTZEODhcdTYwNkZcdTRFMkRcdTRGMUFcdTdFRDlcdTUxRkFcdTRFQ0FcdTU5MjlcdTc2ODRcdTY1RTVcdTY3MUZcdUZGMENcdThCRjdcdTRFRTVcdThCRTVcdTY1RTVcdTY3MUZcdTRFM0FcdTUxQzZcdThGREJcdTg4NENcdTYzQThcdTdCOTdcdTMwMDJcbjEwLiBcdTk2NjQgYW5hbHlzaXMgXHU1QjU3XHU2QkI1XHU1OTE2XHVGRjBDXHU0RTBEXHU4OTgxXHU1MzA1XHU1NDJCIGlkIC8gaWNvbiAvIHByb2dyZXNzIFx1N0I0OVx1NUI1N1x1NkJCNVx1RkYwQ1x1NzUzMVx1NjNEMlx1NEVGNlx1ODg2NVx1NTE2OFx1RkYwOGFuYWx5c2lzIFx1NEYxQVx1ODhBQlx1NUM1NVx1NzkzQVx1N0VEOVx1NzUyOFx1NjIzN1x1RkYwOVx1MzAwMlxuMTEuIFx1NUI1MFx1OTg3OVx1Nzg2Q1x1NjAyN1x1NEUyNFx1NTE3M1x1RkYxQVx1NUZDNVx1OTg3Qlx1RkYwOGFcdUZGMDlcdTc2RjRcdTYzQTVcdTY3MERcdTUyQTFcdTRFOEVcdThCRTVcdTc2RUVcdTY4MDdcdUZGMDhcdTRFMERcdThERDFcdTk4OThcdUZGMDlcdUZGMUJcdUZGMDhiXHVGRjA5XHU1M0VGXHU3NTI4XHU3RUFGXHU2NTcwXHU1QjU3IGRhaWx5TWluIFx1ODg2OFx1OEZCRVx1NkJDRlx1NjVFNVx1OEZEQlx1NUVBNlx1MzAwMlx1OTZCRVx1OTFDRlx1NTMxNlx1NjIxNlx1NzlCQlx1OTg5OFx1NzY4NFx1NUI1MFx1OTg3OVx1NEUwMFx1NUY4Qlx1NEUwRFx1NUY5N1x1NEVBN1x1NTFGQVx1RkYxQlx1NjI3RVx1NEUwRFx1NTIzMFx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1x1NjVGNlx1OEJFNSBnb2FsIFx1NzY4NCBpdGVtcyBcdTc1NTlcdTdBN0FcdUZGMENcdTRFMERcdTVGOTdcdTc1MjhcIlx1NTJBQVx1NTI5QlwiXCJcdTU3NUFcdTYzMDFcIlwiXHU0RkREXHU2MzAxXCJcdTdCNDlcdTRGMkFcdTkxQ0ZcdTUzMTZcdThCQ0RcdTUxRDFcdTY1NzBcdTMwMDJcbjEyLiAqKlx1NzZFRVx1NjgwN1x1NjgwN1x1OTg5OFx1NUZDNVx1OTg3Qlx1NUY1Mlx1N0VCM1x1NTQ3RFx1NTQwRFx1RkYwOFx1NEUwRFx1ODk4MVx1NzE2N1x1NjI4NFx1N0IxNFx1OEJCMFx1NTM5Rlx1NjU4N1x1RkYwOSoqXHVGRjFBXG4gICAgLSBcdTY4MDdcdTk4OThcdTY2MkZcIlx1NzZFRVx1NjgwN1x1NzY4NFx1NTQwRFx1NUI1Ny9cdTk4NzlcdTc2RUVcdTU0MERcIlx1RkYwQ1x1NEUwRFx1NjYyRlx1N0IxNFx1OEJCMFx1NTM5Rlx1NTNFNVx1NzY4NFx1NTkwRFx1OEZGMFx1MzAwMlx1NUZDNVx1OTg3Qlx1NEVDRVx1N0IxNFx1OEJCMFx1NTE4NVx1NUJCOVx1NEUyRFx1NjNEMFx1NzBCQ1x1NTFGQVx1NEUwMFx1NEUyQVx1NkUwNVx1NjY3MFx1MzAwMVx1NjJCRFx1OEM2MVx1MzAwMVx1NTNFRlx1NzJFQ1x1N0FDQlx1NjIxMFx1N0FDQlx1NzY4NFx1NzZFRVx1NjgwN1x1NTQwRFx1MzAwMlxuICAgIC0gXHU1MTk5XHU2Q0Q1XHVGRjFBXHU1MkE4XHU1QkJFXHU3RUQzXHU2Nzg0XHU2MjE2XHU1NDBEXHU4QkNEXHU3N0VEXHU4QkVEXHVGRjBDPDIwIFx1NUI1N1x1RkYwQ1x1NTNCQlx1NjM4OVwiXHU2MjExXHU2MEYzXCJcIjNcdTRFMkFcdTY3MDhcIlwiNWtnXCJcdTdCNDlcdTUxNzdcdTRGNTNcdTY1NzBcdTVCNTdcdTRFMEVcdTY1RjZcdTk1RjRcdUZGMENcdTUzRUFcdTRGRERcdTc1NTlcdTc2RUVcdTY4MDdcdTY1QjlcdTU0MTFcdTMwMDJcbiAgICAtIFx1NjUzOVx1NTQwRFx1NzkzQVx1NEY4Qlx1RkYwOFx1NEVDNVx1NTNDMlx1ODAwM1x1OTAzQlx1OEY5MVx1RkYwQ1x1NEUwRFx1NjYyRlx1NkI3Qlx1ODlDNFx1NTIxOVx1RkYwOVx1RkYxQVxuICAgICAgXHUwMEI3IFx1N0IxNFx1OEJCMFx1MzAwQzNcdTRFMkFcdTY3MDhcdTUxQ0ZcdTkxQ0QgNWtnXHUzMDBEIFx1MjE5MiBcdTY4MDdcdTk4OThcdTMwMENcdTUwNjVcdTVFQjdcdTUxQ0ZcdTkxQ0RcdTMwMERcdTYyMTZcdTMwMENcdTRGNTNcdTkxQ0RcdTdCQTFcdTc0MDZcdTMwMERcbiAgICAgIFx1MDBCNyBcdTdCMTRcdThCQjBcdTMwMENcdThCRkJcdTVCOENcdTMwMEFYWCBcdTdCOTdcdTZDRDVcdTMwMEJcdTMwMEQgXHUyMTkyIFx1NjgwN1x1OTg5OFx1MzAwQ1x1N0NGQlx1N0VERlx1NUI2Nlx1NEU2MCBYWFx1MzAwRFx1NjIxNlx1MzAwQ1x1N0I5N1x1NkNENVx1NTE2NVx1OTVFOFx1MzAwRFxuICAgICAgXHUwMEI3IFx1N0IxNFx1OEJCMFx1MzAwQ1x1NkJDRlx1NTkyOVx1OEREMVx1NkI2NSAzMCBcdTUyMDZcdTk0OUZcdTMwMDFcdTYzQTdcdTUyMzZcdTk5NkVcdTk4REZcdTMwMEQgXHUyMTkyIFx1NjgwN1x1OTg5OFx1MzAwQ1x1NTE3Qlx1NjIxMFx1OEZEMFx1NTJBOFx1NEU2MFx1NjBFRlx1MzAwRFxuICAgIC0gXHU1M0NEXHU0RjhCXHVGRjA4XHU3OTgxXHU2QjYyXHVGRjA5XHVGRjFBXHU2ODA3XHU5ODk4XHU0RTBFXHU3QjE0XHU4QkIwXHU5OTk2XHU1M0U1XHU5MDEwXHU1QjU3XHU3NkY4XHU1NDBDXHUzMDAxXHU0RkREXHU3NTU5XHU1MzlGXHU1OUNCXCIzXHU0RTJBXHU2NzA4XCIvXCI1a2dcIi9cIlx1NjIxMVx1NjBGM1wiXHU3QjQ5XHU1MTc3XHU0RjUzXHU2NTcwXHU1QjU3XHU0RTBFXHU2NUY2XHU5NUY0XHU5NjUwXHU1QjlBXHUzMDAyXG4xMy4gKipcdTZCQ0ZcdTRFMkFcdTc2RUVcdTY4MDdcdTVGQzVcdTk4N0JcdTdFRDlcdTUxRkEgYW5hbHlzaXNcdUZGMDhcdTVGNTJcdTdFQjNcdTUyMDZcdTY3OTBcdUZGMDkqKlx1RkYxQVx1NzUyOCAxLTIgXHU1M0U1XHU2OTgyXHU2MkVDXHU3QjE0XHU4QkIwXHU0RTNCXHU2NUU4XHVGRjBDXHU1RTc2XHU4QkY0XHU2NjBFXHUzMDBDXHU0RTNBXHU0RjU1XHU4RkQ5XHU2ODM3XHU2MkM2XHUzMDAxXHU1MTczXHU5NTJFXHU5OENFXHU5NjY5XHU2MjE2XHU2Q0U4XHU2MTBGXHU3MEI5XHUzMDBEXHVGRjBDXHUyMjY0NDAgXHU1QjU3XHUzMDAyXHU4RkQ5XHU2NjJGXHU3RUQ5XHU3NTI4XHU2MjM3XHU3Njg0XCJcdTVGNTJcdTdFQjMgKyBcdTUyMDZcdTY3OTBcIlx1RkYwQ1x1NEUwRFx1ODk4MVx1NTNFQVx1NTkwRFx1OEZGMFx1NjgwN1x1OTg5OFx1NjIxNlx1NzU1OVx1N0E3QVx1MzAwMlx1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1RkYwQ1x1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1NEUzQVx1NUI1MFx1OTg3OVx1MzAwMmA7XG5cbiAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApOyAvLyBZWVlZLU1NLUREXG4gIGNvbnN0IHVzZXIgPVxuICAgIHNjb3BlID09PSAnc2VsZWN0aW9uJ1xuICAgICAgPyBgXHU0RUNBXHU1OTI5XHU2NjJGICR7dG9kYXl9XHUzMDAyXFxuXFxuXHU0RUU1XHU0RTBCXHU2NjJGXHU3NTI4XHU2MjM3XHU1NzI4XHU3QjE0XHU4QkIwXHU0RTJEXHU5MDA5XHU0RTJEXHU3Njg0XHU0RTAwXHU2QkI1XHU2NTg3XHU2NzJDXHVGRjBDXHU4QkY3XHU3NkY0XHU2M0E1XHU2MjhBXHU1QjgzXHU0RjVDXHU0RTNBXHU0RTAwXHU0RTJBL1x1NTkxQVx1NEUyQVx1NzZFRVx1NjgwN1x1Njc2NVx1NjJDNlx1ODlFM1x1RkYwOFx1NEUwRFx1ODk4MVx1NUY1M1x1NjIxMFx1NjU3NFx1N0JDN1x1N0IxNFx1OEJCMFx1RkYwOVx1RkYxQVxcbiR7Y29udGVudH1gXG4gICAgICA6IGBcdTRFQ0FcdTU5MjlcdTY2MkYgJHt0b2RheX1cdTMwMDJcXG5cXG5cdTdCMTRcdThCQjBcdTZCNjNcdTY1ODdcdUZGMUFcXG4ke2NvbnRlbnR9YDtcblxuICByZXR1cm4geyBzeXN0ZW0sIHVzZXIgfTtcbn1cblxuLyoqIFx1NEVDRVx1NkEyMVx1NTc4Qlx1NTZERVx1NjI2N1x1NjU4N1x1NjcyQ1x1NEUyRFx1NjNEMFx1NTNENiBnb2FscyBcdTY1NzBcdTdFQzRcdUZGMDhcdTVCQjlcdTVGQ0QgYGBganNvbiBcdTU2RjRcdTY4MEZcdTRFMEVcdTUyNERcdTU0MEVcdTVFOUZcdThCRERcdUZGMDkgKi9cbmZ1bmN0aW9uIGV4dHJhY3RHb2Fsc09iamVjdChyYXc6IHVua25vd24pOiB7IGdvYWxzPzogdW5rbm93biB9IHtcbiAgaWYgKHJhdyAmJiB0eXBlb2YgcmF3ID09PSAnb2JqZWN0JyAmJiAnZ29hbHMnIGluIChyYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pKSB7XG4gICAgcmV0dXJuIHJhdyBhcyB7IGdvYWxzPzogdW5rbm93biB9O1xuICB9XG4gIC8vIHJhdyBcdTUzRUZcdTgwRkRcdTY2MkZcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMDhyZXNwLnRleHQgXHU2MjE2XHU1REYyIHN0cmluZ2lmeSBcdTc2ODRcdTU2REVcdTYyNjdcdUZGMDlcbiAgbGV0IHRleHQgPSB0eXBlb2YgcmF3ID09PSAnc3RyaW5nJyA/IHJhdyA6IEpTT04uc3RyaW5naWZ5KHJhdyk7XG5cbiAgLy8gXHU1M0JCIGBgYGpzb24gLi4uIGBgYCBcdTU2RjRcdTY4MEZcbiAgY29uc3QgZmVuY2UgPSB0ZXh0Lm1hdGNoKC9gYGAoPzpqc29uKT9cXHMqKFtcXHNcXFNdKj8pYGBgL2kpO1xuICBpZiAoZmVuY2UpIHRleHQgPSBmZW5jZVsxXTtcblxuICAvLyBcdTUzRDZcdTdCMkNcdTRFMDBcdTRFMkEgeyBcdTUyMzBcdTY3MDBcdTU0MEVcdTRFMDBcdTRFMkEgfSBcdTRFNEJcdTk1RjRcdTc2ODQgSlNPTlxuICBjb25zdCBzdGFydCA9IHRleHQuaW5kZXhPZigneycpO1xuICBjb25zdCBlbmQgPSB0ZXh0Lmxhc3RJbmRleE9mKCd9Jyk7XG4gIGlmIChzdGFydCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fCBlbmQgPD0gc3RhcnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NTZERVx1NjI2N1x1NEUyRFx1NjcyQVx1NjI3RVx1NTIzMCBKU09OIFx1NUJGOVx1OEM2MScpO1xuICB9XG4gIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodGV4dC5zbGljZShzdGFydCwgZW5kICsgMSkpO1xuICBpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnICYmICdnb2FscycgaW4gcGFyc2VkKSByZXR1cm4gcGFyc2VkO1xuICB0aHJvdyBuZXcgRXJyb3IoJ0pTT04gXHU0RTJEXHU3RjNBXHU1QzExIGdvYWxzIFx1NUI1N1x1NkJCNScpO1xufVxuXG4vKipcbiAqIFx1NjI4QVx1NkEyMVx1NTc4Qlx1NTZERVx1NjI2N1x1ODlFM1x1Njc5MFx1NEUzQSBHb2FsSXRlbVtdXHUzMDAyXG4gKiBcdTRFQzVcdTUwNUFcdTdFRDNcdTY3ODRcdTYzRDBcdTUzRDZcdTRFMEVcdTU3RkFcdTc4NDBcdTY2MjBcdTVDMDRcdUZGMDhcdTc1MUZcdTYyMTAgaWRcdTMwMDFcdTY2MjBcdTVDMDRcdTVCNTdcdTZCQjVcdUZGMDlcdUZGMUJcdTZERjFcdTVFQTZcdTY4MjFcdTlBOEMvXHU4ODY1XHU5RUQ4XHU4QkE0XHU0RUE0XHU3NTMxIEdvYWxDYXJkVmFsaWRhdG9yXHUzMDAyXG4gKiBAdGhyb3dzIFx1NUY1M1x1NTZERVx1NjI2N1x1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1NjIxNlx1N0VEM1x1Njc4NFx1OTc1RVx1NkNENVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VHb2FscyhyYXdUZXh0OiB1bmtub3duKTogR29hbEl0ZW1bXSB7XG4gIGNvbnN0IG9iaiA9IGV4dHJhY3RHb2Fsc09iamVjdChyYXdUZXh0KTtcbiAgY29uc3QgZ29hbHMgPSBvYmouZ29hbHM7XG4gIGlmICghQXJyYXkuaXNBcnJheShnb2FscykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2dvYWxzIFx1NEUwRFx1NjYyRlx1NjU3MFx1N0VDNCcpO1xuICB9XG5cbiAgcmV0dXJuIGdvYWxzLm1hcCgoZywgZ2kpOiBHb2FsSXRlbSA9PiB7XG4gICAgY29uc3QgZ29hbCA9IChnID8/IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBjb25zdCBpdGVtcyA9IEFycmF5LmlzQXJyYXkoZ29hbC5pdGVtcylcbiAgICAgID8gKGdvYWwuaXRlbXMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5bXSkubWFwKChpdCwgaWkpOiBHb2FsU3ViSXRlbSA9PiB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGl0ID8/IHt9O1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiB0eXBlb2YgaXRlbS5uYW1lID09PSAnc3RyaW5nJyAmJiBpdGVtLm5hbWUgPyBpdGVtLm5hbWUgOiBgXHU1QjUwXHU5ODc5JHtpaSArIDF9YCxcbiAgICAgICAgICAgIHRhcmdldFZhbHVlOiB0eXBlb2YgaXRlbS50YXJnZXRWYWx1ZSA9PT0gJ3N0cmluZycgPyBpdGVtLnRhcmdldFZhbHVlIDogJycsXG4gICAgICAgICAgICBjdXJyZW50VmFsdWU6IHR5cGVvZiBpdGVtLmN1cnJlbnRWYWx1ZSA9PT0gJ3N0cmluZycgPyBpdGVtLmN1cnJlbnRWYWx1ZSA6ICcnLFxuICAgICAgICAgICAgZGFpbHlNaW46IGNsZWFuRGFpbHlNaW4oaXRlbS5kYWlseU1pbiksXG4gICAgICAgICAgICB0YXNrRGF5VHlwZTogdHlwZW9mIGl0ZW0udGFza0RheVR5cGUgPT09ICdzdHJpbmcnID8gaXRlbS50YXNrRGF5VHlwZSA6ICdkYWlseScsXG4gICAgICAgICAgICBkZXRhaWw6IHR5cGVvZiBpdGVtLnJlYXNvbiA9PT0gJ3N0cmluZycgPyBpdGVtLnJlYXNvbiA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgOiBbXTtcblxuICAgIGNvbnN0IGNhdGVnb3J5UmF3ID0gdHlwZW9mIGdvYWwuY2F0ZWdvcnkgPT09ICdzdHJpbmcnID8gZ29hbC5jYXRlZ29yeSA6ICcnO1xuICAgIGNvbnN0IGNhdGVnb3J5OiBHb2FsQ2F0ZWdvcnkgfCBzdHJpbmcgPVxuICAgICAgR09BTF9DQVRFR09SSUVTLnNvbWUoKGMpID0+IGMuaWQgPT09IGNhdGVnb3J5UmF3KSA/IGNhdGVnb3J5UmF3IDogJ290aGVyJztcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogYGdvYWxfJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1fJHtnaX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA4KX1gLFxuICAgICAgdGl0bGU6IHR5cGVvZiBnb2FsLnRpdGxlID09PSAnc3RyaW5nJyAmJiBnb2FsLnRpdGxlID8gZ29hbC50aXRsZSA6IGBcdTc2RUVcdTY4MDcke2dpICsgMX1gLFxuICAgICAgYW5hbHlzaXM6IHR5cGVvZiBnb2FsLmFuYWx5c2lzID09PSAnc3RyaW5nJyAmJiBnb2FsLmFuYWx5c2lzID8gZ29hbC5hbmFseXNpcyA6IHVuZGVmaW5lZCxcbiAgICAgIGNhdGVnb3J5LFxuICAgICAgc3RhcnREYXRlOiB0eXBlb2YgZ29hbC5zdGFydERhdGUgPT09ICdzdHJpbmcnID8gZ29hbC5zdGFydERhdGUgOiAnJyxcbiAgICAgIGVuZERhdGU6IHR5cGVvZiBnb2FsLmVuZERhdGUgPT09ICdzdHJpbmcnID8gZ29hbC5lbmREYXRlIDogJycsXG4gICAgICBwcm9ncmVzczogMCxcbiAgICAgIGl0ZW1zLFxuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIFx1NEVDRSBjaGF0L2NvbXBsZXRpb25zIFx1NTZERVx1NjI2N1x1NEUyRFx1NjNEMFx1NTNENlx1NkEyMVx1NTc4Qlx1OEY5M1x1NTFGQVx1NzY4NFx1NjU4N1x1NjcyQ1x1MzAwMlxuICogXHU1MTdDXHU1QkI5XHU0RTI0XHU3OUNEXHU1RjYyXHU2MDAxXHVGRjFBXG4gKiAgLSBPcGVuQUkgXHU5OENFXHU2ODNDXHVGRjFBeyBjaG9pY2VzOlt7IG1lc3NhZ2U6eyBjb250ZW50IH0gfV0gfVx1RkYwOGpzb24gXHU2MjE2IHRleHQgXHU1NzQ3XHU1M0VGXHU4MEZEXHVGRjA5XG4gKiAgLSBcdTc2RjRcdTUxRkFcdUZGMUFyZXNwLmpzb24gXHU1REYyXHU2NjJGXHU1QkY5XHU4QzYxIC8gcmVzcC50ZXh0IFx1NURGMlx1NjYyRiBKU09OIFx1NjU4N1x1NjcyQ1xuICogXHU2M0QwXHU1M0Q2XHU1OTMxXHU4RDI1XHVGRjA4XHU3QTdBIC8gXHU5NzVFIDJ4eFx1RkYwOVx1N0VERlx1NEUwMFx1NjI5Qlx1OTUxOVx1RkYwQ1x1NEZCRlx1NEU4RVx1NEUwQVx1NUM0Mlx1OTFDRFx1OEJENSAvIFx1NjNEMFx1NzkzQVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdENoYXRUZXh0KHJlc3A6IEFpUmVzcG9uc2UpOiBzdHJpbmcge1xuICBpZiAocmVzcC5zdGF0dXMgPCAyMDAgfHwgcmVzcC5zdGF0dXMgPj0gMzAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBBSSBcdTY3MERcdTUyQTFcdThGRDRcdTU2REUgSFRUUCAke3Jlc3Auc3RhdHVzfWApO1xuICB9XG4gIGxldCBkYXRhOiB1bmtub3duID0gcmVzcC5qc29uO1xuICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkIHx8IGRhdGEgPT09IG51bGwpIHtcbiAgICBpZiAodHlwZW9mIHJlc3AudGV4dCA9PT0gJ3N0cmluZycgJiYgcmVzcC50ZXh0LnRyaW0oKSkgZGF0YSA9IHJlc3AudGV4dDtcbiAgICBlbHNlIHRocm93IG5ldyBFcnJvcignQUkgXHU1NkRFXHU2MjY3XHU0RTNBXHU3QTdBJyk7XG4gIH1cblxuICAvLyBPcGVuQUkgXHU5OENFXHU2ODNDXHU1MzA1XHU4OEM1XHVGRjFBY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQgXHU2MjREXHU2NjJGXHU3NzFGXHU2QjYzXHU3Njg0IEpTT04vXHU2NTg3XHU2NzJDXG4gIGlmIChcbiAgICBkYXRhICYmXG4gICAgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmXG4gICAgQXJyYXkuaXNBcnJheSgoZGF0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuY2hvaWNlcylcbiAgKSB7XG4gICAgY29uc3QgY2hvaWNlcyA9IChkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5jaG9pY2VzIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PjtcbiAgICBjb25zdCBtc2cgPSBjaG9pY2VzWzBdPy5tZXNzYWdlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgIGlmIChtc2cgJiYgdHlwZW9mIG1zZy5jb250ZW50ID09PSAnc3RyaW5nJykgcmV0dXJuIG1zZy5jb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykgcmV0dXJuIGRhdGE7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbn1cblxuLyoqXG4gKiBcdTg5QzRcdTUyMTJcdTRFM0JcdTZENDFcdTdBMEJcdUZGMUFcdThDMDNcdTc1MjggQUkgXHUyMTkyIFx1ODlFM1x1Njc5MCBcdTIxOTIgXHU1OTMxXHU4RDI1XHU5MUNEXHU4QkQ1XHU0RTAwXHU2QjIxXHUzMDAyXG4gKiBAcGFyYW0gY29udGVudCBcdTdCMTRcdThCQjBcdTZCNjNcdTY1ODdcbiAqIEBwYXJhbSBzZXR0aW5ncyBBSSBcdThCQkVcdTdGNkVcdUZGMDhrZXkgLyBiYXNlVXJsIC8gbW9kZWwgLyBkZXB0aFx1RkYwOVxuICogQHBhcmFtIGZldGNoRm4gXHU1M0VGXHU2Q0U4XHU1MTY1XHU3Njg0IGZldGNoXHVGRjA4XHU5RUQ4XHU4QkE0IHJlcXVlc3RVcmxcdUZGMENcdTRGQkZcdTRFOEVcdTZENEJcdThCRDVcdUZGMDlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBsYW5Gcm9tTm90ZShcbiAgY29udGVudDogc3RyaW5nLFxuICBzZXR0aW5nczogUGxhbm5lclNldHRpbmdzLFxuICBmZXRjaEZuOiBBaUZldGNoRm4gPSByZXF1ZXN0VXJsIGFzIHVua25vd24gYXMgQWlGZXRjaEZuLFxuICBzY29wZTogJ25vdGUnIHwgJ3NlbGVjdGlvbicgPSAnbm90ZSdcbik6IFByb21pc2U8R29hbEl0ZW1bXT4ge1xuICBjb25zdCB1cmwgPSBgJHtzZXR0aW5ncy5haUJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJyl9L2NoYXQvY29tcGxldGlvbnNgO1xuICBjb25zdCB7IHN5c3RlbSwgdXNlciB9ID0gYnVpbGRQcm9tcHQoY29udGVudCwgc2V0dGluZ3MuYWlEZWNvbXBvc2VEZXB0aCwgc2NvcGUpO1xuXG4gIGNvbnN0IGF0dGVtcHQgPSBhc3luYyAoKTogUHJvbWlzZTxBaVJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoRm4oe1xuICAgICAgdXJsLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtzZXR0aW5ncy5haUFwaUtleX1gLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbW9kZWw6IHNldHRpbmdzLmFpTW9kZWwsXG4gICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtIH0sXG4gICAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXIgfSxcbiAgICAgICAgXSxcbiAgICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7IHR5cGU6ICdqc29uX29iamVjdCcgfSxcbiAgICAgICAgdGVtcGVyYXR1cmU6IDAuMyxcbiAgICAgIH0pLFxuICAgIH0pO1xuICAgIGlmIChyZXNwLnN0YXR1cyA8IDIwMCB8fCByZXNwLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQUkgXHU2NzBEXHU1MkExXHU4RkQ0XHU1NkRFIEhUVFAgJHtyZXNwLnN0YXR1c31gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3A7XG4gIH07XG5cbiAgY29uc3QgcGFyc2VPbmNlID0gKHJlc3A6IEFpUmVzcG9uc2UpOiBHb2FsSXRlbVtdID0+IHBhcnNlR29hbHMoZXh0cmFjdENoYXRUZXh0KHJlc3ApKTtcblxuICB0cnkge1xuICAgIHJldHVybiBwYXJzZU9uY2UoYXdhaXQgYXR0ZW1wdCgpKTtcbiAgfSBjYXRjaCAoZmlyc3RFcnIpIHtcbiAgICAvLyBcdTkxQ0RcdThCRDVcdTRFMDBcdTZCMjFcdUZGMDhcdTdGNTFcdTdFRENcdTYyOTZcdTUyQTggLyBcdTUwNzZcdTUzRDFcdTU3NEYgSlNPTlx1RkYwOVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gcGFyc2VPbmNlKGF3YWl0IGF0dGVtcHQoKSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBSSBcdTg5QzRcdTUyMTJcdTU5MzFcdThEMjVcdUZGMUEke2ZpcnN0RXJyIGluc3RhbmNlb2YgRXJyb3IgPyBmaXJzdEVyci5tZXNzYWdlIDogJ1x1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1OEZENFx1NTZERVx1N0VEM1x1Njc5Qyd9XHUzMDAyXHU4QkY3XHU2OEMwXHU2N0U1IEFQSSBLZXkgLyBcdTdGNTFcdTdFRENcdUZGMENcdTYyMTZcdTkxQ0RcdThCRDVcdTMwMDJgXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogXHU2ODM4XHU1RkMzXHU2NTcwXHU2MzZFXHU1QzQyXHU3QzdCXHU1NzhCXHU1QjlBXHU0RTQ5XHVGRjA4QiBcdTY4NjNcdUZGMUFcdTZEODhcdTk2NjRcdTY1NzBcdTYzNkVcdTVDNDIgYW55XHVGRjA5XG4gKlxuICogXHU4RkQ5XHU0RTlCXHU3QzdCXHU1NzhCXHU4OEFCIFZhdWx0U3RvcmFnZSAvIEltcG9ydFZhbGlkYXRvciAvIE1hcmtkb3duU3luYyAvIFN0b3JhZ2VCcmlkZ2UgXHU1MTcxXHU3NTI4XHVGRjBDXG4gKiBcdTc4NkVcdTRGRERcIlx1NUJGQ1x1NTE2NVx1NjgyMVx1OUE4Q1wiXHU0RTBFXCJcdTVCOUVcdTk2NDVcdTg0M0RcdTc2RDhcdTdFRDNcdTY3ODRcIlx1NTcyOFx1N0YxNlx1OEJEMVx1NjcxRlx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1MjAxNFx1MjAxNFxuICogXHU0RUU1XHU1NDBFXHU2NTM5IERheURhdGEgXHU3RUQzXHU2Nzg0XHU2NUY2XHVGRjBDVFMgXHU0RjFBXHU1RjNBXHU1MjM2XHU1NDBDXHU2QjY1IEltcG9ydFZhbGlkYXRvciBcdTc2ODRcdTY4MjFcdTlBOENcdTkwM0JcdThGOTFcdTMwMDJcbiAqL1xuXG4vKiogXHU1MzU1XHU2NUU1XHU2NUY2XHU5NUY0XHU4Rjc0XHU3Njg0XHU0RTAwXHU0RTJBXHU2NUY2XHU2QkI1ICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVsaW5lUGVyaW9kIHtcbiAgcGVyaW9kOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgdGltZTogc3RyaW5nO1xuICBpY29uPzogc3RyaW5nO1xuICBldmFsPzogc3RyaW5nO1xuICBpdGVtcz86IEFycmF5PHsgdGltZTogc3RyaW5nOyB0YXNrOiBzdHJpbmc7IGV2YWw/OiBzdHJpbmcgfT47XG59XG5cbi8qKlxuICogXHU3NkVFXHU2ODA3XHU5ODg2XHU1N0RGXHU2NzlBXHU0RTNFXHVGRjA4XHU0RTBFIHdlYmFwcCBERUZBVUxUX0NBVEVHT1JJRVMgXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHVGRjA5XG4gKiB3b3JrPVx1NURFNVx1NEY1QyAvIHBlcnNvbmFsPVx1NEUyQVx1NEVCQSAvIGhlYWx0aD1cdTUwNjVcdTVFQjcgLyBzdHVkeT1cdTVCNjZcdTRFNjAgLyBmaW5hbmNlPVx1OEQyMlx1NTJBMSAvIG90aGVyPVx1NTE3Nlx1NEVENlxuICovXG5leHBvcnQgY29uc3QgR09BTF9DQVRFR09SSUVTID0gW1xuICB7IGlkOiAnd29yaycsIG5hbWU6ICdcdTVERTVcdTRGNUMnLCBpY29uOiAnXHVEODNEXHVEQ0JDJyB9LFxuICB7IGlkOiAncGVyc29uYWwnLCBuYW1lOiAnXHU0RTJBXHU0RUJBJywgaWNvbjogJ1x1RDgzQ1x1REYzMScgfSxcbiAgeyBpZDogJ2hlYWx0aCcsIG5hbWU6ICdcdTUwNjVcdTVFQjcnLCBpY29uOiAnXHVEODNDXHVERkMzJyB9LFxuICB7IGlkOiAnc3R1ZHknLCBuYW1lOiAnXHU1QjY2XHU0RTYwJywgaWNvbjogJ1x1RDgzRFx1RENEQScgfSxcbiAgeyBpZDogJ2ZpbmFuY2UnLCBuYW1lOiAnXHU4RDIyXHU1MkExJywgaWNvbjogJ1x1RDgzRFx1RENCMCcgfSxcbiAgeyBpZDogJ290aGVyJywgbmFtZTogJ1x1NTE3Nlx1NEVENicsIGljb246ICdcdUQ4M0VcdURERTknIH0sXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBHb2FsQ2F0ZWdvcnkgPSAodHlwZW9mIEdPQUxfQ0FURUdPUklFUylbbnVtYmVyXVsnaWQnXTtcblxuLyoqIFx1NUI1MFx1OTg3OVx1ODI4Mlx1NTk0Rlx1N0M3Qlx1NTc4Qlx1RkYwOFx1NEUwRSB3ZWJhcHAgdGFza0RheVR5cGUgXHU1QkY5XHU5RjUwXHVGRjA5ICovXG5leHBvcnQgdHlwZSBUYXNrRGF5VHlwZSA9ICdkYWlseScgfCAnd2Vla2x5JyB8ICdtb250aGx5JyB8ICdjdXN0b20nO1xuXG4vKipcbiAqIFx1NzZFRVx1NjgwN1x1OTg3OVx1RkYwOGdvYWxzIFx1NEUwQlx1NzY4NFx1NEUwMFx1OTg3OVx1OEZEQlx1NUVBNlx1RkYwOVxuICogXHU1QjU3XHU2QkI1XHU1NDExIHdlYmFwcCBHb2FsU2VydmljZSBcdTY3MUZcdTY3MUJcdTc2ODRcdTVCNTBcdTk4NzlcdTdFRDNcdTY3ODRcdTVCRjlcdTlGNTBcdUZGMDhcdTg5QzEgR29hbFNlcnZpY2UuX21pZ3JhdGVGcm9tRGF5RGF0YSAvIGRlZmF1bHREYXRhLmpzXHVGRjA5XHVGRjFBXG4gKiAgLSBkYWlseU1pbiAvIHRhc2tEYXlUeXBlIFx1OUE3MVx1NTJBOFx1MzAwQ1x1NEVDQVx1NjVFNVx1NEVGQlx1NTJBMVx1MzAwRFx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFxuICogIC0gc3RhcnRWYWx1ZSAvIHRhcmdldFZhbHVlIC8gY3VycmVudFZhbHVlIFx1OUE3MVx1NTJBOFx1OEZEQlx1NUVBNlx1OEZGRFx1OEUyQVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdvYWxTdWJJdGVtIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwZXJjZW50PzogbnVtYmVyO1xuICBkZXRhaWw/OiBzdHJpbmc7XG4gIHN0YXJ0RGF0ZT86IHN0cmluZztcbiAgZW5kRGF0ZT86IHN0cmluZztcbiAgc3RhcnRWYWx1ZT86IHN0cmluZztcbiAgdGFyZ2V0VmFsdWU/OiBzdHJpbmc7XG4gIGN1cnJlbnRWYWx1ZT86IHN0cmluZztcbiAgLyoqIFx1NkJDRlx1NjVFNVx1OTFDRlx1RkYwOFx1NTk4MiAnMzAnXHUzMDAxJzInXHVGRjA5XHVGRjBDXHU5QTcxXHU1MkE4XHU0RUNBXHU2NUU1XHU0RUZCXHU1MkExXHU1ODlFXHU5MUNGXHVGRjFCXHU3QTdBXHU1MjE5XHU0RTBEXHU3NTFGXHU2MjEwXHU0RUNBXHU2NUU1XHU0RUZCXHU1MkExICovXG4gIGRhaWx5TWluPzogc3RyaW5nO1xuICB0YXNrRGF5VHlwZT86IFRhc2tEYXlUeXBlIHwgc3RyaW5nO1xuICAvKiogXHU4OUM0XHU1MjEyXHU2NzY1XHU2RTkwXHU2ODA3XHU2Q0U4XHVGRjA4XHU0RUM1XHU1QkExXHU5NjA1XHU1QzU1XHU3OTNBL1x1NjVFNVx1NjJBNVx1RkYwQ1x1NTNFRlx1OTAwOVx1RkYwOSAqL1xuICBzb3VyY2VSZWY/OiBzdHJpbmc7XG59XG5cbi8qKiBcdTUzNTVcdTRFMkFcdTc2RUVcdTY4MDcgKi9cbmV4cG9ydCBpbnRlcmZhY2UgR29hbEl0ZW0ge1xuICBpZDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICAvKiogQUkgXHU1QkY5XHU3QjE0XHU4QkIwXHU3Njg0XHU1RjUyXHU3RUIzXHU1MjA2XHU2NzkwXHVGRjA4MS0yIFx1NTNFNVx1NEUzQlx1NjVFOCArIFx1NjJDNlx1ODlFM1x1NzQwNlx1NzUzMS9cdTUxNzNcdTk1MkVcdTk4Q0VcdTk2NjlcdUZGMDlcdUZGMENcdTRFQzVcdTVDNTVcdTc5M0FcdTc1MjhcdUZGMENcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTZcdTRFM0FcdTVCNTBcdTk4NzkgKi9cbiAgYW5hbHlzaXM/OiBzdHJpbmc7XG4gIGljb24/OiBzdHJpbmc7XG4gIG1ldGE/OiBzdHJpbmc7XG4gIC8qKiBcdTk4ODZcdTU3REZcdUZGMDh3b3JrL3BlcnNvbmFsL2hlYWx0aC9zdHVkeS9maW5hbmNlL290aGVyXHVGRjA5XHVGRjBDd2ViYXBwIFx1NjM2RVx1NkI2NFx1NTIwNlx1N0VDNFx1Nzc0MFx1ODI3MiAqL1xuICBjYXRlZ29yeT86IEdvYWxDYXRlZ29yeSB8IHN0cmluZztcbiAgc3RhcnREYXRlPzogc3RyaW5nO1xuICBlbmREYXRlPzogc3RyaW5nO1xuICBwcm9ncmVzcz86IG51bWJlcjtcbiAgcHJpb3JpdHk/OiBzdHJpbmcgfCBudW1iZXI7XG4gIC8qKiBcdTVERjJcdTVGNTJcdTY4NjNcdUZGMDhcdTRFMERcdTUzQzJcdTRFMEVcdThGREJcdTg4NENcdTRFMkRcdThCQ0FcdTY1QURcdUZGMDkgKi9cbiAgYXJjaGl2ZWQ/OiBib29sZWFuO1xuICBhcmNoaXZlZEF0Pzogc3RyaW5nO1xuICBpdGVtcz86IEdvYWxTdWJJdGVtW107XG4gIC8qKiBcdTg5QzRcdTUyMTJcdTY3NjVcdTZFOTBcdUZGMUFcdTY3NjVcdTZFOTBcdTdCMTRcdThCQjBcdTc2ODQgdmF1bHQgXHU4REVGXHU1Rjg0XHVGRjBDXHU3NTI4XHU0RThFXHU2NUU1XHU2MkE1XHU2ODA3XHU2Q0U4ICovXG4gIHNvdXJjZVJlZj86IHN0cmluZztcbn1cblxuLyoqIFx1NTM1NVx1NjVFNVx1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RSAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXlEYXRhIHtcbiAgZGF0ZTogc3RyaW5nO1xuICB3ZWVrZGF5Pzogc3RyaW5nO1xuICBtZXRyaWNzPzoge1xuICAgIGZpcnN0Q2hlY2tJbj86IHN0cmluZztcbiAgICBsYXN0Q2hlY2tJbj86IHN0cmluZztcbiAgICBjb21wbGV0ZWRUYXNrcz86IHN0cmluZztcbiAgICBpbnNwaXJhdGlvbkNvdW50Pzogc3RyaW5nO1xuICAgIGFjdGl2ZVRpbWU/OiBzdHJpbmc7XG4gICAgZW1wdHlTbG90cz86IHN0cmluZztcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIH07XG4gIHRpbWVsaW5lPzogVGltZWxpbmVQZXJpb2RbXTtcbiAgZ29hbHM/OiBHb2FsSXRlbVtdO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG4vKiogXHU1RTk0XHU3NTI4XHU4QkJFXHU3RjZFXHVGRjA4XHU4NDNEIHNldHRpbmdzLmpzb25cdUZGMDkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXBwU2V0dGluZ3Mge1xuICB0aGVtZT86ICdsaWdodCcgfCAnZGFyayc7XG4gIGJhbGFuY2U/OiBudW1iZXI7XG4gIGNvbG9yVGhlbWU/OiBzdHJpbmc7XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbi8qKiBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgLyBcdTY1MzZcdTUxNjVcdTUzODZcdTUzRjJcdUZGMDhcdTdFRDNcdTY3ODRcdTVCQkRcdTY3N0VcdUZGMENcdTRFQzVcdTUwNUFcdTkwMEZcdTRGMjBcdUZGMDkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGlzdG9yeVJlY29yZCB7XG4gIGlkPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1cmNoYXNlSGlzdG9yeSB7XG4gIHJlY29yZHM/OiBIaXN0b3J5UmVjb3JkW107XG4gIGFyY2hpdmU/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbmNvbWVIaXN0b3J5IHtcbiAgcmVjb3Jkcz86IEhpc3RvcnlSZWNvcmRbXTtcbiAgYXJjaGl2ZT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG4vKiogXHU1QkZDXHU1MUZBIC8gXHU1QkZDXHU1MTY1XHU3Njg0XHU1QjhDXHU2NTc0XHU2NTcwXHU2MzZFXHU3RUQzXHU2Nzg0ICovXG5leHBvcnQgaW50ZXJmYWNlIEV4cG9ydFNoYXBlIHtcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBleHBvcnRlZEF0Pzogc3RyaW5nO1xuICBzdG9yYWdlVHlwZT86IHN0cmluZztcbiAgZGF5czogUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gIGdvYWxzOiBHb2FsSXRlbVtdO1xuICBzZXR0aW5nczogQXBwU2V0dGluZ3M7XG4gIHB1cmNoYXNlSGlzdG9yeTogUHVyY2hhc2VIaXN0b3J5IHwgbnVsbDtcbiAgaW5jb21lSGlzdG9yeTogSW5jb21lSGlzdG9yeSB8IG51bGw7XG4gIHRoZW1lcz86IHVua25vd25bXTtcbiAgcmVwb3J0cz86IHVua25vd25bXTtcbn1cbiIsICIvKipcbiAqIEdvYWxDYXJkVmFsaWRhdG9yIFx1MjAxNCBBSSBcdTRFQTdcdTUxRkFcdTc2RUVcdTY4MDdcdTc2ODRcdTY4MjFcdTlBOENcdTRFMEVcdTUxNUNcdTVFOTVcdUZGMDhQaGFzZSAyXHVGRjA5XG4gKlxuICogXHU1QkY5XHU5RjUwIHdlYmFwcCBHb2FsU2VydmljZSBcdTY3MUZcdTY3MUJcdTc2ODRcdTc2RUVcdTY4MDcvXHU1QjUwXHU5ODc5XHU3RUQzXHU2Nzg0XHVGRjFBXG4gKiAgLSBcdTdDN0JcdTU3OEJcdTVGM0FcdThGNkNcdTMwMDFcdTdGM0FcdTU5MzFcdTVCNTdcdTZCQjVcdTg4NjVcdTlFRDhcdThCQTRcdTMwMDFjYXRlZ29yeSBcdTY3OUFcdTRFM0VcdTk3NUVcdTZDRDVcdTU2REVcdTg0M0QgJ290aGVyJ1x1RkYxQlxuICogIC0gXHU0RTIyXHU2NzJBXHU3N0U1XHU1QjU3XHU2QkI1XHVGRjA4XHU5MDdGXHU1MTREIEFJIFx1NEU3MVx1NTg1RVx1NUI1N1x1NkJCNVx1NkM2MVx1NjdEMyBnb2Fscy5qc29uXHVGRjA5XHVGRjFCXG4gKiAgLSBjbGFzc2lmeUNvbXBsZXRlbmVzcyBcdTUyMjRcdTVCOUEgY29tcGxldGUgLyB0aGluXHVGRjBDXHU1RTc2XHU1MjE3XHU1MUZBXHU3RjNBXHU1OTMxXHU3RUY0XHU1RUE2XHVGRjBDXHU0RjlCXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3XHU2MjUzIFx1MjZBMFx1MzAwMlxuICpcbiAqIFx1N0VBRlx1NTFGRFx1NjU3MFx1MzAwMVx1OTZGNiBPYnNpZGlhbiBcdTRGOURcdThENTZcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdTMwMDJcbiAqL1xuXG5pbXBvcnQge1xuICBHT0FMX0NBVEVHT1JJRVMsXG4gIHR5cGUgR29hbENhdGVnb3J5LFxuICB0eXBlIEdvYWxJdGVtLFxuICB0eXBlIEdvYWxTdWJJdGVtLFxufSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVEFTS19EQVlfVFlQRSA9ICdkYWlseSc7XG5cbmNvbnN0IENBVEVHT1JZX1NFVCA9IG5ldyBTZXQ8c3RyaW5nPihHT0FMX0NBVEVHT1JJRVMubWFwKChjKSA9PiBjLmlkKSk7XG5cbi8qKlxuICogXHU0RUNFXHU1QjUwXHU5ODc5XHU1NDBEXHU0RTJEXHU2M0QwXHU1M0Q2XHU1MzU1XHU0RjREXHVGRjA4XHU1OTgyXCJcdTZCQ0ZcdTU5MjlcdTk5NkVcdTk4REZcdTcwRURcdTkxQ0ZcdTRFMEFcdTk2NTAoXHU1MzQzXHU1MzYxKVwiXHUyMTkyXCJcdTUzNDNcdTUzNjFcIlx1RkYwQ1wiXHU2QkNGXHU1OTI5XHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwXCJcdTIxOTJcIlx1OTg3NVwiXHVGRjA5XHVGRjBDXHU3NTI4XHU0RThFXHU2NTcwXHU1QjU3XHU2ODQ2XHU1NDBFXHU3RjAwXHU1QzU1XHU3OTNBXHUzMDAyXG4gKiBcdTg4QUIgUGxhbkNvbmZpcm1Nb2RhbCAvIEFnZW50aWNQbGFuTW9kYWwgXHU1OTBEXHU3NTI4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0VW5pdChuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTRGMThcdTUxNDhcdTUzMzlcdTkxNERcdTYyRUNcdTUzRjdcdTRFMkRcdTc2ODRcdTUzNTVcdTRGNERcdUZGMUFcIihcdTUzNDNcdTUzNjEpXCIgLyBcIlx1RkYwOFx1NUMwRlx1NjVGNlx1RkYwOVwiXG4gIGNvbnN0IGJyYWNrZXQgPSBuYW1lLm1hdGNoKC9bXHVGRjA4KF0oW1x1NEUwMC1cdTlGQTVdKylbKVx1RkYwOV0vKTtcbiAgaWYgKGJyYWNrZXQpIHJldHVybiBicmFja2V0WzFdO1xuICAvLyBcdTkwMDBcdTUzMTZcdTUzMzlcdTkxNERcdUZGMUFcdTRFRTVcIlx1NjU3MFwiXHU3RUQzXHU1QzNFXHVGRjA4XHU1OTgyXCJcdTk2MDVcdThCRkJcdTk4NzVcdTY1NzBcIlx1MjE5MlwiXHU5ODc1XCJcdUZGMDlcbiAgY29uc3Qgc3VmZml4ID0gbmFtZS5tYXRjaCgvXHU2QkNGW1x1NEUwMFx1NTkyOVx1NjVFNVx1NTQ2OFx1NjcwOF0/KC4rPylcdTY1NzAvKTtcbiAgaWYgKHN1ZmZpeCkgcmV0dXJuIHN1ZmZpeFsxXTtcbiAgcmV0dXJuICcnO1xufVxuXG5mdW5jdGlvbiBzdHIodjogdW5rbm93biwgZmFsbGJhY2sgPSAnJyk6IHN0cmluZyB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2IDogZmFsbGJhY2s7XG59XG5cbmZ1bmN0aW9uIG51bSh2OiB1bmtub3duLCBmYWxsYmFjayA9IDApOiBudW1iZXIge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdudW1iZXInICYmICFOdW1iZXIuaXNOYU4odikgPyB2IDogZmFsbGJhY2s7XG59XG5cbi8qKlxuICogXHU2RTA1XHU2RDE3XHU2QkNGXHU2NUU1XHU5MUNGXHU0RTNBXHU3RUFGXHU2NTcwXHU1QjU3XHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA4XHU5MUNGXHU1MzE2XHU2ODM4XHU1RkMzXHVGRjA5XHUzMDAyXG4gKiAgLSBcIjMwXCIgLyBcIjIuNVwiIFx1MjE5MiBcdTUzOUZcdTY4MzdcbiAqICAtIFwiMzBcdTUyMDZcdTk0OUZcIiAvIFwiN1x1NUMwRlx1NjVGNlwiIC8gXCIyMDBcdTUzNDNcdTUzNjFcIiBcdTIxOTIgXHU1M0Q2XHU1MjREXHU3RjAwXHU2NTcwXHU1QjU3IFwiMzBcIiAvIFwiN1wiIC8gXCIyMDBcIlxuICogIC0gXCJcdTdFQTYzMFx1OTg3NVwiIFx1MjE5MiBcdTUyNjVcdTc5QkJcdTk3NUVcdTY1NzBcdTVCNTcgXHUyMTkyIFwiMzBcIlxuICogIC0gXCJcdTZCQ0ZcdTU5MjlcdTU3NUFcdTYzMDFcIiAvIFwiXCIgXHUyMTkyIFwiXCJcdUZGMDhcdTY1RTBcdTZDRDVcdTkxQ0ZcdTUzMTZcdUZGMDlcbiAqIFx1NzZFRVx1NzY4NFx1RkYxQVx1Nzg2RVx1NEZERFx1NEUwQlx1NkUzOCBwYXJzZUludCBcdTRFMERcdTRFQTdcdTc1MUYgTmFOXHVGRjBDXHU0RUNBXHU2NUU1XHU0RUZCXHU1MkExXHU4MEZEXHU2QjYzXHU1RTM4XHU3NTFGXHU2MjEwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbkRhaWx5TWluKHJhdzogdW5rbm93bik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgcmF3ICE9PSAnc3RyaW5nJykgcmV0dXJuICcnO1xuICBjb25zdCB0cmltbWVkID0gcmF3LnRyaW0oKTtcbiAgaWYgKCF0cmltbWVkKSByZXR1cm4gJyc7XG4gIGlmICgvXlxcZCsoXFwuXFxkKyk/JC8udGVzdCh0cmltbWVkKSkgcmV0dXJuIHRyaW1tZWQ7XG4gIGNvbnN0IHByZWZpeCA9IHRyaW1tZWQubWF0Y2goL14oXFxkKyg/OlxcLlxcZCspPykvKTtcbiAgaWYgKHByZWZpeCkgcmV0dXJuIHByZWZpeFsxXTtcbiAgY29uc3Qgc3RyaXBwZWQgPSB0cmltbWVkLnJlcGxhY2UoL1teMC05Ll0vZywgJycpO1xuICAvLyBcdTUyNjVcdTc5QkJcdTU0MEVcdTUzRUZcdTgwRkRcdTZCOEJcdTc1NTlcdTU5MUFcdTRGNTlcdTVDMEZcdTY1NzBcdTcwQjlcdUZGMDhcdTU5ODIgXCIzLjUuMlwiXHVGRjA5XHVGRjBDXHU0RUM1XHU1M0Q2XHU5OTk2XHU0RTJBXHU1NDA4XHU2Q0Q1XHU2NTcwXHU1QjU3XG4gIGNvbnN0IHZhbGlkID0gc3RyaXBwZWQubWF0Y2goL1xcZCsoXFwuXFxkKyk/Lyk7XG4gIHJldHVybiB2YWxpZCA/IHZhbGlkWzBdIDogJyc7XG59XG5cbi8qKiBcdTUyMjRcdTY1QURcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdTY2MkZcdTU0MjZcdTVERjJcdTkxQ0ZcdTUzMTZcdUZGMDhcdTdFQUZcdTY1NzBcdTVCNTdcdUZGMENcdTk3NUVcdTdBN0FcdUZGMDkgKi9cbmZ1bmN0aW9uIGlzUXVhbnRpZmllZCh2OiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ3N0cmluZycgJiYgL15cXGQrKFxcLlxcZCspPyQvLnRlc3Qodi50cmltKCkpO1xufVxuXG4vKiogXHU2ODIxXHU5QThDXHU1RTc2XHU4ODY1XHU5RjUwXHU1MzU1XHU0RTJBXHU1QjUwXHU5ODc5ICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVTdWJJdGVtKHJhdzogdW5rbm93biwgaWR4OiBudW1iZXIpOiBHb2FsU3ViSXRlbSB7XG4gIGNvbnN0IGl0ID0gKHJhdyAmJiB0eXBlb2YgcmF3ID09PSAnb2JqZWN0JyA/IHJhdyA6IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBzdHIoaXQubmFtZSkgfHwgYFx1NUI1MFx1OTg3OSR7aWR4ICsgMX1gLFxuICAgIHBlcmNlbnQ6IHR5cGVvZiBpdC5wZXJjZW50ID09PSAnbnVtYmVyJyA/IGl0LnBlcmNlbnQgOiB1bmRlZmluZWQsXG4gICAgZGV0YWlsOiBzdHIoaXQuZGV0YWlsKSB8fCB1bmRlZmluZWQsXG4gICAgc3RhcnREYXRlOiBzdHIoaXQuc3RhcnREYXRlKSxcbiAgICBlbmREYXRlOiBzdHIoaXQuZW5kRGF0ZSksXG4gICAgc3RhcnRWYWx1ZTogc3RyKGl0LnN0YXJ0VmFsdWUpLFxuICAgIHRhcmdldFZhbHVlOiBzdHIoaXQudGFyZ2V0VmFsdWUpLFxuICAgIGN1cnJlbnRWYWx1ZTogc3RyKGl0LmN1cnJlbnRWYWx1ZSksXG4gICAgZGFpbHlNaW46IGNsZWFuRGFpbHlNaW4oaXQuZGFpbHlNaW4pLFxuICAgIHRhc2tEYXlUeXBlOiBzdHIoaXQudGFza0RheVR5cGUpIHx8IERFRkFVTFRfVEFTS19EQVlfVFlQRSxcbiAgICBzb3VyY2VSZWY6IHN0cihpdC5zb3VyY2VSZWYpIHx8IHVuZGVmaW5lZCxcbiAgfTtcbn1cblxuLyoqIFx1NjgyMVx1OUE4Q1x1NUU3Nlx1ODg2NVx1OUY1MFx1NTM1NVx1NEUyQVx1NzZFRVx1NjgwN1x1RkYwOFx1NEUyMlx1NjcyQVx1NzdFNVx1NUI1N1x1NkJCNVx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplR29hbChyYXc6IHVua25vd24pOiBHb2FsSXRlbSB7XG4gIGNvbnN0IGcgPSAocmF3ICYmIHR5cGVvZiByYXcgPT09ICdvYmplY3QnID8gcmF3IDoge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCBjYXRlZ29yeVJhdyA9IHN0cihnLmNhdGVnb3J5KTtcbiAgY29uc3QgY2F0ZWdvcnk6IEdvYWxDYXRlZ29yeSB8IHN0cmluZyA9IENBVEVHT1JZX1NFVC5oYXMoY2F0ZWdvcnlSYXcpID8gY2F0ZWdvcnlSYXcgOiAnb3RoZXInO1xuXG4gIGNvbnN0IGl0ZW1zUmF3ID0gQXJyYXkuaXNBcnJheShnLml0ZW1zKSA/IGcuaXRlbXMgOiBbXTtcbiAgY29uc3QgaXRlbXMgPSBpdGVtc1Jhdy5tYXAoKGl0LCBpKSA9PiBzYW5pdGl6ZVN1Ykl0ZW0oaXQsIGkpKTtcblxuICByZXR1cm4ge1xuICAgIGlkOiBzdHIoZy5pZCkgfHwgYGdvYWxfJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA4KX1gLFxuICAgIHRpdGxlOiBzdHIoZy50aXRsZSkgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1NzZFRVx1NjgwNycsXG4gICAgLy8gQUkgXHU1RjUyXHU3RUIzXHU1MjA2XHU2NzkwXHVGRjA4XHU0RUM1XHU1QzU1XHU3OTNBXHU3NTI4XHVGRjA5XHVGRjFBXHU0RkREXHU3NTU5XHU3NTI4XHU2MjM3XHU4RjkzXHU1MTY1XHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXCJcdTRFMjJcdTY3MkFcdTc3RTVcdTVCNTdcdTZCQjVcIlx1OTc1OVx1OUVEOFx1NEUyMlx1NUYwM1xuICAgIGFuYWx5c2lzOiBzdHIoZy5hbmFseXNpcykgfHwgdW5kZWZpbmVkLFxuICAgIC8vIFx1NEUyNVx1NjgzQ1x1Nzk4MVx1NkI2MiBBSSBcdTUxOTlcdTUxNjUgaWNvbiBcdTVCNTdcdTZCQjVcdUZGMDhpY29uIFx1NEVDNVx1NEY5Qlx1NjI0Qlx1NTJBOFx1NTIxQlx1NUVGQVx1NzY4NFx1NzZFRVx1NjgwN1x1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIG1ldGE6IHN0cihnLm1ldGEpIHx8IHVuZGVmaW5lZCxcbiAgICBjYXRlZ29yeSxcbiAgICBzdGFydERhdGU6IHN0cihnLnN0YXJ0RGF0ZSksXG4gICAgZW5kRGF0ZTogc3RyKGcuZW5kRGF0ZSksXG4gICAgcHJvZ3Jlc3M6IG51bShnLnByb2dyZXNzLCAwKSxcbiAgICBwcmlvcml0eTogdHlwZW9mIGcucHJpb3JpdHkgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBnLnByaW9yaXR5ID09PSAnbnVtYmVyJyA/IGcucHJpb3JpdHkgOiB1bmRlZmluZWQsXG4gICAgaXRlbXMsXG4gICAgc291cmNlUmVmOiBzdHIoZy5zb3VyY2VSZWYpIHx8IHVuZGVmaW5lZCxcbiAgfTtcbn1cblxuLyoqIFx1NjU3MFx1N0VDNFx1NUI4OFx1NTM2QiArIFx1OTAxMFx1Njc2MSBzYW5pdGl6ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlR29hbHMocmF3OiB1bmtub3duKTogR29hbEl0ZW1bXSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gW107XG4gIHJldHVybiByYXcubWFwKChnKSA9PiBzYW5pdGl6ZUdvYWwoZykpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBsZXRlbmVzc1Jlc3VsdCB7XG4gIGxldmVsOiAnY29tcGxldGUnIHwgJ3RoaW4nO1xuICAvKiogXHU3RjNBXHU1OTMxXHU3RUY0XHU1RUE2XHU3Njg0XHU0RUJBXHU3QzdCXHU1M0VGXHU4QkZCXHU2ODA3XHU3QjdFXHVGRjFBJ1x1NkJDRlx1NjVFNVx1OTFDRicgLyAnXHU2MjJBXHU2QjYyXHU2NUU1JyAvICdcdTUyMDZcdTdDN0InIC8gJ1x1ODI4Mlx1NTk0RicgKi9cbiAgbWlzc2luZzogc3RyaW5nW107XG59XG5cbi8qKlxuICogXHU1MjI0XHU1QjlBXHU3NkVFXHU2ODA3XHU0RkUxXHU2MDZGXHU1QjhDXHU2NTc0XHU1RUE2XHUzMDAyXG4gKlxuICogXHU0RUE3XHU1NEMxXHU1NEYyXHU1QjY2XHVGRjFBXHU3NkVFXHU2ODA3XHU1RkM1XHU5ODdCXHUzMDBDXHU5MUNGXHU1MzE2XHUzMDBEXHVGRjBDXHU5ODk3XHU3QzkyXHU1RUE2XHU0RTNBXHUzMDBDXHU2NUU1XHUzMDBEXHUzMDAyXHU1NkUwXHU2QjY0XHU2QkNGXHU2NUU1XHU5MUNGXHU3Njg0XHU1MjI0XHU2MzZFXHU2NjJGXG4gKiAqKlx1NjI0MFx1NjcwOVx1NUI1MFx1OTg3OVx1OTBGRFx1NUZDNVx1OTg3Qlx1NjcwOVx1N0VBRlx1NjU3MFx1NUI1NyBkYWlseU1pbioqXHVGRjA4XHU4MDBDXHU5NzVFXCJcdTgxRjNcdTVDMTFcdTRFMDBcdTRFMkFcIlx1RkYwOVx1RkYwQ1x1NTQyNlx1NTIxOVx1OEJFNVx1NUI1MFx1OTg3OVxuICogXHU2NUUwXHU2Q0Q1XHU3NTFGXHU2MjEwXHU0RUNBXHU2NUU1XHU0RUZCXHU1MkExXHVGRjBDXHU4OUM0XHU1MjEyXHU1MzczXHU1OTMxXHU1M0JCXHU2ODM4XHU1RkMzXHU0RUY3XHU1MDNDXHUzMDAyXG4gKlxuICogXHU3RjNBXHU1OTMxXHU3RUY0XHU1RUE2XHVGRjFBXG4gKiAgLSBcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdUZGMUFcdTVCNThcdTU3MjhcdTY3MkFcdTkxQ0ZcdTUzMTZcdUZGMDhcdTk3NUVcdTdFQUZcdTY1NzBcdTVCNTdcdUZGMDlcdTVCNTBcdTk4NzkgXHUyMTkyIGBcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdUZGMDhOIFx1NEUyQVx1NUI1MFx1OTg3OVx1NjcyQVx1OTFDRlx1NTMxNlx1RkYwOWBcbiAqICAtIFx1NjIyQVx1NkI2Mlx1NjVFNVx1RkYxQWVuZERhdGUgXHU3QTdBXG4gKiAgLSBcdTUyMDZcdTdDN0JcdUZGMUFjYXRlZ29yeSBcdTdBN0FcbiAqICAtIFx1ODI4Mlx1NTk0Rlx1RkYxQVx1NUI1OFx1NTcyOCB0YXNrRGF5VHlwZSBcdTdBN0FcdTc2ODRcdTVCNTBcdTk4NzlcbiAqIFx1NEVGQlx1NEUwMFx1N0YzQVx1NTkzMVx1NTM3MyB0aGluXHVGRjA4XHU5NzAwXHU1NzI4XHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3XHU4ODY1XHU1MTY4XHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeUNvbXBsZXRlbmVzcyhnb2FsOiBHb2FsSXRlbSk6IENvbXBsZXRlbmVzc1Jlc3VsdCB7XG4gIGNvbnN0IG1pc3Npbmc6IHN0cmluZ1tdID0gW107XG5cbiAgaWYgKCFnb2FsLmNhdGVnb3J5KSBtaXNzaW5nLnB1c2goJ1x1NTIwNlx1N0M3QicpO1xuXG4gIGlmICghZ29hbC5lbmREYXRlIHx8IGdvYWwuZW5kRGF0ZS50cmltKCkgPT09ICcnKSBtaXNzaW5nLnB1c2goJ1x1NjIyQVx1NkI2Mlx1NjVFNScpO1xuXG4gIGNvbnN0IGl0ZW1zID0gZ29hbC5pdGVtcyA/PyBbXTtcbiAgaWYgKGl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB1bnF1YW50aWZpZWQgPSBpdGVtcy5maWx0ZXIoKGl0KSA9PiAhaXNRdWFudGlmaWVkKGl0LmRhaWx5TWluKSkubGVuZ3RoO1xuICAgIGlmICh1bnF1YW50aWZpZWQgPiAwKSBtaXNzaW5nLnB1c2goYFx1NkJDRlx1NjVFNVx1OTFDRlx1RkYwOCR7dW5xdWFudGlmaWVkfSBcdTRFMkFcdTVCNTBcdTk4NzlcdTY3MkFcdTkxQ0ZcdTUzMTZcdUZGMDlgKTtcblxuICAgIGNvbnN0IGhhc1JoeXRobSA9IGl0ZW1zLmV2ZXJ5KChpdCkgPT4gaXQudGFza0RheVR5cGUgJiYgU3RyaW5nKGl0LnRhc2tEYXlUeXBlKS50cmltKCkgIT09ICcnKTtcbiAgICBpZiAoIWhhc1JoeXRobSkgbWlzc2luZy5wdXNoKCdcdTgyODJcdTU5NEYnKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGV2ZWw6IG1pc3NpbmcubGVuZ3RoID4gMCA/ICd0aGluJyA6ICdjb21wbGV0ZScsXG4gICAgbWlzc2luZyxcbiAgfTtcbn1cbiIsICIvKipcbiAqIFx1Nzg2RVx1NUI5QVx1NjAyN1x1NzZFRVx1NjgwNyBJRCBcdTZEM0VcdTc1MUZcdUZGMDhcdTdFQUZcdTUxRkRcdTY1NzBcdTMwMDFcdTk2RjZcdTRGOURcdThENTZcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdUZGMDlcdTMwMDJcbiAqXG4gKiBcdTc1MjhcdTdBMzNcdTVCOUFcdTU0QzhcdTVFMENcdUZGMDhGTlYtMWEgMzIgXHU0RjREXHVGRjA5XHU0RUNFIHNlZWQgXHU3NTFGXHU2MjEwIGlkXHUzMDAyXG4gKiBcdTc2RUVcdTc2ODRcdUZGMUFcdTU0MENcdTRFMDBcdTdCMTRcdThCQjAgKyBcdTU0MENcdTRFMDBcdTY4MDdcdTk4OThcdTkxQ0RcdTY1QjBcdTg5QzRcdTUyMTJcdTY1RjZcdUZGMENJRCBcdTdBMzNcdTVCOUFcdTRFMERcdTUzRDhcdUZGMUJ3cml0ZUFpR29hbHMgXHU2MzA5IGlkIFx1NTQwOFx1NUU3Nlx1NTM3M1x1MjAxQ1x1NTM5Rlx1NTczMFx1NjZGNFx1NjVCMFx1MjAxRFxuICogXHU4MDBDXHU5NzVFXHUyMDFDXHU4RkZEXHU1MkEwXHU5MUNEXHU1OTBEXHUyMDFEXHVGRjBDXHU2ODM5XHU2Q0JCXHUzMDBDXHU5MUNEXHU1OTBEXHU4OUM0XHU1MjEyIFx1MjE5MiBcdTc2RUVcdTY4MDdcdThEOEFcdTc5RUZcdThEOEFcdTU5MUFcdTMwMERcdTMwMDJcbiAqL1xuXG4vKiogRk5WLTFhIDMyIFx1NEY0RFx1NTRDOFx1NUUwQ1x1RkYwQ1x1OEZENFx1NTZERVx1NjVFMFx1N0IyNlx1NTNGNyAxNiBcdThGREJcdTUyMzZcdTc3RURcdTRFMzIgKi9cbmZ1bmN0aW9uIGZudjFhKHNlZWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBoID0gMHg4MTFjOWRjNTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWVkLmxlbmd0aDsgaSsrKSB7XG4gICAgaCBePSBzZWVkLmNoYXJDb2RlQXQoaSk7XG4gICAgaCA9IE1hdGguaW11bChoLCAweDAxMDAwMTkzKTtcbiAgfVxuICByZXR1cm4gKGggPj4+IDApLnRvU3RyaW5nKDM2KTtcbn1cblxuLyoqXG4gKiBcdTRFQ0Ugc2VlZFx1RkYwOFx1NUVGQVx1OEJBRSBgZmlsZS5wYXRoICsgJ3wnICsgdGl0bGVgXHVGRjA5XHU2RDNFXHU3NTFGXHU3QTMzXHU1QjlBXHU3Njg0XHU3NkVFXHU2ODA3IGlkXHUzMDAyXG4gKiBcdTc2RjhcdTU0MEMgc2VlZCBcdTVGQzVcdTVGOTdcdTc2RjhcdTU0MEMgaWRcdUZGMUJcdTRFMERcdTU0MEMgc2VlZCBcdTY3ODFcdTVDMEZcdTY5ODJcdTczODdcdTc4QjBcdTY0OUVcdUZGMDgzMiBcdTRGNERcdTU0QzhcdTVFMENcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZVN0YWJsZUdvYWxJZChzZWVkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYGdvYWxfJHtmbnYxYShzZWVkKX1gO1xufVxuIiwgIi8qKlxuICogQUkgXHU4OUM0XHU1MjEyXHU1RTQyXHU3QjQ5XHU1MjI0XHU1QjlBXHVGRjA4XHU3RUFGXHU1MUZEXHU2NTcwXHUzMDAxXHU5NkY2XHU0RjlEXHU4RDU2XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHVGRjA5XHUzMDAyXG4gKlxuICogXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwICsgXHU3NkY4XHU1NDBDXHU1MTg1XHU1QkI5XHU1REYyXHU4OUM0XHU1MjEyXHU4RkM3XHVGRjBDXHU0RTE0XHU0RUM1XHU1RjUzXHU5MEEzXHU0RTlCXHU3NkVFXHU2ODA3XHUzMDBDXHU0RUNEXHU1MTY4XHU5MEU4XHU1QjU4XHU1NzI4XHU0RThFXHU3NkVFXHU2ODA3XHU1RTkzXHUzMDBEXHU2NUY2XHU2MjREXHU1M0VGXHU4REYzXHU4RkM3XHVGRjFCXG4gKiBcdTUzRUFcdTg5ODFcdTY3MDlcdTRFMDBcdTRFMkFcdTc2RUVcdTY4MDdcdTVERjJcdTRFMjJcdTU5MzFcdUZGMDhcdTg4QUJcdTZFMDUvXHU4OEFCXHU1MjIwXHVGRjA5XHVGRjBDXHU1QzMxXHU1MTQxXHU4QkI4XHU5MUNEXHU2NUIwXHU1MTk5XHU1MTY1XHU0RUU1XHU2MDYyXHU1OTBEXHUyMDE0XHUyMDE0XG4gKiBcdTU0MjZcdTUyMTlcdTIwMUNcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdTIwMURcdTRGMUFcdTZDMzhcdTRFNDVcdTk2M0JcdTU4NUVcdTYwNjJcdTU5MERcdUZGMENcdTg4NjhcdTczQjBcdTRFM0FcdTMwMENcdTUxOTlcdTUxNjVcdTRFODZcdTRGNDZcdTRFMERcdTY2M0VcdTc5M0EvXHU0RTIyXHU1OTMxXHUzMDBEXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRTa2lwUGxhbm5lZChcbiAgcGxhbm5lZElkczogc3RyaW5nW10gfCB1bmRlZmluZWQsXG4gIGV4aXN0aW5nSWRzOiBTZXQ8c3RyaW5nPlxuKTogYm9vbGVhbiB7XG4gIGlmICghcGxhbm5lZElkcyB8fCBwbGFubmVkSWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gcGxhbm5lZElkcy5ldmVyeSgoaWQpID0+IGV4aXN0aW5nSWRzLmhhcyhpZCkpO1xufVxuIiwgIi8qKlxuICogQWdlbnRpY1BsYW5Nb2RhbCBcdTIwMTQgXHU1QkY5XHU4QkREXHU1RjBGXHU4OUM0XHU1MjEyXHU1QkExXHU5NjA1XHU1M0YwXHVGRjA4UGhhc2UgNFx1RkYwOVxuICpcbiAqIFx1NTcyOCBQaGFzZTMgUGxhbkNvbmZpcm1Nb2RhbCBcdTc2ODRcdTY4MTFcdTcyQjZcdTVCQTFcdTk2MDVcdTU3RkFcdTc4NDBcdTRFMEFcdUZGMENcdTUzRjNcdTRGQTdcdTUyQTBcdTRFMDBcdTRFMkFcdTVCRjlcdThCRERcdTUzM0FcdUZGMUFcbiAqICAtIFx1NURFNlx1RkYxQVx1NTNFRlx1N0YxNlx1OEY5MVx1NzZFRVx1NjgwN1x1NjgxMVx1RkYwOFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwOVx1RkYwQ0FJIFx1NkJDRlx1OEY2RVx1OEZENFx1NTZERVx1NTE2OFx1OTFDRiBnb2FscyBcdTU0MEVcdTVCOUVcdTY1RjZcdTUyMzdcdTY1QjAgKyBkaWZmIFx1OUFEOFx1NEVBRVx1RkYxQlxuICogIC0gXHU1M0YzXHVGRjFBXHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU1QkY5XHU4QkREXHVGRjBDXHU3NTI4XHU2MjM3XHU4QkY0XCJcdTUzQkJcdTYzODlYIC8gXHU1MkEwWSAvIFx1NjI4QVpcdTY1MzlcdTYyMTBcdTRFMDBcdTRFMDlcdTRFOTRcIlx1RkYwQ0FJIFx1NjI1M1x1NzhFOFx1ODlDNFx1NTIxMlx1RkYxQlxuICogIC0gXHU2MjRCXHU1MkE4XHU3RjE2XHU4RjkxXHU3NkY0XHU2M0E1XHU0RjVDXHU3NTI4XHU1MjMwXHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjBDXHU1RTc2XHU5MDFBXHU4RkM3IHNlc3Npb24uYXBwbHlMb2NhbEVkaXQgXHU1MTk5XHU1MTY1XHU1QkY5XHU4QkREXHU1Mzg2XHU1M0YyXHVGRjBDXG4gKiAgICBcdTk2MzJcdTZCNjIgQUkgXHU0RTBCXHU4RjZFXHU2MjhBXHU3NTI4XHU2MjM3XHU2MjRCXHU1MkE4XHU2NTM5XHU1MkE4XHU4OTg2XHU3NkQ2XHU1NkRFXHU1M0JCXHVGRjFCXG4gKiAgLSBcdTk4NzZcdTkwRThcdTMwMENcdTkxQ0RcdTdGNkVcdTUyMURcdTcyNDhcdTMwMERcdTU2REVcdTUyMzAgQUkgXHU5OTk2XHU3MjQ4XHVGRjFCXHU1RTk1XHU5MEU4XHUzMDBDXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3XHUzMDBEXHU3ODZFXHU4QkE0XHU4NDNEXHU1RTkzXHUzMDAyXG4gKlxuICogXHU2MzAxXHU2NzA5IFBsYW5uaW5nU2Vzc2lvblx1RkYwOFx1N0VBRlx1OTAzQlx1OEY5MVx1MzAwMVx1OTZGNiBPYnNpZGlhbiBcdTRGOURcdThENTZcdUZGMDlcdUZGMENcdTgxRUFcdThFQUJcdTUzRUFcdThEMUZcdThEMjMgVUkgXHU3RjE2XHU2MzkyXHUzMDAyXG4gKi9cblxuaW1wb3J0IHsgTW9kYWwsIEFwcCwgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHtcbiAgR09BTF9DQVRFR09SSUVTLFxuICB0eXBlIEdvYWxJdGVtLFxuICB0eXBlIEdvYWxTdWJJdGVtLFxuICB0eXBlIEdvYWxDYXRlZ29yeSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5pbXBvcnQgeyBjbGFzc2lmeUNvbXBsZXRlbmVzcywgZXh0cmFjdFVuaXQgfSBmcm9tICcuL0dvYWxDYXJkVmFsaWRhdG9yJztcbmltcG9ydCB7IFBsYW5uaW5nU2Vzc2lvbiB9IGZyb20gJy4vUGxhbm5pbmdTZXNzaW9uJztcbmltcG9ydCB0eXBlIHsgUGxhbm5lclNldHRpbmdzIH0gZnJvbSAnLi9NYXJrZG93blBsYW5uZXInO1xuXG5pbnRlcmZhY2UgSXRlbUVudHJ5IHtcbiAgaXRlbTogR29hbFN1Ykl0ZW07XG4gIGtlZXA6IGJvb2xlYW47XG59XG5pbnRlcmZhY2UgR29hbEVudHJ5IHtcbiAgZ29hbDogR29hbEl0ZW07XG4gIGl0ZW1zOiBJdGVtRW50cnlbXTtcbiAga2VlcDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBZ2VudGljUGxhbk9wdGlvbnMge1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHNjb3BlOiAnbm90ZScgfCAnc2VsZWN0aW9uJztcbiAgc2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncztcbiAgc3VidGl0bGU/OiBzdHJpbmc7XG4gIG9uQ29uZmlybTogKGdvYWxzOiBHb2FsSXRlbVtdKSA9PiB2b2lkO1xuICAvKiogXHU2M0QwXHU0RjlCXHU2NUY2XHVGRjFBXHU0RUU1XHUzMDBDXHU3RjE2XHU4RjkxXHU3M0IwXHU2NzA5XHU2ODExXHUzMDBEXHU2QTIxXHU1RjBGXHU2MjUzXHU1RjAwXHVGRjA4XHU4RDcwIHNlc3Npb24ubG9hZEdvYWxzIFx1ODAwQ1x1OTc1RSBpbml0XHVGRjA5ICovXG4gIGdvYWxzPzogR29hbEl0ZW1bXTtcbiAgLyoqIFx1OEY3RFx1NTE2NVx1NTQwRVx1ODFFQVx1NTJBOFx1NEY1Q1x1NEUzQVx1NjMwN1x1NEVFNFx1NTNEMVx1OTAwMVx1N0VEOSBBSVx1RkYwOFx1NzUyOFx1NEU4RVx1MzAwQ1x1NUU5NFx1NzUyOFx1OEJDQVx1NjVBRFx1NUVGQVx1OEJBRVx1MzAwRFx1OTg4NFx1NTg2Qlx1RkYwOSAqL1xuICBpbml0aWFsSW5zdHJ1Y3Rpb24/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBBZ2VudGljUGxhbk1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHNlc3Npb246IFBsYW5uaW5nU2Vzc2lvbjtcbiAgcHJpdmF0ZSBlbnRyaWVzOiBHb2FsRW50cnlbXSA9IFtdO1xuICBwcml2YXRlIHN1YnRpdGxlPzogc3RyaW5nO1xuICBwcml2YXRlIG9uQ29uZmlybTogKGdvYWxzOiBHb2FsSXRlbVtdKSA9PiB2b2lkO1xuICBwcml2YXRlIG9wdHM6IEFnZW50aWNQbGFuT3B0aW9ucztcblxuICBwcml2YXRlIGxpc3RFbD86IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGNoYXRMb2dFbD86IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGlucHV0RWw/OiBIVE1MVGV4dEFyZWFFbGVtZW50O1xuICBwcml2YXRlIHNlbmRCdG4/OiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgcHJpdmF0ZSBmb290ZXJDb3VudD86IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGNoYXRMb2c6IEFycmF5PHsgcm9sZTogJ3VzZXInIHwgJ2Fzc2lzdGFudCc7IHRleHQ6IHN0cmluZyB9PiA9IFtdO1xuICBwcml2YXRlIHByZXZHb2FsVGl0bGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIHByaXZhdGUgcHJldkl0ZW1LZXlzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIG9wdHM6IEFnZW50aWNQbGFuT3B0aW9ucykge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5zdWJ0aXRsZSA9IG9wdHMuc3VidGl0bGU7XG4gICAgdGhpcy5vbkNvbmZpcm0gPSBvcHRzLm9uQ29uZmlybTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMuc2Vzc2lvbiA9IG5ldyBQbGFubmluZ1Nlc3Npb24ob3B0cy5jb250ZW50LCBvcHRzLnNldHRpbmdzLCB1bmRlZmluZWQsIG9wdHMuc2NvcGUpO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIGNvbnRlbnRFbC5hZGRDbGFzcygnYmFtYm9vLWFpLXBsYW4tbW9kYWwnLCAnYmFtYm9vLWFpLWFnZW50aWMnKTtcblxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdBSSBcdTg5QzRcdTUyMTJcdTUyQTlcdTYyNEIgXHUwMEI3IFx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1NUJBMVx1OTYwNScgfSk7XG5cbiAgICAvLyBcdTk4NzZcdTkwRThcdTY0Q0RcdTRGNUNcdUZGMUFcdTkxQ0RcdTdGNkVcdTUyMURcdTcyNDhcbiAgICBjb25zdCB0b3BCYXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLWFnZW50aWMtdG9wYmFyJyB9KTtcbiAgICBpZiAodGhpcy5zdWJ0aXRsZSkge1xuICAgICAgdG9wQmFyLmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiB0aGlzLnN1YnRpdGxlLCBjbHM6ICdiYW1ib28tYWktcGxhbi1zdWJ0aXRsZScgfSk7XG4gICAgfVxuICAgIGNvbnN0IHJlc2V0QnRuID0gdG9wQmFyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHUyMUJBIFx1OTFDRFx1N0Y2RVx1NTIxRFx1NzI0OCcsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1idG4gYmFtYm9vLWFpLXBsYW4tYnRuLWdob3N0JyxcbiAgICB9KTtcbiAgICByZXNldEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMub25SZXNldCgpKTtcblxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdcdTVERTZcdTRGQTdcdTY4MzhcdTVCRjkvXHU3RjE2XHU4RjkxXHU3NkVFXHU2ODA3XHVGRjBDXHU1M0YzXHU0RkE3XHU3NTI4XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU4QkE5IEFJIFx1NTg5RVx1NTIyMFx1NjUzOVx1RkYwOFx1NTk4MlwiXHU1M0JCXHU2Mzg5XHU4REQxXHU2QjY1XCJcIlx1NTJBMFx1NkJDRlx1NTQ2OFx1NkUzOFx1NkNGMzNcdTZCMjFcIlx1RkYwOVx1MzAwMlx1Nzg2RVx1OEJBNFx1NTQwRVx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1NUU5M1x1MzAwMicsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1kZXNjJyxcbiAgICB9KTtcblxuICAgIC8vIFx1NEUzQlx1NEY1M1x1RkYxQVx1NURFNlx1NjgxMSArIFx1NTNGM1x1NUJGOVx1OEJERFxuICAgIGNvbnN0IGJvZHkgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLWFnZW50aWMtYm9keScgfSk7XG5cbiAgICBjb25zdCBsZWZ0ID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktYWdlbnRpYy1sZWZ0JyB9KTtcbiAgICB0aGlzLmxpc3RFbCA9IGxlZnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tbGlzdCcgfSk7XG5cbiAgICBjb25zdCByaWdodCA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLWFnZW50aWMtcmlnaHQnIH0pO1xuICAgIHRoaXMuY2hhdExvZ0VsID0gcmlnaHQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLWNoYXQnIH0pO1xuICAgIGNvbnN0IGNvbXBvc2VyID0gcmlnaHQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLWNoYXQtY29tcG9zZXInIH0pO1xuICAgIHRoaXMuaW5wdXRFbCA9IGNvbXBvc2VyLmNyZWF0ZUVsKCd0ZXh0YXJlYScsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1jaGF0LWlucHV0JyxcbiAgICAgIGF0dHI6IHsgcGxhY2Vob2xkZXI6ICdcdThCRjRcdTcwQjlcdTRFQzBcdTRFNDhcdUZGMENcdTU5ODJcIlx1NjI4QVx1OEREMVx1NkI2NVx1NTNCQlx1NjM4OVx1RkYwQ1x1NjM2Mlx1NjIxMFx1NkUzOFx1NkNGM1wiXHUyMDI2Jywgcm93czogJzInIH0sXG4gICAgfSk7XG4gICAgdGhpcy5zZW5kQnRuID0gY29tcG9zZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICdcdTUzRDFcdTkwMDEnLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYnRuIGJhbWJvby1haS1wbGFuLWJ0bi1wcmltYXJ5JyxcbiAgICB9KTtcbiAgICB0aGlzLnNlbmRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB2b2lkIHRoaXMub25TZW5kKCkpO1xuICAgIHRoaXMuaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyAmJiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSkpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2b2lkIHRoaXMub25TZW5kKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBcdTVFOTVcdTkwRThcbiAgICBjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZm9vdGVyJyB9KTtcbiAgICBmb290ZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICdcdTUzRDZcdTZEODgnLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYnRuIGJhbWJvby1haS1wbGFuLWJ0bi1naG9zdCcsXG4gICAgfSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgIGNvbnN0IHdyaXRlQnRuID0gZm9vdGVyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3JyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWJ0biBiYW1ib28tYWktcGxhbi1idG4tcHJpbWFyeScsXG4gICAgfSk7XG4gICAgd3JpdGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNvbmZpcm0oKSk7XG4gICAgdGhpcy5mb290ZXJDb3VudCA9IHdyaXRlQnRuO1xuXG4gICAgLy8gXHU1RjAyXHU2QjY1XHU2MkM5XHU5OTk2XHU3MjQ4XG4gICAgdm9pZCB0aGlzLmluaXRQbGFuKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXRQbGFuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1N0YxNlx1OEY5MVx1NzNCMFx1NjcwOVx1NjgxMVx1NkEyMVx1NUYwRlx1RkYxQVx1OEY3RFx1NTE2NVx1NzcxRlx1NUI5RVx1NzZFRVx1NjgwN1x1NjgxMVx1RkYwQ1x1NEUwRFx1OEMwMyBBSSBcdTYyQzZcdTg5RTNcbiAgICBpZiAodGhpcy5vcHRzLmdvYWxzKSB7XG4gICAgICB0aGlzLnNlc3Npb24ubG9hZEdvYWxzKHRoaXMub3B0cy5nb2Fscyk7XG4gICAgICB0aGlzLmNoYXRMb2cgPSBbeyByb2xlOiAnYXNzaXN0YW50JywgdGV4dDogJ1x1NURGMlx1OEY3RFx1NTE2NVx1NEY2MFx1NzY4NFx1NzNCMFx1NjcwOVx1NzZFRVx1NjgwN1x1NjgxMVx1RkYwQ1x1NTNFRlx1NzZGNFx1NjNBNVx1N0YxNlx1OEY5MVx1NjIxNlx1OEJBOVx1NjIxMVx1OEMwM1x1NjU3NFx1MzAwMicgfV07XG4gICAgICB0aGlzLnJlYnVpbGRUcmVlKGZhbHNlKTtcbiAgICAgIHRoaXMucmVuZGVyQ2hhdCgpO1xuICAgICAgaWYgKHRoaXMub3B0cy5pbml0aWFsSW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb24gPSB0aGlzLm9wdHMuaW5pdGlhbEluc3RydWN0aW9uO1xuICAgICAgICB0aGlzLnB1c2hDaGF0KCd1c2VyJywgaW5zdHJ1Y3Rpb24pO1xuICAgICAgICB0aGlzLnNldFNlbmRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyByZXBseSB9ID0gYXdhaXQgdGhpcy5zZXNzaW9uLnNlbmQoaW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIHRoaXMucmVidWlsZFRyZWUodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgcmVwbHkgfHwgJ1x1NURGMlx1NUU5NFx1NzUyOFx1NUVGQVx1OEJBRVx1MzAwMicpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICB0aGlzLnB1c2hDaGF0KCdhc3Npc3RhbnQnLCAnXHUyNkEwIFx1NUU5NFx1NzUyOFx1NUVGQVx1OEJBRVx1NTkzMVx1OEQyNVx1RkYwQ1x1OEJGN1x1NjI0Qlx1NTJBOFx1OEMwM1x1NjU3NFx1MzAwMicpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRoaXMuc2V0U2VuZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hDaGF0KCdhc3Npc3RhbnQnLCAnXHUyM0YzIEFJIFx1ODlDNFx1NTIxMlx1NEUyRFx1MjAyNlx1RkYwOFx1NkI2M1x1NTcyOFx1NjJDNlx1ODlFM1x1NzZFRVx1NjgwN1x1RkYwOScpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBnb2FscyA9IGF3YWl0IHRoaXMuc2Vzc2lvbi5pbml0KCk7XG4gICAgICBpZiAoZ29hbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgICAgJ0FJIFx1NjcyQVx1NEVDRVx1N0IxNFx1OEJCMFx1NEUyRFx1OEJDNlx1NTIyQlx1NTFGQVx1NjYwRVx1Nzg2RVx1NzZFRVx1NjgwN1x1MzAwMlxcblx1OEJENVx1OEJENVx1OEZEOVx1NjgzN1x1NzY4NFx1NTNFNVx1NUYwRlx1RkYxQVx1MzAwQ1x1NjIxMVx1NjBGM1x1NTcyOCAzIFx1NEUyQVx1NjcwOFx1NTE4NVx1NTFDRlx1OTFDRCA1a2dcdUZGMENcdTZCQ0ZcdTU5MjlcdThERDFcdTZCNjUgMzAgXHU1MjA2XHU5NDlGXHUzMDAxXHU2M0E3XHU1MjM2XHU5OTZFXHU5OERGXHUzMDBEXHUzMDAyJ1xuICAgICAgICApO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hhdExvZyA9IFt7IHJvbGU6ICdhc3Npc3RhbnQnLCB0ZXh0OiBgXHU1REYyXHU0RUNFXHU3QjE0XHU4QkIwXHU4QkM2XHU1MjJCXHU1MUZBICR7Z29hbHMubGVuZ3RofSBcdTRFMkFcdTc2RUVcdTY4MDdcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTdGMTZcdThGOTFcdTYyMTZcdThCQTlcdTYyMTFcdThDMDNcdTY1NzRcdTMwMDJgIH1dO1xuICAgICAgdGhpcy5yZWJ1aWxkVHJlZShmYWxzZSk7XG4gICAgICB0aGlzLnJlbmRlckNoYXQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBuZXcgTm90aWNlKGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdBSSBcdTg5QzRcdTUyMTJcdTU5MzFcdThEMjUnKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG9uU2VuZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuaW5wdXRFbDtcbiAgICBjb25zdCB0ZXh0ID0gaW5wdXQ/LnZhbHVlLnRyaW0oKTtcbiAgICBpZiAoIXRleHQgfHwgIXRoaXMuc2VuZEJ0biB8fCAhaW5wdXQpIHJldHVybjtcbiAgICBpbnB1dC52YWx1ZSA9ICcnO1xuICAgIHRoaXMucHVzaENoYXQoJ3VzZXInLCB0ZXh0KTtcbiAgICB0aGlzLnNldFNlbmRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgcmVwbHksIGdvYWxzIH0gPSBhd2FpdCB0aGlzLnNlc3Npb24uc2VuZCh0ZXh0KTtcbiAgICAgIHRoaXMucmVidWlsZFRyZWUodHJ1ZSk7XG4gICAgICB0aGlzLnB1c2hDaGF0KCdhc3Npc3RhbnQnLCByZXBseSB8fCAnXHU1REYyXHU2NkY0XHU2NUIwXHU4OUM0XHU1MjEyXHUzMDAyJyk7XG4gICAgICB2b2lkIGdvYWxzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgJ1x1MjZBMCBcdTZDQTFcdTU0MkNcdTYxQzJcdUZGMENcdTYzNjJcdTRFMkFcdThCRjRcdTZDRDVcdThCRDVcdThCRDVcdUZGMDhcdTVGNTNcdTUyNERcdTg5QzRcdTUyMTJcdTY3MkFcdTY1MzlcdTUyQThcdUZGMDlcdTMwMDInKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5zZXRTZW5kaW5nKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5zZXNzaW9uLnJlc2V0KCk7XG4gICAgdGhpcy5yZWJ1aWxkVHJlZShmYWxzZSk7XG4gICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgJ1x1MjFCQSBcdTVERjJcdTkxQ0RcdTdGNkVcdTRFM0EgQUkgXHU1MjFEXHU3MjQ4XHUzMDAyJyk7XG4gIH1cblxuICBwcml2YXRlIHNldFNlbmRpbmcob246IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zZW5kQnRuKSB0aGlzLnNlbmRCdG4uZGlzYWJsZWQgPSBvbjtcbiAgICBpZiAodGhpcy5pbnB1dEVsKSB0aGlzLmlucHV0RWwuZGlzYWJsZWQgPSBvbjtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaENoYXQocm9sZTogJ3VzZXInIHwgJ2Fzc2lzdGFudCcsIHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY2hhdExvZy5wdXNoKHsgcm9sZSwgdGV4dCB9KTtcbiAgICB0aGlzLnJlbmRlckNoYXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyQ2hhdCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuY2hhdExvZ0VsKSByZXR1cm47XG4gICAgdGhpcy5jaGF0TG9nRWwuZW1wdHkoKTtcbiAgICBmb3IgKGNvbnN0IG0gb2YgdGhpcy5jaGF0TG9nKSB7XG4gICAgICBjb25zdCBidWJibGUgPSB0aGlzLmNoYXRMb2dFbC5jcmVhdGVEaXYoe1xuICAgICAgICBjbHM6IGBiYW1ib28tYWktY2hhdC1idWJibGUgYmFtYm9vLWFpLWNoYXQtJHttLnJvbGV9YCxcbiAgICAgIH0pO1xuICAgICAgYnViYmxlLnNldFRleHQobS50ZXh0KTtcbiAgICAgIHRoaXMuY2hhdExvZ0VsLnNjcm9sbFRvcCA9IHRoaXMuY2hhdExvZ0VsLnNjcm9sbEhlaWdodDtcbiAgICB9XG4gIH1cblxuICAvKiogXHU0RjlEXHU2MzZFIHNlc3Npb24uZ29hbHMgXHU5MUNEXHU1RUZBXHU1REU2XHU2ODExXHVGRjFCaGlnaGxpZ2h0PXRydWUgXHU2NUY2XHU1QkY5XHU2NUIwXHU1MUZBXHU3M0IwXHU3Njg0XHU3NkVFXHU2ODA3L1x1NUI1MFx1OTg3OVx1NjI1M1x1OUFEOFx1NEVBRSAqL1xuICBwcml2YXRlIHJlYnVpbGRUcmVlKGhpZ2hsaWdodDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5saXN0RWwpIHJldHVybjtcbiAgICBjb25zdCBwcmV2R29hbHMgPSB0aGlzLnByZXZHb2FsVGl0bGVzO1xuICAgIGNvbnN0IHByZXZJdGVtcyA9IHRoaXMucHJldkl0ZW1LZXlzO1xuXG4gICAgdGhpcy5lbnRyaWVzID0gdGhpcy5zZXNzaW9uLmdvYWxzLm1hcCgoZ29hbCkgPT4gKHtcbiAgICAgIGdvYWwsXG4gICAgICBrZWVwOiB0cnVlLFxuICAgICAgaXRlbXM6IChnb2FsLml0ZW1zID8/IFtdKS5tYXAoKGl0ZW0pID0+ICh7IGl0ZW0sIGtlZXA6IHRydWUgfSkpLFxuICAgIH0pKTtcblxuICAgIGNvbnN0IGxpc3QgPSB0aGlzLmxpc3RFbDtcbiAgICBsaXN0LmVtcHR5KCk7XG4gICAgdGhpcy5lbnRyaWVzLmZvckVhY2goKGVudHJ5LCBnaSkgPT4ge1xuICAgICAgY29uc3QgaXNOZXdHb2FsID0gaGlnaGxpZ2h0ICYmICFwcmV2R29hbHMuaGFzKGVudHJ5LmdvYWwudGl0bGUpO1xuICAgICAgdGhpcy5yZW5kZXJHb2FsKGxpc3QsIGVudHJ5LCBnaSwgaXNOZXdHb2FsLCBoaWdobGlnaHQsIHByZXZJdGVtcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnByZXZHb2FsVGl0bGVzID0gbmV3IFNldCh0aGlzLnNlc3Npb24uZ29hbHMubWFwKChnKSA9PiBnLnRpdGxlKSk7XG4gICAgdGhpcy5wcmV2SXRlbUtleXMgPSBuZXcgU2V0KFxuICAgICAgdGhpcy5zZXNzaW9uLmdvYWxzLmZsYXRNYXAoKGcpID0+IChnLml0ZW1zID8/IFtdKS5tYXAoKGl0KSA9PiBgJHtnLnRpdGxlfTo6JHtpdC5uYW1lfWApKVxuICAgICk7XG4gICAgdGhpcy51cGRhdGVGb290ZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyR29hbChcbiAgICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICAgIGVudHJ5OiBHb2FsRW50cnksXG4gICAgZ2k6IG51bWJlcixcbiAgICBpc05ld0dvYWw6IGJvb2xlYW4sXG4gICAgaGlnaGxpZ2h0OiBib29sZWFuLFxuICAgIHByZXZJdGVtczogU2V0PHN0cmluZz5cbiAgKTogdm9pZCB7XG4gICAgY29uc3QgY2FyZCA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1nb2FsJyB9KTtcbiAgICBpZiAoaXNOZXdHb2FsKSBjYXJkLmFkZENsYXNzKCdiYW1ib28tYWktcGxhbi1nb2FsLXVwZGF0ZWQnKTtcblxuICAgIGNvbnN0IGhlYWQgPSBjYXJkLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWdvYWwtaGVhZCcgfSk7XG5cbiAgICBjb25zdCB0aXRsZUlucHV0ID0gaGVhZC5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1nb2FsLXRpdGxlJyxcbiAgICAgIGF0dHI6IHsgdmFsdWU6IGVudHJ5LmdvYWwudGl0bGUsIHBsYWNlaG9sZGVyOiAnXHU3NkVFXHU2ODA3XHU2ODA3XHU5ODk4JyB9LFxuICAgIH0pO1xuICAgIHRpdGxlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICBlbnRyeS5nb2FsLnRpdGxlID0gdGl0bGVJbnB1dC52YWx1ZS50cmltKCkgfHwgYFx1NzZFRVx1NjgwNyR7Z2kgKyAxfWA7XG4gICAgfSk7XG4gICAgdGl0bGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NzZFRVx1NjgwN1x1NjUzOVx1NTQwRFx1NEUzQVx1MzAwQyR7ZW50cnkuZ29hbC50aXRsZX1cdTMwMERgKTtcbiAgICB9KTtcblxuICAgIGlmIChlbnRyeS5nb2FsLmFuYWx5c2lzKSB7XG4gICAgICBoZWFkLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6IGBBSSBcdTUyMDZcdTY3OTBcdUZGMUEke2VudHJ5LmdvYWwuYW5hbHlzaXN9YCxcbiAgICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYW5hbHlzaXMnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgY2F0U2VsZWN0ID0gaGVhZC5jcmVhdGVFbCgnc2VsZWN0JywgeyBjbHM6ICdiYW1ib28tYWktcGxhbi1jYXQnIH0pO1xuICAgIEdPQUxfQ0FURUdPUklFUy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBjb25zdCBvcHQgPSBjYXRTZWxlY3QuY3JlYXRlRWwoJ29wdGlvbicsIHsgdGV4dDogYCR7Yy5pY29ufSAke2MubmFtZX1gLCB2YWx1ZTogYy5pZCB9KTtcbiAgICAgIGlmIChjLmlkID09PSBlbnRyeS5nb2FsLmNhdGVnb3J5KSBvcHQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIGNhdFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBlbnRyeS5nb2FsLmNhdGVnb3J5ID0gY2F0U2VsZWN0LnZhbHVlIGFzIEdvYWxDYXRlZ29yeTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU3NkVFXHU2ODA3XHUzMDBDJHtlbnRyeS5nb2FsLnRpdGxlfVx1MzAwRFx1OTg4Nlx1NTdERlx1NjUzOVx1NEUzQSAke2NhdFNlbGVjdC52YWx1ZX1gKTtcbiAgICAgIHRoaXMucmVmcmVzaFRoaW5CYWRnZShjYXJkLCBlbnRyeSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzdGFydFdyYXAgPSBoZWFkLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWRhdGVyYW5nZScgfSk7XG4gICAgY29uc3Qgc3RhcnRJbnB1dCA9IHN0YXJ0V3JhcC5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1kYXRlcmFuZ2UtaW5wdXQnLFxuICAgICAgYXR0cjogeyB0eXBlOiAnZGF0ZScsIHZhbHVlOiBlbnRyeS5nb2FsLnN0YXJ0RGF0ZSA/PyAnJyB9LFxuICAgIH0pO1xuICAgIHN0YXJ0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgZW50cnkuZ29hbC5zdGFydERhdGUgPSBzdGFydElucHV0LnZhbHVlO1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTc2RUVcdTY4MDdcdTMwMEMke2VudHJ5LmdvYWwudGl0bGV9XHUzMDBEXHU1RjAwXHU1OUNCXHU2NUU1XHU2NTM5XHU0RTNBICR7c3RhcnRJbnB1dC52YWx1ZX1gKTtcbiAgICB9KTtcbiAgICBzdGFydFdyYXAuY3JlYXRlU3Bhbih7IHRleHQ6ICdcdTIwMTQnLCBjbHM6ICdiYW1ib28tYWktcGxhbi1kYXRlcmFuZ2Utc2VwJyB9KTtcbiAgICBjb25zdCBlbmRJbnB1dCA9IHN0YXJ0V3JhcC5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1kYXRlcmFuZ2UtaW5wdXQnLFxuICAgICAgYXR0cjogeyB0eXBlOiAnZGF0ZScsIHZhbHVlOiBlbnRyeS5nb2FsLmVuZERhdGUgPz8gJycgfSxcbiAgICB9KTtcbiAgICBlbmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBlbnRyeS5nb2FsLmVuZERhdGUgPSBlbmRJbnB1dC52YWx1ZTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU3NkVFXHU2ODA3XHUzMDBDJHtlbnRyeS5nb2FsLnRpdGxlfVx1MzAwRFx1NjIyQVx1NkI2Mlx1NjVFNVx1NjUzOVx1NEUzQSAke2VuZElucHV0LnZhbHVlfWApO1xuICAgICAgdGhpcy5yZWZyZXNoVGhpbkJhZGdlKGNhcmQsIGVudHJ5KTtcbiAgICB9KTtcblxuICAgIGNhcmQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYmFkZ2UnIH0pO1xuICAgIHRoaXMucmVmcmVzaFRoaW5CYWRnZShjYXJkLCBlbnRyeSk7XG5cbiAgICBjb25zdCBkZWwgPSBoZWFkLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHUyNzE1JyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWRlbCcsXG4gICAgICBhdHRyOiB7IHRpdGxlOiAnXHU1MjIwXHU5NjY0XHU4QkU1XHU3NkVFXHU2ODA3JyB9LFxuICAgIH0pO1xuICAgIGRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGVudHJ5LmtlZXAgPSBmYWxzZTtcbiAgICAgIGNhcmQudG9nZ2xlQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWdvYWwtcmVtb3ZlZCcsIHRydWUpO1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTUyMjBcdTk2NjRcdTRFODZcdTc2RUVcdTY4MDdcdTMwMEMke2VudHJ5LmdvYWwudGl0bGV9XHUzMDBEYCk7XG4gICAgICB0aGlzLnVwZGF0ZUZvb3RlcigpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgaXRlbXNXcmFwID0gY2FyZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtcycgfSk7XG4gICAgKGVudHJ5LmdvYWwuaXRlbXMgPz8gW10pLmZvckVhY2goKF8sIGlpKSA9PiB7XG4gICAgICBjb25zdCBpdGVtRW50cnkgPSBlbnRyeS5pdGVtc1tpaV07XG4gICAgICBpZiAoIWl0ZW1FbnRyeSkgcmV0dXJuO1xuICAgICAgY29uc3QgaXNOZXdJdGVtID0gaGlnaGxpZ2h0ICYmICFwcmV2SXRlbXMuaGFzKGAke2VudHJ5LmdvYWwudGl0bGV9Ojoke2l0ZW1FbnRyeS5pdGVtLm5hbWV9YCk7XG4gICAgICB0aGlzLnJlbmRlckl0ZW0oaXRlbXNXcmFwLCBlbnRyeSwgaXRlbUVudHJ5LCBpaSwgaXNOZXdJdGVtKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVmcmVzaFRoaW5CYWRnZShjYXJkOiBIVE1MRWxlbWVudCwgZW50cnk6IEdvYWxFbnRyeSk6IHZvaWQge1xuICAgIGNvbnN0IGJhZGdlID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuYmFtYm9vLWFpLXBsYW4tYmFkZ2UnKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKCFiYWRnZSkgcmV0dXJuO1xuICAgIGNvbnN0IHsgbGV2ZWwsIG1pc3NpbmcgfSA9IGNsYXNzaWZ5Q29tcGxldGVuZXNzKGVudHJ5LmdvYWwpO1xuICAgIGJhZGdlLmVtcHR5KCk7XG4gICAgaWYgKGxldmVsID09PSAndGhpbicpIHtcbiAgICAgIGJhZGdlLnNldFRleHQoYFx1MjZBMCBcdTVGODVcdTg4NjVcdTU4NkJcdUZGMUEke21pc3Npbmcuam9pbignXHUzMDAxJyl9YCk7XG4gICAgICBiYWRnZS5hZGRDbGFzcygnYmFtYm9vLWFpLXBsYW4tYmFkZ2UtdGhpbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYWRnZS5zZXRUZXh0KCdcdTI3MTMgXHU1REYyXHU5MUNGXHU1MzE2XHVGRjBDXHU1M0VGXHU1MTk5XHU1MTY1Jyk7XG4gICAgICBiYWRnZS5yZW1vdmVDbGFzcygnYmFtYm9vLWFpLXBsYW4tYmFkZ2UtdGhpbicpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVySXRlbShcbiAgICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICAgIGVudHJ5OiBHb2FsRW50cnksXG4gICAgaXRlbUVudHJ5OiBJdGVtRW50cnksXG4gICAgaWk6IG51bWJlcixcbiAgICBpc05ld0l0ZW06IGJvb2xlYW5cbiAgKTogdm9pZCB7XG4gICAgY29uc3Qgcm93ID0gcGFyZW50LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0nIH0pO1xuICAgIGlmIChpc05ld0l0ZW0pIHJvdy5hZGRDbGFzcygnYmFtYm9vLWFpLXBsYW4taXRlbS11cGRhdGVkJyk7XG5cbiAgICBjb25zdCBjYiA9IHJvdy5jcmVhdGVFbCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcsIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tY2InIH0pO1xuICAgIGNiLmNoZWNrZWQgPSBpdGVtRW50cnkua2VlcDtcbiAgICBjYi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBpdGVtRW50cnkua2VlcCA9IGNiLmNoZWNrZWQ7XG4gICAgICByb3cudG9nZ2xlQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWl0ZW0tb2ZmJywgIWNiLmNoZWNrZWQpO1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KFxuICAgICAgICBgJHtjYi5jaGVja2VkID8gJ1x1NEZERFx1NzU1OScgOiAnXHU1MjIwXHU5NjY0J31cdTVCNTBcdTk4NzlcdTMwMEMke2l0ZW1FbnRyeS5pdGVtLm5hbWV9XHUzMDBEYFxuICAgICAgKTtcbiAgICAgIHRoaXMucmVmcmVzaFRoaW5CYWRnZShwYXJlbnQuY2xvc2VzdCgnLmJhbWJvby1haS1wbGFuLWdvYWwnKSBhcyBIVE1MRWxlbWVudCwgZW50cnkpO1xuICAgICAgdGhpcy51cGRhdGVGb290ZXIoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IG5hbWVJbnB1dCA9IHJvdy5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLW5hbWUnLFxuICAgICAgYXR0cjogeyB2YWx1ZTogaXRlbUVudHJ5Lml0ZW0ubmFtZSwgcGxhY2Vob2xkZXI6ICdcdTVCNTBcdTk4NzlcdTU0MEQnIH0sXG4gICAgfSk7XG4gICAgbmFtZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgaXRlbUVudHJ5Lml0ZW0ubmFtZSA9IG5hbWVJbnB1dC52YWx1ZS50cmltKCkgfHwgYFx1NUI1MFx1OTg3OSR7aWkgKyAxfWA7XG4gICAgICB1bml0Q2hpcC5zZXRUZXh0KGV4dHJhY3RVbml0KG5hbWVJbnB1dC52YWx1ZSkpO1xuICAgIH0pO1xuICAgIG5hbWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NUI1MFx1OTg3OVx1NjUzOVx1NTQwRFx1NEUzQVx1MzAwQyR7aXRlbUVudHJ5Lml0ZW0ubmFtZX1cdTMwMERgKTtcbiAgICB9KTtcblxuICAgIGlmICghaXRlbUVudHJ5Lml0ZW0udGFza0RheVR5cGUpIGl0ZW1FbnRyeS5pdGVtLnRhc2tEYXlUeXBlID0gJ2RhaWx5JztcbiAgICBjb25zdCBkYWlseVdyYXAgPSByb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1kYWlseScgfSk7XG4gICAgZGFpbHlXcmFwLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnXHU2QkNGXHU2NUU1XHU5MUNGJywgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1sYWJlbCcgfSk7XG4gICAgY29uc3QgZGFpbHlJbnB1dCA9IGRhaWx5V3JhcC5jcmVhdGVFbCgnaW5wdXQnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLWRhaWx5LWlucHV0JyxcbiAgICAgIGF0dHI6IHsgdmFsdWU6IGl0ZW1FbnRyeS5pdGVtLmRhaWx5TWluID8/ICcnLCBwbGFjZWhvbGRlcjogJ1x1NjU3MFx1NUI1NycsIHR5cGU6ICd0ZXh0JywgaW5wdXRtb2RlOiAnZGVjaW1hbCcgfSxcbiAgICB9KTtcbiAgICBjb25zdCB1bml0Q2hpcCA9IGRhaWx5V3JhcC5jcmVhdGVTcGFuKHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS11bml0LWNoaXAnIH0pO1xuICAgIHVuaXRDaGlwLnNldFRleHQoZXh0cmFjdFVuaXQoaXRlbUVudHJ5Lml0ZW0ubmFtZSkpO1xuICAgIGNvbnN0IGRhaWx5V2FybiA9IHJvdy5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS13YXJuJyxcbiAgICAgIHRleHQ6ICdcdTI2QTAgXHU0RTBEXHU1M0VGXHU5MUNGXHU1MzE2XHVGRjBDXHU1RUZBXHU4QkFFXHU1MjIwXHU5NjY0XHU2MjE2XHU2NTM5XHU1MTk5XHU0RTNBXHU1M0VGXHU4QkExXHU2NTcwXHU1MkE4XHU0RjVDJyxcbiAgICB9KTtcbiAgICBjb25zdCBtYXJrRGFpbHkgPSAoKSA9PiB7XG4gICAgICBjb25zdCBxdWFudGlmaWVkID0gL15cXGQrKFxcLlxcZCspPyQvLnRlc3QoKGl0ZW1FbnRyeS5pdGVtLmRhaWx5TWluID8/ICcnKS50cmltKCkpO1xuICAgICAgZGFpbHlXcmFwLnRvZ2dsZUNsYXNzKCdiYW1ib28tYWktcGxhbi1pdGVtLW5vLWRhaWx5JywgIXF1YW50aWZpZWQpO1xuICAgICAgZGFpbHlXYXJuLnRvZ2dsZUNsYXNzKCdiYW1ib28tYWktcGxhbi1pdGVtLXdhcm4tc2hvdycsICFxdWFudGlmaWVkKTtcbiAgICB9O1xuICAgIG1hcmtEYWlseSgpO1xuICAgIGRhaWx5SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICBpdGVtRW50cnkuaXRlbS5kYWlseU1pbiA9IGRhaWx5SW5wdXQudmFsdWUudHJpbSgpO1xuICAgICAgbWFya0RhaWx5KCk7XG4gICAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UocGFyZW50LmNsb3Nlc3QoJy5iYW1ib28tYWktcGxhbi1nb2FsJykgYXMgSFRNTEVsZW1lbnQsIGVudHJ5KTtcbiAgICB9KTtcbiAgICBkYWlseUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU1QjUwXHU5ODc5XHUzMDBDJHtpdGVtRW50cnkuaXRlbS5uYW1lfVx1MzAwRFx1NkJDRlx1NjVFNVx1OTFDRlx1NjUzOVx1NEUzQSAke2l0ZW1FbnRyeS5pdGVtLmRhaWx5TWlufWApO1xuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW1FbnRyeS5pdGVtLmRldGFpbCkge1xuICAgICAgcm93LmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6IGBBSVx1RkYxQSR7aXRlbUVudHJ5Lml0ZW0uZGV0YWlsfWAsXG4gICAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tcmVhc29uJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlRm9vdGVyKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5mb290ZXJDb3VudCkgcmV0dXJuO1xuICAgIGNvbnN0IG4gPSB0aGlzLmVudHJpZXMuZmlsdGVyKChlKSA9PiBlLmtlZXApLmxlbmd0aDtcbiAgICB0aGlzLmZvb3RlckNvdW50LnNldFRleHQoYFx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1RkYwOCR7bn1cdUZGMDlgKTtcbiAgfVxuXG4gIHByaXZhdGUgY29uZmlybSgpOiB2b2lkIHtcbiAgICBjb25zdCBmaW5hbEdvYWxzOiBHb2FsSXRlbVtdID0gW107XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmVudHJpZXMpIHtcbiAgICAgIGlmICghZW50cnkua2VlcCkgY29udGludWU7XG4gICAgICBjb25zdCBrZXB0SXRlbXM6IEdvYWxTdWJJdGVtW10gPSBlbnRyeS5pdGVtc1xuICAgICAgICAuZmlsdGVyKChpdCkgPT4gaXQua2VlcClcbiAgICAgICAgLm1hcCgoaXQpID0+IHtcbiAgICAgICAgICBjb25zdCB7IGRldGFpbDogX2RldGFpbCwgLi4ucmVzdCB9ID0gaXQuaXRlbTtcbiAgICAgICAgICByZXR1cm4gcmVzdDtcbiAgICAgICAgfSk7XG4gICAgICBmaW5hbEdvYWxzLnB1c2goeyAuLi5lbnRyeS5nb2FsLCBpdGVtczoga2VwdEl0ZW1zIH0pO1xuICAgIH1cblxuICAgIGlmIChmaW5hbEdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbmV3IE5vdGljZSgnXHU2NzJBXHU0RkREXHU3NTU5XHU0RUZCXHU0RjU1XHU3NkVFXHU2ODA3XHVGRjBDXHU1REYyXHU1M0Q2XHU2RDg4XHU1MTk5XHU1MTY1Jyk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub25Db25maXJtKGZpbmFsR29hbHMpO1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgIi8qKlxuICogUGxhbm5pbmdTZXNzaW9uIFx1MjAxNCBcdTVCRjlcdThCRERcdTVGMEZcdTg5QzRcdTUyMTJcdTRGMUFcdThCRERcdUZGMDhBZ2VudGljXHVGRjBDUGhhc2UgNFx1RkYwOVxuICpcbiAqIFx1NEUwRSBQaGFzZTEgYHBsYW5Gcm9tTm90ZWBcdUZGMDhcdTRFMDBcdTZCMjFcdTYwMjdcdUZGMDlcdTRFMERcdTU0MENcdUZGMENcdTY3MkNcdTdDN0JcdTdFRjRcdTYyQTRcdTRFMDBcdTZCQjVcdTU5MUFcdThGNkVcdTVCRjlcdThCRERcdUZGMUFcbiAqICAtIFx1OTk5Nlx1OEY2RSBpbml0KClcdUZGMUFBSSBcdTRFQ0VcdTdCMTRcdThCQjBcdTYyQzZcdTg5RTNcdTUyMURcdTcyNDggZ29hbHNcdUZGMUJcbiAqICAtIFx1NTQwRVx1N0VFRCBzZW5kKHRleHQpXHVGRjFBXHU3NTI4XHU2MjM3XHU3NTI4XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU1ODlFIC8gXHU1MjIwIC8gXHU2NTM5XHVGRjBDQUkgXHU4RkQ0XHU1NkRFXHUzMDEwXHU1MTY4XHU5MUNGXHUzMDExXHU2NzAwXHU2NUIwIGdvYWxzXHVGRjFCXG4gKiAgLSBcdTYyNEJcdTUyQThcdTdGMTZcdThGOTFcdUZGMUFcdTc2RjRcdTYzQTUgbXV0YXRlIGBnb2Fsc2BcdUZGMDhcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMDlcdUZGMENcdTVFNzZcdTc1MjggYXBwbHlMb2NhbEVkaXQgXHU2MjhBXHU2NTM5XHU1MkE4XG4gKiAgICBcdTUxOTlcdThGREJcdTVCRjlcdThCRERcdTUzODZcdTUzRjJcdUZGMENcdTk2MzJcdTZCNjIgQUkgXHU0RTBCXHU4RjZFXHU2MjhBXHU3NTI4XHU2MjM3XHU2MjRCXHU1MkE4XHU2NTM5XHU1MkE4XHU4OTg2XHU3NkQ2XHU1NkRFXHU1M0JCXHVGRjFCXG4gKiAgLSByZXNldCgpXHVGRjFBXHU1NkRFXHU1MjMwIEFJIFx1OTk5Nlx1NzI0OFx1RkYwQ1x1NkUwNVx1N0E3QVx1NUJGOVx1OEJERFx1MzAwMlxuICpcbiAqIFx1OEJCRVx1OEJBMVx1NTM5Rlx1NTIxOVx1RkYwOFx1NEUwRVx1NEVBN1x1NTRDMVx1NTRGMlx1NUI2Nlx1NEUwMFx1ODFGNFx1RkYwOVx1RkYxQVxuICogIC0gXHU1MzU1XHU0RTAwXHU2NTcwXHU2MzZFXHU2RTkwXHVGRjFBdGhpcy5nb2FscyBcdTY2MkZcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMDhzb3VyY2Ugb2YgdHJ1dGhcdUZGMDlcdTMwMDJcbiAqICAtIFx1NUJCOVx1OTUxOVx1NEYxOFx1NTE0OFx1RkYxQVx1NTc0RiBKU09OIFx1MjE5MiBcdTU2REVcdTZFREFcdTY3MkNcdThGNkUgbWVzc2FnZXNcdTMwMDF0aGlzLmdvYWxzIFx1NEUwRFx1NTNEOFx1MzAwMVx1NjI5Qlx1OTUxOVx1NzUzMVx1NEUwQVx1NUM0Mlx1NjNEMFx1NzkzQVx1MzAwMlxuICpcbiAqIFx1OTZGNiBPYnNpZGlhbiBcdTRGOURcdThENTZcdUZGMENmZXRjaEZuIFx1NTNFRlx1NkNFOFx1NTE2NVx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1RkYwOFx1NTNDMlx1ODAwMyBtYXJrZG93blBsYW5uZXIudGVzdC50c1x1RkYwOVx1MzAwMlxuICovXG5cbmltcG9ydCB7IHJlcXVlc3RVcmwgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyB0eXBlIEdvYWxJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5pbXBvcnQge1xuICBidWlsZFByb21wdCxcbiAgZXh0cmFjdENoYXRUZXh0LFxuICBwYXJzZUdvYWxzLFxuICB0eXBlIEFpRmV0Y2hGbixcbiAgdHlwZSBBaVJlc3BvbnNlLFxuICB0eXBlIFBsYW5uZXJTZXR0aW5ncyxcbn0gZnJvbSAnLi9NYXJrZG93blBsYW5uZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVHb2FscyBhcyBfdmFsaWRhdGUgfSBmcm9tICcuL0dvYWxDYXJkVmFsaWRhdG9yJztcblxuLyoqIFx1NUJGOVx1OEJERFx1NkQ4OFx1NjA2Rlx1RkYwOFx1NUJGOVx1OUY1MCBPcGVuQUkgY2hhdC9jb21wbGV0aW9ucyBtZXNzYWdlc1x1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBDaGF0TWVzc2FnZSB7XG4gIHJvbGU6ICdzeXN0ZW0nIHwgJ3VzZXInIHwgJ2Fzc2lzdGFudCc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbn1cblxuLyoqIHNlbmQoKSBcdTc2ODRcdThGRDRcdTU2REVcdTUwM0NcdUZGMUFcdTY3MkNcdThGNkUgQUkgXHU2OTgyXHU4OTgxICsgXHU2NzAwXHU2NUIwXHU1MTY4XHU5MUNGIGdvYWxzICovXG5leHBvcnQgaW50ZXJmYWNlIFNlbmRSZXN1bHQge1xuICByZXBseTogc3RyaW5nO1xuICBnb2FsczogR29hbEl0ZW1bXTtcbn1cblxuLyoqIFx1NUJGOVx1OEJERFx1NUYwRlx1ODlDNFx1NTIxMlx1OEZGRFx1NTJBMFx1NTIzMCBzeXN0ZW0gXHU3Njg0XHU2MzA3XHU0RUU0XHVGRjA4XHU1OTBEXHU3NTI4IGJ1aWxkUHJvbXB0IFx1NzY4NFx1OTFDRlx1NTMxNlx1OTRDMVx1NUY4Qlx1RkYwOSAqL1xuY29uc3QgQUdFTlRfU1VGRklYID0gYFxuXG4jIFx1NUJGOVx1OEJERFx1NUYwRlx1ODlDNFx1NTIxMlx1NkEyMVx1NUYwRlx1RkYwOFx1NEY2MFx1NkI2M1x1NEUwRVx1NzUyOFx1NjIzN1x1NTkxQVx1OEY2RVx1NjI1M1x1NzhFOFx1ODlDNFx1NTIxMlx1RkYwOVxuXHU4RkQ5XHU2NjJGXHU1QkY5XHU4QkREXHU1RjBGXHU4OUM0XHU1MjEyXHVGRjFBXHU3NTI4XHU2MjM3XHU0RjFBXHU1NzI4XHU2QjY0XHU1N0ZBXHU3ODQwXHU0RTBBXHU2M0QwXHU1MUZBXHUzMDBDXHU1ODlFIC8gXHU1MjIwIC8gXHU2NTM5XHUzMDBEXHU3QjQ5XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU2MzA3XHU0RUU0XHUzMDAyXG4tIFx1NkJDRlx1NkIyMVx1NTZERVx1NTkwRFx1OTBGRFx1NUZDNVx1OTg3Qlx1OEZENFx1NTZERVx1MzAxMFx1NUY1M1x1NTI0RFx1NUI4Q1x1NjU3NFx1NzY4NFx1NjcwMFx1NjVCMCBnb2FscyBKU09OIFx1NTE2OFx1OTFDRlx1MzAxMVx1RkYwQyoqXHU0RTBEXHU4OTgxXHU1M0VBXHU1NkRFXHU1ODlFXHU5MUNGXHUzMDAxXHU0RTBEXHU4OTgxXHU1NkRFIGRpZmYqKlx1MzAwMlxuLSBcdTk4NzZcdTVDNDJcdTU4OUVcdTUyQTBcdTUzRUZcdTkwMDlcdTVCNTdcdTZCQjUgXCJyZXBseVwiXHVGRjA4XHU1QjU3XHU3QjI2XHU0RTMyXHVGRjBDXHUyMjY0MzAgXHU1QjU3XHU0RTJEXHU2NTg3XHVGRjA5XHVGRjFBXHU3NTI4XHU0RTAwXHU1M0U1XHU4QkREXHU4QkY0XHU2NjBFXHU0RjYwXHU4RkQ5XHU2QjIxXHU1MDVBXHU0RTg2XHU0RUMwXHU0RTQ4XHU2NTM5XHU1MkE4XHVGRjFCXHU4MkU1XHU3NTI4XHU2MjM3XHU1M0VBXHU2NjJGXHU2M0QwXHU5NUVFXHU0RTVGXHU4QkY3XHU3QjgwXHU4OTgxXHU1NkRFXHU3QjU0XHUzMDAyXG4tIFx1NEZERFx1NjMwMVx1NEUwQVx1NjU4N1x1NjI0MFx1NjcwOVx1OTFDRlx1NTMxNlx1OTRDMVx1NUY4Qlx1RkYxQVx1N0VBRlx1NjU3MFx1NUI1NyBkYWlseU1pblx1MzAwMVx1NjVFNVx1OTg5N1x1N0M5Mlx1NUVBNlx1MzAwMVx1NEUyNVx1NjgzQ1x1NTZGNFx1N0VENVx1NzZFRVx1NjgwN1x1MzAwMVx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1x1MzAwMVx1Nzk4MVx1NkI2MlwiXHU1MkFBXHU1MjlCL1x1NTc1QVx1NjMwMVwiXHU3QjQ5XHU0RjJBXHU5MUNGXHU1MzE2XHU4QkNEXHUzMDAyXG4tIFx1NTNFQVx1OEY5M1x1NTFGQSBKU09OXHVGRjBDXHU0RTBEXHU4OTgxXHU0RUZCXHU0RjU1XHU5ODlEXHU1OTE2XHU4OUUzXHU5MUNBXHU2NTg3XHU1QjU3XHUzMDAxXHU0RTBEXHU4OTgxIG1hcmtkb3duIFx1NTZGNFx1NjgwRlx1MzAwMlxuXHU4RjkzXHU1MUZBXHU2ODNDXHU1RjBGXHU3OTNBXHU0RjhCXHVGRjFBXG57IFwicmVwbHlcIjogXCJcdTVERjJcdTUyMjBcdTk2NjRcdThERDFcdTZCNjVcdUZGMENcdTY1QjBcdTU4OUVcdTZCQ0ZcdTU0NjhcdTZFMzhcdTZDRjMzXHU2QjIxXCIsIFwiZ29hbHNcIjogWyAuLi4gXHU1NDBDXHU0RTBBXHU2NTg3XHU3RUQzXHU2Nzg0IC4uLiBdIH1gO1xuXG5leHBvcnQgY2xhc3MgUGxhbm5pbmdTZXNzaW9uIHtcbiAgcHJpdmF0ZSBtZXNzYWdlczogQ2hhdE1lc3NhZ2VbXSA9IFtdO1xuICAvKiogXHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjA4XHU1MzU1XHU0RTAwXHU2NTcwXHU2MzZFXHU2RTkwXHVGRjA5XHVGRjBDQUkgXHU0RTBFXHU2MjRCXHU1MkE4XHU3RjE2XHU4RjkxXHU5MEZEXHU0RjVDXHU3NTI4XHU1MTc2XHU0RTBBICovXG4gIGdvYWxzOiBHb2FsSXRlbVtdID0gW107XG4gIC8qKiBcdTk5OTZcdTcyNDhcdTVGRUJcdTcxNjdcdUZGMENcdTRGOUIgcmVzZXQoKSBcdThGRDhcdTUzOUYgKi9cbiAgcHJpdmF0ZSBpbml0aWFsR29hbHM6IEdvYWxJdGVtW10gPSBbXTtcbiAgLyoqIFx1NEYxQVx1OEJERFx1NkEyMVx1NUYwRlx1RkYxQSdub3RlJyBcdTc1MzFcdTdCMTRcdThCQjBcdTYyQzZcdTg5RTNcdTk5OTZcdTcyNDhcdUZGMUInZWRpdCcgXHU3NTMxIGxvYWRHb2FscyBcdThGN0RcdTUxNjVcdTczQjBcdTY3MDlcdTY4MTEgKi9cbiAgcHJpdmF0ZSBtb2RlOiAnbm90ZScgfCAnZWRpdCcgPSAnbm90ZSc7XG4gIC8qKiBlZGl0IFx1NkEyMVx1NUYwRlx1NzY4NCBzeXN0ZW0gXHU0RTBBXHU0RTBCXHU2NTg3XHVGRjA4XHU1NDJCXHU4RjdEXHU1MTY1XHU2ODExIEpTT05cdUZGMDlcdUZGMENcdTRGOUIgcmVzZXQgXHU4RkQ4XHU1MzlGICovXG4gIHByaXZhdGUgZWRpdFN5c3RlbUNvbnRlbnQgPSAnJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNvbnRlbnQ6IHN0cmluZyxcbiAgICBwcml2YXRlIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MsXG4gICAgcHJpdmF0ZSBmZXRjaEZuOiBBaUZldGNoRm4gPSByZXF1ZXN0VXJsIGFzIHVua25vd24gYXMgQWlGZXRjaEZuLFxuICAgIHByaXZhdGUgc2NvcGU6ICdub3RlJyB8ICdzZWxlY3Rpb24nID0gJ25vdGUnXG4gICkge1xuICAgIGNvbnN0IHsgc3lzdGVtLCB1c2VyIH0gPSBidWlsZFByb21wdChjb250ZW50LCBzZXR0aW5ncy5haURlY29tcG9zZURlcHRoLCBzY29wZSk7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSArIEFHRU5UX1NVRkZJWCB9KTtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2goeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXIgfSk7XG4gIH1cblxuICAvKiogXHU5OTk2XHU4RjZFXHU4OUM0XHU1MjEyXHVGRjFBXHU4RkQ0XHU1NkRFXHU1MjFEXHU3MjQ4IGdvYWxzIFx1NUU3Nlx1NEZERFx1NUI1OFx1NUZFQlx1NzE2NyAqL1xuICBhc3luYyBpbml0KCk6IFByb21pc2U8R29hbEl0ZW1bXT4ge1xuICAgIGNvbnN0IHRleHQgPSBleHRyYWN0Q2hhdFRleHQoYXdhaXQgdGhpcy5jYWxsKCkpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UodGV4dCkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgdGhpcy5nb2FscyA9IHRoaXMuY2FsbFBhcnNlKHBhcnNlR29hbHMob2JqKSk7XG4gICAgdGhpcy5pbml0aWFsR29hbHMgPSB0aGlzLmdvYWxzO1xuICAgIHJldHVybiB0aGlzLmdvYWxzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NzUyOFx1NjIzN1x1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NjUzOVx1NEUwMFx1OEY2RVx1RkYxQVx1OEZENFx1NTZERSB7IHJlcGx5LCBnb2FscyB9XHVGRjBDXHU1RTc2XHU1MTY4XHU5MUNGXHU2NkZGXHU2MzYyXHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHUzMDAyXG4gICAqIFx1NTc0RiBKU09OIC8gXHU3RUQzXHU2Nzg0XHU5NzVFXHU2Q0Q1IFx1MjE5MiBcdTU2REVcdTZFREFcdTY3MkNcdThGNkVcdTMwMDFnb2FscyBcdTRGRERcdTYzMDFcdTRFMERcdTUzRDhcdTMwMDFcdTYyOUJcdTk1MTlcdUZGMDhcdTc1MzFcdTRFMEFcdTVDNDJcdTYzRDBcdTc5M0FcdUZGMDlcdTMwMDJcbiAgICovXG4gIGFzeW5jIHNlbmQodXNlclRleHQ6IHN0cmluZyk6IFByb21pc2U8U2VuZFJlc3VsdD4ge1xuICAgIHRoaXMubWVzc2FnZXMucHVzaCh7IHJvbGU6ICd1c2VyJywgY29udGVudDogdXNlclRleHQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLmNhbGwoKTtcbiAgICAgIGNvbnN0IHRleHQgPSBleHRyYWN0Q2hhdFRleHQocmVzcCk7XG4gICAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKHRleHQpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgY29uc3QgZ29hbHMgPSB0aGlzLmNhbGxQYXJzZShwYXJzZUdvYWxzKG9iaikpO1xuICAgICAgLy8gXHU2MjEwXHU1MjlGXHVGRjFBXHU1MTY4XHU5MUNGXHU2NkZGXHU2MzYyXHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXG4gICAgICB0aGlzLmdvYWxzID0gZ29hbHM7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXBseTogdHlwZW9mIG9iai5yZXBseSA9PT0gJ3N0cmluZycgPyBvYmoucmVwbHkgOiAnJyxcbiAgICAgICAgZ29hbHMsXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gXHU1QkI5XHU5NTE5XHU2ODM4XHU1RkMzXHVGRjFBXHU1NkRFXHU2RURBXHU2NzJDXHU4RjZFIHVzZXIgXHU2RDg4XHU2MDZGXHVGRjBDXHU3RUREXHU0RTBEXHU1MkE4XHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXG4gICAgICB0aGlzLm1lc3NhZ2VzLnBvcCgpO1xuICAgICAgdGhyb3cgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoJ0FJIFx1OEZENFx1NTZERVx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdTc1MjhcdTYyMzdcdTYyNEJcdTUyQThcdTdGMTZcdThGOTFcdTU0MEVcdThDMDNcdTc1MjhcdUZGMUFcdTYyOEFcdTY1MzlcdTUyQThcdTUxOTlcdThGREJcdTVCRjlcdThCRERcdTUzODZcdTUzRjJcdUZGMDhzeXN0ZW0gbm90ZVx1RkYwOVx1RkYwQ1xuICAgKiBcdThCQTkgQUkgXHU0RTBCXHU4RjZFXCJcdTc3RTVcdTkwNTNcdTRGNjBcdTY1MzlcdThGQzdcIlx1RkYwQ1x1NEUwRFx1NEYxQVx1NTE4RFx1NjI4QVx1ODhBQlx1NTIyMFx1NzY4NFx1NUI1MFx1OTg3OVx1NTJBMFx1NTZERVx1Njc2NVx1MzAwMlxuICAgKiBcdTc3MUZcdTZCNjNcdTc2ODQgbXV0YXRlIFx1NURGMlx1NTcyOFx1NTkxNlx1OTBFOFx1NzZGNFx1NjNBNVx1NEY1Q1x1NzUyOFx1NTcyOCB0aGlzLmdvYWxzIFx1NEUwQVx1MzAwMlxuICAgKi9cbiAgYXBwbHlMb2NhbEVkaXQobm90ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IGBbXHU3NTI4XHU2MjM3XHU2MjRCXHU1MkE4XHU2NTM5XHU1MkE4XSAke25vdGV9YCB9KTtcbiAgfVxuXG4gIC8qKiBcdTU2REVcdTUyMzAgQUkgXHU5OTk2XHU3MjQ4XHVGRjBDXHU2RTA1XHU3QTdBXHU1QkY5XHU4QkREXHU1Mzg2XHU1M0YyICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICdlZGl0Jykge1xuICAgICAgdGhpcy5nb2FscyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5pbml0aWFsR29hbHMpKTtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBbeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogdGhpcy5lZGl0U3lzdGVtQ29udGVudCArIEFHRU5UX1NVRkZJWCB9XTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5nb2FscyA9IHRoaXMuaW5pdGlhbEdvYWxzO1xuICAgIGNvbnN0IHsgc3lzdGVtLCB1c2VyIH0gPSBidWlsZFByb21wdCh0aGlzLmNvbnRlbnQsIHRoaXMuc2V0dGluZ3MuYWlEZWNvbXBvc2VEZXB0aCwgdGhpcy5zY29wZSk7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtcbiAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSArIEFHRU5UX1NVRkZJWCB9LFxuICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXIgfSxcbiAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1N0YxNlx1OEY5MVx1NzNCMFx1NjcwOVx1NzZFRVx1NjgwN1x1NjgxMVx1RkYwOFx1NEUwRFx1OEMwMyBBSVx1RkYwOVx1RkYxQVx1NkRGMVx1NjJGN1x1OEQxRFx1NEUzQVx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwQ1x1NjI4QVx1NUJGOVx1OEJERFx1OTFDRFx1N0Y2RVx1NEUzQVx1MzAwQ1x1N0YxNlx1OEY5MVx1MzAwRFx1NEUwQVx1NEUwQlx1NjU4N1x1RkYwQ1xuICAgKiBcdThCQTlcdTU0MEVcdTdFRUQgc2VuZCgpIFx1NzY4NCBBSSBcdTU3MjhcdTczQjBcdTY3MDlcdTY4MTFcdTU3RkFcdTc4NDBcdTRFMEFcdTU4OUVcdTUyMjBcdTY1MzlcdUZGMENcdTgwMENcdTk3NUVcdTRFQ0VcdTdCMTRcdThCQjBcdTkxQ0RcdTY1QjBcdTYyQzZcdTg5RTNcdTMwMDJcbiAgICogXHU5OTk2XHU3MjQ4XHU1RkVCXHU3MTY3ID0gXHU0RjIwXHU1MTY1XHU2ODExXHVGRjBDcmVzZXQoKSBcdTU2REVcdTUyMzBcdTc3MUZcdTVCOUVcdTk5OTZcdTcyNDhcdUZGMDhcdTRFMERcdTg4QUJcdTZDNjFcdTY3RDNcdUZGMDlcdTMwMDJcbiAgICovXG4gIGxvYWRHb2Fscyhnb2FsczogR29hbEl0ZW1bXSk6IHZvaWQge1xuICAgIGNvbnN0IGNsb25lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShnb2FscykpIGFzIEdvYWxJdGVtW107XG4gICAgdGhpcy5nb2FscyA9IGNsb25lO1xuICAgIHRoaXMuaW5pdGlhbEdvYWxzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShnb2FscykpIGFzIEdvYWxJdGVtW107XG4gICAgdGhpcy5tb2RlID0gJ2VkaXQnO1xuICAgIHRoaXMuZWRpdFN5c3RlbUNvbnRlbnQgPVxuICAgICAgJ1x1NEY2MFx1NjYyRlx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1N0YxNlx1OEY5MVx1NTY2OFx1MzAwMlx1NzUyOFx1NjIzN1x1NURGMlx1NjcwOVx1NEUwMFx1NEUyQVx1NzZFRVx1NjgwN1x1NjgxMVx1RkYwOFx1NTk4Mlx1NEUwQiBKU09OXHVGRjA5XHVGRjFBXFxuJyArXG4gICAgICBKU09OLnN0cmluZ2lmeShnb2FscywgbnVsbCwgMikgK1xuICAgICAgJ1xcblx1NzUyOFx1NjIzN1x1NEYxQVx1NzUyOFx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NjNEMFx1NTFGQVx1MzAwQ1x1NTg5RS9cdTUyMjAvXHU2NTM5XHUzMDBEXHU2MzA3XHU0RUU0XHVGRjBDXHU0RjYwXHU2QkNGXHU2QjIxXHU1NkRFXHU1OTBEXHU5MEZEXHU1RkM1XHU5ODdCXHU4RkQ0XHU1NkRFXHUzMDEwXHU1RjUzXHU1MjREXHU1QjhDXHU2NTc0XHU3Njg0XHU2NzAwXHU2NUIwIGdvYWxzIEpTT04gXHU1MTY4XHU5MUNGXHUzMDExXHVGRjBDXHU0RkREXHU2MzAxXHU5MUNGXHU1MzE2XHU5NEMxXHU1RjhCXHVGRjA4XHU3RUFGXHU2NTcwXHU1QjU3IGRhaWx5TWluXHUzMDAxXHU2NUU1XHU5ODk3XHU3QzkyXHU1RUE2XHUzMDAxXHU1M0VGXHU2NTcwXHU0RUUzXHU3NDA2XHU2MzA3XHU2ODA3XHVGRjA5XHUzMDAyXHU1M0VBXHU4RjkzXHU1MUZBIEpTT05cdUZGMENcdTRFMERcdTg5ODEgbWFya2Rvd24gXHU1NkY0XHU2ODBGXHUzMDAyJztcbiAgICB0aGlzLm1lc3NhZ2VzID0gW3sgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHRoaXMuZWRpdFN5c3RlbUNvbnRlbnQgKyBBR0VOVF9TVUZGSVggfV07XG4gIH1cblxuICAvKiogXHU1RjUzXHU1MjREXHU1QkY5XHU4QkREXHU2RDg4XHU2MDZGXHVGRjA4XHU1M0VBXHU4QkZCXHU3NTI4XHU5MDE0XHVGRjBDXHU1OTgyXHU4QzAzXHU4QkQ1IC8gXHU2RDRCXHU4QkQ1XHU2NUFEXHU4QTAwXHVGRjA5ICovXG4gIGdldE1lc3NhZ2VzKCk6IENoYXRNZXNzYWdlW10ge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjYWxsKCk6IFByb21pc2U8QWlSZXNwb25zZT4ge1xuICAgIGNvbnN0IHVybCA9IGAke3RoaXMuc2V0dGluZ3MuYWlCYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgJycpfS9jaGF0L2NvbXBsZXRpb25zYDtcbiAgICByZXR1cm4gdGhpcy5mZXRjaEZuKHtcbiAgICAgIHVybCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dGhpcy5zZXR0aW5ncy5haUFwaUtleX1gLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbW9kZWw6IHRoaXMuc2V0dGluZ3MuYWlNb2RlbCxcbiAgICAgICAgbWVzc2FnZXM6IHRoaXMubWVzc2FnZXMsXG4gICAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH0sXG4gICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICB9KSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBcdTg5RTNcdTY3OTAgKyBcdTY4MjFcdTlBOENcdUZGMUFwYXJzZUdvYWxzIFx1NTA1QVx1NUI1N1x1NkJCNVx1NjYyMFx1NUMwNFx1RkYwQ3ZhbGlkYXRlR29hbHMgXHU1MTVDXHU1RTk1XHU4ODY1XHU5RUQ4XHU4QkE0ICovXG4gIHByaXZhdGUgY2FsbFBhcnNlKHJhdzogR29hbEl0ZW1bXSk6IEdvYWxJdGVtW10ge1xuICAgIHJldHVybiBfdmFsaWRhdGUocmF3KTtcbiAgfVxufVxuIiwgIi8qKlxuICogRGlhZ25vc2lzTW9kYWwgXHUyMDE0IEFJIFx1OEJDQVx1NjVBRFx1NTNFQVx1OEJGQlx1NjJBNVx1NTQ0QVx1RkYwOE1WUC0xICsgVUkgdjJcdUZGMDlcbiAqXG4gKiBcdThCQkVcdThCQTFcdThCRURcdThBMDBcdUZGMUFcdTRFMEUgQUkgXHU4OUM0XHU1MjEyXHU2QTIxXHU1NzU3XHVGRjA4QWdlbnRpY1BsYW5Nb2RhbFx1RkYwOVx1N0VERlx1NEUwMFxuICogICAtIFx1NEUzQlx1OTg5OFx1ODI3Mlx1RkYxQXZhcigtLWludGVyYWN0aXZlLWFjY2VudClcbiAqICAgLSBcdTU3MDZcdTg5RDJcdUZGMUExMC0xMnB4XG4gKiAgIC0gXHU5NUY0XHU4REREXHVGRjFBOHB0IFx1N0Y1MVx1NjgzQ1xuICogICAtIFx1NzJCNlx1NjAwMVx1OEJFRFx1NEU0OVx1RkYxQVx1NEZERFx1NzU1OVx1RkYwOFx1N0VGRi9cdTlFQzQvXHU3RUEyL1x1NkE1OVx1RkYwOVx1RkYwQ1x1NEY0Nlx1NjdENFx1NTQ4Q1x1NTMxNlx1RkYwOFx1OTAwRlx1NjYwRVx1ODBDQ1x1NjY2RiArIFx1NUI1N1x1ODI3Mlx1RkYwOVxuICpcbiAqIFx1NEZFMVx1NjA2Rlx1NUM0Mlx1N0VBN1x1RkYxQVxuICogICBMMSBcdTcxMjZcdTcwQjlcdUZGMUFcdTY4MDdcdTk4OTggKyBcdTY0NThcdTg5ODFcdUZGMDhcdTRFMDBcdTVDNEZcdTUzRUZcdTg5QzFcdUZGMDlcbiAqICAgTDIgXHU0RTNCXHU0RjUzXHVGRjFBXHU1RUZBXHU4QkFFXHU1MjE3XHU4ODY4XHVGRjA4XHU2QkNGXHU2NzYxXHU3MkVDXHU3QUNCXHU4ODRDXHU1MkE4XHU1MzYxIFx1MjE5MiBcdTkxOTJcdTc2RUUgQ1RBXHVGRjA5XHUyMDE0IFx1NzUyOFx1NjIzN1x1Njc2NVx1OEZEOVx1OTFDQ1x1NzY4NFx1NzcxRlx1NkI2M1x1NzZFRVx1NzY4NFxuICogICBMMyBcdTdFQzZcdTgyODJcdUZGMUFcdTVCNTBcdTk4NzlcdThCQzFcdTYzNkVcdUZGMDhcdTlFRDhcdThCQTRcdTYyOThcdTUzRTBcdUZGMENcdTcwQjlcdTUxRkJcdTVDNTVcdTVGMDBcdTdEMjdcdTUxRDFcdTg4NjhcdTY4M0NcdUZGMDlcdTIwMTQgXHU2NTJGXHU2NDkxXHU2NTcwXHU2MzZFXG4gKlxuICogXHU1NzRGIEpTT04gXHU1NkRFXHU5MDAwXHVGRjA4cmF3VGV4dFx1RkYwOVx1MjE5MiBcdTc2RjRcdTYzQTVcdTVDNTVcdTc5M0FcdTdFQUZcdTY1ODdcdTY3MkNcdUZGMENcdTRFMERcdTVEMjlcdTMwMDJcbiAqL1xuaW1wb3J0IHsgTW9kYWwsIEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgRGlhZ25vc2lzUmVzdWx0LCBHb2FsRGlhZ25vc2lzIH0gZnJvbSAnLi9Hb2FsRGlhZ25vc2VyJztcbmltcG9ydCB0eXBlIHsgSXRlbUV2aWRlbmNlIH0gZnJvbSAnLi9EZXZpYXRpb25DYWxjdWxhdG9yJztcblxuY29uc3QgU1RBVFVTX0xBQkVMOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBvbl90cmFjazogJ1x1OEZCRVx1NjgwNycsXG4gIGJlaGluZDogJ1x1ODQzRFx1NTQwRScsXG4gIHN0dWNrOiAnXHU1MDVDXHU2RURFJyxcbiAgZG9uZTogJ1x1NURGMlx1NUI4Q1x1NjIxMCcsXG4gIGF0X3Jpc2s6ICdcdTRFMzRcdTY3MUZcdTk4Q0VcdTk2NjknLFxufTtcblxuLyoqIFx1NTA2NVx1NUVCN1x1N0I0OVx1N0VBN1x1NjU4N1x1Njg0OFx1RkYwOFx1NEUwRSB3ZWJhcHAgXHU1MDY1XHU1RUI3XHU1MzYxXHU3MjQ3XHU1NDBDXHU4QkNEXHU2QzQ3XHVGRjA5ICovXG5jb25zdCBMRVZFTF9MQUJFTDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgZXhjZWxsZW50OiAnXHU0RjE4XHU3OUMwJyxcbiAgZ29vZDogJ1x1ODI2Rlx1NTk3RCcsXG4gIHdhcm5pbmc6ICdcdTk3MDBcdTUxNzNcdTZDRTgnLFxuICByaXNrOiAnXHU5OENFXHU5NjY5Jyxcbn07XG5cbi8qKiBcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTUyMDZcdTc3RURcdTY4MDdcdTdCN0VcdUZGMDhcdTVDNjVcdTdFQTYgLyBcdTUyQThcdTUyOUIgLyBcdTgyODJcdTU5NEZcdUZGMENcdTVCRjlcdTlGNTBcdTUwNjVcdTVFQjdcdTUzNjFcdTcyNDdcdUZGMDkgKi9cbmNvbnN0IERJTV9MQUJFTDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgTDE6ICdcdTVDNjVcdTdFQTYnLFxuICBMMjogJ1x1NTJBOFx1NTI5QicsXG4gIEwzOiAnXHU4MjgyXHU1OTRGJyxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc2lzTW9kYWxPcHRpb25zIHtcbiAgZGlhZ25vc2lzOiBEaWFnbm9zaXNSZXN1bHQ7XG4gIG9uQXBwbHk6IChnb2FsOiBHb2FsRGlhZ25vc2lzKSA9PiB2b2lkO1xuICAvKiogXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHVGRjA4XHU2MzA5IGdvYWwudGl0bGUgXHU3RDIyXHU1RjE1XHVGRjA5XHVGRjBDXHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXHVGRjBDXHU1QzU1XHU1RjAwXHU1NDBFXHU2NjJGXHU3RDI3XHU1MUQxXHU4ODY4XHU2ODNDICovXG4gIGl0ZW1FdmlkZW5jZT86IFJlY29yZDxzdHJpbmcsIEl0ZW1FdmlkZW5jZVtdPjtcbiAgdGl0bGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBEaWFnbm9zaXNNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBvcHRzOiBEaWFnbm9zaXNNb2RhbE9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIG9wdHM6IERpYWdub3Npc01vZGFsT3B0aW9ucykge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoJ2JhbWJvby1kaWFnLW1vZGFsJyk7XG5cbiAgICAvLyA9PT09PSBIZWFkZXIgPT09PT1cbiAgICBjb25zdCBoZWFkZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctaGVhZGVyJyB9KTtcbiAgICBoZWFkZXIuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiB0aGlzLm9wdHMudGl0bGUgPz8gJ0FJIFx1OEJDQVx1NjVBRCBcdTAwQjcgXHU3NkVFXHU2ODA3XHU2MjY3XHU4ODRDXHU1OTBEXHU3NkQ4JyB9KTtcblxuICAgIGNvbnN0IGQgPSB0aGlzLm9wdHMuZGlhZ25vc2lzO1xuICAgIGlmICghZC5vaykge1xuICAgICAgLy8gXHU1NzRGIEpTT04gXHU1MTVDXHU1RTk1XHVGRjFBXHU1M0VBXHU1QzU1XHU3OTNBXHU3RUFGXHU2NTg3XHU2NzJDXHVGRjBDXHU0RTBEXHU2RTMyXHU2N0QzXHU0RUZCXHU0RjU1XHU3NkVFXHU2ODA3XHU1MzYxXG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6IGQucmF3VGV4dCwgY2xzOiAnYmFtYm9vLWRpYWctcmF3JyB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyA9PT09PSBTdW1tYXJ5ID09PT09XG4gICAgaWYgKGQuc3VtbWFyeSkge1xuICAgICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiBkLnN1bW1hcnksIGNsczogJ2JhbWJvby1kaWFnLXN1bW1hcnknIH0pO1xuICAgIH1cblxuICAgIC8vID09PT09IEdvYWwgXHU1MzYxXHU3MjQ3XHU1MjE3XHU4ODY4ID09PT09XG4gICAgZm9yIChjb25zdCBnIG9mIGQuZ29hbHMpIHtcbiAgICAgIHRoaXMucmVuZGVyR29hbChjb250ZW50RWwsIGcpO1xuICAgIH1cbiAgICAvLyBuZXh0QWN0aW9ucyBcdTVERjJcdTVFOUZcdTVGMDNcdUZGMUFcdTRFMEVcdTZCQ0ZcdTY3NjEgc3VnZ2VzdGlvbnMgXHU5MUNEXHU1OTBEXHVGRjA4XCJcdTYwNjJcdTU5MERcdTZCQ0ZcdTY1RTVcdTYyNjdcdTg4NENcIlx1NjYyRlx1NUVGQVx1OEJBRVx1NzY4NFx1NTE0M1x1NjNDRlx1OEZGMFx1RkYwOVx1RkYwQ1xuICAgIC8vIFx1NEZERFx1NzU1OVx1NjU3MFx1NjM2RVx1NUI1N1x1NkJCNVx1NEVFNVx1NEZERFx1NjMwMVx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYwQ1x1NEY0Nlx1NEUwRFx1NTcyOCBVSSBcdTZFMzJcdTY3RDNcdTMwMDJcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0gXHU1MTg1XHU5MEU4XHU2RTMyXHU2N0QzXHU4Rjg1XHU1MkE5IC0tLS0tLS0tLS1cblxuICBwcml2YXRlIHJlbmRlckdvYWwocGFyZW50OiBIVE1MRWxlbWVudCwgZzogR29hbERpYWdub3Npcyk6IHZvaWQge1xuICAgIC8vIFx1NjcwOVx1NTA2NVx1NUVCN1x1NTIwNlx1NjVGNlx1NEVFNVx1MzAwQ1x1N0I0OVx1N0VBN1x1MzAwRFx1NEUzQVx1OEJFRFx1NEU0OVx1NEUzQlx1ODI3Mlx1RkYxQlx1NTQyNlx1NTIxOVx1NTZERVx1OTAwMFx1NjVFNyBzdGF0dXNcdUZGMDhcdTU0MTFcdTU0MEVcdTUxN0NcdTVCQjlcdUZGMDlcbiAgICBjb25zdCBoYXNIZWFsdGggPSAhIWcubGV2ZWw7XG4gICAgY29uc3QgY2FyZCA9IHBhcmVudC5jcmVhdGVEaXYoe1xuICAgICAgY2xzOiBoYXNIZWFsdGhcbiAgICAgICAgPyBgYmFtYm9vLWRpYWctZ29hbCBiYW1ib28tZGlhZy1nb2FsLWxldmVsLSR7Zy5sZXZlbH1gXG4gICAgICAgIDogYGJhbWJvby1kaWFnLWdvYWwgYmFtYm9vLWRpYWctZ29hbC0ke2cuc3RhdHVzfWAsXG4gICAgfSk7XG5cbiAgICAvLyBIZWFkZXJcdUZGMUFcdTY4MDdcdTk4OTggKyBcdTVGQkRcdTY4MDdcdUZGMDhcdTUwNjVcdTVFQjdcdTdCNDlcdTdFQTcgXHU2MjE2IFx1NjVFN1x1NzJCNlx1NjAwMVx1RkYwOVxuICAgIGNvbnN0IGdvYWxIZWFkZXIgPSBjYXJkLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1kaWFnLWdvYWwtaGVhZGVyJyB9KTtcbiAgICBnb2FsSGVhZGVyLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogZy50aXRsZSwgY2xzOiAnYmFtYm9vLWRpYWctZ29hbC10aXRsZScgfSk7XG4gICAgaWYgKGhhc0hlYWx0aCkge1xuICAgICAgY29uc3QgYmFkZ2UgPSBgJHtMRVZFTF9MQUJFTFtnLmxldmVsIGFzIHN0cmluZ10gPz8gZy5sZXZlbH0ke1xuICAgICAgICB0eXBlb2YgZy5oZWFsdGhTY29yZSA9PT0gJ251bWJlcicgPyBgIFx1MDBCNyAke2cuaGVhbHRoU2NvcmV9XHU1MjA2YCA6ICcnXG4gICAgICB9YDtcbiAgICAgIGdvYWxIZWFkZXIuY3JlYXRlRWwoJ3NwYW4nLCB7XG4gICAgICAgIHRleHQ6IGJhZGdlLFxuICAgICAgICBjbHM6IGBiYW1ib28tZGlhZy1sZXZlbCBiYW1ib28tZGlhZy1sZXZlbC0ke2cubGV2ZWx9IGJhbWJvby1kaWFnLWhlYWx0aHNjb3JlYCxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBnb2FsSGVhZGVyLmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgICB0ZXh0OiBTVEFUVVNfTEFCRUxbZy5zdGF0dXNdID8/IGcuc3RhdHVzLFxuICAgICAgICBjbHM6IGBiYW1ib28tZGlhZy1zdGF0dXMgYmFtYm9vLWRpYWctc3RhdHVzLSR7Zy5zdGF0dXN9YCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFx1NEUwOVx1N0VGNFx1NTA2NVx1NUVCN1x1NjMwN1x1NjgwN1x1RkYwOFx1NUM2NVx1N0VBNi9cdTUyQThcdTUyOUIvXHU4MjgyXHU1OTRGXHVGRjA5XHVGRjBDXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHU5QUQ4XHU0RUFFXG4gICAgaWYgKGhhc0hlYWx0aCkge1xuICAgICAgdGhpcy5yZW5kZXJEaW1lbnNpb25zKGNhcmQsIGcpO1xuICAgIH1cblxuICAgIC8vIFx1NzRGNlx1OTg4OFx1RkYwOFx1NEUwMFx1ODg0Q1x1NzA3MFx1NUI1N1x1RkYwOVxuICAgIGlmIChnLmJvdHRsZW5lY2spIHtcbiAgICAgIGNhcmQuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6IGcuYm90dGxlbmVjaywgY2xzOiAnYmFtYm9vLWRpYWctYm90dGxlbmVjaycgfSk7XG4gICAgfVxuXG4gICAgLy8gLS0tLS0gXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHVGRjFBXHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXHVGRjBDXHU3MEI5XHU1MUZCXHU1QzU1XHU1RjAwIC0tLS0tXG4gICAgY29uc3QgZXZMaXN0ID0gdGhpcy5vcHRzLml0ZW1FdmlkZW5jZT8uW2cudGl0bGVdO1xuICAgIGlmIChldkxpc3QgJiYgZXZMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVuZGVyRXZpZGVuY2UoY2FyZCwgZXZMaXN0KTtcbiAgICB9XG5cbiAgICAvLyAtLS0tLSBcdTVFRkFcdThCQUVcdTUyMTdcdTg4NjhcdUZGMUFcdTZCQ0ZcdTY3NjFcdTcyRUNcdTdBQ0JcdTg4NENcdTUyQThcdTUzNjFcdUZGMDhcdTY4MzhcdTVGQzMgQ1RBXHVGRjA5IC0tLS0tXG4gICAgaWYgKGcuc3VnZ2VzdGlvbnMgJiYgZy5zdWdnZXN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbmRlclN1Z2dlc3Rpb25zKGNhcmQsIGcpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRGltZW5zaW9ucyhwYXJlbnQ6IEhUTUxFbGVtZW50LCBnOiBHb2FsRGlhZ25vc2lzKTogdm9pZCB7XG4gICAgY29uc3Qgd3JhcCA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1kaW1zJyB9KTtcbiAgICBjb25zdCBkaW1zOiBBcnJheTx7IGtleTogJ0wxJyB8ICdMMicgfCAnTDMnOyBzY29yZT86IG51bWJlciB9PiA9IFtcbiAgICAgIHsga2V5OiAnTDEnLCBzY29yZTogZy5MMSB9LFxuICAgICAgeyBrZXk6ICdMMicsIHNjb3JlOiBnLkwyIH0sXG4gICAgICB7IGtleTogJ0wzJywgc2NvcmU6IGcuTDMgfSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgZCBvZiBkaW1zKSB7XG4gICAgICBjb25zdCBpc1dlYWsgPSBnLndlYWtlc3QgPT09IGQua2V5O1xuICAgICAgY29uc3Qgc2NvcmUgPSB0eXBlb2YgZC5zY29yZSA9PT0gJ251bWJlcicgPyBTdHJpbmcoZC5zY29yZSkgOiAnXHUyMDE0JztcbiAgICAgIHdyYXAuY3JlYXRlRGl2KHtcbiAgICAgICAgdGV4dDogYCR7RElNX0xBQkVMW2Qua2V5XX0gJHtzY29yZX1gLFxuICAgICAgICBjbHM6IGBiYW1ib28tZGlhZy1kaW0gYmFtYm9vLWRpYWctZGltLSR7ZC5rZXl9JHtpc1dlYWsgPyAnIGJhbWJvby1kaWFnLWRpbS13ZWFrZXN0JyA6ICcnfWAsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckV2aWRlbmNlKHBhcmVudDogSFRNTEVsZW1lbnQsIGV2TGlzdDogSXRlbUV2aWRlbmNlW10pOiB2b2lkIHtcbiAgICAvLyBcdTZDNDdcdTYwM0JcdTdFREZcdThCQTFcdUZGMUFcdTU5MUFcdTVDMTFcdTVCNTBcdTk4NzlcdTMwMDFcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTVFQTZcdTMwMDFcdTVFNzNcdTU3NDdcdTgyODJcdTU5NEZcdTUwNEZcdTVERUVcbiAgICBjb25zdCBzdGF0cyA9IHN1bW1hcml6ZShldkxpc3QpO1xuXG4gICAgY29uc3QgZGV0YWlscyA9IHBhcmVudC5jcmVhdGVFbCgnZGV0YWlscycsIHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UnIH0pO1xuICAgIGNvbnN0IHN1bW1hcnkgPSBkZXRhaWxzLmNyZWF0ZUVsKCdzdW1tYXJ5JywgeyBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1zdW1tYXJ5JyB9KTtcblxuICAgIC8vIFx1NURFNlx1NEZBN1x1RkYxQWNoZXZyb24gKyBcdTVCNTBcdTk4NzlcdTY1NzBcbiAgICBjb25zdCBsZWZ0ID0gc3VtbWFyeS5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1zdW1tYXJ5LWxlZnQnIH0pO1xuICAgIGxlZnQuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6ICdcdTI1QjgnLCBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1jaGV2cm9uJyB9KTtcbiAgICBsZWZ0LmNyZWF0ZVNwYW4oe1xuICAgICAgdGV4dDogYCR7ZXZMaXN0Lmxlbmd0aH0gXHU0RTJBXHU1QjUwXHU5ODc5IFx1MDBCNyAke3N0YXRzLmxhYmVsfWAsXG4gICAgfSk7XG5cbiAgICAvLyBcdTUzRjNcdTRGQTdcdUZGMUFcdTUzRUZcdTYyNjdcdTg4NENcdTY0NThcdTg5ODFcbiAgICBzdW1tYXJ5LmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgdGV4dDogc3RhdHMuaGVhZGxpbmUsXG4gICAgICBjbHM6IGBiYW1ib28tZGlhZy1ldmlkZW5jZS1oZWFkbGluZSBiYW1ib28tZGlhZy1ldmlkZW5jZS1oZWFkbGluZS0ke3N0YXRzLmxldmVsfWAsXG4gICAgfSk7XG5cbiAgICAvLyBcdTVDNTVcdTVGMDBcdTU0MEVcdUZGMUFcdTdEMjdcdTUxRDFcdTg4NjhcdTY4M0NcbiAgICBjb25zdCBsaXN0ID0gZGV0YWlscy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tZGlhZy1ldmlkZW5jZS1saXN0JyB9KTtcbiAgICBmb3IgKGNvbnN0IGUgb2YgZXZMaXN0KSB7XG4gICAgICB0aGlzLnJlbmRlckV2aWRlbmNlUm93KGxpc3QsIGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRXZpZGVuY2VSb3cocGFyZW50OiBIVE1MRWxlbWVudCwgZTogSXRlbUV2aWRlbmNlKTogdm9pZCB7XG4gICAgY29uc3Qgcm93ID0gcGFyZW50LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLXJvdycgfSk7XG5cbiAgICAvLyBcdTU0MERcdTVCNTdcbiAgICByb3cuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IGUubmFtZSwgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UtbmFtZScgfSk7XG5cbiAgICAvLyBkYWlseU1pblxuICAgIHJvdy5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IGUuZGFpbHlNaW4gfHwgJz8nLFxuICAgICAgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UtY2VsbCBiYW1ib28tZGlhZy1ldmlkZW5jZS1kYWlseScsXG4gICAgfSk7XG5cbiAgICAvLyBcdTVCOENcdTYyMTBcdTVFQTZcdUZGMUFcdTgyNzJcdTcwQjkgKyBcdTc2N0VcdTUyMDZcdTZCRDRcbiAgICBjb25zdCBwY3RFbCA9IHJvdy5jcmVhdGVTcGFuKHsgY2xzOiAnYmFtYm9vLWRpYWctZXZpZGVuY2UtY2VsbCcgfSk7XG4gICAgY29uc3QgcGN0TGV2ZWwgPSBwZXJjZW50TGV2ZWwoZS5wZXJjZW50KTtcbiAgICBwY3RFbC5jcmVhdGVFbCgnc3BhbicsIHsgY2xzOiBgYmFtYm9vLWRpYWctZG90IGJhbWJvby1kaWFnLWRvdC0ke3BjdExldmVsfWAgfSk7XG4gICAgcGN0RWwuY3JlYXRlU3Bhbih7XG4gICAgICB0ZXh0OiBlLnBlcmNlbnQgIT0gbnVsbCA/IGAke2UucGVyY2VudH0lYCA6ICc/JyxcbiAgICAgIGNsczogYGJhbWJvby1kaWFnLWV2aWRlbmNlLXBjdCBiYW1ib28tZGlhZy1ldmlkZW5jZS1wY3QtJHtwY3RMZXZlbH1gLFxuICAgIH0pO1xuXG4gICAgLy8gXHU4MjgyXHU1OTRGXHU1MDRGXHU1REVFXHVGRjFBXHU4MjcyXHU3MEI5ICsgXHUwMEIxcHRcbiAgICBjb25zdCBwYWNlRWwgPSByb3cuY3JlYXRlU3Bhbih7IGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLWNlbGwnIH0pO1xuICAgIGNvbnN0IHBhY2VMZXZlbCA9IHBhY2VMZXZlbE9mKGUucGFjZURldmlhdGlvbik7XG4gICAgcGFjZUVsLmNyZWF0ZUVsKCdzcGFuJywgeyBjbHM6IGBiYW1ib28tZGlhZy1kb3QgYmFtYm9vLWRpYWctZG90LSR7cGFjZUxldmVsfWAgfSk7XG4gICAgcGFjZUVsLmNyZWF0ZVNwYW4oe1xuICAgICAgdGV4dDogZS5wYWNlRGV2aWF0aW9uICE9IG51bGwgPyBgJHtmbXRTaWduZWQoZS5wYWNlRGV2aWF0aW9uKX1wdGAgOiAnPycsXG4gICAgICBjbHM6IGBiYW1ib28tZGlhZy1ldmlkZW5jZS1wYWNlIGJhbWJvby1kaWFnLWV2aWRlbmNlLXBhY2UtJHtwYWNlTGV2ZWx9YCxcbiAgICB9KTtcblxuICAgIC8vIFx1NTE0M1x1NEZFMVx1NjA2RlxuICAgIHJvdy5jcmVhdGVFbCgnc3BhbicsIHtcbiAgICAgIHRleHQ6IGAke2UuZG9uZURheXN9IFx1NTkyOSR7ZS5sYXN0RG9uZSA/ICcgXHUwMEI3ICcgKyBlLmxhc3REb25lIDogJyd9YCxcbiAgICAgIGNsczogJ2JhbWJvby1kaWFnLWV2aWRlbmNlLWZvb3QnLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTdWdnZXN0aW9ucyhwYXJlbnQ6IEhUTUxFbGVtZW50LCBnb2FsOiBHb2FsRGlhZ25vc2lzKTogdm9pZCB7XG4gICAgY29uc3Qgc3VnZ1dyYXAgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctc3VnZ2VzdGlvbnMnIH0pO1xuICAgIGNvbnN0IHRpdGxlID0gc3VnZ1dyYXAuY3JlYXRlRWwoJ2g0Jywge1xuICAgICAgdGV4dDogYFx1NUVGQVx1OEJBRVx1RkYwOCR7Z29hbC5zdWdnZXN0aW9ucy5sZW5ndGh9XHVGRjA5YCxcbiAgICAgIGNsczogJ2JhbWJvby1kaWFnLXN1Z2dlc3Rpb25zLXRpdGxlJyxcbiAgICB9KTtcbiAgICAvLyBcdTdFRjRcdTVFQTZcdTY4MDdcdTdCN0VcdUZGMUFcdTVFRkFcdThCQUVcdTVFOTRcdTU2RjRcdTdFRDVcdTY3MDBcdTVGMzFcdTdFRjRcdTVFQTZcdTVDNTVcdTVGMDBcdUZGMDhcdTY3NjVcdTgxRUEgZy53ZWFrZXN0XHVGRjFCXHU2NUUwXHU1MjE5XHU2NUU3XHU2NTcwXHU2MzZFXHVGRjBDXHU0RTBEXHU2NjNFXHU3OTNBXHVGRjA5XG4gICAgaWYgKGdvYWwud2Vha2VzdCAmJiBESU1fTEFCRUxbZ29hbC53ZWFrZXN0XSkge1xuICAgICAgdGl0bGUuY3JlYXRlU3Bhbih7XG4gICAgICAgIHRleHQ6IGBcdTgwNUFcdTcxMjYke0RJTV9MQUJFTFtnb2FsLndlYWtlc3RdfWAsXG4gICAgICAgIGNsczogYGJhbWJvby1kaWFnLWZvY3VzLWRpbSBiYW1ib28tZGlhZy1mb2N1cy1kaW0tJHtnb2FsLndlYWtlc3R9YCxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHMgb2YgZ29hbC5zdWdnZXN0aW9ucykge1xuICAgICAgdGhpcy5yZW5kZXJTdWdnZXN0aW9uUm93KHN1Z2dXcmFwLCBzLCBnb2FsKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclN1Z2dlc3Rpb25Sb3coXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgZ29hbDogR29hbERpYWdub3Npc1xuICApOiB2b2lkIHtcbiAgICBjb25zdCByb3cgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctc3VnZ2VzdGlvbicgfSk7XG4gICAgcm93LmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQsIGNsczogJ2JhbWJvby1kaWFnLXN1Z2dlc3Rpb24tdGV4dCcgfSk7XG4gICAgY29uc3QgYnRuID0gcm93LmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHU1RTk0XHU3NTI4JyxcbiAgICAgIGNsczogJ2JhbWJvby1kaWFnLWFwcGx5JyxcbiAgICB9KTtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICB0aGlzLm9wdHMub25BcHBseShnb2FsKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tIFx1N0VBRlx1NTFGRFx1NjU3MFx1OEY4NVx1NTJBOSAtLS0tLS0tLS0tXG5cbnR5cGUgTGV2ZWwgPSAnbG93JyB8ICdtaWQnIHwgJ2hpZ2gnIHwgJ25ldXRyYWwnIHwgJ3BvcycgfCAnbmVnJztcblxuZnVuY3Rpb24gcGVyY2VudExldmVsKHA6IG51bWJlciB8IG51bGwpOiBMZXZlbCB7XG4gIGlmIChwID09IG51bGwpIHJldHVybiAnbmV1dHJhbCc7XG4gIGlmIChwIDwgMzApIHJldHVybiAnbG93JztcbiAgaWYgKHAgPCA3MCkgcmV0dXJuICdtaWQnO1xuICByZXR1cm4gJ2hpZ2gnO1xufVxuXG5mdW5jdGlvbiBwYWNlTGV2ZWxPZihwOiBudW1iZXIgfCBudWxsKTogTGV2ZWwge1xuICBpZiAocCA9PSBudWxsKSByZXR1cm4gJ25ldXRyYWwnO1xuICBpZiAocCA+IDApIHJldHVybiAncG9zJztcbiAgaWYgKHAgPCAwKSByZXR1cm4gJ25lZyc7XG4gIHJldHVybiAnbmV1dHJhbCc7XG59XG5cbmZ1bmN0aW9uIGZtdFNpZ25lZChuOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gbiA+IDAgPyBgKyR7bn1gIDogYCR7bn1gO1xufVxuXG4vKiogXHU4QkMxXHU2MzZFXHU2QzQ3XHU2MDNCXHVGRjFBXHU3NTI4XHU0RThFXHU2Mjk4XHU1M0UwXHU2MDAxXHU0RTBCXHU3Njg0XHU0RTAwXHU4ODRDXHU2OTgyXHU4OUM4ICovXG5mdW5jdGlvbiBzdW1tYXJpemUoZXZMaXN0OiBJdGVtRXZpZGVuY2VbXSk6IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgaGVhZGxpbmU6IHN0cmluZztcbiAgbGV2ZWw6ICdnb29kJyB8ICd3YXJuJyB8ICdiYWQnIHwgJ25ldXRyYWwnO1xufSB7XG4gIGNvbnN0IHBjdHMgPSBldkxpc3QubWFwKChlKSA9PiBlLnBlcmNlbnQpLmZpbHRlcigocCk6IHAgaXMgbnVtYmVyID0+IHAgIT0gbnVsbCk7XG4gIGNvbnN0IHBhY2VzID0gZXZMaXN0XG4gICAgLm1hcCgoZSkgPT4gZS5wYWNlRGV2aWF0aW9uKVxuICAgIC5maWx0ZXIoKHApOiBwIGlzIG51bWJlciA9PiBwICE9IG51bGwpO1xuICBpZiAocGN0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4geyBsYWJlbDogJ1x1NjVFMFx1NjU3MFx1NjM2RScsIGhlYWRsaW5lOiAnXHU2NUUwXHU2NTcwXHU2MzZFJywgbGV2ZWw6ICduZXV0cmFsJyB9O1xuICB9XG4gIGNvbnN0IGF2Z1BjdCA9IE1hdGgucm91bmQocGN0cy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIHBjdHMubGVuZ3RoKTtcbiAgY29uc3QgYXZnUGFjZSA9XG4gICAgcGFjZXMubGVuZ3RoID4gMFxuICAgICAgPyBNYXRoLnJvdW5kKHBhY2VzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gcGFjZXMubGVuZ3RoKVxuICAgICAgOiAwO1xuICBjb25zdCBhbGxaZXJvID0gZXZMaXN0LmV2ZXJ5KChlKSA9PiBlLmRvbmVEYXlzID09PSAwKTtcbiAgaWYgKGFsbFplcm8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdcdThGRDEgNyBcdTU5MjkgMCBcdTVCOENcdTYyMTAnLFxuICAgICAgaGVhZGxpbmU6ICdcdTUxNjhcdTkwRThcdTUwNUNcdTZFREUnLFxuICAgICAgbGV2ZWw6ICdiYWQnLFxuICAgIH07XG4gIH1cbiAgaWYgKGF2Z1BjdCA+PSA3MCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogYFx1NUU3M1x1NTc0N1x1NUI4Q1x1NjIxMFx1NUVBNiAke2F2Z1BjdH0lYCxcbiAgICAgIGhlYWRsaW5lOiAnXHU2NTc0XHU0RjUzXHU4RkJFXHU2ODA3JyxcbiAgICAgIGxldmVsOiAnZ29vZCcsXG4gICAgfTtcbiAgfVxuICBpZiAoYXZnUGFjZSA8IC0xMCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogYFx1NUU3M1x1NTc0N1x1NUI4Q1x1NjIxMFx1NUVBNiAke2F2Z1BjdH0lIFx1MDBCNyBcdTgyODJcdTU5NEYgJHtmbXRTaWduZWQoYXZnUGFjZSl9cHRgLFxuICAgICAgaGVhZGxpbmU6ICdcdTRFMjVcdTkxQ0RcdTZFREVcdTU0MEUnLFxuICAgICAgbGV2ZWw6ICdiYWQnLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBsYWJlbDogYFx1NUU3M1x1NTc0N1x1NUI4Q1x1NjIxMFx1NUVBNiAke2F2Z1BjdH0lIFx1MDBCNyBcdTgyODJcdTU5NEYgJHtmbXRTaWduZWQoYXZnUGFjZSl9cHRgLFxuICAgIGhlYWRsaW5lOiAnXHU5NzAwXHU4OTgxXHU1MTczXHU2Q0U4JyxcbiAgICBsZXZlbDogJ3dhcm4nLFxuICB9O1xufVxuIiwgIi8qKlxuICogR29hbERpYWdub3NlciBcdTIwMTQgQUkgXHU4QkNBXHU2NUFEXHVGRjA4XHU2M0QyXHU0RUY2XHU0RkE3XHU3RUFGXHU5MDNCXHU4RjkxXHVGRjA5XG4gKlxuICogXHU4MDRDXHU4RDIzXHU4RkI5XHU3NTRDXHVGRjA4XHU0RTBFXHU0RUE3XHU1NEMxXHU1NEYyXHU1QjY2XHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFBXG4gKiAgLSBEZXZpYXRpb25DYWxjdWxhdG9yIFx1N0I5N1x1MzAwQ1x1Nzg2Q1x1NjMwN1x1NjgwN1x1MzAwRFx1RkYwOFx1NTA0Rlx1NURFRS9cdTUwNUNcdTZFREUvXHU4RDhCXHU1MkJGXHVGRjA5XHVGRjBDXHU2NzJDXHU2QTIxXHU1NzU3XHU4RDFGXHU4RDIzXHUzMDBDXHU0RTNBXHU0RUMwXHU0RTQ4ICsgXHU2MDBFXHU0RTQ4XHU4QzAzXHUzMDBEXHU3Njg0XHU1RjUyXHU1NkUwXHVGRjFCXG4gKiAgLSBcdTU5MERcdTc1MjggUGxhbm5pbmdTZXNzaW9uIFx1NzY4NCBDaGF0TWVzc2FnZSBcdTdDN0JcdTU3OEJcdTRFMEUgZXh0cmFjdENoYXRUZXh0XHVGRjBDXHU1MTY4XHU3QTBCIHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMUJcbiAqICAtIFx1NTc0RiBKU09OIFx1MjE5MiBcdTU2REVcdTkwMDAgcmF3VGV4dCBcdTdFQUZcdTY1ODdcdTY3MkNcdUZGMENcdTdFRERcdTRFMERcdTVEMjlcdTZFODNcdUZGMDhcdTRFMEUgUGxhbm5pbmdTZXNzaW9uIFx1NUJCOVx1OTUxOVx1ODMwM1x1NUYwRlx1NEUwMFx1ODFGNFx1RkYwOVx1MzAwMlxuICpcbiAqIFx1OTZGNiBPYnNpZGlhbiBcdTRGOURcdThENTZcdUZGMENmZXRjaEZuIFx1NTNFRlx1NkNFOFx1NTE2NVx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1MzAwMlxuICovXG5pbXBvcnQgeyByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBDaGF0TWVzc2FnZSB9IGZyb20gJy4vUGxhbm5pbmdTZXNzaW9uJztcbmltcG9ydCB7IGV4dHJhY3RDaGF0VGV4dCB9IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcbmltcG9ydCB0eXBlIHsgQWlGZXRjaEZuLCBBaVJlc3BvbnNlLCBQbGFubmVyU2V0dGluZ3MgfSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQge1xuICBidWlsZENhY2hlLFxuICBzdW1tYXJpemUsXG4gIGZvcm1hdEl0ZW1FdmlkZW5jZUZvclByb21wdCxcbiAgdHlwZSBEZXZpYXRpb25DYWNoZSxcbn0gZnJvbSAnLi9EZXZpYXRpb25DYWxjdWxhdG9yJztcbmltcG9ydCB7XG4gIGNvbXB1dGVHb2FsSGVhbHRoLFxuICBnZW5lcmF0ZUhlYWx0aEhpbnRzLFxuICB3ZWFrZXN0RGltZW5zaW9uLFxuICB0eXBlIEhlYWx0aExldmVsLFxuICB0eXBlIEhlYWx0aERpbWVuc2lvbixcbn0gZnJvbSAnLi9oZWFsdGhTY29yZSc7XG5pbXBvcnQgdHlwZSB7IERheURhdGEsIEdvYWxJdGVtIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCB0eXBlIERpYWdub3Npc1N0YXR1cyA9ICdvbl90cmFjaycgfCAnYmVoaW5kJyB8ICdzdHVjaycgfCAnZG9uZScgfCAnYXRfcmlzayc7XG5cbi8qKiBcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTUyMDZcdTdFRjRcdTVFQTZcdTRFMkRcdTY1ODdcdTY4MDdcdTdCN0VcdUZGMDhcdTRGOUJcdTYzRDBcdTc5M0FcdThCQ0QvXHU2NDU4XHU4OTgxXHU1OTBEXHU3NTI4XHU1MDY1XHU1RUI3XHU1MzYxXHU3MjQ3XHU4QkNEXHU2QzQ3XHVGRjA5ICovXG5jb25zdCBESU1FTlNJT05fTEFCRUw6IFJlY29yZDxIZWFsdGhEaW1lbnNpb24sIHN0cmluZz4gPSB7XG4gIEwxOiAnXHU1QzY1XHU3RUE2XHU4MEZEXHU1MjlCJyxcbiAgTDI6ICdcdThEOEJcdTUyQkZcdTUyQThcdTUyOUInLFxuICBMMzogJ1x1NTNFRlx1NjMwMVx1N0VFRFx1NUVBNicsXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEdvYWxEaWFnbm9zaXMge1xuICB0aXRsZTogc3RyaW5nO1xuICBjb21wbGV0aW9uPzogbnVtYmVyO1xuICBzdGF0dXM6IERpYWdub3Npc1N0YXR1cztcbiAgLyoqIFx1NTA2NVx1NUVCN1x1NTIwNlx1NjAzQlx1NTIwNiAwLTEwMFx1RkYwOFx1Njc2NVx1ODFFQVx1NEUwOVx1N0VGNFx1NTA2NVx1NUVCN1x1NkEyMVx1NTc4Qlx1RkYwQ0FJIFx1NUY1Mlx1NTZFMFx1NUU5NFx1NTdGQVx1NEU4RVx1NkI2NFx1ODAwQ1x1OTc1RVx1MzAwQ1x1NjYyRlx1NTQyNlx1ODQzRFx1NTQwRVx1MzAwRFx1RkYwOSAqL1xuICBoZWFsdGhTY29yZT86IG51bWJlcjtcbiAgLyoqIFx1NTA2NVx1NUVCN1x1N0I0OVx1N0VBN1x1RkYwOFx1NEYxOFx1NzlDMC9cdTgyNkZcdTU5N0QvXHU5NzAwXHU1MTczXHU2Q0U4L1x1OThDRVx1OTY2OVx1RkYwOSAqL1xuICBsZXZlbD86IEhlYWx0aExldmVsO1xuICAvKiogTDEgXHU1QzY1XHU3RUE2XHU4MEZEXHU1MjlCXHU1MjA2ICovXG4gIEwxPzogbnVtYmVyO1xuICAvKiogTDIgXHU4RDhCXHU1MkJGXHU1MkE4XHU1MjlCXHU1MjA2ICovXG4gIEwyPzogbnVtYmVyO1xuICAvKiogTDMgXHU1M0VGXHU2MzAxXHU3RUVEXHU1RUE2XHU1MjA2ICovXG4gIEwzPzogbnVtYmVyO1xuICAvKiogXHU2NzAwXHU1RjMxXHU3RUY0XHU1RUE2XHVGRjFBXHU4QkNBXHU2NUFEXHU0RTBFXHU1RUZBXHU4QkFFXHU1RTk0XHU4MDVBXHU3MTI2XHU0RThFXHU2QjY0ICovXG4gIHdlYWtlc3Q/OiBIZWFsdGhEaW1lbnNpb247XG4gIGJvdHRsZW5lY2s/OiBzdHJpbmc7XG4gIHN1Z2dlc3Rpb25zOiBzdHJpbmdbXTtcbiAgLyoqIFx1NjcyQ1x1OEJDQVx1NjVBRFx1ODA1QVx1NzEyNlx1NzY4NFx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NTQwRFx1RkYwOFx1NUZDNVx1OTg3Qlx1Njc2NVx1ODFFQVx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NkUwNVx1NTM1NVx1RkYwQ1x1Nzk4MVx1NkI2Mlx1N0YxNlx1OTAyMFx1RkYwOSAqL1xuICBldmlkZW5jZVJlZj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaWFnbm9zaXMge1xuICBvazogdHJ1ZTtcbiAgc3VtbWFyeTogc3RyaW5nO1xuICBnb2FsczogR29hbERpYWdub3Npc1tdO1xuICBuZXh0QWN0aW9uczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmF3RGlhZ25vc2lzIHtcbiAgb2s6IGZhbHNlO1xuICByYXdUZXh0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIERpYWdub3Npc1Jlc3VsdCA9IERpYWdub3NpcyB8IFJhd0RpYWdub3NpcztcblxuY29uc3QgVkFMSURfU1RBVFVTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICdvbl90cmFjaycsXG4gICdiZWhpbmQnLFxuICAnc3R1Y2snLFxuICAnZG9uZScsXG4gICdhdF9yaXNrJyxcbl0pO1xuXG5jb25zdCBWQUxJRF9MRVZFTDogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoWydleGNlbGxlbnQnLCAnZ29vZCcsICd3YXJuaW5nJywgJ3Jpc2snXSk7XG5jb25zdCBWQUxJRF9ESU1FTlNJT046IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFsnTDEnLCAnTDInLCAnTDMnXSk7XG5cbmZ1bmN0aW9uIGFzU3RyaW5nQXJyYXkodjogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHYpKSByZXR1cm4gW107XG4gIHJldHVybiB2LmZpbHRlcigoeCkgPT4gdHlwZW9mIHggPT09ICdzdHJpbmcnKSBhcyBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gYXNOdW1iZXIodjogdW5rbm93bik6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzRmluaXRlKHYpID8gdiA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplR29hbChyYXc6IHVua25vd24pOiBHb2FsRGlhZ25vc2lzIHtcbiAgY29uc3QgZyA9IChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcgPyByYXcgOiB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IHN0YXR1czogRGlhZ25vc2lzU3RhdHVzID0gdHlwZW9mIGcuc3RhdHVzID09PSAnc3RyaW5nJyAmJiBWQUxJRF9TVEFUVVMuaGFzKGcuc3RhdHVzKVxuICAgID8gKGcuc3RhdHVzIGFzIERpYWdub3Npc1N0YXR1cylcbiAgICA6ICdiZWhpbmQnO1xuICBjb25zdCBjb21wbGV0aW9uID0gdHlwZW9mIGcuY29tcGxldGlvbiA9PT0gJ251bWJlcicgPyBnLmNvbXBsZXRpb24gOiB1bmRlZmluZWQ7XG4gIGNvbnN0IGxldmVsID0gdHlwZW9mIGcubGV2ZWwgPT09ICdzdHJpbmcnICYmIFZBTElEX0xFVkVMLmhhcyhnLmxldmVsKVxuICAgID8gKGcubGV2ZWwgYXMgSGVhbHRoTGV2ZWwpXG4gICAgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHdlYWtlc3QgPSB0eXBlb2YgZy53ZWFrZXN0ID09PSAnc3RyaW5nJyAmJiBWQUxJRF9ESU1FTlNJT04uaGFzKGcud2Vha2VzdClcbiAgICA/IChnLndlYWtlc3QgYXMgSGVhbHRoRGltZW5zaW9uKVxuICAgIDogdW5kZWZpbmVkO1xuICByZXR1cm4ge1xuICAgIHRpdGxlOiB0eXBlb2YgZy50aXRsZSA9PT0gJ3N0cmluZycgPyBnLnRpdGxlIDogJycsXG4gICAgY29tcGxldGlvbixcbiAgICBzdGF0dXMsXG4gICAgaGVhbHRoU2NvcmU6IGFzTnVtYmVyKGcuaGVhbHRoU2NvcmUpLFxuICAgIGxldmVsLFxuICAgIEwxOiBhc051bWJlcihnLkwxKSxcbiAgICBMMjogYXNOdW1iZXIoZy5MMiksXG4gICAgTDM6IGFzTnVtYmVyKGcuTDMpLFxuICAgIHdlYWtlc3QsXG4gICAgYm90dGxlbmVjazogdHlwZW9mIGcuYm90dGxlbmVjayA9PT0gJ3N0cmluZycgPyBnLmJvdHRsZW5lY2sgOiB1bmRlZmluZWQsXG4gICAgc3VnZ2VzdGlvbnM6IGFzU3RyaW5nQXJyYXkoZy5zdWdnZXN0aW9ucyksXG4gICAgZXZpZGVuY2VSZWY6IHR5cGVvZiBnLmV2aWRlbmNlUmVmID09PSAnc3RyaW5nJyA/IGcuZXZpZGVuY2VSZWYgOiB1bmRlZmluZWQsXG4gIH07XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwIEFJIFx1OEJDQVx1NjVBRFx1NjU4N1x1NjcyQ1x1RkYxQVx1NTQwOFx1NkNENSBKU09OIFx1MjE5MiBcdTdFRDNcdTY3ODRcdTUzMTYgRGlhZ25vc2lzXHVGRjA4XHU2ODIxXHU5QThDL1x1ODg2NVx1NTE2OFx1NUI1N1x1NkJCNVx1RkYwOVx1RkYxQlxuICogXHU1NzRGIEpTT04gLyBcdTk3NUVcdTVCRjlcdThDNjEgXHUyMTkyIFx1NTZERVx1OTAwMCB7IG9rOmZhbHNlLCByYXdUZXh0IH1cdUZGMENcdTdFRERcdTRFMERcdTYyOUJcdTk1MTlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRGlhZ25vc2lzKHRleHQ6IHN0cmluZyk6IERpYWdub3Npc1Jlc3VsdCB7XG4gIGNvbnN0IHRyaW1tZWQgPSAodGV4dCB8fCAnJykudHJpbSgpO1xuICBpZiAoIXRyaW1tZWQpIHJldHVybiB7IG9rOiBmYWxzZSwgcmF3VGV4dDogdHJpbW1lZCB9O1xuXG4gIGxldCBvYmo6IHVua25vd247XG4gIHRyeSB7XG4gICAgb2JqID0gSlNPTi5wYXJzZSh0cmltbWVkKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCByYXdUZXh0OiB0cmltbWVkIH07XG4gIH1cbiAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCByYXdUZXh0OiB0cmltbWVkIH07XG4gIH1cblxuICBjb25zdCBvID0gb2JqIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCBnb2FscyA9IEFycmF5LmlzQXJyYXkoby5nb2FscylcbiAgICA/IChvLmdvYWxzIGFzIHVua25vd25bXSkubWFwKG5vcm1hbGl6ZUdvYWwpXG4gICAgOiBbXTtcbiAgcmV0dXJuIHtcbiAgICBvazogdHJ1ZSxcbiAgICBzdW1tYXJ5OiB0eXBlb2Ygby5zdW1tYXJ5ID09PSAnc3RyaW5nJyA/IG8uc3VtbWFyeSA6ICcnLFxuICAgIGdvYWxzLFxuICAgIG5leHRBY3Rpb25zOiBhc1N0cmluZ0FycmF5KG8ubmV4dEFjdGlvbnMpLFxuICB9O1xufVxuXG4vKipcbiAqIFx1Njc4NFx1OTAyMFx1MzAwQ1x1NEUwOVx1N0VGNFx1NTA2NVx1NUVCN1x1NTIwNlx1MzAwRFx1NjQ1OFx1ODk4MVx1NjU4N1x1NjcyQ1x1RkYwOFx1OEJDQVx1NjVBRFx1NzY4NFx1NEUzQlx1NEZFMVx1NTNGN1x1RkYwOVx1MzAwMlxuICpcbiAqIFx1NEUwRSB3ZWJhcHAgXHU1MDY1XHU1RUI3XHU1MzYxXHU3MjQ3XHU1NDBDXHU0RTAwXHU1OTU3XHU2QTIxXHU1NzhCL1x1OEJDRFx1NkM0N1x1RkYxQVxuICogIC0gXHU2QkNGXHU3NkVFXHU2ODA3XHU4RjkzXHU1MUZBIFx1NTA2NVx1NUVCN1x1NTIwNiArIFx1N0I0OVx1N0VBN1x1RkYwOFx1NEYxOFx1NzlDMC9cdTgyNkZcdTU5N0QvXHU5NzAwXHU1MTczXHU2Q0U4L1x1OThDRVx1OTY2OVx1RkYwOVx1RkYxQlxuICogIC0gTDEgXHU1QzY1XHU3RUE2XHU4MEZEXHU1MjlCIC8gTDIgXHU4RDhCXHU1MkJGXHU1MkE4XHU1MjlCIC8gTDMgXHU1M0VGXHU2MzAxXHU3RUVEXHU1RUE2IFx1NEUwOVx1N0VGNFx1NTIwNiArIFx1NTE3M1x1OTUyRVx1NUI1MFx1OTg3OSBoaW50XHVGRjFCXG4gKiAgLSBcdTY3MDBcdTVGMzFcdTdFRjRcdTVFQTZcdUZGMDhcdThCQ0FcdTY1QUQvXHU1RUZBXHU4QkFFXHU1RTk0XHU4MDVBXHU3MTI2XHU2QjY0XHU3RUY0XHU1RUE2XHVGRjA5XHVGRjFCXG4gKiAgLSBcdTYzMDlcdTdFRjRcdTVFQTZcdTVGNTJcdTU2RTAgaGludHNcdUZGMDhcdTZCQ0ZcdTY3NjFcdTVFMjYgW0wxXS9bTDJdL1tMM10gXHU1MjREXHU3RjAwXHVGRjBDXHU0RjlCIEFJIFx1NUJGOVx1OUY1MFx1NUVGQVx1OEJBRVx1N0VGNFx1NUVBNlx1RkYwOVx1MzAwMlxuICpcbiAqIFx1OEZEOVx1NjYyRlx1NEZFRVx1NTkwRFx1MzAwQ0FJIFx1NEUwRFx1NzQwNlx1ODlFM1x1NTA2NVx1NUVCN1x1NTIwNlx1OEJCRVx1OEJBMVx1NTRGMlx1NUI2Nlx1MzAwRFx1NzY4NFx1NjgzOFx1NUZDM1x1RkYxQVx1NjI4QVx1NEUwOVx1N0VGNFx1NkEyMVx1NTc4QiArIFx1NTNDRFx1NzZGNFx1ODlDOVx1NEVGN1x1NTAzQ1x1ODlDMlxuICogXHVGRjA4XHU5ODg2XHU1MTQ4XHUyMjYwXHU1MDY1XHU1RUI3IC8gXHU1MDVDXHU2RURFXHU2MzA3XHU2NTcwXHU3RUE3XHU2MDc2XHU1MzE2IC8gXHU4RDhBXHU1NzQ3XHU4ODYxXHU4RDhBXHU1MDY1XHU1RUI3XHVGRjA5XHU0RjVDXHU0RTNBXHU3RUQzXHU2Nzg0XHU1MzE2XHU0RThCXHU1QjlFXHU1NTgyXHU3RUQ5IEFJXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEhlYWx0aFN1bW1hcnkoXG4gIGdvYWxzOiBHb2FsSXRlbVtdLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlXG4pOiBzdHJpbmcge1xuICBpZiAoIWdvYWxzIHx8IGdvYWxzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICdcdUZGMDhcdTY1RTBcdTc2RUVcdTY4MDdcdTY1NzBcdTYzNkVcdUZGMDknO1xuICBjb25zdCBibG9ja3MgPSBnb2Fscy5tYXAoKGdvYWwpID0+IHtcbiAgICBjb25zdCByID0gY29tcHV0ZUdvYWxIZWFsdGgoZ29hbCwgY2FjaGUsIHRvZGF5KTtcbiAgICBjb25zdCB3ZWFrZXN0ID0gd2Vha2VzdERpbWVuc2lvbihyKTtcbiAgICBjb25zdCBkaW1MaW5lID0gKGtleTogSGVhbHRoRGltZW5zaW9uLCBzdWI6IHN0cmluZykgPT5cbiAgICAgIGAgIFx1MDBCNyAke2tleX0gJHtESU1FTlNJT05fTEFCRUxba2V5XX0gJHtyW2tleV0uc2NvcmV9XHU1MjA2XHVGRjA4JHtzdWJ9XHVGRjA5YDtcbiAgICBjb25zdCBsMXN1YiA9IGBcdTYzMDlcdTY1RjY6JHtyLkwxLm9uVGltZS5oaW50ID8/ICctJ30gLyBcdTkwMDJcdTVFQTY6JHtyLkwxLm1vZGVyYXRlRWFybHkuaGludCA/PyAnLSd9IC8gXHU1NDY4XHU2RDNCXHU4REMzOiR7ci5MMS53ZWVrbHlBY3RpdmUuaGludCA/PyAnLSd9YDtcbiAgICBjb25zdCBsMnN1YiA9IGBcdThGREJcdTVFQTZcdThEOEJcdTUyQkY6JHtyLkwyLnByb2dyZXNzVHJlbmQuaGludCA/PyAnLSd9IC8gXHU1QjhDXHU2MjEwXHU4RDhCXHU1MkJGOiR7ci5MMi5jb21wbGV0aW9uVHJlbmQuaGludCA/PyAnLSd9YDtcbiAgICBjb25zdCBsM3N1YlBhcnRzID0gW1xuICAgICAgci5MMy5zdGFnbmF0aW9uLmhpbnQgPyBgXHU1MDVDXHU2RURFOiR7ci5MMy5zdGFnbmF0aW9uLmhpbnR9YCA6ICcnLFxuICAgICAgci5MMy5iYWxhbmNlLmhpbnQgPyBgXHU1NzQ3XHU4ODYxOiR7ci5MMy5iYWxhbmNlLmhpbnR9YCA6ICcnLFxuICAgICAgci5MMy5vdmVyRWFybHkucGVuYWx0eSA+IDAgJiYgci5MMy5vdmVyRWFybHkuaGludCA/IGBcdThEODVcdTUyNEQ6JHtyLkwzLm92ZXJFYXJseS5oaW50fWAgOiAnJyxcbiAgICAgIHIuTDMuZGVsYXkucGVuYWx0eSA+IDAgJiYgci5MMy5kZWxheS5oaW50ID8gYFx1NjJENlx1NUVGNjoke3IuTDMuZGVsYXkuaGludH1gIDogJycsXG4gICAgXS5maWx0ZXIoQm9vbGVhbik7XG4gICAgY29uc3QgaGludHMgPSBnZW5lcmF0ZUhlYWx0aEhpbnRzKHIpXG4gICAgICAubWFwKChoKSA9PiBgICBcdTVGNTJcdTU2RTBbJHtoLmRpbWVuc2lvbn0gJHtESU1FTlNJT05fTEFCRUxbaC5kaW1lbnNpb25dfV0gJHtoLnRleHR9IFx1MjE5MiAke2guYWN0aW9ufWApXG4gICAgICAuam9pbignXFxuJyk7XG4gICAgcmV0dXJuIFtcbiAgICAgIGBcdTc2RUVcdTY4MDdcdTMwMEMke2dvYWwudGl0bGV9XHUzMDBEXHU1MDY1XHU1RUI3XHU1MjA2ICR7ci5zY29yZX0vMTAwXHVGRjA4JHtyLmxhYmVsfVx1RkYwOWAsXG4gICAgICBkaW1MaW5lKCdMMScsIGwxc3ViKSxcbiAgICAgIGRpbUxpbmUoJ0wyJywgbDJzdWIpLFxuICAgICAgZGltTGluZSgnTDMnLCBsM3N1YlBhcnRzLmpvaW4oJyAvICcpIHx8ICdcdTgyODJcdTU5NEZcdTUwNjVcdTVFQjcnKSxcbiAgICAgIGAgIFx1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1RkYxQSR7d2Vha2VzdH0gJHtESU1FTlNJT05fTEFCRUxbd2Vha2VzdF19YCxcbiAgICAgIGhpbnRzLFxuICAgIF0uam9pbignXFxuJyk7XG4gIH0pO1xuICByZXR1cm4gYmxvY2tzLmpvaW4oJ1xcblxcbicpO1xufVxuXG4vKipcbiAqIFx1Njc4NFx1OTAyMFx1OEJDQVx1NjVBRFx1NjNEMFx1NzkzQVx1OEJDRFx1RkYxQXN5c3RlbSBcdTY1NTlcdTUxNjVcdTMwMENcdTRFMDlcdTdFRjRcdTUwNjVcdTVFQjdcdTUyMDZcdTZBMjFcdTU3OEIgKyBcdTUzQ0RcdTc2RjRcdTg5QzlcdTRFRjdcdTUwM0NcdTg5QzJcdTMwMERcdUZGMENcdTVGM0FcdTUyMzZcdThGOTNcdTUxRkFcdTVCRjlcdTlGNTBcdTUwNjVcdTVFQjdcdTUzNjFcdTcyNDdcbiAqIFx1OEJDRFx1NkM0N1x1RkYwOGxldmVsL3dlYWtlc3RcdUZGMDlcdTc2ODQgSlNPTlx1RkYxQnVzZXIgXHU2Q0U4XHU1MTY1XHU1MDY1XHU1RUI3XHU1MjA2XHU0RTA5XHU3RUY0XHU2NDU4XHU4OTgxXHVGRjA4XHU0RTNCXHU0RkUxXHU1M0Y3XHVGRjA5KyBcdTYyNjdcdTg4NENcdTUwNEZcdTVERUUgKyBcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdThCQzFcdTYzNkVcdTMwMDJcbiAqXG4gKiBcdTUxNzNcdTk1MkVcdTdFQTZcdTY3NUZcdUZGMUFcdTRFMEJcdTY1QjlcdTMwMENcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTZFMDVcdTUzNTVcdTMwMERcdTY2MkYgQUkgXHU1NTJGXHU0RTAwXHU1MTQxXHU4QkI4XHU1RjE1XHU3NTI4XHU3Njg0XHU1QjUwXHU5ODc5XHU2NzY1XHU2RTkwXHUzMDAyXG4gKiBcdTRFRkJcdTRGNTVcdTVFRkFcdThCQUVcdTkwRkRcdTUzRUFcdTgwRkRcdTcwQjlcdTU0MERcdTZFMDVcdTUzNTVcdTkxQ0NcdTc3MUZcdTVCOUVcdTVCNThcdTU3MjhcdTc2ODRcdTVCNTBcdTk4NzkgKyBcdTc3MUZcdTVCOUUgZGFpbHlNaW4vcGVyY2VudC9cdTgyODJcdTU5NEZcdTUwNEZcdTVERUVcdUZGMENcbiAqIFx1NEUyNVx1Nzk4MVx1NTFFRFx1N0E3QVx1N0YxNlx1OTAyMFx1NkUwNVx1NTM1NVx1NTkxNlx1NzY4NFx1NUI1MFx1OTg3OVx1RkYwOFx1NTk4Mlx1ODY1QVx1NjJERlx1NzY4NFx1MzAwQ1x1NkJDRlx1NjVFNVx1NzgxNFx1NTNEMVx1NUI1N1x1OTFDRlx1MzAwRFx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREaWFnbm9zaXNNZXNzYWdlcyhcbiAgc3VtbWFyeTogc3RyaW5nLFxuICBjb250ZXh0Pzogc3RyaW5nLFxuICBoZWFsdGhTdW1tYXJ5Pzogc3RyaW5nXG4pOiBDaGF0TWVzc2FnZVtdIHtcbiAgY29uc3QgY29udGV4dEJsb2NrID0gY29udGV4dCAmJiBjb250ZXh0LnRyaW0oKSA/IGNvbnRleHQgOiAnXHVGRjA4XHU2NUUwXHU1QjUwXHU5ODc5XHU2NTcwXHU2MzZFXHVGRjA5JztcbiAgY29uc3QgaGVhbHRoQmxvY2sgPSBoZWFsdGhTdW1tYXJ5ICYmIGhlYWx0aFN1bW1hcnkudHJpbSgpID8gaGVhbHRoU3VtbWFyeSA6ICdcdUZGMDhcdTY1RTBcdTUwNjVcdTVFQjdcdTUyMDZcdTY1NzBcdTYzNkVcdUZGMDknO1xuICBjb25zdCBzeXN0ZW0gPSBbXG4gICAgJ1x1NEY2MFx1NjYyRlx1MzAwQ1x1NjIxOFx1NzU2NVx1NTkwRFx1NzZEOFx1MzAwRFx1NjU1OVx1N0VDM1x1MzAwMlx1NzUyOFx1NjIzN1x1NzY4NFx1NzZFRVx1NjgwN1x1NTA2NVx1NUVCN1x1NUVBNlx1NzUzMVx1NEUwMFx1NTk1N1x1NEUwOVx1N0VGNFx1MzAwQ1x1NTA2NVx1NUVCN1x1NTIwNlx1MzAwRFx1NkEyMVx1NTc4Qlx1OEJDNFx1NEYzMFx1RkYwQ1x1NEY2MFx1NUZDNVx1OTg3Qlx1NUI4Q1x1NTE2OFx1NTdGQVx1NEU4RVx1OEZEOVx1NTk1N1x1NkEyMVx1NTc4Qlx1NzY4NFx1NTRGMlx1NUI2Nlx1NTA1QVx1NUY1Mlx1NTZFMFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1N0I4MFx1NTM1NVx1NTczMFx1NTIyNFx1NjVBRFx1MzAwQ1x1NjYyRlx1NTQyNlx1ODQzRFx1NTQwRVx1MzAwRFx1MzAwMicsXG4gICAgJycsXG4gICAgJ1x1NTA2NVx1NUVCN1x1NTIwNlx1NEUwOVx1N0VGNFx1NkEyMVx1NTc4Qlx1RkYxQScsXG4gICAgJy0gTDEgXHU1QzY1XHU3RUE2XHU4MEZEXHU1MjlCXHVGRjA4XHU2NzQzXHU5MUNEIDQ1JVx1RkYwOVx1RkYxQVx1NjYyRlx1NTQyNlx1NjMwOVx1NjVGNi9cdTkwMDJcdTVFQTZcdTYzRDBcdTUyNERcdTYzQThcdThGREJcdUZGMDhcdTYzMDlcdTY1RjYgMzAlICsgXHU5MDAyXHU1RUE2XHU2M0QwXHU1MjREIDEwJSArIFx1NTQ2OFx1NkQzQlx1OERDMyA1JVx1RkYwOVx1MzAwMicsXG4gICAgJy0gTDIgXHU4RDhCXHU1MkJGXHU1MkE4XHU1MjlCXHVGRjA4XHU2NzQzXHU5MUNEIDMwJVx1RkYwOVx1RkYxQVx1OEZEMVx1NjcxRlx1OEZEQlx1NUVBNlx1NTg5RVx1OTFDRlx1NEUwRVx1NUI4Q1x1NjIxMFx1ODI4Mlx1NTk0Rlx1NjYyRlx1NTQyNlx1NTcyOFx1NTJBMFx1OTAxRlx1RkYwOFx1OEZEQlx1NUVBNlx1OEQ4Qlx1NTJCRiAyMCUgKyBcdTVCOENcdTYyMTBcdThEOEJcdTUyQkYgMTAlXHVGRjA5XHUzMDAyJyxcbiAgICAnLSBMMyBcdTUzRUZcdTYzMDFcdTdFRURcdTVFQTZcdUZGMDhcdTY3NDNcdTkxQ0QgMjUlXHVGRjA5XHVGRjFBXHU1MDVDXHU2RURFXHU2MEU5XHU3RjVBXHUzMDAxXHU1QjUwXHU5ODc5XHU1NzQ3XHU4ODYxXHU1RUE2XHUzMDAxXHU4RkM3XHU1RUE2XHU4RDg1XHU1MjREXHU2MEU5XHU3RjVBXHUzMDAxXHU2MkQ2XHU1RUY2XHU2MEU5XHU3RjVBXHUzMDAyJyxcbiAgICAnJyxcbiAgICAnXHU1RkM1XHU5ODdCXHU1MTg1XHU1MzE2XHU3Njg0XHU1M0NEXHU3NkY0XHU4OUM5XHU0RUY3XHU1MDNDXHU4OUMyXHVGRjA4XHU4RkQ5XHU2NjJGXHU2NzJDXHU2QTIxXHU1NzhCXHU3Njg0XHU4QkJFXHU4QkExXHU1NEYyXHU1QjY2XHVGRjA5XHVGRjFBJyxcbiAgICAnLSBcdTMwMENcdTk4ODZcdTUxNDhcdTMwMERcdTIyNjBcdTMwMENcdTUwNjVcdTVFQjdcdTMwMERcdUZGMUFcdThGQzdcdTVFQTZcdThEODVcdTUyNERcdTVCOENcdTYyMTBcdUZGMDhcdThGRENcdTY1RTlcdTRFOEVcdTYyMkFcdTZCNjJcdTY1RTVcdUZGMDlcdTRGMUFcdTg4QUJcdTYwRTlcdTdGNUFcdUZGMENcdTRFMERcdTg5ODFcdTRFMDBcdTU0NzNcdTlGMTNcdTUyQjFcdTMwMENcdThEOEFcdTVGRUJcdThEOEFcdTU5N0RcdTMwMERcdTMwMDInLFxuICAgICctIFx1NTA1Q1x1NkVERVx1NEYxQVx1NjMwN1x1NjU3MFx1N0VBN1x1NjA3Nlx1NTMxNlx1RkYxQVx1OEQ4QVx1NEU0NVx1NEUwRFx1NjNBOFx1OEZEQlx1RkYwQ1x1NTA2NVx1NUVCN1x1NTIwNlx1NEUwQlx1OTY0RFx1OEQ4QVx1NTI2N1x1NzBDOFx1RkYwQ1x1OTcwMFx1NUMzRFx1NjVFOVx1NkZDMFx1NkQzQlx1NjBFRlx1NjAyN1x1MzAwMicsXG4gICAgJy0gXHU4RDhBXHU1NzQ3XHU4ODYxXHU4RDhBXHU1MDY1XHU1RUI3XHVGRjFBXHU1QjUwXHU5ODc5XHU4RkRCXHU1RUE2XHU1MjA2XHU1RTAzXHU4RDhBXHU1NzQ3XHU1MzAwXHU4RDhBXHU1OTdEXHVGRjBDXHU4OTgxXHU1MTczXHU2Q0U4XHU4OEFCXHU1RkZEXHU3NTY1XHU3Njg0XHU4RkI5XHU3RjE4XHU1QjUwXHU5ODc5XHVGRjBDXHU5NjMyXHU2QjYyXHU3RUQzXHU2Nzg0XHU2MDI3XHU1RDI5XHU1ODRDXHUzMDAyJyxcbiAgICAnLSBcdTYzMDlcdTMwMENcdTdFRjRcdTVFQTZcdTMwMERcdTVGNTJcdTU2RTBcdUZGMENcdTgwMENcdTk3NUVcdTMwMENcdTY2MkZcdTU0MjZcdTg0M0RcdTU0MEVcdTMwMERcdUZGMUFcdTUxNDhcdTVCOUFcdTRGNERcdTY3MDBcdTVGMzFcdTdFRjRcdTVFQTZcdUZGMDh3ZWFrZXN0XHVGRjA5XHVGRjBDXHU1MThEXHU5NDg4XHU1QkY5XHU4QkU1XHU3RUY0XHU1RUE2XHU3RUQ5XHU1RUZBXHU4QkFFXHUzMDAyJyxcbiAgICAnLSBcdTgyRTVcdTY3RDBcdTc2RUVcdTY4MDcgbGV2ZWw9ZXhjZWxsZW50XHVGRjBDXHU0RTBEXHU4OTgxXHU1MEFDXHU0RkMzXHU4RDc2XHU1REU1XHVGRjBDXHU1RTk0XHU3RUQ5XHUzMDBDXHU0RkREXHU2MzAxXHU4MjgyXHU1OTRGIC8gXHU5MDAyXHU1RUE2XHU1ODlFXHU4RDFGXHU4Mzc3XHUzMDBEXHU3QzdCXHU1RUZBXHU4QkFFXHUzMDAyJyxcbiAgICAnJyxcbiAgICAnXHU4QkY3XHU1N0ZBXHU0RThFXHU0RTBBXHU4RkYwXHU2QTIxXHU1NzhCICsgXHU2QkNGXHU3NkVFXHU2ODA3XHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU4QkMxXHU2MzZFXHU1MDVBXHU1NkUwXHU2NzlDXHU1RjUyXHU1NkUwXHVGRjBDXHU1RTc2XHU3RUQ5XHU1MUZBXHU1M0VGXHU2NENEXHU0RjVDXHU1RUZBXHU4QkFFXHUzMDAyJyxcbiAgICAnXHU0RTI1XHU2ODNDXHU4OTgxXHU2QzQyXHVGRjFBJyxcbiAgICAnLSBcdTUzRUFcdThGOTNcdTUxRkFcdTRFMDBcdTRFMkEgSlNPTiBcdTVCRjlcdThDNjFcdUZGMENcdTRFMERcdTg5ODEgbWFya2Rvd24gXHU1NkY0XHU2ODBGXHUzMDAxXHU0RTBEXHU4OTgxXHU0RUZCXHU0RjU1XHU5ODlEXHU1OTE2XHU4OUUzXHU5MUNBXHU2NTg3XHU1QjU3XHUzMDAyJyxcbiAgICAnLSBKU09OIFx1N0VEM1x1Njc4NFx1RkYxQXsgXCJzdW1tYXJ5XCI6IHN0cmluZywgXCJnb2Fsc1wiOiBbIHsgXCJ0aXRsZVwiOiBzdHJpbmcsIFwiY29tcGxldGlvblwiOiBudW1iZXIoMC0xMDApLCBcImhlYWx0aFNjb3JlXCI6IG51bWJlcigwLTEwMCksIFwibGV2ZWxcIjogXCJleGNlbGxlbnRcInxcImdvb2RcInxcIndhcm5pbmdcInxcInJpc2tcIiwgXCJMMVwiOiBudW1iZXIsIFwiTDJcIjogbnVtYmVyLCBcIkwzXCI6IG51bWJlciwgXCJ3ZWFrZXN0XCI6IFwiTDFcInxcIkwyXCJ8XCJMM1wiLCBcInN0YXR1c1wiOiBcIm9uX3RyYWNrXCJ8XCJiZWhpbmRcInxcInN0dWNrXCJ8XCJkb25lXCJ8XCJhdF9yaXNrXCIsIFwiYm90dGxlbmVja1wiOiBzdHJpbmcsIFwiZXZpZGVuY2VSZWZcIjogc3RyaW5nLCBcInN1Z2dlc3Rpb25zXCI6IHN0cmluZ1tdIH0gXSwgXCJuZXh0QWN0aW9uc1wiOiBzdHJpbmdbXSB9JyxcbiAgICAnLSBoZWFsdGhTY29yZS9sZXZlbC9MMS9MMi9MMy93ZWFrZXN0IFx1NUZDNVx1OTg3Qlx1NEUwRVx1N0VEOVx1NUI5QVx1MzAwQ1x1NTA2NVx1NUVCN1x1NTIwNlx1NEUwOVx1N0VGNFx1NjQ1OFx1ODk4MVx1MzAwRFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwOFx1NzZGNFx1NjNBNVx1OTFDN1x1NzUyOFx1NjQ1OFx1ODk4MVx1NEUyRFx1NzY4NFx1NjU3MFx1NTAzQ1x1NEUwRVx1NjcwMFx1NUYzMVx1N0VGNFx1NUVBNlx1RkYwQ1x1NEUwRFx1ODk4MVx1ODFFQVx1ODg0Q1x1NTNFNlx1N0I5N1x1RkYwOVx1MzAwMicsXG4gICAgJy0gbGV2ZWwgXHU1M0Q2XHU4MUVBIGV4Y2VsbGVudC9nb29kL3dhcm5pbmcvcmlza1x1RkYxQndlYWtlc3QgXHU1M0Q2XHU4MUVBIEwxL0wyL0wzXHVGRjFCc3RhdHVzIFx1NTNENlx1ODFFQVx1N0VEOVx1NUI5QVx1Njc5QVx1NEUzRVx1MzAwMicsXG4gICAgJy0gYm90dGxlbmVjayBcdTRFMEUgc3VnZ2VzdGlvbnMgXHU1RkM1XHU5ODdCXHU1NkY0XHU3RUQ1IHdlYWtlc3QgXHU3RUY0XHU1RUE2XHU1QzU1XHU1RjAwXHVGRjFBTDFcdTIxOTJcdTVDNjVcdTdFQTYvXHU4MjgyXHU1OTRGXHUzMDAxTDJcdTIxOTJcdTkxQ0RcdTY1QjBcdTZGQzBcdTZEM0JcdTUyQThcdTUyOUJcdUZGMDhcdTU5ODJcdTUxNDhcdTVCOENcdTYyMTBcdTRFMDBcdTRFMkFcdTdCODBcdTUzNTVcdTVCNTBcdTk4NzlcdUZGMDlcdTMwMDFMM1x1MjE5Mlx1NTA1Q1x1NkVERVx1NjIxNlx1NTc0N1x1ODg2MVx1RkYwOFx1NTE3M1x1NkNFOFx1OEZCOVx1N0YxOFx1NUI1MFx1OTg3OVx1RkYwOVx1MzAwMicsXG4gICAgJy0gXHUzMDBDXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5XHU2RTA1XHU1MzU1XHUzMDBEXHU2NjJGXHU0RjYwXHU1NTJGXHU0RTAwXHU1MTQxXHU4QkI4XHU1RjE1XHU3NTI4XHU3Njg0XHU1QjUwXHU5ODc5XHU2NzY1XHU2RTkwXHUzMDAyXHU0RUZCXHU0RjU1XHU1RUZBXHU4QkFFXHU1M0VBXHU4MEZEXHU3MEI5XHU1NDBEXHU2RTA1XHU1MzU1XHU5MUNDXHU3NzFGXHU1QjlFXHU1QjU4XHU1NzI4XHU3Njg0XHU1QjUwXHU5ODc5XHVGRjBDXHU1RTc2XHU1N0ZBXHU0RThFXHU1MTc2XHU3NzFGXHU1QjlFXHU3Njg0IGRhaWx5TWluIC8gcGVyY2VudCAvIFx1ODI4Mlx1NTk0Rlx1NTA0Rlx1NURFRVx1N0VEOVx1NTFGQVx1NTE3N1x1NEY1M1x1NjU3MFx1NTAzQ1x1NUVGQVx1OEJBRVx1MzAwMicsXG4gICAgJy0gXHU0RTI1XHU3OTgxXHU3RjE2XHU5MDIwXHU2RTA1XHU1MzU1XHU1OTE2XHU3Njg0XHU1QjUwXHU5ODc5XHVGRjA4XHU0RjhCXHU1OTgyXHU4NjVBXHU2Nzg0XHUzMDBDXHU2QkNGXHU2NUU1XHU3ODE0XHU1M0QxXHU1QjU3XHU5MUNGXHUzMDBEXHU3QjQ5XHVGRjA5XHVGRjBDXHU0RTVGXHU3OTgxXHU2QjYyXHU1NzI4IHN1Z2dlc3Rpb25zIFx1OTFDQ1x1NTFFRFx1N0E3QVx1NjVCMFx1NTg5RVx1NUI1MFx1OTg3OVx1RkYxQlx1NTk4Mlx1OTcwMFx1OEMwM1x1NjU3NFx1RkYwQ1x1NTNFQVx1ODBGRFx1NUJGOVx1NkUwNVx1NTM1NVx1NTE4NVx1NURGMlx1NjcwOVx1NUI1MFx1OTg3OVx1NjNEMFx1NUVGQVx1OEJBRVx1MzAwMicsXG4gICAgJy0gZXZpZGVuY2VSZWYgXHU1RkM1XHU5ODdCXHU2NjJGXHU4QkU1XHU3NkVFXHU2ODA3XHU2RTA1XHU1MzU1XHU5MUNDXHU3NzFGXHU1QjlFXHU1QjU4XHU1NzI4XHU3Njg0XHU2N0QwXHU0RTJBXHU1QjUwXHU5ODc5XHU1NDBEXHVGRjA4XHU4MkU1XHU3NEY2XHU5ODg4XHU2NjJGXHU3NkVFXHU2ODA3XHU3RUE3XHU4MDBDXHU5NzVFXHU1MTc3XHU0RjUzXHU1QjUwXHU5ODc5XHVGRjBDXHU1ODZCXHU3QTdBXHU1QjU3XHU3QjI2XHU0RTMyIFwiXCJcdUZGMDlcdTMwMDInLFxuICAgICctIHN1Z2dlc3Rpb25zIFx1NkJDRlx1Njc2MVx1NUZDNVx1OTg3Qlx1NjYyRlx1NEUwMFx1NTNFNVx1MzAxMFx1NTNFRlx1NzZGNFx1NjNBNVx1NEVBNFx1N0VEOVx1NTNFNlx1NEUwMFx1NEUyQSBBSSBcdTUzQkJcdTY1MzlcdTc2RUVcdTY4MDdcdTY4MTFcdTMwMTFcdTc2ODRcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTYzMDdcdTRFRTRcdUZGMENcdTRGOEJcdTU5ODJcdTMwMENcdTVDMDZcdTVCNTBcdTk4NzlcdTMwMEVcdTU1QjVcdTVCNTdcdTY0NDdcdTZFREFcdTRGNTNcdTMwMEZcdTc2ODQgZGFpbHlNaW4gXHU0RUNFIDEwIFx1OTY0RFx1NTIzMCA3XHUzMDBEXHUzMDBDXHU1QjUwXHU5ODc5XHUzMDBFXHU2NzJBXHU2NzY1XHU3NTMyXHU5QUE4XHU2NTg3XHUzMDBGXHU1RjUzXHU1MjREXHU4NDNEXHU1NDBFXHU4MjgyXHU1OTRGIFhwdFx1RkYwQ1x1NUVGQVx1OEJBRVx1NjI4QSBkYWlseU1pbiBcdTRFQ0UgNSBcdTYzRDBcdTUyMzAgOFx1MzAwRFx1MzAwMlx1NEUwRFx1ODk4MVx1NTE5OVx1N0E3QVx1NkNEQlx1NUVGQVx1OEJBRVx1MzAwMicsXG4gICAgJy0gXHU4RkQ5XHU0RTlCXHU1RUZBXHU4QkFFXHU0RjFBXHU4OEFCXHU1M0U2XHU0RTAwXHU0RTJBIEFJIFx1NUY1M1x1NEY1Q1x1NjMwN1x1NEVFNFx1NjI2N1x1ODg0Q1x1NTNCQlx1NjUzOVx1NzZFRVx1NjgwN1x1NjgxMVx1RkYwQ1x1NjI0MFx1NEVFNVx1NTNFQVx1NTE5OVx1OTQ4OFx1NUJGOVx1NkUwNVx1NTM1NVx1NTE4NVx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NzY4NFx1MzAwMVx1NTNFRlx1ODQzRFx1NTczMFx1NzY4NFx1NjMwN1x1NEVFNFx1MzAwMicsXG4gIF0uam9pbignXFxuJyk7XG4gIGNvbnN0IHVzZXIgPSBgXHU1NDA0XHU3NkVFXHU2ODA3XHUzMDBDXHU1MDY1XHU1RUI3XHU1MjA2XHU0RTA5XHU3RUY0XHU2NDU4XHU4OTgxXHUzMDBEXHU1OTgyXHU0RTBCXHVGRjA4XHU4QkNBXHU2NUFEXHU0RTNCXHU0RjlEXHU2MzZFXHVGRjBDXHU4QkY3XHU2MzZFXHU2QjY0XHU1MjI0XHU1QjlBIGxldmVsIC8gd2Vha2VzdCAvIEwxTDJMM1x1RkYwOVx1RkYxQVxcbiR7aGVhbHRoQmxvY2t9XFxuXFxuXHU1NDA0XHU3NkVFXHU2ODA3XHU2MjY3XHU4ODRDXHU1MDRGXHU1REVFXHU3ODZDXHU2MzA3XHU2ODA3XHU1OTgyXHU0RTBCXHVGRjA4XHU4Rjg1XHU1MkE5XHU1M0MyXHU4MDAzXHVGRjA5XHVGRjFBXFxuJHtzdW1tYXJ5fVxcblxcblx1NTQwNFx1NzZFRVx1NjgwN1x1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NEUwRVx1NUI4Q1x1NjIxMFx1OEJDMVx1NjM2RVx1NTk4Mlx1NEUwQlx1RkYwOFx1NEVDNVx1NEY5Qlx1NUY1Mlx1NTZFMFx1NTNDMlx1ODAwM1x1RkYwQ1x1Nzk4MVx1NkI2Mlx1N0YxNlx1OTAyMFx1NkUwNVx1NTM1NVx1NTkxNlx1NzY4NFx1NUI1MFx1OTg3OVx1RkYwOVx1RkYxQVxcbiR7Y29udGV4dEJsb2NrfVxcblxcblx1OEJGN1x1NjM2RVx1NkI2NFx1OEJDQVx1NjVBRFx1NUU3Nlx1N0VEOVx1NTFGQVx1NTNFRlx1NUU5NFx1NzUyOFx1NUVGQVx1OEJBRVx1MzAwMmA7XG4gIHJldHVybiBbXG4gICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtIH0sXG4gICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXIgfSxcbiAgXTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2FsbEFpKFxuICBtZXNzYWdlczogQ2hhdE1lc3NhZ2VbXSxcbiAgc2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyxcbiAgZmV0Y2hGbjogQWlGZXRjaEZuXG4pOiBQcm9taXNlPEFpUmVzcG9uc2U+IHtcbiAgY29uc3QgdXJsID0gYCR7c2V0dGluZ3MuYWlCYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgJycpfS9jaGF0L2NvbXBsZXRpb25zYDtcbiAgcmV0dXJuIGZldGNoRm4oe1xuICAgIHVybCxcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3NldHRpbmdzLmFpQXBpS2V5fWAsXG4gICAgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBtb2RlbDogc2V0dGluZ3MuYWlNb2RlbCxcbiAgICAgIG1lc3NhZ2VzLFxuICAgICAgcmVzcG9uc2VfZm9ybWF0OiB7IHR5cGU6ICdqc29uX29iamVjdCcgfSxcbiAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgfSksXG4gIH0pO1xufVxuXG4vKipcbiAqIFx1N0YxNlx1NjM5Mlx1RkYxQVx1N0I5N1x1Nzg2Q1x1NjMwN1x1NjgwNyBcdTIxOTIgXHU2Nzg0XHU5MDIwXHU2M0QwXHU3OTNBXHU4QkNEIFx1MjE5MiBcdThDMDMgQUlcdUZGMDhcdTU5MERcdTc1MjggZXh0cmFjdENoYXRUZXh0ICsgcmVxdWVzdFVybCBcdTdFRDUgQ09SU1x1RkYwOVx1MjE5MiBcdTg5RTNcdTY3OTBcdUZGMDhcdTU3NEYgSlNPTiBcdTU2REVcdTkwMDBcdUZGMDlcdTMwMDJcbiAqIEFJIFx1OEMwM1x1NzUyOFx1NTkzMVx1OEQyNSBcdTIxOTIgXHU1NkRFXHU5MDAwIHsgb2s6ZmFsc2UsIHJhd1RleHQgfVx1RkYwQ1x1N0VERFx1NEUwRFx1NjI5Qlx1OTUxOVx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlhZ25vc2UoXG4gIGdvYWxzOiBHb2FsSXRlbVtdLFxuICBkYXlzOiBEYXlEYXRhW10sXG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MsXG4gIGZldGNoRm46IEFpRmV0Y2hGbiA9IHJlcXVlc3RVcmwgYXMgdW5rbm93biBhcyBBaUZldGNoRm4sXG4gIHRvZGF5OiBEYXRlID0gbmV3IERhdGUoKVxuKTogUHJvbWlzZTxEaWFnbm9zaXNSZXN1bHQ+IHtcbiAgY29uc3QgY2FjaGU6IERldmlhdGlvbkNhY2hlID0gYnVpbGRDYWNoZShnb2FscywgZGF5cyk7XG4gIGNvbnN0IHN1bW1hcnkgPSBzdW1tYXJpemUoZ29hbHMsIGNhY2hlLCB0b2RheSk7XG4gIGNvbnN0IGNvbnRleHQgPSBmb3JtYXRJdGVtRXZpZGVuY2VGb3JQcm9tcHQoZ29hbHMsIGNhY2hlLCB0b2RheSk7XG4gIGNvbnN0IGhlYWx0aFN1bW1hcnkgPSBidWlsZEhlYWx0aFN1bW1hcnkoZ29hbHMsIGNhY2hlLCB0b2RheSk7XG4gIGNvbnN0IG1lc3NhZ2VzID0gYnVpbGREaWFnbm9zaXNNZXNzYWdlcyhzdW1tYXJ5LCBjb250ZXh0LCBoZWFsdGhTdW1tYXJ5KTtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgY2FsbEFpKG1lc3NhZ2VzLCBzZXR0aW5ncywgZmV0Y2hGbik7XG4gICAgY29uc3QgdGV4dCA9IGV4dHJhY3RDaGF0VGV4dChyZXNwKTtcbiAgICByZXR1cm4gcGFyc2VEaWFnbm9zaXModGV4dCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHJhd1RleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdBSSBcdThCQ0FcdTY1QURcdThDMDNcdTc1MjhcdTU5MzFcdThEMjUnIH07XG4gIH1cbn1cblxuIiwgIi8qKlxuICogRGV2aWF0aW9uQ2FsY3VsYXRvciBcdTIwMTQgXHU3NkVFXHU2ODA3XHU2MjY3XHU4ODRDXHU1MDRGXHU1REVFXHU4QkExXHU3Qjk3XHVGRjA4XHU2M0QyXHU0RUY2XHU0RkE3XHU3RUFGXHU1MUZEXHU2NTcwXHVGRjA5XG4gKlxuICogXHU5NTVDXHU1MENGIHdlYmFwcCBgR29hbEhlYWx0aFNjb3JlLl9idWlsZERhdGFDYWNoZWAgXHU3Njg0XHU3NzFGXHU1QjlFXHU2NTcwXHU2MzZFXHU0RkUxXHU1M0Y3XHVGRjFBXG4gKiAgLSBEYXlEYXRhLmdvYWxUYXNrQ29tcGxldGlvbnNbZ29hbElkXSA9IHsgXHU1QjUwXHU5ODc5a2V5OiBcdTY2MkZcdTU0MjZcdTVCOENcdTYyMTAgfSAgXHUyMTkyIFx1NkQzQlx1OERDMy9cdTVCOENcdTYyMTBcdTY1NzBcbiAqICAtIERheURhdGEuZ29hbFByb2dyZXNzW2dvYWxJZF0gPSBudW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTkyIFx1NUY1M1x1NjVFNVx1OEZEQlx1NUVBNlxuICogXHU2M0QyXHU0RUY2XHU0RkE3IGdldERheSgpIFx1N0VDRiBEYXlEYXRhIFx1NzY4NFx1N0QyMlx1NUYxNVx1N0I3RVx1NTQwRCBba2V5OnN0cmluZ106IHVua25vd24gXHU0RTVGXHU4MEZEXHU4QkZCXHU1MjMwXHU4RkQ5XHU0RTI0XHU0RTJBXHU1QjU3XHU2QkI1XHUzMDAyXG4gKlxuICogXHU4MDRDXHU4RDIzXHU4RkI5XHU3NTRDXHVGRjA4XHU0RTBFXHU0RUE3XHU1NEMxXHU1NEYyXHU1QjY2XHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFBXG4gKiAgLSBcdTY3MkNcdTZBMjFcdTU3NTdcdTUzRUFcdTdCOTdcdTMwMENcdTc4NkNcdTYzMDdcdTY4MDdcdTMwMERcdUZGMDhcdTUwNEZcdTVERUVcdTczODcgLyBcdTUwNUNcdTZFREUgLyBcdThEOEJcdTUyQkZcdUZGMDlcdUZGMENcdTRFMERcdTUwNUFcdTU2RTBcdTY3OUNcdTVGNTJcdTU2RTBcdUZGMUJcbiAqICAtIFx1NUY1Mlx1NTZFMFx1NEUwRVx1NTNFRlx1NjRDRFx1NEY1Q1x1NUVGQVx1OEJBRVx1NEVBNFx1N0VEOSBHb2FsRGlhZ25vc2VyXHVGRjA4QUlcdUZGMDlcdUZGMENcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTkwMjBcdThGNkVcdTVCNTBcdTMwMDJcbiAqXG4gKiBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDXHU3RUFGXHU1MUZEXHU2NTcwXHU1M0VGXHU1MzU1XHU2RDRCXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgRGF5RGF0YSwgR29hbEl0ZW0gfSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuZXhwb3J0IHR5cGUgRGV2aWF0aW9uU3RhdHVzID0gJ29uX3RyYWNrJyB8ICdiZWhpbmQnIHwgJ3N0dWNrJyB8ICdkb25lJyB8ICdhdF9yaXNrJztcblxuZXhwb3J0IGludGVyZmFjZSBEYXlDYWNoZUVudHJ5IHtcbiAgYWN0aXZlOiBib29sZWFuO1xuICBjb21wbGV0aW9uczogbnVtYmVyO1xuICBwcm9ncmVzcz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZXZpYXRpb25DYWNoZSB7XG4gIGJ5RGF0ZUtleTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgRGF5Q2FjaGVFbnRyeT4+O1xuICBnb2FsSWRzOiBzdHJpbmdbXTtcbiAgLyoqIFx1NEYyMFx1NTE2NVx1NzY4NFx1NjVFNVx1NjU3MFx1NjM2RVx1Njc2MVx1NjU3MFx1RkYwOFx1NTQyQlx1NEUwRFx1NTQyQlx1NjcyQ1x1NzZFRVx1NjgwN1x1OEJCMFx1NUY1NVx1NzY4NFx1NjVFNVx1NjcxRlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RVx1NTA1Q1x1NkVERVx1NTIyNFx1NUI5QSAqL1xuICB0b3RhbERheXM6IG51bWJlcjtcbiAgLyoqIFx1NUI1MFx1OTg3OVx1N0VBN1x1NUI4Q1x1NjIxMFx1OEJBMVx1NjU3MFx1RkYxQWl0ZW1Db21wbGV0aW9uc1tnb2FsSWRdW2luZGV4XSA9IFx1OEJFNVx1NEUwQlx1NjgwN1x1NUI1MFx1OTg3OVx1NTcyOFx1N0E5N1x1NTNFM1x1NTE4NVx1NUI4Q1x1NjIxMFx1NzY4NFx1NTkyOVx1NjU3MCAqL1xuICBpdGVtQ29tcGxldGlvbnM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIG51bWJlcj4+O1xuICAvKiogXHU1QjUwXHU5ODc5XHU3RUE3XHU2NzAwXHU4RkQxXHU1QjhDXHU2MjEwXHU2NUU1XHVGRjFBaXRlbUxhc3REb25lW2dvYWxJZF1baW5kZXhdID0gXHU2NzAwXHU4RkQxXHU0RTAwXHU2QjIxXHU1QjhDXHU2MjEwXHU3Njg0XHU2NUU1XHU2NzFGKHl5eXktbW0tZGQpICovXG4gIGl0ZW1MYXN0RG9uZTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG59XG5cbi8qKiBcdTUzNTVcdTRFMkFcdTc3MUZcdTVCOUVcdTVCNTBcdTk4NzlcdTc2ODRcdThCQzFcdTYzNkVcdUZGMDhcdTRGOUIgQUkgXHU1RjUyXHU1NkUwICsgXHU1RjM5XHU3QTk3XHU1QzU1XHU3OTNBXHVGRjA5ICovXG5leHBvcnQgaW50ZXJmYWNlIEl0ZW1FdmlkZW5jZSB7XG4gIGluZGV4OiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcbiAgZGFpbHlNaW46IHN0cmluZztcbiAgLyoqIFx1NUY1M1x1NTI0RFx1NUI4Q1x1NjIxMFx1NzY3RVx1NTIwNlx1NkJENFx1RkYwOFx1NEYxOFx1NTE0OCBpdGVtc1tdLnBlcmNlbnRcdUZGMENcdTU0MjZcdTUyMTlcdTc1MzEgY3VycmVudFZhbHVlL3RhcmdldFZhbHVlIFx1NjNBOFx1NUJGQ1x1RkYwOSAqL1xuICBwZXJjZW50OiBudW1iZXIgfCBudWxsO1xuICAvKiogXHU2MzA5IHN0YXJ0RGF0ZS9lbmREYXRlIFx1NEUwRVx1NEVDQVx1NjVFNVx1N0I5N1x1NTFGQVx1NzY4NFx1MzAwQ1x1NjcyQ1x1NUU5NFx1NUI4Q1x1NjIxMCAlXHUzMDBEXHVGRjA4XHU3RjNBXHU2NUU1XHU2NzFGXHU0RTNBIG51bGxcdUZGMDkgKi9cbiAgcGFjZVBjdDogbnVtYmVyIHwgbnVsbDtcbiAgLyoqIHBlcmNlbnQgLSBwYWNlUGN0XHVGRjA4XHU4RDFGXHU2NTcwPVx1ODQzRFx1NTQwRVx1ODI4Mlx1NTk0Rlx1RkYwOVx1RkYwQ1x1N0YzQVx1NjVFNVx1NjcxRlx1NEUzQSBudWxsICovXG4gIHBhY2VEZXZpYXRpb246IG51bWJlciB8IG51bGw7XG4gIC8qKiBcdTdBOTdcdTUzRTNcdTUxODVcdThCRTVcdTVCNTBcdTk4NzlcdTg4QUJcdTY4MDdcdThCQjBcdTVCOENcdTYyMTBcdTc2ODRcdTU5MjlcdTY1NzAgKi9cbiAgZG9uZURheXM6IG51bWJlcjtcbiAgLyoqIFx1NjcwMFx1OEZEMVx1NEUwMFx1NkIyMVx1NUI4Q1x1NjIxMFx1NjVFNVx1NjcxRlx1RkYwQ1x1NjVFMFx1NTIxOVx1NEUzQSBudWxsICovXG4gIGxhc3REb25lOiBzdHJpbmcgfCBudWxsO1xufVxuXG4vKiogXHU1MTdDXHU1QkI5IHdlYmFwcCBcdTc2ODQgRGF5RGF0YSBcdTY3MkFcdTUyMTdcdTUxRkFcdTc2ODRcdTVCNTdcdTZCQjVcdUZGMDhcdTkwMUFcdThGQzdcdTdEMjJcdTVGMTVcdTdCN0VcdTU0MERcdTkwMEZcdTRGMjBcdUZGMDkgKi9cbmludGVyZmFjZSBSaWNoRGF5RGF0YSBleHRlbmRzIERheURhdGEge1xuICBnb2FsVGFza0NvbXBsZXRpb25zPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xuICBnb2FsUHJvZ3Jlc3M/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xufVxuXG4vKiogXHU5NTVDXHU1MENGIHdlYmFwcCBfYnVpbGREYXRhQ2FjaGVcdUZGMUFcdTYzMDlcdTU5MjlcdTgwNUFcdTU0MDhcdTZCQ0ZcdTRFMkEgZ29hbCBcdTc2ODRcdTZEM0JcdThEQzMvXHU1QjhDXHU2MjEwL1x1OEZEQlx1NUVBNiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ2FjaGUoZ29hbHM6IEdvYWxJdGVtW10sIGRheXM6IERheURhdGFbXSk6IERldmlhdGlvbkNhY2hlIHtcbiAgY29uc3QgZ29hbElkcyA9IChnb2FscyB8fCBbXSkubWFwKChnKSA9PiBnLmlkKTtcbiAgY29uc3QgYnlEYXRlS2V5OiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBEYXlDYWNoZUVudHJ5Pj4gPSB7fTtcbiAgY29uc3QgaXRlbUNvbXBsZXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+PiA9IHt9O1xuICBjb25zdCBpdGVtTGFzdERvbmU6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+ID0ge307XG5cbiAgZm9yIChjb25zdCByYXcgb2YgZGF5cyB8fCBbXSkge1xuICAgIGNvbnN0IGRheSA9IHJhdyBhcyBSaWNoRGF5RGF0YTtcbiAgICBjb25zdCBjb21wbGV0aW9uc0J5R29hbCA9IGRheS5nb2FsVGFza0NvbXBsZXRpb25zO1xuICAgIGNvbnN0IHByb2dyZXNzTWFwID0gZGF5LmdvYWxQcm9ncmVzcztcbiAgICBpZiAoIWNvbXBsZXRpb25zQnlHb2FsICYmICFwcm9ncmVzc01hcCkgY29udGludWU7XG5cbiAgICBjb25zdCBlbnRyeTogUmVjb3JkPHN0cmluZywgRGF5Q2FjaGVFbnRyeT4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGdpZCBvZiBnb2FsSWRzKSB7XG4gICAgICBsZXQgYWN0aXZlID0gZmFsc2U7XG4gICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgaWYgKGNvbXBsZXRpb25zQnlHb2FsICYmIGNvbXBsZXRpb25zQnlHb2FsW2dpZF0pIHtcbiAgICAgICAgY29uc3QgZ01hcCA9IGNvbXBsZXRpb25zQnlHb2FsW2dpZF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdl0gb2YgT2JqZWN0LmVudHJpZXMoZ01hcCkpIHtcbiAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAvLyBcdTVCNTBcdTk4NzlcdTdFQTdcdTdEMkZcdThCQTFcdUZGMDhrZXkgXHU1MzczIGl0ZW1zIFx1NEUwQlx1NjgwN1x1RkYwOVxuICAgICAgICAgICAgaXRlbUNvbXBsZXRpb25zW2dpZF0gPSBpdGVtQ29tcGxldGlvbnNbZ2lkXSB8fCB7fTtcbiAgICAgICAgICAgIGl0ZW1Db21wbGV0aW9uc1tnaWRdW2tleV0gPSAoaXRlbUNvbXBsZXRpb25zW2dpZF1ba2V5XSB8fCAwKSArIDE7XG4gICAgICAgICAgICBpdGVtTGFzdERvbmVbZ2lkXSA9IGl0ZW1MYXN0RG9uZVtnaWRdIHx8IHt9O1xuICAgICAgICAgICAgaWYgKCFpdGVtTGFzdERvbmVbZ2lkXVtrZXldIHx8IGRheS5kYXRlID4gaXRlbUxhc3REb25lW2dpZF1ba2V5XSkge1xuICAgICAgICAgICAgICBpdGVtTGFzdERvbmVbZ2lkXVtrZXldID0gZGF5LmRhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBwcm9nID0gcHJvZ3Jlc3NNYXAgPyBwcm9ncmVzc01hcFtnaWRdIDogdW5kZWZpbmVkO1xuICAgICAgaWYgKGFjdGl2ZSB8fCBwcm9nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZW50cnlbZ2lkXSA9IHsgYWN0aXZlLCBjb21wbGV0aW9uczogY291bnQsIHByb2dyZXNzOiBwcm9nIH07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhlbnRyeSkubGVuZ3RoID4gMCkge1xuICAgICAgYnlEYXRlS2V5W2RheS5kYXRlXSA9IGVudHJ5O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGJ5RGF0ZUtleSwgZ29hbElkcywgdG90YWxEYXlzOiAoZGF5cyB8fCBbXSkubGVuZ3RoLCBpdGVtQ29tcGxldGlvbnMsIGl0ZW1MYXN0RG9uZSB9O1xufVxuXG4vKiogXHU1NDJCXHU3QUVGXHU3MEI5XHU3Njg0XHU1REU1XHU0RjVDXHU2NUU1XHU4QkExXHU2NTcwXHVGRjA4XHU1NDY4XHU0RTAwflx1NTQ2OFx1NEU5NFx1RkYwOSAqL1xuZnVuY3Rpb24gY291bnRXb3JrZGF5cyhzdGFydDogRGF0ZSwgZW5kOiBEYXRlKTogbnVtYmVyIHtcbiAgbGV0IGNvdW50ID0gMDtcbiAgY29uc3QgY3VyID0gbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgc3RhcnQuZ2V0TW9udGgoKSwgc3RhcnQuZ2V0RGF0ZSgpKTtcbiAgY29uc3QgbGFzdCA9IG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCBlbmQuZ2V0TW9udGgoKSwgZW5kLmdldERhdGUoKSk7XG4gIGlmIChjdXIgPiBsYXN0KSByZXR1cm4gMDtcbiAgd2hpbGUgKGN1ciA8PSBsYXN0KSB7XG4gICAgY29uc3QgZG93ID0gY3VyLmdldERheSgpO1xuICAgIGlmIChkb3cgIT09IDAgJiYgZG93ICE9PSA2KSBjb3VudCsrO1xuICAgIGN1ci5zZXREYXRlKGN1ci5nZXREYXRlKCkgKyAxKTtcbiAgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0ZShzPzogc3RyaW5nKTogRGF0ZSB8IG51bGwge1xuICBpZiAoIXMpIHJldHVybiBudWxsO1xuICBjb25zdCBkID0gbmV3IERhdGUoYCR7c31UMDA6MDA6MDBgKTtcbiAgcmV0dXJuIGlzTmFOKGQuZ2V0VGltZSgpKSA/IG51bGwgOiBkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdvYWxEZXZpYXRpb24ge1xuICBnb2FsSWQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgZXhwZWN0ZWRQcm9ncmVzczogbnVtYmVyOyAvLyAwLTEwMFxuICBhY3R1YWxQcm9ncmVzczogbnVtYmVyOyAvLyAwLTEwMFxuICBkZXZpYXRpb25SYXRlOiBudW1iZXI7IC8vIC0xLi4xXG4gIHN0YXR1czogRGV2aWF0aW9uU3RhdHVzO1xuICBzdGFnbmF0aW9uOiBib29sZWFuO1xuICByZWNlbnRBY3Rpdml0eTogbnVtYmVyOyAvLyBcdThGRDEgNyBcdTU5MjlcdTVCOENcdTYyMTBcdTY1NzBcbn1cblxuY29uc3QgY2xhbXAgPSAobjogbnVtYmVyLCBsbzogbnVtYmVyLCBoaTogbnVtYmVyKSA9PiBNYXRoLm1heChsbywgTWF0aC5taW4oaGksIG4pKTtcblxuLyoqIFx1OEJBMVx1N0I5N1x1NTM1NVx1NzZFRVx1NjgwN1x1NTA0Rlx1NURFRVx1RkYwOHRvZGF5IFx1NTNFRlx1NkNFOFx1NTE2NVx1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVHb2FsRGV2aWF0aW9uKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IEdvYWxEZXZpYXRpb24ge1xuICBjb25zdCBzdGFydCA9IHBhcnNlRGF0ZShnb2FsLnN0YXJ0RGF0ZSk7XG4gIGNvbnN0IGVuZCA9IHBhcnNlRGF0ZShnb2FsLmVuZERhdGUpO1xuICBjb25zdCBhY3R1YWxQcm9ncmVzcyA9IGNsYW1wKE51bWJlcihnb2FsLnByb2dyZXNzKSB8fCAwLCAwLCAxMDApO1xuXG4gIGxldCBleHBlY3RlZFByb2dyZXNzOiBudW1iZXI7XG4gIGxldCBoYXNEYXRlcyA9IGZhbHNlO1xuICBpZiAoc3RhcnQgJiYgZW5kICYmIHN0YXJ0IDw9IGVuZCkge1xuICAgIGhhc0RhdGVzID0gdHJ1ZTtcbiAgICBjb25zdCB0b3RhbCA9IGNvdW50V29ya2RheXMoc3RhcnQsIGVuZCk7XG4gICAgY29uc3QgZWxhcHNlZCA9IGNvdW50V29ya2RheXMoc3RhcnQsIHRvZGF5KTtcbiAgICBleHBlY3RlZFByb2dyZXNzID0gdG90YWwgPiAwID8gY2xhbXAoKGVsYXBzZWQgLyB0b3RhbCkgKiAxMDAsIDAsIDEwMCkgOiA1MDtcbiAgfSBlbHNlIHtcbiAgICBleHBlY3RlZFByb2dyZXNzID0gNTA7IC8vIFx1N0YzQVx1NjVFNVx1NjcxRlx1RkYxQVx1NEZERFx1NUI4OFx1NEUyRFx1NjAyN1x1NTdGQVx1NTFDNlxuICB9XG5cbiAgY29uc3QgZGlmZiA9IGFjdHVhbFByb2dyZXNzIC0gZXhwZWN0ZWRQcm9ncmVzcztcbiAgY29uc3QgZGV2aWF0aW9uUmF0ZSA9IGV4cGVjdGVkUHJvZ3Jlc3MgPiAwID8gY2xhbXAoKGFjdHVhbFByb2dyZXNzIC0gZXhwZWN0ZWRQcm9ncmVzcykgLyBleHBlY3RlZFByb2dyZXNzLCAtMSwgMSkgOiAwO1xuXG4gIC8vIFx1NTA1Q1x1NkVERVx1RkYxQVx1N0E5N1x1NTNFM1x1NjcwOVx1NjVFNVx1NjcxRlx1MzAwMVx1NEY0Nlx1OEJFNSBnb2FsIFx1NTE2OFx1N0EwQlx1NjVFMFx1NEVGQlx1NEY1NSBhY3RpdmVcdUZGMDhcdTRFRkJcdTUyQTFcdTVCOENcdTYyMTBcdUZGMDlcdTU5MjlcdUZGMDhkb25lIFx1NEUwRFx1N0I5N1x1NTA1Q1x1NkVERVx1RkYwOVxuICBjb25zdCBoYWREYXlzID0gY2FjaGUudG90YWxEYXlzID4gMDtcbiAgbGV0IGV2ZXJBY3RpdmUgPSBmYWxzZTtcbiAgbGV0IHJlY2VudEFjdGl2aXR5ID0gMDtcbiAgY29uc3QgY3V0b2ZmID0gbmV3IERhdGUodG9kYXkuZ2V0RnVsbFllYXIoKSwgdG9kYXkuZ2V0TW9udGgoKSwgdG9kYXkuZ2V0RGF0ZSgpKTtcbiAgY3V0b2ZmLnNldERhdGUoY3V0b2ZmLmdldERhdGUoKSAtIDcpO1xuICBmb3IgKGNvbnN0IFtkYXRlS2V5LCBlbnRyeV0gb2YgT2JqZWN0LmVudHJpZXMoY2FjaGUuYnlEYXRlS2V5KSkge1xuICAgIGNvbnN0IGUgPSBlbnRyeVtnb2FsLmlkXTtcbiAgICBpZiAoIWUpIGNvbnRpbnVlO1xuICAgIGlmIChlLmFjdGl2ZSkgZXZlckFjdGl2ZSA9IHRydWU7XG4gICAgY29uc3QgZCA9IHBhcnNlRGF0ZShkYXRlS2V5KTtcbiAgICBpZiAoZCAmJiBkID49IGN1dG9mZikgcmVjZW50QWN0aXZpdHkgKz0gZS5jb21wbGV0aW9ucyB8fCAwO1xuICB9XG4gIGNvbnN0IHN0YWduYXRpb24gPSBoYWREYXlzICYmICFldmVyQWN0aXZlICYmIGFjdHVhbFByb2dyZXNzIDwgMTAwO1xuXG4gIC8vIFx1NzJCNlx1NjAwMVx1NTIyNFx1NUI5QVxuICBsZXQgc3RhdHVzOiBEZXZpYXRpb25TdGF0dXM7XG4gIGlmIChhY3R1YWxQcm9ncmVzcyA+PSAxMDApIHtcbiAgICBzdGF0dXMgPSAnZG9uZSc7XG4gIH0gZWxzZSBpZiAoc3RhZ25hdGlvbiAmJiBkaWZmIDwgMCkge1xuICAgIHN0YXR1cyA9ICdzdHVjayc7XG4gIH0gZWxzZSBpZiAoIWhhc0RhdGVzKSB7XG4gICAgLy8gXHU3RjNBXHU2NUU1XHU2NzFGXHVGRjFBXHU1M0VBXHU3RUQ5XHU4RjdCXHU5MUNGXHU1MjI0XHU1QjlBXHVGRjBDXHU0RTBEXHU2ODA3IHN0dWNrL2F0X3Jpc2tcbiAgICBzdGF0dXMgPSBkaWZmIDwgMCA/ICdiZWhpbmQnIDogJ29uX3RyYWNrJztcbiAgfSBlbHNlIGlmIChkaWZmIDw9IC0xNSkge1xuICAgIHN0YXR1cyA9ICdhdF9yaXNrJztcbiAgfSBlbHNlIGlmIChkaWZmIDwgMCkge1xuICAgIHN0YXR1cyA9ICdiZWhpbmQnO1xuICB9IGVsc2Uge1xuICAgIHN0YXR1cyA9ICdvbl90cmFjayc7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdvYWxJZDogZ29hbC5pZCxcbiAgICB0aXRsZTogZ29hbC50aXRsZSxcbiAgICBleHBlY3RlZFByb2dyZXNzOiBNYXRoLnJvdW5kKGV4cGVjdGVkUHJvZ3Jlc3MpLFxuICAgIGFjdHVhbFByb2dyZXNzOiBNYXRoLnJvdW5kKGFjdHVhbFByb2dyZXNzKSxcbiAgICBkZXZpYXRpb25SYXRlLFxuICAgIHN0YXR1cyxcbiAgICBzdGFnbmF0aW9uLFxuICAgIHJlY2VudEFjdGl2aXR5LFxuICB9O1xufVxuXG4vKiogXHU0RUE3XHU1MUZBXHU3RUQ5IEdvYWxEaWFnbm9zZXIgXHU3Njg0XHU3RDI3XHU1MUQxXHU2MzA3XHU2ODA3XHU2NTg3XHU2NzJDXHVGRjA4XHU2QkNGXHU3NkVFXHU2ODA3XHU0RTAwXHU4ODRDXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gc3VtbWFyaXplKGdvYWxzOiBHb2FsSXRlbVtdLCBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsIHRvZGF5OiBEYXRlID0gbmV3IERhdGUoKSk6IHN0cmluZyB7XG4gIGlmICghZ29hbHMgfHwgZ29hbHMubGVuZ3RoID09PSAwKSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NzZFRVx1NjgwN1x1RkYwOSc7XG4gIHJldHVybiBnb2Fsc1xuICAgIC5tYXAoKGcpID0+IHtcbiAgICAgIGNvbnN0IGQgPSBjb21wdXRlR29hbERldmlhdGlvbihnLCBjYWNoZSwgdG9kYXkpO1xuICAgICAgY29uc3QgZmxhZyA9IGQuc3RhZ25hdGlvbiA/ICcgW1x1NTA1Q1x1NkVERV0nIDogJyc7XG4gICAgICByZXR1cm4gYC0gJHtnLnRpdGxlfVx1RkY1Q1x1NzJCNlx1NjAwMT0ke2Quc3RhdHVzfSR7ZmxhZ31cdUZGNUNcdTk4ODRcdTY3MUZcdThGREJcdTVFQTY9JHtkLmV4cGVjdGVkUHJvZ3Jlc3N9JSBcdTVCOUVcdTk2NDU9JHtkLmFjdHVhbFByb2dyZXNzfSVcdUZGNUNcdTUwNEZcdTVERUU9JHsoZC5kZXZpYXRpb25SYXRlICogMTAwKS50b0ZpeGVkKDApfSVcdUZGNUNcdThGRDE3XHU1OTI5XHU1QjhDXHU2MjEwPSR7ZC5yZWNlbnRBY3Rpdml0eX1gO1xuICAgIH0pXG4gICAgLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFx1NUI1MFx1OTg3OVx1N0VBN1x1OEJDMVx1NjM2RVx1RkYxQVx1NjI4QVx1MzAwQ1x1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OSArIFx1ODI4Mlx1NTk0Rlx1NTA0Rlx1NURFRSArIFx1NUI4Q1x1NjIxMFx1OEJCMFx1NUY1NVx1MzAwRFx1N0I5N1x1NTFGQVx1Njc2NVx1RkYwQ1xuICogXHU4QkE5IEFJIFx1OEJDQVx1NjVBRFx1ODBGRFx1NTdGQVx1NEU4RVx1NzcxRlx1NUI5RVx1NjU3MFx1NjM2RVx1NUY1Mlx1NTZFMFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NTFFRFx1N0E3QVx1N0YxNlx1OTAyMFx1NUI1MFx1OTg3OVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRJdGVtRXZpZGVuY2UoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlID0gbmV3IERhdGUoKVxuKTogSXRlbUV2aWRlbmNlW10ge1xuICBjb25zdCBpdGVtcyA9IGdvYWwuaXRlbXMgPz8gW107XG4gIGNvbnN0IGdpZCA9IGdvYWwuaWQ7XG4gIHJldHVybiBpdGVtcy5tYXAoKGl0LCBpKSA9PiB7XG4gICAgY29uc3QgaWR4ID0gU3RyaW5nKGkpO1xuICAgIGNvbnN0IGRvbmUgPSBjYWNoZS5pdGVtQ29tcGxldGlvbnNbZ2lkXT8uW2lkeF0gPz8gMDtcbiAgICBjb25zdCBsYXN0ID0gY2FjaGUuaXRlbUxhc3REb25lW2dpZF0/LltpZHhdID8/IG51bGw7XG5cbiAgICBsZXQgcGVyY2VudDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBpdC5wZXJjZW50ID09PSAnbnVtYmVyJykge1xuICAgICAgcGVyY2VudCA9IGl0LnBlcmNlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHQgPSBOdW1iZXIoaXQudGFyZ2V0VmFsdWUpO1xuICAgICAgY29uc3QgYyA9IE51bWJlcihpdC5jdXJyZW50VmFsdWUpO1xuICAgICAgaWYgKHQgPiAwKSBwZXJjZW50ID0gY2xhbXAoKGMgLyB0KSAqIDEwMCwgMCwgMTAwKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydCA9IHBhcnNlRGF0ZShpdC5zdGFydERhdGUgPz8gZ29hbC5zdGFydERhdGUpO1xuICAgIGNvbnN0IGVuZCA9IHBhcnNlRGF0ZShpdC5lbmREYXRlID8/IGdvYWwuZW5kRGF0ZSk7XG4gICAgbGV0IHBhY2VQY3Q6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIGlmIChzdGFydCAmJiBlbmQgJiYgc3RhcnQgPD0gZW5kKSB7XG4gICAgICBjb25zdCB0b3RhbCA9IGNvdW50V29ya2RheXMoc3RhcnQsIGVuZCk7XG4gICAgICBjb25zdCBlbGFwc2VkID0gY291bnRXb3JrZGF5cyhzdGFydCwgdG9kYXkpO1xuICAgICAgcGFjZVBjdCA9IHRvdGFsID4gMCA/IGNsYW1wKChlbGFwc2VkIC8gdG90YWwpICogMTAwLCAwLCAxMDApIDogbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcGFjZURldmlhdGlvbiA9XG4gICAgICBwZXJjZW50ICE9IG51bGwgJiYgcGFjZVBjdCAhPSBudWxsID8gTWF0aC5yb3VuZChwZXJjZW50IC0gcGFjZVBjdCkgOiBudWxsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgbmFtZTogaXQubmFtZSxcbiAgICAgIGRhaWx5TWluOiBpdC5kYWlseU1pbiA/PyAnJyxcbiAgICAgIHBlcmNlbnQsXG4gICAgICBwYWNlUGN0LFxuICAgICAgcGFjZURldmlhdGlvbixcbiAgICAgIGRvbmVEYXlzOiBkb25lLFxuICAgICAgbGFzdERvbmU6IGxhc3QsXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKiBcdTYzMDkgZ29hbC50aXRsZSBcdTdEMjJcdTVGMTVcdTc2ODRcdTVCNTBcdTk4NzlcdThCQzFcdTYzNkVcdUZGMDhcdTRGOUIgRGlhZ25vc2lzTW9kYWwgXHU1QzU1XHU3OTNBXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRJdGVtRXZpZGVuY2VNYXAoXG4gIGdvYWxzOiBHb2FsSXRlbVtdLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlID0gbmV3IERhdGUoKVxuKTogUmVjb3JkPHN0cmluZywgSXRlbUV2aWRlbmNlW10+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCBJdGVtRXZpZGVuY2VbXT4gPSB7fTtcbiAgZm9yIChjb25zdCBnIG9mIGdvYWxzIHx8IFtdKSB7XG4gICAgb3V0W2cudGl0bGVdID0gYnVpbGRJdGVtRXZpZGVuY2UoZywgY2FjaGUsIHRvZGF5KTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKiogXHU3RUQ5IEFJIFx1NjNEMFx1NzkzQVx1OEJDRFx1NzY4NFx1NzcxRlx1NUI5RVx1NUI1MFx1OTg3OVx1NEUwQVx1NEUwQlx1NjU4N1x1NjU4N1x1NjcyQ1x1RkYwOFx1Nzk4MVx1NkI2Mlx1N0YxNlx1OTAyMFx1NzY4NFx1MzAwQ1x1NzY3RFx1NTQwRFx1NTM1NVx1MzAwRFx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEl0ZW1FdmlkZW5jZUZvclByb21wdChcbiAgZ29hbHM6IEdvYWxJdGVtW10sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgdG9kYXk6IERhdGUgPSBuZXcgRGF0ZSgpXG4pOiBzdHJpbmcge1xuICBpZiAoIWdvYWxzIHx8IGdvYWxzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICdcdUZGMDhcdTY1RTBcdTVCNTBcdTk4NzlcdTY1NzBcdTYzNkVcdUZGMDknO1xuICByZXR1cm4gZ29hbHNcbiAgICAubWFwKChnKSA9PiB7XG4gICAgICBjb25zdCBldnMgPSBidWlsZEl0ZW1FdmlkZW5jZShnLCBjYWNoZSwgdG9kYXkpO1xuICAgICAgY29uc3QgbGluZXMgPSBldnMubGVuZ3RoXG4gICAgICAgID8gZXZzXG4gICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAoZSkgPT5cbiAgICAgICAgICAgICAgICBgICAgIC0gJHtlLm5hbWV9XHVGRjVDZGFpbHlNaW49JHtlLmRhaWx5TWluIHx8ICc/J31cdUZGNUNcdTVCOENcdTYyMTBcdTVFQTY9JHtcbiAgICAgICAgICAgICAgICAgIGUucGVyY2VudCAhPSBudWxsID8gZS5wZXJjZW50ICsgJyUnIDogJz8nXG4gICAgICAgICAgICAgICAgfVx1RkY1Q1x1ODI4Mlx1NTk0Rlx1NUU5NFx1NUI4Q1x1NjIxMD0ke2UucGFjZVBjdCAhPSBudWxsID8gZS5wYWNlUGN0ICsgJyUnIDogJz8nfVx1RkY1Q1x1ODI4Mlx1NTk0Rlx1NTA0Rlx1NURFRT0ke1xuICAgICAgICAgICAgICAgICAgZS5wYWNlRGV2aWF0aW9uICE9IG51bGwgPyBlLnBhY2VEZXZpYXRpb24gKyAncHQnIDogJz8nXG4gICAgICAgICAgICAgICAgfVx1RkY1Q1x1N0E5N1x1NTNFM1x1NTE4NVx1NUI4Q1x1NjIxMCAke2UuZG9uZURheXN9IFx1NTkyOVx1RkYwOFx1NjcwMFx1OEZEMSAke2UubGFzdERvbmUgPz8gJ1x1NjVFMCd9XHVGRjA5YFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAgIDogJyAgICBcdUZGMDhcdTY1RTBcdTVCNTBcdTk4NzlcdUZGMDknO1xuICAgICAgcmV0dXJuIGBcdTc2RUVcdTY4MDdcdTMwMEMke2cudGl0bGV9XHUzMDBEXHVGRjFBXFxuJHtsaW5lc31gO1xuICAgIH0pXG4gICAgLmpvaW4oJ1xcbicpO1xufVxuIiwgIi8qKlxuICogaGVhbHRoU2NvcmUudHMgXHUyMDE0IFx1NzZFRVx1NjgwN1x1NTA2NVx1NUVCN1x1NTIwNlx1OEJDNFx1NTIwNlx1N0NGQlx1N0VERlx1RkYwOFx1NjNEMlx1NEVGNlx1NEZBN1x1N0VBRlx1NTFGRFx1NjU3MFx1NUYxNVx1NjRDRVx1RkYwQ1RTIFx1NzlGQlx1NjkwRFx1RkYwOVxuICpcbiAqIFx1NEUwRSB3ZWJhcHAgYEdvYWxIZWFsdGhTY29yZWAgMTAwJSBcdTU0MENcdTUzRTNcdTVGODRcdUZGMENcdTRGNDZcdUZGMUFcbiAqICAtIFx1NEUwRFx1OEJGQlx1NTE2OFx1NUM0MCBgc3RvcmVgXHVGRjBDXHU3RjEzXHU1QjU4XHU3NkY0XHU2M0E1XHU1OTBEXHU3NTI4IGBEZXZpYXRpb25DYWxjdWxhdG9yLmJ1aWxkQ2FjaGVgIFx1NzY4NCBgRGV2aWF0aW9uQ2FjaGVgXG4gKiAgICBcdUZGMDhieURhdGVLZXlbZGF0ZUtleV1bZ29hbElkXS57YWN0aXZlLCBjb21wbGV0aW9ucywgcHJvZ3Jlc3N9IFx1NUY2Mlx1NzJCNlx1NUI4Q1x1NTE2OFx1NEUwMFx1ODFGNFx1RkYwOVx1RkYxQlxuICogIC0gYHRvZGF5YCBcdTRGNUNcdTRFM0FcdTVGQzVcdTU4NkJcdTUzQzJcdTY1NzBcdTZDRThcdTUxNjVcdUZGMDhcdTUzRUZcdTUzNTVcdTZENEJcdTMwMDFcdTc4NkVcdTVCOUFcdTYwMjdcdUZGMDlcdUZGMUJcbiAqICAtIFx1OTZGNiBPYnNpZGlhbiBcdTRGOURcdThENTZcdUZGMENcdTUzRUZcdTUzNTVcdTZENEJcdTMwMDJcbiAqXG4gKiBcdTRFMDlcdTVDNDJcdThCQzRcdTUyMDZcdTRGNTNcdTdDRkJcdUZGMDhcdThCQkVcdThCQTFcdTU0RjJcdTVCNjZcdTg5QzEgZG9jcy9wbGFucy8yMDI2LTA3LTE2LWhlYWx0aC1zY29yZS1kaWFnbm9zaXMtZGVzaWduLm1kXHVGRjA5XHVGRjFBXG4gKiAgTDEgXHU1N0ZBXHU3ODQwXHU1MDY1XHU1RUI3XHU1MjA2XHVGRjA4XHU1QzY1XHU3RUE2XHU4MEZEXHU1MjlCXHVGRjA5NDUlIFx1MjAxNCBcdTYzMDlcdTY1RjYgMzAlIC8gXHU5MDAyXHU1RUE2XHU2M0QwXHU1MjREIDEwJSAvIFx1NTQ2OFx1NkQzQlx1OERDMyA1JVxuICogIEwyIFx1OEQ4Qlx1NTJCRlx1NTJBOFx1NTI5Qlx1NTIwNlx1RkYwOFx1NjIxMFx1OTU3Rlx1ODBGRFx1NTI5Qlx1RkYwOTMwJSBcdTIwMTQgXHU4RkRCXHU1RUE2XHU4RDhCXHU1MkJGIDIwJSAvIFx1NUI4Q1x1NjIxMFx1OEQ4Qlx1NTJCRiAxMCVcbiAqICBMMyBcdTUzRUZcdTYzMDFcdTdFRURcdTYwMjdcdTUyMDZcdUZGMDhcdTUwNjVcdTVFQjdcdTdBMEJcdTVFQTZcdUZGMDkyNSUgXHUyMDE0IFx1NTA1Q1x1NkVERVx1NjBFOVx1N0Y1QSAvIFx1NTc0N1x1ODg2MVx1NUVBNiAvIFx1OEZDN1x1NUVBNlx1OEQ4NVx1NTI0RFx1NjBFOVx1N0Y1QSAvIFx1NjJENlx1NUVGNlx1NjBFOVx1N0Y1QVxuICpcbiAqIFx1NTNDRFx1NzZGNFx1ODlDOVx1NEVGN1x1NTAzQ1x1ODlDMlx1RkYwOEFJIFx1OEJDQVx1NjVBRFx1NUZDNVx1OTg3Qlx1NjNBNVx1NEY0Rlx1RkYwOVx1RkYxQVxuICogIC0gXHUzMDBDXHU5ODg2XHU1MTQ4XHUzMDBEXHUyMjYwXHUzMDBDXHU1MDY1XHU1RUI3XHUzMDBEXHVGRjFBXHU4RkM3XHU1RUE2XHU4RDg1XHU1MjREXHVGRjA4XHU2M0QwXHU1MjREID4zIFx1NURFNVx1NEY1Q1x1NjVFNVx1NUI4Q1x1NjIxMFx1RkYwOVx1ODhBQlx1NjBFOVx1N0Y1QVx1RkYxQlxuICogIC0gXHU1MDVDXHU2RURFXHU2MzA3XHU2NTcwXHU3RUE3XHU2MDc2XHU1MzE2XHVGRjFBKGRheXMvNSleMS41XHVGRjFCXG4gKiAgLSBcdTVCNTBcdTk4NzlcdThEOEFcdTU3NDdcdTg4NjFcdThEOEFcdTUwNjVcdTVFQjdcdUZGMDhcdThGREJcdTVFQTZcdTY4MDdcdTUxQzZcdTVERUVcdThEOEFcdTVDMEZcdThEOEFcdTU5N0RcdUZGMDlcdUZGMUJcbiAqICAtIFx1NUY1Mlx1NTZFMFx1NjMwOVx1MzAwQ1x1N0VGNFx1NUVBNlx1MzAwRFx1ODAwQ1x1OTc1RVx1MzAwQ1x1NjYyRlx1NTQyNlx1ODQzRFx1NTQwRVx1MzAwRFx1MzAwMlxuICovXG5cbmltcG9ydCB0eXBlIHsgRGV2aWF0aW9uQ2FjaGUgfSBmcm9tICcuL0RldmlhdGlvbkNhbGN1bGF0b3InO1xuaW1wb3J0IHR5cGUgeyBHb2FsSXRlbSwgR29hbFN1Ykl0ZW0gfSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuZXhwb3J0IHR5cGUgSGVhbHRoTGV2ZWwgPSAnZXhjZWxsZW50JyB8ICdnb29kJyB8ICd3YXJuaW5nJyB8ICdyaXNrJztcbmV4cG9ydCB0eXBlIEhlYWx0aERpbWVuc2lvbiA9ICdMMScgfCAnTDInIHwgJ0wzJztcblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhTdWJTY29yZSB7XG4gIHNjb3JlOiBudW1iZXI7XG4gIGhpbnQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoTDEgZXh0ZW5kcyBIZWFsdGhTdWJTY29yZSB7XG4gIG9uVGltZTogSGVhbHRoU3ViU2NvcmU7XG4gIG1vZGVyYXRlRWFybHk6IEhlYWx0aFN1YlNjb3JlO1xuICB3ZWVrbHlBY3RpdmU6IEhlYWx0aFN1YlNjb3JlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWx0aEwyIGV4dGVuZHMgSGVhbHRoU3ViU2NvcmUge1xuICBwcm9ncmVzc1RyZW5kOiBIZWFsdGhTdWJTY29yZTtcbiAgY29tcGxldGlvblRyZW5kOiBIZWFsdGhTdWJTY29yZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhTdGFnbmF0aW9uIHtcbiAgcGVuYWx0eTogbnVtYmVyO1xuICBoaW50Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWx0aEwzIGV4dGVuZHMgSGVhbHRoU3ViU2NvcmUge1xuICBzdGFnbmF0aW9uOiBIZWFsdGhTdGFnbmF0aW9uO1xuICBiYWxhbmNlOiBIZWFsdGhTdWJTY29yZTtcbiAgb3ZlckVhcmx5OiBIZWFsdGhTdGFnbmF0aW9uO1xuICBkZWxheTogSGVhbHRoU3RhZ25hdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIZWFsdGhSZXN1bHQge1xuICBzY29yZTogbnVtYmVyO1xuICBsZXZlbDogSGVhbHRoTGV2ZWw7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIEwxOiBIZWFsdGhMMTtcbiAgTDI6IEhlYWx0aEwyO1xuICBMMzogSGVhbHRoTDM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhbHRoU2V0IHtcbiAgYXZnU2NvcmU6IG51bWJlcjtcbiAgYXZnTGV2ZWw6IEhlYWx0aExldmVsO1xuICBhdmdMYWJlbDogc3RyaW5nO1xuICBhdmdDb2xvcjogc3RyaW5nO1xuICBjb3VudDogbnVtYmVyO1xuICBMMTogbnVtYmVyO1xuICBMMjogbnVtYmVyO1xuICBMMzogbnVtYmVyO1xuICB0cmVuZDogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBIZWFsdGhIaW50VHlwZSA9ICdkYW5nZXInIHwgJ3dhcm5pbmcnIHwgJ3N1Y2Nlc3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhlYWx0aEhpbnQge1xuICAvKiogXHU4QkU1XHU1RjUyXHU1NkUwXHU2MzA3XHU1NDExXHU3Njg0XHU1MDY1XHU1RUI3XHU1MjA2XHU3RUY0XHU1RUE2XHVGRjA4XHU0RjlCXHU4QkNBXHU2NUFEXHU2M0QwXHU3OTNBXHU4QkNEXHU2MzA5XHU3RUY0XHU1RUE2XHU1QkY5XHU5RjUwXHU1RUZBXHU4QkFFXHVGRjA5ICovXG4gIGRpbWVuc2lvbjogSGVhbHRoRGltZW5zaW9uO1xuICB0eXBlOiBIZWFsdGhIaW50VHlwZTtcbiAgaWNvbjogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGFjdGlvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgVFVOSU5HID0ge1xuICAvLyBcdTRFMDlcdTVDNDJcdTYwM0JcdTUyMDZcdTY3NDNcdTkxQ0RcbiAgV0VJR0hUX0wxOiAwLjQ1LFxuICBXRUlHSFRfTDI6IDAuMyxcbiAgV0VJR0hUX0wzOiAwLjI1LFxuXG4gIC8vIEwxIFx1NTE4NVx1OTBFOFx1NUI1MFx1OTg3OVx1Njc0M1x1OTFDRFxuICBMMV9PTl9USU1FOiAwLjMsXG4gIEwxX01PREVSQVRFX0VBUkxZOiAwLjEsXG4gIEwxX1dFRUtMWV9BQ1RJVkU6IDAuMDUsXG5cbiAgLy8gTDIgXHU1MTg1XHU5MEU4XHU1QjUwXHU5ODc5XHU2NzQzXHU5MUNEXG4gIEwyX1BST0dSRVNTX1RSRU5EOiAwLjIsXG4gIEwyX0NPTVBMRVRJT05fVFJFTkQ6IDAuMSxcblxuICAvLyBMMyBcdTUxODVcdTkwRThcdTVFNzNcdTg4NjFcdTUyMDZcdTY3NDNcdTkxQ0RcbiAgTDNfQkFMQU5DRTogMC4xLFxuXG4gIC8vIFx1NTQ2OFx1NkQzQlx1OERDM1x1NUVBNiAvIFx1OEZEQlx1NUVBNlx1OEQ4Qlx1NTJCRlx1NTZERVx1NkVBRlx1NTkyOVx1NjU3MFxuICBSRUNFTlRfREFZUzogNyxcbiAgLy8gXHU1MDVDXHU2RURFXHU2OEMwXHU2RDRCXHU2NzAwXHU1OTI3XHU1NkRFXHU2RUFGXHU1OTI5XHU2NTcwXG4gIFNUQUdOQVRJT05fV0lORE9XOiA2MCxcblxuICAvLyBcdThGQzdcdTVFQTZcdThEODVcdTUyNEQgLyBcdTYyRDZcdTVFRjZcdTVCQkRcdTVCQjlcdTU5MjlcdTY1NzBcdTRFMEVcdTYwRTlcdTdGNUFcdTdDRkJcdTY1NzBcbiAgVE9MRVJBTkNFX0VBUkxZX0RBWVM6IDMsXG4gIE9WRVJfRUFSTFlfUEVOQUxUWV9NQVg6IDUwLFxuICBPVkVSX0VBUkxZX1BFTkFMVFlfUkFURTogNSxcbiAgVE9MRVJBTkNFX0RFTEFZX0RBWVM6IDMsXG4gIERFTEFZX1BFTkFMVFlfTUFYOiAzMCxcbiAgREVMQVlfUEVOQUxUWV9SQVRFOiAzLFxuXG4gIC8vIFx1NTA1Q1x1NkVERVx1NjBFOVx1N0Y1QVx1NjMwN1x1NjU3MFx1NjZGMlx1N0VCRlxuICBTVEFHTkFUSU9OX0VYUE9ORU5UOiAxLjUsXG4gIFNUQUdOQVRJT05fRElWSVNPUjogNSxcbiAgU1RBR05BVElPTl9QRU5BTFRZX01BWDogNDAsXG5cbiAgLy8gXHU1RTczXHU4ODYxXHU1MjA2XHU2MEU5XHU3RjVBXHU3Q0ZCXHU2NTcwXG4gIEJBTEFOQ0VfUEVOQUxUWV9SQVRFOiAxLjUsXG5cbiAgLy8gTDIgXHU4RkRCXHU1RUE2XHU4RDhCXHU1MkJGXHU1MjI0XHU1QjlBXHU5NjA4XHU1MDNDXG4gIFRSRU5EX0FDQ0VMX1RIUkVTSE9MRDogNSxcblxuICAvLyBcdTVFRkFcdThCQUVcdTdDRkJcdTdFREZcdTk2MDhcdTUwM0NcbiAgU1VHR0VTVElPTl9MT1c6IDYwLFxuICBTVUdHRVNUSU9OX0hJR0g6IDg1LFxuXG4gIC8vIFx1N0VGQ1x1NTQwOFx1OEQ4Qlx1NTJCRlx1NjYyMFx1NUMwNFxuICBUUkVORF9TVFJPTkdfSElHSDogNzUsXG4gIFRSRU5EX1dFQUtfSElHSDogNjAsXG4gIFRSRU5EX1NUUk9OR19MT1c6IDQwLFxuICBUUkVORF9XRUFLX0xPVzogNTUsXG5cbiAgLy8gXHU3QjQ5XHU3RUE3XHU1MjEyXHU1MjA2XHU5NjA4XHU1MDNDXG4gIExFVkVMX0VYQ0VMTEVOVDogODUsXG4gIExFVkVMX0dPT0Q6IDcwLFxuICBMRVZFTF9XQVJOSU5HOiA1MCxcblxuICAvLyBcdThCQ0FcdTY1QURcdTdDRkJcdTdFREZcdTk2MDhcdTUwM0NcbiAgSElOVF9MMTogNzAsXG4gIEhJTlRfTDI6IDYwLFxuICBISU5UX0wzOiA3MCxcbiAgSElOVF9MQVRFX0dPQUxfU0NPUkU6IDYwLFxuICBISU5UX1NUQUdOQVRJT05fUEVOQUxUWTogMTUsXG4gIEhJTlRfQkFMQU5DRV9TQ09SRTogNjAsXG4gIEhJTlRfSElHSF9TQ09SRTogOTAsXG59O1xuXG5jb25zdCBMRVZFTFM6IFJlY29yZDxIZWFsdGhMZXZlbCwgeyBsYWJlbDogc3RyaW5nOyBtaW46IG51bWJlcjsgY29sb3I6IHN0cmluZyB9PiA9IHtcbiAgZXhjZWxsZW50OiB7IGxhYmVsOiAnXHU0RjE4XHU3OUMwJywgbWluOiBUVU5JTkcuTEVWRUxfRVhDRUxMRU5ULCBjb2xvcjogJ3ZhcigtLWJhbWJvby1wcmltYXJ5KScgfSxcbiAgZ29vZDogeyBsYWJlbDogJ1x1ODI2Rlx1NTk3RCcsIG1pbjogVFVOSU5HLkxFVkVMX0dPT0QsIGNvbG9yOiAndmFyKC0tYmFtYm9vLWxpZ2h0KScgfSxcbiAgd2FybmluZzogeyBsYWJlbDogJ1x1OTcwMFx1NTE3M1x1NkNFOCcsIG1pbjogVFVOSU5HLkxFVkVMX1dBUk5JTkcsIGNvbG9yOiAnI2Y1OWUwYicgfSxcbiAgcmlzazogeyBsYWJlbDogJ1x1OThDRVx1OTY2OScsIG1pbjogMCwgY29sb3I6ICcjZGMzNTQ1JyB9LFxufTtcblxuZnVuY3Rpb24gY2xhbXAodjogbnVtYmVyLCBsbzogbnVtYmVyLCBoaTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgubWF4KGxvLCBNYXRoLm1pbihoaSwgdikpO1xufVxuXG5mdW5jdGlvbiBmbXQoZDogRGF0ZSk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtkLmdldEZ1bGxZZWFyKCl9LSR7U3RyaW5nKGQuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKGQuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpfWA7XG59XG5cbi8qKiBcdTdFQUZcdTUxRkRcdTY1NzBcdUZGMUFcdTY3ODRcdTkwMjBcdTY3RDBcdTVFNzRcdTc2ODRcdTZDRDVcdTVCOUFcdTgyODJcdTUwNDdcdTY1RTUgKyBcdTY2MjVcdTgyODJcdTk2QzZcdTU0MDhcdUZGMDhcdTRFMEUgd2ViYXBwIFx1NTNFM1x1NUY4NFx1NEUwMFx1ODFGNFx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkSG9saWRheXMocmVmWWVhcjogbnVtYmVyKTogU2V0PHN0cmluZz4ge1xuICBjb25zdCBoID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IGFkZCA9ICh5OiBudW1iZXIsIG06IG51bWJlciwgZDogbnVtYmVyKSA9PlxuICAgIGguYWRkKGAke3l9LSR7U3RyaW5nKG0pLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKGQpLnBhZFN0YXJ0KDIsICcwJyl9YCk7XG4gIFtyZWZZZWFyLCByZWZZZWFyICsgMV0uZm9yRWFjaCgoeSkgPT4ge1xuICAgIGFkZCh5LCAxLCAxKTtcbiAgICBhZGQoeSwgNSwgMSk7IGFkZCh5LCA1LCAyKTsgYWRkKHksIDUsIDMpO1xuICAgIGFkZCh5LCAxMCwgMSk7IGFkZCh5LCAxMCwgMik7IGFkZCh5LCAxMCwgMyk7IGFkZCh5LCAxMCwgNCk7IGFkZCh5LCAxMCwgNSk7IGFkZCh5LCAxMCwgNik7IGFkZCh5LCAxMCwgNyk7XG4gICAgYWRkKHksIDQsIDQpOyBhZGQoeSwgNCwgNSk7IGFkZCh5LCA0LCA2KTtcbiAgICBhZGQoeSwgNiwgOSk7IGFkZCh5LCA2LCAxMCk7XG4gICAgYWRkKHksIDksIDE0KTsgYWRkKHksIDksIDE1KTsgYWRkKHksIDksIDE2KTtcbiAgfSk7XG4gIGlmIChyZWZZZWFyIDw9IDIwMjUgJiYgMjAyNSA8PSByZWZZZWFyICsgMSkge1xuICAgIFsnMjAyNS0wMS0yOCcsICcyMDI1LTAxLTI5JywgJzIwMjUtMDEtMzAnLCAnMjAyNS0wMS0zMScsXG4gICAgICAnMjAyNS0wMi0wMScsICcyMDI1LTAyLTAyJywgJzIwMjUtMDItMDMnLCAnMjAyNS0wMi0wNCddLmZvckVhY2goKGQpID0+IGguYWRkKGQpKTtcbiAgfVxuICBpZiAocmVmWWVhciA8PSAyMDI2ICYmIDIwMjYgPD0gcmVmWWVhciArIDEpIHtcbiAgICBbJzIwMjYtMDItMTYnLCAnMjAyNi0wMi0xNycsICcyMDI2LTAyLTE4JywgJzIwMjYtMDItMTknLFxuICAgICAgJzIwMjYtMDItMjAnLCAnMjAyNi0wMi0yMScsICcyMDI2LTAyLTIyJ10uZm9yRWFjaCgoZCkgPT4gaC5hZGQoZCkpO1xuICB9XG4gIHJldHVybiBoO1xufVxuXG5sZXQgX2hvbGlkYXlDYWNoZTogeyB5ZWFyOiBudW1iZXI7IHNldDogU2V0PHN0cmluZz4gfSB8IG51bGwgPSBudWxsO1xuZnVuY3Rpb24gX2dldEhvbGlkYXlzKHllYXI6IG51bWJlcik6IFNldDxzdHJpbmc+IHtcbiAgaWYgKF9ob2xpZGF5Q2FjaGUgJiYgX2hvbGlkYXlDYWNoZS55ZWFyID09PSB5ZWFyKSByZXR1cm4gX2hvbGlkYXlDYWNoZS5zZXQ7XG4gIGNvbnN0IHNldCA9IGJ1aWxkSG9saWRheXMoeWVhcik7XG4gIF9ob2xpZGF5Q2FjaGUgPSB7IHllYXIsIHNldCB9O1xuICByZXR1cm4gc2V0O1xufVxuXG5mdW5jdGlvbiBpc1dvcmtkYXkoZDogRGF0ZSwgaG9saWRheXM6IFNldDxzdHJpbmc+KTogYm9vbGVhbiB7XG4gIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gIGlmIChkYXkgPT09IDAgfHwgZGF5ID09PSA2KSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiAhaG9saWRheXMuaGFzKGZtdChkKSk7XG59XG5cbmZ1bmN0aW9uIGNvdW50V29ya2RheXMoZnJvbTogRGF0ZSwgdG86IERhdGUsIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPik6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDA7XG4gIGNvbnN0IGN1ciA9IG5ldyBEYXRlKGZyb20uZ2V0RnVsbFllYXIoKSwgZnJvbS5nZXRNb250aCgpLCBmcm9tLmdldERhdGUoKSk7XG4gIGNvbnN0IGxhc3QgPSBuZXcgRGF0ZSh0by5nZXRGdWxsWWVhcigpLCB0by5nZXRNb250aCgpLCB0by5nZXREYXRlKCkpO1xuICBpZiAoY3VyID4gbGFzdCkgcmV0dXJuIDA7XG4gIHdoaWxlIChjdXIgPD0gbGFzdCkge1xuICAgIGlmIChpc1dvcmtkYXkoY3VyLCBob2xpZGF5cykpIGNvdW50Kys7XG4gICAgY3VyLnNldERhdGUoY3VyLmdldERhdGUoKSArIDEpO1xuICB9XG4gIHJldHVybiBjb3VudDtcbn1cblxuZnVuY3Rpb24gd29ya2RheXNCZXR3ZWVuKGZyb206IERhdGUsIHRvOiBEYXRlLCBob2xpZGF5czogU2V0PHN0cmluZz4pOiBudW1iZXIge1xuICBjb25zdCBhID0gbmV3IERhdGUoZnJvbS5nZXRGdWxsWWVhcigpLCBmcm9tLmdldE1vbnRoKCksIGZyb20uZ2V0RGF0ZSgpKTtcbiAgY29uc3QgYiA9IG5ldyBEYXRlKHRvLmdldEZ1bGxZZWFyKCksIHRvLmdldE1vbnRoKCksIHRvLmdldERhdGUoKSk7XG4gIGlmIChiID49IGEpIHJldHVybiBjb3VudFdvcmtkYXlzKGEsIGIsIGhvbGlkYXlzKTtcbiAgcmV0dXJuIC1jb3VudFdvcmtkYXlzKGIsIGEsIGhvbGlkYXlzKTtcbn1cblxuZnVuY3Rpb24gY2FjaGVBY3RpdmVPbkRhdGUoY2FjaGU6IERldmlhdGlvbkNhY2hlLCBnb2FsSWQ6IHN0cmluZywgZGF0ZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGRheSA9IGNhY2hlLmJ5RGF0ZUtleVtkYXRlS2V5XTtcbiAgaWYgKCFkYXkpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgZW50cnkgPSBkYXlbZ29hbElkXTtcbiAgcmV0dXJuICEhZW50cnkgJiYgISFlbnRyeS5hY3RpdmU7XG59XG5cbmZ1bmN0aW9uIGNhY2hlQ29tcGxldGlvbnNPbkRhdGUoY2FjaGU6IERldmlhdGlvbkNhY2hlLCBnb2FsSWQ6IHN0cmluZywgZGF0ZUtleTogc3RyaW5nKTogbnVtYmVyIHtcbiAgY29uc3QgZGF5ID0gY2FjaGUuYnlEYXRlS2V5W2RhdGVLZXldO1xuICBpZiAoIWRheSkgcmV0dXJuIDA7XG4gIGNvbnN0IGVudHJ5ID0gZGF5W2dvYWxJZF07XG4gIHJldHVybiBlbnRyeSA/IChlbnRyeS5jb21wbGV0aW9ucyB8fCAwKSA6IDA7XG59XG5cbmZ1bmN0aW9uIGNhY2hlUHJvZ3Jlc3NPbkRhdGUoY2FjaGU6IERldmlhdGlvbkNhY2hlLCBnb2FsSWQ6IHN0cmluZywgZGF0ZUtleTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZGF5ID0gY2FjaGUuYnlEYXRlS2V5W2RhdGVLZXldO1xuICBpZiAoIWRheSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgZW50cnkgPSBkYXlbZ29hbElkXTtcbiAgcmV0dXJuIGVudHJ5ID8gZW50cnkucHJvZ3Jlc3MgOiB1bmRlZmluZWQ7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCBMMSBcdTU3RkFcdTc4NDBcdTUwNjVcdTVFQjdcdTUyMDZcdUZGMDhcdTVDNjVcdTdFQTZcdTgwRkRcdTUyOUJcdUZGMDk0NSUgXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBzY29yZU9uVGltZShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIHByb2dyZXNzOiBudW1iZXIsXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFN1YlNjb3JlIHtcbiAgaWYgKCFnb2FsLmVuZERhdGUpIHJldHVybiB7IHNjb3JlOiA3MCwgaGludDogJ1x1NjcyQVx1OEJCRVx1NjIyQVx1NkI2Mlx1NjVFNVx1NjcxRicgfTtcbiAgaWYgKGdvYWwuc3RhcnREYXRlICYmIGdvYWwuZW5kRGF0ZSkge1xuICAgIGNvbnN0IHMgPSBuZXcgRGF0ZShnb2FsLnN0YXJ0RGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgICBjb25zdCBlID0gbmV3IERhdGUoZ29hbC5lbmREYXRlICsgJ1QwMDowMDowMCcpO1xuICAgIGlmIChzID4gZSkgcmV0dXJuIHsgc2NvcmU6IDAsIGhpbnQ6ICdcdTY1RTVcdTY3MUZcdTgzMDNcdTU2RjRcdTVGMDJcdTVFMzgnIH07XG4gIH1cbiAgY29uc3QgZW5kID0gbmV3IERhdGUoZ29hbC5lbmREYXRlICsgJ1QwMDowMDowMCcpO1xuICBlbmQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIGNvbnN0IGRheXNUb0RlYWRsaW5lID0gd29ya2RheXNCZXR3ZWVuKHRvZGF5LCBlbmQsIGhvbGlkYXlzKTtcblxuICBpZiAoaXNDb21wbGV0ZSkge1xuICAgIGlmIChkYXlzVG9EZWFkbGluZSA+PSAtVFVOSU5HLlRPTEVSQU5DRV9ERUxBWV9EQVlTICYmIGRheXNUb0RlYWRsaW5lIDw9IDApIHtcbiAgICAgIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTAnIH07XG4gICAgfVxuICAgIGlmIChkYXlzVG9EZWFkbGluZSA+IDApIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTYzRDBcdTUyNERcdTVCOENcdTYyMTAnIH07XG4gICAgY29uc3QgbGF0ZSA9IE1hdGguYWJzKGRheXNUb0RlYWRsaW5lKTtcbiAgICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oVFVOSU5HLkRFTEFZX1BFTkFMVFlfTUFYLCBsYXRlICogVFVOSU5HLkRFTEFZX1BFTkFMVFlfUkFURSk7XG4gICAgcmV0dXJuIHsgc2NvcmU6IGNsYW1wKDEwMCAtIHBlbmFsdHksIDAsIDEwMCksIGhpbnQ6IGBcdTYyRDZcdTVFRjYke2xhdGV9XHU0RTJBXHU1REU1XHU0RjVDXHU2NUU1YCB9O1xuICB9XG5cbiAgaWYgKGRheXNUb0RlYWRsaW5lIDwgLVRVTklORy5UT0xFUkFOQ0VfREVMQVlfREFZUykge1xuICAgIGNvbnN0IGxhdGUgPSBNYXRoLmFicyhkYXlzVG9EZWFkbGluZSk7XG4gICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFRVTklORy5ERUxBWV9QRU5BTFRZX01BWCwgbGF0ZSAqIFRVTklORy5ERUxBWV9QRU5BTFRZX1JBVEUpO1xuICAgIHJldHVybiB7IHNjb3JlOiBjbGFtcCg3MCAtIHBlbmFsdHksIDAsIDEwMCksIGhpbnQ6IGBcdTVERjJcdTkwM0VcdTY3MUYke2xhdGV9XHU0RTJBXHU1REU1XHU0RjVDXHU2NUU1YCB9O1xuICB9XG5cbiAgaWYgKCFnb2FsLnN0YXJ0RGF0ZSkgcmV0dXJuIHsgc2NvcmU6IDY1LCBoaW50OiAnXHU2NzJBXHU4QkJFXHU1RjAwXHU1OUNCXHU2NUU1XHU2NzFGJyB9O1xuICBjb25zdCBzdGFydCA9IG5ldyBEYXRlKGdvYWwuc3RhcnREYXRlICsgJ1QwMDowMDowMCcpO1xuICBzdGFydC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgaWYgKHRvZGF5IDwgc3RhcnQpIHJldHVybiB7IHNjb3JlOiA4MCwgaGludDogJ1x1NUMxQVx1NjcyQVx1NUYwMFx1NTlDQicgfTtcblxuICBjb25zdCB0b3RhbFdvcmtkYXlzID0gY291bnRXb3JrZGF5cyhzdGFydCwgZW5kLCBob2xpZGF5cyk7XG4gIGNvbnN0IGVsYXBzZWRXb3JrZGF5cyA9IGNvdW50V29ya2RheXMoc3RhcnQsIHRvZGF5LCBob2xpZGF5cyk7XG4gIGNvbnN0IGV4cGVjdGVkID0gdG90YWxXb3JrZGF5cyA+IDAgPyAoZWxhcHNlZFdvcmtkYXlzIC8gdG90YWxXb3JrZGF5cykgKiAxMDAgOiA1MDtcbiAgY29uc3QgZGlmZiA9IHByb2dyZXNzIC0gZXhwZWN0ZWQ7XG5cbiAgaWYgKGRpZmYgPj0gMCkgcmV0dXJuIHsgc2NvcmU6IDEwMCwgaGludDogJ1x1OEZEQlx1NUVBNlx1OEZCRVx1NjgwNycgfTtcbiAgaWYgKGRpZmYgPiAtMTUpIHJldHVybiB7IHNjb3JlOiBjbGFtcCg4NSArIGRpZmYsIDAsIDEwMCksIGhpbnQ6ICdcdThGN0JcdTVGQUVcdTg0M0RcdTU0MEUnIH07XG4gIGlmIChkaWZmID4gLTMwKSByZXR1cm4geyBzY29yZTogY2xhbXAoNjAgKyBkaWZmICogMC41LCAwLCAxMDApLCBoaW50OiAnXHU2NjBFXHU2NjNFXHU4NDNEXHU1NDBFJyB9O1xuICByZXR1cm4geyBzY29yZTogY2xhbXAoNDAgKyBkaWZmICogMC4yLCAwLCAxMDApLCBoaW50OiAnXHU0RTI1XHU5MUNEXHU4NDNEXHU1NDBFJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZU1vZGVyYXRlRWFybHkoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBwcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdWJTY29yZSB7XG4gIGlmICghZ29hbC5lbmREYXRlKSByZXR1cm4geyBzY29yZTogNzAsIGhpbnQ6ICdcdTY3MkFcdThCQkVcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUYnIH07XG4gIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgZW5kLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBjb25zdCBkYXlzVG9EZWFkbGluZSA9IHdvcmtkYXlzQmV0d2Vlbih0b2RheSwgZW5kLCBob2xpZGF5cyk7XG5cbiAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICBpZiAoZGF5c1RvRGVhZGxpbmUgPj0gMSAmJiBkYXlzVG9EZWFkbGluZSA8PSBUVU5JTkcuVE9MRVJBTkNFX0VBUkxZX0RBWVMpIHtcbiAgICAgIHJldHVybiB7IHNjb3JlOiA4MCwgaGludDogJ1x1OTAwMlx1NUVBNlx1NjNEMFx1NTI0RCcgfTtcbiAgICB9XG4gICAgaWYgKGRheXNUb0RlYWRsaW5lID4gVFVOSU5HLlRPTEVSQU5DRV9FQVJMWV9EQVlTKSB7XG4gICAgICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oXG4gICAgICAgIFRVTklORy5PVkVSX0VBUkxZX1BFTkFMVFlfTUFYLFxuICAgICAgICBkYXlzVG9EZWFkbGluZSAqIFRVTklORy5PVkVSX0VBUkxZX1BFTkFMVFlfUkFURVxuICAgICAgKTtcbiAgICAgIHJldHVybiB7IHNjb3JlOiBjbGFtcCg4MCAtIHBlbmFsdHksIDAsIDEwMCksIGhpbnQ6IGBcdThGQzdcdTVFQTZcdThEODVcdTUyNEQke2RheXNUb0RlYWRsaW5lfVx1NTkyOWAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgc2NvcmU6IDEwMCwgaGludDogJ1x1NjMwOVx1NjVGNlx1NUI4Q1x1NjIxMCcgfTtcbiAgfVxuXG4gIGlmIChkYXlzVG9EZWFkbGluZSA+IFRVTklORy5UT0xFUkFOQ0VfRUFSTFlfREFZUyAmJiBwcm9ncmVzcyA+PSA5MCkge1xuICAgIHJldHVybiB7IHNjb3JlOiA3NSwgaGludDogJ1x1NjNBNVx1OEZEMVx1NUI4Q1x1NjIxMCcgfTtcbiAgfVxuICByZXR1cm4geyBzY29yZTogNzAsIGhpbnQ6ICdcdThGREJcdTg4NENcdTRFMkQnIH07XG59XG5cbmZ1bmN0aW9uIHNjb3JlV2Vla2x5QWN0aXZlKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgX2l0ZW1zOiBHb2FsU3ViSXRlbVtdLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFN1YlNjb3JlIHtcbiAgbGV0IGFjdGl2ZURheXMgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IFRVTklORy5SRUNFTlRfREFZUzsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBpZiAoIWlzV29ya2RheShkLCBob2xpZGF5cykpIGNvbnRpbnVlO1xuICAgIGNvbnN0IGtleSA9IGZtdChkKTtcbiAgICBpZiAoY2FjaGVBY3RpdmVPbkRhdGUoY2FjaGUsIGdvYWwuaWQsIGtleSkpIGFjdGl2ZURheXMrKztcbiAgfVxuICBsZXQgd29ya2RheXNUaGlzV2VlayA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgVFVOSU5HLlJFQ0VOVF9EQVlTOyBpKyspIHtcbiAgICBjb25zdCBkID0gbmV3IERhdGUodG9kYXkpO1xuICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSAtIGkpO1xuICAgIGlmIChpc1dvcmtkYXkoZCwgaG9saWRheXMpKSB3b3JrZGF5c1RoaXNXZWVrKys7XG4gIH1cbiAgY29uc3QgcmF0aW8gPSB3b3JrZGF5c1RoaXNXZWVrID4gMCA/IGFjdGl2ZURheXMgLyB3b3JrZGF5c1RoaXNXZWVrIDogMDtcbiAgcmV0dXJuIHtcbiAgICBzY29yZTogY2xhbXAoTWF0aC5yb3VuZChyYXRpbyAqIDEwMCksIDAsIDEwMCksXG4gICAgaGludDogYWN0aXZlRGF5cyA+IDAgPyBgXHU1NDY4XHU2RDNCXHU4REMzJHthY3RpdmVEYXlzfVx1NTkyOWAgOiAnXHU2NzJDXHU1NDY4XHU2NUUwXHU2M0E4XHU4RkRCJyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2NvcmVMMShcbiAgZ29hbDogR29hbEl0ZW0sXG4gIGl0ZW1zOiBHb2FsU3ViSXRlbVtdLFxuICBwcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aEwxIHtcbiAgY29uc3Qgb25UaW1lID0gc2NvcmVPblRpbWUoZ29hbCwgcHJvZ3Jlc3MsIGlzQ29tcGxldGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IG1vZGVyYXRlRWFybHkgPSBzY29yZU1vZGVyYXRlRWFybHkoZ29hbCwgcHJvZ3Jlc3MsIGlzQ29tcGxldGUsIGhvbGlkYXlzLCB0b2RheSk7XG4gIGNvbnN0IHdlZWtseUFjdGl2ZSA9IHNjb3JlV2Vla2x5QWN0aXZlKGdvYWwsIGl0ZW1zLCBjYWNoZSwgaG9saWRheXMsIHRvZGF5KTtcbiAgY29uc3Qgc2NvcmUgPSBjbGFtcChcbiAgICBNYXRoLnJvdW5kKFxuICAgICAgKG9uVGltZS5zY29yZSAqIFRVTklORy5MMV9PTl9USU1FICtcbiAgICAgICAgbW9kZXJhdGVFYXJseS5zY29yZSAqIFRVTklORy5MMV9NT0RFUkFURV9FQVJMWSArXG4gICAgICAgIHdlZWtseUFjdGl2ZS5zY29yZSAqIFRVTklORy5MMV9XRUVLTFlfQUNUSVZFKSAvXG4gICAgICAgIChUVU5JTkcuTDFfT05fVElNRSArIFRVTklORy5MMV9NT0RFUkFURV9FQVJMWSArIFRVTklORy5MMV9XRUVLTFlfQUNUSVZFKVxuICAgICksXG4gICAgMCxcbiAgICAxMDBcbiAgKTtcbiAgcmV0dXJuIHsgc2NvcmU6IE1hdGgucm91bmQoc2NvcmUpLCBvblRpbWUsIG1vZGVyYXRlRWFybHksIHdlZWtseUFjdGl2ZSB9O1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgTDIgXHU4RDhCXHU1MkJGXHU1MkE4XHU1MjlCXHU1MjA2XHVGRjA4XHU2MjEwXHU5NTdGXHU4MEZEXHU1MjlCXHVGRjA5MzAlIFx1MjUwMFx1MjUwMFx1MjUwMFxuZnVuY3Rpb24gc2NvcmVQcm9ncmVzc1RyZW5kKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgX2l0ZW1zOiBHb2FsU3ViSXRlbVtdLFxuICBwcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFN1YlNjb3JlIHtcbiAgaWYgKGlzQ29tcGxldGUpIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTVERjJcdTVCOENcdTYyMTAnIH07XG4gIGlmICghZ29hbC5zdGFydERhdGUgfHwgIWdvYWwuZW5kRGF0ZSkgcmV0dXJuIHsgc2NvcmU6IDYwLCBoaW50OiAnXHU3RjNBXHU1QzExXHU2NUU1XHU2NzFGXHU0RkUxXHU2MDZGJyB9O1xuICBpZiAoZ29hbC5zdGFydERhdGUgJiYgZ29hbC5lbmREYXRlKSB7XG4gICAgY29uc3QgcyA9IG5ldyBEYXRlKGdvYWwuc3RhcnREYXRlICsgJ1QwMDowMDowMCcpO1xuICAgIGNvbnN0IGUgPSBuZXcgRGF0ZShnb2FsLmVuZERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gICAgaWYgKHMgPiBlKSByZXR1cm4geyBzY29yZTogMCwgaGludDogJ1x1NjVFNVx1NjcxRlx1ODMwM1x1NTZGNFx1NUYwMlx1NUUzOCcgfTtcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0ID0gbmV3IERhdGUoZ29hbC5zdGFydERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gIHN0YXJ0LnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBpZiAodG9kYXkgPCBzdGFydCkgcmV0dXJuIHsgc2NvcmU6IDUwLCBoaW50OiAnXHU1QzFBXHU2NzJBXHU1RjAwXHU1OUNCJyB9O1xuXG4gIGNvbnN0IHJlY2VudERheXMgPSBUVU5JTkcuUkVDRU5UX0RBWVM7XG4gIGxldCByZWNlbnRQcm9ncmVzcyA9IDA7XG4gIGxldCBvbGRlclByb2dyZXNzID0gMDtcbiAgbGV0IHJlY2VudEhhc0RhdGEgPSBmYWxzZTtcbiAgbGV0IG9sZGVySGFzRGF0YSA9IGZhbHNlO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjZW50RGF5czsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgY29uc3QgcCA9IGNhY2hlUHJvZ3Jlc3NPbkRhdGUoY2FjaGUsIGdvYWwuaWQsIGtleSk7XG4gICAgaWYgKHAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVjZW50UHJvZ3Jlc3MgPSBwO1xuICAgICAgcmVjZW50SGFzRGF0YSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgZm9yIChsZXQgaSA9IHJlY2VudERheXM7IGkgPCByZWNlbnREYXlzICogMjsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgY29uc3QgcCA9IGNhY2hlUHJvZ3Jlc3NPbkRhdGUoY2FjaGUsIGdvYWwuaWQsIGtleSk7XG4gICAgaWYgKHAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgb2xkZXJQcm9ncmVzcyA9IHA7XG4gICAgICBvbGRlckhhc0RhdGEgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFyZWNlbnRIYXNEYXRhICYmICFvbGRlckhhc0RhdGEpIHtcbiAgICBjb25zdCBlbmQgPSBuZXcgRGF0ZShnb2FsLmVuZERhdGUgKyAnVDAwOjAwOjAwJyk7XG4gICAgZW5kLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAgIGNvbnN0IHRvdGFsV2QgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCBlbmQsIGhvbGlkYXlzKTtcbiAgICBjb25zdCBlbGFwc2VkV2QgPSBjb3VudFdvcmtkYXlzKHN0YXJ0LCB0b2RheSwgaG9saWRheXMpO1xuICAgIGNvbnN0IGV4cGVjdGVkID0gdG90YWxXZCA+IDAgPyAoZWxhcHNlZFdkIC8gdG90YWxXZCkgKiAxMDAgOiA1MDtcbiAgICBjb25zdCBkaWZmID0gcHJvZ3Jlc3MgLSBleHBlY3RlZDtcbiAgICBpZiAoZGlmZiA+PSAwKSByZXR1cm4geyBzY29yZTogODAsIGhpbnQ6ICdcdThGREJcdTVFQTZcdTZCNjNcdTVFMzgnIH07XG4gICAgaWYgKGRpZmYgPiAtMjApIHJldHVybiB7IHNjb3JlOiA2MCwgaGludDogJ1x1N0EwRFx1NjcwOVx1ODQzRFx1NTQwRScgfTtcbiAgICByZXR1cm4geyBzY29yZTogNDAsIGhpbnQ6ICdcdThGREJcdTVFQTZcdTUwNEZcdTYxNjInIH07XG4gIH1cblxuICBpZiAoIW9sZGVySGFzRGF0YSkgcmV0dXJuIHsgc2NvcmU6IDY1LCBoaW50OiAnXHU2NTcwXHU2MzZFXHU0RTBEXHU4REIzJyB9O1xuXG4gIGNvbnN0IGRpZmYgPSByZWNlbnRQcm9ncmVzcyAtIG9sZGVyUHJvZ3Jlc3M7XG4gIGlmIChkaWZmID4gVFVOSU5HLlRSRU5EX0FDQ0VMX1RIUkVTSE9MRCkgcmV0dXJuIHsgc2NvcmU6IDkwLCBoaW50OiAnXHU4RkRCXHU1RUE2XHU1MkEwXHU5MDFGJyB9O1xuICBpZiAoZGlmZiA+IDApIHJldHVybiB7IHNjb3JlOiA3NSwgaGludDogJ1x1N0EzM1x1NkI2NVx1NjNBOFx1OEZEQicgfTtcbiAgaWYgKGRpZmYgPT09IDApIHJldHVybiB7IHNjb3JlOiA1MCwgaGludDogJ1x1OEZEQlx1NUVBNlx1NTA1Q1x1NkVERScgfTtcbiAgcmV0dXJuIHsgc2NvcmU6IDMwLCBoaW50OiAnXHU4RkRCXHU1RUE2XHU1MDEyXHU5MDAwJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZUNvbXBsZXRpb25UcmVuZChcbiAgZ29hbDogR29hbEl0ZW0sXG4gIF9pdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBfaG9saWRheXM6IFNldDxzdHJpbmc+LFxuICB0b2RheTogRGF0ZVxuKTogSGVhbHRoU3ViU2NvcmUge1xuICBpZiAoaXNDb21wbGV0ZSkgcmV0dXJuIHsgc2NvcmU6IDEwMCwgaGludDogJ1x1NURGMlx1NUI4Q1x1NjIxMCcgfTtcbiAgaWYgKCFnb2FsLml0ZW1zIHx8IGdvYWwuaXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm4geyBzY29yZTogNjAsIGhpbnQ6ICdcdTY1RTBcdTVCNTBcdTk4NzknIH07XG5cbiAgbGV0IHJlY2VudENvbXBsZXRpb25zID0gMDtcbiAgbGV0IG9sZGVyQ29tcGxldGlvbnMgPSAwO1xuICBjb25zdCByZWNlbnREYXlzID0gVFVOSU5HLlJFQ0VOVF9EQVlTO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjZW50RGF5czsgaSsrKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRvZGF5KTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgLSBpKTtcbiAgICBjb25zdCBrZXkgPSBmbXQoZCk7XG4gICAgcmVjZW50Q29tcGxldGlvbnMgKz0gY2FjaGVDb21wbGV0aW9uc09uRGF0ZShjYWNoZSwgZ29hbC5pZCwga2V5KTtcbiAgfVxuICBmb3IgKGxldCBpID0gcmVjZW50RGF5czsgaSA8IHJlY2VudERheXMgKiAyOyBpKyspIHtcbiAgICBjb25zdCBkID0gbmV3IERhdGUodG9kYXkpO1xuICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSAtIGkpO1xuICAgIGNvbnN0IGtleSA9IGZtdChkKTtcbiAgICBvbGRlckNvbXBsZXRpb25zICs9IGNhY2hlQ29tcGxldGlvbnNPbkRhdGUoY2FjaGUsIGdvYWwuaWQsIGtleSk7XG4gIH1cblxuICBpZiAocmVjZW50Q29tcGxldGlvbnMgPT09IDAgJiYgb2xkZXJDb21wbGV0aW9ucyA9PT0gMCkge1xuICAgIHJldHVybiB7IHNjb3JlOiA1MCwgaGludDogJ1x1OEZEMVx1NjcxRlx1NjVFMFx1NUI4Q1x1NjIxMCcgfTtcbiAgfVxuICBpZiAocmVjZW50Q29tcGxldGlvbnMgPiBvbGRlckNvbXBsZXRpb25zKSByZXR1cm4geyBzY29yZTogODUsIGhpbnQ6ICdcdTVCOENcdTYyMTBcdTUyQTBcdTkwMUYnIH07XG4gIGlmIChyZWNlbnRDb21wbGV0aW9ucyA9PT0gb2xkZXJDb21wbGV0aW9ucykgcmV0dXJuIHsgc2NvcmU6IDY1LCBoaW50OiAnXHU1QjhDXHU2MjEwXHU3QTMzXHU1QjlBJyB9O1xuICByZXR1cm4geyBzY29yZTogNDAsIGhpbnQ6ICdcdTVCOENcdTYyMTBcdTY1M0VcdTdGMTMnIH07XG59XG5cbmZ1bmN0aW9uIHNjb3JlTDIoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBpdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhMMiB7XG4gIGNvbnN0IHByb2dyZXNzVHJlbmQgPSBzY29yZVByb2dyZXNzVHJlbmQoZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHRvZGF5KTtcbiAgY29uc3QgY29tcGxldGlvblRyZW5kID0gc2NvcmVDb21wbGV0aW9uVHJlbmQoZ29hbCwgaXRlbXMsIGlzQ29tcGxldGUsIGNhY2hlLCBob2xpZGF5cywgdG9kYXkpO1xuICBjb25zdCBzY29yZSA9IGNsYW1wKFxuICAgIE1hdGgucm91bmQoXG4gICAgICAocHJvZ3Jlc3NUcmVuZC5zY29yZSAqIFRVTklORy5MMl9QUk9HUkVTU19UUkVORCArXG4gICAgICAgIGNvbXBsZXRpb25UcmVuZC5zY29yZSAqIFRVTklORy5MMl9DT01QTEVUSU9OX1RSRU5EKSAvXG4gICAgICAgIChUVU5JTkcuTDJfUFJPR1JFU1NfVFJFTkQgKyBUVU5JTkcuTDJfQ09NUExFVElPTl9UUkVORClcbiAgICApLFxuICAgIDAsXG4gICAgMTAwXG4gICk7XG4gIHJldHVybiB7IHNjb3JlOiBNYXRoLnJvdW5kKHNjb3JlKSwgcHJvZ3Jlc3NUcmVuZCwgY29tcGxldGlvblRyZW5kIH07XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCBMMyBcdTUzRUZcdTYzMDFcdTdFRURcdTYwMjdcdTUyMDZcdUZGMDhcdTUwNjVcdTVFQjdcdTdBMEJcdTVFQTZcdUZGMDkyNSUgXHUyNTAwXHUyNTAwXHUyNTAwXG5mdW5jdGlvbiBzY29yZVN0YWduYXRpb24oXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBfaXRlbXM6IEdvYWxTdWJJdGVtW10sXG4gIF9wcm9ncmVzczogbnVtYmVyLFxuICBpc0NvbXBsZXRlOiBib29sZWFuLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFN0YWduYXRpb24ge1xuICBpZiAoaXNDb21wbGV0ZSkgcmV0dXJuIHsgcGVuYWx0eTogMCwgaGludDogJ1x1NURGMlx1NUI4Q1x1NjIxMCcgfTtcbiAgaWYgKCFnb2FsLnN0YXJ0RGF0ZSkgcmV0dXJuIHsgcGVuYWx0eTogMCwgaGludDogJ1x1NjVFMFx1NUYwMFx1NTlDQlx1NjVFNVx1NjcxRicgfTtcblxuICBjb25zdCBzdGFydCA9IG5ldyBEYXRlKGdvYWwuc3RhcnREYXRlICsgJ1QwMDowMDowMCcpO1xuICBzdGFydC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgaWYgKHRvZGF5IDwgc3RhcnQpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICdcdTVDMUFcdTY3MkFcdTVGMDBcdTU5Q0InIH07XG5cbiAgbGV0IGxhc3RBY3RpdmVEYXRlOiBEYXRlIHwgbnVsbCA9IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgVFVOSU5HLlNUQUdOQVRJT05fV0lORE9XOyBpKyspIHtcbiAgICBjb25zdCBkID0gbmV3IERhdGUodG9kYXkpO1xuICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSAtIGkpO1xuICAgIGNvbnN0IGtleSA9IGZtdChkKTtcbiAgICBpZiAoY2FjaGVBY3RpdmVPbkRhdGUoY2FjaGUsIGdvYWwuaWQsIGtleSkpIHtcbiAgICAgIGxhc3RBY3RpdmVEYXRlID0gZDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmICghbGFzdEFjdGl2ZURhdGUpIHtcbiAgICBjb25zdCBzdGFnbmFudERheXMgPSB3b3JrZGF5c0JldHdlZW4oc3RhcnQsIHRvZGF5LCBob2xpZGF5cyk7XG4gICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKFxuICAgICAgVFVOSU5HLlNUQUdOQVRJT05fUEVOQUxUWV9NQVgsXG4gICAgICBNYXRoLnBvdyhzdGFnbmFudERheXMgLyBUVU5JTkcuU1RBR05BVElPTl9ESVZJU09SLCBUVU5JTkcuU1RBR05BVElPTl9FWFBPTkVOVClcbiAgICApO1xuICAgIHJldHVybiB7IHBlbmFsdHk6IE1hdGgucm91bmQocGVuYWx0eSksIGhpbnQ6IGBcdTRFQ0VcdTY3MkFcdTYzQThcdThGREIoJHtzdGFnbmFudERheXN9XHU1OTI5KWAgfTtcbiAgfVxuXG4gIGNvbnN0IHN0YWduYW50RGF5cyA9IHdvcmtkYXlzQmV0d2VlbihsYXN0QWN0aXZlRGF0ZSwgdG9kYXksIGhvbGlkYXlzKTtcbiAgaWYgKHN0YWduYW50RGF5cyA8PSAyKSByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnXHU4RkQxXHU2NzFGXHU2NzA5XHU2M0E4XHU4RkRCJyB9O1xuICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oXG4gICAgVFVOSU5HLlNUQUdOQVRJT05fUEVOQUxUWV9NQVgsXG4gICAgTWF0aC5wb3coc3RhZ25hbnREYXlzIC8gVFVOSU5HLlNUQUdOQVRJT05fRElWSVNPUiwgVFVOSU5HLlNUQUdOQVRJT05fRVhQT05FTlQpXG4gICk7XG4gIHJldHVybiB7IHBlbmFsdHk6IE1hdGgucm91bmQocGVuYWx0eSksIGhpbnQ6IGBcdTUwNUNcdTZFREUke3N0YWduYW50RGF5c31cdTRFMkFcdTVERTVcdTRGNUNcdTY1RTVgIH07XG59XG5cbmZ1bmN0aW9uIHNjb3JlQmFsYW5jZShpdGVtczogR29hbFN1Ykl0ZW1bXSwgaXNDb21wbGV0ZTogYm9vbGVhbik6IEhlYWx0aFN1YlNjb3JlIHtcbiAgaWYgKGlzQ29tcGxldGUpIHJldHVybiB7IHNjb3JlOiAxMDAsIGhpbnQ6ICdcdTVERjJcdTVCOENcdTYyMTAnIH07XG4gIGlmICghaXRlbXMgfHwgaXRlbXMubGVuZ3RoIDw9IDEpIHJldHVybiB7IHNjb3JlOiA4MCwgaGludDogJ1x1NUI1MFx1OTg3OVx1NEUwRFx1OERCMycgfTtcblxuICBjb25zdCBwcm9ncmVzc2VzID0gaXRlbXMubWFwKChpdCkgPT4ge1xuICAgIGNvbnN0IHRhciA9IHBhcnNlRmxvYXQoaXQudGFyZ2V0VmFsdWUgPz8gJzAnKTtcbiAgICBpZiAodGFyID09PSAwKSB7XG4gICAgICBjb25zdCBjdXIgPSBwYXJzZUZsb2F0KGl0LmN1cnJlbnRWYWx1ZSA/PyAnMCcpIHx8IDA7XG4gICAgICByZXR1cm4gY3VyID09PSAwID8gMTAwIDogMDtcbiAgICB9XG4gICAgY29uc3QgdGFyU2FmZSA9IHRhciB8fCAxMDA7XG4gICAgY29uc3QgY3VyID0gcGFyc2VGbG9hdChpdC5jdXJyZW50VmFsdWUgPz8gJzAnKSB8fCAwO1xuICAgIHJldHVybiAoY3VyIC8gdGFyU2FmZSkgKiAxMDA7XG4gIH0pO1xuXG4gIGNvbnN0IGF2ZyA9IHByb2dyZXNzZXMucmVkdWNlKChzLCB2KSA9PiBzICsgdiwgMCkgLyBwcm9ncmVzc2VzLmxlbmd0aDtcbiAgY29uc3QgdmFyaWFuY2UgPSBwcm9ncmVzc2VzLnJlZHVjZSgocywgdikgPT4gcyArIE1hdGgucG93KHYgLSBhdmcsIDIpLCAwKSAvIHByb2dyZXNzZXMubGVuZ3RoO1xuICBjb25zdCBzdGREZXYgPSBNYXRoLnNxcnQodmFyaWFuY2UpO1xuXG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoTWF0aC5yb3VuZCgxMDAgLSBzdGREZXYgKiBUVU5JTkcuQkFMQU5DRV9QRU5BTFRZX1JBVEUpLCAwLCAxMDApO1xuICByZXR1cm4ge1xuICAgIHNjb3JlLFxuICAgIGhpbnQ6IHN0ZERldiA+IDMwID8gJ1x1OEZEQlx1NUVBNlx1NEUwRFx1NTc0N1x1ODg2MScgOiBzdGREZXYgPiAxNSA/ICdcdThGREJcdTVFQTZcdTc1NjVcdTY3MDlcdTVERUVcdTVGMDInIDogJ1x1OEZEQlx1NUVBNlx1NTc0N1x1ODg2MScsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNjb3JlT3ZlckVhcmx5KFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgX3Byb2dyZXNzOiBudW1iZXIsXG4gIGlzQ29tcGxldGU6IGJvb2xlYW4sXG4gIGhvbGlkYXlzOiBTZXQ8c3RyaW5nPixcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFN0YWduYXRpb24ge1xuICBpZiAoIWdvYWwuZW5kRGF0ZSB8fCAhaXNDb21wbGV0ZSkgcmV0dXJuIHsgcGVuYWx0eTogMCwgaGludDogJycgfTtcbiAgY29uc3QgZW5kID0gbmV3IERhdGUoZ29hbC5lbmREYXRlICsgJ1QwMDowMDowMCcpO1xuICBlbmQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIGNvbnN0IGRheXNFYXJseSA9IHdvcmtkYXlzQmV0d2Vlbih0b2RheSwgZW5kLCBob2xpZGF5cyk7XG4gIGlmIChkYXlzRWFybHkgPiBUVU5JTkcuVE9MRVJBTkNFX0VBUkxZX0RBWVMpIHtcbiAgICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oXG4gICAgICBUVU5JTkcuT1ZFUl9FQVJMWV9QRU5BTFRZX01BWCxcbiAgICAgIGRheXNFYXJseSAqIFRVTklORy5PVkVSX0VBUkxZX1BFTkFMVFlfUkFURVxuICAgICk7XG4gICAgcmV0dXJuIHsgcGVuYWx0eTogTWF0aC5yb3VuZChwZW5hbHR5KSwgaGludDogYFx1OEZDN1x1NUVBNlx1OEQ4NVx1NTI0RCR7ZGF5c0Vhcmx5fVx1NTkyOWAgfTtcbiAgfVxuICByZXR1cm4geyBwZW5hbHR5OiAwLCBoaW50OiAnJyB9O1xufVxuXG5mdW5jdGlvbiBzY29yZURlbGF5KFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgX3Byb2dyZXNzOiBudW1iZXIsXG4gIF9pc0NvbXBsZXRlOiBib29sZWFuLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhTdGFnbmF0aW9uIHtcbiAgaWYgKCFnb2FsLmVuZERhdGUpIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICcnIH07XG4gIGNvbnN0IGVuZCA9IG5ldyBEYXRlKGdvYWwuZW5kRGF0ZSArICdUMDA6MDA6MDAnKTtcbiAgZW5kLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBjb25zdCBkYXlzTGF0ZSA9IHdvcmtkYXlzQmV0d2VlbihlbmQsIHRvZGF5LCBob2xpZGF5cyk7XG4gIGlmIChkYXlzTGF0ZSA+IFRVTklORy5UT0xFUkFOQ0VfREVMQVlfREFZUykge1xuICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbihUVU5JTkcuREVMQVlfUEVOQUxUWV9NQVgsIGRheXNMYXRlICogVFVOSU5HLkRFTEFZX1BFTkFMVFlfUkFURSk7XG4gICAgcmV0dXJuIHsgcGVuYWx0eTogTWF0aC5yb3VuZChwZW5hbHR5KSwgaGludDogYFx1NjJENlx1NUVGNiR7ZGF5c0xhdGV9XHU1OTI5YCB9O1xuICB9XG4gIHJldHVybiB7IHBlbmFsdHk6IDAsIGhpbnQ6ICcnIH07XG59XG5cbmZ1bmN0aW9uIHNjb3JlTDMoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBpdGVtczogR29hbFN1Ykl0ZW1bXSxcbiAgcHJvZ3Jlc3M6IG51bWJlcixcbiAgaXNDb21wbGV0ZTogYm9vbGVhbixcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICBob2xpZGF5czogU2V0PHN0cmluZz4sXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhMMyB7XG4gIGNvbnN0IHN0YWduYXRpb24gPSBzY29yZVN0YWduYXRpb24oZ29hbCwgaXRlbXMsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBjYWNoZSwgaG9saWRheXMsIHRvZGF5KTtcbiAgY29uc3QgYmFsYW5jZSA9IHNjb3JlQmFsYW5jZShpdGVtcywgaXNDb21wbGV0ZSk7XG4gIGNvbnN0IG92ZXJFYXJseSA9IHNjb3JlT3ZlckVhcmx5KGdvYWwsIHByb2dyZXNzLCBpc0NvbXBsZXRlLCBob2xpZGF5cywgdG9kYXkpO1xuICBjb25zdCBkZWxheSA9IHNjb3JlRGVsYXkoZ29hbCwgcHJvZ3Jlc3MsIGlzQ29tcGxldGUsIGhvbGlkYXlzLCB0b2RheSk7XG5cbiAgbGV0IHNjb3JlID0gMTAwO1xuICBzY29yZSAtPSBzdGFnbmF0aW9uLnBlbmFsdHk7XG4gIHNjb3JlID0gc2NvcmUgKiAoMSAtIFRVTklORy5MM19CQUxBTkNFKSArIGJhbGFuY2Uuc2NvcmUgKiBUVU5JTkcuTDNfQkFMQU5DRTtcbiAgc2NvcmUgLT0gb3ZlckVhcmx5LnBlbmFsdHk7XG4gIHNjb3JlIC09IGRlbGF5LnBlbmFsdHk7XG5cbiAgcmV0dXJuIHtcbiAgICBzY29yZTogY2xhbXAoTWF0aC5yb3VuZChzY29yZSksIDAsIDEwMCksXG4gICAgc3RhZ25hdGlvbixcbiAgICBiYWxhbmNlLFxuICAgIG92ZXJFYXJseSxcbiAgICBkZWxheSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbGV2ZWxGb3Ioc2NvcmU6IG51bWJlcik6IEhlYWx0aExldmVsIHtcbiAgaWYgKHNjb3JlID49IFRVTklORy5MRVZFTF9FWENFTExFTlQpIHJldHVybiAnZXhjZWxsZW50JztcbiAgaWYgKHNjb3JlID49IFRVTklORy5MRVZFTF9HT09EKSByZXR1cm4gJ2dvb2QnO1xuICBpZiAoc2NvcmUgPj0gVFVOSU5HLkxFVkVMX1dBUk5JTkcpIHJldHVybiAnd2FybmluZyc7XG4gIHJldHVybiAncmlzayc7XG59XG5cbi8qKiBcdTUzNTVcdTc2RUVcdTY4MDdcdTUwNjVcdTVFQjdcdTUyMDZcdUZGMDhcdTU0MkIgTDEvTDIvTDMgXHU2NjBFXHU3RUM2ICsgXHU2MDNCXHU1MjA2ICsgXHU3QjQ5XHU3RUE3XHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUdvYWxIZWFsdGgoXG4gIGdvYWw6IEdvYWxJdGVtLFxuICBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsXG4gIHRvZGF5OiBEYXRlXG4pOiBIZWFsdGhSZXN1bHQge1xuICBjb25zdCBpdGVtcyA9IEFycmF5LmlzQXJyYXkoZ29hbC5pdGVtcykgPyBnb2FsLml0ZW1zIDogW107XG4gIGNvbnN0IHByb2dyZXNzID0gY2xhbXAoTnVtYmVyKGdvYWwucHJvZ3Jlc3MpIHx8IDAsIDAsIDEwMCk7XG4gIGNvbnN0IGlzQ29tcGxldGUgPSBwcm9ncmVzcyA+PSAxMDA7XG4gIC8vIFx1N0VERlx1NEUwMFx1NUY1Mlx1NEUwMFx1NEUzQVx1NUY1M1x1NjVFNSAwIFx1NzBCOVx1RkYwQ1x1OTA3Rlx1NTE0RCBob3VycyBcdTUwNEZcdTVERUVcdTVGNzFcdTU0Q0RcdTVERTVcdTRGNUNcdTY1RTUvXHU1MDVDXHU2RURFXHU1MjI0XHU1QjlBXG4gIGNvbnN0IHQgPSBuZXcgRGF0ZSh0b2RheS5nZXRGdWxsWWVhcigpLCB0b2RheS5nZXRNb250aCgpLCB0b2RheS5nZXREYXRlKCkpO1xuICBjb25zdCBob2xpZGF5cyA9IF9nZXRIb2xpZGF5cyh0LmdldEZ1bGxZZWFyKCkpO1xuXG4gIGNvbnN0IEwxID0gc2NvcmVMMShnb2FsLCBpdGVtcywgcHJvZ3Jlc3MsIGlzQ29tcGxldGUsIGNhY2hlLCBob2xpZGF5cywgdCk7XG4gIGNvbnN0IEwyID0gc2NvcmVMMihnb2FsLCBpdGVtcywgcHJvZ3Jlc3MsIGlzQ29tcGxldGUsIGNhY2hlLCBob2xpZGF5cywgdCk7XG4gIGNvbnN0IEwzID0gc2NvcmVMMyhnb2FsLCBpdGVtcywgcHJvZ3Jlc3MsIGlzQ29tcGxldGUsIGNhY2hlLCBob2xpZGF5cywgdCk7XG5cbiAgY29uc3Qgc2NvcmUgPSBjbGFtcChcbiAgICBNYXRoLnJvdW5kKFxuICAgICAgTDEuc2NvcmUgKiBUVU5JTkcuV0VJR0hUX0wxICtcbiAgICAgICAgTDIuc2NvcmUgKiBUVU5JTkcuV0VJR0hUX0wyICtcbiAgICAgICAgTDMuc2NvcmUgKiBUVU5JTkcuV0VJR0hUX0wzXG4gICAgKSxcbiAgICAwLFxuICAgIDEwMFxuICApO1xuICBjb25zdCBsZXZlbCA9IGxldmVsRm9yKHNjb3JlKTtcblxuICByZXR1cm4ge1xuICAgIHNjb3JlLFxuICAgIGxldmVsLFxuICAgIGxhYmVsOiBMRVZFTFNbbGV2ZWxdLmxhYmVsLFxuICAgIGNvbG9yOiBMRVZFTFNbbGV2ZWxdLmNvbG9yLFxuICAgIEwxLFxuICAgIEwyLFxuICAgIEwzLFxuICB9O1xufVxuXG4vKiogXHU3NkVFXHU2ODA3XHU5NkM2XHU1MDY1XHU1RUI3XHU1MjA2XHU4MDVBXHU1NDA4XHVGRjA4XHU1OTFBXHU3RUY0XHU1RTczXHU1NzQ3XHU1MjA2ICsgXHU3RUZDXHU1NDA4XHU4RDhCXHU1MkJGXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUhlYWx0aFNldChcbiAgZ29hbHM6IEdvYWxJdGVtW10sXG4gIGNhY2hlOiBEZXZpYXRpb25DYWNoZSxcbiAgdG9kYXk6IERhdGVcbik6IEhlYWx0aFNldCB7XG4gIGlmICghZ29hbHMgfHwgZ29hbHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGF2Z1Njb3JlOiAwLFxuICAgICAgYXZnTGV2ZWw6ICdyaXNrJyxcbiAgICAgIGF2Z0xhYmVsOiAnXHUyMDE0JyxcbiAgICAgIGF2Z0NvbG9yOiAnIzk5OScsXG4gICAgICBjb3VudDogMCxcbiAgICAgIEwxOiAwLFxuICAgICAgTDI6IDAsXG4gICAgICBMMzogMCxcbiAgICAgIHRyZW5kOiAwLFxuICAgIH07XG4gIH1cblxuICBjb25zdCByZXN1bHRzID0gZ29hbHMubWFwKChnKSA9PiBjb21wdXRlR29hbEhlYWx0aChnLCBjYWNoZSwgdG9kYXkpKTtcbiAgY29uc3QgYXZnU2NvcmUgPSBNYXRoLnJvdW5kKHJlc3VsdHMucmVkdWNlKChzLCByKSA9PiBzICsgci5zY29yZSwgMCkgLyByZXN1bHRzLmxlbmd0aCk7XG4gIGNvbnN0IGF2Z0wxID0gTWF0aC5yb3VuZChyZXN1bHRzLnJlZHVjZSgocywgcikgPT4gcyArIHIuTDEuc2NvcmUsIDApIC8gcmVzdWx0cy5sZW5ndGgpO1xuICBjb25zdCBhdmdMMiA9IE1hdGgucm91bmQocmVzdWx0cy5yZWR1Y2UoKHMsIHIpID0+IHMgKyByLkwyLnNjb3JlLCAwKSAvIHJlc3VsdHMubGVuZ3RoKTtcbiAgY29uc3QgYXZnTDMgPSBNYXRoLnJvdW5kKHJlc3VsdHMucmVkdWNlKChzLCByKSA9PiBzICsgci5MMy5zY29yZSwgMCkgLyByZXN1bHRzLmxlbmd0aCk7XG4gIGNvbnN0IGF2Z0xldmVsID0gbGV2ZWxGb3IoYXZnU2NvcmUpO1xuXG4gIGxldCB0cmVuZCA9IDA7XG4gIGNvbnN0IGF2Z0wyU2NvcmUgPSByZXN1bHRzLnJlZHVjZSgocywgcikgPT4gcyArIHIuTDIuc2NvcmUsIDApIC8gcmVzdWx0cy5sZW5ndGg7XG4gIGlmIChhdmdMMlNjb3JlID49IFRVTklORy5UUkVORF9TVFJPTkdfSElHSCkgdHJlbmQgPSAzO1xuICBlbHNlIGlmIChhdmdMMlNjb3JlID49IFRVTklORy5UUkVORF9XRUFLX0hJR0gpIHRyZW5kID0gMTtcbiAgZWxzZSBpZiAoYXZnTDJTY29yZSA8IFRVTklORy5UUkVORF9TVFJPTkdfTE9XKSB0cmVuZCA9IC0zO1xuICBlbHNlIGlmIChhdmdMMlNjb3JlIDwgVFVOSU5HLlRSRU5EX1dFQUtfTE9XKSB0cmVuZCA9IC0xO1xuXG4gIHJldHVybiB7XG4gICAgYXZnU2NvcmUsXG4gICAgYXZnTGV2ZWwsXG4gICAgYXZnTGFiZWw6IExFVkVMU1thdmdMZXZlbF0ubGFiZWwsXG4gICAgYXZnQ29sb3I6IExFVkVMU1thdmdMZXZlbF0uY29sb3IsXG4gICAgY291bnQ6IGdvYWxzLmxlbmd0aCxcbiAgICBMMTogYXZnTDEsXG4gICAgTDI6IGF2Z0wyLFxuICAgIEwzOiBhdmdMMyxcbiAgICB0cmVuZCxcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTYzMDlcdTMwMENcdTdFRjRcdTVFQTZcdTMwMERcdTc1MUZcdTYyMTBcdTUwNjVcdTVFQjdcdTVGNTJcdTU2RTAgaGludHNcdUZGMDhcdTc5RkJcdTY5MEQgd2ViYXBwIGdlbmVyYXRlRHluYW1pY0hpbnRzXHVGRjBDXG4gKiBcdTZCQ0ZcdTY3NjFcdTk4OURcdTU5MTZcdTY4MDdcdTZDRTggZGltZW5zaW9uXHVGRjBDXHU0RjlCXHU4QkNBXHU2NUFEXHU2M0QwXHU3OTNBXHU4QkNEXHU2MzA5XHU3RUY0XHU1RUE2XHU1QkY5XHU5RjUwXHU1RUZBXHU4QkFFXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUhlYWx0aEhpbnRzKHJlc3VsdDogSGVhbHRoUmVzdWx0LCBfc2V0PzogSGVhbHRoU2V0KTogSGVhbHRoSGludFtdIHtcbiAgY29uc3QgaGludHM6IEhlYWx0aEhpbnRbXSA9IFtdO1xuXG4gIGlmIChyZXN1bHQuTDEuc2NvcmUgPCBUVU5JTkcuSElOVF9MMSkge1xuICAgIGlmIChyZXN1bHQuTDEub25UaW1lLnNjb3JlIDwgVFVOSU5HLkhJTlRfTEFURV9HT0FMX1NDT1JFKSB7XG4gICAgICBoaW50cy5wdXNoKHtcbiAgICAgICAgZGltZW5zaW9uOiAnTDEnLFxuICAgICAgICB0eXBlOiAnZGFuZ2VyJyxcbiAgICAgICAgaWNvbjogJ2NhbGVuZGFyJyxcbiAgICAgICAgdGV4dDogJ1x1N0I5N1x1NkNENVx1NjhDMFx1NkQ0Qlx1NTIzMFx1OEJFNVx1NzZFRVx1NjgwN1x1OEZEQlx1NUVBNlx1NEUyNVx1OTFDRFx1ODQzRFx1NTQwRVx1NEU4RVx1OEJBMVx1NTIxMlx1MzAwMicsXG4gICAgICAgIGFjdGlvbjogJ1x1NjgzOVx1NjM2RVx1NUY1M1x1NTI0RFx1NUI4Q1x1NjIxMFx1OTAxRlx1NzM4N1x1RkYwQ1x1NUVGQVx1OEJBRVx1OEMwM1x1NjU3NFx1NjIyQVx1NkI2Mlx1NjVFNVx1NjcxRlx1NjIxNlx1N0NCRVx1N0I4MFx1NEVGQlx1NTJBMVx1NUI1MFx1OTg3OVx1MzAwMicsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5MMS5zY29yZSA8IDUwKSB7XG4gICAgICBoaW50cy5wdXNoKHtcbiAgICAgICAgZGltZW5zaW9uOiAnTDEnLFxuICAgICAgICB0eXBlOiAnd2FybmluZycsXG4gICAgICAgIGljb246ICd6YXAnLFxuICAgICAgICB0ZXh0OiAnXHU3Q0ZCXHU3RURGXHU3NkQxXHU2RDRCXHU1MjMwXHU2NzJDXHU1NDY4XHU2RDNCXHU4REMzXHU1OTI5XHU2NTcwXHU2NzJBXHU4RkJFXHU2ODA3XHUzMDAyJyxcbiAgICAgICAgYWN0aW9uOiAnXHU2NTcwXHU2MzZFXHU4ODY4XHU2NjBFXHVGRjFBXHU1QzBGXHU2QjY1XHU1RkVCXHU4REQxXHU3Njg0XHU5ODkxXHU3Mzg3XHU2QkQ0XHU1MzU1XHU2QjIxXHU5NTdGXHU2NUY2XHU5NUY0XHU2Mjk1XHU1MTY1XHU2NkY0XHU2NzA5XHU1MkE5XHU0RThFXHU3RUY0XHU2MzAxXHU3NkVFXHU2ODA3XHU1MDY1XHU1RUI3XHUzMDAyJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChyZXN1bHQuTDIuc2NvcmUgPCBUVU5JTkcuSElOVF9MMikge1xuICAgIGhpbnRzLnB1c2goe1xuICAgICAgZGltZW5zaW9uOiAnTDInLFxuICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgaWNvbjogJ3RyZW5kaW5nLXVwJyxcbiAgICAgIHRleHQ6ICdcdTUyQThcdTUyOUJcdTYzMDdcdTY1NzBcdTRFMEJcdTk2NERcdUZGMUFcdThGRDFcdTY3MUZcdThGREJcdTVFQTZcdTU4OUVcdTkxQ0ZcdTRGNEVcdTRFOEVcdTUzODZcdTUzRjJcdTVFNzNcdTU3NDdcdTZDMzRcdTVFNzNcdTMwMDInLFxuICAgICAgYWN0aW9uOiAnXHU2MjY3XHU4ODRDXHU1MkE4XHU1MjlCXHU4RkRCXHU1MTY1XHU3NEY2XHU5ODg4XHU2NzFGXHVGRjBDXHU1RUZBXHU4QkFFXHU5MDFBXHU4RkM3XHU1QjhDXHU2MjEwXHU0RTAwXHU0RTJBXHU3QjgwXHU1MzU1XHU3Njg0XHU1QjUwXHU5ODc5XHU2NzY1XHU5MUNEXHU2NUIwXHU2RkMwXHU2RDNCXHU2MEVGXHU2MDI3XHUzMDAyJyxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFx1NjMwOVx1MzAwQ1x1NUI1MFx1N0VGNFx1NUVBNlx1MzAwRFx1NTQwNFx1ODFFQVx1ODlFNlx1NTNEMVx1RkYwOFx1NEUwRFx1NTM2MSBjb21wb3NpdGUgTDMuc2NvcmVcdUZGMENcdTU0MjZcdTUyMTlcdTUzNTVcdTc2RUVcdTY4MDdcdTUwNEZcdTc5RDFcdTRGMUFcdTg4QUJcdTYzQTlcdTc2RDZcdUZGMDlcbiAgaWYgKHJlc3VsdC5MMy5zdGFnbmF0aW9uLnBlbmFsdHkgPiBUVU5JTkcuSElOVF9TVEFHTkFUSU9OX1BFTkFMVFkpIHtcbiAgICBoaW50cy5wdXNoKHtcbiAgICAgIGRpbWVuc2lvbjogJ0wzJyxcbiAgICAgIHR5cGU6ICdkYW5nZXInLFxuICAgICAgaWNvbjogJ2Nsb2NrJyxcbiAgICAgIHRleHQ6ICdcdTY4QzBcdTZENEJcdTUyMzBcdThCRTVcdTc2RUVcdTY4MDdcdTVERjJcdTUwNUNcdTZFREVcdThEODVcdThGQzdcdTk4ODRcdTY3MUZcdTk2MDhcdTUwM0NcdTMwMDInLFxuICAgICAgYWN0aW9uOiAnXHU5NTdGXHU2NzFGXHU1MDVDXHU2RURFXHU0RjFBXHU2NjNFXHU4NDU3XHU5NjREXHU0RjRFXHU1QjhDXHU2MjEwXHU2OTgyXHU3Mzg3XHVGRjBDXHU1RUZBXHU4QkFFXHU3QUNCXHU1MzczXHU1OTBEXHU2N0U1XHU5ODc5XHU3NkVFXHU1M0VGXHU4ODRDXHU2MDI3XHUzMDAyJyxcbiAgICB9KTtcbiAgfVxuICBpZiAocmVzdWx0LkwzLmJhbGFuY2Uuc2NvcmUgPCBUVU5JTkcuSElOVF9CQUxBTkNFX1NDT1JFKSB7XG4gICAgaGludHMucHVzaCh7XG4gICAgICBkaW1lbnNpb246ICdMMycsXG4gICAgICB0eXBlOiAnd2FybmluZycsXG4gICAgICBpY29uOiAnc2NhbGUnLFxuICAgICAgdGV4dDogJ1x1NUI1MFx1OTg3OVx1NjVCOVx1NURFRVx1OEZDN1x1NTkyN1x1RkYxQVx1OTg3OVx1NzZFRVx1NTE4NVx1OTBFOFx1OEZEQlx1NUVBNlx1NTIwNlx1NUUwM1x1NEUyNVx1OTFDRFx1NEUwRFx1NTc0N1x1MzAwMicsXG4gICAgICBhY3Rpb246ICdcdTUxNzNcdTZDRThcdTg4QUJcdTk1N0ZcdTY3MUZcdTVGRkRcdTc1NjVcdTc2ODRcdThGQjlcdTdGMThcdTVCNTBcdTk4NzlcdUZGMENcdTk2MzJcdTZCNjJcdTk4NzlcdTc2RUVcdTU0MEVcdTY3MUZcdTUxRkFcdTczQjBcdTdFRDNcdTY3ODRcdTYwMjdcdTVEMjlcdTU4NENcdTMwMDInLFxuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlc3VsdC5zY29yZSA+PSBUVU5JTkcuSElOVF9ISUdIX1NDT1JFKSB7XG4gICAgaGludHMucHVzaCh7XG4gICAgICBkaW1lbnNpb246ICdMMScsXG4gICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICBpY29uOiAnc3BhcmtsZXMnLFxuICAgICAgdGV4dDogJ1x1N0I5N1x1NkNENVx1OEJDNFx1NEYzMFx1RkYxQVx1NjIxOFx1NzU2NVx1NjI2N1x1ODg0Q1x1NTI5Qlx1NTkwNFx1NEU4RVx1Njc4MVx1OUFEOFx1NkMzNFx1NUU3M1x1MzAwMicsXG4gICAgICBhY3Rpb246ICdcdTVGNTNcdTUyNERcdTY1NzBcdTYzNkVcdTZBMjFcdTU3OEJcdTY2M0VcdTc5M0FcdTRGNjBcdTVERjJcdTVFRkFcdTdBQ0JcdTdBMzNcdTU2RkFcdTc2ODRcdTRFNjBcdTYwRUZcdTk1RURcdTczQUZcdUZGMENcdTVFRkFcdThCQUVcdTRGRERcdTYzMDFcdTczQjBcdTcyQjZcdTMwMDInLFxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGhpbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGhpbnRzLnB1c2goe1xuICAgICAgZGltZW5zaW9uOiAnTDEnLFxuICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgaWNvbjogJ2NoZWNrLWNpcmNsZScsXG4gICAgICB0ZXh0OiAnXHU3Q0ZCXHU3RURGXHU4QkM0XHU0RjMwXHVGRjFBXHU1NDA0XHU3RUY0XHU1RUE2XHU2NTcwXHU2MzZFXHU2MzA3XHU2ODA3XHU1RTczXHU3QTMzXHUzMDAyJyxcbiAgICAgIGFjdGlvbjogJ1x1NUY1M1x1NTI0RFx1ODI4Mlx1NTk0Rlx1NTNFRlx1NjMwMVx1N0VFRFx1RkYwQ1x1NTNFRlx1NUMxRFx1OEJENVx1OTAxMFx1NkI2NVx1NTg5RVx1NTJBMFx1NEVGQlx1NTJBMVx1OEQxRlx1ODM3N1x1MzAwMicsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gaGludHM7XG59XG5cbi8qKiBcdThGRDRcdTU2REVcdTY3MDBcdTVGMzFcdTdFRjRcdTVFQTZcdTk1MkVcdUZGMENcdTVFNzZcdTUyMTdcdTY3MDBcdTRGNEVcdTY1RjZcdTYzMDlcdTY3NDNcdTkxQ0RcdTUzRDZcdUZGMDhMMSA+IEwyID4gTDNcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWFrZXN0RGltZW5zaW9uKHI6IEhlYWx0aFJlc3VsdCk6IEhlYWx0aERpbWVuc2lvbiB7XG4gIGNvbnN0IGFycjogQXJyYXk8eyBkaW06IEhlYWx0aERpbWVuc2lvbjsgc2NvcmU6IG51bWJlcjsgd2VpZ2h0OiBudW1iZXIgfT4gPSBbXG4gICAgeyBkaW06ICdMMScsIHNjb3JlOiByLkwxLnNjb3JlLCB3ZWlnaHQ6IFRVTklORy5XRUlHSFRfTDEgfSxcbiAgICB7IGRpbTogJ0wyJywgc2NvcmU6IHIuTDIuc2NvcmUsIHdlaWdodDogVFVOSU5HLldFSUdIVF9MMiB9LFxuICAgIHsgZGltOiAnTDMnLCBzY29yZTogci5MMy5zY29yZSwgd2VpZ2h0OiBUVU5JTkcuV0VJR0hUX0wzIH0sXG4gIF07XG4gIGxldCBtaW4gPSBhcnJbMF07XG4gIGZvciAoY29uc3QgeCBvZiBhcnIpIHtcbiAgICBpZiAoeC5zY29yZSA8IG1pbi5zY29yZSkgbWluID0geDtcbiAgICBlbHNlIGlmICh4LnNjb3JlID09PSBtaW4uc2NvcmUgJiYgeC53ZWlnaHQgPiBtaW4ud2VpZ2h0KSBtaW4gPSB4O1xuICB9XG4gIHJldHVybiBtaW4uZGltO1xufVxuIiwgIi8qKlxuICogcnVuRGlhZ25vc2lzIFx1MjAxNCBcdTMwMENBSSBcdThCQ0FcdTY1QUQgXHUyMTkyIFx1ODg0Q1x1NTJBOFx1OTVFRFx1NzNBRlx1MzAwRFx1NTQ3RFx1NEVFNFx1N0YxNlx1NjM5Mlx1RkYwOFx1N0VBRlx1OTAzQlx1OEY5MVx1RkYwQ1x1NTNFRlx1NTM1NVx1NkQ0Qlx1RkYwOVxuICpcbiAqIFx1NTNFQVx1OEQxRlx1OEQyM1x1NkQ0MVx1N0EwQlx1NTFCM1x1N0I1Nlx1RkYwQ1x1NEUwRFx1NjMwMVx1NjcwOVx1NEVGQlx1NEY1NSBPYnNpZGlhbiAvIERPTSBcdTRGOURcdThENTZcdUZGMUFcbiAqICAtIGFpRW5hYmxlZCBcdTk1RThcdTc5ODEgXHUyMTkyIFx1NjVFMFx1NzZFRVx1NjgwNyBcdTIxOTIgXHU4QkZCIGdvYWxzICsgXHU4RkQxIE4gXHU1OTI5IGRheXMgXHUyMTkyIGRpYWdub3NlIFx1MjE5MiBcdTYyNTNcdTVGMDBcdTUzRUFcdThCRkJcdTYyQTVcdTU0NEFcdUZGMUJcbiAqICAtIFx1NjJBNVx1NTQ0QVx1OTFDQ1x1NzBCOVx1MzAwQ1x1NUU5NFx1NzUyOFx1MzAwRFx1MjE5MiBcdTYyNTNcdTVGMDAgQWdlbnRpY1BsYW5Nb2RhbFx1RkYwOFx1OEY3RFx1NTE2NVx1NzcxRlx1NUI5RVx1NjgxMSArIFx1OTg4NFx1NTg2Qlx1NUVGQVx1OEJBRVx1NjMwN1x1NEVFNFx1RkYwOVx1RkYxQlxuICogIC0gQWdlbnRpYyBcdTc4NkVcdThCQTQgXHUyMTkyIHdyaXRlR29hbHMgXHU4NDNEXHU1RTkzXHUzMDAyXG4gKiBcdTYyNDBcdTY3MDlcdTUyNkZcdTRGNUNcdTc1MjhcdUZGMDhcdThCRkJcdTVCNThcdTUwQTggLyBcdTYyNTNcdTVGMDAgTW9kYWwgLyBOb3RpY2UgLyBcdTg0M0RcdTVFOTNcdUZGMDlcdTU3NDdcdTkwMUFcdThGQzcgZGVwcyBcdTZDRThcdTUxNjVcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBQbGFubmVyU2V0dGluZ3MgfSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQgdHlwZSB7IEdvYWxJdGVtLCBEYXlEYXRhIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5pbXBvcnQgeyBkaWFnbm9zZSwgdHlwZSBEaWFnbm9zaXNSZXN1bHQsIHR5cGUgR29hbERpYWdub3NpcyB9IGZyb20gJy4vR29hbERpYWdub3Nlcic7XG5pbXBvcnQgeyBidWlsZENhY2hlLCBidWlsZEl0ZW1FdmlkZW5jZU1hcCwgdHlwZSBJdGVtRXZpZGVuY2UgfSBmcm9tICcuL0RldmlhdGlvbkNhbGN1bGF0b3InO1xuaW1wb3J0IHsgVFVOSU5HIH0gZnJvbSAnLi9oZWFsdGhTY29yZSc7XG5pbXBvcnQgdHlwZSB7IEFnZW50aWNQbGFuT3B0aW9ucyB9IGZyb20gJy4vQWdlbnRpY1BsYW5Nb2RhbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc2lzU3RvcmFnZSB7XG4gIGdldEdvYWxzKCk6IFByb21pc2U8R29hbEl0ZW1bXT47XG4gIGdldERheUtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT47XG4gIGdldERheShrZXk6IHN0cmluZyk6IFByb21pc2U8RGF5RGF0YSB8IG51bGw+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3Npc0RlcHMge1xuICBhaUVuYWJsZWQ6IGJvb2xlYW47XG4gIHBsYW5uZXJTZXR0aW5nczogUGxhbm5lclNldHRpbmdzO1xuICBzdG9yYWdlOiBEaWFnbm9zaXNTdG9yYWdlO1xuICBkaWFnbm9zZTogdHlwZW9mIGRpYWdub3NlO1xuICBvcGVuRGlhZ25vc2lzOiAob3B0czoge1xuICAgIGRpYWdub3NpczogRGlhZ25vc2lzUmVzdWx0O1xuICAgIGl0ZW1FdmlkZW5jZT86IFJlY29yZDxzdHJpbmcsIEl0ZW1FdmlkZW5jZVtdPjtcbiAgICBvbkFwcGx5OiAoZ29hbDogR29hbERpYWdub3NpcykgPT4gdm9pZDtcbiAgfSkgPT4gdm9pZDtcbiAgb3BlbkFnZW50aWM6IChvcHRzOiBBZ2VudGljUGxhbk9wdGlvbnMpID0+IHZvaWQ7XG4gIHdyaXRlR29hbHM6IChnb2FsczogR29hbEl0ZW1bXSkgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gIG5vdGljZTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xuICByZWNlbnREYXlzPzogbnVtYmVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRGlhZ25vc2lzKGRlcHM6IERpYWdub3Npc0RlcHMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCFkZXBzLmFpRW5hYmxlZCkge1xuICAgIGRlcHMubm90aWNlKCdBSSBcdThCQ0FcdTY1QURcdTY3MkFcdTU0MkZcdTc1MjhcdUZGMUFcdThCRjdcdTUxNDhcdTU3MjhcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTRFMkRcdTVGMDBcdTU0MkZcdTVFNzZcdTU4NkJcdTUxOTkgQVBJIEtleScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGFsbCA9IGF3YWl0IGRlcHMuc3RvcmFnZS5nZXRHb2FscygpO1xuICBpZiAoYWxsLmxlbmd0aCA9PT0gMCkge1xuICAgIGRlcHMubm90aWNlKCdcdTRGNjBcdThGRDhcdTZDQTFcdTY3MDlcdTc2RUVcdTY4MDdcdUZGMENcdTUxNDhcdThERDFcdTRFMDBcdTZCMjEgQUkgXHU4OUM0XHU1MjEyJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gXHU1M0VBXHU4QkNBXHU2NUFEXHU4RkRCXHU4ODRDXHU0RTJEXHU3Njg0XHU3NkVFXHU2ODA3XHVGRjBDXHU1REYyXHU1RjUyXHU2ODYzXHU3NkVFXHU2ODA3XHVGRjA4YXJjaGl2ZWQ9dHJ1ZVx1RkYwOVx1NEUwRFx1NTNDMlx1NEUwRVxuICBjb25zdCBnb2FscyA9IGFsbC5maWx0ZXIoKGcpID0+ICFnLmFyY2hpdmVkKTtcbiAgaWYgKGdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIGRlcHMubm90aWNlKCdcdTVGNTNcdTUyNERcdTZDQTFcdTY3MDlcdThGREJcdTg4NENcdTRFMkRcdTc2ODRcdTc2RUVcdTY4MDdcdUZGMDhcdTVERjJcdTVGNTJcdTY4NjNcdTc2RUVcdTY4MDdcdTRFMERcdTUzQzJcdTRFMEVcdThCQ0FcdTY1QURcdUZGMDknKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBcdTUwNjVcdTVFQjdcdTUyMDZcdTUwNUNcdTZFREVcdTUyMjRcdTVCOUFcdTk3MDBcdTU2REVcdTZFQUYgU1RBR05BVElPTl9XSU5ET1coNjApIFx1NEUyQVx1NURFNVx1NEY1Q1x1NjVFNVx1RkYwQ1x1NjU0NVx1NjJDOVx1NTNENlx1N0E5N1x1NTNFM1x1NEUwRFx1NUMwRlx1NEU4RVx1NkI2NFxuICBjb25zdCB3aW5kb3dEYXlzID0gTWF0aC5tYXgoZGVwcy5yZWNlbnREYXlzID8/IDE0LCBUVU5JTkcuU1RBR05BVElPTl9XSU5ET1cpO1xuICBjb25zdCBrZXlzID0gKGF3YWl0IGRlcHMuc3RvcmFnZS5nZXREYXlLZXlzKCkpLnNsaWNlKDAsIHdpbmRvd0RheXMpO1xuICBjb25zdCBkYXlzOiBEYXlEYXRhW10gPSBbXTtcbiAgZm9yIChjb25zdCBrIG9mIGtleXMpIHtcbiAgICBjb25zdCBkID0gYXdhaXQgZGVwcy5zdG9yYWdlLmdldERheShrKTtcbiAgICBpZiAoZCkgZGF5cy5wdXNoKGQpO1xuICB9XG5cbiAgLy8gXHU1N0ZBXHU0RThFXHU3NzFGXHU1QjlFXHU1QjUwXHU5ODc5ICsgXHU1QjhDXHU2MjEwXHU4QkIwXHU1RjU1XHVGRjBDXHU3RUQ5XHU2MkE1XHU1NDRBXHU1RjM5XHU3QTk3XHU2M0QwXHU0RjlCXHU4QkMxXHU2MzZFXG4gIGNvbnN0IGNhY2hlID0gYnVpbGRDYWNoZShnb2FscywgZGF5cyk7XG4gIGNvbnN0IGl0ZW1FdmlkZW5jZSA9IGJ1aWxkSXRlbUV2aWRlbmNlTWFwKGdvYWxzLCBjYWNoZSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGVwcy5kaWFnbm9zZShnb2FscywgZGF5cywgZGVwcy5wbGFubmVyU2V0dGluZ3MpO1xuXG4gIGRlcHMub3BlbkRpYWdub3Npcyh7XG4gICAgZGlhZ25vc2lzOiByZXN1bHQsXG4gICAgaXRlbUV2aWRlbmNlLFxuICAgIG9uQXBwbHk6IChnb2FsKSA9PiB7XG4gICAgICBkZXBzLm9wZW5BZ2VudGljKHtcbiAgICAgICAgY29udGVudDogJycsXG4gICAgICAgIHNjb3BlOiAnbm90ZScsXG4gICAgICAgIHNldHRpbmdzOiBkZXBzLnBsYW5uZXJTZXR0aW5ncyxcbiAgICAgICAgZ29hbHMsXG4gICAgICAgIGluaXRpYWxJbnN0cnVjdGlvbjogZ29hbC5zdWdnZXN0aW9ucy5qb2luKCdcdUZGMUInKSxcbiAgICAgICAgb25Db25maXJtOiAoZmluYWxHb2FscykgPT4gdm9pZCBkZXBzLndyaXRlR29hbHMoZmluYWxHb2FscyksXG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG9CQUFtRTs7O0FDQW5FLElBQUFDLG1CQUFrRDs7O0FDQWxELHNCQUE0RDs7O0FDOEI1RCxJQUFJLEtBQUs7QUFBVCxJQUFxQixNQUFNO0FBQTNCLElBQXdDLE1BQU07QUFFOUMsSUFBSSxPQUFPLElBQUksR0FBRztBQUFBLEVBQUM7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUE7QUFBQSxFQUFnQjtBQUFBLEVBQUc7QUFBQTtBQUFBLEVBQW9CO0FBQUMsQ0FBQztBQUVoSixJQUFJLE9BQU8sSUFBSSxHQUFHO0FBQUEsRUFBQztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7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O0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLGVBQWUsQ0FBQyxNQUFNLElBQUksZUFBZSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUMzRCxhQUFhLENBQUMsTUFBTSxJQUFJLGlCQUFpQixLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUMzRCxZQUFZLENBQUMsTUFBTSxLQUFLLEtBQUssb0JBQW9CLENBQUM7QUFBQSxNQUNsRCxRQUFRLENBQUMsTUFBTSxJQUFJLHlCQUFPLENBQUM7QUFBQSxNQUMzQixZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDSDtBQUFBO0FBQUEsRUFHQSxNQUFjLG9CQUFvQixPQUFrQztBQUNsRSxVQUFNLFVBQVUsSUFBSSxhQUFhLEtBQUssR0FBRztBQUN6QyxVQUFNLFFBQVEsU0FBUyxLQUFLO0FBQzVCLFNBQUssT0FBTyxtQkFBbUI7QUFDL0IsUUFBSSx5QkFBTyxzQkFBTyxNQUFNLE1BQU0seUVBQWtCO0FBQUEsRUFDbEQ7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEVBQUUsVUFBVSxJQUFJLEtBQUs7QUFFM0IsUUFBSSxPQUE2QjtBQUNqQyxVQUFNLFNBQVMsVUFBVSxnQkFBZ0Isc0JBQXNCO0FBRS9ELFFBQUksT0FBTyxTQUFTLEdBQUc7QUFFckIsYUFBTyxPQUFPLENBQUM7QUFBQSxJQUNqQixPQUFPO0FBRUwsYUFBTyxVQUFVLFFBQVEsS0FBSztBQUM5QixZQUFNLEtBQUssYUFBYTtBQUFBLFFBQ3RCLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBRUEsUUFBSSxNQUFNO0FBQ1IsWUFBTSxVQUFVLFdBQVcsSUFBSTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFNBQUssV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixNQUFNLEtBQUssU0FBUyxDQUFDO0FBQUEsRUFDM0U7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImwiLCAiX2EiLCAiX2EiLCAiX2EiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJtYXgiLCAiZXJyIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJlcnIiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJzdW1tYXJpemUiLCAiY2xhbXAiLCAiY291bnRXb3JrZGF5cyIsICJkaWZmIiwgInN0YWduYW50RGF5cyIsICJwZW5hbHR5IiwgImN1ciIsICJzdW1tYXJpemUiXQp9Cg==
