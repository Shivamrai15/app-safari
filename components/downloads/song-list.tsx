import { Text, View } from "react-native";
import { Album, Artist, Song } from "@/types/response.types";
import Feather from '@expo/vector-icons/Feather';
import { SongItem } from "./song-item";

interface Props {
    data : (Song & { album: Album, artists : Artist[] })[];
}

export const SongList = ({ data }: Props) => {
    return (
        <View className="w-full flex flex-col gap-y-4 py-5" >
            <View className="w-full flex flex-col gap-y-6 px-6">
                <View className="w-full flex flex-row items-center justify-between gap-4 px-4 ">
                    <View className="flex flex-row items-center gap-4 font-semibold text-lg">
                        <Text className="w-8 text-white text-xl font-bold">#</Text>
                        <Text className="text-white text-xl font-semibold">Title</Text>
                    </View>
                    <View className="flex items-center w-14 justify-center">
                        <Feather name="clock" size={20} color="white" />
                    </View>
                </View>
                <View className="bg-zinc-600 h-0.5 w-full rounded-full"/>
                <View className="flex flex-col gap-y-6">
                    {
                        data.map((item, index) => (
                            <SongItem key={item.id} data={item} />
                        ))
                    }
                </View>
            </View>
        </View>
    )
}