import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const Page = () => {

    return (
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
            {/* Header */}
            <View className='px-6 py-5 border-b border-white/5 bg-background/90'>
                <View className='flex-row items-center justify-between'>
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className='p-2 -ml-2 rounded-full active:bg-white/10'
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className='text-lg font-bold tracking-wide text-white'>
                        Privacy Policy for Safari
                    </Text>
                    <View className='w-10' />
                </View>
            </View>

            {/* Main Content */}
            <ScrollView 
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerClassName='px-6 pt-6 pb-24'
            >
                {/* Header Section */}
                <View className='mb-10 items-center'>
                    <View className='items-center justify-center p-3 mb-4 rounded-full bg-primary/10'>
                        <MaterialIcons name="policy" size={24} color="#ef4444" />
                    </View>
                    <Text className='font-medium text-zinc-400'>
                        Last Updated
                    </Text>
                    <Text className='text-lg font-semibold text-white mt-1'>
                        January 14, 2025
                    </Text>
                    <Text className='text-xs text-zinc-500 mt-2 text-center max-w-[280px] leading-relaxed'>
                        We are committed to transparency and protecting your privacy while you enjoy your music on Safari.
                    </Text>
                </View>

                {/* Introduction */}
                <View className='mb-10'>
                    <Text className='text-base text-zinc-300 leading-relaxed'>
                        Welcome to Safari's Privacy Policy. This document explains how we handle your personal information and respect your privacy rights while using our music streaming services.
                    </Text>
                </View>

                {/* Main Sections */}
                <View className='gap-y-10'>
                    {/* Section 1: Information We Collect */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                1. Information We Collect
                            </Text>
                        </View>
                        <View className='gap-y-4'>
                            <Text className='text-zinc-300 leading-relaxed'>
                                We collect information to provide a seamless musical experience. This includes:
                            </Text>
                            <View className='gap-y-3 pl-2'>
                                <View className='flex-row items-start gap-3'>
                                    <MaterialIcons name="check-circle" size={18} color="#ef4444" style={{ marginTop: 2 }} />
                                    <Text className='text-zinc-300 leading-relaxed flex-1'>
                                        <Text className='text-white font-semibold'>Account Info:</Text> Username, email address, profile photo, and password credentials.
                                    </Text>
                                </View>
                                <View className='flex-row items-start gap-3'>
                                    <MaterialIcons name="check-circle" size={18} color="#ef4444" style={{ marginTop: 2 }} />
                                    <Text className='text-zinc-300 leading-relaxed flex-1'>
                                        <Text className='text-white font-semibold'>User Content:</Text> Playlists created, liked songs, listening history, and user-generated comments.
                                    </Text>
                                </View>
                                <View className='flex-row items-start gap-3'>
                                    <MaterialIcons name="check-circle" size={18} color="#ef4444" style={{ marginTop: 2 }} />
                                    <Text className='text-zinc-300 leading-relaxed flex-1'>
                                        <Text className='text-white font-semibold'>Technical Info:</Text> IP address, device model, OS version, and app crash logs.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Divider */}
                    <View className='h-px bg-white/5' />

                    {/* Section 2: How We Use Your Information */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                2. How We Use Your Information
                            </Text>
                        </View>
                        <View className='p-5 bg-zinc-900/50 rounded-2xl border border-white/5'>
                            <Text className='text-zinc-300 leading-relaxed mb-4'>
                                Your data powers our platform. We use it to:
                            </Text>
                            <View className='gap-3'>
                                <View className='flex-row items-center gap-3 p-3 bg-white/5 rounded-2xl'>
                                    <MaterialIcons name="equalizer" size={20} color="#ef4444" />
                                    <Text className='font-medium text-zinc-200'>
                                        Personalize recommendations
                                    </Text>
                                </View>
                                <View className='flex-row items-center gap-3 p-3 bg-white/5 rounded-2xl'>
                                    <MaterialIcons name="security" size={20} color="#ef4444" />
                                    <Text className='font-medium text-zinc-200'>
                                        Authenticate your identity
                                    </Text>
                                </View>
                                <View className='flex-row items-center gap-3 p-3 bg-white/5 rounded-2xl'>
                                    <MaterialIcons name="notifications-active" size={20} color="#ef4444" />
                                    <Text className='font-medium text-zinc-200'>
                                        Send service updates
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Divider */}
                    <View className='h-px bg-white/5' />

                    {/* Section 3: Third-Party Services */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                3. Third-Party Services
                            </Text>
                        </View>
                        <View className='gap-y-4'>
                            <Text className='text-zinc-300 leading-relaxed'>
                                We partner with trusted services to operate Safari effectively:
                            </Text>
                            <View className='gap-y-3'>
                                <View className='bg-zinc-900 p-3 rounded-2xl gap-1 border border-white/5'>
                                    <View className='flex-row items-center gap-2'>
                                        <View className='w-1.5 h-1.5 bg-primary rounded-full' />
                                        <Text className='text-white font-semibold'>Stripe</Text>
                                    </View>
                                    <Text className='text-xs text-zinc-400'>
                                        For secure payment processing of subscriptions.
                                    </Text>
                                </View>
                                <View className='bg-zinc-900 p-3 rounded-2xl gap-1 border border-white/5'>
                                    <View className='flex-row items-center gap-2'>
                                        <View className='w-1.5 h-1.5 bg-primary rounded-full' />
                                        <Text className='text-white font-semibold'>MongoDB</Text>
                                    </View>
                                    <Text className='text-xs text-zinc-400'>
                                        For secure cloud database storage of user data.
                                    </Text>
                                </View>
                                <View className='bg-zinc-900 p-3 rounded-2xl gap-1 border border-white/5'>
                                    <View className='flex-row items-center gap-2'>
                                        <View className='w-1.5 h-1.5 bg-primary rounded-full' />
                                        <Text className='text-white font-semibold'>Upstash</Text>
                                    </View>
                                    <Text className='text-xs text-zinc-400'>
                                        For serverless data caching and real-time messaging.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Divider */}
                    <View className='h-px bg-white/5' />

                    {/* Section 4: Data Sharing */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                4. Data Sharing
                            </Text>
                        </View>
                        <Text className='text-zinc-300 leading-relaxed'>
                            We do not sell your personal data. We may share data only when legally required, to protect our rights, or with your explicit consent for specific integrations.
                        </Text>
                    </View>

                    {/* Section 5: Data Security */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                5. Data Security
                            </Text>
                        </View>
                        <Text className='text-zinc-300 leading-relaxed'>
                            We implement rigorous encryption standards (AES-256) and regular security audits to protect your data. While no system is impenetrable, we prioritize the safety of your digital footprint on Safari.
                        </Text>
                    </View>

                    {/* Section 6: User Rights */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                6. User Rights
                            </Text>
                        </View>
                        <View className='gap-y-4'>
                            <Text className='text-zinc-300 leading-relaxed'>
                                You retain full ownership of your data. You have the right to:
                            </Text>
                            <View className='gap-y-2 ml-1'>
                                <Text className='text-zinc-300'>• Access the personal data we hold about you.</Text>
                                <Text className='text-zinc-300'>• Request correction of inaccurate data.</Text>
                                <Text className='text-zinc-300'>• Request deletion of your account and data.</Text>
                                <Text className='text-zinc-300'>• Opt-out of marketing communications.</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section 7: Age Restrictions */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                7. Age Restrictions
                            </Text>
                        </View>
                        <View className='bg-red-500/5 border border-red-500/20 rounded-2xl p-4'>
                            <Text className='text-zinc-300 leading-relaxed'>
                                Safari is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such data, we will delete it immediately.
                            </Text>
                        </View>
                    </View>

                    {/* Section 8: Changes to This Privacy Policy */}
                    <View>
                        <View className='flex-row items-center gap-3 mb-4'>
                            <View className='w-1.5 h-6 bg-primary rounded-full' />
                            <Text className='text-xl font-bold text-white flex-1'>
                                8. Changes to This Privacy Policy
                            </Text>
                        </View>
                        <Text className='text-zinc-300 leading-relaxed'>
                            We may update this policy periodically. We will notify you of significant changes via email or an in-app notification. Your continued use of Safari after changes constitutes acceptance.
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View className='mt-16 items-center pb-8 border-t border-white/5 pt-8'>
                    <Text className='text-xs text-zinc-600 mb-2'>
                        © 2025 Safari Music, Inc.
                    </Text>
                    <View className='flex-row justify-center gap-4'>
                        <Text className='text-xs text-zinc-500'>Terms</Text>
                        <Text className='text-zinc-700'>•</Text>
                        <Text className='text-xs text-zinc-500'>Cookies</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Page