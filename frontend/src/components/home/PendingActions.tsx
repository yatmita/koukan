// 「あなたの番です」プロンプト。Claude Design B 案から取り込み。
// 民法上の手番（ack / pay / fulfill / withdraw）を擬人化して教えてくれる。

import type { PendingItem } from "@/lib/mock/recent";

type Props = { items: ReadonlyArray<PendingItem> };

function PendingHeading({ count }: { count: number }) {
    return (
        <div className="text-xs font-bold text-[var(--color-status-pending)]">
            あなたの番です（{count}件）
        </div>
    );
}

function PendingLine({ label }: { label: string }) {
    return (
        <li className="text-[13px] text-[var(--color-ink-2)] leading-[1.7]">
            ・{label}
        </li>
    );
}

export function PendingActions({ items }: Props) {
    if (items.length === 0) return null;
    return (
        <section className="bg-[var(--color-bg-elev)] border-[1.5px] border-[var(--color-status-pending)] rounded-2xl p-3.5">
            <PendingHeading count={items.length} />
            <ul className="mt-2">
                {items.map((it) => (
                    <PendingLine key={it.id} label={it.label} />
                ))}
            </ul>
        </section>
    );
}
