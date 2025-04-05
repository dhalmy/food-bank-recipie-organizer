'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MealPrepPage() {
  const [count, setCount] = useState(257);

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Meal Prep Calculator</h1>
      
      <div style={mealCardStyle}>
        <div style={mealInfoStyle}>
          <h2 style={mealNameStyle}>Bolognese Pasta</h2>
          <p style={countTextStyle}>Can make: {count} servings</p>
        </div>
        
        <div style={buttonGroupStyle}>
          <button 
            onClick={() => setCount(prev => prev + 1)}
            style={buttonStyle}
          >
            +
          </button>
          <button 
            onClick={() => setCount(prev => Math.max(0, prev - 1))}
            style={buttonStyle}
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
}

// Style definitions
const containerStyle = {
  padding: '2rem',
  maxWidth: '800px',
  margin: '0 auto',
} as const;

const headerStyle = {
  fontSize: '2rem',
  marginBottom: '2rem',
  color: 'var(--foreground)',
} as const;

const mealCardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.5rem',
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '1rem',
} as const;

const mealInfoStyle = {
  flex: 1,
} as const;

const mealNameStyle = {
  fontSize: '1.5rem',
  marginBottom: '0.5rem',
  color: '#444',
} as const;

const countTextStyle = {
  fontSize: '1.2rem',
  color: '#666',
} as const;

const buttonGroupStyle = {
  display: 'flex',
  gap: '0.5rem',
} as const;

const buttonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '1.2rem',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
} as const;