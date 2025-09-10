import { useState, useEffect } from "react"

export default function Loading(){
    const [dots, setDots] = useState(".")

    useEffect(() => {
        const interval = setInterval(() => {
            switch(dots){
                case ".":
                    setDots("..")
                    break
                case "..":
                    setDots("...")
                    break
                default:
                    setDots(".")
            }
        }, 500)

        return () => clearInterval(interval)
    }, [dots])

    return(
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1DB954] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#1DB954] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Playlist</h3>
                    <p className="text-gray-600">{"Processing your musical data" + dots}</p>
                </div>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                    <div className="bg-[#1DB954] h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
            </div>
        </div>
    )
}