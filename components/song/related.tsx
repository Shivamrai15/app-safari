import { fetcher } from '@/lib/fetcher';
import { useQuery } from '@tanstack/react-query';
import { View, Text, ScrollView } from 'react-native';
import { SecondaryLoader } from '../ui/loader';
import { Error } from '../ui/error';
import { SongItem } from './item';
import { SongResponse } from '@/types/response.types';
import { useAuth } from '@/hooks/use-auth';

interface Props {
    songId : string;
}

export const RelatedSongs = ({ songId }: Props) => {

    const { user } = useAuth();

    const { data, isPending, error } = useQuery({
        queryFn : async() => {
            const data = await fetcher({
                prefix : "PUBLIC_BASE_URL",
                suffix : `api/v2/song/${songId}/related`,
                token : user?.tokens.accessToken
            });
            return data.data as SongResponse[];
        },
        queryKey : ['related-songs', songId],
    });

    if (isPending) {
        return (
            <SecondaryLoader className='bg-transparent' />
        )
    }

    if (error || !data || data.length === 0) {
        return <Error />;
    }


    return (
        <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
            <View className='flex flex-col gap-y-4'>
                {
                    data.map((song) => (
                        <SongItem key={song.id} data={song} />
                    ))
                }
            </View>
        </ScrollView>
    )
}