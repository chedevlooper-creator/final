"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  Notification,
  NotificationFilters,
  NotificationCreateInput,
} from "@/lib/notifications/types";

const NOTIFICATIONS_KEY = "notifications";

export function useNotifications(filters?: NotificationFilters) {
  const supabase = createClient();
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.unreadOnly) {
        query = query.is("read_at", null);
      }

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return {
        data: data as Notification[],
        count: count || 0,
        hasUnread: (data as Notification[])?.some((n) => !n.read_at) || false,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
}

export function useUnreadNotificationCount() {
  const supabase = createClient();

  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, "unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("read_at", null);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: NotificationCreateInput) => {
      const { data, error } = await supabase
        .from("notifications")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .not("id", "is", null); // Delete all

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}
