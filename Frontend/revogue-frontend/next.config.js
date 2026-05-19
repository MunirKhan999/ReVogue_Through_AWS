const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dependencies live in Frontend/node_modules; nested app is revogue-frontend/.
  // Pin Turbopack to Frontend so it resolves `next` correctly and does not pick
  // a stray lockfile under the user profile (e.g. C:\Users\DELL\package-lock.json).
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig

