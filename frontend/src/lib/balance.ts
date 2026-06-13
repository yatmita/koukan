function formatWithCommas(n: bigint): string {
    const str = n.toString();
    if (str.length <= 3) return str;
    const parts: string[] = [];
    for (let i = str.length; i > 0; i -= 3) {
        parts.unshift(str.slice(Math.max(0, i - 3), i));
    }
    return parts.join(",");
}

const UNIT = BigInt("1000000000000000000"); // 10^18

export function formatNativeBalance(weiBigInt: bigint): string {
    const intPart = weiBigInt / UNIT;
    const decPart = weiBigInt % UNIT;

    const formattedInt = formatWithCommas(intPart);

    if (decPart === BigInt(0)) return formattedInt;

    const decStr = decPart.toString().padStart(18, "0");
    const truncDec = decStr.slice(0, 4).replace(/0+$/, "");

    if (truncDec === "") return formattedInt;
    return `${formattedInt}.${truncDec}`;
}

