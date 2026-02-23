import { Href } from "expo-router";

export const AccountRoutes = [
    {
        name: "Your Profile",
        description: "Your Profile - manage account details",
        path: "/(tabs)/account/profile" as Href,
        icon: require("@/assets/accounts/user.png"),
        height: 24,
        width: 24,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Notifications",
        description: "Notifications - manage app and system notification settings",
        path: "/(tabs)/notification" as Href,
        icon: require("@/assets/accounts/bell.png"),
        height: 24,
        width: 24,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Downloads",
        description: "Downloads - view downloaded songs, albums, and playlists",
        path: "/(tabs)/downloads" as Href,
        icon: require("@/assets/accounts/download.png"),
        height: 24,
        width: 24,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Recover Playlists",
        description: "Recover Playlists - restore deleted playlists",
        path: "/(tabs)/account/recover-playlist" as Href,
        icon: require("@/assets/accounts/trash-list.png"),
        height: 24,
        width: 24,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Transaction History",
        description: "Transaction History - view billing receipts and subscriptions",
        path: "/(tabs)/account/transaction-history" as Href,
        icon: require("@/assets/accounts/receipt.png"),
        height: 24,
        width: 24,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Sleep Timer",
        description: "Sleep Timer - set a timer to stop music playback",
        path: "/(tabs)/timer" as Href,
        icon: require("@/assets/accounts/alarm-clock.png"),
        height: 24,
        width: 24,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Private Sessions",
        description: "Private Sessions - manage private listening sessions",
        path: "/(tabs)/account/profile" as Href,
        icon: require("@/assets/accounts/incognito.png"),
        height: 24,
        width: 24,
        isFeatured: false,
        isActive: true
    },
    {
        name: "Recommend Songs",
        description: "Recommend Songs - get AI-based song recommendations",
        path: "/(tabs)/account/profile" as Href,
        icon: require("@/assets/accounts/ai.png"),
        height: 24,
        width: 24,
        isFeatured: false,
        isActive: true
    },
    {
        name: "Privacy & Policy",
        description: "Privacy & Policy - read privacy policy and terms",
        path: "/(tabs)/account/privacy-policy" as Href,
        icon: require("@/assets/accounts/contract.png"),
        height: 24,
        width: 24,
        isFeatured: false,
        isActive: true
    },
    {
        name: "Support",
        description: "Support - get help, contact support, and FAQs",
        path: "/(tabs)/account/support" as Href,
        icon: require("@/assets/accounts/support.png"),
        height: 24,
        width: 24,
        isFeatured: false,
        isActive: false
    }
];