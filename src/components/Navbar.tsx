import React, { useState } from 'react';
import { Phone, MessageSquare, Menu, X, Shield, Lock, FileText, MapPin } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/companyData.ts';

interface NavbarProps {
  onOpenQuoteModal: (serviceTitle?: string) => void;
  onOpenOwnerPortal: () => void;
  onOpenCompanyProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuoteModal,
  onOpenOwnerPortal,
  onOpenCompanyProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'About Us', href: '#about' },
    { label: 'Fleet & Gallery', href: '#gallery' },
    { label: 'Clients', href: '#clients' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* 
        Single Full-Width Black/Deep Navy Top Contact Bar
        Both phone numbers appear ONLY ONCE together on one line with phone icons & tel: links
      */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-3 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          
          {/* Left: 24/7 Response & Both Phone Numbers Side-by-Side */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] sm:text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="hidden xs:inline">24/7 Response</span>
            </span>

            <span className="text-slate-700 hidden xs:inline">•</span>

            {/* Both Business Phone Numbers Displayed Side by Side on One Line */}
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-white">
              {/* Phone Line 1 */}
              <a
                href={`tel:+91${COMPANY_DETAILS.phone1Raw}`}
                className="inline-flex items-center gap-1 hover:text-blue-300 transition-colors whitespace-nowrap"
                title="Call Primary Line: +91 98678 33456"
              >
                <Phone className="w-3 h-3 text-blue-400 shrink-0" />
                <span>+91 98678 33456</span>
              </a>

              <span className="text-slate-600 select-none">|</span>

              {/* Phone Line 2 */}
              <a
                href={`tel:+91${COMPANY_DETAILS.phone2Raw}`}
                className="inline-flex items-center gap-1 hover:text-emerald-300 transition-colors whitespace-nowrap"
                title="Call Secondary Line: +91 99873 24798"
              >
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>+91 99873 24798</span>
              </a>
            </div>
          </div>

          {/* Right: Location, Profile & Owner Portal Access */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-slate-400 ml-auto">
            <span className="hidden lg:inline-flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              <span>Turbhe MIDC, Navi Mumbai</span>
            </span>

            <span className="text-slate-800 hidden lg:inline select-none">|</span>

            <button
              onClick={onOpenCompanyProfile}
              className="hidden sm:inline-flex items-center gap-1 text-slate-300 hover:text-blue-300 transition-colors cursor-pointer"
              title="View & Download Official Company Profile"
            >
              <FileText className="w-3 h-3 text-blue-400 shrink-0" />
              <span>Company Profile</span>
            </button>

            <span className="text-slate-800 hidden sm:inline select-none">|</span>

            <button
              onClick={onOpenOwnerPortal}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Secure Owner & Management Access"
            >
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Owner Portal</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Navbar: Clean, Balanced, No Duplicate White Phone Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <a
            href="#home"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden min-w-0 pr-2 shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 flex items-center justify-center text-white shadow-md shadow-blue-900/20 ring-1 ring-blue-600/30 shrink-0">
              {/* Industrial Blue Bird Emblem */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200 fill-current" viewBox="0 0 24 24">
                <path d="M21 4c-2.5 1-4 3-5 5-1.5-1-3.5-1.5-5.5-1-3 0.8-5 3.5-5.5 6.5C4 15 3 17 2 19c3-0.5 5.5-2 7-4 1.5 0.5 3 0.5 4.5 0 2.5-1 4.5-3 5.5-5.5 1-0.5 2-0.5 2.5-0.5-0.5 1.5-1.5 3-2.5 4 1 0 2-0.5 3-1.5 0.5 2-0.5 4-2 5 2-0.5 3.5-2 4-4 0.5-2-0.5-4-1.5-5.5 1.5-1 2-2 2-3.5-1 0.5-2 0.8-3 0.5z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-extrabold text-sm sm:text-lg md:text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors whitespace-nowrap">
                BLUE BIRD <span className="text-blue-600 font-bold">ENTERPRISES</span>
              </span>
              <span className="text-[9px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                Industrial Cleaning • Drainage • Civil
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer py-1"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs (No duplicate phone numbers in this white strip) */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(COMPANY_DETAILS.whatsappDefaultMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Us</span>
            </a>

            <button
              onClick={() => onOpenQuoteModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-all transform active:scale-95 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Get Free Quote</span>
            </button>
          </div>

          {/* Mobile Menu Trigger & Mobile Quote Action */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onOpenQuoteModal()}
              className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs"
            >
              Quote
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className="text-left text-sm font-semibold text-slate-800 hover:text-blue-600 py-2.5 border-b border-slate-100 cursor-pointer"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-sm"
              >
                <Shield className="w-4 h-4" />
                Request a Free Quote
              </button>

              <a
                href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(COMPANY_DETAILS.whatsappDefaultMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Blue Bird</span>
              </a>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCompanyProfile();
                  }}
                  className="flex items-center gap-1.5 text-blue-600 font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Company Profile
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOwnerPortal();
                  }}
                  className="flex items-center gap-1.5 text-slate-600 font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Owner Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
