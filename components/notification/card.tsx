import { cn } from '@/lib/utils';
import { Image } from 'expo-image';
import { Href, router } from 'expo-router';
import { Notification } from '@/types/response.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';


interface Props {
    notification: Notification;
}

export const NotificationCard = ({ notification }: Props) => {

    return (
        <TouchableOpacity
            className={cn(
                'flex flex-row items-center gap-x-6 py-1.5 px-2.5 rounded-xl',
                notification.read ? "" : "bg-neutral-900"
            )}
            activeOpacity={0.7}
            onPress={() => {
                if (notification.appActionUrl) {
                    router.push(notification.appActionUrl as Href)
                } 
            }}
        >
            <View className='size-14 bg-neutral-800 rounded-xl relative'>
                {
                    notification.image ? (
                        <Image
                            source={notification.image}
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                            contentFit='cover'
                        />
                    ) : (
                        <View className='flex items-center justify-center size-full'>
                            <MaterialCommunityIcons name={notification.appIcon as any} size={24} color="#666666" />
                        </View>
                    )
                }
            </View>
            <View className='flex-1 flex gap-y-1'>
                <Text className='text-white font-medium'>{notification.title}</Text>
                <Text className='text-neutral-400 text-sm'>{notification.message}</Text>
            </View>
        </TouchableOpacity>
    )
}