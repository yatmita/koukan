import type { ReactNode } from "react";

type Props = {
    title: string;
    children: ReactNode;
};

function SectionTitle({ children }: { children: string }) {
    return (
        <div className="px-1 pb-2 text-[11px] font-bold text-[var(--color-ink-3)] tracking-widest">
            {children}
        </div>
    );
}

export function SettingsSection({ title, children }: Props) {
    return (
        <section className="mb-5">
            <SectionTitle>{title}</SectionTitle>
            <div className="bg-[var(--color-bg-elev)] border border-[var(--color-line)] rounded-2xl overflow-hidden">
                {children}
            </div>
        </section>
    );
}
