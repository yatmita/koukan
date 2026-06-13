// 画面上部のタイトルバー。back / title / right の 3 領域構成。

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
    title?: string;
    backHref?: string;
    right?: ReactNode;
};

function BackButton({ href }: { href: string }) {
    return (
        <Link
            href={href}
            aria-label="もどる"
            className="size-8 border border-[var(--color-ink-2)] rounded-lg flex items-center justify-center text-[var(--color-ink-2)] text-base"
        >
            ‹
        </Link>
    );
}

function Title({ children }: { children?: ReactNode }) {
    return (
        <div className="flex-1 text-center text-[17px] font-bold">{children}</div>
    );
}

export function AppBar({ title, backHref, right }: Props) {
    return (
        <header className="h-13 flex items-center px-4 gap-2.5 shrink-0">
            <div className="size-8">
                {backHref ? <BackButton href={backHref} /> : null}
            </div>
            <Title>{title}</Title>
            <div className="size-8 flex justify-end">{right}</div>
        </header>
    );
}
