import { Image } from 'expo-image';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Switch } from '@/components/ui/switch';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { NetworkProvider } from '@/providers/network.provider';
import { SubscriptionCard } from '@/components/account/subscription-card';
import { useSettings, useSettingsUpdater } from '@/hooks/use-settings';
import { Spacer } from '@/components/ui/spacer';
import { useCallback, useState } from 'react';


const Profile = () => {

    const { user } = useAuth();
    const { settings, fetchSettings } = useSettings();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { updateSettings } = useSettingsUpdater(user?.tokens.accessToken);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchSettings(user?.tokens.accessToken);
        setIsRefreshing(false);
    }, [fetchSettings]);


    return (
        <NetworkProvider>
            <SafeAreaView className='flex-1 bg-background'>
                <ScrollView
                    className='flex-1 p-6'
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
                    <View className='flex flex-row items-center gap-x-6'>
                        <View className='size-28 rounded-full overflow-hidden'>
                            <Image
                                source={user?.user?.image ? { uri: user?.user.image } : require('@/assets/images/user.png')}
                                style={{ height: "100%", width: "100%" }}
                            />
                        </View>
                        <View className='flex flex-col gap-y-2'>
                            <Text className="text-zinc-400 font-semibold">
                                Profile
                            </Text>
                            <Text className='text-white text-3xl font-extrabold'>
                                {user?.user?.name}
                            </Text>
                        </View>
                    </View>
                    <SubscriptionCard />
                    <View className='mt-16 flex flex-col gap-y-8'>
                        <Text className='text-2xl text-white font-extrabold'>
                            Personalized Settings
                        </Text>
                        <View className='flex flex-col gap-y-6'>
                            <View className='flex flex-row items-center gap-x-4'>
                                <View className='flex-1 flex flex-col gap-y-1'>
                                    <Text className='text-white font-semibold'>Private Session</Text>
                                    <Text className='text-zinc-300 font-medium text-sm'>Turn on Private Session to listen without sharing your activity.</Text>
                                </View>
                                <Switch
                                    value={settings?.subscription.isActive ? settings.privateSession : false}
                                    onValueChange={(value) => updateSettings({ privateSession: value })}
                                    disabled={!settings?.subscription.isActive}
                                />
                            </View>
                            <View className='flex flex-row items-center gap-x-4'>
                                <View className='flex-1 flex flex-col gap-y-1'>
                                    <Text className='text-white font-semibold'>Recommend Songs</Text>
                                    <Text className='text-zinc-300 font-medium text-sm'>Allow Safari to recommend songs based on your activity.</Text>
                                </View>
                                <Switch
                                    value={settings?.subscription.isActive ? settings.showRecommendations : true}
                                    onValueChange={(value) => updateSettings({ showRecommendations: value })}
                                    disabled={!settings?.subscription.isActive}
                                />
                            </View>
                        </View>
                    </View>
                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default Profile;