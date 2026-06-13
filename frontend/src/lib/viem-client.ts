import { createPublicClient, defineChain, http, type PublicClient } from "viem";
import type { ChainConfig } from "./chain";

// chain.id ごとに publicClient を 1 つだけ生成して使い回す。
// 各 page / hook で createPublicClient + defineChain を重複生成しないための単一窓口。
// batch.multicall を有効にし、同一 tick の readContract を 1 RPC にまとめる。
const clients = new Map<number, PublicClient>();

export function getPublicClient(chain: ChainConfig): PublicClient {
    const cached = clients.get(chain.id);
    if (cached) return cached;

    const viemChain = defineChain({
        id: chain.id,
        name: chain.label,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: [chain.rpcUrl] } },
    });

    const client = createPublicClient({
        chain: viemChain,
        transport: http(chain.rpcUrl),
        batch: { multicall: true },
    });

    clients.set(chain.id, client);
    return client;
}
