// Human-owned golden test. Do NOT modify in ralph-loop.
// WalletAccount: BIP-39 mnemonic + BIP-44 (m/44'/60'/0'/0/0) で account を扱う。
// パスワードで暗号化された mnemonic を IndexedDB に保存し、unlock で復号する。

import { describe, expect, it } from "vitest";
import {
    createWalletFromPassword,
    deriveAddressFromMnemonic,
    generateNewMnemonic,
    unlockWallet,
    type EncryptedPayload,
} from "@/lib/wallet/account";

const PASSWORD = "test-passphrase-12345";

// Foundry anvil / hardhat の標準テスト mnemonic（よく知られた既知の派生）
const ANVIL_MNEMONIC =
    "test test test test test test test test test test test junk";
const ANVIL_ACCOUNT_0_ADDRESS =
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("generateNewMnemonic", () => {
    it("12 単語の英語 mnemonic を返す", () => {
        const m = generateNewMnemonic();
        const words = m.split(" ");
        expect(words.length).toBe(12);
        words.forEach((w) => expect(w).toMatch(/^[a-z]+$/));
    });

    it("毎回違う mnemonic を生成する", () => {
        const a = generateNewMnemonic();
        const b = generateNewMnemonic();
        expect(a).not.toBe(b);
    });
});

describe("deriveAddressFromMnemonic", () => {
    it("BIP-44 m/44'/60'/0'/0/0 の address を返す (anvil test mnemonic で既知一致)", () => {
        const addr = deriveAddressFromMnemonic(ANVIL_MNEMONIC);
        expect(addr.toLowerCase()).toBe(ANVIL_ACCOUNT_0_ADDRESS.toLowerCase());
    });

    it("同じ mnemonic からは常に同じ address (決定的)", () => {
        const m = generateNewMnemonic();
        expect(deriveAddressFromMnemonic(m)).toBe(deriveAddressFromMnemonic(m));
    });

    it("checksum 形式 0x + 40 hex を返す", () => {
        const addr = deriveAddressFromMnemonic(ANVIL_MNEMONIC);
        expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
});

describe("createWalletFromPassword", () => {
    it("mnemonic + address + 暗号化 payload を返す", async () => {
        const w = await createWalletFromPassword(PASSWORD);
        expect(w.mnemonic.split(" ").length).toBe(12);
        expect(w.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
        expect(w.payload.version).toBe(1);
    });

    it("毎回違う mnemonic + address を生成", async () => {
        const a = await createWalletFromPassword(PASSWORD);
        const b = await createWalletFromPassword(PASSWORD);
        expect(a.mnemonic).not.toBe(b.mnemonic);
        expect(a.address).not.toBe(b.address);
    });

    it("生成した address は自身の mnemonic から derive した address と一致", async () => {
        const w = await createWalletFromPassword(PASSWORD);
        expect(w.address).toBe(deriveAddressFromMnemonic(w.mnemonic));
    });
});

describe("unlockWallet", () => {
    it("payload + 正しい password で元の mnemonic + address を復元", async () => {
        const created = await createWalletFromPassword(PASSWORD);
        const unlocked = await unlockWallet(created.payload, PASSWORD);
        expect(unlocked.mnemonic).toBe(created.mnemonic);
        expect(unlocked.address).toBe(created.address);
    });

    it("間違ったパスワードでは unlock 失敗", async () => {
        const created = await createWalletFromPassword(PASSWORD);
        await expect(unlockWallet(created.payload, "wrong")).rejects.toThrow();
    });

    it("JSON serialize 経由でも unlock 可能", async () => {
        const created = await createWalletFromPassword(PASSWORD);
        const restored = JSON.parse(JSON.stringify(created.payload)) as EncryptedPayload;
        const unlocked = await unlockWallet(restored, PASSWORD);
        expect(unlocked.address).toBe(created.address);
    });
});
