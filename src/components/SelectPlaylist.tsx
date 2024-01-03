import { useState } from "react"
import Playlist from "./Playlist"

export default function SelectPlaylist(){
    const [visibility, setVisibility] = useState("hidden")

    return(
        <div id="selectPlaylistBox" className="centered">
            <button onClick={() => setVisibility(visibility == "hidden" ? "visible" : "hidden")} id="selectPlaylistButton" className="hoverAnimation centered">Select playlist</button>
            <div className={visibility + " centered"} id="playlistContainer">
                <Playlist playlistName={"test playlist"} playlistIcon={"none"}/>
            </div>
        </div>
    )
}