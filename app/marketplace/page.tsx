import ProductCard from '@/components/ProductCard';
import {createClient} from '@/lib/supabase/server';
import {products as demoProducts,categories as demoCategories} from '@/lib/data';

export const dynamic='force-dynamic';

export default async function Marketplace({searchParams}:{searchParams?:{q?:string;category?:string}}){
  const supabase=createClient();
  let query=supabase
    .from('products')
    .select('id,title,slug,price,currency,condition,city,country,status,created_at,sellers(store_name),categories(name),product_images(image_url,sort_order)')
    .eq('status','active')
    .order('created_at',{ascending:false})
    .limit(48);

  if(searchParams?.q) query=query.ilike('title',`%${searchParams.q}%`);
  if(searchParams?.category){
    const {data:cat}=await supabase.from('categories').select('id').eq('name',searchParams.category).maybeSingle();
    if(cat?.id) query=query.eq('category_id',cat.id);
  }

  const {data}=await query;
  const {data:catRows}=await supabase.from('categories').select('name,slug').order('name');
  const live=(data||[]).map((p:any)=>{
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
  const products=live.length?live:demoProducts;
  const categories=catRows?.length?catRows.map((c:any)=>c.name):demoCategories;

  return <div className="container">
    <div className="market-header">
      <div className="eyebrow">Browse Dukanen</div>
      <h1 style={{fontSize:'48px'}}>Marketplace</h1>
      <p>Search products and opportunities by category, location and condition.</p>
      <form className="searchbox"><input name="q" defaultValue={searchParams?.q||''} placeholder="Search listings, sellers or locations"/><button>Search</button></form>
      <div className="filterbar"><span>📍 South Sudan</span><span>Newest</span><span>Price</span><span>Condition</span><span>Seller type</span></div>
    </div>
    <div className="section-head"><div><h2>All listings</h2><p>{live.length?`${live.length} live listings`:`${products.length} demo listings while sellers get started`}</p></div></div>
    <div className="product-grid">{products.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>
    <section><div className="section-head"><div><h2>Browse categories</h2></div></div><div className="category-grid">{categories.map((c:string)=><a href={`/marketplace?category=${encodeURIComponent(c)}`} className="category" key={c}>{c}</a>)}</div></section>
  </div>;
}
