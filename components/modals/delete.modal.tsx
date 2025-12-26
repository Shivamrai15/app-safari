import { View, Text, Modal } from 'react-native';
import { Button } from '@/components/ui/button';


interface Props {
    title: string;
    message: string;
    visible: boolean;
    isPending: boolean;
    onClose: () => void;
    onDelete: () => void;
}


export const DeleteModal = ({
    title,
    message,
    visible,
    isPending,
    onClose,
    onDelete
}: Props) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className='flex-1 justify-center items-center bg-black/50 p-6'>
                <View className='h-fit rounded-3xl bg-white p-4 shadow-lg flex gap-y-10 w-full'>
                    <View className='flex gap-y-2'>
                        <Text className='text-2xl font-extrabold text-zinc-800'>
                            {title}
                        </Text>
                        <Text className='text-zinc-600 font-medium'>
                            {message}
                        </Text>
                    </View>
                    <View className='flex flex-row gap-x-3 items-center justify-end'>
                        <Button
                            variant='ghost'
                            onPress={onClose}
                        >
                            <Text className='text-zinc-800 font-semibold'>
                                Cancel
                            </Text>
                        </Button>
                        <Button
                            onPress={onDelete}
                            variant='secondary'
                            className='h-14 rounded-full text-lg'
                            disabled={isPending}    
                        >
                            <Text className='text-white font-semibold'>
                                {
                                    isPending
                                        ? "Deleting..."
                                        : "Delete"
                                }
                            </Text>
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    )
}