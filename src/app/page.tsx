'use client';
import Link from "next/link";
import backgroundImage from "./background.png";
import titleImage from "./title.png";
import homeImage from "./home.png";
import mealPrepImage from "./meal-preparation.png";
import recipeImage from "./recipe.png";
import inventoryImage from "./inventory.png";
import { useEffect, useState } from 'react';
import { is_database_created, create_database, use_found_database } from '../database/indexedDB';

export default function LandingPage() {
  const [dbStatus, setDbStatus] = useState<string>('Checking...');

  useEffect(() => {
    async function checkAndInitDB() {
      const exists = await is_database_created();

      if (!exists) {
        await create_database();
        setDbStatus('Database created.');
      } else {
        await use_found_database();
        setDbStatus('Database already exists.');
      }
    }

    checkAndInitDB();
    console.log(dbStatus);
  }, []);

  const buttonStyle = (img: string) => ({
    width: "220px",
    height: "220px",
    backgroundImage: `url(${img})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "10px",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <img
        src={titleImage.src}
        alt="Food Bank Recipe Organizer"
        style={{ maxHeight: "175px", width: "auto" }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          marginTop: "2rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={buttonStyle(homeImage.src)}></div>
        </Link>
        <Link href="/meal-preparation" style={{ textDecoration: "none" }}>
          <div style={buttonStyle(mealPrepImage.src)}></div>
        </Link>
        <Link href="/recipe" style={{ textDecoration: "none" }}>
          <div style={buttonStyle(recipeImage.src)}></div>
        </Link>
        <Link href="/inventory" style={{ textDecoration: "none" }}>
          <div style={buttonStyle(inventoryImage.src)}></div>
        </Link>
      </div>
    </div>
  );
}
