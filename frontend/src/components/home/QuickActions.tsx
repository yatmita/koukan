import Link from "next/link";
import { Icon, type IconKind } from "../ui/Icon";

type Action = {
    label: string;
    icon: IconKind;
    href: string;
};

const ACTIONS: ReadonlyArray<Action> = [
    { label: "住所録", icon: "book", href: "/address-book/" },
    { label: "こうかん", icon: "swap", href: "/koukan/" },
];

function ActionTile({ action }: { action: Action }) {
    return (
        <Link
            href={action.href}
            className="bg-[var(--color-bg-elev)] border border-[var(--color-line-strong)] rounded-2xl py-3.5 flex flex-col items-center gap-1.5 active:opacity-80"
        >
            <div className="size-10 rounded-xl bg-[var(--color-accent-tint)] flex items-center justify-center text-[var(--color-accent-deep)]">
                <Icon kind={action.icon} />
            </div>
            <span className="text-xs font-semibold">{action.label}</span>
        </Link>
    );
}

export function QuickActions() {
    return (
        <nav className="grid grid-cols-2 gap-2.5">
            {ACTIONS.map((a) => (
                <ActionTile key={a.label} action={a} />
            ))}
        </nav>
    );
}
