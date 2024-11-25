import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import path from "path"
import * as dotenv from "dotenv"
import querystring from "node:querystring"
import crypto from "node:crypto"

dotenv.config()

const app = express()

const port = 3000

const __dirname = path.resolve('')

app.use("/dist", express.static(path.join(__dirname, '/dist')));
app.use(bodyParser.json())
app.use(cookieParser())

const scope = "playlist-read-private playlist-read-collaborative"

app.get("/", (req, res) => {
    res.set("Content-Security-Policy", "default-src 'self'; style-src 'self'; img-src 'self' data: *.scdn.co *.spotifycdn.com platform-lookaside.fbsbx.com")
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/login", (req, res) => {
    let state = generateRandomString(16)
    res.cookie("spotify_auth_state", state)
    res.redirect("https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: `${process.env.TEST_SITE}/callback`,
            state: state
        })
    )
})

app.get("/callback", (req, res) => {
    let code = req["query"]["code"] || null
    let state = req["query"]["state"] || null
    let storedState = req["cookies"] ? req["cookies"]["spotify_auth_state"] : null
    if(state === null || state !== storedState){
        res.redirect("/?" + querystring.stringify({ error: "state_mismatch" }))
    }else{
        const params = new URLSearchParams({
            "client_id": process.env.CLIENT_ID,
            "client_secret": process.env.CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": `${process.env.TEST_SITE}/callback`
        })
        
        fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        }).then(response => response.json()).then(async data => {
            const accessToken = data["access_token"]
            const refreshToken = data["refresh_token"]
            let profileRequest = await getProfileInformation(accessToken)
            if(profileRequest["error"]){
                res.redirect("/")
            }
            const { username, user_id } = profileRequest
            res.redirect("/?" + querystring.stringify({
                refresh_token: refreshToken,
                access_token: accessToken,
                username: username,
                user_id: user_id
            }))
        })
    }
})

app.get("/api/getToken", (req, res) => {
    const refreshToken = req["cookies"] ? req["cookies"]["refresh_token"] : null
    if(!refreshToken){
        res.send(JSON.stringify({ error: "Invalid refresh token" }))
        return
    }
    const params = new URLSearchParams({
        "grant_type": "refresh_token",
        "refresh_token": refreshToken,
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET
    })
    fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    }).then(response => response.json()).then(data => {
        res.send(JSON.stringify({ "access_token": data["access_token"] }))
    })
})

app.post("/api/getPlaylists", async (req, res) => {
    const userId = req.body["user_id"]
    if(req["body"]["access_token"] === null){
        res.send(JSON.stringify({ error: "no_access_token" }))
    }else{
        const playlists = await getPlaylists(userId, JSON.parse(req.body["access_token"])["token"])
        res.send(JSON.stringify(playlists))
    }
})

app.post("/api/getPlaylistDetails", async (req, res) => {
    const playlistId = req.body["playlist_id"]
    const accessToken = JSON.parse(req.body["access_token"])["token"]
    const data = await getPlaylistDetails(playlistId, accessToken)
    res.send(JSON.stringify(data))
})

app.listen(process.env.PORT || port, () => {
    console.log(`App listening on port ${process.env.PORT || port}`)
})

async function getProfileInformation(accessToken){
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }
    try{
        return { username: data["display_name"], user_id: data["id"], pfp: data["images"][0]["url"] }
    }catch{
        return { username: data["display_name"], user_id: data["id"], pfp: null }
    }
}

