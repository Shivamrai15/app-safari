import { useDownloads } from '@/hooks/use-downloads';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';

interface Props {
    id : string;
    size : number;
    type : "album" | "playlist";
}

export const DeleteButton = ({ id, size, type }: Props) => {
    
    const { removeAlbum, removePlaylist } = useDownloads();
    
    const handleDelete = () => {
        if (type === "album") {
            removeAlbum(id);
        } else {
            removePlaylist(id);
        }
    }
    
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDelete}
        >
            <Image
                source={require('@/assets/icons/trash.png')}
                style={{ width: size, height: size }}
                contentFit="contain"
            />
        </TouchableOpacity>
    )
}