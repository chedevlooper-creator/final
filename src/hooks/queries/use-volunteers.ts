"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface VolunteerFilters {
  search?: string;
  status?: string;
  skills?: string[];
  page?: number;
  limit?: number;
}

export function useVolunteersList(filters?: VolunteerFilters) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = filters?.limit || 20;

  return useQuery({
    queryKey: ["volunteers", filters],
    queryFn: async () => {
      let query = supabase
        .from("volunteers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
        );
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

export function useVolunteerDetail(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["volunteers", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateVolunteer() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from("volunteers")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });
}

export function useUpdateVolunteer() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase
        .from("volunteers")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["volunteers", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    },
  });
}

export interface MissionFilters {
  volunteer_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export function useMissionsList(filters?: MissionFilters) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = filters?.limit || 20;

  return useQuery({
    queryKey: ["missions", filters],
    queryFn: async () => {
      let query = supabase
        .from("volunteer_missions")
        .select(
          `
          *,
          volunteer:volunteers(id, first_name, last_name, phone)
        `,
          { count: "exact" },
        )
        .order("mission_date", { ascending: false });

      if (filters?.volunteer_id) {
        query = query.eq("volunteer_id", filters.volunteer_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.date_from) {
        query = query.gte("mission_date", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("mission_date", filters.date_to);
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

export function useCreateMission() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from("volunteer_missions")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase
        .from("volunteer_missions")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["missions", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}
