import { describe, expect, it } from 'vitest';
import {
  buildRewritePrompt,
  MODE_INSTRUCTIONS,
  MODE_LABELS,
} from '@/shared/promptBuilder';
import type { BuildPromptInput } from '@/shared/types';

const BASE: BuildPromptInput = {
  selectedText: 'hello world',
  mode: 'normal',
  aboutMe: 'I am Alexis.',
  globalPrompt: 'Preserve my meaning.',
  avoidPrompt: 'Avoid robotic language.',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function build(overrides: Partial<BuildPromptInput> = {}): string {
  return buildRewritePrompt({ ...BASE, ...overrides });
}

// ---------------------------------------------------------------------------
// Section presence
// ---------------------------------------------------------------------------

describe('output structure', () => {
  it('starts with the assistant declaration', () => {
    expect(build()).toMatch(/^You are my personal writing assistant\./);
  });

  it('contains all expected section headers', () => {
    const out = build();
    expect(out).toContain('About me:');
    expect(out).toContain('Global writing rules:');
    expect(out).toContain('Avoid:');
    expect(out).toContain('Mode:');
    expect(out).toContain('Task:');
    expect(out).toContain('Output rules:');
    expect(out).toContain('Text:');
  });

  it('wraps selected text in triple-quotes', () => {
    const out = build({ selectedText: 'my draft text' });
    expect(out).toContain('"""\nmy draft text\n"""');
  });

  it('contains all output rules verbatim', () => {
    const out = build();
    expect(out).toContain('Return only the rewritten text.');
    expect(out).toContain('Do not explain your changes.');
    expect(out).toContain('Do not include markdown.');
    expect(out).toContain('Do not include quotes around the final text.');
    expect(out).toContain('Do not add information that is not present in the original text.');
  });
});

// ---------------------------------------------------------------------------
// Personalization fields
// ---------------------------------------------------------------------------

describe('personalization fields', () => {
  it('embeds aboutMe in the output', () => {
    const out = build({ aboutMe: 'I work in logistics.' });
    expect(out).toContain('I work in logistics.');
  });

  it('embeds globalPrompt in the output', () => {
    const out = build({ globalPrompt: 'Keep it short and punchy.' });
    expect(out).toContain('Keep it short and punchy.');
  });

  it('embeds avoidPrompt in the output', () => {
    const out = build({ avoidPrompt: 'Avoid passive voice.' });
    expect(out).toContain('Avoid passive voice.');
  });

  it('embeds the selected text in the output', () => {
    const out = build({ selectedText: 'unique-sentinel-text-xyz' });
    expect(out).toContain('unique-sentinel-text-xyz');
  });
});

// ---------------------------------------------------------------------------
// Mode instructions
// ---------------------------------------------------------------------------

describe('mode instructions', () => {
  it('uses the quick instruction for quick mode', () => {
    expect(build({ mode: 'quick' })).toContain(MODE_INSTRUCTIONS.quick);
  });

  it('uses the normal instruction for normal mode', () => {
    expect(build({ mode: 'normal' })).toContain(MODE_INSTRUCTIONS.normal);
  });

  it('uses the formal instruction for formal mode', () => {
    expect(build({ mode: 'formal' })).toContain(MODE_INSTRUCTIONS.formal);
  });

  it('quick instruction emphasises keeping close to the original', () => {
    expect(MODE_INSTRUCTIONS.quick.toLowerCase()).toContain('close to the original');
  });

  it('formal instruction mentions professional communication', () => {
    expect(MODE_INSTRUCTIONS.formal.toLowerCase()).toContain('professionally');
  });
});

// ---------------------------------------------------------------------------
// Empty / missing optional fields
// ---------------------------------------------------------------------------

describe('empty optional fields', () => {
  it('shows (none) for empty aboutMe', () => {
    expect(build({ aboutMe: '' })).toContain('About me:\n(none)');
  });

  it('shows (none) for empty globalPrompt', () => {
    expect(build({ globalPrompt: '' })).toContain('Global writing rules:\n(none)');
  });

  it('shows (none) for empty avoidPrompt', () => {
    expect(build({ avoidPrompt: '' })).toContain('Avoid:\n(none)');
  });

  it('shows (none) for whitespace-only aboutMe', () => {
    expect(build({ aboutMe: '   \n   ' })).toContain('About me:\n(none)');
  });
});

// ---------------------------------------------------------------------------
// Null / undefined runtime safety
// ---------------------------------------------------------------------------

// Escape hatch that simulates a runtime caller passing the wrong type without
// sprinkling inline disable comments throughout the tests.
function buildUnsafe(overrides: Record<string, unknown>): string {
  return buildRewritePrompt({ ...BASE, ...overrides } as BuildPromptInput);
}

describe('null/undefined runtime safety', () => {
  it('does not throw when aboutMe is null at runtime', () => {
    expect(() => buildUnsafe({ aboutMe: null })).not.toThrow();
  });

  it('does not throw when globalPrompt is undefined at runtime', () => {
    expect(() => buildUnsafe({ globalPrompt: undefined })).not.toThrow();
  });

  it('does not throw when avoidPrompt is null at runtime', () => {
    expect(() => buildUnsafe({ avoidPrompt: null })).not.toThrow();
  });

  it('does not include the literal string "undefined" anywhere', () => {
    const out = buildUnsafe({ aboutMe: undefined, globalPrompt: undefined });
    expect(out).not.toContain('undefined');
  });

  it('does not include the literal string "null" anywhere', () => {
    const out = buildUnsafe({ aboutMe: null, avoidPrompt: null });
    expect(out).not.toContain('null');
  });
});

// ---------------------------------------------------------------------------
// Line-break preservation
// ---------------------------------------------------------------------------

describe('line-break preservation', () => {
  it('preserves internal newlines in selected text', () => {
    const text = 'line one\nline two\nline three';
    const out = build({ selectedText: text });
    expect(out).toContain('line one\nline two\nline three');
  });

  it('preserves Windows-style CRLF in selected text', () => {
    const text = 'line one\r\nline two';
    const out = build({ selectedText: text });
    expect(out).toContain('line one\r\nline two');
  });

  it('strips only leading/trailing whitespace from selected text', () => {
    const text = '  actual content  ';
    const out = build({ selectedText: text });
    expect(out).toContain('"""\nactual content\n"""');
  });

  it('preserves newlines inside aboutMe', () => {
    const text = 'Rule one.\nRule two.';
    const out = build({ aboutMe: text });
    expect(out).toContain('Rule one.\nRule two.');
  });
});

// ---------------------------------------------------------------------------
// Immutability
// ---------------------------------------------------------------------------

describe('immutability', () => {
  it('does not mutate the input object', () => {
    const input: BuildPromptInput = {
      selectedText: 'original',
      mode: 'normal',
      aboutMe: 'about',
      globalPrompt: 'global',
      avoidPrompt: 'avoid',
    };
    const snapshot = JSON.stringify(input);
    buildRewritePrompt(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe('determinism', () => {
  it('returns the same output for the same input every time', () => {
    const a = buildRewritePrompt(BASE);
    const b = buildRewritePrompt(BASE);
    const c = buildRewritePrompt({ ...BASE });
    expect(a).toBe(b);
    expect(b).toBe(c);
  });
});

// ---------------------------------------------------------------------------
// MODE_LABELS
// ---------------------------------------------------------------------------

describe('MODE_LABELS', () => {
  it('has labels for all three modes', () => {
    expect(MODE_LABELS.quick).toBe('Quick');
    expect(MODE_LABELS.normal).toBe('Normal');
    expect(MODE_LABELS.formal).toBe('Formal');
  });
});
