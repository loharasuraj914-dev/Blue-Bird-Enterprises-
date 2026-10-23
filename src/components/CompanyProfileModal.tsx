import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  FileText,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { COMPANY_DETAILS, CLIENTS_LIST } from '../data/companyData.ts';
import {
  generateCompanyProfilePDF,
  OFFICIAL_COMPANY_PROFILE_FILENAME,
} from '../utils/pdfGenerator.ts';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({ isOpen, onClose }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    setDownloadSuccess(false);
    try {
      await generateCompanyProfilePDF();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Company Profile PDF error:', err);
      setPdfError('Failed to download PDF. Please try again or use the Print button.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in print-modal-overlay">
      <div
        className="bg-white rounded-2xl max-w-5xl w-full border border-slate-300 shadow-2xl relative my-4 max-h-[94vh] flex flex-col overflow-hidden print-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white p-3.5 sm:p-4 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm sm:text-base leading-none">
                  Corporate Profile & Capabilities Document
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold">
                  Official 3-Page Document
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Blue Bird Enterprises • Turbhe MIDC, Navi Mumbai
              </span>
            </div>
          </div>

          {/* Action Buttons — Save PDF, Print, and Red Cancel Button on Top Right */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap ml-auto">
            {/* Save PDF Button - Downloads Attached PDF */}
            <button
              onClick={handleSavePdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Download official attached Corporate Profile PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved PDF!</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Top-Right Red Cancel Button */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
              aria-label="Cancel and close Company Profile"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Success / Error Feedback Banners */}
        {downloadSuccess && (
          <div className="no-print p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between px-6 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Success:</strong> Official Corporate Profile document (
                <code>{OFFICIAL_COMPANY_PROFILE_FILENAME}</code>) downloaded successfully.
              </span>
            </div>
            <button
              onClick={() => setDownloadSuccess(false)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

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

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto print-page font-sans text-slate-800 space-y-8 bg-white max-h-[80vh]">
          {/* Document Header on Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start justify-between gap-4 print-avoid-break">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-blue-400 fill-current" viewBox="0 0 24 24">
                  <path d="M21 4c-2.5 1-4 3-5 5-1.5-1-3.5-1.5-5.5-1-3 0.8-5 3.5-5.5 6.5C4 15 3 17 2 19c3-0.5 5.5-2 7-4 1.5 0.5 3 0.5 4.5 0 2.5-1 4.5-3 5.5-5.5 1-0.5 2-0.5 2.5-0.5-0.5 1.5-1.5 3-2.5 4 1 0 2-0.5 3-1.5 0.5 2-0.5 4-2 5 2-0.5 3.5-2 4-4 0.5-2-0.5-4-1.5-5.5 1.5-1 2-2 2-3.5-1 0.5-2 0.8-3 0.5z" />
                </svg>
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-950 tracking-tight">
                  {COMPANY_DETAILS.name}
                </h1>
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  {COMPANY_DETAILS.tagline}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Experience: {COMPANY_DETAILS.experience} | Turbhe MIDC, Navi Mumbai, Maharashtra
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-1 font-mono text-slate-600 sm:border-l sm:border-slate-200 sm:pl-6">
              <div>
                <strong className="text-slate-900">GSTIN:</strong> {COMPANY_DETAILS.gstin}
              </div>
              <div>
                <strong className="text-slate-900">PAN:</strong> {COMPANY_DETAILS.pan}
              </div>
              <div>
                <strong className="text-slate-900">State:</strong> 27 (Maharashtra)
              </div>
            </div>
          </div>

          {/* Corporate Profile Summary */}
          <div className="print-avoid-break">
            <h2 className="font-heading font-bold text-lg text-slate-900 mb-2 border-b border-slate-200 pb-1">
              1. Corporate Profile & Field Leadership
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
              Blue Bird Enterprises is a premier and professionally managed industrial
              environmental sanitation, vacuum tanker operations, drainage infrastructure
              maintenance, and civil works engineering contractor headquartered in Turbhe MIDC,
              Navi Mumbai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">
                  Proprietorship
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {COMPANY_DETAILS.founder}
                </span>
                <span className="text-slate-600 block text-xs">Founder & Proprietor</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">
                  Registered Address
                </span>
                <span className="text-slate-800 font-medium">{COMPANY_DETAILS.address}</span>
              </div>
            </div>
          </div>

          {/* Strategic Vision & Commitment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print-avoid-break">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 uppercase text-[10px] block mb-1">
                Strategic Vision
              </span>
              <p className="text-slate-800 italic leading-relaxed">
                "{COMPANY_DETAILS.strategicVision}"
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1">
                Management Commitment
              </span>
              <p className="text-slate-800 font-bold mb-1">
                "{COMPANY_DETAILS.managementCommitment}"
              </p>
              <p className="text-slate-600 leading-relaxed">
                Adherence to statutory norms, non-manual mechanized methods, transparent invoicing,
                and safety standards.
              </p>
            </div>
          </div>

          {/* Service Disciplines Catalog */}
          <div className="print-avoid-break">
            <h2 className="font-heading font-bold text-lg text-slate-900 mb-2 border-b border-slate-200 pb-1">
              2. Core Industrial Service Disciplines
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xs uppercase text-blue-800 tracking-wider mb-1">
                  A. Industrial Cleaning & Mechanized Suction Operations
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Mechanized Suction Vehicle Operations (O2Zone Tankers)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Industrial Sludge Evacuation & Viscous Sediment Removal
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ETP & STP Aerobic/Anaerobic Tank Desludging
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Neutralized Liquid Chemical Waste Extraction
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Underground and Overhead Water Tank Mechanized Cleaning
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-blue-800 tracking-wider mb-1">
                  B. Drainage & Sewer Management
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    High-Pressure Water Jetting for Industrial Pipe Scouring
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Main Sewer Line De-Choking & Hydraulic Restoration
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Septic Tank Vacuum Cleaning (Zero Scavenging)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Monsoon Storm Water Drain & Culvert Upkeep
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase text-blue-800 tracking-wider mb-1">
                  C. Civil Engineering Infrastructure
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Civil Repair & Concrete Trench Reinstatement
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Manhole & Inspection Chamber Construction (Brick/RCC)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Heavy Duty CI / DI Manhole Cover Installation
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    RCC Hume Pipe Laying & Utility Trench Excavation
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Esteemed Industrial Clients */}
          <div className="print-avoid-break">
            <h2 className="font-heading font-bold text-lg text-slate-900 mb-2 border-b border-slate-200 pb-1">
              3. Esteemed Industrial Clients
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CLIENTS_LIST.map((client, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                >
                  <span className="font-bold text-slate-900 block truncate">{client.name}</span>
                  <span className="text-[11px] text-slate-500">{client.sector}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Machinery & Safety Protocol */}
          <div className="print-avoid-break">
            <h2 className="font-heading font-bold text-lg text-slate-900 mb-2 border-b border-slate-200 pb-1">
              4. Machinery, Fleet & Safety Protocol
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">Mechanized Fleet</span>
                <p className="text-slate-600 text-[11px]">
                  Eicher-mounted O2Zone high-vacuum displacement suction tankers, equipped with
                  reinforced heavy diameter hoses and auxiliary pumps.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">Safety Equipment</span>
                <p className="text-slate-600 text-[11px]">
                  Certified personal protective equipment (safety helmets, high-vis vests,
                  acid-resistant gumboots, heavy-duty gloves, respiratory masks).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900 block mb-1">Environmental Stance</span>
                <p className="text-slate-600 text-[11px]">
                  Zero manual scavenging policy. Enclosed transport preventing leakages. Full
                  compliance with applicable local industrial hygiene regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Signatory & Official Endorsement */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print-avoid-break">
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>
                <strong>Telephone Lines:</strong> {COMPANY_DETAILS.phone1} /{' '}
                {COMPANY_DETAILS.phone2}
              </div>
              <div>
                <strong>Official Email:</strong> {COMPANY_DETAILS.email}
              </div>
              <div>
                <strong>Base of Operations:</strong> Turbhe MIDC, Navi Mumbai, Maharashtra
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 mb-8">
                For BLUE BIRD ENTERPRISES
              </div>
              <div className="border-t border-slate-400 pt-1 text-xs text-slate-700">
                <div className="font-bold">{COMPANY_DETAILS.founder}</div>
                <div className="text-[11px] text-slate-500">{COMPANY_DETAILS.founderRole}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
