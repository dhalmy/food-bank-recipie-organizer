import { openDB, IDBPDatabase } from 'idb';
import { add_food_type, add_food_item } from './indexedDB';
import { FoodItem } from './types';

const DB_NAME = 'foodBank';

export async function create_dummy_data(db: IDBPDatabase): Promise<void> {
  // Define food types (example: Beans, Corn, etc.)
  const foodTypes = ['Beans', 'Corn', 'Rice', 'Wheat', 'Barley'];

  // Add food types to the database
  for (const foodType of foodTypes) {
    await add_food_type(db, foodType);
  }

  // Dummy food items
  const foodItems: FoodItem[] = [
    { serialNumber: '001', foodTypeId: 1, subCategory: 'Beans', nutritionalFacts: {
      calories: 100, protein: 7, fat: 1, carbohydrates: 20,
      sodium: 0,
      sugar: 0
    }, expirationDate: '2025-12-01' },
    { serialNumber: '002', foodTypeId: 2, subCategory: 'Corn', nutritionalFacts: {
      calories: 120, protein: 4, fat: 2, carbohydrates: 25,
      sodium: 0,
      sugar: 0
    }, expirationDate: '2025-08-01' },
    { serialNumber: '003', foodTypeId: 3, subCategory: 'Rice', nutritionalFacts: {
      calories: 150, protein: 3, fat: 0, carbohydrates: 30,
      sodium: 0,
      sugar: 0
    }, expirationDate: '2025-06-01' },
    { serialNumber: '004', foodTypeId: 4, subCategory: 'Wheat', nutritionalFacts: {
      calories: 180, protein: 5, fat: 3, carbohydrates: 35,
      sodium: 0,
      sugar: 0
    }, expirationDate: '2025-10-01' },
    { serialNumber: '005', foodTypeId: 5, subCategory: 'Barley', nutritionalFacts: {
      calories: 130, protein: 6, fat: 2, carbohydrates: 28,
      sodium: 0,
      sugar: 0
    }, expirationDate: '2025-05-01' },
  ];

  // Add food items to the database
  for (const foodItem of foodItems) {
    await add_food_item(db, foodItem);
  }

  console.log('Dummy data added');
}