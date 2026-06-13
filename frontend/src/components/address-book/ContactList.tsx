import type { ContactRecord } from "@/lib/wallet/store";
import { ContactRow } from "./ContactRow";

type Props = { contacts: ContactRecord[] };

function EmptyState() {
    return (
        <div className="px-6 pt-12 pb-6 text-center text-sm text-[var(--color-ink-3)] leading-[1.7]">
            まだ住所録はからっぽです。
            <br />
            右下の <span className="font-semibold">+ ボタン</span> から追加できます。
        </div>
    );
}

export function ContactList({ contacts }: Props) {
    if (contacts.length === 0) return <EmptyState />;
    const sorted = [...contacts].sort((a, b) => b.createdAt - a.createdAt);
    return (
        <div>
            {sorted.map((c, idx) => (
                <ContactRow
                    key={c.id}
                    contact={c}
                    isLast={idx === sorted.length - 1}
                />
            ))}
        </div>
    );
}
