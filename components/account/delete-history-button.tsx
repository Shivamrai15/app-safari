import axios from 'axios';
import { useState } from 'react';
import { Image } from 'expo-image';
import { View, Text, TouchableOpacity } from 'react-native';
import { HistoryIcon } from '@/constants/icons';
import { DeleteModal } from '../modals/delete.modal';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { PROTECTED_BASE_URL } from '@/constants/api.config';
import { log } from '@/services/log.service';


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
                className='flex flex-row items-center gap-x-4 px-5 py-4 active:bg-neutral-800 transition-colors'
                activeOpacity={0.7}
                onPress={() => setVisible(true)}
            >
                <View className='size-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/10'>
                    <Image
                        source={HistoryIcon}
                        style={{ width: 20, height: 20 }}
                        tintColor={"#ef4444"}
                    />
                </View>
                <View className="flex-1 justify-center gap-y-0.5">
                    <Text className={'font-medium text-[17px] text-red-500'}>
                        Delete history
                    </Text>
                    <Text className="text-zinc-500 text-xs font-medium">
                        Clear listening data
                    </Text>
                </View>
                <View className="items-center justify-center opacity-30">
                    <Text className="text-zinc-400 text-lg font-light leading-none">›</Text>
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