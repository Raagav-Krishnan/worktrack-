export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-soft-indigo/20 border-t-soft-indigo rounded-full animate-spin" />
    </div>
  );
}
