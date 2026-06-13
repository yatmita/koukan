import { Icon, type IconKind } from "../ui/Icon";

type Props = {
    icon: IconKind;
    label: string;
    rightLabel?: string;
    isLast?: boolean;
    onClick?: () => void;
};

export function SettingsRow({ icon, label, rightLabel, isLast = false, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3.5 py-3.5 ${
                isLast ? "" : "border-b border-[var(--color-line)]"
            } active:bg-[var(--color-bg-soft)]`}
        >
            <div className="size-8 rounded-lg bg-[var(--color-bg-soft)] flex items-center justify-center">
                <Icon kind={icon} size={18} color="var(--color-ink-2)" />
            </div>
            <div className="flex-1 text-sm text-left">{label}</div>
            {rightLabel ? (
                <div className="text-xs text-[var(--color-ink-3)]">
                    {rightLabel}
                </div>
            ) : null}
            <span className="text-[var(--color-ink-3)]">›</span>
        </button>
    );
}
