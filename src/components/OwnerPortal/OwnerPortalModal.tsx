import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Users,
  PhoneCall,
  FileSpreadsheet,
  Settings,
  LogOut,
  Search,
  Download,
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  Phone,
  MessageSquare,
  Edit3,
  Save,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  RotateCcw,
  Eye,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import {
  PortalStorage,
  CustomerInquiry,
  CallbackRequest,
  QuotationRecord,
  BusinessSettings,
  LeadStatus,
  CallbackStatus,
  QuotationStatus,
  PortalEntityType,
} from '../../data/portalStore.ts';
import { SupabaseService, BookingRecord } from '../../services/supabaseService.ts';
import { COMPANY_DETAILS } from '../../data/companyData.ts';
import {
  formatINR,
  QuotationLineItem,
  QUOTATION_SERVICE_PRESETS,
  MANUAL_SERVICE_OPTION_VALUE,
  calculateQuotationTotals,
  DEFAULT_QUOTATION_TERMS,
  normalizeQuotationTerms,
  normalizeServiceName,
} from '../../utils/quotation.ts';
import { sanitizeTenDigitMobile, cleanPhoneNumber } from '../../utils/validation.ts';
import { PrintableQuotationModal } from './PrintableQuotationModal.tsx';
import { generateQuotationPDF } from '../../utils/pdfGenerator.ts';

interface OwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

type PortalTab =
  | 'overview'
  | 'leads'
  | 'callbacks'
  | 'bookings'
  | 'quotations'
  | 'trash'
  | 'settings';

interface ConfirmDialogState {
  isOpen: boolean;
  mode: 'trash' | 'permanent' | 'empty_trash';
  entityType?: PortalEntityType;
  ids: string[];
  label: string;
}

