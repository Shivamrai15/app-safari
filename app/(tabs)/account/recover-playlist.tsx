import { Image } from 'expo-image';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { useAuth } from '@/hooks/use-auth';
import { Spacer } from '@/components/ui/spacer';
import { Error } from '@/components/ui/error';
import { PrimaryLoader } from '@/components/ui/loader';
import { PlaylistResponse } from '@/types/response.types';
import { RestoreButton } from '@/components/playlist/restore-button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';

const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    }).replace(/\//g, '/');
};

const Page = () => {

    const { user } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['recover-playlists'],
        queryFn: async () => {
            const data = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: "api/v2/playlist/archived",
                token: user?.tokens.accessToken
            });
            return data.data as PlaylistResponse[];
        },
    });

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch])


    if (isLoading) {
        return <PrimaryLoader />
    }

    if (!isLoading && error) {
        console.log(error);
        return <Error />;
    }

    return (
        <SafeAreaView className='flex-1 bg-background'>
            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#ef4444"
                        colors={["#ef4444"]}
                    />
                }
            >
                <View className='px-4 pt-6'>
                    <Text className="text-white text-2xl font-bold tracking-tight">
                        Recover playlists
                    </Text>
                    <Text className="text-zinc-400 text-sm mt-4 leading-5">
                        You can recover a deleted playlist if it was deleted within the last 90 days. To do this, find the playlist you want to recover and click Restore.
                    </Text>
                </View>
                <View className='mt-6 px-4 gap-y-3'>
                    {data?.map((playlist) => (
                        <View
                            key={playlist.id}
                            className='p-4 bg-neutral-900 rounded-xl flex-row items-center gap-x-4'
                        >
                            {playlist.image ? (
                                <Image
                                    source={{ uri: playlist.image }}
                                    style={{ width: 56, height: 56, borderRadius: 8 }}
                                    contentFit="cover"
                                />
                            ) : (
                                <View className='w-14 h-14 bg-neutral-800 rounded-lg items-center justify-center'>
                                    <MaterialCommunityIcons
                                        name="playlist-music"
                                        size={28}
                                        color="#a1a1aa"
                                    />
                                </View>
                            )}
                            <View className='flex-1'>
                                <Text className='text-white text-base font-semibold' numberOfLines={1}>
                                    {playlist.name}
                                </Text>
                                <View className='flex-row items-center mt-1 gap-x-2'>
                                    <Text className='text-zinc-500 text-sm'>
                                        {playlist._count.songs} {playlist._count.songs === 1 ? 'song' : 'songs'}
                                    </Text>
                                    <Text className='text-zinc-600'>•</Text>
                                    <Text className='text-zinc-500 text-sm'>
                                        Deleted {formatDate(playlist.archivedAt)}
                                    </Text>
                                </View>
                            </View>
                            <RestoreButton playlistId={playlist.id} />
                        </View>
                    ))}
                    {data?.length === 0 && (
                        <View className='py-12 items-center'>
                            <MaterialCommunityIcons
                                name="playlist-remove"
                                size={48}
                                color="#3f3f46"
                            />
                            <Text className='text-zinc-500 text-sm mt-4 text-center'>
                                No deleted playlists found
                            </Text>
                        </View>
                    )}
                </View>
                <Spacer />
            </ScrollView>
        </SafeAreaView>
    )
}

export default Page;