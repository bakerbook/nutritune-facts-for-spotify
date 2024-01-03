export default function Playlist({ name, icon }){
    return(
        <div class="playlist">
            <img src={icon} alt={name}></img>
            <p>{name}</p>
        </div>
    )
}