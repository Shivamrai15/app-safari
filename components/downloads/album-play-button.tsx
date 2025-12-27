import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DownloadedSong } from '@/hooks/use-downloads';
import { Image } from 'expo-image';
import { useState } from 'react';
import { PauseDarkIcon, PlayDarkIcon } from '@/constants/icons';
import { Album } from '@/types/response.types';

interface Props {
    songs?: (Omit<DownloadedSong, 'album'> & {
        album: Album
    })[];
    id?: string;
    className?: string
}

export const AlbumPlayButton = ({ songs, id, className }: Props) => {

    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {

    }

    return (
        <Button
            className={cn(
                "rounded-full size-12",
                className
            )}
            onPress={() => handlePlay()}
        >
            <Image source={isPlaying ? PauseDarkIcon : PlayDarkIcon} style={{ width: 16, height: 16 }} />
        </Button>
    )
}