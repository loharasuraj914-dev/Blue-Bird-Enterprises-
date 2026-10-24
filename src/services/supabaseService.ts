/**
 * Blue Bird Enterprises — Supabase Data Service
 * Connects forms, modals, bookings, and the Owner Management Portal directly to Supabase.
 * Provides resilient synchronization with local state, soft-delete (deleted_at), restore,
 * and permanent deletion with relational cleanup for quotation_items.
 */

import { supabase, checkSupabaseHealth, SupabaseHealthReport } from '../lib/supabase.ts';
import {
  PortalStorage,
  CustomerInquiry,
  CallbackRequest,
  QuotationRecord,
  LeadStatus,
  CallbackStatus,
  QuotationStatus,
  PortalEntityType,
} from '../data/portalStore.ts';
import { generateInquiryRef } from '../utils/validation.ts';
import {
  calculateQuotationTotals,
  generateQuotationNumber,
  QuotationLineItem,
  normalizeQuotationTerms,
  normalizeServiceName,
} from '../utils/quotation.ts';

export interface BookingRecord {
  id: string;
  bookingReference: string;
  customerName: string;
  companyName: string;
  phone: string;
  email?: string;
  requestedService: string;
  siteAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'Pending' | 'Confirmed' | 'Rescheduled' | 'Cancelled' | 'Completed';
  notes: string;
  deletedAt?: string | null;
  createdAt: string;
}

export interface DeleteOperationResult {
  success: boolean;
  count: number;
  error?: string;
}

