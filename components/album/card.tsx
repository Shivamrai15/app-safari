import { Image } from 'expo-image';
import { Text, View, Pressable, TouchableOpacity } from 'react-native';
import { Album } from '@/types/response.types';
import { router } from 'expo-router';
import { cn } from '@/lib/utils';

interface Props {
    album : Album;
    className? : string;
}

export const Card = ({ album, className }: Props) => {
    return (
        <TouchableOpacity
            className={cn(
                "relative w-44 flex flex-col",
                className
            )}
            onPress={()=>router.push({
                pathname : "/(tabs)/album/[albumId]",
                params : {
                    albumId : album.id
                }
            })}
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
