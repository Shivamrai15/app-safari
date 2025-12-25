import { Options } from "./options";
import { useQueue } from "@/hooks/use-queue";
import { Album, Artist, Song } from "@/types/response.types";
import { Image } from "expo-image";
import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";

interface Props {
    song : Song & { album : Album, artists : Artist[] }
}

export const FlatCard = ({ song }: Props) => {

    const { priorityEnqueue } = useQueue();
    const [ openOptions, setOpenOptions ] = useState(false);

    return (
        <>
            <TouchableOpacity
                className="w-full p-2 flex flex-row items-center gap-x-4 bg-neutral-800 rounded-md overflow-hidden"
                activeOpacity={0.7}
                onPress={()=>priorityEnqueue([song])}
                onLongPress={()=>setOpenOptions(true)}
            >
                <Image
                    source={{
                        uri: song.image
                    }}
                    style={{ width: 56, height: 56 }}
                    contentFit="contain"
                />
                <View className="flex-1">
                    <Text className="text-white font-semibold" numberOfLines={1} ellipsizeMode="tail" >{song.name}</Text>
                    <Text className="text-neutral-300 font-medium text-sm" numberOfLines={1} ellipsizeMode="tail" >{song.artists.map(artist => artist.name).join(", ")}</Text>
                </View>
            </TouchableOpacity>
            <Options data={song} open={openOptions} onClose={()=>setOpenOptions(false)} />
        </>
    )
}
