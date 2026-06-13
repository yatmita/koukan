type Props = {
    name: string;
    onNameChange: (value: string) => void;
    error?: string | null;
};

function FieldLabel({ children }: { children: string }) {
    return (
        <div className="text-xs text-[var(--color-ink-2)] mb-1.5">{children}</div>
    );
}

function HintNote() {
    return (
        <div className="mt-3 text-xs text-[var(--color-ink-3)] leading-[1.6]">
            あとから設定で変えられます。<br />
            相手の画面には表示されません (アドレスとは別物)。
        </div>
    );
}

export function NameInput({ name, onNameChange, error }: Props) {
    return (
        <div className="space-y-4">
            <div>
                <FieldLabel>あなたの名前</FieldLabel>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="クロコ など"
                    autoFocus
                    maxLength={20}
                    className="w-full h-13 rounded-xl px-4 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)]"
                />
            </div>
            {error ? (
                <div className="text-sm text-[var(--color-status-pending)]">{error}</div>
            ) : null}
            <HintNote />
        </div>
    );
}
