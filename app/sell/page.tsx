import {createClient} from '@/lib/supabase/server';
import {createListing} from './actions';

export const dynamic='force-dynamic';

export default async function SellPage({searchParams}:{searchParams?:{error?:string}}){
  const supabase=createClient();
  const {data:categories}=await supabase.from('categories').select('name').order('name');
  return <div className="container"><div className="form-card"><div className="eyebrow">Start selling</div><h1 style={{fontSize:'42px'}}>Create a listing</h1><p>Publish your item directly to Dukanen. You’ll be asked to sign in first if needed.</p>{searchParams?.error&&<p style={{color:'#9b1c1c'}}>We couldn’t publish that listing. Check the required fields and try again.</p>}<form action={createListing}><label>Product title</label><input name="title" required placeholder="e.g. Samsung Galaxy S23"/><label>Description</label><textarea name="description" rows={5} placeholder="Describe the item, service or opportunity"/><label>Category</label><select name="category" required><option value="">Select category</option>{(categories||[]).map((c:any)=><option key={c.name}>{c.name}</option>)}</select><label>Price (USD)</label><input name="price" required type="number" min="0" step="0.01" placeholder="250"/><label>Location</label><select name="location"><option>Juba</option><option>Malakal</option><option>Wau</option><option>Bor</option><option>Yei</option><option>Aweil</option><option>Rumbek</option></select><label>Condition</label><select name="condition"><option>New</option><option>Used</option><option>Available</option></select><div className="actions"><button type="submit" className="primary" style={{border:0,fontSize:'16px'}}>Publish listing</button></div></form></div></div>
}
