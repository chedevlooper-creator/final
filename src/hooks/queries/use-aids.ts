"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface AidFilters {
  needy_person_id?: string;
  aid_type?: string;
  delivery_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export function useAidsList(filters?: AidFilters) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = filters?.limit || 20;

  return useQuery({
    queryKey: ["aids", filters],
    queryFn: async () => {
      let query = supabase
        .from("needy_aids_received")
        .select(
          `
          *,
          needy_person:needy_persons(id, first_name, last_name, phone)
        `,
          { count: "exact" },
        )
        .order("aid_date", { ascending: false });

      if (filters?.needy_person_id) {
        query = query.eq("needy_person_id", filters.needy_person_id);
      }
      if (filters?.aid_type) {
        query = query.eq("aid_type", filters.aid_type);
      }
      if (filters?.delivery_status) {
        query = query.eq("delivery_status", filters.delivery_status);
      }
      if (filters?.date_from) {
        query = query.gte("aid_date", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("aid_date", filters.date_to);
      }

      const { data, error, count } = await query.range(
        page * limit,
        (page + 1) * limit - 1,
      );

      if (error) throw error;
      return { data: data || [], count: count || 0, page, limit };
    },
  });
}

export function useAidDetail(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["aids", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("needy_aids_received")
        .select(
          `
          *,
          needy_person:needy_persons(*)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAid() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from("needy_aids_received")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aids"] });
    },
  });
}

export function useUpdateAid() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase
        .from("needy_aids_received")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["aids", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["aids"] });
    },
  });
}
