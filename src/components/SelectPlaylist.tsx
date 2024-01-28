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
    const [state, setState] = useState("none")
    let selected = null

    async function getPlaylistDetails(id: string){
        await setState("loading")
        const response = await fetch(document.location.href + "getPlaylistDetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "access_token": localStorage.getItem("access_token"), "playlist_id": id })
        })
        const data = await response.json()
        if(data["error"]){
            alert(`Error ${data["error"]}`)
            localStorage.clear()
            window.location.reload()
        }
        await setCanvasData(data)
        await setState("loaded")
    }

    useEffect(() => {
        async function getData(){
            let response = await getPlaylists()
            if(response["error"]){
                alert(`Error ${response["error"]}`)
                localStorage.clear()
                window.location.reload()
            }
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
                    state === "none" ? (
                        <h3>Select a playlist</h3>
                    ) : state === "loading" ? (
                        <h3 >LOADING...</h3>
                    ) : state === "loaded" ? (
                        <DataDisplay userProfilePicture={canvasData["user_profile_picture"]} durationData={canvasData["duration_data"]} topGenre={canvasData["top_genre"]} genrePercentage={canvasData["genre_percentage"]} name={canvasData["playlist_name"]} owner={canvasData["playlist_owner"]} topArtist={canvasData["top_artist"]} trackCount={canvasData["track_count"]} icon={canvasData["playlist_icon"]} />
                    ) : (
                        <h3 className="error">ERROR</h3>
                    )
                }
            </div>
        </div>
    )
}