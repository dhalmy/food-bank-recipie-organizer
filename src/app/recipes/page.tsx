'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAllIngredientsList } from '@/food-database/inventoryUtils';
import { convertRecipesToMinRecipes, filterCookingLevel, filterCookingTime, filterPrepTime, getListOfRecipes, getRecipeFromName } from './types';
import recipeListTitle from './recipe-list-title.png';
import recipeGeneratorTitle from './recipe-generator-title.png';

// Add custom style for hiding scrollbars
const hideScrollbarStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Replace with fancy scrollbar styles
const fancyScrollbarStyles = `
  .fancy-scrollbar::-webkit-scrollbar {
    height: 8px;
    background-color: #f5f0e8;
    border-radius: 4px;
  }
  
  .fancy-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e67e22;
    border-radius: 4px;
    border: 2px solid #f5f0e8;
  }
  
  .fancy-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #d35400;
  }
  
  .fancy-scrollbar::-webkit-scrollbar-track {
    background-color: #f5f0e8;
    border-radius: 4px;
  }
`;

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

// Style Definitions
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '2rem',
  minHeight: '100vh',
  backgroundColor: '#FFF8F0', // Warm off-white background
  backgroundImage: 'linear-gradient(rgba(255, 248, 240, 0.9), rgba(255, 248, 240, 0.9)), url("https://www.transparenttextures.com/patterns/food.png")',
  fontFamily: '"Poppins", sans-serif',
} as const;

const mainLayoutContainer = {
  display: 'flex',
  gap: '2.5rem',
  maxWidth: '1400px',
  margin: '0 auto 2rem auto',
  width: '100%',
  position: 'relative',
  '@media (maxWidth: 992px)': {
    flexDirection: 'column',
    gap: '1.5rem',
  }
} as const;

const leftColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  width: '65%',
  height: '100%',
  '@media (maxWidth: 992px)': {
    width: '100%',
  }
} as const;

const rightColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '35%',
  position: 'relative',
  alignSelf: 'stretch',
  '@media (maxWidth: 992px)': {
    width: '100%',
  }
} as const;

const rightScrollContainer = {
  padding: '1.5rem',
  backgroundColor: '#FFF',
  borderRadius: '12px',
  border: '1px solid #E9D8C4',
  boxShadow: '0 4px 10px rgba(210, 140, 60, 0.1)',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '@media (maxWidth: 992px)': {
    position: 'relative',
    width: '100%',
  }
} as const;

const pageHeaderStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
  position: 'relative',
  padding: '2rem 1rem',
  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url("https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(210, 140, 60, 0.15)',
  maxWidth: '1200px',
  margin: '0 auto 2rem auto',
  width: 'calc(100% - 2rem)',
  '@media (maxWidth: 768px)': {
    padding: '1.5rem 1rem',
  }
} as const;

const recipeNameStyle = {
  fontSize: '1.4rem',
  fontWeight: '600',
  color: '#834D18', // Warm brown
  fontFamily: '"Playfair Display", serif'
} as const;

const recipeHeaderStyle = {
  marginBottom: '1rem',
  borderBottom: '2px dotted #E9D8C4',
  paddingBottom: '0.75rem',
} as const;

const ingredientsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '0.75rem',
  backgroundColor: '#FFF8F0',
  borderRadius: '8px',
  border: '1px dashed #E9D8C4',
} as const;

const miniIngredientsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '0.75rem',
  backgroundColor: '#FFF8F0',
  borderRadius: '8px',
  border: '1px dashed #E9D8C4',
} as const;

const ingredientStyle = {
  display: 'flex',
  gap: '0.5rem',
  color: '#5D4037', // Deep brown
  fontSize: '0.95rem',
} as const;

const quantityStyle = {
  fontWeight: 'bold',
  color: '#834D18', // Warm brown
} as const;

const nameStyle = {
  color: '#5D4037', // Deep brown
} as const;

const detailsStyle = {
  marginTop: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  color: '#8D6E63', // Lighter brown
  padding: '0.5rem 0.75rem',
  backgroundColor: 'rgba(233, 216, 196, 0.3)',
  borderRadius: '6px',
} as const;

