import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function SellerDashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <section className="container market-header">
        <p className="eyebrow">Seller workspace</p>
        <h1>Seller dashboard</h1>
        <div className="seller-box">
          <h3>Backend setup required</h3>
          <p>Add the Supabase environment variables and run <code>supabase/schema.sql</code> to activate seller accounts, listings, orders and analytics.</p>
        </div>
      </section>
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: seller } = await supabase
    .from('sellers')
    .select('id, store_name, verified, rating')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    return (
      <section className="container market-header">
        <p className="eyebrow">Become a seller</p>
        <h1>Start selling on Dukanen</h1>
        <div className="seller-box">
          <p>Your buyer account is active, but you have not created a seller storefront yet.</p>
          <Link className="primary" href="/sell">Create your first listing</Link>
        </div>
      </section>
    )
  }

  const [{ count: listings }, { count: orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', seller.id),
  ])

  return (
    <section className="container market-header">
      <p className="eyebrow">Seller workspace</p>
      <h1>{seller.store_name}</h1>
      <p>Manage listings, orders and your public storefront.</p>
      <div className="benefits">
        <div className="benefit"><b>Total listings</b><h2>{listings ?? 0}</h2></div>
        <div className="benefit"><b>Orders</b><h2>{orders ?? 0}</h2></div>
        <div className="benefit"><b>Rating</b><h2>{seller.rating ?? 0}/5</h2></div>
      </div>
      <div className="actions">
        <Link className="primary" href="/sell">Add listing</Link>
        <Link className="secondary" href="/marketplace">View marketplace</Link>
      </div>
    </section>
  )
}
