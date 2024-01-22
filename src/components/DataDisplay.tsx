import { useEffect } from "react"
import Background from "./../assets/template.png"
import Font from "./../assets/Inter-SemiBold.ttf"

interface DataDisplayProps{
    durationData: {
        longer: number,
        shorter: number,
        average: number,
        averageString: string
    },
    name: string,
    owner: string,
    topArtist: {
        name: string,
        number: number,
        picture: string
    },
    topGenre: {
        name: string,
        number: number
    },
    genrePercentage: string,
    trackCount: number,
    icon: string
}

export default function DataDisplay({ durationData, name, topGenre, genrePercentage, owner, topArtist, trackCount, icon }: DataDisplayProps){

    useEffect(() => {
        async function loadFont(){
            const font: FontFace = new FontFace("Inter", `url(${Font})`)
            await font.load();
            (document.fonts as any).add(font)
        }
        function loadImage(src: string): Promise<HTMLImageElement>{
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = "anonymous"
                img.onload = () => resolve(img)
                img.onerror = reject
                img.src = src
            })
        }
        const canvas = document.querySelector("canvas")
        const ctx = canvas.getContext("2d")
        Promise.all([
            loadImage(Background),
            loadImage(icon),
            loadImage(topArtist["picture"]),
            loadFont()

        ]).then(([backgroundImage, playlistIcon, artistIcon]) => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
            ctx.drawImage(playlistIcon, 814, 138, 150, 150)
            ctx.drawImage(artistIcon, 100, 692, 64, 64)
            ctx.font = "72px Inter, sans-serif"
            ctx.fillStyle = "#1DB954"
            ctx.fillText(name, 20, 202)
            ctx.font = "58px Inter, sans-serif"
            ctx.fillText(owner, 104, 266)
            ctx.font = "104px Inter, sans-serif"
            ctx.fillStyle = "#121212"
            ctx.fillText(String(trackCount), 790, 500)
            ctx.font = "64px Inter, sans-serif"
            ctx.fillText(topArtist["name"], 168, 748)
            ctx.fillText(String(topArtist["number"]) + " songs", 102, 816)
            if((String((topArtist["number"] / trackCount * 100).toFixed(1)).replace(".", "")).length > 2){
                ctx.fillText(String((topArtist["number"] / trackCount * 100).toFixed(1)), 787, 672)
            }else{
                ctx.fillText(String((topArtist["number"] / trackCount * 100).toFixed(1)), 829, 672)
            }
            ctx.fillText(topGenre["name"].charAt(0).toUpperCase() + topGenre["name"].slice(1), 102, 962)
            if((genrePercentage.replace(".", "")).length > 2){
                ctx.fillText(genrePercentage, 787, 890)
            }else{
                ctx.fillText(genrePercentage, 829, 890)
            }
            ctx.fillText(durationData["averageString"], 694, 1035)
            ctx.fillText(durationData["longer"] + " longer", 102, 1109)
            ctx.fillText(durationData["shorter"] + " shorter", 102, 1183)
            if((durationData["longer"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1).length > 2){
                ctx.fillText((durationData["longer"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 787, 1109)
            }else{
                ctx.fillText((durationData["longer"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 829, 1109)
            }
            if((durationData["shorter"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1).length > 2){
                ctx.fillText((durationData["shorter"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 787, 1183)
            }else{
                ctx.fillText((durationData["shorter"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 829, 1183)
            }

            const dataImage: any = document.getElementById("dataImage")
            dataImage.src = canvas.toDataURL()
        })
    }, [])

    return(
        <div>
            <canvas width="982px" height="1498" style={{display: "none"}}>Canvas is not supported</canvas>
            <img id="dataImage" width="491px" height="749"></img>
        </div>
    )
}