export default function Header(){
    return(
        <header className="bg-gradient-to-r from-[#1DB954] to-green-500 py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                    NutriTune Facts
                </h1>
                <p className="text-xl md:text-2xl text-green-100 font-medium">
                    Discover the nutritional facts of your Spotify playlists
                </p>
            </div>
        </header>
    )
}