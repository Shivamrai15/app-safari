import axios from 'axios';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHistoryQueue, HistoryEntry, HISTORY_API_URL, HISTORY_STORAGE_KEY } from '@/hooks/use-history-queue';
import { useAuth } from '@/hooks/use-auth';

// ── Background Task (global scope) ──────────────────────────────────────────

export const HISTORY_SYNC_TASK = 'HISTORY_SYNC_BACKGROUND_TASK';

/**
 * Background task that reads pending history entries directly from AsyncStorage
 * and POSTs them to the API. This runs even when the app is backgrounded.
 *
 * Must be defined at the top-level module scope (not inside a component).
 */
TaskManager.defineTask(HISTORY_SYNC_TASK, async () => {
    try {
        const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (!raw) return BackgroundTask.BackgroundTaskResult.Success;

        const stored = JSON.parse(raw);
        const entries: HistoryEntry[] = stored?.state?.pendingEntries ?? [];

        if (entries.length === 0) {
            return BackgroundTask.BackgroundTaskResult.Success;
        }

        await axios.post(HISTORY_API_URL, entries, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${useAuth.getState().user?.tokens.accessToken}`
            },
            timeout: 15000,
        });
        

        // Clear flushed entries from storage
        const updated = {
            ...stored,
            state: {
                ...stored.state,
                pendingEntries: [],
                lastFlushTime: Date.now(),
            },
        };
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));

        return BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
        console.error('[HistorySync] Background task failed:', error);
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});

// ── Registration helpers ────────────────────────────────────────────────────

export async function registerHistorySyncTask(): Promise<void> {
    try {
        const status = await BackgroundTask.getStatusAsync();
        if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
            console.warn('[HistorySync] Background tasks are restricted on this device');
            return;
        }

        const isRegistered = await TaskManager.isTaskRegisteredAsync(HISTORY_SYNC_TASK);
        if (isRegistered) return;

        await BackgroundTask.registerTaskAsync(HISTORY_SYNC_TASK, {
            minimumInterval: 15 * 60, // 15 minutes (platform minimum)
        });
    } catch (error) {
        console.error('[HistorySync] Failed to register background task:', error);
    }
}

export async function unregisterHistorySyncTask(): Promise<void> {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(HISTORY_SYNC_TASK);
        if (isRegistered) {
            await BackgroundTask.unregisterTaskAsync(HISTORY_SYNC_TASK);
        }
    } catch (error) {
        console.error('[HistorySync] Failed to unregister background task:', error);
    }
}

// ── Foreground helpers ──────────────────────────────────────────────────────

/**
 * Records a song play into the history queue.
 * The entry is persisted to AsyncStorage and batched for API submission.
 */
export function recordSongHistory(params: {
    userId: string;
    trackId: string;
    songDuration: number;
    playedDuration: number;
}) {
    const entry: HistoryEntry = {
        userId: params.userId,
        trackId: params.trackId,
        songDuration: params.songDuration,
        playedDuration: params.playedDuration,
        playedAt: new Date().toISOString(),
    };

    useHistoryQueue.getState().addEntry(entry);
}

/**
 * Immediately attempt to flush any pending history entries.
 * Safe to call from anywhere — it's a no-op if nothing is pending or already flushing.
 */
export async function flushHistory() {
    await useHistoryQueue.getState().flush();
}
