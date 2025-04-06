import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Recipe {
    id: string;
    name: string;
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
    }>;
  }

const selectedMealPath = path.join(process.cwd(), 'src/app/meal-preparation/SelectedMeal.json');

export async function POST(request: Request) {
  try {
    const recipe: Recipe = await request.json();
    
    // Overwrite the SelectedMeal.json file
    await fs.writeFile(selectedMealPath, JSON.stringify(recipe));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving selected meal:', error);
    return NextResponse.json(
      { error: 'Failed to save selected meal' },
      { status: 500 }
    );
  }
}