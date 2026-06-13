"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/layout/Screen";
import { SessionGate } from "@/components/wallet/SessionGate";
import { ActionGate } from "@/components/wallet/ActionGate";
import { KoukanDetailBoard } from "@/components/koukan/KoukanDetailBoard";
import { KoukanHistory } from "@/components/koukan/KoukanHistory";
import { KoukanStatusBadge } from "@/components/koukan/KoukanStatusBadge";
import { useKoukan } from "@/hooks/useKoukan";
import type { KoukanView, KoukanTokenView } from "@/lib/koukan-view";
import { depositKoukan, fulfillKoukan, withdrawKoukan } from "@/lib/koukan";
import { erc20Approve, erc20BalanceOf } from "@/lib/erc20";
import { formatTokenAmount, resolveToken } from "@/lib/koukan-tokens";
import { getChainConfig, getCurrentChainName } from "@/lib/chain";
import { getPublicClient } from "@/lib/viem-client";
import type { ActiveWallet } from "@/lib/wallet/signer";

type TxStep = {
    key: string;
    title: string;
    cta: string;
    explanation: string;
    gasNote: string;
    run: (w: ActiveWallet) => Promise<void>;
};

// 各 action を「明示 tx の並び」に展開する。approve と本体は束ねず別ステップにする（暗黙取引なし）。
function buildSteps(action: "deposit" | "withdraw" | "fulfill", k: KoukanView): TxStep[] {
    if (action === "deposit") {
        if (k.offered.isNative) {
            return [
                {
                    key: "deposit",
                    title: "あずける",
                    cta: `${k.offered.display} をあずける`,
                    explanation: "出す資産（native）を vault にあずけます。これで相手が承諾できるようになります。",
                    gasNote: "ガスはあなた負担。",
                    run: (w) => depositKoukan(w.walletClient, k.vault, { nativeValue: k.offered.amount }).then(() => undefined),
                },
            ];
        }
        return [
            {
                key: "approve-deposit",
                title: "① 許可（approve）",
                cta: "あずけを許可する",
                explanation: `vault が ${k.offered.display} を引き出せるよう許可します（まだ送金されません）。`,
                gasNote: "ガスはあなた負担。",
                run: (w) => erc20Approve(w.walletClient, k.offered.address, k.vault, k.offered.amount).then(() => undefined),
            },
            {
                key: "deposit",
                title: "② あずける（deposit）",
                cta: `${k.offered.display} をあずける`,
                explanation: "許可した分を vault に入れます。これで相手が承諾できるようになります。",
                gasNote: "ガスはあなた負担。",
                run: (w) => depositKoukan(w.walletClient, k.vault, {}).then(() => undefined),
            },
        ];
    }
    if (action === "withdraw") {
        return [
            {
                key: "withdraw",
                title: "取り下げる",
                cta: "取り下げて あずけを返してもらう",
                explanation: "こうかんを取り下げます。あずけた資産は全額あなたに返り、以後この提案は成立しません。",
                gasNote: "ガスはあなた負担。",
                run: (w) => withdrawKoukan(w.walletClient, k.vault).then(() => undefined),
            },
        ];
    }
    // fulfill（承諾＝即成立）。wanted は必ず ERC20。WKAIA の場合は事前に wrap ヘルパーで用意しておくこと。
    return [
        {
            key: "approve-fulfill",
            title: "① 許可（approve）",
            cta: "支払いを許可する",
            explanation: `vault が ${k.wanted.display} を引き出せるよう許可します（まだ送金されません）。${k.wanted.symbol === "WKAIA" ? "WKAIA が足りなければ先に wrap ヘルパーで用意してください。" : ""}`,
            gasNote: "ガスはあなた負担。",
            run: (w) => erc20Approve(w.walletClient, k.wanted.address, k.vault, k.wanted.amount).then(() => undefined),
        },
        {
            key: "fulfill",
            title: "② 承諾する（その場で成立）",
            cta: `${k.wanted.display} を払って承諾する`,
            explanation: "承諾すると同一トランザクションで交換が成立します（あなた→相手に支払い、相手の出した資産→あなた）。",
            gasNote: "ガスはあなた負担（あなた→相手 と 契約→あなた の 2 送金ぶん）。",
            run: (w) => fulfillKoukan(w.walletClient, k.vault).then(() => undefined),
        },
    ];
}

function ActionFlow({
    action,
    koukan,
    onAllDone,
}: {
    action: "deposit" | "withdraw" | "fulfill";
    koukan: KoukanView;
    onAllDone: () => void;
}) {
    const steps = buildSteps(action, koukan);
    const [doneCount, setDoneCount] = useState(0);

    async function runStep(step: TxStep, index: number, wallet: ActiveWallet) {
        await step.run(wallet);
        const next = index + 1;
        setDoneCount(next);
        if (next >= steps.length) onAllDone();
    }

    return (
        <div className="space-y-3">
            {steps.map((step, i) => {
                if (i < doneCount) {
                    return (
                        <div key={step.key} className="text-xs text-[var(--color-status-paid)] px-1">
                            ✓ {step.title}
                        </div>
                    );
                }
                if (i === doneCount) {
                    return (
                        <div key={step.key} className="rounded-xl border border-[var(--color-line)] p-3.5">
                            <div className="text-sm font-bold">{step.title}</div>
                            <div className="mt-1 text-xs text-[var(--color-ink-2)] leading-[1.6]">
                                {step.explanation}
                            </div>
                            <div className="mt-1 text-[11px] text-[var(--color-ink-3)]">{step.gasNote}</div>
                            <div className="mt-2.5">
                                <ActionGate
                                    title={step.title}
                                    cta={step.cta}
                                    onConfirm={(wallet) => runStep(step, i, wallet)}
                                />
                            </div>
                        </div>
                    );
                }
                return (
                    <div key={step.key} className="text-xs text-[var(--color-ink-3)] px-1">
                        {step.title}（前のステップの後）
                    </div>
                );
            })}
        </div>
    );
}

