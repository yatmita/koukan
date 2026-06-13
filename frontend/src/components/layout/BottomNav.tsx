// こうかん PWA の bottom navigation. 4 タブ。
// 「ホーム / 住所録 / こうかん / 設定」。

import Link from "next/link";
import { Icon, type IconKind } from "../ui/Icon";

export type BottomNavTabId =
    | "home"
    | "book"
    | "koukan"
    | "settings";

type Tab = {
    id: BottomNavTabId;
    label: string;
    icon: IconKind;
    href: string;
};

const TABS: ReadonlyArray<Tab> = [
    { id: "home", label: "ホーム", icon: "home", href: "/home/" },
    { id: "book", label: "住所録", icon: "book", href: "/address-book/" },
    { id: "koukan", label: "こうかん", icon: "swap", href: "/koukan/" },
    { id: "settings", label: "設定", icon: "gear", href: "/settings/" },
];

type Props = {
    active: BottomNavTabId;
};

function NavItem({ tab, isActive }: { tab: Tab; isActive: boolean }) {
    const colorClass = isActive
        ? "text-[var(--color-accent-deep)]"
        : "text-[var(--color-ink-3)]";
    return (
        <Link
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${colorClass}`}
        >
            <Icon kind={tab.icon} size={22} />
            <span>{tab.label}</span>
        </Link>
    );
}

export function BottomNav({ active }: Props) {
    return (
        <nav className="h-18 pt-1.5 border-t border-[var(--color-line)] bg-[var(--color-bg-elev)] grid grid-cols-4 shrink-0">
            {TABS.map((tab) => (
                <NavItem key={tab.id} tab={tab} isActive={tab.id === active} />
            ))}
        </nav>
    );
}
