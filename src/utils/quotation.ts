/**
 * Quotation calculations and formatting for Blue Bird Enterprises
 * Standard industrial quotation calculations with GST (CGST 9% + SGST 9% or IGST 18%).
 */

export interface QuotationLineItem {
  id: string;
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
