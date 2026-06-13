// アドレス帳の mock。Phase C で IndexedDB の contacts ストアに差し替え。

export type Contact = {
    id: string;
    name: string;
    address: string;
    note?: string;
    lastTouchedAt: string; // 表示用 "3日前" など
    knownForMonths?: number;
    initialGroup: "あ" | "か" | "さ" | "た" | "な" | "は" | "ま" | "や" | "ら" | "わ";
};

export const contacts: ReadonlyArray<Contact> = [
    {
        id: "c-yamada",
        name: "山田 みき",
        address: "0x9c2a000000000000000000000000000000014f7c",
        note: "ピアノ月謝",
        lastTouchedAt: "3日前",
        knownForMonths: 6,
        initialGroup: "や",
    },
    {
        id: "c-tanaka",
        name: "田中 けんと",
        address: "0x4a1d000000000000000000000000000000003b2e",
        note: "ランチ代の請求",
        lastTouchedAt: "昨日",
        initialGroup: "た",
    },
    {
        id: "c-suzuki",
        name: "鈴木 ひろし",
        address: "0x2f8d000000000000000000000000000000007e4a",
        note: "ご近所",
        lastTouchedAt: "先週",
        initialGroup: "さ",
    },
    {
        id: "c-sato",
        name: "佐藤 ひろみ",
        address: "0x66cb000000000000000000000000000000003a91",
        note: "プレゼント代",
        lastTouchedAt: "2か月前",
        initialGroup: "さ",
    },
    {
        id: "c-pta",
        name: "PTA 渡辺",
        address: "0xb13f000000000000000000000000000000002dcc",
        note: "クラス費",
        lastTouchedAt: "先月",
        initialGroup: "わ",
    },
    {
        id: "c-emi",
        name: "となりの えみ",
        address: "0x8a51000000000000000000000000000000001f6e",
        note: "おすそわけ",
        lastTouchedAt: "半年前",
        initialGroup: "た",
    },
    {
        id: "c-mutsuko",
        name: "茶道 むつこ",
        address: "0x33da00000000000000000000000000000000a712",
        note: "お稽古",
        lastTouchedAt: "1か月前",
        initialGroup: "た",
    },
    {
        id: "c-takahashi",
        name: "工務店 高橋",
        address: "0xfa20000000000000000000000000000000005c81",
        note: "リフォーム",
        lastTouchedAt: "3週間前",
        initialGroup: "た",
    },
];

export function findContactById(id: string): Contact | null {
    return contacts.find((c) => c.id === id) ?? null;
}

export function recentContacts(count = 6): ReadonlyArray<Contact> {
    return contacts.slice(0, count);
}
