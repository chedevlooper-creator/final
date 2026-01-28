/**
 * Audit Log Types v1.0.0
 * Simplified type definitions for audit system
 */

// Base types - define here to avoid circular dependency
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export type LogLevelType = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  level: LogLevelType;
  created_at: string;
}

// Extend AuditLog with additional properties
export interface ExtendedAuditLog extends AuditLog {
  timestamp: Date;
  duration?: number;
  sessionId?: string;
  requestId?: string;
}

// Enums
export enum AuditEventType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  CREATE_RECORD = 'create_record',
  READ_RECORD = 'read_record',
  UPDATE_RECORD = 'update_record',
  DELETE_RECORD = 'delete_record',
  SECURITY_ALERT = 'security_alert',
  SYSTEM_ERROR = 'system_error',
  CUSTOM = 'custom'
}

export enum EntityType {
  USER = 'user',
  DONOR = 'donor',
  VOLUNTEER = 'volunteer',
  MONEY_BOX = 'money_box',
  INVENTORY = 'inventory',
  PROJECT = 'project',
  REPORT = 'report',
  SYSTEM = 'system'
}

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Filter and Pagination
export interface LogFilterOptions {
  userId?: string;
  eventType?: AuditEventType;
  entityType?: EntityType;
  priority?: EventPriority;
  level?: LogLevelType;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface LogPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LogQueryResult {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  searchTime: number;
}

// Statistics
export interface AuditStatistics {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByEventType: Record<string, number>;
  logsByUser: Array<{ userId: string; count: number }>;
  errorRate: number;
  averageDuration: number;
  last24Hours: number;
  lastHour: number;
  failedLogins: number;
  suspiciousActivities: number;
}

// Security
export interface SecurityAlert {
  id: string;
  type: string;
  severity: EventPriority;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  ipAddress?: string;
  userId?: string;
}

export interface SecurityAnalytics {
  totalAlerts: number;
  criticalAlerts: number;
  highPriorityAlerts: number;
  resolvedAlerts: number;
  pendingAlerts: number;
  alertsTrend: Array<{ date: string; count: number }>;
  suspiciousIPs: Array<{ ip: string; attempts: number }>;
  failedLoginAttempts: Array<{ userId: string; attempts: number }>;
}

// Logging
export interface LoggingOptions {
  level?: LogLevel;
  eventType?: AuditEventType;
  action: string;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  changes?: AuditChanges;
  errorMessage?: string;
  status?: 'success' | 'failure';
  priority?: EventPriority;
  sessionId?: string;
  requestId?: string;
}

export interface AuditChanges {
  old?: Record<string, unknown>;
  new?: Record<string, unknown>;
  fields?: string[];
}

// Export
export interface LogExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  filters?: LogFilterOptions;
  startDate: Date;
  endDate: Date;
  includeMetadata?: boolean;
}

// Retention
export interface RetentionPolicy {
  enabled: boolean;
  retentionDays: number;
  archiveLogs: boolean;
  archiveLocation?: string;
  deleteAfterArchiving: boolean;
}

// Report
export interface AuditReport {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  format: 'pdf' | 'excel' | 'json';
  generatedAt: Date;
  generatedBy: string;
  fileUrl?: string;
  summary: {
    totalLogs: number;
    byLevel: Record<string, number>;
    byEventType: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
  };
}

// Context
export interface EventContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

// Search
export interface LogSearchResult {
  logs: AuditLog[];
  totalMatches: number;
  query: string;
  searchTime: number;
}
