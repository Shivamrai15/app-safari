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
                        <View className='aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800/50 shadow-lg'>
                            <Image
                                source={{
                                    uri : genre.video?.image,
                                }}
                                style={{
                                    height : "100%",
                                    width : "100%",
                                }}
                                contentFit="cover"
                            />
                            <View className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
                            <View className='absolute bottom-0 left-0 right-0 p-4'>
                                <Text className='text-white font-bold text-base' numberOfLines={2}>
                                    {genre.name}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            }
        </View>
    )
}