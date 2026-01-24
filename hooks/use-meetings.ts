import { createClient } from '../lib/supabase/client'

export const useMeetings = () => {
  const supabase = createClient()

  const createMeeting = async (data: any) => {
    const { data: newRecord, error } = await supabase
      .from('meetings')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return newRecord
  }

  const getMeetingsList = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    return data
  }

  return {
    createMeeting,
    getMeetingsList
  }
}
