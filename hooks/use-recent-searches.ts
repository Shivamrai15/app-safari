import { create } from "zustand";
import { fetcher } from "@/lib/fetcher";
import { SearchHistory } from "@/types/native.types";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from "axios";
import { useAuth } from "./use-auth";
import { ACTIVITY_BASE_URL } from "@/constants/api.config";
import { log } from "@/services/log.service";
import * as Crypto from 'expo-crypto';

interface Props {
    searches: SearchHistory[];
    hydrated: boolean;

    hydrateFromServer: () => Promise<void>;
    addSearch: (data: Omit<SearchHistory, "id" | "created_at">) => Promise<void>;
    clearLocal: () => void;
    removeSearch: (id: string) => void;
    getRecentSearches: () => SearchHistory[];
}

const MAX_LIMIT = 15;

export const useRecentSearches = create(persist<Props>((set, get) => ({
    searches: [],
    hydrated: false,
    hydrateFromServer: async () => {
        try {
            
            const res = await fetcher({
                prefix: "ACTIVITY_BASE_URL",
                suffix: "api/v3/search/recent",
                token: useAuth.getState().user?.tokens.accessToken
            });

            const data = res.data as (Omit<SearchHistory, "created_at"> & { created_at: string })[] | null;
            if (!data) {
                set({
                    searches: [],
                    hydrated: true
                });
                return;
            };
            set({
                searches: data.map((item) => ({
                    ...item,
                    created_at: new Date(item.created_at)
                })).sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
                hydrated: true
            });

        } catch (error) {
            console.log(error);
        }
    },
    addSearch: async (data) => {
        const { searches } = get();
        const existingSearchItem = searches.find((item) => item.content_id === data.content_id);
        if (existingSearchItem) {
            set({
                searches: [...searches.filter((item) => item.content_id !== data.content_id), {...existingSearchItem, created_at: new Date()}]
            });
        } else {
            set({
                searches: [...searches.slice(0, MAX_LIMIT - 1), {...data, created_at: new Date(), id: Crypto.randomUUID()}]
            });
        }

        try {
            await axios.post(`${ACTIVITY_BASE_URL}/api/v3/search`, {
                content_id: data.content_id,
                type: data.type,
                name: data.name,
                image: data.image
            }, {
                headers: {
                    Authorization: `Bearer ${useAuth.getState().user?.tokens.accessToken}`
                }
            });
        } catch (error) {
            console.log(error);
            if (isAxiosError(error)) {
                log({
                    errorCode: error.response?.data.error.code,
                    message: "Failed to add recent search",
                    networkInfo : {
                        url: error.config?.url,
                        method: error.config?.method,
                        requestHeaders : error.config?.headers,
                        responseBody : error.response?.data,
                        responseTime : error.response?.headers['x-response-time'],
                    },
                });
            }
        } finally {
            await get().hydrateFromServer();
        }
    },
    clearLocal: async() => {
        try {
            set({
                searches: []
            });
            await axios.delete(`${ACTIVITY_BASE_URL}/api/v3/search/clear`, {
                headers: {
                    Authorization: `Bearer ${useAuth.getState().user?.tokens.accessToken}`
                }
            });
        } catch (error) {
            console.log(error);
            if (isAxiosError(error)) {
                log({
                    errorCode: error.response?.data.error.code,
                    message: "Failed to clear recent searches",
                    networkInfo : {
                        url: error.config?.url,
                        method: error.config?.method,
                        requestHeaders : error.config?.headers,
                        responseBody : error.response?.data,
                        responseTime : error.response?.headers['x-response-time'],
                    },
                });
                return;
            }
        } finally {
            await get().hydrateFromServer();
        }
    },
    getRecentSearches: () => {
        return get().searches.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    },
    removeSearch: async (id) => {
        const { searches } = get();
        set({
            searches: searches.filter((item) => item.id !== id)
        });
        try {
            await axios.delete(`${ACTIVITY_BASE_URL}/api/v3/search/${id}`, {
                headers: {
                    Authorization: `Bearer ${useAuth.getState().user?.tokens.accessToken}`
                }
            });
            await get().hydrateFromServer();
        } catch (error) {
            console.log(error);
            if (isAxiosError(error)) {
                log({
                    errorCode: error.response?.data.error.code,
                    message: "Failed to remove recent search",
                    networkInfo : {
                        url: error.config?.url,
                        method: error.config?.method,
                        requestHeaders : error.config?.headers,
                        responseBody : error.response?.data,
                        responseTime : error.response?.headers['x-response-time'],
                    },
                });
            }
        }
    }
}), {
    name: "recent-searches",
    storage: createJSONStorage(() => AsyncStorage)
}))