import { Text, View } from 'react-native';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from 'react-native-safe-area-context';
import WelcomeImage from '@/assets/images/welcome.avif';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';

const Welcome = () => {
    return (
        <SafeAreaView className='bg-background flex-1'>
            <ImageBackground
                source={WelcomeImage}
                className='flex-1 justify-center items-center'
            >

                <LinearGradient
                    colors={['transparent', 'transparent', '#000000']}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <View className='size-full flex justify-end p-6'>
                        <View className='flex flex-col gap-y-10'>
                            <View className='max-w-80 flex flex-col gap-y-1'>
                                <Text className='text-2xl tracking-wider text-white font-bold'>Enjoy here the best music with us</Text>
                                <Text className='text-gray-400 font-medium'>What do you want to hear, enjoy here the best music with us</Text>
                            </View>
                            <Button
                                onPress={() => router.push("/(auth)/sign-up")}
                                variant='theme'
                                className='rounded-full'
                            >
                                <Text className='font-semibold text-white text-lg'>Get Started</Text>
                            </Button>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </SafeAreaView>
    )
}
export default Welcome;
