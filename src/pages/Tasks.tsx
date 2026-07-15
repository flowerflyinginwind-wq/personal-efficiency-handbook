import { useState } from 'react'
import type { HandbookData } from '../types'
import {
  getTasksForDate,
  getDayStats,
  toggleTaskCompletion,
  recalculateRewards,
  evaluateDayReward,
  isCompletedOn,
  shiftDate,
  getMonthDates,
  formatShortDate,
} from '../utils/tasks'
import { formatLunarCell, formatSolarMonthLunarRange } from '../utils/lunar'
import { getOverdueItems } from '../utils/reminders'
import { todayStr, getWeekDates, weekdayLabel } from '../hooks/useHandbook'

export function Tasks({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [pickDates, setPickDates] = useState<string[]>([todayStr()])
  const [toast, setToast] = useState<string | null>(null)

  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const today = todayStr()
  const overdueItems = getOverdueItems(data.tasks, today)
  const dayTasks = getTasksForDate(data.tasks, selectedDate)
  const stats = getDayStats(data.tasks, selectedDate)
  const dayReward = evaluateDayReward(data.tasks, selectedDate)
  const aheadTasks = data.tasks.filter(
    (t) =>
      !t.scheduledDates.includes(selectedDate) &&
      t.scheduledDates.some((d) => d > selectedDate) &&
      t.scheduledDates.some((d) => !isCompletedOn(t, d)),
  )

  const weekDates = getWeekDates(selectedDate)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const syncRewards = (tasks: HandbookData['tasks']) => {
    return recalculateRewards(tasks, data.rewards)
  }

  const handleToggle = (taskId: string, scheduledDate: string) => {
    update((prev) => {
      const tasks = prev.tasks.map((t) =>
        t.id === taskId ? toggleTaskCompletion(t, scheduledDate, selectedDate) : t,
      )
      const rewards = recalculateRewards(tasks, prev.rewards)
      const todayReward = evaluateDayReward(tasks, selectedDate)
      if (todayReward.flowers > 0 && todayReward.reasons.length > 0) {
        const prevFlowers = prev.rewards.dayRewards.find((r) => r.date === selectedDate)?.flowers ?? 0
        if (todayReward.flowers > prevFlowers) {
          setTimeout(() => showToast(`🌸 获得小红花！${todayReward.reasons.join('、')}`), 100)
        }
      }
      return { ...prev, tasks, rewards }
    })
  }

  const handleAdd = () => {
    if (!title.trim() || pickDates.length === 0) return
    update((prev) => {
      const tasks = [
        ...prev.tasks,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          note: note.trim(),
          scheduledDates: [...pickDates].sort(),
          completions: [],
          createdAt: todayStr(),
        },
      ]
      return { ...prev, tasks, rewards: syncRewards(tasks) }
    })
    setTitle('')
    setNote('')
    setPickDates([selectedDate])
    setShowForm(false)
  }

  const handleRemove = (taskId: string) => {
    update((prev) => {
      const tasks = prev.tasks.filter((t) => t.id !== taskId)
      return { ...prev, tasks, rewards: syncRewards(tasks) }
    })
  }

  const togglePickDate = (date: string) => {
    setPickDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort(),
    )
  }

  const monthDates = getMonthDates(calMonth.year, calMonth.month)
  const firstDow = new Date(calMonth.year, calMonth.month, 1).getDay()
  const pad = (firstDow + 6) % 7

  return (
    <>
      {toast && <div className="reward-toast">{toast}</div>}

      <header className="page-header task-header">
        <div>
          <h2>任务中心</h2>
          <p>创建任务、分配到日期、打卡跟踪进度</p>
        </div>
        <div className="flower-badge" title="累计小红花">
          🌸 <span>{data.rewards.totalFlowers}</span>
        </div>
      </header>

      {overdueItems.length > 0 && (
        <div className="card reminder-overdue">
          <div className="card-title">
            ⚠️ 逾期任务
            <span className="badge badge-danger">{overdueItems.length} 项</span>
          </div>
          <ul className="task-list">
            {overdueItems.map((item) => (
              <li key={`${item.task.id}-${item.scheduledDate}`} className="task-item task-overdue">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => handleToggle(item.task.id, item.scheduledDate)}
                />
                <div className="task-item-body">
                  <span className="task-item-title">{item.task.title}</span>
                  <span className="task-item-note">原定 {formatShortDate(item.scheduledDate)}</span>
                </div>
                <button
                  className="btn-icon"
                  style={{ opacity: 1 }}
                  onClick={() => setSelectedDate(item.scheduledDate)}
                  title="跳转到该日"
                >
                  →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="date-nav">
        <button className="date-nav-btn" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}>
          ←
        </button>
        <button
          className={`date-nav-today ${selectedDate === todayStr() ? 'active' : ''}`}
          onClick={() => setSelectedDate(todayStr())}
        >
          {formatShortDate(selectedDate)}
          {selectedDate === todayStr() && ' (今天)'}
        </button>
        <button className="date-nav-btn" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}>
          →
        </button>
      </div>

      <div className="week-strip">
        {weekDates.map((d) => {
          const s = getDayStats(data.tasks, d)
          const hasReward = data.rewards.dayRewards.some((r) => r.date === d)
          return (
            <button
              key={d}
              className={`week-day ${d === selectedDate ? 'selected' : ''} ${d === todayStr() ? 'today' : ''}`}
              onClick={() => setSelectedDate(d)}
            >
              <span className="week-day-label">{weekdayLabel(d)}</span>
              <span className="week-day-num">{d.slice(8)}</span>
              <span className="week-day-lunar">{formatLunarCell(d)}</span>
              {s.total > 0 && (
                <span className="week-day-dots">
                  {s.done}/{s.total}
                </span>
              )}
              {hasReward && <span className="week-day-flower">🌸</span>}
            </button>
          )
        })}
      </div>

      <div className="task-stats-bar">
        <div className="task-stat">
          <span className="task-stat-val">
            {stats.done}/{stats.total}
          </span>
          <span className="task-stat-label">今日完成</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-val">{stats.total ? Math.round(stats.rate * 100) : 0}%</span>
          <span className="task-stat-label">完成度</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-val">{dayReward.flowers}</span>
          <span className="task-stat-label">今日红花</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          {selectedDate === todayStr() ? '今日任务' : `${formatShortDate(selectedDate)} 的任务`}
          <span className="badge">{dayTasks.length} 项</span>
        </div>
        {dayTasks.length === 0 ? (
          <p className="empty-hint">这一天还没有任务，点击下方添加</p>
        ) : (
          <ul className="task-list">
            {dayTasks.map((task) => {
              const done = isCompletedOn(task, selectedDate)
              const early =
                done &&
                task.completions.find((c) => c.scheduledDate === selectedDate)?.completedDate <
                  selectedDate
              return (
                <li key={task.id} className={`task-item ${done ? 'done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => handleToggle(task.id, selectedDate)}
                  />
                  <div className="task-item-body">
                    <span className="task-item-title">{task.title}</span>
                    {task.note && <span className="task-item-note">{task.note}</span>}
                    {early && <span className="task-ahead-tag">超前完成</span>}
                  </div>
                  <button className="btn-icon" onClick={() => handleRemove(task.id)} title="删除">
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {aheadTasks.length > 0 && (
        <div className="card">
          <div className="card-title">
            可提前完成
            <span className="badge">超前有 🌸</span>
          </div>
          <ul className="task-list">
            {aheadTasks.map((task) => {
              const nextDate = task.scheduledDates.filter((d) => d > selectedDate && !isCompletedOn(task, d)).sort()[0]
              if (!nextDate) return null
              return (
                <li key={task.id} className="task-item">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleToggle(task.id, nextDate)}
                  />
                  <div className="task-item-body">
                    <span className="task-item-title">{task.title}</span>
                    <span className="task-item-note">原定 {formatShortDate(nextDate)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {showForm ? (
        <div className="card task-form">
          <div className="card-title">新建任务</div>
          <input
            className="inline-input"
            style={{ width: '100%', marginBottom: 8 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="任务名称"
            autoFocus
          />
          <input
            className="inline-input"
            style={{ width: '100%', marginBottom: 12 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="备注（可选）"
          />
          <div className="card-title" style={{ fontSize: '0.9rem' }}>
            选择日期（可多选）
          </div>
          <div className="mini-cal-nav">
            <button
              onClick={() =>
                setCalMonth((m) => {
                  const d = new Date(m.year, m.month - 1, 1)
                  return { year: d.getFullYear(), month: d.getMonth() }
                })
              }
            >
              ‹
            </button>
            <span>
              {calMonth.year} 年 {calMonth.month + 1} 月
              <span className="cal-lunar-range">
                农历 {formatSolarMonthLunarRange(calMonth.year, calMonth.month)}
              </span>
            </span>
            <button
              onClick={() =>
                setCalMonth((m) => {
                  const d = new Date(m.year, m.month + 1, 1)
                  return { year: d.getFullYear(), month: d.getMonth() }
                })
              }
            >
              ›
            </button>
          </div>
          <div className="mini-cal">
            {['一', '二', '三', '四', '五', '六', '日'].map((w) => (
              <span key={w} className="mini-cal-head">
                {w}
              </span>
            ))}
            {Array.from({ length: pad }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {monthDates.map((d) => (
              <button
                key={d}
                className={`mini-cal-day ${pickDates.includes(d) ? 'picked' : ''} ${d === todayStr() ? 'today' : ''}`}
                onClick={() => togglePickDate(d)}
              >
                <span className="cal-solar">{parseInt(d.slice(8), 10)}</span>
                <span className="cal-lunar">{formatLunarCell(d)}</span>
              </button>
            ))}
          </div>
          {pickDates.length > 0 && (
            <p className="pick-dates-hint">已选 {pickDates.length} 天：{pickDates.map(formatShortDate).join('、')}</p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" onClick={handleAdd}>
              创建任务
            </button>
            <button className="btn-danger" onClick={() => setShowForm(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={() => { setShowForm(true); setPickDates([selectedDate]) }}>
          + 新建任务
        </button>
      )}

      {data.rewards.dayRewards.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-title">红花记录</div>
          <ul className="reward-history">
            {[...data.rewards.dayRewards].reverse().slice(0, 10).map((r) => (
              <li key={r.date}>
                <span className="reward-date">{formatShortDate(r.date)}</span>
                <span className="reward-flowers">{'🌸'.repeat(r.flowers)}</span>
                <span className="reward-reason">{r.reasons.join('、')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
