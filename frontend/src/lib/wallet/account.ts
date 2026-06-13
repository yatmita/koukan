import { english, generateMnemonic, mnemonicToAccount } from "viem/accounts";
import { decryptSecret, encryptSecret } from "./crypto";
import type { EncryptedPayload } from "./crypto";

export type { EncryptedPayload } from "./crypto";

export type CreatedWallet = {
    mnemonic: string;
    address: `0x${string}`;
    payload: EncryptedPayload;
};

export type UnlockedWallet = {
    mnemonic: string;
    address: `0x${string}`;
};

export function generateNewMnemonic(): string {
    return generateMnemonic(english);
}

export function deriveAddressFromMnemonic(mnemonic: string): `0x${string}` {
    return mnemonicToAccount(mnemonic).address;
}

export async function createWalletFromPassword(password: string): Promise<CreatedWallet> {
    const mnemonic = generateNewMnemonic();
    const address = deriveAddressFromMnemonic(mnemonic);
    const payload = await encryptSecret(mnemonic, password);
    return { mnemonic, address, payload };
}

export async function unlockWallet(
    payload: EncryptedPayload,
    password: string,
): Promise<UnlockedWallet> {
    const mnemonic = await decryptSecret(payload, password);
    const address = deriveAddressFromMnemonic(mnemonic);
    return { mnemonic, address };
}
