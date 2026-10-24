-- ============================================================================
-- BLUE BIRD ENTERPRISES — Supabase Database Migration
-- Project: xpyxilnmdrsopzpftmms
-- Generated for: Customer Enquiries, Callback Requests, Bookings & Quotations
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Helper function to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE 1: customer_enquiries
-- Stores customer service inquiries, quotation requests, and technical specifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    company_name TEXT NOT NULL DEFAULT 'Industrial Client',
    phone TEXT NOT NULL,
    email TEXT,
    requested_service TEXT NOT NULL,
    site_location TEXT NOT NULL,
    description TEXT,
    preferred_callback TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quotation_sent', 'converted', 'closed')),
    internal_notes TEXT DEFAULT '',
    follow_up_date DATE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_enquiries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Indexes for fast querying & filtering
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_status ON public.customer_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_created_at ON public.customer_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_phone ON public.customer_enquiries(phone);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_ref ON public.customer_enquiries(reference_no);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_deleted_at ON public.customer_enquiries(deleted_at);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_customer_enquiries_updated_at ON public.customer_enquiries;
CREATE TRIGGER trg_customer_enquiries_updated_at
BEFORE UPDATE ON public.customer_enquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 2: callback_requests
-- Stores scheduled callback requests from floating dock & callback form
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.callback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    company_name TEXT NOT NULL DEFAULT 'Industrial Client',
    phone TEXT NOT NULL,
    preferred_date DATE NOT NULL DEFAULT CURRENT_DATE,
    preferred_time TEXT NOT NULL DEFAULT 'Morning (9 AM - 1 PM)',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rescheduled', 'cancelled')),
    follow_up_notes TEXT DEFAULT '',
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.callback_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Indexes for callback requests
CREATE INDEX IF NOT EXISTS idx_callback_requests_status ON public.callback_requests(status);
CREATE INDEX IF NOT EXISTS idx_callback_requests_pref_date ON public.callback_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_callback_requests_created_at ON public.callback_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_callback_requests_deleted_at ON public.callback_requests(deleted_at);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_callback_requests_updated_at ON public.callback_requests;
CREATE TRIGGER trg_callback_requests_updated_at
BEFORE UPDATE ON public.callback_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 3: bookings
-- Stores verified service bookings and scheduled site work orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    company_name TEXT NOT NULL DEFAULT 'Industrial Client',
    phone TEXT NOT NULL,
    email TEXT,
    requested_service TEXT NOT NULL,
    site_address TEXT NOT NULL,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_time TEXT NOT NULL DEFAULT '09:00 AM',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed')),
    notes TEXT DEFAULT '',
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON public.bookings(deleted_at);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 4: quotations & quotation_items
-- Stores official GST quotations with relational line items, tax breakdowns, and terms
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    gstin TEXT,
    site_address TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    validity_days INTEGER NOT NULL DEFAULT 30 CHECK (validity_days > 0),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (taxable_amount >= 0),
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_gst NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (grand_total >= 0),
    terms JSONB NOT NULL DEFAULT '[]'::jsonb,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Relational quotation_items table with ON DELETE CASCADE to prevent orphaned items
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    service_option TEXT DEFAULT '__manual__',
    description TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'Job',
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_rate >= 0),
    line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for quotations & quotation_items
CREATE INDEX IF NOT EXISTS idx_quotations_number ON public.quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON public.quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_deleted_at ON public.quotations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_quotations_updated_at ON public.quotations;
CREATE TRIGGER trg_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Only authorized owners/administrators (authenticated) may permanently delete records.
-- Public anonymous visitors (anon) can submit forms (INSERT) but never DELETE records.
-- ============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- 2. Customer Enquiries Policies
DROP POLICY IF EXISTS "Public anonymous insert for customer_enquiries" ON public.customer_enquiries;
CREATE POLICY "Public anonymous insert for customer_enquiries"
    ON public.customer_enquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        length(customer_name) > 0 AND
        length(phone) >= 10
    );

DROP POLICY IF EXISTS "Authorized read and update for customer_enquiries" ON public.customer_enquiries;
CREATE POLICY "Authorized read and update for customer_enquiries"
    ON public.customer_enquiries
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authorized update for customer_enquiries" ON public.customer_enquiries;
CREATE POLICY "Authorized update for customer_enquiries"
    ON public.customer_enquiries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized owner delete for customer_enquiries" ON public.customer_enquiries;
CREATE POLICY "Authorized owner delete for customer_enquiries"
    ON public.customer_enquiries
    FOR DELETE
    TO authenticated
    USING (true);

-- 3. Callback Requests Policies
DROP POLICY IF EXISTS "Public anonymous insert for callback_requests" ON public.callback_requests;
CREATE POLICY "Public anonymous insert for callback_requests"
    ON public.callback_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        length(customer_name) > 0 AND
        length(phone) >= 10
    );

DROP POLICY IF EXISTS "Authorized select for callback_requests" ON public.callback_requests;
CREATE POLICY "Authorized select for callback_requests"
    ON public.callback_requests
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authorized update for callback_requests" ON public.callback_requests;
CREATE POLICY "Authorized update for callback_requests"
    ON public.callback_requests
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized owner delete for callback_requests" ON public.callback_requests;
CREATE POLICY "Authorized owner delete for callback_requests"
    ON public.callback_requests
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Bookings Policies
DROP POLICY IF EXISTS "Public anonymous insert for bookings" ON public.bookings;
CREATE POLICY "Public anonymous insert for bookings"
    ON public.bookings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        length(customer_name) > 0 AND
        length(phone) >= 10
    );

