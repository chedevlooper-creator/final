-- ============================================
-- STOK / DEPO YÖNETİMİ MIGRATION
-- Tarih: 30 Ocak 2026
-- Açıklama: Envanter, depo ve stok takip sistemi
-- ============================================

-- ============================================
-- 1. DEPO TANIMLARI (Warehouses)
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- DEPO-001
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'main' CHECK (type IN ('main', 'branch', 'mobile', 'virtual')),
  address TEXT,
  city TEXT,
  district TEXT,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warehouses_type ON warehouses(type);
CREATE INDEX idx_warehouses_active ON warehouses(is_active);
CREATE INDEX idx_warehouses_city ON warehouses(city);

-- RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read warehouses" ON warehouses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage warehouses" ON warehouses
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 2. ÜRÜN KATEGORİLERİ (Item Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES item_categories(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  default_unit TEXT DEFAULT 'piece', -- piece, kg, lt, box, pallet
  is_perishable BOOLEAN DEFAULT FALSE, -- Son kullanma tarihi var mı?
  track_by_lot BOOLEAN DEFAULT FALSE, -- Parti/lot takibi
  min_stock_alert DECIMAL(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_categories_parent ON item_categories(parent_id);
CREATE INDEX idx_item_categories_active ON item_categories(is_active);

-- RLS
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON item_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin manage categories" ON item_categories
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 3. TEDARİKÇİLER (Suppliers)
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'company' CHECK (type IN ('company', 'individual', 'donor')),
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  tax_number TEXT,
  website TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_type ON suppliers(type);
CREATE INDEX idx_suppliers_active ON suppliers(is_active);

-- RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read suppliers" ON suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage suppliers" ON suppliers
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 4. ÜRÜNLER / ENVANTER KALEMLERİ (Inventory Items)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE, -- Stok kodu
  barcode TEXT UNIQUE, -- Barkod
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES item_categories(id) ON DELETE SET NULL,
  
  -- Birim bilgileri
  unit TEXT NOT NULL DEFAULT 'piece', -- piece, kg, gr, lt, ml, box, pallet, bag
  unit_weight DECIMAL(8,3), -- Birim ağırlık (kg)
  
  -- Stok takibi
  track_inventory BOOLEAN DEFAULT TRUE,
  enable_stock_alert BOOLEAN DEFAULT TRUE,
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  max_stock_level DECIMAL(10,2),
  reorder_point DECIMAL(10,2), -- Yeniden sipariş noktası
  
  -- Maliyet
  avg_cost DECIMAL(10,2) DEFAULT 0, -- Ağırlıklı ortalama maliyet
  last_cost DECIMAL(10,2) DEFAULT 0, -- Son maliyet
  
  -- Özellikler
  is_perishable BOOLEAN DEFAULT FALSE,
  shelf_life_days INTEGER, -- Raf ömrü (gün)
  storage_conditions TEXT, -- Saklama koşulları
  
  -- Durum
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Meta
  tags TEXT[],
  attributes JSONB, -- Esnek özellikler {size: "L", color: "red"}
  images TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active);
CREATE INDEX idx_inventory_items_tags ON inventory_items USING GIN(tags);

-- RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read items" ON inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage items" ON inventory_items
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 5. DEPO STOK SEVİYELERİ (Warehouse Stock Levels)
-- Her ürün-depo kombinasyonu için stok seviyesi
-- ============================================
CREATE TABLE IF NOT EXISTS warehouse_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Stok miktarları
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0, -- Mevcut stok
  reserved_quantity DECIMAL(10,2) DEFAULT 0, -- Rezerve edilmiş
  available_quantity DECIMAL(10,2) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  
  -- Konum
  location_code TEXT, -- Raf/koridor kodu (A-01-03)
  
  -- Son hareket
  last_movement_at TIMESTAMPTZ,
  last_counted_at TIMESTAMPTZ, -- Son sayım tarihi
  
  -- Meta
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(warehouse_id, item_id)
);

CREATE INDEX idx_warehouse_stocks_warehouse ON warehouse_stocks(warehouse_id);
CREATE INDEX idx_warehouse_stocks_item ON warehouse_stocks(item_id);
CREATE INDEX idx_warehouse_stocks_location ON warehouse_stocks(location_code);
CREATE INDEX idx_warehouse_stocks_quantity ON warehouse_stocks(quantity);

-- RLS
ALTER TABLE warehouse_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read stocks" ON warehouse_stocks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage stocks" ON warehouse_stocks
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator', 'user'));

-- ============================================
-- 6. PARTİ / LOT TAKİBİ (Lot Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number TEXT NOT NULL, -- Parti numarası
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  -- Parti bilgileri
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Tarihler
  manufacture_date DATE,
  expiry_date DATE,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Kaynak
  supplier_id UUID REFERENCES suppliers(id),
  donation_id UUID REFERENCES donations(id),
  
  -- Durum
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'consumed', 'damaged')),
  
  -- Meta
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(lot_number, item_id, warehouse_id)
);

