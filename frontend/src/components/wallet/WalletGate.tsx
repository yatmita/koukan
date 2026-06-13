"use client";

import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadEncryptedWallet } from "@/lib/wallet/store";

type Props = {
    children: ReactNode;
    fallback?: string;
};

export function WalletGate({ children, fallback = "/onboarding/" }: Props): ReactElement | null {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        loadEncryptedWallet().then((payload) => {
            if (payload === null) {
                router.replace(fallback);
            } else {
                setReady(true);
            }
        });
    }, [fallback, router]);

    if (!ready) return null;
    return <>{children}</>;
}
