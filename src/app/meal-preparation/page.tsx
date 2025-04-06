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
        <div style={loadingContainerStyle}>
          <div style={loadingSpinnerStyle}></div>
          <div style={loadingTextStyle}>Preparing your meal...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <div style={errorIconStyle}>⚠️</div>
          <div>{error}</div>
          <button 
            onClick={() => router.push('/recipes')}
            style={errorButtonStyle}
          >
            Return to Recipes
          </button>
        </div>
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

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return '#4ade80';
      case 'medium': return '#facc15';
      case 'hard': return '#ef4444';
      default: return '#bc4424';
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header and Navigation */}
      <header style={headerContainerStyle}>
        <button style={navLinkStyle} onClick={() => router.push('/recipes')}>
          <span style={backArrowStyle}>←</span> Back to Recipes
        </button>
        <h1 style={headerStyle}>{selectedMeal.name}</h1>
      </header>
      
      <div style={mealCardStyle}>
        <div style={mealInfoStyle}>
          {/* Recipe Stats */}
          <div style={statsStyle}>
            <div style={statItemStyle}>
              <div style={statIconStyle}>⏱️</div>
              <div>
                <div style={statLabelStyle}>Prep Time</div>
                <div style={statValueStyle}>{selectedMeal.prepTime}</div>
              </div>
            </div>
            <div style={statItemStyle}>
              <div style={statIconStyle}>🍳</div>
              <div>
                <div style={statLabelStyle}>Cook Time</div>
                <div style={statValueStyle}>{selectedMeal.cookTime}</div>
              </div>
            </div>
            <div style={statItemStyle}>
              <div style={statIconStyle}>💪</div>
              <div>
                <div style={statLabelStyle}>Difficulty</div>
                <div style={{...statValueStyle, color: getDifficultyColor(selectedMeal.difficulty)}}>
                  {selectedMeal.difficulty}
                </div>
              </div>
            </div>
          </div>
            
          {/* Ingredients Section */}
          <div style={ingredientsContainer}>
            <h2 style={sectionHeaderStyle}>
              <span style={sectionIconStyle}>🛒</span> Ingredients
            </h2>
            <div style={servingAdjustRow}>
              <span style={servingCountBadge}>{count} servings</span>
              <div style={miniButtonGroupStyle}>
                <button 
                  onClick={() => setCount(prev => Math.max(1, prev - 1))}
                  style={miniButtonStyle}
                  disabled={count <= 1}
                >
                  –
                </button>
                <button 
                  onClick={() => setCount(prev => prev + 1)}
                  style={miniButtonStyle}
                >
                  +
                </button>
              </div>
            </div>
            <ul style={ingredientsListStyle}>
              {selectedMeal.ingredients.map((ingredient, index) => (
                <li key={index} style={ingredientStyle}>
                  <span style={ingredientQuantityStyle}>
                    {getAdjustedQuantity(ingredient.quantity, selectedMeal.servings)} {ingredient.unit}
                  </span>
                  <span style={ingredientNameStyle}>{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions Section */}
          <div style={instructionsContainer}>
            <h2 style={sectionHeaderStyle}>
              <span style={sectionIconStyle}>📝</span> Instructions
            </h2>
            <ol style={instructionsListStyle}>
              {selectedMeal.instructions.map((instruction, index) => (
                <li key={index} style={instructionStyle}>
                  <div style={instructionNumberStyle}>{index + 1}</div>
                  <div style={instructionTextStyle}>{instruction}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {/* Side Panel */}
        <div style={sidePanel}>
          <div style={servingControlCard}>
            <h3 style={servingHeaderStyle}>Adjust Servings</h3>
            <div style={buttonGroupStyle}>
              <button 
                onClick={() => setCount(prev => Math.max(1, prev - 1))}
                style={{...buttonStyle, opacity: count <= 1 ? 0.5 : 1}}
                disabled={count <= 1}
              >
                –
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
          
          <div style={tipCardStyle}>
            <div style={tipHeaderStyle}>
              <span style={{marginRight: '8px'}}>💡</span> Helpful Tip
            </div>
            <p style={tipTextStyle}>
              Prepare ingredients in advance and store them in separate containers for quicker assembly when you're ready to cook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Style Definitions

const containerStyle = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  minHeight: '100vh',
  fontFamily: '"EB Garamond", serif',
  color: '#333',
  backgroundColor: '#FFFDF7',
  borderRadius: '12px',
} as const;

const headerContainerStyle = {
  marginBottom: '2rem',
  position: 'relative' as const,
  paddingBottom: '1rem',
  borderBottom: '2px solid #bc4424',
} as const;

const navLinkStyle = {
  background: 'none',
  border: 'none',
  color: '#bc4424',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem 0',
  transition: 'color 0.2s',
  marginBottom: '1rem',
} as const;

const backArrowStyle = {
  fontWeight: 'bold',
  fontSize: '1.2rem',
  marginRight: '0.5rem',
} as const;

const loadingContainerStyle = {
  padding: '4rem',
  textAlign: 'center' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  height: '60vh',
} as const;

const loadingSpinnerStyle = {
  width: '50px',
  height: '50px',
  border: '5px solid rgba(188, 68, 36, 0.2)',
  borderRadius: '50%',
  borderTop: '5px solid #bc4424',
  animation: 'spin 1s linear infinite',
  marginBottom: '1rem',
} as const;

const loadingTextStyle = {
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#bc4424',
} as const;

const errorStyle = {
  padding: '3rem',
  textAlign: 'center' as const,
  fontSize: '1.2rem',
  color: '#ef4444',
  backgroundColor: 'rgba(239, 68, 68, 0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '1rem',
} as const;

const errorIconStyle = {
  fontSize: '2.5rem',
  marginBottom: '1rem',
} as const;

const errorButtonStyle = {
  background: '#bc4424',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '0.75rem 1.5rem',
  cursor: 'pointer',
  fontWeight: '600',
  marginTop: '1rem',
  transition: 'background 0.2s',
} as const;

const emptyStyle = {
  padding: '2rem',
  textAlign: 'center' as const,
  fontSize: '1.2rem',
  opacity: 0.7,
  fontStyle: 'italic',
} as const;

const headerStyle = {
  fontSize: '2.5rem',
  textAlign: 'center' as const,
  color: '#333',
  margin: '0',
  fontWeight: '700',
} as const;

const mealCardStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 300px',
  gap: '2rem',
  borderRadius: '12px',
  padding: '0',
} as const;

const mealInfoStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2rem',
} as const;

const statsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '2px solid #bc4424',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
} as const;

const statItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
} as const;

const statIconStyle = {
  fontSize: '1.8rem',
} as const;

const statLabelStyle = {
  fontSize: '0.9rem',
  color: '#666',
  fontWeight: '600',
} as const;

const statValueStyle = {
  fontSize: '1.1rem',
  fontWeight: '700',
} as const;

const ingredientsContainer = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '2px solid #bc4424',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
} as const;

