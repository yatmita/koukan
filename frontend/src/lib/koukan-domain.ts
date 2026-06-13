export type Address = `0x${string}`;
export type KoukanTerminal = "none" | "fulfilled" | "withdrawn";

export interface KoukanVaultState {
    maker: Address;
    counterparty: Address;
    offeredToken: Address;
    offeredAmount: bigint;
    wantedToken: Address;
    wantedAmount: bigint;
    fulfilled: boolean;
    offerBalance: bigint;
    terminal: KoukanTerminal;
}

export type KoukanStatus = "offer_draft" | "offer_open" | "completed" | "cancelled";
export type KoukanRole = "proposed" | "received" | "unrelated";
export type KoukanAction = "deposit" | "withdraw" | "fulfill";

export function deriveKoukanStatus(s: KoukanVaultState): KoukanStatus {
    if (!s.fulfilled) {
        return s.offerBalance >= s.offeredAmount ? "offer_open" : "offer_draft";
    }
    if (s.terminal === "fulfilled") return "completed";
    if (s.terminal === "withdrawn") return "cancelled";
    throw new Error("fulfilled=true but terminal='none': I/O layer failed to resolve logs");
}

export function koukanRole(
    parties: { maker: Address; counterparty: Address },
    viewer: Address,
): KoukanRole {
    const v = viewer.toLowerCase();
    if (parties.maker.toLowerCase() === v) return "proposed";
    if (parties.counterparty.toLowerCase() === v) return "received";
    return "unrelated";
}

export function availableActions(s: KoukanVaultState, viewer: Address): KoukanAction[] {
    const role = koukanRole({ maker: s.maker, counterparty: s.counterparty }, viewer);
    const status = deriveKoukanStatus(s);

    if (role === "proposed") {
        if (status === "offer_draft") return ["deposit", "withdraw"];
        if (status === "offer_open") return ["withdraw"];
        return [];
    }
    if (role === "received") {
        if (status === "offer_open") return ["fulfill"];
        return [];
    }
    return [];
}

export function isListedStatus(status: KoukanStatus): boolean {
    return status !== "cancelled";
}
