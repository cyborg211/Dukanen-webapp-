'use client';

export default function GlobalError({reset}:{reset:()=>void}){
  return <div className="container market-header" role="alert">
    <div className="eyebrow">Dukanen Marketplace</div>
    <h1 style={{fontSize:'48px'}}>Something went wrong</h1>
    <p>We couldn’t load this part of Dukanen. Your account and marketplace data have not been deleted.</p>
    <div className="actions"><button className="primary" type="button" onClick={()=>reset()}>Try again</button><a className="secondary" href="/">Go Home</a></div>
  </div>;
}
