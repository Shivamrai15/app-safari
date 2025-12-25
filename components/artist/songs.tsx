import { View } from 'react-native'
import { useInfinite } from '@/hooks/use-infinite';
import { PrimaryLoader, SecondaryLoader } from '@/components/ui/loader';
import { Fragment, useEffect } from 'react';
import { SongItem } from '../song/item';
import { SongResponse } from '@/types/response.types';
import { useAuth } from '@/hooks/use-auth';
import { PUBLIC_BASE_URL } from "@/constants/api.config";

interface Props {
    artistId : string;
    isAtEnd: boolean;
}

export const Songs = ({ artistId, isAtEnd }: Props) => {

    const { user } = useAuth();

    const { data, isFetchingNextPage, fetchNextPage, hasNextPage, status, error } = useInfinite({
        url : `${PUBLIC_BASE_URL}/api/v2/artist/${artistId}/songs`,
        paramKey: "",
        paramValue : "",
        queryKey: `artist-songs-${artistId}`,
        token : user?.tokens.accessToken
    });

    // Move useEffect before any conditional returns
    useEffect(()=>{
        if(isAtEnd && hasNextPage){
            fetchNextPage();
        }
    }, [isAtEnd, hasNextPage, fetchNextPage]);

    if (status === "pending") {
        return (
            <View className='mt-10 w-full h-10'>
                <PrimaryLoader />
            </View>
        )
    }

    if (error) {
        console.log(error.message);
        return null;
    }

    return (
        <View className='mt-4 w-full flex flex-col gap-y-4'>
            {
                data?.pages.map((group, i)=>(
                        <Fragment key={i} >
                            {
                                group.items.map((song: SongResponse) => (
                                    <SongItem key={song.id} data={song} />
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
