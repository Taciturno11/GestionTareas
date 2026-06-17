import { format, isValid, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha" }: DatePickerProps) {
  const parsedDate = value ? parseISO(value) : undefined
  const date = isValid(parsedDate) ? parsedDate : undefined

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex w-full items-center justify-start rounded-lg border border-border bg-background px-3 py-2 text-left text-[13px] font-normal outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "d MMM", { locale: es }) : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          weekStartsOn={1}
          defaultMonth={date ?? new Date()}
          selected={date}
          onSelect={(selectedDate) => {
            onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
