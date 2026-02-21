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
    const [imageVisible, setImageVisible] = useState(false)

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
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 100, 100);

            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)

            ctx.drawImage(playlistIcon, 814, 138, 150, 150)

            ctx.drawImage(artistIcon, 100, 692, 64, 64)
            ctx.font = "64px Inter, sans-serif"
            ctx.fillStyle = "#1DB954"
            if(ctx.measureText(name).width < 784){
                ctx.fillText(name, 20, 194)
            }else{
                ctx.font = "52px Inter, sans-serif"
                if(ctx.measureText(name).width < 784){
                    ctx.fillText(name, 20, 194)
                }else{
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
            ctx.fillText(String(trackCount), 953 - ctx.measureText(String(trackCount)).width, 485)
            ctx.font = "64px Inter, sans-serif"
            ctx.fillText(topArtist["name"], 168, 748)
            ctx.fillText(String(topArtist["number"]) + " songs", 102, 816)
            ctx.fillText(artistPercentage, 918 - ctx.measureText(artistPercentage).width, 672)
            ctx.fillText(topGenre["name"].charAt(0).toUpperCase() + topGenre["name"].slice(1), 102, 962)
            ctx.fillText(genrePercentage, 918 - ctx.measureText(genrePercentage).width, 890)
            ctx.fillText(durationData["averageString"], 694, 1035)
            ctx.fillText(durationData["longer"] + " longer", 102, 1109)
            ctx.fillText(durationData["shorter"] + " shorter", 102, 1183)
            ctx.fillText(longerDuration, 918 - ctx.measureText(longerDuration).width, 1109)
            ctx.fillText(shorterDuration, 918 - ctx.measureText(shorterDuration).width, 1183)

            const dataURL = canvas.toDataURL()
            canvas.style.display = 'none';

            setImgSource(dataURL)
        })
    }, [])

    return(
        <div className="space-y-0">
            <canvas width="982px" height="1498px" className="hidden">Canvas is not supported</canvas>
            <div className="border border-white/[0.08]">
                {/* Header — always visible */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div>
                        <p className="text-[#1DB954] text-[11px] uppercase tracking-[0.2em] font-semibold mb-0.5">
                            {imgSource ? 'Analysis complete' : 'Generating label…'}
                        </p>
                        <h3 className="text-white font-bold text-lg">{name}</h3>
                    </div>
                    <a
                        id="downloadButton"
                        className={`flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm px-5 py-2.5 transition-all duration-150 ${imageVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        download="playlist-nutrition-facts.png"
                        href={imgSource}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>
                </div>

                {/* Image area — skeleton fades out, image fades in */}
                <div className="p-6 md:p-10 flex justify-center bg-[#0a0a0a]">
                    <div className="relative w-full max-w-[360px]" style={{ aspectRatio: '982 / 1498' }}>

                        {/* Skeleton */}
                        <div className={`absolute inset-0 transition-opacity duration-700 ${imageVisible ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="absolute inset-0 bg-[#141414] overflow-hidden">
                                {/* Shimmer sweep */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.025] to-transparent skeleton-shimmer" />
                            </div>
                            {/* Placeholder blocks mimicking a nutrition label */}
                            <div className="absolute inset-0 p-[8%] flex flex-col gap-[4%]">
                                <div className="h-[6%] w-3/4 bg-white/[0.05] rounded-sm" />
                                <div className="h-[3%] w-1/2 bg-white/[0.04] rounded-sm" />
                                <div className="h-px w-full bg-white/[0.06] my-[2%]" />
                                <div className="h-[10%] w-1/3 bg-white/[0.05] rounded-sm self-end" />
                                <div className="h-px w-full bg-white/[0.06]" />
                                <div className="h-[4%] w-full bg-white/[0.04] rounded-sm" />
                                <div className="h-[4%] w-5/6 bg-white/[0.03] rounded-sm" />
                                <div className="h-px w-full bg-white/[0.06]" />
                                <div className="h-[4%] w-full bg-white/[0.04] rounded-sm" />
                                <div className="h-[4%] w-4/6 bg-white/[0.03] rounded-sm" />
                                <div className="h-px w-full bg-white/[0.06]" />
                                <div className="h-[4%] w-full bg-white/[0.04] rounded-sm" />
                            </div>
                        </div>

                        {/* Actual image */}
                        {imgSource && (
                            <img
                                id="dataImage"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imageVisible ? 'opacity-100' : 'opacity-0'}`}
                                src={imgSource}
                                alt="Playlist nutrition facts"
                                onLoad={() => setImageVisible(true)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function cutDownName(name: string, limit: number): string{
    const canvas = document.querySelector("canvas")
    const ctx = canvas.getContext("2d")
    ctx.font = "52px Inter, sans-serif"
    const nameAsArray: string[] = name.split("")
    let nameWidth: number = ctx.measureText(nameAsArray.join("")).width
    nameAsArray.push("...")
    while(nameWidth > limit){
        nameAsArray.splice(nameAsArray.length - 2, 1)
        nameWidth = ctx.measureText(nameAsArray.join("")).width
    }
    return nameAsArray.join("")
}
