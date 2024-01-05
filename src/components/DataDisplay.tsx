import { useEffect } from "react"

interface DataDisplayProps{
    songDuration: string,
    playlistLikes: number,
    name: string,
    owner: string,
    isPublic: boolean,
    topArtist: {
        name: string,
        number: number
    },
    trackCount: number,
    icon: string
}

export default function DataDisplay({ songDuration, playlistLikes, name, owner, isPublic, topArtist, trackCount, icon }: DataDisplayProps){

    useEffect(() => {
        const canvas = document.querySelector("canvas")
        const ctx = canvas.getContext("2d")
        const playlistCover = new Image()
        playlistCover.src = icon
        playlistCover.onload = () => {
            ctx.drawImage(playlistCover, 12, 12, 180, 180)
        }
        ctx.font = "42px sans-serif"
        ctx.fillStyle = "#1DB954"
        ctx.fillText('"' + name + '"', 200, 56)
        ctx.font = "36px sans-serif"
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(`Playlist by ${owner}`, 200, 108)
        ctx.font = "24px sans-serif"
        ctx.fillStyle = "#FF0000"
        ctx.fillText(`${playlistLikes} likes`, 200, 150)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(isPublic ? "Public playlist" : "Private playlist", 200, 188)
        ctx.font = "32px sans-serif"
        ctx.fillText("Top artist:", 12, 228)
        const artistImage = new Image()
        artistImage.src = topArtist["picture"]
        artistImage.onload = () => {
            ctx.drawImage(artistImage, 156, 204, 92, 92)
        }
    }, [])

    return(
        <canvas width="480px" height="480px">Canvas is not supported</canvas>
    )
}