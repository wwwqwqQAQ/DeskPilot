const navItems = [
  { key: "overview", label: "总览", icon: "📊" },
  { key: "tasks", label: "任务", icon: "✓" },
  { key: "files", label: "文件", icon: "📁" },
  { key: "settings", label: "设置", icon: "⚙️" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 bg-gradient-to-b from-slate-900/20 to-slate-900/10 rounded-3xl p-6 border border-white/10 backdrop-blur-xl -webkit-backdrop-filter-blur-xl animate-slideInLeft">
        <div className="mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DeskPilot
          </div>
          <p className="text-white/60 text-sm mt-1">专注 • 整理 • 复盘</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item, idx) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                page === item.key
                  ? "bg-blue-500/30 border border-blue-400/50 text-blue-100 shadow-lg backdrop-blur-lg -webkit-backdrop-filter-blur-lg"
                  : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-white/20"
              }`}
              style={{
                animation: `slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.1}s both`,
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="text-xs text-white/40 text-center">v1.0 · Made with ❤️</p>
        </div>
      </aside>

      <div className="md:hidden mb-4 flex gap-2 bg-white/5 rounded-2xl p-2 border border-white/10 backdrop-blur-lg -webkit-backdrop-filter-blur-lg">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
              page === item.key
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            <div className="text-sm">{item.icon}</div>
            <div>{item.label}</div>
          </button>
        ))}
      </div>
    </>
  );
}
