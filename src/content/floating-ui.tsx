import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { buildRewritePrompt, MODE_LABELS } from '@/shared/promptBuilder';
import { loadSettings, onSettingsChanged } from '@/shared/storage';
import { DEFAULT_SETTINGS } from '@/shared/settings';
import { sendMessage } from '@/shared/messages';
import type { ButtonPositionPreference, ExtensionSettings, RewriteMode } from '@/shared/types';
import type { EditableSelectionInfo } from './selection';
import { replaceEditableContent } from './replace';

// ---------------------------------------------------------------------------
// Page-level styles — scoped to [data-personal-rewriter-ui] to avoid leaking
// ---------------------------------------------------------------------------
const PAGE_STYLES = `
[data-personal-rewriter-ui] *,[data-personal-rewriter-ui] *::before,[data-personal-rewriter-ui] *::after{box-sizing:border-box;margin:0;padding:0}
[data-personal-rewriter-ui]{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4;color:#111827}

[data-personal-rewriter-ui] .pr-toolbar{
  position:fixed;pointer-events:auto;
  display:inline-flex;align-items:center;gap:2px;
  background:#fff;border:1px solid #e4e7ec;border-radius:8px;
  padding:3px;
  box-shadow:0 4px 14px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.04);
  user-select:none}
[data-personal-rewriter-ui] .pr-tool-btn{
  background:transparent;color:#111827;border:none;border-radius:5px;
  padding:5px 10px;font:500 12px/1.4 inherit;cursor:pointer;
  white-space:nowrap;font-family:inherit;transition:background .1s,color .1s}
[data-personal-rewriter-ui] .pr-tool-btn:hover{background:#eff6ff;color:#1d4ed8}
[data-personal-rewriter-ui] .pr-tool-btn:focus-visible{outline:2px solid #93c5fd;outline-offset:1px}
[data-personal-rewriter-ui] .pr-tool-divider{
  width:1px;height:18px;background:#e4e7ec;margin:0 2px;flex:0 0 auto}
[data-personal-rewriter-ui] .pr-tool-settings{
  padding:5px 7px;color:#6b7280;font-size:13px;line-height:1}

[data-personal-rewriter-ui] .pr-panel{
  position:fixed;pointer-events:auto;
  background:#fff;border:1px solid #e4e7ec;border-radius:12px;
  width:292px;box-shadow:0 8px 30px rgba(0,0,0,.15);
  overflow:hidden;color:#111827}

[data-personal-rewriter-ui] .pr-panel-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:11px 14px 9px;border-bottom:1px solid #f3f4f6}
[data-personal-rewriter-ui] .pr-panel-title{font-weight:600;font-size:13px}
[data-personal-rewriter-ui] .pr-close{
  background:none;border:none;cursor:pointer;color:#6b7280;
  font-size:18px;line-height:1;padding:1px 5px;border-radius:4px;
  pointer-events:auto;display:flex;align-items:center;font-family:inherit}
[data-personal-rewriter-ui] .pr-close:hover{background:#f3f4f6;color:#111827}
[data-personal-rewriter-ui] .pr-close:focus-visible{outline:2px solid #93c5fd;outline-offset:2px}

[data-personal-rewriter-ui] .pr-mode-tabs{
  display:flex;gap:4px;padding:9px 14px 7px}
[data-personal-rewriter-ui] .pr-mode-tab{
  flex:1;background:#f9fafb;border:1px solid #e4e7ec;border-radius:6px;
  padding:5px 2px;font:500 12px/1.3 inherit;cursor:pointer;color:#374151;
  text-align:center;transition:background .1s,border-color .1s}
[data-personal-rewriter-ui] .pr-mode-tab:hover{background:#f3f4f6}
[data-personal-rewriter-ui] .pr-mode-tab.pr-active{background:#eff6ff;border-color:#2563eb;color:#1d4ed8}
[data-personal-rewriter-ui] .pr-mode-tab:focus-visible{outline:2px solid #93c5fd;outline-offset:2px}

[data-personal-rewriter-ui] .pr-actions{
  display:flex;flex-direction:column;gap:5px;padding:2px 14px 8px}
[data-personal-rewriter-ui] .pr-action{
  display:flex;align-items:center;gap:7px;
  background:#f9fafb;border:1px solid #e4e7ec;border-radius:7px;
  padding:8px 11px;font:500 12px/1.4 inherit;cursor:pointer;
  color:#111827;text-align:left;width:100%;transition:background .1s}
[data-personal-rewriter-ui] .pr-action:hover{background:#f3f4f6}
[data-personal-rewriter-ui] .pr-action:focus-visible{outline:2px solid #93c5fd;outline-offset:2px}
[data-personal-rewriter-ui] .pr-action--copy{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8}
[data-personal-rewriter-ui] .pr-action--copy:hover{background:#dbeafe}
[data-personal-rewriter-ui] .pr-action--apply{background:#f0fdf4;border-color:#bbf7d0;color:#15803d}
[data-personal-rewriter-ui] .pr-action--apply:hover{background:#dcfce7}
[data-personal-rewriter-ui] .pr-divider{height:1px;background:#f3f4f6;margin:2px 0}

[data-personal-rewriter-ui] .pr-loading{
  display:flex;flex-direction:column;align-items:center;
  padding:18px 14px 14px;gap:10px}
[data-personal-rewriter-ui] .pr-loading p{font-size:12px;color:#374151;margin:0}
[data-personal-rewriter-ui] .pr-spinner{
  width:28px;height:28px;border:3px solid #e4e7ec;border-top-color:#2563eb;
  border-radius:50%;animation:pr-spin .7s linear infinite}
@keyframes pr-spin{to{transform:rotate(360deg)}}

[data-personal-rewriter-ui] .pr-result-text{
  background:#f9fafb;border:1px solid #e4e7ec;border-radius:6px;
  padding:8px 10px;font-size:12px;line-height:1.55;color:#111827;
  max-height:160px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;
  scrollbar-width:thin}

[data-personal-rewriter-ui] .pr-confirm{
  padding:8px 14px 4px;display:flex;flex-direction:column;gap:7px}
[data-personal-rewriter-ui] .pr-confirm p{font-size:12px;color:#374151;line-height:1.45}
[data-personal-rewriter-ui] .pr-confirm-actions{display:flex;gap:6px}
[data-personal-rewriter-ui] .pr-confirm-yes{
  flex:1;background:#fef2f2;border:1px solid #fca5a5;color:#dc2626;
  border-radius:6px;padding:6px 8px;font:500 12px/1.4 inherit;cursor:pointer}
[data-personal-rewriter-ui] .pr-confirm-yes:hover{background:#fee2e2}
[data-personal-rewriter-ui] .pr-confirm-no{
  flex:1;background:#f9fafb;border:1px solid #e4e7ec;color:#374151;
  border-radius:6px;padding:6px 8px;font:500 12px/1.4 inherit;cursor:pointer}
[data-personal-rewriter-ui] .pr-confirm-no:hover{background:#f3f4f6}

[data-personal-rewriter-ui] .pr-status{
  padding:4px 14px 8px;font-size:11px;color:#374151;min-height:22px}
[data-personal-rewriter-ui] .pr-status--error{color:#dc2626}
[data-personal-rewriter-ui] .pr-status--success{color:#16a34a}

[data-personal-rewriter-ui] .pr-footer{
  display:flex;align-items:center;justify-content:space-between;
  padding:4px 14px 11px;gap:6px}
[data-personal-rewriter-ui] .pr-cancel{
  background:none;border:1px solid #e4e7ec;border-radius:6px;
  padding:5px 10px;font:500 12px/1.4 inherit;cursor:pointer;color:#374151}
[data-personal-rewriter-ui] .pr-cancel:hover{background:#f9fafb}
[data-personal-rewriter-ui] .pr-cancel:focus-visible{outline:2px solid #93c5fd;outline-offset:2px}
[data-personal-rewriter-ui] .pr-settings{
  background:none;border:none;padding:5px 6px;font:12px/1 inherit;
  cursor:pointer;color:#6b7280;border-radius:6px;
  display:flex;align-items:center;gap:4px}
[data-personal-rewriter-ui] .pr-settings:hover{background:#f3f4f6;color:#374151}
[data-personal-rewriter-ui] .pr-settings:focus-visible{outline:2px solid #93c5fd;outline-offset:2px}

@media(prefers-color-scheme:dark){
  [data-personal-rewriter-ui]{color:#f9fafb}
  [data-personal-rewriter-ui] .pr-toolbar{
    background:#1f2937;border-color:#374151;
    box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04)}
  [data-personal-rewriter-ui] .pr-tool-btn{color:#f9fafb}
  [data-personal-rewriter-ui] .pr-tool-btn:hover{background:#1e3a5f;color:#93c5fd}
  [data-personal-rewriter-ui] .pr-tool-divider{background:#374151}
  [data-personal-rewriter-ui] .pr-tool-settings{color:#9ca3af}
  [data-personal-rewriter-ui] .pr-panel{background:#1f2937;border-color:#374151;color:#f9fafb}
  [data-personal-rewriter-ui] .pr-panel-header{border-color:#374151}
  [data-personal-rewriter-ui] .pr-close{color:#9ca3af}
  [data-personal-rewriter-ui] .pr-close:hover{background:#374151;color:#f9fafb}
  [data-personal-rewriter-ui] .pr-mode-tab{background:#374151;border-color:#4b5563;color:#d1d5db}
  [data-personal-rewriter-ui] .pr-mode-tab:hover{background:#4b5563}
  [data-personal-rewriter-ui] .pr-mode-tab.pr-active{background:#1e3a5f;border-color:#3b82f6;color:#93c5fd}
  [data-personal-rewriter-ui] .pr-action{background:#374151;border-color:#4b5563;color:#f9fafb}
  [data-personal-rewriter-ui] .pr-action:hover{background:#4b5563}
  [data-personal-rewriter-ui] .pr-action--copy{background:#1e3a5f;border-color:#3b82f6;color:#93c5fd}
  [data-personal-rewriter-ui] .pr-action--copy:hover{background:#1e40af}
  [data-personal-rewriter-ui] .pr-action--apply{background:#14532d;border-color:#16a34a;color:#86efac}
  [data-personal-rewriter-ui] .pr-action--apply:hover{background:#166534}
  [data-personal-rewriter-ui] .pr-divider{background:#374151}
  [data-personal-rewriter-ui] .pr-loading p{color:#d1d5db}
  [data-personal-rewriter-ui] .pr-spinner{border-color:#374151;border-top-color:#3b82f6}
  [data-personal-rewriter-ui] .pr-result-text{background:#374151;border-color:#4b5563;color:#f9fafb}
  [data-personal-rewriter-ui] .pr-confirm p{color:#d1d5db}
  [data-personal-rewriter-ui] .pr-confirm-yes{background:#450a0a;border-color:#f87171;color:#f87171}
  [data-personal-rewriter-ui] .pr-confirm-yes:hover{background:#7f1d1d}
  [data-personal-rewriter-ui] .pr-confirm-no{background:#374151;border-color:#4b5563;color:#d1d5db}
  [data-personal-rewriter-ui] .pr-confirm-no:hover{background:#4b5563}
  [data-personal-rewriter-ui] .pr-status{color:#d1d5db}
  [data-personal-rewriter-ui] .pr-status--error{color:#f87171}
  [data-personal-rewriter-ui] .pr-status--success{color:#4ade80}
  [data-personal-rewriter-ui] .pr-cancel{border-color:#4b5563;color:#d1d5db}
  [data-personal-rewriter-ui] .pr-cancel:hover{background:#374151}
  [data-personal-rewriter-ui] .pr-settings{color:#9ca3af}
  [data-personal-rewriter-ui] .pr-settings:hover{background:#374151;color:#d1d5db}
}
`;

