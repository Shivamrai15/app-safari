import { useSettings } from '@/hooks/use-settings'
import { useDownloads } from '@/hooks/use-downloads';
import { cn } from '@/lib/utils';
import { Image } from 'expo-image'
import { TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { useCallback, useState } from 'react';
import { DownloadManager } from '@/services/download';
import { PlaylistResponse, SongResponse, PlaylistSongResponse } from '@/types/response.types';
import { useAuth } from '@/hooks/use-auth';
import { fetcher } from '@/lib/fetcher';
import { PROTECTED_BASE_URL } from '@/constants/api.config';
import { CircularProgress } from '@/components/ui/circular-progress';

interface Props {
    data: PlaylistResponse;
}

export const DownloadButton = ({ data }: Props) => {

    const { settings } = useSettings();
    const { user } = useAuth();
    const { getPlaylistById, playlists } = useDownloads();

    const [isLoading, setIsLoading] = useState(false);

    const isActive = settings?.subscription.isActive;
    const downloadManager = DownloadManager.getInstance();

    const playlist = getPlaylistById(data.id);
    const isDownloaded = playlist?.download.isDownloaded || false;
    const isDownloading = playlist?.download.isDownloading || false;
    const progress = playlist?.download.downloadProgress || 0;

    const fetchPlaylistSongs = async (): Promise<SongResponse[]> => {
        const songs: SongResponse[] = [];
        let cursor: string | null = null;
        let hasMore = true;

        while (hasMore) {
            const response = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: cursor
                    ? `api/v2/playlist/${data.id}/songs?cursor=${cursor}`
                    : `api/v2/playlist/${data.id}/songs`,
                token: user?.tokens.accessToken
            });
            const responseData = response.data || response;
            const items = responseData.items as PlaylistSongResponse[];

            if (items && items.length > 0) {
                songs.push(...items.map(item => item.song));
            }

            cursor = responseData.nextCursor;
            hasMore = !!cursor;
        }

        return songs;
    };

    const handleDownload = useCallback(async () => {
        if (!isActive || isDownloading) return;

        if (isDownloaded) {
            await downloadManager.deletePlaylistDownload(data.id);
            return;
        }

        try {
            setIsLoading(true);

            const songs = await fetchPlaylistSongs();

            if (songs.length === 0) {
                console.log('No songs in playlist');
                return;
            }

            await downloadManager.downloadPlaylist(data, songs);

        } catch (error) {
            console.error('Error downloading playlist:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isActive, isDownloading, isDownloaded, data, user]);

    const handleCancel = useCallback(() => {
        downloadManager.cancelPlaylistDownload(data.id);
    }, [data.id]);

    if (isDownloading) {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCancel}
            >
                <CircularProgress
                    progress={progress}
                    height={26}
                    width={26}
                    strokeWidth={3}
                    strokeColor="#ef4444"
                    trackColor="#404040"
                />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDownload}
            disabled={!isActive}
            className={cn(
                isActive ? 'opacity-100' : 'opacity-50',
            )}
        >
            {isDownloaded ? (
                <Image source={require("@/assets/icons/trash.png")} style={{ width: 26, height: 26 }} />
            ) : (
                <Image source={require("@/assets/icons/download.png")} style={{ width: 26, height: 26 }} />
            )}
        </TouchableOpacity>
    )
}