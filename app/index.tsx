import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { useSettingsSync } from '@/hooks/use-settings';
import { useLikedSongsSync } from '@/hooks/use-liked-songs';
import { useFollowingSync } from '@/hooks/use-artist';

const Index = () => {

    const { isLoggedIn, user } = useAuth();
    useSettingsSync(user?.tokens.accessToken);
    useLikedSongsSync(user?.tokens.accessToken);
    useFollowingSync(user?.tokens.accessToken);

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }
    
    return (
        <Redirect href="/(auth)/welcome" />
    )
}

export default Index;
