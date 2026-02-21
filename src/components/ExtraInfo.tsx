export default function ExtraInfo(){
    const features = [
        { num: "01", label: "Track count & total duration" },
        { num: "02", label: "Top artist & their share" },
        { num: "03", label: "Dominant genre breakdown" },
        { num: "04", label: "Downloadable nutrition label" },
    ]

    return(
        <section className="bg-[#0a0a0a] py-16 px-6 md:px-10 border-t border-white/[0.06]" role="complementary">
            <div className="max-w-5xl mx-auto">
                <p className="text-[#555] text-[11px] tracking-[0.25em] uppercase font-semibold mb-8">
                    What you'll discover
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06] border border-white/[0.06]">
                    {features.map(f => (
                        <div key={f.num} className="p-6 md:p-8">
                            <p className="text-[#1DB954] text-3xl font-black tracking-tight mb-3">{f.num}</p>
                            <p className="text-white text-sm font-medium leading-snug">{f.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
