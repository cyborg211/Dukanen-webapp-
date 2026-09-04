'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';

export async function toggleFavorite(formData:FormData){
  const productId=String(formData.get('productId')||'');
  const slug=String(formData.get('slug')||'');
  if(!productId) return;
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect(`/auth?next=/product/${encodeURIComponent(slug)}`);

  const {data:existing}=await supabase.from('favorites').select('product_id').eq('user_id',user.id).eq('product_id',productId).maybeSingle();
  if(existing) await supabase.from('favorites').delete().eq('user_id',user.id).eq('product_id',productId);
  else await supabase.from('favorites').insert({user_id:user.id,product_id:productId});
  revalidatePath(`/product/${slug}`);
  revalidatePath('/favorites');
}

export async function startConversation(formData:FormData){
  const productId=String(formData.get('productId')||'');
  const sellerId=String(formData.get('sellerId')||'');
  const slug=String(formData.get('slug')||'');
  const intent=String(formData.get('intent')||'chat');
  if(!productId||!sellerId) redirect(`/product/${slug}`);

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect(`/auth?next=/product/${encodeURIComponent(slug)}`);

  const {data:seller}=await supabase.from('sellers').select('user_id').eq('id',sellerId).maybeSingle();
  if(seller?.user_id===user.id) redirect(`/product/${slug}`);

  let {data:conversation}=await supabase
    .from('conversations')
    .select('id')
    .eq('buyer_id',user.id)
    .eq('seller_id',sellerId)
    .eq('product_id',productId)
    .maybeSingle();

  if(!conversation){
    const created=await supabase.from('conversations').insert({buyer_id:user.id,seller_id:sellerId,product_id:productId}).select('id').single();
    conversation=created.data;
  }
  if(!conversation) redirect(`/product/${slug}`);
  redirect(`/messages?conversation=${conversation.id}&intent=${encodeURIComponent(intent)}`);
}
