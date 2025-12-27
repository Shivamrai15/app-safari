import { cn } from "@/lib/utils";
import { Text, View } from "react-native";
import { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
    width?: number;
    height?: number;
    strokeWidth?: number;
    progress?: number;
    strokeColor?: string;
    trackColor?: string;
    textColor?: string;
    showText?: boolean;
    className?: string;
    duration?: number;
}

const clamp = (value: number, min = 0, max = 100) =>
    Math.min(Math.max(value, min), max);

export const CircularProgress = ({
    width = 100,
    height = 100,
    strokeWidth = 10,
    progress = 0,
    strokeColor = "#3b5998",
    trackColor = "#575757",
    textColor = "#fff",
    showText = true,
    className = "",
    duration = 700,
}: Props) => {
    const size = Math.min(width, height);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(clamp(progress), {
                duration,
                easing: Easing.out(Easing.cubic),
        });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset:
            circumference -
            (circumference * animatedProgress.value) / 100,
    }));

    return (
        <View
            className={cn("items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {showText && (
                <View className="absolute items-center justify-center">
                    <Text
                        className="font-bold"
                        style={{
                            color: textColor,
                            fontSize: size * 0.2,
                        }}
                    >
                        {Math.round(clamp(progress))}%
                    </Text>
                </View>
            )}
        </View>
    );
};
