import { Text, View } from 'react-native';
import { AllSearchResponse, Tab } from '@/types/response.types';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { fetcher } from '@/lib/fetcher';
import { SecondaryLoader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { SongItem } from '../song/item';
import { AlbumCarousel } from '../carousel/album';
import { ArtistCarousel } from '../carousel/artist';
import { TopResultCard } from './top-result-card';

interface Props {
    currentTab: Tab;
    query: string;
}

export const AllTab = ({ currentTab, query }: Props) => {

    const { user } = useAuth();
    const debouncedQuery = useDebounce(query, 300);

    const { data, isPending, error } = useQuery({
        queryKey: ['search-all', debouncedQuery],
        queryFn: async () => {
            const data = await fetcher({
                prefix: "PUBLIC_BASE_URL",
                suffix: `api/v2/search?q=${debouncedQuery}`,
                token: user?.tokens.accessToken
            });
            return data.data as AllSearchResponse | undefined;
        },
        enabled: debouncedQuery.length > 0
    })

    if (isPending) {
        return (
            <SecondaryLoader />
        )
    }

    if (error || data === undefined || !data.topResult) {
        return (
            <View className='mt-10 w-full'>
                <Text className='text-white text-center'>
                    No results found for {debouncedQuery}
                </Text>
            </View>
        )
    }


    return (
        <View className='mt-10 w-full flex flex-col'>
            <TopResultCard data={data.topResult} />
            {
                data.songs.length > 0 && (
                    <View className='flex flex-col gap-y-6 mt-10'>
                        <Text className='text-2xl font-bold text-white'>Songs</Text>
                        <View className='flex flex-col gap-y-5'>
                            {
                                data.songs.map((song) => (
                                    <SongItem key={song.id} data={song} />
                                ))
                            }
                        </View>
                    </View>
                )
            }
            {
                data.albums && data.albums.length > 0 && (
                    <AlbumCarousel
                        slug='Albums'
                        data={data.albums}
                    />
                )
            }
            {
                data.artists && data.artists.length > 0 && (
                    <ArtistCarousel
                        slug='Artists'
                        data={data.artists}
                    />
                )
            }
        </View>
    )
}