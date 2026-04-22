export default function TopToast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideInDown">
      <div className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 border border-green-400/50 shadow-2xl rounded-2xl px-5 py-3 text-sm font-medium text-white backdrop-blur-xl -webkit-backdrop-filter-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-lg animate-bounce-soft">✓</span>
          <span>{toast}</span>
        </div>
      </div>
    </div>
  );
}
