import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { Album, Artist, SongResponse } from "@/types/response.types";
import { Fragment } from "react";
import { PlayButton } from "../album/play-button";
import { PlayButton as ArtistPlayButton } from "../artist/play-button";
import { Button } from "@/components/ui/button";

interface Props {
    data : SongResponse | Album | Artist;
}

export const TopResultCard = ({ data }: Props) => {
    return (
        <View className="w-full rounded-xl overflow-hidden bg-neutral-800">
            <View className="flex flex-row gap-x-5 items-center p-3">
                <View className="h-32 w-32 overflow-hidden relative rounded-lg">
                    <Image
                        source={{ uri: data.image }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                </View>
                <View className="flex flex-col gap-y-4 items-start flex-1">
                    {
                        'release' in data && (
                            <Fragment>
                                <View className="flex flex-col items-start gap-y-2 flex-1">
                                    <Text className="text-2xl text-white font-bold text-left text-wrap">
                                        {data.name}
                                    </Text>
                                    <View className="flex flex-row gap-x-2 items-center justify-start">    
                                        <Text className="text-zinc-300 font-medium">
                                            Album
                                        </Text>
                                        <Entypo name="dot-single" size={24} color="#d4d4d8" />
                                        <Text className="text-zinc-300 font-medium">
                                            {new Date(data.release).getFullYear()}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex flex-row gap-x-6 items-center justify-start">
                                    <PlayButton
                                        id={data.id}
                                        className="size-12"
                                    />
                                    <Button 
                                        className="rounded-full"
                                        onPress={()=>router.push({
                                            pathname : "/(tabs)/album/[albumId]",
                                            params : {
                                                albumId : data.id
                                            }
                                        })}
                                    >
                                        <Text className="font-semibold">
                                            Go to Album
                                        </Text>
                                    </Button>
                                </View>
                            </Fragment>
                        )
                    }
                    {
                        "album" in data && (
                            <Fragment>
                                <View className="flex flex-col items-start gap-y-2 flex-1">
                                    <Text className="text-2xl text-white font-bold text-left text-wrap">
                                        {data.name}
                                    </Text>
                                    <View className="flex flex-row items-center justify-start">    
                                        <Text className="text-zinc-300 font-medium">
                                            Song
                                        </Text>
                                        <Entypo name="dot-single" size={24} color="#d4d4d8" />
                                        <Text className="text-zinc-300 font-medium">
                                            {
                                                data.artists[0]?.name
                                            }
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex flex-row gap-x-6 items-center justify-start">
                                    <PlayButton
                                        songs={[data]}
                                        className="size-12"
                                    />
                                    <Button 
                                        className="rounded-full"
                                        onPress={()=>router.push({
                                            pathname : "/(tabs)/album/[albumId]",
                                            params : {
                                                albumId : data.albumId
                                            }
                                        })}
                                    >
                                        <Text className="font-semibold">
                                            Go to Album
                                        </Text>
                                    </Button>
                                </View>
                            </Fragment>
                        )
                    }
                    {
                        ( !('release' in data) && (!('album' in data)) ) && (
                            <Fragment>
                                <View className="flex flex-col items-start gap-y-2 flex-1">
                                    <Text className="text-2xl text-white font-bold text-left text-wrap">
                                        {data.name}
                                    </Text>
                                    <Text className="text-zinc-300 text-left font-medium">
                                        Artist
                                    </Text>
                                </View>
                                <View className="flex flex-row gap-x-6 items-center justify-start">
                                    <ArtistPlayButton id={data.id} />
                                    <Button 
                                        className="rounded-full"
                                        onPress={()=>router.push({
                                            pathname : "/(tabs)/artist/[artistId]",
                                            params : {
                                                artistId : data.id
                                            }
                                        })}
                                    >
                                        <Text className="font-semibold">
                                            Go to Artist
                                        </Text>
                                    </Button>
                                </View>
                            </Fragment>
                        )
                    }
                </View>
            </View>
        </View>
    )
}
