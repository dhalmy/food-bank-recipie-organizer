'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  getAllInventoryItems, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  InventoryItem,
  getAllIngredientsList
} from '@/food-database/inventoryUtils';
import { addProductByUPC } from '@/food-database/openFoodFactsUtils';
import { initializeDatabase } from '@/food-database/localDatabase';
import { convertRecipesToMinRecipes, minRecipe } from '../recipes/types';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isScanningUPC, setIsScanningUPC] = useState(false);
  const [upcCode, setUpcCode] = useState('');
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanError, setScanError] = useState<string>('');
  const [minRecipes, setMinRecipes] = useState<minRecipe[]>([]);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 0,
    unit: '',
    category: '',
  });

  // Load inventory items on component mount
  useEffect(() => {
    // Initialize the database first
    initializeDatabase();
    
    // Then load the inventory items
    const items = getAllInventoryItems();
    setInventory(items);

    // Load recipes from localStorage if available
    const storedRecipes = localStorage.getItem('minRecipes');
    if (storedRecipes) {
      setMinRecipes(JSON.parse(storedRecipes));
      console.log("recipies FOUND in local storage")
    }

    // Fetch fresh recipes
    const fetchRecipes = async () => {
      console.log("calling fetch Recipes")
      try {
        const response = await fetch('/api/recipes');
        if (response.ok) {
          const Recipes = await response.json();
          const MinRecipes = await convertRecipesToMinRecipes(Recipes);
          setMinRecipes(MinRecipes);
          localStorage.setItem('minRecipes', JSON.stringify(MinRecipes));
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      }
    };

    fetchRecipes();
    
  }, []);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.unit || !newItem.category) {
      alert('Please fill in all required fields');
      return;
    }

    const item: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      quantity: newItem.quantity || 0,
      unit: newItem.unit,
      category: newItem.category,
      expiryDate: newItem.expiryDate,
    };

    addInventoryItem(item);
    setInventory(getAllInventoryItems());
    setNewItem({
      name: '',
      quantity: 0,
      unit: '',
      category: '',
    });
    setIsAddingItem(false);
  };

  const handleRemoveItems = () => {
    selectedItems.forEach(id => {
      deleteInventoryItem(id);
    });
    setInventory(getAllInventoryItems());
    setSelectedItems([]);
  };

  const handleGetRecipeSuggestions = () => {
    // TODO: Implement recipe suggestion logic
    alert('Recipe suggestion feature coming soon!');
  };

  const handleScanUPC = async () => {
    if (!upcCode) {
      alert('Please enter a UPC code');
      return;
    }

    // Prevent duplicate calls
    if (isScanningUPC) {
      return;
    }

    // Clear previous error messages
    setScanError('');
    setScanStatus('');
    setIsScanningUPC(true);
    setScanStatus('Scanning...');

    try {
      // Try with the exact UPC code
      let success = await addProductByUPC(upcCode);
      
      // If that fails, try with a leading zero if the code is 12 digits
      if (!success && upcCode.length === 12) {
        const paddedUPC = `0${upcCode}`;
        setScanStatus(`Trying with padded UPC: ${paddedUPC}...`);
        success = await addProductByUPC(paddedUPC);
      }
      
      // If that fails, try without a leading zero if the code is 13 digits
      if (!success && upcCode.length === 13 && upcCode.startsWith('0')) {
        const unpaddedUPC = upcCode.substring(1);
        setScanStatus(`Trying with unpadded UPC: ${unpaddedUPC}...`);
        success = await addProductByUPC(unpaddedUPC);
      }
      
      if (success) {
        setScanStatus('Product added successfully!');
        setInventory(getAllInventoryItems());
        setUpcCode('');
      } else {
        setScanStatus('Product not found');
        setScanError('The product could not be found in the OpenFoodFacts database. Try entering the item manually.');
      }
    } catch (error) {
      console.error('Error scanning UPC:', error);
      setScanStatus('Error scanning UPC code');
      setScanError('There was an error connecting to the OpenFoodFacts database. Please try again later.');
    } finally {
      setIsScanningUPC(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setIsAddingItem(true)}>Add Item Manually</Button>
        <Button 
          variant="destructive" 
          onClick={handleRemoveItems}
          disabled={selectedItems.length === 0}
        >
          Remove Selected
        </Button>
        <Button 
          variant="outline" 
          onClick={handleGetRecipeSuggestions}
          disabled={inventory.length === 0}
        >
          Get Recipe Suggestions
        </Button>
      </div>

      {/* UPC Scanner Section */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Scan UPC Code</h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="upc">UPC Code</Label>
            <Input
              id="upc"
              value={upcCode}
              onChange={(e) => setUpcCode(e.target.value)}
              placeholder="Enter UPC code (e.g., 039400016014)"
            />
          </div>
          <Button 
            onClick={handleScanUPC}
            disabled={isScanningUPC || !upcCode}
          >
            {isScanningUPC ? 'Scanning...' : 'Scan UPC'}
          </Button>
        </div>
        {scanStatus && (
          <p className={`mt-2 ${scanStatus.includes('successfully') ? 'text-green-600' : 'text-blue-600'}`}>
            {scanStatus}
          </p>
        )}
        {scanError && (
          <p className="mt-2 text-red-600">
            {scanError}
          </p>
        )}
      </Card>

      {isAddingItem && (
        <Card className="p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem}>Save</Button>
              <Button variant="outline" onClick={() => setIsAddingItem(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {inventory.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems([...selectedItems, item.id]);
                  } else {
                    setSelectedItems(selectedItems.filter(id => id !== item.id));
                  }
                }}
              />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit} • {item.category}
                </p>
                {item.expiryDate && (
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 