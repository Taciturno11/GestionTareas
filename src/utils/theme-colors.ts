import type { CSSProperties } from 'react'

import type { ResolvedTheme } from '@/theme/theme'

export interface DynamicColorPair {
  bg: string
  text: string
}

const DARK_TASK_CARD_COLORS: Record<string, string> = {
  '#FFFFFF': 'var(--kanban-card-white)',
  '#EEF2FF': 'var(--kanban-card-indigo)',
  '#ECFDF5': 'var(--kanban-card-green)',
  '#FEF3C7': 'var(--kanban-card-yellow)',
  '#FEE2E2': 'var(--kanban-card-red)',
  '#F5F3FF': 'var(--kanban-card-purple)',
  '#F1F5F9': 'var(--kanban-card-slate)',
}

function normalizeHex(color: string) {
  return color.trim().toUpperCase()
}

function hexToRgb(color: string) {
  const normalized = normalizeHex(color).replace('#', '')
  if (!/^[0-9A-F]{6}$/.test(normalized)) return null

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function rgba(color: string, alpha: number) {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function luminance(color: string) {
  const rgb = hexToRgb(color)
  if (!rgb) return 0.5

  const channels = [rgb.r, rgb.g, rgb.b].map(channel => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function readableDarkChipText(color: string) {
  return luminance(color) < 0.24 ? 'var(--text-primary)' : color
}

export function getTaskCardBackground(color: string | undefined, resolvedTheme: ResolvedTheme) {
  const fallback = '#FFFFFF'
  const normalized = normalizeHex(color ?? fallback)

  if (resolvedTheme === 'light') return color ?? fallback
  return DARK_TASK_CARD_COLORS[normalized] ?? rgba(normalized, 0.18)
}

export function getTaskCardSwatchBackground(color: string, resolvedTheme: ResolvedTheme) {
  return getTaskCardBackground(color, resolvedTheme)
}

export function getDynamicChipStyle(
  color: string,
  resolvedTheme: ResolvedTheme,
  options: { selected?: boolean; bg?: string } = {},
): CSSProperties {
  if (resolvedTheme === 'light') {
    return {
      background: options.bg ?? `${color}14`,
      borderColor: `${color}${options.selected ? '66' : '33'}`,
      color,
    }
  }

  return {
    background: rgba(color, options.selected ? 0.24 : 0.16),
    borderColor: rgba(color, options.selected ? 0.52 : 0.34),
    color: readableDarkChipText(color),
  }
}

export function getSoftDynamicPair(pair: DynamicColorPair, resolvedTheme: ResolvedTheme): DynamicColorPair {
  if (resolvedTheme === 'light') return pair

  return {
    bg: rgba(pair.text, 0.16),
    text: readableDarkChipText(pair.text),
  }
}
