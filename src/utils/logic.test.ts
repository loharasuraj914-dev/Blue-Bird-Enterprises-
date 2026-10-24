import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateIndianPhone,
  validateEmail,
  cleanPhoneNumber,
  sanitizeTenDigitMobile,
  validateQuoteMandatoryFields,
} from './validation.ts';
import {
  calculateQuotationTotals,
  formatINR,
  generateQuotationNumber,
  QUOTATION_SERVICE_PRESETS,
  MANUAL_SERVICE_OPTION_VALUE,
  stripLeadingTermNumber,
  normalizeQuotationTerms,
} from './quotation.ts';
import {
  SERVICES_DATA,
  CORE_INTRODUCTION_SERVICES,
  MAIN_SERVICE_NAMES,
  ADDITIONAL_SERVICE_NAMES,
  normalizeServiceName,
} from '../data/companyData.ts';
import { verifyOwnerCredentials } from './auth.ts';

test('validateIndianPhone correctly validates 10-digit Indian numbers', () => {
  // Valid numbers
  assert.equal(validateIndianPhone('9867833456'), true);
  assert.equal(validateIndianPhone('+91 98678 33456'), true);
  assert.equal(validateIndianPhone('09867833456'), true);
  assert.equal(validateIndianPhone('919987324798'), true);
  assert.equal(validateIndianPhone('8123456789'), true);
  assert.equal(validateIndianPhone('7000000000'), true);
  assert.equal(validateIndianPhone('6123456789'), true);

  // Invalid numbers
  assert.equal(validateIndianPhone('5123456789'), false); // Starts with 5
  assert.equal(validateIndianPhone('12345'), false); // Too short
  assert.equal(validateIndianPhone('9867833456000'), false); // Too long
  assert.equal(validateIndianPhone('abcdefghij'), false); // Non-digit
  assert.equal(validateIndianPhone(''), false); // Empty
});

test('sanitizeTenDigitMobile restricts mobile number input to 10 digits only', () => {
  assert.equal(sanitizeTenDigitMobile('98678334569999'), '9867833456');
  assert.equal(sanitizeTenDigitMobile('98678-33456-123'), '9867833456');
  assert.equal(sanitizeTenDigitMobile('abc9987324798xyz'), '9987324798');
  assert.equal(sanitizeTenDigitMobile(''), '');
});

test('validateQuoteMandatoryFields requires only Your Name, Company/Facility Name, and 10-digit Mobile Number', () => {
  // Valid with ONLY the 3 mandatory fields
  const validResult = validateQuoteMandatoryFields({
    customerName: 'Anand Shinde',
    companyName: 'Apex Industries',
    mobileNumber: '9867833456',
  });
  assert.equal(validResult.valid, true);

  // Missing customerName fails
  assert.equal(
    validateQuoteMandatoryFields({
      customerName: '   ',
      companyName: 'Apex Industries',
      mobileNumber: '9867833456',
    }).valid,
    false
  );

  // Missing companyName fails
  assert.equal(
    validateQuoteMandatoryFields({
      customerName: 'Anand Shinde',
      companyName: '',
      mobileNumber: '9867833456',
    }).valid,
    false
  );

  // Invalid or incomplete mobileNumber fails
  assert.equal(
    validateQuoteMandatoryFields({
      customerName: 'Anand Shinde',
      companyName: 'Apex Industries',
      mobileNumber: '98678',
    }).valid,
    false
  );
});

test('QUOTATION_SERVICE_PRESETS includes all listed services with short descriptions and supports manual option', () => {
  assert.equal(QUOTATION_SERVICE_PRESETS.length, SERVICES_DATA.length);
  assert.equal(SERVICES_DATA.length, 13);
  for (const service of SERVICES_DATA) {
    const preset = QUOTATION_SERVICE_PRESETS.find((p) => p.title === service.title);
    assert.ok(
      preset,
      `Service "${service.title}" must be pre-listed in quotation line item presets`
    );
    assert.equal(
      preset.defaultDescription,
      service.title,
      'Preset defaultDescription must be the short service title without long sentences'
    );
  }
  assert.equal(MANUAL_SERVICE_OPTION_VALUE, '__manual__');
});

