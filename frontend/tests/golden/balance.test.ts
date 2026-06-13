// Human-owned golden test. Do NOT modify in ralph-loop.
// Balance: wei (bigint) → 表示文字列のフォーマット。

import { describe, expect, it } from "vitest";
import { formatNativeBalance } from "@/lib/balance";

describe("formatNativeBalance", () => {
    it("0 wei → '0'", () => {
        expect(formatNativeBalance(0n)).toBe("0");
    });

    it("1 KAIA (1e18 wei) → '1'", () => {
        expect(formatNativeBalance(10n ** 18n)).toBe("1");
    });

    it("1.5 KAIA → '1.5'", () => {
        expect(formatNativeBalance(15n * 10n ** 17n)).toBe("1.5");
    });

    it("小数点以下は最大 4 桁まで (1.234567... → '1.2345')", () => {
        const wei = 1234567890123456789n; // 1.234567890123456789
        const result = formatNativeBalance(wei);
        expect(result).toBe("1.2345");
    });

    it("大きい数値も千区切りされる (1234 KAIA → '1,234')", () => {
        expect(formatNativeBalance(1234n * 10n ** 18n)).toBe("1,234");
    });

    it("末尾の 0 は省略 (1.50 → '1.5', 1.00 → '1')", () => {
        expect(formatNativeBalance(15n * 10n ** 17n)).toBe("1.5");
        expect(formatNativeBalance(10n ** 18n)).toBe("1");
    });
});
