/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare 배포용: 서버 없이 out 폴더에 완성된 파일로 내보냅니다
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
