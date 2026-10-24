import React from 'react';
import { ShieldCheck, Phone, MessageSquare, ArrowRight, CheckCircle2, Wrench, Truck, AlertTriangle } from 'lucide-react';
import { COMPANY_DETAILS, ATTACHED_IMAGES } from '../data/companyData.ts';

interface HeroProps {
  onOpenQuoteModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuoteModal, onScrollToSection }) => {
  return (
    <section id="home" className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 overflow-hidden">
      {/* Subtle industrial blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Experience & Location Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold mb-6 w-fit shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span>20+ Years Field Excellence</span>
              <span className="text-blue-300">•</span>
              <span className="text-slate-600 font-medium">Turbhe MIDC, Navi Mumbai</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-6">
              Industrial Cleaning & Drainage Solutions <span className="text-blue-700 underline decoration-blue-300 decoration-wavy decoration-2">You Can Trust</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
              Over 20 years of field experience delivering dependable industrial cleaning, mechanized suction, drainage management, and civil engineering services across Maharashtra.
            </p>

            {/* Trust Highlights Checklist */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 max-w-xl">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 font-medium bg-white/80 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>20+ Years of Experience</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 font-medium bg-white/80 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Industrial Cleaning Specialists</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 font-medium bg-white/80 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Safety-Focused Operations</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 font-medium bg-white/80 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Emergency Response Available</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Primary CTA */}
              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all transform active:scale-98 cursor-pointer"
              >
                Get a Free Quote
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary CTA: WhatsApp */}
              <a
                href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(COMPANY_DETAILS.whatsappDefaultMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-base font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Us
              </a>

              {/* Additional CTA: Call Both Numbers */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`tel:+91${COMPANY_DETAILS.phone1Raw}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-bold bg-white text-slate-800 border border-slate-300 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  title="Call Primary Line"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Call: {COMPANY_DETAILS.phone1}</span>
                </a>
                <a
                  href={`tel:+91${COMPANY_DETAILS.phone2Raw}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-3.5 rounded-xl text-sm font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer"
                  title="Call Secondary Line"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{COMPANY_DETAILS.phone2}</span>
                </a>
              </div>
            </div>

            {/* Small note on site assessment */}
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              All industrial operations and final quotations subject to physical site assessment.
            </p>
          </div>

          {/* Right Column: Authentic Business Photograph Showcase */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Decorative background framing */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-slate-800/10 rounded-2xl blur-lg -z-10"></div>

              {/* Main Image Card: Actual Blue Bird Enterprises Suction Truck */}
              <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xl overflow-hidden">
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] sm:aspect-[4/4.2] bg-slate-100">
                  <img
                    src={ATTACHED_IMAGES.heroSuctionTruck}
                    alt="Blue Bird Enterprises yellow suction tanker truck on site in Navi Mumbai"
                    className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-500"
                    loading="eager"
                  />
                  
                  {/* Subtle Top Badge on Image */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 shadow-lg flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Fleet • On-Site Operations</span>
                  </div>

                  {/* Bottom Information Overlay on Image */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent p-4 sm:p-5 text-white">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      BLUE BIRD ENTERPRISES
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white mb-1">
                      O2Zone Suction Machine 21.C
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      High-vacuum mechanized suction tanker deployed for industrial sludge evacuation & drainage clearing in Turbhe MIDC.
                    </p>
                  </div>
                </div>

                {/* Micro Thumbnails Strip below hero featuring 2 additional attached images */}
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
                    <img
                      src={ATTACHED_IMAGES.workerEtpCleaning}
                      alt="ETP Tank Cleaning"
                      className="w-12 h-12 rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-900 truncate">
                        ETP/STP Desludging
                      </div>
                      <div className="text-[10px] text-slate-500">PPE Compliant Tank Wash</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
                    <img
                      src={ATTACHED_IMAGES.drainJettingWorker}
                      alt="Drain Jetting"
                      className="w-12 h-12 rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-900 truncate">
                        Drain Jetting & Sewer
                      </div>
                      <div className="text-[10px] text-slate-500">Chamber De-Choking</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
