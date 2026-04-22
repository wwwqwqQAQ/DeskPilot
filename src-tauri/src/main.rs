// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};
use std::time::UNIX_EPOCH;

#[derive(Serialize, Clone)]
struct FileInfo {
    name: String,
    path: String,
    folder: String,
}

#[derive(Deserialize)]
struct FileMoveItem {
    name: String,
    path: String,
    #[allow(dead_code)]
    folder: String,
    file_type: String,
}

#[derive(Serialize, Clone)]
struct MovedPair {
    from: String,
    to: String,
    file_type: String,
}

#[derive(Serialize)]
struct MoveResult {
    moved_count: usize,
    failed_count: usize,
    target_root: String,
    moved_items: Vec<MovedPair>,
}

#[derive(Serialize)]
struct UndoResult {
    restored_count: usize,
    failed_count: usize,
}

static LAST_MOVED_FILES: OnceLock<Mutex<Vec<MovedPair>>> = OnceLock::new();

fn moved_store() -> &'static Mutex<Vec<MovedPair>> {
    LAST_MOVED_FILES.get_or_init(|| Mutex::new(Vec::new()))
}

#[tauri::command]
fn scan_common_folders_after(start_timestamp: u64) -> Vec<FileInfo> {
    let mut results: Vec<FileInfo> = Vec::new();

    let home = std::env::var("HOME").unwrap_or_default();
    let desktop = PathBuf::from(format!("{}/Desktop", home));
    let downloads = PathBuf::from(format!("{}/Downloads", home));

    let folders = vec![
        ("桌面".to_string(), desktop),
        ("下载".to_string(), downloads),
    ];

    for (folder_name, folder_path) in folders {
        if let Ok(entries) = fs::read_dir(folder_path) {
            for entry in entries.flatten() {
                let path = entry.path();

                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified_time) = metadata.modified() {
                        if let Ok(duration) = modified_time.duration_since(UNIX_EPOCH) {
                            let modified_timestamp = duration.as_secs();

                            if modified_timestamp >= start_timestamp {
                                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                                    results.push(FileInfo {
                                        name: name.to_string(),
                                        path: path.display().to_string(),
                                        folder: folder_name.clone(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    results
}

#[tauri::command]
fn organize_files(items: Vec<FileMoveItem>) -> MoveResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let target_root = format!("{}/Desktop/Organized", home);
    let mut moved_count = 0;
    let mut failed_count = 0;
    let mut moved_items: Vec<MovedPair> = Vec::new();

    for item in items {
        let file_type = &item.file_type;
        let organized_folder = format!("{}/{}", target_root, file_type);

        if let Err(_) = fs::create_dir_all(&organized_folder) {
            failed_count += 1;
            continue;
        }

        let new_path = format!("{}/{}", organized_folder, item.name);

        match fs::rename(&item.path, &new_path) {
            Ok(_) => {
                moved_count += 1;
                moved_items.push(MovedPair {
                    from: item.path,
                    to: new_path,
                    file_type: file_type.clone(),
                });
            }
            Err(_) => failed_count += 1,
        }
    }

    if let Ok(mut store) = moved_store().lock() {
        *store = moved_items.clone();
    }

    MoveResult {
        moved_count,
        failed_count,
        target_root,
        moved_items,
    }
}

#[tauri::command]
fn undo_last_organize() -> UndoResult {
    let mut restored_count = 0;
    let mut failed_count = 0;

    if let Ok(mut store) = moved_store().lock() {
        let items = store.clone();

        for pair in items.iter().rev() {
            let from_path = PathBuf::from(&pair.to);
            let to_path = PathBuf::from(&pair.from);

            if !from_path.exists() {
                failed_count += 1;
                continue;
            }

            if let Some(parent) = to_path.parent() {
                let _ = fs::create_dir_all(parent);
            }

            match fs::rename(&from_path, &to_path) {
                Ok(_) => restored_count += 1,
                Err(_) => failed_count += 1,
            }
        }

        store.clear();
    }

    UndoResult {
        restored_count,
        failed_count,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            scan_common_folders_after,
            organize_files,
            undo_last_organize
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
