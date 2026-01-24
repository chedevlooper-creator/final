import { createClient } from '../lib/supabase/client'

export const useFinance = () => {
  const supabase = createClient()

  const createTransaction = async (data: any) => {
    const { data: newRecord, error } = await supabase
      .from('finance_transactions')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return newRecord
  }

  const getTransactionsList = async () => {
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }

  const getFinanceSummary = async () => {
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('amount, type')

    if (error) throw error
    
    // Simple client-side aggregation for now
    const summary = data.reduce(
      (acc, curr) => {
        if (curr.type === 'income') {
          acc.income += curr.amount
          acc.balance += curr.amount
        } else {
          acc.expense += curr.amount
          acc.balance -= curr.amount
        }
        return acc
      },
      { income: 0, expense: 0, balance: 0 }
    )

    return summary
  }

  return {
    createTransaction,
    getTransactionsList,
    getFinanceSummary
  }
}
