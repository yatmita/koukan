#!/usr/bin/env bash
# 完成品質の一部（人間所有チェック）:
#   publicClient / chain 定義の重複生成がゼロであることを保証する。
#   - createPublicClient は src/lib/viem-client.ts のみ
#   - defineChain は src/lib/viem-client.ts と src/lib/wallet/signer.ts のみ
# どちらか違反したら exit 1。
set -euo pipefail

fail=0

dup_create="$(grep -rl 'createPublicClient' src | grep -vE 'src/lib/viem-client\.ts$' || true)"
if [ -n "$dup_create" ]; then
    echo "NG: createPublicClient が viem-client.ts 以外にあります:"
    echo "$dup_create"
    fail=1
fi

dup_define="$(grep -rl 'defineChain' src | grep -vE 'src/lib/viem-client\.ts$|src/lib/wallet/signer\.ts$' || true)"
if [ -n "$dup_define" ]; then
    echo "NG: defineChain が許可ファイル以外にあります:"
    echo "$dup_define"
    fail=1
fi

if [ "$fail" -eq 0 ]; then
    echo "OK: publicClient/chain の生成は一本化されています"
fi

exit "$fail"
