import { Select } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface TaskSelectOption {
  value: string
  label: ReactNode
}

interface TaskSelectProps {
  value: string
  options: TaskSelectOption[]
  onChange: (value: string) => void
  placeholder?: ReactNode
  className?: string
  triggerClassName?: string
  triggerStyle?: CSSProperties
  showIcon?: boolean
}

export function TaskSelect({
  value,
  options,
  onChange,
  placeholder,
  className,
  triggerClassName,
  triggerStyle,
  showIcon = true,
}: TaskSelectProps) {
  return (
    <Select.Root
      value={value || null}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") onChange(nextValue)
      }}
      items={options.map(option => ({ value: option.value, label: option.label }))}
    >
      <Select.Trigger
        style={triggerStyle}
        className={cn(
          "group/select inline-flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-[13px] font-medium text-gray-700 shadow-[0_1px_1px_rgba(15,23,42,0.03)] outline-none transition-colors hover:bg-gray-50 focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/15",
          triggerClassName
        )}
      >
        <Select.Value
          placeholder={placeholder}
          className="truncate data-[placeholder]:font-normal data-[placeholder]:text-gray-400"
        />
        {showIcon && (
          <Select.Icon>
            <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400 transition-transform group-data-[popup-open]/select:rotate-180" />
          </Select.Icon>
        )}
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner
          side="bottom"
          align="start"
          sideOffset={2}
          collisionPadding={8}
          alignItemWithTrigger={false}
          className="z-[60]"
        >
          <Select.Popup
            className={cn(
              "max-h-72 min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 text-[13px] text-gray-700 shadow-xl shadow-gray-900/10 outline-none origin-(--transform-origin) data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className
            )}
          >
            <Select.List className="flex flex-col gap-0.5">
              {options.map(option => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 rounded-md px-2.5 py-2 outline-none transition-colors data-[highlighted]:bg-gray-100 data-[selected]:font-semibold"
                >
                  <Select.ItemText className="truncate">{option.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <CheckIcon className="h-3.5 w-3.5 text-indigo-600" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
