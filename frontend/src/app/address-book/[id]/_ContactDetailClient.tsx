"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Screen } from "@/components/layout/Screen";
import { SessionGate } from "@/components/wallet/SessionGate";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { listContacts, removeContact, type ContactRecord } from "@/lib/wallet/store";

function shortAddress(addr: string): string {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ContactDetail({ contact, onDeleted }: { contact: ContactRecord; onDeleted: () => void }) {
    const [copied, setCopied] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(contact.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // noop
        }
    }

    async function handleDelete() {
        setDeleting(true);
        await removeContact(contact.id);
        onDeleted();
    }

    return (
        <div className="px-4 pt-6 pb-6 space-y-5">
            <div className="flex flex-col items-center text-center">
                <Avatar name={contact.name} size="xl" />
                <div className="mt-3 text-xl font-bold">{contact.name}</div>
                <div
                    className="mt-1 text-xs text-[var(--color-ink-3)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {shortAddress(contact.address)}
                </div>
            </div>

            <section className="bg-[var(--color-bg-elev)] border border-[var(--color-line-strong)] rounded-2xl p-4 space-y-3">
                <div>
                    <div className="text-xs text-[var(--color-ink-2)] mb-1">アドレス (フル)</div>
                    <div
                        className="text-xs break-all"
                        style={{ fontFamily: "var(--font-mono)" }}
                    >
                        {contact.address}
                    </div>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="mt-2 text-xs text-[var(--color-accent-deep)] font-semibold active:opacity-70"
                    >
                        {copied ? "コピーしました" : "コピー"}
                    </button>
                </div>
                {contact.note ? (
                    <div className="pt-3 border-t border-[var(--color-line)]">
                        <div className="text-xs text-[var(--color-ink-2)] mb-1">メモ</div>
                        <div className="text-sm">{contact.note}</div>
                    </div>
                ) : null}
                <div className="pt-3 border-t border-[var(--color-line)] text-xs text-[var(--color-ink-3)]">
                    登録日: {new Date(contact.createdAt).toLocaleDateString("ja-JP")}
                </div>
            </section>

            <div className="space-y-2">
                <Link href={`/koukan/create/?to=${contact.id}`}>
                    <Button variant="primary" size="lg" fullWidth>
                        こうかんを始める
                    </Button>
                </Link>
            </div>

            <Button
                variant="danger"
                size="md"
                fullWidth
                onClick={() => setConfirmOpen(true)}
            >
                この連絡先を削除
            </Button>

            {confirmOpen ? (
                <ConfirmDialog
                    title="連絡先を削除しますか？"
                    body={`${contact.name} さんを住所録から削除します。やりとりの履歴 (こうかん) は残ります。`}
                    cancelLabel="やめる"
                    confirmLabel="削除"
                    confirmVariant="danger"
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={handleDelete}
                    loading={deleting}
                />
            ) : null}
        </div>
    );
}

function ContactDetailBody() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [contact, setContact] = useState<ContactRecord | null | undefined>(undefined);

    useEffect(() => {
        listContacts().then((list) => {
            setContact(list.find((c) => c.id === params.id) ?? null);
        });
    }, [params.id]);

    if (contact === undefined) {
        return <div className="px-6 pt-8 text-center text-sm text-[var(--color-ink-3)]">よみこんでいます…</div>;
    }
    if (contact === null) {
        return (
            <div className="px-6 pt-12 text-center text-sm text-[var(--color-ink-3)]">
                この連絡先は見つかりませんでした。
            </div>
        );
    }
    return <ContactDetail contact={contact} onDeleted={() => router.replace("/address-book/")} />;
}

export function ContactDetailClient() {
    return (
        <Screen appBarTitle="" backHref="/address-book/">
            <SessionGate>{() => <ContactDetailBody />}</SessionGate>
        </Screen>
    );
}
