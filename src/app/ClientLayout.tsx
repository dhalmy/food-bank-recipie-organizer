'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import backgroundImage from './images/empty-bg.png';
import backgroundImageDarker from './images/empty-bg-darker.png';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === '/';

  return (
    <div style={layoutStyle} className={outfit.className}>
      {!isRoot && (
        <header style={headerStyle}>
          <div style={logoContainerStyle}>
            <Image src="/favicon.ico" alt="Logo" width={40} height={40} style={{ borderRadius: '50%' }} />
            <span style={siteNameStyle}>Pantry EQ</span>
          </div>
          <nav style={navStyle}>
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/inventory', label: 'Inventory' },
              { href: '/recipes', label: 'Recipes' },
              { href: '/meal-preparation', label: 'Meals' }
            ].map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                style={{
                  ...linkStyle,
                  ...(pathname === link.href ? activeLinkStyle : {})
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
      )}
      <main style={{ padding: '1.5rem' }}>{children}</main>
    </div>
  );
}

const layoutStyle = {
  backgroundImage: `url(${backgroundImage.src})`,
  backgroundSize: "auto",
  backgroundRepeat: "repeat",
  backgroundPosition: "center",
  minHeight: "100vh",
};  

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundImage: `url(${backgroundImageDarker.src})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
} as const;

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
} as const;

const siteNameStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#f8f0e3',
  letterSpacing: '0.5px',
  fontFamily: 'var(--font-outfit)',
} as const;

const navStyle = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
} as const;

const linkStyle = {
  textDecoration: 'none',
  color: '#f8f0e3',
  fontWeight: '500',
  fontSize: '1.1rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: 'var(--font-outfit)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
} as const;

const activeLinkStyle = {
  backgroundColor: 'rgba(255, 194, 120, 0.2)',
  fontWeight: '600',
  color: '#ffc278',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '15%',
    width: '70%',
    height: '2px',
    backgroundColor: '#ffc278',
  },
} as const;
