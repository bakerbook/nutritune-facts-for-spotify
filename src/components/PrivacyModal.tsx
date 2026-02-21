interface PrivacyModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-[#111] border border-white/[0.08] max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-white font-bold text-base">Privacy Policy</h2>
                    <button
                        onClick={onClose}
                        className="text-[#555] hover:text-white transition-colors duration-150"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-[#444] text-xs uppercase tracking-widest">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-[#999] text-sm leading-relaxed">
                        We don't collect your data in any way. Your Spotify playlist information is only used
                        to display the nutrition facts visualization and is not stored or retained by us.
                    </p>
                    <p className="text-[#999] text-sm leading-relaxed">
                        Questions? Contact{' '}
                        <span className="text-[#1DB954]">bakerbook@ucla.edu</span>
                    </p>
                </div>

                <div className="flex justify-end px-6 py-4 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="text-sm font-bold text-black bg-[#1DB954] hover:bg-[#1ed760] px-5 py-2 transition-colors duration-150"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
