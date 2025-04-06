export interface minRecipe {
  name: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
}

export function convertRecipesToMinRecipes(recipes: Recipe[]): minRecipe[] {
  const minRecipes: minRecipe[] = [];
  
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const minRecipe: minRecipe = {
      name: recipe.name,
      ingredients: recipe.ingredients
    };
    minRecipes.push(minRecipe);
  }
  
  return minRecipes;
}

export function getListOfRecipes(recipes: minRecipe[], availableIngredients: string[]): string[] {
  // Normalize available ingredients once
  const normalizedAvailable = availableIngredients.map(normalizeIngredient);

  return recipes
    .filter(recipe => canMakeRecipe(recipe, normalizedAvailable))
    .map(recipe => recipe.name); // Convert to string array of names
}

// Helper function to check if a recipe can be made
function canMakeRecipe(recipe: minRecipe, normalizedAvailable: string[]): boolean {
  return recipe.ingredients.every(ingredient => {
    const normalizedIngredient = normalizeIngredient(ingredient.name);
    return normalizedAvailable.some(available => 
      matchesIngredient(normalizedIngredient, available)
    );
  });
}

// Enhanced ingredient matching logic
function matchesIngredient(recipeIng: string, availableIng: string): boolean {
  // Direct match
  if (availableIng.includes(recipeIng) || recipeIng.includes(availableIng)) {
    return true;
  }

  // Split into words and check partial matches
  const recipeWords = recipeIng.split(/\s+/);
  const availableWords = availableIng.split(/\s+/);

  // Count matching words (bidirectional)
  const matchingWords = recipeWords.filter(rw => 
    availableWords.some(aw => aw.includes(rw) || rw.includes(aw))
  ).length;

  // At least half the words should match (minimum 1)
  return matchingWords >= Math.max(1, recipeWords.length / 2);
}

// Normalization function (same as before)
function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(original|organic|fresh|dried|chopped|sliced|canned|ground)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}