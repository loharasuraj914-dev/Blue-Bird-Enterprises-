/**
 * Blue Bird Enterprises — Supabase Data Service
 * Connects forms, modals, bookings, and the Owner Management Portal directly to Supabase.
 * Provides resilient synchronization with local state.
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
} from '../data/portalStore.ts';
import { generateInquiryRef } from '../utils/validation.ts';
import { calculateQuotationTotals, generateQuotationNumber, QuotationLineItem } from '../utils/quotation.ts';

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
  createdAt: string;
}

const STORAGE_KEYS = {
  BOOKINGS: 'bbe_bookings_v1',
};

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export class SupabaseService {
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

    // Mirror to local store with the exact same referenceNo & remoteId
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
    try {
      const { data, error } = await supabase
        .from('customer_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const remoteMapped: CustomerInquiry[] = data.map((row: any) => ({
          id: row.id,
          referenceNo: row.reference_no,
          customerName: row.customer_name,
          companyName: row.company_name || 'Industrial Client',
          mobileNumber: row.phone,
          email: row.email || 'Not specified',
          serviceRequired: row.requested_service,
          siteLocation: row.site_location,
          preferredCallback: row.preferred_callback,
          workDescription: row.description || '',
          status: row.status as LeadStatus,
          internalNotes: row.internal_notes || '',
          followUpDate: row.follow_up_date || undefined,
          createdAt: row.created_at,
        }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.referenceNo));
        const unsyncedLocal = localList.filter((l) => !remoteRefs.has(l.referenceNo));
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
      status?: LeadStatus;
      internalNotes?: string;
      followUpDate?: string;
    }
  ): Promise<boolean> {
    // 1. Update local storage and get referenceNo
    const updatedLocal = PortalStorage.updateInquiry(id, updates);

    // 2. Update Supabase by UUID id or reference_no
    try {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.internalNotes !== undefined) dbUpdates.internal_notes = updates.internalNotes;
      if (updates.followUpDate !== undefined) dbUpdates.follow_up_date = updates.followUpDate || null;

      if (isUuid(id)) {
        await supabase.from('customer_enquiries').update(dbUpdates).eq('id', id);
      } else if (updatedLocal?.referenceNo) {
        await supabase
          .from('customer_enquiries')
          .update(dbUpdates)
          .eq('reference_no', updatedLocal.referenceNo);
      }
      return true;
    } catch {
      return false;
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
    try {
      const { data, error } = await supabase
        .from('callback_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const remoteMapped: CallbackRequest[] = data.map((row: any) => ({
          id: row.id,
          referenceNo: row.reference_no,
          customerName: row.customer_name,
          companyName: row.company_name || 'Industrial Client',
          mobileNumber: row.phone,
          preferredDate: row.preferred_date || new Date().toISOString().split('T')[0],
          preferredTime: row.preferred_time || '',
          status: row.status as CallbackStatus,
          notes: row.notes || '',
          createdAt: row.created_at,
        }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.referenceNo));
        const unsyncedLocal = localList.filter((l) => !remoteRefs.has(l.referenceNo));
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
      status?: CallbackStatus;
      notes?: string;
    }
  ): Promise<boolean> {
    const updatedLocal = PortalStorage.updateCallback(id, updates);
    try {
      if (isUuid(id)) {
        await supabase.from('callback_requests').update(updates).eq('id', id);
      } else if (updatedLocal?.referenceNo) {
        await supabase
          .from('callback_requests')
          .update(updates)
          .eq('reference_no', updatedLocal.referenceNo);
      }
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // 3. BOOKINGS
  // ==========================================================================
  static getLocalBookings(): BookingRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (!raw) {
        const seed: BookingRecord[] = [
          {
            id: 'bk-101',
            bookingReference: 'BBE-BK-2026-001',
            customerName: 'Sunil Patil',
            companyName: 'Precision Engineering Components',
            phone: '9867012345',
            email: 'spatil@pecindia.co.in',
            requestedService: 'Suction Vehicle Operations',
            siteAddress: 'Plot W-12, Turbhe MIDC, Navi Mumbai',
            scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            scheduledTime: '09:30 AM',
            status: 'Confirmed',
            notes: 'Evacuation of 8000L coolant pit. Suction tanker and certified crew assigned.',
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw);
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
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const remoteMapped: BookingRecord[] = data.map((row: any) => ({
          id: row.id,
          bookingReference: row.booking_reference,
          customerName: row.customer_name,
          companyName: row.company_name || 'Industrial Client',
          phone: row.phone,
          email: row.email,
          requestedService: row.requested_service,
          siteAddress: row.site_address,
          scheduledDate: row.scheduled_date,
          scheduledTime: row.scheduled_time || '09:00 AM',
          status: row.status,
          notes: row.notes || '',
          createdAt: row.created_at,
        }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.bookingReference));
        const unsyncedLocal = localList.filter((l) => !remoteRefs.has(l.bookingReference));
        return [...remoteMapped, ...unsyncedLocal];
      }
    } catch {
      // Fall through to local storage
    }
    return localList;
  }

  static async updateBookingStatus(
    id: string,
    status: BookingRecord['status'],
    notes?: string
  ): Promise<boolean> {
    const list = this.getLocalBookings();
    const idx = list.findIndex((b) => b.id === id || b.bookingReference === id);
    let bookingRef: string | undefined;
    if (idx !== -1) {
      list[idx].status = status;
      if (notes !== undefined) list[idx].notes = notes;
      bookingRef = list[idx].bookingReference;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
    }

    try {
      const updates: any = { status };
      if (notes !== undefined) updates.notes = notes;
      if (isUuid(id)) {
        await supabase.from('bookings').update(updates).eq('id', id);
      } else if (bookingRef) {
        await supabase.from('bookings').update(updates).eq('booking_reference', bookingRef);
      }
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // 4. QUOTATIONS
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
      terms: data.terms,
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
    } catch {
      savedToSupabase = false;
    }

    const newQuot: QuotationRecord = {
      ...data,
      id: remoteId || 'qt-' + Date.now(),
      quotationNo,
      ...totals,
    };

    // Save to local storage
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
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const remoteMapped: QuotationRecord[] = data.map((row: any) => ({
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
          items: Array.isArray(row.line_items) ? row.line_items : [],
          subtotal: Number(row.taxable_amount || 0),
          cgst: Number(row.cgst_amount || 0),
          sgst: Number(row.sgst_amount || 0),
          totalGst: Number(row.total_gst || 0),
          grandTotal: Number(row.grand_total || 0),
          terms: Array.isArray(row.terms) ? row.terms : [],
        }));

        const remoteRefs = new Set(remoteMapped.map((r) => r.quotationNo));
        const unsyncedLocal = localList.filter((l) => !remoteRefs.has(l.quotationNo));
        return [...remoteMapped, ...unsyncedLocal];
      }
    } catch {
      // Fall through to local storage
    }
    return localList;
  }

  static async updateQuotationStatus(id: string, status: QuotationStatus): Promise<boolean> {
    const updatedLocal = PortalStorage.updateQuotationStatus(id, status);
    try {
      if (isUuid(id)) {
        await supabase.from('quotations').update({ status }).eq('id', id);
      } else if (updatedLocal?.quotationNo) {
        await supabase
          .from('quotations')
          .update({ status })
          .eq('quotation_number', updatedLocal.quotationNo);
      }
      return true;
    } catch {
      return false;
    }
  }
}
