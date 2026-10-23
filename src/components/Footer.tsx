import React from 'react';
import { Phone, Mail, MapPin, Shield, FileText, Lock, ExternalLink } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/companyData.ts';

interface FooterProps {
  onOpenOwnerPortal: () => void;
  onOpenCompanyProfile: () => void;
  onOpenPrivacyModal: () => void;
  onOpenTermsModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenOwnerPortal,
  onOpenCompanyProfile,
  onOpenPrivacyModal,
  onOpenTermsModal,
  onScrollToSection,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Brand & Overview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M21 4c-2.5 1-4 3-5 5-1.5-1-3.5-1.5-5.5-1-3 0.8-5 3.5-5.5 6.5C4 15 3 17 2 19c3-0.5 5.5-2 7-4 1.5 0.5 3 0.5 4.5 0 2.5-1 4.5-3 5.5-5.5 1-0.5 2-0.5 2.5-0.5-0.5 1.5-1.5 3-2.5 4 1 0 2-0.5 3-1.5 0.5 2-0.5 4-2 5 2-0.5 3.5-2 4-4 0.5-2-0.5-4-1.5-5.5 1.5-1 2-2 2-3.5-1 0.5-2 0.8-3 0.5z" />
                </svg>
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg text-white block tracking-tight">
                  BLUE BIRD ENTERPRISES
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  20+ Years Field Excellence
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs">
              Specialized industrial environmental sanitation, mechanized suction tanker fleets, high-pressure sewer jetting, ETP/STP desludging, and civil works infrastructure across Maharashtra.
            </p>

            <div className="pt-2">
              <span className="text-slate-500 block text-[11px]">Proprietor:</span>
              <span className="font-bold text-slate-200">{COMPANY_DETAILS.founder}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenCompanyProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Company Profile PDF</span>
              </button>
              <button
                onClick={onOpenOwnerPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Owner Portal</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-slate-200 uppercase tracking-wider text-xs">
              Navigation
            </h4>
            <ul className="space-y-2">
              {['home', 'about', 'gallery', 'clients', 'contact'].map((sec) => (
                <li key={sec}>
                  <button
                    onClick={() => onScrollToSection(sec)}
                    className="capitalize text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    {sec === 'gallery' ? 'Fleet & Gallery' : sec.replace('-', ' ')}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Disciplines */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-slate-200 uppercase tracking-wider text-xs">
              Service Disciplines
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>Mechanized Suction Tanker Operations</li>
              <li>Industrial Sludge Evacuation</li>
              <li>ETP & STP Tank Desludging</li>
              <li>High-Pressure Drain Jetting</li>
              <li>Sewer Line De-Choking & Clearing</li>
              <li>Storm Water Channel Upkeep</li>
              <li>Concrete Pipeline & Chamber Works</li>
              <li>Domestic & Industrial Water Tank Wash</li>
            </ul>
          </div>

          {/* Contact & Statutory */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-slate-200 uppercase tracking-wider text-xs">
              Operations Base
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{COMPANY_DETAILS.address}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href="tel:+919867833456" className="text-slate-200 hover:text-white hover:underline">
                    +91 98678 33456
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <a href="tel:+919987324798" className="text-slate-200 hover:text-white hover:underline">
                    +91 99873 24798
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <a href={`mailto:${COMPANY_DETAILS.email}`} className="text-slate-200 hover:underline">
                  {COMPANY_DETAILS.email}
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1 text-[11px] font-mono">
              <div>GSTIN: <span className="text-slate-200 font-bold">{COMPANY_DETAILS.gstin}</span></div>
              <div>PAN: <span className="text-slate-200 font-bold">{COMPANY_DETAILS.pan}</span></div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Disclaimers */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {COMPANY_DETAILS.name}. All rights reserved. Registered in Maharashtra, India.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={onOpenTermsModal}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span>•</span>
            <button
              onClick={onOpenCompanyProfile}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Company Profile
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
