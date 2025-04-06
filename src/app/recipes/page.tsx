'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllIngredientsList } from '@/food-database/inventoryUtils';
import { convertRecipesToMinRecipes, getListOfRecipes } from './types';

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

export default function RecipesPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<string[]>([]);


  // Load recipes on initial render
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/recipes');
        if (!response.ok) throw new Error('Failed to fetch recipes');
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      } finally {
        setIsLoading(false);
      }
    };

    setAvailableIngredients(getAllIngredientsList());
    setAvailableRecipes(getListOfRecipes(convertRecipesToMinRecipes(recipes), availableIngredients));
    fetchRecipes();
  }, []);

  // Handle selecting a meal
  const handleSelectMeal = async (recipe: Recipe) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/selected-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });

      if (!response.ok) throw new Error('Failed to select meal');
      
      router.push('/meal-preparation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select meal');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate recipe using OpenAI API
  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some description');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setGeneratedRecipe(null);

      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          ingredients: availableIngredients
        })
      });

      if (!response.ok) throw new Error('Failed to generate recipe');
      
      const newRecipe = await response.json();
      setGeneratedRecipe(newRecipe);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
    } finally {
      setIsLoading(false);
    }
  };

  // Save generated recipe to the list
  const saveGeneratedRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedRecipe)
      });

      if (!response.ok) throw new Error('Failed to save recipe');
      
      const updatedData = await response.json();
      setRecipes(updatedData);
      setGeneratedRecipe(null);
      setInput('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Left column: recipe list */}
      <div style={leftColumnStyle}>
        <h2 style={headerStyle}>Recipe List</h2>
        {error && <p style={errorStyle}>{error}</p>}
        {isLoading && recipes.length === 0 ? (
          <p style={loadingStyle}>Loading recipes...</p>
        ) : recipes.length > 0 ? (
          recipes.map(recipe => (
            <div key={recipe.id} style={recipeBoxStyle}>
              <div style={recipeHeaderStyle}>
                <h3 style={recipeNameStyle}>{recipe.name}</h3>
                <button 
                  onClick={() => handleSelectMeal(recipe)}
                  style={selectButtonStyle}
                  disabled={isLoading}
                >
                  {isLoading ? 'Selecting...' : 'Select Meal'}
                </button>
              </div>
              <div style={ingredientsStyle}>
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} style={ingredientStyle}>
                    <span style={quantityStyle}>{ing.quantity} {ing.unit}</span>
                    <span style={nameStyle}>{ing.name}</span>
                  </div>
                ))}
              </div>
              <div style={detailsStyle}>
                <span>{recipe.cuisine} • {recipe.difficulty}</span>
                <span>{recipe.prepTime} prep • {recipe.cookTime} cook</span>
              </div>
            </div>
          ))
        ) : (
          <p style={emptyStyle}>No recipes yet. Add some!</p>
        )}
      </div>

      {/* Right column: controls */}
      <div style={rightColumnStyle}>
        <h2 style={headerStyle}>Recipe Generator</h2>
        
        <div style={controlsContainer}>
          <div style={buttonGroupStyle}>
            <button 
              onClick={handleGenerate} 
              style={generateButtonStyle}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Recipe'}
            </button>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your recipe (e.g. 'quick chicken dinner')"
            style={inputStyle}
            disabled={isLoading}
          />

          {generatedRecipe && (
            <div style={previewContainer}>
              <h3 style={previewHeader}>Generated Recipe Preview</h3>
              <div style={previewContent}>
                <h4 style={recipeNameStyle}>{generatedRecipe.name}</h4>
                <div style={ingredientsStyle}>
                  {generatedRecipe.ingredients.map((ing, i) => (
                    <div key={i} style={ingredientStyle}>
                      <span style={quantityStyle}>{ing.quantity} {ing.unit}</span>
                      <span style={nameStyle}>{ing.name}</span>
                    </div>
                  ))}
                </div>
                <div style={detailsStyle}>
                  <span>{generatedRecipe.cuisine} • {generatedRecipe.difficulty}</span>
                  <span>{generatedRecipe.prepTime} prep • {generatedRecipe.cookTime} cook</span>
                </div>
                <button 
                  onClick={saveGeneratedRecipe}
                  style={saveButtonStyle}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Add to Recipes'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={baseIngredientsContainer}>
          <p style={baseIngredientsTitle}>Available Base Ingredients:</p>
          <div style={baseIngredientsList}>
            {availableIngredients.map((ing, i) => (
              <span key={i} style={baseIngredientStyle}>{ing}</span>
            ))}
          </div>
        </div>

        <div style={baseIngredientsContainer}>
          <p style={baseIngredientsTitle}>Available Recipes:</p>
          <div style={baseIngredientsList}>
            {availableRecipes.map((ing, i) => (
              <span key={i} style={baseIngredientStyle}>{ing}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Style Definitions
const containerStyle = {
  display: 'flex',
  gap: '2rem',
  padding: '2rem',
  minHeight: '100vh',
  backgroundColor: 'var(--background)'
} as const;

const leftColumnStyle = {
  flex: 1,
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
} as const;

const rightColumnStyle = {
  flex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem'
} as const;

const headerStyle = {
  fontSize: '1.5rem',
  marginBottom: '1rem',
  color: 'var(--foreground)',
  fontFamily: '"EB Garamond", serif'
} as const;

const recipeBoxStyle = {
  padding: '1.5rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '12px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const recipeHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
} as const;

const recipeNameStyle = {
  fontSize: '1.2rem',
  color: 'var(--foreground)'
} as const;

const selectButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: 'rgba(var(--foreground), 0.1)',
  color: 'var(--foreground)',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(var(--foreground), 0.2)'
  },
  ':disabled': {
    backgroundColor: 'rgba(var(--foreground), 0.05)',
    cursor: 'not-allowed'
  }
} as const;

const ingredientsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
} as const;

const ingredientStyle = {
  display: 'flex',
  gap: '0.5rem',
  color: 'var(--foreground)'
} as const;

const quantityStyle = {
  fontWeight: 'bold',
  color: 'var(--foreground)'
} as const;

const nameStyle = {
  color: 'var(--foreground)',
  opacity: 0.9
} as const;

const detailsStyle = {
  marginTop: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
  opacity: 0.8
} as const;

const loadingStyle = {
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: 'var(--foreground)',
  opacity: 0.8
} as const;

const errorStyle = {
  padding: '1rem',
  textAlign: 'center',
  fontSize: '1rem',
  color: '#ef4444',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(239, 68, 68, 0.2)'
} as const;

const emptyStyle = {
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: 'var(--foreground)',
  opacity: 0.7,
  fontStyle: 'italic'
} as const;

const controlsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '12px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem'
} as const;

const generateButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'rgba(var(--foreground), 0.1)',
  color: 'var(--foreground)',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  flex: 1,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(var(--foreground), 0.2)'
  },
  ':disabled': {
    backgroundColor: 'rgba(var(--foreground), 0.05)',
    cursor: 'not-allowed'
  }
} as const;

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid rgba(var(--foreground), 0.2)',
  borderRadius: '6px',
  fontSize: '1rem',
  width: '100%',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  color: 'var(--foreground)',
  transition: 'background-color 0.2s',
  ':disabled': {
    backgroundColor: 'rgba(var(--foreground), 0.05)'
  }
} as const;

const previewContainer = {
  marginTop: '2rem',
  padding: '1.5rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '12px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const previewHeader = {
  fontSize: '1.25rem',
  marginBottom: '1rem',
  color: 'var(--foreground)',
  fontFamily: '"EB Garamond", serif'
} as const;

const previewContent = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
} as const;

const saveButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'rgba(var(--foreground), 0.1)',
  color: 'var(--foreground)',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.2s',
  marginTop: '1rem',
  '&:hover': {
    backgroundColor: 'rgba(var(--foreground), 0.2)'
  },
  ':disabled': {
    backgroundColor: 'rgba(var(--foreground), 0.05)',
    cursor: 'not-allowed'
  }
} as const;

const baseIngredientsContainer = {
  padding: '1.5rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '12px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const baseIngredientsTitle = {
  marginBottom: '0.5rem',
  color: 'var(--foreground)',
  opacity: 0.8
} as const;

const baseIngredientsList = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem'
} as const;

const baseIngredientStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: 'rgba(var(--foreground), 0.1)',
  borderRadius: '20px',
  fontSize: '0.9rem',
  color: 'var(--foreground)'
} as const;