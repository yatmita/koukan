// 名前の頭文字 + 暖色丸。Claude Design tokens の avatarPalette を踏襲。

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
    name?: string;
    size?: Size;
};

// 暖色パレット（warm Japanese paper feel）
const PALETTE: Array<[bg: string, fg: string]> = [
    ["#F2D8C2", "#7A4A1F"],
    ["#E2D7C2", "#5C544B"],
    ["#D9E3D0", "#4E5E3D"],
    ["#D6DCE6", "#3F506B"],
    ["#EAD7DC", "#7C4A57"],
    ["#E7DCC0", "#7A6736"],
];

const SIZE_CLASS: Record<Size, string> = {
    sm: "size-8 text-xs",
    md: "size-11 text-base",
    lg: "size-16 text-xl",
    xl: "size-22 text-3xl",
};

function pickPalette(name: string): [string, string] {
    const idx = (name.charCodeAt(0) || 0) % PALETTE.length;
    return PALETTE[idx];
}

function initial(name: string): string {
    return name.slice(0, 1);
}

export function Avatar({ name = "?", size = "md" }: Props) {
    const [bg, fg] = pickPalette(name);
    return (
        <div
            className={`${SIZE_CLASS[size]} rounded-full flex items-center justify-center font-bold border border-black/5 shrink-0`}
            style={{ background: bg, color: fg }}
            aria-label={`${name} のアイコン`}
        >
            {initial(name)}
        </div>
    );
}
