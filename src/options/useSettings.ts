import { useEffect, useState } from 'react';
import { loadSettings, onSettingsChanged } from '@/shared/storage';
import { DEFAULT_SETTINGS } from '@/shared/settings';
import type { ExtensionSettings } from '@/shared/types';

export interface UseSettingsState {
  settings: ExtensionSettings;
  loaded: boolean;
}

export function useSettings(): UseSettingsState {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoaded(true);
      }
    });
    const off = onSettingsChanged((next) => {
      if (!cancelled) setSettings(next);
    });
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  return { settings, loaded };
}
