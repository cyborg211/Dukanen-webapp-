import Link from 'next/link';

export default function ProductCard({product}:{product:any}){
  const image=product.image||product.image_url||product.images?.[0];
  return <Link href={`/product/${product.slug}`} className="product-card">
    <div className={`product-image ${image?'has-image':''}`} aria-hidden={!image}>
      {image?<img src={image} alt={product.title||'Dukanen listing'}/>:product.emoji||'🛍️'}
    </div>
    <div className="product-body">
      <span className="chip">{product.condition||'Available'}</span>
      <h3>{product.title}</h3>
      <strong>{product.price}</strong>
      <p>{product.location||'South Sudan'} · {product.seller||'Dukanen Seller'}</p>
    </div>
  </Link>
}
