import {createClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

export default async function HealthPage(){
  const env={
    supabaseUrl:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseKey:Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };

  let result:any={env};
  try{
    const supabase=createClient();
    const [{data:categories,error:categoryError},{data:products,error:productError}]=await Promise.all([
      supabase.from('categories').select('id').eq('active',true).limit(1),
      supabase.from('products').select('id').eq('status','active').limit(1),
    ]);
    result={
      env,
      categories:{ok:!categoryError,rows:categories?.length??0,code:categoryError?.code??null,message:categoryError?.message??null},
      products:{ok:!productError,rows:products?.length??0,code:productError?.code??null,message:productError?.message??null},
    };
  }catch(error){
    result={env,fatal:error instanceof Error?error.message:'Unknown health-check error'};
  }

  return <div className="container market-header"><div className="eyebrow">Dukanen Preview Health</div><h1>Integration health</h1><pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{JSON.stringify(result,null,2)}</pre></div>;
}
