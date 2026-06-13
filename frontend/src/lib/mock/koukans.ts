// 交換 (Koukan / 民法 586 条 交換) の mock。

import type { StatusKind } from "@/components/ui/StatusBadge";

export type TokenAmount =
    | { token: "JPYC"; amount: number; yenLabel: string }
    | { token: "USDT"; amount: number; yenLabel: string };

export type Koukan = {
    id: string;
    counterpartyId: string;
    counterpartyName: string;
    direction: "proposed" | "received"; // 自分が maker なら proposed
    offered: TokenAmount;
    wanted: TokenAmount;
    status: StatusKind;
    proposedAt: string; // 表示用 "5/19"
    myDepositStatus: "paid" | "waiting";
    theirDepositStatus: "paid" | "waiting";
    memo?: string;
};

export const koukans: ReadonlyArray<Koukan> = [
    {
        id: "koukan-001",
        counterpartyId: "c-pta",
        counterpartyName: "PTA 渡辺",
        direction: "proposed",
        offered: { token: "JPYC", amount: 5000, yenLabel: "¥5,000" },
        wanted: { token: "USDT", amount: 33, yenLabel: "≒ ¥5,020" },
        status: "waiting",
        proposedAt: "5/19",
        myDepositStatus: "paid",
        theirDepositStatus: "waiting",
        memo: "海外送金用に USDT がほしいので…",
    },
    {
        id: "koukan-002",
        counterpartyId: "c-takahashi",
        counterpartyName: "工務店 高橋",
        direction: "received",
        offered: { token: "USDT", amount: 200, yenLabel: "≒ ¥30,400" },
        wanted: { token: "JPYC", amount: 30000, yenLabel: "¥30,000" },
        status: "ack",
        proposedAt: "5/15",
        myDepositStatus: "waiting",
        theirDepositStatus: "paid",
    },
];

export function findKoukanById(id: string): Koukan | null {
    return koukans.find((k) => k.id === id) ?? null;
}

export function koukansByCounterparty(contactId: string): Koukan[] {
    return koukans.filter((k) => k.counterpartyId === contactId);
}

export function proposedKoukans(): Koukan[] {
    return koukans.filter((k) => k.direction === "proposed");
}

export function receivedKoukans(): Koukan[] {
    return koukans.filter((k) => k.direction === "received");
}
