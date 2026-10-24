/**
 * Local state and persistence management for Blue Bird Enterprises
 * Handles inquiries, callbacks, quotations, and owner settings.
 */

import { generateInquiryRef } from '../utils/validation.ts';
import {
  calculateQuotationTotals,
  generateQuotationNumber,
  QuotationLineItem,
  normalizeQuotationTerms,
} from '../utils/quotation.ts';
import { COMPANY_DETAILS, normalizeServiceName } from './companyData.ts';

export type LeadStatus = 'new' | 'contacted' | 'quotation_sent' | 'converted' | 'closed';
export type CallbackStatus = 'pending' | 'completed' | 'rescheduled' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type PortalEntityType = 'enquiries' | 'callbacks' | 'bookings' | 'quotations';

export interface DeletionRegistry {
  softDeleted: Record<string, string>; // key -> ISO deleted_at timestamp
  permanentlyDeleted: string[]; // array of permanently deleted IDs/references
}

export interface CustomerInquiry {
  id: string;
  referenceNo: string;
  customerName: string;
  companyName: string;
  mobileNumber: string;
  email: string;
  serviceRequired: string;
  siteLocation: string;
  preferredCallback?: string;
  workDescription: string;
  status: LeadStatus;
  internalNotes: string;
  followUpDate?: string;
  deletedAt?: string | null;
  createdAt: string;
}

export interface CallbackRequest {
  id: string;
  referenceNo: string;
  customerName: string;
  companyName: string;
  mobileNumber: string;
  preferredDate: string;
  preferredTime: string;
  status: CallbackStatus;
  notes: string;
  deletedAt?: string | null;
  createdAt: string;
}

export interface QuotationRecord {
  id: string;
  quotationNo: string;
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
  subtotal: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  grandTotal: number;
  terms: string[];
  deletedAt?: string | null;
}

export interface BusinessSettings {
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  gstin: string;
  pan: string;
  businessHours: string;
  emergencyBannerActive: boolean;
}

const STORAGE_KEYS = {
  INQUIRIES: 'bbe_inquiries_v1',
  CALLBACKS: 'bbe_callbacks_v1',
  QUOTATIONS: 'bbe_quotations_v1',
  SETTINGS: 'bbe_settings_v1',
  AUTH: 'bbe_auth_session_v1',
  DELETION_REGISTRY: 'bbe_deleted_registry_v1',
};

// Seed initial inquiries for immediate realistic functionality
const SEED_INQUIRIES: CustomerInquiry[] = [
  {
    id: 'inq-101',
    referenceNo: 'BBE-INQ-2026-X8R2',
    customerName: 'Rajesh K. Mehta',
    companyName: 'Apex Fine Chemicals Ltd.',
    mobileNumber: '9820145678',
    email: 'rmehta@apexfinechem.com',
    serviceRequired: 'ETP & STP Tank Cleaning',
    siteLocation: 'TTC Industrial Area, Pawane MIDC, Plot C-42',
    preferredCallback: 'Morning (10:00 AM - 1:00 PM)',
    workDescription: 'Need bi-annual desludging of 2 effluent holding tanks (~50KL capacity each). Requires confined space PPE protocol.',
    status: 'new',
    internalNotes: 'Urgent requirement before MPCB compliance audit next week. Scheduled site visit with supervisor.',
    followUpDate: '2026-10-24',
    createdAt: '2026-10-22T14:30:00Z'
  },
  {
    id: 'inq-102',
    referenceNo: 'BBE-INQ-2026-M4P9',
    customerName: 'Anand Shinde',
    companyName: 'Navi Mumbai Cold Logistics Hub',
    mobileNumber: '9967123490',
    email: 'operations@nmcoldlogistics.in',
    serviceRequired: 'High-Pressure Drain Cleaning',
    siteLocation: 'Taloja MIDC, Sector 18, Navi Mumbai',
    preferredCallback: 'Afternoon (2:00 PM - 5:00 PM)',
    workDescription: 'Main 300mm stormwater drainage line partially choked with silt and packaging debris causing pooling in loading bay.',
    status: 'contacted',
    internalNotes: 'Called client on 23rd Oct. Requested video of the choked chamber. Tanker + jetting lance requested for Saturday.',
    followUpDate: '2026-10-25',
    createdAt: '2026-10-21T09:15:00Z'
  },
  {
    id: 'inq-103',
    referenceNo: 'BBE-INQ-2026-K2L7',
    customerName: 'Sunil Patil',
    companyName: 'Precision Engineering Components',
    mobileNumber: '9867012345',
    email: 'spatil@pecindia.co.in',
    serviceRequired: 'Suction Tanker Services',
    siteLocation: 'Turbhe MIDC, Navi Mumbai',
    preferredCallback: 'Immediate / Emergency',
    workDescription: 'Underground coolant pit overflow evacuation. Approximately 8000 liters of oily wastewater to be suctioned.',
    status: 'quotation_sent',
    internalNotes: 'Quotation BBE-QT-2026-001 sent via email and WhatsApp. Awaiting approval from plant head.',
    followUpDate: '2026-10-24',
    createdAt: '2026-10-20T11:45:00Z'
  }
];

