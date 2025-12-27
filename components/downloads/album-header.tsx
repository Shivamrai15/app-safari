import { Image } from "expo-image";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Entypo from '@expo/vector-icons/Entypo';
import { albumDuration } from "@/lib/utils";
import { DownloadedAlbum } from "@/hooks/use-downloads";
import { ShuffleButton } from "@/components/song/shuffle-button";
import { DownloadButton } from "@/components/album/download-button";
import { AlbumPlayButton } from "@/components/downloads/album-play-button";
import { DeleteButton } from "../downloads/delete-button";


interface Props {
    data: DownloadedAlbum;
}

export const AlbumHeader = ({ data }: Props) => {
    return (
        <LinearGradient
            colors={[data.color, '#111111']}
            locations={[0.4, 0.3]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
                width: '100%',
            }}
        >
            <View className="p-10">
                <View className="flex flex-col items-center">
                    <View className="relative shrink-0 aspect-square h-44 w-44 overflow-hidden rounded-lg">
                        <Image
                            source={{ uri: data.image }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: "cover"
                            }}
                        />
                    </View>
                    <View className="flex flex-col gap-y-2 mt-4 text-center w-full">
                        <Text className="text-white text-center text-4xl font-extrabold line-clamp-1 py-1 overflow-hidden">
                            {data.name}
                        </Text>
                        <View className="flex flex-row items-center justify-center">
                            <Text className="text-white font-semibold">
                                {data.songs.length} Songs
                            </Text>
                            <Entypo name="dot-single" size={24} color="white" />
                            <Text className="text-white font-semibold">
                                {albumDuration(data.songs.reduce((acc, song) => acc + song.duration, 0))}
                            </Text>
                        </View>
                        <View className="w-full flex flex-row items-center justify-center pt-2">
                            <View className="flex flex-row justify-center items-center gap-4 px-4 py-1 rounded-full bg-neutral-900">
                                <AlbumPlayButton
                                    songs={data.songs.map((song) => ({
                                        ...song, album: {
                                            id: data.id,
                                            name: data.name,
                                            image: data.image,
                                            color: data.color,
                                            songs: data.songs,
                                            release: "",
                                            labelId: ""
                                        }
                                    }))}
                                    className="h-9 w-9"
                                />
                                <ShuffleButton
                                    height={28}
                                    width={28}
                                />
                                <DeleteButton id={data.id} type="album" size={28} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    )
}