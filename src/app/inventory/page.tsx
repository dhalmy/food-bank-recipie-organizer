'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
import { ChevronDown, ChevronUp, Plus, Trash2, Barcode } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isCompactView, setIsCompactView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 0,
    unit: '',
    category: '',
    expiryDate: '',
    imageUrl: '',
    nutritionImageUrl: '',
    count: 1,
    nutritionalFacts: {
      calories: { value: 0, unit: 'kcal' },
      protein: { value: 0, unit: 'g' },
      fat: { value: 0, unit: 'g' },
      carbohydrates: { value: 0, unit: 'g' },
      sugar: { value: 0, unit: 'g' },
      sodium: { value: 0, unit: 'mg' }
    },
    servingQuantity: { value: 100, unit: 'g' }
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
      imageUrl: newItem.imageUrl,
      nutritionImageUrl: newItem.nutritionImageUrl,
      count: newItem.count || 1,
      nutritionalFacts: newItem.nutritionalFacts || {
        calories: { value: 0, unit: 'kcal' },
        protein: { value: 0, unit: 'g' },
        fat: { value: 0, unit: 'g' },
        carbohydrates: { value: 0, unit: 'g' },
        sugar: { value: 0, unit: 'g' },
        sodium: { value: 0, unit: 'mg' }
      },
      servingQuantity: newItem.servingQuantity || { value: 100, unit: 'g' }
    };

    addInventoryItem(item);
    setInventory(getAllInventoryItems());
    setNewItem({
      name: '',
      quantity: 0,
      unit: '',
      category: '',
      expiryDate: '',
      imageUrl: '',
      nutritionImageUrl: '',
      count: 1,
      nutritionalFacts: {
        calories: { value: 0, unit: 'kcal' },
        protein: { value: 0, unit: 'g' },
        fat: { value: 0, unit: 'g' },
        carbohydrates: { value: 0, unit: 'g' },
        sugar: { value: 0, unit: 'g' },
        sodium: { value: 0, unit: 'mg' }
      },
      servingQuantity: { value: 100, unit: 'g' }
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
    const servingSize = item.servingQuantity?.value || 100;
    const servingSizeUnit = item.servingQuantity?.unit || 'g';
    const servings = servingSize > 0 ? (totalQuantity / servingSize).toFixed(1) : '0';
    
    return (
      <div className="p-4 bg-amber-50 rounded-md border border-amber-200 mt-3">
        <div className="flex flex-col md:flex-row gap-4">
          {item.nutritionImageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={item.nutritionImageUrl} 
                alt="Nutrition Facts" 
                className="w-48 h-auto object-contain rounded-md border border-amber-200"
              />
            </div>
          )}
          <div className="flex-grow">
            <h4 className="font-bold text-lg mb-2 text-amber-800">Nutrition Facts (per serving)</h4>
            <p className="text-sm text-amber-700 mb-3">
              {totalQuantity}{item.unit} per item • {servingSize} {servingSizeUnit} per serving • {servings} servings
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white p-3 rounded-md border border-amber-200">
              <div>
                <p className="text-amber-800"><span className="font-semibold">Calories:</span> {calories.value} {calories.unit}</p>
                <p className="text-amber-800"><span className="font-semibold">Protein:</span> {protein.value} {protein.unit}</p>
                <p className="text-amber-800"><span className="font-semibold">Fat:</span> {fat.value} {fat.unit}</p>
              </div>
              <div>
                <p className="text-amber-800"><span className="font-semibold">Carbs:</span> {carbohydrates.value} {carbohydrates.unit}</p>
                <p className="text-amber-800"><span className="font-semibold">Sugar:</span> {sugar.value} {sugar.unit}</p>
                <p className="text-amber-800"><span className="font-semibold">Sodium:</span> {sodium.value} {sodium.unit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add a helper function to get smaller images
  const getCompactImageUrl = (url?: string) => {
    if (!url) return undefined;
    return url.replace('front_en.3.400.jpg', 'front_en.3.100.jpg');
  };

  // Add a function to filter inventory items based on search query
  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    
    const query = searchQuery.toLowerCase().trim();
    return inventory.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );
  }, [inventory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-800 mb-2">Inventory Management</h1>
            <p className="text-amber-700">Manage your food bank inventory items and track nutritional information</p>
          </div>
          <div className="flex gap-3">
            <Button 
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              onClick={() => setIsAddingItem(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
            <Button 
              variant="destructive"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleRemoveItems}
              disabled={selectedItems.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove Items
            </Button>
          </div>
        </div>
        
        {/* UPC Scanner Section */}
        <Card className="p-6 mb-6 bg-white shadow-sm border-amber-200 border-2">
          <CardHeader className="pb-3 px-0">
            <CardTitle className="text-xl font-semibold text-amber-800 flex items-center">
              <Barcode className="mr-2 h-5 w-5 text-orange-500" />
              Scan UPC Code
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-2">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="upc" className="text-amber-700">UPC Code</Label>
                <Input
                  id="upc"
                  value={upcCode}
                  onChange={(e) => setUpcCode(e.target.value)}
                  placeholder="Enter UPC code (e.g., 039400016014)"
                  className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <Button 
                onClick={handleScanUPC}
                disabled={isScanningUPC || !upcCode}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isScanningUPC ? 'Scanning...' : 'Scan UPC'}
              </Button>
            </div>
          </CardContent>
          {(scanStatus || scanError) && (
            <CardFooter className="px-0 pt-3 pb-0 flex flex-col items-start">
              {scanStatus && (
                <p className={`text-sm ${scanStatus.includes('successfully') ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {scanStatus}
                </p>
              )}
              {scanError && (
                <p className="text-sm text-red-600 mt-1">
                  {scanError}
                </p>
              )}
            </CardFooter>
          )}
        </Card>

        {isAddingItem && (
          <Card className="p-6 mb-6 bg-white shadow-sm border-amber-200 border-2">
            <CardHeader className="pb-3 px-0">
              <CardTitle className="text-xl font-semibold text-amber-800 flex items-center">
                <Plus className="mr-2 h-5 w-5 text-orange-500" />
                Add New Item
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-2">
              <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-amber-700">Item Name *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-amber-700">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    required
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-amber-700">Unit *</Label>
                  <Input
                    id="unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    required
                    placeholder="g, ml, oz, etc."
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-amber-700">Category *</Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    required
                    placeholder="e.g. Food Type ID: 1"
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="count" className="text-amber-700">Count (in stock)</Label>
                  <Input
                    id="count"
                    type="number"
                    value={newItem.count}
                    onChange={(e) => setNewItem({ ...newItem, count: Number(e.target.value) })}
                    min="1"
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate" className="text-amber-700">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl" className="text-amber-700">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="nutritionImageUrl" className="text-amber-700">Nutrition Image URL</Label>
                  <Input
                    id="nutritionImageUrl"
                    value={newItem.nutritionImageUrl}
                    onChange={(e) => setNewItem({ ...newItem, nutritionImageUrl: e.target.value })}
                    placeholder="https://example.com/nutrition.jpg"
                    className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="md:col-span-2 pt-2 pb-2">
                  <h3 className="font-semibold text-amber-800 mb-3">Serving Quantity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="servingQuantityValue" className="text-amber-700">Value</Label>
                      <Input
                        id="servingQuantityValue"
                        type="number"
                        value={newItem.servingQuantity?.value}
                        onChange={(e) => setNewItem({ 
                          ...newItem, 
                          servingQuantity: { 
                            ...newItem.servingQuantity!, 
                            value: Number(e.target.value) 
                          } 
                        })}
                        className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="servingQuantityUnit" className="text-amber-700">Unit</Label>
                      <Input
                        id="servingQuantityUnit"
                        value={newItem.servingQuantity?.unit}
                        onChange={(e) => setNewItem({ 
                          ...newItem, 
                          servingQuantity: { 
                            ...newItem.servingQuantity!, 
                            unit: e.target.value 
                          } 
                        })}
                        placeholder="g, ml, oz, etc."
                        className="mt-1.5 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 pt-2 pb-2">
                  <h3 className="font-semibold text-amber-800 mb-3">Nutritional Facts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50 p-4 rounded-md">
                    <div>
                      <Label htmlFor="caloriesValue" className="text-amber-700">Calories</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="caloriesValue"
                          type="number"
                          value={newItem.nutritionalFacts?.calories.value}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              calories: { 
                                ...newItem.nutritionalFacts!.calories, 
                                value: Number(e.target.value) 
                              } 
                            } 
                          })}
                          className="flex-1 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <Input
                          id="caloriesUnit"
                          value={newItem.nutritionalFacts?.calories.unit}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              calories: { 
                                ...newItem.nutritionalFacts!.calories, 
                                unit: e.target.value 
                              } 
                            } 
                          })}
                          className="w-20 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="kcal"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="proteinValue" className="text-amber-700">Protein</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="proteinValue"
                          type="number"
                          value={newItem.nutritionalFacts?.protein.value}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              protein: { 
                                ...newItem.nutritionalFacts!.protein, 
                                value: Number(e.target.value) 
                              } 
                            } 
                          })}
                          className="flex-1 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <Input
                          id="proteinUnit"
                          value={newItem.nutritionalFacts?.protein.unit}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              protein: { 
                                ...newItem.nutritionalFacts!.protein, 
                                unit: e.target.value 
                              } 
                            } 
                          })}
                          className="w-20 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="g"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fatValue" className="text-amber-700">Fat</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="fatValue"
                          type="number"
                          value={newItem.nutritionalFacts?.fat.value}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              fat: { 
                                ...newItem.nutritionalFacts!.fat, 
                                value: Number(e.target.value) 
                              } 
                            } 
                          })}
                          className="flex-1 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <Input
                          id="fatUnit"
                          value={newItem.nutritionalFacts?.fat.unit}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              fat: { 
                                ...newItem.nutritionalFacts!.fat, 
                                unit: e.target.value 
                              } 
                            } 
                          })}
                          className="w-20 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="g"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="carbsValue" className="text-amber-700">Carbohydrates</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="carbsValue"
                          type="number"
                          value={newItem.nutritionalFacts?.carbohydrates.value}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              carbohydrates: { 
                                ...newItem.nutritionalFacts!.carbohydrates, 
                                value: Number(e.target.value) 
                              } 
                            } 
                          })}
                          className="flex-1 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <Input
                          id="carbsUnit"
                          value={newItem.nutritionalFacts?.carbohydrates.unit}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              carbohydrates: { 
                                ...newItem.nutritionalFacts!.carbohydrates, 
                                unit: e.target.value 
                              } 
                            } 
                          })}
                          className="w-20 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="g"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sugarValue" className="text-amber-700">Sugar</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="sugarValue"
                          type="number"
                          value={newItem.nutritionalFacts?.sugar.value}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              sugar: { 
                                ...newItem.nutritionalFacts!.sugar, 
                                value: Number(e.target.value) 
                              } 
                            } 
                          })}
                          className="flex-1 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <Input
                          id="sugarUnit"
                          value={newItem.nutritionalFacts?.sugar.unit}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              sugar: { 
                                ...newItem.nutritionalFacts!.sugar, 
                                unit: e.target.value 
                              } 
                            } 
                          })}
                          className="w-20 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="g"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sodiumValue" className="text-amber-700">Sodium</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="sodiumValue"
                          type="number"
                          value={newItem.nutritionalFacts?.sodium.value}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              sodium: { 
                                ...newItem.nutritionalFacts!.sodium, 
                                value: Number(e.target.value) 
                              } 
                            } 
                          })}
                          className="flex-1 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                        <Input
                          id="sodiumUnit"
                          value={newItem.nutritionalFacts?.sodium.unit}
                          onChange={(e) => setNewItem({ 
                            ...newItem, 
                            nutritionalFacts: { 
                              ...newItem.nutritionalFacts!, 
                              sodium: { 
                                ...newItem.nutritionalFacts!.sodium, 
                                unit: e.target.value 
                              } 
                            } 
                          })}
                          className="w-20 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="mg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-0 pt-5 pb-0">
              <div className="flex gap-3">
                <Button onClick={handleAddItem} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  Save Item
                </Button>
                <Button variant="outline" onClick={() => setIsAddingItem(false)} className="text-amber-700 border-amber-300 hover:bg-amber-100">
                  Cancel
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Inventory Table */}
        <Card className="bg-white shadow-sm border-amber-200 border-2">
          <CardHeader className="pb-3 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-semibold text-amber-800">
                Inventory Items
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-amber-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsCompactView(!isCompactView)}
                  className="text-amber-700 border-amber-300 hover:bg-amber-100 text-sm whitespace-nowrap"
                >
                  {isCompactView ? "Expand View" : "Compact View"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <div className="rounded-md">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow>
                  <TableHead className="w-12 text-amber-700">Select</TableHead>
                  <TableHead className="w-20 text-amber-700">Quantity</TableHead>
                  <TableHead className={`${isCompactView ? 'w-20' : 'w-40'} text-amber-700`}>Image</TableHead>
                  <TableHead className="text-amber-700">Product</TableHead>
                  {!isCompactView && <TableHead className="text-amber-700">Nutrition</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className={`hover:bg-amber-50 ${isCompactView ? 'h-16' : ''}`}>
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
                        className="h-4 w-4 border-amber-300 text-orange-600 focus:ring-orange-500"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-center text-amber-700">
                      {item.count || 1}
                    </TableCell>
                    <TableCell>
                      {item.imageUrl ? (
                        <img 
                          src={isCompactView ? getCompactImageUrl(item.imageUrl) : item.imageUrl} 
                          alt={item.name} 
                          className={`object-contain rounded-md ${isCompactView ? 'w-16 h-16' : 'w-32 h-32'}`}
                        />
                      ) : (
                        <div className={`flex items-center justify-center text-xs text-amber-500 rounded-md bg-amber-100 ${isCompactView ? 'w-16 h-16' : 'w-32 h-32'}`}>
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <h3 className="font-semibold text-amber-800">{item.name}</h3>
                        {!isCompactView && (
                          <>
                            <p className="text-sm text-amber-700 mt-1">
                              {item.category}
                            </p>
                            {item.expiryDate && (
                              <p className="text-sm text-amber-700 mt-1">
                                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                            <p className="text-sm text-amber-700 mt-1">
                              Weight: {item.quantity} {item.unit} per item
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                    {!isCompactView && (
                      <TableCell>
                        <Collapsible>
                          <CollapsibleTrigger 
                            onClick={() => toggleItemExpansion(item.id)}
                            className="flex items-center gap-1 text-orange-600 hover:text-orange-800"
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
                    )}
                  </TableRow>
                ))}
                {filteredInventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isCompactView ? 4 : 5} className="text-center py-10 text-amber-500">
                      {searchQuery ? 
                        `No items found matching "${searchQuery}". Try a different search term.` : 
                        'No inventory items found. Add items by scanning a UPC code or manually adding them.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
} 