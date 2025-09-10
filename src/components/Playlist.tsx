export default function Playlist({ name, icon, playlistId }){
    return(
        <div className="group cursor-pointer transition-all duration-200 p-1" data-playlist-id={playlistId}>
            <div className="relative overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-105">
                <img 
                    className="w-full aspect-square object-cover transition-all duration-200" 
                    src={icon} 
                    alt={playlistId}
                />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900 text-center line-clamp-2 group-hover:text-[#1DB954] transition-colors duration-200">
                {name}
            </p>
        </div>
    )
}