import type { HandbookData, PageId } from '../types'
import { formatDate, todayStr } from '../hooks/useHandbook'
import { getDayStats } from '../utils/tasks'

const QUICK: { page: PageId; icon: string; label: string }[] = [
  { page: 'tasks', icon: '📌', label: '今日任务打卡' },
  { page: 'habits', icon: '✅', label: '习惯打卡' },
  { page: 'review', icon: '📝', label: '写复盘' },
  { page: 'goals', icon: '🎯', label: '查看目标' },
  { page: 'sop', icon: '📋', label: '查阅 SOP' },
  { page: 'tools', icon: '⌨️', label: '工具速查' },
]

export function Dashboard({
  data,
  onNavigate,
}: {
  data: HandbookData
  onNavigate: (p: PageId) => void
}) {
  const today = todayStr()
  const taskStats = getDayStats(data.tasks, today)
  const morningDone = data.routines.morning.items.filter((i) => i.done).length
  const morningTotal = data.routines.morning.items.length
  const habitsDone = data.habits.filter((h) => h.completedDates.includes(today)).length
  const habitsTotal = data.habits.length
  const activeGoals = data.goals.length
  const krDone = data.goals.reduce(
    (sum, g) => sum + g.keyResults.filter((kr) => kr.done).length,
    0,
  )
  const krTotal = data.goals.reduce((sum, g) => sum + g.keyResults.length, 0)

  return (
    <>
      <header className="page-header">
        <h2>总览</h2>
        <p>{formatDate(new Date())}</p>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">
            {taskStats.done}/{taskStats.total}
          </div>
          <div className="stat-label">今日任务完成</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🌸 {data.rewards.totalFlowers}</div>
          <div className="stat-label">累计小红花</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {taskStats.total ? Math.round(taskStats.rate * 100) : 0}%
          </div>
          <div className="stat-label">今日完成度</div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginTop: -8 }}>
        <div className="stat-card">
          <div className="stat-value">
            {morningDone}/{morningTotal}
          </div>
          <div className="stat-label">晨间例行完成</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {habitsDone}/{habitsTotal}
          </div>
          <div className="stat-label">今日习惯打卡</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {krDone}/{krTotal}
          </div>
          <div className="stat-label">关键结果达成</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">快捷入口</div>
        <div className="quick-links">
          {QUICK.map((q) => (
            <button key={q.page} className="quick-link" onClick={() => onNavigate(q.page)}>
              <div className="ql-icon">{q.icon}</div>
              <div className="ql-label">{q.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          进行中的目标
          <span className="badge">{activeGoals} 个</span>
        </div>
        {data.goals.length === 0 ? (
          <p className="empty-hint">暂无目标，去「目标 OKR」添加</p>
        ) : (
          data.goals.map((g) => {
            const done = g.keyResults.filter((kr) => kr.done).length
            const total = g.keyResults.length
            const pct = total ? Math.round((done / total) * 100) : 0
            return (
              <div key={g.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{g.title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
