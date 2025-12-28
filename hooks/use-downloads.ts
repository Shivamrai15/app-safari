import { create } from "zustand";
import { SongResponse } from "@/types/response.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import * as FileSystem from "expo-file-system";

export type DownloadedSong = SongResponse & {
    download: {
        isDownloading: boolean;
        downloadProgress: number;
        localPath?: string;
        localImagePath?: string;
        isDownloaded: boolean;
    }
}

export type DownloadedPlaylist = {
    id: string;
    name: string;
    image: string | null;
    color: string | null;
    songs: DownloadedSong[];
    download: {
        isDownloading: boolean;
        downloadProgress: number;
        isDownloaded: boolean;
        downloadedAt?: string;
    }
}

export type DownloadedAlbum = {
    id: string;
    name: string;
    image: string;
    color: string;
    songs: DownloadedSong[];
    download: {
        isDownloading: boolean;
        downloadProgress: number;
        isDownloaded: boolean;
        downloadedAt?: string;
    }
}

interface Props {
    songs: DownloadedSong[];
    playlists: DownloadedPlaylist[];
    albums: DownloadedAlbum[];

    setSong: (song: DownloadedSong) => void;
    updateSongProgress: (id: string, progress: number) => void;
    updateSongDownloadStatus: (
        id: string,
        isDownloading: boolean,
        isDownloaded?: boolean,
        localPath?: string
    ) => void;
    updateSongImage: (id: string, localImagePath: string) => void;
    removeSong: (id: string) => void;
    clearSongs: () => void;
    getSongById: (id: string) => DownloadedSong | undefined;

    setPlaylist: (playlist: DownloadedPlaylist) => void;
    updatePlaylistProgress: (id: string, progress: number) => void;
    updatePlaylistDownloadStatus: (
        id: string,
        isDownloading: boolean,
        isDownloaded?: boolean
    ) => void;
    addSongToPlaylist: (playlistId: string, song: DownloadedSong) => void;
    updatePlaylistSongProgress: (playlistId: string, songId: string, progress: number) => void;
    updatePlaylistSongDownloadStatus: (
        playlistId: string,
        songId: string,
        isDownloading: boolean,
        isDownloaded?: boolean,
        localPath?: string
    ) => void;
    updatePlaylistSongImage: (playlistId: string, songId: string, localImagePath: string) => void;
    removePlaylist: (id: string) => void;
    getPlaylistById: (id: string) => DownloadedPlaylist | undefined;
    getPlaylistSongById: (playlistId: string, songId: string) => DownloadedSong | undefined;

    setAlbum: (album: DownloadedAlbum) => void;
    updateAlbumProgress: (id: string, progress: number) => void;
    updateAlbumDownloadStatus: (
        id: string,
        isDownloading: boolean,
        isDownloaded?: boolean
    ) => void;
    addSongToAlbum: (albumId: string, song: DownloadedSong) => void;
    updateAlbumSongProgress: (albumId: string, songId: string, progress: number) => void;
    updateAlbumSongDownloadStatus: (
        albumId: string,
        songId: string,
        isDownloading: boolean,
        isDownloaded?: boolean,
        localPath?: string
    ) => void;
    updateAlbumSongImage: (albumId: string, songId: string, localImagePath: string) => void;
    removeAlbum: (id: string) => void;
    getAlbumById: (id: string) => DownloadedAlbum | undefined;
    getAlbumSongById: (albumId: string, songId: string) => DownloadedSong | undefined;

    deleteAllDownloads: () => Promise<void>;
}

