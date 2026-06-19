import { useCallback, useEffect, useRef } from 'react'

import { pagesApi, type UpdatePageRequest } from '@/api/pages.api'
import { usePageCache } from '@/hooks/usePages'
import {
  publishPageSaveStatus,
  type PageSaveStatus,
} from '@/services/page-save-status'
import type { WorkspacePage, WorkspacePageSummary } from '@/types/workspace'

export interface TextPageDraft {
  title: string
  content: string
  savedAt: string
  baseUpdatedAt: string
}

interface UsePageSaveQueueOptions {
  page: WorkspacePage
  delay: number
  keepTextDraft?: boolean
  onStatusChange?: (status: PageSaveStatus) => void
  onSaved?: (summary: WorkspacePageSummary, patch: UpdatePageRequest) => void
}

function draftKey(pageId: string) {
  return `gt_text_draft:${pageId}`
}

export function readTextPageDraft(pageId: string): TextPageDraft | null {
  const saved = localStorage.getItem(draftKey(pageId))
  if (!saved) return null

  try {
    return JSON.parse(saved) as TextPageDraft
  } catch {
    localStorage.removeItem(draftKey(pageId))
    return null
  }
}

export function discardTextPageDraft(pageId: string) {
  localStorage.removeItem(draftKey(pageId))
}

export function usePageSaveQueue({
  page,
  delay,
  keepTextDraft = false,
  onStatusChange,
  onSaved,
}: UsePageSaveQueueOptions) {
  const { updateDetail, updateSummary } = usePageCache()
  const pageRef = useRef(page)
  const baseUpdatedAtRef = useRef(page.updatedAt)
  const pendingRef = useRef<UpdatePageRequest>({})
  const timerRef = useRef<number | undefined>(undefined)
  const inFlightRef = useRef(false)
  const flushAgainRef = useRef(false)
  const mountedRef = useRef(true)

  pageRef.current = page

  const setStatus = useCallback((status: PageSaveStatus) => {
    publishPageSaveStatus({ pageId: pageRef.current.id, status })
    onStatusChange?.(status)
  }, [onStatusChange])

  const persistDraft = useCallback((patch: UpdatePageRequest) => {
    if (!keepTextDraft) return
    const current = pageRef.current
    localStorage.setItem(draftKey(current.id), JSON.stringify({
      title: patch.title ?? current.title,
      content: patch.content ?? current.content,
      savedAt: new Date().toISOString(),
      baseUpdatedAt: baseUpdatedAtRef.current,
    } satisfies TextPageDraft))
  }, [keepTextDraft])

  const flush = useCallback(async () => {
    window.clearTimeout(timerRef.current)

    if (inFlightRef.current) {
      flushAgainRef.current = true
      return
    }

    const keys = Object.keys(pendingRef.current)
    if (!keys.length) return

    const patch = pendingRef.current
    pendingRef.current = {}
    if ('title' in patch && !patch.title?.trim()) patch.title = 'Página sin título'

    inFlightRef.current = true
    setStatus('saving')
    let savedSuccessfully = false

    try {
      const summary = await pagesApi.update(pageRef.current.id, patch)
      baseUpdatedAtRef.current = summary.updatedAt
      updateSummary(summary)
      updateDetail(summary.id, { ...patch, ...summary })
      if (mountedRef.current) onSaved?.(summary, patch)

      if (!Object.keys(pendingRef.current).length && keepTextDraft) {
        discardTextPageDraft(summary.id)
      } else if (keepTextDraft) {
        persistDraft(pendingRef.current)
      }
      setStatus(Object.keys(pendingRef.current).length ? 'dirty' : 'saved')
      savedSuccessfully = true
    } catch (error) {
      pendingRef.current = { ...patch, ...pendingRef.current }
      persistDraft(pendingRef.current)
      setStatus('error')
      console.error('No se pudo guardar la página.', error)
    } finally {
      inFlightRef.current = false
      if (
        savedSuccessfully
        && (flushAgainRef.current || Object.keys(pendingRef.current).length)
      ) {
        flushAgainRef.current = false
        void flush()
      }
    }
  }, [
    keepTextDraft,
    onSaved,
    persistDraft,
    setStatus,
    updateDetail,
    updateSummary,
  ])

  const queueSave = useCallback((patch: UpdatePageRequest) => {
    pendingRef.current = { ...pendingRef.current, ...patch }
    persistDraft(pendingRef.current)
    setStatus('dirty')
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      void flush()
    }, delay)
  }, [delay, flush, persistDraft, setStatus])

  useEffect(() => {
    mountedRef.current = true

    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') void flush()
    }
    const flushBeforeLeaving = () => {
      void flush()
    }

    document.addEventListener('visibilitychange', flushWhenHidden)
    window.addEventListener('pagehide', flushBeforeLeaving)

    return () => {
      mountedRef.current = false
      window.clearTimeout(timerRef.current)
      document.removeEventListener('visibilitychange', flushWhenHidden)
      window.removeEventListener('pagehide', flushBeforeLeaving)
      void flush()
    }
  }, [flush])

  return { queueSave, flush }
}
