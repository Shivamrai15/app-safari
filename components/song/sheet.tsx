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
    ShuffleIcon
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
import { UpNext } from './up-next';

interface Props {
    data : Song & { album: Album };
    isOpen: boolean;
    position: number;
    isPlaying: boolean;
    isSubscribed?: boolean;
    onClose: () => void;
    handlePlayPause: () => void;
    onSeek: (value: number) => void;
    isOffline: boolean;
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
    isOffline
}: Props) => {

    const insets = useSafeAreaInsets();
    const translateX = useRef(new Animated.Value(0)).current;
    const pagerRef = useRef<PagerView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ["100%"], []);
    const [ featureNumber, setFeatureNumber ] = useState(0);
    const [ featuresOpened, setFeaturesOpened ] = useState(false);
    const { pop, deQueue, shuffle } = useQueue();
    const { isLooped, isAiShuffled, setAiShuffled, setLooped } = usePlayerSettings();

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
                }}
                handleIndicatorStyle={{ display: 'none' }}
                handleComponent={null}
                enableDynamicSizing={false}
                topInset={insets.top}
                bottomInset={insets.bottom}
            >
                <BottomSheetView
                    style={{ flex: 1 }}
                >
                    <LinearGradient
                        colors={[`${data.album.color}5e`, "#111111"]}
                        style={{
                            flex : 1,
                            display : "flex",
                            flexDirection : "column",
                            justifyContent : "space-between",
                            gap : 24
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
                            </View>
                            <View className='flex-1 flex flex-col items-center gap-y-6'>
                                <View className='px-6'>
                                    <View className='w-full aspect-square rounded-2xl overflow-hidden bg-neutral-800'>
                                        <Image
                                            source={{ uri: data.image }}
                                            style={{ width: "100%", height: "100%" }}
                                            contentFit='cover'
                                        />
                                    </View>
                                </View>
                                <View className='flex flex-col gap-y-4 px-4 py-6'>
                                    <View className='flex flex-row items-center gap-x-4 px-4'>
                                        <Text className='text-white text-2xl font-bold flex-1' numberOfLines={1} ellipsizeMode='tail'>
                                            {data.name}
                                        </Text>
                                        <View className='flex flex-row items-center gap-x-4 justify-center'>
                                            {
                                                !isOffline && <LikeButton songId={data.id} label={false} />
                                            }
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
                                        </View>
                                    </View>
                                    <View className='flex flex-col gap-y-2 px-4'>
                                        <Slider
                                            step={1}
                                            minimumValue={0}
                                            value={position}
                                            onValueChange={(value)=>onSeek(value[0])}
                                            maximumValue={data.duration}
                                            minimumTrackTintColor="#ef4444"
                                            maximumTrackTintColor="#D3D3D3"
                                            thumbTintColor="transparent"
                                            disabled={!isSubscribed}
                                        />
                                        <View className='flex flex-row items-center justify-between'>
                                            <Text className='text-zinc-300 text-sm'>
                                                {albumDuration(Math.floor(position))}
                                            </Text>
                                            <Text className='text-zinc-300 text-sm'>
                                                {albumDuration(data.duration)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className='flex flex-row items-center w-full px-4'>
                                        <View className='w-1/5 h-16 flex items-start justify-center'>
                                            <TouchableOpacity
                                                className='h-7 aspect-square'
                                                activeOpacity={0.7}
                                                disabled={!isSubscribed}
                                                onPress={() => setAiShuffled(!isAiShuffled)}
                                            >
                                                <Image
                                                    source={isAiShuffled ? AiShuffleActiveIcon : AiShuffleIcon}
                                                    style={{ width: "100%", height: "100%" }}
                                                    contentFit='contain'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View className='w-1/5 h-16 flex items-start justify-center'>
                                            <TouchableOpacity
                                                className='h-10 aspect-square'
                                                onPress={pop}
                                                activeOpacity={0.7}
                                                disabled={!isSubscribed}
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
                                            >
                                                <Image
                                                    source={ForwardStepIcon}
                                                    style={{ width: "100%", height: "100%" }}
                                                    contentFit='contain'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View className='w-1/5 h-16 flex items-end justify-center'>
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
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
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
                    </LinearGradient>
                </BottomSheetView>
            </BottomSheetModal>
            {
                featuresOpened && (
                    <Modal
                        visible={featuresOpened}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setFeaturesOpened(false)}
                    >
                        <SafeAreaView className='flex-1 bg-background'>
                            <View
                                style={{
                                    backgroundColor : `${data.album.color}5e`,
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
                                    flex : 1,
                                    backgroundColor : `${data.album.color}5e`,
                                }}
                                initialPage={featureNumber}
                                onPageSelected={e=>setFeatureNumber(e.nativeEvent.position)}
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