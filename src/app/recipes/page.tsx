'use client';

import React, { useState } from 'react';

export default function RecipesPage() {
  const [input, setInput] = useState('');

  const handleGenerate = async () => {
    // Call your API route (logic to be added later)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Placeholder
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Left column: recipe list placeholder */}
      <div style={leftColumnStyle}>
        <h2>Recipe List</h2>
        <div style={recipeBoxStyle}>Sample Recipe 1</div>
        <div style={recipeBoxStyle}>Sample Recipe 2</div>
      </div>

      {/* Right column: generate recipe */}
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
} as const;

const leftColumnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
} as const;

const recipeBoxStyle = {
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  backgroundColor: 'var(--background)',
} as const;

const rightColumnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
} as const;

const inputStyle = {
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '1rem',
} as const;

const buttonStyle = {
  padding: '0.75rem',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#0070f3',
  color: 'var(--foreground)',
  fontWeight: 'bold',
  cursor: 'pointer',
} as const;
