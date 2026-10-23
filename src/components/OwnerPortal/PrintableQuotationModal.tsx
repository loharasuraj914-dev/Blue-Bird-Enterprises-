import React, { useState } from 'react';
import { X, Printer, Download, AlertCircle, Loader2 } from 'lucide-react';
import { QuotationRecord } from '../../data/portalStore.ts';
import { COMPANY_DETAILS } from '../../data/companyData.ts';
import { formatINR } from '../../utils/quotation.ts';
import { generateQuotationPDF } from '../../utils/pdfGenerator.ts';

interface PrintableQuotationModalProps {
  quotation: QuotationRecord | null;
  onClose: () => void;
}

export const PrintableQuotationModal: React.FC<PrintableQuotationModalProps> = ({
  quotation,
  onClose,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      await generateQuotationPDF(quotation);
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfError('Failed to generate PDF. Please try again or use the Print button.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in print-modal-overlay">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl relative my-6 max-h-[92vh] flex flex-col overflow-hidden print-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm sm:text-base">
              Official Quotation — {quotation.quotationNo}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
              quotation.status === 'accepted' ? 'bg-emerald-900/80 text-emerald-300' :
              quotation.status === 'sent' ? 'bg-blue-900/80 text-blue-300' :
              'bg-slate-800 text-slate-300'
            }`}>
              {quotation.status}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Save PDF Button */}
            <button
              onClick={handleSavePdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Download official PDF file"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Save PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Print document to printer or PDF driver"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close quote preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error notification if PDF failed */}
        {pdfError && (
          <div className="no-print p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{pdfError}</span>
            </div>
            <button
              onClick={() => setPdfError(null)}
              className="text-xs text-rose-600 hover:text-rose-900 font-bold ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Printable Official Letterhead Voucher */}
        <div className="p-6 sm:p-10 overflow-y-auto print-page font-sans text-slate-800 space-y-6 bg-white">
          
          {/* Header & Logo Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-start justify-between gap-4 print-avoid-break">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-blue-400 fill-current" viewBox="0 0 24 24">
                  <path d="M21 4c-2.5 1-4 3-5 5-1.5-1-3.5-1.5-5.5-1-3 0.8-5 3.5-5.5 6.5C4 15 3 17 2 19c3-0.5 5.5-2 7-4 1.5 0.5 3 0.5 4.5 0 2.5-1 4.5-3 5.5-5.5 1-0.5 2-0.5 2.5-0.5-0.5 1.5-1.5 3-2.5 4 1 0 2-0.5 3-1.5 0.5 2-0.5 4-2 5 2-0.5 3.5-2 4-4 0.5-2-0.5-4-1.5-5.5 1.5-1 2-2 2-3.5-1 0.5-2 0.8-3 0.5z" />
                </svg>
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-slate-950 tracking-tight">
                  {COMPANY_DETAILS.name}
                </h1>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Industrial Cleaning • Drainage Management • Civil Engineering
                </p>
                <p className="text-[11px] text-slate-600">
                  Shop No. 403, Pawane Village, Turbhe MIDC, Navi Mumbai, Maharashtra - 400705
                </p>
                <p className="text-[11px] text-slate-600">
                  Phone: +91 {COMPANY_DETAILS.phone1Raw} / +91 {COMPANY_DETAILS.phone2Raw} | Email: {COMPANY_DETAILS.email}
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <div><strong className="text-slate-900">GSTIN:</strong> {COMPANY_DETAILS.gstin}</div>
              <div><strong className="text-slate-900">PAN:</strong> {COMPANY_DETAILS.pan}</div>
              <div className="text-blue-700 font-bold">STATE: 27 (MAHARASHTRA)</div>
            </div>
          </div>

          {/* Quotation Metadata & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 print-avoid-break">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                Quotation Issued To
              </span>
              <div className="font-bold text-slate-950 text-sm mb-0.5">{quotation.clientName}</div>
              <div className="font-semibold text-slate-800">{quotation.companyName}</div>
              <div className="text-slate-600">{quotation.clientAddress || 'Site Location, Navi Mumbai / Maharashtra'}</div>
              {quotation.clientGstin && (
                <div className="font-mono text-slate-700 mt-1">Client GSTIN: {quotation.clientGstin}</div>
              )}
              <div className="text-slate-600 mt-1">Phone: {quotation.clientPhone} | {quotation.clientEmail}</div>
            </div>

            <div className="sm:text-right space-y-1">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Quotation Number</span>
                <span className="font-mono font-extrabold text-blue-700 text-base">{quotation.quotationNo}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Date of Issue: </span>
                <span className="font-semibold text-slate-800">{quotation.date}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Validity: </span>
                <span className="text-slate-700">{quotation.validityDays} Days from Date of Issue</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto print-avoid-break">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Industrial Service</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate (INR)</th>
                  <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotation.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-3 px-3 text-right font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(item.unitRate)}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      {formatINR(item.quantity * item.unitRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2 print-avoid-break">
            <div className="flex-1 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block mb-1">Total in Words & Tax Computation:</span>
              <p className="italic text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                INR {formatINR(quotation.grandTotal)} inclusive of 18% GST (CGST 9.0% + SGST 9.0%).
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-semibold">{formatINR(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9.0%):</span>
                <span className="font-mono">{formatINR(quotation.cgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9.0%):</span>
                <span className="font-mono">{formatINR(quotation.sgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1 font-semibold">
                <span>Total GST (18.0%):</span>
                <span className="font-mono">{formatINR(quotation.totalGst)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-blue-900 border-t-2 border-slate-900 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono">{formatINR(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-xs space-y-2 border-t border-slate-200 pt-4 print-avoid-break">
            <span className="font-bold text-slate-900 uppercase text-[11px] block">
              Terms & Conditions
            </span>
            <ul className="list-decimal pl-5 space-y-1 text-slate-600 text-[11px]">
              {quotation.terms.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
              <li>Safety: Operations will be 100% mechanized. No hazardous manual scavenging.</li>
              <li>Statutory taxes applicable as per Government of India GST notifications.</li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6 print-avoid-break">
            <div className="text-[11px] text-slate-500 max-w-xs">
              This is a computer-generated quotation issued by Blue Bird Enterprises subject to final physical site verification.
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 mb-8">
                For BLUE BIRD ENTERPRISES
              </div>
              <div className="border-t border-slate-400 pt-1 text-xs text-slate-700">
                <div className="font-bold">{COMPANY_DETAILS.founder}</div>
                <div className="text-[10px] text-slate-500">{COMPANY_DETAILS.founderRole}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
