---
name: add-migration
description: Yeni bir Supabase migration dosyası oluşturur ve temel tablo yapısını hazırlar.
---

# 🗄️ Add Migration Skill

Bu skill, YYP projesinde yeni bir Supabase migration dosyası oluşturur ve standart tablo yapısını hazırlar.

## Kullanım

Kullanıcıdan aşağıdaki bilgileri al:
1. **Tablo Adı** (örn: "courses", "medical_records")
2. **Açıklama** (örn: "Add courses table for training management")
3. **Kolonlar** (örn: "name:text, description:text, start_date:date, status:text")
4. **İlişkiler** (varsa, örn: "category_id -> categories(id)")

## Migration Dosya Yapısı

### Dosya Adı: `supabase/migrations/[timestamp]_[description].sql`

Format: `YYYYMMDD_description.sql` (örn: `20260121_add_courses_table.sql`)

```sql
-- Migration: [Description]
-- Created at: [timestamp]
-- Purpose: [Detailed purpose]

-- ================================================
-- 1. CREATE TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.[table_name] (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Required Fields
  name TEXT NOT NULL,
  description TEXT,

  -- Status & Type Fields
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),

  -- Numeric Fields
  amount DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,

  -- Date Fields
  start_date DATE,
  end_date DATE,

  -- JSON Fields (for flexible data)
  metadata JSONB DEFAULT '{}'::JSONB,
  settings JSONB DEFAULT '{}'::JSONB,

  -- Foreign Keys
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Audit Fields (REQUIRED for all tables)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_ip INET,
  updated_ip INET,

  -- Soft Delete (optional)
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id)
);

-- ================================================
-- 2. INDEXES
-- ================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_[table_name]_status ON public.[table_name](status);
CREATE INDEX IF NOT EXISTS idx_[table_name]_created_at ON public.[table_name](created_at DESC);
CREATE INDEX IF NOT EXISTS idx_[table_name]_user_id ON public.[table_name](user_id);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_[table_name]_category_id ON public.[table_name](category_id);

-- Search indexes (for text search)
CREATE INDEX IF NOT EXISTS idx_[table_name]_name_search ON public.[table_name] USING GIN(to_tsvector('turkish', name));

-- Partial indexes (for active records)
CREATE INDEX IF NOT EXISTS idx_[table_name]_active ON public.[table_name](id) WHERE is_active = true AND deleted_at IS NULL;

-- ================================================
-- 3. TRIGGERS
-- ================================================

-- Updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.[table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger (optional)
CREATE TRIGGER audit_[table_name]
  AFTER INSERT OR UPDATE OR DELETE ON public.[table_name]
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- ================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- Policy: Public read (if applicable)
CREATE POLICY "Anyone can view active [table_name]"
  ON public.[table_name]
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Policy: Authenticated users can create
CREATE POLICY "Authenticated users can create [table_name]"
  ON public.[table_name]
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update their own records
CREATE POLICY "Users can update their own [table_name]"
  ON public.[table_name]
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all [table_name]"
  ON public.[table_name]
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Soft delete (only mark as deleted)
CREATE POLICY "Users can soft delete their own [table_name]"
  ON public.[table_name]
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (deleted_at IS NOT NULL);

-- ================================================
-- 5. FUNCTIONS (if needed)
-- ================================================

-- Example: Auto-increment file number
CREATE OR REPLACE FUNCTION generate_[table_name]_file_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.file_number IS NULL THEN
    SELECT COALESCE(MAX(CAST(file_number AS INTEGER)), 0) + 1
    INTO NEW.file_number
    FROM public.[table_name];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_[table_name]_file_number
  BEFORE INSERT ON public.[table_name]
  FOR EACH ROW
  EXECUTE FUNCTION generate_[table_name]_file_number();

-- ================================================
-- 6. GRANTS
-- ================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.[table_name] TO authenticated;
GRANT USAGE ON SEQUENCE [table_name]_id_seq TO authenticated;

-- Service role has full access
GRANT ALL ON public.[table_name] TO service_role;

-- ================================================
-- 7. COMMENTS
-- ================================================

COMMENT ON TABLE public.[table_name] IS '[Description of the table]';
COMMENT ON COLUMN public.[table_name].name IS 'Name of the [resource]';
COMMENT ON COLUMN public.[table_name].status IS 'Current status: active, inactive, pending, rejected';

-- ================================================
-- 8. SEED DATA (optional)
-- ================================================

-- Insert initial categories or lookup data
INSERT INTO public.[table_name] (name, status, is_active)
VALUES
  ('Sample 1', 'active', true),
  ('Sample 2', 'active', true)
ON CONFLICT DO NOTHING;
```

