// 契約状態(KoukanStatus)を koukan 用ラベルで見せるバッジ。
// StatusBadge(請求書用の固定ラベル)とは別レイヤー。色トークンは共有 CSS var を流用。

import type { KoukanStatus } from "@/lib/koukan-domain";

const META: Record<KoukanStatus, { label: string; cls: string }> = {
    offer_draft: {
        label: "あずけ前",
        cls: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]",
    },
    offer_open: {
        label: "承諾待ち",
        cls: "bg-[var(--color-status-ack-bg)] text-[var(--color-status-ack)]",
    },
    completed: {
        label: "成立",
        cls: "bg-[var(--color-status-paid-bg)] text-[var(--color-status-paid)]",
    },
    cancelled: {
        label: "取り下げ",
        cls: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]",
    },
};

export function KoukanStatusBadge({ status }: { status: KoukanStatus }) {
    const { label, cls } = META[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-bold tracking-wide ${cls}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}
