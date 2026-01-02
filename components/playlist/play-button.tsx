import axios from 'axios';
import { useMemo } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useQueue } from '@/hooks/use-queue';
import { usePlayer } from '@/hooks/use-player';
import { usePlaylistStack } from '@/hooks/use-stack';
import { PauseDarkIcon, PlayDarkIcon } from '@/constants/icons';
import { fetcher } from '@/lib/fetcher';
import { useMutation } from '@tanstack/react-query';
import { SongResponse } from '@/types/response.types';
import { log } from '@/services/log.service';

interface Props {
    className?: string;
    playlistId?: string;
}

export const PlayButton = ({ className, playlistId }: Props) => {

    const { isLoggedIn, user } = useAuth();
    const { priorityEnqueue, current, queue, stack } = useQueue();
    const { activeId, play, isPlaying: checkIsPlaying } = usePlaylistStack();
    const { isPlaying } = usePlayer();

    const isActive = useMemo(() => {
        if (!playlistId) return false;
        return checkIsPlaying(playlistId);
    }, [playlistId, activeId, current, queue, stack]);

    const isPlaylistPlaying = useMemo(() => {
        return isPlaying && isActive;
    }, [isActive, isPlaying]);

    const handlePlay = useMutation({
        mutationFn: async () => {
            if (!isLoggedIn) {
                router.push("/(auth)/welcome");
                return [];
            }
            const data = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: `api/v2/playlist/${playlistId}/all-songs`,
                token: user?.tokens.accessToken
            });
            console.log(data.data);
            return data.data as SongResponse[];
        },
        onSuccess: (data) => {
            if (data && data.length > 0 && playlistId) {
                play(playlistId, data);
                priorityEnqueue(data);
            }
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'medium',
                    errorCode: error.response?.data?.code || 'PLAYLIST_PLAY_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                        responseBody: JSON.stringify(error.response?.data || {}),
                    },
                    navigationContext: { currentScreen: 'playlist-play-button' },
                });
            }
        }
    });

    return (
        <Button
            className={cn(
                "rounded-full size-12",
                className
            )}
            onPress={() => handlePlay.mutate()}
            disabled={handlePlay.isPending || isActive}
        >
            <Image source={isPlaylistPlaying ? PauseDarkIcon : PlayDarkIcon} style={{ width: 22, height: 22 }} />
        </Button>
    )
}