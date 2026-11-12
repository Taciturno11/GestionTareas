import { useEffect, useMemo, useRef } from 'react'
import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  DefaultStylePanel,
  ReadonlySharedStyleMap,
  Tldraw,
  getSnapshot,
  inlineBase64AssetStore,
  useEditor,
  useRelevantStyles,
  useValue,
  type Editor,
  type TLAssetStore,
  type TLComponents,
  type TLEditorSnapshot,
  type TLStoreSnapshot,
} from 'tldraw'
import 'tldraw/tldraw.css'

import BoardShapeLibrary from '@/components/BoardShapeLibrary/BoardShapeLibrary'
import { usePageSaveQueue } from '@/hooks/usePageSaveQueue'
import { getTldrawLicenseKey } from '@/lib/runtimeConfig'
import { useTheme } from '@/theme/theme-context'
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

const ALWAYS_VISIBLE_STYLES = [DefaultColorStyle, DefaultDashStyle, DefaultFillStyle, DefaultSizeStyle]

// tldraw oculta o encoge el panel segun la seleccion/herramienta; se completa con los
// estilos de la siguiente forma para que colores y tamanos queden siempre visibles.
function BoardStylePanel() {
  const editor = useEditor()
  const relevantStyles = useRelevantStyles()
  const styles = useValue('boardStylePanelStyles', () => {
    const entries = [...(relevantStyles ?? [])]
    for (const style of ALWAYS_VISIBLE_STYLES) {
      if (!relevantStyles?.get(style)) {
        entries.push([style, { type: 'shared', value: editor.getStyleForNextShape(style) }])
      }
    }
    return new ReadonlySharedStyleMap(entries)
  }, [editor, relevantStyles])

  return (
    <>
      <DefaultStylePanel styles={styles} />
      <BoardShapeLibrary />
    </>
  )
}

const boardComponents: TLComponents = {
  StylePanel: BoardStylePanel,
}

interface BoardPageProps {
  page: WorkspacePage
  readOnly?: boolean
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

export default function BoardPage({ page, readOnly = false }: BoardPageProps) {
  const initialSnapshot = useMemo(() => parseBoardSnapshot(page.content), [page.content])
  const licenseKey = getTldrawLicenseKey()
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<Editor | null>(null)
  const { queueSave, flush } = usePageSaveQueue({
    page,
    delay: 0,
  })

  useEffect(() => {
    editorRef.current?.user.updateUserPreferences({ colorScheme: resolvedTheme })
  }, [resolvedTheme])

  function handleMount(editor: Editor) {
    editorRef.current = editor
    editor.updateInstanceState({ isReadonly: readOnly })
    editor.user.updateUserPreferences({ colorScheme: resolvedTheme })
    if (readOnly) {
      return () => {
        editorRef.current = null
      }
    }

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
      editorRef.current = null
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
        inferDarkMode={false}
        licenseKey={licenseKey}
        assets={boardAssetStore}
        components={boardComponents}
      />
    </div>
  )
}
