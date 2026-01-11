import {
	View,
	Text,
	Pressable,
	TouchableOpacity,
	AppState,
} from 'react-native';
import { Image } from 'expo-image';
import { useQueue } from '@/hooks/use-queue';
import { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { MarqueeText } from '@/components/ui/marquee-text';
import { PauseIcon, PlayIcon } from '@/constants/icons';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Sheet } from './sheet';
import { useSettings } from '@/hooks/use-settings';
import { usePlayer } from '@/hooks/use-player';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerService } from '@/services/player.service';
import { useAiRecommendationStore } from '@/hooks/use-ai-recommendation';
import { ADS } from '@/constants/ads';
import { Ad } from '@/types/auth.types';
import usePlayerSettings from '@/hooks/use-player-settings';
import { useSleepTimer } from '@/hooks/use-sleep-timer';


interface Props {
	bottom: number;
	isOffline: boolean;
}

export const Player = ({ bottom, isOffline }: Props) => {

	const { user } = useAuth();
	const { settings } = useSettings();
	const { current, queue, deQueue } = useQueue();
	const [isOpen, setIsOpen] = useState(false);
	const { isLooped, isAiShuffled } = usePlayerSettings();
	const { setIsPlaying, setSongId } = usePlayer();

	const {
		onSongStart,
		checkAndTrackAfterDelay,
		checkShouldShowAd,
		setAdShown
	} = usePlayerService();

	const { fetchRecommendations } = useAiRecommendationStore();

	const [isPlayingAd, setIsPlayingAd] = useState(false);
	const [currentAd, setCurrentAd] = useState<Ad | null>(null);
	const pendingSongUrl = useRef<string | null>(null);

	const player = useAudioPlayer('');
	const status = useAudioPlayerStatus(player);

	const hasAutoPlayed = useRef(false);
	const currentSongUrl = useRef<string | null>(null);
	const trackingTimeoutRef = useRef<number | null>(null);
	const lockScreenInitialized = useRef(false);
	const sleepTimerIntervalRef = useRef<number | null>(null);

	const {
		isActive: isSleepTimerActive,
		endOfTrack: sleepTimerEndOfTrack,
		remainingTime: sleepTimerRemainingTime,
		updateRemainingTime,
		onTimerComplete,
		hydrateFromStorage: hydrateSleepTimer,
	} = useSleepTimer();

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
		hydrateSleepTimer();
	}, []);

	useEffect(() => {
		if (!isSleepTimerActive || sleepTimerEndOfTrack) {
			if (sleepTimerIntervalRef.current) {
				clearInterval(sleepTimerIntervalRef.current);
				sleepTimerIntervalRef.current = null;
			}
			return;
		}

		sleepTimerIntervalRef.current = setInterval(() => {
			updateRemainingTime();
			const remaining = useSleepTimer.getState().remainingTime;
			if (remaining <= 0 && player.currentTime > 0) {
				player.pause();
				setIsPlaying(false);
				onTimerComplete();
			}
		}, 1000);

		return () => {
			if (sleepTimerIntervalRef.current) {
				clearInterval(sleepTimerIntervalRef.current);
				sleepTimerIntervalRef.current = null;
			}
		};
	}, [isSleepTimerActive, sleepTimerEndOfTrack, updateRemainingTime, player, setIsPlaying, onTimerComplete]);

	useEffect(() => {
		if (sleepTimerRemainingTime === 0 && isSleepTimerActive && !sleepTimerEndOfTrack) {
			player.pause();
			setIsPlaying(false);
			onTimerComplete();
		}
	}, [sleepTimerRemainingTime, isSleepTimerActive, sleepTimerEndOfTrack]);

	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'active' && isSleepTimerActive && !sleepTimerEndOfTrack) {
				updateRemainingTime();
			}
		});

		return () => {
			subscription.remove();
		};
	}, [isSleepTimerActive, sleepTimerEndOfTrack, updateRemainingTime]);

	useEffect(() => {
		if (current && player && !lockScreenInitialized.current) {
			try {
				if (typeof player.setActiveForLockScreen === 'function') {
					player.setActiveForLockScreen(true, {
						title: current.name,
						albumTitle: current.album.name,
						artworkUrl: current.image,
					});
					lockScreenInitialized.current = true;
				}
			} catch (error) {
				console.warn('Lock screen controls not available:', error);
			}
		}
	}, [current, player]);

	useEffect(() => {
		if (current && player && lockScreenInitialized.current) {
			try {
				if (typeof player.updateLockScreenMetadata === 'function') {
					player.updateLockScreenMetadata({
						title: current.name,
						albumTitle: current.album.name,
						artworkUrl: current.image,
					});
				}
			} catch (error) {
				console.warn('Failed to update lock screen metadata:', error);
			}
		}
	}, [current?.id]);

	const isPlaying = status.playing;
	const isSubscribed = settings?.subscription?.isActive ?? false;
	const isAiRecommendationEnabled = settings?.subscription.isActive ? isAiShuffled : false;


	useEffect(() => {
		if (current && current?.url && current.url !== currentSongUrl.current) {
			const needsAd = !isOffline && checkShouldShowAd(isSubscribed);

			if (needsAd && ADS.length > 0) {
				const randomAd = ADS[Math.floor(Math.random() * ADS.length)];
				setCurrentAd(randomAd);
				setIsPlayingAd(true);
				pendingSongUrl.current = current.url;

				player.replace(randomAd.url);
				hasAutoPlayed.current = false;
				currentSongUrl.current = randomAd.url;
				setIsPlaying(true);
			} else {

				player.replace(current.url);
				setSongId(current.id);
				hasAutoPlayed.current = false;
				currentSongUrl.current = current.url;
				setIsPlaying(true);

				onSongStart(current.id);

				// Fetch AI recommendations if queue is low
				// if (!isOffline && queue.length < 3 && current.id) {
				// 	fetchRecommendations(current.id, {
				// 		isAiRecommendationEnabled: isAiRecommendationEnabled,
				// 		currentIsPlaying: true
				// 	});
				// }

				if (trackingTimeoutRef.current) {
					clearTimeout(trackingTimeoutRef.current);
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
		if (isAiRecommendationEnabled && current?.id && !isOffline && queue.length < 3) {
			fetchRecommendations(current.id, {
				isAiRecommendationEnabled: isAiRecommendationEnabled,
				currentIsPlaying: true
			});
		}
	}, [isAiRecommendationEnabled, queue.length]);

	useEffect(() => {
		if (status.isLoaded && !hasAutoPlayed.current) {
			const shouldAutoPlay = isPlayingAd
				? currentAd?.url === currentSongUrl.current
				: current?.url === currentSongUrl.current;

			if (shouldAutoPlay) {
				player.play();
				hasAutoPlayed.current = true;
			}
		}
	}, [status.isLoaded, status.playing, isPlayingAd]);

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
		if (player.currentStatus.didJustFinish) {
			if (isPlayingAd) {
				setAdShown();
				setIsPlayingAd(false);
				setCurrentAd(null);

				if (pendingSongUrl.current && current) {
					player.replace(pendingSongUrl.current);
					setSongId(current.id);
					hasAutoPlayed.current = false;
					currentSongUrl.current = pendingSongUrl.current;
					pendingSongUrl.current = null;
					setIsPlaying(true);

					onSongStart(current.id);

					if (trackingTimeoutRef.current) {
						clearTimeout(trackingTimeoutRef.current);
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
			} else if (isSleepTimerActive && sleepTimerEndOfTrack) {
				player.pause();
				setIsPlaying(false);
				onTimerComplete();
			} else if (!isLooped) {
				deQueue();
				if (queue.length > 0) {
					hasAutoPlayed.current = false;
				}
			}
		}
	}, [player.currentStatus.didJustFinish, isLooped, queue.length, isPlayingAd, isSleepTimerActive, sleepTimerEndOfTrack]);

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
						backgroundColor: isPlayingAd && currentAd ? currentAd.color : current.album.color,
					}}
					onPress={() => setIsOpen(true)}
				>
					<Progress
						value={status.isLoaded ? (status.currentTime / status.duration) * 100 : 0}
						variant='danger'
						size='sm'
					/>
					<View className='flex-1 flex-row justify-between gap-x-4 items-center p-1.5 pr-6'>
						<View className='flex-1 flex flex-row items-center gap-x-4'>
							<View className='h-full aspect-square my-2 rounded-lg overflow-hidden'>
								<Image
									source={{ uri: isPlayingAd && currentAd ? currentAd.image : current.album.image }}
									style={{
										height: "100%",
										width: "100%",
									}}
									contentFit='contain'
								/>
							</View>
							<View className='flex-1 flex flex-col'>
								<MarqueeText
									text={isPlayingAd && currentAd ? currentAd.name : current.name}
									className='text-white font-semibold'
								/>
								<Text className='text-neutral-300 text-sm' numberOfLines={1} ellipsizeMode='tail'>
									{isPlayingAd ? 'Advertisement' : current.album.name}
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
				isAdvertisement={isPlayingAd}
				advertisement={currentAd ?? undefined}
			/>
		</>
	)
}