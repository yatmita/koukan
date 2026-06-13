"use client";

import { type ClipboardEvent, type ReactElement, useMemo } from "react";
import { normalizeMnemonic } from "@/lib/wallet/recover";

type Props = {
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
};

const COUNT = 12;

function joinWords(words: string[]): string {
    return words.map((w) => w.trim().toLowerCase()).filter((w) => w.length > 0).join(" ");
}

function splitIntoSlots(value: string): string[] {
    const normalized = normalizeMnemonic(value);
    const words = normalized.length === 0 ? [] : normalized.split(" ");
    const slots = new Array(COUNT).fill("") as string[];
    for (let i = 0; i < Math.min(words.length, COUNT); i++) {
        slots[i] = words[i];
    }
    return slots;
}

function WordCell({
    index,
    word,
    onChange,
    onPaste,
}: {
    index: number;
    word: string;
    onChange: (next: string) => void;
    onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
}) {
    return (
        <label className="flex items-center gap-1.5 rounded-lg border-[1.5px] bg-[var(--color-bg-elev)] px-2 py-1.5"
            style={{ borderColor: "var(--color-line-strong)" }}
        >
            <span className="text-[10px] text-[var(--color-ink-3)] tabular-nums w-4 text-right select-none">
                {index + 1}
            </span>
            <input
                type="text"
                value={word}
                onChange={(e) => onChange(e.target.value)}
                onPaste={onPaste}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent text-sm outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
            />
        </label>
    );
}

function HelpNote() {
    return (
        <div className="mt-3 text-xs text-[var(--color-ink-3)] leading-[1.6]">
            12 単語を 1 つずつ入れるか、まとめてコピーした内容をいずれかの欄に
            貼り付けてください。番号付き (1. word 2. word) でも自動で読み取ります。
        </div>
    );
}

export function MnemonicInput({ value, onChange, error }: Props): ReactElement {
    const slots = useMemo(() => splitIntoSlots(value), [value]);

    function updateSlot(index: number, next: string) {
        // 個別 input 内に複数単語が入ったら自動分配 (連続貼り付けや
        // browser の autofill ケース対応)
        const expanded = next.includes(" ") || /\d/.test(next.trim().split(" ")[0]);
        if (expanded) {
            const normalized = normalizeMnemonic(next);
            const newWords = normalized.length === 0 ? [] : normalized.split(" ");
            const merged = [...slots];
            for (let i = 0; i < newWords.length && index + i < COUNT; i++) {
                merged[index + i] = newWords[i];
            }
            onChange(joinWords(merged));
            return;
        }
        const merged = [...slots];
        merged[index] = next;
        onChange(joinWords(merged));
    }

    function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
        const text = e.clipboardData.getData("text");
        // 単語境界を含むときだけ「全 12 分配」モード
        if (!/\s/.test(text.trim())) return;
        e.preventDefault();
        const normalized = normalizeMnemonic(text);
        const words = normalized.length === 0 ? [] : normalized.split(" ");
        const merged = [...slots];
        for (let i = 0; i < words.length && index + i < COUNT; i++) {
            merged[index + i] = words[i];
        }
        onChange(joinWords(merged));
    }

    return (
        <div className="space-y-2">
            <div className="text-xs text-[var(--color-ink-2)]">ふっかつのことば (12 単語)</div>
            <div className="grid grid-cols-3 gap-2">
                {slots.map((word, i) => (
                    <WordCell
                        key={i}
                        index={i}
                        word={word}
                        onChange={(next) => updateSlot(i, next)}
                        onPaste={(e) => handlePaste(i, e)}
                    />
                ))}
            </div>
            {error ? (
                <div className="text-sm text-[var(--color-danger-strong)]">{error}</div>
            ) : null}
            <HelpNote />
        </div>
    );
}
