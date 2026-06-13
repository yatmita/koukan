type Props = {
    password: string;
    confirm: string;
    onPasswordChange: (value: string) => void;
    onConfirmChange: (value: string) => void;
    error?: string | null;
};

function FieldLabel({ children }: { children: string }) {
    return (
        <div className="text-xs text-[var(--color-ink-2)] mb-1.5">{children}</div>
    );
}

function SafetyNote() {
    return (
        <div
            className="mt-3.5 p-3.5 rounded-xl text-xs text-[var(--color-ink-2)] leading-[1.6] border"
            style={{
                background: "var(--color-accent-tint)",
                borderColor: "var(--color-accent-soft)",
            }}
        >
            🔒 パスワードはこの端末の中だけに保存されます。
            <br />
            外には送られません。
        </div>
    );
}

export function PasswordPair({
    password,
    confirm,
    onPasswordChange,
    onConfirmChange,
    error,
}: Props) {
    return (
        <div className="space-y-4">
            <div>
                <FieldLabel>パスワード</FieldLabel>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full h-13 rounded-xl px-4 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)] tracking-[0.3em]"
                    autoFocus
                />
            </div>
            <div>
                <FieldLabel>もういちど</FieldLabel>
                <input
                    type="password"
                    value={confirm}
                    onChange={(e) => onConfirmChange(e.target.value)}
                    className="w-full h-13 rounded-xl px-4 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)] tracking-[0.3em]"
                    placeholder="同じパスワードを入れてください"
                />
            </div>
            {error ? (
                <div className="text-sm text-[var(--color-status-pending)]">{error}</div>
            ) : null}
            <SafetyNote />
        </div>
    );
}
