import { useState } from "react";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";
import { useQueue } from "@/hooks/use-queue";
import { albumDuration, cn } from "@/lib/utils";
import { SongResponse } from "@/types/response.types";
import { Options } from "../song/options";

interface Props {
    className?: string;
    data : SongResponse;
}

export const SongItem = ({ className, data }: Props) => {

    const { priorityEnqueue } = useQueue();
    const [ openOptions, setOpenOptions ] = useState(false);

    return (
        <>
            <TouchableOpacity 
                className={cn(
                    "w-full flex flex-row items-center justify-between gap-x-4",
                    className
                )}
                activeOpacity={0.7}
                onPress={()=>priorityEnqueue([data])}
                onLongPress={()=>setOpenOptions(true)}
            >
                <Image
                    source={{ uri: data.image }}
                    style={{ width: 48, height: 48, borderRadius: 8 }}
                    contentFit="contain"
                />
                <View className="flex-1 flex flex-col gap-y-0.5">
                    <Text className="text-white font-semibold" numberOfLines={1} ellipsizeMode="tail" >{data.name}</Text>
                    <Text className="text-neutral-300 font-medium text-sm" numberOfLines={1} ellipsizeMode="tail" >{data.album.name}</Text>
                </View>
                <Text className="font-medium w-12 text-white" >{albumDuration(data.duration)}</Text>
            </TouchableOpacity>
            <Options
                data={data}
                open={openOptions}
                onClose={()=>setOpenOptions(false)}
                isDownloaded
            />
        </>
    )
}