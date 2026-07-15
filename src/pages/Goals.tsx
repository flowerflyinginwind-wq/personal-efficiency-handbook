import { useState } from 'react'
import type { HandbookData } from '../types'

export function Goals({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [period, setPeriod] = useState('本季度')

  const toggleKR = (goalId: string, krId: string) => {
    update((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              keyResults: g.keyResults.map((kr) =>
                kr.id === krId ? { ...kr, done: !kr.done } : kr,
              ),
            }
          : g,
      ),
    }))
  }

  const addKR = (goalId: string, text: string) => {
    update((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? { ...g, keyResults: [...g.keyResults, { id: crypto.randomUUID(), text, done: false }] }
          : g,
      ),
    }))
  }

  const removeGoal = (goalId: string) => {
    update((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== goalId) }))
  }

  const addGoal = () => {
    if (!title.trim()) return
    update((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          period,
          keyResults: [{ id: crypto.randomUUID(), text: '第一个关键结果', done: false }],
        },
      ],
    }))
    setTitle('')
    setAdding(false)
  }

  return (
    <>
      <header className="page-header">
        <h2>目标 OKR</h2>
        <p>设定目标与可衡量的关键结果，定期回顾进展</p>
      </header>

      {data.goals.map((goal) => {
        const done = goal.keyResults.filter((kr) => kr.done).length
        const total = goal.keyResults.length
        const pct = total ? Math.round((done / total) * 100) : 0

        return (
          <GoalCard
            key={goal.id}
            goal={goal}
            pct={pct}
            onToggleKR={(krId) => toggleKR(goal.id, krId)}
            onAddKR={(text) => addKR(goal.id, text)}
            onRemove={() => removeGoal(goal.id)}
          />
        )
      })}

      {adding ? (
        <div className="card">
          <input
            className="inline-input"
            style={{ width: '100%', marginBottom: 8 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="目标名称"
            autoFocus
          />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12 }}
          >
            <option>本周</option>
            <option>本月</option>
            <option>本季度</option>
            <option>今年</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={addGoal}>
              创建目标
            </button>
            <button className="btn-danger" onClick={() => setAdding(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAdding(true)}>
          + 添加新目标
        </button>
      )}
    </>
  )
}

function GoalCard({
  goal,
  pct,
  onToggleKR,
  onAddKR,
  onRemove,
}: {
  goal: HandbookData['goals'][0]
  pct: number
  onToggleKR: (krId: string) => void
  onAddKR: (text: string) => void
  onRemove: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')

  return (
    <div className="goal-item">
      <div className="goal-header">
        <span className="goal-title">{goal.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="goal-period">{goal.period}</span>
          <button className="btn-icon" onClick={onRemove} style={{ opacity: 1 }}>
            ✕
          </button>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <ul className="checklist">
        {goal.keyResults.map((kr) => (
          <li key={kr.id} className={`check-item ${kr.done ? 'done' : ''}`}>
            <input type="checkbox" checked={kr.done} onChange={() => onToggleKR(kr.id)} />
            <span>{kr.text}</span>
          </li>
        ))}
      </ul>
      {adding ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            className="inline-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) {
                onAddKR(text.trim())
                setText('')
                setAdding(false)
              }
            }}
            placeholder="关键结果..."
            autoFocus
          />
          <button
            className="btn-primary"
            onClick={() => {
              if (text.trim()) {
                onAddKR(text.trim())
                setText('')
                setAdding(false)
              }
            }}
          >
            添加
          </button>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAdding(true)} style={{ marginTop: 8 }}>
          + 关键结果
        </button>
      )}
    </div>
  )
}
