import { format, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function parseTaskDate(value: string) {
  const date = parseISO(value)
  return isValid(date) ? date : null
}

export function formatShortDate(dateStr: string) {
  if (!dateStr || dateStr === '—') return '—'
  const date = parseTaskDate(dateStr)
  if (!date) return dateStr
  return format(date, 'd MMM', { locale: es })
}

export function formatTaskDateRange(startDate: string, endDate: string, separator = '→') {
  const hasStart = Boolean(startDate && startDate !== '—')
  const hasEnd = Boolean(endDate && endDate !== '—')

  if (!hasStart && !hasEnd) return ''
  if (hasStart && (!hasEnd || startDate === endDate)) return formatShortDate(startDate)
  if (!hasStart && hasEnd) return formatShortDate(endDate)

  return `${formatShortDate(startDate)} ${separator} ${formatShortDate(endDate)}`
}
