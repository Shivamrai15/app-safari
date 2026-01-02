import axios from "axios";
import { create } from "zustand";
import { fetcher } from "@/lib/fetcher";
import { useCallback, useEffect } from "react";
import { PROTECTED_BASE_URL } from "@/constants/api.config";
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { log } from "@/services/log.service";


interface LikedSongsState {
    songIds: string[];
    isLoading: boolean;
    error: string | null;
    lastSynced: number | null;
}


interface LikedSongsActions {
    setSongIds: (ids: string[]) => void;
    addSongId: (id: string) => void;
    removeSongId: (id: string) => void;
    toggleSongId: (id: string) => void;
    isLiked: (id: string) => boolean;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    reset: () => void;
}

type LikedSongsStore = LikedSongsState & LikedSongsActions;

const initialState: LikedSongsState = {
    songIds: [],
    isLoading: false,
    error: null,
    lastSynced: null,
};


export const useLikedSongs = create<LikedSongsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setSongIds: (ids: string[]) =>
                set({
                    songIds: ids,
                    lastSynced: Date.now(),
                    error: null
                }),

            addSongId: (id: string) => {
                const currentIds = get().songIds;
                if (!currentIds.includes(id)) {
                    set({
                        songIds: [...currentIds, id],
                        error: null
                    });
                }
            },

            removeSongId: (id: string) => {
                const filteredIds = get().songIds.filter((songId) => songId !== id);
                set({
                    songIds: filteredIds,
                    error: null
                });
            },

            toggleSongId: (id: string) => {
                const currentIds = get().songIds;
                const isLiked = currentIds.includes(id);

                if (isLiked) {
                    get().removeSongId(id);
                } else {
                    get().addSongId(id);
                }
            },

            isLiked: (id: string) => get().songIds.includes(id),

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            setError: (error: string | null) => set({ error }),

            clearError: () => set({ error: null }),

            reset: () => set(initialState),
        }),
        {
            name: 'liked-songs-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                songIds: state.songIds,
                lastSynced: state.lastSynced
            }),
        }
    )
);

export const useLikedSongsSync = (token?: string, autoSync: boolean = true) => {
    const { setSongIds, setLoading, setError } = useLikedSongs();

    const fetchLikedSongs = useCallback(async () => {
        if (!token) {
            setError('No authentication token provided');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: `api/v2/song/liked`,
                token,
            });

            if (data?.data && Array.isArray(data.data)) {
                setSongIds(data.data as string[]);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Error fetching liked songs";
            console.error("Error fetching liked songs:", error);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token, setSongIds, setLoading, setError]);

    useEffect(() => {
        if (autoSync && token) {
            fetchLikedSongs();
        }
    }, [token, autoSync, fetchLikedSongs]);

    return {
        refetch: fetchLikedSongs,
        isLoading: useLikedSongs((state) => state.isLoading),
        error: useLikedSongs((state) => state.error),
    };
};


export const useRemoveLikedSong = (token?: string) => {
    const { removeSongId, addSongId } = useLikedSongs();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (songId: string) => {
            if (!token) {
                throw new Error('Authentication token is required');
            }

            const response = await axios.delete(
                `${PROTECTED_BASE_URL}/api/v2/song/liked/${songId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        },
        onMutate: async (songId: string) => {
            // Optimistic update
            removeSongId(songId);
            return { songId };
        },
        onError: (error, songId, context) => {
            if (context?.songId) {
                addSongId(context.songId);
            }
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'low',
                    errorCode: 'REMOVE_LIKED_SONG_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                    },
                    navigationContext: { currentScreen: 'use-liked-songs' },
                });
            }
        },
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
        },
    });
};


export const useAddLikedSong = (token?: string) => {
    const { addSongId, removeSongId } = useLikedSongs();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (songId: string) => {
            if (!token) {
                throw new Error('Authentication token is required');
            }

            const response = await axios.post(
                `${PROTECTED_BASE_URL}/api/v2/song/liked`,
                { songId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        },
        onMutate: async (songId: string) => {
            addSongId(songId);
            return { songId };
        },
        onError: (error, songId, context) => {
            if (context?.songId) {
                removeSongId(context.songId);
            }
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'low',
                    errorCode: 'ADD_LIKED_SONG_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                    },
                    navigationContext: { currentScreen: 'use-liked-songs' },
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
        },
    });
};

export const useToggleLikedSong = (token?: string) => {
    const { isLiked } = useLikedSongs();
    const addMutation = useAddLikedSong(token);
    const removeMutation = useRemoveLikedSong(token);

    const toggleLike = useCallback(
        (songId: string) => {
            if (isLiked(songId)) {
                return removeMutation.mutate(songId);
            } else {
                return addMutation.mutate(songId);
            }
        },
        [isLiked, addMutation, removeMutation]
    );

    return {
        isLiked,
        toggleLike,
        isLoading: addMutation.isPending || removeMutation.isPending,
        error: addMutation.error || removeMutation.error,
    };
};
