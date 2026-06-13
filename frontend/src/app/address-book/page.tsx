"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Screen } from "@/components/layout/Screen";
import { ContactList } from "@/components/address-book/ContactList";
import { Icon } from "@/components/ui/Icon";
import { SessionGate } from "@/components/wallet/SessionGate";
import { listContacts, type ContactRecord } from "@/lib/wallet/store";

function AddFab() {
    return (
        <Link
            href="/address-book/add/"
            aria-label="連絡先を追加"
            className="fixed right-4 bottom-[88px] z-30 size-14 rounded-full bg-[var(--color-accent)] text-white shadow-lg flex items-center justify-center active:opacity-80"
        >
            <Icon kind="plus" size={28} color="#fff" />
        </Link>
    );
}

function AddressBookBody() {
    const [contacts, setContacts] = useState<ContactRecord[] | null>(null);

    useEffect(() => {
        listContacts().then(setContacts);
    }, []);

    if (contacts === null) {
        return (
            <div className="px-6 pt-8 text-center text-sm text-[var(--color-ink-3)]">
                よみこんでいます…
            </div>
        );
    }

    return (
        <>
            <ContactList contacts={contacts} />
            <AddFab />
        </>
    );
}

export default function AddressBookPage() {
    return (
        <Screen appBarTitle="住所録" bottomNav="book">
            <SessionGate>{() => <AddressBookBody />}</SessionGate>
        </Screen>
    );
}
