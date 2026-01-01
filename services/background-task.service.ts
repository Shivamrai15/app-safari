import axios from 'axios';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PUBLIC_BASE_URL } from '@/constants/api.config';
import { SongResponse } from '@/types/response.types';


export const AI_RECOMMENDATION_TASK = 'AI_RECOMMENDATION_BACKGROUND_FETCH';


const STORAGE_KEYS = {
    PENDING_RECOMMENDATIONS: '@bg_pending_recommendations',
    RECOMMENDATION_CONFIG: '@bg_recommendation_config',
    RECOMMENDED_STACK: '@bg_recommended_stack',
    FETCH_CONDITIONS: '@bg_fetch_conditions',
};

interface RecommendationConfig {
    recommendationId: string | null;
    accessToken: string | null;
}

interface PendingRecommendations {
    songs: SongResponse[];
    fetchedAt: number;
}

interface FetchConditions {
    isAiRecommendationEnabled: boolean;
    queueLength: number;
    currentIsPlaying: boolean;
}

TaskManager.defineTask(AI_RECOMMENDATION_TASK, async () => {
    try {

        const conditionsStr = await AsyncStorage.getItem(STORAGE_KEYS.FETCH_CONDITIONS);
        if (conditionsStr) {
            const conditions: FetchConditions = JSON.parse(conditionsStr);

            if (!conditions.isAiRecommendationEnabled) {
                return BackgroundTask.BackgroundTaskResult.Success;
            }

            if (conditions.queueLength >= 3) {
                return BackgroundTask.BackgroundTaskResult.Success;
            }

            if (!conditions.currentIsPlaying) {
                return BackgroundTask.BackgroundTaskResult.Success;
            }
        }

        const configStr = await AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDATION_CONFIG);
        if (!configStr) {
            return BackgroundTask.BackgroundTaskResult.Success;
        }

        const config: RecommendationConfig = JSON.parse(configStr);
        if (!config.recommendationId || !config.accessToken) {
            return BackgroundTask.BackgroundTaskResult.Success;
        }

        const stackStr = await AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDED_STACK);
        const recommendedStack: string[] = stackStr ? JSON.parse(stackStr) : [];

        const response = await axios.post(
            `${PUBLIC_BASE_URL}/api/v2/song/ai-shuffled`,
            {
                recommendationId: config.recommendationId,
                limit: 10,
                not: recommendedStack
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.accessToken}`
                },
                timeout: 30000
            }
        );

        const songs = response.data as SongResponse[];
        if (songs && songs.length > 0) {

            const pending: PendingRecommendations = {
                songs,
                fetchedAt: Date.now()
            };
            await AsyncStorage.setItem(
                STORAGE_KEYS.PENDING_RECOMMENDATIONS,
                JSON.stringify(pending)
            );

            const newStack = [...recommendedStack, ...songs.map(s => s.id)];
            await AsyncStorage.setItem(
                STORAGE_KEYS.RECOMMENDED_STACK,
                JSON.stringify(newStack)
            );
            return BackgroundTask.BackgroundTaskResult.Success;
        }
        return BackgroundTask.BackgroundTaskResult.Success;

    } catch (error) {
        console.error('[BackgroundTask] Error fetching recommendations:', error);
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});


export async function registerBackgroundFetch(): Promise<void> {
    try {
        const status = await BackgroundTask.getStatusAsync();

        if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
            return;
        }

        const isRegistered = await TaskManager.isTaskRegisteredAsync(AI_RECOMMENDATION_TASK);
        if (isRegistered) {
            return;
        }

        await BackgroundTask.registerTaskAsync(AI_RECOMMENDATION_TASK, {
            minimumInterval: 15 * 60,
        });

    } catch (error) {
        console.error('[BackgroundTask] Failed to register background task:', error);
    }
}

export async function unregisterBackgroundFetch(): Promise<void> {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(AI_RECOMMENDATION_TASK);
        if (isRegistered) {
            await BackgroundTask.unregisterTaskAsync(AI_RECOMMENDATION_TASK);
        }
    } catch (error) {
        console.error('[BackgroundTask] Failed to unregister background task:', error);
    }
}

export async function setBackgroundRecommendationConfig(
    recommendationId: string | null,
    accessToken: string | null
): Promise<void> {
    const config: RecommendationConfig = {
        recommendationId,
        accessToken
    };
    await AsyncStorage.setItem(
        STORAGE_KEYS.RECOMMENDATION_CONFIG,
        JSON.stringify(config)
    );
}

export async function getPendingRecommendations(): Promise<SongResponse[] | null> {
    try {
        const pendingStr = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_RECOMMENDATIONS);
        if (!pendingStr) return null;

        const pending: PendingRecommendations = JSON.parse(pendingStr);
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_RECOMMENDATIONS);

        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (pending.fetchedAt > oneHourAgo) {
            return pending.songs;
        }

        return null;
    } catch (error) {
        console.error('[BackgroundTask] Error getting pending recommendations:', error);
        return null;
    }
}

export async function syncRecommendedStack(stack: string[]): Promise<void> {
    await AsyncStorage.setItem(
        STORAGE_KEYS.RECOMMENDED_STACK,
        JSON.stringify(stack)
    );
}

export async function getRecommendedStackFromStorage(): Promise<string[]> {
    try {
        const stackStr = await AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDED_STACK);
        return stackStr ? JSON.parse(stackStr) : [];
    } catch {
        return [];
    }
}

export async function clearBackgroundTaskStorage(): Promise<void> {
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.PENDING_RECOMMENDATIONS,
        STORAGE_KEYS.RECOMMENDATION_CONFIG,
        STORAGE_KEYS.RECOMMENDED_STACK,
        STORAGE_KEYS.FETCH_CONDITIONS,
    ]);
}

export async function setBackgroundFetchConditions(
    isAiRecommendationEnabled: boolean,
    queueLength: number,
    currentIsPlaying: boolean
): Promise<void> {
    const conditions: FetchConditions = {
        isAiRecommendationEnabled,
        queueLength,
        currentIsPlaying
    };
    await AsyncStorage.setItem(
        STORAGE_KEYS.FETCH_CONDITIONS,
        JSON.stringify(conditions)
    );
}

export async function isBackgroundFetchAvailable(): Promise<boolean> {
    const status = await BackgroundTask.getStatusAsync();
    return status === BackgroundTask.BackgroundTaskStatus.Available;
}