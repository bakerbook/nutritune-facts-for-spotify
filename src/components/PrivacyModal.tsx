interface PrivacyModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4 text-gray-700">
                    <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <div className="space-y-4">
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                            <p className="text-sm leading-relaxed">
                                We don't collect your data in any way. Your Spotify playlist information is only used 
                                to display the nutrition facts visualization and is not stored or retained by us.

                                If you have any questions, you can contact me at <span className="text-blue-500">baker@bakerbook.me</span>.
                            </p>
                        </section>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="bg-[#1DB954] hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
