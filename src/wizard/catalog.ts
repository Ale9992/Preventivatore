/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Listino prezzi per wizard preventivo siti web Astro.
 * Tutti i prezzi sono "calmierati" — fascia bassa-media del mercato IT freelance.
 */

import type { Item } from '../pdfTemplates';
import type {
  WizardState, SiteType, DesignApproach, CmsChoice,
  SeoLevel, MigrationType, MaintenancePackage, DiscountId
} from './types';

// =============================================================
// CATALOGHI (data-driven, riutilizzabili nella UI)
// =============================================================

export const SITE_TYPES: {
  id: SiteType;
  label: string;
  description: string;
  price: number;
}[] = [
  { id: 'landing',      label: 'Landing page',     description: '1 pagina lunga con hero, sezioni, CTA e form', price: 350 },
  { id: 'mini',         label: 'Vetrina mini',     description: '3 pagine: Home, Servizi, Contatti',            price: 550 },
  { id: 'vetrina',      label: 'Vetrina standard', description: '4-5 pagine, include Chi siamo e servizio',     price: 750 },
  { id: 'pro',          label: 'Vetrina pro',      description: '6-10 pagine con architettura informativa ricca', price: 1100 },
  { id: 'portfolio',    label: 'Portfolio',        description: '5-8 pagine con grid progetti e pagine dettaglio', price: 850 },
  { id: 'blog',         label: 'Blog Astro',       description: 'Vetrina 4 pagine + sezione blog con Content Collections', price: 900 },
  { id: 'vetrina-blog', label: 'Vetrina + blog',   description: '5 pagine + blog completo',                     price: 1150 },
  { id: 'ecommerce',    label: 'E-commerce',       description: 'Fino 30 prodotti, no varianti complesse (Snipcart o Stripe Checkout)', price: 1700 }
];

export const DESIGN_APPROACHES: {
  id: DesignApproach;
  label: string;
  description: string;
  price: number;
  discount?: number;
}[] = [
  { id: 'template', label: 'Da template open-source', description: 'Partenza da tema Astro pubblico + adattamento', price: 0, discount: 0.20 },
  { id: 'code',     label: 'Direct-to-code',          description: 'Design realizzato direttamente in codice, senza mockup',  price: 200 },
  { id: 'figma',    label: 'Figma + iterazioni',      description: 'Mockup in Figma con 2 cicli di iterazione',               price: 350 }
];

export const DESIGN_EXTRAS = {
  logo:          { label: 'Logo design base',                  description: 'Concept + 2 iterazioni, file SVG/PNG', price: 250 },
  brandIdentity: { label: 'Brand identity completa',           description: 'Logo + palette + tipografia + linee guida d\'uso', price: 480 }
};

export const EXTRAS: { id: string; label: string; description: string; price: number }[] = [
  { id: 'form-upload',     label: 'Form con upload file',        description: 'Allegato singolo o multiplo, validazione', price: 70 },
  { id: 'form-multistep',  label: 'Form multi-step',             description: 'Procedura guidata su più passaggi',        price: 140 },
  { id: 'galleria',        label: 'Galleria immagini',           description: 'Grid responsive + lightbox',               price: 70 },
  { id: 'mappa',           label: 'Mappa interattiva',           description: 'Google Maps o OpenStreetMap embedded',     price: 60 },
  { id: 'social-feed',     label: 'Social feed',                 description: 'Embed Instagram/Facebook nella pagina',    price: 100 },
  { id: 'calendario',      label: 'Calendario eventi',           description: 'Lista eventi + dettaglio + filtri data',   price: 180 },
  { id: 'prenotazione',    label: 'Sistema prenotazione',        description: 'Integrazione Cal.com / Calendly',          price: 130 },
  { id: 'gdpr',            label: 'Cookie banner GDPR',          description: 'Banner GDPR-compliant + gestione consenso', price: 70 },
  { id: 'pagine-legali',   label: 'Pagine legali',               description: 'Privacy + Cookie + TOS (da boilerplate)',  price: 90 },
  { id: 'area-riservata',  label: 'Area riservata semplice',     description: '1 password / Basic Auth su area protetta', price: 140 },
  { id: 'live-chat',       label: 'Live chat',                   description: 'Setup widget Tawk.to o Crisp',             price: 45 },
  { id: 'animazioni',      label: 'Animazioni custom',           description: 'Micro-interazioni e transizioni dedicate', price: 140 }
];

