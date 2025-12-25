import { useState } from 'react';
import { View, ScrollView, TextInput, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import axios from 'axios';
import { SearchList } from '@/components/playlist/search-list';
import { SearchIcon } from '@/constants/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { useAuth } from '@/hooks/use-auth';
import { PrimaryLoader } from '@/components/ui/loader';
import { Error } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { PROTECTED_BASE_URL } from '@/constants/api.config';

const PlaylistSearch = () => {

    const queryClient = useQueryClient();
    const { playlistId } = useLocalSearchParams();
    const [ query, setQuery ] = useState("");
    const { user } = useAuth();
    const [ selectedSongId, setSelectedSongId ] = useState<string[]>([]);

    const { data: existingSongIds, isPending, error } = useQuery({
        queryFn : async()=>{
            const data = await fetcher({
                prefix : "PROTECTED_BASE_URL",
                suffix : `api/v2/playlist/${playlistId}/existing-songs`,
                token : user?.tokens.accessToken
            });
            return data.data as string[];
        },
        queryKey : ['playlist-existing-songs', playlistId]
    })

    const toggleSelect = (id: string) => {
        if (selectedSongId.includes(id)) {
            setSelectedSongId(prev => prev.filter(item => item !== id));
        } else {
            setSelectedSongId(prev => [...prev, id]);
        }
    }

    const { mutate, isPending: isMutating } = useMutation({
        mutationFn : async()=>{
            await axios.post(
                `${PROTECTED_BASE_URL}/api/v2/playlist/songs`,
                {
                    playlistId : playlistId as string,
                    songIds : selectedSongId
                },
                {
                    headers : {
                        Authorization : `Bearer ${user?.tokens.accessToken}`,
                        'Content-Type' : 'application/json'
                    }
                }    
            )
        },
        onSuccess : async()=>{
            setSelectedSongId([]);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [`playlist-songs-${playlistId}`] }),
                queryClient.invalidateQueries({ queryKey: ['user-playlists'] }),
                queryClient.invalidateQueries({ queryKey: ['playlist-existing-songs', playlistId] }),
                queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })
            ]);
        },
        onError : ( error ) => {
            console.error("Error adding songs to playlist:", error);
        }
    });

    if (isPending) {
        return (
            <PrimaryLoader />
        )
    }

    if (error) {
        return <Error />;
    }

    return (
        <SafeAreaView className='flex-1 bg-background'>
            <LinearGradient
                colors={['#320707', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 0.3]}
                style={{ flex: 1 }}
            >
                <ScrollView
                    className='flex-1'
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className='p-6'>
                        <View className='flex flex-row items-center bg-neutral-800 rounded-full px-4 py-3'>
                            <Image
                                source={SearchIcon}
                                style={{ width: 26, height: 26 }}
                            />
                            <TextInput
                                placeholder="Search songs"
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
                    </View>
                    <View className='px-6'>
                        {
                            query && 
                            <>
                                <View className='flex flex-row items-center gap-x-4'>
                                    <Button
                                        className='rounded-full'
                                        disabled={selectedSongId.length === 0 || isMutating}
                                        onPress={mutate}
                                    >
                                        <Text className='font-bold'>
                                            Add {selectedSongId.length} {selectedSongId.length === 1 ? "song" : "songs"}
                                        </Text>
                                    </Button>
                                </View>
                                <SearchList
                                    query={query}
                                    toggleSelect={toggleSelect}
                                    existingSongIds={existingSongIds??[]}
                                    selectedSongId={selectedSongId}
                                />
                            </>
                        }
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    )
}

export default PlaylistSearch;