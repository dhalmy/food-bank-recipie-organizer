export interface minRecipe {
  name: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  ingredients: Ingredient[];
  prepTime: string;
  cookTime: string;
  instructions: string[];
  servings: number;
  equipment: string[];
  difficulty: string;
  author: string;
}

function convertStringTimeToNumber(time: string): number {
  // Remove any leading/trailing whitespace
  const trimmedTime = time.trim();
  
  // Check if the string is empty
  if (!trimmedTime) {
    return 0;
  }
  
  // Handle case with just "0 minutes" or "0 hours"
  if (trimmedTime.startsWith('0')) {
    return 0;
  }
  
  // Check if time contains hours
  if (trimmedTime.includes('hour') || trimmedTime.includes('hr')) {
    const hoursMatch = trimmedTime.match(/(\d+)\s*(hour|hr)/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    
    // Check if time also contains minutes
    const minutesMatch = trimmedTime.match(/(\d+)\s*(minute|min)/i);
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    
    return (hours * 60) + minutes;
  }
  
  // If only minutes are present
  const minutesMatch = trimmedTime.match(/(\d+)\s*(minute|min)/i);
  if (minutesMatch) {
    return parseInt(minutesMatch[1], 10);
  }
  
  // If it's just a number, assume it's minutes
  const justNumber = trimmedTime.match(/^(\d+)$/);
  if (justNumber) {
    return parseInt(justNumber[1], 10);
  }
  
  // Default case if no pattern matches
  return 0;
}

//check difficulty
export function filterCookingLevel(recipes: Recipe[], difficulty: string[]): Recipe[] {
  return recipes.filter(recipe => difficulty.includes(recipe.difficulty));
}

// filters for if cooking time takes longer than desired
export function filterCookingTime(recipe: Recipe[], time_min: number): Recipe[] {
  return recipe.filter(recipe => convertStringTimeToNumber(recipe.cookTime) > time_min);
}
// filters for if prep time takes longer than desired
export function filterPrepTime(recipe: Recipe[], time_min: number): Recipe[] {
  return recipe.filter(recipe => convertStringTimeToNumber(recipe.prepTime) > time_min)
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

export function getRecipeFromName(recipes: Recipe[], name: string): Recipe {
  const foundRecipe = recipes.find(recipe => recipe.name === name);
  
  if (!foundRecipe) {
    // Return a default recipe object rather than undefined
    return {
      id: 'not-found',
      name: 'Recipe Not Found',
      cuisine: '',
      ingredients: [],
      prepTime: '',
      cookTime: '',
      instructions: ['Recipe could not be found'],
      servings: 0,
      equipment: [],
      difficulty: 'unknown',
      author: 'system'
    };
  }

  return foundRecipe;
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