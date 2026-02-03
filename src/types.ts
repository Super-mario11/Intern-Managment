export type Intern = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  projects: string[]
  manager: string
  startDate: string
  performance: string
  skills: string[]
  department: string
}

export type SortKey = 'name' | 'role' | 'projects'

export type FormState = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  projectsText: string
  manager: string
  startDate: string
  performance: string
  skillsText: string
  department: string
}
