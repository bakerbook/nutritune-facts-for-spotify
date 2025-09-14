export default function ExtraInfo(){
    return(
        <section className="bg-gray-50 py-16 px-4" role="main">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">About NutriTune Facts</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Transform your Spotify playlists into personalized nutrition labels that reveal the hidden ingredients of your musical taste.
                    </p>
                </div>
                
                <div className="mb-12 mx-auto max-w-lg">
                    <article className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-12 h-12 bg-[#1DB954] rounded-lg flex items-center justify-center mb-6 mx-auto">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Discover</h3>
                        <ul className="space-y-3 text-gray-600" role="list">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-[#1DB954] mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Total track count and playlist duration</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-[#1DB954] mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Your most featured artist and genre</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-[#1DB954] mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Average song length and analysis</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-[#1DB954] mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Downloadable nutrition facts label</span>
                            </li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>
    )
}