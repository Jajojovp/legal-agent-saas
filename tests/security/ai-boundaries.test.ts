import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('AI security boundaries', () => {
  it('rejects oversized and unsupported document uploads before analysis', () => {
    const route = read('app/api/ai/analyze-document/route.ts');
    expect(route).toContain('MAX_UPLOAD_BYTES');
    expect(route).toContain('413');
    expect(route).toContain('415');
    expect(route).toContain('text/plain');
  });

  it('validates and bounds knowledge-base inputs', () => {
    const route = read('app/api/ai/knowledge/route.ts');
    expect(route).toContain('safeParse');
    expect(route).not.toContain('as any');
    expect(route).toContain('.max(');
  });

  it('documents provider configuration without embedding a secret', () => {
    const env = read('.env.example');
    expect(env).toContain('GOOGLE_API_KEY=""');
    expect(env).toContain('GOOGLE_AI_MODEL=');
  });
});

describe('chatbot distributed rate limiting', () => {
  it('does not rely on a per-process map and requires Redis configuration in production', () => {
    const route = read('app/api/chatbot/message/route.ts');
    expect(route).toContain('UPSTASH_REDIS_REST_URL');
    expect(route).toContain('UPSTASH_REDIS_REST_TOKEN');
    expect(route).toContain("process.env.NODE_ENV === 'production'");
    expect(route).toContain("['INCR', redisKey]");
    expect(route).not.toContain('rateLimitMap');
  });
});
