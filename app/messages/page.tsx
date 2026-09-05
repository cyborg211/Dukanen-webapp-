import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {sendMessage} from './actions';

export const dynamic='force-dynamic';

export default async function MessagesPage({searchParams}:{searchParams?:{conversation?:string;intent?:string}}){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth?next=/messages');

  const {data:conversationRows}=await supabase
    .from('conversations')
    .select('id,buyer_id,seller_id,product_id,last_message_at,created_at')
    .order('last_message_at',{ascending:false});

  const conversations=conversationRows||[];
  const sellerIds=Array.from(new Set(conversations.map((c:any)=>c.seller_id).filter(Boolean)));
  const buyerIds=Array.from(new Set(conversations.map((c:any)=>c.buyer_id).filter(Boolean)));
  const productIds=Array.from(new Set(conversations.map((c:any)=>c.product_id).filter(Boolean)));

  const [{data:sellers},{data:buyers},{data:products}]=await Promise.all([
    sellerIds.length?supabase.from('sellers').select('id,store_name,user_id').in('id',sellerIds):Promise.resolve({data:[]} as any),
    buyerIds.length?supabase.from('profiles').select('id,name').in('id',buyerIds):Promise.resolve({data:[]} as any),
    productIds.length?supabase.from('products').select('id,title,slug').in('id',productIds):Promise.resolve({data:[]} as any),
  ]);

  const sellerMap=new Map((sellers||[]).map((s:any)=>[s.id,s]));
  const buyerMap=new Map((buyers||[]).map((b:any)=>[b.id,b]));
  const productMap=new Map((products||[]).map((p:any)=>[p.id,p]));
  const requested=searchParams?.conversation;
  const selected=conversations.find((c:any)=>c.id===requested)||conversations[0];

  const {data:messageRows}=selected?await supabase
    .from('messages')
    .select('id,sender_id,body,created_at,read_at')
    .eq('conversation_id',selected.id)
    .order('created_at',{ascending:true}):{data:[] as any[]};
  const messages=messageRows||[];

  function titleFor(c:any){
    const seller=sellerMap.get(c.seller_id) as any;
    const buyer=buyerMap.get(c.buyer_id) as any;
    return c.buyer_id===user!.id?(seller?.store_name||'Dukanen Seller'):(buyer?.name||'Dukanen Buyer');
  }
  function productFor(c:any){return productMap.get(c.product_id) as any;}

  const selectedProduct=selected?productFor(selected):null;
  const intent=searchParams?.intent;
  const suggestion=intent==='offer'?'Hi, I would like to make an offer for this item.':intent==='call'?'Hi, when would be a good time to discuss this listing?':'';

  return <div className="container messages-page">
    <div className="market-header"><div className="eyebrow">Dukanen Messages</div><h1>Messages</h1><p>Keep buyer and seller conversations connected to the listing.</p></div>

    {!conversations.length?<div className="account-empty"><h2>No conversations yet</h2><p>Open a listing and tap Chat to contact a seller.</p><Link className="primary" href="/marketplace">Explore marketplace</Link></div>:<div className="messages-shell">
      <aside className="conversation-list" aria-label="Conversations">
        {conversations.map((c:any)=>{const product=productFor(c);return <Link key={c.id} href={`/messages?conversation=${c.id}`} className={`conversation-item ${selected?.id===c.id?'active':''}`}>
          <span className="conversation-avatar">{titleFor(c).charAt(0).toUpperCase()}</span>
          <span className="conversation-copy"><strong>{titleFor(c)}</strong><small>{product?.title||'Marketplace conversation'}</small></span>
        </Link>})}
      </aside>

      <section className="chat-panel">
        {selected&&<>
          <header className="chat-header"><div><strong>{titleFor(selected)}</strong>{selectedProduct&&<Link href={`/product/${selectedProduct.slug}`}>{selectedProduct.title}</Link>}</div></header>
          <div className="message-thread" aria-live="polite">
            {messages.length?messages.map((m:any)=><div key={m.id} className={`message-bubble ${m.sender_id===user.id?'mine':'theirs'}`}><p>{m.body}</p><small>{new Date(m.created_at).toLocaleString()}</small></div>):<div className="chat-empty">Start the conversation about this listing.</div>}
          </div>
          <form action={sendMessage} className="message-compose">
            <input type="hidden" name="conversationId" value={selected.id}/>
            <textarea name="body" aria-label="Message" required maxLength={4000} rows={2} defaultValue={suggestion} placeholder="Write a message…"/>
            <button type="submit" className="primary">Send</button>
          </form>
        </>}
      </section>
    </div>}
  </div>;
}