export const OwnerPortalModal: React.FC<OwnerPortalModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');

  // Store data
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(COMPANY_DETAILS as any);
  const [isLoading, setIsLoading] = useState(false);

  // Operation Feedback Banner (shown only after operation completes)
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Filters & Search
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | LeadStatus>('all');
  const [callbackSearch, setCallbackSearch] = useState('');
  const [callbackStatusFilter, setCallbackStatusFilter] = useState<'all' | CallbackStatus>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [quoteSearch, setQuoteSearch] = useState('');
  const [trashSearch, setTrashSearch] = useState('');
  const [trashTypeFilter, setTrashTypeFilter] = useState<'all' | PortalEntityType>('all');

  // Multi-select Checkboxes State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTrashItems, setSelectedTrashItems] = useState<
    Array<{ entityType: PortalEntityType; id: string }>
  >([]);

  // View Record Modal State
  const [viewingRecord, setViewingRecord] = useState<{
    entityType: PortalEntityType;
    data: any;
  } | null>(null);

  // Edit Record Modal State
  const [editingRecord, setEditingRecord] = useState<{
    entityType: PortalEntityType;
    data: any;
  } | null>(null);

  // Printable Quotation Modal State
  const [viewingQuote, setViewingQuote] = useState<QuotationRecord | null>(null);

  // Delete Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    mode: 'trash',
    ids: [],
    label: '',
  });
  const [permanentConfirmChecked, setPermanentConfirmChecked] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  // New / Edit Quotation Form Modal State
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [newQuoteClient, setNewQuoteClient] = useState('');
  const [newQuoteCompany, setNewQuoteCompany] = useState('');
  const [newQuotePhone, setNewQuotePhone] = useState('');
  const [newQuoteEmail, setNewQuoteEmail] = useState('');
  const [newQuoteGstin, setNewQuoteGstin] = useState('');
  const [newQuoteAddress, setNewQuoteAddress] = useState('');
  const [newQuoteStatus, setNewQuoteStatus] = useState<QuotationStatus>('sent');
  const [serviceFilterQuery, setServiceFilterQuery] = useState('');
  const [newQuoteItems, setNewQuoteItems] = useState<QuotationLineItem[]>([
    {
      id: '1',
      serviceOption: QUOTATION_SERVICE_PRESETS[0].title,
      description: QUOTATION_SERVICE_PRESETS[0].defaultDescription,
      unit: QUOTATION_SERVICE_PRESETS[0].defaultUnit,
      quantity: 1,
      unitRate: QUOTATION_SERVICE_PRESETS[0].defaultRate,
    },
  ]);
  const [newQuoteTerms, setNewQuoteTerms] = useState(
    DEFAULT_QUOTATION_TERMS.join('\n')
  );

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackBanner({ type, message });
    setTimeout(() => {
      setFeedbackBanner((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Clear selections when switching tabs
  useEffect(() => {
    setSelectedIds([]);
    setSelectedTrashItems([]);
  }, [activeTab]);

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

  // Separate Active Records from Trashed Records
  const activeInquiries = inquiries.filter((i) => !i.deletedAt);
  const trashedInquiries = inquiries.filter((i) => Boolean(i.deletedAt));

  const activeCallbacks = callbacks.filter((c) => !c.deletedAt);
  const trashedCallbacks = callbacks.filter((c) => Boolean(c.deletedAt));

  const activeBookings = bookings.filter((b) => !b.deletedAt);
  const trashedBookings = bookings.filter((b) => Boolean(b.deletedAt));

  const activeQuotations = quotations.filter((q) => !q.deletedAt);
  const trashedQuotations = quotations.filter((q) => Boolean(q.deletedAt));

  const totalTrashCount =
    trashedInquiries.length +
    trashedCallbacks.length +
    trashedBookings.length +
    trashedQuotations.length;

  // Filtered Active Lists
  const filteredLeads = activeInquiries.filter((i) => {
    const matchStatus = leadStatusFilter === 'all' || i.status === leadStatusFilter;
    const q = leadSearch.toLowerCase();
    const matchSearch =
      !q ||
      i.customerName.toLowerCase().includes(q) ||
      i.companyName.toLowerCase().includes(q) ||
      i.mobileNumber.includes(q) ||
      i.referenceNo.toLowerCase().includes(q) ||
      i.serviceRequired.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filteredCallbacks = activeCallbacks.filter((c) => {
    const matchStatus = callbackStatusFilter === 'all' || c.status === callbackStatusFilter;
    const q = callbackSearch.toLowerCase();
    const matchSearch =
      !q ||
      c.customerName.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.mobileNumber.includes(q) ||
      c.referenceNo.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filteredBookings = activeBookings.filter((b) => {
    const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const q = bookingSearch.toLowerCase();
    const matchSearch =
      !q ||
      b.customerName.toLowerCase().includes(q) ||
      b.companyName.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.bookingReference.toLowerCase().includes(q) ||
      b.requestedService.toLowerCase().includes(q) ||
      b.siteAddress.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filteredQuotations = activeQuotations.filter((qt) => {
    const q = quoteSearch.toLowerCase();
    return (
      !q ||
      qt.quotationNo.toLowerCase().includes(q) ||
      qt.clientName.toLowerCase().includes(q) ||
      qt.companyName.toLowerCase().includes(q) ||
      qt.clientPhone.includes(q)
    );
  });

  // Combined Trashed Items for Trash Tab
  const allTrashRecords = [
    ...trashedInquiries.map((i) => ({
      entityType: 'enquiries' as PortalEntityType,
      typeLabel: 'Enquiry',
      id: i.id,
      ref: i.referenceNo,
      name: i.customerName,
      company: i.companyName,
      phone: i.mobileNumber,
      detail: i.serviceRequired,
      deletedAt: i.deletedAt!,
      raw: i,
    })),
    ...trashedCallbacks.map((c) => ({
      entityType: 'callbacks' as PortalEntityType,
      typeLabel: 'Callback',
      id: c.id,
      ref: c.referenceNo,
      name: c.customerName,
      company: c.companyName,
      phone: c.mobileNumber,
      detail: `${c.preferredDate} ${c.preferredTime}`,
      deletedAt: c.deletedAt!,
      raw: c,
    })),
    ...trashedBookings.map((b) => ({
      entityType: 'bookings' as PortalEntityType,
      typeLabel: 'Booking',
      id: b.id,
      ref: b.bookingReference,
      name: b.customerName,
      company: b.companyName,
      phone: b.phone,
      detail: b.requestedService,
      deletedAt: b.deletedAt!,
      raw: b,
    })),
    ...trashedQuotations.map((q) => ({
      entityType: 'quotations' as PortalEntityType,
      typeLabel: 'Quotation',
      id: q.id,
      ref: q.quotationNo,
      name: q.clientName,
      company: q.companyName,
      phone: q.clientPhone,
      detail: formatINR(q.grandTotal),
      deletedAt: q.deletedAt!,
      raw: q,
    })),
  ].filter((item) => {
    const matchType = trashTypeFilter === 'all' || item.entityType === trashTypeFilter;
    const q = trashSearch.toLowerCase();
    const matchSearch =
      !q ||
      item.ref.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.phone.includes(q) ||
      item.detail.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  // Selection Helpers
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Trash Selection Helpers
  const isTrashItemSelected = (entityType: PortalEntityType, id: string) =>
    selectedTrashItems.some((t) => t.entityType === entityType && t.id === id);

  const toggleSelectTrashItem = (entityType: PortalEntityType, id: string) => {
    setSelectedTrashItems((prev) =>
      prev.some((t) => t.entityType === entityType && t.id === id)
        ? prev.filter((t) => !(t.entityType === entityType && t.id === id))
        : [...prev, { entityType, id }]
    );
  };

  // Delete & Restore Action Triggers
  const requestMoveToTrash = (entityType: PortalEntityType, ids: string[], label: string) => {
    if (ids.length === 0) return;
    setPermanentConfirmChecked(false);
    setConfirmDialog({
      isOpen: true,
      mode: 'trash',
      entityType,
      ids,
      label,
    });
  };

  const requestPermanentDelete = (entityType: PortalEntityType, ids: string[], label: string) => {
    if (ids.length === 0) return;
    setPermanentConfirmChecked(false);
    setConfirmDialog({
      isOpen: true,
      mode: 'permanent',
      entityType,
      ids,
      label,
    });
  };

  const requestEmptyTrash = () => {
    if (totalTrashCount === 0) return;
    setPermanentConfirmChecked(false);
    setConfirmDialog({
      isOpen: true,
      mode: 'empty_trash',
      ids: [],
      label: `all ${totalTrashCount} trashed record(s)`,
    });
  };

  const executeConfirmedDelete = async () => {
    setIsProcessingDelete(true);
    try {
      if (confirmDialog.mode === 'trash' && confirmDialog.entityType) {
        const res = await SupabaseService.moveToTrash(confirmDialog.entityType, confirmDialog.ids);
        await loadData();
        setSelectedIds([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (res.success) {
          showFeedback('success', `Moved ${res.count} record(s) to Trash.`);
        } else {
          showFeedback('error', res.error || 'Failed to move records to Trash.');
        }
      } else if (confirmDialog.mode === 'permanent') {
        if (confirmDialog.entityType) {
          const res = await SupabaseService.deletePermanently(
            confirmDialog.entityType,
            confirmDialog.ids
          );
          await loadData();
          setSelectedIds([]);
          setSelectedTrashItems([]);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          if (res.success) {
            showFeedback('success', `Permanently deleted ${res.count} record(s).`);
          } else {
            showFeedback('error', res.error || 'Failed to delete records permanently.');
          }
        } else if (selectedTrashItems.length > 0) {
          // Bulk permanent delete across trash types
          const grouped: Record<PortalEntityType, string[]> = {
            enquiries: [],
            callbacks: [],
            bookings: [],
            quotations: [],
          };
          for (const item of selectedTrashItems) {
            grouped[item.entityType].push(item.id);
          }
          let totalDeleted = 0;
          for (const type of Object.keys(grouped) as PortalEntityType[]) {
            if (grouped[type].length > 0) {
              const r = await SupabaseService.deletePermanently(type, grouped[type]);
              if (r.success) totalDeleted += r.count;
            }
          }
          await loadData();
          setSelectedTrashItems([]);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          showFeedback('success', `Permanently deleted ${totalDeleted} record(s).`);
        }
      } else if (confirmDialog.mode === 'empty_trash') {
        const res = await SupabaseService.emptyTrash();
        await loadData();
        setSelectedTrashItems([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (res.success) {
          showFeedback('success', `Emptied Trash (${res.count} record(s) removed permanently).`);
        } else {
          showFeedback('error', res.error || 'Failed to empty Trash.');
        }
      }
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const handleRestoreRecords = async (entityType: PortalEntityType, ids: string[]) => {
    const res = await SupabaseService.restoreFromTrash(entityType, ids);
    await loadData();
    setSelectedTrashItems((prev) =>
      prev.filter((t) => !(t.entityType === entityType && ids.includes(t.id)))
    );
    if (res.success) {
      showFeedback('success', `Restored ${res.count} record(s) from Trash.`);
    } else {
      showFeedback('error', res.error || 'Failed to restore records.');
    }
  };

  const handleBulkRestoreTrash = async () => {
    if (selectedTrashItems.length === 0) return;
    const grouped: Record<PortalEntityType, string[]> = {
      enquiries: [],
      callbacks: [],
      bookings: [],
      quotations: [],
    };
    for (const item of selectedTrashItems) {
      grouped[item.entityType].push(item.id);
    }
    let totalRestored = 0;
    for (const type of Object.keys(grouped) as PortalEntityType[]) {
      if (grouped[type].length > 0) {
        const r = await SupabaseService.restoreFromTrash(type, grouped[type]);
        if (r.success) totalRestored += r.count;
      }
    }
    await loadData();
    setSelectedTrashItems([]);
    showFeedback('success', `Restored ${totalRestored} record(s) from Trash.`);
  };

  // Status Change Handlers
  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    const ok = await SupabaseService.updateEnquiry(id, { status: newStatus });
    await loadData();
    if (ok) showFeedback('success', 'Enquiry status updated.');
  };

  const handleCallbackStatus = async (id: string, newStatus: CallbackStatus) => {
    const ok = await SupabaseService.updateCallback(id, { status: newStatus });
    await loadData();
    if (ok) showFeedback('success', 'Callback status updated.');
  };

  const handleBookingStatus = async (id: string, newStatus: BookingRecord['status']) => {
    const ok = await SupabaseService.updateBookingStatus(id, newStatus);
    await loadData();
    if (ok) showFeedback('success', 'Booking status updated.');
  };

  // Save Edited Record Modal Handler
  const handleSaveEditedRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const { entityType, data } = editingRecord;
    let ok = false;

    if (entityType === 'enquiries') {
      ok = await SupabaseService.updateEnquiry(data.id, {
        customerName: data.customerName,
        companyName: data.companyName,
        mobileNumber: sanitizeTenDigitMobile(data.mobileNumber),
        email: data.email,
        serviceRequired: data.serviceRequired,
        siteLocation: data.siteLocation,
        workDescription: data.workDescription,
        status: data.status,
        internalNotes: data.internalNotes,
        followUpDate: data.followUpDate,
      });
    } else if (entityType === 'callbacks') {
      ok = await SupabaseService.updateCallback(data.id, {
        customerName: data.customerName,
        companyName: data.companyName,
        mobileNumber: sanitizeTenDigitMobile(data.mobileNumber),
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        status: data.status,
        notes: data.notes,
      });
    } else if (entityType === 'bookings') {
      ok = await SupabaseService.updateBooking(data.id, {
        customerName: data.customerName,
        companyName: data.companyName,
        phone: sanitizeTenDigitMobile(data.phone),
        email: data.email,
        requestedService: data.requestedService,
        siteAddress: data.siteAddress,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        status: data.status,
        notes: data.notes,
      });
    }

    setEditingRecord(null);
    await loadData();
    if (ok) {
      showFeedback('success', 'Record saved.');
    } else {
      showFeedback('error', 'Could not save changes.');
    }
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    const headers = [
      'Reference No',
      'Date',
      'Customer Name',
      'Company Name',
      'Mobile Number',
      'Email',
      'Service',
      'Site Location',
      'Status',
      'Notes',
    ];
    const rows = activeInquiries.map((i) => [
      `"${i.referenceNo}"`,
      `"${new Date(i.createdAt).toLocaleDateString()}"`,
      `"${i.customerName}"`,
      `"${i.companyName}"`,
      `"${i.mobileNumber}"`,
      `"${i.email}"`,
      `"${i.serviceRequired}"`,
      `"${i.siteLocation}"`,
      `"${i.status}"`,
      `"${(i.internalNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Blue_Bird_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open New Quotation Modal
  const openNewQuotationModal = () => {
    setEditingQuoteId(null);
    setNewQuoteClient('');
    setNewQuoteCompany('');
    setNewQuotePhone('');
    setNewQuoteEmail('');
    setNewQuoteGstin('');
    setNewQuoteAddress('');
    setNewQuoteStatus('sent');
    setServiceFilterQuery('');
    setNewQuoteItems([
      {
        id: '1',
        serviceOption: QUOTATION_SERVICE_PRESETS[0].title,
        description: QUOTATION_SERVICE_PRESETS[0].defaultDescription,
        unit: QUOTATION_SERVICE_PRESETS[0].defaultUnit,
        quantity: 1,
        unitRate: QUOTATION_SERVICE_PRESETS[0].defaultRate,
      },
    ]);
    setIsCreatingQuote(true);
  };

  // Open Edit Quotation Modal
  const openEditQuotationModal = (q: QuotationRecord) => {
    setEditingQuoteId(q.id);
    setNewQuoteClient(q.clientName);
    setNewQuoteCompany(q.companyName);
    setNewQuotePhone(sanitizeTenDigitMobile(cleanPhoneNumber(q.clientPhone)));
    setNewQuoteEmail(q.clientEmail);
    setNewQuoteGstin(q.clientGstin);
    setNewQuoteAddress(q.clientAddress);
    setNewQuoteStatus(q.status);
    setServiceFilterQuery('');
    setNewQuoteItems(
      q.items.length > 0
        ? q.items.map((item) => ({ ...item }))
        : [
            {
              id: '1',
              serviceOption: QUOTATION_SERVICE_PRESETS[0].title,
              description: QUOTATION_SERVICE_PRESETS[0].defaultDescription,
              unit: QUOTATION_SERVICE_PRESETS[0].defaultUnit,
              quantity: 1,
              unitRate: QUOTATION_SERVICE_PRESETS[0].defaultRate,
            },
          ]
    );
    setNewQuoteTerms(
      normalizeQuotationTerms(q.terms && q.terms.length > 0 ? q.terms : DEFAULT_QUOTATION_TERMS).join('\n')
    );
    setIsCreatingQuote(true);
  };

  // Save New or Edited Quotation
  const handleSaveNewQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteClient.trim() || !newQuoteCompany.trim()) return;

    const termsArray = normalizeQuotationTerms(newQuoteTerms.split('\n'));

    if (editingQuoteId) {
      const ok = await SupabaseService.updateQuotation(editingQuoteId, {
        clientName: newQuoteClient.trim(),
        companyName: newQuoteCompany.trim(),
        clientPhone: sanitizeTenDigitMobile(newQuotePhone),
        clientEmail: newQuoteEmail.trim(),
        clientGstin: newQuoteGstin.trim(),
        clientAddress: newQuoteAddress.trim(),
        status: newQuoteStatus,
        items: newQuoteItems,
        terms: termsArray,
      });
      setIsCreatingQuote(false);
      setEditingQuoteId(null);
      await loadData();
      if (ok) showFeedback('success', 'Quotation updated.');
      return;
    }

    const result = await SupabaseService.saveQuotation({
      clientName: newQuoteClient.trim(),
      companyName: newQuoteCompany.trim(),
      clientPhone: sanitizeTenDigitMobile(newQuotePhone),
      clientEmail: newQuoteEmail.trim(),
      clientGstin: newQuoteGstin.trim(),
      clientAddress: newQuoteAddress.trim(),
      date: new Date().toISOString().split('T')[0],
      validityDays: 30,
      status: newQuoteStatus,
      items: newQuoteItems,
      terms: termsArray,
    });

    setIsCreatingQuote(false);
    await loadData();
    showFeedback('success', `Quotation ${result.quotation.quotationNo} saved.`);
    setViewingQuote(result.quotation);
  };

  // Quotation Line Item Helpers
  const handleAddQuoteItem = () => {
    const nextPreset =
      QUOTATION_SERVICE_PRESETS[newQuoteItems.length % QUOTATION_SERVICE_PRESETS.length];
    setNewQuoteItems([
      ...newQuoteItems,
      {
        id: String(Date.now()),
        serviceOption: nextPreset.title,
        description: nextPreset.defaultDescription,
        unit: nextPreset.defaultUnit,
        quantity: 1,
        unitRate: nextPreset.defaultRate,
      },
    ]);
  };

  const handleAddManualQuoteItem = () => {
    setNewQuoteItems([
      ...newQuoteItems,
      {
        id: String(Date.now()),
        serviceOption: MANUAL_SERVICE_OPTION_VALUE,
        description: '',
        unit: 'Job',
        quantity: 1,
        unitRate: 5000,
      },
    ]);
  };

  const handleServiceOptionChange = (index: number, selectedValue: string) => {
    if (!selectedValue) return;
    const updated = [...newQuoteItems];
    if (selectedValue === MANUAL_SERVICE_OPTION_VALUE) {
      const wasPreset = QUOTATION_SERVICE_PRESETS.some(
        (p) =>
          p.defaultDescription === updated[index].description ||
          p.title === updated[index].description
      );
      updated[index] = {
        ...updated[index],
        serviceOption: MANUAL_SERVICE_OPTION_VALUE,
        description: wasPreset ? '' : updated[index].description,
      };
    } else {
      const preset = QUOTATION_SERVICE_PRESETS.find((p) => p.title === selectedValue);
      if (preset) {
        updated[index] = {
          ...updated[index],
          serviceOption: preset.title,
          description: preset.defaultDescription,
          unit: preset.defaultUnit,
          unitRate: preset.defaultRate,
        };
      }
    }
    setNewQuoteItems(updated);
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

  // Open Create Quote from Inquiry
  const handleQuoteFromInquiry = (inquiry: CustomerInquiry) => {
    setEditingQuoteId(null);
    setNewQuoteClient(inquiry.customerName);
    setNewQuoteCompany(inquiry.companyName);
    setNewQuotePhone(sanitizeTenDigitMobile(cleanPhoneNumber(inquiry.mobileNumber)));
    setNewQuoteEmail(inquiry.email === 'Not specified' ? '' : inquiry.email);
    setNewQuoteAddress(inquiry.siteLocation === 'Not specified' ? '' : inquiry.siteLocation);
    const normalizedSvc = normalizeServiceName(inquiry.serviceRequired);
    const matchedPreset = QUOTATION_SERVICE_PRESETS.find(
      (p) => p.title === normalizedSvc
    );
    setNewQuoteItems([
      {
        id: '1',
        serviceOption: matchedPreset ? matchedPreset.title : MANUAL_SERVICE_OPTION_VALUE,
        description: matchedPreset ? matchedPreset.title : normalizedSvc,
        unit: matchedPreset ? matchedPreset.defaultUnit : 'Job',
        quantity: 1,
        unitRate: matchedPreset ? matchedPreset.defaultRate : 12000,
      },
    ]);
    setActiveTab('quotations');
    setIsCreatingQuote(true);
  };

  // Save Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    PortalStorage.saveSettings(settings);
    showFeedback('success', 'Settings saved.');
  };

  // Overview Stats (Active only)
  const totalInquiries = activeInquiries.length;
  const newLeads = activeInquiries.filter((i) => i.status === 'new').length;
  const pendingCallbacks = activeCallbacks.filter((c) => c.status === 'pending').length;
  const totalBookings = activeBookings.length;
  const pendingBookings = activeBookings.filter((b) => b.status === 'Pending').length;
  const totalQuotes = activeQuotations.length;
  const pipelineValue = activeQuotations.reduce((acc, q) => acc + q.grandTotal, 0);

  // Filtered service presets for searchable dropdown
  const visibleServicePresets = QUOTATION_SERVICE_PRESETS.filter((p) =>
    !serviceFilterQuery.trim()
      ? true
      : p.title.toLowerCase().includes(serviceFilterQuery.toLowerCase())
  );

  // Reusable Selection & Bulk Action Bar
  const renderSelectionBar = (entityType: PortalEntityType, allVisibleIds: string[]) => {
    const allSelected =
      allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

    return (
      <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              allSelected ? handleClearSelection() : handleSelectAll(allVisibleIds)
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Select All</span>
          </button>

          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium cursor-pointer"
              >
                Clear Selection
              </button>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {selectedIds.length} selected
              </span>
            </>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                requestMoveToTrash(
                  entityType,
                  selectedIds,
                  `${selectedIds.length} selected record(s)`
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Move to Trash</span>
            </button>
            <button
              type="button"
              onClick={() =>
                requestPermanentDelete(
                  entityType,
                  selectedIds,
                  `${selectedIds.length} selected record(s)`
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Permanently</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-3 overflow-y-auto">
      <div
        className="bg-slate-50 rounded-xl max-w-6xl w-full border border-slate-300 shadow-2xl relative my-2 max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Top Header Bar */}
        <div className="bg-slate-900 text-white py-2.5 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              BBE
            </div>
            <div className=" truncate">
              <div className="font-heading font-bold text-sm tracking-tight flex items-center gap-2">
                <span className="truncate">BLUE BIRD ENTERPRISES — Management Portal</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-900 text-blue-200">
                  Admin
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                PortalStorage.setOwnerAuthenticated(false);
                onLogout();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close portal modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-3 flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'leads'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Enquiries ({totalInquiries})</span>
          </button>

          <button
            onClick={() => setActiveTab('callbacks')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'callbacks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Callbacks ({activeCallbacks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Bookings ({totalBookings})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'quotations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Quotations ({totalQuotes})</span>
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'trash'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash</span>
            {totalTrashCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px]">
                {totalTrashCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Status Feedback Toast Banner */}
        {feedbackBanner && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
              feedbackBanner.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackBanner.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackBanner.message}</span>
            </div>
            <button
              onClick={() => setFeedbackBanner(null)}
              className="text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Compact Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">Enquiries</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {totalInquiries}{' '}
                    <span className="text-xs font-semibold text-blue-600">({newLeads} new)</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">Callbacks</div>
                  <div className="text-xl font-extrabold text-amber-700 mt-0.5">
                    {pendingCallbacks}{' '}
                    <span className="text-xs font-normal text-slate-500">pending</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">Bookings</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {totalBookings}{' '}
                    <span className="text-xs font-semibold text-emerald-700">
                      ({pendingBookings} pending)
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">Quotations</div>
                  <div className="text-lg font-extrabold text-emerald-800 mt-0.5">
                    {formatINR(pipelineValue)}
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800">Quick Actions</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('quotations');
                      openNewQuotationModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Quotation</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    Manage Enquiries
                  </button>
                  <button
                    onClick={() => setActiveTab('trash')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Trash ({totalTrashCount})</span>
                  </button>
                </div>
              </div>

              {/* Recent Enquiries List */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <span className="font-bold text-slate-800 text-xs">Recent Enquiries</span>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {activeInquiries.slice(0, 5).map((inq) => (
                    <div
                      key={inq.id}
                      className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">
                            {inq.referenceNo}
                          </span>
                          <span className="font-bold text-slate-900">{inq.customerName}</span>
                          <span className="text-slate-500 truncate">({inq.companyName})</span>
                        </div>
                        <div className="text-slate-600 truncate">
                          {inq.serviceRequired} • {inq.siteLocation}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                          {inq.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() =>
                            setViewingRecord({ entityType: 'enquiries', data: inq })
                          }
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            setEditingRecord({ entityType: 'enquiries', data: { ...inq } })
                          }
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            requestMoveToTrash('enquiries', [inq.id], inq.referenceNo)
                          }
                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeInquiries.length === 0 && (
                    <div className="p-4 text-center text-slate-500">No active enquiries.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENQUIRIES (LEADS) */}
          {activeTab === 'leads' && (
            <div className="space-y-2.5">
              {/* Compact Search & Filter Bar */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Search enquiries..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50"
                    />
                  </div>

                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
                  >
                    <option value="all">All Status ({activeInquiries.length})</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quotation_sent">Quotation Sent</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>

              {renderSelectionBar(
                'enquiries',
                filteredLeads.map((i) => i.id)
              )}

              {/* Compact Enquiries Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-8">
                          <input
                            type="checkbox"
                            aria-label="Select all enquiries"
                            checked={
                              filteredLeads.length > 0 &&
                              filteredLeads.every((i) => selectedIds.includes(i.id))
                            }
                            onChange={(e) =>
                              e.target.checked
                                ? handleSelectAll(filteredLeads.map((i) => i.id))
                                : handleClearSelection()
                            }
                            className="rounded border-slate-300 cursor-pointer"
                          />
                        </th>
                        <th className="py-2 px-3">Ref</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Service & Site</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500">
                            No enquiries found.
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((inq) => (
                          <tr
                            key={inq.id}
                            className={`hover:bg-slate-50 ${
                              selectedIds.includes(inq.id) ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="checkbox"
                                aria-label={`Select ${inq.referenceNo}`}
                                checked={selectedIds.includes(inq.id)}
                                onChange={() => toggleSelectOne(inq.id)}
                                className="rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                              <div className="font-mono font-bold text-blue-700">
                                {inq.referenceNo}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(inq.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-bold text-slate-900">{inq.customerName}</div>
                              <div className="text-[11px] text-slate-500">
                                {inq.companyName} • +91 {inq.mobileNumber}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-semibold text-slate-800">
                                {inq.serviceRequired}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                {inq.siteLocation}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                              <select
                                value={inq.status}
                                onChange={(e) =>
                                  handleStatusChange(inq.id, e.target.value as LeadStatus)
                                }
                                className="text-[11px] font-semibold px-2 py-1 rounded border border-slate-300 bg-white cursor-pointer"
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="quotation_sent">Quote Sent</option>
                                <option value="converted">Converted</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setViewingRecord({ entityType: 'enquiries', data: inq })
                                  }
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                                  title="View"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingRecord({
                                      entityType: 'enquiries',
                                      data: { ...inq },
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                                  title="Edit"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleQuoteFromInquiry(inq)}
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold cursor-pointer"
                                  title="Create Quote"
                                >
                                  Quote
                                </button>
                                <button
                                  onClick={() =>
                                    requestMoveToTrash('enquiries', [inq.id], inq.referenceNo)
                                  }
                                  className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold cursor-pointer"
                                  title="Move to Trash"
                                >
                                  Move to Trash
                                </button>
                                <button
                                  onClick={() =>
                                    requestPermanentDelete('enquiries', [inq.id], inq.referenceNo)
                                  }
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                                  title="Delete Permanently"
                                >
                                  Delete
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

          {/* TAB 3: CALLBACKS */}
          {activeTab === 'callbacks' && (
            <div className="space-y-2.5">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={callbackSearch}
                    onChange={(e) => setCallbackSearch(e.target.value)}
                    placeholder="Search callbacks..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50"
                  />
                </div>
                <select
                  value={callbackStatusFilter}
                  onChange={(e) => setCallbackStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
                >
                  <option value="all">All Status ({activeCallbacks.length})</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {renderSelectionBar(
                'callbacks',
                filteredCallbacks.map((c) => c.id)
              )}

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-8">
                          <input
                            type="checkbox"
                            aria-label="Select all callbacks"
                            checked={
                              filteredCallbacks.length > 0 &&
                              filteredCallbacks.every((c) => selectedIds.includes(c.id))
                            }
                            onChange={(e) =>
                              e.target.checked
                                ? handleSelectAll(filteredCallbacks.map((c) => c.id))
                                : handleClearSelection()
                            }
                            className="rounded border-slate-300 cursor-pointer"
                          />
                        </th>
                        <th className="py-2 px-3">Ref</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Schedule & Notes</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCallbacks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500">
                            No callbacks found.
                          </td>
                        </tr>
                      ) : (
                        filteredCallbacks.map((cb) => (
                          <tr
                            key={cb.id}
                            className={`hover:bg-slate-50 ${
                              selectedIds.includes(cb.id) ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="checkbox"
                                aria-label={`Select ${cb.referenceNo}`}
                                checked={selectedIds.includes(cb.id)}
                                onChange={() => toggleSelectOne(cb.id)}
                                className="rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle font-mono font-bold text-blue-700 whitespace-nowrap">
                              {cb.referenceNo}
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-bold text-slate-900">{cb.customerName}</div>
                              <div className="text-[11px] text-slate-500">
                                {cb.companyName} • +91 {cb.mobileNumber}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-semibold text-slate-800">
                                {cb.preferredDate} ({cb.preferredTime})
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                                {cb.notes}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <select
                                value={cb.status}
                                onChange={(e) =>
                                  handleCallbackStatus(cb.id, e.target.value as CallbackStatus)
                                }
                                className="text-[11px] font-semibold px-2 py-1 rounded border border-slate-300 bg-white cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setViewingRecord({ entityType: 'callbacks', data: cb })
                                  }
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingRecord({
                                      entityType: 'callbacks',
                                      data: { ...cb },
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    requestMoveToTrash('callbacks', [cb.id], cb.referenceNo)
                                  }
                                  className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold cursor-pointer"
                                >
                                  Move to Trash
                                </button>
                                <button
                                  onClick={() =>
                                    requestPermanentDelete('callbacks', [cb.id], cb.referenceNo)
                                  }
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                                >
                                  Delete
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

          {/* TAB 4: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-2.5">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search bookings..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50"
                  />
                </div>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
                >
                  <option value="all">All Status ({activeBookings.length})</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {renderSelectionBar(
                'bookings',
                filteredBookings.map((b) => b.id)
              )}

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-8">
                          <input
                            type="checkbox"
                            aria-label="Select all bookings"
                            checked={
                              filteredBookings.length > 0 &&
                              filteredBookings.every((b) => selectedIds.includes(b.id))
                            }
                            onChange={(e) =>
                              e.target.checked
                                ? handleSelectAll(filteredBookings.map((b) => b.id))
                                : handleClearSelection()
                            }
                            className="rounded border-slate-300 cursor-pointer"
                          />
                        </th>
                        <th className="py-2 px-3">Ref</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Service & Schedule</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500">
                            No bookings found.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr
                            key={b.id}
                            className={`hover:bg-slate-50 ${
                              selectedIds.includes(b.id) ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="checkbox"
                                aria-label={`Select ${b.bookingReference}`}
                                checked={selectedIds.includes(b.id)}
                                onChange={() => toggleSelectOne(b.id)}
                                className="rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle font-mono font-bold text-blue-700 whitespace-nowrap">
                              {b.bookingReference}
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-bold text-slate-900">{b.customerName}</div>
                              <div className="text-[11px] text-slate-500">
                                {b.companyName} • +91 {b.phone}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-semibold text-slate-800">
                                {b.requestedService}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {b.scheduledDate} at {b.scheduledTime} • {b.siteAddress}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <select
                                value={b.status}
                                onChange={(e) =>
                                  handleBookingStatus(b.id, e.target.value as any)
                                }
                                className="text-[11px] font-semibold px-2 py-1 rounded border border-slate-300 bg-white cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Rescheduled">Rescheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setViewingRecord({ entityType: 'bookings', data: b })
                                  }
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingRecord({
                                      entityType: 'bookings',
                                      data: { ...b },
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    requestMoveToTrash('bookings', [b.id], b.bookingReference)
                                  }
                                  className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold cursor-pointer"
                                >
                                  Move to Trash
                                </button>
                                <button
                                  onClick={() =>
                                    requestPermanentDelete('bookings', [b.id], b.bookingReference)
                                  }
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                                >
                                  Delete
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

          {/* TAB 5: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="space-y-2.5">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    placeholder="Search quotations..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50"
                  />
                </div>
                <button
                  onClick={openNewQuotationModal}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Quotation</span>
                </button>
              </div>

              {renderSelectionBar(
                'quotations',
                filteredQuotations.map((q) => q.id)
              )}

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-8">
                          <input
                            type="checkbox"
                            aria-label="Select all quotations"
                            checked={
                              filteredQuotations.length > 0 &&
                              filteredQuotations.every((q) => selectedIds.includes(q.id))
                            }
                            onChange={(e) =>
                              e.target.checked
                                ? handleSelectAll(filteredQuotations.map((q) => q.id))
                                : handleClearSelection()
                            }
                            className="rounded border-slate-300 cursor-pointer"
                          />
                        </th>
                        <th className="py-2 px-3">Quote No</th>
                        <th className="py-2 px-3">Client & Company</th>
                        <th className="py-2 px-3">Items</th>
                        <th className="py-2 px-3">Grand Total</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredQuotations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-500">
                            No quotations found.
                          </td>
                        </tr>
                      ) : (
                        filteredQuotations.map((q) => (
                          <tr
                            key={q.id}
                            className={`hover:bg-slate-50 ${
                              selectedIds.includes(q.id) ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="checkbox"
                                aria-label={`Select ${q.quotationNo}`}
                                checked={selectedIds.includes(q.id)}
                                onChange={() => toggleSelectOne(q.id)}
                                className="rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                              <div className="font-mono font-bold text-blue-700">
                                {q.quotationNo}
                              </div>
                              <div className="text-[10px] text-slate-400">{q.date}</div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-bold text-slate-900">{q.companyName}</div>
                              <div className="text-[11px] text-slate-500">{q.clientName}</div>
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <span className="font-semibold text-slate-700">
                                {q.items.length} item(s)
                              </span>
                            </td>
                            <td className="py-2.5 px-3 align-middle font-mono font-bold text-slate-900 whitespace-nowrap">
                              {formatINR(q.grandTotal)}
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                                {q.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => setViewingQuote(q)}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => openEditQuotationModal(q)}
                                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => generateQuotationPDF(q)}
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold cursor-pointer"
                                >
                                  PDF
                                </button>
                                <button
                                  onClick={() =>
                                    requestMoveToTrash('quotations', [q.id], q.quotationNo)
                                  }
                                  className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold cursor-pointer"
                                >
                                  Move to Trash
                                </button>
                                <button
                                  onClick={() =>
                                    requestPermanentDelete('quotations', [q.id], q.quotationNo)
                                  }
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                                >
                                  Delete
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

              {/* Create / Edit Quotation Modal */}
              {isCreatingQuote && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 overflow-y-auto">
                  <div
                    className="bg-white rounded-xl max-w-2xl w-full border border-slate-300 shadow-2xl relative my-4 max-h-[92vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-slate-900 text-white py-3 px-4 flex items-center justify-between">
                      <h4 className="font-heading font-bold text-sm">
                        {editingQuoteId ? 'Edit Quotation' : 'New GST Quotation'}
                      </h4>
                      <button
                        onClick={() => {
                          setIsCreatingQuote(false);
                          setEditingQuoteId(null);
                        }}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSaveNewQuotation}
                      className="p-4 overflow-y-auto space-y-3 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={newQuoteClient}
                            onChange={(e) => setNewQuoteClient(e.target.value)}
                            placeholder="Customer Name"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={newQuoteCompany}
                            onChange={(e) => setNewQuoteCompany(e.target.value)}
                            placeholder="Company / Facility"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Mobile (10 Digits)
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            value={newQuotePhone}
                            onChange={(e) =>
                              setNewQuotePhone(sanitizeTenDigitMobile(e.target.value))
                            }
                            placeholder="9867833456"
                            className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Site Address
                          </label>
                          <input
                            type="text"
                            value={newQuoteAddress}
                            onChange={(e) => setNewQuoteAddress(e.target.value)}
                            placeholder="Turbhe MIDC, Navi Mumbai"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Email</label>
                          <input
                            type="email"
                            value={newQuoteEmail}
                            onChange={(e) => setNewQuoteEmail(e.target.value)}
                            placeholder="client@company.com"
                            className="w-full p-2 border rounded-lg bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">GSTIN</label>
                          <input
                            type="text"
                            value={newQuoteGstin}
                            onChange={(e) => setNewQuoteGstin(e.target.value)}
                            placeholder="Optional"
                            className="w-full p-2 border rounded-lg bg-slate-50 uppercase"
                          />
                        </div>
                      </div>

                      {/* Simplified Line Items Section */}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <label className="font-bold text-slate-800">Line Items</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={serviceFilterQuery}
                              onChange={(e) => setServiceFilterQuery(e.target.value)}
                              placeholder="Filter services..."
                              className="px-2 py-1 border border-slate-300 rounded text-[11px] bg-slate-50 w-32"
                            />
                            <button
                              type="button"
                              onClick={handleAddQuoteItem}
                              className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Item</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleAddManualQuoteItem}
                              className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Add Manual Item</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {newQuoteItems.map((item, idx) => {
                            const matchedPreset = QUOTATION_SERVICE_PRESETS.find(
                              (p) =>
                                p.title === item.serviceOption ||
                                p.defaultDescription === item.description
                            );
                            const currentSelectValue =
                              item.serviceOption === MANUAL_SERVICE_OPTION_VALUE
                                ? MANUAL_SERVICE_OPTION_VALUE
                                : matchedPreset
                                ? matchedPreset.title
                                : MANUAL_SERVICE_OPTION_VALUE;

                            return (
                              <div
                                key={item.id}
                                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
                              >
                                <div className="flex items-center gap-2 justify-between">
                                  <span className="text-[11px] font-bold text-slate-600">
                                    #{idx + 1}
                                  </span>
                                  <select
                                    aria-label={`Select Item ${idx + 1}`}
                                    value={currentSelectValue}
                                    onChange={(e) =>
                                      handleServiceOptionChange(idx, e.target.value)
                                    }
                                    className="flex-1 p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold text-slate-900"
                                  >
                                    <option value="" disabled>
                                      Select Item
                                    </option>
                                    {visibleServicePresets.map((preset) => (
                                      <option key={preset.id} value={preset.title}>
                                        {preset.title}
                                      </option>
                                    ))}
                                    <option value={MANUAL_SERVICE_OPTION_VALUE}>
                                      Custom Item
                                    </option>
                                  </select>

                                  {newQuoteItems.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveQuoteItem(idx)}
                                      className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-bold cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                  <div className="sm:col-span-6">
                                    <input
                                      type="text"
                                      required
                                      placeholder="Item name or short description"
                                      value={item.description}
                                      onChange={(e) =>
                                        handleUpdateQuoteItem(idx, 'description', e.target.value)
                                      }
                                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <input
                                      type="text"
                                      placeholder="Unit"
                                      value={item.unit}
                                      onChange={(e) =>
                                        handleUpdateQuoteItem(idx, 'unit', e.target.value)
                                      }
                                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Qty"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        handleUpdateQuoteItem(
                                          idx,
                                          'quantity',
                                          Number(e.target.value)
                                        )
                                      }
                                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="Rate"
                                      value={item.unitRate}
                                      onChange={(e) =>
                                        handleUpdateQuoteItem(
                                          idx,
                                          'unitRate',
                                          Number(e.target.value)
                                        )
                                      }
                                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Totals Summary */}
                        {(() => {
                          const liveTotals = calculateQuotationTotals(newQuoteItems);
                          return (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                              <span>
                                Subtotal: <strong>{formatINR(liveTotals.subtotal)}</strong> + GST
                                (18%): <strong>{formatINR(liveTotals.totalGst)}</strong>
                              </span>
                              <span className="font-bold text-blue-900">
                                Total: {formatINR(liveTotals.grandTotal)}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="pt-2 border-t flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingQuote(false);
                            setEditingQuoteId(null);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TRASH SECTION */}
          {activeTab === 'trash' && (
            <div className="space-y-2.5">
              {/* Trash Header & Search */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[220px]">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      value={trashSearch}
                      onChange={(e) => setTrashSearch(e.target.value)}
                      placeholder="Search trashed items..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50"
                    />
                  </div>

                  <select
                    value={trashTypeFilter}
                    onChange={(e) => setTrashTypeFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
                  >
                    <option value="all">All Types ({totalTrashCount})</option>
                    <option value="enquiries">Enquiries ({trashedInquiries.length})</option>
                    <option value="callbacks">Callbacks ({trashedCallbacks.length})</option>
                    <option value="bookings">Bookings ({trashedBookings.length})</option>
                    <option value="quotations">Quotations ({trashedQuotations.length})</option>
                  </select>
                </div>

                {totalTrashCount > 0 && (
                  <button
                    type="button"
                    onClick={requestEmptyTrash}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Empty Trash</span>
                  </button>
                )}
              </div>

              {/* Trash Bulk Selection Bar */}
              <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected =
                        allTrashRecords.length > 0 &&
                        allTrashRecords.every((r) => isTrashItemSelected(r.entityType, r.id));
                      if (allSelected) {
                        setSelectedTrashItems([]);
                      } else {
                        setSelectedTrashItems(
                          allTrashRecords.map((r) => ({ entityType: r.entityType, id: r.id }))
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    <span>Select All</span>
                  </button>

                  {selectedTrashItems.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedTrashItems([])}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium cursor-pointer"
                      >
                        Clear Selection
                      </button>
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        {selectedTrashItems.length} selected
                      </span>
                    </>
                  )}
                </div>

                {selectedTrashItems.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleBulkRestoreTrash}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPermanentConfirmChecked(false);
                        setConfirmDialog({
                          isOpen: true,
                          mode: 'permanent',
                          ids: selectedTrashItems.map((t) => t.id),
                          label: `${selectedTrashItems.length} selected trashed item(s)`,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Trash Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-8"></th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Ref</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Details</th>
                        <th className="py-2 px-3">Deleted</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allTrashRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            Trash is empty.
                          </td>
                        </tr>
                      ) : (
                        allTrashRecords.map((item) => (
                          <tr key={`${item.entityType}-${item.id}`} className="hover:bg-rose-50/30">
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="checkbox"
                                checked={isTrashItemSelected(item.entityType, item.id)}
                                onChange={() =>
                                  toggleSelectTrashItem(item.entityType, item.id)
                                }
                                className="rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                                {item.typeLabel} (Trashed)
                              </span>
                            </td>
                            <td className="py-2.5 px-3 align-middle font-mono font-bold text-slate-700">
                              {item.ref}
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-[11px] text-slate-500">{item.company}</div>
                            </td>
                            <td className="py-2.5 px-3 align-middle text-slate-600">
                              {item.detail}
                            </td>
                            <td className="py-2.5 px-3 align-middle text-[11px] text-slate-500 whitespace-nowrap">
                              {new Date(item.deletedAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRestoreRecords(item.entityType, [item.id])
                                  }
                                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold cursor-pointer inline-flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    requestPermanentDelete(
                                      item.entityType,
                                      [item.id],
                                      item.ref
                                    )
                                  }
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete Permanently</span>
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

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="font-heading font-bold text-slate-900 text-sm mb-3">
                Contact & Business Settings
              </h4>
              <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Primary Phone (10 Digits)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={sanitizeTenDigitMobile(cleanPhoneNumber(settings.primaryPhone))}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryPhone: sanitizeTenDigitMobile(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Secondary Phone (10 Digits)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={sanitizeTenDigitMobile(cleanPhoneNumber(settings.secondaryPhone))}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          secondaryPhone: sanitizeTenDigitMobile(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      WhatsApp Number (10 Digits)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={sanitizeTenDigitMobile(cleanPhoneNumber(settings.whatsappNumber))}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          whatsappNumber: sanitizeTenDigitMobile(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-slate-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Office Address</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* VIEW RECORD MODAL */}
      {viewingRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3"
          onClick={() => setViewingRecord(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full border border-slate-300 shadow-xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Record Details</span>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div>
                <span className="text-slate-500">Reference:</span>{' '}
                <strong className="font-mono text-blue-700">
                  {viewingRecord.data.referenceNo || viewingRecord.data.bookingReference}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Customer:</span>{' '}
                <strong>{viewingRecord.data.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Company:</span>{' '}
                <strong>{viewingRecord.data.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span>{' '}
                <strong className="font-mono">
                  +91 {viewingRecord.data.mobileNumber || viewingRecord.data.phone}
                </strong>
              </div>
              {(viewingRecord.data.serviceRequired || viewingRecord.data.requestedService) && (
                <div>
                  <span className="text-slate-500">Service:</span>{' '}
                  <strong>
                    {viewingRecord.data.serviceRequired || viewingRecord.data.requestedService}
                  </strong>
                </div>
              )}
              {(viewingRecord.data.siteLocation || viewingRecord.data.siteAddress) && (
                <div>
                  <span className="text-slate-500">Location:</span>{' '}
                  <span>{viewingRecord.data.siteLocation || viewingRecord.data.siteAddress}</span>
                </div>
              )}
              {(viewingRecord.data.workDescription || viewingRecord.data.notes) && (
                <div>
                  <span className="text-slate-500">Notes:</span>{' '}
                  <span>{viewingRecord.data.workDescription || viewingRecord.data.notes}</span>
                </div>
              )}
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  onClick={() => {
                    const rec = viewingRecord;
                    setViewingRecord(null);
                    setEditingRecord({
                      entityType: rec.entityType,
                      data: { ...rec.data },
                    });
                  }}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white font-bold cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL */}
      {editingRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3"
          onClick={() => setEditingRecord(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full border border-slate-300 shadow-xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Edit Record</span>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedRecord} className="p-4 space-y-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editingRecord.data.customerName || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      data: { ...editingRecord.data, customerName: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={editingRecord.data.companyName || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      data: { ...editingRecord.data, companyName: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={
                    editingRecord.data.mobileNumber !== undefined
                      ? editingRecord.data.mobileNumber
                      : editingRecord.data.phone || ''
                  }
                  onChange={(e) => {
                    const val = sanitizeTenDigitMobile(e.target.value);
                    setEditingRecord({
                      ...editingRecord,
                      data: {
                        ...editingRecord.data,
                        ...(editingRecord.data.mobileNumber !== undefined
                          ? { mobileNumber: val }
                          : { phone: val }),
                      },
                    });
                  }}
                  className="w-full p-2 border rounded bg-slate-50 font-mono"
                />
              </div>

              {editingRecord.entityType === 'enquiries' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Service</label>
                    <select
                      value={normalizeServiceName(editingRecord.data.serviceRequired || '')}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          data: { ...editingRecord.data, serviceRequired: e.target.value },
                        })
                      }
                      className="w-full p-2 border rounded bg-slate-50"
                    >
                      <option value="" disabled>
                        Select Service
                      </option>
                      {QUOTATION_SERVICE_PRESETS.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Site Location</label>
                    <input
                      type="text"
                      value={editingRecord.data.siteLocation || ''}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          data: { ...editingRecord.data, siteLocation: e.target.value },
                        })
                      }
                      className="w-full p-2 border rounded bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Notes</label>
                    <textarea
                      rows={2}
                      value={editingRecord.data.internalNotes || ''}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          data: { ...editingRecord.data, internalNotes: e.target.value },
                        })
                      }
                      className="w-full p-2 border rounded bg-slate-50"
                    />
                  </div>
                </>
              )}

              {editingRecord.entityType === 'callbacks' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={editingRecord.data.notes || ''}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        data: { ...editingRecord.data, notes: e.target.value },
                      })
                    }
                    className="w-full p-2 border rounded bg-slate-50"
                  />
                </div>
              )}

              {editingRecord.entityType === 'bookings' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Service</label>
                    <select
                      value={normalizeServiceName(editingRecord.data.requestedService || '')}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          data: { ...editingRecord.data, requestedService: e.target.value },
                        })
                      }
                      className="w-full p-2 border rounded bg-slate-50"
                    >
                      <option value="" disabled>
                        Select Service
                      </option>
                      {QUOTATION_SERVICE_PRESETS.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Site Address</label>
                    <input
                      type="text"
                      value={editingRecord.data.siteAddress || ''}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          data: { ...editingRecord.data, siteAddress: e.target.value },
                        })
                      }
                      className="w-full p-2 border rounded bg-slate-50"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-blue-600 text-white font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DELETION CONFIRMATION DIALOG */}
      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3"
          onClick={() => !isProcessingDelete && setConfirmDialog({ ...confirmDialog, isOpen: false })}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-4 py-3 text-white flex items-center justify-between ${
                confirmDialog.mode === 'trash' ? 'bg-amber-600' : 'bg-rose-600'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {confirmDialog.mode === 'trash'
                    ? 'Confirm Move to Trash'
                    : confirmDialog.mode === 'empty_trash'
                    ? 'Confirm Empty Trash'
                    : 'Confirm Permanent Delete'}
                </span>
              </div>
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="p-1 rounded bg-black/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {confirmDialog.mode === 'trash' ? (
                <p className="text-slate-700 leading-relaxed">
                  Are you sure you want to move <strong>{confirmDialog.label}</strong> to Trash? You
                  can restore trashed items anytime from the Trash tab.
                </p>
              ) : (
                <>
                  <p className="text-slate-700 leading-relaxed">
                    You are about to permanently delete <strong>{confirmDialog.label}</strong> from
                    the database. This action cannot be undone.
                  </p>
                  <label className="flex items-start gap-2 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permanentConfirmChecked}
                      onChange={(e) => setPermanentConfirmChecked(e.target.checked)}
                      className="mt-0.5 rounded border-rose-300 cursor-pointer"
                    />
                    <span className="font-semibold">
                      I confirm permanent deletion of the selected record(s).
                    </span>
                  </label>
                </>
              )}

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isProcessingDelete}
                  onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                  className="px-3.5 py-1.5 rounded bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    isProcessingDelete ||
                    (confirmDialog.mode !== 'trash' && !permanentConfirmChecked)
                  }
                  onClick={executeConfirmedDelete}
                  className={`px-4 py-1.5 rounded text-white font-bold cursor-pointer disabled:opacity-50 ${
                    confirmDialog.mode === 'trash'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isProcessingDelete
                    ? 'Processing...'
                    : confirmDialog.mode === 'trash'
                    ? 'Move to Trash'
                    : confirmDialog.mode === 'empty_trash'
                    ? 'Empty Trash'
                    : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
