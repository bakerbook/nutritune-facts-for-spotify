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

app.use(express.static(__dirname));
app.use(bodyParser.json())
app.use(cookieParser())

const scope = "playlist-read-private playlist-read-collaborative"

app.get("/", (req, res) => {
    console.log("User on website.")
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/login", (req, res) => {
    let state = generateRandomString(16)
    console.log(state)
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
            const { username, user_id } = await getProfileName(accessToken)
            res.redirect("/?" + querystring.stringify({
                refresh_token: refreshToken,
                access_token: accessToken,
                username: username,
                user_id: user_id
            }))
        })
    }
})

app.post("/getToken", (req, res) => {
    const refreshToken = req.body["refresh_token"]
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
        res.send({ "access_token": data["access_token"] })
    })
})

app.post("/getPlaylists", async (req, res) => {
    const userId = req.body["user_id"]
    const accessToken = JSON.parse(req.body["access_token"])["token"]
    const playlists = await getPlaylists(userId, accessToken)
    res.send(JSON.stringify(playlists))
})

app.post("/getPlaylistDetails", async (req, res) => {
    const playlistId = req.body["playlist_id"]
    const accessToken = JSON.parse(req.body["access_token"])["token"]
    const data = await getPlaylistDetails(playlistId, accessToken)
    res.send(JSON.stringify(data))
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

async function getProfileName(accessToken){
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    return { username: data["display_name"], user_id: data["id"] }
}

async function getPlaylists(userId, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=50&offset=0`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    const playlists = []
    data["items"].forEach(playlist => {
        if(playlist["images"].length == 0){
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
        currentSet["items"].forEach(song => {
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
        })
    }
    
    for(let i = 0; i < idArray.length; i += 50){
        const chunk = idArray.slice(i, i+50)
        bigGenreList = bigGenreList.concat(await getArtistGenres(chunk, accessToken))
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
    let total = data["tracks"]["total"]

    let { artistData, durationData, genres, genreCount } = await getData(total, playlistId, accessToken)

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

    top_artist["picture"] = await getArtistProfilePicture(top_artist["id"], accessToken)
    delete top_artist["id"]

    const userProfilePicture = await getUserProfilePicture(accessToken)

    const playlist_icon = data["images"][0]["url"]

    return {
        "user_profile_picture": userProfilePicture,
        "playlist_name": data["name"],
        "playlist_owner": data["owner"]["display_name"],
        "playlist_icon": playlist_icon,
        "track_count": total,
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
    let genres = []
    data["artists"].forEach(artist => {
        artist["genres"].forEach(genre => {
            genres.push(genre)
        })
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
    return data["images"][0]["url"]
}
async function getUserProfilePicture(accessToken){
    const response = await fetch(`https://api.spotify.com/v1/me`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    return data["images"][0]["url"]
}

async function getTracks(playlistId, offset, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}` 
        }
    })
    const data = await response.json()
    return data
}

function generateRandomString(length){
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], "")
}