import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

const icons=['▦','▣','👗','🚗','⌂','🛏','🏢','💼','🧰','🛋','🌾','✦','⚽','＋'];

export default async function CategoriesPage(){
  const supabase=createClient();
  const {data,error}=await supabase.from('categories').select('id,name').eq('active',true).order('name');
  const categories=data||[];

  return <div className="mobile-categories-page">
    <div className="container">
      <div className="mobile-page-heading">
        <Link href="/" className="mobile-back" aria-label="Back home">←</Link>
        <div><span className="section-kicker">Browse Dukanen</span><h1>Categories</h1></div>
      </div>

      <form className="category-search" action="/marketplace">
        <span aria-hidden="true">⌕</span>
        <input name="q" aria-label="Search categories and listings" placeholder="Search categories or products..."/>
      </form>

      {error?<div className="account-empty"><p>Categories are temporarily unavailable.</p></div>:categories.length?<div className="mobile-category-grid">
        {categories.map((category:any,index:number)=><Link key={category.id} href={`/marketplace?category=${encodeURIComponent(category.name)}`} className="mobile-category-tile">
          <span className="mobile-category-icon" aria-hidden="true">{icons[index]||'＋'}</span>
          <strong>{category.name}</strong>
        </Link>)}
      </div>:<div className="account-empty"><p>No active categories are available yet.</p></div>}

      <section className="category-discovery-card">
        <span className="section-kicker">Explore everything</span>
        <h2>Not sure where to start?</h2>
        <p>Browse every active listing across South Sudan and filter from there.</p>
        <Link href="/marketplace" className="primary">Open marketplace</Link>
      </section>
    </div>
  </div>;
}
