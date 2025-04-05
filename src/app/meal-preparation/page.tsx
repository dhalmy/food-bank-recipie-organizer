'use client';

import { useState } from 'react';
import Image from 'next/image';
import bolognaiseImage from './Bolognaise.jpeg';

export default function MealPrepPage() {
  const [count, setCount] = useState(257);

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Meal Prep Counter</h1>
      
      <div style={mealCardStyle}>
        <div style={mealInfoStyle}>
          <div style={imageContainer}>
            <Image 
              src={bolognaiseImage} 
              alt="Bolognese Pasta" 
              width={150} 
              height={150}
              style={imageStyle}
              priority
            />
            <div style={ingredientsContainer}>
              <h2 style={mealNameStyle}>Bolognese Pasta</h2>
              <p style={countTextStyle}>Can make: {count} servings</p>
              <div style={ingredientsList}>
                <p>Requires per serving:</p>
                <ul>
                  <li>1 Pasta Box (500g)</li>
                  <li>1 Bolognaise Sauce (400g)</li>
                </ul>
              </div>
            </div>
          </div>
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

// Add these new style definitions
const imageContainer = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
} as const;

const imageStyle = {
  borderRadius: '8px',
  objectFit: 'cover',
} as const;

const ingredientsContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.5rem',
} as const;

const ingredientsList = {
  marginTop: '1rem',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
  
  ul: {
    marginLeft: '1rem',
    listStyleType: 'disc',
  },
  
  li: {
    marginBottom: '0.25rem',
  }
} as const;

// Keep existing styles and update mealCardStyle to add gap
const mealCardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.5rem',
  backgroundColor: 'var(--background)',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '1rem',
  gap: '2rem', // Add gap between columns
} as const;

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

const mealInfoStyle = {
  flex: 1,
} as const;

const mealNameStyle = {
  fontSize: '1.5rem',
  marginBottom: '0.5rem',
  color: 'var(--foreground)',
} as const;

const countTextStyle = {
  fontSize: '1.2rem',
  color: 'var(--foreground)',
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