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

export interface FoodItem {
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
  foodItems: FoodItem[];
}

// Database file path
const DB_FILE_PATH = path.join(process.cwd(), 'src', 'database', 'foodBank.json');

// Default empty database
const DEFAULT_DATABASE: Database = {
  foodTypes: [],
  foodItems: []
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

// Get the entire database
export function get_database(): Database {
  try {
    if (typeof window !== 'undefined') {
      const dbString = localStorage.getItem('foodBankDB');
      if (dbString) {
        return JSON.parse(dbString);
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

// CRUD operations for FoodItems
export function get_all_food_items(): FoodItem[] {
  const db = get_database();
  return db.foodItems;
}

export function get_food_item(serialNumber: string): FoodItem | undefined {
  const db = get_database();
  return db.foodItems.find(item => item.serialNumber === serialNumber);
}

export function add_food_item(foodItem: FoodItem): void {
  const db = get_database();
  db.foodItems.push(foodItem);
  save_database(db);
}

export function update_food_item(foodItem: FoodItem): void {
  const db = get_database();
  const index = db.foodItems.findIndex(item => item.serialNumber === foodItem.serialNumber);
  if (index !== -1) {
    db.foodItems[index] = foodItem;
    save_database(db);
  }
}

export function delete_food_item(serialNumber: string): void {
  const db = get_database();
  db.foodItems = db.foodItems.filter(item => item.serialNumber !== serialNumber);
  save_database(db);
}

// Get food items by food type
export function get_food_items_by_type(foodTypeId: number): FoodItem[] {
  const db = get_database();
  return db.foodItems.filter(item => item.foodTypeId === foodTypeId);
}

// Get food items by expiration date
export function get_food_items_by_expiration(expirationDate: string): FoodItem[] {
  const db = get_database();
  return db.foodItems.filter(item => item.expirationDate === expirationDate);
} 