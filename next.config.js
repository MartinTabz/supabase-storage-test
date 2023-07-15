/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,
   images: {
     domains: ['bgvvjwyekwnpfiigebvc.supabase.co'],
   },
   experimental: {
     serverActions: true,
   },
 };
 
 module.exports = nextConfig;