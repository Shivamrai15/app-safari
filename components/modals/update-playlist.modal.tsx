import axios from "axios";
import { useState } from "react";
import { router } from "expo-router";
import { Modal, Text, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PROTECTED_BASE_URL } from "@/constants/api.config";
import { useAuth } from "@/hooks/use-auth";
import { PlaylistResponse } from "@/types/response.types";
import { PrimaryLoader } from "../ui/loader";

interface Props {
    isModalVisible: boolean;
    onCloseModal: () => void;
    data: PlaylistResponse
}

export const UpdatePlaylistModal = ({ isModalVisible, onCloseModal, data }: Props) => {
    
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [playlistName, setPlaylistName] = useState<string>(data.name);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async () => {
            const response = await axios.patch(
                `${PROTECTED_BASE_URL}/api/v2/playlist/${data.id}`,
                {
                    name: playlistName,
                    private: data.private,
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
        onSuccess : async( ) => {
            await queryClient.invalidateQueries({ queryKey: ['user-playlists'] });
            await queryClient.invalidateQueries({ queryKey: ["playlist", data.id]});
            onCloseModal();
        }
    });


    
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={onCloseModal}
        >
            <SafeAreaView
                className="flex-1 flex-col gap-y-4 bg-background justify-center items-center px-4"
            >
                {
                    isPending ? (
                        <PrimaryLoader />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-2xl">Create Playlist</Text>
                            <TextInput
                                className="mt-4 w-full border-b-2 border-zinc-700"
                                placeholder="Enter playlist name"
                                placeholderTextColor="#ffffff"
                                style={{ color: 'white', fontSize: 20 }}
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.nativeEvent.text)}
                            />
                            <Button
                                variant="secondary"
                                className="w-full h-16 rounded-full"
                                disabled={playlistName.trim().length === 0}
                                onPress={async() => mutateAsync()}
                            >
                                <Text className="text-white font-semibold text-xl">Update</Text>
                            </Button>
                        </>
                    )
                }
            </SafeAreaView>
        </Modal>
    )
}
