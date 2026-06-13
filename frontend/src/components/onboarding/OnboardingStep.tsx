// 3 ステップオンボーディングの 1 ステップ。

import type { ReactNode } from "react";
import { StepDots } from "./StepDots";

type Props = {
    current: number;
    total: number;
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    primaryAction: ReactNode;
};

function StepHeader({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center px-4 py-3">
            <div className="size-8" />
            <div className="flex-1 text-center text-xs text-[var(--color-ink-3)] tracking-widest">
                STEP {current} / {total}
            </div>
            <div className="size-8" />
        </div>
    );
}

export function OnboardingStep({
    current,
    total,
    title,
    description,
    children,
    primaryAction,
}: Props) {
    return (
        <div className="flex-1 flex flex-col bg-[var(--color-bg-app)]">
            <StepHeader current={current} total={total} />
            <StepDots current={current} total={total} />
            <div className="flex-1 flex flex-col px-6">
                <div className="text-[22px] font-bold leading-[1.4] mb-2">
                    {title}
                </div>
                {description ? (
                    <div className="text-[13px] text-[var(--color-ink-2)] leading-[1.7] mb-7">
                        {description}
                    </div>
                ) : null}
                {children}
                <div className="flex-1" />
                <div className="mb-3.5">{primaryAction}</div>
            </div>
        </div>
    );
}
