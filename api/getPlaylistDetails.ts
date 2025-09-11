import { VercelRequest, VercelResponse } from "@vercel/node"


export default async function handler(req: VercelRequest, res: VercelResponse){
    try {
        const playlistId: string = req.body["playlist_id"]
        const accessToken: string = JSON.parse(req.body["access_token"])["token"]
        const data: PlaylistInfo | Error = await getPlaylistDetails(playlistId, accessToken)
        res.send(JSON.stringify(data))
    } catch (error) {
        console.error("GetPlaylistDetails error:", error)
        res.status(500).json({ error: "Failed to fetch playlist details" })
    }
}


async function getData(total: number, playlistId: string, accessToken: string): Promise<GetDataReturns | Error>{
    let artistData: GetDataReturns["artistData"] = {}
    let genres: GetDataReturns["genres"] = {}
    let totalDurationMilliseconds: number = 0
    let bigGenreList: Array<string> = []
    let durationList: Array<number> = []
    let idArray: Array<string> = []
    for(let i = 0; i < (Math.ceil(total) / 100)*100; i += 100){
        const currentSet = await getTracks(playlistId, i, accessToken)
        if(currentSet["error"]){
            return Error(currentSet["error"])
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
        let data: Array<string> | Error = await getArtistGenres(chunk, accessToken)
        if(data["error"]){
            return Error(data["error"])
        }
        bigGenreList = bigGenreList.concat(data as Array<string>)
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
        averageString: ""
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

async function getPlaylistDetails(playlistId: string, accessToken: string): Promise<PlaylistInfo | Error> {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    let data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return Error("too many requests, try again later")
        }else{
            return Error("400 Bad Request")
        }
    }

    let infoRequest: GetDataReturns | Error = await getData(data["tracks"]["total"], playlistId, accessToken)

    if(infoRequest["error"]){
        return Error(infoRequest["error"])
    }

    let { artistData, durationData, genres, genreCount } = infoRequest as GetDataReturns

    let top_artist: TopArtist = {
        name: Object.keys(artistData)[0],
        number: Object.values(artistData)[0]["songNumber"],
        id: Object.values(artistData)[0]["id"],
        picture: null
    }
    let top_genre = {
        name: Object.keys(genres)[0],
        number: Object.values(genres)[0] as number
    }
    
    for(const [artistName, obj] of Object.entries(artistData)){
        if(obj["songNumber"] > top_artist["number"]){
            top_artist["number"] = obj["songNumber"]
            top_artist["name"] = artistName
            top_artist["id"] = obj["id"]
        }
    }
    for(const [name, number] of Object.entries(genres)){
        if(number as number > (top_genre["number"] as number)){
            top_genre["name"] = name
            top_genre["number"] = number as number
        }
    }

    durationData["averageString"] = String(durationData["average"].split(".")[0]) + ":" + String(60 * Number(durationData["average"].split(".")[1])).substring(0, 2)

    let topArtistPictureRequest: string | Error = await getArtistProfilePicture(top_artist["id"]!, accessToken)
    if(topArtistPictureRequest["error"]){
        return Error(topArtistPictureRequest["error"])
    }
    top_artist["picture"] = topArtistPictureRequest
    delete top_artist["id"]

    let userProfilePicture: string | Error | null = await getUserProfilePicture(data["owner"]["id"], accessToken)
    if(userProfilePicture){
        if(userProfilePicture["error"]){
            return Error(userProfilePicture["error"])
        }
    }

    const playlist_icon: string = data["images"][0]["url"]

    const topGenreNum: number = top_genre["number"] as number

    return {
        "user_profile_picture": userProfilePicture as string,
        "playlist_name": data["name"],
        "playlist_owner": data["owner"]["display_name"],
        "playlist_icon": playlist_icon,
        "track_count": data["tracks"]["total"],
        "top_artist": top_artist,
        "top_genre": top_genre,
        "genre_percentage": ((topGenreNum / genreCount) * 100).toFixed(1),
        "duration_data": durationData
    }
}

async function getArtistGenres(idArray: Array<string>, accessToken: string): Promise<Array<string> | Error> {
    const response = await fetch(`https://api.spotify.com/v1/artists?ids=${idArray.join(",")}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return Error("Too many requests, try again later")
        }else{
            return Error("400 Bad Request")
        }
    }
    let genres: Array<string> = []
    data["artists"].forEach(artist => {
        if(!artist) return
        try{
            if(artist["genres"][0]){ // Add every artist's first genre to the total list (if they have any)
                genres.push(artist["genres"][0])
            }
        }catch(err){console.log(err)} // Check for errors (haven't encountered any situations where errors have appeared yet though)
    })
    return genres
}

async function getArtistProfilePicture(id: string, accessToken: string): Promise<string | Error>{
    const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return Error("too many requests, try again later")
        }else{
            return Error("400 Bad Request")
        }
    }
    return data["images"][0]["url"]
}

async function getTracks(playlistId: string, offset: number, accessToken: string): Promise<Array<Song> | Error > {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}` 
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return Error("too many requests, try again later")
        }else{
            return Error("400 Bad Request")
        }
    }
    return data
}

async function getUserProfilePicture(id: string, accessToken: string): Promise<string | null | Error >{
    const response = await fetch(`https://api.spotify.com/v1/users/${id}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return Error("too many requests, try again later")
        }else{
            return Error("400 Bad Request")
        }
    }
    try{
        return data["images"][0]["url"]
    }catch{
        return null
    }
}

type Song = {
    added_at: string,
    added_by: {
        external_urls: {
            spotify: string
        },
        followers: {
            href: string,
            total: number
        },
        href: string,
        id: string,
        type: string,
        uri: string
    },
    is_local: boolean,
    track: {
        album: {
            album_type: string,
            total_tracks: number,
            available_markets: Array<string>,
            external_urls: {
                spotify: string
            },
            href: string,
            id: string,
            images: Array<{
                url: string,
                height: number,
                width: number
            }>,
            name: string,
            release_date: string,
            release_date_precision: string,
            restrictions: {
                reason: string
            },
            type: string,
            uri: string,
            artists: Array<{
                external_urls: {
                    spotify: string
                },
                href: string,
                id: string,
                name: string,
                type: string,
                uri: string
            }>
        },
        artists: Array<{
            external_urls: {
                spotify: string
            },
            href: string,
            id: string,
            name: string,
            type: string,
            uri: string
        }>,
        available_markets: Array<string>,
        disc_number: number,
        duration_ms: number,
        explicit: boolean,
        external_ids: {
            isrc: string,
            ean: string,
            upc: string
        },
        external_urls: {
            spotify: string
        },
        href: string,
        id: string,
        is_playable: boolean,
        linked_from: object,
        restrictions: {
            reason: string
        },
        name: string,
        popularity: number,
        preview_url: string,
        track_number: number,
        type: string,
        uri: string,
        is_local: boolean
    }
}
type GetDataReturns = {
    artistData: object
    durationData: {
        longer: number,
        shorter: number,
        average: string,
        averageString: string,
    },
    genres: object,
    genreCount: number
}

type PlaylistInfo = {
    user_profile_picture: string | null,
    playlist_name: string,
    playlist_owner: string,
    playlist_icon: string,
    track_count: number,
    top_artist: TopArtist,
    top_genre: {
        name: string,
        number: number
    },
    genre_percentage: string,
    duration_data: {
        longer: number,
        shorter: number,
        average: string,
        averageString: string
    }
}

type TopArtist = {
    name: string,
    number: number,
    picture: string | null | Error,
    id?: string | null
}