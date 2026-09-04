'use client';

import {useRef,useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type UploadedImage={url:string;path:string;name:string};

const ACCEPTED=['image/jpeg','image/png','image/webp'];
const MAX_IMAGES=10;
const MAX_BYTES=5*1024*1024;

export default function ImageUploader(){
  const inputRef=useRef<HTMLInputElement>(null);
  const [images,setImages]=useState<UploadedImage[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  async function handleFiles(files:FileList|null){
    if(!files?.length) return;
    setError('');
    const remaining=MAX_IMAGES-images.length;
    const chosen=Array.from(files).slice(0,remaining);
    if(Array.from(files).length>remaining){setError(`You can upload up to ${MAX_IMAGES} photos.`)}
    const invalid=chosen.find(f=>!ACCEPTED.includes(f.type)||f.size>MAX_BYTES);
    if(invalid){setError('Use JPG, PNG or WEBP images up to 5 MB each.');return;}

    setBusy(true);
    try{
      const supabase=createClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){setError('Please sign in before uploading photos.');return;}
      const uploaded:UploadedImage[]=[];
      for(let i=0;i<chosen.length;i++){
        const file=chosen[i];
        const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
        const path=`${user.id}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${i}.${ext}`;
        const {error:uploadError}=await supabase.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});
        if(uploadError) throw uploadError;
        const {data}=supabase.storage.from('product-images').getPublicUrl(path);
        uploaded.push({url:data.publicUrl,path,name:file.name});
      }
      setImages(prev=>[...prev,...uploaded].slice(0,MAX_IMAGES));
    }catch(e:any){
      setError(e?.message||'Photo upload failed. Please try again.');
    }finally{
      setBusy(false);
      if(inputRef.current) inputRef.current.value='';
    }
  }

  async function removeImage(index:number){
    const image=images[index];
    setImages(prev=>prev.filter((_,i)=>i!==index));
    try{await createClient().storage.from('product-images').remove([image.path]);}catch{}
  }

  function makeCover(index:number){
    if(index===0) return;
    setImages(prev=>{const next=[...prev];const [picked]=next.splice(index,1);next.unshift(picked);return next;});
  }

  return <div className="product-image-uploader">
    <input type="hidden" name="imageUrls" value={JSON.stringify(images.map(i=>i.url))}/>
    <label className="photo-drop" htmlFor="photos">
      <span className="photo-icon">▧</span>
      <strong>{busy?'Uploading photos…':'Add photos'}</strong>
      <span>Up to 10 images · JPG, PNG or WEBP · max 5 MB each</span>
    </label>
    <input ref={inputRef} id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="visually-hidden" disabled={busy||images.length>=MAX_IMAGES} onChange={e=>handleFiles(e.target.files)}/>
    {error&&<p className="upload-error" role="alert">{error}</p>}
    {images.length>0?<div className="uploaded-photo-grid">
      {images.map((image,index)=><div className="uploaded-photo" key={image.path}>
        <img src={image.url} alt={`Listing photo ${index+1}`}/>
        {index===0?<span className="cover-badge">Cover</span>:<button type="button" className="make-cover" onClick={()=>makeCover(index)}>Make cover</button>}
        <button type="button" className="remove-photo" aria-label={`Remove photo ${index+1}`} onClick={()=>removeImage(index)}>×</button>
      </div>)}
      {images.length<MAX_IMAGES&&<button type="button" className="add-photo-tile" onClick={()=>inputRef.current?.click()}>＋<span>Add photo</span></button>}
    </div>:<div className="photo-slots" aria-hidden="true"><span>Cover</span><span>+</span><span>+</span><span>+</span></div>}
    <p className="field-note">The first image is used as the listing cover. Photos upload directly to Dukanen storage.</p>
  </div>;
}
