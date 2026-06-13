// こうかんの「これまで」テキスト履歴。契約状態に忠実。

import type { KoukanView } from "@/lib/koukan-view";

function formatDay(unixSec: bigint): string {
    if (unixSec === 0n) return "";
    const d = new Date(Number(unixSec) * 1000);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function buildLines(koukan: KoukanView): { text: string; muted?: boolean }[] {
    const day = formatDay(koukan.proposedAt);
    const prefix = day ? `${day}　` : "";
    const lines: { text: string; muted?: boolean }[] = [
        { text: `${prefix}こうかんを提案` },
    ];
    if (koukan.makerDeposited) {
        lines.push({ text: `出す側が ${koukan.offered.display} をあずけた` });
    }
    if (koukan.status === "completed") {
        lines.push({ text: "承諾され、交換が成立しました" });
    } else if (koukan.status === "cancelled") {
        lines.push({ text: "取り下げられ、あずけは返却されました", muted: true });
    } else if (koukan.status === "offer_open") {
        lines.push({ text: "… 相手の承諾待ち", muted: true });
    } else {
        lines.push({ text: "… 出す側のあずけ待ち", muted: true });
    }
    return lines;
}

export function KoukanHistory({ koukan }: { koukan: KoukanView }) {
    const lines = buildLines(koukan);
    return (
        <div className="bg-[var(--color-bg-elev)] border border-[var(--color-line)] rounded-xl p-3.5">
            <div className="text-xs font-bold text-[var(--color-ink-2)] mb-2">これまで</div>
            <div className="text-[13px] leading-[1.9] text-[var(--color-ink-2)]">
                {lines.map((line, idx) => (
                    <div key={idx} className={line.muted ? "text-[var(--color-ink-3)]" : ""}>
                        {line.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
