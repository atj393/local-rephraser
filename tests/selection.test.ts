import { describe, it, expect, afterEach } from 'vitest';
import { getEditableSelectionInfo } from '@/content/selection';

// jsdom does not fully implement document.activeElement via focus().
// Simulate it by reassigning document.activeElement via Object.defineProperty.

function setActive(el: Element | null): void {
  Object.defineProperty(document, 'activeElement', {
    get: () => el,
    configurable: true,
  });
}

function textarea(value: string): HTMLTextAreaElement {
  const el = document.createElement('textarea');
  el.value = value;
  el.setSelectionRange(0, value.length);
  return el;
}

describe('getEditableSelectionInfo', () => {
  afterEach(() => {
    setActive(document.body);
  });

  it('returns null when activeElement is null', () => {
    setActive(null);
    expect(getEditableSelectionInfo()).toBeNull();
  });

  it('returns null when activeElement is a non-editable div', () => {
    setActive(document.createElement('div'));
    expect(getEditableSelectionInfo()).toBeNull();
  });

  it('returns null for a password input', () => {
    const el = document.createElement('input');
    el.type = 'password';
    el.value = 'secret';
    el.setSelectionRange(0, 6);
    setActive(el);
    expect(getEditableSelectionInfo()).toBeNull();
  });

  it('returns null for a disabled textarea', () => {
    const el = textarea('hello world');
    el.disabled = true;
    setActive(el);
    expect(getEditableSelectionInfo()).toBeNull();
  });

  it('returns null for a readonly textarea', () => {
    const el = textarea('hello world');
    el.readOnly = true;
    setActive(el);
    expect(getEditableSelectionInfo()).toBeNull();
  });

  it('returns null when selection is partial', () => {
    const el = document.createElement('textarea');
    el.value = 'hello world';
    el.setSelectionRange(0, 5);
    setActive(el);
    expect(getEditableSelectionInfo()).toBeNull();
  });

  it('returns null when text is too short', () => {
    const el = textarea('hi');
    setActive(el);
    expect(getEditableSelectionInfo()).toBeNull();
  });

  it('returns info when all text is selected in a textarea', () => {
    const el = textarea('hello world');
    setActive(el);
    const info = getEditableSelectionInfo();
    expect(info).not.toBeNull();
    expect(info!.text).toBe('hello world');
    expect(info!.isFullSelection).toBe(true);
    expect(info!.element).toBe(el);
  });

  it('returns info for input[type=text] with full selection', () => {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = 'some text here';
    el.setSelectionRange(0, 14);
    setActive(el);
    const info = getEditableSelectionInfo();
    expect(info).not.toBeNull();
    expect(info!.text).toBe('some text here');
  });

  it('trims leading/trailing whitespace from returned text', () => {
    const el = document.createElement('textarea');
    el.value = '  hello world  ';
    el.setSelectionRange(0, 15);
    setActive(el);
    const info = getEditableSelectionInfo();
    expect(info?.text).toBe('hello world');
  });
});
