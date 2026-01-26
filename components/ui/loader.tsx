import { useEffect } from 'react';
import { cn } from "@/lib/utils";
import LottieView from 'lottie-react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    useAnimatedStyle,
    cancelAnimation
} from 'react-native-reanimated';
import { View } from 'react-native';

interface Props {
    className?: string;
}

export const PrimaryLoader = ({ className }: Props) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(720, {
                duration: 2000,
                easing: Easing.inOut(Easing.cubic),
            }),
            -1,
            false
        );
        return () => cancelAnimation(rotation);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${rotation.value}deg` }],
        };
    });

    return (
        <SafeAreaView className={cn(
            "flex-1 bg-background flex justify-center items-center",
            className
        )}>
            <Animated.View style={animatedStyle}>
                <Svg height="36" width="36" viewBox="0 0 36 36">
                    <Circle
                        cx="18"
                        cy="18"
                        r="13"
                        stroke="#27272a"
                        strokeWidth="6"
                        fill="transparent"
                    />
                    <Circle
                        cx="18"
                        cy="18"
                        r="13"
                        stroke="#ef4444"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="25, 110"
                        strokeLinecap="round"
                    />
                </Svg>
            </Animated.View>
        </SafeAreaView>
    )
}

export const SecondaryLoader = ({ className }: Props) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(720, {
                duration: 2000,
                easing: Easing.inOut(Easing.cubic),
            }),
            -1,
            false
        );
        return () => cancelAnimation(rotation);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${rotation.value}deg` }],
        };
    });

    return (
        <View className={cn(
            "flex-1 bg-background flex justify-center items-center",
            className
        )}>
            <Animated.View style={animatedStyle}>
                <Svg height="36" width="36" viewBox="0 0 36 36">
                    <Circle
                        cx="18"
                        cy="18"
                        r="13"
                        stroke="#27272a"
                        strokeWidth="6"
                        fill="transparent"
                    />
                    <Circle
                        cx="18"
                        cy="18"
                        r="13"
                        stroke="#ef4444"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="25, 110"
                        strokeLinecap="round"
                    />
                </Svg>
            </Animated.View>
        </View>
    )
}


export const CircularLoader = ({ className }: Props) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(720, {
                duration: 2000,
                easing: Easing.inOut(Easing.cubic),
            }),
            -1,
            false
        );
        return () => cancelAnimation(rotation);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${rotation.value}deg` }],
        };
    });

    return (
        <View className={cn(
            "flex-1 bg-background flex justify-center items-center",
            className
        )}>
            <Animated.View style={animatedStyle}>
                <Svg height="36" width="36" viewBox="0 0 36 36">
                    <Circle
                        cx="18"
                        cy="18"
                        r="13"
                        stroke="#27272a"
                        strokeWidth="6"
                        fill="transparent"
                    />
                    <Circle
                        cx="18"
                        cy="18"
                        r="13"
                        stroke="#ef4444"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="25, 110"
                        strokeLinecap="round"
                    />
                </Svg>
            </Animated.View>
        </View>
    )
}
