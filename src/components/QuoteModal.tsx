import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { validateIndianPhone, validateEmail } from '../utils/validation.ts';
import { PortalStorage } from '../data/portalStore.ts';
import { SupabaseService } from '../services/supabaseService.ts';
import { COMPANY_DETAILS, SERVICES_DATA } from '../data/companyData.ts';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledService?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  prefilledService,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [serviceRequired, setServiceRequired] = useState(prefilledService || SERVICES_DATA[0].title);
  const [siteLocation, setSiteLocation] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [preferredCallbackTime, setPreferredCallbackTime] = useState('Morning (9 AM - 1 PM)');
  const [consentChecked, setConsentChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefilledService) {
      setServiceRequired(prefilledService);
    }
  }, [prefilledService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your contact name.');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('Please enter your company / plant name.');
      return;
    }
    if (!validateIndianPhone(mobileNumber)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 98678 33456).');
      return;
    }
    if (email && !validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!siteLocation.trim()) {
      setErrorMsg('Please enter your site location or MIDC area.');
      return;
    }
    if (!workDescription.trim()) {
      setErrorMsg('Please enter brief work details or pit/tank capacity.');
      return;
    }
    if (!consentChecked) {
      setErrorMsg('Please confirm your consent to be contacted.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await SupabaseService.submitCustomerEnquiry({
        customerName: customerName.trim(),
        companyName: companyName.trim(),
        phone: mobileNumber.trim(),
        email: email.trim(),
        requestedService: serviceRequired,
        siteLocation: siteLocation.trim(),
        preferredCallback: preferredCallbackTime,
        workDescription: workDescription.trim(),
      });

      setIsSubmitting(false);
      if (res.success) {
        setSuccessRef(res.referenceNo);
      } else {
        setErrorMsg('Unable to save quotation request. Please call our desk directly.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Error saving quotation request to database. Please call directly.');
    }
  };

  const handleClose = () => {
    setSuccessRef(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl relative my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              {COMPANY_DETAILS.name}
            </div>
            <h3 className="font-heading text-lg font-bold">
              Request a Free Quotation & Scope
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close quote modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successRef ? (
            <div className="text-center py-6 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-heading text-xl font-bold text-slate-900 mb-1">
                Quotation Request Logged
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mb-5">
                Our technical supervisor will examine your requirement and prepare a formal estimate.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 inline-block mb-5">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Reference Number</div>
                <div className="font-mono text-lg font-extrabold text-blue-700">{successRef}</div>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
                    `Hello Blue Bird Enterprises, I requested a quote for ${serviceRequired}. Ref: ${successRef}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Forward to WhatsApp
                </a>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Anand Shinde"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company / Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Industries"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-slate-500">+91</span>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="98678 33456"
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Required *
                </label>
                <select
                  value={serviceRequired}
                  onChange={(e) => setServiceRequired(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50"
                >
                  {SERVICES_DATA.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.categoryTitle}: {s.title}
                    </option>
                  ))}
                  <option value="Turnkey Drainage / Industrial Cleaning">Turnkey Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Site Location (MIDC / Town in Maharashtra) *
                </label>
                <input
                  type="text"
                  required
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  placeholder="e.g. Turbhe MIDC / Taloja / Rabale"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Work Details & Scope *
                </label>
                <textarea
                  required
                  rows={2}
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Sludge volume, chamber depth, choke symptoms..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50"
                ></textarea>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="modal-consent"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded-sm border-slate-300 text-blue-600"
                />
                <label htmlFor="modal-consent" className="text-[11px] text-slate-600 leading-normal">
                  I consent to Blue Bird Enterprises contacting me regarding this service inquiry.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quotation Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
