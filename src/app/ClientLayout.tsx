// app/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === '/';

  return (
    <>
      {!isRoot && (
        <header style={headerStyle}>
          <div style={logoContainerStyle}>
            <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
            <span style={siteNameStyle}>Food Bro</span>
          </div>
          <nav style={navStyle}>
            <Link href="/" style={linkStyle}>Home</Link>
            <Link href="/about" style={linkStyle}>About</Link>
            <Link href="/recipes" style={linkStyle}>Recipes</Link>
            <Link href="/meal-preparation" style={linkStyle}>Meals</Link>
          </nav>
        </header>
      )}
      <main style={{ padding: '1rem' }}>{children}</main>
    </>
  );
}

// Styles remain in the client component file
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 1.5rem',
  backgroundColor: 'var(--background)',
  borderBottom: '1px solid #ccc',
} as const;

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
} as const;

const siteNameStyle = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: 'var(--foreground)',
} as const;

const navStyle = {
  display: 'flex',
  gap: '1rem',
} as const;

const linkStyle = {
  textDecoration: 'none',
  color: 'var(--foreground)',
  fontWeight: '500',
} as const;