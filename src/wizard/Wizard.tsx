/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, type ReactNode, type FC } from 'react';
import {
  ChevronLeft, ChevronRight, Check, Plus, Globe, Palette,
  Boxes, Database, Search, Server, LifeBuoy, Receipt
} from 'lucide-react';
import {
  initialState,
  type WizardState, type DiscountId, type MaintenancePackage,
  type SeoLevel, type MigrationType, type CmsChoice,
  type SiteType, type DesignApproach
} from './types';
import {
  buildItems,
  SITE_TYPES, DESIGN_APPROACHES, DESIGN_EXTRAS, EXTRAS,
  CMS_OPTIONS, LANGUAGE_PRICE, SEO_LEVELS, SEO_EXTRAS,
  CONFIG_EXTRAS, MIGRATION_OPTIONS, MAINTENANCE_PACKAGES, DISCOUNTS
} from './catalog';
import type { Item } from '../pdfTemplates';

const fmtEUR = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

interface Props {
  onApply: (items: Item[]) => void;
}

const STEPS = [
  { n: 1, title: 'Tipo di sito',          icon: Globe },
  { n: 2, title: 'Design',                icon: Palette },
  { n: 3, title: 'Funzionalità extra',    icon: Boxes },
  { n: 4, title: 'CMS & contenuti',       icon: Database },
  { n: 5, title: 'SEO & analytics',       icon: Search },
  { n: 6, title: 'Configurazione',        icon: Server },
  { n: 7, title: 'Manutenzione',          icon: LifeBuoy },
  { n: 8, title: 'Sconti & riepilogo',    icon: Receipt }
];

// =============================================================
// Reusable sub-components
// =============================================================

interface OptionCardProps {
  selected: boolean;
  label: string;
  description: string;
  price?: number | string;
  onClick: () => void;
  badge?: string;
}

const OptionCard: FC<OptionCardProps> = ({ selected, label, description, price, onClick, badge }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50/60 ring-4 ring-brand-500/10'
          : 'border-slate-200 hover:border-slate-300 bg-white/70 hover:bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{label}</span>
            {badge && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                {badge}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 leading-snug">{description}</div>
        </div>
        {price !== undefined && (
          <div className="text-sm font-bold text-slate-800 tabular-nums shrink-0">
            {typeof price === 'number' ? (price > 0 ? fmtEUR(price) : (price === 0 ? 'incluso' : '')) : price}
          </div>
        )}
      </div>
    </button>
  );
}

interface CheckCardProps {
  checked: boolean;
  label: string;
  description: string;
  price?: number;
  onClick: () => void;
}

