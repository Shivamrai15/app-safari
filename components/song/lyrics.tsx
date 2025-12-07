import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { useAuth } from '@/hooks/use-auth';
import { Lyrics as LyricsType } from '@/types/response.types';
import { SecondaryLoader } from '@/components/ui/loader';
import axios from 'axios';
import { SyncedLyrics } from './synced-lyrics';
import { UnsyncedLyrics } from './non-synced-lyrics';


interface Props {
    songId: string;
    position: number;
    onSeek: (value: number) => void;
}

export const Lyrics = ({ songId, position, onSeek }: Props) => {

    const { user } = useAuth();

    const lyrics = useQuery({
        queryFn: async()=>{
            const data = await fetcher({
                prefix : "PROTECTED_BASE_URL",
                suffix : `api/v2/song/${songId}/lyrics`,
                token : user?.tokens.accessToken
            });
            return data.data as LyricsType;
        },
        queryKey: ['song-lyrics', songId],
        retry : 0,
        refetchOnWindowFocus : false,
        refetchOnReconnect : false,
        refetchOnMount : false,
        meta: { persist: false },
    });
    
    if (lyrics.isPending) {
        return (
            <SecondaryLoader className='bg-transparent' />
        )
    }

    if (lyrics.isError || !lyrics.data) {
        return (
            <View className='flex-1 justify-center items-center text-left'>
                <Text className='text-white text-left px-4 text-3xl font-bold'>
                    {
                        axios.isAxiosError(lyrics.error) ?
                        lyrics.error.response?.data?.message : lyrics.error.message
                    }
                </Text>
            </View>
        )
    }


    if (lyrics.data.synced) {
        return (
            <SyncedLyrics
                lyrics={lyrics.data.lyrics.lyrics}
                position={position}
                onSeek={onSeek}
            />
        )
    }

    return (
        <UnsyncedLyrics
            lyrics={lyrics.data.lyrics.lyrics}
        />
    )
}