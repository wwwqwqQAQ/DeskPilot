export default function FilesPage({
  selectedTask,
  selectedType,
  setSelectedType,
  allTypes,
  organizeFiles,
  undoOrganizeFiles,
  scanLoading,
  classifiedFiles,
  fileTypeStats,
  filteredFiles,
}) {
  const getFileIcon = (type) => {
    const icons = {
      "PDF": "📄",
      "图片": "🖼️",
      "文档": "📝",
      "表格": "📊",
      "压缩包": "📦",
      "代码": "💻",
      "音视频": "🎬",
      "其他": "📋",
    };
    return icons[type] || "📋";
  };

  return (
    <div className="page-container">
      <div className="mb-8 animate-slideInUp">
        <h2 className="page-title mb-2">文件整理</h2>
        <p className="text-white/60">查看当前任务文件并进行整理</p>
      </div>

      {!selectedTask ? (
        <div className="card text-center py-12 animate-scaleIn">
          <div className="text-5xl mb-4 animate-float">📁</div>
          <p className="text-white/60 mb-4">请先到任务页选择一个任务</p>
          <p className="text-white/40 text-sm">然后就可以查看和整理文件了</p>
        </div>
      ) : (
        <>
          {selectedTask.lastOrganizeSummary && (
            <div className="card bg-gradient-to-br from-emerald-500/10 to-slate-800/50 border-emerald-500/30 animate-slideInUp">
              <div className="flex items-start gap-4">
                <div className="text-4xl animate-float">✅</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-emerald-300">上次整理成功</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">成功移动</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {selectedTask.lastOrganizeSummary.moved_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">失败</p>
                      <p className="text-2xl font-bold text-red-400">
                        {selectedTask.lastOrganizeSummary.failed_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">目标</p>
                      <p className="text-sm text-white/80 truncate">
                        {selectedTask.lastOrganizeSummary.target_root.split("/").pop()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card animate-slideInUp" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="section-title mb-1">📂 {selectedTask.name}</h3>
                <p className="text-white/60 text-sm">
                  共 {classifiedFiles.length} 个文件
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-lg -webkit-backdrop-filter-blur-lg hover:bg-white/15 transition-colors"
                >
                  {allTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <button
                  onClick={organizeFiles}
                  className="btn-base btn-success"
                >
                  🎯 一键整理
                </button>

                {selectedTask.lastOrganizeSummary && (
                  <button
                    onClick={undoOrganizeFiles}
                    className="btn-base btn-secondary"
                  >
                    ↶ 撤销整理
                  </button>
                )}
              </div>
            </div>

            {scanLoading && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-lg -webkit-backdrop-filter-blur-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl animate-spin">⚙️</div>
                  <div>
                    <p className="font-medium text-blue-300">正在扫描文件</p>
                    <p className="text-sm text-white/60">这可能需要几秒钟...</p>
                  </div>
                </div>
              </div>
            )}

            {classifiedFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(fileTypeStats).map(([type, count], idx) => (
                  <div
                    key={type}
                    className="stat-card"
                    style={{
                      animation: `scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.08}s both`,
                    }}
                  >
                    <div className="text-2xl mb-2">{getFileIcon(type)}</div>
                    <div className="text-sm text-white/60">{type}</div>
                    <div className="text-2xl font-bold mt-2 text-blue-400">{count}</div>
                  </div>
                ))}
              </div>
            )}

            {filteredFiles.length === 0 ? (
              <div className="py-8 text-center animate-fadeIn">
                <div className="text-4xl mb-3 animate-float">📭</div>
                <p className="text-white/60">当前没有符合条件的文件</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    className="task-item group"
                    style={{
                      animation: `scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <span className="font-medium truncate group-hover:text-blue-300">
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-6">
                          <span className="badge badge-secondary">{file.type}</span>
                          <span className="text-xs text-white/50">📂 {file.folder}</span>
                        </div>
                        <div className="text-xs text-white/40 truncate ml-6 mt-1">
                          {file.path}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
