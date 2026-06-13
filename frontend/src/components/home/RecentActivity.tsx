import type { RecentActivity as ActivityItem } from "@/lib/mock/recent";
import { Avatar } from "../ui/Avatar";
import { StatusBadge } from "../ui/StatusBadge";

type Props = { items: ReadonlyArray<ActivityItem> };

function SectionHeader() {
    return (
        <div className="mt-5.5 flex items-baseline">
            <h2 className="text-sm font-bold">さいきんのやり取り</h2>
            <div className="flex-1" />
            <button className="text-xs text-[var(--color-ink-3)]">すべて見る</button>
        </div>
    );
}

function AmountText({ amount }: { amount: number }) {
    if (amount === 0) return null;
    const colorClass =
        amount < 0
            ? "text-[var(--color-ink)]"
            : "text-[var(--color-status-paid)]";
    const prefix = amount > 0 ? "+" : "−";
    return (
        <div className={`tabular-nums font-bold text-sm ${colorClass}`}>
            {prefix}¥{Math.abs(amount).toLocaleString("ja-JP")}
        </div>
    );
}

function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-3.5 ${
                isLast ? "" : "border-b border-[var(--color-line)]"
            }`}
        >
            <Avatar name={item.counterpartyName} />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{item.counterpartyName}</div>
                <div className="text-xs text-[var(--color-ink-3)]">
                    {item.subtitle}
                </div>
            </div>
            <div className="text-right">
                <AmountText amount={item.amount} />
                <div className="mt-1">
                    <StatusBadge status={item.status} />
                </div>
            </div>
        </div>
    );
}

export function RecentActivity({ items }: Props) {
    return (
        <section>
            <SectionHeader />
            <div className="mt-2.5 bg-[var(--color-bg-elev)] border border-[var(--color-line-strong)] rounded-2xl overflow-hidden">
                {items.map((item, idx) => (
                    <ActivityRow
                        key={item.id}
                        item={item}
                        isLast={idx === items.length - 1}
                    />
                ))}
            </div>
        </section>
    );
}
