import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Dukanen Marketplace — Buy. Sell. Connect.',
  description: 'A mobile-first local marketplace for products, services and opportunities across South Sudan.',
  metadataBase: new URL('https://dukanen.online'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Dukanen Marketplace',
    description: 'Buy. Sell. Connect. Built for local commerce across South Sudan.',
    url: 'https://dukanen.online',
    siteName: 'Dukanen Marketplace',
    locale: 'en_SS',
    type: 'website',
  },
};

function BrandMark(){
  return <span className="brand-lockup" aria-label="Dukanen Marketplace">
    <span className="brand-icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <path fill="#fff" d="M14 17h36l-4.4 13.2c-.9 2.6-3.3 4.3-6 4.3-2.5 0-4.8-1.5-5.8-3.8-1 2.3-3.3 3.8-5.8 3.8s-4.8-1.5-5.8-3.8c-1 2.3-3.3 3.8-5.8 3.8-2.7 0-5.1-1.7-6-4.3L14 17Z"/>
        <path fill="#fff" d="M18 35h28v17h-9V40H27v12h-9V35Z"/>
      </svg>
    </span>
    <span className="brand-copy"><strong>Dukanen</strong><span>Marketplace</span></span>
  </span>
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" aria-label="Dukanen Marketplace home"><BrandMark/></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/marketplace">Browse</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/seller/dashboard">Seller Dashboard</Link>
          <Link href="/auth">Sign in</Link>
          <Link href="/sell" className="sell-link">Sell</Link>
        </nav>
      </div>
    </header>
    <main>{children}</main>
    <footer className="footer"><div className="container"><div className="footer-brand"><span className="footer-dot"/>Dukanen Marketplace</div><p>Buy. Sell. Connect. Built for local commerce across South Sudan.</p></div></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/">Home</Link><Link href="/marketplace">Explore</Link><Link href="/sell" className="mobile-sell">Sell</Link><Link href="/marketplace">Messages</Link><Link href="/auth">Profile</Link></nav>
  </body></html>
}
