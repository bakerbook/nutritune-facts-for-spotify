import Playlist from "./Playlist"

export default function PlaylistList({ playlists }){
    const playlistItems = playlists.map((playlist, index) => 
        <Playlist 
            key={playlist.id || index} 
            name={playlist.name} 
            icon={playlist.cover} 
            playlistId={playlist.id} 
        />
    )
    return(
        <>{playlistItems}</>
    )
}