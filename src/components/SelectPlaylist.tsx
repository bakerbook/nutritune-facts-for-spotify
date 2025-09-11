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
        <div className="space-y-8">
            <div className="text-center">
                <button 
                    onClick={() => setVisibility(visible == false ? true : false)} 
                    className="bg-[#1DB954] hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Browse Your Playlists</span>
                </button>
            </div>
            
            {
                visible == true ? (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose a Playlist</h3>
                            <p className="text-gray-600">Select a playlist to analyze its musical insights and statistics.</p>
                        </div>
                        
                        <div 
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 max-h-96 overflow-y-auto p-2"
                            onClick={details => {
                                // Find the closest playlist container
                                const playlistElement = details.target.closest('[data-playlist-id]')
                                if(!playlistElement || playlistElement == selected){
                                    return
                                }
                                if(selected){
                                    selected.className = selected.className.replace(" ring-4 ring-[#1DB954] ring-offset-2 ring-offset-white", "")
                                }
                                playlistElement.className += " ring-4 ring-[#1DB954] ring-offset-2 ring-offset-white"
                                setSelected(playlistElement)
                            }}
                        >
                            {
                                !playlists ? (
                                    <div className="col-span-full flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954]"></div>
                                        <span className="ml-3 text-gray-600">Loading playlists...</span>
                                    </div>
                                ) : (
                                    <PlaylistList playlists={playlists}/>
                                )
                            }
                        </div>
                        
                        <div className="text-center">
                            <button 
                                onClick={() => {
                                    if(selected) {
                                        const playlistId = selected.getAttribute('data-playlist-id')
                                        getPlaylistDetails(playlistId)
                                        setVisibility(false)
                                    }
                                }} 
                                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selected}
                            >
                                Analyze This Playlist
                            </button>
                        </div>
                    </div>
                ) : (
                    null
                )
            }
            
            <div className="min-h-[400px]">
                {
                    state === "none" ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Analyze?</h3>
                            <p className="text-gray-600">Select a playlist above to discover its musical insights and statistics.</p>
                        </div>
                    ) : state === "loading" ? (
                        <Loading />
                    ) : state === "loaded" ? (
                        <DataDisplay userProfilePicture={canvasData["user_profile_picture"]} durationData={canvasData["duration_data"]} topGenre={canvasData["top_genre"]} genrePercentage={canvasData["genre_percentage"]} name={canvasData["playlist_name"]} owner={canvasData["playlist_owner"]} topArtist={canvasData["top_artist"]} trackCount={canvasData["track_count"]} icon={canvasData["playlist_icon"]} />
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-red-900 mb-2">Error Occurred</h3>
                            <p className="text-red-700">Something went wrong while processing your request. Please try again.</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}