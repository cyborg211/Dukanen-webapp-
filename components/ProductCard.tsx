import Link from 'next/link';

export default function ProductCard({product}:{product:any}){
  return <Link href={`/product/${product.slug}`} className="product-card">
    <div className="product-image" aria-hidden>{product.emoji}</div>
    <div className="product-body">
      <span className="chip">{product.condition}</span>
      <h3>{product.title}</h3>
      <strong>{product.price}</strong>
      <p>{product.location} · {product.seller}</p>
    </div>
  </Link>
}
