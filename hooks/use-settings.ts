import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SettingsResponse } from "@/types/response.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppState, AppStateStatus } from "react-native";
import { useEffect, useRef } from "react";
import { fetcher } from "@/lib/fetcher";
import { PROTECTED_BASE_URL } from "@/constants/api.config";

interface SettingProps {
    settings: SettingsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastSynced: number | null;
    setSettings: (settings: SettingsResponse) => void;
    clearSettings: () => void;
    fetchSettings: (token?: string) => Promise<void>;
    updateSettings: (updates: Partial<SettingsResponse>, token?: string) => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useSettings = create(
    persist<SettingProps>(
        (set, get) => ({
            settings: null,
            isLoading: false,
            error: null,
            lastSynced: null,

            setSettings: (settings) => {
                set({ 
                    settings, 
                    error: null,
                    lastSynced: Date.now()
                });
            },

            clearSettings: () => set({ 
                settings: null, 
                error: null, 
                lastSynced: null
            }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            fetchSettings: async (token?: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const headers = token ? {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } : {
                        'Content-Type': 'application/json'
                    };

                    const response = await fetcher({
                        prefix : "PROTECTED_BASE_URL",
                        suffix : "api/v2/user/account",
                        token
                    })

                    const settings: SettingsResponse = response.data ;
                    
                    set({ 
                        settings, 
                        isLoading: false, 
                        error: null,
                        lastSynced: Date.now()
                    });

                } catch (error: any) {
                    console.error('Error fetching settings:', error);
                    
                    const errorMessage = error.response?.data?.message || 
                                       error.message || 
                                       'Failed to fetch settings';
                    
                    set({ 
                        isLoading: false, 
                        error: errorMessage 
                    });
                }
            },

            updateSettings: async (updates: Partial<SettingsResponse>, token?: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const headers = token ? {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } : {
                        'Content-Type': 'application/json'
                    };

                    const payload : {
                        showRecommendations : boolean,
                        privateSession : boolean,
                    } = {
                        privateSession : updates.privateSession || false,
                        showRecommendations : updates.showRecommendations || false,
                        ...updates,
                    }

                    const currentSettings = get().settings;    

                    const updatedSettings= {
                        id: currentSettings?.id || '',
                        name: currentSettings?.name || '',
                        showRecommendations: currentSettings?.showRecommendations || false,
                        privateSession: currentSettings?.privateSession || false,
                        subscription: currentSettings?.subscription || {
                            isActive: false,
                            currentPeriodEnd: null,
                            priceId: null
                        },
                        ...updates,
                        ...(updates.subscription && currentSettings?.subscription && {
                            subscription: {
                                ...currentSettings.subscription,
                                ...updates.subscription
                            }
                        })
                    };
                    
                    set({ 
                        settings: updatedSettings,
                        isLoading: false, 
                        error: null,
                        lastSynced: Date.now()
                    });

                    await axios.post(`${PROTECTED_BASE_URL}/api/v2/user/account`, payload, {
                        headers,
                        timeout: 10000
                    });

                } catch (error: any) {
                    console.error('Error updating settings:', error);
                    
                    const errorMessage = error.response?.data?.message || 
                                       error.message || 
                                       'Failed to update settings';
                    
                    set({ isLoading: false, error: errorMessage });
                    throw error;
                }
            }
        }),
        {
            name: "settings-storage",
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);


export const useSettingsSync = (token?: string) => {
    const { 
        settings, 
        isLoading, 
        error, 
        lastSynced, 
        fetchSettings
    } = useSettings();

    const hasSyncedThisSession = useRef(false);
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current && token && !hasSyncedThisSession.current) {
            fetchSettings(token);
            hasSyncedThisSession.current = true;
            isFirstMount.current = false;
        }
    }, [token]);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState.match(/inactive|background/)) {
                hasSyncedThisSession.current = false;
            } else if (nextAppState === 'active' && !hasSyncedThisSession.current && token) {
                fetchSettings(token);
                hasSyncedThisSession.current = true;
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        return () => {
            subscription?.remove();
        };
    }, [token]);

    return {
        settings,
        isLoading,
        error,
        lastSynced,
        refresh: () => token && fetchSettings(token)
    };
};

export const useSettingsUpdater = (token?: string) => {
    const { updateSettings } = useSettings();

    const updatePrivateSession = async (privateSession: boolean) => {
        if (!token) throw new Error('Authentication required');
        await updateSettings({ privateSession }, token);
    };

    const updateShowRecommendations = async (showRecommendations: boolean) => {
        if (!token) throw new Error('Authentication required');
        await updateSettings({ showRecommendations }, token);
    };

    return {
        updatePrivateSession,
        updateShowRecommendations,
        updateSettings: (updates: Partial<SettingsResponse>) => 
            updateSettings(updates, token)
    };
};