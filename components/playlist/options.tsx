import axios from 'axios';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/hooks/use-settings';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { DeleteModal } from '../modals/delete.modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PROTECTED_BASE_URL } from '@/constants/api.config';
import { PlaylistResponse } from '@/types/response.types';
import { ActionModal } from '../modals/action.modal';


interface Props {
    data : PlaylistResponse
    onEditPress : () => void
}

export const Options = ({ data, onEditPress }: Props) => {

    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { settings } = useSettings();
    const { user } = useAuth();
    const [ openDeleteModal, setOpenDeleteModal ] = useState(false);
    const [ openActionModal, setOpenActionModal ] = useState(false);
    
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [], []);
    
    const isActive = settings?.subscription.isActive;

    const handleOpen = useCallback(() => {
        sheetRef.current?.present();
    }, []);

    const handleClose = useCallback(() => {
        sheetRef.current?.dismiss();
    }, []);

    const handleDelete = useCallback(() => {
        handleClose();
        setOpenDeleteModal(true);
    }, []);

    const handleDeleteMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${PROTECTED_BASE_URL}/api/v2/playlist/${data.id}`, {
                headers : {
                    Authorization : `Bearer ${user?.tokens.accessToken}`,
                    'Content-Type' : 'application/json'
                }
            });
            return response;
        },
        onSuccess: async() => {
            handleClose();
            setOpenDeleteModal(false);
            await queryClient.invalidateQueries({ queryKey: ['user-playlists'] }),
            router.back();
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handleVisibilityMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.patch(
                `${PROTECTED_BASE_URL}/api/v2/playlist/${data.id}`,
                {
                    name: data.name,
                    private: !data.private,
                    description: data.description||undefined
                },
                {
                    headers : {
                        Authorization : `Bearer ${user?.tokens.accessToken}`,
                        'Content-Type' : 'application/json'
                    }
                }
            );
            return response;
        },
        onSuccess: async() => {
            await queryClient.invalidateQueries({ queryKey: ["playlist", data.id]});
            setOpenActionModal(false);
        },
        onError: (error) => {
            console.log(error.message);
        }
    });

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpen}
            >
                <Image source={require("@/assets/icons/more.png")} style={{ width: 22, height: 22 }} />
            </TouchableOpacity>

            <BottomSheetModal
                ref={sheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={{
                    backgroundColor: '#191919',
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                }}
                handleIndicatorStyle={{ backgroundColor: '#666' }}
            >
                <BottomSheetView
                    style={{
                        flex: 1,
                        paddingBottom: insets.bottom,
                    }}
                >
                    <View className='flex flex-row items-center gap-4 p-4 border-b border-zinc-600'>
                        <Image
                            source={data.image? { uri: data.image } : require("@/assets/icons/playlist.png")}
                            style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden" }}
                            contentFit='cover'
                        />
                        <View className="flex flex-col gap-y-2">
                            <Text className="text-white text-xl font-bold">{data.name}</Text>
                            <Text className="text-zinc-300 text-base font-medium">Created by {user?.user.name}</Text>
                        </View>
                    </View>
                    <View className='px-4 py-8 flex flex-col gap-y-5'>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex flex-row items-center justify-between gap-2"
                            disabled={!isActive}
                        >
                            <View className={cn("flex flex-row items-center gap-4", !isActive && "opacity-50")}>
                                <Image source={require("@/assets/icons/download.png")} style={{ width: 26, height: 26 }} />
                                <Text className="text-white text-lg font-semibold">Download</Text>
                            </View>
                            <View className='flex items-center gap-3'>
                                <Text className="text-base font-semibold text-red-500">Premium Only</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex flex-row items-center gap-4"
                            onPress={()=>{
                                handleClose();
                                onEditPress();
                            }}
                        >
                            <Image source={require("@/assets/icons/pen-clip.png")} style={{ width: 22, height: 22, marginRight: 4 }} />
                            <Text className="text-white text-lg font-semibold">Edit Playlist</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex flex-row items-center gap-4"
                        >
                            <Image source={require("@/assets/icons/add.png")} style={{ width: 26, height: 26 }} />
                            <Text className="text-white text-lg font-semibold">Add to Library</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex flex-row items-center gap-4"
                            onPress={handleDelete}
                        >
                            <Image source={require("@/assets/icons/trash.png")} style={{ width: 26, height: 26 }} />
                            <Text className="text-white text-lg font-semibold">Delete Playlist</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex flex-row items-center gap-4"
                            onPress={()=>{
                                handleClose();
                                setOpenActionModal(true);
                            }}
                        >
                            <Image source={require("@/assets/icons/lock.png")} style={{ width: 22, height: 22, marginRight: 4 }} />
                            <Text className="text-white text-lg font-semibold">Make { data.private ? "Public" : "Private"}</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
            <DeleteModal
                visible={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                title="Delete Playlist"
                message="Are you sure you want to delete this playlist?"
                onDelete={()=>handleDeleteMutation.mutate()}
                isPending={handleDeleteMutation.isPending}
            />
            <ActionModal
                visible={openActionModal}
                onClose={() => setOpenActionModal(false)}
                title={`Make playlist ${data.private ? "public" : "private"}`}
                message={data.private ? "This playlist is public — anyone can view it." : "This playlist is private — only you and the people you invite can view it."}
                onConfirm={()=>handleVisibilityMutation.mutate()}
                action={`Make ${data.private ? "public" : "private"}`}
                pendingAction={`Making ${data.private ? "public" : "private"}`}
                isPending={handleVisibilityMutation.isPending}
            />
        </>
    )
}