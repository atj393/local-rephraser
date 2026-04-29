<div align="center">

<img src="src/assets/image.png" alt="Re-Phraser" width="96" />

# Re-Phraser

**Select text. Pick a tone. Done. — No API key. No local AI. No setup beyond your browser.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](package.json)
[![No telemetry](https://img.shields.io/badge/telemetry-none-lightgrey)](#privacy)

</div>

---

> **Personal hobby project.** Not affiliated with, endorsed by, or related to any company or organization.

Re-Phraser bridges any editable field on any website with the AI chat tab you already have open. It injects the prompt, waits for the reply, and brings the rewritten text back — all without you switching tabs or touching the clipboard manually.

---

## Table of Contents

- [Quick install — no build needed](#quick-install--no-build-needed)
- [How it works](#how-it-works)
- [What it is NOT](#what-it-is-not)
- [Privacy](#privacy)
- [Permissions](#permissions)
- [Build from source](#build-from-source)
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

## Quick install — no build needed

1. Download **`re-phraser-v0.2.0.zip`** from [Releases](../../releases/latest).
2. Extract the zip anywhere on your computer.
3. Open **`chrome://extensions`** and enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the extracted folder.

The **Re-Phraser** icon appears in your Chrome toolbar. Pin it for easy access.

> No Node.js, no terminal, no build step required.

---

## How it works

1. Click inside any editable field and type your message.
2. Select **all** the text in the field.
3. A floating **Rewrite** button appears — click it and choose a tone.
4. Re-Phraser injects the prompt into your AI chat tab in the background.
5. It waits for the reply, fetches it automatically, and shows it in a preview panel.
6. Review the result, then click **Apply** — the field is updated instantly.

Your source tab never loses focus. No copy-paste. No switching tabs.

---

## What it is NOT

- **Not** an AI service — it uses the AI chat tab you already have open (ChatGPT, Claude, Gemini, or any other).
- **Not** an API integration — no API key, no API calls, no billing.
- **Not** a local AI model — nothing runs on your machine beyond the extension itself.
- **Not** a scraper or bot — it does not automate or bypass AI websites.
- **Not** sending your text anywhere — no server, no telemetry, no analytics.

---

## Privacy

| Data | Fate |
|---|---|
| Selected text | Built into a prompt and injected into your AI tab. Never stored by the extension. |
| Rewritten text | Fetched from your AI tab and shown in the preview panel. Never persisted. |
| Settings (prompts, URL, preferences) | Stored in `chrome.storage.sync` — your device / Google account only. |
| Network requests | None made by the extension itself. The only outbound action is navigating the AI tab you configured. |

---

## Permissions

| Permission | Why |
|---|---|
| `storage` | Persist your settings across browser sessions. |
| `tabs` | Open, find, and control your configured AI chat tab. |
| `activeTab` | Operate on the page where you triggered the rewrite. |
| `clipboardWrite` | Fallback copy in case auto-inject is unavailable. |
| `clipboardRead` | Fallback read in case auto-fetch is unavailable. |
| `<all_urls>` (content script) | Editable fields exist on every website. The script only acts on your selection, on user gesture, and makes no network requests. |

No `host_permissions` are declared. The extension never connects to any external host on its own.

---

## Build from source

```bash
git clone https://github.com/YOUR_USERNAME/re-phraser-extension
cd re-phraser-extension
npm install
npm run build
```

Then load the `dist/` folder as an unpacked extension in `chrome://extensions`.

### Build + package in one command

```bash
npm run package
```

This runs `npm run build` and then creates a versioned zip in `releases/`:

```
releases/re-phraser-v0.2.0.zip
```

Upload that file to a GitHub Release so others can install without building.

---

## Configuration

Open the options page via:
- `chrome://extensions` → *Re-Phraser* → **Details** → **Extension options**
- Click the Re-Phraser toolbar icon
- Click the gear **⚙** button inside the floating toolbar

### Settings

| Field | Default | Notes |
|---|---|---|
| AI chat URL | *(empty)* | The tab Re-Phraser injects prompts into. Must be `http://` or `https://`. |
| About Me | See below | Tells the AI about you so it matches your voice and style. |
| Global Prompt | See below | Writing rules applied to every rewrite. |
| Avoid These Things | See below | Things the AI should never do in any mode. |
| Default Mode | Normal | Mode pre-selected when the floating toolbar opens. |
| Button position | Auto | Where the Rewrite button appears relative to the field. |
| Enable on all sites | On | Turn off to disable the extension globally. |
| Disabled sites | *(empty)* | One hostname per line — button never appears on these sites. |

### Default prompts

<details>
<summary>About Me</summary>

```
English is not my first language, so I often write rough messages and want
them rewritten naturally. I prefer friendly, clear, respectful, and practical
communication.
```

</details>

<details>
<summary>Global Prompt</summary>

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
<summary>Avoid These Things</summary>

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
| ⚡ **Quick** | Light grammar fix and rephrase. Stay close to the original. Same length or shorter. |
| ✏ **Normal** | Natural rewrite. Improve clarity, flow, and tone while preserving meaning. |
| 💼 **Formal** | Professional and polished. Suitable for workplace or official communication. Still human, not corporate. |

---

## Step-by-step usage

1. Open your AI chat (ChatGPT, Claude, Gemini, etc.) in a browser tab and set that URL in Re-Phraser settings.
2. Go to any page with an editable field and type your message.
3. Select **all** the text (Ctrl+A / Cmd+A).
4. The floating **Rewrite** toolbar appears — click a mode button (⚡ / ✏ / 💼).
5. Re-Phraser opens the AI chat tab in the background, injects the prompt, and waits.
6. When the reply arrives, a preview panel slides in on your current page.
7. Read the result, then click **Apply** — the field is updated.

> **Tip:** Your source tab stays focused throughout. The AI tab works silently in the background.

---

## Supported field types

- `<textarea>`
- `<input type="text">`, `type="search"`, `type="email"`, `type="url"`
- `contenteditable` elements — Gmail compose, WhatsApp Web, LinkedIn editors, Notion, and similar rich editors

The Rewrite toolbar does **not** appear on:

- Password fields
- Read-only or disabled fields
- Partial selections (you must select the full content of the field)
- Fields with fewer than 3 characters

---

## Known limitations

- **Cross-origin iframes** — The content script runs in the main frame only. Fields inside cross-origin iframes (e.g. Google Docs) are not supported.
- **AI chat compatibility** — Auto-inject works best with text-input–based AI chats. Highly dynamic UIs may occasionally require a page refresh.
- **Single AI URL** — The extension tracks one AI chat URL. Update it in settings if you switch services.
- **SPA navigation** — The floating toolbar closes on navigation. Re-select your text to reopen it.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Rewrite toolbar never appears | Field must be editable and you must select **all** text (not partial). Check *Disabled sites* in settings. |
| "No AI chat URL set" | Open settings and enter a valid `https://` URL for your AI chat. |
| Auto-inject fails / blank response | Close and reopen the AI chat tab, then try again. Some AI UIs need a fresh page to accept injection. |
| Preview panel shows wrong text | The AI tab may have had leftover content. Reload the AI tab and retry. |
| Field not updated after Apply | Click inside the field once, then try Apply again. Some React-controlled fields need a focus event first. |

---

## Development

```bash
npm install           # install dependencies
npm run dev           # Vite dev server (options page HMR only)
npm run build         # typecheck + production build → dist/
npm run package       # build + create releases/re-phraser-v{version}.zip
npm run typecheck     # tsc --noEmit only
npm run test          # Vitest unit tests
npm run test:watch    # Vitest watch mode
npm run lint          # ESLint over src/ and tests/
```

### Project structure

```
src/
├── background/       # service worker
├── content/          # floating toolbar, field detection, auto-inject
├── options/          # settings page (React)
├── shared/           # types, storage, prompt builder, validation
├── styles/           # global CSS
└── manifest.ts       # Manifest V3 declaration
scripts/
└── pack.mjs          # build + zip packaging script
releases/             # versioned zips (committed, attached to GitHub Releases)
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
