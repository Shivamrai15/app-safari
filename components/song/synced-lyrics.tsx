import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from 'react-native';

interface Props {
    position: number;
    onSeek: (value: number) => void;
    lyrics : {
        time: number;
        text: string;
    }[];
}

export const SyncedLyrics = ({ position, onSeek, lyrics }: Props) => {
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const lyricsContainerRef = useRef<ScrollView | null>(null);
    const lineHeight = 70;

    useEffect(() => {
        if (lyrics.length > 0 && position >= 0) {
            const nextLineIndex = lyrics.findIndex(line => line.time > position) - 1;

            if (nextLineIndex !== currentLineIndex && nextLineIndex >= 0) {
                setCurrentLineIndex(nextLineIndex);

                if (lyricsContainerRef.current && containerHeight > 0) {

                    const linePosition = nextLineIndex * lineHeight;
                    const screenMiddle = containerHeight / 2;
                    
                    if (linePosition > screenMiddle) {
                        const scrollOffset = linePosition - screenMiddle + (lineHeight / 2);
                        
                        setTimeout(() => {
                            lyricsContainerRef.current?.scrollTo({
                                y: scrollOffset,
                                animated: true
                            });
                        }, 100);
                    } else {
                        setTimeout(() => {
                            lyricsContainerRef.current?.scrollTo({
                                y: 0,
                                animated: true
                            });
                        }, 100);
                    }
                }
            }
        }
    }, [lyrics, position, currentLineIndex, containerHeight]);

    return (
        <View 
            className="flex-1 p-6 relative"
            onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setContainerHeight(height);
            }}
        >
            <ScrollView
                ref={lyricsContainerRef}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={true}
                decelerationRate="normal"
                contentContainerStyle={{
                    paddingBottom: containerHeight / 2,
                }}
            >
                {lyrics.map((line, index) => (
                    <Pressable
                        key={index}
                        onPress={() => onSeek(line.time)}
                        style={{ 
                            paddingVertical: 16,
                            justifyContent: 'center'
                        }}
                    >
                        <Text
                            className={cn(
                                "text-2xl font-bold text-left leading-8",
                                index === currentLineIndex ? 'text-white opacity-100' : 'text-gray-200 opacity-60',
                            )}
                        >
                            {line.text === "" ? "♪" : line.text}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}