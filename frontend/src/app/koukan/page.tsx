"use client";

import Link from "next/link";
import { Screen } from "@/components/layout/Screen";
import { Icon } from "@/components/ui/Icon";
import { SessionGate } from "@/components/wallet/SessionGate";
import { KoukanListTabs } from "@/components/koukan/KoukanListTabs";
import { useKoukans } from "@/hooks/useKoukans";

function PlusAction() {
    return (
        <Link href="/koukan/create/" aria-label="新規こうかん">
            <Icon kind="plus" color="var(--color-ink-2)" />
        </Link>
    );
}

function KoukanListContent({ address }: { address: `0x${string}` }) {
    const { data, isLoading, error } = useKoukans(address);

    if (isLoading) {
        return (
            <div className="text-center py-10 text-sm text-[var(--color-ink-3)]">
                読み込み中…
            </div>
        );
    }
    if (error) {
        return (
            <div className="text-center py-10 text-sm text-[var(--color-status-pending)]">
                {error instanceof Error ? error.message : "読み込みに失敗しました"}
            </div>
        );
    }

    return (
        <>
            <div className="px-4 pt-3">
                <Link
                    href="/koukan/wrap/"
                    className="inline-block text-xs text-[var(--color-accent-deep)] underline"
                >
                    KAIA ⇄ WKAIA を両替する
                </Link>
            </div>
            <KoukanListTabs
                proposed={data?.proposed ?? []}
                received={data?.received ?? []}
            />
        </>
    );
}

export default function KoukanListPage() {
    return (
        <Screen appBarTitle="こうかん" appBarRight={<PlusAction />} bottomNav="koukan">
            <SessionGate>
                {(address) => <KoukanListContent address={address} />}
            </SessionGate>
        </Screen>
    );
}
