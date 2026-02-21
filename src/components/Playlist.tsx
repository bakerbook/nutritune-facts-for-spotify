export default function Playlist({ name, icon, playlistId }){
    return(
        <div className="group cursor-pointer" data-playlist-id={playlistId}>
            <div className="pl-img relative overflow-hidden mb-2 bg-[#1a1a1a]">
                <img
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    src={icon}
                    alt={name}
                />
                {/* Hover darkening */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                {/* Selection tint overlay — toggled via inline style */}
                <div className="pl-tint absolute inset-0 transition-opacity duration-150" style={{ backgroundColor: 'transparent' }} />
                {/* Checkmark badge — hidden until selected */}
                <div className="pl-check absolute top-1.5 right-1.5 w-5 h-5 bg-[#1DB954] flex items-center justify-center opacity-0 transition-opacity duration-150">
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <p className="pl-name text-xs text-[#666] group-hover:text-[#aaa] transition-colors duration-150 line-clamp-2 leading-tight px-0.5">
                {name}
            </p>
        </div>
    )
}
