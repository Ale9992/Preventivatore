/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Archive, X, Save, Upload, Trash2, FileText, AlertCircle
} from 'lucide-react';
import {
  loadAll, saveQuote, deleteQuote, quoteTotal,
  type SavedQuote
} from './storage';

const fmtEUR = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

const fmtDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
};

interface Props {
  open: boolean;
  onClose: () => void;
  /** Snapshot of current state to allow saving */
  buildSnapshot: () => Omit<SavedQuote, 'id' | 'savedAt' | 'label'> & { label?: string };
  /** Loaded a saved quote — restore its data into App state */
  onLoad: (q: SavedQuote) => void;
}

export function HistoryPanel({ open, onClose, buildSnapshot, onLoad }: Props) {
  const [list, setList] = useState<SavedQuote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setList(loadAll());
      setError(null);
    }
  }, [open]);

  const refresh = () => setList(loadAll());

  const handleSave = () => {
    setError(null);
    try {
      const snap = buildSnapshot();
      const id = crypto.randomUUID();
      const newQuote: SavedQuote = {
        ...snap,
        id,
        savedAt: new Date().toISOString(),
        label: snap.label || `Preventivo`
      };
      saveQuote(newQuote);
      refresh();
      setJustSavedId(id);
      setTimeout(() => setJustSavedId(null), 2000);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  const handleDelete = (q: SavedQuote) => {
    const ok = window.confirm(`Eliminare il preventivo "${q.label}"?\n\nL'azione non è reversibile.`);
    if (!ok) return;
    deleteQuote(q.id);
    refresh();
  };

  const handleLoad = (q: SavedQuote) => {
    onLoad(q);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

      <aside className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
            <Archive size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800">Storico preventivi</div>
            <div className="text-xs text-slate-500">{list.length} salvati nel browser</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </header>

        {/* Save current */}
        <div className="px-5 py-4 border-b border-slate-200 bg-amber-50/40 shrink-0">
          <button
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
          >
            <Save size={15} /> Salva preventivo attuale
          </button>
          {error && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {list.length === 0 && (
            <div className="text-center text-sm text-slate-500 mt-12 max-w-xs mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <FileText size={22} className="text-amber-600" />
              </div>
              <p className="font-semibold text-slate-700 mb-1.5">Nessun preventivo salvato</p>
              <p className="text-xs leading-relaxed text-slate-500">
                Quando salvi il preventivo attuale appare qui. Puoi caricarlo di nuovo in qualsiasi momento.
              </p>
            </div>
          )}

          {list.map(q => {
            const total = quoteTotal(q);
            const isFresh = q.id === justSavedId;
            return (
              <div
                key={q.id}
                className={`rounded-xl border bg-white p-3.5 transition-all ${
                  isFresh
                    ? 'border-emerald-400 ring-2 ring-emerald-500/15 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{q.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{fmtDate(q.savedAt)}</div>
                  </div>
                  {isFresh && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      Appena salvato
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span>{q.items.length} {q.items.length === 1 ? 'voce' : 'voci'}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-slate-700 tabular-nums">{fmtEUR(total)}</span>
                  {q.client.name && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="truncate">{q.client.name}</span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoad(q)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold transition-colors"
                  >
                    <Upload size={12} /> Carica
                  </button>
                  <button
                    onClick={() => handleDelete(q)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
                    aria-label="Elimina"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        {list.length > 0 && (
          <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50/60 text-[11px] text-slate-500 shrink-0">
            I preventivi sono salvati localmente nel browser/app. Non vengono inviati a nessun server.
          </footer>
        )}
      </aside>
    </div>
  );
}
