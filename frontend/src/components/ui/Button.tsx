// 共通ボタン。Claude Design の .btn / .btn--primary / .btn--big / .btn--ghost を踏襲。

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "primary" | "ghost" | "danger";
type Size = "md" | "lg";

type Props = {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASS: Record<Variant, string> = {
    default:
        "bg-[var(--color-bg-elev)] border border-[var(--color-ink)] text-[var(--color-ink)]",
    primary:
        "bg-[var(--color-accent)] border border-[var(--color-accent-deep)] text-white",
    ghost:
        "bg-transparent border border-dashed border-[var(--color-line-strong)] text-[var(--color-ink-2)]",
    danger:
        "bg-transparent border border-[var(--color-status-pending)] text-[var(--color-status-pending)]",
};

const SIZE_CLASS: Record<Size, string> = {
    md: "h-12 text-base rounded-2xl px-[18px]",
    lg: "h-14 text-[17px] rounded-2xl px-[18px]",
};

export function Button({
    variant = "default",
    size = "md",
    fullWidth = false,
    className = "",
    children,
    ...rest
}: Props) {
    return (
        <button
            {...rest}
            className={[
                "inline-flex items-center justify-center gap-1.5 font-semibold transition-opacity active:opacity-80 disabled:opacity-50",
                VARIANT_CLASS[variant],
                SIZE_CLASS[size],
                fullWidth ? "w-full" : "",
                className,
            ].join(" ")}
        >
            {children}
        </button>
    );
}
