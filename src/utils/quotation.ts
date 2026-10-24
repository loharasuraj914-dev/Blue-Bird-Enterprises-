/**
 * Quotation calculations and formatting for Blue Bird Enterprises
 * Standard industrial quotation calculations with GST (CGST 9% + SGST 9% or IGST 18%).
 */

import { SERVICES_DATA } from '../data/companyData.ts';

export const MANUAL_SERVICE_OPTION_VALUE = '__manual__';

export interface QuotationServicePreset {
  id: string;
  title: string;
  categoryTitle: string;
  defaultDescription: string;
  defaultUnit: string;
  defaultRate: number;
}

const DEFAULT_RATES_BY_SERVICE_ID: Record<string, { unit: string; rate: number }> = {
  'suction-vehicle-ops': { unit: 'Trip', rate: 8500 },
  'industrial-sludge-evacuation': { unit: 'Trip', rate: 9500 },
  'etp-stp-cleaning': { unit: 'Job', rate: 18000 },
  'liquid-waste-extraction': { unit: 'Trip', rate: 7500 },
  'water-tank-cleaning': { unit: 'Tank', rate: 6500 },
  'drain-jetting': { unit: 'Shift', rate: 12000 },
  'sewer-line-dechoking': { unit: 'Job', rate: 8500 },
  'stormwater-drain-upkeep': { unit: 'Running Mtr', rate: 450 },
  'septic-tank-cleaning': { unit: 'Trip', rate: 7500 },
  'civil-repair-reconstruction': { unit: 'Lump Sum', rate: 25000 },
  'manhole-chamber-building': { unit: 'Nos', rate: 14500 },
  'concrete-pipeline-laying': { unit: 'Running Mtr', rate: 1850 },
};

export const QUOTATION_SERVICE_PRESETS: QuotationServicePreset[] = SERVICES_DATA.map((service) => {
  const defaults = DEFAULT_RATES_BY_SERVICE_ID[service.id] || { unit: 'Job', rate: 8500 };
  return {
    id: service.id,
    title: service.title,
    categoryTitle: service.categoryTitle,
    defaultDescription: service.title,
    defaultUnit: defaults.unit,
    defaultRate: defaults.rate,
  };
});

export interface QuotationLineItem {
  id: string;
  serviceOption?: string; // service title or '__manual__'
  description: string;
  unit: string; // e.g. 'Trip', 'Per Meter', 'Day', 'Fixed'
  quantity: number;
  unitRate: number;
}

export interface QuotationSummary {
  subtotal: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  grandTotal: number;
}

export function calculateQuotationTotals(
  items: QuotationLineItem[],
  isInterState = false,
  gstRate = 0.18
): QuotationSummary {
  const subtotal = items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.unitRate) || 0;
    return acc + (qty * rate);
  }, 0);

  const totalGst = Math.round(subtotal * gstRate * 100) / 100;
  const cgst = isInterState ? 0 : Math.round((totalGst / 2) * 100) / 100;
  const sgst = isInterState ? 0 : Math.round((totalGst - cgst) * 100) / 100;
  const grandTotal = Math.round((subtotal + totalGst) * 100) / 100;

  return {
    subtotal,
    cgst,
    sgst,
    totalGst,
    grandTotal
  };
}

export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
}

export function generateQuotationNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(3, '0');
  return `BBE-QT-${year}-${padded}`;
}