DROP POLICY IF EXISTS "Authorized select for bookings" ON public.bookings;
CREATE POLICY "Authorized select for bookings"
    ON public.bookings
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authorized update for bookings" ON public.bookings;
CREATE POLICY "Authorized update for bookings"
    ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized owner delete for bookings" ON public.bookings;
CREATE POLICY "Authorized owner delete for bookings"
    ON public.bookings
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Quotations & Quotation Items Policies
DROP POLICY IF EXISTS "Authorized full access for quotations" ON public.quotations;
CREATE POLICY "Authorized full access for quotations"
    ON public.quotations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authorized select for quotations" ON public.quotations;
CREATE POLICY "Authorized select for quotations"
    ON public.quotations
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authorized owner delete for quotations" ON public.quotations;
CREATE POLICY "Authorized owner delete for quotations"
    ON public.quotations
    FOR DELETE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authorized full access for quotation_items" ON public.quotation_items;
CREATE POLICY "Authorized full access for quotation_items"
    ON public.quotation_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- SEED DATA (Demonstration Records)
-- ============================================================================
INSERT INTO public.customer_enquiries (
    reference_no, customer_name, company_name, phone, email, requested_service, site_location, description, status, internal_notes, follow_up_date
) VALUES
(
    'BBE-INQ-2026-X8R2',
    'Rajesh K. Mehta',
    'Apex Fine Chemicals Ltd.',
    '9820145678',
    'rmehta@apexfinechem.com',
    'ETP / STP Tank Cleaning',
    'TTC Industrial Area, Pawane MIDC, Plot C-42',
    'Need bi-annual desludging of 2 effluent holding tanks (~50KL capacity each). Requires confined space PPE protocol.',
    'new',
    'Urgent requirement before MPCB compliance audit. Scheduled site survey with operations supervisor.',
    CURRENT_DATE + INTERVAL '2 days'
),
(
    'BBE-INQ-2026-M4P9',
    'Anand Shinde',
    'Navi Mumbai Cold Logistics Hub',
    '9967123490',
    'operations@nmcoldlogistics.in',
    'High-Pressure Drain Jetting',
    'Taloja MIDC, Sector 18, Navi Mumbai',
    'Main 300mm stormwater drainage line partially choked with silt and packaging debris causing pooling in loading bay.',
    'contacted',
    'Spoke with client. Tanker + jetting lance scheduled for Saturday.',
    CURRENT_DATE + INTERVAL '3 days'
)
ON CONFLICT (reference_no) DO NOTHING;

INSERT INTO public.callback_requests (
    reference_no, customer_name, company_name, phone, preferred_date, preferred_time, notes, status
) VALUES
(
    'BBE-CB-2026-7782',
    'Mahesh Vernekar',
    'Vernekar Polymers',
    '9819876543',
    CURRENT_DATE + INTERVAL '1 day',
    '11:30 AM',
    'Inquiring about monthly rate contract for suction vehicle at Rabale MIDC plant.',
    'pending'
),
(
    'BBE-CB-2026-4431',
    'Dr. Sanjay Deshmukh',
    'Aura Life Science Research',
    '9833445566',
    CURRENT_DATE,
    '04:00 PM',
    'Completed call. Clarified that all field crew are trained in high-grade PPE and gas monitoring.',
    'completed'
)
ON CONFLICT (reference_no) DO NOTHING;

INSERT INTO public.bookings (
    booking_reference, customer_name, company_name, phone, email, requested_service, site_address, scheduled_date, scheduled_time, status, notes
) VALUES
(
    'BBE-BK-2026-001',
    'Sunil Patil',
    'Precision Engineering Components',
    '9867012345',
    'spatil@pecindia.co.in',
    'Suction Vehicle Operations',
    'Plot W-12, Turbhe MIDC, Navi Mumbai',
    CURRENT_DATE + INTERVAL '1 day',
    '09:30 AM',
    'Confirmed',
    'Evacuation of 8000L coolant pit. Suction tanker and certified crew assigned.'
)
ON CONFLICT (booking_reference) DO NOTHING;

INSERT INTO public.quotations (
    quotation_number, customer_name, company_name, phone, email, gstin, site_address, date, validity_days, status, line_items, taxable_amount, gst_rate, cgst_amount, sgst_amount, total_gst, grand_total, terms
) VALUES
(
    'BBE-QT-2026-001',
    'Sunil Patil',
    'Precision Engineering Components',
    '+91 98670 12345',
    'spatil@pecindia.co.in',
    '27AABCP1234P1Z3',
    'Plot W-12, Turbhe MIDC, Navi Mumbai - 400705',
    CURRENT_DATE,
    30,
    'sent',
    '[
        {"id": "1", "description": "Industrial Vacuum Suction Tanker Machine with operator & helper for coolant pit evacuation (6,000 Liters Capacity per trip)", "unit": "Trip", "quantity": 2, "unitRate": 7500},
        {"id": "2", "description": "Manual desilting of bottom heavy sludge residue with certified PPE crew", "unit": "Lump Sum", "quantity": 1, "unitRate": 4500}
    ]'::jsonb,
    19500.00,
    18.00,
    1755.00,
    1755.00,
    3510.00,
    23010.00,
    '[
        "Water and 3-phase electric power for auxiliary equipment to be supplied by client at site.",
        "Safe truck access and parking permission within plant premises to be arranged by client.",
        "Payment terms: 50% advance along with confirmed work order, balance upon completion of job.",
        "Quotation valid for 30 days from the date of issue."
    ]'::jsonb
)
ON CONFLICT (quotation_number) DO NOTHING;
