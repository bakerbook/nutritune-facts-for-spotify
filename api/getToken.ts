import type { VercelRequest, VercelResponse } from "@vercel/node"
import * as cookie from "cookie"
import * as dotenv from "dotenv"

dotenv.config({ path: '.env.local' })

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
} = process.env

export default async function handler(req: VercelRequest, res: VercelResponse){
    try {
        const cookies = cookie.parse(req.headers.cookie || "")
        const refreshToken: string | null = cookies.refresh_token || null
        
        if(!refreshToken){
            return res.status(400).json({ error: "Invalid refresh token" })
        }
        
        const params: URLSearchParams = new URLSearchParams({
            "grant_type": "refresh_token",
            "refresh_token": refreshToken,
            "client_id": SPOTIFY_CLIENT_ID!,
            "client_secret": SPOTIFY_CLIENT_SECRET!
        })
        
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        })
        
        const data = await response.json()
        
        if(data.error) {
            return res.status(400).json({ error: data.error })
        }
        
        res.setHeader("Set-Cookie", cookie.serialize("access_token", data.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: data.expires_in,
            path: "/"
        }))
        
        return res.json({ "access_token": data.access_token })
        
    } catch (error) {
        console.error("GetToken error:", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}