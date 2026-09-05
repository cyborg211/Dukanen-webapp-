import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

export async function GET(){
  const env={
    supabaseUrl:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseKey:Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };

  try{
    const supabase=createClient();
    const [{data:categories,error:categoryError},{data:products,error:productError}]=await Promise.all([
      supabase.from('categories').select('id').eq('active',true).limit(1),
      supabase.from('products').select('id').eq('status','active').limit(1),
    ]);

    const ok=!categoryError&&!productError;
    return NextResponse.json({
      ok,
      env,
      checks:{
        categories:{ok:!categoryError,rows:categories?.length??0,error:categoryError?{code:categoryError.code,message:categoryError.message}:null},
        products:{ok:!productError,rows:products?.length??0,error:productError?{code:productError.code,message:productError.message}:null},
      },
    },{status:ok?200:503});
  }catch(error){
    return NextResponse.json({ok:false,env,error:error instanceof Error?error.message:'Unknown health-check error'},{status:503});
  }
}