## Common Column Types

### Text & String
```sql
name TEXT NOT NULL
description TEXT
email VARCHAR(255)
code VARCHAR(50) UNIQUE
```

### Numbers
```sql
age INTEGER
quantity SMALLINT
amount DECIMAL(10, 2)
rate NUMERIC(5, 2)
```

### Boolean
```sql
is_active BOOLEAN NOT NULL DEFAULT true
has_consent BOOLEAN DEFAULT false
```

### Dates & Time
```sql
birth_date DATE
start_date DATE
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
expires_at TIMESTAMPTZ
```

### JSON
```sql
metadata JSONB DEFAULT '{}'::JSONB
settings JSONB
```

### Enums (using CHECK constraints)
```sql
status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('active', 'inactive', 'pending', 'rejected'))

gender TEXT CHECK (gender IN ('male', 'female', 'other'))
```

### Arrays
```sql
tags TEXT[]
phone_numbers TEXT[]
```

### Foreign Keys
```sql
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL
```

## Junction Tables (Many-to-Many)

```sql
CREATE TABLE IF NOT EXISTS public.[table1]_[table2] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [table1]_id UUID NOT NULL REFERENCES public.[table1](id) ON DELETE CASCADE,
  [table2]_id UUID NOT NULL REFERENCES public.[table2](id) ON DELETE CASCADE,

  -- Additional fields (optional)
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE([table1]_id, [table2]_id)
);

CREATE INDEX idx_[table1]_[table2]_table1 ON public.[table1]_[table2]([table1]_id);
CREATE INDEX idx_[table1]_[table2]_table2 ON public.[table1]_[table2]([table2]_id);
```

## RLS Policy Patterns

### Pattern 1: Public Read, Authenticated Write
```sql
-- Anyone can read
CREATE POLICY "Public read" ON public.[table]
  FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Auth insert" ON public.[table]
  FOR INSERT TO authenticated WITH CHECK (true);
```

### Pattern 2: Own Records Only
```sql
-- Users see only their records
CREATE POLICY "Users see own" ON public.[table]
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users edit only their records
CREATE POLICY "Users edit own" ON public.[table]
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
```

### Pattern 3: Role-Based
```sql
-- Admin access
CREATE POLICY "Admin all" ON public.[table]
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Manager access
CREATE POLICY "Manager read" ON public.[table]
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
```

## Running Migrations

### 1. Local Development
```bash
# Apply migration
supabase db push

# Or specific migration
supabase migration up

# Check status
supabase migration list
```

### 2. Production
```bash
# Using Supabase CLI
supabase db push --linked

# Or through dashboard
# Go to: Supabase Dashboard > SQL Editor > Upload migration file
```

### 3. Rollback (if needed)
```sql
-- Create rollback migration
-- File: [timestamp]_rollback_[description].sql

DROP TABLE IF EXISTS public.[table_name] CASCADE;
```

## Checklist

Tüm migration oluşturulduktan sonra kontrol et:

- [ ] Tablo adı çoğul ve snake_case
- [ ] id UUID primary key var
- [ ] created_at, updated_at, is_active var
- [ ] Status/enum alanları CHECK constraint kullanıyor
- [ ] Foreign key'ler ON DELETE davranışı tanımlı
- [ ] Index'ler performans için uygun
- [ ] RLS enabled ve policy'ler tanımlı
- [ ] Trigger'lar (updated_at) eklenmiş
- [ ] Comment'ler eklendi
- [ ] Seed data varsa eklenmiş

---
*Bu skill YYP database standartlarını ve Supabase best practices'lerini takip eder.*
