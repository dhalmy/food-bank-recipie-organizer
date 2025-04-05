import fs from 'fs';
import path from 'path';

// Define the database schema
export interface NutritionalValue {
  value: number;
  unit: string;
}

export interface NutritionalFacts {
  calories: NutritionalValue;
  protein: NutritionalValue;
  fat: NutritionalValue;
  carbohydrates: NutritionalValue;
  sugar: NutritionalValue;
  sodium: NutritionalValue;
}

export interface QuantityValue {
  value: number;
  unit: string;
}

export interface InventoryItem {
  serialNumber: string;
  foodTypeId: number;
  subCategory: string;
  nutritionalFacts: NutritionalFacts;
  expirationDate: string;
  quantity: QuantityValue;
  servingSize: QuantityValue;
}

export interface FoodType {
  foodTypeId: number;
  name: string;
  description?: string;
}

export interface Database {
  foodTypes: FoodType[];
  inventoryItems: InventoryItem[];
}

// Database file path
const DB_FILE_PATH = path.join(process.cwd(), 'src', 'database', 'foodBank.json');

// Default empty database
const DEFAULT_DATABASE: Database = {
  foodTypes: [],
  inventoryItems: []
};

// Check if database exists
export async function is_database_created(): Promise<boolean> {
  try {
    // In a browser environment, we'll use localStorage to check if the database exists
    if (typeof window !== 'undefined') {
      return localStorage.getItem('foodBankDB') !== null;
    }
    return false;
  } catch (error) {
    console.error('Error checking if database exists:', error);
    return false;
  }
}

// Create a new database
export async function create_database(): Promise<void> {
  try {
    // In a browser environment, we'll use localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodBankDB', JSON.stringify(DEFAULT_DATABASE));
      console.log('Database created successfully');
    }
  } catch (error) {
    console.error('Error creating database:', error);
  }
}

// Use an existing database
export async function use_found_database(): Promise<void> {
  try {
    // In a browser environment, we'll use localStorage
    if (typeof window !== 'undefined') {
      const db = localStorage.getItem('foodBankDB');
      if (db) {
        console.log('Using existing database');
      } else {
        console.log('No existing database found');
      }
    }
  } catch (error) {
    console.error('Error using existing database:', error);
  }
}

