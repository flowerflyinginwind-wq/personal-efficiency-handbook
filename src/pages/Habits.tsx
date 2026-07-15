import { useState } from 'react'
import type { HandbookData } from '../types'
import { getWeekDates, todayStr, weekdayLabel } from '../hooks/useHandbook'

export function Habits({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const weekDates = getWeekDates()
  const today = todayStr()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('⭐')

  const toggle = (habitId: string, date: string) => {
    update((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h
        const has = h.completedDates.includes(date)
        return {
          ...h,
          completedDates: has
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date],
        }
      }),
    }))
  }

  const addHabit = () => {
    if (!name.trim()) return
    update((prev) => ({
      ...prev,
      habits: [...prev.habits, { id: crypto.randomUUID(), name: name.trim(), icon, completedDates: [] }],
    }))
    setName('')
    setAdding(false)
  }

  const removeHabit = (id: string) => {
    update((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }))
  }

  return (
    <>
      <header className="page-header">
        <h2>习惯追踪</h2>
        <p>点击日期格子打卡，坚持比完美更重要</p>
      </header>

      <div className="habit-grid">
        {data.habits.map((habit) => (
          <div key={habit.id} className="habit-row">
            <span className="habit-icon">{habit.icon}</span>
            <span className="habit-name">{habit.name}</span>
            <div className="habit-days">
              {weekDates.map((date) => (
                <button
                  key={date}
                  className={`habit-day ${habit.completedDates.includes(date) ? 'done' : ''} ${date === today ? 'today' : ''}`}
                  onClick={() => toggle(habit.id, date)}
                  title={date}
                >
                  {weekdayLabel(date)}
                </button>
              ))}
            </div>
            <button className="btn-icon" onClick={() => removeHabit(habit.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              style={{ width: 48, textAlign: 'center', fontSize: '1.2rem', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}
            />
            <input
              className="inline-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              placeholder="习惯名称"
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={addHabit}>
              添加
            </button>
            <button className="btn-danger" onClick={() => setAdding(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAdding(true)} style={{ marginTop: 16 }}>
          + 添加习惯
        </button>
      )}
    </>
  )
}
