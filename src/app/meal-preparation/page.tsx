'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
}

export default function MealPrepPage() {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedMeal = async () => {
      try {
        const response = await fetch('/api/selected-meal');
        if (!response.ok) throw new Error('Failed to fetch meal');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setSelectedMeal(data);
        setCount(data.servings || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meal');
        router.push('/recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchSelectedMeal();
  }, [router]);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading meal details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  if (!selectedMeal) {
    return (
      <div style={containerStyle}>
        <div style={emptyStyle}>No meal selected. Redirecting to recipes...</div>
      </div>
    );
  }

  const getAdjustedQuantity = (quantity: string, originalServings: number) => {
    const num = parseFloat(quantity);
    if (isNaN(num)) return quantity;
    
    const adjusted = (num * count) / originalServings;
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>{selectedMeal.name}</h1>
      
      <div style={mealCardStyle}>
        <div style={mealInfoStyle}>
          <div style={detailsContainer}>
            <div style={statsStyle}>
              <p>Prep Time: {selectedMeal.prepTime}</p>
              <p>Cook Time: {selectedMeal.cookTime}</p>
              <p>Difficulty: {selectedMeal.difficulty}</p>
            </div>
            
            <div style={ingredientsContainer}>
              <h2 style={sectionHeaderStyle}>Ingredients ({count} servings):</h2>
              <ul style={ingredientsListStyle}>
                {selectedMeal.ingredients.map((ingredient, index) => (
                  <li key={index} style={ingredientStyle}>
                    {getAdjustedQuantity(ingredient.quantity, selectedMeal.servings)} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>

            <div style={instructionsContainer}>
              <h2 style={sectionHeaderStyle}>Instructions:</h2>
              <ol style={instructionsListStyle}>
                {selectedMeal.instructions.map((instruction, index) => (
                  <li key={index} style={instructionStyle}>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        
        <div style={controlsContainer}>
          <div style={servingControls}>
            <h3 style={servingHeaderStyle}>Servings:</h3>
            <div style={buttonGroupStyle}>
              <button 
                onClick={() => setCount(prev => Math.max(1, prev - 1))}
                style={buttonStyle}
              >
                -
              </button>
              <span style={countStyle}>{count}</span>
              <button 
                onClick={() => setCount(prev => prev + 1)}
                style={buttonStyle}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Style Definitions
// Style Definitions
const containerStyle = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  minHeight: '100vh',
  backgroundColor: 'var(--background)'
} as const;

const loadingStyle = {
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: 'var(--foreground)',
  opacity: 0.8
} as const;

const errorStyle = {
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: '#ef4444',
  backgroundColor: 'rgba(var(--foreground), 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const emptyStyle = {
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: 'var(--foreground)',
  opacity: 0.7,
  fontStyle: 'italic'
} as const;

const headerStyle = {
  fontSize: '2.5rem',
  marginBottom: '2rem',
  color: 'var(--foreground)',
  textAlign: 'center',
  fontFamily: '"EB Garamond", serif'
} as const;

const mealCardStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 300px',
  gap: '2rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '12px',
  padding: '2rem',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const statsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '1rem',
  padding: '1rem',
  backgroundColor: 'rgba(var(--foreground), 0.05)',
  borderRadius: '8px',
  marginBottom: '1rem',
  color: 'var(--foreground)'
} as const;

const ingredientsContainer = {
  padding: '1rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '8px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const instructionsContainer = {
  padding: '1rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '8px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const sectionHeaderStyle = {
  fontSize: '1.5rem',
  marginBottom: '1rem',
  color: 'var(--foreground)',
  fontFamily: '"EB Garamond", serif'
} as const;

const ingredientStyle = {
  padding: '0.5rem 0',
  borderBottom: '1px solid rgba(var(--foreground), 0.1)',
  color: 'var(--foreground)',
  '&:last-child': {
    borderBottom: 'none'
  }
} as const;

const instructionStyle = {
  padding: '0.5rem 0',
  marginBottom: '0.5rem',
  color: 'var(--foreground)',
  opacity: 0.9
} as const;

const servingControls = {
  padding: '1.5rem',
  backgroundColor: 'rgba(var(--foreground), 0.03)',
  borderRadius: '8px',
  border: '1px solid rgba(var(--foreground), 0.1)'
} as const;

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  fontSize: '1.25rem',
  backgroundColor: 'rgba(var(--foreground), 0.1)',
  color: 'var(--foreground)',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(var(--foreground), 0.2)'
  }
} as const;

const countStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  minWidth: '50px',
  textAlign: 'center',
  color: 'var(--foreground)'
} as const;


const mealInfoStyle = {
  flex: 1
} as const;

const detailsContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2rem'
} as const;

const ingredientsListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0
} as const;

const instructionsListStyle = {
  listStylePosition: 'inside',
  paddingLeft: '1rem'
} as const;


const controlsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  color: 'var(--background)',
} as const;

const servingHeaderStyle = {
  fontSize: '1.25rem',
  marginBottom: '1rem',
  textAlign: 'center'
} as const;

const buttonGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem'
} as const;
