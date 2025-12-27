import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDownloads } from "@/hooks/use-downloads";
import { SongList } from "@/components/downloads/song-list";
import { AlbumHeader } from "@/components/downloads/album-header";


const AlbumPage = () => {

    const { albumId } = useLocalSearchParams();
    const { getAlbumById } = useDownloads();

    const data = getAlbumById(albumId as string);
    
    if (!data ) {
        return router.push("/(tabs)/home");
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <LinearGradient
                    colors={['#111111', `${data.color}5a`]}
                    locations={[0.8, 1.0]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ flexGrow: 1 }}
                >
                    <AlbumHeader data={data} />
                    <SongList data={data.songs} />
                    <View className="h-32" />
                </LinearGradient>
            </ScrollView>
        </SafeAreaView>
    )
}

export default AlbumPage;