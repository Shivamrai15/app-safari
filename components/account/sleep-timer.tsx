import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSleepTimer, TIMER_PRESETS } from '@/hooks/use-sleep-timer';
import { SleepTimerOrb } from './sleep-timer-orb';
import { Spacer } from '../ui/spacer';
import Entypo from '@expo/vector-icons/Entypo';

const { width } = Dimensions.get('window');

export const SleepTimer = () => {
    const {
        isActive,
        selectedDuration,
        endOfTrack,
        remainingTime,
        startTimer,
        startEndOfTrack,
        cancelTimer,
        updateRemainingTime,
    } = useSleepTimer();

    const [customMinutes, setCustomMinutes] = useState(30);

    useEffect(() => {
        if (isActive && !endOfTrack) {
            const interval = setInterval(() => {
                updateRemainingTime();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isActive, endOfTrack, updateRemainingTime]);

    const handleSelectPreset = (durationMs: number) => {
        if (isActive && selectedDuration === durationMs) {
            cancelTimer();
        } else {
            startTimer(durationMs);
        }
    };

    const handleEndOfTrack = () => {
        if (isActive && endOfTrack) {
            cancelTimer();
        } else {
            startEndOfTrack();
        }
    };

    const handleIncrementCustomTime = () => {
        setCustomMinutes(prev => Math.min(prev + 5, 180));
    };

    const handleDecrementCustomTime = () => {
        setCustomMinutes(prev => Math.max(prev - 5, 5));
    };

    const handleStartCustomTimer = () => {
        const durationMs = customMinutes * 60 * 1000;
        startTimer(durationMs);
    };

    const isCustomTimeActive = isActive && !endOfTrack &&
        selectedDuration !== null &&
        !TIMER_PRESETS.some(preset => preset.value === selectedDuration);

    const getTimeDisplay = () => {
        if (!isActive || endOfTrack) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
        const totalSeconds = Math.ceil(remainingTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    };

    const { hours, minutes, seconds } = getTimeDisplay();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#020617']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Entypo name="chevron-left" size={32} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>SLEEP TIMER</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.mainLayout}>
                    <View style={styles.heroSection}>
                        <SleepTimerOrb
                            isActive={isActive}
                            endOfTrack={endOfTrack}
                            hours={hours}
                            minutes={minutes}
                            seconds={seconds}
                            onCancel={cancelTimer}
                        />
                    </View>
                    {!isActive && (
                        <BlurView
                            intensity={40}
                            tint="dark"
                            style={styles.controlPanel}
                        >
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.controlContent}
                            >
                                <Text style={styles.sectionLabel}>QUICK SET</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.presetsList}
                                >
                                    {TIMER_PRESETS.map((preset) => {
                                        const isSelected = isActive && selectedDuration === preset.value && !endOfTrack;
                                        return (
                                            <TouchableOpacity
                                                key={preset.value}
                                                onPress={() => handleSelectPreset(preset.value)}
                                                activeOpacity={0.7}
                                                style={[
                                                    styles.presetChip,
                                                    isSelected && styles.presetChipSelected
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.presetChipText,
                                                    { color: isSelected ? '#bae6fd' : '#a1a1aa' }
                                                ]}>
                                                    {preset.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <View style={styles.divider} />

                                <View style={styles.optionsRow}>
                                    <TouchableOpacity
                                        onPress={handleEndOfTrack}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.optionCard,
                                            isActive && endOfTrack && styles.optionCardActive
                                        ]}
                                    >
                                        <View style={styles.optionIconContainer}>
                                            <Text style={[
                                                styles.optionIcon,
                                                { color: isActive && endOfTrack ? '#60a5fa' : '#71717a' }
                                            ]}>♪</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.optionTitle}>End of Track</Text>
                                            <Text style={styles.optionSubtitle}>Stop after song</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {/* Custom Timer Slider Placeholder / Simple Stepper */}
                                <View style={styles.customStepperRow}>
                                    <TouchableOpacity
                                        onPress={handleDecrementCustomTime}
                                        style={styles.stepperButton}
                                    >
                                        <Text style={styles.stepperButtonText}>-5m</Text>
                                    </TouchableOpacity>

                                    <View style={styles.stepperDisplay}>
                                        <Text style={styles.stepperValue}>
                                            {customMinutes >= 60
                                                ? `${Math.floor(customMinutes / 60)}h ${customMinutes % 60}m`
                                                : `${customMinutes}m`}
                                        </Text>
                                        <Text style={styles.stepperLabel}>CUSTOM</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleIncrementCustomTime}
                                        style={styles.stepperButton}
                                    >
                                        <Text style={styles.stepperButtonText}>+5m</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleStartCustomTimer}
                                    activeOpacity={0.7}
                                    style={styles.startCustomButton}
                                >
                                    <Text style={styles.startCustomButtonText}>
                                        {isCustomTimeActive ? 'UPDATE CUSTOM TIMER' : 'START CUSTOM TIMER'}
                                    </Text>
                                </TouchableOpacity>

                                {isActive && (
                                    <TouchableOpacity
                                        onPress={cancelTimer}
                                        style={styles.stopButton}
                                    >
                                        <Text style={styles.stopButtonText}>STOP TIMER</Text>
                                    </TouchableOpacity>
                                )}
                                <Spacer />
                            </ScrollView>
                        </BlurView>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '300',
        marginTop: -2,
    },
    headerTitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 2,
    },
    headerSpacer: {
        width: 40,
    },
    mainLayout: {
        flex: 1,
        flexDirection: 'column',
    },
    heroSection: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    controlPanel: {
        flex: 2,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(10, 10, 10, 0.6)',
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    controlContent: {
        padding: 24,
        paddingBottom: 40,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    presetsList: {
        flexDirection: 'row',
        gap: 12,
        paddingRight: 24,
        marginBottom: 8,
    },
    presetChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    presetChipSelected: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
    },
    presetChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a1a1aa',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 24,
    },
    optionsRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    optionCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        gap: 16,
    },
    optionCardActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    optionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionIcon: {
        fontSize: 18,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    customStepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    stepperButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    stepperButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    stepperDisplay: {
        alignItems: 'center',
    },
    stepperValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    stepperLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 2,
    },
    startCustomButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    startCustomButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    stopButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        marginTop: 12,
    },
    stopButtonText: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
});