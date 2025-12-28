import {
	View,
	Text,
	Pressable,
	TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useQueue } from '@/hooks/use-queue';
import { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { PauseIcon, PlayIcon } from '@/constants/icons';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Sheet } from './sheet';
import { useSettings } from '@/hooks/use-settings';
import usePlayerSettings from '@/hooks/use-player-settings';
import { usePlayer } from '@/hooks/use-player';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerService } from '@/services/player.service';


interface Props {
	bottom: number;
	isOffline: boolean;
}

export const Player = ({ bottom, isOffline }: Props) => {

	const { user } = useAuth();
	const { settings } = useSettings();
	const { current, queue, deQueue } = useQueue();
	const [isOpen, setIsOpen] = useState(false);
	const { isLooped } = usePlayerSettings();
	const { setIsPlaying, setSongId } = usePlayer();

	const {
		onSongStart,
		checkAndTrackAfterDelay,
		checkShouldShowAd,
		shouldShowAd
	} = usePlayerService();

	const player = useAudioPlayer(current?.url || '');
	const status = useAudioPlayerStatus(player);

	const hasAutoPlayed = useRef(false);
	const currentSongUrl = useRef<string | null>(null);
	const trackingTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		const configureAudio = async () => {
			try {
				await setAudioModeAsync({
					shouldPlayInBackground: true,
					interruptionMode: "doNotMix",
					interruptionModeAndroid: "doNotMix",
					shouldRouteThroughEarpiece: false,
					playsInSilentMode: true,
				});
			} catch (error) {
				console.error('Failed to configure audio session:', error);
			}
		};
		configureAudio();
	}, []);

	const isPlaying = status.playing;
	const isSubscribed = settings?.subscription?.isActive ?? false;

	useEffect(() => {
		if (current?.url && current.url !== currentSongUrl.current) {
			player.replace(current.url);
			setSongId(current.id);
			hasAutoPlayed.current = false;
			currentSongUrl.current = current.url;
			setIsPlaying(true);

			onSongStart(current.id);

			if (trackingTimeoutRef.current) {
				clearTimeout(trackingTimeoutRef.current);
			}

			if (!isOffline) {
				checkShouldShowAd(isSubscribed);
			}

			if (!isOffline && user?.tokens?.accessToken) {
				trackingTimeoutRef.current = setTimeout(() => {
					checkAndTrackAfterDelay(
						current.id,
						user.tokens.accessToken,
						settings?.privateSession
					);
				}, 5000);
			}
		}
	}, [current?.url]);

	useEffect(() => {
		return () => {
			if (trackingTimeoutRef.current) {
				clearTimeout(trackingTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (status.isLoaded && !hasAutoPlayed.current && current?.url === currentSongUrl.current) {
			player.play();
			hasAutoPlayed.current = true;
		}
	}, [status.isLoaded, status.playing]);

	useEffect(() => {
		player.loop = isLooped;
	}, [isLooped])

	const togglePlayback = () => {
		if (isPlaying) {
			player.pause();
			setIsPlaying(false);
		} else {
			player.play();
			setIsPlaying(true);
		}
	};

	useEffect(() => {
		if (player.currentStatus.didJustFinish && !isLooped) {
			deQueue();
			if (queue.length > 0) {
				hasAutoPlayed.current = false;
			}
		}
	}, [player.currentStatus.didJustFinish, isLooped, queue.length]);


	if (!current) return null;

	return (
		<>
			<View
				style={{
					position: 'absolute',
					bottom: 72 + bottom,
					left: 0,
					right: 0,
					zIndex: 80,
					height: 48,
					padding: 6
				}}
			>
				<Pressable
					className='h-16 w-full rounded-xl relative flex flex-col overflow-hidden'
					style={{
						backgroundColor: current.album.color,
					}}
					onPress={() => setIsOpen(true)}
				>
					<Progress
						value={status.isLoaded ? (status.currentTime / status.duration) * 100 : 0}
						variant='danger'
						size='sm'
					/>
					<View className='flex-1 flex-row justify-between items-center p-2 px-3'>
						<View className='flex-1 flex flex-row items-center gap-x-4'>
							<View className='h-full aspect-square my-2 rounded-lg overflow-hidden'>
								<Image
									source={{ uri: current.album.image }}
									style={{
										height: "100%",
										width: "100%",
									}}
									contentFit='contain'
								/>
							</View>
							<View className='flex-1 flex flex-col'>
								<Text className='text-white font-semibold' numberOfLines={1} ellipsizeMode='tail'>
									{current.name}
								</Text>
								<Text className='text-neutral-300 text-sm' numberOfLines={1} ellipsizeMode='tail'>
									{current.album.name}
								</Text>
							</View>
						</View>
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={togglePlayback}
						>
							<Image source={isPlaying ? PauseIcon : PlayIcon} style={{ width: 22, height: 22 }} />
						</TouchableOpacity>
					</View>
				</Pressable>
			</View>
			<Sheet
				data={current}
				isOpen={isOpen}
				position={player.currentTime}
				isPlaying={isPlaying}
				isSubscribed={isSubscribed}
				onClose={() => setIsOpen(false)}
				handlePlayPause={togglePlayback}
				onSeek={(number) => player.seekTo(number)}
				isOffline={isOffline}
			/>
		</>
	)
}