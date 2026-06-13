"use client";

import { useQuery } from "@tanstack/react-query";
import { getChainConfig, getCurrentChainName } from "@/lib/chain";
import { getPublicClient } from "@/lib/viem-client";
import { getKoukan } from "@/lib/koukan";
import { buildKoukanView, type KoukanView } from "@/lib/koukan-view";
import { listContacts } from "@/lib/wallet/store";

export function useKoukan(tokenId: bigint, address: `0x${string}`) {
    const chain = getChainConfig(getCurrentChainName());

    return useQuery({
        queryKey: ["koukan", chain.name, tokenId.toString(), address],
        queryFn: async (): Promise<KoukanView> => {
            const client = getPublicClient(chain);
            const factory = chain.koukanAddress as `0x${string}`;
            const [k, contacts] = await Promise.all([
                getKoukan(client, factory, tokenId, chain.deployBlock),
                listContacts(),
            ]);
            return buildKoukanView(k, address, chain, contacts);
        },
    });
}
