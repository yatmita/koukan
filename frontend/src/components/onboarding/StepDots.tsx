type Props = {
    current: number;
    total: number;
};

export function StepDots({ current, total }: Props) {
    const dots = Array.from({ length: total }, (_, i) => i + 1);
    return (
        <div className="flex gap-1.5 justify-center mb-5">
            {dots.map((n) => (
                <span
                    key={n}
                    className="h-1 rounded-sm"
                    style={{
                        width: 24,
                        background:
                            n === current
                                ? "var(--color-accent)"
                                : "var(--color-ink-4)",
                    }}
                />
            ))}
        </div>
    );
}
