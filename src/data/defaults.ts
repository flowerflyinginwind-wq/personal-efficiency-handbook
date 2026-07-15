import type { HandbookData } from './types'

const uid = () => crypto.randomUUID()

const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

export const defaultData: HandbookData = {
  tasks: [
    {
      id: uid(),
      title: '完成效率手册第一次任务打卡',
      note: '试试勾选完成，获得小红花',
      scheduledDates: [today],
      completions: [],
      createdAt: today,
    },
    {
      id: uid(),
      title: '规划明日三件要事',
      note: '',
      scheduledDates: [today, tomorrow],
      completions: [],
      createdAt: today,
    },
  ],
  rewards: { totalFlowers: 0, dayRewards: [] },
  reminders: {
    enabled: true,
    time: '09:00',
    remindOverdue: true,
    specialAdvanceDays: 0,
    lastNotifiedDate: null,
  },
  specialDates: [
    {
      id: uid(),
      title: '示例纪念日',
      message: '今天是特别的一天，记得给重要的人发条消息。',
      monthDay: today.slice(5, 10),
      yearly: true,
    },
  ],
  routines: {
    morning: {
      id: 'morning',
      title: '晨间例行',
      items: [
        { id: uid(), text: '喝水、简单拉伸', done: false },
        { id: uid(), text: '查看今日日程与优先级', done: false },
        { id: uid(), text: '处理收件箱（邮件/消息 ≤15 分钟）', done: false },
        { id: uid(), text: '确定今日最重要的 1-3 件事', done: false },
        { id: uid(), text: '开始第一个深度工作块', done: false },
      ],
    },
    evening: {
      id: 'evening',
      title: '晚间复盘',
      items: [
        { id: uid(), text: '回顾今日完成情况', done: false },
        { id: uid(), text: '记录 1 件做得好的事', done: false },
        { id: uid(), text: '记录 1 件可改进的事', done: false },
        { id: uid(), text: '规划明日首要任务', done: false },
        { id: uid(), text: '清空工作区、关闭通知', done: false },
      ],
    },
  },
  goals: [
    {
      id: uid(),
      title: '提升深度工作能力',
      period: '本季度',
      keyResults: [
        { id: uid(), text: '每天完成至少 2 小时无干扰深度工作', done: false },
        { id: uid(), text: '每周读完 1 本专业/领域书籍章节', done: false },
        { id: uid(), text: '建立并坚持晨间例行 21 天', done: false },
      ],
    },
    {
      id: uid(),
      title: '健康与精力管理',
      period: '本月',
      keyResults: [
        { id: uid(), text: '每周运动 3 次以上', done: false },
        { id: uid(), text: '23:30 前入睡 ≥5 天/周', done: false },
        { id: uid(), text: '每日饮水 2L', done: false },
      ],
    },
  ],
  habits: [
    { id: uid(), name: '早起', icon: '🌅', completedDates: [] },
    { id: uid(), name: '运动', icon: '🏃', completedDates: [] },
    { id: uid(), name: '阅读', icon: '📖', completedDates: [] },
    { id: uid(), name: '冥想', icon: '🧘', completedDates: [] },
    { id: uid(), name: '写日记', icon: '✍️', completedDates: [] },
  ],
  tools: [
    { id: uid(), name: 'Cursor', category: '开发', shortcut: 'Ctrl+K', note: 'AI 辅助编程' },
    { id: uid(), name: '全局搜索', category: '系统', shortcut: 'Win', note: '快速启动应用' },
    { id: uid(), name: '截图', category: '系统', shortcut: 'Win+Shift+S', note: '区域截图' },
    { id: uid(), name: '虚拟桌面', category: '系统', shortcut: 'Win+Ctrl+D', note: '新建桌面' },
    { id: uid(), name: '任务切换', category: '系统', shortcut: 'Alt+Tab', note: '窗口切换' },
    { id: uid(), name: '终端清屏', category: '开发', shortcut: 'Ctrl+L', note: '清空终端' },
    { id: uid(), name: '保存', category: '通用', shortcut: 'Ctrl+S', note: '随时保存' },
    { id: uid(), name: '撤销', category: '通用', shortcut: 'Ctrl+Z', note: '撤销操作' },
  ],
  sops: [
    {
      id: uid(),
      title: '深度工作启动流程',
      category: '工作',
      steps: [
        '关闭所有通知和非必要应用',
        '明确本次工作块的单一目标',
        '设置 25-90 分钟计时器',
        '手机放到视线外',
        '开始工作，中间不切换任务',
        '结束后记录产出与下一步',
      ],
    },
    {
      id: uid(),
      title: '学习新知识流程',
      category: '学习',
      steps: [
        '明确学习目标（能回答什么问题）',
        '快速浏览目录/大纲建立框架',
        '主动阅读并做笔记（费曼法）',
        '尝试用自己的话复述核心概念',
        '找 1-2 个实践场景应用',
        '间隔复习巩固',
      ],
    },
    {
      id: uid(),
      title: '会议前准备',
      category: '协作',
      steps: [
        '确认会议目的和自己的角色',
        '准备 1-3 个关键问题或观点',
        '提前 2 分钟进入会议室/链接',
        '会议中记录 action items',
        '会后 10 分钟内发送纪要',
      ],
    },
    {
      id: uid(),
      title: '写作发布流程',
      category: '创作',
      steps: [
        '确定主题与目标读者',
        '列出大纲（3-5 个要点）',
        '快速写出初稿，不追求完美',
        '休息 15 分钟后回来修改',
        '检查逻辑、删减冗余',
        '发布并收集反馈',
      ],
    },
  ],
  reviews: {
    weekly: [
      {
        id: uid(),
        title: '本周回顾',
        prompts: [
          { id: uid(), question: '本周最大的成就是什么？', answer: '' },
          { id: uid(), question: '哪些事情消耗了过多精力？', answer: '' },
          { id: uid(), question: '目标进展如何？有无偏离？', answer: '' },
          { id: uid(), question: '下周最重要的 3 件事是什么？', answer: '' },
        ],
      },
      {
        id: uid(),
        title: '习惯与健康',
        prompts: [
          { id: uid(), question: '习惯打卡完成率如何？', answer: '' },
          { id: uid(), question: '睡眠、运动、饮食状况？', answer: '' },
          { id: uid(), question: '需要调整的习惯是什么？', answer: '' },
        ],
      },
    ],
    monthly: [
      {
        id: uid(),
        title: '月度总结',
        prompts: [
          { id: uid(), question: '本月最自豪的 3 件事？', answer: '' },
          { id: uid(), question: '本月最大的教训？', answer: '' },
          { id: uid(), question: 'OKR 完成情况自评（1-10）？', answer: '' },
          { id: uid(), question: '下月核心目标？', answer: '' },
        ],
      },
      {
        id: uid(),
        title: '系统优化',
        prompts: [
          { id: uid(), question: '哪些流程/SOP 需要更新？', answer: '' },
          { id: uid(), question: '工具栈是否需要调整？', answer: '' },
          { id: uid(), question: '想尝试的新方法或习惯？', answer: '' },
        ],
      },
    ],
  },
}
