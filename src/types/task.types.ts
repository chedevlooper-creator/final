// Task (Görev) Tipleri

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'active' | 'completed' | 'cancelled'
export type TaskCategory = 'field_work' | 'office_work' | 'meeting' | 'call' | 'research' | 'other'

export type TaskAssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'rejected'

export interface Task {
  id: string
  organization_id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  category?: TaskCategory
  tags: string[]
  due_date: string
  start_date: string
  completed_at?: string
  created_by: string
  created_at: string
  updated_at: string
  created_by_user?: {
    id: string
    name: string
    email: string
  }
  assignments?: TaskAssignment[]
}

export interface TaskAssignment {
  id: string
  task_id: string
  assigned_to: string
  assigned_by: string
  organization_id: string
  status: TaskAssignmentStatus
  assigned_at: string
  completed_at?: string
  completion_notes?: string
  notification_sent: boolean
  notification_read_at?: string
  updated_at: string
  assigned_to_user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  task?: Task
}

export interface MyTaskAssignment {
  id: string
  status: TaskAssignmentStatus
  assigned_at: string
  completed_at?: string
  completion_notes?: string
  task: Task & {
    created_by: {
      id: string
      name: string
      email: string
    }
  }
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority: TaskPriority
  category?: TaskCategory
  tags?: string[]
  due_date: string
  assignees: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: TaskPriority
  category?: TaskCategory
  tags?: string[]
  due_date?: string
  status?: TaskStatus
}

export interface CompleteTaskInput {
  completion_notes?: string
}

// Activity Log Tipleri

export type ActivityAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'list'
  | 'login' 
  | 'logout' 
  | 'export' 
  | 'import' 
  | 'assign'
  | 'complete' 
  | 'approve' 
  | 'reject' 
  | 'cancel'

export interface ActivityLog {
  id: string
  organization_id: string
  user_id: string
  user_name: string
  user_role: string
  action: ActivityAction
  entity_type: string
  entity_id?: string
  entity_name?: string
  description: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Team Stats Tipleri

export interface TeamMemberStats {
  user: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  role: string
  joined_at: string
  stats: {
    total_assigned: number
    completed: number
    pending: number
    overdue: number
    in_progress: number
    completion_rate: number
  }
  last_activity?: {
    created_at: string
    action: ActivityAction
    description: string
  }
}

export interface OrganizationStats {
  total_tasks: number
  active_tasks: number
  completed_tasks: number
  this_week_tasks: number
  completion_rate: number
}

export interface TeamStatsResponse {
  team_members: TeamMemberStats[]
  organization_stats: OrganizationStats
}

// Filter Tipleri

export interface TaskFilter {
  status?: TaskStatus
  priority?: TaskPriority
  date_from?: string
  date_to?: string
}

export interface ActivityFilter {
  user_id?: string
  action?: ActivityAction
  entity_type?: string
  date_from?: string
  date_to?: string
}
