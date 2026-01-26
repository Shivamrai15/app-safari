import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SongSearchResponse } from '@/types/response.types';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { PrimaryLoader } from '@/components/ui/loader';
import { Image } from 'expo-image';
import { PlusIcon } from '@/constants/icons';
import { cn } from '@/lib/utils';

interface Props {
    query: string;
    toggleSelect: (id: string) => void;
    selectedSongId: string[];
    existingSongIds: string[];
}

export const SearchList = ({ query, toggleSelect, selectedSongId, existingSongIds }: Props) => {

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
        enabled: !!debouncedQuery
    });

    if (isPending) {
        return (
            <PrimaryLoader className='bg-transparent' />
        )
    }

    if (error || data === undefined || data.songs.length === 0) {
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
            <View className='flex flex-col gap-y-2'>
                {
                    data.songs.map((song) => (
                        <TouchableOpacity
                            key={song.id}
                            onPress={() => toggleSelect(song.id)}
                            disabled={existingSongIds.includes(song.id)}
                            className={cn(
                                "w-full flex flex-row items-center justify-between gap-x-4 p-3 rounded-2xl pr-4",
                                selectedSongId.includes(song.id) && "bg-[#1b1b1b]",
                                existingSongIds.includes(song.id) && "opacity-50"
                            )}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{ uri: song.image }}
                                style={{ width: 48, height: 48, borderRadius: 8 }}
                                contentFit="contain"
                            />
                            <View className="flex-1 flex flex-col gap-y-0.5">
                                <Text className="text-white font-semibold" numberOfLines={1} ellipsizeMode="tail" >{song.name}</Text>
                                <Text className="text-neutral-300 font-medium text-sm" numberOfLines={1} ellipsizeMode="tail" >{song.album.name}</Text>
                            </View>
                            <View
                                className={cn(
                                    "transition-transform duration-500",
                                    selectedSongId.includes(song.id) ? "rotate-45" : "rotate-0"
                                )}
                            >
                                <Image
                                    source={PlusIcon}
                                    style={{ width: 24, height: 24 }}
                                    contentFit="contain"
                                />
                            </View>
                        </TouchableOpacity>
                    ))
                }
            </View>
        </View>
    )
}