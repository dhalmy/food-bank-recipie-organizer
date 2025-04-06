'use client';

import Head from "next/head";
import Link from "next/link";
import backgroundImage from "./images/background.png";
import titleImage from "./images/title.png";
import aboutImage from "./images/about.png";
import mealPrepImage from "./images/meal-preparation.png";
import recipeImage from "./images/recipe.png";
import inventoryImage from "./images/inventory.png";

import { useEffect, useState } from 'react';
import { is_database_created, create_database, use_found_database } from '../food-database/localDatabase';

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
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </Head>
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
          
          fontFamily: '"EB Garamond", serif',
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
          <Link href="/meal-preparation" style={{ textDecoration: "none" }}>
            <div style={buttonStyle(mealPrepImage.src)}></div>
          </Link>
          <Link href="/recipes" style={{ textDecoration: "none" }}>
            <div style={buttonStyle(recipeImage.src)}></div>
          </Link>
          <Link href="/inventory" style={{ textDecoration: "none" }}>
            <div style={buttonStyle(inventoryImage.src)}></div>
          </Link>
          <Link href="/about" style={{ textDecoration: "none" }}>
            <div style={buttonStyle(aboutImage.src)}></div>
          </Link>
        </div>
      </div>
    </>
  );
}
