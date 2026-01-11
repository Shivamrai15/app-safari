import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SLEEP_TIMER_STORAGE_KEY = "@sleep_timer_state";

export const TIMER_PRESETS = [
    { label: "5 min", value: 5 * 60 * 1000 },
    { label: "15 min", value: 15 * 60 * 1000 },
    { label: "30 min", value: 30 * 60 * 1000 },
    { label: "45 min", value: 45 * 60 * 1000 },
    { label: "60 min", value: 60 * 60 * 1000 },
    { label: "90 min", value: 90 * 60 * 1000 },
] as const;

export const FADE_OUT_DURATION = 30 * 1000;

interface SleepTimerState {
    isActive: boolean;
    targetEndTime: number | null;
    selectedDuration: number | null;
    endOfTrack: boolean;
    isFadingOut: boolean;
    remainingTime: number;
}

interface SleepTimerActions {
    startTimer: (durationMs: number) => void;
    startEndOfTrack: () => void;
    cancelTimer: () => void;
    updateRemainingTime: () => void;
    startFadeOut: () => void;
    onTimerComplete: () => void;
    hydrateFromStorage: () => Promise<void>;
    persistToStorage: () => Promise<void>;
}

type SleepTimerProps = SleepTimerState & SleepTimerActions;

interface StoredTimerData {
    targetEndTime: number | null;
    selectedDuration: number | null;
    endOfTrack: boolean;
}

export const useSleepTimer = create<SleepTimerProps>((set, get) => ({
    isActive: false,
    targetEndTime: null,
    selectedDuration: null,
    endOfTrack: false,
    isFadingOut: false,
    remainingTime: 0,

    startTimer: (durationMs: number) => {
        const targetEndTime = Date.now() + durationMs;
        set({
            isActive: true,
            targetEndTime,
            selectedDuration: durationMs,
            endOfTrack: false,
            isFadingOut: false,
            remainingTime: durationMs,
        });
        get().persistToStorage();
    },

    startEndOfTrack: () => {
        set({
            isActive: true,
            targetEndTime: null,
            selectedDuration: null,
            endOfTrack: true,
            isFadingOut: false,
            remainingTime: 0,
        });
        get().persistToStorage();
    },

    cancelTimer: () => {
        set({
            isActive: false,
            targetEndTime: null,
            selectedDuration: null,
            endOfTrack: false,
            isFadingOut: false,
            remainingTime: 0,
        });
        get().persistToStorage();
    },

    updateRemainingTime: () => {
        const { targetEndTime, isActive, endOfTrack } = get();

        if (!isActive || endOfTrack || !targetEndTime) {
            return;
        }

        const remaining = Math.max(0, targetEndTime - Date.now());
        const shouldFadeOut = remaining <= FADE_OUT_DURATION && remaining > 0;

        set({
            remainingTime: remaining,
            isFadingOut: shouldFadeOut,
        });
        // Note: Don't call onTimerComplete() here - let the player handle it
        // to avoid race conditions where isActive becomes false before the player can pause
    },

    startFadeOut: () => {
        set({ isFadingOut: true });
    },

    onTimerComplete: () => {
        set({
            isActive: false,
            targetEndTime: null,
            selectedDuration: null,
            endOfTrack: false,
            isFadingOut: false,
            remainingTime: 0,
        });
        get().persistToStorage();
    },

    hydrateFromStorage: async () => {
        try {
            const storedData = await AsyncStorage.getItem(SLEEP_TIMER_STORAGE_KEY);
            if (storedData) {
                const parsed: StoredTimerData = JSON.parse(storedData);

                if (parsed.endOfTrack) {
                    set({
                        isActive: true,
                        targetEndTime: null,
                        selectedDuration: null,
                        endOfTrack: true,
                        isFadingOut: false,
                        remainingTime: 0,
                    });
                } else if (parsed.targetEndTime && parsed.targetEndTime > Date.now()) {
                    const remaining = parsed.targetEndTime - Date.now();
                    set({
                        isActive: true,
                        targetEndTime: parsed.targetEndTime,
                        selectedDuration: parsed.selectedDuration,
                        endOfTrack: false,
                        isFadingOut: remaining <= FADE_OUT_DURATION,
                        remainingTime: remaining,
                    });
                } else {
                    await AsyncStorage.removeItem(SLEEP_TIMER_STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error("Failed to hydrate sleep timer from storage:", error);
        }
    },

    persistToStorage: async () => {
        try {
            const { targetEndTime, selectedDuration, endOfTrack, isActive } = get();

            if (!isActive) {
                await AsyncStorage.removeItem(SLEEP_TIMER_STORAGE_KEY);
                return;
            }

            const dataToStore: StoredTimerData = {
                targetEndTime,
                selectedDuration,
                endOfTrack,
            };
            await AsyncStorage.setItem(SLEEP_TIMER_STORAGE_KEY, JSON.stringify(dataToStore));
        } catch (error) {
            console.error("Failed to persist sleep timer to storage:", error);
        }
    },
}));

export const formatRemainingTime = (ms: number): string => {
    if (ms <= 0) return "0:00";

    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateFadeVolume = (remainingTime: number): number => {
    if (remainingTime >= FADE_OUT_DURATION) {
        return 1.0;
    }
    if (remainingTime <= 0) {
        return 0.0;
    }
    return remainingTime / FADE_OUT_DURATION;
};
