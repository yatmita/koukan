// Human-owned golden test. Do NOT modify in ralph-loop.
// WalletStore: IndexedDB ラッパー (key / contacts / drafts)

import { afterEach, describe, expect, it } from "vitest";
import type { EncryptedPayload } from "@/lib/wallet/crypto";
import {
    saveEncryptedWallet,
    loadEncryptedWallet,
    clearEncryptedWallet,
    saveDisplayName,
    loadDisplayName,
    clearDisplayName,
    listContacts,
    addContact,
    removeContact,
    type ContactRecord,
} from "@/lib/wallet/store";

const FAKE_PAYLOAD: EncryptedPayload = {
    version: 1,
    cipherText: "AAAA",
    iv: "BBBB",
    salt: "CCCC",
    iterations: 200_000,
};

describe("WalletStore: encrypted wallet", () => {
    afterEach(async () => {
        await clearEncryptedWallet();
    });

    it("最初は wallet が無い (null)", async () => {
        const got = await loadEncryptedWallet();
        expect(got).toBeNull();
    });

    it("save → load で同じ payload が返る", async () => {
        await saveEncryptedWallet(FAKE_PAYLOAD);
        const got = await loadEncryptedWallet();
        expect(got).toEqual(FAKE_PAYLOAD);
    });

    it("save → clear → load で null になる", async () => {
        await saveEncryptedWallet(FAKE_PAYLOAD);
        await clearEncryptedWallet();
        const got = await loadEncryptedWallet();
        expect(got).toBeNull();
    });

    it("save で上書きできる (version 1 → 1 で payload 差し替え)", async () => {
        await saveEncryptedWallet(FAKE_PAYLOAD);
        const updated: EncryptedPayload = { ...FAKE_PAYLOAD, cipherText: "ZZZZ" };
        await saveEncryptedWallet(updated);
        const got = await loadEncryptedWallet();
        expect(got?.cipherText).toBe("ZZZZ");
    });
});

describe("WalletStore: display name", () => {
    afterEach(async () => {
        await clearDisplayName();
    });

    it("最初は名前が無い (null)", async () => {
        expect(await loadDisplayName()).toBeNull();
    });

    it("save → load で同じ名前が返る", async () => {
        await saveDisplayName("クロコ");
        expect(await loadDisplayName()).toBe("クロコ");
    });

    it("save → clear → load で null", async () => {
        await saveDisplayName("クロコ");
        await clearDisplayName();
        expect(await loadDisplayName()).toBeNull();
    });

    it("save で上書きできる", async () => {
        await saveDisplayName("古い名前");
        await saveDisplayName("新しい名前");
        expect(await loadDisplayName()).toBe("新しい名前");
    });
});

describe("WalletStore: contacts", () => {
    afterEach(async () => {
        const all = await listContacts();
        for (const c of all) await removeContact(c.id);
    });

    it("最初は contacts が空", async () => {
        const got = await listContacts();
        expect(got).toEqual([]);
    });

    it("add → list で 1 件、address と name が一致", async () => {
        await addContact({
            id: "c-1",
            name: "山田 みき",
            address: "0x9c2a000000000000000000000000000000014f7c",
            createdAt: 1_700_000_000_000,
        });
        const got = await listContacts();
        expect(got).toHaveLength(1);
        expect(got[0].name).toBe("山田 みき");
        expect(got[0].address).toBe("0x9c2a000000000000000000000000000000014f7c");
    });

    it("複数追加して全件が list で返る (順序は問わず)", async () => {
        const records: ContactRecord[] = [
            { id: "a", name: "佐藤", address: "0xaaaa", createdAt: 1 },
            { id: "b", name: "鈴木", address: "0xbbbb", createdAt: 2 },
            { id: "c", name: "田中", address: "0xcccc", createdAt: 3 },
        ];
        for (const r of records) await addContact(r);
        const got = await listContacts();
        expect(got).toHaveLength(3);
        const ids = got.map((g) => g.id).sort();
        expect(ids).toEqual(["a", "b", "c"]);
    });

    it("remove で削除できる", async () => {
        await addContact({
            id: "x",
            name: "X",
            address: "0xx",
            createdAt: 1,
        });
        await removeContact("x");
        const got = await listContacts();
        expect(got).toEqual([]);
    });

    it("同じ id で add すると上書きする", async () => {
        await addContact({
            id: "same",
            name: "old name",
            address: "0xold",
            createdAt: 1,
        });
        await addContact({
            id: "same",
            name: "new name",
            address: "0xnew",
            createdAt: 2,
        });
        const got = await listContacts();
        expect(got).toHaveLength(1);
        expect(got[0].name).toBe("new name");
        expect(got[0].address).toBe("0xnew");
    });
});
