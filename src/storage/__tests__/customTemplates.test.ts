import { describe, it, expect, beforeEach } from 'vitest';
import { VaultStorage } from '../VaultStorage';
import { createMockApp } from '../../../test/mocks/obsidian';
import type { CustomTemplate } from '../../types/data';

function makeStorage() {
  const { app, adapter } = createMockApp();
  const storage = new VaultStorage(app as any, 'bamboo-review');
  return { storage, adapter };
}

function makeTemplate(over: Partial<CustomTemplate> = {}): CustomTemplate {
  return {
    id: 'custom_1',
    name: '晨间例行',
    desc: '每天早起',
    iconName: 'Sun',
    createdAt: '2026-07-25T08:00:00.000Z',
    data: {
      icon: '',
      title: '晨间例行',
      meta: '',
      category: 'health',
      progress: 0,
      items: [
        { name: '喝水', dailyMin: '500', taskDayType: 'daily' },
        { name: '拉伸', dailyMin: '10', taskDayType: 'daily' },
      ],
    },
    ...over,
  };
}

describe('VaultStorage 自定义目标模板（vault templates/*.md）', () => {
  let ctx: ReturnType<typeof makeStorage>;

  beforeEach(() => {
    ctx = makeStorage();
  });

  it('putCustomTemplate 后 getCustomTemplates 能读回，且 frontmatter 保留嵌套 data', async () => {
    await ctx.storage.putCustomTemplate(makeTemplate());

    const list = await ctx.storage.getCustomTemplates();
    expect(list.length).toBe(1);
    const t = list[0];
    expect(t.id).toBe('custom_1');
    expect(t.name).toBe('晨间例行');
    expect(t.data.category).toBe('health');
    expect(Array.isArray(t.data.items)).toBe(true);
    expect(t.data.items.length).toBe(2);
    expect(t.data.items[1].dailyMin).toBe('10');
  });

  it('文件名以 id 命名，落盘为 .md frontmatter', async () => {
    await ctx.storage.putCustomTemplate(makeTemplate({ id: 'custom_abc' }));
    const raw = await ctx.adapter.read('bamboo-review/templates/custom_abc.md');
    expect(raw.startsWith('---\n')).toBe(true);
    expect(raw).toContain('id: custom_abc');
  });

  it('多个模板按 createdAt 升序返回', async () => {
    await ctx.storage.putCustomTemplate(makeTemplate({ id: 'b', createdAt: '2026-07-02T00:00:00Z' }));
    await ctx.storage.putCustomTemplate(makeTemplate({ id: 'a', createdAt: '2026-07-01T00:00:00Z' }));
    const list = await ctx.storage.getCustomTemplates();
    expect(list.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('deleteCustomTemplate 后读回为空', async () => {
    await ctx.storage.putCustomTemplate(makeTemplate({ id: 'gone' }));
    await ctx.storage.deleteCustomTemplate('gone');
    const list = await ctx.storage.getCustomTemplates();
    expect(list.length).toBe(0);
  });

  it('损坏的模板文件被跳过，不阻断整体读取', async () => {
    await ctx.storage.putCustomTemplate(makeTemplate({ id: 'ok' }));
    // 直接写入一份无 frontmatter 的损坏文件
    await ctx.adapter.write('bamboo-review/templates/broken.md', 'just text, no frontmatter');
    const list = await ctx.storage.getCustomTemplates();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('ok');
  });

  it('目录不存在时 getCustomTemplates 返回空数组（不报错）', async () => {
    const list = await ctx.storage.getCustomTemplates();
    expect(list).toEqual([]);
  });
});
