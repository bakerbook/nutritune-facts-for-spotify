import { useState, useEffect } from "react"
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
    const [imgSource, setImgSource] = useState(null)

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
            ctx.font = "64px Inter, sans-serif"
            ctx.fillStyle = "#1DB954"
            console.log(`Text width: ${ctx.measureText(name).width}`)
            if(ctx.measureText(name).width < 784){ // If the playlist name is fine by default
                ctx.fillText(name, 20, 194)
            }else{
                ctx.font = "52px Inter, sans-serif"
                if(ctx.measureText(name).width < 784){ // If playlist name is fine after slight shrink
                    ctx.fillText(name, 20, 194)
                }else{ // If playlist needs to shrink and be cut off
                    ctx.fillText(cutDownName(name, 784), 20, 194)
                }
            }
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

            setImgSource(canvas.toDataURL())
        })
    }, [])

    return(
        <>
            <canvas width="982px" height="1498px">Canvas is not supported</canvas>
            {
                imgSource ? (
                    <>
                        <img id="dataImage" className="centered" src={imgSource}></img>
                        <a id="downloadButton" className="hoverAnimation" download="image.png" href={imgSource}>Download image</a>
                    </>
                ) : (
                    null
                )
            }
        </>
    )
}

function cutDownName(name: string, limit: number): string{
    const canvas = document.querySelector("canvas")
    const ctx = canvas.getContext("2d")
    ctx.font = "52px Inter, sans-serif"
    const nameAsArray: string[] = name.split("")
    let nameWidth: number = ctx.measureText(nameAsArray.join("")).width // Initial width
    nameAsArray.push("...")
    while(nameWidth > limit){
        nameAsArray.splice(nameAsArray.length - 2, 1) // Get rid of the element before the ...
        nameWidth = ctx.measureText(nameAsArray.join("")).width // Set new width
    }
    return nameAsArray.join("") // Return new shortened name with ... added
}