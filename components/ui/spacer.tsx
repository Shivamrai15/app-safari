import { useQueue } from '@/hooks/use-queue';
import { View } from 'react-native';

export const Spacer = () => {

    const { current } = useQueue();

    if (current) {
        return <View className="h-40 flex-shrink-0"/>
    }

    return (
        <View className="h-24 flex-shrink-0"/>
    )
}