import Link from 'next/link';

export default function NotFound(){
  return <div className="container market-header">
    <div className="eyebrow">Dukanen Marketplace</div>
    <h1 style={{fontSize:'48px'}}>We couldn’t find that page</h1>
    <p>The listing may have been removed, sold, paused, or the address may be incorrect.</p>
    <div className="actions"><Link className="primary" href="/marketplace">Browse Marketplace</Link><Link className="secondary" href="/">Go Home</Link></div>
  </div>;
}
