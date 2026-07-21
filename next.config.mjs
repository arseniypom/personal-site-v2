/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/search': ['./data/**'],
  },
};

export default nextConfig;
