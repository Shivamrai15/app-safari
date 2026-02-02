import { Image } from "expo-image";
import Entypo from '@expo/vector-icons/Entypo';
import { Text, TouchableOpacity, View } from "react-native";
import { SearchHistory } from "@/types/native.types";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { router } from "expo-router";

interface Props {
    search: SearchHistory;
}

export const RecentCard = ({ search }: Props) => {

    const { removeSearch } = useRecentSearches();

    const onPress = () => {
        switch (search.type) {
            case "ALBUM":
                router.push({
                    pathname : "/(tabs)/album/[albumId]",
                    params : {
                        albumId : search.content_id
                    }
                });
                break;
            case "ARTIST":
                router.push({
                    pathname : "/(tabs)/artist/[artistId]",
                    params : {
                        artistId : search.content_id
                    }
                })
                break;
            case "PLAYLIST":
                router.push({
                    pathname : "/(tabs)/playlist-songs/[playlistId]",
                    params : {
                        playlistId : search.content_id
                    }
                });
                break;
            case "SONG":
                // router.push({
                //     pathname : "",
                //     params : {
                //         songId : search.content_id
                //     }
                // });
                break;
            default:
                break;
        }
    }

    return (
        <TouchableOpacity
            className="flex-row items-center gap-4"
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View className="size-14 rounded-lg overflow-hidden relative">
                <Image
                    source={{ uri: search.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                />
            </View>
            <View className="flex-1 flex flex-col gap-2">
                <Text
                    className="text-white text-base font-semibold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {search.name}
                </Text>
                <Text className="text-white text-xs font-semibold" >
                    {search.type.charAt(0).toUpperCase() + search.type.slice(1).toLowerCase()}
                </Text>
            </View>
            <TouchableOpacity
                activeOpacity={0.7}
                className="size-14 flex items-center justify-center"
                onPress={() => removeSearch(search.id)}
            >
                <Entypo name="cross" size={24} color="white" />
            </TouchableOpacity>
        </TouchableOpacity>
    )
}