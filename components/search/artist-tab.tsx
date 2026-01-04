import { Text, View } from 'react-native';
import { ArtistSearchResponse, Tab } from '@/types/response.types';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { SecondaryLoader } from '@/components/ui/loader';
import { Card } from '../artist/card';

interface Props {
    currentTab: Tab;
    query: string;
}

export const ArtistTab = ({ currentTab, query }: Props) => {

    const { user } = useAuth();
    const debouncedQuery = useDebounce(query, 300);

    const { data, isPending, error } = useQuery({
        queryKey: ['search-artist', debouncedQuery],
        queryFn: async () => {
            const data = await fetcher({
                prefix: "PUBLIC_BASE_URL",
                suffix: `api/v2/search/artists?q=${debouncedQuery}`,
                token: user?.tokens.accessToken
            });
            return data.data as ArtistSearchResponse | undefined;
        },
        enabled: debouncedQuery.length > 0
    })

    if (isPending) {
        return (
            <SecondaryLoader />
        )
    }

    if (error || data === undefined || data.artists.length === 0) {
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
                    data.artists.map((artist) => (
                        <Card
                            data={artist}
                            className='w-[48%]'
                            key={artist.id}
                        />
                    ))
                }
            </View>
        </View>
    )
}