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
            client_id: process.env.client_id,
            scope: scope,
            redirect_uri: "http://localhost:3000/callback",
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
        
        params.append("client_id", process.env.client_id)
        params.append("client_secret", process.env.client_secret)
        params.append("grant_type", "authorization_code")
        params.append("code", code)
        params.append("redirect_uri", "http://localhost:3000/callback")

        fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        }).then(response => response.json()).then(data => {
            console.log(data)
        })
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})