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
    const response = await fetch(window.location.href.split("#")[0] + "api/getToken", {
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
            <div className="mainContent">
                <a href={window.location.href.split("#")[0] + "login"} className="centered button hoverAnimation">Log in with Spotify</a>
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
                    <div className="mainContent">
                        <h2>Logged in as {username}</h2>
                        <button className="redButton hoverAnimation" onClick={logout}>Log out</button>
                        <SelectPlaylist />
                    </div>
                )
            })
        }else{
            return(
                <div className="mainContent">
                    <h2>Logged in as {username}</h2>
                    <button className="redButton hoverAnimation" onClick={logout}>Log out</button>
                    <SelectPlaylist />
                </div>
            )
        }
    }
}