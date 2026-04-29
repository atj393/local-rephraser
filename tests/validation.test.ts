import { describe, expect, it } from 'vitest';
import { parseDisabledSites, validateAiChatUrl } from '@/shared/validation';

describe('validateAiChatUrl', () => {
  it('accepts an empty URL but warns', () => {
    const res = validateAiChatUrl('');
    expect(res.ok).toBe(true);
    expect(res.warning).toBeTruthy();
  });

  it('accepts https URLs', () => {
    expect(validateAiChatUrl('https://chat.example.com/').ok).toBe(true);
  });

  it('accepts http URLs', () => {
    expect(validateAiChatUrl('http://chat.local/').ok).toBe(true);
  });

  it('rejects garbage', () => {
    expect(validateAiChatUrl('not a url').ok).toBe(false);
  });

  it('rejects non-http(s) protocols', () => {
    expect(validateAiChatUrl('ftp://example.com/').ok).toBe(false);
    expect(validateAiChatUrl('javascript:alert(1)').ok).toBe(false);
  });
});

describe('parseDisabledSites', () => {
  it('splits, trims, and drops empty lines', () => {
    expect(parseDisabledSites('\n  example.com  \n\nfoo.org\n')).toEqual([
      'example.com',
      'foo.org',
    ]);
  });

  it('returns [] for empty input', () => {
    expect(parseDisabledSites('')).toEqual([]);
  });
});
