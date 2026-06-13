"use client";

import { Screen } from "@/components/layout/Screen";
import { SessionGate } from "@/components/wallet/SessionGate";
import { KoukanCreateForm } from "@/components/koukan/KoukanCreateForm";

export default function KoukanCreatePage() {
    return (
        <Screen appBarTitle="こうかんを提案する" backHref="/koukan/">
            <SessionGate>{() => <KoukanCreateForm />}</SessionGate>
        </Screen>
    );
}
