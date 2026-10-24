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

test('Quotation Line Items, 10-digit mobile restriction, and Get Free Quote mandatory fields compliance', () => {
  const ownerPortalFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'OwnerPortal', 'OwnerPortalModal.tsx'),
    'utf-8'
  );
  assert.ok(
    ownerPortalFile.includes('MANUAL_SERVICE_OPTION_VALUE'),
    'OwnerPortalModal must support Manual / Custom service option in Quotation Line Items'
  );
  assert.ok(
    ownerPortalFile.includes('QUOTATION_SERVICE_PRESETS.map'),
    'OwnerPortalModal must list all company services in Quotation Line Items dropdown'
  );
  assert.ok(
    ownerPortalFile.includes('Add Manual Item'),
    'OwnerPortalModal must provide Add Manual Item option'
  );

  const quoteModalFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'QuoteModal.tsx'),
    'utf-8'
  );
  assert.ok(quoteModalFile.includes('maxLength={10}'), 'QuoteModal mobile input must have maxLength={10}');
  assert.ok(
    quoteModalFile.includes('validateQuoteMandatoryFields'),
    'QuoteModal must validate only the 3 mandatory fields'
  );

  const inquirySectionFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'InquiryQuoteSection.tsx'),
    'utf-8'
  );
  assert.ok(
    inquirySectionFile.includes('maxLength={10}'),
    'InquiryQuoteSection mobile inputs must have maxLength={10}'
  );

  const floatingBarFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'FloatingContactBar.tsx'),
    'utf-8'
  );
  assert.ok(
    floatingBarFile.includes('maxLength={10}'),
    'FloatingContactBar mobile input must have maxLength={10}'
  );
});

test('GitHub Pages Deployment & Subpath Compatibility', () => {
  const viteConfig = fs.readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf-8');
  assert.ok(
    viteConfig.includes("base: '/Blue-Bird-Enterprises-/'"),
    "vite.config.ts must configure base: '/Blue-Bird-Enterprises-/' for GitHub Pages subpath"
  );

  const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'deploy.yml');
  assert.ok(fs.existsSync(workflowPath), 'GitHub Actions deploy workflow must exist');
  const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
  assert.ok(workflowContent.includes('https://xpyxilnmdrsopzpftmms.supabase.co'), 'Workflow must include Supabase URL');

  const bundleDir = path.join(process.cwd(), 'public', 'gh-pages-bundle');
  const bundleJsPath = path.join(bundleDir, 'app.js');
  const bundleCssPath = path.join(bundleDir, 'app.css');
  assert.ok(fs.existsSync(bundleJsPath), 'Prebuilt GitHub Pages fallback JS bundle must exist');
  assert.ok(fs.existsSync(bundleCssPath), 'Prebuilt GitHub Pages fallback CSS bundle must exist');

  // Verify every relative JS chunk imported by app.js (e.g. ./html2canvas-*.js, ./purify.es-*.js, etc.) exists and is non-empty
  const appJsContent = fs.readFileSync(bundleJsPath, 'utf-8');
  const relativeImports = [...appJsContent.matchAll(/["'`]\.\/([a-zA-Z0-9_.-]+\.js)["'`]/g)].map((m) => m[1]);
  assert.ok(relativeImports.length > 0, 'app.js should have dynamic chunk imports to verify');
  for (const relChunk of relativeImports) {
    const chunkPath = path.join(bundleDir, relChunk);
    assert.ok(fs.existsSync(chunkPath), `Referenced chunk ${relChunk} must exist in public/gh-pages-bundle/`);
    assert.ok(fs.statSync(chunkPath).size > 0, `Referenced chunk ${relChunk} must not be an empty file`);

    // Also verify any relative imports inside the companion chunk itself exist
    const chunkContent = fs.readFileSync(chunkPath, 'utf-8');
    const subImports = [...chunkContent.matchAll(/["'`]\.\/([a-zA-Z0-9_.-]+\.js)["'`]/g)].map((m) => m[1]);
    for (const subChunk of subImports) {
      const subChunkPath = path.join(bundleDir, subChunk);
      assert.ok(fs.existsSync(subChunkPath), `Sub-chunk ${subChunk} imported by ${relChunk} must exist in public/gh-pages-bundle/`);
      assert.ok(fs.statSync(subChunkPath).size > 0, `Sub-chunk ${subChunk} must not be empty`);
    }
  }

  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
  assert.ok(indexHtml.includes('__LOAD_GH_FALLBACK'), 'index.html must include automatic GitHub Pages fallback loader');

  const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
  assert.ok(fs.existsSync(distIndexPath), 'dist/index.html must be generated by production build');
  const distIndexHtml = fs.readFileSync(distIndexPath, 'utf-8');
  assert.ok(
    distIndexHtml.includes('/Blue-Bird-Enterprises-/assets/'),
    'dist/index.html must reference assets under /Blue-Bird-Enterprises-/assets/'
  );
});

test('GallerySection: removes "Click to view details" text and disables image click popup modal', () => {
  const galleryFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'GallerySection.tsx'),
    'utf-8'
  );
  assert.ok(
    !galleryFile.includes('Click to view details'),
    'GallerySection must not contain "Click to view details" text'
  );
  assert.ok(
    !galleryFile.includes('setActiveItem'),
    'GallerySection must not open a popup modal when clicking an image'
  );
});

test('Management Portal & Supabase Deletion: supports Move to Trash, Restore, Delete Permanently, Empty Trash, and quotation_items cascade', () => {
  const migrationSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '20261023_initial_schema.sql'),
    'utf-8'
  );
  assert.ok(migrationSql.includes('deleted_at TIMESTAMPTZ'), 'Migration must include deleted_at soft-delete column');
  assert.ok(migrationSql.includes('public.quotation_items'), 'Migration must define quotation_items table');
  assert.ok(migrationSql.includes('ON DELETE CASCADE'), 'quotation_items must cascade on quotation deletion');
  assert.ok(migrationSql.includes('FOR DELETE\n    TO authenticated'), 'Only authenticated owners may permanently delete records');

  const ownerPortalFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'components', 'OwnerPortal', 'OwnerPortalModal.tsx'),
    'utf-8'
  );
  assert.ok(ownerPortalFile.includes('Move to Trash'), 'Portal must include Move to Trash option');
  assert.ok(ownerPortalFile.includes('Restore'), 'Portal must include Restore option');
  assert.ok(ownerPortalFile.includes('Delete Permanently'), 'Portal must include Delete Permanently option');
  assert.ok(ownerPortalFile.includes('Empty Trash'), 'Portal must include Empty Trash option');
  assert.ok(ownerPortalFile.includes('Select All'), 'Portal must include Select All option');
  assert.ok(ownerPortalFile.includes('Clear Selection'), 'Portal must include Clear Selection option');
  assert.ok(ownerPortalFile.includes('Select Item'), 'Portal must include Select Item option');
});




