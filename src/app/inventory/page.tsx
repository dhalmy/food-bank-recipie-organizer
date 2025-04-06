'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  getAllInventoryItems, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  InventoryItem,
} from '@/food-database/inventoryUtils';
import { addProductByUPC } from '@/food-database/openFoodFactsUtils';
import { initializeDatabase } from '@/food-database/localDatabase';
import { convertRecipesToMinRecipes, minRecipe } from '../recipes/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isScanningUPC, setIsScanningUPC] = useState(false);
  const [upcCode, setUpcCode] = useState('');
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanError, setScanError] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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
      console.log("recipes FOUND in local storage")
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
        // Refresh the inventory list to show the updated count
        const updatedInventory = getAllInventoryItems();
        setInventory(updatedInventory);
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

  const toggleItemExpansion = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  const renderNutritionalFacts = (item: InventoryItem) => {
    if (!item.nutritionalFacts) return null;
    
    const { calories, protein, fat, carbohydrates, sugar, sodium } = item.nutritionalFacts;
    const totalQuantity = item.quantity;
    const servingQuantity = item.servingQuantity?.value || 100;
    const servingQuantityUnit = item.servingQuantity?.unit || 'g';
    
    // Calculate servings per container based on units
    let servingsInfo = '';
    const supportedUnits = ['g', 'oz', 'kg'];
    
    if (supportedUnits.includes(item.unit.toLowerCase())) {
      // Show serving size info
      servingsInfo = `• ${servingQuantity} ${servingQuantityUnit} per serving`;
      
      // Calculate servings per container with unit conversion if needed
      let convertedQuantity = totalQuantity;
      if (item.unit.toLowerCase() === 'oz' && servingQuantityUnit.toLowerCase() === 'g') {
        // Convert oz to g (1 oz ≈ 28.35g)
        convertedQuantity = totalQuantity * 28.35;
      } else if (item.unit.toLowerCase() === 'kg' && servingQuantityUnit.toLowerCase() === 'g') {
        // Convert kg to g
        convertedQuantity = totalQuantity * 1000;
      }
      
      if (servingQuantity > 0) {
        const servings = (convertedQuantity / servingQuantity).toFixed(1);
        servingsInfo += ` • ${servings} servings`;
      }
    }
    
    return (
      <div className="p-4 bg-gray-50 rounded-md">
        <div className="flex gap-4">
          {item.nutritionImageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={item.nutritionImageUrl} 
                alt="Nutrition Facts" 
                className="w-48 h-auto object-contain"
              />
            </div>
          )}
          <div className="flex-grow">
            <h4 className="font-bold text-lg mb-2">Nutrition Facts (per serving)</h4>
            <p className="text-sm text-gray-600 mb-2">
              {totalQuantity}{item.unit} per item{servingsInfo}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p><span className="font-semibold">Calories:</span> {calories.value} {calories.unit}</p>
                <p><span className="font-semibold">Protein:</span> {protein.value} {protein.unit}</p>
                <p><span className="font-semibold">Fat:</span> {fat.value} {fat.unit}</p>
              </div>
              <div>
                <p><span className="font-semibold">Carbs:</span> {carbohydrates.value} {carbohydrates.unit}</p>
                <p><span className="font-semibold">Sugar:</span> {sugar.value} {sugar.unit}</p>
                <p><span className="font-semibold">Sodium:</span> {sodium.value} {sodium.unit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

      {/* Inventory Table */}
      <div className="rounded-md border mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead className="w-20">Quantity</TableHead>
              <TableHead className="w-40">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Nutrition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
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
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell className="font-medium text-center">
                  {item.count || 1}
                </TableCell>
                <TableCell>
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.category}
                    </p>
                    {item.expiryDate && (
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Weight: {item.quantity} {item.unit} per item ({(item.count || 1)} in stock)
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Collapsible>
                    <CollapsibleTrigger 
                      onClick={() => toggleItemExpansion(item.id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      {expandedItems.includes(item.id) ? (
                        <>Hide Nutrition <ChevronUp size={16} /></>
                      ) : (
                        <>Show Nutrition <ChevronDown size={16} /></>
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {renderNutritionalFacts(item)}
                    </CollapsibleContent>
                  </Collapsible>
                </TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No inventory items found. Add items by scanning a UPC code or manually adding them.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 