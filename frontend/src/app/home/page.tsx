"use client";

import { type ReactElement, useEffect, useState } from "react";
import { Screen } from "@/components/layout/Screen";
import { HomeHeader } from "@/components/home/HomeHeader";
import { BalanceCard } from "@/components/home/BalanceCard";
import { QuickActions } from "@/components/home/QuickActions";
import { PendingActions } from "@/components/home/PendingActions";
import { RecentActivity } from "@/components/home/RecentActivity";
import { recentActivities, pendingItems } from "@/lib/mock/recent";
import { SessionGate } from "@/components/wallet/SessionGate";
import { useBalances } from "@/hooks/useBalances";
import { loadDisplayName } from "@/lib/wallet/store";

function shortAddress(address: `0x${string}`): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function HomeContent({ address }: { address: `0x${string}` }): ReactElement {
    const { data: balances } = useBalances(address);
    const [displayName, setDisplayName] = useState<string | null>(null);

    useEffect(() => {
        loadDisplayName().then(setDisplayName);
    }, []);

    return (
        <>
            <HomeHeader name={displayName ?? shortAddress(address)} />
            <div className="px-4 pt-3 pb-5 space-y-3.5">
                <BalanceCard
                    jpycBalance={balances?.jpyc ?? "-"}
                    nativeBalance={balances?.native ?? "-"}
                    address={address}
                />
                <QuickActions />
                <PendingActions items={pendingItems} />
                <RecentActivity items={recentActivities} />
            </div>
        </>
    );
}

export default function HomePage(): ReactElement {
    return (
        <Screen bottomNav="home">
            <SessionGate>
                {(address) => <HomeContent address={address} />}
            </SessionGate>
        </Screen>
    );
}
