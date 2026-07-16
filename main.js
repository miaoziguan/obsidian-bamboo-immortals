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
  on_track: "\u2705 \u8FBE\u6807",
  behind: "\u{1F7E1} \u843D\u540E",
  stuck: "\u{1F534} \u505C\u6EDE",
  done: "\u2705 \u5DF2\u5B8C\u6210",
  at_risk: "\u{1F7E0} \u4E34\u671F\u98CE\u9669"
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
    contentEl.createEl("h2", { text: this.opts.title ?? "AI \u8BCA\u65AD \xB7 \u76EE\u6807\u6267\u884C\u590D\u76D8" });
    const d = this.opts.diagnosis;
    if (!d.ok) {
      contentEl.createEl("p", { text: d.rawText, cls: "bamboo-diag-raw" });
      return;
    }
    if (d.summary) {
      contentEl.createEl("p", { text: d.summary, cls: "bamboo-diag-summary" });
    }
    for (const g of d.goals) {
      const card = contentEl.createDiv({ cls: "bamboo-diag-goal" });
      card.createEl("div", { text: g.title, cls: "bamboo-diag-goal-title" });
      card.createEl("div", {
        text: STATUS_LABEL[g.status] ?? g.status,
        cls: `bamboo-diag-status bamboo-diag-${g.status}`
      });
      if (g.bottleneck) {
        card.createEl("div", { text: g.bottleneck, cls: "bamboo-diag-bottleneck" });
      }
      for (const s of g.suggestions) {
        const row = card.createDiv({ cls: "bamboo-diag-sugg" });
        row.createEl("span", { text: s });
        const btn = row.createEl("button", { text: "\u5E94\u7528", cls: "bamboo-diag-apply" });
        btn.addEventListener("click", () => {
          this.opts.onApply(g);
          this.close();
        });
      }
    }
    if (d.nextActions.length > 0) {
      contentEl.createEl("p", {
        text: "\u4E0B\u4E00\u6B65\uFF1A" + d.nextActions.join("\uFF1B"),
        cls: "bamboo-diag-next"
      });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/ai/GoalDiagnoser.ts
var import_obsidian10 = require("obsidian");

// src/ai/DeviationCalculator.ts
function buildCache(goals, days) {
  const goalIds = (goals || []).map((g) => g.id);
  const byDateKey = {};
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
        const vals = Object.values(completionsByGoal[gid]);
        for (const v of vals) {
          if (v) {
            active = true;
            count++;
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
  return { byDateKey, goalIds, totalDays: (days || []).length };
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
function summarize(goals, cache, today = /* @__PURE__ */ new Date()) {
  if (!goals || goals.length === 0) return "\uFF08\u65E0\u76EE\u6807\uFF09";
  return goals.map((g) => {
    const d = computeGoalDeviation(g, cache, today);
    const flag = d.stagnation ? " [\u505C\u6EDE]" : "";
    return `- ${g.title}\uFF5C\u72B6\u6001=${d.status}${flag}\uFF5C\u9884\u671F\u8FDB\u5EA6=${d.expectedProgress}% \u5B9E\u9645=${d.actualProgress}%\uFF5C\u504F\u5DEE=${(d.deviationRate * 100).toFixed(0)}%\uFF5C\u8FD17\u5929\u5B8C\u6210=${d.recentActivity}`;
  }).join("\n");
}

// src/ai/GoalDiagnoser.ts
var VALID_STATUS = /* @__PURE__ */ new Set([
  "on_track",
  "behind",
  "stuck",
  "done",
  "at_risk"
]);
function asStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string");
}
function normalizeGoal(raw) {
  const g = raw && typeof raw === "object" ? raw : {};
  const status = typeof g.status === "string" && VALID_STATUS.has(g.status) ? g.status : "behind";
  const completion = typeof g.completion === "number" ? g.completion : void 0;
  return {
    title: typeof g.title === "string" ? g.title : "",
    completion,
    status,
    bottleneck: typeof g.bottleneck === "string" ? g.bottleneck : void 0,
    suggestions: asStringArray(g.suggestions)
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
function buildDiagnosisMessages(summary) {
  const system = [
    "\u4F60\u662F\u300C\u6218\u7565\u590D\u76D8\u300D\u6559\u7EC3\u3002\u7528\u6237\u5DF2\u6709\u4E00\u68F5\u76EE\u6807\u6811\uFF0C\u5E76\u63D0\u4F9B\u4E86\u5404\u76EE\u6807\u7684\u6267\u884C\u504F\u5DEE\u786C\u6307\u6807\u3002",
    "\u8BF7\u57FA\u4E8E\u8FD9\u4E9B\u786C\u6307\u6807\u505A\u56E0\u679C\u5F52\u56E0\uFF08\u4E3A\u4EC0\u4E48\u843D\u540E/\u505C\u6EDE\uFF09\uFF0C\u5E76\u7ED9\u51FA\u53EF\u64CD\u4F5C\u5EFA\u8BAE\u3002",
    "\u4E25\u683C\u8981\u6C42\uFF1A",
    "- \u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981 markdown \u56F4\u680F\u3001\u4E0D\u8981\u4EFB\u4F55\u989D\u5916\u89E3\u91CA\u6587\u5B57\u3002",
    '- JSON \u7ED3\u6784\uFF1A{ "summary": string, "goals": [ { "title": string, "completion": number(0-100), "status": "on_track"|"behind"|"stuck"|"done"|"at_risk", "bottleneck": string, "suggestions": string[] } ], "nextActions": string[] }',
    "- status \u5FC5\u987B\u53D6\u81EA\u7ED9\u5B9A\u679A\u4E3E\u3002",
    "- suggestions \u6BCF\u6761\u5FC5\u987B\u662F\u4E00\u53E5\u3010\u53EF\u76F4\u63A5\u4EA4\u7ED9\u53E6\u4E00\u4E2A AI \u53BB\u6539\u76EE\u6807\u6811\u3011\u7684\u81EA\u7136\u8BED\u8A00\u6307\u4EE4\uFF0C\u4F8B\u5982\u300C\u5C06\u5B50\u9879\u300E\u6BCF\u5929\u8DD1\u6B65\u300F\u7684 dailyMin \u4ECE 30 \u964D\u5230 15\u300D\u300C\u4E3A\u76EE\u6807\u300E\u5065\u5EB7\u51CF\u91CD\u300F\u65B0\u589E\u5B50\u9879\u300E\u6BCF\u5468\u6E38\u6CF3 3 \u6B21\u300F\u300D\u3002\u4E0D\u8981\u5199\u7A7A\u6CDB\u5EFA\u8BAE\u3002"
  ].join("\n");
  const user = `\u5404\u76EE\u6807\u6267\u884C\u504F\u5DEE\u5982\u4E0B\uFF1A
${summary}
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
async function diagnose(goals, days, settings, fetchFn = import_obsidian10.requestUrl) {
  const cache = buildCache(goals, days);
  const summary = summarize(goals, cache);
  const messages = buildDiagnosisMessages(summary);
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
  const goals = await deps.storage.getGoals();
  if (goals.length === 0) {
    deps.notice("\u4F60\u8FD8\u6CA1\u6709\u76EE\u6807\uFF0C\u5148\u8DD1\u4E00\u6B21 AI \u89C4\u5212");
    return;
  }
  const keys = (await deps.storage.getDayKeys()).slice(0, deps.recentDays ?? 14);
  const days = [];
  for (const k of keys) {
    const d = await deps.storage.getDay(k);
    if (d) days.push(d);
  }
  const result = await deps.diagnose(goals, days, deps.plannerSettings);
  deps.openDiagnosis({
    diagnosis: result,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvdmlld3MvRGFpbHlSZXZpZXdWaWV3LnRzIiwgInNyYy9ob3N0L0FwcEhvc3QudHMiLCAibm9kZV9tb2R1bGVzL2ZmbGF0ZS9lc20vYnJvd3Nlci5qcyIsICJzcmMvaG9zdC9BcHBBUEkudHMiLCAic3JjL3N0b3JhZ2UvVmF1bHRTdG9yYWdlLnRzIiwgInNyYy9zdG9yYWdlL0ltcG9ydFZhbGlkYXRvci50cyIsICJzcmMvYnJpZGdlL1RoZW1lQnJpZGdlLnRzIiwgInNyYy9jb25zdGFudHMvYXVkaW8udHMiLCAic3JjL2hvc3QvcHJvdG9jb2wudHMiLCAic3JjL2hvc3QvV2ViYXBwQ29udHJvbGxlci50cyIsICJzcmMvc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MudHMiLCAic3JjL2FpL01hcmtkb3duUGxhbm5lci50cyIsICJzcmMvdHlwZXMvZGF0YS50cyIsICJzcmMvYWkvR29hbENhcmRWYWxpZGF0b3IudHMiLCAic3JjL2FpL2dvYWxJZC50cyIsICJzcmMvYWkvaWRlbXBvdGVuY3kudHMiLCAic3JjL2FpL0FnZW50aWNQbGFuTW9kYWwudHMiLCAic3JjL2FpL1BsYW5uaW5nU2Vzc2lvbi50cyIsICJzcmMvYWkvRGlhZ25vc2lzTW9kYWwudHMiLCAic3JjL2FpL0dvYWxEaWFnbm9zZXIudHMiLCAic3JjL2FpL0RldmlhdGlvbkNhbGN1bGF0b3IudHMiLCAic3JjL2FpL3J1bkRpYWdub3Npcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBXb3Jrc3BhY2VMZWFmLCBOb3RpY2UsIFRGaWxlLCBNYXJrZG93blZpZXcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBEYWlseVJldmlld1ZpZXcsIFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcgfSBmcm9tICcuL3NyYy92aWV3cy9EYWlseVJldmlld1ZpZXcnO1xuaW1wb3J0IHsgQXBwSG9zdCB9IGZyb20gJy4vc3JjL2hvc3QvQXBwSG9zdCc7XG5pbXBvcnQgeyBXZWJhcHBDb250cm9sbGVyIH0gZnJvbSAnLi9zcmMvaG9zdC9XZWJhcHBDb250cm9sbGVyJztcbmltcG9ydCB7IFRoZW1lQnJpZGdlIH0gZnJvbSAnLi9zcmMvYnJpZGdlL1RoZW1lQnJpZGdlJztcbmltcG9ydCB7XG4gIFBsdWdpblNldHRpbmdzLFxuICBERUZBVUxUX1NFVFRJTkdTLFxuICB0eXBlIEJhbWJvb1Jldmlld1NldHRpbmdzLFxufSBmcm9tICcuL3NyYy9zZXR0aW5ncy9QbHVnaW5TZXR0aW5ncyc7XG5pbXBvcnQgeyBWYXVsdFN0b3JhZ2UgfSBmcm9tICcuL3NyYy9zdG9yYWdlL1ZhdWx0U3RvcmFnZSc7XG5pbXBvcnQgeyBwbGFuRnJvbU5vdGUsIHR5cGUgUGxhbm5lclNldHRpbmdzIH0gZnJvbSAnLi9zcmMvYWkvTWFya2Rvd25QbGFubmVyJztcbmltcG9ydCB7IHZhbGlkYXRlR29hbHMgfSBmcm9tICcuL3NyYy9haS9Hb2FsQ2FyZFZhbGlkYXRvcic7XG5pbXBvcnQgeyBkZXJpdmVTdGFibGVHb2FsSWQgfSBmcm9tICcuL3NyYy9haS9nb2FsSWQnO1xuaW1wb3J0IHsgc2hvdWxkU2tpcFBsYW5uZWQgfSBmcm9tICcuL3NyYy9haS9pZGVtcG90ZW5jeSc7XG5pbXBvcnQgeyBBZ2VudGljUGxhbk1vZGFsIH0gZnJvbSAnLi9zcmMvYWkvQWdlbnRpY1BsYW5Nb2RhbCc7XG5pbXBvcnQgeyBEaWFnbm9zaXNNb2RhbCB9IGZyb20gJy4vc3JjL2FpL0RpYWdub3Npc01vZGFsJztcbmltcG9ydCB7IGRpYWdub3NlIH0gZnJvbSAnLi9zcmMvYWkvR29hbERpYWdub3Nlcic7XG5pbXBvcnQgeyBydW5EaWFnbm9zaXMgfSBmcm9tICcuL3NyYy9haS9ydW5EaWFnbm9zaXMnO1xuaW1wb3J0IHR5cGUgeyBHb2FsSXRlbSB9IGZyb20gJy4vc3JjL3R5cGVzL2RhdGEnO1xuXG4vKiogXHU1MTg1XHU1QkI5XHU2MzA3XHU3RUI5XHVGRjA4ZGpiMlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RSBBSSBcdTg5QzRcdTUyMTJcdTVFNDJcdTdCNDlcdTUyMjRcdTkxQ0QgKi9cbmZ1bmN0aW9uIGhhc2hDb250ZW50KHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBoID0gNTM4MTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgaCA9ICgoaCA8PCA1KSArIGggKyBzLmNoYXJDb2RlQXQoaSkpID4+PiAwO1xuICB9XG4gIHJldHVybiBoLnRvU3RyaW5nKDM2KTtcbn1cblxuLyoqXG4gKiBCYW1ib29SZXZpZXdQbHVnaW4gLSBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU1MTY1XHU1M0UzXG4gKlxuICogXHU4MDRDXHU4RDIzXHVGRjFBXG4gKiAxLiBcdTZDRThcdTUxOEMgVmlldyBcdTdDN0JcdTU3OEJcbiAqIDIuIFx1NkNFOFx1NTE4Q1x1NTQ3RFx1NEVFNFx1RkYwOFx1NjI1M1x1NUYwMFx1NTkwRFx1NzZEOFx1MzAwMVx1NTI0RC9cdTU0MEVcdTRFMDBcdTU5MjlcdTMwMDFcdTdFREZcdThCQTFcdTk3NjJcdTY3N0ZcdUZGMDlcbiAqIDMuIFx1NkNFOFx1NTE4Q1x1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICogNC4gXHU3QkExXHU3NDA2XHU2M0QyXHU0RUY2XHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhbWJvb1Jldmlld1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XG4gIHByaXZhdGUgd2ViYXBwITogV2ViYXBwQ29udHJvbGxlcjtcblxuICBhc3luYyBvbmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHU1MkEwXHU4RjdEXHU4QkJFXHU3RjZFXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIGNvbnN0IHBsdWdpbkRpciA9IHRoaXMubWFuaWZlc3QuZGlyIHx8ICcnO1xuICAgIGNvbnN0IHZlcnNpb24gPSB0aGlzLm1hbmlmZXN0LnZlcnNpb24gfHwgJyc7XG5cbiAgICAvLyBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDYgd2ViYXBwXHVGRjFBXHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1MzczXHU4OUU2XHU1M0QxXHVGRjBDXHU2MjUzXHU1RjAwXHU4OUM2XHU1NkZFXHU1MjREXHU1OTI3XHU2OTgyXHU3Mzg3XHU1REYyXHU1QzMxXHU3RUVBXHVGRjBDXHU2RDg4XHU5NjY0XHUzMDBDXHU2MjUzXHU1RjAwXHU3QTdBXHU3NjdEXHUzMDBEXHU0RjUzXHU2MTFGXHUzMDAyXG4gICAgLy8gXHU1OTMxXHU4RDI1XHU0RTBEXHU5NjNCXHU1ODVFIG9ubG9hZFx1RkYwQ1x1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NjVGNiBidWlsZEJsb2JVcmwgXHU0RjFBXHU1MThEXHU2QjIxXHU1QzFEXHU4QkQ1XHUzMDAyXG4gICAgdm9pZCBBcHBIb3N0LnByZWZldGNoKHRoaXMuYXBwLCBwbHVnaW5EaXIsIHZlcnNpb24pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDIFZpZXdcdUZGMDhcdTRGMjBcdTkwMTIgcGx1Z2luRGlyIFx1NEY5QiBJdGVtVmlldyBcdTUyQTBcdThGN0Qgd2ViYXBwIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1RkYwOVxuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRV9EQUlMWV9SRVZJRVcsIChsZWFmOiBXb3Jrc3BhY2VMZWFmKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IERhaWx5UmV2aWV3VmlldyhsZWFmLCBwbHVnaW5EaXIsIHRoaXMsIHRoaXMuc2V0dGluZ3MsICgpID0+IHRoaXMuc2F2ZVNldHRpbmdzKCkpO1xuICAgIH0pO1xuXG4gICAgLy8gXHU1QkJGXHU0RTNCIFx1MjE5MiB3ZWJhcHAgXHU3NkY0XHU4RkRFXHU2M0E1XHU1M0UzXHVGRjA4UGhhc2UzIFx1OTVFOFx1OTc2Mlx1RkYwQ1x1NTE4NVx1OTBFOFx1NEVDRFx1OEQ3MCBzZW5kQ29tbWFuZCBcdTdFQkZcdTUzNEZcdThCQUVcdUZGMDlcbiAgICB0aGlzLndlYmFwcCA9IG5ldyBXZWJhcHBDb250cm9sbGVyKCgpID0+IHtcbiAgICAgIGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG4gICAgICBpZiAobGVhdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gbGVhdmVzWzBdLnZpZXcgYXMgRGFpbHlSZXZpZXdWaWV3O1xuICAgIH0pO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU1NDdEXHU0RUU0XG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1kYWlseS1yZXZpZXcnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NEVDQVx1NjVFNVx1NTkwRFx1NzZEOCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXByZXYtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTUyNERcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm5hdlByZXZEYXkoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLW5leHQtZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU0MEVcdTRFMDBcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm5hdk5leHREYXkoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ25hdmlnYXRlLXRvZGF5JyxcbiAgICAgIG5hbWU6ICdcdTU2REVcdTUyMzBcdTRFQ0FcdTU5MjknLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm5hdlRvZGF5KCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLXN0YXRzJyxcbiAgICAgIG5hbWU6ICdcdTYyNTNcdTVGMDBcdTdFREZcdThCQTFcdTUyMDZcdTY3OTAnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMud2ViYXBwLm9wZW5TdGF0cygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1zZXR0aW5ncy1pbi1hcHAnLFxuICAgICAgbmFtZTogJ1x1NjI1M1x1NUYwMFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RScsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy53ZWJhcHAub3BlblNldHRpbmdzKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1wbGFuLWZyb20tbm90ZScsXG4gICAgICBuYW1lOiAnQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU1QzA2XHU1RjUzXHU1MjREXHU3QjE0XHU4QkIwXHU4RjZDXHU0RTNBXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3JyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkIHRoaXMuYWlQbGFuRnJvbU5vdGUoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2FpLXBsYW4tZnJvbS1zZWxlY3Rpb24nLFxuICAgICAgbmFtZTogJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NUMwNlx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0NycsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLmFpUGxhbkZyb21TZWxlY3Rpb24oKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2FpLXJlYnVpbGQtZ29hbHMnLFxuICAgICAgbmFtZTogJ0FJIFx1ODlDNFx1NTIxMlx1RkYxQVx1NjI3OVx1OTFDRlx1OTFDRFx1NUVGQVx1NURGMlx1ODlDNFx1NTIxMlx1N0IxNFx1OEJCMFx1NzY4NFx1NzZFRVx1NjgwNycsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdm9pZCB0aGlzLnJlYnVpbGRBaUdvYWxzKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdhaS1kaWFnbm9zZScsXG4gICAgICBuYW1lOiAnQUkgXHU4QkNBXHU2NUFEXHVGRjFBXHU1MjA2XHU2NzkwXHU3NkVFXHU2ODA3XHU2MjY3XHU4ODRDXHU1RTc2XHU3RUQ5XHU1MUZBXHU1M0VGXHU1RTk0XHU3NTI4XHU1RUZBXHU4QkFFJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkIHRoaXMuYWlEaWFnbm9zZSgpLFxuICAgIH0pO1xuXG4gICAgLy8gXHU3RjE2XHU4RjkxXHU1NjY4XHU1M0YzXHU5NTJFXHU4M0RDXHU1MzU1XHVGRjFBXHU5MDA5XHU0RTJEXHU2NTg3XHU2NzJDXHU1NDBFXHU1M0YzXHU5NTJFXHU3NkY0XHU2M0E1XHU1MUZBXHU3M0IwXHUzMDBDXHU4RjZDXHU0RTNBXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHUzMDBEXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKCdlZGl0b3ItbWVudScsIChtZW51LCBlZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRTZWxlY3Rpb24oKS50cmltKCk7XG4gICAgICAgIGlmICghdGV4dCkgcmV0dXJuOyAvLyBcdTY1RTBcdTkwMDlcdTUzM0FcdTY1RjZcdTRFMERcdTY2M0VcdTc5M0FcdUZGMENcdTRGRERcdTYzMDFcdTgzRENcdTUzNTVcdTVFNzJcdTUxQzBcbiAgICAgICAgbWVudS5hZGRJdGVtKChpdGVtKSA9PlxuICAgICAgICAgIGl0ZW1cbiAgICAgICAgICAgIC5zZXRUaXRsZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU1QzA2XHU5MDA5XHU0RTJEXHU2NTg3XHU2NzJDXHU4RjZDXHU0RTNBXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3JylcbiAgICAgICAgICAgIC5zZXRJY29uKCdsZWFmJylcbiAgICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICAgdm9pZCB0aGlzLmFpUGxhbkZyb21TZWxlY3Rpb24odGV4dCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gXHU2Q0U4XHU1MThDXHU4QkJFXHU3RjZFXHU5NzYyXHU2NzdGXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBQbHVnaW5TZXR0aW5ncyh0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgLy8gXHU2REZCXHU1MkEwXHU1REU2XHU0RkE3IFJpYmJvbiBcdTU2RkVcdTY4MDdcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oJ2xlYWYnLCAnXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwJywgKCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLmFjdGl2YXRlVmlldygpO1xuICAgIH0pO1xuICB9XG5cbiAgb251bmxvYWQoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UucmVzdG9yZURlZmF1bHRzKCk7XG4gIH1cblxuICAvKiogQUkgXHU4OUM0XHU1MjEyXHU0RTNCXHU2RDQxXHU3QTBCXHVGRjFBXHU1M0Q2XHU1RjUzXHU1MjREXHU3QjE0XHU4QkIwIFx1MjE5MiBcdThDMDNcdTU5MjdcdTZBMjFcdTU3OEIgXHUyMTkyIFx1NjgyMVx1OUE4QyBcdTIxOTIgXHU1QkExXHU5NjA1XHU1RjM5XHU3QTk3IFx1MjE5MiBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTMgKi9cbiAgYXN5bmMgYWlQbGFuRnJvbU5vdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgaWYgKCFzLmFpRW5hYmxlZCkge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHU2NzJBXHU1NDJGXHU3NTI4XHVGRjFBXHU4QkY3XHU1MTQ4XHU1NzI4XHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU0RTJEXHU1RjAwXHU1NDJGXHU1RTc2XHU1ODZCXHU1MTk5IEFQSSBLZXknKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICBpZiAoIWZpbGUgfHwgIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHx8IGZpbGUuZXh0ZW5zaW9uICE9PSAnbWQnKSB7XG4gICAgICBuZXcgTm90aWNlKCdBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdThCRjdcdTUxNDhcdTYyNTNcdTVGMDBcdTRFMDBcdTdCQzcgTWFya2Rvd24gXHU3QjE0XHU4QkIwJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGNvbnRlbnQgPSAnJztcbiAgICB0cnkge1xuICAgICAgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbmV3IE5vdGljZShgXHU4QkZCXHU1M0Q2XHU3QjE0XHU4QkIwXHU1OTMxXHU4RDI1XHVGRjFBJHtlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU2NzJBXHU3N0U1XHU5NTE5XHU4QkVGJ31gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFjb250ZW50LnRyaW0oKSkge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU3QjE0XHU4QkIwXHU1MTg1XHU1QkI5XHU0RTNBXHU3QTdBJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGxhbm5lclNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MgPSB7XG4gICAgICBhaUFwaUtleTogcy5haUFwaUtleSxcbiAgICAgIGFpQmFzZVVybDogcy5haUJhc2VVcmwsXG4gICAgICBhaU1vZGVsOiBzLmFpTW9kZWwsXG4gICAgICBhaURlY29tcG9zZURlcHRoOiBzLmFpRGVjb21wb3NlRGVwdGgsXG4gICAgfTtcblxuICAgIG5ldyBBZ2VudGljUGxhbk1vZGFsKHRoaXMuYXBwLCB7XG4gICAgICBjb250ZW50LFxuICAgICAgc2NvcGU6ICdub3RlJyxcbiAgICAgIHNldHRpbmdzOiBwbGFubmVyU2V0dGluZ3MsXG4gICAgICBvbkNvbmZpcm06IChmaW5hbEdvYWxzKSA9PiB2b2lkIHRoaXMud3JpdGVBaUdvYWxzKGZpbGUsIGNvbnRlbnQsIGZpbmFsR29hbHMpLFxuICAgIH0pLm9wZW4oKTtcbiAgfVxuXG4gIC8qKiBcdTkwMDlcdTRFMkRcdTY1ODdcdTY3MkNcdThGNkNcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdUZGMUFcdTUzRDZcdTdGMTZcdThGOTFcdTU2NjhcdTkwMDlcdTUzM0EgXHUyMTkyIFx1OEMwM1x1NTkyN1x1NkEyMVx1NTc4QihcdTY4MDdcdTZDRTggc2VsZWN0aW9uKSBcdTIxOTIgXHU2ODIxXHU5QThDIFx1MjE5MiBcdTVCQTFcdTk2MDVcdTVGMzlcdTdBOTcgXHUyMTkyIFx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1NUU5MyAqL1xuICBhc3luYyBhaVBsYW5Gcm9tU2VsZWN0aW9uKHNlbGVjdGlvbkFyZz86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHMgPSB0aGlzLnNldHRpbmdzO1xuICAgIGlmICghcy5haUVuYWJsZWQpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0FJIFx1ODlDNFx1NTIxMlx1NjcyQVx1NTQyRlx1NzUyOFx1RkYxQVx1OEJGN1x1NTE0OFx1NTcyOFx1NjNEMlx1NEVGNlx1OEJCRVx1N0Y2RVx1NEUyRFx1NUYwMFx1NTQyRlx1NUU3Nlx1NTg2Qlx1NTE5OSBBUEkgS2V5Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlIHx8ICEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykge1xuICAgICAgbmV3IE5vdGljZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjFBXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU3QkM3IE1hcmtkb3duIFx1N0IxNFx1OEJCMCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NEYxOFx1NTE0OFx1NzUyOFx1NTNGM1x1OTUyRVx1ODNEQ1x1NTM1NVx1NEYyMFx1NTE2NVx1NzY4NFx1N0NCRVx1Nzg2RVx1OTAwOVx1NTMzQVx1RkYxQlx1NTQ3RFx1NEVFNFx1OTc2Mlx1Njc3Rlx1OEMwM1x1NzUyOFx1NjVGNlx1NEUwRFx1NEYyMFx1RkYwQ1x1NTIxOVx1NTZERVx1OTAwMFx1NTIzMFx1NkQzQlx1NTJBOFx1N0YxNlx1OEY5MVx1NTY2OFx1OTAwOVx1NTMzQVxuICAgIGNvbnN0IHNlbGVjdGlvbiA9XG4gICAgICAoc2VsZWN0aW9uQXJnICYmIHNlbGVjdGlvbkFyZy50cmltKCkpIHx8XG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpPy5lZGl0b3IuZ2V0U2VsZWN0aW9uKCk/LnRyaW0oKSB8fFxuICAgICAgJyc7XG4gICAgaWYgKCFzZWxlY3Rpb24pIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1x1OEJGN1x1NTE0OFx1OTAwOVx1NEUyRFx1NEUwMFx1NkJCNVx1NjU4N1x1NjcyQ1x1RkYwQ1x1NTE4RFx1NjI2N1x1ODg0Q1x1MzAwQ1x1NUMwNlx1OTAwOVx1NEUyRFx1NjU4N1x1NjcyQ1x1OEY2Q1x1NEUzQVx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1MzAwRCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYW5uZXJTZXR0aW5nczogUGxhbm5lclNldHRpbmdzID0ge1xuICAgICAgYWlBcGlLZXk6IHMuYWlBcGlLZXksXG4gICAgICBhaUJhc2VVcmw6IHMuYWlCYXNlVXJsLFxuICAgICAgYWlNb2RlbDogcy5haU1vZGVsLFxuICAgICAgYWlEZWNvbXBvc2VEZXB0aDogcy5haURlY29tcG9zZURlcHRoLFxuICAgIH07XG5cbiAgICBuZXcgQWdlbnRpY1BsYW5Nb2RhbCh0aGlzLmFwcCwge1xuICAgICAgY29udGVudDogc2VsZWN0aW9uLFxuICAgICAgc2NvcGU6ICdzZWxlY3Rpb24nLFxuICAgICAgc2V0dGluZ3M6IHBsYW5uZXJTZXR0aW5ncyxcbiAgICAgIHN1YnRpdGxlOiAnXHU0RUU1XHU0RTBCXHU3NkVFXHU2ODA3XHU1N0ZBXHU0RThFXHU0RjYwXHU1NzI4XHU3QjE0XHU4QkIwXHU0RTJEXHU5MDA5XHU0RTJEXHU3Njg0XHU2NTg3XHU2NzJDXHU2MkM2XHU4OUUzXHVGRjA4XHU5NzVFXHU2NTc0XHU3QkM3XHU3QjE0XHU4QkIwXHVGRjA5XHUzMDAyJyxcbiAgICAgIG9uQ29uZmlybTogKGZpbmFsR29hbHMpID0+IHZvaWQgdGhpcy53cml0ZUFpR29hbHMoZmlsZSwgc2VsZWN0aW9uLCBmaW5hbEdvYWxzKSxcbiAgICB9KS5vcGVuKCk7XG4gIH1cblxuICAvKiogXHU2MjhBXHU1QkExXHU5NjA1XHU1NDBFXHU3Njg0XHU3NkVFXHU2ODA3XHU4RkZEXHU1MkEwXHU1MTk5XHU1MTY1XHU3NkVFXHU2ODA3XHU1RTkzXHVGRjA4XHU5NkY2XHU2QzYxXHU2N0QzXHVGRjFBZXhpc3RpbmcgKyBwYXJzZWRcdUZGMDlcdTVFNzZcdTY2RjRcdTY1QjBcdTVFNDJcdTdCNDlcdTdEMjJcdTVGMTUgKi9cbiAgLyoqXG4gICAqIFx1NjI4QVx1NUJBMVx1OTYwNVx1NTQwRVx1NzY4NFx1NzZFRVx1NjgwN1x1OEZGRFx1NTJBMFx1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1NUU5M1x1RkYwOFx1OTZGNlx1NkM2MVx1NjdEM1x1RkYxQWV4aXN0aW5nICsgcGFyc2VkXHVGRjA5XHU1RTc2XHU2NkY0XHU2NUIwXHU1RTQyXHU3QjQ5XHU3RDIyXHU1RjE1XHUzMDAyXG4gICAqIEBwYXJhbSBzaWxlbnQgXHU2Mjc5XHU5MUNGXHU5MUNEXHU1RUZBXHU2NUY2XHU2MjkxXHU1MjM2XHU5MDEwXHU2NzYxXHU5MDFBXHU3N0U1XHVGRjBDXHU3NTMxXHU4QzAzXHU3NTI4XHU2NUI5XHU3RURGXHU0RTAwXHU2QzQ3XHU2MDNCXHVGRjA4XHU5RUQ4XHU4QkE0IGZhbHNlXHVGRjA5XG4gICAqL1xuICBhc3luYyB3cml0ZUFpR29hbHMoXG4gICAgZmlsZTogVEZpbGUsXG4gICAgY29udGVudDogc3RyaW5nLFxuICAgIGdvYWxzOiBHb2FsSXRlbVtdLFxuICAgIHNpbGVudCA9IGZhbHNlXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1N0VERlx1NEUwMFx1NTE5OVx1NTE2NSB3ZWJhcHAgXHU1QjlFXHU5NjQ1XHU4QkZCXHU1M0Q2XHU3Njg0XHU5RUQ4XHU4QkE0XHU4REVGXHU1Rjg0XHVGRjA4YmFtYm9vLXJldmlld1x1RkYwOVx1RkYwQ1x1Nzg2RVx1NEZERCBBSSBcdTUxOTlcdTUxNjVcdTc2ODRcdTc2RUVcdTY4MDdcdTRFMEVcdTc1NENcdTk3NjJcdThCRkJcdTUzRDZcdTRFMDBcdTgxRjRcdTMwMDJcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBzdG9yYWdlLmdldEdvYWxzKCk7XG5cbiAgICAvLyBcdTVFNDJcdTdCNDlcdUZGMUFcdTU0MENcdTRFMDBcdTdCMTRcdThCQjAgKyBcdTc2RjhcdTU0MENcdTUxODVcdTVCQjlcdTVERjJcdTg5QzRcdTUyMTJcdThGQzdcdUZGMENcdTRFMTRcdTc2RUVcdTY4MDdcdTRFQ0RcdTUxNjhcdTkwRThcdTVCNThcdTU3MjggXHUyMTkyIFx1OERGM1x1OEZDN1x1RkYwOFx1NjI3OVx1OTFDRlx1OTFDRFx1NUVGQVx1NkEyMVx1NUYwRlx1NUYzQVx1NTIzNlx1OTFDRFx1NTE5OVx1RkYwOVx1MzAwMlxuICAgIC8vIFx1NTE3M1x1OTUyRVx1NEZFRVx1NTkwRFx1RkYxQVx1ODJFNVx1NzZFRVx1NjgwN1x1NURGMlx1ODhBQlx1NkUwNVx1N0E3QS9cdTRFMjJcdTU5MzFcdUZGMDhwbGFucy1tYXAgXHU2QjhCXHU3NTU5XHU2NUU3XHU1NEM4XHU1RTBDXHVGRjA5XHVGRjBDXHU1MjE5XHU1RkM1XHU5ODdCXHU1MTQxXHU4QkI4XHU5MUNEXHU2NUIwXHU1MTk5XHU1MTY1XHU0RUU1XHU2MDYyXHU1OTBEXHVGRjBDXG4gICAgLy8gXHU1NDI2XHU1MjE5XHUyMDFDXHU1REYyXHU4OUM0XHU1MjEyXHU4RkM3XHUyMDFEXHU0RjFBXHU2QzM4XHU0RTQ1XHU5NjNCXHU1ODVFXHU2MDYyXHU1OTBEXHVGRjBDXHU4ODY4XHU3M0IwXHU0RTNBXHUyMDFDXHU1MTk5XHU1MTY1XHU0RTg2XHU0RjQ2XHU0RTBEXHU2NjNFXHU3OTNBL1x1NEUyMlx1NTkzMVx1MjAxRFx1MzAwMlxuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXRQbGFuc0luZGV4KCk7XG4gICAgY29uc3Qga2V5ID0gYCR7ZmlsZS5wYXRofSMke2hhc2hDb250ZW50KGNvbnRlbnQpfWA7XG4gICAgY29uc3QgcGxhbm5lZElkcyA9IGluZGV4W2tleV07XG4gICAgaWYgKCFzaWxlbnQgJiYgc2hvdWxkU2tpcFBsYW5uZWQocGxhbm5lZElkcywgbmV3IFNldChleGlzdGluZy5tYXAoKGcpID0+IGcuaWQpKSkpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1x1OEJFNVx1N0IxNFx1OEJCMFx1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1RkYwOFx1NTE4NVx1NUJCOVx1NjcyQVx1NTNEOFx1RkYwOVx1RkYwQ1x1NURGMlx1OERGM1x1OEZDN1x1OTFDRFx1NTkwRFx1NTE5OVx1NTE2NScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBcdTkwRThcdTUyMDYvXHU1MTY4XHU5MEU4XHU3NkVFXHU2ODA3XHU1REYyXHU0RTIyXHU1OTMxIFx1MjE5MiBcdTdFRTdcdTdFRURcdTU0MTFcdTRFMEJcdTkxQ0RcdTY1QjBcdTUxOTlcdTUxNjVcdTRFRTVcdTYwNjJcdTU5MERcblxuICAgIC8vIFx1NjVFN1x1NzI0OFx1OTY4Rlx1NjczQSBpZCBcdTUxN0NcdTVCQjlcdUZGMUFcdTU0MEMgc291cmNlUmVmK3RpdGxlIFx1NTkwRFx1NzUyOFx1NjVFNyBpZFx1RkYwQ1x1NTM5Rlx1NTczMFx1NjZGNFx1NjVCMFx1NEUwRFx1NjVCMFx1NTg5RVx1OTFDRFx1NTkwRFxuICAgIGNvbnN0IGJ5UmVmVGl0bGUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIGZvciAoY29uc3QgZyBvZiBleGlzdGluZykge1xuICAgICAgaWYgKGcuc291cmNlUmVmICYmIGcudGl0bGUpIGJ5UmVmVGl0bGUuc2V0KGAke2cuc291cmNlUmVmfSMke2cudGl0bGV9YCwgZy5pZCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VkID0gbmV3IE1hcDxzdHJpbmcsIEdvYWxJdGVtPigpO1xuICAgIGZvciAoY29uc3QgZyBvZiBleGlzdGluZykgaWYgKGcuaWQpIG1lcmdlZC5zZXQoZy5pZCwgZyk7XG5cbiAgICAvLyBcdTY3MDBcdTdFQzhcdTk2MzJcdTdFQkZcdUZGMUFBSSBcdTUxOTlcdTUxNjVcdTc2ODRcdTc2RUVcdTY4MDdcdTc5ODFcdTZCNjJcdTUzMDVcdTU0MkIgaWNvbiBcdTVCNTdcdTZCQjVcdUZGMDhcdTUzNzNcdTRGN0ZcdTVCQTFcdTk2MDVcdTVGMzlcdTdBOTdcdThCRUZcdTU4NkJcdTUxNjVcdTRFNUZcdTUyNjVcdTc5QkJcdUZGMDlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgY29uc3Qgd2l0aFJlZiA9IGdvYWxzLm1hcCgoZykgPT4ge1xuICAgICAgY29uc3QgeyBpY29uOiBfaWNvbiwgLi4ucmVzdCB9ID0gZyBhcyBHb2FsSXRlbSAmIHsgaWNvbj86IHVua25vd24gfTtcbiAgICAgIHZvaWQgX2ljb247XG4gICAgICBjb25zdCByZWY6IEdvYWxJdGVtID0geyAuLi5yZXN0LCBzb3VyY2VSZWY6IGZpbGUucGF0aCB9O1xuICAgICAgLy8gXHU3ODZFXHU1QjlBXHU2MDI3IElEXHVGRjFBXHU1NDBDXHU3QjE0XHU4QkIwK1x1NTQwQ1x1NjgwN1x1OTg5OFx1NjA1Mlx1NUY5N1x1NTQwQ1x1NEUwMCBpZCBcdTIxOTIgXHU5MUNEXHU2NUIwXHU4OUM0XHU1MjEyXHU1MzlGXHU1NzMwXHU2NkY0XHU2NUIwXHU4MDBDXHU5NzVFXHU4RkZEXHU1MkEwXHU5MUNEXHU1OTBEXHVGRjFCXG4gICAgICAvLyBcdTgyRTVcdThCRTVcdTY4MDdcdTk4OThcdTc2ODRcdTY1RTdcdTk2OEZcdTY3M0EgaWQgXHU0RUNEXHU1QjU4XHU1NzI4XHU0RThFXHU1RTkzXHVGRjBDXHU1MjE5XHU1OTBEXHU3NTI4XHU1QjgzXHVGRjA4XHU1MTdDXHU1QkI5XHU1Mzg2XHU1M0YyXHU3NkVFXHU2ODA3XHVGRjA5XHUzMDAyXG4gICAgICBjb25zdCBsZWdhY3lJZCA9IGJ5UmVmVGl0bGUuZ2V0KGAke2ZpbGUucGF0aH0jJHtnLnRpdGxlfWApO1xuICAgICAgcmVmLmlkID0gbGVnYWN5SWQgPz8gZGVyaXZlU3RhYmxlR29hbElkKGAke2ZpbGUucGF0aH18JHtnLnRpdGxlfWApO1xuICAgICAgcmV0dXJuIHJlZjtcbiAgICB9KTtcbiAgICBmb3IgKGNvbnN0IGcgb2Ygd2l0aFJlZikgaWYgKGcuaWQpIG1lcmdlZC5zZXQoZy5pZCwgZyk7XG4gICAgY29uc3QgZmluYWxHb2FscyA9IFsuLi5tZXJnZWQudmFsdWVzKCldO1xuICAgIGF3YWl0IHN0b3JhZ2UucHV0R29hbHMoZmluYWxHb2Fscyk7XG5cbiAgICAvLyBcdTU5MzFcdTY1NDhcdTdEMjJcdTVGMTVcdTZFMDVcdTc0MDZcdUZGMDhGXHVGRjA5XHVGRjFBXHU1MjU0XHU5NjY0XHUyMDFDXHU1MTc2XHU1MTY4XHU5MEU4IGlkIFx1NTc0N1x1NURGMlx1NEUwRFx1NTcyOFx1NjcwMFx1N0VDOFx1NzZFRVx1NjgwN1x1NUU5M1x1MjAxRFx1NzY4NFx1OTY0OFx1NjVFNyBlbnRyeVx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0QyMlx1NUYxNVx1NjVFMFx1OTY1MFx1NTg5RVx1OTU3Rlx1MzAwMlxuICAgIGNvbnN0IGZpbmFsSWRzID0gbmV3IFNldChmaW5hbEdvYWxzLm1hcCgoZykgPT4gZy5pZCkpO1xuICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhpbmRleCkpIHtcbiAgICAgIGNvbnN0IGlkcyA9IGluZGV4W2tdO1xuICAgICAgaWYgKGlkcyAmJiBpZHMubGVuZ3RoID4gMCAmJiBpZHMuZXZlcnkoKGlkKSA9PiAhZmluYWxJZHMuaGFzKGlkKSkpIHtcbiAgICAgICAgZGVsZXRlIGluZGV4W2tdO1xuICAgICAgfVxuICAgIH1cbiAgICBpbmRleFtrZXldID0gd2l0aFJlZi5tYXAoKGcpID0+IGcuaWQpO1xuICAgIGF3YWl0IHN0b3JhZ2UucHV0UGxhbnNJbmRleChpbmRleCk7XG5cbiAgICAvLyBcdTVDNDBcdTkwRThcdTUyMzdcdTY1QjBcdTVFMzhcdTlBN0JcdTg5QzZcdTU2RkVcdUZGMDhob3N0XHUyMTkyd2ViYXBwIGdvYWxzOmNoYW5nZWRcdUZGMDlcbiAgICB0aGlzLndlYmFwcC5ub3RpZnlHb2Fsc0NoYW5nZWQoKTtcblxuICAgIGlmICghc2lsZW50KSB7XG4gICAgICBuZXcgTm90aWNlKGBcdTVERjJcdTUxOTlcdTUxNjUgJHt3aXRoUmVmLmxlbmd0aH0gXHU0RTJBXHU3NkVFXHU2ODA3XHU1MjMwXHUzMDBDXHU3QUY5XHU2Nzk3XHU0RkVFXHU0RUQ5XHU0RjIwXHUzMDBEYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1NjI3OVx1OTFDRlx1OTFDRFx1NUVGQSBBSSBcdTc2RUVcdTY4MDdcdUZGMUFcdTYyNkJcdTYzQ0YgcGxhbnMtbWFwIFx1NEUyRFx1MzAwQ1x1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1MzAwRFx1NzY4NFx1N0IxNFx1OEJCMFx1RkYwQ1x1OTAxMFx1N0JDN1x1OTFDRFx1NjVCMFx1ODlDNFx1NTIxMlx1RkYwQ1xuICAgKiBcdTRFRTVcdTYyN0VcdTU2REVcdTkwQTNcdTRFOUJcdTc2RUVcdTY4MDdcdTVERjJcdTRFMjJcdTU5MzEvXHU4OEFCXHU2RTA1XHU3Njg0XHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHUzMDAyXHU3QjE0XHU4QkIwXHU1REYyXHU1MjIwXHU5NjY0XHU1MjE5XHU4REYzXHU4RkM3XHVGRjA4XHU1MTc2IHN0YWxlIGVudHJ5IFx1NzUzMVx1N0QyMlx1NUYxNVx1NkUwNVx1NzQwNlx1NTkwNFx1NzQwNlx1RkYwOVx1MzAwMlxuICAgKi9cbiAgYXN5bmMgcmVidWlsZEFpR29hbHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UodGhpcy5hcHApO1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXRQbGFuc0luZGV4KCk7XG4gICAgY29uc3QgcGF0aHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoaW5kZXgpKSB7XG4gICAgICBjb25zdCBoYXNoSWR4ID0gay5sYXN0SW5kZXhPZignIycpO1xuICAgICAgaWYgKGhhc2hJZHggPiAwKSBwYXRocy5hZGQoay5zbGljZSgwLCBoYXNoSWR4KSk7XG4gICAgfVxuICAgIGlmIChwYXRocy5zaXplID09PSAwKSB7XG4gICAgICBuZXcgTm90aWNlKCdcdTY3MkFcdTUzRDFcdTczQjBcdTRFRkJcdTRGNTVcdTVERjJcdTg5QzRcdTUyMTJcdTc2ODRcdTdCMTRcdThCQjAnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzID0gdGhpcy5zZXR0aW5ncztcbiAgICBpZiAoIXMuYWlFbmFibGVkKSB7XG4gICAgICBuZXcgTm90aWNlKCdBSSBcdTg5QzRcdTUyMTJcdTY3MkFcdTU0MkZcdTc1MjhcdUZGMUFcdThCRjdcdTUxNDhcdTU3MjhcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTRFMkRcdTVGMDBcdTU0MkZcdTVFNzZcdTU4NkJcdTUxOTkgQVBJIEtleScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwbGFubmVyU2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyA9IHtcbiAgICAgIGFpQXBpS2V5OiBzLmFpQXBpS2V5LFxuICAgICAgYWlCYXNlVXJsOiBzLmFpQmFzZVVybCxcbiAgICAgIGFpTW9kZWw6IHMuYWlNb2RlbCxcbiAgICAgIGFpRGVjb21wb3NlRGVwdGg6IHMuYWlEZWNvbXBvc2VEZXB0aCxcbiAgICB9O1xuXG4gICAgY29uc3QgbG9hZGluZyA9IG5ldyBOb3RpY2UoYFx1NkI2M1x1NTcyOFx1OTFDRFx1NUVGQSAke3BhdGhzLnNpemV9IFx1N0JDN1x1N0IxNFx1OEJCMFx1NzY4NCBBSSBcdTc2RUVcdTY4MDdcdTIwMjZgLCAwKTtcbiAgICBsZXQgb2sgPSAwO1xuICAgIGxldCBmYWlsZWQgPSAwO1xuICAgIGZvciAoY29uc3QgcCBvZiBwYXRocykge1xuICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwKTtcbiAgICAgIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIGNvbnRpbnVlOyAvLyBcdTdCMTRcdThCQjBcdTVERjJcdTUyMjBcdTk2NjQgXHUyMTkyIFx1OERGM1x1OEZDN1xuICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZztcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKCFjb250ZW50LnRyaW0oKSkgY29udGludWU7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBwbGFuRnJvbU5vdGUoY29udGVudCwgcGxhbm5lclNldHRpbmdzKTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gdmFsaWRhdGVHb2FscyhyYXcpO1xuICAgICAgICBpZiAocGFyc2VkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLndyaXRlQWlHb2FscyhmaWxlLCBjb250ZW50LCBwYXJzZWQsIHRydWUpO1xuICAgICAgICAgIG9rKys7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBmYWlsZWQrKztcbiAgICAgIH1cbiAgICB9XG4gICAgbG9hZGluZy5oaWRlKCk7XG4gICAgbmV3IE5vdGljZShgXHU1REYyXHU5MUNEXHU1RUZBICR7b2t9IFx1N0JDN1x1N0IxNFx1OEJCMFx1NzY4NCBBSSBcdTc2RUVcdTY4MDcke2ZhaWxlZCA+IDAgPyBgXHVGRjBDJHtmYWlsZWR9IFx1N0JDN1x1NTkzMVx1OEQyNWAgOiAnJ31gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBSSBcdThCQ0FcdTY1QUQgXHUyMTkyIFx1ODg0Q1x1NTJBOFx1OTVFRFx1NzNBRlx1RkYxQVx1OEJGQlx1NzZFRVx1NjgwNyArIFx1OEZEMSAxNCBcdTU5MjlcdTY1NzBcdTYzNkUgXHUyMTkyIEFJIFx1OEJDQVx1NjVBRFx1RkYwOEdvYWxEaWFnbm9zZXJcdUZGMDlcdTIxOTJcbiAgICogXHU1M0VBXHU4QkZCXHU2MkE1XHU1NDRBXHVGRjA4RGlhZ25vc2lzTW9kYWxcdUZGMDlcdTIxOTIgXHU3MEI5XHUzMDBDXHU1RTk0XHU3NTI4XHUzMDBEXHUyMTkyIFx1NjI1M1x1NUYwMCBBZ2VudGljUGxhbk1vZGFsIFx1OTg4NFx1NTg2Qlx1NUVGQVx1OEJBRVx1NjMwN1x1NEVFNCBcdTIxOTJcbiAgICogXHU3ODZFXHU4QkE0XHU1NDBFXHU1MTk5XHU1NkRFXHU3NkVFXHU2ODA3XHU1RTkzXHUzMDAyXHU3RjE2XHU2MzkyXHU5MDNCXHU4RjkxXHU1NzI4IHJ1bkRpYWdub3Npc1x1RkYwOFx1N0VBRlx1NTFGRFx1NjU3MFx1RkYwOVx1RkYwQ1x1NkI2NFx1NTkwNFx1NTNFQVx1NkNFOFx1NTE2NVx1NzcxRlx1NUI5RVx1NEY5RFx1OEQ1Nlx1MzAwMlxuICAgKi9cbiAgYXN5bmMgYWlEaWFnbm9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzID0gdGhpcy5zZXR0aW5ncztcbiAgICBjb25zdCBwbGFubmVyU2V0dGluZ3M6IFBsYW5uZXJTZXR0aW5ncyA9IHtcbiAgICAgIGFpQXBpS2V5OiBzLmFpQXBpS2V5LFxuICAgICAgYWlCYXNlVXJsOiBzLmFpQmFzZVVybCxcbiAgICAgIGFpTW9kZWw6IHMuYWlNb2RlbCxcbiAgICAgIGFpRGVjb21wb3NlRGVwdGg6IHMuYWlEZWNvbXBvc2VEZXB0aCxcbiAgICB9O1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBuZXcgVmF1bHRTdG9yYWdlKHRoaXMuYXBwKTtcbiAgICBhd2FpdCBydW5EaWFnbm9zaXMoe1xuICAgICAgYWlFbmFibGVkOiBzLmFpRW5hYmxlZCxcbiAgICAgIHBsYW5uZXJTZXR0aW5ncyxcbiAgICAgIHN0b3JhZ2UsXG4gICAgICBkaWFnbm9zZTogZGlhZ25vc2UgYXMgdW5rbm93biBhcyB0eXBlb2YgZGlhZ25vc2UsXG4gICAgICBvcGVuRGlhZ25vc2lzOiAobykgPT4gbmV3IERpYWdub3Npc01vZGFsKHRoaXMuYXBwLCBvKS5vcGVuKCksXG4gICAgICBvcGVuQWdlbnRpYzogKG8pID0+IG5ldyBBZ2VudGljUGxhbk1vZGFsKHRoaXMuYXBwLCBvKS5vcGVuKCksXG4gICAgICB3cml0ZUdvYWxzOiAoZykgPT4gdm9pZCB0aGlzLndyaXRlRGlhZ25vc2VkR29hbHMoZyksXG4gICAgICBub3RpY2U6IChtKSA9PiBuZXcgTm90aWNlKG0pLFxuICAgICAgcmVjZW50RGF5czogMTQsXG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU4QkNBXHU2NUFEXHU1RUZBXHU4QkFFXHU1RTk0XHU3NTI4XHU1NDBFXHU3Njg0XHU4NDNEXHU1RTkzXHVGRjFBXHU1MTk5IGdvYWxzLmpzb24gKyBcdTUyMzdcdTY1QjBcdTVFMzhcdTlBN0JcdTg5QzZcdTU2RkVcdUZGMDhcdTRFMERcdTc4QjBcdTVFNDJcdTdCNDlcdTdEMjJcdTVGMTUvIHNvdXJjZVJlZlx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIHdyaXRlRGlhZ25vc2VkR29hbHMoZ29hbHM6IEdvYWxJdGVtW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdG9yYWdlID0gbmV3IFZhdWx0U3RvcmFnZSh0aGlzLmFwcCk7XG4gICAgYXdhaXQgc3RvcmFnZS5wdXRHb2Fscyhnb2Fscyk7XG4gICAgdGhpcy53ZWJhcHAubm90aWZ5R29hbHNDaGFuZ2VkKCk7XG4gICAgbmV3IE5vdGljZShgXHU1REYyXHU1MTk5XHU1MTY1ICR7Z29hbHMubGVuZ3RofSBcdTRFMkFcdTc2RUVcdTY4MDdcdUZGMDhcdTVFOTRcdTc1MjggQUkgXHU4QkNBXHU2NUFEXHU1RUZBXHU4QkFFXHVGRjA5YCk7XG4gIH1cblxuICAvKiogXHU2RkMwXHU2RDNCXHU2MjE2XHU1MjFCXHU1RUZBXHU1OTBEXHU3NkQ4XHU4OUM2XHU1NkZFICovXG4gIGFzeW5jIGFjdGl2YXRlVmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5hcHA7XG5cbiAgICBsZXQgbGVhZjogV29ya3NwYWNlTGVhZiB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0RBSUxZX1JFVklFVyk7XG5cbiAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFx1NURGMlx1NjcwOVx1ODlDNlx1NTZGRVx1RkYwQ1x1NzZGNFx1NjNBNVx1ODA1QVx1NzEyNlxuICAgICAgbGVhZiA9IGxlYXZlc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NUIwXHU4OUM2XHU1NkZFXG4gICAgICBsZWFmID0gd29ya3NwYWNlLmdldExlYWYoZmFsc2UpO1xuICAgICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoe1xuICAgICAgICB0eXBlOiBWSUVXX1RZUEVfREFJTFlfUkVWSUVXLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobGVhZikge1xuICAgICAgYXdhaXQgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NTJBMFx1OEY3RFx1OEJCRVx1N0Y2RSAqL1xuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSkgYXMgQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIH1cblxuICAvKiogXHU0RkREXHU1QjU4XHU4QkJFXHU3RjZFICovXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgSXRlbVZpZXcsIFdvcmtzcGFjZUxlYWYsIEV2ZW50UmVmIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzL1BsdWdpblNldHRpbmdzJztcbmltcG9ydCB7IEFwcEhvc3QgfSBmcm9tICcuLi9ob3N0L0FwcEhvc3QnO1xuaW1wb3J0IHsgQXBwQVBJIH0gZnJvbSAnLi4vaG9zdC9BcHBBUEknO1xuXG5leHBvcnQgY29uc3QgVklFV19UWVBFX0RBSUxZX1JFVklFVyA9ICdiYW1ib28taW1tb3J0YWxzJztcblxuLyoqXG4gKiBEYWlseVJldmlld1ZpZXcgLSBcdTRFM0JcdTg5QzZcdTU2RkVcbiAqXG4gKiBcdTgwNENcdThEMjNcdUZGMUFcbiAqIDEuIFx1NTIxQlx1NUVGQSBpZnJhbWVcdUZGMDhibG9iIFVSTFx1RkYwOVx1NjI3Rlx1OEY3RCB3ZWJhcHBcbiAqIDIuIFx1N0JBMVx1NzQwNiBBcHBIb3N0IC8gQXBwQVBJIFx1NzUxRlx1NTQ3RFx1NTQ2OFx1NjcxRlxuICogMy4gXHU3NkQxXHU1NDJDIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NTNEOFx1NTMxNlx1NUU3Nlx1NTQwQ1x1NkI2NVxuICovXG5leHBvcnQgY2xhc3MgRGFpbHlSZXZpZXdWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuICBwcml2YXRlIHBsdWdpbkRpcjogc3RyaW5nO1xuICBwcml2YXRlIHBsdWdpbjogdW5rbm93bjtcbiAgcHJpdmF0ZSBzZXR0aW5nczogQmFtYm9vUmV2aWV3U2V0dGluZ3M7XG4gIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIHByaXZhdGUgYXBwSG9zdDogQXBwSG9zdCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGFwcEFQSTogQXBwQVBJIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGNzc0NoYW5nZVJlZjogRXZlbnRSZWYgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBsZWFmOiBXb3Jrc3BhY2VMZWFmLFxuICAgIHBsdWdpbkRpcjogc3RyaW5nLFxuICAgIF9wbHVnaW46IHVua25vd24sXG4gICAgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzLFxuICAgIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPlxuICApIHtcbiAgICBzdXBlcihsZWFmKTtcbiAgICB0aGlzLnBsdWdpbkRpciA9IHBsdWdpbkRpcjtcbiAgICB0aGlzLnBsdWdpbiA9IF9wbHVnaW47XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0RBSUxZX1JFVklFVztcbiAgfVxuXG4gIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnO1xuICB9XG5cbiAgZ2V0SWNvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGVhZic7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgY29udGFpbmVyLmFkZENsYXNzKCdiYW1ib28tcmV2aWV3LWNvbnRhaW5lcicpO1xuXG4gICAgaWYgKCF0aGlzLnBsdWdpbkRpcikge1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjA6IFx1NjVFMFx1NkNENVx1NUI5QVx1NEY0RFx1NjNEMlx1NEVGNlx1NzZFRVx1NUY1NScsXG4gICAgICAgIGNsczogJ2JhbWJvby1yZXZpZXctZXJyb3InLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2IEFwcEFQSVx1RkYwOFx1OTAxQVx1NEZFMVx1NUM0Mlx1RkYwOVxuICAgIHRoaXMuYXBwQVBJID0gbmV3IEFwcEFQSShcbiAgICAgIHRoaXMuYXBwLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzLFxuICAgICAgdGhpcy5zZXR0aW5ncy5ub2lzZVBhdGggfHwgJycsXG4gICAgICB0aGlzLmFwcC52YXVsdC5jb25maWdEaXJcbiAgICApO1xuICAgIGF3YWl0IHRoaXMuYXBwQVBJLmVuc3VyZVN0cnVjdHVyZSgpO1xuXG4gICAgLy8gXHU2MjZCXHU2M0NGXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XG4gICAgY29uc3QgY3VzdG9tVGhlbWVzID0gYXdhaXQgdGhpcy5zY2FuQ3VzdG9tVGhlbWVzKCk7XG4gICAgdGhpcy5hcHBBUEkuc2V0Q3VzdG9tVGhlbWVzKGN1c3RvbVRoZW1lcyk7XG5cbiAgICAvLyBcdTUyMUJcdTVFRkEgQXBwSG9zdCBcdTVFNzZcdTY3ODRcdTVFRkEgYmxvYiBVUkxcbiAgICBjb25zdCB2ZXJzaW9uID0gKHRoaXMucGx1Z2luIGFzIHsgbWFuaWZlc3Q/OiB7IHZlcnNpb24/OiBzdHJpbmcgfSB9IHwgdW5kZWZpbmVkKT8ubWFuaWZlc3Q/LnZlcnNpb24gPz8gJyc7XG4gICAgdGhpcy5hcHBIb3N0ID0gbmV3IEFwcEhvc3QodGhpcy5hcHAsIHRoaXMucGx1Z2luRGlyLCB2ZXJzaW9uKTtcblxuICAgIGNvbnN0IGxvYWRpbmdFbCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgdGV4dDogJ1x1N0FGOVx1Njc5N1x1NEZFRVx1NEVEOVx1NEYyMFx1NTJBMFx1OEY3RFx1NEUyRFx1MjAyNicsXG4gICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWxvYWRpbmcnLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuYXBwQVBJLnN0YXJ0TGlzdGVuaW5nKCk7XG4gICAgICBjb25zdCBibG9iVXJsID0gYXdhaXQgdGhpcy5hcHBIb3N0LmJ1aWxkQmxvYlVybCgpO1xuXG4gICAgICB0aGlzLmlmcmFtZSA9IGNvbnRhaW5lci5jcmVhdGVFbCgnaWZyYW1lJywge1xuICAgICAgICBjbHM6ICdiYW1ib28tcmV2aWV3LWZyYW1lJyxcbiAgICAgICAgYXR0cjoge1xuICAgICAgICAgIHNyYzogYmxvYlVybCxcbiAgICAgICAgICBhbGxvdzogJ2NhbWVyYTsgbWljcm9waG9uZTsgY2xpcGJvYXJkLXJlYWQ7IGNsaXBib2FyZC13cml0ZScsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgbG9hZGluZ0VsLnJlbW92ZSgpO1xuICAgICAgdGhpcy5hcHBBUEkuYmluZElmcmFtZSh0aGlzLmlmcmFtZSk7XG5cbiAgICAgIHRoaXMuY3NzQ2hhbmdlUmVmID0gdGhpcy5hcHAud29ya3NwYWNlLm9uKCdjc3MtY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmFwcEFQST8ub25UaGVtZUNoYW5nZWQodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvYWRpbmdFbC5yZW1vdmUoKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCYW1ib29SZXZpZXddIFx1NTJBMFx1OEY3RCB3ZWJhcHAgXHU1OTMxXHU4RDI1OicsIGUpO1xuICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6IGBcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTUyQTBcdThGN0RcdTU5MzFcdThEMjU6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRid9YCxcbiAgICAgICAgY2xzOiAnYmFtYm9vLXJldmlldy1lcnJvcicsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NkUwNVx1NzQwNlx1NEUzQlx1OTg5OFx1NzZEMVx1NTQyQ1xuICAgIGlmICh0aGlzLmNzc0NoYW5nZVJlZikge1xuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9mZnJlZih0aGlzLmNzc0NoYW5nZVJlZik7XG4gICAgICB0aGlzLmNzc0NoYW5nZVJlZiA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gXHU2RTA1XHU3NDA2XHU5MDFBXHU0RkUxXHU1QzQyXG4gICAgdGhpcy5hcHBBUEk/LmRldGFjaCgpO1xuICAgIHRoaXMuYXBwQVBJID0gbnVsbDtcblxuICAgIC8vIFx1NkUwNVx1NzQwNiBibG9iIFVSTFxuICAgIHRoaXMuYXBwSG9zdD8uZGVzdHJveSgpO1xuICAgIHRoaXMuYXBwSG9zdCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgIHRoaXMuaWZyYW1lLnJlbW92ZSgpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTYzQTVcdTY1MzZcdTY3NjVcdTgxRUFcdTYzRDJcdTRFRjZcdTc2ODRcdTVCRkNcdTgyMkEvXHU2NENEXHU0RjVDXHU2MzA3XHU0RUU0ICovXG4gIHNlbmRDb21tYW5kKHR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pZnJhbWU/LmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgeyB0eXBlLCBpZDogJ2NtZF8nICsgRGF0ZS5ub3coKSB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTYyNkJcdTYzQ0YgVmF1bHQgXHU0RTJEXHU3Njg0XHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4ICovXG4gIHByaXZhdGUgYXN5bmMgc2NhbkN1c3RvbVRoZW1lcygpOiBQcm9taXNlPEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCB0aGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aGVtZURpck5hbWUgPSB0aGlzLnNldHRpbmdzLnRoZW1lUGF0aCB8fCAnXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JztcbiAgICAgIGxldCB0aGVtZURpckZpbGVzOiBzdHJpbmdbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW1lRGlyRmlsZXMgPSAoYXdhaXQgYWRhcHRlci5saXN0KHRoZW1lRGlyTmFtZSkpLmZpbGVzO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiB0aGVtZXM7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhlbWVEaXJGaWxlcykge1xuICAgICAgICBpZiAoIWVudHJ5LmVuZHNXaXRoKCcuanMnKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYCR7dGhlbWVEaXJOYW1lfS8ke2VudHJ5fWA7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29kZTogc3RyaW5nID0gYXdhaXQgYWRhcHRlci5yZWFkKGZpbGVQYXRoKTtcbiAgICAgICAgICBpZiAoIWNvZGUuaW5jbHVkZXMoJ19fYmFtYm9vX3RoZW1lXycpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtCYW1ib29SZXZpZXddIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5OCAke2VudHJ5fSBcdTdGM0FcdTVDMTEgX19iYW1ib29fdGhlbWVfIFx1NjgwN1x1OEJDNlx1N0IyNlx1RkYwQ1x1NURGMlx1OERGM1x1OEZDN2ApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoZW1lcy5wdXNoKHsgbmFtZTogZW50cnkucmVwbGFjZSgvXFwuanMkLywgJycpLCBjb2RlIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQmFtYm9vUmV2aWV3XSBcdThCRkJcdTUzRDZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggJHtlbnRyeX0gXHU1OTMxXHU4RDI1OmAsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoZW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYFtCYW1ib29SZXZpZXddIFx1NTNEMVx1NzNCMCAke3RoZW1lcy5sZW5ndGh9IFx1NEUyQVx1ODFFQVx1NUI5QVx1NEU0OVx1NEUzQlx1OTg5ODpgLCB0aGVtZXMubWFwKHQgPT4gdC5uYW1lKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdbQmFtYm9vUmV2aWV3XSBcdTYyNkJcdTYzQ0ZcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhlbWVzO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBEYXRhQWRhcHRlciwgbm9ybWFsaXplUGF0aCwgcmVxdWVzdFVybCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IHVuemlwU3luYyB9IGZyb20gJ2ZmbGF0ZSc7XG5cbi8qKlxuICogQXBwSG9zdCBcdTIwMTQgd2ViYXBwIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NEUwRVx1NkNFOFx1NTE2NVx1NEUyRFx1NUZDM1xuICpcbiAqIFx1NTJBMFx1OEY3RFx1N0I1Nlx1NzU2NVx1RkYwOFx1OEY3Qlx1OTFDRlx1MzAwMVx1OTZGNlx1NTE4NVx1NUQ0Q1x1RkYwOVx1RkYxQVxuICogICAxLiBcdThCRkJcdTUzRDZcdTY3ODRcdTVFRkFcdTY3MUZcdTc1MUZcdTYyMTBcdTc2ODRcdTgxRUFcdTUzMDVcdTU0MkIgd2ViYXBwL2FwcC5odG1sXHVGRjA4Q1NTIFx1NURGMlx1NTE4NVx1ODA1NFx1MzAwMWJ1bmRsZSBcdTVERjJcdTUxODVcdTgwNTRcdTRFM0FcdTk3NTlcdTYwMDFcbiAqICAgICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+IFx1NjgwN1x1N0I3RVx1RkYwQ1x1NjVFMFx1NEVGQlx1NEY1NVx1NTkxNlx1OTBFOFx1ODExQVx1NjcyQ1x1MzAwMVx1NjVFMFx1NTM2MFx1NEY0RFx1N0IyNlx1RkYwOVx1MzAwMlxuICogICAyLiBcdTVDMDZcdTY1NzRcdTk4NzUgSFRNTCBcdTRFRTUgYmxvYiBVUkwgXHU1RjYyXHU1RjBGXHU0RUE0XHU3RUQ5IGlmcmFtZSBcdTUyQTBcdThGN0RcdTMwMDJcbiAqXG4gKiBcdTc1MzFcdTRFOEVcdTYyNDBcdTY3MDkgPHNjcmlwdD4gXHU1NzQ3XHU1NzI4XHU2Nzg0XHU1RUZBXHU2NzFGXHVGRjA4YnVuZGxlLXdlYmFwcC5tanNcdUZGMDlcdTk3NTlcdTYwMDFcdTUxOTlcdTUxNjUgYXBwLmh0bWxcdUZGMENcdThGRDBcdTg4NENcdTY1RjZcbiAqIG1haW4uanMgXHU0RTBEXHU1MjFCXHU1RUZBXHUzMDAxXHU0RTBEXHU2MkZDXHU2M0E1XHU0RUZCXHU0RjU1IHNjcmlwdCBcdTUxNDNcdTdEMjBcdUZGMENcdTg5QzRcdTkwN0ZcdTVCODlcdTUxNjhcdTYyNkJcdTYzQ0ZcdTMwMENcdTUyQThcdTYwMDFcdTZDRThcdTUxNjVcdTgxMUFcdTY3MkNcdTMwMERcdThCRUZcdTYyQTVcdTMwMDJcbiAqXG4gKiB3ZWJhcHAgXHU3NTMxXHU1M0QxXHU1RTAzXHU2RDQxXHU3QTBCXHU2MjUzXHU1MzA1XHU0RTNBIHdlYmFwcC56aXAgXHU5NjhGXHU3MjQ4XHU2NzJDXHU1MjA2XHU1M0QxXHVGRjA4XHU4OUMxIC5naXRodWIvd29ya2Zsb3dzL3JlbGVhc2UueW1sXHVGRjA5XHVGRjBDXG4gKiBcdTY3MkNcdTU3MzBcdTVGMDBcdTUzRDEvXHU1MTg1XHU2RDRCXHU5MDFBXHU4RkM3IHN5bmMuc2ggXHU1NDBDXHU2QjY1XHU2NTc0XHU0RTJBIHdlYmFwcC8gXHU3NkVFXHU1RjU1XHVGRjA4XHU1NDJCIGFwcC5odG1sXHVGRjA5XHVGRjBDXHU4RkQwXHU4ODRDXHU2NUY2XHU3NkY0XHU2M0E1XHU4QkZCXHU1M0Q2XHVGRjBDXG4gKiBcdTY1RTBcdTk3MDBcdTUxODVcdTVENENcdTMwMDFcdTY1RTBcdTU5MTZcdTkwRThcdTgwNTRcdTdGNTFcdUZGMENtYWluLmpzIFx1NEZERFx1NjMwMVx1OEY3Qlx1OTFDRlx1MzAwMlxuICpcbiAqIFx1ODFFQVx1NjEwOFx1RkYwOFx1NzI0OFx1NjcyQ1x1NUI4OFx1NTM2Qlx1RkYwOVx1RkYxQVx1OEZEMFx1ODg0Q1x1NjVGNlx1NkJENFx1NUJGOSB3ZWJhcHAvLndlYmFwcC12ZXJzaW9uIFx1NEUwRVx1NUY1M1x1NTI0RFx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1MzAwMlxuICogICAtIFx1NjcyQ1x1NTczMFx1N0YzQVx1NTkzMSB3ZWJhcHAvXHVGRjBDXHU2MjE2XHU3MjQ4XHU2NzJDXHU2MjMzXHU3RjNBXHU1OTMxXHVGRjA4XHU4MDAxIGNsb25lIC8gXHU1Mzg2XHU1M0YyXHU5MDU3XHU3NTU5XHVGRjA5XHUyMTkyIFx1NEZFMVx1NEVGQlx1NzhDMVx1NzZEOFx1NjIxNlx1OTY0RFx1N0VBN1x1RkYxQlxuICogICAtIFx1NzI0OFx1NjcyQ1x1NEUwRFx1N0IyNlx1RkYwOFx1NjNEMlx1NEVGNlx1NURGMlx1NTM0N1x1N0VBN1x1NEY0NiB3ZWJhcHAgXHU2NzJBXHU4RERGXHU5NjhGXHVGRjA5XHUyMTkyIFx1OTFDRFx1NjVCMFx1NEVDRVx1NUJGOVx1NUU5NFx1NzI0OFx1NjcyQyBHaXRIdWIgUmVsZWFzZVxuICogICAgIFx1ODFFQVx1NEUzRVx1NEUwQlx1OEY3RCB3ZWJhcHAuemlwIFx1NUU3Nlx1ODlFM1x1NTM4Qlx1RkYwQ1x1NEY3Rlx1MzAwQ3dlYmFwcCBcdTY2RjRcdTY1QjBcdTdFQ0YgR2l0SHViIFx1OTY4Rlx1NjNEMlx1NEVGNlx1NzI0OFx1NjcyQ1x1OTAwMVx1OEZCRVx1MzAwRFx1NzcxRlx1NkI2M1x1NjIxMFx1N0FDQlx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgQXBwSG9zdCB7XG4gIHByaXZhdGUgYXBwOiBBcHA7XG4gIHByaXZhdGUgd2ViYXBwRGlyOiBzdHJpbmc7XG4gIHByaXZhdGUgYmxvYlVybHM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgcmVhZG9ubHkgdmVyc2lvbjogc3RyaW5nO1xuICBwcml2YXRlIHJlYWRvbmx5IHJlcG8gPSAnbWlhb3ppZ3Vhbi9vYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luRGlyOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMud2ViYXBwRGlyID0gbm9ybWFsaXplUGF0aChgJHtwbHVnaW5EaXJ9L3dlYmFwcGApO1xuICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb247XG4gIH1cblxuICAvLyBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDZcdTc2ODRcdTUzQkJcdTkxQ0RcdTdGMTNcdTVCNThcdUZGMUFcdTkwN0ZcdTUxNERcdTYzRDJcdTRFRjYgb25sb2FkIFx1OTg4NFx1NjJDOVx1NTNENlx1NEUwRVx1ODlDNlx1NTZGRVx1NjI1M1x1NUYwMFx1NjVGNlx1OTFDRFx1NTkwRFx1NEUwQlx1OEY3RFxuICBwcml2YXRlIHN0YXRpYyBwcmVmZXRjaENhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8dm9pZD4+KCk7XG5cbiAgLyoqXG4gICAqIFx1NTQwRVx1NTNGMFx1OTg4NFx1NjJDOVx1NTNENlx1RkYxQVx1NjNEMlx1NEVGNiBvbmxvYWQgXHU2NUY2XHU4QzAzXHU3NTI4XHVGRjBDXHU2M0QwXHU1MjREXHU2MjhBXHU3RjNBXHU1OTMxXHU3Njg0IHdlYmFwcCBcdTRFMEJcdThGN0RcdTVFNzZcdTg5RTNcdTUzOEJcdTUyMzBcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdTMwMDJcbiAgICogXHU2QjYzXHU1RTM4XHU1Qjg5XHU4OEM1XHVGRjA4d2ViYXBwLyBcdTVERjJcdTk2OEZcdTYzRDJcdTRFRjZcdTUyMDZcdTUzRDFcdUZGMDlcdTY1RjZcdTRFQzVcdTUwNUFcdTRFMDBcdTZCMjFcdTVCNThcdTU3MjhcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMENcdTUxRTBcdTRFNEVcdTk2RjZcdTVGMDBcdTk1MDBcdTMwMDJcbiAgICogXHU1OTMxXHU4RDI1XHU0RUM1XHU1NDRBXHU4QjY2XHVGRjA4XHU0RTBEXHU2MjlCXHU1MUZBXHVGRjA5XHVGRjBDXHU3NzFGXHU2QjYzXHU2MjUzXHU1RjAwXHU4OUM2XHU1NkZFXHU2NUY2IGJ1aWxkQmxvYlVybCBcdTRGMUFcdTUxOERcdTZCMjFcdTVDMURcdThCRDVcdUZGMUJcbiAgICogXHU1NDBDXHU0RTAwXHU2M0QyXHU0RUY2XHU3NkVFXHU1RjU1XHU1RTc2XHU1M0QxXHU1M0VBXHU4OUU2XHU1M0QxXHU0RTAwXHU2QjIxXHU0RTBCXHU4RjdEXHUzMDAyXG4gICAqL1xuICBzdGF0aWMgcHJlZmV0Y2goYXBwOiBBcHAsIHBsdWdpbkRpcjogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBrZXkgPSBub3JtYWxpemVQYXRoKGAke3BsdWdpbkRpcn0vd2ViYXBwYCk7XG4gICAgbGV0IHAgPSBBcHBIb3N0LnByZWZldGNoQ2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKCFwKSB7XG4gICAgICBjb25zdCBob3N0ID0gbmV3IEFwcEhvc3QoYXBwLCBwbHVnaW5EaXIsIHZlcnNpb24pO1xuICAgICAgcCA9IGhvc3QuZW5zdXJlV2ViYXBwKGFwcC52YXVsdC5hZGFwdGVyKS5jYXRjaCgoZTogdW5rbm93bikgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJ1tBcHBIb3N0XSBcdTU0MEVcdTUzRjBcdTk4ODRcdTYyQzlcdTUzRDYgd2ViYXBwIFx1NTkzMVx1OEQyNVx1RkYwOFx1NjI1M1x1NUYwMFx1ODlDNlx1NTZGRVx1NjVGNlx1NUMwNlx1OTFDRFx1OEJENVx1RkYwOVx1RkYxQScsXG4gICAgICAgICAgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIEFwcEhvc3QucHJlZmV0Y2hDYWNoZS5zZXQoa2V5LCBwKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICBhc3luYyBidWlsZEJsb2JVcmwoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcblxuICAgIC8vIFx1ODFFQVx1NjEwOFx1RkYxQXdlYmFwcC8gXHU3RjNBXHU1OTMxXHU2NUY2XHU0RUNFXHU1QkY5XHU1RTk0XHU3MjQ4XHU2NzJDIFJlbGVhc2UgXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHU1RTc2XHU4OUUzXHU1MzhCXG4gICAgYXdhaXQgdGhpcy5lbnN1cmVXZWJhcHAoYWRhcHRlcik7XG5cbiAgICBjb25zdCBhcHBIdG1sUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9L2FwcC5odG1sYCk7XG4gICAgbGV0IGh0bWw6IHN0cmluZztcbiAgICB0cnkge1xuICAgICAgaHRtbCA9IGF3YWl0IGFkYXB0ZXIucmVhZChhcHBIdG1sUGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NjVFMFx1NkNENVx1OEJGQlx1NTNENiB3ZWJhcHAvYXBwLmh0bWxcdUZGMENcdTRFMTRcdTgxRUFcdTUyQThcdTRFMEJcdThGN0RcdTU5MzFcdThEMjVcdTMwMDJcdThCRjdcdTVDMURcdThCRDVcdTU3MjggT2JzaWRpYW4gXHU0RTJEXHU5MUNEXHU2NUIwXHU1Qjg5XHU4OEM1XHU2NzJDXHU2M0QyXHU0RUY2XHVGRjBDXHU2MjE2XHU2MjRCXHU1MkE4XHU2NTNFXHU3RjZFIHdlYmFwcC8gXHU3NkVFXHU1RjU1Jyk7XG4gICAgfVxuXG4gICAgLy8gXHU2NTc0XHU5ODc1IEhUTUwgXHU1REYyXHU4MUVBXHU1MzA1XHU1NDJCXHVGRjA4Q1NTIFx1NTE4NVx1ODA1NCArIGJ1bmRsZSBcdTUxODVcdTgwNTRcdTRFM0FcdTk3NTlcdTYwMDEgPHNjcmlwdD5cdUZGMDlcdUZGMENcdTc2RjRcdTYzQTUgYmxvYiBcdTRFQTRcdTdFRDkgaWZyYW1lXHUzMDAyXG4gICAgLy8gXHU4RkQwXHU4ODRDXHU2NUY2XHU0RTBEXHU1MjFCXHU1RUZBXHUzMDAxXHU0RTBEXHU2MkZDXHU2M0E1XHU0RUZCXHU0RjU1IHNjcmlwdCBcdTUxNDNcdTdEMjBcdTMwMDJcbiAgICBjb25zdCBwYWdlQmxvYiA9IG5ldyBCbG9iKFtodG1sXSwgeyB0eXBlOiAndGV4dC9odG1sJyB9KTtcbiAgICBjb25zdCBwYWdlVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChwYWdlQmxvYik7XG4gICAgdGhpcy5ibG9iVXJscy5wdXNoKHBhZ2VVcmwpO1xuICAgIHJldHVybiBwYWdlVXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODFFQVx1NjEwOFx1RkYwOFx1NzI0OFx1NjcyQ1x1NUI4OFx1NTM2Qlx1RkYwOVx1RkYxQVx1ODJFNVx1NjcyQ1x1NTczMCB3ZWJhcHAgXHU3RjNBXHU1OTMxXHVGRjBDXHU2MjE2XHU1REYyXHU1QjU4XHU1NzI4XHU0RjQ2XHU3MjQ4XHU2NzJDXHU2MjMzXHU0RTBFXHU1RjUzXHU1MjREXHU2M0QyXHU0RUY2XHU3MjQ4XHU2NzJDXHU0RTBEXHU3QjI2XHVGRjBDXG4gICAqIFx1NTIxOVx1OTFDRFx1NjVCMFx1NEVDRSBHaXRIdWIgUmVsZWFzZSBcdTRFMEJcdThGN0RcdTVCRjlcdTVFOTRcdTcyNDhcdTY3MkNcdTc2ODQgd2ViYXBwLnppcCBcdTg5RTNcdTUzOEJcdUZGMDhcdTg5ODZcdTc2RDZcdUZGMDlcdTMwMDJcbiAgICogXHU2QjYzXHU1RTM4XHU1Qjg5XHU4OEM1XHVGRjA4d2ViYXBwLyBcdTVERjJcdTk2OEZcdTYzRDJcdTRFRjZcdTUyMDZcdTUzRDFcdTRFMTRcdTcyNDhcdTY3MkNcdTUzMzlcdTkxNERcdUZGMDlcdTVCOENcdTUxNjhcdTRFMERcdTg5RTZcdTUzRDFcdTgwNTRcdTdGNTFcdUZGMUJcdTRFQzVcdTdGM0FcdTU5MzFcdTYyMTZcdThGQzdcdTY3MUZcdTY1RjZcdTUxNUNcdTVFOTVcdTMwMDJcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlV2ViYXBwKGFkYXB0ZXI6IERhdGFBZGFwdGVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdmVyc2lvblN0YW1wRmlsZSA9ICcud2ViYXBwLXZlcnNpb24nO1xuICAgIGNvbnN0IGFwcEh0bWxQYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLndlYmFwcERpcn0vYXBwLmh0bWxgKTtcbiAgICBjb25zdCBzdGFtcFBhdGggPSBub3JtYWxpemVQYXRoKGAke3RoaXMud2ViYXBwRGlyfS8ke3ZlcnNpb25TdGFtcEZpbGV9YCk7XG5cbiAgICBpZiAoYXdhaXQgdGhpcy5maWxlRXhpc3RzKGFkYXB0ZXIsIGFwcEh0bWxQYXRoKSkge1xuICAgICAgLy8gd2ViYXBwLyBcdTVCNThcdTU3MjhcdUZGMUFcdTRFQzVcdTVGNTNcdTcyNDhcdTY3MkNcdTYyMzNcdTdGM0FcdTU5MzFcdUZGMDhcdTgwMDEgY2xvbmUgLyBcdTUzODZcdTUzRjJcdTkwNTdcdTc1NTlcdUZGMDlcdTYyMTZcdTcyNDhcdTY3MkNcdTRFMERcdTdCMjZcdTY1RjZcdTYyNERcdTkxQ0RcdTRFMEJcdUZGMENcbiAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NEZFMVx1NEVGQlx1NzhDMVx1NzZEOCBcdTIwMTRcdTIwMTQgQlJBVCAvIGdpdC1jbG9uZSBcdTk2OEZcdTRFRDNcdTVFOTNcdTU0MENcdTZCNjVcdTc2ODRcdTY3MDBcdTY1QjAgd2ViYXBwIFx1NTM3M1x1NkI2M1x1Nzg2RVx1RkYwQ1x1NjVFMFx1OTcwMFx1ODA1NFx1N0Y1MVx1MzAwMlxuICAgICAgaWYgKCEoYXdhaXQgdGhpcy5maWxlRXhpc3RzKGFkYXB0ZXIsIHN0YW1wUGF0aCkpKSByZXR1cm47XG4gICAgICBjb25zdCBsb2NhbCA9IGF3YWl0IHRoaXMucmVhZFZlcnNpb25TdGFtcChhZGFwdGVyLCBzdGFtcFBhdGgpO1xuICAgICAgaWYgKGxvY2FsID09PSB0aGlzLnZlcnNpb24pIHJldHVybjtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgW0FwcEhvc3RdIFx1NjcyQ1x1NTczMCB3ZWJhcHAgXHU3MjQ4XHU2NzJDKCR7bG9jYWx9KSBcdTRFMEVcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkMoJHt0aGlzLnZlcnNpb259KSBcdTRFMERcdTdCMjZcdUZGMENcdTkxQ0RcdTY1QjBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTMwMDJgXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghdGhpcy52ZXJzaW9uKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tBcHBIb3N0XSBcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTYzRDJcdTRFRjZcdTcyNDhcdTY3MkNcdUZGMENcdThERjNcdThGQzdcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTMwMDJcdThCRjdcdTc4NkVcdThCQTRcdTYzRDJcdTRFRjZcdTVCODlcdTg4QzVcdTVCOENcdTY1NzRcdTMwMDInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7dGhpcy5yZXBvfS9yZWxlYXNlcy9kb3dubG9hZC8ke3RoaXMudmVyc2lvbn0vd2ViYXBwLnppcGA7XG4gICAgY29uc29sZS5sb2coYFtBcHBIb3N0XSBcdTY3MkFcdTY4QzBcdTZENEJcdTUyMzBcdTUzMzlcdTkxNERcdTc2ODRcdTY3MkNcdTU3MzAgd2ViYXBwXHVGRjBDXHU1QzFEXHU4QkQ1XHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHVGRjFBJHt1cmx9YCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCByZXF1ZXN0VXJsKHsgdXJsLCBtZXRob2Q6ICdHRVQnIH0pO1xuICAgICAgaWYgKHJlc3Auc3RhdHVzIDwgMjAwIHx8IHJlc3Auc3RhdHVzID49IDMwMCB8fCAhcmVzcC5hcnJheUJ1ZmZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NEUwQlx1OEY3RFx1OEZENFx1NTZERVx1NUYwMlx1NUUzOFx1NzJCNlx1NjAwMSAke3Jlc3Auc3RhdHVzfWApO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5leHRyYWN0WmlwKGFkYXB0ZXIsIHJlc3AuYXJyYXlCdWZmZXIpO1xuICAgICAgLy8gd2ViYXBwLnppcCBcdTVERjJcdTY0M0FcdTVFMjYgLndlYmFwcC12ZXJzaW9uXHVGRjBDXHU4OUUzXHU1MzhCXHU1NDBFXHU4MUVBXHU1MkE4XHU4NDNEXHU3NkQ4XHVGRjFCXHU2QjY0XHU1OTA0XHU1MTVDXHU1RTk1XHU1MThEXHU1MTk5XHU0RTAwXHU2QjIxXHVGRjBDXG4gICAgICAvLyBcdTkwN0ZcdTUxNERcdTU0MENcdTcyNDhcdTY3MkNcdTUzQ0RcdTU5MERcdTkxQ0RcdTRFMEJcdTMwMDJcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFkYXB0ZXIud3JpdGUoc3RhbXBQYXRoLCB0aGlzLnZlcnNpb24pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tBcHBIb3N0XSBcdTUxOTlcdTUxNjUgd2ViYXBwIFx1NzI0OFx1NjcyQ1x1NjIzM1x1NTkzMVx1OEQyNVx1RkYwOFx1NEUwRFx1NUY3MVx1NTRDRFx1NEY3Rlx1NzUyOFx1RkYwOVx1RkYxQScsIGUpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJ1tBcHBIb3N0XSB3ZWJhcHAgXHU4MUVBXHU0RTNFXHU0RTBCXHU4RjdEXHU1RTc2XHU4OUUzXHU1MzhCXHU1QjhDXHU2MjEwXHUzMDAyJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcignW0FwcEhvc3RdIHdlYmFwcCBcdTgxRUFcdTRFM0VcdTRFMEJcdThGN0RcdTU5MzFcdThEMjVcdUZGMUEnLCBlKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFx1NjVFMFx1NkNENVx1ODFFQVx1NTJBOFx1ODNCN1x1NTNENiB3ZWJhcHBcdUZGMDgke2UgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdTY3MkFcdTc3RTVcdTk1MTlcdThCRUYnfVx1RkYwOVx1MzAwMmAgK1xuICAgICAgICAnXHU4QkY3XHU2OEMwXHU2N0U1XHU3RjUxXHU3RURDXHU1NDBFXHU5MUNEXHU4QkQ1XHVGRjBDXHU2MjE2XHU1NzI4IE9ic2lkaWFuIFx1NEUyRFx1OTFDRFx1NjVCMFx1NUI4OVx1ODhDNVx1NjcyQ1x1NjNEMlx1NEVGNlx1MzAwMidcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWFkVmVyc2lvblN0YW1wKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoYXdhaXQgYWRhcHRlci5yZWFkKGZpbGVQYXRoKSkudHJpbSgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBleHRyYWN0WmlwKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBidWZmZXI6IEFycmF5QnVmZmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gZmZsYXRlIFx1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwOFx1NjVFMCBzZXRpbW1lZGlhdGUgXHU0RTRCXHU3QzdCXHU0RjFBXHU1MkE4XHU2MDAxXHU1MjFCXHU1RUZBIDxzY3JpcHQ+IFx1NzY4NFx1NEYyMFx1OTAxMlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1xuICAgIC8vIFx1OEZENFx1NTZERVx1NzY4NCBlbnRyaWVzIFx1NEVDNVx1NTQyQlx1NjU4N1x1NEVGNlx1RkYwOFx1NEUwRFx1NTQyQlx1NzZFRVx1NUY1NVx1Njc2MVx1NzZFRVx1RkYwOVx1RkYwQ1x1NzZFRVx1NUY1NVx1NzUzMSBlbnN1cmVQYXJlbnREaXJTYWZlIFx1NjMwOVx1OTcwMFx1NTIxQlx1NUVGQVx1MzAwMlxuICAgIGNvbnN0IGZpbGVzID0gdW56aXBTeW5jKG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpO1xuICAgIGNvbnN0IGVudHJpZXM6IHsgdGFyZ2V0OiBzdHJpbmc7IGNvbnRlbnQ6IFVpbnQ4QXJyYXkgfVtdID0gW107XG4gICAgZm9yIChjb25zdCBbcmF3UGF0aCwgY29udGVudF0gb2YgT2JqZWN0LmVudHJpZXMoZmlsZXMpKSB7XG4gICAgICBjb25zdCByZWwgPSBub3JtYWxpemVQYXRoKHJhd1BhdGgucmVwbGFjZSgvXlxcLj9cXC8vLCAnJykpO1xuICAgICAgaWYgKCFyZWwpIGNvbnRpbnVlO1xuICAgICAgaWYgKHJlbC5lbmRzV2l0aCgnLycpKSBjb250aW51ZTsgLy8gXHU3NkVFXHU1RjU1XHU1MzYwXHU0RjREXHU2NzYxXHU3NkVFXHVGRjBDXHU2NUUwXHU5NzAwXHU1MTk5XHU1MUZBXG4gICAgICBlbnRyaWVzLnB1c2goeyB0YXJnZXQ6IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy53ZWJhcHBEaXJ9LyR7cmVsfWApLCBjb250ZW50IH0pO1xuICAgIH1cblxuICAgIC8vIFx1N0IyQ1x1NEUwMFx1OTA0RFx1RkYxQVx1NTE0OFx1NUVGQVx1NTk3RFx1NjI0MFx1NjcwOVx1NzIzNlx1NzZFRVx1NUY1NVx1MzAwMlx1ODJFNVx1NjdEMFx1NEUwMFx1N0VBN1x1NURGMlx1ODhBQlx1NTQwQ1x1NTQwRFx1NjU4N1x1NEVGNlx1NTM2MFx1NzUyOFx1RkYwOHppcCBcdTc2RUVcdTVGNTVcdTUzNjBcdTRGNERcdTY3NjFcdTc2RUVcdTMwMDFcbiAgICAvLyBcdTYyMTZcdTY3MkNcdTU3MzBcdTZCOEJcdTc1NTlcdTc2ODRcdTU3NEZcdTY1ODdcdTRFRjZcdUZGMDlcdUZGMENcdTUxNDhcdTUyMjBcdTk2NjRcdTUxOERcdTVFRkFcdTc2RUVcdTVGNTVcdUZGMENcdTkwN0ZcdTUxNERcdTU0MEVcdTdFRUQgd3JpdGVCaW5hcnkgXHU4OUU2XHU1M0QxIEVOT1RESVJcdTMwMDJcbiAgICBmb3IgKGNvbnN0IHsgdGFyZ2V0IH0gb2YgZW50cmllcykge1xuICAgICAgYXdhaXQgdGhpcy5lbnN1cmVQYXJlbnREaXJTYWZlKGFkYXB0ZXIsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgLy8gXHU3QjJDXHU0RThDXHU5MDREXHVGRjFBXHU1MTk5XHU2NTg3XHU0RUY2XHUzMDAyXHU4MkU1XHU2N0QwXHU2NzYxXHU3NkVFXHU4REVGXHU1Rjg0XHU1REYyXHU4OEFCXHU1RjUzXHU0RjVDXHU3NkVFXHU1RjU1XHU1MTk5XHU1MTY1XHVGRjA4XHU1MzYwXHU0RjREXHU2NTg3XHU0RUY2XHU0RTBFXHU3NzFGXHU1QjlFXHU3NkVFXHU1RjU1XHU1MUIyXHU3QTgxXHVGRjA5XHVGRjBDXG4gICAgLy8gXHU4REYzXHU4RkM3XHU4QkU1XHU1MzYwXHU0RjREXHU2NTg3XHU0RUY2XHVGRjBDXHU0RTBEXHU4OTg2XHU3NkQ2XHU0RTNBXHU2NTg3XHU0RUY2XHVGRjBDXHU0RkREXHU4QkMxIGFzc2V0cy9zY3JpcHRzLyogXHU3QjQ5XHU1RDRDXHU1OTU3XHU2NTg3XHU0RUY2XHU4MEZEXHU2QjYzXHU1RTM4XHU4NDNEXHU3NkQ4XHUzMDAyXG4gICAgZm9yIChjb25zdCB7IHRhcmdldCwgY29udGVudCB9IG9mIGVudHJpZXMpIHtcbiAgICAgIGlmIChhd2FpdCB0aGlzLmlzRm9sZGVyKGFkYXB0ZXIsIHRhcmdldCkpIGNvbnRpbnVlO1xuICAgICAgLy8gVWludDhBcnJheSBcdTIxOTIgXHU3MkVDXHU3QUNCIEFycmF5QnVmZmVyXHVGRjBDXHU5MDdGXHU1MTREXHU1MTcxXHU0RUFCXHU1RTk1XHU1QzQyIGJ1ZmZlciBcdTVCRkNcdTgxRjRcdThEOEFcdTc1NENcbiAgICAgIGF3YWl0IGFkYXB0ZXIud3JpdGVCaW5hcnkodGFyZ2V0LCBjb250ZW50LnNsaWNlKCkuYnVmZmVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU5MDEwXHU3RUE3XHU3ODZFXHU0RkREXHU3MjM2XHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XHVGRjFCXHU5MDQ3XHU1MjMwXHUzMDBDXHU1NDBDXHU1NDBEXHU2NTg3XHU0RUY2XHU1MzYwXHU0RjREXHUzMDBEXHU2NUY2XHU1MTQ4XHU1MjIwXHU5NjY0XHU1MThEIG1rZGlyXHVGRjBDXG4gICAqIFx1ODlFM1x1NTFCMyB6aXAgXHU1MzYwXHU0RjREXHU2NzYxXHU3NkVFIC8gXHU2NzJDXHU1NzMwXHU1NzRGXHU2NTg3XHU0RUY2XHU1QkZDXHU4MUY0IHdyaXRlQmluYXJ5IFx1NjI5QiBFTk9URElSIFx1NzY4NFx1OTVFRVx1OTg5OFx1MzAwMlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVQYXJlbnREaXJTYWZlKGFkYXB0ZXI6IERhdGFBZGFwdGVyLCBmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGFydHMgPSBmaWxlUGF0aC5zcGxpdCgnLycpO1xuICAgIGxldCBhY2MgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgYWNjICs9IChhY2MgPyAnLycgOiAnJykgKyBwYXJ0c1tpXTtcbiAgICAgIGlmICghYWNjKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGtpbmQgPSBhd2FpdCB0aGlzLnN0YXRLaW5kKGFkYXB0ZXIsIGFjYyk7XG4gICAgICBpZiAoa2luZCA9PT0gJ2ZvbGRlcicpIGNvbnRpbnVlOyAvLyBcdTVERjJcdTY2MkZcdTc2RUVcdTVGNTVcdUZGMENcdThERjNcdThGQzdcbiAgICAgIGlmIChraW5kID09PSAnZmlsZScpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBhZGFwdGVyLnJlbW92ZShhY2MpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBcdTUyMjBcdTk2NjRcdTU5MzFcdThEMjVcdTRFNUZcdTRFMERcdTk2M0JcdTY1QURcdUZGMENcdTRFQTRcdTc1MzFcdTRFMEJcdTY1QjkgbWtkaXIgXHU2NkI0XHU5NzMyXHU3NzFGXHU1QjlFXHU5NTE5XHU4QkVGXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFkYXB0ZXIubWtkaXIoYWNjKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBcdTUzRUZcdTgwRkRcdTVERjJcdTg4QUJcdTUxNzZcdTRFRDZcdTY3NjFcdTc2RUVcdTUxNDhcdTg4NENcdTUyMUJcdTVFRkFcdUZGMENcdTVGRkRcdTc1NjVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogXHU4RkQ0XHU1NkRFXHU4REVGXHU1Rjg0XHU3QzdCXHU1NzhCXHVGRjFBJ2ZpbGUnIHwgJ2ZvbGRlcicgfCAnbm9uZSdcdUZGMDhcdTRFMERcdTVCNThcdTU3MjhcdTYyMTZcdTY1RTBcdTZDRDVcdTUyMjRcdTVCOUFcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBzdGF0S2luZChhZGFwdGVyOiBEYXRhQWRhcHRlciwgcGF0aDogc3RyaW5nKTogUHJvbWlzZTwnZmlsZScgfCAnZm9sZGVyJyB8ICdub25lJz4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChwYXRoKTtcbiAgICAgIGlmICghc3QpIHJldHVybiAnbm9uZSc7XG4gICAgICByZXR1cm4gc3QudHlwZSA9PT0gJ2ZvbGRlcicgPyAnZm9sZGVyJyA6ICdmaWxlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiAnbm9uZSc7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpc0ZvbGRlcihhZGFwdGVyOiBEYXRhQWRhcHRlciwgcGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLnN0YXRLaW5kKGFkYXB0ZXIsIHBhdGgpKSA9PT0gJ2ZvbGRlcic7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZpbGVFeGlzdHMoYWRhcHRlcjogRGF0YUFkYXB0ZXIsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgYWRhcHRlci5leGlzdHMocGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHVybCBvZiB0aGlzLmJsb2JVcmxzKSB7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfVxuICAgIHRoaXMuYmxvYlVybHMgPSBbXTtcbiAgfVxufVxuIiwgIi8vIERFRkxBVEUgaXMgYSBjb21wbGV4IGZvcm1hdDsgdG8gcmVhZCB0aGlzIGNvZGUsIHlvdSBzaG91bGQgcHJvYmFibHkgY2hlY2sgdGhlIFJGQyBmaXJzdDpcbi8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMxOTUxXG4vLyBZb3UgbWF5IGFsc28gd2lzaCB0byB0YWtlIGEgbG9vayBhdCB0aGUgZ3VpZGUgSSBtYWRlIGFib3V0IHRoaXMgcHJvZ3JhbTpcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzEwMWFycm93ei8yNTNmMzFlYjVhYmMzZDkyNzVhYjk0MzAwM2ZmZWNhZFxuLy8gU29tZSBvZiB0aGUgZm9sbG93aW5nIGNvZGUgaXMgc2ltaWxhciB0byB0aGF0IG9mIFVaSVAuanM6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vcGhvdG9wZWEvVVpJUC5qc1xuLy8gSG93ZXZlciwgdGhlIHZhc3QgbWFqb3JpdHkgb2YgdGhlIGNvZGViYXNlIGhhcyBkaXZlcmdlZCBmcm9tIFVaSVAuanMgdG8gaW5jcmVhc2UgcGVyZm9ybWFuY2UgYW5kIHJlZHVjZSBidW5kbGUgc2l6ZS5cbi8vIFNvbWV0aW1lcyAwIHdpbGwgYXBwZWFyIHdoZXJlIC0xIHdvdWxkIGJlIG1vcmUgYXBwcm9wcmlhdGUuIFRoaXMgaXMgYmVjYXVzZSB1c2luZyBhIHVpbnRcbi8vIGlzIGJldHRlciBmb3IgbWVtb3J5IGluIG1vc3QgZW5naW5lcyAoSSAqdGhpbmsqKS5cbnZhciBjaDIgPSB7fTtcbnZhciB3ayA9IChmdW5jdGlvbiAoYywgaWQsIG1zZywgdHJhbnNmZXIsIGNiKSB7XG4gICAgdmFyIHcgPSBuZXcgV29ya2VyKGNoMltpZF0gfHwgKGNoMltpZF0gPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtcbiAgICAgICAgYyArICc7YWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsZnVuY3Rpb24oZSl7ZT1lLmVycm9yO3Bvc3RNZXNzYWdlKHskZSQ6W2UubWVzc2FnZSxlLmNvZGUsZS5zdGFja119KX0pJ1xuICAgIF0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSkpKSk7XG4gICAgdy5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgZCA9IGUuZGF0YSwgZWQgPSBkLiRlJDtcbiAgICAgICAgaWYgKGVkKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKGVkWzBdKTtcbiAgICAgICAgICAgIGVyclsnY29kZSddID0gZWRbMV07XG4gICAgICAgICAgICBlcnIuc3RhY2sgPSBlZFsyXTtcbiAgICAgICAgICAgIGNiKGVyciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2IobnVsbCwgZCk7XG4gICAgfTtcbiAgICB3LnBvc3RNZXNzYWdlKG1zZywgdHJhbnNmZXIpO1xuICAgIHJldHVybiB3O1xufSk7XG5cbi8vIGFsaWFzZXMgZm9yIHNob3J0ZXIgY29tcHJlc3NlZCBjb2RlIChtb3N0IG1pbmlmZXJzIGRvbid0IGRvIHRoaXMpXG52YXIgdTggPSBVaW50OEFycmF5LCB1MTYgPSBVaW50MTZBcnJheSwgaTMyID0gSW50MzJBcnJheTtcbi8vIGZpeGVkIGxlbmd0aCBleHRyYSBiaXRzXG52YXIgZmxlYiA9IG5ldyB1OChbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMSwgMiwgMiwgMiwgMiwgMywgMywgMywgMywgNCwgNCwgNCwgNCwgNSwgNSwgNSwgNSwgMCwgLyogdW51c2VkICovIDAsIDAsIC8qIGltcG9zc2libGUgKi8gMF0pO1xuLy8gZml4ZWQgZGlzdGFuY2UgZXh0cmEgYml0c1xudmFyIGZkZWIgPSBuZXcgdTgoWzAsIDAsIDAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDcsIDgsIDgsIDksIDksIDEwLCAxMCwgMTEsIDExLCAxMiwgMTIsIDEzLCAxMywgLyogdW51c2VkICovIDAsIDBdKTtcbi8vIGNvZGUgbGVuZ3RoIGluZGV4IG1hcFxudmFyIGNsaW0gPSBuZXcgdTgoWzE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsIDEwLCA1LCAxMSwgNCwgMTIsIDMsIDEzLCAyLCAxNCwgMSwgMTVdKTtcbi8vIGdldCBiYXNlLCByZXZlcnNlIGluZGV4IG1hcCBmcm9tIGV4dHJhIGJpdHNcbnZhciBmcmViID0gZnVuY3Rpb24gKGViLCBzdGFydCkge1xuICAgIHZhciBiID0gbmV3IHUxNigzMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMTsgKytpKSB7XG4gICAgICAgIGJbaV0gPSBzdGFydCArPSAxIDw8IGViW2kgLSAxXTtcbiAgICB9XG4gICAgLy8gbnVtYmVycyBoZXJlIGFyZSBhdCBtYXggMTggYml0c1xuICAgIHZhciByID0gbmV3IGkzMihiWzMwXSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAzMDsgKytpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBiW2ldOyBqIDwgYltpICsgMV07ICsraikge1xuICAgICAgICAgICAgcltqXSA9ICgoaiAtIGJbaV0pIDw8IDUpIHwgaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBiOiBiLCByOiByIH07XG59O1xudmFyIF9hID0gZnJlYihmbGViLCAyKSwgZmwgPSBfYS5iLCByZXZmbCA9IF9hLnI7XG4vLyB3ZSBjYW4gaWdub3JlIHRoZSBmYWN0IHRoYXQgdGhlIG90aGVyIG51bWJlcnMgYXJlIHdyb25nOyB0aGV5IG5ldmVyIGhhcHBlbiBhbnl3YXlcbmZsWzI4XSA9IDI1OCwgcmV2ZmxbMjU4XSA9IDI4O1xudmFyIF9iID0gZnJlYihmZGViLCAwKSwgZmQgPSBfYi5iLCByZXZmZCA9IF9iLnI7XG4vLyBtYXAgb2YgdmFsdWUgdG8gcmV2ZXJzZSAoYXNzdW1pbmcgMTYgYml0cylcbnZhciByZXYgPSBuZXcgdTE2KDMyNzY4KTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMzI3Njg7ICsraSkge1xuICAgIC8vIHJldmVyc2UgdGFibGUgYWxnb3JpdGhtIGZyb20gU09cbiAgICB2YXIgeCA9ICgoaSAmIDB4QUFBQSkgPj4gMSkgfCAoKGkgJiAweDU1NTUpIDw8IDEpO1xuICAgIHggPSAoKHggJiAweENDQ0MpID4+IDIpIHwgKCh4ICYgMHgzMzMzKSA8PCAyKTtcbiAgICB4ID0gKCh4ICYgMHhGMEYwKSA+PiA0KSB8ICgoeCAmIDB4MEYwRikgPDwgNCk7XG4gICAgcmV2W2ldID0gKCgoeCAmIDB4RkYwMCkgPj4gOCkgfCAoKHggJiAweDAwRkYpIDw8IDgpKSA+PiAxO1xufVxuLy8gY3JlYXRlIGh1ZmZtYW4gdHJlZSBmcm9tIHU4IFwibWFwXCI6IGluZGV4IC0+IGNvZGUgbGVuZ3RoIGZvciBjb2RlIGluZGV4XG4vLyBtYiAobWF4IGJpdHMpIG11c3QgYmUgYXQgbW9zdCAxNVxuLy8gVE9ETzogb3B0aW1pemUvc3BsaXQgdXA/XG52YXIgaE1hcCA9IChmdW5jdGlvbiAoY2QsIG1iLCByKSB7XG4gICAgdmFyIHMgPSBjZC5sZW5ndGg7XG4gICAgLy8gaW5kZXhcbiAgICB2YXIgaSA9IDA7XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+ICMgb2YgY29kZXMgd2l0aCBiaXQgbGVuZ3RoID0gaW5kZXhcbiAgICB2YXIgbCA9IG5ldyB1MTYobWIpO1xuICAgIC8vIGxlbmd0aCBvZiBjZCBtdXN0IGJlIDI4OCAodG90YWwgIyBvZiBjb2RlcylcbiAgICBmb3IgKDsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAoY2RbaV0pXG4gICAgICAgICAgICArK2xbY2RbaV0gLSAxXTtcbiAgICB9XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+IG1pbmltdW0gY29kZSBmb3IgYml0IGxlbmd0aCA9IGluZGV4XG4gICAgdmFyIGxlID0gbmV3IHUxNihtYik7XG4gICAgZm9yIChpID0gMTsgaSA8IG1iOyArK2kpIHtcbiAgICAgICAgbGVbaV0gPSAobGVbaSAtIDFdICsgbFtpIC0gMV0pIDw8IDE7XG4gICAgfVxuICAgIHZhciBjbztcbiAgICBpZiAocikge1xuICAgICAgICAvLyB1MTYgXCJtYXBcIjogaW5kZXggLT4gbnVtYmVyIG9mIGFjdHVhbCBiaXRzLCBzeW1ib2wgZm9yIGNvZGVcbiAgICAgICAgY28gPSBuZXcgdTE2KDEgPDwgbWIpO1xuICAgICAgICAvLyBiaXRzIHRvIHJlbW92ZSBmb3IgcmV2ZXJzZXJcbiAgICAgICAgdmFyIHJ2YiA9IDE1IC0gbWI7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSAwIGxlbmd0aHNcbiAgICAgICAgICAgIGlmIChjZFtpXSkge1xuICAgICAgICAgICAgICAgIC8vIG51bSBlbmNvZGluZyBib3RoIHN5bWJvbCBhbmQgYml0cyByZWFkXG4gICAgICAgICAgICAgICAgdmFyIHN2ID0gKGkgPDwgNCkgfCBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBmcmVlIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgcl8xID0gbWIgLSBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBzdGFydCB2YWx1ZVxuICAgICAgICAgICAgICAgIHZhciB2ID0gbGVbY2RbaV0gLSAxXSsrIDw8IHJfMTtcbiAgICAgICAgICAgICAgICAvLyBtIGlzIGVuZCB2YWx1ZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIG0gPSB2IHwgKCgxIDw8IHJfMSkgLSAxKTsgdiA8PSBtOyArK3YpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlcnkgMTYgYml0IHZhbHVlIHN0YXJ0aW5nIHdpdGggdGhlIGNvZGUgeWllbGRzIHRoZSBzYW1lIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICBjb1tyZXZbdl0gPj4gcnZiXSA9IHN2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY28gPSBuZXcgdTE2KHMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICBpZiAoY2RbaV0pIHtcbiAgICAgICAgICAgICAgICBjb1tpXSA9IHJldltsZVtjZFtpXSAtIDFdKytdID4+ICgxNSAtIGNkW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY287XG59KTtcbi8vIGZpeGVkIGxlbmd0aCB0cmVlXG52YXIgZmx0ID0gbmV3IHU4KDI4OCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IDE0NDsgKytpKVxuICAgIGZsdFtpXSA9IDg7XG5mb3IgKHZhciBpID0gMTQ0OyBpIDwgMjU2OyArK2kpXG4gICAgZmx0W2ldID0gOTtcbmZvciAodmFyIGkgPSAyNTY7IGkgPCAyODA7ICsraSlcbiAgICBmbHRbaV0gPSA3O1xuZm9yICh2YXIgaSA9IDI4MDsgaSA8IDI4ODsgKytpKVxuICAgIGZsdFtpXSA9IDg7XG4vLyBmaXhlZCBkaXN0YW5jZSB0cmVlXG52YXIgZmR0ID0gbmV3IHU4KDMyKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMzI7ICsraSlcbiAgICBmZHRbaV0gPSA1O1xuLy8gZml4ZWQgbGVuZ3RoIG1hcFxudmFyIGZsbSA9IC8qI19fUFVSRV9fKi8gaE1hcChmbHQsIDksIDApLCBmbHJtID0gLyojX19QVVJFX18qLyBoTWFwKGZsdCwgOSwgMSk7XG4vLyBmaXhlZCBkaXN0YW5jZSBtYXBcbnZhciBmZG0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmR0LCA1LCAwKSwgZmRybSA9IC8qI19fUFVSRV9fKi8gaE1hcChmZHQsIDUsIDEpO1xuLy8gZmluZCBtYXggb2YgYXJyYXlcbnZhciBtYXggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBtID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGFbaV0gPiBtKVxuICAgICAgICAgICAgbSA9IGFbaV07XG4gICAgfVxuICAgIHJldHVybiBtO1xufTtcbi8vIHJlYWQgZCwgc3RhcnRpbmcgYXQgYml0IHAgYW5kIG1hc2sgd2l0aCBtXG52YXIgYml0cyA9IGZ1bmN0aW9uIChkLCBwLCBtKSB7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICByZXR1cm4gKChkW29dIHwgKGRbbyArIDFdIDw8IDgpKSA+PiAocCAmIDcpKSAmIG07XG59O1xuLy8gcmVhZCBkLCBzdGFydGluZyBhdCBiaXQgcCBjb250aW51aW5nIGZvciBhdCBsZWFzdCAxNiBiaXRzXG52YXIgYml0czE2ID0gZnVuY3Rpb24gKGQsIHApIHtcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIHJldHVybiAoKGRbb10gfCAoZFtvICsgMV0gPDwgOCkgfCAoZFtvICsgMl0gPDwgMTYpKSA+PiAocCAmIDcpKTtcbn07XG4vLyBnZXQgZW5kIG9mIGJ5dGVcbnZhciBzaGZ0ID0gZnVuY3Rpb24gKHApIHsgcmV0dXJuICgocCArIDcpIC8gOCkgfCAwOyB9O1xuLy8gdHlwZWQgYXJyYXkgc2xpY2UgLSBhbGxvd3MgZ2FyYmFnZSBjb2xsZWN0b3IgdG8gZnJlZSBvcmlnaW5hbCByZWZlcmVuY2UsXG4vLyB3aGlsZSBiZWluZyBtb3JlIGNvbXBhdGlibGUgdGhhbiAuc2xpY2VcbnZhciBzbGMgPSBmdW5jdGlvbiAodiwgcywgZSkge1xuICAgIGlmIChzID09IG51bGwgfHwgcyA8IDApXG4gICAgICAgIHMgPSAwO1xuICAgIGlmIChlID09IG51bGwgfHwgZSA+IHYubGVuZ3RoKVxuICAgICAgICBlID0gdi5sZW5ndGg7XG4gICAgLy8gY2FuJ3QgdXNlIC5jb25zdHJ1Y3RvciBpbiBjYXNlIHVzZXItc3VwcGxpZWRcbiAgICByZXR1cm4gbmV3IHU4KHYuc3ViYXJyYXkocywgZSkpO1xufTtcbi8qKlxuICogQ29kZXMgZm9yIGVycm9ycyBnZW5lcmF0ZWQgd2l0aGluIHRoaXMgbGlicmFyeVxuICovXG5leHBvcnQgdmFyIEZsYXRlRXJyb3JDb2RlID0ge1xuICAgIFVuZXhwZWN0ZWRFT0Y6IDAsXG4gICAgSW52YWxpZEJsb2NrVHlwZTogMSxcbiAgICBJbnZhbGlkTGVuZ3RoTGl0ZXJhbDogMixcbiAgICBJbnZhbGlkRGlzdGFuY2U6IDMsXG4gICAgU3RyZWFtRmluaXNoZWQ6IDQsXG4gICAgTm9TdHJlYW1IYW5kbGVyOiA1LFxuICAgIEludmFsaWRIZWFkZXI6IDYsXG4gICAgTm9DYWxsYmFjazogNyxcbiAgICBJbnZhbGlkVVRGODogOCxcbiAgICBFeHRyYUZpZWxkVG9vTG9uZzogOSxcbiAgICBJbnZhbGlkRGF0ZTogMTAsXG4gICAgRmlsZW5hbWVUb29Mb25nOiAxMSxcbiAgICBTdHJlYW1GaW5pc2hpbmc6IDEyLFxuICAgIEludmFsaWRaaXBEYXRhOiAxMyxcbiAgICBVbmtub3duQ29tcHJlc3Npb25NZXRob2Q6IDE0XG59O1xuLy8gZXJyb3IgY29kZXNcbnZhciBlYyA9IFtcbiAgICAndW5leHBlY3RlZCBFT0YnLFxuICAgICdpbnZhbGlkIGJsb2NrIHR5cGUnLFxuICAgICdpbnZhbGlkIGxlbmd0aC9saXRlcmFsJyxcbiAgICAnaW52YWxpZCBkaXN0YW5jZScsXG4gICAgJ3N0cmVhbSBmaW5pc2hlZCcsXG4gICAgJ25vIHN0cmVhbSBoYW5kbGVyJyxcbiAgICAsIC8vIGRldGVybWluZWQgYnkgY29tcHJlc3Npb24gZnVuY3Rpb25cbiAgICAnbm8gY2FsbGJhY2snLFxuICAgICdpbnZhbGlkIFVURi04IGRhdGEnLFxuICAgICdleHRyYSBmaWVsZCB0b28gbG9uZycsXG4gICAgJ2RhdGUgbm90IGluIHJhbmdlIDE5ODAtMjA5OScsXG4gICAgJ2ZpbGVuYW1lIHRvbyBsb25nJyxcbiAgICAnc3RyZWFtIGZpbmlzaGluZycsXG4gICAgJ2ludmFsaWQgemlwIGRhdGEnXG4gICAgLy8gZGV0ZXJtaW5lZCBieSB1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZFxuXTtcbjtcbnZhciBlcnIgPSBmdW5jdGlvbiAoaW5kLCBtc2csIG50KSB7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IobXNnIHx8IGVjW2luZF0pO1xuICAgIGUuY29kZSA9IGluZDtcbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpXG4gICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGUsIGVycik7XG4gICAgaWYgKCFudClcbiAgICAgICAgdGhyb3cgZTtcbiAgICByZXR1cm4gZTtcbn07XG4vLyBleHBhbmRzIHJhdyBERUZMQVRFIGRhdGFcbnZhciBpbmZsdCA9IGZ1bmN0aW9uIChkYXQsIHN0LCBidWYsIGRpY3QpIHtcbiAgICAvLyBzb3VyY2UgbGVuZ3RoICAgICAgIGRpY3QgbGVuZ3RoXG4gICAgdmFyIHNsID0gZGF0Lmxlbmd0aCwgZGwgPSBkaWN0ID8gZGljdC5sZW5ndGggOiAwO1xuICAgIGlmICghc2wgfHwgc3QuZiAmJiAhc3QubClcbiAgICAgICAgcmV0dXJuIGJ1ZiB8fCBuZXcgdTgoMCk7XG4gICAgdmFyIG5vQnVmID0gIWJ1ZjtcbiAgICAvLyBoYXZlIHRvIGVzdGltYXRlIHNpemVcbiAgICB2YXIgcmVzaXplID0gbm9CdWYgfHwgc3QuaSAhPSAyO1xuICAgIC8vIG5vIHN0YXRlXG4gICAgdmFyIG5vU3QgPSBzdC5pO1xuICAgIC8vIEFzc3VtZXMgcm91Z2hseSAzMyUgY29tcHJlc3Npb24gcmF0aW8gYXZlcmFnZVxuICAgIGlmIChub0J1ZilcbiAgICAgICAgYnVmID0gbmV3IHU4KHNsICogMyk7XG4gICAgLy8gZW5zdXJlIGJ1ZmZlciBjYW4gZml0IGF0IGxlYXN0IGwgZWxlbWVudHNcbiAgICB2YXIgY2J1ZiA9IGZ1bmN0aW9uIChsKSB7XG4gICAgICAgIHZhciBibCA9IGJ1Zi5sZW5ndGg7XG4gICAgICAgIC8vIG5lZWQgdG8gaW5jcmVhc2Ugc2l6ZSB0byBmaXRcbiAgICAgICAgaWYgKGwgPiBibCkge1xuICAgICAgICAgICAgLy8gRG91YmxlIG9yIHNldCB0byBuZWNlc3NhcnksIHdoaWNoZXZlciBpcyBncmVhdGVyXG4gICAgICAgICAgICB2YXIgbmJ1ZiA9IG5ldyB1OChNYXRoLm1heChibCAqIDIsIGwpKTtcbiAgICAgICAgICAgIG5idWYuc2V0KGJ1Zik7XG4gICAgICAgICAgICBidWYgPSBuYnVmO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyAgbGFzdCBjaHVuayAgICAgICAgIGJpdHBvcyAgICAgICAgICAgYnl0ZXNcbiAgICB2YXIgZmluYWwgPSBzdC5mIHx8IDAsIHBvcyA9IHN0LnAgfHwgMCwgYnQgPSBzdC5iIHx8IDAsIGxtID0gc3QubCwgZG0gPSBzdC5kLCBsYnQgPSBzdC5tLCBkYnQgPSBzdC5uO1xuICAgIC8vIHRvdGFsIGJpdHNcbiAgICB2YXIgdGJ0cyA9IHNsICogODtcbiAgICBkbyB7XG4gICAgICAgIGlmICghbG0pIHtcbiAgICAgICAgICAgIC8vIEJGSU5BTCAtIHRoaXMgaXMgb25seSAxIHdoZW4gbGFzdCBjaHVuayBpcyBuZXh0XG4gICAgICAgICAgICBmaW5hbCA9IGJpdHMoZGF0LCBwb3MsIDEpO1xuICAgICAgICAgICAgLy8gdHlwZTogMCA9IG5vIGNvbXByZXNzaW9uLCAxID0gZml4ZWQgaHVmZm1hbiwgMiA9IGR5bmFtaWMgaHVmZm1hblxuICAgICAgICAgICAgdmFyIHR5cGUgPSBiaXRzKGRhdCwgcG9zICsgMSwgMyk7XG4gICAgICAgICAgICBwb3MgKz0gMztcbiAgICAgICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIGdvIHRvIGVuZCBvZiBieXRlIGJvdW5kYXJ5XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBzaGZ0KHBvcykgKyA0LCBsID0gZGF0W3MgLSA0XSB8IChkYXRbcyAtIDNdIDw8IDgpLCB0ID0gcyArIGw7XG4gICAgICAgICAgICAgICAgaWYgKHQgPiBzbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9TdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycigwKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSBzaXplXG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIGwpO1xuICAgICAgICAgICAgICAgIC8vIENvcHkgb3ZlciB1bmNvbXByZXNzZWQgZGF0YVxuICAgICAgICAgICAgICAgIGJ1Zi5zZXQoZGF0LnN1YmFycmF5KHMsIHQpLCBidCk7XG4gICAgICAgICAgICAgICAgLy8gR2V0IG5ldyBiaXRwb3MsIHVwZGF0ZSBieXRlIGNvdW50XG4gICAgICAgICAgICAgICAgc3QuYiA9IGJ0ICs9IGwsIHN0LnAgPSBwb3MgPSB0ICogOCwgc3QuZiA9IGZpbmFsO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PSAxKVxuICAgICAgICAgICAgICAgIGxtID0gZmxybSwgZG0gPSBmZHJtLCBsYnQgPSA5LCBkYnQgPSA1O1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PSAyKSB7XG4gICAgICAgICAgICAgICAgLy8gIGxpdGVyYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3Roc1xuICAgICAgICAgICAgICAgIHZhciBoTGl0ID0gYml0cyhkYXQsIHBvcywgMzEpICsgMjU3LCBoY0xlbiA9IGJpdHMoZGF0LCBwb3MgKyAxMCwgMTUpICsgNDtcbiAgICAgICAgICAgICAgICB2YXIgdGwgPSBoTGl0ICsgYml0cyhkYXQsIHBvcyArIDUsIDMxKSArIDE7XG4gICAgICAgICAgICAgICAgcG9zICs9IDE0O1xuICAgICAgICAgICAgICAgIC8vIGxlbmd0aCtkaXN0YW5jZSB0cmVlXG4gICAgICAgICAgICAgICAgdmFyIGxkdCA9IG5ldyB1OCh0bCk7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGggdHJlZVxuICAgICAgICAgICAgICAgIHZhciBjbHQgPSBuZXcgdTgoMTkpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGNMZW47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgaW5kZXggbWFwIHRvIGdldCByZWFsIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgY2x0W2NsaW1baV1dID0gYml0cyhkYXQsIHBvcyArIGkgKiAzLCA3KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcG9zICs9IGhjTGVuICogMztcbiAgICAgICAgICAgICAgICAvLyBjb2RlIGxlbmd0aHMgYml0c1xuICAgICAgICAgICAgICAgIHZhciBjbGIgPSBtYXgoY2x0KSwgY2xibXNrID0gKDEgPDwgY2xiKSAtIDE7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGhzIG1hcFxuICAgICAgICAgICAgICAgIHZhciBjbG0gPSBoTWFwKGNsdCwgY2xiLCAxKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRsOykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNsbVtiaXRzKGRhdCwgcG9zLCBjbGJtc2spXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYml0cyByZWFkXG4gICAgICAgICAgICAgICAgICAgIHBvcyArPSByICYgMTU7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN5bWJvbFxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHIgPj4gNDtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGggdG8gY29weVxuICAgICAgICAgICAgICAgICAgICBpZiAocyA8IDE2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZHRbaSsrXSA9IHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgY29weSAgIGNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IDAsIG4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMgPT0gMTYpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDMgKyBiaXRzKGRhdCwgcG9zLCAzKSwgcG9zICs9IDIsIGMgPSBsZHRbaSAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocyA9PSAxNylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gMyArIGJpdHMoZGF0LCBwb3MsIDcpLCBwb3MgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMgPT0gMTgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDExICsgYml0cyhkYXQsIHBvcywgMTI3KSwgcG9zICs9IDc7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAobi0tKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxkdFtpKytdID0gYztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICBsZW5ndGggdHJlZSAgICAgICAgICAgICAgICAgZGlzdGFuY2UgdHJlZVxuICAgICAgICAgICAgICAgIHZhciBsdCA9IGxkdC5zdWJhcnJheSgwLCBoTGl0KSwgZHQgPSBsZHQuc3ViYXJyYXkoaExpdCk7XG4gICAgICAgICAgICAgICAgLy8gbWF4IGxlbmd0aCBiaXRzXG4gICAgICAgICAgICAgICAgbGJ0ID0gbWF4KGx0KTtcbiAgICAgICAgICAgICAgICAvLyBtYXggZGlzdCBiaXRzXG4gICAgICAgICAgICAgICAgZGJ0ID0gbWF4KGR0KTtcbiAgICAgICAgICAgICAgICBsbSA9IGhNYXAobHQsIGxidCwgMSk7XG4gICAgICAgICAgICAgICAgZG0gPSBoTWFwKGR0LCBkYnQsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVycigxKTtcbiAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgIGVycigwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGJ1ZmZlciBjYW4gaG9sZCB0aGlzICsgdGhlIGxhcmdlc3QgcG9zc2libGUgYWRkaXRpb25cbiAgICAgICAgLy8gTWF4aW11bSBjaHVuayBzaXplIChwcmFjdGljYWxseSwgdGhlb3JldGljYWxseSBpbmZpbml0ZSkgaXMgMl4xN1xuICAgICAgICBpZiAocmVzaXplKVxuICAgICAgICAgICAgY2J1ZihidCArIDEzMTA3Mik7XG4gICAgICAgIHZhciBsbXMgPSAoMSA8PCBsYnQpIC0gMSwgZG1zID0gKDEgPDwgZGJ0KSAtIDE7XG4gICAgICAgIHZhciBscG9zID0gcG9zO1xuICAgICAgICBmb3IgKDs7IGxwb3MgPSBwb3MpIHtcbiAgICAgICAgICAgIC8vIGJpdHMgcmVhZCwgY29kZVxuICAgICAgICAgICAgdmFyIGMgPSBsbVtiaXRzMTYoZGF0LCBwb3MpICYgbG1zXSwgc3ltID0gYyA+PiA0O1xuICAgICAgICAgICAgcG9zICs9IGMgJiAxNTtcbiAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgIGVycigwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYylcbiAgICAgICAgICAgICAgICBlcnIoMik7XG4gICAgICAgICAgICBpZiAoc3ltIDwgMjU2KVxuICAgICAgICAgICAgICAgIGJ1ZltidCsrXSA9IHN5bTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHN5bSA9PSAyNTYpIHtcbiAgICAgICAgICAgICAgICBscG9zID0gcG9zLCBsbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgYWRkID0gc3ltIC0gMjU0O1xuICAgICAgICAgICAgICAgIC8vIG5vIGV4dHJhIGJpdHMgbmVlZGVkIGlmIGxlc3NcbiAgICAgICAgICAgICAgICBpZiAoc3ltID4gMjY0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluZGV4XG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gc3ltIC0gMjU3LCBiID0gZmxlYltpXTtcbiAgICAgICAgICAgICAgICAgICAgYWRkID0gYml0cyhkYXQsIHBvcywgKDEgPDwgYikgLSAxKSArIGZsW2ldO1xuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gYjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZGlzdFxuICAgICAgICAgICAgICAgIHZhciBkID0gZG1bYml0czE2KGRhdCwgcG9zKSAmIGRtc10sIGRzeW0gPSBkID4+IDQ7XG4gICAgICAgICAgICAgICAgaWYgKCFkKVxuICAgICAgICAgICAgICAgICAgICBlcnIoMyk7XG4gICAgICAgICAgICAgICAgcG9zICs9IGQgJiAxNTtcbiAgICAgICAgICAgICAgICB2YXIgZHQgPSBmZFtkc3ltXTtcbiAgICAgICAgICAgICAgICBpZiAoZHN5bSA+IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGIgPSBmZGViW2RzeW1dO1xuICAgICAgICAgICAgICAgICAgICBkdCArPSBiaXRzMTYoZGF0LCBwb3MpICYgKDEgPDwgYikgLSAxLCBwb3MgKz0gYjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBvcyA+IHRidHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzaXplKVxuICAgICAgICAgICAgICAgICAgICBjYnVmKGJ0ICsgMTMxMDcyKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kID0gYnQgKyBhZGQ7XG4gICAgICAgICAgICAgICAgaWYgKGJ0IDwgZHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNoaWZ0ID0gZGwgLSBkdCwgZGVuZCA9IE1hdGgubWluKGR0LCBlbmQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hpZnQgKyBidCA8IDApXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyBidCA8IGRlbmQ7ICsrYnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbYnRdID0gZGljdFtzaGlmdCArIGJ0XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICg7IGJ0IDwgZW5kOyArK2J0KVxuICAgICAgICAgICAgICAgICAgICBidWZbYnRdID0gYnVmW2J0IC0gZHRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0LmwgPSBsbSwgc3QucCA9IGxwb3MsIHN0LmIgPSBidCwgc3QuZiA9IGZpbmFsO1xuICAgICAgICBpZiAobG0pXG4gICAgICAgICAgICBmaW5hbCA9IDEsIHN0Lm0gPSBsYnQsIHN0LmQgPSBkbSwgc3QubiA9IGRidDtcbiAgICB9IHdoaWxlICghZmluYWwpO1xuICAgIC8vIGRvbid0IHJlYWxsb2NhdGUgZm9yIHN0cmVhbXMgb3IgdXNlciBidWZmZXJzXG4gICAgcmV0dXJuIGJ0ICE9IGJ1Zi5sZW5ndGggJiYgbm9CdWYgPyBzbGMoYnVmLCAwLCBidCkgOiBidWYuc3ViYXJyYXkoMCwgYnQpO1xufTtcbi8vIHN0YXJ0aW5nIGF0IHAsIHdyaXRlIHRoZSBtaW5pbXVtIG51bWJlciBvZiBiaXRzIHRoYXQgY2FuIGhvbGQgdiB0byBkXG52YXIgd2JpdHMgPSBmdW5jdGlvbiAoZCwgcCwgdikge1xuICAgIHYgPDw9IHAgJiA3O1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgZFtvXSB8PSB2O1xuICAgIGRbbyArIDFdIHw9IHYgPj4gODtcbn07XG4vLyBzdGFydGluZyBhdCBwLCB3cml0ZSB0aGUgbWluaW11bSBudW1iZXIgb2YgYml0cyAoPjgpIHRoYXQgY2FuIGhvbGQgdiB0byBkXG52YXIgd2JpdHMxNiA9IGZ1bmN0aW9uIChkLCBwLCB2KSB7XG4gICAgdiA8PD0gcCAmIDc7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICBkW29dIHw9IHY7XG4gICAgZFtvICsgMV0gfD0gdiA+PiA4O1xuICAgIGRbbyArIDJdIHw9IHYgPj4gMTY7XG59O1xuLy8gY3JlYXRlcyBjb2RlIGxlbmd0aHMgZnJvbSBhIGZyZXF1ZW5jeSB0YWJsZVxudmFyIGhUcmVlID0gZnVuY3Rpb24gKGQsIG1iKSB7XG4gICAgLy8gTmVlZCBleHRyYSBpbmZvIHRvIG1ha2UgYSB0cmVlXG4gICAgdmFyIHQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGRbaV0pXG4gICAgICAgICAgICB0LnB1c2goeyBzOiBpLCBmOiBkW2ldIH0pO1xuICAgIH1cbiAgICB2YXIgcyA9IHQubGVuZ3RoO1xuICAgIHZhciB0MiA9IHQuc2xpY2UoKTtcbiAgICBpZiAoIXMpXG4gICAgICAgIHJldHVybiB7IHQ6IGV0LCBsOiAwIH07XG4gICAgaWYgKHMgPT0gMSkge1xuICAgICAgICB2YXIgdiA9IG5ldyB1OCh0WzBdLnMgKyAxKTtcbiAgICAgICAgdlt0WzBdLnNdID0gMTtcbiAgICAgICAgcmV0dXJuIHsgdDogdiwgbDogMSB9O1xuICAgIH1cbiAgICB0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEuZiAtIGIuZjsgfSk7XG4gICAgLy8gYWZ0ZXIgaTIgcmVhY2hlcyBsYXN0IGluZCwgd2lsbCBiZSBzdG9wcGVkXG4gICAgLy8gZnJlcSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBsYXJnZXN0IHBvc3NpYmxlIG51bWJlciBvZiBzeW1ib2xzXG4gICAgdC5wdXNoKHsgczogLTEsIGY6IDI1MDAxIH0pO1xuICAgIHZhciBsID0gdFswXSwgciA9IHRbMV0sIGkwID0gMCwgaTEgPSAxLCBpMiA9IDI7XG4gICAgdFswXSA9IHsgczogLTEsIGY6IGwuZiArIHIuZiwgbDogbCwgcjogciB9O1xuICAgIC8vIGVmZmljaWVudCBhbGdvcml0aG0gZnJvbSBVWklQLmpzXG4gICAgLy8gaTAgaXMgbG9va2JlaGluZCwgaTIgaXMgbG9va2FoZWFkIC0gYWZ0ZXIgcHJvY2Vzc2luZyB0d28gbG93LWZyZXFcbiAgICAvLyBzeW1ib2xzIHRoYXQgY29tYmluZWQgaGF2ZSBoaWdoIGZyZXEsIHdpbGwgc3RhcnQgcHJvY2Vzc2luZyBpMiAoaGlnaC1mcmVxLFxuICAgIC8vIG5vbi1jb21wb3NpdGUpIHN5bWJvbHMgaW5zdGVhZFxuICAgIC8vIHNlZSBodHRwczovL3JlZGRpdC5jb20vci9waG90b3BlYS9jb21tZW50cy9pa2VraHQvdXppcGpzX3F1ZXN0aW9ucy9cbiAgICB3aGlsZSAoaTEgIT0gcyAtIDEpIHtcbiAgICAgICAgbCA9IHRbdFtpMF0uZiA8IHRbaTJdLmYgPyBpMCsrIDogaTIrK107XG4gICAgICAgIHIgPSB0W2kwICE9IGkxICYmIHRbaTBdLmYgPCB0W2kyXS5mID8gaTArKyA6IGkyKytdO1xuICAgICAgICB0W2kxKytdID0geyBzOiAtMSwgZjogbC5mICsgci5mLCBsOiBsLCByOiByIH07XG4gICAgfVxuICAgIHZhciBtYXhTeW0gPSB0MlswXS5zO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgczsgKytpKSB7XG4gICAgICAgIGlmICh0MltpXS5zID4gbWF4U3ltKVxuICAgICAgICAgICAgbWF4U3ltID0gdDJbaV0ucztcbiAgICB9XG4gICAgLy8gY29kZSBsZW5ndGhzXG4gICAgdmFyIHRyID0gbmV3IHUxNihtYXhTeW0gKyAxKTtcbiAgICAvLyBtYXggYml0cyBpbiB0cmVlXG4gICAgdmFyIG1idCA9IGxuKHRbaTEgLSAxXSwgdHIsIDApO1xuICAgIGlmIChtYnQgPiBtYikge1xuICAgICAgICAvLyBtb3JlIGFsZ29yaXRobXMgZnJvbSBVWklQLmpzXG4gICAgICAgIC8vIFRPRE86IGZpbmQgb3V0IGhvdyB0aGlzIGNvZGUgd29ya3MgKGRlYnQpXG4gICAgICAgIC8vICBpbmQgICAgZGVidFxuICAgICAgICB2YXIgaSA9IDAsIGR0ID0gMDtcbiAgICAgICAgLy8gICAgbGVmdCAgICAgICAgICAgIGNvc3RcbiAgICAgICAgdmFyIGxmdCA9IG1idCAtIG1iLCBjc3QgPSAxIDw8IGxmdDtcbiAgICAgICAgdDIuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gdHJbYi5zXSAtIHRyW2Euc10gfHwgYS5mIC0gYi5mOyB9KTtcbiAgICAgICAgZm9yICg7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBpMl8xID0gdDJbaV0ucztcbiAgICAgICAgICAgIGlmICh0cltpMl8xXSA+IG1iKSB7XG4gICAgICAgICAgICAgICAgZHQgKz0gY3N0IC0gKDEgPDwgKG1idCAtIHRyW2kyXzFdKSk7XG4gICAgICAgICAgICAgICAgdHJbaTJfMV0gPSBtYjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkdCA+Pj0gbGZ0O1xuICAgICAgICB3aGlsZSAoZHQgPiAwKSB7XG4gICAgICAgICAgICB2YXIgaTJfMiA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfMl0gPCBtYilcbiAgICAgICAgICAgICAgICBkdCAtPSAxIDw8IChtYiAtIHRyW2kyXzJdKysgLSAxKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGkgPj0gMCAmJiBkdDsgLS1pKSB7XG4gICAgICAgICAgICB2YXIgaTJfMyA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfM10gPT0gbWIpIHtcbiAgICAgICAgICAgICAgICAtLXRyW2kyXzNdO1xuICAgICAgICAgICAgICAgICsrZHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbWJ0ID0gbWI7XG4gICAgfVxuICAgIHJldHVybiB7IHQ6IG5ldyB1OCh0ciksIGw6IG1idCB9O1xufTtcbi8vIGdldCB0aGUgbWF4IGxlbmd0aCBhbmQgYXNzaWduIGxlbmd0aCBjb2Rlc1xudmFyIGxuID0gZnVuY3Rpb24gKG4sIGwsIGQpIHtcbiAgICByZXR1cm4gbi5zID09IC0xXG4gICAgICAgID8gTWF0aC5tYXgobG4obi5sLCBsLCBkICsgMSksIGxuKG4uciwgbCwgZCArIDEpKVxuICAgICAgICA6IChsW24uc10gPSBkKTtcbn07XG4vLyBsZW5ndGggY29kZXMgZ2VuZXJhdGlvblxudmFyIGxjID0gZnVuY3Rpb24gKGMpIHtcbiAgICB2YXIgcyA9IGMubGVuZ3RoO1xuICAgIC8vIE5vdGUgdGhhdCB0aGUgc2VtaWNvbG9uIHdhcyBpbnRlbnRpb25hbFxuICAgIHdoaWxlIChzICYmICFjWy0tc10pXG4gICAgICAgIDtcbiAgICB2YXIgY2wgPSBuZXcgdTE2KCsrcyk7XG4gICAgLy8gIGluZCAgICAgIG51bSAgICAgICAgIHN0cmVha1xuICAgIHZhciBjbGkgPSAwLCBjbG4gPSBjWzBdLCBjbHMgPSAxO1xuICAgIHZhciB3ID0gZnVuY3Rpb24gKHYpIHsgY2xbY2xpKytdID0gdjsgfTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBzOyArK2kpIHtcbiAgICAgICAgaWYgKGNbaV0gPT0gY2xuICYmIGkgIT0gcylcbiAgICAgICAgICAgICsrY2xzO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghY2xuICYmIGNscyA+IDIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKDsgY2xzID4gMTM4OyBjbHMgLT0gMTM4KVxuICAgICAgICAgICAgICAgICAgICB3KDMyNzU0KTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzID4gMikge1xuICAgICAgICAgICAgICAgICAgICB3KGNscyA+IDEwID8gKChjbHMgLSAxMSkgPDwgNSkgfCAyODY5MCA6ICgoY2xzIC0gMykgPDwgNSkgfCAxMjMwNSk7XG4gICAgICAgICAgICAgICAgICAgIGNscyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2xzID4gMykge1xuICAgICAgICAgICAgICAgIHcoY2xuKSwgLS1jbHM7XG4gICAgICAgICAgICAgICAgZm9yICg7IGNscyA+IDY7IGNscyAtPSA2KVxuICAgICAgICAgICAgICAgICAgICB3KDgzMDQpO1xuICAgICAgICAgICAgICAgIGlmIChjbHMgPiAyKVxuICAgICAgICAgICAgICAgICAgICB3KCgoY2xzIC0gMykgPDwgNSkgfCA4MjA4KSwgY2xzID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChjbHMtLSlcbiAgICAgICAgICAgICAgICB3KGNsbik7XG4gICAgICAgICAgICBjbHMgPSAxO1xuICAgICAgICAgICAgY2xuID0gY1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBjOiBjbC5zdWJhcnJheSgwLCBjbGkpLCBuOiBzIH07XG59O1xuLy8gY2FsY3VsYXRlIHRoZSBsZW5ndGggb2Ygb3V0cHV0IGZyb20gdHJlZSwgY29kZSBsZW5ndGhzXG52YXIgY2xlbiA9IGZ1bmN0aW9uIChjZiwgY2wpIHtcbiAgICB2YXIgbCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbC5sZW5ndGg7ICsraSlcbiAgICAgICAgbCArPSBjZltpXSAqIGNsW2ldO1xuICAgIHJldHVybiBsO1xufTtcbi8vIHdyaXRlcyBhIGZpeGVkIGJsb2NrXG4vLyByZXR1cm5zIHRoZSBuZXcgYml0IHBvc1xudmFyIHdmYmxrID0gZnVuY3Rpb24gKG91dCwgcG9zLCBkYXQpIHtcbiAgICAvLyBubyBuZWVkIHRvIHdyaXRlIDAwIGFzIHR5cGU6IFR5cGVkQXJyYXkgZGVmYXVsdHMgdG8gMFxuICAgIHZhciBzID0gZGF0Lmxlbmd0aDtcbiAgICB2YXIgbyA9IHNoZnQocG9zICsgMik7XG4gICAgb3V0W29dID0gcyAmIDI1NTtcbiAgICBvdXRbbyArIDFdID0gcyA+PiA4O1xuICAgIG91dFtvICsgMl0gPSBvdXRbb10gXiAyNTU7XG4gICAgb3V0W28gKyAzXSA9IG91dFtvICsgMV0gXiAyNTU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyArK2kpXG4gICAgICAgIG91dFtvICsgaSArIDRdID0gZGF0W2ldO1xuICAgIHJldHVybiAobyArIDQgKyBzKSAqIDg7XG59O1xuLy8gd3JpdGVzIGEgYmxvY2tcbnZhciB3YmxrID0gZnVuY3Rpb24gKGRhdCwgb3V0LCBmaW5hbCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBibCwgcCkge1xuICAgIHdiaXRzKG91dCwgcCsrLCBmaW5hbCk7XG4gICAgKytsZlsyNTZdO1xuICAgIHZhciBfYSA9IGhUcmVlKGxmLCAxNSksIGRsdCA9IF9hLnQsIG1sYiA9IF9hLmw7XG4gICAgdmFyIF9iID0gaFRyZWUoZGYsIDE1KSwgZGR0ID0gX2IudCwgbWRiID0gX2IubDtcbiAgICB2YXIgX2MgPSBsYyhkbHQpLCBsY2x0ID0gX2MuYywgbmxjID0gX2MubjtcbiAgICB2YXIgX2QgPSBsYyhkZHQpLCBsY2R0ID0gX2QuYywgbmRjID0gX2QubjtcbiAgICB2YXIgbGNmcmVxID0gbmV3IHUxNigxOSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsY2x0Lmxlbmd0aDsgKytpKVxuICAgICAgICArK2xjZnJlcVtsY2x0W2ldICYgMzFdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGNkdC5sZW5ndGg7ICsraSlcbiAgICAgICAgKytsY2ZyZXFbbGNkdFtpXSAmIDMxXTtcbiAgICB2YXIgX2UgPSBoVHJlZShsY2ZyZXEsIDcpLCBsY3QgPSBfZS50LCBtbGNiID0gX2UubDtcbiAgICB2YXIgbmxjYyA9IDE5O1xuICAgIGZvciAoOyBubGNjID4gNCAmJiAhbGN0W2NsaW1bbmxjYyAtIDFdXTsgLS1ubGNjKVxuICAgICAgICA7XG4gICAgdmFyIGZsZW4gPSAoYmwgKyA1KSA8PCAzO1xuICAgIHZhciBmdGxlbiA9IGNsZW4obGYsIGZsdCkgKyBjbGVuKGRmLCBmZHQpICsgZWI7XG4gICAgdmFyIGR0bGVuID0gY2xlbihsZiwgZGx0KSArIGNsZW4oZGYsIGRkdCkgKyBlYiArIDE0ICsgMyAqIG5sY2MgKyBjbGVuKGxjZnJlcSwgbGN0KSArIDIgKiBsY2ZyZXFbMTZdICsgMyAqIGxjZnJlcVsxN10gKyA3ICogbGNmcmVxWzE4XTtcbiAgICBpZiAoYnMgPj0gMCAmJiBmbGVuIDw9IGZ0bGVuICYmIGZsZW4gPD0gZHRsZW4pXG4gICAgICAgIHJldHVybiB3ZmJsayhvdXQsIHAsIGRhdC5zdWJhcnJheShicywgYnMgKyBibCkpO1xuICAgIHZhciBsbSwgbGwsIGRtLCBkbDtcbiAgICB3Yml0cyhvdXQsIHAsIDEgKyAoZHRsZW4gPCBmdGxlbikpLCBwICs9IDI7XG4gICAgaWYgKGR0bGVuIDwgZnRsZW4pIHtcbiAgICAgICAgbG0gPSBoTWFwKGRsdCwgbWxiLCAwKSwgbGwgPSBkbHQsIGRtID0gaE1hcChkZHQsIG1kYiwgMCksIGRsID0gZGR0O1xuICAgICAgICB2YXIgbGxtID0gaE1hcChsY3QsIG1sY2IsIDApO1xuICAgICAgICB3Yml0cyhvdXQsIHAsIG5sYyAtIDI1Nyk7XG4gICAgICAgIHdiaXRzKG91dCwgcCArIDUsIG5kYyAtIDEpO1xuICAgICAgICB3Yml0cyhvdXQsIHAgKyAxMCwgbmxjYyAtIDQpO1xuICAgICAgICBwICs9IDE0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5sY2M7ICsraSlcbiAgICAgICAgICAgIHdiaXRzKG91dCwgcCArIDMgKiBpLCBsY3RbY2xpbVtpXV0pO1xuICAgICAgICBwICs9IDMgKiBubGNjO1xuICAgICAgICB2YXIgbGN0cyA9IFtsY2x0LCBsY2R0XTtcbiAgICAgICAgZm9yICh2YXIgaXQgPSAwOyBpdCA8IDI7ICsraXQpIHtcbiAgICAgICAgICAgIHZhciBjbGN0ID0gbGN0c1tpdF07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsY3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVuID0gY2xjdFtpXSAmIDMxO1xuICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgbGxtW2xlbl0pLCBwICs9IGxjdFtsZW5dO1xuICAgICAgICAgICAgICAgIGlmIChsZW4gPiAxNSlcbiAgICAgICAgICAgICAgICAgICAgd2JpdHMob3V0LCBwLCAoY2xjdFtpXSA+PiA1KSAmIDEyNyksIHAgKz0gY2xjdFtpXSA+PiAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbG0gPSBmbG0sIGxsID0gZmx0LCBkbSA9IGZkbSwgZGwgPSBmZHQ7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGk7ICsraSkge1xuICAgICAgICB2YXIgc3ltID0gc3ltc1tpXTtcbiAgICAgICAgaWYgKHN5bSA+IDI1NSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IChzeW0gPj4gMTgpICYgMzE7XG4gICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgbG1bbGVuICsgMjU3XSksIHAgKz0gbGxbbGVuICsgMjU3XTtcbiAgICAgICAgICAgIGlmIChsZW4gPiA3KVxuICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgKHN5bSA+PiAyMykgJiAzMSksIHAgKz0gZmxlYltsZW5dO1xuICAgICAgICAgICAgdmFyIGRzdCA9IHN5bSAmIDMxO1xuICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIGRtW2RzdF0pLCBwICs9IGRsW2RzdF07XG4gICAgICAgICAgICBpZiAoZHN0ID4gMylcbiAgICAgICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgKHN5bSA+PiA1KSAmIDgxOTEpLCBwICs9IGZkZWJbZHN0XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBsbVtzeW1dKSwgcCArPSBsbFtzeW1dO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdiaXRzMTYob3V0LCBwLCBsbVsyNTZdKTtcbiAgICByZXR1cm4gcCArIGxsWzI1Nl07XG59O1xuLy8gZGVmbGF0ZSBvcHRpb25zIChuaWNlIDw8IDEzKSB8IGNoYWluXG52YXIgZGVvID0gLyojX19QVVJFX18qLyBuZXcgaTMyKFs2NTU0MCwgMTMxMDgwLCAxMzEwODgsIDEzMTEwNCwgMjYyMTc2LCAxMDQ4NzA0LCAxMDQ4ODMyLCAyMTE0NTYwLCAyMTE3NjMyXSk7XG4vLyBlbXB0eVxudmFyIGV0ID0gLyojX19QVVJFX18qLyBuZXcgdTgoMCk7XG4vLyBjb21wcmVzc2VzIGRhdGEgaW50byBhIHJhdyBERUZMQVRFIGJ1ZmZlclxudmFyIGRmbHQgPSBmdW5jdGlvbiAoZGF0LCBsdmwsIHBsdmwsIHByZSwgcG9zdCwgc3QpIHtcbiAgICB2YXIgcyA9IHN0LnogfHwgZGF0Lmxlbmd0aDtcbiAgICB2YXIgbyA9IG5ldyB1OChwcmUgKyBzICsgNSAqICgxICsgTWF0aC5jZWlsKHMgLyA3MDAwKSkgKyBwb3N0KTtcbiAgICAvLyB3cml0aW5nIHRvIHRoaXMgd3JpdGVzIHRvIHRoZSBvdXRwdXQgYnVmZmVyXG4gICAgdmFyIHcgPSBvLnN1YmFycmF5KHByZSwgby5sZW5ndGggLSBwb3N0KTtcbiAgICB2YXIgbHN0ID0gc3QubDtcbiAgICB2YXIgcG9zID0gKHN0LnIgfHwgMCkgJiA3O1xuICAgIGlmIChsdmwpIHtcbiAgICAgICAgaWYgKHBvcylcbiAgICAgICAgICAgIHdbMF0gPSBzdC5yID4+IDM7XG4gICAgICAgIHZhciBvcHQgPSBkZW9bbHZsIC0gMV07XG4gICAgICAgIHZhciBuID0gb3B0ID4+IDEzLCBjID0gb3B0ICYgODE5MTtcbiAgICAgICAgdmFyIG1za18xID0gKDEgPDwgcGx2bCkgLSAxO1xuICAgICAgICAvLyAgICBwcmV2IDItYnl0ZSB2YWwgbWFwICAgIGN1cnIgMi1ieXRlIHZhbCBtYXBcbiAgICAgICAgdmFyIHByZXYgPSBzdC5wIHx8IG5ldyB1MTYoMzI3NjgpLCBoZWFkID0gc3QuaCB8fCBuZXcgdTE2KG1za18xICsgMSk7XG4gICAgICAgIHZhciBiczFfMSA9IE1hdGguY2VpbChwbHZsIC8gMyksIGJzMl8xID0gMiAqIGJzMV8xO1xuICAgICAgICB2YXIgaHNoID0gZnVuY3Rpb24gKGkpIHsgcmV0dXJuIChkYXRbaV0gXiAoZGF0W2kgKyAxXSA8PCBiczFfMSkgXiAoZGF0W2kgKyAyXSA8PCBiczJfMSkpICYgbXNrXzE7IH07XG4gICAgICAgIC8vIDI0NTc2IGlzIGFuIGFyYml0cmFyeSBudW1iZXIgb2YgbWF4aW11bSBzeW1ib2xzIHBlciBibG9ja1xuICAgICAgICAvLyA0MjQgYnVmZmVyIGZvciBsYXN0IGJsb2NrXG4gICAgICAgIHZhciBzeW1zID0gbmV3IGkzMigyNTAwMCk7XG4gICAgICAgIC8vIGxlbmd0aC9saXRlcmFsIGZyZXEgICBkaXN0YW5jZSBmcmVxXG4gICAgICAgIHZhciBsZiA9IG5ldyB1MTYoMjg4KSwgZGYgPSBuZXcgdTE2KDMyKTtcbiAgICAgICAgLy8gIGwvbGNudCAgZXhiaXRzICBpbmRleCAgICAgICAgICBsL2xpbmQgIHdhaXRkeCAgICAgICAgICBibGtwb3NcbiAgICAgICAgdmFyIGxjXzEgPSAwLCBlYiA9IDAsIGkgPSBzdC5pIHx8IDAsIGxpID0gMCwgd2kgPSBzdC53IHx8IDAsIGJzID0gMDtcbiAgICAgICAgZm9yICg7IGkgKyAyIDwgczsgKytpKSB7XG4gICAgICAgICAgICAvLyBoYXNoIHZhbHVlXG4gICAgICAgICAgICB2YXIgaHYgPSBoc2goaSk7XG4gICAgICAgICAgICAvLyBpbmRleCBtb2QgMzI3NjggICAgcHJldmlvdXMgaW5kZXggbW9kXG4gICAgICAgICAgICB2YXIgaW1vZCA9IGkgJiAzMjc2NywgcGltb2QgPSBoZWFkW2h2XTtcbiAgICAgICAgICAgIHByZXZbaW1vZF0gPSBwaW1vZDtcbiAgICAgICAgICAgIGhlYWRbaHZdID0gaW1vZDtcbiAgICAgICAgICAgIC8vIFdlIGFsd2F5cyBzaG91bGQgbW9kaWZ5IGhlYWQgYW5kIHByZXYsIGJ1dCBvbmx5IGFkZCBzeW1ib2xzIGlmXG4gICAgICAgICAgICAvLyB0aGlzIGRhdGEgaXMgbm90IHlldCBwcm9jZXNzZWQgKFwid2FpdFwiIGZvciB3YWl0IGluZGV4KVxuICAgICAgICAgICAgaWYgKHdpIDw9IGkpIHtcbiAgICAgICAgICAgICAgICAvLyBieXRlcyByZW1haW5pbmdcbiAgICAgICAgICAgICAgICB2YXIgcmVtID0gcyAtIGk7XG4gICAgICAgICAgICAgICAgaWYgKChsY18xID4gNzAwMCB8fCBsaSA+IDI0NTc2KSAmJiAocmVtID4gNDIzIHx8ICFsc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvcyA9IHdibGsoZGF0LCB3LCAwLCBzeW1zLCBsZiwgZGYsIGViLCBsaSwgYnMsIGkgLSBicywgcG9zKTtcbiAgICAgICAgICAgICAgICAgICAgbGkgPSBsY18xID0gZWIgPSAwLCBicyA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjg2OyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBsZltqXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMzA7ICsrailcbiAgICAgICAgICAgICAgICAgICAgICAgIGRmW2pdID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gIGxlbiAgICBkaXN0ICAgY2hhaW5cbiAgICAgICAgICAgICAgICB2YXIgbCA9IDIsIGQgPSAwLCBjaF8xID0gYywgZGlmID0gaW1vZCAtIHBpbW9kICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgaWYgKHJlbSA+IDIgJiYgaHYgPT0gaHNoKGkgLSBkaWYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhuID0gTWF0aC5taW4obiwgcmVtKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhkID0gTWF0aC5taW4oMzI3NjcsIGkpO1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXggcG9zc2libGUgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCBjYXBwZWQgYXQgZGlmIGJlY2F1c2UgZGVjb21wcmVzc29ycyBpbXBsZW1lbnQgXCJyb2xsaW5nXCIgaW5kZXggcG9wdWxhdGlvblxuICAgICAgICAgICAgICAgICAgICB2YXIgbWwgPSBNYXRoLm1pbigyNTgsIHJlbSk7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChkaWYgPD0gbWF4ZCAmJiAtLWNoXzEgJiYgaW1vZCAhPSBwaW1vZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdFtpICsgbF0gPT0gZGF0W2kgKyBsIC0gZGlmXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBubCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IG5sIDwgbWwgJiYgZGF0W2kgKyBubF0gPT0gZGF0W2kgKyBubCAtIGRpZl07ICsrbmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmwgPiBsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBubCwgZCA9IGRpZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWsgb3V0IGVhcmx5IHdoZW4gd2UgcmVhY2ggXCJuaWNlXCIgKHdlIGFyZSBzYXRpc2ZpZWQgZW5vdWdoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmwgPiBtYXhuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdywgZmluZCB0aGUgcmFyZXN0IDItYnl0ZSBzZXF1ZW5jZSB3aXRoaW4gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZW5ndGggb2YgbGl0ZXJhbHMgYW5kIHNlYXJjaCBmb3IgdGhhdCBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNdWNoIGZhc3RlciB0aGFuIGp1c3QgdXNpbmcgdGhlIHN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtbWQgPSBNYXRoLm1pbihkaWYsIG5sIC0gMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbW1kOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aSA9IGkgLSBkaWYgKyBqICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHRpID0gcHJldlt0aV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2QgPSB0aSAtIHB0aSAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNkID4gbWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWQgPSBjZCwgcGltb2QgPSB0aTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoZSBwcmV2aW91cyBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1vZCA9IHBpbW9kLCBwaW1vZCA9IHByZXZbaW1vZF07XG4gICAgICAgICAgICAgICAgICAgICAgICBkaWYgKz0gaW1vZCAtIHBpbW9kICYgMzI3Njc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZCB3aWxsIGJlIG5vbnplcm8gb25seSB3aGVuIGEgbWF0Y2ggd2FzIGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmUgYm90aCBkaXN0IGFuZCBsZW4gZGF0YSBpbiBvbmUgaW50MzJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoaXMgaXMgcmVjb2duaXplZCBhcyBhIGxlbi9kaXN0IHdpdGggMjh0aCBiaXQgKDJeMjgpXG4gICAgICAgICAgICAgICAgICAgIHN5bXNbbGkrK10gPSAyNjg0MzU0NTYgfCAocmV2ZmxbbF0gPDwgMTgpIHwgcmV2ZmRbZF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW4gPSByZXZmbFtsXSAmIDMxLCBkaW4gPSByZXZmZFtkXSAmIDMxO1xuICAgICAgICAgICAgICAgICAgICBlYiArPSBmbGViW2xpbl0gKyBmZGViW2Rpbl07XG4gICAgICAgICAgICAgICAgICAgICsrbGZbMjU3ICsgbGluXTtcbiAgICAgICAgICAgICAgICAgICAgKytkZltkaW5dO1xuICAgICAgICAgICAgICAgICAgICB3aSA9IGkgKyBsO1xuICAgICAgICAgICAgICAgICAgICArK2xjXzE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzeW1zW2xpKytdID0gZGF0W2ldO1xuICAgICAgICAgICAgICAgICAgICArK2xmW2RhdFtpXV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IE1hdGgubWF4KGksIHdpKTsgaSA8IHM7ICsraSkge1xuICAgICAgICAgICAgc3ltc1tsaSsrXSA9IGRhdFtpXTtcbiAgICAgICAgICAgICsrbGZbZGF0W2ldXTtcbiAgICAgICAgfVxuICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgbHN0LCBzeW1zLCBsZiwgZGYsIGViLCBsaSwgYnMsIGkgLSBicywgcG9zKTtcbiAgICAgICAgaWYgKCFsc3QpIHtcbiAgICAgICAgICAgIHN0LnIgPSAocG9zICYgNykgfCB3Wyhwb3MgLyA4KSB8IDBdIDw8IDM7XG4gICAgICAgICAgICAvLyBzaGZ0KHBvcykgbm93IDEgbGVzcyBpZiBwb3MgJiA3ICE9IDBcbiAgICAgICAgICAgIHBvcyAtPSA3O1xuICAgICAgICAgICAgc3QuaCA9IGhlYWQsIHN0LnAgPSBwcmV2LCBzdC5pID0gaSwgc3QudyA9IHdpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gc3QudyB8fCAwOyBpIDwgcyArIGxzdDsgaSArPSA2NTUzNSkge1xuICAgICAgICAgICAgLy8gZW5kXG4gICAgICAgICAgICB2YXIgZSA9IGkgKyA2NTUzNTtcbiAgICAgICAgICAgIGlmIChlID49IHMpIHtcbiAgICAgICAgICAgICAgICAvLyB3cml0ZSBmaW5hbCBibG9ja1xuICAgICAgICAgICAgICAgIHdbKHBvcyAvIDgpIHwgMF0gPSBsc3Q7XG4gICAgICAgICAgICAgICAgZSA9IHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3MgPSB3ZmJsayh3LCBwb3MgKyAxLCBkYXQuc3ViYXJyYXkoaSwgZSkpO1xuICAgICAgICB9XG4gICAgICAgIHN0LmkgPSBzO1xuICAgIH1cbiAgICByZXR1cm4gc2xjKG8sIDAsIHByZSArIHNoZnQocG9zKSArIHBvc3QpO1xufTtcbi8vIENSQzMyIHRhYmxlXG52YXIgY3JjdCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdCA9IG5ldyBJbnQzMkFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgICAgICB2YXIgYyA9IGksIGsgPSA5O1xuICAgICAgICB3aGlsZSAoLS1rKVxuICAgICAgICAgICAgYyA9ICgoYyAmIDEpICYmIC0zMDY2NzQ5MTIpIF4gKGMgPj4+IDEpO1xuICAgICAgICB0W2ldID0gYztcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG59KSgpO1xuLy8gQ1JDMzJcbnZhciBjcmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGMgPSAtMTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgLy8gY2xvc3VyZXMgaGF2ZSBhd2Z1bCBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgdmFyIGNyID0gYztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjciA9IGNyY3RbKGNyICYgMjU1KSBeIGRbaV1dIF4gKGNyID4+PiA4KTtcbiAgICAgICAgICAgIGMgPSBjcjtcbiAgICAgICAgfSxcbiAgICAgICAgZDogZnVuY3Rpb24gKCkgeyByZXR1cm4gfmM7IH1cbiAgICB9O1xufTtcbi8vIEFkbGVyMzJcbnZhciBhZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYSA9IDEsIGIgPSAwO1xuICAgIHJldHVybiB7XG4gICAgICAgIHA6IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAvLyBjbG9zdXJlcyBoYXZlIGF3ZnVsIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICB2YXIgbiA9IGEsIG0gPSBiO1xuICAgICAgICAgICAgdmFyIGwgPSBkLmxlbmd0aCB8IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSAhPSBsOykge1xuICAgICAgICAgICAgICAgIHZhciBlID0gTWF0aC5taW4oaSArIDI2NTUsIGwpO1xuICAgICAgICAgICAgICAgIGZvciAoOyBpIDwgZTsgKytpKVxuICAgICAgICAgICAgICAgICAgICBtICs9IG4gKz0gZFtpXTtcbiAgICAgICAgICAgICAgICBuID0gKG4gJiA2NTUzNSkgKyAxNSAqIChuID4+IDE2KSwgbSA9IChtICYgNjU1MzUpICsgMTUgKiAobSA+PiAxNik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhID0gbiwgYiA9IG07XG4gICAgICAgIH0sXG4gICAgICAgIGQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGEgJT0gNjU1MjEsIGIgJT0gNjU1MjE7XG4gICAgICAgICAgICByZXR1cm4gKGEgJiAyNTUpIDw8IDI0IHwgKGEgJiAweEZGMDApIDw8IDggfCAoYiAmIDI1NSkgPDwgOCB8IChiID4+IDgpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG47XG4vLyBkZWZsYXRlIHdpdGggb3B0c1xudmFyIGRvcHQgPSBmdW5jdGlvbiAoZGF0LCBvcHQsIHByZSwgcG9zdCwgc3QpIHtcbiAgICBpZiAoIXN0KSB7XG4gICAgICAgIHN0ID0geyBsOiAxIH07XG4gICAgICAgIGlmIChvcHQuZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIGRpY3QgPSBvcHQuZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpO1xuICAgICAgICAgICAgdmFyIG5ld0RhdCA9IG5ldyB1OChkaWN0Lmxlbmd0aCArIGRhdC5sZW5ndGgpO1xuICAgICAgICAgICAgbmV3RGF0LnNldChkaWN0KTtcbiAgICAgICAgICAgIG5ld0RhdC5zZXQoZGF0LCBkaWN0Lmxlbmd0aCk7XG4gICAgICAgICAgICBkYXQgPSBuZXdEYXQ7XG4gICAgICAgICAgICBzdC53ID0gZGljdC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRmbHQoZGF0LCBvcHQubGV2ZWwgPT0gbnVsbCA/IDYgOiBvcHQubGV2ZWwsIG9wdC5tZW0gPT0gbnVsbCA/IChzdC5sID8gTWF0aC5jZWlsKE1hdGgubWF4KDgsIE1hdGgubWluKDEzLCBNYXRoLmxvZyhkYXQubGVuZ3RoKSkpICogMS41KSA6IDIwKSA6ICgxMiArIG9wdC5tZW0pLCBwcmUsIHBvc3QsIHN0KTtcbn07XG4vLyBXYWxtYXJ0IG9iamVjdCBzcHJlYWRcbnZhciBtcmcgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHZhciBvID0ge307XG4gICAgZm9yICh2YXIgayBpbiBhKVxuICAgICAgICBvW2tdID0gYVtrXTtcbiAgICBmb3IgKHZhciBrIGluIGIpXG4gICAgICAgIG9ba10gPSBiW2tdO1xuICAgIHJldHVybiBvO1xufTtcbi8vIHdvcmtlciBjbG9uZVxuLy8gVGhpcyBpcyBwb3NzaWJseSB0aGUgY3Jhemllc3QgcGFydCBvZiB0aGUgZW50aXJlIGNvZGViYXNlLCBkZXNwaXRlIGhvdyBzaW1wbGUgaXQgbWF5IHNlZW0uXG4vLyBUaGUgb25seSBwYXJhbWV0ZXIgdG8gdGhpcyBmdW5jdGlvbiBpcyBhIGNsb3N1cmUgdGhhdCByZXR1cm5zIGFuIGFycmF5IG9mIHZhcmlhYmxlcyBvdXRzaWRlIG9mIHRoZSBmdW5jdGlvbiBzY29wZS5cbi8vIFdlJ3JlIGdvaW5nIHRvIHRyeSB0byBmaWd1cmUgb3V0IHRoZSB2YXJpYWJsZSBuYW1lcyB1c2VkIGluIHRoZSBjbG9zdXJlIGFzIHN0cmluZ3MgYmVjYXVzZSB0aGF0IGlzIGNydWNpYWwgZm9yIHdvcmtlcml6YXRpb24uXG4vLyBXZSB3aWxsIHJldHVybiBhbiBvYmplY3QgbWFwcGluZyBvZiB0cnVlIHZhcmlhYmxlIG5hbWUgdG8gdmFsdWUgKGJhc2ljYWxseSwgdGhlIGN1cnJlbnQgc2NvcGUgYXMgYSBKUyBvYmplY3QpLlxuLy8gVGhlIHJlYXNvbiB3ZSBjYW4ndCBqdXN0IHVzZSB0aGUgb3JpZ2luYWwgdmFyaWFibGUgbmFtZXMgaXMgbWluaWZpZXJzIG1hbmdsaW5nIHRoZSB0b3BsZXZlbCBzY29wZS5cbi8vIFRoaXMgdG9vayBtZSB0aHJlZSB3ZWVrcyB0byBmaWd1cmUgb3V0IGhvdyB0byBkby5cbnZhciB3Y2xuID0gZnVuY3Rpb24gKGZuLCBmblN0ciwgdGQpIHtcbiAgICB2YXIgZHQgPSBmbigpO1xuICAgIHZhciBzdCA9IGZuLnRvU3RyaW5nKCk7XG4gICAgdmFyIGtzID0gc3Quc2xpY2Uoc3QuaW5kZXhPZignWycpICsgMSwgc3QubGFzdEluZGV4T2YoJ10nKSkucmVwbGFjZSgvXFxzKy9nLCAnJykuc3BsaXQoJywnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGR0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciB2ID0gZHRbaV0sIGsgPSBrc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGZuU3RyICs9ICc7JyArIGsgKyAnPSc7XG4gICAgICAgICAgICB2YXIgc3RfMSA9IHYudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmICh2LnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIGZvciBnbG9iYWwgb2JqZWN0c1xuICAgICAgICAgICAgICAgIGlmIChzdF8xLmluZGV4T2YoJ1tuYXRpdmUgY29kZV0nKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3BJbmQgPSBzdF8xLmluZGV4T2YoJyAnLCA4KSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGZuU3RyICs9IHN0XzEuc2xpY2Uoc3BJbmQsIHN0XzEuaW5kZXhPZignKCcsIHNwSW5kKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmblN0ciArPSBzdF8xO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB0IGluIHYucHJvdG90eXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm5TdHIgKz0gJzsnICsgayArICcucHJvdG90eXBlLicgKyB0ICsgJz0nICsgdi5wcm90b3R5cGVbdF0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm5TdHIgKz0gc3RfMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZFtrXSA9IHY7XG4gICAgfVxuICAgIHJldHVybiBmblN0cjtcbn07XG52YXIgY2ggPSBbXTtcbi8vIGNsb25lIGJ1ZnNcbnZhciBjYmZzID0gZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgdGwgPSBbXTtcbiAgICBmb3IgKHZhciBrIGluIHYpIHtcbiAgICAgICAgaWYgKHZba10uYnVmZmVyKSB7XG4gICAgICAgICAgICB0bC5wdXNoKCh2W2tdID0gbmV3IHZba10uY29uc3RydWN0b3IodltrXSkpLmJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRsO1xufTtcbi8vIHVzZSBhIHdvcmtlciB0byBleGVjdXRlIGNvZGVcbnZhciB3cmtyID0gZnVuY3Rpb24gKGZucywgaW5pdCwgaWQsIGNiKSB7XG4gICAgaWYgKCFjaFtpZF0pIHtcbiAgICAgICAgdmFyIGZuU3RyID0gJycsIHRkXzEgPSB7fSwgbSA9IGZucy5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07ICsraSlcbiAgICAgICAgICAgIGZuU3RyID0gd2NsbihmbnNbaV0sIGZuU3RyLCB0ZF8xKTtcbiAgICAgICAgY2hbaWRdID0geyBjOiB3Y2xuKGZuc1ttXSwgZm5TdHIsIHRkXzEpLCBlOiB0ZF8xIH07XG4gICAgfVxuICAgIHZhciB0ZCA9IG1yZyh7fSwgY2hbaWRdLmUpO1xuICAgIHJldHVybiB3ayhjaFtpZF0uYyArICc7b25tZXNzYWdlPWZ1bmN0aW9uKGUpe2Zvcih2YXIgayBpbiBlLmRhdGEpc2VsZltrXT1lLmRhdGFba107b25tZXNzYWdlPScgKyBpbml0LnRvU3RyaW5nKCkgKyAnfScsIGlkLCB0ZCwgY2Jmcyh0ZCksIGNiKTtcbn07XG4vLyBiYXNlIGFzeW5jIGluZmxhdGUgZm5cbnZhciBiSW5mbHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbdTgsIHUxNiwgaTMyLCBmbGViLCBmZGViLCBjbGltLCBmbCwgZmQsIGZscm0sIGZkcm0sIHJldiwgZWMsIGhNYXAsIG1heCwgYml0cywgYml0czE2LCBzaGZ0LCBzbGMsIGVyciwgaW5mbHQsIGluZmxhdGVTeW5jLCBwYmYsIGdvcHRdOyB9O1xudmFyIGJEZmx0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3U4LCB1MTYsIGkzMiwgZmxlYiwgZmRlYiwgY2xpbSwgcmV2ZmwsIHJldmZkLCBmbG0sIGZsdCwgZmRtLCBmZHQsIHJldiwgZGVvLCBldCwgaE1hcCwgd2JpdHMsIHdiaXRzMTYsIGhUcmVlLCBsbiwgbGMsIGNsZW4sIHdmYmxrLCB3YmxrLCBzaGZ0LCBzbGMsIGRmbHQsIGRvcHQsIGRlZmxhdGVTeW5jLCBwYmZdOyB9O1xuLy8gZ3ppcCBleHRyYVxudmFyIGd6ZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtnemgsIGd6aGwsIHdieXRlcywgY3JjLCBjcmN0XTsgfTtcbi8vIGd1bnppcCBleHRyYVxudmFyIGd1emUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3pzLCBnemxdOyB9O1xuLy8gemxpYiBleHRyYVxudmFyIHpsZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bGgsIHdieXRlcywgYWRsZXJdOyB9O1xuLy8gdW56bGliIGV4dHJhXG52YXIgenVsZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt6bHNdOyB9O1xuLy8gcG9zdCBidWZcbnZhciBwYmYgPSBmdW5jdGlvbiAobXNnKSB7IHJldHVybiBwb3N0TWVzc2FnZShtc2csIFttc2cuYnVmZmVyXSk7IH07XG4vLyBnZXQgb3B0c1xudmFyIGdvcHQgPSBmdW5jdGlvbiAobykgeyByZXR1cm4gbyAmJiB7XG4gICAgb3V0OiBvLnNpemUgJiYgbmV3IHU4KG8uc2l6ZSksXG4gICAgZGljdGlvbmFyeTogby5kaWN0aW9uYXJ5XG59OyB9O1xuLy8gYXN5bmMgaGVscGVyXG52YXIgY2JpZnkgPSBmdW5jdGlvbiAoZGF0LCBvcHRzLCBmbnMsIGluaXQsIGlkLCBjYikge1xuICAgIHZhciB3ID0gd3JrcihmbnMsIGluaXQsIGlkLCBmdW5jdGlvbiAoZXJyLCBkYXQpIHtcbiAgICAgICAgdy50ZXJtaW5hdGUoKTtcbiAgICAgICAgY2IoZXJyLCBkYXQpO1xuICAgIH0pO1xuICAgIHcucG9zdE1lc3NhZ2UoW2RhdCwgb3B0c10sIG9wdHMuY29uc3VtZSA/IFtkYXQuYnVmZmVyXSA6IFtdKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyB3LnRlcm1pbmF0ZSgpOyB9O1xufTtcbi8vIGF1dG8gc3RyZWFtXG52YXIgYXN0cm0gPSBmdW5jdGlvbiAoc3RybSkge1xuICAgIHN0cm0ub25kYXRhID0gZnVuY3Rpb24gKGRhdCwgZmluYWwpIHsgcmV0dXJuIHBvc3RNZXNzYWdlKFtkYXQsIGZpbmFsXSwgW2RhdC5idWZmZXJdKTsgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgIGlmIChldi5kYXRhWzBdKSB7XG4gICAgICAgICAgICBzdHJtLnB1c2goZXYuZGF0YVswXSwgZXYuZGF0YVsxXSk7XG4gICAgICAgICAgICBwb3N0TWVzc2FnZShbZXYuZGF0YVswXS5sZW5ndGhdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdHJtLmZsdXNoKGV2LmRhdGFbMV0pO1xuICAgIH07XG59O1xuLy8gYXN5bmMgc3RyZWFtIGF0dGFjaFxudmFyIGFzdHJtaWZ5ID0gZnVuY3Rpb24gKGZucywgc3RybSwgb3B0cywgaW5pdCwgaWQsIGZsdXNoLCBleHQpIHtcbiAgICB2YXIgdDtcbiAgICB2YXIgdyA9IHdya3IoZm5zLCBpbml0LCBpZCwgZnVuY3Rpb24gKGVyciwgZGF0KSB7XG4gICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICB3LnRlcm1pbmF0ZSgpLCBzdHJtLm9uZGF0YS5jYWxsKHN0cm0sIGVycik7XG4gICAgICAgIGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KGRhdCkpXG4gICAgICAgICAgICBleHQoZGF0KTtcbiAgICAgICAgZWxzZSBpZiAoZGF0Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICBzdHJtLnF1ZXVlZFNpemUgLT0gZGF0WzBdO1xuICAgICAgICAgICAgaWYgKHN0cm0ub25kcmFpbilcbiAgICAgICAgICAgICAgICBzdHJtLm9uZHJhaW4oZGF0WzBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkYXRbMV0pXG4gICAgICAgICAgICAgICAgdy50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgIHN0cm0ub25kYXRhLmNhbGwoc3RybSwgZXJyLCBkYXRbMF0sIGRhdFsxXSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKG9wdHMpO1xuICAgIHN0cm0ucXVldWVkU2l6ZSA9IDA7XG4gICAgc3RybS5wdXNoID0gZnVuY3Rpb24gKGQsIGYpIHtcbiAgICAgICAgaWYgKCFzdHJtLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHQpXG4gICAgICAgICAgICBzdHJtLm9uZGF0YShlcnIoNCwgMCwgMSksIG51bGwsICEhZik7XG4gICAgICAgIHN0cm0ucXVldWVkU2l6ZSArPSBkLmxlbmd0aDtcbiAgICAgICAgLy8gY2FuIGZhaWwgZm9yIGNyb3NzLXJlYWxtIFVpbnQ4QXJyYXksIGJ1dCBvayAtIG9ubHkgYSBzbWFsbCBwZXJmb3JtYW5jZSBwZW5hbHR5XG4gICAgICAgIHcucG9zdE1lc3NhZ2UoW2QsIHQgPSBmXSwgZC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA/IFtkLmJ1ZmZlcl0gOiBbXSk7XG4gICAgfTtcbiAgICBzdHJtLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbiAgICBpZiAoZmx1c2gpIHtcbiAgICAgICAgc3RybS5mbHVzaCA9IGZ1bmN0aW9uIChzeW5jKSB7IHcucG9zdE1lc3NhZ2UoWzAsIHN5bmNdKTsgfTtcbiAgICB9XG59O1xuLy8gcmVhZCAyIGJ5dGVzXG52YXIgYjIgPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gZFtiXSB8IChkW2IgKyAxXSA8PCA4KTsgfTtcbi8vIHJlYWQgNCBieXRlc1xudmFyIGI0ID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIChkW2JdIHwgKGRbYiArIDFdIDw8IDgpIHwgKGRbYiArIDJdIDw8IDE2KSB8IChkW2IgKyAzXSA8PCAyNCkpID4+PiAwOyB9O1xuLy8gcmVhZCA4IGJ5dGVzXG52YXIgYjggPSBmdW5jdGlvbiAoZCwgYikgeyByZXR1cm4gYjQoZCwgYikgKyAoYjQoZCwgYiArIDQpICogNDI5NDk2NzI5Nik7IH07XG4vLyB3cml0ZSBieXRlc1xudmFyIHdieXRlcyA9IGZ1bmN0aW9uIChkLCBiLCB2KSB7XG4gICAgZm9yICg7IHY7ICsrYilcbiAgICAgICAgZFtiXSA9IHYsIHYgPj4+PSA4O1xufTtcbi8vIGd6aXAgaGVhZGVyXG52YXIgZ3poID0gZnVuY3Rpb24gKGMsIG8pIHtcbiAgICB2YXIgZm4gPSBvLmZpbGVuYW1lO1xuICAgIGNbMF0gPSAzMSwgY1sxXSA9IDEzOSwgY1syXSA9IDgsIGNbOF0gPSBvLmxldmVsIDwgMiA/IDQgOiBvLmxldmVsID09IDkgPyAyIDogMCwgY1s5XSA9IDM7IC8vIGFzc3VtZSBVbml4XG4gICAgaWYgKG8ubXRpbWUgIT0gMClcbiAgICAgICAgd2J5dGVzKGMsIDQsIE1hdGguZmxvb3IobmV3IERhdGUoby5tdGltZSB8fCBEYXRlLm5vdygpKSAvIDEwMDApKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgICAgY1szXSA9IDg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGZuLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgY1tpICsgMTBdID0gZm4uY2hhckNvZGVBdChpKTtcbiAgICB9XG59O1xuLy8gZ3ppcCBmb290ZXI6IC04IHRvIC00ID0gQ1JDLCAtNCB0byAtMCBpcyBsZW5ndGhcbi8vIGd6aXAgc3RhcnRcbnZhciBnenMgPSBmdW5jdGlvbiAoZCkge1xuICAgIGlmIChkWzBdICE9IDMxIHx8IGRbMV0gIT0gMTM5IHx8IGRbMl0gIT0gOClcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIGd6aXAgZGF0YScpO1xuICAgIHZhciBmbGcgPSBkWzNdO1xuICAgIHZhciBzdCA9IDEwO1xuICAgIGlmIChmbGcgJiA0KVxuICAgICAgICBzdCArPSAoZFsxMF0gfCBkWzExXSA8PCA4KSArIDI7XG4gICAgZm9yICh2YXIgenMgPSAoZmxnID4+IDMgJiAxKSArIChmbGcgPj4gNCAmIDEpOyB6cyA+IDA7IHpzIC09ICFkW3N0KytdKVxuICAgICAgICA7XG4gICAgcmV0dXJuIHN0ICsgKGZsZyAmIDIpO1xufTtcbi8vIGd6aXAgbGVuZ3RoXG52YXIgZ3psID0gZnVuY3Rpb24gKGQpIHtcbiAgICB2YXIgbCA9IGQubGVuZ3RoO1xuICAgIHJldHVybiAoZFtsIC0gNF0gfCBkW2wgLSAzXSA8PCA4IHwgZFtsIC0gMl0gPDwgMTYgfCBkW2wgLSAxXSA8PCAyNCkgPj4+IDA7XG59O1xuLy8gZ3ppcCBoZWFkZXIgbGVuZ3RoXG52YXIgZ3pobCA9IGZ1bmN0aW9uIChvKSB7IHJldHVybiAxMCArIChvLmZpbGVuYW1lID8gby5maWxlbmFtZS5sZW5ndGggKyAxIDogMCk7IH07XG4vLyB6bGliIGhlYWRlclxudmFyIHpsaCA9IGZ1bmN0aW9uIChjLCBvKSB7XG4gICAgdmFyIGx2ID0gby5sZXZlbCwgZmwgPSBsdiA9PSAwID8gMCA6IGx2IDwgNiA/IDEgOiBsdiA9PSA5ID8gMyA6IDI7XG4gICAgY1swXSA9IDEyMCwgY1sxXSA9IChmbCA8PCA2KSB8IChvLmRpY3Rpb25hcnkgJiYgMzIpO1xuICAgIGNbMV0gfD0gMzEgLSAoKGNbMF0gPDwgOCkgfCBjWzFdKSAlIDMxO1xuICAgIGlmIChvLmRpY3Rpb25hcnkpIHtcbiAgICAgICAgdmFyIGggPSBhZGxlcigpO1xuICAgICAgICBoLnAoby5kaWN0aW9uYXJ5KTtcbiAgICAgICAgd2J5dGVzKGMsIDIsIGguZCgpKTtcbiAgICB9XG59O1xuLy8gemxpYiBzdGFydFxudmFyIHpscyA9IGZ1bmN0aW9uIChkLCBkaWN0KSB7XG4gICAgaWYgKChkWzBdICYgMTUpICE9IDggfHwgKGRbMF0gPj4gNCkgPiA3IHx8ICgoZFswXSA8PCA4IHwgZFsxXSkgJSAzMSkpXG4gICAgICAgIGVycig2LCAnaW52YWxpZCB6bGliIGRhdGEnKTtcbiAgICBpZiAoKGRbMV0gPj4gNSAmIDEpID09ICshZGljdClcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIHpsaWIgZGF0YTogJyArIChkWzFdICYgMzIgPyAnbmVlZCcgOiAndW5leHBlY3RlZCcpICsgJyBkaWN0aW9uYXJ5Jyk7XG4gICAgcmV0dXJuIChkWzFdID4+IDMgJiA0KSArIDI7XG59O1xuZnVuY3Rpb24gU3RybU9wdChvcHRzLCBjYikge1xuICAgIGlmICh0eXBlb2Ygb3B0cyA9PSAnZnVuY3Rpb24nKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgIHJldHVybiBvcHRzO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvblxuICovXG52YXIgRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZWZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0cyA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIHRoaXMubyA9IG9wdHMgfHwge307XG4gICAgICAgIHRoaXMucyA9IHsgbDogMCwgaTogMzI3NjgsIHc6IDMyNzY4LCB6OiAzMjc2OCB9O1xuICAgICAgICAvLyBCdWZmZXIgbGVuZ3RoIG11c3QgYWx3YXlzIGJlIDAgbW9kIDMyNzY4IGZvciBpbmRleCBjYWxjdWxhdGlvbnMgdG8gYmUgY29ycmVjdCB3aGVuIG1vZGlmeWluZyBoZWFkIGFuZCBwcmV2XG4gICAgICAgIC8vIDk4MzA0ID0gMzI3NjggKGxvb2tiYWNrKSArIDY1NTM2IChjb21tb24gY2h1bmsgc2l6ZSlcbiAgICAgICAgdGhpcy5iID0gbmV3IHU4KDk4MzA0KTtcbiAgICAgICAgaWYgKHRoaXMuby5kaWN0aW9uYXJ5KSB7XG4gICAgICAgICAgICB2YXIgZGljdCA9IHRoaXMuby5kaWN0aW9uYXJ5LnN1YmFycmF5KC0zMjc2OCk7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KGRpY3QsIDMyNzY4IC0gZGljdC5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5zLmkgPSAzMjc2OCAtIGRpY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIERlZmxhdGUucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB0aGlzLm9uZGF0YShkb3B0KGMsIHRoaXMubywgMCwgMCwgdGhpcy5zKSwgZik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAodGhpcy5zLmwpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIHZhciBlbmRMZW4gPSBjaHVuay5sZW5ndGggKyB0aGlzLnMuejtcbiAgICAgICAgaWYgKGVuZExlbiA+IHRoaXMuYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChlbmRMZW4gPiAyICogdGhpcy5iLmxlbmd0aCAtIDMyNzY4KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0J1ZiA9IG5ldyB1OChlbmRMZW4gJiAtMzI3NjgpO1xuICAgICAgICAgICAgICAgIG5ld0J1Zi5zZXQodGhpcy5iLnN1YmFycmF5KDAsIHRoaXMucy56KSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iID0gbmV3QnVmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNwbGl0ID0gdGhpcy5iLmxlbmd0aCAtIHRoaXMucy56O1xuICAgICAgICAgICAgdGhpcy5iLnNldChjaHVuay5zdWJhcnJheSgwLCBzcGxpdCksIHRoaXMucy56KTtcbiAgICAgICAgICAgIHRoaXMucy56ID0gdGhpcy5iLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMucCh0aGlzLmIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQodGhpcy5iLnN1YmFycmF5KC0zMjc2OCkpO1xuICAgICAgICAgICAgdGhpcy5iLnNldChjaHVuay5zdWJhcnJheShzcGxpdCksIDMyNzY4KTtcbiAgICAgICAgICAgIHRoaXMucy56ID0gY2h1bmsubGVuZ3RoIC0gc3BsaXQgKyAzMjc2ODtcbiAgICAgICAgICAgIHRoaXMucy5pID0gMzI3NjYsIHRoaXMucy53ID0gMzI3Njg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KGNodW5rLCB0aGlzLnMueik7XG4gICAgICAgICAgICB0aGlzLnMueiArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zLmwgPSBmaW5hbCAmIDE7XG4gICAgICAgIGlmICh0aGlzLnMueiA+IHRoaXMucy53ICsgODE5MSB8fCBmaW5hbCkge1xuICAgICAgICAgICAgdGhpcy5wKHRoaXMuYiwgZmluYWwgfHwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zLncgPSB0aGlzLnMuaSwgdGhpcy5zLmkgLT0gMjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIC8vIGNsZWFudXAgdW5uZWVkZWQgYnVmZmVycy9zdGF0ZSB0byByZWR1Y2UgbWVtb3J5IHVzYWdlXG4gICAgICAgICAgICB0aGlzLnMgPSB0aGlzLm8gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYiA9IGV0O1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGbHVzaGVzIGJ1ZmZlcmVkIHVuY29tcHJlc3NlZCBkYXRhLiBVc2VmdWwgdG8gaW1tZWRpYXRlbHkgcmV0cmlldmUgdGhlXG4gICAgICogZGVmbGF0ZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICogQHBhcmFtIHN5bmMgV2hldGhlciB0byBmbHVzaCB0byBhIGJ5dGUgYm91bmRhcnkuIEEgc3luYyBmbHVzaCB0YWtlcyA0LTVcbiAgICAgKiAgICAgICAgICAgICBleHRyYSBieXRlcywgYnV0IGd1YXJhbnRlZXMgYWxsIHB1c2hlZCBkYXRhIGlzIGltbWVkaWF0ZWx5XG4gICAgICogICAgICAgICAgICAgZGVjb21wcmVzc2libGUuIEEgc2VwYXJhdGUgREVGTEFURSBzdHJlYW0gbWF5IGJlIGNvbmNhdGVuYXRlZFxuICAgICAqICAgICAgICAgICAgIHdpdGggdGhlIGN1cnJlbnQgb3V0cHV0IGFmdGVyIGEgc3luYyBmbHVzaC5cbiAgICAgKi9cbiAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uIChzeW5jKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLnMubClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdGhpcy5wKHRoaXMuYiwgZmFsc2UpO1xuICAgICAgICB0aGlzLnMudyA9IHRoaXMucy5pLCB0aGlzLnMuaSAtPSAyO1xuICAgICAgICAvLyBjb3VsZCB0ZWNobmljYWxseSBza2lwIHdyaXRpbmcgdGhlIHR5cGUtMCBibG9jayBmb3IgKHRoaXMucy5yICYgNykgPT0gMCxcbiAgICAgICAgLy8gYnV0IHRoZSBkZXRlcm1pbmlzdGljIHRyYWlsZXIgKDAwIDAwIEZGIEZGKSBpcyB1c2VmdWwgaW4gc29tZSBzaXR1YXRpb25zXG4gICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICB2YXIgYyA9IG5ldyB1OCg2KTtcbiAgICAgICAgICAgIGNbMF0gPSB0aGlzLnMuciA+PiAzO1xuICAgICAgICAgICAgLy8gd3JpdGUgZW1wdHksIG5vbi1maW5hbCB0eXBlLTAgYmxvY2tcbiAgICAgICAgICAgIHZhciBlcCA9IHdmYmxrKGMsIHRoaXMucy5yLCBldCk7XG4gICAgICAgICAgICB0aGlzLnMuciA9IDA7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShjLnN1YmFycmF5KDAsIGVwID4+IDMpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IERlZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0RlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNEZWZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IERlZmxhdGUoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgNiwgMSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0RlZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNEZWZsYXRlIH07XG5leHBvcnQgZnVuY3Rpb24gZGVmbGF0ZShkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJEZmx0LFxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGRlZmxhdGVTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMCwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzc2VzIGRhdGEgd2l0aCBERUZMQVRFIHdpdGhvdXQgYW55IHdyYXBwZXJcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGRlZmxhdGVkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmxhdGVTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gZG9wdChkYXRhLCBvcHRzIHx8IHt9LCAwLCAwKTtcbn1cbi8qKlxuICogU3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBJbmZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIC8vIG5vIFN0cm1PcHQgaGVyZSB0byBhdm9pZCBhZGRpbmcgdG8gd29ya2VyaXplclxuICAgICAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgICAgICB0aGlzLm9uZGF0YSA9IGNiO1xuICAgICAgICB2YXIgZGljdCA9IG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5ICYmIG9wdHMuZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpO1xuICAgICAgICB0aGlzLnMgPSB7IGk6IDAsIGI6IGRpY3QgPyBkaWN0Lmxlbmd0aCA6IDAgfTtcbiAgICAgICAgdGhpcy5vID0gbmV3IHU4KDMyNzY4KTtcbiAgICAgICAgdGhpcy5wID0gbmV3IHU4KDApO1xuICAgICAgICBpZiAoZGljdClcbiAgICAgICAgICAgIHRoaXMuby5zZXQoZGljdCk7XG4gICAgfVxuICAgIEluZmxhdGUucHJvdG90eXBlLmUgPSBmdW5jdGlvbiAoYykge1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICBpZiAodGhpcy5kKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICBpZiAoIXRoaXMucC5sZW5ndGgpXG4gICAgICAgICAgICB0aGlzLnAgPSBjO1xuICAgICAgICBlbHNlIGlmIChjLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG4gPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGMubGVuZ3RoKTtcbiAgICAgICAgICAgIG4uc2V0KHRoaXMucCksIG4uc2V0KGMsIHRoaXMucC5sZW5ndGgpLCB0aGlzLnAgPSBuO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBJbmZsYXRlLnByb3RvdHlwZS5jID0gZnVuY3Rpb24gKGZpbmFsKSB7XG4gICAgICAgIHRoaXMucy5pID0gKyh0aGlzLmQgPSBmaW5hbCB8fCBmYWxzZSk7XG4gICAgICAgIHZhciBidHMgPSB0aGlzLnMuYjtcbiAgICAgICAgdmFyIGR0ID0gaW5mbHQodGhpcy5wLCB0aGlzLnMsIHRoaXMubyk7XG4gICAgICAgIHRoaXMub25kYXRhKHNsYyhkdCwgYnRzLCB0aGlzLnMuYiksIHRoaXMuZCk7XG4gICAgICAgIHRoaXMubyA9IHNsYyhkdCwgdGhpcy5zLmIgLSAzMjc2OCksIHRoaXMucy5iID0gdGhpcy5vLmxlbmd0aDtcbiAgICAgICAgdGhpcy5wID0gc2xjKHRoaXMucCwgKHRoaXMucy5wIC8gOCkgfCAwKSwgdGhpcy5zLnAgJj0gNztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGluZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgZmluYWwgY2h1bmtcbiAgICAgKi9cbiAgICBJbmZsYXRlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmUoY2h1bmspLCB0aGlzLmMoZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIEluZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgSW5mbGF0ZSB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jSW5mbGF0ZShvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiSW5mbHQsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIEluZmxhdGVdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgSW5mbGF0ZShldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA3LCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0luZmxhdGUgfTtcbmV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkluZmx0XG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYoaW5mbGF0ZVN5bmMoZXYuZGF0YVswXSwgZ29wdChldi5kYXRhWzFdKSkpOyB9LCAxLCBjYik7XG59XG5leHBvcnQgZnVuY3Rpb24gaW5mbGF0ZVN5bmMoZGF0YSwgb3B0cykge1xuICAgIHJldHVybiBpbmZsdChkYXRhLCB7IGk6IDIgfSwgb3B0cyAmJiBvcHRzLm91dCwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpO1xufVxuLy8gYmVmb3JlIHlvdSB5ZWxsIGF0IG1lIGZvciBub3QganVzdCB1c2luZyBleHRlbmRzLCBteSByZWFzb24gaXMgdGhhdCBUUyBpbmhlcml0YW5jZSBpcyBoYXJkIHRvIHdvcmtlcml6ZS5cbi8qKlxuICogU3RyZWFtaW5nIEdaSVAgY29tcHJlc3Npb25cbiAqL1xudmFyIEd6aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gR3ppcChvcHRzLCBjYikge1xuICAgICAgICB0aGlzLmMgPSBjcmMoKTtcbiAgICAgICAgdGhpcy5sID0gMDtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgRGVmbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgR1pJUHBlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBHemlwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmMucChjaHVuayk7XG4gICAgICAgIHRoaXMubCArPSBjaHVuay5sZW5ndGg7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgR3ppcC5wcm90b3R5cGUucCA9IGZ1bmN0aW9uIChjLCBmKSB7XG4gICAgICAgIHZhciByYXcgPSBkb3B0KGMsIHRoaXMubywgdGhpcy52ICYmIGd6aGwodGhpcy5vKSwgZiAmJiA4LCB0aGlzLnMpO1xuICAgICAgICBpZiAodGhpcy52KVxuICAgICAgICAgICAgZ3poKHJhdywgdGhpcy5vKSwgdGhpcy52ID0gMDtcbiAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gOCwgdGhpcy5jLmQoKSksIHdieXRlcyhyYXcsIHJhdy5sZW5ndGggLSA0LCB0aGlzLmwpO1xuICAgICAgICB0aGlzLm9uZGF0YShyYXcsIGYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRmx1c2hlcyBidWZmZXJlZCB1bmNvbXByZXNzZWQgZGF0YS4gVXNlZnVsIHRvIGltbWVkaWF0ZWx5IHJldHJpZXZlIHRoZVxuICAgICAqIEdaSVBwZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICogQHBhcmFtIHN5bmMgV2hldGhlciB0byBmbHVzaCB0byBhIGJ5dGUgYm91bmRhcnkuIEEgc3luYyBmbHVzaCB0YWtlcyA0LTVcbiAgICAgKiAgICAgICAgICAgICBleHRyYSBieXRlcywgYnV0IGd1YXJhbnRlZXMgYWxsIHB1c2hlZCBkYXRhIGlzIGltbWVkaWF0ZWx5XG4gICAgICogICAgICAgICAgICAgZGVjb21wcmVzc2libGUuXG4gICAgICovXG4gICAgR3ppcC5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoc3luYykge1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaC5jYWxsKHRoaXMsIHN5bmMpO1xuICAgIH07XG4gICAgcmV0dXJuIEd6aXA7XG59KCkpO1xuZXhwb3J0IHsgR3ppcCB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIEdaSVAgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jR3ppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0d6aXAob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICBnemUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGUsIEd6aXBdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgR3ppcChldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3ppcDtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0d6aXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBnemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkRmbHQsXG4gICAgICAgIGd6ZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6aXBTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGd6aXBTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMiwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzc2VzIGRhdGEgd2l0aCBHWklQXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBnemlwcGVkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGd6aXBTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgYyA9IGNyYygpLCBsID0gZGF0YS5sZW5ndGg7XG4gICAgYy5wKGRhdGEpO1xuICAgIHZhciBkID0gZG9wdChkYXRhLCBvcHRzLCBnemhsKG9wdHMpLCA4KSwgcyA9IGQubGVuZ3RoO1xuICAgIHJldHVybiBnemgoZCwgb3B0cyksIHdieXRlcyhkLCBzIC0gOCwgYy5kKCkpLCB3Ynl0ZXMoZCwgcyAtIDQsIGwpLCBkO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgc2luZ2xlIG9yIG11bHRpLW1lbWJlciBHWklQIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEd1bnppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBHdW56aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgdGhpcy5yID0gMDtcbiAgICAgICAgSW5mbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgR1VOWklQcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEd1bnppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuZS5jYWxsKHRoaXMsIGNodW5rKTtcbiAgICAgICAgdGhpcy5yICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMudikge1xuICAgICAgICAgICAgdmFyIHAgPSB0aGlzLnAuc3ViYXJyYXkodGhpcy52IC0gMSk7XG4gICAgICAgICAgICB2YXIgcyA9IHAubGVuZ3RoID4gMyA/IGd6cyhwKSA6IDQ7XG4gICAgICAgICAgICBpZiAocyA+IHAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaW5hbClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy52ID4gMSAmJiB0aGlzLm9ubWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbm1lbWJlcih0aGlzLnIgLSBwLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnAgPSBwLnN1YmFycmF5KHMpLCB0aGlzLnYgPSAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lY2Vzc2FyeSB0byBwcmV2ZW50IFRTIGZyb20gdXNpbmcgdGhlIGNsb3N1cmUgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHdvcmtlcml6YXRpb24gdG8gZnVuY3Rpb24gY29ycmVjdGx5XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCAwKTtcbiAgICAgICAgLy8gcHJvY2VzcyBjb25jYXRlbmF0ZWQgR1pJUFxuICAgICAgICBpZiAodGhpcy5zLmYgJiYgIXRoaXMucy5sKSB7XG4gICAgICAgICAgICB0aGlzLnYgPSBzaGZ0KHRoaXMucy5wKSArIDk7XG4gICAgICAgICAgICB0aGlzLnMgPSB7IGk6IDAgfTtcbiAgICAgICAgICAgIHRoaXMubyA9IG5ldyB1OCgwKTtcbiAgICAgICAgICAgIHRoaXMucHVzaChuZXcgdTgoMCksIGZpbmFsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuYy5jYWxsKHRoaXMsIGZpbmFsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEd1bnppcDtcbn0oKSk7XG5leHBvcnQgeyBHdW56aXAgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBzaW5nbGUgb3IgbXVsdGktbWVtYmVyIEdaSVAgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNHdW56aXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNHdW56aXAob3B0cywgY2IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgZ3V6ZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgSW5mbGF0ZSwgR3VuemlwXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IEd1bnppcChldi5kYXRhKTtcbiAgICAgICAgICAgIHN0cm0ub25tZW1iZXIgPSBmdW5jdGlvbiAob2Zmc2V0KSB7IHJldHVybiBwb3N0TWVzc2FnZShvZmZzZXQpOyB9O1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDksIDAsIGZ1bmN0aW9uIChvZmZzZXQpIHsgcmV0dXJuIF90aGlzLm9ubWVtYmVyICYmIF90aGlzLm9ubWVtYmVyKG9mZnNldCk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNHdW56aXA7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNHdW56aXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBndW56aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiSW5mbHQsXG4gICAgICAgIGd1emUsXG4gICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtndW56aXBTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGd1bnppcFN5bmMoZXYuZGF0YVswXSwgZXYuZGF0YVsxXSkpOyB9LCAzLCBjYik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgdmFyIHN0ID0gZ3pzKGRhdGEpO1xuICAgIGlmIChzdCArIDggPiBkYXRhLmxlbmd0aClcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIGd6aXAgZGF0YScpO1xuICAgIHJldHVybiBpbmZsdChkYXRhLnN1YmFycmF5KHN0LCAtOCksIHsgaTogMiB9LCBvcHRzICYmIG9wdHMub3V0IHx8IG5ldyB1OChnemwoZGF0YSkpLCBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSk7XG59XG4vKipcbiAqIFN0cmVhbWluZyBabGliIGNvbXByZXNzaW9uXG4gKi9cbnZhciBabGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFpsaWIob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gYWRsZXIoKTtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgRGVmbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgemxpYmJlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBabGliLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmMucChjaHVuayk7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgWmxpYi5wcm90b3R5cGUucCA9IGZ1bmN0aW9uIChjLCBmKSB7XG4gICAgICAgIHZhciByYXcgPSBkb3B0KGMsIHRoaXMubywgdGhpcy52ICYmICh0aGlzLm8uZGljdGlvbmFyeSA/IDYgOiAyKSwgZiAmJiA0LCB0aGlzLnMpO1xuICAgICAgICBpZiAodGhpcy52KVxuICAgICAgICAgICAgemxoKHJhdywgdGhpcy5vKSwgdGhpcy52ID0gMDtcbiAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5jLmQoKSk7XG4gICAgICAgIHRoaXMub25kYXRhKHJhdywgZik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGbHVzaGVzIGJ1ZmZlcmVkIHVuY29tcHJlc3NlZCBkYXRhLiBVc2VmdWwgdG8gaW1tZWRpYXRlbHkgcmV0cmlldmUgdGhlXG4gICAgICogemxpYmJlZCBvdXRwdXQgZm9yIHNtYWxsIGlucHV0cy5cbiAgICAgKiBAcGFyYW0gc3luYyBXaGV0aGVyIHRvIGZsdXNoIHRvIGEgYnl0ZSBib3VuZGFyeS4gQSBzeW5jIGZsdXNoIHRha2VzIDQtNVxuICAgICAqICAgICAgICAgICAgIGV4dHJhIGJ5dGVzLCBidXQgZ3VhcmFudGVlcyBhbGwgcHVzaGVkIGRhdGEgaXMgaW1tZWRpYXRlbHlcbiAgICAgKiAgICAgICAgICAgICBkZWNvbXByZXNzaWJsZS5cbiAgICAgKi9cbiAgICBabGliLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uIChzeW5jKSB7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLmZsdXNoLmNhbGwodGhpcywgc3luYyk7XG4gICAgfTtcbiAgICByZXR1cm4gWmxpYjtcbn0oKSk7XG5leHBvcnQgeyBabGliIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgWmxpYiBjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNabGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jWmxpYihvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiRGZsdCxcbiAgICAgICAgICAgIHpsZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgRGVmbGF0ZSwgWmxpYl07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBabGliKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDEwLCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jWmxpYjtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1psaWIgfTtcbmV4cG9ydCBmdW5jdGlvbiB6bGliKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkRmbHQsXG4gICAgICAgIHpsZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW3psaWJTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKHpsaWJTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgNCwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzcyBkYXRhIHdpdGggWmxpYlxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgemxpYi1jb21wcmVzc2VkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHpsaWJTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgYSA9IGFkbGVyKCk7XG4gICAgYS5wKGRhdGEpO1xuICAgIHZhciBkID0gZG9wdChkYXRhLCBvcHRzLCBvcHRzLmRpY3Rpb25hcnkgPyA2IDogMiwgNCk7XG4gICAgcmV0dXJuIHpsaChkLCBvcHRzKSwgd2J5dGVzKGQsIGQubGVuZ3RoIC0gNCwgYS5kKCkpLCBkO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgWmxpYiBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBVbnpsaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVW56bGliKG9wdHMsIGNiKSB7XG4gICAgICAgIEluZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgICAgIHRoaXMudiA9IG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5ID8gMiA6IDE7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIHVuemxpYmJlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBVbnpsaWIucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmUuY2FsbCh0aGlzLCBjaHVuayk7XG4gICAgICAgIGlmICh0aGlzLnYpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnAubGVuZ3RoIDwgNiAmJiAhZmluYWwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5wID0gdGhpcy5wLnN1YmFycmF5KHpscyh0aGlzLnAsIHRoaXMudiAtIDEpKSwgdGhpcy52ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnAubGVuZ3RoIDwgNClcbiAgICAgICAgICAgICAgICBlcnIoNiwgJ2ludmFsaWQgemxpYiBkYXRhJyk7XG4gICAgICAgICAgICB0aGlzLnAgPSB0aGlzLnAuc3ViYXJyYXkoMCwgLTQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lY2Vzc2FyeSB0byBwcmV2ZW50IFRTIGZyb20gdXNpbmcgdGhlIGNsb3N1cmUgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHdvcmtlcml6YXRpb24gdG8gZnVuY3Rpb24gY29ycmVjdGx5XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gVW56bGliO1xufSgpKTtcbmV4cG9ydCB7IFVuemxpYiB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIFpsaWIgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNVbnpsaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNVbnpsaWIob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkluZmx0LFxuICAgICAgICAgICAgenVsZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgSW5mbGF0ZSwgVW56bGliXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IFVuemxpYihldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCAxMSwgMCk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY1VuemxpYjtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1VuemxpYiB9O1xuZXhwb3J0IGZ1bmN0aW9uIHVuemxpYihkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdCxcbiAgICAgICAgenVsZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW3VuemxpYlN5bmNdOyB9XG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYodW56bGliU3luYyhldi5kYXRhWzBdLCBnb3B0KGV2LmRhdGFbMV0pKSk7IH0sIDUsIGNiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1bnpsaWJTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YS5zdWJhcnJheSh6bHMoZGF0YSwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpLCAtNCksIHsgaTogMiB9LCBvcHRzICYmIG9wdHMub3V0LCBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSk7XG59XG4vLyBEZWZhdWx0IGFsZ29yaXRobSBmb3IgY29tcHJlc3Npb24gKHVzZWQgYmVjYXVzZSBoYXZpbmcgYSBrbm93biBvdXRwdXQgc2l6ZSBhbGxvd3MgZmFzdGVyIGRlY29tcHJlc3Npb24pXG5leHBvcnQgeyBnemlwIGFzIGNvbXByZXNzLCBBc3luY0d6aXAgYXMgQXN5bmNDb21wcmVzcyB9O1xuZXhwb3J0IHsgZ3ppcFN5bmMgYXMgY29tcHJlc3NTeW5jLCBHemlwIGFzIENvbXByZXNzIH07XG4vKipcbiAqIFN0cmVhbWluZyBHWklQLCBabGliLCBvciByYXcgREVGTEFURSBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBEZWNvbXByZXNzID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERlY29tcHJlc3Mob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5vID0gU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSB8fCB7fTtcbiAgICAgICAgdGhpcy5HID0gR3VuemlwO1xuICAgICAgICB0aGlzLkkgPSBJbmZsYXRlO1xuICAgICAgICB0aGlzLlogPSBVbnpsaWI7XG4gICAgfVxuICAgIC8vIGluaXQgc3Vic3RyZWFtXG4gICAgLy8gb3ZlcnJpZGVuIGJ5IEFzeW5jRGVjb21wcmVzc1xuICAgIERlY29tcHJlc3MucHJvdG90eXBlLmkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMucy5vbmRhdGEgPSBmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKGRhdCwgZmluYWwpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVjb21wcmVzc2VkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlY29tcHJlc3MucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICghdGhpcy5zKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wICYmIHRoaXMucC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbiA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBuLnNldCh0aGlzLnApLCBuLnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5wID0gY2h1bms7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnMgPSAodGhpcy5wWzBdID09IDMxICYmIHRoaXMucFsxXSA9PSAxMzkgJiYgdGhpcy5wWzJdID09IDgpXG4gICAgICAgICAgICAgICAgICAgID8gbmV3IHRoaXMuRyh0aGlzLm8pXG4gICAgICAgICAgICAgICAgICAgIDogKCh0aGlzLnBbMF0gJiAxNSkgIT0gOCB8fCAodGhpcy5wWzBdID4+IDQpID4gNyB8fCAoKHRoaXMucFswXSA8PCA4IHwgdGhpcy5wWzFdKSAlIDMxKSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IHRoaXMuSSh0aGlzLm8pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyB0aGlzLloodGhpcy5vKTtcbiAgICAgICAgICAgICAgICB0aGlzLmkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnMucHVzaCh0aGlzLnAsIGZpbmFsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucy5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gRGVjb21wcmVzcztcbn0oKSk7XG5leHBvcnQgeyBEZWNvbXByZXNzIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNEZWNvbXByZXNzID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jRGVjb21wcmVzcyhvcHRzLCBjYikge1xuICAgICAgICBEZWNvbXByZXNzLmNhbGwodGhpcywgb3B0cywgY2IpO1xuICAgICAgICB0aGlzLnF1ZXVlZFNpemUgPSAwO1xuICAgICAgICB0aGlzLkcgPSBBc3luY0d1bnppcDtcbiAgICAgICAgdGhpcy5JID0gQXN5bmNJbmZsYXRlO1xuICAgICAgICB0aGlzLlogPSBBc3luY1VuemxpYjtcbiAgICB9XG4gICAgQXN5bmNEZWNvbXByZXNzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnMub25kYXRhID0gZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucy5vbmRyYWluID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgICAgIF90aGlzLnF1ZXVlZFNpemUgLT0gc2l6ZTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5vbmRyYWluKVxuICAgICAgICAgICAgICAgIF90aGlzLm9uZHJhaW4oc2l6ZSk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWNvbXByZXNzZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgQXN5bmNEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLnF1ZXVlZFNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBBc3luY0RlY29tcHJlc3M7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNEZWNvbXByZXNzIH07XG5leHBvcnQgZnVuY3Rpb24gZGVjb21wcmVzcyhkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiAoZGF0YVswXSA9PSAzMSAmJiBkYXRhWzFdID09IDEzOSAmJiBkYXRhWzJdID09IDgpXG4gICAgICAgID8gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICAgICAgOiB1bnpsaWIoZGF0YSwgb3B0cywgY2IpO1xufVxuLyoqXG4gKiBFeHBhbmRzIGNvbXByZXNzZWQgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGF0YSwgYXV0b21hdGljYWxseSBkZXRlY3RpbmcgdGhlIGZvcm1hdFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZGVjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGRlY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGRlY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXByZXNzU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIChkYXRhWzBdID09IDMxICYmIGRhdGFbMV0gPT0gMTM5ICYmIGRhdGFbMl0gPT0gOClcbiAgICAgICAgPyBndW56aXBTeW5jKGRhdGEsIG9wdHMpXG4gICAgICAgIDogKChkYXRhWzBdICYgMTUpICE9IDggfHwgKGRhdGFbMF0gPj4gNCkgPiA3IHx8ICgoZGF0YVswXSA8PCA4IHwgZGF0YVsxXSkgJSAzMSkpXG4gICAgICAgICAgICA/IGluZmxhdGVTeW5jKGRhdGEsIG9wdHMpXG4gICAgICAgICAgICA6IHVuemxpYlN5bmMoZGF0YSwgb3B0cyk7XG59XG4vLyBmbGF0dGVuIGEgZGlyZWN0b3J5IHN0cnVjdHVyZVxudmFyIGZsdG4gPSBmdW5jdGlvbiAoZCwgcCwgdCwgbykge1xuICAgIGZvciAodmFyIGsgaW4gZCkge1xuICAgICAgICB2YXIgdmFsID0gZFtrXSwgbiA9IHAgKyBrLCBvcCA9IG87XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpXG4gICAgICAgICAgICBvcCA9IG1yZyhvLCB2YWxbMV0pLCB2YWwgPSB2YWxbMF07XG4gICAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKSlcbiAgICAgICAgICAgIHRbbl0gPSBbdmFsLCBvcF07XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdFtuICs9ICcvJ10gPSBbbmV3IHU4KDApLCBvcF07XG4gICAgICAgICAgICBmbHRuKHZhbCwgbiwgdCwgbyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8gdGV4dCBlbmNvZGVyXG52YXIgdGUgPSB0eXBlb2YgVGV4dEVuY29kZXIgIT0gJ3VuZGVmaW5lZCcgJiYgLyojX19QVVJFX18qLyBuZXcgVGV4dEVuY29kZXIoKTtcbi8vIHRleHQgZGVjb2RlclxudmFyIHRkID0gdHlwZW9mIFRleHREZWNvZGVyICE9ICd1bmRlZmluZWQnICYmIC8qI19fUFVSRV9fKi8gbmV3IFRleHREZWNvZGVyKCk7XG4vLyB0ZXh0IGRlY29kZXIgc3RyZWFtXG52YXIgdGRzID0gMDtcbnRyeSB7XG4gICAgdGQuZGVjb2RlKGV0LCB7IHN0cmVhbTogdHJ1ZSB9KTtcbiAgICB0ZHMgPSAxO1xufVxuY2F0Y2ggKGUpIHsgfVxuLy8gZGVjb2RlIFVURjhcbnZhciBkdXRmOCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgZm9yICh2YXIgciA9ICcnLCBpID0gMDs7KSB7XG4gICAgICAgIHZhciBjID0gZFtpKytdO1xuICAgICAgICB2YXIgZWIgPSAoYyA+IDEyNykgKyAoYyA+IDIyMykgKyAoYyA+IDIzOSk7XG4gICAgICAgIGlmIChpICsgZWIgPiBkLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiB7IHM6IHIsIHI6IHNsYyhkLCBpIC0gMSkgfTtcbiAgICAgICAgaWYgKCFlYilcbiAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgICAgZWxzZSBpZiAoZWIgPT0gMykge1xuICAgICAgICAgICAgYyA9ICgoYyAmIDE1KSA8PCAxOCB8IChkW2krK10gJiA2MykgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKSAtIDY1NTM2LFxuICAgICAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NiB8IChjID4+IDEwKSwgNTYzMjAgfCAoYyAmIDEwMjMpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlYiAmIDEpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAzMSkgPDwgNiB8IChkW2krK10gJiA2MykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAxNSkgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKTtcbiAgICB9XG59O1xuLyoqXG4gKiBTdHJlYW1pbmcgVVRGLTggZGVjb2RpbmdcbiAqL1xudmFyIERlY29kZVVURjggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFVURi04IGRlY29kaW5nIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGRlY29kZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEZWNvZGVVVEY4KGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIGlmICh0ZHMpXG4gICAgICAgICAgICB0aGlzLnQgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29kZWQgZnJvbSBVVEYtOCBiaW5hcnlcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVjb2RlVVRGOC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgZmluYWwgPSAhIWZpbmFsO1xuICAgICAgICBpZiAodGhpcy50KSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YSh0aGlzLnQuZGVjb2RlKGNodW5rLCB7IHN0cmVhbTogdHJ1ZSB9KSwgZmluYWwpO1xuICAgICAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudC5kZWNvZGUoKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGVycig4KTtcbiAgICAgICAgICAgICAgICB0aGlzLnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICB2YXIgZGF0ID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjaHVuay5sZW5ndGgpO1xuICAgICAgICBkYXQuc2V0KHRoaXMucCk7XG4gICAgICAgIGRhdC5zZXQoY2h1bmssIHRoaXMucC5sZW5ndGgpO1xuICAgICAgICB2YXIgX2EgPSBkdXRmOChkYXQpLCBzID0gX2EucywgciA9IF9hLnI7XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHIubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGVycig4KTtcbiAgICAgICAgICAgIHRoaXMucCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gcjtcbiAgICAgICAgdGhpcy5vbmRhdGEocywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIERlY29kZVVURjg7XG59KCkpO1xuZXhwb3J0IHsgRGVjb2RlVVRGOCB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgVVRGLTggZW5jb2RpbmdcbiAqL1xudmFyIEVuY29kZVVURjggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFVURi04IGRlY29kaW5nIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGVuY29kZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBFbmNvZGVVVEY4KGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGVuY29kZWQgdG8gVVRGLThcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIHN0cmluZyBkYXRhIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRW5jb2RlVVRGOC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdGhpcy5vbmRhdGEoc3RyVG9VOChjaHVuayksIHRoaXMuZCA9IGZpbmFsIHx8IGZhbHNlKTtcbiAgICB9O1xuICAgIHJldHVybiBFbmNvZGVVVEY4O1xufSgpKTtcbmV4cG9ydCB7IEVuY29kZVVURjggfTtcbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXkgZm9yIHVzZSB3aXRoIGNvbXByZXNzaW9uL2RlY29tcHJlc3Npb24gbWV0aG9kc1xuICogQHBhcmFtIHN0ciBUaGUgc3RyaW5nIHRvIGVuY29kZVxuICogQHBhcmFtIGxhdGluMSBXaGV0aGVyIG9yIG5vdCB0byBpbnRlcnByZXQgdGhlIGRhdGEgYXMgTGF0aW4tMS4gVGhpcyBzaG91bGRcbiAqICAgICAgICAgICAgICAgbm90IG5lZWQgdG8gYmUgdHJ1ZSB1bmxlc3MgZGVjb2RpbmcgYSBiaW5hcnkgc3RyaW5nLlxuICogQHJldHVybnMgVGhlIHN0cmluZyBlbmNvZGVkIGluIFVURi04L0xhdGluLTEgYmluYXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJUb1U4KHN0ciwgbGF0aW4xKSB7XG4gICAgaWYgKGxhdGluMSkge1xuICAgICAgICB2YXIgYXJfMSA9IG5ldyB1OChzdHIubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBhcl8xW2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHJldHVybiBhcl8xO1xuICAgIH1cbiAgICBpZiAodGUpXG4gICAgICAgIHJldHVybiB0ZS5lbmNvZGUoc3RyKTtcbiAgICB2YXIgbCA9IHN0ci5sZW5ndGg7XG4gICAgdmFyIGFyID0gbmV3IHU4KHN0ci5sZW5ndGggKyAoc3RyLmxlbmd0aCA+PiAxKSk7XG4gICAgdmFyIGFpID0gMDtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICh2KSB7IGFyW2FpKytdID0gdjsgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAoYWkgKyA1ID4gYXIubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbiA9IG5ldyB1OChhaSArIDggKyAoKGwgLSBpKSA8PCAxKSk7XG4gICAgICAgICAgICBuLnNldChhcik7XG4gICAgICAgICAgICBhciA9IG47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGMgPCAxMjggfHwgbGF0aW4xKVxuICAgICAgICAgICAgdyhjKTtcbiAgICAgICAgZWxzZSBpZiAoYyA8IDIwNDgpXG4gICAgICAgICAgICB3KDE5MiB8IChjID4+IDYpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgICAgIGVsc2UgaWYgKGMgPiA1NTI5NSAmJiBjIDwgNTczNDQpXG4gICAgICAgICAgICBjID0gNjU1MzYgKyAoYyAmIDEwMjMgPDwgMTApIHwgKHN0ci5jaGFyQ29kZUF0KCsraSkgJiAxMDIzKSxcbiAgICAgICAgICAgICAgICB3KDI0MCB8IChjID4+IDE4KSksIHcoMTI4IHwgKChjID4+IDEyKSAmIDYzKSksIHcoMTI4IHwgKChjID4+IDYpICYgNjMpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHcoMjI0IHwgKGMgPj4gMTIpKSwgdygxMjggfCAoKGMgPj4gNikgJiA2MykpLCB3KDEyOCB8IChjICYgNjMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHNsYyhhciwgMCwgYWkpO1xufVxuLyoqXG4gKiBDb252ZXJ0cyBhIFVpbnQ4QXJyYXkgdG8gYSBzdHJpbmdcbiAqIEBwYXJhbSBkYXQgVGhlIGRhdGEgdG8gZGVjb2RlIHRvIHN0cmluZ1xuICogQHBhcmFtIGxhdGluMSBXaGV0aGVyIG9yIG5vdCB0byBpbnRlcnByZXQgdGhlIGRhdGEgYXMgTGF0aW4tMS4gVGhpcyBzaG91bGRcbiAqICAgICAgICAgICAgICAgbm90IG5lZWQgdG8gYmUgdHJ1ZSB1bmxlc3MgZW5jb2RpbmcgdG8gYmluYXJ5IHN0cmluZy5cbiAqIEByZXR1cm5zIFRoZSBvcmlnaW5hbCBVVEYtOC9MYXRpbi0xIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyRnJvbVU4KGRhdCwgbGF0aW4xKSB7XG4gICAgaWYgKGxhdGluMSkge1xuICAgICAgICB2YXIgciA9ICcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdC5sZW5ndGg7IGkgKz0gMTYzODQpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgZGF0LnN1YmFycmF5KGksIGkgKyAxNjM4NCkpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgZWxzZSBpZiAodGQpIHtcbiAgICAgICAgcmV0dXJuIHRkLmRlY29kZShkYXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIF9hID0gZHV0ZjgoZGF0KSwgcyA9IF9hLnMsIHIgPSBfYS5yO1xuICAgICAgICBpZiAoci5sZW5ndGgpXG4gICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbn1cbjtcbi8vIGRlZmxhdGUgYml0IGZsYWdcbnZhciBkYmYgPSBmdW5jdGlvbiAobCkgeyByZXR1cm4gbCA9PSAxID8gMyA6IGwgPCA2ID8gMiA6IGwgPT0gOSA/IDEgOiAwOyB9O1xuLy8gc2tpcCBsb2NhbCB6aXAgaGVhZGVyXG52YXIgc2x6aCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiBiICsgMzAgKyBiMihkLCBiICsgMjYpICsgYjIoZCwgYiArIDI4KTsgfTtcbi8vIHJlYWQgemlwIGhlYWRlclxudmFyIHpoID0gZnVuY3Rpb24gKGQsIGIsIHopIHtcbiAgICB2YXIgZm5sID0gYjIoZCwgYiArIDI4KSwgZWZsID0gYjIoZCwgYiArIDMwKSwgZm4gPSBzdHJGcm9tVTgoZC5zdWJhcnJheShiICsgNDYsIGIgKyA0NiArIGZubCksICEoYjIoZCwgYiArIDgpICYgMjA0OCkpLCBlcyA9IGIgKyA0NiArIGZubDtcbiAgICB2YXIgX2EgPSB6NjRocyhkLCBlcywgZWZsLCB6LCBiNChkLCBiICsgMjApLCBiNChkLCBiICsgMjQpLCBiNChkLCBiICsgNDIpKSwgc2MgPSBfYVswXSwgc3UgPSBfYVsxXSwgb2ZmID0gX2FbMl07XG4gICAgcmV0dXJuIFtiMihkLCBiICsgMTApLCBzYywgc3UsIGZuLCBlcyArIGVmbCArIGIyKGQsIGIgKyAzMiksIG9mZl07XG59O1xuLy8gcmVhZCB6aXA2NCBoZWFkZXIgc2l6ZXNcbnZhciB6NjRocyA9IGZ1bmN0aW9uIChkLCBiLCBsLCB6LCBzYywgc3UsIG9mZikge1xuICAgIHZhciBuc2MgPSBzYyA9PSA0Mjk0OTY3Mjk1LCBuc3UgPSBzdSA9PSA0Mjk0OTY3Mjk1LCBub2ZmID0gb2ZmID09IDQyOTQ5NjcyOTUsIGUgPSBiICsgbDtcbiAgICB2YXIgbmYgPSBuc2MgKyBuc3UgKyBub2ZmO1xuICAgIGlmICh6ICYmIG5mKSB7XG4gICAgICAgIGZvciAoOyBiICsgNCA8IGU7IGIgKz0gNCArIGIyKGQsIGIgKyAyKSkge1xuICAgICAgICAgICAgaWYgKGIyKGQsIGIpID09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBuc2MgPyBiOChkLCBiICsgNCArIDggKiBuc3UpIDogc2MsXG4gICAgICAgICAgICAgICAgICAgIG5zdSA/IGI4KGQsIGIgKyA0KSA6IHN1LFxuICAgICAgICAgICAgICAgICAgICBub2ZmID8gYjgoZCwgYiArIDQgKyA4ICogKG5zdSArIG5zYykpIDogb2ZmLFxuICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyB6ID09IDIgZm9yIHVua25vd24gd2hldGhlciBvciBub3QgemlwNjRcbiAgICAgICAgaWYgKHogPCAyKVxuICAgICAgICAgICAgZXJyKDEzKTtcbiAgICB9XG4gICAgcmV0dXJuIFtzYywgc3UsIG9mZiwgMF07XG59O1xuLy8gZXh0cmEgZmllbGQgbGVuZ3RoXG52YXIgZXhmbCA9IGZ1bmN0aW9uIChleCkge1xuICAgIHZhciBsZSA9IDA7XG4gICAgaWYgKGV4KSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBsID0gZXhba10ubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGwgPiA2NTUzNSlcbiAgICAgICAgICAgICAgICBlcnIoOSk7XG4gICAgICAgICAgICBsZSArPSBsICsgNDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGU7XG59O1xuLy8gd3JpdGUgemlwIGhlYWRlclxudmFyIHd6aCA9IGZ1bmN0aW9uIChkLCBiLCBmLCBmbiwgdSwgYywgY2UsIGNvKSB7XG4gICAgdmFyIGZsID0gZm4ubGVuZ3RoLCBleCA9IGYuZXh0cmEsIGNvbCA9IGNvICYmIGNvLmxlbmd0aDtcbiAgICB2YXIgZXhsID0gZXhmbChleCk7XG4gICAgd2J5dGVzKGQsIGIsIGNlICE9IG51bGwgPyAweDIwMTRCNTAgOiAweDQwMzRCNTApLCBiICs9IDQ7XG4gICAgaWYgKGNlICE9IG51bGwpXG4gICAgICAgIGRbYisrXSA9IDIwLCBkW2IrK10gPSBmLm9zO1xuICAgIGRbYl0gPSAyMCwgYiArPSAyOyAvLyBzcGVjIGNvbXBsaWFuY2U/IHdoYXQncyB0aGF0P1xuICAgIGRbYisrXSA9IChmLmZsYWcgPDwgMSkgfCAoYyA8IDAgJiYgOCksIGRbYisrXSA9IHUgJiYgODtcbiAgICBkW2IrK10gPSBmLmNvbXByZXNzaW9uICYgMjU1LCBkW2IrK10gPSBmLmNvbXByZXNzaW9uID4+IDg7XG4gICAgdmFyIGR0ID0gbmV3IERhdGUoZi5tdGltZSA9PSBudWxsID8gRGF0ZS5ub3coKSA6IGYubXRpbWUpLCB5ID0gZHQuZ2V0RnVsbFllYXIoKSAtIDE5ODA7XG4gICAgaWYgKHkgPCAwIHx8IHkgPiAxMTkpXG4gICAgICAgIGVycigxMCk7XG4gICAgd2J5dGVzKGQsIGIsICh5IDw8IDI1KSB8ICgoZHQuZ2V0TW9udGgoKSArIDEpIDw8IDIxKSB8IChkdC5nZXREYXRlKCkgPDwgMTYpIHwgKGR0LmdldEhvdXJzKCkgPDwgMTEpIHwgKGR0LmdldE1pbnV0ZXMoKSA8PCA1KSB8IChkdC5nZXRTZWNvbmRzKCkgPj4gMSkpLCBiICs9IDQ7XG4gICAgaWYgKGMgIT0gLTEpIHtcbiAgICAgICAgd2J5dGVzKGQsIGIsIGYuY3JjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA0LCBjIDwgMCA/IC1jIC0gMiA6IGMpO1xuICAgICAgICB3Ynl0ZXMoZCwgYiArIDgsIGYuc2l6ZSk7XG4gICAgfVxuICAgIHdieXRlcyhkLCBiICsgMTIsIGZsKTtcbiAgICB3Ynl0ZXMoZCwgYiArIDE0LCBleGwpLCBiICs9IDE2O1xuICAgIGlmIChjZSAhPSBudWxsKSB7XG4gICAgICAgIHdieXRlcyhkLCBiLCBjb2wpO1xuICAgICAgICB3Ynl0ZXMoZCwgYiArIDYsIGYuYXR0cnMpO1xuICAgICAgICB3Ynl0ZXMoZCwgYiArIDEwLCBjZSksIGIgKz0gMTQ7XG4gICAgfVxuICAgIGQuc2V0KGZuLCBiKTtcbiAgICBiICs9IGZsO1xuICAgIGlmIChleGwpIHtcbiAgICAgICAgZm9yICh2YXIgayBpbiBleCkge1xuICAgICAgICAgICAgdmFyIGV4ZiA9IGV4W2tdLCBsID0gZXhmLmxlbmd0aDtcbiAgICAgICAgICAgIHdieXRlcyhkLCBiLCArayk7XG4gICAgICAgICAgICB3Ynl0ZXMoZCwgYiArIDIsIGwpO1xuICAgICAgICAgICAgZC5zZXQoZXhmLCBiICsgNCksIGIgKz0gNCArIGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbClcbiAgICAgICAgZC5zZXQoY28sIGIpLCBiICs9IGNvbDtcbiAgICByZXR1cm4gYjtcbn07XG4vLyB3cml0ZSB6aXAgZm9vdGVyIChlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnkpXG52YXIgd3pmID0gZnVuY3Rpb24gKG8sIGIsIGMsIGQsIGUpIHtcbiAgICB3Ynl0ZXMobywgYiwgMHg2MDU0QjUwKTsgLy8gc2tpcCBkaXNrXG4gICAgd2J5dGVzKG8sIGIgKyA4LCBjKTtcbiAgICB3Ynl0ZXMobywgYiArIDEwLCBjKTtcbiAgICB3Ynl0ZXMobywgYiArIDEyLCBkKTtcbiAgICB3Ynl0ZXMobywgYiArIDE2LCBlKTtcbn07XG4vKipcbiAqIEEgcGFzcy10aHJvdWdoIHN0cmVhbSB0byBrZWVwIGRhdGEgdW5jb21wcmVzc2VkIGluIGEgWklQIGFyY2hpdmUuXG4gKi9cbnZhciBaaXBQYXNzVGhyb3VnaCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgcGFzcy10aHJvdWdoIHN0cmVhbSB0aGF0IGNhbiBiZSBhZGRlZCB0byBaSVAgYXJjaGl2ZXNcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgZGF0YSBzdHJlYW1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBaaXBQYXNzVGhyb3VnaChmaWxlbmFtZSkge1xuICAgICAgICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG4gICAgICAgIHRoaXMuYyA9IGNyYygpO1xuICAgICAgICB0aGlzLnNpemUgPSAwO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIGEgY2h1bmsgYW5kIHB1c2hlcyB0byB0aGUgb3V0cHV0IHN0cmVhbS4gWW91IGNhbiBvdmVycmlkZSB0aGlzXG4gICAgICogbWV0aG9kIGluIGEgc3ViY2xhc3MgZm9yIGN1c3RvbSBiZWhhdmlvciwgYnV0IGJ5IGRlZmF1bHQgdGhpcyBwYXNzZXNcbiAgICAgKiB0aGUgZGF0YSB0aHJvdWdoLiBZb3UgbXVzdCBjYWxsIHRoaXMub25kYXRhKGVyciwgY2h1bmssIGZpbmFsKSBhdCBzb21lXG4gICAgICogcG9pbnQgaW4gdGhpcyBtZXRob2QuXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwcm9jZXNzXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLm9uZGF0YShudWxsLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgYWRkZWQuIElmIHlvdSBhcmUgc3ViY2xhc3NpbmcgdGhpcyB3aXRoIGEgY3VzdG9tXG4gICAgICogY29tcHJlc3Npb24gYWxnb3JpdGhtLCBub3RlIHRoYXQgeW91IG11c3QgcHVzaCBkYXRhIGZyb20gdGhlIHNvdXJjZVxuICAgICAqIGZpbGUgb25seSwgcHJlLWNvbXByZXNzaW9uLlxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICB0aGlzLnNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBpZiAoZmluYWwpXG4gICAgICAgICAgICB0aGlzLmNyYyA9IHRoaXMuYy5kKCk7XG4gICAgICAgIC8vIHdlIHNob3VsZG4ndCByZWFsbHkgZG8gdGhpcyBjYXN0LCBidXQgcHJvcGVybHkgaGFuZGxpbmcgQXJyYXlCdWZmZXJMaWtlXG4gICAgICAgIC8vIG1ha2VzIHRoZSBBUEkgdW5lcmdvbm9taWMgd2l0aCBCdWZmZXJcbiAgICAgICAgdGhpcy5wcm9jZXNzKGNodW5rLCBmaW5hbCB8fCBmYWxzZSk7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwUGFzc1Rocm91Z2g7XG59KCkpO1xuZXhwb3J0IHsgWmlwUGFzc1Rocm91Z2ggfTtcbi8vIEkgZG9uJ3QgZXh0ZW5kIGJlY2F1c2UgVHlwZVNjcmlwdCBleHRlbnNpb24gYWRkcyAxa0Igb2YgcnVudGltZSBibG9hdFxuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzLiBQcmVmZXIgdXNpbmcgQXN5bmNaaXBEZWZsYXRlXG4gKiBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gKi9cbnZhciBaaXBEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBERUZMQVRFIHN0cmVhbSB0aGF0IGNhbiBiZSBhZGRlZCB0byBaSVAgYXJjaGl2ZXNcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgZGF0YSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFppcERlZmxhdGUoZmlsZW5hbWUsIG9wdHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCFvcHRzKVxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICBaaXBQYXNzVGhyb3VnaC5jYWxsKHRoaXMsIGZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5kID0gbmV3IERlZmxhdGUob3B0cywgZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29tcHJlc3Npb24gPSA4O1xuICAgICAgICB0aGlzLmZsYWcgPSBkYmYob3B0cy5sZXZlbCk7XG4gICAgfVxuICAgIFppcERlZmxhdGUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmQucHVzaChjaHVuaywgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlLCBudWxsLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFppcERlZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBaaXBEZWZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IFppcERlZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXNcbiAqL1xudmFyIEFzeW5jWmlwRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBERUZMQVRFIHN0cmVhbSB0aGF0IGNhbiBiZSBhZGRlZCB0byBaSVAgYXJjaGl2ZXNcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgVGhlIGZpbGVuYW1lIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgZGF0YSBzdHJlYW1cbiAgICAgKiBAcGFyYW0gb3B0cyBUaGUgY29tcHJlc3Npb24gb3B0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFzeW5jWmlwRGVmbGF0ZShmaWxlbmFtZSwgb3B0cykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIW9wdHMpXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLmNhbGwodGhpcywgZmlsZW5hbWUpO1xuICAgICAgICB0aGlzLmQgPSBuZXcgQXN5bmNEZWZsYXRlKG9wdHMsIGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDg7XG4gICAgICAgIHRoaXMuZmxhZyA9IGRiZihvcHRzLmxldmVsKTtcbiAgICAgICAgdGhpcy50ZXJtaW5hdGUgPSB0aGlzLmQudGVybWluYXRlO1xuICAgIH1cbiAgICBBc3luY1ppcERlZmxhdGUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRoaXMuZC5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWZsYXRlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBBc3luY1ppcERlZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBBc3luY1ppcERlZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNaaXBEZWZsYXRlIH07XG4vLyBUT0RPOiBCZXR0ZXIgdHJlZSBzaGFraW5nXG4vKipcbiAqIEEgemlwcGFibGUgYXJjaGl2ZSB0byB3aGljaCBmaWxlcyBjYW4gaW5jcmVtZW50YWxseSBiZSBhZGRlZFxuICovXG52YXIgWmlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgWklQIGFyY2hpdmUgdG8gd2hpY2ggZmlsZXMgY2FuIGJlIGFkZGVkXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGRhdGEgZm9yIHRoZSBnZW5lcmF0ZWQgWklQIGFyY2hpdmVcbiAgICAgKiAgICAgICAgICAgaXMgYXZhaWxhYmxlXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwKGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIHRoaXMudSA9IFtdO1xuICAgICAgICB0aGlzLmQgPSAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZmlsZSB0byB0aGUgWklQIGFyY2hpdmVcbiAgICAgKiBAcGFyYW0gZmlsZSBUaGUgZmlsZSBzdHJlYW0gdG8gYWRkXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMub25kYXRhKVxuICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICAvLyBmaW5pc2hpbmcgb3IgZmluaXNoZWRcbiAgICAgICAgaWYgKHRoaXMuZCAmIDIpXG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlcnIoNCArICh0aGlzLmQgJiAxKSAqIDgsIDAsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGYgPSBzdHJUb1U4KGZpbGUuZmlsZW5hbWUpLCBmbF8xID0gZi5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgY29tID0gZmlsZS5jb21tZW50LCBvID0gY29tICYmIHN0clRvVTgoY29tKTtcbiAgICAgICAgICAgIHZhciB1ID0gZmxfMSAhPSBmaWxlLmZpbGVuYW1lLmxlbmd0aCB8fCAobyAmJiAoY29tLmxlbmd0aCAhPSBvLmxlbmd0aCkpO1xuICAgICAgICAgICAgdmFyIGhsXzEgPSBmbF8xICsgZXhmbChmaWxlLmV4dHJhKSArIDMwO1xuICAgICAgICAgICAgaWYgKGZsXzEgPiA2NTUzNSlcbiAgICAgICAgICAgICAgICB0aGlzLm9uZGF0YShlcnIoMTEsIDAsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gbmV3IHU4KGhsXzEpO1xuICAgICAgICAgICAgd3poKGhlYWRlciwgMCwgZmlsZSwgZiwgdSwgLTEpO1xuICAgICAgICAgICAgdmFyIGNoa3NfMSA9IFtoZWFkZXJdO1xuICAgICAgICAgICAgdmFyIHBBbGxfMSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNoa3NfMiA9IGNoa3NfMTsgX2kgPCBjaGtzXzIubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGsgPSBjaGtzXzJbX2ldO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgY2hrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNoa3NfMSA9IFtdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0cl8xID0gdGhpcy5kO1xuICAgICAgICAgICAgdGhpcy5kID0gMDtcbiAgICAgICAgICAgIHZhciBpbmRfMSA9IHRoaXMudS5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdWZfMSA9IG1yZyhmaWxlLCB7XG4gICAgICAgICAgICAgICAgZjogZixcbiAgICAgICAgICAgICAgICB1OiB1LFxuICAgICAgICAgICAgICAgIG86IG8sXG4gICAgICAgICAgICAgICAgdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS50ZXJtaW5hdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBwQWxsXzEoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBueHQgPSBfdGhpcy51W2luZF8xICsgMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54dC5yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJfMSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY2xfMSA9IDA7XG4gICAgICAgICAgICBmaWxlLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNsXzEgKz0gZGF0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgY2hrc18xLnB1c2goZGF0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGQgPSBuZXcgdTgoMTYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCAwLCAweDgwNzRCNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCA0LCBmaWxlLmNyYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3Ynl0ZXMoZGQsIDgsIGNsXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2J5dGVzKGRkLCAxMiwgZmlsZS5zaXplKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoa3NfMS5wdXNoKGRkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVmXzEuYyA9IGNsXzEsIHVmXzEuYiA9IGhsXzEgKyBjbF8xICsgMTYsIHVmXzEuY3JjID0gZmlsZS5jcmMsIHVmXzEuc2l6ZSA9IGZpbGUuc2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cl8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVmXzEucigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJfMSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHJfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHBBbGxfMSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnUucHVzaCh1Zl8xKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRW5kcyB0aGUgcHJvY2VzcyBvZiBhZGRpbmcgZmlsZXMgYW5kIHByZXBhcmVzIHRvIGVtaXQgdGhlIGZpbmFsIGNodW5rcy5cbiAgICAgKiBUaGlzICptdXN0KiBiZSBjYWxsZWQgYWZ0ZXIgYWRkaW5nIGFsbCBkZXNpcmVkIGZpbGVzIGZvciB0aGUgcmVzdWx0aW5nXG4gICAgICogWklQIGZpbGUgdG8gd29yayBwcm9wZXJseS5cbiAgICAgKi9cbiAgICBaaXAucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuZCAmIDIpIHtcbiAgICAgICAgICAgIHRoaXMub25kYXRhKGVycig0ICsgKHRoaXMuZCAmIDEpICogOCwgMCwgMSksIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICB0aGlzLmUoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy51LnB1c2goe1xuICAgICAgICAgICAgICAgIHI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoX3RoaXMuZCAmIDEpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy51LnNwbGljZSgtMSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHQ6IGZ1bmN0aW9uICgpIHsgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZCA9IDM7XG4gICAgfTtcbiAgICBaaXAucHJvdG90eXBlLmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBidCA9IDAsIGwgPSAwLCB0bCA9IDA7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9hW19pXTtcbiAgICAgICAgICAgIHRsICs9IDQ2ICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSkgKyAoZi5vID8gZi5vLmxlbmd0aCA6IDApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBvdXQgPSBuZXcgdTgodGwgKyAyMik7XG4gICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLnU7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9jW19iXTtcbiAgICAgICAgICAgIHd6aChvdXQsIGJ0LCBmLCBmLmYsIGYudSwgLWYuYyAtIDIsIGwsIGYubyk7XG4gICAgICAgICAgICBidCArPSA0NiArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpICsgKGYubyA/IGYuby5sZW5ndGggOiAwKSwgbCArPSBmLmI7XG4gICAgICAgIH1cbiAgICAgICAgd3pmKG91dCwgYnQsIHRoaXMudS5sZW5ndGgsIHRsLCBsKTtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgb3V0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5kID0gMjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEEgbWV0aG9kIHRvIHRlcm1pbmF0ZSBhbnkgaW50ZXJuYWwgd29ya2VycyB1c2VkIGJ5IHRoZSBzdHJlYW0uIFN1YnNlcXVlbnRcbiAgICAgKiBjYWxscyB0byBhZGQoKSB3aWxsIGZhaWwuXG4gICAgICovXG4gICAgWmlwLnByb3RvdHlwZS50ZXJtaW5hdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLnU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgZiA9IF9hW19pXTtcbiAgICAgICAgICAgIGYudCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZCA9IDI7XG4gICAgfTtcbiAgICByZXR1cm4gWmlwO1xufSgpKTtcbmV4cG9ydCB7IFppcCB9O1xuZXhwb3J0IGZ1bmN0aW9uIHppcChkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHZhciByID0ge307XG4gICAgZmx0bihkYXRhLCAnJywgciwgb3B0cyk7XG4gICAgdmFyIGsgPSBPYmplY3Qua2V5cyhyKTtcbiAgICB2YXIgbGZ0ID0gay5sZW5ndGgsIG8gPSAwLCB0b3QgPSAwO1xuICAgIHZhciBzbGZ0ID0gbGZ0LCBmaWxlcyA9IG5ldyBBcnJheShsZnQpO1xuICAgIHZhciB0ZXJtID0gW107XG4gICAgdmFyIHRBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVybS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIHRlcm1baV0oKTtcbiAgICB9O1xuICAgIHZhciBjYmQgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBtdChmdW5jdGlvbiAoKSB7IGNiKGEsIGIpOyB9KTtcbiAgICB9O1xuICAgIG10KGZ1bmN0aW9uICgpIHsgY2JkID0gY2I7IH0pO1xuICAgIHZhciBjYmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvdXQgPSBuZXcgdTgodG90ICsgMjIpLCBvZSA9IG8sIGNkbCA9IHRvdCAtIG87XG4gICAgICAgIHRvdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xmdDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGZpbGVzW2ldO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgbCA9IGYuYy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgd3poKG91dCwgdG90LCBmLCBmLmYsIGYudSwgbCk7XG4gICAgICAgICAgICAgICAgdmFyIGJhZGQgPSAzMCArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpO1xuICAgICAgICAgICAgICAgIHZhciBsb2MgPSB0b3QgKyBiYWRkO1xuICAgICAgICAgICAgICAgIG91dC5zZXQoZi5jLCBsb2MpO1xuICAgICAgICAgICAgICAgIHd6aChvdXQsIG8sIGYsIGYuZiwgZi51LCBsLCB0b3QsIGYubSksIG8gKz0gMTYgKyBiYWRkICsgKGYubSA/IGYubS5sZW5ndGggOiAwKSwgdG90ID0gbG9jICsgbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3emYob3V0LCBvLCBmaWxlcy5sZW5ndGgsIGNkbCwgb2UpO1xuICAgICAgICBjYmQobnVsbCwgb3V0KTtcbiAgICB9O1xuICAgIGlmICghbGZ0KVxuICAgICAgICBjYmYoKTtcbiAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciBmbiA9IGtbaV07XG4gICAgICAgIHZhciBfYSA9IHJbZm5dLCBmaWxlID0gX2FbMF0sIHAgPSBfYVsxXTtcbiAgICAgICAgdmFyIGMgPSBjcmMoKSwgc2l6ZSA9IGZpbGUubGVuZ3RoO1xuICAgICAgICBjLnAoZmlsZSk7XG4gICAgICAgIHZhciBmID0gc3RyVG9VOChmbiksIHMgPSBmLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbSA9IHAuY29tbWVudCwgbSA9IGNvbSAmJiBzdHJUb1U4KGNvbSksIG1zID0gbSAmJiBtLmxlbmd0aDtcbiAgICAgICAgdmFyIGV4bCA9IGV4ZmwocC5leHRyYSk7XG4gICAgICAgIHZhciBjb21wcmVzc2lvbiA9IHAubGV2ZWwgPT0gMCA/IDAgOiA4O1xuICAgICAgICB2YXIgY2JsID0gZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICAgICAgdEFsbCgpO1xuICAgICAgICAgICAgICAgIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsID0gZC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZmlsZXNbaV0gPSBtcmcocCwge1xuICAgICAgICAgICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICBjcmM6IGMuZCgpLFxuICAgICAgICAgICAgICAgICAgICBjOiBkLFxuICAgICAgICAgICAgICAgICAgICBmOiBmLFxuICAgICAgICAgICAgICAgICAgICBtOiBtLFxuICAgICAgICAgICAgICAgICAgICB1OiBzICE9IGZuLmxlbmd0aCB8fCAobSAmJiAoY29tLmxlbmd0aCAhPSBtcykpLFxuICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2lvbjogY29tcHJlc3Npb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvICs9IDMwICsgcyArIGV4bCArIGw7XG4gICAgICAgICAgICAgICAgdG90ICs9IDc2ICsgMiAqIChzICsgZXhsKSArIChtcyB8fCAwKSArIGw7XG4gICAgICAgICAgICAgICAgaWYgKCEtLWxmdClcbiAgICAgICAgICAgICAgICAgICAgY2JmKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzID4gNjU1MzUpXG4gICAgICAgICAgICBjYmwoZXJyKDExLCAwLCAxKSwgbnVsbCk7XG4gICAgICAgIGlmICghY29tcHJlc3Npb24pXG4gICAgICAgICAgICBjYmwobnVsbCwgZmlsZSk7XG4gICAgICAgIGVsc2UgaWYgKHNpemUgPCAxNjAwMDApIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2JsKG51bGwsIGRlZmxhdGVTeW5jKGZpbGUsIHApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY2JsKGUsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRlcm0ucHVzaChkZWZsYXRlKGZpbGUsIHAsIGNibCkpO1xuICAgIH07XG4gICAgLy8gQ2Fubm90IHVzZSBsZnQgYmVjYXVzZSBpdCBjYW4gZGVjcmVhc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsZnQ7ICsraSkge1xuICAgICAgICBfbG9vcF8xKGkpO1xuICAgIH1cbiAgICByZXR1cm4gdEFsbDtcbn1cbi8qKlxuICogU3luY2hyb25vdXNseSBjcmVhdGVzIGEgWklQIGZpbGUuIFByZWZlciB1c2luZyBgemlwYCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gKiB3aXRoIG1vcmUgdGhhbiBvbmUgZmlsZS5cbiAqIEBwYXJhbSBkYXRhIFRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIGZvciB0aGUgWklQIGFyY2hpdmVcbiAqIEBwYXJhbSBvcHRzIFRoZSBtYWluIG9wdGlvbnMsIG1lcmdlZCB3aXRoIHBlci1maWxlIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBnZW5lcmF0ZWQgWklQIGFyY2hpdmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIGlmICghb3B0cylcbiAgICAgICAgb3B0cyA9IHt9O1xuICAgIHZhciByID0ge307XG4gICAgdmFyIGZpbGVzID0gW107XG4gICAgZmx0bihkYXRhLCAnJywgciwgb3B0cyk7XG4gICAgdmFyIG8gPSAwO1xuICAgIHZhciB0b3QgPSAwO1xuICAgIGZvciAodmFyIGZuIGluIHIpIHtcbiAgICAgICAgdmFyIF9hID0gcltmbl0sIGZpbGUgPSBfYVswXSwgcCA9IF9hWzFdO1xuICAgICAgICB2YXIgY29tcHJlc3Npb24gPSBwLmxldmVsID09IDAgPyAwIDogODtcbiAgICAgICAgdmFyIGYgPSBzdHJUb1U4KGZuKSwgcyA9IGYubGVuZ3RoO1xuICAgICAgICB2YXIgY29tID0gcC5jb21tZW50LCBtID0gY29tICYmIHN0clRvVTgoY29tKSwgbXMgPSBtICYmIG0ubGVuZ3RoO1xuICAgICAgICB2YXIgZXhsID0gZXhmbChwLmV4dHJhKTtcbiAgICAgICAgaWYgKHMgPiA2NTUzNSlcbiAgICAgICAgICAgIGVycigxMSk7XG4gICAgICAgIHZhciBkID0gY29tcHJlc3Npb24gPyBkZWZsYXRlU3luYyhmaWxlLCBwKSA6IGZpbGUsIGwgPSBkLmxlbmd0aDtcbiAgICAgICAgdmFyIGMgPSBjcmMoKTtcbiAgICAgICAgYy5wKGZpbGUpO1xuICAgICAgICBmaWxlcy5wdXNoKG1yZyhwLCB7XG4gICAgICAgICAgICBzaXplOiBmaWxlLmxlbmd0aCxcbiAgICAgICAgICAgIGNyYzogYy5kKCksXG4gICAgICAgICAgICBjOiBkLFxuICAgICAgICAgICAgZjogZixcbiAgICAgICAgICAgIG06IG0sXG4gICAgICAgICAgICB1OiBzICE9IGZuLmxlbmd0aCB8fCAobSAmJiAoY29tLmxlbmd0aCAhPSBtcykpLFxuICAgICAgICAgICAgbzogbyxcbiAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjb21wcmVzc2lvblxuICAgICAgICB9KSk7XG4gICAgICAgIG8gKz0gMzAgKyBzICsgZXhsICsgbDtcbiAgICAgICAgdG90ICs9IDc2ICsgMiAqIChzICsgZXhsKSArIChtcyB8fCAwKSArIGw7XG4gICAgfVxuICAgIHZhciBvdXQgPSBuZXcgdTgodG90ICsgMjIpLCBvZSA9IG8sIGNkbCA9IHRvdCAtIG87XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgZiA9IGZpbGVzW2ldO1xuICAgICAgICB3emgob3V0LCBmLm8sIGYsIGYuZiwgZi51LCBmLmMubGVuZ3RoKTtcbiAgICAgICAgdmFyIGJhZGQgPSAzMCArIGYuZi5sZW5ndGggKyBleGZsKGYuZXh0cmEpO1xuICAgICAgICBvdXQuc2V0KGYuYywgZi5vICsgYmFkZCk7XG4gICAgICAgIHd6aChvdXQsIG8sIGYsIGYuZiwgZi51LCBmLmMubGVuZ3RoLCBmLm8sIGYubSksIG8gKz0gMTYgKyBiYWRkICsgKGYubSA/IGYubS5sZW5ndGggOiAwKTtcbiAgICB9XG4gICAgd3pmKG91dCwgbywgZmlsZXMubGVuZ3RoLCBjZGwsIG9lKTtcbiAgICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgcGFzcy10aHJvdWdoIGRlY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlc1xuICovXG52YXIgVW56aXBQYXNzVGhyb3VnaCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBVbnppcFBhc3NUaHJvdWdoKCkge1xuICAgIH1cbiAgICBVbnppcFBhc3NUaHJvdWdoLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICAvLyBzYW1lIGFzIFppcFBhc3NUaHJvdWdoOiBjYXN0IHRvIHJldGFpbiBCdWZmZXIgZXJnb25vbWljc1xuICAgICAgICB0aGlzLm9uZGF0YShudWxsLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgVW56aXBQYXNzVGhyb3VnaC5jb21wcmVzc2lvbiA9IDA7XG4gICAgcmV0dXJuIFVuemlwUGFzc1Rocm91Z2g7XG59KCkpO1xuZXhwb3J0IHsgVW56aXBQYXNzVGhyb3VnaCB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXMuIFByZWZlciBBc3luY1ppcEluZmxhdGUgZm9yXG4gKiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gKi9cbnZhciBVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFVuemlwSW5mbGF0ZSgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFVuemlwSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuaS5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMub25kYXRhKGUsIG51bGwsIGZpbmFsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgVW56aXBJbmZsYXRlLmNvbXByZXNzaW9uID0gODtcbiAgICByZXR1cm4gVW56aXBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IFVuemlwSW5mbGF0ZSB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIERFRkxBVEUgZGVjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBBc3luY1VuemlwSW5mbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgREVGTEFURSBkZWNvbXByZXNzaW9uIHRoYXQgY2FuIGJlIHVzZWQgaW4gWklQIGFyY2hpdmVzXG4gICAgICovXG4gICAgZnVuY3Rpb24gQXN5bmNVbnppcEluZmxhdGUoXywgc3opIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKHN6IDwgMzIwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmkgPSBuZXcgSW5mbGF0ZShmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEFzeW5jSW5mbGF0ZShmdW5jdGlvbiAoZXJyLCBkYXQsIGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudGVybWluYXRlID0gdGhpcy5pLnRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBBc3luY1VuemlwSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKHRoaXMuaS50ZXJtaW5hdGUpXG4gICAgICAgICAgICBjaHVuayA9IHNsYyhjaHVuaywgMCk7XG4gICAgICAgIHRoaXMuaS5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICBBc3luY1VuemlwSW5mbGF0ZS5jb21wcmVzc2lvbiA9IDg7XG4gICAgcmV0dXJuIEFzeW5jVW56aXBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jVW56aXBJbmZsYXRlIH07XG4vKipcbiAqIEEgWklQIGFyY2hpdmUgZGVjb21wcmVzc2lvbiBzdHJlYW0gdGhhdCBlbWl0cyBmaWxlcyBhcyB0aGV5IGFyZSBkaXNjb3ZlcmVkXG4gKi9cbnZhciBVbnppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgWklQIGRlY29tcHJlc3Npb24gc3RyZWFtXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGEgZmlsZSBpbiB0aGUgWklQIGFyY2hpdmUgaXMgZm91bmRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBVbnppcChjYikge1xuICAgICAgICB0aGlzLm9uZmlsZSA9IGNiO1xuICAgICAgICB0aGlzLmsgPSBbXTtcbiAgICAgICAgdGhpcy5vID0ge1xuICAgICAgICAgICAgMDogVW56aXBQYXNzVGhyb3VnaFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnAgPSBldDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgdW56aXBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgVW56aXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5vbmZpbGUpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICghdGhpcy5wKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICBpZiAodGhpcy5jID4gMCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IE1hdGgubWluKHRoaXMuYywgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciB0b0FkZCA9IGNodW5rLnN1YmFycmF5KDAsIGxlbik7XG4gICAgICAgICAgICB0aGlzLmMgLT0gbGVuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgICAgICB0aGlzLmQucHVzaCh0b0FkZCwgIXRoaXMuYyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5rWzBdLnB1c2godG9BZGQpO1xuICAgICAgICAgICAgY2h1bmsgPSBjaHVuay5zdWJhcnJheShsZW4pO1xuICAgICAgICAgICAgaWYgKGNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZiA9IDAsIGkgPSAwLCBpcyA9IHZvaWQgMCwgYnVmID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnAubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJ1ZiA9IGNodW5rO1xuICAgICAgICAgICAgZWxzZSBpZiAoIWNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidWYgPSB0aGlzLnA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWYgPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgYnVmLnNldCh0aGlzLnApLCBidWYuc2V0KGNodW5rLCB0aGlzLnAubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsID0gYnVmLmxlbmd0aCwgb2MgPSB0aGlzLmMsIGFkZCA9IG9jICYmIHRoaXMuZDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzaWcgPSBiNChidWYsIGkpO1xuICAgICAgICAgICAgICAgIGlmIChzaWcgPT0gMHg0MDM0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgIGYgPSAxLCBpcyA9IGk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNfMS5kID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmYgPSBiMihidWYsIGkgKyA2KSwgY21wXzEgPSBiMihidWYsIGkgKyA4KSwgdSA9IGJmICYgMjA0OCwgZGQgPSBiZiAmIDgsIGZubCA9IGIyKGJ1ZiwgaSArIDI2KSwgZXMgPSBiMihidWYsIGkgKyAyOCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsID4gaSArIDMwICsgZm5sICsgZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGtzXzMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5rLnVuc2hpZnQoY2hrc18zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxzYyA9IGI0KGJ1ZiwgaSArIDE4KSwgbHN1ID0gYjQoYnVmLCBpICsgMjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZuXzEgPSBzdHJGcm9tVTgoYnVmLnN1YmFycmF5KGkgKyAzMCwgaSArPSAzMCArIGZubCksICF1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfYSA9IHo2NGhzKGJ1ZiwgaSwgZXMsIDIsIGxzYywgbHN1LCAwKSwgc2NfMSA9IF9hWzBdLCBzdV8xID0gX2FbMV0sIHo2NCA9IF9hWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjXzEgPSAtMSAtIHo2NDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuYyA9IHNjXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGVfMSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmbl8xLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjbXBfMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbGVfMS5vbmRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2NfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVfMS5vbmRhdGEobnVsbCwgZXQsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdHIgPSBfdGhpcy5vW2NtcF8xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVfMS5vbmRhdGEoZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjbXBfMSwgMSksIG51bGwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMSA9IHNjXzEgPCAwID8gbmV3IGN0cihmbl8xKSA6IG5ldyBjdHIoZm5fMSwgc2NfMSwgc3VfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEub25kYXRhID0gZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkgeyBmaWxlXzEub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7IH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGNoa3NfNCA9IGNoa3NfMzsgX2kgPCBjaGtzXzQubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdCA9IGNoa3NfNFtfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZF8xLnB1c2goZGF0LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMua1swXSA9PSBjaGtzXzMgJiYgX3RoaXMuYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5kID0gZF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS5wdXNoKGV0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVybWluYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkXzEgJiYgZF8xLnRlcm1pbmF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjXzEgPj0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEuc2l6ZSA9IHNjXzEsIGZpbGVfMS5vcmlnaW5hbFNpemUgPSBzdV8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLm9uZmlsZShmaWxlXzEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaWcgPT0gMHg4MDc0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcyA9IGkgKz0gMTIgKyAob2MgPT0gLTIgJiYgOCksIGYgPSAzLCB0aGlzXzEuYyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNpZyA9PSAweDIwMTRCNTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzID0gaSAtPSA0LCBmID0gMywgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdGhpc18xID0gdGhpcztcbiAgICAgICAgICAgIGZvciAoOyBpIDwgbCAtIDQ7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZV8xID0gX2xvb3BfMigpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZV8xID09PSBcImJyZWFrXCIpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgICAgICAgICBpZiAob2MgPCAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdCA9IGYgPyBidWYuc3ViYXJyYXkoMCwgaXMgLSAxMiAtIChvYyA9PSAtMiAmJiA4KSAtIChiNChidWYsIGlzIC0gMTYpID09IDB4ODA3NEI1MCAmJiA0KSkgOiBidWYuc3ViYXJyYXkoMCwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZClcbiAgICAgICAgICAgICAgICAgICAgYWRkLnB1c2goZGF0LCAhIWYpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rWysoZiA9PSAyKV0ucHVzaChkYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGYgJiAyKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goYnVmLnN1YmFycmF5KGkpLCBmaW5hbCk7XG4gICAgICAgICAgICB0aGlzLnAgPSBidWYuc3ViYXJyYXkoaSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jKVxuICAgICAgICAgICAgICAgIGVycigxMyk7XG4gICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBkZWNvZGVyIHdpdGggdGhlIHN0cmVhbSwgYWxsb3dpbmcgZm9yIGZpbGVzIGNvbXByZXNzZWQgd2l0aFxuICAgICAqIHRoZSBjb21wcmVzc2lvbiB0eXBlIHByb3ZpZGVkIHRvIGJlIGV4cGFuZGVkIGNvcnJlY3RseVxuICAgICAqIEBwYXJhbSBkZWNvZGVyIFRoZSBkZWNvZGVyIGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgVW56aXAucHJvdG90eXBlLnJlZ2lzdGVyID0gZnVuY3Rpb24gKGRlY29kZXIpIHtcbiAgICAgICAgdGhpcy5vW2RlY29kZXIuY29tcHJlc3Npb25dID0gZGVjb2RlcjtcbiAgICB9O1xuICAgIHJldHVybiBVbnppcDtcbn0oKSk7XG5leHBvcnQgeyBVbnppcCB9O1xudmFyIG10ID0gdHlwZW9mIHF1ZXVlTWljcm90YXNrID09ICdmdW5jdGlvbicgPyBxdWV1ZU1pY3JvdGFzayA6IHR5cGVvZiBzZXRUaW1lb3V0ID09ICdmdW5jdGlvbicgPyBzZXRUaW1lb3V0IDogZnVuY3Rpb24gKGZuKSB7IGZuKCk7IH07XG5leHBvcnQgZnVuY3Rpb24gdW56aXAoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICB2YXIgdGVybSA9IFtdO1xuICAgIHZhciB0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlcm0ubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICB0ZXJtW2ldKCk7XG4gICAgfTtcbiAgICB2YXIgZmlsZXMgPSB7fTtcbiAgICB2YXIgY2JkID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgbXQoZnVuY3Rpb24gKCkgeyBjYihhLCBiKTsgfSk7XG4gICAgfTtcbiAgICBtdChmdW5jdGlvbiAoKSB7IGNiZCA9IGNiOyB9KTtcbiAgICB2YXIgZSA9IGRhdGEubGVuZ3RoIC0gMjI7XG4gICAgZm9yICg7IGI0KGRhdGEsIGUpICE9IDB4NjA1NEI1MDsgLS1lKSB7XG4gICAgICAgIGlmICghZSB8fCBkYXRhLmxlbmd0aCAtIGUgPiA2NTU1OCkge1xuICAgICAgICAgICAgY2JkKGVycigxMywgMCwgMSksIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIHRBbGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIHZhciBsZnQgPSBiMihkYXRhLCBlICsgOCk7XG4gICAgaWYgKGxmdCkge1xuICAgICAgICB2YXIgYyA9IGxmdDtcbiAgICAgICAgdmFyIG8gPSBiNChkYXRhLCBlICsgMTYpO1xuICAgICAgICB2YXIgeiA9IGI0KGRhdGEsIGUgLSAyMCkgPT0gMHg3MDY0QjUwO1xuICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgdmFyIHplID0gYjQoZGF0YSwgZSAtIDEyKTtcbiAgICAgICAgICAgIHogPSBiNChkYXRhLCB6ZSkgPT0gMHg2MDY0QjUwO1xuICAgICAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgICAgICBjID0gbGZ0ID0gYjQoZGF0YSwgemUgKyAzMik7XG4gICAgICAgICAgICAgICAgbyA9IGI0KGRhdGEsIHplICsgNDgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBmbHRyID0gb3B0cyAmJiBvcHRzLmZpbHRlcjtcbiAgICAgICAgdmFyIF9sb29wXzMgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIF9hID0gemgoZGF0YSwgbywgeiksIGNfMSA9IF9hWzBdLCBzYyA9IF9hWzFdLCBzdSA9IF9hWzJdLCBmbiA9IF9hWzNdLCBubyA9IF9hWzRdLCBvZmYgPSBfYVs1XSwgYiA9IHNsemgoZGF0YSwgb2ZmKTtcbiAgICAgICAgICAgIG8gPSBubztcbiAgICAgICAgICAgIHZhciBjYmwgPSBmdW5jdGlvbiAoZSwgZCkge1xuICAgICAgICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgY2JkKGUsIG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQpXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIS0tbGZ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JkKG51bGwsIGZpbGVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKCFmbHRyIHx8IGZsdHIoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGZuLFxuICAgICAgICAgICAgICAgIHNpemU6IHNjLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsU2l6ZTogc3UsXG4gICAgICAgICAgICAgICAgY29tcHJlc3Npb246IGNfMVxuICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNfMSlcbiAgICAgICAgICAgICAgICAgICAgY2JsKG51bGwsIHNsYyhkYXRhLCBiLCBiICsgc2MpKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjXzEgPT0gOCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbCA9IGRhdGEuc3ViYXJyYXkoYiwgYiArIHNjKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3luY2hyb25vdXNseSBkZWNvbXByZXNzIHVuZGVyIDUxMktCLCBvciBiYXJlbHktY29tcHJlc3NlZCBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdSA8IDUyNDI4OCB8fCBzYyA+IDAuOCAqIHN1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNibChudWxsLCBpbmZsYXRlU3luYyhpbmZsLCB7IG91dDogbmV3IHU4KHN1KSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNibChlLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXJtLnB1c2goaW5mbGF0ZShpbmZsLCB7IHNpemU6IHN1IH0sIGNibCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNibChlcnIoMTQsICd1bmtub3duIGNvbXByZXNzaW9uIHR5cGUgJyArIGNfMSwgMSksIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNibChudWxsLCBudWxsKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjOyArK2kpIHtcbiAgICAgICAgICAgIF9sb29wXzMoaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBjYmQobnVsbCwge30pO1xuICAgIHJldHVybiB0QWxsO1xufVxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGRlY29tcHJlc3NlcyBhIFpJUCBhcmNoaXZlLiBQcmVmZXIgdXNpbmcgYHVuemlwYCBmb3IgYmV0dGVyXG4gKiBwZXJmb3JtYW5jZSB3aXRoIG1vcmUgdGhhbiBvbmUgZmlsZS5cbiAqIEBwYXJhbSBkYXRhIFRoZSByYXcgY29tcHJlc3NlZCBaSVAgZmlsZVxuICogQHBhcmFtIG9wdHMgVGhlIFpJUCBleHRyYWN0aW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgZmlsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgdmFyIGZpbGVzID0ge307XG4gICAgdmFyIGUgPSBkYXRhLmxlbmd0aCAtIDIyO1xuICAgIGZvciAoOyBiNChkYXRhLCBlKSAhPSAweDYwNTRCNTA7IC0tZSkge1xuICAgICAgICBpZiAoIWUgfHwgZGF0YS5sZW5ndGggLSBlID4gNjU1NTgpXG4gICAgICAgICAgICBlcnIoMTMpO1xuICAgIH1cbiAgICA7XG4gICAgdmFyIGMgPSBiMihkYXRhLCBlICsgOCk7XG4gICAgaWYgKCFjKVxuICAgICAgICByZXR1cm4ge307XG4gICAgdmFyIG8gPSBiNChkYXRhLCBlICsgMTYpO1xuICAgIHZhciB6ID0gYjQoZGF0YSwgZSAtIDIwKSA9PSAweDcwNjRCNTA7XG4gICAgaWYgKHopIHtcbiAgICAgICAgdmFyIHplID0gYjQoZGF0YSwgZSAtIDEyKTtcbiAgICAgICAgeiA9IGI0KGRhdGEsIHplKSA9PSAweDYwNjRCNTA7XG4gICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICBjID0gYjQoZGF0YSwgemUgKyAzMik7XG4gICAgICAgICAgICBvID0gYjQoZGF0YSwgemUgKyA0OCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGZsdHIgPSBvcHRzICYmIG9wdHMuZmlsdGVyO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYzsgKytpKSB7XG4gICAgICAgIHZhciBfYSA9IHpoKGRhdGEsIG8sIHopLCBjXzIgPSBfYVswXSwgc2MgPSBfYVsxXSwgc3UgPSBfYVsyXSwgZm4gPSBfYVszXSwgbm8gPSBfYVs0XSwgb2ZmID0gX2FbNV0sIGIgPSBzbHpoKGRhdGEsIG9mZik7XG4gICAgICAgIG8gPSBubztcbiAgICAgICAgaWYgKCFmbHRyIHx8IGZsdHIoe1xuICAgICAgICAgICAgbmFtZTogZm4sXG4gICAgICAgICAgICBzaXplOiBzYyxcbiAgICAgICAgICAgIG9yaWdpbmFsU2l6ZTogc3UsXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogY18yXG4gICAgICAgIH0pKSB7XG4gICAgICAgICAgICBpZiAoIWNfMilcbiAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBzbGMoZGF0YSwgYiwgYiArIHNjKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNfMiA9PSA4KVxuICAgICAgICAgICAgICAgIGZpbGVzW2ZuXSA9IGluZmxhdGVTeW5jKGRhdGEuc3ViYXJyYXkoYiwgYiArIHNjKSwgeyBvdXQ6IG5ldyB1OChzdSkgfSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjXzIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaWxlcztcbn1cbiIsICJpbXBvcnQgeyBBcHAsIERhdGFBZGFwdGVyLCBub3JtYWxpemVQYXRoLCByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgVmF1bHRTdG9yYWdlIH0gZnJvbSAnLi4vc3RvcmFnZS9WYXVsdFN0b3JhZ2UnO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuaW1wb3J0IHR5cGUgeyBCYW1ib29SZXZpZXdTZXR0aW5ncywgTm9pc2VJdGVtIH0gZnJvbSAnLi4vc2V0dGluZ3MvUGx1Z2luU2V0dGluZ3MnO1xuaW1wb3J0IHsgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLCBNSU1FX1RZUEVTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2F1ZGlvJztcbmltcG9ydCB0eXBlIHsgRGF5RGF0YSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHsgUFJPVE9DT0xfVkVSU0lPTiwgSU5CT1VORF9QUkVGSVhFUyB9IGZyb20gJy4vcHJvdG9jb2wnO1xuXG4vKiogT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU2Q0U4XHU1MTY1XHU3Njg0XHU0RTNCXHU3QTk3XHU1M0UzIGRvY3VtZW50XHVGRjA4XHU5NzVFXHU2M0QyXHU0RUY2XHU2Qzk5XHU3QkIxXHU1MTg1XHU3Njg0IGRvY3VtZW50XHVGRjA5ICovXG5kZWNsYXJlIGNvbnN0IGFjdGl2ZURvY3VtZW50OiBEb2N1bWVudDtcblxuLyoqIFx1NjI2Qlx1NjNDRlx1OTdGM1x1OTg5MVx1NjVGNlx1OUVEOFx1OEJBNFx1OERGM1x1OEZDN1x1NzY4NFx1NzZFRVx1NUY1NVx1NTQwRCAqL1xuY29uc3QgU0tJUF9ESVJTID0gWycudHJhc2gnLCAnLmdpdCcsICdub2RlX21vZHVsZXMnXTtcblxuLyoqXG4gKiBcdTY4MjFcdTlBOENcdTk3RjNcdTZFOTBcdTRFRTNcdTc0MDYgVVJMXHVGRjFBXHU0RUM1XHU1MTQxXHU4QkI4IGh0dHAvaHR0cHMgXHU1MzRGXHU4QkFFXHVGRjBDXHU5NjUwXHU1MjM2XHU5NTdGXHU1RUE2XHVGRjBDXG4gKiBcdTk2MzJcdTZCNjIgYGFwcDpwcm94eUF1ZGlvVXJsYCBcdTYyMTBcdTRFM0FcdThGRDBcdTg4NENcdTU3MjhcdTc1MjhcdTYyMzdcdTY3M0FcdTU2NjhcdTRFMEFcdTc2ODRcdTVGMDBcdTY1M0UgZmV0Y2ggXHU0RUUzXHU3NDA2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkQXVkaW9VcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCF1cmwgfHwgdHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgaWYgKHVybC5sZW5ndGggPiAyMDQ4KSByZXR1cm4gZmFsc2U7XG4gIGxldCBwYXJzZWQ6IFVSTDtcbiAgdHJ5IHtcbiAgICBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGFyc2VkLnByb3RvY29sID09PSAnaHR0cDonIHx8IHBhcnNlZC5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG59XG5cbi8qKiBBcnJheUJ1ZmZlciBcdTIxOTIgYmFzZTY0IFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1NTkyN1x1NjU4N1x1NEVGNlx1NTIwNlx1NTc1N1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEMwM1x1NzUyOFx1NjgwOFx1NkVBMlx1NTFGQVx1RkYwOSAqL1xuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXI6IEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICBsZXQgYmluYXJ5ID0gJyc7XG4gIGNvbnN0IGNodW5rU2l6ZSA9IDB4ODAwMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gY2h1bmtTaXplKSB7XG4gICAgY29uc3QgY2h1bmsgPSBieXRlcy5zdWJhcnJheShpLCBpICsgY2h1bmtTaXplKTtcbiAgICBsZXQgY2h1bmtTdHIgPSAnJztcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNodW5rLmxlbmd0aDsgaisrKSB7XG4gICAgICBjaHVua1N0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNodW5rW2pdKTtcbiAgICB9XG4gICAgYmluYXJ5ICs9IGNodW5rU3RyO1xuICB9XG4gIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbi8qKlxuICogQXBwQVBJIFx1MjAxNCBcdTdFREZcdTRFMDBcdTkwMUFcdTRGRTFcdTYzQTVcdTUzRTNcbiAqXG4gKiBcdTY2RkZcdTRFRTNcdTY1RTdcdTc2ODQgQnJpZGdlU2VydmljZSArIFN0b3JhZ2VCcmlkZ2UgKyBUaGVtZUJyaWRnZSBcdTRFMDlcdTVDNDJcdTY3QjZcdTY3ODRcdUZGMENcbiAqIFx1NUMwNiBwb3N0TWVzc2FnZSBcdThERUZcdTc1MzFcdTMwMDFcdTVCNThcdTUwQThcdTY0Q0RcdTRGNUNcdTMwMDFcdTRFM0JcdTk4OThcdTU0MENcdTZCNjVcdTU0MDhcdTVFNzZcdTRFM0FcdTUzNTVcdTRFMDAgQVBJXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBBUEkge1xuICBwcml2YXRlIHN0b3JhZ2U6IFZhdWx0U3RvcmFnZTtcbiAgcHJpdmF0ZSB0aGVtZUJyaWRnZTogVGhlbWVCcmlkZ2U7XG4gIHByaXZhdGUgc2V0dGluZ3M6IEJhbWJvb1Jldmlld1NldHRpbmdzO1xuICBwcml2YXRlIHNhdmVTZXR0aW5nczogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbWVzc2FnZUhhbmRsZXI6ICgoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjdXN0b21UaGVtZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBjb2RlOiBzdHJpbmcgfT4gPSBbXTtcbiAgcHJpdmF0ZSB2YXVsdEFkYXB0ZXI6IERhdGFBZGFwdGVyO1xuICBwcml2YXRlIG5vaXNlUGF0aDogc3RyaW5nO1xuICBwcml2YXRlIGNvbmZpZ0Rpcjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHNldHRpbmdzOiBCYW1ib29SZXZpZXdTZXR0aW5ncyxcbiAgICBzYXZlU2V0dGluZ3M6ICgpID0+IFByb21pc2U8dm9pZD4sXG4gICAgbm9pc2VQYXRoOiBzdHJpbmcsXG4gICAgY29uZmlnRGlyOiBzdHJpbmdcbiAgKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIHRoaXMuc2F2ZVNldHRpbmdzID0gc2F2ZVNldHRpbmdzO1xuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQXdlYmFwcCBcdThCRkJcdTUzRDZcdTc2RUVcdTY4MDdcdTc2ODRcdTVCOUVcdTk2NDVcdThERUZcdTVGODRcdTc1MzFcdTZCNjRcdTU5MDRcdTUxQjNcdTVCOUFcdUZGMDhWYXVsdFN0b3JhZ2UgXHU5RUQ4XHU4QkE0IGJhc2VQYXRoID0gYmFtYm9vLXJldmlld1x1RkYwOVx1MzAwMlxuICAgIC8vIHdyaXRlQWlHb2FscyBcdTVGQzVcdTk4N0JcdTUxOTlcdTUxNjVcdTU0MENcdTRFMDBcdThERUZcdTVGODRcdUZGMENcdTU0MjZcdTUyMTkgQUkgXHU3NkVFXHU2ODA3XHU0RTBEXHU2NjNFXHU3OTNBXHUzMDAyXHU4QkU2XHU4OUMxIG1haW4udHMgd3JpdGVBaUdvYWxzIFx1NzY4NFx1NkNFOFx1OTFDQVx1MzAwMlxuICAgIHRoaXMuc3RvcmFnZSA9IG5ldyBWYXVsdFN0b3JhZ2UoYXBwKTtcbiAgICB0aGlzLnRoZW1lQnJpZGdlID0gbmV3IFRoZW1lQnJpZGdlKCk7XG4gICAgdGhpcy52YXVsdEFkYXB0ZXIgPSBhcHAudmF1bHQuYWRhcHRlcjtcbiAgICB0aGlzLm5vaXNlUGF0aCA9IG5vaXNlUGF0aDtcbiAgICB0aGlzLmNvbmZpZ0RpciA9IGNvbmZpZ0RpcjtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTVCNThcdTUwQThcdTdFRDNcdTY3ODRcdTVCNThcdTU3MjggKi9cbiAgYXN5bmMgZW5zdXJlU3RydWN0dXJlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgfVxuXG4gIC8qKiBcdThCQkVcdTdGNkVcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyMTdcdTg4NjggKi9cbiAgc2V0Q3VzdG9tVGhlbWVzKHRoZW1lczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9Pik6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tVGhlbWVzID0gdGhlbWVzO1xuICB9XG5cbiAgLyoqIFxuICAgKiBcdTk4ODRcdTZDRThcdTUxOEMgbWVzc2FnZSBcdTc2RDFcdTU0MkNcdTU2NjhcdTMwMDJcbiAgICogXHU1NzI4IGlmcmFtZSBcdTUyMUJcdTVFRkFcdTUyNERcdThDMDNcdTc1MjhcdUZGMENcdTZEODhcdTk2NjRcdTdBREVcdTYwMDFcdTdBOTdcdTUzRTNcdTMwMDJcbiAgICogXHU0RjdGXHU3NTI4IGFjdGl2ZURvY3VtZW50LmRlZmF1bHRWaWV3XHVGRjA4XHU0RTNCIE9ic2lkaWFuIFx1N0E5N1x1NTNFM1x1RkYwOVx1ODAwQ1x1OTc1RVx1NjNEMlx1NEVGNlx1NkM5OVx1N0JCMSB3aW5kb3dcdTMwMDJcbiAgICovXG4gIHN0YXJ0TGlzdGVuaW5nKCk6IHZvaWQge1xuICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlciA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICB2b2lkIHRoaXMub25NZXNzYWdlKGV2ZW50KTtcbiAgICB9O1xuICAgIC8vIGJyaWRnZS5qcyBcdTc2ODQgcG9zdE1lc3NhZ2UgXHU3NkVFXHU2ODA3XHU2NjJGIHdpbmRvdy5wYXJlbnRcdUZGMDhcdTRFM0IgT2JzaWRpYW4gXHU3QTk3XHU1M0UzXHVGRjA5XHVGRjBDXG4gICAgLy8gXHU1RkM1XHU5ODdCXHU1NzI4XHU4QkU1XHU3QTk3XHU1M0UzXHU0RTBBXHU3NkQxXHU1NDJDXHU2MjREXHU4MEZEXHU2NTM2XHU1MjMwXHU2RDg4XHU2MDZGXHVGRjA4XHU2M0QyXHU0RUY2XHU2Qzk5XHU3QkIxXHU3Njg0IHdpbmRvdyBcdTRFMERcdTY2MkZcdTU0MENcdTRFMDBcdTVCRjlcdThDNjFcdUZGMDlcdTMwMDJcbiAgICAoYWN0aXZlRG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93KS5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gIH1cblxuICAvKiogXG4gICAqIFx1N0VEMVx1NUI5QSBpZnJhbWUgXHU1RjE1XHU3NTI4XHU1RTc2XHU1MjFEXHU1OUNCXHU1MzE2XHU0RTNCXHU5ODk4XHU2ODY1XHU2M0E1XHUzMDAyXG4gICAqIFx1NTcyOCBpZnJhbWUgXHU1MTQzXHU3RDIwXHU1MjFCXHU1RUZBXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjBDXHU0RjlCIHJlc3BvbmQoKSBcdTgzQjdcdTUzRDYgY29udGVudFdpbmRvd1x1MzAwMlxuICAgKi9cbiAgYmluZElmcmFtZShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5hdHRhY2hJZnJhbWUoaWZyYW1lKTtcbiAgfVxuXG4gIC8qKiBcdTdFRDFcdTVCOUEgaWZyYW1lIFx1NUU3Nlx1NUYwMFx1NTlDQlx1NzZEMVx1NTQyQ1x1NkQ4OFx1NjA2Rlx1RkYwOFx1NEUwMFx1NkI2NVx1NTIzMFx1NEY0RFx1RkYwQ1x1NTE3Q1x1NUJCOVx1NjVFN1x1OEMwM1x1NzUyOFx1RkYwOSAqL1xuICBhdHRhY2goaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuc3RhcnRMaXN0ZW5pbmcoKTtcbiAgICB0aGlzLmJpbmRJZnJhbWUoaWZyYW1lKTtcbiAgfVxuXG4gIC8qKiBcdTg5RTNcdTdFRDFcdTVFNzZcdTUwNUNcdTZCNjJcdTc2RDFcdTU0MkMgKi9cbiAgZGV0YWNoKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lc3NhZ2VIYW5kbGVyKSB7XG4gICAgICAoYWN0aXZlRG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93KS5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlSGFuZGxlcik7XG4gICAgICB0aGlzLm1lc3NhZ2VIYW5kbGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aGVtZUJyaWRnZS5kZXRhY2hJZnJhbWUoKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cblxuICAvKiogT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU1M0Q4XHU1MzE2XHU2NUY2XHU4OUU2XHU1M0QxXHVGRjA4XHU3NTMxIERhaWx5UmV2aWV3VmlldyBcdTc2ODQgY3NzLWNoYW5nZSBcdTRFOEJcdTRFRjZcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgb25UaGVtZUNoYW5nZWQoZm9sbG93T2JzaWRpYW5UaGVtZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSA9IGZvbGxvd09ic2lkaWFuVGhlbWU7XG4gICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUoZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gIH1cblxuICAvKiogXHU1NDExIGlmcmFtZSBcdTUzRDFcdTkwMDFcdTYyMTBcdTUyOUZcdTU0Q0RcdTVFOTQgKi9cbiAgcHJpdmF0ZSByZXNwb25kKGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgLy8gXHU1RkM1XHU5ODdCXHU1RTI2IHR5cGUgXHU1QjU3XHU2QkI1XHVGRjFBYnJpZGdlLmpzIFx1NzY4NCBwYXJzZUFwcE1lc3NhZ2UgXHU4OTgxXHU2QzQyIHR5cGVvZiBkYXRhLnR5cGUgPT09ICdzdHJpbmcnXG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7IHR5cGU6ICdzdG9yYWdlOnJlc3BvbnNlJywgaWQsIHBheWxvYWQgfSwgJyonKTtcbiAgfVxuXG4gIC8qKiBcdTU0MTEgaWZyYW1lIFx1NTNEMVx1OTAwMVx1OTUxOVx1OEJFRlx1NTRDRFx1NUU5NCAqL1xuICBwcml2YXRlIHJlc3BvbmRFcnJvcihpZDogc3RyaW5nLCBlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyB0eXBlOiAnc3RvcmFnZTpyZXNwb25zZScsIGlkLCBlcnJvciB9LCAnKicpO1xuICB9XG5cbiAgLyoqIFx1NkQ4OFx1NjA2Rlx1OERFRlx1NzUzMSAqL1xuICBwcml2YXRlIGFzeW5jIG9uTWVzc2FnZShldmVudDogTWVzc2FnZUV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbXNnID0gZXZlbnQuZGF0YSBhcyB7IHR5cGU/OiBzdHJpbmc7IGlkPzogc3RyaW5nOyBwYXlsb2FkPzogdW5rbm93biB9O1xuICAgIGlmICghbXNnIHx8ICFtc2cudHlwZSB8fCAhbXNnLmlkKSByZXR1cm47XG5cbiAgICAvLyBcdTY3NjVcdTZFOTBcdTY4MjFcdTlBOENcbiAgICBpZiAodGhpcy5pZnJhbWUgJiYgZXZlbnQuc291cmNlICE9PSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93KSByZXR1cm47XG5cbiAgICAvLyBcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTc2N0RcdTU0MERcdTUzNTVcdUZGMDhcdTk2MzZcdTZCQjUzIFx1MDBCNyBcdTU5NTFcdTdFQTZcdTUzMTZcdUZGMUFcdTRFQ0UgcHJvdG9jb2wudHMgXHU5NkM2XHU0RTJEXHU1QjlBXHU0RTQ5XHVGRjA5XG4gICAgaWYgKCFJTkJPVU5EX1BSRUZJWEVTLnNvbWUoKHApID0+IG1zZy50eXBlIS5zdGFydHNXaXRoKHApKSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlTWVzc2FnZShtc2cudHlwZSwgbXNnLmlkLCBtc2cucGF5bG9hZCA/PyB7fSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5yZXNwb25kRXJyb3IobXNnLmlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTZEODhcdTYwNkZcdTUyMDZcdTUzRDFcdTU5MDRcdTc0MDYgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVNZXNzYWdlKHR5cGU6IHN0cmluZywgaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIC0tLS0gXHU3NTFGXHU1NDdEXHU1NDY4XHU2NzFGIC0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpyZWFkeScpIHtcbiAgICAgIC8vIFx1OTYzNlx1NkJCNTMgXHUwMEI3IFx1NTk1MVx1N0VBNlx1NTMxNlx1RkYxQVx1NzI0OFx1NjcyQ1x1NTM0Rlx1NTU0NiBcdTIwMTQgXHU2M0QyXHU0RUY2XHU1MzQ3XHU3RUE3XHU0RjQ2IHdlYmFwcCBcdTdGMTNcdTVCNThcdTY1RTdcdTcyNDhcdTY1RjZcdTUzRUZcdTg5QzFcdTU0NEFcdThCNjZcbiAgICAgIGNvbnN0IHB2ID0gKHBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pPy5wcm90b2NvbFZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIHB2ID09PSAnbnVtYmVyJyAmJiBwdiAhPT0gUFJPVE9DT0xfVkVSU0lPTikge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYFtCYW1ib29dIFx1NTM0Rlx1OEJBRVx1NzI0OFx1NjcyQ1x1NEUwRFx1NTMzOVx1OTE0RFx1RkYxQVx1NjNEMlx1NEVGNj0ke1BST1RPQ09MX1ZFUlNJT059XHVGRjBDd2ViYXBwPSR7cHZ9XHUzMDAyYCArXG4gICAgICAgICAgICBgXHU4QkY3XHU5MUNEXHU2NUIwXHU1MkEwXHU4RjdEXHU4OUM2XHU1NkZFXHU0RUU1XHU4M0I3XHU1M0Q2XHU2NzAwXHU2NUIwIHdlYmFwcFx1MzAwMmAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLnRoZW1lQnJpZGdlLnB1c2hUaGVtZSh0aGlzLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7XG4gICAgICAgIG9rOiB0cnVlLFxuICAgICAgICBzZWN0aW9uQ29uZmlnOiB0aGlzLnNldHRpbmdzLnNlY3Rpb25Db25maWcgfHwgbnVsbCxcbiAgICAgICAgY3VzdG9tVGhlbWVzOiB0aGlzLmN1c3RvbVRoZW1lcyxcbiAgICAgICAgY3VzdG9tTm9pc2VzOiB0aGlzLnNldHRpbmdzLm5vaXNlSXRlbXMgfHwgW10sXG4gICAgICAgIHN5bmNQYWxldHRlVG9PYnNpZGlhbjogdGhpcy5zZXR0aW5ncy5zeW5jUGFsZXR0ZVRvT2JzaWRpYW4gfHwgZmFsc2UsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpjbG9zZScpIHtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1Njc3Rlx1NTc1N1x1OTE0RFx1N0Y2RSAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6c2F2ZVNlY3Rpb25Db25maWcnKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLnNlY3Rpb25Db25maWcgPSBwYXlsb2FkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbDtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgb2s6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTAgLS0tLVxuICAgIGlmICh0eXBlID09PSAnYXBwOnNhdmVDdXN0b21Ob2lzZXMnKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLm5vaXNlSXRlbXMgPSAoQXJyYXkuaXNBcnJheShwYXlsb2FkKSA/IHBheWxvYWQgOiBbXSkgYXMgTm9pc2VJdGVtW107XG4gICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhblx1RkYwOS0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ3RoZW1lOnN5bmNQYWxldHRlJykge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyBodWU6IG51bWJlcjsgbGlnaHRuZXNzT2Zmc2V0OiBudW1iZXI7IGlzRGFyazogYm9vbGVhbiB9O1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKSB7XG4gICAgICAgIHRoaXMudGhlbWVCcmlkZ2UuYXBwbHlQYWxldHRlKHAuaHVlLCBwLmxpZ2h0bmVzc09mZnNldCwgcC5pc0RhcmspO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IG9rOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIC0tLS0gXHU5MUNEXHU2NUIwXHU1RjAwXHU1NDJGXHU0RTNCXHU5ODk4XHU4RERGXHU5NjhGXHVGRjA4d2ViYXBwIFx1MjE5MiBPYnNpZGlhblx1RkYwOS0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDp0aGVtZTpzeW5jJykge1xuICAgICAgdGhpcy50aGVtZUJyaWRnZS5wdXNoVGhlbWUodGhpcy5zZXR0aW5ncy5mb2xsb3dPYnNpZGlhblRoZW1lKTtcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBvazogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2Qlx1NjNDRiAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6bGlzdFZhdWx0QXVkaW9GaWxlcycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5zY2FuVmF1bHRBdWRpb0ZpbGVzKCk7XG4gICAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBmaWxlcyB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5yZXNwb25kRXJyb3IoaWQsIGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdcdTYyNkJcdTYzQ0ZcdTVFOTNcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1OEJGQlx1NTNENlx1NUU5M1x1NTE4NVx1OTdGM1x1OTg5MSAtLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cmVhZFZhdWx0RmlsZScpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUmVhZFZhdWx0RmlsZShpZCwgcGF5bG9hZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdThCRkJcdTUzRDZcdTY3MkNcdTY3M0FcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdTk3RjNcdTk4OTFcdUZGMDhcdTUxN0NcdTVCQjlcdTY1RTdcdTk3RjNcdTZFOTBcdUZGMDktLS0tXG4gICAgaWYgKHR5cGUgPT09ICdhcHA6cmVhZExvY2FsRmlsZScpIHtcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUmVhZExvY2FsRmlsZShpZCwgcGF5bG9hZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gLS0tLSBcdTRFRTNcdTc0MDZcdTU5MTZcdTkwRThcdTk3RjNcdTZFOTBcdTk0RkVcdTYzQTVcdUZGMDhcdTdFRDVcdThGQzcgd2VidmlldyBDT1JTXHVGRjBDXHU2ODRDXHU5NzYyL1x1NzlGQlx1NTJBOFx1NEUwMFx1ODFGNFx1RkYwOS0tLS1cbiAgICBpZiAodHlwZSA9PT0gJ2FwcDpwcm94eUF1ZGlvVXJsJykge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVQcm94eUF1ZGlvVXJsKGlkLCBwYXlsb2FkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAtLS0tIFx1NUI1OFx1NTBBOFx1N0M3Qlx1NkQ4OFx1NjA2Rlx1RkYwOFx1NTlENFx1NjI1OFx1N0VEOSBWYXVsdFN0b3JhZ2VcdUZGMDktLS0tXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5oYW5kbGVTdG9yYWdlTWVzc2FnZSh0eXBlLCBwYXlsb2FkKTtcbiAgICB0aGlzLnJlc3BvbmQoaWQsIHJlc3VsdCk7XG4gIH1cblxuICAvKiogXHU1QjU4XHU1MEE4XHU2RDg4XHU2MDZGXHU1OTA0XHU3NDA2ICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlU3RvcmFnZU1lc3NhZ2UodHlwZTogc3RyaW5nLCBwYXlsb2FkOiB1bmtub3duKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcCA9IHBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdzdG9yYWdlOnJlYWREYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheShwLmRhdGVLZXkgYXMgc3RyaW5nKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6d3JpdGVEYXknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dERheShwLmRhdGEgYXMgRGF5RGF0YSk7XG4gICAgICBjYXNlICdzdG9yYWdlOmxpc3REYXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRBbGxEYXlzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmRlbGV0ZURheSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlRGF5KHAuZGF0ZUtleSBhcyBzdHJpbmcpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXRTZXR0aW5nJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRTZXR0aW5nKHAua2V5IGFzIHN0cmluZyk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFNldHRpbmcnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLnB1dFNldHRpbmcocC5rZXkgYXMgc3RyaW5nLCBwLnZhbHVlKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbFNldHRpbmdzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEdvYWxzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRHb2FscygpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpwdXRHb2Fscyc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0R29hbHMocC5nb2FscyBhcyBuZXZlcik7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UHVyY2hhc2VIaXN0b3J5KCk7XG4gICAgICBjYXNlICdzdG9yYWdlOnB1dFB1cmNoYXNlSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0UHVyY2hhc2VIaXN0b3J5KHAuZGF0YSBhcyBuZXZlcik7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldEluY29tZUhpc3RvcnknOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEluY29tZUhpc3RvcnkoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6cHV0SW5jb21lSGlzdG9yeSc6XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UucHV0SW5jb21lSGlzdG9yeShwLmRhdGEgYXMgbmV2ZXIpO1xuICAgICAgY2FzZSAnc3RvcmFnZTpnZXREYXlLZXlzJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5nZXREYXlLZXlzKCk7XG4gICAgICBjYXNlICdzdG9yYWdlOmdldERheXNQYWdpbmF0ZWQnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmdldERheXNQYWdpbmF0ZWQoXG4gICAgICAgICAgKHAucGFnZSBhcyBudW1iZXIpID8/IDAsXG4gICAgICAgICAgKHAucGFnZVNpemUgYXMgbnVtYmVyKSA/PyAzMFxuICAgICAgICApO1xuICAgICAgY2FzZSAnc3RvcmFnZTpleHBvcnRBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmV4cG9ydEFsbERhdGEoKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6aW1wb3J0QWxsJzpcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5pbXBvcnREYXRhKFxuICAgICAgICAgIHAuZGF0YSxcbiAgICAgICAgICB7IHN0cmF0ZWd5OiAocC5vcHRpb25zIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KT8uc3RyYXRlZ3kgYXMgJ292ZXJ3cml0ZScgfCAnbWVyZ2UnIHwgdW5kZWZpbmVkIH1cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ3N0b3JhZ2U6Y2xlYXJBbGwnOlxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyQWxsKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RvcmFnZSBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKiogXHU2MjZCXHU2M0NGXHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2ICovXG4gIHByaXZhdGUgYXN5bmMgc2NhblZhdWx0QXVkaW9GaWxlcyhcbiAgICBtYXhEZXB0aCA9IDVcbiAgKTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBzaXplOiBudW1iZXI7IGV4dDogc3RyaW5nIH0+PiB7XG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgc2l6ZTogbnVtYmVyOyBleHQ6IHN0cmluZyB9PiA9IFtdO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLnZhdWx0QWRhcHRlcjtcblxuICAgIGlmICh0aGlzLm5vaXNlUGF0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IGFkYXB0ZXIubGlzdCh0aGlzLm5vaXNlUGF0aCk7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0LmZpbGVzKSB7XG4gICAgICAgICAgaWYgKGZpbGUuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBleHQgPSBmaWxlLnN1YnN0cmluZyhmaWxlLmxhc3RJbmRleE9mKCcuJykpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKEFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5ub2lzZVBhdGh9LyR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGFkYXB0ZXIuc3RhdChmdWxsUGF0aCk7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IGZ1bGxQYXRoLCBuYW1lOiBmaWxlLCBzaXplOiBzdGF0Py5zaXplID8/IDAsIGV4dCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBza2lwICovIH1cbiAgICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvLyBcdTUxNjhcdTVFOTNcdTYyNkJcdTYzQ0ZcbiAgICBjb25zdCBzY2FuRGlyID0gYXN5bmMgKHJlbGF0aXZlRGlyOiBzdHJpbmcsIGRlcHRoOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSByZXR1cm47XG4gICAgICBsZXQgbGlzdDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxpc3QgPSBhd2FpdCBhZGFwdGVyLmxpc3QocmVsYXRpdmVEaXIpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XG4gICAgICAgIGlmIChmb2xkZXIuc3RhcnRzV2l0aCgnLicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qgc2tpcFNldCA9IG5ldyBTZXQoWy4uLlNLSVBfRElSUywgLi4uKHRoaXMuY29uZmlnRGlyID8gW3RoaXMuY29uZmlnRGlyXSA6IFtdKV0pO1xuICAgICAgICBpZiAoc2tpcFNldC5oYXMoZm9sZGVyKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHN1YlBhdGggPSByZWxhdGl2ZURpciA/IG5vcm1hbGl6ZVBhdGgoYCR7cmVsYXRpdmVEaXJ9LyR7Zm9sZGVyfWApIDogZm9sZGVyO1xuICAgICAgICBhd2FpdCBzY2FuRGlyKHN1YlBhdGgsIGRlcHRoICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBsaXN0LmZpbGVzKSB7XG4gICAgICAgIGlmIChmaWxlLnN0YXJ0c1dpdGgoJy4nKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGV4dCA9IGZpbGUuc3Vic3RyaW5nKGZpbGUubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKEFMTE9XRURfQVVESU9fRVhURU5TSU9OUy5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlRGlyID8gbm9ybWFsaXplUGF0aChgJHtyZWxhdGl2ZURpcn0vJHtmaWxlfWApIDogZmlsZTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQocmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IHBhdGg6IHJlbGF0aXZlUGF0aCwgbmFtZTogZmlsZSwgc2l6ZTogc3RhdD8uc2l6ZSA/PyAwLCBleHQgfSk7XG4gICAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGF3YWl0IHNjYW5EaXIoJycsIDApO1xuICAgIHJlc3VsdHMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKiogXHU4QkZCXHU1M0Q2XHU1RTkzXHU1MTg1XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHVGRjBDXHU4RkQ0XHU1NkRFXHU1M0VGXHU2NEFEXHU2NTNFXHU3Njg0IGJhc2U2NCBkYXRhIFVSTFx1RkYwOFx1Njg0Q1x1OTc2Mi9cdTc5RkJcdTUyQThcdTRFMDBcdTgxRjRcdUZGMENcdTRFMERcdTRGOURcdThENTYgYmFzZVBhdGhcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVSZWFkVmF1bHRGaWxlKGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyBwYXRoOiBzdHJpbmcgfTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHAucGF0aCB8fCAnJztcbiAgICAgIGlmICghcmVsYXRpdmVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuXG4gICAgICBjb25zdCBleHQgPSByZWxhdGl2ZVBhdGguc3Vic3RyaW5nKHJlbGF0aXZlUGF0aC5sYXN0SW5kZXhPZignLicpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFBTExPV0VEX0FVRElPX0VYVEVOU0lPTlMuaW5jbHVkZXMoZXh0KSkgdGhyb3cgbmV3IEVycm9yKCdcdTRFMERcdTY1MkZcdTYzMDFcdTc2ODRcdTk3RjNcdTk4OTFcdTY4M0NcdTVGMEZcdUZGMUEnICsgZXh0KTtcbiAgICAgIGlmIChyZWxhdGl2ZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG5cbiAgICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLnZhdWx0QWRhcHRlcjtcbiAgICAgIGNvbnN0IHN0YXQgPSBhd2FpdCBhZGFwdGVyLnN0YXQocmVsYXRpdmVQYXRoKTtcbiAgICAgIGlmICghc3RhdCB8fCBzdGF0LnR5cGUgIT09ICdmaWxlJykgdGhyb3cgbmV3IEVycm9yKCdcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEnICsgcmVsYXRpdmVQYXRoKTtcblxuICAgICAgY29uc3QgYnVmZmVyID0gYXdhaXQgYWRhcHRlci5yZWFkQmluYXJ5KHJlbGF0aXZlUGF0aCk7XG4gICAgICB0aGlzLnJlc3BvbmQoaWQsIHsgZGF0YTogdGhpcy50b0RhdGFVcmwoYnVmZmVyLCBleHQpIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1OEJGQlx1NTNENlx1NjcyQ1x1NjczQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1OTdGM1x1OTg5MVx1RkYwOFx1NTE3Q1x1NUJCOVx1NjVFN1x1OTdGM1x1NkU5MFx1RkYxQlx1NzlGQlx1NTJBOFx1N0FFRlx1NkM5OVx1NzZEMlx1NEUwQlx1NTNFRlx1ODBGRFx1NEUwRFx1NTNFRlx1OEJGQlx1RkYwOSAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZVJlYWRMb2NhbEZpbGUoaWQ6IHN0cmluZywgcGF5bG9hZDogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwID0gcGF5bG9hZCBhcyB7IHBhdGg6IHN0cmluZyB9O1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBwLnBhdGggfHwgJyc7XG4gICAgICBpZiAoIWZpbGVQYXRoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjcyQVx1NjNEMFx1NEY5Qlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NCcpO1xuXG4gICAgICBjb25zdCBleHQgPSBmaWxlUGF0aC5zdWJzdHJpbmcoZmlsZVBhdGgubGFzdEluZGV4T2YoJy4nKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghQUxMT1dFRF9BVURJT19FWFRFTlNJT05TLmluY2x1ZGVzKGV4dCkpIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2ODNDXHU1RjBGXHVGRjFBJyArIGV4dCk7XG4gICAgICBpZiAoZmlsZVBhdGguaW5jbHVkZXMoJy4uJykpIHRocm93IG5ldyBFcnJvcignXHU4REVGXHU1Rjg0XHU5MDREXHU1Mzg2XHU3OTgxXHU2QjYyJyk7XG5cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHRoaXMudmF1bHRBZGFwdGVyLnJlYWRCaW5hcnkoZmlsZVBhdGgpO1xuICAgICAgdGhpcy5yZXNwb25kKGlkLCB7IGRhdGE6IHRoaXMudG9EYXRhVXJsKGJ1ZmZlciwgZXh0KSB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLnJlc3BvbmRFcnJvcihpZCwgZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogJ1x1OEJGQlx1NTNENlx1NjcyQ1x1NTczMFx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTRFRTNcdTc0MDZcdTU5MTZcdTkwRThcdTk3RjNcdTZFOTBcdTk0RkVcdTYzQTVcdUZGMUFcdTYzRDJcdTRFRjZcdTdBRUYgcmVxdWVzdFVybCBcdTRFMERcdTUzRDcgd2VidmlldyBDT1JTIFx1OTY1MFx1NTIzNlx1RkYwOFx1Njg0Q1x1OTc2Mi9cdTc5RkJcdTUyQThcdTU3NDdcdTY1MkZcdTYzMDFcdUZGMDkgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVQcm94eUF1ZGlvVXJsKGlkOiBzdHJpbmcsIHBheWxvYWQ6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcCA9IHBheWxvYWQgYXMgeyB1cmw6IHN0cmluZyB9O1xuICAgICAgY29uc3QgdXJsID0gcC51cmwgfHwgJyc7XG4gICAgICBpZiAoIWlzVmFsaWRBdWRpb1VybCh1cmwpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OTc1RVx1NkNENVx1OTdGM1x1NkU5MFx1OTRGRVx1NjNBNVx1RkYwOFx1NEVDNVx1NjUyRlx1NjMwMSBodHRwL2h0dHBzXHVGRjA5Jyk7XG5cbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCByZXF1ZXN0VXJsKHsgdXJsLCBtZXRob2Q6ICdHRVQnIH0pO1xuICAgICAgaWYgKHJlc3Auc3RhdHVzIDwgMjAwIHx8IHJlc3Auc3RhdHVzID49IDMwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1OTdGM1x1NkU5MFx1OEJCRlx1OTVFRVx1NTkzMVx1OEQyNSAoSFRUUCAnICsgcmVzcC5zdGF0dXMgKyAnKScpO1xuICAgICAgfVxuICAgICAgY29uc3QgYnVmZmVyID0gcmVzcC5hcnJheUJ1ZmZlcjtcbiAgICAgIGlmICghYnVmZmVyKSB0aHJvdyBuZXcgRXJyb3IoJ1x1OTdGM1x1NkU5MFx1NTRDRFx1NUU5NFx1NEUzQVx1N0E3QScpO1xuXG4gICAgICBjb25zdCBtaW1lID0gKHJlc3AuaGVhZGVycyAmJiByZXNwLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddKSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICAgIHRoaXMucmVzcG9uZChpZCwgeyBkYXRhOiBgZGF0YToke21pbWV9O2Jhc2U2NCwke2FycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKX1gIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMucmVzcG9uZEVycm9yKGlkLCBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnXHU0RUUzXHU3NDA2XHU5N0YzXHU2RTkwXHU1OTMxXHU4RDI1Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFycmF5QnVmZmVyIFx1MjE5MiBcdTVFMjYgTUlNRSBcdTc2ODQgYmFzZTY0IGRhdGEgVVJMICovXG4gIHByaXZhdGUgdG9EYXRhVXJsKGJ1ZmZlcjogQXJyYXlCdWZmZXIsIGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtaW1lID0gTUlNRV9UWVBFU1tleHRdIHx8ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgIHJldHVybiBgZGF0YToke21pbWV9O2Jhc2U2NCwke2FycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKX1gO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBub3JtYWxpemVQYXRoLCBURmlsZSwgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgSW1wb3J0VmFsaWRhdG9yIH0gZnJvbSAnLi9JbXBvcnRWYWxpZGF0b3InO1xuaW1wb3J0IHR5cGUge1xuICBEYXlEYXRhLFxuICBHb2FsSXRlbSxcbiAgQXBwU2V0dGluZ3MsXG4gIFB1cmNoYXNlSGlzdG9yeSxcbiAgSW5jb21lSGlzdG9yeSxcbiAgRXhwb3J0U2hhcGUsXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG4vKipcbiAqIFZhdWx0U3RvcmFnZSAtIFx1NUMwMVx1ODhDNSBPYnNpZGlhbiBWYXVsdCBhZGFwdGVyIFx1NzY4NFx1NjU4N1x1NEVGNlx1NjRDRFx1NEY1Q1xuICpcbiAqIFZhdWx0IFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NDpcbiAqICAge2Jhc2VQYXRofS9cbiAqICAgICBkYXRhLyAgICAgICAgICAtPiBcdTZCQ0ZcdTY1RTUgSlNPTiBcdTY1NzBcdTYzNkVcbiAqICAgICBnb2Fscy5qc29uICAgICAtPiBcdTUxNjhcdTVDNDBcdTc2RUVcdTY4MDdcbiAqICAgICBzZXR0aW5ncy5qc29uICAtPiBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkVcbiAqICAgICB0aGVtZXMvICAgICAgICAtPiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXBvcnRzLyAgICAgICAtPiBcdTYyQTVcdTU0NEEgKFx1OTg4NFx1NzU1OSlcbiAqICAgICByZXZpZXdzLyAgICAgICAtPiBNYXJrZG93biBcdTY0NThcdTg5ODFcbiAqL1xuZXhwb3J0IGNsYXNzIFZhdWx0U3RvcmFnZSB7XG4gIHByaXZhdGUgYXBwOiBBcHA7XG4gIHByaXZhdGUgYmFzZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1NTE5OVx1NUI4OFx1NTM2Qlx1RkYxQVx1NURGMlx1OEI2Nlx1NTQ0QVx1OEZDN1x1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1N0IyQ1x1NEU4Q1x1NkIyMVx1NTE5OVx1NTE2NVx1NjUzRVx1ODg0Q1x1RkYwOFx1NzUyOFx1NjIzN1x1Nzg2RVx1OEJBNFx1NjEwRlx1NTZGRVx1RkYwOSAqL1xuICBwcml2YXRlIF93YXJuZWRQYXRocyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBiYXNlUGF0aCA9ICdiYW1ib28tcmV2aWV3Jykge1xuICAgIHRoaXMuYXBwID0gYXBwO1xuICAgIHRoaXMuYmFzZVBhdGggPSBub3JtYWxpemVQYXRoKGJhc2VQYXRoKTtcbiAgfVxuXG4gIC8qKiBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjggKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVEaXIoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS8ke2Rpcn1gKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1Nzg2RVx1NEZERFx1NTdGQVx1Nzg0MFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFx1NUI1OFx1NTcyOCAqL1xuICBhc3luYyBlbnN1cmVTdHJ1Y3R1cmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHModGhpcy5iYXNlUGF0aCkpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLm1rZGlyKHRoaXMuYmFzZVBhdGgpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdyZXZpZXdzJyk7XG4gIH1cblxuICAvKipcbiAgICogXHU1MzlGXHU1QjUwXHU2NUI5XHU1RjBGXHU1MTk5XHU1MTY1IHZhdWx0IFx1NjU4N1x1NEVGNlx1RkYwOFx1NjZGRlx1NEVFMyBhZGFwdGVyLndyaXRlXHVGRjA5XHUzMDAyXG4gICAqIC0gXHU2NTg3XHU0RUY2XHU1REYyXHU1NzI4IHZhdWx0IFx1N0YxM1x1NUI1OCBcdTIxOTIgdmF1bHQucHJvY2Vzc1x1RkYwOFx1NTM5Rlx1NUI1MFx1NjZGNFx1NjVCMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVx1RkYwOVxuICAgKiAtIFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgdmF1bHQuY3JlYXRlXHVGRjA4XHU1NDBDXHU2NUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHU1NDhDIE9ic2lkaWFuIFx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKiAtIFx1NTM4Nlx1NTNGMlx1OTA1N1x1NzU1OVx1RkYwOFx1NzhDMVx1NzZEOFx1NjcwOVx1NEY0Nlx1N0YxM1x1NUI1OFx1NjVFMFx1RkYwOVx1MjE5MiBhZGFwdGVyLnJlbW92ZSArIHZhdWx0LmNyZWF0ZVx1RkYwOFx1OEZDMVx1NzlGQlx1OEZEQlx1N0YxM1x1NUI1OFx1RkYwOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB2YXVsdFdyaXRlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gICAgY29uc3QgYWJzdHJhY3QgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgobm9ybWFsaXplZCk7XG5cbiAgICBpZiAoYWJzdHJhY3QgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKCkgPT4gY29udGVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50UGF0aCA9IG5vcm1hbGl6ZWQuc3Vic3RyaW5nKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoJy8nKSk7XG4gICAgaWYgKHBhcmVudFBhdGggJiYgIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXJlbnRQYXRoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIocGFyZW50UGF0aCk7XG4gICAgfVxuXG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKG5vcm1hbGl6ZWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShub3JtYWxpemVkKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUobm9ybWFsaXplZCwgY29udGVudCk7XG4gIH1cblxuICAvLyAtLS0tIFx1NkJDRlx1NjVFNVx1NjU3MFx1NjM2RSAoZGF5cykgLS0tLVxuXG4gIHByaXZhdGUgZGF5UGF0aChkYXRlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGEvJHtkYXRlS2V5fS5qc29uYCk7XG4gIH1cblxuICBhc3luYyBnZXREYXkoZGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxEYXlEYXRhIHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChwYXRoKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIERheURhdGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGBbQmFtYm9vUmV2aWV3XSBcdTY1RTVcdTY3MUZcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdUZGMENcdTVDMDZcdThERjNcdThGQzc6ICR7cGF0aH1gLCBlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFsbERheXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPj4ge1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gICAgY29uc3QgZGF0YURpciA9IG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vZGF0YWApO1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRhdGFEaXIpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IGZpbGVzLmZpbGVzXG4gICAgICAuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzb24nKSlcbiAgICAgIC5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmICghZGF0ZUtleSkgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZChmaWxlKTtcbiAgICAgICAgICBkYXlzW2RhdGVLZXldID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyBEYXlEYXRhO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gcGFyc2UgZGF5IGZpbGU6ICR7ZmlsZX1gLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChyZWFkcyk7XG4gICAgcmV0dXJuIGRheXM7XG4gIH1cblxuICAvKiogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU2NUU1XHU2NzFGIGtleVx1RkYwOFx1NjMwOVx1NjVFNVx1NjcxRlx1OTY0RFx1NUU4Rlx1RkYwQ1x1NjcwMFx1NjVCMFx1NTcyOFx1NTI0RFx1RkYwOSAqL1xuICBhc3luYyBnZXREYXlLZXlzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkYXRhRGlyKTtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5maWxlcykge1xuICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgY29uc3QgZGF0ZUtleSA9IGZpbGUuc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLmpzb24nLCAnJyk7XG4gICAgICAgIGlmIChkYXRlS2V5KSBrZXlzLnB1c2goZGF0ZUtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIGtleXMuc29ydCgpLnJldmVyc2UoKTsgLy8gXHU5NjREXHU1RThGXHVGRjFBXHU2NzAwXHU2NUIwXHU2NUU1XHU2NzFGXHU1NzI4XHU1MjREXG4gICAgcmV0dXJuIGtleXM7XG4gIH1cblxuICAvKipcbiAgICogXHU1MjA2XHU5ODc1XHU1MkEwXHU4RjdEXHU2NUU1XHU2NzFGXHU2NTcwXHU2MzZFXG4gICAqIEBwYXJhbSBwYWdlIFx1OTg3NVx1NzgwMVx1RkYwOFx1NEVDRSAwIFx1NUYwMFx1NTlDQlx1RkYwOVxuICAgKiBAcGFyYW0gcGFnZVNpemUgXHU2QkNGXHU5ODc1XHU2NTcwXHU5MUNGXG4gICAqIEByZXR1cm5zIHsgZGF5cywgdG90YWwsIHBhZ2UsIHBhZ2VTaXplLCBoYXNNb3JlIH1cbiAgICovXG4gIGFzeW5jIGdldERheXNQYWdpbmF0ZWQocGFnZSA9IDAsIHBhZ2VTaXplID0gMzApOiBQcm9taXNlPHtcbiAgICBkYXlzOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPjtcbiAgICBrZXlzOiBzdHJpbmdbXTtcbiAgICB0b3RhbDogbnVtYmVyO1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIGhhc01vcmU6IGJvb2xlYW47XG4gIH0+IHtcbiAgICBjb25zdCBhbGxLZXlzID0gYXdhaXQgdGhpcy5nZXREYXlLZXlzKCk7XG4gICAgY29uc3QgdG90YWwgPSBhbGxLZXlzLmxlbmd0aDtcbiAgICBjb25zdCBzdGFydCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBwYWdlS2V5cyA9IGFsbEtleXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xuICAgIGNvbnN0IGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+ID0ge307XG5cbiAgICBjb25zdCByZWFkcyA9IHBhZ2VLZXlzLm1hcChhc3luYyAoZGF0ZUtleSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0RGF5KGRhdGVLZXkpO1xuICAgICAgICBpZiAoZGF0YSkgZGF5c1tkYXRlS2V5XSA9IGRhdGE7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGxvYWQgZGF5OiAke2RhdGVLZXl9YCwgZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocmVhZHMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheXMsXG4gICAgICBrZXlzOiBwYWdlS2V5cyxcbiAgICAgIHRvdGFsLFxuICAgICAgcGFnZSxcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgaGFzTW9yZTogc3RhcnQgKyBwYWdlS2V5cy5sZW5ndGggPCB0b3RhbCxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcHV0RGF5KGRheURhdGE6IERheURhdGEpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZURpcignZGF0YScpO1xuICAgIGNvbnN0IGRhdGVLZXkgPSBkYXlEYXRhLmRhdGU7XG4gICAgaWYgKCFkYXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RheURhdGEgbXVzdCBoYXZlIGEgZGF0ZSBmaWVsZCcpO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gdGhpcy5kYXlQYXRoKGRhdGVLZXkpO1xuXG4gICAgLy8gXHU1MTk5XHU1Qjg4XHU1MzZCXHVGRjFBXHU2OEMwXHU2RDRCXHU2NTcwXHU2MzZFXHU5MUNGXHU2MEFDXHU1RDE2XHVGRjA4XHU1OTFBXHU2NzYxXHU2NUY2XHU5NUY0XHU3RUJGIFx1MjE5MiBcdThGRDFcdTRFNEVcdTdBN0FcdTU4RjNcdUZGMDlcbiAgICBpZiAoIXRoaXMuX3dhcm5lZFBhdGhzLmhhcyhwYXRoKSkge1xuICAgICAgY29uc3QgbmV3VGltZWxpbmVMZW4gPSBBcnJheS5pc0FycmF5KGRheURhdGEudGltZWxpbmUpID8gZGF5RGF0YS50aW1lbGluZS5sZW5ndGggOiAwO1xuICAgICAgaWYgKG5ld1RpbWVsaW5lTGVuIDw9IDEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gSlNPTi5wYXJzZShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCkpIGFzIERheURhdGE7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1RpbWVsaW5lTGVuID0gQXJyYXkuaXNBcnJheShleGlzdGluZy50aW1lbGluZSkgPyBleGlzdGluZy50aW1lbGluZS5sZW5ndGggOiAwO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nVGltZWxpbmVMZW4gPiAxMCkge1xuICAgICAgICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICAgICAgIGBcdTI2QTBcdUZFMEYgXHU2OEMwXHU2RDRCXHU1MjMwICR7ZGF0ZUtleX0gXHU2NTcwXHU2MzZFXHU1RjAyXHU1RTM4XHU2RTA1XHU3QTdBXHVGRjA4JHtleGlzdGluZ1RpbWVsaW5lTGVufSBcdTY3NjEgXHUyMTkyICR7bmV3VGltZWxpbmVMZW59IFx1Njc2MVx1RkYwOVx1RkYwQ1x1NURGMlx1ODFFQVx1NTJBOFx1NjJFNlx1NjIyQVx1MzAwMlxcblx1NTk4Mlx1Njc5Q1x1Nzg2RVx1NUI5RVx1ODk4MVx1NkUwNVx1N0E3QVx1OEJFNVx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwQ1x1OEJGN1x1NTE4RFx1NkIyMVx1NjRDRFx1NEY1Q1x1MzAwMmBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdGhpcy5fd2FybmVkUGF0aHMuYWRkKHBhdGgpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHsgLyogXHU2NTg3XHU0RUY2XHU2MzVGXHU1NzRGXHU2MjE2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU3RUU3XHU3RUVEXHU2QjYzXHU1RTM4XHU1MTk5XHU1MTY1ICovIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF5RGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlRGF5KGRhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmRheVBhdGgoZGF0ZUtleSk7XG4gICAgaWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIFx1NTE2OFx1NUM0MFx1NzZFRVx1NjgwNyAoZ29hbHMpIC0tLS1cblxuICBwcml2YXRlIGdvYWxzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2dvYWxzLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldEdvYWxzKCk6IFByb21pc2U8R29hbEl0ZW1bXT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdvYWxzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgR29hbEl0ZW1bXTtcbiAgfVxuXG4gIGFzeW5jIHB1dEdvYWxzKGdvYWxzOiBHb2FsSXRlbVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ29hbHNQYXRoKCk7XG5cbiAgICAvLyBcdTUxOTlcdTVCODhcdTUzNkJcdUZGMUFcdTY4QzBcdTZENEJcdTY1NzBcdTYzNkVcdTkxQ0ZcdTYwQUNcdTVEMTZcdUZGMDhOXHU2NzYxXHU3NkVFXHU2ODA3IFx1MjE5MiBcdTdBN0FcdTY1NzBcdTdFQzRcdUZGMDlcbiAgICBpZiAoZ29hbHMubGVuZ3RoID09PSAwICYmICF0aGlzLl93YXJuZWRQYXRocy5oYXMocGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gSlNPTi5wYXJzZShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCkpIGFzIEdvYWxJdGVtW107XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZXhpc3RpbmcpICYmIGV4aXN0aW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgICAgICAgIGBcdTI2QTBcdUZFMEYgXHU2OEMwXHU2RDRCXHU1MjMwXHU3NkVFXHU2ODA3XHU2NTcwXHU2MzZFXHU1RjAyXHU1RTM4XHU2RTA1XHU3QTdBXHVGRjA4JHtleGlzdGluZy5sZW5ndGh9IFx1Njc2MSBcdTIxOTIgXHU3QTdBXHVGRjA5XHVGRjBDXHU1REYyXHU4MUVBXHU1MkE4XHU2MkU2XHU2MjJBXHUzMDAyXFxuXHU1OTgyXHU2NzlDXHU3ODZFXHU1QjlFXHU4OTgxXHU2RTA1XHU3QTdBXHU2MjQwXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU4QkY3XHU1MThEXHU2QjIxXHU2NENEXHU0RjVDXHUzMDAyYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuX3dhcm5lZFBhdGhzLmFkZChwYXRoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggeyAvKiBcdTY1ODdcdTRFRjZcdTYzNUZcdTU3NEZcdTYyMTZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTdFRTdcdTdFRURcdTZCNjNcdTVFMzhcdTUxOTlcdTUxNjUgKi8gfVxuICAgIH1cblxuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeShnb2FscywgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBBSSBcdTg5QzRcdTUyMTJcdTRGQTdcdThGNjZcdTdEMjJcdTVGMTVcdUZGMDhwbGFucy1tYXAuanNvblx1RkYwOS0tLS1cbiAgLy8gXHU3RUQzXHU2Nzg0XHVGRjFBeyBcIjx2YXVsdFBhdGg+Izxjb250ZW50SGFzaD5cIjogc3RyaW5nW10gKGdvYWxJZHMpIH1cbiAgLy8gXHU3NTI4XHU5MDE0XHVGRjFBXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwXHU5MUNEXHU1OTBEXHU4OUM0XHU1MjEyXHU2NUY2XHU2MzA5IGNvbnRlbnRIYXNoIFx1NUU0Mlx1N0I0OVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NzZFRVx1NjgwN1x1OTFDRFx1NTkwRFx1OEZGRFx1NTJBMFx1MzAwMlxuXG4gIHByaXZhdGUgcGxhbnNJbmRleFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9wbGFucy1tYXAuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UGxhbnNJbmRleCgpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPj4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnBsYW5zSW5kZXhQYXRoKCk7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpKSByZXR1cm4ge307XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIHVua25vd247XG4gICAgICBpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnKSByZXR1cm4gcGFyc2VkIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwdXRQbGFuc0luZGV4KG1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHRoaXMucGxhbnNJbmRleFBhdGgoKSwgSlNPTi5zdHJpbmdpZnkobWFwLCBudWxsLCAyKSk7XG4gIH1cblxuICAvLyAtLS0tIFx1OEJCRVx1N0Y2RSAoc2V0dGluZ3MpIC0tLS1cblxuICBwcml2YXRlIHNldHRpbmdzUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3NldHRpbmdzLmpzb25gKTtcbiAgfVxuXG4gIGFzeW5jIGdldFNldHRpbmcoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IHRoaXMuZ2V0QWxsU2V0dGluZ3MoKTtcbiAgICByZXR1cm4gc2V0dGluZ3Nba2V5XSA/PyBudWxsO1xuICB9XG5cbiAgYXN5bmMgcHV0U2V0dGluZyhrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gbm9ybWFsaXplUGF0aCh0aGlzLnNldHRpbmdzUGF0aCgpKTtcbiAgICBjb25zdCBhYnN0cmFjdCA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKTtcblxuICAgIGlmIChhYnN0cmFjdCBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAvLyB2YXVsdC5wcm9jZXNzIFx1NTM5Rlx1NUI1MCByZWFkLW1vZGlmeS13cml0ZVx1RkYwQ1x1Njc1Q1x1N0VERFx1N0FERVx1NjAwMVx1NEUyMlx1NjU3MFx1NjM2RVxuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucHJvY2VzcyhhYnN0cmFjdCwgKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0gSlNPTi5wYXJzZShkYXRhKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgc2V0dGluZ3Nba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBKU09OLnN0cmluZ2lmeSh7IFtrZXldOiB2YWx1ZSB9LCBudWxsLCAyKSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QWxsU2V0dGluZ3MoKTogUHJvbWlzZTxBcHBTZXR0aW5ncz4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnNldHRpbmdzUGF0aCgpO1xuICAgIGlmICghKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZWFkKHBhdGgpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgQXBwU2V0dGluZ3M7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBcdThEMkRcdTRFNzBcdTUzODZcdTUzRjIgKHB1cmNoYXNlLWhpc3RvcnkuanNvbikgLS0tLVxuXG4gIHByaXZhdGUgcHVyY2hhc2VIaXN0b3J5UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L3B1cmNoYXNlLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHVyY2hhc2VIaXN0b3J5KCk6IFByb21pc2U8UHVyY2hhc2VIaXN0b3J5IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgUHVyY2hhc2VIaXN0b3J5O1xuICB9XG5cbiAgYXN5bmMgcHV0UHVyY2hhc2VIaXN0b3J5KGRhdGE6IFB1cmNoYXNlSGlzdG9yeSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnB1cmNoYXNlSGlzdG9yeVBhdGgoKTtcbiAgICBhd2FpdCB0aGlzLnZhdWx0V3JpdGUocGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICB9XG5cbiAgLy8gLS0tLSBcdTY1MzZcdTUxNjVcdTUzODZcdTUzRjIgKGluY29tZS1oaXN0b3J5Lmpzb24pIC0tLS1cblxuICBwcml2YXRlIGluY29tZUhpc3RvcnlQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgoYCR7dGhpcy5iYXNlUGF0aH0vaW5jb21lLWhpc3RvcnkuanNvbmApO1xuICB9XG5cbiAgYXN5bmMgZ2V0SW5jb21lSGlzdG9yeSgpOiBQcm9taXNlPEluY29tZUhpc3RvcnkgfCBudWxsPiB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuaW5jb21lSGlzdG9yeVBhdGgoKTtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgSW5jb21lSGlzdG9yeTtcbiAgfVxuXG4gIGFzeW5jIHB1dEluY29tZUhpc3RvcnkoZGF0YTogSW5jb21lSGlzdG9yeSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmluY29tZUhpc3RvcnlQYXRoKCk7XG4gICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpKTtcbiAgfVxuXG4gIC8vIC0tLS0gXHU1QkZDXHU1MUZBL1x1NUJGQ1x1NTE2NSAtLS0tXG5cbiAgYXN5bmMgZXhwb3J0QWxsRGF0YSgpOiBQcm9taXNlPEV4cG9ydFNoYXBlPiB7XG4gICAgY29uc3QgW2RheXMsIGdvYWxzLCBzZXR0aW5ncywgcHVyY2hhc2VIaXN0b3J5LCBpbmNvbWVIaXN0b3J5XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuZ2V0QWxsRGF5cygpLFxuICAgICAgdGhpcy5nZXRHb2FscygpLFxuICAgICAgdGhpcy5nZXRBbGxTZXR0aW5ncygpLFxuICAgICAgdGhpcy5nZXRQdXJjaGFzZUhpc3RvcnkoKSxcbiAgICAgIHRoaXMuZ2V0SW5jb21lSGlzdG9yeSgpLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICczLjAnLFxuICAgICAgZXhwb3J0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgc3RvcmFnZVR5cGU6ICd2YXVsdCcsXG4gICAgICBkYXlzLFxuICAgICAgZ29hbHMsXG4gICAgICBzZXR0aW5ncyxcbiAgICAgIHB1cmNoYXNlSGlzdG9yeSxcbiAgICAgIGluY29tZUhpc3RvcnksXG4gICAgICB0aGVtZXM6IFtdLFxuICAgICAgcmVwb3J0czogW10sXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGltcG9ydERhdGEoZGF0YTogdW5rbm93biwgb3B0aW9uczogeyBzdHJhdGVneT86ICdvdmVyd3JpdGUnIHwgJ21lcmdlJyB9ID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmVuc3VyZVN0cnVjdHVyZSgpO1xuICAgIGNvbnN0IHN0cmF0ZWd5ID0gb3B0aW9ucy5zdHJhdGVneSA/PyAnb3ZlcndyaXRlJztcblxuICAgIC8vIFAyXHVGRjFBXHU1QkZDXHU1MTY1XHU1MjREXHU2ODIxXHU5QThDICsgXHU1QjU3XHU2QkI1XHU4ODY1XHU5RjUwXHVGRjFCXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHU1NzI4XHU2QjY0XHU4OEFCXHU2MkQyXHU3RUREXHVGRjBDXHU0RTBEXHU2QzYxXHU2N0QzIFZhdWx0XG4gICAgY29uc3QgcmVjb3JkID0gSW1wb3J0VmFsaWRhdG9yLnZhbGlkYXRlKGRhdGEpO1xuXG4gICAgaWYgKHJlY29yZC5kYXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFx1OTYzMlx1NUZBMVx1RkYxQWRheXMgXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU3QTdBXHU1QkY5XHU4QzYxXHU4ODY4XHU3OTNBXHU2RTA1XHU3QTdBXHU1MTY4XHU5MEU4XHU2NUU1XHU2NTcwXHU2MzZFXHVGRjA4XHU0RUM1IG92ZXJ3cml0ZSBcdThCRURcdTRFNDlcdTRFMEJcdTUxNDFcdThCQjhcdUZGMDlcbiAgICAgIGNvbnN0IGRheXMgPSAocmVjb3JkLmRheXMgJiYgdHlwZW9mIHJlY29yZC5kYXlzID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShyZWNvcmQuZGF5cykpXG4gICAgICAgID8gcmVjb3JkLmRheXNcbiAgICAgICAgOiB7fTtcbiAgICAgIGlmIChzdHJhdGVneSA9PT0gJ292ZXJ3cml0ZScpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jbGVhckFsbERheXMoKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgZGF5IG9mIE9iamVjdC52YWx1ZXMoZGF5cykpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdXREYXkoZGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLmdvYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGluY29taW5nOiBHb2FsSXRlbVtdID0gQXJyYXkuaXNBcnJheShyZWNvcmQuZ29hbHMpID8gcmVjb3JkLmdvYWxzIDogW107XG4gICAgICBpZiAoc3RyYXRlZ3kgPT09ICdtZXJnZScpIHtcbiAgICAgICAgLy8gXHU1NDA4XHU1RTc2XHVGRjFBXHU0RkREXHU3NTU5XHU3M0IwXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU1QkZDXHU1MTY1XHU3NkVFXHU2ODA3XHU2MzA5IGlkIFx1ODk4Nlx1NzZENlx1RkYxQlx1N0E3QVx1NjU3MFx1N0VDNFx1NEUwRFx1ODlFNlx1NTNEMVx1NkUwNVx1N0E3QVxuICAgICAgICBjb25zdCBleGlzdGluZyA9IChhd2FpdCB0aGlzLmdldEdvYWxzKCkpIHx8IFtdO1xuICAgICAgICBjb25zdCBtZXJnZWQgPSBuZXcgTWFwKGV4aXN0aW5nLm1hcCgoZykgPT4gW2cuaWQsIGddKSk7XG4gICAgICAgIGZvciAoY29uc3QgZ29hbCBvZiBpbmNvbWluZykge1xuICAgICAgICAgIGlmIChnb2FsICYmIGdvYWwuaWQpIG1lcmdlZC5zZXQoZ29hbC5pZCwgZ29hbCk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5wdXRHb2FscyhBcnJheS5mcm9tKG1lcmdlZC52YWx1ZXMoKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gb3ZlcndyaXRlXHVGRjFBXHU2NTc0XHU0RjUzXHU2NkZGXHU2MzYyXHVGRjA4XHU3QTdBXHU2NTcwXHU3RUM0ID0gXHU2RTA1XHU3QTdBXHVGRjBDXHU3QjI2XHU1NDA4XHU5ODg0XHU2NzFGXHU4QkVEXHU0RTQ5XHVGRjA5XG4gICAgICAgIGF3YWl0IHRoaXMucHV0R29hbHMoaW5jb21pbmcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZWNvcmQuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJiByZWNvcmQuc2V0dGluZ3MgJiYgdHlwZW9mIHJlY29yZC5zZXR0aW5ncyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IGluY29taW5nID0gcmVjb3JkLnNldHRpbmdzO1xuICAgICAgbGV0IHRvV3JpdGU6IEFwcFNldHRpbmdzO1xuICAgICAgaWYgKHN0cmF0ZWd5ID09PSAnbWVyZ2UnKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKGF3YWl0IHRoaXMuZ2V0QWxsU2V0dGluZ3MoKSkgfHwge307XG4gICAgICAgIHRvV3JpdGUgPSB7IC4uLmV4aXN0aW5nLCAuLi5pbmNvbWluZyB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9Xcml0ZSA9IGluY29taW5nO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy52YXVsdFdyaXRlKHRoaXMuc2V0dGluZ3NQYXRoKCksIEpTT04uc3RyaW5naWZ5KHRvV3JpdGUsIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICBpZiAocmVjb3JkLnB1cmNoYXNlSGlzdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLnB1dFB1cmNoYXNlSGlzdG9yeShyZWNvcmQucHVyY2hhc2VIaXN0b3J5KTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5pbmNvbWVIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucHV0SW5jb21lSGlzdG9yeShyZWNvcmQuaW5jb21lSGlzdG9yeSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NEVDNVx1NkUwNVx1N0E3QVx1NjI0MFx1NjcwOVx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwOG92ZXJ3cml0ZSBcdTVCRkNcdTUxNjUgZGF5cyBcdTUyNERcdThDMDNcdTc1MjhcdUZGMENcdTRFMERcdTVGNzFcdTU0Q0QgZ29hbHMvc2V0dGluZ3NcdUZGMDkgKi9cbiAgYXN5bmMgY2xlYXJBbGxEYXlzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGRhdGFEaXIgPSBub3JtYWxpemVQYXRoKGAke3RoaXMuYmFzZVBhdGh9L2RhdGFgKTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMoZGF0YURpcikpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIoZGF0YURpciwgdHJ1ZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZW5zdXJlRGlyKCdkYXRhJyk7XG4gIH1cblxuICAvKiogXHU0RUM1XHU2RTA1XHU3QTdBXHU4QkJFXHU3RjZFXHU2NTg3XHU0RUY2XHVGRjA4b3ZlcndyaXRlIFx1NUJGQ1x1NTE2NSBzZXR0aW5ncyBcdTUyNERcdThDMDNcdTc1MjhcdUZGMDkgKi9cbiAgYXN5bmMgY2xlYXJBbGxTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5zZXR0aW5nc1BhdGgoKTtcbiAgICBpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aCkpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNsZWFyQWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyh0aGlzLmJhc2VQYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ybWRpcih0aGlzLmJhc2VQYXRoLCB0cnVlKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVTdHJ1Y3R1cmUoKTtcbiAgfVxuXG4gIC8vIC0tLS0gTWFya2Rvd24gXHU2NDU4XHU4OTgxIC0tLS1cblxuICBwcml2YXRlIHJldmlld1BhdGgoZGF0ZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHt0aGlzLmJhc2VQYXRofS9yZXZpZXdzLyR7ZGF0ZUtleX0ubWRgKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlTWFya2Rvd25SZXZpZXcoZGF0ZUtleTogc3RyaW5nLCBtYXJrZG93bjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVEaXIoJ3Jldmlld3MnKTtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGF3YWl0IHRoaXMudmF1bHRXcml0ZShwYXRoLCBtYXJrZG93bik7XG4gIH1cblxuICBhc3luYyBkZWxldGVNYXJrZG93blJldmlldyhkYXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5yZXZpZXdQYXRoKGRhdGVLZXkpO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5yZW1vdmUocGF0aCk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBJbXBvcnRWYWxpZGF0b3IgLSBcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTc2ODRcdTY4MjFcdTlBOENcdTRFMEVcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdUZGMDhcdTVCQkZcdTRFM0JcdTRGQTdcdUZGMENcdTk2RjZcdTRGOURcdThENTZcdUZGMDlcbiAqXG4gKiBcdTc1MjhcdTkwMTRcdUZGMUFcdTU3MjggVmF1bHRTdG9yYWdlLmltcG9ydERhdGEgXHU4NDNEXHU3NkQ4XHU1MjREXHU2MkU2XHU2MjJBXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHUzMDAxXHU4ODY1XHU5RjUwXHU3RjNBXHU1OTMxXHU1QjU3XHU2QkI1XHVGRjBDXG4gKiBcdTkwN0ZcdTUxNERcdTUzNEFcdTYyMkEvXHU5NzVFXHU2Q0Q1XHU2NTcwXHU2MzZFXHU2QzYxXHU2N0QzIFZhdWx0XHUzMDAyXG4gKlxuICogXHU4QkJFXHU4QkExXHU1MzlGXHU1MjE5XHVGRjFBXG4gKiAgLSBcdTRFQzVcdTUwNUFcIlx1N0VEM1x1Njc4NFx1NUM0Mlx1OTc2Mlx1NzY4NFx1NUI4OVx1NTE2OFx1NTE1Q1x1NUU5NVwiXHVGRjBDXHU0RTBEXHU5MUNEXHU1MTk5XHU0RTFBXHU1MkExXHU1QjU3XHU2QkI1XHVGRjA4XHU1OTgyIG1ldHJpY3MgXHU3Njg0XHU1MTc3XHU0RjUzXHU2NTcwXHU1MDNDXHVGRjA5XHUzMDAyXG4gKiAgLSBcdTVCNTdcdTZCQjVcdTg4NjVcdTlGNTBcdTRGMThcdTUxNDhcdTc1MjhcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTgxRUFcdThFQUJcdTc2ODQga2V5IC8gXHU1MTg1XHU1QkI5XHVGRjBDXHU3RjNBXHU1OTMxXHU2NUY2XHU2MjREXHU3NTI4XHU1Qjg5XHU1MTY4XHU5RUQ4XHU4QkE0XHU1MDNDXHUzMDAyXG4gKiAgLSBcdTRFRkJcdTRGNTVcdTY1RTBcdTZDRDVcdTRGRUVcdTU5MERcdTc2ODRcdTdFRDNcdTY3ODRcdTYwMjdcdTYzNUZcdTU3NEZcdTkwRkRcdTYyOUIgSW1wb3J0VmFsaWRhdGlvbkVycm9yXHVGRjBDXHU3NTMxXHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU3OTNBXHU3NTI4XHU2MjM3XHUzMDAyXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEYXlEYXRhLFxuICBHb2FsSXRlbSxcbiAgQXBwU2V0dGluZ3MsXG4gIFB1cmNoYXNlSGlzdG9yeSxcbiAgSW5jb21lSGlzdG9yeSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmNsYXNzIEltcG9ydFZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0ltcG9ydFZhbGlkYXRpb25FcnJvcic7XG4gIH1cbn1cblxuY29uc3QgS05PV05fRklFTERTID0gWydkYXlzJywgJ2dvYWxzJywgJ3NldHRpbmdzJywgJ3B1cmNoYXNlSGlzdG9yeScsICdpbmNvbWVIaXN0b3J5J10gYXMgY29uc3Q7XG5cbi8qKlxuICogXHU3RUI1XHU2REYxXHU5NjMyXHU1RkExXHVGRjFBXHU1QkZDXHU1MTY1XHU2NTcwXHU2MzZFXHU2NjJGXHU0RTBEXHU1M0VGXHU0RkUxXHU4RkI5XHU3NTRDXHVGRjA4XHU1M0VGXHU4MEZEXHU2NzY1XHU4MUVBXHU0RUQ2XHU0RUJBXHU1MjA2XHU0RUFCL1x1NEUwQlx1OEY3RFx1NzY4NFx1NTkwN1x1NEVGRFx1RkYwOVx1MzAwMlxuICogXHU1NzI4XHU4NDNEXHU3NkQ4XHU1MjREXHU5MDEyXHU1RjUyXHU1MUMwXHU1MzE2XHU2MjQwXHU2NzA5XHU1QjU3XHU3QjI2XHU0RTMyXHU1M0Y2XHU1QjUwXHVGRjBDXHU1MjY1XHU3OUJCIEhUTUwgXHU2ODA3XHU3QjdFXHUzMDAxXHU0RThCXHU0RUY2XHU1OTA0XHU3NDA2XHU1QzVFXHU2MDI3XG4gKiBcdTRFMEUgamF2YXNjcmlwdDovZGF0YTogXHU0RjJBXHU1MzRGXHU4QkFFXHVGRjBDXHU5MDdGXHU1MTREXHU2MDc2XHU2MTBGXHU4RDFGXHU4RjdEXHU3RUNGIGlubmVySFRNTCBcdTZFMzJcdTY3RDNcdTg5RTZcdTUzRDEgWFNTXHUzMDAyXG4gKiBcdTY3MkNcdTk4NzlcdTc2RUVcdTY1RTBcdTVCQ0NcdTY1ODdcdTY3MkNcdTk3MDBcdTZDNDJcdUZGMENcdTdFREZcdTRFMDBcdTY1ODdcdTY3MkNcdTUzMTZcdTY2MkZcdTVCODlcdTUxNjhcdTc2ODRcdTMwMDJcbiAqL1xuZnVuY3Rpb24gc2FuaXRpemVTdHJpbmcoaW5wdXQ6IHVua25vd24pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykgcmV0dXJuIGlucHV0IGFzIHN0cmluZztcbiAgY29uc3Qgb3V0ID0gaW5wdXRcbiAgICAucmVwbGFjZSgvPFtePl0qPi9nLCAnJykgLy8gXHU3OUZCXHU5NjY0XHU2MjQwXHU2NzA5IEhUTUwgXHU2ODA3XHU3QjdFXG4gICAgLnJlcGxhY2UoL1xcc29uXFx3K1xccyo9XFxzKlwiW15cIl0qXCIvZ2ksICcnKSAvLyBcdTc5RkJcdTk2NjQgb24qPVwiLi4uXCJcbiAgICAucmVwbGFjZSgvXFxzb25cXHcrXFxzKj1cXHMqJ1teJ10qJy9naSwgJycpIC8vIFx1NzlGQlx1OTY2NCBvbio9Jy4uLidcbiAgICAucmVwbGFjZSgvXFxzb25cXHcrXFxzKj1cXHMqW15cXHM+XSsvZ2ksICcnKSAvLyBcdTc5RkJcdTk2NjQgb24qPXZhbHVlXHVGRjA4XHU2NUUwXHU1RjE1XHU1M0Y3XHVGRjA5XG4gICAgLnJlcGxhY2UoL2phdmFzY3JpcHQ6L2dpLCAnJykgLy8gXHU3OUZCXHU5NjY0IGphdmFzY3JpcHQ6IFx1NEYyQVx1NTM0Rlx1OEJBRVxuICAgIC5yZXBsYWNlKC9kYXRhOi9naSwgJycpOyAvLyBcdTc5RkJcdTk2NjQgZGF0YTogXHU0RjJBXHU1MzRGXHU4QkFFXG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplVmFsdWUodmFsdWU6IHVua25vd24pOiB1bmtub3duIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHJldHVybiBzYW5pdGl6ZVN0cmluZyh2YWx1ZSk7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlLm1hcCgodikgPT4gc2FuaXRpemVWYWx1ZSh2KSk7XG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xuICAgICAgb3V0W2tleV0gPSBzYW5pdGl6ZVZhbHVlKCh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbiAgcmV0dXJuIHZhbHVlOyAvLyBcdTY1NzBcdTVCNTcgLyBcdTVFMDNcdTVDMTQgLyBudWxsIFx1N0I0OVx1NTM5Rlx1NjgzN1x1NEZERFx1NzU1OVxufVxuXG5pbnRlcmZhY2UgVmFsaWRhdGVkSW1wb3J0IHtcbiAgZGF5cz86IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICBnb2Fscz86IEdvYWxJdGVtW107XG4gIHNldHRpbmdzPzogQXBwU2V0dGluZ3M7XG4gIHB1cmNoYXNlSGlzdG9yeT86IFB1cmNoYXNlSGlzdG9yeTtcbiAgaW5jb21lSGlzdG9yeT86IEluY29tZUhpc3Rvcnk7XG59XG5cbmV4cG9ydCBjb25zdCBJbXBvcnRWYWxpZGF0b3IgPSB7XG4gIC8qKlxuICAgKiBcdTY4MjFcdTlBOENcdTVFNzZcdTg4NjVcdTlGNTBcdTVCRkNcdTUxNjVcdTY1NzBcdTYzNkVcdTMwMDJcbiAgICogQHJldHVybnMgXHU4ODY1XHU5RjUwXHU1NDBFXHU3Njg0XHU1RTcyXHU1MUMwXHU2NTcwXHU2MzZFXHVGRjA4XHU3RUQzXHU2Nzg0XHU0RTBFXHU4RjkzXHU1MTY1XHU0RTAwXHU4MUY0XHVGRjBDXHU0RjQ2XHU1QjU3XHU2QkI1XHU1QjhDXHU2NTc0XHVGRjA5XG4gICAqIEB0aHJvd3MgSW1wb3J0VmFsaWRhdGlvbkVycm9yIFx1NUY1M1x1N0VEM1x1Njc4NFx1NjM1Rlx1NTc0Rlx1NjVFMFx1NkNENVx1NEZFRVx1NTkwRFx1NjVGNlxuICAgKi9cbiAgdmFsaWRhdGUoZGF0YTogdW5rbm93bik6IFZhbGlkYXRlZEltcG9ydCB7XG4gICAgaWYgKCFkYXRhIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKCdcdTU5MDdcdTRFRkRcdTY1ODdcdTRFRjZcdTY4M0NcdTVGMEZcdTY1RTBcdTY1NDhcdUZGMUFcdTY4MzlcdTgyODJcdTcwQjlcdTVGQzVcdTk4N0JcdTY2MkYgSlNPTiBcdTVCRjlcdThDNjEnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSBkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgLy8gXHU2MzVGXHU1NzRGXHU2NTg3XHU0RUY2XHU2MkQyXHU3RUREXHVGRjFBXHU2Q0ExXHU2NzA5XHU0RUZCXHU0RjU1XHU1REYyXHU3N0U1XHU1QjU3XHU2QkI1IFx1MjE5MiBcdTg5QzZcdTRFM0FcdTYzNUZcdTU3NEYvXHU2NUUwXHU1MTczXHU2NTg3XHU0RUY2XG4gICAgY29uc3QgaGFzS25vd25GaWVsZCA9IEtOT1dOX0ZJRUxEUy5zb21lKChmKSA9PiByZWNvcmRbZl0gIT09IHVuZGVmaW5lZCk7XG4gICAgaWYgKCFoYXNLbm93bkZpZWxkKSB7XG4gICAgICB0aHJvdyBuZXcgSW1wb3J0VmFsaWRhdGlvbkVycm9yKFxuICAgICAgICAnXHU1OTA3XHU0RUZEXHU2NTg3XHU0RUY2XHU2NUUwXHU2NTQ4XHVGRjFBXHU2NzJBXHU2MjdFXHU1MjMwXHU0RUZCXHU0RjU1XHU1M0VGXHU4QkM2XHU1MjJCXHU3Njg0XHU2NTcwXHU2MzZFXHU1QjU3XHU2QkI1XHVGRjA4ZGF5cyAvIGdvYWxzIC8gc2V0dGluZ3MgLyBwdXJjaGFzZUhpc3RvcnkgLyBpbmNvbWVIaXN0b3J5XHVGRjA5J1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFZhbGlkYXRlZEltcG9ydCA9IHt9O1xuXG4gICAgaWYgKHJlY29yZC5kYXlzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5kYXlzID0gc2FuaXRpemVWYWx1ZShJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplRGF5cyhyZWNvcmQuZGF5cykpIGFzIFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICAgIH1cbiAgICBpZiAocmVjb3JkLmdvYWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5nb2FscyA9IHNhbml0aXplVmFsdWUoSW1wb3J0VmFsaWRhdG9yLm5vcm1hbGl6ZUdvYWxzKHJlY29yZC5nb2FscykpIGFzIEdvYWxJdGVtW107XG4gICAgfVxuICAgIGlmIChyZWNvcmQuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0LnNldHRpbmdzID0gc2FuaXRpemVWYWx1ZShJbXBvcnRWYWxpZGF0b3Iubm9ybWFsaXplU2V0dGluZ3MocmVjb3JkLnNldHRpbmdzKSkgYXMgQXBwU2V0dGluZ3M7XG4gICAgfVxuICAgIGlmIChyZWNvcmQucHVyY2hhc2VIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5wdXJjaGFzZUhpc3RvcnkgPSBzYW5pdGl6ZVZhbHVlKHJlY29yZC5wdXJjaGFzZUhpc3RvcnkpIGFzIFB1cmNoYXNlSGlzdG9yeTtcbiAgICB9XG4gICAgaWYgKHJlY29yZC5pbmNvbWVIaXN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdC5pbmNvbWVIaXN0b3J5ID0gc2FuaXRpemVWYWx1ZShyZWNvcmQuaW5jb21lSGlzdG9yeSkgYXMgSW5jb21lSGlzdG9yeTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgZGF5c1x1MzAwMlxuICAgKiAgLSBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCRjlcdThDNjFcdUZGMUJcdTk3NUVcdTVCRjlcdThDNjFcdUZGMDhcdTU5ODJcdTY1NzBcdTdFQzQvXHU1QjU3XHU3QjI2XHU0RTMyXHVGRjA5XHUyMTkyIFx1ODlDNlx1NEUzQVx1NjVFMFx1NjVFNVx1NjU3MFx1NjM2RVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NUJGOVx1OEM2MVx1RkYwOFx1NEUwRFx1NkM2MVx1NjdEMyBWYXVsdFx1RkYwOVxuICAgKiAgLSBcdTZCQ0ZcdTRFMkEgZGF5IFx1N0YzQSBkYXRlIFx1NjVGNlx1NzUyOFx1NTE3NiBrZXkgXHU4ODY1XHU5RjUwXG4gICAqICAtIFx1NkJDRlx1NEUyQSBkYXkgXHU3RjNBIG1ldHJpY3MvdGltZWxpbmUvZ29hbHMgXHU2NUY2XHU4ODY1XHU3QTdBXHU3RUQzXHU2Nzg0XG4gICAqL1xuICBub3JtYWxpemVEYXlzKGRheXM6IHVua25vd24pOiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiB7XG4gICAgaWYgKCFkYXlzIHx8IHR5cGVvZiBkYXlzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRheXMpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHJhdyA9IGRheXMgYXMgUmVjb3JkPHN0cmluZywgRGF5RGF0YT47XG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCBEYXlEYXRhPiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocmF3KSkge1xuICAgICAgY29uc3QgZGF5ID0gcmF3W2tleV07XG4gICAgICBpZiAoIWRheSB8fCB0eXBlb2YgZGF5ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGRheSkpIHtcbiAgICAgICAgY29udGludWU7IC8vIFx1OERGM1x1OEZDN1x1OTc1RVx1NUJGOVx1OEM2MVx1Njc2MVx1NzZFRVxuICAgICAgfVxuICAgICAgY29uc3QgY2xlYW46IERheURhdGEgPSB7IC4uLmRheSB9O1xuICAgICAgaWYgKCFjbGVhbi5kYXRlKSBjbGVhbi5kYXRlID0ga2V5OyAvLyBcdTc1Mjgga2V5IFx1ODg2NSBkYXRlXG4gICAgICBpZiAoIWNsZWFuLm1ldHJpY3MgfHwgdHlwZW9mIGNsZWFuLm1ldHJpY3MgIT09ICdvYmplY3QnKSBjbGVhbi5tZXRyaWNzID0ge307XG4gICAgICBpZiAoIWNsZWFuLnRpbWVsaW5lIHx8ICFBcnJheS5pc0FycmF5KGNsZWFuLnRpbWVsaW5lKSkgY2xlYW4udGltZWxpbmUgPSBbXTtcbiAgICAgIGlmICghY2xlYW4uZ29hbHMgfHwgIUFycmF5LmlzQXJyYXkoY2xlYW4uZ29hbHMpKSBjbGVhbi5nb2FscyA9IFtdO1xuICAgICAgb3V0W2tleV0gPSBjbGVhbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSxcblxuICAvKipcbiAgICogXHU1RjUyXHU0RTAwXHU1MzE2IGdvYWxzXHUzMDAyXG4gICAqICAtIFx1NUZDNVx1OTg3Qlx1NjYyRlx1NjU3MFx1N0VDNFx1RkYxQlx1OTc1RVx1NjU3MFx1N0VDNCBcdTIxOTIgXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gICAqICAtIFx1NkJDRlx1NEUyQSBnb2FsIFx1N0YzQSBpZCBcdTY1RjZcdTg4NjVcdTRFMDBcdTRFMkFcdTdBMzNcdTVCOUFcdTUzRUZcdTU5MERcdTczQjBcdTc2ODQgaWRcbiAgICovXG4gIG5vcm1hbGl6ZUdvYWxzKGdvYWxzOiB1bmtub3duKTogR29hbEl0ZW1bXSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGdvYWxzKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgcmV0dXJuIGdvYWxzLm1hcCgocmF3KTogR29hbEl0ZW0gPT4ge1xuICAgICAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShyYXcpKSByZXR1cm4gcmF3IGFzIEdvYWxJdGVtO1xuICAgICAgY29uc3Qgb2JqID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgY29uc3QgY2xlYW4gPSB7IC4uLm9iaiB9IGFzIHVua25vd24gYXMgR29hbEl0ZW07XG4gICAgICBpZiAoIWNsZWFuLmlkKSB7XG4gICAgICAgIGNsZWFuLmlkID0gYGdvYWxfaW1wb3J0XyR7Y291bnRlcisrfV8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfWA7XG4gICAgICB9XG4gICAgICBpZiAoY2xlYW4uaXRlbXMgJiYgIUFycmF5LmlzQXJyYXkoY2xlYW4uaXRlbXMpKSBjbGVhbi5pdGVtcyA9IFtdO1xuICAgICAgcmV0dXJuIGNsZWFuO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBcdTVGNTJcdTRFMDBcdTUzMTYgc2V0dGluZ3NcdTMwMDJcbiAgICogIC0gXHU1RkM1XHU5ODdCXHU2NjJGXHU1QkY5XHU4QzYxXHVGRjFCXHU5NzVFXHU1QkY5XHU4QzYxIFx1MjE5MiBcdThGRDRcdTU2REVcdTdBN0FcdTVCRjlcdThDNjFcbiAgICovXG4gIG5vcm1hbGl6ZVNldHRpbmdzKHNldHRpbmdzOiB1bmtub3duKTogQXBwU2V0dGluZ3Mge1xuICAgIGlmICghc2V0dGluZ3MgfHwgdHlwZW9mIHNldHRpbmdzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHNldHRpbmdzKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4gc2V0dGluZ3MgYXMgQXBwU2V0dGluZ3M7XG4gIH0sXG59O1xuIiwgIlxuLyoqXG4gKiBUaGVtZUJyaWRnZSAtIFx1NzZEMVx1NTQyQyBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdUZGMENcdTYzQThcdTkwMDFcdTUyMzAgaWZyYW1lXG4gKiAgICAgICAgICAgICAgKyBcdTUzQ0RcdTU0MTFcdUZGMUFcdTYzQTVcdTY1MzYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTAzQ1x1RkYwQ1x1NkNFOFx1NTE2NSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAqL1xuZXhwb3J0IGNsYXNzIFRoZW1lQnJpZGdlIHtcbiAgICBwcml2YXRlIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIF9wYWxldHRlU3luY1RpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIC8qKiBcdTVCNThcdTUwQThcdTZDRThcdTUxNjVcdTc2ODQgQ1NTIFx1NTNEOFx1OTFDRlx1OTUyRVx1NTQwRFx1RkYwQ1x1NzUyOFx1NEU4RSByZXN0b3JlRGVmYXVsdHMgXHU2RTA1XHU3NDA2ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgSU5KRUNURURfVkFSUyA9IFtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCcsXG4gICAgICAnLS1pbnRlcmFjdGl2ZS1hY2NlbnQtaG92ZXInLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnLFxuICAgICAgJy0tYmFja2dyb3VuZC1wcmltYXJ5JyxcbiAgICAgICctLWJhY2tncm91bmQtc2Vjb25kYXJ5JyxcbiAgICAgICctLXRleHQtbm9ybWFsJyxcbiAgICAgICctLXRleHQtbXV0ZWQnLFxuICAgIF07XG5cbiAgICAvKiogXHU5NjMyXHU2Mjk2XHU3QURFXHU2MDAxXHU2ODA3XHU4QkIwXHVGRjFBcmVzdG9yZURlZmF1bHRzIFx1ODhBQlx1OEMwM1x1NzUyOFx1NTQwRVx1OEJCRVx1NEUzQSB0cnVlXHVGRjBDXHU5NjNCXHU2QjYyXHU1RUY2XHU4RkRGXHU1NkRFXHU4QzAzXHU4OTg2XHU1MTk5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3N1cHByZXNzZWQgPSBmYWxzZTtcblxuICBhdHRhY2hJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xuICB9XG5cbiAgZGV0YWNoSWZyYW1lKCk6IHZvaWQge1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNEQgT2JzaWRpYW4gXHU2NjBFXHU2Njk3XHU3MkI2XHU2MDAxXHVGRjA4XHU0RUM1XHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHVGRjA5ICovXG4gIHByaXZhdGUgaXNEYXJrTW9kZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYWN0aXZlRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3RoZW1lLWRhcmsnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgQ1NTIFx1OTg5Q1x1ODI3Mlx1NUI1N1x1N0IyNlx1NEUzMiBcdTIxOTIgW3IsIGcsIGJdXHVGRjA4MFx1MjAxMzI1NSBcdTY1NzRcdTY1NzBcdUZGMDlcbiAgICogXHU2NTJGXHU2MzAxIHJnYigpL3JnYmEoKS8jaGV4XHVGRjA4MyBcdTYyMTYgNiBcdTRGNERcdUZGMDlcdUZGMUJcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTBcdThGRDRcdTU2REUgbnVsbFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VDb2xvclRvUmdiKGNvbG9yOiBzdHJpbmcpOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfCBudWxsIHtcbiAgICBpZiAoIWNvbG9yKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBjID0gY29sb3IudHJpbSgpO1xuICAgIGxldCByOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyO1xuXG4gICAgY29uc3QgcmdiTWF0Y2ggPSBjLm1hdGNoKC9yZ2JhP1xcKChbXildKylcXCkvaSk7XG4gICAgaWYgKHJnYk1hdGNoKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IHJnYk1hdGNoWzFdLnNwbGl0KCcsJykubWFwKChzKSA9PiBwYXJzZUZsb2F0KHMpKTtcbiAgICAgIFtyLCBnLCBiXSA9IHBhcnRzO1xuICAgIH0gZWxzZSBpZiAoY1swXSA9PT0gJyMnKSB7XG4gICAgICBsZXQgaGV4ID0gYy5zbGljZSgxKTtcbiAgICAgIGlmIChoZXgubGVuZ3RoID09PSAzKSBoZXggPSBoZXguc3BsaXQoJycpLm1hcCgoY2gpID0+IGNoICsgY2gpLmpvaW4oJycpO1xuICAgICAgaWYgKGhleC5sZW5ndGggPCA2KSByZXR1cm4gbnVsbDtcbiAgICAgIHIgPSBwYXJzZUludChoZXguc2xpY2UoMCwgMiksIDE2KTtcbiAgICAgIGcgPSBwYXJzZUludChoZXguc2xpY2UoMiwgNCksIDE2KTtcbiAgICAgIGIgPSBwYXJzZUludChoZXguc2xpY2UoNCwgNiksIDE2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFtyLCBnLCBiXS5zb21lKCh2KSA9PiBpc05hTih2KSkpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBbTWF0aC5yb3VuZChyKSwgTWF0aC5yb3VuZChnKSwgTWF0aC5yb3VuZChiKV07XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIENTUyBcdTk4OUNcdTgyNzJcdTVCNTdcdTdCMjZcdTRFMzIgXHUyMTkyIEhTTCBcdTgyNzJcdTc2RjggSFx1RkYwODBcdTIwMTMzNjBcdUZGMDlcbiAgICogXHU3NTI4XHU0RThFXHU2MjhBIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1NzY4NCAtLWludGVyYWN0aXZlLWFjY2VudCBcdTUzQ0RcdTYzQThcdTRFM0FcdTYzRDJcdTRFRjZcdTc2ODQgLS1hY2NlbnQtaHVlXG4gICAqL1xuICBzdGF0aWMgcmdiVG9IdWUoY29sb3I6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICAgIGNvbnN0IHJnYiA9IFRoZW1lQnJpZGdlLnBhcnNlQ29sb3JUb1JnYihjb2xvcik7XG4gICAgaWYgKCFyZ2IpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IFtyLCBnLCBiXSA9IHJnYjtcblxuICAgIGNvbnN0IHJuID0gciAvIDI1NSwgZ24gPSBnIC8gMjU1LCBibiA9IGIgLyAyNTU7XG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXgocm4sIGduLCBibiksIG1pbiA9IE1hdGgubWluKHJuLCBnbiwgYm4pLCBkID0gbWF4IC0gbWluO1xuICAgIGlmIChkID09PSAwKSByZXR1cm4gMDtcblxuICAgIGxldCBoOiBudW1iZXI7XG4gICAgaWYgKG1heCA9PT0gcm4pIGggPSAoKGduIC0gYm4pIC8gZCkgJSA2O1xuICAgIGVsc2UgaWYgKG1heCA9PT0gZ24pIGggPSAoYm4gLSBybikgLyBkICsgMjtcbiAgICBlbHNlIGggPSAocm4gLSBnbikgLyBkICsgNDtcblxuICAgIGggPSBNYXRoLnJvdW5kKGggKiA2MCk7XG4gICAgcmV0dXJuIGggPCAwID8gaCArIDM2MCA6IGg7XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIENTUyBcdTk4OUNcdTgyNzJcdTVCNTdcdTdCMjZcdTRFMzIgXHUyMTkyIFwiciwgZywgYlwiIFx1NEUwOVx1NTE0M1x1N0VDNFx1NUI1N1x1N0IyNlx1NEUzMlxuICAgKiBcdTc1MjhcdTRFOEVcdTYyOEEgT2JzaWRpYW4gXHU0RkE3XHU4RkI5XHU2ODBGXHU4MENDXHU2NjZGIC0tYmFja2dyb3VuZC1zZWNvbmRhcnkgXHU1NDBDXHU2QjY1XHU0RTNBXHU2M0QyXHU0RUY2XHU1MzYxXHU3MjQ3XHU1RTk1XHU4MjcyXHVGRjBDXG4gICAqIFx1OEJBOVx1NjNEMlx1NEVGNlx1NTM2MVx1NzI0N1x1ODI3Mlx1NkUyOVx1OEQzNFx1OEZEMSBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICovXG4gIHN0YXRpYyByZ2JUb1JnYlN0cmluZyhjb2xvcjogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgcmdiID0gVGhlbWVCcmlkZ2UucGFyc2VDb2xvclRvUmdiKGNvbG9yKTtcbiAgICBpZiAoIXJnYikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHJnYi5qb2luKCcsICcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NTQxMSBpZnJhbWUgXHU2M0E4XHU5MDAxXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU3MkI2XHU2MDAxXG4gICAqIEBwYXJhbSBmb2xsb3dPYnNpZGlhblRoZW1lIFx1NEUzQSB0cnVlIFx1NjVGNlx1RkYwQ1x1OTY0NFx1NUUyNlx1NEVDRSBPYnNpZGlhbiBcdTRFM0JcdTk4OThcbiAgICogICAgICAgIC0taW50ZXJhY3RpdmUtYWNjZW50IFx1NTNDRFx1NjNBOFx1NzY4NFx1NjEwRlx1NTg4M1x1ODI3Mlx1NzZGOCBodWVcdUZGMENcdTlBNzFcdTUyQThcdTYzRDJcdTRFRjZcdTY1NzRcdTc2RDhcdTkxNERcdTgyNzJcdTgwNTRcdTUyQThcbiAgICovXG4gIHB1c2hUaGVtZShmb2xsb3dPYnNpZGlhblRoZW1lID0gZmFsc2UpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaWZyYW1lPy5jb250ZW50V2luZG93KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXlsb2FkOiB7IGlzRGFyazogYm9vbGVhbjsgaHVlPzogbnVtYmVyOyBiZz86IHN0cmluZzsgdGV4dE5vcm1hbD86IHN0cmluZzsgdGV4dE11dGVkPzogc3RyaW5nIH0gPSB7XG4gICAgICBpc0Rhcms6IHRoaXMuaXNEYXJrTW9kZSgpLFxuICAgIH07XG5cbiAgICBpZiAoZm9sbG93T2JzaWRpYW5UaGVtZSkge1xuICAgICAgY29uc3QgYWNjZW50ID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1pbnRlcmFjdGl2ZS1hY2NlbnQnKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgaHVlID0gVGhlbWVCcmlkZ2UucmdiVG9IdWUoYWNjZW50KTtcbiAgICAgIGlmIChodWUgIT09IG51bGwpIHBheWxvYWQuaHVlID0gaHVlO1xuXG4gICAgICAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTgwQ0NcdTY2NkZcdTgyNzJcdUZGMUFcdTlBNzFcdTUyQThcdTYzRDJcdTRFRjZcdTUzNjFcdTcyNDdcdTVFOTVcdTgyNzJcdThEMzRcdThGRDEgT2JzaWRpYW4gXHU4MjcyXHU2RTI5XG4gICAgICBjb25zdCBzaWRlYmFyID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeScpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCBiZyA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHNpZGViYXIpO1xuICAgICAgaWYgKGJnICE9PSBudWxsKSBwYXlsb2FkLmJnID0gYmc7XG5cbiAgICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3Mlx1RkYxQVx1OUE3MVx1NTJBOFx1NjNEMlx1NEVGNlx1NjU4N1x1NUI1N1x1ODI3Mlx1NkUyOVx1OEQzNFx1OEZEMSBPYnNpZGlhblxuICAgICAgY29uc3QgdGV4dE5vcm1hbCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tdGV4dC1ub3JtYWwnKVxuICAgICAgICAudHJpbSgpO1xuICAgICAgY29uc3QgdGV4dE5vcm1hbFJnYiA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHRleHROb3JtYWwpO1xuICAgICAgaWYgKHRleHROb3JtYWxSZ2IgIT09IG51bGwpIHBheWxvYWQudGV4dE5vcm1hbCA9IHRleHROb3JtYWxSZ2I7XG5cbiAgICAgIGNvbnN0IHRleHRNdXRlZCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0tdGV4dC1tdXRlZCcpXG4gICAgICAgIC50cmltKCk7XG4gICAgICBjb25zdCB0ZXh0TXV0ZWRSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0TXV0ZWQpO1xuICAgICAgaWYgKHRleHRNdXRlZFJnYiAhPT0gbnVsbCkgcGF5bG9hZC50ZXh0TXV0ZWQgPSB0ZXh0TXV0ZWRSZ2I7XG4gICAgfVxuXG4gICAgdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICBpZDogJ3RoZW1lX3B1c2hfJyArIERhdGUubm93KCksXG4gICAgICAgIHBheWxvYWQsXG4gICAgICB9LFxuICAgICAgJyonXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBcdTRGOUJcdTU5MTZcdTkwRThcdThDMDNcdTc1MjhcdUZGMUFPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTUzRDhcdTUzMTZcdTY1RjZcdTg5RTZcdTUzRDEgKi9cbiAgb25UaGVtZUNoYW5nZWQoZm9sbG93T2JzaWRpYW5UaGVtZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoVGhlbWUoZm9sbG93T2JzaWRpYW5UaGVtZSk7XG4gIH1cblxuICAvLyA9PT09PSBcdTUzQ0NcdTU0MTFcdThDMDNcdTgyNzIgPT09PT1cblxuICAvKipcbiAgICogXHU4QkExXHU3Qjk3IHdlYmFwcCBcdTgyNzJcdTc2RjgvXHU2NjBFXHU1RUE2IFx1MjE5MiBPYnNpZGlhbiBDU1MgXHU1M0Q4XHU5MUNGXHU2NjIwXHU1QzA0XG4gICAqIFx1NEVDNVx1ODk4Nlx1NzZENiAzIFx1N0M3Qlx1NjgzOFx1NUZDM1x1ODI3Mlx1RkYwOFx1NUYzQVx1OEMwMy9cdTgwQ0NcdTY2NkYvXHU2NTg3XHU1QjU3XHVGRjA5XHVGRjBDXHU1MTc2XHU0RjU5XHU3NTMxIE9ic2lkaWFuIFx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NjNBOFx1N0I5N1xuICAgKi9cbiAgc3RhdGljIGNvbXB1dGVPYnNpZGlhblZhcnMoaHVlOiBudW1iZXIsIGxpZ2h0bmVzc09mZnNldDogbnVtYmVyLCBpc0Rhcms6IGJvb2xlYW4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCBoID0gTWF0aC5yb3VuZChodWUpO1xuICAgIGNvbnN0IGxvID0gTWF0aC5tYXgoLTMwLCBNYXRoLm1pbigzMCwgbGlnaHRuZXNzT2Zmc2V0KSk7XG5cbiAgICAvLyBcdTVGM0FcdThDMDNcdTgyNzJcbiAgICBjb25zdCBhY2NlbnRTID0gNDA7XG4gICAgY29uc3QgYWNjZW50TCA9IGlzRGFyayA/IDUwIDogNDA7XG4gICAgY29uc3QgYWNjZW50ID0gYGhzbCgke2h9LCAke2FjY2VudFN9JSwgJHthY2NlbnRMfSUpYDtcbiAgICBjb25zdCBhY2NlbnRIb3ZlciA9IGBoc2woJHtofSwgJHthY2NlbnRTfSUsICR7YWNjZW50TCArIDV9JSlgO1xuXG4gICAgLy8gXHU4MENDXHU2NjZGXHU4MjcyXG4gICAgY29uc3QgYmdTID0gaXNEYXJrID8gOCA6IDEyO1xuICAgIGNvbnN0IGJnTCA9IGlzRGFya1xuICAgICAgPyBNYXRoLm1heCg1LCAxMiArIGxvICogMC4zKVxuICAgICAgOiBNYXRoLm1pbig5OCwgOTQgKyBsbyAqIDAuMTUpO1xuICAgIGNvbnN0IGJnUHJpbWFyeSA9IGBoc2woJHtofSwgJHtiZ1N9JSwgJHtiZ0x9JSlgO1xuICAgIGNvbnN0IGJnU2Vjb25kYXJ5ID0gYGhzbCgke2h9LCAke2JnU30lLCAke2lzRGFyayA/IGJnTCArIDMgOiBiZ0wgLSAyfSUpYDtcblxuICAgIC8vIFx1NjU4N1x1NUI1N1x1ODI3MlxuICAgIGNvbnN0IHRleHROb3JtYWwgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDYlLCA4OCUpYCA6IGBoc2woJHtofSwgNiUsIDEyJSlgO1xuICAgIGNvbnN0IHRleHRNdXRlZCAgPSBpc0RhcmsgPyBgaHNsKCR7aH0sIDQlLCA1NSUpYCA6IGBoc2woJHtofSwgNCUsIDQ1JSlgO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudCc6IGFjY2VudCxcbiAgICAgICctLWludGVyYWN0aXZlLWFjY2VudC1ob3Zlcic6IGFjY2VudEhvdmVyLFxuICAgICAgJy0tdGV4dC1hY2NlbnQnOiBhY2NlbnQsXG4gICAgICAnLS1iYWNrZ3JvdW5kLXByaW1hcnknOiBiZ1ByaW1hcnksXG4gICAgICAnLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSc6IGJnU2Vjb25kYXJ5LFxuICAgICAgJy0tdGV4dC1ub3JtYWwnOiB0ZXh0Tm9ybWFsLFxuICAgICAgJy0tdGV4dC1tdXRlZCc6IHRleHRNdXRlZCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1OEMwM1x1ODI3Mlx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcbiAgICogNTBtcyBkZWJvdW5jZVx1RkYwQ1x1OTYzMlx1NkI2Mlx1ODI3Mlx1NzZGOC9cdTY2MEVcdTVFQTZcdTZFRDFcdTU3NTdcdTVGRUJcdTkwMUZcdTYyRDZcdTYyRkRcdTRFQTdcdTc1MUZcdTlBRDhcdTk4OTEgRE9NIFx1NTE5OVx1NTE2NVxuICAgKi9cbiAgYXBwbHlQYWxldHRlKGh1ZTogbnVtYmVyLCBsaWdodG5lc3NPZmZzZXQ6IG51bWJlciwgaXNEYXJrOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhbGV0dGVTeW5jVGltZXIpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcGFsZXR0ZVN5bmNUaW1lcik7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSBmYWxzZTsgLy8gXHU2NUIwXHU4QzAzXHU4MjcyXHU4QkY3XHU2QzQyXHU1MjMwXHU2NzY1IFx1MjE5MiBcdTg5RTNcdTk2NjRcdTYyOTFcdTUyMzZcbiAgICB0aGlzLl9wYWxldHRlU3luY1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKFRoZW1lQnJpZGdlLl9zdXBwcmVzc2VkKSByZXR1cm47IC8vIHJlc3RvcmVEZWZhdWx0cyBcdTU3MjhcdTk2MzJcdTYyOTZcdTdBOTdcdTUzRTNcdTUxODVcdTg4QUJcdThDMDNcdTc1MjhcbiAgICAgIGNvbnN0IHZhcnMgPSBUaGVtZUJyaWRnZS5jb21wdXRlT2JzaWRpYW5WYXJzKGh1ZSwgbGlnaHRuZXNzT2Zmc2V0LCBpc0RhcmspO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmFycykpIHtcbiAgICAgICAgYWN0aXZlRG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvKiogXHU2RTA1XHU5NjY0XHU2Q0U4XHU1MTY1XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTYwNjJcdTU5MEQgT2JzaWRpYW4gXHU0RTNCXHU5ODk4XHU5RUQ4XHU4QkE0XHU1MDNDICovXG4gIHN0YXRpYyByZXN0b3JlRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgVGhlbWVCcmlkZ2UuX3N1cHByZXNzZWQgPSB0cnVlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFRoZW1lQnJpZGdlLklOSkVDVEVEX1ZBUlMpIHtcbiAgICAgIGFjdGl2ZURvY3VtZW50LmJvZHkuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKiogXHU2NTJGXHU2MzAxXHU3Njg0XHU5N0YzXHU5ODkxXHU2NTg3XHU0RUY2XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjA4XHU1QjhDXHU2NTc0XHU1MjE3XHU4ODY4XHVGRjA5ICovXG5leHBvcnQgY29uc3QgQUxMT1dFRF9BVURJT19FWFRFTlNJT05TID0gW1xuICAnLm1wMycsICcud2F2JywgJy5vZ2cnLCAnLmZsYWMnLCAnLmFhYycsICcubTRhJywgJy53bWEnLCAnLndlYm0nLCAnLm9wdXMnLFxuXTtcblxuLyoqIFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRCBcdTIxOTIgTUlNRSBcdTdDN0JcdTU3OEIgKi9cbmNvbnN0IEFVRElPX01JTUVfVFlQRVM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICcubXAzJzogICdhdWRpby9tcGVnJyxcbiAgJy53YXYnOiAgJ2F1ZGlvL3dhdicsXG4gICcub2dnJzogICdhdWRpby9vZ2cnLFxuICAnLmZsYWMnOiAnYXVkaW8vZmxhYycsXG4gICcuYWFjJzogICdhdWRpby9hYWMnLFxuICAnLm00YSc6ICAnYXVkaW8vbXA0JyxcbiAgJy53bWEnOiAgJ2F1ZGlvL3gtbXMtd21hJyxcbiAgJy53ZWJtJzogJ2F1ZGlvL3dlYm0nLFxuICAnLm9wdXMnOiAnYXVkaW8vb3B1cycsXG59O1xuXG4vKiogXHU1QjhDXHU2NTc0IE1JTUUgXHU3QzdCXHU1NzhCXHU2NjIwXHU1QzA0XHVGRjA4XHU1NDJCIHdlYmFwcCBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdUZGMDkgKi9cbmV4cG9ydCBjb25zdCBNSU1FX1RZUEVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnLmh0bWwnOiAndGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5jc3MnOiAgJ3RleHQvY3NzOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5qcyc6ICAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLFxuICAnLm1qcyc6ICAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcsXG4gICcuanNvbic6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgJy5wbmcnOiAgJ2ltYWdlL3BuZycsXG4gICcuanBnJzogICdpbWFnZS9qcGVnJyxcbiAgJy5qcGVnJzogJ2ltYWdlL2pwZWcnLFxuICAnLmdpZic6ICAnaW1hZ2UvZ2lmJyxcbiAgJy5zdmcnOiAgJ2ltYWdlL3N2Zyt4bWwnLFxuICAnLmljbyc6ICAnaW1hZ2UveC1pY29uJyxcbiAgJy53b2ZmJzogJ2ZvbnQvd29mZicsXG4gICcud29mZjInOidmb250L3dvZmYyJyxcbiAgJy50dGYnOiAgJ2ZvbnQvdHRmJyxcbiAgLi4uQVVESU9fTUlNRV9UWVBFUyxcbn07XG4iLCAiLyoqXG4gKiBwcm90b2NvbC50cyBcdTIwMTQgaG9zdCBcdTRGQTdcdTUzNEZcdThCQUVcdTdDN0JcdTU3OEJcdTk1NUNcdTUwQ0ZcbiAqXG4gKiBcdTY3MkNcdTY1ODdcdTRFRjZcdTY2MkYgd2ViYXBwL2Fzc2V0cy9zY3JpcHRzL3V0aWxzL3Byb3RvY29sLmpzIFx1NzY4NCBUeXBlU2NyaXB0IFx1NUU3Nlx1ODg0Q1x1NTI2Rlx1NjcyQ1x1MzAwMlxuICogXHU0RTI0XHU3QUVGXHU1RkM1XHU5ODdCXHU0RkREXHU2MzAxIFBST1RPQ09MX1ZFUlNJT04gXHU0RTBFIEFMTF9NRVNTQUdFX1RZUEVTIFx1NTQwQ1x1NkI2NVx1MzAwMlxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYxQVxuICogLSBQUk9UT0NPTF9WRVJTSU9OXHVGRjFBXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU0RTI0XHU3QUVGXHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFCXG4gKiAtIEFMTF9NRVNTQUdFX1RZUEVTXHVGRjFBd2ViYXBwXHUyMTk0aG9zdCBcdTUzQ0NcdTU0MTFcdTUxNjhcdTkwRThcdTVERjJcdTc3RTVcdTZEODhcdTYwNkZcdTdDN0JcdTU3OEJcdTc2ODRcdTUzNTVcdTRFMDBcdTRFOEJcdTVCOUVcdTZFOTBcdUZGMUJcbiAqIC0gSU5CT1VORF9QUkVGSVhFU1x1RkYxQWhvc3QgXHU0RkE3IG9uTWVzc2FnZSBcdTc2N0RcdTU0MERcdTUzNTVcdUZGMUJcbiAqIC0gQ29tbWFuZFR5cGVcdUZGMUFcdTVCRkNcdTgyMkEvQWN0aW9uIFx1NjMwN1x1NEVFNFx1ODA1NFx1NTQwOFx1N0M3Qlx1NTc4Qlx1RkYwOFdlYmFwcENvbnRyb2xsZXIgXHU0RjdGXHU3NTI4XHVGRjA5XHUzMDAyXG4gKi9cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyAgXHU1MzRGXHU4QkFFXHU3MjQ4XHU2NzJDIFx1MjAxNCBcdTk4N0JcdTRFMEUgd2ViYXBwL2Fzc2V0cy9zY3JpcHRzL3V0aWxzL3Byb3RvY29sLmpzIFx1NTQwQ1x1NkI2NVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgY29uc3QgUFJPVE9DT0xfVkVSU0lPTiA9IDE7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gIFx1NkQ4OFx1NjA2Rlx1NTI0RFx1N0YwMFx1RkYwOGhvc3QgXHU0RkE3IG9uTWVzc2FnZSBcdTY3NjVcdTZFOTBcdTUyNERcdTdGMDBcdTc2N0RcdTU0MERcdTUzNTVcdUZGMDlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IElOQk9VTkRfUFJFRklYRVMgPSBbJ3N0b3JhZ2U6JywgJ2FwcDonLCAnZmlsZTonLCAndGhlbWU6J10gYXMgY29uc3Q7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gIFx1NTE2OFx1OTBFOFx1NURGMlx1NzdFNSBtZXNzYWdlIHR5cGVcdUZGMDhcdTUzQ0NcdTU0MTFcdUZGMDlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IEFMTF9NRVNTQUdFX1RZUEVTID0gW1xuICAvLyAtLS0tIHdlYmFwcCBcdTIxOTIgaG9zdCAtLS0tXG4gICdhcHA6cmVhZHknLFxuICAnYXBwOmNsb3NlJyxcbiAgJ2FwcDpzYXZlU2VjdGlvbkNvbmZpZycsXG4gICdhcHA6c2F2ZUN1c3RvbU5vaXNlcycsXG4gICdhcHA6dGhlbWU6c3luYycsXG4gICd0aGVtZTpzeW5jUGFsZXR0ZScsXG4gICdhcHA6bGlzdFZhdWx0QXVkaW9GaWxlcycsXG4gICdhcHA6cmVhZFZhdWx0RmlsZScsXG4gICdhcHA6cmVhZExvY2FsRmlsZScsXG4gICdhcHA6cHJveHlBdWRpb1VybCcsXG4gIC8vIHN0b3JhZ2U6Klx1RkYwODE3IFx1NEUyQVx1NUI1MFx1N0M3Qlx1NTc4Qlx1RkYwOVxuICAnc3RvcmFnZTpyZWFkRGF5JyxcbiAgJ3N0b3JhZ2U6d3JpdGVEYXknLFxuICAnc3RvcmFnZTpsaXN0RGF5cycsXG4gICdzdG9yYWdlOmRlbGV0ZURheScsXG4gICdzdG9yYWdlOmdldFNldHRpbmcnLFxuICAnc3RvcmFnZTpwdXRTZXR0aW5nJyxcbiAgJ3N0b3JhZ2U6Z2V0QWxsU2V0dGluZ3MnLFxuICAnc3RvcmFnZTpnZXRHb2FscycsXG4gICdzdG9yYWdlOnB1dEdvYWxzJyxcbiAgJ3N0b3JhZ2U6Z2V0UHVyY2hhc2VIaXN0b3J5JyxcbiAgJ3N0b3JhZ2U6cHV0UHVyY2hhc2VIaXN0b3J5JyxcbiAgJ3N0b3JhZ2U6Z2V0SW5jb21lSGlzdG9yeScsXG4gICdzdG9yYWdlOnB1dEluY29tZUhpc3RvcnknLFxuICAnc3RvcmFnZTpnZXREYXlLZXlzJyxcbiAgJ3N0b3JhZ2U6Z2V0RGF5c1BhZ2luYXRlZCcsXG4gICdzdG9yYWdlOmV4cG9ydEFsbCcsXG4gICdzdG9yYWdlOmltcG9ydEFsbCcsXG4gICdzdG9yYWdlOmNsZWFyQWxsJyxcblxuICAvLyAtLS0tIGhvc3QgXHUyMTkyIHdlYmFwcCAtLS0tXG4gICdnb2FsczpjaGFuZ2VkJyxcbiAgJ3RoZW1lOmNoYW5nZWQnLFxuICAndGhlbWU6Zm9sbG93RGlzYWJsZWQnLFxuICAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgJ25hdjpwcmV2RGF5JyxcbiAgJ25hdjpuZXh0RGF5JyxcbiAgJ25hdjp0b2RheScsXG4gICdhY3Rpb246b3BlblN0YXRzJyxcbiAgJ2FjdGlvbjpvcGVuU2V0dGluZ3MnLFxuXSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgQXBwTWVzc2FnZVR5cGUgPSAodHlwZW9mIEFMTF9NRVNTQUdFX1RZUEVTKVtudW1iZXJdO1xuXG4vKiogbmF2OiAvIGFjdGlvbjogXHU2MzA3XHU0RUU0XHU3QzdCXHU1NzhCXHVGRjA4V2ViYXBwQ29udHJvbGxlciBcdTRGN0ZcdTc1MjhcdUZGMDkgKi9cbmV4cG9ydCB0eXBlIENvbW1hbmRUeXBlID0gRXh0cmFjdDxBcHBNZXNzYWdlVHlwZSwgYG5hdjoke3N0cmluZ31gIHwgYGFjdGlvbjoke3N0cmluZ31gPjtcbiIsICIvKipcbiAqIFdlYmFwcENvbnRyb2xsZXIgXHUyMDE0IFx1NUJCRlx1NEUzQiBcdTIxOTIgd2ViYXBwIFx1NzY4NFx1N0M3Qlx1NTc4Qlx1NTMxNlx1NzZGNFx1OEZERVx1NjNBNVx1NTNFM1x1RkYwOFBoYXNlM1x1RkYwOVxuICpcbiAqIFx1NjZGRlx1NEVFMyBtYWluLnRzIFx1NEUyRFx1NjU2M1x1ODQzRFx1NzY4NFx1NUI1N1x1N0IyNlx1NEUzMlx1NjMwN1x1NEVFNCBgc2VuZFRvV2ViYXBwKCduYXY6cHJldkRheScpYFx1MzAwMlxuICogXHU1QkJGXHU0RTNCXHU0RkE3XHU2NTM5XHU3NTI4IGBuYXZQcmV2RGF5KClgIFx1N0I0OVx1OEJFRFx1NEU0OVx1NTMxNlx1NjVCOVx1NkNENVx1OEMwM1x1NzUyOFx1RkYwQ1x1NTE4NVx1OTBFOFx1NEVDRFx1N0VDRlxuICogYERhaWx5UmV2aWV3Vmlldy5zZW5kQ29tbWFuZGAgXHU4RDcwXHU2NUUyXHU2NzA5IHBvc3RNZXNzYWdlIFx1N0VCRlx1NTM0Rlx1OEJBRVx1RkYwOGBuYXY6KmAvYGFjdGlvbjoqYFx1RkYwOVx1MjAxNFx1MjAxNFxuICogXHU1MzczXHUzMDBDXHU3NkY0XHU2M0E1IEFQSSBcdTk1RThcdTk3NjIgKyBcdTY1RTJcdTY3MDlcdTY4NjVcdTUxN0NcdTVCQjlcdTVDNDJcdTMwMERcdUZGMEN3ZWJhcHAgXHU0RkE3XHU2NUUwXHU5NzAwXHU2NTM5XHU1MkE4XHVGRjBDXHU1M0VGXHU1MjA2XHU2QjY1XHU1MjA3XHU2MzYyXHUzMDAyXG4gKlxuICogXHU4QkU1XHU4RkI5XHU3NTRDXHU0RkREXHU2MzAxXHU0RTBEXHU1MkE4XHVGRjFBd2ViYXBwIFx1NEVDRFx1OTAxQVx1OEZDNyBgbWVzc2FnZWAgXHU3NkQxXHU1NDJDIGB7dHlwZSxpZH1gIFx1NUU3Nlx1NTRDRFx1NUU5NFx1RkYwQ1xuICogXHU1NkUwXHU2QjY0XHU2NzJDXHU5MUNEXHU2Nzg0XHU5NkY2XHU1NkRFXHU1RjUyXHU5OENFXHU5NjY5XHUzMDAxXHU0RTE0XHU1M0VGXHU1NzI4XHU1QkJGXHU0RTNCXHU0RkE3XHU1MzU1XHU2RDRCXHU5NTAxXHU1QjlBXHU2MzA3XHU0RUU0XHU2NjIwXHU1QzA0XHUzMDAyXG4gKlxuICogQ29tbWFuZFR5cGUgXHU0RUNFIHByb3RvY29sLnRzIFx1OTZDNlx1NEUyRFx1NUI5QVx1NEU0OVx1RkYwOFx1OTYzNlx1NkJCNTMgXHUwMEI3IFx1NTk1MVx1N0VBNlx1NTMxNlx1RkYwOVx1RkYwQ1xuICogXHU2QjY0XHU1OTA0XHU5MUNEXHU1QkZDXHU1MUZBXHU0RUU1XHU0RkREXHU2MzAxXHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjA4XHU2NUUyXHU2NzA5IGltcG9ydCB7IENvbW1hbmRUeXBlIH0gZnJvbSAnV2ViYXBwQ29udHJvbGxlcicgXHU0RTBEXHU3ODM0XHVGRjA5XHUzMDAyXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBDb21tYW5kVHlwZSB9IGZyb20gJy4vcHJvdG9jb2wnO1xuXG5leHBvcnQgdHlwZSB7IENvbW1hbmRUeXBlIH0gZnJvbSAnLi9wcm90b2NvbCc7XG5cbi8qKiBcdTYzMDdcdTRFRTRcdTRFMEJcdTUzRDFcdTc2RUVcdTY4MDdcdUZGMDhEYWlseVJldmlld1ZpZXcgXHU2RUUxXHU4REIzXHU2QjY0XHU1OTUxXHU3RUE2XHVGRjA5ICovXG5pbnRlcmZhY2UgQ29tbWFuZFRhcmdldCB7XG4gIHNlbmRDb21tYW5kKHR5cGU6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJhcHBDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBnZXRUYXJnZXQ6ICgpID0+IENvbW1hbmRUYXJnZXQgfCBudWxsKSB7fVxuXG4gIHByaXZhdGUgc2VuZCh0eXBlOiBDb21tYW5kVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGFyZ2V0KCk/LnNlbmRDb21tYW5kKHR5cGUpO1xuICB9XG5cbiAgLyoqIFx1NTI0RFx1NEUwMFx1NTkyOSAqL1xuICBuYXZQcmV2RGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnbmF2OnByZXZEYXknKTtcbiAgfVxuXG4gIC8qKiBcdTU0MEVcdTRFMDBcdTU5MjkgKi9cbiAgbmF2TmV4dERheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ25hdjpuZXh0RGF5Jyk7XG4gIH1cblxuICAvKiogXHU1NkRFXHU1MjMwXHU0RUNBXHU1OTI5ICovXG4gIG5hdlRvZGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnbmF2OnRvZGF5Jyk7XG4gIH1cblxuICAvKiogXHU2MjUzXHU1RjAwXHU3RURGXHU4QkExXHU1MjA2XHU2NzkwICovXG4gIG9wZW5TdGF0cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoJ2FjdGlvbjpvcGVuU3RhdHMnKTtcbiAgfVxuXG4gIC8qKiBcdTYyNTNcdTVGMDBcdTVFOTRcdTc1MjhcdThCQkVcdTdGNkUgKi9cbiAgb3BlblNldHRpbmdzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VuZCgnYWN0aW9uOm9wZW5TZXR0aW5ncycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1OTAxQVx1NzdFNSB3ZWJhcHAgXHU3NkVFXHU2ODA3XHU1RTkzXHU1REYyXHU1M0Q4XHU2NkY0XHVGRjA4aG9zdFx1MjE5MndlYmFwcFx1RkYwOVx1MzAwMlxuICAgKiB3ZWJhcHAgXHU2NTM2XHU1MjMwXHU1NDBFXHU4QzAzXHU3NTI4IEdvYWxTZXJ2aWNlLmxvYWQoKSBcdTkxQ0RcdThCRkIgZ29hbHMuanNvbiBcdTVFNzYgc3RvcmUubm90aWZ5KCkgXHU1QzQwXHU5MEU4XHU1MjM3XHU2NUIwXHVGRjBDXG4gICAqIFx1NEUwRFx1ODlFNlx1NTNEMVx1NTE2OFx1NUM0MCByZW5kZXJBbGxcdUZGMENcdTkwN0ZcdTUxNERcdTUxQjJcdTYzODlcdTY1RjZcdTk1RjRcdThGNzQgLyBcdThGREJcdTg4NENcdTRFMkRcdTcyQjZcdTYwMDFcdTMwMDJcbiAgICovXG4gIG5vdGlmeUdvYWxzQ2hhbmdlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmdldFRhcmdldCgpPy5zZW5kQ29tbWFuZCgnZ29hbHM6Y2hhbmdlZCcpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgQmFtYm9vUmV2aWV3UGx1Z2luIGZyb20gJy4uLy4uL21haW4nO1xuaW1wb3J0IHsgVGhlbWVCcmlkZ2UgfSBmcm9tICcuLi9icmlkZ2UvVGhlbWVCcmlkZ2UnO1xuXG4vKiogT2JzaWRpYW4gXHU2M0QyXHU0RUY2XHU4RkQwXHU4ODRDXHU2NUY2XHU2Q0U4XHU1MTY1XHU3Njg0XHU0RTNCXHU3QTk3XHU1M0UzIGRvY3VtZW50XHVGRjA4XHU5NzVFIGlmcmFtZSBcdTUxODVcdTc2ODQgZG9jdW1lbnRcdUZGMDkgKi9cbmRlY2xhcmUgY29uc3QgYWN0aXZlRG9jdW1lbnQ6IERvY3VtZW50O1xuXG4vKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU3NjdEXHU1NjZBXHU5N0YzXHU5N0YzXHU2RTkwICovXG5leHBvcnQgaW50ZXJmYWNlIE5vaXNlSXRlbSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgdHlwZTogJ3VybCcgfCAndmF1bHQnIHwgJ2dlbmVyYXRlZCc7XG4gIHVybD86IHN0cmluZztcbiAgcGF0aD86IHN0cmluZztcbiAgdm9sdW1lPzogbnVtYmVyO1xufVxuXG4vKiogXHU2M0QyXHU0RUY2XHU4QkJFXHU3RjZFXHU2M0E1XHU1M0UzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhbWJvb1Jldmlld1NldHRpbmdzIHtcbiAgLyoqIFx1NjU3MFx1NjM2RVx1NUI1OFx1NTBBOFx1NjgzOVx1OERFRlx1NUY4NCAqL1xuICBkYXRhUGF0aDogc3RyaW5nO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MSAqL1xuICBlbmFibGVNYXJrZG93blN5bmM6IGJvb2xlYW47XG4gIC8qKiBcdTY3N0ZcdTU3NTdcdTdCQTFcdTc0MDZcdTkxNERcdTdGNkVcdUZGMDhKU09OIFx1ODlFM1x1Njc5MFx1NTQwRVx1N0VEM1x1Njc4NFx1NEUwRFx1NTZGQVx1NUI5QVx1RkYwQ1x1NEY3Rlx1NzUyOFx1NUJCRFx1Njc3RVx1N0M3Qlx1NTc4Qlx1RkYwOSAqL1xuICBzZWN0aW9uQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGw7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OThcdTUyQThcdTY1NDhcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDkgKi9cbiAgdGhlbWVQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMDhWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTc1NTlcdTdBN0FcdTUyMTlcdTYyNkJcdTYzQ0ZcdTUxNjhcdTVFOTNcdUZGMDkgKi9cbiAgbm9pc2VQYXRoOiBzdHJpbmc7XG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTc2N0RcdTU2NkFcdTk3RjNcdTk3RjNcdTZFOTBcdTUyMTdcdTg4NjggKi9cbiAgbm9pc2VJdGVtczogTm9pc2VJdGVtW107XG4gIC8qKiBcdTY2MkZcdTU0MjZcdTVDMDYgd2ViYXBwIFx1OEMwM1x1ODI3Mlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjIgKi9cbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBib29sZWFuO1xuICAvKiogXHU2NjJGXHU1NDI2XHU4QkE5XHU2M0QyXHU0RUY2XHU5MTREXHU4MjcyXHU4RERGXHU5NjhGIE9ic2lkaWFuIFx1NEUzQlx1OTg5OFx1RkYwOFx1OEJGQlx1NTNENiAtLWludGVyYWN0aXZlLWFjY2VudCBcdTUzQ0RcdTYzQThcdTgyNzJcdTc2RjhcdUZGMDkgKi9cbiAgZm9sbG93T2JzaWRpYW5UaGVtZTogYm9vbGVhbjtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBBSSBcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTg5QzRcdTUyMTJcdUZGMDhcdTdCMTRcdThCQjAgXHUyMTkyIFx1NzZFRVx1NjgwN1x1NTM2MVx1NzI0N1x1RkYwOSAqL1xuICBhaUVuYWJsZWQ6IGJvb2xlYW47XG4gIC8qKiBBSSBcdTY3MERcdTUyQTEgQVBJIEtleVx1RkYwOEJlYXJlciBcdTkyNzRcdTY3NDNcdUZGMDkgKi9cbiAgYWlBcGlLZXk6IHN0cmluZztcbiAgLyoqIEFJIFx1NjcwRFx1NTJBMSBCYXNlIFVSTFx1RkYwOFx1NEUwRFx1NTQyQiAvY2hhdC9jb21wbGV0aW9ucyBcdTU0MEVcdTdGMDBcdUZGMENcdTU5ODIgaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tL3YxXHVGRjA5ICovXG4gIGFpQmFzZVVybDogc3RyaW5nO1xuICAvKiogXHU2QTIxXHU1NzhCXHU1NDBEXHVGRjA4XHU1OTgyIGRlZXBzZWVrLWNoYXRcdUZGMDkgKi9cbiAgYWlNb2RlbDogc3RyaW5nO1xuICAvKiogXHU5RUQ4XHU4QkE0XHU2MkM2XHU4OUUzXHU3QzkyXHU1RUE2XHVGRjFBXHU3Qzk3KDItMykgLyBcdTRFMkQoMy02KSAvIFx1N0VDNig1LTgpIFx1NUI1MFx1OTg3OSAqL1xuICBhaURlY29tcG9zZURlcHRoOiAnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNic7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBCYW1ib29SZXZpZXdTZXR0aW5ncyA9IHtcbiAgZGF0YVBhdGg6ICdiYW1ib28tcmV2aWV3JyxcbiAgZW5hYmxlTWFya2Rvd25TeW5jOiB0cnVlLFxuICBzZWN0aW9uQ29uZmlnOiBudWxsLFxuICB0aGVtZVBhdGg6ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnLFxuICBub2lzZVBhdGg6ICcnLFxuICBub2lzZUl0ZW1zOiBbXSxcbiAgc3luY1BhbGV0dGVUb09ic2lkaWFuOiBmYWxzZSxcbiAgZm9sbG93T2JzaWRpYW5UaGVtZTogdHJ1ZSxcbiAgYWlFbmFibGVkOiBmYWxzZSxcbiAgYWlBcGlLZXk6ICcnLFxuICBhaUJhc2VVcmw6ICdodHRwczovL2FwaS5kZWVwc2Vlay5jb20vdjEnLFxuICBhaU1vZGVsOiAnZGVlcHNlZWstY2hhdCcsXG4gIGFpRGVjb21wb3NlRGVwdGg6ICdcdTRFMkQnLFxufTtcblxuLyoqXG4gKiBQbHVnaW5TZXR0aW5ncyAtIE9ic2lkaWFuIFx1NTM5Rlx1NzUxRlx1OEJCRVx1N0Y2RVx1OTc2Mlx1Njc3RlxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2V0dGluZ3MgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBCYW1ib29SZXZpZXdQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQmFtYm9vUmV2aWV3UGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2JhbWJvby1yZXZpZXctc2V0dGluZ3MnKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAgLSBcdThCQkVcdTdGNkUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyA9PT0gXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4ID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQTgnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODRcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTY1NzBcdTYzNkVcdTVCNThcdTUwQThcdThERUZcdTVGODQnKVxuICAgICAgLnNldERlc2MoJ1x1NTkwRFx1NzZEOFx1NjU3MFx1NjM2RVx1NTcyOCBWYXVsdCBcdTRFMkRcdTc2ODRcdTVCNThcdTUwQThcdTc2RUVcdTVGNTVcdUZGMDhcdTRGRUVcdTY1MzlcdTU0MEVcdTk3MDBcdTkxQ0RcdTU0MkZcdTYzRDJcdTRFRjZcdUZGMDknKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2JhbWJvby1yZXZpZXcnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kYXRhUGF0aCA9IHZhbHVlIHx8ICdiYW1ib28tcmV2aWV3JztcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gTWFya2Rvd24gXHU2NDU4XHU4OTgxXHU1NDBDXHU2QjY1XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwIE1hcmtkb3duIFx1NjQ1OFx1ODk4MScpXG4gICAgICAuc2V0RGVzYygnXHU2QkNGXHU2QjIxXHU0RkREXHU1QjU4XHU1OTBEXHU3NkQ4XHU2NTcwXHU2MzZFXHU2NUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1NzI4IHJldmlld3MvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzUxRlx1NjIxMFx1NTNFRlx1OEJGQlx1NzY4NCAubWQgXHU2NTg3XHU0RUY2JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuYWJsZU1hcmtkb3duU3luYylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVNYXJrZG93blN5bmMgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IFx1NEUzQlx1OTg5OFx1NTJBOFx1NjU0OCA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnXHU0RTNCXHU5ODk4XHU1MkE4XHU2NTQ4Jykuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU4MUVBXHU1QjlBXHU0RTQ5XHU0RTNCXHU5ODk4XHU4REVGXHU1Rjg0JylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTVCNThcdTY1M0VcdTgxRUFcdTVCOUFcdTRFNDlcdTRFM0JcdTk4OTggLmpzIFx1NjU4N1x1NEVGNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3QUY5XHU2Nzk3XHU1OTBEXHU3NkQ4XHU0RTNCXHU5ODk4JylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudGhlbWVQYXRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnRoZW1lUGF0aCA9IHZhbHVlIHx8ICdcdTdBRjlcdTY3OTdcdTU5MERcdTc2RDhcdTRFM0JcdTk4OTgnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAvLyA9PT0gXHU3NjdEXHU1NjZBXHU5N0YzID09PVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjMnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTc2N0RcdTU2NkFcdTk3RjNcdTY1ODdcdTRFRjZcdTU5MzknKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NjMwN1x1NUI5QVx1NTQwRVx1NEVDNVx1NjI2Qlx1NjNDRlx1OEJFNVx1NjU4N1x1NEVGNlx1NTkzOVx1NTE4NVx1NzY4NFx1OTdGM1x1OTg5MVx1NjU4N1x1NEVGNlx1MzAwMlx1NzU1OVx1N0E3QVx1NTIxOVx1NjI2Qlx1NjNDRlx1NjU3NFx1NEUyQVx1NUU5M1x1RkYwOFx1NEZFRVx1NjUzOVx1NTQwRVx1OTcwMFx1OTFDRFx1NTQyRlx1NjNEMlx1NEVGNlx1RkYwOScpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignXHU3NjdEXHU1NjZBXHU5N0YzIFx1NjIxNlx1NzU1OVx1N0E3QVx1NjI2Qlx1NjNDRlx1NTE2OFx1NUU5MycpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm5vaXNlUGF0aClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ub2lzZVBhdGggPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vID09PSBcdThDMDNcdTgyNzJcdTgwNTRcdTUyQTggPT09XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoJ1x1OEMwM1x1ODI3Mlx1ODA1NFx1NTJBOCcpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1OERERlx1OTY4RiBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTkxNERcdTgyNzInKVxuICAgICAgLnNldERlc2MoJ1x1NjI1M1x1NUYwMFx1NTQwRVx1RkYwQ1x1NjNEMlx1NEVGNlx1NjU3NFx1NEY1M1x1OTE0RFx1ODI3Mlx1NEYxQVx1OERERlx1OTY4Rlx1NUY1M1x1NTI0RCBPYnNpZGlhbiBcdTRFM0JcdTk4OThcdTc2ODRcdTVGM0FcdThDMDNcdTgyNzJcdUZGMDgtLWludGVyYWN0aXZlLWFjY2VudFx1RkYwOVx1MzAwMlx1NTIwN1x1NjM2MiBCYW1ib28gQ2hpbmEgXHU3Njg0XHU3QUY5XHU1RjcxIC8gXHU1OEE4XHU1OTFDIC8gXHU4MEVEXHU4MTAyIC8gXHU5NzUyXHU3RUZGXHU3QjQ5XHU2MTBGXHU1ODgzXHU2NUY2XHVGRjBDXHU2M0QyXHU0RUY2XHU5MTREXHU4MjcyXHU5NjhGXHU0RTRCXHU4MDU0XHU1MkE4JylcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmZvbGxvd09ic2lkaWFuVGhlbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sbG93T2JzaWRpYW5UaGVtZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGFjdGl2ZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElGcmFtZUVsZW1lbnQ+KCcuYmFtYm9vLXJldmlldy1mcmFtZScpO1xuICAgICAgICAgICAgaWYgKCFmcmFtZT8uY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgIC8vIFx1N0FDQlx1NTM3M1x1NjNBOFx1OTAwMVx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NUYzQVx1OEMwM1x1ODI3Mlx1NTNDRFx1NjNBOFx1NzY4NFx1ODI3Mlx1NzZGOCArIFx1NEZBN1x1OEZCOVx1NjgwRlx1ODBDQ1x1NjY2Rlx1ODI3Mlx1NkUyOSArIFx1NjU4N1x1NUI1N1x1ODI3Mlx1NkUyOVxuICAgICAgICAgICAgICBjb25zdCBhY2NlbnQgPSBnZXRDb21wdXRlZFN0eWxlKGFjdGl2ZURvY3VtZW50LmJvZHkpXG4gICAgICAgICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJy0taW50ZXJhY3RpdmUtYWNjZW50JylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCBodWUgPSBUaGVtZUJyaWRnZS5yZ2JUb0h1ZShhY2NlbnQpO1xuICAgICAgICAgICAgICBjb25zdCBzaWRlYmFyID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLWJhY2tncm91bmQtc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCBiZyA9IFRoZW1lQnJpZGdlLnJnYlRvUmdiU3RyaW5nKHNpZGViYXIpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9ybWFsID0gZ2V0Q29tcHV0ZWRTdHlsZShhY3RpdmVEb2N1bWVudC5ib2R5KVxuICAgICAgICAgICAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCctLXRleHQtbm9ybWFsJylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9ybWFsUmdiID0gVGhlbWVCcmlkZ2UucmdiVG9SZ2JTdHJpbmcodGV4dE5vcm1hbCk7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHRNdXRlZCA9IGdldENvbXB1dGVkU3R5bGUoYWN0aXZlRG9jdW1lbnQuYm9keSlcbiAgICAgICAgICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZSgnLS10ZXh0LW11dGVkJylcbiAgICAgICAgICAgICAgICAudHJpbSgpO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0TXV0ZWRSZ2IgPSBUaGVtZUJyaWRnZS5yZ2JUb1JnYlN0cmluZyh0ZXh0TXV0ZWQpO1xuICAgICAgICAgICAgICBjb25zdCBwYXlsb2FkOiB7IGlzRGFyazogYm9vbGVhbjsgaHVlPzogbnVtYmVyOyBiZz86IHN0cmluZzsgdGV4dE5vcm1hbD86IHN0cmluZzsgdGV4dE11dGVkPzogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAgICAgaXNEYXJrOiBhY3RpdmVEb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygndGhlbWUtZGFyaycpLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpZiAoaHVlICE9PSBudWxsKSBwYXlsb2FkLmh1ZSA9IGh1ZTtcbiAgICAgICAgICAgICAgaWYgKGJnICE9PSBudWxsKSBwYXlsb2FkLmJnID0gYmc7XG4gICAgICAgICAgICAgIGlmICh0ZXh0Tm9ybWFsUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHROb3JtYWwgPSB0ZXh0Tm9ybWFsUmdiO1xuICAgICAgICAgICAgICBpZiAodGV4dE11dGVkUmdiICE9PSBudWxsKSBwYXlsb2FkLnRleHRNdXRlZCA9IHRleHRNdXRlZFJnYjtcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOmNoYW5nZWQnLFxuICAgICAgICAgICAgICAgIGlkOiAnc2V0dGluZ3NfJyArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1NTE3M1x1OTVFRFx1ODA1NFx1NTJBOCBcdTIxOTIgXHU5MDFBXHU3N0U1IGlmcmFtZSBcdTYwNjJcdTU5MERcdTc1MjhcdTYyMzdcdTYyNEJcdTUyQThcdThDMDNcdTgyNzJcbiAgICAgICAgICAgICAgZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RoZW1lOmZvbGxvd0Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHt9LFxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHU1QzA2XHU4QzAzXHU4MjcyXHU1NDBDXHU2QjY1XHU1MjMwIE9ic2lkaWFuJylcbiAgICAgIC5zZXREZXNjKCdcdTYyNTNcdTVGMDBcdTU0MEVcdUZGMEN3ZWJhcHAgXHU1MTg1XHU2MEFDXHU2RDZFXHU4M0RDXHU1MzU1XHU3Njg0XHU4MjcyXHU3NkY4L1x1NjYwRVx1NUVBNlx1OEMwM1x1ODI3Mlx1NEYxQVx1NUI5RVx1NjVGNlx1NTQwQ1x1NkI2NVx1NTIzMCBPYnNpZGlhbiBcdTc2ODRcdTUzOUZcdTc1MUZcdTc1NENcdTk3NjJcdTkxNERcdTgyNzInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY1BhbGV0dGVUb09ic2lkaWFuKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNQYWxldHRlVG9PYnNpZGlhbiA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIFRoZW1lQnJpZGdlLnJlc3RvcmVEZWZhdWx0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhY3RpdmVEb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJRnJhbWVFbGVtZW50PignLmJhbWJvby1yZXZpZXctZnJhbWUnKTtcbiAgICAgICAgICAgIGlmIChmcmFtZT8uY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICBmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGhlbWU6c3luY1BhbGV0dGVFbmFibGVkJyxcbiAgICAgICAgICAgICAgICBpZDogJ3NldHRpbmdzXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgZW5hYmxlZDogdmFsdWUgfVxuICAgICAgICAgICAgICB9LCAnKicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gPT09IEFJIFx1ODlDNFx1NTIxMiA9PT1cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZSgnQUkgXHU4OUM0XHU1MjEyXHVGRjA4XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwIFx1MjE5MiBcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdUZGMDknKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTU0MkZcdTc1MjggQUkgXHU4OUM0XHU1MjEyJylcbiAgICAgIC5zZXREZXNjKCdcdTVGMDBcdTU0MkZcdTU0MEVcdUZGMENcdTUzRUZcdTU3MjhcdTdCMTRcdThCQjBcdTRFMkRcdThGRDBcdTg4NENcdTMwMENBSSBcdTg5QzRcdTUyMTJcdUZGMUFcdTVDMDZcdTVGNTNcdTUyNERcdTdCMTRcdThCQjBcdThGNkNcdTRFM0FcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTMwMERcdTU0N0RcdTRFRTRcdUZGMENcdTc1MzFcdTU5MjdcdTZBMjFcdTU3OEJcdTYyQzZcdTg5RTNcdTc2RUVcdTY4MDdcdTVFNzZcdTUxOTlcdTUxNjVcdTU5MERcdTc2RDhcdTMwMDInKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlFbmFibGVkKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpRW5hYmxlZCA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBUEkgS2V5JylcbiAgICAgIC5zZXREZXNjKCdcdTU5MjdcdTZBMjFcdTU3OEJcdTY3MERcdTUyQTFcdTkyNzRcdTY3NDNcdTVCQzZcdTk0QTVcdUZGMDhCZWFyZXIgVG9rZW5cdUZGMDlcdTMwMDJcdTRFQzVcdTRGRERcdTVCNThcdTU3MjhcdTY3MkNcdTVFOTMgc2V0dGluZ3MuanNvblx1RkYwQ1x1NEUwRFx1NEUwQVx1NEYyMFx1MzAwMicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignc2stLi4uJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlBcGlLZXkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlBcGlLZXkgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLnRoZW4oKHNldHRpbmcpID0+IHtcbiAgICAgICAgLy8gXHU1QkM2XHU3ODAxXHU2ODQ2XHU2ODM3XHU1RjBGXHVGRjFBXHU4RjkzXHU1MTY1XHU5NjkwXHU4NUNGXG4gICAgICAgIGNvbnN0IGlucHV0ID0gc2V0dGluZy5jb250cm9sRWwucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgICAgICAgaWYgKGlucHV0KSBpbnB1dC50eXBlID0gJ3Bhc3N3b3JkJztcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQmFzZSBVUkwnKVxuICAgICAgLnNldERlc2MoJ0FQSSBcdTU3RkFcdTU3MzBcdTU3NDBcdUZGMDhcdTRFMERcdTU0MkIgL2NoYXQvY29tcGxldGlvbnMgXHU1NDBFXHU3RjAwXHVGRjA5XHUzMDAyXHU5RUQ4XHU4QkE0IERlZXBTZWVrIHYxXHUzMDAyJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdodHRwczovL2FwaS5kZWVwc2Vlay5jb20vdjEnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haUJhc2VVcmwpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYWlCYXNlVXJsID0gdmFsdWUudHJpbSgpIHx8ICdodHRwczovL2FwaS5kZWVwc2Vlay5jb20vdjEnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTZBMjFcdTU3OEInKVxuICAgICAgLnNldERlc2MoJ1x1NkEyMVx1NTc4Qlx1NTQwRFx1RkYwQ1x1NTk4MiBkZWVwc2Vlay1jaGF0IC8gZ3B0LTRvLW1pbmlcdTMwMDJcdTk3MDBcdTUxN0NcdTVCQjkgT3BlbkFJIENoYXQgQ29tcGxldGlvbnMgSlNPTiBcdTZBMjFcdTVGMEZcdTMwMDInKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2RlZXBzZWVrLWNoYXQnKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haU1vZGVsKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpTW9kZWwgPSB2YWx1ZS50cmltKCkgfHwgJ2RlZXBzZWVrLWNoYXQnO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdTlFRDhcdThCQTRcdTYyQzZcdTg5RTNcdTdDOTJcdTVFQTYnKVxuICAgICAgLnNldERlc2MoJ0FJIFx1NjI4QVx1NzZFRVx1NjgwN1x1NjJDNlx1NjIxMFx1NUI1MFx1OTg3OVx1NzY4NFx1N0VDNlx1N0M5Mlx1NUVBNlx1RkYxQVx1N0M5NygyLTMpIC8gXHU0RTJEKDMtNikgLyBcdTdFQzYoNS04KVx1MzAwMlx1NTNFRlx1NTcyOFx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5N1x1OTFDQ1x1NTE4RFx1OTAxMFx1Njc2MVx1NTIyMFx1NjUzOVx1MzAwMicpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oJ1x1N0M5NycsICdcdTdDOTdcdUZGMDgyLTMgXHU1QjUwXHU5ODc5XHVGRjA5JylcbiAgICAgICAgICAuYWRkT3B0aW9uKCdcdTRFMkQnLCAnXHU0RTJEXHVGRjA4My02IFx1NUI1MFx1OTg3OVx1RkYwOScpXG4gICAgICAgICAgLmFkZE9wdGlvbignXHU3RUM2JywgJ1x1N0VDNlx1RkYwODUtOCBcdTVCNTBcdTk4NzlcdUZGMDknKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5haURlY29tcG9zZURlcHRoKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFpRGVjb21wb3NlRGVwdGggPSB2YWx1ZSBhcyAnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNic7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIC8vIFx1NTE3M1x1NEU4RVxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdTUxNzNcdTRFOEUnKS5zZXRIZWFkaW5nKCk7XG5cbiAgICAvLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgXHU1MzYxXHU3MjQ3IDFcdUZGMUFcdTYzRDJcdTRFRjZcdTdCODBcdTRFQ0IgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gICAgY29uc3QgcGx1Z2luQm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIHBsdWdpbkJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ1x1NjNEMlx1NEVGNlx1N0I4MFx1NEVDQicsIGNsczogJ2JhbWJvby1hYm91dC1sYWJlbCcgfSk7XG4gICAgcGx1Z2luQm94LmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ0JhbWJvbyBJbW1vcnRhbHNcdUZGMDhcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdUZGMDlcdTY2MkZcdTRFMDBcdTZCM0VcdTU3RkFcdTRFOEVcdTgyQ0ZcdTgwNTRcdTYzQTdcdTUyMzZcdThCQkFcdTRFNEJcdTcyMzZcdTdFRjRcdTUxNEJcdTYyNThcdTAwQjdcdTY4M0NcdTUzNjJcdTRFQzBcdTc5RDFcdTU5MkJcdTYzRDBcdTUxRkFcdTc2ODRcIk9HQVNcIlx1NzQwNlx1NUZGNVx1RkYwQ1x1NEUxM1x1NEUzQVx1NEUyQVx1NEVCQVx1NjI1M1x1OTAyMFx1NzY4NFx1NEUyRFx1NTZGRFx1OThDRVx1NzZFRVx1NjgwN1x1ODFFQVx1NTJBOFx1NTMxNlx1NTIwNlx1OTE0RFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlx1MzAwMicsXG4gICAgICBjbHM6ICdiYW1ib28tYWJvdXQtZGVzYydcbiAgICB9KTtcblxuICAgIC8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCBcdTUzNjFcdTcyNDcgMlx1RkYxQVx1NEY1Q1x1ODAwNSArIFx1NEY1Q1x1NTRDMSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbiAgICBjb25zdCBhdXRob3JCb3ggPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtY2FyZCBiYW1ib28tYWJvdXQtYXV0aG9yJyB9KTtcbiAgICBjb25zdCBhdXRob3JSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb3cnIH0pO1xuICAgIGNvbnN0IGF2YXRhciA9IGF1dGhvclJvdy5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWJvdXQtYXZhdGFyJyB9KTtcbiAgICAvLyBcdTRFQ0VcdTYzRDJcdTRFRjZcdTc2RUVcdTVGNTVcdThCRkJcdTUzRDZcdTU5MzRcdTUwQ0ZcdUZGMDhcdTkwMUFcdThGQzcgVmF1bHQgQVBJIFx1OEJGQlx1NTNENiAub2JzaWRpYW4vcGx1Z2lucy8gXHU0RTBCXHU3Njg0XHU4MUVBXHU2NzA5XHU4RDQ0XHU2RTkwXHVGRjA5XG4gICAgLy8gZmlyZS1hbmQtZm9yZ2V0XHVGRjFBXHU1OTM0XHU1MENGXHU5NzVFXHU1MTczXHU5NTJFXHVGRjBDXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU5NzU5XHU5RUQ4XHU2NjNFXHU3OTNBXHU5RUQ4XHU4QkE0XHU3QTdBXHU1OTM0XHU1MENGXG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGx1Z2luRGlyID0gdGhpcy5wbHVnaW4ubWFuaWZlc3QuZGlyID8/ICcnO1xuICAgICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgICBgJHtwbHVnaW5EaXJ9L2F1dGhvci1hdmF0YXIuanBnYCxcbiAgICAgICAgICBgJHtwbHVnaW5EaXJ9L3dlYmFwcC9hc3NldHMvaW1hZ2VzL2F1dGhvci1hdmF0YXIuanBnYCxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBhdmF0YXJQYXRoIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICBjb25zdCBleGlzdHMgPSBhd2FpdCBhZGFwdGVyLmV4aXN0cyhhdmF0YXJQYXRoKTtcbiAgICAgICAgICBpZiAoIWV4aXN0cykgY29udGludWU7XG4gICAgICAgICAgY29uc3QgYXZhdGFyRGF0YSA9IGF3YWl0IGFkYXB0ZXIucmVhZEJpbmFyeShhdmF0YXJQYXRoKTtcbiAgICAgICAgICBjb25zdCBiNjQgPSBCdWZmZXIuZnJvbShhdmF0YXJEYXRhKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgICAgYXZhdGFyLnNldENzc1N0eWxlcyh7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2I2NH0pYCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIHNpbGVudGx5IHNraXAgXHUyMDE0IHNob3cgZGVmYXVsdCBlbXB0eSBhdmF0YXIgKi8gfVxuICAgIH0pKCk7XG5cblxuICAgIGNvbnN0IGF1dGhvckluZm8gPSBhdXRob3JSb3cuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1pbmZvJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU3RkJEXHU5Q0RFXHU1NDFCJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1uYW1lJyB9KTtcbiAgICBhdXRob3JJbmZvLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnXHU1NUI1XHU1QjU3XHU5OTg2XHU1MjFCXHU1OUNCXHU0RUJBJywgY2xzOiAnYmFtYm9vLWFib3V0LWF1dGhvci1yb2xlJyB9KTtcblxuICAgIC8vIFx1NEY1Q1x1NTRDMVx1NTMzQVxuICAgIGF1dGhvckJveC5jcmVhdGVFbCgncCcsIHsgdGV4dDogJ09ic2lkaWFuIFx1NjNEMlx1NEVGNlx1NEY1Q1x1NTRDMScsIGNsczogJ2JhbWJvby1hYm91dC13b3Jrcy1sYWJlbCcgfSk7XG4gICAgY29uc3Qgd29ya3NSb3cgPSBhdXRob3JCb3guY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LXdvcmtzLXJvdycgfSk7XG5cbiAgICBbeyBuYW1lOiAnXHU3QUY5XHU1M0Y2XHU5OERFXHU1MjAzJywgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL21pYW96aWd1YW4vb2JzaWRpYW4tQmFtYm9vLURhcnRzJyB9LFxuICAgICB7IG5hbWU6ICdcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjAnLCB1cmw6ICdodHRwczovL2dpdGh1Yi5jb20vbWlhb3ppZ3Vhbi9vYnNpZGlhbi1iYW1ib28taW1tb3J0YWxzJyB9XS5mb3JFYWNoKHdvcmsgPT4ge1xuICAgICAgY29uc3QgdGFnID0gd29ya3NSb3cuY3JlYXRlRWwoJ3NwYW4nLCB7IHRleHQ6IHdvcmsubmFtZSwgY2xzOiAnYmFtYm9vLWFib3V0LXRhZycgfSk7XG4gICAgICBpZiAod29yay51cmwpIHtcbiAgICAgICAgdGFnLnNldENzc1N0eWxlcyh7IGN1cnNvcjogJ3BvaW50ZXInIH0pO1xuICAgICAgICB0YWcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgd2luZG93Lm9wZW4od29yay51cmwsICdfYmxhbmsnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEZcbiAgICBjb25zdCBjb250YWN0Qm94ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFib3V0LWNhcmQnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEYnLCBjbHM6ICdiYW1ib28tYWJvdXQtbGFiZWwnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTkwQUVcdTdCQjFcdUZGMUF5YW55dWxpbjIxMDBAcXEuY29tJywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICAgIGNvbnRhY3RCb3guY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdcdTVGQUVcdTRGRTFcdUZGMUF5YW5odTk0JywgY2xzOiAnYmFtYm9vLWFib3V0LWRlc2MnIH0pO1xuICB9XG59XG4iLCAiLyoqXG4gKiBNYXJrZG93blBsYW5uZXIgXHUyMDE0IFx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4NyBcdTIxOTIgXHU3NkVFXHU2ODA3XHU1MzYxXHU3MjQ3XHU4OUM0XHU1MjEyXHU1NjY4XHVGRjA4UGhhc2UgMVx1RkYwOVxuICpcbiAqIFx1ODA0Q1x1OEQyM1x1RkYwOFx1NTM1NVx1NEUwMFx1MzAwMVx1NTNFRlx1NTM1NVx1NkQ0Qlx1RkYwOVx1RkYxQVxuICogIC0gYnVpbGRQcm9tcHRcdUZGMUFcdTYyOEFcdTdCMTRcdThCQjBcdTZCNjNcdTY1ODcgKyBcdTYyQzZcdTg5RTNcdTdDOTJcdTVFQTZcdTdGRkJcdThCRDFcdTYyMTBcdTdDRkJcdTdFREYvXHU3NTI4XHU2MjM3XHU2M0QwXHU3OTNBXHU4QkNEXHVGRjA4XHU3ODZDXHU3RUE2XHU2NzVGIEpTT04gU2NoZW1hXHVGRjA5XHUzMDAyXG4gKiAgLSBwYXJzZUdvYWxzXHVGRjFBXHU0RUNFXHU2QTIxXHU1NzhCXHU1NkRFXHU2MjY3XHU2NTg3XHU2NzJDXHU0RTJEXHU2M0QwXHU1M0Q2IEpTT04gXHU2NTcwXHU3RUM0XHU1RTc2XHU2NjIwXHU1QzA0XHU0RTNBIEdvYWxJdGVtW11cdUZGMDhcdTVCQjlcdTVGQ0QgYGBganNvbiBcdTU2RjRcdTY4MEZcdUZGMDlcdTMwMDJcbiAqICAtIHBsYW5Gcm9tTm90ZVx1RkYxQVx1N0YxNlx1NjM5Mlx1N0Y1MVx1N0VEQ1x1OEJGN1x1NkM0Mlx1RkYwOHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMDkrIFx1ODlFM1x1Njc5MCArIFx1NTkzMVx1OEQyNVx1OTFDRFx1OEJENVx1NEUwMFx1NkIyMVx1MzAwMlxuICpcbiAqIFx1N0Y1MVx1N0VEQ1x1NUM0Mlx1NTNFRlx1NkNFOFx1NTE2NVx1RkYwOGZldGNoRm5cdUZGMDlcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdTc1MjggZmFrZSBcdTY2RkZcdTRFRTNcdTc3MUZcdTVCOUUgcmVxdWVzdFVybFx1RkYwQ1x1NEZERFx1NjMwMVx1OTZGNiBPYnNpZGlhbiBcdThGRDBcdTg4NENcdTY1RjZcdTRGOURcdThENTZcdTMwMDJcbiAqL1xuXG5pbXBvcnQgeyByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgR09BTF9DQVRFR09SSUVTLCB0eXBlIEdvYWxDYXRlZ29yeSwgdHlwZSBHb2FsSXRlbSwgdHlwZSBHb2FsU3ViSXRlbSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHsgY2xlYW5EYWlseU1pbiB9IGZyb20gJy4vR29hbENhcmRWYWxpZGF0b3InO1xuXG4vKiogXHU2MkM2XHU4OUUzXHU3QzkyXHU1RUE2IFx1MjE5MiBcdTVFRkFcdThCQUVcdTVCNTBcdTk4NzlcdTY1NzBcdTkxQ0ZcdTUzM0FcdTk1RjRcdTYzQ0ZcdThGRjAgKi9cbmNvbnN0IERFUFRIX0hJTlQ6IFJlY29yZDwnXHU3Qzk3JyB8ICdcdTRFMkQnIHwgJ1x1N0VDNicsIHN0cmluZz4gPSB7XG4gIFx1N0M5NzogJzItMycsXG4gIFx1NEUyRDogJzMtNicsXG4gIFx1N0VDNjogJzUtOCcsXG59O1xuXG4vKiogQUkgXHU2NzBEXHU1MkExXHU4RkQ0XHU1NkRFXHU3Njg0XHU2NzAwXHU1QzBGXHU3RUQzXHU2Nzg0XHVGRjA4XHU1MTdDXHU1QkI5IE9ic2lkaWFuIHJlcXVlc3RVcmwgXHU3Njg0IFJlc3BvbnNlRGF0YVx1RkYwOSAqL1xuZXhwb3J0IGludGVyZmFjZSBBaVJlc3BvbnNlIHtcbiAgc3RhdHVzOiBudW1iZXI7XG4gIGpzb24/OiB1bmtub3duO1xuICB0ZXh0Pzogc3RyaW5nO1xuICBoZWFkZXJzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLyoqIFx1NTNFRlx1NkNFOFx1NTE2NVx1NzY4NCBmZXRjaCBcdTUxRkRcdTY1NzBcdUZGMDhcdTlFRDhcdThCQTQgcmVxdWVzdFVybFx1RkYwOVx1MzAwMlx1N0I3RVx1NTQwRFx1NUJGOVx1OUY1MCBPYnNpZGlhbiByZXF1ZXN0VXJsIFx1NzY4NFx1NjcwMFx1NUMwRlx1NUI1MFx1OTZDNlx1MzAwMiAqL1xuZXhwb3J0IHR5cGUgQWlGZXRjaEZuID0gKG9wdHM6IHtcbiAgdXJsOiBzdHJpbmc7XG4gIG1ldGhvZD86IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGJvZHk/OiBzdHJpbmc7XG59KSA9PiBQcm9taXNlPEFpUmVzcG9uc2U+O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5uZXJTZXR0aW5ncyB7XG4gIGFpQXBpS2V5OiBzdHJpbmc7XG4gIGFpQmFzZVVybDogc3RyaW5nO1xuICBhaU1vZGVsOiBzdHJpbmc7XG4gIGFpRGVjb21wb3NlRGVwdGg6ICdcdTdDOTcnIHwgJ1x1NEUyRCcgfCAnXHU3RUM2Jztcbn1cblxuY29uc3QgQ0FURUdPUllfSURTID0gR09BTF9DQVRFR09SSUVTLm1hcCgoYykgPT4gYy5pZCkuam9pbignIHwgJyk7XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwXHU2M0QwXHU3OTNBXHU4QkNEXHUzMDAyXG4gKiBAcmV0dXJucyB7IHN5c3RlbSwgdXNlciB9IFx1NEUyNFx1NkJCNVx1NkQ4OFx1NjA2RlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQcm9tcHQoXG4gIGNvbnRlbnQ6IHN0cmluZyxcbiAgZGVwdGg6ICdcdTdDOTcnIHwgJ1x1NEUyRCcgfCAnXHU3RUM2JyA9ICdcdTRFMkQnLFxuICBzY29wZTogJ25vdGUnIHwgJ3NlbGVjdGlvbicgPSAnbm90ZSdcbik6IHsgc3lzdGVtOiBzdHJpbmc7IHVzZXI6IHN0cmluZyB9IHtcbiAgY29uc3QgY291bnQgPSBERVBUSF9ISU5UW2RlcHRoXSA/PyBERVBUSF9ISU5UWydcdTRFMkQnXTtcblxuICAvLyBcdTkwMDlcdTRFMkRcdTcyNDdcdTZCQjVcdTZBMjFcdTVGMEZcdUZGMUFcdTY2MEVcdTc4NkVcdTU0NEFcdThCQzlcdTZBMjFcdTU3OEJcdTYyOEFcdTVCODNcdTVGNTNcdTVCOENcdTY1NzRcdTYxMEZcdTU2RkVcdUZGMENcdTRFMERcdTg5ODFcdTVGNTNcdTYyMTBcdTY1NzRcdTdCQzdcdTdCMTRcdThCQjAvXHU1MDQ3XHU4QkJFXHU4RkQ4XHU2NzA5XHU1MTc2XHU1QjgzXHU1MTg1XHU1QkI5XHUzMDAyXG4gIGNvbnN0IHNjb3BlTm90ZSA9XG4gICAgc2NvcGUgPT09ICdzZWxlY3Rpb24nXG4gICAgICA/ICdcdTgyRTVcdThGOTNcdTUxNjVcdTY2MkZcdTc1MjhcdTYyMzdcdTRFQ0VcdTdCMTRcdThCQjBcdTRFMkRcdTkwMDlcdTRFMkRcdTc2ODRcdTcyNDdcdTZCQjVcdUZGMENcdThCRjdcdTc2RjRcdTYzQTVcdTYyOEFcdTVCODNcdTVGNTNcdTRGNUNcdTc1MjhcdTYyMzdcdTc2ODRcdTVCOENcdTY1NzRcdTYxMEZcdTU2RkVcdTY3NjVcdTYyQzZcdTg5RTNcdUZGMENcdTRFMERcdTg5ODFcdTUwNDdcdThCQkVcdTdCMTRcdThCQjBcdTkxQ0NcdThGRDhcdTY3MDlcdTUxNzZcdTVCODNcdTUxODVcdTVCQjlcdTMwMDFcdTRFNUZcdTRFMERcdTg5ODFcdTVGNTNcdTYyMTBcdTY1NzRcdTdCQzdcdTdCMTRcdThCQjBcdTc2ODRcdTY0NThcdTg5ODFcdTMwMDInXG4gICAgICA6ICcnO1xuXG4gIGNvbnN0IHN5c3RlbSA9IGBcdTRGNjBcdTY2MkZcdTRFMDBcdTRFMkFcdTc2RUVcdTY4MDdcdTYyQzZcdTg5RTNcdTUyQTlcdTYyNEJcdUZGMENcdTY3MERcdTUyQTFcdTRFOEVcdTRFMkFcdTRFQkFcdTc2RUVcdTY4MDdcdTdCQTFcdTc0MDZcdTYzRDJcdTRFRjZcdTMwMENcdTdBRjlcdTY3OTdcdTRGRUVcdTRFRDlcdTRGMjBcdTMwMERcdTMwMDJcblx1OEY5M1x1NTE2NVx1NjYyRlx1NEUwMFx1N0JDNyBNYXJrZG93biBcdTdCMTRcdThCQjBcdTZCNjNcdTY1ODdcdUZGMUJcdTRGNjBcdTc2ODRcdTRFRkJcdTUyQTFcdTY2MkZcdTRFQ0VcdTRFMkRcdThCQzZcdTUyMkJcdTc1MjhcdTYyMzdcdTYwRjNcdTg5ODFcdThGQkVcdTYyMTBcdTc2ODRcdTc2RUVcdTY4MDdcdUZGMDhHb2FsXHVGRjA5XHVGRjBDXHU1RTc2XHU2MjhBXHU2QkNGXHU0RTJBXHU3NkVFXHU2ODA3XHU2MkM2XHU2MjEwXHU1OTFBXHU0RTJBXHU1M0VGXHU2MjY3XHU4ODRDXHU3Njg0XHU1QjUwXHU5ODc5XHVGRjA4U3ViSXRlbVx1RkYwOVx1MzAwMiR7c2NvcGVOb3RlfVxuXG4jIFx1NjgzOFx1NUZDM1x1NTRGMlx1NUI2Nlx1RkYwOFx1NjcwMFx1OTFDRFx1ODk4MVx1RkYwQ1x1NTFDQ1x1OUE3RVx1NEU4RVx1NEUwMFx1NTIwN1x1RkYwOVxuXHU2NzJDXHU4RjZGXHU0RUY2XHU3Njg0XHU2ODM4XHU1RkMzXHU0RUY3XHU1MDNDXHU2NjJGXHU2MjhBXHU3NkVFXHU2ODA3XHUzMDBDXHU5MUNGXHU1MzE2XHUzMDBEXHVGRjBDXHU1RTc2XHU4NDNEXHU1MjMwXHUzMDBDXHU2NUU1XHUzMDBEXHU5ODk3XHU3QzkyXHU1RUE2XHUzMDAyXHU0RjYwXHU3Njg0XHU2QkNGXHU0RTAwXHU0RTJBXHU1QjUwXHU5ODc5XHU5MEZEXHU1RkM1XHU5ODdCXHU4MEZEXHU1NkRFXHU3QjU0XHU0RTAwXHU0RTJBXHU5NUVFXHU5ODk4XHVGRjFBXHUzMDBDXHU0RUNBXHU1OTI5XHU4OTgxXHU1MDVBXHU1OTFBXHU1QzExXHVGRjFGXHUzMDBEXG4tIFx1OTFDRlx1NTMxNlx1RkYxQVx1NkJDRlx1NEUyQVx1NUI1MFx1OTg3OVx1NUZDNVx1OTg3Qlx1NjcwOVx1NEUwMFx1NEUyQVx1N0VBRlx1NjU3MFx1NUI1N1x1NzY4NFx1NkJDRlx1NjVFNVx1OTFDRiBkYWlseU1pblx1RkYwOFx1NTk4MiBcIjMwXCJcdTMwMDFcIjJcIlx1MzAwMVwiMjAwXCJcdUZGMDlcdUZGMENcdTRFMERcdTVFMjZcdTRFRkJcdTRGNTVcdTUzNTVcdTRGNERcdTYyMTZcdTY1ODdcdTVCNTdcdTMwMDJcbi0gXHU2NUU1XHU5ODk3XHU3QzkyXHU1RUE2XHVGRjFBXHU2MjhBXCJcdTdFRDNcdTY3OUNcdTU3OEIvXHU1QjhGXHU1OTI3XHU3NkVFXHU2ODA3XCJcdTdGRkJcdThCRDFcdTYyMTBcIlx1NkJDRlx1NTkyOVx1NzY4NFx1NTNFRlx1NjI2N1x1ODg0Q1x1NTJBOFx1NEY1Q1wiXHUzMDAyXG4gIFx1MDBCNyBcIlx1OEJGQlx1NUI4Q1x1MzAwQVhYXHUzMDBCXCIgXHUyMTkyIFx1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwXCJcdUZGMENkYWlseU1pbiBcIjMwXCJcbiAgXHUwMEI3IFwiXHU1MUNGXHU1QzExXHU5NkY2XHU5OERGXCIgXHUyMTkyIFx1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU5NkY2XHU5OERGXHU3MEVEXHU5MUNGXHU0RTBBXHU5NjUwKFx1NTM0M1x1NTM2MSlcIlx1RkYwQ2RhaWx5TWluIFwiMjAwXCJcbiAgXHUwMEI3IFwiXHU2NUU5XHU3NzYxXCIgXHUyMTkyIFx1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU3NzYxXHU3NzIwXHU2NUY2XHU5NTdGKFx1NUMwRlx1NjVGNilcIlx1RkYwQ2RhaWx5TWluIFwiN1wiXG4tIFx1NUI1MFx1OTg3OVx1NTQwRCBuYW1lIFx1NUU5NFx1NTMwNVx1NTQyQlx1OTFDRlx1NTMxNlx1N0VGNFx1NUVBNlx1RkYwOFx1NTk4MlwiXHU2QkNGXHU1OTI5XHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwXCJcdTgwMENcdTk3NUVcIlx1OEJGQlx1NEU2NlwiXHVGRjA5XHUzMDAyXG4tIFx1NjJEMlx1N0VERFx1NkEyMVx1N0NDQVx1RkYxQVx1N0VERFx1NEUwRFx1NEVBN1x1NTFGQVx1NjVFMFx1NkNENVx1OTFDRlx1NTMxNlx1NzY4NFx1NUI1MFx1OTg3OVx1RkYwOFx1NTk4MlwiXHU1NzVBXHU2MzAxXCJcIlx1NTJBQVx1NTI5QlwiXCJcdTRGRERcdTYzMDFcIlx1RkYwOVx1RkYxQlx1ODJFNVx1NEUwMFx1NEUyQVx1NjBGM1x1NkNENVx1NjVFMFx1NkNENVx1OTFDRlx1NTMxNlx1RkYwQ1x1NUMzMVx1NjUzOVx1NTE5OVx1NjIxMFx1ODBGRFx1OTFDRlx1NTMxNlx1NzY4NFx1NjVFNVx1N0VBN1x1ODg0Q1x1NEUzQVx1MzAwMlxuLSAqKlx1NjVGNlx1OTVGNFx1OUE3MVx1NTJBOFx1ODlDNFx1NTIxMlx1RkYwOFx1NTE3M1x1OTUyRVx1RkYwOSoqXHVGRjFBXHU1RjUzXHU0RjYwXHU4MEZEXHU2M0E4XHU2NUFEXHU4RDc3XHU2QjYyXHU2NUY2XHU5NUY0XHVGRjA4c3RhcnREYXRlIFx1NTQ4QyBlbmREYXRlXHVGRjA5XHVGRjBDXHU1RTk0XHU0RTNCXHU1MkE4XHU3NTI4XHU1QjgzXHU1M0NEXHU2M0E4IGRhaWx5TWluXHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU1MUVEXHU3QTdBXHU3MzFDXHVGRjFBXG4gIFx1MDBCNyBcdTYwM0JcdTU5MjlcdTY1NzAgPSBlbmREYXRlIC0gc3RhcnREYXRlXG4gIFx1MDBCNyBcdTgyRTUgdGFyZ2V0VmFsdWUgXHU1M0VGXHU5MUNGXHU1MzE2XHU0RTE0XHU1M0VGXHU1NzQ3XHU2NDRBXHVGRjFBXHUzMDBDM1x1NEUyQVx1NjcwOFx1OEJGQlx1NUI4QzNcdTY3MkNcdTRFNjZcdUZGMENcdTZCQ0ZcdTY3MkNcdTdFQTYzMDBcdTk4NzVcdTMwMEQgXHUyMTkyIDkwMFx1OTg3NVx1MDBGNzkwXHU1OTI5PTEwXHU5ODc1L1x1NTkyOSBcdTIxOTIgZGFpbHlNaW4gXCIxMFwiXG4gIFx1MDBCNyBcdTgyRTUgdGFyZ2V0VmFsdWUgXHU0RTBEXHU1M0VGXHU3NkY0XHU2M0E1XHU1NzQ3XHU2NDRBXHVGRjA4XHU1OTgyXCJcdTUxQ0ZcdTkxQ0Q1a2dcIlx1NEY1M1x1OTFDRFx1OTc1RVx1N0VCRlx1NjAyN1x1RkYwOVx1RkYxQVx1NjJDNlx1NEUzQVx1NTNFRlx1NTc0N1x1NjQ0QVx1NzY4NFx1ODg0Q1x1NTJBOFx1NUI1MFx1OTg3OVx1RkYwQ1x1NTk4MlwiXHU2QkNGXHU1OTI5XHU4RkQwXHU1MkE4XHU2RDg4XHU4MDE3KFx1NTM0M1x1NTM2MSlcIlx1RkYwQ2RhaWx5TWluIFx1NTNENlx1NTQwOFx1NzQwNlx1NTAzQ1xuICBcdTAwQjcgXHU3NTI4IHJlYXNvbiBcdThCRjRcdTY2MEVcdThCQTFcdTdCOTdcdTRGOURcdTYzNkVcdUZGMDhcdTU5ODJcIjkwMFx1OTg3NVx1MDBGNzkwXHU1OTI5XHUyMjQ4MTBcdTk4NzUvXHU1OTI5XCJcdUZGMDlcdUZGMENcdThCQTlcdTc1MjhcdTYyMzdcdTUzRUZcdTY4MzhcdTVCOUVcbiAgXHUwMEI3IFx1ODJFNVx1OEQ3N1x1NkI2Mlx1NjVGNlx1OTVGNFx1NjIxNlx1NjAzQlx1OTFDRlx1Nzg2RVx1NUI5RVx1NjVFMFx1NkNENVx1NjNBOFx1NjVBRFx1RkYwQ1x1NjMwOVx1NUUzOFx1OEJDNlx1N0VEOVx1NEUwMFx1NEUyQVx1NEZERFx1NUI4OCBkYWlseU1pblx1RkYwQ1x1NEUwRFx1NUYzQVx1ODg0Q1x1NzU1OVx1N0E3QVxuXG4jIFx1NUI1MFx1OTg3OVx1NzZGOFx1NTE3M1x1NjAyNyAmIFx1NTNFRlx1OTFDRlx1NTMxNlx1NjJBNFx1NjgwRlx1RkYwOFx1Nzg2Q1x1NjAyN1x1ODk4MVx1NkM0Mlx1RkYwQ1x1NEUwRVx1NjgzOFx1NUZDM1x1NTRGMlx1NUI2Nlx1NTQwQ1x1N0I0OVx1OTFDRFx1ODk4MVx1RkYwOVxuXHU1QjUwXHU5ODc5XHU1RkM1XHU5ODdCXHU1NDBDXHU2NUY2XHU2RUUxXHU4REIzXHUzMDBDXHU1NkY0XHU3RUQ1XHU3NkVFXHU2ODA3XHUzMDBEXHU0RTBFXHUzMDBDXHU1M0VGXHU5MUNGXHU1MzE2XHUzMDBEXHU0RTI0XHU2NzYxXHU5NEMxXHU1RjhCXHVGRjBDXHU3RjNBXHU0RTAwXHU0RTBEXHU1M0VGXHVGRjFCXHU0RUZCXHU0RTAwXHU0RTBEXHU2RUUxXHU4REIzXHU5MEZEXHU0RTBEXHU1MUM2XHU0RUE3XHU1MUZBXHUzMDAyXG5cbiMjIFx1OTRDMVx1NUY4Qlx1NEUwMFx1RkYxQVx1NUZDNVx1OTg3Qlx1NTZGNFx1N0VENVx1NzZFRVx1NjgwN1x1RkYwOFx1NjJEMlx1N0VERFx1OEREMVx1OTg5OFx1RkYwOVxuLSBcdTZCQ0ZcdTRFMkFcdTVCNTBcdTk4NzlcdTkwRkRcdTg5ODFcdTgwRkRcdTc2RjRcdTYzQTVcdTU2REVcdTdCNTRcdUZGMUFcdTMwMENcdTRFQ0FcdTU5MjlcdTUwNUFcdThGRDlcdTRFRjZcdTRFOEJcdUZGMENcdTY2MkZcdTU0MjZcdTYzQThcdThGREJcdTRFODZcdThGRDlcdTRFMkFcdTc2RUVcdTY4MDdcdUZGMUZcdTMwMERcdTgwRkRcdTYzQThcdThGREJcdTYyNERcdTdCOTdcdTc2RjhcdTUxNzNcdTMwMDJcbi0gXHU0RTI1XHU3OTgxXHU4OEM1XHU5OTcwXHU2MDI3XHUzMDAxXHU2Q0RCXHU1MzE2XHU2MDI3XHUzMDAxXHU0RTBFXHU3NkVFXHU2ODA3XHU1RjMxXHU3NkY4XHU1MTczXHU3Njg0XHU1QjUwXHU5ODc5XHUzMDAyXHU0RjhCXHVGRjFBXHU3NkVFXHU2ODA3XHU2NjJGXCIzXHU0RTJBXHU2NzA4XHU1QjY2XHU0RjFBUmVhY3RcIlx1RkYwQ1x1NUI1MFx1OTg3OVwiXHU2QkNGXHU1OTI5XHU1NTlEXHU2QzM0OFx1Njc2RlwiXCJcdTZCQ0ZcdTU5MjlcdTY1NjNcdTZCNjVcIlx1NUMzMVx1NUM1RVx1NEU4RVx1NzlCQlx1OTg5OFx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTIyMFx1OTY2NFx1NjIxNlx1NjUzOVx1NTE5OVx1NjIxMFx1NjcwRFx1NTJBMVx1NzZFRVx1NjgwN1x1NzY4NFx1NTJBOFx1NEY1Q1x1RkYwOFx1NTk4MlwiXHU2QkNGXHU1OTI5XHU1MTk5UmVhY3RcdTdFQzRcdTRFRjYoXHU0RTJBKVwiXHVGRjA5XHUzMDAyXG4tIFx1ODJFNVx1NEUwMFx1NEUyQVx1NzA3NVx1NjExRlx1NTNFQVx1NEUwRVx1NzZFRVx1NjgwN1x1NUYzMVx1NzZGOFx1NTE3M1x1RkYwQ1x1NUI4MVx1NTNFRlx1NEUyMlx1NUYwM1x1NEU1Rlx1NEUwRFx1ODk4MVx1NTg1RVx1OEZEQlx1ODlDNFx1NTIxMlx1MjAxNFx1MjAxNFx1NUU3M1x1NUVCOFx1NTgwNlx1NzgwQ1x1NEYxQVx1OTY0RFx1NEY0RVx1NTNFRlx1NjI2N1x1ODg0Q1x1NjAyN1x1MzAwMlxuLSBcdTVCNTBcdTk4NzlcdTU0MERcdTVFOTRcdTRGNTNcdTczQjBcIlx1NzZFRVx1NjgwN1x1N0VGNFx1NUVBNlwiXHVGRjFBXHU1MUNGXHU5MUNEXHU3NkVFXHU2ODA3XHU3Njg0XHU1QjUwXHU5ODc5XHU1RTk0XHU1NkY0XHU3RUQ1XHU3MEVEXHU5MUNGL1x1OEZEMFx1NTJBOC9cdTRGNTNcdTkxQ0RcdUZGMENcdTgwMENcdTk3NUVcdTY1RTBcdTUxNzNcdTc2ODRcIlx1NkJDRlx1NTkyOVx1OEJGQlx1NEU2NlwiXHUzMDAyXG5cbiMjIFx1OTRDMVx1NUY4Qlx1NEU4Q1x1RkYxQVx1NUZDNVx1OTg3Qlx1NTNFRlx1OTFDRlx1NTMxNlx1RkYwOFx1NjJEMlx1N0VERFx1OTZCRVx1OTFDRlx1NTMxNlx1NEVGQlx1NTJBMVx1RkYwOVxuLSBcdTY3NUNcdTdFRERcIlx1OTZCRVx1NEVFNVx1OTFDRlx1NTMxNlwiXHU3Njg0XHU0RUZCXHU1MkExXHVGRjFBXHU1OTgyXCJcdTYzRDBcdTUzNDdcdThCRURcdTYxMUZcIlwiXHU1ODlFXHU1RjNBXHU4MUVBXHU0RkUxXCJcIlx1NEZERFx1NjMwMVx1NTk3RFx1NUZDM1x1NjBDNVwiXCJcdTUyQTBcdTZERjFcdTc0MDZcdTg5RTNcIlwiXHU2M0QwXHU5QUQ4XHU1QkExXHU3RjhFXCJcdTMwMDJcdThGRDlcdTRFOUJcdThCQ0RcdTY1RTBcdTZDRDVcdTc2RjRcdTYzQTVcdThCQTFcdTY1NzBcdUZGMENcdTRFMTRcdTZCQ0ZcdTY1RTVcdTY1RTBcdTZDRDVcdTY4MzhcdTlBOENcdTMwMDJcbi0gXHU1RkM1XHU5ODdCXHU2MjhBXCJcdTk2QkVcdTkxQ0ZcdTUzMTZcIlx1NjUzOVx1NTE5OVx1NjIxMFwiXHU1M0VGXHU4QkExXHU2NTcwL1x1NTNFRlx1NUVBNlx1OTFDRlwiXHU3Njg0XHU2NUU1XHU3RUE3XHU4ODRDXHU0RTNBXHVGRjA4XHU2NTM5XHU1MTk5XHU4MzAzXHU1RjBGXHVGRjA5XHVGRjFBXG4gIFx1MDBCNyBcIlx1NjNEMFx1NTM0N1x1ODJGMVx1OEJFRFwiIFx1MjE5MiBcIlx1NkJDRlx1NTkyOVx1ODBDQ1x1NTM1NVx1OEJDRChcdTRFMkEpXCIgZGFpbHlNaW4gXCIyMFwiXHVGRjFCXHU2MjE2IFwiXHU2QkNGXHU1OTI5XHU1NDJDXHU1MjlCKFx1NTIwNlx1OTQ5RilcIiBkYWlseU1pbiBcIjE1XCJcbiAgXHUwMEI3IFwiXHU1QzExXHU3M0E5XHU2MjRCXHU2NzNBXCIgXHUyMTkyIFwiXHU2QkNGXHU1OTI5XHU1QzRGXHU1RTU1XHU2NUY2XHU5NTdGXHU0RTBBXHU5NjUwKFx1NUMwRlx1NjVGNilcIiBkYWlseU1pbiBcIjNcIlxuICBcdTAwQjcgXCJcdTU5MUFcdTU1OURcdTZDMzRcIiBcdTIxOTIgXCJcdTZCQ0ZcdTU5MjlcdTk5NkVcdTZDMzRcdTkxQ0YoXHU2NzZGKVwiIGRhaWx5TWluIFwiOFwiXHVGRjA4XHU0RUM1XHU1RjUzXHU4QkU1XHU3NkVFXHU2ODA3XHU3ODZFXHU1QzVFXHU1MDY1XHU1RUI3L1x1NTFDRlx1OTFDRFx1NzZGOFx1NTE3M1x1NjVGNlx1NjI0RFx1NEY1Q1x1NEUzQVx1NUI1MFx1OTg3OVx1RkYwQ1x1NTQyNlx1NTIxOVx1ODlDNlx1NEUzQVx1NzlCQlx1OTg5OFx1RkYwOVxuICBcdTAwQjcgXCJcdTRGRERcdTYzMDFcdTU5N0RcdTVGQzNcdTYwMDFcIiBcdTIxOTIgXHU2NTM5XHU1MTk5XHU0RTNBXHU1MTc3XHU0RjUzXHU4ODRDXHU0RTNBXHVGRjBDXHU1OTgyIFwiXHU2QkNGXHU1OTI5XHU1MUE1XHU2MEYzKFx1NTIwNlx1OTQ5RilcIiBkYWlseU1pbiBcIjEwXCIgLyBcIlx1NkJDRlx1NTkyOVx1OEJCMFx1NUY1NVx1NjExRlx1NjA2OShcdTY3NjEpXCIgZGFpbHlNaW4gXCIxXCJcbiAgXHUwMEI3IFwiXHU2REYxXHU1MTY1XHU3NDA2XHU4OUUzXHU3Qjk3XHU2Q0Q1XCIgXHUyMTkyIFwiXHU2QkNGXHU1OTI5XHU1MjM3XHU5ODk4KFx1OTA1MylcIiBkYWlseU1pbiBcIjJcIiAvIFwiXHU2QkNGXHU1OTI5XHU4QkZCXHU2MjgwXHU2NzJGXHU2NTg3KFx1N0JDNylcIiBkYWlseU1pbiBcIjFcIlxuLSBcdTY1MzlcdTUxOTlcdTUzOUZcdTUyMTlcdUZGMUFcdTYyN0VcdThCRTVcdTc2RUVcdTY4MDdcdTc2ODRcIlx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1wiXHVGRjA4XHU5ODc1XHU2NTcwL1x1NTIwNlx1OTQ5Ri9cdTRFMkFcdTY1NzAvXHU2NzZGXHU2NTcwL1x1NTM0M1x1NTM2MS9cdTZCMjFcdTY1NzBcdUZGMDlcdUZGMENcdTgwMENcdTk3NUVcdTYyQkRcdThDNjFcdTYxMUZcdTUzRDdcdTMwMDJcbi0gXHU4MkU1XHU1QjlFXHU1NzI4XHU2MjdFXHU0RTBEXHU1MjMwXHU0RUZCXHU0RjU1XHU1M0VGXHU2NTcwXHU0RUUzXHU3NDA2XHU2MzA3XHU2ODA3XHVGRjBDXHU4QkY0XHU2NjBFXHU4QkU1XHU3NkVFXHU2ODA3XHU2NzJDXHU4RUFCXHU0RTBEXHU5MDAyXHU1NDA4XHU2MkM2XHU4OUUzXHUyMDE0XHUyMDE0XHU4QkU1IGdvYWwgXHU3Njg0IGl0ZW1zIFx1NzU1OVx1N0E3QVx1RkYwOHJlYXNvbiBcdThCRjRcdTY2MEVcdTUzOUZcdTU2RTBcdUZGMDlcdUZGMENcdTRFNUZcdTRFMERcdTg5ODFcdTc1MjhcIlx1NTJBQVx1NTI5QlwiXCJcdTU3NUFcdTYzMDFcIlx1N0I0OVx1NEYyQVx1OTFDRlx1NTMxNlx1OEJDRFx1NTFEMVx1NjU3MFx1MzAwMlxuXG4jIFx1OEY5M1x1NTFGQVx1NjgzQ1x1NUYwRlx1RkYwOFx1NEUyNVx1NjgzQyBKU09OXHVGRjBDXHU0RTBEXHU4OTgxXHU0RUZCXHU0RjU1XHU4OUUzXHU5MUNBXHUzMDAxXHU0RTBEXHU4OTgxIG1hcmtkb3duIFx1NTZGNFx1NjgwRlx1RkYwOVxue1xuICBcImdvYWxzXCI6IFtcbiAgICB7XG4gICAgICBcInRpdGxlXCI6IFwiXHU3NkVFXHU2ODA3XHU2ODA3XHU5ODk4XHVGRjA4XHU3QjgwXHU2RDAxXHVGRjBDXHU1QzExXHU0RThFMjBcdTVCNTdcdUZGMDlcIixcbiAgICAgIFwiYW5hbHlzaXNcIjogXCJcdTRFMDBcdTUzRTVcdThCRERcdTVGNTJcdTdFQjNcdTdCMTRcdThCQjBcdTRFM0JcdTY1RTggKyBcdTYyQzZcdTg5RTNcdTc0MDZcdTc1MzEvXHU1MTczXHU5NTJFXHU5OENFXHU5NjY5XHVGRjA4XHUyMjY0NDBcdTVCNTdcdUZGMENcdTRFQzVcdTVDNTVcdTc5M0FcdTc1MjhcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMDlcIixcbiAgICAgIFwiY2F0ZWdvcnlcIjogXCJ3b3JrIHwgcGVyc29uYWwgfCBoZWFsdGggfCBzdHVkeSB8IGZpbmFuY2UgfCBvdGhlclwiLFxuICAgICAgXCJzdGFydERhdGVcIjogXCJcdTVGMDBcdTU5Q0JcdTY1RTVcdTY3MUYgWVlZWS1NTS1ERFx1MzAwMlx1N0IxNFx1OEJCMFx1NjcyQVx1NjNEMFx1NTNDQVx1NjVGNlx1NUZDNVx1OTg3Qlx1NTg2Qlx1NEVDQVx1NTkyOVx1RkYwOFx1NEUwRSB1c2VyIFx1NkQ4OFx1NjA2Rlx1NEUyRFx1NzY4NFx1MjAxQ1x1NEVDQVx1NTkyOVx1MjAxRFx1NEUwMFx1ODFGNFx1RkYwOVx1RkYwQ1x1NEUwRFx1ODk4MVx1NzU1OVx1N0E3QVwiLFxuICAgICAgXCJlbmREYXRlXCI6IFwiXHU2MjJBXHU2QjYyXHU2NUU1XHU2NzFGIFlZWVktTU0tRERcdUZGMENcdTY3MkFcdTc3RTVcdTc1NTlcdTdBN0FcdTRFMzJcIixcbiAgICAgIFwiaXRlbXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJuYW1lXCI6IFwiXHU1QjUwXHU5ODc5XHU1NDBEXHVGRjA4XHU1NDJCXHU5MUNGXHU1MzE2XHU3RUY0XHU1RUE2XHU3Njg0XHU1M0VGXHU4NDNEXHU1NzMwXHU1MkE4XHU0RjVDXHVGRjBDXHU1OTgyJ1x1NkJDRlx1NTkyOVx1OTYwNVx1OEJGQlx1OTg3NVx1NjU3MCdcdUZGMDlcIixcbiAgICAgICAgICBcInRhcmdldFZhbHVlXCI6IFwiXHU1M0VGXHU5MUNGXHU1MzE2XHU3Njg0XHU3NkVFXHU2ODA3XHU1MDNDKFx1NUI1N1x1N0IyNlx1NEUzMilcdUZGMENcdTY3MkFcdTc3RTVcdTc1NTlcdTdBN0FcdTRFMzJcIixcbiAgICAgICAgICBcImN1cnJlbnRWYWx1ZVwiOiBcIlx1NUY1M1x1NTI0RFx1NURGMlx1OEZCRVx1NjIxMFx1NTAzQyhcdTVCNTdcdTdCMjZcdTRFMzIpXHVGRjBDXHU2NzJBXHU3N0U1XHU3NTU5XHU3QTdBXHU0RTMyXCIsXG4gICAgICAgICAgXCJkYWlseU1pblwiOiBcIlx1NkJDRlx1NTkyOVx1OTcwMFx1NjNBOFx1OEZEQlx1NzY4NFx1OTFDRlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NjYyRlx1N0VBRlx1NjU3MFx1NUI1N1x1NUI1N1x1N0IyNlx1NEUzMihcdTU5ODIgJzMwJylcdUZGMENcdTRFMERcdTVFMjZcdTUzNTVcdTRGNERcIixcbiAgICAgICAgICBcInRhc2tEYXlUeXBlXCI6IFwiZGFpbHlcIixcbiAgICAgICAgICBcInJlYXNvblwiOiBcIlx1NEUzQVx1NEY1NVx1OEZEOVx1NjgzN1x1NjJDNlx1RkYwOFx1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1RkYwQ1x1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1RkYwOVwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn1cblxuIyBcdTg5QzRcdTUyMTlcbjEuIFx1NTNFQVx1OEY5M1x1NTFGQSBKU09OXHUzMDAyXHU4MkU1XHU4QkM2XHU1MjJCXHU0RTBEXHU1MUZBXHU0RUZCXHU0RjU1XHU2NjBFXHU3ODZFXHU3NkVFXHU2ODA3XHVGRjBDXHU4RkQ0XHU1NkRFIHtcImdvYWxzXCI6W119XHUzMDAyXG4yLiBkYWlseU1pbiBcdTVGQzVcdTk4N0JcdTY2MkZcdTdFQUZcdTY1NzBcdTVCNTdcdTVCNTdcdTdCMjZcdTRFMzJcdUZGMENcdTc5ODFcdTZCNjJcdTY0M0FcdTVFMjZcdTUzNTVcdTRGNERcdTYyMTZcdTY1ODdcdTVCNTdcdUZGMDhcIjMwXHU1MjA2XHU5NDlGXCJcdTIxOTJcIjMwXCJcdUZGMENcIjctOFx1NUMwRlx1NjVGNlwiXHUyMTkyXHU1M0Q2XHU0RkREXHU1Qjg4XHU1MDNDXCI3XCJcdUZGMDlcdTMwMDJcbjMuIFx1ODJFNVx1NjVFMFx1NkNENVx1NzZGNFx1NjNBNVx1NjNBOFx1NjVBRFx1NkJDRlx1NTkyOVx1NTA1QVx1NTkxQVx1NUMxMVx1RkYwQ1x1OEJGN1x1NTIyOVx1NzUyOFx1MzAwQ1x1OEQ3N1x1NkI2Mlx1NjVGNlx1OTVGNCArIFx1NzZFRVx1NjgwN1x1NjAzQlx1OTFDRlx1MzAwRFx1NTNDRFx1NjNBOCBkYWlseU1pblx1RkYwOFx1NTNDMlx1ODlDMVx1NjgzOFx1NUZDM1x1NTRGMlx1NUI2Nlx1N0IyQzVcdTY3NjFcdUZGMDlcdUZGMUJcdTVDM0RcdTkxQ0ZcdTRFMERcdTg5ODFcdTc1NTlcdTdBN0FcdTMwMDJcbjQuIFx1NTM1NVx1NEY0RFx1NEZFMVx1NjA2Rlx1NjUzRVx1OEZEQlx1NUI1MFx1OTg3OVx1NTQwRFx1NjIxNiB0YXJnZXRWYWx1ZVx1RkYwOFx1NTk4MiBuYW1lOlwiXHU2QkNGXHU1OTI5XHU3NzYxXHU3NzIwXHU2NUY2XHU5NTdGKFx1NUMwRlx1NjVGNilcIlx1RkYwOVx1RkYwQ2RhaWx5TWluIFx1NTNFQVx1NjUzRVx1NjU3MFx1NUI1N1x1MzAwMlxuNS4gdGFyZ2V0VmFsdWUgLyBjdXJyZW50VmFsdWUgXHU2NzJBXHU3N0U1XHU1M0VGXHU3NTU5XHU3QTdBXHU0RTMyIFwiXCJcdUZGMENcdTRGNDYqKlx1N0VERFx1NEUwRFx1N0YxNlx1OTAyMCoqXHU3Q0JFXHU3ODZFXHU2NTcwXHU1QjU3XHUzMDAyXG42LiBjYXRlZ29yeSBcdTVGQzVcdTk4N0JcdTUzRDZcdTgxRUFcdTY3OUFcdTRFM0VcdUZGMDgke0NBVEVHT1JZX0lEU31cdUZGMDlcdUZGMENcdTY1RTBcdTZDRDVcdTUyMjRcdTY1QURcdTc1MjggXCJvdGhlclwiXHUzMDAyXG43LiB0YXNrRGF5VHlwZSBcdTlFRDhcdThCQTQgXCJkYWlseVwiXHVGRjFCXHU0RUM1XHU1RjUzXHU4QkU1XHU4ODRDXHU0RTNBXHU1OTI5XHU3MTM2XHU0RTBEXHU2NjJGXHU2QkNGXHU1OTI5XHU1MDVBXHVGRjA4XHU1OTgyXCJcdTZCQ0ZcdTU0NjhcdTRGNTNcdTY4QzBcIlx1RkYwOVx1NjI0RFx1NzUyOCBcIndlZWtseVwiIC8gXCJtb250aGx5XCIgLyBcImN1c3RvbVwiXHVGRjBDXHU1RTc2XHU2MzZFXHU2QjY0XHU4QzAzXHU2NTc0IGRhaWx5TWluIFx1OEJFRFx1NEU0OVx1MzAwMlxuOC4gXHU3NkVFXHU2ODA3XHU1QjhGXHU1OTI3XHU2MjE2XHU3N0U1XHU4QkM2XHU0RTBEXHU4REIzXHU2NUY2XHVGRjBDXHU0RTNCXHU1MkE4XHU2MkM2ICR7Y291bnR9IFx1NEUyQVx1NUI1MFx1OTg3OVx1RkYwOFx1N0M5Nz0yLTMgLyBcdTRFMkQ9My02IC8gXHU3RUM2PTUtOFx1RkYwOVx1RkYwQ1x1NTA0Rlx1NTQxMVx1NTNFRlx1ODQzRFx1NTczMFx1ODg0Q1x1NTJBOFx1RkYxQlx1NzUyOCByZWFzb24gXHU4QkY0XHU2NjBFXHU0RjlEXHU2MzZFXHUzMDAyXG45LiAqKlx1NjVFNVx1NjcxRlx1NjNBOFx1N0I5N1x1RkYwOFx1OTFDRFx1ODk4MVx1RkYwOSoqXHVGRjFBXG4gICAtICoqc3RhcnREYXRlKipcdUZGMUFcdTdCMTRcdThCQjBcdTgyRTVcdTY3MkFcdTYzRDBcdTUzQ0FcdTUxNzdcdTRGNTNcdTVGMDBcdTU5Q0JcdTY1RTVcdTY3MUZcdUZGMENcdTVGQzVcdTk4N0JcdTU4NkJcIlx1NEVDQVx1NTkyOVwiXHVGRjA4XHU1MzczIHVzZXIgXHU2RDg4XHU2MDZGXHU0RTJEXHU3RUQ5XHU1MUZBXHU3Njg0XHU2NUU1XHU2NzFGXHVGRjA5XHVGRjBDXHU0RTBEXHU4OTgxXHU3NTU5XHU3QTdBXHUzMDAyXHU0RUM1XHU1RjUzXHU3QjE0XHU4QkIwXHU2NjBFXHU3ODZFXHU4QkY0XHU0RTg2XCJcdTRFQ0VYXHU2NzA4WFx1NjVFNVx1NUYwMFx1NTlDQlwiXHU2MjREXHU3NTI4XHU4QkU1XHU2NUU1XHU2NzFGXHUzMDAyXG4gICAtICoqZW5kRGF0ZSoqXHVGRjFBXHU3QjE0XHU4QkIwXHU4MkU1XHU2M0QwXHU1MjMwXHU3NkY4XHU1QkY5XHU2NUY2XHU5NTdGXHVGRjA4XCIzXHU0RTJBXHU2NzA4XCJcIlx1NTM0QVx1NUU3NFwiXCI5MFx1NTkyOVwiXCJcdTUyMzBcdTVFNzRcdTVFOTVcIlx1N0I0OVx1RkYwOVx1RkYwQ1x1NUZDNVx1OTg3Qlx1NzUyOFx1MzAwQ3N0YXJ0RGF0ZSArIFx1NjVGNlx1OTU3Rlx1MzAwRFx1NjNBOFx1N0I5N1x1NjIxMCBZWVlZLU1NLUREIFx1NTg2Qlx1NTE2NSBlbmREYXRlXHVGRjBDXHU0RTBEXHU4OTgxXHU3NTU5XHU3QTdBXHUzMDAyXHU0RUM1XHU1RjUzXHU3QjE0XHU4QkIwXHU1QjhDXHU1MTY4XHU2NUUwXHU2NUY2XHU5NUY0XHU3RUJGXHU3RDIyXHU2NUY2IGVuZERhdGUgXHU2MjREXHU3NTU5XHU3QTdBXHU0RTMyXHUzMDAyXG4gICAtIFx1NEUwQlx1NjVCOSB1c2VyIFx1NkQ4OFx1NjA2Rlx1NEUyRFx1NEYxQVx1N0VEOVx1NTFGQVx1NEVDQVx1NTkyOVx1NzY4NFx1NjVFNVx1NjcxRlx1RkYwQ1x1OEJGN1x1NEVFNVx1OEJFNVx1NjVFNVx1NjcxRlx1NEUzQVx1NTFDNlx1OEZEQlx1ODg0Q1x1NjNBOFx1N0I5N1x1MzAwMlxuMTAuIFx1OTY2NCBhbmFseXNpcyBcdTVCNTdcdTZCQjVcdTU5MTZcdUZGMENcdTRFMERcdTg5ODFcdTUzMDVcdTU0MkIgaWQgLyBpY29uIC8gcHJvZ3Jlc3MgXHU3QjQ5XHU1QjU3XHU2QkI1XHVGRjBDXHU3NTMxXHU2M0QyXHU0RUY2XHU4ODY1XHU1MTY4XHVGRjA4YW5hbHlzaXMgXHU0RjFBXHU4OEFCXHU1QzU1XHU3OTNBXHU3RUQ5XHU3NTI4XHU2MjM3XHVGRjA5XHUzMDAyXG4xMS4gXHU1QjUwXHU5ODc5XHU3ODZDXHU2MDI3XHU0RTI0XHU1MTczXHVGRjFBXHU1RkM1XHU5ODdCXHVGRjA4YVx1RkYwOVx1NzZGNFx1NjNBNVx1NjcwRFx1NTJBMVx1NEU4RVx1OEJFNVx1NzZFRVx1NjgwN1x1RkYwOFx1NEUwRFx1OEREMVx1OTg5OFx1RkYwOVx1RkYxQlx1RkYwOGJcdUZGMDlcdTUzRUZcdTc1MjhcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW4gXHU4ODY4XHU4RkJFXHU2QkNGXHU2NUU1XHU4RkRCXHU1RUE2XHUzMDAyXHU5NkJFXHU5MUNGXHU1MzE2XHU2MjE2XHU3OUJCXHU5ODk4XHU3Njg0XHU1QjUwXHU5ODc5XHU0RTAwXHU1RjhCXHU0RTBEXHU1Rjk3XHU0RUE3XHU1MUZBXHVGRjFCXHU2MjdFXHU0RTBEXHU1MjMwXHU1M0VGXHU2NTcwXHU0RUUzXHU3NDA2XHU2MzA3XHU2ODA3XHU2NUY2XHU4QkU1IGdvYWwgXHU3Njg0IGl0ZW1zIFx1NzU1OVx1N0E3QVx1RkYwQ1x1NEUwRFx1NUY5N1x1NzUyOFwiXHU1MkFBXHU1MjlCXCJcIlx1NTc1QVx1NjMwMVwiXCJcdTRGRERcdTYzMDFcIlx1N0I0OVx1NEYyQVx1OTFDRlx1NTMxNlx1OEJDRFx1NTFEMVx1NjU3MFx1MzAwMlxuMTIuICoqXHU3NkVFXHU2ODA3XHU2ODA3XHU5ODk4XHU1RkM1XHU5ODdCXHU1RjUyXHU3RUIzXHU1NDdEXHU1NDBEXHVGRjA4XHU0RTBEXHU4OTgxXHU3MTY3XHU2Mjg0XHU3QjE0XHU4QkIwXHU1MzlGXHU2NTg3XHVGRjA5KipcdUZGMUFcbiAgICAtIFx1NjgwN1x1OTg5OFx1NjYyRlwiXHU3NkVFXHU2ODA3XHU3Njg0XHU1NDBEXHU1QjU3L1x1OTg3OVx1NzZFRVx1NTQwRFwiXHVGRjBDXHU0RTBEXHU2NjJGXHU3QjE0XHU4QkIwXHU1MzlGXHU1M0U1XHU3Njg0XHU1OTBEXHU4RkYwXHUzMDAyXHU1RkM1XHU5ODdCXHU0RUNFXHU3QjE0XHU4QkIwXHU1MTg1XHU1QkI5XHU0RTJEXHU2M0QwXHU3MEJDXHU1MUZBXHU0RTAwXHU0RTJBXHU2RTA1XHU2NjcwXHUzMDAxXHU2MkJEXHU4QzYxXHUzMDAxXHU1M0VGXHU3MkVDXHU3QUNCXHU2MjEwXHU3QUNCXHU3Njg0XHU3NkVFXHU2ODA3XHU1NDBEXHUzMDAyXG4gICAgLSBcdTUxOTlcdTZDRDVcdUZGMUFcdTUyQThcdTVCQkVcdTdFRDNcdTY3ODRcdTYyMTZcdTU0MERcdThCQ0RcdTc3RURcdThCRURcdUZGMEM8MjAgXHU1QjU3XHVGRjBDXHU1M0JCXHU2Mzg5XCJcdTYyMTFcdTYwRjNcIlwiM1x1NEUyQVx1NjcwOFwiXCI1a2dcIlx1N0I0OVx1NTE3N1x1NEY1M1x1NjU3MFx1NUI1N1x1NEUwRVx1NjVGNlx1OTVGNFx1RkYwQ1x1NTNFQVx1NEZERFx1NzU1OVx1NzZFRVx1NjgwN1x1NjVCOVx1NTQxMVx1MzAwMlxuICAgIC0gXHU2NTM5XHU1NDBEXHU3OTNBXHU0RjhCXHVGRjA4XHU0RUM1XHU1M0MyXHU4MDAzXHU5MDNCXHU4RjkxXHVGRjBDXHU0RTBEXHU2NjJGXHU2QjdCXHU4OUM0XHU1MjE5XHVGRjA5XHVGRjFBXG4gICAgICBcdTAwQjcgXHU3QjE0XHU4QkIwXHUzMDBDM1x1NEUyQVx1NjcwOFx1NTFDRlx1OTFDRCA1a2dcdTMwMEQgXHUyMTkyIFx1NjgwN1x1OTg5OFx1MzAwQ1x1NTA2NVx1NUVCN1x1NTFDRlx1OTFDRFx1MzAwRFx1NjIxNlx1MzAwQ1x1NEY1M1x1OTFDRFx1N0JBMVx1NzQwNlx1MzAwRFxuICAgICAgXHUwMEI3IFx1N0IxNFx1OEJCMFx1MzAwQ1x1OEJGQlx1NUI4Q1x1MzAwQVhYIFx1N0I5N1x1NkNENVx1MzAwQlx1MzAwRCBcdTIxOTIgXHU2ODA3XHU5ODk4XHUzMDBDXHU3Q0ZCXHU3RURGXHU1QjY2XHU0RTYwIFhYXHUzMDBEXHU2MjE2XHUzMDBDXHU3Qjk3XHU2Q0Q1XHU1MTY1XHU5NUU4XHUzMDBEXG4gICAgICBcdTAwQjcgXHU3QjE0XHU4QkIwXHUzMDBDXHU2QkNGXHU1OTI5XHU4REQxXHU2QjY1IDMwIFx1NTIwNlx1OTQ5Rlx1MzAwMVx1NjNBN1x1NTIzNlx1OTk2RVx1OThERlx1MzAwRCBcdTIxOTIgXHU2ODA3XHU5ODk4XHUzMDBDXHU1MTdCXHU2MjEwXHU4RkQwXHU1MkE4XHU0RTYwXHU2MEVGXHUzMDBEXG4gICAgLSBcdTUzQ0RcdTRGOEJcdUZGMDhcdTc5ODFcdTZCNjJcdUZGMDlcdUZGMUFcdTY4MDdcdTk4OThcdTRFMEVcdTdCMTRcdThCQjBcdTk5OTZcdTUzRTVcdTkwMTBcdTVCNTdcdTc2RjhcdTU0MENcdTMwMDFcdTRGRERcdTc1NTlcdTUzOUZcdTU5Q0JcIjNcdTRFMkFcdTY3MDhcIi9cIjVrZ1wiL1wiXHU2MjExXHU2MEYzXCJcdTdCNDlcdTUxNzdcdTRGNTNcdTY1NzBcdTVCNTdcdTRFMEVcdTY1RjZcdTk1RjRcdTk2NTBcdTVCOUFcdTMwMDJcbjEzLiAqKlx1NkJDRlx1NEUyQVx1NzZFRVx1NjgwN1x1NUZDNVx1OTg3Qlx1N0VEOVx1NTFGQSBhbmFseXNpc1x1RkYwOFx1NUY1Mlx1N0VCM1x1NTIwNlx1Njc5MFx1RkYwOSoqXHVGRjFBXHU3NTI4IDEtMiBcdTUzRTVcdTY5ODJcdTYyRUNcdTdCMTRcdThCQjBcdTRFM0JcdTY1RThcdUZGMENcdTVFNzZcdThCRjRcdTY2MEVcdTMwMENcdTRFM0FcdTRGNTVcdThGRDlcdTY4MzdcdTYyQzZcdTMwMDFcdTUxNzNcdTk1MkVcdTk4Q0VcdTk2NjlcdTYyMTZcdTZDRThcdTYxMEZcdTcwQjlcdTMwMERcdUZGMENcdTIyNjQ0MCBcdTVCNTdcdTMwMDJcdThGRDlcdTY2MkZcdTdFRDlcdTc1MjhcdTYyMzdcdTc2ODRcIlx1NUY1Mlx1N0VCMyArIFx1NTIwNlx1Njc5MFwiXHVGRjBDXHU0RTBEXHU4OTgxXHU1M0VBXHU1OTBEXHU4RkYwXHU2ODA3XHU5ODk4XHU2MjE2XHU3NTU5XHU3QTdBXHUzMDAyXHU0RUM1XHU1QzU1XHU3OTNBXHU3NTI4XHVGRjBDXHU0RTBEXHU2MzAxXHU0RTQ1XHU1MzE2XHU0RTNBXHU1QjUwXHU5ODc5XHUzMDAyYDtcblxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7IC8vIFlZWVktTU0tRERcbiAgY29uc3QgdXNlciA9XG4gICAgc2NvcGUgPT09ICdzZWxlY3Rpb24nXG4gICAgICA/IGBcdTRFQ0FcdTU5MjlcdTY2MkYgJHt0b2RheX1cdTMwMDJcXG5cXG5cdTRFRTVcdTRFMEJcdTY2MkZcdTc1MjhcdTYyMzdcdTU3MjhcdTdCMTRcdThCQjBcdTRFMkRcdTkwMDlcdTRFMkRcdTc2ODRcdTRFMDBcdTZCQjVcdTY1ODdcdTY3MkNcdUZGMENcdThCRjdcdTc2RjRcdTYzQTVcdTYyOEFcdTVCODNcdTRGNUNcdTRFM0FcdTRFMDBcdTRFMkEvXHU1OTFBXHU0RTJBXHU3NkVFXHU2ODA3XHU2NzY1XHU2MkM2XHU4OUUzXHVGRjA4XHU0RTBEXHU4OTgxXHU1RjUzXHU2MjEwXHU2NTc0XHU3QkM3XHU3QjE0XHU4QkIwXHVGRjA5XHVGRjFBXFxuJHtjb250ZW50fWBcbiAgICAgIDogYFx1NEVDQVx1NTkyOVx1NjYyRiAke3RvZGF5fVx1MzAwMlxcblxcblx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4N1x1RkYxQVxcbiR7Y29udGVudH1gO1xuXG4gIHJldHVybiB7IHN5c3RlbSwgdXNlciB9O1xufVxuXG4vKiogXHU0RUNFXHU2QTIxXHU1NzhCXHU1NkRFXHU2MjY3XHU2NTg3XHU2NzJDXHU0RTJEXHU2M0QwXHU1M0Q2IGdvYWxzIFx1NjU3MFx1N0VDNFx1RkYwOFx1NUJCOVx1NUZDRCBgYGBqc29uIFx1NTZGNFx1NjgwRlx1NEUwRVx1NTI0RFx1NTQwRVx1NUU5Rlx1OEJERFx1RkYwOSAqL1xuZnVuY3Rpb24gZXh0cmFjdEdvYWxzT2JqZWN0KHJhdzogdW5rbm93bik6IHsgZ29hbHM/OiB1bmtub3duIH0ge1xuICBpZiAocmF3ICYmIHR5cGVvZiByYXcgPT09ICdvYmplY3QnICYmICdnb2FscycgaW4gKHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikpIHtcbiAgICByZXR1cm4gcmF3IGFzIHsgZ29hbHM/OiB1bmtub3duIH07XG4gIH1cbiAgLy8gcmF3IFx1NTNFRlx1ODBGRFx1NjYyRlx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOHJlc3AudGV4dCBcdTYyMTZcdTVERjIgc3RyaW5naWZ5IFx1NzY4NFx1NTZERVx1NjI2N1x1RkYwOVxuICBsZXQgdGV4dCA9IHR5cGVvZiByYXcgPT09ICdzdHJpbmcnID8gcmF3IDogSlNPTi5zdHJpbmdpZnkocmF3KTtcblxuICAvLyBcdTUzQkIgYGBganNvbiAuLi4gYGBgIFx1NTZGNFx1NjgwRlxuICBjb25zdCBmZW5jZSA9IHRleHQubWF0Y2goL2BgYCg/Ompzb24pP1xccyooW1xcc1xcU10qPylgYGAvaSk7XG4gIGlmIChmZW5jZSkgdGV4dCA9IGZlbmNlWzFdO1xuXG4gIC8vIFx1NTNENlx1N0IyQ1x1NEUwMFx1NEUyQSB7IFx1NTIzMFx1NjcwMFx1NTQwRVx1NEUwMFx1NEUyQSB9IFx1NEU0Qlx1OTVGNFx1NzY4NCBKU09OXG4gIGNvbnN0IHN0YXJ0ID0gdGV4dC5pbmRleE9mKCd7Jyk7XG4gIGNvbnN0IGVuZCA9IHRleHQubGFzdEluZGV4T2YoJ30nKTtcbiAgaWYgKHN0YXJ0ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8IGVuZCA8PSBzdGFydCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU1NkRFXHU2MjY3XHU0RTJEXHU2NzJBXHU2MjdFXHU1MjMwIEpTT04gXHU1QkY5XHU4QzYxJyk7XG4gIH1cbiAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQgKyAxKSk7XG4gIGlmIChwYXJzZWQgJiYgdHlwZW9mIHBhcnNlZCA9PT0gJ29iamVjdCcgJiYgJ2dvYWxzJyBpbiBwYXJzZWQpIHJldHVybiBwYXJzZWQ7XG4gIHRocm93IG5ldyBFcnJvcignSlNPTiBcdTRFMkRcdTdGM0FcdTVDMTEgZ29hbHMgXHU1QjU3XHU2QkI1Jyk7XG59XG5cbi8qKlxuICogXHU2MjhBXHU2QTIxXHU1NzhCXHU1NkRFXHU2MjY3XHU4OUUzXHU2NzkwXHU0RTNBIEdvYWxJdGVtW11cdTMwMDJcbiAqIFx1NEVDNVx1NTA1QVx1N0VEM1x1Njc4NFx1NjNEMFx1NTNENlx1NEUwRVx1NTdGQVx1Nzg0MFx1NjYyMFx1NUMwNFx1RkYwOFx1NzUxRlx1NjIxMCBpZFx1MzAwMVx1NjYyMFx1NUMwNFx1NUI1N1x1NkJCNVx1RkYwOVx1RkYxQlx1NkRGMVx1NUVBNlx1NjgyMVx1OUE4Qy9cdTg4NjVcdTlFRDhcdThCQTRcdTRFQTRcdTc1MzEgR29hbENhcmRWYWxpZGF0b3JcdTMwMDJcbiAqIEB0aHJvd3MgXHU1RjUzXHU1NkRFXHU2MjY3XHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU2MjE2XHU3RUQzXHU2Nzg0XHU5NzVFXHU2Q0Q1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUdvYWxzKHJhd1RleHQ6IHVua25vd24pOiBHb2FsSXRlbVtdIHtcbiAgY29uc3Qgb2JqID0gZXh0cmFjdEdvYWxzT2JqZWN0KHJhd1RleHQpO1xuICBjb25zdCBnb2FscyA9IG9iai5nb2FscztcbiAgaWYgKCFBcnJheS5pc0FycmF5KGdvYWxzKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignZ29hbHMgXHU0RTBEXHU2NjJGXHU2NTcwXHU3RUM0Jyk7XG4gIH1cblxuICByZXR1cm4gZ29hbHMubWFwKChnLCBnaSk6IEdvYWxJdGVtID0+IHtcbiAgICBjb25zdCBnb2FsID0gKGcgPz8ge30pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuaXNBcnJheShnb2FsLml0ZW1zKVxuICAgICAgPyAoZ29hbC5pdGVtcyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPltdKS5tYXAoKGl0LCBpaSk6IEdvYWxTdWJJdGVtID0+IHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gaXQgPz8ge307XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHR5cGVvZiBpdGVtLm5hbWUgPT09ICdzdHJpbmcnICYmIGl0ZW0ubmFtZSA/IGl0ZW0ubmFtZSA6IGBcdTVCNTBcdTk4Nzkke2lpICsgMX1gLFxuICAgICAgICAgICAgdGFyZ2V0VmFsdWU6IHR5cGVvZiBpdGVtLnRhcmdldFZhbHVlID09PSAnc3RyaW5nJyA/IGl0ZW0udGFyZ2V0VmFsdWUgOiAnJyxcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZTogdHlwZW9mIGl0ZW0uY3VycmVudFZhbHVlID09PSAnc3RyaW5nJyA/IGl0ZW0uY3VycmVudFZhbHVlIDogJycsXG4gICAgICAgICAgICBkYWlseU1pbjogY2xlYW5EYWlseU1pbihpdGVtLmRhaWx5TWluKSxcbiAgICAgICAgICAgIHRhc2tEYXlUeXBlOiB0eXBlb2YgaXRlbS50YXNrRGF5VHlwZSA9PT0gJ3N0cmluZycgPyBpdGVtLnRhc2tEYXlUeXBlIDogJ2RhaWx5JyxcbiAgICAgICAgICAgIGRldGFpbDogdHlwZW9mIGl0ZW0ucmVhc29uID09PSAnc3RyaW5nJyA/IGl0ZW0ucmVhc29uIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgICA6IFtdO1xuXG4gICAgY29uc3QgY2F0ZWdvcnlSYXcgPSB0eXBlb2YgZ29hbC5jYXRlZ29yeSA9PT0gJ3N0cmluZycgPyBnb2FsLmNhdGVnb3J5IDogJyc7XG4gICAgY29uc3QgY2F0ZWdvcnk6IEdvYWxDYXRlZ29yeSB8IHN0cmluZyA9XG4gICAgICBHT0FMX0NBVEVHT1JJRVMuc29tZSgoYykgPT4gYy5pZCA9PT0gY2F0ZWdvcnlSYXcpID8gY2F0ZWdvcnlSYXcgOiAnb3RoZXInO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBgZ29hbF8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke2dpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWAsXG4gICAgICB0aXRsZTogdHlwZW9mIGdvYWwudGl0bGUgPT09ICdzdHJpbmcnICYmIGdvYWwudGl0bGUgPyBnb2FsLnRpdGxlIDogYFx1NzZFRVx1NjgwNyR7Z2kgKyAxfWAsXG4gICAgICBhbmFseXNpczogdHlwZW9mIGdvYWwuYW5hbHlzaXMgPT09ICdzdHJpbmcnICYmIGdvYWwuYW5hbHlzaXMgPyBnb2FsLmFuYWx5c2lzIDogdW5kZWZpbmVkLFxuICAgICAgY2F0ZWdvcnksXG4gICAgICBzdGFydERhdGU6IHR5cGVvZiBnb2FsLnN0YXJ0RGF0ZSA9PT0gJ3N0cmluZycgPyBnb2FsLnN0YXJ0RGF0ZSA6ICcnLFxuICAgICAgZW5kRGF0ZTogdHlwZW9mIGdvYWwuZW5kRGF0ZSA9PT0gJ3N0cmluZycgPyBnb2FsLmVuZERhdGUgOiAnJyxcbiAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgaXRlbXMsXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogXHU0RUNFIGNoYXQvY29tcGxldGlvbnMgXHU1NkRFXHU2MjY3XHU0RTJEXHU2M0QwXHU1M0Q2XHU2QTIxXHU1NzhCXHU4RjkzXHU1MUZBXHU3Njg0XHU2NTg3XHU2NzJDXHUzMDAyXG4gKiBcdTUxN0NcdTVCQjlcdTRFMjRcdTc5Q0RcdTVGNjJcdTYwMDFcdUZGMUFcbiAqICAtIE9wZW5BSSBcdTk4Q0VcdTY4M0NcdUZGMUF7IGNob2ljZXM6W3sgbWVzc2FnZTp7IGNvbnRlbnQgfSB9XSB9XHVGRjA4anNvbiBcdTYyMTYgdGV4dCBcdTU3NDdcdTUzRUZcdTgwRkRcdUZGMDlcbiAqICAtIFx1NzZGNFx1NTFGQVx1RkYxQXJlc3AuanNvbiBcdTVERjJcdTY2MkZcdTVCRjlcdThDNjEgLyByZXNwLnRleHQgXHU1REYyXHU2NjJGIEpTT04gXHU2NTg3XHU2NzJDXG4gKiBcdTYzRDBcdTUzRDZcdTU5MzFcdThEMjVcdUZGMDhcdTdBN0EgLyBcdTk3NUUgMnh4XHVGRjA5XHU3RURGXHU0RTAwXHU2MjlCXHU5NTE5XHVGRjBDXHU0RkJGXHU0RThFXHU0RTBBXHU1QzQyXHU5MUNEXHU4QkQ1IC8gXHU2M0QwXHU3OTNBXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2hhdFRleHQocmVzcDogQWlSZXNwb25zZSk6IHN0cmluZyB7XG4gIGlmIChyZXNwLnN0YXR1cyA8IDIwMCB8fCByZXNwLnN0YXR1cyA+PSAzMDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEFJIFx1NjcwRFx1NTJBMVx1OEZENFx1NTZERSBIVFRQICR7cmVzcC5zdGF0dXN9YCk7XG4gIH1cbiAgbGV0IGRhdGE6IHVua25vd24gPSByZXNwLmpzb247XG4gIGlmIChkYXRhID09PSB1bmRlZmluZWQgfHwgZGF0YSA9PT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgcmVzcC50ZXh0ID09PSAnc3RyaW5nJyAmJiByZXNwLnRleHQudHJpbSgpKSBkYXRhID0gcmVzcC50ZXh0O1xuICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKCdBSSBcdTU2REVcdTYyNjdcdTRFM0FcdTdBN0EnKTtcbiAgfVxuXG4gIC8vIE9wZW5BSSBcdTk4Q0VcdTY4M0NcdTUzMDVcdTg4QzVcdUZGMUFjaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCBcdTYyNERcdTY2MkZcdTc3MUZcdTZCNjNcdTc2ODQgSlNPTi9cdTY1ODdcdTY3MkNcbiAgaWYgKFxuICAgIGRhdGEgJiZcbiAgICB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiZcbiAgICBBcnJheS5pc0FycmF5KChkYXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5jaG9pY2VzKVxuICApIHtcbiAgICBjb25zdCBjaG9pY2VzID0gKGRhdGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNob2ljZXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xuICAgIGNvbnN0IG1zZyA9IGNob2ljZXNbMF0/Lm1lc3NhZ2UgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgaWYgKG1zZyAmJiB0eXBlb2YgbXNnLmNvbnRlbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gbXNnLmNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSByZXR1cm4gZGF0YTtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xufVxuXG4vKipcbiAqIFx1ODlDNFx1NTIxMlx1NEUzQlx1NkQ0MVx1N0EwQlx1RkYxQVx1OEMwM1x1NzUyOCBBSSBcdTIxOTIgXHU4OUUzXHU2NzkwIFx1MjE5MiBcdTU5MzFcdThEMjVcdTkxQ0RcdThCRDVcdTRFMDBcdTZCMjFcdTMwMDJcbiAqIEBwYXJhbSBjb250ZW50IFx1N0IxNFx1OEJCMFx1NkI2M1x1NjU4N1xuICogQHBhcmFtIHNldHRpbmdzIEFJIFx1OEJCRVx1N0Y2RVx1RkYwOGtleSAvIGJhc2VVcmwgLyBtb2RlbCAvIGRlcHRoXHVGRjA5XG4gKiBAcGFyYW0gZmV0Y2hGbiBcdTUzRUZcdTZDRThcdTUxNjVcdTc2ODQgZmV0Y2hcdUZGMDhcdTlFRDhcdThCQTQgcmVxdWVzdFVybFx1RkYwQ1x1NEZCRlx1NEU4RVx1NkQ0Qlx1OEJENVx1RkYwOVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGxhbkZyb21Ob3RlKFxuICBjb250ZW50OiBzdHJpbmcsXG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MsXG4gIGZldGNoRm46IEFpRmV0Y2hGbiA9IHJlcXVlc3RVcmwgYXMgdW5rbm93biBhcyBBaUZldGNoRm4sXG4gIHNjb3BlOiAnbm90ZScgfCAnc2VsZWN0aW9uJyA9ICdub3RlJ1xuKTogUHJvbWlzZTxHb2FsSXRlbVtdPiB7XG4gIGNvbnN0IHVybCA9IGAke3NldHRpbmdzLmFpQmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2A7XG4gIGNvbnN0IHsgc3lzdGVtLCB1c2VyIH0gPSBidWlsZFByb21wdChjb250ZW50LCBzZXR0aW5ncy5haURlY29tcG9zZURlcHRoLCBzY29wZSk7XG5cbiAgY29uc3QgYXR0ZW1wdCA9IGFzeW5jICgpOiBQcm9taXNlPEFpUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2hGbih7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3NldHRpbmdzLmFpQXBpS2V5fWAsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtb2RlbDogc2V0dGluZ3MuYWlNb2RlbCxcbiAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gfSxcbiAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogdXNlciB9LFxuICAgICAgICBdLFxuICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogJ2pzb25fb2JqZWN0JyB9LFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgfSksXG4gICAgfSk7XG4gICAgaWYgKHJlc3Auc3RhdHVzIDwgMjAwIHx8IHJlc3Auc3RhdHVzID49IDMwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBSSBcdTY3MERcdTUyQTFcdThGRDRcdTU2REUgSFRUUCAke3Jlc3Auc3RhdHVzfWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcDtcbiAgfTtcblxuICBjb25zdCBwYXJzZU9uY2UgPSAocmVzcDogQWlSZXNwb25zZSk6IEdvYWxJdGVtW10gPT4gcGFyc2VHb2FscyhleHRyYWN0Q2hhdFRleHQocmVzcCkpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHBhcnNlT25jZShhd2FpdCBhdHRlbXB0KCkpO1xuICB9IGNhdGNoIChmaXJzdEVycikge1xuICAgIC8vIFx1OTFDRFx1OEJENVx1NEUwMFx1NkIyMVx1RkYwOFx1N0Y1MVx1N0VEQ1x1NjI5Nlx1NTJBOCAvIFx1NTA3Nlx1NTNEMVx1NTc0RiBKU09OXHVGRjA5XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBwYXJzZU9uY2UoYXdhaXQgYXR0ZW1wdCgpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEFJIFx1ODlDNFx1NTIxMlx1NTkzMVx1OEQyNVx1RkYxQSR7Zmlyc3RFcnIgaW5zdGFuY2VvZiBFcnJvciA/IGZpcnN0RXJyLm1lc3NhZ2UgOiAnXHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU4RkQ0XHU1NkRFXHU3RUQzXHU2NzlDJ31cdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgQVBJIEtleSAvIFx1N0Y1MVx1N0VEQ1x1RkYwQ1x1NjIxNlx1OTFDRFx1OEJENVx1MzAwMmBcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCAiLyoqXG4gKiBcdTY4MzhcdTVGQzNcdTY1NzBcdTYzNkVcdTVDNDJcdTdDN0JcdTU3OEJcdTVCOUFcdTRFNDlcdUZGMDhCIFx1Njg2M1x1RkYxQVx1NkQ4OFx1OTY2NFx1NjU3MFx1NjM2RVx1NUM0MiBhbnlcdUZGMDlcbiAqXG4gKiBcdThGRDlcdTRFOUJcdTdDN0JcdTU3OEJcdTg4QUIgVmF1bHRTdG9yYWdlIC8gSW1wb3J0VmFsaWRhdG9yIC8gTWFya2Rvd25TeW5jIC8gU3RvcmFnZUJyaWRnZSBcdTUxNzFcdTc1MjhcdUZGMENcbiAqIFx1Nzg2RVx1NEZERFwiXHU1QkZDXHU1MTY1XHU2ODIxXHU5QThDXCJcdTRFMEVcIlx1NUI5RVx1OTY0NVx1ODQzRFx1NzZEOFx1N0VEM1x1Njc4NFwiXHU1NzI4XHU3RjE2XHU4QkQxXHU2NzFGXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHUyMDE0XHUyMDE0XG4gKiBcdTRFRTVcdTU0MEVcdTY1MzkgRGF5RGF0YSBcdTdFRDNcdTY3ODRcdTY1RjZcdUZGMENUUyBcdTRGMUFcdTVGM0FcdTUyMzZcdTU0MENcdTZCNjUgSW1wb3J0VmFsaWRhdG9yIFx1NzY4NFx1NjgyMVx1OUE4Q1x1OTAzQlx1OEY5MVx1MzAwMlxuICovXG5cbi8qKiBcdTUzNTVcdTY1RTVcdTY1RjZcdTk1RjRcdThGNzRcdTc2ODRcdTRFMDBcdTRFMkFcdTY1RjZcdTZCQjUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGltZWxpbmVQZXJpb2Qge1xuICBwZXJpb2Q6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICB0aW1lOiBzdHJpbmc7XG4gIGljb24/OiBzdHJpbmc7XG4gIGV2YWw/OiBzdHJpbmc7XG4gIGl0ZW1zPzogQXJyYXk8eyB0aW1lOiBzdHJpbmc7IHRhc2s6IHN0cmluZzsgZXZhbD86IHN0cmluZyB9Pjtcbn1cblxuLyoqXG4gKiBcdTc2RUVcdTY4MDdcdTk4ODZcdTU3REZcdTY3OUFcdTRFM0VcdUZGMDhcdTRFMEUgd2ViYXBwIERFRkFVTFRfQ0FURUdPUklFUyBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMDlcbiAqIHdvcms9XHU1REU1XHU0RjVDIC8gcGVyc29uYWw9XHU0RTJBXHU0RUJBIC8gaGVhbHRoPVx1NTA2NVx1NUVCNyAvIHN0dWR5PVx1NUI2Nlx1NEU2MCAvIGZpbmFuY2U9XHU4RDIyXHU1MkExIC8gb3RoZXI9XHU1MTc2XHU0RUQ2XG4gKi9cbmV4cG9ydCBjb25zdCBHT0FMX0NBVEVHT1JJRVMgPSBbXG4gIHsgaWQ6ICd3b3JrJywgbmFtZTogJ1x1NURFNVx1NEY1QycsIGljb246ICdcdUQ4M0RcdURDQkMnIH0sXG4gIHsgaWQ6ICdwZXJzb25hbCcsIG5hbWU6ICdcdTRFMkFcdTRFQkEnLCBpY29uOiAnXHVEODNDXHVERjMxJyB9LFxuICB7IGlkOiAnaGVhbHRoJywgbmFtZTogJ1x1NTA2NVx1NUVCNycsIGljb246ICdcdUQ4M0NcdURGQzMnIH0sXG4gIHsgaWQ6ICdzdHVkeScsIG5hbWU6ICdcdTVCNjZcdTRFNjAnLCBpY29uOiAnXHVEODNEXHVEQ0RBJyB9LFxuICB7IGlkOiAnZmluYW5jZScsIG5hbWU6ICdcdThEMjJcdTUyQTEnLCBpY29uOiAnXHVEODNEXHVEQ0IwJyB9LFxuICB7IGlkOiAnb3RoZXInLCBuYW1lOiAnXHU1MTc2XHU0RUQ2JywgaWNvbjogJ1x1RDgzRVx1RERFOScgfSxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIEdvYWxDYXRlZ29yeSA9ICh0eXBlb2YgR09BTF9DQVRFR09SSUVTKVtudW1iZXJdWydpZCddO1xuXG4vKiogXHU1QjUwXHU5ODc5XHU4MjgyXHU1OTRGXHU3QzdCXHU1NzhCXHVGRjA4XHU0RTBFIHdlYmFwcCB0YXNrRGF5VHlwZSBcdTVCRjlcdTlGNTBcdUZGMDkgKi9cbmV4cG9ydCB0eXBlIFRhc2tEYXlUeXBlID0gJ2RhaWx5JyB8ICd3ZWVrbHknIHwgJ21vbnRobHknIHwgJ2N1c3RvbSc7XG5cbi8qKlxuICogXHU3NkVFXHU2ODA3XHU5ODc5XHVGRjA4Z29hbHMgXHU0RTBCXHU3Njg0XHU0RTAwXHU5ODc5XHU4RkRCXHU1RUE2XHVGRjA5XG4gKiBcdTVCNTdcdTZCQjVcdTU0MTEgd2ViYXBwIEdvYWxTZXJ2aWNlIFx1NjcxRlx1NjcxQlx1NzY4NFx1NUI1MFx1OTg3OVx1N0VEM1x1Njc4NFx1NUJGOVx1OUY1MFx1RkYwOFx1ODlDMSBHb2FsU2VydmljZS5fbWlncmF0ZUZyb21EYXlEYXRhIC8gZGVmYXVsdERhdGEuanNcdUZGMDlcdUZGMUFcbiAqICAtIGRhaWx5TWluIC8gdGFza0RheVR5cGUgXHU5QTcxXHU1MkE4XHUzMDBDXHU0RUNBXHU2NUU1XHU0RUZCXHU1MkExXHUzMDBEXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXG4gKiAgLSBzdGFydFZhbHVlIC8gdGFyZ2V0VmFsdWUgLyBjdXJyZW50VmFsdWUgXHU5QTcxXHU1MkE4XHU4RkRCXHU1RUE2XHU4RkZEXHU4RTJBXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR29hbFN1Ykl0ZW0ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHBlcmNlbnQ/OiBudW1iZXI7XG4gIGRldGFpbD86IHN0cmluZztcbiAgc3RhcnREYXRlPzogc3RyaW5nO1xuICBlbmREYXRlPzogc3RyaW5nO1xuICBzdGFydFZhbHVlPzogc3RyaW5nO1xuICB0YXJnZXRWYWx1ZT86IHN0cmluZztcbiAgY3VycmVudFZhbHVlPzogc3RyaW5nO1xuICAvKiogXHU2QkNGXHU2NUU1XHU5MUNGXHVGRjA4XHU1OTgyICczMCdcdTMwMDEnMidcdUZGMDlcdUZGMENcdTlBNzFcdTUyQThcdTRFQ0FcdTY1RTVcdTRFRkJcdTUyQTFcdTU4OUVcdTkxQ0ZcdUZGMUJcdTdBN0FcdTUyMTlcdTRFMERcdTc1MUZcdTYyMTBcdTRFQ0FcdTY1RTVcdTRFRkJcdTUyQTEgKi9cbiAgZGFpbHlNaW4/OiBzdHJpbmc7XG4gIHRhc2tEYXlUeXBlPzogVGFza0RheVR5cGUgfCBzdHJpbmc7XG4gIC8qKiBcdTg5QzRcdTUyMTJcdTY3NjVcdTZFOTBcdTY4MDdcdTZDRThcdUZGMDhcdTRFQzVcdTVCQTFcdTk2MDVcdTVDNTVcdTc5M0EvXHU2NUU1XHU2MkE1XHVGRjBDXHU1M0VGXHU5MDA5XHVGRjA5ICovXG4gIHNvdXJjZVJlZj86IHN0cmluZztcbn1cblxuLyoqIFx1NTM1NVx1NEUyQVx1NzZFRVx1NjgwNyAqL1xuZXhwb3J0IGludGVyZmFjZSBHb2FsSXRlbSB7XG4gIGlkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIC8qKiBBSSBcdTVCRjlcdTdCMTRcdThCQjBcdTc2ODRcdTVGNTJcdTdFQjNcdTUyMDZcdTY3OTBcdUZGMDgxLTIgXHU1M0U1XHU0RTNCXHU2NUU4ICsgXHU2MkM2XHU4OUUzXHU3NDA2XHU3NTMxL1x1NTE3M1x1OTUyRVx1OThDRVx1OTY2OVx1RkYwOVx1RkYwQ1x1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1RkYwQ1x1NEUwRFx1NjMwMVx1NEU0NVx1NTMxNlx1NEUzQVx1NUI1MFx1OTg3OSAqL1xuICBhbmFseXNpcz86IHN0cmluZztcbiAgaWNvbj86IHN0cmluZztcbiAgbWV0YT86IHN0cmluZztcbiAgLyoqIFx1OTg4Nlx1NTdERlx1RkYwOHdvcmsvcGVyc29uYWwvaGVhbHRoL3N0dWR5L2ZpbmFuY2Uvb3RoZXJcdUZGMDlcdUZGMEN3ZWJhcHAgXHU2MzZFXHU2QjY0XHU1MjA2XHU3RUM0XHU3NzQwXHU4MjcyICovXG4gIGNhdGVnb3J5PzogR29hbENhdGVnb3J5IHwgc3RyaW5nO1xuICBzdGFydERhdGU/OiBzdHJpbmc7XG4gIGVuZERhdGU/OiBzdHJpbmc7XG4gIHByb2dyZXNzPzogbnVtYmVyO1xuICBwcmlvcml0eT86IHN0cmluZyB8IG51bWJlcjtcbiAgaXRlbXM/OiBHb2FsU3ViSXRlbVtdO1xuICAvKiogXHU4OUM0XHU1MjEyXHU2NzY1XHU2RTkwXHVGRjFBXHU2NzY1XHU2RTkwXHU3QjE0XHU4QkIwXHU3Njg0IHZhdWx0IFx1OERFRlx1NUY4NFx1RkYwQ1x1NzUyOFx1NEU4RVx1NjVFNVx1NjJBNVx1NjgwN1x1NkNFOCAqL1xuICBzb3VyY2VSZWY/OiBzdHJpbmc7XG59XG5cbi8qKiBcdTUzNTVcdTY1RTVcdTU5MERcdTc2RDhcdTY1NzBcdTYzNkUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF5RGF0YSB7XG4gIGRhdGU6IHN0cmluZztcbiAgd2Vla2RheT86IHN0cmluZztcbiAgbWV0cmljcz86IHtcbiAgICBmaXJzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgbGFzdENoZWNrSW4/OiBzdHJpbmc7XG4gICAgY29tcGxldGVkVGFza3M/OiBzdHJpbmc7XG4gICAgaW5zcGlyYXRpb25Db3VudD86IHN0cmluZztcbiAgICBhY3RpdmVUaW1lPzogc3RyaW5nO1xuICAgIGVtcHR5U2xvdHM/OiBzdHJpbmc7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICB9O1xuICB0aW1lbGluZT86IFRpbWVsaW5lUGVyaW9kW107XG4gIGdvYWxzPzogR29hbEl0ZW1bXTtcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuLyoqIFx1NUU5NFx1NzUyOFx1OEJCRVx1N0Y2RVx1RkYwOFx1ODQzRCBzZXR0aW5ncy5qc29uXHVGRjA5ICovXG5leHBvcnQgaW50ZXJmYWNlIEFwcFNldHRpbmdzIHtcbiAgdGhlbWU/OiAnbGlnaHQnIHwgJ2RhcmsnO1xuICBiYWxhbmNlPzogbnVtYmVyO1xuICBjb2xvclRoZW1lPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG4vKiogXHU4RDJEXHU0RTcwXHU1Mzg2XHU1M0YyIC8gXHU2NTM2XHU1MTY1XHU1Mzg2XHU1M0YyXHVGRjA4XHU3RUQzXHU2Nzg0XHU1QkJEXHU2NzdFXHVGRjBDXHU0RUM1XHU1MDVBXHU5MDBGXHU0RjIwXHVGRjA5ICovXG5leHBvcnQgaW50ZXJmYWNlIEhpc3RvcnlSZWNvcmQge1xuICBpZD86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdXJjaGFzZUhpc3Rvcnkge1xuICByZWNvcmRzPzogSGlzdG9yeVJlY29yZFtdO1xuICBhcmNoaXZlPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIFtrZXk6IHN0cmluZ106IHVua25vd247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5jb21lSGlzdG9yeSB7XG4gIHJlY29yZHM/OiBIaXN0b3J5UmVjb3JkW107XG4gIGFyY2hpdmU/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuLyoqIFx1NUJGQ1x1NTFGQSAvIFx1NUJGQ1x1NTE2NVx1NzY4NFx1NUI4Q1x1NjU3NFx1NjU3MFx1NjM2RVx1N0VEM1x1Njc4NCAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHBvcnRTaGFwZSB7XG4gIHZlcnNpb246IHN0cmluZztcbiAgZXhwb3J0ZWRBdD86IHN0cmluZztcbiAgc3RvcmFnZVR5cGU/OiBzdHJpbmc7XG4gIGRheXM6IFJlY29yZDxzdHJpbmcsIERheURhdGE+O1xuICBnb2FsczogR29hbEl0ZW1bXTtcbiAgc2V0dGluZ3M6IEFwcFNldHRpbmdzO1xuICBwdXJjaGFzZUhpc3Rvcnk6IFB1cmNoYXNlSGlzdG9yeSB8IG51bGw7XG4gIGluY29tZUhpc3Rvcnk6IEluY29tZUhpc3RvcnkgfCBudWxsO1xuICB0aGVtZXM/OiB1bmtub3duW107XG4gIHJlcG9ydHM/OiB1bmtub3duW107XG59XG4iLCAiLyoqXG4gKiBHb2FsQ2FyZFZhbGlkYXRvciBcdTIwMTQgQUkgXHU0RUE3XHU1MUZBXHU3NkVFXHU2ODA3XHU3Njg0XHU2ODIxXHU5QThDXHU0RTBFXHU1MTVDXHU1RTk1XHVGRjA4UGhhc2UgMlx1RkYwOVxuICpcbiAqIFx1NUJGOVx1OUY1MCB3ZWJhcHAgR29hbFNlcnZpY2UgXHU2NzFGXHU2NzFCXHU3Njg0XHU3NkVFXHU2ODA3L1x1NUI1MFx1OTg3OVx1N0VEM1x1Njc4NFx1RkYxQVxuICogIC0gXHU3QzdCXHU1NzhCXHU1RjNBXHU4RjZDXHUzMDAxXHU3RjNBXHU1OTMxXHU1QjU3XHU2QkI1XHU4ODY1XHU5RUQ4XHU4QkE0XHUzMDAxY2F0ZWdvcnkgXHU2NzlBXHU0RTNFXHU5NzVFXHU2Q0Q1XHU1NkRFXHU4NDNEICdvdGhlcidcdUZGMUJcbiAqICAtIFx1NEUyMlx1NjcyQVx1NzdFNVx1NUI1N1x1NkJCNVx1RkYwOFx1OTA3Rlx1NTE0RCBBSSBcdTRFNzFcdTU4NUVcdTVCNTdcdTZCQjVcdTZDNjFcdTY3RDMgZ29hbHMuanNvblx1RkYwOVx1RkYxQlxuICogIC0gY2xhc3NpZnlDb21wbGV0ZW5lc3MgXHU1MjI0XHU1QjlBIGNvbXBsZXRlIC8gdGhpblx1RkYwQ1x1NUU3Nlx1NTIxN1x1NTFGQVx1N0YzQVx1NTkzMVx1N0VGNFx1NUVBNlx1RkYwQ1x1NEY5Qlx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5N1x1NjI1MyBcdTI2QTBcdTMwMDJcbiAqXG4gKiBcdTdFQUZcdTUxRkRcdTY1NzBcdTMwMDFcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHUzMDAyXG4gKi9cblxuaW1wb3J0IHtcbiAgR09BTF9DQVRFR09SSUVTLFxuICB0eXBlIEdvYWxDYXRlZ29yeSxcbiAgdHlwZSBHb2FsSXRlbSxcbiAgdHlwZSBHb2FsU3ViSXRlbSxcbn0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RBU0tfREFZX1RZUEUgPSAnZGFpbHknO1xuXG5jb25zdCBDQVRFR09SWV9TRVQgPSBuZXcgU2V0PHN0cmluZz4oR09BTF9DQVRFR09SSUVTLm1hcCgoYykgPT4gYy5pZCkpO1xuXG4vKipcbiAqIFx1NEVDRVx1NUI1MFx1OTg3OVx1NTQwRFx1NEUyRFx1NjNEMFx1NTNENlx1NTM1NVx1NEY0RFx1RkYwOFx1NTk4MlwiXHU2QkNGXHU1OTI5XHU5OTZFXHU5OERGXHU3MEVEXHU5MUNGXHU0RTBBXHU5NjUwKFx1NTM0M1x1NTM2MSlcIlx1MjE5MlwiXHU1MzQzXHU1MzYxXCJcdUZGMENcIlx1NkJDRlx1NTkyOVx1OTYwNVx1OEJGQlx1OTg3NVx1NjU3MFwiXHUyMTkyXCJcdTk4NzVcIlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RVx1NjU3MFx1NUI1N1x1Njg0Nlx1NTQwRVx1N0YwMFx1NUM1NVx1NzkzQVx1MzAwMlxuICogXHU4OEFCIFBsYW5Db25maXJtTW9kYWwgLyBBZ2VudGljUGxhbk1vZGFsIFx1NTkwRFx1NzUyOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFVuaXQobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXHU2MkVDXHU1M0Y3XHU0RTJEXHU3Njg0XHU1MzU1XHU0RjREXHVGRjFBXCIoXHU1MzQzXHU1MzYxKVwiIC8gXCJcdUZGMDhcdTVDMEZcdTY1RjZcdUZGMDlcIlxuICBjb25zdCBicmFja2V0ID0gbmFtZS5tYXRjaCgvW1x1RkYwOChdKFtcdTRFMDAtXHU5RkE1XSspWylcdUZGMDldLyk7XG4gIGlmIChicmFja2V0KSByZXR1cm4gYnJhY2tldFsxXTtcbiAgLy8gXHU5MDAwXHU1MzE2XHU1MzM5XHU5MTREXHVGRjFBXHU0RUU1XCJcdTY1NzBcIlx1N0VEM1x1NUMzRVx1RkYwOFx1NTk4MlwiXHU5NjA1XHU4QkZCXHU5ODc1XHU2NTcwXCJcdTIxOTJcIlx1OTg3NVwiXHVGRjA5XG4gIGNvbnN0IHN1ZmZpeCA9IG5hbWUubWF0Y2goL1x1NkJDRltcdTRFMDBcdTU5MjlcdTY1RTVcdTU0NjhcdTY3MDhdPyguKz8pXHU2NTcwLyk7XG4gIGlmIChzdWZmaXgpIHJldHVybiBzdWZmaXhbMV07XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gc3RyKHY6IHVua25vd24sIGZhbGxiYWNrID0gJycpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnID8gdiA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBudW0odjogdW5rbm93biwgZmFsbGJhY2sgPSAwKTogbnVtYmVyIHtcbiAgcmV0dXJuIHR5cGVvZiB2ID09PSAnbnVtYmVyJyAmJiAhTnVtYmVyLmlzTmFOKHYpID8gdiA6IGZhbGxiYWNrO1xufVxuXG4vKipcbiAqIFx1NkUwNVx1NkQxN1x1NkJDRlx1NjVFNVx1OTFDRlx1NEUzQVx1N0VBRlx1NjU3MFx1NUI1N1x1NUI1N1x1N0IyNlx1NEUzMlx1RkYwOFx1OTFDRlx1NTMxNlx1NjgzOFx1NUZDM1x1RkYwOVx1MzAwMlxuICogIC0gXCIzMFwiIC8gXCIyLjVcIiBcdTIxOTIgXHU1MzlGXHU2ODM3XG4gKiAgLSBcIjMwXHU1MjA2XHU5NDlGXCIgLyBcIjdcdTVDMEZcdTY1RjZcIiAvIFwiMjAwXHU1MzQzXHU1MzYxXCIgXHUyMTkyIFx1NTNENlx1NTI0RFx1N0YwMFx1NjU3MFx1NUI1NyBcIjMwXCIgLyBcIjdcIiAvIFwiMjAwXCJcbiAqICAtIFwiXHU3RUE2MzBcdTk4NzVcIiBcdTIxOTIgXHU1MjY1XHU3OUJCXHU5NzVFXHU2NTcwXHU1QjU3IFx1MjE5MiBcIjMwXCJcbiAqICAtIFwiXHU2QkNGXHU1OTI5XHU1NzVBXHU2MzAxXCIgLyBcIlwiIFx1MjE5MiBcIlwiXHVGRjA4XHU2NUUwXHU2Q0Q1XHU5MUNGXHU1MzE2XHVGRjA5XG4gKiBcdTc2RUVcdTc2ODRcdUZGMUFcdTc4NkVcdTRGRERcdTRFMEJcdTZFMzggcGFyc2VJbnQgXHU0RTBEXHU0RUE3XHU3NTFGIE5hTlx1RkYwQ1x1NEVDQVx1NjVFNVx1NEVGQlx1NTJBMVx1ODBGRFx1NkI2M1x1NUUzOFx1NzUxRlx1NjIxMFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5EYWlseU1pbihyYXc6IHVua25vd24pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHJhdyAhPT0gJ3N0cmluZycpIHJldHVybiAnJztcbiAgY29uc3QgdHJpbW1lZCA9IHJhdy50cmltKCk7XG4gIGlmICghdHJpbW1lZCkgcmV0dXJuICcnO1xuICBpZiAoL15cXGQrKFxcLlxcZCspPyQvLnRlc3QodHJpbW1lZCkpIHJldHVybiB0cmltbWVkO1xuICBjb25zdCBwcmVmaXggPSB0cmltbWVkLm1hdGNoKC9eKFxcZCsoPzpcXC5cXGQrKT8pLyk7XG4gIGlmIChwcmVmaXgpIHJldHVybiBwcmVmaXhbMV07XG4gIGNvbnN0IHN0cmlwcGVkID0gdHJpbW1lZC5yZXBsYWNlKC9bXjAtOS5dL2csICcnKTtcbiAgLy8gXHU1MjY1XHU3OUJCXHU1NDBFXHU1M0VGXHU4MEZEXHU2QjhCXHU3NTU5XHU1OTFBXHU0RjU5XHU1QzBGXHU2NTcwXHU3MEI5XHVGRjA4XHU1OTgyIFwiMy41LjJcIlx1RkYwOVx1RkYwQ1x1NEVDNVx1NTNENlx1OTk5Nlx1NEUyQVx1NTQwOFx1NkNENVx1NjU3MFx1NUI1N1xuICBjb25zdCB2YWxpZCA9IHN0cmlwcGVkLm1hdGNoKC9cXGQrKFxcLlxcZCspPy8pO1xuICByZXR1cm4gdmFsaWQgPyB2YWxpZFswXSA6ICcnO1xufVxuXG4vKiogXHU1MjI0XHU2NUFEXHU2QkNGXHU2NUU1XHU5MUNGXHU2NjJGXHU1NDI2XHU1REYyXHU5MUNGXHU1MzE2XHVGRjA4XHU3RUFGXHU2NTcwXHU1QjU3XHVGRjBDXHU5NzVFXHU3QTdBXHVGRjA5ICovXG5mdW5jdGlvbiBpc1F1YW50aWZpZWQodjogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIC9eXFxkKyhcXC5cXGQrKT8kLy50ZXN0KHYudHJpbSgpKTtcbn1cblxuLyoqIFx1NjgyMVx1OUE4Q1x1NUU3Nlx1ODg2NVx1OUY1MFx1NTM1NVx1NEUyQVx1NUI1MFx1OTg3OSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplU3ViSXRlbShyYXc6IHVua25vd24sIGlkeDogbnVtYmVyKTogR29hbFN1Ykl0ZW0ge1xuICBjb25zdCBpdCA9IChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcgPyByYXcgOiB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIHJldHVybiB7XG4gICAgbmFtZTogc3RyKGl0Lm5hbWUpIHx8IGBcdTVCNTBcdTk4Nzkke2lkeCArIDF9YCxcbiAgICBwZXJjZW50OiB0eXBlb2YgaXQucGVyY2VudCA9PT0gJ251bWJlcicgPyBpdC5wZXJjZW50IDogdW5kZWZpbmVkLFxuICAgIGRldGFpbDogc3RyKGl0LmRldGFpbCkgfHwgdW5kZWZpbmVkLFxuICAgIHN0YXJ0RGF0ZTogc3RyKGl0LnN0YXJ0RGF0ZSksXG4gICAgZW5kRGF0ZTogc3RyKGl0LmVuZERhdGUpLFxuICAgIHN0YXJ0VmFsdWU6IHN0cihpdC5zdGFydFZhbHVlKSxcbiAgICB0YXJnZXRWYWx1ZTogc3RyKGl0LnRhcmdldFZhbHVlKSxcbiAgICBjdXJyZW50VmFsdWU6IHN0cihpdC5jdXJyZW50VmFsdWUpLFxuICAgIGRhaWx5TWluOiBjbGVhbkRhaWx5TWluKGl0LmRhaWx5TWluKSxcbiAgICB0YXNrRGF5VHlwZTogc3RyKGl0LnRhc2tEYXlUeXBlKSB8fCBERUZBVUxUX1RBU0tfREFZX1RZUEUsXG4gICAgc291cmNlUmVmOiBzdHIoaXQuc291cmNlUmVmKSB8fCB1bmRlZmluZWQsXG4gIH07XG59XG5cbi8qKiBcdTY4MjFcdTlBOENcdTVFNzZcdTg4NjVcdTlGNTBcdTUzNTVcdTRFMkFcdTc2RUVcdTY4MDdcdUZGMDhcdTRFMjJcdTY3MkFcdTc3RTVcdTVCNTdcdTZCQjVcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUdvYWwocmF3OiB1bmtub3duKTogR29hbEl0ZW0ge1xuICBjb25zdCBnID0gKHJhdyAmJiB0eXBlb2YgcmF3ID09PSAnb2JqZWN0JyA/IHJhdyA6IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgY29uc3QgY2F0ZWdvcnlSYXcgPSBzdHIoZy5jYXRlZ29yeSk7XG4gIGNvbnN0IGNhdGVnb3J5OiBHb2FsQ2F0ZWdvcnkgfCBzdHJpbmcgPSBDQVRFR09SWV9TRVQuaGFzKGNhdGVnb3J5UmF3KSA/IGNhdGVnb3J5UmF3IDogJ290aGVyJztcblxuICBjb25zdCBpdGVtc1JhdyA9IEFycmF5LmlzQXJyYXkoZy5pdGVtcykgPyBnLml0ZW1zIDogW107XG4gIGNvbnN0IGl0ZW1zID0gaXRlbXNSYXcubWFwKChpdCwgaSkgPT4gc2FuaXRpemVTdWJJdGVtKGl0LCBpKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBpZDogc3RyKGcuaWQpIHx8IGBnb2FsXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YCxcbiAgICB0aXRsZTogc3RyKGcudGl0bGUpIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTc2RUVcdTY4MDcnLFxuICAgIC8vIEFJIFx1NUY1Mlx1N0VCM1x1NTIwNlx1Njc5MFx1RkYwOFx1NEVDNVx1NUM1NVx1NzkzQVx1NzUyOFx1RkYwOVx1RkYxQVx1NEZERFx1NzU1OVx1NzUyOFx1NjIzN1x1OEY5M1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODhBQlwiXHU0RTIyXHU2NzJBXHU3N0U1XHU1QjU3XHU2QkI1XCJcdTk3NTlcdTlFRDhcdTRFMjJcdTVGMDNcbiAgICBhbmFseXNpczogc3RyKGcuYW5hbHlzaXMpIHx8IHVuZGVmaW5lZCxcbiAgICAvLyBcdTRFMjVcdTY4M0NcdTc5ODFcdTZCNjIgQUkgXHU1MTk5XHU1MTY1IGljb24gXHU1QjU3XHU2QkI1XHVGRjA4aWNvbiBcdTRFQzVcdTRGOUJcdTYyNEJcdTUyQThcdTUyMUJcdTVFRkFcdTc2ODRcdTc2RUVcdTY4MDdcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICBtZXRhOiBzdHIoZy5tZXRhKSB8fCB1bmRlZmluZWQsXG4gICAgY2F0ZWdvcnksXG4gICAgc3RhcnREYXRlOiBzdHIoZy5zdGFydERhdGUpLFxuICAgIGVuZERhdGU6IHN0cihnLmVuZERhdGUpLFxuICAgIHByb2dyZXNzOiBudW0oZy5wcm9ncmVzcywgMCksXG4gICAgcHJpb3JpdHk6IHR5cGVvZiBnLnByaW9yaXR5ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZy5wcmlvcml0eSA9PT0gJ251bWJlcicgPyBnLnByaW9yaXR5IDogdW5kZWZpbmVkLFxuICAgIGl0ZW1zLFxuICAgIHNvdXJjZVJlZjogc3RyKGcuc291cmNlUmVmKSB8fCB1bmRlZmluZWQsXG4gIH07XG59XG5cbi8qKiBcdTY1NzBcdTdFQzRcdTVCODhcdTUzNkIgKyBcdTkwMTBcdTY3NjEgc2FuaXRpemUgKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUdvYWxzKHJhdzogdW5rbm93bik6IEdvYWxJdGVtW10ge1xuICBpZiAoIUFycmF5LmlzQXJyYXkocmF3KSkgcmV0dXJuIFtdO1xuICByZXR1cm4gcmF3Lm1hcCgoZykgPT4gc2FuaXRpemVHb2FsKGcpKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0ZW5lc3NSZXN1bHQge1xuICBsZXZlbDogJ2NvbXBsZXRlJyB8ICd0aGluJztcbiAgLyoqIFx1N0YzQVx1NTkzMVx1N0VGNFx1NUVBNlx1NzY4NFx1NEVCQVx1N0M3Qlx1NTNFRlx1OEJGQlx1NjgwN1x1N0I3RVx1RkYxQSdcdTZCQ0ZcdTY1RTVcdTkxQ0YnIC8gJ1x1NjIyQVx1NkI2Mlx1NjVFNScgLyAnXHU1MjA2XHU3QzdCJyAvICdcdTgyODJcdTU5NEYnICovXG4gIG1pc3Npbmc6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFx1NTIyNFx1NUI5QVx1NzZFRVx1NjgwN1x1NEZFMVx1NjA2Rlx1NUI4Q1x1NjU3NFx1NUVBNlx1MzAwMlxuICpcbiAqIFx1NEVBN1x1NTRDMVx1NTRGMlx1NUI2Nlx1RkYxQVx1NzZFRVx1NjgwN1x1NUZDNVx1OTg3Qlx1MzAwQ1x1OTFDRlx1NTMxNlx1MzAwRFx1RkYwQ1x1OTg5N1x1N0M5Mlx1NUVBNlx1NEUzQVx1MzAwQ1x1NjVFNVx1MzAwRFx1MzAwMlx1NTZFMFx1NkI2NFx1NkJDRlx1NjVFNVx1OTFDRlx1NzY4NFx1NTIyNFx1NjM2RVx1NjYyRlxuICogKipcdTYyNDBcdTY3MDlcdTVCNTBcdTk4NzlcdTkwRkRcdTVGQzVcdTk4N0JcdTY3MDlcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW4qKlx1RkYwOFx1ODAwQ1x1OTc1RVwiXHU4MUYzXHU1QzExXHU0RTAwXHU0RTJBXCJcdUZGMDlcdUZGMENcdTU0MjZcdTUyMTlcdThCRTVcdTVCNTBcdTk4NzlcbiAqIFx1NjVFMFx1NkNENVx1NzUxRlx1NjIxMFx1NEVDQVx1NjVFNVx1NEVGQlx1NTJBMVx1RkYwQ1x1ODlDNFx1NTIxMlx1NTM3M1x1NTkzMVx1NTNCQlx1NjgzOFx1NUZDM1x1NEVGN1x1NTAzQ1x1MzAwMlxuICpcbiAqIFx1N0YzQVx1NTkzMVx1N0VGNFx1NUVBNlx1RkYxQVxuICogIC0gXHU2QkNGXHU2NUU1XHU5MUNGXHVGRjFBXHU1QjU4XHU1NzI4XHU2NzJBXHU5MUNGXHU1MzE2XHVGRjA4XHU5NzVFXHU3RUFGXHU2NTcwXHU1QjU3XHVGRjA5XHU1QjUwXHU5ODc5IFx1MjE5MiBgXHU2QkNGXHU2NUU1XHU5MUNGXHVGRjA4TiBcdTRFMkFcdTVCNTBcdTk4NzlcdTY3MkFcdTkxQ0ZcdTUzMTZcdUZGMDlgXG4gKiAgLSBcdTYyMkFcdTZCNjJcdTY1RTVcdUZGMUFlbmREYXRlIFx1N0E3QVxuICogIC0gXHU1MjA2XHU3QzdCXHVGRjFBY2F0ZWdvcnkgXHU3QTdBXG4gKiAgLSBcdTgyODJcdTU5NEZcdUZGMUFcdTVCNThcdTU3MjggdGFza0RheVR5cGUgXHU3QTdBXHU3Njg0XHU1QjUwXHU5ODc5XG4gKiBcdTRFRkJcdTRFMDBcdTdGM0FcdTU5MzFcdTUzNzMgdGhpblx1RkYwOFx1OTcwMFx1NTcyOFx1NUJBMVx1OTYwNVx1NUYzOVx1N0E5N1x1ODg2NVx1NTE2OFx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlDb21wbGV0ZW5lc3MoZ29hbDogR29hbEl0ZW0pOiBDb21wbGV0ZW5lc3NSZXN1bHQge1xuICBjb25zdCBtaXNzaW5nOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGlmICghZ29hbC5jYXRlZ29yeSkgbWlzc2luZy5wdXNoKCdcdTUyMDZcdTdDN0InKTtcblxuICBpZiAoIWdvYWwuZW5kRGF0ZSB8fCBnb2FsLmVuZERhdGUudHJpbSgpID09PSAnJykgbWlzc2luZy5wdXNoKCdcdTYyMkFcdTZCNjJcdTY1RTUnKTtcblxuICBjb25zdCBpdGVtcyA9IGdvYWwuaXRlbXMgPz8gW107XG4gIGlmIChpdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgdW5xdWFudGlmaWVkID0gaXRlbXMuZmlsdGVyKChpdCkgPT4gIWlzUXVhbnRpZmllZChpdC5kYWlseU1pbikpLmxlbmd0aDtcbiAgICBpZiAodW5xdWFudGlmaWVkID4gMCkgbWlzc2luZy5wdXNoKGBcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdUZGMDgke3VucXVhbnRpZmllZH0gXHU0RTJBXHU1QjUwXHU5ODc5XHU2NzJBXHU5MUNGXHU1MzE2XHVGRjA5YCk7XG5cbiAgICBjb25zdCBoYXNSaHl0aG0gPSBpdGVtcy5ldmVyeSgoaXQpID0+IGl0LnRhc2tEYXlUeXBlICYmIFN0cmluZyhpdC50YXNrRGF5VHlwZSkudHJpbSgpICE9PSAnJyk7XG4gICAgaWYgKCFoYXNSaHl0aG0pIG1pc3NpbmcucHVzaCgnXHU4MjgyXHU1OTRGJyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGxldmVsOiBtaXNzaW5nLmxlbmd0aCA+IDAgPyAndGhpbicgOiAnY29tcGxldGUnLFxuICAgIG1pc3NpbmcsXG4gIH07XG59XG4iLCAiLyoqXG4gKiBcdTc4NkVcdTVCOUFcdTYwMjdcdTc2RUVcdTY4MDcgSUQgXHU2RDNFXHU3NTFGXHVGRjA4XHU3RUFGXHU1MUZEXHU2NTcwXHUzMDAxXHU5NkY2XHU0RjlEXHU4RDU2XHVGRjBDXHU0RkJGXHU0RThFXHU1MzU1XHU2RDRCXHVGRjA5XHUzMDAyXG4gKlxuICogXHU3NTI4XHU3QTMzXHU1QjlBXHU1NEM4XHU1RTBDXHVGRjA4Rk5WLTFhIDMyIFx1NEY0RFx1RkYwOVx1NEVDRSBzZWVkIFx1NzUxRlx1NjIxMCBpZFx1MzAwMlxuICogXHU3NkVFXHU3Njg0XHVGRjFBXHU1NDBDXHU0RTAwXHU3QjE0XHU4QkIwICsgXHU1NDBDXHU0RTAwXHU2ODA3XHU5ODk4XHU5MUNEXHU2NUIwXHU4OUM0XHU1MjEyXHU2NUY2XHVGRjBDSUQgXHU3QTMzXHU1QjlBXHU0RTBEXHU1M0Q4XHVGRjFCd3JpdGVBaUdvYWxzIFx1NjMwOSBpZCBcdTU0MDhcdTVFNzZcdTUzNzNcdTIwMUNcdTUzOUZcdTU3MzBcdTY2RjRcdTY1QjBcdTIwMURcbiAqIFx1ODAwQ1x1OTc1RVx1MjAxQ1x1OEZGRFx1NTJBMFx1OTFDRFx1NTkwRFx1MjAxRFx1RkYwQ1x1NjgzOVx1NkNCQlx1MzAwQ1x1OTFDRFx1NTkwRFx1ODlDNFx1NTIxMiBcdTIxOTIgXHU3NkVFXHU2ODA3XHU4RDhBXHU3OUVGXHU4RDhBXHU1OTFBXHUzMDBEXHUzMDAyXG4gKi9cblxuLyoqIEZOVi0xYSAzMiBcdTRGNERcdTU0QzhcdTVFMENcdUZGMENcdThGRDRcdTU2REVcdTY1RTBcdTdCMjZcdTUzRjcgMTYgXHU4RkRCXHU1MjM2XHU3N0VEXHU0RTMyICovXG5mdW5jdGlvbiBmbnYxYShzZWVkOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaCA9IDB4ODExYzlkYzU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VlZC5sZW5ndGg7IGkrKykge1xuICAgIGggXj0gc2VlZC5jaGFyQ29kZUF0KGkpO1xuICAgIGggPSBNYXRoLmltdWwoaCwgMHgwMTAwMDE5Myk7XG4gIH1cbiAgcmV0dXJuIChoID4+PiAwKS50b1N0cmluZygzNik7XG59XG5cbi8qKlxuICogXHU0RUNFIHNlZWRcdUZGMDhcdTVFRkFcdThCQUUgYGZpbGUucGF0aCArICd8JyArIHRpdGxlYFx1RkYwOVx1NkQzRVx1NzUxRlx1N0EzM1x1NUI5QVx1NzY4NFx1NzZFRVx1NjgwNyBpZFx1MzAwMlxuICogXHU3NkY4XHU1NDBDIHNlZWQgXHU1RkM1XHU1Rjk3XHU3NkY4XHU1NDBDIGlkXHVGRjFCXHU0RTBEXHU1NDBDIHNlZWQgXHU2NzgxXHU1QzBGXHU2OTgyXHU3Mzg3XHU3OEIwXHU2NDlFXHVGRjA4MzIgXHU0RjREXHU1NEM4XHU1RTBDXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXJpdmVTdGFibGVHb2FsSWQoc2VlZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBnb2FsXyR7Zm52MWEoc2VlZCl9YDtcbn1cbiIsICIvKipcbiAqIEFJIFx1ODlDNFx1NTIxMlx1NUU0Mlx1N0I0OVx1NTIyNFx1NUI5QVx1RkYwOFx1N0VBRlx1NTFGRFx1NjU3MFx1MzAwMVx1OTZGNlx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1RkYwOVx1MzAwMlxuICpcbiAqIFx1NTQwQ1x1NEUwMFx1N0IxNFx1OEJCMCArIFx1NzZGOFx1NTQwQ1x1NTE4NVx1NUJCOVx1NURGMlx1ODlDNFx1NTIxMlx1OEZDN1x1RkYwQ1x1NEUxNFx1NEVDNVx1NUY1M1x1OTBBM1x1NEU5Qlx1NzZFRVx1NjgwN1x1MzAwQ1x1NEVDRFx1NTE2OFx1OTBFOFx1NUI1OFx1NTcyOFx1NEU4RVx1NzZFRVx1NjgwN1x1NUU5M1x1MzAwRFx1NjVGNlx1NjI0RFx1NTNFRlx1OERGM1x1OEZDN1x1RkYxQlxuICogXHU1M0VBXHU4OTgxXHU2NzA5XHU0RTAwXHU0RTJBXHU3NkVFXHU2ODA3XHU1REYyXHU0RTIyXHU1OTMxXHVGRjA4XHU4OEFCXHU2RTA1L1x1ODhBQlx1NTIyMFx1RkYwOVx1RkYwQ1x1NUMzMVx1NTE0MVx1OEJCOFx1OTFDRFx1NjVCMFx1NTE5OVx1NTE2NVx1NEVFNVx1NjA2Mlx1NTkwRFx1MjAxNFx1MjAxNFxuICogXHU1NDI2XHU1MjE5XHUyMDFDXHU1REYyXHU4OUM0XHU1MjEyXHU4RkM3XHUyMDFEXHU0RjFBXHU2QzM4XHU0RTQ1XHU5NjNCXHU1ODVFXHU2MDYyXHU1OTBEXHVGRjBDXHU4ODY4XHU3M0IwXHU0RTNBXHUzMDBDXHU1MTk5XHU1MTY1XHU0RTg2XHU0RjQ2XHU0RTBEXHU2NjNFXHU3OTNBL1x1NEUyMlx1NTkzMVx1MzAwRFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkU2tpcFBsYW5uZWQoXG4gIHBsYW5uZWRJZHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuICBleGlzdGluZ0lkczogU2V0PHN0cmluZz5cbik6IGJvb2xlYW4ge1xuICBpZiAoIXBsYW5uZWRJZHMgfHwgcGxhbm5lZElkcy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHBsYW5uZWRJZHMuZXZlcnkoKGlkKSA9PiBleGlzdGluZ0lkcy5oYXMoaWQpKTtcbn1cbiIsICIvKipcbiAqIEFnZW50aWNQbGFuTW9kYWwgXHUyMDE0IFx1NUJGOVx1OEJERFx1NUYwRlx1ODlDNFx1NTIxMlx1NUJBMVx1OTYwNVx1NTNGMFx1RkYwOFBoYXNlIDRcdUZGMDlcbiAqXG4gKiBcdTU3MjggUGhhc2UzIFBsYW5Db25maXJtTW9kYWwgXHU3Njg0XHU2ODExXHU3MkI2XHU1QkExXHU5NjA1XHU1N0ZBXHU3ODQwXHU0RTBBXHVGRjBDXHU1M0YzXHU0RkE3XHU1MkEwXHU0RTAwXHU0RTJBXHU1QkY5XHU4QkREXHU1MzNBXHVGRjFBXG4gKiAgLSBcdTVERTZcdUZGMUFcdTUzRUZcdTdGMTZcdThGOTFcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMDhcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMDlcdUZGMENBSSBcdTZCQ0ZcdThGNkVcdThGRDRcdTU2REVcdTUxNjhcdTkxQ0YgZ29hbHMgXHU1NDBFXHU1QjlFXHU2NUY2XHU1MjM3XHU2NUIwICsgZGlmZiBcdTlBRDhcdTRFQUVcdUZGMUJcbiAqICAtIFx1NTNGM1x1RkYxQVx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NUJGOVx1OEJERFx1RkYwQ1x1NzUyOFx1NjIzN1x1OEJGNFwiXHU1M0JCXHU2Mzg5WCAvIFx1NTJBMFkgLyBcdTYyOEFaXHU2NTM5XHU2MjEwXHU0RTAwXHU0RTA5XHU0RTk0XCJcdUZGMENBSSBcdTYyNTNcdTc4RThcdTg5QzRcdTUyMTJcdUZGMUJcbiAqICAtIFx1NjI0Qlx1NTJBOFx1N0YxNlx1OEY5MVx1NzZGNFx1NjNBNVx1NEY1Q1x1NzUyOFx1NTIzMFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwQ1x1NUU3Nlx1OTAxQVx1OEZDNyBzZXNzaW9uLmFwcGx5TG9jYWxFZGl0IFx1NTE5OVx1NTE2NVx1NUJGOVx1OEJERFx1NTM4Nlx1NTNGMlx1RkYwQ1xuICogICAgXHU5NjMyXHU2QjYyIEFJIFx1NEUwQlx1OEY2RVx1NjI4QVx1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1NjUzOVx1NTJBOFx1ODk4Nlx1NzZENlx1NTZERVx1NTNCQlx1RkYxQlxuICogIC0gXHU5ODc2XHU5MEU4XHUzMDBDXHU5MUNEXHU3RjZFXHU1MjFEXHU3MjQ4XHUzMDBEXHU1NkRFXHU1MjMwIEFJIFx1OTk5Nlx1NzI0OFx1RkYxQlx1NUU5NVx1OTBFOFx1MzAwQ1x1NTE5OVx1NTE2NVx1NzZFRVx1NjgwN1x1MzAwRFx1Nzg2RVx1OEJBNFx1ODQzRFx1NUU5M1x1MzAwMlxuICpcbiAqIFx1NjMwMVx1NjcwOSBQbGFubmluZ1Nlc3Npb25cdUZGMDhcdTdFQUZcdTkwM0JcdThGOTFcdTMwMDFcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjA5XHVGRjBDXHU4MUVBXHU4RUFCXHU1M0VBXHU4RDFGXHU4RDIzIFVJIFx1N0YxNlx1NjM5Mlx1MzAwMlxuICovXG5cbmltcG9ydCB7IE1vZGFsLCBBcHAsIE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIEdPQUxfQ0FURUdPUklFUyxcbiAgdHlwZSBHb2FsSXRlbSxcbiAgdHlwZSBHb2FsU3ViSXRlbSxcbiAgdHlwZSBHb2FsQ2F0ZWdvcnksXG59IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHsgY2xhc3NpZnlDb21wbGV0ZW5lc3MsIGV4dHJhY3RVbml0IH0gZnJvbSAnLi9Hb2FsQ2FyZFZhbGlkYXRvcic7XG5pbXBvcnQgeyBQbGFubmluZ1Nlc3Npb24gfSBmcm9tICcuL1BsYW5uaW5nU2Vzc2lvbic7XG5pbXBvcnQgdHlwZSB7IFBsYW5uZXJTZXR0aW5ncyB9IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcblxuaW50ZXJmYWNlIEl0ZW1FbnRyeSB7XG4gIGl0ZW06IEdvYWxTdWJJdGVtO1xuICBrZWVwOiBib29sZWFuO1xufVxuaW50ZXJmYWNlIEdvYWxFbnRyeSB7XG4gIGdvYWw6IEdvYWxJdGVtO1xuICBpdGVtczogSXRlbUVudHJ5W107XG4gIGtlZXA6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRpY1BsYW5PcHRpb25zIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBzY29wZTogJ25vdGUnIHwgJ3NlbGVjdGlvbic7XG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3M7XG4gIHN1YnRpdGxlPzogc3RyaW5nO1xuICBvbkNvbmZpcm06IChnb2FsczogR29hbEl0ZW1bXSkgPT4gdm9pZDtcbiAgLyoqIFx1NjNEMFx1NEY5Qlx1NjVGNlx1RkYxQVx1NEVFNVx1MzAwQ1x1N0YxNlx1OEY5MVx1NzNCMFx1NjcwOVx1NjgxMVx1MzAwRFx1NkEyMVx1NUYwRlx1NjI1M1x1NUYwMFx1RkYwOFx1OEQ3MCBzZXNzaW9uLmxvYWRHb2FscyBcdTgwMENcdTk3NUUgaW5pdFx1RkYwOSAqL1xuICBnb2Fscz86IEdvYWxJdGVtW107XG4gIC8qKiBcdThGN0RcdTUxNjVcdTU0MEVcdTgxRUFcdTUyQThcdTRGNUNcdTRFM0FcdTYzMDdcdTRFRTRcdTUzRDFcdTkwMDFcdTdFRDkgQUlcdUZGMDhcdTc1MjhcdTRFOEVcdTMwMENcdTVFOTRcdTc1MjhcdThCQ0FcdTY1QURcdTVFRkFcdThCQUVcdTMwMERcdTk4ODRcdTU4NkJcdUZGMDkgKi9cbiAgaW5pdGlhbEluc3RydWN0aW9uPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQWdlbnRpY1BsYW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBzZXNzaW9uOiBQbGFubmluZ1Nlc3Npb247XG4gIHByaXZhdGUgZW50cmllczogR29hbEVudHJ5W10gPSBbXTtcbiAgcHJpdmF0ZSBzdWJ0aXRsZT86IHN0cmluZztcbiAgcHJpdmF0ZSBvbkNvbmZpcm06IChnb2FsczogR29hbEl0ZW1bXSkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvcHRzOiBBZ2VudGljUGxhbk9wdGlvbnM7XG5cbiAgcHJpdmF0ZSBsaXN0RWw/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBjaGF0TG9nRWw/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBpbnB1dEVsPzogSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgcHJpdmF0ZSBzZW5kQnRuPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHByaXZhdGUgZm9vdGVyQ291bnQ/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBjaGF0TG9nOiBBcnJheTx7IHJvbGU6ICd1c2VyJyB8ICdhc3Npc3RhbnQnOyB0ZXh0OiBzdHJpbmcgfT4gPSBbXTtcbiAgcHJpdmF0ZSBwcmV2R29hbFRpdGxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIHByZXZJdGVtS2V5cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBvcHRzOiBBZ2VudGljUGxhbk9wdGlvbnMpIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMuc3VidGl0bGUgPSBvcHRzLnN1YnRpdGxlO1xuICAgIHRoaXMub25Db25maXJtID0gb3B0cy5vbkNvbmZpcm07XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnNlc3Npb24gPSBuZXcgUGxhbm5pbmdTZXNzaW9uKG9wdHMuY29udGVudCwgb3B0cy5zZXR0aW5ncywgdW5kZWZpbmVkLCBvcHRzLnNjb3BlKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoJ2JhbWJvby1haS1wbGFuLW1vZGFsJywgJ2JhbWJvby1haS1hZ2VudGljJyk7XG5cbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQUkgXHU4OUM0XHU1MjEyXHU1MkE5XHU2MjRCIFx1MDBCNyBcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTVCQTFcdTk2MDUnIH0pO1xuXG4gICAgLy8gXHU5ODc2XHU5MEU4XHU2NENEXHU0RjVDXHVGRjFBXHU5MUNEXHU3RjZFXHU1MjFEXHU3MjQ4XG4gICAgY29uc3QgdG9wQmFyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1hZ2VudGljLXRvcGJhcicgfSk7XG4gICAgaWYgKHRoaXMuc3VidGl0bGUpIHtcbiAgICAgIHRvcEJhci5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogdGhpcy5zdWJ0aXRsZSwgY2xzOiAnYmFtYm9vLWFpLXBsYW4tc3VidGl0bGUnIH0pO1xuICAgIH1cbiAgICBjb25zdCByZXNldEJ0biA9IHRvcEJhci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1MjFCQSBcdTkxQ0RcdTdGNkVcdTUyMURcdTcyNDgnLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tYnRuIGJhbWJvby1haS1wbGFuLWJ0bi1naG9zdCcsXG4gICAgfSk7XG4gICAgcmVzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9uUmVzZXQoKSk7XG5cbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnXHU1REU2XHU0RkE3XHU2ODM4XHU1QkY5L1x1N0YxNlx1OEY5MVx1NzZFRVx1NjgwN1x1RkYwQ1x1NTNGM1x1NEZBN1x1NzUyOFx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1OEJBOSBBSSBcdTU4OUVcdTUyMjBcdTY1MzlcdUZGMDhcdTU5ODJcIlx1NTNCQlx1NjM4OVx1OEREMVx1NkI2NVwiXCJcdTUyQTBcdTZCQ0ZcdTU0NjhcdTZFMzhcdTZDRjMzXHU2QjIxXCJcdUZGMDlcdTMwMDJcdTc4NkVcdThCQTRcdTU0MEVcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdTVFOTNcdTMwMDInLFxuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGVzYycsXG4gICAgfSk7XG5cbiAgICAvLyBcdTRFM0JcdTRGNTNcdUZGMUFcdTVERTZcdTY4MTEgKyBcdTUzRjNcdTVCRjlcdThCRERcbiAgICBjb25zdCBib2R5ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1hZ2VudGljLWJvZHknIH0pO1xuXG4gICAgY29uc3QgbGVmdCA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLWFnZW50aWMtbGVmdCcgfSk7XG4gICAgdGhpcy5saXN0RWwgPSBsZWZ0LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWxpc3QnIH0pO1xuXG4gICAgY29uc3QgcmlnaHQgPSBib2R5LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1hZ2VudGljLXJpZ2h0JyB9KTtcbiAgICB0aGlzLmNoYXRMb2dFbCA9IHJpZ2h0LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1jaGF0JyB9KTtcbiAgICBjb25zdCBjb21wb3NlciA9IHJpZ2h0LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1jaGF0LWNvbXBvc2VyJyB9KTtcbiAgICB0aGlzLmlucHV0RWwgPSBjb21wb3Nlci5jcmVhdGVFbCgndGV4dGFyZWEnLCB7XG4gICAgICBjbHM6ICdiYW1ib28tYWktY2hhdC1pbnB1dCcsXG4gICAgICBhdHRyOiB7IHBsYWNlaG9sZGVyOiAnXHU4QkY0XHU3MEI5XHU0RUMwXHU0RTQ4XHVGRjBDXHU1OTgyXCJcdTYyOEFcdThERDFcdTZCNjVcdTUzQkJcdTYzODlcdUZGMENcdTYzNjJcdTYyMTBcdTZFMzhcdTZDRjNcIlx1MjAyNicsIHJvd3M6ICcyJyB9LFxuICAgIH0pO1xuICAgIHRoaXMuc2VuZEJ0biA9IGNvbXBvc2VyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHU1M0QxXHU5MDAxJyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWJ0biBiYW1ib28tYWktcGxhbi1idG4tcHJpbWFyeScsXG4gICAgfSk7XG4gICAgdGhpcy5zZW5kQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdm9pZCB0aGlzLm9uU2VuZCgpKTtcbiAgICB0aGlzLmlucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkpKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdm9pZCB0aGlzLm9uU2VuZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gXHU1RTk1XHU5MEU4XG4gICAgY29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWZvb3RlcicgfSk7XG4gICAgZm9vdGVyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG4gICAgICB0ZXh0OiAnXHU1M0Q2XHU2RDg4JyxcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWJ0biBiYW1ib28tYWktcGxhbi1idG4tZ2hvc3QnLFxuICAgIH0pLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jbG9zZSgpKTtcbiAgICBjb25zdCB3cml0ZUJ0biA9IGZvb3Rlci5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1NTE5OVx1NTE2NVx1NzZFRVx1NjgwNycsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1idG4gYmFtYm9vLWFpLXBsYW4tYnRuLXByaW1hcnknLFxuICAgIH0pO1xuICAgIHdyaXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jb25maXJtKCkpO1xuICAgIHRoaXMuZm9vdGVyQ291bnQgPSB3cml0ZUJ0bjtcblxuICAgIC8vIFx1NUYwMlx1NkI2NVx1NjJDOVx1OTk5Nlx1NzI0OFxuICAgIHZvaWQgdGhpcy5pbml0UGxhbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0UGxhbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdTdGMTZcdThGOTFcdTczQjBcdTY3MDlcdTY4MTFcdTZBMjFcdTVGMEZcdUZGMUFcdThGN0RcdTUxNjVcdTc3MUZcdTVCOUVcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMENcdTRFMERcdThDMDMgQUkgXHU2MkM2XHU4OUUzXG4gICAgaWYgKHRoaXMub3B0cy5nb2Fscykge1xuICAgICAgdGhpcy5zZXNzaW9uLmxvYWRHb2Fscyh0aGlzLm9wdHMuZ29hbHMpO1xuICAgICAgdGhpcy5jaGF0TG9nID0gW3sgcm9sZTogJ2Fzc2lzdGFudCcsIHRleHQ6ICdcdTVERjJcdThGN0RcdTUxNjVcdTRGNjBcdTc2ODRcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTdGMTZcdThGOTFcdTYyMTZcdThCQTlcdTYyMTFcdThDMDNcdTY1NzRcdTMwMDInIH1dO1xuICAgICAgdGhpcy5yZWJ1aWxkVHJlZShmYWxzZSk7XG4gICAgICB0aGlzLnJlbmRlckNoYXQoKTtcbiAgICAgIGlmICh0aGlzLm9wdHMuaW5pdGlhbEluc3RydWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gdGhpcy5vcHRzLmluaXRpYWxJbnN0cnVjdGlvbjtcbiAgICAgICAgdGhpcy5wdXNoQ2hhdCgndXNlcicsIGluc3RydWN0aW9uKTtcbiAgICAgICAgdGhpcy5zZXRTZW5kaW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgcmVwbHkgfSA9IGF3YWl0IHRoaXMuc2Vzc2lvbi5zZW5kKGluc3RydWN0aW9uKTtcbiAgICAgICAgICB0aGlzLnJlYnVpbGRUcmVlKHRydWUpO1xuICAgICAgICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsIHJlcGx5IHx8ICdcdTVERjJcdTVFOTRcdTc1MjhcdTVFRkFcdThCQUVcdTMwMDInKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgJ1x1MjZBMCBcdTVFOTRcdTc1MjhcdTVFRkFcdThCQUVcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTYyNEJcdTUyQThcdThDMDNcdTY1NzRcdTMwMDInKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0aGlzLnNldFNlbmRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgJ1x1MjNGMyBBSSBcdTg5QzRcdTUyMTJcdTRFMkRcdTIwMjZcdUZGMDhcdTZCNjNcdTU3MjhcdTYyQzZcdTg5RTNcdTc2RUVcdTY4MDdcdUZGMDknKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZ29hbHMgPSBhd2FpdCB0aGlzLnNlc3Npb24uaW5pdCgpO1xuICAgICAgaWYgKGdvYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICdBSSBcdTY3MkFcdTRFQ0VcdTdCMTRcdThCQjBcdTRFMkRcdThCQzZcdTUyMkJcdTUxRkFcdTY2MEVcdTc4NkVcdTc2RUVcdTY4MDdcdTMwMDJcXG5cdThCRDVcdThCRDVcdThGRDlcdTY4MzdcdTc2ODRcdTUzRTVcdTVGMEZcdUZGMUFcdTMwMENcdTYyMTFcdTYwRjNcdTU3MjggMyBcdTRFMkFcdTY3MDhcdTUxODVcdTUxQ0ZcdTkxQ0QgNWtnXHVGRjBDXHU2QkNGXHU1OTI5XHU4REQxXHU2QjY1IDMwIFx1NTIwNlx1OTQ5Rlx1MzAwMVx1NjNBN1x1NTIzNlx1OTk2RVx1OThERlx1MzAwRFx1MzAwMidcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmNoYXRMb2cgPSBbeyByb2xlOiAnYXNzaXN0YW50JywgdGV4dDogYFx1NURGMlx1NEVDRVx1N0IxNFx1OEJCMFx1OEJDNlx1NTIyQlx1NTFGQSAke2dvYWxzLmxlbmd0aH0gXHU0RTJBXHU3NkVFXHU2ODA3XHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU3RjE2XHU4RjkxXHU2MjE2XHU4QkE5XHU2MjExXHU4QzAzXHU2NTc0XHUzMDAyYCB9XTtcbiAgICAgIHRoaXMucmVidWlsZFRyZWUoZmFsc2UpO1xuICAgICAgdGhpcy5yZW5kZXJDaGF0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbmV3IE5vdGljZShlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiAnQUkgXHU4OUM0XHU1MjEyXHU1OTMxXHU4RDI1Jyk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBvblNlbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0RWw7XG4gICAgY29uc3QgdGV4dCA9IGlucHV0Py52YWx1ZS50cmltKCk7XG4gICAgaWYgKCF0ZXh0IHx8ICF0aGlzLnNlbmRCdG4gfHwgIWlucHV0KSByZXR1cm47XG4gICAgaW5wdXQudmFsdWUgPSAnJztcbiAgICB0aGlzLnB1c2hDaGF0KCd1c2VyJywgdGV4dCk7XG4gICAgdGhpcy5zZXRTZW5kaW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlcGx5LCBnb2FscyB9ID0gYXdhaXQgdGhpcy5zZXNzaW9uLnNlbmQodGV4dCk7XG4gICAgICB0aGlzLnJlYnVpbGRUcmVlKHRydWUpO1xuICAgICAgdGhpcy5wdXNoQ2hhdCgnYXNzaXN0YW50JywgcmVwbHkgfHwgJ1x1NURGMlx1NjZGNFx1NjVCMFx1ODlDNFx1NTIxMlx1MzAwMicpO1xuICAgICAgdm9pZCBnb2FscztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsICdcdTI2QTAgXHU2Q0ExXHU1NDJDXHU2MUMyXHVGRjBDXHU2MzYyXHU0RTJBXHU4QkY0XHU2Q0Q1XHU4QkQ1XHU4QkQ1XHVGRjA4XHU1RjUzXHU1MjREXHU4OUM0XHU1MjEyXHU2NzJBXHU2NTM5XHU1MkE4XHVGRjA5XHUzMDAyJyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuc2V0U2VuZGluZyhmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuc2Vzc2lvbi5yZXNldCgpO1xuICAgIHRoaXMucmVidWlsZFRyZWUoZmFsc2UpO1xuICAgIHRoaXMucHVzaENoYXQoJ2Fzc2lzdGFudCcsICdcdTIxQkEgXHU1REYyXHU5MUNEXHU3RjZFXHU0RTNBIEFJIFx1NTIxRFx1NzI0OFx1MzAwMicpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRTZW5kaW5nKG9uOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2VuZEJ0bikgdGhpcy5zZW5kQnRuLmRpc2FibGVkID0gb247XG4gICAgaWYgKHRoaXMuaW5wdXRFbCkgdGhpcy5pbnB1dEVsLmRpc2FibGVkID0gb247XG4gIH1cblxuICBwcml2YXRlIHB1c2hDaGF0KHJvbGU6ICd1c2VyJyB8ICdhc3Npc3RhbnQnLCB0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNoYXRMb2cucHVzaCh7IHJvbGUsIHRleHQgfSk7XG4gICAgdGhpcy5yZW5kZXJDaGF0KCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckNoYXQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNoYXRMb2dFbCkgcmV0dXJuO1xuICAgIHRoaXMuY2hhdExvZ0VsLmVtcHR5KCk7XG4gICAgZm9yIChjb25zdCBtIG9mIHRoaXMuY2hhdExvZykge1xuICAgICAgY29uc3QgYnViYmxlID0gdGhpcy5jaGF0TG9nRWwuY3JlYXRlRGl2KHtcbiAgICAgICAgY2xzOiBgYmFtYm9vLWFpLWNoYXQtYnViYmxlIGJhbWJvby1haS1jaGF0LSR7bS5yb2xlfWAsXG4gICAgICB9KTtcbiAgICAgIGJ1YmJsZS5zZXRUZXh0KG0udGV4dCk7XG4gICAgICB0aGlzLmNoYXRMb2dFbC5zY3JvbGxUb3AgPSB0aGlzLmNoYXRMb2dFbC5zY3JvbGxIZWlnaHQ7XG4gICAgfVxuICB9XG5cbiAgLyoqIFx1NEY5RFx1NjM2RSBzZXNzaW9uLmdvYWxzIFx1OTFDRFx1NUVGQVx1NURFNlx1NjgxMVx1RkYxQmhpZ2hsaWdodD10cnVlIFx1NjVGNlx1NUJGOVx1NjVCMFx1NTFGQVx1NzNCMFx1NzY4NFx1NzZFRVx1NjgwNy9cdTVCNTBcdTk4NzlcdTYyNTNcdTlBRDhcdTRFQUUgKi9cbiAgcHJpdmF0ZSByZWJ1aWxkVHJlZShoaWdobGlnaHQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMubGlzdEVsKSByZXR1cm47XG4gICAgY29uc3QgcHJldkdvYWxzID0gdGhpcy5wcmV2R29hbFRpdGxlcztcbiAgICBjb25zdCBwcmV2SXRlbXMgPSB0aGlzLnByZXZJdGVtS2V5cztcblxuICAgIHRoaXMuZW50cmllcyA9IHRoaXMuc2Vzc2lvbi5nb2Fscy5tYXAoKGdvYWwpID0+ICh7XG4gICAgICBnb2FsLFxuICAgICAga2VlcDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiAoZ29hbC5pdGVtcyA/PyBbXSkubWFwKChpdGVtKSA9PiAoeyBpdGVtLCBrZWVwOiB0cnVlIH0pKSxcbiAgICB9KSk7XG5cbiAgICBjb25zdCBsaXN0ID0gdGhpcy5saXN0RWw7XG4gICAgbGlzdC5lbXB0eSgpO1xuICAgIHRoaXMuZW50cmllcy5mb3JFYWNoKChlbnRyeSwgZ2kpID0+IHtcbiAgICAgIGNvbnN0IGlzTmV3R29hbCA9IGhpZ2hsaWdodCAmJiAhcHJldkdvYWxzLmhhcyhlbnRyeS5nb2FsLnRpdGxlKTtcbiAgICAgIHRoaXMucmVuZGVyR29hbChsaXN0LCBlbnRyeSwgZ2ksIGlzTmV3R29hbCwgaGlnaGxpZ2h0LCBwcmV2SXRlbXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wcmV2R29hbFRpdGxlcyA9IG5ldyBTZXQodGhpcy5zZXNzaW9uLmdvYWxzLm1hcCgoZykgPT4gZy50aXRsZSkpO1xuICAgIHRoaXMucHJldkl0ZW1LZXlzID0gbmV3IFNldChcbiAgICAgIHRoaXMuc2Vzc2lvbi5nb2Fscy5mbGF0TWFwKChnKSA9PiAoZy5pdGVtcyA/PyBbXSkubWFwKChpdCkgPT4gYCR7Zy50aXRsZX06OiR7aXQubmFtZX1gKSlcbiAgICApO1xuICAgIHRoaXMudXBkYXRlRm9vdGVyKCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckdvYWwoXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBlbnRyeTogR29hbEVudHJ5LFxuICAgIGdpOiBudW1iZXIsXG4gICAgaXNOZXdHb2FsOiBib29sZWFuLFxuICAgIGhpZ2hsaWdodDogYm9vbGVhbixcbiAgICBwcmV2SXRlbXM6IFNldDxzdHJpbmc+XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGNhcmQgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZ29hbCcgfSk7XG4gICAgaWYgKGlzTmV3R29hbCkgY2FyZC5hZGRDbGFzcygnYmFtYm9vLWFpLXBsYW4tZ29hbC11cGRhdGVkJyk7XG5cbiAgICBjb25zdCBoZWFkID0gY2FyZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1nb2FsLWhlYWQnIH0pO1xuXG4gICAgY29uc3QgdGl0bGVJbnB1dCA9IGhlYWQuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZ29hbC10aXRsZScsXG4gICAgICBhdHRyOiB7IHZhbHVlOiBlbnRyeS5nb2FsLnRpdGxlLCBwbGFjZWhvbGRlcjogJ1x1NzZFRVx1NjgwN1x1NjgwN1x1OTg5OCcgfSxcbiAgICB9KTtcbiAgICB0aXRsZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgZW50cnkuZ29hbC50aXRsZSA9IHRpdGxlSW5wdXQudmFsdWUudHJpbSgpIHx8IGBcdTc2RUVcdTY4MDcke2dpICsgMX1gO1xuICAgIH0pO1xuICAgIHRpdGxlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTc2RUVcdTY4MDdcdTY1MzlcdTU0MERcdTRFM0FcdTMwMEMke2VudHJ5LmdvYWwudGl0bGV9XHUzMDBEYCk7XG4gICAgfSk7XG5cbiAgICBpZiAoZW50cnkuZ29hbC5hbmFseXNpcykge1xuICAgICAgaGVhZC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiBgQUkgXHU1MjA2XHU2NzkwXHVGRjFBJHtlbnRyeS5nb2FsLmFuYWx5c2lzfWAsXG4gICAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWFuYWx5c2lzJyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGNhdFNlbGVjdCA9IGhlYWQuY3JlYXRlRWwoJ3NlbGVjdCcsIHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4tY2F0JyB9KTtcbiAgICBHT0FMX0NBVEVHT1JJRVMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3Qgb3B0ID0gY2F0U2VsZWN0LmNyZWF0ZUVsKCdvcHRpb24nLCB7IHRleHQ6IGAke2MuaWNvbn0gJHtjLm5hbWV9YCwgdmFsdWU6IGMuaWQgfSk7XG4gICAgICBpZiAoYy5pZCA9PT0gZW50cnkuZ29hbC5jYXRlZ29yeSkgb3B0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBjYXRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgZW50cnkuZ29hbC5jYXRlZ29yeSA9IGNhdFNlbGVjdC52YWx1ZSBhcyBHb2FsQ2F0ZWdvcnk7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NzZFRVx1NjgwN1x1MzAwQyR7ZW50cnkuZ29hbC50aXRsZX1cdTMwMERcdTk4ODZcdTU3REZcdTY1MzlcdTRFM0EgJHtjYXRTZWxlY3QudmFsdWV9YCk7XG4gICAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UoY2FyZCwgZW50cnkpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgc3RhcnRXcmFwID0gaGVhZC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1kYXRlcmFuZ2UnIH0pO1xuICAgIGNvbnN0IHN0YXJ0SW5wdXQgPSBzdGFydFdyYXAuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGF0ZXJhbmdlLWlucHV0JyxcbiAgICAgIGF0dHI6IHsgdHlwZTogJ2RhdGUnLCB2YWx1ZTogZW50cnkuZ29hbC5zdGFydERhdGUgPz8gJycgfSxcbiAgICB9KTtcbiAgICBzdGFydElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGVudHJ5LmdvYWwuc3RhcnREYXRlID0gc3RhcnRJbnB1dC52YWx1ZTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU3NkVFXHU2ODA3XHUzMDBDJHtlbnRyeS5nb2FsLnRpdGxlfVx1MzAwRFx1NUYwMFx1NTlDQlx1NjVFNVx1NjUzOVx1NEUzQSAke3N0YXJ0SW5wdXQudmFsdWV9YCk7XG4gICAgfSk7XG4gICAgc3RhcnRXcmFwLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnXHUyMDE0JywgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGF0ZXJhbmdlLXNlcCcgfSk7XG4gICAgY29uc3QgZW5kSW5wdXQgPSBzdGFydFdyYXAuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4tZGF0ZXJhbmdlLWlucHV0JyxcbiAgICAgIGF0dHI6IHsgdHlwZTogJ2RhdGUnLCB2YWx1ZTogZW50cnkuZ29hbC5lbmREYXRlID8/ICcnIH0sXG4gICAgfSk7XG4gICAgZW5kSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgZW50cnkuZ29hbC5lbmREYXRlID0gZW5kSW5wdXQudmFsdWU7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NzZFRVx1NjgwN1x1MzAwQyR7ZW50cnkuZ29hbC50aXRsZX1cdTMwMERcdTYyMkFcdTZCNjJcdTY1RTVcdTY1MzlcdTRFM0EgJHtlbmRJbnB1dC52YWx1ZX1gKTtcbiAgICAgIHRoaXMucmVmcmVzaFRoaW5CYWRnZShjYXJkLCBlbnRyeSk7XG4gICAgfSk7XG5cbiAgICBjYXJkLmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWJhZGdlJyB9KTtcbiAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UoY2FyZCwgZW50cnkpO1xuXG4gICAgY29uc3QgZGVsID0gaGVhZC5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgdGV4dDogJ1x1MjcxNScsXG4gICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1kZWwnLFxuICAgICAgYXR0cjogeyB0aXRsZTogJ1x1NTIyMFx1OTY2NFx1OEJFNVx1NzZFRVx1NjgwNycgfSxcbiAgICB9KTtcbiAgICBkZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBlbnRyeS5rZWVwID0gZmFsc2U7XG4gICAgICBjYXJkLnRvZ2dsZUNsYXNzKCdiYW1ib28tYWktcGxhbi1nb2FsLXJlbW92ZWQnLCB0cnVlKTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChgXHU1MjIwXHU5NjY0XHU0RTg2XHU3NkVFXHU2ODA3XHUzMDBDJHtlbnRyeS5nb2FsLnRpdGxlfVx1MzAwRGApO1xuICAgICAgdGhpcy51cGRhdGVGb290ZXIoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGl0ZW1zV3JhcCA9IGNhcmQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbXMnIH0pO1xuICAgIChlbnRyeS5nb2FsLml0ZW1zID8/IFtdKS5mb3JFYWNoKChfLCBpaSkgPT4ge1xuICAgICAgY29uc3QgaXRlbUVudHJ5ID0gZW50cnkuaXRlbXNbaWldO1xuICAgICAgaWYgKCFpdGVtRW50cnkpIHJldHVybjtcbiAgICAgIGNvbnN0IGlzTmV3SXRlbSA9IGhpZ2hsaWdodCAmJiAhcHJldkl0ZW1zLmhhcyhgJHtlbnRyeS5nb2FsLnRpdGxlfTo6JHtpdGVtRW50cnkuaXRlbS5uYW1lfWApO1xuICAgICAgdGhpcy5yZW5kZXJJdGVtKGl0ZW1zV3JhcCwgZW50cnksIGl0ZW1FbnRyeSwgaWksIGlzTmV3SXRlbSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlZnJlc2hUaGluQmFkZ2UoY2FyZDogSFRNTEVsZW1lbnQsIGVudHJ5OiBHb2FsRW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBiYWRnZSA9IGNhcmQucXVlcnlTZWxlY3RvcignLmJhbWJvby1haS1wbGFuLWJhZGdlJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmICghYmFkZ2UpIHJldHVybjtcbiAgICBjb25zdCB7IGxldmVsLCBtaXNzaW5nIH0gPSBjbGFzc2lmeUNvbXBsZXRlbmVzcyhlbnRyeS5nb2FsKTtcbiAgICBiYWRnZS5lbXB0eSgpO1xuICAgIGlmIChsZXZlbCA9PT0gJ3RoaW4nKSB7XG4gICAgICBiYWRnZS5zZXRUZXh0KGBcdTI2QTAgXHU1Rjg1XHU4ODY1XHU1ODZCXHVGRjFBJHttaXNzaW5nLmpvaW4oJ1x1MzAwMScpfWApO1xuICAgICAgYmFkZ2UuYWRkQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWJhZGdlLXRoaW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYmFkZ2Uuc2V0VGV4dCgnXHUyNzEzIFx1NURGMlx1OTFDRlx1NTMxNlx1RkYwQ1x1NTNFRlx1NTE5OVx1NTE2NScpO1xuICAgICAgYmFkZ2UucmVtb3ZlQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWJhZGdlLXRoaW4nKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckl0ZW0oXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBlbnRyeTogR29hbEVudHJ5LFxuICAgIGl0ZW1FbnRyeTogSXRlbUVudHJ5LFxuICAgIGlpOiBudW1iZXIsXG4gICAgaXNOZXdJdGVtOiBib29sZWFuXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHJvdyA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtJyB9KTtcbiAgICBpZiAoaXNOZXdJdGVtKSByb3cuYWRkQ2xhc3MoJ2JhbWJvby1haS1wbGFuLWl0ZW0tdXBkYXRlZCcpO1xuXG4gICAgY29uc3QgY2IgPSByb3cuY3JlYXRlRWwoJ2lucHV0JywgeyB0eXBlOiAnY2hlY2tib3gnLCBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLWNiJyB9KTtcbiAgICBjYi5jaGVja2VkID0gaXRlbUVudHJ5LmtlZXA7XG4gICAgY2IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgaXRlbUVudHJ5LmtlZXAgPSBjYi5jaGVja2VkO1xuICAgICAgcm93LnRvZ2dsZUNsYXNzKCdiYW1ib28tYWktcGxhbi1pdGVtLW9mZicsICFjYi5jaGVja2VkKTtcbiAgICAgIHRoaXMuc2Vzc2lvbi5hcHBseUxvY2FsRWRpdChcbiAgICAgICAgYCR7Y2IuY2hlY2tlZCA/ICdcdTRGRERcdTc1NTknIDogJ1x1NTIyMFx1OTY2NCd9XHU1QjUwXHU5ODc5XHUzMDBDJHtpdGVtRW50cnkuaXRlbS5uYW1lfVx1MzAwRGBcbiAgICAgICk7XG4gICAgICB0aGlzLnJlZnJlc2hUaGluQmFkZ2UocGFyZW50LmNsb3Nlc3QoJy5iYW1ib28tYWktcGxhbi1nb2FsJykgYXMgSFRNTEVsZW1lbnQsIGVudHJ5KTtcbiAgICAgIHRoaXMudXBkYXRlRm9vdGVyKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBuYW1lSW5wdXQgPSByb3cuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1uYW1lJyxcbiAgICAgIGF0dHI6IHsgdmFsdWU6IGl0ZW1FbnRyeS5pdGVtLm5hbWUsIHBsYWNlaG9sZGVyOiAnXHU1QjUwXHU5ODc5XHU1NDBEJyB9LFxuICAgIH0pO1xuICAgIG5hbWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgIGl0ZW1FbnRyeS5pdGVtLm5hbWUgPSBuYW1lSW5wdXQudmFsdWUudHJpbSgpIHx8IGBcdTVCNTBcdTk4Nzkke2lpICsgMX1gO1xuICAgICAgdW5pdENoaXAuc2V0VGV4dChleHRyYWN0VW5pdChuYW1lSW5wdXQudmFsdWUpKTtcbiAgICB9KTtcbiAgICBuYW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXNzaW9uLmFwcGx5TG9jYWxFZGl0KGBcdTVCNTBcdTk4NzlcdTY1MzlcdTU0MERcdTRFM0FcdTMwMEMke2l0ZW1FbnRyeS5pdGVtLm5hbWV9XHUzMDBEYCk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWl0ZW1FbnRyeS5pdGVtLnRhc2tEYXlUeXBlKSBpdGVtRW50cnkuaXRlbS50YXNrRGF5VHlwZSA9ICdkYWlseSc7XG4gICAgY29uc3QgZGFpbHlXcmFwID0gcm93LmNyZWF0ZURpdih7IGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tZGFpbHknIH0pO1xuICAgIGRhaWx5V3JhcC5jcmVhdGVTcGFuKHsgdGV4dDogJ1x1NkJDRlx1NjVFNVx1OTFDRicsIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tbGFiZWwnIH0pO1xuICAgIGNvbnN0IGRhaWx5SW5wdXQgPSBkYWlseVdyYXAuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgY2xzOiAnYmFtYm9vLWFpLXBsYW4taXRlbS1kYWlseS1pbnB1dCcsXG4gICAgICBhdHRyOiB7IHZhbHVlOiBpdGVtRW50cnkuaXRlbS5kYWlseU1pbiA/PyAnJywgcGxhY2Vob2xkZXI6ICdcdTY1NzBcdTVCNTcnLCB0eXBlOiAndGV4dCcsIGlucHV0bW9kZTogJ2RlY2ltYWwnIH0sXG4gICAgfSk7XG4gICAgY29uc3QgdW5pdENoaXAgPSBkYWlseVdyYXAuY3JlYXRlU3Bhbih7IGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0tdW5pdC1jaGlwJyB9KTtcbiAgICB1bml0Q2hpcC5zZXRUZXh0KGV4dHJhY3RVbml0KGl0ZW1FbnRyeS5pdGVtLm5hbWUpKTtcbiAgICBjb25zdCBkYWlseVdhcm4gPSByb3cuY3JlYXRlRWwoJ2RpdicsIHtcbiAgICAgIGNsczogJ2JhbWJvby1haS1wbGFuLWl0ZW0td2FybicsXG4gICAgICB0ZXh0OiAnXHUyNkEwIFx1NEUwRFx1NTNFRlx1OTFDRlx1NTMxNlx1RkYwQ1x1NUVGQVx1OEJBRVx1NTIyMFx1OTY2NFx1NjIxNlx1NjUzOVx1NTE5OVx1NEUzQVx1NTNFRlx1OEJBMVx1NjU3MFx1NTJBOFx1NEY1QycsXG4gICAgfSk7XG4gICAgY29uc3QgbWFya0RhaWx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgcXVhbnRpZmllZCA9IC9eXFxkKyhcXC5cXGQrKT8kLy50ZXN0KChpdGVtRW50cnkuaXRlbS5kYWlseU1pbiA/PyAnJykudHJpbSgpKTtcbiAgICAgIGRhaWx5V3JhcC50b2dnbGVDbGFzcygnYmFtYm9vLWFpLXBsYW4taXRlbS1uby1kYWlseScsICFxdWFudGlmaWVkKTtcbiAgICAgIGRhaWx5V2Fybi50b2dnbGVDbGFzcygnYmFtYm9vLWFpLXBsYW4taXRlbS13YXJuLXNob3cnLCAhcXVhbnRpZmllZCk7XG4gICAgfTtcbiAgICBtYXJrRGFpbHkoKTtcbiAgICBkYWlseUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgaXRlbUVudHJ5Lml0ZW0uZGFpbHlNaW4gPSBkYWlseUlucHV0LnZhbHVlLnRyaW0oKTtcbiAgICAgIG1hcmtEYWlseSgpO1xuICAgICAgdGhpcy5yZWZyZXNoVGhpbkJhZGdlKHBhcmVudC5jbG9zZXN0KCcuYmFtYm9vLWFpLXBsYW4tZ29hbCcpIGFzIEhUTUxFbGVtZW50LCBlbnRyeSk7XG4gICAgfSk7XG4gICAgZGFpbHlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNlc3Npb24uYXBwbHlMb2NhbEVkaXQoYFx1NUI1MFx1OTg3OVx1MzAwQyR7aXRlbUVudHJ5Lml0ZW0ubmFtZX1cdTMwMERcdTZCQ0ZcdTY1RTVcdTkxQ0ZcdTY1MzlcdTRFM0EgJHtpdGVtRW50cnkuaXRlbS5kYWlseU1pbn1gKTtcbiAgICB9KTtcblxuICAgIGlmIChpdGVtRW50cnkuaXRlbS5kZXRhaWwpIHtcbiAgICAgIHJvdy5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiBgQUlcdUZGMUEke2l0ZW1FbnRyeS5pdGVtLmRldGFpbH1gLFxuICAgICAgICBjbHM6ICdiYW1ib28tYWktcGxhbi1pdGVtLXJlYXNvbicsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUZvb3RlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZm9vdGVyQ291bnQpIHJldHVybjtcbiAgICBjb25zdCBuID0gdGhpcy5lbnRyaWVzLmZpbHRlcigoZSkgPT4gZS5rZWVwKS5sZW5ndGg7XG4gICAgdGhpcy5mb290ZXJDb3VudC5zZXRUZXh0KGBcdTUxOTlcdTUxNjVcdTc2RUVcdTY4MDdcdUZGMDgke259XHVGRjA5YCk7XG4gIH1cblxuICBwcml2YXRlIGNvbmZpcm0oKTogdm9pZCB7XG4gICAgY29uc3QgZmluYWxHb2FsczogR29hbEl0ZW1bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5lbnRyaWVzKSB7XG4gICAgICBpZiAoIWVudHJ5LmtlZXApIGNvbnRpbnVlO1xuICAgICAgY29uc3Qga2VwdEl0ZW1zOiBHb2FsU3ViSXRlbVtdID0gZW50cnkuaXRlbXNcbiAgICAgICAgLmZpbHRlcigoaXQpID0+IGl0LmtlZXApXG4gICAgICAgIC5tYXAoKGl0KSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBkZXRhaWw6IF9kZXRhaWwsIC4uLnJlc3QgfSA9IGl0Lml0ZW07XG4gICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgIH0pO1xuICAgICAgZmluYWxHb2Fscy5wdXNoKHsgLi4uZW50cnkuZ29hbCwgaXRlbXM6IGtlcHRJdGVtcyB9KTtcbiAgICB9XG5cbiAgICBpZiAoZmluYWxHb2Fscy5sZW5ndGggPT09IDApIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1x1NjcyQVx1NEZERFx1NzU1OVx1NEVGQlx1NEY1NVx1NzZFRVx1NjgwN1x1RkYwQ1x1NURGMlx1NTNENlx1NkQ4OFx1NTE5OVx1NTE2NScpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9uQ29uZmlybShmaW5hbEdvYWxzKTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cbiIsICIvKipcbiAqIFBsYW5uaW5nU2Vzc2lvbiBcdTIwMTQgXHU1QkY5XHU4QkREXHU1RjBGXHU4OUM0XHU1MjEyXHU0RjFBXHU4QkREXHVGRjA4QWdlbnRpY1x1RkYwQ1BoYXNlIDRcdUZGMDlcbiAqXG4gKiBcdTRFMEUgUGhhc2UxIGBwbGFuRnJvbU5vdGVgXHVGRjA4XHU0RTAwXHU2QjIxXHU2MDI3XHVGRjA5XHU0RTBEXHU1NDBDXHVGRjBDXHU2NzJDXHU3QzdCXHU3RUY0XHU2MkE0XHU0RTAwXHU2QkI1XHU1OTFBXHU4RjZFXHU1QkY5XHU4QkREXHVGRjFBXG4gKiAgLSBcdTk5OTZcdThGNkUgaW5pdCgpXHVGRjFBQUkgXHU0RUNFXHU3QjE0XHU4QkIwXHU2MkM2XHU4OUUzXHU1MjFEXHU3MjQ4IGdvYWxzXHVGRjFCXG4gKiAgLSBcdTU0MEVcdTdFRUQgc2VuZCh0ZXh0KVx1RkYxQVx1NzUyOFx1NjIzN1x1NzUyOFx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NTg5RSAvIFx1NTIyMCAvIFx1NjUzOVx1RkYwQ0FJIFx1OEZENFx1NTZERVx1MzAxMFx1NTE2OFx1OTFDRlx1MzAxMVx1NjcwMFx1NjVCMCBnb2Fsc1x1RkYxQlxuICogIC0gXHU2MjRCXHU1MkE4XHU3RjE2XHU4RjkxXHVGRjFBXHU3NkY0XHU2M0E1IG11dGF0ZSBgZ29hbHNgXHVGRjA4XHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjA5XHVGRjBDXHU1RTc2XHU3NTI4IGFwcGx5TG9jYWxFZGl0IFx1NjI4QVx1NjUzOVx1NTJBOFxuICogICAgXHU1MTk5XHU4RkRCXHU1QkY5XHU4QkREXHU1Mzg2XHU1M0YyXHVGRjBDXHU5NjMyXHU2QjYyIEFJIFx1NEUwQlx1OEY2RVx1NjI4QVx1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1NjUzOVx1NTJBOFx1ODk4Nlx1NzZENlx1NTZERVx1NTNCQlx1RkYxQlxuICogIC0gcmVzZXQoKVx1RkYxQVx1NTZERVx1NTIzMCBBSSBcdTk5OTZcdTcyNDhcdUZGMENcdTZFMDVcdTdBN0FcdTVCRjlcdThCRERcdTMwMDJcbiAqXG4gKiBcdThCQkVcdThCQTFcdTUzOUZcdTUyMTlcdUZGMDhcdTRFMEVcdTRFQTdcdTU0QzFcdTU0RjJcdTVCNjZcdTRFMDBcdTgxRjRcdUZGMDlcdUZGMUFcbiAqICAtIFx1NTM1NVx1NEUwMFx1NjU3MFx1NjM2RVx1NkU5MFx1RkYxQXRoaXMuZ29hbHMgXHU2NjJGXHU1REU1XHU0RjVDXHU1MjZGXHU2NzJDXHVGRjA4c291cmNlIG9mIHRydXRoXHVGRjA5XHUzMDAyXG4gKiAgLSBcdTVCQjlcdTk1MTlcdTRGMThcdTUxNDhcdUZGMUFcdTU3NEYgSlNPTiBcdTIxOTIgXHU1NkRFXHU2RURBXHU2NzJDXHU4RjZFIG1lc3NhZ2VzXHUzMDAxdGhpcy5nb2FscyBcdTRFMERcdTUzRDhcdTMwMDFcdTYyOUJcdTk1MTlcdTc1MzFcdTRFMEFcdTVDNDJcdTYzRDBcdTc5M0FcdTMwMDJcbiAqXG4gKiBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDZmV0Y2hGbiBcdTUzRUZcdTZDRThcdTUxNjVcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdUZGMDhcdTUzQzJcdTgwMDMgbWFya2Rvd25QbGFubmVyLnRlc3QudHNcdUZGMDlcdTMwMDJcbiAqL1xuXG5pbXBvcnQgeyByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgdHlwZSBHb2FsSXRlbSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuaW1wb3J0IHtcbiAgYnVpbGRQcm9tcHQsXG4gIGV4dHJhY3RDaGF0VGV4dCxcbiAgcGFyc2VHb2FscyxcbiAgdHlwZSBBaUZldGNoRm4sXG4gIHR5cGUgQWlSZXNwb25zZSxcbiAgdHlwZSBQbGFubmVyU2V0dGluZ3MsXG59IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcbmltcG9ydCB7IHZhbGlkYXRlR29hbHMgYXMgX3ZhbGlkYXRlIH0gZnJvbSAnLi9Hb2FsQ2FyZFZhbGlkYXRvcic7XG5cbi8qKiBcdTVCRjlcdThCRERcdTZEODhcdTYwNkZcdUZGMDhcdTVCRjlcdTlGNTAgT3BlbkFJIGNoYXQvY29tcGxldGlvbnMgbWVzc2FnZXNcdUZGMDkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhdE1lc3NhZ2Uge1xuICByb2xlOiAnc3lzdGVtJyB8ICd1c2VyJyB8ICdhc3Npc3RhbnQnO1xuICBjb250ZW50OiBzdHJpbmc7XG59XG5cbi8qKiBzZW5kKCkgXHU3Njg0XHU4RkQ0XHU1NkRFXHU1MDNDXHVGRjFBXHU2NzJDXHU4RjZFIEFJIFx1Njk4Mlx1ODk4MSArIFx1NjcwMFx1NjVCMFx1NTE2OFx1OTFDRiBnb2FscyAqL1xuZXhwb3J0IGludGVyZmFjZSBTZW5kUmVzdWx0IHtcbiAgcmVwbHk6IHN0cmluZztcbiAgZ29hbHM6IEdvYWxJdGVtW107XG59XG5cbi8qKiBcdTVCRjlcdThCRERcdTVGMEZcdTg5QzRcdTUyMTJcdThGRkRcdTUyQTBcdTUyMzAgc3lzdGVtIFx1NzY4NFx1NjMwN1x1NEVFNFx1RkYwOFx1NTkwRFx1NzUyOCBidWlsZFByb21wdCBcdTc2ODRcdTkxQ0ZcdTUzMTZcdTk0QzFcdTVGOEJcdUZGMDkgKi9cbmNvbnN0IEFHRU5UX1NVRkZJWCA9IGBcblxuIyBcdTVCRjlcdThCRERcdTVGMEZcdTg5QzRcdTUyMTJcdTZBMjFcdTVGMEZcdUZGMDhcdTRGNjBcdTZCNjNcdTRFMEVcdTc1MjhcdTYyMzdcdTU5MUFcdThGNkVcdTYyNTNcdTc4RThcdTg5QzRcdTUyMTJcdUZGMDlcblx1OEZEOVx1NjYyRlx1NUJGOVx1OEJERFx1NUYwRlx1ODlDNFx1NTIxMlx1RkYxQVx1NzUyOFx1NjIzN1x1NEYxQVx1NTcyOFx1NkI2NFx1NTdGQVx1Nzg0MFx1NEUwQVx1NjNEMFx1NTFGQVx1MzAwQ1x1NTg5RSAvIFx1NTIyMCAvIFx1NjUzOVx1MzAwRFx1N0I0OVx1ODFFQVx1NzEzNlx1OEJFRFx1OEEwMFx1NjMwN1x1NEVFNFx1MzAwMlxuLSBcdTZCQ0ZcdTZCMjFcdTU2REVcdTU5MERcdTkwRkRcdTVGQzVcdTk4N0JcdThGRDRcdTU2REVcdTMwMTBcdTVGNTNcdTUyNERcdTVCOENcdTY1NzRcdTc2ODRcdTY3MDBcdTY1QjAgZ29hbHMgSlNPTiBcdTUxNjhcdTkxQ0ZcdTMwMTFcdUZGMEMqKlx1NEUwRFx1ODk4MVx1NTNFQVx1NTZERVx1NTg5RVx1OTFDRlx1MzAwMVx1NEUwRFx1ODk4MVx1NTZERSBkaWZmKipcdTMwMDJcbi0gXHU5ODc2XHU1QzQyXHU1ODlFXHU1MkEwXHU1M0VGXHU5MDA5XHU1QjU3XHU2QkI1IFwicmVwbHlcIlx1RkYwOFx1NUI1N1x1N0IyNlx1NEUzMlx1RkYwQ1x1MjI2NDMwIFx1NUI1N1x1NEUyRFx1NjU4N1x1RkYwOVx1RkYxQVx1NzUyOFx1NEUwMFx1NTNFNVx1OEJERFx1OEJGNFx1NjYwRVx1NEY2MFx1OEZEOVx1NkIyMVx1NTA1QVx1NEU4Nlx1NEVDMFx1NEU0OFx1NjUzOVx1NTJBOFx1RkYxQlx1ODJFNVx1NzUyOFx1NjIzN1x1NTNFQVx1NjYyRlx1NjNEMFx1OTVFRVx1NEU1Rlx1OEJGN1x1N0I4MFx1ODk4MVx1NTZERVx1N0I1NFx1MzAwMlxuLSBcdTRGRERcdTYzMDFcdTRFMEFcdTY1ODdcdTYyNDBcdTY3MDlcdTkxQ0ZcdTUzMTZcdTk0QzFcdTVGOEJcdUZGMUFcdTdFQUZcdTY1NzBcdTVCNTcgZGFpbHlNaW5cdTMwMDFcdTY1RTVcdTk4OTdcdTdDOTJcdTVFQTZcdTMwMDFcdTRFMjVcdTY4M0NcdTU2RjRcdTdFRDVcdTc2RUVcdTY4MDdcdTMwMDFcdTUzRUZcdTY1NzBcdTRFRTNcdTc0MDZcdTYzMDdcdTY4MDdcdTMwMDFcdTc5ODFcdTZCNjJcIlx1NTJBQVx1NTI5Qi9cdTU3NUFcdTYzMDFcIlx1N0I0OVx1NEYyQVx1OTFDRlx1NTMxNlx1OEJDRFx1MzAwMlxuLSBcdTUzRUFcdThGOTNcdTUxRkEgSlNPTlx1RkYwQ1x1NEUwRFx1ODk4MVx1NEVGQlx1NEY1NVx1OTg5RFx1NTkxNlx1ODlFM1x1OTFDQVx1NjU4N1x1NUI1N1x1MzAwMVx1NEUwRFx1ODk4MSBtYXJrZG93biBcdTU2RjRcdTY4MEZcdTMwMDJcblx1OEY5M1x1NTFGQVx1NjgzQ1x1NUYwRlx1NzkzQVx1NEY4Qlx1RkYxQVxueyBcInJlcGx5XCI6IFwiXHU1REYyXHU1MjIwXHU5NjY0XHU4REQxXHU2QjY1XHVGRjBDXHU2NUIwXHU1ODlFXHU2QkNGXHU1NDY4XHU2RTM4XHU2Q0YzM1x1NkIyMVwiLCBcImdvYWxzXCI6IFsgLi4uIFx1NTQwQ1x1NEUwQVx1NjU4N1x1N0VEM1x1Njc4NCAuLi4gXSB9YDtcblxuZXhwb3J0IGNsYXNzIFBsYW5uaW5nU2Vzc2lvbiB7XG4gIHByaXZhdGUgbWVzc2FnZXM6IENoYXRNZXNzYWdlW10gPSBbXTtcbiAgLyoqIFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1RkYwOFx1NTM1NVx1NEUwMFx1NjU3MFx1NjM2RVx1NkU5MFx1RkYwOVx1RkYwQ0FJIFx1NEUwRVx1NjI0Qlx1NTJBOFx1N0YxNlx1OEY5MVx1OTBGRFx1NEY1Q1x1NzUyOFx1NTE3Nlx1NEUwQSAqL1xuICBnb2FsczogR29hbEl0ZW1bXSA9IFtdO1xuICAvKiogXHU5OTk2XHU3MjQ4XHU1RkVCXHU3MTY3XHVGRjBDXHU0RjlCIHJlc2V0KCkgXHU4RkQ4XHU1MzlGICovXG4gIHByaXZhdGUgaW5pdGlhbEdvYWxzOiBHb2FsSXRlbVtdID0gW107XG4gIC8qKiBcdTRGMUFcdThCRERcdTZBMjFcdTVGMEZcdUZGMUEnbm90ZScgXHU3NTMxXHU3QjE0XHU4QkIwXHU2MkM2XHU4OUUzXHU5OTk2XHU3MjQ4XHVGRjFCJ2VkaXQnIFx1NzUzMSBsb2FkR29hbHMgXHU4RjdEXHU1MTY1XHU3M0IwXHU2NzA5XHU2ODExICovXG4gIHByaXZhdGUgbW9kZTogJ25vdGUnIHwgJ2VkaXQnID0gJ25vdGUnO1xuICAvKiogZWRpdCBcdTZBMjFcdTVGMEZcdTc2ODQgc3lzdGVtIFx1NEUwQVx1NEUwQlx1NjU4N1x1RkYwOFx1NTQyQlx1OEY3RFx1NTE2NVx1NjgxMSBKU09OXHVGRjA5XHVGRjBDXHU0RjlCIHJlc2V0IFx1OEZEOFx1NTM5RiAqL1xuICBwcml2YXRlIGVkaXRTeXN0ZW1Db250ZW50ID0gJyc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjb250ZW50OiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBzZXR0aW5nczogUGxhbm5lclNldHRpbmdzLFxuICAgIHByaXZhdGUgZmV0Y2hGbjogQWlGZXRjaEZuID0gcmVxdWVzdFVybCBhcyB1bmtub3duIGFzIEFpRmV0Y2hGbixcbiAgICBwcml2YXRlIHNjb3BlOiAnbm90ZScgfCAnc2VsZWN0aW9uJyA9ICdub3RlJ1xuICApIHtcbiAgICBjb25zdCB7IHN5c3RlbSwgdXNlciB9ID0gYnVpbGRQcm9tcHQoY29udGVudCwgc2V0dGluZ3MuYWlEZWNvbXBvc2VEZXB0aCwgc2NvcGUpO1xuICAgIHRoaXMubWVzc2FnZXMucHVzaCh7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gKyBBR0VOVF9TVUZGSVggfSk7XG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0pO1xuICB9XG5cbiAgLyoqIFx1OTk5Nlx1OEY2RVx1ODlDNFx1NTIxMlx1RkYxQVx1OEZENFx1NTZERVx1NTIxRFx1NzI0OCBnb2FscyBcdTVFNzZcdTRGRERcdTVCNThcdTVGRUJcdTcxNjcgKi9cbiAgYXN5bmMgaW5pdCgpOiBQcm9taXNlPEdvYWxJdGVtW10+IHtcbiAgICBjb25zdCB0ZXh0ID0gZXh0cmFjdENoYXRUZXh0KGF3YWl0IHRoaXMuY2FsbCgpKTtcbiAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKHRleHQpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHRoaXMuZ29hbHMgPSB0aGlzLmNhbGxQYXJzZShwYXJzZUdvYWxzKG9iaikpO1xuICAgIHRoaXMuaW5pdGlhbEdvYWxzID0gdGhpcy5nb2FscztcbiAgICByZXR1cm4gdGhpcy5nb2FscztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTc1MjhcdTYyMzdcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTY1MzlcdTRFMDBcdThGNkVcdUZGMUFcdThGRDRcdTU2REUgeyByZXBseSwgZ29hbHMgfVx1RkYwQ1x1NUU3Nlx1NTE2OFx1OTFDRlx1NjZGRlx1NjM2Mlx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1x1MzAwMlxuICAgKiBcdTU3NEYgSlNPTiAvIFx1N0VEM1x1Njc4NFx1OTc1RVx1NkNENSBcdTIxOTIgXHU1NkRFXHU2RURBXHU2NzJDXHU4RjZFXHUzMDAxZ29hbHMgXHU0RkREXHU2MzAxXHU0RTBEXHU1M0Q4XHUzMDAxXHU2MjlCXHU5NTE5XHVGRjA4XHU3NTMxXHU0RTBBXHU1QzQyXHU2M0QwXHU3OTNBXHVGRjA5XHUzMDAyXG4gICAqL1xuICBhc3luYyBzZW5kKHVzZXJUZXh0OiBzdHJpbmcpOiBQcm9taXNlPFNlbmRSZXN1bHQ+IHtcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2goeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXJUZXh0IH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy5jYWxsKCk7XG4gICAgICBjb25zdCB0ZXh0ID0gZXh0cmFjdENoYXRUZXh0KHJlc3ApO1xuICAgICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZSh0ZXh0KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGNvbnN0IGdvYWxzID0gdGhpcy5jYWxsUGFyc2UocGFyc2VHb2FscyhvYmopKTtcbiAgICAgIC8vIFx1NjIxMFx1NTI5Rlx1RkYxQVx1NTE2OFx1OTFDRlx1NjZGRlx1NjM2Mlx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1xuICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbHk6IHR5cGVvZiBvYmoucmVwbHkgPT09ICdzdHJpbmcnID8gb2JqLnJlcGx5IDogJycsXG4gICAgICAgIGdvYWxzLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIFx1NUJCOVx1OTUxOVx1NjgzOFx1NUZDM1x1RkYxQVx1NTZERVx1NkVEQVx1NjcyQ1x1OEY2RSB1c2VyIFx1NkQ4OFx1NjA2Rlx1RkYwQ1x1N0VERFx1NEUwRFx1NTJBOFx1NURFNVx1NEY1Q1x1NTI2Rlx1NjcyQ1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICAgIHRocm93IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyIDogbmV3IEVycm9yKCdBSSBcdThGRDRcdTU2REVcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTAnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHU3NTI4XHU2MjM3XHU2MjRCXHU1MkE4XHU3RjE2XHU4RjkxXHU1NDBFXHU4QzAzXHU3NTI4XHVGRjFBXHU2MjhBXHU2NTM5XHU1MkE4XHU1MTk5XHU4RkRCXHU1QkY5XHU4QkREXHU1Mzg2XHU1M0YyXHVGRjA4c3lzdGVtIG5vdGVcdUZGMDlcdUZGMENcbiAgICogXHU4QkE5IEFJIFx1NEUwQlx1OEY2RVwiXHU3N0U1XHU5MDUzXHU0RjYwXHU2NTM5XHU4RkM3XCJcdUZGMENcdTRFMERcdTRGMUFcdTUxOERcdTYyOEFcdTg4QUJcdTUyMjBcdTc2ODRcdTVCNTBcdTk4NzlcdTUyQTBcdTU2REVcdTY3NjVcdTMwMDJcbiAgICogXHU3NzFGXHU2QjYzXHU3Njg0IG11dGF0ZSBcdTVERjJcdTU3MjhcdTU5MTZcdTkwRThcdTc2RjRcdTYzQTVcdTRGNUNcdTc1MjhcdTU3MjggdGhpcy5nb2FscyBcdTRFMEFcdTMwMDJcbiAgICovXG4gIGFwcGx5TG9jYWxFZGl0KG5vdGU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZXMucHVzaCh7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBgW1x1NzUyOFx1NjIzN1x1NjI0Qlx1NTJBOFx1NjUzOVx1NTJBOF0gJHtub3RlfWAgfSk7XG4gIH1cblxuICAvKiogXHU1NkRFXHU1MjMwIEFJIFx1OTk5Nlx1NzI0OFx1RkYwQ1x1NkUwNVx1N0E3QVx1NUJGOVx1OEJERFx1NTM4Nlx1NTNGMiAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSAnZWRpdCcpIHtcbiAgICAgIHRoaXMuZ29hbHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuaW5pdGlhbEdvYWxzKSk7XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gW3sgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHRoaXMuZWRpdFN5c3RlbUNvbnRlbnQgKyBBR0VOVF9TVUZGSVggfV07XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZ29hbHMgPSB0aGlzLmluaXRpYWxHb2FscztcbiAgICBjb25zdCB7IHN5c3RlbSwgdXNlciB9ID0gYnVpbGRQcm9tcHQodGhpcy5jb250ZW50LCB0aGlzLnNldHRpbmdzLmFpRGVjb21wb3NlRGVwdGgsIHRoaXMuc2NvcGUpO1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXG4gICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gKyBBR0VOVF9TVUZGSVggfSxcbiAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0sXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTdGMTZcdThGOTFcdTczQjBcdTY3MDlcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMDhcdTRFMERcdThDMDMgQUlcdUZGMDlcdUZGMUFcdTZERjFcdTYyRjdcdThEMURcdTRFM0FcdTVERTVcdTRGNUNcdTUyNkZcdTY3MkNcdUZGMENcdTYyOEFcdTVCRjlcdThCRERcdTkxQ0RcdTdGNkVcdTRFM0FcdTMwMENcdTdGMTZcdThGOTFcdTMwMERcdTRFMEFcdTRFMEJcdTY1ODdcdUZGMENcbiAgICogXHU4QkE5XHU1NDBFXHU3RUVEIHNlbmQoKSBcdTc2ODQgQUkgXHU1NzI4XHU3M0IwXHU2NzA5XHU2ODExXHU1N0ZBXHU3ODQwXHU0RTBBXHU1ODlFXHU1MjIwXHU2NTM5XHVGRjBDXHU4MDBDXHU5NzVFXHU0RUNFXHU3QjE0XHU4QkIwXHU5MUNEXHU2NUIwXHU2MkM2XHU4OUUzXHUzMDAyXG4gICAqIFx1OTk5Nlx1NzI0OFx1NUZFQlx1NzE2NyA9IFx1NEYyMFx1NTE2NVx1NjgxMVx1RkYwQ3Jlc2V0KCkgXHU1NkRFXHU1MjMwXHU3NzFGXHU1QjlFXHU5OTk2XHU3MjQ4XHVGRjA4XHU0RTBEXHU4OEFCXHU2QzYxXHU2N0QzXHVGRjA5XHUzMDAyXG4gICAqL1xuICBsb2FkR29hbHMoZ29hbHM6IEdvYWxJdGVtW10pOiB2b2lkIHtcbiAgICBjb25zdCBjbG9uZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ29hbHMpKSBhcyBHb2FsSXRlbVtdO1xuICAgIHRoaXMuZ29hbHMgPSBjbG9uZTtcbiAgICB0aGlzLmluaXRpYWxHb2FscyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ29hbHMpKSBhcyBHb2FsSXRlbVtdO1xuICAgIHRoaXMubW9kZSA9ICdlZGl0JztcbiAgICB0aGlzLmVkaXRTeXN0ZW1Db250ZW50ID1cbiAgICAgICdcdTRGNjBcdTY2MkZcdTc2RUVcdTY4MDdcdTUzNjFcdTcyNDdcdTdGMTZcdThGOTFcdTU2NjhcdTMwMDJcdTc1MjhcdTYyMzdcdTVERjJcdTY3MDlcdTRFMDBcdTRFMkFcdTc2RUVcdTY4MDdcdTY4MTFcdUZGMDhcdTU5ODJcdTRFMEIgSlNPTlx1RkYwOVx1RkYxQVxcbicgK1xuICAgICAgSlNPTi5zdHJpbmdpZnkoZ29hbHMsIG51bGwsIDIpICtcbiAgICAgICdcXG5cdTc1MjhcdTYyMzdcdTRGMUFcdTc1MjhcdTgxRUFcdTcxMzZcdThCRURcdThBMDBcdTYzRDBcdTUxRkFcdTMwMENcdTU4OUUvXHU1MjIwL1x1NjUzOVx1MzAwRFx1NjMwN1x1NEVFNFx1RkYwQ1x1NEY2MFx1NkJDRlx1NkIyMVx1NTZERVx1NTkwRFx1OTBGRFx1NUZDNVx1OTg3Qlx1OEZENFx1NTZERVx1MzAxMFx1NUY1M1x1NTI0RFx1NUI4Q1x1NjU3NFx1NzY4NFx1NjcwMFx1NjVCMCBnb2FscyBKU09OIFx1NTE2OFx1OTFDRlx1MzAxMVx1RkYwQ1x1NEZERFx1NjMwMVx1OTFDRlx1NTMxNlx1OTRDMVx1NUY4Qlx1RkYwOFx1N0VBRlx1NjU3MFx1NUI1NyBkYWlseU1pblx1MzAwMVx1NjVFNVx1OTg5N1x1N0M5Mlx1NUVBNlx1MzAwMVx1NTNFRlx1NjU3MFx1NEVFM1x1NzQwNlx1NjMwN1x1NjgwN1x1RkYwOVx1MzAwMlx1NTNFQVx1OEY5M1x1NTFGQSBKU09OXHVGRjBDXHU0RTBEXHU4OTgxIG1hcmtkb3duIFx1NTZGNFx1NjgwRlx1MzAwMic7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFt7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiB0aGlzLmVkaXRTeXN0ZW1Db250ZW50ICsgQUdFTlRfU1VGRklYIH1dO1xuICB9XG5cbiAgLyoqIFx1NUY1M1x1NTI0RFx1NUJGOVx1OEJERFx1NkQ4OFx1NjA2Rlx1RkYwOFx1NTNFQVx1OEJGQlx1NzUyOFx1OTAxNFx1RkYwQ1x1NTk4Mlx1OEMwM1x1OEJENSAvIFx1NkQ0Qlx1OEJENVx1NjVBRFx1OEEwMFx1RkYwOSAqL1xuICBnZXRNZXNzYWdlcygpOiBDaGF0TWVzc2FnZVtdIHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdlcztcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2FsbCgpOiBQcm9taXNlPEFpUmVzcG9uc2U+IHtcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLnNldHRpbmdzLmFpQmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2A7XG4gICAgcmV0dXJuIHRoaXMuZmV0Y2hGbih7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3RoaXMuc2V0dGluZ3MuYWlBcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1vZGVsOiB0aGlzLnNldHRpbmdzLmFpTW9kZWwsXG4gICAgICAgIG1lc3NhZ2VzOiB0aGlzLm1lc3NhZ2VzLFxuICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogJ2pzb25fb2JqZWN0JyB9LFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgfSksXG4gICAgfSk7XG4gIH1cblxuICAvKiogXHU4OUUzXHU2NzkwICsgXHU2ODIxXHU5QThDXHVGRjFBcGFyc2VHb2FscyBcdTUwNUFcdTVCNTdcdTZCQjVcdTY2MjBcdTVDMDRcdUZGMEN2YWxpZGF0ZUdvYWxzIFx1NTE1Q1x1NUU5NVx1ODg2NVx1OUVEOFx1OEJBNCAqL1xuICBwcml2YXRlIGNhbGxQYXJzZShyYXc6IEdvYWxJdGVtW10pOiBHb2FsSXRlbVtdIHtcbiAgICByZXR1cm4gX3ZhbGlkYXRlKHJhdyk7XG4gIH1cbn1cbiIsICIvKipcbiAqIERpYWdub3Npc01vZGFsIFx1MjAxNCBBSSBcdThCQ0FcdTY1QURcdTUzRUFcdThCRkJcdTYyQTVcdTU0NEFcdUZGMDhNVlAtMVx1RkYwOVxuICpcbiAqIFx1NUM1NVx1NzkzQVx1RkYxQVx1NjgwN1x1OTg5OCArIFx1NjQ1OFx1ODk4MSArIFx1NkJDRlx1NzZFRVx1NjgwN1x1MzAwQ1x1N0VBMlx1OUVDNFx1N0VGRlx1NzJCNlx1NjAwMVx1NUZCRFx1NjgwN1x1MzAwRCsgXHU3NEY2XHU5ODg4ICsgXHU2QkNGXHU2NzYxXHU1RUZBXHU4QkFFXHU0RTAwXHU0RTJBXHUzMDBDXHU1RTk0XHU3NTI4XHUzMDBEXHU2MzA5XHU5NEFFXHUzMDAyXG4gKiBcdTcwQjlcdTMwMENcdTVFOTRcdTc1MjhcdTMwMERcdTIxOTIgXHU4QzAzXHU3NTI4IG9uQXBwbHkoXHU4QkU1XHU3NkVFXHU2ODA3XHU4QkNBXHU2NUFEKSBcdTVFNzZcdTUxNzNcdTk1RURcdTgxRUFcdThFQUJcdUZGMDhcdTc1MzFcdTRFMEFcdTVDNDJcdTYyNTNcdTVGMDAgQWdlbnRpY1BsYW5Nb2RhbCBcdTk4ODRcdTU4NkJcdTYzMDdcdTRFRTRcdUZGMDlcdTMwMDJcbiAqIFx1NTc0RiBKU09OIFx1NTZERVx1OTAwMFx1RkYwOHJhd1RleHRcdUZGMDlcdTIxOTIgXHU3NkY0XHU2M0E1XHU1QzU1XHU3OTNBXHU3RUFGXHU2NTg3XHU2NzJDXHVGRjBDXHU0RTBEXHU1RDI5XHUzMDAyXG4gKlxuICogXHU4MUVBXHU4RUFCXHU1M0VBXHU4RDFGXHU4RDIzIFVJXHVGRjFCXHU4QkNBXHU2NUFEXHU2NTcwXHU2MzZFXHU3NTMxIEdvYWxEaWFnbm9zZXIgXHU0RUE3XHU1MUZBXHVGRjBDXHU4NDNEXHU1RTkzXHU3NTMxXHU0RTBBXHU1QzQyIG9uQXBwbHlcdTIxOTJBZ2VudGljUGxhbk1vZGFsXHUyMTkyb25Db25maXJtIFx1NUI4Q1x1NjIxMFx1MzAwMlxuICovXG5pbXBvcnQgeyBNb2RhbCwgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBEaWFnbm9zaXNSZXN1bHQsIEdvYWxEaWFnbm9zaXMgfSBmcm9tICcuL0dvYWxEaWFnbm9zZXInO1xuXG5jb25zdCBTVEFUVVNfTEFCRUw6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIG9uX3RyYWNrOiAnXHUyNzA1IFx1OEZCRVx1NjgwNycsXG4gIGJlaGluZDogJ1x1RDgzRFx1REZFMSBcdTg0M0RcdTU0MEUnLFxuICBzdHVjazogJ1x1RDgzRFx1REQzNCBcdTUwNUNcdTZFREUnLFxuICBkb25lOiAnXHUyNzA1IFx1NURGMlx1NUI4Q1x1NjIxMCcsXG4gIGF0X3Jpc2s6ICdcdUQ4M0RcdURGRTAgXHU0RTM0XHU2NzFGXHU5OENFXHU5NjY5Jyxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc2lzTW9kYWxPcHRpb25zIHtcbiAgZGlhZ25vc2lzOiBEaWFnbm9zaXNSZXN1bHQ7XG4gIG9uQXBwbHk6IChnb2FsOiBHb2FsRGlhZ25vc2lzKSA9PiB2b2lkO1xuICB0aXRsZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIERpYWdub3Npc01vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIG9wdHM6IERpYWdub3Npc01vZGFsT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgb3B0czogRGlhZ25vc2lzTW9kYWxPcHRpb25zKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIGNvbnRlbnRFbC5hZGRDbGFzcygnYmFtYm9vLWRpYWctbW9kYWwnKTtcblxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6IHRoaXMub3B0cy50aXRsZSA/PyAnQUkgXHU4QkNBXHU2NUFEIFx1MDBCNyBcdTc2RUVcdTY4MDdcdTYyNjdcdTg4NENcdTU5MERcdTc2RDgnIH0pO1xuXG4gICAgY29uc3QgZCA9IHRoaXMub3B0cy5kaWFnbm9zaXM7XG4gICAgaWYgKCFkLm9rKSB7XG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6IGQucmF3VGV4dCwgY2xzOiAnYmFtYm9vLWRpYWctcmF3JyB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZC5zdW1tYXJ5KSB7XG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6IGQuc3VtbWFyeSwgY2xzOiAnYmFtYm9vLWRpYWctc3VtbWFyeScgfSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBnIG9mIGQuZ29hbHMpIHtcbiAgICAgIGNvbnN0IGNhcmQgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctZ29hbCcgfSk7XG4gICAgICBjYXJkLmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQ6IGcudGl0bGUsIGNsczogJ2JhbWJvby1kaWFnLWdvYWwtdGl0bGUnIH0pO1xuICAgICAgY2FyZC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICB0ZXh0OiBTVEFUVVNfTEFCRUxbZy5zdGF0dXNdID8/IGcuc3RhdHVzLFxuICAgICAgICBjbHM6IGBiYW1ib28tZGlhZy1zdGF0dXMgYmFtYm9vLWRpYWctJHtnLnN0YXR1c31gLFxuICAgICAgfSk7XG4gICAgICBpZiAoZy5ib3R0bGVuZWNrKSB7XG4gICAgICAgIGNhcmQuY3JlYXRlRWwoJ2RpdicsIHsgdGV4dDogZy5ib3R0bGVuZWNrLCBjbHM6ICdiYW1ib28tZGlhZy1ib3R0bGVuZWNrJyB9KTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgcyBvZiBnLnN1Z2dlc3Rpb25zKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IGNhcmQuY3JlYXRlRGl2KHsgY2xzOiAnYmFtYm9vLWRpYWctc3VnZycgfSk7XG4gICAgICAgIHJvdy5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogcyB9KTtcbiAgICAgICAgY29uc3QgYnRuID0gcm93LmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdcdTVFOTRcdTc1MjgnLCBjbHM6ICdiYW1ib28tZGlhZy1hcHBseScgfSk7XG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICB0aGlzLm9wdHMub25BcHBseShnKTtcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkLm5leHRBY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHtcbiAgICAgICAgdGV4dDogJ1x1NEUwQlx1NEUwMFx1NkI2NVx1RkYxQScgKyBkLm5leHRBY3Rpb25zLmpvaW4oJ1x1RkYxQicpLFxuICAgICAgICBjbHM6ICdiYW1ib28tZGlhZy1uZXh0JyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuIiwgIi8qKlxuICogR29hbERpYWdub3NlciBcdTIwMTQgQUkgXHU4QkNBXHU2NUFEXHVGRjA4XHU2M0QyXHU0RUY2XHU0RkE3XHU3RUFGXHU5MDNCXHU4RjkxXHVGRjA5XG4gKlxuICogXHU4MDRDXHU4RDIzXHU4RkI5XHU3NTRDXHVGRjA4XHU0RTBFXHU0RUE3XHU1NEMxXHU1NEYyXHU1QjY2XHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFBXG4gKiAgLSBEZXZpYXRpb25DYWxjdWxhdG9yIFx1N0I5N1x1MzAwQ1x1Nzg2Q1x1NjMwN1x1NjgwN1x1MzAwRFx1RkYwOFx1NTA0Rlx1NURFRS9cdTUwNUNcdTZFREUvXHU4RDhCXHU1MkJGXHVGRjA5XHVGRjBDXHU2NzJDXHU2QTIxXHU1NzU3XHU4RDFGXHU4RDIzXHUzMDBDXHU0RTNBXHU0RUMwXHU0RTQ4ICsgXHU2MDBFXHU0RTQ4XHU4QzAzXHUzMDBEXHU3Njg0XHU1RjUyXHU1NkUwXHVGRjFCXG4gKiAgLSBcdTU5MERcdTc1MjggUGxhbm5pbmdTZXNzaW9uIFx1NzY4NCBDaGF0TWVzc2FnZSBcdTdDN0JcdTU3OEJcdTRFMEUgZXh0cmFjdENoYXRUZXh0XHVGRjBDXHU1MTY4XHU3QTBCIHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMUJcbiAqICAtIFx1NTc0RiBKU09OIFx1MjE5MiBcdTU2REVcdTkwMDAgcmF3VGV4dCBcdTdFQUZcdTY1ODdcdTY3MkNcdUZGMENcdTdFRERcdTRFMERcdTVEMjlcdTZFODNcdUZGMDhcdTRFMEUgUGxhbm5pbmdTZXNzaW9uIFx1NUJCOVx1OTUxOVx1ODMwM1x1NUYwRlx1NEUwMFx1ODFGNFx1RkYwOVx1MzAwMlxuICpcbiAqIFx1OTZGNiBPYnNpZGlhbiBcdTRGOURcdThENTZcdUZGMENmZXRjaEZuIFx1NTNFRlx1NkNFOFx1NTE2NVx1RkYwQ1x1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1MzAwMlxuICovXG5pbXBvcnQgeyByZXF1ZXN0VXJsIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBDaGF0TWVzc2FnZSB9IGZyb20gJy4vUGxhbm5pbmdTZXNzaW9uJztcbmltcG9ydCB7IGV4dHJhY3RDaGF0VGV4dCB9IGZyb20gJy4vTWFya2Rvd25QbGFubmVyJztcbmltcG9ydCB0eXBlIHsgQWlGZXRjaEZuLCBBaVJlc3BvbnNlLCBQbGFubmVyU2V0dGluZ3MgfSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQgeyBidWlsZENhY2hlLCBzdW1tYXJpemUgfSBmcm9tICcuL0RldmlhdGlvbkNhbGN1bGF0b3InO1xuaW1wb3J0IHR5cGUgeyBEYXlEYXRhLCBHb2FsSXRlbSB9IGZyb20gJy4uL3R5cGVzL2RhdGEnO1xuXG5leHBvcnQgdHlwZSBEaWFnbm9zaXNTdGF0dXMgPSAnb25fdHJhY2snIHwgJ2JlaGluZCcgfCAnc3R1Y2snIHwgJ2RvbmUnIHwgJ2F0X3Jpc2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdvYWxEaWFnbm9zaXMge1xuICB0aXRsZTogc3RyaW5nO1xuICBjb21wbGV0aW9uPzogbnVtYmVyO1xuICBzdGF0dXM6IERpYWdub3Npc1N0YXR1cztcbiAgYm90dGxlbmVjaz86IHN0cmluZztcbiAgc3VnZ2VzdGlvbnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3NpcyB7XG4gIG9rOiB0cnVlO1xuICBzdW1tYXJ5OiBzdHJpbmc7XG4gIGdvYWxzOiBHb2FsRGlhZ25vc2lzW107XG4gIG5leHRBY3Rpb25zOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSYXdEaWFnbm9zaXMge1xuICBvazogZmFsc2U7XG4gIHJhd1RleHQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgRGlhZ25vc2lzUmVzdWx0ID0gRGlhZ25vc2lzIHwgUmF3RGlhZ25vc2lzO1xuXG5jb25zdCBWQUxJRF9TVEFUVVM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ29uX3RyYWNrJyxcbiAgJ2JlaGluZCcsXG4gICdzdHVjaycsXG4gICdkb25lJyxcbiAgJ2F0X3Jpc2snLFxuXSk7XG5cbmZ1bmN0aW9uIGFzU3RyaW5nQXJyYXkodjogdW5rbm93bik6IHN0cmluZ1tdIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHYpKSByZXR1cm4gW107XG4gIHJldHVybiB2LmZpbHRlcigoeCkgPT4gdHlwZW9mIHggPT09ICdzdHJpbmcnKSBhcyBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplR29hbChyYXc6IHVua25vd24pOiBHb2FsRGlhZ25vc2lzIHtcbiAgY29uc3QgZyA9IChyYXcgJiYgdHlwZW9mIHJhdyA9PT0gJ29iamVjdCcgPyByYXcgOiB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IHN0YXR1czogRGlhZ25vc2lzU3RhdHVzID0gdHlwZW9mIGcuc3RhdHVzID09PSAnc3RyaW5nJyAmJiBWQUxJRF9TVEFUVVMuaGFzKGcuc3RhdHVzKVxuICAgID8gKGcuc3RhdHVzIGFzIERpYWdub3Npc1N0YXR1cylcbiAgICA6ICdiZWhpbmQnO1xuICBjb25zdCBjb21wbGV0aW9uID0gdHlwZW9mIGcuY29tcGxldGlvbiA9PT0gJ251bWJlcicgPyBnLmNvbXBsZXRpb24gOiB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgdGl0bGU6IHR5cGVvZiBnLnRpdGxlID09PSAnc3RyaW5nJyA/IGcudGl0bGUgOiAnJyxcbiAgICBjb21wbGV0aW9uLFxuICAgIHN0YXR1cyxcbiAgICBib3R0bGVuZWNrOiB0eXBlb2YgZy5ib3R0bGVuZWNrID09PSAnc3RyaW5nJyA/IGcuYm90dGxlbmVjayA6IHVuZGVmaW5lZCxcbiAgICBzdWdnZXN0aW9uczogYXNTdHJpbmdBcnJheShnLnN1Z2dlc3Rpb25zKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTAgQUkgXHU4QkNBXHU2NUFEXHU2NTg3XHU2NzJDXHVGRjFBXHU1NDA4XHU2Q0Q1IEpTT04gXHUyMTkyIFx1N0VEM1x1Njc4NFx1NTMxNiBEaWFnbm9zaXNcdUZGMDhcdTY4MjFcdTlBOEMvXHU4ODY1XHU1MTY4XHU1QjU3XHU2QkI1XHVGRjA5XHVGRjFCXG4gKiBcdTU3NEYgSlNPTiAvIFx1OTc1RVx1NUJGOVx1OEM2MSBcdTIxOTIgXHU1NkRFXHU5MDAwIHsgb2s6ZmFsc2UsIHJhd1RleHQgfVx1RkYwQ1x1N0VERFx1NEUwRFx1NjI5Qlx1OTUxOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEaWFnbm9zaXModGV4dDogc3RyaW5nKTogRGlhZ25vc2lzUmVzdWx0IHtcbiAgY29uc3QgdHJpbW1lZCA9ICh0ZXh0IHx8ICcnKS50cmltKCk7XG4gIGlmICghdHJpbW1lZCkgcmV0dXJuIHsgb2s6IGZhbHNlLCByYXdUZXh0OiB0cmltbWVkIH07XG5cbiAgbGV0IG9iajogdW5rbm93bjtcbiAgdHJ5IHtcbiAgICBvYmogPSBKU09OLnBhcnNlKHRyaW1tZWQpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHJhd1RleHQ6IHRyaW1tZWQgfTtcbiAgfVxuICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHJhd1RleHQ6IHRyaW1tZWQgfTtcbiAgfVxuXG4gIGNvbnN0IG8gPSBvYmogYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IGdvYWxzID0gQXJyYXkuaXNBcnJheShvLmdvYWxzKVxuICAgID8gKG8uZ29hbHMgYXMgdW5rbm93bltdKS5tYXAobm9ybWFsaXplR29hbClcbiAgICA6IFtdO1xuICByZXR1cm4ge1xuICAgIG9rOiB0cnVlLFxuICAgIHN1bW1hcnk6IHR5cGVvZiBvLnN1bW1hcnkgPT09ICdzdHJpbmcnID8gby5zdW1tYXJ5IDogJycsXG4gICAgZ29hbHMsXG4gICAgbmV4dEFjdGlvbnM6IGFzU3RyaW5nQXJyYXkoby5uZXh0QWN0aW9ucyksXG4gIH07XG59XG5cbi8qKlxuICogXHU2Nzg0XHU5MDIwXHU4QkNBXHU2NUFEXHU2M0QwXHU3OTNBXHU4QkNEXHVGRjFBc3lzdGVtIFx1NUYzQVx1NTIzNlx1MzAwQ1x1NTNFQVx1OEY5M1x1NTFGQSBKU09OIC8gc3RhdHVzIFx1NTNENlx1Njc5QVx1NEUzRSAvIHN1Z2dlc3Rpb25zIFx1NEUzQVx1NTNFRlx1NjRDRFx1NEY1Q1x1NjMwN1x1NEVFNFx1MzAwRFx1RkYxQlxuICogdXNlciBcdTZDRThcdTUxNjUgRGV2aWF0aW9uQ2FsY3VsYXRvciBcdTdCOTdcdTU5N0RcdTc2ODRcdTc4NkNcdTYzMDdcdTY4MDdcdTY1ODdcdTY3MkNcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGlhZ25vc2lzTWVzc2FnZXMoc3VtbWFyeTogc3RyaW5nKTogQ2hhdE1lc3NhZ2VbXSB7XG4gIGNvbnN0IHN5c3RlbSA9IFtcbiAgICAnXHU0RjYwXHU2NjJGXHUzMDBDXHU2MjE4XHU3NTY1XHU1OTBEXHU3NkQ4XHUzMDBEXHU2NTU5XHU3RUMzXHUzMDAyXHU3NTI4XHU2MjM3XHU1REYyXHU2NzA5XHU0RTAwXHU2OEY1XHU3NkVFXHU2ODA3XHU2ODExXHVGRjBDXHU1RTc2XHU2M0QwXHU0RjlCXHU0RTg2XHU1NDA0XHU3NkVFXHU2ODA3XHU3Njg0XHU2MjY3XHU4ODRDXHU1MDRGXHU1REVFXHU3ODZDXHU2MzA3XHU2ODA3XHUzMDAyJyxcbiAgICAnXHU4QkY3XHU1N0ZBXHU0RThFXHU4RkQ5XHU0RTlCXHU3ODZDXHU2MzA3XHU2ODA3XHU1MDVBXHU1NkUwXHU2NzlDXHU1RjUyXHU1NkUwXHVGRjA4XHU0RTNBXHU0RUMwXHU0RTQ4XHU4NDNEXHU1NDBFL1x1NTA1Q1x1NkVERVx1RkYwOVx1RkYwQ1x1NUU3Nlx1N0VEOVx1NTFGQVx1NTNFRlx1NjRDRFx1NEY1Q1x1NUVGQVx1OEJBRVx1MzAwMicsXG4gICAgJ1x1NEUyNVx1NjgzQ1x1ODk4MVx1NkM0Mlx1RkYxQScsXG4gICAgJy0gXHU1M0VBXHU4RjkzXHU1MUZBXHU0RTAwXHU0RTJBIEpTT04gXHU1QkY5XHU4QzYxXHVGRjBDXHU0RTBEXHU4OTgxIG1hcmtkb3duIFx1NTZGNFx1NjgwRlx1MzAwMVx1NEUwRFx1ODk4MVx1NEVGQlx1NEY1NVx1OTg5RFx1NTkxNlx1ODlFM1x1OTFDQVx1NjU4N1x1NUI1N1x1MzAwMicsXG4gICAgJy0gSlNPTiBcdTdFRDNcdTY3ODRcdUZGMUF7IFwic3VtbWFyeVwiOiBzdHJpbmcsIFwiZ29hbHNcIjogWyB7IFwidGl0bGVcIjogc3RyaW5nLCBcImNvbXBsZXRpb25cIjogbnVtYmVyKDAtMTAwKSwgXCJzdGF0dXNcIjogXCJvbl90cmFja1wifFwiYmVoaW5kXCJ8XCJzdHVja1wifFwiZG9uZVwifFwiYXRfcmlza1wiLCBcImJvdHRsZW5lY2tcIjogc3RyaW5nLCBcInN1Z2dlc3Rpb25zXCI6IHN0cmluZ1tdIH0gXSwgXCJuZXh0QWN0aW9uc1wiOiBzdHJpbmdbXSB9JyxcbiAgICAnLSBzdGF0dXMgXHU1RkM1XHU5ODdCXHU1M0Q2XHU4MUVBXHU3RUQ5XHU1QjlBXHU2NzlBXHU0RTNFXHUzMDAyJyxcbiAgICAnLSBzdWdnZXN0aW9ucyBcdTZCQ0ZcdTY3NjFcdTVGQzVcdTk4N0JcdTY2MkZcdTRFMDBcdTUzRTVcdTMwMTBcdTUzRUZcdTc2RjRcdTYzQTVcdTRFQTRcdTdFRDlcdTUzRTZcdTRFMDBcdTRFMkEgQUkgXHU1M0JCXHU2NTM5XHU3NkVFXHU2ODA3XHU2ODExXHUzMDExXHU3Njg0XHU4MUVBXHU3MTM2XHU4QkVEXHU4QTAwXHU2MzA3XHU0RUU0XHVGRjBDXHU0RjhCXHU1OTgyXHUzMDBDXHU1QzA2XHU1QjUwXHU5ODc5XHUzMDBFXHU2QkNGXHU1OTI5XHU4REQxXHU2QjY1XHUzMDBGXHU3Njg0IGRhaWx5TWluIFx1NEVDRSAzMCBcdTk2NERcdTUyMzAgMTVcdTMwMERcdTMwMENcdTRFM0FcdTc2RUVcdTY4MDdcdTMwMEVcdTUwNjVcdTVFQjdcdTUxQ0ZcdTkxQ0RcdTMwMEZcdTY1QjBcdTU4OUVcdTVCNTBcdTk4NzlcdTMwMEVcdTZCQ0ZcdTU0NjhcdTZFMzhcdTZDRjMgMyBcdTZCMjFcdTMwMEZcdTMwMERcdTMwMDJcdTRFMERcdTg5ODFcdTUxOTlcdTdBN0FcdTZDREJcdTVFRkFcdThCQUVcdTMwMDInLFxuICBdLmpvaW4oJ1xcbicpO1xuICBjb25zdCB1c2VyID0gYFx1NTQwNFx1NzZFRVx1NjgwN1x1NjI2N1x1ODg0Q1x1NTA0Rlx1NURFRVx1NTk4Mlx1NEUwQlx1RkYxQVxcbiR7c3VtbWFyeX1cXG5cdThCRjdcdTYzNkVcdTZCNjRcdThCQ0FcdTY1QURcdTVFNzZcdTdFRDlcdTUxRkFcdTUzRUZcdTVFOTRcdTc1MjhcdTVFRkFcdThCQUVcdTMwMDJgO1xuICByZXR1cm4gW1xuICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSB9LFxuICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyIH0sXG4gIF07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhbGxBaShcbiAgbWVzc2FnZXM6IENoYXRNZXNzYWdlW10sXG4gIHNldHRpbmdzOiBQbGFubmVyU2V0dGluZ3MsXG4gIGZldGNoRm46IEFpRmV0Y2hGblxuKTogUHJvbWlzZTxBaVJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGAke3NldHRpbmdzLmFpQmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKX0vY2hhdC9jb21wbGV0aW9uc2A7XG4gIHJldHVybiBmZXRjaEZuKHtcbiAgICB1cmwsXG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtzZXR0aW5ncy5haUFwaUtleX1gLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbW9kZWw6IHNldHRpbmdzLmFpTW9kZWwsXG4gICAgICBtZXNzYWdlcyxcbiAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH0sXG4gICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgIH0pLFxuICB9KTtcbn1cblxuLyoqXG4gKiBcdTdGMTZcdTYzOTJcdUZGMUFcdTdCOTdcdTc4NkNcdTYzMDdcdTY4MDcgXHUyMTkyIFx1Njc4NFx1OTAyMFx1NjNEMFx1NzkzQVx1OEJDRCBcdTIxOTIgXHU4QzAzIEFJXHVGRjA4XHU1OTBEXHU3NTI4IGV4dHJhY3RDaGF0VGV4dCArIHJlcXVlc3RVcmwgXHU3RUQ1IENPUlNcdUZGMDlcdTIxOTIgXHU4OUUzXHU2NzkwXHVGRjA4XHU1NzRGIEpTT04gXHU1NkRFXHU5MDAwXHVGRjA5XHUzMDAyXG4gKiBBSSBcdThDMDNcdTc1MjhcdTU5MzFcdThEMjUgXHUyMTkyIFx1NTZERVx1OTAwMCB7IG9rOmZhbHNlLCByYXdUZXh0IH1cdUZGMENcdTdFRERcdTRFMERcdTYyOUJcdTk1MTlcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpYWdub3NlKFxuICBnb2FsczogR29hbEl0ZW1bXSxcbiAgZGF5czogRGF5RGF0YVtdLFxuICBzZXR0aW5nczogUGxhbm5lclNldHRpbmdzLFxuICBmZXRjaEZuOiBBaUZldGNoRm4gPSByZXF1ZXN0VXJsIGFzIHVua25vd24gYXMgQWlGZXRjaEZuXG4pOiBQcm9taXNlPERpYWdub3Npc1Jlc3VsdD4ge1xuICBjb25zdCBjYWNoZSA9IGJ1aWxkQ2FjaGUoZ29hbHMsIGRheXMpO1xuICBjb25zdCBzdW1tYXJ5ID0gc3VtbWFyaXplKGdvYWxzLCBjYWNoZSk7XG4gIGNvbnN0IG1lc3NhZ2VzID0gYnVpbGREaWFnbm9zaXNNZXNzYWdlcyhzdW1tYXJ5KTtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgY2FsbEFpKG1lc3NhZ2VzLCBzZXR0aW5ncywgZmV0Y2hGbik7XG4gICAgY29uc3QgdGV4dCA9IGV4dHJhY3RDaGF0VGV4dChyZXNwKTtcbiAgICByZXR1cm4gcGFyc2VEaWFnbm9zaXModGV4dCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIHJhd1RleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6ICdBSSBcdThCQ0FcdTY1QURcdThDMDNcdTc1MjhcdTU5MzFcdThEMjUnIH07XG4gIH1cbn1cblxuIiwgIi8qKlxuICogRGV2aWF0aW9uQ2FsY3VsYXRvciBcdTIwMTQgXHU3NkVFXHU2ODA3XHU2MjY3XHU4ODRDXHU1MDRGXHU1REVFXHU4QkExXHU3Qjk3XHVGRjA4XHU2M0QyXHU0RUY2XHU0RkE3XHU3RUFGXHU1MUZEXHU2NTcwXHVGRjA5XG4gKlxuICogXHU5NTVDXHU1MENGIHdlYmFwcCBgR29hbEhlYWx0aFNjb3JlLl9idWlsZERhdGFDYWNoZWAgXHU3Njg0XHU3NzFGXHU1QjlFXHU2NTcwXHU2MzZFXHU0RkUxXHU1M0Y3XHVGRjFBXG4gKiAgLSBEYXlEYXRhLmdvYWxUYXNrQ29tcGxldGlvbnNbZ29hbElkXSA9IHsgXHU1QjUwXHU5ODc5a2V5OiBcdTY2MkZcdTU0MjZcdTVCOENcdTYyMTAgfSAgXHUyMTkyIFx1NkQzQlx1OERDMy9cdTVCOENcdTYyMTBcdTY1NzBcbiAqICAtIERheURhdGEuZ29hbFByb2dyZXNzW2dvYWxJZF0gPSBudW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTkyIFx1NUY1M1x1NjVFNVx1OEZEQlx1NUVBNlxuICogXHU2M0QyXHU0RUY2XHU0RkE3IGdldERheSgpIFx1N0VDRiBEYXlEYXRhIFx1NzY4NFx1N0QyMlx1NUYxNVx1N0I3RVx1NTQwRCBba2V5OnN0cmluZ106IHVua25vd24gXHU0RTVGXHU4MEZEXHU4QkZCXHU1MjMwXHU4RkQ5XHU0RTI0XHU0RTJBXHU1QjU3XHU2QkI1XHUzMDAyXG4gKlxuICogXHU4MDRDXHU4RDIzXHU4RkI5XHU3NTRDXHVGRjA4XHU0RTBFXHU0RUE3XHU1NEMxXHU1NEYyXHU1QjY2XHU0RTAwXHU4MUY0XHVGRjA5XHVGRjFBXG4gKiAgLSBcdTY3MkNcdTZBMjFcdTU3NTdcdTUzRUFcdTdCOTdcdTMwMENcdTc4NkNcdTYzMDdcdTY4MDdcdTMwMERcdUZGMDhcdTUwNEZcdTVERUVcdTczODcgLyBcdTUwNUNcdTZFREUgLyBcdThEOEJcdTUyQkZcdUZGMDlcdUZGMENcdTRFMERcdTUwNUFcdTU2RTBcdTY3OUNcdTVGNTJcdTU2RTBcdUZGMUJcbiAqICAtIFx1NUY1Mlx1NTZFMFx1NEUwRVx1NTNFRlx1NjRDRFx1NEY1Q1x1NUVGQVx1OEJBRVx1NEVBNFx1N0VEOSBHb2FsRGlhZ25vc2VyXHVGRjA4QUlcdUZGMDlcdUZGMENcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTkwMjBcdThGNkVcdTVCNTBcdTMwMDJcbiAqXG4gKiBcdTk2RjYgT2JzaWRpYW4gXHU0RjlEXHU4RDU2XHVGRjBDXHU3RUFGXHU1MUZEXHU2NTcwXHU1M0VGXHU1MzU1XHU2RDRCXHUzMDAyXG4gKi9cbmltcG9ydCB0eXBlIHsgRGF5RGF0YSwgR29hbEl0ZW0gfSBmcm9tICcuLi90eXBlcy9kYXRhJztcblxuZXhwb3J0IHR5cGUgRGV2aWF0aW9uU3RhdHVzID0gJ29uX3RyYWNrJyB8ICdiZWhpbmQnIHwgJ3N0dWNrJyB8ICdkb25lJyB8ICdhdF9yaXNrJztcblxuZXhwb3J0IGludGVyZmFjZSBEYXlDYWNoZUVudHJ5IHtcbiAgYWN0aXZlOiBib29sZWFuO1xuICBjb21wbGV0aW9uczogbnVtYmVyO1xuICBwcm9ncmVzcz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZXZpYXRpb25DYWNoZSB7XG4gIGJ5RGF0ZUtleTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgRGF5Q2FjaGVFbnRyeT4+O1xuICBnb2FsSWRzOiBzdHJpbmdbXTtcbiAgLyoqIFx1NEYyMFx1NTE2NVx1NzY4NFx1NjVFNVx1NjU3MFx1NjM2RVx1Njc2MVx1NjU3MFx1RkYwOFx1NTQyQlx1NEUwRFx1NTQyQlx1NjcyQ1x1NzZFRVx1NjgwN1x1OEJCMFx1NUY1NVx1NzY4NFx1NjVFNVx1NjcxRlx1RkYwOVx1RkYwQ1x1NzUyOFx1NEU4RVx1NTA1Q1x1NkVERVx1NTIyNFx1NUI5QSAqL1xuICB0b3RhbERheXM6IG51bWJlcjtcbn1cblxuLyoqIFx1NTE3Q1x1NUJCOSB3ZWJhcHAgXHU3Njg0IERheURhdGEgXHU2NzJBXHU1MjE3XHU1MUZBXHU3Njg0XHU1QjU3XHU2QkI1XHVGRjA4XHU5MDFBXHU4RkM3XHU3RDIyXHU1RjE1XHU3QjdFXHU1NDBEXHU5MDBGXHU0RjIwXHVGRjA5ICovXG5pbnRlcmZhY2UgUmljaERheURhdGEgZXh0ZW5kcyBEYXlEYXRhIHtcbiAgZ29hbFRhc2tDb21wbGV0aW9ucz86IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHVua25vd24+PjtcbiAgZ29hbFByb2dyZXNzPzogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbn1cblxuLyoqIFx1OTU1Q1x1NTBDRiB3ZWJhcHAgX2J1aWxkRGF0YUNhY2hlXHVGRjFBXHU2MzA5XHU1OTI5XHU4MDVBXHU1NDA4XHU2QkNGXHU0RTJBIGdvYWwgXHU3Njg0XHU2RDNCXHU4REMzL1x1NUI4Q1x1NjIxMC9cdThGREJcdTVFQTYgKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENhY2hlKGdvYWxzOiBHb2FsSXRlbVtdLCBkYXlzOiBEYXlEYXRhW10pOiBEZXZpYXRpb25DYWNoZSB7XG4gIGNvbnN0IGdvYWxJZHMgPSAoZ29hbHMgfHwgW10pLm1hcCgoZykgPT4gZy5pZCk7XG4gIGNvbnN0IGJ5RGF0ZUtleTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgRGF5Q2FjaGVFbnRyeT4+ID0ge307XG5cbiAgZm9yIChjb25zdCByYXcgb2YgZGF5cyB8fCBbXSkge1xuICAgIGNvbnN0IGRheSA9IHJhdyBhcyBSaWNoRGF5RGF0YTtcbiAgICBjb25zdCBjb21wbGV0aW9uc0J5R29hbCA9IGRheS5nb2FsVGFza0NvbXBsZXRpb25zO1xuICAgIGNvbnN0IHByb2dyZXNzTWFwID0gZGF5LmdvYWxQcm9ncmVzcztcbiAgICBpZiAoIWNvbXBsZXRpb25zQnlHb2FsICYmICFwcm9ncmVzc01hcCkgY29udGludWU7XG5cbiAgICBjb25zdCBlbnRyeTogUmVjb3JkPHN0cmluZywgRGF5Q2FjaGVFbnRyeT4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGdpZCBvZiBnb2FsSWRzKSB7XG4gICAgICBsZXQgYWN0aXZlID0gZmFsc2U7XG4gICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgaWYgKGNvbXBsZXRpb25zQnlHb2FsICYmIGNvbXBsZXRpb25zQnlHb2FsW2dpZF0pIHtcbiAgICAgICAgY29uc3QgdmFscyA9IE9iamVjdC52YWx1ZXMoY29tcGxldGlvbnNCeUdvYWxbZ2lkXSk7XG4gICAgICAgIGZvciAoY29uc3QgdiBvZiB2YWxzKSB7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcHJvZyA9IHByb2dyZXNzTWFwID8gcHJvZ3Jlc3NNYXBbZ2lkXSA6IHVuZGVmaW5lZDtcbiAgICAgIGlmIChhY3RpdmUgfHwgcHJvZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVudHJ5W2dpZF0gPSB7IGFjdGl2ZSwgY29tcGxldGlvbnM6IGNvdW50LCBwcm9ncmVzczogcHJvZyB9O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZW50cnkpLmxlbmd0aCA+IDApIHtcbiAgICAgIGJ5RGF0ZUtleVtkYXkuZGF0ZV0gPSBlbnRyeTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBieURhdGVLZXksIGdvYWxJZHMsIHRvdGFsRGF5czogKGRheXMgfHwgW10pLmxlbmd0aCB9O1xufVxuXG4vKiogXHU1NDJCXHU3QUVGXHU3MEI5XHU3Njg0XHU1REU1XHU0RjVDXHU2NUU1XHU4QkExXHU2NTcwXHVGRjA4XHU1NDY4XHU0RTAwflx1NTQ2OFx1NEU5NFx1RkYwOSAqL1xuZnVuY3Rpb24gY291bnRXb3JrZGF5cyhzdGFydDogRGF0ZSwgZW5kOiBEYXRlKTogbnVtYmVyIHtcbiAgbGV0IGNvdW50ID0gMDtcbiAgY29uc3QgY3VyID0gbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgc3RhcnQuZ2V0TW9udGgoKSwgc3RhcnQuZ2V0RGF0ZSgpKTtcbiAgY29uc3QgbGFzdCA9IG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCBlbmQuZ2V0TW9udGgoKSwgZW5kLmdldERhdGUoKSk7XG4gIGlmIChjdXIgPiBsYXN0KSByZXR1cm4gMDtcbiAgd2hpbGUgKGN1ciA8PSBsYXN0KSB7XG4gICAgY29uc3QgZG93ID0gY3VyLmdldERheSgpO1xuICAgIGlmIChkb3cgIT09IDAgJiYgZG93ICE9PSA2KSBjb3VudCsrO1xuICAgIGN1ci5zZXREYXRlKGN1ci5nZXREYXRlKCkgKyAxKTtcbiAgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0ZShzPzogc3RyaW5nKTogRGF0ZSB8IG51bGwge1xuICBpZiAoIXMpIHJldHVybiBudWxsO1xuICBjb25zdCBkID0gbmV3IERhdGUoYCR7c31UMDA6MDA6MDBgKTtcbiAgcmV0dXJuIGlzTmFOKGQuZ2V0VGltZSgpKSA/IG51bGwgOiBkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdvYWxEZXZpYXRpb24ge1xuICBnb2FsSWQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgZXhwZWN0ZWRQcm9ncmVzczogbnVtYmVyOyAvLyAwLTEwMFxuICBhY3R1YWxQcm9ncmVzczogbnVtYmVyOyAvLyAwLTEwMFxuICBkZXZpYXRpb25SYXRlOiBudW1iZXI7IC8vIC0xLi4xXG4gIHN0YXR1czogRGV2aWF0aW9uU3RhdHVzO1xuICBzdGFnbmF0aW9uOiBib29sZWFuO1xuICByZWNlbnRBY3Rpdml0eTogbnVtYmVyOyAvLyBcdThGRDEgNyBcdTU5MjlcdTVCOENcdTYyMTBcdTY1NzBcbn1cblxuY29uc3QgY2xhbXAgPSAobjogbnVtYmVyLCBsbzogbnVtYmVyLCBoaTogbnVtYmVyKSA9PiBNYXRoLm1heChsbywgTWF0aC5taW4oaGksIG4pKTtcblxuLyoqIFx1OEJBMVx1N0I5N1x1NTM1NVx1NzZFRVx1NjgwN1x1NTA0Rlx1NURFRVx1RkYwOHRvZGF5IFx1NTNFRlx1NkNFOFx1NTE2NVx1NEZCRlx1NEU4RVx1NTM1NVx1NkQ0Qlx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVHb2FsRGV2aWF0aW9uKFxuICBnb2FsOiBHb2FsSXRlbSxcbiAgY2FjaGU6IERldmlhdGlvbkNhY2hlLFxuICB0b2RheTogRGF0ZSA9IG5ldyBEYXRlKClcbik6IEdvYWxEZXZpYXRpb24ge1xuICBjb25zdCBzdGFydCA9IHBhcnNlRGF0ZShnb2FsLnN0YXJ0RGF0ZSk7XG4gIGNvbnN0IGVuZCA9IHBhcnNlRGF0ZShnb2FsLmVuZERhdGUpO1xuICBjb25zdCBhY3R1YWxQcm9ncmVzcyA9IGNsYW1wKE51bWJlcihnb2FsLnByb2dyZXNzKSB8fCAwLCAwLCAxMDApO1xuXG4gIGxldCBleHBlY3RlZFByb2dyZXNzOiBudW1iZXI7XG4gIGxldCBoYXNEYXRlcyA9IGZhbHNlO1xuICBpZiAoc3RhcnQgJiYgZW5kICYmIHN0YXJ0IDw9IGVuZCkge1xuICAgIGhhc0RhdGVzID0gdHJ1ZTtcbiAgICBjb25zdCB0b3RhbCA9IGNvdW50V29ya2RheXMoc3RhcnQsIGVuZCk7XG4gICAgY29uc3QgZWxhcHNlZCA9IGNvdW50V29ya2RheXMoc3RhcnQsIHRvZGF5KTtcbiAgICBleHBlY3RlZFByb2dyZXNzID0gdG90YWwgPiAwID8gY2xhbXAoKGVsYXBzZWQgLyB0b3RhbCkgKiAxMDAsIDAsIDEwMCkgOiA1MDtcbiAgfSBlbHNlIHtcbiAgICBleHBlY3RlZFByb2dyZXNzID0gNTA7IC8vIFx1N0YzQVx1NjVFNVx1NjcxRlx1RkYxQVx1NEZERFx1NUI4OFx1NEUyRFx1NjAyN1x1NTdGQVx1NTFDNlxuICB9XG5cbiAgY29uc3QgZGlmZiA9IGFjdHVhbFByb2dyZXNzIC0gZXhwZWN0ZWRQcm9ncmVzcztcbiAgY29uc3QgZGV2aWF0aW9uUmF0ZSA9IGV4cGVjdGVkUHJvZ3Jlc3MgPiAwID8gY2xhbXAoKGFjdHVhbFByb2dyZXNzIC0gZXhwZWN0ZWRQcm9ncmVzcykgLyBleHBlY3RlZFByb2dyZXNzLCAtMSwgMSkgOiAwO1xuXG4gIC8vIFx1NTA1Q1x1NkVERVx1RkYxQVx1N0E5N1x1NTNFM1x1NjcwOVx1NjVFNVx1NjcxRlx1MzAwMVx1NEY0Nlx1OEJFNSBnb2FsIFx1NTE2OFx1N0EwQlx1NjVFMFx1NEVGQlx1NEY1NSBhY3RpdmVcdUZGMDhcdTRFRkJcdTUyQTFcdTVCOENcdTYyMTBcdUZGMDlcdTU5MjlcdUZGMDhkb25lIFx1NEUwRFx1N0I5N1x1NTA1Q1x1NkVERVx1RkYwOVxuICBjb25zdCBoYWREYXlzID0gY2FjaGUudG90YWxEYXlzID4gMDtcbiAgbGV0IGV2ZXJBY3RpdmUgPSBmYWxzZTtcbiAgbGV0IHJlY2VudEFjdGl2aXR5ID0gMDtcbiAgY29uc3QgY3V0b2ZmID0gbmV3IERhdGUodG9kYXkuZ2V0RnVsbFllYXIoKSwgdG9kYXkuZ2V0TW9udGgoKSwgdG9kYXkuZ2V0RGF0ZSgpKTtcbiAgY3V0b2ZmLnNldERhdGUoY3V0b2ZmLmdldERhdGUoKSAtIDcpO1xuICBmb3IgKGNvbnN0IFtkYXRlS2V5LCBlbnRyeV0gb2YgT2JqZWN0LmVudHJpZXMoY2FjaGUuYnlEYXRlS2V5KSkge1xuICAgIGNvbnN0IGUgPSBlbnRyeVtnb2FsLmlkXTtcbiAgICBpZiAoIWUpIGNvbnRpbnVlO1xuICAgIGlmIChlLmFjdGl2ZSkgZXZlckFjdGl2ZSA9IHRydWU7XG4gICAgY29uc3QgZCA9IHBhcnNlRGF0ZShkYXRlS2V5KTtcbiAgICBpZiAoZCAmJiBkID49IGN1dG9mZikgcmVjZW50QWN0aXZpdHkgKz0gZS5jb21wbGV0aW9ucyB8fCAwO1xuICB9XG4gIGNvbnN0IHN0YWduYXRpb24gPSBoYWREYXlzICYmICFldmVyQWN0aXZlICYmIGFjdHVhbFByb2dyZXNzIDwgMTAwO1xuXG4gIC8vIFx1NzJCNlx1NjAwMVx1NTIyNFx1NUI5QVxuICBsZXQgc3RhdHVzOiBEZXZpYXRpb25TdGF0dXM7XG4gIGlmIChhY3R1YWxQcm9ncmVzcyA+PSAxMDApIHtcbiAgICBzdGF0dXMgPSAnZG9uZSc7XG4gIH0gZWxzZSBpZiAoc3RhZ25hdGlvbiAmJiBkaWZmIDwgMCkge1xuICAgIHN0YXR1cyA9ICdzdHVjayc7XG4gIH0gZWxzZSBpZiAoIWhhc0RhdGVzKSB7XG4gICAgLy8gXHU3RjNBXHU2NUU1XHU2NzFGXHVGRjFBXHU1M0VBXHU3RUQ5XHU4RjdCXHU5MUNGXHU1MjI0XHU1QjlBXHVGRjBDXHU0RTBEXHU2ODA3IHN0dWNrL2F0X3Jpc2tcbiAgICBzdGF0dXMgPSBkaWZmIDwgMCA/ICdiZWhpbmQnIDogJ29uX3RyYWNrJztcbiAgfSBlbHNlIGlmIChkaWZmIDw9IC0xNSkge1xuICAgIHN0YXR1cyA9ICdhdF9yaXNrJztcbiAgfSBlbHNlIGlmIChkaWZmIDwgMCkge1xuICAgIHN0YXR1cyA9ICdiZWhpbmQnO1xuICB9IGVsc2Uge1xuICAgIHN0YXR1cyA9ICdvbl90cmFjayc7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdvYWxJZDogZ29hbC5pZCxcbiAgICB0aXRsZTogZ29hbC50aXRsZSxcbiAgICBleHBlY3RlZFByb2dyZXNzOiBNYXRoLnJvdW5kKGV4cGVjdGVkUHJvZ3Jlc3MpLFxuICAgIGFjdHVhbFByb2dyZXNzOiBNYXRoLnJvdW5kKGFjdHVhbFByb2dyZXNzKSxcbiAgICBkZXZpYXRpb25SYXRlLFxuICAgIHN0YXR1cyxcbiAgICBzdGFnbmF0aW9uLFxuICAgIHJlY2VudEFjdGl2aXR5LFxuICB9O1xufVxuXG4vKiogXHU0RUE3XHU1MUZBXHU3RUQ5IEdvYWxEaWFnbm9zZXIgXHU3Njg0XHU3RDI3XHU1MUQxXHU2MzA3XHU2ODA3XHU2NTg3XHU2NzJDXHVGRjA4XHU2QkNGXHU3NkVFXHU2ODA3XHU0RTAwXHU4ODRDXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gc3VtbWFyaXplKGdvYWxzOiBHb2FsSXRlbVtdLCBjYWNoZTogRGV2aWF0aW9uQ2FjaGUsIHRvZGF5OiBEYXRlID0gbmV3IERhdGUoKSk6IHN0cmluZyB7XG4gIGlmICghZ29hbHMgfHwgZ29hbHMubGVuZ3RoID09PSAwKSByZXR1cm4gJ1x1RkYwOFx1NjVFMFx1NzZFRVx1NjgwN1x1RkYwOSc7XG4gIHJldHVybiBnb2Fsc1xuICAgIC5tYXAoKGcpID0+IHtcbiAgICAgIGNvbnN0IGQgPSBjb21wdXRlR29hbERldmlhdGlvbihnLCBjYWNoZSwgdG9kYXkpO1xuICAgICAgY29uc3QgZmxhZyA9IGQuc3RhZ25hdGlvbiA/ICcgW1x1NTA1Q1x1NkVERV0nIDogJyc7XG4gICAgICByZXR1cm4gYC0gJHtnLnRpdGxlfVx1RkY1Q1x1NzJCNlx1NjAwMT0ke2Quc3RhdHVzfSR7ZmxhZ31cdUZGNUNcdTk4ODRcdTY3MUZcdThGREJcdTVFQTY9JHtkLmV4cGVjdGVkUHJvZ3Jlc3N9JSBcdTVCOUVcdTk2NDU9JHtkLmFjdHVhbFByb2dyZXNzfSVcdUZGNUNcdTUwNEZcdTVERUU9JHsoZC5kZXZpYXRpb25SYXRlICogMTAwKS50b0ZpeGVkKDApfSVcdUZGNUNcdThGRDE3XHU1OTI5XHU1QjhDXHU2MjEwPSR7ZC5yZWNlbnRBY3Rpdml0eX1gO1xuICAgIH0pXG4gICAgLmpvaW4oJ1xcbicpO1xufVxuIiwgIi8qKlxuICogcnVuRGlhZ25vc2lzIFx1MjAxNCBcdTMwMENBSSBcdThCQ0FcdTY1QUQgXHUyMTkyIFx1ODg0Q1x1NTJBOFx1OTVFRFx1NzNBRlx1MzAwRFx1NTQ3RFx1NEVFNFx1N0YxNlx1NjM5Mlx1RkYwOFx1N0VBRlx1OTAzQlx1OEY5MVx1RkYwQ1x1NTNFRlx1NTM1NVx1NkQ0Qlx1RkYwOVxuICpcbiAqIFx1NTNFQVx1OEQxRlx1OEQyM1x1NkQ0MVx1N0EwQlx1NTFCM1x1N0I1Nlx1RkYwQ1x1NEUwRFx1NjMwMVx1NjcwOVx1NEVGQlx1NEY1NSBPYnNpZGlhbiAvIERPTSBcdTRGOURcdThENTZcdUZGMUFcbiAqICAtIGFpRW5hYmxlZCBcdTk1RThcdTc5ODEgXHUyMTkyIFx1NjVFMFx1NzZFRVx1NjgwNyBcdTIxOTIgXHU4QkZCIGdvYWxzICsgXHU4RkQxIE4gXHU1OTI5IGRheXMgXHUyMTkyIGRpYWdub3NlIFx1MjE5MiBcdTYyNTNcdTVGMDBcdTUzRUFcdThCRkJcdTYyQTVcdTU0NEFcdUZGMUJcbiAqICAtIFx1NjJBNVx1NTQ0QVx1OTFDQ1x1NzBCOVx1MzAwQ1x1NUU5NFx1NzUyOFx1MzAwRFx1MjE5MiBcdTYyNTNcdTVGMDAgQWdlbnRpY1BsYW5Nb2RhbFx1RkYwOFx1OEY3RFx1NTE2NVx1NzcxRlx1NUI5RVx1NjgxMSArIFx1OTg4NFx1NTg2Qlx1NUVGQVx1OEJBRVx1NjMwN1x1NEVFNFx1RkYwOVx1RkYxQlxuICogIC0gQWdlbnRpYyBcdTc4NkVcdThCQTQgXHUyMTkyIHdyaXRlR29hbHMgXHU4NDNEXHU1RTkzXHUzMDAyXG4gKiBcdTYyNDBcdTY3MDlcdTUyNkZcdTRGNUNcdTc1MjhcdUZGMDhcdThCRkJcdTVCNThcdTUwQTggLyBcdTYyNTNcdTVGMDAgTW9kYWwgLyBOb3RpY2UgLyBcdTg0M0RcdTVFOTNcdUZGMDlcdTU3NDdcdTkwMUFcdThGQzcgZGVwcyBcdTZDRThcdTUxNjVcdUZGMENcdTRGQkZcdTRFOEVcdTUzNTVcdTZENEJcdTMwMDJcbiAqL1xuaW1wb3J0IHR5cGUgeyBQbGFubmVyU2V0dGluZ3MgfSBmcm9tICcuL01hcmtkb3duUGxhbm5lcic7XG5pbXBvcnQgdHlwZSB7IEdvYWxJdGVtLCBEYXlEYXRhIH0gZnJvbSAnLi4vdHlwZXMvZGF0YSc7XG5pbXBvcnQgeyBkaWFnbm9zZSwgdHlwZSBEaWFnbm9zaXNSZXN1bHQsIHR5cGUgR29hbERpYWdub3NpcyB9IGZyb20gJy4vR29hbERpYWdub3Nlcic7XG5pbXBvcnQgdHlwZSB7IEFnZW50aWNQbGFuT3B0aW9ucyB9IGZyb20gJy4vQWdlbnRpY1BsYW5Nb2RhbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc2lzU3RvcmFnZSB7XG4gIGdldEdvYWxzKCk6IFByb21pc2U8R29hbEl0ZW1bXT47XG4gIGdldERheUtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT47XG4gIGdldERheShrZXk6IHN0cmluZyk6IFByb21pc2U8RGF5RGF0YSB8IG51bGw+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3Npc0RlcHMge1xuICBhaUVuYWJsZWQ6IGJvb2xlYW47XG4gIHBsYW5uZXJTZXR0aW5nczogUGxhbm5lclNldHRpbmdzO1xuICBzdG9yYWdlOiBEaWFnbm9zaXNTdG9yYWdlO1xuICBkaWFnbm9zZTogdHlwZW9mIGRpYWdub3NlO1xuICBvcGVuRGlhZ25vc2lzOiAob3B0czogeyBkaWFnbm9zaXM6IERpYWdub3Npc1Jlc3VsdDsgb25BcHBseTogKGdvYWw6IEdvYWxEaWFnbm9zaXMpID0+IHZvaWQgfSkgPT4gdm9pZDtcbiAgb3BlbkFnZW50aWM6IChvcHRzOiBBZ2VudGljUGxhbk9wdGlvbnMpID0+IHZvaWQ7XG4gIHdyaXRlR29hbHM6IChnb2FsczogR29hbEl0ZW1bXSkgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG4gIG5vdGljZTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xuICByZWNlbnREYXlzPzogbnVtYmVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRGlhZ25vc2lzKGRlcHM6IERpYWdub3Npc0RlcHMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCFkZXBzLmFpRW5hYmxlZCkge1xuICAgIGRlcHMubm90aWNlKCdBSSBcdThCQ0FcdTY1QURcdTY3MkFcdTU0MkZcdTc1MjhcdUZGMUFcdThCRjdcdTUxNDhcdTU3MjhcdTYzRDJcdTRFRjZcdThCQkVcdTdGNkVcdTRFMkRcdTVGMDBcdTU0MkZcdTVFNzZcdTU4NkJcdTUxOTkgQVBJIEtleScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGdvYWxzID0gYXdhaXQgZGVwcy5zdG9yYWdlLmdldEdvYWxzKCk7XG4gIGlmIChnb2Fscy5sZW5ndGggPT09IDApIHtcbiAgICBkZXBzLm5vdGljZSgnXHU0RjYwXHU4RkQ4XHU2Q0ExXHU2NzA5XHU3NkVFXHU2ODA3XHVGRjBDXHU1MTQ4XHU4REQxXHU0RTAwXHU2QjIxIEFJIFx1ODlDNFx1NTIxMicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGtleXMgPSAoYXdhaXQgZGVwcy5zdG9yYWdlLmdldERheUtleXMoKSkuc2xpY2UoMCwgZGVwcy5yZWNlbnREYXlzID8/IDE0KTtcbiAgY29uc3QgZGF5czogRGF5RGF0YVtdID0gW107XG4gIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgY29uc3QgZCA9IGF3YWl0IGRlcHMuc3RvcmFnZS5nZXREYXkoayk7XG4gICAgaWYgKGQpIGRheXMucHVzaChkKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRlcHMuZGlhZ25vc2UoZ29hbHMsIGRheXMsIGRlcHMucGxhbm5lclNldHRpbmdzKTtcblxuICBkZXBzLm9wZW5EaWFnbm9zaXMoe1xuICAgIGRpYWdub3NpczogcmVzdWx0LFxuICAgIG9uQXBwbHk6IChnb2FsKSA9PiB7XG4gICAgICBkZXBzLm9wZW5BZ2VudGljKHtcbiAgICAgICAgY29udGVudDogJycsXG4gICAgICAgIHNjb3BlOiAnbm90ZScsXG4gICAgICAgIHNldHRpbmdzOiBkZXBzLnBsYW5uZXJTZXR0aW5ncyxcbiAgICAgICAgZ29hbHMsXG4gICAgICAgIGluaXRpYWxJbnN0cnVjdGlvbjogZ29hbC5zdWdnZXN0aW9ucy5qb2luKCdcdUZGMUInKSxcbiAgICAgICAgb25Db25maXJtOiAoZmluYWxHb2FscykgPT4gdm9pZCBkZXBzLndyaXRlR29hbHMoZmluYWxHb2FscyksXG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG9CQUFtRTs7O0FDQW5FLElBQUFDLG1CQUFrRDs7O0FDQWxELHNCQUE0RDs7O0FDOEI1RCxJQUFJLEtBQUs7QUFBVCxJQUFxQixNQUFNO0FBQTNCLElBQXdDLE1BQU07QUFFOUMsSUFBSSxPQUFPLElBQUksR0FBRztBQUFBLEVBQUM7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUE7QUFBQSxFQUFnQjtBQUFBLEVBQUc7QUFBQTtBQUFBLEVBQW9CO0FBQUMsQ0FBQztBQUVoSixJQUFJLE9BQU8sSUFBSSxHQUFHO0FBQUEsRUFBQztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFJO0FBQUEsRUFBSTtBQUFBLEVBQUk7QUFBQSxFQUFJO0FB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QSxNQUNBLGVBQWUsQ0FBQyxNQUFNLElBQUksZUFBZSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUMzRCxhQUFhLENBQUMsTUFBTSxJQUFJLGlCQUFpQixLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUMzRCxZQUFZLENBQUMsTUFBTSxLQUFLLEtBQUssb0JBQW9CLENBQUM7QUFBQSxNQUNsRCxRQUFRLENBQUMsTUFBTSxJQUFJLHlCQUFPLENBQUM7QUFBQSxNQUMzQixZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDSDtBQUFBO0FBQUEsRUFHQSxNQUFjLG9CQUFvQixPQUFrQztBQUNsRSxVQUFNLFVBQVUsSUFBSSxhQUFhLEtBQUssR0FBRztBQUN6QyxVQUFNLFFBQVEsU0FBUyxLQUFLO0FBQzVCLFNBQUssT0FBTyxtQkFBbUI7QUFDL0IsUUFBSSx5QkFBTyxzQkFBTyxNQUFNLE1BQU0seUVBQWtCO0FBQUEsRUFDbEQ7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEVBQUUsVUFBVSxJQUFJLEtBQUs7QUFFM0IsUUFBSSxPQUE2QjtBQUNqQyxVQUFNLFNBQVMsVUFBVSxnQkFBZ0Isc0JBQXNCO0FBRS9ELFFBQUksT0FBTyxTQUFTLEdBQUc7QUFFckIsYUFBTyxPQUFPLENBQUM7QUFBQSxJQUNqQixPQUFPO0FBRUwsYUFBTyxVQUFVLFFBQVEsS0FBSztBQUM5QixZQUFNLEtBQUssYUFBYTtBQUFBLFFBQ3RCLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBRUEsUUFBSSxNQUFNO0FBQ1IsWUFBTSxVQUFVLFdBQVcsSUFBSTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFNLGVBQThCO0FBQ2xDLFNBQUssV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixNQUFNLEtBQUssU0FBUyxDQUFDO0FBQUEsRUFDM0U7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImwiLCAiX2EiLCAiX2EiLCAiX2EiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJtYXgiLCAiZXJyIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJlcnIiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiJdCn0K
