import { useEffect } from "react"
import Background from "./../assets/nutritune_facts_template.png"

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
        const backgroundImage = new Image()
        backgroundImage.src = Background
        backgroundImage.onload = () => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
        }
    }, [])

    return(
        <canvas width="491px" height="785px">Canvas is not supported</canvas>
    )
}