type Props = {
    mnemonic: string;
};

function WordTile({ index, word }: { index: number; word: string }) {
    return (
        <div
            className="flex items-baseline gap-1.5 rounded-lg border bg-[var(--color-bg-elev)] px-2.5 py-2"
            style={{ borderColor: "var(--color-line-strong)" }}
        >
            <span className="text-[10px] text-[var(--color-ink-3)] tabular-nums w-4 text-right">
                {index}
            </span>
            <span className="text-sm text-[var(--color-ink)]">{word}</span>
        </div>
    );
}

function WarningNote() {
    return (
        <div
            className="mt-4 p-3.5 rounded-xl text-xs leading-[1.7] border-[1.5px] space-y-2"
            style={{
                background: "var(--color-danger-bg)",
                borderColor: "var(--color-danger-line)",
                color: "var(--color-danger-strong)",
            }}
        >
            <p className="font-bold text-sm">
                ⚠️ かならず紙にメモしてください
            </p>
            <p>
                パスワードを忘れても、この 12 単語があれば
                お財布を取り戻せます。
            </p>
            <p className="font-bold">
                控えがないと、二度とお財布に入れなくなります。
            </p>
            <p className="font-bold">
                スクリーンショット・クラウド保存・他人への共有は
                しないでください。
            </p>
        </div>
    );
}

export function MnemonicDisplay({ mnemonic }: Props) {
    const words = mnemonic.split(" ");
    return (
        <div>
            <div className="grid grid-cols-3 gap-2">
                {words.map((w, i) => (
                    <WordTile key={i} index={i + 1} word={w} />
                ))}
            </div>
            <WarningNote />
        </div>
    );
}