CREATE INDEX idx_inventory_lots_item ON inventory_lots(item_id);
CREATE INDEX idx_inventory_lots_warehouse ON inventory_lots(warehouse_id);
CREATE INDEX idx_inventory_lots_expiry ON inventory_lots(expiry_date);
CREATE INDEX idx_inventory_lots_status ON inventory_lots(status);

-- RLS
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read lots" ON inventory_lots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage lots" ON inventory_lots
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator', 'user'));

-- ============================================
-- 7. STOK HAREKETLERİ (Inventory Transactions)
-- ============================================
CREATE TYPE transaction_type AS ENUM (
  'in',           -- Giriş
  'out',          -- Çıkış
  'transfer',     -- Transfer
  'adjustment',   -- Düzeltme
  'count',        -- Sayım
  'return',       -- İade
  'damage',       -- Hasar
  'expired'       -- Son kullanma
);

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'cancelled'
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE NOT NULL, -- Hareket no: TXN-20260130-001
  
  -- Hareket tipi
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'completed',
  
  -- Ürün ve Depo
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  lot_id UUID REFERENCES inventory_lots(id), -- Opsiyonel parti takibi
  
  -- Miktar
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2), -- Birim maliyet (girişlerde)
  total_cost DECIMAL(12,2), -- Toplam maliyet
  
  -- Transfer bilgileri (type = 'transfer' ise)
  source_warehouse_id UUID REFERENCES warehouses(id),
  destination_warehouse_id UUID REFERENCES warehouses(id),
  
  -- İlişkili kayıtlar
  reference_type TEXT, -- donation, application, project, manual
  reference_id UUID,   -- İlişkili kayıt ID
  
  -- Kimden/Kime
  supplier_id UUID REFERENCES suppliers(id), -- Giriş kaynağı
  needy_person_id UUID REFERENCES needy_persons(id), -- Çıkış hedefi
  
  -- Kullanıcı
  performed_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id), -- Onaylayan (büyük hareketlerde)
  
  -- Tarihler
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  
  -- Açıklama
  reason TEXT, -- Sebep
  notes TEXT,
  
  -- Barkod
  barcode_scanned TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX idx_inventory_transactions_status ON inventory_transactions(status);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_warehouse ON inventory_transactions(warehouse_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date DESC);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);
CREATE INDEX idx_inventory_transactions_performed ON inventory_transactions(performed_by);

-- RLS
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read transactions" ON inventory_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated insert transactions" ON inventory_transactions
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Admin manage transactions" ON inventory_transactions
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 8. STOK UYARILARI (Stock Alerts)
-- ============================================
CREATE TYPE alert_type AS ENUM (
  'low_stock',      -- Düşük stok
  'out_of_stock',   -- Stok tükendi
  'expiring',       -- Son kullanma yaklaşıyor
  'expired',        -- Son kullanma geçti
  'overstock',      -- Fazla stok
  'reorder'         -- Yeniden sipariş zamanı
);

CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type alert_type NOT NULL,
  
  -- İlişkili kayıtlar
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  warehouse_id UUID REFERENCES warehouses(id),
  lot_id UUID REFERENCES inventory_lots(id),
  
  -- Uyarı detayı
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  current_value DECIMAL(10,2),
  threshold_value DECIMAL(10,2),
  
  -- Durum
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_stock_alerts_type ON stock_alerts(type);
CREATE INDEX idx_stock_alerts_item ON stock_alerts(item_id);
CREATE INDEX idx_stock_alerts_warehouse ON stock_alerts(warehouse_id);
CREATE INDEX idx_stock_alerts_resolved ON stock_alerts(is_resolved);
CREATE INDEX idx_stock_alerts_severity ON stock_alerts(severity);
CREATE INDEX idx_stock_alerts_created ON stock_alerts(created_at DESC);

-- RLS
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read alerts" ON stock_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated manage alerts" ON stock_alerts
  FOR ALL TO authenticated 
  USING (true);

