import { create, StateCreator } from "zustand";
import { Album, Song } from "@/types/response.types";
import { useQueue } from "./use-queue";

type SongWithAlbum = Song & { album: Album };

interface StackState {
    activeId: string;
    songs: SongWithAlbum[];
}

interface StackActions {
    setSongs: (songs: SongWithAlbum[]) => void;
    clearSongs: () => void;
    setActiveId: (id: string) => void;
    clearActiveId: () => void;
    isPlaying: (targetId: string) => boolean;
    play: (id: string, songs: SongWithAlbum[]) => void;
    reset: () => void;
}

type StackProps = StackState & StackActions;

const createStackStore = (): StateCreator<StackProps> => (set, get) => ({
    activeId: "",
    songs: [],
    setSongs: (songs: SongWithAlbum[]) => set({ songs }),
    clearSongs: () => set({ songs: [] }),
    setActiveId: (id: string) => set({ activeId: id }),
    clearActiveId: () => set({ activeId: "" }),
    play: (id: string, songs: SongWithAlbum[]) => set({ activeId: id, songs }),
    reset: () => set({ activeId: "", songs: [] }),

    isPlaying: (targetId: string) => {
        const { activeId, songs } = get();
        const { current } = useQueue.getState();

        if (activeId !== targetId) {
            return false;
        }

        if (songs.length === 0 || !current) {
            return false;
        }
        return songs.some(s => s.id === current.id);
    }
});

export const useGenreStack = create<StackProps>()(createStackStore());
export const useAlbumStack = create<StackProps>()(createStackStore());
export const useArtistStack = create<StackProps>()(createStackStore());
export const useMoodStack = create<StackProps>()(createStackStore());
export const usePlaylistStack = create<StackProps>()(createStackStore());

export type { StackProps, StackState, StackActions, SongWithAlbum };
