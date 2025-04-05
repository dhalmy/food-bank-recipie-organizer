// src/app/api/recipes/route.ts
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

const recipesFilePath = path.join(process.cwd(), 'src/app/recipes/recipes.jsonl');

// Helper function to read and parse recipes
async function getRecipes(): Promise<Recipe[]> {
  try {
    await fs.access(recipesFilePath);
  } catch {
    await fs.writeFile(recipesFilePath, '');
    return [];
  }

  const data = await fs.readFile(recipesFilePath, 'utf-8');
  const recipes: Recipe[] = [];

  data.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const recipe = JSON.parse(trimmed);
      if (validateRecipe(recipe)) {
        recipes.push(recipe);
      }
    } catch (error) {
      console.error(`Error parsing line ${index + 1}: ${error.message}`);
    }
  });

  return recipes;
}

// Validate recipe structure
function validateRecipe(recipe: any): recipe is Recipe {
  return (
    typeof recipe?.id === 'string' &&
    typeof recipe?.name === 'string' &&
    Array.isArray(recipe?.ingredients) &&
    recipe.ingredients.every(ing => 
      typeof ing?.name === 'string' &&
      typeof ing?.quantity === 'string' &&
      typeof ing?.unit === 'string'
    )
  );
}

export async function GET() {
  try {
    const recipes = await getRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error reading recipes:', error);
    return NextResponse.json(
      { error: 'Failed to load recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newRecipe = await request.json();
    
    if (!validateRecipe(newRecipe)) {
      return NextResponse.json(
        { error: 'Invalid recipe format' },
        { status: 400 }
      );
    }

    await fs.appendFile(recipesFilePath, JSON.stringify(newRecipe) + '\n');
    const updatedRecipes = await getRecipes();

    return NextResponse.json(updatedRecipes);
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    );
  }
}