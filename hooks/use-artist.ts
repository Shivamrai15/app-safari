import axios from "axios";
import { create } from "zustand";
import { use, useEffect, useMemo } from "react";
import { fetcher } from "@/lib/fetcher";
import { useMutation } from "@tanstack/react-query";
import { Album, Artist, Song } from "@/types/response.types";
import { useQueue } from "./use-queue";
import { log } from "@/services/log.service";

interface useFollowingProps {
    followings: Artist[];
    setFollowings: (artists: Artist[]) => void;
    addFollowing: (artist: Artist) => void;
    removeFollowing: (artistId: string) => void;
}

export const useFollowing = create<useFollowingProps>((set, get) => ({
    followings: [],
    setFollowings: (artists: Artist[]) => set({ followings: artists }),
    addFollowing: (artist: Artist) => {
        const currentFollowings = get().followings;
        if (!currentFollowings.some(a => a.id === artist.id)) {
            set({ followings: [...currentFollowings, artist] });
        }
    },
    removeFollowing: (artistId: string) => {
        const currentFollowings = get().followings;
        set({ followings: currentFollowings.filter(a => a.id !== artistId) });
    }
}));

export const useFollowingSync = (token?: string) => {
    const { setFollowings } = useFollowing();
    const mutation = useMutation({
        mutationFn: async () => {
            const data = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: `api/v2/artist/followings`,
                token: token
            });
            return data.data as Artist[];
        },
        mutationKey: ['user-followings'],
        onSuccess: (data) => {
            setFollowings(data);
        }
    });

    useEffect(() => {
        if (token) {
            mutation.mutate();
        }
    }, [token]);

    return mutation;
}

export const useFollowArtist = (artist: Artist, token?: string) => {
    const { addFollowing, removeFollowing } = useFollowing();

    return useMutation({
        mutationFn: async () => {
            await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: `api/v2/artist/${artist.id}/subscribe`,
                token: token
            });
        },
        mutationKey: ['follow-artist', artist.id],
        onMutate: async () => {
            addFollowing(artist);
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'low',
                    errorCode: 'FOLLOW_ARTIST_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                    },
                    navigationContext: { currentScreen: 'use-artist' },
                });
            }
            removeFollowing(artist.id);
        }
    });
};


export const useUnfollowArtist = (artist: Artist, token?: string) => {
    const { addFollowing, removeFollowing } = useFollowing();

    return useMutation({
        mutationFn: async () => {
            await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: `api/v2/artist/${artist.id}/unsubscribe`,
                token: token
            });
        },
        mutationKey: ['unfollow-artist', artist.id],
        onMutate: async () => {
            removeFollowing(artist.id);
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'low',
                    errorCode: 'UNFOLLOW_ARTIST_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                    },
                    navigationContext: { currentScreen: 'use-artist' },
                });
            }
            addFollowing(artist);
        }
    });
};



export const useArtist = (artist: Artist, token?: string) => {
    const { followings } = useFollowing();
    const followMutation = useFollowArtist(artist, token);
    const unfollowMutation = useUnfollowArtist(artist, token);

    const isSubscribed = followings.some(a => a.id === artist.id);
    const isLoading = followMutation.isPending || unfollowMutation.isPending;

    const toggleSubscription = async () => {
        try {
            if (isSubscribed) {
                await unfollowMutation.mutateAsync();
            } else {
                await followMutation.mutateAsync();
            }
        } catch (error) {
            console.error('Error toggling subscription:', error);
            throw error;
        }
    };

    return {
        isSubscribed,
        isLoading,
        toggleSubscription,
        error: followMutation.error || unfollowMutation.error
    };
};


interface ArtistStackProps {
    list: (Song & { album: Album })[];
    listId: string;
    setList: (songs: (Song & { album: Album })[]) => void;
    clearList: () => void;
    setListId: (id: string) => void;
}

export const useArtistStorage = create<ArtistStackProps>((set, get) => ({
    list: [],
    listId: "",
    setList: (songs) => {
        // Validate input
        if (!Array.isArray(songs)) {
            console.error('setList: Expected an array of songs, received:', songs);
            return;
        }

        const currentStack = get().list;
        const uniqueSongs = songs.filter(
            song => !currentStack.some(sSong => sSong.id === song.id)
        );
        set({ list: [...currentStack, ...uniqueSongs] });
    },
    clearList: () => set({ list: [], listId: "" }),
    setListId: (id) => set({ listId: id })
}));


export const useArtistSongs = (artistId: string, token?: string) => {
    const { list, listId, setList, clearList, setListId } = useArtistStorage();
    const { current, clear, priorityEnqueue } = useQueue();

    const mutation = useMutation({
        mutationFn: async () => {
            if (!token) {
                throw new Error('Authentication token is required');
            }

            const response = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: `api/v2/artist/${artistId}/songs`,
                token: token
            });

            const songsData = response?.data || response;

            if (!Array.isArray(songsData)) {
                console.error('Invalid artist songs response:', response);
                return [];
            }

            return songsData as (Song & { album: Album })[];
        },
        mutationKey: ['artist-songs', artistId],
        onSuccess: (data) => {
            if (Array.isArray(data) && data.length > 0) {
                clear();
                clearList();
                priorityEnqueue(data);
                setList(data);
                setListId(artistId);
            }
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'medium',
                    errorCode: 'ARTIST_SONGS_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                    },
                    navigationContext: { currentScreen: 'use-artist' },
                });
            }
        }
    });

    const isCurrentArtist = useMemo(() => {

        if (listId !== artistId) {
            return false;
        }

        if (list.length === 0 || !current) {
            return false;
        }

        return list.some(song => song.id === current.id);
    }, [listId, artistId, list.length, current?.id]);

    const hasSongs = list.length > 0 && listId === artistId;

    const playArtistSongs = async (shuffle: boolean = false) => {
        try {
            if (listId !== artistId || list.length === 0) {
                await mutation.mutateAsync();
            }
        } catch (error) {
            console.error('Error playing artist songs:', error);
            throw error;
        }
    };

    return {
        songs: list,
        hasSongs,

        isCurrentArtist,
        isLoadingSongs: mutation.isPending,

        playArtistSongs,
        refetchSongs: mutation.mutate,
        error: mutation.error,
        mutation
    };
};
