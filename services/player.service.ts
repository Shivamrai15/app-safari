import { create } from "zustand";
import axios from "axios";
import { PROTECTED_BASE_URL } from "@/constants/api.config";

interface PlayerServiceState {
    lastAdTime: number;
    adIntervalMs: number;
    shouldShowAd: boolean;

    currentSongStartTime: number;
    hasTrackedView: boolean;
    hasTrackedHistory: boolean;
    totalPlayTime: number;

    trackingIntervalMs: number;
    lastTrackingTime: number;
}

interface PlayerServiceActions {
    checkShouldShowAd: (isSubscribed: boolean) => boolean;
    resetAdTimer: () => void;
    setAdShown: () => void;

    onSongStart: (songId: string) => void;
    trackView: (songId: string, token?: string) => Promise<void>;
    trackHistory: (songId: string, token?: string) => Promise<void>;
    checkAndTrackAfterDelay: (songId: string, token?: string, isPrivateSession?: boolean) => void;

    trackPlayDuration: (songId: string, duration: number, token?: string) => Promise<void>;
    updateTotalPlayTime: (timeMs: number) => void;

    reset: () => void;
}

type PlayerServiceProps = PlayerServiceState & PlayerServiceActions;

const AD_INTERVAL_MS = 30 * 60 * 1000;
const VIEW_TRACK_DELAY_MS = 5 * 1000;
const TRACKING_INTERVAL_MS = 60 * 1000;

export const usePlayerService = create<PlayerServiceProps>((set, get) => ({
    
    lastAdTime: Date.now(),
    adIntervalMs: AD_INTERVAL_MS,
    shouldShowAd: false,
    currentSongStartTime: 0,
    hasTrackedView: false,
    hasTrackedHistory: false,
    totalPlayTime: 0,
    trackingIntervalMs: TRACKING_INTERVAL_MS,
    lastTrackingTime: 0,

    checkShouldShowAd: (isSubscribed: boolean) => {
        if (isSubscribed) {
            return false;
        }
        const { lastAdTime, adIntervalMs } = get();
        const timeSinceLastAd = Date.now() - lastAdTime;
        const shouldShow = timeSinceLastAd >= adIntervalMs;
        set({ shouldShowAd: shouldShow });
        return shouldShow;
    },

    resetAdTimer: () => {
        set({
            lastAdTime: Date.now(),
            shouldShowAd: false
        });
    },

    setAdShown: () => {
        set({
            lastAdTime: Date.now(),
            shouldShowAd: false
        });
    },

    onSongStart: () => {
        set({
            currentSongStartTime: Date.now(),
            hasTrackedView: false,
            hasTrackedHistory: false
        });
    },

    trackView: async (songId: string, token?: string) => {
        if (get().hasTrackedView || !token) return;

        try {
            await axios.get(
                `${PROTECTED_BASE_URL}/api/v2/song/${songId}/view`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            set({ hasTrackedView: true });
        } catch (error) {
            console.error("Failed to track view:", error);
        }
    },

    trackHistory: async (songId: string, token?: string) => {
        if (get().hasTrackedHistory || !token) return;

        try {
            await axios.post(
                `${PROTECTED_BASE_URL}/api/v2/user/history`,
                { songId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            set({ hasTrackedHistory: true });
        } catch (error) {
            console.error("Failed to track history:", error);
        }
    },

    checkAndTrackAfterDelay: (songId: string, token?: string, isPrivateSession?: boolean) => {
        const { currentSongStartTime, hasTrackedView, hasTrackedHistory } = get();
        const timeElapsed = Date.now() - currentSongStartTime;

        if (timeElapsed >= VIEW_TRACK_DELAY_MS) {
            if (!hasTrackedView) {
                get().trackView(songId, token);
            }
            if (!hasTrackedHistory && !isPrivateSession) {
                get().trackHistory(songId, token);
            }
        }
    },

    trackPlayDuration: async (songId: string, duration: number, token?: string) => {
        if (!token) return;

        try {
            await axios.post(
                `${PROTECTED_BASE_URL}/api/v2/song/${songId}/duration`,
                { duration },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            set({ lastTrackingTime: Date.now() });
        } catch (error) {
            console.error("Failed to track duration:", error);
        }
    },

    updateTotalPlayTime: (timeMs: number) => {
        set((state) => ({
            totalPlayTime: state.totalPlayTime + timeMs
        }));
    },

    reset: () => {
        set({
            currentSongStartTime: 0,
            hasTrackedView: false,
            hasTrackedHistory: false,
            totalPlayTime: 0,
            lastTrackingTime: 0
        });
    }
}));

export const usePlayerTracking = () => {
    const {
        checkShouldShowAd,
        resetAdTimer,
        setAdShown,
        onSongStart,
        checkAndTrackAfterDelay,
        trackPlayDuration,
        updateTotalPlayTime,
        shouldShowAd,
        totalPlayTime,
        reset
    } = usePlayerService();

    return {
        checkShouldShowAd,
        resetAdTimer,
        setAdShown,
        shouldShowAd,

        onSongStart,
        checkAndTrackAfterDelay,
        trackPlayDuration,
        updateTotalPlayTime,
        totalPlayTime,

        reset
    };
};
