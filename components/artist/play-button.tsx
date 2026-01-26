import { useMemo } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PauseDarkIcon, PlayDarkIcon } from "@/constants/icons";
import { useAuth } from "@/hooks/use-auth";
import { useQueue } from "@/hooks/use-queue";
import { useArtistStack } from "@/hooks/use-stack";
import { usePlayer } from "@/hooks/use-player";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Album, Song } from "@/types/response.types";

interface Props {
    id: string;
    className?: string
}

export const PlayButton = ({ id, className }: Props) => {

    const { isLoggedIn, user } = useAuth();
    const { priorityEnqueue, current, queue, stack } = useQueue();
    const { activeId, play, isPlaying: checkIsPlaying } = useArtistStack();
    const { isPlaying } = usePlayer();

    const isActive = useMemo(() => {
        if (!id) return false;
        return checkIsPlaying(id);
    }, [id, activeId, current, queue, stack]);

    const handlePlayMutation = useMutation({
        mutationFn: async () => {
            const data = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: `api/v2/artist/${id}/songs`,
                token: user?.tokens.accessToken
            });
            return data.data as (Song & { album: Album })[];
        },
        onSuccess: (data) => {
            if (data && data.length > 0 && id) {
                play(id, data);
                priorityEnqueue(data);
            }
        },
    });

    const handlePlay = async () => {
        if (!isLoggedIn) {
            router.push("/(auth)/welcome");
            return;
        } else {
            await handlePlayMutation.mutateAsync();
        }
    }

    const isArtistPlaying = useMemo(() => {
        return isPlaying && isActive
    }, [isActive, isPlaying]);

    return (
        <Button
            className={cn(
                "rounded-full size-12",
                className
            )}
            onPress={() => handlePlay()}
            disabled={isActive}
        >
            <Image source={isArtistPlaying ? PauseDarkIcon : PlayDarkIcon} style={{ width: 22, height: 22 }} />
        </Button>
    )
}
