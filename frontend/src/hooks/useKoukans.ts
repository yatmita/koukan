"use client";

import { useQuery } from "@tanstack/react-query";
import { getChainConfig, getCurrentChainName } from "@/lib/chain";
import { getPublicClient } from "@/lib/viem-client";
import { getKoukan, listMyKoukanIds } from "@/lib/koukan";
import { isListedStatus } from "@/lib/koukan-domain";
import { buildKoukanView, type KoukanView } from "@/lib/koukan-view";
import { listContacts } from "@/lib/wallet/store";

export type KoukansByDirection = {
    proposed: KoukanView[];
    received: KoukanView[];
};

export function useKoukans(address: `0x${string}`) {
    const chain = getChainConfig(getCurrentChainName());

    return useQuery({
        queryKey: ["koukans", chain.name, address],
        queryFn: async (): Promise<KoukansByDirection> => {
            const client = getPublicClient(chain);
            const factory = chain.koukanAddress as `0x${string}`;

            const [ids, contacts] = await Promise.all([
                listMyKoukanIds(client, factory, address, chain.deployBlock),
                listContacts(),
            ]);

            const uniqueIds = Array.from(
                new Set([...ids.proposed, ...ids.received].map((id) => id.toString())),
            ).map((s) => BigInt(s));

            const views = await Promise.all(
                uniqueIds.map(async (id) => {
                    const k = await getKoukan(client, factory, id, chain.deployBlock);
                    return buildKoukanView(k, address, chain, contacts);
                }),
            );

            const listed = views.filter((v) => isListedStatus(v.status));
            return {
                proposed: listed.filter((v) => v.direction === "proposed"),
                received: listed.filter((v) => v.direction === "received"),
            };
        },
    });
}
