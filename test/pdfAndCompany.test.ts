import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  OFFICIAL_COMPANY_PROFILE_PDF_URL,
  OFFICIAL_COMPANY_PROFILE_FILENAME,
} from '../src/utils/pdfGenerator.ts';
import { COMPANY_DETAILS, CLIENTS_LIST } from '../src/data/companyData.ts';
import { calculateQuotationTotals } from '../src/utils/quotation.ts';

test('Company Profile PDF constants and assets verification', () => {
  assert.equal(OFFICIAL_COMPANY_PROFILE_FILENAME, 'Blue_Bird_Enterprises_Company_Profile.pdf');
  assert.equal(
    OFFICIAL_COMPANY_PROFILE_PDF_URL,
    '/assets/aistudio/Blue_Bird_Enterprises_-_Company_Profile__2__b96af8de.pdf'
  );

  // Check physical file in public folder
  const publicPdfPath = path.join(
    process.cwd(),
    'public',
    'assets',
    'aistudio',
    'Blue_Bird_Enterprises_-_Company_Profile__2__b96af8de.pdf'
  );
  assert.ok(fs.existsSync(publicPdfPath), 'Attached official company profile PDF file must exist in public assets');

  const stats = fs.statSync(publicPdfPath);
  assert.ok(stats.size > 1000000, 'PDF file must be the authentic multi-page high-resolution brochure (>1MB)');
});

test('Business Details and Statutory Data Integrity', () => {
  assert.equal(COMPANY_DETAILS.phone1Raw, '9867833456');
  assert.equal(COMPANY_DETAILS.phone2Raw, '9987324798');
  assert.equal(COMPANY_DETAILS.phone1, '+91 98678 33456');
  assert.equal(COMPANY_DETAILS.phone2, '+91 99873 24798');
  assert.equal(COMPANY_DETAILS.gstin, '27EFDPP3303H1ZL');
  assert.equal(COMPANY_DETAILS.pan, 'EFDPP3303H');
  assert.equal(COMPANY_DETAILS.founder, 'Sarita Sinod Piwal');
});

test('Client List has major corporate industrial partners', () => {
  const clientNames = CLIENTS_LIST.map((c) => c.name);
  assert.ok(clientNames.includes('RPG Life Sciences Limited'));
  assert.ok(clientNames.includes('Balmer Lawrie - Van Leer Ltd.'));
  assert.ok(clientNames.includes('Savita Oil Technologies Ltd.'));
  assert.ok(clientNames.includes('Piramal Pharma Limited'));
});

test('Quotation GST calculations match statutory 18% rules', () => {
  const items = [
    { id: '1', description: 'Mechanized Vacuum Suction Tanker', quantity: 2, unitRate: 8500, unit: 'Trip' },
    { id: '2', description: 'High-Pressure Sewer Jetting', quantity: 1, unitRate: 15000, unit: 'Service' },
  ];
  // Subtotal = 17000 + 15000 = 32000
  // CGST = 9% of 32000 = 2880
  // SGST = 9% of 32000 = 2880
  // Grand Total = 37760
  const totals = calculateQuotationTotals(items);
  assert.equal(totals.subtotal, 32000);
  assert.equal(totals.cgst, 2880);
  assert.equal(totals.sgst, 2880);
  assert.equal(totals.totalGst, 5760);
  assert.equal(totals.grandTotal, 37760);
});
