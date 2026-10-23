import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process?.env?.[key]) {
      return process.env[key];
    }
  } catch {
    // ignore
  }
  return fallback;
};

// Supabase Project Credentials provided by user
export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'https://xpyxilnmdrsopzpftmms.supabase.co');

export const SUPABASE_PUBLISHABLE_KEY = getEnvVar(
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'sb_publishable_5SJT_F-cRlXSI2TBUS8U5w_z6Zib1aF'
);

// Public Supabase client instance
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
