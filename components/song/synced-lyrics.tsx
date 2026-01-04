import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from 'react-native';

interface Props {
    position: number;
    onSeek: (value: number) => void;
    lyrics: {
        time: number;
        text: string;
    }[];
}

export const SyncedLyrics = ({ position, onSeek, lyrics }: Props) => {

    const { settings } = useSettings();
    const lyricsContainerRef = useRef<ScrollView | null>(null);
    const [lineHeights, setLineHeights] = useState<number[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    const isActive = settings ? settings.subscription.isActive : false

    const handleLineLayout = useCallback((index: number, height: number) => {
        setLineHeights(prev => {
            const newHeights = [...prev];
            newHeights[index] = height;
            return newHeights;
        });
    }, []);

    const getLineOffset = useCallback((lineIndex: number) => {
        let offset = 0;
        for (let i = 0; i < lineIndex; i++) {
            offset += lineHeights[i] || 0;
        }
        return offset;
    }, [lineHeights]);

    const getLineHeight = useCallback((lineIndex: number) => {
        return lineHeights[lineIndex] || 0;
    }, [lineHeights]);

    useEffect(() => {
        if (lyrics.length > 0 && position >= 0) {
            const nextLineIndex = lyrics.findIndex(line => line.time > position) - 1;

            if (nextLineIndex !== currentLineIndex && nextLineIndex >= 0) {
                setCurrentLineIndex(nextLineIndex);

                if (lyricsContainerRef.current && containerHeight > 0 && lineHeights.length > 0) {
                    const linePosition = getLineOffset(nextLineIndex);
                    const currentLineHeight = getLineHeight(nextLineIndex);
                    const screenMiddle = containerHeight / 2;

                    const scrollOffset = linePosition - screenMiddle + (currentLineHeight / 2);

                    setTimeout(() => {
                        lyricsContainerRef.current?.scrollTo({
                            y: Math.max(0, scrollOffset),
                            animated: true
                        });
                    }, 100);
                }
            }
        }
    }, [lyrics, position, currentLineIndex, containerHeight, lineHeights, getLineOffset, getLineHeight]);

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
                        onLayout={(event) => {
                            const { height } = event.nativeEvent.layout;
                            handleLineLayout(index, height);
                        }}
                        style={{
                            paddingVertical: 10,
                            justifyContent: 'center'
                        }}
                        disabled={!isActive}
                    >
                        <Text
                            className={cn(
                                "text-xl font-bold text-left leading-8",
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