import { LinearGradient } from "expo-linear-gradient";
import { AlbumResponse } from "@/types/response.types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryLoader } from "@/components/ui/loader";
import { Header } from "@/components/album/header";
import { List } from "@/components/album/list";
import { AlbumLabel } from "@/components/album/label";
import { fetcher } from "@/lib/fetcher";
import { Error } from "@/components/ui/error";
import { useAuth } from "@/hooks/use-auth";
import { NetworkProvider } from "@/providers/network.provider";


const AlbumPage = () => {
    const { user } = useAuth();
    const { albumId } = useLocalSearchParams();

    const { data, isPending, error } = useQuery({
        queryFn : async()=>{
            const data = await fetcher({
                prefix : "PUBLIC_BASE_URL",
                suffix : `api/v2/album/${albumId}`,
                token : user?.tokens.accessToken
            });
            return data.data as AlbumResponse;
        },
        queryKey: ["album", albumId]
    });


    if (isPending) {
        return <PrimaryLoader />;
    }

    if (!data || error) {
        return <Error />;
    }

    return (
        <NetworkProvider>
            <SafeAreaView className="flex-1 bg-background">
                <ScrollView
                    className="w-full h-full flex-1"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <LinearGradient
                        colors={['#111111', `${data.color}5a`]}
                        locations={[0.8, 1.0]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ height: "100%", width: "100%", flex: 1 }}
                    >
                        <Header data={data} />
                        <List data={data.songs} />
                        {
                            data?.label && (
                                <AlbumLabel label={data.label} releaseDate={data.release} />
                            )
                        }
                    <View className="h-20" />
                    </LinearGradient>
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default AlbumPage;
