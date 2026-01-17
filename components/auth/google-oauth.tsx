import { useEffect, useState } from "react";
import { Alert, Linking, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Button } from "@/components/ui/button";
import AntDesign from '@expo/vector-icons/AntDesign';
import { AUTH_BASE_URL } from "@/constants/api.config";
import { log } from "@/services/log.service";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { router } from "expo-router";


const AUTH_SCHEME = 'safarimusic://sign-in';

export const useWarmUpBrowser = () => {
    useEffect(() => {
        void WebBrowser.warmUpAsync();
        return () => {
            void WebBrowser.coolDownAsync();
        };
    }, []);
};

WebBrowser.maybeCompleteAuthSession();


const GoogleOauth = () => {

    useWarmUpBrowser();
    const { setUser } = useAuth();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const subscription = Linking.addEventListener('url', (event) => {
            void handleDeepLink(event.url);
        });

        Linking.getInitialURL().then((url) => {
            if (url) {
                void handleDeepLink(url);
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const parseAuthResult = (url: string): string | null => {
        try {
            const urlObj = new URL(url);

            const accessToken = urlObj.searchParams.get('accessToken');
            const refreshToken = urlObj.searchParams.get('refreshToken');

            if (!accessToken || !refreshToken) {
                return null;
            }

            const id = urlObj.searchParams.get('id');
            const email = urlObj.searchParams.get('email');
            const name = urlObj.searchParams.get('name');
            const image = urlObj.searchParams.get('image');
            const emailVerified = urlObj.searchParams.get('emailVerified');
            const createdAt = urlObj.searchParams.get('createdAt');

            setUser({
                tokens : {
                    accessToken,
                    refreshToken,
                },
                user : {
                    id: id || '',
                    email: email || '',
                    name: name || '',
                    image: image || undefined,
                    emailVerified: emailVerified === 'true',
                    createdAt: createdAt || new Date().toISOString(),
                }
            })

            return accessToken;
            
        } catch {
            return null;
        }
    };

    const handleDeepLink = async (url: string): Promise<void> => {
        if (!url.startsWith(AUTH_SCHEME)) {
            return;
        }

        try {

            setLoading(true);
            const urlObj = new URL(url);
            const error = urlObj.searchParams.get('message') || urlObj.searchParams.get('error');

            if (error) {
                Alert.alert('Authentication Error', error);
                return;
            }

            const accessToken = parseAuthResult(url);
            if (!accessToken) {
                Alert.alert('Error', 'Invalid authentication response.');
                return;
            }

            await fetchSettings(accessToken);
            router.replace("/(tabs)/home");
            
        } catch {
            Alert.alert('Error', 'Failed to process authentication response.');
            log({
                message : 'Google OAuth Deep Link Error',
                severity : "critical",
            })
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleSignIn = async () => {
        try {
            const authUrl = `${AUTH_BASE_URL}/api/v2/auth/google`;

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                AUTH_SCHEME
            );

            if (result.type === 'success' && result.url) {
                await handleDeepLink(result.url);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with Google';
            log({
                message : 'Google OAuth Error',
                severity : "critical",
            })
            Alert.alert('Error', errorMessage);
        }
    };

    

    return (
        <Button
            variant="secondary"
            onPress={handleGoogleSignIn}
            disabled={loading}
        >
            <AntDesign name="google" size={16} color="white" />
            <Text className="text-white font-semibold">Continue with Google</Text>
        </Button>
    )
}

export default GoogleOauth;
