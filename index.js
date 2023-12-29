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

//THIS WHOLE THING NEEDS TO BE FIXED AND ISNT FINISHED
app.get("/callback", (req, res) => {
    let code = req.query.code || null
    //TODO: implement "state"
    if(code === null){
        res.redirect("/?" + querystring.stringify({ error: "no_code_received" }))
    }else{
        fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                content_type: "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: process.env.client_id,
                grant_type: "authorization_code",
                code,
                redirect_uri: "http://localhost:3000"
            })
        }).then(data => {
            console.log(data)
        })
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})