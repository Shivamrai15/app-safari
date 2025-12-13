import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NetworkProvider } from '@/providers/network.provider';
import { Genre } from '@/components/browse/genre';
import { Moods } from '@/components/browse/moods';
import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type tab = "genre" | "mood";

const Browse = () => {

    const [ activeTab, setActiveTab ] = useState<tab>("genre");
    const [atEnd, setAtEnd] = useState(false);
    
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // buffer of 20px
        setAtEnd(isEnd);
    };

    return (
        <NetworkProvider>
            <SafeAreaView className="bg-background flex-1">
                <ScrollView
                    className='flex-1'
                    stickyHeaderIndices={[1]}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className="px-6 pt-8 pb-4">
                        <Text className="text-white text-4xl font-extrabold">Browse</Text>
                        <Text className="text-zinc-400 text-sm mt-2">Discover music by genre and mood</Text>
                    </View>
                    <View className='flex flex-row items-center gap-x-3 px-6 py-4 bg-background/95 backdrop-blur-lg'>
                        <Button 
                            variant={activeTab === "genre" ? "primary" : "secondary"}
                            className="rounded-full px-6 h-11"
                            onPress={()=>setActiveTab("genre")}
                        >
                            <Text
                                className={cn(
                                    "font-bold text-sm",
                                    activeTab === "genre" ? "text-zinc-900" : "text-zinc-300"
                                )}
                            >
                                Genres
                            </Text>
                        </Button>
                        <Button
                            variant={activeTab === "mood" ? "primary" : "secondary"}
                            className="rounded-full px-6 h-11"
                            onPress={()=>setActiveTab("mood")}
                        >
                            <Text
                                className={cn(
                                    "font-bold text-sm",
                                    activeTab === "mood" ? "text-zinc-900" : "text-zinc-300"
                                )}
                            >
                                Moods
                            </Text>
                        </Button>
                    </View>
                    <View className='mt-6 px-6'>
                        {
                            activeTab === "genre" ? (
                                <Genre />
                            ) : (
                                <Moods isAtEnd={atEnd} />
                            )
                        }
                    </View>
                    <View className='h-24' />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    );
}

export default Browse;