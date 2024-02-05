import { useEffect } from "react"
import Background from "./../assets/template.png"
import Font from "./../assets/Inter-SemiBold.ttf"

interface DataDisplayProps{
    userProfilePicture:string,
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

export default function DataDisplay({ userProfilePicture, durationData, name, topGenre, genrePercentage, owner, topArtist, trackCount, icon }: DataDisplayProps){

    useEffect(() => {
        async function loadFont(){
            const font: FontFace = new FontFace("Inter", `url(${Font})`)
            await font.load();
            (document.fonts as any).add(font)
        }
        function loadImage(src: string): Promise<HTMLImageElement>{
            return new Promise((resolve, reject) => {
                if(src === null){
                    resolve(null)
                    return
                }
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
            loadImage(userProfilePicture),
            loadImage(icon),
            loadImage(topArtist["picture"]),
            loadFont()
        ]).then(([backgroundImage, profilePicture, playlistIcon, artistIcon]) => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
            ctx.drawImage(playlistIcon, 814, 138, 150, 150)
            ctx.drawImage(artistIcon, 100, 692, 64, 64)
            ctx.font = "72px Inter, sans-serif"
            ctx.fillStyle = "#1DB954"
            ctx.fillText(name, 20, 202)
            ctx.font = "58px Inter, sans-serif"
            if(profilePicture){
                ctx.drawImage(profilePicture, 100, 211, 72, 72)
                ctx.fillText(owner, 182, 266)
            }else{
                ctx.fillText(owner, 100, 266)
            }
            ctx.font = "104px Inter, sans-serif"
            ctx.fillStyle = "#121212"
            ctx.fillText(String(trackCount), 833 - ((String(trackCount).length - 2) * 69), 485)
            ctx.font = "64px Inter, sans-serif"
            ctx.fillText(topArtist["name"], 168, 748)
            ctx.fillText(String(topArtist["number"]) + " songs", 102, 816)
            if((String((topArtist["number"] / trackCount * 100).toFixed(1)).replace(".", "")).length > 2){
                if((String((topArtist["number"] / trackCount * 100).toFixed(1)).replace(".", "")).length > 3){
                    ctx.fillText(String((topArtist["number"] / trackCount * 100).toFixed(1)), 740, 672)
                }else{
                    ctx.fillText(String((topArtist["number"] / trackCount * 100).toFixed(1)), 780, 672)
                }
            }else{
                ctx.fillText(String((topArtist["number"] / trackCount * 100).toFixed(1)), 820, 672)
            }
            ctx.fillText(topGenre["name"].charAt(0).toUpperCase() + topGenre["name"].slice(1), 102, 962)
            if((genrePercentage.replace(".", "")).length > 2){
                if((genrePercentage.replace(".", "")).length > 3){
                    ctx.fillText(genrePercentage, 738, 890)
                }else{
                    ctx.fillText(genrePercentage, 780, 890)
                }
            }else{
                ctx.fillText(genrePercentage, 822, 890)
            }
            ctx.fillText(durationData["averageString"], 694, 1035)
            ctx.fillText(durationData["longer"] + " longer", 102, 1109)
            ctx.fillText(durationData["shorter"] + " shorter", 102, 1183)
            if((durationData["longer"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1).length > 2){
                ctx.fillText((durationData["longer"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 780, 1109)
            }else{
                ctx.fillText((durationData["longer"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 822, 1109)
            }
            if((durationData["shorter"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1).length > 2){
                ctx.fillText((durationData["shorter"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 780, 1183)
            }else{
                ctx.fillText((durationData["shorter"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1), 822, 1183)
            }

            const dataImage: any = document.getElementById("dataImage")
            dataImage.src = canvas.toDataURL()
        })
    }, [])

    return(
        <div>
            <canvas width="982px" height="1498px">Canvas is not supported</canvas>
            <img id="dataImage" width="491px" height="749"></img>
        </div>
    )
}