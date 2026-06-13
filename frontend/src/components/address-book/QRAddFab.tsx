// フローティングアクションボタン。タップで儀式的 QR 画面へ。
// viewport 固定。BottomNav (h-18 = 72px) の少し上に浮かす。

import Link from "next/link";
import { Icon } from "../ui/Icon";

export function QRAddFab() {
    return (
        <Link
            href="/address-book/add/"
            className="fixed right-[18px] bottom-[90px] z-20 h-14 px-[18px] rounded-full bg-[var(--color-accent)] text-white flex items-center gap-1.5 font-bold shadow-[0_6px_14px_rgb(196_95_31/0.25)] active:opacity-90"
        >
            <Icon kind="qr" size={20} color="#fff" />
            QRで追加
        </Link>
    );
}
