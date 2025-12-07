import { Image } from 'expo-image';
import { Href, router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DownloadIcon, HistoryIcon, PlaylistRecoverIcon, ReceiptIcon, UserIcon } from '@/constants/icons';
import { NetworkProvider } from '@/providers/network.provider';


const Account = () => {

    const routes : { path: Href, name: string, icon: any, height: number, width: number }[] = [
        {
            name : "Your profile",
            path : "/(tabs)/account/profile",
            icon : UserIcon,
            height: 24,
            width: 24
        },
        {
            name : "Delete history",
            path : "/(tabs)/account/delete-history",
            icon : HistoryIcon,
            height: 24,
            width: 24
        },
        {
            name : "Recover playlists",
            path : "/",
            icon : PlaylistRecoverIcon,
            height: 28,
            width: 28
        },
        {
            name : "Transaction history",
            path : "/",
            icon : ReceiptIcon,
            height: 24,
            width: 24
        },
        {
            name : "Downloads",
            path : "/(tabs)/downloads",
            icon : DownloadIcon,
            height: 24,
            width: 24
        }
    ]

    return (
        <NetworkProvider>
            <SafeAreaView className="bg-background flex-1">
                <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                    <View className="px-6 pt-8 pb-6">
                        <Text className="text-white text-4xl font-extrabold">Settings</Text>
                        <Text className="text-zinc-400 text-sm mt-2">Manage your account and preferences</Text>
                    </View>
                    
                    <View className="px-6 pb-8">
                        <View className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                            {
                                routes.map((route, index) => (
                                    <TouchableOpacity
                                        key={route.name}
                                        onPress={() => router.push(route.path)}
                                        className={`flex flex-row items-center gap-x-4 px-5 py-4 ${
                                            index !== routes.length - 1 ? 'border-b border-zinc-800' : ''
                                        }`}
                                        activeOpacity={0.6}
                                    >
                                        <View className="w-11 h-11 bg-red-600/10 rounded-xl items-center justify-center">
                                            <Image
                                                source={route.icon}
                                                style={{ width: route.width, height: route.height}}
                                                tintColor="#ef4444"
                                            />
                                        </View>
                                        <Text className="text-white font-semibold text-base flex-1">{route.name}</Text>
                                        <View className="w-6 h-6 items-center justify-center">
                                            <Text className="text-zinc-500 text-xl">›</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    );
}

export default Account;