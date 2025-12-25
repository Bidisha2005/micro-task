export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 spinner"></div>
                <p className="text-slate-500">Loading...</p>
            </div>
        </div>
    );
}
