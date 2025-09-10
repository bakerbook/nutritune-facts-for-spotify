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
        
        // Make canvas temporarily visible for drawing
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.top = '-9999px';
        canvas.style.left = '0';
        
        const ctx = canvas.getContext("2d")
        Promise.all([
            loadImage(Background),
            loadImage(userProfilePicture),
            loadImage(icon),
            loadImage(topArtist["picture"]),
            loadFont()
        ]).then(([backgroundImage, profilePicture, playlistIcon, artistIcon]) => {
            // Clear canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Test: Draw a simple rectangle to see if canvas is working
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 100, 100);
            
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

            const dataURL = canvas.toDataURL()
            canvas.style.display = 'none';
            
            setImgSource(dataURL)
        })
    }, [])

    return(
        <div className="space-y-8">
            <canvas width="982px" height="1498px" className="hidden">Canvas is not supported</canvas>
            {
                imgSource ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-6">
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">Playlist Analysis Complete!</h3>
                            <p className="text-gray-600">Here's your personalized nutrition label for <span className="font-semibold text-[#1DB954]">{name}</span></p>
                        </div>
                        
                        <div className="flex justify-center mb-6">
                            <div className="relative group max-w-md">
                                <img 
                                    id="dataImage" 
                                    className="w-full h-auto rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300" 
                                    src={imgSource}
                                    alt="Playlist nutrition facts"
                                />
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <a 
                                id="downloadButton" 
                                className="inline-flex items-center space-x-2 bg-[#1DB954] hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                                download="playlist-nutrition-facts.png" 
                                href={imgSource}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download Nutrition Facts</span>
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Analysis</h3>
                        <p className="text-gray-600">Please wait while we process your playlist data...</p>
                    </div>
                )
            }
        </div>
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