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
 *
 * CommandType 从 protocol.ts 集中定义（阶段3 · 契约化），
 * 此处重导出以保持向后兼容（既有 import { CommandType } from 'WebappController' 不破）。
 */

import type { CommandType } from './protocol';

export type { CommandType } from './protocol';

/** 指令下发目标（DailyReviewView 满足此契约） */
interface CommandTarget {
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

  /**
   * 通知 webapp 目标库已变更（host→webapp）。
   * webapp 收到后调用 GoalService.load() 重读 goals.json 并 store.notify() 局部刷新，
   * 不触发全局 renderAll，避免冲掉时间轴 / 进行中状态。
   */
  notifyGoalsChanged(): void {
    this.getTarget()?.sendCommand('goals:changed');
  }
}
