import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Stack, router } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from "@/lib/query-client";
import { useAuth } from "@/hooks/use-auth";
import { useAiRecommendationStore } from "@/hooks/use-ai-recommendation";
import { AUTH_BASE_URL } from "@/constants/api.config";
import { useSettings } from "@/hooks/use-settings";
import { useQueue } from "@/hooks/use-queue";
import "./global.css"
import usePlayerSettings from "@/hooks/use-player-settings";


SplashScreen.preventAutoHideAsync();

async function refreshTokens(refreshToken: string) {
    try {
        const response = await axios.post(`${AUTH_BASE_URL}/api/v2/auth/refresh`, {
            refreshToken
        });
        return response.data.data.accessToken as string;
    } catch (error) {
        console.error("Token refresh failed:", error);
        return null;
    }
}

export default function RootLayout() {
    const { queue, current } = useQueue();
    const { settings } = useSettings();
    const { isAiShuffled } = usePlayerSettings();
    const [appIsReady, setAppIsReady] = useState(false);
    const { updateTokens, setUser, isLoggedIn } = useAuth();
    const { initializeBackgroundFetch, processPendingRecommendations, setAiRecommendationEnabled } = useAiRecommendationStore();
    const appState = useRef(AppState.currentState);

    const isAiRecommendationEnabled = isLoggedIn ? settings?.subscription.isActive ? isAiShuffled : false : false;

    useEffect(() => {
        setAiRecommendationEnabled(isAiRecommendationEnabled);
    }, [isAiRecommendationEnabled]);

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise<void>((resolve) => {
                    const unsubscribe = useAuth.persist.onFinishHydration(() => {
                        unsubscribe();
                        resolve();
                    });
                    if (useAuth.persist.hasHydrated()) {
                        unsubscribe();
                        resolve();
                    }
                });

                const currentUser = useAuth.getState().user;

                if (currentUser?.tokens?.refreshToken) {
                    const accessToken = await refreshTokens(currentUser.tokens.refreshToken);
                    if (accessToken) {
                        updateTokens(accessToken);
                    } else {
                        setUser(null);
                        router.replace("/(auth)/sign-in");
                    }
                }
            } catch (error) {
                console.error("Error during app initialization:", error);
                setUser(null);
                router.replace("/(auth)/sign-in");
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
            initializeBackgroundFetch();
        }
    }, [appIsReady]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                processPendingRecommendations({
                    isAiRecommendationEnabled,
                    currentIsPlaying: !!current && queue.length > 0 && queue[0] !== null
                });
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isAiRecommendationEnabled]);

    if (!appIsReady) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <PortalProvider>
                    <BottomSheetModalProvider>
                        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#000" } }} />
                    </BottomSheetModalProvider>
                </PortalProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
