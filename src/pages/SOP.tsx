import { useState } from 'react'
import type { HandbookData } from '../types'

export function SOP({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('工作')

  const categories = [...new Set(data.sops.map((s) => s.category))]

  const addSOP = () => {
    if (!title.trim()) return
    update((prev) => ({
      ...prev,
      sops: [
        ...prev.sops,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          category,
          steps: ['第一步...'],
        },
      ],
    }))
    setTitle('')
    setAdding(false)
  }

  const removeSOP = (id: string) => {
    update((prev) => ({ ...prev, sops: prev.sops.filter((s) => s.id !== id) }))
  }

  const updateStep = (sopId: string, stepIdx: number, text: string) => {
    update((prev) => ({
      ...prev,
      sops: prev.sops.map((s) =>
        s.id === sopId
          ? { ...s, steps: s.steps.map((st, i) => (i === stepIdx ? text : st)) }
          : s,
      ),
    }))
  }

  const addStep = (sopId: string) => {
    update((prev) => ({
      ...prev,
      sops: prev.sops.map((s) =>
        s.id === sopId ? { ...s, steps: [...s.steps, '新步骤...'] } : s,
      ),
    }))
  }

  return (
    <>
      <header className="page-header">
        <h2>个人 SOP</h2>
        <p>标准化操作流程，减少决策疲劳</p>
      </header>

      {data.sops.map((sop) => (
        <div key={sop.id} className="sop-card">
          <div className="sop-header">
            <div>
              <span className="sop-title">{sop.title}</span>
              <span className="category-tag" style={{ marginLeft: 8 }}>
                {sop.category}
              </span>
            </div>
            <button className="btn-icon" onClick={() => removeSOP(sop.id)} style={{ opacity: 1 }}>
              ✕
            </button>
          </div>
          <ol className="sop-steps">
            {sop.steps.map((step, i) => (
              <li key={i}>
                <input
                  value={step}
                  onChange={(e) => updateStep(sop.id, i, e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    color: 'inherit',
                    outline: 'none',
                  }}
                />
              </li>
            ))}
          </ol>
          <button className="btn-add" onClick={() => addStep(sop.id)} style={{ marginTop: 8 }}>
            + 添加步骤
          </button>
        </div>
      ))}

      {adding ? (
        <div className="card">
          <input
            className="inline-input"
            style={{ width: '100%', marginBottom: 8 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="SOP 名称"
            autoFocus
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12 }}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={addSOP}>
              创建
            </button>
            <button className="btn-danger" onClick={() => setAdding(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={() => setAdding(true)}>
          + 添加 SOP
        </button>
      )}
    </>
  )
}
