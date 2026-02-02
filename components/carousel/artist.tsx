import { Link, Href } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { Artist } from "@/types/response.types";
import { Card } from "../artist/card";

interface Props {
    data : Artist[];
    slug ?: string;
    link ?: {
        title: string;
        href: Href;
    },
    addToSearchHistory?: boolean;
}

export const ArtistCarousel = ({ data, slug, link, addToSearchHistory = false }: Props) => {
    return (
        <View className="flex flex-col gap-y-4 pt-10">
            {
                slug && (
                    <View className="flex flex-row justify-between items-center">
                        <Text className="text-white font-bold text-2xl block">
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
                    <Card data={item} key={index} addToSearchHistory={addToSearchHistory} />
                )}
            />
        </View>
    )
}
