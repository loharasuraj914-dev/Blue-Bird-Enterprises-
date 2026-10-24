import React from 'react';
import {
  ShieldCheck,
  Phone,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Wrench,
  Truck,
  Droplets,
  FlaskConical,
  Gauge,
  Waves,
  HardHat,
} from 'lucide-react';
import {
  COMPANY_DETAILS,
  ATTACHED_IMAGES,
  CORE_INTRODUCTION_SERVICES,
  ADDITIONAL_SERVICE_NAMES,
} from '../data/companyData.ts';

interface HeroProps {
  onOpenQuoteModal: (serviceTitle?: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'etp-stp-cleaning': <FlaskConical className="w-4 h-4 text-blue-600 shrink-0" />,
  'drain-jetting': <Gauge className="w-4 h-4 text-blue-600 shrink-0" />,
  'suction-vehicle-ops': <Truck className="w-4 h-4 text-blue-600 shrink-0" />,
  'water-tank-cleaning': <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />,
  'industrial-sludge-evacuation': <Droplets className="w-4 h-4 text-blue-600 shrink-0" />,
  'sewer-line-dechoking': <Wrench className="w-4 h-4 text-blue-600 shrink-0" />,
  'stormwater-drain-upkeep': <Waves className="w-4 h-4 text-blue-600 shrink-0" />,
  'concrete-pipeline-laying': <HardHat className="w-4 h-4 text-blue-600 shrink-0" />,
};

export const Hero: React.FC<HeroProps> = ({ onOpenQuoteModal }) => {
  return (
    <section
      id="home"
      className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 pt-5 pb-14 lg:pt-7 lg:pb-20 border-b border-slate-200 overflow-hidden"
    >
      {/* Subtle industrial blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Core Industrial Services Introduction Showcase (Right below Navbar as requested) */}
        <div
          id="services"
          className="mb-8 lg:mb-10 rounded-2xl bg-white/95 border border-slate-200/90 shadow-md overflow-hidden"
        >
          {/* Services Showcase Header Bar */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] sm:text-xs font-extrabold tracking-wider uppercase text-amber-400">
                Our Industrial Services
              </span>
              <span className="text-slate-600 select-none" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                Tank Cleaning, Suction Tankers, Drain Cleaning & Civil Construction
              </span>
            </div>
            <span className="text-[11px] text-blue-300 font-medium">
              Select any service to request a free quote →
            </span>
          </div>

          {/* 8 Main Services Grid (Exact Order 1 to 8) */}
          <div className="p-3 sm:p-4 bg-gradient-to-b from-slate-50/70 to-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {CORE_INTRODUCTION_SERVICES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onOpenQuoteModal(service.title)}
                  className="group text-left p-3 rounded-xl bg-white border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/40 shadow-2xs hover:shadow-md transition-all duration-150 flex items-start justify-between gap-2.5 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                      <span className="text-[11px] font-mono font-extrabold text-blue-700 group-hover:text-white tabular-nums">
                        {service.code}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {SERVICE_ICONS[service.id]}
                        <span className="text-[10px] font-semibold text-slate-500 tracking-tight truncate">
                          {service.category}
                        </span>
                      </div>
                      <h2 className="font-heading text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-blue-700 leading-snug mt-0.5">
                        {service.title}
                      </h2>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        {service.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ))}
            </div>

            {/* Additional Retained Services Bar */}
            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mr-1">
                  Additional Services:
                </span>
                {ADDITIONAL_SERVICE_NAMES.map((serviceName) => (
                  <button
                    key={serviceName}
                    type="button"
                    onClick={() => onOpenQuoteModal(serviceName)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <span>{serviceName}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Experience & Location Kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold mb-6 w-fit shadow-xs">
              <span>20+ Years Field Excellence</span>
              <span className="text-blue-300" aria-hidden="true">
                •
              </span>
              <span className="text-slate-600 font-medium">Turbhe MIDC, Navi Mumbai</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-6">
              Industrial Cleaning & Drainage Solutions{' '}
              <span className="text-blue-700 underline decoration-blue-300 decoration-wavy decoration-2">
                You Can Trust
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
              Over 20 years of field experience delivering dependable ETP & STP tank cleaning,
              suction tanker services, high-pressure drain cleaning, and civil construction across
              Maharashtra.
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
                onClick={() => onOpenQuoteModal()}
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
                      Suction Tanker Services (O2Zone 21.C)
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      High-vacuum suction tanker deployed for industrial sludge removal and drain cleaning in Turbhe MIDC.
                    </p>
                  </div>
                </div>

                {/* Micro Thumbnails Strip below hero featuring 2 additional attached images */}
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
                    <img
                      src={ATTACHED_IMAGES.workerEtpCleaning}
                      alt="ETP & STP Tank Cleaning"
                      className="w-12 h-12 rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-900 truncate">
                        ETP & STP Tank Cleaning
                      </div>
                      <div className="text-[10px] text-slate-500">PPE-Compliant Tank Cleaning</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
                    <img
                      src={ATTACHED_IMAGES.drainJettingWorker}
                      alt="High-Pressure Drain Cleaning"
                      className="w-12 h-12 rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-900 truncate">
                        High-Pressure Drain Cleaning
                      </div>
                      <div className="text-[10px] text-slate-500">Sewer & Blockage Removal</div>
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