-- ============================================
-- 9. STOK SAYIMI (Stock Counts)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_number TEXT UNIQUE NOT NULL, -- SAYIM-001
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  
  -- Sayım tipi
  type TEXT DEFAULT 'full' CHECK (type IN ('full', 'partial', 'cycle', 'spot')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
  
  -- Tarihler
  planned_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Sorumlular
  planned_by UUID REFERENCES profiles(id),
  counted_by UUID[] DEFAULT '{}', -- Sayım ekibi
  approved_by UUID REFERENCES profiles(id),
  
  -- Sonuçlar
  total_items INTEGER DEFAULT 0,
  matched_items INTEGER DEFAULT 0,
  discrepancy_items INTEGER DEFAULT 0,
  discrepancy_value DECIMAL(12,2) DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_counts_warehouse ON stock_counts(warehouse_id);
CREATE INDEX idx_stock_counts_status ON stock_counts(status);
CREATE INDEX idx_stock_counts_date ON stock_counts(planned_date);

-- RLS
ALTER TABLE stock_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read counts" ON stock_counts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated manage counts" ON stock_counts
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator', 'user'));

-- ============================================
-- 10. STOK SAYIM DETAYLARI (Stock Count Items)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  lot_id UUID REFERENCES inventory_lots(id),
  
  -- Sistem kaydı
  system_quantity DECIMAL(10,2) NOT NULL,
  
  -- Sayım sonucu
  counted_quantity DECIMAL(10,2),
  counted_by UUID REFERENCES profiles(id),
  counted_at TIMESTAMPTZ,
  
  -- Fark
  discrepancy DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - system_quantity) STORED,
  discrepancy_reason TEXT, -- Fark sebebi
  
  -- Notlar
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_count_items_count ON stock_count_items(count_id);
CREATE INDEX idx_stock_count_items_item ON stock_count_items(item_id);
CREATE INDEX idx_stock_count_items_discrepancy ON stock_count_items(discrepancy);

-- RLS
ALTER TABLE stock_count_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read count items" ON stock_count_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated manage count items" ON stock_count_items
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator', 'user'));

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_categories_updated_at BEFORE UPDATE ON item_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_stocks_updated_at BEFORE UPDATE ON warehouse_stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_lots_updated_at BEFORE UPDATE ON inventory_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_transactions_updated_at BEFORE UPDATE ON inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_counts_updated_at BEFORE UPDATE ON stock_counts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONKSİYONLAR
-- ============================================

-- Stok seviyesi güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_stock_level()
RETURNS TRIGGER AS $$
BEGIN
  -- IN: Stok artır
  IF NEW.type = 'in' AND NEW.status = 'completed' THEN
    INSERT INTO warehouse_stocks (warehouse_id, item_id, quantity, last_movement_at)
    VALUES (NEW.warehouse_id, NEW.item_id, NEW.quantity, NOW())
    ON CONFLICT (warehouse_id, item_id)
    DO UPDATE SET 
      quantity = warehouse_stocks.quantity + NEW.quantity,
      last_movement_at = NOW();
  
  -- OUT: Stok azalt
  ELSIF NEW.type = 'out' AND NEW.status = 'completed' THEN
    UPDATE warehouse_stocks
    SET quantity = quantity - NEW.quantity,
        last_movement_at = NOW()
    WHERE warehouse_id = NEW.warehouse_id AND item_id = NEW.item_id;
  
  -- TRANSFER
  ELSIF NEW.type = 'transfer' AND NEW.status = 'completed' THEN
    -- Kaynak depodan çıkış
    UPDATE warehouse_stocks
    SET quantity = quantity - NEW.quantity,
        last_movement_at = NOW()
    WHERE warehouse_id = NEW.source_warehouse_id AND item_id = NEW.item_id;
    
    -- Hedef depoya giriş
    INSERT INTO warehouse_stocks (warehouse_id, item_id, quantity, last_movement_at)
    VALUES (NEW.destination_warehouse_id, NEW.item_id, NEW.quantity, NOW())
    ON CONFLICT (warehouse_id, item_id)
    DO UPDATE SET 
      quantity = warehouse_stocks.quantity + NEW.quantity,
      last_movement_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock_level
  AFTER INSERT OR UPDATE ON inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION update_stock_level();

