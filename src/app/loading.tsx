export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-blue-400 mt-4">جاري التحميل...</h2>
        <p className="text-gray-400 text-center max-w-md">
          يتم تحميل المحتوى، يرجى الانتظار لحظة.
        </p>
      </div>
    </div>
  );
} 