const generatorSectionContainer = {
  padding: '1.5rem',
  backgroundColor: '#FFF',
  borderRadius: '12px',
  border: '1px solid #E9D8C4',
  boxShadow: '0 4px 10px rgba(210, 140, 60, 0.1)',
  width: '100%',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
} as const;

const ingredientsFlowContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
} as const;

const ingredientsSectionContainer = {
  padding: '1.5rem',
  backgroundColor: '#FFF',
  borderRadius: '12px',
  border: '1px solid #E9D8C4',
  boxShadow: '0 4px 10px rgba(210, 140, 60, 0.1)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
} as const;

const ingredientSelectorContainer = {
  backgroundColor: '#FFF8F0',
  borderRadius: '8px',
  border: '1px dashed #E9D8C4',
  padding: '1rem',
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
} as const;

const baseIngredientsList = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  overflowY: 'auto',
  padding: '0.5rem',
  height: '100%',
  maxHeight: '400px',
  '@media (maxWidth: 992px)': {
    maxHeight: '250px',
  }
} as const;

const baseIngredientStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#FFF8F0',
  borderRadius: '20px',
  fontSize: '0.9rem',
  color: '#5D4037',
  border: '1px solid #E9D8C4',
  transition: 'all 0.2s',
} as const;

const selectedIngredientsContainer = {
  padding: '1.5rem',
  backgroundColor: 'rgba(230, 126, 34, 0.05)',
  borderRadius: '8px',
  border: '1px dashed #E67E22',
  marginBottom: '1.5rem',
  width: '100%',
} as const;

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem',
} as const;

const miniSelectButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#E67E22', // Orange
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: '600',
  transition: 'all 0.2s',
  boxShadow: '0 2px 5px rgba(230, 126, 34, 0.3)',
  marginTop: '1rem',
  alignSelf: 'center',
  width: '100%',
  '&:hover': {
    backgroundColor: '#D35400',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(230, 126, 34, 0.4)',
  },
  ':disabled': {
    backgroundColor: '#F3AF7D',
    cursor: 'not-allowed',
    boxShadow: 'none',
  }
} as const;

const generateButtonStyle = {
  padding: '0.75rem 2rem',
  backgroundColor: '#E67E22', // Orange
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '600',
  transition: 'all 0.2s',
  boxShadow: '0 4px 8px rgba(230, 126, 34, 0.3)',
  alignSelf: 'center',
  width: '250px',
  margin: '0 auto',
  '&:hover': {
    backgroundColor: '#D35400',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.4)',
  },
  ':disabled': {
    backgroundColor: '#F3AF7D',
    cursor: 'not-allowed',
    boxShadow: 'none',
  }
} as const;

const loadingStyle = {
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: '#834D18',
  opacity: 0.8,
} as const;

const errorStyle = {
  padding: '1rem',
  textAlign: 'center',
  fontSize: '1rem',
  color: '#e74c3c',
  backgroundColor: 'rgba(231, 76, 60, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(231, 76, 60, 0.2)',
} as const;

const emptyStyle = {
  padding: '2rem',
  textAlign: 'center',
  fontSize: '1.2rem',
  color: '#8D6E63',
  opacity: 0.8,
  fontStyle: 'italic',
} as const;

const recipesGridContainer = {
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
} as const;

const previewContainer = {
  marginTop: '2rem',
  padding: '1.5rem',
  backgroundColor: '#FFF',
  borderRadius: '12px',
  border: '1px solid #E9D8C4',
  boxShadow: '0 4px 10px rgba(210, 140, 60, 0.1)',
} as const;

const previewHeader = {
  fontSize: '1.4rem',
  marginBottom: '1rem',
  color: '#834D18',
  fontFamily: '"Playfair Display", serif',
  borderBottom: '2px dotted #E9D8C4',
  paddingBottom: '0.5rem',
} as const;

const previewContent = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
} as const;

const saveButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#E67E22', // Orange
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '600',
  transition: 'all 0.2s',
  marginTop: '1rem',
  boxShadow: '0 2px 5px rgba(230, 126, 34, 0.3)',
  '&:hover': {
    backgroundColor: '#D35400',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(230, 126, 34, 0.4)',
  },
  ':disabled': {
    backgroundColor: '#F3AF7D',
    cursor: 'not-allowed',
    boxShadow: 'none',
  }
} as const;

