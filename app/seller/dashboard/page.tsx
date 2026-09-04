import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setListingStatus, deleteListing } from './actions';

export const dynamic = 'force-dynamic';

function fmtPrice(value:number|string,currency:string){
  return `${currency || 'SSP'} ${Number(value || 0).toLocaleString()}`;
}

export default async function SellerDashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <section className="container seller-dashboard-page">
        <p className="eyebrow">Seller workspace</p>
        <h1>Seller dashboard</h1>
        <div className="seller-box">
          <h3>Backend setup required</h3>
          <p>Add the Supabase environment variables and run <code>supabase/schema.sql</code> to activate seller accounts and listing management.</p>
        </div>
      </section>
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth?next=/seller/dashboard');

  const { data: seller } = await supabase
    .from('sellers')
    .select('id, store_name, verified, rating, review_count, city, country, logo_url')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    return (
      <section className="container seller-dashboard-page">
        <p className="eyebrow">Become a seller</p>
        <h1>Start selling on Dukanen</h1>
        <div className="seller-box">
          <p>Your buyer account is active, but you have not created a seller storefront yet.</p>
          <Link className="primary" href="/sell">Create your first listing</Link>
        </div>
      </section>
    );
  }

  const [{ data: products }, { count: orders }] = await Promise.all([
    supabase
      .from('products')
      .select('id,title,slug,price,currency,status,views,condition,city,country,created_at,featured')
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id),
  ]);

  const listings = products ?? [];
  const activeCount = listings.filter((p:any)=>p.status === 'active').length;
  const pausedCount = listings.filter((p:any)=>p.status === 'paused').length;
  const soldCount = listings.filter((p:any)=>p.status === 'sold').length;
  const totalViews = listings.reduce((sum:number,p:any)=>sum + Number(p.views || 0),0);

  return (
    <section className="container seller-dashboard-page">
      <div className="seller-dashboard-header">
        <div className="seller-profile-block">
          <div className="seller-dashboard-avatar">{seller.store_name?.charAt(0)?.toUpperCase() || 'D'}</div>
          <div>
            <div className="seller-title-row"><h1>{seller.store_name}</h1>{seller.verified && <span className="verified-badge">✓ Verified seller</span>}</div>
            <p>{seller.city || 'South Sudan'}{seller.country && seller.city ? `, ${seller.country}` : ''}</p>
            <div className="seller-rating-line">★ {Number(seller.rating || 0).toFixed(1)} <span>({seller.review_count || 0} reviews)</span></div>
          </div>
        </div>
        <Link className="primary" href="/sell">+ New listing</Link>
      </div>

      <div className="seller-dashboard-tabs"><span className="active">Dashboard</span><a href="#listings">My Listings</a></div>

      <div className="seller-stats-grid">
        <div className="seller-stat-card"><span>Active listings</span><strong>{activeCount}</strong><small>{pausedCount} paused · {soldCount} sold</small></div>
        <div className="seller-stat-card"><span>Total views</span><strong>{totalViews.toLocaleString()}</strong><small>Real product views</small></div>
        <div className="seller-stat-card"><span>Orders</span><strong>{orders ?? 0}</strong><small>Real order count</small></div>
        <div className="seller-stat-card unavailable"><span>Saves & inquiries</span><strong>—</strong><small>Tracking not enabled yet</small></div>
      </div>

      <div className="seller-dashboard-note">Only verified database metrics are shown here. Dukanen will add saves, message inquiries and conversion analytics after the corresponding tracking tables are enabled.</div>

      <div id="listings" className="seller-listings-section">
        <div className="section-head"><div><h2>Recent listings</h2><p>Manage the products currently attached to this seller account.</p></div><Link href="/marketplace">View marketplace →</Link></div>

        {listings.length === 0 ? (
          <div className="seller-empty-state"><h3>No listings yet</h3><p>Create your first product and it will appear here.</p><Link className="primary" href="/sell">Create listing</Link></div>
        ) : (
          <div className="seller-listings-table">
            {listings.map((item:any)=><article key={item.id} className="seller-listing-row">
              <div className="seller-listing-thumb" aria-hidden>{item.title?.charAt(0)?.toUpperCase() || 'D'}</div>
              <div className="seller-listing-main">
                <div className="seller-listing-title-line"><Link href={`/product/${item.slug}`}>{item.title}</Link><span className={`status-pill status-${item.status}`}>{item.status}</span></div>
                <div className="seller-listing-meta"><strong>{fmtPrice(item.price,item.currency)}</strong><span>👁 {Number(item.views || 0).toLocaleString()} views</span><span>{item.city || item.country || 'South Sudan'}</span></div>
              </div>
              <div className="seller-listing-actions">
                {item.status === 'active' ? <form action={setListingStatus}><input type="hidden" name="productId" value={item.id}/><input type="hidden" name="status" value="paused"/><button type="submit">Pause</button></form> : item.status === 'paused' ? <form action={setListingStatus}><input type="hidden" name="productId" value={item.id}/><input type="hidden" name="status" value="active"/><button type="submit">Activate</button></form> : null}
                {item.status !== 'sold' && <form action={setListingStatus}><input type="hidden" name="productId" value={item.id}/><input type="hidden" name="status" value="sold"/><button type="submit">Mark sold</button></form>}
                <Link href={`/product/${item.slug}`}>View</Link>
                <form action={deleteListing}><input type="hidden" name="productId" value={item.id}/><button type="submit" className="danger-action">Delete</button></form>
              </div>
            </article>)}
          </div>
        )}
      </div>
    </section>
  );
}
