import React, { useState } from 'react';
import { Camera, X, ZoomIn, ArrowRight, Wrench, Shield } from 'lucide-react';
import { GALLERY_ITEMS, GalleryItem } from '../data/companyData.ts';

interface GallerySectionProps {
  onOpenQuoteModal: (serviceTitle?: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenQuoteModal }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'suction' | 'drainage' | 'etp'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Operations' },
    { id: 'suction', label: 'Vacuum Tanker Operations' },
    { id: 'drainage', label: 'Drain Jetting & Sewer' },
    { id: 'etp', label: 'ETP & Tank Cleaning' },
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
            Actual on-site photographs showcasing our mechanized suction tankers, high-pressure jetting teams, and PPE-equipped technicians executing operations across Maharashtra.
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
              onClick={() => setActiveItem(item)}
              className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/80 shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.altText}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  {item.categoryLabel}
                </span>
                <h3 className="text-sm font-bold text-white leading-snug mb-1 group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-2 font-medium">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>Click to view details</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Note */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto">
          Authentic photographic documentation of Blue Bird Enterprises operational assets, machinery, and safety personnel in action.
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative bg-black max-h-[500px] flex items-center justify-center overflow-hidden">
              <img
                src={activeItem.image}
                alt={activeItem.altText}
                className="w-full max-h-[500px] object-contain"
              />
            </div>

            {/* Modal Information */}
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {activeItem.categoryLabel}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  On-Site Operation
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-white mb-3">
                {activeItem.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {activeItem.caption}
              </p>

              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 mb-6 text-xs text-slate-300 flex items-start gap-2.5">
                <Wrench className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Equipment Deployed:</span>
                  <span>{activeItem.equipment}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Need a similar operation for your plant or premises?
                </div>
                <button
                  onClick={() => {
                    const title = activeItem.title;
                    setActiveItem(null);
                    onOpenQuoteModal(`Enquiry: ${title}`);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all cursor-pointer"
                >
                  Request Quote for this Service
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
