import express, { query } from "express"
import bodyParser from "body-parser"
import path from "path"
import * as dotenv from "dotenv"
import querystring from "node:querystring"
import { access } from "fs"

dotenv.config()

const app = express()

const port = 3000

const __dirname = path.resolve('')

app.use(express.static(__dirname));
app.use(bodyParser.json())

app.get("/", (req, res) => {
    console.log("User on website.")
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/login", (req, res) => {
    let scope = "playlist-read-private playlist-read-collaborative"
    res.redirect("https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: `${process.env.TEST_SITE}/callback`,
        })
    )
})

app.get("/callback", (req, res) => {
    let code = req.query.code || null
    //TODO: implement "state"
    if(code === null){
        res.redirect("/?" + querystring.stringify({ error: "no_code_received" }))
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
        playlists.push({
            name: playlist["name"],
            cover: playlist["images"][0]["url"],
            id: playlist["href"].split("playlists/")[1]
        })
    })
    return playlists
}

async function getPlaylistDetails(playlistId, accessToken){
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const artistData = {}
    let data = await response.json()
    let total = data["tracks"]["total"]
    for(let i = 0; i < (Math.ceil(total) / 100)*100; i += 100){
        const currentSet = await getTracks(playlistId, i, accessToken)
        currentSet["items"].forEach(song => {
            song["track"]["artists"].forEach(artist => {
                let name = artist["name"]
                if(!(name in artistData)){
                    artistData[name] = 1
                }else{
                    artistData[name] = artistData[name] + 1
                }
            })
        })
    }
    let top_artist = {
        name: Object.keys(artistData)[0],
        number: Object.values(artistData)[0]
    }
    for(const [artistName, number] of Object.entries(artistData)){
        if(number > top_artist["number"]){
            top_artist["number"] = number
            top_artist["name"] = artistName
        }
    }

    return {
        "playlist_name": data["name"],
        "playlist_owner": data["owner"]["display_name"],
        "track_count": total,
        "top_artist": top_artist
    }
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