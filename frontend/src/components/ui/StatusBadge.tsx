// 民法的ステータス表示。未承諾 / 承諾済 / 支払済 + UI 状態 (送付済 / 相手待ち / 完了)。

export type StatusKind =
    | "pending" // 未承諾
    | "ack" // 承諾済
    | "paid" // 支払済
    | "issued" // 送付済 (UI label を ack 色で)
    | "waiting" // 相手待ち (pending 色)
    | "done"; // 完了 (paid 色)

const LABELS: Record<StatusKind, string> = {
    pending: "未承諾",
    ack: "承諾済",
    paid: "支払済",
    issued: "送付済",
    waiting: "相手待ち",
    done: "完了",
};

const COLOR_CLASSES: Record<StatusKind, string> = {
    pending: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]",
    ack: "bg-[var(--color-status-ack-bg)] text-[var(--color-status-ack)]",
    paid: "bg-[var(--color-status-paid-bg)] text-[var(--color-status-paid)]",
    issued: "bg-[var(--color-status-ack-bg)] text-[var(--color-status-ack)]",
    waiting:
        "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]",
    done: "bg-[var(--color-status-paid-bg)] text-[var(--color-status-paid)]",
};

type Props = { status: StatusKind };

export function StatusBadge({ status }: Props) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-bold tracking-wide ${COLOR_CLASSES[status]}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {LABELS[status]}
        </span>
    );
}
