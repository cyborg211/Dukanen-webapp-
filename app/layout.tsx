import './globals.css';
import Link from 'next/link';

export const metadata = {
  title:'Dukanen — Buy. Sell. Discover.',
  description:'A mobile-first marketplace for products, services and opportunities across South Sudan.'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" href="/">DUKANEN <span>دكانين</span></Link>
        <nav className="desktop-nav">
          <Link href="/marketplace">Browse</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/sell" className="sell-link">Sell</Link>
        </nav>
      </div>
    </header>
    <main>{children}</main>
    <footer className="footer"><div className="container"><b>DUKANEN دكانين</b><p>Buy. Sell. Discover. Built for local commerce and African growth.</p></div></footer>
    <nav className="mobile-nav"><Link href="/">Home</Link><Link href="/marketplace">Browse</Link><Link href="/sell" className="mobile-sell">Sell</Link><Link href="/marketplace">Favorites</Link><Link href="/">Account</Link></nav>
  </body></html>
}
