// Skill Category Types
export interface SkillCategory {
  id: string
  name: string
  description: string | null
  sort_order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface CreateSkillCategoryInput {
  name: string
  description?: string | null
  sort_order?: number
  status?: 'active' | 'inactive'
}

export interface UpdateSkillCategoryInput {
  name?: string
  description?: string | null
  sort_order?: number
  status?: 'active' | 'inactive'
}

// Skill Types
export interface Skill {
  id: string
  category_id: string
  name: string
  description: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface SkillWithCategory extends Skill {
  category_name: string
  category_sort_order: number
}

export interface CreateSkillInput {
  category_id: string
  name: string
  description?: string | null
  status?: 'active' | 'inactive'
}

export interface UpdateSkillInput {
  category_id?: string
  name?: string
  description?: string | null
  status?: 'active' | 'inactive'
}

export interface SkillFilters {
  category_id?: string
  status?: 'active' | 'inactive'
  search?: string
  page?: number
  limit?: number
}

// Volunteer Skill Types
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface VolunteerSkill {
  id: string
  volunteer_id: string
  skill_id: string
  proficiency_level: ProficiencyLevel
  years_of_experience: number | null
  notes: string | null
  verified: boolean
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface VolunteerSkillDetail extends VolunteerSkill {
  skill_name: string
  skill_description: string | null
  category_id: string
  category_name: string
  volunteer_first_name: string
  volunteer_last_name: string
}

export interface CreateVolunteerSkillInput {
  volunteer_id: string
  skill_id: string
  proficiency_level?: ProficiencyLevel
  years_of_experience?: number | null
  notes?: string | null
  verified?: boolean
}

export interface UpdateVolunteerSkillInput {
  proficiency_level?: ProficiencyLevel
  years_of_experience?: number | null
  notes?: string | null
  verified?: boolean
  verified_by?: string | null
  verified_at?: string | null
}

export interface VolunteerSkillFilters {
  volunteer_id?: string
  skill_id?: string
  proficiency_level?: ProficiencyLevel
  verified?: boolean
  page?: number
  limit?: number
}
