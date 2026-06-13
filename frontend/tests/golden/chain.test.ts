// Human-owned golden test. Do NOT modify in ralph-loop.
// ChainConfig: local / kairos / kaia の切替と viem chain object 生成。

import { describe, expect, it } from "vitest";
import {
    getChainConfig,
    listChains,
    type ChainName,
} from "@/lib/chain";

describe("ChainConfig", () => {
    it("listChains() は local / kairos / kaia の 3 種類を返す", () => {
        const all = listChains();
        const names = all.map((c) => c.name).sort();
        expect(names).toEqual(["kaia", "kairos", "local"]);
    });

    it("local は chainId 31337 で http://localhost:8545 を指す", () => {
        const c = getChainConfig("local");
        expect(c.id).toBe(31337);
        expect(c.rpcUrl).toMatch(/^https?:\/\/.*:8545/);
    });

    it("kairos は chainId 1001 で Kaia Kairos の RPC を指す", () => {
        const c = getChainConfig("kairos");
        expect(c.id).toBe(1001);
        expect(c.rpcUrl).toContain("kairos");
    });

    it("kaia は chainId 8217 で Kaia mainnet の RPC を指す", () => {
        const c = getChainConfig("kaia");
        expect(c.id).toBe(8217);
        // mainnet なので "kairos" は含まない、"node.kaia.io" を指す
        expect(c.rpcUrl).not.toContain("kairos");
        expect(c.rpcUrl).toContain("kaia");
    });

    it("各 chain は label (日本語表示用) を持つ", () => {
        const local = getChainConfig("local");
        const kairos = getChainConfig("kairos");
        const kaia = getChainConfig("kaia");
        expect(local.label).toBeTruthy();
        expect(kairos.label).toBeTruthy();
        expect(kaia.label).toBeTruthy();
    });

    it("各 chain は invoiceAddress / koukanAddress (string) を持つ", () => {
        // .env に address が入っていなければ空文字 ("")。型としては string であること。
        const c: ReturnType<typeof getChainConfig> = getChainConfig("local");
        expect(typeof c.invoiceAddress).toBe("string");
        expect(typeof c.koukanAddress).toBe("string");
    });

    it("invalid な ChainName を渡すと型エラー (compile time)", () => {
        // 型システム側でカバーされていればよい。runtime test 不要。
        const valid: ChainName[] = ["local", "kairos", "kaia"];
        expect(valid).toContain("local");
    });
});
