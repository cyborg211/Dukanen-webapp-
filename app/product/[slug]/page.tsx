import Link from 'next/link';
import {notFound} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import {products as demoProducts} from '@/lib/data';
import {startConversation,toggleFavorite} from './actions';

export const dynamic='force-dynamic';

type ProductView={
  id?:string;
  sellerId?:string;
  slug:string;
  title:string;
  price:string;
  location:string;
  condition:string;
  seller:string;
  category:string;
  description:string;
  emoji:string;
  verified?:boolean;
  negotiable?:boolean;
  images?:string[];
};

export default async function ProductPage({params}:{params:{slug:string}}){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data}=await supabase
    .from('products')
    .select('id,title,slug,description,price,currency,condition,city,country,status,negotiable,sellers(id,store_name,verified,user_id),categories(name),product_images(image_url,sort_order)')
    .eq('slug',params.slug)
    .eq('status','active')
    .maybeSingle();

  if(data?.id){
    await supabase.rpc('increment_product_views',{product_uuid:data.id});
  }

  const demo=demoProducts.find(p=>p.slug===params.slug);
  const liveImages=data?((data as any).product_images||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((i:any)=>i.image_url).filter(Boolean):[];
  const sellerData=data?(data as any).sellers:null;
  const product:ProductView|undefined=data?{
    id:data.id,
    sellerId:sellerData?.id,
    slug:data.slug||data.id,
    title:data.title,
    price:`${data.currency||'SSP'} ${Number(data.price).toLocaleString()}`,
    condition:data.condition||'Available',
    location:[data.city,data.country].filter(Boolean).join(', ')||'South Sudan',
    category:(data as any).categories?.name||'Marketplace',
    description:data.description||'No description provided.',
    seller:sellerData?.store_name||'Dukanen Seller',
    emoji:'🛍️',
    verified:Boolean(sellerData?.verified),
    negotiable:Boolean((data as any).negotiable),
    images:liveImages,
  }:demo?{...demo,verified:false,negotiable:true,images:[]}:undefined;

  if(!product) notFound();

  let isFavorite=false;
  if(user&&product.id){
    const {data:fav}=await supabase.from('favorites').select('product_id').eq('user_id',user.id).eq('product_id',product.id).maybeSingle();
    isFavorite=Boolean(fav);
  }

  const related=demoProducts.filter(p=>p.category===product.category&&p.slug!==product.slug).slice(0,4);
  const whatsappText=encodeURIComponent(`${product.title} — ${product.price} on Dukanen`);
  const cover=product.images?.[0];

  return <div className="product-page">
    <div className="container product-breadcrumb"><Link href="/marketplace">← Back to marketplace</Link></div>

    <div className="container product-detail product-detail-v2">
      <section className="product-gallery" aria-label="Product photos">
        {cover?<div className="detail-image product-main-image product-photo-main"><img src={cover} alt={product.title}/></div>:<div className="detail-image product-main-image" aria-label={product.title}>{product.emoji}</div>}
        <div className="product-thumbs" aria-label="Photo thumbnails">
          {product.images?.length?product.images.slice(0,6).map((src,index)=><div className={`product-thumb ${index===0?'active':''}`} key={src}><img src={src} alt={`${product.title} photo ${index+1}`}/></div>):<>
            <button className="product-thumb active" aria-label="Photo 1">{product.emoji}</button>
            <button className="product-thumb placeholder" aria-label="More photos coming soon">＋</button>
          </>}
        </div>
      </section>

      <section className="detail-copy product-info-panel">
        <div className="product-badges"><span className="chip">{product.condition}</span>{product.negotiable&&<span className="chip gold-chip">Negotiable</span>}</div>
        <div className="product-title-actions"><h1>{product.title}</h1>{product.id&&<form action={toggleFavorite}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="slug" value={product.slug}/><button type="submit" className={`favorite-button ${isFavorite?'saved':''}`} aria-label={isFavorite?'Remove from favorites':'Save to favorites'}>{isFavorite?'♥':'♡'}</button></form>}</div>
        <div className="price">{product.price}</div>
        <div className="product-meta"><span>📍 {product.location}</span><span>•</span><span>{product.category}</span></div>

        <div className="seller-box seller-card-v2">
          <div className="seller-avatar" aria-hidden="true">{product.seller.charAt(0).toUpperCase()}</div>
          <div className="seller-copy"><div className="seller-name-row"><h3>{product.seller}</h3>{product.verified&&<span className="verified-badge">✓ Verified</span>}</div><p>{product.location} · Dukanen seller</p></div>
          <Link href={`/marketplace?q=${encodeURIComponent(product.seller)}`} className="seller-profile-link">View seller</Link>
        </div>

        {product.id&&product.sellerId?<>
          <div className="contact-actions">
            <form action={startConversation}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="sellerId" value={product.sellerId}/><input type="hidden" name="slug" value={product.slug}/><input type="hidden" name="intent" value="chat"/><button className="primary contact-primary" type="submit">💬 Chat</button></form>
            <a className="secondary" href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <form action={startConversation}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="sellerId" value={product.sellerId}/><input type="hidden" name="slug" value={product.slug}/><input type="hidden" name="intent" value="call"/><button className="secondary" type="submit">☎ Call seller</button></form>
          </div>
          <form action={startConversation}><input type="hidden" name="productId" value={product.id}/><input type="hidden" name="sellerId" value={product.sellerId}/><input type="hidden" name="slug" value={product.slug}/><input type="hidden" name="intent" value="offer"/><button className="offer-button" type="submit">Make an offer</button></form>
        </>:<div className="contact-actions"><Link className="primary contact-primary" href="/messages">💬 Chat</Link><a className="secondary" href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp</a></div>}

        <div className="product-section-card"><h2>Description</h2><p>{product.description}</p></div>
        <div className="product-section-card product-facts"><h2>Listing details</h2><dl><div><dt>Condition</dt><dd>{product.condition}</dd></div><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Location</dt><dd>{product.location}</dd></div></dl></div>

        <div className="safety-card"><div className="safety-icon">✓</div><div><h3>Trade safely on Dukanen</h3><p>Meet in a public place, inspect the item before paying, and avoid sending money before you have verified the seller and product.</p></div></div>
        <Link className="report-link" href={`/messages?report=${encodeURIComponent(product.slug)}`}>⚑ Report this listing</Link>
      </section>
    </div>

    {related.length>0&&<section className="related-section"><div className="container"><div className="section-head"><div><h2>Similar listings</h2><p>More products you may be interested in.</p></div><Link href={`/marketplace?category=${encodeURIComponent(product.category)}`}>See all →</Link></div><div className="product-grid">{related.map(p=><ProductCard key={p.slug} product={p}/>)}</div></div></section>}
  </div>;
}
