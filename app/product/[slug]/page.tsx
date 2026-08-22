import Link from 'next/link';
import {notFound} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {products as demoProducts} from '@/lib/data';

export const dynamic='force-dynamic';

export default async function ProductPage({params}:{params:{slug:string}}){
 const supabase=createClient();
 const {data}=await supabase.from('products').select('id,title,slug,description,price,currency,condition,location,status,sellers(store_name),categories(name)').eq('slug',params.slug).eq('status','active').maybeSingle();
 const demo=demoProducts.find(p=>p.slug===params.slug);
 const product=data?{title:data.title,price:`${data.currency||'USD'} ${Number(data.price).toLocaleString()}`,condition:data.condition||'Available',location:data.location||'South Sudan',category:(data as any).categories?.name||'Marketplace',description:data.description||'No description provided.',seller:(data as any).sellers?.store_name||'Dukanen Seller',emoji:'🛍️'}:demo;
 if(!product) notFound();
 return <div className="container product-detail"><div className="detail-image" aria-hidden>{product.emoji}</div><div className="detail-copy"><span className="chip">{product.condition}</span><h1>{product.title}</h1><div className="price">{product.price}</div><p>📍 {product.location} · {product.category}</p><p>{product.description}</p><div className="actions"><button className="primary" style={{border:0,fontSize:'16px'}}>Contact Seller</button><Link className="secondary" href="/marketplace">Back to marketplace</Link></div><div className="seller-box"><span className="chip">Seller</span><h3>{product.seller}</h3><p>{product.location} · Marketplace seller</p><p>Use Dukanen’s report tools if a listing looks suspicious. Never send money before verifying the item and seller.</p></div></div></div>
}
