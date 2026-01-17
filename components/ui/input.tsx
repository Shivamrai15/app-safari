import { cn } from "@/lib/utils";
import { Text, TextInput, View } from "react-native";

interface Props {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    className?: string;
}

export const Input = ({ placeholder, value, onChange, label, secureTextEntry, keyboardType, className }: Props) => {
    return (
        <View className="flex flex-col gap-y-2">
            <Text className="text-zinc-300 font-medium">{label}</Text>
            <TextInput
                placeholder={placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                importantForAutofill="no"
                selectionColor="#a1a1aa"
                placeholderTextColor="#71717a"
                value={value}
                onChangeText={onChange}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                className={cn(
                    "bg-transparent rounded-xl border px-3 py-2 h-12 text-zinc-100 border-zinc-400 font-medium",
                    className
                )}
            />
        </View>
    )
}