const SEED_CALLBACKS: CallbackRequest[] = [
  {
    id: 'cb-101',
    referenceNo: 'BBE-CB-2026-7782',
    customerName: 'Mahesh Vernekar',
    companyName: 'Vernekar Polymers',
    mobileNumber: '9819876543',
    preferredDate: '2026-10-24',
    preferredTime: '11:30 AM',
    status: 'pending',
    notes: 'Inquiring about monthly rate contract for suction vehicle at Rabale MIDC plant.',
    createdAt: '2026-10-23T08:15:00Z'
  },
  {
    id: 'cb-102',
    referenceNo: 'BBE-CB-2026-4431',
    customerName: 'Dr. Sanjay Deshmukh',
    companyName: 'Aura Life Science Research',
    mobileNumber: '9833445566',
    preferredDate: '2026-10-23',
    preferredTime: '04:00 PM',
    status: 'completed',
    notes: 'Completed call. Clarified that all field crew are trained in high-grade PPE and gas monitoring.',
    createdAt: '2026-10-22T16:00:00Z'
  }
];

const SEED_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'qt-101',
    quotationNo: 'BBE-QT-2026-001',
    clientName: 'Sunil Patil',
    companyName: 'Precision Engineering Components',
    clientPhone: '+91 98670 12345',
    clientEmail: 'spatil@pecindia.co.in',
    clientGstin: '27AABCP1234P1Z3',
    clientAddress: 'Plot W-12, Turbhe MIDC, Navi Mumbai - 400705',
    date: '2026-10-21',
    validityDays: 30,
    status: 'sent',
    items: [
      {
        id: 'item-1',
        description: 'Industrial Vacuum Suction Tanker Machine with operator & helper for coolant pit evacuation (6,000 Liters Capacity per trip)',
        unit: 'Trip',
        quantity: 2,
        unitRate: 7500
      },
      {
        id: 'item-2',
        description: 'Manual desilting of bottom heavy sludge residue with certified PPE crew',
        unit: 'Lump Sum',
        quantity: 1,
        unitRate: 4500
      }
    ],
    subtotal: 19500,
    cgst: 1755,
    sgst: 1755,
    totalGst: 3510,
    grandTotal: 23010,
    terms: [
      'Water and 3-phase electric power for auxiliary equipment to be supplied by client at site.',
      'Safe truck access and parking permission within plant premises to be arranged by client.',
      'Payment terms: 50% advance along with confirmed work order, balance upon completion of job.',
      'Quotation valid for 30 days from the date of issue.'
    ]
  }
];

export const DEFAULT_SETTINGS: BusinessSettings = {
  primaryPhone: COMPANY_DETAILS.phone1,
  secondaryPhone: COMPANY_DETAILS.phone2,
  whatsappNumber: COMPANY_DETAILS.phone1Raw,
  email: COMPANY_DETAILS.email,
  address: COMPANY_DETAILS.address,
  gstin: COMPANY_DETAILS.gstin,
  pan: COMPANY_DETAILS.pan,
  businessHours: COMPANY_DETAILS.businessHours,
  emergencyBannerActive: true
};

const memoryStore = new Map<string, string>();
const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        return localStorage.getItem(key);
      }
    } catch {
      // fallback
    }
    return memoryStore.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // fallback
    }
    memoryStore.set(key, value);
  },
  removeItem(key: string): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
        localStorage.removeItem(key);
        return;
      }
    } catch {
      // fallback
    }
    memoryStore.delete(key);
  },
};

