/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Sparkles, X, Send, Loader2, Key, Plus, AlertCircle, Check } from 'lucide-react';
import { callDeepseek, API_KEY_STORAGE, type AiResponse, type ChatTurn } from './aiChat';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  parsed?: AiResponse;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApplyItems: (items: AiResponse['items']) => void;
}

const fmtEUR = (n: string | number) => {
  const v = typeof n === 'string' ? parseFloat(n.replace(',', '.')) : n;
  if (isNaN(v)) return '—';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);
};

export function AiPanel({ open, onClose, onApplyItems }: Props) {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [editingKey, setEditingKey] = useState<boolean>(!apiKey);
  const [keyDraft, setKeyDraft] = useState<string>('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, error]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const saveKey = () => {
    const trimmed = keyDraft.trim();
    if (!trimmed) return;
    localStorage.setItem(API_KEY_STORAGE, trimmed);
    setApiKey(trimmed);
    setKeyDraft('');
    setEditingKey(false);
    setError(null);
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !apiKey) return;
    const userMsg: ChatMsg = { role: 'user', content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const turns: ChatTurn[] = newHistory.map(m => ({ role: m.role, content: m.content }));
      const res = await callDeepseek(turns, apiKey, controller.signal);
      const text = res.intro + (res.notes ? `\n\n${res.notes}` : '');
      setMessages(prev => [...prev, { role: 'assistant', content: text || '(nessun testo)', parsed: res }]);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message || String(e));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const send = () => sendText(input);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setInput('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm animate-in fade-in" />

      <aside className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800">Assistente AI</div>
            <div className="text-xs text-slate-500">DeepSeek · genera voci di preventivo</div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100"
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </header>

        {/* API Key panel */}
        {editingKey && (
          <div className="px-5 py-4 border-b border-slate-200 bg-amber-50/60">
            <div className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
              <Key size={13} /> Chiave API DeepSeek
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Generala su <span className="font-mono font-semibold">platform.deepseek.com</span>.
              Salvata solo nel tuo browser/app, mai inviata altrove.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-..."
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 focus:outline-none"
                autoFocus
              />
              <button
                onClick={saveKey}
                disabled={!keyDraft.trim()}
                className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40"
              >
                Salva
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !editingKey && (
            <div className="text-center text-sm text-slate-500 mt-8 max-w-xs mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={22} className="text-violet-600" />
              </div>
              <p className="font-semibold text-slate-700 mb-1.5">Descrivi il progetto</p>
              <p className="text-xs leading-relaxed text-slate-500">
                Es: <em>"Sito vetrina 5 pagine per studio dentistico, form contatti e SEO base"</em>
              </p>
              <p className="text-xs leading-relaxed text-slate-400 mt-3">
                L'assistente prima ti propone le voci e i prezzi in chat, poi le genera solo dopo la tua conferma. Prezzi allineati al mercato IT freelance/PMI.
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const showConfirm = m.role === 'assistant' && m.parsed?.awaitingConfirmation && isLast && !loading;
            return (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-md px-4 py-2.5'
                      : 'bg-slate-100 text-slate-800 rounded-bl-md px-4 py-3'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {m.parsed && m.parsed.items.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {m.parsed.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-white rounded-lg px-3 py-2 text-slate-700 flex items-start justify-between gap-3 border border-slate-200"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 leading-snug">{it.description}</div>
                            {it.details?.trim() && (
                              <div className="text-slate-500 leading-snug mt-0.5">{it.details}</div>
                            )}
                            <div className="text-slate-400 mt-1 tabular-nums">
                              {it.quantity}{it.unit ? ` ${it.unit}` : ''} × {fmtEUR(it.price)}
                            </div>
                          </div>
                          <div className="text-slate-700 font-semibold tabular-nums shrink-0">
                            {fmtEUR(parseFloat(it.quantity || '1') * parseFloat(it.price.replace(',', '.') || '0'))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => onApplyItems(m.parsed!.items)}
                        className="w-full mt-2 px-3 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors"
                      >
                        <Plus size={14} /> Aggiungi al preventivo ({m.parsed.items.length})
                      </button>
                    </div>
                  )}

                  {showConfirm && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => sendText('Sì, conferma e genera le voci.')}
                        className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
                      >
                        <Check size={13} strokeWidth={3} /> Conferma e genera
                      </button>
                      <button
                        onClick={() => inputRef.current?.focus()}
                        className="px-3 py-2 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-medium hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        Voglio aggiustamenti
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Sto generando le voci…
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold mb-0.5">Errore</div>
                <div className="leading-relaxed">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-5 py-3 border-t border-slate-200 bg-white shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={apiKey ? 'Descrivi il progetto…  (Invio per inviare, Shift+Invio nuova riga)' : 'Inserisci prima la API key'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!apiKey || loading}
              className="flex-1 resize-none max-h-32 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || !apiKey || loading}
              className="h-10 px-4 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label="Invia"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          {apiKey && !editingKey && (
            <button
              type="button"
              onClick={() => {
                setEditingKey(true);
                setKeyDraft(apiKey);
              }}
              className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
            >
              <Key size={11} /> Cambia API key
            </button>
          )}
        </form>
      </aside>
    </div>
  );
}
