# Personal Rewriter — Chrome Extension

> **Personal hobby project.** Not affiliated with, endorsed by, or related to any company or organization. Built for personal use and shared as-is. See [LICENSE](LICENSE).

A personal Chrome (Manifest V3) extension that helps you rephrase selected text inside editable fields using a **fully manual** AI-chat workflow.

---

## What it does

1. You type a rough message in any editable field (Gmail composer, LinkedIn, WhatsApp Web, a plain textarea, etc.).
2. You select all the text inside that field.
3. A small **Rewrite** button appears near the field.
4. You click **Rewrite** and choose a mode: **Quick**, **Normal**, or **Formal**.
5. The extension builds a personalised prompt using your saved *About Me*, *Global Prompt*, and *Avoid* rules.
6. You click **Copy Prompt** (or **Copy & Open Chat**).
7. The extension copies the prompt to your clipboard and optionally opens or focuses your configured AI chat tab.
8. You **manually** paste the prompt into the AI chat, send it, and copy the AI's reply.
9. You switch back to the original page and click **Apply Clipboard Result**.
10. The extension reads your clipboard and replaces the field content with the rewritten text.

---

## What it does NOT do

- Does **not** call any paid or free AI API.
- Does **not** use a local AI model or any local API endpoint.
- Does **not** automate ChatGPT, Gemini, Claude, or any other AI website.
- Does **not** paste into AI websites automatically.
- Does **not** scrape or read AI responses from any website.
- Does **not** send your text to any server.
- Does **not** store analytics, telemetry, or crash reports anywhere.
- Does **not** load any remote scripts.

---

## Privacy model

| Data | Fate |
|---|---|
| Selected text | Built into a prompt string, copied to clipboard on your click. Never persisted. |
| Rewritten text | Read from clipboard on your click. Never stored. |
| Settings (About Me, Global Prompt, …) | Stored in `chrome.storage.sync` on your device / Google account only. |
| Clipboard history | Never stored. The extension only reads the clipboard once, on explicit click. |
| Network requests | None. The only outbound action is opening the URL you configured in settings. |

---

## Permissions explained

| Permission | Why it is needed |
|---|---|
| `storage` | Save your *About Me*, *Global Prompt*, and other settings across browser sessions. |
| `tabs` | Find and focus your single configured AI chat tab so we never open duplicates. |
| `activeTab` | Operate on the current page when the floating panel is open. |
| `clipboardWrite` | Copy the generated prompt — only after you click **Copy Prompt**. |
| `clipboardRead` | Read the AI's reply — only after you click **Apply Clipboard Result**. |
| `<all_urls>` (content script `matches`) | Editable fields exist on every website. The content script runs everywhere but never makes network requests — it only inspects your selection on user gesture. |

No `host_permissions` are requested. The extension never connects to any external host on its own.

---

## Installation from source

```bash
# 1. Clone / download this repository
git clone <repo-url>
cd personal-rewriter-extension

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build
```

Then in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the `dist/` folder inside the project.
5. The extension appears as **Personal Rewriter**.

To update after changing source files: run `npm run build` again, then click the reload icon on the extension card in `chrome://extensions`.

---

## Configuration

Open the extension options page via:

- `chrome://extensions` → *Personal Rewriter* → **Details** → **Extension options**, or
- Click the extension action icon in the toolbar (if pinned), or
- Click **⚙ Settings** inside the rewrite panel.

### Settings fields

| Field | Default | Notes |
|---|---|---|
| AI chat URL | *(empty)* | The URL opened when you click *Open AI Chat*. Must be `http://` or `https://`. Leave empty to configure later. |
| About Me | See below | Tells the AI who you are so it can match your voice. |
| Global Prompt | See below | Writing rules applied to every rewrite. |
| Avoid These Things | See below | Things the AI should not do in any mode. |
| Default Mode | Normal | The mode pre-selected when the panel opens. |
| Auto-open AI tab after copying | Off | When on, clicking *Copy Prompt* also opens the AI chat tab automatically. |
| Button position | Auto | Where the Rewrite button appears relative to the field. |
| Enable on all sites | On | Turn off to disable the extension everywhere, then whitelist nothing. |
| Disabled sites | *(empty)* | One hostname per line. The button never appears on these sites. |

### Default About Me

```
I am Alexis, a software developer. English is not my first language, so I
often write rough messages and want them rewritten naturally. I prefer
friendly, clear, respectful, and practical communication.
```

### Default Global Prompt

```
Preserve my original meaning.
Do not add fake details.
Make the text grammatically correct and easy to understand.
Keep the message human, warm, and direct.
Use simple natural English.
Keep the output suitable for the same context.
```

### Default Avoid These Things

```
Avoid robotic language.
Avoid unnecessary fancy words.
Avoid over-apologizing.
Avoid exaggerated compliments.
Avoid emojis unless my original text already has emojis.
Avoid phrases like I hope this message finds you well.
Avoid changing the emotional meaning.
Avoid making short casual messages sound like corporate emails.
```

---

## Modes

