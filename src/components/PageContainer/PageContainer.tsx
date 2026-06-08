import type { ReactNode } from 'react'

type PageContainerSize = 'default' | 'wide' | 'narrow' | 'fluid'
type PageContainerAlign = 'center' | 'start'

interface PageContainerProps {
  children: ReactNode
  size?: PageContainerSize
  align?: PageContainerAlign
  className?: string
}

const SIZE_CLASSES: Record<PageContainerSize, string> = {
  default: 'max-w-[1200px]',
  wide: 'max-w-[1400px]',
  narrow: 'max-w-[900px]',
  fluid: 'max-w-none',
}

const ALIGN_CLASSES: Record<PageContainerAlign, string> = {
  center: 'mx-auto',
  start: 'mr-auto',
}

export default function PageContainer({
  children,
  size = 'default',
  align = 'center',
  className = '',
}: PageContainerProps) {
  return (
    <div className={`w-full px-4 py-8 ${SIZE_CLASSES[size]} ${ALIGN_CLASSES[align]} ${className}`}>
      {children}
    </div>
  )
}
