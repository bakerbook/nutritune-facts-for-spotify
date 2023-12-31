import { useState } from "react"

export default function LoginComponent(){
    const [username, setUsername] = useState(localStorage.getItem("username"))
    if(!username){
        return(
            <a href="http://localhost:3000/login" className="button">Log in with Spotify</a>
        )
    }else{
        return(
            <h2>Logged in as {username}</h2>
        )
    }
}