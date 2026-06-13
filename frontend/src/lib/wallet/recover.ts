import { english, mnemonicToAccount } from "viem/accounts";
import { encryptSecret } from "./crypto";
import type { CreatedWallet } from "./account";

// 注意: viem は mnemonic の BIP-39 checksum を検証しない。
// @scure/bip39 を pnpm store の制約で直接追加できなかったので、
// 「english wordlist に全単語が含まれる + 12 単語」だけを確認する弱い検証。
// 検証通過後に address を画面で見せて、ユーザーに「期待した address か」を
// 目で確認させる二段構えで運用する。
const ENGLISH_WORDS: ReadonlySet<string> = new Set(english);

// 「1 garbage 2 refuse ...」のように番号付きで貼られたケースに対応するため、
// 数字 token (1, 12, 1., 1) を除去してから連結する。
export function normalizeMnemonic(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0 && !/^\d+[.)]?$/.test(w))
        .join(" ");
}

export function validateMnemonic(input: string): boolean {
    const normalized = normalizeMnemonic(input);
    if (normalized === "") return false;
    const words = normalized.split(" ");
    if (words.length !== 12 && words.length !== 24) return false;
    return words.every((w) => ENGLISH_WORDS.has(w));
}

// 復元: mnemonic + password から CreatedWallet を再生成する。
// createWalletFromPassword (新規) と違い generateMnemonic ではなく
// ユーザー入力の mnemonic を使う。
export async function recoverWalletFromMnemonic(
    mnemonicInput: string,
    password: string,
): Promise<CreatedWallet> {
    const mnemonic = normalizeMnemonic(mnemonicInput);
    if (!validateMnemonic(mnemonic)) {
        throw new Error("ふっかつのことばが正しくありません");
    }
    const address = mnemonicToAccount(mnemonic).address;
    const payload = await encryptSecret(mnemonic, password);
    return { mnemonic, address, payload };
}
