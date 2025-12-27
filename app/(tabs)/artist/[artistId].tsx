import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/ui/error";
import { PrimaryLoader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { fetcher } from "@/lib/fetcher";
import { NetworkProvider } from "@/providers/network.provider";
import { Album, ArtistResponse } from "@/types/response.types";
import { BioCard } from "@/components/artist/bio";
import { Header } from "@/components/artist/header";
import { PlayButton } from "@/components/artist/play-button";
import { SubscribeButton } from "@/components/artist/subscribe-button";
import { AlbumCarousel } from "@/components/carousel/album";
import { SongItem } from "@/components/song/item";
import { ShuffleButton } from "@/components/song/shuffle-button";
import { useQueries } from "@tanstack/react-query";
import { Spacer } from "@/components/ui/spacer";


const ArtistPage = () => {

    const { user } = useAuth();
    const { artistId } = useLocalSearchParams();

    const [ artist, discography ] = useQueries({
        queries : [
            {
                queryFn : async()=>{
                    const data = await fetcher({
                        prefix : "PUBLIC_BASE_URL",
                        suffix : `api/v2/artist/${artistId}`,
                        token : user?.tokens.accessToken
                    });
                    return data.data as ArtistResponse;
                },
                queryKey: ["artist", artistId]
            },
            {
                queryFn : async()=>{
                    const data = await fetcher({
                        prefix : "PUBLIC_BASE_URL",
                        suffix : `api/v2/artist/${artistId}/discography`,
                        token : user?.tokens.accessToken
                    });
                    return data.items as Album[];
                },
                queryKey: ["discography", artistId]
            }
        ]
    });

    if (artist.isLoading || discography.isLoading) {
        return (
            <PrimaryLoader />
        )
    };

    if (artist.isError || discography.isError || !artist.data || !discography.data) {
        return (
            <Error/>
        )
    }

    return (
        <NetworkProvider>
            <SafeAreaView className="flex-1 bg-background">
                <ScrollView
                    className="w-full flex-1"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <Header
                        name={artist.data.name}
                        image={artist.data.image}
                        thumbnail={artist.data.thumbnail}
                    />
                    <View className="flex flex-row gap-x-4 p-4 items-center" >
                        <PlayButton id={artist.data.id} />
                        <ShuffleButton />
                        <SubscribeButton artist={artist.data} />
                    </View>
                    <View className="mt-10 flex flex-col gap-y-6 px-4">
                        <Text className="text-white font-bold text-2xl">Popular</Text>
                        <View className="flex flex-col gap-y-4">
                            {
                                artist.data.songs.map((song)=>(
                                    <SongItem
                                        key={song.id}
                                        data={song}
                                    />
                                ))
                            }
                        </View>
                    </View>
                    <View className="mt-6 px-4">
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onPress={()=>router.push({
                                pathname : "/(tabs)/artist-songs/[artistId]",
                                params : { artistId : artist.data.id }
                            })}
                        >
                            <Text className="text-white font-semibold">See More</Text>
                        </Button>
                        <AlbumCarousel
                            data={discography.data}
                            slug="Albums"
                        />
                    </View>
                    <BioCard
                        image={artist.data.image}
                        description={artist.data.about}
                    />
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default ArtistPage;

