import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
    Text,
    View,
    ScrollView,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryLoader } from "@/components/ui/loader";
import { Error } from "@/components/ui/error";
import { useAuth } from "@/hooks/use-auth";
import { fetcher } from "@/lib/fetcher";
import { NetworkProvider } from "@/providers/network.provider";
import { ArtistProfileResponse } from "@/types/response.types";
import { Songs } from "@/components/artist/songs";
import Entypo from "@expo/vector-icons/Entypo";
import { useQuery } from "@tanstack/react-query";


const ArtistSongs = () => {

    const { user } = useAuth();
    const { artistId } = useLocalSearchParams();
    const [atEnd, setAtEnd] = useState(false);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // buffer of 20px
        setAtEnd(isEnd);
    };

    const { data, isPending, error } = useQuery({
        queryFn : async()=>{
            const data = await fetcher({
                prefix : "PUBLIC_BASE_URL",
                suffix : `api/v2/artist/${artistId}/profile`,
                token : user?.tokens.accessToken
            });
            return data.data as ArtistProfileResponse;
        },
        queryKey: ["artist-profile", artistId]
    });

    if (isPending) {
        return (
            <PrimaryLoader />
        )
    }

    if (error || !data) {
        return (
            <Error />
        )
    }

    return (
        <NetworkProvider>
            <SafeAreaView
                className="flex-1 bg-background"
            >
                <ScrollView
                    className="w-full flex-1 px-4 py-10"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className="flex flex-row gap-x-6 items-center">
                        <View className="size-28 rounded-full overflow-hidden relative">
                            <Image
                                source={{
                                    uri : data.image
                                }}
                                style={{ width : "100%", height : "100%" }}
                            />
                        </View>
                        <View className="flex-1 flex flex-col gap-y-3">
                            <Text className="text-white text-2xl font-bold">{data.name}</Text>
                            <View className="flex flex-row gap-x-2">
                                <Text className="text-zinc-300 font-medium">{data._count.songs} Songs</Text>
                                <Entypo name="dot-single" size={24} color="#d4d4d8" />
                                <Text className="text-zinc-300 font-medium">{data._count.followers} Followers</Text>
                            </View>
                        </View>
                    </View>
                    <Songs isAtEnd={atEnd} artistId={data.id} />
                    <View className="h-40" />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default ArtistSongs;