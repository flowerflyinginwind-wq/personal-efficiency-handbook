export type PageId =
  | 'tasks'
  | 'special'
  | 'dashboard'
  | 'daily'
  | 'goals'
  | 'habits'
  | 'tools'
  | 'sop'
  | 'review'

export interface TaskCompletion {
  scheduledDate: string
  completedDate: string
}

export interface TaskRecurrence {
  type: 'daily' | 'weekly' | 'monthly'
  start: string
  end?: string
  days?: number[]
  day?: number
}

export interface Task {
  id: string
  title: string
  note: string
  scheduledDates: string[]
  completions: TaskCompletion[]
  createdAt: string
  recurrence?: TaskRecurrence | null
}

export interface DayReward {
  date: string
  flowers: number
  reasons: string[]
}

export interface TaskRewards {
  totalFlowers: number
  dayRewards: DayReward[]
}

export interface ReminderSettings {
  enabled: boolean
  time: string
  remindOverdue: boolean
  specialAdvanceDays: 0 | 1
  lastNotifiedDate: string | null
}

export interface SpecialDate {
  id: string
  title: string
  message: string
  monthDay: string
  yearly: boolean
  year?: number
  isLunar?: boolean
}

export interface PendingItem {
  task: Task
  scheduledDate: string
}

export interface RoutineItem {
  id: string
  text: string
  done: boolean
}

export interface RoutineSection {
  id: string
  title: string
  items: RoutineItem[]
}

export interface KeyResult {
  id: string
  text: string
  done: boolean
}

export interface Goal {
  id: string
  title: string
  period: string
  keyResults: KeyResult[]
}

export interface Habit {
  id: string
  name: string
  icon: string
  completedDates: string[]
}

export interface ToolEntry {
  id: string
  name: string
  category: string
  shortcut?: string
  note?: string
}

export interface SOPItem {
  id: string
  title: string
  category: string
  steps: string[]
}

export interface ReviewPrompt {
  id: string
  question: string
  answer: string
}

export interface ReviewSection {
  id: string
  title: string
  prompts: ReviewPrompt[]
}

export interface HandbookData {
  tasks: Task[]
  rewards: TaskRewards
  reminders: ReminderSettings
  specialDates: SpecialDate[]
  routines: {
    morning: RoutineSection
    evening: RoutineSection
  }
  goals: Goal[]
  habits: Habit[]
  tools: ToolEntry[]
  sops: SOPItem[]
  reviews: {
    weekly: ReviewSection[]
    monthly: ReviewSection[]
  }
}
