import { describe, it, expect } from 'vitest';
import { DiagnosisProgressModal } from '../DiagnosisProgressModal';

/** 轻量 DOM 桩（与 diagnosisModal.test 同构），覆盖 Modal.contentEl */
class FakeEl {
  children: FakeEl[] = [];
  text = '';
  cls = '';
  tag = 'div';
  dataset: Record<string, string> = {};
  empty(): void {
    this.children = [];
    this.text = '';
  }
  createEl(tag: string, opts: { text?: string; cls?: string } = {}): FakeEl {
    const el = new FakeEl();
    el.tag = tag;
    if (opts.text) el.text = opts.text;
    if (opts.cls) el.cls = opts.cls;
    this.children.push(el);
    return el;
  }
  createDiv(opts: { text?: string; cls?: string } = {}): FakeEl {
    return this.createEl('div', opts);
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

function openModal(): { modal: DiagnosisProgressModal; root: FakeEl } {
  const modal = new DiagnosisProgressModal(fakeApp);
  const root = new FakeEl();
  (modal as any).contentEl = root;
  modal.onOpen();
  return { modal, root };
}

function stepEls(root: FakeEl): FakeEl[] {
  return root
    .find((e) => e.cls.includes('bamboo-progress-steps'))!
    .children.filter((c) => c.cls.includes('bamboo-progress-step'));
}

function phaseOf(el: FakeEl): string {
  return el.dataset['phase'];
}

describe('DiagnosisProgressModal', () => {
  it('onOpen → 渲染 4 个步骤且初始全 pending', () => {
    const { root } = openModal();
    const steps = stepEls(root);
    expect(steps).toHaveLength(4);
    expect(steps.map(phaseOf)).toEqual(['collect', 'analyze', 'ai', 'render']);
    steps.forEach((s) => expect(s.cls).toContain('is-pending'));
  });

  it('setPhase(collect) → collect 为 current，其余 pending', () => {
    const { modal, root } = openModal();
    modal.setPhase('collect');
    const steps = stepEls(root);
    const byPhase = Object.fromEntries(steps.map((s) => [phaseOf(s), s.cls]));
    expect(byPhase['collect']).toContain('is-current');
    expect(byPhase['analyze']).toContain('is-pending');
    expect(byPhase['ai']).toContain('is-pending');
    expect(byPhase['render']).toContain('is-pending');
  });

  it('setPhase(ai) → collect/analyze 已完成，ai 进行中，render 待处理', () => {
    const { modal, root } = openModal();
    modal.setPhase('collect');
    modal.setPhase('analyze');
    modal.setPhase('ai');
    const byPhase = Object.fromEntries(stepEls(root).map((s) => [phaseOf(s), s.cls]));
    expect(byPhase['collect']).toContain('is-done');
    expect(byPhase['analyze']).toContain('is-done');
    expect(byPhase['ai']).toContain('is-current');
    expect(byPhase['render']).toContain('is-pending');
  });

  it('setPhase(render) → 前三个 done，render current', () => {
    const { modal, root } = openModal();
    modal.setPhase('render');
    const byPhase = Object.fromEntries(stepEls(root).map((s) => [phaseOf(s), s.cls]));
    expect(byPhase['collect']).toContain('is-done');
    expect(byPhase['analyze']).toContain('is-done');
    expect(byPhase['ai']).toContain('is-done');
    expect(byPhase['render']).toContain('is-current');
  });

  it('setPhase 传入自定义 label → 该步骤 label 采用自定义文案', () => {
    const { modal, root } = openModal();
    modal.setPhase('ai', 'AI 思考中…');
    const aiStep = stepEls(root).find((s) => phaseOf(s) === 'ai')!;
    const label = aiStep.find((e) => e.cls.includes('bamboo-progress-label'))!;
    expect(label.text).toBe('AI 思考中…');
  });
});