const instructionsContainer = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '2px solid #bc4424',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
} as const;

const sectionHeaderStyle = {
  fontSize: '1.5rem',
  marginBottom: '1.5rem',
  textAlign: 'left' as const,
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid rgba(188, 68, 36, 0.3)',
  paddingBottom: '0.75rem',
  fontWeight: '700',
} as const;

const sectionIconStyle = {
  marginRight: '0.5rem',
  fontSize: '1.25rem',
} as const;

const servingAdjustRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
} as const;

const servingCountBadge = {
  backgroundColor: '#bc4424',
  color: 'white',
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.9rem',
  fontWeight: '600',
} as const;

const miniButtonGroupStyle = {
  display: 'flex',
  gap: '0.25rem',
} as const;

const miniButtonStyle = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  fontWeight: 'bold',
  backgroundColor: 'rgba(188, 68, 36, 0.1)',
  color: '#bc4424',
  border: '1px solid rgba(188, 68, 36, 0.3)',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s',
} as const;

const ingredientsListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
} as const;

const ingredientStyle = {
  padding: '0.75rem 0',
  borderBottom: '1px solid rgba(188, 68, 36, 0.2)',
  display: 'flex',
  alignItems: 'center',
} as const;

const ingredientQuantityStyle = {
  fontWeight: '700',
  marginRight: '0.75rem',
  minWidth: '80px',
} as const;

const ingredientNameStyle = {
  flex: '1',
} as const;

const instructionsListStyle = {
  listStyleType: 'none',
  paddingLeft: '0',
  margin: '0',
} as const;

const instructionStyle = {
  marginBottom: '1.25rem',
  display: 'flex',
  gap: '1rem',
} as const;

const instructionNumberStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#bc4424',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  flexShrink: 0,
} as const;

const instructionTextStyle = {
  lineHeight: '1.6',
  flex: '1',
} as const;

const sidePanel = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2rem',
} as const;

const servingControlCard = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '2px solid #bc4424',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  textAlign: 'center' as const,
} as const;

const servingHeaderStyle = {
  fontSize: '1.25rem',
  marginBottom: '1.5rem',
  fontWeight: '700',
} as const;

const buttonGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
} as const;

const buttonStyle = {
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  backgroundColor: '#bc4424',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  fontWeight: 'bold',
} as const;

const countStyle = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  minWidth: '50px',
  textAlign: 'center' as const,
} as const;

const tipCardStyle = {
  padding: '1.5rem',
  backgroundColor: 'rgba(188, 68, 36, 0.1)',
  borderRadius: '12px',
  border: '1px dashed #bc4424',
} as const;

const tipHeaderStyle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  marginBottom: '0.75rem',
  display: 'flex',
  alignItems: 'center',
} as const;

const tipTextStyle = {
  margin: '0',
  lineHeight: '1.6',
  fontSize: '0.95rem',
} as const;