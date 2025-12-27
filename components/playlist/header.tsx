import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ShuffleButton } from '../song/shuffle-button';
import { PlayButton } from './play-button';
import { Button } from '../ui/button';
import { DownloadButton } from './download-button';
import { Options } from './options';
import { PlaylistResponse } from '@/types/response.types';


interface Props {
    data: PlaylistResponse
    onEditPress: () => void
}

export const Header = ({ data, onEditPress }: Props) => {
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
                                {data._count.songs} Songs
                            </Text>
                            <View className='flex flex-row items-center gap-3 pt-4'>
                                <PlayButton
                                    playlistId={data.id}
                                />
                                <Button
                                    className='h-12 rounded-full w-fit px-4'
                                    onPress={() => router.push({
                                        pathname: "/[playlistId]",
                                        params: {
                                            playlistId: data.id as string
                                        }
                                    })}
                                    variant='secondary'
                                >
                                    <Image
                                        source={require('@/assets/icons/add-circle.png')}
                                        style={{ width: 20, height: 20 }}
                                        contentFit='contain'
                                    />
                                    <Text className='font-semibold text-white'>
                                        Add
                                    </Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                    <View className="mt-10 w-full">
                        <View className="flex flex-row justify-start items-center w-full gap-4 pt-2">
                            <ShuffleButton
                                height={26}
                                width={26}
                            />
                            <DownloadButton
                                data={data}
                            />
                            <Options
                                data={data}
                                onEditPress={onEditPress}
                            />
                            <Button
                                className='h-10 rounded-full w-fit px-4'
                                variant='secondary'
                                onPress={onEditPress}
                            >
                                <Image
                                    source={require('@/assets/icons/pen-clip.png')}
                                    style={{ width: 14, height: 14 }}
                                    contentFit='contain'
                                />
                                <Text className='font-semibold text-white'>
                                    Edit
                                </Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    )
}