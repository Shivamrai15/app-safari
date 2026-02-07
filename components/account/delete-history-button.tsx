import axios from 'axios';
import { useState } from 'react';
import { Image } from 'expo-image';
import { View, Text, TouchableOpacity } from 'react-native';
import { DeleteModal } from '../modals/delete.modal';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { PROTECTED_BASE_URL } from '@/constants/api.config';
import { log } from '@/services/log.service';

const HistoryIcon = require("@/assets/accounts/time-past.png");

export const DeleteHistoryButton = () => {

    const { user } = useAuth();
    const [visible, setVisible] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${PROTECTED_BASE_URL}/api/v2/user/history`, {
                headers: {
                    Authorization: `Bearer ${user?.tokens.accessToken}`
                }
            });
            return response.data;
        },
        onSuccess: () => {
            setVisible(false);
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'low',
                    errorCode: error.response?.data?.code || 'DELETE_HISTORY_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                        responseBody: JSON.stringify(error.response?.data || {}),
                    },
                    navigationContext: { currentScreen: 'delete-history-button' },
                });
            }
            alert("Failed to delete history");
            setVisible(false);
        }
    });

    return (
        <>
            <TouchableOpacity
                className='flex flex-row items-center gap-x-4 py-2 px-6'
                activeOpacity={0.7}
                onPress={() => setVisible(true)}
            >
                <Image
                    source={HistoryIcon}
                    style={{ width: 24, height: 24 }}
                />
                <View className="flex-1 justify-center gap-y-0.5">
                    <Text className="font-medium text-zinc-300 text-lg">
                        Delete history
                    </Text>
                </View>
                <View className="items-center justify-center opacity-30">
                    <Image
                        source={require('@/assets/accounts/chevron-right.png')}
                        style={{ width: 24, height: 24 }}
                    />
                </View>
            </TouchableOpacity>
            <DeleteModal
                title="Delete history"
                message="Deletion is permanent and affects recommendations. Use Private Sessions instead. Click to confirm."
                visible={deleteMutation.isPending ? true : visible}
                isPending={deleteMutation.isPending}
                onClose={() => setVisible(false)}
                onDelete={() => deleteMutation.mutate()}
            />
        </>
    )
}