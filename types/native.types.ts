export type SearchHistory = {
    id: string;
    name: string;
    image: string;
    content_id: string;
    type: "ARTIST" | "ALBUM" | "SONG" | "PLAYLIST";
    created_at: Date;
}