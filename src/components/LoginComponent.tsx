import { useState } from "react"

export default function LoginComponent(){
    const [username, setUsername] = useState(localStorage.getItem("username"))

    if(!username){
        return(
            <a href={window.location.href + "login"} className="button">Log in with Spotify</a>
        )
    }else{
        return(
            <h2>Logged in as {username}</h2>
        )
    }
}