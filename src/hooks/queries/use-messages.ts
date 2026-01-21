"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SMSFilters {
  phone?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export function useSMSList(filters?: SMSFilters) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = filters?.limit || 20;

  return useQuery({
    queryKey: ["sms", filters],
    queryFn: async () => {
      let query = supabase
        .from("sms_messages")
        .select("*", { count: "exact" })
        .order("sent_at", { ascending: false });

      if (filters?.phone) {
        query = query.ilike("phone", `%${filters.phone}%`);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.date_from) {
        query = query.gte("sent_at", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("sent_at", filters.date_to);
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

export function useSendBulkSMS() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: {
      recipients: string[];
      message: string;
      message_type: string;
    }) => {
      // TODO: Implement bulk SMS sending logic
      // This would typically call an SMS service API
      const { data, error } = await supabase
        .from("sms_messages")
        .insert(
          values.recipients.map((phone) => ({
            phone,
            message: values.message,
            status: "pending",
          })),
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms"] });
    },
  });
}

export function useSendBulkEmail() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (values: {
      recipients: string[];
      subject: string;
      message: string;
    }) => {
      // TODO: Implement bulk email sending logic
      // This would typically call an email service API
      const { data, error } = await supabase
        .from("email_messages")
        .insert(
          values.recipients.map((email) => ({
            email,
            subject: values.subject,
            message: values.message,
            status: "pending",
          })),
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}
