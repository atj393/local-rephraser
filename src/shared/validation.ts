// Lightweight validators shared by the options page.

export interface UrlValidationResult {
  ok: boolean;
  /** human-readable message; empty when ok */
  message: string;
  /** soft warning that should not block save */
  warning?: string;
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function validateAiChatUrl(value: string): UrlValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      ok: true,
      message: '',
      warning: 'No AI chat URL configured. Open AI Chat actions will prompt you to set one.',
    };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, message: 'That does not look like a valid URL.' };
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, message: 'URL must start with http:// or https://' };
  }
  return { ok: true, message: '' };
}

export function parseDisabledSites(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
