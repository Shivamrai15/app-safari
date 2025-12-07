import { create } from "zustand";
import { User } from "@/types/auth.types";
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Props {
    user: User | null;
    isLoggedIn: boolean;
    setUser: (user: User | null) => void;
    updateTokens: (accessToken: string) => void;
}

export const useAuth = create(persist<Props>((set) => ({
    user: null,
    isLoggedIn: false,
    setUser: (user) => set({ user, isLoggedIn: !!user }),
    updateTokens: (accessToken) => set((state) => {
        if (state.user) {
            return {
                user: {
                    ...state.user,
                    tokens: {
                        ...state.user.tokens,
                        accessToken
                    }
                }
            };
        }   
        return {};
    })
}), {
    name : "auth",
    storage : createJSONStorage(() => AsyncStorage)
}))