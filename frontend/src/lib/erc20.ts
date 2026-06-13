import type { Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { mockJpycAbi } from "@/abi/mockJpyc";

export async function erc20BalanceOf(
    publicClient: PublicClient,
    tokenAddress: `0x${string}`,
    owner: `0x${string}`,
): Promise<bigint> {
    return publicClient.readContract({
        address: tokenAddress,
        abi: mockJpycAbi,
        functionName: "balanceOf",
        args: [owner],
    });
}

export async function erc20Allowance(
    publicClient: PublicClient,
    tokenAddress: `0x${string}`,
    owner: `0x${string}`,
    spender: `0x${string}`,
): Promise<bigint> {
    return publicClient.readContract({
        address: tokenAddress,
        abi: mockJpycAbi,
        functionName: "allowance",
        args: [owner, spender],
    });
}

export async function erc20Approve(
    walletClient: WalletClient<Transport, Chain, Account>,
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amount: bigint,
): Promise<`0x${string}`> {
    return walletClient.writeContract({
        address: tokenAddress,
        abi: mockJpycAbi,
        functionName: "approve",
        args: [spender, amount],
    });
}
