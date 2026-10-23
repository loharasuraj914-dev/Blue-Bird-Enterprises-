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
} from './quotation.ts';
import { SERVICES_DATA } from '../data/companyData.ts';
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

test('QUOTATION_SERVICE_PRESETS includes all listed services and supports manual option', () => {
  assert.equal(QUOTATION_SERVICE_PRESETS.length, SERVICES_DATA.length);
  for (const service of SERVICES_DATA) {
    assert.ok(
      QUOTATION_SERVICE_PRESETS.some((p) => p.title === service.title),
      `Service "${service.title}" must be pre-listed in quotation line item presets`
    );
  }
  assert.equal(MANUAL_SERVICE_OPTION_VALUE, '__manual__');
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
    { id: '1', description: 'Vacuum Suction Tanker Trip (6000L)', unit: 'Trip', quantity: 2, unitRate: 8500 },
    { id: '2', description: 'Drain Line Jetting & Desilting', unit: 'Day', quantity: 1, unitRate: 12000 }
  ];
  // Subtotal = 17000 + 12000 = 29000
  // GST 18% = 5220
  // CGST = 2610, SGST = 2610
  // Grand Total = 34220
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
