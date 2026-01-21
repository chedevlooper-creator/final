import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Types
export interface FinanceTransaction {
  id: string;
  transaction_number: string | null;
  type: "income" | "expense";
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  account_type: "cash" | "bank";
  payment_method: string | null;
  reference_number: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  status: "pending" | "completed" | "cancelled";
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  cashBalance: number;
  bankBalance: number;
  netBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface FinanceTransactionFilters {
  type?: "income" | "expense";
  account_type?: "cash" | "bank";
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransactionInput {
  type: "income" | "expense";
  category: string;
  amount: number;
  currency?: string;
  description?: string | null;
  account_type: "cash" | "bank";
  payment_method?: string | null;
  reference_number?: string | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  notes?: string | null;
}

const TRANSACTION_CATEGORIES = {
  income: [
    { value: "donation", label: "Bağış" },
    { value: "zakat", label: "Zekat" },
    { value: "fitre", label: "Fitre" },
    { value: "sadaka", label: "Sadaka" },
    { value: "kurban", label: "Kurban" },
    { value: "sponsorship", label: "Sponsor" },
    { value: "grant", label: "Hibe" },
    { value: "other", label: "Diğer" },
  ],
  expense: [
    { value: "aid", label: "Yardım" },
    { value: "scholarship", label: "Burs" },
    { value: "operational", label: "Operasyonel" },
    { value: "salary", label: "Maaş" },
    { value: "rent", label: "Kira" },
    { value: "utility", label: "Fatura" },
    { value: "purchase", label: "Satın Alma" },
    { value: "other", label: "Diğer" },
  ],
};

export { TRANSACTION_CATEGORIES };

export function useFinanceTransactions(filters?: FinanceTransactionFilters) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = filters?.limit || 50;

  return useQuery({
    queryKey: ["finance-transactions", filters],
    queryFn: async () => {
      let query = supabase
        .from("finance_transactions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.account_type)
        query = query.eq("account_type", filters.account_type);
      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.startDate)
        query = query.gte("created_at", filters.startDate);
      if (filters?.endDate) query = query.lte("created_at", filters.endDate);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        data: data as FinanceTransaction[],
        count: count || 0,
        page,
        limit,
      };
    },
  });
}

export function useFinanceTransactionDetail(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["finance-transactions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finance_transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as FinanceTransaction;
    },
    enabled: !!id,
  });
}

export function useFinanceSummary() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["finance-summary"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get all transactions
      const [
        allIncomes,
        allExpenses,
        monthlyIncomes,
        monthlyExpenses,
        cashTrans,
        bankTrans,
      ] = await Promise.all([
        supabase
          .from("finance_transactions")
          .select("amount")
          .eq("type", "income")
          .eq("status", "completed"),
        supabase
          .from("finance_transactions")
          .select("amount")
          .eq("type", "expense")
          .eq("status", "completed"),
        supabase
          .from("finance_transactions")
          .select("amount")
          .eq("type", "income")
          .eq("status", "completed")
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("finance_transactions")
          .select("amount")
          .eq("type", "expense")
          .eq("status", "completed")
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("finance_transactions")
          .select("amount, type")
          .eq("account_type", "cash")
          .eq("status", "completed"),
        supabase
          .from("finance_transactions")
          .select("amount, type")
          .eq("account_type", "bank")
          .eq("status", "completed"),
      ]);

      const sumAmounts = (data: { amount: number }[] | null) =>
        data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const calculateBalance = (
        data: { amount: number; type: string }[] | null,
      ) => {
        if (!data) return 0;
        return data.reduce((balance, t) => {
          return t.type === "income" ? balance + t.amount : balance - t.amount;
        }, 0);
      };

      const totalIncome = sumAmounts(allIncomes.data);
      const totalExpense = sumAmounts(allExpenses.data);
      const cashBalance = calculateBalance(cashTrans.data);
      const bankBalance = calculateBalance(bankTrans.data);

      return {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        cashBalance,
        bankBalance,
        monthlyIncome: sumAmounts(monthlyIncomes.data),
        monthlyExpense: sumAmounts(monthlyExpenses.data),
      } as FinanceSummary;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateFinanceTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      // Generate transaction number
      const now = new Date();
      const prefix = input.type === "income" ? "GEL" : "GID";
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const randomNum = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const transactionNumber = `${prefix}-${dateStr}-${randomNum}`;

      const { data, error } = await supabase
        .from("finance_transactions")
        .insert({
          ...input,
          transaction_number: transactionNumber,
          currency: input.currency || "TRY",
          status: "completed",
        })
        .select()
        .single();

      if (error) throw error;
      return data as FinanceTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

export function useUpdateFinanceTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<FinanceTransaction>;
    }) => {
      const { data, error } = await supabase
        .from("finance_transactions")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as FinanceTransaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["finance-transactions", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["finance-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

export function useDeleteFinanceTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("finance_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}

export function useCashTransactions(
  filters?: Omit<FinanceTransactionFilters, "account_type">,
) {
  return useFinanceTransactions({ ...filters, account_type: "cash" });
}

export function useBankTransactions(
  filters?: Omit<FinanceTransactionFilters, "account_type">,
) {
  return useFinanceTransactions({ ...filters, account_type: "bank" });
}
