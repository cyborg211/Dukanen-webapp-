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

  return <div className="container account-page">
    <div className="market-header"><div className="eyebrow">Dukanen Account</div><h1>{profile?.name||user.email?.split('@')[0]||'Profile'}</h1><p>Manage your buyer account and seller identity from one place.</p></div>

    <div className="profile-grid">
      <section className="profile-card">
        <div className="profile-avatar">{(profile?.name||user.email||'D').charAt(0).toUpperCase()}</div>
        <div><h2>{profile?.name||'Dukanen User'}</h2><p>{profile?.email||user.email}</p><p>📍 {[profile?.city,profile?.country].filter(Boolean).join(', ')||'South Sudan'}</p></div>
      </section>

      <section className="profile-card profile-details"><h2>Account details</h2><dl>
        <div><dt>Role</dt><dd>{profile?.role||'buyer'}</dd></div>
        <div><dt>Phone</dt><dd>{profile?.phone||'Not added'}</dd></div>
        <div><dt>City</dt><dd>{profile?.city||'Not added'}</dd></div>
        <div><dt>Neighborhood</dt><dd>{profile?.neighborhood||'Not added'}</dd></div>
      </dl></section>

      <section className="profile-card seller-profile-summary"><h2>Seller account</h2>{seller?<><div className="seller-name-row"><strong>{seller.store_name}</strong>{seller.verified&&<span className="verified-badge">✓ Verified</span>}</div><p>★ {Number(seller.rating||0).toFixed(1)} · {seller.review_count||0} reviews</p><p>📍 {[seller.city,seller.country].filter(Boolean).join(', ')||'South Sudan'}</p><Link className="primary" href="/seller/dashboard">Open Seller Dashboard</Link></>:<><p>No seller storefront yet. Create a listing and Dukanen will create one for you.</p><Link className="primary" href="/sell">Start selling</Link></>}</section>
    </div>

    <div className="actions"><Link href="/favorites" className="secondary">Favorites</Link><Link href="/messages" className="secondary">Messages</Link><Link href="/marketplace" className="secondary">Browse Marketplace</Link></div>
  </div>;
}
