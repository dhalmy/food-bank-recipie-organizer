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
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
}

const selectedMealPath = path.join(process.cwd(), 'src/app/meal-preparation/SelectedMeal.json');

export async function GET() {
  try {
    const data = await fs.readFile(selectedMealPath, 'utf-8');
    const meal = JSON.parse(data);
    return NextResponse.json(meal);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load selected meal' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const recipe: Recipe = await request.json();
    await fs.writeFile(selectedMealPath, JSON.stringify(recipe));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save selected meal' },
      { status: 500 }
    );
  }
}