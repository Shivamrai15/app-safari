import Fuse from "fuse.js";
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useSettings } from '@/hooks/use-settings';
import { NetworkProvider } from '@/providers/network.provider';
import { DeleteHistoryButton } from '@/components/account/delete-history-button';
import { MenuItem } from '@/components/account/menu-item';
import { AccountRoutes } from '@/constants/routes';


const fuseOptions = {
    keys: ["name", "description"],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
};

const fuse = new Fuse(AccountRoutes.filter((route) => route.isActive), fuseOptions);

const Account = () => {

    const { user } = useAuth();
    const { settings, fetchSettings } = useSettings();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRoutes = searchQuery.length > 0 ? fuse.search(searchQuery).sort((a, b) => (a.score || 0) - (b.score || 0)).map(result => result.item) : AccountRoutes.filter((route) => route.isActive && route.isFeatured);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchSettings(user?.tokens.accessToken);
        setIsRefreshing(false);
    }, [fetchSettings]);

    return (
        <NetworkProvider>
            <SafeAreaView
                className="flex-1 bg-background"
                edges={["top", "left", "right"]}
            >
                <ScrollView
                    className='flex-1'
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#ef4444"
                            colors={["#ef4444"]}
                        />
                    }
                >
                    <View className='px-6 pt-6 pb-4 flex flex-col gap-y-6 bg-background'>
                        <View className="flex flex-row gap-4 items-center justify-between">
                            <View className='size-9 relative rounded-full overflow-hidden'>
                                <Image
                                    source={user?.user?.image ? { uri: user?.user.image } : require('@/assets/images/user.png')}
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit='contain'
                                />
                            </View>
                            <Text className="text-white text-2xl font-bold tracking-tight">Settings</Text>
                            <View className='size-9' />
                        </View>
                        <View>
                            <View className='w-full bg-neutral-900 rounded-full h-14 flex flex-row items-center gap-x-2'>
                                <TextInput
                                    placeholder="Search settings"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="off"
                                    importantForAutofill="no"
                                    selectionColor="#a1a1aa"
                                    placeholderTextColor="#71717a"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    keyboardType="default"
                                    className="bg-transparent rounded-xl flex-1 border px-3 pl-4 py-2 h-full text-zinc-200 border-transparent outline-none font-medium"
                                />
                                <Image
                                    source={require("@/assets/accounts/search.png")}
                                    style={{ width: 18, height: 18, marginRight: 14 }}
                                />
                            </View>
                        </View>
                    </View>
                    {
                        !(settings?.subscription.isActive) && (
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/pricing')}
                                activeOpacity={0.9}
                                className="mx-5 my-4"
                            >
                                <View className="p-6 bg-neutral-900 rounded-2xl">
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
                    <Animated.View layout={LinearTransition} className='flex flex-col gap-y-2 my-4'>
                        {
                            filteredRoutes.map((route) => (
                                <Animated.View
                                    key={route.name}
                                    entering={FadeIn.duration(200)}
                                    exiting={FadeOut.duration(150)}
                                    layout={LinearTransition}
                                >
                                    <MenuItem
                                        item={route}
                                    />
                                </Animated.View>
                            ))
                        }
                        {
                            searchQuery.length === 0 && <DeleteHistoryButton />
                        }
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    );
}

export default Account;