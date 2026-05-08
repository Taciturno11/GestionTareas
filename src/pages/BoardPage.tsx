import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

import type { WorkspacePage } from '@/types/workspace'

interface BoardPageProps {
  page: WorkspacePage
  onChange: (patch: Partial<WorkspacePage>) => void
}

export default function BoardPage({ page }: BoardPageProps) {
  return (
    <div className="h-full min-h-0">
      <Tldraw persistenceKey={`workspace-page-${page.id}`} />
    </div>
  )
}
