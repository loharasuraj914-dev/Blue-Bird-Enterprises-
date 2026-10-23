/**
 * Industrial PDF Generation Engine for Blue Bird Enterprises
 * Generates pristine vector A4 PDF quotations and corporate profile documents
 * using jsPDF with exact statutory tax calculations and page-break support.
 */

import { jsPDF } from 'jspdf';
import { QuotationRecord } from '../data/portalStore.ts';
import { COMPANY_DETAILS } from '../data/companyData.ts';

function formatCurrency(amount: number): string {
  if (isNaN(amount)) return 'INR 0.00';
  return 'INR ' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Generates and downloads official A4 Quotation PDF for Blue Bird Enterprises
 */
export async function generateQuotationPDF(quotation: QuotationRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 16;
      drawHeaderSmall();
    }
  };

  const drawHeaderSmall = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`BLUE BIRD ENTERPRISES — QUOTATION ${quotation.quotationNo}`, marginX, y);
    doc.text(`DATE: ${quotation.date}`, pageWidth - marginX, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 6;
  };

  // ================= 1. TOP HEADER & BRANDING =================
  // Dark navy brand emblem box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(marginX, y, 14, 14, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('BBE', marginX + 7, y + 9, { align: 'center' });

  // Company Name & Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(COMPANY_DETAILS.name, marginX + 18, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('INDUSTRIAL CLEANING • DRAINAGE SOLUTIONS • CIVIL ENGINEERING', marginX + 18, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Phone: +91 ${COMPANY_DETAILS.phone1Raw} / +91 ${COMPANY_DETAILS.phone2Raw}  |  Email: ${COMPANY_DETAILS.email}`,
    marginX + 18,
    y + 14
  );

  // Statutory Tax Box (Right Aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`GSTIN: ${COMPANY_DETAILS.gstin}`, pageWidth - marginX, y + 4, { align: 'right' });
  doc.text(`PAN: ${COMPANY_DETAILS.pan}`, pageWidth - marginX, y + 8, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('STATE CODE: 27 (MAHARASHTRA)', pageWidth - marginX, y + 12, { align: 'right' });

  y += 18;

  // Solid dark dividing rule
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.7);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 5;

  // ================= 2. QUOTATION METADATA / CLIENT DETAILS =================
  // Two-column panel: Left = Client, Right = Quote No & Dates
  const panelHeight = 32;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, panelHeight, 2, 2, 'FD');

  // Left Column: Client Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('QUOTATION ISSUED TO:', marginX + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(quotation.clientName || 'Valued Client', marginX + 4, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(quotation.companyName || 'Enterprise Facility', marginX + 4, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const clientAddr = quotation.clientAddress || 'Site Location, Navi Mumbai / Maharashtra';
  doc.text(clientAddr, marginX + 4, y + 21, { maxWidth: 95 });

  if (quotation.clientGstin) {
    doc.text(`Client GSTIN: ${quotation.clientGstin}`, marginX + 4, y + 26);
  } else {
    doc.text(`Contact: ${quotation.clientPhone}  |  ${quotation.clientEmail}`, marginX + 4, y + 26);
  }

  // Right Column: Quotation Info
  const rightColX = pageWidth - marginX - 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('QUOTATION NUMBER:', rightColX, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text(quotation.quotationNo, rightColX, y + 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date of Issue: ${quotation.date}`, rightColX, y + 16, { align: 'right' });
  doc.text(`Validity: ${quotation.validityDays} Days`, rightColX, y + 21, { align: 'right' });
  doc.text(`Status: ${quotation.status.toUpperCase()}`, rightColX, y + 26, { align: 'right' });

  y += panelHeight + 6;

  // ================= 3. LINE ITEMS TABLE =================
  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(marginX, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  const colX = {
    idx: marginX + 3,
    desc: marginX + 12,
    unit: marginX + 110,
    qty: marginX + 130,
    rate: marginX + 155,
    total: marginX + 180,
  };

  doc.text('#', colX.idx, y + 4.8);
  doc.text('DESCRIPTION OF INDUSTRIAL SERVICE', colX.desc, y + 4.8);
  doc.text('UNIT', colX.unit, y + 4.8, { align: 'center' });
  doc.text('QTY', colX.qty, y + 4.8, { align: 'right' });
  doc.text('RATE (INR)', colX.rate, y + 4.8, { align: 'right' });
  doc.text('AMOUNT (INR)', colX.total, y + 4.8, { align: 'right' });

  y += 7;

  // Table Body Rows
  quotation.items.forEach((item, index) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const splitDesc = doc.splitTextToSize(item.description, 94);
    const rowHeight = Math.max(7, splitDesc.length * 3.8 + 3);

    checkPageBreak(rowHeight + 10);

    // Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, contentWidth, rowHeight, 'F');
    }

    // Row border bottom
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, y + rowHeight, pageWidth - marginX, y + rowHeight);

    doc.setTextColor(71, 85, 105);
    doc.text(String(index + 1), colX.idx, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(splitDesc, colX.desc, y + 4.5);

    doc.setTextColor(71, 85, 105);
    doc.text(item.unit || 'Trip', colX.unit, y + 4.5, { align: 'center' });
    doc.text(String(item.quantity), colX.qty, y + 4.5, { align: 'right' });
    doc.text(item.unitRate.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.rate, y + 4.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const itemTotal = (item.quantity * item.unitRate).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    doc.text(itemTotal, colX.total, y + 4.5, { align: 'right' });

    y += rowHeight;
  });

  y += 4;
  checkPageBreak(40);

  // ================= 4. TAX CALCULATION & TOTALS =================
  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - marginX - totalsBoxWidth;

  // Total in Words (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL IN WORDS / GST TAX DECLARATION:', marginX, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const taxSummaryText = `Taxable subtotal: ${formatCurrency(quotation.subtotal)} plus 18% GST (CGST 9.0% + SGST 9.0% = ${formatCurrency(quotation.totalGst)}). Total payable: ${formatCurrency(quotation.grandTotal)}.`;
  const splitTaxSummary = doc.splitTextToSize(taxSummaryText, contentWidth - totalsBoxWidth - 6);
  doc.text(splitTaxSummary, marginX, y + 9);

  // Totals Box (Right)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsBoxX, y, totalsBoxWidth, 32, 2, 2, 'FD');

  const addTotalLine = (label: string, value: string, posY: number, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, totalsBoxX + 4, posY);
    doc.text(value, totalsBoxX + totalsBoxWidth - 4, posY, { align: 'right' });
  };

  addTotalLine('Taxable Subtotal:', formatCurrency(quotation.subtotal), y + 6);
  addTotalLine('CGST (9.0%):', formatCurrency(quotation.cgst), y + 11);
  addTotalLine('SGST (9.0%):', formatCurrency(quotation.sgst), y + 16);
  addTotalLine('Total GST (18.0%):', formatCurrency(quotation.totalGst), y + 21, true);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(totalsBoxX + 4, y + 24, totalsBoxX + totalsBoxWidth - 4, y + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('Grand Total (INR):', totalsBoxX + 4, y + 29);
  doc.text(formatCurrency(quotation.grandTotal), totalsBoxX + totalsBoxWidth - 4, y + 29, { align: 'right' });

  y += 36;
  checkPageBreak(35);

  // ================= 5. TERMS & CONDITIONS =================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS & CONDITIONS:', marginX, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  const allTerms = [
    ...(quotation.terms || []),
    'All industrial operations will be executed using mechanized suction/jetting units with trained PPE-compliant personnel.',
    'Quotation valid for 30 days from date of issue. Site accessibility to be ensured by client.',
  ];

  allTerms.slice(0, 5).forEach((term, tIdx) => {
    checkPageBreak(6);
    const splitTerm = doc.splitTextToSize(`${tIdx + 1}. ${term}`, contentWidth - 4);
    doc.text(splitTerm, marginX, y);
    y += splitTerm.length * 3.5;
  });

  y += 4;
  checkPageBreak(25);

  // ================= 6. SIGNATURE & STAMP =================
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Registered Office: Shop No. 403, Pawane Village, Turbhe MIDC, Navi Mumbai, Maharashtra - 400705',
    marginX,
    y
  );
  doc.text('Computer-generated quotation subject to final physical site verification.', marginX, y + 3.5);

  // Proprietor Signature Right
  const signX = pageWidth - marginX;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${COMPANY_DETAILS.name}`, signX, y, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(COMPANY_DETAILS.founder, signX, y + 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(COMPANY_DETAILS.founderRole, signX, y + 13.5, { align: 'right' });

  // ================= 7. FOOTER PAGE NUMBERS =================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages}  •  ${COMPANY_DETAILS.name}  •  Official GST Quotation`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Save the document with clean, professional filename
  const cleanNo = quotation.quotationNo.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Blue_Bird_Enterprises_Quotation_${cleanNo}.pdf`);
}

/**
 * Official Attached Company Profile & Capabilities Document Path
 */
export const OFFICIAL_COMPANY_PROFILE_PDF_URL = '/assets/aistudio/Blue_Bird_Enterprises_-_Company_Profile__2__b96af8de.pdf';
export const OFFICIAL_COMPANY_PROFILE_FILENAME = 'Blue_Bird_Enterprises_Company_Profile.pdf';

/**
 * Downloads the official Corporate Profile & Capabilities Document PDF (attached 3-page brochure)
 */
export async function generateCompanyProfilePDF(): Promise<void> {
  const filename = OFFICIAL_COMPANY_PROFILE_FILENAME;
  const pdfUrl = OFFICIAL_COMPANY_PROFILE_PDF_URL;

  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to load corporate profile PDF: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory after browser trigger
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 2000);
  } catch (error) {
    console.warn('Blob fetch failed, falling back to direct anchor link download:', error);
    // Direct link fallback
    const fallbackLink = document.createElement('a');
    fallbackLink.href = pdfUrl;
    fallbackLink.download = filename;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
  }
}

