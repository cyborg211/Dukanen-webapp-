import {createClient} from '@/lib/supabase/server';
import {createListing} from './actions';
import ImageUploader from './image-uploader';

export const dynamic='force-dynamic';
const locations=['Juba','Malakal','Wau','Bor','Yei','Aweil','Rumbek'];
const conditions=['New','Used','Refurbished'];

export default async function SellPage({searchParams}:{searchParams?:{error?:string}}){
  const supabase=createClient();
  const {data:categories}=await supabase.from('categories').select('name').eq('active',true).order('name');
  return <div className="sell-page mobile-sell-page"><div className="container sell-shell">
    <div className="sell-mobile-top"><a href="/marketplace" aria-label="Close">×</a><strong>List an Item</strong><span>Save Draft</span></div>
    <div className="sell-progress" aria-label="Listing progress"><div className="active"><b>1</b><span>Details</span></div><i/><div><b>2</b><span>Pricing</span></div><i/><div><b>3</b><span>Review</span></div></div>
    {searchParams?.error&&<div className="sell-alert" role="alert">We couldn’t publish your listing. Check the required fields and try again.</div>}
    <form action={createListing} className="sell-form">
      <section className="sell-card sell-card-mobile"><h2>Photos <small>0 / 10 images</small></h2><ImageUploader/><p className="field-note">Clear, high-quality photos help buyers understand the item quickly.</p></section>
      <section className="sell-card sell-card-mobile"><div className="form-grid">
        <div className="field field-full"><label htmlFor="title">Product Title *</label><input id="title" name="title" required maxLength={100} placeholder="What are you selling?"/></div>
        <div className="field field-full"><label htmlFor="category">Category *</label><select id="category" name="category" required><option value="">Select Category</option>{(categories||[]).map((c:any)=><option key={c.name}>{c.name}</option>)}</select></div>
        <div className="field field-full"><label>Condition *</label><div className="condition-pills">{conditions.map(c=><label key={c}><input type="radio" name="condition" value={c} defaultChecked={c==='Used'}/><span>{c}</span></label>)}</div></div>
        <div className="field"><label htmlFor="price">Price</label><input id="price" name="price" required type="number" min="1" step="1" inputMode="numeric" placeholder="0"/></div>
        <div className="field currency-box"><label>Currency</label><div>SSP</div></div>
        <div className="field field-full"><label htmlFor="location">Location *</label><select id="location" name="location" defaultValue="Juba">{locations.map(l=><option key={l}>{l}, South Sudan</option>)}</select></div>
        <div className="field field-full"><label htmlFor="description">Description *</label><textarea id="description" name="description" rows={6} required maxLength={2000} placeholder="Describe condition, key features, what is included, and any defects."/></div>
        <div className="field field-full toggle-row"><div><strong>Allow Offers</strong><small>Let buyers suggest a price</small></div><input id="negotiable" name="negotiable" type="checkbox"/></div>
      </div></section>
      <section className="sell-card sell-card-mobile publish-mobile-card"><button type="submit" className="primary publish-btn">Publish Item 🚀</button><p className="field-note">By publishing, you confirm the listing is accurate and follows Dukanen marketplace rules.</p></section>
    </form>
  </div></div>;
}
