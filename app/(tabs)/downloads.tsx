import { Redirect } from 'expo-router';
import { Text, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { useDownloads } from '@/hooks/use-downloads';
import { useSettings } from '@/hooks/use-settings';
import { OfflineItem } from '@/components/song/offline-item';
import { NetworkProvider } from '@/providers/network.provider';


const Download = () => {

    const { songs, clearSongs } = useDownloads();
    const { settings } = useSettings();

    if (settings ? !settings.subscription.isActive : true) {
        return (
            <Redirect  href="/pricing" />
        )
    }

    return (
        <NetworkProvider>
            <SafeAreaView className='bg-background flex-1 relative'>
                <ScrollView
                    className='flex-1 p-6'
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className='flex flex-row justify-between items-center mb-8'>
                        <Text className='text-2xl font-bold text-white'>Downloads</Text>
                        <Button
                            variant='secondary'
                            className='rounded-full'
                            onPress={clearSongs}
                        >
                            <Text className='text-white font-semibold'>
                                Clear Downloads
                            </Text>
                        </Button>
                    </View>
                    <View className='flex flex-col gap-y-5'>
                        {songs.map(song => (
                            song.download.isDownloaded ? (
                                <OfflineItem key={song.id} data={song} />
                            ) : (
                                <View className="w-full p-4" key={song.id}>
                                    <Text className="text-white font-semibold" >{song.name} Downloading {song.download.downloadProgress}%</Text>
                                </View>
                            )
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default Download;