-- Bank Accounts Table
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  iban VARCHAR(26) NOT NULL UNIQUE,
  account_holder VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'TRY',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  is_primary BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);
CREATE UNIQUE INDEX idx_bank_accounts_iban ON bank_accounts(iban);

-- RLS Policies
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Users can see own accounts
CREATE POLICY "Users can view own accounts"
  ON bank_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create own accounts
CREATE POLICY "Users can create own accounts"
  ON bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update own accounts
CREATE POLICY "Users can update own accounts"
  ON bank_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete own accounts
CREATE POLICY "Users can delete own accounts"
  ON bank_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