const CheckCard: FC<CheckCardProps> = ({ checked, label, description, price, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
        checked
          ? 'border-brand-500 bg-brand-50/60'
          : 'border-slate-200 hover:border-slate-300 bg-white/70'
      }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-colors ${
        checked ? 'bg-brand-500 text-white' : 'border-2 border-slate-300 bg-white'
      }`}>
        {checked && <Check size={13} strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-slate-800">{label}</span>
          {price !== undefined && price > 0 && (
            <span className="text-xs font-semibold text-slate-700 tabular-nums shrink-0">
              {fmtEUR(price)}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</div>
      </div>
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
      {children}
    </div>
  );
}

// =============================================================
// Main component
// =============================================================

export function Wizard({ onApply }: Props) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(initialState);

  const result = useMemo(() => buildItems(state), [state]);

  const update = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setState(prev => ({ ...prev, [k]: v }));

  const toggleExtra = (id: string) =>
    setState(prev => ({
      ...prev,
      extras: prev.extras.includes(id) ? prev.extras.filter(e => e !== id) : [...prev.extras, id]
    }));

  const toggleDiscount = (id: DiscountId) =>
    setState(prev => ({
      ...prev,
      discounts: prev.discounts.includes(id) ? prev.discounts.filter(d => d !== id) : [...prev.discounts, id]
    }));

  const canGoNext = useMemo(() => {
    if (step === 1) return state.siteType !== null;
    if (step === 2) return state.designApproach !== null;
    return true;
  }, [step, state]);

  const goNext = () => { if (canGoNext) setStep(s => Math.min(s + 1, STEPS.length)); };
  const goPrev = () => setStep(s => Math.max(s - 1, 1));

  const apply = () => {
    if (result.items.length === 0) return;
    onApply(result.items);
  };

  const reset = () => { setState(initialState); setStep(1); };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">

      {/* STEPPER BAR */}
      <nav className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 overflow-x-auto">
        <ol className="flex items-center gap-1 min-w-max">
          {STEPS.map((s, i) => {
            const status: 'done' | 'current' | 'upcoming' = s.n < step ? 'done' : s.n === step ? 'current' : 'upcoming';
            const Icon = s.icon;
            const clickable = s.n <= step;
            return (
              <li key={s.n} className="flex items-center">
                <button
                  onClick={() => clickable && setStep(s.n)}
                  disabled={!clickable}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    status === 'current'
                      ? 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md'
                      : status === 'done'
                        ? 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                        : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    status === 'current' ? 'bg-white/20' :
                    status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {status === 'done' ? <Check size={12} strokeWidth={3} /> : s.n}
                  </span>
                  <span className="font-medium hidden md:inline">{s.title}</span>
                  <Icon size={13} className="md:hidden" />
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-3 h-px ${s.n < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* STEP CONTENT */}
      <div className="p-6 min-h-[400px]">
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Che tipo di sito ti serve?</h2>
            <p className="text-sm text-slate-500 mb-5">Scegli un pacchetto base. Lo personalizzi negli step successivi.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SITE_TYPES.map(t => (
                <OptionCard
                  key={t.id}
                  selected={state.siteType === t.id}
                  label={t.label}
                  description={t.description}
                  price={t.price}
                  onClick={() => update('siteType', t.id as SiteType)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Design e identità</h2>
            <p className="text-sm text-slate-500 mb-5">Scegli l'approccio al design. Logo e brand identity sono opzionali.</p>

            <SectionLabel>Approccio al design</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {DESIGN_APPROACHES.map(d => (
                <OptionCard
                  key={d.id}
                  selected={state.designApproach === d.id}
                  label={d.label}
                  description={d.description}
                  price={d.discount ? '−20% base' : d.price}
                  badge={d.discount ? 'sconto' : undefined}
                  onClick={() => update('designApproach', d.id as DesignApproach)}
                />
              ))}
            </div>

            <SectionLabel>Servizi grafici aggiuntivi</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CheckCard
                checked={state.logo}
                label={DESIGN_EXTRAS.logo.label}
                description={DESIGN_EXTRAS.logo.description}
                price={DESIGN_EXTRAS.logo.price}
                onClick={() => update('logo', !state.logo)}
              />
              <CheckCard
                checked={state.brandIdentity}
                label={DESIGN_EXTRAS.brandIdentity.label}
                description={DESIGN_EXTRAS.brandIdentity.description}
                price={DESIGN_EXTRAS.brandIdentity.price}
                onClick={() => update('brandIdentity', !state.brandIdentity)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Funzionalità extra</h2>
            <p className="text-sm text-slate-500 mb-5">Seleziona tutte le funzionalità da includere nel preventivo.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXTRAS.map(e => (
                <CheckCard
                  key={e.id}
                  checked={state.extras.includes(e.id)}
                  label={e.label}
                  description={e.description}
                  price={e.price}
                  onClick={() => toggleExtra(e.id)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">CMS & contenuti</h2>
            <p className="text-sm text-slate-500 mb-5">Come gestirà i contenuti il cliente?</p>

            <SectionLabel>Gestione contenuti</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {CMS_OPTIONS.map(c => (
                <OptionCard
                  key={c.id}
                  selected={state.cms === c.id}
                  label={c.label}
                  description={c.description}
                  price={c.price === 0 ? 'incluso' : c.price}
                  onClick={() => update('cms', c.id as CmsChoice)}
                />
              ))}
            </div>

            <SectionLabel>Multilingua</SectionLabel>
            <div className="rounded-xl border-2 border-slate-200 bg-white/70 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.multilingua}
                  onChange={(e) => update('multilingua', e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-brand-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-800">Sito multilingua (i18n Astro)</div>
                  <div className="text-xs text-slate-500 mt-0.5">{fmtEUR(LANGUAGE_PRICE)} per ciascuna lingua aggiuntiva oltre alla principale</div>
                </div>
              </label>
              {state.multilingua && (
                <div className="mt-4 flex items-center gap-3 pl-8">
                  <label className="text-sm text-slate-600">Lingue aggiuntive:</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={state.extraLanguages}
                    onChange={(e) => update('extraLanguages', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-center"
                  />
                  <span className="text-sm text-slate-500 tabular-nums">
                    = {fmtEUR(state.extraLanguages * LANGUAGE_PRICE)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">SEO & analytics</h2>
            <p className="text-sm text-slate-500 mb-5">Quanto deve essere visibile sui motori di ricerca?</p>

            <SectionLabel>Livello SEO</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {SEO_LEVELS.map(s => (
                <OptionCard
                  key={s.id}
                  selected={state.seo === s.id}
                  label={s.label}
                  description={s.description}
                  price={s.price === 0 ? '—' : s.price}
                  onClick={() => update('seo', s.id as SeoLevel)}
                />
              ))}
            </div>

            <SectionLabel>Extra</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CheckCard
                checked={state.schemaAdvanced}
                label={SEO_EXTRAS.schemaAdvanced.label}
                description={SEO_EXTRAS.schemaAdvanced.description}
                price={SEO_EXTRAS.schemaAdvanced.price}
                onClick={() => update('schemaAdvanced', !state.schemaAdvanced)}
              />
              <CheckCard
                checked={state.analytics}
                label={SEO_EXTRAS.analytics.label}
                description={SEO_EXTRAS.analytics.description}
                price={SEO_EXTRAS.analytics.price}
                onClick={() => update('analytics', !state.analytics)}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Configurazione & deploy</h2>
            <p className="text-sm text-slate-500 mb-5">Hosting e dominio restano intestati al cliente. Tu offri solo la configurazione.</p>

            <SectionLabel>Servizi di configurazione</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <CheckCard
                checked={state.hostingSetup}
                label={CONFIG_EXTRAS.hostingSetup.label}
                description={CONFIG_EXTRAS.hostingSetup.description}
                price={CONFIG_EXTRAS.hostingSetup.price}
                onClick={() => update('hostingSetup', !state.hostingSetup)}
              />
              <CheckCard
                checked={state.dnsSetup}
                label={CONFIG_EXTRAS.dnsSetup.label}
                description={CONFIG_EXTRAS.dnsSetup.description}
                price={CONFIG_EXTRAS.dnsSetup.price}
                onClick={() => update('dnsSetup', !state.dnsSetup)}
              />
              <CheckCard
                checked={state.emailSetup}
                label={CONFIG_EXTRAS.emailSetup.label}
                description={CONFIG_EXTRAS.emailSetup.description}
                price={CONFIG_EXTRAS.emailSetup.price}
                onClick={() => update('emailSetup', !state.emailSetup)}
              />
            </div>

            <SectionLabel>Migrazione</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MIGRATION_OPTIONS.map(m => (
                <OptionCard
                  key={m.id}
                  selected={state.migration === m.id}
                  label={m.label}
                  description={m.description}
                  price={m.price === 0 ? '—' : m.price}
                  onClick={() => update('migration', m.id as MigrationType)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Manutenzione & supporto</h2>
            <p className="text-sm text-slate-500 mb-5">Garanzia bug-fix 30 giorni post-consegna sempre inclusa. Pacchetti mensili opzionali.</p>

            <SectionLabel>Pacchetto manutenzione</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {MAINTENANCE_PACKAGES.map(m => (
                <OptionCard
                  key={m.id}
                  selected={state.maintenance === m.id}
                  label={m.label}
                  description={m.description}
                  price={m.monthlyPrice === 0 ? 'gratis' : `${fmtEUR(m.monthlyPrice)}/mese`}
                  onClick={() => update('maintenance', m.id as MaintenancePackage)}
                />
              ))}
            </div>

            {state.maintenance !== 'none' && (
              <>
                <SectionLabel>Mesi prepagati</SectionLabel>
                <div className="rounded-xl border-2 border-slate-200 bg-white/70 p-4 flex items-center gap-4">
                  <label className="text-sm text-slate-600 shrink-0">Numero mesi:</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={state.maintenanceMonths}
                    onChange={(e) => update('maintenanceMonths', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-center"
                  />
                  <span className="text-sm text-slate-500 tabular-nums">
                    = {fmtEUR(state.maintenanceMonths * (MAINTENANCE_PACKAGES.find(x => x.id === state.maintenance)?.monthlyPrice ?? 0))}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {step === 8 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Sconti & riepilogo</h2>
            <p className="text-sm text-slate-500 mb-5">Applica eventuali sconti e controlla il riepilogo finale.</p>

            <SectionLabel>Sconti applicabili</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {DISCOUNTS.map(d => (
                <CheckCard
                  key={d.id}
                  checked={state.discounts.includes(d.id)}
                  label={d.label}
                  description={d.description}
                  onClick={() => toggleDiscount(d.id)}
                />
              ))}
            </div>

            <SectionLabel>Riepilogo voci</SectionLabel>
            <div className="rounded-xl border border-slate-200 bg-white/70 overflow-hidden">
              {result.items.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  Nessuna voce selezionata. Torna agli step precedenti per scegliere il pacchetto.
                </div>
              ) : (
                <>
                  <div className="divide-y divide-slate-100">
                    {result.items.map(it => {
                      const lineTotal = parseFloat(it.quantity) * parseFloat(it.price);
                      const isDiscount = lineTotal < 0;
                      return (
                        <div key={it.id} className={`px-4 py-2.5 flex items-start justify-between gap-3 ${isDiscount ? 'bg-emerald-50/40' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${isDiscount ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {it.description}
                            </div>
                            {it.details && (
                              <div className="text-xs text-slate-500 mt-0.5 leading-snug">{it.details}</div>
                            )}
                            <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                              {it.quantity} × {fmtEUR(parseFloat(it.price))}
                            </div>
                          </div>
                          <div className={`text-sm font-semibold tabular-nums shrink-0 ${isDiscount ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {fmtEUR(lineTotal)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-brand-50/40 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Totale</span>
                    <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent tabular-nums">
                      {fmtEUR(result.total)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-4">
        <button
          onClick={goPrev}
          disabled={step === 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} /> Indietro
        </button>

        <div className="flex-1 text-center">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Totale stimato</div>
          <div className="text-lg font-bold text-slate-800 tabular-nums">{fmtEUR(result.total)}</div>
        </div>

        {step < STEPS.length ? (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-brand-500 to-indigo-600 text-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Avanti <ChevronRight size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Ricomincia
            </button>
            <button
              onClick={apply}
              disabled={result.items.length === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={16} /> Aggiungi al preventivo
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
