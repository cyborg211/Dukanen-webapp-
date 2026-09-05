import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

export default async function ProfilePage(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth?next=/profile');
  const [{data:profile},{data:seller}]=await Promise.all([
    supabase.from('profiles').select('name,email,phone,role,country,region,city,neighborhood,created_at').eq('id',user.id).maybeSingle(),
    supabase.from('sellers').select('id,store_name,verified,rating,review_count,city,country').eq('user_id',user.id).maybeSingle(),
  ]);
  const displayName=profile?.name||user.email?.split('@')[0]||'Dukanen User';
  return <div className="container account-page mobile-profile-page">
    <div className="profile-mobile-head"><div><span>📍</span><strong>Dukanen</strong></div><span>🔔</span></div>
    <section className="profile-hero-card">
      <div className="profile-avatar large">{displayName.charAt(0).toUpperCase()}</div>
      <h1>{displayName}</h1>
      <p>{seller?'Seller account':'Buyer account'} · {[profile?.city,profile?.country].filter(Boolean).join(', ')||'South Sudan'}</p>
      {seller&&<div className="profile-seller-state"><strong>{seller.store_name}</strong>{seller.verified&&<span className="verified-badge">✓ Verified</span>}<span>★ {Number(seller.rating||0).toFixed(1)} · {seller.review_count||0} reviews</span></div>}
      <div className="profile-hero-actions"><Link className="primary" href={seller?'/seller/dashboard':'/sell'}>{seller?'Seller Dashboard':'Start Selling'}</Link><Link className="secondary" href="/messages">Messages</Link></div>
    </section>

    <section className="profile-menu-card"><span className="profile-menu-label">Activity</span><Link href={seller?'/seller/dashboard':'/sell'}><b>▣</b><span>My Listings</span><i>›</i></Link><Link href="/favorites"><b>♡</b><span>Saved Items</span><i>›</i></Link><Link href="/messages"><b>▤</b><span>Messages</span><i>›</i></Link></section>
    <section className="profile-menu-card"><span className="profile-menu-label">Account</span><div><b>◎</b><span>{profile?.phone||'Phone not added'}</span></div><div><b>⌖</b><span>{[profile?.city,profile?.country].filter(Boolean).join(', ')||'South Sudan'}</span></div><div><b>✉</b><span>{profile?.email||user.email}</span></div></section>
    <section className="profile-menu-card"><span className="profile-menu-label">App Settings</span><Link href="/marketplace"><b>⚙</b><span>Marketplace Settings</span><i>›</i></Link><Link href="/messages"><b>?</b><span>Help & Support</span><i>›</i></Link></section>
  </div>;
}
