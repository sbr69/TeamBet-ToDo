import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@base-org/account': false,
      '@coinbase/wallet-sdk': false,
      '@gemini-wallet/core': false,
      '@metamask/sdk': false,
      'porto/internal': false,
      'porto': false,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
      '@walletconnect/ethereum-provider': false,
    }
    return config;
  },
};

export default nextConfig;
