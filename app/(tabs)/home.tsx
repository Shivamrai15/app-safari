import { router } from "expo-router";
import { Image } from "expo-image";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueries } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { fetcher } from "@/lib/fetcher";
import { Error } from "@/components/ui/error";
import { PrimaryLoader } from "@/components/ui/loader";
import { AlbumCarousel } from "@/components/carousel/album";
import { TrendingSongs } from "@/components/carousel/trending-songs";
import { ListenAgainCarousel } from "@/components/carousel/listen-again";
import { ArtistCarousel } from "@/components/carousel/artist";
import { NetworkProvider } from "@/providers/network.provider";
import { Spacer } from "@/components/ui/spacer";
import { LogoutButton } from "@/components/auth/logout-button";
import { useCallback, useState } from "react";
import { RefreshControl } from "react-native-gesture-handler";

const Home = () => {

    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const [ trendingSongs, recommendedAlbums, newAlbums, listenAgainSongs, favoriteArtists ] = useQueries({
        queries:[
            {
                queryFn : async()=>{
                    const data = await fetcher({
                        prefix : "PUBLIC_BASE_URL",
                        suffix : "api/v2/song/trending",
                        token : user?.tokens.accessToken
                    });
                    return data.items;
                },
                queryKey : ["trending-songs"]
            },
            {
                queryFn : async()=>{
                    const data = await fetcher({
                        prefix : "PUBLIC_BASE_URL",
                        suffix : "api/v2/album/recommended",
                        token : user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey : ["recommended-albums"]
            },
            {
                queryFn : async()=>{
                    const data = await fetcher({
                        prefix : "PUBLIC_BASE_URL",
                        suffix : "api/v2/album/new",
                        token : user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey : ["new-albums"]
            },
            {
                queryFn : async()=>{
                    const data = await fetcher({
                        prefix : "PROTECTED_BASE_URL",
                        suffix : "api/v2/song/listen-again",
                        token : user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey : ["listen-again"]
            },
            {
                queryFn : async()=>{
                    const data = await fetcher({
                        prefix : "PROTECTED_BASE_URL",
                        suffix : "api/v2/artist/favorites",
                        token : user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey : ["favorite-artists"]
            }
        ]
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            trendingSongs.refetch(),
            recommendedAlbums.refetch(),
            newAlbums.refetch(),
            listenAgainSongs.refetch(),
            favoriteArtists.refetch()
        ]);
        setRefreshing(false);
    }, []);

    if (trendingSongs.isLoading || recommendedAlbums.isLoading || newAlbums.isLoading || listenAgainSongs.isLoading || favoriteArtists.isLoading) {
        return <PrimaryLoader />;
    }

    if (trendingSongs.error || recommendedAlbums.error || newAlbums.error || listenAgainSongs.error || favoriteArtists.error) {
        return (
            <Error />
        );
    }

    return (
        <NetworkProvider>
            <SafeAreaView className="flex-1 bg-background">
                <ScrollView
                    className="p-4 pt-6 pb-28"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#ef4444"
                            colors={["#ef4444"]}
                        />
                    }
                >
                    <View className="flex flex-row items-center justify-end gap-x-6">
                        <LogoutButton/>
                    </View>
                    <View className="flex flex-row items-center gap-x-6 mt-16">
                        <View className="size-24 rounded-full overflow-hidden relative">
                            <Image
                                source={ user?.user?.image ? { uri: user?.user.image } : require('@/assets/images/user.png') }
                                style={{ height: "100%", width: "100%" }}
                            />
                        </View>
                        <View className="flex flex-col gap-y-0.5">
                            <Text className="text-xl font-bold text-zinc-400">{user?.user.name}</Text>
                            <Text className="text-3xl text-white font-extrabold">Listen Again</Text>
                        </View>
                    </View>
                    <View className="pt-10 flex flex-col gap-y-4">
                        <TouchableOpacity
                            onPress={() => router.push("/(tabs)/liked-songs")}
                            className="w-full flex flex-row items-center gap-x-4 bg-neutral-800 rounded-md overflow-hidden"
                            activeOpacity={0.7}
                        >
                            <Image
                                source={require('@/assets/images/liked-thumb.png')}
                                style={{ width: 56, height: 56 }}
                                contentFit="contain"
                            />
                            <Text className="text-lg font-semibold text-white">
                                Liked Songs
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push("/(tabs)/history")}
                            className="w-full flex flex-row items-center gap-x-4 bg-neutral-800 rounded-md overflow-hidden"
                            activeOpacity={0.7}
                        >
                            <Image
                                source={require('@/assets/images/history.avif')}
                                style={{ width: 56, height: 56 }}
                                contentFit="contain"
                            />
                            <Text className="text-lg font-semibold text-white">
                                History
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <ListenAgainCarousel
                        data={listenAgainSongs.data}
                    />
                    <TrendingSongs
                        data={trendingSongs.data}
                    />
                    <AlbumCarousel
                        data={newAlbums.data}
                        slug="New Releases"
                    />
                    <AlbumCarousel
                        data={recommendedAlbums.data}
                        slug="Recommended Albums"
                    />
                    <ArtistCarousel
                        data={favoriteArtists.data}
                        slug="Your favorite artists"
                    />
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    );
};

export default Home;