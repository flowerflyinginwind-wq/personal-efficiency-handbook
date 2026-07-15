import { useState, useEffect, useCallback } from 'react'
import type { HandbookData } from '../types'
import { defaultData } from '../data/defaults'
import { formatDateWithLunar } from './lunar'

const STORAGE_KEY = 'efficiency-handbook-data'

function loadData(): HandbookData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return migrateData(JSON.parse(raw) as Partial<HandbookData>)
  } catch {
    /* use defaults */
  }
  return defaultData
}

export function useHandbook() {
  const [data, setData] = useState<HandbookData>(loadData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const update = useCallback((fn: (prev: HandbookData) => HandbookData) => {
    setData(fn)
  }, [])

  const reset = useCallback(() => {
    setData(defaultData)
  }, [])

  return { data, update, reset }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return formatDateWithLunar(`${y}-${m}-${day}`)
}

export function getWeekDates(anchor?: string): string[] {
  const today = anchor ? new Date(anchor + 'T00:00:00') : new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function weekdayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('zh-CN', { weekday: 'short' })
}
