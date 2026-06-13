// ¥12,000 形式の金額表示。
// JPYC は内部で扱うが、表示は「円」感覚 (主婦層・PayPay 慣れ ユーザー向け)。

type Props = {
    value: number;
    size?: number;
    weight?: number;
    sign?: "+" | "-" | null;
};

function formatYen(n: number): string {
    return Math.abs(n).toLocaleString("ja-JP");
}

function pickSign(value: number, override: Props["sign"]): string {
    if (override === null || override === undefined) return "";
    if (override === "+" || override === "-") return override;
    return value < 0 ? "−" : "";
}

export function YenAmount({ value, size = 28, weight = 700, sign = null }: Props) {
    const prefix = pickSign(value, sign);
    return (
        <span
            className="font-bold tabular-nums tracking-tight"
            style={{ fontSize: size, fontWeight: weight, color: "var(--color-ink)" }}
        >
            {prefix && <span>{prefix}</span>}
            <span style={{ fontSize: size * 0.7, marginRight: 1 }}>¥</span>
            {formatYen(value)}
        </span>
    );
}