export const CMS_OPTIONS: { id: CmsChoice; label: string; description: string; price: number }[] = [
  { id: 'markdown', label: 'Markdown via Git',  description: 'Astro Content Collections, contenuti gestiti via repo', price: 0 },
  { id: 'decap',    label: 'Decap CMS',         description: 'UI visuale open-source per markdown',                   price: 220 },
  { id: 'sanity',   label: 'Sanity / Contentful', description: 'Headless CMS gestito',                                price: 300 }
];

export const LANGUAGE_PRICE = 150;

export const SEO_LEVELS: { id: SeoLevel; label: string; description: string; price: number }[] = [
  { id: 'none',     label: 'Nessuna ottimizzazione', description: 'Solo basi automatiche di Astro',                       price: 0 },
  { id: 'base',     label: 'SEO base',               description: 'Meta tags, sitemap, robots, schema, OG/Twitter cards', price: 170 },
  { id: 'avanzato', label: 'SEO avanzato',           description: 'Keyword research + ottimizzazione testi e meta',       price: 350 }
];

export const SEO_EXTRAS = {
  schemaAdvanced: { label: 'Schema.org avanzato',  description: 'LocalBusiness, FAQ, Article, Product structured data', price: 110 },
  analytics:      { label: 'Google Analytics 4 + Search Console', description: 'Setup completo con eventi base', price: 100 }
};

export const CONFIG_EXTRAS = {
  hostingSetup: { label: 'Setup hosting',         description: 'Configurazione Netlify/Vercel/Cloudflare Pages (piano gratuito sul tuo account)', price: 100 },
  dnsSetup:     { label: 'Configurazione DNS + SSL', description: 'Puntamento dominio e certificato SSL',                price: 70 },
  emailSetup:   { label: 'Setup email professionale', description: 'Configurazione Zoho/Google Workspace sul tuo provider (canone a carico tuo)', price: 100 }
};

export const MIGRATION_OPTIONS: { id: MigrationType; label: string; description: string; price: number }[] = [
  { id: 'none',      label: 'Nessuna migrazione',                description: 'Progetto nuovo da zero',                        price: 0 },
  { id: 'contenuti', label: 'Migrazione contenuti',              description: 'Import contenuti da sito esistente (fino 20 pagine)', price: 250 },
  { id: 'wordpress', label: 'Migrazione da WordPress',           description: 'Analisi + import contenuti + redirect 301',     price: 320 },
  { id: 'hosting',   label: 'Migrazione hosting',                description: 'Spostamento sito esistente su altro provider',  price: 150 }
];

export const MAINTENANCE_PACKAGES: {
  id: MaintenancePackage;
  label: string;
  description: string;
  monthlyPrice: number;
}[] = [
  { id: 'none',     label: 'Nessuna manutenzione', description: 'Solo garanzia bug-fix 30 gg post-consegna', monthlyPrice: 0 },
  { id: 'base',     label: 'Base',                 description: '1h/mese — piccole modifiche contenuti',     monthlyPrice: 40 },
  { id: 'standard', label: 'Standard',             description: '3h/mese — modifiche e aggiornamenti',       monthlyPrice: 100 },
  { id: 'pro',      label: 'Pro',                  description: '5h/mese + priorità nelle risposte',         monthlyPrice: 150 }
];

export const DISCOUNTS: { id: DiscountId; label: string; description: string; percent: number }[] = [
  { id: 'ricorrente', label: 'Cliente ricorrente', description: 'Secondo progetto o successivo con lo stesso cliente', percent: 0.10 },
  { id: 'noprofit',   label: 'Onlus / no-profit',  description: 'Associazioni senza scopo di lucro',                    percent: 0.20 },
  { id: 'anticipato', label: 'Pagamento anticipato 100%', description: 'Intero importo all\'accettazione',              percent: 0.05 }
];

// =============================================================
// BUILDER — trasforma lo stato wizard in voci di preventivo
// =============================================================

const num = (n: number) => n.toFixed(2);

function mkItem(description: string, details: string, quantity: string, price: number, unit: string = ''): Item {
  return {
    id: crypto.randomUUID(),
    description,
    details,
    quantity,
    unit,
    price: num(price)
  };
}

export interface BuildResult {
  items: Item[];
  subtotal: number;
  discountTotal: number;
  total: number;
}

