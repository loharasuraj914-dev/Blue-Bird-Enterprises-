/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { AboutUs } from './components/AboutUs.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { ClientsTrust } from './components/ClientsTrust.tsx';
import { InquiryQuoteSection } from './components/InquiryQuoteSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingContactBar } from './components/FloatingContactBar.tsx';

import { QuoteModal } from './components/QuoteModal.tsx';
import { CompanyProfileModal } from './components/CompanyProfileModal.tsx';
import { PrivacyTermsModal } from './components/PrivacyTermsModal.tsx';
import { OwnerLoginModal } from './components/OwnerPortal/OwnerLoginModal.tsx';
import { OwnerPortalModal } from './components/OwnerPortal/OwnerPortalModal.tsx';
import { PortalStorage } from './data/portalStore.ts';

export default function App() {
  // Modal states
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [prefilledService, setPrefilledService] = useState<string | undefined>(undefined);
  const [isCompanyProfileOpen, setIsCompanyProfileOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [isOwnerLoginOpen, setIsOwnerLoginOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);

  // Check URL parameters for fast routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === '1' || params.get('admin') === '1') {
      if (PortalStorage.isOwnerAuthenticated()) {
        setIsOwnerDashboardOpen(true);
      } else {
        setIsOwnerLoginOpen(true);
      }
    }
  }, []);

  const handleOpenQuoteModal = (serviceTitle?: string) => {
    setPrefilledService(serviceTitle);
    setIsQuoteModalOpen(true);
  };

  const handleOpenOwnerPortal = () => {
    if (PortalStorage.isOwnerAuthenticated()) {
      setIsOwnerDashboardOpen(true);
    } else {
      setIsOwnerLoginOpen(true);
    }
  };

  const handleOwnerLoginSuccess = () => {
    setIsOwnerLoginOpen(false);
    setIsOwnerDashboardOpen(true);
  };

  const handleOwnerLogout = () => {
    setIsOwnerDashboardOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white pb-16 lg:pb-0">
      
      {/* Navigation Header */}
      <Navbar
        onOpenQuoteModal={handleOpenQuoteModal}
        onOpenOwnerPortal={handleOpenOwnerPortal}
        onOpenCompanyProfile={() => setIsCompanyProfileOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onOpenQuoteModal={() => handleOpenQuoteModal()}
          onScrollToSection={handleScrollToSection}
        />

        {/* 2. About Us */}
        <AboutUs
          onOpenCompanyProfile={() => setIsCompanyProfileOpen(true)}
          onOpenQuoteModal={() => handleOpenQuoteModal()}
        />

        {/* 3. Projects & Operations Gallery */}
        <GallerySection
          onOpenQuoteModal={handleOpenQuoteModal}
        />

        {/* 4. Clients & Industrial Trust */}
        <ClientsTrust />

        {/* 5. Customer Inquiry, Quote & Callback Section */}
        <InquiryQuoteSection
          initialService={prefilledService}
        />

        {/* 6. Contact Us */}
        <ContactSection
          onOpenQuoteModal={() => handleOpenQuoteModal()}
        />

      </main>

      {/* Footer */}
      <Footer
        onOpenOwnerPortal={handleOpenOwnerPortal}
        onOpenCompanyProfile={() => setIsCompanyProfileOpen(true)}
        onOpenPrivacyModal={() => setLegalModalType('privacy')}
        onOpenTermsModal={() => setLegalModalType('terms')}
        onScrollToSection={handleScrollToSection}
      />

      {/* Premium Floating Contact Options: 1. Call | 2. WhatsApp | 3. Call Back */}
      <FloatingContactBar />

      {/* Interactive Modals */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        prefilledService={prefilledService}
      />

      <CompanyProfileModal
        isOpen={isCompanyProfileOpen}
        onClose={() => setIsCompanyProfileOpen(false)}
      />

      <PrivacyTermsModal
        isOpen={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
        type={legalModalType || 'privacy'}
      />

      <OwnerLoginModal
        isOpen={isOwnerLoginOpen}
        onClose={() => setIsOwnerLoginOpen(false)}
        onLoginSuccess={handleOwnerLoginSuccess}
      />

      <OwnerPortalModal
        isOpen={isOwnerDashboardOpen}
        onClose={() => setIsOwnerDashboardOpen(false)}
        onLogout={handleOwnerLogout}
      />

    </div>
  );
}
