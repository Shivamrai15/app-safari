import { DownloadedSong, DownloadedPlaylist, DownloadedAlbum, useDownloads } from "@/hooks/use-downloads";
import { SongResponse, AlbumResponse, PlaylistResponse } from "@/types/response.types";
import { Directory, File, Paths } from "expo-file-system";

interface DownloadProgress {
    totalBytes: number;
    downloadedBytes: number;
    progress: number;
}

export class DownloadManager {
    private static instance: DownloadManager;
    private activeDownloads: Map<string, AbortController> = new Map();
    private activePlaylistDownloads: Map<string, AbortController> = new Map();
    private activeAlbumDownloads: Map<string, AbortController> = new Map();
    private downloadCallbacks: Map<
        string,
        (progress: DownloadProgress) => void
    > = new Map();

    private constructor() { }

    public static getInstance(): DownloadManager {
        if (!DownloadManager.instance) {
            DownloadManager.instance = new DownloadManager();
        }
        return DownloadManager.instance;
    }

    public async downloadSong(
        song: SongResponse,
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<string | null> {
        const {
            updateSongDownloadStatus,
            updateSongProgress,
            setSong,
            getSongById,
        } = useDownloads.getState();

        if (this.activeDownloads.has(song.id)) {
            console.log(`Song ${song.id} is already being downloaded`);
            return null;
        }

        const abortController = new AbortController();
        this.activeDownloads.set(song.id, abortController);

        try {
            const existingSong = getSongById(song.id);
            if (!existingSong) {
                const downloadSong: DownloadedSong = {
                    ...song,
                    download: {
                        isDownloading: true,
                        downloadProgress: 0,
                        isDownloaded: false,
                    }
                };
                setSong(downloadSong);
            } else {
                updateSongDownloadStatus(song.id, true, false);
            }

            if (onProgress) this.downloadCallbacks.set(song.id, onProgress);

            const downloadsDir = await this.ensureDownloadsDirectory();
            const fileName = `${song.id}_${song.name.replace(
                /[^a-zA-Z0-9]/g,
                "_"
            )}.m3u8`;

            const localPath = new File(downloadsDir, fileName).uri;

            const success = await this.downloadSongAndImageBackground(
                song,
                localPath,
                song.id,
                abortController.signal
            );

            if (success && !abortController.signal.aborted) {
                updateSongDownloadStatus(song.id, false, true, localPath);
                console.log(`Downloaded ${song.name} to ${localPath}`);
                return localPath;
            } else {
                updateSongDownloadStatus(song.id, false, false);
                return null;
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error(`Error downloading song ${song.id}:`, error);
                updateSongDownloadStatus(song.id, false, false);
            }
            return null;
        } finally {
            this.activeDownloads.delete(song.id);
            this.downloadCallbacks.delete(song.id);
        }
    }

    public async downloadPlaylist(
        playlist: PlaylistResponse,
        songs: SongResponse[],
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<boolean> {
        const {
            setPlaylist,
            updatePlaylistProgress,
            updatePlaylistDownloadStatus,
            getPlaylistById,
            addSongToPlaylist,
            updatePlaylistSongProgress,
            updatePlaylistSongDownloadStatus,
            updatePlaylistSongImage,
            getPlaylistSongById,
        } = useDownloads.getState();

        if (this.activePlaylistDownloads.has(playlist.id)) {
            console.log(`Playlist ${playlist.id} is already being downloaded`);
            return false;
        }

        const abortController = new AbortController();
        this.activePlaylistDownloads.set(playlist.id, abortController);

        try {
            const existingPlaylist = getPlaylistById(playlist.id);
            if (!existingPlaylist) {
                const downloadPlaylist: DownloadedPlaylist = {
                    id: playlist.id,
                    name: playlist.name,
                    image: playlist.image,
                    color: playlist.color,
                    songs: [],
                    download: {
                        isDownloading: true,
                        downloadProgress: 0,
                        isDownloaded: false,
                    }
                };
                setPlaylist(downloadPlaylist);
            } else {
                updatePlaylistDownloadStatus(playlist.id, true, false);
            }

            const totalSongs = songs.length;
            let completedSongs = 0;

            for (const song of songs) {
                if (abortController.signal.aborted) {
                    break;
                }

                const existingSong = getPlaylistSongById(playlist.id, song.id);

                if (existingSong?.download.isDownloaded) {
                    completedSongs++;
                    const progress = Math.round((completedSongs / totalSongs) * 100);
                    updatePlaylistProgress(playlist.id, progress);
                    continue;
                }
                
                await this.downloadSongForPlaylist(
                    playlist.id,
                    song,
                    abortController.signal,
                    addSongToPlaylist,
                    updatePlaylistSongProgress,
                    updatePlaylistSongDownloadStatus,
                    updatePlaylistSongImage
                );

                completedSongs++;
                const progress = Math.round((completedSongs / totalSongs) * 100);
                updatePlaylistProgress(playlist.id, progress);

                if (onProgress) {
                    onProgress({
                        totalBytes: totalSongs,
                        downloadedBytes: completedSongs,
                        progress,
                    });
                }
            }

            if (!abortController.signal.aborted) {
                updatePlaylistDownloadStatus(playlist.id, false, true);
                console.log(`Downloaded playlist ${playlist.name}`);
                return true;
            } else {
                updatePlaylistDownloadStatus(playlist.id, false, false);
                return false;
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error(`Error downloading playlist ${playlist.id}:`, error);
                updatePlaylistDownloadStatus(playlist.id, false, false);
            }
            return false;
        } finally {
            this.activePlaylistDownloads.delete(playlist.id);
        }
    }

    public async downloadAlbum(
        album: AlbumResponse,
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<boolean> {
        const {
            setAlbum,
            updateAlbumProgress,
            updateAlbumDownloadStatus,
            getAlbumById,
            addSongToAlbum,
            updateAlbumSongProgress,
            updateAlbumSongDownloadStatus,
            updateAlbumSongImage,
            getAlbumSongById,
        } = useDownloads.getState();

        if (this.activeAlbumDownloads.has(album.id)) {
            console.log(`Album ${album.id} is already being downloaded`);
            return false;
        }

        const abortController = new AbortController();
        this.activeAlbumDownloads.set(album.id, abortController);

        try {
            const existingAlbum = getAlbumById(album.id);
            if (!existingAlbum) {
                const downloadAlbum: DownloadedAlbum = {
                    id: album.id,
                    name: album.name,
                    image: album.image,
                    color: album.color,
                    songs: [],
                    download: {
                        isDownloading: true,
                        downloadProgress: 0,
                        isDownloaded: false,
                    }
                };
                setAlbum(downloadAlbum);
            } else {
                updateAlbumDownloadStatus(album.id, true, false);
            }

            const totalSongs = album.songs.length;
            let completedSongs = 0;

            for (const song of album.songs) {
                if (abortController.signal.aborted) {
                    break;
                }

                const existingSong = getAlbumSongById(album.id, song.id);

                if (existingSong?.download.isDownloaded) {
                    completedSongs++;
                    const progress = Math.round((completedSongs / totalSongs) * 100);
                    updateAlbumProgress(album.id, progress);
                    continue;
                }

                // Download song and store in album
                await this.downloadSongForAlbum(
                    album.id,
                    song,
                    abortController.signal,
                    addSongToAlbum,
                    updateAlbumSongProgress,
                    updateAlbumSongDownloadStatus,
                    updateAlbumSongImage
                );

                completedSongs++;
                const progress = Math.round((completedSongs / totalSongs) * 100);
                updateAlbumProgress(album.id, progress);

                if (onProgress) {
                    onProgress({
                        totalBytes: totalSongs,
                        downloadedBytes: completedSongs,
                        progress,
                    });
                }
            }

            if (!abortController.signal.aborted) {
                updateAlbumDownloadStatus(album.id, false, true);
                console.log(`Downloaded album ${album.name}`);
                return true;
            } else {
                updateAlbumDownloadStatus(album.id, false, false);
                return false;
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error(`Error downloading album ${album.id}:`, error);
                updateAlbumDownloadStatus(album.id, false, false);
            }
            return false;
        } finally {
            this.activeAlbumDownloads.delete(album.id);
        }
    }

    private async downloadSongForPlaylist(
        playlistId: string,
        song: SongResponse,
        signal: AbortSignal,
        addSongToPlaylist: (playlistId: string, song: DownloadedSong) => void,
        updatePlaylistSongProgress: (playlistId: string, songId: string, progress: number) => void,
        updatePlaylistSongDownloadStatus: (playlistId: string, songId: string, isDownloading: boolean, isDownloaded?: boolean, localPath?: string) => void,
        updatePlaylistSongImage: (playlistId: string, songId: string, localImagePath: string) => void
    ): Promise<boolean> {
        try {
            const downloadsDir = await this.ensureDownloadsDirectory();
            const fileName = `${song.id}.m3u8`;
            const localPath = new File(downloadsDir, fileName).uri;

            // Add song to playlist first
            const downloadedSong: DownloadedSong = {
                ...song,
                download: {
                    isDownloading: true,
                    downloadProgress: 0,
                    isDownloaded: false,
                }
            };
            addSongToPlaylist(playlistId, downloadedSong);

            // Download image
            const imageLocalPath = await this.downloadImageBackground(song.image, song.id, signal);
            if (imageLocalPath) {
                updatePlaylistSongImage(playlistId, song.id, imageLocalPath);
            }

            if (signal.aborted) return false;

            // Download audio
            const success = await this.downloadM3U8FileBackgroundForCollection(
                song.url,
                localPath,
                song.id,
                signal,
                (progress) => updatePlaylistSongProgress(playlistId, song.id, progress)
            );

            if (success) {
                updatePlaylistSongDownloadStatus(playlistId, song.id, false, true, localPath);
                console.log(`Downloaded song ${song.id} for playlist ${playlistId}`);
                return true;
            }
            return false;
        } catch (error: any) {
            console.error(`Error downloading song ${song.id} for playlist:`, error);
            return false;
        }
    }

    private async downloadSongForAlbum(
        albumId: string,
        song: SongResponse,
        signal: AbortSignal,
        addSongToAlbum: (albumId: string, song: DownloadedSong) => void,
        updateAlbumSongProgress: (albumId: string, songId: string, progress: number) => void,
        updateAlbumSongDownloadStatus: (albumId: string, songId: string, isDownloading: boolean, isDownloaded?: boolean, localPath?: string) => void,
        updateAlbumSongImage: (albumId: string, songId: string, localImagePath: string) => void
    ): Promise<boolean> {
        try {
            const downloadsDir = await this.ensureDownloadsDirectory();
            const fileName = `${song.id}.m3u8`;
            const localPath = new File(downloadsDir, fileName).uri;

            // Add song to album first
            const downloadedSong: DownloadedSong = {
                ...song,
                download: {
                    isDownloading: true,
                    downloadProgress: 0,
                    isDownloaded: false,
                }
            };
            addSongToAlbum(albumId, downloadedSong);

            // Download image
            const imageLocalPath = await this.downloadImageBackground(song.image, song.id, signal);
            if (imageLocalPath) {
                updateAlbumSongImage(albumId, song.id, imageLocalPath);
            }

            if (signal.aborted) return false;

            // Download audio
            const success = await this.downloadM3U8FileBackgroundForCollection(
                song.url,
                localPath,
                song.id,
                signal,
                (progress) => updateAlbumSongProgress(albumId, song.id, progress)
            );

            if (success) {
                updateAlbumSongDownloadStatus(albumId, song.id, false, true, localPath);
                console.log(`Downloaded song ${song.id} for album ${albumId}`);
                return true;
            }
            return false;
        } catch (error: any) {
            console.error(`Error downloading song ${song.id} for album:`, error);
            return false;
        }
    }

    private async downloadM3U8FileBackgroundForCollection(
        url: string,
        localPath: string,
        songId: string,
        signal: AbortSignal,
        onProgress: (progress: number) => void
    ): Promise<boolean> {
        try {
            if (signal.aborted) return false;

            const playlistResponse = await fetch(url, { signal });
            if (!playlistResponse.ok) {
                throw new Error(`Failed to fetch M3U8: ${playlistResponse.status}`);
            }

            const playlistContent = await playlistResponse.text();
            await this.yieldToMainThread();

            if (signal.aborted) return false;

            const segmentUrls = this.parseM3U8Segments(playlistContent, url);
            const songDir = localPath.replace(".m3u8", "");
            const segmentsDirName = `${songDir}_segments`;
            const segmentsDir = new Directory(segmentsDirName);

            if (!segmentsDir.exists) {
                segmentsDir.create({ intermediates: true });
            }

            const totalFiles = segmentUrls.length + 2;
            let completedFiles = 2;
            onProgress(Math.round((completedFiles / totalFiles) * 100));

            const downloadedSegments = await this.downloadSegmentsBackground(
                segmentUrls,
                segmentsDir,
                songId,
                signal,
                (progress: { completed: number; total: number }) => {
                    completedFiles = 2 + progress.completed;
                    const progressPercent = Math.round((completedFiles / totalFiles) * 100);
                    onProgress(progressPercent);
                }
            );

            if (signal.aborted) return false;

            const localM3U8Content = this.createLocalM3U8(
                playlistContent,
                downloadedSegments,
                (segmentFileName) => `${segmentsDir.name}/${segmentFileName}`
            );

            const m3u8File = new File(localPath);
            m3u8File.write(localM3U8Content);
            onProgress(100);

            return true;
        } catch (error: any) {
            if (error.name === 'AbortError' || signal.aborted) {
                return false;
            }
            console.error(`Error in downloadM3U8FileBackgroundForCollection:`, error);
            throw error;
        }
    }

    private async downloadSongAndImageBackground(
        song: SongResponse,
        localPath: string,
        songId: string,
        signal: AbortSignal
    ): Promise<boolean> {
        const { updateSongProgress } = useDownloads.getState();

        try {
            if (signal.aborted) return false;

            const imageLocalPath = await this.downloadImageBackground(
                song.image,
                songId,
                signal
            );

            if (signal.aborted) return false;

            if (imageLocalPath) {
                const { updateSongImage } = useDownloads.getState();
                updateSongImage(songId, imageLocalPath);
            }

            const audioSuccess = await this.downloadM3U8FileBackground(
                song.url,
                localPath,
                songId,
                signal
            );

            return audioSuccess;

        } catch (error: any) {
            if (error.name === 'AbortError' || signal.aborted) {
                console.log(`Download cancelled for song ${songId}`);
                return false;
            }
            console.error("Error in downloadSongAndImageBackground:", error);
            throw error;
        }
    }

    private async downloadImageBackground(
        imageUrl: string,
        songId: string,
        signal: AbortSignal
    ): Promise<string | null> {
        try {
            if (!imageUrl || signal.aborted) return null;

            const downloadsDir = await this.ensureDownloadsDirectory();

            const imageExtension = this.getImageExtension(imageUrl);
            const imageFileName = `${songId}_image.${imageExtension}`;
            const imageFile = new File(downloadsDir, imageFileName);
            if (imageFile.exists) {
                console.log(`Image already exists for song ${songId}`);
                return imageFile.uri;
            }

            const downloadedImageFile = await File.downloadFileAsync(imageUrl, imageFile);

            if (downloadedImageFile.exists) {
                console.log(`Downloaded image for song ${songId}`);
                return downloadedImageFile.uri;
            } else {
                console.error(`Failed to download image`);
                return null;
            }

        } catch (error: any) {
            console.error(`Failed to download image for song ${songId}:`, error.message);
            return null;
        }
    }

    private getImageExtension(imageUrl: string): string {
        try {
            const urlParts = imageUrl.split('?')[0].split('/');
            const fileName = urlParts[urlParts.length - 1];
            const extension = fileName.split('.').pop()?.toLowerCase();
            const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (extension && validExtensions.includes(extension)) {
                return extension;
            }
            return 'jpg';
        } catch (error) {
            return 'jpg';
        }
    }

    private async downloadM3U8FileBackground(
        url: string,
        localPath: string,
        songId: string,
        signal: AbortSignal
    ): Promise<boolean> {
        const { updateSongProgress } = useDownloads.getState();

        try {
            if (signal.aborted) return false;

            const playlistResponse = await fetch(url, { signal });
            if (!playlistResponse.ok) {
                throw new Error(`Failed to fetch M3U8: ${playlistResponse.status}`);
            }

            const playlistContent = await playlistResponse.text();

            await this.yieldToMainThread();

            if (signal.aborted) return false;

            const segmentUrls = this.parseM3U8Segments(playlistContent, url);
            if (segmentUrls.length === 0) {
                throw new Error("No segments found in M3U8 file");
            }

            const songDir = localPath.replace(".m3u8", "");
            const segmentsDirName = `${songDir}_segments`;
            const segmentsDir = new Directory(segmentsDirName);
            if (!segmentsDir.exists) {
                segmentsDir.create({ intermediates: true });
            }
            const totalFiles = segmentUrls.length + 2;
            let completedFiles = 2;
            updateSongProgress(songId, Math.round((completedFiles / totalFiles) * 100));
            const downloadedSegments = await this.downloadSegmentsBackground(
                segmentUrls,
                segmentsDir,
                songId,
                signal,
                (progress) => {
                    completedFiles = 2 + progress.completed;
                    const progressPercent = Math.round((completedFiles / totalFiles) * 100);
                    updateSongProgress(songId, progressPercent);

                    const cb = this.downloadCallbacks.get(songId);
                    if (cb) {
                        cb({
                            totalBytes: totalFiles,
                            downloadedBytes: completedFiles,
                            progress: progressPercent,
                        });
                    }
                }
            );

            if (signal.aborted) return false;

            if (downloadedSegments.length === 0) {
                throw new Error("No segments were successfully downloaded");
            }

            const localM3U8Content = this.createLocalM3U8(
                playlistContent,
                downloadedSegments,
                (segmentFileName) => `${segmentsDir.name}/${segmentFileName}`
            );

            const m3u8File = new File(localPath);
            m3u8File.write(localM3U8Content);
            updateSongProgress(songId, 100);

            return true;

        } catch (error: any) {
            if (error.name === 'AbortError' || signal.aborted) {
                console.log(`Download cancelled for song ${songId}`);
                return false;
            }
            console.error("Error in downloadM3U8FileBackground:", error);
            throw error;
        }
    }

    private async downloadSegmentsBackground(
        segmentUrls: string[],
        segmentsDir: Directory,
        songId: string,
        signal: AbortSignal,
        onProgress: (progress: { completed: number; total: number }) => void
    ): Promise<string[]> {
        const BATCH_SIZE = 3;
        const downloadedSegments: string[] = [];
        let completed = 0;

        for (let i = 0; i < segmentUrls.length; i += BATCH_SIZE) {
            if (signal.aborted) break;

            const batch = segmentUrls.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(async (segmentUrl, batchIndex) => {
                const globalIndex = i + batchIndex;
                const segmentFileName = this.getSegmentFileName(segmentUrl, globalIndex);
                const segmentFile = new File(segmentsDir, segmentFileName);

                try {
                    if (segmentFile.exists) {
                        return segmentFileName;
                    }
                    const downloadedFile = await File.downloadFileAsync(segmentUrl, segmentFile);

                    if (downloadedFile.exists) {
                        return segmentFileName;
                    } else {
                        console.error(`Failed to download segment`);
                        return null;
                    }
                } catch (err: any) {
                    console.error(`Failed to download segment ${segmentUrl}:`, err.message);
                    return null;
                }
            });

            const batchResults = await Promise.allSettled(batchPromises);

            batchResults.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    downloadedSegments.push(result.value);
                }
                completed++;
            });

            onProgress({ completed, total: segmentUrls.length });
            await this.yieldToMainThread();
        }

        return downloadedSegments;
    }

