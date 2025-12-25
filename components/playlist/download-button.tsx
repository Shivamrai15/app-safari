import { useSettings } from '@/hooks/use-settings'
import { cn } from '@/lib/utils';
import { Image } from 'expo-image'
import { TouchableOpacity } from 'react-native'

interface Props {
    playlistId: string;
}

export const DownloadButton = ({ playlistId }: Props) => {
    
    const { settings } = useSettings();

    const isActive = settings?.subscription.isActive;
    
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={()=>{}}
            disabled={!isActive}
            className={cn(
                isActive ? 'opacity-100' : 'opacity-50',
            )}
        >
            <Image source={require("@/assets/icons/download.png")} style={{ width: 26, height: 26 }} />
        </TouchableOpacity>
    )
}