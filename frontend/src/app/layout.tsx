import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "やくそく",
    description:
        "知っているひとと、おかねのやりとりを「やくそく」にして残すアプリ。",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "やくそく",
    },
};

export const viewport: Viewport = {
    themeColor: "#efe8dc",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ja" className="h-full antialiased">
            <body className="min-h-full flex flex-col bg-[var(--color-bg-page)] text-[var(--color-ink)]">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
