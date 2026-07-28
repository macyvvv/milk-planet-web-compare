import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Enables next/navigation's forbidden()/unauthorized() for role-based access control
  // (authorization_matrix.md). Both throw a typed error rendered by app/forbidden.tsx /
  // app/unauthorized.tsx instead of ad-hoc redirects.
  experimental: {
    authInterrupts: true,
  },
  // A stray lockfile at the user's home directory otherwise makes Next.js misdetect the
  // workspace root; pin it explicitly to this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
