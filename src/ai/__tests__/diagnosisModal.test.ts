import { describe, it, expect, vi } from 'vitest';
import { DiagnosisModal, type DiagnosisModalOptions } from '../DiagnosisModal';
import type { DiagnosisResult } from '../GoalDiagnoser';

/** 轻量 DOM 桩：覆盖 Modal.contentEl，供 onOpen 渲染并断言 */
class FakeEl {
  children: FakeEl[] = [];
  text = '';
  cls = '';
  private handlers: Record<string, Array<() => void>> = {};
  empty(): void {
    this.children = [];
    this.text = '';
  }
  addClass(c: string): void {
    this.cls = c;
  }
  createEl(_tag: string, opts: { text?: string; cls?: string } = {}): FakeEl {
    const el = new FakeEl();
    if (opts.text) el.text = opts.text;
    if (opts.cls) el.cls = opts.cls;
    this.children.push(el);
    return el;
  }
  createDiv(opts: { text?: string; cls?: string } = {}): FakeEl {
    return this.createEl('div', opts);
  }
  addEventListener(ev: string, fn: () => void): void {
    (this.handlers[ev] ||= []).push(fn);
  }
  click(): void {
    (this.handlers['click'] || []).forEach((h) => h());
  }
  find(pred: (e: FakeEl) => boolean): FakeEl | undefined {
    if (pred(this)) return this;
    for (const c of this.children) {
      const r = c.find(pred);
      if (r) return r;
    }
    return undefined;
  }
}

const fakeApp: any = { workspace: {} };

function openModal(diagnosis: DiagnosisResult) {
  const onApply = vi.fn();
  const opts: DiagnosisModalOptions = { diagnosis, onApply };
  const modal = new DiagnosisModal(fakeApp, opts);
  const root = new FakeEl();
  (modal as any).contentEl = root;
  modal.onOpen();
  return { modal, root, onApply };
}

const validDiag: DiagnosisResult = {
  ok: true,
  summary: '3 目标 1 达标 2 落后',
  goals: [
    {
      title: '健康减重',
      completion: 62,
      status: 'behind',
      bottleneck: '跑步停滞',
      suggestions: ['将跑步 dailyMin 降到 15'],
    },
  ],
  nextActions: ['整体下调 dailyMin'],
};

describe('DiagnosisModal', () => {
  it('渲染摘要 + 状态徽标 + 每条建议「应用」按钮', () => {
    const { root } = openModal(validDiag);
    // 摘要
    expect(root.find((e) => e.cls.includes('bamboo-diag-summary') && e.text.includes('达标'))).toBeDefined();
    // 状态徽标（含 status 类名）
    expect(root.find((e) => e.cls.includes('bamboo-diag-behind'))).toBeDefined();
    // 应用按钮存在
    const btn = root.find((e) => e.text === '应用');
    expect(btn).toBeDefined();
  });

  it('点「应用」→ 调用 onApply(该目标诊断) 并关闭', () => {
    const { root, onApply, modal } = openModal(validDiag);
    const btn = root.find((e) => e.text === '应用')!;
    btn.click();
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(validDiag.goals[0]);
    // close 为 Modal 桩 no-op，不抛错即可
    expect(() => modal.onClose()).not.toThrow();
  });

  it('坏 JSON 回退（rawText）→ 展示纯文本，无「应用」按钮，不崩', () => {
    const raw: DiagnosisResult = { ok: false, rawText: '模型返回了乱码…' };
    const { root } = openModal(raw);
    expect(root.find((e) => e.cls.includes('bamboo-diag-raw') && e.text.includes('乱码'))).toBeDefined();
    expect(root.find((e) => e.text === '应用')).toBeUndefined();
  });
});
