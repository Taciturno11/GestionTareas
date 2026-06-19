import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import type { UpdatePageRequest } from '@/api/pages.api'
import RouteFallback from '@/components/RouteFallback/RouteFallback'
import {
  discardTextPageDraft,
  readTextPageDraft,
  usePageSaveQueue,
  type TextPageDraft,
} from '@/hooks/usePageSaveQueue'
import { usePage } from '@/hooks/usePages'
import type { WorkspacePage } from '@/types/workspace'

const BoardPage = lazy(() => import('./BoardPage'))
const DatabaseDiagramPage = lazy(() => import('./DatabaseDiagramPage'))
const TextPage = lazy(() => import('./TextPage'))

function PageDraftNotice({
  onRestore,
  onDiscard,
}: {
  onRestore: () => void
  onDiscard: () => void
}) {
  return (
    <div className="mx-auto mt-4 flex w-[calc(100%-48px)] max-w-[900px] items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
      <span>Existe un borrador local basado en una versión anterior de esta hoja.</span>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onDiscard}
          className="rounded-md border border-amber-300 bg-white px-3 py-1 font-semibold"
        >
          Descartar
        </button>
        <button
          type="button"
          onClick={onRestore}
          className="rounded-md bg-amber-600 px-3 py-1 font-semibold text-white"
        >
          Recuperar borrador
        </button>
      </div>
    </div>
  )
}

function LoadedPageView({ initialPage }: { initialPage: WorkspacePage }) {
  const initialDraft = useMemo(
    () => initialPage.type === 'text' || initialPage.type === 'blank'
      ? readTextPageDraft(initialPage.id)
      : null,
    [initialPage.id, initialPage.type],
  )
  const canApplyDraft = initialDraft?.baseUpdatedAt === initialPage.updatedAt
  const [page, setPage] = useState<WorkspacePage>(() => (
    canApplyDraft && initialDraft
      ? { ...initialPage, title: initialDraft.title, content: initialDraft.content }
      : initialPage
  ))
  const [conflictingDraft, setConflictingDraft] = useState<TextPageDraft | null>(
    initialDraft && !canApplyDraft ? initialDraft : null,
  )
  const [editorRevision, setEditorRevision] = useState(0)
  const queuedInitialDraftRef = useRef(false)
  const isTextPage = page.type === 'blank' || page.type === 'text'

  const { queueSave, flush } = usePageSaveQueue({
    page,
    delay: isTextPage ? 800 : 900,
    keepTextDraft: isTextPage,
  })

  useEffect(() => {
    if (!canApplyDraft || !initialDraft || queuedInitialDraftRef.current) return
    queuedInitialDraftRef.current = true
    queueSave({ title: initialDraft.title, content: initialDraft.content })
  }, [canApplyDraft, initialDraft, queueSave])

  function handleChange(patch: UpdatePageRequest) {
    setPage(current => ({ ...current, ...patch }))
    queueSave(patch)
  }

  function restoreDraft() {
    if (!conflictingDraft) return
    const restored = {
      title: conflictingDraft.title,
      content: conflictingDraft.content,
    }
    setPage(current => ({ ...current, ...restored }))
    setConflictingDraft(null)
    setEditorRevision(current => current + 1)
    queueSave(restored)
  }

  function discardDraft() {
    discardTextPageDraft(page.id)
    setConflictingDraft(null)
  }

  const draftNotice = conflictingDraft
    ? <PageDraftNotice onRestore={restoreDraft} onDiscard={discardDraft} />
    : null

  if (isTextPage) {
    return (
      <>
        {draftNotice}
        <Suspense fallback={<RouteFallback />}>
          <TextPage
            key={`${page.id}:${editorRevision}`}
            page={page}
            onChange={handleChange}
            onSaveNow={flush}
          />
        </Suspense>
      </>
    )
  }

  if (page.type === 'board') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <BoardPage page={page} />
      </Suspense>
    )
  }

  if (page.type === 'database') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <DatabaseDiagramPage page={page} onChange={handleChange} />
      </Suspense>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[900px] px-10 py-10">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6472EB]/10 text-[#6472EB]">
        <ClipboardDocumentListIcon className="h-6 w-6" />
      </div>
      <input
        value={page.title}
        onChange={event => handleChange({ title: event.target.value })}
        onBlur={() => void flush()}
        className="mb-3 w-full border-none bg-transparent text-[34px] font-bold tracking-tight text-gray-900 outline-none placeholder:text-gray-300"
      />
      <p className="max-w-[560px] text-[14px] leading-6 text-gray-500">
        Hoja de tareas creada. Siguiente paso: conectar esta hoja con tareas filtradas por `pageId`.
      </p>
      <Link
        to="/tareas"
        className="mt-6 inline-flex rounded-md bg-[#6472EB] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#5360D8]"
      >
        Abrir Mis tareas
      </Link>
    </div>
  )
}

export default function PageView() {
  const { pageId } = useParams()
  const pageQuery = usePage(pageId)

  if (!pageId) return <Navigate to="/" replace />
  if (pageQuery.isLoading) return <RouteFallback />
  if (!pageQuery.data) {
    return (
      <div className="px-10 py-10">
        <h1 className="text-[24px] font-bold text-gray-900">Página no encontrada</h1>
        <p className="mt-2 text-[13px] text-gray-500">Esta hoja no existe o fue eliminada.</p>
      </div>
    )
  }

  return <LoadedPageView key={pageQuery.data.id} initialPage={pageQuery.data} />
}
