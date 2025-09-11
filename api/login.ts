import type { VercelRequest, VercelResponse } from "@vercel/node"
import * as cookie from "cookie"
import { getRandomValues } from "node:crypto"
import * as dotenv from "dotenv"

dotenv.config({ path: '.env.local' })

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_REDIRECT_URI
} = process.env

const scope = "playlist-read-private playlist-read-collaborative"

export default async function handler(req: VercelRequest, res: VercelResponse){
    let state = generateRandomString(16)
    
    res.setHeader("Set-Cookie", cookie.serialize("spotify_auth_state", state, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 10,
        path: "/"
    }))
    
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID!)
    authUrl.searchParams.set("scope", scope)
    authUrl.searchParams.set("redirect_uri", SPOTIFY_REDIRECT_URI! + "/api/callback")
    authUrl.searchParams.set("state", state)
    
    try {
        return res.redirect(302, authUrl.toString())
    } catch (error) {
        console.error("REDIRECT ERROR:", error)
        return res.status(500).json({ error: "Redirect failed" })
    }
}

function generateRandomString(length: number): string{
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const values = getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], "")
}