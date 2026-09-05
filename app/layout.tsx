import './globals.css';
import './sell.css';
import './step8.css';
import './mobile-production.css';
import Link from 'next/link';

const OFFICIAL_DUKANEN_ICON='https://raw.githubusercontent.com/bedpiny24/v0-dukanen-app/v0/bedpunk24-5959-a0916452-2/public/dukanen-icon.png';
const OFFICIAL_DUKANEN_OG='https://raw.githubusercontent.com/bedpiny24/v0-dukanen-app/v0/bedpunk24-5959-a0916452-2/public/og-image.png';

export const metadata = {
  title: {default:'Dukanen Marketplace — Buy. Sell. Connect.',template:'%s | Dukanen Marketplace'},
  description: 'A mobile-first local marketplace for products, services and opportunities across South Sudan.',
  metadataBase: new URL('https://dukanen.online'),
  alternates: { canonical: '/' },
  icons:{icon:OFFICIAL_DUKANEN_ICON,apple:OFFICIAL_DUKANEN_ICON},
  openGraph: {
    title: 'Dukanen Marketplace',
    description: 'Buy. Sell. Connect. Built for local commerce across South Sudan.',
    url: 'https://dukanen.online',
    siteName: 'Dukanen Marketplace',
    locale: 'en_SS',
    type: 'website',
    images:[{url:OFFICIAL_DUKANEN_OG,alt:'Dukanen Marketplace'}],
  },
  twitter:{card:'summary_large_image',title:'Dukanen Marketplace',description:'Buy. Sell. Connect. Built for local commerce across South Sudan.',images:[OFFICIAL_DUKANEN_OG]},
};

export const viewport={themeColor:'#00A86B',colorScheme:'light',width:'device-width',initialScale:1,maximumScale:1};

function Icon({name}:{name:'home'|'grid'|'plus'|'message'|'user'|'heart'}){
  const common={width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
  if(name==='home') return <svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/><path d="M9 21v-6h6v6"/></svg>;
  if(name==='grid') return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
  if(name==='plus') return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if(name==='message') return <svg {...common}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg>;
  if(name==='heart') return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
}

function BrandMark(){
  return <span className="brand-lockup" aria-label="Dukanen Marketplace">
    <span className="brand-icon brand-icon-official" aria-hidden="true"><img src={OFFICIAL_DUKANEN_ICON} alt="" width="46" height="46"/></span>
    <span className="brand-copy"><strong>Dukanen</strong><span>Marketplace</span></span>
  </span>
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" aria-label="Dukanen Marketplace home"><BrandMark/></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/marketplace">Browse</Link><Link href="/categories">Categories</Link><Link href="/messages">Messages</Link><Link href="/favorites">Favorites</Link><Link href="/profile">Profile</Link><Link href="/sell" className="sell-link"><Icon name="plus"/> <span>Sell</span></Link>
        </nav>
      </div>
    </header>
    <main id="main-content">{children}</main>
    <footer className="footer"><div className="container"><div className="footer-brand"><span className="footer-dot"/>Dukanen Marketplace</div><p>Buy. Sell. Connect. Built for local commerce across South Sudan.</p></div></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <Link href="/" className="mobile-nav-item"><Icon name="home"/><span>Home</span></Link>
      <Link href="/categories" className="mobile-nav-item"><Icon name="grid"/><span>Categories</span></Link>
      <Link href="/sell" className="mobile-sell" aria-label="Sell on Dukanen"><span className="mobile-sell-icon"><Icon name="plus"/></span><span>Sell</span></Link>
      <Link href="/messages" className="mobile-nav-item"><Icon name="message"/><span>Chat</span></Link>
      <Link href="/profile" className="mobile-nav-item"><Icon name="user"/><span>Profile</span></Link>
    </nav>
  </body></html>
}
