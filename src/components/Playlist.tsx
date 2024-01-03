async function getPlaylistDetails(id: string){
    const response = await fetch(document.location.href + "getPlaylistDetails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "access_token": localStorage.getItem("access_token"), "playlist_id": id })
    })
    const data = await response.json()
    return data
}

export default function Playlist({ name, icon, playlistId }){
    return(
        <div class="playlist" onClick={async details => {
            console.log(await getPlaylistDetails(details["target"]["alt"]))
        }}>
            <img className="hoverAnimation" src={icon} alt={playlistId}></img>
            <p>{name}</p>
        </div>
    )
}