'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Photo } from '@/types/linked-records.types'

export function useNeedyPhotos(needyPersonId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['needy-photos', needyPersonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('needy_person_photos')
        .select('*')
        .eq('needy_person_id', needyPersonId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Photo[]
    },
    enabled: !!needyPersonId,
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ 
      needyPersonId, 
      file, 
      photoType 
    }: { 
      needyPersonId: string
      file: File
      photoType: string
    }) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `needy-persons/${needyPersonId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      const { data, error } = await supabase
        .from('needy_person_photos')
        .insert({
          needy_person_id: needyPersonId,
          file_path: publicUrl,
          photo_type: photoType,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['needy-photos', variables.needyPersonId] })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      needyPersonId 
    }: { 
      id: string
      needyPersonId: string
    }) => {
      const { error } = await supabase
        .from('needy_person_photos')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, needyPersonId }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['needy-photos', variables.needyPersonId] })
    },
  })
}

export function useSetPrimaryPhoto() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      needyPersonId 
    }: { 
      id: string
      needyPersonId: string
    }) => {
      await supabase
        .from('needy_person_photos')
        .update({ is_primary: false })
        .eq('needy_person_id', needyPersonId)

      const { data, error } = await supabase
        .from('needy_person_photos')
        .update({ is_primary: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['needy-photos', variables.needyPersonId] })
    },
  })
}
