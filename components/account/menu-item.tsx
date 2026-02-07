import { Image, ImageSource } from 'expo-image';
import { Href, router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';


export const MenuItem = ({
    item
}: {
    item: {
        name: string;
        description: string;
        path: Href;
        icon: ImageSource;
        width: number;
        height: number;
        isFeatured: boolean;
    }
}) => (
    <TouchableOpacity
        onPress={() => router.push(item.path)}
        className='flex flex-row items-center gap-x-4 py-2 px-6'
        activeOpacity={0.7}
    >
        <Image
            source={item.icon}
            style={{ width: item.width, height: item.height }}
        />
        <View className="flex-1 justify-center gap-y-0.5">
            <Text className="font-medium text-zinc-300 text-lg">
                {item.name}
            </Text>
        </View>
        <View className="items-center justify-center opacity-30">
            <Image
                source={require('@/assets/accounts/chevron-right.png')}
                style={{ width: 24, height: 24 }}
            />
        </View>
    </TouchableOpacity>
);