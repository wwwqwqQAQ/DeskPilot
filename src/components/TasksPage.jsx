export default function TasksPage({
  filteredTasks,
  selectedTask,
  newTaskName,
  setNewTaskName,
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  setSelectedTaskId,
  addTask,
  deleteTask,
  startFocus,
  pauseFocus,
  resumeFocus,
  endFocus,
  noteInput,
  setNoteInput,
  addNote,
  reviewInput,
  setReviewInput,
  saveReview,
  isCountdownMode,
  setIsCountdownMode,
  countdownMinutes,
  setCountdownMinutes,
}) {
  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatElapsedTime = (seconds) => {
    if (!seconds) return "0秒";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    } else if (mins > 0) {
      return `${mins}分钟${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="animate-slideInUp">
        <h2 className="text-3xl font-bold mb-2">任务</h2>
        <p className="text-white/60">管理任务、专注、记录与复盘</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-1 animate-slideInLeft">
          <h3 className="text-2xl font-semibold mb-4">任务中心</h3>

          <div className="flex gap-3 mb-3">
            <input
              type="text"
              placeholder="输入新任务名称"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="flex-1 p-3 rounded-xl text-slate-900"
            />
            <button
              onClick={addTask}
              className="btn-base btn-primary"
            >
              新建
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              placeholder="搜索任务"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full p-3 rounded-xl text-white bg-white/10 border border-white/20"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 rounded-xl text-white bg-white/10 border border-white/20"
            >
              <option value="全部">全部状态</option>
              <option value="未开始">未开始</option>
              <option value="专注中">专注中</option>
              <option value="已暂停">已暂停</option>
              <option value="已扫描">已扫描</option>
              <option value="已整理">已整理</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-white/60">没有符合条件的任务。</p>
            ) : (
              filteredTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="task-item"
                  style={{
                    animation: `scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.05}s both`,
                  }}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{task.name}</div>
                      <div className="text-sm mt-1 text-white/60">
                        状态：{task.status || "未开始"}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="bg-red-500/20 hover:bg-red-500/40 text-sm px-3 py-1 rounded-lg border border-red-500/30 text-red-300 transition-all"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {!selectedTask ? (
            <div className="card text-center py-12 animate-scaleIn">
              <div className="text-5xl mb-4 animate-float">📋</div>
              <p className="text-white/60">请先在左侧创建并选择一个任务</p>
            </div>
          ) : (
            <>
              <div className="card animate-slideInUp">
                <h3 className="text-2xl font-semibold mb-4">
                  当前任务：{selectedTask.name}
                </h3>

                <div className="flex flex-wrap gap-4 mb-6">
                  <button
                    onClick={startFocus}
                    className="btn-base btn-primary"
                  >
                    ▶️ 开始专注
                  </button>

                  <button
                    onClick={pauseFocus}
                    className="btn-base btn-secondary"
                  >
                    ⏸️ 暂停
                  </button>

                  <button
                    onClick={resumeFocus}
                    className="btn-base btn-success"
                  >
                    ▶️ 继续
                  </button>

                  <button
                    onClick={endFocus}
                    className="btn-base btn-danger"
                  >
                    ⏹️ 结束并扫描
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCountdownMode}
                        onChange={(e) => setIsCountdownMode(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">倒计时模式</span>
                    </label>
                  </div>

                  {isCountdownMode && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">专注时长：</span>
                      <select
                        value={countdownMinutes}
                        onChange={(e) => setCountdownMinutes(Number(e.target.value))}
                        className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                        disabled={selectedTask?.running}
                      >
                        <option value={5}>5分钟</option>
                        <option value={15}>15分钟</option>
                        <option value={25}>25分钟</option>
                        <option value={45}>45分钟</option>
                        <option value={60}>60分钟</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-white/80">
                    当前状态：
                    <span className="ml-2 font-semibold text-blue-300">{selectedTask.status || "未开始"}</span>
                  </div>

                  <div className="text-white/70 text-sm">
                    已专注：<span className="font-mono text-emerald-300">{formatElapsedTime(selectedTask.elapsedSeconds || 0)}</span>
                  </div>

                  {isCountdownMode && selectedTask.remainingSeconds !== undefined && (
                    <div className="text-white/70 text-sm">
                      剩余时间：<span className="font-mono text-amber-300">{formatTime(selectedTask.remainingSeconds)}</span>
                    </div>
                  )}

                  <div className="text-white/70 text-sm">
                    开始时间：
                    <span className="ml-2 font-mono text-amber-300">
                      {selectedTask.startTimestamp ? new Date(selectedTask.startTimestamp * 1000).toLocaleTimeString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card animate-slideInUp" style={{ animationDelay: "0.1s" }}>
                <h3 className="text-2xl font-semibold mb-4">📝 快速记录</h3>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="记录当前任务中的临时想法"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 p-3 rounded-xl text-slate-900"
                  />
                  <button
                    onClick={addNote}
                    className="btn-base btn-success"
                  >
                    添加记录
                  </button>
                </div>

                {(selectedTask.currentSessionNotes || []).length === 0 ? (
                  <p className="text-white/60">当前这次专注还没有记录。</p>
                ) : (
                  <ul className="space-y-3">
                    {(selectedTask.currentSessionNotes || []).map((item, index) => (
                      <li
                        key={index}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                        style={{
                          animation: `scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`,
                        }}
                      >
                        <div className="font-medium">{item.text}</div>
                        <div className="text-sm text-white/50 mt-1">{item.time}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card animate-slideInUp" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-2xl font-semibold mb-4">💡 任务复盘</h3>

                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="写下这项任务目前的进展、问题、下次要接着做什么……"
                  className="w-full min-h-[140px] p-4 rounded-xl text-slate-900 mb-4 bg-white/95 hover:bg-white transition-colors"
                />

                <button
                  onClick={saveReview}
                  className="btn-base btn-primary w-full"
                >
                  💾 保存复盘
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
