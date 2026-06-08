/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type TemplateId = 'classic' | 'modern' | 'minimal';

export interface Item {
  id: string;
  description: string;
  details: string;
  quantity: string;
  unit: string;
  price: string;
}

const fmtQty = (q: string, unit: string) => unit ? `${q} ${unit}` : q;

export const parseNum = (s: string | number): number => {
  if (typeof s === 'number') return s;
  const cleaned = String(s).trim().replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return 0;
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

export interface Party {
  name: string;
  address: string;
  vat?: string;
  email: string;
  phone: string;
}

export type RGB = [number, number, number];

export interface PdfPayload {
  sender: Party;
  client: Party;
  items: Item[];
  total: number;
  logo: string | null;
  accent: RGB;
  notes: string;
  project: string;
  title: string;
}

const fmtEUR = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

function drawLogo(doc: jsPDF, logo: string, x: number, y: number, maxW: number, maxH: number) {
  const props = doc.getImageProperties(logo);
  const ratio = props.width / props.height;
  const w = maxW / maxH > ratio ? maxH * ratio : maxW;
  const h = maxW / maxH > ratio ? maxH : maxW / ratio;
  const format = (logo.match(/^data:image\/(\w+);base64,/)?.[1] || 'PNG').toUpperCase();
  doc.addImage(logo, format, x, y, w, h);
}

function todayIT() {
  return new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Draws an optional "Oggetto" block above the items table. Returns the y position after the block.
 */
function drawProject(doc: jsPDF, project: string, startY: number, accent: RGB): number {
  const trimmed = project?.trim();
  if (!trimmed) return startY;

  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 30;
  const [r, g, b] = accent;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('Oggetto:', 15, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50);
  const lines = doc.splitTextToSize(trimmed, maxWidth) as string[];
  lines.forEach((line, i) => doc.text(line, 15, startY + 5.5 + i * 4.8));

  return startY + 5.5 + lines.length * 4.8;
}

/**
 * Draws an optional "Note" block. Returns the y position after the block (or startY if no notes).
 */
function drawNotes(doc: jsPDF, notes: string, startY: number, accent: RGB): number {
  const trimmed = notes?.trim();
  if (!trimmed) return startY;

  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 30;
  const [r, g, b] = accent;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('Note', 15, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70);
  const lines = doc.splitTextToSize(trimmed, maxWidth) as string[];
  lines.forEach((line, i) => doc.text(line, 15, startY + 6 + i * 4.5));

  return startY + 6 + lines.length * 4.5;
}

// ====================================================================
// TEMPLATE 1: CLASSICO
// Sobrio, mittente a destra, titolo grande con sottolineatura
// ====================================================================
function renderClassic(doc: jsPDF, p: PdfPayload) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const [r, g, b] = p.accent;

  if (p.logo) drawLogo(doc, p.logo, 15, 10, 40, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const senderText = [
    p.sender.name,
    p.sender.address,
    p.sender.vat ? `P.IVA: ${p.sender.vat}` : '',
    p.sender.email,
    p.sender.phone
  ].filter(Boolean);
  senderText.forEach((line, i) => {
    doc.text(line, pageWidth - 15, 15 + i * 5, { align: 'right' });
  });

  const title = p.title?.trim();
  if (title) {
    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 15, 45);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.8);
    const titleWidth = Math.min(doc.getTextWidth(title.toUpperCase()) + 5, 80);
    doc.line(15, 48, 15 + titleWidth, 48);
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`Data: ${todayIT()}`, pageWidth - 15, 45, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40);
  doc.text('Cliente:', 15, 62);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const clientText = [
    p.client.name,
    p.client.address,
    p.client.vat ? `P.IVA: ${p.client.vat}` : '',
    p.client.email,
    p.client.phone
  ].filter(Boolean);
  clientText.forEach((line, i) => doc.text(line, 15, 69 + i * 5));

  const clientEndY = 69 + Math.max(clientText.length, 1) * 5;
  let tableStartY = Math.max(clientEndY + 8, 100);
  if (p.project?.trim()) {
    const projEndY = drawProject(doc, p.project, clientEndY + 8, p.accent);
    tableStartY = projEndY + 8;
  }

  autoTable(doc, {
    startY: tableStartY,
    head: [['Descrizione', 'Qtà', 'Prezzo Unit.', 'Totale']],
    body: p.items.map(it => [
      it.details?.trim() ? `${it.description}\n${it.details}` : it.description,
      fmtQty(it.quantity, it.unit),
      fmtEUR(parseNum(it.price)),
      fmtEUR(parseNum(it.quantity) * parseNum(it.price))
    ]),
    theme: 'striped',
    headStyles: { fillColor: [r, g, b], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`TOTALE: ${fmtEUR(p.total)}`, pageWidth - 15, finalY, { align: 'right' });

  drawNotes(doc, p.notes, finalY + 14, p.accent);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Preventivo valido per 30 giorni.', 15, pageHeight - 10);
}

// ====================================================================
// TEMPLATE 2: MODERNO
// Banda colorata superiore, doppia colonna DA/A, totale in box
// ====================================================================
function renderModern(doc: jsPDF, p: PdfPayload) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const [r, g, b] = p.accent;

  // Banda colorata superiore (40mm)
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 40, 'F');

  if (p.logo) drawLogo(doc, p.logo, 15, 10, 35, 20);

  const modernTitle = p.title?.trim();
  if (modernTitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255);
    doc.text(modernTitle.toUpperCase(), pageWidth - 15, 22, { align: 'right' });
  }
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255);
  doc.text(`Data: ${todayIT()}`, pageWidth - 15, modernTitle ? 31 : 22, { align: 'right' });

  // Due colonne info
  const colY = 55;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('DA', 15, colY);
  doc.text('A', pageWidth / 2 + 5, colY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40);
  const senderLines = [
    p.sender.name,
    p.sender.address,
    p.sender.vat ? `P.IVA: ${p.sender.vat}` : '',
    p.sender.email,
    p.sender.phone
  ].filter(Boolean);
  senderLines.forEach((line, i) => doc.text(line, 15, colY + 6 + i * 5));

  const clientLines = [
    p.client.name,
    p.client.address,
    p.client.vat ? `P.IVA: ${p.client.vat}` : '',
    p.client.email,
    p.client.phone
  ].filter(Boolean);
  clientLines.forEach((line, i) => doc.text(line, pageWidth / 2 + 5, colY + 6 + i * 5));

  const infoEndY = colY + 6 + Math.max(senderLines.length, clientLines.length) * 5;
  let startY = infoEndY + 12;
  if (p.project?.trim()) {
    const projEndY = drawProject(doc, p.project, infoEndY + 10, p.accent);
    startY = projEndY + 8;
  }

  autoTable(doc, {
    startY,
    head: [['DESCRIZIONE', 'QTÀ', 'PREZZO', 'TOTALE']],
    body: p.items.map(it => [
      it.details?.trim() ? `${it.description}\n${it.details}` : it.description,
      fmtQty(it.quantity, it.unit),
      fmtEUR(parseNum(it.price)),
      fmtEUR(parseNum(it.quantity) * parseNum(it.price))
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [r, g, b],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 6
    },
    bodyStyles: { fontSize: 10, cellPadding: 6, textColor: 50 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  // Totale in box colorato
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const boxW = 75;
  doc.setFillColor(r, g, b);
  doc.rect(pageWidth - 15 - boxW, finalY, boxW, 18, 'F');
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTALE', pageWidth - 15 - boxW + 5, finalY + 7);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(fmtEUR(p.total), pageWidth - 18, finalY + 13, { align: 'right' });

  drawNotes(doc, p.notes, finalY + 28, p.accent);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Preventivo valido per 30 giorni.', pageWidth / 2, pageHeight - 10, { align: 'center' });
}

// ====================================================================
// TEMPLATE 3: MINIMALE
// Tipografia leggera, hairline, monocromatico con accento solo sul totale
// ====================================================================
function renderMinimal(doc: jsPDF, p: PdfPayload) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const [r, g, b] = p.accent;

  if (p.logo) drawLogo(doc, p.logo, pageWidth - 50, 15, 35, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150);
  const minimalTitle = p.title?.trim();
  doc.text(minimalTitle ? `${minimalTitle.toUpperCase()}  ·  ${todayIT()}` : todayIT(), 15, 18);

  doc.setFontSize(22);
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.text(p.sender.name || ' ', 15, 30);

  doc.setDrawColor(220);
  doc.setLineWidth(0.2);
  doc.line(15, 40, pageWidth - 15, 40);

  // Mittente + Cliente in due colonne, etichette tiny
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150);
  doc.text('MITTENTE', 15, 48);
  doc.text('CLIENTE', pageWidth / 2 + 5, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60);
  const sLines = [
    p.sender.address,
    p.sender.vat ? `P.IVA: ${p.sender.vat}` : '',
    p.sender.email,
    p.sender.phone
  ].filter(Boolean);
  sLines.forEach((line, i) => doc.text(line, 15, 54 + i * 4.5));

  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.text(p.client.name || ' ', pageWidth / 2 + 5, 54);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  const cLines = [
    p.client.address,
    p.client.vat ? `P.IVA: ${p.client.vat}` : '',
    p.client.email,
    p.client.phone
  ].filter(Boolean);
  cLines.forEach((line, i) => doc.text(line, pageWidth / 2 + 5, 58.5 + i * 4.5));

  const blockH = Math.max(sLines.length * 4.5, (cLines.length + 1) * 4.5);
  const infoEndY = 54 + blockH;
  let startY = infoEndY + 12;
  if (p.project?.trim()) {
    const projEndY = drawProject(doc, p.project, infoEndY + 10, p.accent);
    startY = projEndY + 8;
  }

  autoTable(doc, {
    startY,
    head: [['Descrizione', 'Qtà', 'Prezzo', 'Totale']],
    body: p.items.map(it => [
      it.details?.trim() ? `${it.description}\n${it.details}` : it.description,
      fmtQty(it.quantity, it.unit),
      fmtEUR(parseNum(it.price)),
      fmtEUR(parseNum(it.quantity) * parseNum(it.price))
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: 130,
      fontStyle: 'normal',
      fontSize: 8,
      cellPadding: { top: 3, right: 4, bottom: 5, left: 4 }
    },
    bodyStyles: { fontSize: 9, cellPadding: 4, textColor: 50 },
    styles: { lineColor: [230, 230, 230], lineWidth: 0.1 },
    columnStyles: {
      0: { lineWidth: { top: 0.2, bottom: 0.1, left: 0, right: 0 } },
      1: { halign: 'center', lineWidth: { top: 0.2, bottom: 0.1, left: 0, right: 0 } },
      2: { halign: 'right', lineWidth: { top: 0.2, bottom: 0.1, left: 0, right: 0 } },
      3: { halign: 'right', lineWidth: { top: 0.2, bottom: 0.1, left: 0, right: 0 } }
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        data.cell.styles.lineWidth = { top: 0, bottom: 0.3, left: 0, right: 0 } as any;
        data.cell.styles.lineColor = [200, 200, 200];
      }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Totale', pageWidth - 60, finalY, { align: 'right' });
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text(fmtEUR(p.total), pageWidth - 15, finalY, { align: 'right' });

  drawNotes(doc, p.notes, finalY + 14, p.accent);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180);
  doc.text('Preventivo valido per 30 giorni.', 15, pageHeight - 10);
}

// ====================================================================
// DISPATCHER
// ====================================================================
export function renderTemplate(template: TemplateId, doc: jsPDF, p: PdfPayload) {
  if (template === 'modern') return renderModern(doc, p);
  if (template === 'minimal') return renderMinimal(doc, p);
  return renderClassic(doc, p);
}
