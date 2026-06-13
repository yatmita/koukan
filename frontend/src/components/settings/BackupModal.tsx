"use client";

import { type ReactElement, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MnemonicDisplay } from "@/components/onboarding/MnemonicDisplay";
import { loadEncryptedWallet } from "@/lib/wallet/store";
import { unlockWallet } from "@/lib/wallet/account";

type Props = {
    open: boolean;
    onClose: () => void;
};

type State =
    | { phase: "asking"; error: string | null }
    | { phase: "showing"; mnemonic: string };

function Backdrop({ onClick }: { onClick: () => void }) {
    return (
        <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClick}
        />
    );
}

function ModalCard({ children }: { children: ReactElement | ReactElement[] }) {
    return (
        <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-md rounded-2xl bg-[var(--color-bg-elev)] p-5 shadow-xl"
            style={{ borderColor: "var(--color-line-strong)" }}
        >
            {children}
        </div>
    );
}

export function BackupModal({ open, onClose }: Props): ReactElement | null {
    const [state, setState] = useState<State>({ phase: "asking", error: null });
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    function reset() {
        setState({ phase: "asking", error: null });
        setPassword("");
        setLoading(false);
    }

    function close() {
        reset();
        onClose();
    }

    async function handleUnlock() {
        setLoading(true);
        try {
            const payload = await loadEncryptedWallet();
            if (!payload) {
                setState({ phase: "asking", error: "お財布が見つかりません" });
                return;
            }
            const { mnemonic } = await unlockWallet(payload, password);
            setState({ phase: "showing", mnemonic });
            setPassword("");
        } catch {
            setState({ phase: "asking", error: "パスワードが違います" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Backdrop onClick={close} />
            <ModalCard>
                {state.phase === "asking" ? (
                    <div className="space-y-4">
                        <div className="text-lg font-semibold text-[var(--color-ink)]">
                            バックアップを表示
                        </div>
                        <div className="text-xs text-[var(--color-ink-2)]">
                            パスワードを入れると、12 単語のふっかつのことばが表示されます。
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワード"
                            autoFocus
                            className="w-full h-13 rounded-xl px-4 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)]"
                        />
                        {state.error ? (
                            <div className="text-sm text-[var(--color-status-pending)]">
                                {state.error}
                            </div>
                        ) : null}
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                size="md"
                                fullWidth
                                onClick={close}
                                disabled={loading}
                            >
                                とじる
                            </Button>
                            <Button
                                variant="primary"
                                size="md"
                                fullWidth
                                onClick={handleUnlock}
                                disabled={loading || !password}
                            >
                                {loading ? "確認中…" : "ひらく"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-lg font-semibold text-[var(--color-ink)]">
                            ふっかつのことば
                        </div>
                        <MnemonicDisplay mnemonic={state.mnemonic} />
                        <Button
                            variant="primary"
                            size="md"
                            fullWidth
                            onClick={close}
                        >
                            とじる
                        </Button>
                    </div>
                )}
            </ModalCard>
        </>
    );
}