// Recipe cards styles
const compactRecipeCardStyle = {
  padding: '0.7rem',
  backgroundColor: '#FFF',
  borderRadius: '12px',
  border: '1px solid #E9D8C4',
  boxShadow: '0 4px 10px rgba(210, 140, 60, 0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  minWidth: '180px',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(210, 140, 60, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    backgroundColor: '#E67E22',
    opacity: 0.7,
  }
} as const;

const expandedRecipeCardStyle = {
  padding: '1.25rem',
  backgroundColor: '#FFF',
  borderRadius: '12px',
  border: '1px solid #E9D8C4',
  boxShadow: '0 6px 15px rgba(210, 140, 60, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  minWidth: '180px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    backgroundColor: '#E67E22',
    opacity: 0.7,
  }
} as const;

const expandButtonStyle = {
  padding: '0.15rem 0.4rem',
  backgroundColor: 'rgba(230, 126, 34, 0.1)',
  color: '#E67E22',
  border: '1px solid #E67E22',
  borderRadius: '4px',
  fontSize: '0.7rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(230, 126, 34, 0.2)',
  }
} as const;

const collapseButtonStyle = {
  padding: '0.15rem 0.4rem',
  backgroundColor: 'rgba(230, 126, 34, 0.1)',
  color: '#E67E22',
  border: '1px solid #E67E22',
  borderRadius: '4px',
  fontSize: '0.7rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(230, 126, 34, 0.2)',
  }
} as const;

