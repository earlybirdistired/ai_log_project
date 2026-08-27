/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone'는 Docker 등 자체 호스팅 전용 설정이다. Vercel은
  // 서버리스 함수 패키징을 자체 처리하므로 이 옵션과 함께 쓰면 빌드 후처리에서
  // ENOENT(.next/next-server.js.nft.json) 에러가 발생한다. Vercel 배포 시 제거.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
