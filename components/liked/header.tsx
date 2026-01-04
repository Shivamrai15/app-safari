import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayButton } from '../album/play-button';
import { ShuffleButton } from '../song/shuffle-button';
import { SongResponse } from '@/types/response.types';


interface Props {
    totalSongs: number;
    songs : SongResponse[];
}

export const Header = ({ totalSongs, songs }: Props) => {
    return (
         <LinearGradient
            colors={['#87141b', '#111111']}
            locations={[0.4, 0.3]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
                width: '100%',
            }}  
        >
            <View className="p-10">
                <View className="flex flex-col items-center">
                    <View className="relative shrink-0 aspect-square h-44 w-44 overflow-hidden rounded-lg">
                        <Image
                            source={require("@/assets/images/liked-thumb.png")}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit : "cover"
                            }}
                        />
                    </View>
                    <View className="flex flex-col gap-y-2 mt-4 text-center">
                        <Text className="text-white text-center text-4xl font-extrabold line-clamp-1 py-1 overflow-hidden">
                            Liked Songs
                        </Text>
                        <Text className='text-zinc-300 font-medium text-center'>
                            {totalSongs} { totalSongs === 1 ? 'Song' : 'Songs' }
                        </Text>
                        <View className="flex flex-row justify-center items-center gap-4 pt-2">
                            <PlayButton songs={songs} />
                            <ShuffleButton />
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    )
}