async function getPlaylists(userId, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=50&offset=0`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }
    const playlists = []
    data["items"].forEach(playlist => {
        if(playlist["tracks"]["total"] == 0){ // Don't show user playlist if it's empty
            return
        }
        if(!playlist["images"]){ // Don't show playlist if it has no cover image
            return
        }
        let cover = playlist["images"][0]["url"]
        playlists.push({
            name: playlist["name"],
            cover: cover,
            id: playlist["href"].split("playlists/")[1]
        })
    })
    return playlists
}

async function getData(total, playlistId, accessToken){
    let artistData = {}
    let genres = {}
    let totalDurationMilliseconds = 0
    let bigGenreList = []
    let durationList = []
    let idArray = []
    for(let i = 0; i < (Math.ceil(total) / 100)*100; i += 100){
        const currentSet = await getTracks(playlistId, i, accessToken)
        if(currentSet["error"]){
            return currentSet
        }
        currentSet["items"].forEach(song => {
            if(song["track"]){
                durationList.push(song["track"]["duration_ms"])
                totalDurationMilliseconds += song["track"]["duration_ms"]
                song["track"]["artists"].forEach(artist => {
                    let name = artist["name"]
                    if(!(name in artistData)){
                        artistData[name] = {
                            songNumber: 1,
                            id: artist["href"].split("artists/")[1]
                        }
                    }else{
                        artistData[name]["songNumber"] = artistData[name]["songNumber"] + 1
                    }
                    idArray.push(artist["id"])
                })
            }
        })
    }
    
    for(let i = 0; i < idArray.length; i += 50){
        const chunk = idArray.slice(i, i+50)
        let data = await getArtistGenres(chunk, accessToken)
        if(data["error"]){
            return data
        }
        bigGenreList = bigGenreList.concat(data)
    }
    
    bigGenreList.forEach(genre => {
        if(!(genre in genres)){
            genres[genre] = 1
        }else{
            genres[genre] = genres[genre] + 1
        }
    })

    const averageSongDuration = ((totalDurationMilliseconds / total) / 60000).toFixed(2)
    const durationData = {
        longer: 0,
        shorter: 0,
        average: averageSongDuration,
        averageString: null
    }

    durationList.forEach(len => {
        if(len > totalDurationMilliseconds / total){
            durationData["longer"] = durationData["longer"] + 1
        }else{
            durationData["shorter"] = durationData["shorter"] + 1
        }
    })

    return {
        artistData,
        durationData,
        genres,
        genreCount: bigGenreList.length
    }
}

async function getPlaylistDetails(playlistId, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    let data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }

    let infoRequest = await getData(data["tracks"]["total"], playlistId, accessToken)

    if(infoRequest["error"]){
        return infoRequest
    }

    let { artistData, durationData, genres, genreCount } = infoRequest

    let top_artist = {
        name: Object.keys(artistData)[0],
        number: Object.values(artistData)[0]["songNumber"],
        id: Object.values(artistData)[0]["id"]
    }
    let top_genre = {
        name: Object.keys(genres)[0],
        number: Object.values(genres)[0]
    }
    
    for(const [artistName, obj] of Object.entries(artistData)){
        if(obj["songNumber"] > top_artist["number"]){
            top_artist["number"] = obj["songNumber"]
            top_artist["name"] = artistName
            top_artist["id"] = obj["id"]
        }
    }
    for(const [name, number] of Object.entries(genres)){
        if(number > top_genre["number"]){
            top_genre["name"] = name
            top_genre["number"] = number
        }
    }

    durationData["averageString"] = String(durationData["average"].split(".")[0]) + ":" + String(durationData["average"].split(".")[1] * 60).substring(0, 2)

    let topArtistPictureRequest = await getArtistProfilePicture(top_artist["id"], accessToken)
    if(topArtistPictureRequest["error"]){
        return topArtistPictureRequest
    }
    top_artist["picture"] = topArtistPictureRequest
    delete top_artist["id"]

    let userProfilePictureRequest = await getUserProfilePicture(data["owner"]["id"], accessToken)
    if(userProfilePictureRequest["error"]){
        return userProfilePictureRequest
    }
    const userProfilePicture = userProfilePictureRequest

    const playlist_icon = data["images"][0]["url"]

    return {
        "user_profile_picture": userProfilePicture,
        "playlist_name": data["name"],
        "playlist_owner": data["owner"]["display_name"],
        "playlist_icon": playlist_icon,
        "track_count": data["tracks"]["total"],
        "top_artist": top_artist,
        "top_genre": top_genre,
        "genre_percentage": ((top_genre["number"] / genreCount) * 100).toFixed(1),
        "duration_data": durationData
    }
}

async function getArtistGenres(idArray, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/artists?ids=${idArray.join(",")}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "Too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }
    let genres = []
    data["artists"].forEach(artist => {
        try{
            if(artist["genres"][0]){ // Add every artist's first genre to the total list (if they have any)
                genres.push(artist["genres"][0])
            }
        }catch(err){console.log(err)} // Check for errors (haven't encountered any situations where errors have appeared yet though)
    })
    return genres
}

async function getArtistProfilePicture(id, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }
    return data["images"][0]["url"]
}

async function getTracks(playlistId, offset, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}` 
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }
    return data
}

async function getUserProfilePicture(id, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/users/${id}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }
    try{
        return data["images"][0]["url"]
    }catch{
        return null
    }
}

function generateRandomString(length){
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], "")
}