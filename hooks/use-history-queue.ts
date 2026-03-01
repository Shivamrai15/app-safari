import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import axios from 'axios';
import { useAuth } from './use-auth';
import { MAINTENANCE_BASE_URL } from '@/constants/api.config';

export const HISTORY_API_URL = `${MAINTENANCE_BASE_URL}/api/v1/history`;
export const HISTORY_STORAGE_KEY = '@history_queue';

const BATCH_FLUSH_INTERVAL_MS = 30 * 1000; // 30 seconds
const MAX_BATCH_SIZE = 20;

export interface HistoryEntry {
    userId: string;
    trackId: string;
    songDuration: number;
    playedDuration: number;
    playedAt: string; // ISO string for serialization
}

interface HistoryQueueState {
    pendingEntries: HistoryEntry[];
    isFlushing: boolean;
    lastFlushTime: number;
}

interface HistoryQueueActions {
    addEntry: (entry: HistoryEntry) => void;
    flush: () => Promise<void>;
    startAutoFlush: () => () => void;
}

type HistoryQueueStore = HistoryQueueState & HistoryQueueActions;

export const useHistoryQueue = create(
    persist<HistoryQueueStore>(
        (set, get) => ({
            pendingEntries: [],
            isFlushing: false,
            lastFlushTime: 0,

            addEntry: (entry: HistoryEntry) => {
                set((state) => ({
                    pendingEntries: [...state.pendingEntries, entry],
                }));

                // If we've accumulated enough entries, flush immediately
                const { pendingEntries } = get();
                if (pendingEntries.length >= MAX_BATCH_SIZE) {
                    get().flush();
                }
            },

            flush: async () => {
                const { pendingEntries, isFlushing } = get();

                if (isFlushing || pendingEntries.length === 0) return;

                set({ isFlushing: true });

                // Take a snapshot of current entries and clear them optimistically
                const entriesToFlush = [...pendingEntries];
                set({ pendingEntries: [] });

                try {
                    await axios.post(HISTORY_API_URL, entriesToFlush, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${useAuth.getState().user?.tokens.accessToken}`
                        },
                        timeout: 15000,
                    });

                    set({ lastFlushTime: Date.now(), isFlushing: false });
                } catch (error) {
                    // On failure, put entries back so they can be retried
                    console.error('[HistoryQueue] Failed to flush history:', error);
                    set((state) => ({
                        pendingEntries: [...entriesToFlush, ...state.pendingEntries],
                        isFlushing: false,
                    }));
                }
            },

            startAutoFlush: () => {
                // Periodic flush interval
                const intervalId = setInterval(() => {
                    const { pendingEntries } = get();
                    if (pendingEntries.length > 0) {
                        get().flush();
                    }
                }, BATCH_FLUSH_INTERVAL_MS);

                // Flush when app comes to foreground (entries may have queued in background)
                const handleAppStateChange = (nextState: AppStateStatus) => {
                    if (nextState === 'active') {
                        const { pendingEntries } = get();
                        if (pendingEntries.length > 0) {
                            get().flush();
                        }
                    }
                };

                const subscription = AppState.addEventListener('change', handleAppStateChange);

                // Return cleanup function
                return () => {
                    clearInterval(intervalId);
                    subscription.remove();
                };
            },
        }),
        {
            name: HISTORY_STORAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                pendingEntries: state.pendingEntries,
                lastFlushTime: state.lastFlushTime,
                // Exclude transient state
                isFlushing: false,
                addEntry: state.addEntry,
                flush: state.flush,
                startAutoFlush: state.startAutoFlush,
            }),
        }
    )
);
