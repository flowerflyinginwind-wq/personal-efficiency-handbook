import { useState } from 'react'
import type { HandbookData, ReviewSection } from '../types'

type ReviewType = 'weekly' | 'monthly'

export function Review({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const [type, setType] = useState<ReviewType>('weekly')
  const sections = data.reviews[type]

  const updateAnswer = (sectionId: string, promptId: string, answer: string) => {
    update((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [type]: prev.reviews[type].map((s) =>
          s.id === sectionId
            ? {
                ...s,
                prompts: s.prompts.map((p) => (p.id === promptId ? { ...p, answer } : p)),
              }
            : s,
        ),
      },
    }))
  }

  const clearAnswers = () => {
    if (!confirm('清空当前复盘的所有回答？')) return
    update((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [type]: prev.reviews[type].map((s) => ({
          ...s,
          prompts: s.prompts.map((p) => ({ ...p, answer: '' })),
        })),
      },
    }))
  }

  return (
    <>
      <header className="page-header">
        <h2>周月复盘</h2>
        <p>定期反思，持续优化你的效率系统</p>
      </header>

      <div className="review-tabs">
        <button
          className={`review-tab ${type === 'weekly' ? 'active' : ''}`}
          onClick={() => setType('weekly')}
        >
          周复盘
        </button>
        <button
          className={`review-tab ${type === 'monthly' ? 'active' : ''}`}
          onClick={() => setType('monthly')}
        >
          月复盘
        </button>
        <button className="btn-danger" onClick={clearAnswers} style={{ marginLeft: 'auto' }}>
          清空回答
        </button>
      </div>

      {sections.map((section) => (
        <ReviewSectionCard
          key={section.id}
          section={section}
          onUpdate={(promptId, answer) => updateAnswer(section.id, promptId, answer)}
        />
      ))}
    </>
  )
}

function ReviewSectionCard({
  section,
  onUpdate,
}: {
  section: ReviewSection
  onUpdate: (promptId: string, answer: string) => void
}) {
  const filled = section.prompts.filter((p) => p.answer.trim()).length

  return (
    <div className="card">
      <div className="card-title">
        {section.title}
        <span className="badge">
          {filled}/{section.prompts.length}
        </span>
      </div>
      {section.prompts.map((prompt) => (
        <div key={prompt.id} className="review-prompt">
          <label>{prompt.question}</label>
          <textarea
            value={prompt.answer}
            onChange={(e) => onUpdate(prompt.id, e.target.value)}
            placeholder="写下你的想法..."
          />
        </div>
      ))}
    </div>
  )
}
