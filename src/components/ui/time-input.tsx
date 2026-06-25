import { cn } from '@/lib/utils'

interface TimeInputProps {
  value?: string
  onChange: (time: string) => void
  placeholder?: string
  disabled?: boolean
  onBlur?: () => void
  className?: string
}

function normalizeTime(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const compact = trimmed.replace(/[^\d]/g, '')
  if (/^\d{3,4}$/.test(compact)) {
    const padded = compact.padStart(4, '0')
    return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`
  }

  return trimmed
}

function isValidTime(value: string) {
  return !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function TimeInput({
  value = '',
  onChange,
  placeholder = 'HH:mm',
  disabled = false,
  onBlur,
  className,
}: TimeInputProps) {
  const normalizedValue = normalizeTime(value)
  const isInvalid = Boolean(normalizedValue) && !isValidTime(normalizedValue)

  function handleBlur() {
    const normalized = normalizeTime(value)
    if (normalized !== value) onChange(normalized)
    onBlur?.()
  }

  return (
    <input
      value={value}
      disabled={disabled}
      inputMode="numeric"
      maxLength={5}
      onChange={event => {
        const nextValue = event.target.value.replace(/[^\d:]/g, '').slice(0, 5)
        onChange(nextValue)
      }}
      onBlur={handleBlur}
      placeholder={placeholder}
      aria-invalid={isInvalid}
      title={isInvalid ? 'Usa el formato HH:mm. Ejemplo: 08:30' : undefined}
      className={cn(
        'cursor-text-dark h-10 w-full rounded-lg border border-transparent bg-transparent px-2 text-[13px] text-gray-700 caret-gray-900 outline-none transition placeholder:text-gray-300 hover:border-gray-200 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-200/70 disabled:cursor-default disabled:text-gray-500',
        isInvalid && 'border-red-200 bg-red-50 text-red-700 focus:border-red-300 focus:ring-red-100',
        className,
      )}
    />
  )
}