    private async yieldToMainThread(): Promise<void> {
        return new Promise(resolve => {
            setImmediate ? setImmediate(() => resolve()) : setTimeout(() => resolve(), 0);
        });
    }

    private parseM3U8Segments(content: string, baseUrl: string): string[] {
        const lines = content.split("\n");
        const segments: string[] = [];

        try {
            const urlObject = new URL(baseUrl);
            const baseUrlPath = baseUrl.substring(0, baseUrl.lastIndexOf('/'));

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith("#") || !trimmedLine) continue;

                if (
                    trimmedLine.includes(".ts") ||
                    trimmedLine.includes(".m4s") ||
                    trimmedLine.includes(".mp4")
                ) {
                    let segmentUrl = trimmedLine;

                    if (!segmentUrl.startsWith("http")) {
                        if (segmentUrl.startsWith("/")) {
                            segmentUrl = `${urlObject.protocol}//${urlObject.host}${segmentUrl}`;
                        } else {
                            segmentUrl = `${baseUrlPath}/${segmentUrl}`;
                        }
                    }
                    segments.push(segmentUrl);
                }
            }
        } catch (error) {
            console.error("Error parsing M3U8 segments:", error);
        }

        return segments;
    }

    private getSegmentFileName(segmentUrl: string, index: number): string {
        try {
            const urlParts = segmentUrl.split("/");
            const originalName = urlParts[urlParts.length - 1];
            const nameWithoutQuery = originalName.split("?")[0];
            if (!nameWithoutQuery.includes(".") || nameWithoutQuery.length === 0) {
                return `segment_${index.toString().padStart(3, "0")}.ts`;
            }

            return nameWithoutQuery;
        } catch (error) {
            return `segment_${index.toString().padStart(3, "0")}.ts`;
        }
    }

    private createLocalM3U8(
        originalContent: string,
        downloadedSegments: string[],
        getLocalPath: (segmentFileName: string) => string
    ): string {
        const lines = originalContent.split("\n");
        const newLines: string[] = [];
        let segmentIndex = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (
                !trimmed.startsWith("#") &&
                trimmed &&
                (trimmed.includes(".ts") ||
                    trimmed.includes(".m4s") ||
                    trimmed.includes(".mp4"))
            ) {
                if (segmentIndex < downloadedSegments.length) {
                    newLines.push(getLocalPath(downloadedSegments[segmentIndex]));
                    segmentIndex++;
                } else {
                    newLines.push(line);
                }
            } else {
                newLines.push(line);
            }
        }
        return newLines.join("\n");
    }

    private async ensureDownloadsDirectory(): Promise<Directory> {
        const downloadsDir = new Directory(Paths.document, "downloads");

        try {
            if (!downloadsDir.exists) {
                downloadsDir.create({ intermediates: true });
            }
        } catch (error) {
            console.error("Error creating downloads directory:", error);
            throw error;
        }

        return downloadsDir;
    }

    public cancelDownload(songId: string): void {
        const { updateSongDownloadStatus } = useDownloads.getState();
        const abortController = this.activeDownloads.get(songId);

        if (abortController) {
            abortController.abort();
            this.activeDownloads.delete(songId);
            this.downloadCallbacks.delete(songId);
            updateSongDownloadStatus(songId, false, false);
            console.log(`Download cancelled for song ${songId}`);
        }
    }

    public cancelPlaylistDownload(playlistId: string): void {
        const { updatePlaylistDownloadStatus } = useDownloads.getState();
        const abortController = this.activePlaylistDownloads.get(playlistId);

        if (abortController) {
            abortController.abort();
            this.activePlaylistDownloads.delete(playlistId);
            updatePlaylistDownloadStatus(playlistId, false, false);
            console.log(`Download cancelled for playlist ${playlistId}`);
        }
    }

    public cancelAlbumDownload(albumId: string): void {
        const { updateAlbumDownloadStatus } = useDownloads.getState();
        const abortController = this.activeAlbumDownloads.get(albumId);

        if (abortController) {
            abortController.abort();
            this.activeAlbumDownloads.delete(albumId);
            updateAlbumDownloadStatus(albumId, false, false);
            console.log(`Download cancelled for album ${albumId}`);
        }
    }

    public async deleteDownload(songId: string): Promise<boolean> {
        const { getSongById, removeSong } = useDownloads.getState();
        const song = getSongById(songId);
        if (!song?.download.localPath) return false;

        try {
            const m3u8File = new File(song.download.localPath);
            if (m3u8File.exists) {
                m3u8File.delete();
            }

            const segmentsDirPath = song.download.localPath.replace(".m3u8", "") + "_segments";
            const segmentsDir = new Directory(segmentsDirPath);
            if (segmentsDir.exists) {
                segmentsDir.delete();
            }

            const downloadsDir = await this.ensureDownloadsDirectory();
            const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            for (const ext of imageExtensions) {
                const imageFileName = `${songId}_image.${ext}`;
                const imageFile = new File(downloadsDir, imageFileName);
                if (imageFile.exists) {
                    imageFile.delete();
                    console.log(`Deleted image: ${imageFile.uri}`);
                    break;
                }
            }

            removeSong(songId);
            return true;
        } catch (err: any) {
            console.error("Error deleting download:", err.message);
            return false;
        }
    }

    public async deletePlaylistDownload(playlistId: string): Promise<boolean> {
        const { getPlaylistById, removePlaylist } = useDownloads.getState();
        const playlist = getPlaylistById(playlistId);
        if (!playlist) return false;

        try {
            for (const song of playlist.songs) {
                await this.deleteSongFiles(song.id, song.download.localPath);
            }

            removePlaylist(playlistId);
            console.log(`Deleted playlist download: ${playlistId}`);
            return true;
        } catch (err: any) {
            console.error("Error deleting playlist download:", err.message);
            return false;
        }
    }

    public async deleteAlbumDownload(albumId: string): Promise<boolean> {
        const { getAlbumById, removeAlbum } = useDownloads.getState();
        const album = getAlbumById(albumId);
        if (!album) return false;

        try {
            for (const song of album.songs) {
                await this.deleteSongFiles(song.id, song.download.localPath);
            }

            removeAlbum(albumId);
            console.log(`Deleted album download: ${albumId}`);
            return true;
        } catch (err: any) {
            console.error("Error deleting album download:", err.message);
            return false;
        }
    }

    private async deleteSongFiles(songId: string, localPath?: string): Promise<boolean> {
        try {
            if (localPath) {
                const m3u8File = new File(localPath);
                if (m3u8File.exists) {
                    m3u8File.delete();
                }

                const segmentsDirPath = localPath.replace(".m3u8", "") + "_segments";
                const segmentsDir = new Directory(segmentsDirPath);
                if (segmentsDir.exists) {
                    segmentsDir.delete();
                }
            }

            const downloadsDir = await this.ensureDownloadsDirectory();
            const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            for (const ext of imageExtensions) {
                const imageFileName = `${songId}_image.${ext}`;
                const imageFile = new File(downloadsDir, imageFileName);
                if (imageFile.exists) {
                    imageFile.delete();
                    break;
                }
            }

            return true;
        } catch (err: any) {
            console.error("Error deleting song files:", err.message);
            return false;
        }
    }

    public getLocalPath(songId: string): string | null {
        const { getSongById } = useDownloads.getState();
        return getSongById(songId)?.download.localPath || null;
    }

    public getLocalImagePath(songId: string): string | null {
        const { getSongById } = useDownloads.getState();
        const song = getSongById(songId);
        if (!song?.download.isDownloaded) return null;
        return song.download.localImagePath || null;
    }

    public isDownloaded(songId: string): boolean {
        const { getSongById } = useDownloads.getState();
        return getSongById(songId)?.download.isDownloaded || false;
    }

    public isPlaylistDownloaded(playlistId: string): boolean {
        const { getPlaylistById } = useDownloads.getState();
        return getPlaylistById(playlistId)?.download.isDownloaded || false;
    }

    public isAlbumDownloaded(albumId: string): boolean {
        const { getAlbumById } = useDownloads.getState();
        return getAlbumById(albumId)?.download.isDownloaded || false;
    }

    public isDownloading(songId: string): boolean {
        return this.activeDownloads.has(songId);
    }

    public isPlaylistDownloading(playlistId: string): boolean {
        return this.activePlaylistDownloads.has(playlistId);
    }

    public isAlbumDownloading(albumId: string): boolean {
        return this.activeAlbumDownloads.has(albumId);
    }

    public getDownloadProgress(songId: string): number {
        const { getSongById } = useDownloads.getState();
        return getSongById(songId)?.download.downloadProgress || 0;
    }

    public getPlaylistDownloadProgress(playlistId: string): number {
        const { getPlaylistById } = useDownloads.getState();
        return getPlaylistById(playlistId)?.download.downloadProgress || 0;
    }

    public getAlbumDownloadProgress(albumId: string): number {
        const { getAlbumById } = useDownloads.getState();
        return getAlbumById(albumId)?.download.downloadProgress || 0;
    }

    public getAllDownloads(): DownloadedSong[] {
        const { songs } = useDownloads.getState();
        return songs;
    }

    public getAllPlaylistDownloads(): DownloadedPlaylist[] {
        const { playlists } = useDownloads.getState();
        return playlists;
    }

    public getAllAlbumDownloads(): DownloadedAlbum[] {
        const { albums } = useDownloads.getState();
        return albums;
    }
}
