import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {categories,products,featuredSellers} from '@/lib/data';

const categoryIcons=['▦','▣','🚗','⌂','▤','▥','✦','⚒','🌾','✧','⚽','★','▦','＋'];

export default function Home(){
  const featured=products.slice(0,4);
  const recent=products.slice(4,8).length?products.slice(4,8):products.slice(0,4);
  const trending=products.slice(0,8);

  return <>
    <section className="home-intro">
      <div className="container home-intro-inner">
        <div className="location-row"><span className="location-pin">●</span><span>Juba, South Sudan</span><span className="location-chevron">⌄</span></div>
        <form className="home-search" action="/marketplace">
          <span className="search-icon">⌕</span>
          <input name="q" aria-label="Search Dukanen" placeholder="Search products, services, businesses..."/>
          <button>Search</button>
        </form>
        <div className="quick-categories" aria-label="Popular categories">
          {categories.slice(0,6).map((c,i)=><Link key={c} href={`/marketplace?category=${encodeURIComponent(c)}`} className="quick-category"><span>{categoryIcons[i]}</span><b>{c}</b></Link>)}
          <Link href="#categories" className="quick-category"><span>•••</span><b>More</b></Link>
        </div>
      </div>
    </section>

    <section className="local-hero-section">
      <div className="container">
        <div className="local-hero">
          <div className="local-hero-copy">
            <span className="local-kicker">Dukanen · South Sudan</span>
            <h1>Local People.<br/>Real Opportunities.</h1>
            <p>Buy. Sell. Connect. Discover products, services and trusted local sellers across South Sudan.</p>
            <div className="actions"><Link href="/marketplace" className="gold-cta">Start Exploring →</Link><Link href="/sell" className="hero-secondary">Sell Something</Link></div>
          </div>
          <div className="local-hero-panel" aria-label="Dukanen marketplace promise">
            <div><strong>Trusted & Secure</strong><span>People you can trust.</span></div>
            <div><strong>Wide Selection</strong><span>Products for every need.</span></div>
            <div><strong>For Everyone</strong><span>Individuals & businesses.</span></div>
          </div>
        </div>
      </div>
    </section>

    <section id="categories" className="home-section">
      <div className="container">
        <div className="section-head"><div><span className="section-kicker">Browse faster</span><h2>Explore categories</h2><p>Find what you need quickly.</p></div><Link href="/marketplace">View all →</Link></div>
        <div className="category-grid">{categories.slice(0,14).map((c,i)=><Link key={c} className="category" href={`/marketplace?category=${encodeURIComponent(c)}`}><span className="category-icon">{categoryIcons[i]||'＋'}</span><span>{c}</span></Link>)}</div>
      </div>
    </section>

    <section className="home-section home-section-soft">
      <div className="container">
        <div className="section-head"><div><span className="section-kicker">Picked for you</span><h2>Featured near you</h2><p>Interesting listings from local sellers.</p></div><Link href="/marketplace">See all →</Link></div>
        <div className="product-grid">{featured.map(p=><ProductCard key={p.slug} product={p}/>)}</div>
      </div>
    </section>

    <section className="home-section">
      <div className="container">
        <div className="section-head"><div><span className="section-kicker">Fresh on Dukanen</span><h2>Recently added</h2><p>New opportunities from sellers across South Sudan.</p></div><Link href="/marketplace">Browse latest →</Link></div>
        <div className="product-grid">{recent.map(p=><ProductCard key={p.slug} product={p}/>)}</div>
      </div>
    </section>

    <section className="home-section home-section-soft">
      <div className="container">
        <div className="section-head"><div><span className="section-kicker">Popular now</span><h2>Trending near you</h2><p>Listings getting attention from local buyers.</p></div><Link href="/marketplace">See all →</Link></div>
        <div className="product-grid">{trending.map(p=><ProductCard key={p.slug} product={p}/>)}</div>
      </div>
    </section>

    <section className="home-section">
      <div className="container">
        <div className="section-head"><div><span className="section-kicker">Local businesses</span><h2>Verified & featured sellers</h2><p>Discover growing businesses and trusted local sellers.</p></div></div>
        <div className="seller-grid">{featuredSellers.slice(0,3).map((s,i)=><div className="seller-card" key={s.name}><div className="seller-avatar">{s.name.slice(0,1)}</div><div><div className="seller-title-row"><h3>{s.name}</h3><span className="verified-badge">✓ Verified</span></div><p>{s.category} · {s.location}</p><Link href="/marketplace" className="seller-link">View listings →</Link></div></div>)}</div>
      </div>
    </section>

    <section className="trust-section">
      <div className="container trust-strip">
        <div><span className="trust-icon">✓</span><strong>Trusted & Secure</strong><small>Shop and sell with confidence.</small></div>
        <div><span className="trust-icon">▢</span><strong>Wide Selection</strong><small>Products and services for every need.</small></div>
        <div><span className="trust-icon">●●</span><strong>For Everyone</strong><small>Individuals, businesses and communities.</small></div>
        <div><span className="trust-icon trust-gold">★</span><strong>Local. Reliable. Together.</strong><small>Built for South Sudan.</small></div>
      </div>
    </section>
  </>;
}
