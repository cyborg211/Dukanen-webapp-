import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {createClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

export default async function Marketplace({searchParams}:{searchParams?:{q?:string;category?:string}}){
  const supabase=createClient();
  let query=supabase
    .from('products')
    .select('id,title,slug,price,currency,condition,city,country,status,created_at,sellers(store_name),categories(name),product_images(image_url,sort_order)')
    .eq('status','active')
    .order('created_at',{ascending:false})
    .limit(48);

  const q=searchParams?.q?.trim();
  if(q) query=query.ilike('title',`%${q}%`);

  if(searchParams?.category){
    const {data:cat}=await supabase.from('categories').select('id').eq('name',searchParams.category).eq('active',true).maybeSingle();
    if(cat?.id) query=query.eq('category_id',cat.id);
    else query=query.eq('category_id','00000000-0000-0000-0000-000000000000');
  }

  const [{data,error},{data:catRows}]=await Promise.all([
    query,
    supabase.from('categories').select('name,slug').eq('active',true).order('name'),
  ]);

  const products=(data||[]).map((p:any)=>{
    const images=(p.product_images||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order);
    return {
      slug:p.slug||p.id,
      title:p.title,
      price:`${p.currency||'SSP'} ${Number(p.price).toLocaleString()}`,
      condition:p.condition||'Available',
      location:[p.city,p.country].filter(Boolean).join(', ')||'South Sudan',
      seller:p.sellers?.store_name||'Dukanen Seller',
      image:images[0]?.image_url,
      emoji:'🛍️'
    };
  });
  const categories=(catRows||[]).map((c:any)=>c.name);

  return <div className="container">
    <div className="market-header">
      <div className="eyebrow">Browse Dukanen</div>
      <h1 style={{fontSize:'48px'}}>Marketplace</h1>
      <p>Search products and opportunities by category, location and condition.</p>
      <form className="searchbox" action="/marketplace">
        <input name="q" aria-label="Search marketplace" defaultValue={q||''} placeholder="Search listings"/>
        {searchParams?.category&&<input type="hidden" name="category" value={searchParams.category}/>}<button type="submit">Search</button>
      </form>
      <div className="filterbar" aria-label="Marketplace context"><span>📍 South Sudan</span><span>Newest first</span></div>
    </div>

    <div className="section-head"><div><h2>Listings</h2><p>{error?'Marketplace listings are temporarily unavailable.':`${products.length} live ${products.length===1?'listing':'listings'}`}</p></div></div>

    {error?<div className="account-empty" role="status"><h2>We couldn’t load listings</h2><p>Please try again shortly. Your account and seller data are not affected.</p></div>:
    products.length?<div className="product-grid">{products.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>:
    <div className="account-empty"><h2>{q||searchParams?.category?'No matching listings':'The marketplace is ready for its first listings'}</h2><p>{q||searchParams?.category?'Try another search or category.':'No demo inventory is being shown. Real seller listings will appear here as soon as they are published.'}</p><div className="actions">{(q||searchParams?.category)&&<Link className="secondary" href="/marketplace">Clear filters</Link>}<Link className="primary" href="/sell">Sell something</Link></div></div>}

    <section><div className="section-head"><div><h2>Browse categories</h2></div></div><div className="category-grid">{categories.map((c:string)=><Link href={`/marketplace?category=${encodeURIComponent(c)}`} className="category" key={c}>{c}</Link>)}</div></section>
  </div>;
}
