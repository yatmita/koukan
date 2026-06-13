// 儀式的 QR の見た目 placeholder。Phase C で qrcode ライブラリで実生成に差し替え。

export function QRPlaceholder({ value }: { value?: string }) {
    return (
        <div
            className="aspect-square w-full border-8 border-[var(--color-bg-elev)] outline outline-[1.5px] outline-[var(--color-ink)] rounded-lg relative"
            style={{
                background: `
                    linear-gradient(#1f1b18, #1f1b18) center / 22% 22% no-repeat,
                    conic-gradient(from 0deg, #1f1b18 0 25%, transparent 0 50%, #1f1b18 0 75%, transparent 0) top left / 16% 16% repeat,
                    var(--color-bg-elev)
                `,
            }}
            aria-label={value ? `QRコード: ${value}` : "QRコード"}
        >
            <div className="absolute -top-0.5 -left-0.5 size-[22%] border-4 border-[var(--color-ink)] bg-[var(--color-bg-elev)]" />
            <div className="absolute -top-0.5 -right-0.5 size-[22%] border-4 border-[var(--color-ink)] bg-[var(--color-bg-elev)]" />
        </div>
    );
}
