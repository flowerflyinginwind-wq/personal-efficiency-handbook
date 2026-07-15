import type { HandbookData, Task, TaskRewards, DayReward, ReminderSettings } from '../types'
import { DEFAULT_REMINDERS } from './reminders'
import { formatLunarFull } from './lunar'

export const TARGET_RATE = 0.8

export function weekdayIndex(dateStr: string): number {
  return (new Date(dateStr + 'T00:00:00').getDay() + 6) % 7
}

export function taskAppliesOnDate(task: Task, date: string): boolean {
  if (task.scheduledDates.includes(date)) return true
  const r = task.recurrence
  if (!r) return false
  if (date < r.start) return false
  if (r.end && date > r.end) return false
  if (r.type === 'daily') return true
  if (r.type === 'weekly') return (r.days ?? []).includes(weekdayIndex(date))
  if (r.type === 'monthly') return parseInt(date.slice(8), 10) === (r.day ?? parseInt(r.start.slice(8), 10))
  return false
}

export function isCompletedOn(task: Task, scheduledDate: string): boolean {
  return task.completions.some((c) => c.scheduledDate === scheduledDate)
}

export function getTasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => taskAppliesOnDate(t, date))
}

export function getNextOccurrence(task: Task, afterDate: string): string | null {
  for (let i = 1; i <= 366; i++) {
    const d = shiftDate(afterDate, i)
    if (taskAppliesOnDate(task, d) && !isCompletedOn(task, d)) return d
  }
  return null
}

export function formatRecurrence(task: Task): string {
  const r = task.recurrence
  if (!r) return ''
  const names = ['一', '二', '三', '四', '五', '六', '日']
  if (r.type === 'daily') return '每天'
  if (r.type === 'weekly') {
    return '每周' + (r.days ?? []).sort((a, b) => a - b).map((i) => `周${names[i]}`).join('')
  }
  if (r.type === 'monthly') return `每月 ${r.day ?? parseInt(r.start.slice(8), 10)} 日`
  return ''
}

function collectDatesForTasks(tasks: Task[], to: string): Set<string> {
  const dates = new Set<string>()
  const from = tasks.reduce((m, t) => {
    const s = t.recurrence?.start ?? t.scheduledDates[0] ?? to
    return s < m ? s : m
  }, to)
  let d = from
  while (d <= to) {
    for (const t of tasks) {
      if (taskAppliesOnDate(t, d)) dates.add(d)
    }
    d = shiftDate(d, 1)
  }
  for (const t of tasks) {
    for (const x of t.scheduledDates) dates.add(x)
    for (const c of t.completions) {
      dates.add(c.scheduledDate)
      dates.add(c.completedDate)
    }
  }
  return dates
}

export function getDayStats(tasks: Task[], date: string) {
  const dayTasks = getTasksForDate(tasks, date)
  const total = dayTasks.length
  const done = dayTasks.filter((t) => isCompletedOn(t, date)).length
  const rate = total ? done / total : 0
  const ahead = tasks.filter((t) => {
    const n = getNextOccurrence(t, date)
    return n && n > date && t.completions.some((c) => c.scheduledDate === n && c.completedDate === date)
  }).length
  return { total, done, rate, ahead }
}

export function evaluateDayReward(tasks: Task[], date: string): DayReward {
  const { total, done, rate, ahead } = getDayStats(tasks, date)
  const reasons: string[] = []
  let flowers = 0

  if (total === 0 && ahead === 0) {
    return { date, flowers: 0, reasons: [] }
  }

  if (total > 0 && rate >= 1) {
    flowers += 1
    reasons.push('今日任务全部完成')
  } else if (total > 0 && rate >= TARGET_RATE) {
    flowers += 1
    reasons.push(`完成度达 ${Math.round(rate * 100)}%，达标`)
  }

  if (ahead > 0) {
    flowers += ahead
    reasons.push(`超前完成 ${ahead} 项任务`)
  }

  return { date, flowers, reasons }
}

export function recalculateRewards(tasks: Task[], existing: TaskRewards): TaskRewards {
  const today = new Date().toISOString().slice(0, 10)
  const allDates = collectDatesForTasks(tasks, shiftDate(today, 7))

  const dayRewards: DayReward[] = [...allDates]
    .sort()
    .map((date) => evaluateDayReward(tasks, date))
    .filter((r) => r.flowers > 0)

  const totalFlowers = dayRewards.reduce((sum, r) => sum + r.flowers, 0)
  return { totalFlowers, dayRewards }
}

export function toggleTaskCompletion(
  task: Task,
  scheduledDate: string,
  actionDate: string,
): Task {
  const existing = task.completions.find((c) => c.scheduledDate === scheduledDate)
  if (existing) {
    return {
      ...task,
      completions: task.completions.filter((c) => c.scheduledDate !== scheduledDate),
    }
  }
  return {
    ...task,
    completions: [...task.completions, { scheduledDate, completedDate: actionDate }],
  }
}

export function addScheduledDate(task: Task, date: string): Task {
  if (task.scheduledDates.includes(date)) return task
  return {
    ...task,
    scheduledDates: [...task.scheduledDates, date].sort(),
  }
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const solar = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
  return `${solar}（${formatLunarFull(dateStr)}）`
}

export function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function getMonthDates(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(year, month, i + 1)
    return d.toISOString().slice(0, 10)
  })
}

export function migrateData(raw: Partial<HandbookData>): HandbookData {
  const rawReminders = raw.reminders as ReminderSettings & { advanceDays?: 0 | 1 }
  return {
    ...raw,
    tasks: raw.tasks ?? [],
    rewards: raw.rewards ?? { totalFlowers: 0, dayRewards: [] },
    reminders: {
      ...DEFAULT_REMINDERS,
      ...rawReminders,
      specialAdvanceDays:
        rawReminders?.specialAdvanceDays ?? rawReminders?.advanceDays ?? 0,
    },
    specialDates: raw.specialDates ?? [],
  } as HandbookData
}
