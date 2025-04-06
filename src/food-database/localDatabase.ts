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
  servingQuantity: QuantityValue;
  imageUrl?: string; // Optional URL to the product image
  nutritionImageUrl?: string; // Optional URL to the nutrition facts image
  count?: number; // Track number of duplicate items
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
            "serialNumber": "014800000238",
            "foodTypeId": 3,
            "subCategory": "Cinnamon applesauce",
            "nutritionalFacts": {
              "calories": {
                "value": 88,
                "unit": "kcal"
              },
              "protein": {
                "value": 0,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 22.1,
                "unit": "g"
              },
              "sugar": {
                "value": 21.2,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-06-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 113,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/001/480/000/0238/front_en.3.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "039400016144",
            "foodTypeId": 2,
            "subCategory": "Baked Beans, Original",
            "nutritionalFacts": {
              "calories": {
                "value": 115,
                "unit": "kcal"
              },
              "protein": {
                "value": 5.38,
                "unit": "g"
              },
              "fat": {
                "value": 0.769,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 23.1,
                "unit": "g"
              },
              "sugar": {
                "value": 9.23,
                "unit": "g"
              },
              "sodium": {
                "value": 438,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-10-06",
            "quantity": {
              "value": 794,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 130,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/003/940/001/6144/front_en.8.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/003/940/001/6144/nutrition_en.12.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "078742001012",
            "foodTypeId": 2,
            "subCategory": "Chunk Chicken Breast With Rib Meat In Water",
            "nutritionalFacts": {
              "calories": {
                "value": 77,
                "unit": "kcal"
              },
              "protein": {
                "value": 16.2,
                "unit": "g"
              },
              "fat": {
                "value": 1.76,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 493,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-11-06",
            "quantity": {
              "value": 5,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 142,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/007/874/200/1012/front_en.11.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/007/874/200/1012/nutrition_en.13.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "086600000206",
            "foodTypeId": 2,
            "subCategory": "Premium chunk light tuna in water",
            "nutritionalFacts": {
              "calories": {
                "value": 89,
                "unit": "kcal"
              },
              "protein": {
                "value": 19.64,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 321,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-11-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 56,
              "unit": "g"
            },
            "count": 5
          },
          {
            "serialNumber": "096619653133",
            "foodTypeId": 2,
            "subCategory": "Wild Alaska Pink Salmon",
            "nutritionalFacts": {
              "calories": {
                "value": 94,
                "unit": "kcal"
              },
              "protein": {
                "value": 20,
                "unit": "g"
              },
              "fat": {
                "value": 1.76,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 282,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-10-06",
            "quantity": {
              "value": 6,
              "unit": "cans"
            },
            "servingQuantity": {
              "value": 85,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/009/661/965/3133/front_en.3.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/009/661/965/3133/nutrition_en.5.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "034700054117",
            "foodTypeId": 3,
            "subCategory": "Chopped Spinach",
            "nutritionalFacts": {
              "calories": {
                "value": 17,
                "unit": "kcal"
              },
              "protein": {
                "value": 1.65,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 2.48,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 256,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-09-06",
            "quantity": {
              "value": 121,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 121,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/003/470/005/4117/front_en.6.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/003/470/005/4117/nutrition_en.8.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "024000163190",
            "foodTypeId": 3,
            "subCategory": "Mixed Vegetables",
            "nutritionalFacts": {
              "calories": {
                "value": 28,
                "unit": "kcal"
              },
              "protein": {
                "value": 1.3,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 5.85,
                "unit": "g"
              },
              "sugar": {
                "value": 1.95,
                "unit": "g"
              },
              "sodium": {
                "value": 0.202,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-01-06",
            "quantity": {
              "value": 124,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 124,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/400/016/3190/front_en.6.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "024000163022",
            "foodTypeId": 1,
            "subCategory": "Del Monte Whole kernel corn",
            "nutritionalFacts": {
              "calories": {
                "value": 48,
                "unit": "kcal"
              },
              "protein": {
                "value": 0.8,
                "unit": "g"
              },
              "fat": {
                "value": 0.8,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 10.4,
                "unit": "g"
              },
              "sugar": {
                "value": 5.6,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-03-06",
            "quantity": {
              "value": 432,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 125,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/400/016/3022/front_en.27.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "024000162971",
            "foodTypeId": 3,
            "subCategory": "Sliced Beets",
            "nutritionalFacts": {
              "calories": {
                "value": 41,
                "unit": "kcal"
              },
              "protein": {
                "value": 0.81,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 8.94,
                "unit": "g"
              },
              "sugar": {
                "value": 8.13,
                "unit": "g"
              },
              "sodium": {
                "value": 203,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-08-06",
            "quantity": {
              "value": 441,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 1,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/400/016/2971/front_en.10.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/002/400/016/2971/nutrition_en.12.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "024000162995",
            "foodTypeId": 3,
            "subCategory": "Sliced carrots",
            "nutritionalFacts": {
              "calories": {
                "value": 20,
                "unit": "kcal"
              },
              "protein": {
                "value": 0.659,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 4.63,
                "unit": "g"
              },
              "sugar": {
                "value": 2.64,
                "unit": "g"
              },
              "sodium": {
                "value": 198,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-03-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 123,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/400/016/2995/front_en.3.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "024000163015",
            "foodTypeId": 1,
            "subCategory": "Sweet corn cream style",
            "nutritionalFacts": {
              "calories": {
                "value": 48,
                "unit": "kcal"
              },
              "protein": {
                "value": 0.8,
                "unit": "g"
              },
              "fat": {
                "value": 0.8,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 10.4,
                "unit": "g"
              },
              "sugar": {
                "value": 4.8,
                "unit": "g"
              },
              "sodium": {
                "value": 272,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-02-06",
            "quantity": {
              "value": 418,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 125,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/400/016/3015/front_en.26.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/002/400/016/3015/nutrition_en.28.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "00000000040822",
            "foodTypeId": 1,
            "subCategory": "Jumbo Red Onions",
            "nutritionalFacts": {
              "calories": {
                "value": 27,
                "unit": "kcal"
              },
              "protein": {
                "value": 0.688,
                "unit": "g"
              },
              "fat": {
                "value": 0.0625,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 5.84,
                "unit": "g"
              },
              "sugar": {
                "value": 2.66,
                "unit": "g"
              },
              "sodium": {
                "value": 2.5,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-09-06",
            "quantity": {
              "value": 1,
              "unit": "cup"
            },
            "servingQuantity": {
              "value": 160,
              "unit": "g"
            },
            "count": 5
          },
          {
            "serialNumber": "861745000010",
            "foodTypeId": 1,
            "subCategory": "Pasture raised vital farms eggs",
            "nutritionalFacts": {
              "calories": {
                "value": 140,
                "unit": "kcal"
              },
              "protein": {
                "value": 12,
                "unit": "g"
              },
              "fat": {
                "value": 10,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 140,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-10-06",
            "quantity": {
              "value": 24,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 50,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/086/174/500/0010/front_en.33.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/086/174/500/0010/nutrition_en.29.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "021000604647",
            "foodTypeId": 5,
            "subCategory": "Singles American Cheese Slices",
            "nutritionalFacts": {
              "calories": {
                "value": 287,
                "unit": "kcal"
              },
              "protein": {
                "value": 19,
                "unit": "g"
              },
              "fat": {
                "value": 19,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 9.52,
                "unit": "g"
              },
              "sugar": {
                "value": 9.52,
                "unit": "g"
              },
              "sodium": {
                "value": 1100,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-01-06",
            "quantity": {
              "value": 12,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 21,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/100/060/4647/front_en.32.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/002/100/060/4647/nutrition_en.24.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "051500255162",
            "foodTypeId": 2,
            "subCategory": "Jif Peanut Butter",
            "nutritionalFacts": {
              "calories": {
                "value": 576,
                "unit": "kcal"
              },
              "protein": {
                "value": 21.2,
                "unit": "g"
              },
              "fat": {
                "value": 48.5,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 24.2,
                "unit": "g"
              },
              "sugar": {
                "value": 9.09,
                "unit": "g"
              },
              "sodium": {
                "value": 424,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-10-06",
            "quantity": {
              "value": 16,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 33,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/005/150/025/5162/front_en.61.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/005/150/025/5162/nutrition_en.63.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "098308243236",
            "foodTypeId": 2,
            "subCategory": "Roasted Chicken base",
            "nutritionalFacts": {
              "calories": {
                "value": 251,
                "unit": "kcal"
              },
              "protein": {
                "value": 16.7,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 33.3,
                "unit": "g"
              },
              "sugar": {
                "value": 16.7,
                "unit": "g"
              },
              "sodium": {
                "value": 5830,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-11-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 6,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/009/830/824/3236/front_en.15.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/009/830/824/3236/nutrition_en.17.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "851552001010",
            "foodTypeId": 2,
            "subCategory": "Pinto beans",
            "nutritionalFacts": {
              "calories": {
                "value": 224,
                "unit": "kcal"
              },
              "protein": {
                "value": 18.4,
                "unit": "g"
              },
              "fat": {
                "value": 2.04,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 63.3,
                "unit": "g"
              },
              "sugar": {
                "value": 2.04,
                "unit": "g"
              },
              "sodium": {
                "value": 10.200000000000001,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-07-06",
            "quantity": {
              "value": 32,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 49,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/085/155/200/1010/front_en.28.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/085/155/200/1010/nutrition_en.32.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "859941005915",
            "foodTypeId": 3,
            "subCategory": "Veganrobs puffs cauliflower probiotic",
            "nutritionalFacts": {
              "calories": {
                "value": 500,
                "unit": "kcal"
              },
              "protein": {
                "value": 10.714285714286,
                "unit": "g"
              },
              "fat": {
                "value": 25,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 57.142857142857,
                "unit": "g"
              },
              "sugar": {
                "value": 3.5714285714286,
                "unit": "g"
              },
              "sodium": {
                "value": 607.14285714284,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-05-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 28,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/085/994/100/5915/front_en.12.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/085/994/100/5915/nutrition_en.18.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "00447874",
            "foodTypeId": 1,
            "subCategory": "Sweet & Fluffy Cous Cous",
            "nutritionalFacts": {
              "calories": {
                "value": 0,
                "unit": "kcal"
              },
              "protein": {
                "value": 0,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-05-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/000/000/044/7874/front_en.3.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/000/000/044/7874/nutrition_en.11.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "4005817079610",
            "foodTypeId": 3,
            "subCategory": "Zucchini",
            "nutritionalFacts": {
              "calories": {
                "value": 0,
                "unit": "kcal"
              },
              "protein": {
                "value": 0,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-10-06",
            "quantity": {
              "value": 500,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/400/581/707/9610/front_en.12.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "0027000378151",
            "foodTypeId": 2,
            "subCategory": "Canned Chili With Beans",
            "nutritionalFacts": {
              "calories": {
                "value": 111,
                "unit": "kcal"
              },
              "protein": {
                "value": 6.82,
                "unit": "g"
              },
              "fat": {
                "value": 4.71,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 10.4,
                "unit": "g"
              },
              "sugar": {
                "value": 2.59,
                "unit": "g"
              },
              "sodium": {
                "value": 405000,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-05-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 425,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/700/037/8151/front_en.13.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/002/700/037/8151/nutrition_en.17.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "810032300463",
            "foodTypeId": 1,
            "subCategory": "Organic Sprouted Pumpkin Seeds",
            "nutritionalFacts": {
              "calories": {
                "value": 571,
                "unit": "kcal"
              },
              "protein": {
                "value": 28.6,
                "unit": "g"
              },
              "fat": {
                "value": 46.4,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 14.3,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 482,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-11-06",
            "quantity": {
              "value": 22,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 28,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/081/003/230/0463/front_en.46.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/081/003/230/0463/nutrition_en.42.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "099482500924",
            "foodTypeId": 1,
            "subCategory": "white rice long grain",
            "nutritionalFacts": {
              "calories": {
                "value": 0,
                "unit": "kcal"
              },
              "protein": {
                "value": 0,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-09-06",
            "quantity": {
              "value": 32,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/009/948/250/0924/front_en.9.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/009/948/250/0924/nutrition_en.5.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "021000658831",
            "foodTypeId": 1,
            "subCategory": "Mac And Cheese Original Flavor",
            "nutritionalFacts": {
              "calories": {
                "value": 0,
                "unit": "kcal"
              },
              "protein": {
                "value": 0,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-05-06",
            "quantity": {
              "value": 7.25,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/002/100/065/8831/front_en.97.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/002/100/065/8831/nutrition_en.99.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "856312002771",
            "foodTypeId": 5,
            "subCategory": "Fairlife milk",
            "nutritionalFacts": {
              "calories": {
                "value": 50,
                "unit": "kcal"
              },
              "protein": {
                "value": 5.42,
                "unit": "g"
              },
              "fat": {
                "value": 1.88,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 2.5,
                "unit": "g"
              },
              "sugar": {
                "value": 2.5,
                "unit": "g"
              },
              "sodium": {
                "value": 50,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-02-06",
            "quantity": {
              "value": 1.5,
              "unit": "l"
            },
            "servingQuantity": {
              "value": 240,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/085/631/200/2771/front_en.155.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/085/631/200/2771/nutrition_en.157.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5000171010025",
            "foodTypeId": 2,
            "subCategory": "Wild Pacific Red Salmon",
            "nutritionalFacts": {
              "calories": {
                "value": 151,
                "unit": "kcal"
              },
              "protein": {
                "value": 20.4,
                "unit": "g"
              },
              "fat": {
                "value": 7.8,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 360,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-12-06",
            "quantity": {
              "value": 210,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/500/017/101/0025/front_en.27.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/500/017/101/0025/nutrition_en.29.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "0699058010828",
            "foodTypeId": 3,
            "subCategory": "Sweet bell peppers",
            "nutritionalFacts": {
              "calories": {
                "value": 35,
                "unit": "kcal"
              },
              "protein": {
                "value": 1,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 6,
                "unit": "g"
              },
              "sugar": {
                "value": 5,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-04-06",
            "quantity": {
              "value": 454,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/069/905/801/0828/front_en.3.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5051140474201",
            "foodTypeId": 6,
            "subCategory": "Dijon Mustard",
            "nutritionalFacts": {
              "calories": {
                "value": 128,
                "unit": "kcal"
              },
              "protein": {
                "value": 6.2,
                "unit": "g"
              },
              "fat": {
                "value": 9.2,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 3.7,
                "unit": "g"
              },
              "sugar": {
                "value": 2.3,
                "unit": "g"
              },
              "sodium": {
                "value": 2480,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-01-06",
            "quantity": {
              "value": 185,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 5,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/505/114/047/4201/front_en.20.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/505/114/047/4201/nutrition_en.29.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "0094922424990",
            "foodTypeId": 2,
            "subCategory": "Dry Black Beans",
            "nutritionalFacts": {
              "calories": {
                "value": 0,
                "unit": "kcal"
              },
              "protein": {
                "value": 0,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-12-06",
            "quantity": {
              "value": 16,
              "unit": "oz"
            },
            "servingQuantity": {
              "value": 0,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/009/492/242/4990/front_en.8.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5010046001003",
            "foodTypeId": 1,
            "subCategory": "Green Giant Sweetcorn",
            "nutritionalFacts": {
              "calories": {
                "value": 77,
                "unit": "kcal"
              },
              "protein": {
                "value": 2.4,
                "unit": "g"
              },
              "fat": {
                "value": 1.2,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 12.6,
                "unit": "g"
              },
              "sugar": {
                "value": 7.4,
                "unit": "g"
              },
              "sodium": {
                "value": 160,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-05-06",
            "quantity": {
              "value": 198,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/501/004/600/1003/front_en.19.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/501/004/600/1003/nutrition_en.27.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5057545745946",
            "foodTypeId": 3,
            "subCategory": "Chopped Tomatoes",
            "nutritionalFacts": {
              "calories": {
                "value": 22,
                "unit": "kcal"
              },
              "protein": {
                "value": 1.1,
                "unit": "g"
              },
              "fat": {
                "value": 0.1,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 3.8,
                "unit": "g"
              },
              "sugar": {
                "value": 3.8,
                "unit": "g"
              },
              "sodium": {
                "value": 27.5,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-10-06",
            "quantity": {
              "value": 400,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 200,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/505/754/574/5946/front_en.33.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/505/754/574/5946/nutrition_en.40.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "4088600550862",
            "foodTypeId": 3,
            "subCategory": "Chopped tomatoes in tomato juice",
            "nutritionalFacts": {
              "calories": {
                "value": 22,
                "unit": "kcal"
              },
              "protein": {
                "value": 1.1,
                "unit": "g"
              },
              "fat": {
                "value": 0.1,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 3.8,
                "unit": "g"
              },
              "sugar": {
                "value": 3.8,
                "unit": "g"
              },
              "sodium": {
                "value": 4,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-09-06",
            "quantity": {
              "value": 400,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/408/860/055/0862/front_en.3.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/408/860/055/0862/nutrition_en.10.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "3600900011037",
            "foodTypeId": 1,
            "subCategory": "Quinoa gourmand",
            "nutritionalFacts": {
              "calories": {
                "value": 362,
                "unit": "kcal"
              },
              "protein": {
                "value": 14,
                "unit": "g"
              },
              "fat": {
                "value": 4.1,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 65,
                "unit": "g"
              },
              "sugar": {
                "value": 2.5,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-11-06",
            "quantity": {
              "value": 400,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/360/090/001/1037/front.12.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/360/090/001/1037/nutrition.10.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5051399182506",
            "foodTypeId": 2,
            "subCategory": "Chickpeas In Water",
            "nutritionalFacts": {
              "calories": {
                "value": 115,
                "unit": "kcal"
              },
              "protein": {
                "value": 6.7,
                "unit": "g"
              },
              "fat": {
                "value": 2.2,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 13.6,
                "unit": "g"
              },
              "sugar": {
                "value": 0.4,
                "unit": "g"
              },
              "sodium": {
                "value": 40,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-08-06",
            "quantity": {
              "value": 400,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/505/139/918/2506/front_en.39.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/505/139/918/2506/nutrition_en.41.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "6111021090056",
            "foodTypeId": 3,
            "subCategory": "Aicha Tomato Paste",
            "nutritionalFacts": {
              "calories": {
                "value": 119,
                "unit": "kcal"
              },
              "protein": {
                "value": 4.6,
                "unit": "g"
              },
              "fat": {
                "value": 0.4,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 23.7,
                "unit": "g"
              },
              "sugar": {
                "value": 9,
                "unit": "g"
              },
              "sodium": {
                "value": 200,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-09-06",
            "quantity": {
              "value": 1,
              "unit": "item"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/611/102/109/0056/front_fr.15.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/611/102/109/0056/nutrition_fr.17.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "8076800195057",
            "foodTypeId": 1,
            "subCategory": "Spaghetti N.5",
            "nutritionalFacts": {
              "calories": {
                "value": 364,
                "unit": "kcal"
              },
              "protein": {
                "value": 13,
                "unit": "g"
              },
              "fat": {
                "value": 2,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 71,
                "unit": "g"
              },
              "sugar": {
                "value": 3.5,
                "unit": "g"
              },
              "sodium": {
                "value": 4,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-06-06",
            "quantity": {
              "value": 500,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 85,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/807/680/019/5057/front_en.3428.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/807/680/019/5057/nutrition_en.3056.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "8076809529433",
            "foodTypeId": 1,
            "subCategory": "Barilla Penne Rigate Fullkorn 500g",
            "nutritionalFacts": {
              "calories": {
                "value": 350,
                "unit": "kcal"
              },
              "protein": {
                "value": 13,
                "unit": "g"
              },
              "fat": {
                "value": 2.5,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 64,
                "unit": "g"
              },
              "sugar": {
                "value": 3.5,
                "unit": "g"
              },
              "sodium": {
                "value": 4,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-01-06",
            "quantity": {
              "value": 500,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 80,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/807/680/952/9433/front_en.377.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/807/680/952/9433/nutrition_en.374.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "0096619488827",
            "foodTypeId": 2,
            "subCategory": "Chicken, Canned Chicken Breast",
            "nutritionalFacts": {
              "calories": {
                "value": 107,
                "unit": "kcal"
              },
              "protein": {
                "value": 23.2,
                "unit": "g"
              },
              "fat": {
                "value": 1.79,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 482,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-02-06",
            "quantity": {
              "value": 354,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 56,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/009/661/948/8827/front_en.259.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/009/661/948/8827/nutrition_en.261.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5057967342044",
            "foodTypeId": 1,
            "subCategory": "White Tortilla Wraps",
            "nutritionalFacts": {
              "calories": {
                "value": 284,
                "unit": "kcal"
              },
              "protein": {
                "value": 8.2,
                "unit": "g"
              },
              "fat": {
                "value": 5,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 49.7,
                "unit": "g"
              },
              "sugar": {
                "value": 2.2,
                "unit": "g"
              },
              "sodium": {
                "value": 386,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-11-06",
            "quantity": {
              "value": 8,
              "unit": "pack"
            },
            "servingQuantity": {
              "value": 61,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/505/796/734/2044/front_en.48.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/505/796/734/2044/nutrition_en.50.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5057753125769",
            "foodTypeId": 2,
            "subCategory": "Tuna Chunks",
            "nutritionalFacts": {
              "calories": {
                "value": 109,
                "unit": "kcal"
              },
              "protein": {
                "value": 24.9,
                "unit": "g"
              },
              "fat": {
                "value": 1,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 393,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-10-06",
            "quantity": {
              "value": 145,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 102,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/505/775/312/5769/front_en.38.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/505/775/312/5769/nutrition_en.34.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "00389501",
            "foodTypeId": 1,
            "subCategory": "Bistro salad",
            "nutritionalFacts": {
              "calories": {
                "value": 25,
                "unit": "kcal"
              },
              "protein": {
                "value": 1.9,
                "unit": "g"
              },
              "fat": {
                "value": 0.5,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 3.2,
                "unit": "g"
              },
              "sugar": {
                "value": 2.7,
                "unit": "g"
              },
              "sodium": {
                "value": 80,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-05-06",
            "quantity": {
              "value": 150,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/000/000/038/9501/front_en.13.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/000/000/038/9501/nutrition_en.15.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5000295142893",
            "foodTypeId": 5,
            "subCategory": "Mature Cheddar",
            "nutritionalFacts": {
              "calories": {
                "value": 416,
                "unit": "kcal"
              },
              "protein": {
                "value": 25.3,
                "unit": "g"
              },
              "fat": {
                "value": 35,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 657,
                "unit": "mg"
              }
            },
            "expirationDate": "2025-09-06",
            "quantity": {
              "value": 350,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 30,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/500/029/514/2893/front_en.13.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/500/029/514/2893/nutrition_en.19.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5051790270581",
            "foodTypeId": 2,
            "subCategory": "Green Lentils In Water",
            "nutritionalFacts": {
              "calories": {
                "value": 96,
                "unit": "kcal"
              },
              "protein": {
                "value": 6.2,
                "unit": "g"
              },
              "fat": {
                "value": 0.7,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 13.2,
                "unit": "g"
              },
              "sugar": {
                "value": 0.8,
                "unit": "g"
              },
              "sodium": {
                "value": 4,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-04-06",
            "quantity": {
              "value": 390,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 118,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/505/179/027/0581/front_en.45.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/505/179/027/0581/nutrition_en.55.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "01800982",
            "foodTypeId": 2,
            "subCategory": "Chicken & Vegetable broth",
            "nutritionalFacts": {
              "calories": {
                "value": 40,
                "unit": "kcal"
              },
              "protein": {
                "value": 2.5,
                "unit": "g"
              },
              "fat": {
                "value": 1.8,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 3.4,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-06-06",
            "quantity": {
              "value": 600,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 300,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/000/000/180/0982/front_en.5.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/000/000/180/0982/nutrition_en.7.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "5000119410696",
            "foodTypeId": 1,
            "subCategory": "Brown Rice",
            "nutritionalFacts": {
              "calories": {
                "value": 177,
                "unit": "kcal"
              },
              "protein": {
                "value": 4,
                "unit": "g"
              },
              "fat": {
                "value": 1.5,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 35.3,
                "unit": "g"
              },
              "sugar": {
                "value": 0.1,
                "unit": "g"
              },
              "sodium": {
                "value": 4,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-01-06",
            "quantity": {
              "value": 1,
              "unit": "kg"
            },
            "servingQuantity": {
              "value": 77,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/500/011/941/0696/front_en.16.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "20242091",
            "foodTypeId": 3,
            "subCategory": "Br├│coli",
            "nutritionalFacts": {
              "calories": {
                "value": 0,
                "unit": "kcal"
              },
              "protein": {
                "value": 0,
                "unit": "g"
              },
              "fat": {
                "value": 0,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 0,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-01-06",
            "quantity": {
              "value": 500,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 100,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/000/002/024/2091/front_es.102.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "20165079",
            "foodTypeId": 3,
            "subCategory": "British carrots",
            "nutritionalFacts": {
              "calories": {
                "value": 29,
                "unit": "kcal"
              },
              "protein": {
                "value": 0.5,
                "unit": "g"
              },
              "fat": {
                "value": 0.5,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 6,
                "unit": "g"
              },
              "sugar": {
                "value": 5.5,
                "unit": "g"
              },
              "sodium": {
                "value": 28,
                "unit": "mg"
              }
            },
            "expirationDate": "2027-04-06",
            "quantity": {
              "value": 1,
              "unit": "kg"
            },
            "servingQuantity": {
              "value": 80,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/000/002/016/5079/front_en.23.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/000/002/016/5079/nutrition_en.25.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "20142360",
            "foodTypeId": 1,
            "subCategory": "Tast of - Basmati Microwave Rice",
            "nutritionalFacts": {
              "calories": {
                "value": 132,
                "unit": "kcal"
              },
              "protein": {
                "value": 3.12,
                "unit": "g"
              },
              "fat": {
                "value": 0.72,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 27.6,
                "unit": "g"
              },
              "sugar": {
                "value": 0,
                "unit": "g"
              },
              "sodium": {
                "value": 240,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-05-06",
            "quantity": {
              "value": 250,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 125,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/000/002/014/2360/front_en.24.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/000/002/014/2360/nutrition_en.32.400.jpg",
            "count": 5
          },
          {
            "serialNumber": "4088600157924",
            "foodTypeId": 1,
            "subCategory": "Basmati rice",
            "nutritionalFacts": {
              "calories": {
                "value": 134,
                "unit": "kcal"
              },
              "protein": {
                "value": 2.64,
                "unit": "g"
              },
              "fat": {
                "value": 1.84,
                "unit": "g"
              },
              "carbohydrates": {
                "value": 26.4,
                "unit": "g"
              },
              "sugar": {
                "value": 0.08,
                "unit": "g"
              },
              "sodium": {
                "value": 0,
                "unit": "mg"
              }
            },
            "expirationDate": "2026-05-06",
            "quantity": {
              "value": 250,
              "unit": "g"
            },
            "servingQuantity": {
              "value": 125,
              "unit": "g"
            },
            "imageUrl": "https://images.openfoodfacts.org/images/products/408/860/015/7924/front_en.17.400.jpg",
            "nutritionImageUrl": "https://images.openfoodfacts.org/images/products/408/860/015/7924/nutrition_en.19.400.jpg",
            "count": 5
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
        
        console.log('Retrieved database with items');
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
      console.log('Saving database with items');
      localStorage.setItem('foodBankDB', JSON.stringify(db));
      
      // Verify save by immediately reading back
      const savedDB = localStorage.getItem('foodBankDB');
      if (savedDB) {
        const parsedDB = JSON.parse(savedDB);
        console.log('Verification of saved database');
      }
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
    
    console.log(`Updating item with serialNumber ${item.serialNumber}:`, item);
    
    // Find the index of the item to update
    const index = db.inventoryItems.findIndex(i => i.serialNumber === item.serialNumber);
    
    if (index !== -1) {
      // Item exists, update it
      console.log(`Found item at index ${index}, updating it`);
      db.inventoryItems[index] = { ...item };
      
      // Remove any duplicate entries with the same serialNumber
      // This ensures we only have one instance of each item
      if (db.inventoryItems.filter(i => i.serialNumber === item.serialNumber).length > 1) {
        console.log(`Found duplicates for ${item.serialNumber}, removing them`);
        db.inventoryItems = db.inventoryItems.filter((i, idx) => 
          i.serialNumber !== item.serialNumber || idx === index
        );
      }
      
      console.log(`Updated inventory item at index ${index}:`, db.inventoryItems[index]);
    } else {
      // Item doesn't exist yet, add it
      console.log(`Item not found, adding new item`);
      db.inventoryItems.push({ ...item });
    }
    
    // Save the updated database
    save_database(db);
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