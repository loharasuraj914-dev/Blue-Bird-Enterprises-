import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Users,
  PhoneCall,
  FileSpreadsheet,
  Settings,
  BarChart3,
  LogOut,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  Edit3,
  Calendar,
  Save,
  ShieldCheck,
  AlertCircle,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  ClipboardCheck,
  Check
} from 'lucide-react';
import {
  PortalStorage,
  CustomerInquiry,
  CallbackRequest,
  QuotationRecord,
  BusinessSettings,
  LeadStatus,
  CallbackStatus,
  QuotationStatus
} from '../../data/portalStore.ts';
import { SupabaseService, BookingRecord } from '../../services/supabaseService.ts';
import { COMPANY_DETAILS, SERVICES_DATA } from '../../data/companyData.ts';
import { formatINR, QuotationLineItem } from '../../utils/quotation.ts';
import { PrintableQuotationModal } from './PrintableQuotationModal.tsx';
import { generateQuotationPDF } from '../../utils/pdfGenerator.ts';

interface OwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const OwnerPortalModal: React.FC<OwnerPortalModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'leads' | 'callbacks' | 'bookings' | 'quotations' | 'reports' | 'settings'
  >('overview');

  // Store data
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(COMPANY_DETAILS as any);
  const [isLoading, setIsLoading] = useState(false);

  // Leads Filter & Search
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | LeadStatus>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Bookings Filter
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  // Printable Quotation Modal State
  const [viewingQuote, setViewingQuote] = useState<QuotationRecord | null>(null);

  // New Quotation Form Modal State
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [newQuoteClient, setNewQuoteClient] = useState('');
  const [newQuoteCompany, setNewQuoteCompany] = useState('');
  const [newQuotePhone, setNewQuotePhone] = useState('');
  const [newQuoteEmail, setNewQuoteEmail] = useState('');
  const [newQuoteGstin, setNewQuoteGstin] = useState('');
  const [newQuoteAddress, setNewQuoteAddress] = useState('');
  const [newQuoteItems, setNewQuoteItems] = useState<QuotationLineItem[]>([
    {
      id: '1',
      description: 'Mechanized Vacuum Suction Tanker Machine with operator (6,000L Capacity)',
      unit: 'Trip',
      quantity: 1,
      unitRate: 8500
    }
  ]);
  const [newQuoteTerms, setNewQuoteTerms] = useState(
    '1. Water and power connections to be provided at site by client.\n2. Payment: 50% advance along with work order, balance upon completion.\n3. Safe vehicle access to sumps to be facilitated by client.\n4. Validity: 30 days.'
  );

  // Settings Feedback
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inqData, cbData, bkData, qtData] = await Promise.all([
        SupabaseService.getCustomerEnquiries(),
        SupabaseService.getCallbackRequests(),
        SupabaseService.getBookings(),
        SupabaseService.getQuotations(),
      ]);
      setInquiries(inqData);
      setCallbacks(cbData);
      setBookings(bkData);
      setQuotations(qtData);
      setSettings(PortalStorage.getSettings());
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Lead Status Change Handler
  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    await SupabaseService.updateEnquiry(id, { status: newStatus });
    loadData();
  };

  // Internal Notes Save Handler
  const handleSaveNotes = async (id: string) => {
    await SupabaseService.updateEnquiry(id, { internalNotes: tempNotes });
    setEditingNotesId(null);
    loadData();
  };

  // Follow-up Date Handler
  const handleDateChange = async (id: string, date: string) => {
    await SupabaseService.updateEnquiry(id, { followUpDate: date });
    loadData();
  };

  // Callback Status Change Handler
  const handleCallbackStatus = async (id: string, newStatus: CallbackStatus) => {
    await SupabaseService.updateCallback(id, { status: newStatus });
    loadData();
  };

  // Booking Status Handler
  const handleBookingStatus = async (id: string, newStatus: BookingRecord['status']) => {
    await SupabaseService.updateBookingStatus(id, newStatus);
    loadData();
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    const headers = ['Reference No', 'Date', 'Customer Name', 'Company Name', 'Mobile Number', 'Email', 'Service Required', 'Site Location', 'Status', 'Internal Notes'];
    const rows = inquiries.map(i => [
      `"${i.referenceNo}"`,
      `"${new Date(i.createdAt).toLocaleDateString()}"`,
      `"${i.customerName}"`,
      `"${i.companyName}"`,
      `"${i.mobileNumber}"`,
      `"${i.email}"`,
      `"${i.serviceRequired}"`,
      `"${i.siteLocation}"`,
      `"${i.status}"`,
      `"${(i.internalNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Blue_Bird_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Quotation Handler
  const handleSaveNewQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteClient.trim() || !newQuoteCompany.trim()) return;

    const termsArray = newQuoteTerms
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const result = await SupabaseService.saveQuotation({
      clientName: newQuoteClient.trim(),
      companyName: newQuoteCompany.trim(),
      clientPhone: newQuotePhone.trim(),
      clientEmail: newQuoteEmail.trim(),
      clientGstin: newQuoteGstin.trim(),
      clientAddress: newQuoteAddress.trim(),
      date: new Date().toISOString().split('T')[0],
      validityDays: 30,
      status: 'sent',
      items: newQuoteItems,
      terms: termsArray
    });

    setIsCreatingQuote(false);
    loadData();
    setViewingQuote(result.quotation);
  };

  // Add Item to Quotation Form
  const handleAddQuoteItem = () => {
    setNewQuoteItems([
      ...newQuoteItems,
      {
        id: String(Date.now()),
        description: '',
        unit: 'Trip',
        quantity: 1,
        unitRate: 5000
      }
    ]);
  };

  const handleUpdateQuoteItem = (index: number, field: keyof QuotationLineItem, value: any) => {
    const updated = [...newQuoteItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewQuoteItems(updated);
  };

  const handleRemoveQuoteItem = (index: number) => {
    if (newQuoteItems.length <= 1) return;
    setNewQuoteItems(newQuoteItems.filter((_, i) => i !== index));
  };

  // Open Create Quote from an existing Inquiry
  const handleQuoteFromInquiry = (inquiry: CustomerInquiry) => {
    setNewQuoteClient(inquiry.customerName);
    setNewQuoteCompany(inquiry.companyName);
    setNewQuotePhone(inquiry.mobileNumber);
    setNewQuoteEmail(inquiry.email);
    setNewQuoteAddress(inquiry.siteLocation);
    setNewQuoteItems([
      {
        id: '1',
        description: `${inquiry.serviceRequired}: ${inquiry.workDescription}`,
        unit: 'Lump Sum',
        quantity: 1,
        unitRate: 15000
      }
    ]);
    setActiveTab('quotations');
    setIsCreatingQuote(true);
  };

  // Save Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    PortalStorage.saveSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Filtered Leads
  const filteredLeads = inquiries.filter(i => {
    const matchStatus = leadStatusFilter === 'all' || i.status === leadStatusFilter;
    const query = leadSearch.toLowerCase();
    const matchSearch =
      i.customerName.toLowerCase().includes(query) ||
      i.companyName.toLowerCase().includes(query) ||
      i.mobileNumber.includes(query) ||
      i.referenceNo.toLowerCase().includes(query) ||
      i.serviceRequired.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const query = bookingSearch.toLowerCase();
    const matchSearch =
      b.customerName.toLowerCase().includes(query) ||
      b.companyName.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      b.bookingReference.toLowerCase().includes(query) ||
      b.requestedService.toLowerCase().includes(query) ||
      b.siteAddress.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  // Overview Stats
  const totalInquiries = inquiries.length;
  const newLeads = inquiries.filter(i => i.status === 'new').length;
  const pendingCallbacks = callbacks.filter(c => c.status === 'pending').length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const totalQuotes = quotations.length;
  const pipelineValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div
        className="bg-slate-100 rounded-2xl max-w-6xl w-full border border-slate-300 shadow-2xl relative my-4 max-h-[94vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              BBE
            </div>
            <div>
              <div className="font-heading font-extrabold text-base tracking-tight flex items-center gap-2">
                <span>BLUE BIRD ENTERPRISES — Management Portal</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-900 text-blue-300 border border-blue-700">
                  Proprietor View
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Proprietor: {COMPANY_DETAILS.founder} | Turbhe MIDC, Navi Mumbai
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                PortalStorage.setOwnerAuthenticated(false);
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close portal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'leads'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Leads & Inquiries</span>
            {newLeads > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                {newLeads}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('callbacks')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'callbacks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Callbacks</span>
            {pendingCallbacks > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {pendingCallbacks}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Bookings</span>
            {pendingBookings > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {pendingBookings}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'quotations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Quotations & PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Total Inquiries
                  </div>
                  <div className="font-heading text-3xl font-extrabold text-slate-900">
                    {totalInquiries}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">All inquiries & site requests</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                    New Leads (Action Needed)
                  </div>
                  <div className="font-heading text-3xl font-extrabold text-blue-700">
                    {newLeads}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Requires supervisor response</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                    Scheduled Callbacks
                  </div>
                  <div className="font-heading text-3xl font-extrabold text-amber-700">
                    {pendingCallbacks}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">{totalBookings} total bookings logged</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    Quoted Pipeline
                  </div>
                  <div className="font-heading text-2xl font-extrabold text-emerald-800">
                    {formatINR(pipelineValue)}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">{totalQuotes} total quotations</div>
                </div>
              </div>

              {/* Quick Action Banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-heading font-bold text-base text-slate-900">
                    Issue an Official GST Quotation (18% GST Breakdown)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Line items, CGST (9%) + SGST (9%), professional terms, and instant printable/downloadable PDF.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('quotations');
                    setIsCreatingQuote(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Quotation
                </button>
              </div>

              {/* Recent Inquiries Stream */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-heading font-bold text-slate-900 text-sm">
                    Recent Customer Inquiries
                  </h4>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    View All Leads →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {inquiries.slice(0, 4).map((inq) => (
                    <div key={inq.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-blue-700">{inq.referenceNo}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-slate-900">{inq.customerName}</span>
                          <span className="text-slate-500">({inq.companyName})</span>
                        </div>
                        <div className="text-slate-600">
                          <strong>Service:</strong> {inq.serviceRequired} | <strong>Site:</strong> {inq.siteLocation}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          inq.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          inq.status === 'contacted' ? 'bg-amber-100 text-amber-800' :
                          inq.status === 'quotation_sent' ? 'bg-purple-100 text-purple-700' :
                          inq.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {inq.status.replace('_', ' ')}
                        </span>
                        <a
                          href={`tel:${inq.mobileNumber}`}
                          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                          title="Call Client"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS & INQUIRIES MANAGEMENT */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {/* Search, Filter & Export Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Search by name, company, phone, reference..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 bg-slate-50"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={leadStatusFilter}
                      onChange={(e) => setLeadStatusFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
                    >
                      <option value="all">All Statuses ({inquiries.length})</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="quotation_sent">Quotation Sent</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadData}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
                    title="Refresh data from Supabase"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Leads Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Ref & Date</th>
                        <th className="py-3 px-4">Client & Facility</th>
                        <th className="py-3 px-4">Service & Site</th>
                        <th className="py-3 px-4">Work Scope</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Follow-Up & Notes</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No inquiries match the current search or status filter.
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <div className="font-mono font-bold text-blue-700">{inq.referenceNo}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(inq.createdAt).toLocaleDateString()}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <div className="font-bold text-slate-900">{inq.customerName}</div>
                              <div className="text-slate-600 font-medium">{inq.companyName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                                <span>+91 {inq.mobileNumber}</span>
                                {inq.email && inq.email !== 'Not specified' && (
                                  <span>• {inq.email}</span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <div className="font-semibold text-slate-800">{inq.serviceRequired}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{inq.siteLocation}</div>
                              {inq.preferredCallback && (
                                <div className="text-[10px] text-blue-600 mt-1">
                                  Preferred: {inq.preferredCallback}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 align-top max-w-xs">
                              <p className="text-slate-600 text-xs line-clamp-3">
                                {inq.workDescription}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <select
                                value={inq.status}
                                onChange={(e) => handleStatusChange(inq.id, e.target.value as LeadStatus)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                                  inq.status === 'new' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                                  inq.status === 'contacted' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                                  inq.status === 'quotation_sent' ? 'bg-purple-50 border-purple-300 text-purple-800' :
                                  inq.status === 'converted' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                                  'bg-slate-50 border-slate-300 text-slate-700'
                                }`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="quotation_sent">Quotation Sent</option>
                                <option value="converted">Converted</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              {editingNotesId === inq.id ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    rows={2}
                                    value={tempNotes}
                                    onChange={(e) => setTempNotes(e.target.value)}
                                    className="w-full p-1.5 border rounded-md text-[11px]"
                                  ></textarea>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleSaveNotes(inq.id)}
                                      className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingNotesId(null)}
                                      className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <p className="text-[11px] text-slate-700 italic">
                                    {inq.internalNotes || 'No notes added yet.'}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setEditingNotesId(inq.id);
                                      setTempNotes(inq.internalNotes || '');
                                    }}
                                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                    <span>Edit Notes</span>
                                  </button>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <input
                                      type="date"
                                      value={inq.followUpDate || ''}
                                      onChange={(e) => handleDateChange(inq.id, e.target.value)}
                                      className="border border-slate-200 rounded px-1 py-0.5 text-[10px]"
                                    />
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={`tel:${inq.mobileNumber}`}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700"
                                  title="Call Client"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`https://wa.me/91${inq.mobileNumber}?text=${encodeURIComponent(
                                    `Hello ${inq.customerName}, this is regarding your industrial service inquiry (${inq.referenceNo}) with Blue Bird Enterprises.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  title="WhatsApp Client"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleQuoteFromInquiry(inq)}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-[10px] font-bold cursor-pointer"
                                  title="Prepare Quotation"
                                >
                                  Quote
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALLBACKS MANAGEMENT */}
          {activeTab === 'callbacks' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm">
                    Scheduled Customer Callback Requests
                  </h4>
                  <p className="text-xs text-slate-500">
                    Track and close telephone consultations scheduled via web floating bar or contact form.
                  </p>
                </div>
                <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  {pendingCallbacks} Callbacks Pending
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {callbacks.map((cb) => (
                  <div
                    key={cb.id}
                    className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
                      cb.status === 'completed'
                        ? 'border-slate-200 bg-slate-50/50'
                        : 'border-amber-200 ring-1 ring-amber-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-700 block">
                            {cb.referenceNo}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {cb.customerName}
                          </h4>
                          <span className="text-xs text-slate-500">{cb.companyName}</span>
                        </div>

                        <select
                          value={cb.status}
                          onChange={(e) => handleCallbackStatus(cb.id, e.target.value as CallbackStatus)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                            cb.status === 'pending' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                            cb.status === 'completed' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                            'bg-slate-50 border-slate-300 text-slate-600'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="rescheduled">Rescheduled</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 mb-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Target: {cb.preferredDate} at {cb.preferredTime}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Subject:</strong> {cb.notes}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        +91 {cb.mobileNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${cb.mobileNumber}`}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Client</span>
                        </a>
                        <a
                          href={`https://wa.me/91${cb.mobileNumber}?text=${encodeURIComponent(
                            `Hello ${cb.customerName}, this is Blue Bird Enterprises following up on your scheduled callback request.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      placeholder="Search bookings by reference, client, address, machine..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 bg-slate-50"
                    />
                  </div>

                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
                  >
                    <option value="all">All Bookings ({bookings.length})</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={loadData}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
                  title="Refresh bookings"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookings.length === 0 ? (
                  <div className="col-span-2 bg-white p-8 rounded-2xl text-center text-slate-500 text-xs">
                    No bookings found matching filter.
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-blue-700 text-xs">
                            {b.bookingReference}
                          </span>
                          <select
                            value={b.status}
                            onChange={(e) => handleBookingStatus(b.id, e.target.value as any)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border cursor-pointer ${
                              b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              b.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              b.status === 'Completed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Rescheduled">Rescheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mb-0.5">{b.customerName}</h4>
                        <div className="text-xs text-slate-600 mb-2">{b.companyName}</div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 mb-3">
                          <div><strong>Service:</strong> {b.requestedService}</div>
                          <div><strong>Site Address:</strong> {b.siteAddress}</div>
                          <div><strong>Scheduled:</strong> {b.scheduledDate} at {b.scheduledTime}</div>
                          {b.notes && <div className="text-slate-500 italic">Notes: {b.notes}</div>}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-800">+91 {b.phone}</span>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${b.phone}`}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-100"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(
                              `Hello ${b.customerName}, this is Blue Bird Enterprises regarding your service booking (${b.bookingReference}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: QUOTATION MANAGEMENT */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm">
                    Industrial GST Quotation Records
                  </h4>
                  <p className="text-xs text-slate-500">
                    Create, manage, and print official Blue Bird Enterprises quotations with 18% GST (CGST 9% + SGST 9%).
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingQuote(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Quotation</span>
                </button>
              </div>

              {/* Quotations List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quotations.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {q.quotationNo}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          q.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          q.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {q.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">
                        {q.companyName}
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">Attn: {q.clientName}</p>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 mb-4">
                        <div className="flex justify-between text-slate-600">
                          <span>Items:</span>
                          <span className="font-bold">{q.items.length} Service(s)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-mono">{formatINR(q.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST (18%):</span>
                          <span className="font-mono">{formatINR(q.totalGst)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-sm">
                          <span>Grand Total:</span>
                          <span className="font-mono text-blue-800">{formatINR(q.grandTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Date: {q.date}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => generateQuotationPDF(q)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                          title="Save official PDF directly"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save PDF</span>
                        </button>
                        <button
                          onClick={() => setViewingQuote(q)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                          title="View and Print"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Quotation Form Modal */}
              {isCreatingQuote && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto animate-in fade-in">
                  <div
                    className="bg-white rounded-2xl max-w-3xl w-full border border-slate-300 shadow-2xl relative my-6 max-h-[90vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
                      <h4 className="font-heading font-bold text-sm sm:text-base">
                        Create New Official GST Quotation
                      </h4>
                      <button
                        onClick={() => setIsCreatingQuote(false)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveNewQuotation} className="p-6 overflow-y-auto space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                          <input
                            type="text"
                            required
                            value={newQuoteClient}
                            onChange={(e) => setNewQuoteClient(e.target.value)}
                            placeholder="e.g. Ramesh Patil"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Company / Plant Name *</label>
                          <input
                            type="text"
                            required
                            value={newQuoteCompany}
                            onChange={(e) => setNewQuoteCompany(e.target.value)}
                            placeholder="e.g. Sterling Pharma Ltd."
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Client Mobile</label>
                          <input
                            type="text"
                            value={newQuotePhone}
                            onChange={(e) => setNewQuotePhone(e.target.value)}
                            placeholder="98678 33456"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Client Email</label>
                          <input
                            type="email"
                            value={newQuoteEmail}
                            onChange={(e) => setNewQuoteEmail(e.target.value)}
                            placeholder="client@plant.com"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Client GSTIN (Optional)</label>
                          <input
                            type="text"
                            value={newQuoteGstin}
                            onChange={(e) => setNewQuoteGstin(e.target.value)}
                            placeholder="27AABCU9603R1ZM"
                            className="w-full p-2 border rounded-lg bg-slate-50 uppercase"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Site / Works Location</label>
                          <input
                            type="text"
                            value={newQuoteAddress}
                            onChange={(e) => setNewQuoteAddress(e.target.value)}
                            placeholder="Turbhe MIDC, Navi Mumbai"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-bold text-slate-800">Quotation Line Items</label>
                          <button
                            type="button"
                            onClick={handleAddQuoteItem}
                            className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Item</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {newQuoteItems.map((item, idx) => (
                            <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-2 items-center">
                              <input
                                type="text"
                                required
                                placeholder="Service description..."
                                value={item.description}
                                onChange={(e) => handleUpdateQuoteItem(idx, 'description', e.target.value)}
                                className="flex-1 p-1.5 border rounded-md bg-white text-xs w-full"
                              />
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="Unit (Trip, Day, Job)"
                                  value={item.unit}
                                  onChange={(e) => handleUpdateQuoteItem(idx, 'unit', e.target.value)}
                                  className="w-20 p-1.5 border rounded-md bg-white text-xs"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Qty"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuoteItem(idx, 'quantity', Number(e.target.value))}
                                  className="w-16 p-1.5 border rounded-md bg-white text-xs"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Rate (₹)"
                                  value={item.unitRate}
                                  onChange={(e) => handleUpdateQuoteItem(idx, 'unitRate', Number(e.target.value))}
                                  className="w-24 p-1.5 border rounded-md bg-white text-xs"
                                />
                                {newQuoteItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveQuoteItem(idx)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Terms */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Commercial Terms & Conditions (One per line)</label>
                        <textarea
                          rows={3}
                          value={newQuoteTerms}
                          onChange={(e) => setNewQuoteTerms(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-slate-50 text-xs"
                        ></textarea>
                      </div>

                      <div className="pt-3 border-t flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingQuote(false)}
                          className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save & Generate PDF</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-heading font-bold text-slate-900 text-sm mb-4">
                  Navi Mumbai & MIDC Industrial Service Demand
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Mechanized Suction Tanker Operations (Sludge/Slurry)</span>
                      <span>52% of Inquiries</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>High-Pressure Water Jetting & Choke Desilting</span>
                      <span>28% of Inquiries</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>ETP / STP Tank Cleaning & Desludging</span>
                      <span>14% of Inquiries</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Civil Repairs, Chambers & Pipelines</span>
                      <span>6% of Inquiries</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-600 rounded-full" style={{ width: '6%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Statistics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-slate-500 text-xs block mb-1">Lead to Quote Ratio</span>
                  <span className="font-heading font-extrabold text-2xl text-slate-900">78%</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-slate-500 text-xs block mb-1">Avg Turnaround Time</span>
                  <span className="font-heading font-extrabold text-2xl text-emerald-700">Same Day</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-slate-500 text-xs block mb-1">Zero Manual Scavenging</span>
                  <span className="font-heading font-extrabold text-2xl text-blue-700">100% Mechanized</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS MANAGEMENT */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-heading font-bold text-slate-900 text-sm mb-1">
                  Enterprise Contact & Statutory Configuration
                </h4>
                <p className="text-xs text-slate-500 mb-6">
                  Update customer-facing telephone lines, WhatsApp numbers, email, and business hours.
                </p>

                {settingsSaved && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Business settings updated successfully.</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Primary Telephone Line</label>
                      <input
                        type="text"
                        value={settings.primaryPhone}
                        onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Secondary Telephone Line</label>
                      <input
                        type="text"
                        value={settings.secondaryPhone}
                        onChange={(e) => setSettings({ ...settings, secondaryPhone: e.target.value })}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">WhatsApp Dispatch Number</label>
                      <input
                        type="text"
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Official Correspondence Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Office & Yard Address</label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Operating Hours Notice</label>
                      <input
                        type="text"
                        value={settings.businessHours}
                        onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Business Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Printable Quotation Modal */}
      {viewingQuote && (
        <PrintableQuotationModal
          quotation={viewingQuote}
          onClose={() => setViewingQuote(null)}
        />
      )}
    </div>
  );
};
