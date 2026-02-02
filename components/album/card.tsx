import { Image } from 'expo-image';
import { Text, View, Pressable, TouchableOpacity } from 'react-native';
import { Album } from '@/types/response.types';
import { router } from 'expo-router';
import { cn } from '@/lib/utils';
import { useRecentSearches } from '@/hooks/use-recent-searches';

interface Props {
    album : Album;
    className? : string;
    addToSearchHistory?: boolean;
}

export const Card = ({ album, className, addToSearchHistory = false }: Props) => {

    const { addSearch } = useRecentSearches();

    return (
        <TouchableOpacity
            className={cn(
                "relative w-44 flex flex-col",
                className
            )}
            onPress={() => {
                router.push({
                    pathname : "/(tabs)/album/[albumId]",
                    params : {
                        albumId : album.id
                    }
                });
                if (addToSearchHistory) {
                    addSearch({
                        content_id: album.id,
                        type: "ALBUM",
                        name: album.name,
                        image: album.image,
                    });
                }
            }}
            activeOpacity={0.7}
        >
            <View className="h-1 mx-4 rounded-t-lg" style={{backgroundColor : `${album.color}5e`}} />
            <View className="h-1 mx-2 rounded-t-lg" style={{backgroundColor : `${album.color}`}} />
            <View className="w-full rounded-lg bg-secondary overflow-hidden">
                <Image
                    source={{
                        uri : album.image
                    }}
                    style={{
                        width: "100%",
                        height: 156,
                    }}
                />
                <View className="p-4 bg-secondary">
                    <Text className="text-white font-semibold line-clamp-1">
                        {album.name}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
