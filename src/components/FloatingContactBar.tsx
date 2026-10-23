import React, { useState } from 'react';
import { Phone, MessageSquare, PhoneCall, X, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/companyData.ts';
import { validateIndianPhone, sanitizeTenDigitMobile } from '../utils/validation.ts';
import { PortalStorage } from '../data/portalStore.ts';
import { SupabaseService } from '../services/supabaseService.ts';

export const FloatingContactBar: React.FC = () => {
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showCallbackPopup, setShowCallbackPopup] = useState(false);

  // Callback Form State
  const [cbName, setCbName] = useState('');
  const [cbCompany, setCbCompany] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbTime, setCbTime] = useState('Morning (9 AM - 1 PM)');
  const [cbConsent, setCbConsent] = useState(false);
  const [cbError, setCbError] = useState('');
  const [cbSuccessRef, setCbSuccessRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
      COMPANY_DETAILS.whatsappDefaultMsg
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Submit Callback Request
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCbError('');

    if (!cbName.trim()) {
      setCbError('Please enter your name.');
      return;
    }

    if (!validateIndianPhone(cbPhone)) {
      setCbError('Please enter a valid 10-digit Indian mobile number (e.g. 98678 33456).');
      return;
    }

    if (!cbConsent) {
      setCbError('Please check the consent box to allow us to call you.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await SupabaseService.submitCallbackRequest({
        customerName: cbName.trim(),
        companyName: cbCompany.trim() || 'Industrial Client',
        phone: cbPhone.trim(),
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: cbTime,
        notes: `Direct callback request from floating contact bar. Preferred window: ${cbTime}`,
      });

      setIsSubmitting(false);
      if (result.success) {
        setCbSuccessRef(result.referenceNo);
      } else {
        setCbError('Unable to submit callback request. Please try calling directly.');
      }
    } catch {
      setIsSubmitting(false);
      setCbError('Error saving request to database. Please call directly.');
    }
  };

  const handleResetCallback = () => {
    setCbSuccessRef(null);
    setCbName('');
    setCbCompany('');
    setCbPhone('');
    setCbTime('Morning (9 AM - 1 PM)');
    setCbConsent(false);
    setCbError('');
    setShowCallbackPopup(false);
  };

  return (
    <>
      {/* 
        ========================================================================
        MOBILE & DESKTOP FLOATING BAR
        Order strictly required: 1. Call | 2. WhatsApp | 3. Call Back
        ========================================================================
      */}

      {/* MOBILE BAR: Fixed bottom bar, clean, minimalist with safe-area spacing */}
      <nav
        aria-label="Quick Contact Bar"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          {/* 1. CALL */}
          <button
            onClick={() => setShowCallPopup(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800/90 text-white hover:bg-slate-700/90 active:scale-95 transition-all text-center cursor-pointer border border-slate-700/60 shadow-xs"
            aria-label="Call Blue Bird Enterprises"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center mb-1">
              <Phone className="w-4 h-4 text-blue-300" />
            </div>
            <span className="text-[11px] font-bold tracking-tight">Call</span>
          </button>

          {/* 2. WHATSAPP */}
          <button
            onClick={handleWhatsAppClick}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition-all text-center cursor-pointer border border-emerald-500/80 shadow-md shadow-emerald-950/40"
            aria-label="Chat on WhatsApp"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center mb-1">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[11px] font-bold tracking-tight">WhatsApp</span>
          </button>

          {/* 3. CALL BACK */}
          <button
            onClick={() => {
              setCbSuccessRef(null);
              setShowCallbackPopup(true);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all text-center cursor-pointer border border-blue-500/80 shadow-md shadow-blue-950/40"
            aria-label="Request a Callback"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center mb-1">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold tracking-tight">Call Back</span>
          </button>
        </div>
      </nav>

      {/* DESKTOP FLOATING DOCK: Fixed bottom-right elegant minimalist pill */}
      <aside
        aria-label="Floating Contact Dock"
        className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-1.5 p-1.5 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl ring-1 ring-white/10"
      >
        {/* 1. CALL */}
        <button
          onClick={() => setShowCallPopup(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Click to view contact numbers"
        >
          <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <span>Call</span>
        </button>

        <span className="w-px h-5 bg-slate-800"></span>

        {/* 2. WHATSAPP */}
        <button
          onClick={handleWhatsAppClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
          title="Chat on WhatsApp"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
          </div>
          <span>WhatsApp</span>
        </button>

        <span className="w-px h-5 bg-slate-800"></span>

        {/* 3. CALL BACK */}
        <button
          onClick={() => {
            setCbSuccessRef(null);
            setShowCallbackPopup(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-950/40 transition-all cursor-pointer"
          title="Schedule an instant callback"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <span>Call Back</span>
        </button>
      </aside>

      {/* 
        ========================================================================
        CALL SELECTION POPUP (Shows both numbers clearly with click-to-call)
        ========================================================================
      */}
      {showCallPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowCallPopup(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-sm">
                    Call Blue Bird Enterprises
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Operations Desk • Turbhe MIDC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCallPopup(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close call modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Select a phone line to initiate a call directly with our technical operations team:
            </p>

            {/* Both Phone Numbers */}
            <div className="space-y-2.5 mb-4">
              {/* Number 1 */}
              <a
                href={`tel:+91${COMPANY_DETAILS.phone1Raw}`}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 block">
                    Line 1 (Primary Operations)
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 group-hover:text-blue-700">
                    +91 98678 33456
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold group-hover:bg-blue-700">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </span>
              </a>

              {/* Number 2 */}
              <a
                href={`tel:+91${COMPANY_DETAILS.phone2Raw}`}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 block">
                    Line 2 (Secondary Line)
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                    +91 99873 24798
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold group-hover:bg-emerald-700">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </span>
              </a>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Available Monday – Saturday: 8 AM – 8 PM (24/7 Emergency Support)
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        CALL BACK POPUP (Small, elegant compact form)
        ========================================================================
      */}
      {showCallbackPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowCallbackPopup(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-sm">
                    Request a Scheduled Callback
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    We'll call you back at your convenience
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCallbackPopup(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close callback modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cbSuccessRef ? (
              <div className="py-4 text-center animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-heading font-bold text-slate-900 text-base mb-1">
                  Callback Request Received
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  Our operations desk will contact you at your preferred time.
                </p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 inline-block">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Reference Number</div>
                  <div className="font-mono text-base font-extrabold text-blue-700">{cbSuccessRef}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleResetCallback}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 mt-3">
                  * A callback request is confirmed once reviewed by our operations supervisor.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="space-y-3 text-xs">
                {cbError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{cbError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cbName}
                    onChange={(e) => setCbName(e.target.value)}
                    placeholder="e.g. Anand Shinde"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50 focus:border-blue-600"
                  />
                </div>

                {/* Company Name (optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Company / Plant Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={cbCompany}
                    onChange={(e) => setCbCompany(e.target.value)}
                    placeholder="e.g. Apex Industries"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50 focus:border-blue-600"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mobile Number * (10 Digits)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-slate-500">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                      value={cbPhone}
                      onChange={(e) => setCbPhone(sanitizeTenDigitMobile(e.target.value))}
                      placeholder="9867833456"
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50 focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>

                {/* Preferred Callback Time (optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Preferred Callback Time <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={cbTime}
                    onChange={(e) => setCbTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-slate-50 focus:border-blue-600"
                  >
                    <option value="Morning (9 AM - 1 PM)">Morning (9:00 AM – 1:00 PM)</option>
                    <option value="Afternoon (1 PM - 5 PM)">Afternoon (1:00 PM – 5:00 PM)</option>
                    <option value="Evening (5 PM - 8 PM)">Evening (5:00 PM – 8:00 PM)</option>
                    <option value="Immediate / Emergency Call">Immediate / Emergency Call</option>
                  </select>
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="cb-consent-floating"
                    checked={cbConsent}
                    onChange={(e) => setCbConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded-sm border-slate-300 text-blue-600"
                  />
                  <label htmlFor="cb-consent-floating" className="text-[10px] text-slate-600 leading-normal cursor-pointer">
                    I consent to receiving a telephone call from Blue Bird Enterprises.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  Subject to review by operations supervisor.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
