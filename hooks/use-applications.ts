import { createClient } from '../lib/supabase/client'

export const useApplications = () => {
  const supabase = createClient()

  const getApplicationsList = async () => {
    const { data, error } = await supabase
      .from('aid_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  const updateApplicationStatus = async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('aid_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  return {
    getApplicationsList,
    updateApplicationStatus
  }
}
