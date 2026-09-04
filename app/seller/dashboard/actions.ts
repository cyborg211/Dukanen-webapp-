'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireOwnedProduct(productId:string){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) throw new Error('Unauthorized');
  const {data:seller}=await supabase.from('sellers').select('id').eq('user_id',user.id).maybeSingle();
  if(!seller) throw new Error('Seller not found');
  return {supabase,sellerId:seller.id,productId};
}

export async function setListingStatus(formData:FormData){
  const productId=String(formData.get('productId')||'');
  const status=String(formData.get('status')||'');
  if(!productId || !['active','paused','sold'].includes(status)) return;
  const {supabase,sellerId}=await requireOwnedProduct(productId);
  await supabase.from('products').update({status}).eq('id',productId).eq('seller_id',sellerId);
  revalidatePath('/seller/dashboard');
}

export async function deleteListing(formData:FormData){
  const productId=String(formData.get('productId')||'');
  if(!productId) return;
  const {supabase,sellerId}=await requireOwnedProduct(productId);
  await supabase.from('products').delete().eq('id',productId).eq('seller_id',sellerId);
  revalidatePath('/seller/dashboard');
}