const STORAGE_KEYS = {
  BOOKINGS: 'bbe_bookings_v1',
};

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export class SupabaseService {
  private static remoteSupportsDeletedAt: Record<string, boolean> = {};

  /**
   * Diagnostic check on Supabase connection and tables
   */
  static async getHealth(): Promise<SupabaseHealthReport> {
    return await checkSupabaseHealth();
  }

  // ==========================================================================
  // 1. CUSTOMER ENQUIRIES
  // ==========================================================================
  static async submitCustomerEnquiry(payload: {
    customerName: string;
    companyName?: string;
    phone: string;
    email?: string;
    requestedService?: string;
    siteLocation?: string;
    preferredCallback?: string;
    workDescription?: string;
  }): Promise<{ success: boolean; referenceNo: string; savedToSupabase: boolean; error?: string }> {
    const referenceNo = generateInquiryRef();
    let savedToSupabase = false;
    let remoteId: string | undefined;

    const serviceVal = (payload.requestedService || 'General Industrial Service').trim() || 'General Industrial Service';
    const siteVal = (payload.siteLocation || '').trim() || 'Not specified';
    const descVal = (payload.workDescription || '').trim() || 'Quotation requested';

    const rowPayload = {
      reference_no: referenceNo,
      customer_name: payload.customerName.trim(),
      company_name: (payload.companyName || 'Industrial Client').trim(),
      phone: payload.phone.trim(),
      email: (payload.email || '').trim() || null,
      requested_service: serviceVal,
      site_location: siteVal,
      preferred_callback: payload.preferredCallback || null,
      description: descVal,
      status: 'new',
      internal_notes: '',
    };

    try {
      const { error } = await supabase
        .from('customer_enquiries')
        .insert([rowPayload]);

      if (!error) {
        savedToSupabase = true;
      }
    } catch {
      savedToSupabase = false;
    }

    PortalStorage.addInquiry({
      id: remoteId,
      referenceNo,
      customerName: payload.customerName.trim(),
      companyName: (payload.companyName || 'Industrial Client').trim(),
      mobileNumber: payload.phone.trim(),
      email: (payload.email || '').trim() || 'Not specified',
      serviceRequired: serviceVal,
      siteLocation: siteVal,
      preferredCallback: payload.preferredCallback,
      workDescription: descVal,
    });

    return {
      success: true,
      referenceNo,
      savedToSupabase,
    };
  }

  static async getCustomerEnquiries(): Promise<CustomerInquiry[]> {
    const localList = PortalStorage.getInquiries();
    const reg = PortalStorage.getDeletionRegistry();
    const permSet = new Set(reg.permanentlyDeleted);

    try {
      const { data, error } = await supabase
        .from('customer_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        this.remoteSupportsDeletedAt['customer_enquiries'] = 'deleted_at' in data[0];
        const remoteMapped: CustomerInquiry[] = data
          .filter((row: any) => !permSet.has(row.id) && !permSet.has(row.reference_no))
          .map((row: any) => ({
            id: row.id,
            referenceNo: row.reference_no,
            customerName: row.customer_name,
            companyName: row.company_name || 'Industrial Client',
            mobileNumber: row.phone,
            email: row.email || 'Not specified',
            serviceRequired: normalizeServiceName(row.requested_service),
            siteLocation: row.site_location,
            preferredCallback: row.preferred_callback,
            workDescription: row.description || '',
            status: row.status as LeadStatus,
            internalNotes: row.internal_notes || '',
            followUpDate: row.follow_up_date || undefined,
            deletedAt:
              row.deleted_at !== undefined && row.deleted_at !== null
                ? row.deleted_at
                : reg.softDeleted[row.id] || reg.softDeleted[row.reference_no] || null,
            createdAt: row.created_at,
          }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.referenceNo));
        const unsyncedLocal = localList.filter(
          (l) => !remoteRefs.has(l.referenceNo) && !permSet.has(l.id) && !permSet.has(l.referenceNo)
        );
        return [...remoteMapped, ...unsyncedLocal];
      }
    } catch {
      // Fall through to local storage
    }
    return localList;
  }

  static async updateEnquiry(
    id: string,
    updates: {
      customerName?: string;
      companyName?: string;
      mobileNumber?: string;
      email?: string;
      serviceRequired?: string;
      siteLocation?: string;
      workDescription?: string;
      status?: LeadStatus;
      internalNotes?: string;
      followUpDate?: string;
    }
  ): Promise<boolean> {
    const updatedLocal = PortalStorage.updateInquiry(id, updates);

    try {
      const dbUpdates: any = {};
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName.trim();
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName.trim();
      if (updates.mobileNumber !== undefined) dbUpdates.phone = updates.mobileNumber.trim();
      if (updates.email !== undefined) dbUpdates.email = updates.email.trim() || null;
      if (updates.serviceRequired !== undefined) dbUpdates.requested_service = updates.serviceRequired;
      if (updates.siteLocation !== undefined) dbUpdates.site_location = updates.siteLocation.trim();
      if (updates.workDescription !== undefined) dbUpdates.description = updates.workDescription.trim();
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.internalNotes !== undefined) dbUpdates.internal_notes = updates.internalNotes;
      if (updates.followUpDate !== undefined) dbUpdates.follow_up_date = updates.followUpDate || null;

      if (Object.keys(dbUpdates).length > 0) {
        if (isUuid(id)) {
          await supabase.from('customer_enquiries').update(dbUpdates).eq('id', id);
        } else if (updatedLocal?.referenceNo) {
          await supabase
            .from('customer_enquiries')
            .update(dbUpdates)
            .eq('reference_no', updatedLocal.referenceNo);
        }
      }
      return true;
    } catch {
      return Boolean(updatedLocal);
    }
  }

  // ==========================================================================
  // 2. CALLBACK REQUESTS
  // ==========================================================================
  static async submitCallbackRequest(payload: {
    customerName: string;
    companyName?: string;
    phone: string;
    preferredDate?: string;
    preferredTime?: string;
    notes?: string;
  }): Promise<{ success: boolean; referenceNo: string; savedToSupabase: boolean; error?: string }> {
    const referenceNo =
      'BBE-CB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const prefDate = payload.preferredDate || new Date().toISOString().split('T')[0];
    const prefTime = payload.preferredTime || 'Morning (9 AM - 1 PM)';
    let savedToSupabase = false;
    let remoteId: string | undefined;

    const rowPayload = {
      reference_no: referenceNo,
      customer_name: payload.customerName.trim(),
      company_name: (payload.companyName || 'Industrial Client').trim(),
      phone: payload.phone.trim(),
      preferred_date: prefDate,
      preferred_time: prefTime,
      notes: payload.notes || 'Direct callback requested',
      status: 'pending',
    };

    try {
      const { error } = await supabase
        .from('callback_requests')
        .insert([rowPayload]);

      if (!error) {
        savedToSupabase = true;
      }
    } catch {
      savedToSupabase = false;
    }

    PortalStorage.addCallback({
      id: remoteId,
      referenceNo,
      customerName: payload.customerName.trim(),
      companyName: (payload.companyName || 'Industrial Client').trim(),
      mobileNumber: payload.phone.trim(),
      preferredDate: prefDate,
      preferredTime: prefTime,
      notes: payload.notes || 'Direct callback requested',
    });

    return {
      success: true,
      referenceNo,
      savedToSupabase,
    };
  }

  static async getCallbackRequests(): Promise<CallbackRequest[]> {
    const localList = PortalStorage.getCallbacks();
    const reg = PortalStorage.getDeletionRegistry();
    const permSet = new Set(reg.permanentlyDeleted);

    try {
      const { data, error } = await supabase
        .from('callback_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        this.remoteSupportsDeletedAt['callback_requests'] = 'deleted_at' in data[0];
        const remoteMapped: CallbackRequest[] = data
          .filter((row: any) => !permSet.has(row.id) && !permSet.has(row.reference_no))
          .map((row: any) => ({
            id: row.id,
            referenceNo: row.reference_no,
            customerName: row.customer_name,
            companyName: row.company_name || 'Industrial Client',
            mobileNumber: row.phone,
            preferredDate: row.preferred_date || new Date().toISOString().split('T')[0],
            preferredTime: row.preferred_time || '',
            status: row.status as CallbackStatus,
            notes: row.notes || '',
            deletedAt:
              row.deleted_at !== undefined && row.deleted_at !== null
                ? row.deleted_at
                : reg.softDeleted[row.id] || reg.softDeleted[row.reference_no] || null,
            createdAt: row.created_at,
          }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.referenceNo));
        const unsyncedLocal = localList.filter(
          (l) => !remoteRefs.has(l.referenceNo) && !permSet.has(l.id) && !permSet.has(l.referenceNo)
        );
        return [...remoteMapped, ...unsyncedLocal];
      }
    } catch {
      // Fall through to local storage
    }
    return localList;
  }

  static async updateCallback(
    id: string,
    updates: {
      customerName?: string;
      companyName?: string;
      mobileNumber?: string;
      preferredDate?: string;
      preferredTime?: string;
      status?: CallbackStatus;
      notes?: string;
    }
  ): Promise<boolean> {
    const updatedLocal = PortalStorage.updateCallback(id, updates);
    try {
      const dbUpdates: any = {};
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName.trim();
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName.trim();
      if (updates.mobileNumber !== undefined) dbUpdates.phone = updates.mobileNumber.trim();
      if (updates.preferredDate !== undefined) dbUpdates.preferred_date = updates.preferredDate;
      if (updates.preferredTime !== undefined) dbUpdates.preferred_time = updates.preferredTime;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      if (Object.keys(dbUpdates).length > 0) {
        if (isUuid(id)) {
          await supabase.from('callback_requests').update(dbUpdates).eq('id', id);
        } else if (updatedLocal?.referenceNo) {
          await supabase
            .from('callback_requests')
            .update(dbUpdates)
            .eq('reference_no', updatedLocal.referenceNo);
        }
      }
      return true;
    } catch {
      return Boolean(updatedLocal);
    }
  }

  // ==========================================================================
  // 3. BOOKINGS
  // ==========================================================================
  static getLocalBookings(): BookingRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      let list: BookingRecord[];
      if (!raw) {
        const seed: BookingRecord[] = [
          {
            id: 'bk-101',
            bookingReference: 'BBE-BK-2026-001',
            customerName: 'Sunil Patil',
            companyName: 'Precision Engineering Components',
            phone: '9867012345',
            email: 'spatil@pecindia.co.in',
            requestedService: 'Suction Tanker Services',
            siteAddress: 'Plot W-12, Turbhe MIDC, Navi Mumbai',
            scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            scheduledTime: '09:30 AM',
            status: 'Confirmed',
            notes: 'Evacuation of 8000L coolant pit. Suction tanker and certified crew assigned.',
            deletedAt: null,
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(seed));
        list = seed;
      } else {
        list = JSON.parse(raw);
      }

      const reg = PortalStorage.getDeletionRegistry();
      const permSet = new Set(reg.permanentlyDeleted);
      return list
        .filter((item) => !permSet.has(item.id) && !permSet.has(item.bookingReference))
        .map((item) => ({
          ...item,
          requestedService: normalizeServiceName(item.requestedService),
          deletedAt:
            item.deletedAt !== undefined
              ? item.deletedAt
              : reg.softDeleted[item.id] || reg.softDeleted[item.bookingReference] || null,
        }));
    } catch {
      return [];
    }
  }

  static async submitBooking(payload: {
    customerName: string;
    companyName?: string;
    phone: string;
    email?: string;
    requestedService: string;
    siteAddress: string;
    scheduledDate: string;
    scheduledTime?: string;
    notes?: string;
  }): Promise<{ success: boolean; bookingReference: string; savedToSupabase: boolean; error?: string }> {
    const list = this.getLocalBookings();
    const bookingReference =
      'BBE-BK-' + new Date().getFullYear() + '-' + String(list.length + 1).padStart(3, '0');
    let savedToSupabase = false;
    let remoteId: string | undefined;

    const rowPayload = {
      booking_reference: bookingReference,
      customer_name: payload.customerName.trim(),
      company_name: (payload.companyName || 'Industrial Client').trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || null,
      requested_service: payload.requestedService,
      site_address: payload.siteAddress.trim(),
      scheduled_date: payload.scheduledDate,
      scheduled_time: payload.scheduledTime || '09:00 AM',
      status: 'Pending',
      notes: payload.notes || 'Service inspection booking submitted via web',
    };

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([rowPayload]);

      if (!error) {
        savedToSupabase = true;
      }
    } catch {
      savedToSupabase = false;
    }

    const newBooking: BookingRecord = {
      id: remoteId || 'bk-' + Date.now(),
      bookingReference,
      customerName: payload.customerName.trim(),
      companyName: (payload.companyName || 'Industrial Client').trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim(),
      requestedService: payload.requestedService,
      siteAddress: payload.siteAddress.trim(),
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime || '09:00 AM',
      status: 'Pending',
      notes: payload.notes || '',
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));

    return {
      success: true,
      bookingReference,
      savedToSupabase,
    };
  }

  static async getBookings(): Promise<BookingRecord[]> {
    const localList = this.getLocalBookings();
    const reg = PortalStorage.getDeletionRegistry();
    const permSet = new Set(reg.permanentlyDeleted);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        this.remoteSupportsDeletedAt['bookings'] = 'deleted_at' in data[0];
        const remoteMapped: BookingRecord[] = data
          .filter((row: any) => !permSet.has(row.id) && !permSet.has(row.booking_reference))
          .map((row: any) => ({
            id: row.id,
            bookingReference: row.booking_reference,
            customerName: row.customer_name,
            companyName: row.company_name || 'Industrial Client',
            phone: row.phone,
            email: row.email,
            requestedService: normalizeServiceName(row.requested_service),
            siteAddress: row.site_address,
            scheduledDate: row.scheduled_date,
            scheduledTime: row.scheduled_time || '09:00 AM',
            status: row.status,
            notes: row.notes || '',
            deletedAt:
              row.deleted_at !== undefined && row.deleted_at !== null
                ? row.deleted_at
                : reg.softDeleted[row.id] || reg.softDeleted[row.booking_reference] || null,
            createdAt: row.created_at,
          }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.bookingReference));
        const unsyncedLocal = localList.filter(
          (l) => !remoteRefs.has(l.bookingReference) && !permSet.has(l.id) && !permSet.has(l.bookingReference)
        );
        return [...remoteMapped, ...unsyncedLocal];
      }
    } catch {
      // Fall through to local storage
    }
    return localList;
  }

  static async updateBooking(
    id: string,
    updates: Partial<BookingRecord>
  ): Promise<boolean> {
    const list = this.getLocalBookings();
    const idx = list.findIndex((b) => b.id === id || b.bookingReference === id);
    let bookingRef: string | undefined;
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      bookingRef = list[idx].bookingReference;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
    }

    try {
      const dbUpdates: any = {};
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName.trim();
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName.trim();
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone.trim();
      if (updates.email !== undefined) dbUpdates.email = updates.email?.trim() || null;
      if (updates.requestedService !== undefined) dbUpdates.requested_service = updates.requestedService;
      if (updates.siteAddress !== undefined) dbUpdates.site_address = updates.siteAddress.trim();
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
      if (updates.scheduledTime !== undefined) dbUpdates.scheduled_time = updates.scheduledTime;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      if (Object.keys(dbUpdates).length > 0) {
        if (isUuid(id)) {
          await supabase.from('bookings').update(dbUpdates).eq('id', id);
        } else if (bookingRef) {
          await supabase.from('bookings').update(dbUpdates).eq('booking_reference', bookingRef);
        }
      }
      return true;
    } catch {
      return idx !== -1;
    }
  }

  static async updateBookingStatus(
    id: string,
    status: BookingRecord['status'],
    notes?: string
  ): Promise<boolean> {
    return this.updateBooking(id, { status, ...(notes !== undefined ? { notes } : {}) });
  }

  // ==========================================================================
  // 4. QUOTATIONS & QUOTATION ITEMS
  // ==========================================================================
  static async saveQuotation(data: {
    clientName: string;
    companyName: string;
    clientPhone: string;
    clientEmail: string;
    clientGstin: string;
    clientAddress: string;
    date: string;
    validityDays: number;
    status: QuotationStatus;
    items: QuotationLineItem[];
    terms: string[];
  }): Promise<{ success: boolean; quotation: QuotationRecord; savedToSupabase: boolean }> {
    const totals = calculateQuotationTotals(data.items);
    const existingList = PortalStorage.getQuotations();
    const quotationNo = generateQuotationNumber(existingList.length + 1);

    let savedToSupabase = false;
    let remoteId: string | undefined;

    const rowPayload = {
      quotation_number: quotationNo,
      customer_name: data.clientName.trim(),
      company_name: data.companyName.trim(),
      phone: data.clientPhone.trim() || null,
      email: data.clientEmail.trim() || null,
      gstin: data.clientGstin.trim() || null,
      site_address: data.clientAddress.trim() || null,
      date: data.date,
      validity_days: data.validityDays,
      status: data.status,
      line_items: data.items,
      taxable_amount: totals.subtotal,
      gst_rate: 18.0,
      cgst_amount: totals.cgst,
      sgst_amount: totals.sgst,
      total_gst: totals.totalGst,
      grand_total: totals.grandTotal,
      terms: normalizeQuotationTerms(data.terms || []),
    };

    try {
      const { data: inserted, error } = await supabase
        .from('quotations')
        .insert([rowPayload])
        .select()
        .single();

      if (!error && inserted) {
        savedToSupabase = true;
        remoteId = inserted.id;
      } else if (error) {
        const { error: insertOnlyErr } = await supabase.from('quotations').insert([rowPayload]);
        if (!insertOnlyErr) {
          savedToSupabase = true;
        }
      }

      // Sync relational quotation_items when remoteId is available
      if (remoteId && data.items.length > 0) {
        const relationalItems = data.items.map((item, idx) => ({
          quotation_id: remoteId,
          service_option: item.serviceOption || '__manual__',
          description: item.description,
          unit: item.unit || 'Job',
          quantity: Number(item.quantity) || 1,
          unit_rate: Number(item.unitRate) || 0,
          line_total: (Number(item.quantity) || 1) * (Number(item.unitRate) || 0),
          sort_order: idx,
        }));
        await supabase.from('quotation_items').insert(relationalItems);
      }
    } catch {
      savedToSupabase = false;
    }

    const newQuot: QuotationRecord = {
      ...data,
      id: remoteId || 'qt-' + Date.now(),
      quotationNo,
      deletedAt: null,
      ...totals,
    };

    existingList.unshift(newQuot);
    localStorage.setItem('bbe_quotations_v1', JSON.stringify(existingList));

    return {
      success: true,
      quotation: newQuot,
      savedToSupabase,
    };
  }

  static async getQuotations(): Promise<QuotationRecord[]> {
    const localList = PortalStorage.getQuotations();
    const reg = PortalStorage.getDeletionRegistry();
    const permSet = new Set(reg.permanentlyDeleted);

    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        this.remoteSupportsDeletedAt['quotations'] = 'deleted_at' in data[0];
        const remoteMapped: QuotationRecord[] = data
          .filter((row: any) => !permSet.has(row.id) && !permSet.has(row.quotation_number))
          .map((row: any) => ({
            id: row.id,
            quotationNo: row.quotation_number,
            clientName: row.customer_name,
            companyName: row.company_name,
            clientPhone: row.phone || '',
            clientEmail: row.email || '',
            clientGstin: row.gstin || '',
            clientAddress: row.site_address || '',
            date: row.date,
            validityDays: row.validity_days || 30,
            status: row.status as QuotationStatus,
            items: Array.isArray(row.line_items)
              ? row.line_items.map((li: any) => ({
                  ...li,
                  serviceOption:
                    li.serviceOption && li.serviceOption !== '__manual__'
                      ? normalizeServiceName(li.serviceOption)
                      : li.serviceOption,
                  description: normalizeServiceName(li.description || ''),
                }))
              : [],
            subtotal: Number(row.taxable_amount || 0),
            cgst: Number(row.cgst_amount || 0),
            sgst: Number(row.sgst_amount || 0),
            totalGst: Number(row.total_gst || 0),
            grandTotal: Number(row.grand_total || 0),
            terms: normalizeQuotationTerms(Array.isArray(row.terms) ? row.terms : []),
            deletedAt:
              row.deleted_at !== undefined && row.deleted_at !== null
                ? row.deleted_at
                : reg.softDeleted[row.id] || reg.softDeleted[row.quotation_number] || null,
          }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.quotationNo));
        const unsyncedLocal = localList.filter(
          (l) => !remoteRefs.has(l.quotationNo) && !permSet.has(l.id) && !permSet.has(l.quotationNo)
        );
        return [...remoteMapped, ...unsyncedLocal];
      }
    } catch {
      // Fall through to local storage
    }
    return localList;
  }

  static async updateQuotation(
    id: string,
    updates: Partial<QuotationRecord>
  ): Promise<boolean> {
    const updatedLocal = PortalStorage.updateQuotation(id, updates);
    try {
      const dbUpdates: any = {};
      if (updates.clientName !== undefined) dbUpdates.customer_name = updates.clientName.trim();
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName.trim();
      if (updates.clientPhone !== undefined) dbUpdates.phone = updates.clientPhone.trim() || null;
      if (updates.clientEmail !== undefined) dbUpdates.email = updates.clientEmail.trim() || null;
      if (updates.clientGstin !== undefined) dbUpdates.gstin = updates.clientGstin.trim() || null;
      if (updates.clientAddress !== undefined) dbUpdates.site_address = updates.clientAddress.trim() || null;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.terms !== undefined) dbUpdates.terms = updates.terms;
      if (updates.items !== undefined) {
        const totals = calculateQuotationTotals(updates.items);
        dbUpdates.line_items = updates.items;
        dbUpdates.taxable_amount = totals.subtotal;
        dbUpdates.cgst_amount = totals.cgst;
        dbUpdates.sgst_amount = totals.sgst;
        dbUpdates.total_gst = totals.totalGst;
        dbUpdates.grand_total = totals.grandTotal;
      }

      if (Object.keys(dbUpdates).length > 0) {
        if (isUuid(id)) {
          await supabase.from('quotations').update(dbUpdates).eq('id', id);
        } else if (updatedLocal?.quotationNo) {
          await supabase
            .from('quotations')
            .update(dbUpdates)
            .eq('quotation_number', updatedLocal.quotationNo);
        }
      }
      return true;
    } catch {
      return Boolean(updatedLocal);
    }
  }

  static async updateQuotationStatus(id: string, status: QuotationStatus): Promise<boolean> {
    return this.updateQuotation(id, { status });
  }

  // ==========================================================================
  // 5. TEMPORARY (SOFT) & PERMANENT DELETION OPERATIONS
  // ==========================================================================

  private static getTableMeta(entityType: PortalEntityType): {
    table: string;
    refColumn: string;
  } {
    switch (entityType) {
      case 'enquiries':
        return { table: 'customer_enquiries', refColumn: 'reference_no' };
      case 'callbacks':
        return { table: 'callback_requests', refColumn: 'reference_no' };
      case 'bookings':
        return { table: 'bookings', refColumn: 'booking_reference' };
      case 'quotations':
        return { table: 'quotations', refColumn: 'quotation_number' };
    }
  }

  /**
   * Move one or multiple records to Trash (sets deleted_at timestamp)
   */
  static async moveToTrash(
    entityType: PortalEntityType,
    ids: string[]
  ): Promise<DeleteOperationResult> {
    if (!ids || ids.length === 0) {
      return { success: false, count: 0, error: 'No records selected.' };
    }

    const nowIso = new Date().toISOString();
    const { table, refColumn } = this.getTableMeta(entityType);
    const allKeys: string[] = [...ids];

    // 1. Update local storage & collect reference keys
    if (entityType === 'enquiries') {
      for (const id of ids) {
        const rec = PortalStorage.updateInquiry(id, { deletedAt: nowIso });
        if (rec) allKeys.push(rec.id, rec.referenceNo);
      }
    } else if (entityType === 'callbacks') {
      for (const id of ids) {
        const rec = PortalStorage.updateCallback(id, { deletedAt: nowIso });
        if (rec) allKeys.push(rec.id, rec.referenceNo);
      }
    } else if (entityType === 'bookings') {
      const list = this.getLocalBookings();
      const idSet = new Set(ids);
      const updated = list.map((b) => {
        if (idSet.has(b.id) || idSet.has(b.bookingReference)) {
          allKeys.push(b.id, b.bookingReference);
          return { ...b, deletedAt: nowIso };
        }
        return b;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
    } else if (entityType === 'quotations') {
      for (const id of ids) {
        const rec = PortalStorage.updateQuotation(id, { deletedAt: nowIso });
        if (rec) allKeys.push(rec.id, rec.quotationNo);
      }
    }

    PortalStorage.markSoftDeleted(allKeys, nowIso);

    // 2. Update Supabase deleted_at timestamp when remote schema supports it
    if (this.remoteSupportsDeletedAt[table]) {
      try {
        const uuidIds = allKeys.filter(isUuid);
        const refIds = allKeys.filter((k) => !isUuid(k) && k.startsWith('BBE-'));

        if (uuidIds.length > 0) {
          await supabase.from(table).update({ deleted_at: nowIso }).in('id', uuidIds);
        }
        if (refIds.length > 0) {
          await supabase.from(table).update({ deleted_at: nowIso }).in(refColumn, refIds);
        }
      } catch {
        // Local soft-delete registry preserves state if remote schema migration is pending
      }
    }

    return { success: true, count: ids.length };
  }

  /**
   * Restore one or multiple records from Trash (clears deleted_at = null)
   */
  static async restoreFromTrash(
    entityType: PortalEntityType,
    ids: string[]
  ): Promise<DeleteOperationResult> {
    if (!ids || ids.length === 0) {
      return { success: false, count: 0, error: 'No records selected to restore.' };
    }

    const { table, refColumn } = this.getTableMeta(entityType);
    const allKeys: string[] = [...ids];

    if (entityType === 'enquiries') {
      for (const id of ids) {
        const rec = PortalStorage.updateInquiry(id, { deletedAt: null });
        if (rec) allKeys.push(rec.id, rec.referenceNo);
      }
    } else if (entityType === 'callbacks') {
      for (const id of ids) {
        const rec = PortalStorage.updateCallback(id, { deletedAt: null });
        if (rec) allKeys.push(rec.id, rec.referenceNo);
      }
    } else if (entityType === 'bookings') {
      const list = this.getLocalBookings();
      const idSet = new Set(ids);
      const updated = list.map((b) => {
        if (idSet.has(b.id) || idSet.has(b.bookingReference)) {
          allKeys.push(b.id, b.bookingReference);
          return { ...b, deletedAt: null };
        }
        return b;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
      } catch {
        // ignore
      }
    } else if (entityType === 'quotations') {
      for (const id of ids) {
        const rec = PortalStorage.updateQuotation(id, { deletedAt: null });
        if (rec) allKeys.push(rec.id, rec.quotationNo);
      }
    }

    PortalStorage.clearSoftDeleted(allKeys);

    if (this.remoteSupportsDeletedAt[table]) {
      try {
        const uuidIds = allKeys.filter(isUuid);
        const refIds = allKeys.filter((k) => !isUuid(k) && k.startsWith('BBE-'));

        if (uuidIds.length > 0) {
          await supabase.from(table).update({ deleted_at: null }).in('id', uuidIds);
        }
        if (refIds.length > 0) {
          await supabase.from(table).update({ deleted_at: null }).in(refColumn, refIds);
        }
      } catch {
        // Local registry cleared
      }
    }

    return { success: true, count: ids.length };
  }

  /**
   * Permanently delete one or multiple records from Supabase and local storage.
   * For quotations, safely removes associated quotation_items to avoid orphaned rows.
   */
  static async deletePermanently(
    entityType: PortalEntityType,
    ids: string[]
  ): Promise<DeleteOperationResult> {
    if (!ids || ids.length === 0) {
      return { success: false, count: 0, error: 'No records selected for permanent deletion.' };
    }

    const { table, refColumn } = this.getTableMeta(entityType);
    let removedKeys: string[] = [...ids];

    if (entityType === 'enquiries') {
      const keys = PortalStorage.removeInquiriesPermanently(ids);
      removedKeys.push(...keys);
    } else if (entityType === 'callbacks') {
      const keys = PortalStorage.removeCallbacksPermanently(ids);
      removedKeys.push(...keys);
    } else if (entityType === 'bookings') {
      const list = this.getLocalBookings();
      const idSet = new Set(ids);
      const remaining = list.filter((b) => {
        if (idSet.has(b.id) || idSet.has(b.bookingReference)) {
          removedKeys.push(b.id, b.bookingReference);
          return false;
        }
        return true;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(remaining));
      } catch {
        // ignore
      }
      PortalStorage.markPermanentlyDeleted(removedKeys);
    } else if (entityType === 'quotations') {
      const keys = PortalStorage.removeQuotationsPermanently(ids);
      removedKeys.push(...keys);
    }

    try {
      const uuidIds = Array.from(new Set(removedKeys.filter(isUuid)));
      const refIds = Array.from(new Set(removedKeys.filter((k) => !isUuid(k) && k.startsWith('BBE-'))));

      // Handle related quotation_items safely to prevent orphaned line items
      if (entityType === 'quotations' && uuidIds.length > 0) {
        await supabase.from('quotation_items').delete().in('quotation_id', uuidIds);
      }

      if (uuidIds.length > 0) {
        await supabase.from(table).delete().in('id', uuidIds);
      }
      if (refIds.length > 0) {
        await supabase.from(table).delete().in(refColumn, refIds);
      }
    } catch {
      // Permanent deletion persisted in local registry
    }

    return { success: true, count: ids.length };
  }

  /**
   * Empty Trash — permanently removes all trashed records across all portal sections
   */
  static async emptyTrash(): Promise<DeleteOperationResult> {
    const [enquiries, callbacks, bookings, quotations] = await Promise.all([
      this.getCustomerEnquiries(),
      this.getCallbackRequests(),
      this.getBookings(),
      this.getQuotations(),
    ]);

    const trashedEnqIds = enquiries.filter((i) => Boolean(i.deletedAt)).map((i) => i.id);
    const trashedCbIds = callbacks.filter((c) => Boolean(c.deletedAt)).map((c) => c.id);
    const trashedBkIds = bookings.filter((b) => Boolean(b.deletedAt)).map((b) => b.id);
    const trashedQtIds = quotations.filter((q) => Boolean(q.deletedAt)).map((q) => q.id);

    const totalCount =
      trashedEnqIds.length + trashedCbIds.length + trashedBkIds.length + trashedQtIds.length;

    if (totalCount === 0) {
      return { success: true, count: 0 };
    }

    await Promise.all([
      trashedEnqIds.length > 0 ? this.deletePermanently('enquiries', trashedEnqIds) : Promise.resolve(),
      trashedCbIds.length > 0 ? this.deletePermanently('callbacks', trashedCbIds) : Promise.resolve(),
      trashedBkIds.length > 0 ? this.deletePermanently('bookings', trashedBkIds) : Promise.resolve(),
      trashedQtIds.length > 0 ? this.deletePermanently('quotations', trashedQtIds) : Promise.resolve(),
    ]);

    return { success: true, count: totalCount };
  }
}
