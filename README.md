# koukan — 条件付き交換 SBT PoC

「条件付きの交換」を、スマートコントラクトに直接マッピングする実験。
**koukan = 個別・条件付きの交換箱**。Factory が交換ごとに **soulbound SBT**（ERC-5192）を mint し
専用 Vault を clone、maker が差し出す資産（offered）を deposit、counterparty が求める資産（wanted）で
**fulfill すると atomic swap** が成立する。maker は fulfill 前ならいつでも **withdraw** でき、
鍵は常に本人が握る（ノンカストディ）。

> ⚠️ これは概念実証（PoC）です。監査は受けておらず、本番資産での利用は想定していません。

姉妹コンセプト（請求書）は **[yatmita/yakusoku](https://github.com/yatmita/yakusoku)**。

## コントラクト

| ファイル | 役割 |
|---|---|
| `src/Koukan.sol` | 交換 Factory（soulbound ERC721 / ERC-5192）。create で SBT mint + Vault clone |
| `src/KoukanVault.sol` | 交換ごとの Vault（minimal proxy）。deposit / withdraw / fulfill |
| `src/MockWKAIA.sol` | テスト用 Wrapped native（WKAIA） |
| `src/MockJPYC.sol` | テスト用 ERC20（交換対象トークン） |

- counterparty 固定・1 度 fulfill すると失効
- Factory は impl 差替可、既存 Vault は作成時の impl に固定

## リポジトリ構成

```
src/        Solidity コントラクト
test/       Foundry テスト（golden tests + fork live test）
script/     デプロイ / セットアップスクリプト
frontend/   Next.js PWA（自前ウォレット内蔵クライアント）→ frontend/README.md
```

## セットアップ（コントラクト）

[Foundry](https://book.getfoundry.sh/) が必要。

```bash
forge install OpenZeppelin/openzeppelin-contracts@v5.6.1 --no-git
forge install foundry-rs/forge-std --no-git

forge build
forge test
```

## 動作確認

```bash
# ローカル golden tests（35 件）
forge test

# Kaia Kairos の本物のデプロイ済みコントラクトに対する fork test
cp .env.example .env   # KAIA_KAIROS_RPC_URL を設定
forge test --fork-url "$KAIA_KAIROS_RPC_URL" --match-path test/KoukanForkLive.t.sol -vv
```

Kairos デプロイ済みアドレス:

| コントラクト | アドレス |
|---|---|
| Koukan (factory) | `0xD8fFDB190892A37fc82851B38DeA40152c7caC66` |
| KoukanVault (impl) | `0x1c792b3396538aef0f545fBB2783c7A7a86E8B97` |
| MockJPYC | `0x7a85800020d4847b9760d5F09658Ede3972e7B18` |
| MockWKAIA | `0xc0F730fcf73Df864521B615494283754005bAC95` |

## デプロイ

```bash
cp .env.example .env   # PRIVATE_KEY / RPC を埋める

# Koukan (Factory + Vault impl) + Mock WKAIA
forge script script/DeployKoukan.s.sol --rpc-url kaia_kairos --broadcast
```

`rpc-url` を `polygon_amoy` / `kaia` 等に切り替えれば他チェーンにもデプロイできる
（`foundry.toml` の `[rpc_endpoints]` 参照）。

## フロントエンド

`frontend/` 配下の PWA。クローンしてすぐ Kairos テストネットに繋がる。

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev            # http://localhost:5173
```

詳細は [`frontend/README.md`](frontend/README.md)。

## 関連書籍

- [AInic Dialogs ステーブルコインと契約箱編](https://yatmita.com/books/ainic-dialogs-stablecoin)

## 開発メモ

- Solidity 0.8.28 / EVM cancun / OpenZeppelin Contracts 5.6.x（Clones / ReentrancyGuard / SafeERC20）
- フロント: Next.js 16 / React 19 / viem / 自前の自己管理ウォレット内蔵

## License

MIT
