
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-200">
      <div className="flex flex-col items-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary" aria-label="Loading" />
        <p className="text-base-content/70">Loading…</p>
      </div>
    </div>
  );
}