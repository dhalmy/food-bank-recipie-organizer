'use client';

import { useEffect, useState } from 'react';
import {
  is_database_created,
  create_database,
  use_found_database,
} from '../database/indexedDB';

export default function Home() {
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
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>IndexedDB Checker</h1>
      <p>Status: {dbStatus}</p>
    </main>
  );
}