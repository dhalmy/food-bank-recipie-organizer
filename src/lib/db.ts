import { openDB, DBSchema } from 'idb';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
}

interface MyDB extends DBSchema {
  inventory: {
    key: string;
    value: FoodItem;
    indexes: { 'by-name': string; 'by-category': string };
  };
}

const dbName = 'foodBankDB';
const storeName = 'inventory';

export async function initDB() {
  const db = await openDB<MyDB>(dbName, 1, {
    upgrade(db) {
      const store = db.createObjectStore(storeName, {
        keyPath: 'id',
      });
      store.createIndex('by-name', 'name');
      store.createIndex('by-category', 'category');
    },
  });
  return db;
}

export async function getAllItems(): Promise<FoodItem[]> {
  const db = await initDB();
  return db.getAll(storeName);
}

export async function addItem(item: Omit<FoodItem, 'id'>): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  await db.add(storeName, { ...item, id });
  return id;
}

export async function removeItems(ids: string[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all(ids.map(id => tx.store.delete(id)));
  await tx.done;
}

export async function updateItem(item: FoodItem): Promise<void> {
  const db = await initDB();
  await db.put(storeName, item);
} 