import { Error } from '@/components/ui/error';
import { PrimaryLoader, SecondaryLoader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { PROTECTED_BASE_URL } from '@/constants/api.config';
import { ReceiptIcon } from '@/constants/icons';
import { useAuth } from '@/hooks/use-auth';
import { useInfinite } from '@/hooks/use-infinite';
import { NetworkProvider } from '@/providers/network.provider';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';


type TransactionHistoryProps = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    stripeCurrentPeriodEnd: Date;
}

const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};


const getDateKey = (date: Date): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const deduplicateByDate = (items: TransactionHistoryProps[]): TransactionHistoryProps[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
        const dateKey = getDateKey(item.createdAt);
        if (seen.has(dateKey)) {
            return false;
        }
        seen.add(dateKey);
        return true;
    });
};

const PriceLists = {
    "price_1PLVQoSF9kH75ipG3YQe4k4Y": {
        planName: "Basic",
        color: "#ff9e95",
        price: 99,
        months: 1
    },
    "price_1PLVX8SF9kH75ipGU9rTB5HC": {
        planName: "Lite",
        color: "#8bf76a",
        price: 189,
        months: 2
    },
    "price_1PLVZkSF9kH75ipG33UoFPOx": {
        planName: "Elite",
        color: "#ffa875",
        price: 499,
        months: 6
    },
    "price_1PLVcJSF9kH75ipGigh23CQ9": {
        planName: "Prime",
        color: "#a96af7",
        price: 899,
        months: 12
    }
};

const TransactionCard = ({ item }: { item: TransactionHistoryProps }) => {
    const isActive = new Date(item.stripeCurrentPeriodEnd) > new Date();
    const planData = PriceLists[item.stripePriceId as keyof typeof PriceLists];

    const planName = planData?.planName || "Premium";
    const planColor = planData?.color || "#a1a1aa";
    const planPrice = planData?.price || 0;
    const planMonths = planData?.months || 1;

    return (
        <View className="bg-neutral-900 rounded-3xl p-4 border border-neutral-800/50">
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center gap-x-3">
                    <View
                        className="size-11 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${planColor}20` }}
                    >
                        <Image
                            source={ReceiptIcon}
                            style={{ width: 18, height: 18 }}
                            tintColor={planColor}
                        />
                    </View>
                    <View>
                        <View className="flex-row items-center gap-x-2">
                            <Text className="text-white font-semibold text-base">{planName}</Text>
                            <View
                                className="px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: `${planColor}20` }}
                            >
                                <Text style={{ color: planColor, fontSize: 10, fontWeight: '600' }}>
                                    {planMonths} {planMonths === 1 ? 'Month' : 'Months'}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-zinc-500 text-xs mt-0.5">{formatDate(item.createdAt)}</Text>
                    </View>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${isActive ? 'bg-emerald-500/15' : 'bg-zinc-700/30'}`}>
                    <Text className={`text-xs font-medium ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {isActive ? 'Active' : 'Expired'}
                    </Text>
                </View>
            </View>

            <View className="h-px bg-neutral-800/70 my-3" />

            <View className="gap-y-2">
                <View className="flex-row justify-between items-center">
                    <Text className="text-zinc-500 text-sm">Amount Paid</Text>
                    <Text className="text-white text-sm font-semibold">₹{planPrice}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-zinc-500 text-sm">Subscription ID</Text>
                    <Text className="text-zinc-300 text-sm font-medium" numberOfLines={1}>
                        ...{item.stripeSubscriptionId.slice(-8)}
                    </Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-zinc-500 text-sm">Valid Until</Text>
                    <Text className="text-zinc-300 text-sm font-medium">
                        {formatDate(item.stripeCurrentPeriodEnd)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-6">
        <View className="size-20 rounded-full bg-neutral-900 items-center justify-center mb-4 border border-neutral-800/50">
            <Image
                source={ReceiptIcon}
                style={{ width: 32, height: 32 }}
                tintColor="#52525b"
            />
        </View>
        <Text className="text-white text-lg font-semibold mb-1">No Transactions</Text>
        <Text className="text-zinc-500 text-sm text-center">
            Your transaction history will appear here once you make a purchase.
        </Text>
    </View>
);

const TransactionHistory = () => {

    const { user } = useAuth();
    const [atEnd, setAtEnd] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        setAtEnd(isEnd);
    };

    const { data, isFetchingNextPage, fetchNextPage, hasNextPage, status, error, refetch } = useInfinite({
        url: `${PROTECTED_BASE_URL}/api/v2/user/payments/order-history`,
        paramKey: "",
        paramValue: "",
        queryKey: "transactions-history",
        token: user?.tokens.accessToken,
        persist : false
    });

    useEffect(() => {
        if (atEnd && hasNextPage) {
            fetchNextPage();
        }
    }, [atEnd, hasNextPage, fetchNextPage]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const cleanedTransactions = useMemo(() => {
        if (!data?.pages) return [];
        const allItems = data.pages.flatMap(group => group.items || []);
        return deduplicateByDate(allItems);
    }, [data?.pages]);

    const hasTransactions = cleanedTransactions.length > 0;

    return (
        <NetworkProvider>
            <SafeAreaView className='flex-1 bg-background'>
                <View className="flex-row items-center px-4 py-6">
                    <Text className="text-white text-2xl font-bold tracking-tight">Transaction History</Text>
                </View>

                <ScrollView
                    className='flex-1'
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#ef4444"
                            colors={["#ef4444"]}
                        />
                    }
                >
                    {error && <Error />}

                    {status === "pending" && <PrimaryLoader />}

                    {status === "success" && !hasTransactions && <EmptyState />}

                    <View className="gap-y-3">
                        {cleanedTransactions.map((item: TransactionHistoryProps) => (
                            <TransactionCard key={item.id} item={item} />
                        ))}
                    </View>

                    {isFetchingNextPage && (
                        <View className='w-full py-4'>
                            <SecondaryLoader />
                        </View>
                    )}

                    <Spacer />
                </ScrollView>
            </SafeAreaView>
        </NetworkProvider>
    )
}

export default TransactionHistory