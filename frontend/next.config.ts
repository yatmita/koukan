import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const isDev = process.env.NODE_ENV !== "production";

// dev では Service Worker を完全に無効化（Turbopack と相性が悪く、また HMR を壊すため）。
const withSerwist = withSerwistInit({
    swSrc: "src/app/sw.ts",
    swDest: "public/sw.js",
    disable: isDev,
});

const nextConfig: NextConfig = {
    // production build: Cloudflare Workers Static Assets 用に静的エクスポート
    // dev: export を外して rewrites (anvil proxy) を使える状態にする
    ...(isDev ? {} : { output: "export" }),
    images: { unoptimized: true },
    trailingSlash: true,

    // dev だけ /rpc → anvil (Docker container 内 localhost:8545) を proxy。
    // ブラウザは same-origin (localhost:5173) で fetch できるので port forward 不要。
    async rewrites() {
        if (!isDev) return [];
        return [
            { source: "/rpc/", destination: "http://localhost:8545/" },
            { source: "/rpc", destination: "http://localhost:8545/" },
            // Kairos public node は preflight(OPTIONS)に CORS ヘッダを返さないため same-origin proxy する。
            { source: "/rpc-kairos/", destination: "https://public-en-kairos.node.kaia.io/" },
            { source: "/rpc-kairos", destination: "https://public-en-kairos.node.kaia.io/" },
        ];
    },
};

export default withSerwist(nextConfig);
