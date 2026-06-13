export type ChainName = "local" | "kairos" | "kaia";

export type ChainConfig = {
    name: ChainName;
    id: number;
    label: string;
    rpcUrl: string;
    explorerUrl?: string;
    invoiceAddress: string;
    koukanAddress: string;
    jpycAddress: string;
    wkaiaAddress: string; // Wrapped native (LOCAL は Mock WKAIA、Kaia は正規 WKAIA)
    // getLogs の起点ブロック。live network で fromBlock:0 にすると全履歴スキャンになり
    // public node が 502 を返す（Kairos は約 2.18 億ブロック）。コントラクト deploy
    // ブロックを起点にして範囲を絞る。local(anvil) は履歴が浅いので 0。
    deployBlock: bigint;
};

// Next.js の DefinePlugin が置換できるのは process.env.X (literal access) のみ。
// process.env[key] のような dynamic access は dev / build どちらでも未置換になる。
// そのため static literal でアクセスし、ローカル const に束ねる。

const LOCAL: ChainConfig = {
    name: "local",
    id: 31337,
    label: "ローカル",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_LOCAL || "http://localhost:8545",
    invoiceAddress: process.env.NEXT_PUBLIC_INVOICE_ADDR_LOCAL ?? "",
    koukanAddress: process.env.NEXT_PUBLIC_KOUKAN_ADDR_LOCAL ?? "",
    jpycAddress: process.env.NEXT_PUBLIC_JPYC_ADDR_LOCAL ?? "",
    wkaiaAddress: process.env.NEXT_PUBLIC_WKAIA_ADDR_LOCAL ?? "",
    deployBlock: 0n,
};

const KAIROS: ChainConfig = {
    name: "kairos",
    id: 1001,
    label: "Kaia Kairos",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_KAIROS || "https://public-en-kairos.node.kaia.io",
    explorerUrl: "https://kairos.kaiascan.io",
    invoiceAddress: process.env.NEXT_PUBLIC_INVOICE_ADDR_KAIROS ?? "",
    koukanAddress: process.env.NEXT_PUBLIC_KOUKAN_ADDR_KAIROS ?? "",
    jpycAddress: process.env.NEXT_PUBLIC_JPYC_ADDR_KAIROS ?? "",
    wkaiaAddress: process.env.NEXT_PUBLIC_WKAIA_ADDR_KAIROS ?? "",
    // Invoice=218217672 / Koukan=218217677 で deploy。早い方を起点にする。
    deployBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK_KAIROS ?? "218217672"),
};

const KAIA: ChainConfig = {
    name: "kaia",
    id: 8217,
    label: "Kaia",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_KAIA || "https://public-en.node.kaia.io",
    explorerUrl: "https://kaiascan.io",
    invoiceAddress: process.env.NEXT_PUBLIC_INVOICE_ADDR_KAIA ?? "",
    koukanAddress: process.env.NEXT_PUBLIC_KOUKAN_ADDR_KAIA ?? "",
    jpycAddress: process.env.NEXT_PUBLIC_JPYC_ADDR_KAIA ?? "",
    wkaiaAddress: process.env.NEXT_PUBLIC_WKAIA_ADDR_KAIA ?? "",
    deployBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK_KAIA ?? "0"),
};

const CHAINS = [LOCAL, KAIROS, KAIA] as const;

export function getChainConfig(name: ChainName): ChainConfig {
    const config = CHAINS.find((c) => c.name === name);
    if (!config) throw new Error(`Unknown chain: ${name}`);
    return config;
}

export function listChains(): ChainConfig[] {
    return [...CHAINS];
}

export function getCurrentChainName(): ChainName {
    const chain = process.env.NEXT_PUBLIC_CHAIN;
    if (chain === "kairos" || chain === "kaia") return chain;
    return "local";
}