// ---------------------------------------------------------------------------
// Positioning helpers
// ---------------------------------------------------------------------------

const BUTTON_W = 232;
const BUTTON_H = 32;
const PANEL_W = 292;
const PANEL_H = 280;
const GAP = 6;

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function buttonPos(
  rect: DOMRect,
  pref: ButtonPositionPreference,
): { top: number; left: number } {
  const spaceBelow = window.innerHeight - rect.bottom;
  const above =
    pref === 'above' ||
    (pref === 'auto' &&
      spaceBelow < BUTTON_H + GAP &&
      rect.top > BUTTON_H + GAP);
  const top = above ? rect.top - BUTTON_H - GAP : rect.bottom + GAP;
  const left = clamp(
    rect.right - BUTTON_W,
    8,
    window.innerWidth - BUTTON_W - 8,
  );
  return { top: clamp(top, 8, window.innerHeight - BUTTON_H - 8), left };
}

function panelPos(btn: { top: number; left: number }): {
  top: number;
  left: number;
} {
  return {
    top: clamp(btn.top, 8, window.innerHeight - PANEL_H - 8),
    left: clamp(btn.left, 8, window.innerWidth - PANEL_W - 8),
  };
}

// ---------------------------------------------------------------------------
// Module-level state bridge
// (one floating UI instance per content script — safe to use module scope)
// ---------------------------------------------------------------------------

