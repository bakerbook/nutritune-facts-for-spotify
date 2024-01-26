import { useState } from "react"
import SelectPlaylist from "./SelectPlaylist"

function logout(){
    localStorage.setItem("username", "null")
    localStorage.setItem("refresh_token", "null")
    localStorage.setItem("access_token", "null")
    localStorage.setItem("user_id", "null")
    window.location.reload()
}

async function getNewToken(){
    const response = await fetch(document.location.href + "getToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "refresh_token": localStorage.getItem("refresh_token") })
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
            localStorage.setItem("refresh_token", urlParams.get("refresh_token"))
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
        document.location.href = document.location.href.split("?")[0];
    }

    const username = localStorage.getItem("username") || "null"
    const refreshToken = localStorage.getItem("refresh_token") || "null"

    if(refreshToken == "null" || username == "null"){
        return(
            <a href={window.location.href + "login"} className="centered button hoverAnimation">Log in with Spotify</a>
        )
    }else{
        if(Date.now() > JSON.parse(accessToken)["expiration"]){
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
                    <div>
                        <h2>Logged in as {username}</h2>
                        <button className="redButton hoverAnimation" onClick={logout}>Log out</button>
                        <SelectPlaylist />
                    </div>
                )
            })
        }else{
            return(
                <div>
                    <h2>Logged in as {username}</h2>
                    <button className="redButton hoverAnimation" onClick={logout}>Log out</button>
                    <SelectPlaylist />
                </div>
            )
        }
    }
}