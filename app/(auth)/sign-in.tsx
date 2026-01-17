import axios from 'axios';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
    View,
    Text,
    Modal,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoogleOauth from '@/components/auth/google-oauth';
import { useMutation } from '@tanstack/react-query';
import { AUTH_BASE_URL } from '@/constants/api.config';
import { User } from '@/types/auth.types';
import { useAuth } from '@/hooks/use-auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SecondaryLoader } from '@/components/ui/loader';
import { useSettings } from '@/hooks/use-settings';
import { queryClient } from '@/lib/query-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '@/services/log.service';

const SignIn = () => {

    const { setUser } = useAuth();
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const { fetchSettings } = useSettings();

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: { email: string; password: string; }) => {
            const response = await axios.post(`${AUTH_BASE_URL}/api/v2/auth/login`, data);
            return response.data.data;
        },
        async onSuccess(data: User) {
            await queryClient.cancelQueries();
            await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
            queryClient.clear();

            setUser(data);
            await fetchSettings(data.tokens.accessToken);
            alert("User logged in successfully!");
            router.replace("/(tabs)/home");
        },
        onError(error) {
            if (axios.isAxiosError(error)) {
                alert(`Error logging in user: ${error.response?.data?.message || error.message}`);
                if (error.status !== 401) {
                    log({
                        message: error.response?.data?.message || error.message,
                        severity: 'high',
                        errorCode: error.response?.data?.code || 'UNKNOWN_ERROR',
                        networkInfo: {
                            url: error.config?.url || '',
                            method: error.config?.method || '',
                            statusCode: error.status || null,
                            responseBody: JSON.stringify(error.response?.data || {}),
                        },
                        navigationContext: {
                            currentScreen: 'sign-in',
                        },
                    });
                }
            }
        },
    });



    return (
        <SafeAreaView className='size-full bg-background'>
            <View className='flex-1 px-6 py-12 flex flex-col justify-between'>
                <View className='flex flex-col gap-y-10'>
                    <View className='flex flex-col gap-y-3 mt-8'>
                        <Text className='text-white text-4xl font-extrabold leading-tight'>Welcome Back</Text>
                        <Text className='text-zinc-400 text-base'>Sign in to continue your musical journey</Text>
                    </View>

                    <View className='flex flex-col gap-y-8'>
                        <View className='flex flex-col gap-y-5'>
                            <Input
                                value={form.email}
                                onChange={(text) => setForm({ ...form, email: text })}
                                label='Email Address'
                                keyboardType='email-address'
                            />
                            <Input
                                label='Password'
                                value={form.password}
                                onChange={(text) => setForm({ ...form, password: text })}
                                keyboardType='default'
                                secureTextEntry={true}
                            />
                            <Button
                                className='bg-red-600 rounded-full h-14 mt-2'
                                disabled={isPending}
                                onPress={() => mutate(form)}
                            >
                                <Text className='text-white text-base font-bold'>Sign In</Text>
                            </Button>
                        </View>

                        <View className='flex flex-col gap-y-6'>
                            <View className='flex flex-row items-center gap-x-4'>
                                <View className='flex-1 h-px bg-zinc-800' />
                                <Text className='text-zinc-500 text-sm font-medium'>OR CONTINUE WITH</Text>
                                <View className='flex-1 h-px bg-zinc-800' />
                            </View>

                            <View className='flex flex-col gap-y-3'>
                                <Button
                                    variant='secondary'
                                    className='h-12'
                                    onPress={() => router.push("/(auth)/passwordless")}
                                >
                                    <Text className='text-white font-bold'>
                                        Continue without Password
                                    </Text>
                                </Button>
                                <GoogleOauth />
                            </View>
                        </View>
                    </View>
                </View>

                <View className='flex flex-row items-center justify-center gap-x-2'>
                    <Text className='text-zinc-500 text-sm'>Don't have an account?</Text>
                    <Link href='/(auth)/sign-up'>
                        <Text className='text-red-600 text-sm font-bold'>Sign Up</Text>
                    </Link>
                </View>
            </View>
            <Modal transparent={true} visible={isPending} animationType="fade">
                <View className='flex-1 items-center justify-center p-6 bg-background'>
                    <SecondaryLoader />
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default SignIn;
