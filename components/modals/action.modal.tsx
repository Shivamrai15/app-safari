import { View, Text, Modal } from 'react-native';
import { Button } from '@/components/ui/button';


interface Props {
    title: string;
    message: string;
    visible: boolean;
    isPending: boolean;
    onClose: () => void;
    onConfirm: () => void;
    action : string;
    pendingAction : string;
}


export const ActionModal = ({
    title,
    message,
    visible,
    isPending,
    onClose,
    onConfirm,
    action,
    pendingAction
}: Props) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className='flex-1 justify-center items-center bg-black/50 p-4'>
                <View className='h-fit rounded-3xl bg-white p-6 shadow-lg flex gap-y-10 w-full'>
                    <View className='flex gap-y-2'>
                        <Text className='text-2xl font-extrabold text-zinc-800 text-center'>
                            {title}
                        </Text>
                        <Text className='text-zinc-600 font-medium text-center'>
                            {message}
                        </Text>
                    </View>
                    <View className='flex flex-col gap-y-4 items-center justify-end'>
                        <Button
                            onPress={onConfirm}
                            variant='secondary'
                            className='h-14 rounded-full'
                            disabled={isPending}
                        >
                            <Text className='text-white font-semibold text-lg'>
                                {
                                    isPending
                                        ? pendingAction
                                        : action
                                }
                            </Text>
                        </Button>
                        <Button
                            variant='ghost'
                            onPress={onClose}
                        >
                            <Text className='text-zinc-800 font-semibold text-lg'>
                                Cancel
                            </Text>
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    )
}