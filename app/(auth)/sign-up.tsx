import axios from 'axios';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    Text,
    View
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoogleOauth from '@/components/auth/google-oauth';
import { AUTH_BASE_URL } from '@/constants/api.config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { log } from '@/services/log.service';

const SignUp = () => {

    const [form, setForm] = useState({
        name : "",
        email : "",
        password : ""
    });

    const { mutate, isPending } = useMutation({
        mutationFn : async(data: { name: string; email: string; password: string; })=> {
            const response = await axios.post(`${AUTH_BASE_URL}/api/v2/auth/register`, data);
            return response.data;
        },
        onSuccess(data) {
            alert("User registered successfully! Please sign in.");
        },
        onError(error) {
            alert("Error registering user. Please try again.");
            if (axios.isAxiosError(error)) {
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
                        currentScreen: 'sign-up',
                    },
                });
            }
        },
    });

    return (
            <SafeAreaView className='size-full bg-background'>
                <View className='flex-1 px-6 py-12 flex flex-col justify-between'>
                    <View className='flex flex-col gap-y-10'>
                        <View className='flex flex-col gap-y-3 mt-8'>
                            <Text className='text-white text-4xl font-extrabold leading-tight'>Join Safari</Text>
                            <Text className='text-zinc-400 text-base'>Create your account and start exploring</Text>
                        </View>
                        
                        <View className='flex flex-col gap-y-8'>
                            <View className='flex flex-col gap-y-5'>
                                <Input
                                    label='Full Name'
                                    value={form.name}
                                    onChange={(text) => setForm({ ...form, name: text })}
                                    keyboardType='default'
                                />
                                <Input
                                    label='Email Address'
                                    value={form.email}
                                    onChange={(text) => setForm({ ...form, email: text })}
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
                                    <Text className='text-white text-base font-bold'>Create Account</Text>
                                </Button>
                            </View>
                            
                            <View className='flex flex-col gap-y-6'>
                                <View className='flex flex-row items-center gap-x-4'>
                                    <View className='flex-1 h-px bg-zinc-800' />
                                    <Text className='text-zinc-500 text-sm font-medium'>OR SIGN UP WITH</Text>
                                    <View className='flex-1 h-px bg-zinc-800' />
                                </View>
                                <GoogleOauth />
                            </View>
                        </View>
                    </View>
                    
                    <View className='flex flex-row items-center justify-center gap-x-2'>
                        <Text className='text-zinc-500 text-sm'>Already have an account?</Text>
                        <Link href='/(auth)/sign-in'>
                            <Text className='text-red-600 text-sm font-bold'>Sign In</Text>
                        </Link>
                    </View>
                </View>
        </SafeAreaView>
    )
}

export default SignUp;