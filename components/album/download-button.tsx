import { useSettings } from '@/hooks/use-settings'
import { useDownloads } from '@/hooks/use-downloads';
import { cn } from '@/lib/utils';
import { Image } from 'expo-image'
import { TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { useCallback, useState } from 'react';
import { DownloadManager } from '@/services/download';
import { AlbumResponse } from '@/types/response.types';
import { CircularProgress } from '@/components/ui/circular-progress';

interface Props {
    data: AlbumResponse;
}

export const DownloadButton = ({ data }: Props) => {

    const { settings } = useSettings();
    const { getAlbumById, albums } = useDownloads();

    const [isLoading, setIsLoading] = useState(false);

    const isActive = settings?.subscription.isActive;
    const downloadManager = DownloadManager.getInstance();

    const album = getAlbumById(data.id);
    const isDownloaded = album?.download.isDownloaded || false;
    const isDownloading = album?.download.isDownloading || false;
    const progress = album?.download.downloadProgress || 0;

    const handleDownload = useCallback(async () => {
        if (!isActive || isDownloading) return;

        if (isDownloaded) {
            await downloadManager.deleteAlbumDownload(data.id);
            return;
        }

        try {
            setIsLoading(true);

            if (data.songs.length === 0) {
                console.log('No songs in album');
                return;
            }
            await downloadManager.downloadAlbum(data);

        } catch (error) {
            console.error('Error downloading album:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isActive, isDownloading, isDownloaded, data]);

    const handleCancel = useCallback(() => {
        downloadManager.cancelAlbumDownload(data.id);
    }, [data.id]);

    if (isDownloading) {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCancel}
            >
                <CircularProgress
                    progress={progress}
                    height={28}
                    width={28}
                    strokeWidth={3}
                    strokeColor="#ef4444"
                    trackColor='#404040'
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
                <Image source={require("@/assets/icons/trash.png")} style={{ width: 28, height: 28 }} />
            ) : (
                <Image source={require("@/assets/icons/download.png")} style={{ width: 28, height: 28 }} />
            )}
        </TouchableOpacity>
    )
}
