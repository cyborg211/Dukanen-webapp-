import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setListingStatus, deleteListing } from './actions';

export const dynamic = 'force-dynamic';

function fmtPrice(value:number|string,currency:string){
  return `${currency || 'SSP'} ${Number(value || 0).toLocaleString()}`;
}

const dashboardCss = `
.seller-dashboard-page{padding:34px 0 70px}.seller-dashboard-header{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:24px;border:1px solid var(--line);border-radius:24px;background:#fff;box-shadow:var(--shadow-sm)}.seller-profile-block{display:flex;align-items:center;gap:16px}.seller-dashboard-avatar{width:64px;height:64px;border-radius:20px;background:#eaf8f2;color:var(--dukanen-deep);display:grid;place-items:center;font-size:28px;font-weight:900}.seller-title-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.seller-title-row h1{font-size:clamp(30px,4vw,44px);margin:0}.seller-profile-block p{margin:6px 0;color:var(--muted)}.seller-rating-line{font-size:14px;font-weight:800;color:#6a5200}.seller-rating-line span{color:var(--muted);font-weight:650}.seller-dashboard-tabs{display:flex;gap:24px;margin:24px 0 16px;border-bottom:1px solid var(--line)}.seller-dashboard-tabs span,.seller-dashboard-tabs a{padding:12px 0;font-weight:800;color:var(--muted)}.seller-dashboard-tabs .active{color:var(--dukanen-green);border-bottom:3px solid var(--dukanen-green)}.seller-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.seller-stat-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:7px}.seller-stat-card span{color:var(--muted);font-size:13px;font-weight:750}.seller-stat-card strong{font-size:32px;line-height:1;color:var(--dukanen-charcoal)}.seller-stat-card small{color:#7a857f}.seller-stat-card.unavailable{background:#f6f8f6}.seller-dashboard-note{margin-top:14px;padding:13px 16px;border-radius:14px;background:#edf9f4;border:1px solid #ccebdc;color:#476057;font-size:13px}.seller-listings-section{padding-top:38px}.seller-listings-table{display:flex;flex-direction:column;gap:12px}.seller-listing-row{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:16px;align-items:center;padding:16px;border:1px solid var(--line);border-radius:18px;background:#fff}.seller-listing-thumb{width:64px;height:64px;border-radius:16px;background:#edf5f0;color:var(--dukanen-deep);display:grid;place-items:center;font-size:24px;font-weight:900}.seller-listing-title-line{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.seller-listing-title-line a{font-weight:850}.status-pill{font-size:11px;font-weight:850;padding:4px 8px;border-radius:999px;text-transform:capitalize}.status-active{background:#e9f8f1;color:#087443}.status-paused{background:#fff3d8;color:#7b5b00}.status-sold{background:#eceff0;color:#5e6662}.status-draft{background:#eef1f4;color:#59636c}.seller-listing-meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;color:var(--muted);font-size:13px}.seller-listing-meta strong{color:var(--dukanen-green)}.seller-listing-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.seller-listing-actions button,.seller-listing-actions a{min-height:38px;border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 11px;font-size:12px;font-weight:800;color:#39453e;cursor:pointer}.seller-listing-actions button:hover,.seller-listing-actions a:hover{border-color:#9fd7be;color:var(--dukanen-deep)}.seller-listing-actions .danger-action{color:#a33;border-color:#efd0d0}.seller-empty-state{padding:34px;border:1px dashed #bed2c6;background:#fbfdfb;border-radius:20px;text-align:center}.seller-empty-state h3{margin-top:0}.seller-empty-state p{color:var(--muted);margin-bottom:22px}
@media(max-width:900px){.seller-stats-grid{grid-template-columns:1fr 1fr}.seller-dashboard-header{align-items:flex-start}.seller-listing-row{grid-template-columns:56px 1fr}.seller-listing-thumb{width:56px;height:56px}.seller-listing-actions{grid-column:1/-1;justify-content:flex-start;padding-top:4px}}
@media(max-width:560px){.seller-dashboard-page{padding-top:18px}.seller-dashboard-header{padding:18px;flex-direction:column}.seller-profile-block{align-items:flex-start}.seller-dashboard-avatar{width:54px;height:54px;border-radius:16px}.seller-dashboard-header>.primary{width:100%;text-align:center}.seller-stats-grid{grid-template-columns:1fr 1fr;gap:10px}.seller-stat-card{padding:15px}.seller-stat-card strong{font-size:27px}.seller-listing-row{padding:13px;grid-template-columns:48px 1fr;gap:12px}.seller-listing-thumb{width:48px;height:48px;border-radius:13px}.seller-listing-actions form,.seller-listing-actions a{flex:1}.seller-listing-actions button,.seller-listing-actions a{width:100%;text-align:center}}
`;

export default async function SellerDashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <section className="container seller-dashboard-page">
        <style>{dashboardCss}</style>
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
        <style>{dashboardCss}</style>
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
      <style>{dashboardCss}</style>
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
