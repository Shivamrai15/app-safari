import { useMemo } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PauseDarkIcon, PlayDarkIcon } from "@/constants/icons";
import { Album, Artist, Song } from "@/types/response.types";
import { useAuth } from "@/hooks/use-auth";
import { useQueue } from "@/hooks/use-queue";
import { useAlbumStack } from "@/hooks/use-stack";
import { usePlayer } from "@/hooks/use-player";


interface Props {
    songs?: (Song & {
        album: Album,
        artists: Artist[]
    })[];
    id?: string;
    className?: string
}

export const PlayButton = ({ songs, id, className }: Props) => {

    const { isLoggedIn } = useAuth();
    const { priorityEnqueue, current, queue, stack } = useQueue();
    const { activeId, play, isPlaying: checkIsPlaying } = useAlbumStack();
    const { isPlaying } = usePlayer();

    const isActive = useMemo(() => {
        if (!id) return false;
        return checkIsPlaying(id);
    }, [id, activeId, current, queue, stack]);

    const handlePlay = async () => {
        if (!isLoggedIn) {
            router.push("/(auth)/welcome");
            return;
        } else {
            if (songs && songs.length > 0 && id) {
                play(id, songs);
                priorityEnqueue(songs);
            }
        }
    }

    const isALbumPlaying = useMemo(()=>{
        return isPlaying && isActive
    }, [isActive, isPlaying]);


    return (
        <Button
            className={cn(
                "rounded-full size-9",
                className
            )}
            onPress={() => handlePlay()}
            disabled={isActive}
        >
            <Image source={isALbumPlaying ? PauseDarkIcon : PlayDarkIcon} style={{ width: 16, height: 16 }} />
        </Button>
    )
}
