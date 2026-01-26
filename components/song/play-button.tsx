import { cn } from '@/lib/utils';
import { Image } from 'expo-image';
import { useQueue } from '@/hooks/use-queue';
import { usePlayer } from '@/hooks/use-player';
import { SongResponse } from '@/types/response.types';
import { Button } from '../ui/button';
import { PauseDarkIcon, PlayDarkIcon } from '@/constants/icons';
import { useMemo } from 'react';

interface Props {
    song: SongResponse
    className?: string   
}

export const SongPlayButton = ({song, className}: Props) => {

    const { isPlaying } = usePlayer();
    const { current, priorityEnqueue } = useQueue();

    const isActive = useMemo(() => {
        return current?.id === song.id && isPlaying;
    }, [current, song, isPlaying]);

    const handlePlay = () => {
        priorityEnqueue([song]);
    }

    return (    
        <Button
            className={cn(
                "rounded-full size-9",
                className
            )}
            onPress={() => handlePlay()}
            disabled={isActive}
        >
            <Image source={isActive ? PauseDarkIcon : PlayDarkIcon} style={{ width: 16, height: 16 }} />
        </Button>
    )
}