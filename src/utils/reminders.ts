import type { Task, ReminderSettings, PendingItem, SpecialDate } from '../types'
import { isCompletedOn } from './tasks'

export const DEFAULT_REMINDERS: ReminderSettings = {
  enabled: true,
  time: '09:00',
  remindOverdue: true,
  specialAdvanceDays: 0,
  lastNotifiedDate: null,
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function toMonthDay(dateStr: string): string {
  return dateStr.slice(5, 10)
}

export function parseDateInput(dateStr: string): { monthDay: string; year: number } {
  return { monthDay: toMonthDay(dateStr), year: parseInt(dateStr.slice(0, 4), 10) }
}

import { formatLunarFull } from './lunar'

export function formatSpecialDateLabel(sd: SpecialDate): string {
  const [mm, dd] = sd.monthDay.split('-')
  const y = sd.yearly ? new Date().getFullYear() : (sd.year ?? new Date().getFullYear())
  const dateStr = `${y}-${sd.monthDay}`
  const solar = sd.yearly
    ? `每年 ${parseInt(mm, 10)} 月 ${parseInt(dd, 10)} 日`
    : `${sd.year} 年 ${parseInt(mm, 10)} 月 ${parseInt(dd, 10)} 日`
  return `${solar}（${formatLunarFull(dateStr)}）`
}

export function matchesSpecialDate(sd: SpecialDate, dateStr: string): boolean {
  const monthDay = toMonthDay(dateStr)
  const year = parseInt(dateStr.slice(0, 4), 10)
  if (sd.yearly) return sd.monthDay === monthDay
  return sd.monthDay === monthDay && sd.year === year
}

export function getSpecialDatesForDate(
  specialDates: SpecialDate[],
  dateStr: string,
): SpecialDate[] {
  return specialDates.filter((sd) => matchesSpecialDate(sd, dateStr))
}

export function getTodaySpecialDates(
  specialDates: SpecialDate[],
  settings: ReminderSettings,
  today: string,
): SpecialDate[] {
  const result = getSpecialDatesForDate(specialDates, today)
  if (settings.specialAdvanceDays === 1) {
    const tomorrow = shiftDateStr(today, 1)
    for (const sd of getSpecialDatesForDate(specialDates, tomorrow)) {
      if (!result.some((r) => r.id === sd.id)) result.push(sd)
    }
  }
  return result
}

export function getPendingForDate(tasks: Task[], date: string): PendingItem[] {
  const items: PendingItem[] = []
  for (const task of tasks) {
    if (task.scheduledDates.includes(date) && !isCompletedOn(task, date)) {
      items.push({ task, scheduledDate: date })
    }
  }
  return items
}

export function getOverdueItems(tasks: Task[], today: string): PendingItem[] {
  const items: PendingItem[] = []
  for (const task of tasks) {
    for (const d of task.scheduledDates) {
      if (d < today && !isCompletedOn(task, d)) {
        items.push({ task, scheduledDate: d })
      }
    }
  }
  return items.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
}

export function shiftDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function getOverdueTargets(tasks: Task[], settings: ReminderSettings, today: string): PendingItem[] {
  if (!settings.remindOverdue) return []
  return getOverdueItems(tasks, today)
}

export function buildNotificationBody(
  overdue: PendingItem[],
  specialToday: SpecialDate[],
  today: string,
): string {
  const parts: string[] = []

  for (const sd of specialToday) {
    const isToday = matchesSpecialDate(sd, today)
    const prefix = isToday ? '🎂' : '📅 明天'
    parts.push(`${prefix} ${sd.title}${sd.message ? '：' + sd.message : ''}`)
  }

  if (overdue.length > 0) {
    parts.push(`⚠️ 逾期 ${overdue.length} 项：${overdue.map((i) => i.task.title).join('、')}`)
  }

  return parts.join('\n') || '暂无提醒'
}

export function hasAnythingToNotify(
  overdue: PendingItem[],
  specialToday: SpecialDate[],
): boolean {
  return overdue.length > 0 || specialToday.length > 0
}

export function shouldNotifyNow(settings: ReminderSettings, now = new Date()): boolean {
  if (!settings.enabled) return false
  const today = now.toISOString().slice(0, 10)
  if (settings.lastNotifiedDate === today) return false

  const [h, m] = settings.time.split(':').map(Number)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const targetMin = h * 60 + m
  return nowMin >= targetMin
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function sendTaskNotification(title: string, body: string): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false
  try {
    new Notification(title, { body, tag: 'efficiency-handbook-reminder' })
    return true
  } catch {
    return false
  }
}

export function countAlertItems(
  tasks: Task[],
  specialDates: SpecialDate[],
  today: string,
): number {
  return getOverdueItems(tasks, today).length + getSpecialDatesForDate(specialDates, today).length
}
