// Vitest setup for webapp JS tests — bridge Jest globals to Vitest equivalents
import { vi } from 'vitest';

// Map Jest global APIs to Vitest
globalThis.jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  mock: vi.mock,
  useFakeTimers: vi.useFakeTimers,
  useRealTimers: vi.useRealTimers,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
};
