/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, ChangeEvent } from 'react';
import {
  Plus, Trash2, Download, Upload, Building2, User, FileText,
  Settings as SettingsIcon, Check, Sparkles, StickyNote, Loader2, AlertCircle, Briefcase, Archive
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  renderTemplate, parseNum,
  type Item, type Party, type TemplateId, type RGB
} from './pdfTemplates';
import { AiPanel } from './AiPanel';
import { generateNotes, readApiKey, type AiItem } from './aiChat';
import { Wizard } from './wizard/Wizard';
import { HistoryPanel } from './HistoryPanel';
import { makeLabel, type SavedQuote } from './storage';

const fmtEUR = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

type AccentId = 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'classic', label: 'Classico', desc: 'Sobrio, mittente a destra, riga colorata sotto al titolo' },
  { id: 'modern',  label: 'Moderno',  desc: 'Banda colorata in alto, doppia colonna DA/A, totale in box' },
  { id: 'minimal', label: 'Minimale', desc: 'Tipografia leggera, hairline, accento solo sul totale' }
];

const ACCENTS: { id: AccentId; label: string; hex: string; rgb: RGB }[] = [
  { id: 'indigo',  label: 'Indaco',   hex: '#6366f1', rgb: [99, 102, 241] },
  { id: 'emerald', label: 'Smeraldo', hex: '#10b981', rgb: [16, 185, 129] },
  { id: 'amber',   label: 'Ambra',    hex: '#f59e0b', rgb: [245, 158, 11] },
  { id: 'rose',    label: 'Rosa',     hex: '#f43f5e', rgb: [244, 63, 94] },
  { id: 'slate',   label: 'Grafite',  hex: '#475569', rgb: [71, 85, 105] }
];

