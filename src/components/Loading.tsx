export default function Loading(){
    const bars = [
        { delay: '0ms', height: 'h-5' },
        { delay: '160ms', height: 'h-9' },
        { delay: '320ms', height: 'h-6' },
        { delay: '480ms', height: 'h-11' },
        { delay: '640ms', height: 'h-4' },
        { delay: '800ms', height: 'h-8' },
        { delay: '160ms', height: 'h-5' },
    ]

    return(
        <div className="border border-white/[0.06] py-20 text-center">
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-end gap-[3px] h-14">
                    {bars.map((bar, i) => (
                        <div
                            key={i}
                            className={`w-[3px] bg-[#1DB954] ${bar.height} eq-bar`}
                            style={{ animationDelay: bar.delay }}
                        />
                    ))}
                </div>
                <div>
                    <p className="text-[#888] text-sm">Analyzing your playlist</p>
                </div>
            </div>
        </div>
    )
}
