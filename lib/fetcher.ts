import axios from "axios";
import { PROTECTED_BASE_URL, PUBLIC_BASE_URL } from "@/constants/api.config";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";
import { log } from "@/services/log.service";

interface Args {
    prefix: "PUBLIC_BASE_URL" | "PROTECTED_BASE_URL"
    suffix: string;
    token?: string;
}

export async function fetcher({ prefix, suffix, token }: Args) {

    let base = "";
    if (prefix === "PUBLIC_BASE_URL") {
        base = PUBLIC_BASE_URL;
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
                useAuth.getState().setUser(null);
                router.replace("/(auth)/sign-in");
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