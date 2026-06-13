// Home 画面で表示する「さいきんのやり取り」mock。

import type { StatusKind } from "@/components/ui/StatusBadge";

export type RecentActivity = {
    id: string;
    counterpartyName: string;
    subtitle: string;
    amount: number; // 正: 受取、負: 支出、0: トークン以外（交換等）
    status: StatusKind;
};

export const recentActivities: ReadonlyArray<RecentActivity> = [
    {
        id: "a1",
        counterpartyName: "山田 みき",
        subtitle: "ピアノ月謝",
        amount: 3000,
        status: "paid",
    },
    {
        id: "a2",
        counterpartyName: "田中 けんと",
        subtitle: "ランチ代の請求",
        amount: -1850,
        status: "pending",
    },
    {
        id: "a3",
        counterpartyName: "PTA 渡辺",
        subtitle: "こうかん：JPYC ⇆ USDT",
        amount: 0,
        status: "ack",
    },
    {
        id: "a4",
        counterpartyName: "佐藤 ひろみ",
        subtitle: "プレゼント代",
        amount: 2500,
        status: "paid",
    },
];

export type PendingItem = {
    id: string;
    label: string;
};

// 「あなたの番です」プロンプト用（B から取り込み）
export const pendingItems: ReadonlyArray<PendingItem> = [
    { id: "p1", label: "田中さんから請求書（¥1,850）" },
    { id: "p2", label: "工務店 高橋さんと こうかんの提案" },
];
