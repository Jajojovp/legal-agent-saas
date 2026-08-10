export function AdSidebar({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <p className="text-center text-xs text-gray-600 mb-2 uppercase tracking-wider">— Advertisement —</p>
        <div className="w-full min-h-[250px] bg-[#101010] border border-white/5 rounded-xl flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 opacity-20">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-gray-600 text-sm">Ad Placeholder</p>
            <p className="text-gray-700 text-xs mt-1">300x250</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-center text-xs text-gray-600 mb-2 uppercase tracking-wider">— Advertisement —</p>
        <div className="w-full min-h-[600px] bg-[#101010] border border-white/5 rounded-xl flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 opacity-20">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-gray-600 text-sm">Ad Placeholder</p>
            <p className="text-gray-700 text-xs mt-1">160x600</p>
          </div>
        </div>
      </div>
    </div>
  );
}
