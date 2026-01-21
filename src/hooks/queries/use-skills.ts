"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Skill,
  SkillCategory,
  SkillWithCategory,
  VolunteerSkill,
  VolunteerSkillDetail,
  CreateSkillCategoryInput,
  UpdateSkillCategoryInput,
  CreateSkillInput,
  UpdateSkillInput,
  CreateVolunteerSkillInput,
  UpdateVolunteerSkillInput,
  SkillFilters,
  VolunteerSkillFilters,
} from "@/types/skills.types";

export function useSkillCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["skill-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as SkillCategory[];
    },
  });
}

export function useSkillCategory(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["skill-categories", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as SkillCategory;
    },
    enabled: !!id,
  });
}

export function useCreateSkillCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: CreateSkillCategoryInput) => {
      const { data, error } = await supabase
        .from("skill_categories")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data as SkillCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
    },
  });
}

export function useUpdateSkillCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: UpdateSkillCategoryInput;
    }) => {
      const { data, error } = await supabase
        .from("skill_categories")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SkillCategory;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["skill-categories", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
    },
  });
}

export function useDeleteSkillCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("skill_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
    },
  });
}

export function useSkills(filters?: SkillFilters) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = filters?.limit || 20;

  return useQuery({
    queryKey: ["skills", filters],
    queryFn: async () => {
      let query = supabase
        .from("skills_with_categories")
        .select("*", { count: "exact" })
        .order("category_sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,category_name.ilike.%${filters.search}%`,
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

export function useSkill(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["skills", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Skill;
    },
    enabled: !!id,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: CreateSkillInput) => {
      const { data, error } = await supabase
        .from("skills")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data as Skill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills-with-categories"] });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: UpdateSkillInput;
    }) => {
      const { data, error } = await supabase
        .from("skills")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Skill;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["skills", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills-with-categories"] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills-with-categories"] });
    },
  });
}

export function useSkillsWithCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["skills-with-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills_with_categories")
        .select("*")
        .eq("status", "active")
        .order("category_sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as SkillWithCategory[];
    },
  });
}

export function useVolunteerSkills(filters?: VolunteerSkillFilters) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = filters?.limit || 20;

  return useQuery({
    queryKey: ["volunteer-skills", filters],
    queryFn: async () => {
      let query = supabase
        .from("volunteer_skills_detail")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (filters?.volunteer_id) {
        query = query.eq("volunteer_id", filters.volunteer_id);
      }
      if (filters?.skill_id) {
        query = query.eq("skill_id", filters.skill_id);
      }
      if (filters?.proficiency_level) {
        query = query.eq("proficiency_level", filters.proficiency_level);
      }
      if (filters?.verified !== undefined) {
        query = query.eq("verified", filters.verified);
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

export function useVolunteerSkillsByVolunteer(volunteerId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["volunteer-skills", volunteerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_skills_detail")
        .select("*")
        .eq("volunteer_id", volunteerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VolunteerSkillDetail[];
    },
    enabled: !!volunteerId,
  });
}

export function useCreateVolunteerSkill() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: CreateVolunteerSkillInput) => {
      const { data, error } = await supabase
        .from("volunteer_skills")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data as VolunteerSkill;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-skills"] });
      queryClient.invalidateQueries({
        queryKey: ["volunteer-skills", variables.volunteer_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["volunteers", variables.volunteer_id],
      });
    },
  });
}

export function useUpdateVolunteerSkill() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: UpdateVolunteerSkillInput;
    }) => {
      const { data, error } = await supabase
        .from("volunteer_skills")
        .update(values)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as VolunteerSkill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-skills"] });
    },
  });
}

export function useDeleteVolunteerSkill() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("volunteer_skills")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-skills"] });
    },
  });
}
