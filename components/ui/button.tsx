import { TouchableOpacity } from "react-native";
import { cn } from "@/lib/utils";

type variant = "primary" | "secondary" | "outline" | "ghost" | "theme";

interface Props {
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: variant;
}

const variantStyles: Record<variant, string> = {
    primary : "bg-white text-black",
    secondary : "bg-neutral-800 text-zinc-100",
    outline : "border border-gray-300 text-white bg-transparent",
    ghost : "bg-transparent text-white",
    theme : "bg-red-600 text-white"
}

export const Button = ({ children, onPress, disabled, className, variant }: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={cn(
            variantStyles[variant || "primary"],
                "h-12 rounded-xl flex flex-row items-center gap-x-2 justify-center px-4 py-1",
                className,
                disabled ? "opacity-70" : "opacity-100"
            )}
            activeOpacity={0.8}
        >
            {children}
        </TouchableOpacity>
    )
}
