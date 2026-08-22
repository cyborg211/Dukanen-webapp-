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
  const location=String(formData.get('location')||'Juba');
  const condition=String(formData.get('condition')||'Used');
  if(!title||!price) redirect('/sell?error=missing');
  let {data:seller}=await supabase.from('sellers').select('id').eq('user_id',user.id).maybeSingle();
  if(!seller){
    const storeName=(user.user_metadata?.full_name||user.email?.split('@')[0]||'Dukanen Seller')+' Store';
    const created=await supabase.from('sellers').insert({user_id:user.id,store_name:storeName,slug:slugify(storeName),location}).select('id').single();
    seller=created.data;
  }
  if(!seller) redirect('/sell?error=seller');
  const {data:category}=await supabase.from('categories').select('id').eq('name',categoryName).maybeSingle();
  const slug=slugify(title);
  const {error}=await supabase.from('products').insert({seller_id:seller.id,category_id:category?.id||null,title,slug,description,price,currency:'USD',condition,location,status:'active'});
  if(error) redirect('/sell?error=save');
  redirect(`/product/${slug}`);
}
