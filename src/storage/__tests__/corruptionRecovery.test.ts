import { describe, it, expect } from 'vitest';
import { normalizePath } from 'obsidian';
import { createMockApp, TFile } from '../../../test/mocks/obsidian';
import { VaultStorage } from '../VaultStorage';

/**
 * 损坏文件的可恢复性回归测试（数据安全）。
 *
 * 背景：代码库早就为 goals 做了「隔离留档」（quarantineCorruptGoals），
 * 但日数据 / 收支历史 / settings.json / 画中卷文档全是「解析失败 → 当空数据」——
 * 调用方按无数据处理后，**下一次写入会把损坏内容静默覆盖**，原内容永久丢失。
 * 现已把隔离留档泛化并应用到所有读取点。
 */
describe('损坏文件的可恢复性', () => {
  const CORRUPT = '{ "version": 1, "notes": [ 截断的坏 JSON';

  it('日数据损坏：getDay 返回 null，但原内容被隔离留档', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/data');
    await mock.adapter.write('bamboo-review/data/2026-01-01.json', CORRUPT);

    expect(await storage.getDay('2026-01-01')).toBeNull();

    const backup = Object.keys(mock.adapter.snapshot()).find((k) => k.includes('2026-01-01.json.corrupt-'));
    expect(backup).toBeTruthy();
    expect(await mock.adapter.read(backup!)).toBe(CORRUPT);      // 内容一字不改
    expect(await mock.adapter.exists('bamboo-review/data/2026-01-01.json')).toBe(false); // 规范路径腾空
  });

  it('getAllDays 遇到损坏文件同样隔离留档（不会静默跳过）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/data');
    await mock.adapter.write('bamboo-review/data/2026-01-01.json', CORRUPT);
    await mock.adapter.write('bamboo-review/data/2026-01-02.json', JSON.stringify({ date: '2026-01-02', metrics: {}, timeline: [] }));

    const all = await storage.getAllDays();
    expect(Object.keys(all)).toEqual(['2026-01-02']);   // 坏文件不影响好文件
    expect(Object.keys(mock.adapter.snapshot()).some((k) => k.includes('2026-01-01.json.corrupt-'))).toBe(true);
  });

  it('settings.json 损坏：putSetting 先隔离留档再重建，不再把其它键一起抹掉', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.write('bamboo-review/settings.json', 'not json at all');

    await storage.putSetting('themePath', 'x');

    const keys = Object.keys(mock.adapter.snapshot());
    expect(keys.some((k) => k.includes('settings.json.corrupt-'))).toBe(true);
    expect(JSON.parse(await mock.adapter.read('bamboo-review/settings.json'))).toEqual({ themePath: 'x' });
  });

  it('缓存未命中（非 TFile）时 putSetting 保留盘上其它键', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    const full = {
      themeEffect: '荷塘鱼影',
      displayFollowThemePalette: true,
      marketInstalled: { a: { version: '1.0.0' } },
      unknownKey: 'keep-me',
    };
    await mock.adapter.write('bamboo-review/settings.json', JSON.stringify(full));

    // 模拟「磁盘有文件，但 Obsidian 索引里没有对应 TFile」：
    // 同步工具刚替换文件、或冷启动索引未完成时就是这个状态。
    (mock.app.vault as any).getAbstractFileByPath = () => null;

    await storage.putSetting('themeEffect', '枫林晚照');

    // 只改一个键，其余全部保留 —— 此前这里会被覆盖成 {"themeEffect":"枫林晚照"}
    expect(JSON.parse(await mock.adapter.read('bamboo-review/settings.json'))).toEqual({
      ...full,
      themeEffect: '枫林晚照',
    });
  });

  it('settings.json 完好时 putSetting 行为不变（原子合并）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    // 让 mock 模拟 Obsidian 缓存：文件落盘后即视为已缓存（返回 TFile），
    // 否则 putSetting 每次都走 vaultWrite 整体替换分支，测不到原子合并路径。
    (mock.app.vault as any).getAbstractFileByPath = (p: string) => {
      const n = normalizePath(p);
      return Object.prototype.hasOwnProperty.call(mock.adapter.snapshot(), n) ? new TFile(n) : null;
    };
    await storage.putSetting('a', 1);
    await storage.putSetting('b', 2);
    const s = await storage.getAllSettings();
    expect(s).toEqual({ a: 1, b: 2 });
  });

  it('收支历史损坏：归一化为空记录，且原内容留档', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.write('bamboo-review/purchase-history.json', CORRUPT);

    expect(await storage.getPurchaseHistory()).toEqual({ records: [] });
    expect(Object.keys(mock.adapter.snapshot()).some((k) => k.includes('purchase-history.json.corrupt-'))).toBe(true);
  });

  it('画中卷写作档损坏：读取时隔离留档', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.mkdir('bamboo-review/typewriter-writing');
    await mock.adapter.write('bamboo-review/typewriter-writing/g1.json', CORRUPT);

    expect(await storage.getTypewriterWritingDoc('g1')).toBeNull();
    expect(Object.keys(mock.adapter.snapshot()).some((k) => k.includes('g1.json.corrupt-'))).toBe(true);
  });

  it('vaultWrite 的「先删后建」失败时，原内容被恢复（不丢数据）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    // 盘上有文件、但 Obsidian 缓存没有 → 走 remove + create 分支
    await mock.adapter.write('bamboo-review/settings.json', '{"old":true}');

    mock.app.vault.create = async () => { throw new Error('disk full'); };

    await expect(storage.putSetting('k', 'v')).rejects.toThrow(/disk full/);
    // 关键断言：原内容必须还在（旧实现此时文件已被删）
    expect(await mock.adapter.read('bamboo-review/settings.json')).toBe('{"old":true}');
  });

  it('goals 的隔离留档行为不变（回归保护）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    await mock.adapter.write('bamboo-review/goals.json', '坏 JSON');

    expect(await storage.getGoals()).toEqual([]);
    expect(Object.keys(mock.adapter.snapshot()).some((k) => k.includes('goals.json.corrupt-'))).toBe(true);
  });

  // ---- 读失败（IO 错误）与解析损坏是两条不同的路径 ----
  // 解析损坏读得到内容 → 可隔离留档；读失败读不出内容 → 唯一能做的是拒绝写入。
  // 旧实现把「读失败」与「不存在 / 空白」一视同仁当成「可安全写入」（readExistingGoalsText
  // 的注释就是这么写的），于是读盘失败后的任意一次自动保存都会抹掉真实数据。

  it('goals 读失败：putGoals 不覆盖原文件（读不出内容 → 无法留档 → 必须拒绝写入）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    const realRead = mock.adapter.read.bind(mock.adapter);
    await mock.adapter.write('bamboo-review/goals.json', JSON.stringify([{ id: 'g1', title: '真实目标' }]));

    // 模拟：文件存在但读不出来（权限 / 被其它程序占用 / 同步冲突）
    mock.adapter.read = async (p: string) => {
      if (p.includes('goals.json')) throw new Error('EACCES');
      return realRead(p);
    };

    expect(await storage.getGoals()).toEqual([]); // 读失败按空返回，不拖垮上层
    await storage.putGoals([{ id: 'g9', title: '内存里的新目标' }] as any);

    // 关键断言：原文件一字未改 —— 否则 10 条目标会被内存里的这 1 条抹掉，且无任何留档
    expect(JSON.parse(await realRead('bamboo-review/goals.json'))).toEqual([
      { id: 'g1', title: '真实目标' },
    ]);
  });

  it('读失败恢复后自动解除拦截（不会永久锁死保存）', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    const realRead = mock.adapter.read.bind(mock.adapter);
    await mock.adapter.write('bamboo-review/goals.json', JSON.stringify([{ id: 'g1', title: '真实目标' }]));

    mock.adapter.read = async (p: string) => {
      if (p.includes('goals.json')) throw new Error('EACCES');
      return realRead(p);
    };
    await storage.getGoals();
    await storage.putGoals([{ id: 'g9' }] as any);
    expect(JSON.parse(await realRead('bamboo-review/goals.json'))[0].id).toBe('g1'); // 被拦下

    mock.adapter.read = realRead; // 读恢复
    await storage.getGoals(); // 读成功 → 标记解除
    await storage.putGoals([{ id: 'g2', title: '恢复后写入' }] as any);

    expect(JSON.parse(await realRead('bamboo-review/goals.json'))).toEqual([
      { id: 'g2', title: '恢复后写入' },
    ]);
  });

  it('画中卷文档存在但读不出来：readJsonFile 标记后拒绝写入', async () => {
    const mock = createMockApp();
    const storage = new VaultStorage(mock.app as any, 'bamboo-review');
    const realRead = mock.adapter.read.bind(mock.adapter);

    // 先正常建立文件（此时读写都正常）
    await storage.putTypewriterNotesDoc('doc-x', {
      version: 1,
      notes: [],
      links: [],
      canvasOffset: null,
    });
    // 用 snapshot 定位真实路径，避免与 path 生成规则耦合
    const key = Object.keys(mock.adapter.snapshot()).find((k) => k.includes('doc-x'))!;
    const before = await realRead(key);

    // 文件存在，但读不出来（权限 / 被占用 / 同步冲突）
    mock.adapter.read = async (p: string) => {
      if (p.includes('doc-x')) throw new Error('EACCES');
      return realRead(p);
    };

    expect(await storage.getTypewriterNotesDoc('doc-x')).toBeNull(); // 读失败按无数据返回
    await storage.putTypewriterNotesDoc('doc-x', {
      version: 1,
      notes: [{ id: 'new' }],
      links: [],
      canvasOffset: null,
    });

    // 原内容一字未改：读不出内容就无法留档，此时写入即不可逆覆盖
    expect(await realRead(key)).toBe(before);
  });
});
