import { Image } from 'expo-image';
import { 
    View,
    Text,
    FlatList,
    Platform,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchIcon } from '@/constants/icons';
import { Tab } from '@/types/response.types';
import { AllTab } from '@/components/search/all-tab';
import { AlbumTab } from '@/components/search/album-tab';
import { ArtistTab } from '@/components/search/artist-tab';
import { SongTab } from '@/components/search/song-tab';
import { NetworkProvider } from '@/providers/network.provider';



const Search = () => {

    const [ query, setQuery ] = useState("");
    const [currentTab, setCurrentTab] = useState<Tab>("DEFAULT");

    const tabs: Record<Tab, string> = {
        DEFAULT: "All",
        ALBUM: "Albums",
        SONG: "Songs",
        ARTIST: "Artists"
    };

    return (
        <NetworkProvider>
            <SafeAreaView className="bg-background flex-1">
                <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <ScrollView
                        className='flex-1 px-4'
                        keyboardShouldPersistTaps='handled'
                        stickyHeaderIndices={[0]}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        <View className='flex flex-col gap-y-4 bg-background pt-4'>
                            <View className='flex flex-row items-center bg-neutral-800 rounded-full px-4 py-3'>
                                <Image
                                    source={SearchIcon}
                                    style={{ width: 26, height: 26 }}
                                />
                                <TextInput
                                    placeholder="Search songs, albums and artists"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={query}
                                    onChangeText={(text) => setQuery(text)}
                                    keyboardType="default"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderRadius: 6,
                                        borderWidth: 0,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        height: 40,
                                        color: '#f4f4f5',
                                        fontWeight: '500',
                                        flex: 1
                                    }}
                                />
                            </View>
                            <View className='w-full py-6'>
                                <FlatList
                                    data={Object.entries(tabs)}
                                    keyExtractor={([key]) => key}
                                    renderItem={({ item: [key, label] }) => (
                                        <Button
                                            variant={currentTab === key ? "primary" : "secondary"}
                                            onPress={() => setCurrentTab(key as Tab)}
                                            className='rounded-full px-4 h-10'
                                        >
                                            <Text className={cn(
                                                "font-medium",
                                                currentTab === key ? "text-zinc-900" : "text-zinc-200"
                                            )}>
                                                {label}
                                            </Text>
                                        </Button>
                                    )}
                                    horizontal
                                    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                        </View>
                        {
                            currentTab === "DEFAULT" && query && <AllTab currentTab={currentTab} query={query} />
                        }
                        {
                            currentTab === "ALBUM" && query && <AlbumTab currentTab={currentTab} query={query} />
                        }
                        {
                            currentTab === "ARTIST" && query && <ArtistTab currentTab={currentTab} query={query} />
                        }
                        {
                            currentTab === "SONG" && query && <SongTab currentTab={currentTab} query={query} />
                        }
                        <View className='h-28'/>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </NetworkProvider>
    );
}

export default Search;