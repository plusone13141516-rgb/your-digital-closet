import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 允许在开发环境通过“预览/代理域名”或局域网 IP 访问 dev 资源（HMR）。
   * 该配置仅影响开发环境，不影响生产构建。
   */
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.64.91"],
};

export default nextConfig;
