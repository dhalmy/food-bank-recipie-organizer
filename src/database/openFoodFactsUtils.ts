import { FoodItem, add_food_item, get_food_item } from './localDatabase';

interface OpenFoodFactsResponse {
  code: string;
  product: {
    _id: string;
    product_name?: string;
    brands?: string;
    categories?: string;
    categories_tags?: string[];
    product_quantity?: string;
    product_quantity_unit?: string;
    serving_quantity?: string;
    serving_quantity_unit?: string;
    serving_size?: string;
    nutriments: {
      'energy-kcal_serving'?: number;
      'energy-kcal_unit'?: string;
      'proteins_serving'?: number;
      'proteins_unit'?: string;
      'fat_serving'?: number;
      'fat_unit'?: string;
      'carbohydrates_serving'?: number;
      'carbohydrates_unit'?: string;
      'sugars_serving'?: number;
      'sugars_unit'?: string;
      'sodium_serving'?: number;
      'sodium_unit'?: string;
    };
  };
  status: number | string;
  status_verbose?: string;
}

/**
 * Fetches product data from OpenFoodFacts API using a UPC-A code
 * @param upcCode The UPC-A code to look up
 * @returns A promise that resolves to a FoodItem or null if not found
 */
export async function fetchProductByUPC(upcCode: string): Promise<FoodItem | null> {
  try {
    console.log(`Fetching product with UPC: ${upcCode}`);
    const apiUrl = `https://world.openfoodfacts.org/api/v3/product/${upcCode}.json`;
    console.log(`API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`Error fetching product: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: OpenFoodFactsResponse = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Log the exact status values
    console.log(`API Status: ${data.status}, Type: ${typeof data.status}`);
    console.log(`API Status Verbose: ${data.status_verbose}, Type: ${typeof data.status_verbose}`);
    
    // Check for valid product data - accept both numeric status 1/0 and string "success_with_warnings"
    const isValidStatus = 
      data.status === 1 || 
      data.status === 0 || 
      data.status === "success_with_warnings";
    
    if (!isValidStatus) {
      console.error(`Product not found. Status: ${data.status}, Status Verbose: ${data.status_verbose || 'undefined'}`);
      return null;
    }
    
    if (!data.product) {
      console.error('Product data is missing in the response');
      return null;
    }
    
    // Extract category from categories_tags if available
    let foodTypeId = 6; // Default to Condiments
    if (data.product.categories_tags && data.product.categories_tags.length > 0) {
      const category = data.product.categories_tags[0].toLowerCase();
      if (category.includes('en:grains') || category.includes('en:cereals')) {
        foodTypeId = 1; // Grains
      } else if (category.includes('en:meats') || category.includes('en:legumes')) {
        foodTypeId = 2; // Proteins
      } else if (category.includes('en:vegetables')) {
        foodTypeId = 3; // Vegetables
      } else if (category.includes('en:fruits')) {
        foodTypeId = 4; // Fruits
      } else if (category.includes('en:dairy')) {
        foodTypeId = 5; // Dairy
      }
    }
    
    // Create a FoodItem from the API response
    const foodItem: FoodItem = {
      serialNumber: upcCode,
      foodTypeId: foodTypeId,
      subCategory: data.product.product_name || data.product.brands || 'Unknown Product',
      nutritionalFacts: {
        calories: {
          value: data.product.nutriments['energy-kcal_serving'] || 0,
          unit: data.product.nutriments['energy-kcal_unit'] || 'kcal'
        },
        protein: {
          value: data.product.nutriments['proteins_serving'] || 0,
          unit: data.product.nutriments['proteins_unit'] || 'g'
        },
        fat: {
          value: data.product.nutriments['fat_serving'] || 0,
          unit: data.product.nutriments['fat_unit'] || 'g'
        },
        carbohydrates: {
          value: data.product.nutriments['carbohydrates_serving'] || 0,
          unit: data.product.nutriments['carbohydrates_unit'] || 'g'
        },
        sugar: {
          value: data.product.nutriments['sugars_serving'] || 0,
          unit: data.product.nutriments['sugars_unit'] || 'g'
        },
        sodium: {
          value: data.product.nutriments['sodium_serving'] || 0,
          unit: data.product.nutriments['sodium_unit'] || 'mg'
        }
      },
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 year from now
      quantity: {
        value: parseFloat(data.product.product_quantity || '1'),
        unit: data.product.product_quantity_unit || 'item'
      },
      servingSize: {
        value: parseFloat(data.product.serving_quantity || '100'),
        unit: data.product.serving_quantity_unit || 'g'
      }
    };
    
    console.log('Created FoodItem:', JSON.stringify(foodItem, null, 2));
    return foodItem;
  } catch (error) {
    console.error('Error fetching product from OpenFoodFacts:', error);
    return null;
  }
}

/**
 * Adds a product to the database using its UPC code
 * @param upcCode The UPC-A code of the product to add
 * @returns A promise that resolves to true if successful, false otherwise
 */
export async function addProductByUPC(upcCode: string): Promise<boolean> {
  console.log(`Adding product with UPC: ${upcCode}`);
  
  // Check if the product already exists in the database
  const existingItem = get_food_item(upcCode);
  if (existingItem) {
    console.log('Product already exists in database:', existingItem);
    return true; // Return true since the product is already in the database
  }
  
  const foodItem = await fetchProductByUPC(upcCode);
  
  if (!foodItem) {
    console.error('Failed to fetch product data');
    return false;
  }
  
  try {
    console.log('Adding food item to database:', foodItem);
    add_food_item(foodItem);
    
    // Verify the item was added
    const addedItem = get_food_item(upcCode);
    if (addedItem) {
      console.log('Product added successfully and verified in database');
      return true;
    } else {
      console.error('Product was not added to database correctly');
      return false;
    }
  } catch (error) {
    console.error('Error adding product to database:', error);
    return false;
  }
} 