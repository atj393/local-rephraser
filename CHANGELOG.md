# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] — 2026-04-29

### Added
- Initial release.
- Floating **✏ Rewrite** button on any editable field when full text is selected.
- Three rewrite modes: **Quick**, **Normal**, **Formal**.
- Configurable **About Me**, **Global Prompt**, and **Avoid These Things** prompts.
- **Copy Prompt**, **Open AI Chat**, and **Copy & Open Chat** actions.
- **Apply Clipboard Result** — replaces field content with the AI reply from clipboard.
- Confirmation dialog when AI result is significantly longer than the original.
- Support for `<textarea>`, `<input>`, and `contenteditable` fields (Gmail, WhatsApp Web, LinkedIn, etc.).
- Options page with all settings, accessible from the toolbar icon.
- `chrome.storage.sync` persistence with `chrome.storage.local` fallback.
- Per-site disable list (hostname-based).
- Dark mode support.
- Keyboard accessibility: Escape closes the panel, Tab cycles through buttons.
- SPA navigation detection — panel closes automatically on route change.
