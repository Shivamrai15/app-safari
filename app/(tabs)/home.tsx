import { router } from "expo-router";
import { Image } from "expo-image";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueries } from "@tanstack/react-query";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor
} from "react-native-reanimated";

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
import { useCallback, useEffect, useState } from "react";
import { RefreshControl } from "react-native-gesture-handler";
import { NotificationBadge } from "@/components/notification/badge";
import { LinearGradient } from "expo-linear-gradient";
import { useQueue } from "@/hooks/use-queue";

const Home = () => {

    const { user } = useAuth();
    const { current } = useQueue();
    const [refreshing, setRefreshing] = useState(false);

    const colorProgress = useSharedValue(0);
    const previousColor = useSharedValue("#111111");
    const targetColor = useSharedValue("#111111");

    useEffect(() => {
        const newColor = current?.album?.color ? `${current.album.color}5e` : "#1111115e";
        previousColor.value = targetColor.value;
        targetColor.value = newColor;
        colorProgress.value = 0;
        colorProgress.value = withTiming(1, { duration: 500 });
    }, [current?.album?.color]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            colorProgress.value,
            [0, 1],
            [previousColor.value, targetColor.value]
        );
        return {
            backgroundColor,
        };
    });

    const [trendingSongs, recommendedAlbums, newAlbums, listenAgainSongs, favoriteArtists] = useQueries({
        queries: [
            {
                queryFn: async () => {
                    const data = await fetcher({
                        prefix: "PUBLIC_BASE_URL",
                        suffix: "api/v2/song/trending",
                        token: user?.tokens.accessToken
                    });
                    return data.items;
                },
                queryKey: ["trending-songs"]
            },
            {
                queryFn: async () => {
                    const data = await fetcher({
                        prefix: "PUBLIC_BASE_URL",
                        suffix: "api/v2/album/recommended",
                        token: user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey: ["recommended-albums"]
            },
            {
                queryFn: async () => {
                    const data = await fetcher({
                        prefix: "PUBLIC_BASE_URL",
                        suffix: "api/v2/album/new",
                        token: user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey: ["new-albums"]
            },
            {
                queryFn: async () => {
                    const data = await fetcher({
                        prefix: "PROTECTED_BASE_URL",
                        suffix: "api/v2/song/listen-again",
                        token: user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey: ["listen-again"]
            },
            {
                queryFn: async () => {
                    const data = await fetcher({
                        prefix: "PROTECTED_BASE_URL",
                        suffix: "api/v2/artist/favorites",
                        token: user?.tokens.accessToken
                    });
                    return data.data;
                },
                queryKey: ["favorite-artists"]
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
            <SafeAreaView
                className="flex-1 bg-background"
                edges={["top", "left", "right"]}
            >
                <ScrollView
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
                    <Animated.View
                        style={[
                            {
                                paddingVertical: 16,
                                paddingHorizontal: 16,
                            },
                            animatedStyle
                        ]}
                    >
                        <LinearGradient
                            colors={["transparent", "#111111"]}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                            }}
                        />
                        <View className="flex flex-row items-center justify-end gap-x-4">
                            <NotificationBadge />
                            <LogoutButton />
                        </View>
                        <View className="flex flex-row items-center gap-x-6 mt-16">
                            <View className="size-24 rounded-full overflow-hidden relative">
                                <Image
                                    source={user?.user?.image ? { uri: user?.user.image } : require('@/assets/images/user.png')}
                                    style={{ height: "100%", width: "100%" }}
                                />
                            </View>
                            <View className="flex flex-col gap-y-0.5">
                                <Text className="text-xl font-bold text-zinc-400">{user?.user.name}</Text>
                                <Text className="text-3xl text-white font-extrabold">Listen Again</Text>
                            </View>
                        </View>
                    </Animated.View>
                    <View className="pt-10 flex flex-col gap-y-4 px-4">
                        <TouchableOpacity
                            onPress={() => router.push("/(tabs)/liked-songs")}
                            className="w-full flex flex-row items-center gap-x-4 bg-secondary rounded-md overflow-hidden"
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
                            className="w-full flex flex-row items-center gap-x-4 bg-secondary rounded-md overflow-hidden"
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
                    <View className="px-4">
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
                    </View>
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    );
};

export default Home;