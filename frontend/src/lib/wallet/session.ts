import { loadEncryptedWallet, loadWalletAddress } from "./store";

export type WalletStatus = "no-wallet" | "locked" | "unlocked";

const SESSION_KEY = "yakusoku.address";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export function setSessionAddress(address: `0x${string}`): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(SESSION_KEY, address);
}

export function getSessionAddress(): `0x${string}` | null {
    if (typeof window === "undefined") return null;
    const value = sessionStorage.getItem(SESSION_KEY);
    if (value === null || !ADDRESS_RE.test(value)) return null;
    return value as `0x${string}`;
}

export function clearSessionAddress(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SESSION_KEY);
}

// checkWalletStatus は IDB と sessionStorage の整合性まで見る:
// - IDB に wallet が無い → no-wallet
// - IDB の公開 address (= wallet) と sessionStorage の address が一致 → unlocked
// - 不一致 (タブ間で IDB が上書きされた等) → locked (強制再 unlock)
// - IDB に address が保存されていない古い wallet → 安全側に倒して locked
export async function checkWalletStatus(): Promise<WalletStatus> {
    const payload = await loadEncryptedWallet();
    if (payload === null) return "no-wallet";

    const sessionAddr = getSessionAddress();
    if (sessionAddr === null) return "locked";

    const walletAddr = await loadWalletAddress();
    if (walletAddr === null) {
        // 旧 wallet (公開 address 保存されていない) → 整合性検証できないので
        // 一度ロックして unlock で再 sync
        clearSessionAddress();
        return "locked";
    }

    if (walletAddr.toLowerCase() !== sessionAddr.toLowerCase()) {
        // IDB が別 wallet に差し替わっている (タブ間競合)。
        // session を破棄し、再 unlock を強制。
        clearSessionAddress();
        return "locked";
    }

    return "unlocked";
}
