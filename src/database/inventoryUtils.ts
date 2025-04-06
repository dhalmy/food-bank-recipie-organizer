import { FoodItem, get_all_food_items, add_food_item, update_food_item, delete_food_item } from './localDatabase';

// Interface for inventory items (simplified version of FoodItem for the UI)
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
}

// Convert FoodItem to InventoryItem
export function foodItemToInventoryItem(foodItem: FoodItem): InventoryItem {
  return {
    id: foodItem.serialNumber,
    name: foodItem.subCategory,
    quantity: foodItem.quantity.value,
    unit: foodItem.quantity.unit,
    category: `Food Type ID: ${foodItem.foodTypeId}`,
    expiryDate: foodItem.expirationDate
  };
}

// Convert InventoryItem to FoodItem
export function inventoryItemToFoodItem(item: InventoryItem): FoodItem {
  return {
    serialNumber: item.id,
    foodTypeId: parseInt(item.category.split(': ')[1]) || 1, // Default to 1 if parsing fails
    subCategory: item.name,
    nutritionalFacts: {
      calories: { value: 0, unit: 'kcal' },
      protein: { value: 0, unit: 'g' },
      fat: { value: 0, unit: 'g' },
      carbohydrates: { value: 0, unit: 'g' },
      sugar: { value: 0, unit: 'g' },
      sodium: { value: 0, unit: 'mg' }
    },
    expirationDate: item.expiryDate || new Date().toISOString().split('T')[0],
    quantity: {
      value: item.quantity,
      unit: item.unit
    },
    servingSize: {
      value: 100,
      unit: 'g'
    }
  };
}

// Get all inventory items
export function getAllInventoryItems(): InventoryItem[] {
  const foodItems = get_all_food_items();
  return foodItems.map(foodItemToInventoryItem);
}

// Add a new inventory item
export function addInventoryItem(item: InventoryItem): void {
  const foodItem = inventoryItemToFoodItem(item);
  add_food_item(foodItem);
}

// Update an existing inventory item
export function updateInventoryItem(item: InventoryItem): void {
  const foodItem = inventoryItemToFoodItem(item);
  update_food_item(foodItem);
}

// Delete an inventory item
export function deleteInventoryItem(id: string): void {
  delete_food_item(id);
}

// Get inventory items by category
export function getInventoryItemsByCategory(category: string): InventoryItem[] {
  const allItems = getAllInventoryItems();
  return allItems.filter(item => item.category === category);
}

// Get inventory items by expiry date
export function getInventoryItemsByExpiryDate(expiryDate: string): InventoryItem[] {
  const allItems = getAllInventoryItems();
  return allItems.filter(item => item.expiryDate === expiryDate);
}

// Get inventory items expiring soon (within the next 30 days)
export function getInventoryItemsExpiringSoon(): InventoryItem[] {
  const allItems = getAllInventoryItems();
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  return allItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
  });
} 