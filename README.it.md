[🇬🇧 English](README.md) &nbsp;|&nbsp; **🇮🇹 Italiano**

# Preventivatore Rapido

> App desktop per generare preventivi PDF professionali in pochi minuti — pensata per freelance e piccoli studi italiani.

![Tauri](https://img.shields.io/badge/Tauri-2.11-FFC131?logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Indice

- [Cosa è](#cosa-è)
- [Funzionalità principali](#funzionalità-principali)
- [Stack tecnologico](#stack-tecnologico)
- [Requisiti](#requisiti)
- [Installazione e avvio](#installazione-e-avvio)
- [Configurazione](#configurazione)
- [Come si usa](#come-si-usa)
- [Architettura del progetto](#architettura-del-progetto)
- [Build di release](#build-di-release)
- [Privacy e sicurezza](#privacy-e-sicurezza)
- [Limitazioni note](#limitazioni-note)
- [Roadmap](#roadmap)
- [Licenza](#licenza)

---

## Cosa è

**Preventivatore Rapido** è un'**applicazione desktop nativa** (basata su Tauri) che permette di compilare e generare preventivi PDF dal look professionale, senza usare Word, Excel o gestionali pesanti.

L'app è ottimizzata per il **mercato italiano freelance/PMI**: prezzi calmierati, terminologia adeguata, P.IVA, IVA esclusa, modalità di pagamento all'italiana — tutto pensato per chi lavora a partita IVA come singolo professionista o piccolo studio.

Esistono **due modalità di compilazione** che convivono nella stessa app, scelte da un tab in alto:

1. **Preventivo libero**: form classico mittente / cliente / oggetto / voci / note — pieno controllo manuale, con assistenza AI opzionale.
2. **Wizard sito web**: percorso guidato in 8 step pensato per chi realizza siti con stack **Astro**. Configurazione, design, SEO, manutenzione, sconti — tutto modulare con listino integrato.

I PDF generati sono **stampabili, archiviabili e condivisibili**: tre layout visivamente distinti (Classico / Moderno / Minimale) e 5 colori di accento personalizzabili.

---

## Funzionalità principali

### Form di compilazione

- **Anagrafica mittente** (la tua azienda) — precompilata con dati demo, modificabile, persiste nella sessione
- **Anagrafica cliente** — nome, indirizzo, P.IVA / C.F., email, telefono
- **Oggetto del preventivo** — descrizione breve del progetto, appare prima della tabella nel PDF
- **Tabella voci** con due colonne descrittive (**Voci** = titolo, **Descrizione** = dettaglio esteso)
- **Quantità con unità di misura** scelta a riga (ore, giornate, mesi, lingue, pezzi, parole, forfait)
- **Prezzo unitario** con virgola o punto come decimale, calcolo totale automatico
- **Note finali** testo libero che appare in fondo al PDF (validità, pagamento, IVA, ecc.)
- **Logo aziendale** caricabile come PNG/JPG, embeddato nel PDF mantenendo le proporzioni

### Tre template PDF + accent color

| Template | Stile |
|---|---|
| **Classico** | Sobrio, mittente a destra, titolo grande con sottolineatura colorata |
| **Moderno** | Banda colorata in alto, doppia colonna DA/A, totale in box |
| **Minimale** | Tipografia leggera, hairline, accento solo sul totale |

5 colori di accento: **Indaco · Smeraldo · Ambra · Rosa · Grafite**

Il **titolo del PDF** è personalizzabile (`PREVENTIVO`, `OFFERTA`, `PROPOSTA`…) o può essere nascosto del tutto.

### Assistente AI (DeepSeek)

Un pannello laterale di chat conversazionale alimentato da **DeepSeek API**:

- **Flusso a due fasi**: prima propone le voci in prosa per la tua conferma, poi le genera strutturate solo dopo il tuo via libera
- **Prezzi calmierati** ancorati al mercato italiano IT freelance (tariffa oraria minima 30 €/h, range espliciti per ruolo)
- **Scrittura verbatim**: se detti tu stesso le voci con virgolette o liste numerate, l'AI usa le tue parole esatte
- **Generazione note**: pulsante dedicato nella card Note, con campo "Istruzioni per l'AI" opzionale (es. *"validità 60 gg, IVA al 22%, pagamento bonifico 30 gg"*)
- **Chiave API locale**: salvata solo nel `localStorage` del tuo dispositivo, mai inviata a server terzi

### Wizard sito web (8 step) — pensato per Astro freelance

Percorso guidato per generare preventivi di **sviluppo siti web con stack Astro**:

1. **Tipo di sito** — Landing / Vetrina / Portfolio / Blog / E-commerce
2. **Design** — template, code-only, Figma; logo e brand identity opzionali
3. **Funzionalità extra** — form avanzati, mappa, calendario, area riservata, GDPR, etc.
4. **CMS & contenuti** — Markdown via Git / Decap CMS / Sanity; multilingua i18n
5. **SEO & analytics** — livello base/avanzato + Schema.org + GA4
6. **Configurazione & deploy** — setup hosting/DNS/email + migrazioni (anche da WordPress)
7. **Manutenzione** — pacchetti mensili base/standard/pro con mesi prepagati
8. **Sconti & riepilogo** — cliente ricorrente / no-profit / pagamento anticipato

I prezzi del wizard sono codificati nel [catalog.ts](src/wizard/catalog.ts) e basati su una **fascia bassa-media** del mercato IT, calibrata per essere competitiva senza svendere.

### Storico preventivi

Pannello laterale dedicato che permette di:
- **Salvare** lo stato corrente con un click (label auto-generata: `Mario Rossi · 27/05/2026`)
- **Visualizzare** la lista cronologica con voci, totale e cliente
- **Ricaricare** un preventivo passato per riprenderlo o duplicarlo
- **Eliminare** quelli vecchi

Storage in `localStorage` (limite ~5 MB, cap a 200 preventivi). Nessun cloud sync — i dati restano sul tuo device.

### Generazione PDF nativa

- Quando l'app gira in modalità **desktop (Tauri)**: si apre un **dialog "Salva come" nativo macOS/Windows/Linux** che permette di scegliere cartella e nome file
- Quando gira come **web app pura** (browser): fallback al download standard del browser

---

## Stack tecnologico

| Layer | Tech |
|---|---|
| Frontend | **React 19** + **TypeScript** + **Vite 6** |
| Styling | **Tailwind CSS 4** con palette OKLCH custom e `@theme` v4 |
| Desktop runtime | **Tauri 2** (Rust + WebView nativo del sistema) |
| Icone | **Lucide React 1.x** |
| PDF | **jsPDF 4** + **jspdf-autotable 5** |
| AI | **DeepSeek Chat API** (`deepseek-chat`, JSON mode) |
| Plugin Tauri | `tauri-plugin-dialog`, `tauri-plugin-fs`, `tauri-plugin-log` |
| Persistenza | `localStorage` (storico + chiave API) |

---

## Requisiti

Per **lavorare al codice / fare build**:
- **Node.js** ≥ 18 (consigliato 20+)
- **Rust** ≥ 1.77 + `cargo` (installabile con `rustup`)
- macOS, Windows o Linux

Per **usare la modalità desktop**:
- Su macOS: nulla in più (Xcode CLI tools)
- Su Windows: WebView2 (preinstallato su Win 11)
- Su Linux: `webkit2gtk` + dipendenze GTK standard

Per usare l'**assistente AI**: un account DeepSeek con qualche credito (la chiave si incolla in app la prima volta — link: https://platform.deepseek.com).

---

## Installazione e avvio

```bash
# Clona il repo
git clone https://github.com/Ale9992/Preventivatore.git
cd Preventivatore

# Installa le dipendenze JS
npm install
```

### Modalità web (browser, niente Tauri)

```bash
npm run dev
```

Apre Vite su `http://localhost:3030`. Tutte le feature funzionano, eccetto il dialog "Salva come" nativo (fallback al download del browser).

### Modalità desktop (Tauri)

```bash
npm run tauri:dev
```

Compila il binario Rust (la prima volta richiede 3-5 min), avvia Vite e apre la finestra desktop nativa. Hot-reload attivo sui file frontend.

### Linting / typecheck

```bash
npm run lint
```

---

## Configurazione

### Chiave DeepSeek API

Quando apri il pannello "Assistente AI" per la prima volta, ti viene chiesto di incollare la tua chiave (formato `sk-...`). Viene salvata nel `localStorage` del browser/webview Tauri sotto la chiave `preventivatore-deepseek-key`.

**La chiave non lascia mai il tuo dispositivo, salvo le chiamate dirette a `api.deepseek.com`** per generare voci e note. Niente proxy, niente telemetria.

Per cambiarla, clicca su "Cambia API key" nel footer del pannello AI.

### Personalizzazione

- **Dati mittente di default**: modifica il blocco `useState<Party>(...)` in [src/App.tsx](src/App.tsx#L31-L37) con la tua P.IVA, indirizzo, telefono
- **Identifier Tauri**: cambia `"identifier"` in [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json#L5) (formato Java reverse-DNS, es. `com.tuonome.app`)
- **Listino del wizard**: tutti i prezzi sono in [src/wizard/catalog.ts](src/wizard/catalog.ts) — pacchetti base, extras, design, SEO, configurazione, manutenzione, sconti
- **Prompt AI**: tariffe orarie e range sono nel `SYSTEM_PROMPT` di [src/aiChat.ts](src/aiChat.ts)

---

## Come si usa

### 1. Preventivo libero

Vista di default. Compila in ordine:

1. **Mittente** — i tuoi dati (precompilati con valori demo)
2. **Cliente** — anagrafica del destinatario
3. **Oggetto** — breve descrizione del progetto (1-2 frasi)
4. **Voci** — aggiungi righe con `+ Aggiungi riga`, riempi titolo + dettaglio + qtà + unità + prezzo
5. **Note** — terms standard (validità, pagamento, IVA) o testo libero
6. **Carica Logo** se vuoi personalizzare l'intestazione
7. **Genera PDF** — dialog nativo (Tauri) o download (browser)

### 2. Assistente AI

Per voci complesse o quando vuoi una proposta veloce:

1. Clicca **Assistente AI** (pulsante viola/fucsia)
2. Inserisci la tua chiave DeepSeek (solo la prima volta)
3. Descrivi il progetto: *"Sito vetrina 5 pagine per studio dentistico con form contatti e SEO base"*
4. L'AI risponde con una proposta in prosa con prezzi indicativi
5. Clicca **✓ Conferma e genera** (o scrivi "ok procedi")
6. Le voci strutturate appaiono come card → **Aggiungi al preventivo**

Puoi anche **dettare voci verbatim**: *"Metti queste voci esatte: 1) Setup ambiente — installazione Docker; 2) Workshop UX — 4h con stakeholder"* — l'AI userà le tue parole letterali.

### 3. Wizard sito web

Per chi sviluppa siti Astro come servizio principale:

1. Switch sul tab **Wizard sito web** in alto
2. Step 1 → 8: rispondi alle domande, scegli pacchetti
3. Al riepilogo finale: rivedi le voci con sconti applicati, totale dinamico
4. Click **+ Aggiungi al preventivo** → switch automatico alla view libera per finalizzare cliente/note

### 4. Storico

1. Click su **Storico** (pulsante con icona archivio, ambra)
2. **Salva preventivo attuale** in alto per snapshot
3. Lista sotto: ogni voce mostra cliente, totale, data
4. **Carica** ripristina tutto lo stato (sender, client, items, logo, settings PDF)
5. **Elimina** rimuove dalla cronologia (conferma con dialog nativo)

### 5. Impostazioni PDF

Click sul pulsante **Impostazioni** (icona ingranaggio):

- **Layout** — Classico / Moderno / Minimale (anteprima nella scelta)
- **Titolo PDF** — testo personalizzato o vuoto per nascondere
- **Colore accento** — 5 preset, applicato a header, tabella, totale

---

## Architettura del progetto

```
preventivatore-rapido/
├── src/                          # Frontend React
│   ├── App.tsx                   # Componente root: stato globale, layout, tab toggle
│   ├── main.tsx                  # Entry point Vite
│   ├── index.css                 # Tailwind + theme tokens OKLCH + body gradient
│   ├── pdfTemplates.ts           # 3 funzioni render PDF + types Item/Party/PdfPayload
│   ├── aiChat.ts                 # Client DeepSeek + system prompts (items + notes)
│   ├── AiPanel.tsx               # Drawer chat assistente AI
│   ├── HistoryPanel.tsx          # Drawer storico preventivi
│   ├── storage.ts                # localStorage layer per storico
│   └── wizard/
│       ├── types.ts              # WizardState + tipi (SiteType, DesignApproach, ...)
│       ├── catalog.ts            # Listino prezzi + builder voci da stato wizard
│       └── Wizard.tsx            # Componente stepper + 8 step UI
│
├── src-tauri/                    # Backend Rust per app desktop
│   ├── src/
│   │   ├── main.rs               # Entry point binario
│   │   └── lib.rs                # Builder Tauri + registrazione plugin
│   ├── icons/                    # Set completo icone multi-piattaforma
│   ├── capabilities/default.json # Permessi runtime (dialog:save, fs:write-file, scope)
│   ├── Cargo.toml                # Dipendenze Rust
│   └── tauri.conf.json           # Config app (finestra, bundle, identifier)
│
├── index.html                    # HTML root
├── vite.config.ts                # Config Vite + Tailwind plugin
├── tsconfig.json                 # Config TypeScript
├── package.json                  # Script npm: dev, build, tauri:dev, tauri:build, lint
└── logo.png                      # Sorgente per generazione icone (tauri icon)
```

### Flusso dati principale

```
[utente compila form]
         ↓
[App.tsx state: sender, client, items, notes, project, logo, settings]
         ↓
[click "Genera PDF"]
         ↓
[generatePDF()]
         ↓
[renderTemplate(template, doc, payload)]   ← pdfTemplates.ts
         ↓
[se Tauri → plugin-dialog save() → plugin-fs writeFile()]
[se browser → doc.save()]
```

### Flusso AI

```
[utente apre AiPanel, scrive descrizione]
         ↓
[callDeepseek(history, apiKey)]   ← aiChat.ts
         ↓
[POST api.deepseek.com/chat/completions con system + history + JSON mode]
         ↓
[parsing + validation]
         ↓
[Fase 1: proposta prosa con awaitingConfirmation: true]
         ↓ utente conferma
[Fase 2: items strutturati]
         ↓
[applyAiItems → mergeItems → setItems]
```

---

## Build di release

Per generare i bundle di distribuzione (`.app`, `.dmg`, `.exe`, `.msi`, `.AppImage`, `.deb`):

```bash
npm run tauri:build
```

Output in `src-tauri/target/release/bundle/`:

- **macOS**: `.app` (~6 MB) + `.dmg` installer + `.app.tar.gz` per distribuzione
- **Windows**: `.exe` + `.msi`
- **Linux**: `.AppImage` + `.deb`

Prima compilazione: 5-10 minuti. Compilazioni successive (cache LTO): 1-3 minuti.

> **Nota macOS**: il bundle non è firmato con un Developer ID Apple. Al primo avvio mostra "Non posso aprire perché non si può verificare lo sviluppatore" — soluzione: **tasto destro → Apri** una volta sola. Per distribuzione "pulita" senza warning servono un Apple Developer Program ($99/anno) + processo di notarization.

---

## Privacy e sicurezza

- **100% locale**: i dati del preventivo (mittente, cliente, voci, logo) restano nel browser/app, mai inviati a server terzi
- **Storico**: salvato in `localStorage` del dispositivo, non sincronizzato altrove
- **Chiave API DeepSeek**: salvata in `localStorage`, usata solo per chiamate dirette a `api.deepseek.com` (Bearer token in header)
- **Nessuna telemetria**: l'app non invia analytics, tracking, error reporting
- **Permessi Tauri minimi**: solo `dialog:allow-save` e `fs:allow-write-file` (con scope ristretto a `$DOCUMENT`, `$DESKTOP`, `$DOWNLOAD`, `$HOME`)

---

## Limitazioni note

- **Storico capped a ~5 MB** (localStorage). Loghi grossi (PNG ~1 MB) riducono la capacità a ~15-30 preventivi salvati. Senza logo si arriva a 100+.
- **Nessuna sincronizzazione cloud**: lo storico è legato al singolo device. Cambiare Mac/Windows = perdere lo storico (salvo esportare manualmente).
- **PDF a pagina singola**: i template non supportano automaticamente lo "split" multi-pagina per preventivi con molte voci. Voci troppe → overflow visibile.
- **AI dipende da DeepSeek**: senza credito sull'account DeepSeek o offline, il pannello AI non funziona (manuale resta utilizzabile).
- **macOS non firmato**: il bundle `.dmg` richiede "tasto destro → Apri" la prima volta.

---

## Roadmap

Idee per future iterazioni (nessuna garanzia):

- [ ] Export storico in JSON / re-import su altro device
- [ ] Sincronizzazione opzionale via Tauri Store + cartella scelta dall'utente
- [ ] Multi-pagina automatico nei PDF (con header/footer ripetuti)
- [ ] Importazione anagrafica cliente da vCard o LinkedIn URL
- [ ] Generazione automatica del numero progressivo preventivo
- [ ] Template PDF personalizzabili (override CSS-like via JSON)
- [ ] Plugin per integrare provider AI alternativi (Anthropic, OpenAI, Mistral)
- [ ] Codesign + notarization macOS

---

## Licenza

MIT — vedi [LICENSE](LICENSE).

In sintesi: usa, modifica, ridistribuisci anche per uso commerciale, ma niente garanzie.

---

## Autore

Progetto creato da [@Ale9992](https://github.com/Ale9992) come tool personale per il mio lavoro da freelance, poi reso pubblico.

Contributi, segnalazioni bug e suggerimenti benvenuti tramite [Issues](https://github.com/Ale9992/Preventivatore/issues).
