import { useState } from "react"
import SelectPlaylist from "./SelectPlaylist"

function logout(){
    localStorage.clear()
    document.cookie.split(";").forEach(item => {
        document.cookie = item.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC"
    })
    window.location.reload()
}

async function getNewToken(){
    const response = await fetch("/api/getToken", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    const data = await response.json()
    return data["access_token"]
}

const SpotifyIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
)

function LoggedOutView(){
    return(
        <div className="bg-[#0a0a0a] py-20 px-6 md:px-10 border-t border-white/[0.06]">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-10">
                <div className="max-w-sm">
                    <p className="text-[#555] text-[11px] tracking-[0.25em] uppercase font-semibold mb-5">
                        Get started
                    </p>
                    <h2 className="text-white text-3xl font-black tracking-tight leading-tight mb-4">
                        Connect your<br/>Spotify library
                    </h2>
                    <p className="text-[#666] text-sm leading-relaxed">
                        Link your account to generate a personalized nutrition label for any playlist in your library.
                    </p>
                </div>
                <div className="md:w-72">
                    <a
                        href="/api/login"
                        className="group flex items-center justify-between w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-4 px-6 transition-colors duration-150"
                    >
                        <div className="flex items-center gap-3">
                            <SpotifyIcon className="w-5 h-5" />
                            <span>Connect with Spotify</span>
                        </div>
                        <svg className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                    <p className="text-[#444] text-xs mt-3 leading-relaxed">
                        Read-only access to your playlists. No data is stored.
                    </p>
                </div>
            </div>
        </div>
    )
}

function LoggedInView({ username }: { username: string }){
    return(
        <div className="bg-[#0a0a0a] py-10 px-6 md:px-10 border-t border-white/[0.06]">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-center gap-4">
                        <div className="w-0.5 h-8 bg-[#1DB954]" />
                        <div>
                            <p className="text-[#555] text-[10px] uppercase tracking-[0.2em] mb-0.5">Listening as</p>
                            <h2 className="text-white font-bold text-lg">{username}</h2>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-[#555] hover:text-white text-sm border border-white/[0.08] hover:border-white/20 px-4 py-2 transition-all duration-150"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log out
                    </button>
                </div>
                <SelectPlaylist />
            </div>
        </div>
    )
}

export default function LoginComponent(){
    const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"))
    const urlParams = new URLSearchParams(window.location.search)

    if (urlParams.size != 0){
        if(urlParams.get("username")){
            localStorage.setItem("username", urlParams.get("username"))
        }
        if(urlParams.get("refresh_token")){
            document.cookie = `refresh_token=${urlParams.get("refresh_token")}; expires=${new Date(new Date().setMonth(new Date().getMonth() + 1)).toUTCString()}; Secure`
        }
        if(urlParams.get("user_id")){
            localStorage.setItem("user_id", urlParams.get("user_id"))
        }
        if(urlParams.get("access_token")){
            localStorage.setItem("access_token", JSON.stringify({
                "token": urlParams.get("access_token"),
                "expiration": Date.now() + 3600000
            }))
            setAccessToken(urlParams.get("access_token"))
        }
        window.location.href = window.location.href.split("?")[0];
    }

    const username = localStorage.getItem("username") || "null"
    const refreshTokenExists = document.cookie.split(";").some((item) => item.trim().startsWith("refresh_token=")) || "null"

    if(refreshTokenExists == "null" || username == "null"){
        return <LoggedOutView />
    }

    let validAccessToken;
    try{
        validAccessToken = (JSON.parse(accessToken)["expiration"]) ? true : false
    }catch{
        validAccessToken = false
    }

    if(!validAccessToken || Date.now() > JSON.parse(accessToken)["expiration"]){
        getNewToken().then((code) => {
            localStorage.setItem("access_token", JSON.stringify({
                "token": code,
                "expiration": Date.now() + 3600000
            }))
            setAccessToken(JSON.stringify({
                "token": code,
                "expiration": Date.now() + 3600000
            }))
        })
        return null
    }

    return <LoggedInView username={username} />
}
