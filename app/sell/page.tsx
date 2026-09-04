import {createClient} from '@/lib/supabase/server';
import {createListing} from './actions';
import ImageUploader from './image-uploader';

export const dynamic='force-dynamic';

const locations=['Juba','Malakal','Wau','Bor','Yei','Aweil','Rumbek'];
const conditions=['New','Used','Refurbished'];

export default async function SellPage({searchParams}:{searchParams?:{error?:string}}){
  const supabase=createClient();
  const {data:categories}=await supabase.from('categories').select('name').order('name');
  const error=searchParams?.error;

  return <div className="sell-page">
    <div className="container sell-shell">
      <div className="sell-heading">
        <div className="eyebrow">Sell on Dukanen</div>
        <h1>Create your listing</h1>
        <p>Reach buyers across South Sudan with a clear, trustworthy listing.</p>
      </div>

      {error&&<div className="sell-alert" role="alert">We couldn’t publish your listing. Check the required fields and try again.</div>}

      <form action={createListing} className="sell-form">
        <section className="sell-card">
          <div className="sell-step-head"><span className="sell-step">1</span><div><h2>Photos</h2><p>Add clear photos. The first image becomes the cover.</p></div></div>
          <ImageUploader/>
        </section>

        <section className="sell-card">
          <div className="sell-step-head"><span className="sell-step">2</span><div><h2>Listing details</h2><p>Tell buyers exactly what you’re offering.</p></div></div>
          <div className="form-grid">
            <div className="field field-full"><label htmlFor="title">Product title *</label><input id="title" name="title" required maxLength={100} placeholder="e.g. Samsung Galaxy A54, lightly used"/></div>
            <div className="field"><label htmlFor="price">Price (SSP) *</label><input id="price" name="price" required type="number" min="1" step="1" inputMode="numeric" placeholder="420000"/></div>
            <div className="field toggle-field"><label htmlFor="negotiable">Price flexibility</label><label className="check-row"><input id="negotiable" name="negotiable" type="checkbox"/><span>Negotiable</span></label></div>
            <div className="field"><label htmlFor="category">Category *</label><select id="category" name="category" required><option value="">Select category</option>{(categories||[]).map((c:any)=><option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
            <div className="field"><label htmlFor="condition">Condition *</label><select id="condition" name="condition" required>{conditions.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="field"><label htmlFor="location">Location *</label><select id="location" name="location" required defaultValue="Juba">{locations.map(l=><option key={l}>{l}</option>)}</select></div>
            <div className="field field-full"><label htmlFor="description">Description *</label><textarea id="description" name="description" rows={6} required maxLength={2000} placeholder="Describe the condition, age, key features, what is included, and any defects buyers should know about."/></div>
          </div>
        </section>

        <section className="sell-card preview-card">
          <div className="sell-step-head"><span className="sell-step">3</span><div><h2>Review & publish</h2><p>Make sure the details are accurate before your listing goes live.</p></div></div>
          <div className="publish-checks"><span>✓ Clear photos</span><span>✓ Price in SSP</span><span>✓ Correct category</span><span>✓ Accurate location</span></div>
          <div className="sell-actions"><a href="/marketplace" className="secondary">Cancel</a><button type="submit" className="primary publish-btn">Publish Listing</button></div>
          <p className="field-note">By publishing, you confirm the listing is accurate and complies with Dukanen marketplace rules.</p>
        </section>
      </form>
    </div>
  </div>
}
