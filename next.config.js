/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuración para Vercel
  output: 'standalone',
}

module.exports = nextConfig