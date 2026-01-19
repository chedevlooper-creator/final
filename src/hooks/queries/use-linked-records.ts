'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// Generic linked record types
export type LinkedRecordTable = 
  | 'needy_bank_accounts'
  | 'needy_documents'
  | 'needy_photos'
  | 'needy_orphan_relations'
  | 'needy_dependents'
  | 'needy_sponsors'
  | 'needy_references'
  | 'needy_interviews'
  | 'needy_interview_sessions'
  | 'needy_aids_received'
  | 'needy_consents'
  | 'needy_social_cards'

// Needy Dependents
export interface NeedyDependent {
  id: string
  needy_person_id: string
  dependent_person_id: string | null
  first_name: string | null
  last_name: string | null
  identity_number: string | null
  birth_date: string | null
  gender: string | null
  relation_type: string
  relation_description: string | null
  is_active: boolean
  needs_support: boolean
  created_at: string
  notes: string | null
}

// Needy References
export interface NeedyReference {
  id: string
  needy_person_id: string
  reference_name: string
  reference_type: string | null
  relation: string | null
  phone: string | null
  alt_phone: string | null
  email: string | null
  address: string | null
  is_verified: boolean
  created_at: string
  notes: string | null
}

// Needy Interviews
export interface NeedyInterview {
  id: string
  needy_person_id: string
  interview_date: string
  interview_type: string
  interviewer_id: string | null
  interviewer_name: string | null
  subject: string | null
  summary: string | null
  detailed_notes: string | null
  location: string | null
  outcome: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  status: string
  created_at: string
}

// Needy Aids Received
export interface NeedyAidReceived {
  id: string
  needy_person_id: string
  application_id: string | null
  aid_type: string
  aid_category: string | null
  description: string | null
  amount: number | null
  currency: string
  quantity: number | null
  unit: string | null
  aid_date: string
  delivery_date: string | null
  delivery_method: string | null
  delivery_status: string
  delivered_by: string | null
  delivered_at: string | null
  receipt_number: string | null
  receipt_path: string | null
  created_at: string
  notes: string | null
}

// Needy Consents
export interface NeedyConsent {
  id: string
  needy_person_id: string
  consent_type: string
  consent_name: string | null
  is_given: boolean
  given_date: string | null
  expiry_date: string | null
  document_path: string | null
  document_signed: boolean
  signature_type: string | null
  scope: string | null
  revoked: boolean
  revoked_date: string | null
  revocation_reason: string | null
  created_at: string
  notes: string | null
}

// Needy Social Cards
export interface NeedySocialCard {
  id: string
  needy_person_id: string
  card_type: string
  card_name: string | null
  card_number: string | null
  issue_date: string | null
  expiry_date: string | null
  issuing_authority: string | null
  coverage_details: string | null
  benefits: string[] | null
  is_active: boolean
  status: string
  created_at: string
  notes: string | null
}

// Generic hook for fetching linked records
export function useLinkedRecords<T>(
  table: LinkedRecordTable,
  needyPersonId: string,
  options?: {
    isActive?: boolean
    orderBy?: string
    orderAsc?: boolean
  }
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['linked-records', table, needyPersonId, options],
    queryFn: async () => {
      let query = supabase
        .from(table)
        .select('*')
        .eq('needy_person_id', needyPersonId)
        .order(options?.orderBy || 'created_at', { ascending: options?.orderAsc ?? false })

      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive)
      }

      const { data, error } = await query

      if (error) throw error
      return data as T[]
    },
    enabled: !!needyPersonId,
  })
}

// Generic mutation hooks
export function useCreateLinkedRecord<T>(table: LinkedRecordTable) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: Partial<T> & { needy_person_id: string }) => {
      const { data, error } = await supabase
        .from(table)
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data as T
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['linked-records', table, variables.needy_person_id] 
      })
    },
  })
}

export function useUpdateLinkedRecord<T extends { needy_person_id?: string }>(table: LinkedRecordTable) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values, needyPersonId }: { 
      id: string
      values: Partial<T>
      needyPersonId: string 
    }) => {
      const { data, error } = await supabase
        .from(table)
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: data as T, needyPersonId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ 
        queryKey: ['linked-records', table, result.needyPersonId] 
      })
    },
  })
}

export function useDeleteLinkedRecord(table: LinkedRecordTable) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, needyPersonId }: { id: string; needyPersonId: string }) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, needyPersonId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ 
        queryKey: ['linked-records', table, result.needyPersonId] 
      })
    },
  })
}

// Specific hooks for commonly used linked records
export function useNeedyDependents(needyPersonId: string, isActive?: boolean) {
  return useLinkedRecords<NeedyDependent>('needy_dependents', needyPersonId, { isActive })
}

export function useNeedyReferences(needyPersonId: string) {
  return useLinkedRecords<NeedyReference>('needy_references', needyPersonId)
}

export function useNeedyInterviews(needyPersonId: string) {
  return useLinkedRecords<NeedyInterview>('needy_interviews', needyPersonId, { orderBy: 'interview_date' })
}

export function useNeedyAidsReceived(needyPersonId: string) {
  return useLinkedRecords<NeedyAidReceived>('needy_aids_received', needyPersonId, { orderBy: 'aid_date' })
}

export function useNeedyConsents(needyPersonId: string) {
  return useLinkedRecords<NeedyConsent>('needy_consents', needyPersonId)
}

export function useNeedySocialCards(needyPersonId: string, isActive?: boolean) {
  return useLinkedRecords<NeedySocialCard>('needy_social_cards', needyPersonId, { isActive })
}
