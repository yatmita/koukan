"use client";

import { useState } from "react";
import type { KoukanView } from "@/lib/koukan-view";
import { KoukanListCard } from "./KoukanListCard";

type Tab = "proposed" | "received";

type Props = {
    proposed: KoukanView[];
    received: KoukanView[];
};

function TabHeader({
    active,
    onChange,
    proposedCount,
    receivedCount,
}: {
    active: Tab;
    onChange: (t: Tab) => void;
    proposedCount: number;
    receivedCount: number;
}) {
    const baseClass = "pb-3 text-sm font-semibold";
    const activeClass =
        "border-b-2 border-[var(--color-accent)] text-[var(--color-ink)]";
    const inactiveClass = "text-[var(--color-ink-3)]";
    return (
        <div className="flex gap-6 px-4 border-b border-[var(--color-line)]">
            <button
                type="button"
                onClick={() => onChange("proposed")}
                className={`${baseClass} ${
                    active === "proposed" ? activeClass : inactiveClass
                }`}
            >
                わたしから（{proposedCount}）
            </button>
            <button
                type="button"
                onClick={() => onChange("received")}
                className={`${baseClass} ${
                    active === "received" ? activeClass : inactiveClass
                }`}
            >
                むこうから（{receivedCount}）
            </button>
        </div>
    );
}

function TabBody({ items }: { items: KoukanView[] }) {
    if (items.length === 0) {
        return (
            <div className="text-center py-10 text-sm text-[var(--color-ink-3)]">
                まだ ありません
            </div>
        );
    }
    return (
        <div className="px-4 pt-2 pb-6">
            {items.map((k) => (
                <KoukanListCard key={k.id} koukan={k} />
            ))}
        </div>
    );
}

export function KoukanListTabs({ proposed, received }: Props) {
    const [active, setActive] = useState<Tab>("proposed");
    return (
        <>
            <TabHeader
                active={active}
                onChange={setActive}
                proposedCount={proposed.length}
                receivedCount={received.length}
            />
            <TabBody items={active === "proposed" ? proposed : received} />
        </>
    );
}
