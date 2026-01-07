import { useMemo } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PauseDarkIcon, PlayDarkIcon } from "@/constants/icons";
import { Album, AlbumResponse, Artist, Song } from "@/types/response.types";
import { useAuth } from "@/hooks/use-auth";
import { useQueue } from "@/hooks/use-queue";
import { useAlbumStack } from "@/hooks/use-stack";
import { usePlayer } from "@/hooks/use-player";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import axios from "axios";
import { log } from "@/services/log.service";


interface Props {
    songs?: (Song & {
        album: Album,
        artists: Artist[]
    })[];
    id?: string;
    className?: string
}

export const PlayButton = ({ songs, id, className }: Props) => {

    const { isLoggedIn, user } = useAuth();
    const { priorityEnqueue, current, queue, stack } = useQueue();
    const { activeId, play, isPlaying: checkIsPlaying } = useAlbumStack();
    const { isPlaying } = usePlayer();

    const isActive = useMemo(() => {
        if (!id) return false;
        return checkIsPlaying(id);
    }, [id, activeId, current, queue, stack]);

    const handlePlayMutation = useMutation({
        mutationFn: async () => {
                        const data = await fetcher({
                            prefix: "PUBLIC_BASE_URL",
                            suffix: `api/v2/album/${id}`,
                            token: user?.tokens.accessToken
                        });
                        return data.data as AlbumResponse;
        },
        onSuccess: (data) => {
            if (data && data.songs.length > 0 && id) {
                play(id, data.songs);
                priorityEnqueue(data.songs);
            }
        },
    });

    const handlePlay = async () => {
        if (!isLoggedIn) {
            router.push("/(auth)/welcome");
            return;
        } else {
            if (songs && songs.length > 0 && id) {
                play(id, songs);
                priorityEnqueue(songs);
            } else {
                await handlePlayMutation.mutateAsync();
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
