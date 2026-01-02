import axios from 'axios';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PROTECTED_BASE_URL } from '@/constants/api.config';
import { useAuth } from '@/hooks/use-auth';
import { log } from '@/services/log.service';

interface RestoreButtonProps {
    playlistId: string;
}

export const RestoreButton = ({ playlistId }: RestoreButtonProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            await axios.patch(
                `${PROTECTED_BASE_URL}/api/v2/playlist/${playlistId}/restore`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user?.tokens.accessToken}`
                    }
                }
            );
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['recover-playlists'] });
            await queryClient.invalidateQueries({ queryKey: ['user-playlists'] });
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'medium',
                    errorCode: error.response?.data?.code || 'RESTORE_PLAYLIST_ERROR',
                    networkInfo: {
                        url: error.config?.url || '',
                        method: error.config?.method || '',
                        statusCode: error.status || null,
                        responseBody: JSON.stringify(error.response?.data || {}),
                    },
                    navigationContext: { currentScreen: 'restore-button' },
                });
            }
        }
    });

    return (
        <TouchableOpacity
            onPress={() => mutate()}
            disabled={isPending}
            className="bg-zinc-800 px-5 py-2.5 rounded-full"
            activeOpacity={0.7}
        >
            {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
                <Text className="text-white font-semibold text-sm">
                    Restore
                </Text>
            )}
        </TouchableOpacity>
    );
};

