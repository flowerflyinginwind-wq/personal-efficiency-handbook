import { useState } from 'react'
import type { PageId } from './types'
import type { HandbookData } from './types'
import { useHandbook } from './hooks/useHandbook'
import { useReminders } from './hooks/useReminders'
import { Tasks } from './pages/Tasks'
import { SpecialDates } from './pages/SpecialDates'
import { Dashboard } from './pages/Dashboard'
import { Daily } from './pages/Daily'
import { Goals } from './pages/Goals'
import { Habits } from './pages/Habits'
import { Tools } from './pages/Tools'
import { SOP } from './pages/SOP'
import { Review } from './pages/Review'
import './App.css'

const NAV: { id: PageId; label: string; icon: string }[] = [
  { id: 'tasks', label: '任务中心', icon: '📌' },
  { id: 'special', label: '特殊日子', icon: '🎂' },
  { id: 'dashboard', label: '总览', icon: '📊' },
  { id: 'daily', label: '每日流程', icon: '☀️' },
  { id: 'goals', label: '目标 OKR', icon: '🎯' },
  { id: 'habits', label: '习惯追踪', icon: '✅' },
  { id: 'tools', label: '工具速查', icon: '⌨️' },
  { id: 'sop', label: '个人 SOP', icon: '📋' },
  { id: 'review', label: '周月复盘', icon: '📝' },
]

export default function App() {
  const [page, setPage] = useState<PageId>('tasks')
  const { data, update, reset } = useHandbook()
  const { overdue, specialToday, alertCount } = useReminders(data, update)

  const handleReset = () => {
    if (confirm('确定要恢复默认数据吗？所有自定义内容将丢失。')) {
      reset()
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>效率手册</h1>
          <p>Personal Efficiency Handbook</p>
        </div>
        <ul className="nav-list">
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'special' && specialToday.length > 0 && (
                  <span className="nav-badge">{specialToday.length}</span>
                )}
                {item.id === 'tasks' && overdue.length > 0 && (
                  <span className="nav-badge">{overdue.length}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button className="btn-reset" onClick={handleReset}>
            恢复默认数据
          </button>
        </div>
      </aside>
      <main className="main">
        {alertCount > 0 && page !== 'tasks' && page !== 'special' && (
          <button className="reminder-bar" onClick={() => setPage('special')}>
            🔔
            {specialToday.length > 0 && `今天 ${specialToday.map((s) => s.title).join('、')}`}
            {specialToday.length > 0 && overdue.length > 0 && ' · '}
            {overdue.length > 0 && `逾期 ${overdue.length} 项任务`}
          </button>
        )}
        <PageRouter page={page} data={data} update={update} onNavigate={setPage} />
      </main>
    </div>
  )
}

function PageRouter({
  page,
  data,
  update,
  onNavigate,
}: {
  page: PageId
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
  onNavigate: (p: PageId) => void
}) {
  switch (page) {
    case 'tasks':
      return <Tasks data={data} update={update} />
    case 'special':
      return <SpecialDates data={data} update={update} />
    case 'dashboard':
      return <Dashboard data={data} onNavigate={onNavigate} />
    case 'daily':
      return <Daily data={data} update={update} />
    case 'goals':
      return <Goals data={data} update={update} />
    case 'habits':
      return <Habits data={data} update={update} />
    case 'tools':
      return <Tools data={data} update={update} />
    case 'sop':
      return <SOP data={data} update={update} />
    case 'review':
      return <Review data={data} update={update} />
  }
}
