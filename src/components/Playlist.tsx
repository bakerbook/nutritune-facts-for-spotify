export default function Playlist({ name, icon, playlistId }){
    return(
        <div class="playlist">
            <img className="hoverAnimation" src={icon} alt={playlistId}></img>
            <p>{name}</p>
        </div>
    )
}