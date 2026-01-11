import { Tabs, usePathname, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { HomeIcon,
	HomeOutlineIcon,
	BrowseIcon,
	BrowseOutlineIcon,
	PlaylistIcon,
	PlaylistOutlineIcon,
	SearchIcon,
	SearchOutlineIcon
} from "@/constants/icons";
import { useAuth } from '@/hooks/use-auth';
import { Text, View, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueue } from '@/hooks/use-queue';
import { Player } from '@/components/song/player';
import { useEffect, useRef } from 'react';


const Layout = () => {

	const pathname = usePathname();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const { current } = useQueue();
	const { isLoggedIn, user } = useAuth();

	const navigationHistory = useRef<string[]>(['/home']);

	useEffect(() => {
		if (navigationHistory.current[navigationHistory.current.length - 1] !== pathname) {
			navigationHistory.current = [...navigationHistory.current, pathname];

			if (navigationHistory.current.length > 20) {
				navigationHistory.current = navigationHistory.current.slice(-20);
			}
		}
	}, [pathname]);

	useEffect(() => {
		const backAction = () => {

			if (navigationHistory.current.length > 1) {
				navigationHistory.current = navigationHistory.current.slice(0, -1);
				const previousRoute = navigationHistory.current[navigationHistory.current.length - 1];
				router.push(previousRoute as any);
				return true;
			}
			return false;
		};

		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			backAction
		);

		return () => backHandler.remove();
	}, [pathname, router]);


	return (
		<>
			{
				current && (
					<Player
						bottom={insets.bottom}
						isOffline={pathname === "/downloads"}
					/>
				)
			}
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarShowLabel: false,
					tabBarStyle: {
						backgroundColor: "#111111",
						borderTopWidth: 0,
						height: 60 + insets.bottom,
						paddingBottom: insets.bottom,
						paddingTop: 8,
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
					},
				}}
			>
				<Tabs.Screen 
					name="home" 
					options={{ 
						tabBarIcon: ({ focused }) => {
							return focused ? (
								<Image
									source={HomeIcon}
									style={{ width: 24, height: 24 }}
								/>
							) : (
								<Image
									source={HomeOutlineIcon}
									style={{ width: 24, height: 24 }}
								/>
							)
						}
					}} 
				/>
				<Tabs.Screen 
					name="search" 
					options={{ 
						tabBarIcon: ({ focused }) => {
							return focused ? (
								<Image
									source={SearchIcon}
									style={{ width: 26, height: 26 }}
								/>
							) : (
								<Image
									source={SearchOutlineIcon}
									style={{ width: 26, height: 26 }}
								/>
							)
						}
					}}
				/>
				<Tabs.Screen 
					name="browse" 
					options={{ 
						tabBarIcon: ({ focused }) => {
							return focused ? (
								<Image
									source={BrowseIcon}
									style={{ width: 24, height: 24 }}
								/>
							) : (
								<Image
									source={BrowseOutlineIcon}
									style={{ width: 24, height: 24 }}
								/>
							)
						}
					}}
				/>
				<Tabs.Screen 
					name="playlist" 
					options={{ 
						tabBarIcon: ({ focused }) => {
							return focused ? (
								<Image
									source={PlaylistIcon}
									style={{ width: 24, height: 24 }}
								/>
							) : (
								<Image
									source={PlaylistOutlineIcon}
									style={{ width: 24, height: 24 }}
								/>
							)
						}
					}}
				/>
				<Tabs.Screen 
					name="account" 
					options={{ 
						tabBarIcon: () => {
							return (isLoggedIn && user && user.user?.image !==undefined) ? (
								<View className='size-7 rounded-full relative overflow-hidden'>
									<Image
										source={{
											uri: user.user?.image as string
										}}
										style={{ height: "100%", width: "100%" }}
									/>
								</View>
							) : (
								<View
									className='size-7 flex items-center justify-center rounded-full bg-red-900'
								>
									<Text className='text-white font-semibold'>
										S
									</Text>
								</View>
							)
						}
					}}
				/>
				<Tabs.Screen 
					name="album/[albumId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}} 
				/>
				<Tabs.Screen 
					name="artist/[artistId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="artist-songs/[artistId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="mood-songs/[moodId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="genre-songs/[genreId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="playlist-songs/[playlistId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="account/profile" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="account/delete-history" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="liked-songs" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="history" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen 
					name="downloads" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen
					name="account/recover-playlist" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen
					name="account/transaction-history" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen
					name="downloads/album/[albumId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen
					name="downloads/playlist/[playlistId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen
					name="[playlistId]" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen
					name="pricing" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
				<Tabs.Screen
					name="timer" 
					options={{
						tabBarIcon : ()=>null,
						href : null
					}}
				/>
			</Tabs>
		</>
	)
}

export default Layout;