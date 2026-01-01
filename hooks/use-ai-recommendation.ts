import axios from "axios";
import { create } from "zustand";
import NetInfo from "@react-native-community/netinfo";
import { SongResponse } from "@/types/response.types";
import { PUBLIC_BASE_URL } from "@/constants/api.config";
import { useQueue } from "./use-queue";
import { useAuth } from "./use-auth";
import {
    registerBackgroundFetch,
    setBackgroundRecommendationConfig,
    getPendingRecommendations,
    syncRecommendedStack,
    getRecommendedStackFromStorage,
    clearBackgroundTaskStorage,
    setBackgroundFetchConditions,
} from "@/services/background-task.service";

interface FetchOptions {
    isAiRecommendationEnabled: boolean;
    currentIsPlaying: boolean;
}

interface Props {
    recommendedStack: Set<string>;
    currentRecommendationId: string | null;
    isInitialized: boolean;

    setRecommendedStack: (stack: string[]) => void;
    fetchRecommendations: (recommendationId: string, options: FetchOptions) => void;
    initializeBackgroundFetch: () => Promise<void>;
    processPendingRecommendations: (options: FetchOptions) => Promise<void>;
    setRecommendationId: (id: string) => void;
    setAiRecommendationEnabled: (enabled: boolean) => void;
    clearAll: () => Promise<void>;
}

export const useAiRecommendationStore = create<Props>((set, get) => ({
    recommendedStack: new Set<string>(),
    currentRecommendationId: null,
    isInitialized: false,

    setRecommendedStack: (stack: string[]) => {
        set({ recommendedStack: new Set(stack) });
        syncRecommendedStack(stack);
    },

    setRecommendationId: (id: string) => {
        set({ currentRecommendationId: id });
        const token = useAuth.getState().user?.tokens?.accessToken || null;
        setBackgroundRecommendationConfig(id, token);
    },

    setAiRecommendationEnabled: (enabled: boolean) => {
        const queueLength = useQueue.getState().queue.length;
        const currentIsPlaying = useQueue.getState().current !== null;
        setBackgroundFetchConditions(enabled, queueLength, currentIsPlaying);
    },

    initializeBackgroundFetch: async () => {
        if (get().isInitialized) return;

        try {
            await registerBackgroundFetch();
            const storedStack = await getRecommendedStackFromStorage();
            if (storedStack.length > 0) {
                set({ recommendedStack: new Set(storedStack) });
            }

            const token = useAuth.getState().user?.tokens?.accessToken || null;
            const recommendationId = get().currentRecommendationId;
            await setBackgroundRecommendationConfig(recommendationId, token);

            set({ isInitialized: true });
        } catch (error) {
            console.error('[AIRecommendation] Failed to initialize background fetch:', error);
        }
    },

    processPendingRecommendations: async (options: FetchOptions) => {
        try {
            const queueLength = useQueue.getState().queue.length;

            if (!options.isAiRecommendationEnabled) {
                return;
            }

            if (queueLength >= 3) {
                return;
            }

            if (!options.currentIsPlaying) {
                return;
            }

            const pendingSongs = await getPendingRecommendations();
            if (pendingSongs && pendingSongs.length > 0) {
                useQueue.getState().enQueue(pendingSongs);
                const currentStack = get().recommendedStack;
                const newStack = new Set(currentStack);
                pendingSongs.forEach(song => newStack.add(song.id));
                set({ recommendedStack: newStack });
            }
        } catch (error) {
            console.error('[AIRecommendation] Failed to process pending recommendations:', error);
        }
    },

    fetchRecommendations: (recommendationId: string, options: FetchOptions) => {
        set({ currentRecommendationId: recommendationId });
        const token = useAuth.getState().user?.tokens?.accessToken || null;
        setBackgroundRecommendationConfig(recommendationId, token);

        setTimeout(async () => {
            try {
                if (!options.isAiRecommendationEnabled) {
                    return;
                }
                const queueLength = useQueue.getState().queue.length;
                if (queueLength >= 3) {
                    return;
                }
                if (!options.currentIsPlaying) {
                    return;
                }

                const netState = await NetInfo.fetch();
                if (!netState.isConnected) {
                    return;
                }

                const accessToken = useAuth.getState().user?.tokens?.accessToken || "";

                const response = await axios.post(
                    `${PUBLIC_BASE_URL}/api/v2/song/ai-shuffled`,
                    {
                        recommendationId,
                        limit: 10,
                        not: Array.from(get().recommendedStack)
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${accessToken}`
                        }
                    }
                );

                const songs = response.data.data as SongResponse[];
                if (songs && songs.length > 0) {
                    useQueue.getState().enQueue(songs);
                    const currentStack = get().recommendedStack;
                    const newStack = new Set(currentStack);
                    songs.forEach(song => newStack.add(song.id));
                    set({ recommendedStack: newStack });
                    syncRecommendedStack(Array.from(newStack));
                }

            } catch (error) {
                console.log('[AIRecommendation] Fetch error:', error);
            }
        }, 0);
    },

    clearAll: async () => {
        set({
            recommendedStack: new Set<string>(),
            currentRecommendationId: null,
            isInitialized: false,
        });
        await clearBackgroundTaskStorage();
    }
}));
