"use client";

import { type ReactElement, useState } from "react";
import { loadEncryptedWallet, saveWalletAddress } from "@/lib/wallet/store";
import { unlockWallet } from "@/lib/wallet/account";
import { setSessionAddress } from "@/lib/wallet/session";
import { Button } from "@/components/ui/Button";

type Props = {
    onUnlocked: (address: `0x${string}`) => void;
};

export function UnlockForm({ onUnlocked }: Props): ReactElement {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = await loadEncryptedWallet();
            if (!payload) {
                setError("お財布が見つかりません");
                return;
            }
            const { address } = await unlockWallet(payload, password);
            await saveWalletAddress(address); // IDB の公開 address を最新化 (旧 wallet 救済)
            setSessionAddress(address);
            onUnlocked(address);
        } catch {
            setError("パスワードが違います");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <div className="text-xs text-[var(--color-ink-2)] mb-1.5">パスワード</div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-13 rounded-xl px-4 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)]"
                    autoFocus
                />
            </div>
            {error ? (
                <div className="text-sm text-[var(--color-status-pending)]">{error}</div>
            ) : null}
            <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || !password}
            >
                {loading ? "確認中…" : "ひらく"}
            </Button>
        </form>
    );
}
