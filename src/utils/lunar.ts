export interface LunarDate {
  year: number
  month: number
  day: number
  isLeap: boolean
}

const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520,
]

const MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]

function parseYmd(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { y, m, d }
}

function leapMonth(year: number): number {
  return LUNAR_INFO[year - 1900] & 0xf
}

function leapDays(year: number): number {
  if (leapMonth(year)) {
    return LUNAR_INFO[year - 1900] & 0x10000 ? 30 : 29
  }
  return 0
}

function lunarYearDays(year: number): number {
  let sum = 348
  const info = LUNAR_INFO[year - 1900]
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += info & i ? 1 : 0
  }
  return sum + leapDays(year)
}

function lunarMonthDays(year: number, month: number): number {
  return LUNAR_INFO[year - 1900] & (0x10000 >> month) ? 30 : 29
}

export function solarToLunar(dateStr: string): LunarDate {
  const { y, m, d } = parseYmd(dateStr)
  const base = new Date(1900, 0, 31)
  const obj = new Date(y, m - 1, d)
  let offset = Math.floor((obj.getTime() - base.getTime()) / 86400000)

  let lunarYear = 1900
  let daysInYear = lunarYearDays(lunarYear)
  while (offset >= daysInYear && lunarYear < 2100) {
    offset -= daysInYear
    lunarYear++
    daysInYear = lunarYearDays(lunarYear)
  }
  if (lunarYear >= 2100) {
    return { year: 2099, month: 12, day: 30, isLeap: false }
  }

  const leap = leapMonth(lunarYear)
  let isLeap = false
  let lunarMonth = 1

  for (let i = 1; i <= 12 && offset >= 0; i++) {
    let daysInMonth: number
    if (leap > 0 && i === leap + 1 && !isLeap) {
      daysInMonth = leapDays(lunarYear)
      if (offset < daysInMonth) {
        isLeap = true
        lunarMonth = i - 1
        break
      }
      offset -= daysInMonth
      isLeap = false
    }
    daysInMonth = lunarMonthDays(lunarYear, i)
    if (offset < daysInMonth) {
      lunarMonth = i
      break
    }
    offset -= daysInMonth
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: offset + 1,
    isLeap,
  }
}

function lunarMonthName(month: number, isLeap: boolean): string {
  return `${isLeap ? '闰' : ''}${MONTH_NAMES[month - 1]}月`
}

function lunarDayName(day: number): string {
  return DAY_NAMES[day - 1] ?? `${day}日`
}

/** 日历格内短标签：初一显示月份，其余显示日名 */
export function formatLunarCell(dateStr: string): string {
  const lunar = solarToLunar(dateStr)
  if (lunar.day === 1) return lunarMonthName(lunar.month, lunar.isLeap)
  return lunarDayName(lunar.day)
}

/** 完整农历：农历六月初一 */
export function formatLunarFull(dateStr: string): string {
  const lunar = solarToLunar(dateStr)
  return `农历${lunarMonthName(lunar.month, lunar.isLeap)}${lunarDayName(lunar.day)}`
}

/** 公历+农历：7月15日 周二 · 农历六月廿一 */
export function formatDateWithLunar(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const solar = d.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  return `${solar} · ${formatLunarFull(dateStr)}`
}

/** 阳历某月涉及的农历月份范围，用于月历标题 */
export function formatSolarMonthLunarRange(year: number, month: number): string {
  const first = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const last = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const l1 = solarToLunar(first)
  const l2 = solarToLunar(last)
  const m1 = lunarMonthName(l1.month, l1.isLeap)
  const m2 = lunarMonthName(l2.month, l2.isLeap)
  return m1 === m2 ? m1 : `${m1}～${m2}`
}

const SOLAR_HOLIDAYS: Record<string, string> = {
  '01-01': '元旦',
  '05-01': '劳动',
  '10-01': '国庆',
}

const LUNAR_HOLIDAYS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵',
  '2-2': '龙头',
  '5-5': '端午',
  '7-7': '七夕',
  '8-15': '中秋',
  '9-9': '重阳',
  '12-8': '腊八',
}

export function getHoliday(dateStr: string): string | null {
  const solar = SOLAR_HOLIDAYS[dateStr.slice(5, 10)]
  if (solar) return solar
  const lunar = solarToLunar(dateStr)
  if (lunar.isLeap) return null
  return LUNAR_HOLIDAYS[`${lunar.month}-${lunar.day}`] ?? null
}

export function lunarMonthDayFromSolar(dateStr: string): string {
  const lunar = solarToLunar(dateStr)
  return `${String(lunar.month).padStart(2, '0')}-${String(lunar.day).padStart(2, '0')}`
}

export function formatLunarMonthDay(monthDay: string): string {
  const [lm, ld] = monthDay.split('-').map(Number)
  return `${lunarMonthName(lm, false)}${lunarDayName(ld)}`
}

export function findSolarForLunar(lm: number, ld: number, year: number): string | null {
  for (let m = 0; m < 12; m++) {
    const dim = new Date(year, m + 1, 0).getDate()
    for (let d = 1; d <= dim; d++) {
      const ds = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const l = solarToLunar(ds)
      if (l.month === lm && l.day === ld && !l.isLeap) return ds
    }
  }
  return null
}
