import { useState, useEffect } from "react"
import PlaylistList from "./PlaylistList"
import DataDisplay from "./DataDisplay"

async function getPlaylists(){
    const response = await fetch(document.location.href + "getPlaylists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "access_token": localStorage.getItem("access_token"), "user_id": localStorage.getItem("user_id") })
    })
    const data = await response.json()
    return data
}

export default function SelectPlaylist(){
    const [visible, setVisibility] = useState(false)
    const [playlists, setPlaylists] = useState(false)
    const [canvasData, setCanvasData] = useState(false)
    let selected = null

    async function getPlaylistDetails(id: string){
        const response = await fetch(document.location.href + "getPlaylistDetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "access_token": localStorage.getItem("access_token"), "playlist_id": id })
        })
        const data = await response.json()
        await setCanvasData(data)
    }

    useEffect(() => {
        async function getData(){
            let response = await getPlaylists()
            setPlaylists(response)
        }
        getData()
    }, [])

    return(
        <div id="selectPlaylistBox" className="centered">
            <button onClick={() => setVisibility(visible == false ? true : false)} id="selectPlaylistButton" className="hoverAnimation centered">Select playlist</button>
            {
                visible == true ? (
                    <div className="centered" id="playlistContainer" onClick={details => {
                        if(!details.target.alt || details.target == selected){
                            return
                        }
                        if(selected){
                            selected.className = selected.className.replace(" highlighted", "")
                        }
                        selected = details.target
                        selected.className += " highlighted"
                    }}>
                        {
                            !playlists ? (
                                <p>Loading...</p>
                            ) : (
                                <PlaylistList playlists={playlists}/>
                            )
                        }
                        <button onClick={() => {getPlaylistDetails(selected.alt); setVisibility(false)}} className="hoverAnimation centered">Choose this playlist</button>
                    </div>
                ) : (
                    null
                )
            }
            <div>
                {
                    !canvasData ? (
                        <p>No playlist data</p>
                    ) : (
                        <DataDisplay songDuration={canvasData["average_song_duration"]} playlistLikes={canvasData["playlist_likes"]} name={canvasData["playlist_name"]} owner={canvasData["playlist_owner"]} isPublic={canvasData["public"]} topArtist={canvasData["top_artist"]} trackCount={canvasData["track_count"]} icon={canvasData["playlist_icon"]} />
                    )
                }
            </div>
        </div>
    )
}