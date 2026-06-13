import type { ChainConfig } from "@/lib/chain";
import type { Address } from "@/lib/koukan-domain";

export type TokenSymbol = "NATIVE" | "JPYC" | "WKAIA";

export interface TokenMeta {
    symbol: TokenSymbol;
    address: Address;
    decimals: number;
    isNative: boolean;
    label: string;
}

const NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000" as const satisfies Address;
const UNIT = 10n ** 18n;

function formatWithCommas(n: bigint): string {
    const str = n.toString();
    if (str.length <= 3) return str;
    const parts: string[] = [];
    for (let i = str.length; i > 0; i -= 3) {
        parts.unshift(str.slice(Math.max(0, i - 3), i));
    }
    return parts.join(",");
}

export function koukanTokens(chain: ChainConfig): TokenMeta[] {
    const tokens: TokenMeta[] = [
        {
            symbol: "NATIVE",
            address: NATIVE_ADDRESS,
            decimals: 18,
            isNative: true,
            label: "KAIA",
        },
    ];
    if (chain.jpycAddress) {
        tokens.push({
            symbol: "JPYC",
            address: chain.jpycAddress as Address,
            decimals: 18,
            isNative: false,
            label: "JPYC",
        });
    }
    if (chain.wkaiaAddress) {
        tokens.push({
            symbol: "WKAIA",
            address: chain.wkaiaAddress as Address,
            decimals: 18,
            isNative: false,
            label: "WKAIA",
        });
    }
    return tokens;
}

export function resolveToken(chain: ChainConfig, address: Address): TokenMeta | null {
    const lower = address.toLowerCase();
    return koukanTokens(chain).find((t) => t.address.toLowerCase() === lower) ?? null;
}

export function formatTokenAmount(meta: TokenMeta, amount: bigint): string {
    const intPart = amount / UNIT;
    const decPart = amount % UNIT;
    const formattedInt = formatWithCommas(intPart);
    if (decPart === 0n) return formattedInt;
    const decStr = decPart.toString().padStart(18, "0").replace(/0+$/, "");
    return `${formattedInt}.${decStr}`;
}
