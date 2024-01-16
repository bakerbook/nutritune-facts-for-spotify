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
        /*
        async function loadFont(){
            const font: FontFace = new FontFace("Inter", "url('./../assets/Inter-ExtraBold.ttf')")
            await font.load().then(font => {
                (document.fonts as any).add(font)
            })
        }
        loadFont()
        */
        const canvas = document.querySelector("canvas")
        const ctx = canvas.getContext("2d")
        const backgroundImage = new Image()
        backgroundImage.src = Background
        backgroundImage.onload = () => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
            ctx.font = "36px sans-serif"
            ctx.fillStyle = "#1DB954"
            ctx.fillText(name, 10, 101)
            const playlistIcon = new Image()
            playlistIcon.src = icon
            playlistIcon.onload = () => {
                ctx.drawImage(playlistIcon, 407, 69, 75, 75)
            }
            ctx.font = "29px sans-serif"
            ctx.fillText(owner, 52, 133)
            ctx.font = "52px sans-serif"
            ctx.fillStyle = "#121212"
            ctx.fillText(String(trackCount), 395, 250)
        }
    }, [])

    return(
        <canvas width="491px" height="785px">Canvas is not supported</canvas>
    )
}