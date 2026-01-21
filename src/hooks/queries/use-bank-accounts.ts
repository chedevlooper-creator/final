"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { NeedyPersonBankAccount } from "@/types/linked-records.types";

// Use the centralized type definition
export type BankAccount = NeedyPersonBankAccount;

export interface BankAccountFormValues {
  needy_person_id: string;
  account_holder_name?: string | null;
  currency?: string;
  transaction_type?: string | null;
  iban?: string | null;
  bank_name?: string | null;
  branch_name?: string | null;
  branch_code?: string | null;
  account_number?: string | null;
  swift_code?: string | null;
  address?: string | null;
  is_active?: boolean;
  is_primary?: boolean;
  notes?: string | null;
}

export function useBankAccountsList(needyPersonId: string, isActive?: boolean) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["bank-accounts", needyPersonId, isActive],
    queryFn: async () => {
      let query = supabase
        .from("needy_bank_accounts")
        .select("*")
        .eq("needy_person_id", needyPersonId)
        .order("created_at", { ascending: false });

      if (isActive !== undefined) {
        query = query.eq("is_active", isActive);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!needyPersonId,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: BankAccountFormValues) => {
      const { data, error } = await supabase
        .from("needy_bank_accounts")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data as BankAccount;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bank-accounts", variables.needy_person_id],
      });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<BankAccountFormValues>;
    }) => {
      const { data, error } = await supabase
        .from("needy_bank_accounts")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BankAccount;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["bank-accounts", data.needy_person_id],
      });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      needyPersonId,
    }: {
      id: string;
      needyPersonId: string;
    }) => {
      const { error } = await supabase
        .from("needy_bank_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, needyPersonId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["bank-accounts", result.needyPersonId],
      });
    },
  });
}
