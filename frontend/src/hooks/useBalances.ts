"use client";

import { useQuery } from "@tanstack/react-query";
import { getChainConfig, getCurrentChainName } from "@/lib/chain";
import { getPublicClient } from "@/lib/viem-client";
import { erc20BalanceOf } from "@/lib/erc20";
import { formatJpyc } from "@/lib/jpyc";
import { formatNativeBalance } from "@/lib/balance";

export type Balances = {
    native: string; // KAIA (gas)
    jpyc: string; // 取引通貨
};

// home の残高表示を TanStack Query 化したもの。
// native (getBalance) と JPYC (balanceOf) を 1 query にまとめ、
// stale / 再取得 / 重複抑制は Query 側に委ねる。
export function useBalances(address: `0x${string}`) {
    const chain = getChainConfig(getCurrentChainName());

    return useQuery({
        queryKey: ["balances", chain.name, address],
        queryFn: async (): Promise<Balances> => {
            const client = getPublicClient(chain);
            const jpycAddr = chain.jpycAddress as `0x${string}`;
            const hasJpyc = jpycAddr.length > 0;

            const [nativeWei, jpycWei] = await Promise.all([
                client.getBalance({ address }),
                hasJpyc ? erc20BalanceOf(client, jpycAddr, address) : Promise.resolve(0n),
            ]);

            return {
                native: formatNativeBalance(nativeWei),
                jpyc: hasJpyc ? formatJpyc(jpycWei) : "-",
            };
        },
    });
}
