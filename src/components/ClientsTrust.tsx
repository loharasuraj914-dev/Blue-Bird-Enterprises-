import React from 'react';
import { Building, ShieldCheck, CheckCircle2, FileCheck2, Scale, Clock } from 'lucide-react';
import { CLIENTS_LIST } from '../data/companyData.ts';

export const CLIENTS_SECTION_CLASSES = 'hidden md:block py-12 lg:py-16 bg-white border-b border-slate-200';

export const ClientsTrust: React.FC = () => {
  return (
    <section id="clients" className={CLIENTS_SECTION_CLASSES}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Corporate Integrity & Relationships
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Industrial Client Relationships
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Company-reported client relationships across pharmaceuticals, industrial packaging, specialty oils, and chemical manufacturing.
          </p>
        </div>

        {/* Clean Corporate Text-Based Client Grid (No unauthorized logo reproduction) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CLIENTS_LIST.map((client, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 shrink-0 shadow-xs">
                  <Building className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 mb-1 leading-snug">
                    {client.name}
                  </h3>
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {client.sector}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Location: {client.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mandatory Transparency & Compliance Disclosure */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center max-w-3xl mx-auto text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Client Relationship Notice: </span>
          Listed entities represent company-reported industrial service relationships, projects, or engagements, presented in compliance with corporate guidelines without third-party trademark reproduction. Subject to verification and formal authorization.
        </div>

      </div>
    </section>
  );
};
