import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(req: VercelRequest, res: VercelResponse){
    try {
        const userId: string = req.body["user_id"]
        if(req.body["access_token"] === null){
            res.send(JSON.stringify({ error: "no_access_token" }))
        }else{
            const playlists: Array<Playlist> | Error = await getPlaylists(userId, JSON.parse(req.body["access_token"])["token"])
            res.send(JSON.stringify(playlists))
        }
    } catch (error) {
        console.error("GetPlaylists error:", error)
        res.status(500).json({ error: "Failed to fetch playlists" })
    }
}

async function getPlaylists(userId: string, accessToken: string): Promise<Array<Playlist> | Error> {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=50&offset=0`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    let allPlaylists: Array<Object> = []
    let data = await response.json()
    allPlaylists = allPlaylists.concat(data["items"])
    while(data["next"]){
        const response = await fetch(data["next"], {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        data = await response.json()
        allPlaylists = allPlaylists.concat(data["items"])
    }
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return Error("too many requests, try again later")
        }else{
            return Error("400 Bad Request")
        }
    }
    const filteredPlaylists: Array<Playlist> = []
    allPlaylists.forEach(playlist => {
        if(playlist["tracks"]["total"] == 0){ // Don't show user playlist if it's empty
            return
        }
        if(!playlist["images"]){ // Don't show playlist if it has no cover image
            return
        }
        let cover: string = playlist["images"][0]["url"]
        filteredPlaylists.push({
            name: playlist["name"],
            cover: cover,
            id: playlist["href"].split("playlists/")[1]
        })
    })
    return filteredPlaylists
}

type Playlist = {
    name: string,
    cover: string,
    id: string
}