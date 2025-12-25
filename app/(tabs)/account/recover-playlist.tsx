import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { useAuth } from '@/hooks/use-auth';

const Page = () => {

    // const { user } = useAuth();

    // const { data, isLoading, error } = useQuery({
    //     queryKey : ['recover-playlists'],
    //     queryFn : async () => {
    //         const data = await fetcher({
    //             prefix : "PROTECTED_BASE_URL",
    //             suffix : "",
    //             token : user?.tokens.accessToken
    //         });
    //         return data;
    //     }
    // });

    return (
        <SafeAreaView className='flex-1 bg-background'>
            <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 40 }}>
                <View className='px-4 pt-6'>
                    <Text className="text-white text-3xl font-bold tracking-tight">
                        Recover Playlists
                    </Text>
                    <Text className="text-zinc-400 text-sm mt-2">
                        Here you can recover your deleted playlists
                    </Text>
                </View>
                <View className='mt-6 px-4'>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Page;