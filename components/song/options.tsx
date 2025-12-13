import { View, Text } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOptions } from '@/hooks/use-options';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/button';
import { DiscIcon, DownloadIcon, HotsPot, MicIcon, MusicQueueIcon, PlaylistRecoverIcon, PlusIcon } from '@/constants/icons';
import { useQueue } from '@/hooks/use-queue';
import { router } from 'expo-router';
import { useSettings } from '@/hooks/use-settings';
import { DownloadManager } from '@/services/download';
import { useDownloads } from '@/hooks/use-downloads';

export const Options = () => {

    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['70%'], ['100%']);
    const { data, closeOptions } = useOptions();
    const { enQueue, priorityEnqueue } = useQueue();
    const { settings } = useSettings();
    const { getSongById } = useDownloads();
    
    // Download state
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    
    const downloadManager = DownloadManager.getInstance();
    
    // Check if song is already downloaded or downloading
    const downloadedSong = data ? getSongById(data.id) : null;
    const isAlreadyDownloaded = downloadedSong?.download.isDownloaded || false;
    const isCurrentlyDownloading = downloadedSong?.download.isDownloading || false;

    useEffect(()=>{
        if (data && sheetRef.current) {
            sheetRef.current.expand();
        }
    }, [data]);

    const handleDownload = async () => {
        if (!data || !settings?.subscription.isActive) return;
        
        setIsDownloading(true);
        try {
            await downloadManager.downloadSong(data, (progress) => {
                setDownloadProgress(progress.progress);
                console.log(`Download progress: ${progress.progress}%`);
            });
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const handleCancelDownload = () => {
        if (data) {
            downloadManager.cancelDownload(data.id);
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const getDownloadButtonContent = () => {
        if (isAlreadyDownloaded) {
            return {
                text: "Downloaded",
                disabled: true
            };
        }
        
        if (isCurrentlyDownloading || isDownloading) {
            const progress = downloadedSong?.download.downloadProgress || downloadProgress;
            return {
                text: `Downloading... ${Math.round(progress)}%`,
                disabled: false,
                onPress: handleCancelDownload
            };
        }
        
        return {
            text: "Download",
            disabled: false,
            onPress: handleDownload
        };
    };

    const downloadButtonContent = getDownloadButtonContent();

    return (
        <View
            className='absolute inset-0'
        >
            <BottomSheet 
                ref={sheetRef} 
                index={-1}
                onClose={()=>closeOptions()}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                style={{ zIndex: 999 }}
                backgroundStyle={{ 
                    backgroundColor: '#191919',
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                }}
                handleIndicatorStyle={{ backgroundColor: '#666' }}
            >
                <BottomSheetView
                    style={{
                        flex: 1,
                        paddingBottom: insets.bottom,
                    }}
                >
                    <ScrollView
                        className='flex-1 h-full'
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        <View className='flex flex-row items-center px-4 gap-x-6'>
                            <View className='size-16 rounded-xl overflow-hidden'>
                                <Image
                                    source={{ uri: data?.image || "" }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit='cover'
                                />
                            </View>
                            <View className='flex flex-col gap-y-0 flex-1'>
                                <Text className='text-white text-lg font-extrabold line-clamp-1'>{data?.name}</Text>
                                <Text numberOfLines={1} ellipsizeMode='tail' className='text-neutral-400 font-semibold'>{data?.artists.map(artist => artist.name).join(', ')}</Text>
                            </View>
                        </View>
                        <View className='h-[1px] bg-zinc-600 w-full mt-4' />
                        <View className='flex flex-col mt-4'>
                            <Button
                                variant='ghost'
                                className='justify-start gap-x-6'
                                onPress={()=>{
                                    if (data) {
                                        enQueue([data]);
                                    }
                                    closeOptions();
                                    sheetRef.current?.close();
                                    
                                }}
                            >   
                                <Image
                                    source={MusicQueueIcon}
                                    style={{ width: 22, height: 22 }}
                                />
                                <Text className='text-zinc-100 text-lg'>Add to queue</Text>
                            </Button>
                            <Button
                                variant='ghost'
                                className='justify-start gap-x-6'
                                onPress={()=>{
                                    if (data) {
                                        priorityEnqueue([data]);
                                    }
                                    closeOptions();
                                    sheetRef.current?.close();
                                    
                                }}
                            >   
                                <Image
                                    source={PlaylistRecoverIcon}
                                    style={{ width: 24, height: 24 }}
                                />
                                <Text className='text-zinc-100 text-lg'>Play next</Text>
                            </Button>
                            <Button
                                variant='ghost'
                                className='justify-start gap-x-6'
                                onPress={downloadButtonContent.onPress || handleDownload}
                                disabled={downloadButtonContent.disabled || (settings ? !settings.subscription.isActive : true)}
                            >   
                                <Image
                                    source={DownloadIcon}
                                    style={{ 
                                        width: 24, 
                                        height: 24,
                                        opacity: downloadButtonContent.disabled ? 0.5 : 1 
                                    }}
                                />
                                <Text className={`text-lg ${downloadButtonContent.disabled ? 'text-zinc-500' : 'text-zinc-100'}`}>
                                    {downloadButtonContent.text}
                                </Text>
                            </Button>
                            <Button
                                variant='ghost'
                                className='justify-start gap-x-6'
                                onPress={()=>{}}
                            >   
                                <Image
                                    source={PlusIcon}
                                    style={{ width: 24, height: 24 }}
                                />
                                <Text className='text-zinc-100 text-lg'>Add to playlist</Text>
                            </Button>
                            <Button
                                variant='ghost'
                                className='justify-start gap-x-6'
                                onPress={()=>{}}
                            >   
                                <Image
                                    source={HotsPot}
                                    style={{ width: 24, height: 24 }}
                                />
                                <Text className='text-zinc-100 text-lg'>Go to song radio</Text>
                            </Button>
                            <Button
                                variant='ghost'
                                className='justify-start gap-x-6'
                                onPress={()=>{
                                    closeOptions();
                                    sheetRef.current?.close();
                                    router.push({
                                        pathname : "/(tabs)/album/[albumId]",
                                        params : {
                                            albumId: data?.album.id || ""
                                        }
                                    });
                                }}
                            >   
                                <Image
                                    source={DiscIcon}
                                    style={{ width: 24, height: 24 }}
                                />
                                <Text className='text-zinc-100 text-lg'>Go to album</Text>
                            </Button>
                        </View>
                        <View className='h-[1px] bg-zinc-600 w-full mt-4' />
                        <View className='flex flex-col mt-4'>
                            {
                                data?.artists.map((artist)=>(
                                    <Button
                                        key={artist.id}
                                        variant='ghost'
                                        className='justify-start gap-x-6'
                                        onPress={()=>{
                                            closeOptions();
                                            sheetRef.current?.close();
                                            router.push({
                                                pathname : "/(tabs)/artist/[artistId]",
                                                params : {
                                                    artistId: artist.id
                                                }
                                            });
                                        }}
                                    >   
                                        <Image
                                            source={MicIcon}
                                            style={{ width: 24, height: 24 }}
                                        />
                                        <Text className='text-zinc-100 text-lg'>{artist.name}</Text>
                                    </Button>
                                ))
                            }
                        </View>
                    </ScrollView>
                </BottomSheetView>
            </BottomSheet>
        </View>
    )
}