export default function RecipesPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<string[]>([]);
  const [selectedIngredients, setSelectedingredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [difficultyFilters, setDifficultyFilters] = useState({
    easy: false,
    medium: false,
    hard: false
  });
  const [prepTimeMax, setPrepTimeMax] = useState(60); // Minutes
  const [cookTimeMax, setCookTimeMax] = useState(120); // Minutes

  const filterRef = useRef<HTMLDivElement>(null);

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

  // Update available ingredients when component mounts
  useEffect(() => {
    setAvailableIngredients(getAllIngredientsList());
  }, []);

  // Update available recipes whenever recipes or ingredients change
  useEffect(() => {
    if (recipes.length > 0 && availableIngredients.length > 0) {
      const minRecipes = convertRecipesToMinRecipes(recipes);
      setAvailableRecipes(getListOfRecipes(minRecipes, availableIngredients));
    }
  }, [recipes, availableIngredients]);

  useEffect(() => {
    setInputValue(selectedIngredients.join(', '));
  }, [selectedIngredients]);

  // Filter recipes based on search query
  const filteredRecipes = recipeSearchQuery.trim() === ''
    ? availableRecipes
    : availableRecipes.filter(recipeName =>
      recipeName.toLowerCase().includes(recipeSearchQuery.toLowerCase())
    );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Apply filters
  const applyFilters = () => {
    var filteredRecipeList = filterCookingLevel(recipes, difficultyFilters);
    filteredRecipeList = filterCookingTime(filteredRecipeList, cookTimeMax);
    filteredRecipeList = filterPrepTime(filteredRecipeList, prepTimeMax);
    setAvailableRecipes(getListOfRecipes(convertRecipesToMinRecipes(filteredRecipeList), availableIngredients))
    console.log("Applied filters:", {
      difficultyFilters,
      prepTimeMax,
      cookTimeMax,
    });
    setIsFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setDifficultyFilters({ easy: false, medium: false, hard: false });
    setPrepTimeMax(60);
    setCookTimeMax(120);
  };


  // Handle difficulty checkbox changes
  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setDifficultyFilters({
      ...difficultyFilters,
      [difficulty]: !difficultyFilters[difficulty]
    });
  };

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
    if (!inputValue.trim()) {
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
          prompt: inputValue,
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

  const handleRecipeClick = (ingredientName: string) => {
    setSelectedingredients(prev =>
      prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    );
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

  // Handle expanding a recipe card
  const handleExpandRecipe = (recipeId: string) => {
    if (expandedRecipe === recipeId) {
      setExpandedRecipe(null); // Collapse if already expanded
    } else {
      setExpandedRecipe(recipeId); // Expand the clicked recipe

      // Add setTimeout to allow the DOM to update before scrolling
      setTimeout(() => {
        // Find the recipe container and scroll it to the left
        const recipeContainer = document.querySelector('.recipe-scroll-container');
        if (recipeContainer) {
          recipeContainer.scrollLeft = 0;
        }
      }, 50);
    }
  };

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: fancyScrollbarStyles }} />

      <div style={pageHeaderStyle}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#834D18',
          fontFamily: '"Playfair Display", serif',
          marginBottom: '0.5rem',
        }}>Recipe Explorer</h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#8D6E63',
          maxWidth: '600px',
          margin: '0 auto',
        }}>Discover recipes based on your available ingredients or generate new ones</p>
      </div>

      {/* Main Content Layout */}
      <div style={mainLayoutContainer}>
        {/* Left Column - Generator and Ingredients */}
        <div style={leftColumnStyle}>
          {/* Recipe Generator Section */}
          <div style={generatorSectionContainer}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <h2 style={{
                fontSize: '1.6rem',
                color: '#834D18',
                fontFamily: '"Playfair Display", serif',
                margin: 0,
              }}>AI Powered Recipe Generator</h2>
            </div>

            <p style={{ color: '#8D6E63', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
              Create a custom recipe using your available ingredients. Select ingredients from below and click generate.
            </p>
          </div>

          {/* Ingredients Flow - Selector, Selected, and Generate Button */}
          <div style={ingredientsFlowContainer}>
            {/* Ingredients Selection Section */}
            <div style={ingredientsSectionContainer}>
              <h2 style={{
                fontSize: '1.4rem',
                color: '#834D18',
                fontFamily: '"Playfair Display", serif',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Available Ingredients
              </h2>

              <div style={ingredientSelectorContainer}>
                <div style={baseIngredientsList}>
                  {availableIngredients.map((ingredientName, i) => (
                    <div
                      key={i}
                      onClick={() => handleRecipeClick(ingredientName)}
                      style={{
                        ...baseIngredientStyle,
                        cursor: 'pointer',
                        backgroundColor: selectedIngredients.includes(ingredientName)
                          ? 'rgba(230, 126, 34, 0.15)'
                          : '#FFF8F0',
                        borderColor: selectedIngredients.includes(ingredientName)
                          ? '#E67E22'
                          : '#E9D8C4',
                        color: selectedIngredients.includes(ingredientName)
                          ? '#E67E22'
                          : '#5D4037',
                        fontWeight: selectedIngredients.includes(ingredientName)
                          ? '600'
                          : '400',
                      }}
                    >
                      {ingredientName}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Ingredients */}
            {selectedIngredients.length > 0 && (
              <div style={selectedIngredientsContainer}>
                <div style={{
                  fontSize: '0.95rem',
                  marginBottom: '0.75rem',
                  color: '#834D18',
                  fontWeight: '600'
                }}>Selected ingredients:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      style={{
                        ...baseIngredientStyle,
                        display: 'inline-flex',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(230, 126, 34, 0.15)',
                        borderColor: '#E67E22',
                        color: '#E67E22',
                        fontWeight: '600',
                      }}
                      onClick={() => handleRecipeClick(ingredient)}
                    >
                      {ingredient}
                      <span style={{ marginLeft: '0.5rem' }}>×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div style={buttonGroupStyle}>
              <button
                onClick={handleGenerate}
                style={generateButtonStyle}
                disabled={isLoading || selectedIngredients.length === 0}
              >
                {isLoading ? 'Generating...' : 'Generate Recipe'}
              </button>
            </div>

            {selectedIngredients.length === 0 && (
              <p style={{
                fontSize: '0.95rem',
                color: '#e67e22',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                Select ingredients above to generate a recipe
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Existing Recipes (Scrollable) */}
        <div style={rightColumnStyle}>
          <div style={rightScrollContainer}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                fontSize: '1.4rem',
                color: '#834D18',
                fontFamily: '"Playfair Display", serif',
                margin: 0,
              }}>Available Recipes</h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '200px',
              }}>

                <div style={searchContainerStyle}>
                  <div style={inputGroupStyle}>
                    <input
                      type="text"
                      placeholder="Filter recipes..."
                      value={recipeSearchQuery}
                      onChange={(e) => setRecipeSearchQuery(e.target.value)}
                      style={inputStyle}
                    />
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      style={filterButtonStyle}
                      aria-label="Open filter options"
                    >
                      <div style={hamburgerIconStyle}>
                        <div style={hamburgerLineStyle}></div>
                        <div style={{ ...hamburgerLineStyle, width: '12px' }}></div>
                        <div style={{ ...hamburgerLineStyle, width: '8px' }}></div>
                      </div>
                    </button>
                  </div>

                  {isFilterOpen && (
                    <div ref={filterRef} style={filterPopupStyle}>
                      <h3 style={filterHeaderStyle}>Filter Options</h3>

                      <div style={filterSectionStyle}>
                        <h4 style={filterSectionHeaderStyle}>Difficulty</h4>
                        <div style={checkboxGroupStyle}>
                          <label style={checkboxLabelStyle}>
                            <input
                              type="checkbox"
                              checked={difficultyFilters.easy}
                              onChange={() => handleDifficultyChange('easy')}
                            />
                            <span style={checkboxTextStyle}>Easy</span>
                          </label>
                          <label style={checkboxLabelStyle}>
                            <input
                              type="checkbox"
                              checked={difficultyFilters.medium}
                              onChange={() => handleDifficultyChange('medium')}
                            />
                            <span style={checkboxTextStyle}>Medium</span>
                          </label>
                          <label style={checkboxLabelStyle}>
                            <input
                              type="checkbox"
                              checked={difficultyFilters.hard}
                              onChange={() => handleDifficultyChange('hard')}
                            />
                            <span style={checkboxTextStyle}>Hard</span>
                          </label>
                        </div>
                      </div>

                      <div style={filterSectionStyle}>
                        <h4 style={filterSectionHeaderStyle}>Prep Time (max minutes)</h4>
                        <div style={sliderContainerStyle}>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={prepTimeMax}
                            onChange={(e) => setPrepTimeMax(parseInt(e.target.value))}
                            style={sliderStyle}
                          />
                          <span style={sliderValueStyle}>{prepTimeMax} min</span>
                        </div>
                      </div>

                      <div style={filterSectionStyle}>
                        <h4 style={filterSectionHeaderStyle}>Cook Time (max minutes)</h4>
                        <div style={sliderContainerStyle}>
                          <input
                            type="range"
                            min="0"
                            max="120"
                            value={cookTimeMax}
                            onChange={(e) => setCookTimeMax(parseInt(e.target.value))}
                            style={sliderStyle}
                          />
                          <span style={sliderValueStyle}>{cookTimeMax} min</span>
                        </div>
                      </div>

                      <div style={filterButtonsStyle}>
                        <button
                          onClick={resetFilters}
                          style={resetButtonStyle}
                        >
                          Reset
                        </button>
                        <button
                          onClick={applyFilters}
                          style={applyButtonStyle}
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {recipeSearchQuery && (
                  <button
                    onClick={() => setRecipeSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#8D6E63',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <div style={recipesGridContainer}>
              {isLoading && recipes.length === 0 ? (
                <p style={loadingStyle}>Loading recipes...</p>
              ) : filteredRecipes.length > 0 ? (
                <div
                  className="recipe-scroll-container fancy-scrollbar"
                  style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    width: '100%',
                    height: '650px', // Reduced height
                    paddingBottom: '0.5rem',
                    gap: '1rem',
                  }}
                >
                  {/* First create a wrapper for all non-expanded cards */}
                  {!expandedRecipe && (
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: 'repeat(5, 100px)',
                      gridAutoColumns: '180px',
                      gridAutoFlow: 'column',
                      gap: '0.7rem',
                      flexShrink: 0,
                      width: 'max-content',
                    }}>
                      {filteredRecipes.map(recipeName => {
                        // Convert recipe name to full recipe object
                        const recipe = getRecipeFromName(recipes, recipeName);

                        // Skip if recipe not found
                        if (!recipe) return null;

                        return (
                          <div
                            key={recipe.id}
                            style={{
                              ...compactRecipeCardStyle,
                              width: '180px',
                              height: '100px',
                            }}
                            onClick={() => handleExpandRecipe(recipe.id)}
                          >
                            <h3 style={{ ...recipeNameStyle, fontSize: '0.9rem', margin: '0 0 0.3rem 0' }}>
                              {recipe.name}
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#8D6E63', fontSize: '0.8rem' }}>{recipe.difficulty}</span>
                              <button
                                style={expandButtonStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpandRecipe(recipe.id);
                                }}
                              >
                                Expand
                              </button>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  )}

                  {/* Then, if there's an expanded recipe, show it */}
                  {expandedRecipe && availableRecipes.map(recipeName => {
                    // Convert recipe name to full recipe object
                    const recipe = getRecipeFromName(recipes, recipeName);

                    // Skip if recipe not found or not the expanded one
                    if (!recipe || recipe.id !== expandedRecipe) return null;

                    return (
                      <div
                        key={recipe.id}
                        style={{
                          ...expandedRecipeCardStyle,
                          width: '380px',
                          height: '630px',
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'auto'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 0.5rem 0', borderBottom: '1px dotted #E9D8C4' }}>
                          <h3 style={{ ...recipeNameStyle, fontSize: '1.1rem', margin: 0 }}>{recipe.name}</h3>
                          <button
                            style={collapseButtonStyle}
                            onClick={() => handleExpandRecipe(recipe.id)}
                          >
                            Collapse
                          </button>
                        </div>

                        <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem 0.25rem 0.5rem 0' }}>
                          <div style={{ ...miniIngredientsStyle, marginBottom: '0.75rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#834D18' }}>Ingredients</h4>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                              {recipe.ingredients.map((ing, i) => (
                                <div key={i} style={{ ...ingredientStyle, marginBottom: '0.25rem' }}>
                                  <span style={quantityStyle}>{ing.quantity} {ing.unit}</span>
                                  <span style={nameStyle}>{ing.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#834D18' }}>Details</h4>
                            <div style={{ ...detailsStyle, fontSize: '0.85rem', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <span><strong>Difficulty:</strong> {recipe.difficulty}</span>
                              <span><strong>Prep:</strong> {recipe.prepTime}</span>
                              <span><strong>Cook:</strong> {recipe.cookTime}</span>
                              <span><strong>Servings:</strong> {recipe.servings}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectMeal(recipe)}
                          style={{ ...miniSelectButtonStyle, marginTop: '0.5rem' }}
                          disabled={isLoading}
                        >
                          {isLoading ? '...' : 'View Details'}
                        </button>
                      </div>
                    );
                  }).filter(Boolean)}

                  {/* If there's an expanded recipe, show the rest of the recipes in a grid */}
                  {expandedRecipe && (
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: 'repeat(5, 100px)',
                      gridAutoColumns: '180px',
                      gridAutoFlow: 'column',
                      gap: '0.7rem',
                      flexShrink: 0,
                      width: 'max-content',
                    }}>
                      {filteredRecipes.map(recipeName => {
                        // Convert recipe name to full recipe object
                        const recipe = getRecipeFromName(recipes, recipeName);

                        // Skip if recipe not found or it's the expanded one
                        if (!recipe || recipe.id === expandedRecipe) return null;

                        return (
                          <div
                            key={recipe.id}
                            style={{
                              ...compactRecipeCardStyle,
                              width: '180px',
                              height: '100px',
                            }}
                            onClick={() => handleExpandRecipe(recipe.id)}
                          >
                            <h3 style={{ ...recipeNameStyle, fontSize: '0.9rem', margin: '0 0 0.3rem 0' }}>
                              {recipe.name}
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#8D6E63', fontSize: '0.8rem' }}>{recipe.difficulty}</span>
                              <button
                                style={expandButtonStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpandRecipe(recipe.id);
                                }}
                              >
                                Expand
                              </button>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  )}
                </div>
              ) : (
                <p style={emptyStyle}>No recipes match your search. Try adjusting your filter or generating a new recipe!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Recipe Section - Appears below everything when a recipe is generated */}
      {generatedRecipe && (
        <div style={{
          maxWidth: '1200px',
          margin: '2rem auto 0 auto',
          padding: '1.5rem',
          backgroundColor: '#FFF',
          borderRadius: '12px',
          border: '1px solid #E9D8C4',
          boxShadow: '0 4px 10px rgba(210, 140, 60, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '2px dotted #E9D8C4',
            paddingBottom: '1rem',
          }}>
            <img src={recipeGeneratorTitle.src} alt="Generated Recipe" style={{
              height: '40px',
              marginRight: '1rem',
            }} />
            <h2 style={{
              fontSize: '1.6rem',
              color: '#834D18',
              fontFamily: '"Playfair Display", serif',
              margin: 0,
            }}>Generated Recipe</h2>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {/* Recipe Header */}
            <h3 style={{ ...recipeNameStyle, fontSize: '1.4rem', marginBottom: '0' }}>{generatedRecipe.name}</h3>

            {/* Details Box */}
            <div style={{ ...detailsStyle, marginTop: '0' }}>
              <span>{generatedRecipe.cuisine} • {generatedRecipe.difficulty}</span>
              <span>{generatedRecipe.prepTime} prep • {generatedRecipe.cookTime} cook</span>
            </div>

            {/* Two Column Layout for Ingredients and Instructions */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '2rem',
              flexWrap: 'wrap',
            }}>
              {/* Ingredients Column */}
              <div style={{
                flex: '1',
                minWidth: '300px',
              }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#834D18' }}>Ingredients</h4>
                <div style={ingredientsStyle}>
                  {generatedRecipe.ingredients.map((ing, i) => (
                    <div key={i} style={ingredientStyle}>
                      <span style={quantityStyle}>{ing.quantity} {ing.unit}</span>
                      <span style={nameStyle}>{ing.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions Column */}
              <div style={{
                flex: '1.5',
                minWidth: '300px',
              }}>
                <h4 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '1.1rem',
                  color: '#834D18',
                  borderBottom: '1px dotted #E9D8C4',
                  paddingBottom: '0.5rem'
                }}>
                  Instructions
                </h4>
                <ol style={{
                  color: '#5D4037',
                  paddingLeft: '1.5rem',
                  margin: '0',
                }}>
                  {generatedRecipe.instructions.map((step, i) => (
                    <li key={i} style={{ marginBottom: '0.75rem' }}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button
                onClick={saveGeneratedRecipe}
                style={saveButtonStyle}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Add to Recipes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const searchContainerStyle = {
  position: 'relative' as const,
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
};

const inputGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  position: 'relative' as const,
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  paddingRight: '40px', // Space for filter button
  border: '1px solid #E9D8C4',
  borderRadius: '20px',
  fontSize: '0.9rem',
  backgroundColor: '#FFF8F0',
  color: '#5D4037',
  outline: 'none',
};

const filterButtonStyle = {
  position: 'absolute' as const,
  right: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  backgroundColor: '#bc4424',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  zIndex: 1,
};

const hamburgerIconStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap: '3px',
  width: '16px',
  height: '16px',
};

const hamburgerLineStyle = {
  width: '16px',
  height: '2px',
  backgroundColor: 'white',
  borderRadius: '1px',
};

const filterPopupStyle = {
  position: 'absolute' as const,
  top: 'calc(100% + 10px)',
  right: '0',
  width: '300px',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
  border: '1px solid #E9D8C4',
  padding: '1.25rem',
  zIndex: 100,
};

const filterHeaderStyle = {
  margin: '0 0 1rem 0',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#5D4037',
  borderBottom: '1px solid #E9D8C4',
  paddingBottom: '0.5rem',
};

const filterSectionStyle = {
  marginBottom: '1.25rem',
};

const filterSectionHeaderStyle = {
  margin: '0 0 0.5rem 0',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: '#5D4037',
};

const checkboxGroupStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.5rem',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const checkboxTextStyle = {
  marginLeft: '0.5rem',
};

const sliderContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const sliderStyle = {
  flex: '1',
  appearance: 'none' as const,
  height: '6px',
  borderRadius: '3px',
  backgroundColor: '#E9D8C4',
  outline: 'none',
  // Additional styles for slider thumbs would need vendor prefixes in real CSS
};

const sliderValueStyle = {
  minWidth: '48px',
  textAlign: 'right' as const,
  fontSize: '0.9rem',
};

const filterButtonsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.75rem',
  marginTop: '1.5rem',
};

const resetButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#f5f5f5',
  color: '#5D4037',
  border: '1px solid #E9D8C4',
  borderRadius: '6px',
  fontSize: '0.9rem',
  cursor: 'pointer',
  flex: '1',
};

const applyButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#bc4424',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  flex: '1',
};