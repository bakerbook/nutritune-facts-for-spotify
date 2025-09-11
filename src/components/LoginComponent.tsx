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
                "expiration": Date.now() + 3600000 //the expiration date is the current time + 60 minutes
            }))
            setAccessToken(urlParams.get("access_token"))
        }
        window.location.href = window.location.href.split("?")[0];
    }

    const username = localStorage.getItem("username") || "null"
    const refreshTokenExists = document.cookie.split(";").some((item) => item.trim().startsWith("refresh_token=")) || "null"

    if(refreshTokenExists == "null" || username == "null"){
        return(
            <div className="bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to NutriTune Facts</h2>
                            <p className="text-gray-600">Connect your Spotify account to analyze your playlists and discover interesting insights about your music taste.</p>
                        </div>
                        <a
                            href="/api/login"
                            className="inline-flex items-center justify-center w-full bg-[#1DB954] hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            Connect with Spotify
                        </a>
                    </div>
                </div>
            </div>
        )
    }else{
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
            }).then(() => {
                return(
                    <div className="min-h-screen bg-gray-50 py-8 px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {username}!</h2>
                                            <p className="text-gray-600">Ready to explore your playlist insights?</p>
                                        </div>
                                    </div>
                                    <button 
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                                        onClick={logout}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </div>
                            <SelectPlaylist />
                        </div>
                    </div>
                )
            })
        }else{
            return(
                <div className="min-h-screen bg-gray-50 py-8 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {username}!</h2>
                                        <p className="text-gray-600">Ready to explore your playlist insights?</p>
                                    </div>
                                </div>
                                <button 
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                                    onClick={logout}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                        <SelectPlaylist />
                    </div>
                </div>
            )
        }
    }
}