import { InventoryItem as DatabaseInventoryItem, get_all_inventory_items, add_inventory_item, update_inventory_item, delete_inventory_item, get_inventory_item, decrement_item, initializeDatabase } from './localDatabase';

// Interface for inventory items (simplified version for the UI)
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
  imageUrl?: string;
  nutritionImageUrl?: string;
  nutritionalFacts?: any;
  servingQuantity?: { value: number; unit: string };
  count?: number;
}

// Convert DatabaseInventoryItem to UI InventoryItem
export function databaseItemToUIItem(item: DatabaseInventoryItem): InventoryItem {
  return {
    id: item.serialNumber,
    name: item.subCategory,
    quantity: item.quantity.value,
    unit: item.quantity.unit,
    category: `Food Type ID: ${item.foodTypeId}`,
    expiryDate: item.expirationDate,
    imageUrl: item.imageUrl,
    nutritionImageUrl: item.nutritionImageUrl,
    nutritionalFacts: item.nutritionalFacts,
    servingQuantity: item.servingQuantity,
    count: item.count || 1
  };
}

// Convert UI InventoryItem to DatabaseInventoryItem
export function uiItemToDatabaseItem(item: InventoryItem): DatabaseInventoryItem {
  return {
    serialNumber: item.id,
    foodTypeId: parseInt(item.category.split(': ')[1]) || 1, // Default to 1 if parsing fails
    subCategory: item.name,
    nutritionalFacts: item.nutritionalFacts || {
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
    servingQuantity: item.servingQuantity || {
      value: 100,
      unit: 'g'
    },
    imageUrl: item.imageUrl,
    nutritionImageUrl: item.nutritionImageUrl,
    count: item.count || 1
  };
}

// Get all inventory items with counts for duplicates
export function getAllInventoryItems(): InventoryItem[] {
  try {
    // Check if database is initialized
    const isInitialized = typeof window !== 'undefined' && localStorage.getItem('dbInitialized') === 'true';
    
    if (!isInitialized) {
      console.warn('Database not fully initialized yet, attempting initialization');
      const initialized = initializeDatabase();
      
      if (!initialized) {
        console.warn('Failed to initialize database in getAllInventoryItems');
        return [];
      }
    }
    
    const databaseItems = get_all_inventory_items();
    console.log('Retrieved database items:', databaseItems);
    
    if (!databaseItems || databaseItems.length === 0) {
      console.warn('No inventory items found in database, returning empty array');
      return [];
    }

    // Convert database items to UI items, preserving all properties including count
    const uiItems = databaseItems.map(databaseItemToUIItem);
    console.log('Converted to UI items:', uiItems);
    
    return uiItems;
  } catch (error) {
    console.error('Error getting inventory items:', error);
    return [];
  }
}

export function getAllIngredientsList(): string[] {
  const ingredients: Set<string> = new Set(); // Using Set to ensure uniqueness
  const allItems = getAllInventoryItems();

  // Add all inventory item names as ingredients
  allItems.forEach(item => {
    if (item.name) {
      ingredients.add(item.name.trim());
    }
  });

  // Convert Set to array and sort alphabetically
  return Array.from(ingredients).sort((a, b) => a.localeCompare(b));
}

// Add a new inventory item (with duplicate detection)
export function addInventoryItem(item: InventoryItem): void {
  const databaseItem = uiItemToDatabaseItem(item);
  add_inventory_item(databaseItem);
}

// Update an existing inventory item
export function updateInventoryItem(item: InventoryItem): void {
  const databaseItem = uiItemToDatabaseItem(item);
  update_inventory_item(databaseItem);
}

// Delete an inventory item
export function deleteInventoryItem(id: string): void {
  delete_inventory_item(id);
}

export function decrementItem(id: string): void {
  decrement_item(id);
}

export function incrementItem(id: string): void {
  incrementItem(id);
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