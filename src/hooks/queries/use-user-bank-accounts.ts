import { useGenericQuery, useGenericMutation } from '@/hooks/queries/use-generic-query'
import type { QueryOptions } from '@/types/common'
import type { BankAccount, BankAccountFormValues } from '@/types/finance.types'
import { createClient } from '@/lib/supabase/client'
import { bankAccountSchema } from '@/lib/validations/finance'

export function useBankAccounts(options?: QueryOptions) {
  return useGenericQuery<BankAccount[]>({
    queryKey: [
      'bank-accounts', 
      'list', 
      ...(options?.status ? [options.status] : []),
      ...(options?.sortBy ? [options.sortBy] : []),
      ...(options?.sortOrder ? [options.sortOrder] : [])
    ],
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })
}

export function useBankAccount(id: string) {
  return useGenericQuery<BankAccount>({
    queryKey: ['bank-accounts', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    options: { enabled: !!id }
  })
}

export function useCreateBankAccount() {
  return useGenericMutation<BankAccount, BankAccountFormValues>({
    mutationFn: async (values) => {
      const supabase = createClient()
      const validated = bankAccountSchema.parse(values)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          ...validated,
          user_id: user?.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    successMessage: 'Banka hesabı başarıyla oluşturuldu'
  })
}

export function useUpdateBankAccount() {
  return useGenericMutation<BankAccount, { id: string; values: Partial<BankAccountFormValues> }>({
    mutationFn: async ({ id, values }) => {
      const supabase = createClient()
      const validated = bankAccountSchema.partial().parse(values)
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .update(validated)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    successMessage: 'Banka hesabı başarıyla güncellendi'
  })
}

export function useDeleteBankAccount() {
  return useGenericMutation<void, string>({
    mutationFn: async (id) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    successMessage: 'Banka hesabı başarıyla silindi'
  })
}

export function useSetPrimaryAccount() {
  return useGenericMutation<void, string>({
    mutationFn: async (id) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase
        .from('bank_accounts')
        .update({ is_primary: false })
        .eq('user_id', user?.id)
      
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_primary: true })
        .eq('id', id)

      if (error) throw error
    },
    successMessage: 'Birincil hesap başarıyla değiştirildi'
  })
}

export { useGenericQuery as default }
