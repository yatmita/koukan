import { KoukanDetailClient } from "./_KoukanDetailClient";

// output: export では generateStaticParams が空配列だと build エラーになる。
// tokenId は実行時にしか分からないのでプレースホルダーを 1 件返す。
// 実際のルーティングは _KoukanDetailClient が useParams() で処理する。
export async function generateStaticParams() {
    return [{ id: "0" }];
}

export default function KoukanDetailPage() {
    return <KoukanDetailClient />;
}