// action 実行に必要なトークンと数量（不足判定用）。withdraw は不要。
function requirementFor(
    action: "deposit" | "withdraw" | "fulfill",
    k: KoukanView,
    bal: { native: bigint; offeredBal: bigint; wantedBal: bigint },
): { token: KoukanTokenView; need: bigint; have: bigint } | null {
    if (action === "deposit") {
        return { token: k.offered, need: k.offered.amount, have: k.offered.isNative ? bal.native : bal.offeredBal };
    }
    if (action === "fulfill") {
        return { token: k.wanted, need: k.wanted.amount, have: bal.wantedBal };
    }
    return null;
}

function InsufficientWarning({
    token,
    need,
    have,
}: {
    token: KoukanTokenView;
    need: bigint;
    have: bigint;
}) {
    const chain = getChainConfig(getCurrentChainName());
    const meta = resolveToken(chain, token.address);
    const fmt = (v: bigint) => (meta ? formatTokenAmount(meta, v) : v.toString());
    return (
        <div className="rounded-xl border border-[var(--color-status-pending)] bg-[var(--color-status-pending-bg)] p-3 text-xs text-[var(--color-status-pending)] space-y-1.5">
            <div>
                {token.symbol} が {fmt(need)} 必要ですが、残高は {fmt(have)} です。
            </div>
            {token.symbol === "WKAIA" ? (
                <Link href="/koukan/wrap/" className="underline font-bold">
                    → KAIA を WKAIA に両替する
                </Link>
            ) : null}
        </div>
    );
}

function DetailContent({ address, tokenId }: { address: `0x${string}`; tokenId: bigint }) {
    const queryClient = useQueryClient();
    const chain = getChainConfig(getCurrentChainName());
    const { data: koukan, isLoading, error } = useKoukan(tokenId, address);
    const { data: bal } = useQuery({
        queryKey: ["koukan-bal", chain.name, tokenId.toString(), address],
        enabled: Boolean(koukan),
        queryFn: async () => {
            const client = getPublicClient(chain);
            const k = koukan!;
            const native = await client.getBalance({ address });
            const offeredBal = k.offered.isNative
                ? native
                : await erc20BalanceOf(client, k.offered.address, address);
            const wantedBal = k.wanted.isNative
                ? native
                : await erc20BalanceOf(client, k.wanted.address, address);
            return { native, offeredBal, wantedBal };
        },
    });
    const [toast, setToast] = useState<string | null>(null);

    function flashToast(message: string) {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    }

    async function invalidate() {
        await queryClient.invalidateQueries({
            queryKey: ["koukan", chain.name, tokenId.toString(), address],
        });
        await queryClient.invalidateQueries({ queryKey: ["koukans", chain.name, address] });
    }

    if (isLoading) {
        return (
            <div className="text-center py-10 text-sm text-[var(--color-ink-3)]">読み込み中…</div>
        );
    }
    if (error || !koukan) {
        return (
            <div className="text-center py-10 text-sm text-[var(--color-status-pending)]">
                {error instanceof Error ? error.message : "こうかんが見つかりません"}
            </div>
        );
    }

    const actionLabels: Record<string, string> = {
        deposit: "あずける",
        withdraw: "取り下げる",
        fulfill: "承諾する（その場で成立）",
    };

    return (
        <div className="px-4 pt-2 pb-6 space-y-4">
            <div className="text-center">
                <KoukanStatusBadge status={koukan.status} />
            </div>
            <KoukanDetailBoard koukan={koukan} />
            <KoukanHistory koukan={koukan} />

            {koukan.availableActions.map((action) => {
                const req = bal ? requirementFor(action, koukan, bal) : null;
                const insufficient = req != null && req.have < req.need;
                return (
                    <div key={action} className="space-y-2">
                        <div className="text-xs font-bold text-[var(--color-ink-2)] ml-1">
                            {actionLabels[action]}
                        </div>
                        {insufficient && req ? (
                            <InsufficientWarning token={req.token} need={req.need} have={req.have} />
                        ) : null}
                        <ActionFlow
                            action={action}
                            koukan={koukan}
                            onAllDone={() => {
                                flashToast("完了しました");
                                void invalidate();
                            }}
                        />
                    </div>
                );
            })}

            {toast ? (
                <div className="fixed left-1/2 bottom-24 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[var(--color-ink)] text-white text-sm shadow-lg">
                    {toast}
                </div>
            ) : null}
        </div>
    );
}

export function KoukanDetailClient() {
    const params = useParams();
    const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
    const tokenId = BigInt(idStr ?? "0");

    return (
        <Screen appBarTitle="こうかん の中身" backHref="/koukan/">
            <SessionGate>
                {(address) => <DetailContent address={address} tokenId={tokenId} />}
            </SessionGate>
        </Screen>
    );
}