type FloatingPhase = 'idle' | 'button' | 'panel';

interface FloatingState {
  phase: FloatingPhase;
  info: EditableSelectionInfo | null;
  mode: RewriteMode;
  status: string;
  statusKind: 'info' | 'error' | 'success';
  pendingResult: string | null;
  awaitingResponse: boolean;
}

type StateSetter = React.Dispatch<React.SetStateAction<FloatingState>>;

let _setState: StateSetter | null = null;

function externalSet(updater: (prev: FloatingState) => FloatingState): void {
  _setState?.(updater);
}

// ---------------------------------------------------------------------------
// React component
// ---------------------------------------------------------------------------

interface FloatingUiProps {
  mountEl: HTMLElement;
}

function FloatingUiComponent({ mountEl }: FloatingUiProps): JSX.Element | null {
  const [state, setState] = useState<FloatingState>({
    phase: 'idle',
    info: null,
    mode: 'normal',
    status: '',
    statusKind: 'info',
    pendingResult: null,
    awaitingResponse: false,
  });
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const panelRef = useRef<HTMLDivElement>(null);

  // Always-current refs — written synchronously during render so that the
  // stable native event handler always reads the latest values.
  const stateRef = useRef(state);
  const settingsRef = useRef(settings);
  stateRef.current = state;
  settingsRef.current = settings;

  useEffect(() => {
    console.log('[PR] FloatingUiComponent mounted');
  }, []);

  // Register state setter for external access.
  useEffect(() => {
    _setState = setState;
    return () => {
      if (_setState === setState) _setState = null;
    };
  }, [setState]);

  // Load settings and subscribe to changes.
  useEffect(() => {
    void loadSettings().then((s) => {
      setSettings(s);
      setState((prev) =>
        prev.phase === 'idle' ? { ...prev, mode: s.defaultMode } : prev,
      );
    });
    return onSettingsChanged((s) => {
      setSettings(s);
    });
  }, []);

  // Focus the panel when it opens for keyboard accessibility.
  useEffect(() => {
    if (state.phase === 'panel') {
      panelRef.current?.focus();
    }
  }, [state.phase]);

  // ---- Stable action dispatcher (reads current values via refs) ----
  const handleAction = useCallback(
    async (action: string | null, btn: HTMLElement): Promise<void> => {
      if (!action) return;
      console.log('[PR] handleAction:', action, '— current phase:', stateRef.current.phase);
      const cur = stateRef.current;
      const cfg = settingsRef.current;

      const setStatusMsg = (
        msg: string,
        kind: 'info' | 'error' | 'success' = 'info',
        ms = 3500,
      ) => {
        setState((prev) => ({ ...prev, status: msg, statusKind: kind }));
        if (ms > 0 && msg) {
          setTimeout(() => setState((prev) => ({ ...prev, status: '' })), ms);
        }
      };

      const closeFn = () =>
        setState((prev) => ({
          phase: 'idle',
          info: null,
          mode: prev.mode,
          status: '',
          statusKind: 'info',
          pendingResult: null,
          awaitingResponse: false,
        }));

      const applyText = (target: HTMLElement, text: string) => {
        const ok = replaceEditableContent(target, text);
        setState((prev) => ({ ...prev, pendingResult: null }));
        if (ok) {
          setStatusMsg('Applied!', 'success', 1200);
          setTimeout(closeFn, 1300);
        } else {
          setStatusMsg('Failed to update the field.', 'error');
        }
      };

      switch (action) {
        case 'close':
          closeFn();
          break;

        case 'send-mode': {
          if (!cur.info) break;
          const mode = btn.getAttribute('data-mode') as RewriteMode | null;
          if (!mode) break;
          // Switch to the in-flight panel view immediately so the user sees
          // the spinner without waiting on the round-trip.
          setState((prev) => ({
            ...prev,
            mode,
            phase: 'panel',
            awaitingResponse: true,
            status: '',
            pendingResult: null,
          }));

          const promptText = buildRewritePrompt({
            selectedText: cur.info.text,
            mode,
            aboutMe: cfg.aboutMe,
            globalPrompt: cfg.globalPrompt,
            avoidPrompt: cfg.avoidPrompt,
          });
          // Clipboard fallback so the user can paste manually if auto-inject fails.
          try {
            await navigator.clipboard.writeText(promptText);
          } catch {
            /* ignore */
          }

          const res = await sendMessage({
            type: 'SEND_PROMPT_TO_AI',
            prompt: promptText,
          });
          setState((prev) => ({ ...prev, awaitingResponse: false }));

          if (res.ok) {
            const data = (res as { ok: true; data?: unknown }).data;
            const responseText = typeof data === 'string' ? data.trim() : '';
            if (responseText) {
              setState((prev) => ({ ...prev, pendingResult: responseText }));
            } else {
              setStatusMsg('Sent, but could not read the reply.', 'error');
            }
          } else {
            const reason = (res as { ok: false; error: string }).error;
            if (reason === 'no-url') {
              setStatusMsg('No AI chat URL set. Opening settings…', 'error');
              void sendMessage({ type: 'OPEN_OPTIONS' });
            } else if (reason === 'no-response') {
              setStatusMsg('AI did not reply in time.', 'error');
            } else if (
              reason === 'no-editor' ||
              reason === 'no-send-button' ||
              reason === 'inject-failed'
            ) {
              setStatusMsg(
                'Auto-send failed — prompt copied, paste it manually.',
                'error',
              );
            } else {
              setStatusMsg('Could not reach AI chat tab.', 'error');
            }
          }
          break;
        }

        case 'confirm-apply': {
          const target = cur.info?.element;
          const text = cur.pendingResult;
          if (!target || !text) break;
          applyText(target, text);
          break;
        }

        case 'confirm-cancel':
          closeFn();
          break;

        case 'settings':
          void sendMessage({ type: 'OPEN_OPTIONS' });
          break;
      }
    },
    [],
  );

  // Attach native click/keydown delegation on the mount container.
  useEffect(() => {
    console.log('[PR] attaching native click/keydown listeners to mount', mountEl);

    const onClick = (e: Event) => {
      const target = e.target instanceof Element ? e.target : null;
      console.log('[PR] click on mount — target:', target);
      if (!target) return;
      const btn = target.closest('[data-action]') as HTMLElement | null;
      if (!btn) return;
      console.log('[PR] dispatching action:', btn.getAttribute('data-action'));
      void handleAction(btn.getAttribute('data-action'), btn);
    };

    const onKeydown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape' && stateRef.current.phase === 'panel') {
        setState((prev) => ({
          phase: 'idle',
          info: null,
          mode: prev.mode,
          status: '',
          statusKind: 'info',
          pendingResult: null,
          awaitingResponse: false,
        }));
      }
    };

    mountEl.addEventListener('click', onClick);
    mountEl.addEventListener('keydown', onKeydown);
    return () => {
      mountEl.removeEventListener('click', onClick);
      mountEl.removeEventListener('keydown', onKeydown);
    };
  }, [mountEl, handleAction]);

  if (state.phase === 'idle') return null;

  const info = state.info;
  if (!info || !document.contains(info.element)) return null;

  const rect = info.element.getBoundingClientRect();
  const bPos = buttonPos(rect, settings.buttonPosition);

  const modes = Object.keys(MODE_LABELS) as RewriteMode[];

  const statusEl = state.status ? (
    <div
      className={
        'pr-status' +
        (state.statusKind === 'error'
          ? ' pr-status--error'
          : state.statusKind === 'success'
            ? ' pr-status--success'
            : '')
      }
      role="status"
    >
      {state.status}
    </div>
  ) : null;

  // ---- Mode toolbar (selection-triggered quick actions) ----
  if (state.phase === 'button') {
    return (
      <div
        className="pr-toolbar"
        style={{ top: bPos.top, left: bPos.left }}
        role="toolbar"
        aria-label="Rewrite text"
      >
        {modes.map((m) => (
          <button
            key={m}
            className="pr-tool-btn"
            data-action="send-mode"
            data-mode={m}
            title={`Rewrite — ${MODE_LABELS[m]}`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
        <span className="pr-tool-divider" aria-hidden="true" />
        <button
          className="pr-tool-btn pr-tool-settings"
          data-action="settings"
          aria-label="Settings"
          title="Settings"
        >
          ⚙
        </button>
      </div>
    );
  }

  // ---- Panel (loading / result) ----
  const pPos = panelPos(bPos);

  return (
    <div
      ref={panelRef}
      className="pr-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Personal Rewriter"
      tabIndex={-1}
      style={{ top: pPos.top, left: pPos.left }}
    >
      {state.awaitingResponse ? (
        <div className="pr-loading">
          <div className="pr-spinner" aria-label="Loading" role="status" />
          <p>Rewriting in {MODE_LABELS[state.mode]} mode…</p>
          <button className="pr-cancel" data-action="close">
            Cancel
          </button>
        </div>
      ) : state.pendingResult !== null ? (
        <div className="pr-confirm">
          <div className="pr-result-text">{state.pendingResult}</div>
          <div className="pr-confirm-actions">
            <button className="pr-confirm-yes" data-action="confirm-apply">
              ✓ Apply
            </button>
            <button className="pr-confirm-no" data-action="confirm-cancel">
              Cancel
            </button>
          </div>
          {statusEl}
        </div>
      ) : (
        <div className="pr-confirm">
          {statusEl ?? <p>No result.</p>}
          <div className="pr-confirm-actions">
            <button className="pr-confirm-no" data-action="close">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FloatingUiHandle {
  setSelectionInfo: (info: EditableSelectionInfo | null) => void;
  closePanel: () => void;
  destroy: () => void;
}

let _mountedRoot: Root | null = null;
let _hostEl: HTMLElement | null = null;
let _styleEl: HTMLStyleElement | null = null;

export function mountFloatingUi(): FloatingUiHandle {
  // Prevent double-mount.
  if (_hostEl) _hostEl.remove();
  if (_styleEl) _styleEl.remove();

  // Inject scoped styles into document.head (no shadow DOM).
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-personal-rewriter-styles', '');
  styleEl.textContent = PAGE_STYLES;
  document.head.appendChild(styleEl);
  _styleEl = styleEl;

  // Host element rendered directly into document.body — no shadow DOM.
  // This ensures native click events bubble normally without shadow boundary issues.
  const host = document.createElement('div');
  host.setAttribute('data-personal-rewriter', 'host');
  host.setAttribute('data-personal-rewriter-ui', '');
  host.style.cssText =
    'all:unset;position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647';
  document.body.appendChild(host);
  _hostEl = host;

  console.log('[PR] host mounted in document.body (no shadow DOM):', host);

  const root = createRoot(host);
  root.render(<FloatingUiComponent mountEl={host} />);
  _mountedRoot = root;

  return {
    setSelectionInfo(info) {
      externalSet((prev) => {
        if (prev.phase === 'panel') return prev;
        if (!info) return { ...prev, phase: 'idle', info: null };
        return { ...prev, phase: 'button', info };
      });
    },
    closePanel() {
      externalSet((prev) => ({
        phase: 'idle',
        info: null,
        mode: prev.mode,
        status: '',
        statusKind: 'info',
        pendingResult: null,
        awaitingResponse: false,
      }));
    },
    destroy() {
      _mountedRoot?.unmount();
      _mountedRoot = null;
      _hostEl?.remove();
      _hostEl = null;
      _styleEl?.remove();
      _styleEl = null;
      _setState = null;
    },
  };
}
