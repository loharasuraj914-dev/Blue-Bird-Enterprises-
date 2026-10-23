import React, { useState } from 'react';
import { Send, Phone, MessageSquare, CheckCircle, AlertCircle, Calendar, Clock, FileUp, Shield, ClipboardCheck, Sparkles } from 'lucide-react';
import {
  validateIndianPhone,
  sanitizeTenDigitMobile,
  validateQuoteMandatoryFields,
} from '../utils/validation.ts';
import { SupabaseService } from '../services/supabaseService.ts';
import { COMPANY_DETAILS, SERVICES_DATA } from '../data/companyData.ts';

interface InquiryQuoteSectionProps {
  initialService?: string;
  onSuccessSubmitted?: () => void;
}

export const InquiryQuoteSection: React.FC<InquiryQuoteSectionProps> = ({
  initialService = '',
  onSuccessSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'quote' | 'callback' | 'booking'>('quote');

  // 1. Quote Form State
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [serviceRequired, setServiceRequired] = useState(initialService || SERVICES_DATA[0].title);
  const [siteLocation, setSiteLocation] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [preferredCallbackTime, setPreferredCallbackTime] = useState('Morning (9 AM - 1 PM)');
  const [consentChecked, setConsentChecked] = useState(true);
  const [fileName, setFileName] = useState('');

  // 2. Callback Form State
  const [cbName, setCbName] = useState('');
  const [cbCompany, setCbCompany] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbDate, setCbDate] = useState('');
  const [cbTime, setCbTime] = useState('11:00 AM');
  const [cbNotes, setCbNotes] = useState('');
  const [cbConsent, setCbConsent] = useState(false);

  // 3. Service Booking Form State
  const [bkName, setBkName] = useState('');
  const [bkCompany, setBkCompany] = useState('');
  const [bkPhone, setBkPhone] = useState('');
  const [bkEmail, setBkEmail] = useState('');
  const [bkService, setBkService] = useState(SERVICES_DATA[0].title);
  const [bkAddress, setBkAddress] = useState('');
  const [bkDate, setBkDate] = useState('');
  const [bkTime, setBkTime] = useState('09:30 AM');
  const [bkNotes, setBkNotes] = useState('');
  const [bkConsent, setBkConsent] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<'quotation' | 'callback' | 'booking'>('quotation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit Customer Enquiry -> customer_enquiries (Only Name, Company/Facility Name, and 10-Digit Mobile mandatory)
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validation = validateQuoteMandatoryFields({
      customerName,
      companyName,
      mobileNumber,
      email,
    });

    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please check the required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const descriptionWithFile =
        (workDescription.trim() || 'Quotation requested') +
        (fileName ? ` [Spec doc: ${fileName}]` : '');

      const res = await SupabaseService.submitCustomerEnquiry({
        customerName: customerName.trim(),
        companyName: companyName.trim(),
        phone: sanitizeTenDigitMobile(mobileNumber),
        email: email.trim(),
        requestedService: serviceRequired || SERVICES_DATA[0].title,
        siteLocation: siteLocation.trim() || 'Not specified',
        preferredCallback: preferredCallbackTime,
        workDescription: descriptionWithFile,
      });

      setIsSubmitting(false);
      if (res.success) {
        setSuccessRef(res.referenceNo);
        setSuccessType('quotation');
        if (onSuccessSubmitted) onSuccessSubmitted();
      } else {
        setErrorMsg('Failed to save inquiry. Please call our desk directly at ' + COMPANY_DETAILS.phone1);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Error saving inquiry to database. Please call our desk directly.');
    }
  };

  // Submit Callback Request -> callback_requests
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cbName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!validateIndianPhone(cbPhone)) {
      setErrorMsg('Please provide a valid 10-digit Indian mobile number.');
      return;
    }
    if (!cbDate) {
      setErrorMsg('Please select your preferred callback date.');
      return;
    }
    if (!cbConsent) {
      setErrorMsg('Please confirm your consent to be contacted.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await SupabaseService.submitCallbackRequest({
        customerName: cbName.trim(),
        companyName: cbCompany.trim() || 'Industrial Client',
        phone: cbPhone.trim(),
        preferredDate: cbDate,
        preferredTime: cbTime,
        notes: cbNotes.trim() || 'General industrial inquiry callback request',
      });

      setIsSubmitting(false);
      if (res.success) {
        setSuccessRef(res.referenceNo);
        setSuccessType('callback');
        if (onSuccessSubmitted) onSuccessSubmitted();
      } else {
        setErrorMsg('Error submitting request. Please try calling directly.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Error submitting callback request to database. Please call directly.');
    }
  };

  // Submit Booking Request -> bookings
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!bkName.trim()) {
      setErrorMsg('Please enter contact person name.');
      return;
    }
    if (!validateIndianPhone(bkPhone)) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!bkAddress.trim()) {
      setErrorMsg('Please enter site / plant address for the service crew.');
      return;
    }
    if (!bkDate) {
      setErrorMsg('Please select your preferred service date.');
      return;
    }
    if (!bkConsent) {
      setErrorMsg('Please confirm consent for site mobilization.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await SupabaseService.submitBooking({
        customerName: bkName.trim(),
        companyName: bkCompany.trim() || 'Industrial Client',
        phone: bkPhone.trim(),
        email: bkEmail.trim(),
        requestedService: bkService,
        siteAddress: bkAddress.trim(),
        scheduledDate: bkDate,
        scheduledTime: bkTime,
        notes: bkNotes.trim() || 'Direct booking requested from web portal',
      });

      setIsSubmitting(false);
      if (res.success) {
        setSuccessRef(res.bookingReference);
        setSuccessType('booking');
        if (onSuccessSubmitted) onSuccessSubmitted();
      } else {
        setErrorMsg('Error booking service. Please try calling directly.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Error submitting service booking to database. Please call directly.');
    }
  };

  const handleReset = () => {
    setSuccessRef(null);
    setCustomerName('');
    setCompanyName('');
    setMobileNumber('');
    setEmail('');
    setSiteLocation('');
    setWorkDescription('');
    setFileName('');
    setConsentChecked(false);
    setCbName('');
    setCbPhone('');
    setCbNotes('');
    setCbConsent(false);
    setBkName('');
    setBkCompany('');
    setBkPhone('');
    setBkEmail('');
    setBkAddress('');
    setBkNotes('');
    setBkConsent(false);
  };

  return (
    <section id="inquiry" className="py-12 lg:py-16 bg-slate-100 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-3">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            24/7 Operations Desk • Rapid Site Mobilization
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Request Quotation, Callback or Booking
          </h2>
          <p className="text-sm text-slate-600">
            Submit your suction tanker, drain jetting, tank cleaning, or industrial civil maintenance requirement. Submissions are permanently saved to our secure database for rapid mobilization.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* 3 Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 text-center font-bold text-xs sm:text-sm">
            <button
              onClick={() => {
                setActiveTab('quote');
                setErrorMsg('');
              }}
              className={`py-3.5 px-2 sm:px-4 transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'quote'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">1. Request Quotation</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('callback');
                setErrorMsg('');
              }}
              className={`py-3.5 px-2 sm:px-4 transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'callback'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">2. Schedule Callback</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('booking');
                setErrorMsg('');
              }}
              className={`py-3.5 px-2 sm:px-4 transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'booking'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">3. Book Service</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* Success State Screen */}
            {successRef ? (
              <div className="text-center py-8 px-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                  {successType === 'booking'
                    ? 'Service Booking Confirmed & Logged'
                    : successType === 'callback'
                    ? 'Callback Request Registered'
                    : 'Quotation Request Successfully Recorded'}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  Thank you. Your request is registered in our operational database. An operations supervisor will review site requirements and contact you.
                </p>

                {/* Unique Reference Number Badge */}
                <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-left">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Permanent Reference Number
                  </div>
                  <div className="font-mono text-xl font-extrabold text-blue-700 tracking-wider">
                    {successRef}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Saved in live database. Please quote this reference for rapid tracking.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
                      `Hello Blue Bird Enterprises, I submitted a request on your website. My Reference Number is: ${successRef}. Looking forward to discussing.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-md transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send Reference on WhatsApp
                  </a>

                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Error Banner */}
                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Tab 1: Request a Quotation Form */}
                {activeTab === 'quote' && (
                  <form onSubmit={handleQuoteSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Your Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Ramesh Patil / Plant Manager"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Company / Facility Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Sterling Pharma Ltd."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Mobile Number <span className="text-rose-600">*</span> <span className="text-slate-400 font-normal">(10 Digits)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(sanitizeTenDigitMobile(e.target.value))}
                            placeholder="9867833456"
                            className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Official Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Service Required <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <select
                          value={serviceRequired}
                          onChange={(e) => setServiceRequired(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50"
                        >
                          {SERVICES_DATA.map((s) => (
                            <option key={s.id} value={s.title}>
                              {s.categoryTitle}: {s.title}
                            </option>
                          ))}
                          <option value="Multiple Industrial Services">Multiple Services / Turnkey Project</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Site Location & MIDC Area <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={siteLocation}
                          onChange={(e) => setSiteLocation(e.target.value)}
                          placeholder="e.g. Plot C-14, Pawane MIDC, Turbhe (Optional)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Preferred Callback Window <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <select
                        value={preferredCallbackTime}
                        onChange={(e) => setPreferredCallbackTime(e.target.value)}
                        className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50"
                      >
                        <option value="Morning (9 AM - 1 PM)">Morning (9:00 AM – 1:00 PM)</option>
                        <option value="Afternoon (1 PM - 5 PM)">Afternoon (1:00 PM – 5:00 PM)</option>
                        <option value="Evening (5 PM - 8 PM)">Evening (5:00 PM – 8:00 PM)</option>
                        <option value="Immediate / Emergency Call">Immediate / Emergency Breakdown</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Work Description & Site Dimensions <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={workDescription}
                        onChange={(e) => setWorkDescription(e.target.value)}
                        placeholder="Briefly describe sludge volume, pit depth, pipeline diameter, tanker access, or nature of choke/debris... (Optional)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-slate-50/50"
                      ></textarea>
                    </div>

                    {/* Document Specification */}
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileUp className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Optional: Attach layout or site photograph description</span>
                      </div>
                      <input
                        type="file"
                        id="quote-file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFileName(file.name);
                        }}
                      />
                      <label
                        htmlFor="quote-file"
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                      >
                        {fileName ? fileName : 'Select File'}
                      </label>
                    </div>

                    {/* Consent Checkbox */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent-check"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="consent-check" className="text-xs text-slate-600 leading-normal cursor-pointer">
                        I authorize Blue Bird Enterprises to contact me via phone, email, or WhatsApp regarding this industrial service inquiry. Data is safely stored in our database.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Saving to Database...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Quotation Request</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Tab 2: Schedule a Callback Form */}
                {activeTab === 'callback' && (
                  <form onSubmit={handleCallbackSubmit} className="space-y-6">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed mb-4">
                      <strong>Scheduled Callback Desk: </strong> Your callback request is saved directly into our operations database for prioritized follow-up by a supervisor.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={cbName}
                          onChange={(e) => setCbName(e.target.value)}
                          placeholder="e.g. Vikram Joshi"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Company / Facility
                        </label>
                        <input
                          type="text"
                          value={cbCompany}
                          onChange={(e) => setCbCompany(e.target.value)}
                          placeholder="e.g. Modern Logistics Hub"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Mobile Number * (10 Digits)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                            value={cbPhone}
                            onChange={(e) => setCbPhone(sanitizeTenDigitMobile(e.target.value))}
                            placeholder="9987324798"
                            className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Preferred Callback Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={cbDate}
                          onChange={(e) => setCbDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Preferred Time Window *
                        </label>
                        <select
                          value={cbTime}
                          onChange={(e) => setCbTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        >
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="02:30 PM">02:30 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                          <option value="06:30 PM">06:30 PM</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Subject of Callback
                        </label>
                        <input
                          type="text"
                          value={cbNotes}
                          onChange={(e) => setCbNotes(e.target.value)}
                          placeholder="e.g. Tanker suction rates or chamber build"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="cb-consent"
                        checked={cbConsent}
                        onChange={(e) => setCbConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="cb-consent" className="text-xs text-slate-600 leading-normal cursor-pointer">
                        I confirm this request and consent to receiving a scheduled phone call from Blue Bird Enterprises.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Saving Callback Request...</span>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Request Scheduled Callback</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Tab 3: Service Booking Form (Direct to bookings table) */}
                {activeTab === 'booking' && (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed mb-4">
                      <strong>Direct Service Booking: </strong> Reserve a suction tanker vehicle, drain jetting machine, or civil repair supervisor directly into our schedule.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          value={bkName}
                          onChange={(e) => setBkName(e.target.value)}
                          placeholder="e.g. Sunil Patil"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Company / Industrial Facility
                        </label>
                        <input
                          type="text"
                          value={bkCompany}
                          onChange={(e) => setBkCompany(e.target.value)}
                          placeholder="e.g. Precision Engineering Works"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Mobile Number * (10 Digits)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                            value={bkPhone}
                            onChange={(e) => setBkPhone(sanitizeTenDigitMobile(e.target.value))}
                            placeholder="9867833456"
                            className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={bkEmail}
                          onChange={(e) => setBkEmail(e.target.value)}
                          placeholder="client@company.in"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Service To Mobilize *
                        </label>
                        <select
                          value={bkService}
                          onChange={(e) => setBkService(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        >
                          {SERVICES_DATA.map((s) => (
                            <option key={s.id} value={s.title}>
                              {s.categoryTitle}: {s.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Requested Site Mobilization Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={bkDate}
                          onChange={(e) => setBkDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Site Address / MIDC Gate Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={bkAddress}
                        onChange={(e) => setBkAddress(e.target.value)}
                        placeholder="Plot number, road number, MIDC sector, landmark..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Specific Instructions / PPE Requirements
                      </label>
                      <textarea
                        rows={2}
                        value={bkNotes}
                        onChange={(e) => setBkNotes(e.target.value)}
                        placeholder="e.g. Plant security gate pass requirements, tanker height clearance, hose length needed..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm bg-slate-50/50"
                      ></textarea>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="bk-consent"
                        checked={bkConsent}
                        onChange={(e) => setBkConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="bk-consent" className="text-xs text-slate-600 leading-normal cursor-pointer">
                        I confirm this service work order booking request and verify that truck access is available at site.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Saving Booking to Database...</span>
                      ) : (
                        <>
                          <ClipboardCheck className="w-4 h-4" />
                          <span>Confirm Service Booking</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
