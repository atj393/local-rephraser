import {
  getEditableRoot,
  getEditableText,
  isEditableElement,
  isFullSelectionInsideEditable,
  isReadonlyOrDisabled,
} from './editable';

export interface EditableSelectionInfo {
  element: HTMLElement;
  text: string;
  isFullSelection: true;
}

// Returns a description of the active editable selection.
// Returns null unless all conditions hold:
// - focused element is a supported editable field
// - not read-only, disabled, or a password field
// - user has selected all meaningful text inside it
export function getEditableSelectionInfo(): EditableSelectionInfo | null {
  const active = document.activeElement;
  if (!active) return null;
  if (active instanceof HTMLInputElement && active.type.toLowerCase() === 'password') return null;
  if (!isEditableElement(active)) return null;
  if (isReadonlyOrDisabled(active)) return null;

  const root = getEditableRoot(active);
  if (!root) return null;
  if (!isFullSelectionInsideEditable(root)) return null;

  const text = getEditableText(root).trim();
  if (!text) return null;

  return { element: root, text, isFullSelection: true };
}
