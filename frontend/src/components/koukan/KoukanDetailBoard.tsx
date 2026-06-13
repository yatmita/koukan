// こうかん詳細の中央パネル。契約の実態に忠実:
// maker が offered をあずけ、counterparty は承諾(fulfill)時に wanted を払うと同時に成立。
// 「相手のあずけ待ち」中間状態は無いので、wanted 側に deposit 状態は出さない。

import type { KoukanView, KoukanTokenView } from "@/lib/koukan-view";

function Pillar({
    caption,
    token,
    note,
    accent,
}: {
    caption: string;
    token: KoukanTokenView;
    note: string;
    accent?: boolean;
}) {
    return (
        <div
            className={`flex-1 text-center rounded-xl p-3.5 border ${
                accent
                    ? "bg-[var(--color-accent-tint)] border-[var(--color-accent-soft)]"
                    : "bg-[var(--color-bg-elev)] border-[var(--color-line-strong)]"
            }`}
        >
            <div className="text-xs font-semibold text-[var(--color-ink-2)]">{caption}</div>
            <div className="mt-1.5 text-[18px] font-bold tabular-nums">{token.display}</div>
            {!token.known ? (
                <div className="text-[10px] text-[var(--color-status-pending)]">未知のトークン</div>
            ) : null}
            <div className="mt-1.5 text-[10px] text-[var(--color-ink-3)]">{note}</div>
        </div>
    );
}

function CenterSwapHint() {
    return (
        <div className="w-15 text-center text-[var(--color-ink-3)] pt-6">
            <div className="text-xl">⇄</div>
            <div className="text-[10px] mt-1">承諾で同時に交換</div>
        </div>
    );
}

function Reassurance() {
    return (
        <div className="mt-3 -mx-4.5 px-4.5 border-t border-[var(--color-line)] pt-3.5 text-xs text-[var(--color-ink-2)] text-center">
            相手が承諾すると、その場で交換が成立します（成立前なら取り下げて返却できます）
        </div>
    );
}

export function KoukanDetailBoard({ koukan }: { koukan: KoukanView }) {
    const offeredNote = koukan.makerDeposited ? "あずけ済み" : "あずけ前";
    return (
        <div
            className="bg-[var(--color-bg-elev)] border border-[var(--color-line-strong)] rounded-2xl px-4.5 py-5.5"
            style={{ boxShadow: "var(--shadow-card)" }}
        >
            <div className="flex items-start gap-2.5">
                <Pillar caption="出す（あずける）" token={koukan.offered} note={offeredNote} />
                <CenterSwapHint />
                <Pillar
                    caption="ほしい（承諾で支払い）"
                    token={koukan.wanted}
                    note="承諾時に支払われる"
                    accent
                />
            </div>
            <Reassurance />
        </div>
    );
}
