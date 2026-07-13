/**
 * WebappController — 宿主 → webapp 的类型化直连接口（Phase3）
 *
 * 替代 main.ts 中散落的字符串指令 `sendToWebapp('nav:prevDay')`。
 * 宿主侧改用 `navPrevDay()` 等语义化方法调用，内部仍经
 * `DailyReviewView.sendCommand` 走既有 postMessage 线协议（`nav:*`/`action:*`）——
 * 即「直接 API 门面 + 既有桥兼容层」，webapp 侧无需改动，可分步切换。
 *
 * 该边界保持不动：webapp 仍通过 `message` 监听 `{type,id}` 并响应，
 * 因此本重构零回归风险、且可在宿主侧单测锁定指令映射。
 */

/** 受支持的指令类型（与 webapp 侧 message 监听白名单保持一致） */
export type CommandType =
  | 'nav:prevDay'
  | 'nav:nextDay'
  | 'nav:today'
  | 'action:openStats'
  | 'action:openSettings';

/** 指令下发目标（DailyReviewView 满足此契约） */
export interface CommandTarget {
  sendCommand(type: string): void;
}

export class WebappController {
  constructor(private readonly getTarget: () => CommandTarget | null) {}

  private send(type: CommandType): void {
    this.getTarget()?.sendCommand(type);
  }

  /** 前一天 */
  navPrevDay(): void {
    this.send('nav:prevDay');
  }

  /** 后一天 */
  navNextDay(): void {
    this.send('nav:nextDay');
  }

  /** 回到今天 */
  navToday(): void {
    this.send('nav:today');
  }

  /** 打开统计分析 */
  openStats(): void {
    this.send('action:openStats');
  }

  /** 打开应用设置 */
  openSettings(): void {
    this.send('action:openSettings');
  }
}
