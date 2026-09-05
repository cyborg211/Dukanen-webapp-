import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!hasSupabaseConfig) {
    return (
      <section className="container market-header">
        <p className="eyebrow">Administration</p>
        <h1>Dukanen admin</h1>
        <div className="seller-box">
          <h3>Backend setup required</h3>
          <p>Configure Supabase before the admin dashboard can load marketplace data.</p>
        </div>
      </section>
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/marketplace')

  const [users, sellers, products, orders, reports] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('sellers').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <section className="container market-header">
      <p className="eyebrow">Marketplace control center</p>
      <h1>Dukanen admin</h1>
      <p>Monitor marketplace health, listings, sellers, orders and moderation workload.</p>
      <div className="category-grid">
        <div className="category">Users<br/><strong>{users.count ?? 0}</strong></div>
        <div className="category">Sellers<br/><strong>{sellers.count ?? 0}</strong></div>
        <div className="category">Active listings<br/><strong>{products.count ?? 0}</strong></div>
        <div className="category">Orders<br/><strong>{orders.count ?? 0}</strong></div>
        <div className="category">Pending reports<br/><strong>{reports.count ?? 0}</strong></div>
      </div>
    </section>
  )
}
