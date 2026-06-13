"use client";

import { type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// QueryClient はクライアントごとに 1 インスタンス。
// useState の初期化関数で 1 度だけ生成し、再レンダーで作り直さない。
export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // 残高・一覧などチェーン状態は数十秒の鮮度で十分。
                        staleTime: 15_000,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
