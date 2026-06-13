import Link from "next/link";
import type { ContactRecord } from "@/lib/wallet/store";
import { Avatar } from "../ui/Avatar";

type Props = {
    contact: ContactRecord;
    isLast?: boolean;
};

function shortAddress(addr: string): string {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ContactRow({ contact, isLast = false }: Props) {
    return (
        <Link
            href={`/address-book/${contact.id}/`}
            className={`flex items-center gap-3 px-4 py-3.5 ${
                isLast ? "" : "border-b border-[var(--color-line)]"
            } active:bg-[var(--color-bg-soft)]`}
        >
            <Avatar name={contact.name} />
            <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold">{contact.name}</div>
                <div
                    className="text-xs text-[var(--color-ink-3)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {shortAddress(contact.address)}
                </div>
            </div>
            <span className="text-[var(--color-ink-3)] text-lg">›</span>
        </Link>
    );
}
