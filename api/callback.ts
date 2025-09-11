import type { VercelRequest, VercelResponse } from "@vercel/node"
import { stringify } from "node:querystring"
import * as cookie from "cookie"
import * as dotenv from "dotenv"

dotenv.config({ path: '.env.local' })

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI
} = process.env

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        let code: string | null = req.query.code as string | null
        let state: string | null = req.query.state as string | null
        
        const cookies = cookie.parse(req.headers.cookie || "")
        let storedState: string | null = cookies.spotify_auth_state || null
        
        if(state === null || state !== storedState){
            return res.redirect(400, "/?" + stringify({ error: "state_mismatch" }))
        }
        
        const params: URLSearchParams = new URLSearchParams({
            "client_id": SPOTIFY_CLIENT_ID!,
            "client_secret": SPOTIFY_CLIENT_SECRET!,
            "grant_type": "authorization_code",
            "code": code!,
            "redirect_uri": SPOTIFY_REDIRECT_URI! + "/api/callback"
        })
        
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        })
        
        const data = await tokenResponse.json()
        
        if(data.error) {
            return res.redirect(400, "/?" + stringify({ error: data.error }))
        }
        
        const accessToken: string = data.access_token
        const refreshToken: string = data.refresh_token
        
        let profileRequest: Profile | Error = await getProfileInformation(accessToken)
        if("error" in profileRequest){
            return res.redirect(400, "/?" + stringify({ error: profileRequest.error }))
        } else {
            const { username, user_id } = profileRequest as Profile
            
            res.setHeader("Set-Cookie", [
                cookie.serialize("access_token", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    maxAge: data.expires_in,
                    path: "/"
                }),
                cookie.serialize("refresh_token", refreshToken, {
                    httpOnly: false,
                    secure: true,
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: "/"
                })
            ])
            
            return res.redirect(302, "/?" + stringify({
                username: username,
                user_id: user_id
            }))
        }
    } catch (error) {
        console.error("Callback error:", error)
        return res.redirect(500, "/?" + stringify({ error: "internal_server_error" }))
    }
}

async function getProfileInformation(accessToken: string): Promise<Profile | Error> {
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const data: UserInfo | Error = await response.json()
    if(data["error"]){
        if(data["error"]["status"] === 429){
            return { error: "too many requests, try again later" }
        }else{
            return { error: "400 Bad Request"}
        }
    }
    try{
        return { username: data["display_name"], user_id: data["id"], pfp: data["images"][0]["url"] }
    }catch{
        return { username: data["display_name"], user_id: data["id"], pfp: null }
    }
}

type Profile = {
    username: string,
    user_id: string,
    pfp: string | null
}
type Error = {
    error: string
}
type UserInfo = {
    display_name: string,
    external_urls: {
        spotify: string
    },
    followers: {
        href: string | null,
        total: number
    },
    href: string,
    id: string,
    images: Array<{
        height: number | null,
        url: string,
        width: number | null
    }>,
    type: string,
    uri: string
}