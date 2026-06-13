"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { ActionGate } from "@/components/wallet/ActionGate";
import { getChainConfig, getCurrentChainName } from "@/lib/chain";
import { getPublicClient } from "@/lib/viem-client";
import { erc20BalanceOf } from "@/lib/erc20";
import { wrapNative, unwrapNative } from "@/lib/koukan";
import { koukanTokens, formatTokenAmount, type TokenMeta } from "@/lib/koukan-tokens";
import type { ActiveWallet } from "@/lib/wallet/signer";

function BalanceRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-[var(--color-ink-2)]">{label}</span>
            <span className="font-bold tabular-nums">{value}</span>
        </div>
    );
}

function ConvertForm({
    title,
    explanation,
    cta,
    amount,
    onAmount,
    onConfirm,
}: {
    title: string;
    explanation: string;
    cta: string;
    amount: string;
    onAmount: (a: string) => void;
    onConfirm: (w: ActiveWallet) => Promise<void>;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-line)] p-3.5 space-y-2.5">
            <div className="text-sm font-bold">{title}</div>
            <div className="text-xs text-[var(--color-ink-2)] leading-[1.6]">{explanation}</div>
            <input
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={(e) => onAmount(e.target.value)}
                placeholder="0"
                className="w-full h-12 rounded-lg px-3 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)] tabular-nums"
            />
            <div className="text-[11px] text-[var(--color-ink-3)]">ガスはあなた負担。</div>
            <ActionGate title={title} cta={cta} onConfirm={onConfirm} />
        </div>
    );
}

export function WrapHelper({ address }: { address: `0x${string}` }) {
    const chain = getChainConfig(getCurrentChainName());
    const queryClient = useQueryClient();
    const tokens = useMemo(() => koukanTokens(chain), [chain]);
    const wkaia: TokenMeta | undefined = tokens.find((t) => t.symbol === "WKAIA");
    const native: TokenMeta | undefined = tokens.find((t) => t.isNative);

    const [wrapAmount, setWrapAmount] = useState("");
    const [unwrapAmount, setUnwrapAmount] = useState("");

    const { data: balances } = useQuery({
        queryKey: ["wrap-balances", chain.name, address],
        enabled: Boolean(wkaia),
        queryFn: async () => {
            const client = getPublicClient(chain);
            const [nativeBal, wkaiaBal] = await Promise.all([
                client.getBalance({ address }),
                erc20BalanceOf(client, wkaia!.address, address),
            ]);
            return { nativeBal, wkaiaBal };
        },
    });

    if (!wkaia || !native) {
        return (
            <div className="px-4 py-10 text-center text-sm text-[var(--color-ink-3)]">
                このチェーンには WKAIA が設定されていません。
            </div>
        );
    }

    async function invalidate() {
        await queryClient.invalidateQueries({ queryKey: ["wrap-balances", chain.name, address] });
    }

    async function handleWrap(wallet: ActiveWallet) {
        await wrapNative(wallet.walletClient, wkaia!.address, parseUnits(wrapAmount, 18));
        setWrapAmount("");
        await invalidate();
    }

    async function handleUnwrap(wallet: ActiveWallet) {
        await unwrapNative(wallet.walletClient, wkaia!.address, parseUnits(unwrapAmount, 18));
        setUnwrapAmount("");
        await invalidate();
    }

    return (
        <div className="px-4 pt-2 pb-6 space-y-4">
            <div className="rounded-xl bg-[var(--color-bg-soft)] p-3.5 space-y-1.5">
                <BalanceRow
                    label={`${native.label}（native）`}
                    value={balances ? formatTokenAmount(native, balances.nativeBal) : "…"}
                />
                <BalanceRow
                    label="WKAIA"
                    value={balances ? formatTokenAmount(wkaia, balances.wkaiaBal) : "…"}
                />
            </div>

            <ConvertForm
                title="KAIA → WKAIA（wrap）"
                explanation="native の KAIA を 1:1 で WKAIA に変えます。こうかんで「もらう＝WKAIA」を払うときに使います。"
                cta="wrap する"
                amount={wrapAmount}
                onAmount={setWrapAmount}
                onConfirm={handleWrap}
            />

            <ConvertForm
                title="WKAIA → KAIA（unwrap）"
                explanation="受け取った WKAIA を 1:1 で native の KAIA に戻します。"
                cta="unwrap する"
                amount={unwrapAmount}
                onAmount={setUnwrapAmount}
                onConfirm={handleUnwrap}
            />
        </div>
    );
}
