import {
    View,
    ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDownloads } from '@/hooks/use-downloads';
import { Header } from '@/components/downloads/playlist-header';
import { SongList } from '@/components/downloads/song-list';


const PlaylistSongs = () => {
    const { playlistId } = useLocalSearchParams();

    const { getPlaylistById } = useDownloads();

    const data = getPlaylistById(playlistId as string);

    if (!data) {
        return router.push("/(tabs)/downloads")
    }

    return (
        <SafeAreaView className='flex-1 bg-background'>
            <ScrollView
                className='flex-1'
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <Header data={data} />
                <SongList data={data.songs} /> 
                <View className='h-40' />
            </ScrollView>
        </SafeAreaView>
    )
}

export default PlaylistSongs