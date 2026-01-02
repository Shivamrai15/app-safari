import axios from 'axios';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useAuth } from '@/hooks/use-auth';
import { MAINTENANCE_BASE_URL } from '@/constants/api.config';

export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

interface LogParams {
    message: string;
    severity?: LogSeverity;
    errorCode?: string;
    networkInfo?: {
        url?: string;
        method?: string;
        statusCode?: number | null;
        responseTime?: number | null;
        requestHeaders?: Record<string, string>;
        responseBody?: string;
    };
    navigationContext?: {
        currentScreen?: string;
        previousScreen?: string;
        routeParams?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
}

const getDeviceInfo = () => ({
    platform: Platform.OS,
    osVersion: Platform.Version?.toString() || '',
    deviceModel: Device.modelName || '',
    deviceId: Device.deviceName || '',
    manufacturer: Device.manufacturer || '',
});

const getAppInfo = () => ({
    appVersion: Application.nativeApplicationVersion || '',
    buildNumber: Application.nativeBuildVersion || '',
    environment: __DEV__ ? 'development' : 'production',
    expoVersion: Constants.expoConfig?.sdkVersion || '',
    releaseChannel: Constants.expoConfig?.extra?.releaseChannel || 'default',
});

const getUserContext = () => {
    const user = useAuth.getState().user;
    return {
        userId: user?.user?.id || '',
        isAuthenticated: !!user,
    };
};

const generateFingerprint = (message: string, errorCode: string): string => {
    const combined = `${message}-${errorCode}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(0, 32);
};

export const log = (params: LogParams): void => {
    const {
        message,
        severity = 'medium',
        errorCode = 'UNKNOWN_ERROR',
        networkInfo = {},
        navigationContext = {},
        metadata = {},
    } = params;

    const payload = {
        message,
        severity,
        errorCode,
        timestamp: new Date().toISOString(),
        appInfo: getAppInfo(),
        deviceInfo: getDeviceInfo(),
        userContext: getUserContext(),
        navigationContext: {
            currentScreen: navigationContext.currentScreen || '',
            previousScreen: navigationContext.previousScreen || '',
            routeParams: navigationContext.routeParams || {},
        },
        networkInfo: {
            url: networkInfo.url || '',
            method: networkInfo.method?.toUpperCase() || '',
            statusCode: networkInfo.statusCode ?? null,
            responseTime: networkInfo.responseTime ?? null,
            requestHeaders: networkInfo.requestHeaders
                ? Object.fromEntries(
                    Object.entries(networkInfo.requestHeaders)
                        .filter(([_, v]) => typeof v === 'string')
                        .map(([k, v]) => [k, String(v)])
                )
                : {},
            responseBody: typeof networkInfo.responseBody === 'string'
                ? networkInfo.responseBody
                : JSON.stringify(networkInfo.responseBody || ''),
        },
        fingerprint: generateFingerprint(message, errorCode),
        metadata,
    };

    axios.post(`${MAINTENANCE_BASE_URL}/error-logs`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
    }).catch((error) => {
        if (__DEV__) {
            console.warn('Failed to send error log:', error);
        }
    });
};
