import { Avatar } from "../ui/Avatar";

type Props = {
    name: string;
    addressShort: string;
};

export function ContactProfile({ name, addressShort }: Props) {
    return (
        <div className="pt-2 pb-6 px-6 text-center">
            <div className="inline-block">
                <Avatar name={name} size="xl" />
            </div>
            <div className="mt-3 text-xl font-bold">{name} さん</div>
            <div
                className="mt-1 text-xs text-[var(--color-ink-3)]"
                style={{ fontFamily: "var(--font-mono)" }}
            >
                {addressShort}
            </div>
        </div>
    );
}
