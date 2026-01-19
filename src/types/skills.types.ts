export interface SkillCategory {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  sort_order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category_id: string | null
  description: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface SkillWithCategory extends Skill {
  category_id: string | null
  category_name: string | null
  category_description: string | null
  category_color: string | null
  category_icon: string | null
}

export interface VolunteerSkill {
  id: string
  volunteer_id: string
  skill_id: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
  verified: boolean
  verified_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VolunteerSkillDetail extends VolunteerSkill {
  first_name: string
  last_name: string
  email: string | null
  skill_name: string
  category_name: string | null
  category_color: string | null
}

export interface CreateSkillCategoryInput {
  name: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
  status?: 'active' | 'inactive'
}

export interface UpdateSkillCategoryInput extends Partial<CreateSkillCategoryInput> {}

export interface CreateSkillInput {
  name: string
  category_id: string
  description?: string
  status?: 'active' | 'inactive'
}

export interface UpdateSkillInput extends Partial<CreateSkillInput> {}

export interface CreateVolunteerSkillInput {
  volunteer_id: string
  skill_id: string
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified?: boolean
  notes?: string
}

export interface UpdateVolunteerSkillInput extends Partial<CreateVolunteerSkillInput> {}

export interface SkillFilters {
  category_id?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface VolunteerSkillFilters {
  volunteer_id?: string
  skill_id?: string
  proficiency_level?: string
  verified?: boolean
  page?: number
  limit?: number
}

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Başlangıç', color: 'bg-slate-100 text-slate-700' },
  { value: 'intermediate', label: 'Orta', color: 'bg-blue-100 text-blue-700' },
  { value: 'advanced', label: 'İleri', color: 'bg-purple-100 text-purple-700' },
  { value: 'expert', label: 'Uzman', color: 'bg-green-100 text-green-700' },
] as const
