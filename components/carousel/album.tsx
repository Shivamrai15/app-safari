import { Link, Href } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { Album } from "@/types/response.types";
import { Card } from "../album/card";

interface Props {
    data : Album[];
    slug ?: string;
    link ?: {
        title: string;
        href: Href;
    }   
    addToSearchHistory?: boolean;
}

export const AlbumCarousel = ({ data, slug, link, addToSearchHistory = false }: Props) => {
    return (
        <View className="flex flex-col gap-y-4 pt-10">
            {
                slug && (
                    <View className="flex flex-row justify-between items-center">
                        <Text className="text-white font-bold text-2xl">
                            {slug}
                        </Text>
                        {
                            link && (
                                <Link href={link.href}>
                                    <Text className="text-zinc-300 font-bold">
                                        {link.title}
                                    </Text>
                                </Link>
                            )
                        }
                    </View>
                )
            }
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                renderItem={({ item, index })=>(
                    <Card album={item} key={index} addToSearchHistory={addToSearchHistory} />
                )}
            />
        </View>
    )
}
