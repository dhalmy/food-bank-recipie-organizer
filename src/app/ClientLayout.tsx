'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import backgroundImage from './images/empty-bg.png';
import backgroundImageDarker from './images/empty-bg-darker.png';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === '/';

  return (
    <div style={layoutStyle}>
      {!isRoot && (
        <header style={headerStyle}>
          <div style={logoContainerStyle}>
            <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
            <span style={siteNameStyle}>Food Bro</span>
          </div>
          <nav style={navStyle}>
            <Link href="/" style={linkStyle}>Home</Link>
            <Link href="/about" style={linkStyle}>About</Link>
            <Link href="/inventory" style={linkStyle}>Inventory</Link>
            <Link href="/recipes" style={linkStyle}>Recipes</Link>
            <Link href="/meal-preparation" style={linkStyle}>Meals</Link>
          </nav>
        </header>
      )}
      <main style={{ padding: '1rem' }}>{children}</main>
    </div>
  );
}

// Overall layout background remains the same
const layoutStyle = {
  backgroundImage: `url(${backgroundImage.src})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
};

// Header gets its own background image
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 1.5rem',
  backgroundImage: `url(${backgroundImageDarker.src})`, // using the same image here
  backgroundSize: "cover",
  backgroundPosition: "center",
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
