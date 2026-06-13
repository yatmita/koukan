#!/usr/bin/env bash
# このリポジトリ root の out/ から ABI を frontend/src/abi/*.ts として書き出す。
# 使い方: cd frontend && pnpm sync-abi （= bash scripts/sync-abi.sh）
# コントラクトは同じリポジトリの root（frontend の親ディレクトリ）にある前提。

set -euo pipefail

export PATH="${HOME}/.foundry/bin:${PATH}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"   # = frontend/
FORGE_ROOT="$(cd "${REPO_ROOT}/.." && pwd)"     # = リポジトリ root (src/ と out/)
OUT_DIR="${FORGE_ROOT}/out"
ABI_DIR="${REPO_ROOT}/src/abi"

mkdir -p "${ABI_DIR}"

# 確実に最新の ABI が out/ にあるよう forge build を回す
echo "==> forge build (in ${FORGE_ROOT})"
(cd "${FORGE_ROOT}" && forge build)

# Contract 名 → 出力ファイル名 の対応
declare -A CONTRACTS=(
    ["Koukan"]="koukan"
    ["KoukanVault"]="koukanVault"
    ["MockWKAIA"]="wkaia"
    ["MockJPYC"]="mockJpyc"
)

for sol in "${!CONTRACTS[@]}"; do
    target="${CONTRACTS[$sol]}"
    src="${OUT_DIR}/${sol}.sol/${sol}.json"
    dst="${ABI_DIR}/${target}.ts"

    if [ ! -f "${src}" ]; then
        echo "WARN: ${src} not found, skipping"
        continue
    fi

    # ABI 配列だけを抜き出して as const で固定する
    abi_json="$(jq -c '.abi' "${src}")"
    cat > "${dst}" <<EOF
// AUTO-GENERATED from ${sol}.sol via scripts/sync-abi.sh
// Do not edit by hand.
export const ${target}Abi = ${abi_json} as const;
EOF
    echo "  -> ${dst}"
done

# barrel
{
    echo "// AUTO-GENERATED via scripts/sync-abi.sh"
    for sol in "${!CONTRACTS[@]}"; do
        target="${CONTRACTS[$sol]}"
        echo "export { ${target}Abi } from \"./${target}\";"
    done
} > "${ABI_DIR}/index.ts"
echo "  -> ${ABI_DIR}/index.ts"

echo "==> done"
