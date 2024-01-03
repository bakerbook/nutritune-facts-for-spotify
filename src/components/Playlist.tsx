export default function Playlist({ playlistName, playlistIcon }){
    return(
        <div class="playlist">
            <img src={playlistIcon} alt={playlistName}></img>
            <p>{playlistName}</p>
        </div>
    )
}