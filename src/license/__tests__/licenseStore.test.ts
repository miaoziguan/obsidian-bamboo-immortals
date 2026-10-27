import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LicenseStore } from '../licenseStore';
import { verifyLicenseKey, isVerifyBlockedByDebugger } from '../licenseKey';

// 只替换两个「重」依赖：真实验签需要 Web Crypto + 密钥还原，且受防调试影响；
// isLicenseKeyShape / getLicenseTag 保留真实实现，才能验证同步路径的行为。
vi.mock('../licenseKey', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../licenseKey')>();
  return {
    ...actual,
    verifyLicenseKey: vi.fn(),
    isVerifyBlockedByDebugger: vi.fn(() => false),
  };
});

// 黑名单置空，避免测试 tag 与真实吊销名单耦合
vi.mock('../secretShards', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../secretShards')>();
  return { ...actual, REVOKED_TAGS: [] };
});

type StorePlugin = ConstructorParameters<typeof LicenseStore>[0];

/** BRI + 4 位 tag + 20 位签名，载荷恰好 24 位十六进制 */
const VALID_KEY = 'BRI-AB12-0123456789ABCDEF0123';

const mockVerify = vi.mocked(verifyLicenseKey);
const mockDebug = vi.mocked(isVerifyBlockedByDebugger);

function makeStore(settings: Record<string, unknown>) {
  const saveSettings = vi.fn(async () => {});
  const plugin = { settings, saveSettings } as unknown as StorePlugin;
  return { store: new LicenseStore(plugin), settings, saveSettings };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDebug.mockReturnValue(false);
});

describe('LicenseStore.isActive —— 激活态必须与 key 绑定', () => {
  it('未激活时返回 false', () => {
    const { store } = makeStore({ licenseActive: false, licenseKey: VALID_KEY });
    expect(store.isActive()).toBe(false);
  });

  it('只翻转布尔、不提供 key 时判为未激活（磁盘可改的核心加固）', () => {
    const { store } = makeStore({ licenseActive: true, licenseKey: '' });
    expect(store.isActive()).toBe(false);
  });

  it('布尔为真但 key 形状非法时判为未激活', () => {
    const { store } = makeStore({ licenseActive: true, licenseKey: 'garbage-key' });
    expect(store.isActive()).toBe(false);
  });

  it('布尔为真且 key 形状合法时返回 true', () => {
    const { store } = makeStore({ licenseActive: true, licenseKey: VALID_KEY });
    expect(store.isActive()).toBe(true);
  });
});

describe('LicenseStore.revalidate —— 异步重新验签', () => {
  it('未激活时直接返回，不验签也不写盘', async () => {
    const { store, saveSettings } = makeStore({ licenseActive: false, licenseKey: '' });
    await expect(store.revalidate()).resolves.toBe(false);
    expect(mockVerify).not.toHaveBeenCalled();
    expect(saveSettings).not.toHaveBeenCalled();
  });

  it('调试态跳过复验，不清除激活态（避免误伤开控制台的正版用户）', async () => {
    mockDebug.mockReturnValue(true);
    const { store, settings, saveSettings } = makeStore({
      licenseActive: true,
      licenseKey: VALID_KEY,
    });
    await expect(store.revalidate()).resolves.toBe(true);
    expect(mockVerify).not.toHaveBeenCalled();
    expect(settings.licenseActive).toBe(true);
    expect(saveSettings).not.toHaveBeenCalled();
  });

  it('形状非法时清除激活态并落盘', async () => {
    const { store, settings, saveSettings } = makeStore({
      licenseActive: true,
      licenseKey: 'not-a-key',
    });
    await expect(store.revalidate()).resolves.toBe(false);
    expect(settings.licenseActive).toBe(false);
    expect(settings.licenseKey).toBe('');
    expect(saveSettings).toHaveBeenCalled();
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it('形状合法但验签失败时清除激活态', async () => {
    mockVerify.mockResolvedValue(false);
    const { store, settings, saveSettings } = makeStore({
      licenseActive: true,
      licenseKey: VALID_KEY,
    });
    await expect(store.revalidate()).resolves.toBe(false);
    expect(settings.licenseActive).toBe(false);
    expect(saveSettings).toHaveBeenCalled();
  });

  it('验签通过时保持激活，并按 key 回写归属 TAG', async () => {
    mockVerify.mockResolvedValue(true);
    const { store, settings, saveSettings } = makeStore({
      licenseActive: true,
      licenseKey: VALID_KEY,
      licenseTag: 'FFFF',
    });
    await expect(store.revalidate()).resolves.toBe(true);
    expect(settings.licenseActive).toBe(true);
    expect(settings.licenseTag).toBe('AB12');
    expect(saveSettings).toHaveBeenCalled();
  });
});
