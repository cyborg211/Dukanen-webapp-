import Link from 'next/link';

export default function ProductCard({product}:{product:any}){
  const image=product.image||product.image_url||product.images?.[0];
  return <Link href={`/product/${product.slug}`} className="product-card mobile-product-card">
    <div className={`product-image ${image?'has-image':''}`}>
      {image?<img src={image} alt={product.title||'Dukanen listing'} loading="lazy"/>:<span aria-hidden="true">{product.emoji||'🛍️'}</span>}
      <span className="mobile-card-condition">{product.condition||'Available'}</span>
    </div>
    <div className="product-body">
      <strong className="mobile-card-price">{product.price}</strong>
      <h3>{product.title}</h3>
      <p className="mobile-card-location">{product.location||'South Sudan'}</p>
      <p className="mobile-card-seller">{product.seller||'Dukanen Seller'}</p>
    </div>
  </Link>
}
