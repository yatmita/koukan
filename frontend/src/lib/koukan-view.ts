// オンチェーン Koukan を UI 表示モデル (KoukanView) に組み立てる。
// 合意(koukan-frontend-spec.md §8,§9)の写像: 金額表示ルール・層2 ホワイトリスト警告・役割/状態/可能アクション。

import type { ChainConfig } from "@/lib/chain";
import type { OnChainKoukan } from "@/lib/koukan";
import {
    availableActions,
    deriveKoukanStatus,
    koukanRole,
    type Address,
    type KoukanAction,
    type KoukanRole,
    type KoukanStatus,
} from "@/lib/koukan-domain";
import { formatTokenAmount, resolveToken } from "@/lib/koukan-tokens";

export interface KoukanTokenView {
    address: Address;
    symbol: string; // 既知なら "JPYC"/"KAIA"/"WKAIA"、未知なら短縮アドレス
    amount: bigint;
    display: string; // §8: JPYC は "¥5,000"、native/WKAIA は "1.5 KAIA"、未知は生量
    known: boolean; // ホワイトリスト内か（false は警告表示する）
    isNative: boolean;
}

export interface KoukanView {
    id: string;
    tokenId: bigint;
    vault: Address;
    direction: KoukanRole;
    status: KoukanStatus;
    availableActions: KoukanAction[];
    offered: KoukanTokenView;
    wanted: KoukanTokenView;
    counterpartyName: string;
    counterpartyAddress: Address;
    proposedAt: bigint;
    makerDeposited: boolean;
}

const ZERO = "0x0000000000000000000000000000000000000000";

function shortAddress(address: Address): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function buildTokenView(chain: ChainConfig, address: Address, amount: bigint): KoukanTokenView {
    const meta = resolveToken(chain, address);
    if (!meta) {
        // 層2: 未登録アドレスは記号を捏造せず警告できるよう known=false。
        return {
            address,
            symbol: shortAddress(address),
            amount,
            display: amount.toString(),
            known: false,
            isNative: address.toLowerCase() === ZERO,
        };
    }
    const formatted = formatTokenAmount(meta, amount);
    const display = meta.symbol === "JPYC" ? `¥${formatted}` : `${formatted} ${meta.label}`;
    return {
        address,
        symbol: meta.label,
        amount,
        display,
        known: true,
        isNative: meta.isNative,
    };
}

export function resolveContactName(
    address: string,
    contacts: { address: string; name: string }[],
): string {
    const found = contacts.find((c) => c.address.toLowerCase() === address.toLowerCase());
    if (found) return found.name;
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function buildKoukanView(
    k: OnChainKoukan,
    viewer: Address,
    chain: ChainConfig,
    contacts: { address: string; name: string }[],
): KoukanView {
    const direction = koukanRole({ maker: k.maker, counterparty: k.counterparty }, viewer);
    const counterpartyAddress = direction === "proposed" ? k.counterparty : k.maker;
    return {
        id: k.tokenId.toString(),
        tokenId: k.tokenId,
        vault: k.vault,
        direction,
        status: deriveKoukanStatus(k),
        availableActions: availableActions(k, viewer),
        offered: buildTokenView(chain, k.offeredToken, k.offeredAmount),
        wanted: buildTokenView(chain, k.wantedToken, k.wantedAmount),
        counterpartyName: resolveContactName(counterpartyAddress, contacts),
        counterpartyAddress,
        proposedAt: k.createdAt,
        makerDeposited: k.offerBalance >= k.offeredAmount,
    };
}
