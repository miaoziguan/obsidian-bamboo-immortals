import { describe, it, expect, vi } from 'vitest';
import { WebappController, type CommandType } from '../WebappController';

/** 指令映射表：方法 → 期望下发的线协议 type */
const MAP: Array<[keyof WebappController, CommandType]> = [
  ['navPrevDay', 'nav:prevDay'],
  ['navNextDay', 'nav:nextDay'],
  ['navToday', 'nav:today'],
  ['openStats', 'action:openStats'],
  ['openSettings', 'action:openSettings'],
];

describe('WebappController 类型化直连接口', () => {
  it.each(MAP)('%s() 下发正确线协议 %s', (method, expectedType) => {
    const sendCommand = vi.fn();
    const target = { sendCommand } as unknown as { sendCommand: typeof sendCommand };
    const ctrl = new WebappController(() => target);

    (ctrl[method] as () => void)();

    expect(sendCommand).toHaveBeenCalledTimes(1);
    expect(sendCommand).toHaveBeenCalledWith(expectedType);
  });

  it('getTarget 返回 null 时不抛错、不下发', () => {
    const sendCommand = vi.fn();
    const ctrl = new WebappController(() => null);

    expect(() => ctrl.navToday()).not.toThrow();
    expect(sendCommand).not.toHaveBeenCalled();
  });
});
