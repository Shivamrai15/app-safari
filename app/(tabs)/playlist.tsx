import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useQueries } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Error } from '@/components/ui/error';
import { PrimaryLoader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { fetcher } from '@/lib/fetcher';
import { NetworkProvider } from '@/providers/network.provider';
import { Artist, LikedSongTracksResponse, PlayList } from '@/types/response.types';
import { Card } from '@/components/artist/card';
import { CreatePlaylistModal } from '@/components/modals/create-playlist.modal';
import { Spacer } from '@/components/ui/spacer';
import { RefreshControl } from 'react-native-gesture-handler';


const Playlist = () => {

    const { user } = useAuth();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const onCloseModal = () => setIsModalVisible(false);

    const [ userPlaylists, userFollowings, likedSongs ] = useQueries({
        queries : [
            {
                queryFn : async() => {
                    const data = await fetcher({
                        prefix : "PROTECTED_BASE_URL",
                        suffix : "api/v2/playlist",
                        token : user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey : ['user-playlists'],
            },
            {
                 queryFn : async() => {
                    const data = await fetcher({
                        prefix : "PROTECTED_BASE_URL",
                        suffix : "api/v2/artist/followings",
                        token : user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey : ['user-followings'],
            },
            {
                queryFn: async () => {
                            const data = await fetcher({
                                prefix: "PROTECTED_BASE_URL",
                                suffix: 'api/v2/song/liked/tracks',
                                token: user?.tokens.accessToken
                            });
                            return data.data as LikedSongTracksResponse[];
                        },
                        queryKey: ["liked-songs"],
                        meta: { persist: false },
            }
        ]
    });

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await userPlaylists.refetch();
        await userFollowings.refetch();
        await likedSongs.refetch();
        setIsRefreshing(false);
    }, [userPlaylists.refetch, userFollowings.refetch, likedSongs.refetch]);

    if (userPlaylists.isPending || userFollowings.isPending || likedSongs.isPending) {
        return <PrimaryLoader />
    }

    if (userPlaylists.error || userFollowings.error || likedSongs.error) {
        return (
            <Error />
        );
    }

    return (
        <NetworkProvider>
            <SafeAreaView className="flex-1 bg-background jus">
                <ScrollView
                    className="p-6 pb-10 flex flex-col gap-y-10"
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
                    <View className='flex flex-col gap-y-6'>
                        <View className='flex flex-col gap-y-2'>
                            <Text className="text-white text-3xl font-bold tracking-tight">Playlists</Text>
                            <Text className="text-zinc-400 text-sm">Your music collections</Text>
                        </View>
                        <View className='w-full flex-col justify-between gap-y-4 flex-wrap'>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                className='w-full flex flex-row items-center bg-neutral-900 rounded-3xl p-2 gap-x-4'
                                onPress={()=>setIsModalVisible(true)}
                            >
                                 <View className='size-14 bg-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center relative'>
                                    <Image
                                        source={require("@/assets/icons/note.png")}
                                        style={{ width: 24, height: 24 }}
                                    />
                                </View>
                                <View className='flex flex-col'>
                                    <Text className='text-white font-semibold text-lg'>Create New</Text>
                                    <Text className='text-neutral-400 text-sm'>Build a playlist with songs</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className='w-full flex flex-row items-center bg-neutral-900 rounded-3xl p-2 gap-x-4'
                                activeOpacity={0.7}
                                onPress={()=>router.push("/(tabs)/liked-songs")}
                            >
                                <View className='size-14 rounded-2xl overflow-hidden relative'>
                                    <Image
                                        source={require("@/assets/images/liked-thumb.png")}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </View>
                                <View className='flex-1 flex flex-col gap-y-1'>
                                    <Text className='text-white font-semibold text-lg'>Liked Songs</Text>
                                    <Text className='text-neutral-400'>{likedSongs.data?.length} { likedSongs.data?.length === 1 ? 'Song' : 'Songs' }</Text>
                                </View>
                            </TouchableOpacity>
                            {
                                userPlaylists.data.map((playlist: PlayList & { _count: {songs: number }})=> (
                                    <TouchableOpacity
                                        className='w-full flex flex-row items-center bg-neutral-900 rounded-3xl p-2 gap-x-4'
                                        activeOpacity={0.7}
                                        key={playlist.id}
                                        onPress={()=>router.push({
                                            pathname : "/(tabs)/playlist-songs/[playlistId]",
                                            params : { playlistId : playlist.id }
                                        })}
                                    >
                                        <View className='size-14 rounded-2xl overflow-hidden relative'>
                                            <Image
                                                source={playlist?.image ? {uri: playlist.image} : require("@/assets/images/playlist.png")}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </View>
                                        <View className='flex-1 flex flex-col gap-y-1'>
                                            <Text className='text-white font-semibold text-lg'>{playlist.name}</Text>
                                            <Text className='text-neutral-400'>{playlist._count.songs} Tracks</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    </View>
                    <View className='flex flex-col gap-y-6 pt-10'>
                        <View className='flex flex-col gap-y-2'>
                            <Text className="text-white text-4xl font-extrabold">Following</Text>
                            <Text className="text-zinc-400 text-sm">Artists you follow</Text>
                        </View>
                        <View className='w-full flex flex-row justify-between gap-y-4 flex-wrap'>
                            {
                                userFollowings.data.map((artist: Artist) => (
                                    <Card
                                        key={artist.id}
                                        className='w-[48%]'
                                        data={artist}
                                    />
                                ))
                            }
                        </View>
                    </View>
                    <Spacer />
                </ScrollView>
                <CreatePlaylistModal
                    isModalVisible={isModalVisible}
                    onCloseModal={onCloseModal}
                    totalPlaylists={userPlaylists.data.length}
                />
            </SafeAreaView>
        </NetworkProvider>
    );
}

export default Playlist;