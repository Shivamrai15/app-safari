import { useState } from 'react';
import { Image } from 'expo-image';
import { View, Text, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { NetworkProvider } from '@/providers/network.provider';
import { SubscriptionCard } from '@/components/account/subscription-card';


const Profile = () => {

    const { user } = useAuth();
    const [isPrivateSession, setIsPrivateSession] = useState(false);

    return (
        <NetworkProvider>    
            <SafeAreaView className='flex-1 bg-background'>
                <ScrollView 
                    className='flex-1 p-6'
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className='flex flex-row items-center gap-x-6'>
                        <View className='size-28 rounded-full overflow-hidden'>
                            <Image
                                source={ user?.user?.image ? { uri: user?.user.image } : require('@/assets/images/user.png')}
                                style={{ height:"100%", width:"100%"}}   
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
                                    value={isPrivateSession}
                                    onValueChange={setIsPrivateSession}
                                    thumbColor="white"
                                    trackColor={{ false: '#3f3f46', true: '#a1a1aa' }}
                                    style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                                />
                            </View>
                            <View className='flex flex-row items-center gap-x-4'> 
                                <View className='flex-1 flex flex-col gap-y-1'>
                                    <Text className='text-white font-semibold'>Recommend Songs</Text>
                                    <Text className='text-zinc-300 font-medium text-sm'>Allow Safari to recommend songs based on your activity.</Text>
                                </View>
                                <Switch
                                    value={isPrivateSession}
                                    onValueChange={setIsPrivateSession}
                                    thumbColor="white"
                                    trackColor={{ false: '#3f3f46', true: '#a1a1aa' }}
                                    style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default Profile;