-- Hareket numarası oluşturma
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL THEN
    NEW.transaction_number := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('transaction_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS transaction_seq START 1;

CREATE TRIGGER trg_generate_transaction_number
  BEFORE INSERT ON inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION generate_transaction_number();

-- Sayım numarası oluşturma
CREATE OR REPLACE FUNCTION generate_count_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.count_number IS NULL THEN
    NEW.count_number := 'SAYIM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('count_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS count_seq START 1;

CREATE TRIGGER trg_generate_count_number
  BEFORE INSERT ON stock_counts
  FOR EACH ROW EXECUTE FUNCTION generate_count_number();

-- Düşük stok uyarısı oluşturma
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
  v_min_level DECIMAL;
BEGIN
  SELECT min_stock_level, name INTO v_item
  FROM inventory_items WHERE id = NEW.item_id;
  
  IF NEW.quantity <= COALESCE(v_item.min_stock_level, 0) AND NEW.quantity > 0 THEN
    INSERT INTO stock_alerts (type, item_id, warehouse_id, severity, message, current_value, threshold_value)
    VALUES ('low_stock', NEW.item_id, NEW.warehouse_id, 'high', 
            v_item.name || ' ürününde düşük stok!', NEW.quantity, COALESCE(v_item.min_stock_level, 0))
    ON CONFLICT DO NOTHING;
  ELSIF NEW.quantity = 0 THEN
    INSERT INTO stock_alerts (type, item_id, warehouse_id, severity, message, current_value, threshold_value)
    VALUES ('out_of_stock', NEW.item_id, NEW.warehouse_id, 'critical', 
            v_item.name || ' ürünü tükendi!', 0, 0)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_low_stock
  AFTER UPDATE OF quantity ON warehouse_stocks
  FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- ============================================
-- VIEWS
-- ============================================

-- Stok özeti view
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
  i.id AS item_id,
  i.name AS item_name,
  i.sku,
  i.barcode,
  i.unit,
  c.name AS category_name,
  COALESCE(SUM(ws.quantity), 0) AS total_quantity,
  COALESCE(SUM(ws.reserved_quantity), 0) AS total_reserved,
  COALESCE(SUM(ws.available_quantity), 0) AS total_available,
  COUNT(DISTINCT ws.warehouse_id) AS warehouse_count,
  i.min_stock_level,
  i.status,
  CASE 
    WHEN COALESCE(SUM(ws.available_quantity), 0) <= 0 THEN 'out_of_stock'
    WHEN COALESCE(SUM(ws.available_quantity), 0) <= i.min_stock_level THEN 'low_stock'
    WHEN i.max_stock_level IS NOT NULL AND COALESCE(SUM(ws.available_quantity), 0) >= i.max_stock_level THEN 'overstock'
    ELSE 'normal'
  END AS stock_status
FROM inventory_items i
LEFT JOIN item_categories c ON i.category_id = c.id
LEFT JOIN warehouse_stocks ws ON i.id = ws.item_id
WHERE i.is_active = TRUE
GROUP BY i.id, i.name, i.sku, i.barcode, i.unit, c.name, i.min_stock_level, i.max_stock_level, i.status;

-- Depo bazlı stok view
CREATE OR REPLACE VIEW warehouse_inventory AS
SELECT 
  ws.*,
  w.name AS warehouse_name,
  w.code AS warehouse_code,
  i.name AS item_name,
  i.sku,
  i.barcode,
  i.unit,
  c.name AS category_name,
  i.min_stock_level,
  CASE 
    WHEN ws.available_quantity <= 0 THEN 'out_of_stock'
    WHEN ws.available_quantity <= i.min_stock_level THEN 'low_stock'
    ELSE 'normal'
  END AS stock_status
FROM warehouse_stocks ws
JOIN warehouses w ON ws.warehouse_id = w.id
JOIN inventory_items i ON ws.item_id = i.id
LEFT JOIN item_categories c ON i.category_id = c.id;

-- Son kullanma yaklaşan ürünler view
CREATE OR REPLACE VIEW expiring_items AS
SELECT 
  l.*,
  i.name AS item_name,
  w.name AS warehouse_name,
  CURRENT_DATE - l.expiry_date AS days_until_expiry
FROM inventory_lots l
JOIN inventory_items i ON l.item_id = i.id
JOIN warehouses w ON l.warehouse_id = w.id
WHERE l.expiry_date IS NOT NULL 
  AND l.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND l.status = 'active'
  AND l.remaining_quantity > 0;

-- Hareket özeti view
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  DATE_TRUNC('month', transaction_date) AS month,
  type,
  COUNT(*) AS transaction_count,
  SUM(quantity) AS total_quantity,
  SUM(total_cost) AS total_value
FROM inventory_transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date), type
ORDER BY month DESC, type;

