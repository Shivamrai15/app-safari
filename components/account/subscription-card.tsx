import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { format } from 'date-fns';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const PriceLists = {
    "price_1PLVQoSF9kH75ipG3YQe4k4Y": {
        planName: "Basic",
        color: "#ff9e95",
    },
    "price_1PLVX8SF9kH75ipGU9rTB5HC": {
        planName: "Lite",
        color: "#8bf76a",
    },
    "price_1PLVZkSF9kH75ipG33UoFPOx": {
        planName: "Elite",
        color: "#ffa875",
    },
    "price_1PLVcJSF9kH75ipGigh23CQ9": {
        planName: "Prime",
        color: "#a96af7",
    },
    "free": {
        planName: "Free",
        color: "#323232"
    }
}

export const SubscriptionCard = () => {
    
    const { settings } = useSettings();
    
    const currentPlan = settings?.subscription.isActive ? settings?.subscription?.priceId : "free";
    const planColor = PriceLists[currentPlan as keyof typeof PriceLists]?.color || PriceLists["free"].color;
    
    return (
        <View className='rounded-3xl overflow-hidden bg-neutral-800 mt-16 w-full'>
            <LinearGradient
                className='w-full'
                colors={[`${planColor}5e`, 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 1]}
            >
                <View className='p-6 flex flex-col justify-between'>
                    <View className='flex flex-col gap-y-1'>
                        <View className='flex flex-row justify-between items-center'>
                            <Text className='text-white font-semibold'>
                                Your Plan
                            </Text>
                            <FontAwesome6 name="crown" size={24} color="white" />                                 
                        </View>
                        <Text className='text-white font-extrabold text-4xl'>
                            {PriceLists[currentPlan as keyof typeof PriceLists]?.planName || PriceLists["free"].planName}
                        </Text>
                    </View>
                    <View className='flex flex-row items-center justify-end mt-10'>
                        {
                            (settings?.subscription.isActive && settings?.subscription?.currentPeriodEnd)
                            ? (
                                <Text className='text-white font-semibold'>
                                    Expires on {format(settings.subscription.currentPeriodEnd, "dd MMM yyyy")}
                                </Text>
                            ) : (
                                <Button
                                    className='rounded-full px-4'
                                    onPress={()=>router.push("/pricing")}                                    
                                >
                                    <Text className='text-black font-semibold'>
                                        Upgrade
                                    </Text>
                                </Button>
                            )
                        }
                    </View>
                </View>
            </LinearGradient>
        </View>
    )
}