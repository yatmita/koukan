"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadEncryptedWallet } from "@/lib/wallet/store";

export default function RootPage() {
    const router = useRouter();
    useEffect(() => {
        loadEncryptedWallet()
            .then((payload) => {
                router.replace(payload !== null ? "/home/" : "/onboarding/");
            })
            .catch(() => {
                router.replace("/onboarding/");
            });
    }, [router]);
    return (
        <div className="flex flex-col h-svh items-center justify-center text-[var(--color-ink-3)]">
            <div className="text-2xl font-bold tracking-[0.4em]">こうかん</div>
            <div className="mt-2 text-xs">よみこんでいます…</div>
        </div>
    );
}
