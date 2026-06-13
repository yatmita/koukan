// 画面の標準構造。AppBar + scrollable body + (optional) BottomNav。
// 各 page.tsx はこの Screen を使うことで Composed Method 化する。

import type { ReactNode } from "react";
import { BottomNav, type BottomNavTabId } from "./BottomNav";
import { AppBar } from "./AppBar";

type TabId = BottomNavTabId;

type Props = {
    appBar?: ReactNode;
    appBarTitle?: string;
    backHref?: string;
    appBarRight?: ReactNode;
    bottomNav?: TabId | null;
    children: ReactNode;
};

function ScreenBody({ children }: { children: ReactNode }) {
    return (
        <main className="flex-1 overflow-y-auto scroll-hide bg-[var(--color-bg-app)] relative">
            {children}
        </main>
    );
}

export function Screen({
    appBar,
    appBarTitle,
    backHref,
    appBarRight,
    bottomNav,
    children,
}: Props) {
    const hasAppBar =
        appBar !== undefined ||
        appBarTitle !== undefined ||
        backHref !== undefined;
    return (
        <div className="flex flex-col h-svh bg-[var(--color-bg-app)]">
            {appBar ??
                (hasAppBar ? (
                    <AppBar
                        title={appBarTitle}
                        backHref={backHref}
                        right={appBarRight}
                    />
                ) : null)}
            <ScreenBody>{children}</ScreenBody>
            {bottomNav ? <BottomNav active={bottomNav} /> : null}
        </div>
    );
}
