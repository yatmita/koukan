"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { Avatar } from "../ui/Avatar";
import { ActionGate } from "@/components/wallet/ActionGate";
import { getChainConfig, getCurrentChainName } from "@/lib/chain";
import { getPublicClient } from "@/lib/viem-client";
import { koukanAbi } from "@/abi";
import { koukanTokens, type TokenMeta } from "@/lib/koukan-tokens";
import { createKoukan } from "@/lib/koukan";
import { listContacts, type ContactRecord } from "@/lib/wallet/store";
import type { Address } from "@/lib/koukan-domain";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <div className="text-xs text-[var(--color-ink-2)] mt-4.5 mb-2 ml-1">{children}</div>;
}

function ContactPicker({
    contacts,
    selectedId,
    onSelect,
}: {
    contacts: ContactRecord[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    if (contacts.length === 0) {
        return (
            <div className="text-xs text-[var(--color-ink-3)] px-1">
                連絡先がありません。先に「れんらく先」で相手を登録してください。
            </div>
        );
    }
    return (
        <div className="space-y-2">
            {contacts.map((c) => (
                <button
                    type="button"
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={`w-full border-[1.5px] rounded-xl p-3 flex items-center gap-3 ${
                        selectedId === c.id
                            ? "border-[var(--color-accent)] bg-[var(--color-accent-tint)]"
                            : "border-[var(--color-line-strong)] bg-[var(--color-bg-elev)]"
                    }`}
                >
                    <Avatar name={c.name} />
                    <div className="flex-1 text-left text-[15px] font-bold">{c.name} さん</div>
                </button>
            ))}
        </div>
    );
}

function TokenAmountField({
    label,
    tokens,
    symbol,
    amount,
    onSymbol,
    onAmount,
}: {
    label: string;
    tokens: TokenMeta[];
    symbol: string;
    amount: string;
    onSymbol: (s: string) => void;
    onAmount: (a: string) => void;
}) {
    return (
        <div className="border-[1.5px] border-[var(--color-line-strong)] rounded-xl bg-[var(--color-bg-soft)] p-3.5">
            <div className="text-[11px] text-[var(--color-ink-3)]">{label}</div>
            <div className="mt-2 flex gap-2">
                <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={amount}
                    onChange={(e) => onAmount(e.target.value)}
                    placeholder="0"
                    className="flex-1 h-12 rounded-lg px-3 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)] tabular-nums"
                />
                <select
                    value={symbol}
                    onChange={(e) => onSymbol(e.target.value)}
                    className="h-12 rounded-lg px-2 border-[1.5px] border-[var(--color-line-strong)] bg-[var(--color-bg-elev)] text-sm font-bold"
                >
                    {tokens.map((t) => (
                        <option key={t.symbol} value={t.symbol}>
                            {t.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function HowItWorks() {
    return (
        <div className="mt-4 p-3.5 bg-[var(--color-bg-soft)] rounded-xl text-xs text-[var(--color-ink-2)] leading-[1.7]">
            ① いま「提案する」を押すと、こうかんが作られます（まだ資産は動きません）
            <br />
            ② このあと詳細画面で「あずける」を押すと、出す資産が預けられます
            <br />
            ③ 相手が承諾すると、その場で同時に交換が成立します
            <br />
            <span className="text-[var(--color-ink-3)]">
                各ステップは別々の取引で、ガスはそれぞれの実行者が負担します。
            </span>
        </div>
    );
}

export function KoukanCreateForm() {
    const router = useRouter();
    const chain = getChainConfig(getCurrentChainName());
    const tokens = useMemo(() => koukanTokens(chain), [chain]);
    const wantedTokens = useMemo(() => tokens.filter((t) => !t.isNative), [tokens]);

    const { data: contacts } = useQuery({ queryKey: ["contacts"], queryFn: listContacts });

    const [counterpartyId, setCounterpartyId] = useState<string | null>(null);
    const [offeredSymbol, setOfferedSymbol] = useState<string>(tokens[0]?.symbol ?? "NATIVE");
    const [offeredAmount, setOfferedAmount] = useState("");
    const [wantedSymbol, setWantedSymbol] = useState<string>(wantedTokens[0]?.symbol ?? "JPYC");
    const [wantedAmount, setWantedAmount] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const contactList = contacts ?? [];
    const counterparty = contactList.find((c) => c.id === counterpartyId) ?? null;
    const offered = tokens.find((t) => t.symbol === offeredSymbol) ?? null;
    const wanted = wantedTokens.find((t) => t.symbol === wantedSymbol) ?? null;

    function validate(): string | null {
        if (!counterparty) return "お相手を選んでください";
        if (!offered || !wanted) return "トークンを選んでください";
        if (offered.address.toLowerCase() === wanted.address.toLowerCase())
            return "出す資産ともらう資産が同じです";
        if (!(Number(offeredAmount) > 0) || !(Number(wantedAmount) > 0))
            return "金額を入力してください";
        return null;
    }

    async function handleCreate(wallet: import("@/lib/wallet/signer").ActiveWallet) {
        const err = validate();
        if (err || !counterparty || !offered || !wanted) {
            setFormError(err ?? "入力を確認してください");
            return;
        }
        setFormError(null);
        const factory = chain.koukanAddress as Address;
        const publicClient = getPublicClient(chain);
        // create は tokenId = nextId++ なので、事前に読んだ nextId が新しい koukan の id。
        const [mintFee, expectedId] = await Promise.all([
            publicClient.readContract({ address: factory, abi: koukanAbi, functionName: "mintFee" }),
            publicClient.readContract({ address: factory, abi: koukanAbi, functionName: "nextId" }),
        ]);
        const hash = await createKoukan(wallet.walletClient, factory, {
            counterparty: counterparty.address as Address,
            offeredToken: offered.address,
            offeredAmount: parseUnits(offeredAmount, offered.decimals),
            wantedToken: wanted.address,
            wantedAmount: parseUnits(wantedAmount, wanted.decimals),
            mintFee,
        });
        // tx 確定を待ってから、作成した koukan の詳細（＝「あずける」が出る画面）へ直接遷移。
        await publicClient.waitForTransactionReceipt({ hash });
        router.push(`/koukan/${expectedId.toString()}/`);
    }

    return (
        <div className="px-4 pb-6">
            <FieldLabel>お相手</FieldLabel>
            <ContactPicker
                contacts={contactList}
                selectedId={counterpartyId}
                onSelect={setCounterpartyId}
            />

            <FieldLabel>わたしが出す</FieldLabel>
            <TokenAmountField
                label="出す資産（KAIA も選べます）"
                tokens={tokens}
                symbol={offeredSymbol}
                amount={offeredAmount}
                onSymbol={setOfferedSymbol}
                onAmount={setOfferedAmount}
            />

            <div className="text-center text-2xl text-[var(--color-ink-3)] my-1.5">⇄</div>

            <TokenAmountField
                label="もらう資産（ERC20 のみ。KAIA は WKAIA を選択）"
                tokens={wantedTokens}
                symbol={wantedSymbol}
                amount={wantedAmount}
                onSymbol={setWantedSymbol}
                onAmount={setWantedAmount}
            />

            <HowItWorks />

            {formError ? (
                <div className="mt-3 text-sm text-[var(--color-status-pending)]">{formError}</div>
            ) : null}

            <div className="mt-4.5">
                <ActionGate title="こうかんを提案する" cta="提案する（作成）" onConfirm={handleCreate} />
            </div>
        </div>
    );
}
