-- Create calendar_events table for managing calendar events and meetings
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TIME,
  location TEXT,
  event_type TEXT CHECK (event_type IN ('meeting', 'event', 'reminder', 'other')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create finance_transactions table for tracking financial transactions
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'bank')),
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  reference_number TEXT,
  transaction_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  recipient_name TEXT,
  recipient_account TEXT,
  recipient_bank TEXT,
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON public.calendar_events(status);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON public.finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON public.finance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_account_type ON public.finance_transactions(account_type);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_status ON public.finance_transactions(status);

-- Add comments
COMMENT ON TABLE public.calendar_events IS 'Calendar events and meetings';
COMMENT ON COLUMN public.calendar_events.event_date IS 'Event date';
COMMENT ON COLUMN public.calendar_events.event_type IS 'Type of event: meeting, event, reminder, other';

COMMENT ON TABLE public.finance_transactions IS 'Financial transactions tracking';
COMMENT ON COLUMN public.finance_transactions.transaction_type IS 'Type: income, expense, transfer';
COMMENT ON COLUMN public.finance_transactions.account_type IS 'Account type: cash, bank';
COMMENT ON COLUMN public.finance_transactions.amount IS 'Transaction amount';
COMMENT ON COLUMN public.finance_transactions.status IS 'Transaction status: pending, completed, cancelled';

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view all calendar_events"
  ON public.calendar_events FOR SELECT
  USING (true);

CREATE POLICY "Users can insert calendar_events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own calendar_events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own calendar_events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid() = created_by);

-- Create RLS policies for finance_transactions
CREATE POLICY "Users can view all finance_transactions"
  ON public.finance_transactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert finance_transactions"
  ON public.finance_transactions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own finance_transactions"
  ON public.finance_transactions FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own finance_transactions"
  ON public.finance_transactions FOR DELETE
  USING (auth.uid() = created_by);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.calendar_events TO authenticated;
GRANT ALL ON public.finance_transactions TO authenticated;
GRANT ALL ON SEQUENCES calendar_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCES finance_transactions_id_seq TO authenticated;
