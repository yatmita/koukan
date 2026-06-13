"use client";

import { type ReactElement, type ReactNode, useState } from "react";
import { Button } from "./Button";

type Props = {
    title: string;
    body: ReactNode;
    cancelLabel: string;
    confirmLabel: string;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
    confirmVariant?: "primary" | "danger" | "default";
    checkboxLabel?: string;
};

export function ConfirmDialog({
    title,
    body,
    cancelLabel,
    confirmLabel,
    onCancel,
    onConfirm,
    loading = false,
    confirmVariant = "primary",
    checkboxLabel,
}: Props): ReactElement {
    const [checked, setChecked] = useState(false);

    const needsCheck = checkboxLabel !== undefined;
    const confirmDisabled = loading || (needsCheck && !checked);

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={loading ? undefined : onCancel}
            />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-md rounded-2xl bg-[var(--color-bg-elev)] p-5 shadow-xl">
                <div className="text-lg font-semibold text-[var(--color-ink)] mb-2">
                    {title}
                </div>
                <div className="text-sm text-[var(--color-ink-2)] leading-[1.7] mb-4 whitespace-pre-line">
                    {body}
                </div>
                {needsCheck ? (
                    <label className="flex items-start gap-2.5 mb-5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            disabled={loading}
                            className="mt-0.5 size-5 accent-[var(--color-accent-deep)] cursor-pointer"
                        />
                        <span className="text-sm text-[var(--color-ink)] leading-[1.5]">
                            {checkboxLabel}
                        </span>
                    </label>
                ) : null}
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        size="md"
                        fullWidth
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        size="md"
                        fullWidth
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                    >
                        {loading ? "…" : confirmLabel}
                    </Button>
                </div>
            </div>
        </>
    );
}
