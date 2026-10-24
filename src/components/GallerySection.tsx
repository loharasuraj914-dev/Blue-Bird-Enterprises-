import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/companyData.ts';

interface GallerySectionProps {
  onOpenQuoteModal?: (serviceTitle?: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'suction' | 'drainage' | 'etp'>('all');

  const filterTabs = [
    { id: 'all', label: 'All Operations' },
    { id: 'suction', label: 'Suction Tanker Services' },
    { id: 'drainage', label: 'Drain & Sewer Cleaning' },
    { id: 'etp', label: 'ETP, STP & Tank Cleaning' },
  ];

  const filteredItems = selectedFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === selectedFilter);

  return (
    <section id="gallery" className="py-12 lg:py-16 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            Field Operations & Fleet
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Projects & Operations Gallery
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Actual on-site photographs showcasing our suction tankers, high-pressure drain cleaning teams, and PPE-equipped technicians executing tank cleaning and civil works across Maharashtra.
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {filterTabs.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/80 shadow-lg"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.altText}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>

              {/* Caption Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90 p-4 flex flex-col justify-end pointer-events-none">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  {item.categoryLabel}
                </span>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Note */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto">
          Authentic photographic documentation of Blue Bird Enterprises operational assets, machinery, and safety personnel in action.
        </div>

      </div>
    </section>
  );
};

