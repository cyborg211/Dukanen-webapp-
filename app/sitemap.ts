import type {MetadataRoute} from 'next';

export default function sitemap():MetadataRoute.Sitemap{
  const base='https://dukanen.online';
  return [
    {url:base,changeFrequency:'daily',priority:1},
    {url:`${base}/marketplace`,changeFrequency:'hourly',priority:.9},
    {url:`${base}/sell`,changeFrequency:'monthly',priority:.7},
  ];
}
