import { View, Text, Modal, Dimensions } from 'react-native'
import { PrimaryLoader } from '@/components/ui/loader';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

interface Props {
    isVisible: boolean
}

export const SyncingModal = ({ isVisible }: Props) => {
    const { width, height } = Dimensions.get('window');

    const cols = 12;
    const rows = 18;
    const iconSize = 16;
    const gap = 30;

    const icons: (keyof typeof Ionicons.glyphMap)[] = [
        'musical-note', 'musical-notes', 'headset', 'disc',
        'mic', 'radio', 'albums', 'play-circle', 'volume-high'
    ];

    return (
        <Modal
            visible={isVisible}
            animationType='fade'
            transparent={true}
        >
            <View className='flex-1 bg-background relative overflow-hidden'>
                <View
                    style={{
                        position: 'absolute',
                        top: -50,
                        left: -50,
                        width: width + 100,
                        height: height + 100,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0.15,
                    }}
                >
                    {Array.from({ length: cols * rows }).map((_, i) => (
                        <View key={i} style={{ width: gap + iconSize, height: gap + iconSize, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons
                                name={icons[i % icons.length]}
                                size={iconSize}
                                color="#b5b5b5"
                            />
                        </View>
                    ))}
                </View>

                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Svg height="100%" width="100%">
                        <Defs>
                            <RadialGradient
                                id="grad"
                                cx="50%"
                                cy="50%"
                                rx="55%"
                                ry="55%"
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop offset="0" stopColor="#111111" stopOpacity="0" />
                                <Stop offset="0.5" stopColor="#111111" stopOpacity="0.4" />
                                <Stop offset="1" stopColor="#111111" stopOpacity="1" />
                            </RadialGradient>
                        </Defs>
                        <Rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="url(#grad)"
                        />
                    </Svg>
                </View>

                <View className='flex-1 justify-center items-center z-10'>
                    <PrimaryLoader className='flex-none bg-transparent' />
                    <Text className='text-white text-lg font-medium mt-8 tracking-wide'>
                        Syncing your data...
                    </Text>
                </View>
            </View>
        </Modal>
    )
}