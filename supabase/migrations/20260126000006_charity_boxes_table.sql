-- ============================================================
-- CHARITY BOXES TABLE - Kumbara Takip Sistemi
-- ============================================================

CREATE TABLE IF NOT EXISTS public.charity_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_number TEXT NOT NULL UNIQUE,
  box_code TEXT UNIQUE,
  location_name TEXT NOT NULL,
  location_address TEXT,
  location_city TEXT,
  location_district TEXT,
  responsible_person TEXT,
  responsible_phone TEXT,
  responsible_email TEXT,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full', 'collected')),
  last_collection_date TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_charity_boxes_box_number ON public.charity_boxes(box_number);
CREATE INDEX IF NOT EXISTS idx_charity_boxes_status ON public.charity_boxes(status);
CREATE INDEX IF NOT EXISTS idx_charity_boxes_location_city ON public.charity_boxes(location_city);
CREATE INDEX IF NOT EXISTS idx_charity_boxes_created_at ON public.charity_boxes(created_at DESC);

-- Add comments
COMMENT ON TABLE public.charity_boxes IS 'Kumbara takip sistemi - charity box tracking system';
COMMENT ON COLUMN public.charity_boxes.box_number IS 'Kumbara numarası';
COMMENT ON COLUMN public.charity_boxes.box_code IS 'Kumbara kodu (QR kod için)';
COMMENT ON COLUMN public.charity_boxes.location_name IS 'Konum adı (iş yeri, mağaza vb.)';
COMMENT ON COLUMN public.charity_boxes.responsible_person IS 'Sorumlu kişi';
COMMENT ON COLUMN public.charity_boxes.current_amount IS 'Mevcut tutar';
COMMENT ON COLUMN public.charity_boxes.status IS 'Durum: active, inactive, full, collected';
COMMENT ON COLUMN public.charity_boxes.last_collection_date IS 'Son toplama tarihi';

-- Enable RLS
ALTER TABLE public.charity_boxes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for charity_boxes
DROP POLICY IF EXISTS "Users can view all charity_boxes" ON public.charity_boxes;
DROP POLICY IF EXISTS "Users can insert charity_boxes" ON public.charity_boxes;
DROP POLICY IF EXISTS "Users can update charity_boxes" ON public.charity_boxes;
DROP POLICY IF EXISTS "Users can delete charity_boxes" ON public.charity_boxes;

CREATE POLICY "Users can view all charity_boxes"
  ON public.charity_boxes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert charity_boxes"
  ON public.charity_boxes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update charity_boxes"
  ON public.charity_boxes FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete charity_boxes"
  ON public.charity_boxes FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.charity_boxes TO authenticated;
GRANT SELECT ON public.charity_boxes TO anon;

-- ============================================================
-- CHARITY BOX COLLECTIONS TABLE - Kumbara Toplama Kayıtları
-- ============================================================

CREATE TABLE IF NOT EXISTS public.charity_box_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_box_id UUID NOT NULL REFERENCES public.charity_boxes(id) ON DELETE CASCADE,
  collection_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_charity_box_collections_box_id ON public.charity_box_collections(charity_box_id);
CREATE INDEX IF NOT EXISTS idx_charity_box_collections_date ON public.charity_box_collections(collection_date DESC);
CREATE INDEX IF NOT EXISTS idx_charity_box_collections_collected_by ON public.charity_box_collections(collected_by);

-- Add comments
COMMENT ON TABLE public.charity_box_collections IS 'Kumbara toplama kayıtları';
COMMENT ON COLUMN public.charity_box_collections.charity_box_id IS 'Kumbara referansı';
COMMENT ON COLUMN public.charity_box_collections.amount IS 'Toplanan tutar';
COMMENT ON COLUMN public.charity_box_collections.collected_by IS 'Toplayan kişi';

-- Enable RLS
ALTER TABLE public.charity_box_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all charity_box_collections" ON public.charity_box_collections;
DROP POLICY IF EXISTS "Users can insert charity_box_collections" ON public.charity_box_collections;
DROP POLICY IF EXISTS "Users can update charity_box_collections" ON public.charity_box_collections;
DROP POLICY IF EXISTS "Users can delete charity_box_collections" ON public.charity_box_collections;

CREATE POLICY "Users can view all charity_box_collections"
  ON public.charity_box_collections FOR SELECT
  USING (true);

CREATE POLICY "Users can insert charity_box_collections"
  ON public.charity_box_collections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update charity_box_collections"
  ON public.charity_box_collections FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete charity_box_collections"
  ON public.charity_box_collections FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.charity_box_collections TO authenticated;
GRANT SELECT ON public.charity_box_collections TO anon;

-- ============================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_charity_boxes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_charity_boxes_updated_at
  BEFORE UPDATE ON public.charity_boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_charity_boxes_updated_at();
