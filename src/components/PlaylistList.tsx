import Playlist from "./Playlist"

export default function PlaylistList({ playlists }){
    const playlistItems = playlists.map(playlist => <Playlist name={playlist.name} icon={playlist.cover} playlistId={playlist.id} />)
    return(
        <ul>{playlistItems}</ul>
    )
}