import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포를 위한 빌드 설정
  eslint: {
    // 빌드 시 ESLint 에러 무시 (프로덕션 배포용)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 에러 무시 (프로덕션 배포용)
    ignoreBuildErrors: true,
  },
  // React Strict Mode 활성화
  reactStrictMode: true,
};

export default nextConfig;