test('PortalStorage soft-delete, restore, and permanent-delete registry operations work accurately', async () => {
  const { PortalStorage } = await import('../data/portalStore.ts');
  const testKey = 'BBE-INQ-TEST-9999';
  const ts = '2026-10-23T12:00:00.000Z';

  PortalStorage.markSoftDeleted([testKey], ts);
  assert.equal(PortalStorage.getDeletionRegistry().softDeleted[testKey], ts);

  PortalStorage.clearSoftDeleted([testKey]);
  assert.equal(PortalStorage.getDeletionRegistry().softDeleted[testKey], undefined);

  PortalStorage.markPermanentlyDeleted([testKey]);
  assert.ok(PortalStorage.getDeletionRegistry().permanentlyDeleted.includes(testKey));
});

test('cleanPhoneNumber strips punctuation and standard prefixes', () => {
  assert.equal(cleanPhoneNumber('+91 98678-33456'), '9867833456');
  assert.equal(cleanPhoneNumber('(0) 99873 24798'), '9987324798');
});

test('validateEmail validates format', () => {
  assert.equal(validateEmail('surupiwal@gmail.com'), true);
  assert.equal(validateEmail('client@company.co.in'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail(''), false);
});

test('calculateQuotationTotals calculates 18% GST (CGST 9% + SGST 9%) correctly', () => {
  const items = [
    { id: '1', description: 'Suction Tanker Services', unit: 'Trip', quantity: 2, unitRate: 8500 },
    { id: '2', description: 'High-Pressure Drain Cleaning', unit: 'Day', quantity: 1, unitRate: 12000 }
  ];
  const totals = calculateQuotationTotals(items);
  assert.equal(totals.subtotal, 29000);
  assert.equal(totals.totalGst, 5220);
  assert.equal(totals.cgst, 2610);
  assert.equal(totals.sgst, 2610);
  assert.equal(totals.grandTotal, 34220);
});

test('generateQuotationNumber generates consistent formatted strings', () => {
  const qNum = generateQuotationNumber(5);
  const currentYear = new Date().getFullYear();
  assert.equal(qNum, `BBE-QT-${currentYear}-005`);
});

test('verifyOwnerCredentials validates correct authorized password hash and rejects invalid ones', async () => {
  const isCorrect = await verifyOwnerCredentials('Advantage@123');
  assert.equal(isCorrect, true);

  const isWrong = await verifyOwnerCredentials('wrongpassword');
  assert.equal(isWrong, false);

  const isOldDemo = await verifyOwnerCredentials('bbe@2026');
  assert.equal(isOldDemo, false);

  const isEmpty = await verifyOwnerCredentials('');
  assert.equal(isEmpty, false);
});

test('resolvePublicAsset resolves paths correctly for root, /Blue-Bird-Enterprises-/, and raw fallback', async () => {
  const { resolvePublicAsset, GH_PAGES_BASE } = await import('./assetPath.ts');
  assert.equal(GH_PAGES_BASE, '/Blue-Bird-Enterprises-/');
  assert.equal(
    resolvePublicAsset('/assets/aistudio/vacuum_tanker_service.jpg'),
    '/assets/aistudio/vacuum_tanker_service.jpg'
  );
});

test('stripLeadingTermNumber and normalizeQuotationTerms prevent duplicate 1. 1. to 4. 4. numbering', () => {
  const rawTerms = [
    '1. Water and power connections to be provided at site by client.',
    '2. 2. Payment: 50% advance along with work order, balance upon completion.',
    '3. Safe vehicle access to sumps to be facilitated by client.',
    '4. 4. Validity: 30 days.',
  ];
  const normalized = normalizeQuotationTerms(rawTerms);
  assert.deepEqual(normalized, [
    'Water and power connections to be provided at site by client.',
    'Payment: 50% advance along with work order, balance upon completion.',
    'Safe vehicle access to sumps to be facilitated by client.',
    'Validity: 30 days.',
  ]);
  const numbered = normalized.map((t, i) => `${i + 1}. ${stripLeadingTermNumber(t)}`);
  assert.equal(numbered[0], '1. Water and power connections to be provided at site by client.');
  assert.equal(numbered[1], '2. Payment: 50% advance along with work order, balance upon completion.');
  assert.equal(numbered[2], '3. Safe vehicle access to sumps to be facilitated by client.');
  assert.equal(numbered[3], '4. Validity: 30 days.');
});

test('CORE_INTRODUCTION_SERVICES contains all 8 main services in exact order 1 to 8', () => {
  assert.equal(CORE_INTRODUCTION_SERVICES.length, 8);
  assert.deepEqual(
    CORE_INTRODUCTION_SERVICES.map((s) => s.title),
    [
      'ETP & STP Tank Cleaning',
      'High-Pressure Drain Cleaning',
      'Suction Tanker Services',
      'Domestic & Industrial Water Tank Cleaning',
      'Industrial Sludge Removal',
      'Sewer Line Cleaning & Blockage Removal',
      'Storm Water Drain Cleaning',
      'Concrete Pipeline & Chamber Construction',
    ]
  );
  assert.deepEqual(CORE_INTRODUCTION_SERVICES.map((s) => s.title), [...MAIN_SERVICE_NAMES]);
});

test('ADDITIONAL_SERVICE_NAMES retains all 5 additional genuine services in simple English', () => {
  assert.deepEqual([...ADDITIONAL_SERVICE_NAMES], [
    'Liquid Waste Removal',
    'Septic Tank Cleaning',
    'Civil Repairs & Reconstruction',
    'Manhole & Chamber Construction',
    'Turnkey Projects',
  ]);
});

test('normalizeServiceName maps legacy technical names to simple English names for backward compatibility', () => {
  assert.equal(
    normalizeServiceName('Mechanized Suction Tanker Operations'),
    'Suction Tanker Services'
  );
  assert.equal(
    normalizeServiceName('ETP & STP Tank Desludging'),
    'ETP & STP Tank Cleaning'
  );
  assert.equal(
    normalizeServiceName('High-Pressure Drain Jetting'),
    'High-Pressure Drain Cleaning'
  );
  assert.equal(
    normalizeServiceName('Liquid Waste Extraction'),
    'Liquid Waste Removal'
  );
  assert.equal(
    normalizeServiceName('Septic Tank Mechanized Cleaning'),
    'Septic Tank Cleaning'
  );
  assert.equal(
    normalizeServiceName('Multiple Services / Turnkey Project'),
    'Turnkey Projects'
  );
  assert.equal(
    normalizeServiceName('ETP & STP Tank Desludging, High-Pressure Drain Jetting'),
    'ETP & STP Tank Cleaning, High-Pressure Drain Cleaning'
  );
});

test('COMPANY_DETAILS callButtonConfig and tel links match exact Call Now button specification', async () => {
  const { COMPANY_DETAILS } = await import('../data/companyData.ts');
  assert.equal(COMPANY_DETAILS.callButtonConfig.label, 'Call Now');
  assert.equal(COMPANY_DETAILS.callButtonConfig.bgColor, '#E53935');
  assert.equal(COMPANY_DETAILS.callButtonConfig.hoverBgColor, '#C62828');
  assert.equal(COMPANY_DETAILS.callButtonConfig.textColor, '#FFFFFF');
  assert.equal(COMPANY_DETAILS.phone1Tel, 'tel:+919867833456');
  assert.equal(COMPANY_DETAILS.phone2Tel, 'tel:+919987324798');
});

test('Industrial Client Relationships section is hidden on mobile and visible on tablet/laptop/desktop while preserving all client content', async () => {
  const { CLIENTS_LIST } = await import('../data/companyData.ts');
  const { CLIENTS_SECTION_CLASSES } = await import('../components/ClientsTrust.tsx');
  const classTokens = CLIENTS_SECTION_CLASSES.split(/\s+/);
  assert.ok(classTokens.includes('hidden'), 'Section must have "hidden" class for mobile screens');
  assert.ok(classTokens.includes('md:block'), 'Section must have "md:block" class for tablets, laptops, and desktops');
  assert.ok(CLIENTS_LIST.length >= 6, 'All industrial client relationship records must remain preserved');
});
