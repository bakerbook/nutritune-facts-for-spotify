import express, { query } from "express"
import bodyParser from "body-parser"
import path from "path"
import * as dotenv from "dotenv"
import querystring from "node:querystring"

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
        const params = new URLSearchParams()
        
        params.append("client_id", process.env.CLIENT_ID)
        params.append("client_secret", process.env.CLIENT_SECRET)
        params.append("grant_type", "authorization_code")
        params.append("code", code)
        params.append("redirect_uri", `${process.env.TEST_SITE}/callback`)

        fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        }).then(response => response.json()).then(async data => {
            const accessToken = data["access_token"]
            const refreshToken = data["refresh_token"]
            const username = await getProfileName(accessToken)
            res.redirect("/?" + querystring.stringify({
                refresh_token: refreshToken,
                access_token: accessToken,
                username: username
            }))
        })
    }
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
    return data["display_name"]
}