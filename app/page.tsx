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

function EmptyListings(){return <div className="account-empty home-empty"><h3>No listings yet</h3><p>Real seller listings will appear here as they are published.</p><Link className="primary" href="/sell">Sell an item</Link></div>}

export default async function Home(){
  const supabase=createClient();
  const [{data:productRows,error:productError},{data:categoryRows}]=await Promise.all([
    supabase.from('products').select('id,title,slug,price,currency,condition,city,country,views,featured,created_at,sellers(store_name),product_images(image_url,sort_order)').eq('status','active').order('created_at',{ascending:false}).limit(24),
    supabase.from('categories').select('name').eq('active',true).order('name'),
  ]);

  const live=(productRows||[]).map(cardFromProduct);
  const categories=(categoryRows||[]).map((c:any)=>c.name);
  const recommended=[...live].sort((a:any,b:any)=>Number(b.featured)-Number(a.featured)||b.views-a.views||String(b.created_at).localeCompare(String(a.created_at))).slice(0,8);
  const recent=live.slice(0,8);

  return <div className="mobile-home-shell">
    <section className="home-intro">
      <div className="container home-intro-inner">
        <div className="mobile-home-topline">
          <div>
            <span className="mobile-greeting">Marketplace near you</span>
            <div className="location-row"><span className="location-pin" aria-hidden="true">●</span><strong>Juba, South Sudan</strong></div>
          </div>
          <Link href="/favorites" className="mobile-icon-button" aria-label="Saved items">♡</Link>
        </div>

        <form className="home-search" action="/marketplace">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input name="q" aria-label="Search Dukanen" placeholder="Search products, services, sellers..."/>
          <button type="submit">Search</button>
        </form>

        <div className="mobile-section-row mobile-category-heading">
          <h2>Categories</h2><Link href="/categories">See all</Link>
        </div>
        <div className="quick-categories" aria-label="Popular categories">
          {categories.slice(0,6).map((c:string,i:number)=><Link key={c} href={`/marketplace?category=${encodeURIComponent(c)}`} className="quick-category"><span aria-hidden="true">{categoryIcons[i]}</span><b>{c}</b></Link>)}
        </div>
      </div>
    </section>

    <section className="mobile-market-banner">
      <div className="container"><div className="mobile-market-banner-card">
        <span className="banner-kicker">Dukanen South Sudan</span>
        <h1>Buy and sell locally.</h1>
        <p>Discover real listings from people and businesses across South Sudan.</p>
        <div className="mobile-banner-actions"><Link href="/marketplace">Explore marketplace</Link><Link href="/sell">Sell now</Link></div>
      </div></div>
    </section>

    <section className="mobile-feed-section">
      <div className="container">
        <div className="mobile-section-row"><div><span className="section-kicker">Local discovery</span><h2>Recommended for you</h2></div><Link href="/marketplace">View all</Link></div>
        {productError?<div className="account-empty"><p>Marketplace data is temporarily unavailable.</p></div>:recommended.length?<div className="product-grid mobile-product-grid">{recommended.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>:<EmptyListings/>}
      </div>
    </section>

    {recent.length>0&&<section className="mobile-feed-section mobile-feed-soft">
      <div className="container">
        <div className="mobile-section-row"><div><span className="section-kicker">Fresh listings</span><h2>Recently added</h2></div><Link href="/marketplace">See all</Link></div>
        <div className="product-grid mobile-product-grid">{recent.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>
      </div>
    </section>}

    <section className="mobile-trust-card-section"><div className="container"><div className="mobile-trust-card"><strong>Local. Reliable. Together.</strong><p>Dukanen is built for real South Sudanese commerce. Verify items before paying and meet safely.</p></div></div></section>
  </div>;
}
