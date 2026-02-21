export default function Header(){
    return(
        <header className="bg-[#0a0a0a] pt-16 pb-12 px-6 md:px-10 border-b border-white/[0.06]" role="banner">
            <div className="max-w-5xl mx-auto">
                <p className="text-[#1DB954] text-[11px] tracking-[0.25em] uppercase font-semibold mb-5">
                    Spotify Playlist Analytics
                </p>
                <h1 className="text-[clamp(3.5rem,10vw,7.5rem)] font-black text-white tracking-[-0.03em] leading-[0.9] mb-6">
                    Nutri<span className="text-[#1DB954]">Tune</span><br/>Facts
                </h1>
                <div className="flex items-end gap-6">
                    <p className="text-[#888] text-base leading-relaxed max-w-xs">
                        The nutritional label for your music diet — powered by Spotify.
                    </p>
                    <div className="hidden md:block flex-1 h-px bg-white/[0.06] mb-2" />
                </div>
            </div>
        </header>
    )
}
