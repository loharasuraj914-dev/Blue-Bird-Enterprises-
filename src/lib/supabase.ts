import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://xpyxilnmdrsopzpftmms.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_5SJT_F-cRlXSI2TBUS8U5w_z6Zib1aF';

const getRawEnvVar = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
      return String((import.meta as any).env[key]).trim();
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process?.env?.[key]) {
      return String(process.env[key]).trim();
    }
  } catch {
    // ignore
  }
  return undefined;
};

const isValidHttpUrl = (value?: string): value is string => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  if (trimmed.includes('YOUR_') || trimmed.includes('<') || trimmed.includes('placeholder')) return false;
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

const isValidSupabaseKey = (value?: string): value is string => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 15) return false;
  if (trimmed.includes('YOUR_') || trimmed.includes('<') || trimmed.includes('placeholder')) return false;
  return true;
};

const rawUrl = getRawEnvVar('VITE_SUPABASE_URL');
const rawKey = getRawEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY');

// Supabase Project Credentials provided by user
export const SUPABASE_URL = isValidHttpUrl(rawUrl) ? rawUrl : DEFAULT_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY = isValidSupabaseKey(rawKey)
  ? rawKey
  : DEFAULT_SUPABASE_KEY;

// Public Supabase client instance with safe fallback guarantee
const initSupabaseClient = (): SupabaseClient => {
  try {
    return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch {
    return createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
};

export const supabase: SupabaseClient = initSupabaseClient();

export interface SupabaseHealthReport {
  isConfigured: boolean;
  isProjectReachable: boolean;
  tablesStatus: {
    customer_enquiries: boolean;
    callback_requests: boolean;
    bookings: boolean;
    quotations: boolean;
  };
  errorMessage?: string;
}

/**
 * Checks connectivity to the Supabase endpoint and checks if tables exist
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthReport> {
  const report: SupabaseHealthReport = {
    isConfigured: Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY),
    isProjectReachable: false,
    tablesStatus: {
      customer_enquiries: false,
      callback_requests: false,
      bookings: false,
      quotations: false,
    },
  };

  if (!report.isConfigured) {
    report.errorMessage = 'Supabase environment configuration missing.';
    return report;
  }

  try {
    // 1. Check basic ping / reachable status
    const pingResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
    });

    if (pingResponse.status === 200 || pingResponse.status === 404 || pingResponse.status === 401) {
      report.isProjectReachable = true;
    }

    // 2. Check each table in Supabase
    const tables: Array<keyof SupabaseHealthReport['tablesStatus']> = [
      'customer_enquiries',
      'callback_requests',
      'bookings',
      'quotations',
    ];

    for (const tbl of tables) {
      try {
        const { error } = await supabase.from(tbl).select('*').limit(1);
        if (!error) {
          report.tablesStatus[tbl] = true;
        } else if (error.code === '42P01' || error.message?.includes('schema cache')) {
          report.tablesStatus[tbl] = false;
        } else {
          // If error is permission or RLS, the table exists!
          report.tablesStatus[tbl] = true;
        }
      } catch {
        report.tablesStatus[tbl] = false;
      }
    }
  } catch (err: any) {
    report.isProjectReachable = false;
    report.errorMessage = err?.message || 'Network error connecting to Supabase project.';
  }

  return report;
}
