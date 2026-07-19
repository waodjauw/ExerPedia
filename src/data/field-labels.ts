import type { Locale } from '@/types/exercise'

export const bodyParts = [
  'chest',
  'back',
  'shoulders',
  'upper arms',
  'waist',
  'upper legs',
] as const

const zh: Record<string, string> = {
  chest: '胸部',
  back: '背部',
  shoulders: '肩部',
  'upper arms': '手臂',
  waist: '腰腹',
  'upper legs': '腿部',
  barbell: '杠铃',
  dumbbell: '哑铃',
  cable: '绳索',
  'body weight': '自重',
  'leverage machine': '固定器械',
  'sled machine': '腿举机',
  pectorals: '胸大肌',
  lats: '背阔肌',
  'upper back': '上背部',
  delts: '三角肌',
  biceps: '肱二头肌',
  triceps: '肱三头肌',
  abs: '腹肌',
  glutes: '臀肌',
  quads: '股四头肌',
  hamstrings: '腘绳肌',
  'hip flexors': '髋屈肌',
  'lower back': '下背部',
  forearms: '前臂',
  traps: '斜方肌',
  calves: '小腿肌群',
}

export function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function fieldLabel(value: string, locale: Locale) {
  return locale === 'zh-CN' ? (zh[value] ?? value) : titleCase(value)
}
