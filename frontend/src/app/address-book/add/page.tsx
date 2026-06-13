"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { SessionGate } from "@/components/wallet/SessionGate";
import { addContact } from "@/lib/wallet/store";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function FieldLabel({ children }: { children: string }) {
    return (
        <div className="text-xs text-[var(--color-ink-2)] mb-1.5">{children}</div>
    );
}

function genId(): string {
    return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function AddContactForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit() {
        const trimmedName = name.trim();
        const trimmedAddr = address.trim();
        const trimmedNote = note.trim();
        if (trimmedName.length === 0) {
            setError("名前を入れてください");
            return;
        }
        if (!ADDRESS_RE.test(trimmedAddr)) {
            setError("アドレスは 0x から始まる 42 文字で入れてください");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await addContact({
                id: genId(),
                name: trimmedName,
                address: trimmedAddr,
                note: trimmedNote.length > 0 ? trimmedNote : undefined,
                createdAt: Date.now(),
            });
            router.push("/address-book/");
        } catch {
            setError("保存できませんでした");
            setSaving(false);
        }
    }

    return (
        <div className="px-4 pt-4 pb-6 space-y-4">
            <div>
                <FieldLabel>なまえ</FieldLabel>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="山田 みき など"
                    autoFocus
                    maxLength={30}
                    className="w-full h-13 rounded-xl px-4 text-lg border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)]"
                />
            </div>
            <div>
                <FieldLabel>アドレス</FieldLabel>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full h-13 rounded-xl px-4 text-sm border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                />
                <div className="mt-1.5 text-[11px] text-[var(--color-ink-3)]">
                    相手のホーム画面の「コピー」から貼り付けると確実です
                </div>
            </div>
            <div>
                <FieldLabel>メモ (任意)</FieldLabel>
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ピアノ月謝 など"
                    maxLength={50}
                    className="w-full h-13 rounded-xl px-4 text-base border-[1.5px] border-[var(--color-line-strong)] bg-transparent outline-none focus:border-[var(--color-ink-2)]"
                />
            </div>
            {error ? (
                <div className="text-sm text-[var(--color-status-pending)]">{error}</div>
            ) : null}
            <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSubmit}
                disabled={saving}
            >
                {saving ? "保存中…" : "保存する"}
            </Button>
        </div>
    );
}

export default function AddContactPage() {
    return (
        <Screen appBarTitle="住所録に追加" backHref="/address-book/">
            <SessionGate>{() => <AddContactForm />}</SessionGate>
        </Screen>
    );
}
