import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ShuffleButton } from '../song/shuffle-button';
import { PlayButton } from './play-button';
import { Button } from '../ui/button';
import { DownloadButton } from './download-button';
import { Options } from './options';


interface Props {
    name: string;
    image?: string;
    songCount: number;
    id : string;
    color?: string;
    isPrivate: boolean;
}

export const Header = ({ name, image, songCount, id, color="#242424", isPrivate }: Props) => {
    return (
        <LinearGradient
            colors={[`${color}5e`, '#111111']}
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
                                source={image ? { uri: image } : require("@/assets/images/playlist.png")}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit : "cover"
                                }}
                            />
                        </View>
                        <View className="flex flex-col gap-y-2 flex-1">
                            <Text className="text-white text-4xl font-extrabold line-clamp-1 py-1 overflow-hidden">
                                {name}
                            </Text>
                            <Text className="text-white font-semibold">
                                {songCount} Songs
                            </Text>
                            <View className='flex flex-row items-center gap-3 pt-4'>
                                <PlayButton
                                    playlistId={id}
                                />
                                <Button
                                    className='h-12 rounded-full w-fit px-4'
                                    onPress={() => router.push({
                                        pathname : "/[playlistId]",
                                        params : {
                                            playlistId : id as string
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
                                playlistId={id}
                            />
                            <Options
                                playlistId={id}
                                image={image}
                                name={name}
                                isPrivate={isPrivate}
                            />
                            <Button
                                className='h-10 rounded-full w-fit px-4'
                                variant='secondary'
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