// Initialize the database if it doesn't exist
export function initializeDatabase(): void {
  try {
    if (typeof window !== 'undefined') {
      const dbString = localStorage.getItem('foodBankDB');
      if (!dbString) {
        console.log('Database not found, creating new database with dummy data');
        create_database_with_dummy_data();
      } else {
        console.log('Using existing database');
        // Migrate the database if needed
        migrateDatabaseIfNeeded();
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Create a new database with dummy data
export function create_database_with_dummy_data(): void {
  try {
    // In a browser environment, we'll use localStorage
    if (typeof window !== 'undefined') {
      // Create a database with dummy data
      const dummyDatabase: Database = {
        foodTypes: [
          {
            foodTypeId: 1,
            name: "Grains",
            description: "Cereals, bread, rice, pasta, etc."
          },
          {
            foodTypeId: 2,
            name: "Proteins",
            description: "Meat, fish, eggs, legumes, etc."
          },
          {
            foodTypeId: 3,
            name: "Vegetables",
            description: "Fresh, frozen, or canned vegetables"
          },
          {
            foodTypeId: 4,
            name: "Fruits",
            description: "Fresh, frozen, or canned fruits"
          },
          {
            foodTypeId: 5,
            name: "Dairy",
            description: "Milk, cheese, yogurt, etc."
          },
          {
            foodTypeId: 6,
            name: "Condiments",
            description: "Sauces, spices, oils, etc."
          }
        ],
        inventoryItems: [
          {
            serialNumber: "GRAIN001",
            foodTypeId: 1,
            subCategory: "Rice",
            nutritionalFacts: {
              calories: { value: 130, unit: "kcal" },
              protein: { value: 2.7, unit: "g" },
              fat: { value: 0.3, unit: "g" },
              carbohydrates: { value: 28, unit: "g" },
              sugar: { value: 0, unit: "g" },
              sodium: { value: 1, unit: "mg" }
            },
            expirationDate: "2024-12-31",
            quantity: { value: 10, unit: "kg" },
            servingSize: { value: 100, unit: "g" }
          },
          {
            serialNumber: "PROT001",
            foodTypeId: 2,
            subCategory: "Canned Beans",
            nutritionalFacts: {
              calories: { value: 120, unit: "kcal" },
              protein: { value: 7, unit: "g" },
              fat: { value: 0.5, unit: "g" },
              carbohydrates: { value: 22, unit: "g" },
              sugar: { value: 1, unit: "g" },
              sodium: { value: 400, unit: "mg" }
            },
            expirationDate: "2024-10-15",
            quantity: { value: 24, unit: "cans" },
            servingSize: { value: 130, unit: "g" }
          },
          {
            serialNumber: "VEG001",
            foodTypeId: 3,
            subCategory: "Canned Vegetables",
            nutritionalFacts: {
              calories: { value: 25, unit: "kcal" },
              protein: { value: 1.2, unit: "g" },
              fat: { value: 0.1, unit: "g" },
              carbohydrates: { value: 5, unit: "g" },
              sugar: { value: 2, unit: "g" },
              sodium: { value: 300, unit: "mg" }
            },
            expirationDate: "2024-08-30",
            quantity: { value: 36, unit: "cans" },
            servingSize: { value: 125, unit: "g" }
          }
        ]
      };
      
      localStorage.setItem('foodBankDB', JSON.stringify(dummyDatabase));
      console.log('Database created with dummy data successfully');
    }
  } catch (error) {
    console.error('Error creating database with dummy data:', error);
  }
}

// Migrate the database if needed (e.g., rename foodItems to inventoryItems)
function migrateDatabaseIfNeeded(): void {
  try {
    if (typeof window !== 'undefined') {
      const dbString = localStorage.getItem('foodBankDB');
      if (dbString) {
        const db = JSON.parse(dbString);
        
        // Check if the database needs migration
        if (db.foodItems && !db.inventoryItems) {
          console.log('Migrating database: renaming foodItems to inventoryItems');
          db.inventoryItems = db.foodItems;
          delete db.foodItems;
          
          // Save the migrated database
          localStorage.setItem('foodBankDB', JSON.stringify(db));
          console.log('Database migration completed');
        }
      }
    }
  } catch (error) {
    console.error('Error migrating database:', error);
  }
}

// Get the entire database
export function get_database(): Database {
  try {
    if (typeof window !== 'undefined') {
      const dbString = localStorage.getItem('foodBankDB');
      if (dbString) {
        const db = JSON.parse(dbString);
        
        // Ensure the database has the correct structure
        if (!db.inventoryItems) {
          db.inventoryItems = [];
        }
        
        return db;
      }
    }
    return DEFAULT_DATABASE;
  } catch (error) {
    console.error('Error getting database:', error);
    return DEFAULT_DATABASE;
  }
}

// Save the database
export function save_database(db: Database): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodBankDB', JSON.stringify(db));
    }
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// CRUD operations for FoodTypes
export function get_all_food_types(): FoodType[] {
  const db = get_database();
  return db.foodTypes;
}

export function get_food_type(foodTypeId: number): FoodType | undefined {
  const db = get_database();
  return db.foodTypes.find(type => type.foodTypeId === foodTypeId);
}

export function add_food_type(foodType: FoodType): void {
  const db = get_database();
  db.foodTypes.push(foodType);
  save_database(db);
}

export function update_food_type(foodType: FoodType): void {
  const db = get_database();
  const index = db.foodTypes.findIndex(type => type.foodTypeId === foodType.foodTypeId);
  if (index !== -1) {
    db.foodTypes[index] = foodType;
    save_database(db);
  }
}

export function delete_food_type(foodTypeId: number): void {
  const db = get_database();
  db.foodTypes = db.foodTypes.filter(type => type.foodTypeId !== foodTypeId);
  save_database(db);
}

// CRUD operations for InventoryItems
export function get_all_inventory_items(): InventoryItem[] {
  try {
    const db = get_database();
    return db.inventoryItems || [];
  } catch (error) {
    console.error('Error getting inventory items:', error);
    return [];
  }
}

export function get_inventory_item(serialNumber: string): InventoryItem | undefined {
  const db = get_database();
  return db.inventoryItems.find(item => item.serialNumber === serialNumber);
}

export function add_inventory_item(item: InventoryItem): void {
  try {
    const db = get_database();
    
    // Ensure inventoryItems array exists
    if (!db.inventoryItems) {
      db.inventoryItems = [];
    }
    
    db.inventoryItems.push(item);
    save_database(db);
  } catch (error) {
    console.error('Error adding inventory item:', error);
  }
}

export function update_inventory_item(item: InventoryItem): void {
  try {
    const db = get_database();
    
    // Ensure inventoryItems array exists
    if (!db.inventoryItems) {
      db.inventoryItems = [];
    }
    
    const index = db.inventoryItems.findIndex(i => i.serialNumber === item.serialNumber);
    if (index !== -1) {
      db.inventoryItems[index] = item;
      save_database(db);
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
  }
}

export function delete_inventory_item(serialNumber: string): void {
  try {
    const db = get_database();
    
    // Ensure inventoryItems array exists
    if (!db.inventoryItems) {
      db.inventoryItems = [];
      return;
    }
    
    db.inventoryItems = db.inventoryItems.filter(item => item.serialNumber !== serialNumber);
    save_database(db);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
  }
}

// Get inventory items by food type
export function get_inventory_items_by_type(foodTypeId: number): InventoryItem[] {
  const db = get_database();
  return db.inventoryItems.filter(item => item.foodTypeId === foodTypeId);
}

// Get inventory items by expiration date
export function get_inventory_items_by_expiration(expirationDate: string): InventoryItem[] {
  const db = get_database();
  return db.inventoryItems.filter(item => item.expirationDate === expirationDate);
} 