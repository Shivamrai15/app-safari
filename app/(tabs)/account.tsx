import { Image } from 'expo-image';
import { Href, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DownloadIcon, PlaylistRecoverIcon, ReceiptIcon, UserIcon } from '@/constants/icons';
import { NetworkProvider } from '@/providers/network.provider';
import { DeleteHistoryButton } from '@/components/account/delete-history-button';
import { useSettings } from '@/hooks/use-settings';
import { Spacer } from '@/components/ui/spacer';
import { useAuth } from '@/hooks/use-auth';

const MenuItem = ({
    item,
    isLast,
    isDestructive = false
}: {
    item: any,
    isLast: boolean,
    isDestructive?: boolean
}) => (
    <TouchableOpacity
        onPress={() => router.push(item.path)}
        className={`flex flex-row items-center gap-x-4 px-5 py-4 active:bg-neutral-800 transition-colors ${!isLast ? 'border-b border-neutral-700' : ''
            }`}
        activeOpacity={0.7}
    >
        <View className={`size-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDestructive ? 'bg-red-500/10' : 'bg-neutral-700'
            }`}>
            <Image
                source={item.icon}
                style={{ width: item.width, height: item.height }}
                tintColor={isDestructive ? "#ef4444" : "#e4e4e7"}
            />
        </View>

        <View className="flex-1 justify-center gap-y-0.5">
            <Text className={`font-medium text-[17px] ${isDestructive ? 'text-red-500' : 'text-white'}`}>
                {item.name}
            </Text>
            {item.description && (
                <Text className="text-zinc-500 text-xs font-medium">
                    {item.description}
                </Text>
            )}
        </View>
        <View className="items-center justify-center opacity-30">
            <Text className="text-zinc-400 text-lg font-light leading-none">›</Text>
        </View>
    </TouchableOpacity>
);

const Account = () => {


    const [isRefreshing, setIsRefreshing] = useState(false);
    const { user } = useAuth();
    const { settings, fetchSettings } = useSettings();

    const profileRoute = {
        name: "Your profile",
        description: "Manage account details",
        path: "/(tabs)/account/profile" as Href,
        icon: UserIcon,
        height: 18,
        width: 18
    };

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchSettings(user?.tokens.accessToken);
        setIsRefreshing(false);
    }, [fetchSettings]);

    const generalRoutes = [
        {
            name: "Downloads",
            description: "Manage offline content",
            path: "/(tabs)/downloads" as Href,
            icon: DownloadIcon,
            height: 20,
            width: 20
        },
        {
            name: "Recover playlists",
            description: "Restore deleted collections",
            path: "/(tabs)/account/recover-playlist" as Href,
            icon: PlaylistRecoverIcon,
            height: 18,
            width: 18
        },
        {
            name: "Transaction history",
            description: "Billing and receipts",
            path: "/(tabs)/account/transaction-history" as Href,
            icon: ReceiptIcon,
            height: 18,
            width: 18
        },
    ];

    return (
        <NetworkProvider>
            <SafeAreaView className="bg-background flex-1" edges={['top']}>
                <ScrollView
                    className='flex-1'
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
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
                        <Text className="text-white text-3xl font-bold tracking-tight">Settings</Text>
                    </View>
                    {
                        !(settings?.subscription.isActive) && (
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/pricing')}
                                activeOpacity={0.9}
                                className="mx-5 mb-6 "
                            >
                                <View className="p-6 bg-neutral-800 rounded-2xl">
                                    <Text className="text-white text-xl font-bold mb-1">
                                        Upgrade to Premium
                                    </Text>
                                    <Text className="text-zinc-400 text-sm mb-4">
                                        Ad-free listening, unlimited skips & more
                                    </Text>
                                    <View className="bg-white self-start px-6 py-3 rounded-full">
                                        <Text className="text-zinc-800 font-semibold text-sm">
                                            Get Premium
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                    <View className="px-5 gap-y-6">
                        <View className="bg-neutral-800 rounded-2xl overflow-hidden">
                            <MenuItem item={profileRoute} isLast={true} />
                        </View>
                        <View className="bg-neutral-800 rounded-2xl overflow-hidden">
                            {generalRoutes.map((route, index) => (
                                <MenuItem
                                    key={route.name}
                                    item={route}
                                    isLast={index === generalRoutes.length - 1}
                                />
                            ))}
                        </View>
                        <View className="bg-neutral-800 rounded-2xl overflow-hidden">
                            <DeleteHistoryButton />
                        </View>
                        <View className="items-center py-4">
                            <Text className="text-zinc-600 text-xs">Version 1.0.0</Text>
                        </View>
                    </View>
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    );
}

export default Account;