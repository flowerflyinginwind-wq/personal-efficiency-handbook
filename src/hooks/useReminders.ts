import { useEffect, useRef, useCallback } from 'react'
import type { HandbookData } from '../types'
import {
  shouldNotifyNow,
  getOverdueTargets,
  getTodaySpecialDates,
  buildNotificationBody,
  sendTaskNotification,
  hasAnythingToNotify,
  todayStr,
  getOverdueItems,
  getSpecialDatesForDate,
} from '../utils/reminders'

export function useReminders(
  data: HandbookData,
  update: (fn: (prev: HandbookData) => HandbookData) => void,
) {
  const dataRef = useRef(data)
  dataRef.current = data

  const tryNotify = useCallback(() => {
    const d = dataRef.current
    if (!shouldNotifyNow(d.reminders)) return

    const today = todayStr()
    const overdue = getOverdueTargets(d.tasks, d.reminders, today)
    const specialToday = getTodaySpecialDates(d.specialDates, d.reminders, today)
    if (!hasAnythingToNotify(overdue, specialToday)) return

    const body = buildNotificationBody(overdue, specialToday, today)
    sendTaskNotification('🔔 效率手册提醒', body)
    update((prev) => ({
      ...prev,
      reminders: { ...prev.reminders, lastNotifiedDate: today },
    }))
  }, [update])

  useEffect(() => {
    tryNotify()
    const id = setInterval(tryNotify, 60_000)
    return () => clearInterval(id)
  }, [tryNotify])

  const today = todayStr()
  const overdue = getOverdueItems(data.tasks, today)
  const specialToday = getSpecialDatesForDate(data.specialDates, today)
  const alertCount = overdue.length + specialToday.length

  return { overdue, specialToday, alertCount }
}
