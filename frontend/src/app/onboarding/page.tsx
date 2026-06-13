"use client";

import { type ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/layout/Screen";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { NameInput } from "@/components/onboarding/NameInput";
import { PasswordPair } from "@/components/onboarding/PasswordPair";
import { MnemonicDisplay } from "@/components/onboarding/MnemonicDisplay";
import { MnemonicInput } from "@/components/onboarding/MnemonicInput";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { mnemonicToAccount } from "viem/accounts";
import { createWalletFromPassword, type EncryptedPayload } from "@/lib/wallet/account";
import { normalizeMnemonic, recoverWalletFromMnemonic, validateMnemonic } from "@/lib/wallet/recover";
import {
    loadEncryptedWallet,
    saveDisplayName,
    saveEncryptedWallet,
    saveWalletAddress,
} from "@/lib/wallet/store";
import { setSessionAddress } from "@/lib/wallet/session";

type GeneratedWallet = {
    mnemonic: string;
    address: `0x${string}`;
    payload: EncryptedPayload;
};

type Mode = "new" | "recover";
type Step = "welcome" | "name" | "new-password" | "new-mnemonic" | "recover-mnemonic" | "recover-password";

function shortAddress(addr: `0x${string}`): string {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function OnboardingPage(): ReactElement | null {
    const router = useRouter();
    const [step, setStep] = useState<Step>("welcome");
    const [mode, setMode] = useState<Mode>("new");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [mnemonicInput, setMnemonicInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [generated, setGenerated] = useState<GeneratedWallet | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        loadEncryptedWallet().then((payload) => {
            if (payload !== null) {
                router.replace("/home/");
            } else {
                setChecked(true);
            }
        });
    }, [router]);

    if (!checked) return null;

    function startMode(m: Mode) {
        setMode(m);
        setError(null);
        setStep("name");
    }

    function handleNameSubmit() {
        const trimmed = name.trim();
        if (trimmed.length === 0) {
            setError("名前を入れてください");
            return;
        }
        setError(null);
        setName(trimmed);
        setStep(mode === "new" ? "new-password" : "recover-mnemonic");
    }

    async function handleNewPasswordSubmit() {
        if (password.length < 8) {
            setError("パスワードは8文字以上にしてください");
            return;
        }
        if (password !== confirm) {
            setError("パスワードが一致していません");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const w = await createWalletFromPassword(password);
            setGenerated(w);
            setStep("new-mnemonic");
        } catch {
            setError("エラーが発生しました。もう一度お試しください");
        } finally {
            setLoading(false);
        }
    }

    function handleMnemonicInputSubmit() {
        if (!validateMnemonic(mnemonicInput)) {
            setError("ふっかつのことばが正しくありません (12 単語、すべて英語の単語)");
            return;
        }
        setError(null);
        setPassword("");
        setConfirm("");
        setStep("recover-password");
    }

    async function handleRecoverPasswordSubmit() {
        if (password.length < 8) {
            setError("パスワードは8文字以上にしてください");
            return;
        }
        if (password !== confirm) {
            setError("パスワードが一致していません");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const w = await recoverWalletFromMnemonic(mnemonicInput, password);
            await saveDisplayName(name);
            await saveEncryptedWallet(w.payload);
            await saveWalletAddress(w.address);
            setSessionAddress(w.address);
            router.push("/home/");
        } catch (e) {
            setError(e instanceof Error ? e.message : "復元できませんでした");
        } finally {
            setLoading(false);
        }
    }

    async function handleNewMnemonicConfirmed() {
        if (!generated) return;
        setLoading(true);
        try {
            await saveDisplayName(name);
            await saveEncryptedWallet(generated.payload);
            await saveWalletAddress(generated.address);
            setSessionAddress(generated.address);
            router.push("/home/");
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    }

    // ---------- step renderers ----------

    if (step === "welcome") {
        return (
            <Screen>
                <OnboardingStep
                    current={1}
                    total={1}
                    title={
                        <>
                            ようこそ
                            <br />
                            やくそく へ
                        </>
                    }
                    description={
                        <>
                            お友達やご近所さんと「いついくら払うか」を
                            <br />
                            やりとりするアプリです。
                        </>
                    }
                    primaryAction={
                        <div className="space-y-2 w-full">
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={() => startMode("new")}
                            >
                                新しいお財布をつくる
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                fullWidth
                                onClick={() => startMode("recover")}
                            >
                                ふっかつのことばで復元
                            </Button>
                        </div>
                    }
                >
                    <div />
                </OnboardingStep>
            </Screen>
        );
    }

    if (step === "name") {
        return (
            <Screen>
                <OnboardingStep
                    current={1}
                    total={3}
                    title={
                        <>
                            お名前を
                            <br />
                            教えてください
                        </>
                    }
                    description={
                        <>
                            このアプリの中で、あなたを呼ぶときに使います。
                            <br />
                            本名じゃなくて大丈夫です。
                        </>
                    }
                    primaryAction={
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleNameSubmit}
                            disabled={loading}
                        >
                            つぎへ
                        </Button>
                    }
                >
                    <NameInput
                        name={name}
                        onNameChange={setName}
                        error={error}
                    />
                </OnboardingStep>
            </Screen>
        );
    }

    if (step === "new-password") {
        return (
            <Screen>
                <OnboardingStep
                    current={2}
                    total={3}
                    title={
                        <>
                            パスワードを
                            <br />
                            決めてください
                        </>
                    }
                    description={
                        <>
                            このパスワードで、あなたの「お財布」をまもります。
                            <br />
                            8 文字以上の半角英数字を入れてください。
                        </>
                    }
                    primaryAction={
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleNewPasswordSubmit}
                            disabled={loading}
                        >
                            {loading ? "作成中…" : "つぎへ"}
                        </Button>
                    }
                >
                    <PasswordPair
                        password={password}
                        confirm={confirm}
                        onPasswordChange={setPassword}
                        onConfirmChange={setConfirm}
                        error={error}
                    />
                </OnboardingStep>
            </Screen>
        );
    }

    if (step === "new-mnemonic") {
        return (
            <Screen>
                <OnboardingStep
                    current={3}
                    total={3}
                    title={
                        <>
                            ふっかつのことば
                            <br />
                            を控えてください
                        </>
                    }
                    description={
                        <>
                            パスワードを忘れても、この 12 単語があればお財布を取り戻せます。
                            <br />
                            他のウォレット (MetaMask など) でも使えます。
                        </>
                    }
                    primaryAction={
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => setConfirmOpen(true)}
                            disabled={loading || !generated}
                        >
                            メモしました
                        </Button>
                    }
                >
                    {generated ? <MnemonicDisplay mnemonic={generated.mnemonic} /> : null}
                </OnboardingStep>
                {confirmOpen ? (
                    <ConfirmDialog
                        title="ほんとうにメモしましたか？"
                        body="この 12 単語を控えていないと、パスワードを忘れたときお財布を二度と取り戻せません。"
                        checkboxLabel="12 単語を紙に控えました"
                        cancelLabel="もう一度見る"
                        confirmLabel="つぎへ"
                        confirmVariant="default"
                        onCancel={() => setConfirmOpen(false)}
                        onConfirm={handleNewMnemonicConfirmed}
                        loading={loading}
                    />
                ) : null}
            </Screen>
        );
    }

    if (step === "recover-mnemonic") {
        const previewAddress = (() => {
            try {
                if (!validateMnemonic(mnemonicInput)) return null;
                return mnemonicToAccount(normalizeMnemonic(mnemonicInput)).address;
            } catch {
                return null;
            }
        })();
        return (
            <Screen>
                <OnboardingStep
                    current={2}
                    total={3}
                    title={
                        <>
                            ふっかつのことば
                            <br />
                            を入れてください
                        </>
                    }
                    description={
                        <>
                            12 単語の英語のことば (BIP-39) を入れます。
                            <br />
                            他のウォレットからエクスポートしたものでも OK。
                        </>
                    }
                    primaryAction={
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleMnemonicInputSubmit}
                            disabled={loading}
                        >
                            つぎへ
                        </Button>
                    }
                >
                    <MnemonicInput
                        value={mnemonicInput}
                        onChange={(v) => {
                            setMnemonicInput(v);
                            setError(null);
                        }}
                        error={error}
                    />
                    {previewAddress ? (
                        <div className="mt-3 p-3 rounded-xl bg-[var(--color-bg-soft)] text-xs text-[var(--color-ink-2)]">
                            このことばのアドレス: <span style={{ fontFamily: "var(--font-mono)" }}>{shortAddress(previewAddress)}</span>
                            <br />
                            <span className="text-[var(--color-ink-3)]">期待したアドレスか必ず確かめてください</span>
                        </div>
                    ) : null}
                </OnboardingStep>
            </Screen>
        );
    }

    // step === "recover-password"
    return (
        <Screen>
            <OnboardingStep
                current={3}
                total={3}
                title={
                    <>
                        新しいパスワードを
                        <br />
                        決めてください
                    </>
                }
                description={
                    <>
                        この端末でお財布をまもるパスワードを決めます。
                        <br />
                        元のパスワードと違っても大丈夫です。
                    </>
                }
                primaryAction={
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleRecoverPasswordSubmit}
                        disabled={loading}
                    >
                        {loading ? "復元中…" : "復元する"}
                    </Button>
                }
            >
                <PasswordPair
                    password={password}
                    confirm={confirm}
                    onPasswordChange={setPassword}
                    onConfirmChange={setConfirm}
                    error={error}
                />
            </OnboardingStep>
        </Screen>
    );
}
