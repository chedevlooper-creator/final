import { createClient } from '../lib/supabase/client'

export const useDashboardStats = () => {
  const supabase = createClient()

  const getStats = async () => {
    // 1. Get Needy Count
    const { count: needyCount, error: needyError } = await supabase
      .from('needy_persons')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (needyError) throw needyError

    // 2. Get Donations this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { data: donations, error: donationError } = await supabase
      .from('donations')
      .select('amount')
      .gte('date', startOfMonth.toISOString())

    if (donationError) throw donationError

    const monthlyDonation = donations?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

    // 3. Pending Applications
    const { count: pendingApps, error: appError } = await supabase
      .from('aid_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    if (appError) throw appError

    // 4. Finance Balance
    const { data: finance, error: financeError } = await supabase
      .from('finance_transactions')
      .select('amount, type')

    if (financeError) throw financeError

    const balance = finance?.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount
    }, 0) || 0

    return {
      needyCount: needyCount || 0,
      monthlyDonation,
      pendingApps: pendingApps || 0,
      balance
    }
  }

  return {
    getStats
  }
}
