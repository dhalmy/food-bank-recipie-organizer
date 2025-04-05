'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({
    name: '',
    quantity: 0,
    unit: '',
    category: '',
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.unit || !newItem.category) {
      alert('Please fill in all required fields');
      return;
    }

    const item: FoodItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      quantity: newItem.quantity || 0,
      unit: newItem.unit,
      category: newItem.category,
      expiryDate: newItem.expiryDate,
    };

    setInventory([...inventory, item]);
    setNewItem({
      name: '',
      quantity: 0,
      unit: '',
      category: '',
    });
    setIsAddingItem(false);
  };

  const handleRemoveItems = () => {
    setInventory(inventory.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const handleGetRecipeSuggestions = () => {
    // TODO: Implement recipe suggestion logic
    alert('Recipe suggestion feature coming soon!');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setIsAddingItem(true)}>Add Item</Button>
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

      {isAddingItem && (
        <Card className="p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={newItem.unit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, category: e.target.value })}
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