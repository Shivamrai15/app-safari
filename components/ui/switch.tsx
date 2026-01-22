import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

interface SwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
    className?: string;
}

const SIZES = {
    sm: { width: 40, height: 24, thumbSize: 14, padding: 3 },
    md: { width: 52, height: 30, thumbSize: 20, padding: 3 },
    lg: { width: 64, height: 36, thumbSize: 26, padding: 3 },
};

// Tailwind neutral colors for safe dark theme defaults
const COLORS = {
    active: "#FFFFFF",      // White (For pulse/border)
    inactive: "#27272a",    // Zinc-800
    thumb: "#a1a1aa",       // Zinc-400 (Inactive dimmed)
    thumbActive: "#FFFFFF", // White thumb against dark track
};

export const Switch = ({
    value,
    onValueChange,
    disabled = false,
    size = "md",
    activeColor = COLORS.active,
    inactiveColor = COLORS.inactive,
    thumbColor = COLORS.thumb,
    className,
}: SwitchProps) => {
    const BORDER_WIDTH = 2;

    const { width, height, thumbSize, padding } = SIZES[size];
    // Account for border width in translation range to maintain symmetric padding
    const translateRange = width - thumbSize - padding * 2 - BORDER_WIDTH * 2;
    const translateX = useSharedValue(value ? translateRange : 0);

    // Dynamic thumb color based on state if not overridden
    const actualThumbColor = value ? COLORS.thumbActive : thumbColor;

    useEffect(() => {
        translateX.value = withSpring(value ? translateRange : 0, {
            damping: 20,
            stiffness: 300,
            mass: 0.8,
        });
    }, [value, width, thumbSize, padding]);

    const trackAnimatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: inactiveColor, // Keep track background constant (Dark)
            borderColor: "#3f3f46", // Static Zinc-700 border
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const handlePress = () => {
        if (!disabled) {
            onValueChange(!value);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            className={cn(disabled && "opacity-50", className, "relative items-center justify-center")}
        >
            <Animated.View
                style={[
                    styles.track,
                    trackAnimatedStyle,
                    {
                        width,
                        height,
                        borderRadius: height / 2,
                        padding,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        thumbAnimatedStyle,
                        {
                            width: thumbSize,
                            height: thumbSize,
                            borderRadius: thumbSize / 2,
                            backgroundColor: actualThumbColor,
                        },
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    track: {
        justifyContent: "center",
        borderWidth: 2, // Increased border width
        borderColor: "transparent",
    },
    thumb: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
        alignItems: "center",
        justifyContent: "center",
    },
});
