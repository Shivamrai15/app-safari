import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Spacer } from '@/components/ui/spacer';

const PriceLists = {
    "price_1PLVQoSF9kH75ipG3YQe4k4Y": {
        planName: "Basic",
        color: "#ff9e95",
        price: 99,
        months: 1
    },
    "price_1PLVX8SF9kH75ipGU9rTB5HC": {
        planName: "Lite",
        color: "#8bf76a",
        price: 189,
        months: 2
    },
    "price_1PLVZkSF9kH75ipG33UoFPOx": {
        planName: "Elite",
        color: "#ffa875",
        price: 499,
        months: 6
    },
    "price_1PLVcJSF9kH75ipGigh23CQ9": {
        planName: "Prime",
        color: "#a96af7",
        price: 899,
        months: 12
    }
};

const features = [
    { name: "Ad-Free Experience", free: false, premium: true, icon: "ban-outline" as const },
    { name: "Unlimited Skips", free: false, premium: true, icon: "play-skip-forward-outline" as const },
    { name: "Organize queue", free: false, premium: true, icon: "list-outline" as const },
    { name: "Play songs in any order", free: false, premium: true, icon: "shuffle-outline" as const },
    { name: "Song seek control", free: false, premium: true, icon: "play-forward-outline" as const },
    { name: "Unlimited custom playlists", free: false, premium: true, icon: "albums-outline" as const },
];

const planBenefits = [
    "1 Premium Account",
    "Add free listening",
    "Unlimited playlists",
    "Cancel anytime",
    "One time payment",
];

const Pricing = () => {

    const priceListArray = Object.entries(PriceLists);

    return (
        <SafeAreaView className='bg-background flex-1'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={['#454545ff', '#2b2b2bff', '#00000000']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    className='px-6 pt-12 pb-10'
                >
                    <Text className='text-white text-4xl font-bold leading-tight'>
                        Skip the ads, unlock everything. Try 2 months of Premium for ₹189.
                    </Text>
                    <Text className='text-zinc-300 mt-4 text-base'>
                        Cancel anytime*
                    </Text>
                </LinearGradient>
                <View className='px-6 py-10'>
                    <Text className='text-white text-3xl font-bold text-center mb-10'>
                        Feel the Premium
                    </Text>
                    <View className='flex-row border-b border-zinc-800 pb-4 mb-2'>
                        <View className='flex-1' />
                        <Text className='text-white font-semibold text-base w-24 text-center'>
                            Free Plan
                        </Text>
                        <Text className='text-white font-semibold text-base w-24 text-center'>
                            Premium
                        </Text>
                    </View>
                    {features.map((feature, index) => (
                        <View
                            key={index}
                            className='flex-row items-center py-4 border-b border-zinc-900'
                        >
                            <View className='flex-1 flex-row items-center gap-3'>
                                <Ionicons name={feature.icon} size={24} color="#fff" />
                                <Text className='text-zinc-300 text-base flex-1'>
                                    {feature.name}
                                </Text>
                            </View>
                            <View className='w-24 items-center'>
                                {feature.free ? (
                                    <View className='bg-white rounded-full w-6 h-6 items-center justify-center'>
                                        <Ionicons name="checkmark" size={16} color="#000" />
                                    </View>
                                ) : (
                                    <Text className='text-zinc-500 text-xl'>—</Text>
                                )}
                            </View>
                            <View className='w-24 items-center'>
                                {feature.premium ? (
                                    <View className='bg-white rounded-full w-6 h-6 items-center justify-center'>
                                        <Ionicons name="checkmark" size={16} color="#000" />
                                    </View>
                                ) : (
                                    <Text className='text-zinc-500 text-xl'>—</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
                <View className='px-6 py-10'>
                    <Text className='text-white text-3xl font-bold text-center mb-10'>
                        Choose a plan that fits you
                    </Text>
                    <View className='flex flex-col gap-4'>
                        {priceListArray.map(([priceId, plan]) => {
                            const originalPrice = Math.round(plan.price * 1.3);
                            const savingsPercent = Math.round(((originalPrice - plan.price) / originalPrice) * 100);

                            return (
                                <View key={priceId} className='p-6 bg-neutral-800 rounded-2xl overflow-hidden'>
                                    <View
                                        className='absolute top-0 right-0 flex items-center justify-center w-24 h-10 rounded-bl-2xl'
                                        style={{ backgroundColor: plan.color }}
                                    >
                                        <Text className='text-black text-xs font-semibold'>
                                            Save {savingsPercent}%
                                        </Text>
                                    </View>
                                    <Text
                                        className='text-2xl font-bold text-center mt-2 mb-4'
                                        style={{ color: plan.color }}
                                    >
                                        {plan.planName}
                                    </Text>
                                    <View className='flex-row items-baseline justify-center mb-1'>
                                        <Text className='text-zinc-500 text-lg line-through mr-2'>
                                            ₹{originalPrice}
                                        </Text>
                                        <Text className='text-white text-3xl font-bold'>
                                            ₹{plan.price}
                                        </Text>
                                        <Text className='text-zinc-400 text-sm ml-1'>
                                            / {plan.months} month{plan.months > 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                    <Text className='text-zinc-500 text-sm text-center mb-4'>
                                        One time payment
                                    </Text>
                                    <Text className='text-zinc-400 text-sm text-center mb-6'>
                                        Premium music experience with unlimited access to all features
                                    </Text>
                                    <View className='border-t border-dashed border-zinc-700 mb-6' />
                                    <View className='mb-6'>
                                        {planBenefits.map((benefit, idx) => (
                                            <View key={idx} className='flex-row items-center mb-3'>
                                                <View className='w-5 h-5 rounded-full bg-green-500/20 items-center justify-center mr-3'>
                                                    <Ionicons name="checkmark" size={12} color="#22c55e" />
                                                </View>
                                                <Text className='text-zinc-300 text-sm flex-1'>
                                                    {benefit}
                                                </Text>
                                            </View>
                                        ))}
                                        <View className='flex-row items-center mb-3'>
                                            <View className='w-5 h-5 rounded-full items-center justify-center mr-3'>
                                                <Ionicons name="close" size={14} color="#71717a" />
                                            </View>
                                            <Text className='text-zinc-500 text-sm flex-1'>
                                                Family sharing
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        className='py-4 rounded-full'
                                        style={{ backgroundColor: plan.color }}
                                        activeOpacity={0.8}
                                    >
                                        <Text className='text-black font-semibold text-center text-base'>
                                            Get {plan.planName}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>
                <Spacer />
            </ScrollView>
        </SafeAreaView>
    );
};

export default Pricing;