export class PortalStorage {
  static getDeletionRegistry(): DeletionRegistry {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.DELETION_REGISTRY);
      if (!raw) return { softDeleted: {}, permanentlyDeleted: [] };
      const parsed = JSON.parse(raw);
      return {
        softDeleted: parsed.softDeleted || {},
        permanentlyDeleted: Array.isArray(parsed.permanentlyDeleted) ? parsed.permanentlyDeleted : [],
      };
    } catch {
      return { softDeleted: {}, permanentlyDeleted: [] };
    }
  }

  static saveDeletionRegistry(reg: DeletionRegistry): void {
    safeStorage.setItem(STORAGE_KEYS.DELETION_REGISTRY, JSON.stringify(reg));
  }

  static markSoftDeleted(keys: string[], timestamp: string): void {
    const reg = this.getDeletionRegistry();
    for (const key of keys) {
      if (key) reg.softDeleted[key] = timestamp;
    }
    this.saveDeletionRegistry(reg);
  }

  static clearSoftDeleted(keys: string[]): void {
    const reg = this.getDeletionRegistry();
    for (const key of keys) {
      if (key) delete reg.softDeleted[key];
    }
    this.saveDeletionRegistry(reg);
  }

  static markPermanentlyDeleted(keys: string[]): void {
    const reg = this.getDeletionRegistry();
    const set = new Set(reg.permanentlyDeleted);
    for (const key of keys) {
      if (key) {
        set.add(key);
        delete reg.softDeleted[key];
      }
    }
    reg.permanentlyDeleted = Array.from(set);
    this.saveDeletionRegistry(reg);
  }

  static getInquiries(): CustomerInquiry[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.INQUIRIES);
      const list: CustomerInquiry[] = data ? JSON.parse(data) : SEED_INQUIRIES;
      if (!data) {
        safeStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(SEED_INQUIRIES));
      }
      const reg = this.getDeletionRegistry();
      const permSet = new Set(reg.permanentlyDeleted);
      return list
        .filter((item) => !permSet.has(item.id) && !permSet.has(item.referenceNo))
        .map((item) => ({
          ...item,
          serviceRequired: normalizeServiceName(item.serviceRequired) || item.serviceRequired,
          deletedAt:
            item.deletedAt !== undefined
              ? item.deletedAt
              : reg.softDeleted[item.id] || reg.softDeleted[item.referenceNo] || null,
        }));
    } catch {
      return SEED_INQUIRIES;
    }
  }

  static addInquiry(
    inquiry: Omit<CustomerInquiry, 'id' | 'referenceNo' | 'status' | 'internalNotes' | 'createdAt'> & {
      id?: string;
      referenceNo?: string;
      status?: LeadStatus;
      internalNotes?: string;
    }
  ): CustomerInquiry {
    const inquiries = this.getInquiries();
    const newInquiry: CustomerInquiry = {
      ...inquiry,
      id: inquiry.id || 'inq-' + Date.now(),
      referenceNo: inquiry.referenceNo || generateInquiryRef(),
      status: inquiry.status || 'new',
      internalNotes: inquiry.internalNotes || '',
      deletedAt: null,
      createdAt: new Date().toISOString()
    };
    inquiries.unshift(newInquiry);
    safeStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    return newInquiry;
  }

  static updateInquiry(id: string, updates: Partial<CustomerInquiry>): CustomerInquiry | null {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === id || i.referenceNo === id);
    if (index === -1) return null;
    inquiries[index] = { ...inquiries[index], ...updates };
    safeStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    return inquiries[index];
  }

  static removeInquiriesPermanently(ids: string[]): string[] {
    const idSet = new Set(ids);
    const list = this.getInquiries();
    const removedKeys: string[] = [];
    const remaining = list.filter((item) => {
      if (idSet.has(item.id) || idSet.has(item.referenceNo)) {
        removedKeys.push(item.id, item.referenceNo);
        return false;
      }
      return true;
    });
    safeStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(remaining));
    this.markPermanentlyDeleted([...ids, ...removedKeys]);
    return removedKeys;
  }

  static getCallbacks(): CallbackRequest[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.CALLBACKS);
      const list: CallbackRequest[] = data ? JSON.parse(data) : SEED_CALLBACKS;
      if (!data) {
        safeStorage.setItem(STORAGE_KEYS.CALLBACKS, JSON.stringify(SEED_CALLBACKS));
      }
      const reg = this.getDeletionRegistry();
      const permSet = new Set(reg.permanentlyDeleted);
      return list
        .filter((item) => !permSet.has(item.id) && !permSet.has(item.referenceNo))
        .map((item) => ({
          ...item,
          deletedAt:
            item.deletedAt !== undefined
              ? item.deletedAt
              : reg.softDeleted[item.id] || reg.softDeleted[item.referenceNo] || null,
        }));
    } catch {
      return SEED_CALLBACKS;
    }
  }

  static addCallback(
    cb: Omit<CallbackRequest, 'id' | 'referenceNo' | 'status' | 'createdAt'> & {
      id?: string;
      referenceNo?: string;
    }
  ): CallbackRequest {
    const list = this.getCallbacks();
    const newCb: CallbackRequest = {
      ...cb,
      id: cb.id || 'cb-' + Date.now(),
      referenceNo: cb.referenceNo || 'BBE-CB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      status: 'pending',
      deletedAt: null,
      createdAt: new Date().toISOString()
    };
    list.unshift(newCb);
    safeStorage.setItem(STORAGE_KEYS.CALLBACKS, JSON.stringify(list));
    return newCb;
  }

  static updateCallback(id: string, updates: Partial<CallbackRequest>): CallbackRequest | null {
    const list = this.getCallbacks();
    const idx = list.findIndex(c => c.id === id || c.referenceNo === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    safeStorage.setItem(STORAGE_KEYS.CALLBACKS, JSON.stringify(list));
    return list[idx];
  }

  static removeCallbacksPermanently(ids: string[]): string[] {
    const idSet = new Set(ids);
    const list = this.getCallbacks();
    const removedKeys: string[] = [];
    const remaining = list.filter((item) => {
      if (idSet.has(item.id) || idSet.has(item.referenceNo)) {
        removedKeys.push(item.id, item.referenceNo);
        return false;
      }
      return true;
    });
    safeStorage.setItem(STORAGE_KEYS.CALLBACKS, JSON.stringify(remaining));
    this.markPermanentlyDeleted([...ids, ...removedKeys]);
    return removedKeys;
  }

  static getQuotations(): QuotationRecord[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      const list: QuotationRecord[] = data ? JSON.parse(data) : SEED_QUOTATIONS;
      if (!data) {
        safeStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(SEED_QUOTATIONS));
      }
      const reg = this.getDeletionRegistry();
      const permSet = new Set(reg.permanentlyDeleted);
      return list
        .filter((item) => !permSet.has(item.id) && !permSet.has(item.quotationNo))
        .map((item) => ({
          ...item,
          items: Array.isArray(item.items)
            ? item.items.map((line) => ({
                ...line,
                serviceOption: line.serviceOption
                  ? normalizeServiceName(line.serviceOption) || line.serviceOption
                  : line.serviceOption,
                description: normalizeServiceName(line.description) || line.description,
              }))
            : [],
          terms: normalizeQuotationTerms(item.terms || []),
          deletedAt:
            item.deletedAt !== undefined
              ? item.deletedAt
              : reg.softDeleted[item.id] || reg.softDeleted[item.quotationNo] || null,
        }));
    } catch {
      return SEED_QUOTATIONS;
    }
  }

  static addQuotation(data: Omit<QuotationRecord, 'id' | 'quotationNo' | 'subtotal' | 'cgst' | 'sgst' | 'totalGst' | 'grandTotal'>): QuotationRecord {
    const list = this.getQuotations();
    const totals = calculateQuotationTotals(data.items);
    const newQuot: QuotationRecord = {
      ...data,
      id: 'qt-' + Date.now(),
      quotationNo: generateQuotationNumber(list.length + 1),
      deletedAt: null,
      ...totals
    };
    list.unshift(newQuot);
    safeStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(list));
    return newQuot;
  }

  static updateQuotation(id: string, updates: Partial<QuotationRecord>): QuotationRecord | null {
    const list = this.getQuotations();
    const idx = list.findIndex(q => q.id === id || q.quotationNo === id);
    if (idx === -1) return null;
    const merged = { ...list[idx], ...updates };
    if (updates.items) {
      const totals = calculateQuotationTotals(updates.items);
      Object.assign(merged, totals);
    }
    list[idx] = merged;
    safeStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(list));
    return list[idx];
  }

  static updateQuotationStatus(id: string, status: QuotationStatus): QuotationRecord | null {
    return this.updateQuotation(id, { status });
  }

  static removeQuotationsPermanently(ids: string[]): string[] {
    const idSet = new Set(ids);
    const list = this.getQuotations();
    const removedKeys: string[] = [];
    const remaining = list.filter((item) => {
      if (idSet.has(item.id) || idSet.has(item.quotationNo)) {
        removedKeys.push(item.id, item.quotationNo);
        return false;
      }
      return true;
    });
    safeStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(remaining));
    this.markPermanentlyDeleted([...ids, ...removedKeys]);
    return removedKeys;
  }

  static getSettings(): BusinessSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: BusinessSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static isOwnerAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  }

  static setOwnerAuthenticated(status: boolean): void {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }
}
