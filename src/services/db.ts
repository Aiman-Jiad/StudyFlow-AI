import { openDB, type IDBPDatabase } from 'idb'
import type { HistoryItem, StudyKit } from '@/types'

const DB_NAME = 'studyflow-ai'
const DB_VERSION = 1
const STORE = 'history'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt')
        }
      }
    })
  }
  return dbPromise
}

export async function saveHistoryItem(studyKit: StudyKit): Promise<void> {
  const db = await getDB()
  const item: HistoryItem = {
    id: studyKit.id,
    title: studyKit.title,
    createdAt: studyKit.createdAt,
    sourceType: studyKit.sourceType,
    studyKit
  }
  await db.put(STORE, item)
}

export async function updateHistoryItem(studyKit: StudyKit): Promise<void> {
  return saveHistoryItem(studyKit)
}

export async function getAllHistory(): Promise<HistoryItem[]> {
  const db = await getDB()
  const items: HistoryItem[] = await db.getAll(STORE)
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function getHistoryItem(id: string): Promise<HistoryItem | undefined> {
  const db = await getDB()
  return db.get(STORE, id)
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}

export async function clearAllHistory(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE)
}
