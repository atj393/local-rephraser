// Minimal chrome.storage mock for unit tests. Only the surface used by
// shared/storage.ts is implemented.

type Listener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) => void;

interface MockArea {
  data: Record<string, unknown>;
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  clear(): Promise<void>;
}

function createArea(name: 'sync' | 'local', listeners: Listener[]): MockArea {
  const data: Record<string, unknown> = {};
  return {
    data,
    async get(keys: string | string[]) {
      const keyList = typeof keys === 'string' ? [keys] : keys;
      const out: Record<string, unknown> = {};
      for (const k of keyList) {
        if (k in data) out[k] = data[k];
      }
      return out;
    },
    async set(items: Record<string, unknown>) {
      const changes: Record<string, chrome.storage.StorageChange> = {};
      for (const [k, v] of Object.entries(items)) {
        changes[k] = { oldValue: data[k], newValue: v };
        data[k] = v;
      }
      for (const l of listeners) l(changes, name);
    },
    async clear() {
      for (const k of Object.keys(data)) delete data[k];
    },
  };
}

export function installChromeMock(): {
  reset: () => void;
} {
  const listeners: Listener[] = [];
  const sync = createArea('sync', listeners);
  const local = createArea('local', listeners);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).chrome = {
    storage: {
      sync,
      local,
      onChanged: {
        addListener: (l: Listener) => listeners.push(l),
        removeListener: (l: Listener) => {
          const i = listeners.indexOf(l);
          if (i >= 0) listeners.splice(i, 1);
        },
      },
    },
  };
  return {
    reset: () => {
      void sync.clear();
      void local.clear();
      listeners.length = 0;
    },
  };
}
