'use client';

import React, { useState, useEffect } from 'react';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export default function RecipesPage() {
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseIngredients = ['pasta', 'chicken', 'salad', 'tomato', 'rice'];

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
    fetchRecipes();
  }, []);

  // Add dummy recipe to JSONL
  const addDummyRecipe = async () => {
    const dummyRecipe: Recipe = {
      id: `dummy-${Date.now()}`,
      name: `Dummy Recipe ${recipes.length + 1}`,
      ingredients: [
        { 
          name: baseIngredients[Math.floor(Math.random() * baseIngredients.length)], 
          quantity: (Math.floor(Math.random() * 5) + 1).toString(), 
          unit: ['g', 'cups', 'pieces'][Math.floor(Math.random() * 3)] 
        },
        { 
          name: baseIngredients[Math.floor(Math.random() * baseIngredients.length)], 
          quantity: (Math.floor(Math.random() * 3) + 1).toString(), 
          unit: ['g', 'tbsp', 'pieces'][Math.floor(Math.random() * 3)] 
        }
      ]
    };

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyRecipe)
      });

      if (!response.ok) throw new Error('Failed to save recipe');
      
      const updatedData = await response.json();
      setRecipes(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add dummy recipe');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate recipe based on input
  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some description');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const selectedIngredients = [...baseIngredients]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 2) + 2);

      const newRecipe: Recipe = {
        id: `gen-${Date.now()}`,
        name: `Generated ${input.split(' ')[0]} Recipe`,
        ingredients: selectedIngredients.map(ing => ({
          name: ing,
          quantity: (Math.floor(Math.random() * 3) + 1).toString(),
          unit: ['g', 'cups', 'pieces'][Math.floor(Math.random() * 3)]
        }))
      };

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe)
      });

      if (!response.ok) throw new Error('Failed to save generated recipe');
      
      const updatedData = await response.json();
      setRecipes(updatedData);
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
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
              <h3 style={recipeNameStyle}>{recipe.name}</h3>
              <div style={ingredientsStyle}>
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} style={ingredientStyle}>
                    <span style={quantityStyle}>{ing.quantity} {ing.unit}</span>
                    <span style={nameStyle}>{ing.name}</span>
                  </div>
                ))}
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
            <button 
              onClick={addDummyRecipe} 
              style={dummyButtonStyle}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Dummy Recipe'}
            </button>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your recipe (e.g. 'quick dinner')"
            style={inputStyle}
            disabled={isLoading}
          />
        </div>

        <div style={baseIngredientsContainer}>
          <p style={baseIngredientsTitle}>Available Base Ingredients:</p>
          <div style={baseIngredientsList}>
            {baseIngredients.map((ing, i) => (
              <span key={i} style={baseIngredientStyle}>{ing}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  display: 'flex',
  gap: '2rem',
  padding: '2rem',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5'
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
  color: '#333'
} as const;

const recipeBoxStyle = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
} as const;

const recipeNameStyle = {
  fontSize: '1.2rem',
  marginBottom: '1rem',
  color: '#444'
} as const;

const ingredientsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
} as const;

const ingredientStyle = {
  display: 'flex',
  gap: '0.5rem'
} as const;

const quantityStyle = {
  fontWeight: 'bold',
  color: '#0070f3'
} as const;

const nameStyle = {
  color: '#666'
} as const;

const emptyStyle = {
  color: '#999',
  fontStyle: 'italic'
} as const;

const loadingStyle = {
  color: '#666'
} as const;

const errorStyle = {
  color: '#ff3333',
  padding: '0.5rem',
  backgroundColor: '#ffeeee',
  borderRadius: '4px'
} as const;

const controlsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
} as const;

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem'
} as const;

const generateButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  flex: 2,
  ':disabled': {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed'
  }
} as const;

const dummyButtonStyle = {
  ...generateButtonStyle,
  backgroundColor: '#4CAF50',
  flex: 1,
  ':disabled': {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed'
  }
} as const;

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '1rem',
  width: '100%',
  ':disabled': {
    backgroundColor: '#f0f0f0'
  }
} as const;

const baseIngredientsContainer = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
} as const;

const baseIngredientsTitle = {
  marginBottom: '0.5rem',
  color: '#666'
} as const;

const baseIngredientsList = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem'
} as const;

const baseIngredientStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#f0f0f0',
  borderRadius: '20px',
  fontSize: '0.9rem',
  color: '#333'
} as const;