import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Text, ScrollView, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { useDownloads } from '@/hooks/use-downloads';
import { useSettings } from '@/hooks/use-settings';
import { OfflineItem } from '@/components/song/offline-item';
import { Spacer } from '@/components/ui/spacer';

interface CollectionCardProps {
    id: string;
    name: string;
    image: string | null;
    songCount: number;
    type: 'playlist' | 'album';
    isDownloading?: boolean;
    progress?: number;
}

const CollectionCard = ({ id, name, image, songCount, type, isDownloading, progress }: CollectionCardProps) => {
    const handlePress = () => {
        if (type === 'playlist') {
            router.push({
                pathname : "/(tabs)/downloads/playlist/[playlistId]",
                params : {
                    playlistId : id
                }
            });
        } else {
            router.push({
                pathname: "/(tabs)/downloads/album/[albumId]",
                params: {
                    albumId: id
                }
            });
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={{ width: '31%' }}
        >
            <View className="w-full">
                <View className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-800">
                    {image ? (
                        <Image
                            source={{ uri: image }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-zinc-800">
                            <Text className="text-zinc-500 text-4xl">🎵</Text>
                        </View>
                    )}
                    {isDownloading && (
                        <View className="absolute inset-0 bg-black/60 items-center justify-center">
                            <View className="w-12 h-12 rounded-full border-2 border-white/30 items-center justify-center">
                                <Text className="text-white text-xs font-bold">{progress}%</Text>
                            </View>
                        </View>
                    )}
                </View>
                <View className="mt-2">
                    <Text
                        className="text-zinc-100 font-bold text-sm"
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    <Text className="text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
                        {type === 'playlist' ? 'Playlist' : 'Album'} • {songCount} songs
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const Download = () => {

    const { songs, playlists, albums, clearSongs } = useDownloads();
    const { settings } = useSettings();

    if (settings ? !settings.subscription.isActive : true) {
        return (
            <Redirect href="/pricing" />
        )
    }

    const downloadedPlaylists = playlists.filter(p => p.download.isDownloaded || p.download.isDownloading);
    const downloadedAlbums = albums.filter(a => a.download.isDownloaded || a.download.isDownloading);
    const downloadedSongs = songs.filter(s => s.download.isDownloaded);

    const hasContent = downloadedPlaylists.length > 0 || downloadedAlbums.length > 0 || downloadedSongs.length > 0;

    return (
        <SafeAreaView className='bg-background flex-1 relative'>
            <ScrollView
                className='flex-1 p-6'
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <View className='flex flex-row justify-between items-center mb-8'>
                    <Text className='text-2xl font-bold text-white'>Downloads</Text>
                    {hasContent && (
                        <Button
                            variant='secondary'
                            className='rounded-full'
                            onPress={clearSongs}
                        >
                            <Text className='text-white font-semibold'>
                                Clear All
                            </Text>
                        </Button>
                    )}
                </View>

                {!hasContent && (
                    <View className="flex-1 items-center justify-center py-20">
                        <Text className="text-zinc-500 text-lg">No downloads yet</Text>
                        <Text className="text-zinc-600 text-sm mt-2">
                            Download playlists or albums to listen offline
                        </Text>
                    </View>
                )}

                {downloadedAlbums.length > 0 && (
                    <View className='mb-8'>
                        <Text className='text-lg font-semibold text-white mb-4'>Albums</Text>
                        <View className='flex flex-row flex-wrap gap-3'>
                            {downloadedAlbums.map(album => (
                                <CollectionCard
                                    key={album.id}
                                    id={album.id}
                                    name={album.name}
                                    image={album.image}
                                    songCount={album.songs?.length || 0}
                                    type="album"
                                    isDownloading={album.download.isDownloading}
                                    progress={album.download.downloadProgress}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {downloadedPlaylists.length > 0 && (
                    <View className='mb-8'>
                        <Text className='text-lg font-semibold text-white mb-4'>Playlists</Text>
                        <View className='flex flex-row flex-wrap gap-3'>
                            {downloadedPlaylists.map(playlist => (
                                <CollectionCard
                                    key={playlist.id}
                                    id={playlist.id}
                                    name={playlist.name}
                                    image={playlist.image}
                                    songCount={playlist.songs?.length || 0}
                                    type="playlist"
                                    isDownloading={playlist.download.isDownloading}
                                    progress={playlist.download.downloadProgress}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {downloadedSongs.length > 0 && (
                    <View className='mb-8'>
                        <Text className='text-lg font-semibold text-white mb-4'>Songs</Text>
                        <View className='flex flex-col gap-y-5'>
                            {downloadedSongs.map(song => (
                                <OfflineItem key={song.id} data={song} />
                            ))}
                        </View>
                    </View>
                )}
                <Spacer />
            </ScrollView>
        </SafeAreaView>
    )
}

export default Download;