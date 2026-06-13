"use client";

import { type ReactElement, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createActiveWallet, type ActiveWallet } from "@/lib/wallet/signer";
import { getSessionAddress } from "@/lib/wallet/session";

type Props = {
    title: string;
    cta: string;
    onConfirm: (wallet: ActiveWallet) => Promise<void>;
};

export function ActionGate({ title, cta, onConfirm }: Props): ReactElement {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const wallet = await createActiveWallet(password);

            // 防御線: 画面で見ている address (session) と
            // 実際に署名する wallet.address が一致するか確認。
            // 一致しなければ「別タブで wallet が差し替わった」可能性大。
            const sessionAddr = getSessionAddress();
            if (sessionAddr && sessionAddr.toLowerCase() !== wallet.address.toLowerCase()) {
                throw new Error(
                    "お財布が画面と一致していません。一度ホームに戻ってやり直してください。",
                );
            }

            await onConfirm(wallet);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "エラーが発生しました";
            setError(msg.includes("decrypt") || msg.includes("パスワード") ? "パスワードが違います" : msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-xs text-[var(--color-ink-2)] font-semibold">{title}</div>
            <div>
                <div className="text-xs text-[var(--color-ink-2)] mb-1.5">パスワード</div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-13 rounded-xl px-4 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)]"
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
                {loading ? "処理中…" : cta}
            </Button>
        </form>
    );
}
