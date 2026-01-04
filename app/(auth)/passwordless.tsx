import axios from 'axios';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import GoogleOauth from '@/components/auth/google-oauth';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { AUTH_BASE_URL } from '@/constants/api.config';
import { useSettings } from '@/hooks/use-settings';
import { queryClient } from '@/lib/query-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '@/services/log.service';

const CELL_COUNT = 6;

const PasswordLess = () => {

    const [code, setCode] = useState('');
    const { setUser } = useAuth();
    const { fetchSettings } = useSettings();
    const [emailAddress, setEmailAddress] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);

    const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value: code, setValue: setCode });

    const handleSendCodeMutation = useMutation({
        mutationFn: async (email: string) => {
            setPendingVerification(true);
            const response = await axios.post(`${AUTH_BASE_URL}/api/v2/auth/passwordless/send-otp`, { email });
            return response.data;
        },
        onError: (error) => {
            alert("Error sending verification code. Please try again.");
            setPendingVerification(false);
        }
    });

    const handleVerifyCodeMutation = useMutation({
        mutationFn: async ({ email, code }: { email: string; code: string }) => {
            const response = await axios.post(`${AUTH_BASE_URL}/api/v2/auth/passwordless/verify-otp`, { email, otp: code });
            return response.data.data;
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                alert(`${error.response?.data?.message || error.message}`);
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
                        currentScreen: 'passwordless',
                    },
                });
            }
        },
        async onSuccess(data) {
            await queryClient.cancelQueries();
            await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
            queryClient.clear();

            setUser(data);
            await fetchSettings(data.tokens.accessToken);
            alert("User logged in successfully!");
            router.replace("/(tabs)/home");
        }
    });


    if (pendingVerification) {
        return (
            <SafeAreaView className='size-full bg-background'>
                <View className='flex-1 px-6 py-12 flex flex-col'>
                    <View className='flex flex-col gap-y-4 mt-8'>
                        <Text className='text-white text-4xl font-extrabold'>Check your email</Text>
                        <Text className='text-zinc-400 text-base leading-relaxed'>
                            We've sent a 6-digit verification code to{' '}
                            <Text className='text-white font-semibold'>{emailAddress}</Text>
                        </Text>
                    </View>

                    <View className='flex flex-col gap-y-8'>
                        <View className='flex flex-col gap-y-3'>
                            <Text className='text-zinc-400 text-sm font-medium'>Enter verification code</Text>
                            <CodeField
                                ref={ref}
                                {...props}
                                value={code}
                                onChangeText={setCode}
                                cellCount={CELL_COUNT}
                                rootStyle={{ gap: 10 }}
                                keyboardType="number-pad"
                                textContentType="oneTimeCode"
                                autoFocus
                                renderCell={({ index, symbol, isFocused }) => (
                                    <View
                                        key={index}
                                        className={`flex-1 h-14 items-center justify-center rounded-xl border ${isFocused
                                            ? 'border-red-600 bg-red-600/5'
                                            : symbol
                                                ? 'border-red-600/50 bg-zinc-900'
                                                : 'border-zinc-800 bg-zinc-900/50'
                                            }`}
                                    >
                                        <Text
                                            onLayout={getCellOnLayoutHandler(index)}
                                            className='text-white text-xl font-bold'
                                        >
                                            {symbol || (isFocused ? <Cursor /> : null)}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>

                        <View className='flex flex-col gap-y-4'>
                            <Button
                                className='bg-red-600 rounded-full h-14'
                                disabled={(code.length !== CELL_COUNT) || handleVerifyCodeMutation.isPending}
                                onPress={() => handleVerifyCodeMutation.mutate({ email: emailAddress, code })}
                            >
                                <Text className='text-white text-base font-bold'>Verify & Continue</Text>
                            </Button>

                            <View className='flex flex-row items-center justify-center gap-x-1'>
                                <Text className='text-zinc-500 text-sm'>Didn't receive the code?</Text>
                                <Text className='text-red-600 text-sm font-semibold'>Resend</Text>
                            </View>
                        </View>
                    </View>

                    <View />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className='size-full bg-background'>
            <View className='flex-1 px-6 py-12 flex flex-col justify-between'>
                <View className='flex flex-col gap-y-10'>
                    <View className='flex flex-col gap-y-3 mt-8'>
                        <Text className='text-white text-4xl font-extrabold leading-tight'>Welcome Back</Text>
                        <Text className='text-zinc-400 text-base'>Sign in with your email to continue</Text>
                    </View>
                    <View className='flex flex-col gap-y-8'>
                        <View className='flex flex-col gap-y-5'>
                            <Input
                                value={emailAddress}
                                onChange={(text) => setEmailAddress(text)}
                                label='Your Email'
                                keyboardType='email-address'
                            />
                            <Button
                                className='bg-red-600 rounded-full h-14'
                                disabled={!emailAddress.trim() || handleSendCodeMutation.isPending}
                                onPress={() => handleSendCodeMutation.mutate(emailAddress)}
                            >
                                <Text className='text-white text-base font-bold'>Continue with Email</Text>
                            </Button>
                        </View>

                        <View className='flex flex-col gap-y-6'>
                            <View className='flex flex-row items-center gap-x-4'>
                                <View className='flex-1 h-px bg-zinc-800' />
                                <Text className='text-zinc-500 text-sm font-medium'>OR</Text>
                                <View className='flex-1 h-px bg-zinc-800' />
                            </View>
                            {/* <GoogleOauth /> */}
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
        </SafeAreaView>
    )
}

export default PasswordLess