import { createClient } from '../lib/supabase/client'

export const useNeedy = () => {
  const supabase = createClient()

  const createNeedy = async (data: any) => {
    const { data: newRecord, error } = await supabase
      .from('needy_persons')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return newRecord
  }

  const getNeedyList = async () => {
    const { data, error } = await supabase
      .from('needy_persons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  return {
    createNeedy,
    getNeedyList
  }
}
