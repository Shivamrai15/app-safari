import axios from "axios";
import { ACTIVITY_BASE_URL, PROTECTED_BASE_URL, PUBLIC_BASE_URL } from "@/constants/api.config";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";
import { log } from "@/services/log.service";

interface Args {
    prefix: "PUBLIC_BASE_URL" | "PROTECTED_BASE_URL" | "ACTIVITY_BASE_URL";
    suffix: string;
    token?: string;
}

// Guard to prevent multiple redirects when multiple 401 errors occur simultaneously
let isRedirecting = false;

export async function fetcher({ prefix, suffix, token }: Args) {

    let base = "";
    if (prefix === "PUBLIC_BASE_URL") {
        base = PUBLIC_BASE_URL;
    } else if (prefix === "ACTIVITY_BASE_URL") {
        base = ACTIVITY_BASE_URL;
    } else {
        base = PROTECTED_BASE_URL;
    }

    try {
        const response = await axios.get(`${base}/${suffix}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = response.data;
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                if (!isRedirecting) {
                    isRedirecting = true;
                    useAuth.getState().setUser(null);
                    router.replace("/(auth)/sign-in");
                    setTimeout(() => {
                        isRedirecting = false;
                    }, 1000);
                }
            } else if (suffix.includes("lyrics") && error.response?.status === 404) {
            } else {
                log({
                    message: error.response?.data?.message || error.message,
                    severity: 'medium',
                    errorCode: error.response?.data?.code || 'FETCHER_ERROR',
                    networkInfo: {
                        url: `${base}/${suffix}`,
                        method: 'GET',
                        statusCode: error.status || null,
                        responseBody: JSON.stringify(error.response?.data || {}),
                    },
                });
            }
        }
        throw error;
    }
}