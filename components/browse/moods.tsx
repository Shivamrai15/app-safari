import { router } from 'expo-router';
import { Fragment, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Error } from '@/components/ui/error';
import { PrimaryLoader, SecondaryLoader } from '@/components/ui/loader';
import { PUBLIC_BASE_URL } from '@/constants/api.config';
import { useAuth } from '@/hooks/use-auth';
import { useInfinite } from '@/hooks/use-infinite';
import { Mood } from '@/types/response.types';
import { Image } from 'expo-image';


interface Props {
    isAtEnd : boolean;
}

export const Moods = ({ isAtEnd }: Props) => {

    const { user } = useAuth();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfinite({
        url : `${PUBLIC_BASE_URL}/api/v2/mood`,
        paramKey : "",
        paramValue : "",
        queryKey : "moods",
        token : user?.tokens.accessToken
    });

    useEffect(()=>{
        if(isAtEnd && hasNextPage){
            fetchNextPage();
        }
    }, [isAtEnd, hasNextPage, fetchNextPage]);


    if (status === "pending") {
        return  (
            <PrimaryLoader />
        )
    }

    if (status === "error") {
        return <Error />;
    }

    return (
        <View className='w-full flex flex-row justify-between gap-y-4 flex-wrap'>
            {
                data?.pages.map((group, i)=>(
                    <Fragment key={i} >
                        {
                            group.items.map((mood: Mood) => (
                                <TouchableOpacity
                                    className='w-[48%] flex flex-col'
                                    key={mood.id}
                                    activeOpacity={0.7}
                                    onPress={()=>router.push({
                                        pathname : "/mood-songs/[moodId]",
                                        params : { moodId : mood.id }
                                    })}
                                >
                                    <View
                                        className='w-full p-4 rounded-lg relative flex flex-row items-center overflow-hidden'
                                        style={{
                                            backgroundColor : mood.color
                                        }}
                                    >
                                        <View className='w-2/3 aspect-video pr-2'>
                                            <Text className='text-white text-xl font-bold'>
                                                {mood.name}
                                            </Text>
                                        </View>
                                        <View className='w-1/2 aspect-square rounded-md overflow-hidden absolute -right-2 -bottom-2'>
                                            <Image
                                                source={{ uri : mood.image }}
                                                style={{ width : "100%", height : "100%" }}
                                                contentFit='cover'
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </Fragment>
                ))

            }
            {
                isFetchingNextPage && (<View className='w-full h-6'>
                    <SecondaryLoader />
                </View>)
            }
        </View>
    )
}