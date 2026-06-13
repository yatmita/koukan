import { createStore, del, entries, get, set } from "idb-keyval";
import type { EncryptedPayload } from "./crypto";

export type ContactRecord = {
    id: string;
    name: string;
    address: string;
    note?: string;
    createdAt: number; // unix ms
};

const walletStore = createStore("yakusoku-wallet", "wallet");
const profileStore = createStore("yakusoku-profile", "profile");
const contactStore = createStore("yakusoku-contacts", "contacts");

export async function saveEncryptedWallet(payload: EncryptedPayload): Promise<void> {
    await set("payload", payload, walletStore);
}

export async function loadEncryptedWallet(): Promise<EncryptedPayload | null> {
    const result = await get<EncryptedPayload>("payload", walletStore);
    return result ?? null;
}

export async function clearEncryptedWallet(): Promise<void> {
    await del("payload", walletStore);
    await del("address", walletStore);
}

// wallet を保存するときに公開 address も IDB に持つ。
// sessionStorage と乖離していないかを判定するため (タブ間で IDB が
// 上書きされたが sessionStorage には古い address が残るケースの検出)。
export async function saveWalletAddress(address: `0x${string}`): Promise<void> {
    await set("address", address, walletStore);
}

export async function loadWalletAddress(): Promise<`0x${string}` | null> {
    const result = await get<string>("address", walletStore);
    if (typeof result !== "string") return null;
    if (!/^0x[0-9a-fA-F]{40}$/.test(result)) return null;
    return result as `0x${string}`;
}

export async function saveDisplayName(name: string): Promise<void> {
    await set("displayName", name, profileStore);
}

export async function loadDisplayName(): Promise<string | null> {
    const result = await get<string>("displayName", profileStore);
    return result ?? null;
}

export async function clearDisplayName(): Promise<void> {
    await del("displayName", profileStore);
}

export async function listContacts(): Promise<ContactRecord[]> {
    const all = await entries<string, ContactRecord>(contactStore);
    return all.map(([, record]) => record);
}

export async function addContact(record: ContactRecord): Promise<void> {
    await set(record.id, record, contactStore);
}

export async function removeContact(id: string): Promise<void> {
    await del(id, contactStore);
}
