import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    interpolateColor,
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
    sm: { width: 40, height: 24, thumbSize: 18, padding: 3 },
    md: { width: 52, height: 30, thumbSize: 24, padding: 3 },
    lg: { width: 64, height: 36, thumbSize: 30, padding: 3 },
};

// Tailwind neutral colors for dark theme
const COLORS = {
    active: "#a3a3a3",      // neutral-400
    inactive: "#262626",    // neutral-800
    thumb: "#fafafa",       // neutral-50
    thumbActive: "#f5f5f5", // neutral-100
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
    const { width, height, thumbSize, padding } = SIZES[size];
    const translateX = useSharedValue(value ? width - thumbSize - padding * 2 : 0);
    const colorProgress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        translateX.value = withSpring(value ? width - thumbSize - padding * 2 : 0, {
            damping: 20,
            stiffness: 300,
            mass: 0.8,
        });
        colorProgress.value = withSpring(value ? 1 : 0, {
            damping: 20,
            stiffness: 300,
        });
    }, [value, width, thumbSize, padding]);

    const trackAnimatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                colorProgress.value,
                [0, 1],
                [inactiveColor, activeColor]
            ),
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
            className={cn(disabled && "opacity-50", className)}
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
                <View
                    style={[
                        styles.innerBorder,
                        {
                            borderRadius: height / 2,
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.thumb,
                        thumbAnimatedStyle,
                        {
                            width: thumbSize,
                            height: thumbSize,
                            borderRadius: thumbSize / 2,
                            backgroundColor: thumbColor,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.thumbHighlight,
                            {
                                width: thumbSize * 0.35,
                                height: thumbSize * 0.35,
                                borderRadius: thumbSize * 0.175,
                            },
                        ]}
                    />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    track: {
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    innerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.2)",
    },
    thumb: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    thumbHighlight: {
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        position: "absolute",
        top: "12%",
        left: "12%",
    },
});
