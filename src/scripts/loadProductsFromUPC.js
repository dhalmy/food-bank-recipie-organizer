const axios = require('axios');

// List of UPC codes to fetch
const upcList = [
  '014800000238', '039400016144', '078742001012', '086600000206',
  '096619653133', '034700054117', '024000163190', '024000163022',
  '024000162971', '024000162995', '024000163015', '00000000040822',
  '861745000010', '021000604647', '051500255162', '098308243236',
  '851552001010', '859941005915', '00447874', '4005817079610',
  '0027000378151', '810032300463', '099482500924', '021000658831',
  '856312002771', '5000171010025', '0699058010828', '5051140474201',
  '0094922424990', '5010046001003', '5057545745946', '4088600550862',
  '3600900011037', '5051399182506', '6111021090056', '8076800195057',
  '8076809529433', '0096619488827', '5057967342044', '5057753125769',
  '00389501', '5000295142893', '5051790270581', '01800982',
  '5000119410696', '20242091', '20165079', '20142360', '4088600157924'
];

// Function to categorize food items into food types
function categorizeFoodType(product) {
  const categories = product.categories_tags || [];
  const productName = product.product_name?.toLowerCase() || '';
  
  // Simple categorization logic
  if (categories.some(c => c.includes('grains') || c.includes('cereal') || c.includes('pasta') || c.includes('bread')))
    return 1; // Grains
  
  if (categories.some(c => c.includes('meat') || c.includes('fish') || c.includes('protein') || c.includes('legume')))
    return 2; // Proteins
  
  if (categories.some(c => c.includes('vegetable') || c.includes('veggies')))
    return 3; // Vegetables
  
  if (categories.some(c => c.includes('fruit')))
    return 4; // Fruits
  
  if (categories.some(c => c.includes('dairy') || c.includes('milk') || c.includes('cheese')))
    return 5; // Dairy
  
  if (categories.some(c => c.includes('condiment') || c.includes('sauce') || c.includes('spice')))
    return 6; // Condiments
  
  // Fallback categorization based on product name
  if (/rice|pasta|bread|grain|cereal|wheat|oat/i.test(productName))
    return 1;
  if (/meat|beef|chicken|fish|protein|bean|lentil/i.test(productName))
    return 2;
  if (/vegetable|carrot|broccoli|spinach|veggie/i.test(productName))
    return 3;
  if (/fruit|apple|banana|orange|berry/i.test(productName))
    return 4;
  if (/milk|cheese|yogurt|dairy/i.test(productName))
    return 5;
  if (/sauce|oil|spice|condiment|salt|sugar/i.test(productName))
    return 6;
  
  // Default to grains if we can't categorize
  return 1;
}

// Function to extract nutritional facts from the product data
function extractNutritionalFacts(product) {
  const nutrients = product.nutriments || {};
  
  return {
    calories: { 
      value: nutrients.energy_kcal_100g || nutrients.energy_100g ? Math.round(nutrients.energy_kcal_100g || nutrients.energy_100g / 4.184) : 0, 
      unit: "kcal" 
    },
    protein: { 
      value: nutrients.proteins_100g || 0, 
      unit: "g" 
    },
    fat: { 
      value: nutrients.fat_100g || 0, 
      unit: "g" 
    },
    carbohydrates: { 
      value: nutrients.carbohydrates_100g || 0, 
      unit: "g" 
    },
    sugar: { 
      value: nutrients.sugars_100g || 0, 
      unit: "g" 
    },
    sodium: { 
      value: nutrients.sodium_100g ? nutrients.sodium_100g * 1000 : 0, 
      unit: "mg" 
    }
  };
}

// Function to determine a subcategory from the product data
function determineSubCategory(product) {
  // Fall back to product name if no categories
  if (product.product_name) {
    return product.product_name;
  }
  
  return "Misc Food Item";
}

// Function to extract quantity and serving size
function extractQuantityAndServing(product) {
  // Try to parse quantity from product data
  let quantity = { value: 1, unit: "item" };
  if (product.quantity) {
    const quantityMatch = product.quantity.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
    if (quantityMatch) {
      quantity = {
        value: parseFloat(quantityMatch[1]),
        unit: quantityMatch[2].toLowerCase()
      };
    }
  }

  // Try to parse serving quantity from product data
  let servingQuantity = { value: 100, unit: "g" }; // Default serving quantity
  if (product.serving_quantity) {
    servingQuantity = {
      value: parseFloat(product.serving_quantity),
      unit: product.serving_quantity_unit || "g"
    };
  }

  return { quantity, servingQuantity };
}

// Generate a future expiration date
function generateExpirationDate() {
  const now = new Date();
  const futureDate = new Date(now.setMonth(now.getMonth() + Math.floor(Math.random() * 24) + 3)); // 3-27 months in the future
  return futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Main function to fetch product data for each UPC
async function fetchProductsData() {
  const inventoryItems = [];
  
  for (const upc of upcList) {
    try {
      console.log(`Fetching data for UPC: ${upc}`);
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${upc}.json`);
      
      if (response.data.status === 1) {
        const product = response.data.product;
        
        // Extract product details
        const foodTypeId = categorizeFoodType(product);
        const subCategory = determineSubCategory(product);
        const nutritionalFacts = extractNutritionalFacts(product);
        const { quantity, servingQuantity } = extractQuantityAndServing(product);
        
        // Get image URLs if available
        const imageUrl = product.image_url || product.image_front_url || undefined;
        const nutritionImageUrl = product.image_nutrition_url || undefined;
        
        // Create inventory item
        const inventoryItem = {
          serialNumber: upc,
          foodTypeId,
          subCategory,
          nutritionalFacts,
          expirationDate: generateExpirationDate(),
          quantity,
          servingQuantity,
          imageUrl,
          nutritionImageUrl,
          count: 1
        };
        
        inventoryItems.push(inventoryItem);
        console.log(`Added product: ${product.product_name || upc}`);
      } else {
        console.log(`No data found for UPC: ${upc}`);
        
        // Create a placeholder item for UPCs not found in the database
        const inventoryItem = {
          serialNumber: upc,
          foodTypeId: 1, // Default to Grains
          subCategory: "Unknown Food Item",
          nutritionalFacts: {
            calories: { value: 0, unit: "kcal" },
            protein: { value: 0, unit: "g" },
            fat: { value: 0, unit: "g" },
            carbohydrates: { value: 0, unit: "g" },
            sugar: { value: 0, unit: "g" },
            sodium: { value: 0, unit: "mg" }
          },
          expirationDate: generateExpirationDate(),
          quantity: { value: 1, unit: "item" },
          servingQuantity: { value: 100, unit: "g" },
          count: 1
        };
        
        inventoryItems.push(inventoryItem);
      }
    } catch (error) {
      console.error(`Error fetching data for UPC ${upc}:`, error);
    }
  }
  
  // Output the inventory items as JSON
  console.log('\n\n----- INVENTORY ITEMS JSON -----\n');
  console.log(JSON.stringify(inventoryItems, null, 2));
  console.log('\n----- END OF JSON -----\n');
  
  return inventoryItems;
}

// Run the script
fetchProductsData().then(() => {
  console.log('Script completed!');
}).catch(error => {
  console.error('Script error:', error);
}); 