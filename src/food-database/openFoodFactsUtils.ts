import { InventoryItem, add_inventory_item, get_inventory_item, update_inventory_item } from './localDatabase';

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
    // Image URLs
    image_front_url?: string;
    image_front_thumb_url?: string;
    image_front_small_url?: string;
    image_nutrition_url?: string;
    image_nutrition_thumb_url?: string;
    image_nutrition_small_url?: string;
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
 * @returns A promise that resolves to an InventoryItem or null if not found
 */
export async function fetchProductByUPC(upcCode: string): Promise<InventoryItem | null> {
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
      data.status === "success" ||
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
    
    // Get product image URL (with fallbacks)
    const imageUrl = data.product.image_front_url || 
                    data.product.image_front_thumb_url || 
                    data.product.image_front_small_url || 
                    '';
    
    // Get nutrition image URL (with fallbacks)
    const nutritionImageUrl = data.product.image_nutrition_url || 
                             data.product.image_nutrition_thumb_url || 
                             data.product.image_nutrition_small_url || 
                             '';
    
    // Create an InventoryItem from the API response
    const inventoryItem: InventoryItem = {
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
      },
      imageUrl: imageUrl,
      nutritionImageUrl: nutritionImageUrl
    };
    
    console.log('Created InventoryItem:', JSON.stringify(inventoryItem, null, 2));
    return inventoryItem;
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
  
  try {
    // Check if the product already exists in the database
    const existingItem = get_inventory_item(upcCode);
    
    if (existingItem) {
      console.log('Product already exists in database, incrementing count', existingItem);
      
      // Increment the count of the existing item
      const currentCount = existingItem.count || 1;
      existingItem.count = currentCount + 1;
      
      console.log(`Updating count from ${currentCount} to ${existingItem.count}`);
      
      // Update the item in the database
      update_inventory_item(existingItem);
      
      // Verify the item was updated
      const updatedItem = get_inventory_item(upcCode);
      if (updatedItem && updatedItem.count === existingItem.count) {
        console.log('Product count incremented successfully to:', updatedItem.count);
      } else {
        console.error('Product count was not updated correctly');
      }
      
      return true; // Return true since the product count was incremented
    }
    
    // If the product doesn't exist, fetch it from the API
    const inventoryItem = await fetchProductByUPC(upcCode);
    
    if (!inventoryItem) {
      console.error('Failed to fetch product data');
      return false;
    }
    
    // Set initial count to 1 for new items
    inventoryItem.count = 1;
    
    console.log('Adding inventory item to database:', inventoryItem);
    add_inventory_item(inventoryItem);
    
    // Verify the item was added
    const addedItem = get_inventory_item(upcCode);
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