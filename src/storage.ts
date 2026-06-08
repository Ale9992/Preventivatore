/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * localStorage-backed history of saved quotes.
 */

import type { Item, Party } from './pdfTemplates';

export interface SavedQuote {
  id: string;
  savedAt: string;
  label: string;
  // Form state
  sender: Party;
  client: Party;
  items: Item[];
  logo: string | null;
  notes: string;
  project: string;
  // PDF settings
  template: string;
  accent: string;
  pdfTitle: string;
}

const KEY = 'preventivatore-storico';
const MAX_QUOTES = 200;

export function loadAll(): SavedQuote[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(q => q && typeof q === 'object' && typeof q.id === 'string');
  } catch {
    return [];
  }
}

export function saveQuote(q: SavedQuote): void {
  const all = loadAll();
  const idx = all.findIndex(x => x.id === q.id);
  if (idx >= 0) all[idx] = q;
  else all.unshift(q);

  // Cap to prevent unbounded growth
  const capped = all.slice(0, MAX_QUOTES);

  try {
    localStorage.setItem(KEY, JSON.stringify(capped));
  } catch (e) {
    throw new Error('Spazio di archiviazione locale pieno. Elimina qualche preventivo dallo storico per liberare spazio.');
  }
}

export function deleteQuote(id: string): void {
  const all = loadAll().filter(x => x.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function clearAll(): void {
  localStorage.removeItem(KEY);
}

/**
 * Total bytes used by the storico (rough). Useful for diagnostics / warnings.
 */
export function approxBytesUsed(): number {
  const raw = localStorage.getItem(KEY) || '';
  return new Blob([raw]).size;
}

/**
 * Compute a human-friendly label for a quote.
 */
export function makeLabel(client: Party): string {
  const name = client?.name?.trim();
  const dt = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return name ? `${name} · ${dt}` : `Preventivo del ${dt}`;
}

/**
 * Sum of (qty * price) for a saved quote (used for list display).
 */
export function quoteTotal(q: SavedQuote): number {
  return q.items.reduce((acc, it) => {
    const qty = parseFloat((it.quantity || '0').toString().replace(',', '.')) || 0;
    const pr = parseFloat((it.price || '0').toString().replace(',', '.')) || 0;
    return acc + qty * pr;
  }, 0);
}
