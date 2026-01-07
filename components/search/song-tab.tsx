import { Text, View } from 'react-native';
import { SongSearchResponse, Tab } from '@/types/response.types';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { SecondaryLoader } from '@/components/ui/loader';
import { SongItem } from '../song/item';

interface Props {
    currentTab: Tab;
    query: string;
}

export const SongTab = ({ currentTab, query }: Props) => {

    const { user } = useAuth();
    const debouncedQuery = useDebounce(query, 300);

    const { data, isPending, error } = useQuery({
        queryKey: ['search-song', debouncedQuery],
        queryFn: async () => {
            const data = await fetcher({
                prefix: "PUBLIC_BASE_URL",
                suffix: `api/v2/search/songs?q=${debouncedQuery}`,
                token: user?.tokens.accessToken
            });
            return data.data as SongSearchResponse | undefined;
        },
        enabled: debouncedQuery.length > 0
    });

    if (isPending) {
        return (
            <SecondaryLoader />
        )
    }

    if (error || data === undefined || data.songs.length === 0) {
        return (
            <View className='mt-10 w-full px-4'>
                <Text className='text-white text-center'>
                    No results found for {debouncedQuery}
                </Text>
            </View>
        )
    }

    return (
        <View className='mt-10 w-full px-4'>
            <View className='flex flex-col gap-y-5'>
                {
                    data.songs.map((song) => (
                        <SongItem
                            key={song.id}
                            data={song}
                        />
                    ))
                }
            </View>
        </View>
    )
}