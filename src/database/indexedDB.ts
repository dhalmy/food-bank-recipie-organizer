import { openDB, IDBPDatabase } from 'idb';
import { FoodItem, FoodType, NutritionalFacts } from './types'

const DB_NAME = 'foodBank';
const DB_VERSION = 1;
const FOOD_TYPE_STORE = 'foodTypes';
const FOOD_ITEM_STORE = 'foodItems';

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
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(FOOD_TYPE_STORE, { keyPath: 'foodTypeId' });
      
      const foodItemStore = db.createObjectStore(FOOD_ITEM_STORE, { keyPath: 'serialNumber', autoIncrement: true });
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

export async function add_food_type(db: IDBPDatabase, foodTypeName: string): Promise<void> {
  const foodTypeStore = db.transaction(FOOD_TYPE_STORE, 'readwrite').objectStore(FOOD_TYPE_STORE);

  try {
    const foodType = { name: foodTypeName };
    await foodTypeStore.add(foodType);
  } catch (error) {
    console.error("Error adding food type:", error);
    throw new Error("Failed to add food type.");
  }
}

export async function add_food_item(db: IDBPDatabase, foodItem: FoodItem): Promise<void> {
  const foodItemStore = db.transaction(FOOD_ITEM_STORE, 'readwrite').objectStore(FOOD_ITEM_STORE);

  try {
    await foodItemStore.add(foodItem);
    console.log("Food item added:", foodItem);
  } catch (error) {
    console.error("Error adding food item:", error);
    throw new Error("Failed to add food item.");
  }
}