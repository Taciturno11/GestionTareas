type StorageDump = Record<string, string | null>

interface IndexedDbStoreDump {
  records: unknown[]
}

interface IndexedDbDump {
  name: string
  version?: number
  stores: Record<string, IndexedDbStoreDump>
  error?: string
}

export interface LocalBackup {
  app: 'gestion-tareas'
  schemaVersion: 1
  exportedAt: string
  origin: string
  localStorage: StorageDump
  sessionStorage: StorageDump
  indexedDB: IndexedDbDump[]
}

function dumpWebStorage(storage: Storage): StorageDump {
  const dump: StorageDump = {}

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key) dump[key] = storage.getItem(key)
  }

  return dump
}

function openDatabase(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function readStore(db: IDBDatabase, storeName: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function dumpIndexedDb(): Promise<IndexedDbDump[]> {
  if (!('indexedDB' in window) || typeof indexedDB.databases !== 'function') return []

  const databases = await indexedDB.databases()
  const dumps: IndexedDbDump[] = []

  for (const databaseInfo of databases) {
    if (!databaseInfo.name) continue

    const dump: IndexedDbDump = {
      name: databaseInfo.name,
      version: databaseInfo.version,
      stores: {},
    }

    let db: IDBDatabase | null = null

    try {
      db = await openDatabase(databaseInfo.name)
      const storeNames = Array.from(db.objectStoreNames)

      for (const storeName of storeNames) {
        dump.stores[storeName] = {
          records: await readStore(db, storeName),
        }
      }
    } catch (error) {
      dump.error = error instanceof Error ? error.message : 'No se pudo exportar esta base IndexedDB'
    } finally {
      db?.close()
    }

    dumps.push(dump)
  }

  return dumps
}

function buildBackupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `gestion-tareas-backup-${timestamp}.json`
}

export async function createLocalBackup(): Promise<LocalBackup> {
  return {
    app: 'gestion-tareas',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    origin: window.location.origin,
    localStorage: dumpWebStorage(localStorage),
    sessionStorage: dumpWebStorage(sessionStorage),
    indexedDB: await dumpIndexedDb(),
  }
}

export async function downloadLocalBackup() {
  const backup = await createLocalBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = buildBackupFilename()
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return backup
}
