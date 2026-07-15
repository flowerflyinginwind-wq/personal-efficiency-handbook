import { useState } from 'react'
import type { HandbookData, SpecialDate } from '../types'
import {
  formatSpecialDateLabel,
  getSpecialDatesForDate,
  getTodaySpecialDates,
  parseDateInput,
  requestNotificationPermission,
  sendTaskNotification,
  buildNotificationBody,
  getOverdueTargets,
  hasAnythingToNotify,
} from '../utils/reminders'
import { getMonthDates, formatShortDate } from '../utils/tasks'
import { formatLunarCell, formatSolarMonthLunarRange } from '../utils/lunar'
import { todayStr } from '../hooks/useHandbook'

const PRESETS = ['生日', '纪念日', '节日', '其他']

export function SpecialDates({
  data,
  update,
}: {
  data: HandbookData
  update: (fn: (prev: HandbookData) => HandbookData) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [date, setDate] = useState(todayStr())
  const [yearly, setYearly] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [notifStatus, setNotifStatus] = useState(
    () => ('Notification' in window ? Notification.permission : 'denied'),
  )
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const today = todayStr()
  const todaySpecial = getSpecialDatesForDate(data.specialDates, today)
  const upcomingSpecial = getTodaySpecialDates(data.specialDates, data.reminders, today).filter(
    (sd) => !matchesToday(sd, today),
  )

  function matchesToday(sd: SpecialDate, d: string) {
    return getSpecialDatesForDate([sd], d).length > 0
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const updateReminders = (patch: Partial<HandbookData['reminders']>) => {
    update((prev) => ({
      ...prev,
      reminders: { ...prev.reminders, ...patch },
    }))
  }

  const handleAdd = () => {
    if (!title.trim() || !date) return
    const { monthDay, year } = parseDateInput(date)
    update((prev) => ({
      ...prev,
      specialDates: [
        ...prev.specialDates,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          message: message.trim(),
          monthDay,
          yearly,
          year: yearly ? undefined : year,
        },
      ],
    }))
    setTitle('')
    setMessage('')
    setShowForm(false)
  }

  const handleRemove = (id: string) => {
    update((prev) => ({
      ...prev,
      specialDates: prev.specialDates.filter((s) => s.id !== id),
    }))
  }

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission()
    setNotifStatus(perm)
    if (perm === 'granted') {
      updateReminders({ enabled: true })
      showToast('已开启浏览器通知')
    }
  }

  const handleTestNotify = () => {
    const overdue = getOverdueTargets(data.tasks, data.reminders, today)
    const special = getTodaySpecialDates(data.specialDates, data.reminders, today)
    if (!hasAnythingToNotify(overdue, special)) {
      showToast('今天没有特殊日子，也没有逾期任务')
      return
    }
    const body = buildNotificationBody(overdue, special, today)
    if (sendTaskNotification('🔔 提醒（测试）', body)) {
      showToast('已发送测试通知')
    } else {
      showToast('请先允许浏览器通知权限')
    }
  }

  const applyPreset = (preset: string) => {
    if (preset !== '其他') setTitle(preset)
  }

  const monthDates = getMonthDates(calMonth.year, calMonth.month)
  const firstDow = new Date(calMonth.year, calMonth.month, 1).getDay()
  const pad = (firstDow + 6) % 7

  const openForm = () => {
    const d = new Date(`${date}T00:00:00`)
    setCalMonth({ year: d.getFullYear(), month: d.getMonth() })
    setShowForm(true)
  }

  return (
    <>
      {toast && <div className="reward-toast">{toast}</div>}

      <header className="page-header">
        <h2>特殊日子</h2>
        <p>生日、纪念日等重要日期，附带一段想说的话</p>
      </header>

      <div className="reminder-settings-bar">
        <button
          className={`reminder-toggle ${data.reminders.enabled ? 'on' : ''}`}
          onClick={() => updateReminders({ enabled: !data.reminders.enabled })}
        >
          🔔 日期提醒 {data.reminders.enabled ? '开' : '关'}
        </button>
        <button className="reminder-settings-btn" onClick={() => setShowSettings(!showSettings)}>
          提醒设置
        </button>
        {notifStatus !== 'granted' && (
          <button
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={handleEnableNotifications}
          >
            允许通知
          </button>
        )}
      </div>

      {showSettings && (
        <div className="card reminder-settings">
          <div className="card-title">提醒设置</div>
          <div className="setting-row">
            <label>每日提醒时间</label>
            <input
              type="time"
              value={data.reminders.time}
              onChange={(e) => updateReminders({ time: e.target.value, lastNotifiedDate: null })}
            />
          </div>
          <div className="setting-row">
            <label>
              <input
                type="checkbox"
                checked={data.reminders.remindOverdue}
                onChange={(e) => updateReminders({ remindOverdue: e.target.checked })}
              />
              同时提醒逾期任务
            </label>
          </div>
          <div className="setting-row">
            <label>特殊日子提前</label>
            <select
              value={data.reminders.specialAdvanceDays}
              onChange={(e) =>
                updateReminders({ specialAdvanceDays: Number(e.target.value) as 0 | 1 })
              }
            >
              <option value={0}>仅在当天</option>
              <option value={1}>提前 1 天</option>
            </select>
          </div>
          <p className="setting-hint">
            到达设定时间后，推送今天的特殊日子（含寄语）以及逾期任务。不含普通任务预告。
          </p>
          <button className="btn-add" onClick={handleTestNotify}>
            发送测试提醒
          </button>
        </div>
      )}

      {todaySpecial.length > 0 && (
        <div className="card special-today">
          <div className="card-title">🎉 今天是</div>
          {todaySpecial.map((sd) => (
            <div key={sd.id} className="special-today-item">
              <div className="special-today-title">{sd.title}</div>
              {sd.message && <p className="special-today-message">{sd.message}</p>}
            </div>
          ))}
        </div>
      )}

      {upcomingSpecial.length > 0 && (
        <div className="card">
          <div className="card-title">明天预告</div>
          {upcomingSpecial.map((sd) => (
            <div key={sd.id} className="special-preview-item">
              <span className="special-preview-title">{sd.title}</span>
              {sd.message && <span className="special-preview-msg">{sd.message}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-title">
          全部特殊日子
          <span className="badge">{data.specialDates.length} 个</span>
        </div>
        {data.specialDates.length === 0 ? (
          <p className="empty-hint">还没有特殊日子，添加生日或纪念日吧</p>
        ) : (
          <ul className="special-list">
            {[...data.specialDates]
              .sort((a, b) => a.monthDay.localeCompare(b.monthDay))
              .map((sd) => (
                <li key={sd.id} className="special-list-item">
                  <div className="special-list-icon">{sd.yearly ? '🎂' : '📅'}</div>
                  <div className="special-list-body">
                    <div className="special-list-title">{sd.title}</div>
                    <div className="special-list-date">{formatSpecialDateLabel(sd)}</div>
                    {sd.message && <p className="special-list-message">{sd.message}</p>}
                  </div>
                  <button className="btn-icon" style={{ opacity: 1 }} onClick={() => handleRemove(sd.id)}>
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <div className="card-title">添加特殊日子</div>
          <div className="preset-chips">
            {PRESETS.map((p) => (
              <button key={p} className="preset-chip" onClick={() => applyPreset(p)}>
                {p}
              </button>
            ))}
          </div>
          <input
            className="inline-input"
            style={{ marginBottom: 8 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="名称，如：妈妈生日"
            autoFocus
          />
          <div className="card-title" style={{ fontSize: '0.9rem' }}>
            选择日期
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
                className={`mini-cal-day ${d === date ? 'picked' : ''} ${d === todayStr() ? 'today' : ''}`}
                onClick={() => setDate(d)}
              >
                <span className="cal-solar">{parseInt(d.slice(8), 10)}</span>
                <span className="cal-lunar">{formatLunarCell(d)}</span>
              </button>
            ))}
          </div>
          <p className="pick-dates-hint">已选：{formatShortDate(date)}</p>
          <label className="setting-row" style={{ border: 'none', padding: '8px 0' }}>
            <input type="checkbox" checked={yearly} onChange={(e) => setYearly(e.target.checked)} />
            每年重复（如生日、纪念日）
          </label>
          <textarea
            className="special-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="写一段想说的话，提醒时会一起显示…"
            rows={3}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" onClick={handleAdd}>
              保存
            </button>
            <button className="btn-danger" onClick={() => setShowForm(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-add" onClick={openForm}>
          + 添加特殊日子
        </button>
      )}
    </>
  )
}
