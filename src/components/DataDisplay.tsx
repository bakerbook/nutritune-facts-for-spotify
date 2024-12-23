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

    const artistPercentage: string = String((topArtist["number"] / trackCount * 100).toFixed(1))
    const shorterDuration: string = String((durationData["shorter"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1))
    const longerDuration: string = String((durationData["longer"] / (durationData["longer"]+durationData["shorter"]) * 100).toFixed(1))

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
                ctx.drawImage(profilePicture, 100, 211, 72, 72) // Draw profile picture and name
                ctx.fillText(owner, 182, 266)
            }else{
                ctx.fillText(owner, 100, 266) // Just draw name
            }
            ctx.font = "104px Inter, sans-serif"
            ctx.fillStyle = "#121212"
            ctx.fillText(String(trackCount), 953 - ctx.measureText(String(trackCount)).width, 485) // Track count, position based on width
            ctx.font = "64px Inter, sans-serif"
            ctx.fillText(topArtist["name"], 168, 748) // Top artist name
            ctx.fillText(String(topArtist["number"]) + " songs", 102, 816) // Top artist number of songs; {number} songs
            ctx.fillText(artistPercentage, 918 - ctx.measureText(artistPercentage).width, 672) // Top artist percentage
            ctx.fillText(topGenre["name"].charAt(0).toUpperCase() + topGenre["name"].slice(1), 102, 962) // Top genre name
            ctx.fillText(genrePercentage, 918 - ctx.measureText(genrePercentage).width, 890) // Top genre percentage
            ctx.fillText(durationData["averageString"], 694, 1035) // Average duration
            ctx.fillText(durationData["longer"] + " longer", 102, 1109) // {number} longer
            ctx.fillText(durationData["shorter"] + " shorter", 102, 1183) // {number} shorter
            ctx.fillText(longerDuration, 918 - ctx.measureText(longerDuration).width, 1109) // Longer percentage
            ctx.fillText(shorterDuration, 918 - ctx.measureText(shorterDuration).width, 1183) // Shorter percentage

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