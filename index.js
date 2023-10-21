import express from "express"
import bodyParser from "body-parser"
import path from "path"
import * as dotenv from "dotenv"

dotenv.config()

const app = express()

const port = 3000

const __dirname = path.resolve('')

let token = "none"

app.use(express.static(__dirname));
app.use(bodyParser.json())

app.get("/", (req, res) => {
    console.log("User on website.")
    res.sendFile(path.join(__dirname, "index.html"))
})

app.post("/api/fetchData", async (req, res) => {
    // TODO: verify request body to make sure its not bad or something idk
    const body = req.body
    if(!body.url.startsWith("https://open.spotify.com/playlist/")){
        res.status(500).send({ error: "Bad request", message: "Not a valid Spotify playlist link"})
        return
    }

    const playlist = req.body.url.replace("https://open.spotify.com/playlist/", "").split("?si=")[0]
    let data2 = await request2(playlist)
    let timesToLoop = Math.ceil(data2 / 100)

    const artistData = {}

    for(let k = 0; k < timesToLoop*100; k += 100){
        let data = await request(playlist, k)
        if(data == "error"){
            res.status(500).send({ error: "Bad request", message: "Not a valid Spotify playlist link"})
            return
        }
        data = data["items"]
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i]["track"]["artists"].length; j++){
                const artist = data[i]["track"]["artists"][j]["name"]
                if(artist in artistData != true){
                    artistData[artist] = 1
                }else{
                    artistData[artist] = artistData[artist] + 1
                }
            }
        }
    }

    for(let key in artistData){
        if(artistData[key] < parseInt(body.limit)){
            delete artistData[key]
        }
    }

    const labels = []
    const values = []
    
    Object.keys(artistData).forEach(key => {
        labels.push(key)
    })
    Object.values(artistData).forEach(value => {
        values.push(value)
    })

    // for(let i = 0; i < labels.length; i++){
    //   console.log(`Artist name: ${labels[i]}\nListeners: ${values[i]}\n`)
    // }

    const obj = {
        "data": {
            "labels": labels,
            "values": values
        }
    }

    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify(obj))
})

app.listen(port, () => {
    console.log(`App listening on port ${port}.`)
})

async function request(playlist_id, offset) {
    //console.log(offset)
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?offset=${offset}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    const json = await res.json();
    
    if (json["error"]) {
        if(json["error"]["status"] == 404){
            return "error"
        }
        console.log(json["error"]);
        token = await getCredentials();
        return request(playlist_id, offset);
    } else {
        return json;
    }
}
async function request2(playlist_id) {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const json = await res.json();
    
    if (json["error"]) {
      console.log(json["error"]);
      token = await getCredentials();
      return request2(playlist_id);
    } else {
      return json["tracks"]["total"];
    }
}


async function getCredentials() {
    const clientId = process.env.client_id;
    const clientSecret = process.env.client_secret;
  
    const credentials = `${clientId}:${clientSecret}`;
  
    const encodedCredentials = Buffer.from(credentials).toString("base64");
  
    const resFromApi = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodedCredentials}`,
        },
        body: "grant_type=client_credentials",
      }
    );
    const json = await resFromApi.json();
    return json["access_token"];
  }
