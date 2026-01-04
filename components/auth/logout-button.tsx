import { Text } from 'react-native'
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { useDownloads } from '@/hooks/use-downloads';
import { queryClient } from '@/lib/query-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LogoutButton = () => {

    const { setUser } = useAuth();
    const { deleteAllDownloads } = useDownloads();

    const handleLogout = async () => {
        await queryClient.cancelQueries();
        await deleteAllDownloads();
        await AsyncStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
        queryClient.clear();
        setUser(null);
        setTimeout(() => {
            router.replace("/(auth)/sign-in");
        }, 0);
    }

    return (
        <Button
            className="px-4 rounded-full"
            onPress={handleLogout}
        >
            <Text className="font-bold">Logout</Text>
        </Button>
    );
}