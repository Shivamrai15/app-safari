import { Image } from 'expo-image';
import { Button } from '@/components/ui/button';
import { ShuffleIcon } from '@/constants/icons';
import { useQueue } from '@/hooks/use-queue';

interface Props {
    height ?: number;
    width ?: number;
}

export const ShuffleButton = ({height=32, width=32}: Props) => {
    
    const { shuffle } = useQueue();
    
    return (
        <Button
            className="rounded-full size-14"
            variant='ghost'
            onPress={()=>shuffle()}
        >
            <Image source={ShuffleIcon} style={{ width: width, height: height }} />
        </Button>
    )
}
