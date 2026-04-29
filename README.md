<div align="center">

# Personal Rewriter

**A Chrome extension that rephrases your text using any AI chat — no API key, no automation, fully manual.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](package.json)
[![No telemetry](https://img.shields.io/badge/telemetry-none-lightgrey)](#privacy)

</div>

---

> **Personal hobby project.** Not affiliated with, endorsed by, or related to any company or organization. Built for personal use and shared as-is.

Select text in any editable field. The extension builds a personalized prompt. You paste it into your AI chat, copy the reply, and apply it with one click. Nothing is automated. Nothing leaves your browser.

---

## Table of Contents

- [How it works](#how-it-works)
- [What it does NOT do](#what-it-does-not-do)
- [Privacy](#privacy)
- [Permissions](#permissions)
- [Installation](#installation)
- [Configuration](#configuration)
- [Modes](#modes)
- [Step-by-step usage](#step-by-step-usage)
- [Supported field types](#supported-field-types)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Stack](#stack)
- [License](#license)

---

## How it works

1. Select all the text in any editable field on any page.
2. A small **✏ Rewrite** button appears — click it and choose **Quick**, **Normal**, or **Formal**.
3. Click **Copy & Open Chat** — the prompt lands in your clipboard and your AI tab opens.
4. Paste into the AI chat, send, copy the reply.
5. Switch back, click **Apply Clipboard Result** — done.

---

## What it does NOT do

- Does **not** call any AI API — paid, free, or local.
- Does **not** automate ChatGPT, Gemini, Claude, or any other AI website.
- Does **not** scrape or read AI responses from any website.
- Does **not** send your text to any server.
- Does **not** store analytics, telemetry, or crash reports.
- Does **not** load any remote scripts.

---

## Privacy

| Data | Fate |
|---|---|
| Selected text | Built into a prompt string, copied to clipboard on your click. Never persisted. |
| Rewritten text | Read from clipboard on your click. Never stored. |
| Settings | Stored in `chrome.storage.sync` — on your device / Google account only. |
| Clipboard history | Never stored. Read once, on explicit click. |
| Network requests | None. The only outbound action is opening the URL you configure in settings. |

---

## Permissions

| Permission | Why |
|---|---|
| `storage` | Persist your settings across browser sessions. |
| `tabs` | Find and focus your configured AI chat tab — avoids opening duplicates. |
| `activeTab` | Operate on the current page when the floating panel is open. |
| `clipboardWrite` | Copy the generated prompt — only on your click. |
| `clipboardRead` | Read the AI's reply — only on your click. |
| `<all_urls>` (content script) | Editable fields exist on every website. The script only reads your selection on user gesture and makes no network requests. |

No `host_permissions` are requested. The extension never connects to any external host on its own.

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/personal-rewriter-extension
cd personal-rewriter-extension
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions` and enable **Developer mode** (top-right toggle).
2. Click **Load unpacked** and select the `dist/` folder.
3. The extension appears as **Personal Rewriter**.

To update after changing source files: run `npm run build` again, then click the reload icon on the extension card.

---

## Configuration

Open the options page via:
- `chrome://extensions` → *Personal Rewriter* → **Details** → **Extension options**
- Click the extension icon in the toolbar
- Click **⚙ Settings** inside the rewrite panel

### Settings

| Field | Default | Notes |
|---|---|---|
| AI chat URL | *(empty)* | The tab opened when you click *Open AI Chat*. Must be `http://` or `https://`. |
| About Me | See below | Tells the AI about you so it matches your voice. |
| Global Prompt | See below | Writing rules applied to every rewrite. |
| Avoid These Things | See below | Things the AI should never do. |
| Default Mode | Normal | Mode pre-selected when the panel opens. |
| Auto-open AI tab | Off | When on, *Copy Prompt* also opens the AI chat tab. |
| Button position | Auto | Where the Rewrite button appears relative to the field. |
| Enable on all sites | On | Turn off to disable the extension globally. |
| Disabled sites | *(empty)* | One hostname per line — button never appears on these sites. |

### Default prompts

<details>
<summary>About Me (click to expand)</summary>

```
English is not my first language, so I often write rough messages and want
them rewritten naturally. I prefer friendly, clear, respectful, and practical
communication.
```

</details>

<details>
<summary>Global Prompt (click to expand)</summary>

```
Preserve my original meaning.
Do not add fake details.
Make the text grammatically correct and easy to understand.
Keep the message human, warm, and direct.
Use simple natural English.
Keep the output suitable for the same context.
```

</details>

<details>
<summary>Avoid These Things (click to expand)</summary>

```
Avoid robotic language.
Avoid unnecessary fancy words.
Avoid over-apologizing.
Avoid exaggerated compliments.
Avoid emojis unless my original text already has emojis.
Avoid phrases like "I hope this message finds you well."
Avoid changing the emotional meaning.
Avoid making short casual messages sound like corporate emails.
```

</details>

---

## Modes

| Mode | Behavior |
|---|---|
| **Quick** | Fix grammar, light rephrase. Stay close to the original. Same length or shorter. |
| **Normal** | Rewrite naturally. Improve clarity, grammar, flow, and tone. Preserve meaning. |
| **Formal** | Rewrite professionally. Workplace or official communication. Natural, not corporate. |

---

## Step-by-step usage

1. Go to any page with an editable field (Gmail, WhatsApp Web, LinkedIn, any textarea, etc.).
2. Click inside the field and type your message.
3. Select **all** the text (Ctrl+A / Cmd+A).
4. A **✏ Rewrite** button appears near the field — click it.
5. Choose **Quick**, **Normal**, or **Formal**.
6. Click one of:
   - **Copy Prompt** — copies the prompt to your clipboard.
   - **Open AI Chat** — opens or focuses your configured AI tab.
   - **Copy & Open Chat** — does both at once.
7. Switch to the AI chat tab. Paste and send.
8. Copy the AI's reply.
9. Switch back — the panel is still open.
10. Click **Apply Clipboard Result** — the field is updated.

> **Tip:** If the AI result is much longer than your original, the panel asks you to confirm before applying.

---

## Supported field types

- `<textarea>`
- `<input type="text">`, `type="search"`, `type="email"`, `type="url"`
- `contenteditable` elements — Gmail compose, WhatsApp Web, LinkedIn editors, and similar rich editors

The button does **not** appear on:

- Password fields
- Read-only or disabled fields
- Partial selections (you must select the full content of the field)
- Fields with fewer than 3 characters

---

## Known limitations

- **Cross-origin iframes** — The content script runs in the main frame only. Fields inside cross-origin iframes (e.g. Google Docs) are not supported.
- **Undo** — The replacement is undoable with Ctrl+Z in most editors. In some React-controlled fields the undo history may be limited.
- **Clipboard permission** — Chrome may show a one-time permission prompt the first time you use *Apply Clipboard Result*.
- **SPA navigation** — The panel closes on navigation. Re-select your text to reopen it.
- **Single AI URL** — The extension tracks one configured AI chat URL. Update it in settings if you switch services.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Rewrite button never appears | Confirm the field is editable and you selected **all** text (not partial). Check *Disabled sites* in settings. |
| *Open AI Chat* shows "No AI chat URL set" | Open settings and enter a valid `https://` URL. |
| *Apply Clipboard Result* says "Clipboard is empty" | Copy the AI's reply before clicking Apply. |
| Panel disappeared after switching tabs | Expected. Re-select the text to reopen the button, then click *Apply Clipboard Result* — no need to re-copy the prompt. |
| Field not updated in a React app | The extension uses the native value setter to trigger React's event system. If the field still doesn't update, click inside it once after applying. |

---

## Development

```bash
npm install           # install dependencies
npm run dev           # Vite dev server with HMR (options page only)
npm run build         # typecheck + production build → dist/
npm run typecheck     # tsc --noEmit only
npm run test          # Vitest unit tests
npm run test:watch    # Vitest watch mode
npm run lint          # ESLint over src/ and tests/
```

### Project structure

```
src/
├── background/       # service worker
├── content/          # content script, floating UI, field detection
├── options/          # settings page (React)
├── shared/           # types, storage, prompt builder, validation
├── styles/           # global CSS
└── manifest.ts       # Manifest V3 declaration
```

---

## Stack

| Layer | Technology |
|---|---|
| Extension platform | Chrome Manifest V3 |
| UI | React 18 + TypeScript 5 (strict) |
| Build | Vite 5 + `@crxjs/vite-plugin` 2.x |
| Testing | Vitest + jsdom |
| Linting | ESLint + `@typescript-eslint` |

---

## License

[MIT](LICENSE) — provided as-is, no warranties of any kind.
