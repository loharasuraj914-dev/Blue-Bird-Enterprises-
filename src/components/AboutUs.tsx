import React from 'react';
import { ShieldCheck, HardHat, FileText, CheckCircle, Award, Compass, Eye, Users, Download } from 'lucide-react';
import { COMPANY_DETAILS, ATTACHED_IMAGES } from '../data/companyData.ts';
import { generateCompanyProfilePDF } from '../utils/pdfGenerator.ts';

interface AboutUsProps {
  onOpenCompanyProfile: () => void;
  onOpenQuoteModal: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onOpenCompanyProfile, onOpenQuoteModal }) => {
  return (
    <section id="about" className="py-12 lg:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Corporate Profile & Leadership
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            About Blue Bird Enterprises
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            A trusted and professionally managed industrial service provider bringing over two decades of technical field leadership to industrial facilities across Maharashtra.
          </p>
        </div>

        {/* Corporate Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Authentic Photography & Founder Spotlight */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <img
                src={ATTACHED_IMAGES.workerEtpCleaning}
                alt="Blue Bird Enterprises technician cleaning industrial tank in certified safety PPE"
                className="w-full h-80 sm:h-96 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
                  Safety First Protocol
                </span>
                <p className="text-sm font-medium text-slate-200">
                  Certified PPE operations in confined industrial environments, adhering to industrial hygiene protocols.
                </p>
              </div>
            </div>

            {/* Founder & Enterprise Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {COMPANY_DETAILS.founderRole}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    {COMPANY_DETAILS.founder}
                  </h3>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Under the strategic stewardship of Sarita Sinod Piwal, Blue Bird Enterprises has expanded from specialized suction tanker operations into a comprehensive industrial environmental sanitation and civil works contractor.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">GSTIN</span>
                  <span className="font-mono font-semibold text-slate-800">{COMPANY_DETAILS.gstin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">PAN</span>
                  <span className="font-mono font-semibold text-slate-800">{COMPANY_DETAILS.pan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Strategic Vision, Management Commitment & Core Capabilities */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mb-4">
                Two Decades of Field Reliability & Technical Capability
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base">
                We specialize in mechanized high-vacuum suction operations, comprehensive drainage maintenance, ETP/STP desludging, chemical tank cleaning, and civil engineering infrastructure.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Operating out of Pawane Village, Turbhe MIDC, our tactical presence enables fast mobilization to manufacturing complexes throughout Navi Mumbai, Taloja, the Thane-Belapur industrial belt, and broader Maharashtra industrial zones.
              </p>
            </div>

            {/* Strategic Vision Quote Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
                <Compass className="w-4 h-4 text-blue-400" />
                Strategic Vision
              </div>
              <blockquote className="text-sm sm:text-base italic font-serif leading-relaxed text-blue-50 mb-3">
                "{COMPANY_DETAILS.strategicVision}"
              </blockquote>
            </div>

            {/* Management Commitment Quote Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border-l-4 border-blue-600 border-t border-r border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Management Commitment
              </div>
              <blockquote className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                "{COMPANY_DETAILS.managementCommitment}"
              </blockquote>
              <p className="text-xs text-slate-600">
                We place quality, safety, timely execution, and transparent communication at the heart of every industrial service contract.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <HardHat className="w-4 h-4 text-amber-600" />
                  Safety & Confined Space PPE
                </div>
                <p className="text-xs text-slate-600">
                  Strict adherence to safety gear, gas checks, and zero manual scavenging standards.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Mechanized Suction Tankers
                </div>
                <p className="text-xs text-slate-600">
                  High-capacity displacement vacuum trucks designed specifically for viscous sludge and liquids.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Statutory & Tax Compliance
                </div>
                <p className="text-xs text-slate-600">
                  Fully GST and PAN compliant invoicing with detailed itemization for corporate audits.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Transparent Communication
                </div>
                <p className="text-xs text-slate-600">
                  Pre-inspection assessments, clear scopes of work, and proactive job progress updates.
                </p>
              </div>
            </div>

            {/* Company Profile Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenCompanyProfile}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold shadow-md transition-all cursor-pointer"
                title="View & Download official Corporate Profile"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Corporate Profile & Capabilities</span>
              </button>

              <button
                onClick={() => generateCompanyProfilePDF()}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                title="Download official attached PDF"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF</span>
              </button>

              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-sm font-bold transition-all cursor-pointer"
              >
                Request Site Assessment
              </button>
            </div>


          </div>

        </div>

      </div>
    </section>
  );
};
