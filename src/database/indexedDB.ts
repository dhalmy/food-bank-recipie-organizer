import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'foodBank';
const DB_VERSION = 1;
const FOOD_TYPE_STORE = 'foodTypes';
const FOOD_ITEM_STORE = 'foodItems';

export interface NutritionalFacts {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface FoodItem {
  serialNumber: string;
  foodTypeId: number;
  subCategory: string;
  nutritionalFacts: NutritionalFacts;
  expirationDate: string;
}

export interface FoodType {
  foodTypeId: number;
  name: string;
  description?: string;
}

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
        // Create foodTypes store
        const foodTypeStore = db.createObjectStore(FOOD_TYPE_STORE, {
          keyPath: 'foodTypeId',  // The key for food types will be 'foodTypeId'
        });

        // Create foodItems store
        const foodItemStore = db.createObjectStore(FOOD_ITEM_STORE, {
          keyPath: 'serialNumber',  // The key for food items will be 'serialNumber'
        });

        // Create indexes for foodItems store
        foodItemStore.createIndex('foodTypeIndex', 'foodTypeId');
        foodItemStore.createIndex('expirationDateIndex', 'expirationDate');

        console.log('Database created successfully');
      },
    });
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