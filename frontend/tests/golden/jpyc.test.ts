// Human-owned golden test. Do NOT modify in ralph-loop.
// JPYC (18 decimals ERC-20 mock) の wei ↔ 表示文字列の変換。

import { describe, expect, it } from "vitest";
import { formatJpyc, parseJpyc } from "@/lib/jpyc";

describe("formatJpyc (wei → 表示)", () => {
    it("0 wei → '0'", () => {
        expect(formatJpyc(0n)).toBe("0");
    });

    it("1 JPYC (1e18 wei) → '1'", () => {
        expect(formatJpyc(10n ** 18n)).toBe("1");
    });

    it("1234 JPYC → '1,234' (千区切り)", () => {
        expect(formatJpyc(1234n * 10n ** 18n)).toBe("1,234");
    });

    it("1.5 JPYC → '1.5' (小数あり)", () => {
        expect(formatJpyc(15n * 10n ** 17n)).toBe("1.5");
    });

    it("100,000 JPYC mint 直後の表示", () => {
        expect(formatJpyc(100_000n * 10n ** 18n)).toBe("100,000");
    });
});

describe("parseJpyc (表示 → wei)", () => {
    it("'1' → 1e18", () => {
        expect(parseJpyc("1")).toBe(10n ** 18n);
    });

    it("'1234' → 1234e18", () => {
        expect(parseJpyc("1234")).toBe(1234n * 10n ** 18n);
    });

    it("'1,234' (千区切り入力) → 1234e18", () => {
        expect(parseJpyc("1,234")).toBe(1234n * 10n ** 18n);
    });

    it("'1.5' → 1.5e18", () => {
        expect(parseJpyc("1.5")).toBe(15n * 10n ** 17n);
    });

    it("'0' → 0n", () => {
        expect(parseJpyc("0")).toBe(0n);
    });

    it("空文字 → 0n", () => {
        expect(parseJpyc("")).toBe(0n);
    });

    it("不正な文字列 → throw", () => {
        expect(() => parseJpyc("abc")).toThrow();
    });

    it("負数 → throw", () => {
        expect(() => parseJpyc("-1")).toThrow();
    });
});

describe("round trip", () => {
    it("format(parse('1234.5')) === '1,234.5'", () => {
        expect(formatJpyc(parseJpyc("1234.5"))).toBe("1,234.5");
    });
});
