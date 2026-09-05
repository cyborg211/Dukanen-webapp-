import type {MetadataRoute} from 'next';

export default function robots():MetadataRoute.Robots{
  return {
    rules:{userAgent:'*',allow:'/',disallow:['/admin','/seller/dashboard','/messages','/profile','/favorites','/auth']},
    sitemap:'https://dukanen.online/sitemap.xml',
    host:'https://dukanen.online',
  };
}
