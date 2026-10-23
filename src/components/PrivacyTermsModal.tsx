import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/companyData.ts';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl relative my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="font-heading text-lg font-bold">
              {type === 'privacy' ? 'Privacy Policy & Data Notice' : 'Terms of Use & Industrial Service Notice'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-xs sm:text-sm text-slate-700 space-y-4 max-h-[70vh] overflow-y-auto leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>Blue Bird Enterprises</strong> ("we", "us", or "our") is committed to protecting the privacy of industrial clients, facility engineers, and visitors who interact with our website and submit service inquiries.
              </p>
              
              <h4 className="font-bold text-slate-900 text-sm">1. Information Collection</h4>
              <p>
                When you request a quotation, callback, or service schedule, we collect business contact information including your name, company/plant name, mobile number, email, and site location in Maharashtra. We do not sell or rent this information to any third-party marketing brokers.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Purpose of Use</h4>
              <p>
                Information provided is strictly utilized to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Prepare and deliver technical scopes of work and GST quotations.</li>
                <li>Conduct preliminary site surveys and coordinate suction tanker mobilization.</li>
                <li>Follow up on scheduled callback appointments requested by clients.</li>
                <li>Maintain statutory billing and audit records in accordance with Indian tax laws (GSTIN: 27EFDPP3303H1ZL).</li>
              </ul>

              <h4 className="font-bold text-slate-900 text-sm">3. Security & Retention</h4>
              <p>
                Operational inquiries and quotations are stored securely and accessible only to authorized managerial personnel under Sarita Sinod Piwal (Proprietor). You may request deletion or correction of your contact records at any time by emailing <code>surupiwal@gmail.com</code>.
              </p>
            </>
          ) : (
            <>
              <p>
                Welcome to the official website of <strong>Blue Bird Enterprises</strong>, located at Pawane Village, Shop No. 403, Turbhe MIDC, Navi Mumbai, Maharashtra.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">1. Site Assessment & Quotation Validity</h4>
              <p>
                All preliminary quotations and telephone estimates are indicative. Final pricing, equipment mobilization, and operational timelines are subject to physical on-site inspection, volume of sludge, pipe accessibility, and plant hazard guidelines. Quotations remain valid for 30 calendar days from issuance unless otherwise specified.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Safety & Zero Manual Scavenging Compliance</h4>
              <p>
                Blue Bird Enterprises adheres to strict occupational safety policies. Operations are 100% mechanized through vacuum suction tankers and high-velocity jetting. We do not permit hazardous manual scavenging. Industrial clients must provide safe vehicular access, water connections for jetting, and clear hazard disclosures regarding chemical compositions.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Client Relationships & Intellectual Property</h4>
              <p>
                All company-reported industrial client names and relationships are displayed for identification purposes based on internal service records, subject to authorization and verification. All website content, photography, and documentation are proprietary to Blue Bird Enterprises.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">4. Jurisdiction</h4>
              <p>
                Any contractual dispute arising out of commercial service engagements shall be governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Navi Mumbai / Thane, Maharashtra.
              </p>
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
