import { memo, useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View, TextProps } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';

interface MarqueeTextProps {
    text: string;
    className?: string;
    style?: TextProps['style'];
    speed?: number;
    delay?: number;
    gap?: number;
}

export const MarqueeText = memo(({
    text,
    className,
    style,
    speed = 30,
    delay = 1500,
    gap = 40,
}: MarqueeTextProps) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const [fullTextWidth, setFullTextWidth] = useState(0);
    const translateX = useSharedValue(0);

    const shouldAnimate = fullTextWidth > containerWidth && containerWidth > 0;

    const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    }, []);

    const onMeasureLayout = useCallback((event: LayoutChangeEvent) => {
        setFullTextWidth(Math.ceil(event.nativeEvent.layout.width));
    }, []);

    useEffect(() => {
        setFullTextWidth(0);
        cancelAnimation(translateX);
        translateX.value = 0;
    }, [text, translateX]);

    useEffect(() => {
        if (shouldAnimate) {
            const scrollDistance = fullTextWidth + gap;
            const duration = (scrollDistance / speed) * 1000;

            translateX.value = withDelay(
                delay,
                withRepeat(
                    withTiming(-scrollDistance, {
                        duration,
                        easing: Easing.linear,
                    }),
                    -1,
                    false
                )
            );
        } else {
            cancelAnimation(translateX);
            translateX.value = 0;
        }

        return () => {
            cancelAnimation(translateX);
        };
    }, [shouldAnimate, fullTextWidth, gap, speed, delay, translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.wrapper} onLayout={onContainerLayout}>
            <View style={styles.measureContainer} pointerEvents="none">
                <Text
                    className={className}
                    style={style}
                    numberOfLines={1}
                    onLayout={onMeasureLayout}
                >
                    {text}
                </Text>
            </View>

            <View style={styles.clipContainer}>
                <Animated.View style={[styles.animatedContainer, animatedStyle]}>
                    <Text
                        className={className}
                        style={[style, shouldAnimate && { width: fullTextWidth }]}
                        numberOfLines={1}
                    >
                        {text}
                    </Text>
                    {shouldAnimate && (
                        <>
                            <View style={{ width: gap }} />
                            <Text
                                className={className}
                                style={[style, { width: fullTextWidth }]}
                                numberOfLines={1}
                            >
                                {text}
                            </Text>
                        </>
                    )}
                </Animated.View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        position: 'relative',
    },
    measureContainer: {
        position: 'absolute',
        top: -9999,
        left: 0,
        opacity: 0,
        minWidth: 100000,
        flexDirection: 'row',
    },
    clipContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    animatedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
