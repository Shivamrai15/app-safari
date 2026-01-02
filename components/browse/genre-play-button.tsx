import axios from 'axios';
import { useMemo } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useQueue } from '@/hooks/use-queue';
import { usePlayer } from '@/hooks/use-player';
import { useGenreStack } from '@/hooks/use-stack';
import { Button } from '@/components/ui/button';
import { PauseDarkIcon, PlayDarkIcon } from '@/constants/icons';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { SongResponse } from '@/types/response.types';
import { log } from '@/services/log.service';

interface Props {
    id: string;
    className?: string;
}

export const GenrePlayButton = ({ id, className }: Props) => {

    const { isLoggedIn, user } = useAuth();
    const { priorityEnqueue, current, queue, stack } = useQueue();
    const { activeId, play, isPlaying: checkIsPlaying } = useGenreStack();
    const { isPlaying } = usePlayer();

    const isActive = useMemo(() => {
        if (!id) return false;
        return checkIsPlaying(id);
    }, [id, activeId, current, queue, stack]);

    const isGenrePlaying = useMemo(() => {
        return isPlaying && isActive;
    }, [isActive, isPlaying]);

    const handlePlay = useMutation({
        mutationFn: async () => {
            if (!isLoggedIn) {
                router.push("/(auth)/welcome");
                return [];
            }
            const data = await fetcher({
                prefix: "PUBLIC_BASE_URL",
                suffix: `api/v2/genre/${id}/songs`,
                token: user?.tokens.accessToken
            });
            return data.items as SongResponse[];
        },
        onSuccess: (data) => {
            if (data && data.length > 0) {
                play(id, data);
                priorityEnqueue(data);
            }
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'medium',
                    errorCode: error.response?.data?.code || 'GENRE_PLAY_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                        responseBody: JSON.stringify(error.response?.data || {}),
                    },
                    navigationContext: { currentScreen: 'genre-play-button' },
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
            <Image source={isGenrePlaying ? PauseDarkIcon : PlayDarkIcon} style={{ width: 22, height: 22 }} />
        </Button>
    );
}