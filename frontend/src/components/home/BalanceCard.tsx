"use client";

import { useState } from "react";

type Props = {
    jpycBalance: string;
    nativeBalance: string;
    address: `0x${string}`;
};

function shortAddress(addr: `0x${string}`): string {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function BalanceLabel() {
    return <div className="text-xs text-[var(--color-ink-2)]">お財布のなかみ</div>;
}

function JpycValue({ jpycBalance }: { jpycBalance: string }) {
    return (
        <div className="mt-1.5 flex items-baseline gap-2">
            <span
                className="font-bold tabular-nums tracking-tight"
                style={{ fontSize: 36, color: "var(--color-ink)" }}
            >
                {jpycBalance}
            </span>
            <span className="text-xs text-[var(--color-ink-3)]">JPYC</span>
        </div>
    );
}

function GasRow({ nativeBalance }: { nativeBalance: string }) {
    return (
        <div className="mt-0.5 text-[11px] text-[var(--color-ink-3)] tabular-nums">
            ガス: {nativeBalance} KAIA
        </div>
    );
}

function AddressRow({ address }: { address: `0x${string}` }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // noop
        }
    }

    return (
        <div
            className="text-[11px] text-[var(--color-ink-3)] mt-1.5"
            style={{ fontFamily: "var(--font-mono)" }}
        >
            {shortAddress(address)}{" "}
            <button
                type="button"
                onClick={handleCopy}
                className="ml-1.5 text-[var(--color-accent-deep)] active:opacity-70"
            >
                {copied ? "コピーしました" : "コピー"}
            </button>
        </div>
    );
}

export function BalanceCard({ jpycBalance, nativeBalance, address }: Props) {
    return (
        <section
            className="bg-[var(--color-bg-elev)] border border-[var(--color-line-strong)] rounded-[20px] px-5 pt-5 pb-4.5"
            style={{ boxShadow: "var(--shadow-card)" }}
        >
            <BalanceLabel />
            <JpycValue jpycBalance={jpycBalance} />
            <GasRow nativeBalance={nativeBalance} />
            <AddressRow address={address} />
        </section>
    );
}
