<p align="right"><strong>🇬🇧 English</strong> · <a href="README.it.md">🇮🇹 Italiano</a></p>

# Preventivatore Rapido

> Desktop app to generate professional quote/invoice PDFs in minutes — built for Italian freelancers and small studios.

![Tauri](https://img.shields.io/badge/Tauri-2.11-FFC131?logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of contents

- [What it is](#what-it-is)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Install and run](#install-and-run)
- [Configuration](#configuration)
- [How to use it](#how-to-use-it)
- [Project architecture](#project-architecture)
- [Release build](#release-build)
- [Privacy and security](#privacy-and-security)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## What it is

**Preventivatore Rapido** ("Quick Quoter") is a **native desktop application** (built with Tauri) that lets you fill in and generate professional-looking quote PDFs without touching Word, Excel or heavyweight business software.

The app is tuned for the **Italian freelance/SME market**: realistic pricing, the right terminology, VAT number (P.IVA), VAT-excluded amounts, Italian-style payment terms — everything designed for sole traders and small studios working under a partita IVA.

There are **two compilation modes** that live in the same app, switched from a tab at the top:

1. **Free quote**: a classic form — sender / client / subject / line items / notes — full manual control, with optional AI assistance.
2. **Website wizard**: an 8-step guided flow built for people who deliver websites on the **Astro** stack. Configuration, design, SEO, maintenance, discounts — all modular with a built-in price list.

The generated PDFs are **printable, archivable and shareable**: three visually distinct layouts (Classic / Modern / Minimal) and 5 customizable accent colors.

---

## Key features

### Compilation form

- **Sender details** (your company) — pre-filled with demo data, editable, persists across the session
- **Client details** — name, address, VAT/tax code, email, phone
- **Quote subject** — a short project description shown before the table in the PDF
- **Line items table** with two descriptive columns (**Item** = title, **Description** = extended detail)
- **Quantity with unit of measure** chosen per row (hours, days, months, languages, pieces, words, flat rate)
- **Unit price** accepting comma or dot as the decimal separator, with automatic total calculation
- **Final notes** — free text shown at the bottom of the PDF (validity, payment, VAT, etc.)
- **Company logo** uploadable as PNG/JPG, embedded into the PDF while keeping its aspect ratio

### Three PDF templates + accent color

| Template | Style |
|---|---|
| **Classic** | Understated, sender on the right, large title with a colored underline |
| **Modern** | Colored band at the top, two-column FROM/TO, total in a box |
| **Minimal** | Light typography, hairlines, accent only on the total |

5 accent colors: **Indigo · Emerald · Amber · Pink · Graphite**

The **PDF title** is customizable (`QUOTE`, `OFFER`, `PROPOSAL`…) or can be hidden entirely.

### AI assistant (DeepSeek)

A conversational chat side panel powered by the **DeepSeek API**:

- **Two-phase flow**: first it proposes the line items in prose for you to confirm, then it generates them in structured form only after your go-ahead
- **Realistic pricing** anchored to the Italian IT freelance market (minimum hourly rate €30/h, explicit ranges per role)
- **Verbatim writing**: if you dictate the items yourself using quotes or numbered lists, the AI uses your exact words
- **Notes generation**: a dedicated button in the Notes card, with an optional "Instructions for the AI" field (e.g. *"60-day validity, 22% VAT, bank transfer payment within 30 days"*)
- **Local API key**: stored only in your device's `localStorage`, never sent to third-party servers

### Website wizard (8 steps) — built for Astro freelancers

A guided flow to generate quotes for **website development on the Astro stack**:

1. **Site type** — Landing / Showcase / Portfolio / Blog / E-commerce
2. **Design** — template, code-only, Figma; logo and brand identity optional
3. **Extra features** — advanced forms, map, calendar, members area, GDPR, etc.
4. **CMS & content** — Markdown via Git / Decap CMS / Sanity; i18n multilingual
5. **SEO & analytics** — basic/advanced level + Schema.org + GA4
6. **Configuration & deploy** — hosting/DNS/email setup + migrations (including from WordPress)
7. **Maintenance** — monthly base/standard/pro packages with prepaid months
8. **Discounts & summary** — recurring client / non-profit / advance payment

Wizard prices are hardcoded in [catalog.ts](src/wizard/catalog.ts) and based on a **low-to-mid band** of the IT market, calibrated to be competitive without underselling.

### Quote history

A dedicated side panel that lets you:
- **Save** the current state with one click (auto-generated label: `Mario Rossi · 27/05/2026`)
- **View** the chronological list with items, total and client
- **Reload** a past quote to resume or duplicate it
- **Delete** old ones

Storage in `localStorage` (~5 MB limit, capped at 200 quotes). No cloud sync — your data stays on your device.

### Native PDF generation

- When the app runs in **desktop mode (Tauri)**: it opens a **native macOS/Windows/Linux "Save as" dialog** to choose folder and file name
- When it runs as a **pure web app** (browser): it falls back to the standard browser download

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | **React 19** + **TypeScript** + **Vite 6** |
| Styling | **Tailwind CSS 4** with custom OKLCH palette and v4 `@theme` |
| Desktop runtime | **Tauri 2** (Rust + the system's native WebView) |
| Icons | **Lucide React 1.x** |
| PDF | **jsPDF 4** + **jspdf-autotable 5** |
| AI | **DeepSeek Chat API** (`deepseek-chat`, JSON mode) |
| Tauri plugins | `tauri-plugin-dialog`, `tauri-plugin-fs`, `tauri-plugin-log` |
| Persistence | `localStorage` (history + API key) |

---

## Requirements

To **work on the code / build**:
- **Node.js** ≥ 18 (20+ recommended)
- **Rust** ≥ 1.77 + `cargo` (installable via `rustup`)
- macOS, Windows or Linux

To **use desktop mode**:
- On macOS: nothing extra (Xcode CLI tools)
- On Windows: WebView2 (pre-installed on Win 11)
- On Linux: `webkit2gtk` + standard GTK dependencies

To use the **AI assistant**: a DeepSeek account with some credit (you paste the key into the app the first time — link: https://platform.deepseek.com).

---

## Install and run

```bash
# Clone the repo
git clone https://github.com/Ale9992/Preventivatore.git
cd Preventivatore

# Install JS dependencies
npm install
```

### Web mode (browser, no Tauri)

```bash
npm run dev
```

Opens Vite at `http://localhost:3030`. All features work, except the native "Save as" dialog (it falls back to the browser download).

### Desktop mode (Tauri)

```bash
npm run tauri:dev
```

Compiles the Rust binary (3-5 min the first time), starts Vite and opens the native desktop window. Hot-reload is active on frontend files.

### Linting / typecheck

```bash
npm run lint
```

---

## Configuration

### DeepSeek API key

When you open the "AI assistant" panel for the first time, you're asked to paste your key (format `sk-...`). It's stored in the browser/Tauri webview `localStorage` under the key `preventivatore-deepseek-key`.

**The key never leaves your device, except for the direct calls to `api.deepseek.com`** to generate items and notes. No proxy, no telemetry.

To change it, click "Change API key" in the footer of the AI panel.

### Customization

- **Default sender data**: edit the `useState<Party>(...)` block in [src/App.tsx](src/App.tsx#L31-L37) with your VAT number, address, phone
- **Tauri identifier**: change `"identifier"` in [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json#L5) (reverse-DNS Java format, e.g. `com.yourname.app`)
- **Wizard price list**: all prices are in [src/wizard/catalog.ts](src/wizard/catalog.ts) — base packages, extras, design, SEO, configuration, maintenance, discounts
- **AI prompt**: hourly rates and ranges are in the `SYSTEM_PROMPT` of [src/aiChat.ts](src/aiChat.ts)

---

## How to use it

### 1. Free quote

The default view. Fill in, in order:

1. **Sender** — your data (pre-filled with demo values)
2. **Client** — the recipient's details
3. **Subject** — a short project description (1-2 sentences)
4. **Items** — add rows with `+ Add row`, fill in title + detail + qty + unit + price
5. **Notes** — standard terms (validity, payment, VAT) or free text
6. **Upload Logo** if you want to personalize the header
7. **Generate PDF** — native dialog (Tauri) or download (browser)

### 2. AI assistant

For complex items or when you want a quick proposal:

1. Click **AI assistant** (purple/fuchsia button)
2. Enter your DeepSeek key (first time only)
3. Describe the project: *"5-page showcase site for a dental practice with a contact form and basic SEO"*
4. The AI replies with a prose proposal including indicative prices
5. Click **✓ Confirm and generate** (or write "ok go ahead")
6. The structured items appear as cards → **Add to quote**

You can also **dictate items verbatim**: *"Use these exact items: 1) Environment setup — Docker installation; 2) UX workshop — 4h with stakeholders"* — the AI will use your literal words.

### 3. Website wizard

For people who develop Astro sites as their core service:

1. Switch to the **Website wizard** tab at the top
2. Step 1 → 8: answer the questions, pick packages
3. At the final summary: review the items with discounts applied, dynamic total
4. Click **+ Add to quote** → automatic switch to the free view to finalize client/notes

### 4. History

1. Click **History** (archive icon button, amber)
2. **Save current quote** at the top for a snapshot
3. List below: each entry shows client, total, date
4. **Load** restores the whole state (sender, client, items, logo, PDF settings)
5. **Delete** removes it from history (confirmed with a native dialog)

### 5. PDF settings

Click the **Settings** button (gear icon):

- **Layout** — Classic / Modern / Minimal (preview in the selector)
- **PDF title** — custom text or empty to hide it
- **Accent color** — 5 presets, applied to header, table, total

---

## Project architecture

```
preventivatore-rapido/
├── src/                          # React frontend
│   ├── App.tsx                   # Root component: global state, layout, tab toggle
│   ├── main.tsx                  # Vite entry point
│   ├── index.css                 # Tailwind + OKLCH theme tokens + body gradient
│   ├── pdfTemplates.ts           # 3 PDF render functions + Item/Party/PdfPayload types
│   ├── aiChat.ts                 # DeepSeek client + system prompts (items + notes)
│   ├── AiPanel.tsx               # AI assistant chat drawer
│   ├── HistoryPanel.tsx          # Quote history drawer
│   ├── storage.ts                # localStorage layer for history
│   └── wizard/
│       ├── types.ts              # WizardState + types (SiteType, DesignApproach, ...)
│       ├── catalog.ts            # Price list + item builder from wizard state
│       └── Wizard.tsx            # Stepper component + 8-step UI
│
├── src-tauri/                    # Rust backend for the desktop app
│   ├── src/
│   │   ├── main.rs               # Binary entry point
│   │   └── lib.rs                # Tauri builder + plugin registration
│   ├── icons/                    # Full multi-platform icon set
│   ├── capabilities/default.json # Runtime permissions (dialog:save, fs:write-file, scope)
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # App config (window, bundle, identifier)
│
├── index.html                    # HTML root
├── vite.config.ts                # Vite config + Tailwind plugin
├── tsconfig.json                 # TypeScript config
├── package.json                  # npm scripts: dev, build, tauri:dev, tauri:build, lint
└── logo.png                      # Source for icon generation (tauri icon)
```

### Main data flow

```
[user fills the form]
         ↓
[App.tsx state: sender, client, items, notes, project, logo, settings]
         ↓
[click "Generate PDF"]
         ↓
[generatePDF()]
         ↓
[renderTemplate(template, doc, payload)]   ← pdfTemplates.ts
         ↓
[if Tauri → plugin-dialog save() → plugin-fs writeFile()]
[if browser → doc.save()]
```

### AI flow

```
[user opens AiPanel, writes a description]
         ↓
[callDeepseek(history, apiKey)]   ← aiChat.ts
         ↓
[POST api.deepseek.com/chat/completions with system + history + JSON mode]
         ↓
[parsing + validation]
         ↓
[Phase 1: prose proposal with awaitingConfirmation: true]
         ↓ user confirms
[Phase 2: structured items]
         ↓
[applyAiItems → mergeItems → setItems]
```

---

## Release build

To generate the distribution bundles (`.app`, `.dmg`, `.exe`, `.msi`, `.AppImage`, `.deb`):

```bash
npm run tauri:build
```

Output in `src-tauri/target/release/bundle/`:

- **macOS**: `.app` (~6 MB) + `.dmg` installer + `.app.tar.gz` for distribution
- **Windows**: `.exe` + `.msi`
- **Linux**: `.AppImage` + `.deb`

First build: 5-10 minutes. Subsequent builds (LTO cache): 1-3 minutes.

> **macOS note**: the bundle is not signed with an Apple Developer ID. On first launch it shows "cannot be opened because the developer cannot be verified" — fix: **right-click → Open** once. For a "clean" distribution without warnings you need an Apple Developer Program membership ($99/year) + a notarization process.

---

## Privacy and security

- **100% local**: quote data (sender, client, items, logo) stays in the browser/app, never sent to third-party servers
- **History**: saved in the device's `localStorage`, not synced anywhere
- **DeepSeek API key**: stored in `localStorage`, used only for direct calls to `api.deepseek.com` (Bearer token in the header)
- **No telemetry**: the app sends no analytics, tracking or error reporting
- **Minimal Tauri permissions**: only `dialog:allow-save` and `fs:allow-write-file` (with scope restricted to `$DOCUMENT`, `$DESKTOP`, `$DOWNLOAD`, `$HOME`)

---

## Known limitations

- **History capped at ~5 MB** (localStorage). Large logos (PNG ~1 MB) cut capacity to ~15-30 saved quotes. Without a logo you can reach 100+.
- **No cloud sync**: history is tied to a single device. Switching Mac/Windows = losing history (unless you export manually).
- **Single-page PDF**: templates don't automatically support multi-page "split" for quotes with many items. Too many items → visible overflow.
- **AI depends on DeepSeek**: with no credit on the DeepSeek account or offline, the AI panel doesn't work (the manual flow still does).
- **Unsigned macOS**: the `.dmg` bundle requires "right-click → Open" the first time.

---

## Roadmap

Ideas for future iterations (no guarantees):

- [ ] Export history to JSON / re-import on another device
- [ ] Optional sync via Tauri Store + a user-chosen folder
- [ ] Automatic multi-page PDFs (with repeated header/footer)
- [ ] Import client details from a vCard or LinkedIn URL
- [ ] Automatic generation of the progressive quote number
- [ ] Customizable PDF templates (CSS-like override via JSON)
- [ ] Plugin to integrate alternative AI providers (Anthropic, OpenAI, Mistral)
- [ ] macOS codesign + notarization

---

## License

MIT — see [LICENSE](LICENSE).

In short: use, modify and redistribute it, including for commercial use, but with no warranty.

---

## Author

Project created by [@Ale9992](https://github.com/Ale9992) as a personal tool for my freelance work, then made public.

Contributions, bug reports and suggestions are welcome via [Issues](https://github.com/Ale9992/Preventivatore/issues).
