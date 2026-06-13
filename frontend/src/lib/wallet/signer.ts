import type { Account, Chain, HttpTransport, WalletClient } from "viem";
import { createWalletClient, defineChain, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { loadEncryptedWallet } from "@/lib/wallet/store";
import { unlockWallet } from "@/lib/wallet/account";
import { getCurrentChainName, getChainConfig } from "@/lib/chain";

export type ActiveWallet = {
    walletClient: WalletClient<HttpTransport, Chain, Account>;
    address: `0x${string}`;
};

export async function createActiveWallet(password: string): Promise<ActiveWallet> {
    const payload = await loadEncryptedWallet();
    if (!payload) throw new Error("ウォレットが見つかりません");

    const { mnemonic, address } = await unlockWallet(payload, password);
    const account = mnemonicToAccount(mnemonic);

    const chainConfig = getChainConfig(getCurrentChainName());
    const viemChain = defineChain({
        id: chainConfig.id,
        name: chainConfig.label,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: [chainConfig.rpcUrl] } },
    });

    const walletClient = createWalletClient({
        account,
        chain: viemChain,
        transport: http(chainConfig.rpcUrl),
    });

    return { walletClient, address };
}
