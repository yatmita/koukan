// Human-owned golden test. Do NOT modify in ralph-loop.
// Koukan ドメインロジック: 状態導出 (S0-S3) + 役割判定 + 可能アクション + 一覧表示可否。
// 仕様の根拠: koukan-frontend-spec.md §3,§5 と KoukanVault.sol。
//
// 注意: ここで固定するのは「契約状態 → UI ロジック」の純粋な写像のみ。
// UI 文言・金額表示・CTA ラベルは別レイヤー（spec §9, 未確定）なので golden には入れない。

import { describe, expect, it } from "vitest";
import {
    deriveKoukanStatus,
    koukanRole,
    availableActions,
    isListedStatus,
    type KoukanStatus,
    type KoukanRole,
    type KoukanVaultState,
} from "@/lib/koukan-domain";

const A = "0xAAAAaaaaAAAAaaaaAAAAaaaaAAAAaaaaAAAAaaaa" as const; // maker
const B = "0xBBBBbbbbBBBBbbbbBBBBbbbbBBBBbbbbBBBBbbbb" as const; // counterparty
const C = "0xCCCCccccCCCCccccCCCCccccCCCCccccCCCCcccc" as const; // 無関係
const JPYC = "0x1111111111111111111111111111111111111111" as const;
const NATIVE = "0x0000000000000000000000000000000000000000" as const;

// テスト用の vault state ファクトリ。offered=NATIVE(1000), wanted=JPYC(5000) を既定に。
function vault(over: Partial<KoukanVaultState> = {}): KoukanVaultState {
    return {
        maker: A,
        counterparty: B,
        offeredToken: NATIVE,
        offeredAmount: 1000n,
        wantedToken: JPYC,
        wantedAmount: 5000n,
        fulfilled: false,
        offerBalance: 0n,
        terminal: "none",
        ...over,
    };
}

describe("deriveKoukanStatus", () => {
    it("S0 未入金: !fulfilled かつ offerBalance < offeredAmount → 'offer_draft'", () => {
        const s: KoukanStatus = deriveKoukanStatus(vault({ offerBalance: 0n }));
        expect(s).toBe("offer_draft");
    });

    it("S0 境界: offerBalance が offeredAmount を 1 下回る → 'offer_draft'", () => {
        expect(deriveKoukanStatus(vault({ offerBalance: 999n }))).toBe("offer_draft");
    });

    it("S1 入金済: offerBalance == offeredAmount (ちょうど) → 'offer_open'", () => {
        expect(deriveKoukanStatus(vault({ offerBalance: 1000n }))).toBe("offer_open");
    });

    it("S1 入金済: offerBalance > offeredAmount (誤送付で超過) → 'offer_open'", () => {
        expect(deriveKoukanStatus(vault({ offerBalance: 1500n }))).toBe("offer_open");
    });

    it("S2 完了: fulfilled かつ Fulfilled ログ → 'completed'", () => {
        expect(
            deriveKoukanStatus(
                vault({ fulfilled: true, terminal: "fulfilled", offerBalance: 0n }),
            ),
        ).toBe("completed");
    });

    it("S3 取下げ: fulfilled かつ Withdrawn ログ → 'cancelled'", () => {
        expect(
            deriveKoukanStatus(
                vault({ fulfilled: true, terminal: "withdrawn", offerBalance: 0n }),
            ),
        ).toBe("cancelled");
    });

    it("異常系: fulfilled なのに terminal 未解決('none') は throw (I/O 層がログ解決を怠ったバグ)", () => {
        expect(() =>
            deriveKoukanStatus(vault({ fulfilled: true, terminal: "none" })),
        ).toThrow();
    });
});

describe("koukanRole", () => {
    it("自分が maker → 'proposed'", () => {
        const r: KoukanRole = koukanRole({ maker: A, counterparty: B }, A);
        expect(r).toBe("proposed");
    });

    it("自分が counterparty → 'received'", () => {
        expect(koukanRole({ maker: A, counterparty: B }, B)).toBe("received");
    });

    it("どちらでもない → 'unrelated'", () => {
        expect(koukanRole({ maker: A, counterparty: B }, C)).toBe("unrelated");
    });

    it("checksum 大小ばらつきに依存しない", () => {
        const aLower = A.toLowerCase() as `0x${string}`;
        expect(koukanRole({ maker: aLower, counterparty: B }, A)).toBe("proposed");
    });
});

describe("isListedStatus", () => {
    it("cancelled は一覧に出さない", () => {
        expect(isListedStatus("cancelled")).toBe(false);
    });
    it("offer_draft / offer_open / completed は一覧に出す", () => {
        expect(isListedStatus("offer_draft")).toBe(true);
        expect(isListedStatus("offer_open")).toBe(true);
        expect(isListedStatus("completed")).toBe(true);
    });
});

describe("availableActions — maker(proposed)", () => {
    it("S0 未入金: deposit(資金投入) と withdraw(取り下げ) が可能", () => {
        const actions = availableActions(vault({ offerBalance: 0n }), A);
        expect(actions).toEqual(expect.arrayContaining(["deposit", "withdraw"]));
        expect(actions).toHaveLength(2);
    });

    it("S1 入金済: deposit は不可(二重入金 revert)、withdraw のみ可", () => {
        expect(availableActions(vault({ offerBalance: 1000n }), A)).toEqual([
            "withdraw",
        ]);
    });

    it("S2 完了: アクション無し", () => {
        expect(
            availableActions(
                vault({ fulfilled: true, terminal: "fulfilled" }),
                A,
            ),
        ).toEqual([]);
    });

    it("S3 取下げ: アクション無し", () => {
        expect(
            availableActions(vault({ fulfilled: true, terminal: "withdrawn" }), A),
        ).toEqual([]);
    });
});

describe("availableActions — counterparty(received)", () => {
    it("S0 未入金: fulfill 不可(残高不足で revert する)", () => {
        expect(availableActions(vault({ offerBalance: 0n }), B)).toEqual([]);
    });

    it("S1 入金済: fulfill のみ可", () => {
        expect(availableActions(vault({ offerBalance: 1000n }), B)).toEqual([
            "fulfill",
        ]);
    });

    it("S2 完了: アクション無し", () => {
        expect(
            availableActions(
                vault({ fulfilled: true, terminal: "fulfilled" }),
                B,
            ),
        ).toEqual([]);
    });
});

describe("availableActions — unrelated", () => {
    it("無関係な第三者はどの状態でもアクション無し", () => {
        expect(availableActions(vault({ offerBalance: 1000n }), C)).toEqual([]);
        expect(
            availableActions(
                vault({ fulfilled: true, terminal: "fulfilled" }),
                C,
            ),
        ).toEqual([]);
    });
});
