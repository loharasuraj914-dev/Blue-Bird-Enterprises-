import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../src/lib/supabase.ts';
import { generateInquiryRef } from '../src/utils/validation.ts';
import { calculateQuotationTotals, generateQuotationNumber } from '../src/utils/quotation.ts';

test('Supabase Configuration: uses exact specified project ID and publishable key', () => {
  assert.equal(SUPABASE_URL, 'https://xpyxilnmdrsopzpftmms.supabase.co');
  assert.equal(SUPABASE_PUBLISHABLE_KEY, 'sb_publishable_5SJT_F-cRlXSI2TBUS8U5w_z6Zib1aF');
});

test('Security Audit: No secret keys or service role keys in source code', () => {
  const envExampleContent = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf-8');
  assert.ok(!envExampleContent.includes('service_role'), 'Service role key must never be exposed');
  assert.ok(!envExampleContent.includes('supabase_secret'), 'Secret keys must never be exposed');

  const supabaseClientFile = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'supabase.ts'), 'utf-8');
  assert.ok(!supabaseClientFile.includes('service_role'), 'Service role key must not be present in client file');
});

test('Company Profile & Owner Portal UI compliance checks', () => {
  const companyProfileFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'CompanyProfileModal.tsx'),
    'utf-8'
  );
  assert.ok(!companyProfileFile.includes('PDF View'), 'PDF View button must be removed');
  assert.ok(!companyProfileFile.includes('Text View'), 'Text View button must be removed');
  assert.ok(!companyProfileFile.includes('Open PDF'), 'Open PDF button must be removed');
  assert.ok(companyProfileFile.includes('bg-red-600'), 'Cancel button must be styled in red');
  assert.ok(companyProfileFile.includes('Cancel'), 'Cancel button must be present');

  const ownerPortalFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'OwnerPortal', 'OwnerPortalModal.tsx'),
    'utf-8'
  );
  assert.ok(
    !ownerPortalFile.includes('Supabase Project Integration & Schema Status'),
    'Supabase Project Integration & Schema Status must not be shown in frontend'
  );
});

test('SQL Migration: initial_schema.sql contains all 4 tables with RLS and policies', () => {
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261023_initial_schema.sql');
  assert.ok(fs.existsSync(migrationPath), 'SQL migration file must exist');

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  // Check tables
  assert.ok(sql.includes('public.customer_enquiries'), 'Migration must create customer_enquiries');
  assert.ok(sql.includes('public.callback_requests'), 'Migration must create callback_requests');
  assert.ok(sql.includes('public.bookings'), 'Migration must create bookings');
  assert.ok(sql.includes('public.quotations'), 'Migration must create quotations');

  // Check RLS
  assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY'), 'Migration must enable RLS');
  assert.ok(sql.includes('Public anonymous insert for customer_enquiries'), 'Anonymous insert policy for enquiries');
  assert.ok(sql.includes('Public anonymous insert for callback_requests'), 'Anonymous insert policy for callbacks');
  assert.ok(sql.includes('Public anonymous insert for bookings'), 'Anonymous insert policy for bookings');
  assert.ok(sql.includes('Authorized full access for quotations'), 'Quotations policy must protect business records');
});

test('Reference Number Generation formats', () => {
  const inqRef = generateInquiryRef();
  const currentYear = new Date().getFullYear();
  assert.ok(inqRef.startsWith(`BBE-INQ-${currentYear}-`), 'Enquiry reference must start with BBE-INQ-YYYY-');

  const qNum = generateQuotationNumber(1);
  assert.equal(qNum, `BBE-QT-${currentYear}-001`);
});

test('Quotation Totals calculation integrity for Supabase schema', () => {
  const items = [
    { id: '1', description: 'Vacuum Suction Tanker Trip', unit: 'Trip', quantity: 2, unitRate: 7500 },
    { id: '2', description: 'Manual Desilting Crew', unit: 'Job', quantity: 1, unitRate: 5000 }
  ];
  const totals = calculateQuotationTotals(items);
  assert.equal(totals.subtotal, 20000);
  assert.equal(totals.cgst, 1800);
  assert.equal(totals.sgst, 1800);
  assert.equal(totals.totalGst, 3600);
  assert.equal(totals.grandTotal, 23600);
});