-- ============================================
-- SEED DATA
-- ============================================

-- Varsayılan depo
INSERT INTO warehouses (code, name, type, city, is_active) VALUES
('ANA-DEPO', 'Ana Depo', 'main', 'İstanbul', TRUE),
('SUBE-01', 'Şube Deposu - Kadıköy', 'branch', 'İstanbul', TRUE),
('MOBIL-01', 'Mobil Depo', 'mobile', 'İstanbul', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Ürün kategorileri
INSERT INTO item_categories (name, code, description, color, default_unit, is_perishable, sort_order) VALUES
('Gıda', 'GID', 'Yiyecek ve içecek ürünleri', '#EF4444', 'piece', TRUE, 1),
('Giyim', 'GIY', 'Kıyafet ve tekstil', '#3B82F6', 'piece', FALSE, 2),
('Hijyen', 'HIJ', 'Temizlik ve kişisel bakım', '#10B981', 'piece', FALSE, 3),
('Yakacak', 'YAK', 'Kömür, odun, yakacak malzemeleri', '#F59E0B', 'kg', FALSE, 4),
('Ev Eşyası', 'EVE', 'Beyaz eşya ve mobilya', '#8B5CF6', 'piece', FALSE, 5),
('Eğitim', 'EGT', 'Kırtasiye ve eğitim malzemeleri', '#EC4899', 'piece', FALSE, 6)
ON CONFLICT (code) DO NOTHING;

-- Örnek ürünler
INSERT INTO inventory_items (sku, barcode, name, description, category_id, unit, min_stock_level, enable_stock_alert, is_perishable, shelf_life_days, status) VALUES
('GIDA-001', '8680000000001', 'Pirinç (1kg)', 'Paket pirinç', (SELECT id FROM item_categories WHERE code = 'GID'), 'piece', 100, TRUE, TRUE, 365, 'active'),
('GIDA-002', '8680000000002', 'Mercimek (1kg)', 'Paket mercimek', (SELECT id FROM item_categories WHERE code = 'GID'), 'piece', 80, TRUE, TRUE, 365, 'active'),
('GIDA-003', '8680000000003', 'Yağ (1lt)', 'Sıvı yağ', (SELECT id FROM item_categories WHERE code = 'GID'), 'piece', 50, TRUE, TRUE, 180, 'active'),
('GIY-001', '8680000000010', 'Mont', 'Kışlık mont', (SELECT id FROM item_categories WHERE code = 'GIY'), 'piece', 20, TRUE, FALSE, NULL, 'active'),
('GIY-002', '8680000000011', 'Bot', 'Kışlık bot', (SELECT id FROM item_categories WHERE code = 'GIY'), 'piece', 15, TRUE, FALSE, NULL, 'active'),
('HIJ-001', '8680000000020', 'Bebek Bezi', 'Bebek bezi paketi', (SELECT id FROM item_categories WHERE code = 'HIJ'), 'piece', 50, TRUE, FALSE, NULL, 'active'),
('YAK-001', '8680000000030', 'Kömür (25kg)', 'Kömür çuvalı', (SELECT id FROM item_categories WHERE code = 'YAK'), 'piece', 30, TRUE, FALSE, NULL, 'active')
ON CONFLICT (sku) DO NOTHING;

-- ============================================
-- COMPLETED
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'STOK / DEPO YÖNETİMİ Migration Tamamlandı!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Tablolar:';
  RAISE NOTICE '- warehouses (Depolar)';
  RAISE NOTICE '- item_categories (Ürün Kategorileri)';
  RAISE NOTICE '- suppliers (Tedarikçiler)';
  RAISE NOTICE '- inventory_items (Ürünler)';
  RAISE NOTICE '- warehouse_stocks (Depo Stokları)';
  RAISE NOTICE '- inventory_lots (Parti/Lot Takibi)';
  RAISE NOTICE '- inventory_transactions (Hareketler)';
  RAISE NOTICE '- stock_alerts (Stok Uyarıları)';
  RAISE NOTICE '- stock_counts (Stok Sayımları)';
  RAISE NOTICE '- stock_count_items (Sayım Detayları)';
  RAISE NOTICE '===========================================';
END $$;
