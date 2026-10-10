/**
 * svgIsolate.js — 第三方内联 SVG 的「实例级隔离」工具
 *
 * 背景（腾云 / 驾雾系列「串色丢细节」事故的根因）：
 *   素材市场缩略图与画布贴纸，是把素材作者提供的 SVG 字符串直接 innerHTML 进宿主 DOM 的。
 *   而内联 SVG 在 HTML 里**不具备样式与 id 的隔离性**，会带来两类全局污染：
 *
 *     1) id 冲突：多个实例共享同一个 id，`url(#id)`（渐变 / 裁剪 / 滤镜）互相串用 → 渐变或裁剪丢失；
 *     2) 样式泄漏：SVG 内嵌的 <style> 在 HTML 中是**文档级（或 shadow root 级）全局作用域**。
 *        多个素材同屏时，若各自用同名类（设计工具导出的 SVG 普遍是 .cls-1 / .cls-2 …）而配色不同，
 *        后加载的规则会覆盖先加载的 → 串色、细节丢失。
 *
 * 对策（本模块提供的两层隔离）：
 *   · isolateIds()：给所有 id 及其引用（url(#id) / href="#id" / xlink:href="#id"）加实例唯一前缀；
 *   · scopeCss()  ：给根 <svg> 打上实例唯一作用域类，并把 <style> 里每条规则的选择器
 *                   加上 `.作用域类 ` 前缀，使规则**只能命中本实例内部的元素** ——
 *                   等价于给每个 SVG 造一个轻量 CSS 沙箱：向外零泄漏、向内不被别的实例污染。
 *
 * 两者合起来使任意素材（含未来新增 / 第三方）的 SVG 都天然自包含，
 * 不再依赖「素材作者恰好不重名」这种巧合，把「同类事故」从根上消掉。
 *
 * 纯字符串处理、零运行时依赖：可在 jsdom / Node 下单测，也可安全进入打包产物。
 */
export const SvgIsolate = {
  /**
   * 完整隔离：id 前缀 + 样式作用域。对外推荐入口。
   * @param {string} html   素材提供的 SVG（或被 render() 包裹后的 HTML 片段）
   * @param {string} prefix 实例唯一前缀（如 'mt0-'、贴纸记录 id + '-'）
   * @returns {string} 隔离后的片段
   */
  isolate(html, prefix) {
    if (!html) return html;
    return this.scopeCss(this.isolateIds(html, prefix), prefix);
  },

  /**
   * 给所有 id 及其引用加实例唯一前缀，避免 url(#id) 跨实例串用导致渐变 / 裁剪丢失。
   * @param {string} html
   * @param {string} prefix
   * @returns {string}
   */
  isolateIds(html, prefix) {
    if (!html) return html;
    const ids = [];
    let m;
    const reId = /id="([^"]+)"/g;
    while ((m = reId.exec(html))) ids.push(m[1]);
    let out = html;
    ids.forEach((id) => {
      const ref = '#' + id;
      out = out.split('url(' + ref + ')').join('url(#' + prefix + id + ')');
      out = out.split("url('" + ref + "')").join("url('#" + prefix + id + "')");
      out = out.split('url("' + ref + '")').join('url("#' + prefix + id + '")');
      out = out.split('href="' + ref + '"').join('href="#' + prefix + id + '"');
      out = out.split("href='" + ref + "'").join("href='#" + prefix + id + "'");
      out = out.split('xlink:href="' + ref + '"').join('xlink:href="#' + prefix + id + '"');
    });
    return out.replace(/id="([^"]+)"/g, (mm, id) => 'id="' + prefix + id + '"');
  },

  /**
   * 把 SVG 内嵌 <style> 的规则作用域化，使其只作用于本实例内部元素。
   * 无 <style> 的素材（如位图型 foreignObject 预览）原样返回，零副作用。
   * @param {string} html
   * @param {string} prefix
   * @returns {string}
   */
  scopeCss(html, prefix) {
    if (!html || !/<style[\s>]/i.test(html)) return html;
    const scope = this._scopeClass(prefix);
    // 1) 给每个 <svg> 打上作用域类（作为后续选择器前缀的锚点）
    const out = html.replace(/<svg\b([^>]*)>/gi, (mm, attrs) => {
      if (/\bclass="([^"]*)"/.test(attrs)) {
        return '<svg' + attrs.replace(/\bclass="([^"]*)"/, (m2, c) => 'class="' + c + ' ' + scope + '"') + '>';
      }
      return '<svg' + attrs + ' class="' + scope + '">';
    });
    // 2) 重写所有 <style> 内的选择器
    return out.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (mm, open, css, close) =>
      open + this._scopeRules(css, scope) + close
    );
  },

  /** 由实例前缀派生一个合法且全局唯一的 CSS 作用域类名 */
  _scopeClass(prefix) {
    const safe = String(prefix == null ? '' : prefix)
      .replace(/[^A-Za-z0-9_-]/g, '_')
      .replace(/[-_]+$/, '');
    return 'bm-svgs-' + (safe || 'x');
  },

  /**
   * CSS 选择器前缀化：`.a, .b { }` → `.scope .a, .scope .b { }`
   * 能正确穿过 @media / @supports 嵌套，并跳过 @keyframes（其内部是 from/to/0% 而非选择器）。
   * @param {string} css
   * @param {string} scope
   * @returns {string}
   */
  _scopeRules(css, scope) {
    const out = [];
    const stack = []; // 每一层是否处于 @keyframes 内部
    let buf = '';
    for (let i = 0; i < css.length; i++) {
      const ch = css[i];
      if (ch === '{') {
        const prelude = buf.trim();
        buf = '';
        const inKeyframes = stack.length ? stack[stack.length - 1] : false;
        out.push(!inKeyframes && prelude && prelude.charAt(0) !== '@' ? this._prefixSelectors(prelude, scope) : prelude);
        out.push('{');
        stack.push(/@(?:-\w+-)?keyframes/i.test(prelude));
      } else if (ch === '}') {
        out.push(buf, '}');
        buf = '';
        stack.pop();
      } else {
        buf += ch;
      }
    }
    out.push(buf);
    return out.join('');
  },

  /**
   * 给逗号分隔的选择器列表逐项加作用域前缀；
   * 若选择器指向根 svg 自身（svg / :root，加前缀会变成后代选择器而永远不命中），直接替换为 .scope。
   * @param {string} selectorList
   * @param {string} scope
   * @returns {string}
   */
  _prefixSelectors(selectorList, scope) {
    return selectorList
      .split(',')
      .map((s) => {
        const t = s.trim();
        if (!t) return t;
        if (/^(svg|:root)$/i.test(t)) return '.' + scope;
        return '.' + scope + ' ' + t;
      })
      .join(',');
  },
};
