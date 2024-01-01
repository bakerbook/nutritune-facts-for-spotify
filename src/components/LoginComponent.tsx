export default function LoginComponent(){
    function logout(){
        localStorage.setItem("username", "null")
        localStorage.setItem("refresh_token", "null")
        localStorage.setItem("user_id", "null")
        window.location.reload()
    }

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
        document.location.href = document.location.href.split("?")[0];
    }

    const username = localStorage.getItem("username") || "null"
    const refreshToken = localStorage.getItem("refresh_token") || "null"

    if(refreshToken == "null" || username == "null"){
        return(
            <a href={window.location.href + "login"} className="button">Log in with Spotify</a>
        )
    }else{
        return(
            <div id="loginBox">
                <h2>Logged in as {username}</h2>
                <button onClick={logout}>Log out</button>
            </div>
        )
    }
}