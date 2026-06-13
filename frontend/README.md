# koukan frontend — 交換 PWA クライアント

このリポジトリの `Koukan` / `KoukanVault` コントラクト（民法 586 条 交換 / 条件付き交換 SBT）を
人間が触るための Next.js 製 PWA。**自前の自己管理ウォレットを内蔵**する（mnemonic をブラウザ内で
生成・暗号化保存し、署名もブラウザで完結。外部ウォレット拡張は不要）。

> ⚠️ 概念実証（PoC）です。本番資産での利用は想定していません。

## クイックスタート（Kairos testnet・すぐ動く）

```bash
cp .env.example .env.local      # 既定で Kaia Kairos testnet の deploy 済み Koukan に接続
pnpm install
pnpm dev                        # http://localhost:5173
```

ブラウザで開くとオンボーディングでウォレットが作られ、こうかん（条件付き交換）の提案・成立・
取消を触れる。ネイティブ KAIA ⇄ WKAIA の wrap/unwrap 補助画面もある。テストネット用の KAIA は
[Kaia faucet](https://faucet.kaia.io/) で入手できる。

> `pnpm dev` 時は `next.config.ts` の rewrites が `/rpc-kairos/` を公開 Kairos ノードへ
> same-origin proxy する（公開ノードの CORS preflight 回避のため）。

## ローカル anvil で動かす

```bash
# 1) 別ターミナルで anvil を起動
anvil

# 2) リポジトリ root（frontend の親）で deploy（出力アドレスを控える）
cd .. && forge script script/DeployKoukan.s.sol --rpc-url http://localhost:8545 --broadcast

# 3) frontend/.env.local の NEXT_PUBLIC_*_ADDR_LOCAL に控えたアドレスを記入し、
#    NEXT_PUBLIC_CHAIN=local に変更して pnpm dev
```

## スクリプト

```bash
pnpm dev        # 開発サーバー (port 5173)
pnpm build      # 静的 export ビルド
pnpm test       # vitest（ウォレット暗号 / ドメインロジックの golden test）
pnpm lint       # eslint
pnpm sync-abi   # ABI 再生成（このリポジトリ root の out/ から）
```

ABI（`src/abi/*.ts`）は同梱済みなので、ビルド・実行に追加の手順は不要。`sync-abi` は
コントラクトを変更したとき ABI を再生成する保守用ツール。

## スタック

- Next.js 16 (App Router) / React 19 / TypeScript
- [viem](https://viem.sh/) — チェーン RPC / 署名
- zustand / @tanstack/react-query — 状態管理
- Serwist — Service Worker / PWA
- Tailwind CSS v4

## 構成

```
src/app/         画面（home / koukan(交換・wrap) / address-book / settings / onboarding）
src/components/  UI コンポーネント
src/hooks/       コントラクト読み書きフック
src/lib/         チェーン設定・ドメインロジック・自前ウォレット（wallet/）
src/abi/         コントラクト ABI（同梱）
tests/           vitest golden tests
```

ウォレットの秘密鍵・mnemonic はブラウザの IndexedDB に暗号化して保存され、サーバーには
送信されない。

## License

MIT
