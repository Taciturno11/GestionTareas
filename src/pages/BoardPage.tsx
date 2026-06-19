import { useMemo } from 'react'
import {
  Tldraw,
  getSnapshot,
  inlineBase64AssetStore,
  type Editor,
  type TLAssetStore,
  type TLEditorSnapshot,
  type TLStoreSnapshot,
} from 'tldraw'
import 'tldraw/tldraw.css'

import { usePageSaveQueue } from '@/hooks/usePageSaveQueue'
import { getTldrawLicenseKey } from '@/lib/runtimeConfig'
import type { WorkspacePage } from '@/types/workspace'

const BOARD_SAVE_DEBOUNCE_MS = 1500

const boardAssetStore: TLAssetStore = {
  ...inlineBase64AssetStore,
  resolve(asset) {
    const src = asset.props.src
    if (!src || src.startsWith('asset:')) return null
    return src
  },
}

interface BoardPageProps {
  page: WorkspacePage
}

interface TldrawIndexedDbDump {
  name?: string
  version?: number
  stores?: Record<string, { records?: unknown[] } | unknown[]>
}

interface TldrawPageBackup {
  storage?: string
  dump?: TldrawIndexedDbDump
}

interface TldrawSnapshotContent {
  storage?: string
  snapshot?: TLEditorSnapshot | Partial<TLEditorSnapshot> | TLStoreSnapshot
}

type BoardSnapshot = TLEditorSnapshot | TLStoreSnapshot

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getStoreRecords(dump: TldrawIndexedDbDump, storeName: string) {
  const store = dump.stores?.[storeName]
  if (!store) return []
  return Array.isArray(store) ? store : store.records ?? []
}

function hasStoreSnapshot(value: unknown): value is TLStoreSnapshot {
  return isRecord(value) && isRecord(value.store) && isRecord(value.schema)
}

function toBoardSnapshot(value: unknown): BoardSnapshot | null {
  if (!isRecord(value)) return null
  if (hasStoreSnapshot(value)) return value

  const document = value.document
  const session = value.session

  if (hasStoreSnapshot(document) && session) {
    return { document, session } as TLEditorSnapshot
  }

  if (hasStoreSnapshot(document)) return document
  return null
}

function parseSnapshotContent(content: string): BoardSnapshot | null {
  if (!content) return null

  try {
    const parsed = JSON.parse(content) as unknown
    if (!isRecord(parsed)) return null

    if (parsed.storage === 'tldraw-snapshot-v1') {
      const snapshotContent = parsed as TldrawSnapshotContent
      return toBoardSnapshot(snapshotContent.snapshot)
    }

    return toBoardSnapshot(parsed)
  } catch {
    return null
  }
}

function parseIndexedDbBackup(content: string): TldrawPageBackup | null {
  if (!content) return null

  try {
    const parsed = JSON.parse(content) as unknown
    if (!isRecord(parsed) || parsed.storage !== 'tldraw-indexeddb-backup-v1') return null
    return parsed as TldrawPageBackup
  } catch {
    return null
  }
}

function snapshotFromIndexedDbBackup(content: string): TLStoreSnapshot | null {
  const backup = parseIndexedDbBackup(content)
  const dump = backup?.dump
  if (!dump?.stores) return null

  const records = getStoreRecords(dump, 'records').filter((record): record is Record<string, unknown> => (
    isRecord(record) && typeof record.id === 'string'
  ))
  const schema = getStoreRecords(dump, 'schema')[0]

  if (!records.length || !schema) return null

  return ({
    schema,
    store: Object.fromEntries(records.map(record => [String(record.id), record])),
  } as unknown) as TLStoreSnapshot
}

function parseBoardSnapshot(content: string) {
  return parseSnapshotContent(content) ?? snapshotFromIndexedDbBackup(content) ?? undefined
}

function createSnapshotContent(editor: Editor) {
  return JSON.stringify({
    storage: 'tldraw-snapshot-v1',
    savedAt: new Date().toISOString(),
    snapshot: getSnapshot(editor.store),
  })
}

export default function BoardPage({ page }: BoardPageProps) {
  const initialSnapshot = useMemo(() => parseBoardSnapshot(page.content), [page.content])
  const licenseKey = getTldrawLicenseKey()
  const { queueSave, flush } = usePageSaveQueue({
    page,
    delay: 0,
  })

  function handleMount(editor: Editor) {
    let lastQueuedContent = page.content
    let saveTimer: number | undefined
    let hasPendingChanges = false

    const queueCurrentSnapshot = () => {
      hasPendingChanges = false
      const content = createSnapshotContent(editor)
      if (content === lastQueuedContent) return
      lastQueuedContent = content
      queueSave({ content })
    }

    const scheduleSave = () => {
      hasPendingChanges = true
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(queueCurrentSnapshot, BOARD_SAVE_DEBOUNCE_MS)
    }

    const unlisten = editor.store.listen(scheduleSave, { source: 'user', scope: 'document' })

    return () => {
      unlisten()
      window.clearTimeout(saveTimer)
      if (hasPendingChanges) queueCurrentSnapshot()
      void flush()
    }
  }

  return (
    <div className="h-full min-h-0">
      <Tldraw
        key={page.id}
        snapshot={initialSnapshot}
        onMount={handleMount}
        licenseKey={licenseKey}
        assets={boardAssetStore}
      />
    </div>
  )
}
