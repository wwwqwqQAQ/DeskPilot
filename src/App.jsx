import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopToast from "./components/TopToast";
import OverviewPage from "./components/OverviewPage";
import TasksPage from "./components/TasksPage";
import FilesPage from "./components/FilesPage";
import SettingsPage from "./components/SettingsPage";
import { getFileType } from "./utils/fileType";

// 延迟导入 Tauri 以确保运行在正确的环境
let invoke = null;
let tauriReady = false;

const initTauri = async () => {
  try {
    const tauriModule = await import("@tauri-apps/api/core");
    invoke = tauriModule.invoke;
    tauriReady = true;
    console.log("✓ Tauri API 初始化成功");
  } catch (error) {
    console.warn("⚠ Tauri API 不可用（开发模式或运行环境问题）:", error);
    tauriReady = false;
  }
};

// 初始化 Tauri
initTauri();

const STORAGE_KEY = "deskpilot_pages_refactor_v2";

function App() {
  const getInitialStorageData = () => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (error) {
      console.error("读取本地数据失败：", error);
      return {};
    }
  };

  const initialStorageData = useMemo(() => getInitialStorageData(), []);

  const [page, setPage] = useState(initialStorageData.page || "overview");
  const [tasks, setTasks] = useState(initialStorageData.tasks || []);
  const [selectedTaskId, setSelectedTaskId] = useState(
    initialStorageData.selectedTaskId || null
  );

  const [newTaskName, setNewTaskName] = useState("");
  const [searchText, setSearchText] = useState(
    initialStorageData.searchText || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    initialStorageData.statusFilter || "全部"
  );
  const [selectedType, setSelectedType] = useState(
    initialStorageData.selectedType || "全部"
  );

  const [noteInput, setNoteInput] = useState("");
  const [reviewInput, setReviewInput] = useState("");

  const [scanLoading, setScanLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [defaultFocusMinutes, setDefaultFocusMinutes] = useState(
    initialStorageData.defaultFocusMinutes || 25
  );
  const [enableToast, setEnableToast] = useState(
    typeof initialStorageData.enableToast === "boolean"
      ? initialStorageData.enableToast
      : true
  );
  const [isCountdownMode, setIsCountdownMode] = useState(
    typeof initialStorageData.isCountdownMode === "boolean"
      ? initialStorageData.isCountdownMode
      : true
  );
  const [countdownMinutes, setCountdownMinutes] = useState(
    initialStorageData.countdownMinutes || defaultFocusMinutes
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const handleSelectTask = (taskId) => {
    setSelectedTaskId(taskId);
    const task = tasks.find((t) => t.id === taskId);
    setReviewInput(task?.review || "");
  };

  const showToast = (msg) => {
    if (enableToast) {
      setToast(msg);
    }
  };

  const endFocus = async () => {
    if (!selectedTask) {
      alert("请先选择一个任务");
      return;
    }

    if (!selectedTask.running) {
      alert("这个任务当前没有在专注");
      return;
    }

    try {
      setScanLoading(true);

      if (!invoke || !tauriReady) {
        console.error("Tauri API 不可用");
        throw new Error("后端服务未连接，请确保通过 Tauri 窗口打开应用");
      }

      const scannedFiles = await invoke("scan_common_folders_after", {
        startTimestamp: selectedTask.startTimestamp || 0,
      });

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== selectedTask.id) return task;

          const updatedSessions = [...(task.sessions || [])];
          if (updatedSessions.length > 0) {
            updatedSessions[0].endTime = new Date().toLocaleString();
            updatedSessions[0].notes = [...(task.currentSessionNotes || [])];
            updatedSessions[0].durationSeconds = task.elapsedSeconds || 0;
          }

          return {
            ...task,
            running: false,
            paused: false,
            status: "已扫描",
            files: scannedFiles,
            sessions: updatedSessions,
          };
        })
      );

      setPage("files");
      showToast("专注结束，已扫描文件");
    } catch (error) {
      console.error("结束专注时报错：", error);
      alert("结束专注并扫描文件失败：" + error.message);
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => {
    // 检查 Tauri 是否已正确初始化
    if (!tauriReady) {
      console.warn("⚠ 应用运行在非 Tauri 环境中。请通过运行 'npx tauri dev' 来启动桌面应用");
      if (enableToast) {
        setTimeout(() => setToast("⚠ 后端服务未连接，某些功能不可用"), 100);
      }
    }
  }, [enableToast]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tasks,
        selectedTaskId,
        page,
        searchText,
        statusFilter,
        selectedType,
        defaultFocusMinutes,
        enableToast,
        isCountdownMode,
        countdownMinutes,
      })
    );
  }, [
    tasks,
    selectedTaskId,
    page,
    searchText,
    statusFilter,
    selectedType,
    defaultFocusMinutes,
    enableToast,
  ]);

  useEffect(() => {
    if (!enableToast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast, enableToast]);

  // 自动结束倒计时专注
  useEffect(() => {
    const runningTask = tasks.find(t => t.running && !t.paused && t.remainingSeconds === 0);
    if (runningTask && isCountdownMode) {
      // 使用 setTimeout 避免在 useEffect 中同步调用 setState
      setTimeout(() => {
        endFocus();
        if (enableToast) {
          setToast("🎉 专注时间到！任务已自动结束");
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, isCountdownMode, enableToast]);

  useEffect(() => {
    const hasRunning = tasks.some((t) => t.running && !t.paused);

    if (hasRunning) {
      const timer = setInterval(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.running && !task.paused
              ? {
                  ...task,
                  elapsedSeconds: (task.elapsedSeconds || 0) + 1,
                  remainingSeconds: isCountdownMode
                    ? Math.max(0, (task.remainingSeconds || countdownMinutes * 60) - 1)
                    : task.remainingSeconds
                }
              : task
          )
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tasks, isCountdownMode, countdownMinutes]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchText = task.name
        .toLowerCase()
        .includes(searchText.toLowerCase().trim());
      const matchStatus =
        statusFilter === "全部" || (task.status || "未开始") === statusFilter;
      return matchText && matchStatus;
    });
  }, [tasks, searchText, statusFilter]);

  const classifiedFiles = useMemo(() => {
    if (!selectedTask) return [];
    return (selectedTask.files || []).map((file) => ({
      ...file,
      type: getFileType(file.name),
    }));
  }, [selectedTask]);

  const filteredFiles = useMemo(() => {
    if (selectedType === "全部") return classifiedFiles;
    return classifiedFiles.filter((file) => file.type === selectedType);
  }, [classifiedFiles, selectedType]);

  const fileTypeStats = useMemo(() => {
    const stats = {};
    for (const file of classifiedFiles) {
      stats[file.type] = (stats[file.type] || 0) + 1;
    }
    return stats;
  }, [classifiedFiles]);

  const allTypes = ["全部", ...Object.keys(fileTypeStats)];

  const summary = useMemo(() => {
    let running = 0;
    let paused = 0;
    let organized = 0;
    let totalSeconds = 0;

    for (const task of tasks) {
      if (task.running && !task.paused) running += 1;
      if (task.paused) paused += 1;
      if ((task.lastOrganizeSummary?.moved_count || 0) > 0) organized += 1;
      totalSeconds += task.elapsedSeconds || 0;
    }

    return {
      total: tasks.length,
      running,
      paused,
      organized,
      totalSeconds,
    };
  }, [tasks]);

  const addTask = () => {
    if (!newTaskName.trim()) {
      alert("请输入任务名称");
      return;
    }

    const task = {
      id: Date.now(),
      name: newTaskName,
      status: "未开始",
      running: false,
      paused: false,
      startTimestamp: null,
      elapsedSeconds: 0,
      currentSessionNotes: [],
      files: [],
      sessions: [],
      lastOrganizeSummary: null,
      review: "",
    };

    setTasks((prev) => [task, ...prev]);
    setSelectedTaskId(task.id);
    setReviewInput("");
    setNewTaskName("");
    setPage("tasks");
    showToast("任务已创建");
  };

  const deleteTask = (taskId) => {
    if (!confirm("确定要删除这个任务吗？")) return;

    const next = tasks.filter((t) => t.id !== taskId);
    setTasks(next);

    if (selectedTaskId === taskId) {
      const nextId = next.length > 0 ? next[0].id : null;
      setSelectedTaskId(nextId);
      setReviewInput(nextId ? next.find((t) => t.id === nextId)?.review || "" : "");
    }

    showToast("任务已删除");
  };

  const startFocus = () => {
    if (!selectedTask) {
      alert("请先选择一个任务");
      return;
    }

    if (selectedTask.running && !selectedTask.paused) {
      alert("这个任务已经在专注中");
      return;
    }

    const now = Math.floor(Date.now() / 1000);

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTask.id) return task;

        if (task.paused) {
          return {
            ...task,
            paused: false,
            running: true,
            status: "专注中",
          };
        }

        return {
          ...task,
          running: true,
          paused: false,
          status: "专注中",
          startTimestamp: now,
          currentSessionNotes: [],
          files: [],
          remainingSeconds: isCountdownMode ? countdownMinutes * 60 : undefined,
          sessions: [
            {
              id: Date.now(),
              startTime: new Date().toLocaleString(),
              endTime: null,
              notes: [],
              durationSeconds: 0,
            },
            ...(task.sessions || []),
          ],
        };
      })
    );

    showToast("已开始专注");
  };

  const pauseFocus = () => {
    if (!selectedTask || !selectedTask.running) {
      alert("当前没有正在进行的专注");
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id
          ? { ...task, paused: true, status: "已暂停" }
          : task
      )
    );

    showToast("专注已暂停");
  };

  const resumeFocus = () => {
    if (!selectedTask || !selectedTask.paused) {
      alert("当前任务没有处于暂停状态");
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id
          ? { ...task, paused: false, running: true, status: "专注中" }
          : task
      )
    );

    showToast("已继续专注");
  };

  const addNote = () => {
    if (!selectedTask) {
      alert("请先选择一个任务");
      return;
    }

    if (!selectedTask.running || selectedTask.paused) {
      alert("请先开始专注或继续专注");
      return;
    }

    if (!noteInput.trim()) {
      alert("请先输入记录内容");
      return;
    }

    const note = {
      text: noteInput,
      time: new Date().toLocaleTimeString(),
    };

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              currentSessionNotes: [note, ...(task.currentSessionNotes || [])],
            }
          : task
      )
    );

    setNoteInput("");
    showToast("记录已添加");
  };

  const organizeFiles = async () => {
    if (!selectedTask) {
      alert("请先选择一个任务");
      return;
    }

    if (classifiedFiles.length === 0) {
      alert("当前任务没有可以整理的文件");
      return;
    }

    try {
      if (!invoke || !tauriReady) {
        throw new Error("后端服务未连接，请确保通过 Tauri 窗口打开应用");
      }

      const payload = classifiedFiles.map((file) => ({
        name: file.name,
        path: file.path,
        folder: file.folder,
        file_type: file.type,
      }));

      const result = await invoke("organize_files", {
        items: payload,
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                status: "已整理",
                lastOrganizeSummary: result,
                files: [],
              }
            : task
        )
      );

      setSelectedType("全部");
      showToast("文件已整理");
    } catch (error) {
      console.error("整理文件时报错：", error);
      alert("整理文件失败：" + error.message);
    }
  };

  const undoOrganizeFiles = async () => {
    if (!selectedTask) {
      alert("请先选择一个任务");
      return;
    }

    if (!selectedTask.lastOrganizeSummary) {
      alert("当前任务没有整理记录可以撤销");
      return;
    }

    try {
      if (!invoke || !tauriReady) {
        throw new Error("后端服务未连接，请确保通过 Tauri 窗口打开应用");
      }

      const result = await invoke("undo_last_organize");

      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                status: "已扫描",
                lastOrganizeSummary: null,
                files: selectedTask.files, // 恢复文件列表
              }
            : task
        )
      );

      showToast(`已撤销整理，恢复了 ${result.restored_count} 个文件`);
    } catch (error) {
      console.error("撤销整理时报错：", error);
      alert("撤销整理失败：" + error.message);
    }
  };

  const saveReview = () => {
    if (!selectedTask) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id ? { ...task, review: reviewInput } : task
      )
    );

    showToast("复盘已保存");
  };

  const clearAllHistory = () => {
    if (!confirm("确定要清空所有任务和历史记录吗？")) return;

    setTasks([]);
    setSelectedTaskId(null);
    setNewTaskName("");
    setSearchText("");
    setStatusFilter("全部");
    setSelectedType("全部");
    setNoteInput("");
    setReviewInput("");
    localStorage.removeItem(STORAGE_KEY);
    showToast("已清空全部历史");
  };

  const exportData = () => {
    const data = {
      tasks,
      selectedTaskId,
      page,
      searchText,
      statusFilter,
      selectedType,
      defaultFocusMinutes,
      enableToast,
      isCountdownMode,
      countdownMinutes,
      exportTime: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deskpilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("数据已导出");
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // 验证数据格式
          if (!data.version || !Array.isArray(data.tasks)) {
            throw new Error("无效的数据格式");
          }

          // 恢复数据
          setTasks(data.tasks || []);
          setSelectedTaskId(data.selectedTaskId || null);
          setPage(data.page || "overview");
          setSearchText(data.searchText || "");
          setStatusFilter(data.statusFilter || "全部");
          setSelectedType(data.selectedType || "全部");
          setDefaultFocusMinutes(data.defaultFocusMinutes || 25);
          setEnableToast(typeof data.enableToast === "boolean" ? data.enableToast : true);
          setIsCountdownMode(typeof data.isCountdownMode === "boolean" ? data.isCountdownMode : true);
          setCountdownMinutes(data.countdownMinutes || data.defaultFocusMinutes || 25);

          showToast("数据已导入");
        } catch (error) {
          console.error("导入数据失败：", error);
          alert("导入数据失败，请检查文件格式是否正确");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <TopToast toast={toast} />

      <div className="max-w-8xl mx-auto flex gap-6 p-6 md:p-8">
        <Sidebar page={page} setPage={setPage} />

        <main className="flex-1 min-w-0">
          <div className="animate-in fade-in duration-300">
            {page === "overview" && (
              <OverviewPage
                tasks={tasks}
                summary={summary}
                setSelectedTaskId={handleSelectTask}
                setPage={setPage}
              />
            )}

            {page === "tasks" && (
              <TasksPage
                filteredTasks={filteredTasks}
                selectedTask={selectedTask}
                newTaskName={newTaskName}
                setNewTaskName={setNewTaskName}
                searchText={searchText}
                setSearchText={setSearchText}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                setSelectedTaskId={handleSelectTask}
                addTask={addTask}
                deleteTask={deleteTask}
                startFocus={startFocus}
                pauseFocus={pauseFocus}
                resumeFocus={resumeFocus}
                endFocus={endFocus}
                noteInput={noteInput}
                setNoteInput={setNoteInput}
                addNote={addNote}
                reviewInput={reviewInput}
                setReviewInput={setReviewInput}
                saveReview={saveReview}
                isCountdownMode={isCountdownMode}
                setIsCountdownMode={setIsCountdownMode}
                countdownMinutes={countdownMinutes}
                setCountdownMinutes={setCountdownMinutes}
              />
            )}

            {page === "files" && (
              <FilesPage
                selectedTask={selectedTask}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                allTypes={allTypes}
                organizeFiles={organizeFiles}
                undoOrganizeFiles={undoOrganizeFiles}
                scanLoading={scanLoading}
                classifiedFiles={classifiedFiles}
                fileTypeStats={fileTypeStats}
                filteredFiles={filteredFiles}
              />
            )}

            {page === "settings" && (
              <SettingsPage
                defaultFocusMinutes={defaultFocusMinutes}
                setDefaultFocusMinutes={setDefaultFocusMinutes}
                enableToast={enableToast}
                setEnableToast={setEnableToast}
                isCountdownMode={isCountdownMode}
                setIsCountdownMode={setIsCountdownMode}
                clearAllHistory={clearAllHistory}
                exportData={exportData}
                importData={importData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
