import Link from 'next/link';

export default function ProfilePage(){
  return <div className="container market-header"><div className="eyebrow">Dukanen Account</div><h1 style={{fontSize:'48px'}}>Profile</h1><p>Manage your account, seller identity, listings and preferences here.</p><div className="actions"><Link href="/auth" className="primary">Sign in</Link><Link href="/seller/dashboard" className="secondary">Seller Dashboard</Link></div></div>
}
