import { useMemo } from 'react';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DownloadedSong } from '@/hooks/use-downloads';
import { useQueue } from '@/hooks/use-queue';
import { usePlayer } from '@/hooks/use-player';
import { usePlaylistStack } from '@/hooks/use-stack';
import { PauseDarkIcon, PlayDarkIcon } from '@/constants/icons';
import { Album } from '@/types/response.types';

interface Props {
    songs?: (Omit<DownloadedSong, 'album'> & {
        album: Album
    })[];
    id?: string;
    className?: string
}

export const PlaylistPlayButton = ({ songs, id, className }: Props) => {

    const { priorityEnqueue, current, queue, stack } = useQueue();
    const { activeId, play, isPlaying: checkIsPlaying } = usePlaylistStack();
    const { isPlaying } = usePlayer();

    const isActive = useMemo(() => {
        if (!id) return false;
        return checkIsPlaying(id);
    }, [id, activeId, current, queue, stack]);

    const isPlaylistPlaying = useMemo(() => {
        return isPlaying && isActive;
    }, [isActive, isPlaying]);

    const handlePlay = () => {
        if (songs && songs.length > 0 && id) {
            play(id, songs);
            priorityEnqueue(songs);
        }
    }

    return (
        <Button
            className={cn(
                "rounded-full size-12",
                className
            )}
            onPress={() => handlePlay()}
            disabled={isActive}
        >
            <Image source={isPlaylistPlaying ? PauseDarkIcon : PlayDarkIcon} style={{ width: 16, height: 16 }} />
        </Button>
    )
}