import { Text, View } from 'react-native';
import { Album, AlbumSearchResponse, Tab } from '@/types/response.types';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { SecondaryLoader } from '@/components/ui/loader';
import { Card } from '../album/card';

interface Props {
    currentTab: Tab;
    query: string;
}

export const AlbumTab = ({ currentTab, query }: Props) => {

    const { user } = useAuth();
    const debouncedQuery = useDebounce(query, 300);

    const { data, isPending, error } = useQuery({
        queryKey: ['search-album', debouncedQuery],
        queryFn: async () => {
            const data = await fetcher({
                prefix: "PUBLIC_BASE_URL",
                suffix: `api/v2/search/albums?q=${debouncedQuery}`,
                token: user?.tokens.accessToken
            });
            return data.data as AlbumSearchResponse | undefined;
        },
        enabled: debouncedQuery.length > 0
    })

    if (isPending) {
        return (
            <SecondaryLoader />
        )
    }

    if (error || data === undefined || data.albums.length === 0) {
        return (
            <View className='mt-10 w-full'>
                <Text className='text-white text-center'>
                    No results found for {debouncedQuery}
                </Text>
            </View>
        )
    }

    return (
        <View className='mt-10 w-full'>
            <View className='w-full flex flex-row justify-between gap-y-4 flex-wrap'>
                {
                    data.albums.map((album) => (
                        <Card
                            key={album.id}
                            album={album}
                            className='w-[48%]'
                        />
                    ))
                }
            </View>
        </View>
    )
}