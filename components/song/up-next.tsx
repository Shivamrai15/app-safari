import { useQueue } from '@/hooks/use-queue';
import { Album, Song } from '@/types/response.types';
import { albumDuration } from '@/lib/utils';
import { Image } from 'expo-image';
import { memo, useCallback, useMemo } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type QueueItem = Song & { album: Album };

const ITEM_HEIGHT = 64;

interface QueueItemRowProps {
    item: QueueItem;
    drag: () => void;
    isActive: boolean;
    onRemove: (id: string) => void;
}

const QueueItemRow = memo(({ item, drag, isActive, onRemove }: QueueItemRowProps) => {
    return (
        <ScaleDecorator>
            <Pressable
                onLongPress={drag}
                disabled={isActive}
                delayLongPress={150}
                style={{
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    paddingVertical: 8,
                    borderRadius: 12,
                    height: ITEM_HEIGHT,
                }}
            >
                <View className="flex flex-row items-center gap-x-3">
                    <View className="p-1">
                        <MaterialIcons name="drag-handle" size={24} color="#a3a3a3" />
                    </View>
                    <Image
                        source={{ uri: item.image }}
                        style={{ width: 48, height: 48, borderRadius: 8 }}
                        contentFit="cover"
                        recyclingKey={item.id}
                    />
                    <View className="flex-1 flex flex-col gap-y-0.5">
                        <Text
                            className="text-white font-semibold"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.name}
                        </Text>
                        <Text
                            className="text-neutral-400 font-medium text-sm"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.album.name}
                        </Text>
                    </View>
                    <Text className="text-neutral-400 font-medium text-sm w-12">
                        {albumDuration(item.duration)}
                    </Text>
                    <TouchableOpacity
                        onPress={() => onRemove(item.id)}
                        activeOpacity={0.7}
                        className="p-1"
                    >
                        <Ionicons name="close-circle-outline" size={22} color="#a3a3a3" />
                    </TouchableOpacity>
                </View>
            </Pressable>
        </ScaleDecorator>
    );
});

QueueItemRow.displayName = 'QueueItemRow';

export const UpNext = memo(() => {
    const { queue, reorderQueue, remove, current } = useQueue();

    const upNextQueue = useMemo(() => queue.slice(1), [queue]);

    const handleDragEnd = useCallback(({ data: newData, from, to }: { data: QueueItem[], from: number, to: number }) => {
        if (from !== to) {
            reorderQueue(newData);
        }
    }, [reorderQueue]);

    const handleRemove = useCallback((id: string) => {
        remove(id);
    }, [remove]);

    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<QueueItem>) => {
        return (
            <QueueItemRow
                item={item}
                drag={drag}
                isActive={isActive}
                onRemove={handleRemove}
            />
        );
    }, [handleRemove]);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    }), []);

    if (upNextQueue.length === 0) {
        return (
            <View className="flex-1 items-center justify-center">
                <Ionicons name="musical-notes-outline" size={48} color="#525252" />
                <Text className="text-neutral-500 font-medium text-lg mt-4">
                    No songs in queue
                </Text>
                <Text className="text-neutral-600 font-medium text-sm mt-1">
                    Add songs to see them here
                </Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {current && (
                <View className="mb-4 pb-4 border-b border-neutral-800">
                    <Text className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-2">
                        Now Playing
                    </Text>
                    <View className="flex flex-row items-center gap-x-3">
                        <Image
                            source={{ uri: current.image }}
                            style={{ width: 48, height: 48, borderRadius: 8 }}
                            contentFit="cover"
                        />
                        <View className="flex-1 flex flex-col gap-y-0.5">
                            <Text
                                className="text-white font-semibold"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {current.name}
                            </Text>
                            <Text
                                className="text-neutral-400 font-medium text-sm"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {current.album.name}
                            </Text>
                        </View>
                        <Text className="text-neutral-400 font-medium text-sm w-12">
                            {albumDuration(current.duration)}
                        </Text>
                    </View>
                </View>
            )}
            <Text className="text-neutral-400 font-semibold text-xs uppercase tracking-wider mb-2">
                Up Next • {upNextQueue.length} {upNextQueue.length === 1 ? 'song' : 'songs'}
            </Text>
            <DraggableFlatList
                data={upNextQueue}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                onDragEnd={handleDragEnd}
                activationDistance={5}
                containerStyle={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                getItemLayout={getItemLayout}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
            />
        </GestureHandlerRootView>
    );
});

UpNext.displayName = 'UpNext';


