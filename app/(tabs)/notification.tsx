import { Fragment, useCallback, useEffect, useState, useRef } from 'react';
import { PROTECTED_BASE_URL } from '@/constants/api.config';
import { useAuth } from '@/hooks/use-auth';
import { useInfinite } from '@/hooks/use-infinite';
import { View, Text, RefreshControl, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryLoader, SecondaryLoader } from '@/components/ui/loader';
import { Error } from '@/components/ui/error';
import { Notification as NotificationType, NotificationType as NotificationEnum } from '@/types/response.types';
import { Spacer } from '@/components/ui/spacer';
import { NetworkProvider } from '@/providers/network.provider';
import { NotificationCard } from '@/components/notification/card';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const Notification = () => {

    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [atEnd, setAtEnd] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const hasMarkedAsRead = useRef(false);

    const { data, status, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfinite({
        url: `${PROTECTED_BASE_URL}/api/v2/notification`,
        queryKey: "notification",
        token: user?.tokens.accessToken,
        paramKey: "",
        paramValue: "",
        persist: false,
    });

    const markNotificationsAsRead = useCallback(async () => {
        if (!user?.tokens.accessToken) return;

        try {
            await axios.patch(
                `${PROTECTED_BASE_URL}/api/v2/notification/seen`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.tokens.accessToken}`,
                    },
                }
            );
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["notification"] }),
                queryClient.invalidateQueries({ queryKey: ["notification-count"] }),
            ]);
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    }, [user?.tokens.accessToken, queryClient]);

    useEffect(() => {
        if (!data || hasMarkedAsRead.current) return;

        const allNotifications = data.pages.flatMap((page: any) => page.items) as NotificationType[];
        const hasUnread = allNotifications.some((notification) => !notification.read);

        if (hasUnread) {
            hasMarkedAsRead.current = true;
            markNotificationsAsRead();
        }
    }, [data, markNotificationsAsRead]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        hasMarkedAsRead.current = false;
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        setAtEnd(isEnd);
    };

    useEffect(() => {
        if (atEnd && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [atEnd, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (status === "pending") {
        return (<PrimaryLoader />)
    }

    if (!data || status === "error") {
        return (<Error />)
    }

    return (
        <NetworkProvider>
            <SafeAreaView className='flex-1 bg-background' edges={['top']}>
                <ScrollView
                    className='flex-1'
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#ef4444"
                            colors={["#ef4444"]}
                        />
                    }
                >
                    <View className="px-6 pt-6 pb-4">
                        <Text className='text-2xl font-bold text-white'>Notifications</Text>
                    </View>
                    <View className="w-full flex flex-col gap-y-6 px-6">
                        {
                            data?.pages.map((group, i) => (
                                <Fragment key={i} >
                                    {
                                        group.items.map((notification: NotificationType) => (
                                            <NotificationCard
                                                notification={notification}
                                                key={notification.id}
                                            />
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
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default Notification