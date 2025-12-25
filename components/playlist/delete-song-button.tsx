import axios from 'axios'
import { Text } from 'react-native'
import { Button } from '../ui/button'
import { Image } from 'expo-image'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PROTECTED_BASE_URL } from '@/constants/api.config'
import { useAuth } from '@/hooks/use-auth'

interface Props {
    playlistId: string;
    songId: string;
}

export const DeleteSongButton = ({ playlistId, songId }: Props) => {

    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const { mutateAsync, isPending } = useMutation({
        mutationFn: async () => {
            await axios.delete(`${PROTECTED_BASE_URL}/api/v2/playlist/${playlistId}/songs/${songId}`, {
                headers : {
                    Authorization : `Bearer ${user?.tokens.accessToken}`,
                    'Content-Type' : 'application/json'
                }
            });
        },
        onSuccess: async() => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [`playlist-songs-${playlistId}`] }),
                queryClient.invalidateQueries({ queryKey: ['user-playlists'] }),
                queryClient.invalidateQueries({ queryKey: ['playlist-existing-songs', playlistId] }),
                queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })
            ]);
        },
        onError : ( error ) => {
            console.error("Error deleting song from playlist:", error);
        }
    });

    return (
        <Button
            variant='ghost'
            className='justify-start gap-x-6'
            onPress={mutateAsync}
            disabled={isPending}
        >
            <Image
                source={require("@/assets/icons/trash.png")}
                style={{ width: 24, height: 24 }}
            />
            <Text className='text-zinc-100 text-lg'>{isPending? "Removing" : "Remove" } from playlist</Text>
        </Button>
    )
}