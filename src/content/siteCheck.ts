import type { ExtensionSettings } from '@/shared/types';

// Checks whether the extension should be active on the current page.
// Called by the content script on init and on URL changes (SPA navigation).
export function isSiteEnabled(settings: ExtensionSettings): boolean {
  if (!settings.enableOnAllSites) return false;
  if (settings.disabledSites.length === 0) return true;

  const hostname = location.hostname.toLowerCase().replace(/^www\./, '');
  return !settings.disabledSites.some((entry) => {
    const site = entry.toLowerCase().replace(/^www\./, '');
    return hostname === site || hostname.endsWith(`.${site}`);
  });
}
