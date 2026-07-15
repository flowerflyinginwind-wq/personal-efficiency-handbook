import { useState } from 'react'
import type { HandbookData } from '../types'

export function Tools({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', category: '通用', shortcut: '', note: '' })

  const categories = [...new Set(data.tools.map((t) => t.category))]

  const addTool = () => {
    if (!form.name.trim()) return
    update((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        { id: crypto.randomUUID(), ...form, name: form.name.trim() },
      ],
    }))
    setForm({ name: '', category: '通用', shortcut: '', note: '' })
    setAdding(false)
  }

  const removeTool = (id: string) => {
    update((prev) => ({ ...prev, tools: prev.tools.filter((t) => t.id !== id) }))
  }

  return (
    <>
      <header className="page-header">
        <h2>工具速查</h2>
        <p>常用工具与快捷键，减少记忆负担</p>
      </header>

      <div className="card">
        <table className="tool-table">
          <thead>
            <tr>
              <th>工具</th>
              <th>分类</th>
              <th>快捷键</th>
              <th>备注</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.tools.map((tool) => (
              <tr key={tool.id}>
                <td style={{ fontWeight: 500 }}>{tool.name}</td>
                <td>
                  <span className="category-tag">{tool.category}</span>
                </td>
                <td>{tool.shortcut ? <kbd className="shortcut">{tool.shortcut}</kbd> : '—'}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{tool.note || '—'}</td>
                <td>
                  <button className="btn-icon" onClick={() => removeTool(tool.id)} style={{ opacity: 1 }}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding ? (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input
              className="inline-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="工具名称"
              autoFocus
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
              <option>新分类</option>
            </select>
            <input
              className="inline-input"
              value={form.shortcut}
              onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
              placeholder="快捷键"
            />
            <input
              className="inline-input"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="备注"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={addTool}>
              添加
            </button>
            <button className="btn-danger" onClick={() => setAdding(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAdding(true)}>
          + 添加工具
        </button>
      )}
    </>
  )
}
