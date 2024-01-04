interface DataDisplayProps{
    songDuration: string,
    playlistLikes: number,
    name: string,
    owner: string,
    isPublic: boolean,
    topArtist: {
        name: string,
        number: number
    },
    trackCount: number
}

export default function DataDisplay({ songDuration, playlistLikes, name, owner, isPublic, topArtist, trackCount }: DataDisplayProps){
    return(
        <ul>
            <li>Song duration: {songDuration}</li>
            <li>Likes: {playlistLikes}</li>
            <li>Playlist name: {name}</li>
            <li>Song duration: {owner}</li>
            <li>Is it public: {isPublic == true ? "Yes" : "No"}</li>
            <li>Top artist: {topArtist["name"]} with {topArtist["number"]} songs</li>
            <li>Song number: {trackCount}</li>
        </ul>
    )
}