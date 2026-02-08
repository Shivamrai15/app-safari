import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Error } from '@/components/ui/error';
import { useAuth } from '@/hooks/use-auth';
import { fetcher } from '@/lib/fetcher';
import { PrimaryLoader } from '@/components/ui/loader';
import { GenreResponse } from '@/types/response.types';
import { Image } from 'expo-image';
import { router } from 'expo-router';

export const Genre = () => {

    const { user } = useAuth();
    
    const { data, error, isPending } = useQuery({
        queryFn : async()=>{
            const data = await fetcher({
                prefix : "PUBLIC_BASE_URL",
                suffix : "api/v2/genre",
                token : user?.tokens.accessToken
            });
            return data.data as GenreResponse[] | undefined;
        },
        queryKey : ["genre"]
    });

    if (isPending) {
        return <PrimaryLoader />;
    }
    
    if (error || !data) {
        return <Error />
    }

    return (
        <View className='w-full flex flex-row justify-between gap-y-6 flex-wrap'>
            {
                data.map((genre)=>(
                    <TouchableOpacity
                        key={genre.id}
                        className='w-[48%] flex flex-col'
                        activeOpacity={0.8}
                        onPress={()=>router.push({
                            pathname : "/genre-songs/[genreId]",
                            params : { genreId : genre.id }
                        })}
                    >
                        <View
                            className='w-full p-4 rounded-lg relative flex flex-row items-center overflow-hidden'
                            style={{
                                backgroundColor : genre.color
                            }}
                        >
                            <View className='w-2/3 aspect-video pr-2'>
                                <Text className='text-white text-xl font-bold'>
                                    {genre.name}
                                </Text>
                            </View>
                            <View className='w-1/2 aspect-square rounded-md overflow-hidden absolute -right-2 -bottom-2'>
                                <Image
                                    source={{ uri : genre.image }}
                                    style={{ width : "100%", height : "100%" }}
                                    contentFit='cover'
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            }
        </View>
    )
}