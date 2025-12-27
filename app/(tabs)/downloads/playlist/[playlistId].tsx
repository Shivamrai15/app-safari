import {
    View,
    ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDownloads } from '@/hooks/use-downloads';
import { Header } from '@/components/downloads/playlist-header';
import { SongList } from '@/components/downloads/song-list';
import { Spacer } from '@/components/ui/spacer';


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
                <Spacer />
            </ScrollView>
        </SafeAreaView>
    )
}

export default PlaylistSongs