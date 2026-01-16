import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Types
interface FinanceTransaction {
    id: string
    transaction_number: string
    type: 'income' | 'expense'
    category: string
    amount: number
    currency: string
    description: string | null
    account_type: 'cash' | 'bank'
    created_at: string
}

interface FinanceSummary {
    totalIncome: number
    totalExpense: number
    cashBalance: number
    bankBalance: number
}

// Mock data
const mockTransactions: FinanceTransaction[] = [
    {
        id: '1',
        transaction_number: 'FN-2026-0001',
        type: 'income',
        category: 'donation',
        amount: 5000,
        currency: 'TRY',
        description: 'Genel bağış',
        account_type: 'bank',
        created_at: '2026-01-15T10:00:00Z',
    },
    {
        id: '2',
        transaction_number: 'FN-2026-0002',
        type: 'expense',
        category: 'aid',
        amount: 2500,
        currency: 'TRY',
        description: 'Nakdi yardım',
        account_type: 'cash',
        created_at: '2026-01-15T11:00:00Z',
    },
    {
        id: '3',
        transaction_number: 'FN-2026-0003',
        type: 'income',
        category: 'zakat',
        amount: 10000,
        currency: 'TRY',
        description: 'Zekat bağışı',
        account_type: 'bank',
        created_at: '2026-01-14T14:00:00Z',
    },
]

const mockSummary: FinanceSummary = {
    totalIncome: 125450,
    totalExpense: 98320,
    cashBalance: 45230,
    bankBalance: 892150,
}

export function useFinanceTransactions(filters?: {
    type?: 'income' | 'expense'
    account_type?: 'cash' | 'bank'
    startDate?: string
    endDate?: string
}) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['finance-transactions', filters],
        queryFn: async () => {
            if (USE_MOCK_DATA) {
                let data = [...mockTransactions]
                if (filters?.type) data = data.filter((t) => t.type === filters.type)
                if (filters?.account_type) data = data.filter((t) => t.account_type === filters.account_type)
                return data
            }

            let query = supabase
                .from('finance_transactions')
                .select('*')
                .order('created_at', { ascending: false })

            if (filters?.type) query = query.eq('type', filters.type)
            if (filters?.account_type) query = query.eq('account_type', filters.account_type)
            if (filters?.startDate) query = query.gte('created_at', filters.startDate)
            if (filters?.endDate) query = query.lte('created_at', filters.endDate)

            const { data, error } = await query
            if (error) throw error
            return data
        },
    })
}

export function useFinanceSummary() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['finance-summary'],
        queryFn: async () => {
            if (USE_MOCK_DATA) {
                return mockSummary
            }

            // In real implementation, this would be a server-side calculation or view
            const { data: incomes } = await supabase
                .from('finance_transactions')
                .select('amount')
                .eq('type', 'income')

            const { data: expenses } = await supabase
                .from('finance_transactions')
                .select('amount')
                .eq('type', 'expense')

            const totalIncome = incomes?.reduce((sum, t) => sum + t.amount, 0) || 0
            const totalExpense = expenses?.reduce((sum, t) => sum + t.amount, 0) || 0

            return {
                totalIncome,
                totalExpense,
                cashBalance: 45230, // Would come from actual account balances
                bankBalance: 892150,
            }
        },
    })
}

export function useCashTransactions() {
    return useFinanceTransactions({ account_type: 'cash' })
}

export function useBankTransactions() {
    return useFinanceTransactions({ account_type: 'bank' })
}
