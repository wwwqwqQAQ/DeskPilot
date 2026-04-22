export default function SettingsPage({
  defaultFocusMinutes,
  setDefaultFocusMinutes,
  enableToast,
  setEnableToast,
  isCountdownMode,
  setIsCountdownMode,
  clearAllHistory,
  exportData,
  importData
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="animate-slideInUp">
        <h2 className="text-3xl font-bold mb-2">⚙️ 设置</h2>
        <p className="text-white/60">一些基本配置与数据管理</p>
      </div>

      <div className="space-y-4">
        <div className="card animate-slideInUp">
          <div className="flex items-start gap-4">
            <div className="text-3xl">ℹ️</div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-2">📂 整理目录说明</div>
              <div className="text-sm text-white/70 leading-relaxed">
                一键整理文件会把文件移动到你的用户目录下的 <code className="bg-white/10 px-2 py-1 rounded text-blue-300">DeskPilot整理</code> 文件夹中。系统会按文件类型自动分类。
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-slideInUp" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">⏱️</div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-3">专注设置</div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium mb-1">默认专注时长</div>
                    <div className="text-sm text-white/60">开始专注时的默认时长设置</div>
                  </div>
                  <select
                    value={defaultFocusMinutes}
                    onChange={(e) => setDefaultFocusMinutes(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                  >
                    <option value={5}>5分钟</option>
                    <option value={15}>15分钟</option>
                    <option value={25}>25分钟</option>
                    <option value={45}>45分钟</option>
                    <option value={60}>60分钟</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium mb-1">倒计时模式</div>
                    <div className="text-sm text-white/60">启用后专注会有倒计时提醒</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCountdownMode}
                      onChange={(e) => setIsCountdownMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>

              <div className="text-xs text-white/50 mt-3">💡 提示：建议采用番茄工作法，25分钟一个周期效率最高。</div>
            </div>
          </div>
        </div>

        <div className="card animate-slideInUp" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔔</div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-3">通知设置</div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium mb-1">启用提醒通知</div>
                  <div className="text-sm text-white/60">任务完成时显示右上角提示</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableToast}
                    onChange={(e) => setEnableToast(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-slideInUp" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">💾</div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-3">数据管理</div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={exportData}
                    className="btn-base btn-secondary flex-1"
                  >
                    📤 导出数据
                  </button>
                  <button
                    onClick={importData}
                    className="btn-base btn-secondary flex-1"
                  >
                    📥 导入数据
                  </button>
                </div>
                <div className="text-xs text-white/50">
                  💡 导出数据可以备份你的任务和设置，导入数据可以恢复之前备份的内容
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-red-500/10 border-red-500/30 animate-slideInUp" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">⚠️</div>
                <h3 className="font-semibold text-lg text-red-300">危险操作</h3>
              </div>
              <p className="text-sm text-white/70 mb-4">
                清空所有历史数据后无法恢复，请谨慎操作。
              </p>
            </div>
            <button
              onClick={clearAllHistory}
              className="btn-base btn-danger whitespace-nowrap ml-4"
            >
              🗑️ 清空数据
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-white/5 text-center py-8 animate-slideInUp" style={{ animationDelay: "0.4s" }}>
        <div className="text-4xl mb-3">🚀</div>
        <h3 className="font-semibold text-lg mb-2">DeskPilot v1.0</h3>
        <p className="text-white/60 text-sm">Made with ❤️ for productivity</p>
        <p className="text-white/40 text-xs mt-4">© 2026 - 保持专注，记录成长</p>
      </div>
    </div>
  );
}
