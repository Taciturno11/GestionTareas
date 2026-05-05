import type { WorkspacePage } from '@/types/workspace'
import PageContainer from '@/components/PageContainer/PageContainer'

interface BlankPageProps {
  page: WorkspacePage
  onChange: (patch: Partial<WorkspacePage>) => void
}

export default function BlankPage({ page, onChange }: BlankPageProps) {
  return (
    <PageContainer size="wide">
      <input
        value={page.title}
        onChange={event => onChange({ title: event.target.value })}
        placeholder="Pagina sin titulo"
        className="cursor-text-dark mb-8 w-full border-none bg-transparent text-[34px] font-bold tracking-tight text-gray-900 caret-gray-900 outline-none placeholder:text-gray-300"
      />

      <textarea
        value={page.content}
        onChange={event => onChange({ content: event.target.value })}
        placeholder="Escribe algo..."
        className="cursor-text-dark min-h-[520px] w-full resize-none border-none bg-transparent text-[15px] leading-7 text-gray-800 caret-gray-900 outline-none placeholder:text-gray-400"
      />
    </PageContainer>
  )
}
