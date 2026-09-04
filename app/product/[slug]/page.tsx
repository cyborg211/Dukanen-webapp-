import Link from 'next/link';
import {notFound} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import {products as demoProducts} from '@/lib/data';

export const dynamic='force-dynamic';

type ProductView={
  id?:string;
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
};

export default async function ProductPage({params}:{params:{slug:string}}){
  const supabase=createClient();
  const {data}=await supabase
    .from('products')
    .select('id,title,slug,description,price,currency,condition,location,status,sellers(store_name),categories(name)')
    .eq('slug',params.slug)
    .eq('status','active')
    .maybeSingle();

  const demo=demoProducts.find(p=>p.slug===params.slug);
  const product:ProductView|undefined=data?{
    id:data.id,
    slug:data.slug||data.id,
    title:data.title,
    price:`${data.currency||'SSP'} ${Number(data.price).toLocaleString()}`,
    condition:data.condition||'Available',
    location:data.location||'South Sudan',
    category:(data as any).categories?.name||'Marketplace',
    description:data.description||'No description provided.',
    seller:(data as any).sellers?.store_name||'Dukanen Seller',
    emoji:'🛍️',
    verified:false,
    negotiable:true,
  }:demo?{...demo,verified:false,negotiable:true}:undefined;

  if(!product) notFound();

  const related=demoProducts
    .filter(p=>p.category===product.category&&p.slug!==product.slug)
    .slice(0,4);
  const messageHref=`/messages?product=${encodeURIComponent(product.slug)}`;
  const whatsappText=encodeURIComponent(`${product.title} — ${product.price} on Dukanen`);

  return <div className="product-page">
    <div className="container product-breadcrumb"><Link href="/marketplace">← Back to marketplace</Link></div>

    <div className="container product-detail product-detail-v2">
      <section className="product-gallery" aria-label="Product photos">
        <div className="detail-image product-main-image" aria-label={product.title}>{product.emoji}</div>
        <div className="product-thumbs" aria-label="Photo thumbnails">
          <button className="product-thumb active" aria-label="Photo 1">{product.emoji}</button>
          <button className="product-thumb placeholder" aria-label="More photos coming soon">＋</button>
          <button className="product-thumb placeholder" aria-label="More photos coming soon">＋</button>
        </div>
      </section>

      <section className="detail-copy product-info-panel">
        <div className="product-badges"><span className="chip">{product.condition}</span>{product.negotiable&&<span className="chip gold-chip">Negotiable</span>}</div>
        <h1>{product.title}</h1>
        <div className="price">{product.price}</div>
        <div className="product-meta"><span>📍 {product.location}</span><span>•</span><span>{product.category}</span></div>

        <div className="seller-box seller-card-v2">
          <div className="seller-avatar" aria-hidden="true">{product.seller.charAt(0).toUpperCase()}</div>
          <div className="seller-copy"><div className="seller-name-row"><h3>{product.seller}</h3>{product.verified&&<span className="verified-badge">✓ Verified</span>}</div><p>{product.location} · Dukanen seller</p></div>
          <Link href={`/marketplace?q=${encodeURIComponent(product.seller)}`} className="seller-profile-link">View seller</Link>
        </div>

        <div className="contact-actions">
          <Link className="primary contact-primary" href={messageHref}>💬 Chat</Link>
          <a className="secondary" href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <Link className="secondary" href={`${messageHref}&intent=call`}>☎ Call seller</Link>
        </div>
        <Link className="offer-button" href={`${messageHref}&intent=offer`}>Make an offer</Link>

        <div className="product-section-card"><h2>Description</h2><p>{product.description}</p></div>
        <div className="product-section-card product-facts"><h2>Listing details</h2><dl><div><dt>Condition</dt><dd>{product.condition}</dd></div><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Location</dt><dd>{product.location}</dd></div></dl></div>

        <div className="safety-card"><div className="safety-icon">✓</div><div><h3>Trade safely on Dukanen</h3><p>Meet in a public place, inspect the item before paying, and avoid sending money before you have verified the seller and product.</p></div></div>
        <Link className="report-link" href={`/messages?report=${encodeURIComponent(product.slug)}`}>⚑ Report this listing</Link>
      </section>
    </div>

    {related.length>0&&<section className="related-section"><div className="container"><div className="section-head"><div><h2>Similar listings</h2><p>More products you may be interested in.</p></div><Link href={`/marketplace?category=${encodeURIComponent(product.category)}`}>See all →</Link></div><div className="product-grid">{related.map(p=><ProductCard key={p.slug} product={p}/>)}</div></div></section>}
  </div>;
}
