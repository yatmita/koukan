// Human-owned golden test. Do NOT modify in ralph-loop.
// mnemonic 復元のための validate + 復元処理。

import { describe, expect, it } from "vitest";
import {
    normalizeMnemonic,
    validateMnemonic,
    recoverWalletFromMnemonic,
} from "@/lib/wallet/recover";

const ANVIL_MNEMONIC = "test test test test test test test test test test test junk";
const ANVIL_ACCOUNT_0 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("normalizeMnemonic", () => {
    it("前後の空白を削る", () => {
        expect(normalizeMnemonic("  abc def  ")).toBe("abc def");
    });
    it("連続空白を単一スペースに", () => {
        expect(normalizeMnemonic("a    b\tc\nd")).toBe("a b c d");
    });
    it("大文字を小文字化", () => {
        expect(normalizeMnemonic("TeST Test")).toBe("test test");
    });
    it("番号付き (1 word 2 word ...) は番号 token を除去", () => {
        expect(
            normalizeMnemonic("1 garbage 2 refuse 3 mistake"),
        ).toBe("garbage refuse mistake");
    });
    it("番号にピリオドや括弧があっても除去 (1. word / 1) word)", () => {
        expect(normalizeMnemonic("1. abc 2. def 3) ghi")).toBe("abc def ghi");
    });
    it("改行込みの番号付きでもまとめて normalize", () => {
        const input = `1
garbage
2
refuse
3
mistake`;
        expect(normalizeMnemonic(input)).toBe("garbage refuse mistake");
    });
});

describe("validateMnemonic", () => {
    it("anvil 標準 mnemonic → true", () => {
        expect(validateMnemonic(ANVIL_MNEMONIC)).toBe(true);
    });
    it("大文字 + 余分な空白でも true (normalize 後)", () => {
        expect(validateMnemonic("  TEST  test   test test test test test test test test test junk")).toBe(true);
    });
    it("12 単語未満 → false", () => {
        expect(validateMnemonic("test test test")).toBe(false);
    });
    it("13 単語 → false (12 でも 24 でもない)", () => {
        expect(validateMnemonic("test test test test test test test test test test test test test")).toBe(false);
    });
    it("英語 wordlist に無い単語が含まれる → false", () => {
        expect(validateMnemonic("xxxxxx test test test test test test test test test test junk")).toBe(false);
    });
    it("空文字 → false", () => {
        expect(validateMnemonic("")).toBe(false);
    });
});

describe("recoverWalletFromMnemonic", () => {
    it("anvil mnemonic から既知 address に復元できる", async () => {
        const w = await recoverWalletFromMnemonic(ANVIL_MNEMONIC, "pw12345678");
        expect(w.address.toLowerCase()).toBe(ANVIL_ACCOUNT_0.toLowerCase());
        expect(w.mnemonic).toBe(ANVIL_MNEMONIC);
        expect(w.payload.version).toBe(1);
    });

    it("同じ mnemonic を別 password で復元しても address は同じ", async () => {
        const a = await recoverWalletFromMnemonic(ANVIL_MNEMONIC, "pw1");
        const b = await recoverWalletFromMnemonic(ANVIL_MNEMONIC, "pw2");
        expect(a.address).toBe(b.address);
        // 暗号化は password ごとに異なる
        expect(a.payload.cipherText).not.toBe(b.payload.cipherText);
    });

    it("不正な mnemonic は throw", async () => {
        await expect(
            recoverWalletFromMnemonic("invalid mnemonic here please fail", "pw"),
        ).rejects.toThrow();
    });
});
