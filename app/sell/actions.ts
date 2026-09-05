'use server';

import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')+'-'+Date.now().toString().slice(-6)}

export async function createListing(formData:FormData){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth?next=/sell');

  const title=String(formData.get('title')||'').trim();
  const description=String(formData.get('description')||'').trim();
  const categoryName=String(formData.get('category')||'').trim();
  const price=Number(formData.get('price')||0);
  const city=String(formData.get('location')||'Juba').trim();
  const condition=String(formData.get('condition')||'Used').trim();
  const negotiable=formData.get('negotiable')==='on';
  let imageUrls:string[]=[];

  try{
    const parsed=JSON.parse(String(formData.get('imageUrls')||'[]'));
    if(Array.isArray(parsed)) imageUrls=parsed.filter((v)=>typeof v==='string'&&/^https:\/\//.test(v)).slice(0,10);
  }catch{}

  if(!title||title.length>100||!Number.isFinite(price)||price<=0||!categoryName||!description||description.length>2000) redirect('/sell?error=missing');

  const allowedConditions=new Set(['New','Used','Refurbished']);
  if(!allowedConditions.has(condition)) redirect('/sell?error=condition');

  const {data:category}=await supabase.from('categories').select('id').eq('name',categoryName).eq('active',true).maybeSingle();
  if(!category?.id) redirect('/sell?error=category');

  let {data:seller}=await supabase.from('sellers').select('id').eq('user_id',user.id).maybeSingle();
  if(!seller){
    const displayName=user.user_metadata?.name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Dukanen Seller';
    const storeName=`${displayName} Store`;
    const created=await supabase.from('sellers').insert({
      user_id:user.id,
      store_name:storeName,
      slug:slugify(storeName),
      city,
      country:'South Sudan'
    }).select('id').single();
    seller=created.data;
  }
  if(!seller) redirect('/sell?error=seller');

  const slug=slugify(title);
  const {data:product,error}=await supabase.from('products').insert({
    seller_id:seller.id,
    category_id:category.id,
    title,
    slug,
    description,
    price,
    currency:'SSP',
    condition,
    city,
    country:'South Sudan',
    negotiable,
    status:'active'
  }).select('id,slug').single();

  if(error||!product) redirect('/sell?error=save');

  if(imageUrls.length){
    const rows=imageUrls.map((image_url,sort_order)=>({product_id:product.id,image_url,sort_order}));
    const {error:imageError}=await supabase.from('product_images').insert(rows);
    if(imageError){
      await supabase.from('products').delete().eq('id',product.id).eq('seller_id',seller.id);
      redirect('/sell?error=images');
    }
  }

  redirect(`/product/${product.slug}`);
}
