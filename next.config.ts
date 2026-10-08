import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — no one can embed your site in an iframe
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from sniffing MIME types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Enable XSS filter in older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Don't send referrer info to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Prevent access to device camera/mic/location from the site
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Force HTTPS for 1 year (enable on production only)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Content Security Policy — blocks XSS, data injection, rogue scripts
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Bunny player + inline scripts Next.js needs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://iframe.mediadelivery.net https://cdn.jsdelivr.net",
      // Styles: self + inline
      "style-src 'self' 'unsafe-inline'",
      // Images: self + Unsplash + Pexels + Pixabay + YouTube + Cloudinary + Bunny CDN + data URIs
      "img-src 'self' data: blob: https://images.pexels.com https://cdn.pixabay.com https://images.unsplash.com https://unsplash.com https://img.youtube.com https://res.cloudinary.com https://*.b-cdn.net https://i.ytimg.com https://vz-*.b-cdn.net",
      // Fonts: self
      "font-src 'self' data:",
      // Iframes: only Bunny Stream embed + YouTube nocookie
      "frame-src https://iframe.mediadelivery.net https://www.youtube-nocookie.com https://www.youtube.com",
      // API/fetch calls: self + Supabase
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.bunny.net`,
      // Media files (video/audio)
      "media-src 'self' blob: https://*.b-cdn.net https://vz-*.b-cdn.net",
      // Workers
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.b-cdn.net" },
      { protocol: "https", hostname: "vz-*.b-cdn.net" },
    ],
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
