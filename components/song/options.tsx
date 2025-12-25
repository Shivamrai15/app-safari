import { View, Text } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/button';
import { DiscIcon, DownloadIcon, HotsPot, MicIcon, MusicQueueIcon, PlaylistRecoverIcon, PlusIcon } from '@/constants/icons';
import { useQueue } from '@/hooks/use-queue';
import { router } from 'expo-router';
import { useSettings } from '@/hooks/use-settings';
import { DownloadManager } from '@/services/download';
import { useDownloads } from '@/hooks/use-downloads';
import { SongResponse } from '@/types/response.types';
import { DeleteSongButton } from '../playlist/delete-song-button';


interface Props {
    data: SongResponse,
    playlistId?: string,
    open: boolean,
    onClose: () => void
}

export const Options = ({ data, playlistId, open, onClose }: Props) => {

    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [], []);
    const { enQueue, priorityEnqueue } = useQueue();
    const { settings } = useSettings();
    const { getSongById } = useDownloads();

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const downloadManager = DownloadManager.getInstance();

    const downloadedSong = data ? getSongById(data.id) : null;
    const isAlreadyDownloaded = downloadedSong?.download.isDownloaded || false;
    const isCurrentlyDownloading = downloadedSong?.download.isDownloading || false;

    useEffect(() => {
        if (open && sheetRef.current) {
            sheetRef.current.present();
        } else if (!open && sheetRef.current) {
            onClose();
            sheetRef.current.dismiss();
        }
    }, [open]);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onClose();
        }
    }, [onClose]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    const handleDismiss = useCallback(() => {
        onClose();
        sheetRef.current?.dismiss();
    }, [onClose]);

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
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
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
                <BottomSheetScrollView
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
                            onPress={() => {
                                if (data) {
                                    enQueue([data]);
                                }
                                handleDismiss();
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
                            onPress={() => {
                                if (data) {
                                    priorityEnqueue([data]);
                                }
                                handleDismiss();
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
                            className='justify-between gap-x-6'
                            onPress={downloadButtonContent.onPress || handleDownload}
                            disabled={downloadButtonContent.disabled || (settings ? !settings.subscription.isActive : true)}
                        >
                            <View className='flex flex-row items-center gap-x-6'>
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
                            </View>
                            {
                                !settings?.subscription.isActive && (
                                    <Text className='text-red-500 font-semibold'>
                                        Premium Only
                                    </Text>
                                )
                            }
                        </Button>
                        {
                            playlistId && (
                                <DeleteSongButton
                                    playlistId={playlistId}
                                    songId={data?.id}
                                />
                            )
                        }
                        <Button
                            variant='ghost'
                            className='justify-start gap-x-6'
                            onPress={() => { }}
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
                            onPress={() => { }}
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
                            onPress={() => {
                                handleDismiss();
                                router.push({
                                    pathname: "/(tabs)/album/[albumId]",
                                    params: {
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
                    <View className='flex flex-col mt-4 pb-12'>
                        {
                            data?.artists.map((artist) => (
                                <Button
                                    key={artist.id}
                                    variant='ghost'
                                    className='justify-start gap-x-6'
                                    onPress={() => {
                                        handleDismiss();
                                        router.push({
                                            pathname: "/(tabs)/artist/[artistId]",
                                            params: {
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
                </BottomSheetScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    )
}