export function buildItems(s: WizardState): BuildResult {
  const items: Item[] = [];

  // 1) Pacchetto base
  if (s.siteType) {
    const site = SITE_TYPES.find(t => t.id === s.siteType)!;
    let price = site.price;
    let details = site.description;

    // Sconto template
    if (s.designApproach === 'template') {
      const discount = DESIGN_APPROACHES.find(d => d.id === 'template')!.discount ?? 0;
      const off = price * discount;
      price = price - off;
      details += ` (−${Math.round(discount * 100)}% partenza da template)`;
    }

    items.push(mkItem(site.label, details, '1', price));
  }

  // 2) Design (escluso template, già scontato sopra)
  if (s.designApproach && s.designApproach !== 'template') {
    const d = DESIGN_APPROACHES.find(x => x.id === s.designApproach)!;
    if (d.price > 0) items.push(mkItem(d.label, d.description, '1', d.price));
  }
  if (s.logo) items.push(mkItem(DESIGN_EXTRAS.logo.label, DESIGN_EXTRAS.logo.description, '1', DESIGN_EXTRAS.logo.price));
  if (s.brandIdentity) items.push(mkItem(DESIGN_EXTRAS.brandIdentity.label, DESIGN_EXTRAS.brandIdentity.description, '1', DESIGN_EXTRAS.brandIdentity.price));

  // 3) Extras
  for (const id of s.extras) {
    const ex = EXTRAS.find(e => e.id === id);
    if (ex) items.push(mkItem(ex.label, ex.description, '1', ex.price));
  }

  // 4) CMS
  if (s.cms && s.cms !== 'markdown') {
    const c = CMS_OPTIONS.find(x => x.id === s.cms)!;
    items.push(mkItem(c.label, c.description, '1', c.price));
  }
  // Multilingua
  if (s.multilingua && s.extraLanguages > 0) {
    items.push(mkItem(
      'Multilingua (i18n Astro)',
      `${s.extraLanguages} lingua/e aggiuntiva/e oltre alla principale`,
      String(s.extraLanguages),
      LANGUAGE_PRICE,
      'lingue'
    ));
  }

  // 5) SEO
  if (s.seo !== 'none') {
    const sl = SEO_LEVELS.find(x => x.id === s.seo)!;
    items.push(mkItem(sl.label, sl.description, '1', sl.price));
  }
  if (s.schemaAdvanced) items.push(mkItem(SEO_EXTRAS.schemaAdvanced.label, SEO_EXTRAS.schemaAdvanced.description, '1', SEO_EXTRAS.schemaAdvanced.price));
  if (s.analytics) items.push(mkItem(SEO_EXTRAS.analytics.label, SEO_EXTRAS.analytics.description, '1', SEO_EXTRAS.analytics.price));

  // 6) Configurazione & deploy
  if (s.hostingSetup) items.push(mkItem(CONFIG_EXTRAS.hostingSetup.label, CONFIG_EXTRAS.hostingSetup.description, '1', CONFIG_EXTRAS.hostingSetup.price));
  if (s.dnsSetup) items.push(mkItem(CONFIG_EXTRAS.dnsSetup.label, CONFIG_EXTRAS.dnsSetup.description, '1', CONFIG_EXTRAS.dnsSetup.price));
  if (s.emailSetup) items.push(mkItem(CONFIG_EXTRAS.emailSetup.label, CONFIG_EXTRAS.emailSetup.description, '1', CONFIG_EXTRAS.emailSetup.price));
  if (s.migration !== 'none') {
    const m = MIGRATION_OPTIONS.find(x => x.id === s.migration)!;
    items.push(mkItem(m.label, m.description, '1', m.price));
  }

  // 7) Manutenzione
  if (s.maintenance !== 'none' && s.maintenanceMonths > 0) {
    const mp = MAINTENANCE_PACKAGES.find(x => x.id === s.maintenance)!;
    items.push(mkItem(
      `Manutenzione ${mp.label.toLowerCase()}`,
      `${mp.description} — ${s.maintenanceMonths} mesi prepagati`,
      String(s.maintenanceMonths),
      mp.monthlyPrice,
      'mesi'
    ));
  }

  // Subtotale prima degli sconti
  const subtotal = items.reduce((acc, it) => acc + parseFloat(it.quantity) * parseFloat(it.price), 0);

  // 8) Sconti (riga negativa per trasparenza)
  let discountTotal = 0;
  for (const did of s.discounts) {
    const d = DISCOUNTS.find(x => x.id === did);
    if (!d) continue;
    const amount = subtotal * d.percent;
    discountTotal += amount;
    items.push(mkItem(
      `Sconto ${d.label.toLowerCase()}`,
      `−${Math.round(d.percent * 100)}% sul subtotale`,
      '1',
      -amount
    ));
  }

  const total = subtotal - discountTotal;
  return { items, subtotal, discountTotal, total };
}
