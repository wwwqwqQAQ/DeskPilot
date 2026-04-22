export function getFileType(fileName) {
  const lower = String(fileName || "").toLowerCase();

  if (lower.endsWith(".pdf")) return "PDF";

  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".heic")
  ) {
    return "图片";
  }

  if (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".pages") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    return "文档";
  }

  if (
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".csv")
  ) {
    return "表格";
  }

  if (
    lower.endsWith(".zip") ||
    lower.endsWith(".rar") ||
    lower.endsWith(".7z") ||
    lower.endsWith(".tar") ||
    lower.endsWith(".gz")
  ) {
    return "压缩包";
  }

  if (
    lower.endsWith(".js") ||
    lower.endsWith(".jsx") ||
    lower.endsWith(".ts") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".py") ||
    lower.endsWith(".java") ||
    lower.endsWith(".cpp") ||
    lower.endsWith(".c") ||
    lower.endsWith(".rs")
  ) {
    return "代码";
  }

  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".m4v") ||
    lower.endsWith(".mp3") ||
    lower.endsWith(".wav")
  ) {
    return "音视频";
  }

  return "其他";
}
