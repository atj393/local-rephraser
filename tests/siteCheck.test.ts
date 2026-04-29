import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isSiteEnabled } from '@/content/siteCheck';
import { DEFAULT_SETTINGS } from '@/shared/settings';
import type { ExtensionSettings } from '@/shared/types';

function settings(overrides: Partial<ExtensionSettings>): ExtensionSettings {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

// Stub location.hostname for each test.
const originalHostname = Object.getOwnPropertyDescriptor(window, 'location');

function setHostname(hostname: string): void {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, hostname },
    writable: true,
    configurable: true,
  });
}

beforeEach(() => setHostname('example.com'));
afterEach(() => {
  if (originalHostname) {
    Object.defineProperty(window, 'location', originalHostname);
  }
});

describe('isSiteEnabled', () => {
  it('returns true when enableOnAllSites is true and no disabled sites', () => {
    expect(isSiteEnabled(settings({ enableOnAllSites: true, disabledSites: [] }))).toBe(true);
  });

  it('returns false when enableOnAllSites is false', () => {
    expect(isSiteEnabled(settings({ enableOnAllSites: false }))).toBe(false);
  });

  it('returns false when current hostname is in disabledSites', () => {
    setHostname('spam.com');
    expect(
      isSiteEnabled(settings({ enableOnAllSites: true, disabledSites: ['spam.com'] })),
    ).toBe(false);
  });

  it('strips www. from both sides before comparing', () => {
    setHostname('www.spam.com');
    expect(
      isSiteEnabled(settings({ enableOnAllSites: true, disabledSites: ['spam.com'] })),
    ).toBe(false);
  });

  it('allows a site not in the disabled list', () => {
    setHostname('allowed.com');
    expect(
      isSiteEnabled(settings({ enableOnAllSites: true, disabledSites: ['spam.com'] })),
    ).toBe(true);
  });

  it('handles subdomain matching', () => {
    setHostname('mail.spam.com');
    expect(
      isSiteEnabled(settings({ enableOnAllSites: true, disabledSites: ['spam.com'] })),
    ).toBe(false);
  });
});
