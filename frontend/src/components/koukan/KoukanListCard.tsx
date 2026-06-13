// 一覧カード。出す資産 ⇄ もらう資産（KoukanView ベース）。

import Link from "next/link";
import type { KoukanView } from "@/lib/koukan-view";
import type { KoukanTokenView } from "@/lib/koukan-view";
import { KoukanStatusBadge } from "./KoukanStatusBadge";

type Props = { koukan: KoukanView };

function HeaderRow({ koukan }: { koukan: KoukanView }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 text-sm font-bold">
                {koukan.counterpartyName} さんと
            </div>
            <KoukanStatusBadge status={koukan.status} />
        </div>
    );
}

function Pillar({ caption, token }: { caption: string; token: KoukanTokenView }) {
    return (
        <div className="flex flex-col items-center gap-0.5 flex-1">
            <div className="text-[10px] text-[var(--color-ink-3)]">{caption}</div>
            <div className="text-sm font-bold tabular-nums">{token.display}</div>
            {!token.known ? (
                <div className="text-[9px] text-[var(--color-status-pending)]">未知のトークン</div>
            ) : null}
        </div>
    );
}

function SwapIndicator() {
    return <div className="w-7 text-center text-lg text-[var(--color-ink-3)]">⇄</div>;
}

export function KoukanListCard({ koukan }: Props) {
    // direction で「わたしが出す/もらう」を決める。
    const iGive = koukan.direction === "proposed" ? koukan.offered : koukan.wanted;
    const iGet = koukan.direction === "proposed" ? koukan.wanted : koukan.offered;
    return (
        <Link
            href={`/koukan/${koukan.id}/`}
            className="block bg-[var(--color-bg-elev)] border border-[var(--color-line)] rounded-2xl p-3.5 mb-2.5 active:opacity-90"
        >
            <HeaderRow koukan={koukan} />
            <div className="mt-3 flex items-center gap-2">
                <Pillar caption="わたしが出す" token={iGive} />
                <SwapIndicator />
                <Pillar caption="もらう" token={iGet} />
            </div>
        </Link>
    );
}
