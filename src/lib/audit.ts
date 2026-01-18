/**
 * Audit Log System v1.0.0
 * Denetim ve log sistemi
 */

import { createClient } from './supabase/client';
import type { AuditLog, LogLevelType } from './audit.types';

export interface LogOptions {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  level?: LogLevelType;
}

class AuditLogger {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient();
  }

  async log(
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    options?: LogOptions
  ): Promise<void> {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      
      const logEntry: Partial<AuditLog> = {
        user_id: options?.userId || user?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: options?.ipAddress,
        user_agent: options?.userAgent,
        level: options?.level || 'INFO',
      };

      await this.client
        .from('audit_logs')
        .insert(logEntry);
    } catch (error) {
      console.error('Audit log kaydedilemedi:', error);
    }
  }

  async info(
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    return this.log(action, entityType, entityId, oldValues, newValues, { level: 'INFO' });
  }

  async warning(
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    return this.log(action, entityType, entityId, oldValues, newValues, { level: 'WARNING' });
  }

  async error(
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    return this.log(action, entityType, entityId, oldValues, newValues, { level: 'ERROR' });
  }

  async critical(
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    return this.log(action, entityType, entityId, oldValues, newValues, { level: 'CRITICAL' });
  }

  async getLogs(filters?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    level?: LogLevelType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ data: AuditLog[] | null; error: any }> {
    let query = this.client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters?.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.level) {
      query = query.eq('level', filters.level);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1);
    }

    return await query;
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();
