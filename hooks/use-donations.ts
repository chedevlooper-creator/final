import { createClient } from '../lib/supabase/client'

export const useDonations = () => {
  const supabase = createClient()

  const createDonation = async (data: any) => {
    const { data: newRecord, error } = await supabase
      .from('donations')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return newRecord
  }

  const getDonationsList = async () => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }

  return {
    createDonation,
    getDonationsList
  }
}
