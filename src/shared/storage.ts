import { DEFAULT_SETTINGS } from './settings';
import type { ExtensionSettings } from './types';

const SETTINGS_KEY = 'settings';

// Prefer chrome.storage.sync so settings follow the user across machines.
// Falls back to local if sync is unavailable (e.g., enterprise policy).
function getStorageArea(): chrome.storage.StorageArea {
  if (chrome.storage?.sync) return chrome.storage.sync;
  return chrome.storage.local;
}

export async function loadSettings(): Promise<ExtensionSettings> {
  const area = getStorageArea();
  const result = await area.get(SETTINGS_KEY);
  const stored = result[SETTINGS_KEY] as Partial<ExtensionSettings> | undefined;
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  const area = getStorageArea();
  await area.set({ [SETTINGS_KEY]: settings });
}

export async function resetSettings(): Promise<ExtensionSettings> {
  await saveSettings(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS };
}

export function onSettingsChanged(
  callback: (settings: ExtensionSettings) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    _areaName: string,
  ): void => {
    if (changes[SETTINGS_KEY]) {
      const next = changes[SETTINGS_KEY].newValue as ExtensionSettings | undefined;
      if (next) callback({ ...DEFAULT_SETTINGS, ...next });
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
