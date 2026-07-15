import { useState } from 'react'
import type { HandbookData, RoutineItem } from '../types'

function RoutineCard({
  section,
  onToggle,
  onAdd,
  onRemove,
}: {
  section: { id: string; title: string; items: RoutineItem[] }
  onToggle: (itemId: string) => void
  onAdd: (text: string) => void
  onRemove: (itemId: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const done = section.items.filter((i) => i.done).length

  const submit = () => {
    if (text.trim()) {
      onAdd(text.trim())
      setText('')
      setAdding(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title">
        {section.title}
        <span className="badge">
          {done}/{section.items.length}
        </span>
      </div>
      <ul className="checklist">
        {section.items.map((item) => (
          <li key={item.id} className={`check-item ${item.done ? 'done' : ''}`}>
            <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
            <span>{item.text}</span>
            <button className="btn-icon" onClick={() => onRemove(item.id)} title="删除">
              ✕
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            className="inline-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="新步骤..."
            autoFocus
          />
          <button className="btn-primary" onClick={submit}>
            添加
          </button>
          <button className="btn-danger" onClick={() => setAdding(false)}>
            取消
          </button>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAdding(true)}>
          + 添加步骤
        </button>
      )}
    </div>
  )
}

export function Daily({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const toggle = (sectionKey: 'morning' | 'evening', itemId: string) => {
    update((prev) => ({
      ...prev,
      routines: {
        ...prev.routines,
        [sectionKey]: {
          ...prev.routines[sectionKey],
          items: prev.routines[sectionKey].items.map((i) =>
            i.id === itemId ? { ...i, done: !i.done } : i,
          ),
        },
      },
    }))
  }

  const add = (sectionKey: 'morning' | 'evening', text: string) => {
    update((prev) => ({
      ...prev,
      routines: {
        ...prev.routines,
        [sectionKey]: {
          ...prev.routines[sectionKey],
          items: [...prev.routines[sectionKey].items, { id: crypto.randomUUID(), text, done: false }],
        },
      },
    }))
  }

  const remove = (sectionKey: 'morning' | 'evening', itemId: string) => {
    update((prev) => ({
      ...prev,
      routines: {
        ...prev.routines,
        [sectionKey]: {
          ...prev.routines[sectionKey],
          items: prev.routines[sectionKey].items.filter((i) => i.id !== itemId),
        },
      },
    }))
  }

  const resetAll = () => {
    update((prev) => ({
      ...prev,
      routines: {
        morning: {
          ...prev.routines.morning,
          items: prev.routines.morning.items.map((i) => ({ ...i, done: false })),
        },
        evening: {
          ...prev.routines.evening,
          items: prev.routines.evening.items.map((i) => ({ ...i, done: false })),
        },
      },
    }))
  }

  return (
    <>
      <header className="page-header">
        <h2>每日流程</h2>
        <p>晨间启动 + 晚间复盘，养成稳定的日常节奏</p>
      </header>

      <div style={{ marginBottom: 16 }}>
        <button className="btn-danger" onClick={resetAll}>
          重置今日勾选
        </button>
      </div>

      <div className="grid-2">
        <RoutineCard
          section={data.routines.morning}
          onToggle={(id) => toggle('morning', id)}
          onAdd={(t) => add('morning', t)}
          onRemove={(id) => remove('morning', id)}
        />
        <RoutineCard
          section={data.routines.evening}
          onToggle={(id) => toggle('evening', id)}
          onAdd={(t) => add('evening', t)}
          onRemove={(id) => remove('evening', id)}
        />
      </div>
    </>
  )
}
