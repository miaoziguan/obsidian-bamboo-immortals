/**
 * WebApp Facade — 显式命名空间 + 重名守卫
 *
 * 阶段1（收口）核心模块：
 * - 把散落在 window 上的 70+ 全局收敛为单一可审计的 window.WebApp 门面；
 * - register() 在重名时触发告警（console.error），暴露「静默覆盖」风险；
 * - buildFacadeFromWindow() 从既有 window 全局复制核心成员，零行为变更（加性）。
 *
 * 注意：本模块为「加性」重构——不改变任何既有 window.X 挂载点，
 * 仅在其之上提供一层显式门面与重名守卫。沙箱边界（themeAudit）不受影响。
 */

/**
 * 创建一个门面容器。
 * @returns {{
 *   register: (name: string, value: any) => void,
 *   get: (name: string) => any,
 *   toObject: () => Record<string, any>,
 *   duplicates: string[],
 * }}
 */
export function createFacade() {
  const map = Object.create(null);
  const seen = [];
  return {
    register(name, value) {
      if (Object.prototype.hasOwnProperty.call(map, name)) {
        seen.push(name);
        console.error(
          `[WebApp facade] 检测到重名挂载 "${name}"，先前的值已被覆盖。`
        );
      }
      map[name] = value;
    },
    get(name) {
      return map[name];
    },
    toObject() {
      return { ...map };
    },
    get duplicates() {
      return [...seen];
    },
  };
}

/**
 * 从 window（或任意对象）把给定名称的成员复制到门面。
 * 仅复制已存在的成员；缺失的成员被跳过（不报错，便于增量接入）。
 *
 * @param {string[]} names 要收敛到门面的全局名列表
 * @param {object} [win]    来源对象，默认 globalThis
 * @returns {ReturnType<typeof createFacade>}
 */
export function buildFacadeFromWindow(names, win = globalThis) {
  const facade = createFacade();
  for (const name of names) {
    if (win[name] !== undefined) {
      facade.register(name, win[name]);
    }
  }
  return facade;
}

// 供入口内联脚本调用（window.buildFacadeFromWindow）
if (typeof window !== 'undefined') {
  window.createFacade = createFacade;
  window.buildFacadeFromWindow = buildFacadeFromWindow;
}
