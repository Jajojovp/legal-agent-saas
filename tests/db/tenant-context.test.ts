import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: { transaction: mocks.transaction },
  assertDbAvailable: vi.fn(),
}));

import { withTenantContext } from '@/lib/db/tenant-context';

describe('withTenantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(async (work) => work({ execute: mocks.execute }));
  });

  it('sets tenant context inside the same transaction before work runs', async () => {
    const work = vi.fn(async () => 'ok');

    await expect(withTenantContext(42, work)).resolves.toBe('ok');

    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.execute).toHaveBeenCalledTimes(2);
    expect(work).toHaveBeenCalledOnce();
    expect(mocks.execute.mock.invocationCallOrder[0]).toBeLessThan(
      work.mock.invocationCallOrder[0],
    );
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects invalid firm id %s before opening a transaction', async (firmId) => {
    await expect(withTenantContext(firmId, async () => null)).rejects.toThrow('InvalidTenantContext');
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
