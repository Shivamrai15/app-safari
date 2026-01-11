import { LikeButton } from '@/components/liked/like-button';
import {
    AiShuffleActiveIcon,
    AiShuffleIcon,
    BackwardStepIcon,
    ForwardStepIcon,
    PauseCircleIcon,
    PlayCircleIcon,
    RepeatIcon,
    RepeatOneIcon,
    ShuffleIcon,
    SleepTimerIcon
} from '@/constants/icons';
import usePlayerSettings from '@/hooks/use-player-settings';
import { useQueue } from '@/hooks/use-queue';
import { albumDuration } from '@/lib/utils';
import { Album, Song } from '@/types/response.types';
import Entypo from '@expo/vector-icons/Entypo';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Slider } from '@miblanchard/react-native-slider';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lyrics } from './lyrics';
import { RelatedSongs } from './related';
import { MarqueeText } from '@/components/ui/marquee-text';
import { UpNext } from './up-next';
import { Ad } from '@/types/auth.types';
import { useSleepTimer, formatRemainingTime } from '@/hooks/use-sleep-timer';

interface Props {
    data: Song & { album: Album };
    isOpen: boolean;
    position: number;
    isPlaying: boolean;
    isSubscribed?: boolean;
    onClose: () => void;
    handlePlayPause: () => void;
    onSeek: (value: number) => void;
    isOffline: boolean;
    isAdvertisement?: boolean;
    advertisement?: Ad
}

