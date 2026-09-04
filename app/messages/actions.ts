'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';

export async function sendMessage(formData:FormData){
  const conversationId=String(formData.get('conversationId')||'');
  const body=String(formData.get('body')||'').trim();
  if(!conversationId||!body) return;

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth?next=/messages');

  const {error}=await supabase.from('messages').insert({conversation_id:conversationId,sender_id:user.id,body:body.slice(0,4000)});
  if(!error){
    await supabase.from('conversations').update({last_message_at:new Date().toISOString()}).eq('id',conversationId);
  }
  revalidatePath('/messages');
}

export async function markConversationRead(conversationId:string){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return;
  await supabase.from('messages').update({read_at:new Date().toISOString()}).eq('conversation_id',conversationId).neq('sender_id',user.id).is('read_at',null);
}
