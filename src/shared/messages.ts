// Discriminated unions for typed messaging between content script and
// background service worker. All messages have a `type` literal so the
// receiver can switch exhaustively.

export type ExtensionMessage =
  | { type: 'OPEN_OR_FOCUS_AI_TAB' }
  | { type: 'OPEN_OPTIONS' }
  | { type: 'PING' }
  | { type: 'SEND_PROMPT_TO_AI'; prompt: string }
  | { type: 'INJECT_PROMPT'; prompt: string };

export type ExtensionMessageResponse =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

export function sendMessage(
  message: ExtensionMessage,
): Promise<ExtensionMessageResponse> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response: ExtensionMessageResponse) => {
        const err = chrome.runtime.lastError;
        if (err) {
          resolve({ ok: false, error: err.message ?? 'unknown runtime error' });
          return;
        }
        resolve(response ?? { ok: true });
      });
    } catch (e) {
      resolve({ ok: false, error: String(e) });
    }
  });
}
