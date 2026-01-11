import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SleepTimerIcon } from '@/constants/icons';

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.7;

interface SleepTimerOrbProps {
    isActive: boolean;
    endOfTrack: boolean;
    hours: number;
    minutes: number;
    seconds: number;
    onCancel: () => void;
}

export const SleepTimerOrb = ({
    isActive,
    endOfTrack,
    hours,
    minutes,
    seconds,
    onCancel,
}: SleepTimerOrbProps) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Simulate stars with static positions
    const stars = useRef([...Array(6)].map(() => ({
        top: Math.random() * 80 + '%',
        left: Math.random() * 80 + '%',
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
    }))).current;

    useEffect(() => {
        if (isActive && !endOfTrack) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 3000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 3000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 4000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 4000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            const rotate = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 25000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );

            pulse.start();
            glow.start();
            rotate.start();

            return () => {
                pulse.stop();
                glow.stop();
                rotate.stop();
            };
        } else {
            Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
            Animated.timing(glowAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
            rotateAnim.setValue(0);
        }
    }, [isActive, endOfTrack]);

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.6],
    });

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ scale: pulseAnim }] }
            ]}
        >
            {/* Ambient Outer Glow - Deep Blue/Purple */}
            <Animated.View
                style={[
                    styles.outerGlow,
                    {
                        opacity: isActive ? glowOpacity : 0.1,
                        backgroundColor: isActive ? '#3b82f6' : '#262626',
                        transform: [{ scale: 1.15 }],
                        shadowColor: "#60a5fa",
                    }
                ]}
            />

            {/* Main Orb Container */}
            <View style={styles.orbStructure}>
                <BlurView
                    intensity={isActive ? 80 : 20}
                    tint="dark"
                    style={styles.blurContainer}
                >
                    <LinearGradient
                        colors={isActive
                            ? ['rgba(30, 58, 138, 0.3)', 'rgba(17, 24, 39, 0.6)', 'rgba(0, 0, 0, 0.9)']
                            : ['rgba(255, 255, 255, 0.05)', 'rgba(0, 0, 0, 0.6)']
                        }
                        style={styles.orbGradient}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    >
                        {/* Internal Space Rotation */}
                        {isActive && (
                            <Animated.View style={[styles.innerCore, { transform: [{ rotate: spin }] }]}>
                                {/* Nebula Effect */}
                                <LinearGradient
                                    colors={['rgba(139, 92, 246, 0.2)', 'transparent']}
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />
                                {/* Stars */}
                                {stars.map((star, i) => (
                                    <View
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            top: star.top as any,
                                            left: star.left as any,
                                            width: star.size,
                                            height: star.size,
                                            borderRadius: star.size / 2,
                                            backgroundColor: 'white',
                                            opacity: star.opacity,
                                            shadowColor: 'white',
                                            shadowRadius: 4,
                                            shadowOpacity: 0.8,
                                        }}
                                    />
                                ))}
                            </Animated.View>
                        )}

                        {/* Top Highlights (Reflection) */}
                        <View style={styles.glassHighlight} />

                        {/* Border Glow */}
                        <View style={[
                            styles.borderGlow,
                            { borderColor: isActive ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255, 255, 255, 0.1)' }
                        ]} />

                        {/* Content Layer */}
                        <View style={styles.contentContainer}>
                            <Image
                                source={SleepTimerIcon}
                                style={[styles.icon, { tintColor: isActive ? '#93c5fd' : '#525252' }]}
                            />

                            {isActive && !endOfTrack ? (
                                <View style={styles.timerDisplay}>
                                    <Text style={[styles.timerText, { textShadowColor: 'rgba(59, 130, 246, 0.8)' }]}>
                                        {hours > 0 ? `${hours}:` : ''}
                                        {minutes.toString().padStart(2, '0')}:
                                        {seconds.toString().padStart(2, '0')}
                                    </Text>
                                    <View style={[styles.activeIndicator, { backgroundColor: '#60a5fa' }]} />
                                </View>
                            ) : isActive && endOfTrack ? (
                                <View style={styles.statusDisplay}>
                                    <Text style={[styles.statusText, { color: '#93c5fd' }]}>End of Track</Text>
                                    <Text style={styles.subStatusText}>Goodnight</Text>
                                </View>
                            ) : (
                                <Text style={styles.statusText}>Timer Off</Text>
                            )}

                            {isActive && (
                                <TouchableOpacity
                                    onPress={onCancel}
                                    activeOpacity={0.7}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>CANCEL</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </LinearGradient>
                </BlurView>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerGlow: {
        position: 'absolute',
        width: ORB_SIZE,
        height: ORB_SIZE,
        borderRadius: ORB_SIZE / 2,
        zIndex: 0,
        opacity: 0.5,
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 50,
    },
    orbStructure: {
        width: ORB_SIZE,
        height: ORB_SIZE,
        borderRadius: ORB_SIZE / 2,
        overflow: 'hidden',
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    blurContainer: {
        flex: 1,
    },
    orbGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCore: {
        position: 'absolute',
        width: '80%',
        height: '80%',
        borderRadius: ORB_SIZE,
        opacity: 0.5,
    },
    glassHighlight: {
        position: 'absolute',
        top: 0,
        width: '70%',
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderBottomLeftRadius: ORB_SIZE,
        borderBottomRightRadius: ORB_SIZE,
        transform: [{ scaleX: 1.5 }],
    },
    borderGlow: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 2,
        bottom: 2,
        borderRadius: ORB_SIZE / 2,
        borderWidth: 1.5,
        opacity: 0.8,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    icon: {
        width: 32,
        height: 32,
        marginBottom: 4,
        opacity: 0.9,
    },
    timerDisplay: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 64,
        fontWeight: '800',
        color: '#ffffff',
        fontVariant: ['tabular-nums'],
        letterSpacing: -2,
        textShadowColor: 'rgba(220, 38, 38, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    activeIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ef4444',
        marginTop: 8,
    },
    statusDisplay: {
        alignItems: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    subStatusText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.3)',
        marginTop: 4,
    },
    cancelButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cancelButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
