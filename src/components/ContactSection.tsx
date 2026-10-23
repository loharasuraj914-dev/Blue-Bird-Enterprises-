import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, AlertCircle, Shield, ExternalLink, CheckCircle } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/companyData.ts';

interface ContactSectionProps {
  onOpenQuoteModal: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenQuoteModal }) => {
  return (
    <section id="contact" className="py-12 lg:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Operations Desk & Base
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Contact Blue Bird Enterprises
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Reach our industrial operations desk directly. Available for planned maintenance contracts, urgent tanker suction, and site visits.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Verified Business Information & Direct Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Primary Business Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-5 mb-5">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  Founder & Proprietor: {COMPANY_DETAILS.founder}
                </span>
                <h3 className="font-heading text-2xl font-bold text-slate-900">
                  {COMPANY_DETAILS.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Industrial Cleaning • Drainage Management • Civil Engineering
                </p>
              </div>

              {/* Direct Info List */}
              <div className="space-y-4 text-sm">
                
                {/* Physical Address */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Operations Office & Fleet Yard
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {COMPANY_DETAILS.address}
                    </p>
                    <a
                      href="https://maps.google.com/?q=Turbhe+MIDC+Navi+Mumbai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline mt-1"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Telephone Lines */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Telephone / Mobile Lines (Click to Call)
                    </span>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <a
                        href="tel:+919867833456"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-900 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-xs"
                        title="Call Line 1: +91 98678 33456"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>+91 98678 33456</span>
                      </a>
                      <a
                        href="tel:+919987324798"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-900 hover:text-emerald-600 hover:border-emerald-300 transition-colors shadow-xs"
                        title="Call Line 2: +91 99873 24798"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+91 99873 24798</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Official Email */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Official Correspondence Email
                    </span>
                    <a
                      href={`mailto:${COMPANY_DETAILS.email}`}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {COMPANY_DETAILS.email}
                    </a>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Business Hours & Dispatch
                    </span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {COMPANY_DETAILS.businessHours}
                    </p>
                  </div>
                </div>

              </div>

              {/* Statutory Tax ID Strip */}
              <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    GSTIN (Maharashtra)
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {COMPANY_DETAILS.gstin}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Permanent Account No (PAN)
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {COMPANY_DETAILS.pan}
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="mt-6">
                <a
                  href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(COMPANY_DETAILS.whatsappDefaultMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps Embed & Operational Coverage */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Embedded Verified Location Map */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
              <div className="p-3 bg-slate-900 text-white text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Pawane Village, Turbhe MIDC, Navi Mumbai
                </span>
                <span className="text-[11px] text-slate-400">Lat: 19.0760, Lon: 73.0169</span>
              </div>
              <div className="aspect-[16/10] w-full">
                <iframe
                  title="Blue Bird Enterprises Turbhe MIDC Location Map"
                  src="https://maps.google.com/maps?q=Turbhe+MIDC,+Pawane,+Navi+Mumbai,+Maharashtra&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Service Coverage Area across Maharashtra */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-heading text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Operational Coverage Across Maharashtra
              </h4>
              <p className="text-xs text-slate-600 mb-4">
                Our suction tanker fleet and civil engineering crews mobilize actively across major MIDC industrial clusters:
              </p>
              <div className="flex flex-wrap gap-2">
                {COMPANY_DETAILS.serviceRegions.map((region, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700"
                  >
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    {region}
                  </span>
                ))}
              </div>
            </div>

            {/* Emergency Breakdown Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Urgent Facility Breakdown?
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  Drain overflow or critical suction breakdown support.
                </div>
              </div>
              <button
                onClick={onOpenQuoteModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 shrink-0 cursor-pointer"
              >
                Immediate Inquiry
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
