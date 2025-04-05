'use client';

import React, { useState } from 'react';
import recipesData from './recipe-database/recipes.json';

export default function RecipesPage() {
  // For generating new recipes (existing functionality)
  const [input, setInput] = useState('');

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
  };

  // Pagination functionality
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 6;
  const recipes = recipesData;
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  return (
    <div style={containerStyle}>
      {/* Left column: Recipe list */}
      <div style={leftColumnStyle}>
        <h2>Recipe List</h2>
        {currentRecipes.map((recipe) => (
          <div key={recipe.id} style={recipeBoxStyle}>
            {recipe.name}
          </div>
        ))}
        {/* Pagination Buttons */}
        <div style={paginationStyle}>
          <button
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            style={paginationButtonStyle}
          >
            First
          </button>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            style={paginationButtonStyle}
          >
            Prev
          </button>
          <span style={{ margin: '0 1rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            style={paginationButtonStyle}
          >
            Next
          </button>
          <button
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
            style={paginationButtonStyle}
          >
            Last
          </button>
        </div>
      </div>

      {/* Right column: Generate recipe */}
      <div style={rightColumnStyle}>
        <h2>Generate New Recipe</h2>
        <input
          type="text"
          placeholder="Add more specific information for the generation"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleGenerate} style={buttonStyle}>
          Generate
        </button>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  display: 'flex',
  gap: '2rem',
  padding: '2rem',
};

const leftColumnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as 'column',
  gap: '1rem',
};

const recipeBoxStyle = {
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  backgroundColor: 'var(--background)',
};

const rightColumnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1rem',
};

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '1rem',
};

const buttonStyle = {
  padding: '0.75rem',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#0070f3',
  color: 'var(--foreground)',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const paginationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '1rem',
  gap: '0.5rem',
};

const paginationButtonStyle = {
  padding: '0.5rem 1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0',
  cursor: 'pointer',
};

export { RecipesPage };
