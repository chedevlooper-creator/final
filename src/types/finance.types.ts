export interface BankAccount {
  id: string
  bank_name: string
  account_number: string
  iban: string
  account_holder: string
  balance: number
  currency: string
  status: 'active' | 'inactive' | 'closed'
  is_primary: boolean
  user_id: string | null
  created_at: string
  updated_at: string
}

export type BankAccountStatus = 'active' | 'inactive' | 'closed'

export type BankAccountFormValues = {
  bank_name: string
  account_number: string
  iban: string
  account_holder: string
  balance?: number
  currency?: string
  status?: BankAccountStatus
  is_primary?: boolean
}
