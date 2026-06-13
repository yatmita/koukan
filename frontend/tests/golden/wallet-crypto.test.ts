// Human-owned golden test. Do NOT modify in ralph-loop.
// WalletCrypto: WebCrypto AES-GCM + PBKDF2 で任意の string を暗号化・復号する。

import { describe, expect, it } from "vitest";
import {
    encryptSecret,
    decryptSecret,
    type EncryptedPayload,
} from "@/lib/wallet/crypto";

const SAMPLE_MNEMONIC =
    "test test test test test test test test test test test junk" as const;
const PASSWORD = "P@ssw0rd-yakusoku";

describe("encryptSecret / decryptSecret", () => {
    it("encrypt → decrypt で元の secret に戻る", async () => {
        const enc = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        const got = await decryptSecret(enc, PASSWORD);
        expect(got).toBe(SAMPLE_MNEMONIC);
    });

    it("間違ったパスワードでは復号に失敗 (throw)", async () => {
        const enc = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        await expect(decryptSecret(enc, "wrong-password")).rejects.toThrow();
    });

    it("同じ secret + 同じ password でも、毎回違う ciphertext (iv/salt がランダム)", async () => {
        const a = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        const b = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        expect(a.cipherText).not.toBe(b.cipherText);
        expect(a.iv).not.toBe(b.iv);
        expect(a.salt).not.toBe(b.salt);
    });

    it("EncryptedPayload は JSON serialize 可能で、再 parse 後も復号できる", async () => {
        const enc = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        const json = JSON.stringify(enc);
        const restored = JSON.parse(json) as EncryptedPayload;
        const got = await decryptSecret(restored, PASSWORD);
        expect(got).toBe(SAMPLE_MNEMONIC);
    });

    it("EncryptedPayload は version: 1 を含む", async () => {
        const enc = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        expect(enc.version).toBe(1);
    });

    it("EncryptedPayload は base64 文字列 (cipherText / iv / salt) を含む", async () => {
        const enc = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        const b64 = /^[A-Za-z0-9+/=]+$/;
        expect(enc.cipherText).toMatch(b64);
        expect(enc.iv).toMatch(b64);
        expect(enc.salt).toMatch(b64);
    });

    it("PBKDF2 iterations は 100,000 以上", async () => {
        const enc = await encryptSecret(SAMPLE_MNEMONIC, PASSWORD);
        expect(enc.iterations).toBeGreaterThanOrEqual(100_000);
    });
});
