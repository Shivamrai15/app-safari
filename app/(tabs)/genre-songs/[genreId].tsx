import { Fragment, useEffect, useState } from "react";
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    View
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Error } from "@/components/ui/error";
import { PrimaryLoader, SecondaryLoader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { fetcher } from "@/lib/fetcher";
import { MoodResponse, SongResponse } from "@/types/response.types";
import { Header } from "@/components/browse/header";
import { useInfinite } from "@/hooks/use-infinite";
import Feather from "@expo/vector-icons/Feather";
import { SongItem } from "@/components/song/item";
import { PUBLIC_BASE_URL } from "@/constants/api.config";
import { NetworkProvider } from "@/providers/network.provider";
import { Spacer } from "@/components/ui/spacer";

const GenreSongs = () => {
    const { user } = useAuth();
    const { genreId } = useLocalSearchParams();
    
    const { data, isPending, error } = useQuery({
        queryFn : async () => {
            const data = await fetcher({
                prefix : "PUBLIC_BASE_URL",
                suffix : `api/v2/genre/${genreId}`,
                token : user?.tokens.accessToken
            })
            return data.data as MoodResponse;
        },
        queryKey : ["genre", genreId],
    });

    const [atEnd, setAtEnd] = useState(false);
    
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // buffer of 20px
        setAtEnd(isEnd);
    };

    const { data: songData, status, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfinite({
        url: `${PUBLIC_BASE_URL}/api/v2/genre/${genreId}/songs`,
        queryKey: `genre-songs-${genreId}`,
        token: user?.tokens.accessToken,
        paramKey: "",
        paramValue: ""
    });

    useEffect(()=>{
        if(atEnd && hasNextPage){
            fetchNextPage();
        }
    }, [atEnd, hasNextPage]);

    if (isPending || status === "pending") {
        return <PrimaryLoader />
    }

    if (error || !data || status === "error") {
        return <Error />
    }
    
    return (
        <NetworkProvider>
            <SafeAreaView className="bg-background flex-1">
                <ScrollView
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <Header
                        id={data.id}
                        type="genre"
                        name={data.name}
                        songCount={data._count.metadata}
                        image={data.image}
                        color={data.color}
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
                            {
                                songData?.pages.map((group, i)=>(
                                        <Fragment key={i} >
                                            {
                                                group.items.map((song: SongResponse) => (
                                                    <SongItem key={song.id} data={song} />
                                                ))
                                            }
                                        </Fragment>
                                    ))

                            }
                            {
                                isFetchingNextPage && (<View className='w-full h-6'>
                                    <SecondaryLoader />
                                </View>)
                            }
                        </View>
                    </View>
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default GenreSongs;