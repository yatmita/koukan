// Human-owned golden test. Do NOT modify in ralph-loop.
// WalletSession: sessionStorage 経由で unlock 状態を表現する。

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    checkWalletStatus,
    clearSessionAddress,
    getSessionAddress,
    setSessionAddress,
} from "@/lib/wallet/session";
import {
    clearEncryptedWallet,
    saveEncryptedWallet,
    saveWalletAddress,
} from "@/lib/wallet/store";
import { encryptSecret } from "@/lib/wallet/crypto";

const SAMPLE_MNEMONIC =
    "test test test test test test test test test test test junk";
const SAMPLE_ADDRESS =
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const;
const OTHER_ADDRESS =
    "0x1111111111111111111111111111111111111111" as const;

async function resetEverything() {
    sessionStorage.clear();
    await clearEncryptedWallet();
}

describe("wallet/session", () => {
    beforeEach(async () => {
        await resetEverything();
    });
    afterEach(async () => {
        await resetEverything();
    });

    it("setSessionAddress / getSessionAddress の round trip", () => {
        expect(getSessionAddress()).toBeNull();
        setSessionAddress(SAMPLE_ADDRESS);
        expect(getSessionAddress()).toBe(SAMPLE_ADDRESS);
    });

    it("clearSessionAddress で null に戻る", () => {
        setSessionAddress(SAMPLE_ADDRESS);
        clearSessionAddress();
        expect(getSessionAddress()).toBeNull();
    });

    it("checkWalletStatus: wallet 無し → no-wallet", async () => {
        const status = await checkWalletStatus();
        expect(status).toBe("no-wallet");
    });

    it("checkWalletStatus: wallet あり + session 無し → locked", async () => {
        const payload = await encryptSecret(SAMPLE_MNEMONIC, "pw");
        await saveEncryptedWallet(payload);
        const status = await checkWalletStatus();
        expect(status).toBe("locked");
    });

    it("checkWalletStatus: wallet あり + session あり + IDB address 一致 → unlocked", async () => {
        const payload = await encryptSecret(SAMPLE_MNEMONIC, "pw");
        await saveEncryptedWallet(payload);
        await saveWalletAddress(SAMPLE_ADDRESS);
        setSessionAddress(SAMPLE_ADDRESS);
        const status = await checkWalletStatus();
        expect(status).toBe("unlocked");
    });

    it("checkWalletStatus: IDB address が session と不一致 → locked (タブ間 wallet 切替検出)", async () => {
        const payload = await encryptSecret(SAMPLE_MNEMONIC, "pw");
        await saveEncryptedWallet(payload);
        await saveWalletAddress(OTHER_ADDRESS); // 別 wallet に上書き
        setSessionAddress(SAMPLE_ADDRESS);
        const status = await checkWalletStatus();
        expect(status).toBe("locked");
    });

    it("checkWalletStatus: 旧 wallet (IDB address 保存なし) でも安全側に倒して locked", async () => {
        const payload = await encryptSecret(SAMPLE_MNEMONIC, "pw");
        await saveEncryptedWallet(payload);
        setSessionAddress(SAMPLE_ADDRESS); // IDB address なし
        const status = await checkWalletStatus();
        expect(status).toBe("locked");
    });

    it("getSessionAddress: sessionStorage に無効な値が入っていても null を返す", () => {
        sessionStorage.setItem("yakusoku.address", "not-an-address");
        expect(getSessionAddress()).toBeNull();
    });
});
