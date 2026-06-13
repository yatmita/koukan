"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/layout/Screen";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { BackupModal } from "@/components/settings/BackupModal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { clearDisplayName, clearEncryptedWallet } from "@/lib/wallet/store";
import { clearSessionAddress } from "@/lib/wallet/session";

function WalletSection({ onBackupClick }: { onBackupClick: () => void }) {
    return (
        <SettingsSection title="お財布">
            <SettingsRow icon="lock" label="パスワードの変更" />
            <SettingsRow icon="download" label="ふっかつのことばを表示" onClick={onBackupClick} />
            <SettingsRow icon="qr" label="あなたのアドレス・QR" isLast />
        </SettingsSection>
    );
}

function NetworkSection() {
    return (
        <SettingsSection title="つながるさき">
            <SettingsRow icon="globe" label="Kaia ネットワーク" rightLabel="ローカル" isLast />
        </SettingsSection>
    );
}

function DisplaySection() {
    return (
        <SettingsSection title="表示">
            <SettingsRow icon="globe" label="ことば" rightLabel="にほんご" isLast />
        </SettingsSection>
    );
}

function AboutSection() {
    return (
        <SettingsSection title="このアプリ">
            <SettingsRow icon="more" label="やくそく について" isLast />
        </SettingsSection>
    );
}

function ResetWalletSection() {
    const router = useRouter();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleReset() {
        setLoading(true);
        try {
            await clearEncryptedWallet();
            await clearDisplayName();
            clearSessionAddress();
            router.replace("/onboarding/");
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    }

    return (
        <>
            <SettingsSection title="危険な操作">
                <div className="px-3.5 py-3.5">
                    <Button
                        variant="danger"
                        size="md"
                        fullWidth
                        onClick={() => setConfirmOpen(true)}
                    >
                        お財布をリセット
                    </Button>
                </div>
            </SettingsSection>
            {confirmOpen ? (
                <ConfirmDialog
                    title="お財布をリセットしますか？"
                    body="この端末からパスワードと連絡先がすべて消えます。控えがないと、お財布を二度と取り戻せません。"
                    checkboxLabel="ふっかつのことば 12 単語を紙に控えてあります"
                    cancelLabel="やめる"
                    confirmLabel="リセット"
                    confirmVariant="danger"
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={handleReset}
                    loading={loading}
                />
            ) : null}
        </>
    );
}

function VersionFooter() {
    return (
        <div className="text-[11px] text-[var(--color-ink-3)] text-center mt-3">
            やくそく v0.1.0
        </div>
    );
}

export default function SettingsPage() {
    const [backupOpen, setBackupOpen] = useState(false);
    return (
        <Screen appBarTitle="設定" bottomNav="settings">
            <div className="px-4 pt-2 pb-6">
                <WalletSection onBackupClick={() => setBackupOpen(true)} />
                <NetworkSection />
                <DisplaySection />
                <AboutSection />
                <ResetWalletSection />
                <VersionFooter />
            </div>
            <BackupModal open={backupOpen} onClose={() => setBackupOpen(false)} />
        </Screen>
    );
}
