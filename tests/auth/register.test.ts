import { describe, expect, it } from 'vitest';
import { registerSchema } from '@/lib/auth/registration';

describe('registration contract', () => {
  it('requires a law firm when creating an owner account', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Lawyer',
      email: 'jane@example.com',
      password: 'correct-horse-battery-staple',
    });

    expect(result.success).toBe(false);
  });

  it('normalizes email and firm name before persistence', () => {
    const result = registerSchema.safeParse({
      name: '  Jane Lawyer  ',
      email: '  JANE@EXAMPLE.COM ',
      password: 'correct-horse-battery-staple',
      firmName: '  Example Legal  ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'Jane Lawyer',
        email: 'jane@example.com',
        password: 'correct-horse-battery-staple',
        firmName: 'Example Legal',
      });
    }
  });
});
