import Link from 'next/link';
import {notFound} from 'next/navigation';
import {products} from '@/lib/data';

export function generateStaticParams(){return products.map(p=>({slug:p.slug}))}

export default function ProductPage({params}:{params:{slug:string}}){
 const product=products.find(p=>p.slug===params.slug); if(!product) notFound();
 return <div className="container product-detail"><div className="detail-image" aria-hidden>{product.emoji}</div><div className="detail-copy"><span className="chip">{product.condition}</span><h1>{product.title}</h1><div className="price">{product.price}</div><p>📍 {product.location} · {product.category}</p><p>{product.description}</p><div className="actions"><button className="primary" style={{border:0,fontSize:'16px'}}>Contact Seller</button><Link className="secondary" href="/marketplace">Save listing</Link></div><div className="seller-box"><span className="chip">Seller</span><h3>{product.seller}</h3><p>{product.location} · Marketplace seller</p><p>Use Dukanen’s report tools if a listing looks suspicious. Never send money before verifying the item and seller.</p></div></div></div>
}
