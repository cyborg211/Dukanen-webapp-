import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';

export const dynamic='force-dynamic';

export default async function FavoritesPage(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth?next=/favorites');

  const {data}=await supabase
    .from('favorites')
    .select('product_id,created_at,products(id,title,slug,price,currency,condition,city,country,status,sellers(store_name),product_images(image_url,sort_order))')
    .eq('user_id',user.id)
    .order('created_at',{ascending:false});

  const products=(data||[])
    .map((row:any)=>row.products)
    .filter((p:any)=>p&&p.status==='active')
    .map((p:any)=>{
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

  return <div className="container account-page">
    <div className="market-header"><div className="eyebrow">Saved on Dukanen</div><h1>Favorites</h1><p>Keep interesting listings in one place and come back to them anytime.</p></div>
    {products.length?<div className="product-grid">{products.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div>:<div className="account-empty"><h2>No favorites yet</h2><p>Tap the heart on a listing to save it here.</p><Link className="primary" href="/marketplace">Explore marketplace</Link></div>}
  </div>;
}
