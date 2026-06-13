"use client";

import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    checkWalletStatus,
    getSessionAddress,
    type WalletStatus,
} from "@/lib/wallet/session";
import { UnlockForm } from "./UnlockForm";

type Props = {
    children: (address: `0x${string}`) => ReactNode;
};

export function SessionGate({ children }: Props): ReactElement | null {
    const router = useRouter();
    const [status, setStatus] = useState<WalletStatus | null>(null);
    const [address, setAddress] = useState<`0x${string}` | null>(null);

    useEffect(() => {
        checkWalletStatus().then((s) => {
            if (s === "no-wallet") {
                router.replace("/onboarding/");
                return;
            }
            if (s === "unlocked") {
                setAddress(getSessionAddress());
            }
            setStatus(s);
        });
    }, [router]);

    if (status === null) return null;

    if (status === "locked") {
        return (
            <div className="flex-1 flex flex-col justify-center px-6 pb-8">
                <h1 className="text-[22px] font-bold mb-6">ひらく</h1>
                <UnlockForm
                    onUnlocked={(addr) => {
                        setAddress(addr);
                        setStatus("unlocked");
                    }}
                />
            </div>
        );
    }

    if (address === null) return null;
    return <>{children(address)}</>;
}
