import type { HandbookData, Task, TaskRewards, DayReward, ReminderSettings } from '../types'
import { DEFAULT_REMINDERS } from './reminders'
import { formatLunarFull } from './lunar'

export const TARGET_RATE = 0.8

export function isCompletedOn(task: Task, scheduledDate: string): boolean {
  return task.completions.some((c) => c.scheduledDate === scheduledDate)
}

export function getTasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.scheduledDates.includes(date))
}

export function getDayStats(tasks: Task[], date: string) {
  const dayTasks = getTasksForDate(tasks, date)
  const total = dayTasks.length
  const done = dayTasks.filter((t) => isCompletedOn(t, date)).length
  const rate = total ? done / total : 0
  const ahead = tasks.filter((t) =>
    t.completions.some((c) => c.completedDate === date && c.scheduledDate > date),
  ).length
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
  const allDates = new Set<string>()
  for (const t of tasks) {
    for (const d of t.scheduledDates) allDates.add(d)
    for (const c of t.completions) {
      allDates.add(c.scheduledDate)
      allDates.add(c.completedDate)
    }
  }

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