| Mode | Behaviour |
|---|---|
| **Quick** | Fix grammar, light rephrase. Keep close to the original. Same length or shorter. |
| **Normal** | Rewrite naturally. Improve clarity, grammar, flow, and tone. Preserve meaning. |
| **Formal** | Rewrite professionally and politely. Workplace, official, or broker communication. Still natural, not corporate. |

---

## How to use — step by step

1. Go to any page with an editable field (Gmail, WhatsApp Web, LinkedIn, any textarea, etc.).
2. Click inside the field and type your message.
3. Select **all** the text in the field (Ctrl+A / Cmd+A, or click and drag).
4. A small **✏ Rewrite** button appears near the field.
5. Click **✏ Rewrite**.
6. Choose **Quick**, **Normal**, or **Formal**.
7. Click one of:
   - **📋 Copy Prompt** — copies the prompt to your clipboard.
   - **🔗 Open AI Chat** — opens or focuses your configured AI chat tab.
   - **📋 + 🔗 Copy & Open Chat** — does both at once.
8. Switch to the AI chat tab. Paste (Ctrl+V / Cmd+V) and send.
9. When the AI replies, copy the rewritten text.
10. Switch back to the original page. The panel is still open.
11. Click **✓ Apply Clipboard Result**.
12. The field content is replaced with the rewritten text.

> **Tip:** If the AI result is much longer than your original, the panel asks you to confirm before applying.

---

## Supported editable field types

- `<textarea>`
- `<input type="text">`, `type="search"`, `type="email"`, `type="url"`
- `contenteditable` elements — including Gmail compose, WhatsApp Web message box, LinkedIn post/message editors, and similar complex editors

The button does **not** appear on:

- Password fields
- Read-only or disabled fields
- Non-editable page text
- Partial selections (you must select the full content)
- Fields with fewer than 3 characters of content

---

## Known limitations

- **iframes**: The content script runs in the main frame only (`all_frames: false`). Editable fields inside cross-origin iframes (such as Google Docs) are not supported. Same-origin iframes may work depending on the page.
- **Undo**: The *Apply Result* action replaces field content. In most editors this is undoable with Ctrl+Z. In some React-controlled fields, the undo history may be limited.
- **Clipboard permission**: On first use of *Apply Clipboard Result*, Chrome may display a one-time permission prompt for clipboard read access.
- **SPA navigation**: Detected via `popstate` and a 1.5-second polling fallback. The panel closes on navigation; re-select the text to reopen it.
- **AI chat URL**: The extension only tracks one configured URL. If you use multiple AI chat services, update the URL in settings as needed.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Rewrite button never appears | Confirm the field is editable and you selected **all** text (not partial). Check *Disabled sites* in settings. |
| *Open AI Chat* shows "No AI chat URL set" | Open settings and enter a valid `https://` URL. |
| *Apply Clipboard Result* says "Clipboard is empty" | Make sure you copied the AI's reply before clicking Apply. |
| Panel disappeared after switching tabs | This is expected. Re-select the text in the field to reopen the button, then click *Apply Clipboard Result* — you don't need to re-copy the prompt. |
| Field content not updated in a React app | The extension uses the native value setter to trigger React's event system. If the field still doesn't update, try clicking inside it once after applying. |

---

## Manual test checklist

- [ ] Textarea on a plain HTML page — select all, button appears, panel opens, modes work, Copy Prompt produces a prompt with your About Me text.
- [ ] `input[type=text]` — same flow.
- [ ] Gmail compose window — select all body text, full flow.
- [ ] WhatsApp Web message box — select all, full flow.
- [ ] LinkedIn post/message composer — select all, full flow.
- [ ] Password field — button must NOT appear.
- [ ] Readonly textarea — button must NOT appear.
- [ ] Partial selection — button must NOT appear.
- [ ] Fewer than 3 characters — button must NOT appear.
- [ ] Escape key closes the panel while focus is in the field.
- [ ] Escape key closes the panel while focus is inside the panel.
- [ ] Tab navigation cycles through all panel buttons.
- [ ] *Open AI Chat* with no URL set — status error and settings page opens.
- [ ] *Apply Clipboard Result* with empty clipboard — clear error message.
- [ ] *Apply Clipboard Result* with a result 3x longer than original — confirmation appears.
- [ ] Disabled site (add `example.com` to disabled list) — button never appears on that site.
- [ ] SPA navigation (e.g., switching Gmail conversations) — panel closes automatically.
- [ ] Dark mode — panel and button render correctly.

---

## Development commands

```bash
npm install          # install dependencies
npm run dev          # Vite dev server with HMR (options page only)
npm run build        # typecheck + production build into dist/
npm run typecheck    # tsc --noEmit only
npm run test         # Vitest run (all unit tests)
npm run test:watch   # Vitest watch mode
npm run lint         # ESLint over src/ and tests/
```

---

## Stack

- Manifest V3
- React 18 + TypeScript 5 (strict)
- Vite 5 + `@crxjs/vite-plugin` 2.x
- Vitest + jsdom
- ESLint + `@typescript-eslint`

---

## License

[MIT](LICENSE) — © 2026 Alexis. Provided as-is, no warranties. The authors are not liable for any claim or damages arising from the use of this software.
