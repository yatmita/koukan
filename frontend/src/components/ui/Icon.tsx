// SVG アイコン集。Claude Design の primitives.jsx から移植。
// 同じインターフェース: <Icon kind="home" size={22} color="..." />

import type { SVGProps } from "react";

export type IconKind =
    | "home"
    | "book"
    | "invoice"
    | "swap"
    | "gear"
    | "qr"
    | "scan"
    | "plus"
    | "arrow-right"
    | "arrow-left"
    | "check"
    | "person"
    | "yen"
    | "more"
    | "lock"
    | "globe"
    | "calendar"
    | "send"
    | "download"
    | "history";

type Props = {
    kind: IconKind;
    size?: number;
    color?: string;
} & Omit<SVGProps<SVGSVGElement>, "color">;

const PATHS: Record<IconKind, string> = {
    home: "M3 11 L12 4 L21 11 V20 H14 V14 H10 V20 H3 Z",
    book: "M5 4 H19 V20 H7 A2 2 0 0 1 5 18 Z M5 18 A2 2 0 0 1 7 16 H19",
    invoice: "M6 3 H18 V21 L15 19 L12 21 L9 19 L6 21 Z M9 9 H15 M9 13 H15",
    swap: "M4 8 H17 M14 5 L17 8 L14 11 M20 16 H7 M10 13 L7 16 L10 19",
    gear: "", // 複合パスなので個別レンダー
    qr: "M3 3 H9 V9 H3 Z M15 3 H21 V9 H15 Z M3 15 H9 V21 H3 Z M13 13 H17 M13 17 H15 V21 H19 V17 M19 13 H21",
    scan: "M4 8 V4 H8 M16 4 H20 V8 M20 16 V20 H16 M8 20 H4 V16 M7 12 H17",
    plus: "M12 5 V19 M5 12 H19",
    "arrow-right": "M5 12 H19 M13 6 L19 12 L13 18",
    "arrow-left": "M19 12 H5 M11 6 L5 12 L11 18",
    check: "M5 12 L10 17 L19 7",
    person: "", // 複合パス
    yen: "M6 4 L12 12 L18 4 M12 12 V20 M7 14 H17 M7 17 H17",
    more: "", // 3 円
    lock: "", // 鍵型
    globe: "", // 球＋経線
    calendar: "", // 枠＋線
    send: "M4 12 L20 4 L14 20 L11 13 L4 12 Z",
    download: "M12 4 V16 M6 11 L12 17 L18 11 M5 21 H19",
    history: "M4 12 A8 8 0 1 0 7 6 M4 4 V8 H8 M12 8 V12 L15 14",
};

export function Icon({ kind, size = 22, color = "currentColor", ...rest }: Props) {
    const stroke = {
        stroke: color,
        strokeWidth: 1.6,
        fill: "none" as const,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };
    const sharedSvg = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        ...rest,
    };

    // 複合パスや特殊形は個別に
    if (kind === "gear") {
        return (
            <svg {...sharedSvg}>
                <circle cx="12" cy="12" r="3" {...stroke} />
                <path
                    d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9"
                    {...stroke}
                />
            </svg>
        );
    }
    if (kind === "person") {
        return (
            <svg {...sharedSvg}>
                <circle cx="12" cy="8" r="4" {...stroke} />
                <path d="M4 21 C5 16 8 14 12 14 C16 14 19 16 20 21" {...stroke} />
            </svg>
        );
    }
    if (kind === "more") {
        return (
            <svg {...sharedSvg}>
                <circle cx="5" cy="12" r="1.4" fill={color} />
                <circle cx="12" cy="12" r="1.4" fill={color} />
                <circle cx="19" cy="12" r="1.4" fill={color} />
            </svg>
        );
    }
    if (kind === "lock") {
        return (
            <svg {...sharedSvg}>
                <rect x="5" y="11" width="14" height="10" rx="2" {...stroke} />
                <path d="M8 11 V8 A4 4 0 0 1 16 8 V11" {...stroke} />
            </svg>
        );
    }
    if (kind === "globe") {
        return (
            <svg {...sharedSvg}>
                <circle cx="12" cy="12" r="9" {...stroke} />
                <path d="M3 12 H21 M12 3 C15 6 15 18 12 21 C9 18 9 6 12 3" {...stroke} />
            </svg>
        );
    }
    if (kind === "calendar") {
        return (
            <svg {...sharedSvg}>
                <rect x="4" y="6" width="16" height="14" rx="2" {...stroke} />
                <path d="M4 10 H20 M8 4 V8 M16 4 V8" {...stroke} />
            </svg>
        );
    }

    return (
        <svg {...sharedSvg}>
            <path d={PATHS[kind]} {...stroke} />
        </svg>
    );
}
