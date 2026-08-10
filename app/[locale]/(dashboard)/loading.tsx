export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-64 bg-[#1A1A1A] rounded-lg mb-2 border border-white/5"></div>
          <div className="h-4 w-96 bg-[#1A1A1A] rounded-lg border border-white/5"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#101010] p-6 rounded-2xl border border-white/5 h-32">
            <div className="h-4 w-24 bg-[#1A1A1A] rounded mb-4"></div>
            <div className="h-8 w-32 bg-[#1A1A1A] rounded mb-2"></div>
            <div className="h-3 w-48 bg-[#1A1A1A] rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-[#101010] p-6 rounded-2xl border border-white/5 h-96">
          <div className="h-6 w-48 bg-[#1A1A1A] rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 bg-[#1A1A1A] rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 bg-[#1A1A1A] rounded"></div>
                  <div className="h-3 w-1/2 bg-[#1A1A1A] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#101010] p-6 rounded-2xl border border-white/5 h-96">
          <div className="h-6 w-48 bg-[#1A1A1A] rounded mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-[#1A1A1A] rounded"></div>
                  <div className="h-4 w-16 bg-[#1A1A1A] rounded"></div>
                </div>
                <div className="h-2 w-full bg-[#1A1A1A] rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
