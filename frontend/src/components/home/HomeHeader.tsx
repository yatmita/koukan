import { Icon } from "../ui/Icon";

type Props = { name: string };

export function HomeHeader({ name }: Props) {
    return (
        <div className="flex items-center px-4 pt-2 pb-1">
            <h1 className="text-lg font-bold">こんにちは、{name}さん</h1>
            <div className="flex-1" />
            <Icon kind="globe" color="var(--color-ink-3)" />
        </div>
    );
}
