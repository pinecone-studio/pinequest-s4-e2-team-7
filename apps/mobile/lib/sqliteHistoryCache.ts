import * as SQLite from 'expo-sqlite'
import type { IHistoryCache, HistoryCacheEntry } from '@pinequest/sync'

const DB_NAME = 'screener_history.db'
let _db: SQLite.SQLiteDatabase | null = null

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME)
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS history_cache (
        childKey TEXT PRIMARY KEY,
        seasonId TEXT NOT NULL,
        triageLevel TEXT NOT NULL,
        confirmedLevel TEXT,
        capturedAt TEXT NOT NULL,
        longitudinalFlags TEXT NOT NULL,
        cachedAt TEXT NOT NULL
      );
    `)
  }
  return _db
}

type DbRow = {
  childKey: string; seasonId: string; triageLevel: string
  confirmedLevel: string | null; capturedAt: string
  longitudinalFlags: string; cachedAt: string
}

class HistoryCacheStore implements IHistoryCache {
  async putEntries(entries: HistoryCacheEntry[]): Promise<void> {
    const db = await getDb()
    for (const e of entries) {
      await db.runAsync(
        `INSERT OR REPLACE INTO history_cache
         (childKey, seasonId, triageLevel, confirmedLevel, capturedAt, longitudinalFlags, cachedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        e.childKey, e.seasonId, e.triageLevel, e.confirmedLevel ?? null,
        e.capturedAt, JSON.stringify(e.longitudinalFlags), e.cachedAt,
      )
    }
  }

  async getByChildKey(childKey: string): Promise<HistoryCacheEntry | null> {
    const db = await getDb()
    const row = await db.getFirstAsync<DbRow>(
      `SELECT * FROM history_cache WHERE childKey = ?`, childKey,
    )
    if (!row) return null
    return {
      ...row,
      triageLevel: row.triageLevel as HistoryCacheEntry['triageLevel'],
      confirmedLevel: row.confirmedLevel as HistoryCacheEntry['confirmedLevel'],
      longitudinalFlags: JSON.parse(row.longitudinalFlags) as HistoryCacheEntry['longitudinalFlags'],
    }
  }

  async clearForKeys(childKeys: string[]): Promise<void> {
    if (!childKeys.length) return
    const db = await getDb()
    const ph = childKeys.map(() => '?').join(', ')
    await db.runAsync(`DELETE FROM history_cache WHERE childKey IN (${ph})`, ...childKeys)
  }

  async clear(): Promise<void> {
    const db = await getDb()
    await db.runAsync(`DELETE FROM history_cache`)
  }
}

/** Singleton SQLite adapter for the prior-season history cache. */
export const historyCache = new HistoryCacheStore()
