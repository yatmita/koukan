import { ContactDetailClient } from "./_ContactDetailClient";

// output: export では generateStaticParams が空配列だと build エラーになる。
// contact ID は実行時にしか分からないのでプレースホルダーを 1 件返す。
// 実際のルーティングは _ContactDetailClient が useParams() で処理する。
export async function generateStaticParams() {
    return [{ id: "0" }];
}

export default function ContactDetailPage() {
    return <ContactDetailClient />;
}