export const Sheet = ({
    data,
    isOpen,
    position,
    isPlaying,
    isSubscribed,
    onSeek,
    onClose,
    handlePlayPause,
    isOffline,
    isAdvertisement = false,
    advertisement
}: Props) => {

    const insets = useSafeAreaInsets();
    const translateX = useRef(new Animated.Value(0)).current;
    const pagerRef = useRef<PagerView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ["100%"], []);
    const [featureNumber, setFeatureNumber] = useState(0);
    const [featuresOpened, setFeaturesOpened] = useState(false);
    const { pop, deQueue, shuffle } = useQueue();
    const { isLooped, isAiShuffled, setAiShuffled, setLooped } = usePlayerSettings();
    const { isActive: isSleepTimerActive, endOfTrack: sleepTimerEndOfTrack, remainingTime: sleepTimerRemainingTime } = useSleepTimer();

    useEffect(() => {
        if (isOpen) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isOpen]);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: (Dimensions.get('window').width / 3) * featureNumber,
            duration: 300,
            useNativeDriver: true,
        }).start();
        pagerRef.current?.setPage(featureNumber);
    }, [featureNumber]);

    return (
        <>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                onDismiss={onClose}
                backgroundStyle={{
                    backgroundColor: '#111111',
                    borderRadius: 0
                }}
                handleIndicatorStyle={{ display: 'none' }}
                handleComponent={null}
                enableDynamicSizing={false}
                topInset={insets.top}
                bottomInset={insets.bottom}
            >
                <BottomSheetView
                    style={{ flex: 1, borderRadius: 0 }}
                >
                    <LinearGradient
                        colors={[`${isAdvertisement && advertisement ? advertisement.color : data.album.color}5e`, "#111111"]}
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 24,
                            borderRadius: 0
                        }}
                    >
                        <View className='flex flex-col gap-y-4 flex-1'>
                            <View className='p-6 pb-3 flex-row items-center justify-between'>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={onClose}
                                >
                                    <Entypo name="chevron-down" size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onClose();
                                        setTimeout(() => router.push('/(tabs)/timer'), 300);
                                    }}
                                    className={`flex-row items-center gap-x-2 px-3 py-1.5 rounded-full ${isSleepTimerActive ? 'bg-red-500/20' : 'bg-neutral-800/50'}`}
                                >
                                    <Image
                                        source={SleepTimerIcon}
                                        style={{ width: 16, height: 16 }}
                                        tintColor={isSleepTimerActive ? '#ef4444' : '#a1a1aa'}
                                    />
                                    {isSleepTimerActive && (
                                        <Text className='text-red-400 text-xs font-medium'>
                                            {sleepTimerEndOfTrack ? 'End of Track' : formatRemainingTime(sleepTimerRemainingTime)}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View className='flex-1 flex flex-col items-center gap-y-6'>
                                <View className='px-6'>
                                    <View className='w-full aspect-square rounded-2xl overflow-hidden bg-neutral-800'>
                                        <Image
                                            source={{ uri: isAdvertisement && advertisement ? advertisement.image : data.image }}
                                            style={{ width: "100%", height: "100%" }}
                                            contentFit='cover'
                                        />
                                    </View>
                                </View>
                                <View className='flex flex-col gap-y-4 px-4 py-6'>
                                    <View className='flex flex-row items-center gap-x-4 px-4'>
                                        <MarqueeText
                                            text={isAdvertisement ? (advertisement?.name ?? '') : data.name}
                                            className='text-white text-2xl font-bold'
                                        />
                                        <View className='flex flex-row items-center gap-x-4 justify-center'>
                                            {
                                                !isOffline && !isAdvertisement && <LikeButton songId={data.id} label={false} />
                                            }
                                            {
                                                !isAdvertisement && (
                                                    <TouchableOpacity
                                                        className='h-7 aspect-square'
                                                        activeOpacity={0.7}
                                                        onPress={shuffle}
                                                    >
                                                        <Image
                                                            source={ShuffleIcon}
                                                            style={{ width: "100%", height: "100%" }}
                                                            contentFit='contain'
                                                        />
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                    </View>
                                    <View className='flex flex-col gap-y-2 px-4'>
                                        <Slider
                                            step={1}
                                            minimumValue={0}
                                            value={position}
                                            onValueChange={(value) => onSeek(value[0])}
                                            maximumValue={isAdvertisement && advertisement ? advertisement.duration : data.duration}
                                            minimumTrackTintColor="#ef4444"
                                            maximumTrackTintColor="#D3D3D3"
                                            thumbTintColor="transparent"
                                            disabled={!isSubscribed || isAdvertisement}
                                        />
                                        <View className='flex flex-row items-center justify-between'>
                                            <Text className='text-zinc-300 text-sm'>
                                                {albumDuration(Math.floor(position))}
                                            </Text>
                                            <Text className='text-zinc-300 text-sm'>
                                                {albumDuration(isAdvertisement ? (advertisement?.duration ?? 0) : data.duration)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className='flex flex-row items-center w-full px-4'>
                                        <View className='w-1/5 h-16 flex items-start justify-center'>
                                            {
                                                !isAdvertisement && (
                                                    <TouchableOpacity
                                                        className='h-7 aspect-square'
                                                        activeOpacity={0.7}
                                                        disabled={!isSubscribed || isAdvertisement}
                                                        onPress={() => setAiShuffled(!isAiShuffled)}
                                                    >
                                                        <Image
                                                            source={isAiShuffled ? AiShuffleActiveIcon : AiShuffleIcon}
                                                            style={{ width: "100%", height: "100%" }}
                                                            contentFit='contain'
                                                        />
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                        <View className='w-1/5 h-16 flex items-start justify-center'>
                                            <TouchableOpacity
                                                className='h-10 aspect-square'
                                                onPress={pop}
                                                activeOpacity={0.7}
                                                disabled={!isSubscribed || isAdvertisement}
                                            >
                                                <Image
                                                    source={BackwardStepIcon}
                                                    style={{ width: "100%", height: "100%" }}
                                                    contentFit='contain'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View className='w-1/5 h-16 flex items-center justify-center'>
                                            <TouchableOpacity
                                                className='h-full aspect-square'
                                                activeOpacity={0.7}
                                                onPress={handlePlayPause}
                                            >
                                                <Image
                                                    source={!isPlaying ? PlayCircleIcon : PauseCircleIcon}
                                                    style={{ width: "100%", height: "100%" }}
                                                    contentFit='contain'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View className='w-1/5 h-16 flex items-end justify-center'>
                                            <TouchableOpacity
                                                className='h-10 aspect-square'
                                                activeOpacity={0.7}
                                                onPress={deQueue}
                                                disabled={isAdvertisement}
                                            >
                                                <Image
                                                    source={ForwardStepIcon}
                                                    style={{ width: "100%", height: "100%" }}
                                                    contentFit='contain'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View className='w-1/5 h-16 flex items-end justify-center'>
                                            {
                                                !isAdvertisement && (
                                                    <TouchableOpacity
                                                        className='h-7 aspect-square'
                                                        activeOpacity={0.7}
                                                        onPress={() => setLooped(!isLooped)}
                                                    >
                                                        <Image
                                                            source={isLooped ? RepeatOneIcon : RepeatIcon}
                                                            style={{ width: "100%", height: "100%" }}
                                                            contentFit='contain'
                                                        />
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {
                            !isAdvertisement && (
                                <View className='p-6 flex flex-row items-center'>
                                    <View className='w-1/3 flex items-center justify-center'>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setFeatureNumber(0);
                                                setFeaturesOpened(!featuresOpened);
                                            }}
                                        >
                                            <Text className='text-zinc-300 font-semibold text-lg'>
                                                UP NEXT
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View className='w-1/3 flex items-center justify-center'>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setFeatureNumber(1);
                                                setFeaturesOpened(!featuresOpened);
                                            }}
                                        >
                                            <Text className='text-zinc-300 font-semibold text-lg'>
                                                LYRICS
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View className='w-1/3 flex items-center justify-center'>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setFeatureNumber(2);
                                                setFeaturesOpened(!featuresOpened);
                                            }}
                                        >
                                            <Text className='text-zinc-300 font-semibold text-lg'>
                                                RELATED
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )
                        }
                    </LinearGradient>
                </BottomSheetView>
            </BottomSheetModal>
            {
                featuresOpened && !isAdvertisement && (
                    <Modal
                        visible={featuresOpened}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setFeaturesOpened(false)}
                    >
                        <SafeAreaView className='flex-1 bg-background'>
                            <View
                                style={{
                                    backgroundColor: `${data.album.color}5e`,
                                }}
                            >
                                <View className='py-2 flex flex-row items-center relative'>
                                    <View className='h-12 w-1/3 flex items-center justify-center'>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setFeatureNumber(0);
                                            }}
                                            className='h-full w-full flex items-center justify-center'
                                        >
                                            <Text className='text-zinc-300 font-semibold text-lg'>
                                                UP NEXT
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View className='h-12 w-1/3 flex items-center justify-center'>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setFeatureNumber(1);
                                            }}
                                            className='h-full w-full flex items-center justify-center'
                                        >
                                            <Text className='text-zinc-300 font-semibold text-lg'>
                                                LYRICS
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View className='h-12 w-1/3 flex items-center justify-center'>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setFeatureNumber(2);
                                            }}
                                            className='h-full w-full flex items-center justify-center'
                                        >
                                            <Text className='text-zinc-300 font-semibold text-lg'>
                                                RELATED
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Animated.View
                                        className='absolute w-1/3 h-1 rounded-lg bg-white bottom-0'
                                        style={{
                                            transform: [{ translateX }],
                                        }}
                                    />
                                </View>
                            </View>
                            <PagerView
                                ref={pagerRef}
                                style={{
                                    flex: 1,
                                    backgroundColor: `${data.album.color}5e`,
                                }}
                                initialPage={featureNumber}
                                onPageSelected={e => setFeatureNumber(e.nativeEvent.position)}
                                scrollEnabled={featureNumber !== 0}
                            >
                                <View key="1" className='flex-1 p-6'>
                                    <UpNext />
                                </View>
                                <View key="2" className='flex-1'>
                                    <Lyrics
                                        songId={data.id}
                                        position={position}
                                        onSeek={onSeek}
                                    />
                                </View>
                                <View key="3" className='flex-1 p-6'>
                                    <RelatedSongs songId={data.id} />
                                </View>
                            </PagerView>
                        </SafeAreaView>
                    </Modal>
                )
            }
        </>
    );
}