"use client";

import { Screen } from "@/components/layout/Screen";
import { SessionGate } from "@/components/wallet/SessionGate";
import { WrapHelper } from "@/components/koukan/WrapHelper";

export default function KoukanWrapPage() {
    return (
        <Screen appBarTitle="KAIA ⇄ WKAIA 両替" backHref="/koukan/">
            <SessionGate>{(address) => <WrapHelper address={address} />}</SessionGate>
        </Screen>
    );
}
