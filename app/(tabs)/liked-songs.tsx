import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/liked/header';
import { SongItem } from '@/components/song/item';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { fetcher } from '@/lib/fetcher';
import { LikedSongTracksResponse } from '@/types/response.types';
import { PrimaryLoader } from '@/components/ui/loader';
import { Error } from '@/components/ui/error';
import Feather from '@expo/vector-icons/Feather';
import { NetworkProvider } from '@/providers/network.provider';
import { Spacer } from '@/components/ui/spacer';

const LikedSongs = () => {

    const { user } = useAuth();

    const { data, isPending, error } = useQuery({
        queryFn : async()=>{
            const data = await fetcher({
                prefix : "PROTECTED_BASE_URL",
                suffix : 'api/v2/song/liked/tracks',
                token : user?.tokens.accessToken
            });
            return data.data as LikedSongTracksResponse[];
        },
        queryKey: ["liked-songs"],
        meta: { persist: false },
    });

    if (isPending) {
        return <PrimaryLoader />
    }

    if (error || !data){
        return <Error />
    }

    const songs = data.map(item => item.song);

    return (
        <NetworkProvider>
            <SafeAreaView className="flex-1 bg-background">
                <ScrollView
                    className="flex flex-col gap-y-10"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <LinearGradient
                        colors={['#111111', '#87141b']}
                        locations={[0.8, 1.0]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <Header
                            totalSongs={songs.length}
                            songs={songs}
                        />
                        <View className="w-full flex flex-col gap-y-6 px-6">
                            <View className="w-full flex flex-row items-center justify-between gap-4">
                                <View className="flex flex-row items-center gap-4 font-semibold text-lg">
                                    <Text className="w-14 text-white text-xl font-bold text-center">#</Text>
                                    <Text className="text-white text-xl font-semibold">Title</Text>
                                </View>
                                <View className="flex items-center w-14 justify-center">
                                    <Feather name="clock" size={20} color="white" />
                                </View>
                            </View>
                            <View className="bg-zinc-600 h-0.5 w-full rounded-full"/>
                            <View className='flex flex-col gap-y-5'>
                                {songs.map(song => (
                                    <SongItem key={song.id} data={song} />
                                ))}
                            </View>
                        </View>
                        
                    </LinearGradient>
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default LikedSongs;