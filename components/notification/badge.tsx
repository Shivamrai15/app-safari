import { useAuth } from '@/hooks/use-auth';
import { fetcher } from '@/lib/fetcher';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';

export const NotificationBadge = () => {

    const { user } = useAuth();

    const { data, isPending } = useQuery({
        queryFn: async () => {
            const data = await fetcher({
                prefix: "PROTECTED_BASE_URL",
                suffix: 'api/v2/notification/unread',
                token: user?.tokens.accessToken
            });
            return data.data as { notificationCount: number; }
        },
        queryKey: ['notification-count'],
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
    });

    const hasUnread = !isPending && data && data.notificationCount > 0;
    const displayCount = data?.notificationCount && data.notificationCount > 9 ? '9+' : data?.notificationCount;

    return (
        <TouchableOpacity
            className='size-12 relative p-3'
            onPress={() => router.push('/(tabs)/notification')}
            activeOpacity={0.7}
        >
            <Image
                source={require('@/assets/icons/bell.png')}
                style={{ width: 24, height: 24 }}
                contentFit='contain'
            />
            {hasUnread && (
                <View className='absolute -top-0.5 right-0 min-w-6 h-6 bg-red-500 rounded-full items-center justify-center px-1'>
                    <Text className='text-white text-xs font-bold'>{displayCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}