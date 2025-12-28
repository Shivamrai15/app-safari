import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

interface UseSongQueryProps {
    url: string
    paramKey: string
    paramValue: string
    queryKey: string
    token?: string,
    persist?: boolean
}

export const useInfinite = ({
    url,
    paramKey,
    paramValue,
    queryKey,
    token,
    persist
}: UseSongQueryProps) => {

    const fetchSongs = async ({ pageParam = undefined }) => {
        const params = new URLSearchParams();
        if (pageParam) {
            params.append('cursor', pageParam);
        }
        if (paramKey && paramValue) {
            params.append(paramKey, paramValue);
        }

        const queryString = params.toString();
        const fetch_url = queryString ? `${url}?${queryString}` : url;
        const config = {
            headers: {} as Record<string, string>
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await axios.get(fetch_url, config);
        return response.data;
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        isLoading,
        refetch,
    } = useInfiniteQuery({
        initialPageParam: undefined,
        queryKey: [queryKey, paramKey, paramValue],
        queryFn: fetchSongs,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchInterval: false,
        meta: { persist: persist },
    });

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        isLoading,
        refetch
    }
}