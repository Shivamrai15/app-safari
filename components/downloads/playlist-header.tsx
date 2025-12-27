import { Image } from 'expo-image';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DownloadedPlaylist } from '@/hooks/use-downloads';
import { ShuffleButton } from '../song/shuffle-button';
import { DeleteButton } from './delete-button';


interface Props {
    data: DownloadedPlaylist
}

export const Header = ({ data }: Props) => {
    return (
        <LinearGradient
            colors={[`${data.color || "#242424"}5e`, '#111111']}
            locations={[0, 0.6]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
                width: '100%',
            }}
        >
            <View className="p-6">
                <View className="flex flex-col items-center">
                    <View className='flex flex-row items-center gap-x-6'>
                        <View className="relative shrink-0 aspect-square h-40 w-40 overflow-hidden rounded-lg">
                            <Image
                                source={data.image ? { uri: data.image } : require("@/assets/images/playlist.png")}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: "cover"
                                }}
                            />
                        </View>
                        <View className="flex flex-col gap-y-2 flex-1">
                            <Text className="text-white text-4xl font-extrabold line-clamp-1 py-1 overflow-hidden">
                                {data.name}
                            </Text>
                            <Text className="text-white font-semibold">
                                {data.songs.length} Songs
                            </Text>
                            <View className='flex flex-row items-center gap-3 pt-4'>
                                
                            </View>
                        </View>
                    </View>
                    <View className="mt-10 w-full">
                        <View className="flex flex-row justify-start items-center w-full gap-4 pt-2">
                            <ShuffleButton
                                height={26}
                                width={26}
                            />
                            <DeleteButton
                                id={data.id}
                                size={26}
                                type='playlist'
                            />
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    )
}