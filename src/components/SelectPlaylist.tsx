import { useState, useEffect } from "react"
import PlaylistList from "./PlaylistList"
import DataDisplay from "./DataDisplay"
import Loading from "./Loading"

async function getPlaylists(){
    const response = await fetch("/api/getPlaylists", {
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
    const [selected, setSelected] = useState(null)

    async function getPlaylistDetails(id: string){
        await setState("loading")
        const response = await fetch("/api/getPlaylistDetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "access_token": localStorage.getItem("access_token"), "playlist_id": id })
        })
        const data = await response.json()
        if(data["error"]){
            alert(`Error: ${data["error"]}`)
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
                alert(`Error: ${response["error"]}`)
                localStorage.clear()
                window.location.reload()
            }
            setPlaylists(response)
        }
        getData()
    }, [])

    return(
        <div className="space-y-6">
            {/* Toggle button */}
            <div>
                <button
                    onClick={() => setVisibility(!visible)}
                    className="group flex items-center gap-3 text-white font-bold text-base hover:text-[#1DB954] transition-colors duration-150"
                >
                    <div className={`w-7 h-7 border border-white/20 flex items-center justify-center transition-all duration-200 group-hover:border-[#1DB954]/50 ${visible ? 'rotate-45 border-[#1DB954]/50' : ''}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    Browse Your Playlists
                </button>
            </div>

            {/* Playlist picker */}
            {visible && (
                <div className="border border-white/[0.08]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                        <p className="text-white font-bold text-sm">Your Playlists</p>
                        <button
                            onClick={() => {
                                if(selected) {
                                    const playlistId = selected.getAttribute('data-playlist-id')
                                    getPlaylistDetails(playlistId)
                                    setVisibility(false)
                                }
                            }}
                            disabled={!selected}
                            className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm px-5 py-2 transition-colors duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                        >
                            Analyze →
                        </button>
                    </div>

                    <div
                        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 p-5 max-h-72 overflow-y-auto"
                        onClick={details => {
                            const playlistElement = details.target.closest('[data-playlist-id]')
                            if(!playlistElement || playlistElement == selected){
                                return
                            }
                            if(selected){
                                const prevTint = selected.querySelector('.pl-tint') as HTMLElement
                                const prevCheck = selected.querySelector('.pl-check') as HTMLElement
                                const prevName = selected.querySelector('.pl-name') as HTMLElement
                                if(prevTint) prevTint.style.backgroundColor = 'transparent'
                                if(prevCheck) prevCheck.style.opacity = '0'
                                if(prevName) prevName.style.color = ''
                            }
                            const tint = playlistElement.querySelector('.pl-tint') as HTMLElement
                            const check = playlistElement.querySelector('.pl-check') as HTMLElement
                            const nameEl = playlistElement.querySelector('.pl-name') as HTMLElement
                            if(tint) tint.style.backgroundColor = 'rgba(29, 185, 84, 0.2)'
                            if(check) check.style.opacity = '1'
                            if(nameEl) nameEl.style.color = '#1DB954'
                            setSelected(playlistElement)
                        }}
                    >
                        {!playlists ? (
                            <div className="col-span-full flex items-center gap-3 py-8">
                                <div className="w-1 h-4 bg-[#1DB954] eq-bar" style={{ animationDelay: '0ms' }} />
                                <div className="w-1 h-6 bg-[#1DB954] eq-bar" style={{ animationDelay: '200ms' }} />
                                <div className="w-1 h-3 bg-[#1DB954] eq-bar" style={{ animationDelay: '400ms' }} />
                                <span className="text-[#555] text-sm ml-2">Loading playlists...</span>
                            </div>
                        ) : (
                            <PlaylistList playlists={playlists}/>
                        )}
                    </div>
                </div>
            )}

            {/* State display */}
            <div>
                {state === "none" ? (
                    <div className="border border-white/[0.04] py-16 text-center">
                        <p className="text-[#444] text-sm">Select a playlist above to generate its nutrition label</p>
                    </div>
                ) : state === "loading" ? (
                    <Loading />
                ) : state === "loaded" ? (
                    <DataDisplay
                        userProfilePicture={canvasData["user_profile_picture"]}
                        durationData={canvasData["duration_data"]}
                        topGenre={canvasData["top_genre"]}
                        genrePercentage={canvasData["genre_percentage"]}
                        name={canvasData["playlist_name"]}
                        owner={canvasData["playlist_owner"]}
                        topArtist={canvasData["top_artist"]}
                        trackCount={canvasData["track_count"]}
                        icon={canvasData["playlist_icon"]}
                    />
                ) : (
                    <div className="border border-red-900/30 bg-red-950/20 py-12 text-center">
                        <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
