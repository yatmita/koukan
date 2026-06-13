import type { Account, Chain, PublicClient, Transport, WalletClient } from "viem";
import { parseAbiItem } from "viem";
import { koukanAbi, koukanVaultAbi, wkaiaAbi } from "@/abi";
import type { Address, KoukanTerminal, KoukanVaultState } from "@/lib/koukan-domain";

export interface OnChainKoukan extends KoukanVaultState {
    tokenId: bigint;
    vault: Address;
    createdAt: bigint;
}

const VAULT_CREATED_EVENT = parseAbiItem(
    "event VaultCreated(uint256 indexed tokenId, address indexed maker, address indexed counterparty, address vault, address offeredToken, uint256 offeredAmount, address wantedToken, uint256 wantedAmount)",
);
const FULFILLED_EVENT = parseAbiItem(
    "event Fulfilled(address indexed maker, address indexed counterparty, address offeredToken, uint256 offeredAmount, address wantedToken, uint256 wantedAmount)",
);
const WITHDRAWN_EVENT = parseAbiItem(
    "event Withdrawn(address indexed token, uint256 returnedAmount)",
);

export async function getKoukan(
    publicClient: PublicClient,
    factory: Address,
    tokenId: bigint,
    fromBlock: bigint,
): Promise<OnChainKoukan> {
    const vault = await publicClient.readContract({
        address: factory,
        abi: koukanAbi,
        functionName: "vaults",
        args: [tokenId],
    });

    const vaultFactory = await publicClient.readContract({
        address: vault,
        abi: koukanVaultAbi,
        functionName: "factory",
    });
    if (vaultFactory.toLowerCase() !== factory.toLowerCase()) {
        throw new Error(`Vault factory mismatch: expected ${factory}, got ${vaultFactory}`);
    }

    const [maker, counterparty, offeredToken, offeredAmount, wantedToken, wantedAmount, fulfilled, offerBalance] =
        await Promise.all([
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "maker" }),
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "counterparty" }),
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "offeredToken" }),
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "offeredAmount" }),
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "wantedToken" }),
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "wantedAmount" }),
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "fulfilled" }),
            publicClient.readContract({ address: vault, abi: koukanVaultAbi, functionName: "getOfferBalance" }),
        ]);

    let terminal: KoukanTerminal = "none";
    if (fulfilled) {
        const [fulfilledLogs, withdrawnLogs] = await Promise.all([
            publicClient.getLogs({
                address: vault,
                event: FULFILLED_EVENT,
                fromBlock,
                toBlock: "latest",
            }),
            publicClient.getLogs({
                address: vault,
                event: WITHDRAWN_EVENT,
                fromBlock,
                toBlock: "latest",
            }),
        ]);
        if (fulfilledLogs.length > 0) terminal = "fulfilled";
        else if (withdrawnLogs.length > 0) terminal = "withdrawn";
    }

    const vaultCreatedLogs = await publicClient.getLogs({
        address: factory,
        event: VAULT_CREATED_EVENT,
        args: { tokenId },
        fromBlock,
        toBlock: "latest",
    });

    let createdAt = 0n;
    if (vaultCreatedLogs.length > 0 && vaultCreatedLogs[0].blockNumber != null) {
        const block = await publicClient.getBlock({ blockNumber: vaultCreatedLogs[0].blockNumber });
        createdAt = block.timestamp;
    }

    return {
        tokenId,
        vault: vault as Address,
        maker: maker as Address,
        counterparty: counterparty as Address,
        offeredToken: offeredToken as Address,
        offeredAmount,
        wantedToken: wantedToken as Address,
        wantedAmount,
        fulfilled,
        offerBalance,
        terminal,
        createdAt,
    };
}

export async function listMyKoukanIds(
    publicClient: PublicClient,
    factory: Address,
    address: Address,
    fromBlock: bigint,
): Promise<{ proposed: bigint[]; received: bigint[] }> {
    const [proposedLogs, receivedLogs] = await Promise.all([
        publicClient.getLogs({
            address: factory,
            event: VAULT_CREATED_EVENT,
            args: { maker: address },
            fromBlock,
            toBlock: "latest",
        }),
        publicClient.getLogs({
            address: factory,
            event: VAULT_CREATED_EVENT,
            args: { counterparty: address },
            fromBlock,
            toBlock: "latest",
        }),
    ]);
    return {
        proposed: proposedLogs.map((log) => log.args.tokenId as bigint),
        received: receivedLogs.map((log) => log.args.tokenId as bigint),
    };
}

export async function createKoukan(
    walletClient: WalletClient<Transport, Chain, Account>,
    factory: Address,
    args: {
        counterparty: Address;
        offeredToken: Address;
        offeredAmount: bigint;
        wantedToken: Address;
        wantedAmount: bigint;
        mintFee: bigint;
    },
): Promise<`0x${string}`> {
    return walletClient.writeContract({
        address: factory,
        abi: koukanAbi,
        functionName: "create",
        args: [args.counterparty, args.offeredToken, args.offeredAmount, args.wantedToken, args.wantedAmount],
        value: args.mintFee,
    });
}

export async function depositKoukan(
    walletClient: WalletClient<Transport, Chain, Account>,
    vault: Address,
    opts: { nativeValue?: bigint },
): Promise<`0x${string}`> {
    return walletClient.writeContract({
        address: vault,
        abi: koukanVaultAbi,
        functionName: "deposit",
        value: opts.nativeValue,
    });
}

export async function withdrawKoukan(
    walletClient: WalletClient<Transport, Chain, Account>,
    vault: Address,
): Promise<`0x${string}`> {
    return walletClient.writeContract({
        address: vault,
        abi: koukanVaultAbi,
        functionName: "withdraw",
    });
}

export async function fulfillKoukan(
    walletClient: WalletClient<Transport, Chain, Account>,
    vault: Address,
): Promise<`0x${string}`> {
    return walletClient.writeContract({
        address: vault,
        abi: koukanVaultAbi,
        functionName: "fulfill",
    });
}

export async function verifyVaultFactory(
    publicClient: PublicClient,
    vault: Address,
    factory: Address,
): Promise<boolean> {
    const vaultFactory = await publicClient.readContract({
        address: vault,
        abi: koukanVaultAbi,
        functionName: "factory",
    });
    return vaultFactory.toLowerCase() === factory.toLowerCase();
}

export async function wrapNative(
    walletClient: WalletClient<Transport, Chain, Account>,
    wkaia: Address,
    amount: bigint,
): Promise<`0x${string}`> {
    return walletClient.writeContract({
        address: wkaia,
        abi: wkaiaAbi,
        functionName: "deposit",
        value: amount,
    });
}

export async function unwrapNative(
    walletClient: WalletClient<Transport, Chain, Account>,
    wkaia: Address,
    amount: bigint,
): Promise<`0x${string}`> {
    return walletClient.writeContract({
        address: wkaia,
        abi: wkaiaAbi,
        functionName: "withdraw",
        args: [amount],
    });
}
