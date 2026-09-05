import Link from 'next/link';
import {notFound} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import {startConversation,toggleFavorite} from './actions';

export const dynamic='force-dynamic';

type ProductView={id:string;sellerId:string;categoryId?:string;slug:string;title:string;price:string;location:string;condition:string;seller:string;category:string;description:string;verified:boolean;negotiable:boolean;images:string[]};

function ChatForm({product,children,className=''}:{product:ProductView;children:React.ReactNode;className?:string}){
  return <form action={startConversation} className={className}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="sellerId" value={product.sellerId}/><input type="hidden" name="slug" value={product.slug}/><input type="hidden" name="intent" value="chat"/><button className="primary contact-primary" type="submit">{children}</button></form>;
}

export default async function ProductPage({params}:{params:{slug:string}}){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data,error}=await supabase.from('products').select('id,title,slug,description,price,currency,condition,city,country,status,negotiable,category_id,sellers(id,store_name,verified,user_id),categories(name),product_images(image_url,sort_order)').eq('slug',params.slug).eq('status','active').maybeSingle();
  if(error||!data) notFound();
  await supabase.from('product_view_events').insert({product_id:data.id,viewer_id:user?.id||null});
  const sellerData=(data as any).sellers;
  if(!sellerData?.id) notFound();
  const images=((data as any).product_images||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((i:any)=>i.image_url).filter(Boolean);
  const product:ProductView={id:data.id,sellerId:sellerData.id,categoryId:data.category_id||undefined,slug:data.slug||data.id,title:data.title,price:`${data.currency||'SSP'} ${Number(data.price).toLocaleString()}`,condition:data.condition||'Available',location:[data.city,data.country].filter(Boolean).join(', ')||'South Sudan',category:(data as any).categories?.name||'Marketplace',description:data.description||'No description provided.',seller:sellerData.store_name||'Dukanen Seller',verified:Boolean(sellerData.verified),negotiable:Boolean((data as any).negotiable),images};
  let isFavorite=false;
  if(user){const {data:fav}=await supabase.from('favorites').select('product_id').eq('user_id',user.id).eq('product_id',product.id).maybeSingle();isFavorite=Boolean(fav);}
  let related:any[]=[];
  if(product.categoryId){const {data:relatedRows}=await supabase.from('products').select('id,title,slug,price,currency,condition,city,country,sellers(store_name),product_images(image_url,sort_order)').eq('status','active').eq('category_id',product.categoryId).neq('id',product.id).order('created_at',{ascending:false}).limit(4);related=(relatedRows||[]).map((p:any)=>{const imgs=(p.product_images||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order);return {slug:p.slug||p.id,title:p.title,price:`${p.currency||'SSP'} ${Number(p.price).toLocaleString()}`,condition:p.condition||'Available',location:[p.city,p.country].filter(Boolean).join(', ')||'South Sudan',seller:p.sellers?.store_name||'Dukanen Seller',image:imgs[0]?.image_url,emoji:'🛍️'};});}
  const cover=product.images[0];
  return <div className="product-page mobile-product-page">
    <div className="container product-breadcrumb"><Link href="/marketplace">← Back</Link></div>
    <div className="container product-detail product-detail-v2">
      <section className="product-gallery" aria-label="Product photos">
        {cover?<div className="detail-image product-main-image product-photo-main"><img src={cover} alt={product.title}/></div>:<div className="detail-image product-main-image" aria-label="No product photo available">🛍️</div>}
        {product.images.length>1&&<div className="product-thumbs">{product.images.slice(0,6).map((src,index)=><div className={`product-thumb ${index===0?'active':''}`} key={src}><img src={src} alt={`${product.title} photo ${index+1}`}/></div>)}</div>}
      </section>
      <section className="detail-copy product-info-panel">
        <div className="product-title-actions"><div><div className="product-badges"><span className="chip">{product.condition}</span>{product.negotiable&&<span className="chip gold-chip">Negotiable</span>}</div><h1>{product.title}</h1></div><form action={toggleFavorite}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="slug" value={product.slug}/><button type="submit" className={`favorite-button ${isFavorite?'saved':''}`} aria-label={isFavorite?'Remove from favorites':'Save to favorites'}>{isFavorite?'♥':'♡'}</button></form></div>
        <div className="price">{product.price}</div>
        <div className="product-meta"><span>📍 {product.location}</span><span>{product.category}</span></div>
        <div className="seller-box seller-card-v2"><div className="seller-avatar">{product.seller.charAt(0).toUpperCase()}</div><div className="seller-copy"><div className="seller-name-row"><h3>{product.seller}</h3>{product.verified&&<span className="verified-badge">✓ Verified</span>}</div><p>{product.location}</p></div><Link href={`/marketplace?q=${encodeURIComponent(product.seller)}`} className="seller-profile-link">View shop</Link></div>
        <div className="contact-actions desktop-contact-actions"><ChatForm product={product}>💬 Chat</ChatForm><form action={startConversation}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="sellerId" value={product.sellerId}/><input type="hidden" name="slug" value={product.slug}/><input type="hidden" name="intent" value="call"/><button className="secondary" type="submit">☎ Contact</button></form>{product.negotiable&&<form action={startConversation}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="sellerId" value={product.sellerId}/><input type="hidden" name="slug" value={product.slug}/><input type="hidden" name="intent" value="offer"/><button className="secondary" type="submit">Make offer</button></form>}</div>
        <div className="product-section-card"><h2>Description</h2><p>{product.description}</p></div>
        <div className="product-section-card product-facts"><h2>Listing details</h2><dl><div><dt>Condition</dt><dd>{product.condition}</dd></div><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Location</dt><dd>{product.location}</dd></div></dl></div>
        <div className="safety-card"><div className="safety-icon">✓</div><div><h3>Trade safely</h3><p>Meet in public, inspect before paying, and verify the seller and item first.</p></div></div>
      </section>
    </div>
    {related.length>0&&<section className="related-section"><div className="container"><div className="section-head"><div><h2>You may also like</h2></div><Link href={`/marketplace?category=${encodeURIComponent(product.category)}`}>See all →</Link></div><div className="product-grid">{related.map((p:any)=><ProductCard key={p.slug} product={p}/>)}</div></div></section>}
    <div className="mobile-product-actions"><ChatForm product={product} className="mobile-chat-form">Chat</ChatForm>{product.negotiable?<form action={startConversation}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="sellerId" value={product.sellerId}/><input type="hidden" name="slug" value={product.slug}/><input type="hidden" name="intent" value="offer"/><button className="mobile-buy-action" type="submit">Make Offer</button></form>:<ChatForm product={product} className="mobile-buy-form">Contact Seller</ChatForm>}</div>
  </div>;
}