export const useDownloads = create(
    persist<Props>(
        (set, get) => ({
            songs: [],
            playlists: [],
            albums: [],
            setSong: (song) => set({ songs: [...get().songs, song] }),
            updateSongProgress: (id, progress) =>
                set({
                    songs: get().songs.map((song) =>
                        song.id === id
                            ? {
                                ...song,
                                download: {
                                    ...song.download,
                                    downloadProgress: progress
                                }
                            }
                            : song
                    ),
                }),
            updateSongDownloadStatus: (id, isDownloading, isDownloaded = false, localPath) =>
                set({
                    songs: get().songs.map((song) =>
                        song.id === id
                            ? {
                                ...song,
                                download: {
                                    ...song.download,
                                    isDownloading,
                                    isDownloaded,
                                    localPath: localPath || song.download.localPath,
                                },
                                url: localPath || song.url,
                            }
                            : song
                    ),
                }),
            updateSongImage: (id, localImagePath) =>
                set({
                    songs: get().songs.map((song) =>
                        song.id === id
                            ? {
                                ...song,
                                download: {
                                    ...song.download,
                                    localImagePath,
                                },
                                image: localImagePath
                            }
                            : song
                    ),
                }),
            removeSong: (id) => set({ songs: get().songs.filter((song) => song.id !== id) }),
            clearSongs: () => set({ songs: [], playlists: [], albums: [] }),
            getSongById: (id) => get().songs.find((song) => song.id === id),

            setPlaylist: (playlist) => {
                const existing = get().playlists.find(p => p.id === playlist.id);
                if (existing) {
                    set({
                        playlists: get().playlists.map(p => p.id === playlist.id ? playlist : p)
                    });
                } else {
                    set({ playlists: [...get().playlists, playlist] });
                }
            },
            updatePlaylistProgress: (id, progress) =>
                set({
                    playlists: get().playlists.map((playlist) =>
                        playlist.id === id
                            ? {
                                ...playlist,
                                download: {
                                    ...playlist.download,
                                    downloadProgress: progress,
                                },
                            }
                            : playlist
                    ),
                }),
            updatePlaylistDownloadStatus: (id, isDownloading, isDownloaded = false) =>
                set({
                    playlists: get().playlists.map((playlist) =>
                        playlist.id === id
                            ? {
                                ...playlist,
                                download: {
                                    ...playlist.download,
                                    isDownloading,
                                    isDownloaded,
                                    downloadedAt: isDownloaded ? new Date().toISOString() : playlist.download.downloadedAt,
                                },
                            }
                            : playlist
                    ),
                }),
            addSongToPlaylist: (playlistId, song) =>
                set({
                    playlists: get().playlists.map((playlist) =>
                        playlist.id === playlistId
                            ? {
                                ...playlist,
                                songs: playlist.songs.some(s => s.id === song.id)
                                    ? playlist.songs.map(s => s.id === song.id ? song : s)
                                    : [...playlist.songs, song]
                            }
                            : playlist
                    ),
                }),
            updatePlaylistSongProgress: (playlistId, songId, progress) =>
                set({
                    playlists: get().playlists.map((playlist) =>
                        playlist.id === playlistId
                            ? {
                                ...playlist,
                                songs: playlist.songs.map((song) =>
                                    song.id === songId
                                        ? {
                                            ...song,
                                            download: {
                                                ...song.download,
                                                downloadProgress: progress
                                            }
                                        }
                                        : song
                                )
                            }
                            : playlist
                    ),
                }),
            updatePlaylistSongDownloadStatus: (playlistId, songId, isDownloading, isDownloaded = false, localPath) =>
                set({
                    playlists: get().playlists.map((playlist) =>
                        playlist.id === playlistId
                            ? {
                                ...playlist,
                                songs: playlist.songs.map((song) =>
                                    song.id === songId
                                        ? {
                                            ...song,
                                            download: {
                                                ...song.download,
                                                isDownloading,
                                                isDownloaded,
                                                localPath: localPath || song.download.localPath,
                                            },
                                            url: localPath || song.url,
                                        }
                                        : song
                                )
                            }
                            : playlist
                    ),
                }),
            updatePlaylistSongImage: (playlistId, songId, localImagePath) =>
                set({
                    playlists: get().playlists.map((playlist) =>
                        playlist.id === playlistId
                            ? {
                                ...playlist,
                                songs: playlist.songs.map((song) =>
                                    song.id === songId
                                        ? {
                                            ...song,
                                            download: {
                                                ...song.download,
                                                localImagePath,
                                            },
                                            image: localImagePath
                                        }
                                        : song
                                )
                            }
                            : playlist
                    ),
                }),
            removePlaylist: (id) => set({ playlists: get().playlists.filter((p) => p.id !== id) }),
            getPlaylistById: (id) => get().playlists.find((p) => p.id === id),
            getPlaylistSongById: (playlistId, songId) => {
                const playlist = get().playlists.find((p) => p.id === playlistId);
                return playlist?.songs.find((s) => s.id === songId);
            },

            setAlbum: (album) => {
                const existing = get().albums.find(a => a.id === album.id);
                if (existing) {
                    set({
                        albums: get().albums.map(a => a.id === album.id ? album : a)
                    });
                } else {
                    set({ albums: [...get().albums, album] });
                }
            },
            updateAlbumProgress: (id, progress) =>
                set({
                    albums: get().albums.map((album) =>
                        album.id === id
                            ? {
                                ...album,
                                download: {
                                    ...album.download,
                                    downloadProgress: progress,
                                },
                            }
                            : album
                    ),
                }),
            updateAlbumDownloadStatus: (id, isDownloading, isDownloaded = false) =>
                set({
                    albums: get().albums.map((album) =>
                        album.id === id
                            ? {
                                ...album,
                                download: {
                                    ...album.download,
                                    isDownloading,
                                    isDownloaded,
                                    downloadedAt: isDownloaded ? new Date().toISOString() : album.download.downloadedAt,
                                },
                            }
                            : album
                    ),
                }),
            addSongToAlbum: (albumId, song) =>
                set({
                    albums: get().albums.map((album) =>
                        album.id === albumId
                            ? {
                                ...album,
                                songs: album.songs.some(s => s.id === song.id)
                                    ? album.songs.map(s => s.id === song.id ? song : s)
                                    : [...album.songs, song]
                            }
                            : album
                    ),
                }),
            updateAlbumSongProgress: (albumId, songId, progress) =>
                set({
                    albums: get().albums.map((album) =>
                        album.id === albumId
                            ? {
                                ...album,
                                songs: album.songs.map((song) =>
                                    song.id === songId
                                        ? {
                                            ...song,
                                            download: {
                                                ...song.download,
                                                downloadProgress: progress
                                            }
                                        }
                                        : song
                                )
                            }
                            : album
                    ),
                }),
            updateAlbumSongDownloadStatus: (albumId, songId, isDownloading, isDownloaded = false, localPath) =>
                set({
                    albums: get().albums.map((album) =>
                        album.id === albumId
                            ? {
                                ...album,
                                songs: album.songs.map((song) =>
                                    song.id === songId
                                        ? {
                                            ...song,
                                            download: {
                                                ...song.download,
                                                isDownloading,
                                                isDownloaded,
                                                localPath: localPath || song.download.localPath,
                                            },
                                            url: localPath || song.url,
                                        }
                                        : song
                                )
                            }
                            : album
                    ),
                }),
            updateAlbumSongImage: (albumId, songId, localImagePath) =>
                set({
                    albums: get().albums.map((album) =>
                        album.id === albumId
                            ? {
                                ...album,
                                songs: album.songs.map((song) =>
                                    song.id === songId
                                        ? {
                                            ...song,
                                            download: {
                                                ...song.download,
                                                localImagePath,
                                            },
                                            image: localImagePath
                                        }
                                        : song
                                )
                            }
                            : album
                    ),
                }),
            removeAlbum: (id) => set({ albums: get().albums.filter((a) => a.id !== id) }),
            getAlbumById: (id) => get().albums.find((a) => a.id === id),
            getAlbumSongById: (albumId, songId) => {
                const album = get().albums.find((a) => a.id === albumId);
                return album?.songs.find((s) => s.id === songId);
            },

            deleteAllDownloads: async () => {
                const { songs, playlists, albums } = get();

                const deleteFile = async (path: string | undefined) => {
                    if (!path) return;
                    try {
                        const file = new FileSystem.File(path);
                        if (file.exists) {
                            file.delete();
                        }
                    } catch (error) {
                        console.error(`Failed to delete file: ${path}`, error);
                    }
                };

                for (const song of songs) {
                    await deleteFile(song.download.localPath);
                    await deleteFile(song.download.localImagePath);
                }

                for (const playlist of playlists) {
                    for (const song of playlist.songs) {
                        await deleteFile(song.download.localPath);
                        await deleteFile(song.download.localImagePath);
                    }
                }

                for (const album of albums) {
                    for (const song of album.songs) {
                        await deleteFile(song.download.localPath);
                        await deleteFile(song.download.localImagePath);
                    }
                }

                set({ songs: [], playlists: [], albums: [] });
            },
        }),
        {
            name: "downloads-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
