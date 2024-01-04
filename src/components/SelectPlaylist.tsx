import { useState, useEffect } from "react"
import PlaylistList from "./PlaylistList"

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

export default function SelectPlaylist(){
    const [visibility, setVisibility] = useState("hidden")
    const [data, setData] = useState(false)

    useEffect(() => {
        async function getData(){
            let response = await getPlaylists()
            setData(response)
        }
        getData()
    }, [])

    return(
        <div id="selectPlaylistBox" className="centered">
            <button onClick={() => setVisibility(visibility == "hidden" ? "visible" : "hidden")} id="selectPlaylistButton" className="hoverAnimation centered">Select playlist</button>
            <div className={visibility + " centered"} id="playlistContainer" onClick={async details => {
                if(!details.target.alt){
                    return
                }
                console.log(await getPlaylistDetails(details.target.alt))
            }}>
                {
                    !data ? (
                        <p>Loading...</p>
                    ) : (
                        <PlaylistList playlists={data}/>
                    )
                }
            </div>
        </div>
    )
}