export default function App() {
  // --- STATE ---
  const [sender, setSender] = useState<Party>({
    name: 'La Mia Azienda S.r.l.',
    address: 'Via Roma 123, 00100 Roma (RM)',
    vat: 'IT12345678901',
    email: 'info@lamiaazienda.it',
    phone: '+39 06 1234567'
  });

  const [client, setClient] = useState<Party>({
    name: '',
    address: '',
    vat: '',
    email: '',
    phone: ''
  });

  const [items, setItems] = useState<Item[]>([
    { id: crypto.randomUUID(), description: '', details: '', quantity: '1', unit: '', price: '' }
  ]);

  const [logo, setLogo] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [project, setProject] = useState<string>('');

  // --- SETTINGS ---
  const [template, setTemplate] = useState<TemplateId>('classic');
  const [accent, setAccent] = useState<AccentId>('indigo');
  const [pdfTitle, setPdfTitle] = useState<string>('PREVENTIVO');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // --- VIEW MODE ---
  const [view, setView] = useState<'free' | 'wizard'>('free');

  // --- AI ASSISTANT ---
  const [aiOpen, setAiOpen] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesPrompt, setNotesPrompt] = useState<string>('');

  // --- HISTORY ---
  const [historyOpen, setHistoryOpen] = useState(false);

  const buildSnapshot = () => ({
    sender, client, items, logo, notes, project,
    template, accent, pdfTitle,
    label: makeLabel(client)
  });

  const loadFromSaved = (q: SavedQuote) => {
    setSender(q.sender);
    setClient(q.client);
    setItems(q.items.length > 0 ? q.items : [{ id: crypto.randomUUID(), description: '', details: '', quantity: '1', unit: '', price: '' }]);
    setLogo(q.logo);
    setNotes(q.notes || '');
    setProject(q.project || '');
    setPdfTitle(q.pdfTitle || 'PREVENTIVO');
    if (TEMPLATES.some(t => t.id === q.template)) setTemplate(q.template as TemplateId);
    if (ACCENTS.some(a => a.id === q.accent)) setAccent(q.accent as AccentId);
    setView('free');
  };

  const handleGenerateNotes = async () => {
    const apiKey = readApiKey();
    if (!apiKey) {
      setAiOpen(true);
      setNotesError('Imposta prima la API key dall\'Assistente AI, poi riprova.');
      return;
    }
    if (notesLoading) return;
    setNotesLoading(true);
    setNotesError(null);
    try {
      const generated = await generateNotes(
        { items, total, senderName: sender.name, instruction: notesPrompt },
        apiKey
      );
      setNotes(generated);
    } catch (e: any) {
      setNotesError(e?.message || String(e));
    } finally {
      setNotesLoading(false);
    }
  };

  const mergeItems = (newItems: Item[]) => {
    const onlyEmptyDefault =
      items.length === 1 && !items[0].description && !items[0].details && !items[0].price && !items[0].unit;
    setItems(onlyEmptyDefault ? newItems : [...items, ...newItems]);
  };

  const applyAiItems = (aiItems: AiItem[]) => {
    const newItems: Item[] = aiItems.map(it => ({
      id: crypto.randomUUID(),
      description: it.description,
      details: it.details || '',
      quantity: it.quantity || '1',
      unit: it.unit || '',
      price: it.price || ''
    }));
    mergeItems(newItems);
    setAiOpen(false);
  };

  const applyWizardItems = (wizItems: Item[]) => {
    mergeItems(wizItems);
    setView('free');
  };

  useEffect(() => {
    if (!settingsOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [settingsOpen]);

  // --- HANDLERS ---
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = () =>
    setItems([...items, { id: crypto.randomUUID(), description: '', details: '', quantity: '1', unit: '', price: '' }]);

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Item, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // --- CALCULATIONS ---
  const total = useMemo(
    () => items.reduce((acc, item) => acc + parseNum(item.quantity) * parseNum(item.price), 0),
    [items]
  );

  // --- PDF GENERATION ---
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  const generatePDF = async () => {
    const doc = new jsPDF();
    const accentRgb = ACCENTS.find(a => a.id === accent)!.rgb;
    renderTemplate(template, doc, { sender, client, items, total, logo, accent: accentRgb, notes, project, title: pdfTitle });

    const fileName = `Preventivo_${client.name.replace(/\s+/g, '_') || 'Senza_Nome'}.pdf`;

    if (isTauri) {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      const path = await save({
        title: 'Salva preventivo',
        defaultPath: fileName,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      });
      if (!path) return;
      const bytes = new Uint8Array(doc.output('arraybuffer'));
      await writeFile(path, bytes);
    } else {
      doc.save(fileName);
    }
  };

  // --- UI HELPERS ---
  const inputCls =
    "w-full px-3.5 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 " +
    "shadow-xs focus:bg-white focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 focus:outline-none " +
    "transition-all duration-200";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto">

        {/* ===== VIEW TABS ===== */}
        <div className="mb-6 inline-flex p-1 bg-white/60 backdrop-blur rounded-xl border border-slate-200/70 shadow-xs">
          <button
            onClick={() => setView('free')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'free'
                ? 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Preventivo libero
          </button>
          <button
            onClick={() => setView('wizard')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              view === 'wizard'
                ? 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} /> Wizard sito web
          </button>
        </div>

        {view === 'wizard' ? (
          <Wizard onApply={applyWizardItems} />
        ) : (<>

        {/* ===== ACTIONS BAR ===== */}
        <header className="mb-8 flex items-center justify-start gap-3 flex-wrap">
          <label className="group cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur border border-slate-200 text-slate-700 hover:border-brand-400 hover:text-brand-700 shadow-xs hover:shadow-sm transition-all">
            <Upload size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{logo ? 'Cambia Logo' : 'Carica Logo'}</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>

          <button
            onClick={generatePDF}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold
                       bg-gradient-to-br from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700
                       shadow-glow hover:shadow-lg active:scale-[0.98] transition-all"
          >
            <Download size={16} />
            Genera PDF
          </button>

          <button
            onClick={() => setAiOpen(true)}
            className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold
                       bg-gradient-to-br from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700
                       shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
            <Sparkles size={16} />
            Assistente AI
          </button>

          <button
            onClick={() => setHistoryOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 shadow-xs hover:shadow-sm transition-all"
          >
            <Archive size={16} />
            <span className="text-sm font-medium">Storico</span>
          </button>

          {/* Settings */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              aria-expanded={settingsOpen}
              aria-haspopup="dialog"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur border text-slate-700 shadow-xs hover:shadow-sm transition-all ${
                settingsOpen ? 'border-brand-400 text-brand-700' : 'border-slate-200 hover:border-brand-400 hover:text-brand-700'
              }`}
            >
              <SettingsIcon size={16} />
              <span className="text-sm font-medium">Impostazioni</span>
            </button>

            {settingsOpen && (
              <div
                role="dialog"
                className="absolute z-50 mt-2 left-0 w-80 sm:w-96 p-5 rounded-2xl bg-white shadow-xl border border-slate-200/80 backdrop-blur"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Layout PDF</div>
                <div className="space-y-2 mb-5">
                  {TEMPLATES.map(t => {
                    const selected = template === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-start gap-3 ${
                          selected
                            ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          selected ? 'bg-brand-500 text-white' : 'border-2 border-slate-300'
                        }`}>
                          {selected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-800">{t.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-snug">{t.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Titolo PDF</div>
                <div className="mb-5">
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="Lascia vuoto per nascondere"
                    maxLength={40}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none transition-all"
                  />
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                    <span>Es: PREVENTIVO, OFFERTA, PROPOSTA — vuoto per nascondere</span>
                    {pdfTitle && (
                      <button
                        onClick={() => setPdfTitle('')}
                        className="text-slate-500 hover:text-red-500 transition-colors"
                      >
                        Nascondi
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Colore Accento</div>
                <div className="flex items-center gap-2.5">
                  {ACCENTS.map(a => {
                    const selected = accent === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAccent(a.id)}
                        title={a.label}
                        aria-label={a.label}
                        className={`relative w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                          selected ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                        }`}
                        style={{ background: a.hex }}
                      >
                        {selected && (
                          <Check size={14} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ===== LOGO PREVIEW (when present) ===== */}
        {logo && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-slate-200/70 max-w-md">
            <img src={logo} alt="Logo" className="h-10 w-auto rounded-md object-contain" />
            <div className="text-sm text-slate-600 flex-1">Logo caricato e pronto</div>
            <button
              onClick={() => setLogo(null)}
              className="text-slate-400 hover:text-red-500 transition-colors"
              aria-label="Rimuovi logo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* ===== PARTY CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Sender */}
          <section className="relative group">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/70 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">Mittente</div>
                    <div className="text-sm font-medium text-slate-700">I tuoi dati</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <input className={inputCls} placeholder="Nome Azienda"
                  value={sender.name}
                  onChange={(e) => setSender({ ...sender, name: e.target.value })} />
                <input className={inputCls} placeholder="Indirizzo"
                  value={sender.address}
                  onChange={(e) => setSender({ ...sender, address: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="P.IVA"
                    value={sender.vat}
                    onChange={(e) => setSender({ ...sender, vat: e.target.value })} />
                  <input className={inputCls} placeholder="Telefono"
                    value={sender.phone}
                    onChange={(e) => setSender({ ...sender, phone: e.target.value })} />
                </div>
                <input type="email" className={inputCls} placeholder="Email"
                  value={sender.email}
                  onChange={(e) => setSender({ ...sender, email: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Client */}
          <section className="relative group">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/70 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Cliente</div>
                    <div className="text-sm font-medium text-slate-700">A chi è rivolto</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <input className={inputCls} placeholder="Nome / Ragione Sociale"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })} />
                <input className={inputCls} placeholder="Indirizzo"
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="P.IVA / C.F."
                    value={client.vat}
                    onChange={(e) => setClient({ ...client, vat: e.target.value })} />
                  <input className={inputCls} placeholder="Telefono"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })} />
                </div>
                <input type="email" className={inputCls} placeholder="Email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })} />
              </div>
            </div>
          </section>
        </div>

        {/* ===== PROJECT / OGGETTO ===== */}
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden mb-6">
          <header className="px-6 py-4 flex items-center gap-2.5 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Briefcase size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800">Oggetto del preventivo</div>
              <div className="text-xs text-slate-500">Breve descrizione del progetto, apparirà sopra alle voci nel PDF</div>
            </div>
            {project && (
              <span className="text-[11px] text-slate-400 tabular-nums">
                {project.length} caratteri
              </span>
            )}
          </header>
          <div className="p-4">
            <textarea
              value={project}
              onChange={(e) => setProject(e.target.value)}
              rows={2}
              placeholder="Es: Sviluppo nuovo sito vetrina con sezione blog e form contatti per studio dentistico"
              className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm resize-y min-h-[64px] focus:bg-white focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 focus:outline-none transition-all"
            />
          </div>
        </section>

        {/* ===== ITEMS TABLE ===== */}
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Voci del preventivo</div>
                <div className="text-xs text-slate-500">Aggiungi le righe da fatturare</div>
              </div>
            </div>
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-sm font-medium transition-colors"
            >
              <Plus size={15} /> Aggiungi riga
            </button>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/60">
                  <th className="py-3 px-6 w-[26%]">Voci</th>
                  <th className="py-3 px-3 w-[36%]">Descrizione</th>
                  <th className="py-3 px-3 text-center">Qtà</th>
                  <th className="py-3 px-3 text-right">Prezzo Unit.</th>
                  <th className="py-3 px-3 text-right">Totale</th>
                  <th className="py-3 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={item.id} className="group hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-6 align-top">
                      <div className="flex items-start gap-2.5 pt-1">
                        <span className="w-6 h-6 shrink-0 rounded-md bg-slate-100 text-slate-500 text-xs font-medium flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Es: Consulenza Marketing"
                          className="w-full px-2 py-1.5 bg-transparent rounded-md border border-transparent group-hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15 focus:outline-none transition-all font-medium"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <textarea
                        rows={1}
                        placeholder="Dettagli aggiuntivi (opzionale)"
                        className="w-full px-2 py-1.5 bg-transparent rounded-md border border-transparent group-hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15 focus:outline-none transition-all resize-y text-sm text-slate-600 leading-snug min-h-[36px]"
                        value={item.details}
                        onChange={(e) => updateItem(item.id, 'details', e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-3 align-top pt-4">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="1"
                        className="w-20 mx-auto px-2 py-1.5 bg-transparent rounded-md border border-transparent group-hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15 focus:outline-none text-center transition-all block"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        title="Unità di misura"
                        className="w-20 mx-auto mt-1 px-1.5 py-0.5 bg-transparent rounded-md border border-transparent group-hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none text-center text-[11px] text-slate-500 transition-all block cursor-pointer"
                      >
                        <option value="">unità</option>
                        <option value="ore">ore</option>
                        <option value="gg">giornate</option>
                        <option value="mesi">mesi</option>
                        <option value="lingue">lingue</option>
                        <option value="pz">pezzi</option>
                        <option value="parole">parole</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center justify-end gap-1 pt-1">
                        <span className="text-slate-400 text-sm">€</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0,00"
                          className="w-24 px-2 py-1.5 bg-transparent rounded-md border border-transparent group-hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15 focus:outline-none text-right transition-all"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800 tabular-nums align-top pt-4">
                      {fmtEUR(parseNum(item.quantity) * parseNum(item.price))}
                    </td>
                    <td className="py-3 px-4 text-right align-top">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        disabled={items.length === 1}
                        aria-label="Rimuovi riga"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-brand-50/40 border-t border-slate-100 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-6">
            <span className="text-sm text-slate-500 font-medium">Totale Netto</span>
            <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent tabular-nums">
              {fmtEUR(total)}
            </span>
          </div>
        </section>

        {/* ===== NOTES ===== */}
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden mt-6">
          <header className="px-6 py-4 flex items-center gap-2.5 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <StickyNote size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800">Note</div>
              <div className="text-xs text-slate-500">Testo libero che apparirà in fondo al PDF</div>
            </div>
            {notes && (
              <span className="text-[11px] text-slate-400 tabular-nums">
                {notes.length} caratteri
              </span>
            )}
          </header>
          <div className="p-4 space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Scrivi liberamente, oppure usa il campo qui sotto per dare istruzioni all'AI e poi clicca Genera."
              className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm resize-y min-h-[100px] focus:bg-white focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 focus:outline-none transition-all"
            />

            <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/60 to-fuchsia-50/40 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-700 mb-2">
                <Sparkles size={12} /> Istruzioni per l'AI <span className="text-violet-400 normal-case font-normal tracking-normal">(opzionale)</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={notesPrompt}
                  onChange={(e) => setNotesPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateNotes(); } }}
                  placeholder="Es: validità 60 gg, IVA al 22%, pagamento bonifico 30 gg fine mese"
                  className="flex-1 px-3.5 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:outline-none transition-all"
                />
                <button
                  onClick={handleGenerateNotes}
                  disabled={notesLoading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                >
                  {notesLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {notesLoading ? 'Sto generando…' : (notes ? 'Rigenera' : 'Genera con AI')}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                Lascia vuoto per note standard (validità, pagamento, IVA, esclusioni). Premi Invio o il pulsante per generare.
              </p>
            </div>

            {notesError && (
              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <div className="leading-relaxed">{notesError}</div>
              </div>
            )}
          </div>
        </section>

        </>)}

      </div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} onApplyItems={applyAiItems} />
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        buildSnapshot={buildSnapshot}
        onLoad={loadFromSaved}
      />
    </div>
  );
}
