import './home.css';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {createClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

const categoryIcons=['▦','▣','🚗','⌂','▤','▥','✦','⚒','🌾','✧','⚽','★','▦','＋'];

function cardFromProduct(p:any){
  const images=(p.product_images||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order);
  return {
    slug:p.slug||p.id,
    title:p.title,
    price:`${p.currency||'SSP'} ${Number(p.price).toLocaleString()}`,
    condition:p.condition||'Available',
    location:[p.city,p.country].filter(Boolean).join(', ')||'South Sudan',
    seller:p.sellers?.store_name||'Dukanen Seller',
    image:images[0]?.image_url,
    emoji:'🛍️',
    views:Number(p.views||0),
    featured:Boolean(p.featured),
    created_at:p.created_at,
  };
}

function EmptyListings(){return <div className="account-empty home-empty"><h3>Real listings will appear here</h3><p>Dukanen no longer fills live sections with demo inventory. Be among the first sellers to publish.</p><Link className="primary" href="/sell">Create a listing</Link></div>}

export default async function Home(){
  const supabase=createClient();
  const [{data:productRows,error:productError},{data:categoryRows},{data:verifiedRows}]=await Promise.all([
    supabase.from('products').select('id,title,slug,price,currency,condition,city,country,views,featured,created_at,sellers(store_name),product_images(image_url,sort_order)').eq('status','active').order('created_at',{ascending:false}).limit(24),
    supabase.from('categories').select('name').eq('active',true).order('name'),
    supabase.from('sellers').select('id,store_name,business_category,city,country,verified,rating,review_count').eq('verified',true).order('rating',{ascending:false}).limit(3),
  ]);

  const live=(productRows||[]).map(cardFromProduct);
  const categories=(categoryRows||[]).map((c:any)=>c.name);
  const featuredCandidates=live.filter((p:any)=>p.featured);
  const featured=(featuredCandidates.length?featuredCandidates:live).slice(0,4);
  const recent=live.slice(0,4);
  const trending=[...live].sort((a:any,b:any)=>b.views-a.views).slice(0,8);
  const verifiedSellers=verifiedRows||[];

  return <>
    <section className="home-intro">
      <div className="container home-intro-inner">
        <div className="location-row"><span className="location-pin">●</span><span>Juba, South Sudan</span></div>
        <form className="home-search" action="/marketplace">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input name="q" aria-label="Search Dukanen" placeholder="Search products, services, businesses..."/>
          <button type="submit">Search</button>
        </form>
        <div className="quick-categories" aria-label="Popular categories">
          {categories.slice(0,6).map((c:string,i:number)=><Link key={c} href={`/marketplace?category=${encodeURIComponent(c)}`} className="quick-category"><span aria-hidden="true">{categoryIcons[i]}</span><b>{c}</b></Link>)}
          <Link href="#categories" className="quick-category"><span aria-hidden="true">•••</span><b>More</b></Link>
        </div>
      </div>
    </section>

    <section className="local-hero-section">
      <div className="container"><div className="local-hero">
        <div className="local-hero-copy"><span className="local-kicker">Dukanen · South Sudan</span><h1>Local People.<br/>Real Opportunities.</h1><p>Buy. Sell. Connect. Discover products, services and trusted local sellers across South Sudan.</p><div className="actions"><Link href="/marketplace" className="gold-cta">Start Exploring →</Link><Link href="/sell" className="hero-secondary">Sell Something</Link></div></div>
        <div className="local-hero-panel" aria-label="Dukanen marketplace promise"><div><strong>Trusted & Secure</strong><span>Clear seller identity and reporting.</span></div><div><strong>Wide Selection</strong><span>Local products and services.</span></div><div><strong>For Everyone</strong><span>Individuals & businesses.</span></div></div>
      </div></div>
    </section>

    <section id="categories" className="home-section"><div className="container"><div className="section-head"><div><span className="section-kicker">Browse faster</span><h2>Explore categories</h2><p>Find what you need quickly.</p></div><Link href="/marketplace">View all →</Link></div>{categories.length?<div className="category-grid">{categories.slice(0,14).map((c:string,i:number)=><Link key={c} className="category" href={`/marketplace?category=${encodeURIComponent(c)}`}><span className="category-icon" aria-hidden="true">{categoryIcons[i]||'＋'}</span><span>{c}</span></Link>)}</div>:<div className="account-empty"><p>Categories are temporarily unavailable.</p></div>}</div></section>

    <section className="home-section home-section-soft"><div className="container"><div className="section-head"><div><span className="section-kicker">Picked for you</span><h2>Featured near you</h2><p>{productError?'Marketplace data is temporarily unavailable.':'Live listings selected for visibility.'}</p></div><Link href="/marketplace">See all →</Link></div>{featured.length?<div className="product-grid">{featured.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>:<EmptyListings/>}</div></section>

    <section className="home-section"><div className="container"><div className="section-head"><div><span className="section-kicker">Fresh on Dukanen</span><h2>Recently added</h2><p>New opportunities from sellers across South Sudan.</p></div><Link href="/marketplace">Browse latest →</Link></div>{recent.length?<div className="product-grid">{recent.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>:<EmptyListings/>}</div></section>

    <section className="home-section home-section-soft"><div className="container"><div className="section-head"><div><span className="section-kicker">Popular now</span><h2>Trending near you</h2><p>Ranked using real listing views.</p></div><Link href="/marketplace">See all →</Link></div>{trending.length?<div className="product-grid">{trending.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>:<EmptyListings/>}</div></section>

    {verifiedSellers.length>0&&<section className="home-section"><div className="container"><div className="section-head"><div><span className="section-kicker">Local businesses</span><h2>Verified sellers</h2><p>Verification shown here comes directly from Dukanen account data.</p></div></div><div className="seller-grid">{verifiedSellers.map((s:any)=><div className="seller-card" key={s.id}><div className="seller-avatar">{s.store_name.slice(0,1)}</div><div><div className="seller-title-row"><h3>{s.store_name}</h3><span className="verified-badge">✓ Verified</span></div><p>{s.business_category||'Marketplace seller'} · {[s.city,s.country].filter(Boolean).join(', ')||'South Sudan'}</p><p>★ {Number(s.rating||0).toFixed(1)} · {s.review_count||0} reviews</p><Link href={`/marketplace?q=${encodeURIComponent(s.store_name)}`} className="seller-link">View listings →</Link></div></div>)}</div></div></section>}

    <section className="trust-section"><div className="container trust-strip"><div><span className="trust-icon" aria-hidden="true">✓</span><strong>Trusted & Secure</strong><small>Shop and sell with confidence.</small></div><div><span className="trust-icon" aria-hidden="true">▢</span><strong>Wide Selection</strong><small>Products and services for every need.</small></div><div><span className="trust-icon" aria-hidden="true">●●</span><strong>For Everyone</strong><small>Individuals, businesses and communities.</small></div><div><span className="trust-icon trust-gold" aria-hidden="true">★</span><strong>Local. Reliable. Together.</strong><small>Built for South Sudan.</small></div></div></section>
  </>;
}
