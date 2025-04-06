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

export function getListOfRecipes(recipes: minRecipe[], ingredients: string[]): string[] {
  return ingredients
}