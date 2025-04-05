import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'foodBank';
const DB_VERSION = 1;
const STORE_NAME = 'files';

export async function is_database_created(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    let existed = true;
    request.onupgradeneeded = () => {
      existed = false;
    };

    request.onsuccess = () => {
      request.result.close();
      resolve(existed);
    };

    request.onerror = () => reject(false);
  });
}

export async function create_database(): Promise<void> {
  try {
    await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
          console.log('Store created');
        }
      },
    });
    console.log('Database created');
  } catch (err) {
    console.error('Error creating DB:', err);
  }
}

export async function use_found_database(): Promise<void> {
  try {
    const db = await openDB(DB_NAME, DB_VERSION);
    console.log('Using existing database:', db.name);
  } catch (err) {
    console.error('Error using existing DB:', err);
  }
}