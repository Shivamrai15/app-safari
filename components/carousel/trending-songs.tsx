import { Link } from "expo-router";
import { Text, View, FlatList } from "react-native";
import { Trending } from "../song/trending";
import { TrendingSong } from "@/types/response.types";

interface Props {
    data : TrendingSong[];
}

export const TrendingSongs = ({ data }: Props) => {

    return (
        <View className="flex flex-col gap-y-4 pt-10">
            <View className="flex flex-row justify-between items-center">
                <Text className="text-white font-bold text-2xl block">
                    Trending Songs
                </Text>
                <Link href="/(tabs)/home">
                    <Text className="text-zinc-300 font-bold">
                        More
                    </Text>
                </Link>
            </View>
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                renderItem={({ item, index })=>(
                    <Trending song={item} index={index} />
                )}
            />
        </View>
    )
}
