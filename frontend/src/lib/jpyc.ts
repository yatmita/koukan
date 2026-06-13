const UNIT = 10n ** 18n;

function formatWithCommas(n: bigint): string {
    const str = n.toString();
    if (str.length <= 3) return str;
    const parts: string[] = [];
    for (let i = str.length; i > 0; i -= 3) {
        parts.unshift(str.slice(Math.max(0, i - 3), i));
    }
    return parts.join(",");
}

export function formatJpyc(wei: bigint): string {
    const intPart = wei / UNIT;
    const decPart = wei % UNIT;
    const formattedInt = formatWithCommas(intPart);
    if (decPart === 0n) return formattedInt;
    const decStr = decPart.toString().padStart(18, "0").replace(/0+$/, "");
    return `${formattedInt}.${decStr}`;
}

export function parseJpyc(input: string): bigint {
    if (input === "") return 0n;
    const cleaned = input.replace(/,/g, "");
    if (!/^\d+(\.\d+)?$/.test(cleaned)) {
        throw new Error(`Invalid JPYC amount: "${input}"`);
    }
    const dotIdx = cleaned.indexOf(".");
    if (dotIdx === -1) {
        return BigInt(cleaned) * UNIT;
    }
    const intStr = cleaned.slice(0, dotIdx) || "0";
    const decStr = cleaned.slice(dotIdx + 1);
    if (decStr.length > 18) throw new Error("Too many decimals");
    return BigInt(intStr) * UNIT + BigInt(decStr.padEnd(18, "0"));
}
