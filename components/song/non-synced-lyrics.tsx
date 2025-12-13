import { ScrollView, Text, View } from "react-native";

interface Props {
    lyrics: string[];
}

export const UnsyncedLyrics = ({ lyrics }: Props) => {
    return (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
            <View className="p-6 flex flex-col gap-y-2">
                {
                    lyrics.map((line, index) => (
                        <Text
                            key={index}
                            className="text-2xl font-bold text-left leading-8 text-zinc-200"
                        >
                            {line}
                        </Text>
                    ))
                }
            </View>
        </ScrollView>
    )
}
